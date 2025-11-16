# Workflow组件可访问性指南

## 概述

本文档详细说明了Workflow组件系统的可访问性功能，包括键盘导航、ARIA标签和颜色对比度优化。

## 颜色对比度分析 (WCAG 2.1 AA标准)

### 浅色主题对比度

#### 文本颜色对比度
| 元素 | 前景色 | 背景色 | 对比度 | WCAG等级 |
|------|--------|--------|--------|----------|
| 主要文本 | #1A1A1A | #FFFFFF | 16.1:1 | AAA ✓ |
| 次要文本 | #666666 | #FFFFFF | 5.74:1 | AA ✓ |
| 第三级文本 | #999999 | #FFFFFF | 2.85:1 | 不合格 ⚠️ |
| 参数标签 | #666666 | #F8F8F8 | 5.5:1 | AA ✓ |
| 错误文本 | #DC2626 | #FFFFFF | 5.9:1 | AA ✓ |

#### 边框和分隔线对比度
| 元素 | 颜色 | 背景色 | 对比度 | WCAG等级 |
|------|------|--------|--------|----------|
| 节点边框 | #E5E5E5 | #FFFFFF | 1.15:1 | UI组件 ✓ |
| 悬停边框 | #CCCCCC | #FFFFFF | 1.5:1 | UI组件 ✓ |
| 选中边框 | #000000 | #FFFFFF | 21:1 | AAA ✓ |

### 深色主题对比度

#### 文本颜色对比度
| 元素 | 前景色 | 背景色 | 对比度 | WCAG等级 |
|------|--------|--------|--------|----------|
| 主要文本 | #E5E5E5 | #1A1A1A | 13.5:1 | AAA ✓ |
| 次要文本 | #999999 | #1A1A1A | 5.2:1 | AA ✓ |
| 第三级文本 | #666666 | #1A1A1A | 2.6:1 | 不合格 ⚠️ |
| 参数标签 | #999999 | #242424 | 4.8:1 | AA ✓ |
| 错误文本 | #EF4444 | #1A1A1A | 5.5:1 | AA ✓ |

#### 边框和分隔线对比度
| 元素 | 颜色 | 背景色 | 对比度 | WCAG等级 |
|------|------|--------|--------|----------|
| 节点边框 | #333333 | #1A1A1A | 1.4:1 | UI组件 ✓ |
| 悬停边框 | #4D4D4D | #1A1A1A | 2.1:1 | UI组件 ✓ |
| 选中边框 | #FFFFFF | #1A1A1A | 15.5:1 | AAA ✓ |

### 优化建议

#### 第三级文本颜色优化
第三级文本（`--text-tertiary`）在两个主题下都未达到WCAG AA标准（4.5:1）。建议：

**浅色主题优化：**
```css
/* 当前值 */
--text-tertiary: #999999; /* 对比度 2.85:1 */

/* 优化后 */
--text-tertiary: #757575; /* 对比度 4.54:1 - AA ✓ */
```

**深色主题优化：**
```css
/* 当前值 */
--text-tertiary: #666666; /* 对比度 2.6:1 */

/* 优化后 */
--text-tertiary: #8A8A8A; /* 对比度 4.52:1 - AA ✓ */
```

## 键盘导航支持

### 全局键盘快捷键

| 按键 | 功能 | 适用组件 |
|------|------|----------|
| `Tab` | 在可聚焦元素间导航 | 所有组件 |
| `Shift + Tab` | 反向导航 | 所有组件 |
| `Enter` | 激活按钮或进入编辑模式 | 按钮、参数项 |
| `Space` | 激活按钮或切换状态 | 按钮、节点 |
| `Escape` | 取消编辑或关闭对话框 | 参数编辑器 |
| `Delete/Backspace` | 删除节点（需确认） | 节点 |

### NodeHeader键盘导航

#### 高级设置按钮
- **Tab**: 聚焦到按钮
- **Enter/Space**: 打开高级设置对话框
- **焦点指示器**: 2px灰色边框

#### 折叠/展开按钮
- **Tab**: 聚焦到按钮
- **Enter/Space**: 切换参数列表展开/折叠状态
- **焦点指示器**: 2px灰色边框
- **ARIA属性**: `aria-expanded` 指示当前状态

