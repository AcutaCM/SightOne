# Intelligent Agent Market Display - Visual Guide

## 🎨 Component Overview

This guide provides a visual description of the Intelligent Agent market display components.

## 📱 Card Layout

```
┌─────────────────────────────────────────────────────────────┐
│  IntelligentAgentCard                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────┐  🚁 Tello智能代理  [🚀 系统预设]                    │
│  │ 🤖 │                                                       │
│  │    │  专业的无人机自然语言控制助手，让您用简单的中文...  │
│  └────┘                                                       │
│         ⚡ 自然语言控制  🛡️ 安全保障  🌐 中英双语           │
│                                                               │
│         [无人机] [智能控制] [AI] [自然语言]                  │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │  🚀 使用此助理       │  │     查看详情         │         │
│  └──────────────────────┘  └──────────────────────┘         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Card Elements

1. **Emoji Icon** (🤖)
   - Size: 5xl (text-5xl)
   - Position: Left side, flex-shrink-0
   - Purpose: Visual identifier

2. **Title Section**
   - Title: "🚁 Tello智能代理" (text-xl, font-bold)
   - Badge: "🚀 系统预设" (primary color, flat variant)
   - Layout: Horizontal flex with gap

3. **Description**
   - Text: Short description (first 100 chars)
   - Style: text-sm, text-default-600
   - Clamp: 2 lines (line-clamp-2)

4. **Feature Highlights**
   - Icons: Zap (⚡), Shield (🛡️), Globe (🌐)
   - Colors: Warning, Success, Primary
   - Layout: Horizontal flex with gap
   - Size: text-xs

5. **Tags**
   - Display: Up to 4 tags
   - Style: Small chips, flat variant
   - Color: Default gray

6. **Action Buttons**
   - Primary: "使用此助理" (solid, primary color)
   - Secondary: "查看详情" (bordered, default color)
   - Layout: Full width, gap-2

## 🖼️ Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Modal Header                                    [×]         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🤖  🚁 Tello智能代理  [🚀 系统预设]                        │
│      专业的无人机自然语言控制助手                            │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  Modal Body (Scrollable)                                     │
│                                                               │
│  # 🚁 Tello智能代理                                          │
│                                                               │
│  专业的无人机自然语言控制助手，让您用简单的中文或英文...    │
│                                                               │
│  ## ✨ 核心功能                                               │
│                                                               │
│  ### 🎯 自然语言控制                                          │
│  - 支持中文和英文指令                                         │
│  - 智能理解复杂的飞行任务                                     │
│  ...                                                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🚀 准备好开始了吗？                                  │    │
│  │                                                       │    │
│  │ 点击下方按钮立即启用智能代理，开始用自然语言控制...  │    │
│  │                                                       │    │
│  │ [🚀 立即使用]                                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  Modal Footer                                                 │
│                                                               │
│                          [关闭]  [🚀 使用此助理]             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Modal Elements

1. **Header**
   - Emoji: 4xl size
   - Title: 2xl, font-bold
   - Badge: System preset indicator
   - Subtitle: Small, text-default-500
   - Border: Bottom border with divider color

2. **Body**
   - Content: Full markdown description
   - Scroll: Inside scroll behavior
   - Padding: py-6
   - Max height: 90vh

3. **Markdown Styles**
   - H1: text-2xl, font-bold, mt-6, mb-4
   - H2: text-xl, font-bold, mt-5, mb-3
   - H3: text-lg, font-semibold, mt-4, mb-2
   - Paragraphs: mb-3, leading-relaxed
   - Lists: list-disc/decimal, space-y-1
   - Code: Inline (bg-default-100) and block (p-3, rounded-lg)
   - Blockquote: border-l-4, border-primary, pl-4, italic

4. **Quick Action Box**
   - Background: primary-50 (light) / primary-900/20 (dark)
   - Border: primary-200 (light) / primary-800 (dark)
   - Icon: Rocket, primary color
   - Button: Small, primary color

5. **Footer**
   - Border: Top border with divider
   - Buttons: "关闭" (light) and "使用此助理" (primary)
   - Layout: Right-aligned with gap

## 🏠 Market Home Integration

```
┌─────────────────────────────────────────────────────────────┐
│  Market Home                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🚀 智能助理                                                  │
│  AI驱动的专业助理，开箱即用                                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  IntelligentAgentCard                               │    │
│  │  (Full card as shown above)                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ✨ 精选推荐                                    更多 →        │
│  为你精心挑选的优质应用                                       │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  App 1   │  │  App 2   │  │  App 3   │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                               │
│  ⚡ 火爆应用                                    更多 →        │
│  ...                                                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Section Layout

1. **智能助理 Section** (NEW - Top Priority)
   - Icon: Rocket (🚀)
   - Title: "智能助理"
   - Subtitle: "AI驱动的专业助理，开箱即用"
   - Content: IntelligentAgentCard component
   - Position: First section (above 精选推荐)

2. **Spacing**
   - Section gap: space-y-8
   - Header margin: mb-4
   - Content padding: px-4

## 🎨 Color Scheme

