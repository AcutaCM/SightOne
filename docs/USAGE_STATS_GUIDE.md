# 使用统计功能指南

## 概述

使用统计功能为智能代理助理提供了全面的使用数据分析，帮助管理员了解用户行为、优化功能和提升用户体验。

## 功能特性

### 1. 数据收集

系统自动收集以下数据：

- **命令执行记录**
  - 用户输入的自然语言命令
  - 解析后的命令列表
  - 执行成功/失败状态
  - 响应时间
  - 错误信息（如果失败）
  - 执行时间戳

- **聚合统计**
  - 总使用次数
  - 成功/失败次数
  - 成功率
  - 平均响应时间
  - 最快/最慢响应时间
  - 最常用命令列表

### 2. 统计报告

#### 概览选项卡

显示助理的整体使用情况：

- **使用次数**: 总使用次数、成功次数、失败次数
- **成功率**: 以百分比和进度条形式显示
- **使用时间**: 首次使用和最后使用时间

#### 常用命令选项卡

显示最常用的10个命令：

- 命令文本
- 使用次数
- 成功/失败次数
- 平均响应时间
- 成功率进度条

#### 性能选项卡

显示性能指标：

- **响应时间**: 平均、最快、最慢
- **性能评级**:
  - 响应速度评分
  - 稳定性评分
  - 可靠性评分

### 3. 时间范围筛选

支持以下时间范围：

- **今天**: 当天的统计数据
- **最近7天**: 过去一周的数据
- **最近30天**: 过去一个月的数据
- **全部**: 所有历史数据

### 4. 数据导出

支持将统计数据导出为JSON格式，包含：

- 聚合统计数据
- 详细的命令执行记录
- 导出时间戳

## 使用方法

### 在代码中记录命令执行

```typescript
import { useStatsTracking } from '@/hooks/useUsageStats';

function MyComponent() {
  const { recordExecution } = useStatsTracking('tello-intelligent-agent');

  const handleCommand = async (userCommand: string) => {
    const startTime = Date.now();
    
    try {
      // 执行命令
      const result = await executeCommand(userCommand);
      const responseTime = Date.now() - startTime;
      
      // 记录成功执行
      await recordExecution(
        userCommand,
        result.parsedCommands,
        true,
        responseTime
      );
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // 记录失败执行
      await recordExecution(
        userCommand,
        [],
        false,
        responseTime,
        error.message
      );
    }
  };
}
```

### 显示统计面板

```typescript
import { UsageStatsPanel } from '@/components/UsageStatsPanel';

function StatsView() {
  return (
    <UsageStatsPanel 
      assistantId="tello-intelligent-agent"
      className="w-full"
    />
  );
}
```

### 使用统计Hook

```typescript
import { useUsageStats } from '@/hooks/useUsageStats';

function StatsComponent() {
  const {
    stats,
    loading,
    error,
    timeRange,
    setTimeRange,
    recordExecution,
    refresh,
    exportStats,
  } = useUsageStats({
    assistantId: 'tello-intelligent-agent',
    autoLoad: true,
    defaultTimeRange: 'week',
  });

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!stats) return <div>暂无数据</div>;

  return (
    <div>
      <h2>总使用次数: {stats.totalUses}</h2>
      <p>成功率: {stats.successRate.toFixed(1)}%</p>
      <button onClick={refresh}>刷新</button>
      <button onClick={exportStats}>导出</button>
    </div>
  );
}
```

## 数据存储

### IndexedDB结构

统计数据存储在浏览器的IndexedDB中：

**数据库名称**: `intelligent-agent-usage-stats`

**存储对象**:

1. **command_executions** - 命令执行记录
   - 主键: `id`
   - 索引:
     - `assistantId` - 按助理ID查询
     - `timestamp` - 按时间查询
     - `success` - 按成功状态查询
     - `[assistantId, timestamp]` - 复合索引

2. **aggregated_stats** - 聚合统计数据
   - 主键: `assistantId`
   - 索引:
     - `assistantId` - 唯一索引
     - `periodStart` - 按周期开始时间查询

### 数据清理

系统会自动清理90天前的数据，可以通过以下方式手动清理：

```typescript
import { usageStatsService } from '@/lib/services/usageStatsService';

// 清理90天前的数据
await usageStatsService.cleanup(90);

// 清理30天前的数据
await usageStatsService.cleanup(30);
```

## 性能评分算法

### 响应速度评分

- < 1秒: 100分
- < 2秒: 90分
- < 3秒: 75分
- < 5秒: 60分
- ≥ 5秒: 40分

### 稳定性评分

基于响应时间的变异系数：

```
变异系数 = (最大响应时间 - 最小响应时间) / 平均响应时间
```

- 变异系数 < 0.5: 100分
- 变异系数 < 1.0: 85分
- 变异系数 < 2.0: 70分
- 变异系数 < 3.0: 55分
- 变异系数 ≥ 3.0: 40分

### 可靠性评分

直接使用成功率作为评分。

## API参考

### UsageStatsService

```typescript
class UsageStatsService {
  // 记录命令执行
  recordCommandExecution(
    assistantId: string,
    userCommand: string,
    parsedCommands: string[],
    success: boolean,
    responseTime: number,
    error?: string
  ): Promise<void>

  // 获取命令执行记录
  getCommandExecutions(
    assistantId: string,
    filter?: StatsFilter
  ): Promise<CommandExecution[]>

  // 计算统计数据
  calculateStats(
    assistantId: string,
    filter?: StatsFilter
  ): Promise<UsageStats>

  // 获取时间范围统计
  getTimeRangeStats(
    assistantId: string,
    range: 'today' | 'week' | 'month' | 'all'
  ): Promise<TimeRangeStats>

  // 获取聚合统计
  getStatsAggregation(
    assistantId: string,
    filter?: StatsFilter
  ): Promise<StatsAggregation>

  // 导出统计数据
  exportStats(assistantId: string): Promise<string>

  // 清理过期数据
  cleanup(daysToKeep?: number): Promise<void>
}
```

## 最佳实践

### 1. 及时记录

在命令执行后立即记录统计数据，确保数据的准确性。

### 2. 错误处理

记录失败的命令执行时，包含详细的错误信息，便于问题排查。

### 3. 性能优化

- 使用异步记录，不阻塞主流程
- 定期清理过期数据
- 使用聚合统计减少计算开销

### 4. 数据隐私

- 不记录敏感的用户信息
- 定期清理历史数据
- 导出数据时注意权限控制

## 故障排查

### 统计数据不显示

1. 检查IndexedDB是否可用
2. 检查浏览器控制台是否有错误
3. 尝试刷新页面
4. 清除浏览器缓存

### 数据不准确

1. 确认命令执行时正确调用了记录方法
2. 检查时间范围筛选是否正确
3. 验证数据库中的原始记录

### 性能问题

1. 清理过期的历史数据
2. 减少查询的时间范围
3. 使用聚合统计而不是实时计算

## 未来改进

- [ ] 添加图表可视化
- [ ] 支持自定义时间范围
- [ ] 添加趋势分析
- [ ] 支持多助理对比
- [ ] 添加实时统计更新
- [ ] 支持数据备份和恢复
