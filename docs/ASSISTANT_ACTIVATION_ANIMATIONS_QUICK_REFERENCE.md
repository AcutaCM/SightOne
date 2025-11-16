# 助手激活动画 - 快速参考

## 🎨 可用的 CSS 类

### 高亮动画
```tsx
// 新添加的助手 - 自动播放 3 次脉冲动画
<div className={styles.highlighted}>
  {/* 助手卡片 */}
</div>
```

### 按钮样式
```tsx
// 基础激活按钮
<button className={styles['activation-button']}>
  使用该助手进行聊天
</button>

// 已添加状态
<button className={`${styles['activation-button']} ${styles['activation-button-added']}`}>
  已添加
</button>

// 加载状态
<button className={`${styles['activation-button']} ${styles['activation-button-loading']}`}>
  添加中...
</button>

// 成功状态 (带弹跳动画)
<button className={`${styles['activation-button']} ${styles['activation-button-success']}`}>
  成功！
</button>

// 错误状态 (带抖动动画)
<button className={`${styles['activation-button']} ${styles['activation-button-error']}`}>
  失败
</button>
```

### 助手卡片
```tsx
// 基础卡片 (带悬停效果)
<div className={styles['user-assistant-card']}>
  {/* 内容 */}
</div>

// 新卡片 (带淡入滑动动画)
<div className={`${styles['user-assistant-card']} ${styles['user-assistant-card-new']}`}>
  {/* 内容 */}
</div>
```

### 过渡动画
```tsx
// 淡入淡出
<div className={styles['fade-enter']}>
  {/* 进入时淡入 */}
</div>

// 滑动进入
<div className={styles['slide-enter']}>
  {/* 从上方滑入 */}
</div>
```

## 🎬 动画效果预览

### 1. 高亮脉冲 (Highlight Pulse)
- **时长**: 1秒 × 3次
- **效果**: 背景色脉冲 + 外发光 + 轻微缩放
- **用途**: 标识新添加的助手

### 2. 涟漪效果 (Ripple Effect)
- **时长**: 0.6秒
- **效果**: 从点击位置扩散的圆形波纹
- **用途**: 按钮点击反馈

### 3. 悬停提升 (Hover Elevation)
- **时长**: 0.2秒
- **效果**: 向上移动 2px + 阴影增强
- **用途**: 按钮和卡片悬停状态

### 4. 淡入滑动 (Fade In Slide)
- **时长**: 0.4秒
- **效果**: 从上方滑入 + 淡入 + 轻微缩放
- **用途**: 新助手出现

### 5. 成功弹跳 (Success Bounce)
- **时长**: 0.3秒
- **效果**: 快速放大缩小
- **用途**: 操作成功反馈

### 6. 错误抖动 (Error Shake)
- **时长**: 0.3秒
- **效果**: 左右抖动
- **用途**: 操作失败反馈

## 📱 响应式断点

```css
/* 移动端 (< 768px) */
@media (max-width: 768px) {
  /* 按钮字体更小 */
  /* 卡片内边距减小 */
}
```

## 🌙 暗色模式

暗色模式下自动应用：
- 更强的发光效果
- 调整的透明度值
- 优化的阴影

## ♿ 无障碍功能

### 减少动画
```css
@media (prefers-reduced-motion: reduce) {
  /* 所有动画自动禁用 */
}
```

### 焦点指示器
- Tab 键导航时显示清晰的焦点框
- 符合 WCAG 2.1 标准

### 高对比度模式
```css
@media (prefers-contrast: high) {
  /* 增强边框和对比度 */
}
```

## ⚡ 性能优化

所有动画都使用：
- ✅ GPU 加速 (`transform: translateZ(0)`)
- ✅ `will-change` 属性
- ✅ 只动画 `transform` 和 `opacity`
- ✅ 避免触发布局重排

## 🎯 使用场景

### 场景 1: 添加新助手
```tsx
const [isNew, setIsNew] = useState(true);

useEffect(() => {
  if (isNew) {
    // 3秒后移除高亮
    const timer = setTimeout(() => setIsNew(false), 3000);
    return () => clearTimeout(timer);
  }
}, [isNew]);

return (
  <div className={isNew ? styles.highlighted : ''}>
    {/* 助手卡片 */}
  </div>
);
```

### 场景 2: 激活按钮状态
```tsx
const [status, setStatus] = useState<'idle' | 'loading' | 'added'>('idle');

const buttonClass = `
  ${styles['activation-button']}
  ${status === 'added' ? styles['activation-button-added'] : ''}
  ${status === 'loading' ? styles['activation-button-loading'] : ''}
`;

return <button className={buttonClass}>...</button>;
```

### 场景 3: 列表项动画
```tsx
const assistants = [...]; // 助手列表

return (
  <div>
    {assistants.map((assistant, index) => (
      <div 
        key={assistant.id}
        className={`
          ${styles['user-assistant-card']}
          ${index === 0 ? styles['user-assistant-card-new'] : ''}
        `}
      >
        {/* 助手内容 */}
      </div>
    ))}
  </div>
);
```

## 🔧 自定义动画

如需自定义动画参数，可以覆盖 CSS 变量：

```tsx
<div 
  className={styles.highlighted}
  style={{
    '--animation-duration': '1.5s',
    '--animation-count': '5'
  } as React.CSSProperties}
>
  {/* 内容 */}
</div>
```

## 📊 动画时长参考表

| 动画 | 时长 | 缓动 | 用途 |
|-----|------|------|------|
| 高亮脉冲 | 1s × 3 | ease-in-out | 新助手标识 |
| 涟漪效果 | 0.6s | ease-out | 点击反馈 |
| 悬停提升 | 0.2s | cubic-bezier | 交互反馈 |
| 淡入滑动 | 0.4s | cubic-bezier | 列表项出现 |
| 成功弹跳 | 0.3s | ease-out | 成功反馈 |
| 错误抖动 | 0.3s | ease-out | 错误反馈 |

## 🐛 常见问题

### Q: 动画不流畅？
A: 检查是否有大量 DOM 元素，考虑使用虚拟滚动。

### Q: 动画在移动端卡顿？
A: 确保使用了 GPU 加速，检查 `transform: translateZ(0)` 是否生效。

### Q: 暗色模式下动画不明显？
A: 暗色模式有独立的动画定义，检查 `.dark` 选择器。

### Q: 如何禁用特定动画？
A: 使用内联样式覆盖：`style={{ animation: 'none' }}`

## 📚 相关文档

- [完整实现报告](./TASK_7_STYLES_AND_ANIMATIONS_COMPLETE.md)
- [设计文档](../.kiro/specs/assistant-activation-from-market/design.md)
- [需求文档](../.kiro/specs/assistant-activation-from-market/requirements.md)

## 🎓 最佳实践

1. **性能优先**: 只在必要时使用动画
2. **用户体验**: 动画应该增强而非干扰用户操作
3. **无障碍**: 始终支持 `prefers-reduced-motion`
4. **一致性**: 在整个应用中保持动画风格一致
5. **测试**: 在不同设备和浏览器上测试动画效果

---

**最后更新**: 2024
**维护者**: Kiro AI Assistant
