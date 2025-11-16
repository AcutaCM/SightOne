# Admin Authentication Wrapper Guide

## Overview

The `withAdminAuth` Higher-Order Component (HOC) provides server-side authentication and authorization for admin pages. It validates JWT tokens, verifies admin roles, and handles redirects for unauthorized users.

## Requirements Addressed

- **2.1**: Verify JWT Token before rendering admin pages
- **2.2**: Redirect to login if JWT Token is missing
- **2.3**: Redirect to login if JWT Token is invalid
- **2.4**: Display "Access Denied" for non-admin users and pass user data to components

## Installation

The HOC is located at `lib/auth/withAdminAuth.tsx` and is ready to use.

## Basic Usage

### Protecting an Admin Page

```tsx
// app/admin/page.tsx
import { withAdminAuth, WithAdminAuthProps } from '@/lib/auth/withAdminAuth';

interface AdminPageProps extends WithAdminAuthProps {
  // Your additional props
}

async function AdminPage({ authResult }: AdminPageProps) {
  // Check if user is admin
  if (!authResult.isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You must be an administrator to access this page.</p>
      </div>
    );
  }

  // Render admin interface
  return (
    <div className="p-8">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {authResult.user?.email}</p>
    </div>
  );
}

// Wrap the component with authentication
export default withAdminAuth(AdminPage);
```

### Custom Redirect Path

```tsx
export default withAdminAuth(AdminPage, {
  requireAdmin: true,
  redirectTo: '/unauthorized'
});
```

### Allow Non-Admin Authenticated Users

```tsx
export default withAdminAuth(AdminPage, {
  requireAdmin: false, // Allow any authenticated user
  redirectTo: '/login'
});
```

## Utility Functions

### requireAdminAuth()

Use this in server components when you need to ensure admin authentication without using the HOC:

```tsx
import { requireAdminAuth } from '@/lib/auth/withAdminAuth';

export default async function AdminPage() {
  // This will redirect to login if not authenticated or not admin
  const user = await requireAdminAuth();
  
  return (
    <div>
      <h1>Welcome, {user.email}</h1>
    </div>
  );
}
```

### getCurrentUser()

Get the current user without requiring admin role:

```tsx
import { getCurrentUser } from '@/lib/auth/withAdminAuth';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Profile: {user.email}</h1>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### getAdminAuth()

Get detailed authentication information:

```tsx
import { getAdminAuth } from '@/lib/auth/withAdminAuth';

export default async function AdminPage() {
  const authResult = await getAdminAuth();
  
  if (!authResult.isAuthenticated) {
    return <div>Not authenticated</div>;
  }
  
  if (!authResult.isAdmin) {
    return <div>Not an admin</div>;
  }
  
  return <div>Welcome, admin!</div>;
}
```

## Authentication Flow

```
1. User requests admin page
   ↓
2. withAdminAuth checks for access_token cookie
   ↓
3. If no token → redirect to /login
   ↓
4. If token exists → verify with JWT
   ↓
5. If invalid token → redirect to /login
   ↓
6. If valid token → check role
   ↓
7. If not admin → pass authResult with isAdmin=false
   ↓
8. Component decides how to handle non-admin users
```

## AuthResult Interface

```typescript
interface AdminAuthResult {
  isAuthenticated: boolean;  // Is user logged in?
  isAdmin: boolean;          // Does user have admin role?
  user: {
    email: string;
    role: string;
    userId: string;
  } | null;
  error?: string;            // Error message if auth failed
}
```

## Error Handling

The HOC handles errors gracefully:

- **No token**: Redirects to login
- **Invalid token**: Redirects to login
- **Expired token**: Redirects to login
- **Non-admin user**: Passes authResult to component (component decides UI)
- **Server error**: Returns unauthenticated state

## Security Features

1. **Server-side validation**: All authentication happens on the server
2. **HttpOnly cookies**: Tokens stored in secure cookies
3. **Role verification**: Checks admin role from JWT payload
4. **Automatic redirect**: Unauthorized users redirected to login
5. **Error logging**: Failed auth attempts logged for security monitoring

## Testing

Test files are located at `lib/auth/__tests__/withAdminAuth.test.ts`

Run tests:
```bash
npm test -- withAdminAuth
```

## Common Patterns

### Admin-Only Page

```tsx
export default withAdminAuth(AdminPage);
```

### Conditional Admin Features

```tsx
async function DashboardPage({ authResult }: WithAdminAuthProps) {
  return (
    <div>
      <h1>Dashboard</h1>
      {authResult.isAdmin && (
        <AdminControls />
      )}
    </div>
  );
}

export default withAdminAuth(DashboardPage, { requireAdmin: false });
```

### Multiple Role Checks

```tsx
async function ManagementPage({ authResult }: WithAdminAuthProps) {
  if (!authResult.isAuthenticated) {
    return <LoginPrompt />;
  }
  
  if (!authResult.isAdmin) {
    return <AccessDenied />;
  }
  
  return <AdminInterface user={authResult.user} />;
}

export default withAdminAuth(ManagementPage);
```

## Troubleshooting

### "No authentication token found"
- User is not logged in
- Cookie was cleared
- Solution: Redirect to login page

### "Invalid or expired token"
- Token has expired (>7 days)
- Token was tampered with
- Solution: User needs to log in again

### "User is not an admin"
- User is authenticated but doesn't have admin role
- Solution: Show access denied message or upgrade user role

## Related Documentation

- [JWT Authentication System](./JWT_AUTH_SYSTEM.md)
- [Admin Page Redesign](./ADMIN_PAGE_REDESIGN.md)
- [Database Reset Guide](./DATABASE_RESET_GUIDE.md)

## Next Steps

After implementing this HOC:
1. Update admin pages to use `withAdminAuth`
2. Update review page to use `withAdminAuth`
3. Test authentication flow
4. Verify redirect behavior
5. Check error handling
