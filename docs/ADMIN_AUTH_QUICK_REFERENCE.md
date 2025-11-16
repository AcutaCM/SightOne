# Admin Authentication Wrapper - Quick Reference

## Import

```tsx
import { withAdminAuth, WithAdminAuthProps } from '@/lib/auth/withAdminAuth';
```

## Basic Usage

```tsx
// 1. Define your component with WithAdminAuthProps
interface MyPageProps extends WithAdminAuthProps {}

async function MyAdminPage({ authResult }: MyPageProps) {
  // 2. Check admin status
  if (!authResult.isAdmin) {
    return <div>Access Denied</div>;
  }
  
  // 3. Render admin content
  return <div>Admin Content</div>;
}

// 4. Wrap with HOC
export default withAdminAuth(MyAdminPage);
```

## AuthResult Properties

```tsx
authResult.isAuthenticated  // boolean - Is user logged in?
authResult.isAdmin          // boolean - Is user an admin?
authResult.user?.email      // string - User's email
authResult.user?.role       // string - User's role
authResult.user?.userId     // string - User's ID
authResult.error            // string? - Error message if any
```

## Options

```tsx
withAdminAuth(Component, {
  requireAdmin: true,        // Require admin role (default: true)
  redirectTo: '/login'       // Redirect path (default: '/login')
});
```

## Utility Functions

```tsx
// Require admin auth (redirects if not admin)
const user = await requireAdminAuth();

// Get current user (returns null if not authenticated)
const user = await getCurrentUser();

// Get detailed auth info
const authResult = await getAdminAuth();
```

## Common Patterns

### Admin-Only Page
```tsx
export default withAdminAuth(AdminPage);
```

### Show Access Denied
```tsx
if (!authResult.isAdmin) {
  return <AccessDeniedMessage />;
}
```

### Conditional Admin Features
```tsx
{authResult.isAdmin && <AdminControls />}
```

## Requirements Covered

✅ **2.1** - Verify JWT Token before rendering  
✅ **2.2** - Redirect if token missing  
✅ **2.3** - Redirect if token invalid  
✅ **2.4** - Verify admin role & pass user data  

## Security Notes

- All validation happens server-side
- Tokens stored in HttpOnly cookies
- Automatic redirect for unauthorized users
- Failed attempts logged for security

## File Location

`drone-analyzer-nextjs/lib/auth/withAdminAuth.tsx`
