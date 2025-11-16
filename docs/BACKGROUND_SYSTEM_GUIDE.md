# Background System Implementation Guide

## Overview

The Background System provides a modern, animated background for the application with three main components:
1. **Dynamic Gradient Background** - Smooth color transitions
2. **Animated Grid** - Subtle moving grid pattern
3. **Floating Glows** - Soft, animated light effects

## Requirements Addressed

- **Requirement 1.1**: Dynamic gradient background for light and dark themes
- **Requirement 1.2**: Animated grid and glow effects
- **Requirement 1.3**: Smooth animations that don't affect readability

## Components

### 1. BackgroundSystem (Main Component)

The main component that combines all background effects.

```tsx
import { BackgroundSystem } from '@/components/BackgroundSystem';

// In your layout or page
<BackgroundSystem showGrid showGlows />
```

**Props:**
- `showGrid` (boolean): Enable/disable grid animation (default: true)
- `showGlows` (boolean): Enable/disable floating glows (default: true)
- `className` (string): Additional CSS classes

### 2. AnimatedGrid

Provides an animated grid background with dual-layer depth effect.

```tsx
import { AnimatedGrid } from '@/components/AnimatedGrid';

<AnimatedGrid />
```

**Features:**
- Primary grid: 50px spacing, 20s animation
- Secondary grid: 100px spacing, 30s reverse animation
- Theme-aware opacity
- Respects `prefers-reduced-motion`

### 3. FloatingGlow

Individual floating glow effect with customizable properties.

```tsx
import { FloatingGlow } from '@/components/FloatingGlow';

<FloatingGlow
  position="top-left"
  size={600}
  color={{ r: 59, g: 130, b: 246 }}
  opacity={0.15}
  duration={15}
  blur={60}
/>
```

**Props:**
- `position`: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
- `size`: Size in pixels (default: 600)
- `color`: RGB color object (default: blue)
- `opacity`: 0-1 (default: 0.15)
- `duration`: Animation duration in seconds (default: 15)
- `blur`: Blur amount in pixels (default: 60)

### 4. FloatingGlowGroup

Pre-configured group of three floating glows.

```tsx
import { FloatingGlowGroup } from '@/components/FloatingGlow';

<FloatingGlowGroup />
```

## Global CSS Styles

The background gradient is defined in `styles/globals.css`:

### Light Theme
```css
body {
  background: linear-gradient(135deg, 
    #f0f9ff 0%,    /* Light blue */
    #e0f2fe 25%,   /* Sky blue */
    #f0f9ff 50%,   /* Light blue */
    #dbeafe 75%,   /* Blue white */
    #f0f9ff 100%   /* Light blue */
  );
  background-attachment: fixed;
  background-size: 400% 400%;
}
```

### Dark Theme
```css
.dark body {
  background: linear-gradient(135deg,
    #0f172a 0%,    /* Deep blue-black */
    #1e293b 25%,   /* Deep gray-blue */
    #0f172a 50%,   /* Deep blue-black */
    #1e1b4b 75%,   /* Deep purple-blue */
    #0f172a 100%   /* Deep blue-black */
  );
}
```

## Integration

### Option 1: Add to Layout (Recommended)

Add the BackgroundSystem to your root layout:

```tsx
// app/layout.tsx
import { BackgroundSystem } from '@/components/BackgroundSystem';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <BackgroundSystem showGrid showGlows />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Option 2: Add to Specific Pages

Add to individual pages that need the effect:

```tsx
// app/page.tsx
import { BackgroundSystem } from '@/components/BackgroundSystem';

export default function Page() {
  return (
    <>
      <BackgroundSystem />
      <main>
        {/* Your content */}
      </main>
    </>
  );
}
```

### Option 3: Use Individual Components

Mix and match components as needed:

```tsx
import { AnimatedGrid } from '@/components/AnimatedGrid';
import { FloatingGlow } from '@/components/FloatingGlow';

export default function CustomPage() {
  return (
    <>
      <AnimatedGrid />
      <FloatingGlow position="center" size={800} />
      <main>
        {/* Your content */}
      </main>
    </>
  );
}
```

## Customization

### Adjusting Grid Opacity

Edit `AnimatedGrid.tsx`:

```tsx
// Light theme
background-image: 
  linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
  //                                    ^^^^ Adjust this value

// Dark theme
background-image: 
  linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
  //                                    ^^^^ Adjust this value
```

### Adjusting Animation Speed

Edit animation duration:

```css
animation: grid-move 20s linear infinite;
//                   ^^^ Adjust duration
```

### Adding More Glows

In `FloatingGlowGroup.tsx`, add more `FloatingGlow` components:

```tsx
<FloatingGlow
  position="bottom-left"
  size={400}
  color={{ r: 16, g: 185, b: 129 }} // Green
  opacity={0.1}
  duration={22}
  blur={55}
/>
```

## Performance Considerations

1. **Hardware Acceleration**: All animations use `transform` and `opacity` for GPU acceleration
2. **Fixed Positioning**: Background elements use `position: fixed` to avoid repaints
3. **Pointer Events**: All background elements have `pointer-events: none`
4. **Reduced Motion**: Respects `prefers-reduced-motion` user preference

## Accessibility

- **Contrast**: Background doesn't interfere with text readability
- **Reduced Motion**: Animations disabled when user prefers reduced motion
- **Theme Support**: Fully supports light and dark themes
- **No Interaction**: Background is non-interactive (pointer-events: none)

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Troubleshooting

### Background not showing
- Check that `body` has no conflicting background styles
- Ensure z-index hierarchy is correct
- Verify component is rendered in the DOM

### Animations not smooth
- Check browser hardware acceleration is enabled
- Reduce blur amount for better performance
- Disable secondary grid layer if needed

### Dark theme not working
- Ensure `.dark` class is applied to `<html>` or `<body>`
- Check theme provider is configured correctly
- Verify CSS specificity isn't being overridden

## Examples

### Minimal Setup
```tsx
<BackgroundSystem showGrid={false} showGlows />
```

### Grid Only
```tsx
<BackgroundSystem showGrid showGlows={false} />
```

### Custom Glow Configuration
```tsx
<div className="fixed inset-0 pointer-events-none z-0">
  <FloatingGlow position="center" size={1000} opacity={0.2} />
</div>
```

## Related Files

- `styles/globals.css` - Global background styles
- `components/BackgroundSystem.tsx` - Main component
- `components/AnimatedGrid.tsx` - Grid animation
- `components/FloatingGlow.tsx` - Glow effects
- `components/BackgroundEffects.tsx` - Alternative implementation

## Next Steps

After implementing the background system:
1. Test in both light and dark themes
2. Verify performance on lower-end devices
3. Check accessibility with screen readers
4. Test with `prefers-reduced-motion` enabled
5. Proceed to Task 2: Card and Panel Visual Enhancement
