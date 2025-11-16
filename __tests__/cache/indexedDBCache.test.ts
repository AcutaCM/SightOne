/**
 * IndexedDB Cache Unit Tests
 * 
 * Tests for cache read/write operations, expiration mechanism,
 * and cache cleanup functionality.
 */

import { IndexedDBCache } from '@/lib/cache/indexedDBCache';
import { Assistant, AssistantStatus } from '@/types/assistant';

// Mock IndexedDB for Node.js testing environment
import 'fake-indexeddb/auto';

describe('IndexedDBCache', () => {
  let cache: IndexedDBCache;

  // Helper function to create a test assistant
  const createTestAssistant = (overrides?: Partial<Assistant>): Assistant => ({
    id: `test-${Date.now()}-${Math.random()}`,
    title: 'Test Assistant',
    desc: 'A test assistant for cache testing',
    emoji: '🤖',
    prompt: 'You are a helpful test assistant',
    tags: ['test', 'cache'],
    isPublic: false,
    status: 'draft' as AssistantStatus,
    author: 'test-user',
    createdAt: new Date(),
    version: 1,
    ...overrides,
  });

  beforeEach(async () => {
    // Create new cache instance
    cache = new IndexedDBCache();
    await cache.init();
  });

  afterEach(async () => {
    // Clear cache and close connection
    await cache.clear();
    cache.close();
  });

  describe('Initialization', () => {
    it('should initialize database successfully', async () => {
      const newCache = new IndexedDBCache();
      await expect(newCache.init()).resolves.not.toThrow();
      newCache.close();
    });

    it('should handle multiple init calls gracefully', async () => {
      const newCache = new IndexedDBCache();
      await newCache.init();
      await newCache.init(); // Should not throw
      await newCache.init(); // Should not throw
      newCache.close();
    });
  });

  describe('Cache Read/Write Operations', () => {
    it('should store and retrieve a single assistant', async () => {
      const assistant = createTestAssistant();
      
      await cache.set(assistant);
      const retrieved = await cache.getById(assistant.id);
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(assistant.id);
      expect(retrieved?.title).toBe(assistant.title);
      expect(retrieved?.desc).toBe(assistant.desc);
    });

    it('should return null for non-existent assistant', async () => {
      const retrieved = await cache.getById('non-existent-id');
      expect(retrieved).toBeNull();
    });

    it('should store and retrieve multiple assistants', async () => {
      const assistants = [
        createTestAssistant({ title: 'Assistant 1' }),
        createTestAssistant({ title: 'Assistant 2' }),
        createTestAssistant({ title: 'Assistant 3' }),
      ];
      
      await cache.setAll(assistants);
      const retrieved = await cache.getAll();
      
      expect(retrieved).toHaveLength(3);
      expect(retrieved.map(a => a.title)).toContain('Assistant 1');
      expect(retrieved.map(a => a.title)).toContain('Assistant 2');
      expect(retrieved.map(a => a.title)).toContain('Assistant 3');
    });

    it('should replace existing cache when using setAll', async () => {
      const firstBatch = [
        createTestAssistant({ title: 'Old 1' }),
        createTestAssistant({ title: 'Old 2' }),
      ];
      
      await cache.setAll(firstBatch);
      
      const secondBatch = [
        createTestAssistant({ title: 'New 1' }),
      ];
      
      await cache.setAll(secondBatch);
      const retrieved = await cache.getAll();
      
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].title).toBe('New 1');
    });

    it('should update existing assistant when using set', async () => {
      const assistant = createTestAssistant({ title: 'Original Title' });
      
      await cache.set(assistant);
      
      const updated = { ...assistant, title: 'Updated Title' };
      await cache.set(updated);
      
      const retrieved = await cache.getById(assistant.id);
      expect(retrieved?.title).toBe('Updated Title');
    });

    it('should delete a single assistant', async () => {
      const assistant = createTestAssistant();
      
      await cache.set(assistant);
      expect(await cache.getById(assistant.id)).not.toBeNull();
      
      await cache.delete(assistant.id);
      expect(await cache.getById(assistant.id)).toBeNull();
    });

    it('should clear all assistants', async () => {
      const assistants = [
        createTestAssistant(),
        createTestAssistant(),
        createTestAssistant(),
      ];
      
      await cache.setAll(assistants);
      expect((await cache.getAll()).length).toBe(3);
      
      await cache.clear();
      expect((await cache.getAll()).length).toBe(0);
    });
  });

  describe('Cache Expiration', () => {
    it('should filter out expired cache entries in getAll', async () => {
      // Create cache instance with access to internal state
      const testCache = new IndexedDBCache();
      await testCache.init();
      
      const assistant = createTestAssistant();
      await testCache.set(assistant);
      
      // Manually set cachedAt to 8 days ago (expired)
      const db = (testCache as any).db as IDBDatabase;
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('assistants', 'readwrite');
        const store = transaction.objectStore('assistants');
        const request = store.get(assistant.id);
        
        request.onsuccess = () => {
          const item = request.result;
          item.cachedAt = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
          store.put(item);
        };
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      
      const retrieved = await testCache.getAll();
      expect(retrieved).toHaveLength(0);
      
      testCache.close();
    });

    it('should return null for expired cache entry in getById', async () => {
      const testCache = new IndexedDBCache();
      await testCache.init();
      
      const assistant = createTestAssistant();
      await testCache.set(assistant);
      
      // Manually set cachedAt to 8 days ago (expired)
      const db = (testCache as any).db as IDBDatabase;
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('assistants', 'readwrite');
        const store = transaction.objectStore('assistants');
        const request = store.get(assistant.id);
        
        request.onsuccess = () => {
          const item = request.result;
          item.cachedAt = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
          store.put(item);
        };
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      
      const retrieved = await testCache.getById(assistant.id);
      expect(retrieved).toBeNull();
      
      testCache.close();
    });

    it('should not filter out fresh cache entries', async () => {
      const assistant = createTestAssistant();
      await cache.set(assistant);
      
      // Immediately retrieve - should not be expired
      const retrieved = await cache.getById(assistant.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(assistant.id);
    });
  });

  describe('Cache Cleanup', () => {
    it('should clean up expired entries and return count', async () => {
      const testCache = new IndexedDBCache();
      await testCache.init();
      
      // Add fresh entries
      const freshAssistants = [
        createTestAssistant({ title: 'Fresh 1' }),
        createTestAssistant({ title: 'Fresh 2' }),
      ];
      await testCache.setAll(freshAssistants);
      
      // Add expired entries manually
      const db = (testCache as any).db as IDBDatabase;
      const expiredAssistants = [
        createTestAssistant({ title: 'Expired 1' }),
        createTestAssistant({ title: 'Expired 2' }),
        createTestAssistant({ title: 'Expired 3' }),
      ];
      
      for (const assistant of expiredAssistants) {
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction('assistants', 'readwrite');
          const store = transaction.objectStore('assistants');
          const item = {
            ...assistant,
            cachedAt: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago
          };
          store.put(item);
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      }
      
      // Clean expired entries
      const cleaned = await testCache.cleanExpired();
      expect(cleaned).toBe(3);
      
      // Verify only fresh entries remain
      const remaining = await testCache.getAll();
      expect(remaining).toHaveLength(2);
      expect(remaining.map(a => a.title)).toContain('Fresh 1');
      expect(remaining.map(a => a.title)).toContain('Fresh 2');
      
      testCache.close();
    });

    it('should return 0 when no expired entries exist', async () => {
      const assistants = [
        createTestAssistant(),
        createTestAssistant(),
      ];
      await cache.setAll(assistants);
      
      const cleaned = await cache.cleanExpired();
      expect(cleaned).toBe(0);
    });

    it('should handle cleanup on empty cache', async () => {
      const cleaned = await cache.cleanExpired();
      expect(cleaned).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle operations on closed database', async () => {
      const testCache = new IndexedDBCache();
      await testCache.init();
      testCache.close();
      
      // Operations should reinitialize the database
      const assistant = createTestAssistant();
      await expect(testCache.set(assistant)).resolves.not.toThrow();
      
      testCache.close();
    });

    it('should handle concurrent operations', async () => {
      const assistants = Array.from({ length: 10 }, (_, i) =>
        createTestAssistant({ title: `Assistant ${i}` })
      );
      
      // Perform multiple operations concurrently
      await Promise.all([
        cache.setAll(assistants.slice(0, 5)),
        cache.set(assistants[5]),
        cache.set(assistants[6]),
        cache.set(assistants[7]),
      ]);
      
      const retrieved = await cache.getAll();
      expect(retrieved.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all assistant properties', async () => {
      const assistant = createTestAssistant({
        title: 'Full Assistant',
        desc: 'Complete description',
        emoji: '🚀',
        prompt: 'Detailed prompt',
        tags: ['tag1', 'tag2', 'tag3'],
        isPublic: true,
        status: 'published' as AssistantStatus,
        author: 'test-author',
        updatedAt: new Date(),
        reviewedAt: new Date(),
        publishedAt: new Date(),
        reviewNote: 'Approved',
      });
      
      await cache.set(assistant);
      const retrieved = await cache.getById(assistant.id);
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.title).toBe(assistant.title);
      expect(retrieved?.desc).toBe(assistant.desc);
      expect(retrieved?.emoji).toBe(assistant.emoji);
      expect(retrieved?.prompt).toBe(assistant.prompt);
      expect(retrieved?.tags).toEqual(assistant.tags);
      expect(retrieved?.isPublic).toBe(assistant.isPublic);
      expect(retrieved?.status).toBe(assistant.status);
      expect(retrieved?.author).toBe(assistant.author);
      expect(retrieved?.reviewNote).toBe(assistant.reviewNote);
    });

    it('should handle assistants without optional fields', async () => {
      const assistant = createTestAssistant({
        tags: undefined,
        updatedAt: undefined,
        reviewedAt: undefined,
        publishedAt: undefined,
        reviewNote: undefined,
      });
      
      await cache.set(assistant);
      const retrieved = await cache.getById(assistant.id);
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.tags).toBeUndefined();
      expect(retrieved?.updatedAt).toBeUndefined();
      expect(retrieved?.reviewedAt).toBeUndefined();
      expect(retrieved?.publishedAt).toBeUndefined();
      expect(retrieved?.reviewNote).toBeUndefined();
    });
  });
});
