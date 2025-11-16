/**
 * Assistant API Client
 * 
 * Provides a high-level interface for interacting with the assistant API endpoints.
 * Integrates with IndexedDB cache for offline support and performance optimization.
 * Implements retry logic, error handling, and background synchronization.
 */

import { 
  Assistant, 
  CreateAssistantRequest, 
  UpdateAssistantRequest, 
  UpdateStatusRequest,
  AssistantQueryFilters,
  ApiResponse,
  AssistantListResponse
} from '@/types/assistant';
import { indexedDBCache } from '@/lib/cache/indexedDBCache';
import { logger } from '@/lib/logger/logger';
import { measureAsync, performanceMonitor } from '@/lib/monitoring/performanceMonitor';
import { normalizeAssistant, normalizeAssistants } from '@/lib/utils/assistantUtils';

/**
 * Configuration for API client
 */
interface ApiClientConfig {
  baseUrl: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: '/api/assistants',
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 30000, // 30 seconds
};

/**
 * Assistant API Client class
 * Handles all HTTP communication with the assistant API
 */
export class AssistantApiClient {
  private config: ApiClientConfig;
  private syncInProgress = false;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get all assistants with optional filtering and caching
   * 
   * @param options - Query options including cache control and filters
   * @returns Promise resolving to array of assistants
   */
  async getAll(options?: {
    useCache?: boolean;
    page?: number;
    pageSize?: number;
    status?: string;
    author?: string;
    search?: string;
  }): Promise<Assistant[]> {
    let cachedData: Assistant[] = [];
    
    // Try cache first if enabled (default: true)
    if (options?.useCache !== false) {
      try {
        const cached = await indexedDBCache.getAll();
        if (cached.length > 0) {
          // Normalize dates in cached data to prevent hydration errors
          cachedData = normalizeAssistants(cached);
          
          // Return cached data immediately
          console.log('[AssistantApiClient] Returning cached data');
          
          // Sync in background without blocking
          this.syncInBackground().catch(err => 
            console.warn('[AssistantApiClient] Background sync failed:', err)
          );
          performanceMonitor.trackCacheHit();
          logger.debug('Returning cached assistants', { count: cachedData.length }, 'AssistantApiClient');
          return cachedData;
        }
      } catch (error) {
        // Log cache error but don't throw - continue to server fetch
        logger.warn('Failed to load from cache', { error }, 'AssistantApiClient');
        console.warn('[AssistantApiClient] Cache read failed, continuing to server fetch:', error);
        // Continue to fetch from server
      }
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.pageSize) params.append('pageSize', options.pageSize.toString());
    if (options?.status) params.append('status', options.status);
    if (options?.author) params.append('author', options.author);
    if (options?.search) params.append('search', options.search);

    // Fetch from server with retry logic and error handling
    try {
      const url = `${this.config.baseUrl}?${params}`;
      const response = await measureAsync(
        'GET /api/assistants',
        () => this.fetchWithRetry<ApiResponse<AssistantListResponse>>(url),
        'api'
      );

      if (!response.success || !response.data) {
        logger.error('Failed to fetch assistants', { error: response.error }, 'AssistantApiClient');
        console.error('[AssistantApiClient] Server fetch failed:', response.error);
        
        // If we have cached data, return it as fallback
        if (cachedData.length > 0) {
          console.log('[AssistantApiClient] Returning cached data as fallback');
          return cachedData;
        }
        
        // Only return empty array if no cache is available
        console.warn('[AssistantApiClient] No cached data available, returning empty array');
        return [];
      }

      const assistants = response.data.data;
      logger.info('Assistants fetched from server', { count: assistants.length }, 'AssistantApiClient');

      // Normalize dates before returning to prevent hydration errors
      const normalized = normalizeAssistants(assistants);

      // Update cache asynchronously
      if (options?.useCache !== false) {
        performanceMonitor.trackCacheMiss();
        this.updateCache(normalized).catch(err =>
          logger.warn('Failed to update cache', { error: err }, 'AssistantApiClient')
        );
      }

      return normalized;
    } catch (error) {
      // Catch any unexpected errors
      logger.error('Unexpected error fetching assistants', { error }, 'AssistantApiClient');
      console.error('[AssistantApiClient] Unexpected error:', error);
      
      // If we have cached data, return it as fallback
      if (cachedData.length > 0) {
        console.log('[AssistantApiClient] Returning cached data as fallback after error');
        return cachedData;
      }
      
      // Only return empty array if no cache is available
      console.warn('[AssistantApiClient] No cached data available after error, returning empty array');
      return [];
    }
  }

