#!/usr/bin/env node

/**
 * Database Migration Runner Script
 * 
 * This script runs all pending database migrations.
 * It can be used for manual migration execution or as part of deployment.
 * 
 * Usage:
 *   npm run migrate
 *   or
 *   node scripts/run-migrations.ts
 */

import { getDatabase, closeDatabase } from '../lib/db/initDatabase';
import { runPendingMigrations, getMigrationStatus } from '../lib/db/migrations';

async function main() {
  console.log('='.repeat(60));
  console.log('Database Migration Runner');
  console.log('='.repeat(60));
  console.log();

  let db;

  try {
    // Get database connection
    console.log('📦 Connecting to database...');
    db = getDatabase();
    console.log('✅ Database connection established');
    console.log();

    // Get current migration status
    console.log('📊 Checking migration status...');
    const statusBefore = getMigrationStatus(db);
    console.log(`Total migrations: ${statusBefore.total}`);
    console.log(`Applied: ${statusBefore.applied}`);
    console.log(`Pending: ${statusBefore.pending}`);
    console.log();

    if (statusBefore.pending === 0) {
      console.log('✅ All migrations are already applied');
      console.log();
      
      // Show migration details
      console.log('Migration Details:');
      statusBefore.migrations.forEach((migration) => {
        const status = migration.applied ? '✅' : '⏳';
        console.log(`  ${status} ${migration.version}: ${migration.description}`);
      });
      
      return;
    }

    // Run pending migrations
    console.log('🚀 Running pending migrations...');
    console.log();
    
    const result = runPendingMigrations(db);
    
    console.log();
    console.log('='.repeat(60));
    console.log('Migration Results');
    console.log('='.repeat(60));
    console.log();

    if (result.success) {
      console.log(`✅ Successfully applied ${result.appliedCount} migration(s)`);
    } else {
      console.log(`⚠️  Applied ${result.appliedCount} migration(s) with errors`);
      console.log();
      console.log('Errors:');
      result.errors.forEach((error) => {
        console.error(`  ❌ ${error}`);
      });
    }

    console.log();

    // Get final migration status
    const statusAfter = getMigrationStatus(db);
    console.log('Final Status:');
    console.log(`  Total migrations: ${statusAfter.total}`);
    console.log(`  Applied: ${statusAfter.applied}`);
    console.log(`  Pending: ${statusAfter.pending}`);
    console.log();

    // Show migration details
    console.log('Migration Details:');
    statusAfter.migrations.forEach((migration) => {
      const status = migration.applied ? '✅' : '⏳';
      console.log(`  ${status} ${migration.version}: ${migration.description}`);
    });
    console.log();

    if (result.success) {
      console.log('✅ All migrations completed successfully');
      process.exit(0);
    } else {
      console.log('⚠️  Some migrations failed - please check the errors above');
      process.exit(1);
    }
  } catch (error) {
    console.error();
    console.error('❌ Migration failed with error:');
    console.error(error);
    console.error();
    process.exit(1);
  } finally {
    if (db) {
      closeDatabase(db);
    }
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
