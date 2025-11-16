# Workflow Styles & Animations - Quick Reference

## Quick Start

### 1. Import Global Styles

```tsx
// In your layout or main component
import '@/styles/workflow-redesign.css';
```

### 2. Use CSS Variables

```css
.myComponent {
  background: var(--workflow-panel-bg);
  color: var(--workflow-text-primary);
  padding: var(--workflow-spacing-md);
  border-radius: var(--workflow-radius-md);
  box-shadow: var(--workflow-shadow-md);
}
```

### 3. Apply Animations

```tsx
// Using utility classes
<div className="workflow-animate-fade-in">Content</div>

// Using CSS modules
<div className={styles.myElement}>Content</div>
```

## Common Patterns

### Card with Hover Effect

```tsx
<div className="workflow-card workflow-card-hover">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

### Button with Animation

```tsx
<button className="workflow-hover-lift">
  Click Me
</button>
```

### Status Badge

```tsx
<span className="workflow-badge workflow-badge-success">
  Active
</span>
```

### Loading State

```tsx
<div className="workflow-loading">
  Loading content...
</div>
```

### Disabled State

```tsx
<button className="workflow-disabled">
  Disabled Button
</button>
```

## CSS Variables Cheat Sheet

### Colors
```css
--workflow-canvas-bg
--workflow-panel-bg
--workflow-text-primary
--workflow-text-secondary
--workflow-node-bg
--workflow-node-border
--workflow-status-running
--workflow-status-success
--workflow-status-error
```

### Spacing
```css
--workflow-spacing-xs    /* 4px */
--workflow-spacing-sm    /* 8px */
--workflow-spacing-md    /* 12px */
--workflow-spacing-lg    /* 16px */
--workflow-spacing-xl    /* 24px */
```

### Radius
```css
--workflow-radius-sm     /* 8px */
--workflow-radius-md     /* 12px */
--workflow-radius-lg     /* 16px */
```

### Shadows
```css
--workflow-shadow-sm
--workflow-shadow-md
--workflow-shadow-lg
--workflow-shadow-glow
```

### Durations
```css
--workflow-duration-fast    /* 150ms */
--workflow-duration-normal  /* 300ms */
--workflow-duration-slow    /* 500ms */
```

## Animation Classes

### Entrance
- `workflow-animate-fade-in`
- `workflow-animate-slide-in-left`
- `workflow-animate-slide-in-right`
- `workflow-animate-scale-in`
- `workflow-animate-bounce-in`

### Continuous
- `workflow-animate-pulse`
- `workflow-animate-spin`
- `workflow-animate-float`

### Hover Effects
- `workflow-hover-lift`
- `workflow-hover-scale`
- `workflow-hover-glow`

### Transitions
- `workflow-transition-all`
- `workflow-transition-colors`
- `workflow-transition-transform`

## Layout Utilities

### Flexbox
```tsx
<div className="workflow-flex workflow-flex-between">
  <span>Left</span>
  <span>Right</span>
</div>
```

### Grid
```tsx
<div className="workflow-grid workflow-grid-cols-3 workflow-gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## TypeScript Utilities

### Import
```typescript
import {
  applyAnimation,
  staggerAnimation,
  prefersReducedMotion,
  ANIMATION_DURATIONS,
  ANIMATION_EASINGS,
} from '@/lib/workflow/animationUtils';
```

### Apply Animation
```typescript
applyAnimation(element, 'workflow-fade-in', {
  duration: ANIMATION_DURATIONS.normal,
  easing: ANIMATION_EASINGS.default,
});
```

### Stagger Animation
```typescript
const elements = document.querySelectorAll('.item');
staggerAnimation(Array.from(elements), 'workflow-slide-in-left', 50);
```

### Check Reduced Motion
```typescript
if (prefersReducedMotion()) {
  // Use instant transitions
}
```

## Component Examples

### Sidebar
```tsx
<div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
  <div className={styles.sidebarContent}>
    {/* Content */}
  </div>
</div>
```

### Node Card
```tsx
<div className={styles.nodeCard}>
  <div className={styles.nodeIcon}>
    <Icon />
  </div>
  <div className={styles.nodeInfo}>
    <h4 className={styles.nodeName}>Node Name</h4>
    <p className={styles.nodeDescription}>Description</p>
  </div>
</div>
```

### Status Indicator
```tsx
<div className={styles.statusIndicator}>
  <div className={`${styles.statusDot} ${styles.connected}`} />
  <span className={styles.statusLabel}>Connected</span>
</div>
```

## Responsive Design

### Mobile First
```css
.element {
  /* Mobile styles */
  padding: var(--workflow-spacing-sm);
}

@media (min-width: 768px) {
  .element {
    /* Tablet styles */
    padding: var(--workflow-spacing-md);
  }
}

@media (min-width: 1024px) {
  .element {
    /* Desktop styles */
    padding: var(--workflow-spacing-lg);
  }
}
```

## Theme Switching

```tsx
// Add transition class
element.classList.add('themeTransition');

// Change theme
document.documentElement.setAttribute('data-theme', 'dark');

// Remove transition class after animation
setTimeout(() => {
  element.classList.remove('themeTransition');
}, 300);
```

## Performance Tips

1. **Use transform and opacity** for animations
2. **Add will-change** for frequently animated properties
3. **Remove will-change** after animation completes
4. **Use CSS animations** instead of JavaScript when possible
5. **Respect reduced motion** preferences

## Common Issues

### Animation not working?
- Check if CSS file is imported
- Verify class name spelling
- Check for conflicting styles

### Performance issues?
- Reduce animated elements
- Use will-change sparingly
- Avoid animating width/height

### Theme not switching?
- Verify data-theme attribute
- Check CSS variable definitions
- Clear browser cache

## Resources

- Full Documentation: `docs/WORKFLOW_STYLES_AND_ANIMATIONS.md`
- Animation Showcase: `components/workflow/AnimationShowcase.tsx`
- Global Styles: `styles/workflow-redesign.css`
- Animation Utils: `lib/workflow/animationUtils.ts`
