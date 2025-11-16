/**
 * Assistant Sync Service
 * 
 * Automatically syncs pending assistants to the server when network is available.
 * Monitors network status and retries failed uploads.
 * 
 * Requirements:
 * - 9.2: Save failed assistant to IndexedDB
 * - 9.3: Automatically sync when network recovers
 */

import { assistantApiClient } from '@/lib/api/assistantApiClient';
import { indexedDBCache } from '@/lib/cache/indexedDBCache';
import { logger } from '@/lib/logger/logger';

/**
 * Sync configuration
 */
interface SyncConfig {
  maxRetries: number;
  retryDelay: number;
  syncInterval: number;
}

/**
 * Default sync configuration
 */
const DEFAULT_CONFIG: SyncConfig = {
  maxRetries: 5,
  retryDelay: 5000, // 5 seconds
  syncInterval: 30000, // 30 seconds
};

/**
 * Sync result for a single assistant
 */
interface SyncResult {
  tempId: string;
  success: boolean;
  assistantId?: string;
  error?: string;
}

/**
 * Assistant Sync Service
 * Handles automatic synchronization of pending assistants
 */
export class AssistantSyncService {
  private config: SyncConfig;
  private syncTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private isOnline = true;
  private listeners: Set<(results: SyncResult[]) => void> = new Set();

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize network status monitoring
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.setupNetworkListeners();
    }
  }

  /**
   * Setup network status listeners
   * Requirements: 9.3
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('[AssistantSyncService] Network online - triggering sync');
      logger.info('Network connection restored', {}, 'AssistantSyncService');
      this.isOnline = true;
      this.syncPendingAssistants();
    });

    window.addEventListener('offline', () => {
      console.log('[AssistantSyncService] Network offline');
      logger.info('Network connection lost', {}, 'AssistantSyncService');
      this.isOnline = false;
    });
  }

  /**
   * Start automatic sync service
   * Requirements: 9.3
   */
  start(): void {
    if (this.syncTimer) {
      console.warn('[AssistantSyncService] Sync service already started');
      return;
    }

    console.log('[AssistantSyncService] Starting sync service');
    logger.info('Starting automatic sync service', { 
      interval: this.config.syncInterval 
    }, 'AssistantSyncService');

    // Initial sync
    this.syncPendingAssistants();

    // Setup periodic sync
    this.syncTimer = setInterval(() => {
      this.syncPendingAssistants();
    }, this.config.syncInterval);
  }

  /**
   * Stop automatic sync service
   */
  stop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('[AssistantSyncService] Sync service stopped');
      logger.info('Stopped automatic sync service', {}, 'AssistantSyncService');
    }
  }

  /**
   * Sync all pending assistants to server
   * Requirements: 9.2, 9.3
   * 
   * @returns Array of sync results
   */
  async syncPendingAssistants(): Promise<SyncResult[]> {
    // Skip if already syncing
    if (this.isSyncing) {
      console.log('[AssistantSyncService] Sync already in progress, skipping');
      return [];
    }

    // Skip if offline
    if (!this.isOnline) {
      console.log('[AssistantSyncService] Offline, skipping sync');
      return [];
    }

    try {
      this.isSyncing = true;
      console.log('[AssistantSyncService] Starting sync of pending assistants');

      // Get all pending assistants
      const pending = await indexedDBCache.getPendingAssistants();

      if (pending.length === 0) {
        console.log('[AssistantSyncService] No pending assistants to sync');
        return [];
      }

      console.log(`[AssistantSyncService] Found ${pending.length} pending assistants to sync`);
      logger.info('Starting sync of pending assistants', { 
        count: pending.length 
      }, 'AssistantSyncService');

      // Sync each pending assistant
      const results: SyncResult[] = [];

      for (const item of pending) {
        // Check if max retries exceeded
        if (item.retryCount >= this.config.maxRetries) {
          console.warn(
            `[AssistantSyncService] Max retries exceeded for ${item.tempId}, skipping`
          );
          logger.warn('Max retries exceeded for pending assistant', {
            tempId: item.tempId,
            retryCount: item.retryCount
          }, 'AssistantSyncService');
          
          results.push({
            tempId: item.tempId,
            success: false,
            error: 'Max retries exceeded',
          });
          continue;
        }

        // Attempt to sync
        const result = await this.syncSingleAssistant(item);
        results.push(result);

        // Add delay between syncs to avoid overwhelming the server
        if (pending.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Notify listeners
      this.notifyListeners(results);

      const successCount = results.filter(r => r.success).length;
      console.log(
        `[AssistantSyncService] Sync complete: ${successCount}/${results.length} successful`
      );
      logger.info('Sync completed', {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount
      }, 'AssistantSyncService');

      return results;
    } catch (error) {
      console.error('[AssistantSyncService] Sync failed:', error);
      logger.error('Sync failed with error', { error }, 'AssistantSyncService');
      return [];
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single pending assistant
   * Requirements: 9.2, 9.3
   */
  private async syncSingleAssistant(
    item: { tempId: string; data: any; retryCount: number }
  ): Promise<SyncResult> {
    try {
      console.log(`[AssistantSyncService] Syncing ${item.tempId} (attempt ${item.retryCount + 1})`);

      // Create assistant on server
      const created = await assistantApiClient.create({
        title: item.data.title,
        desc: item.data.desc,
        emoji: item.data.emoji,
        prompt: item.data.prompt,
        tags: item.data.tags,
        isPublic: item.data.isPublic,
      });

      // Remove from pending queue
      await indexedDBCache.removePendingAssistant(item.tempId);

      console.log(`[AssistantSyncService] Successfully synced ${item.tempId} -> ${created.id}`);
      logger.info('Successfully synced pending assistant', {
        tempId: item.tempId,
        assistantId: created.id
      }, 'AssistantSyncService');

      return {
        tempId: item.tempId,
        success: true,
        assistantId: created.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`[AssistantSyncService] Failed to sync ${item.tempId}:`, errorMessage);
      logger.error('Failed to sync pending assistant', {
        tempId: item.tempId,
        error: errorMessage,
        retryCount: item.retryCount
      }, 'AssistantSyncService');

      // Update retry count
      await indexedDBCache.updatePendingAssistantRetry(item.tempId, errorMessage);

      return {
        tempId: item.tempId,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Add a listener for sync results
   * 
   * @param listener - Callback function to receive sync results
   */
  addListener(listener: (results: SyncResult[]) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove a listener
   * 
   * @param listener - Callback function to remove
   */
  removeListener(listener: (results: SyncResult[]) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of sync results
   */
  private notifyListeners(results: SyncResult[]): void {
    this.listeners.forEach(listener => {
      try {
        listener(results);
      } catch (error) {
        console.error('[AssistantSyncService] Listener error:', error);
      }
    });
  }

  /**
   * Get current sync status
   */
  getStatus(): {
    isOnline: boolean;
    isSyncing: boolean;
    isRunning: boolean;
  } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      isRunning: this.syncTimer !== null,
    };
  }

  /**
   * Manually trigger a sync (useful for testing or user-initiated sync)
   */
  async triggerSync(): Promise<SyncResult[]> {
    console.log('[AssistantSyncService] Manual sync triggered');
    return this.syncPendingAssistants();
  }
}

// Export singleton instance
export const assistantSyncService = new AssistantSyncService();

// Auto-start sync service in browser environment
if (typeof window !== 'undefined') {
  // Start after a short delay to allow app initialization
  setTimeout(() => {
    assistantSyncService.start();
    console.log('[AssistantSyncService] Auto-started sync service');
  }, 5000);
}
