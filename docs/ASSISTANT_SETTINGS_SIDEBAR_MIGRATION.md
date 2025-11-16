# Assistant Settings Sidebar - Migration Guide for Developers

## Overview

This guide helps developers migrate from the old modal-based assistant creation system to the new unified sidebar approach. The migration maintains backward compatibility while providing enhanced functionality.

## Table of Contents

1. [What Changed](#what-changed)
2. [Breaking Changes](#breaking-changes)
3. [Migration Steps](#migration-steps)
4. [Code Examples](#code-examples)
5. [Testing Your Migration](#testing-your-migration)
6. [Rollback Plan](#rollback-plan)

## What Changed

### Old System (Modal-Based)

```typescript
// Old approach - separate modal for create
<CreateAssistantModal
  visible={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onSuccess={handleCreate}
/>

// Old approach - separate sidebar for edit
<AssistantEditSidebar
  visible={showEditSidebar}
  assistant={selectedAssistant}
  onClose={() => setShowEditSidebar(false)}
  onSuccess={handleUpdate}
/>
```

### New System (Unified Sidebar)

```typescript
// New approach - single component for both
<AssistantSettingsSidebar
  visible={showSidebar}
  mode={mode} // 'create' or 'edit'
  assistant={mode === 'edit' ? selectedAssistant : null}
  onClose={() => setShowSidebar(false)}
  onSave={handleSave}
  isAdmin={currentUser?.role === 'admin'}
/>
```

### Key Improvements

1. **Unified Interface**: Single component for create and edit
2. **Draft Management**: Auto-save and recovery
3. **Enhanced Validation**: Real-time validation with clear errors
4. **Better UX**: Consistent experience across operations
5. **Permission Controls**: Built-in permission checking
6. **Responsive Design**: Optimized for all screen sizes
7. **Accessibility**: Full keyboard navigation and screen reader support

## Breaking Changes

### Component Removals

The following components are deprecated and will be removed:

- `CreateAssistantModal` - Replace with `AssistantSettingsSidebar` (mode='create')
- `AssistantEditSidebar` - Replace with `AssistantSettingsSidebar` (mode='edit')
- `SimpleAssistantForm` - Replace with `AssistantForm`

### API Changes

#### Old API

```typescript
// Old create function
async function createAssistant(data: CreateAssistantData): Promise<Assistant>;

// Old update function
async function updateAssistant(id: string, data: UpdateAssistantData): Promise<Assistant>;
```

#### New API

```typescript
// Unified data structure
interface AssistantFormData {
  title: string;
  emoji: string;
  desc: string;
  prompt: string;
  tags: string[];
  isPublic: boolean;
}

// Same functions, but use unified data structure
async function createAssistant(data: AssistantFormData): Promise<Assistant>;
async function updateAssistant(id: string, data: AssistantFormData): Promise<Assistant>;
```

### Context Changes

#### Old Context

```typescript
interface AssistantContextValue {
  assistants: Assistant[];
  addAssistant: (data: CreateAssistantData) => Promise<void>;
  updateAssistant: (id: string, data: UpdateAssistantData) => Promise<void>;
  // ...
}
```

#### New Context

```typescript
interface AssistantContextValue {
  assistants: Assistant[];
  addAssistant: (data: AssistantFormData) => Promise<void>;
  updateAssistant: (id: string, data: AssistantFormData) => Promise<void>;
  
  // New methods
  openCreateSidebar: () => void;
  openEditSidebar: (assistantId: string) => void;
  // ...
}
```

## Migration Steps

### Step 1: Update Dependencies

Ensure you have the required dependencies:

```bash
npm install antd@latest
npm install @ant-design/icons@latest
```

### Step 2: Update Imports

Replace old imports:

```typescript
// OLD
import { CreateAssistantModal } from '@/components/CreateAssistantModal';
import { AssistantEditSidebar } from '@/components/AssistantEditSidebar';

// NEW
import { AssistantSettingsSidebar } from '@/components/AssistantSettingsSidebar';
```

### Step 3: Update Component Usage

#### Before (Create)

```typescript
function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  const { addAssistant } = useAssistant();

  const handleCreate = async (data: CreateAssistantData) => {
    await addAssistant(data);
    setShowModal(false);
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        Create Assistant
      </Button>
      
      <CreateAssistantModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleCreate}
      />
    </>
  );
}
```

#### After (Create)

```typescript
function MyComponent() {
  const { openCreateSidebar } = useAssistant();

  return (
    <Button onClick={openCreateSidebar}>
      Create Assistant
    </Button>
  );
}
```

#### Before (Edit)

```typescript
function MyComponent() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const { updateAssistant } = useAssistant();

  const handleEdit = (assistant: Assistant) => {
    setSelectedAssistant(assistant);
    setShowSidebar(true);
  };

  const handleUpdate = async (data: UpdateAssistantData) => {
    if (selectedAssistant) {
      await updateAssistant(selectedAssistant.id, data);
      setShowSidebar(false);
    }
  };

  return (
    <>
      <Button onClick={() => handleEdit(assistant)}>
        Edit
      </Button>
      
      <AssistantEditSidebar
        visible={showSidebar}
        assistant={selectedAssistant}
        onClose={() => setShowSidebar(false)}
        onSuccess={handleUpdate}
      />
    </>
  );
}
```

#### After (Edit)

```typescript
function MyComponent() {
  const { openEditSidebar } = useAssistant();

  return (
    <Button onClick={() => openEditSidebar(assistant.id)}>
      Edit
    </Button>
  );
}
```

### Step 4: Update Data Structures

If you have custom data structures, map them to the new format:

```typescript
// Helper function to convert old format to new
function convertToFormData(oldData: CreateAssistantData | UpdateAssistantData): AssistantFormData {
  return {
    title: oldData.name || oldData.title,
    emoji: oldData.icon || oldData.emoji || '🤖',
    desc: oldData.description || oldData.desc,
    prompt: oldData.systemPrompt || oldData.prompt,
    tags: oldData.tags || [],
    isPublic: oldData.public || oldData.isPublic || false
  };
}
```

### Step 5: Update Tests

Update your test files to use the new component:

```typescript
// OLD
import { CreateAssistantModal } from '@/components/CreateAssistantModal';

describe('CreateAssistantModal', () => {
  it('should create assistant', async () => {
    // ...
  });
});

// NEW
import { AssistantSettingsSidebar } from '@/components/AssistantSettingsSidebar';

describe('AssistantSettingsSidebar', () => {
  it('should create assistant in create mode', async () => {
    render(
      <AssistantSettingsSidebar
        visible={true}
        mode="create"
        onClose={mockClose}
        onSave={mockSave}
      />
    );
    // ...
  });

  it('should edit assistant in edit mode', async () => {
    render(
      <AssistantSettingsSidebar
        visible={true}
        mode="edit"
        assistant={mockAssistant}
        onClose={mockClose}
        onSave={mockSave}
      />
    );
    // ...
  });
});
```

### Step 6: Update Context Provider

If you're managing the sidebar state in a custom context:

```typescript
// Add to your context
const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'create' | 'edit'>('create');
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);

  const openCreateSidebar = useCallback(() => {
    setSidebarMode('create');
    setSelectedAssistant(null);
    setSidebarVisible(true);
  }, []);

  const openEditSidebar = useCallback((assistantId: string) => {
    const assistant = assistants.find(a => a.id === assistantId);
    if (assistant) {
      setSidebarMode('edit');
      setSelectedAssistant(assistant);
      setSidebarVisible(true);
    }
  }, [assistants]);

  const handleSave = async (data: AssistantFormData) => {
    if (sidebarMode === 'create') {
      await addAssistant(data);
    } else if (selectedAssistant) {
      await updateAssistant(selectedAssistant.id, data);
    }
    setSidebarVisible(false);
  };

  return (
    <AssistantContext.Provider
      value={{
        // ... existing values
        openCreateSidebar,
        openEditSidebar,
      }}
    >
      {children}
      
      <AssistantSettingsSidebar
        visible={sidebarVisible}
        mode={sidebarMode}
        assistant={selectedAssistant}
        onClose={() => setSidebarVisible(false)}
        onSave={handleSave}
        isAdmin={currentUser?.role === 'admin'}
      />
    </AssistantContext.Provider>
  );
};
```

## Code Examples

### Example 1: Simple Migration

```typescript
// Before
import { CreateAssistantModal } from '@/components/CreateAssistantModal';

function AssistantList() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)}>New</Button>
      <CreateAssistantModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

// After
import { useAssistant } from '@/contexts/AssistantContext';

function AssistantList() {
  const { openCreateSidebar } = useAssistant();

  return (
    <Button onClick={openCreateSidebar}>New</Button>
  );
}
```

### Example 2: With Custom Logic

```typescript
// Before
function AssistantManager() {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [showUI, setShowUI] = useState(false);
  const [assistant, setAssistant] = useState<Assistant | null>(null);

  const handleCreate = () => {
    setMode('create');
    setAssistant(null);
    setShowUI(true);
  };

  const handleEdit = (a: Assistant) => {
    setMode('edit');
    setAssistant(a);
    setShowUI(true);
  };

  return (
    <>
      <Button onClick={handleCreate}>Create</Button>
      {mode === 'create' ? (
        <CreateAssistantModal visible={showUI} onClose={() => setShowUI(false)} />
      ) : (
        <AssistantEditSidebar visible={showUI} assistant={assistant} onClose={() => setShowUI(false)} />
      )}
    </>
  );
}

// After
function AssistantManager() {
  const { openCreateSidebar, openEditSidebar } = useAssistant();

  return (
    <>
      <Button onClick={openCreateSidebar}>Create</Button>
      <Button onClick={() => openEditSidebar(assistant.id)}>Edit</Button>
    </>
  );
}
```

### Example 3: With Permission Checks

```typescript
// Before
function AssistantActions({ assistant }: { assistant: Assistant }) {
  const currentUser = useCurrentUser();
  const canEdit = currentUser.id === assistant.author || currentUser.role === 'admin';

  if (!canEdit) return null;

  return (
    <Button onClick={() => handleEdit(assistant)}>Edit</Button>
  );
}

// After
function AssistantActions({ assistant }: { assistant: Assistant }) {
  const { openEditSidebar } = useAssistant();
  const { canEdit } = useAssistantPermissions();

  if (!canEdit(assistant)) return null;

  return (
    <Button onClick={() => openEditSidebar(assistant.id)}>Edit</Button>
  );
}
```

## Testing Your Migration

### Manual Testing Checklist

- [ ] Create new assistant works
- [ ] Edit existing assistant works
- [ ] Delete assistant works (if applicable)
- [ ] Draft save and recovery works
- [ ] Validation shows errors correctly
- [ ] Character counters update in real-time
- [ ] Emoji picker opens and selects
- [ ] Tags can be added and removed
- [ ] Public toggle works (admin only)
- [ ] Unsaved changes warning appears
- [ ] Keyboard shortcuts work
- [ ] Mobile responsive layout works
- [ ] Dark mode styling correct

### Automated Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run specific test file
npm test AssistantSettingsSidebar

# Run with coverage
npm test -- --coverage
```

### Integration Testing

Test the complete flow:

```typescript
describe('Assistant Creation Flow', () => {
  it('should create assistant through new sidebar', async () => {
    const { getByText, getByLabelText } = render(<App />);
    
    // Open sidebar
    fireEvent.click(getByText('Create New Assistant'));
    
    // Fill form
    fireEvent.change(getByLabelText('Assistant Name'), {
      target: { value: 'Test Assistant' }
    });
    
    // Submit
    fireEvent.click(getByText('Create Assistant'));
    
    // Verify
    await waitFor(() => {
      expect(getByText('Test Assistant')).toBeInTheDocument();
    });
  });
});
```

## Rollback Plan

If you need to rollback to the old system:

### Step 1: Keep Old Components

Don't delete old components immediately:

```typescript
// Keep these files during migration period
components/CreateAssistantModal.tsx.backup
components/AssistantEditSidebar.tsx.backup
```

### Step 2: Feature Flag

Use a feature flag to control which system is active:

```typescript
const USE_NEW_SIDEBAR = process.env.NEXT_PUBLIC_USE_NEW_SIDEBAR === 'true';

function AssistantList() {
  if (USE_NEW_SIDEBAR) {
    return <NewSidebarButton />;
  }
  return <OldModalButton />;
}
```

### Step 3: Gradual Rollout

Roll out to users gradually:

```typescript
function shouldUseNewSidebar(userId: string): boolean {
  // Roll out to 10% of users
  const hash = hashCode(userId);
  return hash % 10 === 0;
}
```

### Step 4: Monitor Metrics

Track key metrics during migration:

- Assistant creation success rate
- Average time to create assistant
- Error rates
- User feedback
- Performance metrics

### Step 5: Rollback Procedure

If issues arise:

1. Set feature flag to `false`
2. Deploy previous version
3. Restore old components
4. Notify users of temporary change
5. Investigate and fix issues
6. Re-deploy when ready

## Common Issues and Solutions

### Issue: Sidebar doesn't open

**Solution:**
```typescript
// Check if context provider is wrapping your component
<AssistantProvider>
  <YourComponent />
</AssistantProvider>
```

### Issue: Draft not recovering

**Solution:**
```typescript
// Ensure localStorage is available
if (typeof window !== 'undefined' && window.localStorage) {
  // Draft management code
}
```

### Issue: Validation not working

**Solution:**
```typescript
// Import validation utilities
import { validateAssistantForm } from '@/lib/utils/assistantFormValidation';

// Use in your component
const errors = validateAssistantForm(formData);
```

### Issue: Permission checks failing

**Solution:**
```typescript
// Ensure user context is available
const currentUser = useCurrentUser();
if (!currentUser) {
  return <LoginPrompt />;
}
```

## Support and Resources

- **API Reference**: [ASSISTANT_SETTINGS_SIDEBAR_API.md](./ASSISTANT_SETTINGS_SIDEBAR_API.md)
- **User Guide**: [ASSISTANT_SETTINGS_SIDEBAR_USER_GUIDE.md](./ASSISTANT_SETTINGS_SIDEBAR_USER_GUIDE.md)
- **Troubleshooting**: [ASSISTANT_SETTINGS_SIDEBAR_TROUBLESHOOTING.md](./ASSISTANT_SETTINGS_SIDEBAR_TROUBLESHOOTING.md)
- **Design Document**: [.kiro/specs/assistant-settings-sidebar-reuse/design.md](../.kiro/specs/assistant-settings-sidebar-reuse/design.md)

## Feedback

Report migration issues or suggest improvements:

1. Create an issue in the project repository
2. Include migration step where issue occurred
3. Provide error messages and logs
4. Describe expected vs actual behavior

Your feedback helps improve the migration process for others!
