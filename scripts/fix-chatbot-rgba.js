#!/usr/bin/env node
/**
 * ChatbotChat RGBA 颜色修复脚本
 * 将所有剩余的 rgba 颜色替换为 HSL 主题变量
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/ChatbotChat/index.tsx');

// RGBA 颜色映射表
const rgbaMappings = [
  // 主题色相关
  { from: /rgba\(22,119,255,0\.8\)/g, to: 'hsl(var(--heroui-primary) / 0.8)' },
  { from: /rgba\(22,119,255,0\.15\)/g, to: 'hsl(var(--heroui-primary) / 0.15)' },
  
  // 白色透明度
  { from: /rgba\(255,255,255,0\.95\)/g, to: 'hsl(var(--heroui-foreground) / 0.95)' },
  { from: /rgba\(255,255,255,0\.85\)/g, to: 'hsl(var(--heroui-foreground) / 0.85)' },
  { from: /rgba\(255,255,255,0\.2\)/g, to: 'hsl(var(--heroui-divider))' },
  { from: /rgba\(255,255,255,0\.18\)/g, to: 'hsl(var(--heroui-divider))' },
  { from: /rgba\(255,255,255,0\.15\)/g, to: 'hsl(var(--heroui-content2))' },
  { from: /rgba\(255,255,255,0\.1\)/g, to: 'hsl(var(--heroui-divider) / 0.5)' },
  { from: /rgba\(255,255,255,0\.05\)/g, to: 'hsl(var(--heroui-content1))' },
  { from: /rgba\(255,255,255,0\.03\)/g, to: 'hsl(var(--heroui-content1) / 0.5)' },
  { from: /rgba\(255,255,255,0\.02\)/g, to: 'hsl(var(--heroui-content1) / 0.3)' },
  
  // 黑色透明度
  { from: /rgba\(0,0,0,0\.3\)/g, to: 'hsl(0 0% 0% / 0.3)' },
];

function fixRgba() {
  console.log('🎨 开始修复 ChatbotChat RGBA 颜色...\n');
  
  try {
    // 读取文件
    let content = fs.readFileSync(filePath, 'utf-8');
    let changeCount = 0;
    
    // 应用所有 RGBA 映射
    rgbaMappings.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        content = content.replace(from, to);
        changeCount += matches.length;
        console.log(`✅ 替换 ${from} → ${to} (${matches.length} 处)`);
      }
    });
    
    // 写回文件
    if (changeCount > 0) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`\n🎉 成功！共替换 ${changeCount} 处 RGBA 颜色`);
    } else {
      console.log('\n⚠️  未找到需要替换的 RGBA 颜色');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

fixRgba();
