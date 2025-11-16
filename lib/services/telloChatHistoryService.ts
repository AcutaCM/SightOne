/**
 * Tello Chat History Service
 * Manages persistent storage of chat history for TelloIntelligentAgentChat
 */

/**
 * Drone command interface (matches TelloAIParser DroneCommand)
 */
export interface DroneCommand {
  action: string;
  params?: Record<string, any>;
  description?: string;
}

/**
 * Chat message interface
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  commands?: DroneCommand[];
  timestamp: number;
}

/**
 * Chat history data structure for storage
 */
interface ChatHistoryData {
  messages: ChatMessage[];
  lastUpdated: number;
  version: string;
}

/**
 * Tello Chat History Service
 * Handles localStorage operations for chat history persistence
 */
export class TelloChatHistoryService {
  private static readonly STORAGE_KEY_PREFIX = 'chat-history-';
  private static readonly MAX_MESSAGES = 100;
  private static readonly STORAGE_VERSION = '1.0';

  /**
   * Generate storage key for specific assistant
   */
  private static getStorageKey(assistantId: string): string {
    return `${this.STORAGE_KEY_PREFIX}${assistantId}`;
  }

  /**
   * Check if localStorage is available
   */
  private static isLocalStorageAvailable(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate history data structure
   */
  private static validateHistoryData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    if (!Array.isArray(data.messages)) {
      return false;
    }

    if (typeof data.lastUpdated !== 'number') {
      return false;
    }

    if (typeof data.version !== 'string') {
      return false;
    }

    // Validate each message
    return data.messages.every((msg: any) => {
      if (!msg ||
          typeof msg.id !== 'string' ||
          typeof msg.role !== 'string' ||
          !['user', 'assistant', 'system'].includes(msg.role) ||
          typeof msg.content !== 'string' ||
          typeof msg.timestamp !== 'number') {
        return false;
      }

      // Validate commands if present
      if (msg.commands !== undefined) {
        if (!Array.isArray(msg.commands)) {
          return false;
        }

        // Validate each command
        return msg.commands.every((cmd: any) =>
          cmd &&
          typeof cmd === 'object' &&
          typeof cmd.action === 'string' &&
          (cmd.params === undefined || typeof cmd.params === 'object') &&
          (cmd.description === undefined || typeof cmd.description === 'string')
        );
      }

      return true;
    });
  }

  /**
   * Trim messages to MAX_MESSAGES limit while preserving welcome message
   */
  private static trimMessages(messages: ChatMessage[]): ChatMessage[] {
    if (messages.length <= this.MAX_MESSAGES) {
      return messages;
    }

    // Always keep the first message (welcome message)
    const welcomeMessage = messages[0];
    const recentMessages = messages.slice(-(this.MAX_MESSAGES - 1));

    return [welcomeMessage, ...recentMessages];
  }

  /**
   * Load chat history from localStorage
   */
  static loadHistory(assistantId: string): ChatMessage[] | null {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available');
      return null;
    }

    try {
      const key = this.getStorageKey(assistantId);
      const stored = localStorage.getItem(key);

      if (!stored) {
        return null;
      }

      const data: ChatHistoryData = JSON.parse(stored);

      if (!this.validateHistoryData(data)) {
        console.warn('Invalid history data structure, clearing storage');
        this.clearHistory(assistantId);
        return null;
      }

      return data.messages;
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Clear corrupted data
      this.clearHistory(assistantId);
      return null;
    }
  }

  /**
   * Save chat history to localStorage with debouncing support
   */
  static saveHistory(assistantId: string, messages: ChatMessage[]): boolean {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available, skipping save');
      return false;
    }

    try {
      const key = this.getStorageKey(assistantId);
      const trimmedMessages = this.trimMessages(messages);

      const data: ChatHistoryData = {
        messages: trimmedMessages,
        lastUpdated: Date.now(),
        version: this.STORAGE_VERSION
      };

      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      // Handle QuotaExceededError
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting to save with fewer messages');
        
        try {
          // Try to save with only the most recent 50 messages
          const key = this.getStorageKey(assistantId);
          const welcomeMessage = messages[0];
          const recentMessages = messages.slice(-49);
          const reducedMessages = [welcomeMessage, ...recentMessages];

          const data: ChatHistoryData = {
            messages: reducedMessages,
            lastUpdated: Date.now(),
            version: this.STORAGE_VERSION
          };

          localStorage.setItem(key, JSON.stringify(data));
          console.info('Successfully saved with reduced message count');
          return true;
        } catch (retryError) {
          console.error('Failed to save even after reducing message count:', retryError);
          return false;
        }
      }

      console.error('Failed to save chat history:', error);
      return false;
    }
  }

  /**
   * Clear chat history from localStorage
   */
  static clearHistory(assistantId: string): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }

    try {
      const key = this.getStorageKey(assistantId);
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      return false;
    }
  }

  /**
   * Get all stored assistant IDs
   */
  static getAllStoredAssistantIds(): string[] {
    if (!this.isLocalStorageAvailable()) {
      return [];
    }

    try {
      const assistantIds: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
          const assistantId = key.substring(this.STORAGE_KEY_PREFIX.length);
          assistantIds.push(assistantId);
        }
      }

      return assistantIds;
    } catch (error) {
      console.error('Failed to get stored assistant IDs:', error);
      return [];
    }
  }

  /**
   * Get storage size for specific assistant (in bytes)
   */
  static getStorageSize(assistantId: string): number {
    if (!this.isLocalStorageAvailable()) {
      return 0;
    }

    try {
      const key = this.getStorageKey(assistantId);
      const stored = localStorage.getItem(key);
      
      if (!stored) {
        return 0;
      }

      // Calculate size in bytes (UTF-16 encoding)
      return new Blob([stored]).size;
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return 0;
    }
  }

  /**
   * Clear all chat histories
   */
  static clearAllHistories(): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }

    try {
      const assistantIds = this.getAllStoredAssistantIds();
      
      assistantIds.forEach(assistantId => {
        this.clearHistory(assistantId);
      });

      return true;
    } catch (error) {
      console.error('Failed to clear all histories:', error);
      return false;
    }
  }
}
