# 助理快速启动 - 快速参考

## 快速开始

### 1. 激活助理

```typescript
import { useAssistants } from '@/contexts/AssistantContext';

const { activateAssistant } = useAssistants();

// 基本激活
await activateAssistant('assistant-id');

// 完整选项
await activateAssistant('assistant-id', {
  switchToChat: true,   // 切换到聊天界面
  showWelcome: true,    // 显示欢迎消息
});
```

### 2. 显示欢迎消息

```typescript
import { WelcomeMessage } from '@/components/ChatbotChat/WelcomeMessage';
import { useAssistants } from '@/contexts/AssistantContext';

const { activeAssistant } = useAssistants();

<WelcomeMessage
  assistant={activeAssistant}
  onExampleClick={(example) => {
    setInputValue(example);
  }}
/>
```

### 3. 最近使用列表

```typescript
import { recentAssistantsService } from '@/lib/services/recentAssistantsService';

// 获取列表
const recent = recentAssistantsService.getRecentAssistants();

// 获取最近一个
const mostRecent = recentAssistantsService.getMostRecent();

// 检查是否在列表中
const isRecent = recentAssistantsService.isRecent('assistant-id');
```

## API 参考

### activateAssistant()

```typescript
activateAssistant(
  id: string,
  options?: {
    switchToChat?: boolean;
    showWelcome?: boolean;
  }
): Promise<{
  success: boolean;
  assistant?: Assistant;
  error?: string;
}>
```

**参数**:
- `id`: 助理 ID
- `options.switchToChat`: 是否切换到聊天界面（默认 false）
- `options.showWelcome`: 是否显示欢迎消息（默认 false）

**返回值**:
- `success`: 是否成功
- `assistant`: 助理对象（成功时）
- `error`: 错误信息（失败时）

**副作用**:
- 设置活动助理 ID
- 保存到 localStorage
- 记录到最近使用列表
- 更新使用次数（本地状态）
- 触发 `assistant-activated` 事件（如果 switchToChat 为 true）

### WelcomeMessage 组件

```typescript
interface WelcomeMessageProps {
  assistant: Assistant;
  onExampleClick?: (example: string) => void;
}
```

**Props**:
- `assistant`: 要显示的助理对象
- `onExampleClick`: 点击示例命令时的回调

**显示内容**:
- 助理 emoji 和名称
- 欢迎消息
- 快速开始提示
- 示例命令（可点击）

### recentAssistantsService

```typescript
interface RecentAssistant {
  id: string;
  title: string;
  emoji: string;
  lastUsedAt: Date;
}

class RecentAssistantsService {
  // 记录使用
  recordUsage(assistantId: string, title: string, emoji: string): void;
  
  // 获取列表（最多 10 个）
  getRecentAssistants(): RecentAssistant[];
  
  // 清空列表
  clearAll(): void;
  
  // 移除特定助理
  remove(assistantId: string): void;
  
  // 检查是否在列表中
  isRecent(assistantId: string): boolean;
  
  // 获取最近使用的助理
  getMostRecent(): RecentAssistant | null;
}
```

## 事件系统

### assistant-activated 事件

```typescript
// 监听事件
window.addEventListener('assistant-activated', (event: CustomEvent) => {
  const { assistant, showWelcome } = event.detail;
  
  // 处理激活
  setSystemPrompt(assistant.prompt);
  if (showWelcome) {
    setShowWelcome(true);
  }
});

// 触发事件（由 activateAssistant 自动触发）
window.dispatchEvent(new CustomEvent('assistant-activated', {
  detail: {
    assistant: Assistant,
    showWelcome: boolean
  }
}));
```

## 常见用例

### 用例 1: 从市场选择助理

```typescript
const handleSelectAssistant = async (assistant: Assistant) => {
  const result = await activateAssistant(assistant.id, {
    switchToChat: true,
    showWelcome: true,
  });
  
  if (result.success) {
    // 切换视图
    setActiveView('chat');
  }
};
```

### 用例 2: 恢复最近使用的助理

```typescript
useEffect(() => {
  const mostRecent = recentAssistantsService.getMostRecent();
  if (mostRecent) {
    activateAssistant(mostRecent.id);
  }
}, []);
```

### 用例 3: 显示最近使用列表

```typescript
const RecentAssistantsList = () => {
  const recent = recentAssistantsService.getRecentAssistants();
  const { activateAssistant } = useAssistants();
  
  return (
    <div>
      {recent.map(item => (
        <div key={item.id} onClick={() => activateAssistant(item.id)}>
          <span>{item.emoji}</span>
          <span>{item.title}</span>
          <span>{formatDate(item.lastUsedAt)}</span>
        </div>
      ))}
    </div>
  );
};
```

### 用例 4: 自定义欢迎消息

```typescript
// 在助理的 tags 中添加自定义欢迎消息
const assistant = {
  ...otherFields,
  tags: [
    'welcome:欢迎使用我的助理！我可以帮你...',
    'example:示例命令 1',
    'example:示例命令 2',
  ],
};
```

## 数据持久化

### localStorage 键

- `activeAssistantId`: 当前活动助理 ID
- `showWelcomeMessage`: 是否显示欢迎消息
- `recent_assistants`: 最近使用列表（JSON 数组）

### 数据格式

```typescript
// recent_assistants
[
  {
    "id": "assistant-id",
    "title": "助理名称",
    "emoji": "🤖",
    "lastUsedAt": "2024-01-01T00:00:00.000Z"
  },
  // ... 最多 10 个
]
```

## 性能提示

1. **使用次数更新**: 仅更新本地状态，避免 API 调用阻塞
2. **最近使用列表**: 限制为 10 个，避免存储过多数据
3. **事件监听**: 在组件卸载时清理事件监听器
4. **错误处理**: 使用 try-catch 并提供优雅降级

## 故障排除

### 问题: 激活失败

```typescript
const result = await activateAssistant('assistant-id');
if (!result.success) {
  console.error('Activation failed:', result.error);
  // 显示错误提示
  showNotification({
    type: 'error',
    message: result.error || '激活失败',
  });
}
```

### 问题: 欢迎消息不显示

检查:
1. `showWelcome` 选项是否设置为 true
2. 是否正确监听 `assistant-activated` 事件
3. 助理对象是否有效

### 问题: 最近使用列表为空

检查:
1. localStorage 是否可用
2. 是否调用了 `recordUsage()`
3. 浏览器是否清除了 localStorage

## 相关文档

- [完整实现文档](./ASSISTANT_QUICK_LAUNCH_COMPLETE.md)
- [需求文档](../.kiro/specs/preset-assistants-expansion/requirements.md)
- [设计文档](../.kiro/specs/preset-assistants-expansion/design.md)
