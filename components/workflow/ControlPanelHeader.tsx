/**
 * ControlPanelHeader Component
 * 
 * Header section for the control panel that displays:
 * - Connection status indicators (drone and WebSocket)
 * - Real-time status updates
 * - Status icons and colors
 * 
 * Requirements: 5.1
 */

'use client';

import React, { useMemo } from 'react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import styles from '@/styles/ControlPanelHeader.module.css';

export interface ConnectionStatus {
  drone: boolean;
  websocket: boolean;
  lastUpdate: Date;
}

export interface ControlPanelHeaderProps {
  /**
   * Connection status
   */
  connectionStatus: ConnectionStatus;
  
  /**
   * Optional title for the panel
   */
  title?: string;
}

/**
 * Format time ago string
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 5) {
    return '刚刚';
  } else if (seconds < 60) {
    return `${seconds}秒前`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分钟前`;
  } else {
    const hours = Math.floor(seconds / 3600);
    return `${hours}小时前`;
  }
}

/**
 * ControlPanelHeader Component
 */
export const ControlPanelHeader: React.FC<ControlPanelHeaderProps> = ({
  connectionStatus,
  title = '控制面板',
}) => {
  const { theme } = useWorkflowTheme();
  
  // Format last update time
  const lastUpdateText = useMemo(() => {
    return formatTimeAgo(connectionStatus.lastUpdate);
  }, [connectionStatus.lastUpdate]);
  
  return (
    <div className={styles.header} data-theme={theme}>
      {/* Title */}
      <h2 className={styles.title}>{title}</h2>
      
      {/* Connection Status Indicators */}
      <div className={styles.statusContainer}>
        {/* Drone Status */}
        <div className={styles.statusItem}>
          <div
            className={`${styles.statusIndicator} ${
              connectionStatus.drone ? styles.connected : styles.disconnected
            }`}
            title={connectionStatus.drone ? '无人机已连接' : '无人机未连接'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={styles.statusIcon}
            >
              {/* Drone icon */}
              <path
                d="M8 2L10 4H6L8 2Z"
                fill="currentColor"
              />
              <rect
                x="4"
                y="5"
                width="8"
                height="4"
                rx="1"
                fill="currentColor"
              />
              <circle cx="3" cy="7" r="1.5" fill="currentColor" />
              <circle cx="13" cy="7" r="1.5" fill="currentColor" />
              <path
                d="M6 9V11M10 9V11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className={styles.statusLabel}>
            {connectionStatus.drone ? '无人机' : '无人机'}
          </span>
          <span
            className={`${styles.statusText} ${
              connectionStatus.drone ? styles.statusConnected : styles.statusDisconnected
            }`}
          >
            {connectionStatus.drone ? '已连接' : '未连接'}
          </span>
        </div>
        
        {/* WebSocket Status */}
        <div className={styles.statusItem}>
          <div
            className={`${styles.statusIndicator} ${
              connectionStatus.websocket ? styles.connected : styles.disconnected
            }`}
            title={connectionStatus.websocket ? 'WebSocket已连接' : 'WebSocket未连接'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={styles.statusIcon}
            >
              {/* WebSocket icon */}
              <path
                d="M2 8C2 8 4 4 8 4C12 4 14 8 14 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M4 10C4 10 5.5 8 8 8C10.5 8 12 10 12 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="8" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className={styles.statusLabel}>
            {connectionStatus.websocket ? 'WebSocket' : 'WebSocket'}
          </span>
          <span
            className={`${styles.statusText} ${
              connectionStatus.websocket ? styles.statusConnected : styles.statusDisconnected
            }`}
          >
            {connectionStatus.websocket ? '已连接' : '未连接'}
          </span>
        </div>
      </div>
      
      {/* Last Update */}
      <div className={styles.lastUpdate}>
        <span className={styles.lastUpdateLabel}>最后更新:</span>
        <span className={styles.lastUpdateTime}>{lastUpdateText}</span>
      </div>
    </div>
  );
};

export default ControlPanelHeader;
