# Task 5 快速参考指南

## 概述

任务 5 将助手激活按钮集成到助手详情页，实现完整的激活流程和回调处理。

## 快速测试

### 1. 测试新助手激活

```bash
# 1. 打开助手市场
# 2. 选择一个未添加的助手
# 3. 点击"使用该助手进行聊天"按钮
# 4. 验证:
#    - 按钮显示"添加中..."
#    - 成功后显示"已添加"
#    - 弹出操作选项对话框
#    - 助手出现在左侧列表
```

### 2. 测试已添加助手

```bash
# 1. 打开已添加助手的详情页
# 2. 验证按钮显示"已添加"（绿色）
# 3. 点击按钮
# 4. 验证操作选项对话框显示
```

### 3. 测试回调处理

```bash
# 1. 在详情页点击激活按钮
# 2. 在操作对话框中点击"立即开始聊天"
# 3. 验证切换到聊天界面
# 4. 验证助手被正确选中
```

## 核心代码

### AssistantDetail 集成

```typescript
// drone-analyzer-nextjs/components/ChatbotChat/AssistantDetail.tsx

// 激活回调处理
const handleActivated = (activatedAssistant: Assistant) => {
  // 调用父组件的 onUse 回调
  onUse?.(activatedAssistant);
};

// 按钮渲染
<AssistantActivationButton
  assistant={assistant}
  onActivated={handleActivated}
  size="large"
  block={false}
/>
```

### 按钮状态

```typescript
// 未添加
{
  text: "使用该助手进行聊天",
  icon: <MessageOutlined />,
  color: "primary"
}

// 添加中
{
  text: "添加中...",
  loading: true,
  disabled: true
}

// 已添加
{
  text: "已添加",
  icon: <CheckCircleOutlined />,
  color: "success"
}
```

## 用户流程

```
用户打开助手详情
    ↓
查看助手信息
    ↓
点击激活按钮
    ↓
┌─────────────────┐
│ 助手未添加？     │
└─────────────────┘
    ↓           ↓
   是          否
    ↓           ↓
添加到列表   显示对话框
    ↓           ↓
显示对话框   选择操作
    ↓
┌─────────────────┐
│ 立即开始聊天？   │
└─────────────────┘
    ↓           ↓
   是          否
    ↓           ↓
切换到聊天   保持当前页
```

## 关键特性

### ✅ 状态检测
- 自动检测助手是否已添加
- 根据状态显示不同UI
- 防止重复添加

### ✅ 回调机制
- `onActivated`: 激活成功回调
- `onUse`: 父组件导航回调
- 灵活的控制流程

### ✅ 操作选项
- 立即开始聊天
- 继续浏览
- 用户自主选择

### ✅ 可访问性
- 键盘导航支持
- 屏幕阅读器支持
- 清晰的状态反馈

## 事件通信

### userAssistantsUpdated
```typescript
// 触发: 助手添加成功后
window.dispatchEvent(new CustomEvent('userAssistantsUpdated', {
  detail: { assistantId: assistant.id }
}));

// 监听: 助手列表组件
window.addEventListener('userAssistantsUpdated', handleUpdate);
```

### switchToAssistant
```typescript
// 触发: 用户选择"立即开始聊天"
window.dispatchEvent(new CustomEvent('switchToAssistant', {
  detail: { assistantId: assistant.id }
}));

// 监听: ChatbotChat 主组件
window.addEventListener('switchToAssistant', handleSwitch);
```

## 常见问题

### Q: 按钮不显示"已添加"状态？
**A**: 检查 `useAssistantActivation` Hook 是否正确检测助手状态。

### Q: 点击按钮没有反应？
**A**: 检查:
1. `addAssistant` 方法是否正常工作
2. 是否有错误消息显示
3. 浏览器控制台是否有错误

### Q: 回调没有被调用？
**A**: 确认:
1. `onActivated` 回调已传递给按钮
2. `onUse` 回调已传递给 AssistantDetail
3. 回调函数定义正确

### Q: 对话框不显示？
**A**: 检查:
1. `showOptions` 状态是否正确更新
2. Modal 组件是否正确渲染
3. 是否有 CSS 冲突

## 性能优化

### 使用 useCallback
```typescript
const handleActivated = useCallback((assistant: Assistant) => {
  onUse?.(assistant);
}, [onUse]);
```

### 防抖处理
```typescript
const debouncedAddAssistant = useMemo(
  () => debounce(addAssistant, 300),
  [addAssistant]
);
```

## 相关文档

- [完整实现文档](./TASK_5_ASSISTANT_DETAIL_INTEGRATION_COMPLETE.md)
- [激活按钮文档](./ASSISTANT_ACTIVATION_BUTTON_COMPLETE.md)
- [激活 Hook 文档](./TASK_2_ASSISTANT_ACTIVATION_HOOK_COMPLETE.md)
- [用户助手服务文档](./TASK_1_USER_ASSISTANT_SERVICE_COMPLETE.md)

## 下一步

- [ ] Task 6: 实现助手切换功能
- [ ] Task 7: 添加样式和动画
- [ ] Task 8: 实现数据持久化

## 需求覆盖

- ✅ Requirement 1.1: 助手激活按钮显示
- ✅ Requirement 1.3: 已添加状态显示
- ✅ Requirement 4.2: 重复添加检测
- ✅ Requirement 4.3: 阻止重复添加
- ✅ Requirement 4.4: 高亮已存在助手
- ✅ Requirement 5.2: 激活后导航选项
- ✅ Requirement 5.5: 切换到聊天界面
- ✅ Requirement 5.6: 显示欢迎消息

## 总结

Task 5 成功实现了助手详情页的完整集成，包括:
- ✅ 激活按钮集成
- ✅ 回调处理机制
- ✅ 状态显示逻辑
- ✅ 操作选项对话框
- ✅ 用户体验优化

所有功能正常工作，用户体验流畅。
