'use client';

/**
 * 使用统计面板组件
 * 显示智能代理助理的使用统计数据
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Progress,
  Chip,
  Button,
  Select,
  SelectItem,
  Spinner,
} from '@heroui/react';
import { usageStatsService } from '@/lib/services/usageStatsService';
import { UsageStats, TimeRangeStats, CommandFrequency } from '@/types/usageStats';

interface UsageStatsPanelProps {
  assistantId: string;
  className?: string;
}

export const UsageStatsPanel: React.FC<UsageStatsPanelProps> = ({
  assistantId,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [error, setError] = useState<string | null>(null);

  // 加载统计数据
  useEffect(() => {
    loadStats();
  }, [assistantId, timeRange]);

  const loadStats = async () => {
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
      setError('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
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
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-default-500">加载统计数据...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center py-12">
          <p className="text-danger">{error}</p>
          <Button
            color="primary"
            variant="flat"
            onPress={loadStats}
            className="mt-4"
          >
            重试
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center py-12">
          <p className="text-default-500">暂无统计数据</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">使用统计</h3>
        <div className="flex gap-2 items-center">
          <Select
            size="sm"
            selectedKeys={[timeRange]}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="w-32"
            aria-label="时间范围"
          >
            <SelectItem key="today">
              今天
            </SelectItem>
            <SelectItem key="week">
              最近7天
            </SelectItem>
            <SelectItem key="month">
              最近30天
            </SelectItem>
            <SelectItem key="all">
              全部
            </SelectItem>
          </Select>
          <Button
            size="sm"
            variant="flat"
            onPress={handleExport}
          >
            导出数据
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <Tabs aria-label="统计选项卡">
          <Tab key="overview" title="概览">
            <OverviewTab stats={stats} />
          </Tab>
          <Tab key="commands" title="常用命令">
            <CommandsTab commands={stats.popularCommands} />
          </Tab>
          <Tab key="performance" title="性能">
            <PerformanceTab stats={stats} />
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
};

/**
 * 概览选项卡
 */
const OverviewTab: React.FC<{ stats: UsageStats }> = ({ stats }) => {
  return (
    <div className="space-y-6 py-4">
      {/* 使用次数 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">总使用次数</span>
          <span className="text-2xl font-bold">{stats.totalUses}</span>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Chip size="sm" color="success" variant="flat">
              成功 {stats.successfulUses}
            </Chip>
          </div>
          <div className="flex items-center gap-2">
            <Chip size="sm" color="danger" variant="flat">
              失败 {stats.failedUses}
            </Chip>
          </div>
        </div>
      </div>

      {/* 成功率 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">成功率</span>
          <span className="text-lg font-semibold">
            {stats.successRate.toFixed(1)}%
          </span>
        </div>
        <Progress
          value={stats.successRate}
          color={stats.successRate >= 80 ? 'success' : stats.successRate >= 60 ? 'warning' : 'danger'}
          className="max-w-full"
        />
      </div>

      {/* 使用时间 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-default-500 mb-1">首次使用</p>
          <p className="text-sm font-medium">
            {stats.firstUsed.toLocaleDateString('zh-CN')}
          </p>
        </div>
        <div>
          <p className="text-sm text-default-500 mb-1">最后使用</p>
          <p className="text-sm font-medium">
            {stats.lastUsed.toLocaleDateString('zh-CN')}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * 常用命令选项卡
 */
const CommandsTab: React.FC<{ commands: CommandFrequency[] }> = ({ commands }) => {
  if (commands.length === 0) {
    return (
      <div className="py-8 text-center text-default-500">
        暂无命令使用记录
      </div>
    );
  }

  return (
    <div className="space-y-3 py-4">
      {commands.map((cmd, index) => (
        <Card key={index} shadow="sm">
          <CardBody className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">{cmd.command}</p>
                <div className="flex gap-2 text-xs">
                  <Chip size="sm" variant="flat">
                    使用 {cmd.count} 次
                  </Chip>
                  <Chip size="sm" color="success" variant="flat">
                    成功 {cmd.successCount}
                  </Chip>
                  {cmd.failureCount > 0 && (
                    <Chip size="sm" color="danger" variant="flat">
                      失败 {cmd.failureCount}
                    </Chip>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-default-500">平均响应</p>
                <p className="text-sm font-semibold">
                  {cmd.avgResponseTime.toFixed(0)}ms
                </p>
              </div>
            </div>
            <Progress
              value={(cmd.successCount / cmd.count) * 100}
              color="success"
              size="sm"
              className="mt-2"
            />
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

/**
 * 性能选项卡
 */
const PerformanceTab: React.FC<{ stats: UsageStats }> = ({ stats }) => {
  return (
    <div className="space-y-6 py-4">
      {/* 平均响应时间 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">平均响应时间</span>
          <span className="text-2xl font-bold">
            {stats.avgResponseTime.toFixed(0)}
            <span className="text-sm font-normal text-default-500 ml-1">ms</span>
          </span>
        </div>
        <div className="flex justify-between text-xs text-default-500 mt-2">
          <span>最快: {stats.minResponseTime.toFixed(0)}ms</span>
          <span>最慢: {stats.maxResponseTime.toFixed(0)}ms</span>
        </div>
      </div>

      {/* 性能评级 */}
      <div>
        <p className="text-sm font-medium mb-3">性能评级</p>
        <div className="space-y-2">
          <PerformanceMetric
            label="响应速度"
            value={getResponseSpeedScore(stats.avgResponseTime)}
            color={getResponseSpeedColor(stats.avgResponseTime)}
          />
          <PerformanceMetric
            label="稳定性"
            value={getStabilityScore(stats)}
            color={getStabilityColor(stats)}
          />
          <PerformanceMetric
            label="可靠性"
            value={stats.successRate}
            color={stats.successRate >= 80 ? 'success' : stats.successRate >= 60 ? 'warning' : 'danger'}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * 性能指标组件
 */
const PerformanceMetric: React.FC<{
  label: string;
  value: number;
  color: 'success' | 'warning' | 'danger';
}> = ({ label, value, color }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-semibold">{value.toFixed(0)}%</span>
      </div>
      <Progress value={value} color={color} size="sm" />
    </div>
  );
};

/**
 * 计算响应速度评分
 */
function getResponseSpeedScore(avgTime: number): number {
  if (avgTime < 1000) return 100;
  if (avgTime < 2000) return 90;
  if (avgTime < 3000) return 75;
  if (avgTime < 5000) return 60;
  return 40;
}

/**
 * 获取响应速度颜色
 */
function getResponseSpeedColor(avgTime: number): 'success' | 'warning' | 'danger' {
  if (avgTime < 2000) return 'success';
  if (avgTime < 5000) return 'warning';
  return 'danger';
}

/**
 * 计算稳定性评分
 */
function getStabilityScore(stats: UsageStats): number {
  const timeVariance = stats.maxResponseTime - stats.minResponseTime;
  const avgTime = stats.avgResponseTime;
  
  if (avgTime === 0) return 100;
  
  const varianceRatio = timeVariance / avgTime;
  
  if (varianceRatio < 0.5) return 100;
  if (varianceRatio < 1) return 85;
  if (varianceRatio < 2) return 70;
  if (varianceRatio < 3) return 55;
  return 40;
}

/**
 * 获取稳定性颜色
 */
function getStabilityColor(stats: UsageStats): 'success' | 'warning' | 'danger' {
  const score = getStabilityScore(stats);
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
}
