# ParameterItem Component - Visual Guide

## Overview
This guide demonstrates the visual design and interactions of the redesigned ParameterItem component with black/white/gray minimalist theme.

---

## Component States

### 1. Default State (Light Theme)
```
┌─────────────────────────────────────────┐
│ 参数名称                                │
│ 当前值: 100                             │
└─────────────────────────────────────────┘
```
**Colors:**
- Background: `#F8F8F8` (light gray)
- Border: `#E0E0E0` (medium gray)
- Label: `#666666` (dark gray)
- Value: `#1A1A1A` (near black)

---

### 2. Hover State
```
┌─────────────────────────────────────────┐
│ 参数名称                          ↑     │
│ 当前值: 100                             │
└─────────────────────────────────────────┘
```
**Changes:**
- Background: `#F0F0F0` (darker gray)
- Border: `#D0D0D0` (darker gray)
- Transform: `translateY(-1px)` (subtle lift)
- Cursor: `pointer`

---

### 3. Editing State
```
┌═════════════════════════════════════════┐ ← Pulsing glow
║ 参数名称                          ⟳     ║
║ [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]       ║
└═════════════════════════════════════════┘
```
**Changes:**
- Background: `#E8E8E8` (darker gray)
- Border: `#999999` (dark gray)
- Glow: `0 0 0 3px rgba(0, 0, 0, 0.08)` (pulsing)
- Input visible with white background
- Spinning loader icon (⟳) shown

---

### 4. Save Success State
```
┌─────────────────────────────────────────┐
│ 参数名称                          ✓     │ ← Pulse animation
│ 当前值: 150                             │
└─────────────────────────────────────────┘
```
**Changes:**
- Check icon (✓) appears briefly
- Scale pulse: `1 → 1.02 → 1`
- Border color pulses to success color
- Duration: 600ms

---

### 5. Error State
```
┌─────────────────────────────────────────┐ ← Red border
│ 参数名称                                │
│ 当前值: -999                            │ ← Shake animation
│ ⚠ 值必须大于0                          │ ← Error message
└─────────────────────────────────────────┘
```
**Changes:**
- Border: `#DC2626` (red - only colored element!)
- Background: `#FEE` (light red tint)
- Shake animation: horizontal shake
- Error message slides down with icon
- Auto-hide after 2 seconds

---

### 6. Dark Theme Default
```
┌─────────────────────────────────────────┐
│ 参数名称                                │ (Dark background)
│ 当前值: 100                             │ (Light text)
└─────────────────────────────────────────┘
```
**Colors:**
- Background: `#242424` (dark gray)
- Border: `#3A3A3A` (medium gray)
- Label: `#999999` (light gray)
- Value: `#E5E5E5` (near white)

---

## Interaction Flow

### Click to Edit Flow
```
1. Default State
   ↓ (Click)
2. Editing State (with glow)
   ↓ (Type new value)
3. Saving State (with spinner)
   ↓ (Save complete)
4. Success State (with check)
   ↓ (600ms)
5. Default State (updated value)
```

### Error Flow
```
1. Editing State
   ↓ (Enter invalid value)
2. Error State (shake animation)
   ↓ (Error message appears)
3. Error State (with message)
   ↓ (2 seconds)
4. Error State (message fades)
   ↓ (Fix value)
5. Default State
```

---

## Typography

### Label Text
- Font size: `13px` (0.8125rem)
- Font weight: `500` (medium)
- Color: `#666666` (secondary text)
- Line height: `1.4`

### Value Text
- Font size: `14px` (0.875rem)
- Font weight: `500` (medium) for custom values
- Font style: `italic` for default values
- Color: `#1A1A1A` (primary text)
- Line height: `1.5`

### Number Values
- Font family: `Consolas, Monaco, Courier New, monospace`
- Font variant: `tabular-nums` (aligned digits)

### Error Text
- Font size: `12px` (0.75rem)
- Color: `#EF4444` (red)
- Line height: `1.4`

---

## Spacing

### Container Padding
- Default: `12px` (0.75rem)
- Compact: `8px` (0.5rem)

### Internal Gaps
- Label to value: `8px` (0.5rem)
- Value to error: `4px` (0.25rem)
- Icon to text: `6px` (0.375rem)

### Border Radius
- Container: `8px` (0.5rem)
- Input: `6px` (0.375rem)
- Error message: `6px` (0.375rem)

---

## Animations

### 1. Editing Glow (Infinite Loop)
```css
@keyframes editingGlow {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(0, 0, 0, 0.12);
  }
}
```
- Duration: `2s`
- Easing: `ease-in-out`
- Infinite loop

### 2. Save Success Pulse
```css
@keyframes saveSuccessPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 #333333;
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 4px rgba(51, 51, 51, 0.2);
  }
}
```
- Duration: `600ms`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Plays once

### 3. Error Shake
```css
@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
}
```
- Duration: `500ms`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Plays once

### 4. Error Message Slide Down
```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
    height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    height: auto;
  }
}
```
- Duration: `300ms`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Click` | Enter editing mode |
| `Enter` | Save and exit editing (except textarea) |
| `Escape` | Cancel and revert changes |
| `Tab` | Navigate to next parameter |
| `Shift+Tab` | Navigate to previous parameter |

---

## Tooltip Behavior

### Trigger
- Hover over parameter item (not in editing mode)
- Delay: `500ms`

### Content
- Shows parameter description
- Max width: `300px`
- Font size: `12px`
- Line height: `1.5`

### Styling
- Background: `#FFFFFF` (light) / `#1A1A1A` (dark)
- Border: `1px solid #E5E5E5`
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.15)`
- Border radius: `6px`
- Padding: `8px 12px`

---

## Parameter Types Display

### Text
```
┌─────────────────────────────────────────┐
│ 名称                                    │
│ 无人机控制系统                          │
└─────────────────────────────────────────┘
```

### Number
```
┌─────────────────────────────────────────┐
│ 高度                                    │
│ 150 米                                  │ ← With unit
└─────────────────────────────────────────┘
```

### Boolean
```
┌─────────────────────────────────────────┐
│ 启用自动模式                            │
│ 开启                                    │ ← "开启" or "关闭"
└─────────────────────────────────────────┘
```

### Select
```
┌─────────────────────────────────────────┐
│ 飞行模式                                │
│ 自动巡航                                │ ← Option label
└─────────────────────────────────────────┘
```

### Textarea (Long Text)
```
┌─────────────────────────────────────────┐
│ 描述                                    │
│ 这是一段很长的描述文本，会被截断并...   │
└─────────────────────────────────────────┘
```

### Default Value
```
┌─────────────────────────────────────────┐
│ 超时时间                                │
│ 30 秒                                   │ ← Italic, gray
└─────────────────────────────────────────┘
```

---

## Responsive Behavior

### Mobile (< 640px)
- Reduced padding: `10px`
- Smaller font sizes:
  - Label: `12px`
  - Value: `13px`
  - Error: `11px`
- Touch-friendly tap targets (min 44px)

### Tablet (640px - 1024px)
- Standard sizing
- Optimized for touch

### Desktop (> 1024px)
- Full feature set
- Hover effects enabled
- Keyboard shortcuts

---

## Accessibility Features

### ARIA Attributes
- `role="button"` on container
- `tabIndex={0}` for keyboard navigation
- `title` attribute on required indicator

### Focus Management
- Clear focus indicators
- Focus glow: `0 0 0 3px rgba(0, 0, 0, 0.08)`
- Keyboard navigation support

### Screen Reader Support
- Descriptive labels
- Error announcements
- Status updates

### Color Contrast
- Text on background: > 4.5:1 ratio
- Error text: High contrast red
- Focus indicators: Clear and visible

---

## Usage Example

```tsx
import ParameterItem from '@/components/workflow/ParameterItem';

// Basic usage
<ParameterItem
  parameter={{
    name: 'altitude',
    label: '飞行高度',
    type: 'number',
    defaultValue: 100,
    description: '无人机飞行的目标高度（米）',
    required: true,
    unit: '米'
  }}
  value={150}
  onChange={(newValue) => console.log('New value:', newValue)}
/>

// With error
<ParameterItem
  parameter={...}
  value={-10}
  onChange={...}
  error="值必须大于0"
/>

// Compact mode
<ParameterItem
  parameter={...}
  value={100}
  onChange={...}
  isCompact={true}
/>
```

---

## Design Principles

### 1. Minimalism
- Black/white/gray only (except error red)
- Clean, uncluttered layout
- Essential information only

### 2. Clarity
- Clear visual hierarchy
- Obvious interactive elements
- Immediate feedback

### 3. Consistency
- Uniform spacing
- Consistent animations
- Predictable behavior

### 4. Accessibility
- Keyboard navigation
- Screen reader support
- High contrast

### 5. Performance
- Smooth animations (60fps)
- Efficient re-renders
- Optimized CSS

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Related Components

- **ParameterList**: Container for multiple ParameterItems
- **ParameterEditor**: Input components for different types
- **ParameterDisplay**: Read-only value display
- **InlineParameterNode**: Node containing ParameterItems

---

**Last Updated:** 2025-01-22  
**Component Version:** 2.0  
**Theme:** Black/White/Gray Minimalist
