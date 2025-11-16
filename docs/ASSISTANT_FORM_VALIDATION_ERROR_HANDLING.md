# 助理表单验证和错误处理系统

## 概述

本文档描述了助理表单的验证和错误处理系统，包括实时验证、错误恢复策略和用户友好的错误消息显示。

## 功能特性

### 1. 实时字段验证

- **触发时机**: 字段失焦（blur）时
- **验证规则**: 
  - 助理名称: 1-50字符，支持中英文和数字
  - 图标: 必须选择有效的表情符号
  - 描述: 1-200字符
  - 系统提示词: 1-2000字符
  - 标签: 最多5个，每个不超过20字符

### 2. 表单级验证

- **触发时机**: 表单提交时
- **验证流程**:
  1. 标记所有字段为已触摸
  2. 验证所有字段
  3. 收集所有错误
  4. 如有错误，显示第一个错误消息并阻止提交

### 3. 错误类型

系统支持以下错误类型：

```typescript
enum AssistantErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',    // 验证错误
  NETWORK_ERROR = 'NETWORK_ERROR',          // 网络错误
  PERMISSION_ERROR = 'PERMISSION_ERROR',    // 权限错误
  CONFLICT_ERROR = 'CONFLICT_ERROR',        // 冲突错误
  SERVER_ERROR = 'SERVER_ERROR',            // 服务器错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'           // 未知错误
}
```

### 4. 错误恢复策略

#### 自动重试
- **适用场景**: 网络错误、服务器错误、冲突错误
- **重试次数**: 最多3次
- **重试延迟**: 指数退避（1s, 2s, 4s）
- **实现方式**: `executeWithRetry` 方法

#### 草稿保存
- **适用场景**: 所有非验证错误
- **保存时机**: 
  - 重试失败后自动保存
  - 用户主动关闭时保存
- **保存位置**: localStorage
- **过期时间**: 7天

#### 手动干预
- **适用场景**: 验证错误、权限错误
- **用户操作**: 修正输入或联系管理员

## 使用示例

### 基本使用

```typescript
import { assistantErrorHandler } from '@/lib/services/assistantErrorHandler';
import { notificationService } from '@/lib/services/notificationService';

// 执行带错误处理的操作
try {
  await assistantErrorHandler.executeWithRetry(
    async () => {
      // 你的异步操作
      return await saveAssistant(data);
    },
    formData,
    {
      maxRetries: 3,
      retryDelay: 1000,
      saveDraft: true
    }
  );
  
  // 成功
  notificationService.success('保存成功');
  
} catch (error) {
  // 创建错误对象
  const assistantError = assistantErrorHandler.createError(error);
  
  // 处理错误
  const result = await assistantErrorHandler.handleError(
    assistantError,
    formData
  );
  
  // 显示用户友好的错误消息
  const message = assistantErrorHandler.getUserFriendlyMessage(assistantError);
  notificationService.error(message);
}
```

### 显示通知

```typescript
import { notificationService } from '@/lib/services/notificationService';

// 成功消息
notificationService.success('操作成功', {
  duration: 3000
});

// 错误消息（不自动关闭）
notificationService.error('操作失败', {
  title: '错误',
  duration: 0,
  action: {
    label: '重试',
    onClick: () => retryOperation()
  }
});

// 警告消息
notificationService.warning('请注意', {
  duration: 5000
});

// 信息消息
notificationService.info('提示信息', {
  duration: 4000
});
```

## 组件集成

### AssistantForm

表单组件已集成实时验证和错误显示：

```typescript
<AssistantForm
  initialData={formData}
  onSubmit={handleSubmit}
  onChange={handleChange}
  loading={loading}
  disabled={disabled}
  showPublicOption={isAdmin}
  formRef={formRef}
/>
```

### AssistantSettingsSidebar

侧边栏组件已集成错误处理和恢复：

```typescript
<AssistantSettingsSidebar
  visible={visible}
  onClose={onClose}
  mode="create"
  onSave={handleSave}
  isAdmin={isAdmin}
/>
```

## 错误消息示例

### 验证错误
```
助理名称不能为空

请检查表单中标红的字段
```

### 网络错误
```
网络连接失败，请检查您的网络连接

建议：
• 检查网络连接
• 刷新页面重试
• 您的数据已自动保存为草稿
```

### 权限错误
```
您没有权限执行此操作

如需帮助，请联系管理员
```

### 服务器错误
```
服务器错误，请稍后重试

建议：
• 稍后重试
• 如问题持续，请联系技术支持
• 您的数据已自动保存为草稿
```

