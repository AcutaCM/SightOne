# User Assistants Sidebar - Quick Reference

## Overview
The TTHub Sidebar now displays only user-added assistants with integrated search functionality.

## Key Features

### 1. User-Only Display
- Shows only assistants added by the user
- Filters out market assistants automatically
- Persists across sessions via localStorage

### 2. Search Functionality
- Real-time search as you type
- Searches across:
  - Assistant title
  - Assistant description
  - Assistant tags
- Case-insensitive matching
- Clear button to reset search

### 3. Empty State Ready
- When `filteredUserAssistants.length === 0`, can show empty state
- Handles both "no assistants added" and "no search results" scenarios

## Usage

### For Users

**Adding an Assistant**:
1. Browse market assistants
2. Click "Add to My Assistants" button
3. Assistant appears in sidebar immediately

**Searching Assistants**:
1. Type in the search box at top of sidebar
2. Results filter in real-time
3. Click "X" to clear search

**Selecting an Assistant**:
1. Click on any assistant card in sidebar
2. Active assistant is highlighted with blue border
3. Chat switches to that assistant's context

### For Developers

**Accessing User Assistants**:
```typescript
const { userAssistants } = useAssistants();
```

**Adding an Assistant**:
```typescript
const { addUserAssistant } = useAssistants();
await addUserAssistant(assistant);
```

**Removing an Assistant**:
```typescript
const { removeUserAssistant } = useAssistants();
await removeUserAssistant(assistantId);
```

**Filtered List** (with search):
```typescript
const filteredUserAssistants = React.useMemo(() => {
  if (!sidebarSearchTerm.trim()) {
    return userAssistants;
  }
  
  const searchLower = sidebarSearchTerm.toLowerCase().trim();
  return userAssistants.filter(assistant => {
    const titleMatch = assistant.title.toLowerCase().includes(searchLower);
    const descMatch = assistant.desc.toLowerCase().includes(searchLower);
    const tagsMatch = assistant.tags?.some(tag => tag.toLowerCase().includes(searchLower));
    return titleMatch || descMatch || tagsMatch;
  });
}, [userAssistants, sidebarSearchTerm]);
```

## Data Flow

```
Market Assistant
    ↓
User clicks "Add"
    ↓
addUserAssistant(assistant)
    ↓
AssistantContext updates userAssistants
    ↓
Persisted to localStorage
    ↓
Sidebar re-renders with new assistant
    ↓
Search filter applies (if active)
    ↓
filteredUserAssistants displayed
```

## State Management

### Context State
- `userAssistants`: Array of user-added assistants
- `marketAssistants`: Array of all available market assistants

### Local State
- `sidebarSearchTerm`: Current search query
- `filteredUserAssistants`: Computed filtered list

### Persistence
- User assistants stored in localStorage as array of IDs
- Loaded on mount and synced with full assistant data
- Automatically saved when assistants are added/removed

## Component Structure

```
Sidebar
├── Header (with collapse button)
├── Search Input (with clear button)
├── Assistant List (scrollable)
│   └── filteredUserAssistants.map(...)
│       └── SidebarCard (clickable)
│           ├── Avatar (emoji or image)
│           └── Info (title + description)
└── New Assistant Button
```

## Styling

### Active Assistant
- Border: `1px solid hsl(var(--heroui-primary) / 0.8)`
- Background: `hsl(var(--heroui-primary) / 0.15)`

### Inactive Assistant
- Border: `1px solid hsl(var(--heroui-divider))`
- Background: `hsl(var(--heroui-content1))`

### Scrollbar
- Custom styled via `.assistant-list-scroll` class
- Thin scrollbar (6px width)
- Themed colors matching application

## Performance

### Optimizations
- `React.useMemo` for filtered list computation
- Only re-computes when dependencies change
- Efficient array filtering with early returns

### Rendering
- Uses `assistant.id` as key for stable rendering
- Prevents unnecessary re-renders of unchanged items
- Smooth scrolling with CSS transitions

## Troubleshooting

### No Assistants Showing
1. Check if any assistants have been added: `userAssistants.length`
2. Check if search is filtering all results: clear search term
3. Verify localStorage has data: `localStorage.getItem('userAssistants')`

### Search Not Working
1. Verify `sidebarSearchTerm` state is updating
2. Check console for any filtering errors
3. Ensure assistant data has title/desc/tags fields

### Assistant Not Persisting
1. Check localStorage is available
2. Verify `saveUserAssistants` is being called
3. Check browser console for storage errors

## Related Files
- `drone-analyzer-nextjs/components/ChatbotChat/index.tsx` - Main component
- `drone-analyzer-nextjs/contexts/AssistantContext.tsx` - State management
- `drone-analyzer-nextjs/docs/TASK_3_USER_ASSISTANTS_DISPLAY_COMPLETE.md` - Implementation details

## Next Steps
- Task 4: Empty state component
- Task 5: Add button in market
- Task 6: Remove button in sidebar

---

**Last Updated**: 2024-01-06
**Status**: ✅ Implemented
