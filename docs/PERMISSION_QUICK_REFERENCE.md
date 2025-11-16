# Permission System Quick Reference

## Import Statements

```typescript
// Get current user
import { useCurrentUser } from '@/hooks/useCurrentUser';

// Permission service
import { assistantPermissionService } from '@/lib/services/assistantPermissionService';

// Context with built-in permissions
import { useAssistants } from '@/contexts/AssistantContext';
```

## Basic Usage

### Get Current User

```typescript
const currentUser = useCurrentUser();
// Returns: { email: string, role: 'admin' | 'normal', isAuthenticated: boolean } | null
```

### Check Permissions

```typescript
// Can create?
const canCreate = assistantPermissionService.canCreate(currentUser);
// Returns: { allowed: boolean, reason?: string }

// Can edit?
const canEdit = assistantPermissionService.canEdit(currentUser, assistant);

// Can delete?
const canDelete = assistantPermissionService.canDelete(currentUser, assistant);

// Can publish?
const canPublish = assistantPermissionService.canPublish(currentUser);
```

## Common Patterns

### Conditional Button

```typescript
const currentUser = useCurrentUser();
const canCreate = assistantPermissionService.canCreate(currentUser);

{canCreate.allowed && (
  <Button onClick={handleCreate}>创建助理</Button>
)}
```

### Disabled Button with Tooltip

```typescript
const canEdit = assistantPermissionService.canEdit(currentUser, assistant);

<Tooltip content={canEdit.reason || ''}>
  <Button 
    disabled={!canEdit.allowed}
    onClick={handleEdit}
  >
    编辑
  </Button>
</Tooltip>
```

### Using Context (Recommended)

```typescript
const { openCreateSidebar, error } = useAssistants();

// Just call it - permission checked automatically
<Button onClick={openCreateSidebar}>创建助理</Button>

// Show error if permission denied
{error && <Alert>{error}</Alert>}
```

## Permission Rules

| Action | Normal User | Admin | System Preset |
|--------|-------------|-------|---------------|
| Create | ✅ Private only | ✅ Public/Private | N/A |
| Edit Own | ✅ | ✅ | ❌ |
| Edit Others | ❌ | ✅ | ❌ |
| Delete Own | ✅ | ✅ | ❌ |
| Delete Others | ❌ | ✅ | ❌ |
| Publish | ❌ | ✅ | N/A |

## Error Messages

- Not authenticated: "请先登录以创建助理"
- Cannot edit: "您只能编辑自己创建的助理"
- Cannot delete: "您只能删除自己创建的助理"
- Cannot publish: "只有管理员可以发布公开助理"
- System preset: "系统预设助理不可编辑/删除"

## Complete Example

```typescript
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { assistantPermissionService } from '@/lib/services/assistantPermissionService';
import { useAssistants } from '@/contexts/AssistantContext';

function AssistantCard({ assistant }) {
  const currentUser = useCurrentUser();
  const { openEditSidebar, deleteAssistant } = useAssistants();
  
  const canEdit = assistantPermissionService.canEdit(currentUser, assistant);
  const canDelete = assistantPermissionService.canDelete(currentUser, assistant);
  
  return (
    <Card>
      <h3>{assistant.title}</h3>
      <p>{assistant.desc}</p>
      
      <div className="actions">
        {canEdit.allowed && (
          <Button onClick={() => openEditSidebar(assistant.id)}>
            编辑
          </Button>
        )}
        
        {canDelete.allowed && (
          <Popconfirm
            title="确定删除？"
            onConfirm={() => deleteAssistant(assistant.id)}
          >
            <Button danger>删除</Button>
          </Popconfirm>
        )}
        
        {!canEdit.allowed && !canDelete.allowed && (
          <Chip>只读</Chip>
        )}
      </div>
    </Card>
  );
}
```

## Testing Different Roles

```typescript
// Not logged in
currentUser = null
// Result: Cannot create, edit, delete, or publish

// Normal user (own assistant)
currentUser = { email: 'user@test.com', role: 'normal', isAuthenticated: true }
assistant.author = 'user@test.com'
// Result: Can create (private), edit, delete. Cannot publish.

// Normal user (others' assistant)
currentUser = { email: 'user@test.com', role: 'normal', isAuthenticated: true }
assistant.author = 'other@test.com'
// Result: Can create (private). Cannot edit, delete, or publish.

// Admin user
currentUser = { email: 'admin@test.com', role: 'admin', isAuthenticated: true }
// Result: Can create (public/private), edit all, delete all, publish

// System preset
assistant.author = 'system'
// Result: Cannot edit or delete (even admin)
```

## API Endpoints

Permission checks are also enforced server-side:

- `POST /api/assistants` - Requires authentication
- `PUT /api/assistants/:id` - Requires ownership or admin
- `DELETE /api/assistants/:id` - Requires ownership or admin
- `PUT /api/assistants/:id/status` - Requires admin

## Best Practices

1. ✅ Always check permissions before showing UI elements
2. ✅ Use context methods when possible (built-in checks)
3. ✅ Show clear error messages
4. ✅ Provide disabled states with tooltips
5. ✅ Test with different user roles
6. ❌ Don't rely only on client-side checks (security)
7. ❌ Don't show actions user cannot perform
8. ❌ Don't forget to handle permission errors
