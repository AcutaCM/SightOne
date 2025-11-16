# Tello 错误处理 - 快速参考

## 快速导航

- [WebSocket 错误](#websocket-错误)
- [AI 解析错误](#ai-解析错误)
- [命令执行错误](#命令执行错误)
- [常见问题](#常见问题)

## WebSocket 错误

### 错误类型

| 错误类型 | 描述 | 可重试 | 建议 |
|---------|------|--------|------|
| CONNECTION_FAILED | 连接失败 | ✅ | 检查后端服务是否运行 |
| CONNECTION_TIMEOUT | 连接超时 | ✅ | 检查网络连接 |
| CONNECTION_CLOSED | 连接关闭 | ✅ | 点击重连按钮 |
| MESSAGE_SEND_FAILED | 消息发送失败 | ✅ | 检查连接状态 |
| NETWORK_ERROR | 网络错误 | ✅ | 检查网络设置 |

### 快速使用

```typescript
import { WebSocketErrorHandler } from '@/lib/errors/telloWebSocketErrors';

const handler = new WebSocketErrorHandler();

// 处理错误
const error = handler.handleError(event, '连接');

// 自动重连
await handler.attemptReconnect(connectFn, onSuccess, onFailure);

// 取消重连
handler.cancelReconnect();
```

### 自动重连配置

```typescript
{
  maxRetries: 5,           // 最大重试次数
  initialDelay: 1000,      // 初始延迟 (ms)
  maxDelay: 30000,         // 最大延迟 (ms)
  backoffMultiplier: 2     // 退避倍数
}
```

## AI 解析错误

### 错误类型

| 错误类型 | 描述 | 可重试 | 建议 |
|---------|------|--------|------|
| API_KEY_MISSING | API Key 未配置 | ❌ | 前往设置配置 API Key |
| API_KEY_INVALID | API Key 无效 | ❌ | 检查 API Key 是否正确 |
| API_REQUEST_FAILED | API 请求失败 | ✅ | 检查网络连接 |
| API_RATE_LIMIT | 请求频率超限 | ✅ | 等待几分钟后重试 |
| API_TIMEOUT | 响应超时 | ✅ | 检查网络连接 |
| RESPONSE_PARSE_FAILED | 响应解析失败 | ✅ | 重新描述指令 |
| EMPTY_INPUT | 输入为空 | ❌ | 输入飞行指令 |
| AMBIGUOUS_INPUT | 输入不明确 | ✅ | 更详细地描述 |
| UNSAFE_COMMAND | 不安全的命令 | ❌ | 使用安全的指令 |

### 快速使用

```typescript
import { AIParserErrorHandler } from '@/lib/errors/telloAIParserErrors';

// 验证输入
const validation = AIParserErrorHandler.validateInput(input);

// 处理错误
const error = AIParserErrorHandler.handleError(err, input);

// 获取建议
const suggestions = AIParserErrorHandler.getInputSuggestions(error);

// 获取示例
const examples = AIParserErrorHandler.getExampleInputs();
```

### 示例输入

```
✅ 起飞
✅ 向前飞50厘米
✅ 顺时针旋转90度
✅ 起飞,向前飞100厘米,然后降落
```

## 命令执行错误

### 错误类型

| 错误类型 | 描述 | 严重程度 | 可重试 | 建议 |
|---------|------|----------|--------|------|
| COMMAND_TIMEOUT | 命令超时 | medium | ✅ | 检查无人机连接 |
| COMMAND_REJECTED | 命令被拒绝 | high | ❌ | 检查命令是否安全 |
| DRONE_NOT_CONNECTED | 未连接 | high | ✅ | 点击连接按钮 |
| DRONE_NOT_READY | 未就绪 | medium | ✅ | 等待初始化完成 |
| LOW_BATTERY | 电量不足 | critical | ❌ | 立即降落并充电 |
| INVALID_STATE | 状态无效 | medium | ❌ | 检查当前状态 |
| PARAMETER_OUT_OF_RANGE | 参数超范围 | low | ❌ | 检查参数值 |
| EMERGENCY_STOP | 紧急停止 | critical | ❌ | 检查无人机状态 |
| HARDWARE_ERROR | 硬件错误 | critical | ❌ | 检查硬件 |

### 快速使用

```typescript
import { CommandExecutionErrorHandler } from '@/lib/errors/telloCommandExecutionErrors';

const handler = new CommandExecutionErrorHandler();

// 开始记录
const logId = handler.startExecution('takeoff', {});

// 完成记录
handler.completeExecution(logId, success, result, error);

// 获取日志
const logs = handler.getExecutionLogs(10);

// 获取统计
const stats = handler.getErrorStatistics();
```

### 参数范围

```
距离: 20-500 厘米
角度: 1-360 度
```

## UI 组件

### TelloErrorDisplay

```tsx
<TelloErrorDisplay
  error={currentError}
  onRetry={() => {/* 重试逻辑 */}}
  onDismiss={() => setCurrentError(null)}
  showSuggestions={true}
/>
```

### 错误颜色

- 🔵 低严重度 (low) - 蓝色
- 🟡 中严重度 (medium) - 黄色
- 🔴 高严重度 (high) - 红色
- 🔴 严重 (critical) - 红色

## 常见问题

### Q: 如何启用自动重连?

A: 自动重连默认启用,在 WebSocket 关闭时自动触发。

```typescript
ws.onclose = () => {
  if (wsErrorHandlerRef.current.getRetryCount() < 5) {
    wsErrorHandlerRef.current.attemptReconnect(
      connectToDroneBackend,
      onSuccess,
      onFailure
    );
  }
};
```

### Q: 如何自定义重连配置?

A: 在创建 WebSocketErrorHandler 时传入配置:

```typescript
const handler = new WebSocketErrorHandler({
  maxRetries: 10,
  initialDelay: 2000,
  maxDelay: 60000,
  backoffMultiplier: 1.5
});
```

### Q: 如何显示错误?

A: 使用 `currentError` 状态和 `TelloErrorDisplay` 组件:

```typescript
const [currentError, setCurrentError] = useState(null);

// 设置错误
setCurrentError(error);

// 显示错误
{currentError && (
  <TelloErrorDisplay
    error={currentError}
    onDismiss={() => setCurrentError(null)}
  />
)}
```

### Q: 如何导出执行日志?

A: 使用 CommandExecutionErrorHandler 的导出功能:

```typescript
const json = cmdErrorHandlerRef.current.exportExecutionLogs();
console.log(json);

// 或下载为文件
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'execution-logs.json';
a.click();
```

### Q: 如何清除错误?

A: 调用 `setCurrentError(null)`:

```typescript
// 手动清除
setCurrentError(null);

// 成功后自动清除
if (result.success) {
  setCurrentError(null);
}
```

## 调试技巧

### 1. 查看控制台日志

所有错误都会记录到控制台:

```
[WebSocket Error] CONNECTION_FAILED: 连接失败
[AI Parser Error] API_KEY_MISSING: API Key 未配置
[Command Execution Error] COMMAND_TIMEOUT: 命令超时
```

### 2. 检查错误对象

```typescript
console.log('错误类型:', error.type);
console.log('错误消息:', error.message);
console.log('可重试:', error.retryable);
console.log('时间戳:', error.timestamp);
```

### 3. 查看执行日志

```typescript
const logs = cmdErrorHandlerRef.current.getExecutionLogs();
console.table(logs);
```

### 4. 查看错误统计

```typescript
const stats = cmdErrorHandlerRef.current.getErrorStatistics();
console.log('总错误数:', stats.total);
console.log('成功率:', stats.successRate);
console.log('按类型:', stats.byType);
console.log('按严重程度:', stats.bySeverity);
```

## 相关文档

- [完整文档](./TELLO_ERROR_HANDLING_COMPLETE.md)
- [视觉指南](./TELLO_ERROR_HANDLING_VISUAL_GUIDE.md)
- [需求文档](../.kiro/specs/tello-purechat-integration/requirements.md)
- [设计文档](../.kiro/specs/tello-purechat-integration/design.md)

## 快速链接

- [WebSocket 错误处理器](../lib/errors/telloWebSocketErrors.ts)
- [AI 解析错误处理器](../lib/errors/telloAIParserErrors.ts)
- [命令执行错误处理器](../lib/errors/telloCommandExecutionErrors.ts)
- [错误显示组件](../components/ChatbotChat/TelloErrorDisplay.tsx)
- [主组件](../components/ChatbotChat/TelloIntelligentAgentChat.tsx)
