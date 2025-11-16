# Workflow Theme System

This document describes the theme system and design tokens for the workflow UI redesign.

## Overview

The workflow theme system provides a comprehensive solution for managing themes, design tokens, and CSS variables across the workflow editor interface. It supports:

- Light and dark themes
- Automatic system theme detection
- Smooth theme transitions
- Persistent theme preferences
- CSS variable system for dynamic theming
- Responsive layout configuration

## Architecture

### Core Files

1. **`designTokens.ts`** - Defines all design tokens (colors, spacing, shadows, etc.)
2. **`theme.ts`** - Theme configuration and utility functions
3. **`useWorkflowTheme.ts`** - React hook for theme management
4. **`workflow-theme.css`** - CSS variables and utility classes

## Design Tokens

Design tokens are organized into the following categories:

### Colors

```typescript
colors: {
  canvas: { background, grid, gridDot }
  node: { background, border, text, shadow, selectedBorder, selectedGlow }
  edge: { default, selected, animated }
  panel: { background, border, text, textSecondary, hover }
  status: { idle, running, success, error, warning }
  category: { basic, movement, detection, ai, logic, data, challenge }
}
```

### Spacing

```typescript
spacing: {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px'
}
```

### Border Radius

```typescript
radius: {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px'
}
```

### Shadows

```typescript
shadows: {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  glow: '0 0 20px rgba(0, 0, 0, 0.1)',
  glowPrimary: '0 0 20px rgba(59, 130, 246, 0.3)',
  glowSuccess: '0 0 20px rgba(16, 185, 129, 0.3)',
  glowError: '0 0 20px rgba(239, 68, 68, 0.3)'
}
```

### Animations

```typescript
animations: {
  duration: { fast: '150ms', normal: '300ms', slow: '500ms' }
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
}
```

### Typography

```typescript
typography: {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace'
  }
  fontSize: { xs, sm, base, lg, xl, '2xl' }
  fontWeight: { normal, medium, semibold, bold }
  lineHeight: { tight, normal, relaxed }
}
```

## Usage

### Basic Usage

```tsx
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';

function WorkflowEditor() {
  const { theme, themeConfig, setTheme, toggleTheme } = useWorkflowTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### With Options

```tsx
const { theme, themeConfig } = useWorkflowTheme({
  initialTheme: 'dark',
  syncWithSystem: true,
  persistTheme: true,
  enableTransitions: true,
});
```

### Accessing Theme Tokens

```tsx
import { useWorkflowThemeTokens } from '@/hooks/useWorkflowTheme';

function MyComponent() {
  const tokens = useWorkflowThemeTokens();
  
  return (
    <div style={{
      backgroundColor: tokens.colors.panel.background,
      padding: tokens.spacing.lg,
      borderRadius: tokens.radius.md,
    }}>
      Content
    </div>
  );
}
```

### Using CSS Variables

```tsx
function MyComponent() {
  return (
    <div className="wf-panel" style={{
      padding: 'var(--wf-spacing-lg)',
      borderRadius: 'var(--wf-radius-md)',
    }}>
      Content
    </div>
  );
}
```

### Utility Classes

The theme system provides utility classes for common patterns:

```tsx
// Panel styling
<div className="wf-panel">...</div>

// Node styling
<div className="wf-node">...</div>
<div className="wf-node wf-node-selected">...</div>

// Canvas styling
<div className="wf-canvas">...</div>

// Text colors
<span className="wf-text-secondary">Secondary text</span>

// Status indicators
<span className="wf-status-running">Running</span>
<span className="wf-status-success">Success</span>
<span className="wf-status-error">Error</span>

// Category colors
<span className="wf-category-basic">Basic</span>
<span className="wf-category-movement">Movement</span>

// Hover effects
<button className="wf-hover">Hover me</button>

// Theme transitions
<div className="wf-theme-transition">...</div>

