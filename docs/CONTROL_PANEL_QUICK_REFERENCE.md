# 控制面板快速参考

## 快速开始

### 基本使用

```typescript
import IntegratedControlPanel from '@/components/workflow/IntegratedControlPanel';

<IntegratedControlPanel
  isCollapsed={false}
  width={360}
  onToggleCollapse={() => setCollapsed(!collapsed)}
  connectionStatus={{
    drone: true,
    websocket: true,
    lastUpdate: new Date(),
  }}
  workflowStatus={{
    isRunning: false,
    progress: 0,
  }}
  logs={logs}
  results={results}
  onRun={handleRun}
  onStop={handleStop}
  onSave={handleSave}
  onClear={handleClear}
  onClearLogs={() => setLogs([])}
/>
```

## 组件列表

| 组件 | 用途 | 文件 |
|------|------|------|
| IntegratedControlPanel | 完整集成的控制面板 | `IntegratedControlPanel.tsx` |
| ControlPanelHeader | 连接状态头部 | `ControlPanelHeader.tsx` |
| ActionButtons | 操作按钮组 | `ActionButtons.tsx` |
| OutputTabs | 输出标签页 | `OutputTabs.tsx` |
| LogList | 日志列表 | `LogList.tsx` |
| ResultList | 结果列表 | `ResultList.tsx` |
| LogExportButtons | 日志导出按钮 | `LogExportButtons.tsx` |

## 数据类型

### ConnectionStatus
```typescript
interface ConnectionStatus {
  drone: boolean;          // 无人机连接状态
  websocket: boolean;      // WebSocket连接状态
  lastUpdate: Date;        // 最后更新时间
}
```

### WorkflowStatus
```typescript
interface WorkflowStatus {
  isRunning: boolean;      // 是否正在运行
  currentNode?: string;    // 当前执行节点
  progress: number;        // 执行进度 (0-100)
  startTime?: Date;        // 开始时间
}
```

### LogEntry
```typescript
interface LogEntry {
  id: string;                                    // 唯一ID
  timestamp: Date;                               // 时间戳
  level: 'info' | 'warning' | 'error' | 'success'; // 日志级别
  message: string;                               // 日志消息
  nodeId?: string;                               // 节点ID（可选）
}
```

### ResultEntry
```typescript
interface ResultEntry {
  id: string;              // 唯一ID
  nodeId: string;          // 节点ID
  nodeName: string;        // 节点名称
  result: any;             // 结果数据
  resultType: string;      // 结果类型
  timestamp: Date;         // 时间戳
}
```

## 常见操作

### 添加日志
```typescript
const addLog = (level: LogEntry['level'], message: string, nodeId?: string) => {
  setLogs(prev => [...prev, {
    id: `log-${Date.now()}`,
    timestamp: new Date(),
    level,
    message,
    nodeId,
  }]);
};

// 使用示例
addLog('info', '工作流开始执行');
addLog('success', '节点执行成功', 'node-1');
addLog('error', '节点执行失败', 'node-2');
```

### 添加结果
```typescript
const addResult = (nodeId: string, nodeName: string, result: any, resultType: string) => {
  setResults(prev => [...prev, {
    id: `result-${Date.now()}`,
    nodeId,
    nodeName,
    result,
    resultType,
    timestamp: new Date(),
  }]);
};

// 使用示例
addResult('node-1', '起飞节点', { altitude: 100 }, 'object');
addResult('node-2', '检测节点', 'detection_result.jpg', 'image');
```

### 更新连接状态
```typescript
const updateConnectionStatus = (drone: boolean, websocket: boolean) => {
  setConnectionStatus({
    drone,
    websocket,
    lastUpdate: new Date(),
  });
};

// 使用示例
updateConnectionStatus(true, true);  // 全部连接
updateConnectionStatus(false, true); // 无人机断开
```

### 控制工作流
```typescript
const handleRun = () => {
  setWorkflowStatus({
    isRunning: true,
    progress: 0,
    startTime: new Date(),
  });
  // 执行工作流逻辑
};

const handleStop = () => {
  setWorkflowStatus({
    isRunning: false,
    progress: 0,
  });
  // 停止工作流逻辑
};
```

