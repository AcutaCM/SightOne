/**
 * User Assistant Data Migration Service
 * 
 * Handles data format migrations for user assistant storage
 * Ensures backward compatibility when data structure changes
 */

import { UserAssistant } from '@/types/assistant';

/**
 * Current schema version
 */
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Storage keys
 */
const STORAGE_KEY = 'user_assistants';
const VERSION_KEY = 'user_assistants_schema_version';

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  migratedCount: number;
  errors: string[];
}

/**
 * Legacy data formats for migration
 */
interface LegacyUserAssistantV1 {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  prompt: string;
  addedAt: string | Date;
  // Missing fields that were added in v2
}

/**
 * User Assistant Migration Service
 */
export class UserAssistantMigrationService {
  /**
   * Check if migration is needed
   */
  needsMigration(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const currentVersion = this.getCurrentVersion();
    return currentVersion < CURRENT_SCHEMA_VERSION;
  }

  /**
   * Get current schema version from storage
   */
  getCurrentVersion(): number {
    if (typeof window === 'undefined') {
      return CURRENT_SCHEMA_VERSION;
    }

    const stored = localStorage.getItem(VERSION_KEY);
    if (!stored) {
      // Check if there's data without version (legacy)
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? 1 : CURRENT_SCHEMA_VERSION;
    }

    return parseInt(stored, 10);
  }

  /**
   * Set schema version in storage
   */
  private setVersion(version: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(VERSION_KEY, version.toString());
  }

  /**
   * Perform migration if needed
   */
  async migrate(): Promise<MigrationResult> {
    const fromVersion = this.getCurrentVersion();
    const errors: string[] = [];
    let migratedCount = 0;

    if (fromVersion >= CURRENT_SCHEMA_VERSION) {
      return {
        success: true,
        fromVersion,
        toVersion: CURRENT_SCHEMA_VERSION,
        migratedCount: 0,
        errors: []
      };
    }

    try {
      // Get existing data
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // No data to migrate
        this.setVersion(CURRENT_SCHEMA_VERSION);
        return {
          success: true,
          fromVersion,
          toVersion: CURRENT_SCHEMA_VERSION,
          migratedCount: 0,
          errors: []
        };
      }

      let data: any[];
      try {
        data = JSON.parse(stored);
      } catch (error) {
        errors.push('Failed to parse existing data');
        return {
          success: false,
          fromVersion,
          toVersion: CURRENT_SCHEMA_VERSION,
          migratedCount: 0,
          errors
        };
      }

      // Migrate data through versions
      let migratedData = data;
      let currentVersion = fromVersion;

      while (currentVersion < CURRENT_SCHEMA_VERSION) {
        switch (currentVersion) {
          case 1:
            migratedData = this.migrateV1ToV2(migratedData, errors);
            currentVersion = 2;
            break;
          // Add more migration cases as needed
          default:
            errors.push(`Unknown version: ${currentVersion}`);
            return {
              success: false,
              fromVersion,
              toVersion: currentVersion,
              migratedCount,
              errors
            };
        }
      }

      // Save migrated data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
      this.setVersion(CURRENT_SCHEMA_VERSION);
      migratedCount = migratedData.length;

      return {
        success: true,
        fromVersion,
        toVersion: CURRENT_SCHEMA_VERSION,
        migratedCount,
        errors
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        fromVersion,
        toVersion: CURRENT_SCHEMA_VERSION,
        migratedCount,
        errors
      };
    }
  }

  /**
   * Migrate from V1 to V2
   * V1: Basic assistant data with addedAt
   * V2: Added tags, category, status, author, dates, version, etc.
   */
  private migrateV1ToV2(data: any[], errors: string[]): any[] {
    return data.map((item, index) => {
      try {
        // Ensure all required V2 fields exist
        const migrated: any = {
          ...item,
          // Add missing fields with defaults
          tags: item.tags || [],
          category: item.category || [],
          isPublic: item.isPublic !== undefined ? item.isPublic : true,
          status: item.status || 'published',
          author: item.author || 'unknown',
          createdAt: item.createdAt || item.addedAt || new Date().toISOString(),
          updatedAt: item.updatedAt || null,
          reviewedAt: item.reviewedAt || null,
          publishedAt: item.publishedAt || null,
          reviewNote: item.reviewNote || null,
          version: item.version || 1,
          usageCount: item.usageCount || 0,
          rating: item.rating || 0,
          // User-specific fields
          addedAt: item.addedAt || new Date().toISOString(),
          lastUsedAt: item.lastUsedAt || null,
          isFavorite: item.isFavorite || false,
          customName: item.customName || null
        };

        return migrated;
      } catch (error) {
        errors.push(`Failed to migrate item ${index}: ${error}`);
        return item; // Return original if migration fails
      }
    });
  }

  /**
   * Validate migrated data
   */
  validateData(data: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('Data is not an array');
      return { valid: false, errors };
    }

    data.forEach((item, index) => {
      // Check required fields
      const requiredFields = ['id', 'title', 'desc', 'emoji', 'prompt', 'addedAt'];
      for (const field of requiredFields) {
        if (!item[field]) {
          errors.push(`Item ${index} missing required field: ${field}`);
        }
      }

      // Check field types
      if (typeof item.id !== 'string') {
        errors.push(`Item ${index} has invalid id type`);
      }
      if (typeof item.title !== 'string') {
        errors.push(`Item ${index} has invalid title type`);
      }
      if (typeof item.isPublic !== 'boolean') {
        errors.push(`Item ${index} has invalid isPublic type`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create backup before migration
   */
  createBackup(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`;
    localStorage.setItem(backupKey, stored);
    return backupKey;
  }

  /**
   * Restore from backup
   */
  restoreFromBackup(backupKey: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const backup = localStorage.getItem(backupKey);
    if (!backup) {
      return false;
    }

    try {
      localStorage.setItem(STORAGE_KEY, backup);
      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  /**
   * Clean up old backups (keep only last 3)
   */
  cleanupBackups(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const backupKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_KEY}_backup_`)) {
        backupKeys.push(key);
      }
    }

    // Sort by timestamp (newest first)
    backupKeys.sort((a, b) => {
      const timeA = parseInt(a.split('_').pop() || '0', 10);
      const timeB = parseInt(b.split('_').pop() || '0', 10);
      return timeB - timeA;
    });

    // Remove old backups (keep only 3 most recent)
    backupKeys.slice(3).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

/**
 * Singleton instance
 */
let migrationService: UserAssistantMigrationService | null = null;

/**
 * Get migration service instance
 */
export function getUserAssistantMigrationService(): UserAssistantMigrationService {
  if (!migrationService) {
    migrationService = new UserAssistantMigrationService();
  }
  return migrationService;
}

/**
 * Auto-migrate on service initialization
 */
export async function autoMigrate(): Promise<MigrationResult | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const service = getUserAssistantMigrationService();
  
  if (!service.needsMigration()) {
    return null;
  }

  // Create backup before migration
  const backupKey = service.createBackup();
  
  try {
    const result = await service.migrate();
    
    if (result.success) {
      // Clean up old backups
      service.cleanupBackups();
    } else if (backupKey) {
      // Restore from backup if migration failed
      service.restoreFromBackup(backupKey);
    }
    
    return result;
  } catch (error) {
    // Restore from backup on error
    if (backupKey) {
      service.restoreFromBackup(backupKey);
    }
    throw error;
  }
}
