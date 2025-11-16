/**
 * AlignmentLines Component
 * 
 * Displays alignment guide lines when dragging nodes.
 * Implements requirement 3.5 from the design specification.
 */

'use client';

import React from 'react';
import { AlignmentLine } from '../../lib/workflow/alignmentHelper';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import styles from '../../styles/AlignmentLines.module.css';

export interface AlignmentLinesProps {
  lines: AlignmentLine[];
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * AlignmentLines Component
 * 
 * Renders visual guide lines for node alignment.
 */
const AlignmentLines: React.FC<AlignmentLinesProps> = ({
  lines,
  canvasWidth,
  canvasHeight,
}) => {
  const { tokens } = useWorkflowTheme();

  if (lines.length === 0) {
    return null;
  }

  return (
    <svg
      className={styles.alignmentLines}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {lines.map(line => {
        if (line.type === 'horizontal') {
          return (
            <line
              key={line.id}
              x1={0}
              y1={line.position}
              x2={canvasWidth}
              y2={line.position}
              stroke={tokens.colors.node.selectedBorder}
              strokeWidth={1}
              strokeDasharray="5,5"
              className={styles.alignmentLine}
            />
          );
        } else {
          return (
            <line
              key={line.id}
              x1={line.position}
              y1={0}
              x2={line.position}
              y2={canvasHeight}
              stroke={tokens.colors.node.selectedBorder}
              strokeWidth={1}
              strokeDasharray="5,5"
              className={styles.alignmentLine}
            />
          );
        }
      })}
    </svg>
  );
};

export default AlignmentLines;
