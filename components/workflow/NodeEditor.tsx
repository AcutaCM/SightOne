/**
 * NodeEditor Component
 * 
 * Sidebar-style node editor that slides in from the right when a node is double-clicked.
 * Provides a comprehensive interface for editing node parameters with validation and presets.
 * 
 * Features:
 * - Slide-in animation from right side
 * - Theme-aware styling
 * - Parameter form with validation
 * - Preset templates
 * - Save/Cancel actions with confirmation
 * - Unsaved changes tracking
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import NodeParameterForm from './NodeParameterForm';
import NodePresets from './NodePresets';
import { WorkflowNodeDefinition, ParameterValidator } from '../../lib/workflow/nodeDefinitions';
import styles from '../../styles/NodeEditor.module.css';

export interface NodeEditorProps {
  /** Whether the editor is open */
  isOpen: boolean;
  
  /** Node ID being edited */
  nodeId: string | null;
  
  /** Node definition with parameters */
  nodeDefinition: WorkflowNodeDefinition | null;
  
  /** Current parameter values */
  parameters: Record<string, any>;
  
  /** Callback when editor closes */
  onClose: () => void;
  
  /** Callback when parameters are saved */
  onSave: (nodeId: string, parameters: Record<string, any>) => void;
  
  /** Optional callback when preset is applied */
  onPresetApply?: (preset: Record<string, any>) => void;
}

/**
 * NodeEditor Component
 * 
 * A slide-in sidebar editor for configuring workflow node parameters.
 * Implements requirement 6.1 - sidebar popup editor with animations.
 */
const NodeEditor: React.FC<NodeEditorProps> = ({
  isOpen,
  nodeId,
  nodeDefinition,
  parameters,
  onClose,
  onSave,
  onPresetApply,
}) => {
  const { theme, tokens } = useWorkflowTheme();
  
  // Local state for parameter values
  const [localParameters, setLocalParameters] = useState<Record<string, any>>(parameters);
  
  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Show confirmation dialog
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Active tab (parameters or presets)
  const [activeTab, setActiveTab] = useState<'parameters' | 'presets'>('parameters');

  // Update local parameters when props change
  useEffect(() => {
    if (isOpen) {
      setLocalParameters(parameters);
      setHasUnsavedChanges(false);
      setValidationErrors({});
      setActiveTab('parameters');
    }
  }, [isOpen, parameters]);

  // Handle parameter change
  const handleParameterChange = useCallback((name: string, value: any) => {
    setLocalParameters(prev => {
      const updated = { ...prev, [name]: value };
      
      // Validate the changed parameter
      if (nodeDefinition) {
        const param = nodeDefinition.parameters.find(p => p.name === name);
        if (param) {
          const validation = ParameterValidator.validateParameter(param, value, updated);
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (!validation.valid && validation.error) {
              newErrors[name] = validation.error;
            } else {
              delete newErrors[name];
            }
            return newErrors;
          });
        }
      }
      
      return updated;
    });
    
    setHasUnsavedChanges(true);
  }, [nodeDefinition]);

  // Handle preset application
  const handlePresetApply = useCallback((preset: Record<string, any>) => {
    setLocalParameters(preset);
    setHasUnsavedChanges(true);
    setActiveTab('parameters');
    
    // Validate all parameters after applying preset
    if (nodeDefinition) {
      const validation = ParameterValidator.validateAllParameters(
        nodeDefinition.parameters,
        preset
      );
      setValidationErrors(validation.errors);
    }
    
    if (onPresetApply) {
      onPresetApply(preset);
    }
  }, [nodeDefinition, onPresetApply]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!nodeId || !nodeDefinition) return;
    
    // Validate all parameters before saving
    const validation = ParameterValidator.validateAllParameters(
      nodeDefinition.parameters,
      localParameters
    );
    
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    // Save parameters
    onSave(nodeId, localParameters);
    setHasUnsavedChanges(false);
    onClose();
  }, [nodeId, nodeDefinition, localParameters, onSave, onClose]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Confirm cancel
  const handleConfirmCancel = useCallback(() => {
    setShowCancelConfirm(false);
    setHasUnsavedChanges(false);
    onClose();
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }, [handleCancel]);

  // Check if save button should be disabled
  const isSaveDisabled = !hasUnsavedChanges || Object.keys(validationErrors).length > 0;

  if (!isOpen || !nodeDefinition) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={handleBackdropClick}
        data-theme={theme}
      />

      {/* Editor Panel */}
      <div
        className={`${styles.editor} ${isOpen ? styles.editorOpen : ''}`}
        data-theme={theme}
        style={{
          '--editor-bg': tokens.colors.panel.background,
          '--editor-border': tokens.colors.panel.border,
          '--editor-text': tokens.colors.panel.text,
        } as React.CSSProperties}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon} style={{ color: nodeDefinition.color }}>
              {nodeDefinition.icon && <nodeDefinition.icon size={24} />}
            </div>
            <div className={styles.headerText}>
              <h2 className={styles.title}>{nodeDefinition.label}</h2>
              <p className={styles.subtitle}>{nodeDefinition.description}</p>
            </div>
          </div>
          <button
            className={styles.closeButton}
            onClick={handleCancel}
            aria-label="关闭编辑器"
          >
            <X size={20} />
          </button>
        </div>

        {/* Unsaved Changes Indicator */}
        {hasUnsavedChanges && (
          <div className={styles.unsavedBanner}>
            <div className={styles.unsavedDot} />
            <span>有未保存的更改</span>
          </div>
        )}

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'parameters' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('parameters')}
          >
            参数配置
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'presets' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            预设模板
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {activeTab === 'parameters' ? (
            <NodeParameterForm
              parameters={nodeDefinition.parameters}
              values={localParameters}
              errors={validationErrors}
              onChange={handleParameterChange}
            />
          ) : (
            <NodePresets
              nodeType={nodeDefinition.type}
              currentParameters={localParameters}
              onApply={handlePresetApply}
            />
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            取消
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
            保存更改
          </button>
        </div>

        {/* Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <div className={styles.confirmDialog}>
            <div className={styles.confirmContent}>
              <h3 className={styles.confirmTitle}>放弃更改？</h3>
              <p className={styles.confirmMessage}>
                您有未保存的更改，确定要放弃这些更改吗？
              </p>
              <div className={styles.confirmActions}>
                <button
                  className={styles.confirmCancel}
                  onClick={() => setShowCancelConfirm(false)}
                >
                  继续编辑
                </button>
                <button
                  className={styles.confirmOk}
                  onClick={handleConfirmCancel}
                >
                  放弃更改
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NodeEditor;
