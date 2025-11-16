'use client';

/**
 * NotificationContainer Component
 * 
 * 显示全局通知消息的容器组件
 * 
 * Features:
 * - 支持多种通知类型（成功、错误、警告、信息）
 * - 自动关闭和手动关闭
 * - 支持操作按钮
 * - 响应式设计
 * 
 * Requirements: 4.4
 */

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { notificationService, Notification, NotificationType } from '@/lib/services/notificationService';

const NotificationItem: React.FC<{
  notification: Notification;
  onDismiss: (id: string) => void;
}> = ({ notification, onDismiss }) => {
  const getColorClass = (type: NotificationType): string => {
    switch (type) {
      case 'success':
        return 'border-success-500 bg-success-50 dark:bg-success-900/20';
      case 'error':
        return 'border-danger-500 bg-danger-50 dark:bg-danger-900/20';
      case 'warning':
        return 'border-warning-500 bg-warning-50 dark:bg-warning-900/20';
      case 'info':
      default:
        return 'border-primary-500 bg-primary-50 dark:bg-primary-900/20';
    }
  };
  
  const getTextColorClass = (type: NotificationType): string => {
    switch (type) {
      case 'success':
        return 'text-success-700 dark:text-success-300';
      case 'error':
        return 'text-danger-700 dark:text-danger-300';
      case 'warning':
        return 'text-warning-700 dark:text-warning-300';
      case 'info':
      default:
        return 'text-primary-700 dark:text-primary-300';
    }
  };
  
  const getIcon = (type: NotificationType): string => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };
  
  return (
    <Card
      className={`border-l-4 ${getColorClass(notification.type)} shadow-lg animate-slide-in-right`}
    >
      <CardHeader className="flex justify-between items-start pb-2">
        <div className="flex items-start gap-2 flex-1">
          <span className={`text-xl ${getTextColorClass(notification.type)}`}>
            {getIcon(notification.type)}
          </span>
          <div className="flex-1">
            {notification.title && (
              <h4 className={`font-semibold ${getTextColorClass(notification.type)}`}>
                {notification.title}
              </h4>
            )}
          </div>
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => onDismiss(notification.id)}
          className="min-w-unit-6 w-6 h-6"
        >
          ✕
        </Button>
      </CardHeader>
      
      <CardBody className="pt-0">
        <p className={`text-sm whitespace-pre-line ${getTextColorClass(notification.type)}`}>
          {notification.message}
        </p>
        
        {notification.action && (
          <div className="mt-3">
            <Button
              size="sm"
              color={notification.type === 'error' ? 'danger' : 'primary'}
              variant="flat"
              onPress={() => {
                notification.action?.onClick();
                onDismiss(notification.id);
              }}
            >
              {notification.action.label}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    // 订阅通知变更
    const unsubscribe = notificationService.subscribe(setNotifications);
    
    // 初始化时获取现有通知
    setNotifications(notificationService.getAll());
    
    return unsubscribe;
  }, []);
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={notificationService.dismiss.bind(notificationService)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
