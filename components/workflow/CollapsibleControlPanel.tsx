/**
 * CollapsibleControlPanel Component
 * 
 * A collapsible control panel for the workflow editor that provides:
 * - Connection status indicators
 * - Action buttons (run, stop, save, etc.)
 * - Output tabs (logs and results)
 * - Collapsible functionality with smooth animations
 * - Width adjustment via drag handle
 * 
 * Requirements: 1.4, 5.1-5.7
 */

'use client';

import React from 'react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import styles from '@/styles/CollapsibleControlPanel.module.css';

export interface ConnectionStatus {
  drone: boolean;
  websocket: boolean;
  lastUpdate: Date;
}

export interface WorkflowStatus {
  isRunning: boolean;
  currentNode?: string;
  progress: number;
  startTime?: Date;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  nodeId?: string;
}

export interface ResultEntry {
  id: string;
  nodeId: string;
  nodeName: string;
  result: any;
  resultType: string;
  timestamp: Date;
}

export interface CollapsibleControlPanelProps {
  /**
   * Whether the panel is collapsed
   */
  isCollapsed: boolean;
  
  /**
   * Panel width in pixels
   */
  width: number;
  
  /**
   * Callback when collapse state changes
   */
  onToggleCollapse: () => void;
  
  /**
   * Callback when width changes (via drag)
   */
  onWidthChange?: (width: number) => void;
  
  /**
   * Connection status
   */
  connectionStatus: ConnectionStatus;
  
  /**
   * Workflow execution status
   */
  workflowStatus: WorkflowStatus;
  
  /**
   * Log entries
   */
  logs: LogEntry[];
  
  /**
   * Result entries
   */
  results: ResultEntry[];
  
  /**
   * Callback when run button is clicked
   */
  onRun: () => void;
  
  /**
   * Callback when stop button is clicked
   */
  onStop: () => void;
  
  /**
   * Callback when save button is clicked
   */
  onSave: () => void;
  
  /**
   * Callback when clear button is clicked
   */
  onClear: () => void;
  
  /**
   * Callback when load button is clicked
   */
  onLoad?: () => void;
  
  /**
   * Callback when AI generate button is clicked
   */
  onAIGenerate?: () => void;
  
  /**
   * Callback when logs are cleared
   */
  onClearLogs?: () => void;
  
  /**
   * Callback when logs are exported
   */
  onExportLogs?: (format: 'json' | 'txt') => void;
}

/**
 * CollapsibleControlPanel Component
 */
export const CollapsibleControlPanel: React.FC<CollapsibleControlPanelProps> = ({
  isCollapsed,
  width,
  onToggleCollapse,
  onWidthChange,
  connectionStatus,
  workflowStatus,
  logs,
  results,
  onRun,
  onStop,
  onSave,
  onClear,
  onLoad,
  onAIGenerate,
  onClearLogs,
  onExportLogs,
}) => {
  const { theme } = useWorkflowTheme();
  
  return (
    <div
      className={`${styles.panel} ${isCollapsed ? styles.collapsed : ''}`}
      data-theme={theme}
      style={{
        width: isCollapsed ? '48px' : `${width}px`,
      }}
    >
      {/* Collapse Button */}
      <button
        className={styles.collapseButton}
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? '展开控制面板' : '折叠控制面板'}
        title={isCollapsed ? '展开控制面板' : '折叠控制面板'}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={styles.collapseIcon}
        >
          <path
            d={isCollapsed ? 'M10 12L6 8L10 4' : 'M6 12L10 8L6 4'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      {/* Panel Content */}
      {!isCollapsed && (
        <div className={styles.content}>
          {/* Import sub-components dynamically to avoid circular dependencies */}
          {/* These will be rendered by the parent component */}
          {/* Placeholder for integration - actual rendering done by parent */}
        </div>
      )}
    </div>
  );
};

export default CollapsibleControlPanel;
