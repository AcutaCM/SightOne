/**
 * Error Handler for Workflow Engine
 * 
 * Provides retry logic, fallback strategies, and error recovery mechanisms
 */

export type ErrorAction = 
  | { type: 'retry'; maxRetries: number; delay: number }
  | { type: 'skip'; continueWorkflow: boolean }
  | { type: 'fallback'; fallbackNode?: string; fallbackAction?: () => Promise<any> }
  | { type: 'abort'; cleanup: boolean };

export interface ErrorHandlerConfig {
  defaultMaxRetries?: number;
  defaultRetryDelay?: number;
  enableFallback?: boolean;
  logErrors?: boolean;
}

export interface NodeError {
  nodeId: string;
  nodeType: string;
  error: Error;
  timestamp: Date;
  retryCount: number;
}

/**
 * Error Handler Class
 */
export class ErrorHandler {
  private config: Required<ErrorHandlerConfig>;
  private errorHistory: NodeError[] = [];
  private retryCount: Map<string, number> = new Map();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      defaultMaxRetries: config.defaultMaxRetries ?? 3,
      defaultRetryDelay: config.defaultRetryDelay ?? 1000,
      enableFallback: config.enableFallback ?? true,
      logErrors: config.logErrors ?? true
    };
  }

  /**
   * Handle error with appropriate strategy
   */
  async handleError(
    nodeId: string,
    nodeType: string,
    error: Error,
    customAction?: ErrorAction
  ): Promise<ErrorAction> {
    // Record error
    const nodeError: NodeError = {
      nodeId,
      nodeType,
      error,
      timestamp: new Date(),
      retryCount: this.retryCount.get(nodeId) || 0
    };
    this.errorHistory.push(nodeError);

    if (this.config.logErrors) {
      console.error(`[ErrorHandler] Node ${nodeId} (${nodeType}) failed:`, error.message);
    }

    // Use custom action if provided
    if (customAction) {
      return customAction;
    }

    // Determine action based on error type and node type
    return this.determineAction(nodeId, nodeType, error);
  }

  /**
   * Determine appropriate error action based on context
   */
  private determineAction(
    nodeId: string,
    nodeType: string,
    error: Error
  ): ErrorAction {
    const currentRetries = this.retryCount.get(nodeId) || 0;

    // Network/timeout errors - retry
    if (this.isNetworkError(error) || this.isTimeoutError(error)) {
      if (currentRetries < this.config.defaultMaxRetries) {
        return {
          type: 'retry',
          maxRetries: this.config.defaultMaxRetries,
          delay: this.config.defaultRetryDelay * (currentRetries + 1) // Exponential backoff
        };
      }
    }

    // Service unavailable - try fallback
    if (this.isServiceUnavailableError(error) && this.config.enableFallback) {
      return {
        type: 'fallback'
      };
    }

    // Configuration/validation errors - abort
    if (this.isConfigurationError(error)) {
      return {
        type: 'abort',
        cleanup: true
      };
    }

    // Critical node types - abort
    if (this.isCriticalNode(nodeType)) {
      return {
        type: 'abort',
        cleanup: true
      };
    }

    // Default - skip and continue
    return {
      type: 'skip',
      continueWorkflow: true
    };
  }

  /**
   * Execute with retry logic
   */
  async executeWithRetry<T>(
    nodeId: string,
    fn: () => Promise<T>,
    maxRetries: number = this.config.defaultMaxRetries,
    delay: number = this.config.defaultRetryDelay
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        
        // Success - reset retry count
        this.retryCount.delete(nodeId);
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Update retry count
        this.retryCount.set(nodeId, attempt + 1);
        
        if (attempt < maxRetries) {
          if (this.config.logErrors) {
            console.log(`[ErrorHandler] Retry ${attempt + 1}/${maxRetries} for node ${nodeId} after ${delay}ms`);
          }
          
          // Wait before retry with exponential backoff
          await this.delay(delay * (attempt + 1));
        }
      }
    }

    // All retries failed
    throw lastError || new Error('All retries failed');
  }

  /**
   * Execute with fallback
   */
  async executeWithFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>,
    serviceName: string
  ): Promise<{ result: T; usedFallback: boolean }> {
    try {
      const result = await primary();
      return { result, usedFallback: false };
    } catch (error) {
      if (this.config.logErrors) {
        console.warn(`[ErrorHandler] ${serviceName} failed, using fallback:`, error);
      }
      
      const result = await fallback();
      return { result, usedFallback: true };
    }
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: Error): boolean {
    const networkKeywords = ['network', 'connection', 'ECONNREFUSED', 'ETIMEDOUT', 'fetch'];
    return networkKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Check if error is timeout-related
   */
  private isTimeoutError(error: Error): boolean {
    const timeoutKeywords = ['timeout', 'timed out', 'ETIMEDOUT'];
    return timeoutKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Check if error is service unavailable
   */
  private isServiceUnavailableError(error: Error): boolean {
    const serviceKeywords = ['unavailable', 'not available', '503', 'service'];
    return serviceKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Check if error is configuration-related
   */
  private isConfigurationError(error: Error): boolean {
    const configKeywords = ['configuration', 'invalid parameter', 'validation', 'missing'];
    return configKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Check if node type is critical (should not be skipped)
   */
  private isCriticalNode(nodeType: string): boolean {
    const criticalTypes = ['start', 'end', 'takeoff', 'land'];
    return criticalTypes.includes(nodeType);
  }

  /**
   * Get error history
   */
  getErrorHistory(): NodeError[] {
    return [...this.errorHistory];
  }

  /**
   * Get retry count for a node
   */
  getRetryCount(nodeId: string): number {
    return this.retryCount.get(nodeId) || 0;
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = [];
    this.retryCount.clear();
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByNode: Record<string, number>;
    averageRetries: number;
  } {
    const errorsByType: Record<string, number> = {};
    const errorsByNode: Record<string, number> = {};
    let totalRetries = 0;

    this.errorHistory.forEach(err => {
      // Count by type
      errorsByType[err.nodeType] = (errorsByType[err.nodeType] || 0) + 1;
      
      // Count by node
      errorsByNode[err.nodeId] = (errorsByNode[err.nodeId] || 0) + 1;
      
      // Sum retries
      totalRetries += err.retryCount;
    });

    return {
      totalErrors: this.errorHistory.length,
      errorsByType,
      errorsByNode,
      averageRetries: this.errorHistory.length > 0 
        ? totalRetries / this.errorHistory.length 
        : 0
    };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create error handler instance
 */
export function createErrorHandler(config?: Partial<ErrorHandlerConfig>): ErrorHandler {
  return new ErrorHandler(config);
}

/**
 * Node-specific error handlers
 */
export const nodeErrorHandlers: Record<string, (error: Error) => ErrorAction> = {
  // YOLO detection errors
  yolo_detection: (error: Error) => {
    if (error.message.includes('model not found')) {
      return { type: 'abort', cleanup: true };
    }
    if (error.message.includes('timeout')) {
      return { type: 'retry', maxRetries: 3, delay: 2000 };
    }
    return { type: 'skip', continueWorkflow: true };
  },

  // UniPixel segmentation errors
  unipixel_segmentation: (error: Error) => {
    if (error.message.includes('service unavailable') || error.message.includes('not available')) {
      return { type: 'fallback' };
    }
    if (error.message.includes('timeout')) {
      return { type: 'retry', maxRetries: 2, delay: 3000 };
    }
    return { type: 'skip', continueWorkflow: true };
  },

  // PureChat errors
  purechat_chat: (error: Error) => {
    if (error.message.includes('API key') || error.message.includes('authentication')) {
      return { type: 'abort', cleanup: true };
    }
    if (error.message.includes('rate limit')) {
      return { type: 'retry', maxRetries: 3, delay: 5000 };
    }
    return { type: 'retry', maxRetries: 2, delay: 2000 };
  },

  purechat_image_analysis: (error: Error) => {
    if (error.message.includes('image')) {
      return { type: 'skip', continueWorkflow: true };
    }
    return { type: 'retry', maxRetries: 2, delay: 2000 };
  },

  // Challenge task errors
  challenge_8_flight: (error: Error) => {
    return { type: 'skip', continueWorkflow: true };
  },

  challenge_obstacle: (error: Error) => {
    return { type: 'skip', continueWorkflow: true };
  },

  challenge_precision_land: (error: Error) => {
    return { type: 'skip', continueWorkflow: true };
  },

  // Critical control errors
  takeoff: (error: Error) => {
    return { type: 'abort', cleanup: true };
  },

  land: (error: Error) => {
    return { type: 'retry', maxRetries: 5, delay: 2000 };
  }
};

