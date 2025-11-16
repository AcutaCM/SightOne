#!/usr/bin/env ts-node

/**
 * Database Reset Script
 * 
 * This script clears all existing users from the database and creates a default admin account.
 * Use this for initial system setup or when you need to reset the authentication system.
 * 
 * Usage:
 *   npm run db:reset-users
 *   npm run db:reset-users -- --force (skip confirmation)
 */

import Database from 'better-sqlite3';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

// Database configuration
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'users.db');

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'admin@drone-analyzer.com',
  password: 'admin123456',
  username: 'admin',
  name: 'System Administrator',
  role: 'admin' as const,
};

interface ResetOptions {
  force?: boolean;
  verbose?: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): ResetOptions {
  const args = process.argv.slice(2);
  return {
    force: args.includes('--force') || args.includes('-f'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };
}

/**
 * Prompt user for confirmation
 */
async function confirmReset(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will delete ALL users from the database!\n' +
      'Are you sure you want to continue? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

/**
 * Ensure database directory exists
 */
function ensureDatabaseDirectory(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log(`✓ Created database directory: ${DB_DIR}`);
  }
}

/**
 * Initialize database with users table
 */
function initializeDatabase(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);
}

/**
 * Clear all users from the database
 */
function clearAllUsers(db: Database.Database, verbose: boolean): number {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const { count } = countStmt.get() as { count: number };

  if (verbose && count > 0) {
    console.log(`\nFound ${count} existing user(s) in database`);
  }

  const deleteStmt = db.prepare('DELETE FROM users');
  const result = deleteStmt.run();

  if (verbose) {
    console.log(`✓ Deleted ${result.changes} user(s)`);
  }

  return result.changes;
}

/**
 * Create default admin account
 */
async function createDefaultAdmin(
  db: Database.Database,
  verbose: boolean
): Promise<void> {
  if (verbose) {
    console.log('\nCreating default admin account...');
  }

  // Hash the password with bcrypt (salt rounds = 10)
  const password_hash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

  // Insert the default admin
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash, name, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    DEFAULT_ADMIN.username,
    DEFAULT_ADMIN.email,
    password_hash,
    DEFAULT_ADMIN.name,
    DEFAULT_ADMIN.role
  );

  if (verbose) {
    console.log(`✓ Created admin user with ID: ${result.lastInsertRowid}`);
  }
}

/**
 * Display default credentials
 */
function displayCredentials(): void {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 DEFAULT ADMIN CREDENTIALS');
  console.log('='.repeat(60));
  console.log(`Email:    ${DEFAULT_ADMIN.email}`);
  console.log(`Password: ${DEFAULT_ADMIN.password}`);
  console.log('='.repeat(60));
  console.log('\n⚠️  IMPORTANT SECURITY NOTICE:');
  console.log('   Please change the default password immediately after first login!');
  console.log('   These credentials should only be used for initial setup.\n');
}

/**
 * Main reset function
 */
async function resetUserDatabase(options: ResetOptions): Promise<void> {
  const { force, verbose } = options;

  console.log('\n🔄 User Database Reset Script');
  console.log('================================\n');

  // Confirm reset unless --force flag is used
  if (!force) {
    const confirmed = await confirmReset();
    if (!confirmed) {
      console.log('\n❌ Reset cancelled by user\n');
      process.exit(0);
    }
  }

  try {
    // Ensure database directory exists
    ensureDatabaseDirectory();

    // Open database connection
    const db = new Database(DB_PATH);

    if (verbose) {
      console.log(`\n✓ Connected to database: ${DB_PATH}`);
    }

    // Initialize database schema
    initializeDatabase(db);

    if (verbose) {
      console.log('✓ Database schema initialized');
    }

    // Clear all existing users
    const deletedCount = clearAllUsers(db, verbose || false);

    // Create default admin account
    await createDefaultAdmin(db, verbose || false);

    // Close database connection
    db.close();

    // Display success message and credentials
    console.log('\n✅ Database reset completed successfully!\n');
    displayCredentials();

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during database reset:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
const options = parseArgs();
resetUserDatabase(options);
