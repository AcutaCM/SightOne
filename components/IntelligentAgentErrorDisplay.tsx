/**
 * Intelligent Agent Error Display Component
 * 
 * Displays user-friendly error messages with recovery suggestions.
 * 
 * Requirements: 8.1, 8.2, 8.3
 */

'use client';

import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Link } from '@heroui/react';
import {
  IntelligentAgentError,
  ErrorSeverity,
  getRecoverySuggestions,
  ErrorRecoverySuggestion,
} from '@/lib/errors/intelligentAgentErrors';

interface IntelligentAgentErrorDisplayProps {
  error: IntelligentAgentError;
  onRetry?: () => void;
  onDismiss?: () => void;
  onOpenSettings?: () => void;
  showTechnicalDetails?: boolean;
}

/**
 * Get severity color for UI
 */
function getSeverityColor(severity: ErrorSeverity): 'default' | 'primary' | 'warning' | 'danger' {
  switch (severity) {
    case ErrorSeverity.LOW:
      return 'default';
    case ErrorSeverity.MEDIUM:
      return 'primary';
    case ErrorSeverity.HIGH:
      return 'warning';
    case ErrorSeverity.CRITICAL:
      return 'danger';
    default:
      return 'default';
  }
}

/**
 * Get severity icon
 */
function getSeverityIcon(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.LOW:
      return 'ℹ️';
    case ErrorSeverity.MEDIUM:
      return '⚠️';
    case ErrorSeverity.HIGH:
      return '❌';
    case ErrorSeverity.CRITICAL:
      return '🚨';
    default:
      return 'ℹ️';
  }
}

/**
 * Intelligent Agent Error Display Component
 */
export const IntelligentAgentErrorDisplay: React.FC<IntelligentAgentErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  onOpenSettings,
  showTechnicalDetails = false,
}) => {
  const suggestions = getRecoverySuggestions(error);
  const severityColor = getSeverityColor(error.severity);
  const severityIcon = getSeverityIcon(error.severity);

  const handleSuggestionAction = (suggestion: ErrorRecoverySuggestion) => {
    if (suggestion.action === 'open_settings' && onOpenSettings) {
      onOpenSettings();
    } else if (suggestion.link) {
      window.open(suggestion.link, '_blank');
    }
  };

  return (
    <Card className="w-full border-2" style={{ borderColor: `var(--heroui-${severityColor})` }}>
      <CardHeader className="flex gap-3 items-start">
        <div className="text-2xl">{severityIcon}</div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg font-semibold">操作失败</h4>
            <Chip size="sm" color={severityColor} variant="flat">
              {error.severity}
            </Chip>
          </div>
          <p className="text-default-600">{error.userMessage}</p>
        </div>
      </CardHeader>

      <CardBody className="gap-4">
        {/* User Command Context */}
        {error.context?.userCommand && (
          <div className="bg-default-100 p-3 rounded-lg">
            <p className="text-sm text-default-500 mb-1">您的指令：</p>
            <p className="text-sm font-mono">"{error.context.userCommand}"</p>
          </div>
        )}

        {/* Recovery Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold mb-2">💡 解决建议：</h5>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-default-50 p-3 rounded-lg hover:bg-default-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">{suggestion.title}</p>
                      <p className="text-xs text-default-500">{suggestion.description}</p>
                    </div>
                    {(suggestion.action || suggestion.link) && (
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() => handleSuggestionAction(suggestion)}
                      >
                        {suggestion.action === 'open_settings' ? '打开设置' : '查看'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Details (Collapsible) */}
        {showTechnicalDetails && (
          <details className="bg-default-100 p-3 rounded-lg">
            <summary className="text-sm font-medium cursor-pointer text-default-600 hover:text-default-900">
              🔧 技术详情（开发者）
            </summary>
            <div className="mt-2 space-y-2">
              <div>
                <p className="text-xs text-default-500">错误类型：</p>
                <p className="text-xs font-mono">{error.type}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">技术消息：</p>
                <p className="text-xs font-mono">{error.technicalMessage}</p>
              </div>
              {error.context && Object.keys(error.context).length > 0 && (
                <div>
                  <p className="text-xs text-default-500">上下文：</p>
                  <pre className="text-xs font-mono bg-default-200 p-2 rounded overflow-x-auto">
                    {JSON.stringify(error.context, null, 2)}
                  </pre>
                </div>
              )}
              {error.stack && (
                <div>
                  <p className="text-xs text-default-500">堆栈跟踪：</p>
                  <pre className="text-xs font-mono bg-default-200 p-2 rounded overflow-x-auto max-h-40">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          {onDismiss && (
            <Button size="sm" variant="light" onPress={onDismiss}>
              关闭
            </Button>
          )}
          {error.recoverable && onRetry && (
            <Button size="sm" color="primary" onPress={onRetry}>
              重试
            </Button>
          )}
        </div>

        {/* Help Link */}
        <div className="text-center">
          <Link
            href="/docs/intelligent-agent-troubleshooting"
            size="sm"
            className="text-default-500"
          >
            查看完整故障排除指南 →
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};

/**
 * Compact error display for inline use
 */
export const IntelligentAgentErrorCompact: React.FC<{
  error: IntelligentAgentError;
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  const severityColor = getSeverityColor(error.severity);
  const severityIcon = getSeverityIcon(error.severity);

  return (
    <div
      className="flex items-center gap-2 p-3 rounded-lg border-l-4"
      style={{ borderLeftColor: `var(--heroui-${severityColor})` }}
    >
      <span className="text-xl">{severityIcon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{error.userMessage}</p>
      </div>
      {error.recoverable && onRetry && (
        <Button size="sm" variant="flat" color="primary" onPress={onRetry}>
          重试
        </Button>
      )}
    </div>
  );
};

/**
 * Error toast notification
 */
export const IntelligentAgentErrorToast: React.FC<{
  error: IntelligentAgentError;
  onClose?: () => void;
}> = ({ error, onClose }) => {
  const severityIcon = getSeverityIcon(error.severity);

  return (
    <div className="bg-content1 shadow-lg rounded-lg p-4 max-w-md">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{severityIcon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">操作失败</p>
          <p className="text-xs text-default-600">{error.userMessage}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-default-400 hover:text-default-600"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
