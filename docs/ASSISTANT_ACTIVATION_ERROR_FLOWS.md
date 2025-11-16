# Assistant Activation Error Handling - Visual Flow Guide

## Flow Diagrams

### 1. Duplicate Assistant Detection Flow

```
User clicks "使用该助手进行聊天"
           ↓
    Check if already added
           ↓
    ┌──────┴──────┐
    │             │
   YES           NO
    │             │
    │             ↓
    │      Validate data
    │             ↓
    │      Add to list
    │             ↓
    │      Show success dialog
    │             ↓
    ↓             ↓
Show duplicate dialog
    ↓
┌───┴───┐
│       │
直接使用  关闭
│       │
↓       ↓
Switch  Close
to      dialog
assistant
with
highlight
```

### 2. List Full Error Flow

```
User clicks "使用该助手进行聊天"
           ↓
    Check if already added
           ↓
          NO
           ↓
    Check list capacity
           ↓
    ┌──────┴──────┐
    │             │
  < 50          = 50
    │             │
    ↓             ↓
Validate      Throw error
data          ASSISTANT_LIST_FULL
    ↓             ↓
Add to        Show error message:
list          "助手列表已达上限（50个）
              请先删除一些助手后再添加"
    ↓             ↓
Success       Button returns
              to initial state
```

### 3. Invalid Data Handling Flow

```
User clicks "使用该助手进行聊天"
           ↓
    Validate assistant data
           ↓
    ┌──────┴──────┐
    │             │
  Valid       Invalid
    │             │
    ↓             ↓
Check if      Throw error
already       INVALID_ASSISTANT_DATA
added             ↓
    ↓         Log errors to console
Continue          ↓
normal        Show error message:
flow          "助手数据不完整或无效"
                  ↓
              Button returns
              to initial state
```

### 4. Network Error Handling Flow (Future)

```
User clicks "使用该助手进行聊天"
           ↓
    Add to local storage
           ↓
         SUCCESS
           ↓
    Enqueue sync operation
           ↓
    ┌──────┴──────┐
    │             │
  Online      Offline
    │             │
    ↓             ↓
Sync with     Store in queue
backend           ↓
    ↓         Wait for network
SUCCESS           ↓
    ↓         Network restored
Remove from       ↓
queue         Auto-process queue
                  ↓
              Sync with backend
                  ↓
              Remove from queue
```

### 5. Storage Quota Exceeded Flow

```
User clicks "使用该助手进行聊天"
           ↓
    Validate and add to list
           ↓
    Save to localStorage
           ↓
    ┌──────┴──────┐
    │             │
  Success     QuotaExceededError
    │             │
    ↓             ↓
Continue      Catch error
normal            ↓
flow          Throw error
              QUOTA_EXCEEDED
                  ↓
              Show error message:
              "存储空间不足
              请清理部分助手后重试"
                  ↓
              Suggest cleanup actions
```

## State Transitions

### Button States

```
┌─────────────┐
│  Initial    │ "使用该助手进行聊天"
│  State      │ Primary color
└──────┬──────┘
       │ Click
       ↓
┌─────────────┐
│  Loading    │ "添加中..."
│  State      │ Disabled, spinner
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
Success  Error
   │       │
   ↓       ↓
┌─────────────┐  ┌─────────────┐
│  Added      │  │  Error      │
│  State      │  │  State      │
│ "已添加"     │  │ Returns to  │
│ Success     │  │ Initial     │
│ color       │  │             │
└─────────────┘  └─────────────┘
```

### Dialog States

```
Success Dialog:
┌────────────────────────┐
│   ✓ 助手已添加成功！      │
│                        │
│ 您现在可以在左侧助手列表  │
│ 中找到它                │
│                        │
│  [立即开始聊天]          │
│  [继续浏览]             │
└────────────────────────┘

Duplicate Dialog:
┌────────────────────────┐
│   ℹ 该助手已在您的列表中  │
│                        │
│ 您已经添加过这个助手，    │
│ 可以直接开始使用         │
│                        │
│  [直接使用]             │
│  [关闭]                │
└────────────────────────┘
```

## Error Message Matrix