### Light Mode
- **Card Background**: hsl(var(--heroui-content2))
- **Card Border**: hsl(var(--heroui-divider))
- **Primary Button**: hsl(var(--heroui-primary))
- **Text**: hsl(var(--heroui-foreground))
- **Muted Text**: hsl(var(--heroui-foreground) / 0.6)
- **Badge Background**: hsl(var(--heroui-primary) / 0.1)

### Dark Mode
- **Card Background**: hsl(var(--heroui-content2))
- **Card Border**: hsl(var(--heroui-divider))
- **Primary Button**: hsl(var(--heroui-primary))
- **Text**: hsl(var(--heroui-foreground))
- **Muted Text**: hsl(var(--heroui-foreground) / 0.6)
- **Badge Background**: hsl(var(--heroui-primary) / 0.2)

## 🎭 Animations

### Card Hover
```css
hover:scale-[1.02] transition-transform duration-200
```
- Scale: 1.02x (2% larger)
- Duration: 200ms
- Easing: Default ease

### Button Hover
- Opacity change
- Background color transition
- Smooth 200ms transition

### Modal Open/Close
- Fade in/out animation
- Backdrop blur effect
- Smooth transitions

## 📐 Responsive Design

### Desktop (≥1024px)
- Card: Full width with max constraints
- Modal: 4xl size (896px)
- Layout: Horizontal flex

### Tablet (768px - 1023px)
- Card: Full width
- Modal: 3xl size (768px)
- Layout: Horizontal flex

### Mobile (<768px)
- Card: Full width, stacked layout
- Modal: Full screen
- Buttons: Full width
- Text: Smaller sizes

## 🎯 Interactive States

### Card States
1. **Default**: Normal appearance
2. **Hover**: Scale up, shadow increase
3. **Active**: Scale down slightly
4. **Focus**: Outline ring

### Button States
1. **Default**: Solid/bordered appearance
2. **Hover**: Opacity change
3. **Active**: Pressed appearance
4. **Disabled**: Reduced opacity, no interaction
5. **Loading**: Spinner animation

### Modal States
1. **Closed**: Hidden, no backdrop
2. **Opening**: Fade in animation
3. **Open**: Full visibility, backdrop blur
4. **Closing**: Fade out animation

## 🔍 Accessibility Features

### Keyboard Navigation
- Tab: Navigate between buttons
- Enter/Space: Activate buttons
- Escape: Close modal

### Screen Reader
- Semantic HTML structure
- Descriptive button labels
- Proper heading hierarchy
- Alt text for icons (via aria-label)

### Focus Management
- Visible focus indicators
- Modal focus trap
- Logical tab order

## 📊 Component Hierarchy

```
MarketHomeBentoGrid
└── 智能助理 Section
    └── IntelligentAgentCard
        ├── Card (HeroUI)
        │   ├── CardBody
        │   │   ├── Emoji
        │   │   ├── Content
        │   │   │   ├── Title + Badge
        │   │   │   ├── Description
        │   │   │   ├── Feature Highlights
        │   │   │   └── Tags
        │   │   └── ...
        │   └── CardFooter
        │       ├── Primary Button
        │       └── Detail Button
        └── Modal (HeroUI)
            ├── ModalContent
            │   ├── ModalHeader
            │   ├── ModalBody
            │   │   ├── Markdown Content
            │   │   └── Quick Action Box
            │   └── ModalFooter
            └── ...
```

## 🎨 Design Tokens

### Spacing
- Card padding: p-6 (24px)
- Footer padding: p-4 (16px)
- Gap between elements: gap-2 to gap-4
- Section spacing: space-y-8

### Typography
- Title: text-xl (20px), font-bold
- Description: text-sm (14px)
- Tags: text-xs (12px)
- Modal title: text-2xl (24px)

### Border Radius
- Card: rounded-lg (8px)
- Buttons: rounded-md (6px)
- Chips: rounded-full
- Modal: rounded-xl (12px)

### Shadows
- Card: shadow-md
- Card hover: shadow-lg
- Modal: shadow-2xl

## 💡 Best Practices

1. **Always use theme colors** for consistency
2. **Test in both light and dark mode**
3. **Verify responsive behavior** on all screen sizes
4. **Check keyboard navigation** works properly
5. **Ensure proper contrast** for accessibility
6. **Test with screen readers** for accessibility
7. **Optimize images and icons** for performance

## 🎉 Visual Checklist

- ✅ Card displays with proper spacing
- ✅ Emoji is large and visible
- ✅ Title and badge are aligned
- ✅ Description is readable and clamped
- ✅ Feature highlights show correct icons
- ✅ Tags display in a row
- ✅ Buttons are full width and aligned
- ✅ Hover animation is smooth
- ✅ Modal opens with animation
- ✅ Markdown renders with proper styles
- ✅ Quick action box is highlighted
- ✅ Modal footer buttons are aligned
- ✅ Colors match theme in both modes
- ✅ Responsive layout works on mobile

---

**Visual Design Status**: ✅ Complete and Polished
**Next**: Implement activation logic and user flow
