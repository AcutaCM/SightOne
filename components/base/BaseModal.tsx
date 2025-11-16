"use client";

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';

export interface BaseModalProps {
  /** 是否打开 */
  isOpen: boolean;
  /** 打开状态变化回调 */
  onOpenChange: (isOpen: boolean) => void;
  /** 模态框标题 */
  title: string;
  /** 模态框内容 */
  children: React.ReactNode;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 确认按钮回调 */
  onConfirm?: () => void | Promise<void>;
  /** 取消按钮回调 */
  onCancel?: () => void;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 是否显示确认按钮 */
  showConfirm?: boolean;
  /** 确认按钮颜色 */
  confirmColor?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** 确认按钮变体 */
  confirmVariant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  /** 是否加载中 */
  isLoading?: boolean;
  /** 模态框尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  /** 滚动行为 */
  scrollBehavior?: 'inside' | 'outside' | 'normal';
  /** 是否可关闭 */
  isDismissable?: boolean;
  /** 点击外部是否关闭 */
  isKeyboardDismissDisabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义页脚 */
  footer?: React.ReactNode;
  /** 是否隐藏关闭按钮 */
  hideCloseButton?: boolean;
}

/**
 * 统一的模态框基础组件
 * 基于 HeroUI Modal 构建，提供标准化的模态框布局
 */
export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  children,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  showCancel = true,
  showConfirm = true,
  confirmColor = 'primary',
  confirmVariant = 'solid',
  isLoading = false,
  size = 'md',
  scrollBehavior = 'inside',
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  className = '',
  footer,
  hideCloseButton = false,
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size={size}
      scrollBehavior={scrollBehavior}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      hideCloseButton={hideCloseButton}
      className={className}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {title}
            </ModalHeader>

            <ModalBody>
              {children}
            </ModalBody>

            {footer !== undefined ? (
              <ModalFooter>{footer}</ModalFooter>
            ) : (
              (showCancel || showConfirm) && (
                <ModalFooter>
                  {showCancel && (
                    <Button
                      variant="light"
                      onPress={handleCancel}
                      isDisabled={isLoading}
                    >
                      {cancelText}
                    </Button>
                  )}
                  {showConfirm && (
                    <Button
                      color={confirmColor}
                      variant={confirmVariant}
                      onPress={handleConfirm}
                      isLoading={isLoading}
                    >
                      {confirmText}
                    </Button>
                  )}
                </ModalFooter>
              )
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BaseModal;
