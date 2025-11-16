# Assistant Permission Integration Guide

This guide explains how to integrate permission controls into the assistant UI components.

## Overview

The permission system controls who can create, edit, delete, and publish assistants based on user roles.

## Requirements

- **7.1**: All authenticated users can create private assistants
- **7.2**: Users can edit their own assistants, admins can edit all
- **7.3**: Users can delete their own assistants, admins can delete all (except system presets)
- **7.4**: Only admins can publish assistants (make them public)

## Components

### 1. Permission Service

Located at: `lib/services/assistantPermissionService.ts`

```typescript
import { assistantPermissionService } from '@/lib/services/assistantPermissionService';

// Check if user can create
const canCreate = assistantPermissionService.canCreate(user);

// Check if user can edit
const canEdit = assistantPermissionService.canEdit(user, assistant);

// Check if user can delete
const canDelete = assistantPermissionService.canDelete(user, assistant);

// Check if user can publish (toggle public)
const canPublish = assistantPermissionService.canPublish(user);
```

### 2. Current User Hook

Located at: `hooks/useCurrentUser.ts`

```typescript
import { useCurrentUser } from '@/hooks/useCurrentUser';

function MyComponent() {
  const currentUser = useCurrentUser();
  
  // currentUser will be:
  // - null initially (loading)
  // - { email: '', role: 'normal', isAuthenticated: false } if not logged in
  // - { email: 'user@example.com', role: 'admin', isAuthenticated: true } if logged in
}
```

## Integration Examples

### Example 1: Conditional Create Button

```typescript
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { assistantPermissionService } from '@/lib/services/assistantPermissionService';
import { useAssistants } from '@/contexts/AssistantContext';

function AssistantList() {
  const currentUser = useCurrentUser();
  const { openCreateSidebar } = useAssistants();
  
  // Check if user can see create button (Requirement 7.1)
  const canCreate = assistantPermissionService.canCreate(currentUser);
  
  return (
    <div>
      {canCreate.allowed && (
        <Button onClick={openCreateSidebar}>
          创建助理
        </Button>
      )}
      
      {!canCreate.allowed && canCreate.reason && (
        <Tooltip content={canCreate.reason}>
          <Button disabled>创建助理</Button>
        </Tooltip>
      )}
    </div>
  );
}
```

### Example 2: Conditional Edit/Delete Actions

```typescript
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { assistantPermissionService } from '@/lib/services/assistantPermissionService';
import { useAssistants } from '@/contexts/AssistantContext';

function AssistantCard({ assistant }) {
  const currentUser = useCurrentUser();
  const { openEditSidebar, deleteAssistant } = useAssistants();
  
  // Check permissions (Requirements 7.2, 7.3)
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
          <Button 
            color="danger"
            onClick={() => deleteAssistant(assistant.id)}
          >
            删除
          </Button>
        )}
        
        {!canEdit.allowed && !canDelete.allowed && (
          <Chip>只读</Chip>
        )}
      </div>
    </Card>
  );
}
```

### Example 3: Conditional Public Toggle

```typescript
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { assistantPermissionService } from '@/lib/services/assistantPermissionService';

function AssistantForm() {
  const currentUser = useCurrentUser();
  
  // Check if user can toggle public status (Requirement 7.4)
  const canTogglePublic = assistantPermissionService.canTogglePublic(currentUser);
  
  return (
    <Form>
      {/* Other form fields */}
      
      {canTogglePublic.allowed && (
        <Form.Item label="公开助理">
          <Switch />
          <p className="text-sm text-gray-500">
            允许其他用户查看和使用此助理
          </p>
        </Form.Item>
      )}
      
      {!canTogglePublic.allowed && (
        <Alert type="info">
          只有管理员可以发布公开助理
        </Alert>
      )}
    </Form>
  );
}
```

### Example 4: Using AssistantContext (Recommended)

The `AssistantContext` already integrates permission checks:

```typescript
import { useAssistants } from '@/contexts/AssistantContext';

function MyComponent() {
  const { 
    openCreateSidebar,  // Already checks canCreate permission
    openEditSidebar,    // Already checks canEdit permission
    deleteAssistant,    // Already checks canDelete permission
    error               // Shows permission errors
  } = useAssistants();
  
  // Just call the methods - permissions are checked automatically
  const handleCreate = () => {
    openCreateSidebar(); // Will show error if no permission
  };
  
  const handleEdit = (id: string) => {
    openEditSidebar(id); // Will show error if no permission
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteAssistant(id); // Will throw error if no permission
    } catch (err) {
      // Error is already set in context
      console.error(err);
    }
  };
  
  return (
    <div>
      {error && <Alert type="error">{error}</Alert>}
      {/* Your UI */}
    </div>
  );
}
```

## Permission Error Messages

The permission service provides user-friendly error messages:

- **Not authenticated**: "请先登录以创建助理"
- **Cannot edit**: "您只能编辑自己创建的助理"
- **Cannot delete**: "您只能删除自己创建的助理"
- **Cannot publish**: "只有管理员可以发布公开助理"
- **System preset**: "系统预设助理不可编辑/删除"

## Testing Permissions

To test different permission scenarios:

1. **Not logged in**: User should not see create button
2. **Normal user**: Can create, edit own, delete own
3. **Admin user**: Can create, edit all, delete all (except system), publish

```typescript
// Test helper
function testPermissions() {
  const testCases = [
    { user: null, expected: { create: false, edit: false, delete: false, publish: false } },
    { user: { email: 'user@test.com', role: 'normal', isAuthenticated: true }, expected: { create: true, edit: 'own', delete: 'own', publish: false } },
    { user: { email: 'admin@test.com', role: 'admin', isAuthenticated: true }, expected: { create: true, edit: 'all', delete: 'all', publish: true } }
  ];
  
  // Run tests...
}
```

## Best Practices

1. **Always check permissions before showing UI elements**
   - Hide create button if user cannot create
   - Hide edit/delete buttons if user cannot edit/delete
   - Show disabled state with tooltip explaining why

2. **Use AssistantContext methods when possible**
   - They already include permission checks
   - Consistent error handling
   - Automatic error display

3. **Show clear error messages**
   - Use the `reason` field from permission results
   - Display in toast notifications or alerts
   - Guide users on what they need to do (e.g., "请先登录")

4. **Handle permission errors gracefully**
   - Don't crash the app
   - Show user-friendly messages
   - Provide alternative actions when possible

## Migration from Old Code

If you have existing code without permission checks:

### Before:
```typescript
<Button onClick={openCreateSidebar}>创建助理</Button>
```

### After:
```typescript
const currentUser = useCurrentUser();
const canCreate = assistantPermissionService.canCreate(currentUser);

{canCreate.allowed && (
  <Button onClick={openCreateSidebar}>创建助理</Button>
)}
```

Or simply use the context method which already checks:
```typescript
// openCreateSidebar already checks permissions internally
<Button onClick={openCreateSidebar}>创建助理</Button>
```

## API Integration

The permission checks are also enforced on the server side:

- `POST /api/assistants` - Checks canCreate
- `PUT /api/assistants/:id` - Checks canEdit
- `DELETE /api/assistants/:id` - Checks canDelete
- `PUT /api/assistants/:id/status` - Checks canPublish (for admin operations)

This ensures security even if client-side checks are bypassed.
