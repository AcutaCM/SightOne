# Assistant Settings Sidebar - API Reference

## Overview

This document provides a complete API reference for the Assistant Settings Sidebar components and services. The sidebar provides a unified interface for creating and editing assistants with draft management, validation, and permission controls.

## Components

### AssistantSettingsSidebar

The main sidebar component that handles both create and edit modes.

#### Props

```typescript
interface AssistantSettingsSidebarProps {
  // Display state
  visible: boolean;
  onClose: () => void;
  
  // Mode: 'create' | 'edit'
  mode: 'create' | 'edit';
  
  // Assistant data (required for edit mode)
  assistant?: Assistant | null;
  
  // Callbacks
  onSave: (data: AssistantFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  
  // Permission controls
  canDelete?: boolean;
  canModify?: boolean;
  isAdmin?: boolean;
}
```

#### Usage Example

```typescript
import { AssistantSettingsSidebar } from '@/components/AssistantSettingsSidebar';

function MyComponent() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);

  const handleSave = async (data: AssistantFormData) => {
    if (mode === 'create') {
      await createAssistant(data);
    } else {
      await updateAssistant(selectedAssistant.id, data);
    }
    setVisible(false);
  };

  return (
    <>
      <Button onClick={() => {
        setMode('create');
        setSelectedAssistant(null);
        setVisible(true);
      }}>
        Create Assistant
      </Button>

      <AssistantSettingsSidebar
        visible={visible}
        onClose={() => setVisible(false)}
        mode={mode}
        assistant={selectedAssistant}
        onSave={handleSave}
        isAdmin={currentUser?.role === 'admin'}
      />
    </>
  );
}
```

### AssistantForm

The form component used within the sidebar for collecting assistant data.

#### Props

```typescript
interface AssistantFormProps {
  // Initial form data
  initialData?: Partial<AssistantFormData>;
  
  // Form submission
  onSubmit: (data: AssistantFormData) => void;
  
  // Form state callbacks
  onChange?: (data: AssistantFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
  
  // Permission controls
  isAdmin?: boolean;
  disabled?: boolean;
  
  // Loading state
  loading?: boolean;
}
```

#### Form Data Structure

```typescript
interface AssistantFormData {
  title: string;          // 1-50 characters
  emoji: string;          // Single emoji character
  desc: string;           // 1-200 characters
  prompt: string;         // 1-2000 characters
  tags: string[];         // Max 5 tags, each max 20 characters
  isPublic: boolean;      // Visibility setting
}
```

### EmojiPicker

Enhanced emoji picker component with search and categories.

#### Props

```typescript
interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  disabled?: boolean;
}
```

#### Usage Example

```typescript
import { EmojiPicker } from '@/components/EmojiPicker';

function MyForm() {
  const [emoji, setEmoji] = useState('🦄');

  return (
    <EmojiPicker
      value={emoji}
      onChange={setEmoji}
    />
  );
}
```

## Services

### AssistantDraftManager

Service for managing form drafts in localStorage.

#### Methods

```typescript
class AssistantDraftManager {
  /**
   * Save form data as draft
   * @param data - Form data to save
   */
  saveDraft(data: AssistantFormData): void;

  /**
   * Load saved draft
   * @returns Draft data or null if no valid draft exists
   */
  loadDraft(): AssistantFormData | null;

  /**
   * Clear saved draft
   */
  clearDraft(): void;

  /**
   * Check if valid draft exists
   * @returns True if draft exists and not expired
   */
  hasDraft(): boolean;

  /**
   * Get draft timestamp
   * @returns Draft creation date or null
   */
  getDraftTimestamp(): Date | null;

  /**
   * Clean expired drafts (older than 7 days)
   */
  cleanExpiredDrafts(): void;
}
```

#### Usage Example

```typescript
import { assistantDraftManager } from '@/lib/services/assistantDraftManager';

// Save draft
assistantDraftManager.saveDraft({
  title: 'My Assistant',
  emoji: '🤖',
  desc: 'A helpful assistant',
  prompt: 'You are a helpful assistant',
  tags: ['helper'],
  isPublic: false
});

// Check for draft
if (assistantDraftManager.hasDraft()) {
  const draft = assistantDraftManager.loadDraft();
  console.log('Found draft:', draft);
}

// Clear draft after successful save
assistantDraftManager.clearDraft();
```

### AssistantPermissionService

Service for checking user permissions for assistant operations.

#### Methods

```typescript
class AssistantPermissionService {
  /**
   * Check if user can create assistants
   * @param user - Current user
   * @returns True if user can create assistants
   */
  canCreate(user: User): boolean;

  /**
   * Check if user can edit assistant
   * @param user - Current user
   * @param assistant - Assistant to edit
   * @returns True if user can edit the assistant
   */
  canEdit(user: User, assistant: Assistant): boolean;

  /**
   * Check if user can delete assistant
   * @param user - Current user
   * @param assistant - Assistant to delete
   * @returns True if user can delete the assistant
   */
  canDelete(user: User, assistant: Assistant): boolean;

  /**
   * Check if user can publish assistant
   * @param user - Current user
   * @param assistant - Assistant to publish
   * @returns True if user can publish the assistant
   */
  canPublish(user: User, assistant: Assistant): boolean;
}
```

#### Usage Example

