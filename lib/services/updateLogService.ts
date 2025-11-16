/**
 * Update Log Service
 * 
 * This service manages assistant update logs, tracking changes to preset assistants
 * and notifying users about updates.
 */

import { getDatabase } from '@/lib/db/initDatabase';

// ============================================================================
// Types
// ============================================================================

/**
 * Update log entry
 */
export interface UpdateLog {
  id: number;
  assistantId: string;
  version: number;
  previousVersion: number;
  changeType: 'created' | 'updated' | 'deleted';
  changes: UpdateChange[];
  changelog: string;
  createdAt: Date;
}

/**
 * Individual change in an update
 */
export interface UpdateChange {
  field: string;
  oldValue?: any;
  newValue?: any;
}

/**
 * Update log database row
 */
interface UpdateLogRow {
  id: number;
  assistant_id: string;
  version: number;
  previous_version: number;
  change_type: string;
  changes: string;  // JSON string
  changelog: string;
  created_at: string;
}

/**
 * User update read status
 */
export interface UserUpdateStatus {
  id: number;
  userId: string;
  updateLogId: number;
  isRead: boolean;
  readAt?: Date;
}

/**
 * User update status database row
 */
interface UserUpdateStatusRow {
  id: number;
  user_id: string;
  update_log_id: number;
  is_read: number;
  read_at: string | null;
}

// ============================================================================
// Database Schema
// ============================================================================

/**
 * Create update_logs table
 */
const CREATE_UPDATE_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS update_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assistant_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    previous_version INTEGER NOT NULL,
    change_type TEXT NOT NULL CHECK(change_type IN ('created', 'updated', 'deleted')),
    changes TEXT NOT NULL,
    changelog TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE CASCADE
  );
`;

/**
 * Create user_update_status table
 */
const CREATE_USER_UPDATE_STATUS_TABLE = `
  CREATE TABLE IF NOT EXISTS user_update_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    update_log_id INTEGER NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    read_at TEXT,
    UNIQUE(user_id, update_log_id),
    FOREIGN KEY (update_log_id) REFERENCES update_logs(id) ON DELETE CASCADE
  );
