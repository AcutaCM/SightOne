/**
 * ActionButtons Component
 * 
 * Action button group for the control panel that provides:
 * - Run/Stop buttons with gradient colors and large size
 * - Save/Load/Clear buttons
 * - AI Generate button
 * - Button state and disabled logic
 * 
 * Requirements: 5.2
 */

'use client';

import React from 'react';
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import styles from '@/styles/ActionButtons.module.css';

export interface ActionButtonsProps {
  /**
   * Whether workflow is currently running
   */
  isRunning: boolean;
  
  /**
   * Whether there are unsaved changes
   */
  hasUnsavedChanges?: boolean;
  
  /**
   * Whether the workflow is empty
   */
  isEmpty?: boolean;
  
  /**
   * Callback when run button is clicked
   */
  onRun: () => void;
  
  /**
   * Callback when stop button is clicked
   */
  onStop: () => void;
  
  /**
   * Callback when save button is clicked
   */
  onSave: () => void;
  
  /**
   * Callback when load button is clicked
   */
  onLoad?: () => void;
  
  /**
   * Callback when clear button is clicked
   */
  onClear: () => void;
  
  /**
   * Callback when AI generate button is clicked
   */
  onAIGenerate?: () => void;
}

/**
 * ActionButtons Component
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isRunning,
  hasUnsavedChanges = false,
  isEmpty = false,
  onRun,
  onStop,
  onSave,
  onLoad,
  onClear,
  onAIGenerate,
}) => {
  const { theme } = useWorkflowTheme();
  
  return (
    <div className={styles.container} data-theme={theme}>
      {/* Primary Actions */}
      <div className={styles.primaryActions}>
        {!isRunning ? (
          <button
            className={`${styles.button} ${styles.runButton}`}
            onClick={onRun}
            disabled={isEmpty}
            aria-label="运行工作流"
            title="运行工作流"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={styles.buttonIcon}
            >
              <path
                d="M6 4L14 10L6 16V4Z"
                fill="currentColor"
              />
            </svg>
            <span className={styles.buttonText}>运行</span>
          </button>
        ) : (
          <button
            className={`${styles.button} ${styles.stopButton}`}
            onClick={onStop}
            aria-label="停止工作流"
            title="停止工作流"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className={styles.buttonIcon}
            >
              <rect
                x="5"
                y="5"
                width="10"
                height="10"
                rx="2"
                fill="currentColor"
              />
            </svg>
            <span className={styles.buttonText}>停止</span>
          </button>
        )}
      </div>
      
      {/* Secondary Actions */}
      <div className={styles.secondaryActions}>
        {/* Save Button */}
        <button
          className={`${styles.button} ${styles.secondaryButton} ${
            hasUnsavedChanges ? styles.hasChanges : ''
          }`}
          onClick={onSave}
          disabled={isEmpty}
          aria-label="保存工作流"
          title="保存工作流"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={styles.buttonIcon}
          >
            <path
              d="M12 2H4C3.44772 2 3 2.44772 3 3V13C3 13.5523 3.44772 14 4 14H12C12.5523 14 13 13.5523 13 13V3C13 2.44772 12.5523 2 12 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 2V6H6V2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 10H10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className={styles.buttonText}>保存</span>
          {hasUnsavedChanges && <span className={styles.changeIndicator} />}
        </button>
        
        {/* Load Button */}
        {onLoad && (
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={onLoad}
            aria-label="加载工作流"
            title="加载工作流"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={styles.buttonIcon}
            >
              <path
                d="M8 2V8M8 8L11 5M8 8L5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 10V12C3 13.1046 3.89543 14 5 14H11C12.1046 14 13 13.1046 13 12V10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.buttonText}>加载</span>
          </button>
        )}
        
        {/* Clear Button */}
        <button
          className={`${styles.button} ${styles.secondaryButton} ${styles.dangerButton}`}
          onClick={onClear}
          disabled={isEmpty}
          aria-label="清空工作流"
          title="清空工作流"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={styles.buttonIcon}
          >
            <path
              d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.buttonText}>清空</span>
        </button>
      </div>
      
      {/* AI Generate Button */}
      {onAIGenerate && (
        <div className={styles.aiAction}>
          <button
            className={`${styles.button} ${styles.aiButton}`}
            onClick={onAIGenerate}
            aria-label="AI生成工作流"
            title="AI生成工作流"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={styles.buttonIcon}
            >
              <path
                d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z"
                fill="currentColor"
              />
              <circle cx="12" cy="4" r="1" fill="currentColor" />
              <circle cx="4" cy="12" r="1" fill="currentColor" />
            </svg>
            <span className={styles.buttonText}>AI生成</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;
