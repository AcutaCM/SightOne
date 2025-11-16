# Workflow组件可访问性 - 快速参考

## 键盘快捷键

| 按键 | 功能 | 组件 |
|------|------|------|
| `Tab` | 下一个元素 | 全局 |
| `Shift+Tab` | 上一个元素 | 全局 |
| `Enter` | 激活/编辑 | 按钮、参数 |
| `Space` | 激活/切换 | 按钮、节点 |
| `Escape` | 取消编辑 | 参数编辑器 |
| `Delete` | 删除节点 | 节点 |

## ARIA属性速查

### 常用Role
```tsx
role="banner"      // 节点头部
role="article"     // 节点容器
role="list"        // 参数列表
role="listitem"    // 参数项
role="group"       // 参数组/参数项
role="heading"     // 标题
role="button"      // 按钮
role="alert"       // 错误消息
role="status"      // 状态信息
```

### 常用ARIA属性
```tsx
aria-label="描述"              // 可访问名称
aria-describedby="id"          // 关联描述
aria-expanded={boolean}        // 展开状态
aria-invalid={boolean}         // 错误状态
aria-live="polite"            // 实时更新
aria-level={number}           // 标题级别
tabIndex={0}                  // 可聚焦
```

## 颜色对比度

### 浅色主题
```css
--text-primary: #1A1A1A;    /* 16.1:1 AAA */
--text-secondary: #666666;  /* 5.74:1 AA */
--text-tertiary: #757575;   /* 4.54:1 AA */
--error-color: #DC2626;     /* 5.9:1 AA */
```

### 深色主题
```css
--text-primary: #E5E5E5;    /* 13.5:1 AAA */
--text-secondary: #999999;  /* 5.2:1 AA */
--text-tertiary: #8A8A8A;   /* 4.52:1 AA */
--error-color: #EF4444;     /* 5.5:1 AA */
```

## 代码模板

### 可访问按钮
```tsx
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  aria-label="按钮描述"
  tabIndex={0}
  onFocus={(e) => {
    e.currentTarget.style.boxShadow = '0 0 0 2px var(--focus-color)';
  }}
  onBlur={(e) => {
    e.currentTarget.style.boxShadow = 'none';
  }}
>
  <Icon aria-hidden="true" />
</button>
```

### 可访问输入框
```tsx
<div
  role="group"
  aria-label="参数名称"
  aria-invalid={!!error}
  aria-describedby={error ? 'error-id' : 'desc-id'}
  tabIndex={0}
>
  <label>{label}</label>
  <input
    value={value}
    onChange={handleChange}
    onBlur={handleBlur}
  />
  {error && (
    <div id="error-id" role="alert" aria-live="polite">
      {error}
    </div>
  )}
  <span id="desc-id" style={{ display: 'none' }}>
    {description}
  </span>
</div>
```

### 可访问列表
```tsx
<div role="list" aria-label="列表名称">
  {items.map((item, index) => (
    <div key={index} role="listitem">
      {item}
    </div>
  ))}
</div>
```

## 测试命令

```bash
# 运行可访问性测试
npm test -- accessibility.test.tsx

# 运行所有测试
npm test

# Lighthouse审计
npm run build
npx lighthouse http://localhost:3000 --view
```

## 检查清单

### 开发时
- [ ] 所有交互元素可用Tab键访问
- [ ] 焦点指示器清晰可见
- [ ] 提供aria-label或可见文本
- [ ] 错误使用role="alert"
- [ ] 状态使用role="status"

### 发布前
- [ ] 键盘导航测试通过
- [ ] 屏幕阅读器测试通过
- [ ] 颜色对比度符合AA标准
- [ ] Lighthouse可访问性评分 ≥ 90
- [ ] 自动化测试通过

## 常见问题

### Q: 如何添加焦点指示器？
```tsx
onFocus={(e) => {
  e.currentTarget.style.boxShadow = '0 0 0 2px var(--focus-color)';
}}
onBlur={(e) => {
  e.currentTarget.style.boxShadow = 'none';
}}
```

### Q: 如何公告状态变化？
```tsx
<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

### Q: 如何隐藏装饰性图标？
```tsx
<Icon aria-hidden="true" />
```

### Q: 如何关联描述文本？
```tsx
<div aria-describedby="desc-id">
  <span id="desc-id" style={{ display: 'none' }}>
    描述文本
  </span>
</div>
```

## 工具推荐

- **对比度检查**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **屏幕阅读器**: NVDA (Windows), VoiceOver (macOS)
- **自动化测试**: axe-core, jest-axe
- **浏览器工具**: Chrome DevTools Lighthouse

## 更多资源

- [完整指南](./WORKFLOW_ACCESSIBILITY_GUIDE.md)
- [实现总结](./TASK_8_ACCESSIBILITY_COMPLETE.md)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