```typescript
import { assistantPermissionService } from '@/lib/services/assistantPermissionService';

const user = getCurrentUser();
const assistant = getAssistant('123');

// Check permissions
if (assistantPermissionService.canEdit(user, assistant)) {
  // Show edit button
}

if (assistantPermissionService.canDelete(user, assistant)) {
  // Show delete button
}

if (assistantPermissionService.canPublish(user, assistant)) {
  // Show public toggle
}
```

### AssistantFormValidation

Validation utilities for assistant form fields.

#### Functions

```typescript
/**
 * Validate assistant title
 * @param title - Title to validate
 * @returns Error message or null if valid
 */
function validateTitle(title: string): string | null;

/**
 * Validate assistant emoji
 * @param emoji - Emoji to validate
 * @returns Error message or null if valid
 */
function validateEmoji(emoji: string): string | null;

/**
 * Validate assistant description
 * @param desc - Description to validate
 * @returns Error message or null if valid
 */
function validateDescription(desc: string): string | null;

/**
 * Validate assistant prompt
 * @param prompt - Prompt to validate
 * @returns Error message or null if valid
 */
function validatePrompt(prompt: string): string | null;

/**
 * Validate assistant tags
 * @param tags - Tags array to validate
 * @returns Error message or null if valid
 */
function validateTags(tags: string[]): string | null;

/**
 * Validate entire form data
 * @param data - Form data to validate
 * @returns Object with field errors or empty object if valid
 */
function validateAssistantForm(data: AssistantFormData): Record<string, string>;
```

#### Validation Rules

| Field | Rules |
|-------|-------|
| title | Required, 1-50 characters, alphanumeric + spaces |
| emoji | Required, single emoji character |
| desc | Required, 1-200 characters |
| prompt | Required, 1-2000 characters |
| tags | Optional, max 5 tags, each max 20 characters |
| isPublic | Boolean, admin only |

## Context Integration

### AssistantContext

The sidebar integrates with AssistantContext for state management.

#### New Methods

```typescript
interface AssistantContextValue {
  // ... existing methods ...

  /**
   * Open sidebar in create mode
   */
  openCreateSidebar(): void;

  /**
   * Open sidebar in edit mode
   * @param assistantId - ID of assistant to edit
   */
  openEditSidebar(assistantId: string): void;
}
```

#### Usage Example

```typescript
import { useAssistant } from '@/contexts/AssistantContext';

function MyComponent() {
  const { openCreateSidebar, openEditSidebar } = useAssistant();

  return (
    <>
      <Button onClick={openCreateSidebar}>
        Create New Assistant
      </Button>

      <Button onClick={() => openEditSidebar('assistant-123')}>
        Edit Assistant
      </Button>
    </>
  );
}
```

## Error Handling

### Error Types

```typescript
enum AssistantErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

interface AssistantError {
  type: AssistantErrorType;
  message: string;
  field?: keyof AssistantFormData;
  details?: any;
}
```

### Error Recovery

The system provides automatic error recovery:

1. **Validation Errors**: Displayed inline with fields
2. **Network Errors**: Retry with exponential backoff
3. **Permission Errors**: Clear error messages
4. **Conflict Errors**: Prompt to refresh data
5. **Unknown Errors**: Draft saved, error logged

## Events

### Form Events

```typescript
// Form data changed
onChange: (data: AssistantFormData) => void;

// Validation state changed
onValidationChange: (isValid: boolean) => void;

// Form submitted
onSubmit: (data: AssistantFormData) => void;

// Form cancelled
onCancel: () => void;
```

### Sidebar Events

```typescript
// Sidebar opened
onOpen: () => void;

// Sidebar closed
onClose: () => void;

// Save completed
onSave: (data: AssistantFormData) => Promise<void>;

// Delete completed
onDelete: (id: string) => Promise<void>;
```

## Styling

### CSS Modules

The components use CSS modules for styling:

- `AssistantAnimations.module.css` - Animation styles
- `AssistantResponsive.module.css` - Responsive breakpoints

### Ant Design Theme

The components use Ant Design's theme system. Customize via `ConfigProvider`:

```typescript
import { ConfigProvider } from 'antd';

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 8,
    },
  }}
>
  <AssistantSettingsSidebar {...props} />
</ConfigProvider>
```

## Performance

### Optimization Features

1. **Debounced Validation**: 300ms delay
2. **Throttled Draft Saves**: 30s interval
3. **Lazy Loading**: Sidebar loaded on demand
4. **Memoization**: Form components memoized

### Performance Targets

- Sidebar open time: < 300ms
- Form validation: < 100ms
- Draft save: < 50ms (non-blocking)
- Character count update: < 16ms (60fps)

## Accessibility

### Keyboard Navigation

- `Tab` - Navigate between fields
- `Enter` - Submit form (when valid)
- `Esc` - Close sidebar
- `Ctrl+S` - Save draft

### Screen Reader Support

All components include proper ARIA labels and roles:

```typescript
<Drawer
  title="Create New Assistant"
  aria-label="Assistant settings sidebar"
  role="dialog"
  aria-modal="true"
>
  {/* Form content */}
</Drawer>
```

## Migration Guide

See [ASSISTANT_SETTINGS_SIDEBAR_MIGRATION.md](./ASSISTANT_SETTINGS_SIDEBAR_MIGRATION.md) for detailed migration instructions from the old modal-based system.

## Troubleshooting

See [ASSISTANT_SETTINGS_SIDEBAR_TROUBLESHOOTING.md](./ASSISTANT_SETTINGS_SIDEBAR_TROUBLESHOOTING.md) for common issues and solutions.
