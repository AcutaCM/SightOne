# 🎨 全新蓝色主题设计系统

## 设计理念

### 核心原则
1. **统一的蓝色主调** - 深色和浅色模式都使用蓝色作为主色调
2. **清晰的视觉层次** - 通过阴影和对比度创造深度
3. **现代科技感** - 适合无人机控制系统的专业形象
4. **优雅的过渡** - 主题切换流畅自然

---

## 🎨 色彩系统

### 浅色模式（Light Mode）

#### 主色调 - 蓝色系
```css
--primary-50:  #eff6ff;  /* 最浅蓝 - 背景高亮 */
--primary-100: #dbeafe;  /* 很浅蓝 - 悬停背景 */
--primary-200: #bfdbfe;  /* 浅蓝 - 次要元素 */
--primary-300: #93c5fd;  /* 中浅蓝 - 边框 */
--primary-400: #60a5fa;  /* 中蓝 - 图标 */
--primary-500: #3b82f6;  /* 标准蓝 - 主按钮 */
--primary-600: #2563eb;  /* 深蓝 - 按钮悬停 */
--primary-700: #1d4ed8;  /* 很深蓝 - 按钮按下 */
--primary-800: #1e40af;  /* 极深蓝 - 强调 */
--primary-900: #1e3a8a;  /* 最深蓝 - 文本 */
```

#### 背景色系
```css
--background:     #f8fafc;  /* 页面背景 - 极浅灰蓝 */
--surface:        #ffffff;  /* 卡片背景 - 纯白 */
--surface-hover:  #f1f5f9;  /* 卡片悬停 - 浅灰蓝 */
--surface-active: #e2e8f0;  /* 卡片激活 - 灰蓝 */
```

#### 文本色系
```css
--text-primary:   #0f172a;  /* 主要文本 - 深蓝灰 */
--text-secondary: #475569;  /* 次要文本 - 中蓝灰 */
--text-tertiary:  #64748b;  /* 三级文本 - 浅蓝灰 */
--text-disabled:  #cbd5e1;  /* 禁用文本 - 很浅灰 */
```

#### 边框色系
```css
--border-light:   #e2e8f0;  /* 浅边框 */
--border-medium:  #cbd5e1;  /* 中边框 */
--border-strong:  #94a3b8;  /* 强边框 */
```

### 深色模式（Dark Mode）

#### 主色调 - 蓝色系（更亮更鲜艳）
```css
--primary-50:  #1e3a8a;  /* 深蓝 - 背景 */
--primary-100: #1e40af;  /* 中深蓝 */
--primary-200: #1d4ed8;  /* 中蓝 */
--primary-300: #2563eb;  /* 标准蓝 */
--primary-400: #3b82f6;  /* 亮蓝 - 主按钮 */
--primary-500: #60a5fa;  /* 很亮蓝 - 悬停 */
--primary-600: #93c5fd;  /* 极亮蓝 - 高亮 */
--primary-700: #bfdbfe;  /* 浅亮蓝 */
--primary-800: #dbeafe;  /* 很浅亮蓝 */
--primary-900: #eff6ff;  /* 最浅亮蓝 */
```

#### 背景色系（深蓝灰调）
```css
--background:     #0a0f1e;  /* 页面背景 - 极深蓝灰 */
--surface:        #111827;  /* 卡片背景 - 深蓝灰 */
--surface-hover:  #1f2937;  /* 卡片悬停 - 中深蓝灰 */
--surface-active: #374151;  /* 卡片激活 - 中蓝灰 */
```

#### 文本色系
```css
--text-primary:   #f1f5f9;  /* 主要文本 - 极浅灰 */
--text-secondary: #cbd5e1;  /* 次要文本 - 浅灰 */
--text-tertiary:  #94a3b8;  /* 三级文本 - 中灰 */
--text-disabled:  #475569;  /* 禁用文本 - 深灰 */
```

#### 边框色系
```css
--border-light:   #1f2937;  /* 浅边框 */
--border-medium:  #374151;  /* 中边框 */
--border-strong:  #4b5563;  /* 强边框 */
```

---

## 🎯 组件配色方案

### 按钮（Button）

#### 主要按钮（Primary）
```css
/* 浅色模式 */
background: #3b82f6;  /* primary-500 */
color: #ffffff;
hover: #2563eb;       /* primary-600 */
active: #1d4ed8;      /* primary-700 */
shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

/* 深色模式 */
background: #3b82f6;  /* primary-400 */
color: #ffffff;
hover: #60a5fa;       /* primary-500 */
active: #93c5fd;      /* primary-600 */
shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
```

#### 次要按钮（Secondary）
```css
/* 浅色模式 */
background: #f1f5f9;  /* surface-hover */
color: #1e3a8a;       /* primary-900 */
border: 1px solid #cbd5e1;
hover: #e2e8f0;       /* surface-active */

/* 深色模式 */
background: #1f2937;  /* surface-hover */
color: #93c5fd;       /* primary-600 */
border: 1px solid #374151;
hover: #374151;       /* surface-active */
```

### 卡片（Card）

```css
/* 浅色模式 */
background: #ffffff;  /* surface */
border: 1px solid #e2e8f0;
shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
hover-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);

/* 深色模式 */
background: #111827;  /* surface */
border: 1px solid #1f2937;
shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
hover-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
```

### 输入框（Input）

```css
/* 浅色模式 */
background: #ffffff;
border: 1px solid #cbd5e1;
focus-border: #3b82f6;  /* primary-500 */
focus-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);

/* 深色模式 */
background: #1f2937;
border: 1px solid #374151;
focus-border: #60a5fa;  /* primary-500 */
focus-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
```

### 导航栏（Navbar）

