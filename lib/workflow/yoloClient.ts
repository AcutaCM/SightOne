// YOLO Detection Client
// 前端与后端YOLO检测服务通信的客户端

export interface YOLODetection {
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  class_id: number;
  class: string;
  confidence: number;
}

export interface YOLODetectionResult {
  detections: YOLODetection[];
  count: number;
  model_id: string;
  confidence_threshold: number;
  iou_threshold: number;
  annotated_image?: string; // base64 encoded image
}

export interface YOLOModelInfo {
  id: string;
  name: string;
  description: string;
  type: 'builtin' | 'custom';
  tags: string[];
  num_classes: number;
  file_size: number | string;
  format: string;
  downloaded: boolean;
}

export interface YOLODetectionParams {
  imageSource: 'camera' | 'upload' | 'variable';
  imageData?: string; // base64 encoded image
  modelId: string;
  confidence: number;
  iouThreshold: number;
  classes?: string; // comma-separated class names
  drawResults: boolean;
}

class YOLOClient {
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private requestId = 0;
  private pendingRequests: Map<number, {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();

  constructor(wsUrl: string = 'ws://localhost:3002') {
    this.wsUrl = wsUrl;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('✅ YOLO客户端WebSocket连接成功');
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('❌ YOLO客户端WebSocket错误:', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ 解析WebSocket消息失败:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('📴 YOLO客户端WebSocket连接关闭');
          this.ws = null;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    // 清理所有待处理的请求
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('WebSocket连接已关闭'));
    });
    this.pendingRequests.clear();
  }

  private handleMessage(message: any): void {
    const { type, data, request_id } = message;

    // 处理请求响应
    if (request_id !== undefined && this.pendingRequests.has(request_id)) {
      const { resolve, reject, timeout } = this.pendingRequests.get(request_id)!;
      clearTimeout(timeout);
      this.pendingRequests.delete(request_id);

      if (type === 'error') {
        reject(new Error(data.message || '未知错误'));
      } else {
        resolve(data);
      }
      return;
    }

    // 处理广播消息
    const handler = this.messageHandlers.get(type);
    if (handler) {
      handler(data);
    }
  }

  private sendRequest(type: string, data: any, timeout: number = 30000): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket未连接'));
        return;
      }

      const requestId = this.requestId++;
      const message = {
        type,
        data,
        request_id: requestId
      };

      // 设置超时
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('请求超时'));
      }, timeout);

      // 保存请求
      this.pendingRequests.set(requestId, { resolve, reject, timeout: timeoutHandle });

      // 发送消息
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        clearTimeout(timeoutHandle);
        this.pendingRequests.delete(requestId);
        reject(error);
      }
    });
  }

  on(eventType: string, handler: (data: any) => void): void {
    this.messageHandlers.set(eventType, handler);
  }

  off(eventType: string): void {
    this.messageHandlers.delete(eventType);
  }

  // ==================== YOLO检测API ====================

  /**
   * 执行YOLO检测
   */
  async detect(params: YOLODetectionParams): Promise<YOLODetectionResult> {
    // 解析类别过滤
    let classIds: number[] | undefined;
    if (params.classes && params.classes.trim()) {
      // 这里简化处理，实际应该从模型类别映射中获取ID
      // 暂时传递类别名称字符串，由后端处理
    }

    const requestData = {
      image_source: params.imageSource,
      image_data: params.imageData,
      model_id: params.modelId,
      confidence: params.confidence,
      iou_threshold: params.iouThreshold,
      classes: params.classes,
      draw_results: params.drawResults
    };

    return this.sendRequest('yolo_detect', requestData, 60000); // 60秒超时
  }

  /**
   * 获取可用模型列表
   */
  async listModels(includeBuiltin: boolean = true): Promise<YOLOModelInfo[]> {
    return this.sendRequest('yolo_list_models', { include_builtin: includeBuiltin });
  }

  /**
   * 获取模型详细信息
   */
  async getModelInfo(modelId: string): Promise<YOLOModelInfo> {
    return this.sendRequest('yolo_get_model_info', { model_id: modelId });
  }

  /**
   * 下载内置模型
   */
  async downloadBuiltinModel(modelId: string): Promise<{ success: boolean; message: string }> {
    return this.sendRequest('yolo_download_model', { model_id: modelId }, 300000); // 5分钟超时
  }

  /**
   * 上传自定义模型
   */
  async uploadModel(
    modelFile: File,
    modelName: string,
    description: string = '',
    tags: string[] = []
  ): Promise<{ success: boolean; message: string; model_id?: string }> {
    // 读取文件为base64
    const fileData = await this.fileToBase64(modelFile);

    return this.sendRequest('yolo_upload_model', {
      file_data: fileData,
      file_name: modelFile.name,
      model_name: modelName,
      description,
      tags
    }, 120000); // 2分钟超时
  }

  /**
   * 删除模型
   */
  async deleteModel(modelId: string): Promise<{ success: boolean; message: string }> {
    return this.sendRequest('yolo_delete_model', { model_id: modelId });
  }

  /**
   * 获取模型的类别列表
   */
  async getModelClasses(modelId: string): Promise<{ [key: number]: string }> {
    return this.sendRequest('yolo_get_model_classes', { model_id: modelId });
  }

  /**
   * 加载模型到内存
   */
  async loadModel(modelId: string): Promise<{ success: boolean; message: string }> {
    return this.sendRequest('yolo_load_model', { model_id: modelId });
  }

  /**
   * 卸载模型以释放内存
   */
  async unloadModel(modelId: string): Promise<{ success: boolean; message: string }> {
    return this.sendRequest('yolo_unload_model', { model_id: modelId });
  }

  // ==================== 辅助方法 ====================

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除data URL前缀
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// 导出单例实例
export const yoloClient = new YOLOClient();

export default YOLOClient;
