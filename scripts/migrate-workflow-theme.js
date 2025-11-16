#!/usr/bin/env node

/**
 * Workflow主题迁移脚本
 * 
 * 自动将旧版蓝色主题的Workflow组件迁移到新的黑白灰主题系统
 * 
 * 使用方法:
 *   node scripts/migrate-workflow-theme.js              # 执行迁移
 *   node scripts/migrate-workflow-theme.js --dry-run    # 仅检查不修改
 *   node scripts/migrate-workflow-theme.js --dir=./app  # 指定目录
 *   node scripts/migrate-workflow-theme.js --help       # 显示帮助
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// CSS变量映射表
const cssVariableMap = {
  '--primary-blue': '--node-selected',
  '--secondary-blue': '--node-border-hover',
  '--bg-blue-light': '--node-header-bg',
  '--bg-blue': '--node-bg',
  '--text-blue': '--text-primary',
  '--text-blue-secondary': '--text-secondary',
  '--border-blue': '--node-border',
  '--shadow-sm': '--node-shadow',
  '--shadow-md': '--node-shadow-hover',
  '--shadow-lg': '--node-shadow-selected',
  '--blue-50': '--node-header-bg',
  '--blue-100': '--param-bg',
  '--blue-200': '--param-bg-hover',
  '--blue-500': '--node-selected',
  '--blue-600': '--node-border-hover',
};

// 废弃的Props列表
const deprecatedProps = [
  'color',
  'variant',
  'theme',
  'colorScheme',
  'showBadge',
];

// 组件导入路径映射
const importMap = {
  '@/components/workflow/NodeHeaderOld': '@/components/workflow/NodeHeader',
  '@/components/workflow/ParameterItemOld': '@/components/workflow/ParameterItem',
  '@/components/workflow/InlineParameterNodeOld': '@/components/workflow/InlineParameterNode',
};

// 统计信息
const stats = {
  filesScanned: 0,
  filesModified: 0,
  cssVariablesReplaced: 0,
  propsRemoved: 0,
  importsUpdated: 0,
  errors: [],
};

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
Workflow主题迁移脚本

使用方法:
  node scripts/migrate-workflow-theme.js [选项]

选项:
  --dry-run          仅检查不修改文件
  --dir=<path>       指定要迁移的目录 (默认: ./)
  --verbose          显示详细信息
  --help             显示此帮助信息

示例:
  node scripts/migrate-workflow-theme.js
  node scripts/migrate-workflow-theme.js --dry-run
  node scripts/migrate-workflow-theme.js --dir=./components
  node scripts/migrate-workflow-theme.js --dry-run --verbose
  `);
}

/**
 * 替换CSS变量
 */