```css
/* 浅色模式 */
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(12px);
border-bottom: 1px solid #e2e8f0;
shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

/* 深色模式 */
background: rgba(17, 24, 39, 0.8);
backdrop-filter: blur(12px);
border-bottom: 1px solid #1f2937;
shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
```

---

## 💫 视觉效果

### 阴影系统

#### 浅色模式
```css
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md:  0 4px 8px rgba(0, 0, 0, 0.08);
--shadow-lg:  0 8px 16px rgba(0, 0, 0, 0.12);
--shadow-xl:  0 12px 24px rgba(0, 0, 0, 0.15);
--shadow-2xl: 0 16px 32px rgba(0, 0, 0, 0.18);

/* 蓝色阴影（用于主要元素） */
--shadow-blue: 0 4px 12px rgba(59, 130, 246, 0.3);
--shadow-blue-lg: 0 8px 24px rgba(59, 130, 246, 0.4);
```

#### 深色模式
```css
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md:  0 4px 8px rgba(0, 0, 0, 0.4);
--shadow-lg:  0 8px 16px rgba(0, 0, 0, 0.5);
--shadow-xl:  0 12px 24px rgba(0, 0, 0, 0.6);
--shadow-2xl: 0 16px 32px rgba(0, 0, 0, 0.7);

/* 蓝色阴影（更明显） */
--shadow-blue: 0 4px 12px rgba(59, 130, 246, 0.5);
--shadow-blue-lg: 0 8px 24px rgba(59, 130, 246, 0.6);
```

### 渐变效果

#### 浅色模式
```css
/* 页面背景渐变 */
background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);

/* 卡片渐变（可选） */
background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);

/* 按钮渐变 */
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
```

#### 深色模式
```css
/* 页面背景渐变 */
background: linear-gradient(135deg, #0a0f1e 0%, #1e3a8a 100%);

/* 卡片渐变（可选） */
background: linear-gradient(135deg, #111827 0%, #1f2937 100%);

/* 按钮渐变 */
background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
```

### 毛玻璃效果（Glassmorphism）

```css
/* 浅色模式 */
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(12px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.3);

/* 深色模式 */
background: rgba(17, 24, 39, 0.7);
backdrop-filter: blur(12px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.1);
```

---

## 🎭 动画效果

### 主题切换动画
```css
* {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease,
              box-shadow 0.3s ease;
}
```

### 悬停效果
```css
.card:hover {
  transform: translateY(-2px);
  transition: all 0.2s ease-in-out;
}

.button:hover {
  transform: scale(1.02);
  transition: all 0.2s ease-in-out;
}
```

### 加载动画
```css
@keyframes pulse-blue {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
}
```

---

## 📐 布局规范

### 间距系统
```css
--spacing-xs:  4px;
--spacing-sm:  8px;
--spacing-md:  16px;
--spacing-lg:  24px;
--spacing-xl:  32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

### 圆角系统
```css
--radius-sm:  4px;
--radius-md:  8px;
--radius-lg:  12px;
--radius-xl:  16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### 字体系统
```css
/* 字号 */
--text-xs:   12px;
--text-sm:   14px;
--text-base: 16px;
--text-lg:   18px;
--text-xl:   20px;
--text-2xl:  24px;
--text-3xl:  30px;
--text-4xl:  36px;

/* 字重 */
--font-normal:   400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
```

---

## 🎨 实际应用示例

### 主页面布局

#### 浅色模式
```css
body {
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
  color: #0f172a;
}

.navbar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.button-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
```

#### 深色模式
```css
body {
  background: linear-gradient(135deg, #0a0f1e 0%, #1e3a8a 100%);
  color: #f1f5f9;
}

.navbar {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #1f2937;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.card {
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.button-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
}
```

---

## 🚀 实施计划

### 阶段1：更新主题配置（1-2小时）
1. 更新 `tailwind.config.js` 中的颜色定义
2. 更新 `design-tokens.ts` 中的设计令牌
3. 创建新的 CSS 变量系统

### 阶段2：更新全局样式（2-3小时）
1. 更新 `globals.css` 中的基础样式
2. 添加新的渐变和阴影效果
3. 优化主题切换动画

### 阶段3：更新组件样式（3-4小时）
1. 更新所有按钮组件
2. 更新所有卡片组件
3. 更新导航栏和侧边栏
4. 更新表单组件

### 阶段4：测试和优化（1-2小时）
1. 测试浅色/深色模式切换
2. 检查所有组件的视觉一致性
3. 优化性能和动画效果
4. 修复任何视觉问题

---

## ✅ 验收标准

### 视觉一致性
- [ ] 所有组件使用统一的蓝色主题
- [ ] 浅色和深色模式视觉协调
- [ ] 阴影效果明显且美观
- [ ] 文本对比度符合 WCAG AA 标准

### 交互体验
- [ ] 主题切换流畅无闪烁
- [ ] 悬停效果响应迅速
- [ ] 动画自然不突兀
- [ ] 加载状态清晰可见

### 性能指标
- [ ] 主题切换 < 300ms
- [ ] 首次渲染 < 1s
- [ ] 无明显卡顿
- [ ] 内存使用正常

---

## 📚 参考资源

### 设计灵感
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [Material Design Color System](https://material.io/design/color)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

### 技术文档
- [HeroUI Theme Configuration](https://heroui.com/docs/customization/theme)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [CSS Backdrop Filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)

---

**准备好开始实施了吗？** 🚀

这个设计系统将为你的应用带来：
- ✨ 统一的蓝色主题
- 🎨 现代的视觉风格
- 🌓 完美的深浅模式切换
- 💫 优雅的动画效果
- 📱 响应式设计