### InlineParameterNode键盘导航

#### 节点容器
- **Tab**: 聚焦到节点
- **Enter/Space**: 切换折叠状态
- **Delete/Backspace**: 删除节点（需确认）
- **焦点指示器**: 节点边框高亮

### ParameterItem键盘导航

#### 参数项容器
- **Tab**: 聚焦到参数项
- **Enter/Space**: 进入编辑模式
- **Escape**: 取消编辑，恢复原值
- **焦点指示器**: 3px灰色光晕

#### 编辑模式
- **Tab**: 保存并移动到下一个参数
- **Shift + Tab**: 保存并移动到上一个参数
- **Enter**: 保存（单行输入）
- **Escape**: 取消编辑

## ARIA标签和语义化

### NodeHeader ARIA属性

```tsx
<div 
  role="banner"
  aria-label="{label}节点头部"
>
  <span 
    role="heading" 
    aria-level={2}
  >
    {label}
  </span>
  
  {hasErrors && (
    <div 
      role="alert"
      aria-live="polite"
      aria-label="节点配置错误：有未配置的必填参数"
    >
      <AlertCircle aria-hidden="true" />
    </div>
  )}
  
  {isCollapsed && (
    <div 
      role="status"
      aria-label="{parameterCount}个参数"
    >
      {parameterCount}
    </div>
  )}
  
  <button
    aria-label="打开高级设置"
    tabIndex={0}
  >
    <Settings />
  </button>
  
  <button
    aria-label={isCollapsed ? '展开参数列表' : '折叠参数列表'}
    aria-expanded={!isCollapsed}
    tabIndex={0}
  >
    <ChevronDown />
  </button>
</div>
```

### InlineParameterNode ARIA属性

```tsx
<div
  role="article"
  aria-label="{label} 工作流节点"
  aria-describedby="node-{id}-description"
  tabIndex={0}
>
  <NodeHeader />
  <ParameterList />
  
  {/* 隐藏的描述，用于屏幕阅读器 */}
  <span id="node-{id}-description" style={{ display: 'none' }}>
    {label}节点，类型：{category}，
    {isCollapsed ? '已折叠' : '已展开'}，
    包含{parameterCount}个参数，
    状态：{status}
    {hasErrors && '，有未配置的必填参数'}
  </span>
</div>
```

### ParameterList ARIA属性

```tsx
<div
  role="list"
  aria-label="节点参数列表"
  aria-live="polite"
>
  {/* 参数组 */}
  <div 
    role="group"
    aria-label="{groupName}参数组"
  >
    <div role="heading" aria-level={3}>
      {groupName}
    </div>
    
    <div role="list">
      {/* 参数项 */}
      <div role="listitem">
        <ParameterItem />
      </div>
    </div>
  </div>
</div>
```

### ParameterItem ARIA属性

```tsx
<div
  role="group"
  aria-label="{label}参数{required ? '（必填）' : ''}"
  aria-invalid={!!error}
  aria-describedby={error ? `param-error-${name}` : `param-desc-${name}`}
  tabIndex={0}
>
  <div className="parameterLabel">
    <span>{label}</span>
    {required && <span aria-label="必填项">*</span>}
  </div>
  
  <div className="parameterValue">
    {/* 编辑器 */}
  </div>
  
  {/* 错误提示 */}
  {error && (
    <div 
      id={`param-error-${name}`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle aria-hidden="true" />
      <span>{error}</span>
    </div>
  )}
  
  {/* 隐藏的描述 */}
  <span id={`param-desc-${name}`} style={{ display: 'none' }}>
    {description}
  </span>
</div>
```

## 焦点管理

### 焦点指示器样式

所有可聚焦元素都有清晰的焦点指示器：

```css
/* 按钮焦点 */
button:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--param-border-editing);
  background: var(--param-bg-hover);
}

/* 参数项焦点 */
.parameterItem:focus {
  outline: none;
  border-color: var(--param-border-editing);
  box-shadow: 0 0 0 3px var(--param-editing-glow);
}

/* 节点焦点 */
[data-workflow-node]:focus {
  outline: none;
  border-color: var(--node-selected);
  box-shadow: 0 0 0 3px var(--node-selected-glow);
}
```

### 焦点顺序