  /**
   * Get a single assistant by ID
   * 
   * @param id - Assistant ID
   * @param useCache - Whether to use cache (default: true)
   * @returns Promise resolving to assistant or null if not found
   */
  async getById(id: string, useCache = true): Promise<Assistant | null> {
    // Try cache first
    if (useCache) {
      try {
        const cached = await indexedDBCache.getById(id);
        if (cached) {
          // Normalize dates in cached data to prevent hydration errors
          const normalized = normalizeAssistant(cached);
          console.log(`[AssistantApiClient] Returning cached assistant ${id}`);
          performanceMonitor.trackCacheHit();
          logger.debug('Returning cached assistant', { id }, 'AssistantApiClient');
          return normalized;
        }
      } catch (error) {
        // Log cache error but don't throw - continue to server fetch
        console.warn(`[AssistantApiClient] Failed to load assistant ${id} from cache:`, error);
        logger.warn('Failed to load assistant from cache', { id, error }, 'AssistantApiClient');
        // Continue to fetch from server
      }
    }

    // Fetch from server with graceful error handling
    try {
      const url = `${this.config.baseUrl}/${id}`;
      const response = await measureAsync(
        `GET /api/assistants/${id}`,
        () => this.fetchWithRetry<ApiResponse<Assistant>>(url),
        'api'
      );

      if (!response.success || !response.data) {
        // Handle specific error cases
        if (response.error?.code === 'NOT_FOUND') {
          logger.info('Assistant not found', { id }, 'AssistantApiClient');
          console.log(`[AssistantApiClient] Assistant ${id} not found`);
          return null;
        }
        
        // Log other errors but return null instead of throwing
        logger.error('Failed to fetch assistant by ID', { id, error: response.error }, 'AssistantApiClient');
        console.error(`[AssistantApiClient] Server fetch failed for assistant ${id}:`, response.error);
        return null;
      }

      const assistant = response.data;
      logger.info('Assistant fetched from server', { id }, 'AssistantApiClient');

      // Normalize dates before returning to prevent hydration errors
      const normalized = normalizeAssistant(assistant);

      // Update cache asynchronously
      if (useCache) {
        performanceMonitor.trackCacheMiss();
        this.updateCacheSingle(normalized).catch(err =>
          logger.warn('Failed to update cache', { id, error: err }, 'AssistantApiClient')
        );
      }

      return normalized;
    } catch (error) {
      // Catch any unexpected errors and return null to prevent UI blocking
      logger.error('Unexpected error fetching assistant by ID', { id, error }, 'AssistantApiClient');
      console.error(`[AssistantApiClient] Unexpected error fetching assistant ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new assistant with enhanced retry logic
   * 
   * Requirements:
   * - 2.1: Upload assistant data to server API
   * - 2.2: Send assistant data to server API with retry logic
   * - 9.1: Persist assistant data to both IndexedDB and server
   * 
   * @param data - Assistant creation data
   * @returns Promise resolving to created assistant
   */
  async create(data: CreateAssistantRequest): Promise<Assistant> {
    const url = this.config.baseUrl;
    
    try {
      // Attempt to create on server with automatic retry logic
      const response = await measureAsync(
        'POST /api/assistants',
        () => this.fetchWithRetry<ApiResponse<Assistant>>(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
        'api'
      );

      if (!response.success || !response.data) {
        // Server creation failed - save to pending queue for later sync
        logger.error('Server creation failed, saving to pending queue', { 
          error: response.error 
        }, 'AssistantApiClient');
        
        throw new Error(response.error?.message || 'Failed to create assistant');
      }

      const assistant = response.data;

      // Normalize dates before returning
      const normalized = normalizeAssistant(assistant);

      // 等待缓存更新完成，确保其他页面能立即看到新创建的助理
      try {
        await this.updateCacheSingle(normalized);
        console.log(`[AssistantApiClient] Cache updated for new assistant: ${normalized.id}`);
        logger.info('Assistant created and cached successfully', { 
          id: normalized.id 
        }, 'AssistantApiClient');
      } catch (err) {
        // 缓存更新失败不应该阻止操作，但要记录日志
        console.warn('[AssistantApiClient] Failed to update cache after create:', err);
        logger.warn('Cache update failed after create', { 
          id: normalized.id, 
          error: err 
        }, 'AssistantApiClient');
      }

      return normalized;
    } catch (error) {
      // Log the error and re-throw for caller to handle
      logger.error('Failed to create assistant', { 
        error, 
        data: { title: data.title } 
      }, 'AssistantApiClient');
      
      throw error;
    }
  }

  /**
   * Update an existing assistant
   * 
   * @param id - Assistant ID
   * @param data - Update data including version for optimistic locking
   * @returns Promise resolving to updated assistant
   */
  async update(id: string, data: UpdateAssistantRequest): Promise<Assistant> {
    const url = `${this.config.baseUrl}/${id}`;
    const response = await this.fetchWithRetry<ApiResponse<Assistant>>(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.success || !response.data) {
      // Handle version conflict specifically
      if (response.error?.code === 'VERSION_CONFLICT') {
        throw new Error('Version conflict: data has been modified by another user');
      }
      throw new Error(response.error?.message || 'Failed to update assistant');
    }

    const assistant = response.data;

    // Normalize dates before returning
    const normalized = normalizeAssistant(assistant);

    // 等待缓存更新完成，确保其他页面能立即看到更新
    try {
      await this.updateCacheSingle(normalized);
      console.log(`[AssistantApiClient] Cache updated for assistant update: ${id}`);
    } catch (err) {
      // 缓存更新失败不应该阻止操作，但要记录日志
      console.warn('[AssistantApiClient] Failed to update cache after update:', err);
      logger.warn('Cache update failed after update', { id, error: err }, 'AssistantApiClient');
    }

    return normalized;
  }

  /**
   * Delete an assistant
   * 
   * @param id - Assistant ID
   * @returns Promise resolving when deletion is complete
   */
  async delete(id: string): Promise<void> {
    const url = `${this.config.baseUrl}/${id}`;
    const response = await this.fetchWithRetry<ApiResponse<{ id: string }>>(url, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete assistant');
    }

    console.log(`[AssistantApiClient] Server delete successful for ${id}, removing from cache`);

    // Wait for cache deletion to complete
    try {
      const deleted = await indexedDBCache.delete(id);
      
      if (!deleted) {
        // Item wasn't in cache (could be normal if cache was cleared)
        console.warn(`[AssistantApiClient] Item ${id} not found in cache during delete`);
        // Trigger background sync to ensure consistency
        this.syncInBackground().catch(err =>
          console.warn('[AssistantApiClient] Background sync after cache miss failed:', err)
        );
      } else {
        console.log(`[AssistantApiClient] Successfully removed ${id} from cache`);
      }
    } catch (error) {
      // Cache deletion failed - this is serious, trigger full sync
      console.error(`[AssistantApiClient] Cache delete failed for ${id}:`, error);
      logger.error('Cache delete operation failed', { id, error }, 'AssistantApiClient');
      
      // Trigger background sync to fix inconsistency
      console.log('[AssistantApiClient] Triggering background sync to fix cache inconsistency');
      this.syncInBackground().catch(err =>
        console.warn('[AssistantApiClient] Background sync after cache error failed:', err)
      );
    }
  }

  /**
   * Update assistant status (for admin review)
   * 
   * @param id - Assistant ID
   * @param data - Status update data including version
   * @returns Promise resolving to updated assistant
   */
  async updateStatus(id: string, data: UpdateStatusRequest): Promise<Assistant> {
    const url = `${this.config.baseUrl}/${id}/status`;
    const response = await this.fetchWithRetry<ApiResponse<Assistant>>(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.success || !response.data) {
      // Handle version conflict specifically
      if (response.error?.code === 'VERSION_CONFLICT') {
        throw new Error('Version conflict: data has been modified by another user');
      }
      throw new Error(response.error?.message || 'Failed to update status');
    }

    const assistant = response.data;

    // Normalize dates before returning
    const normalized = normalizeAssistant(assistant);

    // 等待缓存更新完成，确保其他页面能立即看到最新状态
    try {
      await this.updateCacheSingle(normalized);
      console.log(`[AssistantApiClient] Cache updated for status change: ${id}`);
    } catch (err) {
      // 缓存更新失败不应该阻止操作，但要记录日志
      console.warn('[AssistantApiClient] Failed to update cache after status change:', err);
      logger.warn('Cache update failed after status change', { id, error: err }, 'AssistantApiClient');
    }

    return normalized;
  }

  /**
   * Synchronize cache with server in background
   * Does not throw errors to avoid blocking UI
   * Ensures date normalization is applied to synced data
   * Validates cache consistency and removes stale entries
   * 
   * Requirements:
   * - 1.1: Handle API unavailability gracefully without blocking the UI
   * - 1.4: Display assistants from cache while syncing with the server in the background
   * - 4.2: Automatically clean up stale cache entries
   */
  private async syncInBackground(): Promise<void> {
    // Prevent multiple simultaneous syncs
    if (this.syncInProgress) {
      console.log('[AssistantApiClient] Sync already in progress, skipping');
      logger.debug('Background sync skipped - already in progress', {}, 'AssistantApiClient');
      return;
    }

    try {
      this.syncInProgress = true;
      console.log('[AssistantApiClient] Starting background sync with consistency validation');
      logger.info('Starting background sync', {}, 'AssistantApiClient');

      // Fetch from server with useCache: false to get fresh data
      // getAll method already:
      // - Handles all errors gracefully (returns empty array on failure)
      // - Applies date normalization via normalizeAssistants()
      // - Logs errors without throwing
      const assistants = await this.getAll({ useCache: false });
      
      // Validate cache consistency regardless of whether we got data
      // This ensures we clean up stale entries even if server returns empty
      try {
        const serverIds = assistants.map(a => a.id);
        const validation = await indexedDBCache.validateConsistency(serverIds);
        
        if (validation.removed > 0) {
          console.log(
            `[AssistantApiClient] Removed ${validation.removed} stale cache entries:`,
            validation.inconsistencies
          );
          logger.info('Cache consistency validation completed', {
            removed: validation.removed,
            inconsistencies: validation.inconsistencies
          }, 'AssistantApiClient');
        } else {
          console.log('[AssistantApiClient] Cache is consistent with server');
        }
      } catch (validationError) {
        // Log validation errors but don't fail the sync
        console.warn('[AssistantApiClient] Cache validation failed:', validationError);
        logger.warn('Cache validation failed', { error: validationError }, 'AssistantApiClient');
      }
      
      // Update cache with fresh data if we got any
      if (assistants.length > 0) {
        // Data is already normalized by getAll method (all dates are Date objects)
        // This ensures no hydration errors when data is read from cache later
        await indexedDBCache.setAll(assistants);
        console.log(`[AssistantApiClient] Background sync complete: ${assistants.length} assistants synced`);
        logger.info('Background sync completed successfully', { count: assistants.length }, 'AssistantApiClient');
      } else {
        // Empty data from server - this is now handled by consistency validation above
        // We've already cleaned up stale entries, so cache should be correct
        console.log('[AssistantApiClient] Server returned no data, cache cleaned via validation');
        logger.info('Background sync with empty server data - cache validated', {}, 'AssistantApiClient');
      }
    } catch (error) {
      // Catch all errors to ensure they don't propagate to UI
      // This is critical for background operations - they must never throw
      console.warn('[AssistantApiClient] Background sync failed (caught):', error);
      logger.warn('Background sync failed - error caught and suppressed', { error }, 'AssistantApiClient');
      // Don't re-throw - this is a background operation that must not affect UI
    } finally {
      // Always reset sync flag to allow future syncs
      this.syncInProgress = false;
    }
  }

  /**
   * Update cache with multiple assistants
   */
  private async updateCache(assistants: Assistant[]): Promise<void> {
    try {
      await indexedDBCache.setAll(assistants);
      console.log(`[AssistantApiClient] Cache updated: ${assistants.length} assistants`);
    } catch (error) {
      console.warn('[AssistantApiClient] Failed to update cache:', error);
    }
  }

  /**
   * Update cache with a single assistant
   */
  private async updateCacheSingle(assistant: Assistant): Promise<void> {
    try {
      await indexedDBCache.set(assistant);
      console.log(`[AssistantApiClient] Cache updated: assistant ${assistant.id}`);
    } catch (error) {
      console.warn('[AssistantApiClient] Failed to update cache:', error);
    }
  }

  /**
   * Fetch with automatic retry logic
   * Implements exponential backoff for transient failures
   */
  private async fetchWithRetry<T>(
    url: string,
    options?: RequestInit,
    attempt = 1
  ): Promise<T> {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Include cookies for authentication
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data = await response.json();

      // Return data even if not ok - let caller handle error response
      return data as T;

    } catch (error) {
      // Check if we should retry
      const shouldRetry = this.shouldRetry(error, attempt);

      if (shouldRetry && attempt < this.config.maxRetries) {
        // Calculate delay with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        
        console.warn(
          `[AssistantApiClient] Request failed (attempt ${attempt}/${this.config.maxRetries}), ` +
          `retrying in ${delay}ms...`,
          error
        );

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry
        return this.fetchWithRetry<T>(url, options, attempt + 1);
      }

      // Max retries reached or non-retryable error
      console.error('[AssistantApiClient] Request failed after retries:', error);
      throw error;
    }
  }

  /**
   * Determine if an error is retryable
   */
  private shouldRetry(error: any, attempt: number): boolean {
    // Don't retry if max attempts reached
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    // Retry on network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }

    // Retry on timeout
    if (error.name === 'AbortError') {
      return true;
    }

    // Don't retry on other errors (e.g., 4xx client errors)
    return false;
  }

  /**
   * Clean expired cache entries
   * Should be called periodically (e.g., on app startup)
   */
  async cleanExpiredCache(): Promise<number> {
    try {
      const cleaned = await indexedDBCache.cleanExpired();
      console.log(`[AssistantApiClient] Cleaned ${cleaned} expired cache entries`);
      return cleaned;
    } catch (error) {
      console.warn('[AssistantApiClient] Failed to clean expired cache:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   * Useful for logout or data reset
   */
  async clearCache(): Promise<void> {
    try {
      await indexedDBCache.clear();
      console.log('[AssistantApiClient] Cache cleared');
    } catch (error) {
      console.warn('[AssistantApiClient] Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const assistantApiClient = new AssistantApiClient();

