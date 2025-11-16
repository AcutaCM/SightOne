# Preset Assistants Deployment - Quick Start Guide

## 🚀 Quick Deployment (5 minutes)

### For Linux/macOS Users

```bash
# 1. Navigate to project root
cd /path/to/drone-analyzer-nextjs

# 2. Make script executable (first time only)
chmod +x scripts/deploy-preset-assistants.sh

# 3. Run deployment
./scripts/deploy-preset-assistants.sh

# 4. Restart your application
npm run dev
```

### For Windows Users

```powershell
# 1. Navigate to project root
cd C:\path\to\drone-analyzer-nextjs

# 2. Run deployment
.\scripts\deploy-preset-assistants.ps1

# 3. Restart your application
npm run dev
```

## ✅ What You Get

After deployment, you'll have:

- **10 Preset Assistants** ready to use
- **Category System** for organizing assistants
- **Search Functionality** to find assistants quickly
- **Favorites System** to bookmark your preferred assistants
- **Rating System** for user feedback
- **Usage Statistics** to track assistant popularity

## 📋 Pre-Deployment Checklist

- [ ] Node.js installed (v16+)
- [ ] npm installed
- [ ] Dependencies installed (`npm install`)
- [ ] Application stopped (recommended)
- [ ] In project root directory

## 🎯 Post-Deployment Verification

1. **Open your application** in a browser
2. **Navigate to Assistant Market** (usually at `/chatbot` or similar)
3. **Verify you see 10 preset assistants:**
   - 🚁 Tello智能代理
   - 🌱 农业诊断专家
   - 📸 图像分析助手
   - 📊 数据分析师
   - 💻 编程助手
   - ✍️ 写作助手
   - 🌐 翻译助手
   - 👨‍🏫 教育辅导老师
   - 💬 客服助手
   - 🎨 创意设计师

4. **Test new features:**
   - Click on category tabs
   - Use the search bar
   - Click the favorite (heart) icon
   - View assistant details

## 🔄 Rollback (If Needed)

If something goes wrong:

**Linux/macOS:**
```bash
# Find your backup
ls -la data/backups/

# Restore (replace TIMESTAMP with actual timestamp)
cp data/backups/assistants_pre_deployment_TIMESTAMP.db data/assistants.db

# Restart
npm run dev
```

**Windows:**
```powershell
# Find your backup
Get-ChildItem data\backups\

# Restore (replace TIMESTAMP with actual timestamp)
Copy-Item data\backups\assistants_pre_deployment_TIMESTAMP.db data\assistants.db -Force

# Restart
npm run dev
```

## 🐛 Common Issues

### "Permission denied" (Linux/macOS)
```bash
chmod +x scripts/deploy-preset-assistants.sh
```

### "Execution policy" (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Database not found"
This is normal for first-time deployments. The database will be created automatically.

### "Migration already applied"
The deployment has already been run. This is safe - the script will skip already-applied changes.

## 📊 Deployment Options

### Dry Run (See what would happen)

**Linux/macOS:**
```bash
./scripts/deploy-preset-assistants.sh --dry-run
```

**Windows:**
```powershell
.\scripts\deploy-preset-assistants.ps1 -DryRun
```

### Skip Backup (Not Recommended)

**Linux/macOS:**
```bash
./scripts/deploy-preset-assistants.sh --skip-backup
```

**Windows:**
```powershell
.\scripts\deploy-preset-assistants.ps1 -SkipBackup
```

## 📝 Logs

Deployment logs are saved to:
```
logs/deployment-YYYYMMDD-HHMMSS.log
```

Check this file if you encounter any issues.

## 🎓 Learn More

- [Full Deployment Guide](../scripts/DEPLOYMENT_README.md)
- [Preset Assistants Service Guide](./PRESET_ASSISTANTS_SERVICE_GUIDE.md)
- [User Guide](./PRESET_ASSISTANTS_USER_GUIDE.md)
- [API Documentation](./PRESET_ASSISTANTS_API.md)

## 💡 Tips

1. **Always backup** - The script does this automatically, but you can create manual backups too
2. **Test in staging first** - If you have a staging environment, deploy there first
3. **Monitor logs** - Watch the application logs after deployment
4. **Keep backups** - Don't delete backups until you've confirmed everything works
5. **Read the output** - The script provides detailed feedback about each step

## 🆘 Need Help?

If you encounter issues:

1. Check the log file: `logs/deployment-YYYYMMDD-HHMMSS.log`
2. Review the [Troubleshooting Guide](../scripts/DEPLOYMENT_README.md#troubleshooting)
3. Try the rollback procedure
4. Contact support with your log file

## 🎉 Success!

Once deployment is complete, you should see:

```
✅ All validation checks passed!
✓ Preset assistants expansion deployed successfully!
```

Your preset assistants are now ready to use! 🚀
