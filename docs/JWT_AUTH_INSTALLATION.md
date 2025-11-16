# JWT Authentication System - Installation Guide

## Quick Start

Follow these steps to complete the JWT authentication system setup:

### Step 1: Install Dependencies

Run the following command to install the required `jose` package:

```bash
npm install jose
```

Or if you prefer yarn:

```bash
yarn add jose
```

### Step 2: Configure Environment Variables

Create or update `.env.local` file in the project root:

```env
# JWT Secret Key (REQUIRED - use a strong random string in production)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# User Database Path (optional, defaults to ./data/users.db)
USER_DB_PATH=./data/users.db

# Node Environment
NODE_ENV=development
```

**Important:** In production, generate a secure JWT_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Create Data Directory

The database will be created automatically, but you can create the directory manually:

```bash
mkdir -p data
```

### Step 4: Start the Development Server

```bash
npm run dev
```

### Step 5: Register First User (Admin)

1. Navigate to `http://localhost:3000/register`
2. Fill in the registration form:
   - Username (min 3 characters)
   - Email (valid email format)
   - Password (min 6 characters)
   - Name (optional)
3. Click "创建账户"
4. **First user automatically becomes admin!**

### Step 6: Test Authentication

1. **Login:** Navigate to `http://localhost:3000/login`
2. **Check Auth:** Visit `http://localhost:3000/api/auth/me`
3. **Logout:** Click logout button or POST to `/api/auth/logout`

## Verification Checklist

After installation, verify everything works:

- [ ] `npm install` completed without errors
- [ ] `.env.local` file created with JWT_SECRET
- [ ] Development server starts successfully
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] `/api/auth/me` returns user data
- [ ] Can logout successfully
- [ ] Database file created at `data/users.db`

## Troubleshooting

### Error: "Cannot find module 'jose'"

**Solution:**
```bash
npm install jose
```

### Error: "Cannot find module 'bcryptjs'"

**Solution:**
```bash
npm install bcryptjs @types/bcryptjs
```

### Error: "Cannot find module 'better-sqlite3'"

**Solution:**
```bash
npm install better-sqlite3 @types/better-sqlite3
```

### Error: "ENOENT: no such file or directory, open 'data/users.db'"

**Solution:**
The directory will be created automatically. If issues persist:
```bash
mkdir -p data
```

### Error: "JWT_SECRET is not defined"

**Solution:**
Create `.env.local` file with JWT_SECRET:
```env
JWT_SECRET=your-secret-key-here
```

### Database Locked Error

**Solution:**
- Ensure only one instance of the app is running
- Check file permissions on `data/users.db`
- Restart the development server

### TypeScript Errors

**Solution:**
```bash
npm install --save-dev @types/bcryptjs @types/better-sqlite3
```

## Testing the System

### Manual Testing

1. **Register Test:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

2. **Login Test:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

3. **Check Auth Test:**
```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

4. **Logout Test:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

### Automated Testing

Run the test suite:
```bash
npm test
```

## Production Deployment

### Before Deploying:

1. **Generate Strong JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **Update Environment Variables:**
```env
NODE_ENV=production
JWT_SECRET=<generated-secret-from-step-1>
USER_DB_PATH=/path/to/production/users.db
```

3. **Set Secure Cookies:**
The system automatically uses secure cookies in production (HTTPS only).

4. **Database Backup:**
Set up regular backups of `users.db`:
```bash
# Example backup script
cp data/users.db data/backups/users-$(date +%Y%m%d).db
```

5. **Monitor Logs:**
Check application logs for any authentication errors.

## Database Management

### View Users (SQLite CLI)

```bash
sqlite3 data/users.db "SELECT id, username, email, role, created_at FROM users;"
```

### Backup Database

```bash
cp data/users.db data/users-backup-$(date +%Y%m%d).db
```

### Reset Database (Development Only)

```bash
rm data/users.db
# Database will be recreated on next app start
```

## Next Steps

After successful installation:

1. Read `docs/JWT_AUTH_SYSTEM.md` for complete API documentation
2. Review `docs/JWT_AUTH_MIGRATION_COMPLETE.md` for security features
3. Implement protected routes using auth middleware
4. Add role-based access control to admin features
5. Consider implementing additional security features (2FA, email verification)

## Support

If you encounter issues:

1. Check this installation guide
2. Review `docs/JWT_AUTH_SYSTEM.md`
3. Check console logs for errors
4. Verify environment variables
5. Ensure all dependencies are installed

## Success!

If you can register, login, and see your user data at `/api/auth/me`, the JWT authentication system is working correctly! 🎉
