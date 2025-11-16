# Set Role API Endpoint Guide

## Overview

The Set Role API endpoint allows administrators to update user roles in the system. This endpoint is protected with admin authentication and includes comprehensive validation and audit logging.

## Endpoint Details

**URL:** `/api/admin/users/set-role`  
**Method:** `POST`  
**Authentication:** Required (Admin only)  
**Requirements:** 4.4

## Request Format

```json
{
  "email": "user@example.com",
  "role": "admin" | "user" | "normal"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | Email address of the user to update |
| role | string | Yes | New role for the user (admin, user, or normal) |

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "email": "user@example.com",
    "oldRole": "user",
    "newRole": "admin",
    "updatedBy": "admin@example.com",
    "timestamp": "2025-11-05T12:34:56.789Z"
  }
}
```

### Error Responses

#### 400 - Invalid Email
```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Valid email is required"
  }
}
```

#### 400 - Invalid Email Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL_FORMAT",
    "message": "Invalid email format"
  }
}
```

#### 400 - Invalid Role
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ROLE",
    "message": "Role must be one of: admin, user, normal"
  }
}
```

#### 400 - Last Admin Protection
```json
{
  "success": false,
  "error": {
    "code": "LAST_ADMIN",
    "message": "Cannot remove the last admin user"
  }
}
```

#### 400 - Self Role Change
```json
{
  "success": false,
  "error": {
    "code": "SELF_ROLE_CHANGE",
    "message": "Cannot change your own role"
  }
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Admin authentication required"
  }
}
```

#### 403 - Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "权限不足"
  }
}
```

#### 404 - User Not Found
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

#### 500 - Internal Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to update user role"
  }
}
```

## Security Features

### 1. Admin Authentication
- Only authenticated admin users can access this endpoint
- JWT token validation is performed server-side
- Invalid or missing tokens result in 401 Unauthorized

### 2. Email Validation
- Email parameter is required and must be a string
- Email format is validated using regex pattern
- Invalid emails are rejected with 400 Bad Request

### 3. Role Validation
- Role parameter is required and must be a string
- Only valid roles (admin, user, normal) are accepted
- Invalid roles are rejected with 400 Bad Request

### 4. Last Admin Protection
- System prevents removing the last admin user
- Checks admin count before allowing role change
- Ensures at least one admin always exists

### 5. Self-Role Change Prevention
- Admins cannot change their own role
- Prevents accidental privilege escalation or removal
- Requires another admin to change roles

### 6. Audit Logging
- All role changes are logged with timestamp
- Logs include: admin email, target email, old role, new role
- Failed attempts are also logged for security monitoring

## Usage Examples

### Example 1: Promote User to Admin

```javascript
const response = await fetch('/api/admin/users/set-role', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies for authentication
  body: JSON.stringify({
    email: 'user@example.com',
    role: 'admin',
  }),
});

const data = await response.json();
if (data.success) {
  console.log('User promoted to admin:', data.data);
} else {
  console.error('Failed to update role:', data.error);
}
```

### Example 2: Demote Admin to User

```javascript
const response = await fetch('/api/admin/users/set-role', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@example.com',
    role: 'user',
  }),
});

const data = await response.json();
if (data.success) {
  console.log('Admin demoted to user:', data.data);
} else {
  console.error('Failed to update role:', data.error);
}
```

### Example 3: Error Handling

```javascript
try {
  const response = await fetch('/api/admin/users/set-role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      email: 'user@example.com',
      role: 'admin',
    }),
  });

  const data = await response.json();
  
  if (!data.success) {
    switch (data.error.code) {
      case 'LAST_ADMIN':
        alert('Cannot remove the last admin user');
        break;
      case 'SELF_ROLE_CHANGE':
        alert('You cannot change your own role');
        break;
      case 'USER_NOT_FOUND':
        alert('User not found');
        break;
      default:
        alert('Failed to update role: ' + data.error.message);
    }
  } else {
    alert('Role updated successfully');
  }
} catch (error) {
  console.error('Network error:', error);
  alert('Failed to connect to server');
}
```

## Audit Log Format

All role changes are logged to the console in the following format:

```
[AUDIT] 2025-11-05T12:34:56.789Z - Admin admin@example.com changed role of user@example.com from user to admin
```

Failed attempts are also logged:

```
[AUDIT] 2025-11-05T12:34:56.789Z - Failed role update attempt by admin admin@example.com: Error message
```

## Integration with Admin Page

The Set Role API is designed to be used with the admin page user management interface:

1. Admin page fetches user list using `/api/admin/users/list`
2. Admin selects a user and chooses a new role
3. Admin page calls `/api/admin/users/set-role` with email and role
4. Success/error message is displayed to admin
5. User list is refreshed to show updated role

## Testing

Run the test suite to verify the endpoint functionality:

```bash
npm test -- __tests__/api/admin/set-role.test.ts --no-watch
```

The test suite covers:
- Email validation
- Role validation
- Role update functionality
- Last admin protection
- Self-role change prevention
- Audit logging

## Related Documentation

- [Admin Authentication System](./ADMIN_AUTH_QUICK_REFERENCE.md)
- [User Database Schema](./DATABASE_RESET_GUIDE.md)
- [Admin Page Guide](./ADMIN_PAGE_AUTH_UPDATE.md)
- [JWT Authentication](./JWT_AUTH_QUICK_REFERENCE.md)

## Troubleshooting

### Issue: 401 Unauthorized
**Solution:** Ensure you're logged in as an admin and the JWT token is valid.

### Issue: Cannot change role
**Solution:** Check if you're trying to change your own role or remove the last admin.

### Issue: User not found
**Solution:** Verify the email address is correct and the user exists in the database.

### Issue: Invalid role
**Solution:** Ensure the role is one of: admin, user, or normal (case-sensitive).
