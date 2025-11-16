# Parameter List Animations - Quick Reference

## 🎬 Animation Overview

The ParameterList component features three main animation types:

1. **Parameter Item Fade-In** - Individual items animate in with stagger
2. **List Expand/Collapse** - Smooth height/opacity transitions
3. **Group Animations** - Parameter groups animate as units

## 🚀 Quick Start

### Basic Usage

```tsx
<ParameterList
  parameters={parameters}
  values={values}
  onChange={handleChange}
  isExpanded={true} // Controls expand/collapse animation
/>
```

### With Collapse Toggle

```tsx
const [isExpanded, setIsExpanded] = useState(true);

<ParameterList
  parameters={parameters}
  values={values}
  onChange={handleChange}
  isExpanded={isExpanded}
/>
```

## 🎨 Animation Specifications

### Parameter Item Animation
- **Duration**: 200ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Stagger Delay**: 30ms per item
- **Movement**: Fade in + 8px upward slide

### List Expand/Collapse
- **Duration**: 300ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Properties**: height, opacity, translateY
- **Behavior**: AnimatePresence handles mounting/unmounting

### Parameter Group Animation
- **Duration**: 300ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Stagger Delay**: 50ms per group
- **Movement**: Fade in + 8px upward slide

## ⚡ Performance Features

### GPU Acceleration
```css
transform: translateZ(0);
backface-visibility: hidden;
will-change: scroll-position;
```

### Optimized Properties
- ✅ `opacity` - GPU accelerated
- ✅ `transform` - GPU accelerated
- ❌ `height` - Only for expand/collapse (handled by Framer Motion)
- ❌ `width` - Never animated

### Scroll Optimization
```typescript
const handleScroll = useCallback(() => {
  // Memoized scroll handler
}, []);
```

## 🎯 Animation Variants

### Available in `nodeAnimations.ts`

```typescript
// List expand/collapse
parameterListVariants: {
  collapsed: { height: 0, opacity: 0, y: -10 },
  expanded: { height: 'auto', opacity: 1, y: 0 }
}

// Parameter items
parameterItemVariants: {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}

// Parameter groups
parameterGroupVariants: {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}
```

## 🔧 Stagger Configuration

```typescript
staggerConfig = {
  parameterList: {
    staggerChildren: 0.03,  // 30ms between items
    delayChildren: 0.05,    // 50ms initial delay
  },
  parameterGroup: {
    staggerChildren: 0.05,  // 50ms between groups
    delayChildren: 0.1,     // 100ms initial delay
  },
  fast: {
    staggerChildren: 0.02,  // For large lists
    delayChildren: 0.03,
  }
}
```

## ♿ Accessibility

### Reduced Motion Support

Animations automatically disabled when user prefers reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  .parameterList,
  .parameterGroup {
    animation: none !important;
    transition: none !important;
  }
}
```

### Testing Reduced Motion

**macOS**: System Preferences → Accessibility → Display → Reduce motion
**Windows**: Settings → Ease of Access → Display → Show animations

## 🐛 Troubleshooting

### Animations Not Working

1. **Check Framer Motion installation**
   ```bash
   npm list framer-motion
   ```

2. **Verify isExpanded prop**
   ```tsx
   <ParameterList isExpanded={true} />
   ```

3. **Check browser console for errors**

### Performance Issues

1. **Reduce stagger delay for large lists**
   ```typescript
   // Use fast stagger config
   transition: staggerConfig.fast
   ```

2. **Enable virtualization for 10+ parameters**
   - Automatically enabled at VIRTUALIZATION_THRESHOLD

3. **Check GPU acceleration**
   - Open DevTools → Performance
   - Record animation
   - Look for "Composite Layers"

### Animation Glitches

1. **Ensure unique keys**
   ```tsx
   <motion.div key={param.name}>
   ```

2. **Use AnimatePresence mode**
   ```tsx
   <AnimatePresence mode="popLayout">
   ```

3. **Check for conflicting CSS**
   - Remove custom animations on same elements

## 📊 Performance Benchmarks

### Target Metrics
- **Frame Rate**: 60 FPS
- **Animation Duration**: 200-300ms
- **Stagger Delay**: 30-50ms
- **Memory Impact**: < 5MB

### Optimization Checklist
- ✅ GPU acceleration enabled
- ✅ Only animate transform/opacity
- ✅ Use useCallback for handlers
- ✅ Implement virtualization threshold
- ✅ Respect prefers-reduced-motion

## 🎓 Best Practices

### DO ✅
- Use `isExpanded` prop for expand/collapse
- Keep stagger delays under 50ms
- Test with reduced motion enabled
- Monitor performance with DevTools
- Use AnimatePresence for enter/exit

### DON'T ❌
- Animate layout properties (width, height, margin)
- Use inline styles for animations
- Forget unique keys on animated elements
- Ignore prefers-reduced-motion
- Nest too many animated components

## 📚 Related Documentation

- [PARAMETER_LIST_ANIMATIONS_COMPLETE.md](./PARAMETER_LIST_ANIMATIONS_COMPLETE.md) - Full implementation details
- [PARAMETER_LIST_IMPLEMENTATION.md](./PARAMETER_LIST_IMPLEMENTATION.md) - Component architecture
- [TASK_4_COMPLETE.md](./TASK_4_COMPLETE.md) - Task completion summary

## 🔗 External Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [AnimatePresence Guide](https://www.framer.com/motion/animate-presence/)
- [Performance Optimization](https://www.framer.com/motion/guide-reduce-bundle-size/)

---

**Last Updated**: 2025-01-XX
**Component**: ParameterList
**Requirements**: 7.1, 9.1
