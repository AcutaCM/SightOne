# AssistantContext Quick Reference

## Import

```typescript
import { useAssistants } from '@/contexts/AssistantContext';
import { Assistant } from '@/types/assistant';
```

## Basic Usage

```typescript
const {
  assistantList,
  publishedAssistants,
  pendingAssistants,
  isLoading,
  error,
  addAssistant,
  updateAssistant,
  deleteAssistant,
  updateAssistantStatus,
  refreshAssistants,
  getAssistantById,
  clearError,
  hasVersionConflict,
} = useAssistants();
```

## Common Patterns

### Display Loading State

```typescript
if (isLoading) {
  return <Spinner />;
}

if (error) {
  return <Alert color="danger">{error}</Alert>;
}

return <AssistantList assistants={assistantList} />;
```

### Create Assistant

```typescript
const handleCreate = async () => {
  try {
    const newAssistant = await addAssistant({
      title: 'My Assistant',
      desc: 'Description',
      emoji: '🤖',
      prompt: 'System prompt',
      tags: ['tag1', 'tag2'],
      isPublic: true,
      status: 'draft',
      author: 'User Name',
    });
    
    toast.success('Assistant created!');
    return newAssistant;
  } catch (error) {
    toast.error('Failed to create assistant');
    console.error(error);
  }
};
```

### Update Assistant

```typescript
const handleUpdate = async (id: string) => {
  try {
    await updateAssistant(id, {
      title: 'Updated Title',
      desc: 'Updated Description',
    });
    
    toast.success('Assistant updated!');
  } catch (error) {
    if (error instanceof Error && hasVersionConflict(error)) {
      // Handle version conflict
      showConflictDialog();
    } else {
      toast.error('Failed to update assistant');
    }
  }
};
```

### Delete Assistant

```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure?')) return;
  
  try {
    await deleteAssistant(id);
    toast.success('Assistant deleted!');
  } catch (error) {
    toast.error('Failed to delete assistant');
  }
};
```

### Update Status (Admin)

```typescript
const handleApprove = async (id: string) => {
  try {
    await updateAssistantStatus(id, 'published', 'Approved!');
    toast.success('Assistant published!');
  } catch (error) {
    toast.error('Failed to update status');
  }
};

const handleReject = async (id: string, reason: string) => {
  try {
    await updateAssistantStatus(id, 'rejected', reason);
    toast.success('Assistant rejected');
  } catch (error) {
    toast.error('Failed to update status');
  }
};
```

### Refresh Data

```typescript
const handleRefresh = async () => {
  try {
    await refreshAssistants();
    toast.success('Data refreshed!');
  } catch (error) {
    toast.error('Failed to refresh');
  }
};
```

### Get Specific Assistant

```typescript
const assistant = getAssistantById('assistant-id');

if (assistant) {
  console.log(assistant.title);
} else {
  console.log('Assistant not found');
}
```

### Filter Assistants

```typescript
// Published assistants
const published = publishedAssistants;

// Pending assistants
const pending = pendingAssistants;

// Custom filter
const myAssistants = assistantList.filter(a => a.author === currentUser);
const draftAssistants = assistantList.filter(a => a.status === 'draft');
```

## Version Conflict Handling

```typescript
import { useVersionConflict } from '@/hooks/useVersionConflict';
import { VersionConflictDialog } from '@/components/VersionConflictDialog';

function MyComponent() {
  const { updateAssistant, hasVersionConflict, refreshAssistants, getAssistantById } = useAssistants();
  const { conflictState, showConflictDialog, hideConflictDialog, handleRetry } = useVersionConflict();

  const handleUpdate = async (id: string, updates: Partial<Assistant>) => {
    try {
      await updateAssistant(id, updates);
    } catch (error) {
      if (error instanceof Error && hasVersionConflict(error)) {
        const assistant = getAssistantById(id);
        showConflictDialog(
          id,
          assistant?.title || 'Unknown',
          () => handleUpdate(id, updates)
        );
      }
    }
  };

  return (
    <>
      {/* Your component */}
      <VersionConflictDialog
        isOpen={conflictState.isOpen}
        onClose={hideConflictDialog}
        onRefresh={refreshAssistants}
        onRetry={handleRetry}
        assistantTitle={conflictState.assistantTitle || undefined}
      />
    </>
  );
}
```

## Error Handling

```typescript
// Clear error manually
clearError();

// Check for specific error types
if (error?.includes('network')) {
  // Handle network error
} else if (error?.includes('permission')) {
  // Handle permission error
}
```

## TypeScript Types

```typescript
import { Assistant } from '@/types/assistant';

type AssistantStatus = 'draft' | 'pending' | 'published' | 'rejected';

interface CreateAssistantData {
  title: string;
  desc: string;
  emoji: string;
  prompt: string;
  tags?: string[];
  isPublic: boolean;
  status: AssistantStatus;
  author: string;
}
```

## Best Practices

1. **Always use try-catch** for async operations
2. **Show loading states** during operations
3. **Handle version conflicts** gracefully
4. **Provide user feedback** with toasts/alerts
5. **Validate data** before submitting
6. **Use optimistic updates** for better UX
7. **Refresh data** after conflicts

## Performance Tips

1. Use `publishedAssistants` and `pendingAssistants` instead of filtering manually
2. Use `getAssistantById` instead of `find()` for single lookups
3. Avoid unnecessary re-renders by memoizing callbacks
4. Use `refreshAssistants` sparingly (data auto-syncs in background)

## Common Mistakes

❌ **Don't forget await:**
```typescript
// Wrong
addAssistant(data);

// Correct
await addAssistant(data);
```

❌ **Don't ignore errors:**
```typescript
// Wrong
await updateAssistant(id, updates);

// Correct
try {
  await updateAssistant(id, updates);
} catch (error) {
  handleError(error);
}
```

❌ **Don't mutate assistantList directly:**
```typescript
// Wrong
assistantList.push(newAssistant);

// Correct
await addAssistant(newAssistant);
```

## Migration from Old Version

### Before (localStorage)
```typescript
const handleCreate = () => {
  addAssistant(newAssistant);
  toast.success('Created!');
};
```

### After (API + Cache)
```typescript
const handleCreate = async () => {
  try {
    await addAssistant(newAssistant);
    toast.success('Created!');
  } catch (error) {
    toast.error('Failed to create');
  }
};
```

## Troubleshooting

### Data not loading?
- Check `isLoading` state
- Check `error` message
- Verify API server is running
- Check browser console for errors

### Version conflicts?
- Use `VersionConflictDialog` component
- Implement retry logic
- Refresh data when conflicts occur

### Slow performance?
- Data is cached in IndexedDB
- First load should be fast
- Background sync happens automatically
- Use `refreshAssistants` only when needed

## Support

For issues or questions:
1. Check the error message in `error` state
2. Review browser console logs
3. Check network tab for API calls
4. Verify database file exists: `data/assistants.db`
