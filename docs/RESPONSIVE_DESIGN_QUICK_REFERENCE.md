# 响应式设计快速参考

## 响应式断点

```css
/* 移动端 */
@media (max-width: 767px) { }

/* 平板端 */
@media (min-width: 768px) and (max-width: 1024px) { }

/* 桌面端 - 小屏 */
@media (min-width: 1025px) and (max-width: 1279px) { }

/* 桌面端 - 大屏 */
@media (min-width: 1280px) { }
```

## 网格布局

```tsx
// 移动端：1列
// 平板端：2列
// 桌面端：3-4列

<AssistantsGrid>
  {assistants.map(assistant => (
    <AssistantCard key={assistant.id} assistant={assistant} />
  ))}
</AssistantsGrid>
```

## 触摸手势

### 基础点击

```tsx
const touchGestures = useTouchGestures({
  enableTapFeedback: true,
  onTap: handleTap,
});

<div {...touchGestures.handlers}>Tap me</div>
```

### 长按

```tsx
const longPress = useTouchGestures({
  enableLongPress: true,
  longPressDuration: 500,
  onLongPress: handleLongPress,
});
```

### 滑动

```tsx
const swipe = useTouchGestures({
  enableSwipe: true,
  swipeThreshold: 50,
  onSwipe: (direction) => handleSwipe(direction),
});
```

## 触摸目标

```tsx
// 最小 44x44px
const touchTarget = useTouchTargetSize(44);

<button style={touchTarget.style} className={touchTarget.className}>
  Click
</button>
```

## 触觉反馈

```tsx
// 短震动
if ('vibrate' in navigator) {
  navigator.vibrate(10);
}

// 长震动
if ('vibrate' in navigator) {
  navigator.vibrate(20);
}

// 模式震动
if ('vibrate' in navigator) {
  navigator.vibrate([100, 50, 100]);
}
```

## 设备检测

```tsx
const isTouchDevice = useIsTouchDevice();

{isTouchDevice ? (
  <TouchOptimizedButton />
) : (
  <MouseOptimizedButton />
)}
```

## 样式类

### 触摸反馈

```tsx
import touchStyles from '@/styles/TouchFeedback.module.css';

<div className={touchStyles.touchCard}>Card</div>
<button className={touchStyles.touchButton}>Button</button>
<span className={touchStyles.touchIcon}>Icon</span>
```

### 响应式

```tsx
import styles from '@/styles/AssistantCardResponsive.module.css';

<div className={styles.assistantCard}>
  <div className={styles.cardBody}>
    <div className={styles.cardHeader}>
      <div className={styles.emojiIcon}>🎨</div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>Title</h3>
        <p className={styles.cardDescription}>Description</p>
      </div>
    </div>
  </div>
</div>
```

## 常用模式

### 响应式卡片

```tsx
<Card className={`
  ${styles.assistantCard}
  ${touchStyles.touchCard}
  ${isActive ? touchStyles.touchActive : ''}
`}>
  <CardBody className={styles.cardBody}>
    {/* Content */}
  </CardBody>
</Card>
```

### 触摸按钮

```tsx
<Button
  className={`
    ${styles.touchTarget}
    ${touchStyles.touchButton}
  `}
  onPress={handlePress}
>
  Click me
</Button>
```

### 响应式网格

```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '16px',
}}>
  {items.map(item => <Item key={item.id} {...item} />)}
</div>
```

## 性能优化

### 使用 CSS Transforms

```css
/* 好 ✅ */
.element {
  transform: translateY(-4px);
}

/* 避免 ❌ */
.element {
  top: -4px;
}
```

### 使用 will-change

```css
.animated {
  will-change: transform, opacity;
}
```

### 避免重排

```css
/* 好 ✅ */
.element {
  transform: scale(0.96);
  opacity: 0.8;
}

/* 避免 ❌ */
.element {
  width: 96%;
  height: 96%;
}
```

## 无障碍

### 键盘导航

```css
.element:focus-visible {
  outline: 2px solid hsl(var(--heroui-primary));
  outline-offset: 2px;
}
```

### 高对比度

```css
@media (prefers-contrast: high) {
  .element {
    border: 2px solid currentColor;
  }
}
```

### 减少动画

```css
@media (prefers-reduced-motion: reduce) {
  .element {
    transition: none;
    animation: none;
  }
}
```

## 测试清单

### 移动端
- [ ] 单列布局
- [ ] 触摸目标 ≥ 44px
- [ ] 点击反馈流畅
- [ ] 字体大小合适
- [ ] 间距合理

### 平板端
- [ ] 双列布局
- [ ] 横竖屏正常
- [ ] 触摸操作流畅
- [ ] 内容不截断

### 桌面端
- [ ] 3-4列布局
- [ ] 鼠标悬停效果
- [ ] 键盘导航
- [ ] 响应速度快

## 常见问题

### Q: 触觉反馈不工作？
A: 检查浏览器是否支持 Vibration API，iOS Safari 不支持。

### Q: 触摸手势与滚动冲突？
A: 使用 `touch-action: pan-y` 允许垂直滚动。

### Q: 长按触发系统菜单？
A: 使用 `user-select: none` 和 `-webkit-touch-callout: none`。

### Q: 动画卡顿？
A: 使用 CSS transforms 和 GPU 加速，避免修改 layout 属性。

## 相关文档

- [完整实现报告](./TASK_11_RESPONSIVE_DESIGN_COMPLETE.md)
- [触摸手势 Hook](../hooks/useTouchGestures.ts)
- [响应式样式](../styles/AssistantCardResponsive.module.css)
- [触摸反馈样式](../styles/TouchFeedback.module.css)
