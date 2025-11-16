# ShaderGradient 快速参考

## 快速开始

### 安装
```bash
# 安装所需依赖
npm install shadergradient --legacy-peer-deps
npm install @react-spring/three --legacy-peer-deps
```

### 基本使用
```tsx
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import * as reactSpring from '@react-spring/three';
import * as drei from '@react-three/drei';
import * as fiber from '@react-three/fiber';

<ShaderGradientCanvas
  importedFiber={{ ...fiber, ...drei, ...reactSpring }}
  style={{ width: '100%', height: '100%' }}
  pixelDensity={1}
  pointerEvents="none"
>
  <ShaderGradient
    animate="on"
    type="waterPlane"
    color1="#94ffd1"
    color2="#6bf5ff"
    color3="#ffffff"
    // ... 其他配置
  />
</ShaderGradientCanvas>
```

## 当前配置参数

| 参数 | 值 | 说明 |
|------|-----|------|
| **动画** |
| animate | "on" | 启用动画 |
| type | "waterPlane" | 水波纹效果 |
| uSpeed | 0.2 | 动画速度（慢速） |
| uStrength | 3.4 | 波纹强度 |
| uDensity | 1.2 | 密度 |
| **颜色** |
| color1 | #94ffd1 | 青绿色 |
| color2 | #6bf5ff | 天蓝色 |
| color3 | #ffffff | 白色 |
| reflection | 0.1 | 反射强度 |
| **位置** |
| positionY | 0.9 | Y 轴位置 |
| positionZ | -0.3 | Z 轴位置 |
| rotationX | 45 | X 轴旋转 |
| **相机** |
| cAzimuthAngle | 170 | 方位角 |
| cPolarAngle | 70 | 极角 |
| cDistance | 4.4 | 距离 |
| **光照** |
| lightType | "3d" | 3D 光照 |
| brightness | 1.2 | 亮度 |
| envPreset | "city" | 环境预设 |

## 颜色方案

### 当前配色
```css
color1: #94ffd1  /* 青绿色 - 主色调 */
color2: #6bf5ff  /* 天蓝色 - 过渡色 */
color3: #ffffff  /* 白色 - 高光 */
```

### 其他推荐配色

#### 温暖日落
```tsx
color1="#FFB6C1"  // 浅粉色
color2="#FFA07A"  // 浅橙色
color3="#FFDAB9"  // 桃色
```

#### 清新薄荷
```tsx
color1="#98FB98"  // 浅绿色
color2="#AFEEEE"  // 浅青色
color3="#F0FFF0"  // 蜜瓜色
```

#### 梦幻紫罗兰
```tsx
color1="#DDA0DD"  // 梅红色
color2="#E6E6FA"  // 薰衣草色
color3="#FFF0F5"  // 淡紫红
```

## 性能调优

### 像素密度
```tsx
pixelDensity={1}    // 标准质量，最佳性能
pixelDensity={1.5}  // 高质量
pixelDensity={0.5}  // 低质量，更好性能
```

### 动画速度
```tsx
uSpeed={0.1}   // 非常慢
uSpeed={0.2}   // 慢（当前）
uSpeed={0.5}   // 中等
uSpeed={1.0}   // 快
```

### 波纹强度
```tsx
uStrength={1.0}   // 轻微
uStrength={3.4}   // 中等（当前）
uStrength={5.0}   // 强烈
```

## 常见问题

### Q: 如何禁用动画？
```tsx
animate="off"
```

### Q: 如何更改渐变类型？
```tsx
type="plane"        // 平面
type="sphere"       // 球体
type="waterPlane"   // 水波纹（当前）
```

### Q: 如何调整亮度？
```tsx
brightness={0.8}   // 较暗
brightness={1.0}   // 标准
brightness={1.2}   // 较亮（当前）
brightness={1.5}   // 很亮
```

### Q: 如何移除反射？
```tsx
reflection={0}     // 无反射
reflection={0.1}   // 轻微反射（当前）
reflection={0.5}   // 明显反射
```

## 调试技巧

### 显示坐标轴
```tsx
toggleAxis={true}
```

### 启用线框模式
```tsx
wireframe={true}
```

### 查看不同环境预设
```tsx
envPreset="city"      // 城市（当前）
envPreset="dawn"      // 黎明
envPreset="sunset"    // 日落
envPreset="warehouse" // 仓库
```

## 最佳实践

1. **始终设置 pointerEvents="none"**
   - 避免阻止用户交互

2. **使用适当的 z-index**
   - 背景应该在 z-index: -1

3. **条件渲染**
   - 仅在需要时渲染（如特定主题）

4. **性能监控**
   - 在低端设备上考虑降级方案

5. **SSR 兼容**
   - 使用 'use client' 指令
   - 添加 mounted 状态检查

## 文件位置
- 组件: `components/LightThemeBackground.tsx`
- 文档: `docs/SHADER_GRADIENT_BACKGROUND_UPDATE.md`
- 使用: `app/layout.tsx`
