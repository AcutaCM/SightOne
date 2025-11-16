# Preset Assistants Expansion - Deployment Guide

This directory contains deployment scripts for the preset assistants expansion feature.

## Overview

The deployment scripts automate the following tasks:
1. **Environment Validation** - Checks Node.js, npm, and project structure
2. **Dependency Validation** - Ensures all required packages are installed
3. **Database Backup** - Creates a backup before making changes
4. **Database Migration** - Adds new columns and tables to support preset assistants
5. **Preset Initialization** - Creates 10 preset assistants in the database
6. **Deployment Validation** - Verifies that everything was deployed correctly
7. **Rollback Instructions** - Provides instructions if something goes wrong

## Scripts

### Linux/macOS: `deploy-preset-assistants.sh`

Bash script for Unix-based systems.

**Usage:**
```bash
# Make executable (first time only)
chmod +x scripts/deploy-preset-assistants.sh

# Normal deployment
./scripts/deploy-preset-assistants.sh

# Dry run (see what would happen without making changes)
./scripts/deploy-preset-assistants.sh --dry-run

# Skip backup (not recommended)
./scripts/deploy-preset-assistants.sh --skip-backup

# Skip validation (faster, but not recommended)
./scripts/deploy-preset-assistants.sh --skip-validation

# Show help
./scripts/deploy-preset-assistants.sh --help
```

### Windows: `deploy-preset-assistants.ps1`

PowerShell script for Windows systems.

**Usage:**
```powershell
# Normal deployment
.\scripts\deploy-preset-assistants.ps1

# Dry run (see what would happen without making changes)
.\scripts\deploy-preset-assistants.ps1 -DryRun

# Skip backup (not recommended)
.\scripts\deploy-preset-assistants.ps1 -SkipBackup

# Skip validation (faster, but not recommended)
.\scripts\deploy-preset-assistants.ps1 -SkipValidation

# Show help
.\scripts\deploy-preset-assistants.ps1 -Help
```

## Prerequisites

Before running the deployment script, ensure:

1. **Node.js** is installed (v16 or higher recommended)
2. **npm** is installed
3. All dependencies are installed (`npm install`)
4. You are in the project root directory
5. The application is stopped (recommended)

## What Gets Deployed

### Database Schema Changes

The migration adds the following to your database:

**New Columns in `assistants` table:**
- `category` (TEXT) - Stores assistant categories as JSON array
- `usage_count` (INTEGER) - Tracks how many times an assistant has been used
- `rating` (REAL) - Stores average user rating (0.0 to 5.0)

**New Tables:**
- `favorites` - Stores user favorites
  - `id`, `user_id`, `assistant_id`, `created_at`
- `ratings` - Stores user ratings and feedback
  - `id`, `user_id`, `assistant_id`, `rating`, `feedback`, `created_at`
- `usage_logs` - Tracks assistant usage
  - `id`, `user_id`, `assistant_id`, `duration`, `created_at`

**New Indexes:**
- Performance indexes on category, rating, usage_count
- Foreign key indexes for favorites, ratings, and usage_logs

### Preset Assistants

The script initializes 10 preset assistants:

1. **🚁 Tello智能代理** - Drone control assistant
2. **🌱 农业诊断专家** - Agricultural diagnosis expert
3. **📸 图像分析助手** - Image analysis assistant
4. **📊 数据分析师** - Data analyst
5. **💻 编程助手** - Coding assistant
6. **✍️ 写作助手** - Writing assistant
7. **🌐 翻译助手** - Translation assistant
8. **👨‍🏫 教育辅导老师** - Education tutor
9. **💬 客服助手** - Customer service assistant
10. **🎨 创意设计师** - Creative designer

## Deployment Process

### Step 1: Prepare

```bash
# Stop your application
npm run stop  # or however you stop your app

# Navigate to project root
cd /path/to/drone-analyzer-nextjs

# Ensure dependencies are installed
npm install
```

### Step 2: Run Deployment

**Linux/macOS:**
```bash
./scripts/deploy-preset-assistants.sh
```

**Windows:**
```powershell
.\scripts\deploy-preset-assistants.ps1
```

### Step 3: Verify

The script will automatically validate the deployment. Look for:
- ✓ All validation checks passed
- ✓ Preset assistants initialized successfully
- ✓ Database migrations completed successfully

### Step 4: Restart Application

```bash
# Start your application
npm run dev  # or npm run start for production
```

### Step 5: Test

