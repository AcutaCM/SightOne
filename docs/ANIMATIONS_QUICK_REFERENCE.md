# Assistant Animations - Quick Reference

## 🎬 Animation Classes

### Drawer Animations
```tsx
// Slide-in from right (300ms)
className={styles.drawerEnter}

// Slide-out to right (250ms)
className={styles.drawerExit}

// GPU acceleration
className={styles.gpuAccelerated}
```

### Overlay Animations
```tsx
// Fade in overlay (300ms)
className={styles.overlayEnter}

// Fade out overlay (250ms)
className={styles.overlayExit}
```

### Form Field Animations
```tsx
// Focus scale + shadow
<div className={styles.fieldFocus}>
  <Input />
</div>

// Focus glow effect
<Input classNames={{ base: styles.inputGlow }} />

// Draft highlight (3s fade)
className={styles.draftHighlight}
```

### Loading Animations
```tsx
// Pulsing opacity
className={styles.loadingPulse}

// Shimmer skeleton
className={styles.loadingSkeleton}

// Rotating spinner
className={styles.spinner}

// Button loading
className={styles.buttonLoading}
```

### Feedback Animations
```tsx
// Error shake (400ms)
className={styles.errorShake}

// Error pulse border
className={styles.errorPulse}

// Success bounce (600ms)
className={styles.successBounce}

// Success checkmark
className={styles.successCheckmark}
```

### Tag Animations
```tsx
// Tag enter (200ms)
className={styles.tagEnter}

// Tag exit (150ms)
className={styles.tagExit}
```

### Content Animations
```tsx
// Fade in + slide up (400ms)
className={styles.contentFadeIn}

// Slide in from left (300ms)
className={styles.contentSlideIn}

// Staggered list items
className={styles.staggerItem}
```

### Hover Effects
```tsx
// Lift on hover
className={styles.hoverLift}

// Glow on hover
className={styles.hoverGlow}
```

### Counter Animations
```tsx
// Scale pulse on update
className={styles.counterUpdate}

// Warning pulse
className={styles.counterWarning}
```

---

## ⚡ Performance Tips

### Always Use GPU Acceleration
```tsx
<div className={styles.gpuAccelerated}>
  {/* Animated content */}
</div>
```

### Combine with Transitions
```tsx
<div className={`${styles.hoverLift} transition-all`}>
  {/* Smooth transitions */}
</div>
```

### Conditional Animations
```tsx
<div className={loading ? styles.loadingPulse : ''}>
  {/* Only animate when loading */}
</div>
```

---

## 📊 Timing Reference

| Animation | Duration | Use Case |
|-----------|----------|----------|
| Drawer | 300ms | Main entrance |
| Overlay | 300ms | Background |
| Field focus | 200ms | User input |
| Tag | 150-200ms | Quick feedback |
| Error | 400ms | Attention |
| Success | 600ms | Celebration |
| Loading | 1500ms | Continuous |
| Draft | 3000ms | Highlight |

---

## 🎨 Common Patterns

### Modal with Animation
```tsx
<Modal
  classNames={{
    base: styles.gpuAccelerated,
    wrapper: styles.overlayEnter
  }}
  motionProps={{
    variants: {
      enter: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3 }
      },
      exit: {
        x: '100%',
        opacity: 0,
        transition: { duration: 0.25 }
      }
    }
  }}
>
```

### Input with Focus Glow
```tsx
<div className={styles.fieldFocus}>
  <Input
    classNames={{
      base: `${styles.inputGlow} transition-all`,
      inputWrapper: errors ? styles.errorShake : ''
    }}
  />
</div>
```

### Animated Tag List
```tsx
{tags.map((tag, i) => (
  <Chip
    key={i}
    className={`${styles.tagEnter} ${styles.hoverLift}`}
  >
    {tag}
  </Chip>
))}
```

### Loading Button
```tsx
<Button
  isLoading={saving}
  className={`${styles.hoverLift} ${saving ? styles.buttonLoading : ''}`}
>
  Save
</Button>
```

### Staggered Form Sections
```tsx
<div className={styles.staggerItem}>
  <h3>Section 1</h3>
  {/* Content */}
</div>
<div className={styles.staggerItem}>
  <h3>Section 2</h3>
  {/* Content */}
</div>
```

---

## ♿ Accessibility

### Reduced Motion Support
Automatically respects user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations reduced to 0.01ms */
}
```

### Focus Indicators
All interactive elements have visible focus states with animations.

---

## 🐛 Troubleshooting

### Animation Not Smooth?
1. Add `gpuAccelerated` class
2. Use only `transform` and `opacity`
3. Check for layout thrashing

### Animation Too Fast/Slow?
Adjust duration in CSS module:
```css
animation: slideIn 300ms; /* Change 300ms */
```

### Animation Not Triggering?
1. Check class is applied
2. Verify CSS module import
3. Check conditional logic

---

## 📚 Full Documentation
See `TASK_10_ANIMATIONS_TRANSITIONS_COMPLETE.md` for complete details.
