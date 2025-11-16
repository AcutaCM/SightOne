/**
 * Tello Intelligent Agent - TypeScript Implementation
 * 
 * This service analyzes commands in the frontend using chatbotchat AI config
 * and generates command sequences that are sent to the drone backend for execution.
 */

export interface DroneCommand {
  action: string;
  parameters?: Record<string, any>;
  description?: string;
}

export interface AIAnalysisResult {
  success: boolean;
  commands: DroneCommand[];
  raw_response?: string;
  error?: string;
  reasoning?: string;
}

export interface CommandExecutionResult {
  success: boolean;
  action: string;
  message?: string;
  data?: any;
  error?: string;
}

// Use chatbotchat AI configuration
export interface ChatbotAIConfig {
  provider: 'openai' | 'azure' | 'ollama' | 'qwen' | 'deepseek' | 'groq' | 'mistral' | 'openrouter' | 'dify';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  endpoint?: string;
  deployment?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ImageAnalysisRequest {
  imageData: string; // base64 encoded image
  prompt?: string;
  includeDetection?: boolean;
}

export interface ImageAnalysisResult {
  success: boolean;
  description?: string;
  detections?: any[];
  suggestedCommands?: DroneCommand[];
  error?: string;
}

export class TelloIntelligentAgent {
  private config: ChatbotAIConfig;
  private droneBackendUrl: string;
  private isAnalyzing: boolean = false;

  constructor(config: ChatbotAIConfig, droneBackendUrl: string = 'http://localhost:8000') {
    this.config = config;
    this.droneBackendUrl = droneBackendUrl;
  }

