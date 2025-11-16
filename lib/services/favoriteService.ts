/**
 * Favorite Service
 * 
 * Manages user favorite assistants with database operations
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { AssistantFavorite, FavoriteRow } from '@/types/assistant';
import { getDatabase } from '@/lib/db/initDatabase';
import type Database from 'better-sqlite3';

export class FavoriteService {
  /**
   * Toggle favorite status for an assistant
   * 
   * @param userId - User ID
   * @param assistantId - Assistant ID
   * @returns Promise<boolean> - New favorite status (true if favorited, false if unfavorited)
   * 
   * Requirement 8.1: THE System SHALL 允许User收藏助理
   * Requirement 8.3: WHEN User收藏助理时，THE System SHALL 立即更新收藏列表
   * Requirement 8.4: THE System SHALL 支持取消收藏
   */
  async toggleFavorite(userId: string, assistantId: string): Promise<boolean> {
    const db = await getDatabase();
    
    try {
      // Check if already favorited
      const existing = db
        .prepare('SELECT * FROM favorites WHERE user_id = ? AND assistant_id = ?')
        .get(userId, assistantId) as FavoriteRow | undefined;

      if (existing) {
        // Remove favorite
        db
          .prepare('DELETE FROM favorites WHERE user_id = ? AND assistant_id = ?')
          .run(userId, assistantId);
        console.log(`[FavoriteService] Removed favorite: ${assistantId} for user ${userId}`);
        return false;
      } else {
        // Add favorite
        db
          .prepare('INSERT INTO favorites (user_id, assistant_id, created_at) VALUES (?, ?, ?)')
          .run(userId, assistantId, new Date().toISOString());
        console.log(`[FavoriteService] Added favorite: ${assistantId} for user ${userId}`);
        return true;
      }
    } catch (error) {
      console.error('[FavoriteService] Error toggling favorite:', error);
      throw new Error('Failed to toggle favorite');
    }
  }

  /**
   * Get all favorites for a user
   * 
   * @param userId - User ID
   * @returns Promise<AssistantFavorite[]> - List of favorites
   * 
   * Requirement 8.2: THE System SHALL 在市场首页显示"我的收藏"区域
   * Requirement 8.5: THE System SHALL 同步收藏列表到本地存储
   */
  async getFavorites(userId: string): Promise<AssistantFavorite[]> {
    const db = await getDatabase();
    
    try {
      const rows = db
        .prepare('SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC')
        .all(userId) as FavoriteRow[];

      return rows.map(this.rowToEntity);
    } catch (error) {
      console.error('[FavoriteService] Error getting favorites:', error);
      throw new Error('Failed to get favorites');
    }
  }

  /**
   * Get favorite IDs for a user (for quick lookup)
   * 
   * @param userId - User ID
   * @returns Promise<Set<string>> - Set of favorited assistant IDs
   */
  async getFavoriteIds(userId: string): Promise<Set<string>> {
    const db = await getDatabase();
    
    try {
      const rows = db
        .prepare('SELECT assistant_id FROM favorites WHERE user_id = ?')
        .all(userId) as { assistant_id: string }[];

      return new Set(rows.map(row => row.assistant_id));
    } catch (error) {
      console.error('[FavoriteService] Error getting favorite IDs:', error);
      throw new Error('Failed to get favorite IDs');
    }
  }

  /**
   * Check if an assistant is favorited by a user
   * 
   * @param userId - User ID
   * @param assistantId - Assistant ID
   * @returns Promise<boolean> - True if favorited
   */
  async isFavorited(userId: string, assistantId: string): Promise<boolean> {
    const db = await getDatabase();
    
    try {
      const row = db
        .prepare('SELECT COUNT(*) as count FROM favorites WHERE user_id = ? AND assistant_id = ?')
        .get(userId, assistantId) as { count: number } | undefined;

      return (row?.count || 0) > 0;
    } catch (error) {
      console.error('[FavoriteService] Error checking favorite status:', error);
      return false;
    }
  }

  /**
   * Get favorite count for an assistant
   * 
   * @param assistantId - Assistant ID
   * @returns Promise<number> - Number of users who favorited this assistant
   */
  async getFavoriteCount(assistantId: string): Promise<number> {
    const db = await getDatabase();
    
    try {
      const row = db
        .prepare('SELECT COUNT(*) as count FROM favorites WHERE assistant_id = ?')
        .get(assistantId) as { count: number } | undefined;

      return row?.count || 0;
    } catch (error) {
      console.error('[FavoriteService] Error getting favorite count:', error);
      return 0;
    }
  }

  /**
   * Get assistants favorited by a user with full assistant data
   * 
   * @param userId - User ID
   * @returns Promise<any[]> - List of favorited assistants with full data
   */
  async getFavoritedAssistants(userId: string): Promise<any[]> {
    const db = await getDatabase();
    
    try {
      const rows = db
        .prepare(`
          SELECT a.*, f.created_at as favorited_at
          FROM assistants a
          INNER JOIN favorites f ON a.id = f.assistant_id
          WHERE f.user_id = ?
          ORDER BY f.created_at DESC
        `)
        .all(userId);

      return rows;
    } catch (error) {
      console.error('[FavoriteService] Error getting favorited assistants:', error);
      throw new Error('Failed to get favorited assistants');
    }
  }

  /**
   * Remove all favorites for an assistant (when assistant is deleted)
   * 
   * @param assistantId - Assistant ID
   */
  async removeFavoritesForAssistant(assistantId: string): Promise<void> {
    const db = await getDatabase();
    
    try {
      db
        .prepare('DELETE FROM favorites WHERE assistant_id = ?')
        .run(assistantId);
      console.log(`[FavoriteService] Removed all favorites for assistant: ${assistantId}`);
    } catch (error) {
      console.error('[FavoriteService] Error removing favorites for assistant:', error);
      throw new Error('Failed to remove favorites for assistant');
    }
  }

  /**
   * Convert database row to entity
   */
  private rowToEntity(row: FavoriteRow): AssistantFavorite {
    return {
      id: row.id,
      userId: row.user_id,
      assistantId: row.assistant_id,
      createdAt: new Date(row.created_at),
    };
  }
}

// Export singleton instance
export const favoriteService = new FavoriteService();
