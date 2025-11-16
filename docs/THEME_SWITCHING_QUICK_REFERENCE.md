# Theme Switching Quick Reference

## Quick Start

### 1. Use Theme in Component

```typescript
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

function MyComponent() {
  const theme = useWorkflowTheme();
  
  return (
    <div style={{ 
      background: theme.node.bg,
      color: theme.text.primary 
    }}>
      Content
    </div>
  );
}
```

### 2. Check Theme Mode

```typescript
import { isDarkTheme } from '@/lib/workflow/workflowTheme';

if (isDarkTheme()) {
  // Dark mode logic
}
```

### 3. Get CSS Variable with Fallback

```typescript
import { getCSSVariable } from '@/lib/workflow/workflowTheme';

const color = getCSSVariable('--node-bg', '#FFFFFF');
```

## Theme Object Structure

```typescript
{
  node: {
    bg, border, borderHover, selected, selectedGlow, divider, headerBg
  },
  shadow: {
    base, hover, selected
  },
  parameter: {
    bg, bgHover, bgEditing, bgError,
    border, borderHover, borderEditing, editingGlow
  },
  text: {
    primary, secondary, tertiary
  },
  status: {
    error, success, warning, info
  },
  scrollbar: {
    track, thumb, thumbHover
  }
}
```

## Common Patterns

### Hover State

```typescript
const [isHovered, setIsHovered] = useState(false);

<div style={{
  background: isHovered ? theme.parameter.bgHover : theme.parameter.bg
}}>
```

### Editing State

```typescript
const [isEditing, setIsEditing] = useState(false);

<input style={{
  background: isEditing ? theme.parameter.bgEditing : theme.parameter.bg,
  border: `1px solid ${isEditing ? theme.parameter.borderEditing : theme.parameter.border}`,
  boxShadow: isEditing ? `0 0 0 3px ${theme.parameter.editingGlow}` : 'none'
}} />
```

### Error State

```typescript
<div style={{
  background: hasError ? theme.parameter.bgError : theme.parameter.bg,
  borderColor: hasError ? theme.status.error : theme.parameter.border
}}>
```

## Debugging

```typescript
import { debugTheme, validateThemeVariables } from '@/lib/workflow/workflowTheme';

// Print theme info
debugTheme();

// Validate CSS variables
const validation = validateThemeVariables();
console.log(validation);
```

## CSS Classes with Theme Support

All these classes automatically transition on theme change:

- `.node-header`
- `[class*="parameterItem"]`
- `[class*="parameterList"]`
- `[class*="InlineParameterNode"]`
- `input`, `textarea`, `select`
- `button`, `[role="button"]`

## Transition Duration

All theme transitions use: `200ms cubic-bezier(0.4, 0, 0.2, 1)`

## Requirements Covered

- ✅ 10.1: Theme change detection (MutationObserver)
- ✅ 10.2: 200ms color transitions
- ✅ 10.3: Component state preservation
- ✅ 10.4: Smooth theme switching
- ✅ 10.5: CSS variable fallbacks

## Testing

```typescript
import { renderHook } from '@testing-library/react';
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

test('theme updates', () => {
  const { result } = renderHook(() => useWorkflowTheme());
  expect(result.current).toHaveProperty('node');
});
```
