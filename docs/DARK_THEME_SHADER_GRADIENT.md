# 深色主题 ShaderGradient 背景

## 概述
为深色主题添加了动态 ShaderGradient 背景，与浅色主题形成完美对比。

## 深色主题配置

### 颜色方案
```tsx
color1="#242880"  // 深蓝色 - 主色调
color2="#8d7dca"  // 紫色 - 过渡色
color3="#212121"  // 深灰色 - 阴影
```

### 视觉特点
- **主色调**: 深蓝色 (#242880) - 神秘、专业
- **过渡色**: 紫色 (#8d7dca) - 优雅、现代
- **阴影色**: 深灰色 (#212121) - 深邃、稳重
- **整体感觉**: 神秘、科技感、专业

## 配置参数对比

| 参数 | 浅色主题 | 深色主题 | 说明 |
|------|----------|----------|------|
| **时间和动画** |
| uTime | 0 | 8 | 深色主题起始时间更晚 |
| uSpeed | 0.2 | 0.3 | 深色主题动画更快 |
| uStrength | 3.4 | 1.5 | 深色主题波纹更柔和 |
| uDensity | 1.2 | 1.5 | 深色主题密度更高 |
| **位置和旋转** |
| positionY | 0.9 | 0 | 深色主题居中 |
| positionZ | -0.3 | 0 | 深色主题无偏移 |
| rotationX | 45 | 50 | 深色主题稍微倾斜 |
| rotationZ | 0 | -60 | 深色主题有旋转 |
| **相机设置** |
| cAzimuthAngle | 170 | 180 | 深色主题正面视角 |
| cPolarAngle | 70 | 80 | 深色主题更高视角 |
| cDistance | 4.4 | 2.8 | 深色主题更近距离 |
| cameraZoom | 1 | 9.1 | 深色主题高倍放大 |
| **效果** |
| brightness | 1.2 | 1 | 深色主题标准亮度 |
| grain | "off" | "on" | 深色主题启用颗粒效果 |

## 完整配置

### 深色主题 ShaderGradient
```tsx
<ShaderGradient
  animate="on"
  type="waterPlane"
  wireframe={false}
  shader="defaults"
  uTime={8}
  uSpeed={0.3}
  uStrength={1.5}
  uDensity={1.5}
  uFrequency={0}
  uAmplitude={0}
  positionX={0}
  positionY={0}
  positionZ={0}
  rotationX={50}
  rotationY={0}
  rotationZ={-60}
  color1="#242880"
  color2="#8d7dca"
  color3="#212121"
  reflection={0.1}
  cAzimuthAngle={180}
  cPolarAngle={80}
  cDistance={2.8}
  cameraZoom={9.1}
  lightType="3d"
  brightness={1}
  envPreset="city"
  grain="on"
  toggleAxis={false}
  zoomOut={false}
  hoverState=""
  enableTransition={false}
/>
```

## 设计理念

### 浅色主题 vs 深色主题

#### 浅色主题
- **感觉**: 清新、明亮、开放
- **颜色**: 白色到天蓝色渐变
- **动画**: 缓慢、柔和
- **视角**: 远距离、低角度
- **效果**: 明亮、无颗粒

#### 深色主题
- **感觉**: 神秘、专业、科技
- **颜色**: 深蓝色到紫色渐变
- **动画**: 稍快、更密集
- **视角**: 近距离、高角度、放大
- **效果**: 标准亮度、有颗粒纹理

## 技术实现

### 组件结构
```
app/layout.tsx
├── LightThemeBackground (浅色主题)
└── DarkThemeBackground (深色主题)
```

### 条件渲染
```tsx
// 浅色主题背景
if (!mounted || resolvedTheme !== 'light') {
  return null;
}

// 深色主题背景
if (!mounted || resolvedTheme !== 'dark') {
  return null;
}
```

### 性能优化
- 两个组件互斥渲染，同时只有一个激活
- 相同的 SSR 兼容性处理
- 相同的性能设置 (pixelDensity=1)
- 相同的交互设置 (pointerEvents="none")

## 文件结构

```
components/
├── LightThemeBackground.tsx  // 浅色主题背景
└── DarkThemeBackground.tsx   // 深色主题背景

app/
└── layout.tsx               // 布局文件，包含两个背景

docs/
├── SHADER_GRADIENT_BACKGROUND_UPDATE.md  // 浅色主题文档
└── DARK_THEME_SHADER_GRADIENT.md        // 深色主题文档（本文档）
```

## 使用方法

### 自动切换
背景会根据用户的主题设置自动切换：
- 浅色主题 → 显示白色到天蓝色渐变背景
- 深色主题 → 显示深蓝紫色渐变背景
- 系统主题 → 跟随系统设置

### 手动测试
1. 启动开发服务器: `npm run dev`
2. 打开应用
3. 使用主题切换按钮在浅色/深色主题间切换
4. 观察背景的动态变化

## 颜色分析

### 深色主题颜色详解

#### #242880 (深蓝色)
- RGB: (36, 40, 128)
- HSL: (237°, 56%, 32%)
- 特点: 深邃、专业、科技感
- 用途: 主要渐变色

#### #8d7dca (紫色)
- RGB: (141, 125, 202)
- HSL: (252°, 42%, 64%)
- 特点: 优雅、神秘、现代
- 用途: 过渡渐变色

#### #212121 (深灰色)
- RGB: (33, 33, 33)
- HSL: (0°, 0%, 13%)
- 特点: 中性、稳重、深邃
- 用途: 阴影和深度

### 对比度和可读性
- 深色背景确保文本内容的高对比度
- 渐变不会干扰前景内容的可读性
- 颜色选择考虑了色盲用户的体验

## 动画特性

### 深色主题动画特点
- **更快的速度** (0.3 vs 0.2): 营造更动态的感觉
- **更柔和的波纹** (1.5 vs 3.4): 避免过于激烈的动画
- **更高的密度** (1.5 vs 1.2): 创造更丰富的纹理
- **颗粒效果**: 增加质感和深度
- **近距离视角**: 更沉浸的体验

## 总结
深色主题 ShaderGradient 背景成功实现，与浅色主题形成完美对比。深蓝紫色的配色方案营造出专业、神秘的科技感，动态效果增强了用户体验的现代感和沉浸感。
