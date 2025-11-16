/**
 * Tello智能代理聊天Hook
 * 提供AI解析和指令执行功能
 */

import { useState, useCallback } from 'react';

export interface DroneCommand {
  action: string;
  parameters?: Record<string, any>;
  description?: string;
}

export interface AIAnalysisResult {
  success: boolean;
  commands?: DroneCommand[];
  reasoning?: string;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  action: string;
  message?: string;
  error?: string;
}

export interface TelloChatConfig {
  aiProvider: string;
  aiModel: string;
  aiApiKey?: string;
  aiBaseUrl?: string;
  aiEndpoint?: string;
  aiDeployment?: string;
  temperature?: number;
  maxTokens?: number;
  droneBackendUrl?: string;
}

export function useTelloChat(config: TelloChatConfig) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysisResult | null>(null);
  const [lastExecution, setLastExecution] = useState<ExecutionResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * 调用AI进行指令解析
   */
  const analyzeCommand = useCallback(async (userCommand: string): Promise<AIAnalysisResult> => {
    setIsAnalyzing(true);
    setError(null);

    const systemPrompt = `你是一个专业的无人机控制AI助手。你的任务是将用户的自然语言指令转换为具体的无人机控制命令。

可用的无人机命令:
1. takeoff - 起飞
2. land - 降落
3. emergency - 紧急停止
4. move_forward - 向前移动,参数: distance (厘米)
5. move_back - 向后移动,参数: distance (厘米)
6. move_left - 向左移动,参数: distance (厘米)
7. move_right - 向右移动,参数: distance (厘米)
8. move_up - 向上移动,参数: distance (厘米)
9. move_down - 向下移动,参数: distance (厘米)
10. rotate_clockwise - 顺时针旋转,参数: degrees (度数)
11. rotate_counter_clockwise - 逆时针旋转,参数: degrees (度数)
12. get_battery - 获取电池电量
13. get_status - 获取无人机状态
14. hover - 悬停

请将用户指令转换为JSON格式的命令列表,格式如下:
{
  "commands": [
    {
      "action": "命令名称",
      "parameters": {"参数名": 参数值},
      "description": "命令描述"
    }
  ],
  "reasoning": "解释为什么生成这些命令"
}

注意事项:
- 如果没有指定距离,默认使用30厘米
- 如果没有指定角度,默认使用90度
- 确保命令顺序合理,例如起飞后才能移动
- 如果指令不清楚或不安全,返回错误信息
- 你必须包含完整的JSON格式输出`;

    try {
      let response: string;

      if (config.aiProvider === 'ollama') {
        response = await callOllama(systemPrompt, userCommand);
      } else if (config.aiProvider === 'azure') {
        response = await callAzureOpenAI(systemPrompt, userCommand);
      } else {
        response = await callOpenAICompatible(systemPrompt, userCommand);
      }

      const parsed = parseAIResponse(response);
      setLastAnalysis(parsed);
      
      return parsed;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误';
      setError(errorMsg);
      const result = { success: false, error: errorMsg };
      setLastAnalysis(result);
      return result;
    } finally {
      setIsAnalyzing(false);
    }
  }, [config]);

  /**
   * 执行指令序列
   */
  const executeCommands = useCallback(async (commands: DroneCommand[]): Promise<ExecutionResult[]> => {
    setIsExecuting(true);
    setError(null);

    const results: ExecutionResult[] = [];

    try {
      for (const command of commands) {
        const result = await executeSingleCommand(command);
        results.push(result);

        if (!result.success) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setLastExecution(results);
      return results;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误';
      setError(errorMsg);
      return results;
    } finally {
      setIsExecuting(false);
    }
  }, [config.droneBackendUrl]);

  /**
   * 分析并执行
   */
  const analyzeAndExecute = useCallback(async (userCommand: string) => {
    const analysis = await analyzeCommand(userCommand);
    
    if (analysis.success && analysis.commands) {
      const execution = await executeCommands(analysis.commands);
      return { analysis, execution };
    }

    return { analysis, execution: [] };
  }, [analyzeCommand, executeCommands]);

  /**
   * 调用Ollama API
   */
  const callOllama = async (systemPrompt: string, userMessage: string): Promise<string> => {
    const baseUrl = config.aiBaseUrl || 'http://localhost:11434';
    const nativeUrl = baseUrl.endsWith('/v1') ? baseUrl.slice(0, -3) : baseUrl;

    const response = await fetch(`${nativeUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.aiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API错误: ${response.status}`);
    }

    const data = await response.json();
    return data.message?.content || data.content || '';
  };

  /**
   * 调用Azure OpenAI API
   */
  const callAzureOpenAI = async (systemPrompt: string, userMessage: string): Promise<string> => {
    if (!config.aiEndpoint || !config.aiApiKey || !config.aiDeployment) {
      throw new Error('Azure OpenAI配置不完整');
    }

    const url = `${config.aiEndpoint}/openai/deployments/${config.aiDeployment}/chat/completions?api-version=2024-02-15-preview`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.aiApiKey
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: config.temperature || 0.1,
        max_tokens: config.maxTokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API错误: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  /**
   * 调用OpenAI兼容API
   */
  const callOpenAICompatible = async (systemPrompt: string, userMessage: string): Promise<string> => {
    if (!config.aiApiKey) {
      throw new Error(`${config.aiProvider} API Key未配置`);
    }

    const url = config.aiBaseUrl || getDefaultBaseUrl(config.aiProvider);

    const response = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.aiApiKey}`
      },
      body: JSON.stringify({
        model: config.aiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: config.temperature || 0.1,
        max_tokens: config.maxTokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`${config.aiProvider} API错误: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  /**
   * 获取默认API地址
   */
  const getDefaultBaseUrl = (provider: string): string => {
    const urls: Record<string, string> = {
      openai: 'https://api.openai.com/v1',
      qwen: 'https://dashscope.aliyuncs.com/api/v1',
      deepseek: 'https://api.deepseek.com',
      groq: 'https://api.groq.com/openai/v1',
      mistral: 'https://api.mistral.ai/v1',
      openrouter: 'https://openrouter.ai/api/v1'
    };
    return urls[provider] || 'https://api.openai.com/v1';
  };

  /**
   * 解析AI响应
   */
  const parseAIResponse = (response: string): AIAnalysisResult => {
    try {
      let parsed = tryParseJSON(response);

      if (!parsed) {
        const codeBlockPattern = /```(?:json)?\s*([\s\S]*?)\s*```/g;
        const matches = response.matchAll(codeBlockPattern);
        for (const match of matches) {
          parsed = tryParseJSON(match[1]);
          if (parsed && parsed.commands) break;
        }
      }

      if (!parsed) {
        const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
        const matches = response.matchAll(jsonPattern);
        for (const match of matches) {
          if (match[0].includes('"commands"')) {
            parsed = tryParseJSON(match[0]);
            if (parsed && parsed.commands) break;
          }
        }
      }

      if (parsed && Array.isArray(parsed.commands)) {
        const normalizedCommands = parsed.commands.map((cmd: any) => ({
          action: String(cmd.action || ''),
          parameters: cmd.parameters || cmd.params || {},
          description: cmd.description || ''
        }));

        return {
          success: true,
          commands: normalizedCommands,
          reasoning: parsed.reasoning
        };
      }

      return {
        success: false,
        error: `无法解析AI响应为有效JSON。响应: ${response.substring(0, 200)}...`
      };

    } catch (err) {
      return {
        success: false,
        error: `解析失败: ${err instanceof Error ? err.message : '未知错误'}`
      };
    }
  };

  /**
   * 尝试解析JSON
   */
  const tryParseJSON = (text: string): any => {
    try {
      return JSON.parse(text.trim());
    } catch {
      return null;
    }
  };

  /**
   * 执行单条指令
   */
  const executeSingleCommand = async (command: DroneCommand): Promise<ExecutionResult> => {
    try {
      const backendUrl = config.droneBackendUrl || 'http://localhost:8765';
      
      const response = await fetch(`${backendUrl}/api/drone/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: command.action,
          parameters: command.parameters || {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: result.success || false,
        action: command.action,
        message: result.message,
        error: result.error
      };

    } catch (err) {
      return {
        success: false,
        action: command.action,
        error: err instanceof Error ? err.message : '未知错误'
      };
    }
  };

  return {
    isAnalyzing,
    isExecuting,
    lastAnalysis,
    lastExecution,
    error,
    analyzeCommand,
    executeCommands,
    analyzeAndExecute,
    clearError: () => setError(null)
  };
}
