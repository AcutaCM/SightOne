# Preset Protection Quick Reference

## Quick Start

### Check if Assistant is Protected

```typescript
import { isSystemPreset } from '@/lib/security/presetProtection';

const protected = isSystemPreset(assistant);
// Returns: true if assistant.author === 'system'
```

### Check Permissions

```typescript
import { canDeleteAssistant, canModifyAssistant } from '@/lib/security/presetProtection';

// Check delete permission
const deleteCheck = canDeleteAssistant(assistant, isAdmin);
if (!deleteCheck.allowed) {
  alert(deleteCheck.reason); // "系统预设助理不能被删除..."
}

// Check modify permission
const modifyCheck = canModifyAssistant(assistant, isAdmin);
if (!modifyCheck.allowed) {
  alert(modifyCheck.reason); // "系统预设助理不能被修改..."
}
```

### Using in Components

```typescript
import { useAssistants } from '@/contexts/AssistantContext';

function MyComponent() {
  const { 
    isSystemPreset, 
    canDeleteAssistant, 
    canModifyAssistant,
    getProtectionMessage 
  } = useAssistants();
  
  const assistant = /* ... */;
  
  // Check if protected
  if (isSystemPreset(assistant)) {
    // Show protection badge
  }
  
  // Get protection message
  const message = getProtectionMessage(assistant);
  // Returns: "🔒 系统预设助理 - 受保护不可删除或修改" or null
  
  // Check permissions
  const canDelete = canDeleteAssistant(assistant).allowed;
  const canModify = canModifyAssistant(assistant).allowed;
  
  return (
    <div>
      {message && <Badge>{message}</Badge>}
      <Button disabled={!canModify}>Edit</Button>
      <Button disabled={!canDelete}>Delete</Button>
    </div>
  );
}
```

## Admin Role Management

### Check if User is Admin

```typescript
import { isAdmin, getCurrentUserId, isCurrentUserAdmin } from '@/lib/security/adminRole';

// Check specific user
const userIsAdmin = isAdmin('user-id');

// Check current user
const currentIsAdmin = isCurrentUserAdmin();

// Get current user ID
const userId = getCurrentUserId();
```

### Require Admin Permission

```typescript
import { requireAdmin } from '@/lib/security/adminRole';

function adminOnlyFunction() {
  requireAdmin(); // Throws error if not admin
  
  // Admin-only code here
}
```

### Set Admin User (Development)

```typescript
// In browser console or localStorage
localStorage.setItem('userId', 'admin');

// Now user will have admin permissions
```

## Operation Logging

### Log Operations

```typescript
import { 
  logCreate, 
  logUpdate, 
  logDelete, 
  logStatusChange 
} from '@/lib/security/operationLog';

// Log creation
logCreate(assistant, userId, isAdmin, true);

// Log update
logUpdate(
  assistantId,
  assistantTitle,
  userId,
  isAdmin,
  { title: 'New Title' }, // changes
  { title: 'Old Title' }, // previous values
  true // success
);

// Log deletion
logDelete(assistantId, assistantTitle, userId, isAdmin, true);

// Log status change
logStatusChange(
  assistantId,
  assistantTitle,
  userId,
  isAdmin,
  'draft', // old status
  'published', // new status
  true // success
);
```

### Query Logs

```typescript
import { 
  getOperationLogs, 
  getAssistantLogs, 
  getUserLogs 
} from '@/lib/security/operationLog';

// Get all logs
const allLogs = getOperationLogs();

// Get logs for specific assistant
const assistantLogs = getAssistantLogs('assistant-id', 50);

// Get logs for specific user
const userLogs = getUserLogs('user-id', 50);

// Get logs with filters
const filteredLogs = getOperationLogs({
  assistantId: 'assistant-id',
  operation: 'update',
  limit: 10
});
```

## Protected Preset IDs

Current protected presets:
- `tello-intelligent-agent` - Tello Intelligent Agent

To add more protected presets, edit `lib/security/presetProtection.ts`:

```typescript
export const PROTECTED_PRESET_IDS = [
  'tello-intelligent-agent',
  'your-new-preset-id', // Add here
];
```

## Admin Users

Current admin users:
- `admin`
- `system`

To add more admin users, edit `lib/security/adminRole.ts`:

```typescript
const ADMIN_USERS = [
  'admin',
  'system',
  'your-admin-user-id', // Add here
];
```

## Error Messages

### User-Facing Messages

- **Delete blocked**: "系统预设助理不能被删除。如需修改，请联系管理员。"
- **Modify blocked**: "系统预设助理不能被修改。如需修改，请联系管理员。"
- **Admin required**: "此操作需要管理员权限"
- **Not logged in**: "用户未登录"

### API Error Codes

- `FORBIDDEN` (403): Permission denied
- `INVALID_PARAMETER` (400): Invalid request parameter
- `NOT_FOUND` (404): Assistant not found
- `VERSION_CONFLICT` (409): Optimistic locking conflict

## Testing

### Manual Test: Try to Delete Preset

```typescript
// Should fail with error message
await deleteAssistant('tello-intelligent-agent');
// Error: "系统预设助理不能被删除..."
```

### Manual Test: Try to Modify Preset

```typescript
// Should fail with error message
await updateAssistant('tello-intelligent-agent', { title: 'New Title' });
// Error: "系统预设助理不能被修改..."
```

### Manual Test: Admin Override

```typescript
// Set admin user
localStorage.setItem('userId', 'admin');

// Now should succeed
await updateAssistant('tello-intelligent-agent', { title: 'New Title' });
// Success!
```

## Common Patterns

### Disable Buttons for Protected Assistants

```typescript
<Button 
  disabled={!canModifyAssistant(assistant).allowed}
  onClick={handleEdit}
>
  Edit
</Button>

<Button 
  disabled={!canDeleteAssistant(assistant).allowed}
  onClick={handleDelete}
>
  Delete
</Button>
```

### Show Protection Badge

```typescript
{isSystemPreset(assistant) && (
  <Badge color="warning">
    🔒 System Preset
  </Badge>
)}
```

### Conditional Rendering

```typescript
const modifyCheck = canModifyAssistant(assistant);

{!modifyCheck.allowed && (
  <Alert type="warning">
    {modifyCheck.reason}
  </Alert>
)}
```

## Troubleshooting

### Q: Why can't I modify the preset even as admin?

**A:** Check that your userId is set correctly:
```typescript
console.log(getCurrentUserId()); // Should return 'admin' or other admin user
localStorage.setItem('userId', 'admin'); // Set if needed
```

### Q: How do I see operation logs?

**A:** Check console logs or use the query functions:
```typescript
import { getOperationLogs } from '@/lib/security/operationLog';
console.log(getOperationLogs({ limit: 10 }));
```

### Q: How do I add a new admin user?

**A:** Edit `lib/security/adminRole.ts` and add the user ID to `ADMIN_USERS` array.

### Q: How do I protect a new preset?

**A:** 
1. Set `author: 'system'` when creating the preset
2. Add the preset ID to `PROTECTED_PRESET_IDS` in `lib/security/presetProtection.ts`

## Related Documentation

- [Full Documentation](./PRESET_PROTECTION_AND_ADMIN_SYSTEM.md)
- [Requirements](../.kiro/specs/intelligent-agent-preset/requirements.md)
- [Design](../.kiro/specs/intelligent-agent-preset/design.md)
- [Tasks](../.kiro/specs/intelligent-agent-preset/tasks.md)
