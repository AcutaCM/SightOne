/**
 * NodeSelectionOverlay Component
 * 
 * Visual overlay for selected nodes with enhanced effects.
 * Provides clear visual feedback for single and multi-selection.
 * 
 * Features:
 * - Glow border effect for selected nodes
 * - Multi-selection indicator
 * - Selection count badge
 * - Animated selection effects
 */

'use client';

import React from 'react';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import styles from '../../styles/NodeSelectionOverlay.module.css';

export interface NodeSelectionOverlayProps {
  isSelected: boolean;
  isMultiSelected?: boolean;
  selectionIndex?: number;
  totalSelected?: number;
  className?: string;
}

/**
 * NodeSelectionOverlay Component
 * 
 * Renders a visual overlay for selected nodes.
 */
const NodeSelectionOverlay: React.FC<NodeSelectionOverlayProps> = ({
  isSelected,
  isMultiSelected = false,
  selectionIndex,
  totalSelected,
  className = '',
}) => {
  const { tokens } = useWorkflowTheme();

  if (!isSelected) {
    return null;
  }

  return (
    <>
      {/* Selection glow border */}
      <div 
        className={`${styles.selectionGlow} ${className}`}
        style={{
          boxShadow: tokens.shadows.glowPrimary,
          borderColor: tokens.colors.node.selectedBorder,
        }}
      />

      {/* Multi-selection indicator */}
      {isMultiSelected && selectionIndex !== undefined && (
        <div 
          className={styles.multiSelectBadge}
          style={{
            background: tokens.colors.node.selectedBorder,
          }}
        >
          <span className={styles.badgeNumber}>
            {selectionIndex + 1}
          </span>
          {totalSelected !== undefined && totalSelected > 1 && (
            <span className={styles.badgeTotal}>
              / {totalSelected}
            </span>
          )}
        </div>
      )}

      {/* Selection corners (decorative) */}
      <div className={styles.selectionCorners}>
        <div 
          className={`${styles.corner} ${styles.topLeft}`}
          style={{ borderColor: tokens.colors.node.selectedBorder }}
        />
        <div 
          className={`${styles.corner} ${styles.topRight}`}
          style={{ borderColor: tokens.colors.node.selectedBorder }}
        />
        <div 
          className={`${styles.corner} ${styles.bottomLeft}`}
          style={{ borderColor: tokens.colors.node.selectedBorder }}
        />
        <div 
          className={`${styles.corner} ${styles.bottomRight}`}
          style={{ borderColor: tokens.colors.node.selectedBorder }}
        />
      </div>
    </>
  );
};

export default NodeSelectionOverlay;