function replaceCSSVariables(content) {
  let modified = content;
  let count = 0;
  
  Object.entries(cssVariableMap).forEach(([oldVar, newVar]) => {
    const regex = new RegExp(oldVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = modified.match(regex);
    if (matches) {
      modified = modified.replace(regex, newVar);
      count += matches.length;
    }
  });
  
  return { content: modified, count };
}

/**
 * 移除废弃的Props
 */
function removeDeprecatedProps(content) {
  let modified = content;
  let count = 0;
  
  deprecatedProps.forEach(prop => {
    // 匹配 prop={...} 或 prop="..." 或 prop='...'
    const patterns = [
      new RegExp(`\\s+${prop}=\\{[^}]+\\}`, 'g'),
      new RegExp(`\\s+${prop}="[^"]*"`, 'g'),
      new RegExp(`\\s+${prop}='[^']*'`, 'g'),
    ];
    
    patterns.forEach(regex => {
      const matches = modified.match(regex);
      if (matches) {
        modified = modified.replace(regex, '');
        count += matches.length;
      }
    });
  });
  
  return { content: modified, count };
}

/**
 * 更新导入语句
 */
function updateImports(content) {
  let modified = content;
  let count = 0;
  
  Object.entries(importMap).forEach(([oldPath, newPath]) => {
    const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = modified.match(regex);
    if (matches) {
      modified = modified.replace(regex, newPath);
      count += matches.length;
    }
  });
  
  return { content: modified, count };
}

/**
 * 迁移单个文件
 */
function migrateFile(filePath, options) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = content;
    let fileModified = false;
    
    // 替换CSS变量
    const cssResult = replaceCSSVariables(modified);
    if (cssResult.count > 0) {
      modified = cssResult.content;
      stats.cssVariablesReplaced += cssResult.count;
      fileModified = true;
      if (options.verbose) {
        console.log(`  📝 替换了 ${cssResult.count} 个CSS变量`);
      }
    }
    
    // 移除废弃的Props (仅处理 .tsx 和 .ts 文件)
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      const propsResult = removeDeprecatedProps(modified);
      if (propsResult.count > 0) {
        modified = propsResult.content;
        stats.propsRemoved += propsResult.count;
        fileModified = true;
        if (options.verbose) {
          console.log(`  🗑️  移除了 ${propsResult.count} 个废弃Props`);
        }
      }
      
      // 更新导入语句
      const importResult = updateImports(modified);
      if (importResult.count > 0) {
        modified = importResult.content;
        stats.importsUpdated += importResult.count;
        fileModified = true;
        if (options.verbose) {
          console.log(`  📦 更新了 ${importResult.count} 个导入语句`);
        }
      }
    }
    
    // 写入文件
    if (fileModified) {
      if (!options.dryRun) {
        fs.writeFileSync(filePath, modified, 'utf8');
        console.log(`✅ 已更新: ${filePath}`);
      } else {
        console.log(`🔍 需要更新: ${filePath}`);
      }
      stats.filesModified++;
    } else if (options.verbose) {
      console.log(`⏭️  跳过: ${filePath} (无需更改)`);
    }
    
    return fileModified;
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`❌ 错误: ${filePath} - ${error.message}`);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  // 解析参数
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    dir: args.find(arg => arg.startsWith('--dir='))?.split('=')[1] || './',
  };
  
  console.log('🚀 开始迁移Workflow主题...\n');
  console.log(`📂 目标目录: ${options.dir}`);
  console.log(`🔍 模式: ${options.dryRun ? '检查模式 (不修改文件)' : '迁移模式'}\n`);
  
  // 查找所有相关文件
  const patterns = [
    `${options.dir}/**/*.tsx`,
    `${options.dir}/**/*.ts`,
    `${options.dir}/**/*.css`,
    `${options.dir}/**/*.scss`,
  ];
  
  const files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**'],
    });
    files.push(...matches);
  }
  
  stats.filesScanned = files.length;
  
  console.log(`📊 找到 ${files.length} 个文件\n`);
  
  // 迁移每个文件
  for (const file of files) {
    migrateFile(file, options);
  }
  
  // 显示统计信息
  console.log('\n' + '='.repeat(60));
  console.log('✨ 迁移完成!\n');
  console.log(`📊 统计信息:`);
  console.log(`  - 扫描文件: ${stats.filesScanned}`);
  console.log(`  - ${options.dryRun ? '需要' : '已'}更新文件: ${stats.filesModified}`);
  console.log(`  - CSS变量替换: ${stats.cssVariablesReplaced}`);
  console.log(`  - Props移除: ${stats.propsRemoved}`);
  console.log(`  - 导入更新: ${stats.importsUpdated}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n⚠️  错误: ${stats.errors.length}`);
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }
  
  if (options.dryRun && stats.filesModified > 0) {
    console.log('\n💡 提示: 运行以下命令来应用更改:');
    console.log(`   node scripts/migrate-workflow-theme.js --dir=${options.dir}`);
  }
  
  console.log('='.repeat(60));
}

// 运行主函数
main().catch(error => {
  console.error('❌ 迁移失败:', error);
  process.exit(1);
});