`;

/**
 * Create indexes for update_logs
 */
const CREATE_UPDATE_LOGS_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_update_logs_assistant ON update_logs(assistant_id);',
  'CREATE INDEX IF NOT EXISTS idx_update_logs_created_at ON update_logs(created_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_update_logs_version ON update_logs(version);',
];

/**
 * Create indexes for user_update_status
 */
const CREATE_USER_UPDATE_STATUS_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_user_update_status_user ON user_update_status(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_user_update_status_update_log ON user_update_status(update_log_id);',
  'CREATE INDEX IF NOT EXISTS idx_user_update_status_is_read ON user_update_status(is_read);',
];

// ============================================================================
// Update Log Service
// ============================================================================

export class UpdateLogService {
  /**
   * Initialize database tables
   */
  static async initializeTables(): Promise<void> {
    const db = await getDatabase();
    
    // Create tables
    await db.exec(CREATE_UPDATE_LOGS_TABLE);
    await db.exec(CREATE_USER_UPDATE_STATUS_TABLE);
    
    // Create indexes
    for (const indexSql of CREATE_UPDATE_LOGS_INDEXES) {
      await db.exec(indexSql);
    }
    for (const indexSql of CREATE_USER_UPDATE_STATUS_INDEXES) {
      await db.exec(indexSql);
    }
  }

  /**
   * Log an assistant update
   */
  static async logUpdate(
    assistantId: string,
    version: number,
    previousVersion: number,
    changeType: 'created' | 'updated' | 'deleted',
    changes: UpdateChange[],
    changelog: string
  ): Promise<UpdateLog> {
    const db = await getDatabase();
    
    const now = new Date().toISOString();
    const changesJson = JSON.stringify(changes);
    
    const result = await db.run(
      `INSERT INTO update_logs (
        assistant_id, version, previous_version, change_type, changes, changelog, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [assistantId, version, previousVersion, changeType, changesJson, changelog, now]
    );
    
    return {
      id: result.lastID!,
      assistantId,
      version,
      previousVersion,
      changeType,
      changes,
      changelog,
      createdAt: new Date(now),
    };
  }

  /**
   * Get update log by ID
   */
  static async getUpdateLog(id: number): Promise<UpdateLog | null> {
    const db = await getDatabase();
    
    const row = await db.get<UpdateLogRow>(
      'SELECT * FROM update_logs WHERE id = ?',
      [id]
    );
    
    if (!row) {
      return null;
    }
    
    return this.rowToUpdateLog(row);
  }

  /**
   * Get all update logs for an assistant
   */
  static async getUpdateLogsByAssistant(assistantId: string): Promise<UpdateLog[]> {
    const db = await getDatabase();
    
    const rows = await db.all<UpdateLogRow[]>(
      'SELECT * FROM update_logs WHERE assistant_id = ? ORDER BY created_at DESC',
      [assistantId]
    );
    
    return rows.map(row => this.rowToUpdateLog(row));
  }

  /**
   * Get recent update logs
   */
  static async getRecentUpdateLogs(limit: number = 10): Promise<UpdateLog[]> {
    const db = await getDatabase();
    
    const rows = await db.all<UpdateLogRow[]>(
      'SELECT * FROM update_logs ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    
    return rows.map(row => this.rowToUpdateLog(row));
  }

  /**
   * Get update logs since a specific date
   */
  static async getUpdateLogsSince(since: Date): Promise<UpdateLog[]> {
    const db = await getDatabase();
    
    const rows = await db.all<UpdateLogRow[]>(
      'SELECT * FROM update_logs WHERE created_at > ? ORDER BY created_at DESC',
      [since.toISOString()]
    );
    
    return rows.map(row => this.rowToUpdateLog(row));
  }

  /**
   * Mark update as read for a user
   */
  static async markAsRead(userId: string, updateLogId: number): Promise<void> {
    const db = await getDatabase();
    
    const now = new Date().toISOString();
    
    await db.run(
      `INSERT OR REPLACE INTO user_update_status (user_id, update_log_id, is_read, read_at)
       VALUES (?, ?, 1, ?)`,
      [userId, updateLogId, now]
    );
  }

  /**
   * Mark multiple updates as read for a user
   */
  static async markMultipleAsRead(userId: string, updateLogIds: number[]): Promise<void> {
    const db = await getDatabase();
    
    const now = new Date().toISOString();
    
    // Use a transaction for better performance
    await db.exec('BEGIN TRANSACTION');
    
    try {
      for (const updateLogId of updateLogIds) {
        await db.run(
          `INSERT OR REPLACE INTO user_update_status (user_id, update_log_id, is_read, read_at)
           VALUES (?, ?, 1, ?)`,
          [userId, updateLogId, now]
        );
      }
      
      await db.exec('COMMIT');
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
  }

  /**
   * Check if a user has read an update
   */
  static async isUpdateRead(userId: string, updateLogId: number): Promise<boolean> {
    const db = await getDatabase();
    
    const row = await db.get<UserUpdateStatusRow>(
      'SELECT is_read FROM user_update_status WHERE user_id = ? AND update_log_id = ?',
      [userId, updateLogId]
    );
    
    return row ? row.is_read === 1 : false;
  }

  /**
   * Get unread update count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const db = await getDatabase();
    
    const result = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM update_logs ul
       LEFT JOIN user_update_status uus ON ul.id = uus.update_log_id AND uus.user_id = ?
       WHERE uus.is_read IS NULL OR uus.is_read = 0`,
      [userId]
    );
    
    return result?.count || 0;
  }

  /**
   * Get unread updates for a user
   */
  static async getUnreadUpdates(userId: string, limit?: number): Promise<UpdateLog[]> {
    const db = await getDatabase();
    
    let query = `
      SELECT ul.* FROM update_logs ul
      LEFT JOIN user_update_status uus ON ul.id = uus.update_log_id AND uus.user_id = ?
      WHERE uus.is_read IS NULL OR uus.is_read = 0
      ORDER BY ul.created_at DESC
    `;
    
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    
    const rows = await db.all<UpdateLogRow[]>(query, [userId]);
    
    return rows.map(row => this.rowToUpdateLog(row));
  }

  /**
   * Get updates for assistants the user has favorited
   */
  static async getFavoritedAssistantUpdates(userId: string, limit?: number): Promise<UpdateLog[]> {
    const db = await getDatabase();
    
    let query = `
      SELECT ul.* FROM update_logs ul
      INNER JOIN favorites f ON ul.assistant_id = f.assistant_id
      WHERE f.user_id = ?
      ORDER BY ul.created_at DESC
    `;
    
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    
    const rows = await db.all<UpdateLogRow[]>(query, [userId]);
    
    return rows.map(row => this.rowToUpdateLog(row));
  }

  /**
   * Delete old update logs
   */
  static async deleteOldLogs(olderThan: Date): Promise<number> {
    const db = await getDatabase();
    
    const result = await db.run(
      'DELETE FROM update_logs WHERE created_at < ?',
      [olderThan.toISOString()]
    );
    
    return result.changes || 0;
  }

  /**
   * Get update statistics
   */
  static async getUpdateStatistics(): Promise<{
    totalUpdates: number;
    updatesByType: Record<string, number>;
    recentUpdates: number;
  }> {
    const db = await getDatabase();
    
    // Total updates
    const totalResult = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM update_logs'
    );
    
    // Updates by type
    const typeResults = await db.all<{ change_type: string; count: number }[]>(
      'SELECT change_type, COUNT(*) as count FROM update_logs GROUP BY change_type'
    );
    
    const updatesByType: Record<string, number> = {};
    typeResults.forEach(row => {
      updatesByType[row.change_type] = row.count;
    });
    
    // Recent updates (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentResult = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM update_logs WHERE created_at > ?',
      [sevenDaysAgo.toISOString()]
    );
    
    return {
      totalUpdates: totalResult?.count || 0,
      updatesByType,
      recentUpdates: recentResult?.count || 0,
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Convert database row to UpdateLog
   */
  private static rowToUpdateLog(row: UpdateLogRow): UpdateLog {
    return {
      id: row.id,
      assistantId: row.assistant_id,
      version: row.version,
      previousVersion: row.previous_version,
      changeType: row.change_type as 'created' | 'updated' | 'deleted',
      changes: JSON.parse(row.changes),
      changelog: row.changelog,
      createdAt: new Date(row.created_at),
    };
  }

  /**
   * Generate changelog from changes
   */
  static generateChangelog(changes: UpdateChange[]): string {
    const lines: string[] = [];
    
    for (const change of changes) {
      const fieldName = this.formatFieldName(change.field);
      
      if (change.oldValue === undefined) {
        lines.push(`• 添加了 ${fieldName}`);
      } else if (change.newValue === undefined) {
        lines.push(`• 删除了 ${fieldName}`);
      } else {
        lines.push(`• 更新了 ${fieldName}`);
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Format field name for display
   */
  private static formatFieldName(field: string): string {
    const fieldNames: Record<string, string> = {
      title: '标题',
      desc: '描述',
      emoji: '图标',
      prompt: '系统提示词',
      tags: '标签',
      category: '分类',
      isPublic: '公开状态',
      status: '状态',
    };
    
    return fieldNames[field] || field;
  }

  /**
   * Compare two assistant objects and generate changes
   */
  static compareAssistants(oldAssistant: any, newAssistant: any): UpdateChange[] {
    const changes: UpdateChange[] = [];
    const fieldsToCompare = ['title', 'desc', 'emoji', 'prompt', 'tags', 'category', 'isPublic', 'status'];
    
    for (const field of fieldsToCompare) {
      const oldValue = oldAssistant[field];
      const newValue = newAssistant[field];
      
      // Handle array comparison
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({ field, oldValue, newValue });
        }
      } else if (oldValue !== newValue) {
        changes.push({ field, oldValue, newValue });
      }
    }
    
    return changes;
  }
}

// ============================================================================
// Export
// ============================================================================

export default UpdateLogService;
