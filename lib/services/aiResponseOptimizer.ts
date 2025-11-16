/**
 * AI Response Optimizer
 * 
 * Optimizes AI response times through:
 * - Request timeout management (30 seconds)
 * - Command parsing result caching
 * - Request cancellation support
 */

import { logger } from '@/lib/logger/logger';

const AI_TIMEOUT = 30000; // 30 seconds
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for command cache

interface CachedCommand {
  input: string;
  output: any;
  timestamp: number;
}

interface AIRequest {
  controller: AbortController;
  timeout: NodeJS.Timeout;
  promise: Promise<any>;
}

/**
 * AI Response Optimizer Service
 * Manages AI request timeouts, caching, and cancellation
 */
export class AIResponseOptimizer {
  private commandCache: Map<string, CachedCommand> = new Map();
  private activeRequests: Map<string, AIRequest> = new Map();
  private cacheCleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cache cleanup interval (every minute)
    this.startCacheCleanup();
  }

  /**
   * Start periodic cache cleanup
   */
  private startCacheCleanup(): void {
    this.cacheCleanupInterval = setInterval(() => {
      this.cleanExpiredCache();
    }, 60000); // Every minute
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    let cleaned = 0;
    const keysToDelete: string[] = [];

    this.commandCache.forEach((cached, key) => {
      if (now - cached.timestamp >= CACHE_TTL) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.commandCache.delete(key);
      cleaned++;
    });

    if (cleaned > 0) {
      logger.info(`Cleaned ${cleaned} expired command cache entries`, {}, 'AIResponseOptimizer');
    }
  }

  /**
   * Generate cache key from command input
   */
  private getCacheKey(input: string): string {
    // Normalize input for consistent caching
    return input.trim().toLowerCase();
  }

  /**
   * Check if a command result is cached
   */
  hasCachedResult(input: string): boolean {
    const key = this.getCacheKey(input);
    const cached = this.commandCache.get(key);

    if (!cached) {
      return false;
    }

    // Check if cache is expired
    if (Date.now() - cached.timestamp >= CACHE_TTL) {
      this.commandCache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cached command result
   */
  getCachedResult(input: string): any | null {
    const key = this.getCacheKey(input);
    const cached = this.commandCache.get(key);

    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - cached.timestamp >= CACHE_TTL) {
      this.commandCache.delete(key);
      logger.info('Command cache expired', { input }, 'AIResponseOptimizer');
      return null;
    }

    logger.info('Command cache hit', { input, age: Date.now() - cached.timestamp }, 'AIResponseOptimizer');
    return cached.output;
  }

  /**
   * Cache command result
   */
  cacheResult(input: string, output: any): void {
    const key = this.getCacheKey(input);
    this.commandCache.set(key, {
      input,
      output,
      timestamp: Date.now(),
    });

    logger.info('Command result cached', { input, cacheSize: this.commandCache.size }, 'AIResponseOptimizer');
  }

  /**
   * Clear command cache
   */
  clearCache(): void {
    const size = this.commandCache.size;
    this.commandCache.clear();
    logger.info(`Cleared command cache (${size} entries)`, {}, 'AIResponseOptimizer');
  }

  /**
   * Execute AI request with timeout and cancellation support
   * 
   * @param requestId - Unique identifier for this request
   * @param requestFn - Function that performs the AI request
   * @param timeout - Timeout in milliseconds (default: 30000)
   * @returns Promise resolving to the AI response
   */
  async executeWithTimeout<T>(
    requestId: string,
    requestFn: (signal: AbortSignal) => Promise<T>,
    timeout: number = AI_TIMEOUT
  ): Promise<T> {
    // Cancel any existing request with the same ID
    this.cancelRequest(requestId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      logger.warn('AI request timed out', { requestId, timeout }, 'AIResponseOptimizer');
    }, timeout);

    const promise = requestFn(controller.signal)
      .finally(() => {
        clearTimeout(timeoutId);
        this.activeRequests.delete(requestId);
      });

    // Store active request
    this.activeRequests.set(requestId, {
      controller,
      timeout: timeoutId,
      promise,
    });

    try {
      const result = await promise;
      logger.info('AI request completed', { requestId }, 'AIResponseOptimizer');
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.warn('AI request was cancelled', { requestId }, 'AIResponseOptimizer');
        throw new Error('Request was cancelled or timed out');
      }
      throw error;
    }
  }

  /**
   * Cancel an active AI request
   * 
   * @param requestId - ID of the request to cancel
   * @returns true if request was cancelled, false if not found
   */
  cancelRequest(requestId: string): boolean {
    const request = this.activeRequests.get(requestId);

    if (!request) {
      return false;
    }

    // Abort the request
    request.controller.abort();
    clearTimeout(request.timeout);
    this.activeRequests.delete(requestId);

    logger.info('AI request cancelled', { requestId }, 'AIResponseOptimizer');
    return true;
  }

  /**
   * Cancel all active AI requests
   */
  cancelAllRequests(): void {
    const count = this.activeRequests.size;

    this.activeRequests.forEach((request, requestId) => {
      request.controller.abort();
      clearTimeout(request.timeout);
    });

    this.activeRequests.clear();
    logger.info(`Cancelled all AI requests (${count} requests)`, {}, 'AIResponseOptimizer');
  }

  /**
   * Get number of active requests
   */
  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ input: string; age: number }>;
  } {
    const now = Date.now();
    const entries: Array<{ input: string; age: number }> = [];
    
    this.commandCache.forEach((cached) => {
      entries.push({
        input: cached.input,
        age: now - cached.timestamp,
      });
    });

    return {
      size: this.commandCache.size,
      entries,
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Cancel all active requests
    this.cancelAllRequests();

    // Clear cache
    this.clearCache();

    // Stop cleanup interval
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
      this.cacheCleanupInterval = null;
    }

    logger.info('AI Response Optimizer destroyed', {}, 'AIResponseOptimizer');
  }
}

// Export singleton instance
export const aiResponseOptimizer = new AIResponseOptimizer();

/**
 * Helper function to execute AI command parsing with optimization
 * 
 * @param input - User command input
 * @param parseFn - Function that calls the AI to parse the command
 * @returns Promise resolving to the parsed command result
 */
export async function executeOptimizedAICommand(
  input: string,
  parseFn: (signal: AbortSignal) => Promise<any>
): Promise<any> {
  // Check cache first
  const cached = aiResponseOptimizer.getCachedResult(input);
  if (cached) {
    return cached;
  }

  // Execute with timeout
  const requestId = `command-${Date.now()}-${Math.random()}`;
  const result = await aiResponseOptimizer.executeWithTimeout(
    requestId,
    parseFn,
    AI_TIMEOUT
  );

  // Cache the result
  aiResponseOptimizer.cacheResult(input, result);

  return result;
}
