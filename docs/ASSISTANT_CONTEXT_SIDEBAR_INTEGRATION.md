# AssistantContext Sidebar Integration

## Overview

The AssistantContext has been updated to support the new unified AssistantSettingsSidebar component. This integration provides centralized control over the sidebar state and ensures proper data flow between the context and the sidebar.

## New Methods

### `openCreateSidebar()`

Opens the sidebar in create mode with an empty form.

**Usage:**
```typescript
const { openCreateSidebar } = useAssistants();

// Open create sidebar
openCreateSidebar();
```

**Requirements:** 1.1, 1.4

### `openEditSidebar(assistantId: string)`

Opens the sidebar in edit mode with the specified assistant's data loaded.

**Parameters:**
- `assistantId`: The ID of the assistant to edit

**Usage:**
```typescript
const { openEditSidebar } = useAssistants();

// Open edit sidebar for a specific assistant
openEditSidebar('assistant-123');
```

**Requirements:** 2.4, 2.5

### `closeSidebar()`

Closes the sidebar and resets its state.

**Usage:**
```typescript
const { closeSidebar } = useAssistants();

// Close the sidebar
closeSidebar();
```

**Requirements:** 1.5, 5.2

## Sidebar State

The context now exposes a `sidebarState` object that contains:

```typescript
{
  visible: boolean;        // Whether the sidebar is open
  mode: 'create' | 'edit'; // Current mode
  assistant: Assistant | null; // Assistant being edited (null in create mode)
}
```

**Usage:**
```typescript
const { sidebarState } = useAssistants();

if (sidebarState.visible) {
  console.log(`Sidebar is open in ${sidebarState.mode} mode`);
  if (sidebarState.mode === 'edit' && sidebarState.assistant) {
    console.log(`Editing: ${sidebarState.assistant.title}`);
  }
}
```

## Updated Methods

### `addAssistant()`

Enhanced to ensure proper UI refresh after creating a new assistant.

**Changes:**
- Added logging for debugging
- Improved state update to trigger UI refresh
- Better error handling

**Requirements:** 1.4, 5.2

### `updateAssistant()`

Enhanced to ensure proper UI refresh after updating an assistant.

**Changes:**
- Added logging for debugging
- Improved state update to trigger UI refresh
- Better error handling and rollback on failure

**Requirements:** 2.4, 2.5, 5.2

## Integration Example

Here's a complete example of how to integrate the sidebar with a component:

```typescript
'use client';

import React from 'react';
import { useAssistants } from '@/contexts/AssistantContext';
import { AssistantSettingsSidebar } from '@/components/AssistantSettingsSidebar';
import { Button } from '@heroui/button';

export default function MyComponent() {
  const {
    openCreateSidebar,
    openEditSidebar,
    closeSidebar,
    sidebarState,
    addAssistant,
    updateAssistant,
  } = useAssistants();

  // Handle save for both create and edit modes
  const handleSave = async (data) => {
    if (sidebarState.mode === 'create') {
      await addAssistant(data);
    } else if (sidebarState.assistant) {
      await updateAssistant(sidebarState.assistant.id, data);
    }
  };

  return (
    <div>
      {/* Create button */}
      <Button onPress={openCreateSidebar}>
        Create Assistant
      </Button>

      {/* Edit button (example) */}
      <Button onPress={() => openEditSidebar('assistant-123')}>
        Edit Assistant
      </Button>

      {/* Sidebar component */}
      <AssistantSettingsSidebar
        visible={sidebarState.visible}
        mode={sidebarState.mode}
        assistant={sidebarState.assistant}
        onClose={closeSidebar}
        onSave={handleSave}
      />
    </div>
  );
}
```

## State Management Flow

### Create Flow

1. User clicks "Create Assistant" button
2. Component calls `openCreateSidebar()`
3. Context updates `sidebarState` to:
   ```typescript
   {
     visible: true,
     mode: 'create',
     assistant: null
   }
   ```
4. Sidebar opens with empty form
5. User fills form and clicks "Save"
6. Component calls `addAssistant(data)`
7. Context creates assistant and updates `assistantList`
8. UI automatically refreshes to show new assistant
9. Component calls `closeSidebar()`

### Edit Flow

1. User clicks "Edit" button for an assistant
2. Component calls `openEditSidebar(assistantId)`
3. Context finds the assistant and updates `sidebarState` to:
   ```typescript
   {
     visible: true,
     mode: 'edit',
     assistant: { ...assistantData }
   }
   ```
4. Sidebar opens with assistant data loaded
5. User modifies form and clicks "Save"
6. Component calls `updateAssistant(id, updates)`
7. Context updates assistant and refreshes `assistantList`
8. UI automatically refreshes to show updated data
9. Component calls `closeSidebar()`

## Error Handling

Both `addAssistant` and `updateAssistant` methods:

1. Set error state on failure
2. Log errors for debugging
3. Throw errors for component handling
4. Trigger UI refresh on version conflicts
5. Rollback optimistic updates on failure

**Example:**
```typescript
try {
  await addAssistant(data);
  closeSidebar();
} catch (error) {
  // Error is already set in context
  // Component can display error message
  console.error('Failed to save:', error);
}
```

## Benefits

1. **Centralized Control**: All sidebar state managed in one place
2. **Consistent Behavior**: Same flow for create and edit modes
3. **Automatic UI Refresh**: State updates trigger re-renders
4. **Error Recovery**: Built-in error handling and rollback
5. **Type Safety**: Full TypeScript support
6. **Easy Integration**: Simple API for components

## Migration Notes

### From Old Modal

If you're migrating from the old modal-based create flow:

**Before:**
```typescript
const [showModal, setShowModal] = useState(false);

<CreateAssistantModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onSave={handleSave}
/>
```

**After:**
```typescript
const { openCreateSidebar, sidebarState, closeSidebar } = useAssistants();

<AssistantSettingsSidebar
  visible={sidebarState.visible}
  mode={sidebarState.mode}
  assistant={sidebarState.assistant}
  onClose={closeSidebar}
  onSave={handleSave}
/>
```

## Testing

To test the integration:

1. **Create Flow:**
   - Click create button
   - Verify sidebar opens with empty form
   - Fill form and save
   - Verify assistant appears in list

2. **Edit Flow:**
   - Click edit button for an assistant
   - Verify sidebar opens with data loaded
   - Modify data and save
   - Verify changes appear in list

3. **Error Handling:**
   - Test with invalid data
   - Test with network errors
   - Verify error messages display
   - Verify state rollback works

## Requirements Coverage

- **1.1**: Create button opens sidebar ✓
- **1.4**: addAssistant creates and refreshes UI ✓
- **1.5**: closeSidebar handles unsaved changes ✓
- **2.4**: updateAssistant updates and refreshes UI ✓
- **2.5**: Edit mode loads existing data ✓
- **5.2**: State updates trigger UI refresh ✓

## Next Steps

See [ASSISTANT_SETTINGS_SIDEBAR_IMPLEMENTATION.md](./ASSISTANT_SETTINGS_SIDEBAR_IMPLEMENTATION.md) for details on the sidebar component itself.
