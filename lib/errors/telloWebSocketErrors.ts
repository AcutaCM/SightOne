/**
 * Tello WebSocket 错误处理工具
 * 提供 WebSocket 连接错误处理、自动重连和错误恢复机制
 */

export type WebSocketErrorType = 
  | 'CONNECTION_FAILED'
  | 'CONNECTION_TIMEOUT'
  | 'CONNECTION_CLOSED'
  | 'MESSAGE_SEND_FAILED'
  | 'INVALID_MESSAGE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface WebSocketError {
  type: WebSocketErrorType;
  message: string;
  originalError?: Error | Event;
  timestamp: Date;
  retryable: boolean;
}

export interface ReconnectConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RECONNECT_CONFIG: ReconnectConfig = {
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2
};

/**
 * WebSocket 错误处理器类
 */
export class WebSocketErrorHandler {
  private reconnectConfig: ReconnectConfig;
  private retryCount: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isReconnecting: boolean = false;

  constructor(config?: Partial<ReconnectConfig>) {
    this.reconnectConfig = { ...DEFAULT_RECONNECT_CONFIG, ...config };
  }

  /**
   * 处理 WebSocket 错误
   */
  handleError(error: Event | Error, context?: string): WebSocketError {
    const wsError = this.classifyError(error, context);
    
    console.error(`[WebSocket Error] ${wsError.type}:`, wsError.message, {
      context,
      timestamp: wsError.timestamp,
      retryable: wsError.retryable
    });

    return wsError;
  }

  /**
   * 分类错误类型
   */
  private classifyError(error: Event | Error, context?: string): WebSocketError {
    let type: WebSocketErrorType = 'UNKNOWN_ERROR';
    let message = '未知错误';
    let retryable = false;

    if (error instanceof Error) {
      message = error.message;
      
      if (message.includes('timeout')) {
        type = 'CONNECTION_TIMEOUT';
        message = 'WebSocket 连接超时';
        retryable = true;
      } else if (message.includes('network') || message.includes('ECONNREFUSED')) {
        type = 'NETWORK_ERROR';
        message = '网络连接失败,请检查网络设置';
        retryable = true;
      } else if (message.includes('send')) {
        type = 'MESSAGE_SEND_FAILED';
        message = '消息发送失败';
        retryable = true;
      } else {
        type = 'CONNECTION_FAILED';
        message = `连接失败: ${message}`;
        retryable = true;
      }
    } else if (error instanceof Event) {
      if (error.type === 'error') {
        type = 'CONNECTION_FAILED';
        message = 'WebSocket 连接失败,请确保无人机后端服务正在运行';
        retryable = true;
      } else if (error.type === 'close') {
        type = 'CONNECTION_CLOSED';
        message = 'WebSocket 连接已关闭';
        retryable = true;
      }
    }

    if (context) {
      message = `${context}: ${message}`;
    }

    return {
      type,
      message,
      originalError: error,
      timestamp: new Date(),
      retryable
    };
  }

  /**
   * 自动重连
   */
  async attemptReconnect(
    connectFn: () => Promise<WebSocket>,
    onSuccess?: () => void,
    onFailure?: (error: WebSocketError) => void
  ): Promise<boolean> {
    if (this.isReconnecting) {
      console.log('[WebSocket] 重连已在进行中');
      return false;
    }

    if (this.retryCount >= this.reconnectConfig.maxRetries) {
      const error: WebSocketError = {
        type: 'CONNECTION_FAILED',
        message: `重连失败: 已达到最大重试次数 (${this.reconnectConfig.maxRetries})`,
        timestamp: new Date(),
        retryable: false
      };
      
      onFailure?.(error);
      this.reset();
      return false;
    }

    this.isReconnecting = true;
    this.retryCount++;

    const delay = Math.min(
      this.reconnectConfig.initialDelay * Math.pow(this.reconnectConfig.backoffMultiplier, this.retryCount - 1),
      this.reconnectConfig.maxDelay
    );

    console.log(`[WebSocket] 尝试重连 (${this.retryCount}/${this.reconnectConfig.maxRetries}), 延迟 ${delay}ms`);

    return new Promise((resolve) => {
      this.reconnectTimer = setTimeout(async () => {
        try {
          await connectFn();
          console.log('[WebSocket] 重连成功');
          this.reset();
          onSuccess?.();
          resolve(true);
        } catch (error) {
          console.error('[WebSocket] 重连失败:', error);
          this.isReconnecting = false;
          
          // 继续尝试重连
          const success = await this.attemptReconnect(connectFn, onSuccess, onFailure);
          resolve(success);
        }
      }, delay);
    });
  }