// Animations
<div className="wf-fade-in">...</div>
<div className="wf-slide-in-left">...</div>
```

## Layout Configuration

The theme system includes responsive layout configuration:

```typescript
const layoutConfig = {
  nodeLibrary: {
    defaultWidth: 280,
    minWidth: 200,
    maxWidth: 400,
    collapsedWidth: 48,
  },
  controlPanel: {
    defaultWidth: 360,
    minWidth: 280,
    maxWidth: 500,
    collapsedWidth: 48,
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
};
```

### Layout Utilities

```typescript
import {
  getLayoutMode,
  isMobileLayout,
  isTabletLayout,
  isDesktopLayout,
  calculateSidebarWidth,
} from '@/lib/workflow/theme';

// Get current layout mode
const layoutMode = getLayoutMode(window.innerWidth);

// Check layout type
if (isMobileLayout()) {
  // Mobile-specific logic
}

// Calculate sidebar width
const width = calculateSidebarWidth(
  layoutMode,
  isCollapsed,
  layoutConfig.nodeLibrary
);
```

## Theme Management

### Detect System Theme

```typescript
import { detectSystemTheme } from '@/lib/workflow/theme';

const systemTheme = detectSystemTheme();
```

### Watch System Theme Changes

```typescript
import { watchSystemTheme } from '@/lib/workflow/theme';

const unwatch = watchSystemTheme((newTheme) => {
  console.log('System theme changed to:', newTheme);
});

// Cleanup
unwatch();
```

### Persist Theme

```typescript
import { getStoredTheme, setStoredTheme, clearStoredTheme } from '@/lib/workflow/theme';

// Get stored theme
const stored = getStoredTheme();

// Save theme
setStoredTheme('dark');

// Clear stored theme
clearStoredTheme();
```

## CSS Variables Reference

All CSS variables are prefixed with `--wf-` (workflow):

### Canvas
- `--wf-canvas-bg`
- `--wf-canvas-grid`
- `--wf-canvas-grid-dot`

### Node
- `--wf-node-bg`
- `--wf-node-border`
- `--wf-node-text`
- `--wf-node-shadow`
- `--wf-node-selected-border`
- `--wf-node-selected-glow`

### Edge
- `--wf-edge-default`
- `--wf-edge-selected`
- `--wf-edge-animated`

### Panel
- `--wf-panel-bg`
- `--wf-panel-border`
- `--wf-panel-text`
- `--wf-panel-text-secondary`
- `--wf-panel-hover`

### Status
- `--wf-status-idle`
- `--wf-status-running`
- `--wf-status-success`
- `--wf-status-error`
- `--wf-status-warning`

### Category
- `--wf-category-basic`
- `--wf-category-movement`
- `--wf-category-detection`
- `--wf-category-ai`
- `--wf-category-logic`
- `--wf-category-data`
- `--wf-category-challenge`

### Spacing
- `--wf-spacing-xs` through `--wf-spacing-3xl`

### Radius
- `--wf-radius-sm` through `--wf-radius-full`

### Shadows
- `--wf-shadow-sm` through `--wf-shadow-xl`
- `--wf-shadow-glow`
- `--wf-shadow-glow-primary`
- `--wf-shadow-glow-success`
- `--wf-shadow-glow-error`

### Animations
- `--wf-duration-fast`, `--wf-duration-normal`, `--wf-duration-slow`
- `--wf-easing-default`, `--wf-easing-in`, `--wf-easing-out`, `--wf-easing-in-out`

### Typography
- `--wf-font-sans`, `--wf-font-mono`
- `--wf-text-xs` through `--wf-text-2xl`
- `--wf-font-normal` through `--wf-font-bold`
- `--wf-leading-tight`, `--wf-leading-normal`, `--wf-leading-relaxed`

## Best Practices

1. **Use CSS Variables**: Prefer CSS variables over direct token access for better performance
2. **Utility Classes**: Use provided utility classes for common patterns
3. **Theme Transitions**: Enable transitions for smooth theme switching
4. **Persist Preferences**: Save user theme preferences to localStorage
5. **System Sync**: Sync with system theme by default for better UX
6. **Responsive Design**: Use layout utilities for responsive behavior
7. **Semantic Colors**: Use status and category colors for consistent meaning

## Examples

### Complete Component Example

```tsx
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';
import '@/styles/workflow-theme.css';

function WorkflowPanel() {
  const { theme, toggleTheme, isTransitioning } = useWorkflowTheme({
    persistTheme: true,
    enableTransitions: true,
  });
  
  return (
    <div className="wf-panel wf-theme-transition" style={{
      padding: 'var(--wf-spacing-lg)',
      borderRadius: 'var(--wf-radius-md)',
      boxShadow: 'var(--wf-shadow-md)',
    }}>
      <h2 style={{ fontSize: 'var(--wf-text-xl)' }}>
        Workflow Panel
      </h2>
      
      <p className="wf-text-secondary">
        Current theme: {theme}
      </p>
      
      <button
        onClick={toggleTheme}
        disabled={isTransitioning}
        className="wf-hover"
        style={{
          padding: 'var(--wf-spacing-sm) var(--wf-spacing-md)',
          borderRadius: 'var(--wf-radius-sm)',
        }}
      >
        Toggle Theme
      </button>
      
      <div className="wf-status-success">
        ✓ System ready
      </div>
    </div>
  );
}
```

## Migration Guide

If you're migrating from the old theme system:

1. Import the new hook: `import { useWorkflowTheme } from '@/hooks/useWorkflowTheme'`
2. Replace old theme variables with new CSS variables (prefixed with `--wf-`)
3. Use utility classes where applicable
4. Update component styles to use the new design tokens
5. Test theme switching and transitions

## Troubleshooting

### Theme not applying
- Ensure `workflow-theme.css` is imported in your app
- Check that the component is wrapped with the theme provider
- Verify CSS variables are being set on the root element

### Transitions not working
- Enable transitions in hook options: `enableTransitions: true`
- Check that elements have the `wf-theme-transition` class

### Theme not persisting
- Enable persistence: `persistTheme: true`
- Check localStorage permissions
- Verify browser supports localStorage

## Performance Considerations

- CSS variables are highly performant for theme switching
- Theme transitions use GPU-accelerated properties
- Layout calculations are memoized
- System theme watching is debounced
- LocalStorage operations are wrapped in try-catch

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Variables support required
- LocalStorage support required
- MediaQuery support for system theme detection
