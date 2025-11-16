/**
 * Intelligent Agent Error Recovery System
 * 
 * Handles automatic error recovery, retry logic, and degradation strategies.
 * 
 * Requirement: 8.5
 */

import {
  IntelligentAgentError,
  IntelligentAgentErrorType,
  AIServiceError,
  DroneConnectionError,
  WebSocketError,
} from './intelligentAgentErrors';
import { intelligentAgentErrorLogger } from './intelligentAgentErrorLogger';

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

/**
 * Recovery strategy result
 */
export interface RecoveryResult {
  success: boolean;
  recovered: boolean;
  message: string;
  shouldRetry: boolean;
  degraded?: boolean;
}

/**
 * Default retry configurations for different error types
 */
const DEFAULT_RETRY_CONFIGS: Record<IntelligentAgentErrorType, RetryConfig> = {
  // AI Service - retry with backoff
  [IntelligentAgentErrorType.AI_SERVICE_UNAVAILABLE]: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 10000,
  },
  [IntelligentAgentErrorType.AI_SERVICE_TIMEOUT]: {
    maxAttempts: 2,
    delayMs: 2000,
    backoffMultiplier: 1.5,
    maxDelayMs: 5000,
  },
  [IntelligentAgentErrorType.AI_SERVICE_INVALID_RESPONSE]: {
    maxAttempts: 2,
    delayMs: 500,
    backoffMultiplier: 1,
    maxDelayMs: 500,
  },
  [IntelligentAgentErrorType.AI_SERVICE_RATE_LIMIT]: {
    maxAttempts: 1,
    delayMs: 60000, // Wait 1 minute
    backoffMultiplier: 1,
    maxDelayMs: 60000,
  },
  [IntelligentAgentErrorType.AI_SERVICE_AUTH_FAILED]: {
    maxAttempts: 0, // Don't retry auth failures
    delayMs: 0,
    backoffMultiplier: 1,
    maxDelayMs: 0,
  },

  // Drone Connection - retry quickly
  [IntelligentAgentErrorType.DRONE_NOT_CONNECTED]: {
    maxAttempts: 3,
    delayMs: 500,
    backoffMultiplier: 1.5,
    maxDelayMs: 2000,
  },
  [IntelligentAgentErrorType.DRONE_CONNECTION_LOST]: {
    maxAttempts: 5,
    delayMs: 1000,
    backoffMultiplier: 1.2,
    maxDelayMs: 5000,
  },
  [IntelligentAgentErrorType.DRONE_CONNECTION_TIMEOUT]: {
    maxAttempts: 2,
    delayMs: 2000,
    backoffMultiplier: 1,
    maxDelayMs: 2000,
  },
  [IntelligentAgentErrorType.DRONE_LOW_BATTERY]: {
    maxAttempts: 0, // Don't retry low battery
    delayMs: 0,
    backoffMultiplier: 1,
    maxDelayMs: 0,
  },

  // Command Parsing - retry once
  [IntelligentAgentErrorType.COMMAND_PARSE_FAILED]: {
    maxAttempts: 1,
    delayMs: 500,
    backoffMultiplier: 1,
    maxDelayMs: 500,
  },
  [IntelligentAgentErrorType.COMMAND_INVALID_FORMAT]: {
    maxAttempts: 0,
    delayMs: 0,
    backoffMultiplier: 1,
    maxDelayMs: 0,
  },
  [IntelligentAgentErrorType.COMMAND_INVALID_PARAMETERS]: {
    maxAttempts: 0,
    delayMs: 0,
    backoffMultiplier: 1,
    maxDelayMs: 0,
  },
  [IntelligentAgentErrorType.COMMAND_UNSAFE]: {
    maxAttempts: 0,
    delayMs: 0,
    backoffMultiplier: 1,
    maxDelayMs: 0,
  },

  // Command Execution - retry with delay
  [IntelligentAgentErrorType.COMMAND_EXECUTION_FAILED]: {
    maxAttempts: 2,
    delayMs: 1000,
    backoffMultiplier: 1.5,
    maxDelayMs: 3000,
  },
  [IntelligentAgentErrorType.COMMAND_EXECUTION_TIMEOUT]: {
    maxAttempts: 1,
    delayMs: 2000,
    backoffMultiplier: 1,
    maxDelayMs: 2000,
  },
  [IntelligentAgentErrorType.COMMAND_SEQUENCE_FAILED]: {
    maxAttempts: 1,
    delayMs: 1000,
    backoffMultiplier: 1,
    maxDelayMs: 1000,
  },

  // WebSocket - retry with backoff
  [IntelligentAgentErrorType.WEBSOCKET_NOT_CONNECTED]: {
    maxAttempts: 5,
    delayMs: 1000,
    backoffMultiplier: 1.5,
    maxDelayMs: 10000,
  },
  [IntelligentAgentErrorType.WEBSOCKET_CONNECTION_FAILED]: {
    maxAttempts: 3,
    delayMs: 2000,
    backoffMultiplier: 2,
    maxDelayMs: 10000,
  },
  [IntelligentAgentErrorType.WEBSOCKET_MESSAGE_FAILED]: {
    maxAttempts: 2,
    delayMs: 500,
    backoffMultiplier: 1.5,
    maxDelayMs: 2000,
  },

  // Configuration - don't retry
  [IntelligentAgentErrorType.CONFIG_INVALID]: {
    maxAttempts: 0,
    delayMs: 0,
    backoffMultiplier: 1,
    maxDelayMs: 0,
  },
  [IntelligentAgentErrorType.CONFIG_MISSING]: {
    maxAttempts: 0,
    delayMs: 0,
    backoffMultiplier: 1,
    maxDelayMs: 0,
  },

  // Unknown - retry once
  [IntelligentAgentErrorType.UNKNOWN_ERROR]: {
    maxAttempts: 1,
    delayMs: 1000,
    backoffMultiplier: 1,
    maxDelayMs: 1000,
  },
};

