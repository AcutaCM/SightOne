/**
 * LogList Component
 * 
 * Log list component with:
 * - Hierarchical log display with color coding
 * - Auto-scroll to latest log
 * - Empty state prompt
 * - Virtual scrolling optimization for large lists (Task 10.1)
 * 
 * Requirements: 5.4, 5.5, 5.6, 8.1
 */

'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import styles from '@/styles/LogList.module.css';

export interface LogEntry {
  id: string;
  timestamp: Date | string | number;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  nodeId?: string;
}

export interface LogListProps {
  /**
   * Log entries
   */
  logs: LogEntry[];
  
  /**
   * Whether to auto-scroll to latest log
   * @default true
   */
  autoScroll?: boolean;
  
  /**
   * Maximum number of logs to display
   * @default 1000
   */
  maxLogs?: number;
  
  /**
   * Whether to enable virtual scrolling
   * @default true for logs > 50
   */
  enableVirtualScroll?: boolean;
}

/**
 * Format timestamp
 */
function formatTimestamp(date: Date | string | number): string {
  // Convert to Date object if needed
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if valid date
  if (isNaN(dateObj.getTime())) {
    return '00:00:00.000';
  }
  
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const seconds = dateObj.getSeconds().toString().padStart(2, '0');
  const ms = dateObj.getMilliseconds().toString().padStart(3, '0');
  
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Get log level icon
 */
function getLogLevelIcon(level: LogEntry['level']): React.ReactNode {
  switch (level) {
    case 'info':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 7V11M8 5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'warning':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L14 13H2L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 6V9M8 11V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'error':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 6L6 10M6 6L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'success':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

/**
 * LogList Component
 */
export const LogList: React.FC<LogListProps> = ({
  logs,
  autoScroll = true,
  maxLogs = 1000,
  enableVirtualScroll,
}) => {
  const { theme } = useWorkflowTheme();
  const listRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Limit logs to maxLogs
  const displayLogs = logs.slice(-maxLogs);
  
  // Determine if virtual scrolling should be enabled
  const useVirtualScroll = enableVirtualScroll ?? displayLogs.length > 50;
  
  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && !isUserScrolling && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isUserScrolling]);
  
  // Handle user scrolling
  const handleScroll = () => {
    if (!listRef.current) return;
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Check if user is at bottom
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    
    setIsUserScrolling(!isAtBottom);
    
    // Reset user scrolling after 2 seconds of no scroll
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2000);
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  
  // Empty state
  if (displayLogs.length === 0) {
    return (
      <div className={styles.emptyState} data-theme={theme}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          className={styles.emptyIcon}
        >
          <path
            d="M8 12H40M8 20H40M8 28H32M8 36H24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className={styles.emptyText}>暂无日志</p>
        <p className={styles.emptyHint}>运行工作流后将显示日志信息</p>
      </div>
    );
  }
  
  return (
    <div
      ref={listRef}
      className={`${styles.list} ${useVirtualScroll ? styles.virtualScroll : ''}`}
      data-theme={theme}
      onScroll={handleScroll}
    >
      {displayLogs.map((log) => (
        <div
          key={log.id}
          className={`${styles.logEntry} ${styles[`level-${log.level}`]}`}
          data-level={log.level}
        >
          {/* Timestamp */}
          <span className={styles.timestamp}>
            {formatTimestamp(log.timestamp)}
          </span>
          
          {/* Level Icon */}
          <span className={styles.levelIcon}>
            {getLogLevelIcon(log.level)}
          </span>
          
          {/* Message */}
          <span className={styles.message}>{log.message}</span>
          
          {/* Node ID (if present) */}
          {log.nodeId && (
            <span className={styles.nodeId} title={`节点: ${log.nodeId}`}>
              {log.nodeId}
            </span>
          )}
        </div>
      ))}
      
      {/* Scroll to bottom indicator */}
      {isUserScrolling && (
        <button
          className={styles.scrollToBottom}
          onClick={() => {
            if (listRef.current) {
              listRef.current.scrollTop = listRef.current.scrollHeight;
              setIsUserScrolling(false);
            }
          }}
          aria-label="滚动到底部"
          title="滚动到底部"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3V13M8 13L12 9M8 13L4 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default LogList;
