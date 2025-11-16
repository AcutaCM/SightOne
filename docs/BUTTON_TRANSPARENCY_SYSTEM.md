# Button Transparency System - Quick Reference

## Overview

The button transparency system implements a three-tier hierarchy using white opacity levels on a pure black background. This creates a modern, elegant interface where button importance is conveyed through transparency rather than color.

## Button Hierarchy

### Primary Buttons (100% White Opacity)
**Use for:** Main actions, submit buttons, primary CTAs

**Variants:**
- `variant="solid"` (default)
- `color="primary"`
- `color="success"`

**Visual:**
- Background: `rgba(255, 255, 255, 1.0)` - Pure white
- Text: `rgba(0, 0, 0, 1.0)` - Black text for contrast
- Hover: Maintains 100% opacity with subtle lift effect

**Example:**
```tsx
<Button color="primary">Submit</Button>
<Button variant="solid">Save Changes</Button>
```

### Secondary Buttons (20% White Opacity)
**Use for:** Secondary actions, alternative options, less prominent actions

**Variants:**
- `variant="flat"`
- `variant="bordered"`

**Visual:**
- Background: `rgba(255, 255, 255, 0.2)` - 20% white
- Text: `rgba(255, 255, 255, 1.0)` - White text
- Border: `rgba(255, 255, 255, 0.1)` - 10% white
- Hover: `rgba(255, 255, 255, 0.3)` - 30% white

**Example:**
```tsx
<Button variant="flat">Cancel</Button>
<Button variant="bordered">View Details</Button>
```

### Tertiary Buttons (10% White Opacity)
**Use for:** Subtle actions, ghost buttons, minimal emphasis

**Variants:**
- `variant="light"`
- `variant="ghost"`

**Visual:**
- Background: `rgba(255, 255, 255, 0.1)` - 10% white
- Text: `rgba(255, 255, 255, 1.0)` - White text
- Border: Transparent (shows on hover)
- Hover: `rgba(255, 255, 255, 0.2)` - 20% white

**Example:**
```tsx
<Button variant="light">Learn More</Button>
<Button variant="ghost">Skip</Button>
```

## Special Button States

### Danger Buttons
**Use for:** Destructive actions, delete operations

```tsx
<Button color="danger">Delete</Button>
<Button color="danger" variant="light">Remove</Button>
```

- Solid danger: `rgba(255, 255, 255, 0.9)` - 90% white
- Light danger: `rgba(255, 255, 255, 0.15)` with error border

### Disabled Buttons
**Automatically applied when disabled**

```tsx
<Button disabled>Disabled</Button>
<Button isDisabled>Also Disabled</Button>
```

- Background: `rgba(255, 255, 255, 0.03)` - 3% white
- Text: `rgba(255, 255, 255, 0.4)` - 40% white

### Loading Buttons
**Automatically applied during loading state**

```tsx
<Button isLoading>Processing...</Button>
```

- Opacity: `0.6` (60%)
- Cursor: `wait`

### Icon-Only Buttons
**For toolbar and compact interfaces**

```tsx
<Button isIconOnly><Icon /></Button>
```

- Background: `rgba(255, 255, 255, 0.1)` - 10% white
- Hover: `rgba(255, 255, 255, 0.2)` - 20% white

## Utility Classes

For custom button implementations or non-HeroUI buttons:

```tsx
// Primary button
<button className="btn-primary-dark">Custom Primary</button>

// Secondary button
<button className="btn-secondary-dark">Custom Secondary</button>

// Tertiary button
<button className="btn-tertiary-dark">Custom Tertiary</button>
```

## Transitions

All buttons include smooth transitions:
- Duration: `250ms` (normal)
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Properties: `background-color`, `border-color`, `transform`

## Hover Effects

All buttons include a subtle lift effect on hover:
```css
transform: translateY(-1px);
```

This creates depth without using shadows (which are removed in the dark mode redesign).

## CSS Variables Reference

```css
/* Primary Buttons */
--btn-primary: rgba(255, 255, 255, 1.0);
--btn-primary-hover: rgba(255, 255, 255, 1.0);
--btn-primary-text: rgba(0, 0, 0, 1.0);

/* Secondary Buttons */
--btn-secondary: rgba(255, 255, 255, 0.2);
--btn-secondary-hover: rgba(255, 255, 255, 0.3);
--btn-secondary-text: rgba(255, 255, 255, 1.0);

/* Tertiary Buttons */
--btn-tertiary: rgba(255, 255, 255, 0.1);
--btn-tertiary-hover: rgba(255, 255, 255, 0.2);
--btn-tertiary-text: rgba(255, 255, 255, 1.0);
```

## Best Practices

### ✅ Do:
- Use primary buttons for the main action on a page
- Use secondary buttons for alternative or cancel actions
- Use tertiary buttons for subtle, less important actions
- Maintain consistent button hierarchy across the application
- Use the appropriate variant for the button's importance

### ❌ Don't:
- Use multiple primary buttons in the same context
- Mix old button styles with the new transparency system
- Add custom shadows to buttons (removed in dark mode)
- Override opacity values without good reason
- Use colored backgrounds (stick to white transparency)

## Migration Guide

### Old Style:
```tsx
<Button className="bg-blue-600 hover:bg-blue-500">Submit</Button>
```

### New Style:
```tsx
<Button color="primary">Submit</Button>
```

### Old Style:
```tsx
<Button className="bg-gray-800 hover:bg-gray-700">Cancel</Button>
```

### New Style:
```tsx
<Button variant="flat">Cancel</Button>
```

## Accessibility

All button opacity levels meet WCAG AA contrast requirements:
- Primary buttons (white on black): 21:1 ✓
- Secondary buttons (white text on 20% white bg): Sufficient contrast ✓
- Tertiary buttons (white text on 10% white bg): Sufficient contrast ✓

Focus indicators use 40% white opacity for clear visibility during keyboard navigation.

## Requirements Satisfied

- ✅ Requirement 3.1: Primary buttons use 100% white opacity
- ✅ Requirement 3.2: Secondary buttons use 20% white opacity
- ✅ Requirement 3.3: Tertiary buttons use 10% white opacity
- ✅ Requirement 3.4: Smooth opacity transitions on hover
- ✅ Requirement 1.5: No shadow effects
- ✅ Requirement 1.2: No gradients, pure black background

## Testing

To test the button system:

1. **Visual Test**: Check all button variants in dark mode
2. **Hover Test**: Verify smooth transitions and lift effect
3. **Contrast Test**: Ensure text is readable on all button backgrounds
4. **Keyboard Test**: Verify focus indicators are visible
5. **State Test**: Check disabled and loading states

## Support

For questions or issues with the button transparency system, refer to:
- Design tokens: `lib/design-tokens-dark.ts`
- CSS variables: `styles/dark-mode-theme.css`
- Global styles: `styles/globals.css`
- Requirements: `.kiro/specs/dark-mode-redesign/requirements.md`
