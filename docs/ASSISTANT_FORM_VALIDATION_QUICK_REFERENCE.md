# 助理表单验证和错误处理 - 快速参考

## 快速开始

### 1. 显示通知

```typescript
import { notificationService } from '@/lib/services/notificationService';

// 成功
notificationService.success('操作成功');

// 错误（带重试按钮）
notificationService.error('操作失败', {
  action: {
    label: '重试',
    onClick: () => retry()
  }
});

// 警告
notificationService.warning('请注意');

// 信息
notificationService.info('提示');
```

### 2. 错误处理

```typescript
import { assistantErrorHandler } from '@/lib/services/assistantErrorHandler';

try {
  await assistantErrorHandler.executeWithRetry(
    async () => await saveData(),
    formData,
    { maxRetries: 3, saveDraft: true }
  );
  notificationService.success('保存成功');
} catch (error) {
  const assistantError = assistantErrorHandler.createError(error);
  const message = assistantErrorHandler.getUserFriendlyMessage(assistantError);
  notificationService.error(message);
}
```

### 3. 表单验证

```typescript
import { validateForm, validateField } from '@/lib/utils/assistantFormValidation';

// 验证单个字段
const error = validateField('title', value);
if (error) {
  setErrors({ ...errors, title: error });
}

// 验证整个表单
const validation = validateForm(formData);
if (!validation.valid) {
  setErrors(validation.errors);
  notificationService.error(Object.values(validation.errors)[0]);
}
```

## 验证规则

| 字段 | 规则 | 错误消息 |
|------|------|----------|
| title | 1-50字符，中英文数字 | "助理名称为1-50个字符，支持中英文和数字" |
| emoji | 必填，有效表情符号 | "请选择一个有效的表情符号" |
| desc | 1-200字符 | "描述为1-200个字符" |
| prompt | 1-2000字符 | "系统提示词为1-2000个字符" |
| tags | 最多5个，每个≤20字符 | "最多5个标签，每个标签不超过20个字符" |

## 错误类型

| 类型 | 可恢复 | 策略 |
|------|--------|------|
| VALIDATION_ERROR | ❌ | 显示错误，用户修正 |
| NETWORK_ERROR | ✅ | 自动重试 + 保存草稿 |
| PERMISSION_ERROR | ❌ | 显示错误，联系管理员 |
| CONFLICT_ERROR | ✅ | 自动重试 |
| SERVER_ERROR | ✅ | 自动重试 + 保存草稿 |
| UNKNOWN_ERROR | ✅ | 自动重试 + 保存草稿 |

## 重试配置

```typescript
{
  maxRetries: 3,        // 最大重试次数
  retryDelay: 1000,     // 初始延迟（毫秒）
  saveDraft: true       // 失败后保存草稿
}
```

重试延迟使用指数退避：1s → 2s → 4s

## 通知选项

```typescript
{
  title: '标题',           // 可选
  message: '消息内容',     // 必填
  type: 'success',        // success | error | warning | info
  duration: 5000,         // 毫秒，0 = 不自动关闭
  action: {               // 可选操作按钮
    label: '按钮文本',
    onClick: () => {}
  },
  onClose: () => {}       // 关闭回调
}
```

## 常见场景

### 场景1：保存助理

```typescript
const handleSave = async () => {
  try {
    await assistantErrorHandler.executeWithRetry(
      async () => await api.saveAssistant(formData),
      formData,
      { maxRetries: 3, saveDraft: true }
    );
    notificationService.success('助理保存成功');
    onClose();
  } catch (error) {
    const assistantError = assistantErrorHandler.createError(error);
    const message = assistantErrorHandler.getUserFriendlyMessage(assistantError);
    notificationService.error(message, {
      action: assistantError.recoverable ? {
        label: '重试',
        onClick: handleSave
      } : undefined
    });
  }
};
```

### 场景2：表单验证

```typescript
const handleSubmit = async () => {
  // 验证表单
  const validation = validateForm(formData);
  if (!validation.valid) {
    setErrors(validation.errors);
    notificationService.error(
      Object.values(validation.errors)[0],
      { title: '验证错误' }
    );
    return;
  }
  
  // 提交表单
  await onSubmit(formData);
};
```

### 场景3：实时验证

```typescript
const handleBlur = (field: string) => {
  const error = validateField(field, formData[field]);
  if (error) {
    setErrors({ ...errors, [field]: error });
  } else {
    const { [field]: _, ...rest } = errors;
    setErrors(rest);
  }
};
```

## 调试技巧

### 1. 查看错误详情

```typescript
const assistantError = assistantErrorHandler.createError(error);
console.log('Error type:', assistantError.type);
console.log('Error message:', assistantError.message);
console.log('Error details:', assistantError.details);
console.log('Recoverable:', assistantError.recoverable);
```

### 2. 测试重试机制

```typescript
let attempts = 0;
const testFn = async () => {
  attempts++;
  console.log(`Attempt ${attempts}`);
  if (attempts < 3) throw new Error('Test error');
  return 'success';
};

await assistantErrorHandler.executeWithRetry(testFn, formData);
```

### 3. 测试草稿保存

```typescript
import { draftManager } from '@/lib/services/assistantDraftManager';

// 保存草稿
draftManager.saveDraft(formData);

// 检查草稿
console.log('Has draft:', draftManager.hasDraft());

// 加载草稿
const draft = draftManager.loadDraft();
console.log('Draft data:', draft);

// 清除草稿
draftManager.clearDraft();
```

## 性能优化

### 防抖验证

```typescript
import { debounce } from 'lodash';

const debouncedValidate = debounce((field, value) => {
  const error = validateField(field, value);
  setErrors({ ...errors, [field]: error });
}, 300);
```

### 节流草稿保存

```typescript
import { throttle } from 'lodash';

const throttledSaveDraft = throttle((data) => {
  draftManager.saveDraft(data);
}, 30000);
```

## 故障排除

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 通知不显示 | NotificationContainer 未添加 | 在 layout.tsx 中添加 `<NotificationContainer />` |
| 草稿未保存 | localStorage 不可用 | 检查浏览器设置，允许存储 |
| 重试次数过多 | maxRetries 设置过高 | 降低 maxRetries 到 2-3 |
| 错误消息不友好 | 未使用 getUserFriendlyMessage | 使用 `assistantErrorHandler.getUserFriendlyMessage(error)` |

## 相关文档

- [完整文档](./ASSISTANT_FORM_VALIDATION_ERROR_HANDLING.md)
- [API 参考](./ASSISTANT_FORM_VALIDATION_ERROR_HANDLING.md#api-参考)
- [测试指南](./ASSISTANT_FORM_VALIDATION_ERROR_HANDLING.md#测试)
