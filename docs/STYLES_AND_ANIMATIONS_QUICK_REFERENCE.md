# 样式和动画快速参考

## CSS变量速查

### 节点颜色
```css
--node-bg                 /* 节点背景色 */
--node-border             /* 节点边框色 */
--node-border-hover       /* 悬停边框色 */
--node-selected           /* 选中边框色 */
--node-selected-glow      /* 选中光晕色 */
--node-divider            /* 分隔线颜色 */
--node-header-bg          /* 头部背景色 */
```

### 节点阴影
```css
--node-shadow             /* 基础阴影 */
--node-shadow-hover       /* 悬停阴影 */
--node-shadow-selected    /* 选中阴影 */
```

### 参数颜色
```css
--param-container-bg      /* 参数容器背景 */
--param-bg                /* 参数背景色 */
--param-bg-hover          /* 悬停背景色 */
--param-bg-editing        /* 编辑背景色 */
--param-bg-error          /* 错误背景色 */
--param-border            /* 参数边框色 */
--param-border-hover      /* 悬停边框色 */
--param-border-editing    /* 编辑边框色 */
--param-editing-glow      /* 编辑光晕色 */
```

### 文本颜色
```css
--text-primary            /* 主要文本 */
--text-secondary          /* 次要文本 */
--text-tertiary           /* 第三级文本 */
```

### 状态颜色
```css
--error-color             /* 错误色 */
--error-color-hover       /* 错误悬停色 */
--success-color           /* 成功色 */
--success-color-light     /* 成功浅色 */
--warning-color           /* 警告色 */
--info-color              /* 信息色 */
```

## 动画变体速查

### 导入动画配置
```tsx
import {
  nodeVariants,
  parameterListVariants,
  parameterItemVariants,
  statusIndicatorVariants,
  buttonVariants,
  easings,
  durations
} from '@/lib/workflow/nodeAnimations';
```

### 节点动画
```tsx
<motion.div
  variants={nodeVariants}
  initial="initial"
  whileHover="hover"
  animate={selected ? "selected" : "initial"}
>
  {/* 节点内容 */}
</motion.div>
```

### 参数列表动画
```tsx
<AnimatePresence mode="wait">
  {!isCollapsed && (
    <motion.div
      variants={parameterListVariants}
      initial="collapsed"
      animate="expanded"
      exit="collapsed"
    >
      {/* 参数列表 */}
    </motion.div>
  )}
</AnimatePresence>
```

### 参数项动画
```tsx
<motion.div
  variants={parameterItemVariants}
  initial="initial"
  animate="animate"
  whileHover="hover"
>
  {/* 参数项内容 */}
</motion.div>
```

### 保存成功动画
```tsx
<motion.div
  animate={showSaveSuccess ? {
    scale: [1, 1.02, 1],
    borderColor: [
      'var(--param-border)', 
      'var(--success-color)', 
      'var(--param-border)'
    ]
  } : {}}
  transition={{
    duration: durations.verySlow,
    ease: easings.standard
  }}
>
  {/* 内容 */}
</motion.div>
```

### 状态指示器动画
```tsx
<motion.div
  variants={statusIndicatorVariants}
  animate={status} // 'idle' | 'running' | 'success' | 'error'
>
  {/* 状态指示器 */}
</motion.div>
```

### 按钮动画
```tsx
<motion.button
  variants={buttonVariants}
  whileHover="hover"
  whileTap="tap"
>
  {/* 按钮内容 */}
</motion.button>
```

## 常用动画模式

### 1. 淡入淡出
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: durations.normal }}
>
  {/* 内容 */}
</motion.div>
```

### 2. 滑入滑出
```tsx
<motion.div
  initial={{ x: -20, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: -20, opacity: 0 }}
  transition={{ duration: durations.normal, ease: easings.standard }}
>
  {/* 内容 */}
</motion.div>
```

### 3. 缩放弹出
```tsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  exit={{ scale: 0 }}
  transition={easings.spring}
>
  {/* 内容 */}
</motion.div>
```

### 4. 高度展开
```tsx
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: durations.slow, ease: easings.standard }}
  style={{ overflow: 'hidden' }}
>
  {/* 内容 */}
</motion.div>
```

### 5. 旋转动画
```tsx
<motion.div
  animate={{ rotate: isOpen ? 180 : 0 }}
  transition={{ duration: durations.slow }}
>
  {/* 图标 */}
</motion.div>
```

### 6. 脉冲动画
```tsx
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1]
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut'
  }}
>
  {/* 内容 */}
</motion.div>
```

## CSS类名速查

### InlineParameterNode.module.css

```tsx
import styles from '@/styles/InlineParameterNode.module.css';

// 节点样式
styles.inlineParameterNode
styles.selected
styles.collapsed

// 参数容器
styles.parameterContainer
styles.extended

// 参数列表
styles.parameterList

// 参数项
styles.parameterItem
styles.editing
styles.error
styles.saveSuccess

// 参数标签和值
styles.parameterLabel
styles.parameterValue
styles.parameterError
styles.parameterUnit

