# 使用统计管理面板 - 快速参考

## 快速开始

### 1. 导入组件

```typescript
import { AssistantStatsPanel } from '@/components/admin/AssistantStatsPanel';
```

### 2. 使用组件

```typescript
<AssistantStatsPanel />
```

## 核心功能

### 📊 全局摘要
- 助理总数
- 总使用次数
- 整体成功率
- 平均响应时间

### 📈 四个选项卡

1. **概览** - 使用次数 Top 5
2. **性能分析** - 最快/最慢/最可靠助理
3. **趋势图表** - 使用量分布可视化
4. **详细数据** - 完整统计表格

### ⏱️ 时间范围筛选
- 今天
- 最近7天
- 最近30天
- 全部时间

### 💾 数据导出
- 导出 JSON 格式
- 包含所有助理统计

## API 快速参考

### usageStatsService

```typescript
// 获取所有助理统计
const stats = await usageStatsService.getAllAssistantsStats({
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
});

// 获取全局摘要
const summary = await usageStatsService.getGlobalStatsSummary({
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
});
```

## 组件属性

```typescript
interface AssistantStatsPanelProps {
  className?: string;  // 可选的 CSS 类名
}
```

## 使用示例

### 基础使用

```typescript
export default function AdminPage() {
  return (
    <div className="p-6">
      <AssistantStatsPanel />
    </div>
  );
}
```

### 自定义样式

```typescript
<AssistantStatsPanel className="shadow-lg rounded-xl" />
```

## 数据结构

### UsageStats

```typescript
interface UsageStats {
  assistantId: string;
  totalUses: number;
  successfulUses: number;
  failedUses: number;
  successRate: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  popularCommands: CommandFrequency[];
  lastUsed: Date;
  firstUsed: Date;
  periodStart: Date;
  periodEnd: Date;
}
```

### GlobalSummary

```typescript
interface GlobalSummary {
  totalAssistants: number;
  totalUses: number;
  totalSuccessfulUses: number;
  totalFailedUses: number;
  overallSuccessRate: number;
  avgResponseTime: number;
  mostUsedAssistant: string | null;
  leastUsedAssistant: string | null;
}
```

## 常见任务

### 查看特定时间段统计

1. 点击时间范围下拉菜单
2. 选择所需时间范围
3. 数据自动刷新

### 导出统计数据

1. 点击"导出全部数据"按钮
2. 选择保存位置
3. 文件格式: JSON

### 查看详细数据

1. 切换到"详细数据"选项卡
2. 查看完整统计表格
3. 包含所有助理的详细指标

## 性能指标说明

### 响应速度评分
- < 1000ms: 100分 (优秀)
- < 2000ms: 90分 (良好)
- < 3000ms: 75分 (一般)
- < 5000ms: 60分 (较慢)
- ≥ 5000ms: 40分 (慢)

### 稳定性评分
基于响应时间的方差计算：
- 方差比 < 0.5: 100分
- 方差比 < 1.0: 85分
- 方差比 < 2.0: 70分
- 方差比 < 3.0: 55分
- 方差比 ≥ 3.0: 40分

### 可靠性评分
基于成功率：
- ≥ 80%: 优秀 (绿色)
- ≥ 60%: 良好 (黄色)
- < 60%: 需改进 (红色)

## 故障排除

### 数据不显示
```typescript
// 检查是否有数据
const stats = await usageStatsService.getAllAssistantsStats();
console.log('Stats count:', stats.length);
```

### 刷新数据
点击右上角的"刷新"按钮

### 清除缓存
```typescript
// 在浏览器控制台执行
indexedDB.deleteDatabase('intelligent-agent-usage-stats');
```

## 键盘快捷键

- `Tab` - 切换选项卡
- `Enter` - 选择/确认
- `Esc` - 关闭下拉菜单

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 相关文档

- [完整实现指南](./USAGE_STATS_ADMIN_PANEL_GUIDE.md)
- [使用统计服务文档](./USAGE_STATS_GUIDE.md)
- [API 参考](./USAGE_STATS_API_REFERENCE.md)

## 技术栈

- React 18
- TypeScript
- HeroUI (UI 组件)
- IndexedDB (数据存储)

## 更新历史

- **v1.0.0** (2024-01-XX) - 初始版本
  - 全局统计摘要
  - 四个分析选项卡
  - 时间范围筛选
  - 数据导出功能
