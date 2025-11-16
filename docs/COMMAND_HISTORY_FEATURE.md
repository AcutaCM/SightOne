# Tello 命令历史记录功能

## 概述

命令历史记录功能允许用户查看、管理和重新执行之前发送给 Tello 无人机的命令。所有命令都会自动保存到本地存储,最多保存 100 条记录。

## 功能特性

### 1. 自动保存命令历史

- ✅ 每次生成命令时自动保存到历史记录
- ✅ 记录用户输入、生成的命令序列和执行状态
- ✅ 自动限制历史记录数量(最多 100 条)
- ✅ 使用 localStorage 持久化存储

### 2. 命令历史面板

#### 打开方式
- 点击输入框左侧的历史图标按钮 (📜)

#### 面板功能
- **搜索**: 按用户输入或命令动作搜索历史记录
- **过滤**: 按执行状态过滤(全部/成功/失败/待执行/已取消)
- **统计**: 显示总计、成功、失败的命令数量
- **导出**: 将历史记录导出为 JSON 文件
- **导入**: 从 JSON 文件导入历史记录
- **清空**: 清空所有历史记录

### 3. 历史记录项显示

每条历史记录包含:
- 📝 用户输入的自然语言指令
- 🎯 生成的命令序列
- ✅/❌ 执行状态(成功/失败/待执行/已取消)
- ⏰ 时间戳(相对时间显示)
- ⚠️ 错误信息(如果执行失败)

### 4. 重新执行命令

- 点击历史记录项的"重新执行"按钮
- 系统会创建新的历史记录项(标记为"[重新执行]")
- 命令会被加载到待执行队列
- 用户需要确认后才会执行

## 技术实现

### CommandHistoryService

位置: `lib/services/commandHistoryService.ts`

#### 核心方法

```typescript
// 保存命令到历史记录
CommandHistoryService.saveCommand({
  userInput: string,
  commands: DroneCommand[],
  executionStatus: 'pending' | 'success' | 'failed' | 'cancelled'
})

// 更新命令执行状态
CommandHistoryService.updateCommandStatus(
  id: string,
  status: 'success' | 'failed' | 'cancelled',
  results?: any[],
  error?: string
)

// 获取所有历史记录
CommandHistoryService.getHistory()

// 获取最近的历史记录
CommandHistoryService.getRecentHistory(limit: number)

// 搜索历史记录
CommandHistoryService.searchHistory(query: string)

// 按状态过滤
CommandHistoryService.filterByStatus(status)

// 获取统计信息
CommandHistoryService.getStatistics()

// 导出/导入
CommandHistoryService.exportHistory()
CommandHistoryService.importHistory(jsonData: string)

// 删除和清空
CommandHistoryService.deleteHistoryItem(id: string)
CommandHistoryService.clearHistory()
```

### CommandHistoryPanel 组件

位置: `components/ChatbotChat/CommandHistoryPanel.tsx`

#### Props

```typescript
interface CommandHistoryPanelProps {
  isOpen: boolean;                    // 是否打开面板
  onClose: () => void;                // 关闭回调
  onReExecute?: (                     // 重新执行回调
    commands: DroneCommand[], 
    userInput: string
  ) => void;
}
```

#### 特性

- 使用 HeroUI Modal 组件
- 响应式设计,支持移动端
- 虚拟滚动优化(处理大量历史记录)
- 实时搜索和过滤
- 状态标签页切换

### TelloIntelligentAgentChat 集成

#### 自动保存流程

1. 用户发送自然语言指令
2. AI 解析生成命令序列
3. **自动保存到历史记录**(状态: pending)
4. 用户确认执行
5. 执行命令序列
6. **更新历史记录状态**(success/failed)

#### 取消执行

- 用户点击"取消"按钮
- **更新历史记录状态为 cancelled**

#### 重新执行

- 用户从历史面板选择命令
- 创建新的历史记录项(标记为"[重新执行]")
- 加载命令到待执行队列

## 数据结构

### CommandHistoryItem

```typescript
interface CommandHistoryItem {
  id: string;                         // 唯一标识符
  timestamp: Date;                    // 时间戳
  userInput: string;                  // 用户输入
  commands: DroneCommand[];           // 命令序列
  executionStatus: 'pending' | 'success' | 'failed' | 'cancelled';
  executionResults?: any[];           // 执行结果
  error?: string;                     // 错误信息
}
```

