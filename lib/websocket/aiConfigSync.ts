/**
 * AI Configuration Synchronization via WebSocket
 * 
 * This module handles synchronizing AI configuration from the frontend
 * to the Python backend via WebSocket connection.
 * 
 * Task 5: Enhanced with AssistantContext integration for automatic AI config sync
 */

import {
  WebSocketError,
  IntelligentAgentErrorType,
  intelligentAgentErrorLogger,
  parseError,
} from '@/lib/errors';
import { aiResponseOptimizer } from '@/lib/services/aiResponseOptimizer';
import { Assistant } from '@/types/assistant';

export interface AIConfig {
  provider: string;
  model: string;
  apiKey: string;
  apiBase?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * AI configuration status for monitoring
 */
export interface AIConfigStatus {
  configured: boolean;
  provider?: string;
  model?: string;
  supportsVision?: boolean;
  lastSyncTime?: number;
  error?: string;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  command?: string;
}

export class AIConfigSyncClient {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;
  private isReconnecting = false;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  
  // Task 5: AI configuration state monitoring
  private currentAIConfig: AIConfig | null = null;
  private aiConfigStatus: AIConfigStatus = { configured: false };
  private configStatusListeners: Set<(status: AIConfigStatus) => void> = new Set();
  private activeAssistantId: string | null = null;

  constructor(wsUrl: string = 'ws://localhost:8765') {
    this.wsUrl = wsUrl;
  }

  /**
   * Connect to WebSocket server with auto-reconnect and heartbeat
   */
  async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        console.log('[AIConfigSync] Connecting to WebSocket:', this.wsUrl);
        
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('[AIConfigSync] WebSocket connected');
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.startHeartbeat();
          this.notifyConnectionListeners(true);
          resolve(true);
        };

        this.ws.onerror = (error) => {
          console.error('[AIConfigSync] WebSocket error:', error);
          const wsError = new WebSocketError(
            'WebSocket connection failed',
            IntelligentAgentErrorType.WEBSOCKET_CONNECTION_FAILED,
            { wsUrl: this.wsUrl }
          );
          intelligentAgentErrorLogger.logError(wsError);
          reject(wsError);
        };

