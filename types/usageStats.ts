/**
 * 使用统计数据类型定义
 * 用于记录智能代理助理的使用情况
 */

/**
 * 命令执行记录
 */
export interface CommandExecution {
  /** 命令ID */
  id: string;
  /** 助理ID */
  assistantId: string;
  /** 用户输入的自然语言命令 */
  userCommand: string;
  /** 解析后的命令列表 */
  parsedCommands: string[];
  /** 执行是否成功 */
  success: boolean;
  /** 错误信息（如果失败） */
  error?: string;
  /** 响应时间（毫秒） */
  responseTime: number;
  /** 执行时间戳 */
  timestamp: Date;
}

/**
 * 使用统计数据
 */
export interface UsageStats {
  /** 助理ID */
  assistantId: string;
  /** 总使用次数 */
  totalUses: number;
  /** 成功执行次数 */
  successfulUses: number;
  /** 失败执行次数 */
  failedUses: number;
  /** 成功率（百分比） */
  successRate: number;
  /** 平均响应时间（毫秒） */
  avgResponseTime: number;
  /** 最快响应时间（毫秒） */
  minResponseTime: number;
  /** 最慢响应时间（毫秒） */
  maxResponseTime: number;
  /** 最常用的命令列表 */
  popularCommands: CommandFrequency[];
  /** 最后使用时间 */
  lastUsed: Date;
  /** 首次使用时间 */
  firstUsed: Date;
  /** 统计周期开始时间 */
  periodStart: Date;
  /** 统计周期结束时间 */
  periodEnd: Date;
}

/**
 * 命令使用频率
 */
export interface CommandFrequency {
  /** 命令文本 */
  command: string;
  /** 使用次数 */
  count: number;
  /** 成功次数 */
  successCount: number;
  /** 失败次数 */
  failureCount: number;
  /** 平均响应时间（毫秒） */
  avgResponseTime: number;
}

/**
 * 时间范围统计
 */
export interface TimeRangeStats {
  /** 时间范围标识 */
  range: 'today' | 'week' | 'month' | 'all' | 'custom';
  /** 开始时间 */
  startDate: Date;
  /** 结束时间 */
  endDate: Date;
  /** 统计数据 */
  stats: UsageStats;
}

/**
 * 统计数据过滤器
 */
export interface StatsFilter {
  /** 助理ID */
  assistantId?: string;
  /** 开始时间 */
  startDate?: Date;
  /** 结束时间 */
  endDate?: Date;
  /** 是否只包含成功的执行 */
  successOnly?: boolean;
  /** 最小响应时间 */
  minResponseTime?: number;
  /** 最大响应时间 */
  maxResponseTime?: number;
}

/**
 * 统计数据聚合结果
 */
export interface StatsAggregation {
  /** 总统计 */
  overall: UsageStats;
  /** 按日期分组的统计 */
  byDate: Map<string, UsageStats>;
  /** 按小时分组的统计 */
  byHour: Map<number, UsageStats>;
  /** 趋势数据 */
  trends: {
    /** 使用量趋势（增长/下降百分比） */
    usageTrend: number;
    /** 成功率趋势 */
    successRateTrend: number;
    /** 响应时间趋势 */
    responseTimeTrend: number;
  };
}
