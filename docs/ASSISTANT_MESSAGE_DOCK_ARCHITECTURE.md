# AssistantMessageDock Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ PURECHAT Component (index.tsx)                              │
│                                                              │
│ State:                                                       │
│ ├── assistantList: Assistant[]                              │
│ │   ├── { title: "Just Chat", emoji: "🦄", desc: "..." }   │
│ │   ├── { title: "Tello智能代理", emoji: "🚁", desc: "..." }│
│ │   └── { title: "海龟汤主持人", emoji: "🐢", desc: "..." }  │
│ │                                                            │
│ ├── currentAssistant: Assistant | null                      │
│ └── input: string                                            │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ AssistantMessageDock                                   │  │
│ │                                                        │  │
│ │ Props:                                                 │  │
│ │ ├── assistantList ← from parent                       │  │
│ │ ├── onOpenChat ← callback                             │  │
│ │ └── className                                          │  │
│ │                                                        │  │
│ │ State:                                                 │  │
│ │ ├── selectedAssistantTitles: string[]                 │  │
│ │ │   └── ["Just Chat", "Tello智能代理"]                │  │
│ │ ├── isDockCollapsed: boolean                          │  │
│ │ └── showAssistantSelector: boolean                    │  │
│ │                                                        │  │
│ │ ┌──────────────────────────────────────────────────┐  │  │
│ │ │ MessageDock (UI Component)                       │  │  │
│ │ │                                                  │  │  │
│ │ │ Props:                                           │  │  │
│ │ │ ├── characters: Character[]                     │  │  │
│ │ │ │   ├── { id: "Just Chat", emoji: "🦄", ... }  │  │  │
│ │ │ │   └── { id: "Tello智能代理", emoji: "🚁", ...}│  │  │
│ │ │ ├── onMessageSend                               │  │  │
│ │ │ ├── onCharacterSelect                           │  │  │
│ │ │ └── onMenuClick                                 │  │  │
│ │ │                                                  │  │  │
│ │ │ Renders:                                         │  │  │
│ │ │ [✨] [🦄] [🚁] [⚙️]                              │  │  │
│ │ └──────────────────────────────────────────────────┘  │  │
│ │                                                        │  │
│ │ ┌──────────────────────────────────────────────────┐  │  │
│ │ │ Assistant Selector Modal                         │  │  │
│ │ │                                                  │  │  │
│ │ │ ☑ 🦄 Just Chat                                  │  │  │
│ │ │ ☑ 🚁 Tello智能代理                              │  │  │
│ │ │ ☐ 🐢 海龟汤主持人                               │  │  │
│ │ │                                                  │  │  │
│ │ │ [取消全选] [全选] [完成]                         │  │  │
│ │ └──────────────────────────────────────────────────┘  │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initialization
```
PURECHAT loads
  ↓
assistantList populated
  ↓
AssistantMessageDock receives assistantList prop
  ↓
Loads selectedAssistantTitles from localStorage
  ↓
Filters assistantList by selectedAssistantTitles
  ↓
Maps to Character[] format
  ↓
MessageDock renders character bubbles
```

### 2. User Interaction - Send Message
```
User types message in MessageDock
  ↓
User selects assistant bubble
  ↓
User presses Enter or Send button
  ↓
MessageDock calls onMessageSend(message, character, index)
  ↓
AssistantMessageDock.handleMessageSend validates
  ↓
Calls onOpenChat(assistantTitle, message)
  ↓
PURECHAT.handleOpenChat finds assistant
  ↓
Sets currentAssistant and input
  ↓
Switches to chat view
```

### 3. User Interaction - Select Assistants
```
User clicks menu button (⚙️)
  ↓
AssistantMessageDock.handleMenuClick
  ↓
Opens assistant selector modal
  ↓
User toggles checkboxes
  ↓
handleToggleAssistant updates selectedAssistantTitles
  ↓
Saves to localStorage
  ↓
Re-filters and re-maps assistantList
  ↓
MessageDock updates displayed characters
```

## Type Definitions

### Assistant (from PURECHAT)
```typescript
type Assistant = {
  title: string;      // Unique identifier
  desc: string;       // Description
  emoji: string;      // Display emoji
  prompt?: string;    // Optional system prompt
};
```

### Character (for MessageDock)
```typescript
interface Character {
  id?: string;                // Assistant title
  emoji: string;              // Display emoji
  name: string;               // Display name (= title)
  online?: boolean;           // Always true for assistants
  backgroundColor?: string;   // Tailwind class
  gradientFrom?: string;      // Tailwind class
  gradientTo?: string;        // Tailwind class
  gradientColors?: string;    // CSS gradient colors
}
```

## State Management

### AssistantMessageDock State
```typescript
// Collapse state
const [isDockCollapsed, setIsDockCollapsed] = useState(false);

// Modal visibility
const [showAssistantSelector, setShowAssistantSelector] = useState(false);

// Selected assistants (persisted)
const [selectedAssistantTitles, setSelectedAssistantTitles] = useState<string[]>([]);
```

