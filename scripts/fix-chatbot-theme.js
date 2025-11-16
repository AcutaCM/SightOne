#!/usr/bin/env node
/**
 * ChatbotChat 主题修复脚本
 * 将硬编码颜色替换为 HeroUI 主题变量
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/ChatbotChat/index.tsx');

// 颜色映射表：硬编码颜色 → HeroUI 主题变量
const colorMappings = [
  // 背景色
  { from: /#181a1f/g, to: 'hsl(var(--heroui-content1))' },
  { from: /#1f232b/g, to: 'hsl(var(--heroui-content2))' },
  { from: /#242933/g, to: 'hsl(var(--heroui-content3))' },
  { from: /#fff/g, to: 'hsl(var(--heroui-background))' },
  { from: /#111/g, to: 'hsl(var(--heroui-foreground))' },
  
  // 文本颜色
  { from: /#9ca3af/g, to: 'hsl(var(--heroui-foreground) / 0.5)' },
  { from: /#eaeaf0/g, to: 'hsl(var(--heroui-foreground))' },
  { from: /#6b7280/g, to: 'hsl(var(--heroui-default))' },
  
  // 主题色
  { from: /#1677ff/g, to: 'hsl(var(--heroui-primary))' },
  
  // RGBA 颜色
  { from: /rgba\(255,255,255,0\.04\)/g, to: 'hsl(var(--heroui-content1))' },
  { from: /rgba\(255,255,255,0\.06\)/g, to: 'hsl(var(--heroui-content1))' },
  { from: /rgba\(255,255,255,0\.08\)/g, to: 'hsl(var(--heroui-divider))' },
  { from: /rgba\(255,255,255,0\.10\)/g, to: 'hsl(var(--heroui-content2))' },
  { from: /rgba\(255,255,255,0\.12\)/g, to: 'hsl(var(--heroui-divider))' },
  { from: /rgba\(255,255,255,0\.14\)/g, to: 'hsl(var(--heroui-divider))' },
  { from: /rgba\(255,255,255,0\.16\)/g, to: 'hsl(var(--heroui-divider))' },
  { from: /rgba\(0,0,0,0\.18\)/g, to: 'hsl(var(--heroui-content1) / 0.8)' },
  { from: /rgba\(0,0,0,0\.35\)/g, to: 'hsl(var(--heroui-content1) / 0.9)' },
  { from: /rgba\(22,119,255,0\.28\)/g, to: 'hsl(var(--heroui-primary) / 0.3)' },
  
  // Box-shadow RGBA 颜色 (Emotion Styled 组件)
  { from: /rgba\(0,0,0,0\.12\)/g, to: 'hsl(var(--heroui-shadow) / 0.12)' },
  { from: /rgba\(0,0,0,0\.24\)/g, to: 'hsl(var(--heroui-shadow) / 0.24)' },
  { from: /rgba\(0,0,0,0\.25\)/g, to: 'hsl(var(--heroui-shadow) / 0.25)' },
];

function fixTheme() {
  console.log('🎨 开始修复 ChatbotChat 主题...\n');
  
  try {
    // 读取文件
    let content = fs.readFileSync(filePath, 'utf-8');
    let changeCount = 0;
    
    // 应用所有颜色映射
    colorMappings.forEach(({ from, to }) => {
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
      console.log(`\n🎉 成功！共替换 ${changeCount} 处硬编码颜色`);
    } else {
      console.log('\n⚠️  未找到需要替换的颜色');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

fixTheme();
