# 助手切换功能快速参考

## 快速测试

### 1. 激活并切换助手
```
1. 打开助手市场
2. 浏览助手并点击查看详情
3. 点击"使用该助手进行聊天"按钮
4. 在成功对话框中点击"立即开始聊天"
5. ✅ 应该切换到聊天界面并显示该助手的欢迎消息
```

### 2. 验证欢迎消息
```
1. 切换到新助手
2. ✅ 应该看到助手的欢迎消息
3. ✅ 如果助手有 prompt，应该使用 prompt 作为欢迎消息
4. ✅ 长 prompt 应该被智能截取
```

### 3. 验证使用时间更新
```
1. 打开浏览器开发者工具
2. 切换到 Application > Local Storage
3. 查看 user_assistants 键
4. ✅ lastUsedAt 应该是当前时间
5. ✅ usageCount 应该增加 1
```

---

## 事件流程图

```
用户点击"使用该助手进行聊天"
         ↓
AssistantActivationButton 添加助手
         ↓
显示成功对话框
         ↓
用户点击"立即开始聊天"
         ↓
触发 switchToAssistant 事件
         ↓
ChatbotChat 接收事件
         ↓
查找目标助手
         ↓
更新 currentAssistant
         ↓
切换到聊天视图
         ↓
更新使用时间
         ↓
显示欢迎消息
```

---

## 代码示例

### 触发切换事件
```typescript
// 在 AssistantActivationButton 中
window.dispatchEvent(new CustomEvent('switchToAssistant', {
  detail: { assistantId: assistant.id }
}));
```

### 监听切换事件
```typescript
// 在 ChatbotChat 中
useEffect(() => {
  const handleSwitchToAssistant = (event: Event) => {
    const { assistantId } = (event as CustomEvent).detail;
    // 执行切换逻辑...
  };
  
  window.addEventListener('switchToAssistant', handleSwitchToAssistant);
  return () => window.removeEventListener('switchToAssistant', handleSwitchToAssistant);
}, [userAssistants]);
```

### 显示欢迎消息
```typescript
// 优先级: 自定义 > prompt > 预定义 > 默认
const ensureOpeningForAssistant = (title: string, assistant?: Assistant) => {
  let opening = customOpening;
  if (!opening && assistant?.prompt) {
    opening = assistant.prompt.length < 200 
      ? assistant.prompt 
      : assistant.prompt.split('\n')[0].substring(0, 100) + '...';
  }
  if (!opening) {
    opening = openingMap[title] || "你好，我是你的助手。请告诉我你需要什么帮助！";
  }
  // 插入消息...
};
```

---

## 调试技巧

### 查看事件触发
```javascript
// 在浏览器控制台中
window.addEventListener('switchToAssistant', (e) => {
  console.log('Switch event:', e.detail);
});
```

### 查看用户助手列表
```javascript
// 在浏览器控制台中
JSON.parse(localStorage.getItem('user_assistants'))
```

### 查看当前助手
```javascript
// 在 ChatbotChat 组件中添加
console.log('Current assistant:', currentAssistant);
```

---

## 常见问题

### Q: 点击"立即开始聊天"后没有切换？
**A**: 检查：
1. 助手是否在用户列表中（`userAssistants`）
2. 浏览器控制台是否有错误日志
3. 事件是否正确触发（查看 `[ChatbotChat] Received switchToAssistant event` 日志）

### Q: 欢迎消息没有显示？
**A**: 检查：
1. `ensureOpeningForAssistant` 是否被调用
2. 助手对象是否正确传递
3. 聊天会话是否已存在（有消息的会话不会显示欢迎消息）

### Q: 使用时间没有更新？
**A**: 检查：
1. `userAssistantService.updateLastUsed()` 是否被调用
2. localStorage 是否有写入权限
3. 浏览器控制台是否有错误日志

---

## 性能指标

- **事件响应时间**: < 50ms
- **视图切换时间**: < 100ms
- **欢迎消息显示**: < 50ms
- **使用时间更新**: 异步，不阻塞 UI

---

## 相关文档

- [Task 6 完整文档](./TASK_6_ASSISTANT_SWITCHING_COMPLETE.md)
- [用户助手服务文档](./TASK_1_USER_ASSISTANT_SERVICE_COMPLETE.md)
- [激活按钮文档](./ASSISTANT_ACTIVATION_BUTTON_COMPLETE.md)
- [需求文档](../.kiro/specs/assistant-activation-from-market/requirements.md)
- [设计文档](../.kiro/specs/assistant-activation-from-market/design.md)
