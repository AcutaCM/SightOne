/**
 * CustomWorkflowNode Component
 * 
 * A modern, theme-aware custom node component for the workflow editor.
 * Implements the redesigned node structure with title bar, content area, and connection points.
 * 
 * Features:
 * - Theme-aware styling (light/dark)
 * - Status indicators (idle/running/success/error)
 * - Parameter preview with collapse/expand
 * - Selection effects with glow border
 * - Connection handles (top/bottom/left/right)
 * 
 * Requirements: 2.6, 6.7, 10.3
 */

'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import NodeStatusIndicator from './NodeStatusIndicator';
import NodeParameterPreview from './NodeParameterPreview';
import NodeSelectionOverlay from './NodeSelectionOverlay';
import styles from '../../styles/CustomWorkflowNode.module.css';

/**
 * Node status types
 */
export type NodeStatus = 'idle' | 'running' | 'success' | 'error';

/**
 * Node data interface
 */
export interface CustomNodeData {
  type: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  status?: NodeStatus;
  parameters?: Record<string, any>;
  hasUnsavedChanges?: boolean;
  category?: string;
  description?: string;
  showParameters?: boolean;
}

/**
 * CustomWorkflowNode Component
 * 
 * Renders a custom workflow node with modern styling and theme support.
 */
const CustomWorkflowNode: React.FC<NodeProps<CustomNodeData>> = memo(({
  id,
  data,
  selected,
  dragging,
}) => {
  const { theme, tokens } = useWorkflowTheme();
  const [isParametersExpanded, setIsParametersExpanded] = React.useState(
    data.showParameters ?? false
  );

  // Get status color
  const getStatusColor = (status: NodeStatus = 'idle'): string => {
    return tokens.colors.status[status];
  };

  // Get category color
  const getCategoryColor = (): string => {
    if (data.color) return data.color;
    if (data.category && data.category in tokens.colors.category) {
      return tokens.colors.category[data.category as keyof typeof tokens.colors.category];
    }
    return tokens.colors.category.basic;
  };

  const categoryColor = getCategoryColor();
  const statusColor = getStatusColor(data.status);
  const hasParameters = data.parameters && Object.keys(data.parameters).length > 0;

  return (
    <div
      className={`${styles.node} ${selected ? styles.selected : ''} ${dragging ? styles.dragging : ''}`}
      data-theme={theme}
      data-status={data.status || 'idle'}
      style={{
        '--node-category-color': categoryColor,
        '--node-status-color': statusColor,
      } as React.CSSProperties}
    >
      {/* Selection Overlay */}
      <NodeSelectionOverlay
        isSelected={selected}
        isMultiSelected={false}
      />

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className={styles.handle}
        style={{ background: categoryColor }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className={styles.handle}
        style={{ background: categoryColor }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={styles.handle}
        style={{ background: categoryColor }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handle}
        style={{ background: categoryColor }}
      />

      {/* Status Indicator */}
      <div className={styles.statusIndicator}>
        <NodeStatusIndicator 
          status={data.status || 'idle'}
          size="sm"
        />
      </div>

      {/* Unsaved Changes Indicator */}
      {data.hasUnsavedChanges && (
        <div 
          className={styles.unsavedIndicator}
          title="有未保存的更改"
        >
          <div className={styles.unsavedDot} />
        </div>
      )}

      {/* Title Bar */}
      <div 
        className={styles.titleBar}
        style={{ background: categoryColor }}
      >
        {data.icon && (
          <div className={styles.icon}>
            {data.icon}
          </div>
        )}
        <div className={styles.title}>
          {data.label}
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.content}>
        {/* Description */}
        {data.description && (
          <div className={styles.description}>
            {data.description}
          </div>
        )}

        {/* Parameter Preview */}
        {hasParameters && (
          <NodeParameterPreview
            parameters={data.parameters!}
            maxVisible={3}
            isExpanded={isParametersExpanded}
            onToggle={() => setIsParametersExpanded(!isParametersExpanded)}
            hasUnsavedChanges={data.hasUnsavedChanges}
          />
        )}
      </div>

      {/* Node Type Badge */}
      <div className={styles.typeBadge}>
        {data.type}
      </div>
    </div>
  );
});

CustomWorkflowNode.displayName = 'CustomWorkflowNode';

export default CustomWorkflowNode;
