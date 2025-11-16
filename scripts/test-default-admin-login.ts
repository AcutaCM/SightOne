#!/usr/bin/env ts-node

/**
 * Test Default Admin Login
 * 
 * This script verifies that the default admin account can be used to login.
 * It tests the authentication system without requiring a running server.
 */

import Database from 'better-sqlite3';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';

// Database configuration
const DB_PATH = path.join(process.cwd(), 'data', 'users.db');

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'admin@drone-analyzer.com',
  password: 'admin123456',
};

interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

async function testDefaultAdminLogin(): Promise<void> {
  console.log('\n🧪 Testing Default Admin Login');
  console.log('================================\n');

  try {
    // Open database connection
    const db = new Database(DB_PATH, { readonly: true });
    console.log('✓ Connected to database');

    // Query for the default admin user
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(DEFAULT_ADMIN.email) as User | undefined;

    if (!user) {
      console.error('❌ Default admin user not found in database!');
      console.error(`   Expected email: ${DEFAULT_ADMIN.email}`);
      db.close();
      process.exit(1);
    }

    console.log('✓ Default admin user found in database');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.created_at}`);

    // Verify the password
    const isPasswordValid = await bcrypt.compare(
      DEFAULT_ADMIN.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      console.error('\n❌ Password verification failed!');
      console.error('   The stored password hash does not match the default password.');
      db.close();
      process.exit(1);
    }

    console.log('\n✓ Password verification successful');

    // Verify role is admin
    if (user.role !== 'admin') {
      console.error(`\n❌ User role is "${user.role}" but expected "admin"`);
      db.close();
      process.exit(1);
    }

    console.log('✓ User role is correctly set to "admin"');

    // Close database
    db.close();

    // Display success summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(60));
    console.log('\nDefault admin account is ready to use:');
    console.log(`  Email:    ${DEFAULT_ADMIN.email}`);
    console.log(`  Password: ${DEFAULT_ADMIN.password}`);
    console.log('\nYou can now login to the admin interface with these credentials.');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during testing:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testDefaultAdminLogin();
