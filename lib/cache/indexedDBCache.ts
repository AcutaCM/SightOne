import { Assistant } from '@/types/assistant';

const DB_NAME = 'AssistantMarketDB';
const DB_VERSION = 2; // Incremented for pending assistants store
const STORE_NAME = 'assistants';
const PENDING_STORE_NAME = 'pending_assistants'; // New store for pending assistants
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedAssistant extends Assistant {
  cachedAt: number;
}

/**
 * Pending assistant waiting for server sync
 * Requirements: 9.1, 9.2
 */
interface PendingAssistant {
  tempId: string; // Temporary ID until synced
  data: Omit<Assistant, 'id' | 'createdAt' | 'version'>;
  createdAt: number; // Timestamp when saved locally
  retryCount: number; // Number of sync attempts
  lastError?: string; // Last sync error message
}

/**
 * IndexedDB cache layer for assistant data
 * Provides fast client-side caching with automatic expiration
 */
export class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the IndexedDB database
   * Creates object store and indexes if they don't exist
   */
  async init(): Promise<void> {
    // Return existing initialization promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.db) {
      return Promise.resolve();
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        this.initPromise = null;
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initPromise = null;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;
        
        // Create assistants object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          
          // Create indexes for efficient querying
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('author', 'author', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('cachedAt', 'cachedAt', { unique: false });
        }
        
        // Create pending assistants store (Requirements: 9.1, 9.2)
        if (oldVersion < 2 && !db.objectStoreNames.contains(PENDING_STORE_NAME)) {
          const pendingStore = db.createObjectStore(PENDING_STORE_NAME, { keyPath: 'tempId' });
          
          // Create indexes for pending assistants
          pendingStore.createIndex('createdAt', 'createdAt', { unique: false });
          pendingStore.createIndex('retryCount', 'retryCount', { unique: false });
          
          console.log('[IndexedDBCache] Created pending_assistants store');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get all assistants from cache
   * Filters out expired cache entries
   */
  async getAll(): Promise<Assistant[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as CachedAssistant[];
        const now = Date.now();
        
        // Filter out expired cache entries
        const validItems = items.filter(item => 
          now - item.cachedAt < CACHE_TTL
        );

        // Remove cachedAt property before returning
        const assistants = validItems.map(({ cachedAt, ...assistant }) => assistant);
        resolve(assistants);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get all assistants: ${request.error?.message}`));
      };
    });
  }

  /**
   * Get a single assistant by ID from cache
   * Returns null if not found or expired
   */
  async getById(id: string): Promise<Assistant | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const item = request.result as CachedAssistant | undefined;
        
        if (!item) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        if (Date.now() - item.cachedAt >= CACHE_TTL) {
          // Clean up expired cache asynchronously
          this.delete(id).catch(err => 
            console.warn('Failed to clean up expired cache:', err)
          );
          resolve(null);
          return;
        }

        // Remove cachedAt property before returning
        const { cachedAt, ...assistant } = item;
        resolve(assistant);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get assistant ${id}: ${request.error?.message}`));
      };
    });
  }

  /**
   * Store a single assistant in cache
   * Adds timestamp for expiration tracking
   */
  async set(assistant: Assistant): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const item: CachedAssistant = { ...assistant, cachedAt: Date.now() };
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        reject(new Error(`Failed to set assistant ${assistant.id}: ${request.error?.message}`));
      };
    });
  }

  /**
   * Store multiple assistants in cache
   * Clears existing cache and replaces with new data
   */
  async setAll(assistants: Assistant[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Clear existing data
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        // Add all items with timestamp
        const now = Date.now();
        assistants.forEach(assistant => {
          const item: CachedAssistant = { ...assistant, cachedAt: now };
          store.put(item);
        });
      };

      clearRequest.onerror = () => {
        reject(new Error(`Failed to clear cache: ${clearRequest.error?.message}`));
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => {
        reject(new Error(`Failed to set all assistants: ${transaction.error?.message}`));
      };
    });
  }

  /**
   * Delete a single assistant from cache
   * Returns true if the item was deleted, false if it didn't exist
   */
  async delete(id: string): Promise<boolean> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // First check if the item exists
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const exists = getRequest.result !== undefined;
        
        if (!exists) {
          // Item doesn't exist, return false
          console.log(`[IndexedDBCache] Item ${id} not found in cache`);
          resolve(false);
          return;
        }
        
        // Item exists, delete it
        const deleteRequest = store.delete(id);
        
        deleteRequest.onsuccess = () => {
          console.log(`[IndexedDBCache] Successfully deleted item ${id}`);
          resolve(true);
        };
        
        deleteRequest.onerror = () => {
          console.error(`[IndexedDBCache] Failed to delete item ${id}:`, deleteRequest.error);
          reject(new Error(`Failed to delete assistant ${id}: ${deleteRequest.error?.message}`));
        };
      };
      
      getRequest.onerror = () => {
        console.error(`[IndexedDBCache] Failed to check existence of item ${id}:`, getRequest.error);
        reject(new Error(`Failed to check assistant ${id}: ${getRequest.error?.message}`));
      };
    });
  }

  /**
   * Clear all assistants from cache
   */
  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => {
        reject(new Error(`Failed to clear cache: ${request.error?.message}`));
      };
    });
  }

  /**
   * Clean up expired cache entries
   * Returns the number of entries cleaned
   */
  async cleanExpired(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('cachedAt');
      const request = index.openCursor();
      
      const now = Date.now();
      let cleaned = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor) {
          const item = cursor.value as CachedAssistant;
          
          // Delete if expired
          if (now - item.cachedAt >= CACHE_TTL) {
            cursor.delete();
            cleaned++;
          }
          
          cursor.continue();
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to clean expired cache: ${request.error?.message}`));
      };

      transaction.oncomplete = () => resolve(cleaned);
      transaction.onerror = () => {
        reject(new Error(`Transaction failed during cleanup: ${transaction.error?.message}`));
      };
    });
  }

  /**
   * Validate cache consistency with server data
   * Removes cache entries that don't exist on the server
   * 
   * @param serverIds - Array of assistant IDs that exist on the server
   * @returns Object containing the number of removed items and their IDs
   */
  async validateConsistency(serverIds: string[]): Promise<{
    removed: number;
    inconsistencies: string[];
  }> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();
      
      const serverIdSet = new Set(serverIds);
      const inconsistencies: string[] = [];
      let removed = 0;

      request.onsuccess = () => {
        const cacheIds = request.result as string[];
        
        // Find IDs that exist in cache but not on server
        const staleIds = cacheIds.filter(id => !serverIdSet.has(id));
        
        if (staleIds.length === 0) {
          console.log('[IndexedDBCache] Cache is consistent with server');
          resolve({ removed: 0, inconsistencies: [] });
          return;
        }
        
        console.log(`[IndexedDBCache] Found ${staleIds.length} stale cache entries:`, staleIds);
        
        // Delete stale entries
        staleIds.forEach(id => {
          const deleteRequest = store.delete(id);
          
          deleteRequest.onsuccess = () => {
            removed++;
            inconsistencies.push(id);
            console.log(`[IndexedDBCache] Removed stale cache entry: ${id}`);
          };
          
          deleteRequest.onerror = () => {
            console.error(`[IndexedDBCache] Failed to remove stale entry ${id}:`, deleteRequest.error);
          };
        });
      };

      request.onerror = () => {
        console.error('[IndexedDBCache] Failed to get cache keys:', request.error);
        reject(new Error(`Failed to get cache keys: ${request.error?.message}`));
      };

      transaction.oncomplete = () => {
        if (removed > 0) {
          console.log(`[IndexedDBCache] Consistency validation complete: removed ${removed} stale entries`);
        }
        resolve({ removed, inconsistencies });
      };
      
      transaction.onerror = () => {
        console.error('[IndexedDBCache] Transaction failed during consistency validation:', transaction.error);
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };
    });
  }

  /**
   * Save a pending assistant for later sync
   * Requirements: 9.1, 9.2
   * 
   * @param data - Assistant data to save
   * @returns Temporary ID assigned to the pending assistant
   */
  async savePendingAssistant(
    data: Omit<Assistant, 'id' | 'createdAt' | 'version'>
  ): Promise<string> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PENDING_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(PENDING_STORE_NAME);
      
      // Generate temporary ID (Requirements: 9.4)
      const tempId = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const pendingAssistant: PendingAssistant = {
        tempId,
        data,
        createdAt: Date.now(),
        retryCount: 0,
      };
      
      const request = store.put(pendingAssistant);

      request.onsuccess = () => {
        console.log(`[IndexedDBCache] Saved pending assistant: ${tempId}`);
        resolve(tempId);
      };
      
      request.onerror = () => {
        console.error(`[IndexedDBCache] Failed to save pending assistant:`, request.error);
        reject(new Error(`Failed to save pending assistant: ${request.error?.message}`));
      };
    });
  }

  /**
   * Get all pending assistants waiting for sync
   * Requirements: 9.2
   * 
   * @returns Array of pending assistants
   */
  async getPendingAssistants(): Promise<PendingAssistant[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PENDING_STORE_NAME, 'readonly');
      const store = transaction.objectStore(PENDING_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as PendingAssistant[];
        console.log(`[IndexedDBCache] Retrieved ${items.length} pending assistants`);
        resolve(items);
      };

      request.onerror = () => {
        console.error('[IndexedDBCache] Failed to get pending assistants:', request.error);
        reject(new Error(`Failed to get pending assistants: ${request.error?.message}`));
      };
    });
  }

  /**
   * Remove a pending assistant after successful sync
   * Requirements: 9.2
   * 
   * @param tempId - Temporary ID of the pending assistant
   * @returns True if removed, false if not found
   */
  async removePendingAssistant(tempId: string): Promise<boolean> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PENDING_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(PENDING_STORE_NAME);
      
      // First check if the item exists
      const getRequest = store.get(tempId);
      
      getRequest.onsuccess = () => {
        const exists = getRequest.result !== undefined;
        
        if (!exists) {
          console.log(`[IndexedDBCache] Pending assistant ${tempId} not found`);
          resolve(false);
          return;
        }
        
        // Item exists, delete it
        const deleteRequest = store.delete(tempId);
        
        deleteRequest.onsuccess = () => {
          console.log(`[IndexedDBCache] Removed pending assistant: ${tempId}`);
          resolve(true);
        };
        
        deleteRequest.onerror = () => {
          console.error(`[IndexedDBCache] Failed to remove pending assistant ${tempId}:`, deleteRequest.error);
          reject(new Error(`Failed to remove pending assistant: ${deleteRequest.error?.message}`));
        };
      };
      
      getRequest.onerror = () => {
        console.error(`[IndexedDBCache] Failed to check pending assistant ${tempId}:`, getRequest.error);
        reject(new Error(`Failed to check pending assistant: ${getRequest.error?.message}`));
      };
    });
  }

  /**
   * Update retry count for a pending assistant
   * Requirements: 9.2, 9.3
   * 
   * @param tempId - Temporary ID of the pending assistant
   * @param error - Error message from last sync attempt
   */
  async updatePendingAssistantRetry(tempId: string, error?: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PENDING_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(PENDING_STORE_NAME);
      
      const getRequest = store.get(tempId);
      
      getRequest.onsuccess = () => {
        const pending = getRequest.result as PendingAssistant | undefined;
        
        if (!pending) {
          console.warn(`[IndexedDBCache] Pending assistant ${tempId} not found for retry update`);
          resolve();
          return;
        }
        
        // Update retry count and error
        pending.retryCount++;
        if (error) {
          pending.lastError = error;
        }
        
        const putRequest = store.put(pending);
        
        putRequest.onsuccess = () => {
          console.log(`[IndexedDBCache] Updated retry count for ${tempId}: ${pending.retryCount}`);
          resolve();
        };
        
        putRequest.onerror = () => {
          console.error(`[IndexedDBCache] Failed to update retry count:`, putRequest.error);
          reject(new Error(`Failed to update retry count: ${putRequest.error?.message}`));
        };
      };
      
      getRequest.onerror = () => {
        console.error(`[IndexedDBCache] Failed to get pending assistant for retry update:`, getRequest.error);
        reject(new Error(`Failed to get pending assistant: ${getRequest.error?.message}`));
      };
    });
  }

  /**
   * Close the database connection
   * Should be called when the cache is no longer needed
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const indexedDBCache = new IndexedDBCache();
