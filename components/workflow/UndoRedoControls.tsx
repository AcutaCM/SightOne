/**
 * UndoRedoControls Component
 * 
 * Provides undo/redo controls for workflow operations.
 * Displays buttons with keyboard shortcut hints.
 * 
 * Features:
 * - Undo button (Ctrl+Z)
 * - Redo button (Ctrl+Y)
 * - Disabled state when unavailable
 * - Keyboard shortcut hints
 * 
 * Requirements: 10.4
 */

'use client';

import React from 'react';
import { Button, ButtonGroup, Tooltip } from '@heroui/react';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import { HistoryManager } from '../../lib/workflow/historyManager';
import styles from '../../styles/UndoRedoControls.module.css';

export interface UndoRedoControlsProps {
  historyManager: HistoryManager;
  className?: string;
}

/**
 * UndoRedoControls Component
 * 
 * Provides UI controls for undo/redo operations.
 * Implements requirement 10.4 for undo/redo functionality.
 */
const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
  historyManager,
  className,
}) => {
  const { theme, tokens } = useWorkflowTheme();
  const [stats, setStats] = React.useState(historyManager.getStats());

  // Update stats when history changes
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(historyManager.getStats());
    }, 100);

    return () => clearInterval(interval);
  }, [historyManager]);

  const handleUndo = () => {
    historyManager.undo();
    setStats(historyManager.getStats());
  };

  const handleRedo = () => {
    historyManager.redo();
    setStats(historyManager.getStats());
  };

  return (
    <div 
      className={`${styles.controls} ${className || ''}`}
      data-theme={theme}
      style={{
        background: tokens.colors.panel.background,
        border: `1px solid ${tokens.colors.panel.border}`,
        boxShadow: tokens.shadows.md,
      }}
    >
      <ButtonGroup size="sm" variant="flat">
        <Tooltip 
          content={
            <div className={styles.tooltip}>
              <div>撤销</div>
              <kbd className={styles.kbd}>Ctrl+Z</kbd>
            </div>
          }
          placement="bottom"
        >
          <Button
            isIconOnly
            isDisabled={!stats.canUndo}
            onPress={handleUndo}
            aria-label="撤销"
          >
            <ArrowUturnLeftIcon className={styles.icon} />
          </Button>
        </Tooltip>

        <Tooltip 
          content={
            <div className={styles.tooltip}>
              <div>重做</div>
              <kbd className={styles.kbd}>Ctrl+Y</kbd>
            </div>
          }
          placement="bottom"
        >
          <Button
            isIconOnly
            isDisabled={!stats.canRedo}
            onPress={handleRedo}
            aria-label="重做"
          >
            <ArrowUturnRightIcon className={styles.icon} />
          </Button>
        </Tooltip>
      </ButtonGroup>

      {/* History info */}
      <div className={styles.info}>
        {stats.currentIndex + 1} / {stats.size}
      </div>
    </div>
  );
};

export default UndoRedoControls;
