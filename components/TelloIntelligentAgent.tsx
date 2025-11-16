"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, ButtonGroup } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Badge } from '@heroui/badge';
import { Tabs, Tab } from '@heroui/tabs';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Chip } from '@heroui/chip';
import { Progress } from '@heroui/progress';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { useDisclosure } from '@heroui/use-disclosure';
import toast, { Toaster } from 'react-hot-toast';

// 简单的Alert组件（如果@heroui没有提供）
const Alert: React.FC<{ color: string; title: string; description: string }> = ({ color, title, description }) => {
  const colorClasses = {
    success: 'bg-green-500/10 border-green-500/50 text-green-300',
    warning: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-300',
    error: 'bg-red-500/10 border-red-500/50 text-red-300',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-300'
  };
  
  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.info}`}>
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm opacity-80">{description}</div>
    </div>
  );
};
import { 
  Plane, 
  PlaneLanding, 
  AlertTriangle, 
  Mic, 
  MicOff,
  Send,
  Settings,
  Eye,
  EyeOff,
  Battery,
  Thermometer,
  Ruler,
  Wifi,
  Clock,
  Brain,
  Zap,
  RotateCw,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MoveUp,
  MoveDown,
  Square,
  Play,
  Pause,
  List,
  CheckCircle,
  XCircle
} from 'lucide-react';

// 类型定义
interface TelloAgentState {
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

interface DroneCommand {
  action: string;
  parameters?: Record<string, any>;
  description: string;
  safety_check?: boolean;
}

interface CommandResult {
  success: boolean;
  action: string;
  message: string;
  data?: any;
  error?: string;
}

interface AIAnalysis {
  success: boolean;
  commands: DroneCommand[];
  raw_response: string;
  error?: string;
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

interface CommandSequenceStatus {
  total: number;
  current: number;
  completed: number;
  failed: number;
  executing: boolean;
}

// AI配置接口（从localStorage读取）
interface AIConfig {
  provider: string;
  model: string;
  apiKey: string;
  apiBase: string;
  temperature?: number;
  maxTokens?: number;
}

const TelloIntelligentAgent: React.FC = () => {
  // 状态管理
  const [agentState, setAgentState] = useState<TelloAgentState>({
    connected: false,
    flying: false,
    battery: 0,
    temperature: 0,
    height: 0,
    speed: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
    wifi_signal: 0,
    flight_time: 0
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [naturalCommand, setNaturalCommand] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  
  // 命令序列执行状态
  const [commandSequence, setCommandSequence] = useState<DroneCommand[]>([]);
  const [sequenceStatus, setSequenceStatus] = useState<CommandSequenceStatus>({
    total: 0,
    current: 0,
    completed: 0,
    failed: 0,
    executing: false
  });
  
  // AI配置（从localStorage读取）
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);

  // WebSocket连接
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // 模态框控制
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();

  // 添加日志
  const addLog = useCallback((type: LogEntry['type'], message: string, details?: any) => {
    const logEntry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      details
    };
    setLogs(prev => [logEntry, ...prev].slice(0, 100)); // 保留最近100条日志
  }, []);

  // WebSocket连接管理
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket('ws://localhost:3004');
      
      wsRef.current.onopen = () => {
        setWsConnected(true);
        addLog('success', 'WebSocket连接成功');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          addLog('error', 'WebSocket消息解析失败', error);
        }
      };

      wsRef.current.onclose = () => {
        setWsConnected(false);
        addLog('warning', 'WebSocket连接断开');
        
        // 自动重连
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            addLog('info', '尝试重新连接WebSocket...');
            connectWebSocket();
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        addLog('error', 'WebSocket连接错误', error);
      };

    } catch (error) {
      addLog('error', 'WebSocket连接失败', error);
    }
  }, [addLog]);

  // 处理WebSocket消息
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'drone_status':
        if (data.data) {
          setAgentState(prev => ({
            ...prev,
            ...data.data
          }));
        }
        break;

      case 'connect_drone_response':
        setIsConnecting(false);
        if (data.success) {
          addLog('success', data.message || '无人机连接成功');
          toast.success('无人机连接成功');
        } else {
          addLog('error', data.error || '无人机连接失败');
          toast.error(data.error || '无人机连接失败');
        }
        break;

      case 'disconnect_drone_response':
        if (data.success) {
          addLog('info', '无人机连接已断开');
          toast.success('无人机连接已断开');
        }
        break;

      case 'natural_language_command_response':
        setIsExecuting(false);
        if (data.success) {
          addLog('success', data.message || '命令执行完成');
          if (data.ai_analysis) {
            addLog('info', 'AI分析结果', data.ai_analysis);
          }
          if (data.execution_results) {
            data.execution_results.forEach((result: CommandResult) => {
              addLog(result.success ? 'success' : 'error', result.message);
            });
          }
          toast.success('命令执行完成');
        } else {
          addLog('error', data.error || '命令执行失败');
          toast.error(data.error || '命令执行失败');
        }
        break;

      case 'drone_command_response':
        // 从队列中取出第一个处理器（FIFO）
        const handler = commandResponseQueue.current.shift();
        if (handler) {
          // 后端响应格式: { type: 'drone_command_response', data: { success, action, message } }
          const responseData = data.data || data;
          handler(responseData.success, responseData.message || responseData.error);
        } else {
          // 没有等待的处理器，使用默认日志
          const responseData = data.data || data;
          if (responseData.success) {
            addLog('success', responseData.message || '命令执行成功');
          } else {
            addLog('error', responseData.message || responseData.error || '命令执行失败');
          }
        }
        break;

      default:
        addLog('info', '收到未知消息类型', data);
    }
  }, [addLog]);

  // 发送WebSocket消息
  const sendWebSocketMessage = useCallback((type: string, data?: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = { type, data: data || {} };
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      addLog('error', 'WebSocket未连接');
      toast.error('WebSocket未连接');
      return false;
    }
  }, [addLog]);

  // 连接无人机
  const connectDrone = useCallback(() => {
    if (!wsConnected) {
      toast.error('请先连接WebSocket服务');
      return;
    }
    
    setIsConnecting(true);
    sendWebSocketMessage('connect_drone');
    addLog('info', '正在连接无人机...');
  }, [wsConnected, sendWebSocketMessage, addLog]);

  // 断开无人机连接
  const disconnectDrone = useCallback(() => {
    sendWebSocketMessage('disconnect_drone');
    addLog('info', '正在断开无人机连接...');
  }, [sendWebSocketMessage, addLog]);

  // 使用AI解析自然语言命令为命令序列
  const parseNaturalLanguageCommand = useCallback(async (command: string): Promise<DroneCommand[]> => {
    if (!aiConfig) {
      throw new Error('AI配置未加载，请先在聊天设置中配置AI服务');
    }

    addLog('info', '正在使用AI解析命令...');

    const systemPrompt = `你是一个无人机控制代理，负责将自然语言指令转换为无人机命令序列。

