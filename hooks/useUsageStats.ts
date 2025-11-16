'use client';

/**
 * 使用统计Hook
 * 提供便捷的方法来记录和查询使用统计
 */

import { useState, useEffect, useCallback } from 'react';
import { usageStatsService } from '@/lib/services/usageStatsService';
import { UsageStats, TimeRangeStats } from '@/types/usageStats';

export interface UseUsageStatsOptions {
  /** 助理ID */
  assistantId: string;
  /** 是否自动加载统计数据 */
  autoLoad?: boolean;
  /** 默认时间范围 */
  defaultTimeRange?: 'today' | 'week' | 'month' | 'all';
}

export interface UseUsageStatsReturn {
  /** 统计数据 */
  stats: UsageStats | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 当前时间范围 */
  timeRange: 'today' | 'week' | 'month' | 'all';
  /** 设置时间范围 */
  setTimeRange: (range: 'today' | 'week' | 'month' | 'all') => void;
  /** 记录命令执行 */
  recordExecution: (
    userCommand: string,
    parsedCommands: string[],
    success: boolean,
    responseTime: number,
    error?: string
  ) => Promise<void>;
  /** 刷新统计数据 */
  refresh: () => Promise<void>;
  /** 导出统计数据 */
  exportStats: () => Promise<void>;
}

/**
 * 使用统计Hook
 */
export function useUsageStats(
  options: UseUsageStatsOptions
): UseUsageStatsReturn {
  const {
    assistantId,
    autoLoad = true,
    defaultTimeRange = 'week',
  } = options;

  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>(
    defaultTimeRange
  );

  /**
   * 加载统计数据
   */
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rangeStats = await usageStatsService.getTimeRangeStats(
        assistantId,
        timeRange
      );

      setStats(rangeStats.stats);
    } catch (err) {
      console.error('Failed to load usage stats:', err);
      setError(err instanceof Error ? err.message : '加载统计数据失败');
    } finally {
      setLoading(false);
    }
  }, [assistantId, timeRange]);

  /**
   * 记录命令执行
   */
  const recordExecution = useCallback(
    async (
      userCommand: string,
      parsedCommands: string[],
      success: boolean,
      responseTime: number,
      error?: string
    ) => {
      try {
        await usageStatsService.recordCommandExecution(
          assistantId,
          userCommand,
          parsedCommands,
          success,
          responseTime,
          error
        );

        // 记录后刷新统计数据
        await loadStats();
      } catch (err) {
        console.error('Failed to record command execution:', err);
      }
    },
    [assistantId, loadStats]
  );

  /**
   * 刷新统计数据
   */
  const refresh = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  /**
   * 导出统计数据
   */
  const exportStats = useCallback(async () => {
    try {
      const exportData = await usageStatsService.exportStats(assistantId);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usage-stats-${assistantId}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export stats:', err);
      throw err;
    }
  }, [assistantId]);

  /**
   * 自动加载统计数据
   */
  useEffect(() => {
    if (autoLoad) {
      loadStats();
    }
  }, [autoLoad, loadStats]);

  return {
    stats,
    loading,
    error,
    timeRange,
    setTimeRange,
    recordExecution,
    refresh,
    exportStats,
  };
}

/**
 * 使用统计追踪Hook
 * 简化版本，只用于记录命令执行
 */
export function useStatsTracking(assistantId: string) {
  const recordExecution = useCallback(
    async (
      userCommand: string,
      parsedCommands: string[],
      success: boolean,
      responseTime: number,
      error?: string
    ) => {
      try {
        await usageStatsService.recordCommandExecution(
          assistantId,
          userCommand,
          parsedCommands,
          success,
          responseTime,
          error
        );
      } catch (err) {
        console.error('Failed to record command execution:', err);
      }
    },
    [assistantId]
  );

  return { recordExecution };
}
