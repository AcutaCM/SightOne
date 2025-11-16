/**
 * PureChat API Client for Workflow Integration
 * 
 * This client provides a unified interface for calling PureChat AI services
 * with error handling, retry logic, and result caching.
 */

export interface PureChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface PureChatChatRequest {
  assistantId: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  context?: PureChatMessage[];
}

export interface PureChatImageAnalysisRequest {
  assistantId: string;
  imageData: string; // base64 encoded image
  prompt: string;
  imageSource?: 'camera' | 'upload' | 'variable';
}

export interface PureChatResponse {
  success: boolean;
  data?: any;
  error?: string;
  cached?: boolean;
}

export interface PureChatClientConfig {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  enableCache?: boolean;
  cacheTimeout?: number; // milliseconds
  maxRetries?: number;
  retryDelay?: number; // milliseconds
}

/**
 * PureChat API Client
 */
export class PureChatClient {
  private config: Required<PureChatClientConfig>;
  private cache: Map<string, { data: any; timestamp: number }>;

  constructor(config: Partial<PureChatClientConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || process.env.NEXT_PUBLIC_PURECHAT_BASE_URL || '/api/ai-chat',
      apiKey: config.apiKey || process.env.NEXT_PUBLIC_PURECHAT_API_KEY || '',
      model: config.model || process.env.NEXT_PUBLIC_PURECHAT_MODEL || 'qwen2.5-7b-instruct',
      enableCache: config.enableCache ?? true,
      cacheTimeout: config.cacheTimeout || 5 * 60 * 1000, // 5 minutes
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
    };
    this.cache = new Map();
  }

  /**
   * Generate cache key from request
   */
  private getCacheKey(request: any): string {
    return JSON.stringify(request);
  }

  /**
   * Get cached result if available and not expired
   */
  private getCachedResult(key: string): any | null {
    if (!this.config.enableCache) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Cache result
   */
  private setCachedResult(key: string, data: any): void {
    if (!this.config.enableCache) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Retry logic wrapper
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.config.maxRetries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries <= 0) {
        throw error;
      }

      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));

      // Retry
      return this.withRetry(fn, retries - 1);
    }
  }

  /**
   * Call PureChat for text chat
   */
  async chat(request: PureChatChatRequest): Promise<PureChatResponse> {
    const cacheKey = this.getCacheKey(request);
    const cached = this.getCachedResult(cacheKey);

    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true,
      };
    }

    try {
      const messages: PureChatMessage[] = [
        ...(request.context || []),
        {
          role: 'user',
          content: request.prompt,
        },
      ];

      const result = await this.withRetry(async () => {
        const response = await fetch(this.config.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
          },
          body: JSON.stringify({
            messages,
            model: this.config.model,
            config: {
              temperature: request.temperature || 0.7,
              maxTokens: request.maxTokens || 1000,
              stream: false,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`PureChat API error: ${response.status} - ${errorText}`);
        }

        const text = await response.text();
        return text;
      });

      this.setCachedResult(cacheKey, result);

      return {
        success: true,
        data: result,
        cached: false,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Call PureChat for image analysis
   */
  async analyzeImage(request: PureChatImageAnalysisRequest): Promise<PureChatResponse> {
    const cacheKey = this.getCacheKey(request);
    const cached = this.getCachedResult(cacheKey);

    if (cached) {
      return {
        success: true,
        data: cached,
        cached: true,
      };
    }

    try {
      const messages: PureChatMessage[] = [
        {
          role: 'user',
          content: request.prompt,
        },
      ];

      const result = await this.withRetry(async () => {
        // Use vision API endpoint
        const response = await fetch('/api/vision/qwen', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'qwen2.5-vl-7b-instruct',
            messages,
            images: [request.imageData],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.ok) {
          throw new Error(data.error || 'Vision API returned error');
        }

        return data.data;
      });

      this.setCachedResult(cacheKey, result);

      return {
        success: true,
        data: result,
        cached: false,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Get assistant prompt from AssistantContext
   */
  async getAssistantPrompt(assistantId: string): Promise<string | null> {
    try {
      // This would typically fetch from AssistantContext
      // For now, return null and let the caller handle it
      return null;
    } catch (error) {
      console.error('Failed to get assistant prompt:', error);
      return null;
    }
  }
}

// Singleton instance
let pureChatClientInstance: PureChatClient | null = null;

/**
 * Get or create PureChat client instance
 */
export function getPureChatClient(config?: Partial<PureChatClientConfig>): PureChatClient {
  if (!pureChatClientInstance || config) {
    pureChatClientInstance = new PureChatClient(config);
  }
  return pureChatClientInstance;
}

/**
 * Reset PureChat client instance (useful for testing)
 */
export function resetPureChatClient(): void {
  pureChatClientInstance = null;
}
