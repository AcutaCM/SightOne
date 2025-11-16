# Workflow Theme Switching Guide

## Overview

The workflow theme system now supports automatic theme switching with smooth color transitions. When users switch between light and dark modes, all workflow components will automatically update their colors with a 200ms transition animation.

## Features

### 1. Automatic Theme Detection (Requirement 10.1)

The system automatically detects theme changes by monitoring the `dark` class on `document.documentElement`:

```typescript
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

function MyComponent() {
  const theme = useWorkflowTheme(); // Automatically updates on theme change
  
  return (
    <div style={{ background: theme.node.bg }}>
      {/* Component content */}
    </div>
  );
}
```

### 2. Smooth Color Transitions (Requirement 10.2)

All color changes are animated with a 200ms cubic-bezier transition:

```css
/* Applied automatically to all workflow components */
transition: 
  background-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
  border-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
  color 200ms cubic-bezier(0.4, 0, 0.2, 1),
  box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

### 3. State Preservation (Requirement 10.3)

Component state is maintained during theme switches:

- Editing state remains active
- Form values are preserved
- Collapsed/expanded states are maintained
- Selection states are preserved

### 4. CSS Variable Fallbacks (Requirement 10.5)

All CSS variables have proper fallback values:

```typescript
// If CSS variable is not defined, fallback is used
const bgColor = getCSSVariable('--node-bg', '#FFFFFF');
```

## API Reference

### `useWorkflowTheme()`

React hook that returns the current theme and automatically updates when theme changes.

```typescript
const theme = useWorkflowTheme();

// Theme structure:
{
  node: {
    bg: string;
    border: string;
    borderHover: string;
    selected: string;
    selectedGlow: string;
    divider: string;
    headerBg: string;
  },
  shadow: {
    base: string;
    hover: string;
    selected: string;
  },
  parameter: {
    bg: string;
    bgHover: string;
    bgEditing: string;
    bgError: string;
    border: string;
    borderHover: string;
    borderEditing: string;
    editingGlow: string;
  },
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  },
  status: {
    error: string;
    success: string;
    warning: string;
    info: string;
  },
  scrollbar: {
    track: string;
    thumb: string;
    thumbHover: string;
  }
}
```

### `getCSSVariable(name: string, fallback: string)`

Get a CSS variable value with fallback:

```typescript
const color = getCSSVariable('--node-bg', '#FFFFFF');
```

### `isDarkTheme()`

Check if dark theme is active:

```typescript
if (isDarkTheme()) {
  // Dark theme specific logic
}
```

### `getCurrentTheme()`

Get the current theme object:

```typescript
const theme = getCurrentTheme();
```

### `validateThemeVariables()`

Validate that all required CSS variables are defined:

```typescript
const validation = validateThemeVariables();

if (!validation.valid) {
  console.warn('Missing variables:', validation.missing);
}
```

### `debugTheme()`

Print theme debug information to console:

```typescript
debugTheme();
// Output:
// 🎨 Workflow Theme Debug Info
//   Current theme mode: Light
//   Current theme: {...}
//   Theme validation: {...}
```

## Usage Examples

### Basic Component with Theme

```typescript
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

function MyNode() {
  const theme = useWorkflowTheme();
  
  return (
    <div style={{
      background: theme.node.bg,
      border: `2px solid ${theme.node.border}`,
      color: theme.text.primary,
    }}>
      Node Content
    </div>
  );
}
```

### Component with Hover States

```typescript
function MyButton() {
  const theme = useWorkflowTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      style={{
        background: isHovered ? theme.parameter.bgHover : theme.parameter.bg,
        border: `1px solid ${theme.parameter.border}`,
        color: theme.text.primary,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      Click Me
    </button>
  );
}
```

### Component with Editing State

```typescript
function MyInput() {
  const theme = useWorkflowTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <input
      style={{
        background: isFocused ? theme.parameter.bgEditing : theme.parameter.bg,
        border: `1px solid ${isFocused ? theme.parameter.borderEditing : theme.parameter.border}`,
        boxShadow: isFocused ? `0 0 0 3px ${theme.parameter.editingGlow}` : 'none',
        color: theme.text.primary,
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}
```

## Testing Theme Switching

### Manual Testing

1. Open the application in a browser
2. Open browser DevTools console
3. Run `debugTheme()` to see current theme info
4. Toggle theme using the theme switcher
5. Observe smooth color transitions
6. Verify component states are preserved

### Automated Testing

```typescript
import { renderHook } from '@testing-library/react';
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

test('theme updates on dark class change', () => {
  const { result, rerender } = renderHook(() => useWorkflowTheme());
  
  const lightTheme = result.current;
  
  // Simulate theme change
  document.documentElement.classList.add('dark');
  rerender();
  
  const darkTheme = result.current;
  
  expect(darkTheme.node.bg).not.toBe(lightTheme.node.bg);
});
```

## Troubleshooting

### Theme Not Updating

If theme doesn't update automatically:

1. Check that `useWorkflowTheme()` is being used
2. Verify CSS variables are defined in `globals.css`
3. Run `validateThemeVariables()` to check for missing variables
4. Check browser console for warnings

### Colors Not Transitioning Smoothly

If colors change abruptly:

1. Verify transition CSS is applied
2. Check that components use theme colors from `useWorkflowTheme()`
3. Ensure no inline styles override transitions

### Fallback Values Not Working

If fallback values aren't used:

1. Check that `getCSSVariable()` is called with proper fallback
2. Verify fallback values match theme defaults
3. Run `debugTheme()` to see which variables are missing

## Performance Considerations

### Optimization Tips

1. **Use `useWorkflowTheme()` at component level**: Don't pass theme down through props
2. **Memoize theme-dependent calculations**: Use `useMemo` for computed styles
3. **Avoid inline style objects**: Define styles outside render when possible
4. **Use CSS classes**: Prefer CSS classes over inline styles for better performance

### Example: Optimized Component

```typescript
function OptimizedNode() {
  const theme = useWorkflowTheme();
  
  // Memoize computed styles
  const nodeStyle = useMemo(() => ({
    background: theme.node.bg,
    border: `2px solid ${theme.node.border}`,
    color: theme.text.primary,
  }), [theme]);
  
  return <div style={nodeStyle}>Content</div>;
}
```

## Migration Guide

### From Old Theme System

If you're migrating from the old theme system:

1. Replace direct CSS variable access with `useWorkflowTheme()`
2. Remove manual theme detection logic
3. Remove custom theme change listeners
4. Update tests to use new theme API

### Before:

```typescript
const bgColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--node-bg');
```

### After:

```typescript
const theme = useWorkflowTheme();
const bgColor = theme.node.bg;
```

## Best Practices

1. **Always use `useWorkflowTheme()`**: Don't access CSS variables directly
2. **Provide fallback values**: Always specify fallback when using `getCSSVariable()`
3. **Test theme switching**: Include theme switching in component tests
4. **Use semantic color names**: Use `theme.text.primary` instead of hardcoded colors
5. **Validate theme variables**: Run `validateThemeVariables()` during development

## Related Documentation

- [Workflow Theme Redesign Requirements](../.kiro/specs/workflow-theme-redesign/requirements.md)
- [Workflow Theme Redesign Design](../.kiro/specs/workflow-theme-redesign/design.md)
- [Theme System Overview](./WORKFLOW_THEME_REDESIGN_PREVIEW.md)
