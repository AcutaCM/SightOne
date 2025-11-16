# Preset Protection and Admin System

## Overview

This document describes the implementation of the preset protection and admin permission system for the Intelligent Agent preset assistant.

## Implementation Summary

### Task 5.1: Preset Protection Mechanism ✅

**Requirements Addressed:**
- 6.1: Mark intelligent agent as system preset (author='system')
- 6.2: Prevent regular users from deleting system presets
- 6.3: Prevent regular users from modifying system presets

**Implementation:**

1. **Preset Protection Module** (`lib/security/presetProtection.ts`)
   - `isSystemPreset()`: Check if an assistant is a system preset
   - `canDeleteAssistant()`: Validate deletion permissions
   - `canModifyAssistant()`: Validate modification permissions
   - `getProtectionMessage()`: Get UI protection message
   - `validateAssistantData()`: Validate assistant data before operations

2. **Constants Configuration** (`lib/constants/intelligentAgentPreset.ts`)
   - Preset metadata includes `author: 'system'`
   - Protected preset IDs list: `['tello-intelligent-agent']`

3. **Database Migration** (`lib/db/migrations/intelligentAgentPresetMigration.ts`)
   - Ensures preset is created with `author='system'`
   - Idempotent migration that checks for existing preset

4. **Context Integration** (`contexts/AssistantContext.tsx`)
   - Integrated protection checks in `updateAssistant()`
   - Integrated protection checks in `deleteAssistant()`
   - Exposed protection methods to components
   - Shows clear error messages when operations are blocked

5. **API Route Protection** (`app/api/assistants/[id]/route.ts`)
   - Server-side validation in PUT endpoint
   - Server-side validation in DELETE endpoint
   - Returns 403 Forbidden for unauthorized operations

### Task 5.2: Admin Role Management ✅

**Requirements Addressed:**
- 6.4: Only allow admins to modify intelligent agent preset
- 6.5: Record all modification operations

**Implementation:**

1. **Admin Role Module** (`lib/security/adminRole.ts`)
   - `isAdmin()`: Check if a user ID is an admin
   - `getCurrentUserId()`: Get current user from session/auth
   - `isCurrentUserAdmin()`: Check if current user is admin
   - `requireAdmin()`: Throw error if not admin
   - `checkAdminRole()`: Get detailed admin check result

2. **Operation Logging Module** (`lib/security/operationLog.ts`)
   - `logOperation()`: Generic operation logger
   - `logCreate()`: Log assistant creation
   - `logUpdate()`: Log assistant updates
   - `logDelete()`: Log assistant deletions
   - `logStatusChange()`: Log status changes
   - `logPresetModify()`: Log preset modifications
   - `getOperationLogs()`: Query operation logs
   - `exportOperationLogs()`: Export logs to JSON