        this.ws.onclose = () => {
          console.log('[AIConfigSync] WebSocket closed');
          this.stopHeartbeat();
          this.notifyConnectionListeners(false);
          this.handleReconnect();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            const timeoutError = new WebSocketError(
              'WebSocket connection timeout',
              IntelligentAgentErrorType.WEBSOCKET_CONNECTION_FAILED,
              { wsUrl: this.wsUrl, timeout: 5000 }
            );
            intelligentAgentErrorLogger.logError(timeoutError);
            reject(timeoutError);
          }
        }, 5000);
      } catch (error) {
        console.error('[AIConfigSync] Connection error:', error);
        const agentError = parseError(error, { operation: 'connect', wsUrl: this.wsUrl });
        intelligentAgentErrorLogger.logError(agentError);
        reject(agentError);
      }
    });
  }

  /**
   * Handle automatic reconnection with exponential backoff
   */
  private handleReconnect() {
    if (this.isReconnecting) {
      return; // Already reconnecting
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.isReconnecting = true;
      this.reconnectAttempts++;
      
      // Exponential backoff: 2s, 4s, 8s, 16s, 32s
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`[AIConfigSync] Reconnecting in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(err => {
          console.error('[AIConfigSync] Reconnection failed:', err);
          this.isReconnecting = false;
        });
      }, delay);
    } else {
      console.error('[AIConfigSync] Max reconnection attempts reached');
      this.notifyConnectionListeners(false);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string) {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      console.log('[AIConfigSync] Received message:', message.type);

      // Handle heartbeat pong
      if (message.type === 'pong') {
        this.lastHeartbeat = Date.now();
        this.resetHeartbeatTimeout();
        return;
      }

      // Task 5: Handle AI config status updates
      if (message.type === 'ai_config_updated') {
        this.updateAIConfigStatus({
          configured: true,
          provider: message.data?.provider,
          model: message.data?.model,
          supportsVision: message.data?.supports_vision,
          lastSyncTime: Date.now(),
        });
      }

      // Call registered handlers
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message.data);
      }
    } catch (error) {
      console.error('[AIConfigSync] Failed to parse message:', error);
    }
  }

  /**
   * Start heartbeat mechanism (ping every 30 seconds)
   */
  private startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing heartbeat

    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('[AIConfigSync] Sending heartbeat ping');
        this.ws.send(JSON.stringify({ type: 'ping' }));
        
        // Set timeout to detect dead connection
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('[AIConfigSync] Heartbeat timeout - connection may be dead');
          this.ws?.close();
        }, 10000); // 10 second timeout for pong response
      }
    }, 30000); // Send ping every 30 seconds

    console.log('[AIConfigSync] Heartbeat started');
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    console.log('[AIConfigSync] Heartbeat stopped');
  }

  /**
   * Reset heartbeat timeout after receiving pong
   */
  private resetHeartbeatTimeout() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Get time since last successful heartbeat
   */
  getTimeSinceLastHeartbeat(): number {
    return this.lastHeartbeat > 0 ? Date.now() - this.lastHeartbeat : -1;
  }

  /**
   * Register a message handler
   */
  on(messageType: string, handler: (data: any) => void) {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Register a connection state listener
   */
  onConnectionChange(listener: (connected: boolean) => void) {
    this.connectionListeners.add(listener);
  }

  /**
   * Unregister a connection state listener
   */
  offConnectionChange(listener: (connected: boolean) => void) {
    this.connectionListeners.delete(listener);
  }

  /**
   * Notify all connection listeners of state change
   */
  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach((listener) => {
      try {
        listener(connected);
      } catch (error) {
        console.error('[AIConfigSync] Error in connection listener:', error);
      }
    });
  }

  /**
   * Send AI configuration to backend
   * Uses timeout management from AI response optimizer
   */
  async syncAIConfig(config: AIConfig): Promise<{ success: boolean; error?: string }> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[AIConfigSync] WebSocket not connected');
      const wsError = new WebSocketError(
        'WebSocket not connected',
        IntelligentAgentErrorType.WEBSOCKET_NOT_CONNECTED
      );
      intelligentAgentErrorLogger.logError(wsError);
      return { success: false, error: wsError.userMessage };
    }

    const requestId = `sync-config-${Date.now()}`;

    try {
      const result = await aiResponseOptimizer.executeWithTimeout(
        requestId,
        async (signal) => {
          return new Promise<{ success: boolean; error?: string }>((resolve) => {
            console.log('[AIConfigSync] Syncing AI config:', {
              provider: config.provider,
              model: config.model,
              hasApiKey: !!config.apiKey
            });

            // Send configuration to backend
            const message = {
              type: 'set_ai_config',
              data: {
                provider: config.provider,
                model: config.model,
                api_key: config.apiKey,
                api_base: config.apiBase,
                temperature: config.temperature || 0.7,
                max_tokens: config.maxTokens || 4000
              }
            };

            this.ws!.send(JSON.stringify(message));

            // Register one-time handler for response
            const handleResponse = (data: any) => {
              this.messageHandlers.delete('ai_config_updated');
              this.messageHandlers.delete('error');
              resolve({ success: true });
            };

            const handleError = (data: any) => {
              this.messageHandlers.delete('ai_config_updated');
              this.messageHandlers.delete('error');
              resolve({ success: false, error: data.message || 'Configuration sync failed' });
            };

            this.on('ai_config_updated', handleResponse);
            this.on('error', handleError);

            // Handle abort signal
            signal.addEventListener('abort', () => {
              this.messageHandlers.delete('ai_config_updated');
              this.messageHandlers.delete('error');
              resolve({ success: false, error: 'Configuration sync timeout' });
            });
          });
        },
        10000 // 10 second timeout for config sync
      );

      return result;
    } catch (error) {
      console.error('[AIConfigSync] Failed to sync config:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Query AI configuration status from backend
   * This queries the backend for its current AI config state
   */
  async queryBackendAIConfigStatus(): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      try {
        const message = {
          type: 'get_ai_config_status'
        };

        this.ws!.send(JSON.stringify(message));

        const timeout = setTimeout(() => {
          reject(new Error('Get status timeout'));
        }, 5000);

        const handleResponse = (data: any) => {
          clearTimeout(timeout);
          this.messageHandlers.delete('ai_config_status');
          resolve(data);
        };

        this.on('ai_config_status', handleResponse);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send AI command for parsing with optimization
   * Uses caching and timeout management
   * 
   * @param command - Natural language command to parse
   * @returns Promise resolving to the parsed command result
   */
  async sendAICommand(command: string): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new WebSocketError(
        'WebSocket not connected',
        IntelligentAgentErrorType.WEBSOCKET_NOT_CONNECTED
      );
    }

    // Check cache first
    const cached = aiResponseOptimizer.getCachedResult(command);
    if (cached) {
      console.log('[AIConfigSync] Using cached command result');
      return cached;
    }

    const requestId = `ai-command-${Date.now()}`;

    try {
      const result = await aiResponseOptimizer.executeWithTimeout(
        requestId,
        async (signal) => {
          return new Promise((resolve, reject) => {
            console.log('[AIConfigSync] Sending AI command:', command);

            const message = {
              type: 'ai_command',
              data: { command }
            };

            this.ws!.send(JSON.stringify(message));

            // Register one-time handler for response
            const handleResponse = (data: any) => {
              this.messageHandlers.delete('ai_command_result');
              this.messageHandlers.delete('error');
              resolve(data);
            };

            const handleError = (data: any) => {
              this.messageHandlers.delete('ai_command_result');
              this.messageHandlers.delete('error');
              reject(new Error(data.message || 'AI command failed'));
            };

            this.on('ai_command_result', handleResponse);
            this.on('error', handleError);

            // Handle abort signal
            signal.addEventListener('abort', () => {
              this.messageHandlers.delete('ai_command_result');
              this.messageHandlers.delete('error');
              reject(new Error('AI command timeout'));
            });
          });
        },
        30000 // 30 second timeout for AI commands
      );

      // Cache the result
      aiResponseOptimizer.cacheResult(command, result);

      return result;
    } catch (error) {
      console.error('[AIConfigSync] AI command failed:', error);
      throw error;
    }
  }

  /**
   * Cancel an active AI command request
   * 
   * @param requestId - ID of the request to cancel (optional, cancels all if not provided)
   */
  cancelAICommand(requestId?: string): void {
    if (requestId) {
      aiResponseOptimizer.cancelRequest(requestId);
    } else {
      aiResponseOptimizer.cancelAllRequests();
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.ws) {
      console.log('[AIConfigSync] Disconnecting WebSocket');
      // Stop heartbeat
      this.stopHeartbeat();
      // Cancel all active requests
      aiResponseOptimizer.cancelAllRequests();
      // Close connection
      this.ws.close();
      this.ws = null;
      // Notify listeners
      this.notifyConnectionListeners(false);
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    connected: boolean;
    reconnectAttempts: number;
    timeSinceLastHeartbeat: number;
    activeRequests: number;
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      timeSinceLastHeartbeat: this.getTimeSinceLastHeartbeat(),
      activeRequests: aiResponseOptimizer.getActiveRequestCount(),
    };
  }

  /**
   * Force reconnect (useful for debugging or manual recovery)
   */
  async forceReconnect(): Promise<boolean> {
    console.log('[AIConfigSync] Forcing reconnect...');
    this.disconnect();
    this.reconnectAttempts = 0;
    return this.connect();
  }

  // ============================================================================
  // Task 5: AssistantContext Integration Methods
  // ============================================================================

  /**
   * Extract AI configuration from Assistant object
   * Maps Assistant properties to AIConfig format
   * 
   * @param assistant - Assistant object from AssistantContext
   * @returns AIConfig object or null if assistant doesn't have AI config
   */
  extractAIConfigFromAssistant(assistant: Assistant | null): AIConfig | null {
    if (!assistant) {
      console.log('[AIConfigSync] No assistant provided');
      return null;
    }

    // Check if assistant has AI configuration in its metadata
    // Assistants may store AI config in different ways:
    // 1. Direct properties (provider, model, apiKey)
    // 2. In metadata object
    // 3. In prompt configuration
    
    const metadata = (assistant as any).metadata;
    const aiConfig = metadata?.aiConfig || (assistant as any).aiConfig;

    if (!aiConfig) {
      console.log('[AIConfigSync] Assistant does not have AI configuration');
      return null;
    }

    // Validate required fields
    if (!aiConfig.provider || !aiConfig.model || !aiConfig.apiKey) {
      console.warn('[AIConfigSync] Assistant AI config missing required fields:', {
        hasProvider: !!aiConfig.provider,
        hasModel: !!aiConfig.model,
        hasApiKey: !!aiConfig.apiKey,
      });
      return null;
    }

    const config: AIConfig = {
      provider: aiConfig.provider,
      model: aiConfig.model,
      apiKey: aiConfig.apiKey,
      apiBase: aiConfig.apiBase,
      temperature: aiConfig.temperature || 0.7,
      maxTokens: aiConfig.maxTokens || 4000,
    };

    console.log('[AIConfigSync] Extracted AI config from assistant:', {
      assistantId: assistant.id,
      assistantTitle: assistant.title,
      provider: config.provider,
      model: config.model,
      hasApiKey: !!config.apiKey,
    });

    return config;
  }

  /**
   * Sync AI configuration from active assistant
   * Automatically extracts config from assistant and syncs to backend
   * 
   * @param assistant - Active assistant from AssistantContext
   * @returns Promise resolving to sync result
   */
  async syncFromAssistant(assistant: Assistant | null): Promise<{ success: boolean; error?: string }> {
    console.log('[AIConfigSync] Syncing AI config from assistant');

    if (!assistant) {
      const error = 'No assistant provided';
      console.error('[AIConfigSync]', error);
      this.updateAIConfigStatus({
        configured: false,
        error,
      });
      return { success: false, error };
    }

    // Extract AI config from assistant
    const config = this.extractAIConfigFromAssistant(assistant);
    
    if (!config) {
      const error = `Assistant "${assistant.title}" does not have AI configuration`;
      console.warn('[AIConfigSync]', error);
      this.updateAIConfigStatus({
        configured: false,
        error,
      });
      return { success: false, error };
    }

    // Store active assistant ID
    this.activeAssistantId = assistant.id;

    // Sync to backend
    const result = await this.syncAIConfig(config);
    
    if (result.success) {
      this.currentAIConfig = config;
      console.log('[AIConfigSync] Successfully synced AI config from assistant:', assistant.title);
    } else {
      this.updateAIConfigStatus({
        configured: false,
        error: result.error,
      });
    }

    return result;
  }

  /**
   * Handle assistant activation/switching
   * Automatically syncs AI config when assistant changes
   * 
   * @param assistant - Newly activated assistant
   * @returns Promise resolving to sync result
   */
  async handleAssistantSwitch(assistant: Assistant | null): Promise<{ success: boolean; error?: string }> {
    console.log('[AIConfigSync] Handling assistant switch');

    // Check if assistant actually changed
    if (assistant && assistant.id === this.activeAssistantId) {
      console.log('[AIConfigSync] Assistant unchanged, skipping sync');
      return { success: true };
    }

    // Sync new assistant's config
    return this.syncFromAssistant(assistant);
  }

  /**
   * Update AI configuration status and notify listeners
   * 
   * @param status - New configuration status
   */
  private updateAIConfigStatus(status: Partial<AIConfigStatus>) {
    this.aiConfigStatus = {
      ...this.aiConfigStatus,
      ...status,
    };

    console.log('[AIConfigSync] AI config status updated:', this.aiConfigStatus);

    // Notify all status listeners
    this.notifyConfigStatusListeners(this.aiConfigStatus);
  }

  /**
   * Notify all configuration status listeners
   * 
   * @param status - Current configuration status
   */
  private notifyConfigStatusListeners(status: AIConfigStatus) {
    this.configStatusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('[AIConfigSync] Error in config status listener:', error);
      }
    });
  }

  /**
   * Register a configuration status listener
   * 
   * @param listener - Callback function to receive status updates
   */
  onConfigStatusChange(listener: (status: AIConfigStatus) => void) {
    this.configStatusListeners.add(listener);
    
    // Immediately notify with current status
    listener(this.aiConfigStatus);
  }

  /**
   * Unregister a configuration status listener
   * 
   * @param listener - Callback function to remove
   */
  offConfigStatusChange(listener: (status: AIConfigStatus) => void) {
    this.configStatusListeners.delete(listener);
  }

  /**
   * Get current AI configuration status
   * 
   * @returns Current configuration status
   */
  getAIConfigStatus(): AIConfigStatus {
    return { ...this.aiConfigStatus };
  }

  /**
   * Get current AI configuration
   * 
   * @returns Current AI config or null if not configured
   */
  getCurrentAIConfig(): AIConfig | null {
    return this.currentAIConfig ? { ...this.currentAIConfig } : null;
  }

  /**
   * Get active assistant ID
   * 
   * @returns Active assistant ID or null
   */
  getActiveAssistantId(): string | null {
    return this.activeAssistantId;
  }

  /**
   * Clear AI configuration
   * Resets configuration state and notifies backend
   */
  async clearAIConfig(): Promise<void> {
    console.log('[AIConfigSync] Clearing AI configuration');
    
    this.currentAIConfig = null;
    this.activeAssistantId = null;
    
    this.updateAIConfigStatus({
      configured: false,
      provider: undefined,
      model: undefined,
      supportsVision: undefined,
      lastSyncTime: undefined,
      error: undefined,
    });

    // Notify backend to clear config
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({
          type: 'clear_ai_config',
        }));
      } catch (error) {
        console.error('[AIConfigSync] Failed to notify backend of config clear:', error);
      }
    }
  }
}

// Singleton instance
let aiConfigSyncClient: AIConfigSyncClient | null = null;

/**
 * Get or create AI config sync client instance
 */
export function getAIConfigSyncClient(wsUrl?: string): AIConfigSyncClient {
  if (!aiConfigSyncClient) {
    aiConfigSyncClient = new AIConfigSyncClient(wsUrl);
  }
  return aiConfigSyncClient;
}
