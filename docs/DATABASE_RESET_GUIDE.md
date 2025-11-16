# Database Reset Guide

## Overview

The database reset script (`scripts/reset-user-db.ts`) is a utility for resetting the user authentication database and creating a default admin account. This is useful for:

- Initial system setup
- Development and testing
- Recovering from authentication issues
- Resetting the admin account

## Default Admin Credentials

After running the reset script, the following default admin account will be created:

```
Email:    admin@drone-analyzer.com
Password: admin123456
Role:     admin
```

⚠️ **SECURITY WARNING**: These are default credentials and should be changed immediately after first login!

## Usage

### Basic Usage (with confirmation prompt)

```bash
npm run db:reset-users
```

This will:
1. Prompt you to confirm the reset operation
2. Delete all existing users from the database
3. Create a new default admin account
4. Display the default credentials

### Force Mode (skip confirmation)

```bash
npm run db:reset-users:force
```

Use this mode when you want to skip the confirmation prompt. Useful for:
- Automated scripts
- CI/CD pipelines
- Quick resets during development

### Verbose Mode

```bash
npm run db:reset-users -- --force --verbose
```

Verbose mode provides detailed output about each step:
- Database connection status
- Number of users deleted
- Admin account creation details
- Database operations

## What the Script Does

1. **Ensures Database Directory Exists**
   - Creates the `data/` directory if it doesn't exist

2. **Initializes Database Schema**
   - Creates the `users` table if it doesn't exist
   - Creates necessary indexes for performance

3. **Clears All Users**
   - Deletes all existing user records from the database
   - Reports the number of users deleted (in verbose mode)

4. **Creates Default Admin**
   - Generates a secure bcrypt hash of the default password (10 salt rounds)
   - Inserts the admin user with the following details:
     - Username: `admin`
     - Email: `admin@drone-analyzer.com`
     - Name: `System Administrator`
     - Role: `admin`

5. **Displays Credentials**
   - Shows the default admin credentials
   - Displays a security warning

## Security Considerations

### Password Hashing

The script uses bcrypt with 10 salt rounds to hash the default password. This provides strong protection against:
- Rainbow table attacks
- Brute force attacks
- Dictionary attacks

### Default Credentials

The default credentials are intentionally simple for initial setup, but they should be changed immediately after first login. To change the password:

1. Log in with the default credentials
2. Navigate to the admin settings
3. Update your password to a strong, unique password

### Database Location

The user database is stored at:
```
<project-root>/data/users.db
```

Ensure this directory has appropriate permissions and is not publicly accessible.

## Troubleshooting

### Script Fails to Run

**Error**: `Cannot find module 'better-sqlite3'`

**Solution**: Install dependencies
```bash
npm install
```

### Database Locked Error

**Error**: `database is locked`

**Solution**: Close any applications that might be accessing the database:
- Stop the development server
- Close any database browser tools
- Wait a few seconds and try again

### Permission Denied

**Error**: `EACCES: permission denied`

**Solution**: Ensure you have write permissions to the `data/` directory:
```bash
# On Unix/Linux/Mac
chmod -R 755 data/

# On Windows, check folder permissions in Properties
```

### Script Hangs on Confirmation

If the script hangs waiting for confirmation, you can:
- Type `yes` and press Enter to continue
- Type `no` and press Enter to cancel
- Press Ctrl+C to abort
- Use `--force` flag to skip confirmation

## Integration with Other Scripts

The reset script can be integrated into other workflows:

### Development Setup Script

```bash
#!/bin/bash
# setup-dev.sh

echo "Setting up development environment..."
npm install
npm run db:reset-users:force
npm run migrate
echo "Development environment ready!"
```

### Testing Setup

```javascript
// test-setup.js
const { execSync } = require('child_process');

beforeAll(() => {
  // Reset database before tests
  execSync('npm run db:reset-users:force', { stdio: 'inherit' });
});
```

## Related Documentation

- [JWT Authentication System](./JWT_AUTH_SYSTEM.md)
- [Admin Authentication Fix](../.kiro/specs/admin-auth-fix/design.md)
- [User Database Schema](../lib/auth/userDatabase.ts)

## Command Reference

| Command | Description |
|---------|-------------|
| `npm run db:reset-users` | Reset database with confirmation prompt |
| `npm run db:reset-users:force` | Reset database without confirmation |
| `npm run db:reset-users -- --verbose` | Reset with detailed output |
| `npm run db:reset-users -- --force --verbose` | Force reset with detailed output |

## Support

If you encounter issues with the reset script:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the script source code at `scripts/reset-user-db.ts`
3. Check the database file exists at `data/users.db`
4. Verify Node.js and npm are properly installed
5. Ensure all dependencies are installed (`npm install`)
