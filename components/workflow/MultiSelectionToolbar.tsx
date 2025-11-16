/**
 * MultiSelectionToolbar Component
 * 
 * Toolbar for batch operations on multiple selected nodes.
 * Provides alignment, deletion, and movement controls.
 * 
 * Features:
 * - Batch delete
 * - Batch alignment (left, center, right, top, middle, bottom)
 * - Batch movement
 * - Selection count display
 * 
 * Requirements: 10.3
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { useReactFlow, Node } from 'reactflow';
import { Button, ButtonGroup, Chip } from '@heroui/react';
import {
  TrashIcon,
  ArrowsPointingInIcon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import styles from '../../styles/MultiSelectionToolbar.module.css';

export interface MultiSelectionToolbarProps {
  selectedNodes: Node[];
  onDelete?: () => void;
  onAlign?: (type: AlignmentType) => void;
  className?: string;
}

export type AlignmentType = 
  | 'left' 
  | 'center' 
  | 'right' 
  | 'top' 
  | 'middle' 
  | 'bottom'
  | 'distribute-horizontal'
  | 'distribute-vertical';

/**
 * MultiSelectionToolbar Component
 * 
 * Provides batch operations for multiple selected nodes.
 * Implements requirement 10.3 for multi-selection functionality.
 */
