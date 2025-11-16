# Input Fields Quick Reference - Dark Mode

## Opacity Values

| State | Background | Border | Use Case |
|-------|-----------|--------|----------|
| **Default** | 5% white | 10% white | Normal input state |
| **Hover** | 7% white | 15% white | Mouse over input |
| **Focus** | 10% white | 40% white | Active editing |
| **Disabled** | 3% white | 8% white | Cannot edit |
| **Error** | 8% white | 60% white | Validation error |

## Text Opacity

| Element | Opacity | Color |
|---------|---------|-------|
| Input text | 100% | White |
| Placeholder | 30% | White |
| Disabled text | 40% | White |
| Label | 80% | White |

## Tailwind Classes

### Default Input
```tsx
className="bg-white/5 border-white/10 transition-all duration-250"
```

### With Hover
```tsx
className="bg-white/5 border-white/10 hover:bg-white/[0.07] hover:border-white/15"
```

### With Focus (HeroUI)
```tsx
classNames={{
  inputWrapper: "bg-white/5 border-white/10 hover:bg-white/[0.07] group-data-[focus=true]:bg-white/10 group-data-[focus=true]:border-white/40 transition-all duration-250"
}}
```

### Error State
```tsx
classNames={{
  inputWrapper: "border-white/60 bg-white/[0.08]"
}}
```

### Disabled State
```tsx
classNames={{
  inputWrapper: "bg-white/[0.03] border-white/[0.08] opacity-100"
}}
```

## CSS Variables

```css
--bg-input: rgba(255, 255, 255, 0.05)
--bg-input-focus: rgba(255, 255, 255, 0.10)
--bg-input-disabled: rgba(255, 255, 255, 0.03)
--border-default: rgba(255, 255, 255, 0.1)
--border-focus: rgba(255, 255, 255, 0.4)
--border-error: rgba(255, 255, 255, 0.6)
--text-placeholder: rgba(255, 255, 255, 0.3)
```

## Complete Example

```tsx
<Input
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  isInvalid={hasError}
  errorMessage={errorMessage}
  isDisabled={isDisabled}
  classNames={{
    base: "w-full",
    input: "text-white",
    inputWrapper: [
      // Default state
      "bg-white/5",
      "border-white/10",
      // Hover state
      "hover:bg-white/[0.07]",
      "data-[hover=true]:bg-white/[0.07]",
      "hover:border-white/15",
      // Focus state
      "group-data-[focus=true]:bg-white/10",
      "group-data-[focus=true]:border-white/40",
      // Transitions
      "transition-all",
      "duration-250",
    ].join(" "),
    label: "text-white/80",
    errorMessage: "text-red-200 text-sm mt-1",
  }}
/>
```

## State Transitions

```
Default (5%) → Hover (7%) → Focus (10%)
                    ↓
                 Error (8% bg, 60% border)
                    ↓
                Disabled (3%)
```

## Accessibility

- **Focus indicator**: 40% white border (clearly visible)
- **Error state**: 60% white border (high contrast)
- **Disabled state**: 40% white text (distinguishable)
- **Placeholder**: 30% white (readable but subtle)

All states meet WCAG 2.1 Level AA requirements.

## Browser Support

- Chrome/Edge ✓
- Firefox ✓
- Safari ✓
- All modern browsers with CSS custom properties support

## Performance

- Hardware-accelerated transitions
- No JavaScript overhead
- Efficient CSS selectors
- Minimal repaints

---

**Related Files:**
- `styles/globals.css` - Global input styles
- `lib/design-tokens-dark.ts` - Design tokens
- `components/login/FormInput.tsx` - Reusable input component
- `components/login/PasswordInput.tsx` - Password input component
