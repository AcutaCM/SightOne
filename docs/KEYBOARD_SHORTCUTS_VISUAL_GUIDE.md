# Keyboard Shortcuts System - Visual Guide

## 🎨 Component Overview

### Shortcuts Help Panel

```
┌─────────────────────────────────────────────────────────┐
│  ⌨️ Keyboard Shortcuts                            ✕     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔍 [Search shortcuts...]                              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ All (45) │ General (8) │ Canvas (6) │ Nodes (12)│  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ ⚡ General                              8 shortcuts│  │
│  ├─────────────────────────────────────────────────┤  │
│  │  Save workflow                    Ctrl + S       │  │
│  │  Load workflow                    Ctrl + O       │  │
│  │  Export workflow                  Ctrl+Shift+E   │  │
│  │  Show keyboard shortcuts          Shift + ?      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 🎨 Canvas                           6 shortcuts  │  │
│  ├─────────────────────────────────────────────────┤  │
│  │  Zoom in                          Ctrl + +       │  │
│  │  Zoom out                         Ctrl + -       │  │
│  │  Zoom to fit                      Ctrl + 0       │  │
│  │  Reset view                       Ctrl + R       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Press ? or Shift + ? to toggle this panel    [Close]  │
└─────────────────────────────────────────────────────────┘
```

### Shortcuts Help Button

```
┌──────────────────────────────────────┐
│  Toolbar                             │
│  ┌────┐ ┌────┐ ┌────┐ ┌──────────┐ │
│  │Save│ │Load│ │Run │ │⌨️Shortcuts│ │
│  └────┘ └────┘ └────┘ └──────────┘ │
└──────────────────────────────────────┘
```

## 🎯 Key Visual Elements

### 1. Shortcut Key Display

```
┌─────────────────────────────────┐
│  Save workflow    [Ctrl][+][S]  │
└─────────────────────────────────┘
```

**Features:**
- Rounded key badges
- Platform-specific symbols (⌘ on Mac)
- Clear separation with + symbol
- Monospace font for keys

### 2. Category Tabs

```
┌────────────────────────────────────────────────┐
│ [All (45)] [General (8)] [Canvas (6)] [Nodes] │
└────────────────────────────────────────────────┘
```

**Features:**
- Badge showing count
- Active tab highlighted
- Smooth transition animation
- Responsive layout

### 3. Shortcut Group Card

```
┌─────────────────────────────────────────┐
│ ⚡ General                  8 shortcuts  │
├─────────────────────────────────────────┤
│  Save workflow          [Ctrl][+][S]    │
│  Load workflow          [Ctrl][+][O]    │
│  Export workflow        [Ctrl][Shift][E]│
└─────────────────────────────────────────┘
```

**Features:**
- Icon for category
- Count badge
- Hover effect on items
- Slide-in animation

### 4. Search Bar

```
┌─────────────────────────────────────┐
│  🔍 Search shortcuts...         ✕   │
└─────────────────────────────────────┘
```

**Features:**
- Search icon
- Clear button
- Real-time filtering
- Placeholder text

### 5. Empty State

```
┌─────────────────────────────────────┐
│                                     │
│           ⌨️                        │
│                                     │
│   No shortcuts found for "xyz"     │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Large icon
- Helpful message
- Centered layout
- Subtle styling

## 🎨 Color Scheme

### Light Theme

```css
Background:     #ffffff
Border:         #e2e8f0
Text Primary:   #0f172a
Text Secondary: #64748b
Primary:        #3b82f6
Hover:          #f1f5f9
Badge:          #f8fafc
```

### Dark Theme

```css
Background:     #111827
Border:         #1f2937
Text Primary:   #f1f5f9
Text Secondary: #94a3b8
Primary:        #3b82f6
Hover:          rgba(255,255,255,0.06)
Badge:          rgba(255,255,255,0.1)
```

## 📐 Layout Specifications

### Modal Dimensions

```
Desktop:  800px × 600px (max 90vh)
Tablet:   90vw × 80vh
Mobile:   95vw × 85vh
```

### Spacing

```
Panel Padding:      24px
Section Gap:        24px
Item Gap:           12px
Key Badge Padding:  4px 8px
```

### Typography

```
Modal Title:        24px / 600 weight
Group Title:        18px / 600 weight
Shortcut Text:      14px / 500 weight
Key Badge:          12px / 600 weight / monospace
```

### Border Radius

```
Modal:          16px
Card:           12px
Tab:            8px
Key Badge:      6px
Badge:          12px
```

## 🎬 Animations

### Modal Open/Close

```
Duration:   300ms
Easing:     cubic-bezier(0.4, 0, 0.2, 1)
Transform:  scale(0.95) → scale(1)
Opacity:    0 → 1
```

### Card Slide-In

```
Duration:   300ms
Easing:     ease
Transform:  translateY(-10px) → translateY(0)
Opacity:    0 → 1
Stagger:    50ms per card
```

### Shortcut Item Hover

```
Duration:   200ms
Easing:     ease
Transform:  translateX(0) → translateX(4px)
Background: default → hover color
```

### Tab Switch

```
Duration:   200ms
Easing:     ease
Transform:  Cursor slides to active tab
```

## 📱 Responsive Breakpoints

### Desktop (>1024px)

```
┌─────────────────────────────────────────┐
│  Full modal with all features           │
│  3-column tab layout                    │
│  Side-by-side shortcut display          │
└─────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

