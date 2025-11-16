# 主题和阴影快速参考指南

## 🎨 主题变量速查表

### 背景颜色
```css
hsl(var(--heroui-content1))  /* 主要背景 - 卡片、面板 */
hsl(var(--heroui-content2))  /* 次要背景 - 输入框、按钮 */
hsl(var(--heroui-content3))  /* 悬停背景 - 悬停状态 */
hsl(var(--heroui-background)) /* 页面背景 */
```

### 文本颜色
```css
hsl(var(--heroui-foreground))           /* 主要文本 */
hsl(var(--heroui-foreground) / 0.5)     /* 次要文本（50%透明度） */
hsl(var(--heroui-foreground) / 0.6)     /* 描述文本（60%透明度） */
```

### 边框和分隔线
```css
hsl(var(--heroui-divider))  /* 所有边框和分隔线 */
```

### 主色调
```css
hsl(var(--heroui-primary))            /* 主色调背景 */
hsl(var(--heroui-primary-foreground)) /* 主色调文本 */
hsl(var(--heroui-primary) / 0.15)     /* 主色调半透明 */
```

---

## 📦 阴影预设

### 浅色主题
```css
/* 默认阴影 */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);

/* 悬停阴影 */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);

/* 轻微阴影 */
box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
```

### 深色主题
```css
/* 默认阴影 */
box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2);

/* 悬停阴影 */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);

/* 轻微阴影 */
box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
```

---

## 💡 使用示例

### 1. Styled Components

#### 基础用法
```typescript
import styled from '@emotion/styled';

const MyCard = styled.div`
  background: hsl(var(--heroui-content1));
  color: hsl(var(--heroui-foreground));
  border: 1px solid hsl(var(--heroui-divider));
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
  
  /* 深色主题特定样式 */
  .dark & {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2);
  }
`;
```

#### 带悬停效果
```typescript
const MyButton = styled.button`
  background: hsl(var(--heroui-content2));
  color: hsl(var(--heroui-foreground));
  border: 1px solid hsl(var(--heroui-divider));
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: hsl(var(--heroui-content3));
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
  }
  
  .dark &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
  }
`;
```

#### 半透明背景
```typescript
const MyOverlay = styled.div`
  background: hsl(var(--heroui-content1) / 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid hsl(var(--heroui-divider));
`;
```

### 2. 内联样式

#### 基础用法
```tsx
<div style={{
  background: 'hsl(var(--heroui-content1))',
  color: 'hsl(var(--heroui-foreground))',
  border: '1px solid hsl(var(--heroui-divider))',
  borderRadius: 12,
  padding: 16
}}>
  内容
</div>
```

#### 半透明文本
```tsx
<span style={{
  color: 'hsl(var(--heroui-foreground) / 0.5)',
  fontSize: 12
}}>
  次要文本
</span>
```

#### 主色调元素
```tsx
<div style={{
  background: 'hsl(var(--heroui-primary))',
  color: 'hsl(var(--heroui-primary-foreground))',
  padding: '8px 16px',
  borderRadius: 8
}}>
  主要按钮
</div>
```

### 3. Tailwind CSS类

#### 基础用法
```tsx
<div className="bg-content1 text-foreground border-divider rounded-xl p-4">
  内容
</div>
```

#### 带悬停效果
```tsx
<button className="bg-content2 text-foreground border-divider rounded-lg px-4 py-2 
                   hover:bg-content3 hover:-translate-y-0.5 transition-all duration-200">
  按钮
</button>
```

#### 主色调
```tsx
<div className="bg-primary text-primary-foreground rounded-lg px-4 py-2">
  主要元素
</div>
```

---

## 🎯 常见模式

### 卡片组件
```typescript
const Card = styled.div`
  background: hsl(var(--heroui-content1));
  border: 1px solid hsl(var(--heroui-divider));
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
  }
  
  .dark & {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2);
  }
  
  .dark &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
  }
`;
```

### 输入框
```typescript
const Input = styled.input`
  background: hsl(var(--heroui-content2));
  color: hsl(var(--heroui-foreground));
  border: 1px solid hsl(var(--heroui-divider));
  border-radius: 8px;
  padding: 10px 14px;
  outline: none;
  transition: all 0.2s ease-in-out;
  
  &::placeholder {
    color: hsl(var(--heroui-foreground) / 0.4);
  }
  
  &:focus {
    border-color: hsl(var(--heroui-primary));
    box-shadow: 0 0 0 3px hsl(var(--heroui-primary) / 0.1);
  }
