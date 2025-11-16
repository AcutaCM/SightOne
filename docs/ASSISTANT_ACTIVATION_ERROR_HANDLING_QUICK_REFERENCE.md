# Assistant Activation Error Handling - Quick Reference

## Quick Links
- [Full Documentation](./ASSISTANT_ACTIVATION_ERROR_HANDLING.md)
- [Service Code](../lib/services/userAssistantService.ts)
- [Validation Utility](../lib/utils/assistantValidation.ts)
- [Sync Queue](../lib/services/assistantSyncQueue.ts)

## Error Codes at a Glance

| Code | Message | Action |
|------|---------|--------|
| `ASSISTANT_ALREADY_EXISTS` | 助手已在列表中 | Show duplicate dialog |
| `ASSISTANT_LIST_FULL` | 助手列表已达上限（50个） | Suggest deleting assistants |
| `INVALID_ASSISTANT_DATA` | 助手数据不完整或无效 | Log error, prevent add |
| `QUOTA_EXCEEDED` | 存储空间不足 | Suggest cleanup |

## Common Tasks

### Check if Assistant is Added
```typescript
const isAdded = userAssistantService.isAssistantAdded(assistantId);
```

### Check List Capacity
```typescript
const count = userAssistantService.getAssistantCount();
const max = userAssistantService.getMaxAssistants();
const remaining = userAssistantService.getRemainingSlots();
const isFull = userAssistantService.isListFull();
```

### Validate Assistant Data
```typescript
import { validateAssistantData, sanitizeAssistantData } from '@/lib/utils/assistantValidation';

// Get validation result
const result = validateAssistantData(data);
if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}

// Or get sanitized data directly
const sanitized = sanitizeAssistantData(data);
if (!sanitized) {
  // Invalid data
}
```

### Check Sync Queue Status
```typescript
import { assistantSyncQueue } from '@/lib/services/assistantSyncQueue';

const stats = assistantSyncQueue.getQueueStats();
console.log(`Pending operations: ${stats.totalOperations}`);
```

## Component Usage

### Duplicate Dialog
```typescript
// In AssistantActivationButton.tsx
const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

// Show when already added
if (isAdded) {
  setShowDuplicateDialog(true);
}
```

### Error Handling in Hook
```typescript
// In useAssistantActivation.ts
try {
  await userAssistantService.addAssistant(assistant);
} catch (err) {
  if (err instanceof UserAssistantServiceError) {
    // Handle specific error codes
    switch (err.code) {
      case 'ASSISTANT_ALREADY_EXISTS':
        // Show duplicate dialog
        break;
      case 'ASSISTANT_LIST_FULL':
        // Show full list message
        break;
      // ... other cases
    }
  }
}
```

## Testing Snippets

### Test Duplicate Detection
```typescript
await service.addAssistant(assistant);
await expect(service.addAssistant(assistant))
  .rejects.toThrow('助手已在列表中');
```

### Test List Full
```typescript
// Add 50 assistants
for (let i = 0; i < 50; i++) {
  await service.addAssistant(createAssistant(i));
}

// 51st should fail
await expect(service.addAssistant(createAssistant(51)))
  .rejects.toThrow('助手列表已达上限');
```

### Test Validation
```typescript
const result = validateAssistantData({
  id: 'test',
  title: 'Test'
  // Missing fields
});

expect(result.isValid).toBe(true);
expect(result.warnings.length).toBeGreaterThan(0);
```

## Debugging Tips

### Enable Verbose Logging
```typescript
// In browser console
localStorage.setItem('DEBUG_ASSISTANT_SERVICE', 'true');
```

### Check Queue Status
```typescript
// In browser console
const queue = JSON.parse(localStorage.getItem('assistant_sync_queue') || '[]');
console.log('Pending operations:', queue);
```

### Inspect Stored Assistants
```typescript
// In browser console
const assistants = JSON.parse(localStorage.getItem('user_assistants') || '[]');
console.log('Stored assistants:', assistants.length);
```

## Configuration

### Change Max Assistants
```typescript
// In userAssistantService.ts
private readonly maxAssistants = 50; // Change this value
```

### Change Sync Interval
```typescript
// In assistantSyncQueue.ts
assistantSyncQueue.startAutoSync(30000); // 30 seconds
```

### Change Max Retries
```typescript
// In assistantSyncQueue.ts
private readonly maxRetries = 3; // Change this value
```

## Status: ✅ Complete