/**
 * Intelligent Agent Error Recovery Manager
 */
export class IntelligentAgentErrorRecovery {
  private retryAttempts: Map<string, number> = new Map();

  /**
   * Attempt to recover from an error
   */
  async attemptRecovery(
    error: IntelligentAgentError,
    operation: () => Promise<any>,
    operationId?: string
  ): Promise<RecoveryResult> {
    const config = this.getRetryConfig(error.type);
    const attemptKey = operationId || `${error.type}_${Date.now()}`;
    const currentAttempt = this.retryAttempts.get(attemptKey) || 0;

    // Check if we should retry
    if (!this.shouldRetry(error, currentAttempt, config)) {
      return {
        success: false,
        recovered: false,
        message: '无法自动恢复，请手动处理',
        shouldRetry: false,
      };
    }

    // Increment attempt counter
    this.retryAttempts.set(attemptKey, currentAttempt + 1);

    // Calculate delay with backoff
    const delay = this.calculateDelay(currentAttempt, config);

    console.log(
      `[ErrorRecovery] Attempting recovery for ${error.type} ` +
      `(attempt ${currentAttempt + 1}/${config.maxAttempts}, delay: ${delay}ms)`
    );

    // Wait before retry
    await this.sleep(delay);

    try {
      // Attempt the operation again
      await operation();

      // Success - reset counter
      this.retryAttempts.delete(attemptKey);

      return {
        success: true,
        recovered: true,
        message: '操作已成功恢复',
        shouldRetry: false,
      };
    } catch (retryError) {
      const newAttempt = this.retryAttempts.get(attemptKey) || 0;

      if (newAttempt >= config.maxAttempts) {
        // Max attempts reached
        this.retryAttempts.delete(attemptKey);

        return {
          success: false,
          recovered: false,
          message: `重试 ${config.maxAttempts} 次后仍然失败`,
          shouldRetry: false,
        };
      }

      // Can retry again
      return {
        success: false,
        recovered: false,
        message: `重试失败，还可以尝试 ${config.maxAttempts - newAttempt} 次`,
        shouldRetry: true,
      };
    }
  }