### 存储格式

- **存储位置**: localStorage
- **存储键**: `tello-command-history`
- **格式**: JSON 数组
- **最大数量**: 100 条

## 使用示例

### 基本使用

```typescript
import { CommandHistoryService } from '@/lib/services/commandHistoryService';

// 保存命令
const historyItem = CommandHistoryService.saveCommand({
  userInput: '起飞并向前飞50厘米',
  commands: [
    { action: 'takeoff', params: {} },
    { action: 'move_forward', params: { distance: 50 } }
  ],
  executionStatus: 'pending'
});

// 更新状态
CommandHistoryService.updateCommandStatus(
  historyItem.id,
  'success',
  [{ success: true }, { success: true }]
);

// 获取历史记录
const history = CommandHistoryService.getHistory();

// 搜索
const results = CommandHistoryService.searchHistory('起飞');

// 获取统计
const stats = CommandHistoryService.getStatistics();
console.log(`总计: ${stats.total}, 成功: ${stats.success}`);
```

### 在组件中使用

```typescript
import CommandHistoryPanel from '@/components/ChatbotChat/CommandHistoryPanel';

function MyComponent() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleReExecute = (commands, userInput) => {
    console.log('重新执行:', userInput, commands);
    // 执行命令逻辑
  };

  return (
    <>
      <Button onPress={() => setIsHistoryOpen(true)}>
        查看历史
      </Button>

      <CommandHistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onReExecute={handleReExecute}
      />
    </>
  );
}
```

## 性能优化

### 1. 本地存储优化

- 使用 JSON.stringify/parse 进行序列化
- 自动限制历史记录数量(100 条)
- 错误处理和降级策略

### 2. UI 优化

- 虚拟滚动(处理大量记录)
- 防抖搜索(避免频繁渲染)
- 懒加载历史记录(仅在打开面板时加载)

### 3. 内存管理

- 及时清理过期数据
- 避免内存泄漏
- 使用 useCallback 优化回调函数

## 安全考虑

### 1. 数据验证

- 导入时验证数据结构
- 防止恶意数据注入
- 限制历史记录大小

### 2. 隐私保护

- 数据仅存储在本地
- 不上传到服务器
- 用户可随时清空历史

### 3. 错误处理

- localStorage 不可用时的降级处理
- 数据损坏时的恢复机制
- 友好的错误提示

## 未来改进

### 计划功能

- [ ] 云端同步(可选)
- [ ] 历史记录分组(按日期/项目)
- [ ] 命令收藏功能
- [ ] 批量操作(批量删除/导出)
- [ ] 历史记录分析(统计图表)
- [ ] 命令模板功能
- [ ] 历史记录备份提醒

### 性能优化

- [ ] IndexedDB 替代 localStorage(支持更大容量)
- [ ] Web Worker 处理大量数据
- [ ] 增量加载历史记录
- [ ] 压缩存储数据

## 故障排除

### 问题: 历史记录不保存

**原因**: localStorage 被禁用或已满

**解决方案**:
1. 检查浏览器设置,启用 localStorage
2. 清理浏览器缓存
3. 清空部分历史记录

### 问题: 导入失败

**原因**: JSON 格式错误或数据结构不匹配

**解决方案**:
1. 验证 JSON 文件格式
2. 确保数据结构完整
3. 使用导出功能生成正确格式的示例

### 问题: 重新执行失败

**原因**: 无人机未连接或命令参数无效

**解决方案**:
1. 确保无人机已连接
2. 检查命令参数是否在有效范围内
3. 查看错误日志获取详细信息

## 相关文件

- `lib/services/commandHistoryService.ts` - 历史记录服务
- `components/ChatbotChat/CommandHistoryPanel.tsx` - 历史面板组件
- `components/ChatbotChat/TelloIntelligentAgentChat.tsx` - 主聊天组件(集成历史功能)

## 参考资料

- [Requirements: 6.1, 6.2, 6.3, 6.4](../../.kiro/specs/tello-purechat-integration/requirements.md)
- [Design Document](../../.kiro/specs/tello-purechat-integration/design.md)
- [Task List](../../.kiro/specs/tello-purechat-integration/tasks.md)
