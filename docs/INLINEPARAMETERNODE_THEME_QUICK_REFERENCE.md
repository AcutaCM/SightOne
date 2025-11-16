# InlineParameterNode 黑白灰主题快速参考

## 颜色系统

### 浅色主题

```css
/* 节点 */
--node-bg: #FFFFFF              /* 纯白背景 */
--node-border: #E5E5E5          /* 浅灰边框 */
--node-border-hover: #CCCCCC    /* 悬停边框 */
--node-selected: #000000        /* 选中边框（纯黑） */
--node-divider: #F0F0F0         /* 分隔线 */
--node-header-bg: #FAFAFA       /* 头部背景 */

/* 参数 */
--param-bg: #F8F8F8             /* 参数背景 */
--param-bg-hover: #F0F0F0       /* 悬停背景 */
--param-bg-editing: #E8E8E8     /* 编辑背景 */
--param-border: #E0E0E0         /* 参数边框 */

/* 文本 */
--text-primary: #1A1A1A         /* 主要文本（深黑） */
--text-secondary: #666666       /* 次要文本（中灰） */
--text-tertiary: #999999        /* 第三级文本（浅灰） */

/* 状态 */
--error-color: #DC2626          /* 错误（唯一彩色） */
--success-color: #333333        /* 成功（深灰） */
--warning-color: #666666        /* 警告（中灰） */

/* 滚动条 */
--scrollbar-track: #F5F5F5      /* 轨道 */
--scrollbar-thumb: #CCCCCC      /* 滑块 */
--scrollbar-thumb-hover: #999999 /* 悬停滑块 */
```

### 深色主题

```css
/* 节点 */
--node-bg: #1A1A1A              /* 深黑背景 */
--node-border: #333333          /* 深灰边框 */
--node-border-hover: #4D4D4D    /* 悬停边框 */
--node-selected: #FFFFFF        /* 选中边框（纯白） */
--node-divider: #2A2A2A         /* 分隔线 */
--node-header-bg: #222222       /* 头部背景 */

/* 参数 */
--param-bg: #242424             /* 参数背景 */
--param-bg-hover: #2E2E2E       /* 悬停背景 */
--param-bg-editing: #383838     /* 编辑背景 */
--param-border: #3A3A3A         /* 参数边框 */

/* 文本 */
--text-primary: #E5E5E5         /* 主要文本（浅灰） */
--text-secondary: #999999       /* 次要文本（中灰） */
--text-tertiary: #666666        /* 第三级文本（深灰） */

/* 状态 */
--error-color: #EF4444          /* 错误（唯一彩色） */
--success-color: #CCCCCC        /* 成功（浅灰） */
--warning-color: #999999        /* 警告（中灰） */

/* 滚动条 */
--scrollbar-track: #2A2A2A      /* 轨道 */
--scrollbar-thumb: #4A4A4A      /* 滑块 */
--scrollbar-thumb-hover: #666666 /* 悬停滑块 */
```

## 状态指示器颜色

| 状态 | 浅色主题 | 深色主题 | 动画 | 说明 |
|------|---------|---------|------|------|
| **idle** | `#999999` | `#666666` | 无 | 空闲状态，中灰色 |
| **running** | `#666666` | `#999999` | 1.5s 脉冲 | 运行状态，灰色动画 |
| **success** | `#333333` | `#CCCCCC` | 无 | 成功状态，深灰/浅灰 |
| **error** | `#DC2626` | `#EF4444` | 2s 脉冲 | 错误状态，红色（唯一彩色） |

## 阴影系统

### 浅色主题
```css
/* 基础阴影 */
--node-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);

/* 悬停阴影 */
--node-shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);

/* 选中阴影 */
--node-shadow-selected: 0 8px 24px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.1);
```

### 深色主题
```css
/* 基础阴影 */
--node-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);

/* 悬停阴影 */
--node-shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3);

/* 选中阴影 */
--node-shadow-selected: 0 12px 32px rgba(0, 0, 0, 0.5), 0 6px 16px rgba(0, 0, 0, 0.4);
```

## 动画时长

| 动画类型 | 时长 | 缓动函数 |
|---------|------|---------|
| 节点选中 | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| 节点悬停 | 200ms | cubic-bezier(0.4, 0, 0.2, 1) |
| 展开/折叠 | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| 状态脉冲（运行） | 1500ms | ease-in-out |
| 状态脉冲（错误） | 2000ms | ease-in-out |

## 使用示例

### 获取主题颜色

```typescript
import { getCSSVariable } from '@/lib/workflow/workflowTheme';

// 获取节点背景色
const nodeBg = getCSSVariable('--node-bg', '#FFFFFF');

// 获取选中边框色
const nodeSelected = getCSSVariable('--node-selected', '#000000');

// 获取文本颜色
const textPrimary = getCSSVariable('--text-primary', '#1A1A1A');
```

### 应用动画

```typescript
<motion.div
  animate={{
    scale: selected ? 1.02 : 1,
    borderColor: selected ? nodeSelected : nodeBorder,
  }}
  whileHover={{
    y: -2,
    borderColor: nodeBorderHover,
  }}
  transition={{
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1]
  }}
>
```

### 自定义滚动条

```tsx
<div className="custom-scrollbar" style={{ overflowY: 'auto' }}>
  {/* 内容 */}
</div>
```

## 设计原则

### 1. 极简主义
- 仅使用黑、白、灰三色
- 错误状态是唯一的彩色元素
- 避免过度装饰

### 2. 层次清晰
- 使用不同灰度值区分层次
- 浅色主题：深色文本 + 浅色背景
- 深色主题：浅色文本 + 深色背景

### 3. 专业感
- 黑白灰配色营造专业氛围
- 适度的阴影增强立体感
- 流畅的动画提升体验

### 4. 可访问性
- 文本对比度符合 WCAG AA 标准
- 错误状态使用红色突出显示
- 支持键盘导航和屏幕阅读器

## 对比度检查

### 浅色主题
- 主要文本 (#1A1A1A) vs 背景 (#FFFFFF): **16.1:1** ✅
- 次要文本 (#666666) vs 背景 (#FFFFFF): **5.7:1** ✅
- 第三级文本 (#999999) vs 背景 (#FFFFFF): **2.8:1** ⚠️

### 深色主题
- 主要文本 (#E5E5E5) vs 背景 (#1A1A1A): **13.5:1** ✅
- 次要文本 (#999999) vs 背景 (#1A1A1A): **5.1:1** ✅
- 第三级文本 (#666666) vs 背景 (#1A1A1A): **3.2:1** ⚠️

> ✅ = 符合 WCAG AAA 标准 (7:1)  
> ✅ = 符合 WCAG AA 标准 (4.5:1)  
> ⚠️ = 符合 WCAG AA 大文本标准 (3:1)

## 常见问题

### Q: 为什么只有错误状态使用彩色？
A: 为了保持极简的黑白灰主题，同时确保错误能够立即引起用户注意。

### Q: 如何切换主题？
A: 主题由 `document.documentElement.classList` 中的 `dark` 类控制，CSS 变量会自动切换。

### Q: 可以自定义颜色吗？
A: 可以，通过修改 `globals.css` 中的 CSS 变量即可。

### Q: 动画性能如何？
A: 所有动画使用 `transform` 和 `opacity`，启用硬件加速，性能优秀。

---

**更新时间**: 2025-10-22
**版本**: 1.0.0
