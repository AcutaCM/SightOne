/**
 * Tello 无人机 AI 指令解析器
 * 支持多种 AI 提供商,将自然语言转换为无人机控制命令
 */

import { INTELLIGENT_AGENT_PROMPT } from '@/lib/constants/intelligentAgentPreset';

// AI 配置接口
export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'qwen' | 'deepseek' | 'azure' | 'groq' | 'mistral' | 'openrouter';
  model: string;
  apiKey?: string;
  baseURL?: string;
  endpoint?: string;
  deployment?: string;
  temperature?: number;
  maxTokens?: number;
}

// 无人机命令接口
export interface DroneCommand {
  action: string;
  params: Record<string, any>;
  description: string;
}

// 解析结果接口
export interface ParsedCommands {
  commands: DroneCommand[];
  safety_checks: string[];
  estimated_time: number;
  battery_required: number;
  reasoning?: string;
}

// 解析响应接口
export interface ParseResponse {
  success: boolean;
  data?: ParsedCommands;
  error?: string;
}

/**
 * Tello AI 解析器类
 */
export class TelloAIParser {
  private config: AIConfig;
  private systemPrompt: string;

  constructor(config: AIConfig) {
    this.config = config;
    this.systemPrompt = this.buildSystemPrompt();
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(): string {
    return INTELLIGENT_AGENT_PROMPT;
  }

  /**
   * 解析自然语言指令
   */
  async parse(userInput: string): Promise<ParseResponse> {
    try {
      // 验证输入
      if (!userInput || userInput.trim().length === 0) {
        return {
          success: false,
          error: '输入不能为空'
        };
      }

      // 调用 AI API
      const response = await this.callAI(userInput);

      // 解析响应
      const parsed = this.parseAIResponse(response);

      if (!parsed.success) {
        return parsed;
      }

      // 验证命令
      const validated = this.validateCommands(parsed.data!);

      return validated;

    } catch (error) {
      console.error('AI 解析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 调用 AI API
   */
  private async callAI(userInput: string): Promise<string> {
    const { provider } = this.config;

    switch (provider) {
      case 'ollama':
        return this.callOllama(userInput);
      case 'azure':
        return this.callAzureOpenAI(userInput);
      case 'anthropic':
        return this.callAnthropic(userInput);
      case 'google':
        return this.callGoogle(userInput);
      default:
        return this.callOpenAICompatible(userInput);
    }
  }

  /**
   * 调用 Ollama API
   */
  private async callOllama(userInput: string): Promise<string> {
    const baseUrl = this.config.baseURL || 'http://localhost:11434';
    const nativeUrl = baseUrl.endsWith('/v1') ? baseUrl.slice(0, -3) : baseUrl;

    const response = await fetch(`${nativeUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: userInput }
        ],
        stream: false,
        options: {
          temperature: this.config.temperature || 0.1
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API 错误 (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.message?.content || data.content || '';
  }

  /**
   * 调用 Azure OpenAI API
   */
  private async callAzureOpenAI(userInput: string): Promise<string> {
    const { endpoint, apiKey, deployment, temperature, maxTokens } = this.config;

    if (!endpoint || !apiKey || !deployment) {
      throw new Error('Azure OpenAI 配置不完整 (需要 endpoint, apiKey, deployment)');
    }

    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: userInput }
        ],
        temperature: temperature || 0.1,
        max_tokens: maxTokens || 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Azure OpenAI API 错误 (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * 调用 Anthropic API
   */
  private async callAnthropic(userInput: string): Promise<string> {
    const { apiKey, model, temperature, maxTokens } = this.config;

    if (!apiKey) {
      throw new Error('Anthropic API Key 未配置');
    }

    const baseUrl = this.config.baseURL || 'https://api.anthropic.com';

    const response = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: maxTokens || 1000,
        temperature: temperature || 0.1,
        system: this.systemPrompt,
        messages: [
          { role: 'user', content: userInput }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API 错误 (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * 调用 Google Gemini API
   */
  private async callGoogle(userInput: string): Promise<string> {
    const { apiKey, model, temperature, maxTokens } = this.config;

    if (!apiKey) {
      throw new Error('Google API Key 未配置');
    }

    const baseUrl = this.config.baseURL || 'https://generativelanguage.googleapis.com';

    const response = await fetch(`${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${this.systemPrompt}\n\n用户指令: ${userInput}` }
            ]
          }
        ],
        generationConfig: {
          temperature: temperature || 0.1,
          maxOutputTokens: maxTokens || 1000
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API 错误 (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * 调用 OpenAI 兼容 API
   */
  private async callOpenAICompatible(userInput: string): Promise<string> {
    const { provider, apiKey, model, temperature, maxTokens } = this.config;

    if (!apiKey) {
      throw new Error(`${provider} API Key 未配置`);
    }

    const baseUrl = this.config.baseURL || this.getDefaultBaseUrl(provider);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: userInput }
        ],
        temperature: temperature || 0.1,
        max_tokens: maxTokens || 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${provider} API 错误 (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * 获取默认 API 地址
   */
  private getDefaultBaseUrl(provider: string): string {
    const urls: Record<string, string> = {
      openai: 'https://api.openai.com/v1',
      qwen: 'https://dashscope.aliyuncs.com/api/v1',
      deepseek: 'https://api.deepseek.com',
      groq: 'https://api.groq.com/openai/v1',
      mistral: 'https://api.mistral.ai/v1',
      openrouter: 'https://openrouter.ai/api/v1'
    };
    return urls[provider] || 'https://api.openai.com/v1';
  }

  /**
   * 解析 AI 响应
   */
  private parseAIResponse(response: string): ParseResponse {
    try {
      // 尝试直接解析 JSON
      let parsed = this.tryParseJSON(response);

      if (!parsed) {
        // 尝试从代码块提取
        const codeBlockPattern = /```(?:json)?\s*([\s\S]*?)\s*```/g;
        const codeBlockMatches = Array.from(response.matchAll(codeBlockPattern));
        for (const match of codeBlockMatches) {
          parsed = this.tryParseJSON(match[1]);
          if (parsed && parsed.commands) break;
        }
      }

      if (!parsed) {
        // 尝试查找 JSON 对象
        const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
        const jsonMatches = Array.from(response.matchAll(jsonPattern));
        for (const match of jsonMatches) {
          if (match[0].includes('"commands"')) {
            parsed = this.tryParseJSON(match[0]);
            if (parsed && parsed.commands) break;
          }
        }
      }

      if (!parsed || !Array.isArray(parsed.commands)) {
        return {
          success: false,
          error: `无法解析 AI 响应为有效 JSON。响应: ${response.substring(0, 200)}...`
        };
      }

      // 标准化命令格式
      const normalizedCommands: DroneCommand[] = parsed.commands.map((cmd: any) => ({
        action: String(cmd.action || ''),
        params: cmd.params || cmd.parameters || {},
        description: cmd.description || ''
      }));

      const result: ParsedCommands = {
        commands: normalizedCommands,
        safety_checks: parsed.safety_checks || [],
        estimated_time: parsed.estimated_time || this.estimateTime(normalizedCommands),
        battery_required: parsed.battery_required || this.estimateBattery(normalizedCommands),
        reasoning: parsed.reasoning
      };

      return {
        success: true,
        data: result
      };

    } catch (error) {
      return {
        success: false,
        error: `解析失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 尝试解析 JSON
   */
  private tryParseJSON(text: string): any {
    try {
      return JSON.parse(text.trim());
    } catch {
      return null;
    }
  }

  /**
   * 验证命令
   */
  private validateCommands(data: ParsedCommands): ParseResponse {
    const errors: string[] = [];

    // 验证命令列表不为空
    if (!data.commands || data.commands.length === 0) {
      errors.push('命令列表为空');
    }

    // 验证每个命令
    const supportedCommands = [
      'takeoff', 'land', 'emergency', 'hover',
      'move_forward', 'move_back', 'move_left', 'move_right', 'move_up', 'move_down',
      'rotate_clockwise', 'rotate_counter_clockwise',
      'get_battery', 'get_status'
    ];
    
    for (let i = 0; i < data.commands.length; i++) {
      const cmd = data.commands[i];

      // 验证命令名称
      if (!cmd.action) {
        errors.push(`命令 ${i + 1}: 缺少 action 字段`);
        continue;
      }

      // 验证命令是否支持
      if (supportedCommands.length > 0 && !supportedCommands.includes(cmd.action)) {
        errors.push(`命令 ${i + 1}: 不支持的命令 "${cmd.action}"`);
      }

      // 验证参数
      if (cmd.params) {
        // 验证距离参数
        if ('distance' in cmd.params) {
          const distance = Number(cmd.params.distance);
          if (isNaN(distance) || distance < 20 || distance > 500) {
            errors.push(`命令 ${i + 1}: 距离参数无效 (应在 20-500cm 之间)`);
          }
        }

        // 验证角度参数
        if ('degrees' in cmd.params) {
          const degrees = Number(cmd.params.degrees);
          if (isNaN(degrees) || degrees < 1 || degrees > 360) {
            errors.push(`命令 ${i + 1}: 角度参数无效 (应在 1-360度 之间)`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `命令验证失败:\n${errors.join('\n')}`
      };
    }

    return {
      success: true,
      data
    };
  }

  /**
   * 估算执行时间 (秒)
   */
  private estimateTime(commands: DroneCommand[]): number {
    let totalTime = 0;

    for (const cmd of commands) {
      switch (cmd.action) {
        case 'takeoff':
        case 'land':
          totalTime += 5;
          break;
        case 'up':
        case 'down':
        case 'left':
        case 'right':
        case 'forward':
        case 'back':
          const distance = Number(cmd.params.distance || 30);
          totalTime += Math.ceil(distance / 30) * 2;
          break;
        case 'cw':
        case 'ccw':
          const degrees = Number(cmd.params.degrees || 90);
          totalTime += Math.ceil(degrees / 90) * 2;
          break;
        case 'flip':
          totalTime += 3;
          break;
        default:
          totalTime += 2;
      }
    }

    return totalTime;
  }

  /**
   * 估算所需电量 (%)
   */
  private estimateBattery(commands: DroneCommand[]): number {
    let batteryUsage = 0;

    for (const cmd of commands) {
      switch (cmd.action) {
        case 'takeoff':
        case 'land':
          batteryUsage += 5;
          break;
        case 'up':
        case 'down':
        case 'left':
        case 'right':
        case 'forward':
        case 'back':
          const distance = Number(cmd.params.distance || 30);
          batteryUsage += Math.ceil(distance / 100) * 2;
          break;
        case 'cw':
        case 'ccw':
          batteryUsage += 1;
          break;
        case 'flip':
          batteryUsage += 3;
          break;
        default:
          batteryUsage += 1;
      }
    }

    return Math.min(batteryUsage + 10, 100); // 加上 10% 安全余量
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * 创建 Tello AI 解析器实例
 */
export function createTelloAIParser(config: AIConfig): TelloAIParser {
  return new TelloAIParser(config);
}