你必须返回一个JSON数组，每个元素包含：
- action: 命令类型 (takeoff, land, move_forward, move_back, move_left, move_right, move_up, move_down, rotate_clockwise, rotate_counter_clockwise, hover, emergency)
- parameters: 命令参数（可选）
  - distance: 移动距离（厘米，20-500）
  - degrees: 旋转角度（度，1-360）
  - duration: 悬停时间（秒，1-30）
- description: 命令描述
- safety_check: 安全检查（true/false）

重要规则：
1. 识别时间顺序词（"然后"、"接着"、"之后"、"再"）来分割命令
2. 每个动作生成一个独立的命令
3. 按照用户描述的顺序排列命令
4. 默认距离100厘米，默认角度90度
5. 所有命令的safety_check设为true（除了emergency）
6. **严格按照用户的指令生成命令，不要自作主张添加额外的命令**
7. **特别重要：除非用户明确说"降落"，否则不要在命令序列末尾添加land命令**
8. **不要为了"安全"而自动添加降落，让无人机保持在空中等待下一个指令**

示例：
输入："起飞然后向前飞行50厘米"
输出：[
  {"action": "takeoff", "description": "起飞", "safety_check": true},
  {"action": "move_forward", "parameters": {"distance": 50}, "description": "向前移动50厘米", "safety_check": true}
]
注意：不要添加降落命令！