const MultiSelectionToolbar: React.FC<MultiSelectionToolbarProps> = ({
  selectedNodes,
  onDelete,
  onAlign,
  className,
}) => {
  const { theme, tokens } = useWorkflowTheme();
  const { setNodes, getNodes } = useReactFlow();

  // Check if multiple nodes are selected
  const isMultipleSelected = selectedNodes.length > 1;
  const selectionCount = selectedNodes.length;

  // Handle delete selected nodes
  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete();
    } else {
      const selectedIds = new Set(selectedNodes.map(n => n.id));
      setNodes((nodes) => nodes.filter(n => !selectedIds.has(n.id)));
    }
  }, [selectedNodes, onDelete, setNodes]);

  // Handle alignment
  const handleAlign = useCallback((type: AlignmentType) => {
    if (onAlign) {
      onAlign(type);
      return;
    }

    if (selectedNodes.length < 2) return;

    const selectedIds = new Set(selectedNodes.map(n => n.id));
    
    setNodes((nodes) => {
      return nodes.map((node) => {
        if (!selectedIds.has(node.id)) return node;

        let newPosition = { ...node.position };

        switch (type) {
          case 'left': {
            const minX = Math.min(...selectedNodes.map(n => n.position.x));
            newPosition.x = minX;
            break;
          }
          case 'center': {
            const minX = Math.min(...selectedNodes.map(n => n.position.x));
            const maxX = Math.max(...selectedNodes.map(n => n.position.x + (n.width || 200)));
            const centerX = (minX + maxX) / 2;
            newPosition.x = centerX - (node.width || 200) / 2;
            break;
          }
          case 'right': {
            const maxX = Math.max(...selectedNodes.map(n => n.position.x + (n.width || 200)));
            newPosition.x = maxX - (node.width || 200);
            break;
          }
          case 'top': {
            const minY = Math.min(...selectedNodes.map(n => n.position.y));
            newPosition.y = minY;
            break;
          }
          case 'middle': {
            const minY = Math.min(...selectedNodes.map(n => n.position.y));
            const maxY = Math.max(...selectedNodes.map(n => n.position.y + (n.height || 100)));
            const centerY = (minY + maxY) / 2;
            newPosition.y = centerY - (node.height || 100) / 2;
            break;
          }
          case 'bottom': {
            const maxY = Math.max(...selectedNodes.map(n => n.position.y + (n.height || 100)));
            newPosition.y = maxY - (node.height || 100);
            break;
          }
          case 'distribute-horizontal': {
            // Sort nodes by x position
            const sorted = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
            const minX = sorted[0].position.x;
            const maxX = sorted[sorted.length - 1].position.x + (sorted[sorted.length - 1].width || 200);
            const totalWidth = maxX - minX;
            const gap = totalWidth / (sorted.length - 1);
            
            const index = sorted.findIndex(n => n.id === node.id);
            if (index > 0 && index < sorted.length - 1) {
              newPosition.x = minX + gap * index;
            }
            break;
          }
          case 'distribute-vertical': {
            // Sort nodes by y position
            const sorted = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);
            const minY = sorted[0].position.y;
            const maxY = sorted[sorted.length - 1].position.y + (sorted[sorted.length - 1].height || 100);
            const totalHeight = maxY - minY;
            const gap = totalHeight / (sorted.length - 1);
            
            const index = sorted.findIndex(n => n.id === node.id);
            if (index > 0 && index < sorted.length - 1) {
              newPosition.y = minY + gap * index;
            }
            break;
          }
        }

        return {
          ...node,
          position: newPosition,
        };
      });
    });
  }, [selectedNodes, onAlign, setNodes]);

  // Don't show toolbar if no nodes are selected
  if (selectionCount === 0) {
    return null;
  }

  return (
    <div 
      className={`${styles.toolbar} ${className || ''}`}
      data-theme={theme}
      style={{
        background: tokens.colors.panel.background,
        border: `1px solid ${tokens.colors.panel.border}`,
        boxShadow: tokens.shadows.lg,
      }}
    >
      {/* Selection count */}
      <Chip
        size="sm"
        variant="flat"
        color="primary"
        className={styles.countChip}
      >
        已选择 {selectionCount} 个节点
      </Chip>

      {/* Alignment buttons (only show for multiple selection) */}
      {isMultipleSelected && (
        <>
          <div className={styles.divider} />
          
          <ButtonGroup size="sm" variant="flat">
            <Button
              isIconOnly
              onPress={() => handleAlign('left')}
              title="左对齐"
              aria-label="左对齐"
            >
              <span className={styles.alignIcon}>⬅</span>
            </Button>
            <Button
              isIconOnly
              onPress={() => handleAlign('center')}
              title="水平居中"
              aria-label="水平居中"
            >
              <ArrowsRightLeftIcon className={styles.icon} />
            </Button>
            <Button
              isIconOnly
              onPress={() => handleAlign('right')}
              title="右对齐"
              aria-label="右对齐"
            >
              <span className={styles.alignIcon}>➡</span>
            </Button>
          </ButtonGroup>

          <ButtonGroup size="sm" variant="flat">
            <Button
              isIconOnly
              onPress={() => handleAlign('top')}
              title="顶部对齐"
              aria-label="顶部对齐"
            >
              <span className={styles.alignIcon}>⬆</span>
            </Button>
            <Button
              isIconOnly
              onPress={() => handleAlign('middle')}
              title="垂直居中"
              aria-label="垂直居中"
            >
              <ArrowsUpDownIcon className={styles.icon} />
            </Button>
            <Button
              isIconOnly
              onPress={() => handleAlign('bottom')}
              title="底部对齐"
              aria-label="底部对齐"
            >
              <span className={styles.alignIcon}>⬇</span>
            </Button>
          </ButtonGroup>

          <ButtonGroup size="sm" variant="flat">
            <Button
              isIconOnly
              onPress={() => handleAlign('distribute-horizontal')}
              title="水平分布"
              aria-label="水平分布"
            >
              <span className={styles.alignIcon}>↔</span>
            </Button>
            <Button
              isIconOnly
              onPress={() => handleAlign('distribute-vertical')}
              title="垂直分布"
              aria-label="垂直分布"
            >
              <span className={styles.alignIcon}>↕</span>
            </Button>
          </ButtonGroup>
        </>
      )}

      {/* Delete button */}
      <div className={styles.divider} />
      <Button
        size="sm"
        color="danger"
        variant="flat"
        startContent={<TrashIcon className={styles.icon} />}
        onPress={handleDelete}
      >
        删除
      </Button>
    </div>
  );
};

export default MultiSelectionToolbar;
