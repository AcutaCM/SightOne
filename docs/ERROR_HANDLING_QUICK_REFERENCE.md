# Error Handling Quick Reference

## Quick Start

### Using the Error Handler

```typescript
import { assistantErrorHandler } from '@/lib/services/assistantErrorHandler';

// Execute with automatic retry
try {
  await assistantErrorHandler.executeWithRetry(
    async () => {
      await saveAssistant(data);
      return true;
    },
    formData,
    {
      maxRetries: 3,
      retryDelay: 1000,
      saveDraft: true
    }
  );
} catch (error) {
  const assistantError = assistantErrorHandler.createError(error);
  const message = assistantErrorHandler.getUserFriendlyMessage(assistantError);
  notificationService.error(message);
}
```

## Error Types

| Type | Recoverable | Auto-Retry | Draft Save |
|------|-------------|------------|------------|
| `VALIDATION_ERROR` | ❌ No | ❌ No | ❌ No |
| `NETWORK_ERROR` | ✅ Yes | ✅ Yes | ✅ Yes |
| `PERMISSION_ERROR` | ❌ No | ❌ No | ❌ No |
| `CONFLICT_ERROR` | ✅ Yes | ✅ Yes | ❌ No |
| `SERVER_ERROR` | ✅ Yes | ✅ Yes | ✅ Yes |
| `UNKNOWN_ERROR` | ✅ Yes | ✅ Yes | ✅ Yes |

## Error Messages

### Network Error
```
网络连接失败，请检查您的网络连接

建议：
• 检查网络连接
• 刷新页面重试
• 您的数据已自动保存为草稿
```

### Permission Error
```
您没有权限执行此操作

如需帮助，请联系管理员
```

### Conflict Error
```
数据已被其他用户修改，请刷新后重试

建议：
• 刷新页面获取最新数据
• 重新编辑并保存
```

### Server Error
```
服务器错误，请稍后重试

建议：
• 稍后重试
• 如问题持续，请联系技术支持
• 您的数据已自动保存为草稿
```

### Validation Error
```
[具体验证错误消息]

请检查表单中标红的字段
```

## API Reference

### `createError(error, context?)`
Converts raw errors to AssistantError objects.

**Parameters**:
- `error`: Raw error object
- `context`: Optional context string

**Returns**: `AssistantError`

### `handleError(error, formData, options?)`
Processes errors and attempts recovery.

**Parameters**:
- `error`: AssistantError object
- `formData`: Form data to save as draft
- `options`: ErrorRecoveryOptions

**Returns**: `Promise<ErrorHandlingResult>`

### `executeWithRetry(fn, formData, options?)`
Executes operations with automatic retry.

**Parameters**:
- `fn`: Async function to execute
- `formData`: Form data for draft saving
- `options`: ErrorRecoveryOptions

**Returns**: `Promise<T>`

### `getUserFriendlyMessage(error)`
Generates user-friendly error messages.

**Parameters**:
- `error`: AssistantError object

**Returns**: `string`

## Configuration Options

```typescript
interface ErrorRecoveryOptions {
  retry?: boolean;          // Enable retry (default: true)
  saveDraft?: boolean;      // Save draft on failure (default: true)
  maxRetries?: number;      // Max retry attempts (default: 3)
  retryDelay?: number;      // Initial retry delay in ms (default: 1000)
}
```

## Common Patterns

### Pattern 1: Save with Error Handling
```typescript
const handleSave = async () => {
  try {
    await assistantErrorHandler.executeWithRetry(
      () => onSave(formData),
      formData,
      { maxRetries: 3, saveDraft: mode === 'create' }
    );
    
    notificationService.success('保存成功');
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

### Pattern 2: Manual Error Handling
```typescript
try {
  await saveAssistant(data);
} catch (error) {
  const assistantError = assistantErrorHandler.createError(error);
  
  const result = await assistantErrorHandler.handleError(
    assistantError,
    formData,
    { saveDraft: true }
  );
  
  if (result.action === 'draft_saved') {
    notificationService.warning('数据已保存为草稿');
  }
}
```

### Pattern 3: Validation Before Save
```typescript
const handleSave = async () => {
  // Validate first
  const validation = validateAssistantForm(formData);
  if (!validation.valid) {
    setErrors(validation.errors);
    notificationService.error(
      Object.values(validation.errors)[0],
      { title: '验证错误' }
    );
    return;
  }
  
  // Then save with error handling
  try {
    await assistantErrorHandler.executeWithRetry(
      () => onSave(formData),
      formData
    );
  } catch (error) {
    // Handle error
  }
};
```

## Retry Strategy

The error handler uses exponential backoff for retries:

```
Attempt 1: Wait 1000ms (1s)
Attempt 2: Wait 2000ms (2s)
Attempt 3: Wait 4000ms (4s)
```

Formula: `retryDelay * Math.pow(2, attempt)`

## Draft Management

Drafts are automatically saved when:
- Network errors occur
- Server errors occur
- Unknown errors occur
- `saveDraft: true` is set in options

Drafts are NOT saved for:
- Validation errors (user needs to fix input)
- Permission errors (user lacks access)

## Best Practices

1. **Always validate before saving**:
   ```typescript
   const validation = validateAssistantForm(formData);
   if (!validation.valid) {
     // Show errors, don't proceed
     return;
   }
   ```

2. **Use executeWithRetry for network operations**:
   ```typescript
   await assistantErrorHandler.executeWithRetry(
     () => apiCall(),
     formData
   );
   ```

3. **Provide user-friendly messages**:
   ```typescript
   const message = assistantErrorHandler.getUserFriendlyMessage(error);
   notificationService.error(message);
   ```

4. **Offer retry for recoverable errors**:
   ```typescript
   if (error.recoverable) {
     notificationService.error(message, {
       action: { label: '重试', onClick: handleSave }
     });
   }
   ```

5. **Clear retry count on success**:
   ```typescript
   assistantErrorHandler.clearRetryCount();
   ```

## Troubleshooting

### Error not being caught
- Ensure you're using try-catch blocks
- Check that async functions are awaited
- Verify error is thrown, not returned

### Draft not saving
- Check `saveDraft: true` in options
- Verify `draftManager` is imported
- Check browser console for errors

### Retry not working
- Verify error is marked as `recoverable: true`
- Check `maxRetries` is > 0
- Ensure `retry: true` in options

### Wrong error type detected
- Check error message/status code
- Add custom error detection logic
- Use `context` parameter for debugging

## Related Files

- `lib/services/assistantErrorHandler.ts` - Error handler service
- `lib/services/assistantDraftManager.ts` - Draft management
- `lib/services/notificationService.ts` - User notifications
- `components/AssistantSettingsSidebar.tsx` - Integration example

## Support

For issues or questions:
1. Check the full documentation: `TASK_6_ERROR_HANDLING_COMPLETE.md`
2. Review the implementation: `lib/services/assistantErrorHandler.ts`
3. Check the integration: `components/AssistantSettingsSidebar.tsx`
