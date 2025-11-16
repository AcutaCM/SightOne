# Admin Review配色修正快速参考

## 快速开始

### 使用CSS变量

```css
/* 在你的样式中使用 */
.myElement {
  background: var(--admin-card-bg);
  color: var(--admin-text-primary);
  border: 1px solid var(--admin-border-color);
}
```

### 使用CSS Module

```tsx
import styles from '@/styles/AdminReviewPage.module.css';

function MyComponent() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerSection}>
        {/* 内容 */}
      </div>
    </div>
  );
}
```

## 可用的CSS变量

### 背景色
| 变量名 | 浅色主题 | 深色主题 | 用途 |
|--------|----------|----------|------|
| `--admin-page-bg` | #f0f2f5 | #141414 | 页面背景 |
| `--admin-card-bg` | #ffffff | #1f1f1f | 卡片背景 |
| `--admin-header-bg` | 渐变 | 渐变 | 头部背景 |
| `--admin-selection-bg` | 渐变 | 渐变 | 选择栏背景 |
| `--admin-hover-bg` | rgba(0,0,0,0.04) | rgba(255,255,255,0.08) | 悬停背景 |
| `--admin-active-bg` | rgba(0,0,0,0.08) | rgba(255,255,255,0.12) | 激活背景 |

### 文本色
| 变量名 | 浅色主题 | 深色主题 | 用途 |
|--------|----------|----------|------|
| `--admin-text-primary` | rgba(0,0,0,0.88) | rgba(255,255,255,0.88) | 主要文本 |
| `--admin-text-secondary` | rgba(0,0,0,0.65) | rgba(255,255,255,0.65) | 次要文本 |
| `--admin-text-tertiary` | rgba(0,0,0,0.45) | rgba(255,255,255,0.45) | 三级文本 |
| `--admin-text-disabled` | rgba(0,0,0,0.25) | rgba(255,255,255,0.25) | 禁用文本 |

### 边框色
| 变量名 | 浅色主题 | 深色主题 | 用途 |
|--------|----------|----------|------|
| `--admin-border-color` | #d9d9d9 | #434343 | 普通边框 |
| `--admin-border-color-light` | #f0f0f0 | #303030 | 浅色边框 |
| `--admin-border-color-emphasis` | #91d5ff | #177ddc | 强调边框 |

### 图标色
| 变量名 | 浅色主题 | 深色主题 | 用途 |
|--------|----------|----------|------|
| `--admin-icon-bg` | #e6f7ff | rgba(24,144,255,0.15) | 图标背景 |
| `--admin-icon-color` | #1890ff | #1890ff | 图标颜色 |

## 可用的CSS Module类

### 布局类
- `.pageContainer` - 页面容器
- `.contentWrapper` - 内容包装器
- `.headerSection` - 头部区域
- `.tableSection` - 表格区域

### 头部类
- `.headerTop` - 头部顶部
- `.headerTitle` - 标题区域
- `.iconWrapper` - 图标包装器
- `.titleContent` - 标题内容
- `.titleText` - 标题文本
- `.titleDesc` - 描述文本
- `.headerActions` - 头部操作
- `.searchSection` - 搜索区域

### 表格类
- `.selectionBar` - 选择栏
- `.paginationWrapper` - 分页包装器
- `.assistantInfo` - 助理信息
- `.assistantContent` - 助理内容
- `.assistantTitle` - 助理标题
- `.assistantDesc` - 助理描述

### 模态框类
- `.modalContent` - 模态框内容
- `.detailSection` - 详情区块
- `.detailHeader` - 详情头部
- `.detailTitle` - 详情标题
- `.detailLabel` - 详情标签
- `.detailValue` - 详情值
- `.promptBox` - 提示词框

### 表单类
- `.formField` - 表单字段
- `.formRow` - 表单行
- `.formLabel` - 表单标签
- `.required` - 必填标记
- `.errorText` - 错误文本
- `.switchWrapper` - 开关包装器

## 主题切换

### 切换到深色主题
```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

### 切换到浅色主题
```javascript
document.documentElement.setAttribute('data-theme', 'light');
```

### 获取当前主题
```javascript
const theme = document.documentElement.getAttribute('data-theme') || 'light';
```

## 常见用法示例

### 示例1: 创建带主题的卡片
```tsx
import styles from '@/styles/AdminReviewPage.module.css';

function MyCard() {
  return (
    <div className={styles.cardContainer}>
      <h2 className={styles.titleText}>标题</h2>
      <p className={styles.titleDesc}>描述文本</p>
    </div>
  );
}
```

### 示例2: 使用CSS变量自定义样式
```tsx
function CustomComponent() {
  return (
    <div style={{
      background: 'var(--admin-card-bg)',
      color: 'var(--admin-text-primary)',
      border: '1px solid var(--admin-border-color)',
      padding: '16px',
      borderRadius: '8px'
    }}>
      自定义内容
    </div>
  );
}
```

### 示例3: 响应式布局
```tsx
import styles from '@/styles/AdminReviewPage.module.css';

function ResponsiveLayout() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* 自动适配移动端 */}
      </div>
    </div>
  );
}
```

## 最佳实践

### ✅ 推荐做法

1. **使用CSS变量**
   ```css
   .element {
     color: var(--admin-text-primary);
   }
   ```

2. **使用CSS Module**
   ```tsx
   <div className={styles.headerSection}>
   ```

3. **提供回退值**
   ```css
   .element {
     color: var(--admin-text-primary, rgba(0, 0, 0, 0.88));
   }
   ```

### ❌ 避免做法

1. **硬编码颜色**
   ```css
   /* 不要这样做 */
   .element {
     color: #666;
     background: #f0f5ff;
   }
   ```

2. **内联样式**
   ```tsx
   /* 不要这样做 */
   <div style={{ color: '#666', background: '#f0f5ff' }}>
   ```

3. **不使用CSS Module**
   ```tsx
   /* 不要这样做 */
   <div className="my-custom-class">
   ```

## 调试技巧

### 检查CSS变量值
```javascript
// 在浏览器控制台中
const root = document.documentElement;
const bgColor = getComputedStyle(root).getPropertyValue('--admin-page-bg');
console.log('页面背景色:', bgColor);
```

### 临时修改CSS变量
```javascript
// 在浏览器控制台中
document.documentElement.style.setProperty('--admin-page-bg', '#ff0000');
```

### 查看所有CSS变量
```javascript
// 在浏览器控制台中
const styles = getComputedStyle(document.documentElement);
const cssVars = Array.from(styles).filter(prop => prop.startsWith('--admin'));
console.log('所有admin变量:', cssVars);
```

## 常见问题

### Q: 为什么我的颜色没有变化?
A: 确保已经引入了`admin-review-theme.css`文件,并且使用了正确的CSS变量名。

### Q: 如何添加新的颜色变量?
A: 在`styles/admin-review-theme.css`中添加新变量,同时为浅色和深色主题都定义值。

### Q: CSS Module类名在生产环境中会变吗?
A: 是的,CSS Module会生成唯一的类名以避免冲突,但这是自动处理的。

### Q: 如何确保主题切换流畅?
A: 主题CSS文件中已经添加了过渡动画,确保不要覆盖这些过渡设置。

## 相关资源

- [完整文档](./ADMIN_REVIEW_COLOR_FIX_COMPLETE.md)
- [需求文档](../.kiro/specs/admin-review-color-fix/requirements.md)
- [设计文档](../.kiro/specs/admin-review-color-fix/design.md)
- [任务列表](../.kiro/specs/admin-review-color-fix/tasks.md)

## 支持

如有问题,请查看完整文档或联系开发团队。
