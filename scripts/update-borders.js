/**
 * Update Borders Script
 * 
 * This script updates all border declarations to use transparent white
 * according to the dark mode redesign requirements:
 * - Default borders: 10% white opacity (rgba(255, 255, 255, 0.1))
 * - Subtle dividers: 8% white opacity (rgba(255, 255, 255, 0.08))
 * - Remove all colored borders
 * 
 * Requirements: 5.1, 5.2, 5.4
 */

const fs = require('fs');
const path = require('path');

// Border replacement patterns
const borderReplacements = [
  // Colored borders to transparent white
  {
    pattern: /border:\s*1px\s+solid\s+#[0-9A-Fa-f]{6}/g,
    replacement: 'border: 1px solid var(--border-default)',
    description: 'Colored borders to default transparent white'
  },
  {
    pattern: /border:\s*1px\s+solid\s+rgba?\([^)]+\)/g,
    replacement: 'border: 1px solid var(--border-default)',
    description: 'RGBA borders to default transparent white'
  },
  {
    pattern: /border-color:\s*#[0-9A-Fa-f]{6}/g,
    replacement: 'border-color: var(--border-default)',
    description: 'Colored border-color to default transparent white'
  },
  {
    pattern: /border-color:\s*rgba?\([^)]+\)/g,
    replacement: 'border-color: var(--border-default)',
    description: 'RGBA border-color to default transparent white'
  },
  // Specific workflow borders
  {
    pattern: /border:\s*1px\s+solid\s+var\(--workflow-panel-border\)/g,
    replacement: 'border: 1px solid var(--border-default)',
    description: 'Workflow panel borders to default'
  },
  {
    pattern: /border:\s*1px\s+solid\s+var\(--wf-panel-border[^)]*\)/g,
    replacement: 'border: 1px solid var(--border-default)',
    description: 'WF panel borders to default'
  },
  {
    pattern: /border:\s*1px\s+solid\s+var\(--border-primary\)/g,
    replacement: 'border: 1px solid var(--border-default)',
    description: 'Border primary to default'
  },
  // Dividers (subtle borders)
  {
    pattern: /border-bottom:\s*1px\s+solid\s+[^;]+;/g,
    replacement: 'border-bottom: 1px solid var(--border-subtle);',
    description: 'Bottom borders to subtle dividers'
  },
  {
    pattern: /border-top:\s*1px\s+solid\s+[^;]+;/g,
    replacement: 'border-top: 1px solid var(--border-subtle);',
    description: 'Top borders to subtle dividers'
  }
];

// Files to process
const cssFiles = [
  'styles/globals.css',
  'styles/dark-mode-theme.css',
  'styles/workflow-theme.css',
  'styles/workflow-redesign.css',
  'styles/WorkflowEditor.module.css',
  'styles/WorkflowCanvas.module.css',
  'styles/WorkflowCanvasRedesign.module.css',
  'styles/WorkflowEditorLayout.module.css',
  'styles/WorkflowEditorLayoutRedesign.module.css',
  'styles/WorkflowDesignSystem.module.css',
  'styles/ResultList.module.css',
  'styles/ParameterList.module.css',
  'styles/ParameterItem.module.css',
  'styles/UndoRedoControls.module.css'
];

function updateBorders() {
  let totalChanges = 0;
  
  cssFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanges = 0;
    
    borderReplacements.forEach(({ pattern, replacement, description }) => {
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
  console.log('1. Review the changes in your CSS files');
  console.log('2. Test the application to ensure borders look correct');
  console.log('3. Adjust any specific borders that need different opacity levels');
}

// Run the script
console.log('🚀 Starting border update...\n');
updateBorders();
