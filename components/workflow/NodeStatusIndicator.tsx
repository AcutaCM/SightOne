/**
 * NodeStatusIndicator Component
 * 
 * Advanced status indicator for workflow nodes with icons and animations.
 * Provides visual feedback for node execution states.
 * 
 * Features:
 * - Status icons (idle/running/success/error)
 * - Color-coded indicators
 * - Animated effects for running state
 * - Tooltips with status information
 */

'use client';

import React from 'react';
import { 
  Circle, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  AlertCircle 
} from 'lucide-react';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import styles from '../../styles/NodeStatusIndicator.module.css';

export type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'warning';

export interface NodeStatusIndicatorProps {
  status: NodeStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * Status configuration with icons and labels
 */
const STATUS_CONFIG: Record<NodeStatus, {
  icon: React.ComponentType<any>;
  label: string;
  description: string;
}> = {
  idle: {
    icon: Circle,
    label: '空闲',
    description: '节点未执行',
  },
  running: {
    icon: Loader2,
    label: '运行中',
    description: '节点正在执行',
  },
  success: {
    icon: CheckCircle2,
    label: '成功',
    description: '节点执行成功',
  },
  error: {
    icon: XCircle,
    label: '错误',
    description: '节点执行失败',
  },
  warning: {
    icon: AlertCircle,
    label: '警告',
    description: '节点执行有警告',
  },
};

/**
 * NodeStatusIndicator Component
 * 
 * Displays a status indicator with icon and optional label.
 */
const NodeStatusIndicator: React.FC<NodeStatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const { tokens } = useWorkflowTheme();
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  // Get status color from theme using dark mode tokens
  const getStatusColor = (): string => {
    // Use dark mode design tokens for status colors
    switch (status) {
      case 'success':
        return 'rgba(255, 255, 255, 1.0)'; // 100% white opacity with subtle glow
      case 'warning':
        return 'rgba(255, 255, 255, 0.8)'; // 80% white opacity
      case 'error':
        return 'rgba(255, 255, 255, 0.9)'; // 90% white opacity
      case 'running':
        return 'rgba(255, 255, 255, 0.6)'; // 60% white opacity with pulsing
      case 'idle':
      default:
        return 'rgba(255, 255, 255, 0.4)'; // 40% white opacity
    }
  };

  const statusColor = getStatusColor();

  return (
    <div
      className={`${styles.indicator} ${styles[size]} ${className}`}
      data-status={status}
      title={config.description}
    >
      <div 
        className={styles.iconWrapper}
        style={{ color: statusColor }}
      >
        <Icon 
          className={`${styles.icon} ${status === 'running' ? styles.spinning : ''}`}
          size={size === 'sm' ? 12 : size === 'md' ? 16 : 20}
        />
      </div>
      
      {showLabel && (
        <span 
          className={styles.label}
          style={{ color: statusColor }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
};

export default NodeStatusIndicator;
