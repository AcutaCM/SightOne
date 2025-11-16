# 使用统计管理面板 - 实现指南

## 概述

本文档描述了任务 7 "使用统计和分析" 的实现，包括使用统计服务的扩展和管理员统计报告面板的创建。

## 实现内容

### 任务 7.1: 实现使用统计服务

**文件**: `lib/services/usageStatsService.ts`

#### 新增方法

1. **`getAllAssistantsStats(filter?: StatsFilter): Promise<UsageStats[]>`**
   - 获取所有助理的统计数据
   - 支持时间范围过滤
   - 按使用次数排序
   - 用于管理员查看全局统计

2. **`getGlobalStatsSummary(filter?: StatsFilter): Promise<GlobalSummary>`**
   - 获取全局统计摘要
   - 包含所有助理的汇总数据
   - 返回以下指标：
     - 助理总数
     - 总使用次数
     - 总成功/失败次数
     - 整体成功率
     - 平均响应时间
     - 最常用/最少用助理

#### 使用示例

```typescript
import { usageStatsService } from '@/lib/services/usageStatsService';

// 获取所有助理的统计
const allStats = await usageStatsService.getAllAssistantsStats({
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
});

// 获取全局摘要
const summary = await usageStatsService.getGlobalStatsSummary({
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
});

console.log(`总共有 ${summary.totalAssistants} 个助理`);
console.log(`总使用次数: ${summary.totalUses}`);
console.log(`整体成功率: ${summary.overallSuccessRate.toFixed(1)}%`);
```

### 任务 7.2: 创建统计报告组件

**文件**: `components/admin/AssistantStatsPanel.tsx`

#### 组件功能

1. **全局摘要卡片**
   - 显示助理总数
   - 显示总使用次数（成功/失败）
   - 显示整体成功率
   - 显示平均响应时间

2. **概览选项卡**
   - 使用次数排行 Top 5
   - 显示每个助理的使用次数、成功率和响应时间

3. **性能分析选项卡**
   - 响应最快的助理 Top 5
   - 响应最慢的助理 Top 5
   - 最可靠的助理 Top 5（按成功率）

4. **趋势图表选项卡**
   - 总使用量统计
   - 平均成功率
   - 平均响应时间
   - 使用量分布条形图

5. **详细数据选项卡**
   - 完整的助理统计表格
   - 包含所有助理的详细数据

#### 时间范围筛选

支持以下时间范围：
- 今天
- 最近7天
- 最近30天
- 全部时间

#### 数据导出

支持导出所有助理的统计数据为 JSON 格式。

## 使用方法

### 在管理员页面中使用

```typescript
import { AssistantStatsPanel } from '@/components/admin/AssistantStatsPanel';

export default function AdminStatsPage() {
  return (
    <div className="container mx-auto p-6">
      <AssistantStatsPanel />
    </div>
  );
}
```

### 在现有管理页面中集成

```typescript
import { AssistantStatsPanel } from '@/components/admin/AssistantStatsPanel';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1>管理员仪表板</h1>
      
      {/* 其他管理功能 */}
      
      {/* 使用统计面板 */}
      <AssistantStatsPanel className="mt-8" />
    </div>
  );
}
```

## 组件结构

```
AssistantStatsPanel
├── GlobalSummaryCard (全局摘要)
├── Tabs (选项卡容器)
│   ├── OverviewTab (概览)
│   ├── PerformanceTab (性能分析)
│   ├── TrendsTab (趋势图表)
│   └── DetailsTab (详细数据)
└── 控制栏
    ├── 时间范围选择器
    ├── 导出按钮
    └── 刷新按钮
```

## 数据流

```
用户选择时间范围
    ↓
触发 loadStats()
    ↓
调用 usageStatsService.getAllAssistantsStats(filter)
调用 usageStatsService.getGlobalStatsSummary(filter)
    ↓
更新组件状态
    ↓
渲染统计数据和图表
```

## 性能优化

1. **数据缓存**: 使用 IndexedDB 缓存统计数据
2. **懒加载**: 选项卡内容按需渲染
3. **防抖**: 时间范围切换使用防抖避免频繁请求
4. **虚拟滚动**: 详细数据表格支持大量数据

## 样式和主题

组件使用 HeroUI 组件库，支持：
- 深色/浅色主题自动切换
- 响应式布局（移动端、平板、桌面）
- 无障碍访问（ARIA 标签）

## 扩展建议

### 添加更多图表类型

```typescript
// 可以集成 recharts 或 chart.js
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const UsageTrendChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="uses" stroke="#8884d8" />
    </LineChart>
  );
};
```

### 添加实时更新

```typescript
// 使用 WebSocket 或轮询实现实时更新
useEffect(() => {
  const interval = setInterval(() => {
    loadStats();
  }, 30000); // 每30秒刷新一次

  return () => clearInterval(interval);
}, []);
```

### 添加导出为 CSV

```typescript
const handleExportCSV = () => {
  const csv = allStats.map(stat => 
    `${stat.assistantId},${stat.totalUses},${stat.successRate},${stat.avgResponseTime}`
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  // ... 下载逻辑
};
```

## 测试

### 单元测试示例

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { AssistantStatsPanel } from '@/components/admin/AssistantStatsPanel';

describe('AssistantStatsPanel', () => {
  it('should load and display stats', async () => {
    render(<AssistantStatsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('助理使用统计报告')).toBeInTheDocument();
    });
  });

  it('should filter by time range', async () => {
    render(<AssistantStatsPanel />);
    
    // 选择时间范围
    const select = screen.getByLabelText('时间范围');
    fireEvent.change(select, { target: { value: 'today' } });
    
    await waitFor(() => {
      // 验证数据已更新
    });
  });
});
```

## 故障排除

### 问题：统计数据不显示

**解决方案**:
1. 检查 IndexedDB 是否正常工作
2. 确认有使用记录数据
3. 查看浏览器控制台错误信息

### 问题：导出功能不工作

**解决方案**:
1. 检查浏览器是否支持 Blob API
2. 确认没有弹窗拦截
3. 检查文件下载权限

### 问题：性能问题

**解决方案**:
1. 限制显示的数据量
2. 使用虚拟滚动
3. 添加分页功能

## 相关文件

- `lib/services/usageStatsService.ts` - 使用统计服务
- `lib/db/usageStatsSchema.ts` - 数据库模式
- `types/usageStats.ts` - 类型定义
- `components/UsageStatsPanel.tsx` - 单个助理统计面板
- `components/admin/AssistantStatsPanel.tsx` - 管理员统计面板

## 需求映射

本实现满足以下需求：

- ✅ **Requirement 9.1**: 记录每个助理的使用次数
- ✅ **Requirement 9.2**: 记录每个助理的平均使用时长
- ✅ **Requirement 9.3**: 记录每个助理的用户评分
- ✅ **Requirement 9.4**: 提供使用统计报告界面
- ✅ **Requirement 9.5**: 支持按时间范围筛选统计数据

## 更新日志

### 2024-01-XX
- ✅ 实现 `getAllAssistantsStats()` 方法
- ✅ 实现 `getGlobalStatsSummary()` 方法
- ✅ 创建 `AssistantStatsPanel` 组件
- ✅ 添加全局摘要卡片
- ✅ 添加概览、性能、趋势、详细数据选项卡
- ✅ 实现时间范围筛选
- ✅ 实现数据导出功能
