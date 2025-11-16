# Workflow UI Redesign - Styles and Animations

## Overview

This document describes the comprehensive styling and animation system for the workflow UI redesign. The system provides a consistent, modern, and performant visual experience across all workflow components.

## File Structure

```
styles/
├── workflow-redesign.css                    # Global styles and CSS variables
├── WorkflowEditorLayoutRedesign.module.css  # Layout component styles
├── NodeLibraryRedesign.module.css           # Node library styles
├── ControlPanelRedesign.module.css          # Control panel styles
├── WorkflowCanvasRedesign.module.css        # Canvas styles
├── CustomNodeRedesign.module.css            # Custom node styles
└── AnimationShowcase.module.css             # Animation showcase styles

lib/workflow/
└── animationUtils.ts                        # Animation utilities and helpers

components/workflow/
└── AnimationShowcase.tsx                    # Interactive animation demo
```

## CSS Variables System

### Theme Colors

The system uses CSS variables for easy theme switching:

**Light Theme:**
```css
--workflow-canvas-bg: #f8fafc;
--workflow-panel-bg: #ffffff;
--workflow-text-primary: #0f172a;
--workflow-node-bg: #ffffff;
```

**Dark Theme:**
```css
--workflow-canvas-bg: #0a0f1e;
--workflow-panel-bg: #111827;
--workflow-text-primary: #f1f5f9;
--workflow-node-bg: #1e293b;
```

### Design Tokens

#### Spacing System (4px base)
```css
--workflow-spacing-xs: 4px;
--workflow-spacing-sm: 8px;
--workflow-spacing-md: 12px;
--workflow-spacing-lg: 16px;
--workflow-spacing-xl: 24px;
--workflow-spacing-2xl: 32px;
--workflow-spacing-3xl: 48px;
```

#### Border Radius
```css
--workflow-radius-sm: 8px;
--workflow-radius-md: 12px;
--workflow-radius-lg: 16px;
--workflow-radius-xl: 20px;
--workflow-radius-full: 9999px;
```

#### Shadows
```css
--workflow-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--workflow-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--workflow-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--workflow-shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3);
```

#### Animation Durations
```css
--workflow-duration-fast: 150ms;
--workflow-duration-normal: 300ms;
--workflow-duration-slow: 500ms;
```

#### Animation Easing
```css
--workflow-easing: cubic-bezier(0.4, 0, 0.2, 1);
--workflow-easing-in: cubic-bezier(0.4, 0, 1, 1);
--workflow-easing-out: cubic-bezier(0, 0, 0.2, 1);
--workflow-easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## Global Animations

### Available Animations

1. **workflow-fade-in** - Fade in from transparent
2. **workflow-fade-out** - Fade out to transparent
3. **workflow-slide-in-left** - Slide in from left
4. **workflow-slide-in-right** - Slide in from right
5. **workflow-slide-out-left** - Slide out to left
6. **workflow-slide-out-right** - Slide out to right
7. **workflow-scale-in** - Scale up from 90%
8. **workflow-scale-out** - Scale down to 90%
9. **workflow-bounce-in** - Bounce in with overshoot
10. **workflow-pulse** - Pulsing opacity
11. **workflow-spin** - 360° rotation
12. **workflow-glow-pulse** - Pulsing glow effect
13. **workflow-shake** - Horizontal shake
14. **workflow-float** - Vertical floating
15. **workflow-shimmer** - Shimmer loading effect
16. **workflow-progress** - Progress bar animation

### Usage Examples

```tsx
// Using CSS classes
<div className="workflow-animate-fade-in">Content</div>

// Using CSS modules
import styles from '@/styles/MyComponent.module.css';
<div className={styles.myElement}>Content</div>

// In CSS module
.myElement {
  animation: workflow-slide-in-left var(--workflow-duration-normal) var(--workflow-easing);
}
```

## Utility Classes

### Animation Classes

```css
.workflow-animate-fade-in
.workflow-animate-slide-in-left
.workflow-animate-scale-in
.workflow-animate-bounce-in
.workflow-animate-pulse
.workflow-animate-spin
.workflow-animate-float
```

### Transition Classes

```css
.workflow-transition-all
.workflow-transition-colors
.workflow-transition-transform
.workflow-transition-opacity
.workflow-transition-fast
.workflow-transition-slow
```

### Hover Effects

```css
.workflow-hover-lift      /* Lift up on hover */
.workflow-hover-scale     /* Scale up on hover */
.workflow-hover-glow      /* Glow effect on hover */
```

### Focus Styles

```css
.workflow-focus-ring      /* Focus ring for accessibility */
```

### State Classes

```css
.workflow-loading         /* Loading state with spinner */
.workflow-disabled        /* Disabled state */
```

### Layout Classes

```css
.workflow-flex
.workflow-flex-col
.workflow-flex-center
.workflow-flex-between
.workflow-grid
.workflow-grid-cols-2
.workflow-grid-cols-3
```

### Spacing Classes

```css
.workflow-p-xs, .workflow-p-sm, .workflow-p-md, .workflow-p-lg, .workflow-p-xl
.workflow-m-xs, .workflow-m-sm, .workflow-m-md, .workflow-m-lg, .workflow-m-xl
.workflow-gap-sm, .workflow-gap-md, .workflow-gap-lg
```

## Component-Specific Animations

### Sidebar Collapse/Expand

```css
.leftSidebar {
  transition: width var(--workflow-duration-normal) var(--workflow-easing);
}

.leftSidebar.collapsed {
  width: var(--workflow-sidebar-collapsed);
}
```

### Node Drag Animation

```css
.nodeCard:hover {
  transform: translateY(-2px);
  box-shadow: var(--workflow-shadow-md);
}

