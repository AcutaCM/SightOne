/**
 * Assistant API Client Unit Tests
 * 
 * Tests for all API methods, cache integration, error handling,
 * and background synchronization functionality.
 */

import { AssistantApiClient } from '@/lib/api/assistantApiClient';
import { indexedDBCache } from '@/lib/cache/indexedDBCache';
import { Assistant, AssistantStatus, CreateAssistantRequest, UpdateAssistantRequest } from '@/types/assistant';

// Mock IndexedDB for Node.js testing environment
import 'fake-indexeddb/auto';

// Mock fetch globally
global.fetch = jest.fn();

describe('AssistantApiClient', () => {
  let client: AssistantApiClient;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  // Helper function to create a test assistant
  const createTestAssistant = (overrides?: Partial<Assistant>): Assistant => ({
    id: `test-${Date.now()}-${Math.random()}`,
    title: 'Test Assistant',
    desc: 'A test assistant',
    emoji: '🤖',
    prompt: 'You are a helpful assistant',
    tags: ['test'],
    isPublic: false,
    status: 'draft' as AssistantStatus,
    author: 'test-user',
    createdAt: new Date(),
    version: 1,
    ...overrides,
  });

  // Helper to create mock response
  const createMockResponse = (data: any, ok = true, status = 200) => ({
    ok,
    status,
    json: async () => data,
  } as Response);

  beforeEach(async () => {
    // Create new client instance
    client = new AssistantApiClient();
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();

    // Initialize and clear cache
    await indexedDBCache.init();
    await indexedDBCache.clear();
  });

  afterEach(async () => {
    // Clear cache
    await indexedDBCache.clear();
    indexedDBCache.close();
  });

  describe('getAll()', () => {
    it('should fetch assistants from server when cache is empty', async () => {
      const assistants = [
        createTestAssistant({ title: 'Assistant 1' }),
        createTestAssistant({ title: 'Assistant 2' }),
      ];

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: {
            data: assistants,
            total: 2,
            page: 1,
            pageSize: 20,
          },
        })
      );

      const result = await client.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Assistant 1');
      expect(result[1].title).toBe('Assistant 2');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should return cached data and sync in background', async () => {
      const cachedAssistants = [
        createTestAssistant({ title: 'Cached 1' }),
        createTestAssistant({ title: 'Cached 2' }),
      ];

      // Populate cache
      await indexedDBCache.setAll(cachedAssistants);

      const serverAssistants = [
        createTestAssistant({ title: 'Server 1' }),
        createTestAssistant({ title: 'Server 2' }),
      ];

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: {
            data: serverAssistants,
            total: 2,
            page: 1,
            pageSize: 20,
          },
        })
      );

      const result = await client.getAll();

      // Should return cached data immediately (order may vary due to IndexedDB)
      expect(result).toHaveLength(2);
      const titles = result.map(a => a.title);
      expect(titles).toContain('Cached 1');
      expect(titles).toContain('Cached 2');

      // Wait for background sync
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify background sync was triggered
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should bypass cache when useCache is false', async () => {
      const cachedAssistants = [createTestAssistant({ title: 'Cached' })];
      await indexedDBCache.setAll(cachedAssistants);

      const serverAssistants = [createTestAssistant({ title: 'Server' })];

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: {
            data: serverAssistants,
            total: 1,
            page: 1,
            pageSize: 20,
          },
        })
      );

      const result = await client.getAll({ useCache: false });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Server');
    });

    it('should include query parameters in request', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: {
            data: [],
            total: 0,
            page: 2,
            pageSize: 10,
          },
        })
      );

      await client.getAll({
        useCache: false,
        page: 2,
        pageSize: 10,
        status: 'published',
        author: 'test-user',
        search: 'test',
      });

      const callUrl = (mockFetch.mock.calls[0][0] as string);
      expect(callUrl).toContain('page=2');
      expect(callUrl).toContain('pageSize=10');
      expect(callUrl).toContain('status=published');
      expect(callUrl).toContain('author=test-user');
      expect(callUrl).toContain('search=test');
    });

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
          },
        })
      );

      await expect(client.getAll({ useCache: false })).rejects.toThrow('Internal server error');
    });

    it('should update cache after successful fetch', async () => {
      const assistants = [createTestAssistant({ title: 'New Assistant' })];

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: {
            data: assistants,
            total: 1,
            page: 1,
            pageSize: 20,
          },
        })
      );

      await client.getAll({ useCache: false });

      // Wait longer for cache update to complete
      await new Promise(resolve => setTimeout(resolve, 150));

      const cached = await indexedDBCache.getAll();
      expect(cached).toHaveLength(1);
      expect(cached[0].title).toBe('New Assistant');
    });
  });

  describe('getById()', () => {
    it('should return cached assistant when available', async () => {
      const assistant = createTestAssistant({ title: 'Cached Assistant' });
      await indexedDBCache.set(assistant);

      const result = await client.getById(assistant.id);

      expect(result.title).toBe('Cached Assistant');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch from server when not in cache', async () => {
      const assistant = createTestAssistant({ title: 'Server Assistant' });

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: assistant,
        })
      );

      const result = await client.getById(assistant.id);

      expect(result.title).toBe('Server Assistant');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should bypass cache when useCache is false', async () => {
      const cachedAssistant = createTestAssistant({ title: 'Cached' });
      await indexedDBCache.set(cachedAssistant);

      const serverAssistant = { ...cachedAssistant, title: 'Server' };

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: serverAssistant,
        })
      );

      const result = await client.getById(cachedAssistant.id, false);

      expect(result.title).toBe('Server');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error when assistant not found', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assistant not found',
          },
        })
      );

      await expect(client.getById('non-existent', false)).rejects.toThrow('Assistant not found');
    });

    it('should update cache after successful fetch', async () => {
      const assistant = createTestAssistant({ title: 'New Assistant' });

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: assistant,
        })
      );

      await client.getById(assistant.id, false);

      // Wait longer for cache update to complete
      await new Promise(resolve => setTimeout(resolve, 150));

      const cached = await indexedDBCache.getById(assistant.id);
      expect(cached).not.toBeNull();
      expect(cached?.title).toBe('New Assistant');
    });
  });

  describe('create()', () => {
    it('should create new assistant successfully', async () => {
      const createData: CreateAssistantRequest = {
        title: 'New Assistant',
        desc: 'Description',
        emoji: '🚀',
        prompt: 'Prompt',
        tags: ['new'],
        isPublic: true,
      };

      const createdAssistant = createTestAssistant(createData);

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: createdAssistant,
        })
      );

      const result = await client.create(createData);

      expect(result.title).toBe('New Assistant');
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/assistants',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createData),
        })
      );
    });

    it('should update cache after creation', async () => {
      const createData: CreateAssistantRequest = {
        title: 'New Assistant',
        desc: 'Description',
        emoji: '🚀',
        prompt: 'Prompt',
        isPublic: false,
      };

      const createdAssistant = createTestAssistant(createData);

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: createdAssistant,
        })
      );

      await client.create(createData);

      // Wait for cache update
      await new Promise(resolve => setTimeout(resolve, 50));

      const cached = await indexedDBCache.getById(createdAssistant.id);
      expect(cached).not.toBeNull();
      expect(cached?.title).toBe('New Assistant');
    });

    it('should handle creation error', async () => {
      const createData: CreateAssistantRequest = {
        title: '',
        desc: 'Description',
        emoji: '🚀',
        prompt: 'Prompt',
        isPublic: false,
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Title is required',
          },
        })
      );

      await expect(client.create(createData)).rejects.toThrow('Title is required');
    });
  });

  describe('update()', () => {
    it('should update assistant successfully', async () => {
      const assistant = createTestAssistant({ title: 'Original' });
      const updateData: UpdateAssistantRequest = {
        title: 'Updated',
        version: 1,
      };

      const updatedAssistant = { ...assistant, ...updateData, version: 2 };

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: updatedAssistant,
        })
      );

      const result = await client.update(assistant.id, updateData);

      expect(result.title).toBe('Updated');
      expect(result.version).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/assistants/${assistant.id}`,
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })
      );
    });

    it('should handle version conflict error', async () => {
      const assistant = createTestAssistant();
      const updateData: UpdateAssistantRequest = {
        title: 'Updated',
        version: 1,
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: false,
          error: {
            code: 'VERSION_CONFLICT',
            message: 'Version mismatch',
          },
        })
      );

      await expect(client.update(assistant.id, updateData)).rejects.toThrow(
        'Version conflict: data has been modified by another user'
      );
    });

    it('should update cache after successful update', async () => {
      const assistant = createTestAssistant({ title: 'Original' });
      await indexedDBCache.set(assistant);

      const updateData: UpdateAssistantRequest = {
        title: 'Updated',
        version: 1,
      };

      const updatedAssistant = { ...assistant, ...updateData, version: 2 };

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: updatedAssistant,
        })
      );

      await client.update(assistant.id, updateData);

      // Wait for cache update
      await new Promise(resolve => setTimeout(resolve, 50));

      const cached = await indexedDBCache.getById(assistant.id);
      expect(cached?.title).toBe('Updated');
      expect(cached?.version).toBe(2);
    });
  });

  describe('delete()', () => {
    it('should delete assistant successfully', async () => {
      const assistant = createTestAssistant();

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: { id: assistant.id },
        })
      );

      await client.delete(assistant.id);

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/assistants/${assistant.id}`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should remove from cache after deletion', async () => {
      const assistant = createTestAssistant();
      await indexedDBCache.set(assistant);

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: { id: assistant.id },
        })
      );

      await client.delete(assistant.id);

      // Wait for cache update
      await new Promise(resolve => setTimeout(resolve, 50));

      const cached = await indexedDBCache.getById(assistant.id);
      expect(cached).toBeNull();
    });

    it('should handle deletion error', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assistant not found',
          },
        })
      );

      await expect(client.delete('non-existent')).rejects.toThrow('Assistant not found');
    });
  });

  describe('updateStatus()', () => {
    it('should update status successfully', async () => {
      const assistant = createTestAssistant({ status: 'pending' });
      const statusData = {
        status: 'published' as AssistantStatus,
        reviewNote: 'Approved',
        version: 1,
      };

      const updatedAssistant = {
        ...assistant,
        status: 'published' as AssistantStatus,
        reviewNote: 'Approved',
        version: 2,
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: updatedAssistant,
        })
      );

      const result = await client.updateStatus(assistant.id, statusData);

      expect(result.status).toBe('published');
      expect(result.reviewNote).toBe('Approved');
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/assistants/${assistant.id}/status`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statusData),
        })
      );
    });

    it('should handle version conflict in status update', async () => {
      const assistant = createTestAssistant();
      const statusData = {
        status: 'published' as AssistantStatus,
        version: 1,
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: false,
          error: {
            code: 'VERSION_CONFLICT',
            message: 'Version mismatch',
          },
        })
      );

      await expect(client.updateStatus(assistant.id, statusData)).rejects.toThrow(
        'Version conflict: data has been modified by another user'
      );
    });

    it('should update cache after status change', async () => {
      const assistant = createTestAssistant({ status: 'pending' });
      await indexedDBCache.set(assistant);

      const statusData = {
        status: 'published' as AssistantStatus,
        version: 1,
      };

      const updatedAssistant = {
        ...assistant,
        status: 'published' as AssistantStatus,
        version: 2,
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: updatedAssistant,
        })
      );

      await client.updateStatus(assistant.id, statusData);

      // Wait for cache update
      await new Promise(resolve => setTimeout(resolve, 50));

      const cached = await indexedDBCache.getById(assistant.id);
      expect(cached?.status).toBe('published');
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network error', async () => {
      const assistant = createTestAssistant();

      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockResolvedValueOnce(
          createMockResponse({
            success: true,
            data: assistant,
          })
        );

      const result = await client.getById(assistant.id, false);

      expect(result.id).toBe(assistant.id);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    }, 10000); // Increase timeout for retries

    it('should fail after max retries', async () => {
      mockFetch.mockRejectedValue(new TypeError('Network error'));

      await expect(client.getById('test-id', false)).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    }, 10000); // Increase timeout for retries

    it('should retry on timeout', async () => {
      const assistant = createTestAssistant();

      // First call times out, second succeeds
      mockFetch
        .mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'))
        .mockResolvedValueOnce(
          createMockResponse({
            success: true,
            data: assistant,
          })
        );

      const result = await client.getById(assistant.id, false);

      expect(result.id).toBe(assistant.id);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }, 10000); // Increase timeout for retries
  });

  describe('Cache Management', () => {
    it('should clean expired cache entries', async () => {
      const cleaned = await client.cleanExpiredCache();
      expect(typeof cleaned).toBe('number');
      expect(cleaned).toBeGreaterThanOrEqual(0);
    });

    it('should clear all cache', async () => {
      const assistants = [
        createTestAssistant(),
        createTestAssistant(),
      ];
      await indexedDBCache.setAll(assistants);

      await client.clearCache();

      const cached = await indexedDBCache.getAll();
      expect(cached).toHaveLength(0);
    });
  });

  describe('Background Sync', () => {
    it('should not trigger multiple simultaneous syncs', async () => {
      const assistants = [createTestAssistant()];

      // Populate cache
      await indexedDBCache.setAll(assistants);

      mockFetch.mockResolvedValue(
        createMockResponse({
          success: true,
          data: {
            data: assistants,
            total: 1,
            page: 1,
            pageSize: 20,
          },
        })
      );

      // Trigger multiple getAll calls quickly
      await Promise.all([
        client.getAll(),
        client.getAll(),
        client.getAll(),
      ]);

      // Wait for background syncs
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should have limited number of fetch calls due to sync prevention
      expect(mockFetch.mock.calls.length).toBeLessThan(6);
    });
  });

  describe('Error Handling', () => {
    it('should handle cache errors gracefully and fetch from server', async () => {
      // Mock cache to throw error
      const cacheGetAllSpy = jest.spyOn(indexedDBCache, 'getAll').mockRejectedValueOnce(new Error('Cache error'));

      const assistants = [createTestAssistant()];

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: {
            data: assistants,
            total: 1,
            page: 1,
            pageSize: 20,
          },
        })
      );

      // Should fall back to server fetch when cache fails
      const result = await client.getAll();

      expect(cacheGetAllSpy).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      
      cacheGetAllSpy.mockRestore();
    });

    it('should not throw when cache update fails', async () => {
      // Mock cache to throw error on set
      const cacheSetSpy = jest.spyOn(indexedDBCache, 'set').mockRejectedValueOnce(new Error('Cache write error'));

      const assistant = createTestAssistant();

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          success: true,
          data: assistant,
        })
      );

      // Should still return result even if cache update fails
      await expect(client.getById(assistant.id, false)).resolves.toBeDefined();
      
      cacheSetSpy.mockRestore();
    });
  });
});

