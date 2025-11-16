# AssistantMessageDock Integration Guide

## Overview

The `AssistantMessageDock` component has been updated to directly consume the `assistantList` from the PURECHAT component (`components/ChatbotChat/index.tsx`). This eliminates the need for duplicate assistant management and ensures consistency across the UI.

## Changes Made

### 1. Fixed Type Errors
- Changed `selectedAssistantIds` to `selectedAssistantTitles` (using assistant titles as identifiers)
- Fixed all function signatures to use `string` types for assistant titles
- Updated the modal to iterate over `assistantList` prop instead of undefined `publishedAssistants`

### 2. Data Flow
```
PURECHAT Component (index.tsx)
  ↓ assistantList state
  ↓ (passed as prop)
AssistantMessageDock Component
  ↓ filters by selectedAssistantTitles
  ↓ maps to Character format
MessageDock UI Component
```

## Integration Steps

### Step 1: Import the Component

In `components/ChatbotChat/index.tsx`, add the import at the top:

```typescript
import { AssistantMessageDock } from "@/components/AssistantMessageDock";
```

### Step 2: Add the Component to the Render

Add the component at the end of the PureChat component's return statement (before the closing tag):

```typescript
const PureChat: React.FC = () => {
  // ... existing state and logic ...

  const handleOpenChat = (assistantTitle: string, initialMessage: string) => {
    // Find the assistant by title
    const assistant = assistantList.find(a => a.title === assistantTitle);
    if (assistant) {
      setCurrentAssistant(assistant);
      setInput(initialMessage);
      // Optionally switch to chat view if in marketplace
      if (showMarketplace) {
        setShowMarketplace(false);
      }
    }
  };

  return (
    <div style={{ /* existing styles */ }}>
      {/* ... existing JSX ... */}
      
      {/* Add at the end, before closing div */}
      <AssistantMessageDock
        assistantList={assistantList}
        onOpenChat={handleOpenChat}
        className="z-50"
      />
    </div>
  );
};
```

### Step 3: Test the Integration

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Navigate to the chat page**
   - The MessageDock should appear at the bottom center of the screen

3. **Test functionality**
   - Click the sparkle button to collapse/expand
   - Click the menu button (⚙️) to open assistant selector
   - Select/deselect assistants (max 5)
   - Type a message and select an assistant to send
   - Verify the chat opens with the selected assistant and initial message

## Component Props

### `assistantList: Assistant[]`
The list of assistants from PURECHAT component. Each assistant has:
- `title: string` - Unique identifier and display name
- `desc: string` - Description
- `emoji: string` - Emoji icon
- `prompt?: string` - Optional system prompt

### `onOpenChat?: (assistantTitle: string, initialMessage: string) => void`
Callback when user sends a message. Should:
1. Find the assistant by title
2. Set it as current assistant
3. Set the input message
4. Switch to chat view if needed

### `className?: string`
Additional CSS classes for positioning/styling (default: `"z-50"`)

## Features

### Assistant Selection
- Users can select up to 5 assistants to display in the dock
- Selection is persisted in localStorage
- Modal provides visual feedback for selection limits

### Visual Design
- Unique gradient colors for each assistant (cycles through 5 color palettes)
- Sparkle button for collapse/expand
- Menu button for assistant selector
- Smooth animations and transitions

### Accessibility
- Full keyboard navigation
- Screen reader compatible
- Focus management
- Respects prefers-reduced-motion

## Troubleshooting

### Issue: MessageDock doesn't appear
- Check that the component is rendered in the DOM
- Verify z-index is high enough (default: 50)
- Check browser console for errors

### Issue: Assistants not showing
- Verify `assistantList` prop is passed correctly
- Check that assistants have valid `title`, `emoji`, and `desc` fields
- Open browser DevTools and inspect localStorage for `messageDock.selectedAssistants`

### Issue: onOpenChat not working
- Verify the callback is defined and passed as prop
- Check that assistant titles match between list and selection
- Add console.log in the callback to debug

## Future Enhancements

1. **Drag-and-drop reordering** of assistants in the dock
2. **Custom color selection** for each assistant
3. **Quick actions** (e.g., favorite, recent conversations)
4. **Notification badges** for unread messages
5. **Voice input** integration

## Related Files

- `components/AssistantMessageDock.tsx` - Main component
- `components/ui/message-dock.tsx` - Base UI component
- `components/ChatbotChat/index.tsx` - PURECHAT component
- `contexts/AssistantContext.tsx` - Assistant state management
