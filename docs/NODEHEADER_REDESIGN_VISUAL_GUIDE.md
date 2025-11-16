# NodeHeader重设计 - 视觉指南

## 黑白灰极简主题

### 设计理念
NodeHeader采用极简的黑白灰配色，打造专业、现代的视觉效果。唯一的彩色元素是错误指示器的红色，用于吸引注意力。

## 组件结构

```
┌─────────────────────────────────────────────────────────┐
│  [图标]  节点标题  [错误]    [徽章]  [设置]  [折叠]   │
│   24px    14px     18px      12px    16px    16px      │
│  黑/白    黑/白     红色     灰底黑字  灰色    灰色     │
└─────────────────────────────────────────────────────────┘
```

## 浅色主题配色

### 背景和边框
- **头部背景**: `#FAFAFA` - 极浅灰
- **节点背景**: `#FFFFFF` - 纯白
- **边框**: `#E5E5E5` - 浅灰
- **边框悬停**: `#CCCCCC` - 中灰
- **选中边框**: `#000000` - 纯黑
- **分隔线**: `#F0F0F0` - 极浅灰

### 文本颜色
- **主要文本**: `#1A1A1A` - 深黑
- **次要文本**: `#666666` - 中灰
- **第三级文本**: `#999999` - 浅灰

### 参数徽章
- **背景**: `#F8F8F8` - 极浅灰
- **边框**: `#E5E5E5` - 浅灰
- **文字**: `#1A1A1A` - 深黑

### 状态颜色
- **错误**: `#DC2626` - 红色（唯一彩色）
- **成功**: `#333333` - 深灰
- **警告**: `#666666` - 中灰
- **信息**: `#000000` - 黑色

## 深色主题配色

### 背景和边框
- **头部背景**: `#222222` - 深灰
- **节点背景**: `#1A1A1A` - 极深灰
- **边框**: `#333333` - 中深灰
- **边框悬停**: `#4D4D4D` - 中灰
- **选中边框**: `#FFFFFF` - 纯白
- **分隔线**: `#2A2A2A` - 深灰

### 文本颜色
- **主要文本**: `#E5E5E5` - 浅灰白
- **次要文本**: `#999999` - 中灰
- **第三级文本**: `#666666` - 深灰

### 参数徽章
- **背景**: `#242424` - 深灰
- **边框**: `#333333` - 中深灰
- **文字**: `#E5E5E5` - 浅灰白

### 状态颜色
- **错误**: `#EF4444` - 亮红色（唯一彩色）
- **成功**: `#CCCCCC` - 浅灰
- **警告**: `#999999` - 中灰
- **信息**: `#FFFFFF` - 白色

## 交互状态

### 图标悬停
```
正常状态:
[🔷] size: 24px, scale: 1, rotate: 0deg

悬停状态:
[🔷] size: 24px, scale: 1.1, rotate: 5deg
     ↑ 放大10% + 旋转5度
```

### 按钮悬停
```
正常状态:
[⚙️] background: transparent
    color: #666666 (浅色) / #999999 (深色)

悬停状态:
[⚙️] background: #F0F0F0 (浅色) / #2E2E2E (深色)
    color: #1A1A1A (浅色) / #E5E5E5 (深色)
    scale: 1.05
```

### 按钮点击
```
点击时:
[⚙️] scale: 0.95
    ↑ 缩小5%，产生按下效果
```

### 参数徽章动画
```
出现动画:
[3] scale: 0 → 1
    opacity: 0 → 1
    spring动画 (stiffness: 500, damping: 25)

消失动画:
[3] scale: 1 → 0
    opacity: 1 → 0
```

### 错误指示器
```
脉冲动画 (2秒循环):
[!] 0%:   opacity: 1,   scale: 1
    50%:  opacity: 0.7, scale: 1.1
    100%: opacity: 1,   scale: 1
```

## 布局规范

### 间距
- **头部内边距**: `12px 16px`
- **元素间距**: `12px` (图标和标题)
- **按钮间距**: `6px`
- **徽章内边距**: `4px 10px`

### 尺寸
- **图标**: `24px × 24px`
- **按钮**: `32px × 32px`
- **错误图标**: `18px × 18px`
- **按钮图标**: `16px × 16px`
- **徽章最小宽度**: `28px`

### 圆角
- **头部**: `8px 8px 0 0` (展开) / `8px` (折叠)
- **按钮**: `6px`
- **徽章**: `12px`

## 动画时序

### 过渡动画
- **背景色变化**: `200ms ease`
- **颜色变化**: `200ms ease`
- **图标悬停**: `200ms easeOut`
- **按钮缩放**: `150ms ease`

### 折叠动画
- **旋转动画**: `250ms cubic-bezier(0.4, 0, 0.2, 1)`
- **圆角变化**: `300ms cubic-bezier(0.4, 0, 0.2, 1)`

### Spring动画
- **徽章出现**: `stiffness: 500, damping: 25`
- **错误图标**: `stiffness: 400, damping: 20`

## 阴影系统

### 浅色主题
```css
基础阴影:
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.05);

悬停阴影:
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.08);

选中阴影:
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16),
            0 4px 12px rgba(0, 0, 0, 0.1);
```

### 深色主题
```css
基础阴影:
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.2);

悬停阴影:
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4),
            0 4px 12px rgba(0, 0, 0, 0.3);

选中阴影:
box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5),
            0 6px 16px rgba(0, 0, 0, 0.4);
```

## 使用示例

### 基础用法
```tsx
<NodeHeader
  icon={Plane}
  label="起飞"
  color="#64FFDA"  // 不再使用，保留兼容性
  isCollapsed={false}
  onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
  onOpenAdvanced={() => setShowModal(true)}
  parameterCount={3}
  hasErrors={false}
/>
```

### 折叠状态
```tsx
<NodeHeader
  icon={Camera}
  label="拍照"
  color="#FF6B9D"
  isCollapsed={true}  // 折叠状态
  onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
  onOpenAdvanced={() => setShowModal(true)}
  parameterCount={5}  // 显示徽章
  hasErrors={false}
/>
```

### 错误状态
```tsx
<NodeHeader
  icon={Navigation}
  label="导航"
  color="#FFA726"
  isCollapsed={false}
  onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
  onOpenAdvanced={() => setShowModal(true)}
  parameterCount={2}
  hasErrors={true}  // 显示错误指示器
/>
```

## 可访问性

### 键盘导航
- Tab键可以聚焦到按钮
- Enter/Space键可以激活按钮
- 所有交互元素都可键盘访问

### 屏幕阅读器
- 按钮有 `title` 属性提供描述
- 错误图标有 `title="有未配置的必填参数"`
- 语义化的HTML结构

### 颜色对比度
- 浅色主题: 黑色文字 (#1A1A1A) on 白色背景 (#FFFFFF) = 16.1:1 ✅
- 深色主题: 浅灰文字 (#E5E5E5) on 深灰背景 (#1A1A1A) = 11.6:1 ✅
- 错误颜色: 红色 (#DC2626) on 白色背景 = 5.9:1 ✅

## 性能优化

### 渲染优化
- 使用 `React.memo` 避免不必要的重渲染
- 使用 CSS `transform` 和 `opacity` 实现动画
- 避免在动画中使用 `width`、`height` 等触发重排的属性

### 动画优化
- 使用 `will-change` 提示浏览器优化
- 使用硬件加速的CSS属性
- 合理的动画时长（150-300ms）

## 浏览器兼容性
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---
**设计系统**: 黑白灰极简主题  
**更新日期**: 2025年10月22日  
**版本**: 1.0.0
