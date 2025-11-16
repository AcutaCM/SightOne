/**
 * 使用统计服务
 * 负责收集、存储和查询智能代理的使用统计数据
 */

import {
  CommandExecution,
  UsageStats,
  CommandFrequency,
  StatsFilter,
  TimeRangeStats,
  StatsAggregation,
} from '@/types/usageStats';
import {
  initUsageStatsDB,
  USAGE_STATS_STORES,
  COMMAND_EXECUTION_INDEXES,
  cleanupOldStats,
} from '@/lib/db/usageStatsSchema';

export class UsageStatsService {
  private db: IDBDatabase | null = null;

  /**
   * 初始化数据库连接
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      this.db = await initUsageStatsDB();
    }
    return this.db;
  }

  /**
   * 记录命令执行
   */
  async recordCommandExecution(
    assistantId: string,
    userCommand: string,
    parsedCommands: string[],
    success: boolean,
    responseTime: number,
    error?: string
  ): Promise<void> {
    const db = await this.ensureDB();

    const execution: CommandExecution = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      assistantId,
      userCommand,
      parsedCommands,
      success,
      error,
      responseTime,
      timestamp: new Date(),
    };

    const transaction = db.transaction(
      [USAGE_STATS_STORES.COMMAND_EXECUTIONS],
      'readwrite'
    );
    const store = transaction.objectStore(USAGE_STATS_STORES.COMMAND_EXECUTIONS);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add(execution);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // 异步更新聚合统计
    this.updateAggregatedStats(assistantId).catch(console.error);
  }

  /**
   * 获取命令执行记录
   */
  async getCommandExecutions(
    assistantId: string,
    filter?: StatsFilter
  ): Promise<CommandExecution[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(
      [USAGE_STATS_STORES.COMMAND_EXECUTIONS],
      'readonly'
    );
    const store = transaction.objectStore(USAGE_STATS_STORES.COMMAND_EXECUTIONS);
    const index = store.index(COMMAND_EXECUTION_INDEXES.BY_ASSISTANT);

    return new Promise((resolve, reject) => {
      const request = index.getAll(assistantId);
      
      request.onsuccess = () => {
        let executions = request.result as CommandExecution[];

        // 应用过滤器
        if (filter) {
          executions = this.applyFilter(executions, filter);
        }

        resolve(executions);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 应用过滤器
   */
  private applyFilter(
    executions: CommandExecution[],
    filter: StatsFilter
  ): CommandExecution[] {
    return executions.filter((exec) => {
      // 时间范围过滤
      if (filter.startDate && exec.timestamp < filter.startDate) {
        return false;
      }
      if (filter.endDate && exec.timestamp > filter.endDate) {
        return false;
      }

      // 成功状态过滤
      if (filter.successOnly && !exec.success) {
        return false;
      }

      // 响应时间过滤
      if (
        filter.minResponseTime !== undefined &&
        exec.responseTime < filter.minResponseTime
      ) {
        return false;
      }
      if (
        filter.maxResponseTime !== undefined &&
        exec.responseTime > filter.maxResponseTime
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * 计算使用统计
   */
  async calculateStats(
    assistantId: string,
    filter?: StatsFilter
  ): Promise<UsageStats> {
    const executions = await this.getCommandExecutions(assistantId, filter);

    if (executions.length === 0) {
      return this.getEmptyStats(assistantId);
    }

    const successfulExecs = executions.filter((e) => e.success);
    const failedExecs = executions.filter((e) => !e.success);

    const totalUses = executions.length;
    const successfulUses = successfulExecs.length;
    const failedUses = failedExecs.length;
    const successRate = (successfulUses / totalUses) * 100;

    // 计算响应时间统计
    const responseTimes = executions.map((e) => e.responseTime);
    const avgResponseTime =
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);

    // 计算最常用命令
    const popularCommands = this.calculatePopularCommands(executions);

    // 时间范围
    const timestamps = executions.map((e) => e.timestamp);
    const firstUsed = new Date(Math.min(...timestamps.map((t) => t.getTime())));
    const lastUsed = new Date(Math.max(...timestamps.map((t) => t.getTime())));

    return {
      assistantId,
      totalUses,
      successfulUses,
      failedUses,
      successRate,
      avgResponseTime,
      minResponseTime,
      maxResponseTime,
      popularCommands,
      lastUsed,
      firstUsed,
      periodStart: filter?.startDate || firstUsed,
      periodEnd: filter?.endDate || lastUsed,
    };
  }

  /**
   * 计算最常用命令
   */
  private calculatePopularCommands(
    executions: CommandExecution[]
  ): CommandFrequency[] {
    const commandMap = new Map<string, CommandFrequency>();

    executions.forEach((exec) => {
      const cmd = exec.userCommand;
      
      if (!commandMap.has(cmd)) {
        commandMap.set(cmd, {
          command: cmd,
          count: 0,
          successCount: 0,
          failureCount: 0,
          avgResponseTime: 0,
        });
      }

      const freq = commandMap.get(cmd)!;
      freq.count++;
      
      if (exec.success) {
        freq.successCount++;
      } else {
        freq.failureCount++;
      }

      // 更新平均响应时间
      freq.avgResponseTime =
        (freq.avgResponseTime * (freq.count - 1) + exec.responseTime) /
        freq.count;
    });

    // 按使用次数排序，返回前10个
    return Array.from(commandMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * 获取空统计数据
   */
  private getEmptyStats(assistantId: string): UsageStats {
    const now = new Date();
    return {
      assistantId,
      totalUses: 0,
      successfulUses: 0,
      failedUses: 0,
      successRate: 0,
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      popularCommands: [],
      lastUsed: now,
      firstUsed: now,
      periodStart: now,
      periodEnd: now,
    };
  }

  /**
   * 更新聚合统计数据
   */
  private async updateAggregatedStats(assistantId: string): Promise<void> {
    const stats = await this.calculateStats(assistantId);
    const db = await this.ensureDB();

    const transaction = db.transaction(
      [USAGE_STATS_STORES.AGGREGATED_STATS],
      'readwrite'
    );
    const store = transaction.objectStore(USAGE_STATS_STORES.AGGREGATED_STATS);

    await new Promise<void>((resolve, reject) => {
      const request = store.put(stats);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取聚合统计数据
   */
  async getAggregatedStats(assistantId: string): Promise<UsageStats | null> {
    const db = await this.ensureDB();
    const transaction = db.transaction(
      [USAGE_STATS_STORES.AGGREGATED_STATS],
      'readonly'
    );
    const store = transaction.objectStore(USAGE_STATS_STORES.AGGREGATED_STATS);

    return new Promise((resolve, reject) => {
      const request = store.get(assistantId);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取时间范围统计
   */
  async getTimeRangeStats(
    assistantId: string,
    range: 'today' | 'week' | 'month' | 'all'
  ): Promise<TimeRangeStats> {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = new Date(0);
        break;
    }

    const stats = await this.calculateStats(assistantId, {
      assistantId,
      startDate,
      endDate,
    });

    return {
      range,
      startDate,
      endDate,
      stats,
    };
  }

  /**
   * 获取统计聚合数据
   */
  async getStatsAggregation(
    assistantId: string,
    filter?: StatsFilter
  ): Promise<StatsAggregation> {
    const executions = await this.getCommandExecutions(assistantId, filter);
    const overall = await this.calculateStats(assistantId, filter);

    // 按日期分组
    const byDate = new Map<string, CommandExecution[]>();
    executions.forEach((exec) => {
      const dateKey = exec.timestamp.toISOString().split('T')[0];
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey)!.push(exec);
    });

    // 按小时分组
    const byHour = new Map<number, CommandExecution[]>();
    executions.forEach((exec) => {
      const hour = exec.timestamp.getHours();
      if (!byHour.has(hour)) {
        byHour.set(hour, []);
      }
      byHour.get(hour)!.push(exec);
    });

    // 计算趋势
    const trends = this.calculateTrends(executions);

    return {
      overall,
      byDate: new Map(
        Array.from(byDate.entries()).map(([date, execs]) => [
          date,
          this.calculateStatsFromExecutions(assistantId, execs),
        ])
      ),
      byHour: new Map(
        Array.from(byHour.entries()).map(([hour, execs]) => [
          hour,
          this.calculateStatsFromExecutions(assistantId, execs),
        ])
      ),
      trends,
    };
  }

  /**
   * 从执行记录计算统计
   */
  private calculateStatsFromExecutions(
    assistantId: string,
    executions: CommandExecution[]
  ): UsageStats {
    if (executions.length === 0) {
      return this.getEmptyStats(assistantId);
    }

    const successfulExecs = executions.filter((e) => e.success);
    const responseTimes = executions.map((e) => e.responseTime);
    const timestamps = executions.map((e) => e.timestamp);

    return {
      assistantId,
      totalUses: executions.length,
      successfulUses: successfulExecs.length,
      failedUses: executions.length - successfulExecs.length,
      successRate: (successfulExecs.length / executions.length) * 100,
      avgResponseTime:
        responseTimes.reduce((sum, time) => sum + time, 0) /
        responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      popularCommands: this.calculatePopularCommands(executions),
      lastUsed: new Date(Math.max(...timestamps.map((t) => t.getTime()))),
      firstUsed: new Date(Math.min(...timestamps.map((t) => t.getTime()))),
      periodStart: new Date(Math.min(...timestamps.map((t) => t.getTime()))),
      periodEnd: new Date(Math.max(...timestamps.map((t) => t.getTime()))),
    };
  }

  /**
   * 计算趋势
   */
  private calculateTrends(executions: CommandExecution[]): {
    usageTrend: number;
    successRateTrend: number;
    responseTimeTrend: number;
  } {
    if (executions.length < 2) {
      return {
        usageTrend: 0,
        successRateTrend: 0,
        responseTimeTrend: 0,
      };
    }

    // 将数据分为前半部分和后半部分
    const midpoint = Math.floor(executions.length / 2);
    const firstHalf = executions.slice(0, midpoint);
    const secondHalf = executions.slice(midpoint);

    // 使用量趋势
    const usageTrend =
      ((secondHalf.length - firstHalf.length) / firstHalf.length) * 100;

    // 成功率趋势
    const firstSuccessRate =
      (firstHalf.filter((e) => e.success).length / firstHalf.length) * 100;
    const secondSuccessRate =
      (secondHalf.filter((e) => e.success).length / secondHalf.length) * 100;
    const successRateTrend = secondSuccessRate - firstSuccessRate;

    // 响应时间趋势
    const firstAvgTime =
      firstHalf.reduce((sum, e) => sum + e.responseTime, 0) / firstHalf.length;
    const secondAvgTime =
      secondHalf.reduce((sum, e) => sum + e.responseTime, 0) /
      secondHalf.length;
    const responseTimeTrend =
      ((secondAvgTime - firstAvgTime) / firstAvgTime) * 100;

    return {
      usageTrend,
      successRateTrend,
      responseTimeTrend,
    };
  }

  /**
   * 清理过期数据
   */
  async cleanup(daysToKeep: number = 90): Promise<void> {
    await cleanupOldStats(daysToKeep);
  }

  /**
   * 导出统计数据
   */
  async exportStats(assistantId: string): Promise<string> {
    const stats = await this.calculateStats(assistantId);
    const executions = await this.getCommandExecutions(assistantId);

    const exportData = {
      stats,
      executions,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 获取所有助理的统计数据
   * 用于管理员查看全局统计
   */
  async getAllAssistantsStats(filter?: StatsFilter): Promise<UsageStats[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(
      [USAGE_STATS_STORES.COMMAND_EXECUTIONS],
      'readonly'
    );
    const store = transaction.objectStore(USAGE_STATS_STORES.COMMAND_EXECUTIONS);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = async () => {
        let executions = request.result as CommandExecution[];

        // 应用过滤器
        if (filter) {
          executions = this.applyFilter(executions, filter);
        }

        // 按助理ID分组
        const assistantMap = new Map<string, CommandExecution[]>();
        executions.forEach((exec) => {
          if (!assistantMap.has(exec.assistantId)) {
            assistantMap.set(exec.assistantId, []);
          }
          assistantMap.get(exec.assistantId)!.push(exec);
        });

        // 计算每个助理的统计
        const allStats: UsageStats[] = [];
        Array.from(assistantMap.entries()).forEach(([assistantId, execs]) => {
          const stats = this.calculateStatsFromExecutions(assistantId, execs);
          allStats.push(stats);
        });

        // 按使用次数排序
        allStats.sort((a, b) => b.totalUses - a.totalUses);
        
        resolve(allStats);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取全局统计摘要
   * 包含所有助理的汇总数据
   */
  async getGlobalStatsSummary(filter?: StatsFilter): Promise<{
    totalAssistants: number;
    totalUses: number;
    totalSuccessfulUses: number;
    totalFailedUses: number;
    overallSuccessRate: number;
    avgResponseTime: number;
    mostUsedAssistant: string | null;
    leastUsedAssistant: string | null;
  }> {
    const allStats = await this.getAllAssistantsStats(filter);

    if (allStats.length === 0) {
      return {
        totalAssistants: 0,
        totalUses: 0,
        totalSuccessfulUses: 0,
        totalFailedUses: 0,
        overallSuccessRate: 0,
        avgResponseTime: 0,
        mostUsedAssistant: null,
        leastUsedAssistant: null,
      };
    }

    const totalUses = allStats.reduce((sum, s) => sum + s.totalUses, 0);
    const totalSuccessfulUses = allStats.reduce((sum, s) => sum + s.successfulUses, 0);
    const totalFailedUses = allStats.reduce((sum, s) => sum + s.failedUses, 0);
    const overallSuccessRate = (totalSuccessfulUses / totalUses) * 100;
    
    // 加权平均响应时间
    const totalResponseTime = allStats.reduce(
      (sum, s) => sum + s.avgResponseTime * s.totalUses,
      0
    );
    const avgResponseTime = totalResponseTime / totalUses;

    const mostUsed = allStats[0]; // 已按使用次数排序
    const leastUsed = allStats[allStats.length - 1];

    return {
      totalAssistants: allStats.length,
      totalUses,
      totalSuccessfulUses,
      totalFailedUses,
      overallSuccessRate,
      avgResponseTime,
      mostUsedAssistant: mostUsed.assistantId,
      leastUsedAssistant: leastUsed.assistantId,
    };
  }
}

// 导出单例实例
export const usageStatsService = new UsageStatsService();
