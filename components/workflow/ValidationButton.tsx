/**
 * ValidationButton Component
 * 
 * Button to trigger workflow validation and display results.
 * Shows validation status with color-coded indicators.
 * 
 * Features:
 * - Trigger validation
 * - Display validation status
 * - Show error/warning count
 * - Open validation panel
 * 
 * Requirements: 10.5
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button, Badge, Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import { validateWorkflow, ValidationResult } from '../../lib/workflow/workflowValidator';
import WorkflowValidationPanel from './WorkflowValidationPanel';
import { WorkflowNode, WorkflowEdge } from '../../lib/workflowEngine';
import styles from '../../styles/ValidationButton.module.css';

export interface ValidationButtonProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodeSelect?: (nodeId: string) => void;
  autoValidate?: boolean;
  className?: string;
}

/**
 * ValidationButton Component
 * 
 * Provides a button to trigger workflow validation.
 * Implements requirement 10.5 for workflow validation.
 */
const ValidationButton: React.FC<ValidationButtonProps> = ({
  nodes,
  edges,
  onNodeSelect,
  autoValidate = false,
  className,
}) => {
  const { theme, tokens } = useWorkflowTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Validate workflow
  const handleValidate = useCallback(() => {
    const result = validateWorkflow(nodes, edges);
    setValidationResult(result);
    setIsOpen(true);
  }, [nodes, edges]);

  // Auto-validate when nodes or edges change
  React.useEffect(() => {
    if (autoValidate) {
      const result = validateWorkflow(nodes, edges);
      setValidationResult(result);
    }
  }, [nodes, edges, autoValidate]);

  // Determine button color based on validation status
  const buttonColor = useMemo(() => {
    if (!validationResult) return 'default';
    if (validationResult.valid) return 'success';
    if (validationResult.errors.length > 0) return 'danger';
    if (validationResult.warnings.length > 0) return 'warning';
    return 'default';
  }, [validationResult]);

  // Get icon based on validation status
  const getIcon = () => {
    if (!validationResult) return null;
    if (validationResult.valid) {
      return <CheckCircleIcon className={styles.icon} />;
    }
    if (validationResult.errors.length > 0) {
      return <ExclamationCircleIcon className={styles.icon} />;
    }
    if (validationResult.warnings.length > 0) {
      return <ExclamationTriangleIcon className={styles.icon} />;
    }
    return null;
  };

  // Get badge content
  const getBadgeContent = () => {
    if (!validationResult) return null;
    const errorCount = validationResult.errors.length;
    const warningCount = validationResult.warnings.length;
    
    if (errorCount > 0) return errorCount;
    if (warningCount > 0) return warningCount;
    return null;
  };

  const badgeContent = getBadgeContent();

  return (
    <>
      <Badge
        content={badgeContent}
        color={buttonColor === 'danger' ? 'danger' : buttonColor === 'warning' ? 'warning' : undefined}
        isInvisible={!badgeContent}
        className={styles.badge}
      >
        <Button
          size="sm"
          color={buttonColor}
          variant="flat"
          startContent={getIcon()}
          onPress={handleValidate}
          className={`${styles.button} ${className || ''}`}
        >
          验证工作流
        </Button>
      </Badge>

      {/* Validation Panel Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: styles.modal,
          backdrop: styles.backdrop,
        }}
      >
        <ModalContent>
          <ModalHeader className={styles.modalHeader}>
            工作流验证结果
          </ModalHeader>
          <ModalBody className={styles.modalBody}>
            <WorkflowValidationPanel
              nodes={nodes}
              edges={edges}
              onNodeSelect={(nodeId) => {
                onNodeSelect?.(nodeId);
                setIsOpen(false);
              }}
              autoValidate={false}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ValidationButton;
