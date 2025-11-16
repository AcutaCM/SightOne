# Admin Quick Start Guide

## Default Admin Credentials

```
Email:    admin@drone-analyzer.com
Password: admin123456
```

⚠️ **Change this password immediately after first login!**

## Quick Commands

### Reset Database & Create Admin
```bash
npm run db:reset-users:force
```

### Verify Admin Account
```bash
npm run db:test-admin
```

### Start Development Server
```bash
npm run dev
```

## Access Points

- **Login**: http://localhost:3000/login
- **Admin Dashboard**: http://localhost:3000/admin
- **Review Page**: http://localhost:3000/admin/review

## First Time Setup

1. Reset the database:
   ```bash
   npm run db:reset-users:force
   ```

2. Verify admin account:
   ```bash
   npm run db:test-admin
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

4. Login at http://localhost:3000/login with default credentials

5. **IMPORTANT**: Change your password immediately!

## Troubleshooting

### Can't Login?
```bash
# Reset and try again
npm run db:reset-users:force
npm run db:test-admin
```

### Database Issues?
Check that `data/users.db` exists and has proper permissions.

## Documentation

- [Full Credentials Documentation](./DEFAULT_ADMIN_CREDENTIALS.md)
- [Task 9 Completion Report](./TASK_9_DATABASE_RESET_COMPLETE.md)
- [Admin Auth System](./ADMIN_AUTH_QUICK_REFERENCE.md)

---

**Quick Tip**: Bookmark this page for easy access to admin credentials and commands!
