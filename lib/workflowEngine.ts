// 工作流执行引擎
import { getPureChatClient, PureChatClient } from './workflow/pureChatClient';
import { getUniPixelClient, UniPixelClient } from './workflow/uniPixelClient';
import { yoloClient } from './workflow/yoloClient';
import { getChallengeTaskClient, ChallengeTaskClient } from './workflow/challengeTaskClient';
import { getQRScanClient, qrScanClient } from './workflow/qrScanClient';
import { ParallelExecutor, createParallelExecutor } from './workflow/parallelExecutor';
import { ErrorHandler, createErrorHandler, nodeErrorHandlers, ErrorAction } from './workflow/errorHandler';

export interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label: string;
    nodeType: string;
    parameters: Record<string, any>;
  };
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface ExecutionContext {
  variables: Record<string, any>;
  results: Record<string, any>;
  logs: string[];
  currentNode?: string;
  isRunning: boolean;
  shouldStop: boolean;
}

export class WorkflowEngine {
  private context: ExecutionContext;
  private nodes: WorkflowNode[];
  private edges: WorkflowEdge[];
  private onLog?: (message: string) => void;
  private onStateChange?: (context: ExecutionContext) => void;
  private commandSender?: (type: string, data?: any) => Promise<any> | any;
  
  // Service clients
  private pureChatClient: PureChatClient;
  private uniPixelClient: UniPixelClient;
  private challengeTaskClient: ChallengeTaskClient;
  private qrScanClient: typeof qrScanClient;
  private parallelExecutor: ParallelExecutor;
  private errorHandler: ErrorHandler;
  private enableParallelExecution: boolean = false;

  constructor(
    nodes: WorkflowNode[], 
    edges: WorkflowEdge[],
    onLog?: (message: string) => void,
    onStateChange?: (context: ExecutionContext) => void,
    commandSender?: (type: string, data?: any) => Promise<any> | any,
    enableParallel: boolean = false
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.onLog = onLog;
    this.onStateChange = onStateChange;
    this.commandSender = commandSender;
    
    // Initialize service clients
    this.pureChatClient = getPureChatClient();
    this.uniPixelClient = getUniPixelClient();
    this.challengeTaskClient = getChallengeTaskClient();
    this.qrScanClient = getQRScanClient();
    this.parallelExecutor = createParallelExecutor(nodes, edges);
    this.errorHandler = createErrorHandler({
      defaultMaxRetries: 3,
      defaultRetryDelay: 1000,
      enableFallback: true,
      logErrors: true
    });
    this.enableParallelExecution = enableParallel;
    
    this.context = {
      variables: {
        battery: 85,
        altitude: 0,
        speed: 0,
        temperature: 25,
        timestamp: Date.now()
      },
      results: {},
      logs: [],
      isRunning: false,
      shouldStop: false
    };
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    this.context.logs.push(logMessage);
    this.onLog?.(logMessage);
  }

  private updateState() {
    this.onStateChange?.(this.context);
  }

  private async sendCommand(type: string, data?: any): Promise<any> {
    try {
      let sender = this.commandSender as any;
      if (!sender && typeof globalThis !== 'undefined' && (globalThis as any).__droneSendMessage) {
        sender = (globalThis as any).__droneSendMessage;
      }
      if (!sender) {
        this.log(`未配置后端命令发送器: ${type}`);
        return false;
      }
      const res = await sender(type, data);
      return res;
    } catch (e: any) {
      this.log(`发送命令失败: ${type} - ${e?.message || e}`);
      return false;
    }
  }

  async execute(): Promise<void> {
    this.context.isRunning = true;
    this.context.shouldStop = false;
    this.log('开始执行工作流');
    this.updateState();

    try {
      // Check for circular dependencies
      if (this.parallelExecutor.hasCircularDependencies()) {
        throw new Error('工作流包含循环依赖');
      }

      if (this.enableParallelExecution) {
        await this.executeParallel();
      } else {
        const startNode = this.nodes.find(node => 
          node.type === 'start' || node.data?.nodeType === 'start'
        );
        if (!startNode) {
          throw new Error('未找到起始节点');
        }

        await this.executeNode(startNode);
      }
    } catch (error) {
      this.log(`工作流执行错误: ${error}`);
    } finally {
      this.context.isRunning = false;
      this.log('工作流执行完成');
      this.updateState();
    }
  }

  /**
   * Execute workflow with parallel optimization
   */
  private async executeParallel(): Promise<void> {
    this.log('使用并行执行模式');
    
    const levels = this.parallelExecutor.analyzeExecutionLevels();
    const stats = this.parallelExecutor.getExecutionStats();
    
    this.log(`工作流分析: ${stats.totalNodes}个节点, ${stats.levels}个执行层级, 最大并行度: ${stats.maxParallelism}`);

    for (const level of levels) {
      if (this.context.shouldStop) {
        this.log('工作流已停止');
        break;
      }

      this.log(`执行第${level.level + 1}层 (${level.nodes.length}个并行节点)`);

      // Execute all nodes in this level in parallel
      const promises = level.nodes.map(node => this.executeNodeLogicWrapper(node));
      
      try {
        const results = await Promise.all(promises);
        
        // Store results
        results.forEach((result, index) => {
          this.context.results[level.nodes[index].id] = result;
        });
      } catch (error) {
        this.log(`第${level.level + 1}层执行失败: ${error}`);
        throw error;
      }
    }
  }

