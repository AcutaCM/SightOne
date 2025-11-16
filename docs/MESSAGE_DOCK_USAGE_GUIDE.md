# MessageDock Usage Guide

## Overview

The MessageDock component provides a fixed, collapsible dock interface at the bottom center of the application for quick access to AI assistants. It integrates seamlessly with the AssistantContext system and routes conversations to the PureChat interface.

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Installation & Setup](#installation--setup)
3. [Basic Usage](#basic-usage)
4. [Props & Configuration](#props--configuration)
5. [Integration with PureChat](#integration-with-purechat)
6. [Customization](#customization)
7. [Accessibility](#accessibility)
8. [Troubleshooting](#troubleshooting)

---

## Component Architecture

### Component Hierarchy

```
AssistantMessageDock (Wrapper)
  └── MessageDock (UI Component)
      ├── Character Buttons (from AssistantContext)
      ├── Message Input Field
      └── Animation System (framer-motion)
```

### Data Flow

```
AssistantContext (publishedAssistants)
    ↓
AssistantMessageDock (maps to Character[])
    ↓
User Interaction (message send)
    ↓
PureChat Component (opens with context)
```

---

## Installation & Setup

### Prerequisites

Ensure the following dependencies are installed:

```json
{
  "framer-motion": "^11.18.2",
  "next-themes": "^0.4.6",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1"
}
```

### File Structure

```
components/
├── ui/
│   └── message-dock.tsx          # Base MessageDock UI component
└── AssistantMessageDock.tsx      # Wrapper component with context integration
```

---

## Basic Usage

### 1. Import the Component

```tsx
import { AssistantMessageDock } from "@/components/AssistantMessageDock";
```

### 2. Add to Your Page

```tsx
export default function MyPage() {
  const handleOpenChat = (assistantId: string, message: string) => {
    // Handle opening chat with the selected assistant
    console.log('Opening chat with:', assistantId, message);
  };

  return (
    <div>
      {/* Your page content */}
      
      {/* MessageDock - Fixed at bottom center */}
      <AssistantMessageDock 
        onOpenChat={handleOpenChat}
        className="z-50"
      />
    </div>
  );
}
```

### 3. Ensure Context Providers

The component requires the following context providers:

```tsx
import { AssistantProvider } from "@/contexts/AssistantContext";
import { ThemeProvider } from "next-themes";

export default function App({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <AssistantProvider>
        {children}
      </AssistantProvider>
    </ThemeProvider>
  );
}
```

---

## Props & Configuration

### AssistantMessageDock Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onOpenChat` | `(assistantId: string, initialMessage: string) => void` | No | `undefined` | Callback when user sends a message |
| `className` | `string` | No | `""` | Additional CSS classes for styling |

### Example with All Props

```tsx
<AssistantMessageDock 
  onOpenChat={(assistantId, message) => {
    // Custom chat opening logic
    setSelectedAssistant(assistantId);
    setInitialMessage(message);
    openChatPanel();
  }}
  className="z-50 custom-dock-class"
/>
```

---

## Integration with PureChat

### Complete Integration Example

```tsx
"use client";

import { useState } from "react";
import { AssistantMessageDock } from "@/components/AssistantMessageDock";
import PureChat from "@/components/ChatbotChat";

export default function HomePage() {
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [isChatVisible, setIsChatVisible] = useState(false);

  const handleOpenChat = (assistantId: string, message: string) => {
    // Set the selected assistant and initial message
    setSelectedAssistantId(assistantId);
    setInitialMessage(message);
    
    // Open the chat panel
    setIsChatVisible(true);
    
    // Optional: Log for debugging
    console.log('Opening chat with assistant:', assistantId, 'Message:', message);
  };

  return (
    <div className="relative min-h-screen">
      {/* Your page content */}
      
      {/* PureChat Component */}
      {isChatVisible && (
        <PureChat
          assistantId={selectedAssistantId}
          initialMessage={initialMessage}
          onClose={() => setIsChatVisible(false)}
        />
      )}
      
      {/* MessageDock - Fixed at bottom center */}
      <AssistantMessageDock 
        onOpenChat={handleOpenChat}
        className="z-50"
      />
    </div>
  );
}
```

### Integration with Layout Context

If you're using a layout context to manage component visibility:

```tsx
const handleOpenChat = (assistantId: string, message: string) => {
  setSelectedAssistantId(assistantId);
  setInitialMessage(message);
  
  // Make the chat panel visible if it's not already
  if (!isComponentVisible('chat-panel')) {
    toggleComponentVisibility('chat-panel');
  }
};
```

---

## Customization

### Theme Customization

The MessageDock automatically adapts to your application's theme using `next-themes`:

```tsx
// Light theme
<AssistantMessageDock className="z-50" />

// Dark theme (automatically detected)
<AssistantMessageDock className="z-50" />
```

### Color Palette Customization

To customize the gradient colors for assistants, modify the `colorPalettes` array in `AssistantMessageDock.tsx`:

```tsx
const colorPalettes = [
  {
    bg: "bg-green-300",
    from: "from-green-300",
    to: "to-green-100",
    colors: "#86efac, #dcfce7",
  },
  // Add more color palettes...
];
```

### Z-Index Management

The MessageDock uses `z-50` by default. Adjust based on your application's z-index hierarchy:

```tsx
// Current z-index hierarchy:
// - Background: z-[-30]
// - Grid: z-[-20]
// - Main content: z-10
// - Draggable components: z-20-40
// - MessageDock: z-50 (recommended)
// - Modals: z-[100]
// - TopNavbar: z-[1000]

<AssistantMessageDock className="z-50" />
```

### Position Customization

The MessageDock is fixed at the bottom center by default. To change the position, modify the CSS in `message-dock.tsx`:

```css
/* Default: bottom center */
.message-dock {
  @apply fixed bottom-6 left-1/2 -translate-x-1/2;
}

/* Alternative: bottom right */
.message-dock {
  @apply fixed bottom-6 right-6;
}
```

---

## Accessibility

### Keyboard Navigation

The MessageDock supports full keyboard navigation:

- **Tab**: Navigate through character buttons
- **Enter/Space**: Select a character and expand the dock
- **Escape**: Close the expanded dock
- **Tab** (when expanded): Move to message input field
- **Enter** (in input): Send message

### Screen Reader Support

All interactive elements have proper ARIA labels:

```tsx
// Character buttons
<button aria-label={`Chat with ${character.name}`}>
  {character.emoji}
</button>

// Message input
<input 
  aria-label={`Message ${selectedCharacter.name}`}
  placeholder={`Message ${selectedCharacter.name}...`}
/>
```

### Focus Management

- Focus is trapped within the expanded dock
- Focus returns to the trigger button when closed
- Clear focus indicators for all interactive elements

### Reduced Motion Support

The component respects the user's motion preferences:

```tsx
// Animations are automatically disabled when:
// prefers-reduced-motion: reduce
```

---

## Troubleshooting

### Issue: No Assistants Showing

**Problem**: The MessageDock shows default placeholder characters instead of user assistants.

**Solution**:
1. Verify that assistants are published in AssistantContext
2. Check that `publishedAssistants` array is not empty
3. Ensure AssistantProvider is wrapping your component tree

```tsx
// Check in browser console
const { publishedAssistants } = useAssistants();
console.log('Published assistants:', publishedAssistants);
```

### Issue: Theme Not Applying

**Problem**: The MessageDock doesn't match the application theme.

**Solution**:
1. Verify ThemeProvider is configured correctly
2. Check that `next-themes` is installed
3. Ensure the theme attribute is set to "class"

```tsx
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

### Issue: Messages Not Routing to PureChat

**Problem**: Clicking send doesn't open the chat interface.

**Solution**:
1. Verify `onOpenChat` callback is provided
2. Check that the callback is properly handling the assistant ID and message
3. Ensure PureChat component is rendered and visible

```tsx
const handleOpenChat = (assistantId: string, message: string) => {
  console.log('Callback triggered:', { assistantId, message });
  // Add your chat opening logic here
};
```

### Issue: Z-Index Conflicts

**Problem**: MessageDock appears behind other elements.

**Solution**:
1. Increase the z-index value
2. Check for conflicting z-index values in other components
3. Use the recommended z-index hierarchy

```tsx
<AssistantMessageDock className="z-[60]" />
```

### Issue: Animations Not Working

**Problem**: The dock doesn't animate when expanding/collapsing.

**Solution**:
1. Verify `framer-motion` is installed
2. Check browser console for errors
3. Ensure animations are not disabled by reduced motion preferences

```bash
npm install framer-motion@^11.18.2
```

---

## Advanced Usage

### Custom Character Limit

To change the maximum number of assistants displayed (default is 5):

```tsx
// In AssistantMessageDock.tsx
const characters = useMemo(() => {
  // Change 5 to your desired limit
  const mappedCharacters = publishedAssistants
    .slice(0, 10) // Show up to 10 assistants
    .map((assistant, index) => mapAssistantToCharacter(assistant, index));
  
  return [
    { emoji: "✨", name: "Sparkle", online: false },
    ...mappedCharacters,
  ];
}, [publishedAssistants]);
```

### Custom Default Characters

To customize the placeholder characters shown when no assistants are available:

```tsx
const defaultCharacters: Character[] = [
  { emoji: "✨", name: "Sparkle", online: false },
  { 
    emoji: "🤖", 
    name: "AI Assistant", 
    online: true,
    backgroundColor: "bg-blue-300",
    gradientColors: "#93c5fd, #dbeafe"
  },
  { 
    emoji: "💬", 
    name: "Chat Bot", 
    online: true,
    backgroundColor: "bg-purple-300",
    gradientColors: "#c084fc, #f3e8ff"
  },
];
```

### Event Tracking

Add analytics tracking to monitor MessageDock usage:

```tsx
const handleOpenChat = (assistantId: string, message: string) => {
  // Track event
  analytics.track('message_dock_chat_opened', {
    assistant_id: assistantId,
    message_length: message.length,
    timestamp: new Date().toISOString(),
  });
  
  // Open chat
  setSelectedAssistantId(assistantId);
  setInitialMessage(message);
  setIsChatVisible(true);
};
```

---

## API Reference

### AssistantMessageDock Component

#### Props

```typescript
interface AssistantMessageDockProps {
  /**
   * Callback function triggered when user sends a message
   * @param assistantId - The ID of the selected assistant
   * @param initialMessage - The message entered by the user
   */
  onOpenChat?: (assistantId: string, initialMessage: string) => void;
  
  /**
   * Additional CSS classes for styling
   */
  className?: string;
}
```

#### Internal Functions

```typescript
/**
 * Generate unique gradient colors based on assistant index
 * @param index - The index of the assistant in the list
 * @returns Color palette object with background and gradient colors
 */
function generateGradientColors(index: number): ColorPalette;

/**
 * Map Assistant object to Character format for MessageDock
 * @param assistant - Assistant object from AssistantContext
 * @param index - Index of the assistant for color generation
 * @returns Character object for MessageDock
 */
function mapAssistantToCharacter(
  assistant: Assistant,
  index: number
): Character;
```

---

## Best Practices

1. **Always provide onOpenChat callback**: This ensures messages are properly routed to your chat interface.

2. **Use appropriate z-index**: Keep MessageDock above content but below modals (z-50 recommended).

3. **Test with different assistant counts**: Verify behavior with 0, 1, 5, and 10+ assistants.

4. **Respect user preferences**: The component automatically handles reduced motion and theme preferences.

5. **Monitor performance**: With many assistants, consider implementing pagination or search functionality.

6. **Provide feedback**: Show loading states or confirmations when opening chat.

7. **Handle errors gracefully**: Implement error boundaries and fallback UI for failed operations.

---

## Related Documentation

- [AssistantContext Integration Guide](./ASSISTANT_CONTEXT_INTEGRATION_GUIDE.md)
- [MessageDock Integration Complete](./MESSAGE_DOCK_INTEGRATION_COMPLETE.md)
- [MessageDock Testing Guide](./MESSAGE_DOCK_INTEGRATION_TESTING_GUIDE.md)
- [PureChat Integration](./PURECHAT_INTEGRATION_COMPLETE.md)

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Testing Guide](./MESSAGE_DOCK_INTEGRATION_TESTING_GUIDE.md)
3. Consult the [Design Document](../.kiro/specs/message-dock-integration/design.md)

---

**Last Updated**: 2025-01-30
**Version**: 1.0.0
