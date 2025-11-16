/**
 * OutputTabs Component
 * 
 * Tabbed interface for displaying logs and results with:
 * - HeroUI Tabs component
 * - Logs and Results tabs
 * - Tab switching animations
 * - Badge indicators for counts
 * 
 * Requirements: 5.3
 */

'use client';

import React, { useState } from 'react';
import { Tabs, Tab } from '@heroui/react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import styles from '@/styles/OutputTabs.module.css';

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

export interface OutputTabsProps {
  /**
   * Log entries
   */
  logs: LogEntry[];
  
  /**
   * Result entries
   */
  results: ResultEntry[];
  
  /**
   * Content for logs tab
   */
  logsContent: React.ReactNode;
  
  /**
   * Content for results tab
   */
  resultsContent: React.ReactNode;
  
  /**
   * Callback when active tab changes
   */
  onTabChange?: (key: string) => void;
}

/**
 * OutputTabs Component
 */
export const OutputTabs: React.FC<OutputTabsProps> = ({
  logs,
  results,
  logsContent,
  resultsContent,
  onTabChange,
}) => {
  const { theme } = useWorkflowTheme();
  const [selectedKey, setSelectedKey] = useState<string>('logs');
  
  const handleSelectionChange = (key: React.Key) => {
    const keyStr = key.toString();
    setSelectedKey(keyStr);
    onTabChange?.(keyStr);
  };
  
  return (
    <div className={styles.container} data-theme={theme}>
      <Tabs
        selectedKey={selectedKey}
        onSelectionChange={handleSelectionChange}
        aria-label="输出标签页"
        classNames={{
          base: styles.tabs,
          tabList: styles.tabList,
          cursor: styles.cursor,
          tab: styles.tab,
          tabContent: styles.tabContent,
          panel: styles.panel,
        }}
        variant="underlined"
        color="primary"
      >
        {/* Logs Tab */}
        <Tab
          key="logs"
          title={
            <div className={styles.tabTitle}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={styles.tabIcon}
              >
                <path
                  d="M2 4H14M2 8H14M2 12H10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>日志</span>
              {logs.length > 0 && (
                <span className={styles.badge}>{logs.length}</span>
              )}
            </div>
          }
        >
          <div className={styles.tabPanel}>
            {logsContent}
          </div>
        </Tab>
        
        {/* Results Tab */}
        <Tab
          key="results"
          title={
            <div className={styles.tabTitle}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={styles.tabIcon}
              >
                <path
                  d="M8 2V8M8 8L11 5M8 8L5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 10V12C3 13.1046 3.89543 14 5 14H11C12.1046 14 13 13.1046 13 12V10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>结果</span>
              {results.length > 0 && (
                <span className={styles.badge}>{results.length}</span>
              )}
            </div>
          }
        >
          <div className={styles.tabPanel}>
            {resultsContent}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default OutputTabs;
