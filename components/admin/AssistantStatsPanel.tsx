'use client';

/**
 * 助理统计报告面板 - 管理员视图
 * 显示所有助理的使用统计、趋势图表和时间范围筛选
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Spinner,
  Button,
  Chip,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import { usageStatsService } from '@/lib/services/usageStatsService';
import { UsageStats, StatsFilter } from '@/types/usageStats';

interface AssistantStatsPanelProps {
  className?: string;
}

export const AssistantStatsPanel: React.FC<AssistantStatsPanelProps> = ({
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [allStats, setAllStats] = useState<UsageStats[]>([]);
  const [globalSummary, setGlobalSummary] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  // 加载统计数据
  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const filter: StatsFilter = {};
      const now = new Date();

      switch (timeRange) {
        case 'today':
          filter.startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          filter.endDate = now;
          break;
        case 'week':
          filter.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filter.endDate = now;
          break;
        case 'month':
          filter.startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filter.endDate = now;
          break;
        case 'all':
        default:
          // No filter for 'all'
          break;
      }

      const [stats, summary] = await Promise.all([
        usageStatsService.getAllAssistantsStats(filter),
        usageStatsService.getGlobalStatsSummary(filter),
      ]);

      setAllStats(stats);
      setGlobalSummary(summary);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    try {
      const exportData = {
        globalSummary,
        assistantStats: allStats,
        timeRange,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-assistants-stats-${timeRange}-${Date.now()}.json`;
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
          <Button color="primary" variant="flat" onPress={loadStats} className="mt-4">
            重试
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 头部控制栏 */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">助理使用统计报告</h2>
          <div className="flex gap-3 items-center">
            <Select
              size="sm"
              selectedKeys={[timeRange]}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="w-36"
              aria-label="时间范围"
            >
              <SelectItem key="today">今天</SelectItem>
              <SelectItem key="week">最近7天</SelectItem>
              <SelectItem key="month">最近30天</SelectItem>
              <SelectItem key="all">全部时间</SelectItem>
            </Select>
            <Button size="sm" variant="flat" onPress={handleExportAll}>
              导出全部数据
            </Button>
            <Button size="sm" color="primary" onPress={loadStats}>
              刷新
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 全局摘要 */}
      {globalSummary && <GlobalSummaryCard summary={globalSummary} />}

      {/* 详细统计选项卡 */}
      <Card>
        <CardBody>
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            aria-label="统计选项卡"
          >
            <Tab key="overview" title="概览">
              <OverviewTab stats={allStats} />
            </Tab>
            <Tab key="performance" title="性能分析">
              <PerformanceTab stats={allStats} />
            </Tab>
            <Tab key="trends" title="趋势图表">
              <TrendsTab stats={allStats} timeRange={timeRange} />
            </Tab>
            <Tab key="details" title="详细数据">
              <DetailsTab stats={allStats} />
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

/**
 * 全局摘要卡片
 */
const GlobalSummaryCard: React.FC<{ summary: any }> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardBody className="p-4">
          <p className="text-sm text-default-500 mb-1">助理总数</p>
          <p className="text-3xl font-bold">{summary.totalAssistants}</p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4">
          <p className="text-sm text-default-500 mb-1">总使用次数</p>
          <p className="text-3xl font-bold">{summary.totalUses}</p>
          <div className="flex gap-2 mt-2">
            <Chip size="sm" color="success" variant="flat">
              成功 {summary.totalSuccessfulUses}
            </Chip>
            <Chip size="sm" color="danger" variant="flat">
              失败 {summary.totalFailedUses}
            </Chip>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4">
          <p className="text-sm text-default-500 mb-1">整体成功率</p>
          <p className="text-3xl font-bold">{summary.overallSuccessRate.toFixed(1)}%</p>
          <Progress
            value={summary.overallSuccessRate}
            color={
              summary.overallSuccessRate >= 80
                ? 'success'
                : summary.overallSuccessRate >= 60
                ? 'warning'
                : 'danger'
            }
            className="mt-2"
            size="sm"
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4">
          <p className="text-sm text-default-500 mb-1">平均响应时间</p>
          <p className="text-3xl font-bold">
            {summary.avgResponseTime.toFixed(0)}
            <span className="text-lg font-normal text-default-500 ml-1">ms</span>
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