  /**
   * Wrapper for executing node logic with error handling
   */
  private async executeNodeLogicWrapper(node: WorkflowNode): Promise<any> {
    this.context.currentNode = node.id;
    const nodeType = node.data?.nodeType || node.type;
    this.log(`执行节点: ${node.data.label} (${nodeType})`);
    this.updateState();

    try {
      // Execute with retry logic
      return await this.errorHandler.executeWithRetry(
        node.id,
        () => this.executeNodeLogic(node),
        3,
        1000
      );
    } catch (error) {
      const err = error as Error;
      this.log(`节点执行失败: ${node.data.label} - ${err.message}`);
      
      // Get error action
      const customHandler = nodeErrorHandlers[nodeType];
      const errorAction = customHandler 
        ? customHandler(err)
        : await this.errorHandler.handleError(node.id, nodeType, err);

      // Handle error based on action
      return await this.handleErrorAction(node, err, errorAction);
    }
  }

  /**
   * Handle error action
   */
  private async handleErrorAction(
    node: WorkflowNode,
    error: Error,
    action: ErrorAction
  ): Promise<any> {
    const nodeType = node.data?.nodeType || node.type;

    switch (action.type) {
      case 'retry':
        this.log(`重试节点: ${node.data.label} (最多${action.maxRetries}次)`);
        return await this.errorHandler.executeWithRetry(
          node.id,
          () => this.executeNodeLogic(node),
          action.maxRetries,
          action.delay
        );

      case 'skip':
        this.log(`跳过节点: ${node.data.label}`);
        if (action.continueWorkflow) {
          return { status: 'skipped', reason: error.message };
        } else {
          throw error;
        }

      case 'fallback':
        this.log(`使用降级方案: ${node.data.label}`);
        if (action.fallbackAction) {
          return await action.fallbackAction();
        }
        // Return a default fallback result
        return { status: 'fallback', reason: error.message };

      case 'abort':
        this.log(`中止工作流: ${error.message}`);
        if (action.cleanup) {
          await this.cleanup();
        }
        throw error;

      default:
        throw error;
    }
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    this.log('清理资源...');
    // Add cleanup logic here if needed
    // For example: close connections, release resources, etc.
  }

  stop() {
    this.context.shouldStop = true;
    this.log('收到停止信号');
    this.updateState();
  }

  private async executeNode(node: WorkflowNode): Promise<void> {
    if (this.context.shouldStop) {
      this.log('工作流已停止');
      return;
    }

    this.context.currentNode = node.id;
    const nodeType = node.data?.nodeType || node.type;
    this.log(`执行节点: ${node.data.label} (${nodeType})`);
    this.updateState();

    try {
      const result = await this.executeNodeLogic(node);
      this.context.results[node.id] = result;

      const nextNodes = await this.getNextNodes(node, result);
      
      for (const nextNode of nextNodes) {
        await this.executeNode(nextNode);
      }
    } catch (error) {
      this.log(`节点执行失败: ${node.data.label} - ${error}`);
      throw error;
    }
  }

  private async executeNodeLogic(node: WorkflowNode): Promise<any> {
    const { type, data } = node;
    const params = data.parameters || {};
    const nodeType = data.nodeType || type;

    switch (nodeType) {
      case 'start':
        return { status: 'started', timestamp: Date.now() };
      case 'end':
        this.log('到达结束节点');
        return { status: 'completed', timestamp: Date.now() };

      // PureChat AI节点
      case 'purechat_chat':
        return this.executePureChatChat(params);
      case 'purechat_image_analysis':
        return this.executePureChatImageAnalysis(params);

      // UniPixel分割节点
      case 'unipixel_segmentation':
        return this.executeUniPixelSegmentation(params);

      // YOLO检测节点
      case 'yolo_detection':
        return this.executeYOLODetection(params);

      // 挑战卡任务
      case 'challenge_8_flight':
        return this.executeChallenge8Flight(params);
      case 'challenge_obstacle':
        return this.executeChallengeObstacle(params);
      case 'challenge_precision_land':
        return this.executeChallengePrecisionLand(params);

      // 逻辑判断节点
      case 'condition_branch':
        return this.executeConditionBranch(params);
      case 'if_else':
        return this.executeIfElse(params);
      case 'loop':
        return this.executeLoop(params);

      // 图像处理节点
      case 'take_photo':
        return this.executeTakePhoto(params);
      case 'record_video':
        return this.executeRecordVideo(params);
      case 'image_analysis':
        return this.executeImageAnalysis(params);

      // AI分析节点
      case 'ai_classification':
        return this.executeAIClassification(params);
      case 'ai_detection':
        return this.executeAIDetection(params);
      case 'ai_segmentation':
        return this.executeAISegmentation(params);

      // 数据处理节点
      case 'data_storage':
        return this.executeDataStorage(params);
      case 'data_transform':
        return this.executeDataTransform(params);
      case 'data_filter':
        return this.executeDataFilter(params);

      // 网络通信节点
      case 'http_request':
        return this.executeHttpRequest(params);
      case 'websocket_send':
        return this.executeWebSocketSend(params);
      case 'api_call':
        return this.executeApiCall(params);

      // 基础控制节点
      case 'takeoff':
        return this.executeTakeoffWithBackend(params);
      case 'land':
        return this.executeLandWithBackend(params);
      case 'hover':
        return this.executeHoverWithBackend(params);
      case 'wait':
        return this.executeWait(params);

      // 运动控制
      case 'move_forward':
        return this.executeMove('forward', params);
      case 'move_backward':
        return this.executeMove('back', params);
      case 'move_left':
        return this.executeMove('left', params);
      case 'move_right':
        return this.executeMove('right', params);
      case 'move_up':
        return this.executeMove('up', params);
      case 'move_down':
        return this.executeMove('down', params);

      // 旋转与特技
      case 'rotate_cw':
        return this.executeRotate('cw', params);
      case 'rotate_ccw':
        return this.executeRotate('ccw', params);
      case 'flip_forward':
        return this.executeFlip('f');
      case 'flip_backward':
        return this.executeFlip('b');
      case 'flip_left':
        return this.executeFlip('l');
      case 'flip_right':
        return this.executeFlip('r');

      // 检测与视频
      case 'start_video':
        return this.executeStartVideo();
      case 'stop_video':
        return this.executeStopVideo();
      case 'qr_scan':
        return this.executeQRScan(params);
      case 'strawberry_detection':
        return this.executeStrawberryDetection(params);

      default:
        this.log(`未知节点类型: ${nodeType}`);
        return { status: 'skipped', reason: 'unknown_type' };
    }
  }

