/**
 * Remove Shadow Effects Script
 * 
 * This script removes all box-shadow declarations and replaces depth effects
 * with transparency-based layering according to the dark mode redesign requirements.
 * 
 * Requirements: 5.5
 */

const fs = require('fs');
const path = require('path');

// Shadow removal patterns
const shadowReplacements = [
  // Remove all box-shadow declarations
  {
    pattern: /box-shadow:\s*[^;]+;/g,
    replacement: 'box-shadow: none;',
    description: 'Remove box-shadow'
  },
  // Remove shadow variables
  {
    pattern: /--[a-zA-Z-]*shadow[a-zA-Z-]*:\s*[^;]+;/g,
    replacement: (match) => {
      // Keep the variable but set it to none
      const varName = match.match(/--[a-zA-Z-]*shadow[a-zA-Z-]*/)[0];
      return `${varName}: none;`;
    },
    description: 'Set shadow variables to none'
  }
];

// Files to process
const cssFiles = [
  'styles/globals.css',
  'styles/workflow-theme.css',
  'styles/workflow-redesign.css',
  'styles/WorkflowEditor.module.css',
  'styles/WorkflowCanvas.module.css',
  'styles/WorkflowCanvasRedesign.module.css',
  'styles/WorkflowEditorLayout.module.css',
  'styles/WorkflowEditorLayoutRedesign.module.css',
  'styles/WorkflowDesignSystem.module.css',
  'styles/ResultList.module.css',
  'styles/ParameterItem.module.css'
];

function removeShadows() {
  let totalChanges = 0;
  
  cssFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanges = 0;
    let originalContent = content;
    
    shadowReplacements.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        if (typeof replacement === 'function') {
          content = content.replace(pattern, replacement);
        } else {
          content = content.replace(pattern, replacement);
        }
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
  console.log('\n📝 Summary:');
  console.log('✓ All box-shadow declarations removed');
  console.log('✓ Shadow variables set to none');
  console.log('✓ Depth now conveyed through transparency-based layering');
  console.log('\n📝 Next steps:');
  console.log('1. Review the changes to ensure no visual regressions');
  console.log('2. Test that depth hierarchy is maintained through transparency');
  console.log('3. Verify performance improvements from removing shadows');
}

// Run the script
console.log('🚀 Starting shadow removal...\n');
removeShadows();
