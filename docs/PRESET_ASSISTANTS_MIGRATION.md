# Preset Assistants Expansion - Database Migration Guide

## Overview

This document describes the database migration for the preset assistants expansion feature. The migration adds support for:

- **Assistant Categories**: Organize assistants by category (productivity, creative, development, etc.)
- **Usage Statistics**: Track usage count and ratings for each assistant
- **Favorites**: Allow users to favorite assistants
- **Ratings**: Enable users to rate and provide feedback on assistants
- **Usage Logs**: Record detailed usage analytics

## Migration Details

### Version

**Migration Version**: 2.0.0

### Changes

#### 1. Assistants Table Extensions

Three new columns added to the `assistants` table:

- `category` (TEXT): JSON array of category strings
- `usage_count` (INTEGER): Number of times the assistant has been used (default: 0)
- `rating` (REAL): Average rating from 0.0 to 5.0 (default: 0.0)

#### 2. New Tables

**favorites**
```sql
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  assistant_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, assistant_id),
  FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE CASCADE
);
```

**ratings**
```sql
CREATE TABLE ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  assistant_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, assistant_id),
  FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE CASCADE
);
```

**usage_logs**
```sql
CREATE TABLE usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  assistant_id TEXT NOT NULL,
  duration INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE CASCADE
);
```

#### 3. New Indexes

Performance optimization indexes:

- `idx_assistants_category` - For category filtering
- `idx_assistants_rating` - For sorting by rating
- `idx_assistants_usage_count` - For sorting by popularity
- `idx_favorites_user` - For user's favorites lookup
- `idx_favorites_assistant` - For assistant's favorite count
- `idx_ratings_assistant` - For assistant ratings lookup
- `idx_ratings_user` - For user's ratings lookup
- `idx_usage_logs_assistant` - For assistant usage analytics
- `idx_usage_logs_user` - For user usage analytics

## Running the Migration

### Prerequisites

1. Ensure the database is initialized:
   ```bash
   npm run db:init
   ```

2. Verify database health:
   ```bash
   npm run db:check
   ```

### Backup

The migration script automatically creates a backup before running. The backup is saved to:
```
data/backups/assistants_pre_migration_<timestamp>.db
```

### Execute Migration

Run the migration script:

```bash
npm run migrate:preset-assistants
```

### Expected Output

```
🚀 Starting preset assistants expansion migration...

✓ Connected to database: /path/to/data/assistants.db

✓ Created backup directory: /path/to/data/backups
✓ Created backup: /path/to/data/backups/assistants_pre_migration_2024-01-15T10-30-00-000Z.db

📝 Applying migration steps...

  ✓ Step 1: Add category column to assistants table
  ✓ Step 2: Add usage_count column to assistants table
  ✓ Step 3: Add rating column to assistants table
  ✓ Step 4: Create favorites table
  ✓ Step 5: Create ratings table
  ✓ Step 6: Create usage_logs table
  ✓ Step 7: Create index on assistants.category
  ... (more steps)

✓ Recorded migration version 2.0.0

✓ Migration completed successfully!

📋 Validating data integrity...
  ✓ Assistants table structure
  ✓ Favorites table exists
  ✓ Ratings table exists
  ✓ Usage logs table exists
  ✓ All assistants have default values
  ✓ Indexes created

✅ All validation checks passed!

📦 Backup saved at: /path/to/data/backups/assistants_pre_migration_2024-01-15T10-30-00-000Z.db
You can safely delete the backup if everything works correctly.

✓ Database connection closed
```

## Verification

After migration, verify the changes:

1. **Check table structure**:
   ```bash
   sqlite3 data/assistants.db ".schema assistants"
   ```

2. **Verify new tables**:
   ```bash
   sqlite3 data/assistants.db ".tables"
   ```
   Should show: `assistants`, `backups`, `favorites`, `migrations`, `ratings`, `usage_logs`

3. **Check indexes**:
   ```bash
   sqlite3 data/assistants.db ".indexes"
   ```

4. **Verify migration record**:
   ```bash
   sqlite3 data/assistants.db "SELECT * FROM migrations WHERE version='2.0.0';"
   ```

## Rollback

⚠️ **Important**: SQLite does not support dropping columns added with `ALTER TABLE ADD COLUMN`. 

If you need to rollback:

1. Stop the application
2. Restore from backup:
   ```bash
   cp data/backups/assistants_pre_migration_<timestamp>.db data/assistants.db
   ```
3. Restart the application

## Troubleshooting

### Migration Already Applied

If you see:
```
⚠️  Migration 2.0.0 has already been applied.
Skipping migration.
```

This is normal - the migration has already been run. No action needed.

### Column Already Exists

If you see errors about duplicate columns, the migration script will skip those steps automatically.

### Foreign Key Constraint Errors

Ensure foreign key support is enabled in SQLite:
```bash
sqlite3 data/assistants.db "PRAGMA foreign_keys = ON;"
```

### Validation Failures

If validation checks fail:

1. Review the specific failed checks
2. Check the backup file is intact
3. Restore from backup if needed
4. Contact support with the error details

## Post-Migration

After successful migration:

1. **Test the application**: Verify all features work correctly
2. **Monitor performance**: Check query performance with new indexes
3. **Clean up backups**: After confirming everything works, you can delete old backups

## Data Migration

The migration only updates the schema. To populate preset assistants:

1. Run the preset initialization service (implemented in task 2.1)
2. Or manually insert preset assistants using the constants from `lib/constants/presetAssistants.ts`

## Support

For issues or questions:

1. Check the migration logs
2. Review the backup files
3. Consult the main documentation
4. Contact the development team

## Related Files

- Migration script: `scripts/migrate-preset-assistants.ts`
- Schema definitions: `lib/db/schema.ts`
- Type definitions: `types/assistant.ts`
- Preset constants: `lib/constants/presetAssistants.ts`