  /**
   * Update AI configuration from chatbotchat
   */
  updateConfig(config: Partial<ChatbotAIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Analyze natural language command and generate drone commands
   */
  async analyzeCommand(command: string): Promise<AIAnalysisResult> {
    try {
      const systemPrompt = `You are a professional drone control AI assistant. Your task is to convert user's natural language instructions into specific drone control commands.

Available drone commands:
1. takeoff - Take off
2. land - Land
3. emergency - Emergency stop
4. move_forward - Move forward, parameter: distance (cm)
5. move_back - Move backward, parameter: distance (cm)
6. move_left - Move left, parameter: distance (cm)
7. move_right - Move right, parameter: distance (cm)
8. move_up - Move up, parameter: distance (cm)
9. move_down - Move down, parameter: distance (cm)
10. rotate_clockwise - Rotate clockwise, parameter: degrees
11. rotate_counter_clockwise - Rotate counter-clockwise, parameter: degrees
12. get_battery - Get battery level
13. get_status - Get drone status
14. hover - Hover in place

Convert user instructions to JSON format command list:
{
  "commands": [
    {
      "action": "command_name",
      "parameters": {"param_name": value},
      "description": "command description"
    }
  ],
  "reasoning": "explanation of the command sequence"
}

Notes:
- If no distance specified, default to 30cm
- If no angle specified, default to 90 degrees
- Ensure command order is logical (e.g., takeoff before moving)
- If instruction is unclear or unsafe, return error
- You must include complete JSON format output`;

      const response = await this.callAI(systemPrompt, command);
      
      // Parse AI response
      const parsed = this.parseAIResponse(response);
      
      if (!parsed.success) {
        return parsed;
      }

      return {
        success: true,
        commands: parsed.commands,
        reasoning: parsed.reasoning,
        raw_response: response
      };

    } catch (error) {
      console.error('Command analysis failed:', error);
      return {
        success: false,
        commands: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Analyze image and generate insights/commands
   */
  async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResult> {
    if (this.isAnalyzing) {
      return {
        success: false,
        error: 'Analysis already in progress'
      };
    }

    this.isAnalyzing = true;

    try {
      const prompt = request.prompt || 
        'Analyze this image captured by a drone. Describe what you see and suggest appropriate drone movements or actions based on the scene.';

      const systemPrompt = `You are an AI assistant analyzing drone camera footage. Provide:
1. A detailed description of what you see
2. Any objects, obstacles, or points of interest
3. Suggested drone commands based on the scene

Format your response as JSON:
{
  "description": "detailed scene description",
  "observations": ["observation 1", "observation 2"],
  "suggestedCommands": [
    {
      "action": "command_name",
      "parameters": {"param": value},
      "description": "why this command"
    }
  ]
}`;

      // For vision-capable models
      const response = await this.callAIWithVision(systemPrompt, prompt, request.imageData);
      
      const parsed = this.parseImageAnalysisResponse(response);
      
      return {
        success: true,
        ...parsed
      };

    } catch (error) {
      console.error('Image analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Execute command sequence on drone backend via WebSocket
   */
  async executeCommands(commands: DroneCommand[]): Promise<CommandExecutionResult[]> {
    const results: CommandExecutionResult[] = [];

    for (const command of commands) {
      try {
        const result = await this.executeSingleCommand(command);
        results.push(result);

        // If command fails, stop execution
        if (!result.success) {
          console.error(`Command ${command.action} failed, stopping sequence`);
          break;
        }

        // Delay between commands
        await this.delay(2000);

      } catch (error) {
        results.push({
          success: false,
          action: command.action,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        break;
      }
    }

    return results;
  }

  /**
   * Execute single command on drone backend via WebSocket
   * 直接发送命令到后端执行，不再进行AI分析
   */
  private async executeSingleCommand(command: DroneCommand): Promise<CommandExecutionResult> {
    try {
      // 使用WebSocket发送命令到后端
      const ws = await this.getWebSocketConnection();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Command execution timeout'));
        }, 30000); // 30秒超时

        // 监听响应
        const messageHandler = (event: MessageEvent) => {
          try {
            const response = JSON.parse(event.data);
            
            // 检查是否是我们等待的命令响应
            if (response.type === 'drone_command_response' && response.action === command.action) {
              clearTimeout(timeout);
              ws.removeEventListener('message', messageHandler);
              
              resolve({
                success: response.success || false,
                action: command.action,
                message: response.message,
                data: response.data,
                error: response.error
              });
            }
          } catch (error) {
            console.error('Failed to parse WebSocket response:', error);
          }
        };

        ws.addEventListener('message', messageHandler);

        // 发送命令
        ws.send(JSON.stringify({
          type: 'drone_command',
          data: {
            action: command.action,
            parameters: command.parameters || {}
          }
        }));
      });

    } catch (error) {
      console.error(`Failed to execute command ${command.action}:`, error);
      return {
        success: false,
        action: command.action,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get or create WebSocket connection to drone backend
   */
  private wsConnection: WebSocket | null = null;
  private wsConnectionPromise: Promise<WebSocket> | null = null;

  private async getWebSocketConnection(): Promise<WebSocket> {
    // 如果已有连接且状态正常，直接返回
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      return this.wsConnection;
    }

    // 如果正在连接中，等待连接完成
    if (this.wsConnectionPromise) {
      return this.wsConnectionPromise;
    }

    // 创建新连接
    this.wsConnectionPromise = new Promise((resolve, reject) => {
      const wsUrl = this.droneBackendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      const ws = new WebSocket(`${wsUrl.replace(':8000', ':3004')}`);

      ws.onopen = () => {
        console.log('WebSocket connected to drone backend');
        this.wsConnection = ws;
        this.wsConnectionPromise = null;
        resolve(ws);
      };

      ws.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        this.wsConnectionPromise = null;
        reject(new Error('Failed to connect to drone backend'));
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.wsConnection = null;
        this.wsConnectionPromise = null;
      };
    });

    return this.wsConnectionPromise;
  }

  /**
   * Close WebSocket connection
   */
  closeWebSocketConnection(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * Call AI service (text-only) using chatbotchat configuration
   */
  private async callAI(systemPrompt: string, userMessage: string): Promise<string> {
    const { provider, apiKey, baseUrl, model, endpoint, deployment } = this.config;

    if (provider === 'ollama') {
      return this.callOllama(systemPrompt, userMessage);
    }

    if (provider === 'azure') {
      return this.callAzureOpenAI(systemPrompt, userMessage);
    }

    // OpenAI-compatible providers
    return this.callOpenAICompatible(systemPrompt, userMessage);
  }

  /**
   * Call AI service with vision (image analysis) using chatbotchat configuration
   */
  private async callAIWithVision(
    systemPrompt: string, 
    userMessage: string, 
    imageData: string
  ): Promise<string> {
    const { provider, apiKey, baseUrl, model, temperature = 0.1, maxTokens = 1000 } = this.config;

    if (!apiKey && provider !== 'ollama') {
      throw new Error('API key required for vision analysis');
    }

    const url = baseUrl || this.getDefaultBaseUrl(provider);

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userMessage
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`
            }
          }
        ]
      }
    ];

    const response = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Call Ollama API
   */
  private async callOllama(systemPrompt: string, userMessage: string): Promise<string> {
    const baseUrl = this.config.baseUrl || 'http://localhost:11434';
    const nativeUrl = baseUrl.endsWith('/v1') ? baseUrl.slice(0, -3) : baseUrl;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    try {
      // Try /api/chat first
      const response = await fetch(`${nativeUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message?.content || data.content || '';
      }

      // Fallback to /api/generate
      const mergedPrompt = `${systemPrompt}\n\nUser instruction:\n${userMessage}`;
      const fallbackResponse = await fetch(`${nativeUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt: mergedPrompt,
          stream: false
        })
      });

      if (!fallbackResponse.ok) {
        throw new Error(`Ollama API error: ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json();
      return fallbackData.response || fallbackData.content || '';

    } catch (error) {
      console.error('Ollama API call failed:', error);
      throw error;
    }
  }

  /**
   * Call Azure OpenAI API
   */
  private async callAzureOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
    const { endpoint, apiKey, deployment } = this.config;

    if (!endpoint || !apiKey || !deployment) {
      throw new Error('Azure OpenAI configuration incomplete');
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Call OpenAI-compatible API using chatbotchat configuration
   */
  private async callOpenAICompatible(systemPrompt: string, userMessage: string): Promise<string> {
    const { apiKey, baseUrl, model, provider, temperature = 0.1, maxTokens = 1000 } = this.config;

    if (!apiKey) {
      throw new Error(`API key required for ${provider}`);
    }

    const url = baseUrl || this.getDefaultBaseUrl(provider);

    const response = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`${provider} API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Get default base URL for provider
   */
  private getDefaultBaseUrl(provider: string): string {
    const urls: Record<string, string> = {
      openai: 'https://api.openai.com/v1',
      qwen: 'https://dashscope.aliyuncs.com/api/v1',
      deepseek: 'https://api.deepseek.com',
      groq: 'https://api.groq.com/openai/v1',
      mistral: 'https://api.mistral.ai/v1',
      openrouter: 'https://openrouter.ai/api/v1',
      dify: 'https://api.dify.ai/v1',
      ollama: 'http://localhost:11434/v1'
    };

    return urls[provider] || 'https://api.openai.com/v1';
  }

  /**
   * Parse AI response to extract commands
   */
  private parseAIResponse(response: string): AIAnalysisResult {
    try {
      // Try direct JSON parse
      let parsed = this.tryParseJSON(response);

      if (!parsed) {
        // Try extracting from code blocks
        const codeBlockPatterns = [
          /```(?:json)?\s*([\s\S]*?)\s*```/g,
          /```\s*([\s\S]*?)\s*```/g,
          /`([\s\S]*?)`/g
        ];

        for (const pattern of codeBlockPatterns) {
          const matches = response.matchAll(pattern);
          for (const match of matches) {
            parsed = this.tryParseJSON(match[1]);
            if (parsed && parsed.commands) break;
          }
          if (parsed && parsed.commands) break;
        }
      }

      if (!parsed) {
        // Try finding JSON object
        const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
        const matches = response.matchAll(jsonPattern);
        
        for (const match of matches) {
          if (match[0].includes('"commands"')) {
            parsed = this.tryParseJSON(match[0]);
            if (parsed && parsed.commands) break;
          }
        }
      }

      if (parsed && Array.isArray(parsed.commands)) {
        // Normalize commands
        const normalizedCommands = parsed.commands.map((cmd: any) => ({
          action: String(cmd.action || ''),
          parameters: cmd.parameters || cmd.params || {},
          description: cmd.description || ''
        }));

        return {
          success: true,
          commands: normalizedCommands,
          reasoning: parsed.reasoning,
          raw_response: response
        };
      }

      return {
        success: false,
        commands: [],
        error: `Unable to parse AI response as valid JSON. Response: ${response.substring(0, 200)}...`,
        raw_response: response
      };

    } catch (error) {
      return {
        success: false,
        commands: [],
        error: `Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        raw_response: response
      };
    }
  }

  /**
   * Parse image analysis response
   */
  private parseImageAnalysisResponse(response: string): Partial<ImageAnalysisResult> {
    try {
      const parsed = this.tryParseJSON(response);

      if (parsed) {
        return {
          description: parsed.description,
          detections: parsed.observations || parsed.detections,
          suggestedCommands: parsed.suggestedCommands || []
        };
      }

      // If not JSON, return as plain description
      return {
        description: response,
        suggestedCommands: []
      };

    } catch (error) {
      return {
        description: response,
        suggestedCommands: []
      };
    }
  }

  /**
   * Try to parse JSON with error handling
   */
  private tryParseJSON(text: string): any {
    try {
      return JSON.parse(text.trim());
    } catch {
      return null;
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current configuration
   */
  getConfig(): ChatbotAIConfig {
    return { ...this.config };
  }

  /**
   * Check if agent is currently analyzing
   */
  isCurrentlyAnalyzing(): boolean {
    return this.isAnalyzing;
  }
}

// Export singleton instance creator
let agentInstance: TelloIntelligentAgent | null = null;

export function createTelloAgent(config: ChatbotAIConfig, droneBackendUrl?: string): TelloIntelligentAgent {
  agentInstance = new TelloIntelligentAgent(config, droneBackendUrl);
  return agentInstance;
}

export function getTelloAgent(): TelloIntelligentAgent | null {
  return agentInstance;
}