## 样式定制

### 修改面板宽度
```typescript
// 默认宽度
const DEFAULT_WIDTH = 360;

// 最小/最大宽度
const MIN_WIDTH = 280;
const MAX_WIDTH = 500;

// 使用自定义宽度
<IntegratedControlPanel width={400} ... />
```

### 主题切换
控制面板自动适配系统主题，使用 `useWorkflowTheme` Hook：

```typescript
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';

const { theme, toggleTheme } = useWorkflowTheme();
// theme: 'light' | 'dark'
```

## 日志级别颜色

| 级别 | 颜色 | 用途 |
|------|------|------|
| info | 蓝色 (#3b82f6) | 一般信息 |
| success | 绿色 (#10b981) | 成功操作 |
| warning | 橙色 (#f59e0b) | 警告信息 |
| error | 红色 (#ef4444) | 错误信息 |

## 结果类型

| 类型 | 图标 | 颜色 | 说明 |
|------|------|------|------|
| string | 文本 | 蓝色 | 字符串数据 |
| number | 123 | 绿色 | 数字数据 |
| boolean | ✓ | 紫色 | 布尔值 |
| object | {} | 橙色 | 对象数据 |
| array | [] | 橙色 | 数组数据 |
| image | 图片 | 粉色 | 图像数据 |
| video | 视频 | 青色 | 视频数据 |

## 性能优化

### 虚拟滚动
日志列表在超过50条时自动启用虚拟滚动：

```typescript
<LogList
  logs={logs}
  enableVirtualScroll={true}  // 手动启用
  maxLogs={1000}              // 最大显示数量
/>
```

### 限制日志数量
```typescript
// 只保留最新的1000条日志
const MAX_LOGS = 1000;

const addLog = (log: LogEntry) => {
  setLogs(prev => {
    const newLogs = [...prev, log];
    return newLogs.slice(-MAX_LOGS);
  });
};
```

## 导出功能

### 导出格式

**JSON格式**:
```json
[
  {
    "id": "log-1",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "level": "info",
    "message": "工作流开始执行",
    "nodeId": "node-1"
  }
]
```

**TXT格式**:
```
2024-01-01T12:00:00.000Z INFO     [node-1] 工作流开始执行
2024-01-01T12:00:01.000Z SUCCESS  [node-2] 节点执行成功
```

### 自定义导出
```typescript
import { exportLogsAsJSON, exportLogsAsTXT } from '@/components/workflow/LogExportButtons';

// 导出日志
exportLogsAsJSON(logs);
exportLogsAsTXT(logs);
```

## 响应式断点

| 设备 | 宽度 | 行为 |
|------|------|------|
| 桌面 | ≥1024px | 固定侧边栏 |
| 平板 | 768-1023px | 缩小侧边栏 |
| 移动 | <768px | 抽屉式弹出 |

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl/Cmd + R | 运行工作流 |
| Ctrl/Cmd + S | 保存工作流 |
| Esc | 折叠面板 |

## 常见问题

### Q: 如何清空日志？
A: 使用 `onClearLogs` 回调或点击清空按钮。

### Q: 日志不自动滚动？
A: 检查 `autoScroll` 属性是否为 `true`，或者用户是否手动滚动了列表。

### Q: 如何自定义按钮？
A: 使用 `onLoad` 和 `onAIGenerate` 等可选回调来添加自定义按钮。

### Q: 如何处理大量日志？
A: 启用虚拟滚动并限制最大日志数量。

## 最佳实践

1. **日志管理**: 定期清理旧日志，避免内存占用过大
2. **状态更新**: 使用防抖/节流优化频繁的状态更新
3. **错误处理**: 为所有操作添加错误处理和用户反馈
4. **性能监控**: 监控日志数量和渲染性能
5. **用户体验**: 提供清晰的状态反馈和操作提示

## 相关文档

- [完整实现文档](./TASK_6_CONTROL_PANEL_REDESIGN_COMPLETE.md)
- [设计文档](../.kiro/specs/workflow-ui-redesign/design.md)
- [需求文档](../.kiro/specs/workflow-ui-redesign/requirements.md)