  /**
   * 取消重连
   */
  cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.isReconnecting = false;
    console.log('[WebSocket] 重连已取消');
  }

  /**
   * 重置重连状态
   */
  reset(): void {
    this.retryCount = 0;
    this.isReconnecting = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 获取当前重试次数
   */
  getRetryCount(): number {
    return this.retryCount;
  }

  /**
   * 是否正在重连
   */
  isCurrentlyReconnecting(): boolean {
    return this.isReconnecting;
  }

  /**
   * 获取用户友好的错误消息
   */
  static getUserFriendlyMessage(error: WebSocketError): string {
    const suggestions: Record<WebSocketErrorType, string> = {
      CONNECTION_FAILED: '请确保无人机后端服务正在运行 (端口 3002)',
      CONNECTION_TIMEOUT: '连接超时,请检查网络连接',
      CONNECTION_CLOSED: '连接已断开,点击重连按钮恢复连接',
      MESSAGE_SEND_FAILED: '消息发送失败,请稍后重试',
      INVALID_MESSAGE: '收到无效消息,请联系技术支持',
      NETWORK_ERROR: '网络错误,请检查网络设置',
      UNKNOWN_ERROR: '发生未知错误,请刷新页面重试'
    };

    return `${error.message}\n\n建议: ${suggestions[error.type]}`;
  }

  /**
   * 获取错误恢复建议
   */
  static getRecoverySuggestions(error: WebSocketError): string[] {
    const suggestions: Record<WebSocketErrorType, string[]> = {
      CONNECTION_FAILED: [
        '检查无人机后端服务是否正在运行',
        '确认端口 3002 未被占用',
        '检查防火墙设置',
        '尝试重启后端服务'
      ],
      CONNECTION_TIMEOUT: [
        '检查网络连接',
        '尝试刷新页面',
        '检查服务器响应时间'
      ],
      CONNECTION_CLOSED: [
        '点击重连按钮',
        '检查网络稳定性',
        '确认后端服务正常运行'
      ],
      MESSAGE_SEND_FAILED: [
        '检查 WebSocket 连接状态',
        '稍后重试',
        '检查消息格式'
      ],
      INVALID_MESSAGE: [
        '检查后端服务版本',
        '查看控制台错误日志',
        '联系技术支持'
      ],
      NETWORK_ERROR: [
        '检查网络连接',
        '尝试切换网络',
        '检查代理设置'
      ],
      UNKNOWN_ERROR: [
        '刷新页面',
        '清除浏览器缓存',
        '查看控制台错误日志',
        '联系技术支持'
      ]
    };

    return suggestions[error.type] || suggestions.UNKNOWN_ERROR;
  }
}

/**
 * 创建 WebSocket 错误处理器
 */
export function createWebSocketErrorHandler(config?: Partial<ReconnectConfig>): WebSocketErrorHandler {
  return new WebSocketErrorHandler(config);
}

/**
 * WebSocket 连接状态
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

/**
 * 获取连接状态的显示文本
 */
export function getConnectionStatusText(status: ConnectionStatus): string {
  const texts: Record<ConnectionStatus, string> = {
    disconnected: '未连接',
    connecting: '连接中...',
    connected: '已连接',
    reconnecting: '重连中...',
    error: '连接错误'
  };
  return texts[status];
}

/**
 * 获取连接状态的颜色
 */
export function getConnectionStatusColor(status: ConnectionStatus): 'default' | 'primary' | 'success' | 'warning' | 'danger' {
  const colors: Record<ConnectionStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
    disconnected: 'default',
    connecting: 'primary',
    connected: 'success',
    reconnecting: 'warning',
    error: 'danger'
  };
  return colors[status];
}
