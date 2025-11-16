/**
 * 助理表单错误处理服务
 * 
 * 功能：
 * - 统一的错误类型定义
 * - 错误恢复策略（重试、保存草稿）
 * - 用户友好的错误消息生成
 * 
 * Requirements: 1.3, 4.4
 */

import { AssistantFormData, draftManager } from './assistantDraftManager';

/**
 * 错误类型枚举
 */
export enum AssistantErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 错误接口
 */
export interface AssistantError {
  type: AssistantErrorType;
  message: string;
  field?: keyof AssistantFormData;
  details?: any;
  recoverable?: boolean;
}

/**
 * 错误恢复选项
 */
export interface ErrorRecoveryOptions {
  retry?: boolean;
  saveDraft?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * 错误处理结果
 */
export interface ErrorHandlingResult {
  recovered: boolean;
  message: string;
  action?: 'retry' | 'draft_saved' | 'manual_intervention';
}

/**
 * 助理错误处理服务类
 */
export class AssistantErrorHandler {
  private retryCount: Map<string, number> = new Map();
  
  /**
   * 从原始错误创建 AssistantError
   */
  createError(error: any, context?: string): AssistantError {
    // 网络错误
    if (error.name === 'NetworkError' || error.message?.includes('fetch') || error.message?.includes('network')) {
      return {
        type: AssistantErrorType.NETWORK_ERROR,
        message: '网络连接失败，请检查您的网络连接',
        details: error,
        recoverable: true
      };
    }
    
    // 权限错误
    if (error.status === 403 || error.message?.includes('permission') || error.message?.includes('unauthorized')) {
      return {
        type: AssistantErrorType.PERMISSION_ERROR,
        message: '您没有权限执行此操作',
        details: error,
        recoverable: false
      };
    }
    
    // 冲突错误
    if (error.status === 409 || error.message?.includes('conflict')) {
      return {
        type: AssistantErrorType.CONFLICT_ERROR,
        message: '数据已被其他用户修改，请刷新后重试',
        details: error,
        recoverable: true
      };
    }
    
    // 服务器错误
    if (error.status >= 500 || error.message?.includes('server')) {
      return {
        type: AssistantErrorType.SERVER_ERROR,
        message: '服务器错误，请稍后重试',
        details: error,
        recoverable: true
      };
    }
    
    // 验证错误
    if (error.type === 'validation' || error.message?.includes('validation')) {
      return {
        type: AssistantErrorType.VALIDATION_ERROR,
        message: error.message || '表单验证失败，请检查输入',
        field: error.field,
        details: error,
        recoverable: false
      };
    }
    
    // 未知错误
    return {
      type: AssistantErrorType.UNKNOWN_ERROR,
      message: error.message || '发生未知错误，请重试',
      details: error,
      recoverable: true
    };
  }
  
  /**
   * 处理错误并尝试恢复
   */
  async handleError(
    error: AssistantError,
    formData: AssistantFormData,
    options: ErrorRecoveryOptions = {}
  ): Promise<ErrorHandlingResult> {
    const {
      retry = true,
      saveDraft = true,
      maxRetries = 3,
      retryDelay = 1000
    } = options;
    
    // 验证错误和权限错误不可恢复
    if (error.type === AssistantErrorType.VALIDATION_ERROR || 
        error.type === AssistantErrorType.PERMISSION_ERROR) {
      return {
        recovered: false,
        message: error.message,
        action: 'manual_intervention'
      };
    }
    
    // 尝试重试
    if (retry && error.recoverable) {
      const retryKey = `${error.type}_${Date.now()}`;
      const currentRetries = this.retryCount.get(retryKey) || 0;
      
      if (currentRetries < maxRetries) {
        this.retryCount.set(retryKey, currentRetries + 1);
        
        // 等待后重试
        await this.delay(retryDelay * Math.pow(2, currentRetries));
        
        return {
          recovered: false,
          message: `正在重试... (${currentRetries + 1}/${maxRetries})`,
          action: 'retry'
        };
      }
    }
    
    // 保存草稿作为最后的恢复手段
    if (saveDraft) {
      try {
        draftManager.saveDraft(formData);
        return {
          recovered: true,
          message: '操作失败，但您的数据已保存为草稿',
          action: 'draft_saved'
        };
      } catch (draftError) {
        console.error('[ErrorHandler] Failed to save draft:', draftError);
      }
    }
    
    return {
      recovered: false,
      message: error.message,
      action: 'manual_intervention'
    };
  }
  
  /**
   * 带重试的异步操作执行器
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    formData: AssistantFormData,
    options: ErrorRecoveryOptions = {}
  ): Promise<T> {
    const { maxRetries = 3, retryDelay = 1000 } = options;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        const assistantError = this.createError(error);
        
        // 最后一次尝试或不可恢复的错误
        if (attempt === maxRetries - 1 || !assistantError.recoverable) {
          // 保存草稿
          if (assistantError.type !== AssistantErrorType.VALIDATION_ERROR) {
            try {
              draftManager.saveDraft(formData);
            } catch (draftError) {
              console.error('[ErrorHandler] Failed to save draft:', draftError);
            }
          }
          throw assistantError;
        }
        
        // 等待后重试
        await this.delay(retryDelay * Math.pow(2, attempt));
      }
    }
    
    throw new Error('Max retries exceeded');
  }
  
  /**
   * 获取用户友好的错误消息
   */
  getUserFriendlyMessage(error: AssistantError): string {
    const baseMessage = error.message;
    
    switch (error.type) {
      case AssistantErrorType.NETWORK_ERROR:
        return `${baseMessage}\n\n建议：\n• 检查网络连接\n• 刷新页面重试\n• 您的数据已自动保存为草稿`;
        
      case AssistantErrorType.PERMISSION_ERROR:
        return `${baseMessage}\n\n如需帮助，请联系管理员`;
        
      case AssistantErrorType.CONFLICT_ERROR:
        return `${baseMessage}\n\n建议：\n• 刷新页面获取最新数据\n• 重新编辑并保存`;
        
      case AssistantErrorType.SERVER_ERROR:
        return `${baseMessage}\n\n建议：\n• 稍后重试\n• 如问题持续，请联系技术支持\n• 您的数据已自动保存为草稿`;
        
      case AssistantErrorType.VALIDATION_ERROR:
        return `${baseMessage}\n\n请检查表单中标红的字段`;
        
      default:
        return `${baseMessage}\n\n如问题持续，请联系技术支持`;
    }
  }
  
  /**
   * 清除重试计数
   */
  clearRetryCount(): void {
    this.retryCount.clear();
  }
  
  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例实例
export const assistantErrorHandler = new AssistantErrorHandler();
