/**
 * Update Notification Component
 * 
 * Displays update notifications for assistants, including:
 * - "Updated" badge on assistant cards
 * - Update details modal
 * - Update history viewer
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Badge,
  Chip,
  Card,
  CardBody,
  Divider,
  Tooltip,
} from '@heroui/react';
import { UpdateLog, UpdateLogService } from '@/lib/services/updateLogService';

// ============================================================================
// Types
// ============================================================================

interface UpdateNotificationProps {
  assistantId: string;
  userId: string;
  showBadge?: boolean;
  onUpdateRead?: () => void;
}

interface UpdateHistoryModalProps {
  assistantId: string;
  assistantTitle: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface UpdateDetailCardProps {
  update: UpdateLog;
  isRead: boolean;
  onMarkAsRead: () => void;
}

// ============================================================================
// Update Badge Component
// ============================================================================

/**
 * Badge that shows "Updated" indicator on assistant cards
 */
export const UpdateBadge: React.FC<{ hasUpdate: boolean }> = ({ hasUpdate }) => {
  if (!hasUpdate) {
    return null;
  }

  return (
    <Tooltip content="此助理已更新">
      <Badge
        content="已更新"
        color="primary"
        variant="solid"
        size="sm"
        className="animate-pulse"
      >
        <div className="w-2 h-2" />
      </Badge>
    </Tooltip>
  );
};

// ============================================================================
// Update Detail Card Component
// ============================================================================

/**
 * Card displaying details of a single update
 */
