/**
 * Update Focus Indicators Script
 * 
 * This script updates all focus indicator styles to use 40% white opacity
 * according to the dark mode redesign requirements.
 * 
 * Requirements: 5.3, 5.4
 */

const fs = require('fs');
const path = require('path');

// Focus indicator replacement patterns
const focusReplacements = [
  // Update outline colors to use --border-focus
  {
    pattern: /outline:\s*2px\s+solid\s+var\(--wf-node-selected-border[^)]*\)/g,
    replacement: 'outline: 2px solid var(--border-focus)',
    description: 'WF node selected border to focus border'
  },
  {
    pattern: /outline:\s*2px\s+solid\s+#[0-9A-Fa-f]{6}/g,
    replacement: 'outline: 2px solid var(--border-focus)',
    description: 'Colored outline to focus border'
  },
  // Update focus box-shadows to use focus border
  {
    pattern: /box-shadow:\s*0\s+0\s+0\s+3px\s+var\(--wf-node-selected-glow[^)]*\)/g,
    replacement: 'box-shadow: none',
    description: 'Remove focus box-shadow glow'
  },
  {
    pattern: /box-shadow:\s*0\s+0\s+0\s+3px\s+rgba\([^)]+\)/g,
    replacement: 'box-shadow: none',
    description: 'Remove RGBA focus box-shadow'
  },
  // Update border-color on focus
  {
    pattern: /border-color:\s*var\(--wf-node-selected-border[^)]*\)/g,
    replacement: 'border-color: var(--border-focus)',
    description: 'WF selected border color to focus border'
  },
  {
    pattern: /border-color:\s*var\(--workflow-status-running\)/g,
    replacement: 'border-color: var(--border-focus)',
    description: 'Workflow status running to focus border'
  }
];

// Files to process
const cssFiles = [
  'styles/NodeLibraryHeader.module.css',
  'styles/NodeLibraryFooter.module.css',
  'styles/NodeCard.module.css',
  'styles/ExportButton.module.css',
  'styles/CustomWorkflowNode.module.css',
  'styles/CollapsibleNodeLibrary.module.css',
  'styles/CategoryTabs.module.css',
  'styles/CanvasToolbar.module.css',
  'styles/AlignmentToolbar.module.css',
  'styles/NodeParameterPreview.module.css'
];

function updateFocusIndicators() {
  let totalChanges = 0;
  
  cssFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanges = 0;
    
    focusReplacements.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fileChanges += matches.length;
        console.log(`  ✓ ${description}: ${matches.length} replacements`);
      }
    });
    
    if (fileChanges > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${file}: ${fileChanges} changes\n`);
      totalChanges += fileChanges;
    }
  });
  
  console.log(`\n🎉 Total changes: ${totalChanges}`);
  console.log('\n📝 Next steps:');
  console.log('1. Test keyboard navigation across all components');
  console.log('2. Verify focus indicators are visible at 40% white opacity');
  console.log('3. Ensure WCAG 2.1 compliance for focus visibility');
}

// Run the script
console.log('🚀 Starting focus indicator update...\n');
updateFocusIndicators();
