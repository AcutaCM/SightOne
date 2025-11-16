# Dark Mode Global Styles - Quick Reference

## Pure Black Background System

### Body Background
```css
/* Dark Mode */
body {
  background: #000000;
}

/* Light Mode */
body:not(.dark) {
  background: #FFFFFF;
}
```

### Layout Component
```tsx
<body className="bg-black">
  {/* Pure black background */}
</body>
```

## No Shadows Policy

All box-shadow effects have been removed. Use transparency for depth instead:

```css
/* ❌ Old Way */
.card {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* ✅ New Way */
.card {
  box-shadow: none;
  background: var(--bg-panel); /* 8% white opacity */
  border: 1px solid var(--border-default); /* 10% white opacity */
}
```

## CSS Custom Properties

### Backgrounds
```css
--bg-primary: #000000;           /* Pure black */
--bg-panel: rgba(255, 255, 255, 0.08);    /* Panels */
--bg-modal: rgba(255, 255, 255, 0.12);    /* Modals */
--bg-dropdown: rgba(255, 255, 255, 0.10); /* Dropdowns */
--bg-input: rgba(255, 255, 255, 0.05);    /* Inputs */
```

### Text
```css
--text-primary: rgba(255, 255, 255, 1.0);   /* 100% */
--text-secondary: rgba(255, 255, 255, 0.7); /* 70% */
--text-tertiary: rgba(255, 255, 255, 0.4);  /* 40% */
--text-placeholder: rgba(255, 255, 255, 0.3); /* 30% */
```

### Buttons
```css
--btn-primary: rgba(255, 255, 255, 1.0);    /* 100% */
--btn-secondary: rgba(255, 255, 255, 0.2);  /* 20% */
--btn-tertiary: rgba(255, 255, 255, 0.1);   /* 10% */
```

### Borders
```css
--border-default: rgba(255, 255, 255, 0.1);  /* 10% */
--border-subtle: rgba(255, 255, 255, 0.08);  /* 8% */
--border-focus: rgba(255, 255, 255, 0.4);    /* 40% */
```

### Workflow
```css
--workflow-canvas: #000000;                    /* Pure black */
--workflow-node: rgba(255, 255, 255, 0.08);   /* 8% */
--workflow-edge: rgba(255, 255, 255, 0.3);    /* 30% */
```

## Common Patterns

### Panel Component
```css
.panel {
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  box-shadow: none;
}
```

### Button Component
```css
.button-primary {
  background: var(--btn-primary);
  color: var(--btn-primary-text);
  box-shadow: none;
}

.button-secondary {
  background: var(--btn-secondary);
  color: var(--btn-secondary-text);
  box-shadow: none;
}
```

### Input Component
```css
.input {
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  box-shadow: none;
}

.input:focus {
  background: var(--bg-input-focus);
  border-color: var(--border-focus);
  box-shadow: none;
}
```

### Card Component
```css
.card {
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  box-shadow: none;
}

.card:hover {
  border-color: var(--border-default);
  box-shadow: none;
}
```

## Workflow Components

### Canvas
```css
.react-flow__pane {
  background-color: #000000 !important;
  background-image: none !important;
}
```

### Controls
```css
.react-flow__controls {
  background: var(--bg-panel) !important;
  border: 1px solid var(--border-default) !important;
  box-shadow: none !important;
}
```

### Edges
```css
.react-flow__edge-path {
  stroke: var(--workflow-edge);
}
```

## Migration Examples

### Before (Old Style)
```css
.component {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(59, 130, 246, 0.2);
}
```

### After (New Style)
```css
.component {
  background: var(--bg-panel);
  box-shadow: none;
  border: 1px solid var(--border-default);
}
```

## Key Principles

1. **Pure Black**: Always use #000000 for primary backgrounds
2. **No Gradients**: Use solid colors or transparency
3. **No Shadows**: Use borders and transparency for depth
4. **CSS Variables**: Always use custom properties for consistency
5. **Opacity Hierarchy**: Use defined opacity levels (100%, 70%, 40%, etc.)

## Testing Checklist

- [ ] Background is pure black (#000000)
- [ ] No gradient backgrounds visible
- [ ] No box-shadow effects present
- [ ] CSS custom properties applied
- [ ] Transparency hierarchy maintained
- [ ] Light mode still works correctly
- [ ] All components render properly

## Resources

- Full documentation: `TASK_2_GLOBAL_STYLES_UPDATE_COMPLETE.md`
- Design tokens: `lib/design-tokens-dark.ts`
- CSS variables: `styles/dark-mode-theme.css`
- Requirements: `.kiro/specs/dark-mode-redesign/requirements.md`
- Design: `.kiro/specs/dark-mode-redesign/design.md`
