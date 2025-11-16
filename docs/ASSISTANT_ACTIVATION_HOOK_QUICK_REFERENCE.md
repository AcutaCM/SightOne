# useAssistantActivation Hook - 快速参考

## 导入

```typescript
import { useAssistantActivation } from '@/hooks/useAssistantActivation';
```

## 基本用法

```typescript
const { isAdded, isAdding, error, addAssistant, clearError } = 
  useAssistantActivation(assistant);
```

## 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| `isAdded` | `boolean` | 助手是否已添加到用户列表 |
| `isAdding` | `boolean` | 是否正在执行添加操作 |
| `error` | `string \| null` | 错误信息（如果有） |
| `addAssistant` | `() => Promise<void>` | 添加助手到列表的方法 |
| `clearError` | `() => void` | 清除错误状态的方法 |

## 完整示例

```typescript
import { useAssistantActivation } from '@/hooks/useAssistantActivation';
import { Button } from 'antd';

function AssistantActivationButton({ assistant }) {
  const { 
    isAdded, 
    isAdding, 
    error, 
    addAssistant, 
    clearError 
  } = useAssistantActivation(assistant);

  return (
    <div>
      <Button
        type="primary"
        size="large"
        loading={isAdding}
        disabled={isAdded}
        onClick={addAssistant}
      >
        {isAdding ? '添加中...' : isAdded ? '已添加' : '使用该助手进行聊天'}
      </Button>
      
      {error && (
        <div className="error-message">
          {error}
          <Button size="small" onClick={clearError}>关闭</Button>
        </div>
      )}
    </div>
  );
}
```

## 状态流程

```
初始化
  ↓
检查是否已添加 (isAssistantAdded)
  ↓
用户点击添加按钮
  ↓
isAdding = true
  ↓
调用 userAssistantService.addAssistant()
  ↓
成功？
  ├─ 是 → isAdded = true, 显示成功提示, 触发全局事件
  └─ 否 → error = 错误信息, 显示错误提示
  ↓
isAdding = false
```

## 事件监听

Hook 会触发全局事件，其他组件可以监听：

```typescript
useEffect(() => {
  const handleUpdate = (event: CustomEvent) => {
    console.log('Assistant added:', event.detail.assistantId);
    // 刷新列表或执行其他操作
  };

  window.addEventListener('userAssistantsUpdated', handleUpdate);
  
  return () => {
    window.removeEventListener('userAssistantsUpdated', handleUpdate);
  };
}, []);
```

## 错误处理

Hook 会自动处理以下错误：

1. **重复添加**: 显示 "该助手已在您的列表中"
2. **存储空间不足**: 显示 "存储空间不足，请清理部分助手后重试"
3. **其他错误**: 显示具体错误消息或 "添加失败"

## 用户反馈

### 成功提示
- 消息：'助手已添加到列表'
- 持续时间：3 秒
- 类型：success

### 错误提示
- 消息：具体错误信息
- 类型：error

### 信息提示
- 消息：'该助手已在您的列表中'（当已添加时点击）
- 类型：info

## 注意事项

1. **自动检测**: Hook 会在初始化时自动检测助手是否已添加
2. **防重复**: 如果助手已添加，点击按钮只会显示提示，不会重复添加
3. **全局事件**: 添加成功后会触发 `userAssistantsUpdated` 事件
4. **错误恢复**: 错误发生后，可以使用 `clearError()` 清除错误状态

## 依赖服务

- `userAssistantService`: 处理实际的添加逻辑和存储
- `antd message`: 显示用户反馈消息

## TypeScript 类型

```typescript
interface UseAssistantActivationReturn {
  isAdded: boolean;
  isAdding: boolean;
  error: string | null;
  addAssistant: () => Promise<void>;
  clearError: () => void;
}
```

## 相关文档

- [User Assistant Service](../lib/services/userAssistantService.ts)
- [Assistant Types](../types/assistant.ts)
- [Task 2 完成报告](./TASK_2_ASSISTANT_ACTIVATION_HOOK_COMPLETE.md)
