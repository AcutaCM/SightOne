/**
 * ResultList Component
 * 
 * Result list component with:
 * - Result card styling
 * - Result data formatting
 * - Result type identification
 * - Empty state
 * 
 * Requirements: 5.3
 */

'use client';

import React from 'react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import styles from '@/styles/ResultList.module.css';

export interface ResultEntry {
  id: string;
  nodeId: string;
  nodeName: string;
  result: any;
  resultType: string;
  timestamp: Date;
}

export interface ResultListProps {
  /**
   * Result entries
   */
  results: ResultEntry[];
  
  /**
   * Callback when a result is clicked
   */
  onResultClick?: (result: ResultEntry) => void;
}

/**
 * Format timestamp
 */
function formatTimestamp(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format result data for display
 */
function formatResultData(result: any, resultType: string): string {
  if (result === null || result === undefined) {
    return 'null';
  }
  
  // Handle different result types
  switch (resultType) {
    case 'string':
      return result.toString();
    case 'number':
      return result.toLocaleString();
    case 'boolean':
      return result ? 'true' : 'false';
    case 'object':
    case 'array':
      try {
        return JSON.stringify(result, null, 2);
      } catch {
        return '[Object]';
      }
    case 'image':
      return '[图像数据]';
    case 'video':
      return '[视频数据]';
    default:
      return String(result);
  }
}

/**
 * Get result type icon
 */
function getResultTypeIcon(resultType: string): React.ReactNode {
  switch (resultType) {
    case 'string':
    case 'text':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 4H13M5 8H11M7 12H9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'number':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <text x="3" y="12" fill="currentColor" fontSize="10" fontWeight="bold">
            123
          </text>
        </svg>
      );
    case 'boolean':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M5 8L7 10L11 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'object':
    case 'array':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 3H12C12.5523 3 13 3.44772 13 4V12C13 12.5523 12.5523 13 12 13H4C3.44772 13 3 12.5523 3 12V4C3 3.44772 3.44772 3 4 3Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M6 6H10M6 8H10M6 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'image':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="6" cy="6" r="1.5" fill="currentColor" />
          <path d="M14 10L11 7L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'video':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 6L10 8L7 10V6Z" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 5V9M8 11V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

/**
 * Get result type color
 */
function getResultTypeColor(resultType: string): string {
  switch (resultType) {
    case 'string':
    case 'text':
      return '#3b82f6';
    case 'number':
      return '#10b981';
    case 'boolean':
      return '#8b5cf6';
    case 'object':
    case 'array':
      return '#f59e0b';
    case 'image':
      return '#ec4899';
    case 'video':
      return '#06b6d4';
    default:
      return '#64748b';
  }
}

/**
 * ResultList Component
 */
export const ResultList: React.FC<ResultListProps> = ({
  results,
  onResultClick,
}) => {
  const { theme } = useWorkflowTheme();
  
  // Empty state
  if (results.length === 0) {
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
            d="M24 8V24M24 24L32 16M24 24L16 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 28V36C8 38.2091 9.79086 40 12 40H36C38.2091 40 40 38.2091 40 36V28"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className={styles.emptyText}>暂无结果</p>
        <p className={styles.emptyHint}>运行工作流后将显示执行结果</p>
      </div>
    );
  }
  
  return (
    <div className={styles.list} data-theme={theme}>
      {results.map((result) => (
        <div
          key={result.id}
          className={styles.resultCard}
          onClick={() => onResultClick?.(result)}
          role={onResultClick ? 'button' : undefined}
          tabIndex={onResultClick ? 0 : undefined}
        >
          {/* Header */}
          <div className={styles.cardHeader}>
            <div className={styles.nodeInfo}>
              <span className={styles.nodeName}>{result.nodeName}</span>
              <span className={styles.nodeId}>{result.nodeId}</span>
            </div>
            <span className={styles.timestamp}>
              {formatTimestamp(result.timestamp)}
            </span>
          </div>
          
          {/* Type Badge */}
          <div className={styles.typeBadge} style={{ color: getResultTypeColor(result.resultType) }}>
            <span className={styles.typeIcon}>
              {getResultTypeIcon(result.resultType)}
            </span>
            <span className={styles.typeLabel}>{result.resultType}</span>
          </div>
          
          {/* Result Data */}
          <div className={styles.resultData}>
            <pre className={styles.resultContent}>
              {formatResultData(result.result, result.resultType)}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultList;
