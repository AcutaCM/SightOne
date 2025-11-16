# AssistantSettingsSidebar - Quick Start Guide

## Overview

The `AssistantSettingsSidebar` is a unified modal component for creating and editing assistants. It supports all configuration options from the original ChatbotChat drawer with enhanced features.

## Basic Usage

```typescript
import { AssistantSettingsSidebar } from '@/components/AssistantSettingsSidebar';

<AssistantSettingsSidebar
  visible={true}
  mode="create"
  onClose={() => console.log('Closed')}
  onSave={async (data) => {
    console.log('Saving:', data);
    // Handle save logic
  }}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `visible` | `boolean` | ✅ | Controls modal visibility |
| `mode` | `'create' \| 'edit'` | ✅ | Create new or edit existing |
| `assistant` | `Assistant \| null` | ❌ | Existing assistant data (edit mode) |
| `onClose` | `() => void` | ✅ | Called when modal closes |
| `onSave` | `(data) => Promise<void>` | ✅ | Called when user saves |
| `onDelete` | `(id) => Promise<void>` | ❌ | Called when user deletes |
| `canDelete` | `boolean` | ❌ | Show delete button |
| `canModify` | `boolean` | ❌ | Allow modifications |
| `isAdmin` | `boolean` | ❌ | Admin privileges |

## Extended Form Data

The component supports all fields from 5 tabs:

```typescript
interface ExtendedAssistantFormData {
  // Basic (required)
  title: string;
  emoji: string;
  desc: string;
  prompt: string;
  tags: string[];
  isPublic: boolean;
  
  // Tab 1: Assistant Info
  avatarUrl?: string;
  avatarEmoji?: string;
  avatarBg?: string;
  name?: string;
  description?: string;
  
  // Tab 2: Role Settings
  systemPrompt?: string;
  
  // Tab 3: Opening Settings
  openingMessage?: string;
  openingQuestions?: string;
  
  // Tab 4: Chat Preferences
  preprocessTemplate?: string;
  autoCreateTopic?: boolean;
  autoCreateTopicThreshold?: number;
  historyLimit?: number;
  attachCount?: number;
  enableAutoSummary?: boolean;
  
  // Tab 5: Model Settings
  stream?: boolean;
  creativity?: number;
  openness?: number;
  divergence?: number;
  vocabulary?: number;
  singleReplyLimitEnabled?: boolean;
  singleReplyLimit?: number;
  reasoningStrengthEnabled?: boolean;
  reasoningStrength?: number;
  unipixelEnabled?: boolean;
  unipixelMode?: 'local' | 'cloud';
  unipixelEndpoint?: string;
}
```

## Common Patterns

### Create Mode

```typescript
const [showCreate, setShowCreate] = useState(false);

<Button onPress={() => setShowCreate(true)}>
  Create Assistant
</Button>

<AssistantSettingsSidebar
  visible={showCreate}
  mode="create"
  onClose={() => setShowCreate(false)}
  onSave={async (data) => {
    await createAssistant(data);
    setShowCreate(false);
  }}
/>
```

### Edit Mode

```typescript
const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);

<Button onPress={() => setEditingAssistant(assistant)}>
  Edit
</Button>

<AssistantSettingsSidebar
  visible={!!editingAssistant}
  mode="edit"
  assistant={editingAssistant}
  onClose={() => setEditingAssistant(null)}
  onSave={async (data) => {
    await updateAssistant(editingAssistant!.id, data);
    setEditingAssistant(null);
  }}
  onDelete={async (id) => {
    await deleteAssistant(id);
    setEditingAssistant(null);
  }}
  canDelete={true}
/>
```

### With AssistantContext

```typescript
import { useAssistantContext } from '@/contexts/AssistantContext';

function MyComponent() {
  const { 
    sidebarState, 
    openCreateSidebar, 
    openEditSidebar, 
    closeSidebar,
    addAssistant,
    updateAssistant 
  } = useAssistantContext();
  
  const handleSave = async (data: ExtendedAssistantFormData) => {
    if (sidebarState.mode === 'create') {
      await addAssistant(data);
    } else if (sidebarState.assistant) {
      await updateAssistant(sidebarState.assistant.id, data);
    }
  };
  
  return (
    <>
      <Button onPress={openCreateSidebar}>Create</Button>
      
      <AssistantSettingsSidebar
        visible={sidebarState.visible}
        mode={sidebarState.mode}
        assistant={sidebarState.assistant}
        onClose={closeSidebar}
        onSave={handleSave}
      />
    </>
  );
}
```

## Features

### ✅ Draft Management
- Auto-saves every 30 seconds
- Recovers on reopen
- Prompts user to restore or discard

### ✅ Unsaved Changes Warning
- Detects form modifications
- Shows warning on close
- Options: Continue, Discard, Save

### ✅ Form Validation
- Real-time validation
- Character counters
- Error messages
- Blocks invalid submission

### ✅ Permission Controls
- Role-based access
- Admin-only features
- Edit/delete permissions

### ✅ Error Handling
- Retry mechanism
- Network failure recovery
- User-friendly messages

### ✅ Responsive Design
- Desktop: 520px width
- Tablet: 70% width
- Mobile: 100% width

### ✅ Smooth Animations
- 300ms transitions
- GPU-accelerated
- Loading states

## Customization

### Disable Features

```typescript
<AssistantSettingsSidebar
  visible={true}
  mode="edit"
  assistant={assistant}
  onClose={handleClose}
  onSave={handleSave}
  canDelete={false}        // Hide delete button
  canModify={false}        // Read-only mode
/>
```

### Admin Mode

```typescript
<AssistantSettingsSidebar
  visible={true}
  mode="create"
  onClose={handleClose}
  onSave={handleSave}
  isAdmin={true}           // Show admin features
/>
```

## Styling

The component uses:
- HeroUI components for UI
- CSS modules for animations
- Design tokens for theming
- Responsive utilities

Custom styles can be applied via:
- `styles/AssistantAnimations.module.css`
- `styles/AssistantResponsive.module.css`

## Performance

### Optimizations
- Throttled draft saves (30s)
- Debounced validation (300ms)
- GPU-accelerated animations
- Lazy loading support

### Monitoring
```typescript
import { performanceMonitor } from '@/lib/utils/performanceOptimization';

// Metrics tracked:
// - draft_save: Draft save duration
// - field_validation: Validation duration
```

## Troubleshooting

### Draft not saving
- Check localStorage is enabled
- Verify browser storage quota
- Check console for errors

### Validation not working
- Ensure `validateAssistantForm` is imported
- Check field names match interface
- Verify validation rules

### Modal not closing
- Check `onClose` is called
- Verify no unsaved changes blocking
- Check for JavaScript errors

## Related Components

- `AssistantForm` - Form fields component
- `EmojiPicker` - Emoji selection
- `LazyAssistantSettingsSidebar` - Lazy-loaded wrapper

## API Reference

See full API documentation:
- `docs/ASSISTANT_SETTINGS_SIDEBAR_API.md`
- `docs/ASSISTANT_SETTINGS_SIDEBAR_USER_GUIDE.md`

## Examples

See complete examples:
- `docs/TASK_3_IMPLEMENTATION_COMPLETE.md`
- `components/AssistantSettingsSidebar.tsx`