3. **API Integration**
   - All modification endpoints check admin status
   - All operations are logged (success and failure)
   - Logs include: timestamp, operation type, user ID, admin status, changes, errors

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         AssistantContext                              │  │
│  │  - canDeleteAssistant()                              │  │
│  │  - canModifyAssistant()                              │  │
│  │  - isSystemPreset()                                  │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Preset Protection Module                         │  │
│  │  - Permission validation                              │  │
│  │  - Protection messages                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Routes (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PUT /api/assistants/[id]                            │  │
│  │  DELETE /api/assistants/[id]                         │  │
│  │  PATCH /api/assistants/[id]/status                   │  │
│  │                                                        │  │
│  │  1. Check admin status                                │  │
│  │  2. Validate permissions                              │  │
│  │  3. Perform operation                                 │  │
│  │  4. Log operation                                     │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Admin Role Module                                │  │
│  │  - getCurrentUserId()                                 │  │
│  │  - isAdmin()                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Operation Log Module                             │  │
│  │  - logUpdate()                                        │  │
│  │  - logDelete()                                        │  │
│  │  - logStatusChange()                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (SQLite)                         │
│  - assistants table (author='system' for presets)           │
│  - migrations table (tracks applied migrations)              │
└─────────────────────────────────────────────────────────────┘
```

## Security Features

### 1. Multi-Layer Protection

- **Client-side validation**: Fast feedback, prevents unnecessary API calls
- **Server-side validation**: Authoritative security enforcement
- **Database constraints**: Final layer of data integrity

### 2. Permission Checks

```typescript
// Check if user can delete
const deleteCheck = canDeleteAssistant(assistant, isAdmin);
if (!deleteCheck.allowed) {
  // Show error: deleteCheck.reason
}

// Check if user can modify
const modifyCheck = canModifyAssistant(assistant, isAdmin);
if (!modifyCheck.allowed) {
  // Show error: modifyCheck.reason
}
```

### 3. Operation Logging

All operations are logged with:
- Timestamp
- Operation type (create, update, delete, status_change)
- Assistant ID and title
- User ID
- Admin status
- Changes made
- Success/failure status
- Error messages (if failed)

### 4. Admin Role Management

```typescript
// Check if current user is admin
const isAdmin = isCurrentUserAdmin();

// Require admin or throw error
requireAdmin(); // Throws if not admin

// Get detailed admin check
const check = checkAdminRole();
// { isAdmin: boolean, userId: string | null, message: string }
```

## Usage Examples

### Frontend: Check Permissions Before Action

```typescript
import { useAssistants } from '@/contexts/AssistantContext';

function AssistantCard({ assistant }) {
  const { canDeleteAssistant, canModifyAssistant, getProtectionMessage } = useAssistants();
  
  // Check if user can delete
  const deleteCheck = canDeleteAssistant(assistant);
  
  // Check if user can modify
  const modifyCheck = canModifyAssistant(assistant);
  
  // Get protection message for UI
  const protectionMsg = getProtectionMessage(assistant);
  
  return (
    <div>
      {protectionMsg && <div className="text-warning">{protectionMsg}</div>}
      
      <button 
        disabled={!modifyCheck.allowed}
        onClick={handleEdit}
      >
        Edit
      </button>
      
      <button 
        disabled={!deleteCheck.allowed}
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
}
```

### Backend: Enforce Permissions

```typescript
// In API route
import { canModifyAssistant } from '@/lib/security/presetProtection';
import { getCurrentUserId, isAdmin } from '@/lib/security/adminRole';
import { logUpdate } from '@/lib/security/operationLog';

// Get user and check permissions
const userId = getCurrentUserId();
const userIsAdmin = isAdmin(userId);
const modifyCheck = canModifyAssistant(existing, userIsAdmin);

if (!modifyCheck.allowed) {
  // Log failed attempt
  logUpdate(id, existing.title, userId, userIsAdmin, {}, {}, false, modifyCheck.reason);
  
  // Return 403 Forbidden
  return NextResponse.json({ error: modifyCheck.reason }, { status: 403 });
}

// Perform update
const updated = repository.update(id, updates, version);

// Log successful update
logUpdate(id, updated.title, userId, userIsAdmin, updates, { version }, true);
```

## Configuration

### Admin Users

Edit `lib/security/adminRole.ts` to configure admin users:

```typescript
const ADMIN_USERS = [
  'admin',
  'system',
  // Add more admin user IDs here
];
```

### Protected Presets

Edit `lib/security/presetProtection.ts` to add more protected presets:

```typescript
export const PROTECTED_PRESET_IDS = [
  'tello-intelligent-agent',
  // Add more preset IDs here
];
```

## Future Enhancements

### 1. Database-Backed Admin Management

Currently, admin users are hardcoded. Future enhancement:
- Store admin roles in database
- Admin management UI
- Role-based permissions (admin, moderator, user)

### 2. Persistent Operation Logs

Currently, logs are in-memory. Future enhancement:
- Store logs in database
- Log retention policies
- Log search and filtering UI
- Export logs to CSV/JSON

### 3. Auth System Integration

Currently, user ID is from localStorage (placeholder). Future enhancement:
- Integrate with NextAuth.js or similar
- JWT token validation
- Session management
- OAuth providers

### 4. Audit Trail UI

Future enhancement:
- Admin dashboard showing operation logs
- Filter by user, operation type, date range
- Export audit reports
- Real-time log streaming

## Testing

### Manual Testing

1. **Test Preset Protection**
   ```bash
   # Try to delete intelligent agent preset
   # Should show error: "系统预设助理不能被删除"
   
   # Try to modify intelligent agent preset
   # Should show error: "系统预设助理不能被修改"
   ```

2. **Test Admin Override**
   ```bash
   # Set userId to 'admin' in localStorage
   localStorage.setItem('userId', 'admin');
   
   # Now should be able to modify/delete preset
   ```

3. **Test Operation Logging**
   ```bash
   # Check console logs for operation records
   # Check file logs in logs/ directory
   ```

### Automated Testing

See `__tests__/security/` for unit tests:
- `presetProtection.test.ts`
- `adminRole.test.ts`
- `operationLog.test.ts`

## Troubleshooting

### Issue: Cannot modify preset even as admin

**Solution:** Check that userId is set correctly:
```typescript
// In browser console
localStorage.setItem('userId', 'admin');
```

### Issue: Operations not being logged

**Solution:** Check logger configuration in `lib/logger/logger.ts`

### Issue: Permission checks not working

**Solution:** Verify that:
1. Preset has `author='system'` in database
2. Preset ID is in `PROTECTED_PRESET_IDS` list
3. Admin check is using correct user ID

## Related Files

- `lib/security/presetProtection.ts` - Preset protection logic
- `lib/security/adminRole.ts` - Admin role management
- `lib/security/operationLog.ts` - Operation logging
- `contexts/AssistantContext.tsx` - Context integration
- `app/api/assistants/[id]/route.ts` - API route protection
- `lib/constants/intelligentAgentPreset.ts` - Preset constants
- `lib/db/migrations/intelligentAgentPresetMigration.ts` - Database migration

## Requirements Traceability

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| 6.1: Mark as system preset | Constants + Migration | ✅ |
| 6.2: Prevent user deletion | Protection module + API | ✅ |
| 6.3: Prevent user modification | Protection module + API | ✅ |
| 6.4: Admin-only modification | Admin role module + API | ✅ |
| 6.5: Log all operations | Operation log module + API | ✅ |

## Conclusion

The preset protection and admin system provides comprehensive security for system preset assistants. It implements multi-layer validation, operation logging, and admin role management to ensure that critical system presets cannot be accidentally or maliciously modified or deleted by regular users.
