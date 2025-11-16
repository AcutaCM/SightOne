/**
 * Setup Verification Script
 * 
 * This script verifies that the assistant data persistence system
 * infrastructure is properly set up.
 */

const fs = require('fs');
const path = require('path');

const results = [];

function verify(name, check, successMsg, failMsg) {
  try {
    const passed = check();
    results.push({
      passed,
      message: passed ? `✓ ${successMsg}` : `✗ ${failMsg}`,
    });
  } catch (error) {
    results.push({
      passed: false,
      message: `✗ ${failMsg}: ${error.message}`,
    });
  }
}

console.log('🔍 Verifying Assistant Data Persistence System Setup...\n');

// 1. Check directories exist
console.log('📁 Checking directories...');
verify(
  'data directory',
  () => fs.existsSync(path.resolve(process.cwd(), 'data')),
  'Data directory exists',
  'Data directory not found'
);

verify(
  'backups directory',
  () => fs.existsSync(path.resolve(process.cwd(), 'data/backups')),
  'Backups directory exists',
  'Backups directory not found'
);

verify(
  'logs directory',
  () => fs.existsSync(path.resolve(process.cwd(), 'logs')),
  'Logs directory exists',
  'Logs directory not found'
);

// 2. Check directory permissions
console.log('\n🔐 Checking permissions...');
try {
  fs.accessSync(path.resolve(process.cwd(), 'data'), fs.constants.R_OK | fs.constants.W_OK);
  results.push({ passed: true, message: '✓ Data directory is readable and writable' });
} catch {
  results.push({ passed: false, message: '✗ Data directory is not readable/writable' });
}

try {
  fs.accessSync(path.resolve(process.cwd(), 'logs'), fs.constants.R_OK | fs.constants.W_OK);
  results.push({ passed: true, message: '✓ Logs directory is readable and writable' });
} catch {
  results.push({ passed: false, message: '✗ Logs directory is not readable/writable' });
}

// 3. Check TypeScript files
console.log('\n📝 Checking TypeScript files...');
verify(
  'assistant types',
  () => fs.existsSync(path.resolve(process.cwd(), 'types/assistant.ts')),
  'Assistant type definitions exist',
  'Assistant type definitions not found'
);

verify(
  'config file',
  () => fs.existsSync(path.resolve(process.cwd(), 'lib/config/assistantConfig.ts')),
  'Configuration file exists',
  'Configuration file not found'
);

verify(
  'constants file',
  () => fs.existsSync(path.resolve(process.cwd(), 'lib/constants/assistantConstants.ts')),
  'Constants file exists',
  'Constants file not found'
);

// 4. Check dependencies
console.log('\n📦 Checking dependencies...');
try {
  require('better-sqlite3');
  results.push({ passed: true, message: '✓ better-sqlite3 is installed' });
} catch {
  results.push({ passed: false, message: '✗ better-sqlite3 is not installed' });
}

// 5. Check environment files
console.log('\n🌍 Checking environment files...');
verify(
  '.env.local',
  () => fs.existsSync(path.resolve(process.cwd(), '.env.local')),
  '.env.local file exists',
  '.env.local file not found'
);

verify(
  '.env.local.example',
  () => fs.existsSync(path.resolve(process.cwd(), '.env.local.example')),
  '.env.local.example file exists',
  '.env.local.example file not found'
);

// 6. Check documentation
console.log('\n📚 Checking documentation...');
verify(
  'data README',
  () => fs.existsSync(path.resolve(process.cwd(), 'data/README.md')),
  'Data directory README exists',
  'Data directory README not found'
);

verify(
  'logs README',
  () => fs.existsSync(path.resolve(process.cwd(), 'logs/README.md')),
  'Logs directory README exists',
  'Logs directory README not found'
);

verify(
  'setup guide',
  () => fs.existsSync(path.resolve(process.cwd(), 'docs/ASSISTANT_PERSISTENCE_SETUP.md')),
  'Setup guide exists',
  'Setup guide not found'
);

// 7. Check .gitignore
console.log('\n🔒 Checking .gitignore...');
try {
  const gitignore = fs.readFileSync(path.resolve(process.cwd(), '.gitignore'), 'utf8');
  const hasDataIgnore = gitignore.includes('/data/*.db');
  const hasLogsIgnore = gitignore.includes('/logs/*.log');
  
  if (hasDataIgnore && hasLogsIgnore) {
    results.push({ passed: true, message: '✓ .gitignore properly configured' });
  } else {
    results.push({ passed: false, message: '✗ .gitignore missing data/logs entries' });
  }
} catch (error) {
  results.push({ passed: false, message: `✗ Failed to check .gitignore: ${error.message}` });
}

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
  console.log('Next steps:');
  console.log('  1. Review the setup guide: docs/ASSISTANT_PERSISTENCE_SETUP.md');
  console.log('  2. Proceed to Task 2: Implement SQLite database layer');
  console.log('  3. Run: npm run dev to start development\n');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review the errors above.\n');
  console.log('Troubleshooting:');
  console.log('  1. Check file permissions on data/ and logs/ directories');
  console.log('  2. Ensure all dependencies are installed: npm install');
  console.log('  3. Review the setup guide: docs/ASSISTANT_PERSISTENCE_SETUP.md\n');
  process.exit(1);
}
