# MessageDock Quick Reference

## Quick Start

### 1. Import and Use

```tsx
import { AssistantMessageDock } from "@/components/AssistantMessageDock";

<AssistantMessageDock 
  onOpenChat={(assistantId, message) => {
    // Handle chat opening
  }}
  className="z-50"
/>
```

### 2. Required Context Providers

```tsx
<ThemeProvider attribute="class">
  <AssistantProvider>
    {children}
  </AssistantProvider>
</ThemeProvider>
```

---

## Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onOpenChat` | `(assistantId: string, message: string) => void` | No | Callback when message is sent |
| `className` | `string` | No | Additional CSS classes |

---

## Key Features

✅ **Auto-Theme Detection** - Automatically adapts to light/dark mode  
✅ **Assistant Limiting** - Shows maximum 5 published assistants  
✅ **Fallback UI** - Default characters when no assistants available  
✅ **Unique Colors** - Each assistant gets a unique gradient color  
✅ **Fixed Position** - Always visible at bottom center (z-50)  
✅ **Keyboard Navigation** - Full keyboard support (Tab, Enter, Escape)  
✅ **Accessibility** - Screen reader compatible with ARIA labels  

---

## Integration Example

```tsx
"use client";

import { useState } from "react";
import { AssistantMessageDock } from "@/components/AssistantMessageDock";
import PureChat from "@/components/ChatbotChat";

export default function HomePage() {
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [initialMessage, setInitialMessage] = useState<string>('');

  const handleOpenChat = (assistantId: string, message: string) => {
    setSelectedAssistant(assistantId);
    setInitialMessage(message);
    // Open chat panel...
  };

  return (
    <>
      {/* Your content */}
      <AssistantMessageDock onOpenChat={handleOpenChat} className="z-50" />
    </>
  );
}
```

---

## Data Flow

```
AssistantContext
    ↓ (publishedAssistants)
AssistantMessageDock
    ↓ (maps to Character[])
MessageDock UI
    ↓ (user sends message)
onOpenChat callback
    ↓
PureChat Component
```

---

## Customization

### Change Assistant Limit

```tsx
// In AssistantMessageDock.tsx
const mappedCharacters = publishedAssistants
  .slice(0, 10) // Change from 5 to 10
  .map((assistant, index) => mapAssistantToCharacter(assistant, index));
```

### Add Custom Colors

```tsx
// In AssistantMessageDock.tsx
const colorPalettes = [
  // Add your custom color palette
  {
    bg: "bg-orange-300",
    from: "from-orange-300",
    to: "to-orange-100",
    colors: "#fdba74, #ffedd5",
  },
  // ... existing palettes
];
```

### Change Z-Index

```tsx
<AssistantMessageDock className="z-[60]" />
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate through characters |
| `Enter` / `Space` | Select character and expand |
| `Escape` | Close expanded dock |
| `Tab` (expanded) | Move to message input |
| `Enter` (in input) | Send message |

---

## Troubleshooting

### No Assistants Showing?

```tsx
// Check if assistants are published
const { publishedAssistants } = useAssistants();
console.log('Published:', publishedAssistants);
```

### Theme Not Working?

```tsx
// Verify ThemeProvider setup
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

### Messages Not Routing?

```tsx
// Ensure callback is provided and working
const handleOpenChat = (assistantId: string, message: string) => {
  console.log('Callback triggered:', { assistantId, message });
  // Your logic here
};
```

---

## Z-Index Hierarchy

```
Background:          z-[-30]
Grid:                z-[-20]
Main Content:        z-10
Draggable:           z-20-40
MessageDock:         z-50  ← Recommended
Modals:              z-[100]
TopNavbar:           z-[1000]
```

---

## File Locations

```
components/
├── ui/
│   └── message-dock.tsx              # Base UI component
└── AssistantMessageDock.tsx          # Wrapper with context

docs/
├── MESSAGE_DOCK_USAGE_GUIDE.md       # Full documentation
├── MESSAGE_DOCK_QUICK_REFERENCE.md   # This file
└── MESSAGE_DOCK_INTEGRATION_COMPLETE.md
```

---

## Related Documentation

- [Full Usage Guide](./MESSAGE_DOCK_USAGE_GUIDE.md)
- [Integration Testing Guide](./MESSAGE_DOCK_INTEGRATION_TESTING_GUIDE.md)
- [AssistantContext Guide](./ASSISTANT_CONTEXT_INTEGRATION_GUIDE.md)
- [Design Specification](../.kiro/specs/message-dock-integration/design.md)

---

## API Reference

### AssistantMessageDock

```typescript
interface AssistantMessageDockProps {
  onOpenChat?: (assistantId: string, initialMessage: string) => void;
  className?: string;
}
```

### Helper Functions

```typescript
// Generate colors for assistant
function generateGradientColors(index: number): ColorPalette;

// Map assistant to character
function mapAssistantToCharacter(
  assistant: Assistant,
  index: number
): Character;
```

---

## Best Practices

1. ✅ Always provide `onOpenChat` callback
2. ✅ Use `z-50` for proper layering
3. ✅ Test with 0, 1, 5, and 10+ assistants
4. ✅ Verify theme switching works
5. ✅ Test keyboard navigation
6. ✅ Check accessibility with screen readers
7. ✅ Monitor performance with many assistants

---

**Last Updated**: 2025-01-30  
**Version**: 1.0.0
