'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';

interface VersionConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onRetry: () => void;
  assistantTitle?: string;
}

export const VersionConflictDialog: React.FC<VersionConflictDialogProps> = ({
  isOpen,
  onClose,
  onRefresh,
  onRetry,
  assistantTitle,
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      backdrop="blur"
      classNames={{
        base: "bg-white dark:bg-gray-800",
        header: "border-b border-gray-200 dark:border-gray-700",
        body: "py-6",
        footer: "border-t border-gray-200 dark:border-gray-700",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <span className="text-lg font-semibold">版本冲突</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              {assistantTitle ? (
                <>
                  助理 <span className="font-semibold">"{assistantTitle}"</span> 已被其他用户修改。
                </>
              ) : (
                '该助理已被其他用户修改。'
              )}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              为了避免覆盖其他用户的更改，请选择以下操作：
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span><strong>刷新数据：</strong>查看最新版本（推荐）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span><strong>重试：</strong>尝试再次保存您的更改</span>
                </li>
              </ul>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={onClose}
          >
            取消
          </Button>
          <Button
            color="primary"
            variant="flat"
            onPress={() => {
              onRetry();
              onClose();
            }}
          >
            重试
          </Button>
          <Button
            color="primary"
            onPress={() => {
              onRefresh();
              onClose();
            }}
          >
            刷新数据
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
