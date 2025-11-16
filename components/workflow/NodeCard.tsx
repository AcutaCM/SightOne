/**
 * NodeCard Component
 * 
 * Card component for displaying workflow nodes in the node library.
 * Part of the workflow UI redesign (Task 3.4).
 * Optimized with React.memo (Task 10.2).
 */

'use client';

import React, { useState, useCallback, useRef, memo } from 'react';
import { Tooltip } from '@heroui/tooltip';
import { LucideIcon } from 'lucide-react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import { WorkflowNodeDefinition } from '@/lib/workflow/nodeDefinitions';
import { shallowCompare } from '@/lib/workflow/componentOptimization';
import styles from '@/styles/NodeCard.module.css';

export interface NodeCardProps {
  /**
   * Node definition
   */
  node: WorkflowNodeDefinition;
  
  /**
   * Callback when drag starts
   */
  onDragStart?: (event: React.DragEvent, node: WorkflowNodeDefinition) => void;
  
  /**
   * Callback when card is clicked
   */
  onClick?: (node: WorkflowNodeDefinition) => void;
  
  /**
   * Whether to show detailed tooltip
   */
  showTooltip?: boolean;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * NodeCard Component (Memoized for performance)
 */
const NodeCardComponent: React.FC<NodeCardProps> = ({
  node,
  onDragStart,
  onClick,
  showTooltip = true,
  className = '',
}) => {
  const { theme } = useWorkflowTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  
  // Handle drag start
  const handleDragStart = useCallback((event: React.DragEvent) => {
    setIsDragging(true);
    
    // Set drag data
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({
        type: node.type,
        label: node.label,
        category: node.category,
        icon: node.icon.name,
        color: node.color,
      })
    );
    event.dataTransfer.effectAllowed = 'move';
    
    // Create custom drag preview
    if (dragPreviewRef.current) {
      const preview = dragPreviewRef.current.cloneNode(true) as HTMLElement;
      preview.style.position = 'absolute';
      preview.style.top = '-1000px';
      preview.style.opacity = '0.8';
      document.body.appendChild(preview);
      event.dataTransfer.setDragImage(preview, 0, 0);
      
      // Clean up preview after drag
      setTimeout(() => {
        document.body.removeChild(preview);
      }, 0);
    }
    
    // Call parent handler
    if (onDragStart) {
      onDragStart(event, node);
    }
  }, [node, onDragStart]);
  
  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Handle click
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(node);
    }
  }, [node, onClick]);
  
  // Handle mouse enter/leave
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  // Get icon component
  const IconComponent = node.icon;
  
  // Render card content
  const cardContent = (
    <div
      ref={dragPreviewRef}
      className={`${styles.card} ${className}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-theme={theme}
      data-dragging={isDragging}
      data-hovered={isHovered}
      style={{
        borderLeftColor: node.color,
      }}
      role="button"
      tabIndex={0}
      aria-label={`添加 ${node.label} 节点`}
    >
      {/* Icon section */}
      <div
        className={styles.iconSection}
        style={{
          backgroundColor: `${node.color}15`,
        }}
      >
        <div
          className={styles.iconWrapper}
          style={{
            backgroundColor: node.color,
          }}
        >
          <IconComponent
            size={20}
            className={styles.icon}
          />
        </div>
      </div>
      
      {/* Content section */}
      <div className={styles.contentSection}>
        <div className={styles.title}>
          {node.label}
        </div>
        <div className={styles.description}>
          {node.description}
        </div>
      </div>
      
      {/* Drag indicator */}
      <div className={styles.dragIndicator}>
        <div className={styles.dragDot} />
        <div className={styles.dragDot} />
        <div className={styles.dragDot} />
      </div>
    </div>
  );
  
  // Wrap with tooltip if enabled
  if (showTooltip) {
    return (
      <Tooltip
        content={
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipTitle}>{node.label}</div>
            <div className={styles.tooltipDescription}>{node.description}</div>
            {node.parameters.length > 0 && (
              <div className={styles.tooltipMeta}>
                <span className={styles.tooltipMetaLabel}>参数:</span>
                <span className={styles.tooltipMetaValue}>{node.parameters.length}个</span>
              </div>
            )}
            <div className={styles.tooltipMeta}>
              <span className={styles.tooltipMetaLabel}>类别:</span>
              <span className={styles.tooltipMetaValue}>{node.category}</span>
            </div>
            <div className={styles.tooltipHint}>
              拖拽到画布添加节点
            </div>
          </div>
        }
        placement="right"
        delay={500}
        closeDelay={0}
        classNames={{
          content: styles.tooltip,
        }}
      >
        {cardContent}
      </Tooltip>
    );
  }
  
  return cardContent;
};

// Export memoized version with custom comparison
export const NodeCard = memo(NodeCardComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.node.type === nextProps.node.type &&
    prevProps.node.label === nextProps.node.label &&
    prevProps.showTooltip === nextProps.showTooltip &&
    prevProps.className === nextProps.className
  );
});

NodeCard.displayName = 'NodeCard';

export default NodeCard;
