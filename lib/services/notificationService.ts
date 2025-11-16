/**
 * 通知服务
 * 
 * 功能：
 * - 显示成功、错误、警告、信息消息
 * - 支持自动关闭和手动关闭
 * - 支持操作按钮（如重试）
 * 
 * Requirements: 4.4
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title?: string;
  message: string;
  type: NotificationType;
  duration?: number; // 毫秒，0 表示不自动关闭
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export interface Notification extends NotificationOptions {
  id: string;
  timestamp: number;
}

/**
 * 通知管理器类
 */
class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private nextId = 1;
  
  /**
   * 显示通知
   */
  show(options: Omit<NotificationOptions, 'type'> & { type?: NotificationType }): string {
    const notification: Notification = {
      id: `notification-${this.nextId++}`,
      timestamp: Date.now(),
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration ?? 5000,
      action: options.action,
      onClose: options.onClose
    };
    
    this.notifications.push(notification);
    this.notifyListeners();
    
    // 自动关闭
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }
    
    return notification.id;
  }
  
  /**
   * 显示成功消息
   */
  success(message: string, options?: Partial<NotificationOptions>): string {
    return this.show({
      ...options,
      message,
      type: 'success'
    });
  }
  
  /**
   * 显示错误消息
   */
  error(message: string, options?: Partial<NotificationOptions>): string {
    return this.show({
      ...options,
      message,
      type: 'error',
      duration: options?.duration ?? 0 // 错误消息默认不自动关闭
    });
  }
  
  /**
   * 显示警告消息
   */
  warning(message: string, options?: Partial<NotificationOptions>): string {
    return this.show({
      ...options,
      message,
      type: 'warning'
    });
  }
  
  /**
   * 显示信息消息
   */
  info(message: string, options?: Partial<NotificationOptions>): string {
    return this.show({
      ...options,
      message,
      type: 'info'
    });
  }
  
  /**
   * 关闭通知
   */
  dismiss(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification?.onClose) {
      notification.onClose();
    }
    
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }
  
  /**
   * 关闭所有通知
   */
  dismissAll(): void {
    this.notifications.forEach(n => {
      if (n.onClose) {
        n.onClose();
      }
    });
    
    this.notifications = [];
    this.notifyListeners();
  }
  
  /**
   * 获取所有通知
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }
  
  /**
   * 订阅通知变更
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    const notifications = this.getAll();
    this.listeners.forEach(listener => {
      listener(notifications);
    });
  }
}

// 导出单例实例
export const notificationService = new NotificationManager();