  /**
   * Check if error should be retried
   */
  private shouldRetry(
    error: IntelligentAgentError,
    currentAttempt: number,
    config: RetryConfig
  ): boolean {
    // Check if error is recoverable
    if (!error.recoverable) {
      return false;
    }

    // Check if we've exceeded max attempts
    if (currentAttempt >= config.maxAttempts) {
      return false;
    }

    // Check if max attempts is 0 (no retry)
    if (config.maxAttempts === 0) {
      return false;
    }

    return true;
  }

  /**
   * Calculate delay with exponential backoff
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.delayMs * Math.pow(config.backoffMultiplier, attempt);
    return Math.min(delay, config.maxDelayMs);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get retry configuration for error type
   */
  private getRetryConfig(errorType: IntelligentAgentErrorType): RetryConfig {
    return DEFAULT_RETRY_CONFIGS[errorType] || DEFAULT_RETRY_CONFIGS[IntelligentAgentErrorType.UNKNOWN_ERROR];
  }

  /**
   * Attempt degraded operation (fallback)
   */
  async attemptDegradedOperation(
    error: IntelligentAgentError,
    fallbackOperation?: () => Promise<any>
  ): Promise<RecoveryResult> {
    // AI Service degradation - use simpler model or cached responses
    if (error instanceof AIServiceError) {
      console.log('[ErrorRecovery] Attempting AI service degradation');

      if (fallbackOperation) {
        try {
          await fallbackOperation();
          return {
            success: true,
            recovered: true,
            message: '已切换到备用AI服务',
            shouldRetry: false,
            degraded: true,
          };
        } catch (fallbackError) {
          return {
            success: false,
            recovered: false,
            message: '备用服务也不可用',
            shouldRetry: false,
          };
        }
      }

      return {
        success: false,
        recovered: false,
        message: 'AI服务不可用且无备用方案',
        shouldRetry: false,
      };
    }

    // Drone degradation - use simulation mode
    if (error instanceof DroneConnectionError) {
      console.log('[ErrorRecovery] Drone not available, suggesting simulation mode');

      return {
        success: false,
        recovered: false,
        message: '无人机不可用，可以使用模拟模式进行测试',
        shouldRetry: false,
        degraded: true,
      };
    }

    // WebSocket degradation - use HTTP polling
    if (error instanceof WebSocketError) {
      console.log('[ErrorRecovery] WebSocket not available, suggesting HTTP fallback');

      if (fallbackOperation) {
        try {
          await fallbackOperation();
          return {
            success: true,
            recovered: true,
            message: '已切换到HTTP轮询模式',
            shouldRetry: false,
            degraded: true,
          };
        } catch (fallbackError) {
          return {
            success: false,
            recovered: false,
            message: 'HTTP轮询也不可用',
            shouldRetry: false,
          };
        }
      }
    }

    return {
      success: false,
      recovered: false,
      message: '无可用的降级方案',
      shouldRetry: false,
    };
  }

  /**
   * Check if consecutive error threshold is exceeded
   */
  checkConsecutiveErrorThreshold(): boolean {
    return intelligentAgentErrorLogger.hasExceededErrorThreshold();
  }

  /**
   * Get configuration check message
   */
  getConfigurationCheckMessage(): string {
    return '检测到连续错误，建议检查以下配置：\n' +
           '1. AI服务配置（API密钥、模型选择）\n' +
           '2. 无人机连接状态\n' +
           '3. 网络连接\n' +
           '4. 后端服务状态\n\n' +
           '详细信息请查看文档或联系技术支持。';
  }

  /**
   * Reset retry counters
   */
  resetRetryCounters(): void {
    this.retryAttempts.clear();
    console.log('[ErrorRecovery] Retry counters reset');
  }

  /**
   * Get current retry attempts for an operation
   */
  getRetryAttempts(operationId: string): number {
    return this.retryAttempts.get(operationId) || 0;
  }
}

// Singleton instance
export const intelligentAgentErrorRecovery = new IntelligentAgentErrorRecovery();