### LocalStorage Schema
```typescript
{
  "messageDock.selectedAssistants": [
    "Just Chat",
    "Tello智能代理"
  ]
}
```

## Color Assignment

### Palette Cycling
```typescript
const colorPalettes = [
  { bg: "bg-green-300", from: "from-green-300", to: "to-green-100", colors: "#86efac, #dcfce7" },
  { bg: "bg-purple-300", from: "from-purple-300", to: "to-purple-100", colors: "#c084fc, #f3e8ff" },
  { bg: "bg-yellow-300", from: "from-yellow-300", to: "to-yellow-100", colors: "#fde047, #fefce8" },
  { bg: "bg-blue-300", from: "from-blue-300", to: "to-blue-100", colors: "#93c5fd, #dbeafe" },
  { bg: "bg-pink-300", from: "from-pink-300", to: "to-pink-100", colors: "#f9a8d4, #fce7f3" },
];

// Color assigned by index
const colors = colorPalettes[index % colorPalettes.length];
```

### Example Assignment
```
Index 0: Just Chat → Green
Index 1: Tello智能代理 → Purple
Index 2: 海龟汤主持人 → Yellow
Index 3: Code Helper → Blue
Index 4: Translator → Pink
Index 5: Writer → Green (cycles back)
```

## Event Handlers

### handleMessageSend
```typescript
const handleMessageSend = (
  message: string,
  character: Character,
  characterIndex: number
) => {
  // Skip sparkle button (index 0)
  if (characterIndex === 0 || !character.id) return;
  
  // Call parent callback
  if (onOpenChat && typeof character.id === "string") {
    onOpenChat(character.id, message);
  }
};
```

### handleCharacterSelect
```typescript
const handleCharacterSelect = (
  character: Character,
  characterIndex: number
) => {
  // Sparkle button toggles collapse
  if (character.name === "Sparkle" || characterIndex === 0) {
    setIsDockCollapsed(true);
    return;
  }
  
  console.log("Character selected:", character.name);
};
```

### handleToggleAssistant
```typescript
const handleToggleAssistant = (assistantTitle: string) => {
  setSelectedAssistantTitles((prev: string[]) => {
    if (prev.includes(assistantTitle)) {
      // Don't allow deselecting if it's the last one
      if (prev.length === 1) return prev;
      return prev.filter((title: string) => title !== assistantTitle);
    } else {
      // Don't allow more than 5 assistants
      if (prev.length >= 5) return prev;
      return [...prev, assistantTitle];
    }
  });
};
```

## Constraints

### Selection Limits
- **Minimum**: 1 assistant (cannot deselect all)
- **Maximum**: 5 assistants (UI space limitation)
- **Persistence**: Saved to localStorage

### Character Slots
```
[✨ Sparkle] [Assistant 1] [Assistant 2] [Assistant 3] [Assistant 4] [Assistant 5] [⚙️ Menu]
     ↑            ↑            ↑            ↑            ↑            ↑            ↑
  Collapse    Selected     Selected     Selected     Selected     Selected    Settings
  (fixed)     (dynamic)    (dynamic)    (dynamic)    (dynamic)    (dynamic)    (fixed)
```

## Integration Points

### Required Props
```typescript
interface AssistantMessageDockProps {
  assistantList: Assistant[];  // From PURECHAT
  onOpenChat?: (assistantTitle: string, initialMessage: string) => void;
  className?: string;
}
```

### Parent Callback Implementation
```typescript
// In PURECHAT component
const handleOpenChat = (assistantTitle: string, initialMessage: string) => {
  const assistant = assistantList.find(a => a.title === assistantTitle);
  if (assistant) {
    setCurrentAssistant(assistant);
    setInput(initialMessage);
    if (showMarketplace) {
      setShowMarketplace(false);
    }
  }
};
```

## Performance Considerations

### Memoization
```typescript
const characters = useMemo(() => {
  // Expensive filtering and mapping
  // Only recalculates when assistantList or selectedAssistantTitles change
}, [assistantList, selectedAssistantTitles]);
```

### LocalStorage
- Read once on mount
- Write on every selection change
- Wrapped in try-catch for error handling

### Theme Detection
```typescript
const { theme, systemTheme } = useTheme();
const currentTheme = theme === "system" ? systemTheme : theme;
```

## Accessibility

### Keyboard Navigation
- Tab: Navigate between characters
- Enter: Select character / Send message
- Escape: Close modal / Collapse dock

### ARIA Labels
- Character buttons: `aria-label="Select {name}"`
- Input field: `aria-label="Message {name}"`
- Modal: `role="dialog"` with proper focus trap

### Screen Reader
- Announces character selection
- Announces modal open/close
- Announces selection limits

## Future Enhancements

1. **Drag-and-drop reordering**
   - Allow users to customize character order
   - Persist order in localStorage

2. **Custom colors**
   - Color picker for each assistant
   - Save preferences per assistant

3. **Quick actions**
   - Favorite assistants
   - Recent conversations
   - Pin to top

4. **Notifications**
   - Badge count for unread messages
   - Visual indicator for active conversations

5. **Voice input**
   - Speech-to-text integration
   - Voice command support
