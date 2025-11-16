/**
 * NodeParameterPreview Component
 * 
 * Enhanced parameter preview component for workflow nodes.
 * Displays key parameters with smart formatting and collapse/expand functionality.
 * 
 * Features:
 * - Smart parameter selection (shows most important parameters)
 * - Type-aware formatting (boolean, number, string, object, array)
 * - Collapse/expand animation
 * - Unsaved changes indicator
 * - Parameter grouping
 */

'use client';

import React from 'react';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import styles from '../../styles/NodeParameterPreview.module.css';

export interface NodeParameterPreviewProps {
  parameters: Record<string, any>;
  maxVisible?: number;
  isExpanded?: boolean;
  onToggle?: () => void;
  hasUnsavedChanges?: boolean;
  priorityParams?: string[];
  className?: string;
}

/**
 * Format parameter value for display
 */
const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '-';
  }
  
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }
  
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  
  if (typeof value === 'string') {
    if (value.length > 30) {
      return value.substring(0, 27) + '...';
    }
    return value;
  }
  
  if (Array.isArray(value)) {
    return `[${value.length} 项]`;
  }
  
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return `{${keys.length} 个属性}`;
  }
  
  return String(value).substring(0, 30);
};

/**
 * Get parameter display name (convert camelCase to readable format)
 */
const getDisplayName = (key: string): string => {
  // Convert camelCase to spaces
  const withSpaces = key.replace(/([A-Z])/g, ' $1').trim();
  // Capitalize first letter
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

/**
 * Get parameter type icon/badge
 */
const getTypeIndicator = (value: any): string => {
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'number') return 'num';
  if (typeof value === 'string') return 'str';
  if (Array.isArray(value)) return 'arr';
  if (typeof value === 'object') return 'obj';
  return 'any';
};

/**
 * NodeParameterPreview Component
 */
const NodeParameterPreview: React.FC<NodeParameterPreviewProps> = ({
  parameters,
  maxVisible = 3,
  isExpanded = false,
  onToggle,
  hasUnsavedChanges = false,
  priorityParams = [],
  className = '',
}) => {
  const { tokens } = useWorkflowTheme();
  const [localExpanded, setLocalExpanded] = React.useState(isExpanded);

  const expanded = onToggle ? isExpanded : localExpanded;
  const handleToggle = onToggle || (() => setLocalExpanded(!localExpanded));

  // Get parameters to display
  const getDisplayParams = (): Array<[string, any]> => {
    const entries = Object.entries(parameters);
    
    if (entries.length === 0) {
      return [];
    }

    // If priority params are specified, show those first
    if (priorityParams.length > 0) {
      const priorityEntries = priorityParams
        .filter(key => key in parameters)
        .map(key => [key, parameters[key]] as [string, any]);
      
      const otherEntries = entries.filter(
        ([key]) => !priorityParams.includes(key)
      );
      
      return [...priorityEntries, ...otherEntries];
    }

    return entries;
  };

  const allParams = getDisplayParams();
  const visibleParams = expanded ? allParams : allParams.slice(0, maxVisible);
  const hasMore = allParams.length > maxVisible;
  const hiddenCount = allParams.length - maxVisible;

  if (allParams.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.preview} ${className}`}>
      {/* Header with toggle */}
      <button
        className={styles.header}
        onClick={handleToggle}
        type="button"
        aria-expanded={expanded}
      >
        <div className={styles.headerLeft}>
          {expanded ? (
            <ChevronDown size={14} className={styles.chevron} />
          ) : (
            <ChevronRight size={14} className={styles.chevron} />
          )}
          <span className={styles.headerTitle}>
            参数 ({allParams.length})
          </span>
        </div>
        
        {hasUnsavedChanges && (
          <div className={styles.unsavedBadge} title="有未保存的更改">
            <AlertCircle size={12} />
            <span>未保存</span>
          </div>
        )}
      </button>

      {/* Parameters list */}
      {visibleParams.length > 0 && (
        <div className={styles.paramsList}>
          {visibleParams.map(([key, value]) => (
            <div key={key} className={styles.paramItem}>
              <div className={styles.paramHeader}>
                <span className={styles.paramName}>
                  {getDisplayName(key)}
                </span>
                <span 
                  className={styles.paramType}
                  title={`类型: ${getTypeIndicator(value)}`}
                >
                  {getTypeIndicator(value)}
                </span>
              </div>
              <div className={styles.paramValue} title={String(value)}>
                {formatValue(value)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show more indicator */}
      {!expanded && hasMore && (
        <div className={styles.moreIndicator}>
          +{hiddenCount} 个参数...
        </div>
      )}
    </div>
  );
};

export default NodeParameterPreview;
