// 工作流验证按钮组件
'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Shield } from 'lucide-react';
import { validateWorkflow, canExecuteWorkflow } from '@/lib/workflow/workflowValidator';
import { WorkflowNode, WorkflowEdge } from '@/lib/workflowEngine';
import WorkflowValidationPanel from './WorkflowValidationPanel';

interface WorkflowValidationButtonProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodeSelect?: (nodeId: string) => void;
  showPanel?: boolean;
  autoValidate?: boolean;
}

export default function WorkflowValidationButton({
  nodes,
  edges,
  onNodeSelect,
  showPanel = false,
  autoValidate = true
}: WorkflowValidationButtonProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(showPanel);
  const [validationStatus, setValidationStatus] = useState<{
    valid: boolean;
    errorCount: number;
    warningCount: number;
  } | null>(null);

  useEffect(() => {
    if (autoValidate) {
      performValidation();
    }
  }, [nodes, edges, autoValidate]);

  const performValidation = () => {
    const result = validateWorkflow(nodes, edges);
    setValidationStatus({
      valid: result.valid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length
    });
  };

  const handleButtonClick = () => {
    performValidation();
    setIsPanelOpen(!isPanelOpen);
  };

  const getButtonStyle = () => {
    if (!validationStatus) {
      return 'bg-gray-600 hover:bg-gray-700';
    }

    if (validationStatus.valid) {
      return 'bg-green-600 hover:bg-green-700';
    }

    if (validationStatus.errorCount > 0) {
      return 'bg-red-600 hover:bg-red-700';
    }

    return 'bg-yellow-600 hover:bg-yellow-700';
  };

  const getIcon = () => {
    if (!validationStatus) {
      return <Shield size={18} />;
    }

    if (validationStatus.valid) {
      return <CheckCircle size={18} />;
    }

    if (validationStatus.errorCount > 0) {
      return <AlertCircle size={18} />;
    }

    return <AlertTriangle size={18} />;
  };

  const getStatusText = () => {
    if (!validationStatus) {
      return '验证工作流';
    }

    if (validationStatus.valid) {
      return '验证通过';
    }

    const parts = [];
    if (validationStatus.errorCount > 0) {
      parts.push(`${validationStatus.errorCount}个错误`);
    }
    if (validationStatus.warningCount > 0) {
      parts.push(`${validationStatus.warningCount}个警告`);
    }

    return parts.join(', ');
  };

  return (
    <div className="relative">
      <button
        onClick={handleButtonClick}
        className={`${getButtonStyle()} text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg`}
        title="验证工作流"
      >
        {getIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </button>

      {isPanelOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 z-50 shadow-2xl">
          <WorkflowValidationPanel
            nodes={nodes}
            edges={edges}
            onClose={() => setIsPanelOpen(false)}
            onNodeSelect={onNodeSelect}
            autoValidate={false}
          />
        </div>
      )}
    </div>
  );
}

/**
 * 工作流执行前验证组件
 */
export function WorkflowExecutionGuard({
  nodes,
  edges,
  onProceed,
  onCancel
}: {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onProceed: () => void;
  onCancel: () => void;
}) {
  const { canExecute, reason } = canExecuteWorkflow(nodes, edges);

  if (canExecute) {
    onProceed();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1E3A5F] rounded-lg p-6 max-w-md text-white">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-400" size={32} />
          <h3 className="text-xl font-semibold">无法执行工作流</h3>
        </div>

        <p className="text-gray-300 mb-6">{reason}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-[#64FFDA] hover:bg-[#4ADDC0] text-[#0A192F] px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            修复问题
          </button>
        </div>
      </div>
    </div>
  );
}
