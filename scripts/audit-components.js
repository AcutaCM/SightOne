#!/usr/bin/env node

/**
 * 组件审计脚本
 * 扫描所有组件文件，识别使用的 UI 库
 * 生成组件迁移清单
 */

const fs = require('fs');
const path = require('path');

// UI 库导入模式
const UI_LIBRARIES = {
  heroui: /@heroui\//g,
  nextui: /@nextui-org\//g,
  antd: /from ['"]antd['"]/g,
  mui: /@mui\//g,
  custom: null // 将在后续判断
};

// 组件目录
const COMPONENTS_DIR = path.join(__dirname, '../components');
const APP_DIR = path.join(__dirname, '../app');

// 结果存储
const auditResults = {
  summary: {
    total: 0,
    heroui: 0,
    nextui: 0,
    antd: 0,
    mui: 0,
    custom: 0,
    mixed: 0
  },
  components: []
};

/**
 * 递归扫描目录
 */
function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath, results);
    } else if (file.match(/\.(tsx|jsx)$/)) {
      results.push(filePath);
    }
  });
  
  return results;
}

/**
 * 分析单个组件文件
 */
function analyzeComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);
  
  const libraries = {
    heroui: false,
    nextui: false,
    antd: false,
    mui: false
  };

  
  // 检测各个 UI 库的使用
  libraries.heroui = UI_LIBRARIES.heroui.test(content);
  libraries.nextui = UI_LIBRARIES.nextui.test(content);
  libraries.antd = UI_LIBRARIES.antd.test(content);
  libraries.mui = UI_LIBRARIES.mui.test(content);
  
  // 重置正则表达式的 lastIndex
  Object.values(UI_LIBRARIES).forEach(regex => {
    if (regex) regex.lastIndex = 0;
  });
  
  // 确定主要使用的库
  const usedLibraries = Object.keys(libraries).filter(lib => libraries[lib]);
  let primaryLibrary = 'custom';
  let migrationStatus = 'pending';
  let priority = 'low';
  
  if (usedLibraries.length === 0) {
    primaryLibrary = 'custom';
    priority = 'medium';
  } else if (usedLibraries.length === 1) {
    primaryLibrary = usedLibraries[0];
    if (primaryLibrary === 'heroui') {
      migrationStatus = 'completed';
      priority = 'low';
    } else {
      migrationStatus = 'pending';
      priority = 'high';
    }
  } else {
    primaryLibrary = 'mixed';
    migrationStatus = 'in-progress';
    priority = 'high';
  }
  
  // 估算迁移工作量（小时）
  const lineCount = content.split('\n').length;
  let estimatedEffort = 0;
  
  if (migrationStatus === 'completed') {
    estimatedEffort = 0;
  } else if (primaryLibrary === 'custom') {
    estimatedEffort = Math.ceil(lineCount / 100); // 每100行约1小时
  } else if (primaryLibrary === 'mixed') {
    estimatedEffort = Math.ceil(lineCount / 50); // 混合使用更复杂
  } else {
    estimatedEffort = Math.ceil(lineCount / 80);
  }
  
  return {
    componentName: path.basename(filePath),
    filePath: relativePath,
    primaryLibrary,
    usedLibraries,
    migrationStatus,
    priority,
    estimatedEffort,
    lineCount,
    libraries
  };
}

/**
 * 生成迁移优先级排序
 */
function sortByPriority(components) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return components.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.estimatedEffort - a.estimatedEffort;
  });
}

/**
 * 生成报告
 */
