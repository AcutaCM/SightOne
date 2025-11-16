/**
 * Tello 错误显示组件
 * 显示友好的错误消息和恢复建议
 */

'use client';

import React from 'react';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { AlertCircle, RefreshCw, X, Info, AlertTriangle, XCircle } from 'lucide-react';
import styled from '@emotion/styled';
import type { WebSocketError } from '@/lib/errors/telloWebSocketErrors';
import type { AIParserError } from '@/lib/errors/telloAIParserErrors';
import type { CommandExecutionError } from '@/lib/errors/telloCommandExecutionErrors';

const ErrorCard = styled(Card)<{ severity?: 'low' | 'medium' | 'high' | 'critical' }>`
  border-left: 4px solid ${p => {
    switch (p.severity) {
      case 'low': return 'hsl(var(--heroui-warning))';
      case 'medium': return 'hsl(var(--heroui-warning))';
      case 'high': return 'hsl(var(--heroui-danger))';
      case 'critical': return 'hsl(var(--heroui-danger))';
      default: return 'hsl(var(--heroui-danger))';
    }
  }};
`;

const SuggestionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
  
  li {
    padding: 4px 0;
    padding-left: 20px;
    position: relative;
    
    &:before {
      content: '•';
      position: absolute;
      left: 8px;
      color: hsl(var(--heroui-primary));
    }
  }
`;

type ErrorType = WebSocketError | AIParserError | CommandExecutionError;

interface TelloErrorDisplayProps {
  error: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
  showSuggestions?: boolean;
}

export default function TelloErrorDisplay({
  error,
  onRetry,
  onDismiss,
  showSuggestions = true
}: TelloErrorDisplayProps) {
  // 获取错误图标
  const getErrorIcon = () => {
    if ('severity' in error) {
      switch (error.severity) {
        case 'low':
          return <Info size={20} />;
        case 'medium':
          return <AlertTriangle size={20} />;
        case 'high':
        case 'critical':
          return <XCircle size={20} />;
      }
    }
    return <AlertCircle size={20} />;
  };

  // 获取错误颜色
  const getErrorColor = (): 'default' | 'warning' | 'danger' => {
    if ('severity' in error) {
      switch (error.severity) {
        case 'low':
          return 'default';
        case 'medium':
          return 'warning';
        case 'high':
        case 'critical':
          return 'danger';
      }
    }
    return 'danger';
  };

  // 获取恢复建议
  const getSuggestions = (): string[] => {
    if ('type' in error) {
      // WebSocket 错误
      if (error.type === 'CONNECTION_FAILED' || error.type === 'CONNECTION_TIMEOUT') {
        return [
          '检查无人机后端服务是否正在运行',
          '确认端口 3002 未被占用',
          '检查防火墙设置',
          '尝试重启后端服务'
        ];
      }
      // AI 解析错误
      else if (error.type === 'API_KEY_MISSING' || error.type === 'API_KEY_INVALID') {
        return [
          '前往设置页面配置 AI API Key',
          '检查 API Key 是否正确',
          '确认 API Key 未过期',
          '尝试重新生成 API Key'
        ];
      }
      // 命令执行错误
      else if (error.type === 'DRONE_NOT_CONNECTED') {
        return [
          '点击连接按钮',
          '检查无人机电源',
          '检查 WiFi 连接',
          '重启无人机'
        ];
      }
    }
    
    return [
      '刷新页面重试',
      '检查网络连接',
      '查看控制台错误日志',
      '联系技术支持'
    ];
  };

  const severity = 'severity' in error ? error.severity : 'medium';

  return (
    <ErrorCard severity={severity} className="mb-4">
      <CardBody>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <Chip
              color={getErrorColor()}
              variant="flat"
              startContent={getErrorIcon()}
            >
              错误
            </Chip>
          </div>
          
          <div className="flex-1">
            <div className="font-semibold text-foreground mb-2">
              {error.message}
            </div>
            
            {showSuggestions && (
              <div className="text-sm text-foreground-600">
                <div className="font-medium mb-1">建议:</div>
                <SuggestionList>
                  {getSuggestions().map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </SuggestionList>
              </div>
            )}
            
            <div className="flex gap-2 mt-3">
              {error.retryable && onRetry && (
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<RefreshCw size={16} />}
                  onPress={onRetry}
                >
                  重试
                </Button>
              )}
              
              {onDismiss && (
                <Button
                  size="sm"
                  variant="light"
                  startContent={<X size={16} />}
                  onPress={onDismiss}
                >
                  关闭
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </ErrorCard>
  );
}
