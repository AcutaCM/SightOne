# 助理表单滚动条错误修复

## 问题描述

在"创建新助理"对话框的"聊天偏好"标签页中,当拖动滚动条(Slider)时会触发 INTERNAL SERVER ERROR。

## 根本原因

问题出在 `AssistantForm.tsx` 组件中的 Slider 组件使用了 `onChange` 事件处理器。当用户拖动滑块时:

1. `onChange` 事件会频繁触发(每次滑块位置变化都会触发)
2. 每次触发都会调用 `updateField` 函数更新状态
3. 状态更新会触发父组件的 `onChange` 回调
4. 父组件可能会触发草稿保存或其他 API 调用
5. 频繁的 API 调用导致服务器错误

## 解决方案

将所有 Slider 组件的 `onChange` 改为 `onChangeEnd`,这样只在用户停止拖动时才触发更新,避免频繁的状态更新和 API 调用。

### 修改的滑块

**聊天偏好标签页:**
- 消息阈值 (autoCreateTopicThreshold)
- 限制历史消息数 (historyLimit)
- 附带消息数 (attachCount)

**模型设置标签页:**
- 创意活跃度 (creativity)
- 思维开放度 (openness)
- 表述发散度 (divergence)
- 词汇丰富度 (vocabulary)
- 单次回复最大 Tokens (singleReplyLimit)
- 推理强度 (reasoningStrength)

## 修改文件

- `drone-analyzer-nextjs/components/AssistantForm.tsx`

## 测试验证

1. 打开"创建新助理"对话框
2. 切换到"聊天偏好"标签页
3. 拖动任意滑块
4. 确认不再出现 INTERNAL SERVER ERROR
5. 确认滑块值在停止拖动后正确更新

## 技术细节

```typescript
// 修改前 (会频繁触发)
<Slider
  value={formData.autoCreateTopicThreshold || 20}
  onChange={(value) => updateField('autoCreateTopicThreshold', value as number)}
/>

// 修改后 (只在拖动结束时触发)
<Slider
  value={formData.autoCreateTopicThreshold || 20}
  onChangeEnd={(value) => updateField('autoCreateTopicThreshold', value as number)}
/>
```

## 影响范围

- 用户体验改善:滑块拖动更流畅,不会触发错误
- 性能优化:减少不必要的状态更新和 API 调用
- 服务器负载降低:避免频繁的请求

## 日期

2024-11-04
