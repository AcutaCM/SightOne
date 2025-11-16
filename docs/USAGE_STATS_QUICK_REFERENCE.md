# 使用统计快速参考

## 快速开始

### 1. 记录命令执行

```typescript
import { useStatsTracking } from '@/hooks/useUsageStats';

const { recordExecution } = useStatsTracking('tello-intelligent-agent');

// 记录成功执行
await recordExecution(
  '起飞并向前飞50厘米',  // 用户命令
  ['takeoff', 'move_forward'],  // 解析的命令
  true,  // 成功
  1250   // 响应时间(ms)
);

// 记录失败执行
await recordExecution(
  '起飞',
  [],
  false,
  800,
  'AI服务不可用'  // 错误信息
);
```

### 2. 显示统计面板

```typescript
import { UsageStatsPanel } from '@/components/UsageStatsPanel';

<UsageStatsPanel assistantId="tello-intelligent-agent" />
```

### 3. 使用统计Hook

```typescript
import { useUsageStats } from '@/hooks/useUsageStats';

const { stats, loading, refresh, exportStats } = useUsageStats({
  assistantId: 'tello-intelligent-agent',
  autoLoad: true,
  defaultTimeRange: 'week'
});
```

## 核心API

### 记录执行

```typescript
usageStatsService.recordCommandExecution(
  assistantId: string,
  userCommand: string,
  parsedCommands: string[],
  success: boolean,
  responseTime: number,
  error?: string
)
```

### 获取统计

```typescript
// 时间范围统计
const stats = await usageStatsService.getTimeRangeStats(
  'tello-intelligent-agent',
  'week'  // 'today' | 'week' | 'month' | 'all'
);

// 聚合统计
const aggregated = await usageStatsService.getAggregatedStats(
  'tello-intelligent-agent'
);
```

### 导出数据

```typescript
const jsonData = await usageStatsService.exportStats(
  'tello-intelligent-agent'
);
```

### 清理数据

```typescript
// 清理90天前的数据
await usageStatsService.cleanup(90);
```

## 数据结构

### UsageStats

```typescript
{
  assistantId: string;
  totalUses: number;
  successfulUses: number;
  failedUses: number;
  successRate: number;  // 百分比
  avgResponseTime: number;  // 毫秒
  minResponseTime: number;
  maxResponseTime: number;
  popularCommands: CommandFrequency[];
  lastUsed: Date;
  firstUsed: Date;
  periodStart: Date;
  periodEnd: Date;
}
```

### CommandFrequency

```typescript
{
  command: string;
  count: number;
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
}
```

## 时间范围

| 范围 | 说明 |
|------|------|
| `today` | 当天 |
| `week` | 最近7天 |
| `month` | 最近30天 |
| `all` | 全部历史 |

## 性能评分

### 响应速度

- 🟢 优秀: < 2秒 (90-100分)
- 🟡 良好: 2-5秒 (60-90分)
- 🔴 需改进: > 5秒 (< 60分)

### 稳定性

基于响应时间变异系数：

- 🟢 稳定: 变异 < 1.0 (85-100分)
- 🟡 一般: 变异 1.0-3.0 (55-85分)
- 🔴 不稳定: 变异 > 3.0 (< 55分)

### 可靠性

- 🟢 可靠: 成功率 ≥ 80%
- 🟡 一般: 成功率 60-80%
- 🔴 需改进: 成功率 < 60%

## 常见用例

### 在命令执行中集成

```typescript
async function executeCommand(userCommand: string) {
  const startTime = Date.now();
  const { recordExecution } = useStatsTracking('tello-intelligent-agent');
  
  try {
    const result = await droneControl.execute(userCommand);
    await recordExecution(
      userCommand,
      result.commands,
      true,
      Date.now() - startTime
    );
    return result;
  } catch (error) {
    await recordExecution(
      userCommand,
      [],
      false,
      Date.now() - startTime,
      error.message
    );
    throw error;
  }
}
```

### 显示统计摘要

```typescript
function StatsSummary({ assistantId }: { assistantId: string }) {
  const { stats, loading } = useUsageStats({ assistantId });
  
  if (loading || !stats) return null;
  
  return (
    <div>
      <p>使用次数: {stats.totalUses}</p>
      <p>成功率: {stats.successRate.toFixed(1)}%</p>
      <p>平均响应: {stats.avgResponseTime.toFixed(0)}ms</p>
    </div>
  );
}
```

### 导出统计报告

```typescript
async function exportReport() {
  const { exportStats } = useUsageStats({
    assistantId: 'tello-intelligent-agent'
  });
  
  try {
    await exportStats();
    console.log('统计数据已导出');
  } catch (error) {
    console.error('导出失败:', error);
  }
}
```

## 访问统计页面

导航到 `/stats` 查看完整的统计报告界面。

## 故障排查

| 问题 | 解决方案 |
|------|----------|
| 数据不显示 | 检查IndexedDB、刷新页面 |
| 统计不准确 | 验证记录调用、检查时间范围 |
| 性能慢 | 清理历史数据、减少查询范围 |
| 导出失败 | 检查浏览器权限、控制台错误 |

## 相关文档

- [完整使用指南](./USAGE_STATS_GUIDE.md)
- [智能代理设置](./INTELLIGENT_AGENT_PRESET_SERVICE.md)
- [API参考](./USAGE_STATS_GUIDE.md#api参考)
