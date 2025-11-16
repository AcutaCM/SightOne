/**
 * Preset Assistants Expansion - Database Migration Script
 * 
 * This script migrates the database to support the preset assistants expansion:
 * 1. Adds new columns to assistants table (category, usage_count, rating)
 * 2. Creates new tables (favorites, ratings, usage_logs)
 * 3. Creates indexes for performance optimization
 * 4. Validates data integrity
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// ============================================================================
// Configuration
// ============================================================================

const DB_PATH = path.join(process.cwd(), 'data', 'assistants.db');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');
const MIGRATION_VERSION = '2.0.0';

// ============================================================================
// Migration SQL Statements
// ============================================================================

const MIGRATION_STEPS = [
  {
    name: 'Add category column to assistants table',
    sql: `ALTER TABLE assistants ADD COLUMN category TEXT;`,
    rollback: null, // Cannot rollback ALTER TABLE ADD COLUMN in SQLite
  },
  {
    name: 'Add usage_count column to assistants table',
    sql: `ALTER TABLE assistants ADD COLUMN usage_count INTEGER NOT NULL DEFAULT 0;`,
    rollback: null,
  },
  {
    name: 'Add rating column to assistants table',
    sql: `ALTER TABLE assistants ADD COLUMN rating REAL NOT NULL DEFAULT 0.0;`,
    rollback: null,
  },
  {
    name: 'Create favorites table',
    sql: `
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        assistant_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, assistant_id),
        FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE CASCADE
      );
    `,
    rollback: `DROP TABLE IF EXISTS favorites;`,
  },
  {
    name: 'Create ratings table',
    sql: `
      CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        assistant_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        feedback TEXT,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, assistant_id),
        FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE CASCADE
      );
    `,
    rollback: `DROP TABLE IF EXISTS ratings;`,
  },
  {
    name: 'Create usage_logs table',
    sql: `
      CREATE TABLE IF NOT EXISTS usage_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        assistant_id TEXT NOT NULL,
        duration INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE CASCADE
      );
    `,
    rollback: `DROP TABLE IF EXISTS usage_logs;`,
  },
  {
    name: 'Create index on assistants.category',
    sql: `CREATE INDEX IF NOT EXISTS idx_assistants_category ON assistants(category);`,
    rollback: `DROP INDEX IF EXISTS idx_assistants_category;`,
  },
  {
    name: 'Create index on assistants.rating',
    sql: `CREATE INDEX IF NOT EXISTS idx_assistants_rating ON assistants(rating DESC);`,
    rollback: `DROP INDEX IF EXISTS idx_assistants_rating;`,
  },
  {
    name: 'Create index on assistants.usage_count',
    sql: `CREATE INDEX IF NOT EXISTS idx_assistants_usage_count ON assistants(usage_count DESC);`,
    rollback: `DROP INDEX IF EXISTS idx_assistants_usage_count;`,
  },
  {
    name: 'Create index on favorites.user_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);`,
    rollback: `DROP INDEX IF EXISTS idx_favorites_user;`,
  },
  {
    name: 'Create index on favorites.assistant_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_favorites_assistant ON favorites(assistant_id);`,
    rollback: `DROP INDEX IF EXISTS idx_favorites_assistant;`,
  },
  {
    name: 'Create index on favorites.created_at',
    sql: `CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);`,
    rollback: `DROP INDEX IF EXISTS idx_favorites_created_at;`,
  },
  {
    name: 'Create index on ratings.assistant_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_ratings_assistant ON ratings(assistant_id);`,
    rollback: `DROP INDEX IF EXISTS idx_ratings_assistant;`,
  },
  {
    name: 'Create index on ratings.user_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);`,
    rollback: `DROP INDEX IF EXISTS idx_ratings_user;`,
  },
  {
    name: 'Create index on ratings.rating',
    sql: `CREATE INDEX IF NOT EXISTS idx_ratings_rating ON ratings(rating);`,
    rollback: `DROP INDEX IF EXISTS idx_ratings_rating;`,
  },
  {
    name: 'Create index on ratings.created_at',
    sql: `CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);`,
    rollback: `DROP INDEX IF EXISTS idx_ratings_created_at;`,
  },
  {
    name: 'Create index on usage_logs.assistant_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_usage_logs_assistant ON usage_logs(assistant_id);`,
    rollback: `DROP INDEX IF EXISTS idx_usage_logs_assistant;`,
  },
  {
    name: 'Create index on usage_logs.user_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id);`,
    rollback: `DROP INDEX IF EXISTS idx_usage_logs_user;`,
  },
  {
    name: 'Create index on usage_logs.created_at',
    sql: `CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);`,
    rollback: `DROP INDEX IF EXISTS idx_usage_logs_created_at;`,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create backup directory if it doesn't exist
 */
function ensureBackupDir(): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✓ Created backup directory: ${BACKUP_DIR}`);
  }
}

/**
 * Create database backup before migration
 */
function createBackup(db: Database.Database): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `assistants_pre_migration_${timestamp}.db`);
  
  try {
    db.backup(backupPath);
    console.log(`✓ Created backup: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('✗ Failed to create backup:', error);
    throw error;
  }
}

/**
 * Check if migration has already been applied
 */
function isMigrationApplied(db: Database.Database): boolean {
  try {
    // Check if migrations table exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='migrations'
    `).get();

    if (!tableExists) {
      return false;
    }

    // Check if this migration version exists
    const migration = db.prepare(`
      SELECT * FROM migrations WHERE version = ?
    `).get(MIGRATION_VERSION);

    return !!migration;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Record migration in migrations table
 */
function recordMigration(db: Database.Database): void {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO migrations (version, applied_at, description)
    VALUES (?, ?, ?)
  `).run(MIGRATION_VERSION, now, 'Preset assistants expansion: added category, usage_count, rating fields and new tables');
  
  console.log(`✓ Recorded migration version ${MIGRATION_VERSION}`);
}