输入："向上升30厘米接着顺时针旋转90度"
输出：[
  {"action": "move_up", "parameters": {"distance": 30}, "description": "向上移动30厘米", "safety_check": true},
  {"action": "rotate_clockwise", "parameters": {"degrees": 90}, "description": "顺时针旋转90度", "safety_check": true}
]
注意：不要添加降落命令！

输入："起飞然后向前50厘米最后降落"
输出：[
  {"action": "takeoff", "description": "起飞", "safety_check": true},
  {"action": "move_forward", "parameters": {"distance": 50}, "description": "向前移动50厘米", "safety_check": true},
  {"action": "land", "description": "降落", "safety_check": true}
]
注意：只有用户明确说"降落"时才添加land命令！`;

    try {
      const response = await fetch('/api/chat-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiConfig.provider,
          model: aiConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: command }
          ],
          temperature: 0.1,
          maxTokens: 1000,
          stream: false,
          apiKey: aiConfig.apiKey,
          baseUrl: aiConfig.apiBase
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI服务调用失败: ${errorText}`);
      }

      const data = await response.json();
      const content = data?.content || data?.choices?.[0]?.message?.content || '';
      
      addLog('info', 'AI响应', { raw: content });

      // 解析JSON响应
      let commands: DroneCommand[];
      try {
        // 尝试直接解析
        commands = JSON.parse(content);
      } catch {
        // 如果失败，尝试提取JSON数组
        const match = content.match(/\[[\s\S]*\]/);
        if (match) {
          commands = JSON.parse(match[0]);
        } else {
          throw new Error('无法解析AI响应为命令序列');
        }
      }

      if (!Array.isArray(commands) || commands.length === 0) {
        throw new Error('AI未返回有效的命令序列');
      }

      addLog('success', `AI解析成功，生成${commands.length}个命令`);
      return commands;

    } catch (error: any) {
      addLog('error', 'AI解析失败', error);
      throw error;
    }
  }, [aiConfig, addLog]);

  // 命令响应等待队列
  const commandResponseQueue = useRef<Array<(success: boolean, message?: string) => void>>([]);

  // 执行单个命令
  const executeSingleCommand = useCallback(async (command: DroneCommand): Promise<boolean> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        // 超时，从队列中移除
        const index = commandResponseQueue.current.indexOf(responseHandler);
        if (index > -1) {
          commandResponseQueue.current.splice(index, 1);
        }
        addLog('error', `命令执行超时: ${command.action}`);
        resolve(false);
      }, 30000); // 30秒超时

      // 创建响应处理器
      const responseHandler = (success: boolean, message?: string) => {
        clearTimeout(timeout);
        
        if (success) {
          addLog('success', `✓ ${command.description || command.action}`);
          resolve(true);
        } else {
          addLog('error', `✗ ${command.description || command.action}: ${message || '未知错误'}`);
          resolve(false);
        }
      };

      // 将处理器加入队列（FIFO）
      commandResponseQueue.current.push(responseHandler);

      // 发送命令
      sendWebSocketMessage('drone_command', {
        action: command.action,
        parameters: command.parameters
      });
    });
  }, [sendWebSocketMessage, addLog]);

  // 执行命令序列
  const executeCommandSequence = useCallback(async (commands: DroneCommand[]) => {
    setCommandSequence(commands);
    setSequenceStatus({
      total: commands.length,
      current: 0,
      completed: 0,
      failed: 0,
      executing: true
    });

    addLog('info', `开始执行命令序列，共${commands.length}个命令`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      setSequenceStatus(prev => ({
        ...prev,
        current: i + 1
      }));

      addLog('info', `[${i + 1}/${commands.length}] 正在执行: ${command.description || command.action}`);

      const success = await executeSingleCommand(command);

      if (success) {
        setSequenceStatus(prev => ({
          ...prev,
          completed: prev.completed + 1
        }));
      } else {
        setSequenceStatus(prev => ({
          ...prev,
          failed: prev.failed + 1
        }));

        // 如果是关键命令失败，停止执行
        if (command.action === 'takeoff') {
          addLog('error', '起飞失败，停止执行后续命令');
          break;
        }
      }

      // 命令间延迟
      if (i < commands.length - 1) {
        // takeoff后需要1秒让电机稳定（避免Auto land）
        const delay = command.action === 'takeoff' ? 1000 : 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setSequenceStatus(prev => {
      const finalStatus = {
        ...prev,
        executing: false
      };
      
      addLog('success', `命令序列执行完成: 成功 ${finalStatus.completed}/${commands.length}, 失败 ${finalStatus.failed}`);
      toast.success(`执行完成: ${finalStatus.completed}/${commands.length} 成功`);
      
      return finalStatus;
    });

  }, [executeSingleCommand, addLog, sequenceStatus]);

  // 执行自然语言命令
  const executeNaturalCommand = useCallback(async () => {
    if (!naturalCommand.trim()) {
      toast.error('请输入命令');
      return;
    }

    if (!agentState.connected) {
      toast.error('请先连接无人机');
      return;
    }

    if (!aiConfig) {
      toast.error('请先在聊天设置中配置AI服务');
      return;
    }

    setIsExecuting(true);
    
    // 添加到历史记录
    setCommandHistory(prev => [naturalCommand, ...prev.filter(cmd => cmd !== naturalCommand)].slice(0, 20));
    setHistoryIndex(-1);
    
    const commandText = naturalCommand;
    setNaturalCommand('');

    try {
      // 1. 使用AI解析命令
      const commands = await parseNaturalLanguageCommand(commandText);
      
      // 2. 显示解析结果
      addLog('info', '已生成命令序列:', commands);
      
      // 3. 执行命令序列
      await executeCommandSequence(commands);
      
    } catch (error: any) {
      addLog('error', '命令执行失败', error);
      toast.error(error.message || '命令执行失败');
    } finally {
      setIsExecuting(false);
    }
  }, [naturalCommand, agentState.connected, aiConfig, parseNaturalLanguageCommand, executeCommandSequence, addLog]);

  // 执行基础命令
  const executeBasicCommand = useCallback((action: string, parameters?: Record<string, any>) => {
    if (!agentState.connected) {
      toast.error('请先连接无人机');
      return;
    }

    sendWebSocketMessage('drone_command', { action, parameters });
    addLog('info', `执行命令: ${action}`, parameters);
  }, [agentState.connected, sendWebSocketMessage, addLog]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeNaturalCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setNaturalCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setNaturalCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setNaturalCommand('');
      }
    }
  }, [executeNaturalCommand, historyIndex, commandHistory]);

  // 获取状态颜色
  const getStatusColor = (connected: boolean, flying: boolean) => {
    if (!connected) return 'default';
    if (flying) return 'success';
    return 'primary';
  };

  // 获取电池颜色
  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'success';
    if (battery > 20) return 'warning';
    return 'danger';
  };

  // 从localStorage加载AI配置
  const loadAIConfig = useCallback(() => {
    try {
      // 读取AI提供商配置
      const provider = localStorage.getItem('chat.aiProvider') || 'openai';
      const model = localStorage.getItem('chat.model') || 'gpt-4o-mini';
      const temperature = parseFloat(localStorage.getItem('chat.temperature') || '0.7');
      const maxTokens = parseInt(localStorage.getItem('chat.maxTokens') || '4000');
      
      // 读取对应提供商的API配置
      const apiKey = localStorage.getItem(`chat.${provider}.apiKey`) || '';
      const apiBase = localStorage.getItem(`chat.${provider}.apiBase`) || '';
      
      if (apiKey) {
        setAiConfig({
          provider,
          model,
          apiKey,
          apiBase,
          temperature,
          maxTokens
        });
        addLog('success', `已加载AI配置: ${provider}/${model}`);
      } else {
        addLog('warning', '未找到AI配置，请先在聊天设置中配置AI服务');
      }
    } catch (error) {
      addLog('error', 'AI配置加载失败', error);
    }
  }, [addLog]);

  // 组件挂载时连接WebSocket并加载AI配置
  useEffect(() => {
    connectWebSocket();
    loadAIConfig();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket, loadAIConfig]);

  // 定期更新状态
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsConnected && agentState.connected) {
        sendWebSocketMessage('get_status');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [wsConnected, agentState.connected, sendWebSocketMessage]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#193059',
            color: '#E6F1FF',
            border: '1px solid #64FFDA',
          },
        }}
      />

      {/* 标题栏 */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-divider">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Tello智能代理</h1>
              <p className="text-sm text-gray-300">自然语言控制无人机</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              color={wsConnected ? 'success' : 'danger'} 
              variant="flat"
              className="text-xs"
            >
              WebSocket: {wsConnected ? '已连接' : '断开'}
            </Badge>
            <Button
              isIconOnly
              variant="ghost"
              onPress={onSettingsOpen}
              className="text-gray-300 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧：控制面板 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 连接状态 */}
          <Card className="bg-content1 border-divider">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plane className="w-5 h-5" />
                无人机状态
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge 
                    color={getStatusColor(agentState.connected, agentState.flying)}
                    variant="flat"
                    size="lg"
                  >
                    {!agentState.connected ? '未连接' : agentState.flying ? '飞行中' : '已连接'}
                  </Badge>
                  {agentState.connected && (
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <Battery className="w-4 h-4" />
                        <span className={`font-medium ${agentState.battery > 20 ? 'text-green-400' : 'text-red-400'}`}>
                          {agentState.battery}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-4 h-4" />
                        <span>{agentState.temperature}°C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="w-4 h-4" />
                        <span>{agentState.height}cm</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    variant="solid"
                    onPress={connectDrone}
                    isLoading={isConnecting}
                    isDisabled={agentState.connected || !wsConnected}
                    size="sm"
                  >
                    {isConnecting ? '连接中...' : '连接'}
                  </Button>
                  <Button
                    color="danger"
                    variant="solid"
                    onPress={disconnectDrone}
                    isDisabled={!agentState.connected}
                    size="sm"
                  >
                    断开
                  </Button>
                </div>
              </div>

              {agentState.connected && agentState.battery > 0 && (
                <Progress
                  value={agentState.battery}
                  color={getBatteryColor(agentState.battery)}
                  className="w-full"
                  label="电池电量"
                  showValueLabel
                />
              )}
            </CardBody>
          </Card>

          {/* 命令序列执行状态 */}
          {sequenceStatus.executing && (
            <Card className="bg-content1 border-divider">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <List className="w-5 h-5" />
                  命令序列执行中
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">进度</span>
                  <span className="text-white font-medium">
                    {sequenceStatus.current} / {sequenceStatus.total}
                  </span>
                </div>
                <Progress
                  value={(sequenceStatus.current / sequenceStatus.total) * 100}
                  color="primary"
                  className="w-full"
                />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>成功: {sequenceStatus.completed}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span>失败: {sequenceStatus.failed}</span>
                  </div>
                </div>
                {commandSequence.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {commandSequence.map((cmd, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-2 rounded ${
                          idx < sequenceStatus.current - 1
                            ? 'bg-green-500/10 text-green-300'
                            : idx === sequenceStatus.current - 1
                            ? 'bg-blue-500/10 text-blue-300'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {idx + 1}. {cmd.description || cmd.action}
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* 自然语言控制 */}
          <Card className="bg-content1 border-divider">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Brain className="w-5 h-5" />
                自然语言控制
                {!aiConfig && (
                  <Badge color="warning" variant="flat" size="sm">
                    未配置AI
                  </Badge>
                )}
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="输入自然语言指令，例如：'起飞然后向前飞行50厘米'"
                  value={naturalCommand}
                  onChange={(e) => setNaturalCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  minRows={2}
                  maxRows={4}
                  className="flex-1"
                  classNames={{
                    input: "text-white placeholder-gray-400",
                    inputWrapper: "bg-gray-800 border-gray-600"
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    color="primary"
                    variant="solid"
                    onPress={executeNaturalCommand}
                    isLoading={isExecuting}
                    isDisabled={!agentState.connected || !naturalCommand.trim()}
                    isIconOnly
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    color="secondary"
                    variant="ghost"
                    onPress={() => setIsListening(!isListening)}
                    isIconOnly
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* 快捷命令 */}
              <div className="space-y-2">
                <p className="text-sm text-gray-400">快捷命令（支持命令序列）：</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    '起飞',
                    '降落',
                    '起飞然后向前飞行50厘米',
                    '向上升30厘米接着顺时针旋转90度',
                    '向前30厘米然后向右30厘米再向后30厘米最后向左30厘米',
                    '起飞然后悬停3秒',
                    '顺时针旋转360度',
                    '向前50厘米然后向上30厘米'
                  ].map((cmd) => (
                    <Chip
                      key={cmd}
                      variant="flat"
                      color="primary"
                      className="cursor-pointer hover:bg-blue-600/10"
                      onClick={() => setNaturalCommand(cmd)}
                    >
                      {cmd}
                    </Chip>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 基础控制 */}
          <Card className="bg-content1 border-divider">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5" />
                基础控制
              </h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  color="success"
                  variant="solid"
                  onPress={() => executeBasicCommand('takeoff')}
                  isDisabled={!agentState.connected || agentState.flying}
                  size="sm"
                  startContent={<Plane className="w-4 h-4" />}
                >
                  起飞
                </Button>
                <Button
                  color="warning"
                  variant="solid"
                  onPress={() => executeBasicCommand('land')}
                  isDisabled={!agentState.connected || !agentState.flying}
                  size="sm"
                  startContent={<PlaneLanding className="w-4 h-4" />}
                >
                  降落
                </Button>
                <Button
                  color="danger"
                  variant="solid"
                  onPress={() => executeBasicCommand('emergency')}
                  isDisabled={!agentState.connected}
                  size="sm"
                  startContent={<AlertTriangle className="w-4 h-4" />}
                >
                  紧急停止
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  onPress={() => executeBasicCommand('get_battery')}
                  isDisabled={!agentState.connected}
                  size="sm"
                  startContent={<Battery className="w-4 h-4" />}
                >
                  查询电量
                </Button>
              </div>

              {/* 方向控制 */}
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-400">方向控制：</p>
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  <div></div>
                  <Button
                    variant="ghost"
                    onPress={() => executeBasicCommand('move_forward', { distance: 30 })}
                    isDisabled={!agentState.connected || !agentState.flying}
                    isIconOnly
                    size="sm"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <div></div>
                  
                  <Button
                    variant="ghost"
                    onPress={() => executeBasicCommand('move_left', { distance: 30 })}
                    isDisabled={!agentState.connected || !agentState.flying}
                    isIconOnly
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onPress={() => executeBasicCommand('move_up', { distance: 30 })}
                    isDisabled={!agentState.connected || !agentState.flying}
                    isIconOnly
                    size="sm"
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onPress={() => executeBasicCommand('move_right', { distance: 30 })}
                    isDisabled={!agentState.connected || !agentState.flying}
                    isIconOnly
                    size="sm"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  
                  <div></div>
                  <Button
                    variant="ghost"
                    onPress={() => executeBasicCommand('move_back', { distance: 30 })}
                    isDisabled={!agentState.connected || !agentState.flying}
                    isIconOnly
                    size="sm"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onPress={() => executeBasicCommand('move_down', { distance: 30 })}
                    isDisabled={!agentState.connected || !agentState.flying}
                    isIconOnly
                    size="sm"
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* 旋转控制 */}
                <div className="flex justify-center gap-2 mt-2">
                  <Button
                    variant="ghost"
                    onPress={() => executeBasicCommand('rotate_counter_clockwise', { degrees: 90 })}
                    isDisabled={!agentState.connected || !agentState.flying}
                    size="sm"
                    startContent={<RotateCcw className="w-4 h-4" />}
                  >
                    逆时针
                  </Button>
                  <Button
                    variant="ghost"
                    onPress={() => executeBasicCommand('rotate_clockwise', { degrees: 90 })}
                    isDisabled={!agentState.connected || !agentState.flying}
                    size="sm"
                    startContent={<RotateCw className="w-4 h-4" />}
                  >
                    顺时针
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 右侧：日志和状态 */}
        <div className="space-y-4">
          {/* 视频流 */}
          <Card className="bg-content1 border-divider">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                视频流
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setVideoEnabled(!videoEnabled)}
                startContent={videoEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              >
                {videoEnabled ? '关闭' : '开启'}
              </Button>
            </CardHeader>
            <CardBody>
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                {videoEnabled && currentFrame ? (
                  <img src={currentFrame} alt="Tello视频流" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-gray-400 text-center">
                    <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>视频流未启用</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* 日志 */}
          <Card className="bg-content1 border-divider">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-white">系统日志</h3>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setLogs([])}
              >
                清空
              </Button>
            </CardHeader>
            <CardBody>
              <ScrollShadow className="h-64">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">暂无日志</p>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className={`text-xs p-2 rounded border-l-2 ${
                          log.type === 'success' ? 'bg-success/10 border-success text-green-300' :
                          log.type === 'warning' ? 'bg-warning/10 border-warning text-yellow-300' :
                          log.type === 'error' ? 'bg-danger/10 border-danger text-red-300' :
                          'bg-primary/10 border-primary text-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{log.message}</span>
                          <span className="text-gray-400">{log.timestamp}</span>
                        </div>
                        {log.details && (
                          <pre className="mt-1 text-xs opacity-75 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollShadow>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 设置模态框 */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-semibold">Tello智能代理设置</h3>
          </ModalHeader>
          <ModalBody>
            <Tabs>
              <Tab key="connection" title="连接设置">
                <div className="space-y-4">
                  <Input
                    label="WebSocket地址"
                    placeholder="ws://localhost:3004"
                    defaultValue="ws://localhost:3004"
                  />
                  <Input
                    label="Tello IP地址"
                    placeholder="192.168.10.1"
                    defaultValue="192.168.10.1"
                  />
                </div>
              </Tab>
              <Tab key="ai" title="AI设置">
                <div className="space-y-4">
                  {aiConfig ? (
                    <>
                      <Alert
                        color="success"
                        title="AI配置已加载"
                        description={`提供商: ${aiConfig.provider}, 模型: ${aiConfig.model}`}
                      />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">提供商:</span>
                          <span className="text-white">{aiConfig.provider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">模型:</span>
                          <span className="text-white">{aiConfig.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">API Base:</span>
                          <span className="text-white text-xs truncate max-w-xs">
                            {aiConfig.apiBase || '默认'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Temperature:</span>
                          <span className="text-white">{aiConfig.temperature}</span>
                        </div>
                      </div>
                      <Button
                        color="primary"
                        variant="flat"
                        onPress={loadAIConfig}
                        fullWidth
                      >
                        重新加载配置
                      </Button>
                    </>
                  ) : (
                    <>
                      <Alert
                        color="warning"
                        title="未找到AI配置"
                        description="请先在聊天界面的设置中配置AI服务提供商"
                      />
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>配置步骤：</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>打开聊天界面</li>
                          <li>点击设置按钮</li>
                          <li>选择AI提供商（OpenAI、Qwen等）</li>
                          <li>输入API Key和API Base</li>
                          <li>保存配置后返回此页面</li>
                        </ol>
                      </div>
                      <Button
                        color="primary"
                        variant="solid"
                        onPress={loadAIConfig}
                        fullWidth
                      >
                        尝试加载配置
                      </Button>
                    </>
                  )}
                </div>
              </Tab>
              <Tab key="safety" title="安全设置">
                <div className="space-y-4">
                  <Input
                    label="最大飞行高度 (cm)"
                    type="number"
                    placeholder="300"
                    defaultValue="300"
                  />
                  <Input
                    label="最低电量警告 (%)"
                    type="number"
                    placeholder="20"
                    defaultValue="20"
                  />
                </div>
              </Tab>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onSettingsClose}>
              取消
            </Button>
            <Button color="primary" onPress={onSettingsClose}>
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TelloIntelligentAgent;
