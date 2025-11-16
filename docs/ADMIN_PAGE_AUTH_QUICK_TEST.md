# Admin Page Authentication - Quick Test Guide

## Quick Test Checklist

### ✅ Test 1: Unauthenticated Access
**Expected:** Login form shown, no admin interface

1. Open browser in incognito/private mode
2. Navigate to `http://localhost:3000/admin`
3. **Verify:** Login form is displayed
4. **Verify:** No user management interface visible
5. **Verify:** Bootstrap section shown if no admin exists

### ✅ Test 2: Login as Normal User
**Expected:** Access denied message

1. Login with a normal user account
2. Navigate to `/admin`
3. **Verify:** "访问被拒绝" (Access Denied) message shown
4. **Verify:** Current user email and role displayed
5. **Verify:** No admin interface visible

### ✅ Test 3: Login as Admin
**Expected:** Full admin interface

1. Login with admin account (default: admin@drone-analyzer.com)
2. Navigate to `/admin`
3. **Verify:** User management section visible
4. **Verify:** User list displayed
5. **Verify:** Can change user roles
6. **Verify:** Current admin info shown in header

### ✅ Test 4: Bootstrap Flow
**Expected:** Can create first admin

1. Reset database: `npm run reset-db`
2. Navigate to `/admin`
3. **Verify:** Bootstrap warning section shown
4. Enter email and click "引导设为管理员"
5. **Verify:** Success message shown
6. Login with the email
7. **Verify:** Admin interface now accessible

### ✅ Test 5: Role Management
**Expected:** Can change user roles

1. Login as admin
2. Go to user management section
3. Enter user email and select role
4. Click "保存角色"
5. **Verify:** Confirmation dialog shown
6. **Verify:** Success toast notification
7. **Verify:** User list updates with new role

## Common Issues

### Issue: "找不到模块" TypeScript Error
**Solution:** This is a temporary caching issue. Restart the dev server or run `npm run build` to resolve.

### Issue: Login Doesn't Work
**Solution:** 
1. Check if JWT_SECRET is set in .env.local
2. Verify database exists and has users table
3. Check browser console for errors

### Issue: Access Denied for Admin User
**Solution:**
1. Verify user role in database is "admin"
2. Check JWT token payload
3. Clear cookies and login again

## API Endpoints Used

- `GET /api/auth/current` - Get current user info
- `POST /api/auth/login` - Login user
- `POST /api/admin/bootstrap` - Create first admin
- `GET /api/admin/users/list` - List all users (admin only)
- `POST /api/admin/users/set-role` - Change user role (admin only)

## Default Credentials

After running `npm run reset-db`:
- **Email:** admin@drone-analyzer.com
- **Password:** admin123456

⚠️ **Security Note:** Change the default password immediately after first login in production!

## Success Criteria

All tests pass when:
- ✅ Unauthenticated users see login form only
- ✅ Non-admin users see access denied message
- ✅ Admin users see full interface
- ✅ Bootstrap works for first-time setup
- ✅ Role management functions correctly
- ✅ All toast notifications appear
- ✅ Page reloads after login to refresh auth state

## Next Steps

After verifying all tests pass:
1. Proceed to Task 6: Update review page with authentication
2. Test the review page authentication flow
3. Verify end-to-end admin workflows