function generateReport(results) {
  console.log('\n=== 组件审计报告 ===\n');
  
  console.log('📊 总体统计：');
  console.log(`  总组件数: ${results.summary.total}`);
  console.log(`  ✅ 已使用 HeroUI: ${results.summary.heroui} (${Math.round(results.summary.heroui / results.summary.total * 100)}%)`);
  console.log(`  🔄 使用 NextUI: ${results.summary.nextui}`);
  console.log(`  🔄 使用 Ant Design: ${results.summary.antd}`);
  console.log(`  🔄 使用 Material-UI: ${results.summary.mui}`);
  console.log(`  🔧 自定义实现: ${results.summary.custom}`);
  console.log(`  ⚠️  混合使用: ${results.summary.mixed}`);
  
  const totalEffort = results.components.reduce((sum, c) => sum + c.estimatedEffort, 0);
  console.log(`\n⏱️  预计总工作量: ${totalEffort} 小时 (${Math.ceil(totalEffort / 8)} 工作日)`);
  
  console.log('\n🎯 高优先级组件（需要迁移）：');
  const highPriority = results.components.filter(c => c.priority === 'high');
  if (highPriority.length > 0) {
    highPriority.slice(0, 10).forEach(c => {
      console.log(`  - ${c.componentName} (${c.primaryLibrary}) - ${c.estimatedEffort}h`);
    });
    if (highPriority.length > 10) {
      console.log(`  ... 还有 ${highPriority.length - 10} 个组件`);
    }
  } else {
    console.log('  无');
  }
  
  console.log('\n📝 中优先级组件（自定义实现）：');
  const mediumPriority = results.components.filter(c => c.priority === 'medium');
  if (mediumPriority.length > 0) {
    mediumPriority.slice(0, 5).forEach(c => {
      console.log(`  - ${c.componentName} - ${c.estimatedEffort}h`);
    });
    if (mediumPriority.length > 5) {
      console.log(`  ... 还有 ${mediumPriority.length - 5} 个组件`);
    }
  } else {
    console.log('  无');
  }
  
  console.log('\n✅ 已完成组件（使用 HeroUI）：');
  const completed = results.components.filter(c => c.migrationStatus === 'completed');
  console.log(`  共 ${completed.length} 个组件已使用 HeroUI`);
  
  console.log('\n📄 详细报告已保存到: component-audit-report.json');
  console.log('');
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始扫描组件...\n');
  
  // 扫描组件目录
  const componentFiles = scanDirectory(COMPONENTS_DIR);
  console.log(`找到 ${componentFiles.length} 个组件文件\n`);
  
  // 分析每个组件
  componentFiles.forEach(filePath => {
    const analysis = analyzeComponent(filePath);
    auditResults.components.push(analysis);
    
    // 更新统计
    auditResults.summary.total++;
    if (analysis.primaryLibrary === 'heroui') {
      auditResults.summary.heroui++;
    } else if (analysis.primaryLibrary === 'nextui') {
      auditResults.summary.nextui++;
    } else if (analysis.primaryLibrary === 'antd') {
      auditResults.summary.antd++;
    } else if (analysis.primaryLibrary === 'mui') {
      auditResults.summary.mui++;
    } else if (analysis.primaryLibrary === 'custom') {
      auditResults.summary.custom++;
    } else if (analysis.primaryLibrary === 'mixed') {
      auditResults.summary.mixed++;
    }
  });
  
  // 按优先级排序
  auditResults.components = sortByPriority(auditResults.components);
  
  // 生成报告
  generateReport(auditResults);
  
  // 保存详细报告
  const reportPath = path.join(__dirname, '../component-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
  
  // 生成 Markdown 报告
  generateMarkdownReport(auditResults);
}

/**
 * 生成 Markdown 报告
 */
function generateMarkdownReport(results) {
  const mdPath = path.join(__dirname, '../COMPONENT_AUDIT_REPORT.md');
  
  let md = '# 组件审计报告\n\n';
  md += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  
  md += '## 📊 总体统计\n\n';
  md += `- **总组件数**: ${results.summary.total}\n`;
  md += `- **已使用 HeroUI**: ${results.summary.heroui} (${Math.round(results.summary.heroui / results.summary.total * 100)}%)\n`;
  md += `- **使用 NextUI**: ${results.summary.nextui}\n`;
  md += `- **使用 Ant Design**: ${results.summary.antd}\n`;
  md += `- **使用 Material-UI**: ${results.summary.mui}\n`;
  md += `- **自定义实现**: ${results.summary.custom}\n`;
  md += `- **混合使用**: ${results.summary.mixed}\n\n`;
  
  const totalEffort = results.components.reduce((sum, c) => sum + c.estimatedEffort, 0);
  md += `**预计总工作量**: ${totalEffort} 小时 (${Math.ceil(totalEffort / 8)} 工作日)\n\n`;
  
  md += '## 🎯 高优先级组件（需要迁移）\n\n';
  const highPriority = results.components.filter(c => c.priority === 'high');
  if (highPriority.length > 0) {
    md += '| 组件名 | 当前库 | 预计工时 | 文件路径 |\n';
    md += '|--------|--------|----------|----------|\n';
    highPriority.forEach(c => {
      md += `| ${c.componentName} | ${c.primaryLibrary} | ${c.estimatedEffort}h | ${c.filePath} |\n`;
    });
  } else {
    md += '无需迁移的高优先级组件 ✅\n';
  }
  md += '\n';
  
  md += '## 📝 中优先级组件（自定义实现）\n\n';
  const mediumPriority = results.components.filter(c => c.priority === 'medium');
  if (mediumPriority.length > 0) {
    md += '| 组件名 | 预计工时 | 文件路径 |\n';
    md += '|--------|----------|----------|\n';
    mediumPriority.forEach(c => {
      md += `| ${c.componentName} | ${c.estimatedEffort}h | ${c.filePath} |\n`;
    });
  } else {
    md += '无中优先级组件\n';
  }
  md += '\n';
  
  md += '## ✅ 已完成组件（使用 HeroUI）\n\n';
  const completed = results.components.filter(c => c.migrationStatus === 'completed');
  if (completed.length > 0) {
    md += `共 ${completed.length} 个组件已使用 HeroUI：\n\n`;
    completed.forEach(c => {
      md += `- ${c.componentName}\n`;
    });
  }
  md += '\n';
  
  md += '## 📋 详细组件清单\n\n';
  md += '### 按库分类\n\n';
  
  ['heroui', 'nextui', 'antd', 'mui', 'mixed', 'custom'].forEach(lib => {
    const components = results.components.filter(c => c.primaryLibrary === lib);
    if (components.length > 0) {
      md += `#### ${lib.toUpperCase()}\n\n`;
      components.forEach(c => {
        md += `- **${c.componentName}** (${c.estimatedEffort}h) - ${c.filePath}\n`;
      });
      md += '\n';
    }
  });
  
  fs.writeFileSync(mdPath, md);
  console.log('📄 Markdown 报告已保存到: COMPONENT_AUDIT_REPORT.md\n');
}

// 运行主函数
main();
