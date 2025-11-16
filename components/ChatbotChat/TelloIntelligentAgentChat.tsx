'use client';

/**
 * Tello智能代理聊天组件 (重构版)
 * 直接在前端集成 AI 解析功能,无需 3004 端口
 * 仅通过 WebSocket 3002 与无人机后端通信
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Chip, Spinner, Avatar } from '@heroui/react';
import { Modal, message } from 'antd';
import { Send, Play, XCircle, StopCircle, Bot, User, Trash2 } from 'lucide-react';
import styled from '@emotion/styled';
import { TelloAIParser, type AIConfig, type DroneCommand as ParsedDroneCommand } from '@/lib/services/telloAIParser';
import TelloErrorDisplay from './TelloErrorDisplay';
import { 
  WebSocketErrorHandler, 
  type WebSocketError
} from '@/lib/errors/telloWebSocketErrors';
import { 
  AIParserErrorHandler,
  type AIParserError
} from '@/lib/errors/telloAIParserErrors';
import {
  CommandExecutionErrorHandler,
  type CommandExecutionError
} from '@/lib/errors/telloCommandExecutionErrors';
import { useTelloChatHistory } from '@/hooks/useTelloChatHistory';
import { useAssistants } from '@/contexts/AssistantContext';

// 消息气泡样式
const MessageBubble = styled.div<{ isUser: boolean }>`
  padding: 12px 16px;
  border-radius: 16px;
  background: ${p => p.isUser ? 'hsl(var(--heroui-primary))' : 'hsl(var(--heroui-content2))'};
  color: ${p => p.isUser ? 'hsl(var(--heroui-primary-foreground))' : 'hsl(var(--heroui-foreground))'};
  border: ${p => p.isUser ? 'none' : '1px solid hsl(var(--heroui-divider))'};
  box-shadow: 0 2px 8px hsl(0 0% 0% / 0.1);
  word-break: break-word;
`;

const MessageRow = styled.div<{ isUser: boolean }>`
  display: flex;
  justify-content: ${p => p.isUser ? 'flex-end' : 'flex-start'};
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
`;

const MessageContainer = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${p => p.isUser ? 'flex-end' : 'flex-start'};
  max-width: 75%;
`;

const CommandCard = styled.div`
  background: hsl(var(--heroui-content2));
  border: 1px solid hsl(var(--heroui-divider));
  border-radius: 12px;
  padding: 12px;
  margin: 8px 0;
`;

// 使用 TelloAIParser 的 DroneCommand 类型
type DroneCommand = ParsedDroneCommand;

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  commands?: DroneCommand[];
  timestamp: number; // Changed to number for localStorage compatibility
}

interface TelloIntelligentAgentChatProps {
  // AI 配置参数 (从 PureChat 传入)
  aiProvider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'qwen' | 'deepseek' | 'azure' | 'groq' | 'mistral' | 'openrouter';
  aiModel: string;
  aiApiKey?: string;
  aiBaseUrl?: string;
  aiEndpoint?: string;
  aiDeployment?: string;
  temperature?: number;
  maxTokens?: number;
  
  // WebSocket 配置 (仅使用 3002 端口)
  droneBackendUrl?: string;
  
  // 回调函数
  onCommandsGenerated?: (commands: DroneCommand[]) => void;
  onExecutionComplete?: (results: any[]) => void;
  onStatusUpdate?: (status: DroneStatus) => void;
}

// 无人机状态接口
export interface DroneStatus {
  connected: boolean;
  flying: boolean;
  battery: number;
  temperature: number;
  height: number;
  speed: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  wifi_signal: number;
  flight_time: number;
}

// 连接状态类型
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export default function TelloIntelligentAgentChat({
  aiProvider,
  aiModel,
  aiApiKey,
  aiBaseUrl,
  aiEndpoint,
  aiDeployment,
  temperature = 0.1,
  maxTokens = 1000,
  droneBackendUrl = 'ws://localhost:3002',
  onCommandsGenerated,
  onExecutionComplete,
  onStatusUpdate
}: TelloIntelligentAgentChatProps) {
  // Get assistant context for assistant ID
  const { activeAssistant } = useAssistants();
  const assistantId = activeAssistant?.id || 'tello-intelligent-agent';
  
  // Define initial welcome message
  const WELCOME_MESSAGE: Message = {
    id: '1',
    role: 'assistant',
    content: '你好!我是Tello智能代理。请用自然语言告诉我你想让无人机做什么,我会为你生成指令序列。',
    timestamp: Date.now()
  };
  
  // Use custom history hook for persistent chat history
  const {
    messages,
    setMessages,
    clearHistory,
    isLoading: isHistoryLoading,
    error: historyError
  } = useTelloChatHistory({
    assistantId,
    initialMessages: [WELCOME_MESSAGE],
    autoSave: true,
    saveDelay: 500
  });
  
  // 状态管理
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [droneStatus, setDroneStatus] = useState<DroneStatus | null>(null);
  const [executionProgress, setExecutionProgress] = useState<{ current: number; total: number } | null>(null);
  
  // 错误状态
  const [currentError, setCurrentError] = useState<WebSocketError | AIParserError | CommandExecutionError | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const aiParserRef = useRef<TelloAIParser | null>(null);
  const wsErrorHandlerRef = useRef<WebSocketErrorHandler>(new WebSocketErrorHandler());
  const cmdErrorHandlerRef = useRef<CommandExecutionErrorHandler>(new CommandExecutionErrorHandler());

  // 初始化 AI 解析器
  useEffect(() => {
    const aiConfig: AIConfig = {
      provider: aiProvider as any,
      model: aiModel,
      apiKey: aiApiKey,
      baseURL: aiBaseUrl,
      endpoint: aiEndpoint,
      deployment: aiDeployment,
      temperature,
      maxTokens
    };
    
    aiParserRef.current = new TelloAIParser(aiConfig);
  }, [aiProvider, aiModel, aiApiKey, aiBaseUrl, aiEndpoint, aiDeployment, temperature, maxTokens]);



  // 清理 WebSocket 连接
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  /**
   * 使用内置 AI 解析器进行指令解析
   */
  const analyzeWithAI = async (userCommand: string): Promise<{ success: boolean; commands?: DroneCommand[]; error?: string; reasoning?: string }> => {
    if (!aiParserRef.current) {
      const error = AIParserErrorHandler.handleError('AI 解析器未初始化', userCommand);
      setCurrentError(error);
      return {
        success: false,
        error: error.message
      };
    }

    // 验证输入
    const validation = AIParserErrorHandler.validateInput(userCommand);
    if (!validation.valid && validation.error) {
      setCurrentError(validation.error);
      return {
        success: false,
        error: validation.error.message
      };
    }

    try {
      const result = await aiParserRef.current.parse(userCommand);
      
      if (result.success && result.data) {
        // 清除之前的错误
        setCurrentError(null);
        return {
          success: true,
          commands: result.data.commands,
          reasoning: result.data.reasoning
        };
      } else {
        const error = AIParserErrorHandler.handleError(result.error || '解析失败', userCommand);
        setCurrentError(error);
        return {
          success: false,
          error: error.message
        };
      }
    } catch (error) {
      console.error('AI 解析错误:', error);
      const parserError = AIParserErrorHandler.handleError(
        error instanceof Error ? error : '未知错误',
        userCommand
      );
      setCurrentError(parserError);
      return {
        success: false,
        error: parserError.message
      };
    }
  };



  /**
   * 检查无人机连接状态
   */
  const checkDroneConnection = async (): Promise<{ connected: boolean; status?: DroneStatus; error?: string }> => {
    try {
      // 尝试连接到无人机后端
      const ws = await connectToDroneBackend();
      
      // 等待状态更新 (最多等待3秒)
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({
            connected: true,
            status: droneStatus || undefined
          });
        }, 3000);

        // 如果已经有状态,立即返回
        if (droneStatus) {
          clearTimeout(timeout);
          resolve({
            connected: true,
            status: droneStatus
          });
        }
      });
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : '连接失败'
      };
    }
  };

  /**
   * 处理用户发送消息
   */
  const handleSend = async () => {
    if (!input.trim() || isAnalyzing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsAnalyzing(true);

    try {
      // 调用AI分析
      const result = await analyzeWithAI(input);

      if (result.success && result.commands) {
        // 显示生成的指令
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.reasoning || '我已经为你生成了以下指令序列:',
          commands: result.commands,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (onCommandsGenerated) {
          onCommandsGenerated(result.commands);
        }

        // 检查无人机连接状态
        const connectionCheck = await checkDroneConnection();

        if (connectionCheck.connected) {
          // 无人机已连接，直接执行命令（不再询问用户）
          const statusInfo = connectionCheck.status 
            ? `\n\n📊 无人机状态:\n• 电量: ${connectionCheck.status.battery}%\n• 高度: ${connectionCheck.status.height}cm\n• 飞行中: ${connectionCheck.status.flying ? '是' : '否'}`
            : '';

          const executingMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: `✅ 无人机已连接${statusInfo}\n\n🚀 立即执行指令...`,
            timestamp: Date.now()
          };
          
          setMessages(prev => [...prev, executingMessage]);
          
          // 立即执行命令序列（不设置pendingCommands，直接调用执行逻辑）
          executeCommandSequenceDirectly(result.commands);
        } else {
          // 无人机未连接
          const errorMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: `⚠️ 无法执行：无人机未连接\n错误: ${connectionCheck.error || '无法连接到无人机后端'}\n\n请确保:\n1. 无人机已开机\n2. 已连接到无人机WiFi\n3. 后端服务正在运行 (端口 3002)`,
            timestamp: Date.now()
          };
          
          setMessages(prev => [...prev, errorMessage]);
        }

      } else {
        // 显示错误
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `抱歉,我无法理解你的指令。错误: ${result.error}`,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, errorMessage]);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `处理失败: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * 处理无人机消息
   */
  const handleDroneMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'status_update':
        setDroneStatus(message.data);
        if (onStatusUpdate) {
          onStatusUpdate(message.data);
        }
        break;
      
      case 'command_result':
        // 命令结果由 waitForCommandResult 处理
        break;
      
      case 'video_frame':
        // 视频流处理 (如果需要)
        break;
      
      case 'diagnosis_complete':
        // 处理诊断完成消息
        if (message.data?.report) {
          const report = message.data.report;
          
          // 构建诊断结果消息内容
          let content = `## 🔬 植株诊断报告\n\n`;
          content += `**植株ID:** ${report.plant_id}\n`;
          content += `**诊断时间:** ${report.timestamp}\n`;
          content += `**AI模型:** ${report.ai_model}\n`;
          content += `**置信度:** ${(report.confidence * 100).toFixed(1)}%\n`;
          content += `**处理时间:** ${report.processing_time.toFixed(2)}秒\n\n`;
          
          // 添加原始图像
          if (report.original_image) {
            content += `### 📷 原始图像\n\n`;
            content += `![原始图像](${report.original_image})\n\n`;
          }
          
          // 添加遮罩图像（如果有）
          if (report.mask_image) {
            content += `### 🎯 病害区域标注\n\n`;
            if (report.mask_prompt) {
              content += `**识别区域:** ${report.mask_prompt}\n\n`;
            }
            content += `![病害区域](${report.mask_image})\n\n`;
          }
          
          // 添加诊断报告
          content += `### 📋 诊断详情\n\n`;
          content += report.markdown_report;
          
          // 创建助手消息
          const diagnosisMessage: Message = {
            id: `diagnosis-${report.id}`,
            role: 'assistant',
            content: content,
            timestamp: Date.now()
          };
          
          setMessages(prev => [...prev, diagnosisMessage]);
          console.log('✅ 诊断报告已添加到聊天记录');
        }
        break;
      
      case 'diagnosis_progress':
        // 处理诊断进度消息（可选：显示进度提示）
        if (message.data) {
          const { plant_id, stage, message: progressMsg, progress } = message.data;
          console.log(`🔄 诊断进度 [植株${plant_id}]: ${stage} - ${progressMsg} (${progress}%)`);
        }
        break;
      
      case 'diagnosis_error':
        // 处理诊断错误消息
        if (message.data) {
          const errorMessage: Message = {
            id: `diagnosis-error-${Date.now()}`,
            role: 'assistant',
            content: `❌ 诊断失败\n\n**植株ID:** ${message.data.plant_id}\n**错误类型:** ${message.data.error_type}\n**错误信息:** ${message.data.message}`,
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
        break;
      
      default:
        console.warn('Unknown message type:', message.type);
    }
  }, [onStatusUpdate]);

  /**
   * 连接到无人机后端 (WebSocket 3002)
   */
  const connectToDroneBackend = useCallback((): Promise<WebSocket> => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return Promise.resolve(wsRef.current);
    }

    return new Promise<WebSocket>((resolve, reject) => {
      setCurrentError(null); // 清除之前的错误
      
      const ws = new WebSocket(droneBackendUrl);
      
      ws.onopen = () => {
        console.log('Connected to Drone Backend (3002)');
        wsRef.current = ws;
        wsErrorHandlerRef.current.reset(); // 重置错误处理器
        
        // 订阅状态更新
        ws.send(JSON.stringify({
          type: 'subscribe',
          channel: 'status'
        }));
        
        resolve(ws);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleDroneMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          const wsError = wsErrorHandlerRef.current.handleError(
            error instanceof Error ? error : new Error('消息解析失败'),
            'WebSocket 消息处理'
          );
          setCurrentError(wsError);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket 3002 error:', error);
        const wsError = wsErrorHandlerRef.current.handleError(error, 'WebSocket 连接');
        setCurrentError(wsError);
        reject(wsError);
      };
      
      ws.onclose = () => {
        console.log('Disconnected from Drone Backend');
        wsRef.current = null;
        
        // 尝试自动重连
        if (wsErrorHandlerRef.current.getRetryCount() < 5) {
          wsErrorHandlerRef.current.attemptReconnect(
            connectToDroneBackend,
            () => {
              console.log('自动重连成功');
              setCurrentError(null);
            },
            (error) => {
              console.error('自动重连失败:', error);
              setCurrentError(error);
            }
          );
        }
      };
    });
  }, [droneBackendUrl, handleDroneMessage]);

  /**
   * 等待命令执行结果
   */
  const waitForCommandResult = useCallback((action: string, ws: WebSocket, params?: Record<string, any>): Promise<any> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const error = cmdErrorHandlerRef.current.handleError(
          action,
          `命令执行超时 (30秒)`,
          params
        );
        reject(error);
      }, 30000); // 30秒超时（takeoff和land需要等待稳定）
      
      const handler = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          
          // 修改：匹配后端发送的 drone_command_response 消息类型
          if (message.type === 'drone_command_response' && message.data.action === action) {
            clearTimeout(timeout);
            ws.removeEventListener('message', handler);
            
            if (message.data.success) {
              resolve(message.data);
            } else {
              const error = cmdErrorHandlerRef.current.handleError(
                action,
                message.data.message || message.data.error || 'Command failed',
                params
              );
              reject(error);
            }
          }
        } catch (error) {
          // Ignore parse errors
        }
      };
      
      ws.addEventListener('message', handler);
    });
  }, []);

  /**
   * 直接执行指令序列（不需要用户确认）
   */
  const executeCommandSequenceDirectly = async (commands: DroneCommand[]) => {
    if (isExecuting) return;

    setIsExecuting(true);
    setCurrentError(null); // 清除之前的错误

    try {
      // 确保 WebSocket 已连接
      const ws = await connectToDroneBackend();
      
      const results = [];

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        
        // 开始记录命令执行
        const logId = cmdErrorHandlerRef.current.startExecution(command.action, command.params);
        
        // 更新执行进度
        setExecutionProgress({ current: i + 1, total: commands.length });
        
        try {
          // 发送命令
          const commandMessage = {
            type: 'drone_command',
            data: {
              action: command.action,
              parameters: command.params || {}
            }
          };
          
          ws.send(JSON.stringify(commandMessage));
          
          // 等待命令执行结果
          const result = await waitForCommandResult(command.action, ws, command.params);
          results.push({ ...result, success: true });
          
          // 完成命令执行记录
          cmdErrorHandlerRef.current.completeExecution(logId, true, result);
          
          // 命令间延迟
          if (i < commands.length - 1) {
            // takeoff后需要1秒让电机稳定（避免Auto land）
            const delay = command.action === 'takeoff' ? 1000 : 500;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
        } catch (error) {
          console.error(`Command ${command.action} failed:`, error);
          
          const cmdError = error instanceof Error 
            ? cmdErrorHandlerRef.current.handleError(command.action, error, command.params)
            : error as CommandExecutionError;
          
          // 完成命令执行记录
          cmdErrorHandlerRef.current.completeExecution(logId, false, undefined, cmdError);
          
          // 设置当前错误
          setCurrentError(cmdError);
          
          results.push({
            success: false,
            action: command.action,
            error: cmdError.message
          });
          
          break; // 停止执行后续命令
        }
      }

      // 显示执行结果
      const resultMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✅ 执行完成! 成功: ${results.filter(r => r.success).length}/${results.length}`,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, resultMessage]);

      if (onExecutionComplete) {
        onExecutionComplete(results);
      }

    } catch (error) {
      // 处理连接错误
      const wsError = error instanceof Error
        ? wsErrorHandlerRef.current.handleError(error, '命令执行')
        : error as WebSocketError;
      
      setCurrentError(wsError);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ 执行失败: ${wsError.message}`,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsExecuting(false);
      setExecutionProgress(null);
    }
  };

  /**
   * 紧急停止
   */
  const handleEmergencyStop = useCallback(async () => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'drone_command',
          data: {
            action: 'emergency',
            parameters: {}
          }
        }));
        
        setIsExecuting(false);
        setExecutionProgress(null);
        
        const stopMessage: Message = {
          id: Date.now().toString(),
          role: 'system',
          content: '⚠️ 已发送紧急停止指令!',
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, stopMessage]);
      }
    } catch (error) {
      console.error('Emergency stop failed:', error);
    }
  }, []);

  /**
   * 清除聊天历史
   */
  const handleClearHistory = () => {
    Modal.confirm({
      title: '清除聊天历史',
      content: '确定要清除所有聊天历史吗？此操作无法撤销。',
      okText: '清除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        clearHistory();
        message.success('聊天历史已清除');
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 头部工具栏 */}
      <div className="px-4 py-2 border-b border-heroui-divider flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Tello 智能代理
        </div>
        <Button
          size="sm"
          color="danger"
          variant="flat"
          startContent={<Trash2 size={14} />}
          onPress={handleClearHistory}
          isDisabled={messages.length <= 1 || isExecuting}
        >
          清除历史
        </Button>
      </div>

      {/* 错误显示 */}
      {currentError && (
        <div className="px-4 pt-2">
          <TelloErrorDisplay
            error={currentError}
            onRetry={() => {
              if ('type' in currentError) {
                // WebSocket 错误 - 尝试重连
                if (currentError.type === 'CONNECTION_FAILED' || currentError.type === 'CONNECTION_TIMEOUT') {
                  connectToDroneBackend().catch(console.error);
                }
                // AI 解析错误 - 清除错误让用户重新输入
                else if (currentError.retryable) {
                  setCurrentError(null);
                }
              }
            }}
            onDismiss={() => setCurrentError(null)}
            showSuggestions={true}
          />
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id}>
            <MessageRow isUser={msg.role === 'user'}>
              {/* 智能代理头像 (左侧) */}
              {msg.role !== 'user' && (
                <Avatar
                  icon={<Bot size={20} />}
                  classNames={{
                    base: 'bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0',
                    icon: 'text-white'
                  }}
                  size="sm"
                />
              )}

              {/* 消息内容容器 */}
              <MessageContainer isUser={msg.role === 'user'}>
                <MessageBubble isUser={msg.role === 'user'}>
                  {msg.content}
                </MessageBubble>

                {/* 显示生成的指令 */}
                {msg.commands && msg.commands.length > 0 && (
                  <div className="space-y-2 mt-2 w-full">
                    {msg.commands.map((cmd, idx) => (
                      <CommandCard key={idx}>
                        <div className="flex items-center gap-2 mb-1">
                          <Chip size="sm" color="primary">{idx + 1}</Chip>
                          <span className="font-mono text-sm font-semibold">{cmd.action}</span>
                        </div>
                        {cmd.params && Object.keys(cmd.params).length > 0 && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 ml-8">
                            参数: {JSON.stringify(cmd.params)}
                          </div>
                        )}
                        {cmd.description && (
                          <div className="text-sm text-gray-700 dark:text-gray-300 ml-8">
                            {cmd.description}
                          </div>
                        )}
                      </CommandCard>
                    ))}
                  </div>
                )}
              </MessageContainer>

              {/* 用户头像 (右侧) */}
              {msg.role === 'user' && (
                <Avatar
                  icon={<User size={20} />}
                  classNames={{
                    base: 'bg-gradient-to-br from-green-500 to-teal-500 flex-shrink-0',
                    icon: 'text-white'
                  }}
                  size="sm"
                />
              )}
            </MessageRow>
          </div>
        ))}

        {/* 加载状态 */}
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Spinner size="sm" />
            <span>AI正在分析...</span>
          </div>
        )}

        {isExecuting && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Spinner size="sm" color="primary" />
              <span>正在执行指令...</span>
            </div>
            {executionProgress && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                进度: {executionProgress.current} / {executionProgress.total}
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 紧急停止按钮 */}
      {isExecuting && (
        <div className="p-4 border-t border-heroui-divider">
          <Button
            color="danger"
            startContent={<StopCircle size={16} />}
            onPress={handleEmergencyStop}
            className="w-full"
          >
            紧急停止
          </Button>
        </div>
      )}

      {/* 输入框 */}
      <div className="p-4 border-t border-heroui-divider">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入自然语言指令,例如: 起飞、向前50厘米、顺时针旋转90度"
            className="flex-1 px-4 py-2 rounded-lg border border-heroui-divider bg-heroui-content2 focus:outline-none focus:ring-2 focus:ring-heroui-primary"
          />
          <Button
            color="primary"
            isIconOnly
            onPress={handleSend}
            isLoading={isAnalyzing}
            isDisabled={!input.trim()}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
