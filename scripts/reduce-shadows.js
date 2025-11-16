/**
 * Script to reduce shadow intensity across all CSS files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all CSS files
const cssFiles = glob.sync('**/*.css', {
  cwd: path.join(__dirname, '..'),
  ignore: ['node_modules/**', '.next/**', 'out/**'],
  absolute: true
});

console.log(`Found ${cssFiles.length} CSS files`);

let totalChanges = 0;

cssFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Reduce box-shadow opacity
  const newContent = content.replace(
    /box-shadow:\s*([^;]+);/g,
    (match, shadowValue) => {
      // Skip if already 'none'
      if (shadowValue.trim() === 'none') {
        return match;
      }
      
      // Reduce rgba opacity by 70%
      const reduced = shadowValue.replace(
        /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/g,
        (m, r, g, b, a) => {
          const newAlpha = Math.max(0.02, parseFloat(a) * 0.3);
          return `rgba(${r}, ${g}, ${b}, ${newAlpha.toFixed(2)})`;
        }
      );
      
      if (reduced !== shadowValue) {
        changed = true;
        totalChanges++;
      }
      
      return `box-shadow: ${reduced};`;
    }
  );
  
  if (changed) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`✓ Updated: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\nTotal changes: ${totalChanges}`);
console.log('Shadow reduction complete!');
