/**
 * Tello智能代理前端处理器
 * 不依赖3004后端，直接在前端解析和执行命令
 */

import { createTelloAIParser, AIConfig, ParseResponse, DroneCommand } from './telloAIParser';

export interface TelloHandlerConfig {
  aiProvider: string;
  model: string;
  apiKey?: string;
  baseURL?: string;
  endpoint?: string;
  deployment?: string;
  temperature?: number;
  maxTokens?: number;
  droneBackendUrl?: string;
}

export interface DroneStatus {
  connected: boolean;
  battery?: number;
  status?: string;
}

export interface ExecutionResult {
  success: boolean;
  action: string;
  message?: string;
  error?: string;
}

/**
 * Tello前端处理器类
 */
export class TelloFrontendHandler {
  private config: TelloHandlerConfig;
  private parser: ReturnType<typeof createTelloAIParser>;

  constructor(config: TelloHandlerConfig) {
    this.config = config;
    
    // 创建AI解析器
    const aiConfig: AIConfig = {
      provider: config.aiProvider as any,
      model: config.model,
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      endpoint: config.endpoint,
      deployment: config.deployment,
      temperature: config.temperature || 0.1,
      maxTokens: config.maxTokens || 1000
    };
    
    this.parser = createTelloAIParser(aiConfig);
  }

  /**
   * 解析自然语言指令
   */
  async parseCommand(userInput: string): Promise<ParseResponse> {
    return await this.parser.parse(userInput);
  }

  /**
   * 检查无人机连接状态
   */
  async checkDroneStatus(): Promise<DroneStatus> {
    const backendUrl = this.config.droneBackendUrl || 'http://localhost:8765';
    
    try {
      const response = await fetch(`${backendUrl}/api/drone/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        return { connected: false };
      }
      
      const data = await response.json();
      return {
        connected: data.connected === true,
        battery: data.battery,
        status: data.status
      };
    } catch (error) {
      console.error('[TelloFrontendHandler] 检查无人机状态失败:', error);
      return { connected: false };
    }
  }

  /**
   * 执行单条命令
   */
  async executeSingleCommand(command: DroneCommand): Promise<ExecutionResult> {
    const backendUrl = this.config.droneBackendUrl || 'http://localhost:8765';
    
    try {
      const response = await fetch(`${backendUrl}/api/drone/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: command.action,
          parameters: command.params || {}
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        success: result.success || false,
        action: command.action,
        message: result.message,
        error: result.error
      };
    } catch (error: any) {
      return {
        success: false,
        action: command.action,
        error: error?.message || '未知错误'
      };
    }
  }

  /**
   * 执行命令序列
   */
  async executeCommands(commands: DroneCommand[], onProgress?: (index: number, result: ExecutionResult) => void): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      const result = await this.executeSingleCommand(command);
      results.push(result);
      
      // 调用进度回调
      if (onProgress) {
        onProgress(i, result);
      }
      
      // 如果命令失败，立即停止
      if (!result.success) {
        break;
      }
      
      // 命令间延迟（除了最后一条）
      if (i < commands.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }

  /**
   * 格式化解析结果为Markdown
   */
  formatParseResult(parseResult: ParseResponse): string {
    if (!parseResult.success || !parseResult.data) {
      return `❌ 指令解析失败：${parseResult.error || '未知错误'}`;
    }

    const { commands, safety_checks, estimated_time, battery_required, reasoning } = parseResult.data;
    
    let content = `✅ 指令解析成功！\n\n`;
    
    if (reasoning) {
      content += `**分析思路：**\n${reasoning}\n\n`;
    }
    
    content += `**解析出的命令序列：**\n`;
    commands.forEach((cmd, idx) => {
      content += `${idx + 1}. ${cmd.description || cmd.action}`;
      if (cmd.params && Object.keys(cmd.params).length > 0) {
        content += ` (${JSON.stringify(cmd.params)})`;
      }
      content += `\n`;
    });
    
    if (safety_checks && safety_checks.length > 0) {
      content += `\n**安全检查：**\n`;
      safety_checks.forEach(check => {
        content += `- ${check}\n`;
      });
    }
    
    content += `\n**预计执行时间：** ${estimated_time} 秒\n`;
    content += `**预计电量消耗：** ${battery_required}%\n`;
    
    return content;
  }

  /**
   * 格式化连接状态消息
   */
  formatConnectionMessage(status: DroneStatus, backendUrl: string): string {
    if (status.connected) {
      let message = `🚁 无人机已连接！`;
      if (status.battery !== undefined) {
        message += `\n电池电量：${status.battery}%`;
      }
      message += `\n\n是否立即执行上述命令？\n\n请回复 "执行" 或 "取消"`;
      return message;
    } else {
      return `⚠️ 无人机未连接！\n\n当前无法执行命令。请确保：\n1. 无人机已开机\n2. 已连接到无人机WiFi\n3. 后端服务正在运行 (${backendUrl})\n\n连接成功后，请重新发送指令。`;
    }
  }

  /**
   * 格式化执行结果
   */
  formatExecutionResults(results: ExecutionResult[], commands: DroneCommand[]): string {
    const allSuccess = results.every(r => r.success);
    let content = `${allSuccess ? '✅ 所有命令执行完成！' : '⚠️ 命令执行中断'}\n`;
    
    results.forEach((result, idx) => {
      const cmd = commands[idx];
      content += `\n**[${idx + 1}/${commands.length}] ${cmd.description || cmd.action}**\n`;
      
      if (result.success) {
        content += `✅ ${result.message || '执行成功'}\n`;
      } else {
        content += `❌ ${result.error || '执行失败'}\n`;
      }
    });
    
    return content;
  }
}

/**
 * 创建Tello前端处理器实例
 */
export function createTelloFrontendHandler(config: TelloHandlerConfig): TelloFrontendHandler {
  return new TelloFrontendHandler(config);
}
