# Admin Review配色系统使用指南

## 目录

1. [快速开始](#快速开始)
2. [CSS变量使用](#css变量使用)
3. [CSS Module使用](#css-module使用)
4. [主题切换](#主题切换)
5. [扩展指南](#扩展指南)
6. [常见问题](#常见问题)

## 快速开始

### 1. 引入必要文件

确保在你的组件中引入CSS Module:

```tsx
import styles from '@/styles/AdminReviewPage.module.css';
```

主题CSS文件已在`app/layout.tsx`中全局引入,无需重复引入。

### 2. 使用CSS Module类

```tsx
function MyComponent() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.titleText}>标题</h1>
        <p className={styles.titleDesc}>描述</p>
      </div>
    </div>
  );
}
```

### 3. 使用CSS变量

```tsx
function CustomComponent() {
  return (
    <div style={{
      background: 'var(--admin-card-bg)',
      color: 'var(--admin-text-primary)',
      padding: '16px'
    }}>
      内容
    </div>
  );
}
```

## CSS变量使用

### 背景色变量

#### 页面背景
```tsx
// 使用页面背景色
<div style={{ background: 'var(--admin-page-bg)' }}>
  页面内容
</div>
```

#### 卡片背景
```tsx
// 使用卡片背景色
<div style={{ background: 'var(--admin-card-bg)' }}>
  卡片内容
</div>
```

#### 头部背景
```tsx
// 使用头部渐变背景
<div style={{ background: 'var(--admin-header-bg)' }}>
  头部内容
</div>
```

#### 选择栏背景
```tsx
// 使用选择栏渐变背景
<div style={{ background: 'var(--admin-selection-bg)' }}>
  选择栏内容
</div>
```

#### 交互背景
```tsx
// 悬停背景
<div style={{ 
  background: 'transparent',
  ':hover': { background: 'var(--admin-hover-bg)' }
}}>
  可悬停元素
</div>

// 激活背景
<div style={{ 
  background: 'transparent',
  ':active': { background: 'var(--admin-active-bg)' }
}}>
  可点击元素
</div>
```

### 文本色变量

#### 主要文本
```tsx
// 用于标题、重要内容
<h1 style={{ color: 'var(--admin-text-primary)' }}>
  主要标题
</h1>
```

#### 次要文本
```tsx
// 用于描述、辅助信息
<p style={{ color: 'var(--admin-text-secondary)' }}>
  描述文本
</p>
```

#### 三级文本
```tsx
// 用于提示、占位符
<span style={{ color: 'var(--admin-text-tertiary)' }}>
  提示文本
</span>
```

#### 禁用文本
```tsx
// 用于禁用状态
<span style={{ color: 'var(--admin-text-disabled)' }}>
  禁用文本
</span>
```

### 边框色变量

#### 普通边框
```tsx
<div style={{ border: '1px solid var(--admin-border-color)' }}>
  带边框的元素
</div>
```

#### 浅色边框
```tsx
<div style={{ border: '1px solid var(--admin-border-color-light)' }}>
  浅色边框元素
</div>
```

#### 强调边框
```tsx
<div style={{ border: '2px solid var(--admin-border-color-emphasis)' }}>
  强调边框元素
</div>
```

### 图标色变量

```tsx
<div style={{ 
  background: 'var(--admin-icon-bg)',
  padding: '8px',
  borderRadius: '8px'
}}>
  <Icon style={{ color: 'var(--admin-icon-color)' }} />
</div>
```

### 阴影变量

```tsx
// 小阴影
<div style={{ boxShadow: 'var(--admin-shadow-sm)' }}>
  轻微阴影
</div>

// 中等阴影
<div style={{ boxShadow: 'var(--admin-shadow-md)' }}>
  中等阴影
</div>

// 大阴影
<div style={{ boxShadow: 'var(--admin-shadow-lg)' }}>
  明显阴影
</div>
```

## CSS Module使用

### 布局类

#### 页面容器
```tsx
<div className={styles.pageContainer}>
  {/* 页面内容 */}
</div>
```

#### 内容包装器
```tsx
<div className={styles.contentWrapper}>
  {/* 限制最大宽度并居中 */}
</div>
```

### 头部类

#### 完整头部结构
```tsx
<div className={styles.headerSection}>
  <div className={styles.headerTop}>
    <div className={styles.headerTitle}>
      <div className={styles.iconWrapper}>
        <Icon />
      </div>
      <div className={styles.titleContent}>
        <h1 className={styles.titleText}>标题</h1>
        <p className={styles.titleDesc}>描述</p>
      </div>
    </div>
    <div className={styles.headerActions}>
      {/* 操作按钮 */}
    </div>
  </div>
  <div className={styles.searchSection}>
    {/* 搜索和筛选 */}
  </div>
</div>
```

### 表格类

#### 表格容器
```tsx
<div className={styles.tableSection}>
  {/* 表格内容 */}
</div>
```

#### 选择栏
```tsx
{selectedItems.length > 0 && (
  <div className={styles.selectionBar}>
    {/* 批量操作 */}
  </div>
)}
```

#### 助理信息
```tsx
<div className={styles.assistantInfo}>
  <Avatar />
  <div className={styles.assistantContent}>
    <div className={styles.assistantTitle}>标题</div>
    <div className={styles.assistantDesc}>描述</div>
  </div>
</div>
```

### 模态框类

#### 模态框内容
```tsx
<Modal>
  <div className={styles.modalContent}>
    <div className={styles.detailSection}>
      <h4 className={styles.detailLabel}>标签</h4>
      <div className={styles.detailValue}>值</div>
    </div>
  </div>
</Modal>
```

#### 详情头部
```tsx
<div className={styles.detailHeader}>
  <Avatar />
  <div className={styles.detailHeaderContent}>
    <h3 className={styles.detailTitle}>标题</h3>
    <div className={styles.detailMeta}>
      <span className={styles.detailMetaItem}>元信息</span>
    </div>
  </div>
</div>
```

#### 提示词框
```tsx
<div className={styles.promptBox}>
  {promptText}
</div>
```

### 表单类

#### 表单字段
```tsx
<div className={styles.formField}>
  <label className={styles.formLabel}>
    字段名<span className={styles.required}>*</span>
  </label>
  <Input />
  {error && <div className={styles.errorText}>{error}</div>}
</div>
```

#### 表单行
```tsx
<div className={styles.formRow}>
  <div className={styles.formFieldFlex}>
    {/* 弹性字段 */}
  </div>
  <div className={styles.formFieldFixed}>
    {/* 固定宽度字段 */}
  </div>
</div>
```

#### 开关
```tsx
<div className={styles.switchWrapper}>
  <Switch />
  <span className={styles.switchLabel}>标签</span>
</div>
```

## 主题切换

### 切换到深色主题

```typescript
// 方法1: 直接设置
document.documentElement.setAttribute('data-theme', 'dark');

// 方法2: 使用React状态
const [theme, setTheme] = useState('light');

const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
};
```

### 保存主题偏好

```typescript
// 保存到localStorage
const saveTheme = (theme: string) => {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
};

// 加载主题
const loadTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  return savedTheme;
};

// 在组件中使用
useEffect(() => {
  const theme = loadTheme();
  setTheme(theme);
}, []);
```

### 跟随系统主题

```typescript
const useSystemTheme = () => {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const theme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    };
    
    // 初始设置
    const theme = mediaQuery.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    // 监听变化
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
};
```

## 扩展指南

### 添加新的CSS变量

1. 在`styles/admin-review-theme.css`中添加变量:

```css
:root {
  /* 新变量 */
  --admin-new-color: #your-color;
}

[data-theme='dark'] {
  /* 深色主题版本 */
  --admin-new-color: #your-dark-color;
}
```

2. 在组件中使用:

```tsx
<div style={{ color: 'var(--admin-new-color)' }}>
  使用新颜色
</div>
```

### 添加新的CSS Module类

1. 在`styles/AdminReviewPage.module.css`中添加类:

```css
.newClass {
  /* 使用CSS变量 */
  background: var(--admin-card-bg);
  color: var(--admin-text-primary);
  padding: 16px;
  border-radius: 8px;
}
```

2. 在组件中使用:

```tsx
<div className={styles.newClass}>
  使用新类
</div>
```

### 组合使用

```tsx
// 组合CSS Module和内联样式
<div 
  className={styles.baseClass}
  style={{
    color: 'var(--admin-text-primary)',
    marginTop: '16px'
  }}
>
  组合使用
</div>

// 组合多个CSS Module类
<div className={`${styles.class1} ${styles.class2}`}>
  多个类
</div>
```

### 创建自定义主题

```typescript
// 定义主题配置
interface ThemeConfig {
  name: string;
  colors: {
    pageBg: string;
    cardBg: string;
    textPrimary: string;
    // ... 其他颜色
  };
}

// 应用自定义主题
const applyCustomTheme = (config: ThemeConfig) => {
  const root = document.documentElement;
  Object.entries(config.colors).forEach(([key, value]) => {
    const cssVar = `--admin-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
};
```

## 常见问题

### Q1: 为什么我的颜色没有变化?

**A:** 检查以下几点:
1. 确保`admin-review-theme.css`已在`layout.tsx`中引入
2. 确保使用了正确的CSS变量名
3. 检查浏览器是否支持CSS变量
4. 清除浏览器缓存

### Q2: 如何调试CSS变量?

**A:** 在浏览器控制台中:
```javascript
// 查看变量值
const value = getComputedStyle(document.documentElement)
  .getPropertyValue('--admin-page-bg');
console.log(value);

// 临时修改变量
document.documentElement.style
  .setProperty('--admin-page-bg', '#ff0000');
```

### Q3: CSS Module类名在生产环境中会变吗?

**A:** 是的,CSS Module会生成唯一的哈希类名以避免冲突,但这是自动处理的,不影响使用。

### Q4: 如何确保主题切换流畅?

**A:** 
1. 使用CSS过渡动画(已在主题文件中配置)
2. 避免在切换时重新渲染大量组件
3. 使用`will-change`属性优化性能

### Q5: 可以混用内联样式和CSS Module吗?

**A:** 可以,但建议:
- 静态样式使用CSS Module
- 动态样式使用内联样式
- 颜色始终使用CSS变量

### Q6: 如何处理第三方组件的样式?

**A:** 
1. 使用CSS变量覆盖
2. 使用`:global`选择器
3. 使用组件的主题配置API

```css
/* 覆盖Ant Design组件 */
:global(.ant-btn) {
  background: var(--admin-card-bg);
  color: var(--admin-text-primary);
}
```

### Q7: 如何优化性能?

**A:**
1. 避免过度使用CSS变量
2. 合理使用CSS Module的局部作用域
3. 避免不必要的样式重复
4. 使用CSS变量的回退值

```css
.element {
  /* 提供回退值 */
  color: var(--admin-text-primary, rgba(0, 0, 0, 0.88));
}
```

## 最佳实践

### ✅ 推荐做法

1. **使用语义化的变量名**
   ```css
   /* 好 */
   color: var(--admin-text-primary);
   
   /* 不好 */
   color: var(--color-1);
   ```

2. **提供回退值**
   ```css
   /* 好 */
   color: var(--admin-text-primary, rgba(0, 0, 0, 0.88));
   
   /* 不好 */
   color: var(--admin-text-primary);
   ```

3. **使用CSS Module管理样式**
   ```tsx
   /* 好 */
   <div className={styles.container}>
   
   /* 不好 */
   <div style={{ padding: '16px', background: '#fff' }}>
   ```

4. **保持一致性**
   ```tsx
   /* 好 - 所有相同用途的元素使用相同的类 */
   <h1 className={styles.titleText}>标题1</h1>
   <h1 className={styles.titleText}>标题2</h1>
   
   /* 不好 - 不一致的样式 */
   <h1 style={{ fontSize: '24px' }}>标题1</h1>
   <h1 className={styles.titleText}>标题2</h1>
   ```

### ❌ 避免做法

1. **硬编码颜色**
   ```tsx
   /* 不要这样做 */
   <div style={{ color: '#666', background: '#f0f5ff' }}>
   ```

2. **过度使用内联样式**
   ```tsx
   /* 不要这样做 */
   <div style={{ 
     padding: '24px',
     background: 'linear-gradient(...)',
     borderRadius: '8px',
     // ... 更多样式
   }}>
   ```

3. **不使用CSS变量**
   ```css
   /* 不要这样做 */
   .element {
     color: #000;
     background: #fff;
   }
   ```

## 相关资源

- [完整文档](./ADMIN_REVIEW_COLOR_FIX_COMPLETE.md)
- [快速参考](./ADMIN_REVIEW_COLOR_FIX_QUICK_REFERENCE.md)
- [视觉指南](./ADMIN_REVIEW_COLOR_FIX_VISUAL_GUIDE.md)
- [需求文档](../.kiro/specs/admin-review-color-fix/requirements.md)
- [设计文档](../.kiro/specs/admin-review-color-fix/design.md)

## 支持

如有问题或建议,请联系开发团队或提交Issue。
