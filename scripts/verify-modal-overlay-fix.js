/**
 * Modal Overlay Z-Index Fix Verification Script
 * 
 * This script verifies that the modal overlay z-index fix is properly implemented
 * by checking the design tokens, CSS classes, and component usage.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Modal Overlay Z-Index Fix...\n');

let allChecks = true;

// Check 1: Verify design tokens exist
console.log('✓ Check 1: Design Tokens');
try {
  const designTokensPath = path.join(__dirname, '../lib/design-tokens.ts');
  const designTokensContent = fs.readFileSync(designTokensPath, 'utf8');
  
  const checks = [
    { name: 'Z_INDEX export', pattern: /export const Z_INDEX = {/ },
    { name: 'modalOverlay: 900', pattern: /modalOverlay:\s*900/ },
    { name: 'modalContent: 950', pattern: /modalContent:\s*950/ },
    { name: 'modalNested: 980', pattern: /modalNested:\s*980/ },
    { name: 'sidebar: 9999', pattern: /sidebar:\s*9999/ },
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(designTokensContent)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name} - NOT FOUND`);
      allChecks = false;
    }
  });
} catch (error) {
  console.log(`  ❌ Error reading design tokens: ${error.message}`);
  allChecks = false;
}

console.log('');

// Check 2: Verify global CSS styles
console.log('✓ Check 2: Global CSS Styles');
try {
  const globalCssPath = path.join(__dirname, '../styles/globals.css');
  const globalCssContent = fs.readFileSync(globalCssPath, 'utf8');
  
  const checks = [
    { name: 'Modal Overlay Z-Index Fix section', pattern: /Modal Overlay Z-Index Fix/ },
    { name: '.modal-overlay-fix class', pattern: /\.modal-overlay-fix\s*{/ },
    { name: 'Overlay z-index: 900', pattern: /z-index:\s*900\s*!important/ },
    { name: 'Modal content z-index: 950', pattern: /z-index:\s*950\s*!important/ },
    { name: 'Sidebar z-index: 9999', pattern: /\[data-sidebar\][\s\S]*?z-index:\s*9999\s*!important/ },
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(globalCssContent)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name} - NOT FOUND`);
      allChecks = false;
    }
  });
} catch (error) {
  console.log(`  ❌ Error reading global CSS: ${error.message}`);
  allChecks = false;
}

console.log('');

// Check 3: Verify AssistantSettingsSidebar component
console.log('✓ Check 3: AssistantSettingsSidebar Component');
try {
  const componentPath = path.join(__dirname, '../components/AssistantSettingsSidebar.tsx');
  const componentContent = fs.readFileSync(componentPath, 'utf8');
  
  const checks = [
    { name: 'Z_INDEX import', pattern: /import.*Z_INDEX.*from.*design-tokens/ },
    { name: 'modal-overlay-fix class', pattern: /backdrop:\s*['"]modal-overlay-fix['"]/ },
    { name: 'zIndex: Z_INDEX.modalContent', pattern: /zIndex:\s*Z_INDEX\.modalContent/ },
    { name: 'Nested modal z-index', pattern: /zIndex:\s*Z_INDEX\.modalNested/ },
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(componentContent)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name} - NOT FOUND`);
      allChecks = false;
    }
  });
} catch (error) {
  console.log(`  ❌ Error reading component: ${error.message}`);
  allChecks = false;
}

console.log('');

// Check 4: Verify documentation exists
console.log('✓ Check 4: Documentation');
try {
  const docs = [
    { name: 'Theme Compatibility Guide', path: '../docs/MODAL_OVERLAY_THEME_COMPATIBILITY_GUIDE.md' },
    { name: 'Quick Reference', path: '../docs/MODAL_OVERLAY_THEME_QUICK_REFERENCE.md' },
  ];
  
  docs.forEach(doc => {
    const docPath = path.join(__dirname, doc.path);
    if (fs.existsSync(docPath)) {
      console.log(`  ✅ ${doc.name}`);
    } else {
      console.log(`  ❌ ${doc.name} - NOT FOUND`);
      allChecks = false;
    }
  });
} catch (error) {
  console.log(`  ❌ Error checking documentation: ${error.message}`);
  allChecks = false;
}

console.log('');

// Check 5: Verify test file exists
console.log('✓ Check 5: Test Files');
try {
  const testPath = path.join(__dirname, '../__tests__/modal-overlay/theme-compatibility.test.tsx');
  if (fs.existsSync(testPath)) {
    console.log(`  ✅ Theme compatibility test file`);
  } else {
    console.log(`  ❌ Theme compatibility test file - NOT FOUND`);
    allChecks = false;
  }
} catch (error) {
  console.log(`  ❌ Error checking test files: ${error.message}`);
  allChecks = false;
}

console.log('');
console.log('═'.repeat(60));

if (allChecks) {
  console.log('✅ All checks passed! Modal overlay z-index fix is properly implemented.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run the application in development mode');
  console.log('2. Follow the manual testing guide in:');
  console.log('   docs/MODAL_OVERLAY_THEME_COMPATIBILITY_GUIDE.md');
  console.log('3. Test in both light and dark themes');
  console.log('4. Verify sidebar remains visible when modal is open');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review the implementation.');
  console.log('');
  console.log('Refer to:');
  console.log('- Design: .kiro/specs/modal-overlay-z-index-fix/design.md');
  console.log('- Requirements: .kiro/specs/modal-overlay-z-index-fix/requirements.md');
  console.log('- Tasks: .kiro/specs/modal-overlay-z-index-fix/tasks.md');
  process.exit(1);
}
