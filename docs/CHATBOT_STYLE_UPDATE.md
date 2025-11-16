# Chatbot Chat Style Update

## Overview
Updated the styled components in `components/ChatbotChat/index.tsx` to use HeroUI CSS variables instead of hardcoded RGBA values, matching the reference implementation in `index-bugneedtofix.tsx`.

## Changes Made

### 1. Message Bubble Styles
- **Before**: Used hardcoded colors like `linear-gradient(180deg,#1677ff,#155bd4)` and `rgba(255,255,255,0.06)`
- **After**: Uses HeroUI variables like `hsl(var(--heroui-primary))` and `hsl(var(--heroui-content2))`

### 2. Chat Header
- **Before**: `rgba(255,255,255,0.16)` borders and gradient backgrounds
- **After**: `hsl(var(--heroui-divider))` borders and `hsl(var(--heroui-content2))` backgrounds

### 3. Input Container
- **Before**: Fixed RGBA values for borders and backgrounds
- **After**: HeroUI variables with dark mode support via `.dark &` selector

### 4. Sidebar Components
- **Before**: Gradient backgrounds with RGBA values
- **After**: Solid HeroUI content backgrounds with proper dark mode support

### 5. Menu Items
- **Before**: `rgba(255,255,255,0.06)` backgrounds
- **After**: `hsl(var(--heroui-content2))` with hover state using `hsl(var(--heroui-content3))`

## Benefits

1. **Theme Consistency**: All components now use the unified HeroUI design system
2. **Dark Mode Support**: Proper dark mode handling with `.dark &` selectors
3. **Maintainability**: Easier to update colors globally through CSS variables
4. **Accessibility**: Better contrast ratios through semantic color tokens

## Updated Components

- `Bubble` - Message bubble styling
- `ChatHeader` - Chat header container
- `TitleDesc` - Title description text
- `PageHeader` - Page header container
- `BadgeLine` - Badge line text
- `InputContainer` - Input field container with dark mode support
- `InputFooter` - Input footer section
- `InputBarWrap` - Sticky input bar wrapper with dark mode support
- `LeftMenuBar` - Left menu bar with dark mode support
- `LeftMenuItem` - Menu item buttons
- `ApiConfigCard` - API configuration card with dark mode support
- `Sidebar` - Sidebar container with dark mode support
- `SidebarContent` - Sidebar content wrapper (added flex layout)
- `SidebarHeader` - Sidebar header (added z-index)
- `SidebarCard` - Sidebar card items

## Testing

Run the application and verify:
- ✅ Light mode colors are consistent with HeroUI theme
- ✅ Dark mode transitions work smoothly
- ✅ All interactive elements have proper hover states
- ✅ No TypeScript errors or warnings

## Date
2024-01-XX
