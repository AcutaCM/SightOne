# MessageDock API Reference

Complete API documentation for the AssistantMessageDock component and related utilities.

---

## Table of Contents

1. [AssistantMessageDock Component](#assistantmessagedock-component)
2. [Type Definitions](#type-definitions)
3. [Helper Functions](#helper-functions)
4. [Constants](#constants)
5. [Event Handlers](#event-handlers)
6. [Integration APIs](#integration-apis)

---

## AssistantMessageDock Component

### Component Signature

```typescript
export function AssistantMessageDock(
  props: AssistantMessageDockProps
): JSX.Element
```

### Props

#### `AssistantMessageDockProps`

```typescript
interface AssistantMessageDockProps {
  /**
   * Callback function triggered when a user sends a message through the MessageDock.
   * This should handle opening the chat interface with the selected assistant.
   * 
   * @param assistantId - The unique identifier of the selected assistant
   * @param initialMessage - The message text entered by the user
   */
  onOpenChat?: (assistantId: string, initialMessage: string) => void;
  
  /**
   * Additional CSS classes to apply to the MessageDock container.
   * Useful for controlling z-index, positioning, or custom styling.
   * 
   * @default ""
   */
  className?: string;
}
```

### Usage Example

```tsx
import { AssistantMessageDock } from "@/components/AssistantMessageDock";

function MyComponent() {
  const handleOpenChat = (assistantId: string, message: string) => {
    console.log('Opening chat:', assistantId, message);
  };

  return (
    <AssistantMessageDock 
      onOpenChat={handleOpenChat}
      className="z-50"
    />
  );
}
```

### Return Value

Returns a JSX element representing the MessageDock component with the following characteristics:
- Fixed positioning at bottom center of viewport
- Automatic theme detection and application
- Character buttons derived from published assistants
- Message input field when expanded
- Animations powered by framer-motion

---

## Type Definitions

### Character

```typescript
interface Character {
  /**
   * Unique identifier for the character.
   * For assistants, this is the assistant ID.
   */
  id: string | number;
  
  /**
   * Emoji representing the character.
   * Displayed as the character's avatar.
   */
  emoji: string;
  
  /**
   * Display name of the character.
   * Shown in tooltips and accessibility labels.
   */
  name: string;
  
  /**
   * Online status indicator.
   * True for published assistants, false for placeholders.
   */
  online: boolean;
  
  /**
   * Tailwind background color class.
   * @example "bg-green-300"
   */
  backgroundColor?: string;
  
  /**
   * Tailwind gradient start color class.
   * @example "from-green-300"
   */
  gradientFrom?: string;
  
  /**
   * Tailwind gradient end color class.
   * @example "to-green-100"
   */
  gradientTo?: string;
  
  /**
   * Hex color values for CSS gradients.
   * @example "#86efac, #dcfce7"
   */
  gradientColors?: string;
}
```

### ColorPalette

```typescript
interface ColorPalette {
  /**
   * Tailwind background color class
   */
  bg: string;
  
  /**
   * Tailwind gradient start color class
   */
  from: string;
  
  /**
   * Tailwind gradient end color class
   */
  to: string;
  
  /**
   * Comma-separated hex color values
   */
  colors: string;
}
```

### Assistant (from AssistantContext)

```typescript
interface Assistant {
  /**
   * Unique identifier for the assistant
   */
  id: string;
  
  /**
   * Display title of the assistant
   */
  title: string;
  
  /**
   * Description of the assistant's capabilities
   */
  desc: string;
  
  /**
   * Emoji representing the assistant
   */
  emoji: string;
  
  /**
   * System prompt for the assistant
   */
  prompt: string;
  
  /**
   * Optional tags for categorization
   */
  tags?: string[];
  
  /**
   * Whether the assistant is publicly visible
   */
  isPublic: boolean;
  
  /**
   * Publication status
   */
  status: 'draft' | 'pending' | 'published' | 'rejected';
  
  /**
   * Author/creator of the assistant
   */
  author: string;
  
  /**
   * Creation timestamp
   */
  createdAt: Date;
}
```

---

## Helper Functions

### generateGradientColors

Generates unique gradient colors for an assistant based on their index.

```typescript
function generateGradientColors(index: number): ColorPalette
```

#### Parameters

- `index` (number): The zero-based index of the assistant in the published assistants list

#### Returns

A `ColorPalette` object containing Tailwind classes and hex color values.

#### Example

```typescript
const colors = generateGradientColors(0);
// Returns: {
//   bg: "bg-green-300",
//   from: "from-green-300",
//   to: "to-green-100",
//   colors: "#86efac, #dcfce7"
// }

const colors = generateGradientColors(5);
// Returns: {
//   bg: "bg-green-300", // Cycles back to first palette
//   from: "from-green-300",
//   to: "to-green-100",
//   colors: "#86efac, #dcfce7"
// }
```

#### Algorithm

Uses modulo operation to cycle through available color palettes:

```typescript
return colorPalettes[index % colorPalettes.length];
```

---

### mapAssistantToCharacter

Maps an Assistant object from AssistantContext to a Character object for MessageDock.

```typescript
function mapAssistantToCharacter(
  assistant: { id: string; emoji: string; title: string },
  index: number
): Character
```

#### Parameters

- `assistant` (object): The assistant object from AssistantContext
  - `id` (string): Unique assistant identifier
  - `emoji` (string): Assistant emoji
  - `title` (string): Assistant display name
- `index` (number): The index of the assistant in the list, used for color generation

#### Returns

A `Character` object compatible with the MessageDock component.

#### Transformations

| Assistant Property | Character Property | Transformation |
|-------------------|-------------------|----------------|
| `id` | `id` | Direct mapping |
| `emoji` | `emoji` | Direct mapping |
| `title` | `name` | Direct mapping |
| N/A | `online` | Always `true` |
| N/A | `backgroundColor` | Generated from index |
| N/A | `gradientFrom` | Generated from index |
| N/A | `gradientTo` | Generated from index |
| N/A | `gradientColors` | Generated from index |

#### Example

```typescript
const assistant = {
  id: "asst_123",
  emoji: "🤖",
  title: "Code Helper"
};

const character = mapAssistantToCharacter(assistant, 0);
// Returns: {
//   id: "asst_123",
//   emoji: "🤖",
//   name: "Code Helper",
//   online: true,
//   backgroundColor: "bg-green-300",
//   gradientFrom: "from-green-300",
//   gradientTo: "to-green-100",
//   gradientColors: "#86efac, #dcfce7"
// }
```

---

## Constants

### colorPalettes

Array of color palettes used for generating unique gradient backgrounds.

```typescript
const colorPalettes: ColorPalette[] = [
  {
    bg: "bg-green-300",
    from: "from-green-300",
    to: "to-green-100",
    colors: "#86efac, #dcfce7",
  },
  {
    bg: "bg-purple-300",
    from: "from-purple-300",
    to: "to-purple-100",
    colors: "#c084fc, #f3e8ff",
  },
  {
    bg: "bg-yellow-300",
    from: "from-yellow-300",
    to: "to-yellow-100",
    colors: "#fde047, #fefce8",
  },
  {
    bg: "bg-blue-300",
    from: "from-blue-300",
    to: "to-blue-100",
    colors: "#93c5fd, #dbeafe",
  },
  {
    bg: "bg-pink-300",
    from: "from-pink-300",
    to: "to-pink-100",
    colors: "#f9a8d4, #fce7f3",
  },
];
```

#### Usage

Cycled through using modulo operation based on assistant index.

#### Customization

To add custom colors:

```typescript
const colorPalettes: ColorPalette[] = [
  // ... existing palettes
  {
    bg: "bg-orange-300",
    from: "from-orange-300",
    to: "to-orange-100",
    colors: "#fdba74, #ffedd5",
  },
];
```

---

### defaultCharacters

Default placeholder characters displayed when no published assistants are available.

```typescript
const defaultCharacters: Character[] = [
  { emoji: "✨", name: "Sparkle", online: false },
  {
    emoji: "🤖",
    name: "AI Assistant",
    online: true,
    backgroundColor: "bg-blue-300",
    gradientFrom: "from-blue-300",
    gradientTo: "to-blue-100",
    gradientColors: "#93c5fd, #dbeafe",
  },
];
```

#### Purpose

Ensures the MessageDock is never empty, providing a consistent UI even when no assistants are configured.

#### Customization

To modify default characters:

```typescript
const defaultCharacters: Character[] = [
  { emoji: "✨", name: "Sparkle", online: false },
  { 
    emoji: "💬", 
    name: "Chat Bot", 
    online: true,
    backgroundColor: "bg-purple-300",
    gradientColors: "#c084fc, #f3e8ff"
  },
];
```

---

## Event Handlers

### handleMessageSend

Internal handler for message send events.

```typescript
const handleMessageSend = (
  message: string,
  character: Character,
  characterIndex: number
) => void
```

#### Parameters

- `message` (string): The message text entered by the user
- `character` (Character): The selected character object
- `characterIndex` (number): The index of the character in the characters array

#### Behavior

1. Validates the selection (skips sparkle button at index 0)
2. Ensures the character has a valid string ID
3. Calls the `onOpenChat` callback if provided
4. Passes assistant ID and message to the callback

#### Example Flow

```typescript
// User types "Hello" and clicks send
handleMessageSend("Hello", character, 1);
// ↓
// Validates: characterIndex !== 0 && character.id exists
// ↓
// Calls: onOpenChat("asst_123", "Hello")
```

---

### handleCharacterSelect

Internal handler for character selection (click) events.

```typescript
const handleCharacterSelect = (
  character: Character,
  characterIndex: number
) => void
```

#### Parameters

- `character` (Character): The selected character object
- `characterIndex` (number): The index of the character in the characters array

#### Behavior

1. Skips the sparkle button (index 0)
2. Logs the selection for debugging
3. Can be extended with additional logic (analytics, pre-loading, etc.)

#### Extension Example

```typescript
const handleCharacterSelect = (character: Character, characterIndex: number) => {
  if (characterIndex === 0) return;
  
  // Log selection
  console.log("Character selected:", character.name);
  
  // Track analytics
  analytics.track('assistant_selected', {
    assistant_id: character.id,
    assistant_name: character.name,
  });
  
  // Pre-load assistant data
  preloadAssistantData(character.id as string);
};
```

---

## Integration APIs

### AssistantContext Integration

The component integrates with AssistantContext to retrieve published assistants.

```typescript
import { useAssistants } from "@/contexts/AssistantContext";

const { publishedAssistants } = useAssistants();
```

#### Required Context

```tsx
<AssistantProvider>
  <AssistantMessageDock />
</AssistantProvider>
```

#### Data Flow

```
AssistantContext.publishedAssistants
    ↓
AssistantMessageDock (maps to Character[])
    ↓
MessageDock UI Component
```

---

### Theme Integration

The component integrates with next-themes for automatic theme detection.

```typescript
import { useTheme } from "next-themes";

const { theme, systemTheme } = useTheme();
const currentTheme = theme === "system" ? systemTheme : theme;
```

#### Required Context

```tsx
<ThemeProvider attribute="class" defaultTheme="system">
  <AssistantMessageDock />
</ThemeProvider>
```

#### Theme Resolution

| User Setting | System Theme | Resolved Theme |
|-------------|--------------|----------------|
| `light` | N/A | `light` |
| `dark` | N/A | `dark` |
| `system` | `light` | `light` |
| `system` | `dark` | `dark` |

---

### PureChat Integration

The component routes messages to PureChat via the `onOpenChat` callback.

```typescript
const handleOpenChat = (assistantId: string, message: string) => {
  // Set state for PureChat
  setSelectedAssistantId(assistantId);
  setInitialMessage(message);
  
  // Open chat panel
  toggleChatPanel(true);
};
```

#### Integration Pattern

```tsx
function HomePage() {
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [initialMessage, setInitialMessage] = useState<string>('');

  return (
    <>
      <PureChat
        assistantId={selectedAssistant}
        initialMessage={initialMessage}
      />
      <AssistantMessageDock onOpenChat={handleOpenChat} />
    </>
  );
}
```

---

## Performance Considerations

### Memoization

The character list is memoized to prevent unnecessary recalculations:

```typescript
const characters = useMemo(() => {
  // Mapping logic
}, [publishedAssistants]);
```

#### Benefits

- Prevents re-renders when publishedAssistants reference changes but content is the same
- Improves performance with large assistant lists
- Reduces CPU usage during theme switches

### Animation Optimization

Animations use framer-motion's built-in optimizations:

- GPU-accelerated transforms
- Automatic will-change management
- Reduced motion support

---

## Accessibility

### ARIA Labels

All interactive elements have proper ARIA labels:

```tsx
<button aria-label={`Chat with ${character.name}`}>
  {character.emoji}
</button>

<input 
  aria-label={`Message ${selectedCharacter.name}`}
  placeholder={`Message ${selectedCharacter.name}...`}
/>
```

### Keyboard Navigation

Full keyboard support:

| Key | Action |
|-----|--------|
| `Tab` | Navigate through characters |
| `Enter` / `Space` | Select character |
| `Escape` | Close dock |
| `Tab` (expanded) | Move to input |
| `Enter` (in input) | Send message |

### Screen Reader Support

- Announces dock state changes
- Describes character buttons with names
- Provides context for all actions

---

## Error Handling

### No Assistants

When `publishedAssistants.length === 0`:

```typescript
if (publishedAssistants.length === 0) {
  return defaultCharacters;
}
```

Returns default placeholder characters to ensure UI is never empty.

### Invalid Character Selection

When sparkle button or invalid character is selected:

```typescript
if (characterIndex === 0 || !character.id) {
  return; // Skip processing
}
```

Silently ignores invalid selections without errors.

### Missing Callback

When `onOpenChat` is not provided:

```typescript
if (onOpenChat && typeof character.id === "string") {
  onOpenChat(character.id, message);
}
```

Safely checks for callback existence before calling.

---

## Version History

### v1.0.0 (2025-01-30)

- Initial release
- AssistantContext integration
- Theme support (light/dark)
- Message routing to PureChat
- Keyboard navigation
- Accessibility features
- Animation system
- Documentation

---

## Related Documentation

- [Usage Guide](./MESSAGE_DOCK_USAGE_GUIDE.md)
- [Quick Reference](./MESSAGE_DOCK_QUICK_REFERENCE.md)
- [Testing Guide](./MESSAGE_DOCK_INTEGRATION_TESTING_GUIDE.md)
- [Design Specification](../.kiro/specs/message-dock-integration/design.md)
- [Requirements](../.kiro/specs/message-dock-integration/requirements.md)

---

**Last Updated**: 2025-01-30  
**Version**: 1.0.0