  // ==================== PureChat AI节点执行 ====================
  
  private async executePureChatChat(params: any): Promise<any> {
    const {
      assistantId = '',
      prompt = '',
      temperature = 0.7,
      maxTokens = 1000,
      outputVariable = 'purechat_response'
    } = params;

    this.log(`PureChat对话 - 助理: ${assistantId || '默认'}`);

    try {
      const context = [];
      
      if (this.context.variables.chat_history) {
        context.push(...this.context.variables.chat_history);
      }

      const response = await this.pureChatClient.chat({
        assistantId,
        prompt,
        temperature,
        maxTokens,
        context
      });

      if (!response.success) {
        throw new Error(response.error || 'PureChat调用失败');
      }

      this.log(`PureChat响应: ${response.data?.substring(0, 100)}...`);

      this.context.variables[outputVariable] = response.data;

      if (!this.context.variables.chat_history) {
        this.context.variables.chat_history = [];
      }
      this.context.variables.chat_history.push(
        { role: 'user', content: prompt },
        { role: 'assistant', content: response.data }
      );

      return {
        status: 'success',
        response: response.data,
        cached: response.cached,
        output_variable: outputVariable
      };

    } catch (error: any) {
      this.log(`PureChat对话失败: ${error.message}`);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  private async executePureChatImageAnalysis(params: any): Promise<any> {
    const {
      assistantId = '',
      prompt = '请分析这张图片',
      imageSource = 'camera',
      imageVariable = 'current_image',
      outputVariable = 'image_analysis_result'
    } = params;

    this.log(`PureChat图像分析 - 来源: ${imageSource}`);

    try {
      let imageData: string;

      if (imageSource === 'camera') {
        this.log('从摄像头获取图像...');
        const result = await this.sendCommand('get_current_frame');
        if (!result || !result.image_data) {
          throw new Error('无法获取摄像头图像');
        }
        imageData = result.image_data;
      } else if (imageSource === 'variable') {
        imageData = this.context.variables[imageVariable];
        if (!imageData) {
          throw new Error(`变量 '${imageVariable}' 中没有图像数据`);
        }
      } else if (imageSource === 'upload') {
        imageData = this.context.variables.uploaded_image;
        if (!imageData) {
          throw new Error('没有上传的图像');
        }
      } else {
        throw new Error(`不支持的图像来源: ${imageSource}`);
      }

      this.log('正在分析图像...');
      const response = await this.pureChatClient.analyzeImage({
        assistantId,
        imageData,
        prompt,
        imageSource
      });

      if (!response.success) {
        throw new Error(response.error || '图像分析失败');
      }

      this.log(`分析完成: ${response.data?.substring(0, 100)}...`);

      this.context.variables[outputVariable] = response.data;

      return {
        status: 'success',
        analysis: response.data,
        cached: response.cached,
        output_variable: outputVariable
      };

    } catch (error: any) {
      this.log(`图像分析失败: ${error.message}`);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // ==================== UniPixel分割节点执行 ====================
  
  private async executeUniPixelSegmentation(params: any): Promise<any> {
    const {
      imageSource = 'camera',
      imageVariable = 'current_image',
      query = '',
      confidence = 0.5,
      sampleFrames = 1,
      visualize = true,
      outputVariable = 'segmentation_result'
    } = params;

    this.log(`UniPixel分割 - 查询: "${query}"`);

    try {
      let imageData: string;

      if (imageSource === 'camera') {
        this.log('从摄像头获取图像...');
        const result = await this.sendCommand('get_current_frame');
        if (!result || !result.image_data) {
          throw new Error('无法获取摄像头图像');
        }
        imageData = result.image_data;
      } else if (imageSource === 'variable') {
        imageData = this.context.variables[imageVariable];
        if (!imageData) {
          throw new Error(`变量 '${imageVariable}' 中没有图像数据`);
        }
      } else if (imageSource === 'upload') {
        imageData = this.context.variables.uploaded_image;
        if (!imageData) {
          throw new Error('没有上传的图像');
        }
      } else {
        throw new Error(`不支持的图像来源: ${imageSource}`);
      }

      this.log('正在执行分割...');
      
      const result = await this.uniPixelClient.segment(
        {
          imageSource,
          imageData,
          query,
          confidence,
          sampleFrames,
          visualize
        },
        (progress) => {
          this.log(`分割进度: ${progress.status} (${progress.progress}%)`);
        }
      );

      if (!result.success) {
        throw new Error(result.error || '分割失败');
      }

      this.log(`分割完成 - 用时: ${result.processing_time.toFixed(2)}s`);
      
      if (result.used_fallback) {
        this.log('⚠️ UniPixel服务不可用，使用了本地降级方案');
      }

      this.context.variables[outputVariable] = result;
      
      if (result.mask_base64) {
        this.context.variables[`${outputVariable}_mask`] = result.mask_base64;
      }

      return {
        status: 'success',
        mask_base64: result.mask_base64,
        description: result.description,
        processing_time: result.processing_time,
        used_fallback: result.used_fallback,
        service_available: result.service_available,
        output_variable: outputVariable
      };

    } catch (error: any) {
      this.log(`UniPixel分割失败: ${error.message}`);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // ==================== YOLO检测节点执行 ====================
  
  private async executeYOLODetection(params: any): Promise<any> {
    const {
      modelSource = 'builtin',
      modelPath = '',
      imageSource = 'camera',
      confidence = 0.5,
      iouThreshold = 0.45,
      classes = '',
      drawResults = true,
      outputVariable = 'yolo_detections'
    } = params;

    let modelId = 'yolov8n';
    if (modelSource === 'builtin') {
      modelId = modelPath || 'yolov8n';
    } else if (modelSource === 'upload' || modelSource === 'url') {
      modelId = modelPath || 'custom_model';
    }

    this.log(`YOLO检测 - 模型: ${modelId}, 置信度: ${confidence}`);

    try {
      let imageData: string | undefined;
      
      if (imageSource === 'camera') {
        this.log('从摄像头获取图像...');
        const result = await this.sendCommand('get_current_frame');
        if (result && result.image_data) {
          imageData = result.image_data;
        }
      } else if (imageSource === 'variable') {
        const varName = params.imageVariable || 'current_image';
        imageData = this.context.variables[varName];
        if (!imageData) {
          throw new Error(`变量 '${varName}' 中没有图像数据`);
        }
      } else if (imageSource === 'upload') {
        imageData = this.context.variables.uploaded_image;
        if (!imageData) {
          throw new Error('没有上传的图像');
        }
      }

      if (!yoloClient || typeof yoloClient.detect !== 'function') {
        this.log('使用后端YOLO服务...');
        const detectionResult = await this.sendCommand('yolo_detect', {
          image_source: imageSource,
          image_data: imageData,
          model_id: modelId,
          confidence: confidence,
          iou_threshold: iouThreshold,
          classes: classes,
          draw_results: drawResults
        });

        if (!detectionResult) {
          throw new Error('YOLO检测失败：后端无响应');
        }

        const detections = detectionResult.detections || [];
        this.log(`检测完成：发现 ${detections.length} 个目标`);

        this.context.variables[outputVariable] = detectionResult;
        if (detectionResult.annotated_image) {
          this.context.variables[`${outputVariable}_image`] = detectionResult.annotated_image;
        }

        return {
          status: 'success',
          detections: detections,
          count: detections.length,
          model_id: modelId,
          output_variable: outputVariable
        };
      }

      this.log('正在执行YOLO检测...');
      const result = await yoloClient.detect({
        imageSource,
        imageData,
        modelId,
        confidence,
        iouThreshold,
        classes,
        drawResults
      });

      const count = result.detections.length;
      this.log(`检测完成：发现 ${count} 个目标`);

      this.context.variables[outputVariable] = result;
      if (result.annotated_image) {
        this.context.variables[`${outputVariable}_image`] = result.annotated_image;
      }

      if (count > 0) {
        const classCount: Record<string, number> = {};
        result.detections.forEach((det) => {
          classCount[det.class] = (classCount[det.class] || 0) + 1;
        });
        
        const summary = Object.entries(classCount)
          .map(([cls, cnt]) => `${cls}: ${cnt}`)
          .join(', ');
        this.log(`检测摘要: ${summary}`);
      }

      return {
        status: 'success',
        detections: result.detections,
        count: count,
        model_id: result.model_id,
        output_variable: outputVariable
      };

    } catch (error: any) {
      this.log(`YOLO检测失败: ${error.message || error}`);
      return {
        status: 'error',
        error: error.message || '检测失败',
        detections: [],
        count: 0
      };
    }
  }

  // ==================== 挑战卡任务执行 ====================
  
  private async executeChallenge8Flight(params: any): Promise<any> {
    const {
      radius = 100,
      speed = 50,
      loops = 1,
      timeout = 60,
      scoreOutput = 'flight_8_score'
    } = params;

    this.log(`执行8字飞行 - 半径: ${radius}cm, 速度: ${speed}%, 循环: ${loops}次`);

    try {
      let result;
      
      try {
        if (this.challengeTaskClient) {
          result = await this.challengeTaskClient.execute8Flight({
            radius,
            speed,
            loops,
            timeout
          });
        }
      } catch (clientError) {
        this.log('挑战任务客户端不可用，使用后端命令');
      }

      if (!result) {
        result = await this.sendCommand('challenge_task', {
          task_type: 'challenge_8_flight',
          params: { radius, speed, loops, timeout }
        });
      }

      if (result && result.success) {
        const score = result.score || 0;
        const completionTime = result.completionTime || result.completion_time || 0;
        
        this.context.variables[scoreOutput] = score;
        
        this.log(`8字飞行完成 - 评分: ${score.toFixed(1)}/100, 用时: ${completionTime.toFixed(1)}s`);
        
        return {
          status: 'success',
          success: true,
          score,
          completionTime,
          details: result.details
        };
      } else {
        throw new Error(result?.error || '8字飞行执行失败');
      }
    } catch (error: any) {
      this.log(`8字飞行失败: ${error.message}`);
      return {
        status: 'error',
        success: false,
        error: error.message
      };
    }
  }

  private async executeChallengeObstacle(params: any): Promise<any> {
    const {
      obstaclePositions = '[{"x": 100, "y": 0, "z": 100}]',
      speed = 40,
      safetyMargin = 20,
      timeout = 120,
      scoreOutput = 'obstacle_score'
    } = params;

    let positions;
    try {
      positions = typeof obstaclePositions === 'string' 
        ? JSON.parse(obstaclePositions) 
        : obstaclePositions;
    } catch (error) {
      this.log('障碍物位置格式错误');
      return { status: 'error', success: false, error: '障碍物位置格式错误' };
    }

    this.log(`执行穿越障碍 - 障碍数: ${positions.length}, 速度: ${speed}%`);

    try {
      let result;
      
      try {
        if (this.challengeTaskClient) {
          result = await this.challengeTaskClient.executeObstacleNavigation({
            obstaclePositions: positions,
            speed,
            safetyMargin,
            timeout
          });
        }
      } catch (clientError) {
        this.log('挑战任务客户端不可用，使用后端命令');
      }

      if (!result) {
        result = await this.sendCommand('challenge_task', {
          task_type: 'challenge_obstacle',
          params: { 
            obstacle_positions: positions, 
            speed, 
            safety_margin: safetyMargin, 
            timeout 
          }
        });
      }

      if (result && result.success) {
        const score = result.score || 0;
        const completionTime = result.completionTime || result.completion_time || 0;
        const obstaclesCleared = result.details?.obstacles_cleared || 0;
        
        this.context.variables[scoreOutput] = score;
        
        this.log(`穿越障碍完成 - 评分: ${score.toFixed(1)}/100, 通过: ${obstaclesCleared}/${positions.length}`);
        
        return {
          status: 'success',
          success: true,
          score,
          completionTime,
          obstaclesCleared,
          details: result.details
        };
      } else {
        throw new Error(result?.error || '穿越障碍执行失败');
      }
    } catch (error: any) {
      this.log(`穿越障碍失败: ${error.message}`);
      return {
        status: 'error',
        success: false,
        error: error.message
      };
    }
  }

  private async executeChallengePrecisionLand(params: any): Promise<any> {
    const {
      targetPosition = '{"x": 0, "y": 0}',
      precision = 10,
      maxAttempts = 3,
      timeout = 60,
      scoreOutput = 'landing_score'
    } = params;

    let target;
    try {
      target = typeof targetPosition === 'string' 
        ? JSON.parse(targetPosition) 
        : targetPosition;
    } catch (error) {
      this.log('目标位置格式错误');
      return { status: 'error', success: false, error: '目标位置格式错误' };
    }

    this.log(`执行精准降落 - 目标: (${target.x}, ${target.y}), 精度: ±${precision}cm`);

    try {
      let result;
      
      try {
        if (this.challengeTaskClient) {
          result = await this.challengeTaskClient.executePrecisionLanding({
            targetPosition: target,
            precision,
            maxAttempts,
            timeout
          });
        }
      } catch (clientError) {
        this.log('挑战任务客户端不可用，使用后端命令');
      }

      if (!result) {
        result = await this.sendCommand('challenge_task', {
          task_type: 'challenge_precision_land',
          params: { 
            target_position: target, 
            precision, 
            max_attempts: maxAttempts, 
            timeout 
          }
        });
      }

      if (result && result.success) {
        const score = result.score || 0;
        const completionTime = result.completionTime || result.completion_time || 0;
        const finalError = result.details?.final_error || 0;
        const attempts = result.details?.attempts || 0;
        
        this.context.variables[scoreOutput] = score;
        
        this.log(`精准降落完成 - 评分: ${score.toFixed(1)}/100, 误差: ${finalError.toFixed(1)}cm, 尝试: ${attempts}次`);
        
        return {
          status: 'success',
          success: true,
          score,
          completionTime,
          finalError,
          attempts,
          details: result.details
        };
      } else {
        throw new Error(result?.error || '精准降落执行失败');
      }
    } catch (error: any) {
      this.log(`精准降落失败: ${error.message}`);
      return {
        status: 'error',
        success: false,
        error: error.message
      };
    }
  }

  // ==================== 其他节点执行方法 ====================
  
  private executeConditionBranch(params: any): any {
    const { variable, operator, value } = params;
    const currentValue = this.context.variables[variable];
    
    let conditionMet = false;
    switch (operator) {
      case '>': conditionMet = currentValue > value; break;
      case '<': conditionMet = currentValue < value; break;
      case '>=': conditionMet = currentValue >= value; break;
      case '<=': conditionMet = currentValue <= value; break;
      case '==': conditionMet = currentValue == value; break;
      case '!=': conditionMet = currentValue != value; break;
    }

    this.log(`条件判断: ${variable}(${currentValue}) ${operator} ${value} = ${conditionMet}`);
    
    return {
      condition: conditionMet,
      variable,
      currentValue,
      operator,
      value,
      action: conditionMet ? params.trueAction : params.falseAction
    };
  }

  private executeIfElse(params: any): any {
    return { status: 'success', condition: true };
  }

  private executeLoop(params: any): any {
    return { status: 'success', iterations: params.iterations };
  }

  private async executeTakePhoto(params: any): Promise<any> {
    this.log(`拍照 - 分辨率: ${params.resolution}, 格式: ${params.format}`);
    await this.delay(1000);
    const filename = params.filename.replace('{timestamp}', Date.now().toString());
    this.log(`拍照完成: ${filename}`);
    return {
      status: 'success',
      filename,
      resolution: params.resolution,
      format: params.format,
      timestamp: Date.now()
    };
  }

  private async executeRecordVideo(params: any): Promise<any> {
    this.log(`录制视频 ${params.duration} 秒`);
    await this.delay(params.duration * 1000);
    return { status: 'success', duration: params.duration };
  }

  private async executeImageAnalysis(params: any): Promise<any> {
    this.log(`图像分析 - ${params.analysisType}`);
    await this.delay(1500);
    return { status: 'success', analysisType: params.analysisType };
  }

  private async executeAIClassification(params: any): Promise<any> {
    this.log(`AI分类 - ${params.model}`);
    await this.delay(1500);
    return { status: 'success', model: params.model, class: 'example_class', confidence: 0.95 };
  }

  private async executeAIDetection(params: any): Promise<any> {
    this.log(`AI检测 - ${params.model || 'default'}`);
    await this.delay(1500);
    return { 
      status: 'success', 
      model: params.model || 'default', 
      detections: [
        { class: 'object1', confidence: 0.92, bbox: [100, 100, 200, 200] },
        { class: 'object2', confidence: 0.85, bbox: [300, 150, 400, 250] }
      ]
    };
  }

  private async executeAISegmentation(params: any): Promise<any> {
    this.log(`AI分割 - ${params.model}`);
    await this.delay(2000);
    return { status: 'success', model: params.model, segments: 5 };
  }

  private executeDataStorage(params: any): any {
    this.log(`数据存储 - ${params.format}`);
    return { status: 'success', format: params.format };
  }

  private executeDataTransform(params: any): any {
    this.log(`数据转换 - ${params.inputFormat} -> ${params.outputFormat}`);
    return { status: 'success', inputFormat: params.inputFormat, outputFormat: params.outputFormat };
  }

  private executeDataFilter(params: any): any {
    this.log(`数据过滤 - ${params.filterType}`);
    return { status: 'success', filterType: params.filterType, filtered: 10 };
  }

  private async executeHttpRequest(params: any): Promise<any> {
    this.log(`HTTP请求 - ${params.method} ${params.url}`);
    await this.delay(1000);
    return {
      status: 'success',
      method: params.method,
      url: params.url,
      statusCode: 200,
      response: { message: 'Request successful', timestamp: Date.now() }
    };
  }

  private async executeWebSocketSend(params: any): Promise<any> {
    this.log(`WebSocket发送 - ${params.url}`);
    await this.delay(500);
    return { status: 'success', url: params.url };
  }

  private async executeApiCall(params: any): Promise<any> {
    this.log(`API调用 - ${params.endpoint}`);
    await this.delay(1000);
    return { status: 'success', endpoint: params.endpoint };
  }

  private async executeTakeoffWithBackend(params: any): Promise<any> {
    const height = Number(params?.height ?? 100);
    this.log(`起飞 - 目标高度: ${height}cm`);
    await this.sendCommand('drone_takeoff');
    await this.delay(2000);
    this.context.variables.altitude = height;
    return { status: 'success', altitude: height };
  }

  private async executeLandWithBackend(params: any): Promise<any> {
    this.log('降落');
    await this.sendCommand('drone_land');
    await this.delay(1500);
    this.context.variables.altitude = 0;
    return { status: 'success', altitude: 0 };
  }

  private async executeHoverWithBackend(params: any): Promise<any> {
    const duration = Number(params?.duration ?? 2);
    this.log(`悬停 ${duration} 秒`);
    await this.sendCommand('manual_control', { left_right: 0, forward_backward: 0, up_down: 0, yaw: 0 });
    await this.delay(duration * 1000);
    return { status: 'success', duration };
  }

  private async executeWait(params: any): Promise<any> {
    this.log(`等待 ${params.duration} 秒 - ${params.description || ''}`);
    await this.delay(params.duration * 1000);
    return { status: 'success', duration: params.duration };
  }

  private async executeMove(direction: string, params: any): Promise<any> {
    const distance = Number(params?.distance ?? 50);
    this.log(`移动 ${direction} ${distance}cm`);
    const ok = await this.sendCommand('move', { direction, distance });
    if (!ok) {
      const speed = 40;
      let lr = 0, fb = 0, ud = 0;
      switch (direction) {
        case 'left': lr = -speed; break;
        case 'right': lr = speed; break;
        case 'forward':
        case 'front': fb = speed; break;
        case 'back':
        case 'backward': fb = -speed; break;
        case 'up': ud = speed; break;
        case 'down': ud = -speed; break;
      }
      const durationMs = Math.max(300, Math.min(3000, Math.floor(distance * 20)));
      await this.sendCommand('manual_control', { left_right: lr, forward_backward: fb, up_down: ud, yaw: 0 });
      await this.delay(durationMs);
      await this.sendCommand('manual_control', { left_right: 0, forward_backward: 0, up_down: 0, yaw: 0 });
    } else {
      await this.delay(400);
    }
    return { status: 'success', direction, distance };
  }

  private async executeRotate(direction: 'cw' | 'ccw', params: any): Promise<any> {
    const degrees = Number(params?.degrees ?? 90);
    this.log(`旋转 ${direction} ${degrees}°`);
    const ok = await this.sendCommand('rotate', { direction, degrees });
    if (!ok) {
      const yaw = direction === 'cw' ? 60 : -60;
      const durationMs = Math.max(300, Math.min(2000, Math.floor(degrees * 6)));
      await this.sendCommand('manual_control', { left_right: 0, forward_backward: 0, up_down: 0, yaw });
      await this.delay(durationMs);
      await this.sendCommand('manual_control', { left_right: 0, forward_backward: 0, up_down: 0, yaw: 0 });
    } else {
      await this.delay(300);
    }
    return { status: 'success', direction, degrees };
  }

  private async executeFlip(direction: 'l' | 'r' | 'f' | 'b'): Promise<any> {
    this.log(`翻转 ${direction}`);
    await this.sendCommand('flip', { direction });
    await this.delay(300);
    return { status: 'success', direction };
  }

  private async executeStartVideo(): Promise<any> {
    this.log('开启视频流');
    await this.sendCommand('start_video_streaming');
    return { status: 'success' };
  }

  private async executeStopVideo(): Promise<any> {
    this.log('停止视频流');
    await this.sendCommand('stop_video_streaming');
    return { status: 'success' };
  }



  private async getNextNodes(currentNode: WorkflowNode, result: any): Promise<WorkflowNode[]> {
    const outgoingEdges = this.edges.filter(edge => edge.source === currentNode.id);
    const nextNodes: WorkflowNode[] = [];

    for (const edge of outgoingEdges) {
      const nextNode = this.nodes.find(node => node.id === edge.target);
      if (nextNode) {
        const currentNodeType = currentNode.data?.nodeType || currentNode.type;
        if (currentNodeType === 'condition_branch' && result.condition !== undefined) {
          const edgeIndex = outgoingEdges.indexOf(edge);
          if ((result.condition && edgeIndex === 0) || (!result.condition && edgeIndex === 1)) {
            nextNodes.push(nextNode);
          }
        } else {
          nextNodes.push(nextNode);
        }
      }
    }

    return nextNodes;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getContext(): ExecutionContext {
    return { ...this.context };
  }

  updateVariable(key: string, value: any) {
    this.context.variables[key] = value;
    this.updateState();
  }

  /**
   * Enable or disable parallel execution
   */
  setParallelExecution(enabled: boolean) {
    this.enableParallelExecution = enabled;
    this.log(`并行执行${enabled ? '已启用' : '已禁用'}`);
  }

  /**
   * Get workflow execution statistics
   */
  getExecutionStats() {
    return this.parallelExecutor.getExecutionStats();
  }

  /**
   * Get dependency information for a node
   */
  getNodeDependencies(nodeId: string) {
    return this.parallelExecutor.getNodeDependencies(nodeId);
  }

  /**
   * Check if workflow has circular dependencies
   */
  hasCircularDependencies(): boolean {
    return this.parallelExecutor.hasCircularDependencies();
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    return this.errorHandler.getErrorStats();
  }

  /**
   * Get error history
   */
  getErrorHistory() {
    return this.errorHandler.getErrorHistory();
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errorHandler.clearHistory();
  }

  // ==================== QR Scan节点执行 ====================
  
  private async executeQRScan(params: any): Promise<any> {
    const {
      timeout = 10,
      scanRegion = 'full',
      customRegion = '',
      multiDetection = false,
      maxDetections = 5,
      validationPattern = '',
      requiredPrefix = '',
      minLength = 0,
      maxLength = 0,
      parseFormat = 'auto',
      aggregateResults = true,
      drawAnnotations = true,
      saveImage = true,
      continueOnFail = false,
      outputVariable = 'qr_results'
    } = params;

    this.log(`执行QR码扫描 - 超时: ${timeout}秒, 多码: ${multiDetection ? '是' : '否'}`);

    try {
      // Parse custom region if provided
      let regionConfig: any = { type: scanRegion };
      if (scanRegion === 'custom' && customRegion) {
        try {
          const [x, y, w, h] = customRegion.split(',').map((v: string) => parseInt(v.trim()));
          regionConfig = {
            type: 'custom',
            customRegion: { x, y, width: w, height: h }
          };
        } catch (error) {
          this.log('自定义区域格式错误，使用全图扫描');
          regionConfig = { type: 'full' };
        }
      }

      // Build validation rules
      const validationRules: any = {};
      if (validationPattern) validationRules.pattern = validationPattern;
      if (requiredPrefix) validationRules.requiredPrefix = requiredPrefix;
      if (minLength > 0) validationRules.minLength = minLength;
      if (maxLength > 0) validationRules.maxLength = maxLength;

      // Execute QR scan
      const result = await this.qrScanClient.scan({
        timeout,
        scanRegion: regionConfig,
        multiDetection,
        maxDetections,
        validationRules: Object.keys(validationRules).length > 0 ? validationRules : undefined,
        parseFormat,
        aggregateResults,
        drawAnnotations,
        saveImage
      });

      if (result.success && result.detections.length > 0) {
        // Store results in context
        this.context.variables[outputVariable] = result;
        
        // Aggregate results if requested
        if (aggregateResults && multiDetection) {
          const aggregated = this.qrScanClient.aggregateResults(result.detections);
          this.context.variables[`${outputVariable}_aggregated`] = aggregated;
          
          this.log(`QR扫描成功 - 检测到 ${result.count} 个QR码 (有效: ${aggregated.valid}, 无效: ${aggregated.invalid})`);
          
          // Log plant IDs if any
          if (aggregated.plantIds.length > 0) {
            this.log(`植株ID: ${aggregated.plantIds.join(', ')}`);
          }
        } else {
          this.log(`QR扫描成功 - 检测到 ${result.count} 个QR码`);
          
          // Log first detection
          if (result.detections[0]) {
            const first = result.detections[0];
            this.log(`内容: ${first.data.substring(0, 50)}${first.data.length > 50 ? '...' : ''}`);
            if (first.plant_id) {
              this.log(`植株ID: ${first.plant_id}`);
            }
          }
        }

        return {
          status: 'success',
          success: true,
          count: result.count,
          detections: result.detections,
          aggregated: aggregateResults && multiDetection 
            ? this.qrScanClient.aggregateResults(result.detections)
            : undefined,
          image: result.image,
          timestamp: result.timestamp
        };
      } else {
        this.log(`QR扫描失败: ${result.error || '未检测到QR码'}`);
        
        if (continueOnFail) {
          this.log('继续执行工作流');
          return {
            status: 'skipped',
            success: false,
            count: 0,
            detections: [],
            error: result.error || '未检测到QR码'
          };
        } else {
          throw new Error(result.error || '未检测到QR码');
        }
      }
    } catch (error: any) {
      this.log(`QR扫描错误: ${error.message}`);
      
      if (continueOnFail) {
        this.log('继续执行工作流');
        return {
          status: 'skipped',
          success: false,
          count: 0,
          detections: [],
          error: error.message
        };
      } else {
        throw error;
      }
    }
  }

  private async executeStrawberryDetection(params: any): Promise<any> {
    // Existing strawberry detection implementation
    const {
      confidence = 0.7,
      timeout = 15,
      saveResults = true,
      outputVariable = 'strawberry_data'
    } = params;

    this.log(`执行草莓检测 - 置信度: ${confidence}`);

    try {
      const result = await this.sendCommand('strawberry_detection', {
        confidence,
        timeout,
        save_results: saveResults
      });

      if (result && result.success) {
        this.context.variables[outputVariable] = result;
        this.log(`草莓检测完成 - 检测到 ${result.count || 0} 个草莓`);
        
        return {
          status: 'success',
          success: true,
          count: result.count || 0,
          detections: result.detections || [],
          image: result.image
        };
      } else {
        throw new Error(result?.error || '草莓检测失败');
      }
    } catch (error: any) {
      this.log(`草莓检测错误: ${error.message}`);
      return {
        status: 'error',
        success: false,
        error: error.message
      };
    }
  }
}

// 导出工作流引擎和相关类型
export default WorkflowEngine;
