/**
 * AI Config Sync Status Display Component
 * 
 * Task 6: Displays AI configuration sync status with visual feedback
 * Shows connection state, sync progress, and configuration details
 */

'use client';

import React from 'react';
import { useAIConfigSync } from '@/hooks/useAIConfigSync';
import { useAssistants } from '@/contexts/AssistantContext';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface AIConfigSyncStatusDisplayProps {
  /**
   * Show detailed status information
   * @default false
   */
  showDetails?: boolean;
  
  /**
   * Custom className for styling
   */
  className?: string;
}

/**
 * Component that displays AI configuration sync status
 * Automatically monitors AssistantContext and syncs AI config
 */
export const AIConfigSyncStatusDisplay: React.FC<AIConfigSyncStatusDisplayProps> = ({
  showDetails = false,
  className = '',
}) => {
  const { activeAssistant } = useAssistants();
  
  // Task 6: Use enhanced hook with automatic assistant monitoring
  const {
    isConnected,
    syncStatus,
    isSyncing,
    syncError,
  } = useAIConfigSync({
    autoConnect: true,
    autoSync: true,
    activeAssistant, // Automatically sync when this changes
    onSyncStatusChange: (status) => {
      console.log('[AIConfigSyncStatusDisplay] Sync status changed:', status);
    },
    onSyncComplete: (result) => {
      if (result.success) {
        console.log('[AIConfigSyncStatusDisplay] Sync completed successfully');
      } else {
        console.error('[AIConfigSyncStatusDisplay] Sync failed:', result.error);
      }
    },
  });

  // Determine status icon and color
  const getStatusIcon = () => {
    if (isSyncing) {
      return <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-500" />;
    }
    
    if (!isConnected) {
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    }
    
    if (syncStatus.configured) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
    
    return <XCircleIcon className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (isSyncing) {
      return '正在同步 AI 配置...';
    }
    
    if (!isConnected) {
      return '未连接到后端';
    }
    
    if (syncError) {
      return `同步失败: ${syncError}`;
    }
    
    if (syncStatus.configured) {
      return `已配置: ${syncStatus.provider} - ${syncStatus.model}`;
    }
    
    return '未配置 AI';
  };

  const getStatusColor = () => {
    if (isSyncing) return 'text-blue-600';
    if (!isConnected) return 'text-red-600';
    if (syncError) return 'text-red-600';
    if (syncStatus.configured) return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Icon */}
      {getStatusIcon()}
      
      {/* Status Text */}
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        
        {/* Detailed Information */}
        {showDetails && syncStatus.configured && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {syncStatus.supportsVision && (
              <span className="mr-2">✓ 支持视觉</span>
            )}
            {syncStatus.lastSyncTime && (
              <span>
                最后同步: {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
        
        {/* Active Assistant Info */}
        {showDetails && activeAssistant && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            当前助理: {activeAssistant.emoji} {activeAssistant.title}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIConfigSyncStatusDisplay;
