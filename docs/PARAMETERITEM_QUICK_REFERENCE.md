# ParameterItem Component - Quick Reference

## Import
```tsx
import ParameterItem from '@/components/workflow/ParameterItem';
```

## Basic Usage
```tsx
<ParameterItem
  parameter={{
    name: 'speed',
    label: '速度',
    type: 'number',
    defaultValue: 50,
    description: '无人机飞行速度',
    required: true
  }}
  value={75}
  onChange={(newValue) => handleChange(newValue)}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `parameter` | `NodeParameter` | ✅ | Parameter definition |
| `value` | `any` | ✅ | Current parameter value |
| `onChange` | `(value: any) => void` | ✅ | Value change handler |
| `error` | `string` | ❌ | Error message to display |
| `isCompact` | `boolean` | ❌ | Use compact layout (default: false) |

## Parameter Types

### Text
```tsx
parameter={{
  type: 'string',
  label: '名称',
  defaultValue: '默认名称'
}}
```

### Number
```tsx
parameter={{
  type: 'number',
  label: '高度',
  defaultValue: 100,
  unit: '米'  // Optional unit
}}
```

### Boolean
```tsx
parameter={{
  type: 'boolean',
  label: '启用',
  defaultValue: true
}}
```

### Select
```tsx
parameter={{
  type: 'select',
  label: '模式',
  defaultValue: 'auto',
  options: [
    { value: 'auto', label: '自动' },
    { value: 'manual', label: '手动' }
  ]
}}
```

### Textarea
```tsx
parameter={{
  type: 'textarea',
  label: '描述',
  defaultValue: ''
}}
```

### Slider
```tsx
parameter={{
  type: 'slider',
  label: '速度',
  defaultValue: 50,
  min: 0,
  max: 100,
  step: 5
}}
```

## States

### Default
- Light gray background
- Medium gray border
- Clickable

### Hover
- Darker background
- Darker border
- Subtle lift effect

### Editing
- Darkest background
- Dark border
- Pulsing glow effect
- Input field visible

### Saving
- Spinning loader icon
- Slightly transparent

### Success
- Check icon
- Pulse animation
- Auto-hide after 600ms

### Error
- Red border (only colored element!)
- Light red background
- Shake animation
- Error message with icon

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Click` | Enter edit mode |
| `Enter` | Save changes |
| `Escape` | Cancel editing |
| `Tab` | Next parameter |

## Animations

| Animation | Trigger | Duration |
|-----------|---------|----------|
| Editing Glow | While editing | 2s (infinite) |
| Save Pulse | After save | 600ms |
| Error Shake | On validation error | 500ms |
| Error Slide | Error message | 300ms |

## CSS Variables

### Light Theme
```css
--param-bg: #F8F8F8
--param-bg-hover: #F0F0F0
--param-bg-editing: #E8E8E8
--param-bg-error: #FEE
--param-border: #E0E0E0
--param-border-hover: #D0D0D0
--param-border-editing: #999999
--param-editing-glow: rgba(0, 0, 0, 0.08)
--text-primary: #1A1A1A
--text-secondary: #666666
--text-tertiary: #999999
--error-color: #DC2626
--success-color: #333333
```

### Dark Theme
```css
--param-bg: #242424
--param-bg-hover: #2E2E2E
--param-bg-editing: #383838
--param-bg-error: rgba(220, 38, 38, 0.1)
--param-border: #3A3A3A
--param-border-hover: #4A4A4A
--param-border-editing: #666666
--param-editing-glow: rgba(255, 255, 255, 0.08)
--text-primary: #E5E5E5
--text-secondary: #999999
--text-tertiary: #666666
--error-color: #EF4444
--success-color: #CCCCCC
```

## Common Patterns

### With Validation
```tsx
const [error, setError] = useState<string>();

const handleChange = (value: any) => {
  if (value < 0) {
    setError('值必须大于0');
    return;
  }
  setError(undefined);
  updateParameter(value);
};

<ParameterItem
  parameter={param}
  value={value}
  onChange={handleChange}
  error={error}
/>
```

### Compact Mode
```tsx
<ParameterItem
  parameter={param}
  value={value}
  onChange={handleChange}
  isCompact={true}
/>
```

### With Tooltip
```tsx
// Tooltip automatically shows if parameter has description
parameter={{
  name: 'speed',
  label: '速度',
  description: '无人机的飞行速度，单位为米/秒',
  type: 'number'
}}
```

## Styling

### Custom Styles
```tsx
// Use CSS modules
import styles from './MyComponent.module.css';

<div className={styles.myContainer}>
  <ParameterItem {...props} />
</div>
```

### Override Theme
```css
/* In your global CSS or component CSS */
:root {
  --param-bg: #F5F5F5;  /* Custom background */
  --param-border: #DDDDDD;  /* Custom border */
}
```

## Accessibility

### ARIA
- Automatic `role="button"` on container
- `tabIndex={0}` for keyboard navigation
- `title` on required indicator

### Focus
- Clear focus indicators
- Keyboard navigation support
- Focus trap in edit mode

### Screen Readers
- Descriptive labels
- Error announcements
- Status updates

## Performance Tips

1. **Memoize onChange**
   ```tsx
   const handleChange = useCallback((value) => {
     updateValue(value);
   }, [updateValue]);
   ```

2. **Avoid Unnecessary Re-renders**
   ```tsx
   const MemoizedParameterItem = React.memo(ParameterItem);
   ```

3. **Batch Updates**
   ```tsx
   // Update multiple parameters at once
   const handleBatchUpdate = (updates) => {
     setParameters(prev => ({ ...prev, ...updates }));
   };
   ```

## Troubleshooting

### Value Not Updating
- Check if `onChange` is called
- Verify parent component updates state
- Check for controlled vs uncontrolled issues

### Animation Not Working
- Verify CSS variables are defined
- Check browser support
- Ensure Framer Motion is installed

### Tooltip Not Showing
- Verify parameter has `description`
- Check HeroUI Tooltip is imported
- Ensure not in editing mode

### Styling Issues
- Check CSS module import
- Verify CSS variables in globals.css
- Check theme provider is wrapping component

## Related Documentation

- [ParameterItem Visual Guide](./PARAMETERITEM_VISUAL_GUIDE.md)
- [ParameterItem Verification Report](./TASK_5_PARAMETERITEM_VERIFICATION.md)
- [Workflow Theme System](../lib/workflow/workflowTheme.ts)
- [Parameter Editors](../components/workflow/editors/)

## Examples

### Complete Example
```tsx
import { useState } from 'react';
import ParameterItem from '@/components/workflow/ParameterItem';

function MyComponent() {
  const [speed, setSpeed] = useState(50);
  const [error, setError] = useState<string>();

  const handleSpeedChange = (value: number) => {
    if (value < 0 || value > 100) {
      setError('速度必须在0-100之间');
      return;
    }
    setError(undefined);
    setSpeed(value);
  };

  return (
    <ParameterItem
      parameter={{
        name: 'speed',
        label: '飞行速度',
        type: 'number',
        defaultValue: 50,
        description: '无人机的飞行速度（米/秒）',
        required: true,
        unit: 'm/s'
      }}
      value={speed}
      onChange={handleSpeedChange}
      error={error}
    />
  );
}
```

---

**Version:** 2.0  
**Last Updated:** 2025-01-22  
**Component:** ParameterItem
