/**
 * Setup Verification Script
 * 
 * This script verifies that the assistant data persistence system
 * infrastructure is properly set up.
 */

import { existsSync, accessSync, constants as fsConstants } from 'fs';
import { resolve } from 'path';
import { getConfig, validateConfig } from '../lib/config/assistantConfig';
import { CONSTANTS } from '../lib/constants/assistantConstants';

interface VerificationResult {
  passed: boolean;
  message: string;
}

const results: VerificationResult[] = [];

function verify(name: string, check: () => boolean, successMsg: string, failMsg: string): void {
  try {
    const passed = check();
    results.push({
      passed,
      message: passed ? `✓ ${successMsg}` : `✗ ${failMsg}`,
    });
  } catch (error) {
    results.push({
      passed: false,
      message: `✗ ${failMsg}: ${error}`,
    });
  }
}

console.log('🔍 Verifying Assistant Data Persistence System Setup...\n');

// 1. Check directories exist
console.log('📁 Checking directories...');
verify(
  'data directory',
  () => existsSync(resolve(process.cwd(), 'data')),
  'Data directory exists',
  'Data directory not found'
);

verify(
  'backups directory',
  () => existsSync(resolve(process.cwd(), 'data/backups')),
  'Backups directory exists',
  'Backups directory not found'
);

verify(
  'logs directory',
  () => existsSync(resolve(process.cwd(), 'logs')),
  'Logs directory exists',
  'Logs directory not found'
);

// 2. Check directory permissions
console.log('\n🔐 Checking permissions...');
try {
  accessSync(resolve(process.cwd(), 'data'), fsConstants.R_OK | fsConstants.W_OK);
  results.push({ passed: true, message: '✓ Data directory is readable and writable' });
} catch {
  results.push({ passed: false, message: '✗ Data directory is not readable/writable' });
}

try {
  accessSync(resolve(process.cwd(), 'logs'), fsConstants.R_OK | fsConstants.W_OK);
  results.push({ passed: true, message: '✓ Logs directory is readable and writable' });
} catch {
  results.push({ passed: false, message: '✗ Logs directory is not readable/writable' });
}

// 3. Check environment configuration
console.log('\n⚙️  Checking configuration...');
try {
  const config = getConfig();
  results.push({ passed: true, message: '✓ Configuration loaded successfully' });

  const validation = validateConfig(config);
  if (validation.valid) {
    results.push({ passed: true, message: '✓ Configuration is valid' });
  } else {
    results.push({
      passed: false,
      message: `✗ Configuration validation failed: ${validation.errors.join(', ')}`,
    });
  }
} catch (error) {
  results.push({ passed: false, message: `✗ Failed to load configuration: ${error}` });
}

// 4. Check TypeScript types
console.log('\n📝 Checking TypeScript types...');
verify(
  'assistant types',
  () => existsSync(resolve(process.cwd(), 'types/assistant.ts')),
  'Assistant type definitions exist',
  'Assistant type definitions not found'
);

// 5. Check constants
console.log('\n🔢 Checking constants...');
verify(
  'constants',
  () => CONSTANTS !== undefined && CONSTANTS.DB !== undefined,
  'Constants loaded successfully',
  'Constants not loaded'
);

// 6. Check dependencies
console.log('\n📦 Checking dependencies...');
try {
  require('better-sqlite3');
  results.push({ passed: true, message: '✓ better-sqlite3 is installed' });
} catch {
  results.push({ passed: false, message: '✗ better-sqlite3 is not installed' });
}

// 7. Check environment file
console.log('\n🌍 Checking environment files...');
verify(
  '.env.local',
  () => existsSync(resolve(process.cwd(), '.env.local')),
  '.env.local file exists',
  '.env.local file not found'
);

verify(
  '.env.local.example',
  () => existsSync(resolve(process.cwd(), '.env.local.example')),
  '.env.local.example file exists',
  '.env.local.example file not found'
);

// Print results
console.log('\n' + '='.repeat(60));
console.log('VERIFICATION RESULTS');
console.log('='.repeat(60) + '\n');

let passedCount = 0;
let failedCount = 0;

results.forEach((result) => {
  console.log(result.message);
  if (result.passed) {
    passedCount++;
  } else {
    failedCount++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`Total: ${results.length} checks`);
console.log(`Passed: ${passedCount}`);
console.log(`Failed: ${failedCount}`);
console.log('='.repeat(60) + '\n');

if (failedCount === 0) {
  console.log('✅ All checks passed! Setup is complete.\n');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review the errors above.\n');
  process.exit(1);
}
