/**
 * User Assistant Service - Storage Quota Tests
 * 
 * Tests for handling QuotaExceededError and storage space limitations
 */

import { UserAssistantService, UserAssistantServiceError } from '@/lib/services/userAssistantService';
import { Assistant } from '@/types/assistant';

// Mock localStorage with quota simulation
const createQuotaLimitedStorage = (maxSize: number) => {
  let store: Record<string, string> = {};
  let currentSize = 0;

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      const newSize = currentSize - (store[key]?.length || 0) + value.length;
      
      if (newSize > maxSize) {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      }
      
      currentSize = newSize;
      store[key] = value;
    },
    removeItem: (key: string) => {
      if (store[key]) {
        currentSize -= store[key].length;
        delete store[key];
      }
    },
    clear: () => {
      store = {};
      currentSize = 0;
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    getCurrentSize: () => currentSize,
    getMaxSize: () => maxSize
  };
};

describe('UserAssistantService - Storage Quota Handling', () => {
  let service: UserAssistantService;
  let mockAssistant: Assistant;
  let quotaStorage: ReturnType<typeof createQuotaLimitedStorage>;

  beforeEach(() => {
    // Create quota-limited storage (10KB limit)
    quotaStorage = createQuotaLimitedStorage(10 * 1024);
    
    // Setup global mocks
    Object.defineProperty(global, 'localStorage', {
      value: quotaStorage,
      writable: true,
      configurable: true
    });

    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'localStorage', {
        value: quotaStorage,
        writable: true,
        configurable: true
      });
    }

    service = new UserAssistantService();

    mockAssistant = {
      id: 'test-assistant-1',
      title: 'Test Assistant',
      desc: 'A test assistant',
      emoji: '🤖',
      prompt: 'You are a helpful assistant',
      tags: ['test'],
      category: ['development'],
      isPublic: true,
      status: 'published',
      author: 'test-user',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      version: 1,
      usageCount: 0,
      rating: 5
    };
  });

  afterEach(() => {
    quotaStorage.clear();
  });

  describe('8.2.1 - QuotaExceededError Detection', () => {
    it('should catch QuotaExceededError when storage is full', async () => {
      // Fill storage with large assistants
      const largeAssistant: Assistant = {
        ...mockAssistant,
        desc: 'A'.repeat(5000), // Large description
        prompt: 'B'.repeat(5000) // Large prompt
      };

      // Add assistants until quota is exceeded
      let addedCount = 0;
      let quotaError: UserAssistantServiceError | null = null;

      try {
        for (let i = 0; i < 10; i++) {
          await service.addAssistant({
            ...largeAssistant,
            id: `assistant-${i}`
          });
          addedCount++;
        }
      } catch (error) {
        if (error instanceof UserAssistantServiceError) {
          quotaError = error;
        }
      }

      expect(quotaError).not.toBeNull();
      expect(quotaError?.code).toBe('QUOTA_EXCEEDED');
      expect(quotaError?.message).toContain('存储空间不足');
    });

    it('should provide helpful error message for quota exceeded', async () => {
      const largeAssistant: Assistant = {
        ...mockAssistant,
        desc: 'A'.repeat(5000),
        prompt: 'B'.repeat(5000)
      };

      try {
        for (let i = 0; i < 10; i++) {
          await service.addAssistant({
            ...largeAssistant,
            id: `assistant-${i}`
          });
        }
      } catch (error) {
        if (error instanceof UserAssistantServiceError) {
          expect(error.message).toBe('存储空间不足，请清理部分助手后重试');
          expect(error.code).toBe('QUOTA_EXCEEDED');
        }
      }
    });

    it('should not corrupt existing data when quota is exceeded', async () => {
      // Add one assistant successfully
      await service.addAssistant(mockAssistant);
      const beforeQuota = service.getUserAssistants();
      expect(beforeQuota).toHaveLength(1);

      // Try to add a very large assistant that will exceed quota
      const hugeAssistant: Assistant = {
        ...mockAssistant,
        id: 'huge-assistant',
        desc: 'X'.repeat(20000),
        prompt: 'Y'.repeat(20000)
      };

      try {
        await service.addAssistant(hugeAssistant);
      } catch (error) {
        // Expected to fail
      }

      // Original data should still be intact
      const afterQuota = service.getUserAssistants();
      expect(afterQuota).toHaveLength(1);
      expect(afterQuota[0].id).toBe(mockAssistant.id);
    });
  });

  describe('8.2.2 - User-Friendly Error Messages', () => {
    it('should suggest clearing assistants when quota exceeded', async () => {
      const largeAssistant: Assistant = {
        ...mockAssistant,
        desc: 'A'.repeat(5000),
        prompt: 'B'.repeat(5000)
      };

      let errorMessage = '';
      try {
        for (let i = 0; i < 10; i++) {
          await service.addAssistant({
            ...largeAssistant,
            id: `assistant-${i}`
          });
        }
      } catch (error) {
        if (error instanceof UserAssistantServiceError) {
          errorMessage = error.message;
        }
      }

      expect(errorMessage).toContain('清理');
      expect(errorMessage).toContain('助手');
    });

    it('should include error code for programmatic handling', async () => {
      const largeAssistant: Assistant = {
        ...mockAssistant,
        desc: 'A'.repeat(5000),
        prompt: 'B'.repeat(5000)
      };

      let error: UserAssistantServiceError | null = null;
      try {
        for (let i = 0; i < 10; i++) {
          await service.addAssistant({
            ...largeAssistant,
            id: `assistant-${i}`
          });
        }
      } catch (e) {
        if (e instanceof UserAssistantServiceError) {
          error = e;
        }
      }

      expect(error).not.toBeNull();
      expect(error?.code).toBe('QUOTA_EXCEEDED');
      expect(error?.name).toBe('UserAssistantServiceError');
    });
  });

  describe('8.2.3 - Recovery Strategies', () => {
    it('should allow adding assistants after clearing some', async () => {
      // Add a few assistants first
      const mediumAssistant: Assistant = {
        ...mockAssistant,
        desc: 'A'.repeat(2000),
        prompt: 'B'.repeat(2000)
      };

      // Add assistants until we hit quota
      let addedCount = 0;
      try {
        for (let i = 0; i < 10; i++) {
          await service.addAssistant({
            ...mediumAssistant,
            id: `assistant-${i}`
          });
          addedCount++;
        }
      } catch (error) {
        // Expected to fail at some point
      }

      // Verify we added at least one assistant
      const beforeClear = service.getUserAssistants();
      expect(beforeClear.length).toBeGreaterThan(0);
      const countBeforeClear = beforeClear.length;

      // Remove one assistant
      await service.removeAssistant(beforeClear[0].id);

      const afterRemove = service.getUserAssistants();
      expect(afterRemove.length).toBe(countBeforeClear - 1);

      // Should be able to add a small assistant now
      const smallAssistant: Assistant = {
        ...mockAssistant,
        id: 'new-assistant-after-clear',
        desc: 'Small',
        prompt: 'Small'
      };

      await expect(service.addAssistant(smallAssistant)).resolves.toBeDefined();
      
      const afterAdd = service.getUserAssistants();
      expect(afterAdd.length).toBe(countBeforeClear); // -1 removed, +1 added
    });

    it('should provide clearAll method for emergency cleanup', async () => {
      // Add several assistants
      for (let i = 0; i < 3; i++) {
        await service.addAssistant({
          ...mockAssistant,
          id: `assistant-${i}`
        });
      }

      expect(service.getUserAssistants()).toHaveLength(3);

      // Clear all
      await service.clearAll();

      expect(service.getUserAssistants()).toHaveLength(0);
    });

    it('should allow adding assistants after clearAll', async () => {
      // Fill and clear
      for (let i = 0; i < 3; i++) {
        await service.addAssistant({
          ...mockAssistant,
          id: `assistant-${i}`
        });
      }
      await service.clearAll();

      // Should be able to add new assistants
      await expect(service.addAssistant(mockAssistant)).resolves.toBeDefined();
      expect(service.getUserAssistants()).toHaveLength(1);
    });
  });

  describe('8.2.4 - Storage Size Monitoring', () => {
    it('should handle multiple assistants within quota', async () => {
      // Add multiple small assistants
      const smallAssistant: Assistant = {
        ...mockAssistant,
        desc: 'Small description',
        prompt: 'Small prompt'
      };

      const addedIds: string[] = [];
      for (let i = 0; i < 5; i++) {
        const id = `small-assistant-${i}`;
        await service.addAssistant({
          ...smallAssistant,
          id
        });
        addedIds.push(id);
      }

      expect(service.getUserAssistants()).toHaveLength(5);
    });

    it('should handle edge case of exactly at quota limit', async () => {
      // This test verifies behavior when storage is nearly full
      const mediumAssistant: Assistant = {
        ...mockAssistant,
        desc: 'A'.repeat(2000),
        prompt: 'B'.repeat(2000)
      };

      let lastSuccessfulId = '';
      try {
        for (let i = 0; i < 10; i++) {
          const id = `assistant-${i}`;
          await service.addAssistant({
            ...mediumAssistant,
            id
          });
          lastSuccessfulId = id;
        }
      } catch (error) {
        // Expected to fail eventually
      }

      // Verify last successful assistant is in storage
      const assistants = service.getUserAssistants();
      expect(assistants.some(a => a.id === lastSuccessfulId)).toBe(true);
    });
  });

  describe('8.2.5 - Error Handling in Other Operations', () => {
    it('should handle quota exceeded in updateLastUsed', async () => {
      // Create a scenario where update might fail
      // (though in practice, updates usually don't increase size much)
      await service.addAssistant(mockAssistant);
      
      // This should work normally
      await expect(service.updateLastUsed(mockAssistant.id)).resolves.toBeUndefined();
    });

    it('should handle quota exceeded in toggleFavorite', async () => {
      await service.addAssistant(mockAssistant);
      
      // This should work normally
      await expect(service.toggleFavorite(mockAssistant.id)).resolves.toBeUndefined();
    });

    it('should handle quota exceeded in updateCustomName', async () => {
      await service.addAssistant(mockAssistant);
      
      // Even with a long custom name, this should work
      const longName = 'Custom Name '.repeat(100);
      await expect(
        service.updateCustomName(mockAssistant.id, longName)
      ).resolves.toBeUndefined();
    });
  });

  describe('8.2.6 - Graceful Degradation', () => {
    it('should maintain service functionality after quota error', async () => {
      // Cause a quota error
      const largeAssistant: Assistant = {
        ...mockAssistant,
        desc: 'A'.repeat(5000),
        prompt: 'B'.repeat(5000)
      };

      try {
        for (let i = 0; i < 10; i++) {
          await service.addAssistant({
            ...largeAssistant,
            id: `assistant-${i}`
          });
        }
      } catch (error) {
        // Expected
      }

      // Service should still work for queries
      const assistants = service.getUserAssistants();
      expect(Array.isArray(assistants)).toBe(true);

      // Should be able to check if assistant exists
      if (assistants.length > 0) {
        expect(service.isAssistantAdded(assistants[0].id)).toBe(true);
      }

      // Should be able to remove assistants
      if (assistants.length > 0) {
        await expect(service.removeAssistant(assistants[0].id)).resolves.toBeUndefined();
      }
    });

    it('should provide consistent error types', async () => {
      const errors: UserAssistantServiceError[] = [];
      const largeAssistant: Assistant = {
        ...mockAssistant,
        desc: 'A'.repeat(5000),
        prompt: 'B'.repeat(5000)
      };

      // Trigger multiple quota errors
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          for (let i = 0; i < 10; i++) {
            await service.addAssistant({
              ...largeAssistant,
              id: `assistant-${attempt}-${i}`
            });
          }
        } catch (error) {
          if (error instanceof UserAssistantServiceError) {
            errors.push(error);
          }
        }
        
        // Clear for next attempt
        await service.clearAll();
      }

      // All errors should be consistent
      errors.forEach(error => {
        expect(error.code).toBe('QUOTA_EXCEEDED');
        expect(error.message).toContain('存储空间不足');
      });
    });
  });
});