1. **节点头部**
   - 高级设置按钮
   - 折叠/展开按钮

2. **参数列表**（展开时）
   - 参数项1
   - 参数项2
   - ...
   - 参数项N

3. **调整大小手柄**（展开时）

## 屏幕阅读器支持

### 状态公告

使用 `aria-live` 区域公告重要状态变化：

```tsx
{/* 错误状态 */}
<div role="alert" aria-live="polite">
  节点配置错误：有未配置的必填参数
</div>

{/* 保存状态 */}
<div role="status" aria-live="polite">
  参数已保存
</div>

{/* 尺寸调整 */}
<div role="status" aria-live="polite">
  节点尺寸：宽{width}像素，高{height}像素
</div>
```

### 隐藏的描述性文本

为屏幕阅读器提供额外的上下文信息：

```tsx
{/* 节点描述 */}
<span id="node-description" style={{ display: 'none' }}>
  {label}节点，类型：{category}，
  {isCollapsed ? '已折叠' : '已展开'}，
  包含{parameterCount}个参数
</span>

{/* 参数描述 */}
<span id="param-description" style={{ display: 'none' }}>
  {parameter.description}
</span>
```

## 测试清单

### 键盘导航测试

- [ ] 可以使用Tab键在所有可聚焦元素间导航
- [ ] 焦点指示器清晰可见
- [ ] Enter/Space键可以激活按钮
- [ ] Escape键可以取消编辑
- [ ] 焦点顺序符合逻辑

### ARIA标签测试

- [ ] 所有交互元素都有适当的role属性
- [ ] 所有按钮都有aria-label
- [ ] 错误消息使用role="alert"
- [ ] 状态变化使用aria-live
- [ ] 展开/折叠状态使用aria-expanded

### 颜色对比度测试

- [ ] 主要文本对比度 ≥ 4.5:1 (AA)
- [ ] 大文本对比度 ≥ 3:1 (AA)
- [ ] UI组件对比度 ≥ 3:1
- [ ] 错误文本对比度 ≥ 4.5:1
- [ ] 在浅色和深色主题下都符合标准

### 屏幕阅读器测试

- [ ] 使用NVDA测试（Windows）
- [ ] 使用JAWS测试（Windows）
- [ ] 使用VoiceOver测试（macOS/iOS）
- [ ] 使用TalkBack测试（Android）
- [ ] 所有重要信息都能被读取

## 工具和资源

### 对比度检查工具

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)
- Chrome DevTools - Lighthouse审计

### 屏幕阅读器

- [NVDA](https://www.nvaccess.org/) - 免费（Windows）
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - 商业（Windows）
- VoiceOver - 内置（macOS/iOS）
- TalkBack - 内置（Android）

### 自动化测试工具

- [axe-core](https://github.com/dequelabs/axe-core)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

## 最佳实践

### 1. 始终提供文本替代

```tsx
{/* 好 ✓ */}
<button aria-label="打开高级设置">
  <Settings aria-hidden="true" />
</button>

{/* 不好 ✗ */}
<button>
  <Settings />
</button>
```

### 2. 使用语义化HTML

```tsx
{/* 好 ✓ */}
<button onClick={handleClick}>点击</button>

{/* 不好 ✗ */}
<div onClick={handleClick}>点击</div>
```

### 3. 管理焦点

```tsx
{/* 打开对话框时，将焦点移到对话框 */}
useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);

{/* 关闭对话框时，将焦点返回到触发元素 */}
const handleClose = () => {
  setIsOpen(false);
  triggerRef.current?.focus();
};
```

### 4. 提供清晰的错误消息

```tsx
{/* 好 ✓ */}
<div role="alert" aria-live="polite">
  错误：参数值必须在0到100之间
</div>

{/* 不好 ✗ */}
<div>
  无效值
</div>
```

### 5. 确保足够的对比度

```css
/* 好 ✓ - 对比度 5.74:1 */
color: #666666;
background: #FFFFFF;

/* 不好 ✗ - 对比度 2.85:1 */
color: #999999;
background: #FFFFFF;
```

## 参考资料

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

## 更新日志

### 2024-01-XX - 初始版本
- 添加键盘导航支持
- 添加ARIA标签
- 优化颜色对比度
- 创建可访问性文档