```
┌───────────────────────────────┐
│  Adjusted modal size          │
│  2-column tab layout          │
│  Reduced padding              │
└───────────────────────────────┘
```

### Mobile (<768px)

```
┌─────────────────────┐
│  Full screen modal  │
│  Stacked layout     │
│  Larger touch areas │
│  Vertical shortcuts │
└─────────────────────┘
```

## 🎯 Interactive States

### Button States

```
Default:  Normal appearance
Hover:    Slight lift + shadow
Active:   Pressed down
Focus:    Blue outline ring
Disabled: Reduced opacity
```

### Shortcut Item States

```
Default:  Normal background
Hover:    Highlighted + slide right
Active:   Pressed appearance
```

### Tab States

```
Inactive: Gray text
Active:   Primary color + background
Hover:    Light background
```

## 🔍 Search Behavior

### Search Flow

```
1. User types in search box
   ↓
2. Filter shortcuts by:
   - Description text
   - Key combination
   ↓
3. Update groups display
   ↓
4. Show/hide empty state
```

### Search Results

```
┌─────────────────────────────────────┐
│  🔍 "save"                          │
├─────────────────────────────────────┤
│  ⚡ General                          │
│  Save workflow          [Ctrl][S]   │
│                                     │
│  🔄 Workflow                        │
│  Save workflow as...    [Ctrl][Shift][S] │
└─────────────────────────────────────┘
```

## 🎨 Platform Differences

### macOS

```
Ctrl → ⌘ (Command)
Alt  → ⌥ (Option)
Shift → ⇧
```

### Windows/Linux

```
Ctrl → Ctrl
Alt  → Alt
Shift → Shift
```

## 💡 Usage Examples

### In Toolbar

```typescript
<div className="toolbar">
  <Button>Save</Button>
  <Button>Load</Button>
  <ShortcutsHelpButton variant="light" />
</div>
```

### Floating Button

```typescript
<div className="floating-actions">
  <ShortcutsHelpButton 
    variant="shadow" 
    isIconOnly 
  />
</div>
```

### In Settings Panel

```typescript
<div className="settings">
  <h3>Help & Support</h3>
  <ShortcutsHelpButton 
    variant="bordered" 
    size="lg"
  />
</div>
```

## 🎯 Accessibility Features

### Keyboard Navigation

```
Tab       → Navigate between elements
Enter     → Activate button/tab
Escape    → Close modal
Arrow Keys → Navigate tabs
```

### Screen Reader

```
- Modal has aria-label
- Shortcuts have aria-describedby
- Search has aria-label
- Tabs have aria-selected
```

### Focus Management

```
1. Open modal → Focus search input
2. Close modal → Return focus to trigger
3. Tab trap within modal
4. Visible focus indicators
```

## 🎨 Customization

### Theme Variables

```css
/* Override in your CSS */
.shortcutsPanel {
  --shortcut-primary: #your-color;
  --shortcut-bg: #your-bg;
  --shortcut-border: #your-border;
}
```

### Custom Styling

```typescript
<ShortcutsHelpButton 
  className="custom-shortcuts-btn"
  variant="solid"
  size="lg"
/>
```

## 📊 Performance

### Optimization Techniques

1. **Virtual Scrolling**: For large shortcut lists
2. **Memoization**: Cached shortcut groups
3. **Debounced Search**: 300ms delay
4. **Lazy Loading**: Modal content loaded on demand

### Metrics

```
Initial Load:    < 100ms
Search Response: < 50ms
Modal Open:      < 300ms
Render Time:     < 16ms (60fps)
```

## 🎉 Best Practices

1. **Consistent Placement**: Always in same location
2. **Clear Labeling**: "Shortcuts" or keyboard icon
3. **Tooltip Support**: Explain what button does
4. **Responsive Design**: Works on all devices
5. **Accessible**: Keyboard and screen reader friendly

## 📚 Related Components

- [Workflow Canvas](./WORKFLOW_CANVAS_QUICK_REFERENCE.md)
- [Control Panel](./CONTROL_PANEL_QUICK_REFERENCE.md)
- [Node Editor](./NODE_EDITOR_IMPLEMENTATION.md)
- [Accessibility Guide](./WORKFLOW_ACCESSIBILITY_GUIDE.md)
