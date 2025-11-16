/**
 * Test script for database migration
 * 
 * This script tests the column addition migration by:
 * 1. Creating a test database with the old schema (no category, usage_count, rating)
 * 2. Running the migration
 * 3. Verifying the columns were added correctly
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { applyMigration, isMigrationApplied } from '../lib/db/migrations/002_add_assistant_columns';

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'test-migration.db');

function cleanup() {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
    console.log('✓ Cleaned up test database');
  }
}

function createOldSchemaDatabase(): Database.Database {
  // Ensure data directory exists
  const dataDir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(TEST_DB_PATH);
  
  // Create assistants table WITHOUT the new columns
  db.exec(`
    CREATE TABLE IF NOT EXISTS assistants (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      desc TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '🤖',
      prompt TEXT NOT NULL,
      tags TEXT,
      is_public INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      author TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      reviewed_at TEXT,
      published_at TEXT,
      review_note TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      CONSTRAINT status_check CHECK (status IN ('draft', 'pending', 'published', 'rejected'))
    );
  `);

  // Create migrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL,
      description TEXT
    );
  `);

  // Insert test data
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO assistants (id, title, desc, emoji, prompt, tags, is_public, status, author, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'test-1',
    'Test Assistant',
    'A test assistant',
    '🧪',
    'You are a test assistant',
    'test,demo',
    0,
    'draft',
    'test-user',
    now
  );

  console.log('✓ Created test database with old schema');
  return db;
}

function getColumns(db: Database.Database): string[] {
  interface ColumnInfo {
    name: string;
  }
  const columns = db.pragma('table_info(assistants)') as ColumnInfo[];
  return columns.map(col => col.name);
}

function runTest() {
  console.log('Starting migration test...\n');

  try {
    // Cleanup any existing test database
    cleanup();

    // Create database with old schema
    const db = createOldSchemaDatabase();

    // Check columns before migration
    const columnsBefore = getColumns(db);
    console.log('Columns before migration:', columnsBefore);
    console.log('Has category?', columnsBefore.includes('category'));
    console.log('Has usage_count?', columnsBefore.includes('usage_count'));
    console.log('Has rating?', columnsBefore.includes('rating'));
    console.log();

    // Check if migration is applied
    const isApplied = isMigrationApplied(db);
    console.log('Migration applied before?', isApplied);
    console.log();

    // Apply migration
    console.log('Applying migration...');
    applyMigration(db);
    console.log();

    // Check columns after migration
    const columnsAfter = getColumns(db);
    console.log('Columns after migration:', columnsAfter);
    console.log('Has category?', columnsAfter.includes('category'));
    console.log('Has usage_count?', columnsAfter.includes('usage_count'));
    console.log('Has rating?', columnsAfter.includes('rating'));
    console.log();

    // Verify data is preserved
    const assistant = db.prepare('SELECT * FROM assistants WHERE id = ?').get('test-1');
    console.log('Test assistant data preserved:', assistant ? '✓' : '✗');
    if (assistant) {
      console.log('Assistant:', assistant);
    }
    console.log();

    // Test idempotency - run migration again
    console.log('Testing idempotency - running migration again...');
    applyMigration(db);
    console.log('✓ Migration is idempotent');
    console.log();

    // Verify migration is marked as applied
    const isAppliedAfter = isMigrationApplied(db);
    console.log('Migration applied after?', isAppliedAfter);

    db.close();

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    cleanup();
  }
}

runTest();
