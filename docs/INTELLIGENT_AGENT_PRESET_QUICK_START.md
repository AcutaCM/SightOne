# Intelligent Agent Preset - Quick Start Guide

## What Was Implemented

Task 2: **集成预设初始化到系统启动** (Integrate Preset Initialization to System Startup)

This implementation ensures the Tello Intelligent Agent preset assistant is automatically created when the application starts.

## Quick Overview

### ✅ Task 2.1: Application Startup Initialization

**What it does:**
- Automatically checks if the intelligent agent preset exists when the app starts
- Creates the preset if it doesn't exist
- Runs in the background without blocking the UI

**Files created/modified:**
- ✅ Created: `components/IntelligentAgentInitializer.tsx`
- ✅ Modified: `app/layout.tsx` (added initializer component)

### ✅ Task 2.2: Database Migration Script

**What it does:**
- Provides a database migration system for the preset
- Ensures the preset exists at the database level
- Can be run manually or automatically

**Files created:**
- ✅ `lib/db/migrations/intelligentAgentPresetMigration.ts` - TypeScript migration
- ✅ `lib/db/migrations/001_intelligent_agent_preset.sql` - SQL migration (documentation)
- ✅ `lib/db/migrations/index.ts` - Migration registry
- ✅ `lib/db/migrations/README.md` - Migration documentation
- ✅ `scripts/run-migrations.ts` - Migration runner script
- ✅ Modified: `lib/db/initDatabase.ts` (integrated migrations)
- ✅ Modified: `package.json` (added migration scripts)

## How to Test

### 1. Test Automatic Initialization

```bash
# Delete the database (if it exists)
rm data/assistants.db

# Start the application
npm run dev

# Check the console output
# You should see:
# [IntelligentAgentPresetService] 🚀 Initializing intelligent agent preset...
# [IntelligentAgentPresetService] ✅ Intelligent agent preset created successfully
```

### 2. Test Migration Script

```bash
# Delete the database (if it exists)
rm data/assistants.db

# Run migrations
npm run migrate

# You should see:
# ✅ Successfully applied 1 migration(s)
# ✅ 1.0.1: Insert Tello Intelligent Agent preset assistant
```

### 3. Verify Preset Exists

After running either test above, you can verify the preset exists:

**Option A: Check in the UI**
1. Open the application
2. Navigate to the Market page
3. Look for "🚁 Tello智能代理" in the assistant list

**Option B: Check the database**
```bash
# Install sqlite3 if you don't have it
# Then run:
sqlite3 data/assistants.db "SELECT id, title, status FROM assistants WHERE id = 'tello-intelligent-agent';"

# You should see:
# tello-intelligent-agent|🚁 Tello智能代理|published
```

## Usage

### Automatic (Recommended)

The preset is automatically initialized when:
1. The application starts (via `IntelligentAgentInitializer`)
2. The database is initialized (via migrations)

**No action required!** Just start the app and the preset will be there.

### Manual Migration

If you need to run migrations manually:

```bash
# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:status
```

## What Happens on First Run

```
1. Application starts
   ↓
2. IntelligentAgentInitializer component mounts
   ↓
3. Checks if preset exists (API call)
   ↓
4. Preset doesn't exist → Creates it
   ↓
5. Logs success message
   ↓
6. Preset is now available in the Market
```

## What Happens on Subsequent Runs

```
1. Application starts
   ↓
2. IntelligentAgentInitializer component mounts
   ↓
3. Checks if preset exists (API call)
   ↓
4. Preset exists → Logs "already exists"
   ↓
5. No action needed
```

## Console Output Examples

### First Run (Preset Created)
```
[IntelligentAgentPresetService] 🚀 Initializing intelligent agent preset...
[IntelligentAgentPresetService] 📝 Preset does not exist, creating...
[IntelligentAgentPresetService] ✅ Preset created successfully: tello-intelligent-agent
[IntelligentAgentPresetService] ✅ Intelligent agent preset created successfully
```

### Subsequent Runs (Preset Exists)
```
[IntelligentAgentPresetService] 🚀 Initializing intelligent agent preset...
[IntelligentAgentPresetService] ✅ Intelligent agent preset already exists
```

### Migration Run
```
📦 Connecting to database...
✅ Database connection established

📊 Checking migration status...
Total migrations: 1
Applied: 0
Pending: 1

🚀 Running pending migrations...

[Migrations] Checking for pending migrations...
[Migrations] Applying migration 1.0.1: Insert Tello Intelligent Agent preset assistant
[Migration] Applying intelligent agent preset migration...
[Migration] ✅ Intelligent agent preset inserted successfully
[Migration] ✅ Migration recorded successfully
[Migrations] ✅ Migration 1.0.1 applied successfully
[Migrations] ✅ Applied 1 migration(s) successfully

✅ Successfully applied 1 migration(s)
```

## Troubleshooting

### Preset Not Showing Up

1. **Check console logs** - Look for error messages
2. **Verify database** - Check if the database file exists: `data/assistants.db`
3. **Run migrations manually** - `npm run migrate`
4. **Check API** - Make sure the API routes are working

### Migration Failed

1. **Check error message** - Look at the console output
2. **Verify database permissions** - Make sure the `data/` directory is writable
3. **Delete and retry** - Delete `data/assistants.db` and run `npm run migrate` again

### Preset Created But Not Visible

1. **Refresh the page** - The UI might need to reload
2. **Check status** - Verify the preset status is "published"
3. **Check filters** - Make sure you're viewing all assistants, not just drafts

## Key Features

✅ **Automatic** - No manual setup required
✅ **Idempotent** - Safe to run multiple times
✅ **Non-blocking** - Errors don't crash the app
✅ **Versioned** - Migration system tracks what's applied
✅ **Documented** - Comprehensive logs and documentation
✅ **Testable** - Easy to test and verify

## Next Steps

Now that the preset initialization is complete, you can:

1. **Test the preset** - Navigate to the Market and find the intelligent agent
2. **Use the preset** - Click "使用此助理" to activate it
3. **Continue implementation** - Move on to Task 3 (Market display components)

## Files Reference

### Created Files
- `components/IntelligentAgentInitializer.tsx`
- `lib/db/migrations/intelligentAgentPresetMigration.ts`
- `lib/db/migrations/001_intelligent_agent_preset.sql`
- `lib/db/migrations/index.ts`
- `lib/db/migrations/README.md`
- `scripts/run-migrations.ts`
- `docs/INTELLIGENT_AGENT_PRESET_INITIALIZATION.md`
- `docs/INTELLIGENT_AGENT_PRESET_QUICK_START.md` (this file)

### Modified Files
- `app/layout.tsx`
- `lib/db/initDatabase.ts`
- `package.json`

## Support

For detailed information, see:
- [Full Documentation](./INTELLIGENT_AGENT_PRESET_INITIALIZATION.md)
- [Migration README](../lib/db/migrations/README.md)
- [Preset Service Documentation](./INTELLIGENT_AGENT_PRESET_SERVICE.md)

For issues:
- Check console logs
- Run `npm run migrate:status`
- Review the migration logs
- Contact the development team
