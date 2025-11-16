/**
 * LogExportButtons Component
 * 
 * Buttons for log management:
 * - Clear logs button
 * - Export logs button (JSON/TXT)
 * - Log download functionality
 * 
 * Requirements: 5.7
 */

'use client';

import React, { useState } from 'react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import styles from '@/styles/LogExportButtons.module.css';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  nodeId?: string;
}

export interface LogExportButtonsProps {
  /**
   * Log entries to export
   */
  logs: LogEntry[];
  
  /**
   * Callback when clear logs is clicked
   */
  onClearLogs: () => void;
  
  /**
   * Whether logs are empty
   */
  isEmpty?: boolean;
}

/**
 * Export logs as JSON
 */
function exportLogsAsJSON(logs: LogEntry[]): void {
  const data = JSON.stringify(logs, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `workflow-logs-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export logs as TXT
 */
function exportLogsAsTXT(logs: LogEntry[]): void {
  const lines = logs.map((log) => {
    const timestamp = log.timestamp.toISOString();
    const level = log.level.toUpperCase().padEnd(8);
    const nodeId = log.nodeId ? `[${log.nodeId}]` : '';
    return `${timestamp} ${level} ${nodeId} ${log.message}`;
  });
  
  const data = lines.join('\n');
  const blob = new Blob([data], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `workflow-logs-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * LogExportButtons Component
 */
export const LogExportButtons: React.FC<LogExportButtonsProps> = ({
  logs,
  onClearLogs,
  isEmpty = false,
}) => {
  const { theme } = useWorkflowTheme();
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const handleExportJSON = () => {
    exportLogsAsJSON(logs);
    setShowExportMenu(false);
  };
  
  const handleExportTXT = () => {
    exportLogsAsTXT(logs);
    setShowExportMenu(false);
  };
  
  const handleClearLogs = () => {
    if (window.confirm('确定要清空所有日志吗?此操作不可撤销。')) {
      onClearLogs();
    }
  };
  
  return (
    <div className={styles.container} data-theme={theme}>
      {/* Clear Logs Button */}
      <button
        className={`${styles.button} ${styles.clearButton}`}
        onClick={handleClearLogs}
        disabled={isEmpty}
        aria-label="清空日志"
        title="清空日志"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={styles.buttonIcon}
        >
          <path
            d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={styles.buttonText}>清空</span>
      </button>
      
      {/* Export Logs Button with Dropdown */}
      <div className={styles.exportContainer}>
        <button
          className={`${styles.button} ${styles.exportButton}`}
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={isEmpty}
          aria-label="导出日志"
          title="导出日志"
          aria-expanded={showExportMenu}
          aria-haspopup="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={styles.buttonIcon}
          >
            <path
              d="M8 2V10M8 10L11 7M8 10L5 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 12V13C3 13.5523 3.44772 14 4 14H12C12.5523 14 13 13.5523 13 13V12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.buttonText}>导出</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`${styles.chevron} ${showExportMenu ? styles.chevronUp : ''}`}
          >
            <path
              d="M3 5L6 8L9 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        {/* Export Menu */}
        {showExportMenu && (
          <>
            <div
              className={styles.overlay}
              onClick={() => setShowExportMenu(false)}
            />
            <div className={styles.exportMenu}>
              <button
                className={styles.menuItem}
                onClick={handleExportJSON}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={styles.menuIcon}
                >
                  <path
                    d="M4 3H12C12.5523 3 13 3.44772 13 4V12C13 12.5523 12.5523 13 12 13H4C3.44772 13 3 12.5523 3 12V4C3 3.44772 3.44772 3 4 3Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6 6H10M6 8H10M6 10H8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>导出为 JSON</span>
              </button>
              <button
                className={styles.menuItem}
                onClick={handleExportTXT}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={styles.menuIcon}
                >
                  <path
                    d="M4 3H12C12.5523 3 13 3.44772 13 4V12C13 12.5523 12.5523 13 12 13H4C3.44772 13 3 12.5523 3 12V4C3 3.44772 3.44772 3 4 3Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6 6H10M6 8H10M6 10H10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>导出为 TXT</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LogExportButtons;