1. Open your application in a browser
2. Navigate to the assistant market
3. Verify you can see the 10 preset assistants
4. Test the new features:
   - Category filtering
   - Search functionality
   - Favorites
   - Ratings

## Backup and Rollback

### Automatic Backup

The script automatically creates a backup before making any changes:
- Location: `data/backups/assistants_pre_deployment_YYYYMMDD-HHMMSS.db`
- The backup path is displayed during deployment

### Manual Rollback

If something goes wrong, you can manually rollback:

**Linux/macOS:**
```bash
# Stop the application
npm run stop

# Restore the backup
cp data/backups/assistants_pre_deployment_YYYYMMDD-HHMMSS.db data/assistants.db

# Restart the application
npm run dev
```

**Windows:**
```powershell
# Stop the application
npm run stop

# Restore the backup
Copy-Item data\backups\assistants_pre_deployment_YYYYMMDD-HHMMSS.db data\assistants.db -Force

# Restart the application
npm run dev
```

## Troubleshooting

### Issue: "Database not found"

**Solution:** The database will be created automatically during migration. This is normal for first-time deployments.

### Issue: "Migration already applied"

**Solution:** The migration has already been run. This is safe to ignore. The script will skip already-applied migrations.

### Issue: "Node.js not found"

**Solution:** Install Node.js from https://nodejs.org/ (v16 or higher recommended)

### Issue: "Permission denied" (Linux/macOS)

**Solution:** Make the script executable:
```bash
chmod +x scripts/deploy-preset-assistants.sh
```

### Issue: "Execution policy" error (Windows)

**Solution:** Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Validation checks fail

**Solution:** 
1. Check the log file for detailed error messages
2. Review the rollback instructions in the script output
3. Restore from backup if needed
4. Contact support with the log file

## Logs

Deployment logs are saved to:
- Location: `logs/deployment-YYYYMMDD-HHMMSS.log`
- Contains detailed information about each step
- Useful for troubleshooting

## Advanced Usage

### Dry Run

Test the deployment without making changes:

**Linux/macOS:**
```bash
./scripts/deploy-preset-assistants.sh --dry-run
```

**Windows:**
```powershell
.\scripts\deploy-preset-assistants.ps1 -DryRun
```

### Skip Backup

Skip the backup step (not recommended):

**Linux/macOS:**
```bash
./scripts/deploy-preset-assistants.sh --skip-backup
```

**Windows:**
```powershell
.\scripts\deploy-preset-assistants.ps1 -SkipBackup
```

### Skip Validation

Skip post-deployment validation (faster, but not recommended):

**Linux/macOS:**
```bash
./scripts/deploy-preset-assistants.sh --skip-validation
```

**Windows:**
```powershell
.\scripts\deploy-preset-assistants.ps1 -SkipValidation
```

## Production Deployment

For production environments:

1. **Schedule Maintenance Window** - Notify users of downtime
2. **Create Manual Backup** - In addition to automatic backup
3. **Test in Staging** - Run deployment in staging environment first
4. **Monitor Logs** - Watch application logs after deployment
5. **Keep Backup** - Don't delete backup until confirmed working
6. **Have Rollback Plan** - Be ready to rollback if issues occur

### Production Checklist

- [ ] Maintenance window scheduled
- [ ] Users notified
- [ ] Manual backup created
- [ ] Tested in staging
- [ ] Application stopped
- [ ] Deployment script executed
- [ ] Validation passed
- [ ] Application restarted
- [ ] Smoke tests passed
- [ ] Monitoring active
- [ ] Users notified of completion

## Support

If you encounter issues:

1. Check the log file: `logs/deployment-YYYYMMDD-HHMMSS.log`
2. Review the troubleshooting section above
3. Check the rollback instructions
4. Contact the development team with:
   - Log file
   - Error messages
   - Steps to reproduce

## Related Documentation

- [Preset Assistants Service Guide](../docs/PRESET_ASSISTANTS_SERVICE_GUIDE.md)
- [Database Schema](../docs/PRESET_ASSISTANTS_MIGRATION.md)
- [API Documentation](../docs/PRESET_ASSISTANTS_API.md)
- [User Guide](../docs/PRESET_ASSISTANTS_USER_GUIDE.md)

## Version History

- **v2.0.0** (Current) - Preset assistants expansion deployment
  - Added category, usage_count, rating columns
  - Created favorites, ratings, usage_logs tables
  - Initialized 10 preset assistants
  - Added performance indexes

## License

Copyright © 2024 Drone Analyzer Project. All rights reserved.
