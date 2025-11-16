/**
 * User Assistant Service - Data Persistence Tests
 * 
 * Tests for localStorage storage, data recovery, and date serialization
 */

import { UserAssistantService, UserAssistantServiceError } from '@/lib/services/userAssistantService';
import { Assistant, UserAssistant } from '@/types/assistant';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

// Setup global mocks
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true
});

// Only define window if it doesn't exist
if (typeof window === 'undefined') {
  (global as any).window = { localStorage: localStorageMock };
} else {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true
  });
}

describe('UserAssistantService - Data Persistence', () => {
  let service: UserAssistantService;
  let mockAssistant: Assistant;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    
    // Create new service instance
    service = new UserAssistantService();

    // Create mock assistant
    mockAssistant = {
      id: 'test-assistant-1',
      title: 'Test Assistant',
      desc: 'A test assistant for persistence testing',
      emoji: '🤖',
      prompt: 'You are a helpful test assistant',
      tags: ['test', 'automation'],
      category: ['development'],
      isPublic: true,
      status: 'published',
      author: 'test-user',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
      version: 1,
      usageCount: 0,
      rating: 5
    };
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('8.1.1 - Data Saving Verification', () => {
    it('should save assistant data to localStorage after adding', async () => {
      // Add assistant
      await service.addAssistant(mockAssistant);

      // Verify data is in localStorage
      const stored = localStorageMock.getItem('user_assistants');
      expect(stored).not.toBeNull();

      // Parse and verify structure
      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe(mockAssistant.id);
      expect(parsed[0].title).toBe(mockAssistant.title);
    });

    it('should save all assistant properties correctly', async () => {
      await service.addAssistant(mockAssistant);

      const stored = localStorageMock.getItem('user_assistants');
      const parsed = JSON.parse(stored!);
      const savedAssistant = parsed[0];

      // Verify all core properties
      expect(savedAssistant.id).toBe(mockAssistant.id);
      expect(savedAssistant.title).toBe(mockAssistant.title);
      expect(savedAssistant.desc).toBe(mockAssistant.desc);
      expect(savedAssistant.emoji).toBe(mockAssistant.emoji);
      expect(savedAssistant.prompt).toBe(mockAssistant.prompt);
      expect(savedAssistant.tags).toEqual(mockAssistant.tags);
      expect(savedAssistant.category).toEqual(mockAssistant.category);
      expect(savedAssistant.isPublic).toBe(mockAssistant.isPublic);
      expect(savedAssistant.status).toBe(mockAssistant.status);
      expect(savedAssistant.author).toBe(mockAssistant.author);
    });

    it('should save user-specific metadata', async () => {
      await service.addAssistant(mockAssistant);

      const stored = localStorageMock.getItem('user_assistants');
      const parsed = JSON.parse(stored!);
      const savedAssistant = parsed[0];

      // Verify user-specific fields
      expect(savedAssistant.addedAt).toBeDefined();
      expect(savedAssistant.usageCount).toBe(0);
      expect(savedAssistant.isFavorite).toBe(false);
    });

    it('should save multiple assistants correctly', async () => {
      const assistant2: Assistant = {
        ...mockAssistant,
        id: 'test-assistant-2',
        title: 'Second Assistant'
      };

      await service.addAssistant(mockAssistant);
      await service.addAssistant(assistant2);

      const stored = localStorageMock.getItem('user_assistants');
      const parsed = JSON.parse(stored!);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe(assistant2.id); // Most recent first
      expect(parsed[1].id).toBe(mockAssistant.id);
    });
  });

  describe('8.1.2 - Data Recovery After Page Refresh', () => {
    it('should recover assistant data after simulated page refresh', async () => {
      // Add assistant
      await service.addAssistant(mockAssistant);

      // Simulate page refresh by creating new service instance
      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();

      expect(recovered).toHaveLength(1);
      expect(recovered[0].id).toBe(mockAssistant.id);
      expect(recovered[0].title).toBe(mockAssistant.title);
    });

    it('should maintain data integrity across multiple refresh cycles', async () => {
      // Add multiple assistants
      await service.addAssistant(mockAssistant);
      
      const assistant2: Assistant = {
        ...mockAssistant,
        id: 'test-assistant-2',
        title: 'Second Assistant'
      };
      await service.addAssistant(assistant2);

      // First refresh
      let newService = new UserAssistantService();
      let recovered = newService.getUserAssistants();
      expect(recovered).toHaveLength(2);

      // Second refresh
      newService = new UserAssistantService();
      recovered = newService.getUserAssistants();
      expect(recovered).toHaveLength(2);
      expect(recovered[0].id).toBe(assistant2.id);
      expect(recovered[1].id).toBe(mockAssistant.id);
    });

    it('should recover empty list correctly', () => {
      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();

      expect(recovered).toEqual([]);
    });

    it('should handle corrupted data gracefully', () => {
      // Manually set corrupted data
      localStorageMock.setItem('user_assistants', 'invalid json {{{');

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();

      // Should return empty array instead of crashing
      expect(recovered).toEqual([]);
    });
  });

  describe('8.1.3 - Date Field Serialization and Deserialization', () => {
    it('should serialize Date objects to ISO strings', async () => {
      await service.addAssistant(mockAssistant);

      const stored = localStorageMock.getItem('user_assistants');
      const parsed = JSON.parse(stored!);
      const savedAssistant = parsed[0];

      // Dates should be stored as strings
      expect(typeof savedAssistant.addedAt).toBe('string');
      expect(typeof savedAssistant.createdAt).toBe('string');
      expect(typeof savedAssistant.updatedAt).toBe('string');
    });

    it('should deserialize ISO strings back to Date objects', async () => {
      await service.addAssistant(mockAssistant);

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();
      const assistant = recovered[0];

      // Dates should be Date objects
      expect(assistant.addedAt).toBeInstanceOf(Date);
      expect(assistant.createdAt).toBeInstanceOf(Date);
      expect(assistant.updatedAt).toBeInstanceOf(Date);
    });

    it('should preserve date values accurately', async () => {
      const testDate = new Date('2024-03-15T10:30:00Z');
      const assistantWithDate: Assistant = {
        ...mockAssistant,
        createdAt: testDate
      };

      await service.addAssistant(assistantWithDate);

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();
      const assistant = recovered[0];

      expect(assistant.createdAt.getTime()).toBe(testDate.getTime());
    });

    it('should handle optional date fields correctly', async () => {
      const assistantWithOptionalDates: Assistant = {
        ...mockAssistant,
        updatedAt: undefined,
        reviewedAt: undefined,
        publishedAt: undefined
      };

      await service.addAssistant(assistantWithOptionalDates);

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();
      const assistant = recovered[0];

      expect(assistant.updatedAt).toBeUndefined();
      expect(assistant.reviewedAt).toBeUndefined();
      expect(assistant.publishedAt).toBeUndefined();
    });

    it('should handle lastUsedAt date field', async () => {
      await service.addAssistant(mockAssistant);
      await service.updateLastUsed(mockAssistant.id);

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();
      const assistant = recovered[0];

      expect(assistant.lastUsedAt).toBeInstanceOf(Date);
      expect(assistant.lastUsedAt!.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should handle all date fields in complex scenarios', async () => {
      const complexAssistant: Assistant = {
        ...mockAssistant,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        reviewedAt: new Date('2024-01-03T00:00:00Z'),
        publishedAt: new Date('2024-01-04T00:00:00Z')
      };

      await service.addAssistant(complexAssistant);

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();
      const assistant = recovered[0];

      // All dates should be properly deserialized
      expect(assistant.createdAt).toBeInstanceOf(Date);
      expect(assistant.updatedAt).toBeInstanceOf(Date);
      expect(assistant.reviewedAt).toBeInstanceOf(Date);
      expect(assistant.publishedAt).toBeInstanceOf(Date);
      expect(assistant.addedAt).toBeInstanceOf(Date);

      // Values should be preserved
      expect(assistant.createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
      expect(assistant.updatedAt!.toISOString()).toBe('2024-01-02T00:00:00.000Z');
      expect(assistant.reviewedAt!.toISOString()).toBe('2024-01-03T00:00:00.000Z');
      expect(assistant.publishedAt!.toISOString()).toBe('2024-01-04T00:00:00.000Z');
    });
  });

  describe('8.1.4 - Data Consistency Tests', () => {
    it('should maintain data order after recovery', async () => {
      const assistants: Assistant[] = [
        { ...mockAssistant, id: 'assistant-1', title: 'First' },
        { ...mockAssistant, id: 'assistant-2', title: 'Second' },
        { ...mockAssistant, id: 'assistant-3', title: 'Third' }
      ];

      for (const assistant of assistants) {
        await service.addAssistant(assistant);
      }

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();

      // Should be in reverse order (most recent first)
      expect(recovered[0].id).toBe('assistant-3');
      expect(recovered[1].id).toBe('assistant-2');
      expect(recovered[2].id).toBe('assistant-1');
    });

    it('should preserve usage count across refreshes', async () => {
      await service.addAssistant(mockAssistant);
      await service.updateLastUsed(mockAssistant.id);
      await service.updateLastUsed(mockAssistant.id);
      await service.updateLastUsed(mockAssistant.id);

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();

      expect(recovered[0].usageCount).toBe(3);
    });

    it('should preserve favorite status across refreshes', async () => {
      await service.addAssistant(mockAssistant);
      await service.toggleFavorite(mockAssistant.id);

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();

      expect(recovered[0].isFavorite).toBe(true);
    });

    it('should preserve custom name across refreshes', async () => {
      const customName = 'My Custom Assistant Name';
      await service.addAssistant(mockAssistant);
      await service.updateCustomName(mockAssistant.id, customName);

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();

      expect(recovered[0].customName).toBe(customName);
    });
  });

  describe('8.1.5 - Edge Cases', () => {
    it('should handle very long strings in assistant data', async () => {
      const longString = 'A'.repeat(10000);
      const assistantWithLongData: Assistant = {
        ...mockAssistant,
        desc: longString,
        prompt: longString
      };

      await service.addAssistant(assistantWithLongData);

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();

      expect(recovered[0].desc).toBe(longString);
      expect(recovered[0].prompt).toBe(longString);
    });

    it('should handle special characters in assistant data', async () => {
      const specialChars = '特殊字符 🎉 <script>alert("test")</script> \n\t\r';
      const assistantWithSpecialChars: Assistant = {
        ...mockAssistant,
        title: specialChars,
        desc: specialChars
      };

      await service.addAssistant(assistantWithSpecialChars);

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();

      expect(recovered[0].title).toBe(specialChars);
      expect(recovered[0].desc).toBe(specialChars);
    });

    it('should handle empty arrays in assistant data', async () => {
      const assistantWithEmptyArrays: Assistant = {
        ...mockAssistant,
        tags: [],
        category: []
      };

      await service.addAssistant(assistantWithEmptyArrays);

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();

      expect(recovered[0].tags).toEqual([]);
      expect(recovered[0].category).toEqual([]);
    });

    it('should handle undefined optional fields', async () => {
      const assistantWithUndefined: Assistant = {
        ...mockAssistant,
        tags: undefined,
        category: undefined,
        updatedAt: undefined,
        reviewedAt: undefined,
        publishedAt: undefined,
        reviewNote: undefined,
        usageCount: undefined,
        rating: undefined
      };

      await service.addAssistant(assistantWithUndefined);

      const newService = new UserAssistantService();
      const recovered = newService.getUserAssistants();

      expect(recovered[0].tags).toBeUndefined();
      expect(recovered[0].category).toBeUndefined();
    });
  });
});
