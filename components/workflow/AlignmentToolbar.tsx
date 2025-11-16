/**
 * AlignmentToolbar Component
 * 
 * Toolbar for manual node alignment operations.
 * Implements requirement 10.2 from the design specification.
 */

'use client';

import React from 'react';
import { useReactFlow } from 'reactflow';
import { alignNodes, distributeNodes } from '../../lib/workflow/alignmentHelper';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import styles from '../../styles/AlignmentToolbar.module.css';

export interface AlignmentToolbarProps {
  className?: string;
  position?: 'top-left' | 'top-center' | 'top-right';
}

/**
 * AlignmentToolbar Component
 * 
 * Provides buttons for aligning and distributing selected nodes.
 */
const AlignmentToolbar: React.FC<AlignmentToolbarProps> = ({
  className,
  position = 'top-center',
}) => {
  const { getNodes, setNodes } = useReactFlow();
  const { tokens } = useWorkflowTheme();
  const [selectedCount, setSelectedCount] = React.useState(0);

  // Update selected count
  React.useEffect(() => {
    const updateCount = () => {
      const nodes = getNodes();
      const selected = nodes.filter(n => n.selected);
      setSelectedCount(selected.length);
    };

    updateCount();
    const interval = setInterval(updateCount, 100);

    return () => clearInterval(interval);
  }, [getNodes]);

  // Handle alignment
  const handleAlign = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const nodes = getNodes();
    const selectedNodes = nodes.filter(n => n.selected);
    
    if (selectedNodes.length < 2) {
      return;
    }

    const alignedNodes = alignNodes(selectedNodes, alignment);
    const nodeMap = new Map(alignedNodes.map(n => [n.id, n]));
    
    setNodes(nodes.map(n => nodeMap.get(n.id) || n));
  };

  // Handle distribution
  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    const nodes = getNodes();
    const selectedNodes = nodes.filter(n => n.selected);
    
    if (selectedNodes.length < 3) {
      return;
    }

    const distributedNodes = distributeNodes(selectedNodes, direction);
    const nodeMap = new Map(distributedNodes.map(n => [n.id, n]));
    
    setNodes(nodes.map(n => nodeMap.get(n.id) || n));
  };

  // Don't show toolbar if less than 2 nodes selected
  if (selectedCount < 2) {
    return null;
  }

  return (
    <div 
      className={`${styles.toolbar} ${styles[position]} ${className || ''}`}
      style={{
        background: tokens.colors.panel.background,
        border: `1px solid ${tokens.colors.panel.border}`,
        borderRadius: tokens.radius.md,
        boxShadow: tokens.shadows.md,
      }}
    >
      <div className={styles.section}>
        <span 
          className={styles.label}
          style={{ color: tokens.colors.panel.textSecondary }}
        >
          对齐:
        </span>
        
        {/* Horizontal alignment */}
        <button
          className={styles.toolbarButton}
          onClick={() => handleAlign('left')}
          title="左对齐"
          aria-label="Align left"
          style={{ color: tokens.colors.panel.text }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="3" y2="18" />
            <rect x="7" y="6" width="10" height="4" />
            <rect x="7" y="14" width="14" height="4" />
          </svg>
        </button>

        <button
          className={styles.toolbarButton}
          onClick={() => handleAlign('center')}
          title="水平居中"
          aria-label="Align center"
          style={{ color: tokens.colors.panel.text }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="6" x2="12" y2="18" />
            <rect x="7" y="6" width="10" height="4" />
            <rect x="5" y="14" width="14" height="4" />
          </svg>
        </button>

        <button
          className={styles.toolbarButton}
          onClick={() => handleAlign('right')}
          title="右对齐"
          aria-label="Align right"
          style={{ color: tokens.colors.panel.text }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="21" y1="6" x2="21" y2="18" />
            <rect x="7" y="6" width="10" height="4" />
            <rect x="3" y="14" width="14" height="4" />
          </svg>
        </button>

        <div 
          className={styles.divider}
          style={{ background: tokens.colors.panel.border }}
        />

        {/* Vertical alignment */}
        <button
          className={styles.toolbarButton}
          onClick={() => handleAlign('top')}
          title="顶部对齐"
          aria-label="Align top"
          style={{ color: tokens.colors.panel.text }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="6" y1="3" x2="18" y2="3" />
            <rect x="6" y="7" width="4" height="10" />
            <rect x="14" y="7" width="4" height="14" />
          </svg>
        </button>

        <button
          className={styles.toolbarButton}
          onClick={() => handleAlign('middle')}
          title="垂直居中"
          aria-label="Align middle"
          style={{ color: tokens.colors.panel.text }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="6" y1="12" x2="18" y2="12" />
            <rect x="6" y="7" width="4" height="10" />
            <rect x="14" y="5" width="4" height="14" />
          </svg>
        </button>

        <button
          className={styles.toolbarButton}
          onClick={() => handleAlign('bottom')}
          title="底部对齐"
          aria-label="Align bottom"
          style={{ color: tokens.colors.panel.text }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="6" y1="21" x2="18" y2="21" />
            <rect x="6" y="7" width="4" height="10" />
            <rect x="14" y="3" width="4" height="14" />
          </svg>
        </button>
      </div>

      {selectedCount >= 3 && (
        <>
          <div 
            className={styles.divider}
            style={{ background: tokens.colors.panel.border }}
          />

          <div className={styles.section}>
            <span 
              className={styles.label}
              style={{ color: tokens.colors.panel.textSecondary }}
            >
              分布:
            </span>

            <button
              className={styles.toolbarButton}
              onClick={() => handleDistribute('horizontal')}
              title="水平分布"
              aria-label="Distribute horizontally"
              style={{ color: tokens.colors.panel.text }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="8" width="4" height="8" />
                <rect x="10" y="8" width="4" height="8" />
                <rect x="17" y="8" width="4" height="8" />
              </svg>
            </button>

            <button
              className={styles.toolbarButton}
              onClick={() => handleDistribute('vertical')}
              title="垂直分布"
              aria-label="Distribute vertically"
              style={{ color: tokens.colors.panel.text }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="3" width="8" height="4" />
                <rect x="8" y="10" width="8" height="4" />
                <rect x="8" y="17" width="8" height="4" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AlignmentToolbar;
