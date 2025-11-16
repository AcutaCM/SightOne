/**
 * User Assistant Service
 * 
 * Service for managing user's personal assistant list.
 * Handles adding, removing, and querying assistants that users have activated from the market.
 */

import { Assistant, UserAssistant } from '@/types/assistant';
import { autoMigrate } from './userAssistantMigration';
import { assistantSyncQueue, SyncOperationType } from './assistantSyncQueue';
import { validateAssistantData, sanitizeAssistantData } from '@/lib/utils/assistantValidation';

/**
 * Service error class
 */
export class UserAssistantServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'UserAssistantServiceError';
  }
}

/**
 * User Assistant Service Class
 */
export class UserAssistantService {
  private readonly storageKey = 'user_assistants';
  private readonly maxAssistants = 50; // Maximum number of assistants allowed
  private migrationPromise: Promise<void> | null = null;

  constructor() {
    // Auto-migrate on initialization
    this.migrationPromise = this.performMigration();
  }

  /**
   * Perform migration if needed
   */
  private async performMigration(): Promise<void> {
    try {
      const result = await autoMigrate();
      if (result && !result.success) {
        console.error('Migration failed:', result.errors);
      }
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  /**
   * Ensure migration is complete before operations
   */
  private async ensureMigrated(): Promise<void> {
    if (this.migrationPromise) {
      await this.migrationPromise;
    }
  }

  /**
   * Add assistant to user's list
   * @throws {UserAssistantServiceError} If assistant already exists, list is full, or storage fails
   */
  async addAssistant(assistant: Assistant): Promise<UserAssistant> {
    await this.ensureMigrated();
    
    try {
      // Validate and sanitize assistant data
      const validationResult = validateAssistantData(assistant);
      
      if (!validationResult.isValid) {
        console.error('[UserAssistantService] Invalid assistant data:', validationResult.errors);
        throw new UserAssistantServiceError(
          '助手数据不完整或无效',
          'INVALID_ASSISTANT_DATA',
          { 
            errors: validationResult.errors,
            assistantId: assistant.id 
          }
        );
      }

      // Log warnings if any
      if (validationResult.warnings.length > 0) {
        console.warn('[UserAssistantService] Assistant data warnings:', validationResult.warnings);
      }

      // Use sanitized data
      const sanitizedAssistant = validationResult.sanitizedData!;

      // Check if already exists
      if (this.isAssistantAdded(sanitizedAssistant.id)) {
        throw new UserAssistantServiceError(
          '助手已在列表中',
          'ASSISTANT_ALREADY_EXISTS',
          { assistantId: sanitizedAssistant.id }
        );
      }

      // Get current list
      const currentList = this.getUserAssistants();

      // Check if list is full
      if (currentList.length >= this.maxAssistants) {
        throw new UserAssistantServiceError(
          `助手列表已达上限（${this.maxAssistants}个），请先删除一些助手后再添加`,
          'ASSISTANT_LIST_FULL',
          { 
            currentCount: currentList.length,
            maxCount: this.maxAssistants
          }
        );
      }

      // Create user assistant object
      const userAssistant: UserAssistant = {
        ...sanitizedAssistant,
        addedAt: new Date(),
        usageCount: 0,
        isFavorite: false,
      };

      // Add to list (add to top)
      const updatedList = [userAssistant, ...currentList];

      // Save to storage
      await this.saveToStorage(updatedList);

      // Queue for future backend sync
      try {
        await assistantSyncQueue.enqueue(
          SyncOperationType.ADD_ASSISTANT,
          assistant.id,
          { assistant: userAssistant }
        );
      } catch (error) {
        // Don't fail the operation if queue fails
        console.warn('[UserAssistantService] Failed to enqueue sync operation:', error);
      }

      return userAssistant;
    } catch (error) {
      if (error instanceof UserAssistantServiceError) {
        throw error;
      }
      throw new UserAssistantServiceError(
        '添加助手失败',
        'ADD_ASSISTANT_ERROR',
        error
      );
    }
  }

  /**
   * Remove assistant from user's list
   */
  async removeAssistant(assistantId: string): Promise<void> {
    try {
      const currentList = this.getUserAssistants();
      const updatedList = currentList.filter(a => a.id !== assistantId);
      
      if (currentList.length === updatedList.length) {
        throw new UserAssistantServiceError(
          '助手不在列表中',
          'ASSISTANT_NOT_FOUND',
          { assistantId }
        );
      }

      await this.saveToStorage(updatedList);

      // Queue for future backend sync
      try {
        await assistantSyncQueue.enqueue(
          SyncOperationType.REMOVE_ASSISTANT,
          assistantId
        );
      } catch (error) {
        console.warn('[UserAssistantService] Failed to enqueue sync operation:', error);
      }
    } catch (error) {
      if (error instanceof UserAssistantServiceError) {
        throw error;
      }
      throw new UserAssistantServiceError(
        '移除助手失败',
        'REMOVE_ASSISTANT_ERROR',
        error
      );
    }
  }

  /**
   * Check if assistant is already added
   */
  isAssistantAdded(assistantId: string): boolean {
    try {
      const currentList = this.getUserAssistants();
      return currentList.some(a => a.id === assistantId);
    } catch (error) {
      console.error('Failed to check if assistant is added:', error);
      return false;
    }
  }

  /**
   * Get user's assistant list
   */
  getUserAssistants(): UserAssistant[] {
    try {
      if (typeof window === 'undefined') {
        // Server-side rendering
        return [];
      }

      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      
      if (!Array.isArray(parsed)) {
        console.error('[UserAssistantService] Stored data is not an array');
        return [];
      }

      // Validate and sanitize each assistant
      const validAssistants: UserAssistant[] = [];
      let invalidCount = 0;

      for (const item of parsed) {
        try {
          // Validate base assistant data
          const sanitized = sanitizeAssistantData(item, false);
          
          if (!sanitized) {
            invalidCount++;
            console.warn('[UserAssistantService] Skipping invalid assistant:', item.id);
            continue;
          }

          // Convert date strings to Date objects and add user-specific fields
          const userAssistant: UserAssistant = {
            ...sanitized,
            addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
            lastUsedAt: item.lastUsedAt ? new Date(item.lastUsedAt) : undefined,
            usageCount: typeof item.usageCount === 'number' ? item.usageCount : 0,
            isFavorite: typeof item.isFavorite === 'boolean' ? item.isFavorite : false,
            customName: item.customName || undefined,
          };

          validAssistants.push(userAssistant);
        } catch (itemError) {
          invalidCount++;
          console.error('[UserAssistantService] Error processing assistant:', itemError);
        }
      }

      if (invalidCount > 0) {
        console.warn(
          `[UserAssistantService] Filtered out ${invalidCount} invalid assistant(s) from storage`
        );
      }

      return validAssistants;
    } catch (error) {
      console.error('[UserAssistantService] Failed to load user assistants:', error);
      // Return empty array on parse error to prevent app crash
      return [];
    }
  }

  /**
   * Update assistant's last used time and increment usage count
   */
  async updateLastUsed(assistantId: string): Promise<void> {
    try {
      const currentList = this.getUserAssistants();
      const updatedList = currentList.map(a =>
        a.id === assistantId
          ? {
              ...a,
              lastUsedAt: new Date(),
              usageCount: (a.usageCount || 0) + 1,
            }
          : a
      );

      await this.saveToStorage(updatedList);

      // Queue for future backend sync
      try {
        await assistantSyncQueue.enqueue(
          SyncOperationType.UPDATE_LAST_USED,
          assistantId,
          { timestamp: new Date().toISOString() }
        );
      } catch (error) {
        console.warn('[UserAssistantService] Failed to enqueue sync operation:', error);
      }
    } catch (error) {
      throw new UserAssistantServiceError(
        '更新使用时间失败',
        'UPDATE_LAST_USED_ERROR',
        error
      );
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(assistantId: string): Promise<void> {
    try {
      const currentList = this.getUserAssistants();
      const updatedList = currentList.map(a =>
        a.id === assistantId
          ? { ...a, isFavorite: !a.isFavorite }
          : a
      );

      await this.saveToStorage(updatedList);
    } catch (error) {
      throw new UserAssistantServiceError(
        '切换收藏状态失败',
        'TOGGLE_FAVORITE_ERROR',
        error
      );
    }
  }

  /**
   * Update custom name
   */
  async updateCustomName(assistantId: string, customName: string): Promise<void> {
    try {
      const currentList = this.getUserAssistants();
      const updatedList = currentList.map(a =>
        a.id === assistantId
          ? { ...a, customName: customName || undefined }
          : a
      );

      await this.saveToStorage(updatedList);
    } catch (error) {
      throw new UserAssistantServiceError(
        '更新自定义名称失败',
        'UPDATE_CUSTOM_NAME_ERROR',
        error
      );
    }
  }

  /**
   * Get assistant by ID from user's list
   */
  getUserAssistant(assistantId: string): UserAssistant | null {
    const list = this.getUserAssistants();
    return list.find(a => a.id === assistantId) || null;
  }

  /**
   * Get favorite assistants
   */
  getFavoriteAssistants(): UserAssistant[] {
    return this.getUserAssistants().filter(a => a.isFavorite);
  }

  /**
   * Get recently used assistants
   */
  getRecentlyUsedAssistants(limit: number = 5): UserAssistant[] {
    return this.getUserAssistants()
      .filter(a => a.lastUsedAt)
      .sort((a, b) => {
        const timeA = a.lastUsedAt?.getTime() || 0;
        const timeB = b.lastUsedAt?.getTime() || 0;
        return timeB - timeA;
      })
      .slice(0, limit);
  }

  /**
   * Get most used assistants
   */
  getMostUsedAssistants(limit: number = 5): UserAssistant[] {
    return this.getUserAssistants()
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, limit);
  }

  /**
   * Clear all user assistants
   */
  async clearAll(): Promise<void> {
    try {
      await this.saveToStorage([]);
    } catch (error) {
      throw new UserAssistantServiceError(
        '清空列表失败',
        'CLEAR_ALL_ERROR',
        error
      );
    }
  }

  /**
   * Get the current count of user assistants
   */
  getAssistantCount(): number {
    return this.getUserAssistants().length;
  }

  /**
   * Get the maximum allowed number of assistants
   */
  getMaxAssistants(): number {
    return this.maxAssistants;
  }

  /**
   * Check if the assistant list is full
   */
  isListFull(): boolean {
    return this.getAssistantCount() >= this.maxAssistants;
  }

  /**
   * Get remaining slots in the assistant list
   */
  getRemainingSlots(): number {
    return Math.max(0, this.maxAssistants - this.getAssistantCount());
  }

  /**
   * Save assistants to localStorage
   * @private
   */
  private async saveToStorage(assistants: UserAssistant[]): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('localStorage is not available on server side');
      }

      localStorage.setItem(this.storageKey, JSON.stringify(assistants));
    } catch (error) {
      // Check for quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new UserAssistantServiceError(
          '存储空间不足，请清理部分助手后重试',
          'QUOTA_EXCEEDED',
          error
        );
      }
      
      throw new UserAssistantServiceError(
        '保存失败，请重试',
        'STORAGE_ERROR',
        error
      );
    }
  }
}

/**
 * Singleton instance
 */
let defaultService: UserAssistantService | null = null;

/**
 * Get the default service instance
 */
export function getUserAssistantService(): UserAssistantService {
  if (!defaultService) {
    defaultService = new UserAssistantService();
  }
  return defaultService;
}

/**
 * Reset the default service instance (useful for testing)
 */
export function resetUserAssistantService(): void {
  defaultService = null;
}

/**
 * Export singleton instance for convenience
 */
export const userAssistantService = getUserAssistantService();