| Scenario | Error Code | User Message | Action |
|----------|-----------|--------------|--------|
| Duplicate | `ASSISTANT_ALREADY_EXISTS` | 该助手已在您的列表中 | Show duplicate dialog |
| List Full | `ASSISTANT_LIST_FULL` | 助手列表已达上限（50个） | Suggest deletion |
| Invalid Data | `INVALID_ASSISTANT_DATA` | 助手数据不完整或无效 | Log and prevent |
| Storage Full | `QUOTA_EXCEEDED` | 存储空间不足 | Suggest cleanup |
| Network Error | `NETWORK_ERROR` | 网络异常，已保存到本地 | Queue for sync |

## Validation Flow

```
Assistant Data
      ↓
Check required fields
  (id, title)
      ↓
  ┌───┴───┐
  │       │
Missing  Present
  │       │
  ↓       ↓
Error   Validate types
        ↓
    ┌───┴───┐
    │       │
  Invalid Valid
    │       │
    ↓       ↓
  Error   Check optional fields
          ↓
      ┌───┴───┐
      │       │
    Missing Present
      │       │
      ↓       ↓
    Use     Use
    defaults provided
      │       │
      └───┬───┘
          ↓
    Sanitized Data
          ↓
    Log warnings
          ↓
    Return result
```

## Queue Processing Flow

```
Operation occurs
      ↓
Enqueue to sync queue
      ↓
Save to localStorage
      ↓
Check network status
      ↓
  ┌───┴───┐
  │       │
Online  Offline
  │       │
  ↓       ↓
Process  Wait
queue        ↓
  ↓      Listen for
Success  'online' event
  ↓          ↓
Remove   Network restored
from         ↓
queue    Process queue
             ↓
         ┌───┴───┐
         │       │
      Success  Failure
         │       │
         ↓       ↓
      Remove   Increment
      from     retry count
      queue        ↓
           ┌───────┴───────┐
           │               │
        < Max           = Max
        retries        retries
           │               │
           ↓               ↓
        Keep in         Remove
        queue           from queue
                            ↓
                        Log error
```

## User Experience Timeline

### Successful Addition
```
0ms:   User clicks button
10ms:  Button shows loading state
50ms:  Validation completes
100ms: Data saved to localStorage
110ms: Sync operation enqueued
150ms: Success message appears
200ms: Dialog opens
User:  Chooses action
```

### Duplicate Detection
```
0ms:   User clicks button
10ms:  Check if already added
20ms:  Duplicate detected
30ms:  Duplicate dialog opens
User:  Chooses "直接使用" or "关闭"
```

### List Full Error
```
0ms:   User clicks button
10ms:  Button shows loading state
20ms:  Check list capacity
30ms:  Capacity exceeded detected
40ms:  Error message appears
50ms:  Button returns to initial state
```

## Recovery Strategies

### Invalid Data Recovery
```
Load from storage
      ↓
Parse JSON
      ↓
  ┌───┴───┐
  │       │
Success  Error
  │       │
  ↓       ↓
Validate Return
each     empty
item     array
  ↓
Filter
invalid
items
  ↓
Log
warnings
  ↓
Return
valid
items
```

### Storage Quota Recovery
```
QuotaExceededError
      ↓
Show error message
      ↓
Suggest actions:
  • Delete unused assistants
  • Clear browser cache
  • Export and reimport
      ↓
User takes action
      ↓
Retry operation
```

## Best Practices

### For Developers

1. **Always validate before adding**
   ```typescript
   const result = validateAssistantData(assistant);
   if (!result.isValid) {
     throw new Error(result.errors.join(', '));
   }
   ```

2. **Check capacity before operations**
   ```typescript
   if (service.isListFull()) {
     throw new Error('List is full');
   }
   ```

3. **Handle errors gracefully**
   ```typescript
   try {
     await service.addAssistant(assistant);
   } catch (error) {
     if (error instanceof UserAssistantServiceError) {
       // Handle specific error
     }
   }
   ```

4. **Log for debugging**
   ```typescript
   console.warn('[Component] Operation failed:', error);
   ```

### For Users

1. **Duplicate assistants**: Click "直接使用" to switch to existing assistant
2. **List full**: Delete unused assistants before adding new ones
3. **Storage full**: Clear browser cache or export assistants
4. **Invalid data**: Contact support with console logs

## Monitoring Points

Track these metrics for production:

- Duplicate detection rate
- List full occurrences
- Validation failures
- Queue processing success rate
- Storage quota errors
- Average operation time

---

**Status**: ✅ Complete  
**Last Updated**: 2024
