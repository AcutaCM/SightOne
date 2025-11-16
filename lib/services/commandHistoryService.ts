/**
 * 命令历史记录服务
 * 管理 Tello 无人机命令的历史记录存储和检索
 */

import { DroneCommand } from './telloAIParser';

/**
 * 命令历史记录项
 */
export interface CommandHistoryItem {
  id: string;
  timestamp: Date;
  userInput: string;
  commands: DroneCommand[];
  executionStatus: 'pending' | 'success' | 'failed' | 'cancelled';
  executionResults?: any[];
  error?: string;
}

/**
 * 命令历史记录服务类
 */
export class CommandHistoryService {
  private static readonly STORAGE_KEY = 'tello-command-history';
  private static readonly MAX_HISTORY_SIZE = 100;

  /**
   * 保存命令到历史记录
   */
  static saveCommand(item: Omit<CommandHistoryItem, 'id' | 'timestamp'>): CommandHistoryItem {
    const historyItem: CommandHistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...item
    };

    const history = this.getHistory();
    history.unshift(historyItem);

    // 限制历史记录数量
    if (history.length > this.MAX_HISTORY_SIZE) {
      history.splice(this.MAX_HISTORY_SIZE);
    }

    this.saveHistory(history);
    return historyItem;
  }

  /**
   * 更新命令执行状态
   */
  static updateCommandStatus(
    id: string,
    status: 'success' | 'failed' | 'cancelled',
    results?: any[],
    error?: string
  ): void {
    const history = this.getHistory();
    const index = history.findIndex(item => item.id === id);

    if (index !== -1) {
      history[index].executionStatus = status;
      if (results) {
        history[index].executionResults = results;
      }
      if (error) {
        history[index].error = error;
      }
      this.saveHistory(history);
    }
  }

  /**
   * 获取所有历史记录
   */
  static getHistory(): CommandHistoryItem[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      // 转换 timestamp 字符串为 Date 对象
      return parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load command history:', error);
      return [];
    }
  }

  /**
   * 获取指定数量的最近历史记录
   */
  static getRecentHistory(limit: number = 10): CommandHistoryItem[] {
    const history = this.getHistory();
    return history.slice(0, limit);
  }

  /**
   * 根据 ID 获取历史记录项
   */
  static getHistoryItem(id: string): CommandHistoryItem | null {
    const history = this.getHistory();
    return history.find(item => item.id === id) || null;
  }

  /**
   * 删除指定的历史记录
   */
  static deleteHistoryItem(id: string): void {
    const history = this.getHistory();
    const filtered = history.filter(item => item.id !== id);
    this.saveHistory(filtered);
  }

  /**
   * 清空所有历史记录
   */
  static clearHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * 搜索历史记录
   */
  static searchHistory(query: string): CommandHistoryItem[] {
    const history = this.getHistory();
    const lowerQuery = query.toLowerCase();

    return history.filter(item => {
      // 搜索用户输入
      if (item.userInput.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // 搜索命令动作
      if (item.commands.some(cmd => cmd.action.toLowerCase().includes(lowerQuery))) {
        return true;
      }

      return false;
    });
  }

  /**
   * 按状态过滤历史记录
   */
  static filterByStatus(status: CommandHistoryItem['executionStatus']): CommandHistoryItem[] {
    const history = this.getHistory();
    return history.filter(item => item.executionStatus === status);
  }

  /**
   * 获取统计信息
   */
  static getStatistics(): {
    total: number;
    success: number;
    failed: number;
    pending: number;
    cancelled: number;
  } {
    const history = this.getHistory();

    return {
      total: history.length,
      success: history.filter(item => item.executionStatus === 'success').length,
      failed: history.filter(item => item.executionStatus === 'failed').length,
      pending: history.filter(item => item.executionStatus === 'pending').length,
      cancelled: history.filter(item => item.executionStatus === 'cancelled').length
    };
  }

  /**
   * 导出历史记录为 JSON
   */
  static exportHistory(): string {
    const history = this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  /**
   * 从 JSON 导入历史记录
   */
  static importHistory(jsonData: string): { success: boolean; error?: string } {
    try {
      const imported = JSON.parse(jsonData);
      
      if (!Array.isArray(imported)) {
        return { success: false, error: '无效的数据格式' };
      }

      // 验证数据结构
      const valid = imported.every(item => 
        item.id && 
        item.timestamp && 
        item.userInput && 
        Array.isArray(item.commands) &&
        item.executionStatus
      );

      if (!valid) {
        return { success: false, error: '数据结构不完整' };
      }

      // 合并导入的数据和现有数据
      const existing = this.getHistory();
      const merged = [...imported, ...existing];

      // 去重 (基于 ID)
      const unique = merged.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );

      // 限制数量
      const limited = unique.slice(0, this.MAX_HISTORY_SIZE);

      this.saveHistory(limited);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '导入失败' 
      };
    }
  }

  /**
   * 保存历史记录到 localStorage
   */
  private static saveHistory(history: CommandHistoryItem[]): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save command history:', error);
      }
    }
  }
}