/**
 * Validate data integrity after migration
 */
function validateDataIntegrity(db: Database.Database): boolean {
  console.log('\n📋 Validating data integrity...');
  
  const checks = [
    {
      name: 'Assistants table structure',
      query: `SELECT sql FROM sqlite_master WHERE type='table' AND name='assistants'`,
      validate: (result: any) => {
        const sql = result?.sql || '';
        return sql.includes('category') && 
               sql.includes('usage_count') && 
               sql.includes('rating');
      }
    },
    {
      name: 'Favorites table exists',
      query: `SELECT name FROM sqlite_master WHERE type='table' AND name='favorites'`,
      validate: (result: any) => !!result
    },
    {
      name: 'Ratings table exists',
      query: `SELECT name FROM sqlite_master WHERE type='table' AND name='ratings'`,
      validate: (result: any) => !!result
    },
    {
      name: 'Usage logs table exists',
      query: `SELECT name FROM sqlite_master WHERE type='table' AND name='usage_logs'`,
      validate: (result: any) => !!result
    },
    {
      name: 'All assistants have default values',
      query: `SELECT COUNT(*) as count FROM assistants WHERE usage_count IS NULL OR rating IS NULL`,
      validate: (result: any) => result.count === 0
    },
    {
      name: 'Indexes created',
      query: `SELECT COUNT(*) as count FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'`,
      validate: (result: any) => result.count >= 15 // We created at least 15 indexes
    }
  ];

  let allPassed = true;

  for (const check of checks) {
    try {
      const result = db.prepare(check.query).get();
      const passed = check.validate(result);
      
      if (passed) {
        console.log(`  ✓ ${check.name}`);
      } else {
        console.log(`  ✗ ${check.name}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`  ✗ ${check.name}: ${error}`);
      allPassed = false;
    }
  }

  return allPassed;
}

/**
 * Check if column exists in table
 */
function columnExists(db: Database.Database, tableName: string, columnName: string): boolean {
  try {
    const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
    return tableInfo.some((col: any) => col.name === columnName);
  } catch (error) {
    return false;
  }
}

// ============================================================================
// Main Migration Function
// ============================================================================

async function runMigration(): Promise<void> {
  console.log('🚀 Starting preset assistants expansion migration...\n');

  // Check if database exists
  if (!fs.existsSync(DB_PATH)) {
    console.error(`✗ Database not found at: ${DB_PATH}`);
    console.log('Please ensure the database is initialized first.');
    process.exit(1);
  }

  let db: Database.Database | null = null;

  try {
    // Open database connection
    db = new Database(DB_PATH);
    console.log(`✓ Connected to database: ${DB_PATH}\n`);

    // Check if migration already applied
    if (isMigrationApplied(db)) {
      console.log(`⚠️  Migration ${MIGRATION_VERSION} has already been applied.`);
      console.log('Skipping migration.');
      process.exit(0);
    }

    // Create backup
    ensureBackupDir();
    const backupPath = createBackup(db);
    console.log('');

    // Begin transaction
    console.log('📝 Applying migration steps...\n');
    db.prepare('BEGIN TRANSACTION').run();

    let stepNumber = 0;
    for (const step of MIGRATION_STEPS) {
      stepNumber++;
      try {
        // Check if this is an ALTER TABLE step and column already exists
        if (step.sql.includes('ALTER TABLE') && step.sql.includes('ADD COLUMN')) {
          const match = step.sql.match(/ADD COLUMN (\w+)/);
          if (match) {
            const columnName = match[1];
            if (columnExists(db, 'assistants', columnName)) {
              console.log(`  ⊘ Step ${stepNumber}: ${step.name} (already exists)`);
              continue;
            }
          }
        }

        db.exec(step.sql);
        console.log(`  ✓ Step ${stepNumber}: ${step.name}`);
      } catch (error: any) {
        // Ignore "duplicate column name" errors
        if (error.message && error.message.includes('duplicate column name')) {
          console.log(`  ⊘ Step ${stepNumber}: ${step.name} (already exists)`);
          continue;
        }
        throw error;
      }
    }

    // Record migration
    recordMigration(db);

    // Commit transaction
    db.prepare('COMMIT').run();
    console.log('\n✓ Migration completed successfully!\n');

    // Validate data integrity
    const isValid = validateDataIntegrity(db);
    
    if (isValid) {
      console.log('\n✅ All validation checks passed!');
      console.log(`\n📦 Backup saved at: ${backupPath}`);
      console.log('You can safely delete the backup if everything works correctly.\n');
    } else {
      console.log('\n⚠️  Some validation checks failed!');
      console.log('Please review the results above.');
      console.log(`Backup is available at: ${backupPath}\n`);
    }

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    
    if (db) {
      try {
        db.prepare('ROLLBACK').run();
        console.log('✓ Transaction rolled back');
      } catch (rollbackError) {
        console.error('✗ Failed to rollback transaction:', rollbackError);
      }
    }
    
    console.log('\nThe database backup can be used to restore the previous state.');
    process.exit(1);
  } finally {
    if (db) {
      db.close();
      console.log('✓ Database connection closed');
    }
  }
}

// ============================================================================
// Execute Migration
// ============================================================================

if (require.main === module) {
  runMigration().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runMigration, MIGRATION_VERSION };
