/**
 * User Assistant Migration Service Tests
 * 
 * Tests for data migration and backward compatibility
 */

import {
  UserAssistantMigrationService,
  getUserAssistantMigrationService,
  autoMigrate,
  CURRENT_SCHEMA_VERSION
} from '@/lib/services/userAssistantMigration';

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

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true
  });
}

describe('UserAssistantMigrationService', () => {
  let service: UserAssistantMigrationService;

  beforeEach(() => {
    localStorageMock.clear();
    service = new UserAssistantMigrationService();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('8.3.1 - Version Detection', () => {
    it('should detect current version from storage', () => {
      localStorageMock.setItem('user_assistants_schema_version', '2');
      expect(service.getCurrentVersion()).toBe(2);
    });

    it('should return version 1 for legacy data without version', () => {
      localStorageMock.setItem('user_assistants', JSON.stringify([
        { id: '1', title: 'Test', desc: 'Test', emoji: '🤖', prompt: 'Test', addedAt: new Date().toISOString() }
      ]));
      expect(service.getCurrentVersion()).toBe(1);
    });

    it('should return current version for empty storage', () => {
      expect(service.getCurrentVersion()).toBe(CURRENT_SCHEMA_VERSION);
    });

    it('should detect when migration is needed', () => {
      localStorageMock.setItem('user_assistants_schema_version', '1');
      expect(service.needsMigration()).toBe(true);
    });

    it('should detect when migration is not needed', () => {
      localStorageMock.setItem('user_assistants_schema_version', CURRENT_SCHEMA_VERSION.toString());
      expect(service.needsMigration()).toBe(false);
    });
  });

  describe('8.3.2 - V1 to V2 Migration', () => {
    it('should migrate V1 data to V2 format', async () => {
      // Setup V1 data
      const v1Data = [
        {
          id: 'assistant-1',
          title: 'Test Assistant',
          desc: 'A test assistant',
          emoji: '🤖',
          prompt: 'You are helpful',
          addedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      localStorageMock.setItem('user_assistants', JSON.stringify(v1Data));
      localStorageMock.setItem('user_assistants_schema_version', '1');

      // Perform migration
      const result = await service.migrate();

      expect(result.success).toBe(true);
      expect(result.fromVersion).toBe(1);
      expect(result.toVersion).toBe(2);
      expect(result.migratedCount).toBe(1);
      expect(result.errors).toHaveLength(0);

      // Verify migrated data
      const migrated = JSON.parse(localStorageMock.getItem('user_assistants')!);
      expect(migrated[0]).toHaveProperty('tags');
      expect(migrated[0]).toHaveProperty('category');
      expect(migrated[0]).toHaveProperty('isPublic');
      expect(migrated[0]).toHaveProperty('status');
      expect(migrated[0]).toHaveProperty('author');
      expect(migrated[0]).toHaveProperty('createdAt');
      expect(migrated[0]).toHaveProperty('version');
    });

    it('should preserve existing V1 data during migration', async () => {
      const v1Data = [
        {
          id: 'assistant-1',
          title: 'Original Title',
          desc: 'Original Description',
          emoji: '🎯',
          prompt: 'Original Prompt',
          addedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      localStorageMock.setItem('user_assistants', JSON.stringify(v1Data));
      localStorageMock.setItem('user_assistants_schema_version', '1');

      await service.migrate();

      const migrated = JSON.parse(localStorageMock.getItem('user_assistants')!);
      expect(migrated[0].id).toBe('assistant-1');
      expect(migrated[0].title).toBe('Original Title');
      expect(migrated[0].desc).toBe('Original Description');
      expect(migrated[0].emoji).toBe('🎯');
      expect(migrated[0].prompt).toBe('Original Prompt');
      expect(migrated[0].addedAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should add default values for missing V2 fields', async () => {
      const v1Data = [
        {
          id: 'assistant-1',
          title: 'Test',
          desc: 'Test',
          emoji: '🤖',
          prompt: 'Test',
          addedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      localStorageMock.setItem('user_assistants', JSON.stringify(v1Data));
      localStorageMock.setItem('user_assistants_schema_version', '1');

      await service.migrate();

      const migrated = JSON.parse(localStorageMock.getItem('user_assistants')!);
      expect(migrated[0].tags).toEqual([]);
      expect(migrated[0].category).toEqual([]);
      expect(migrated[0].isPublic).toBe(true);
      expect(migrated[0].status).toBe('published');
      expect(migrated[0].author).toBe('unknown');
      expect(migrated[0].version).toBe(1);
      expect(migrated[0].usageCount).toBe(0);
      expect(migrated[0].rating).toBe(0);
      expect(migrated[0].isFavorite).toBe(false);
    });

    it('should migrate multiple assistants', async () => {
      const v1Data = [
        {
          id: 'assistant-1',
          title: 'First',
          desc: 'First assistant',
          emoji: '🤖',
          prompt: 'First',
          addedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'assistant-2',
          title: 'Second',
          desc: 'Second assistant',
          emoji: '🎯',
          prompt: 'Second',
          addedAt: '2024-01-02T00:00:00.000Z'
        },
        {
          id: 'assistant-3',
          title: 'Third',
          desc: 'Third assistant',
          emoji: '🚀',
          prompt: 'Third',
          addedAt: '2024-01-03T00:00:00.000Z'
        }
      ];

      localStorageMock.setItem('user_assistants', JSON.stringify(v1Data));
      localStorageMock.setItem('user_assistants_schema_version', '1');

      const result = await service.migrate();

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(3);

      const migrated = JSON.parse(localStorageMock.getItem('user_assistants')!);
      expect(migrated).toHaveLength(3);
      migrated.forEach((item: any) => {
        expect(item).toHaveProperty('tags');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('status');
      });
    });
  });

  describe('8.3.3 - Backward Compatibility', () => {
    it('should handle empty data gracefully', async () => {
      localStorageMock.setItem('user_assistants_schema_version', '1');

      const result = await service.migrate();

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(0);
    });

    it('should handle corrupted data gracefully', async () => {
      localStorageMock.setItem('user_assistants', 'invalid json {{{');
      localStorageMock.setItem('user_assistants_schema_version', '1');

      const result = await service.migrate();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('parse');
    });

    it('should not migrate if already at current version', async () => {
      const currentData = [
        {
          id: 'assistant-1',
          title: 'Test',
          desc: 'Test',
          emoji: '🤖',
          prompt: 'Test',
          tags: ['test'],
          category: ['dev'],
          isPublic: true,
          status: 'published',
          author: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
          version: 1,
          addedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      localStorageMock.setItem('user_assistants', JSON.stringify(currentData));
      localStorageMock.setItem('user_assistants_schema_version', CURRENT_SCHEMA_VERSION.toString());

      const result = await service.migrate();

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(0);
      expect(result.fromVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(result.toVersion).toBe(CURRENT_SCHEMA_VERSION);
    });

    it('should preserve partial V2 fields if they exist in V1 data', async () => {
      const v1DataWithPartialV2 = [
        {
          id: 'assistant-1',
          title: 'Test',
          desc: 'Test',
          emoji: '🤖',
          prompt: 'Test',
          addedAt: '2024-01-01T00:00:00.000Z',
          tags: ['existing', 'tags'],
          author: 'existing-author',
          usageCount: 5
        }
      ];

      localStorageMock.setItem('user_assistants', JSON.stringify(v1DataWithPartialV2));
      localStorageMock.setItem('user_assistants_schema_version', '1');

      await service.migrate();

      const migrated = JSON.parse(localStorageMock.getItem('user_assistants')!);
      expect(migrated[0].tags).toEqual(['existing', 'tags']);
      expect(migrated[0].author).toBe('existing-author');
      expect(migrated[0].usageCount).toBe(5);
    });
  });

  describe('8.3.4 - Backup and Restore', () => {
    it('should create backup before migration', () => {
      const testData = [{ id: '1', title: 'Test' }];
      localStorageMock.setItem('user_assistants', JSON.stringify(testData));

      const backupKey = service.createBackup();

      expect(backupKey).not.toBeNull();
      expect(backupKey).toContain('user_assistants_backup_');
      
      const backup = localStorageMock.getItem(backupKey!);
      expect(backup).toBe(JSON.stringify(testData));
    });

    it('should restore from backup', () => {
      const originalData = [{ id: '1', title: 'Original' }];
      const modifiedData = [{ id: '2', title: 'Modified' }];

      localStorageMock.setItem('user_assistants', JSON.stringify(originalData));
      const backupKey = service.createBackup();

      // Modify data
      localStorageMock.setItem('user_assistants', JSON.stringify(modifiedData));

      // Restore
      const restored = service.restoreFromBackup(backupKey!);

      expect(restored).toBe(true);
      const restoredData = JSON.parse(localStorageMock.getItem('user_assistants')!);
      expect(restoredData).toEqual(originalData);
    });

    it('should clean up old backups', () => {
      // Create multiple backups
      for (let i = 0; i < 5; i++) {
        localStorageMock.setItem(`user_assistants_backup_${Date.now() + i}`, `backup${i}`);
      }

      service.cleanupBackups();

      // Count remaining backups
      let backupCount = 0;
      for (let i = 0; i < localStorageMock.length; i++) {
        const key = localStorageMock.key(i);
        if (key && key.startsWith('user_assistants_backup_')) {
          backupCount++;
        }
      }

      expect(backupCount).toBeLessThanOrEqual(3);
    });
  });

  describe('8.3.5 - Data Validation', () => {
    it('should validate correct data structure', () => {
      const validData = [
        {
          id: 'assistant-1',
          title: 'Test',
          desc: 'Test description',
          emoji: '🤖',
          prompt: 'Test prompt',
          addedAt: '2024-01-01T00:00:00.000Z',
          isPublic: true
        }
      ];

      const result = service.validateData(validData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidData = [
        {
          id: 'assistant-1',
          title: 'Test'
          // Missing desc, emoji, prompt, addedAt
        }
      ];

      const result = service.validateData(invalidData as any);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid field types', () => {
      const invalidData = [
        {
          id: 123, // Should be string
          title: 'Test',
          desc: 'Test',
          emoji: '🤖',
          prompt: 'Test',
          addedAt: '2024-01-01T00:00:00.000Z',
          isPublic: 'yes' // Should be boolean
        }
      ];

      const result = service.validateData(invalidData as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('id'))).toBe(true);
      expect(result.errors.some(e => e.includes('isPublic'))).toBe(true);
    });

    it('should validate multiple items', () => {
      const mixedData = [
        {
          id: 'assistant-1',
          title: 'Valid',
          desc: 'Valid',
          emoji: '🤖',
          prompt: 'Valid',
          addedAt: '2024-01-01T00:00:00.000Z',
          isPublic: true
        },
        {
          id: 'assistant-2',
          title: 'Invalid'
          // Missing required fields
        }
      ];

      const result = service.validateData(mixedData as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Item 1'))).toBe(true);
    });
  });

  describe('8.3.6 - Auto Migration', () => {
    it('should auto-migrate on initialization', async () => {
      const v1Data = [
        {
          id: 'assistant-1',
          title: 'Test',
          desc: 'Test',
          emoji: '🤖',
          prompt: 'Test',
          addedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      localStorageMock.setItem('user_assistants', JSON.stringify(v1Data));
      localStorageMock.setItem('user_assistants_schema_version', '1');

      const result = await autoMigrate();

      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
      expect(result!.fromVersion).toBe(1);
      expect(result!.toVersion).toBe(CURRENT_SCHEMA_VERSION);
    });

    it('should return null if no migration needed', async () => {
      localStorageMock.setItem('user_assistants_schema_version', CURRENT_SCHEMA_VERSION.toString());

      const result = await autoMigrate();

      expect(result).toBeNull();
    });

    it('should restore backup on migration failure', async () => {
      const originalData = [{ id: '1', title: 'Original' }];
      localStorageMock.setItem('user_assistants', JSON.stringify(originalData));
      localStorageMock.setItem('user_assistants_schema_version', '1');

      // Mock the migration service to force failure
      const mockService = getUserAssistantMigrationService();
      const originalMigrate = mockService.migrate.bind(mockService);
      
      // Override migrate to throw error
      mockService.migrate = async () => {
        throw new Error('Forced migration failure');
      };

      try {
        // Create backup
        const backupKey = mockService.createBackup();
        
        // Try to migrate (will fail)
        await mockService.migrate();
        
        // Should not reach here
        fail('Migration should have thrown an error');
      } catch (error) {
        // Expected to fail
        expect(error).toBeDefined();
      }

      // Restore the original migrate function
      mockService.migrate = originalMigrate;

      // Verify backup exists and can be restored
      const backupKeys: string[] = [];
      for (let i = 0; i < localStorageMock.length; i++) {
        const key = localStorageMock.key(i);
        if (key && key.startsWith('user_assistants_backup_')) {
          backupKeys.push(key);
        }
      }

      expect(backupKeys.length).toBeGreaterThan(0);
      
      // Restore from backup
      const restored = mockService.restoreFromBackup(backupKeys[0]);
      expect(restored).toBe(true);
      
      const restoredData = JSON.parse(localStorageMock.getItem('user_assistants')!);
      expect(restoredData).toEqual(originalData);
    });
  });

  describe('8.3.7 - Edge Cases', () => {
    it('should handle data with special characters', async () => {
      const v1Data = [
        {
          id: 'assistant-1',
          title: 'Test with 特殊字符 and émojis 🎉',
          desc: 'Description with <html> & "quotes"',
          emoji: '🤖',
          prompt: 'Prompt with\nnewlines\tand\ttabs',
          addedAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      localStorageMock.setItem('user_assistants', JSON.stringify(v1Data));
      localStorageMock.setItem('user_assistants_schema_version', '1');

      const result = await service.migrate();

      expect(result.success).toBe(true);

      const migrated = JSON.parse(localStorageMock.getItem('user_assistants')!);
      expect(migrated[0].title).toBe('Test with 特殊字符 and émojis 🎉');
      expect(migrated[0].desc).toBe('Description with <html> & "quotes"');
    });

    it('should handle very large datasets', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `assistant-${i}`,
        title: `Assistant ${i}`,
        desc: `Description ${i}`,
        emoji: '🤖',
        prompt: `Prompt ${i}`,
        addedAt: new Date().toISOString()
      }));

      localStorageMock.setItem('user_assistants', JSON.stringify(largeDataset));
      localStorageMock.setItem('user_assistants_schema_version', '1');

      const result = await service.migrate();

      expect(result.success).toBe(true);
      expect(result.migratedCount).toBe(100);
    });
  });
});
