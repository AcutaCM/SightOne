const fs = require('fs');
const path = require('path');

// 统一的阴影样式
const SHADOW_CLASS = 'shadow-[0px_10px_50px_0px_rgba(0,0,0,0.1)]';

// 需要更新的组件列表
const componentsToUpdate = [
  'components/MemoryPanel.tsx',
  'components/HelpPanel.tsx',
  'components/SystemLogPanel.tsx',
  'components/QRScanPanel.tsx',
  'components/MissionPadPanel.tsx',
  'components/ManualControlPanel.tsx',
  'components/VirtualPositionView.tsx',
  'components/WorkflowPanel.tsx',
  'components/UserMenu.tsx',
  'components/TopNavbar.tsx',
  'components/SettingsModal.tsx',
  'components/base/BaseModal.tsx',
  'components/base/BasePanel.tsx',
];

function addShadowToComponent(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // 模式1: Card 组件 - 添加 shadow 到 className
  const cardPattern = /<Card\s+className="([^"]*)"/g;
  content = content.replace(cardPattern, (match, className) => {
    if (!className.includes('shadow-[0px_10px_50px_0px_rgba(0,0,0,0.1)]')) {
      modified = true;
      return `<Card className="${className} ${SHADOW_CLASS}"`;
    }
    return match;
  });

  // 模式2: div 容器带 border 和 rounded - 添加 shadow
  const divBorderPattern = /<div\s+className="([^"]*border[^"]*rounded[^"]*)"/g;
  content = content.replace(divBorderPattern, (match, className) => {
    if (!className.includes('shadow-[0px_10px_50px_0px_rgba(0,0,0,0.1)]')) {
      modified = true;
      return `<div className="${className} ${SHADOW_CLASS}"`;
    }
    return match;
  });

  // 模式3: 带 style 的 div 容器 (通常是 Panel)
  const divStylePattern = /<div\s+className="([^"]*)"\s+style=\{\{\s*backgroundColor:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.08\)['"]/g;
  content = content.replace(divStylePattern, (match, className) => {
    if (!className.includes('shadow-[0px_10px_50px_0px_rgba(0,0,0,0.1)]')) {
      modified = true;
      return match.replace(`className="${className}"`, `className="${className} ${SHADOW_CLASS}"`);
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 已更新: ${filePath}`);
  } else {
    console.log(`⏭️  跳过 (已有阴影或无需更新): ${filePath}`);
  }
}

console.log('🚀 开始应用全局阴影样式...\n');

componentsToUpdate.forEach(component => {
  addShadowToComponent(component);
});

console.log('\n✨ 完成！');