/**
 * 概览选项卡
 */
const OverviewTab: React.FC<{ stats: UsageStats[] }> = ({ stats }) => {
  if (stats.length === 0) {
    return (
      <div className="py-12 text-center text-default-500">暂无统计数据</div>
    );
  }

  // 排序：按使用次数
  const sortedByUsage = [...stats].sort((a, b) => b.totalUses - a.totalUses);
  const top5 = sortedByUsage.slice(0, 5);

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">使用次数排行 Top 5</h3>
        <div className="space-y-3">
          {top5.map((stat, index) => (
            <Card key={stat.assistantId} shadow="sm">
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{stat.assistantId}</p>
                    <div className="flex gap-2 text-xs">
                      <Chip size="sm" variant="flat">
                        {stat.totalUses} 次使用
                      </Chip>
                      <Chip size="sm" color="success" variant="flat">
                        {stat.successRate.toFixed(1)}% 成功率
                      </Chip>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-default-500">平均响应</p>
                    <p className="text-sm font-semibold">
                      {stat.avgResponseTime.toFixed(0)}ms
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 性能分析选项卡
 */
const PerformanceTab: React.FC<{ stats: UsageStats[] }> = ({ stats }) => {
  if (stats.length === 0) {
    return (
      <div className="py-12 text-center text-default-500">暂无统计数据</div>
    );
  }

  // 按响应时间排序
  const sortedBySpeed = [...stats].sort(
    (a, b) => a.avgResponseTime - b.avgResponseTime
  );
  const fastest = sortedBySpeed.slice(0, 5);
  const slowest = sortedBySpeed.slice(-5).reverse();

  // 按成功率排序
  const sortedBySuccess = [...stats].sort((a, b) => b.successRate - a.successRate);
  const mostReliable = sortedBySuccess.slice(0, 5);

  return (
    <div className="space-y-8 py-4">
      {/* 最快响应 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">响应最快的助理</h3>
        <div className="space-y-2">
          {fastest.map((stat) => (
            <PerformanceItem
              key={stat.assistantId}
              assistantId={stat.assistantId}
              value={stat.avgResponseTime.toFixed(0)}
              unit="ms"
              color="success"
            />
          ))}
        </div>
      </div>

      {/* 最慢响应 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">响应最慢的助理</h3>
        <div className="space-y-2">
          {slowest.map((stat) => (
            <PerformanceItem
              key={stat.assistantId}
              assistantId={stat.assistantId}
              value={stat.avgResponseTime.toFixed(0)}
              unit="ms"
              color="danger"
            />
          ))}
        </div>
      </div>

      {/* 最可靠 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">最可靠的助理（成功率）</h3>
        <div className="space-y-2">
          {mostReliable.map((stat) => (
            <PerformanceItem
              key={stat.assistantId}
              assistantId={stat.assistantId}
              value={stat.successRate.toFixed(1)}
              unit="%"
              color="success"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 性能项组件
 */
const PerformanceItem: React.FC<{
  assistantId: string;
  value: string;
  unit: string;
  color: 'success' | 'warning' | 'danger';
}> = ({ assistantId, value, unit, color }) => {
  return (
    <Card shadow="sm">
      <CardBody className="p-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{assistantId}</span>
          <Chip size="sm" color={color} variant="flat">
            {value}
            {unit}
          </Chip>
        </div>
      </CardBody>
    </Card>
  );
};

/**
 * 趋势图表选项卡
 */
const TrendsTab: React.FC<{
  stats: UsageStats[];
  timeRange: string;
}> = ({ stats, timeRange }) => {
  if (stats.length === 0) {
    return (
      <div className="py-12 text-center text-default-500">暂无统计数据</div>
    );
  }

  // 计算趋势数据
  const trendData = useMemo(() => {
    const totalUses = stats.reduce((sum, s) => sum + s.totalUses, 0);
    const avgSuccessRate =
      stats.reduce((sum, s) => sum + s.successRate, 0) / stats.length;
    const avgResponseTime =
      stats.reduce((sum, s) => sum + s.avgResponseTime, 0) / stats.length;

    return {
      totalUses,
      avgSuccessRate,
      avgResponseTime,
    };
  }, [stats]);

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4">
            <p className="text-sm text-default-500 mb-2">总使用量</p>
            <p className="text-3xl font-bold mb-2">{trendData.totalUses}</p>
            <p className="text-xs text-default-400">
              时间范围: {getTimeRangeLabel(timeRange)}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <p className="text-sm text-default-500 mb-2">平均成功率</p>
            <p className="text-3xl font-bold mb-2">
              {trendData.avgSuccessRate.toFixed(1)}%
            </p>
            <Progress
              value={trendData.avgSuccessRate}
              color={
                trendData.avgSuccessRate >= 80
                  ? 'success'
                  : trendData.avgSuccessRate >= 60
                  ? 'warning'
                  : 'danger'
              }
              size="sm"
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <p className="text-sm text-default-500 mb-2">平均响应时间</p>
            <p className="text-3xl font-bold mb-2">
              {trendData.avgResponseTime.toFixed(0)}
              <span className="text-lg font-normal text-default-500 ml-1">ms</span>
            </p>
          </CardBody>
        </Card>
      </div>

      {/* 简单的条形图可视化 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">使用量分布</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {stats.slice(0, 10).map((stat) => {
              const maxUses = Math.max(...stats.map((s) => s.totalUses));
              const percentage = (stat.totalUses / maxUses) * 100;

              return (
                <div key={stat.assistantId}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {stat.assistantId}
                    </span>
                    <span className="text-sm text-default-500">
                      {stat.totalUses} 次
                    </span>
                  </div>
                  <Progress value={percentage} color="primary" size="sm" />
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

/**
 * 详细数据选项卡
 */
const DetailsTab: React.FC<{ stats: UsageStats[] }> = ({ stats }) => {
  if (stats.length === 0) {
    return (
      <div className="py-12 text-center text-default-500">暂无统计数据</div>
    );
  }

  return (
    <div className="py-4">
      <Table aria-label="助理详细统计表">
        <TableHeader>
          <TableColumn>助理ID</TableColumn>
          <TableColumn>使用次数</TableColumn>
          <TableColumn>成功率</TableColumn>
          <TableColumn>平均响应时间</TableColumn>
          <TableColumn>最后使用</TableColumn>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => (
            <TableRow key={stat.assistantId}>
              <TableCell>
                <span className="font-medium">{stat.assistantId}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">{stat.totalUses}</span>
                  <div className="flex gap-1">
                    <Chip size="sm" color="success" variant="flat">
                      {stat.successfulUses}
                    </Chip>
                    <Chip size="sm" color="danger" variant="flat">
                      {stat.failedUses}
                    </Chip>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">
                    {stat.successRate.toFixed(1)}%
                  </span>
                  <Progress
                    value={stat.successRate}
                    color={
                      stat.successRate >= 80
                        ? 'success'
                        : stat.successRate >= 60
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                    className="max-w-[100px]"
                  />
                </div>
              </TableCell>
              <TableCell>
                <span className="font-semibold">
                  {stat.avgResponseTime.toFixed(0)}ms
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-default-500">
                  {stat.lastUsed.toLocaleDateString('zh-CN')}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

/**
 * 获取时间范围标签
 */
function getTimeRangeLabel(range: string): string {
  switch (range) {
    case 'today':
      return '今天';
    case 'week':
      return '最近7天';
    case 'month':
      return '最近30天';
    case 'all':
      return '全部时间';
    default:
      return range;
  }
}