// 节点头部
styles.nodeHeader
styles.nodeHeaderLeft
styles.nodeHeaderRight
styles.nodeTitle
styles.iconButton
styles.paramBadge
styles.errorIcon

// 状态指示器
styles.statusIndicator
styles.idle
styles.running
styles.success
styles.error

// 进度条
styles.progressBar

// 布局模式
styles.compact
styles.standard
styles.extended
```

## 缓动函数速查

```tsx
import { easings } from '@/lib/workflow/nodeAnimations';

// 标准缓动 - 适用于大多数动画
transition={{ ease: easings.standard }}

// 加速 - 适用于退出动画
transition={{ ease: easings.accelerate }}

// 减速 - 适用于进入动画
transition={{ ease: easings.decelerate }}

// 弹簧效果 - 适用于弹出动画
transition={easings.spring}

// 柔和弹簧 - 适用于平滑弹出
transition={easings.softSpring}
```

## 持续时间速查

```tsx
import { durations } from '@/lib/workflow/nodeAnimations';

// 快速 - 0.15s - 适用于悬停效果
transition={{ duration: durations.fast }}

// 正常 - 0.2s - 适用于一般动画
transition={{ duration: durations.normal }}

// 慢速 - 0.3s - 适用于折叠展开
transition={{ duration: durations.slow }}

// 很慢 - 0.6s - 适用于保存成功
transition={{ duration: durations.verySlow }}
```

## 交错动画速查

```tsx
import { staggerConfig } from '@/lib/workflow/nodeAnimations';

// 参数列表交错
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
  transition={staggerConfig.parameterList}
>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>

// 快速交错
transition={staggerConfig.fast}

// 慢速交错
transition={staggerConfig.slow}
```

## 主题切换

### 检测当前主题
```tsx
import { useTheme } from 'next-themes';

const { theme } = useTheme();
const isDark = theme === 'dark';
```

### 根据主题应用样式
```tsx
<div style={{
  background: isDark 
    ? 'var(--node-bg)' 
    : 'var(--node-bg)',
  color: 'var(--text-primary)'
}}>
  {/* 内容 */}
</div>
```

## 性能优化技巧

### 1. 使用transform和opacity
```tsx
// ✅ 好 - 使用transform
<motion.div animate={{ x: 100, scale: 1.2 }} />

// ❌ 差 - 使用width/height
<motion.div animate={{ width: 200, height: 100 }} />
```

### 2. 添加will-change提示
```tsx
<motion.div
  style={{ willChange: 'transform, opacity' }}
  animate={{ x: 100, opacity: 0.5 }}
/>
```

### 3. 使用AnimatePresence
```tsx
<AnimatePresence mode="wait">
  {show && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 内容 */}
    </motion.div>
  )}
</AnimatePresence>
```

### 4. 防抖处理
```tsx
import { debounce } from 'lodash';

const debouncedUpdate = useMemo(
  () => debounce((value) => {
    // 更新逻辑
  }, 300),
  []
);
```

## 无障碍支持

### 尊重用户动画偏好
```tsx
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={shouldReduceMotion ? {} : { x: 100 }}
  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
>
  {/* 内容 */}
</motion.div>
```

### 添加ARIA属性
```tsx
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  aria-label="折叠参数"
  aria-expanded={!isCollapsed}
>
  {/* 按钮内容 */}
</motion.button>
```

## 调试技巧

### 1. 查看动画值
```tsx
<motion.div
  animate={{ x: 100 }}
  onUpdate={(latest) => {
    console.log('Current x:', latest.x);
  }}
/>
```

### 2. 动画完成回调
```tsx
<motion.div
  animate={{ opacity: 1 }}
  onAnimationComplete={() => {
    console.log('Animation completed');
  }}
/>
```

### 3. 使用layout调试
```tsx
<motion.div
  layout
  layoutId="unique-id"
  style={{ border: '1px solid red' }}
>
  {/* 内容 */}
</motion.div>
```

## 常见问题

### Q: 动画不流畅怎么办？
A: 
1. 确保使用transform和opacity
2. 添加will-change提示
3. 减少同时运行的动画数量
4. 使用硬件加速

### Q: 如何禁用动画？
A: 
```tsx
const shouldAnimate = !useReducedMotion();

<motion.div
  animate={shouldAnimate ? { x: 100 } : {}}
  transition={shouldAnimate ? { duration: 0.3 } : { duration: 0 }}
/>
```

### Q: 如何自定义缓动函数？
A:
```tsx
<motion.div
  animate={{ x: 100 }}
  transition={{
    ease: [0.6, 0.01, 0.05, 0.95], // 自定义贝塞尔曲线
    duration: 0.5
  }}
/>
```

### Q: 如何实现序列动画？
A:
```tsx
<motion.div
  animate={{
    x: [0, 100, 100, 0],
    y: [0, 0, 100, 100]
  }}
  transition={{
    duration: 2,
    times: [0, 0.33, 0.66, 1]
  }}
/>
```

## 更多资源

- [Framer Motion文档](https://www.framer.com/motion/)
- [CSS变量指南](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [动画性能优化](https://web.dev/animations/)
- [无障碍动画](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
