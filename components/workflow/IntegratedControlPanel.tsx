/**
 * IntegratedControlPanel Component
 * 
 * Fully integrated control panel that combines all sub-components:
 * - ControlPanelHeader (connection status)
 * - ActionButtons (run, stop, save, etc.)
 * - OutputTabs (logs and results)
 * - LogList (with export buttons)
 * - ResultList
 * 
 * This is the complete implementation of task 6.
 */

'use client';

import React from 'react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import ControlPanelHeader, { ConnectionStatus } from './ControlPanelHeader';
import ActionButtons from './ActionButtons';
import OutputTabs, { LogEntry, ResultEntry } from './OutputTabs';
import LogList from './LogList';
import ResultList from './ResultList';
import LogExportButtons from './LogExportButtons';
import styles from '@/styles/IntegratedControlPanel.module.css';

export interface WorkflowStatus {
  isRunning: boolean;
  currentNode?: string;
  progress: number;
  startTime?: Date;
}

export interface IntegratedControlPanelProps {
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
   * Whether there are unsaved changes
   */
  hasUnsavedChanges?: boolean;
  
  /**
   * Whether the workflow is empty
   */
  isEmpty?: boolean;
  
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
   * Callback when a result is clicked
   */
  onResultClick?: (result: ResultEntry) => void;
}

/**
 * IntegratedControlPanel Component
 */
export const IntegratedControlPanel: React.FC<IntegratedControlPanelProps> = ({
  isCollapsed,
  width,
  onToggleCollapse,
  connectionStatus,
  workflowStatus,
  logs,
  results,
  hasUnsavedChanges = false,
  isEmpty = false,
  onRun,
  onStop,
  onSave,
  onClear,
  onLoad,
  onAIGenerate,
  onClearLogs,
  onResultClick,
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
          {/* Header with Connection Status */}
          <ControlPanelHeader
            connectionStatus={connectionStatus}
            title="控制面板"
          />
          
          {/* Action Buttons */}
          <ActionButtons
            isRunning={workflowStatus.isRunning}
            hasUnsavedChanges={hasUnsavedChanges}
            isEmpty={isEmpty}
            onRun={onRun}
            onStop={onStop}
            onSave={onSave}
            onLoad={onLoad}
            onClear={onClear}
            onAIGenerate={onAIGenerate}
          />
          
          {/* Output Tabs with Logs and Results */}
          <OutputTabs
            logs={logs}
            results={results}
            logsContent={
              <div className={styles.logsContainer}>
                <LogList logs={logs} autoScroll={true} />
                {onClearLogs && (
                  <LogExportButtons
                    logs={logs}
                    onClearLogs={onClearLogs}
                    isEmpty={logs.length === 0}
                  />
                )}
              </div>
            }
            resultsContent={
              <ResultList
                results={results}
                onResultClick={onResultClick}
              />
            }
          />
        </div>
      )}
    </div>
  );
};

export default IntegratedControlPanel;
