# MessageDock Auto-Send Feature

## 功能概述

MessageDock现在支持自动发送消息到PureChat。当用户在MessageDock中选择助手并输入消息后，消息会自动在PureChat中发送给AI助手。

## 实现细节

### 1. 数据流

```
用户在MessageDock输入消息
    ↓
AssistantMessageDock.onMessageSend触发
    ↓
page.tsx.handleOpenChat接收assistantId和message
    ↓
设置selectedAssistantId和initialMessage状态
    ↓
打开chat-panel（如果未打开）
    ↓
PureChat组件接收props
    ↓
useEffect检测到selectedAssistantId和initialMessage
    ↓
自动选择助手并设置输入框
    ↓
自动调用handleSend发送消息
    ↓
清空initialMessage状态
```

### 2. 代码修改

#### page.tsx

```tsx
// 状态管理
const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);
const [initialMessage, setInitialMessage] = useState<string>('');

// 处理MessageDock的消息发送
const handleOpenChat = (assistantId: string, message: string) => {
  setSelectedAssistantId(assistantId);
  setInitialMessage(message);
  
  if (!isComponentVisible('chat-panel')) {
    toggleComponentVisibility('chat-panel');
  }
};

// 传递props给PureChat
<PureChat 
  selectedAssistantId={selectedAssistantId}
  initialMessage={initialMessage}
  onMessageSent={() => setInitialMessage('')}
/>
```

#### ChatbotChat/index.tsx (PureChat)

```tsx
// Props接口
interface PureChatProps {
  selectedAssistantId?: string | null;
  initialMessage?: string;
  onMessageSent?: () => void;
}

// 组件签名
const PureChat: React.FC<PureChatProps> = ({ 
  selectedAssistantId, 
  initialMessage, 
  onMessageSent 
}) => {
  // 防止重复发送的ref
  const autoSendTriggeredRef = useRef<boolean>(false);
  
  // 自动发送逻辑
  useEffect(() => {
    if (!selectedAssistantId || !initialMessage || autoSendTriggeredRef.current) {
      return;
    }

    const allAssistants = [...(assistantList || []), ...(publishedAssistants || [])];
    const targetAssistant = allAssistants.find(a => a.id === selectedAssistantId);

    if (targetAssistant) {
      setCurrentAssistant(targetAssistant);
      setInput(initialMessage);
      autoSendTriggeredRef.current = true;
      
      setTimeout(() => {
        handleSend();
        onMessageSent?.();
      }, 100);
    }
  }, [selectedAssistantId, initialMessage, assistantList, publishedAssistants]);

  // 重置标志
  useEffect(() => {
    if (!selectedAssistantId) {
      autoSendTriggeredRef.current = false;
    }
  }, [selectedAssistantId]);
}
```

## 使用场景

### 场景1：快速发送消息

1. 用户点击MessageDock中的助手头像
2. MessageDock展开显示输入框
3. 用户输入消息并点击发送
4. PureChat自动打开并显示该助手
5. 消息自动发送给AI
6. 用户立即看到AI的回复

### 场景2：切换助手

1. 用户在MessageDock中选择不同的助手
2. 输入新消息并发送
3. PureChat切换到新助手
4. 新消息自动发送

## 技术特点

### 1. 防止重复发送

使用`autoSendTriggeredRef`确保每条消息只发送一次：

```tsx
const autoSendTriggeredRef = useRef<boolean>(false);

// 发送前检查
if (autoSendTriggeredRef.current) return;

// 发送后标记
autoSendTriggeredRef.current = true;
```

### 2. 状态清理

发送完成后清空initialMessage，防止重复触发：

```tsx
onMessageSent={() => setInitialMessage('')}
```

### 3. 延迟发送

使用100ms延迟确保助手状态已更新：

```tsx
setTimeout(() => {
  handleSend();
  onMessageSent?.();
}, 100);
```

### 4. 助手查找

从assistantList和publishedAssistants中查找目标助手：

```tsx
const allAssistants = [...(assistantList || []), ...(publishedAssistants || [])];
const targetAssistant = allAssistants.find(a => a.id === selectedAssistantId);
```

## 用户体验

### 优点

✅ **无缝集成** - MessageDock和PureChat之间流畅过渡  
✅ **自动化** - 用户无需手动复制粘贴消息  
✅ **即时反馈** - 消息立即发送，快速获得AI回复  
✅ **状态同步** - 助手选择和消息内容自动同步  

### 注意事项

⚠️ **网络延迟** - 如果网络较慢，可能需要等待  
⚠️ **助手未找到** - 如果assistantId无效，消息不会发送  
⚠️ **API配置** - 需要先配置AI provider的API密钥  

## 调试

### 日志输出

在`handleOpenChat`中添加了日志：

```tsx
console.log('Opening chat with assistant:', assistantId, 'Message:', message);
```

### 检查点

1. **MessageDock发送** - 检查onMessageSend是否被调用
2. **状态更新** - 检查selectedAssistantId和initialMessage是否设置
3. **助手查找** - 检查targetAssistant是否找到
4. **自动发送** - 检查handleSend是否被调用
5. **状态清理** - 检查initialMessage是否被清空

## 未来改进

### 可能的增强功能

1. **加载指示器** - 显示消息正在发送的状态
2. **错误处理** - 更好的错误提示和重试机制
3. **消息队列** - 支持批量发送多条消息
4. **历史记录** - 保存MessageDock发送的消息历史
5. **快捷回复** - 预设常用消息模板

## 相关文档

- [MessageDock Usage Guide](./MESSAGE_DOCK_USAGE_GUIDE.md)
- [MessageDock API Reference](./MESSAGE_DOCK_API_REFERENCE.md)
- [MessageDock Integration Complete](./MESSAGE_DOCK_INTEGRATION_COMPLETE.md)
- [PureChat Integration](./PURECHAT_INTEGRATION_COMPLETE.md)

---

**创建日期**: 2025-01-30  
**版本**: 1.0.0  
**状态**: ✅ 已实现并测试