`;
```

### 按钮
```typescript
const Button = styled.button`
  background: hsl(var(--heroui-primary));
  color: hsl(var(--heroui-primary-foreground));
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
```

### 侧边栏
```typescript
const Sidebar = styled.aside`
  background: hsl(var(--heroui-content1));
  border-right: 1px solid hsl(var(--heroui-divider));
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  
  .dark & {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }
`;
```

### 模态框
```typescript
const Modal = styled.div`
  background: hsl(var(--heroui-content1));
  border: 1px solid hsl(var(--heroui-divider));
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  
  .dark & {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
`;

const Overlay = styled.div`
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
`;
```

---

## 🔄 主题切换检查清单

在添加新组件时，确保：

- [ ] 使用`hsl(var(--heroui-*))`而不是硬编码颜色
- [ ] 为深色主题添加`.dark &`选择器（如果需要不同的阴影）
- [ ] 添加适当的阴影效果
- [ ] 添加过渡动画（`transition`）
- [ ] 测试浅色和深色主题
- [ ] 测试悬停和交互状态
- [ ] 确保文本对比度足够

---

## 🚫 避免的做法

### ❌ 不要使用硬编码颜色
```typescript
// 错误
background: '#ffffff';
color: '#000000';
border: '1px solid #e5e5e5';
```

### ❌ 不要使用rgba硬编码
```typescript
// 错误
background: 'rgba(255, 255, 255, 0.1)';
color: 'rgba(0, 0, 0, 0.8)';
```

### ❌ 不要忽略深色主题
```typescript
// 错误 - 只考虑浅色主题
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
```

### ✅ 正确的做法
```typescript
// 正确
background: hsl(var(--heroui-content1));
color: hsl(var(--heroui-foreground));
border: 1px solid hsl(var(--heroui-divider));

// 正确 - 考虑深色主题
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

.dark & {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}
```

---

## 📱 响应式设计

### 移动端优化
```typescript
const ResponsiveCard = styled.div`
  background: hsl(var(--heroui-content1));
  border: 1px solid hsl(var(--heroui-divider));
  border-radius: 16px;
  padding: 16px;
  
  /* 移动端减少阴影强度 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  
  @media (min-width: 768px) {
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
  }
  
  .dark & {
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  }
  
  @media (min-width: 768px) {
    .dark & {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2);
    }
  }
`;
```

---

## 🎨 颜色透明度参考

```css
/* 完全不透明 */
hsl(var(--heroui-foreground))

/* 90% 不透明 */
hsl(var(--heroui-foreground) / 0.9)

/* 80% 不透明 */
hsl(var(--heroui-foreground) / 0.8)

/* 60% 不透明 - 描述文本 */
hsl(var(--heroui-foreground) / 0.6)

/* 50% 不透明 - 次要文本 */
hsl(var(--heroui-foreground) / 0.5)

/* 40% 不透明 - 占位符 */
hsl(var(--heroui-foreground) / 0.4)

/* 20% 不透明 - 禁用状态 */
hsl(var(--heroui-foreground) / 0.2)

/* 10% 不透明 - 背景叠加 */
hsl(var(--heroui-foreground) / 0.1)
```

---

## 🔍 调试技巧

### 检查主题变量
在浏览器开发者工具中：
```javascript
// 获取当前主题变量值
getComputedStyle(document.documentElement).getPropertyValue('--heroui-content1')
getComputedStyle(document.documentElement).getPropertyValue('--heroui-foreground')
```

### 切换主题测试
```javascript
// 添加dark类
document.documentElement.classList.add('dark')

// 移除dark类
document.documentElement.classList.remove('dark')
```

---

## 📚 更多资源

- [HeroUI主题文档](https://heroui.com/docs/customization/theme)
- [Tailwind CSS颜色系统](https://tailwindcss.com/docs/customizing-colors)
- [CSS HSL颜色](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl)

---

**记住**: 始终使用主题变量，确保你的组件在浅色和深色主题下都能完美显示！🎨✨