const UpdateDetailCard: React.FC<UpdateDetailCardProps> = ({
  update,
  isRead,
  onMarkAsRead,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getChangeTypeLabel = (type: string) => {
    const labels: Record<string, { text: string; color: any }> = {
      created: { text: '创建', color: 'success' },
      updated: { text: '更新', color: 'primary' },
      deleted: { text: '删除', color: 'danger' },
    };
    return labels[type] || { text: type, color: 'default' };
  };

  const changeType = getChangeTypeLabel(update.changeType);

  return (
    <Card className={`mb-4 ${!isRead ? 'border-2 border-primary' : ''}`}>
      <CardBody>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Chip color={changeType.color} size="sm" variant="flat">
              {changeType.text}
            </Chip>
            <span className="text-sm text-default-500">
              版本 {update.previousVersion} → {update.version}
            </span>
            {!isRead && (
              <Chip color="primary" size="sm" variant="dot">
                未读
              </Chip>
            )}
          </div>
          <span className="text-xs text-default-400">
            {formatDate(update.createdAt)}
          </span>
        </div>

        <div className="mb-3">
          <h4 className="text-sm font-semibold mb-2">更新内容：</h4>
          <div className="text-sm text-default-600 whitespace-pre-line">
            {update.changelog}
          </div>
        </div>

        {update.changes.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-semibold mb-2">详细变更：</h4>
            <div className="space-y-1">
              {update.changes.map((change, index) => (
                <div key={index} className="text-xs text-default-500 pl-4">
                  • {change.field}
                  {change.oldValue !== undefined && change.newValue !== undefined && (
                    <span className="ml-2 text-default-400">
                      (已修改)
                    </span>
                  )}
                  {change.oldValue === undefined && (
                    <span className="ml-2 text-success">(新增)</span>
                  )}
                  {change.newValue === undefined && (
                    <span className="ml-2 text-danger">(删除)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isRead && (
          <div className="flex justify-end">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onPress={onMarkAsRead}
            >
              标记为已读
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// ============================================================================
// Update History Modal Component
// ============================================================================

/**
 * Modal displaying update history for an assistant
 */
export const UpdateHistoryModal: React.FC<UpdateHistoryModalProps> = ({
  assistantId,
  assistantTitle,
  userId,
  isOpen,
  onClose,
}) => {
  const [updates, setUpdates] = useState<UpdateLog[]>([]);
  const [readStatus, setReadStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUpdates();
    }
  }, [isOpen, assistantId]);

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const logs = await UpdateLogService.getUpdateLogsByAssistant(assistantId);
      setUpdates(logs);

      // Load read status for each update
      const status: Record<number, boolean> = {};
      for (const log of logs) {
        const isRead = await UpdateLogService.isUpdateRead(userId, log.id);
        status[log.id] = isRead;
      }
      setReadStatus(status);
    } catch (error) {
      console.error('[UpdateHistoryModal] Failed to load updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (updateId: number) => {
    try {
      await UpdateLogService.markAsRead(userId, updateId);
      setReadStatus(prev => ({ ...prev, [updateId]: true }));
    } catch (error) {
      console.error('[UpdateHistoryModal] Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = updates
        .filter(update => !readStatus[update.id])
        .map(update => update.id);
      
      if (unreadIds.length > 0) {
        await UpdateLogService.markMultipleAsRead(userId, unreadIds);
        const newStatus = { ...readStatus };
        unreadIds.forEach(id => {
          newStatus[id] = true;
        });
        setReadStatus(newStatus);
      }
    } catch (error) {
      console.error('[UpdateHistoryModal] Failed to mark all as read:', error);
    }
  };

  const unreadCount = Object.values(readStatus).filter(isRead => !isRead).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: 'max-h-[90vh]',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>{assistantTitle} - 更新历史</span>
            {unreadCount > 0 && (
              <Chip color="primary" size="sm">
                {unreadCount} 条未读
              </Chip>
            )}
          </div>
        </ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-8 text-default-400">
              暂无更新记录
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map(update => (
                <UpdateDetailCard
                  key={update.id}
                  update={update}
                  isRead={readStatus[update.id] || false}
                  onMarkAsRead={() => handleMarkAsRead(update.id)}
                />
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {unreadCount > 0 && (
            <Button
              color="primary"
              variant="flat"
              onPress={handleMarkAllAsRead}
            >
              全部标记为已读
            </Button>
          )}
          <Button color="default" variant="light" onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ============================================================================
// Main Update Notification Component
// ============================================================================

/**
 * Main component that manages update notifications for an assistant
 */
export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  assistantId,
  userId,
  showBadge = true,
  onUpdateRead,
}) => {
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [assistantTitle, setAssistantTitle] = useState('');

  useEffect(() => {
    checkForUpdates();
  }, [assistantId, userId]);

  const checkForUpdates = async () => {
    try {
      const updates = await UpdateLogService.getUpdateLogsByAssistant(assistantId);
      
      if (updates.length === 0) {
        setHasUnreadUpdates(false);
        return;
      }

      // Check if any updates are unread
      let hasUnread = false;
      for (const update of updates) {
        const isRead = await UpdateLogService.isUpdateRead(userId, update.id);
        if (!isRead) {
          hasUnread = true;
          break;
        }
      }

      setHasUnreadUpdates(hasUnread);
    } catch (error) {
      console.error('[UpdateNotification] Failed to check for updates:', error);
    }
  };

  const handleShowHistory = () => {
    setShowHistoryModal(true);
  };

  const handleCloseHistory = () => {
    setShowHistoryModal(false);
    checkForUpdates(); // Refresh update status
    onUpdateRead?.();
  };

  if (!showBadge && !hasUnreadUpdates) {
    return null;
  }

  return (
    <>
      {showBadge && hasUnreadUpdates && (
        <div className="cursor-pointer" onClick={handleShowHistory}>
          <UpdateBadge hasUpdate={hasUnreadUpdates} />
        </div>
      )}

      <UpdateHistoryModal
        assistantId={assistantId}
        assistantTitle={assistantTitle}
        userId={userId}
        isOpen={showHistoryModal}
        onClose={handleCloseHistory}
      />
    </>
  );
};

// ============================================================================
// Update Notification List Component
// ============================================================================

/**
 * Component that displays a list of all unread updates
 */
export const UpdateNotificationList: React.FC<{ userId: string }> = ({ userId }) => {
  const [updates, setUpdates] = useState<UpdateLog[]>([]);
  const [readStatus, setReadStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUnreadUpdates();
  }, [userId]);

  const loadUnreadUpdates = async () => {
    setLoading(true);
    try {
      const unreadUpdates = await UpdateLogService.getUnreadUpdates(userId, 10);
      setUpdates(unreadUpdates);

      const status: Record<number, boolean> = {};
      unreadUpdates.forEach(update => {
        status[update.id] = false;
      });
      setReadStatus(status);
    } catch (error) {
      console.error('[UpdateNotificationList] Failed to load updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (updateId: number) => {
    try {
      await UpdateLogService.markAsRead(userId, updateId);
      setReadStatus(prev => ({ ...prev, [updateId]: true }));
      // Remove from list after marking as read
      setUpdates(prev => prev.filter(update => update.id !== updateId));
    } catch (error) {
      console.error('[UpdateNotificationList] Failed to mark as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-8 text-default-400">
        没有未读更新
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">未读更新</h3>
        <Chip color="primary" size="sm">
          {updates.length} 条
        </Chip>
      </div>
      {updates.map(update => (
        <UpdateDetailCard
          key={update.id}
          update={update}
          isRead={false}
          onMarkAsRead={() => handleMarkAsRead(update.id)}
        />
      ))}
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default UpdateNotification;
