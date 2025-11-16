#!/usr/bin/env node

/**
 * 工作流组件验证脚本
 * 
 * 用于验证系统是否正确使用 WorkflowEditor 组件
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证工作流组件...\n');

// 检查点
const checks = {
  passed: [],
  failed: [],
  warnings: []
};

// 1. 检查 WorkflowEditor 组件文件
console.log('1️⃣ 检查 WorkflowEditor 组件文件...');
const workflowEditorPath = path.join(__dirname, '../components/WorkflowEditor.tsx');
if (fs.existsSync(workflowEditorPath)) {
  const content = fs.readFileSync(workflowEditorPath, 'utf8');
  
  // 检查是否包含新版特征
  const hasInlineParameterNode = content.includes('InlineParameterNode');
  const hasNodeHeader = content.includes('NodeHeader');
  const hasParameterList = content.includes('ParameterList');
  const hasResizeHandle = content.includes('ResizeHandle') || content.includes('useNodeResize');
  
  if (hasInlineParameterNode && hasNodeHeader && hasParameterList) {
    checks.passed.push('✅ WorkflowEditor 包含新版组件引用');
  } else {
    checks.failed.push('❌ WorkflowEditor 缺少新版组件引用');
    if (!hasInlineParameterNode) checks.warnings.push('  - 缺少 InlineParameterNode');
    if (!hasNodeHeader) checks.warnings.push('  - 缺少 NodeHeader');
    if (!hasParameterList) checks.warnings.push('  - 缺少 ParameterList');
  }
  
  if (hasResizeHandle) {
    checks.passed.push('✅ WorkflowEditor 支持节点大小调整');
  } else {
    checks.warnings.push('⚠️  WorkflowEditor 可能不支持节点大小调整');
  }
} else {
  checks.failed.push('❌ WorkflowEditor.tsx 文件不存在');
}

// 2. 检查 page.tsx 导入
console.log('\n2️⃣ 检查 page.tsx 导入...');
const pagePath = path.join(__dirname, '../app/page.tsx');
if (fs.existsSync(pagePath)) {
  const content = fs.readFileSync(pagePath, 'utf8');
  
  const importLine = content.match(/import\s+WorkflowEditor\s+from\s+['"]@\/components\/WorkflowEditor['"]/);
  if (importLine) {
    checks.passed.push('✅ page.tsx 正确导入 WorkflowEditor');
  } else {
    checks.failed.push('❌ page.tsx 未正确导入 WorkflowEditor');
  }
  
  const renderLine = content.includes('<WorkflowEditor');
  if (renderLine) {
    checks.passed.push('✅ page.tsx 正确渲染 WorkflowEditor');
  } else {
    checks.failed.push('❌ page.tsx 未渲染 WorkflowEditor');
  }
} else {
  checks.failed.push('❌ app/page.tsx 文件不存在');
}

// 3. 检查 ComponentSelector 配置
console.log('\n3️⃣ 检查 ComponentSelector 配置...');
const selectorPath = path.join(__dirname, '../components/ComponentSelector.tsx');
if (fs.existsSync(selectorPath)) {
  const content = fs.readFileSync(selectorPath, 'utf8');
  
  const hasWorkflowEntry = content.includes("id: 'tello-workflow-panel'");
  if (hasWorkflowEntry) {
    checks.passed.push('✅ ComponentSelector 包含 tello-workflow-panel 配置');
    
    // 检查是否标注为新版
    const hasNewLabel = content.includes('(新版)') || content.includes('新版');
    if (hasNewLabel) {
      checks.passed.push('✅ ComponentSelector 标注为新版');
    } else {
      checks.warnings.push('⚠️  ComponentSelector 未明确标注为新版');
    }
    
    // 检查描述是否包含新功能
    const hasNewFeatures = content.includes('内联参数编辑') || 
                           content.includes('节点折叠') || 
                           content.includes('实时验证');
    if (hasNewFeatures) {
      checks.passed.push('✅ ComponentSelector 描述包含新功能');
    } else {
      checks.warnings.push('⚠️  ComponentSelector 描述未提及新功能');
    }
  } else {
    checks.failed.push('❌ ComponentSelector 缺少 tello-workflow-panel 配置');
  }
} else {
  checks.failed.push('❌ ComponentSelector.tsx 文件不存在');
}

// 4. 检查新版组件文件
console.log('\n4️⃣ 检查新版组件文件...');
const newComponents = [
  'components/workflow/InlineParameterNode.tsx',
  'components/workflow/NodeHeader.tsx',
  'components/workflow/ParameterList.tsx',
  'components/workflow/ParameterItem.tsx',
  'hooks/useNodeCollapse.ts',
  'hooks/useNodeResize.ts'
];

newComponents.forEach(comp => {
  const compPath = path.join(__dirname, '..', comp);
  if (fs.existsSync(compPath)) {
    checks.passed.push(`✅ ${comp} 存在`);
  } else {
    checks.failed.push(`❌ ${comp} 不存在`);
  }
});

// 5. 检查旧版组件
console.log('\n5️⃣ 检查旧版组件...');
const oldWorkflowPath = path.join(__dirname, '../components/WorkflowPanel.tsx');
if (fs.existsSync(oldWorkflowPath)) {
  const content = fs.readFileSync(oldWorkflowPath, 'utf8');
  
  // 检查是否在 page.tsx 中使用
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  const isUsed = pageContent.includes('WorkflowPanel') && 
                 !pageContent.includes('TelloWorkflowPanel');
  
  if (isUsed) {
    checks.failed.push('❌ 旧版 WorkflowPanel 仍在使用中');
  } else {
    checks.warnings.push('⚠️  旧版 WorkflowPanel 文件存在但未使用');
  }
} else {
  checks.passed.push('✅ 旧版 WorkflowPanel 已移除');
}

// 输出结果
console.log('\n' + '='.repeat(60));
console.log('📊 验证结果');
console.log('='.repeat(60));

if (checks.passed.length > 0) {
  console.log('\n✅ 通过的检查:');
  checks.passed.forEach(check => console.log(`  ${check}`));
}

if (checks.warnings.length > 0) {
  console.log('\n⚠️  警告:');
  checks.warnings.forEach(warning => console.log(`  ${warning}`));
}

if (checks.failed.length > 0) {
  console.log('\n❌ 失败的检查:');
  checks.failed.forEach(fail => console.log(`  ${fail}`));
}

console.log('\n' + '='.repeat(60));

// 总结
const total = checks.passed.length + checks.failed.length + checks.warnings.length;
const passRate = ((checks.passed.length / total) * 100).toFixed(1);

console.log(`\n📈 总体评分: ${passRate}%`);
console.log(`   通过: ${checks.passed.length}`);
console.log(`   警告: ${checks.warnings.length}`);
console.log(`   失败: ${checks.failed.length}`);

if (checks.failed.length === 0) {
  console.log('\n🎉 恭喜！系统正在使用 WorkflowEditor 组件！');
  console.log('\n💡 如果界面上看到的还是旧版，请尝试：');
  console.log('   1. 强制刷新浏览器 (Ctrl+Shift+R)');
  console.log('   2. 清除浏览器缓存');
  console.log('   3. 重启开发服务器');
} else {
  console.log('\n⚠️  发现问题！请检查上述失败项并修复。');
}

console.log('\n📚 详细文档: docs/WORKFLOW_COMPONENT_STATUS.md');
console.log('='.repeat(60) + '\n');

// 退出码
process.exit(checks.failed.length > 0 ? 1 : 0);