## API 参考

### assistantErrorHandler

#### createError(error: any, context?: string): AssistantError
创建标准化的错误对象。

#### handleError(error: AssistantError, formData: AssistantFormData, options?: ErrorRecoveryOptions): Promise<ErrorHandlingResult>
处理错误并尝试恢复。

#### executeWithRetry<T>(fn: () => Promise<T>, formData: AssistantFormData, options?: ErrorRecoveryOptions): Promise<T>
执行带自动重试的异步操作。

#### getUserFriendlyMessage(error: AssistantError): string
获取用户友好的错误消息。

#### clearRetryCount(): void
清除重试计数。

### notificationService

#### success(message: string, options?: Partial<NotificationOptions>): string
显示成功消息。

#### error(message: string, options?: Partial<NotificationOptions>): string
显示错误消息。

#### warning(message: string, options?: Partial<NotificationOptions>): string
显示警告消息。

#### info(message: string, options?: Partial<NotificationOptions>): string
显示信息消息。

#### dismiss(id: string): void
关闭指定通知。

#### dismissAll(): void
关闭所有通知。

## 测试

### 单元测试

```typescript
describe('assistantErrorHandler', () => {
  it('should create network error', () => {
    const error = new Error('fetch failed');
    const assistantError = assistantErrorHandler.createError(error);
    expect(assistantError.type).toBe(AssistantErrorType.NETWORK_ERROR);
  });
  
  it('should retry on recoverable errors', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 3) throw new Error('network error');
      return 'success';
    };
    
    const result = await assistantErrorHandler.executeWithRetry(
      fn,
      mockFormData,
      { maxRetries: 3, retryDelay: 100 }
    );
    
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });
});
```

### 集成测试

```typescript
describe('AssistantForm error handling', () => {
  it('should display validation errors', async () => {
    render(<AssistantForm onSubmit={mockSubmit} />);
    
    // 提交空表单
    fireEvent.click(screen.getByText('保存'));
    
    // 验证错误消息显示
    expect(screen.getByText('助理名称不能为空')).toBeInTheDocument();
  });
  
  it('should save draft on network error', async () => {
    const mockSubmit = jest.fn().mockRejectedValue(new Error('network error'));
    render(<AssistantForm onSubmit={mockSubmit} />);
    
    // 填写表单
    fireEvent.change(screen.getByLabelText('助理名称'), {
      target: { value: '测试助理' }
    });
    
    // 提交
    fireEvent.click(screen.getByText('保存'));
    
    // 等待错误处理
    await waitFor(() => {
      expect(draftManager.hasDraft()).toBe(true);
    });
  });
});
```

## 最佳实践

### 1. 错误处理
- 始终使用 `executeWithRetry` 包装异步操作
- 为可恢复的错误提供重试按钮
- 在重试失败后自动保存草稿

### 2. 用户体验
- 实时显示验证错误
- 使用清晰的错误消息
- 提供具体的解决建议
- 错误消息不自动关闭（需要用户确认）

### 3. 性能优化
- 使用防抖进行实时验证（300ms）
- 使用节流进行草稿保存（30s）
- 避免过度的重试（最多3次）

### 4. 安全性
- 不在客户端显示敏感错误信息
- 验证所有用户输入
- 在服务端重复验证

## 故障排除

### 问题：通知不显示
**解决方案**: 确保 `NotificationContainer` 已添加到 layout.tsx

### 问题：草稿未保存
**解决方案**: 检查 localStorage 是否可用，浏览器是否允许存储

### 问题：重试次数过多
**解决方案**: 调整 `maxRetries` 参数，或检查错误类型是否正确

### 问题：错误消息不友好
**解决方案**: 使用 `getUserFriendlyMessage` 方法获取格式化的消息

## 相关文件

- `lib/services/assistantErrorHandler.ts` - 错误处理服务
- `lib/services/notificationService.ts` - 通知服务
- `lib/utils/assistantFormValidation.ts` - 表单验证工具
- `components/NotificationContainer.tsx` - 通知显示组件
- `components/AssistantForm.tsx` - 表单组件
- `components/AssistantSettingsSidebar.tsx` - 侧边栏组件

## 更新日志

### v1.0.0 (2024-01-XX)
- ✅ 实现实时字段验证
- ✅ 实现表单级验证
- ✅ 实现错误处理服务
- ✅ 实现通知服务
- ✅ 实现自动重试机制
- ✅ 实现草稿保存恢复
- ✅ 集成到 AssistantForm 和 AssistantSettingsSidebar
