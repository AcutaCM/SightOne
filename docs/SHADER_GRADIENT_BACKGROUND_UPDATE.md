# ShaderGradient 背景更新

## 更新日期
2024年

## 更新内容
将浅色主题背景从简单的径向渐变升级为动态的 ShaderGradient 水波纹效果。

## 技术栈
- **shadergradient**: 用于创建动态 WebGL 着色器渐变
- **@react-three/fiber**: React Three.js 渲染器
- **@react-three/drei**: Three.js 辅助工具
- **@react-spring/three**: 3D 动画库

## ShaderGradient 配置

### 基础设置
```tsx
<ShaderGradientCanvas
  pixelDensity={1}
  pointerEvents="none"
  style={{ width: '100%', height: '100%' }}
>
```

### 渐变参数
```tsx
<ShaderGradient
  // 动画设置
  animate="on"
  type="waterPlane"
  wireframe={false}
  shader="defaults"
  
  // 运动参数
  uTime={0}
  uSpeed={0.2}        // 动画速度
  uStrength={3.4}     // 波纹强度
  uDensity={1.2}      // 密度
  uFrequency={0}      // 频率
  uAmplitude={0}      // 振幅
  
  // 位置和旋转
  positionX={0}
  positionY={0.9}
  positionZ={-0.3}
  rotationX={45}
  rotationY={0}
  rotationZ={0}
  
  // 颜色配置
  color1="#94ffd1"    // 青绿色
  color2="#6bf5ff"    // 天蓝色
  color3="#ffffff"    // 白色
  reflection={0.1}
  
  // 相机设置
  cAzimuthAngle={170}
  cPolarAngle={70}
  cDistance={4.4}
  cameraZoom={1}
  
  // 光照和效果
  lightType="3d"
  brightness={1.2}
  envPreset="city"
  grain="off"
  
  // 工具选项
  toggleAxis={false}
  zoomOut={false}
  hoverState=""
  enableTransition={false}
/>
```

## 视觉效果

### 颜色方案
- **主色调**: 青绿色 (#94ffd1) 到天蓝色 (#6bf5ff)
- **辅助色**: 白色 (#ffffff)
- **整体感觉**: 清新、现代、流动

### 动画特性
- **类型**: 水波纹平面 (waterPlane)
- **速度**: 0.2 (柔和缓慢)
- **强度**: 3.4 (中等波动)
- **密度**: 1.2 (适中)

### 光照效果
- **类型**: 3D 光照
- **亮度**: 1.2 (稍微增强)
- **环境**: 城市预设 (city)
- **反射**: 0.1 (轻微反射)

## 性能优化

### 像素密度
```tsx
pixelDensity={1}
```
- 设置为 1 以平衡性能和视觉质量
- 在高 DPI 屏幕上避免过度渲染

### 指针事件
```tsx
pointerEvents="none"
```
- 禁用指针事件，确保不干扰页面交互
- 背景完全透明于用户操作

### 渲染优化
- 仅在浅色主题下渲染
- 使用 `mounted` 状态避免 SSR 水合不匹配
- 固定定位，z-index: -1，确保在所有内容之下

## 主题集成

### 条件渲染
```tsx
if (!mounted || resolvedTheme !== 'light') {
  return null;
}
```

组件仅在以下条件下渲染：
1. 组件已挂载（避免 SSR 问题）
2. 当前主题为浅色模式

### 深色主题
深色主题下不显示此背景，保持纯黑背景。

## 安装依赖

```bash
# 安装 shadergradient
npm install shadergradient --legacy-peer-deps

# 安装 @react-spring/three
npm install @react-spring/three --legacy-peer-deps
```

注意：使用 `--legacy-peer-deps` 标志以解决与现有 three.js 版本的依赖冲突。

### 所需依赖列表
- `shadergradient` - ShaderGradient 核心库
- `@react-spring/three` - React Spring 3D 动画库
- `@react-three/fiber` - React Three.js 渲染器（已存在）
- `@react-three/drei` - Three.js 辅助工具（已存在）
- `three` - Three.js 核心库（已存在）

## 文件位置
- 组件文件: `components/LightThemeBackground.tsx`
- 使用位置: `app/layout.tsx`

## 使用方法

### 在布局中使用
```tsx
import { LightThemeBackground } from "@/components/LightThemeBackground";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <LightThemeBackground />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 自定义样式
```tsx
<LightThemeBackground className="custom-class" />
```

## 浏览器兼容性
- 需要 WebGL 支持
- 现代浏览器（Chrome, Firefox, Safari, Edge）
- 移动设备支持

## 注意事项

1. **性能考虑**
   - WebGL 渲染可能在低端设备上影响性能
   - 考虑添加性能检测和降级方案

2. **SSR 兼容性**
   - 使用 `'use client'` 指令
   - 通过 `mounted` 状态避免水合错误

3. **z-index 管理**
   - 固定在 z-index: -1
   - 确保在所有页面内容之下

4. **指针事件**
   - 设置为 `none` 确保不阻止用户交互
   - 背景完全透明于点击事件

## 未来改进

1. **性能优化**
   - 添加设备性能检测
   - 低端设备降级为静态渐变

2. **自定义选项**
   - 允许用户自定义颜色
   - 提供多种预设效果

3. **动画控制**
   - 添加暂停/播放控制
   - 响应用户偏好设置（减少动画）

4. **主题变体**
   - 为深色主题创建对应效果
   - 支持更多主题颜色方案

## 相关资源
- [ShaderGradient 文档](https://www.shadergradient.co/)
- [React Three Fiber 文档](https://docs.pmnd.rs/react-three-fiber)
- [Three.js 文档](https://threejs.org/docs/)