.nodeCard:active {
  cursor: grabbing;
  transform: translateY(0);
}
```

### Button Hover and Click

```css
.primaryButton:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--workflow-shadow-glow-success);
}

.primaryButton:active:not(:disabled) {
  transform: translateY(0);
}
```

### List Item Stagger

```css
.nodeCard:nth-child(1) { animation-delay: 0ms; }
.nodeCard:nth-child(2) { animation-delay: 50ms; }
.nodeCard:nth-child(3) { animation-delay: 100ms; }
.nodeCard:nth-child(4) { animation-delay: 150ms; }
.nodeCard:nth-child(5) { animation-delay: 200ms; }
```

## Animation Utilities (TypeScript)

### Import

```typescript
import {
  sidebarAnimation,
  nodeDragAnimation,
  buttonAnimation,
  listItemAnimation,
  slideInAnimation,
  fadeAnimation,
  scaleAnimation,
  bounceInAnimation,
  pulseAnimation,
  glowPulseAnimation,
  shakeAnimation,
  floatAnimation,
} from '@/lib/workflow/animationUtils';
```

### Usage with Framer Motion

```tsx
import { motion } from 'framer-motion';

// Sidebar animation
<motion.div
  initial="collapsed"
  animate={isExpanded ? "expanded" : "collapsed"}
  variants={sidebarAnimation}
>
  Sidebar content
</motion.div>

// Button animation
<motion.button
  initial="initial"
  whileHover="hover"
  whileTap="tap"
  variants={buttonAnimation}
>
  Click me
</motion.button>

// List with stagger
<motion.div>
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      custom={index}
      initial="hidden"
      animate="visible"
      variants={listItemAnimation}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Helper Functions

```typescript
// Apply animation to element
applyAnimation(element, 'workflow-fade-in', {
  duration: 300,
  easing: 'ease-out',
  delay: 100,
});

// Stagger animation for multiple elements
staggerAnimation(elements, 'workflow-slide-in-left', 50);

// Animate with requestAnimationFrame
animateWithRAF((progress) => {
  element.style.opacity = progress.toString();
}, 300);

// Check for reduced motion preference
if (prefersReducedMotion()) {
  // Use instant transitions
}
```

## Performance Optimizations

### GPU Acceleration

```css
.workflow-gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

### Will-Change Hints

```css
.workflow-will-change-transform {
  will-change: transform;
}

.workflow-will-change-opacity {
  will-change: opacity;
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Responsive Behavior

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  /* Drawer-style sidebars */
  /* Smaller spacing */
  /* Touch-optimized sizes */
}

/* Tablet */
@media (max-width: 1024px) {
  /* Narrower sidebars */
  /* Adjusted spacing */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Full three-column layout */
  /* Standard spacing */
}
```

## Theme Switching

### Smooth Transition

```css
.layout.themeTransition * {
  transition: background-color var(--workflow-duration-normal) var(--workflow-easing),
              border-color var(--workflow-duration-normal) var(--workflow-easing),
              color var(--workflow-duration-normal) var(--workflow-easing) !important;
}
```

### Usage

```tsx
// Add themeTransition class during theme change
const handleThemeChange = () => {
  layoutRef.current?.classList.add('themeTransition');
  setTheme(newTheme);
  
  setTimeout(() => {
    layoutRef.current?.classList.remove('themeTransition');
  }, 300);
};
```

## Testing Animations

### Animation Showcase

Visit the animation showcase to see all animations in action:

```tsx
import { AnimationShowcase } from '@/components/workflow/AnimationShowcase';

<AnimationShowcase />
```

### Manual Testing

1. Open the workflow editor
2. Test sidebar collapse/expand
3. Drag nodes from library to canvas
4. Hover over buttons and cards
5. Switch between light and dark themes
6. Test on different screen sizes

## Best Practices

### 1. Use CSS Variables

Always use CSS variables for colors, spacing, and timing:

```css
/* Good */
.myElement {
  padding: var(--workflow-spacing-md);
  color: var(--workflow-text-primary);
}

/* Avoid */
.myElement {
  padding: 12px;
  color: #0f172a;
}
```

### 2. Respect User Preferences

Always check for reduced motion:

```typescript
if (prefersReducedMotion()) {
  // Use instant transitions
  config.duration = 1;
}
```

### 3. Use Appropriate Durations

- **Fast (150ms)**: Hover effects, small UI changes
- **Normal (300ms)**: Most transitions, sidebar collapse
- **Slow (500ms)**: Complex animations, page transitions

### 4. Optimize Performance

- Use `transform` and `opacity` for animations
- Add `will-change` for frequently animated properties
- Remove `will-change` after animation completes
- Use `requestAnimationFrame` for JavaScript animations

### 5. Maintain Consistency

- Use the same easing function for similar animations
- Keep animation durations consistent across components
- Follow the established spacing and sizing system

## Troubleshooting

### Animation Not Working

1. Check if CSS file is imported
2. Verify class name spelling
3. Check for conflicting styles
4. Ensure element is not `display: none`

### Performance Issues

1. Reduce number of animated elements
2. Use `will-change` sparingly
3. Avoid animating expensive properties (width, height)
4. Use CSS animations instead of JavaScript when possible

### Theme Not Switching

1. Verify `data-theme` attribute is set
2. Check CSS variable definitions
3. Ensure transition class is applied
4. Clear browser cache

## Future Enhancements

- [ ] Add more animation presets
- [ ] Create animation timeline tool
- [ ] Add gesture-based animations
- [ ] Implement physics-based animations
- [ ] Add sound effects (optional)
- [ ] Create animation documentation site

## Resources

- [CSS Animations MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Web Animation API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [WCAG Motion Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)

## Support

For questions or issues related to styles and animations:

1. Check this documentation
2. Review the animation showcase
3. Inspect existing components
4. Consult the design system documentation
