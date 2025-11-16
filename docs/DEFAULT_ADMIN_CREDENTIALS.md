# Default Admin Credentials

## Overview

This document contains the default administrator credentials for the Drone Analyzer system. These credentials are created automatically when the user database is reset using the database reset script.

## Default Credentials

```
Email:    admin@drone-analyzer.com
Password: admin123456
```

## Security Information

### ⚠️ IMPORTANT SECURITY NOTICE

**These are default credentials intended ONLY for initial system setup.**

You **MUST** change the default password immediately after your first login for security reasons.

### When to Use These Credentials

- **Initial System Setup**: Use these credentials when setting up the system for the first time
- **Database Reset**: After running the database reset script (`npm run db:reset-users`)
- **Emergency Access**: When you need to regain admin access after losing credentials

### Security Best Practices

1. **Change Password Immediately**: After first login, change the password to a strong, unique password
2. **Use Strong Passwords**: Choose passwords with:
   - At least 12 characters
   - Mix of uppercase and lowercase letters
   - Numbers and special characters
   - No dictionary words or personal information

3. **Never Share Credentials**: Keep admin credentials confidential
4. **Regular Password Updates**: Change passwords periodically
5. **Monitor Admin Activity**: Review admin action logs regularly

## How to Reset the Database

If you need to reset the user database and recreate the default admin account:

### Using npm script (with confirmation):
```bash
npm run db:reset-users
```

### Using npm script (skip confirmation):
```bash
npm run db:reset-users:force
```

### Manual execution:
```bash
npx ts-node scripts/reset-user-db.ts
```

## Verifying the Default Admin Account

After resetting the database, you can verify the default admin account was created correctly:

```bash
npx ts-node scripts/test-default-admin-login.ts
```

This will:
- Check if the admin user exists in the database
- Verify the password hash is correct
- Confirm the user role is set to "admin"
- Display account information

## Admin Account Details

When the default admin account is created, it has the following properties:

| Property | Value |
|----------|-------|
| **Email** | admin@drone-analyzer.com |
| **Password** | admin123456 |
| **Username** | admin |
| **Name** | System Administrator |
| **Role** | admin |

## Accessing the Admin Interface

### 1. Login Page
Navigate to the login page and enter the default credentials:
- URL: `http://localhost:3000/login`
- Email: `admin@drone-analyzer.com`
- Password: `admin123456`

### 2. Admin Dashboard
After successful login, access the admin interface:
- URL: `http://localhost:3000/admin`

### 3. Review Page
Access the assistant review page:
- URL: `http://localhost:3000/admin/review`

## Troubleshooting

### Cannot Login with Default Credentials

If you cannot login with the default credentials:

1. **Verify Database Reset**: Ensure you ran the reset script successfully
   ```bash
   npm run db:reset-users:force
   ```

2. **Check Database File**: Verify the database file exists
   - Location: `data/users.db`
   - The file should be created automatically

3. **Test Credentials**: Run the verification script
   ```bash
   npx ts-node scripts/test-default-admin-login.ts
   ```

4. **Check Console Logs**: Look for error messages in the browser console or server logs

### Database Not Found

If you get a "database not found" error:

1. The `data` directory should be created automatically
2. If not, create it manually: `mkdir data`
3. Run the reset script again

### Permission Denied

If you get permission errors:

1. Check file permissions on the `data` directory
2. Ensure your user has write access
3. On Unix systems: `chmod 755 data`

## Related Documentation

- [Admin Authentication System](./ADMIN_AUTH_QUICK_REFERENCE.md)
- [Database Reset Guide](./DATABASE_RESET_GUIDE.md)
- [JWT Authentication System](./JWT_AUTH_SYSTEM.md)
- [Security Implementation](./SECURITY_IMPLEMENTATION.md)

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-05 | 1.0.0 | Initial documentation created |

## Support

If you encounter issues with the default admin credentials or database reset:

1. Check the troubleshooting section above
2. Review the server logs for error messages
3. Verify all dependencies are installed: `npm install`
4. Ensure the database directory has proper permissions

---

**Last Updated**: November 5, 2025  
**Document Version**: 1.0.0
