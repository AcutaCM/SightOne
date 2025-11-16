/**
 * Assistant Sync Queue Service
 * 
 * Manages a local queue for assistant operations that need to be synced
 * with a backend server. This is prepared for future backend integration.
 * 
 * Features:
 * - Queue pending operations when network is unavailable
 * - Automatic retry when network is restored
 * - Persistent queue storage in localStorage
 * - Operation deduplication
 * 
 * Requirements: 2.7
 */

/**
 * Queue operation types
 */
export enum SyncOperationType {
  ADD_ASSISTANT = 'add_assistant',
  REMOVE_ASSISTANT = 'remove_assistant',
  UPDATE_LAST_USED = 'update_last_used',
  TOGGLE_FAVORITE = 'toggle_favorite',
  UPDATE_CUSTOM_NAME = 'update_custom_name',
}

/**
 * Queue operation interface
 */
export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  assistantId: string;
  data?: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

/**
 * Sync Queue Service Class
 */
export class AssistantSyncQueue {
  private readonly storageKey = 'assistant_sync_queue';
  private readonly maxRetries = 3;
  private isProcessing = false;
  private networkCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Add operation to queue
   */
  async enqueue(
    type: SyncOperationType,
    assistantId: string,
    data?: any
  ): Promise<void> {
    try {
      const operation: SyncOperation = {
        id: this.generateOperationId(type, assistantId),
        type,
        assistantId,
        data,
        timestamp: Date.now(),
        retryCount: 0,
      };

      const queue = this.getQueue();
      
      // Check for duplicate operations
      const existingIndex = queue.findIndex(op => op.id === operation.id);
      if (existingIndex >= 0) {
        // Update existing operation
        queue[existingIndex] = operation;
      } else {
        // Add new operation
        queue.push(operation);
      }

      await this.saveQueue(queue);
      
      console.log('[AssistantSyncQueue] Operation enqueued:', operation);
    } catch (error) {
      console.error('[AssistantSyncQueue] Failed to enqueue operation:', error);
    }
  }

  /**
   * Get all pending operations
   */
  getQueue(): SyncOperation[] {
    try {
      if (typeof window === 'undefined') {
        return [];
      }

      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return [];
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error('[AssistantSyncQueue] Failed to load queue:', error);
      return [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(queue: SyncOperation[]): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return;
      }

      localStorage.setItem(this.storageKey, JSON.stringify(queue));
    } catch (error) {
      console.error('[AssistantSyncQueue] Failed to save queue:', error);
      throw error;
    }
  }

  /**
   * Process queue - sync with backend
   * This is a placeholder for future backend integration
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const queue = this.getQueue();
      
      if (queue.length === 0) {
        return;
      }

      console.log(`[AssistantSyncQueue] Processing ${queue.length} operations...`);

      const remainingOperations: SyncOperation[] = [];

      for (const operation of queue) {
        try {
          // TODO: Replace with actual API call when backend is ready
          const success = await this.syncOperation(operation);

          if (!success) {
            // Increment retry count
            operation.retryCount++;

            if (operation.retryCount < this.maxRetries) {
              // Keep in queue for retry
              remainingOperations.push(operation);
            } else {
              // Max retries reached, log and discard
              console.error(
                '[AssistantSyncQueue] Max retries reached for operation:',
                operation
              );
            }
          }
        } catch (error) {
          console.error('[AssistantSyncQueue] Failed to sync operation:', error);
          
          operation.retryCount++;
          operation.lastError = error instanceof Error ? error.message : 'Unknown error';

          if (operation.retryCount < this.maxRetries) {
            remainingOperations.push(operation);
          }
        }
      }

      // Save remaining operations
      await this.saveQueue(remainingOperations);

      console.log(
        `[AssistantSyncQueue] Processing complete. ${remainingOperations.length} operations remaining.`
      );
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Sync a single operation with backend
   * This is a placeholder for future backend integration
   */
  private async syncOperation(operation: SyncOperation): Promise<boolean> {
    // TODO: Implement actual API calls when backend is ready
    // For now, just simulate success
    console.log('[AssistantSyncQueue] Syncing operation (simulated):', operation);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return true to indicate success (remove from queue)
    return true;
  }

  /**
   * Check if network is available
   */
  private async checkNetwork(): Promise<boolean> {
    try {
      // Check if online
      if (!navigator.onLine) {
        return false;
      }

      // TODO: Add actual backend health check when available
      // For now, assume network is available if navigator.onLine is true
      return true;
    } catch (error) {
      console.error('[AssistantSyncQueue] Network check failed:', error);
      return false;
    }
  }

  /**
   * Start automatic sync when network is available
   */
  startAutoSync(intervalMs: number = 30000): void {
    if (this.networkCheckInterval) {
      return;
    }

    console.log('[AssistantSyncQueue] Starting auto-sync...');

    this.networkCheckInterval = setInterval(async () => {
      const isOnline = await this.checkNetwork();
      
      if (isOnline) {
        const queue = this.getQueue();
        if (queue.length > 0) {
          console.log('[AssistantSyncQueue] Network available, processing queue...');
          await this.processQueue();
        }
      }
    }, intervalMs);

    // Also listen for online event
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[AssistantSyncQueue] Network restored, processing queue...');
        this.processQueue();
      });
    }
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.networkCheckInterval) {
      clearInterval(this.networkCheckInterval);
      this.networkCheckInterval = null;
      console.log('[AssistantSyncQueue] Auto-sync stopped');
    }
  }

  /**
   * Clear all pending operations
   */
  async clearQueue(): Promise<void> {
    try {
      await this.saveQueue([]);
      console.log('[AssistantSyncQueue] Queue cleared');
    } catch (error) {
      console.error('[AssistantSyncQueue] Failed to clear queue:', error);
    }
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): {
    totalOperations: number;
    operationsByType: Record<string, number>;
    oldestOperation: number | null;
  } {
    const queue = this.getQueue();
    
    const stats = {
      totalOperations: queue.length,
      operationsByType: {} as Record<string, number>,
      oldestOperation: null as number | null,
    };

    queue.forEach(op => {
      stats.operationsByType[op.type] = (stats.operationsByType[op.type] || 0) + 1;
      
      if (!stats.oldestOperation || op.timestamp < stats.oldestOperation) {
        stats.oldestOperation = op.timestamp;
      }
    });

    return stats;
  }

  /**
   * Generate unique operation ID
   */
  private generateOperationId(type: SyncOperationType, assistantId: string): string {
    return `${type}_${assistantId}`;
  }
}

/**
 * Singleton instance
 */
let defaultQueue: AssistantSyncQueue | null = null;

/**
 * Get the default queue instance
 */
export function getAssistantSyncQueue(): AssistantSyncQueue {
  if (!defaultQueue) {
    defaultQueue = new AssistantSyncQueue();
    
    // Start auto-sync if in browser environment
    if (typeof window !== 'undefined') {
      defaultQueue.startAutoSync();
    }
  }
  return defaultQueue;
}

/**
 * Reset the default queue instance (useful for testing)
 */
export function resetAssistantSyncQueue(): void {
  if (defaultQueue) {
    defaultQueue.stopAutoSync();
  }
  defaultQueue = null;
}

/**
 * Export singleton instance for convenience
 */
export const assistantSyncQueue = getAssistantSyncQueue();
