// 工作流验证面板组件
'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  X,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { 
  WorkflowValidator, 
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationSuggestion
} from '@/lib/workflow/workflowValidator';
import { WorkflowNode, WorkflowEdge } from '@/lib/workflowEngine';

interface WorkflowValidationPanelProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onClose?: () => void;
  onNodeSelect?: (nodeId: string) => void;
  autoValidate?: boolean;
}

export default function WorkflowValidationPanel({
  nodes,
  edges,
  onClose,
  onNodeSelect,
  autoValidate = true
}: WorkflowValidationPanelProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    errors: true,
    warnings: true,
    suggestions: true
  });

  useEffect(() => {
    if (autoValidate) {
      validateWorkflow();
    }
  }, [nodes, edges, autoValidate]);

  const validateWorkflow = () => {
    const validator = new WorkflowValidator(nodes, edges);
    const result = validator.validate();
    setValidationResult(result);
  };

  const toggleSection = (section: 'errors' | 'warnings' | 'suggestions') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNodeClick = (nodeId?: string) => {
    if (nodeId && onNodeSelect) {
      onNodeSelect(nodeId);
    }
  };

  if (!validationResult) {
    return (
      <div className="bg-[#1E3A5F] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">工作流验证</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <button
          onClick={validateWorkflow}
          className="w-full bg-[#64FFDA] text-[#0A192F] px-4 py-2 rounded-lg hover:bg-[#4ADDC0] transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          开始验证
        </button>
      </div>
    );
  }

  const { valid, errors, warnings, suggestions } = validationResult;

  return (
    <div className="bg-[#1E3A5F] rounded-lg p-6 text-white max-h-[600px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">工作流验证</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={validateWorkflow}
            className="text-[#64FFDA] hover:text-[#4ADDC0] transition-colors"
            title="重新验证"
          >
            <RefreshCw size={18} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="mb-6">
        {valid ? (
          <div className="flex items-center gap-3 bg-green-900/30 border border-green-500/50 rounded-lg p-4">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <div className="font-semibold text-green-400">验证通过</div>
              <div className="text-sm text-gray-300">工作流没有发现问题</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
            <AlertCircle className="text-red-400" size={24} />
            <div>
              <div className="font-semibold text-red-400">验证失败</div>
              <div className="text-sm text-gray-300">
                发现 {errors.length} 个错误, {warnings.length} 个警告
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Errors Section */}
      {errors.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('errors')}
            className="w-full flex items-center justify-between bg-red-900/20 border border-red-500/30 rounded-lg p-3 hover:bg-red-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-400" size={20} />
              <span className="font-semibold text-red-400">
                错误 ({errors.length})
              </span>
            </div>
            {expandedSections.errors ? (
              <ChevronDown size={20} className="text-red-400" />
            ) : (
              <ChevronRight size={20} className="text-red-400" />
            )}
          </button>

          {expandedSections.errors && (
            <div className="mt-2 space-y-2">
              {errors.map((error, index) => (
                <ErrorItem
                  key={index}
                  error={error}
                  onNodeClick={handleNodeClick}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('warnings')}
            className="w-full flex items-center justify-between bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 hover:bg-yellow-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-400" size={20} />
              <span className="font-semibold text-yellow-400">
                警告 ({warnings.length})
              </span>
            </div>
            {expandedSections.warnings ? (
              <ChevronDown size={20} className="text-yellow-400" />
            ) : (
              <ChevronRight size={20} className="text-yellow-400" />
            )}
          </button>

          {expandedSections.warnings && (
            <div className="mt-2 space-y-2">
              {warnings.map((warning, index) => (
                <WarningItem
                  key={index}
                  warning={warning}
                  onNodeClick={handleNodeClick}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection('suggestions')}
            className="w-full flex items-center justify-between bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 hover:bg-blue-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="text-blue-400" size={20} />
              <span className="font-semibold text-blue-400">
                修复建议 ({suggestions.length})
              </span>
            </div>
            {expandedSections.suggestions ? (
              <ChevronDown size={20} className="text-blue-400" />
            ) : (
              <ChevronRight size={20} className="text-blue-400" />
            )}
          </button>

          {expandedSections.suggestions && (
            <div className="mt-2 space-y-2">
              {suggestions.map((suggestion, index) => (
                <SuggestionItem key={index} suggestion={suggestion} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Error Item Component
function ErrorItem({ 
  error, 
  onNodeClick 
}: { 
  error: ValidationError; 
  onNodeClick: (nodeId?: string) => void;
}) {
  return (
    <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
        <div className="flex-1">
          <div className="text-sm text-red-300">{error.message}</div>
          {error.nodeId && (
            <button
              onClick={() => onNodeClick(error.nodeId)}
              className="text-xs text-red-400 hover:text-red-300 underline mt-1"
            >
              定位到节点
            </button>
          )}
          {error.details && (
            <div className="text-xs text-gray-400 mt-1">
              {JSON.stringify(error.details, null, 2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Warning Item Component
function WarningItem({ 
  warning, 
  onNodeClick 
}: { 
  warning: ValidationWarning; 
  onNodeClick: (nodeId?: string) => void;
}) {
  return (
    <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={16} />
        <div className="flex-1">
          <div className="text-sm text-yellow-300">{warning.message}</div>
          {warning.nodeId && (
            <button
              onClick={() => onNodeClick(warning.nodeId)}
              className="text-xs text-yellow-400 hover:text-yellow-300 underline mt-1"
            >
              定位到节点
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Suggestion Item Component
function SuggestionItem({ suggestion }: { suggestion: ValidationSuggestion }) {
  return (
    <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <Lightbulb className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
        <div className="flex-1">
          <div className="text-sm text-blue-300">{suggestion.message}</div>
          {suggestion.autoFixable && (
            <span className="inline-block text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded mt-1">
              可自动修复
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
