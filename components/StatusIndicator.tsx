/**
 * StatusIndicator Component
 * 
 * Universal status indicator component for displaying success, warning, error, and loading states
 * using the dark mode design system with white transparency hierarchy.
 * 
 * Features:
 * - Success state: 100% white opacity with subtle glow effect
 * - Warning state: 80% white opacity
 * - Error state: 90% white opacity
 * - Loading state: 60% white opacity with pulsing animation
 * - Customizable size and display options
 * - Optional message text
 * - Icon support
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

'use client';

import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Loader2,
  Info
} from 'lucide-react';
import styles from '../styles/StatusIndicator.module.css';

export type StatusType = 'success' | 'warning' | 'error' | 'loading' | 'info';

export interface StatusIndicatorProps {
  /** Status type */
  status: StatusType;
  
  /** Optional message to display */
  message?: string;
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Show icon */
  showIcon?: boolean;
  
  /** Custom icon component */
  customIcon?: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Inline display (horizontal layout) */
  inline?: boolean;
}

/**
 * Status configuration with icons and default colors
 */
const STATUS_CONFIG: Record<StatusType, {
  icon: React.ComponentType<any>;
  label: string;
  opacity: string;
}> = {
  success: {
    icon: CheckCircle2,
    label: 'Success',
    opacity: 'rgba(255, 255, 255, 1.0)', // 100% white opacity with glow
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    opacity: 'rgba(255, 255, 255, 0.8)', // 80% white opacity
  },
  error: {
    icon: XCircle,
    label: 'Error',
    opacity: 'rgba(255, 255, 255, 0.9)', // 90% white opacity
  },
  loading: {
    icon: Loader2,
    label: 'Loading',
    opacity: 'rgba(255, 255, 255, 0.6)', // 60% white opacity with pulsing
  },
  info: {
    icon: Info,
    label: 'Info',
    opacity: 'rgba(255, 255, 255, 0.7)', // 70% white opacity
  },
};

/**
 * StatusIndicator Component
 * 
 * Displays a status indicator with icon and optional message using dark mode theme.
 */
const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  size = 'md',
  showIcon = true,
  customIcon,
  className = '',
  inline = false,
}) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;

  return (
    <div
      className={`${styles.indicator} ${styles[size]} ${styles[status]} ${inline ? styles.inline : ''} ${className}`}
      data-status={status}
      style={{ '--status-color': config.opacity } as React.CSSProperties}
    >
      {showIcon && (
        <div className={styles.iconWrapper}>
          {customIcon || (
            <Icon 
              className={`${styles.icon} ${status === 'loading' ? styles.spinning : ''}`}
              size={iconSize}
            />
          )}
        </div>
      )}
      
      {message && (
        <span className={styles.message}>
          {message}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
