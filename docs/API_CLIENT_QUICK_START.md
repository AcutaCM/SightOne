# Assistant API Client - Quick Start Guide

## Installation

The API client is already set up and ready to use. Simply import it:

```typescript
import { assistantApiClient } from '@/lib/api/assistantApiClient';
```

## Basic Usage

### Fetch All Assistants

```typescript
// Get all assistants (uses cache if available)
const assistants = await assistantApiClient.getAll();

// With filters
const filtered = await assistantApiClient.getAll({
  status: 'published',
  author: 'user-123',
  search: 'keyword',
  page: 1,
  pageSize: 20,
});

// Force fresh data from server
const fresh = await assistantApiClient.getAll({ useCache: false });
```

### Get Single Assistant

```typescript
// Get by ID (uses cache if available)
const assistant = await assistantApiClient.getById('assistant-id');

// Force fresh data
const fresh = await assistantApiClient.getById('assistant-id', false);
```

### Create Assistant

```typescript
const newAssistant = await assistantApiClient.create({
  title: 'My Assistant',
  desc: 'A helpful assistant',
  emoji: '🤖',
  prompt: 'You are a helpful assistant',
  tags: ['helper', 'general'],
  isPublic: false,
});

console.log('Created:', newAssistant.id);
```

### Update Assistant

```typescript
try {
  const updated = await assistantApiClient.update('assistant-id', {
    title: 'Updated Title',
    desc: 'Updated description',
    version: 1, // Current version for optimistic locking
  });
  
  console.log('Updated to version:', updated.version);
} catch (error) {
  if (error.message.includes('Version conflict')) {
    // Handle concurrent edit
    alert('This assistant was modified by another user. Please refresh.');
  }
}
```

### Delete Assistant

```typescript
await assistantApiClient.delete('assistant-id');
console.log('Deleted successfully');
```

### Update Status (Admin)

```typescript
const reviewed = await assistantApiClient.updateStatus('assistant-id', {
  status: 'published',
  reviewNote: 'Looks good!',
  version: 1,
});

console.log('Status updated:', reviewed.status);
```

## Advanced Features

### Cache Management

```typescript
// Clean expired cache entries
const cleaned = await assistantApiClient.cleanExpiredCache();
console.log(`Cleaned ${cleaned} expired entries`);

// Clear all cache (e.g., on logout)
await assistantApiClient.clearCache();
```

### Error Handling

```typescript
try {
  const assistant = await assistantApiClient.getById('id');
} catch (error) {
  if (error.message === 'Assistant not found') {
    // Handle 404
  } else if (error.message.includes('Version conflict')) {
    // Handle concurrent edit
  } else {
    // Handle other errors
    console.error('Failed to fetch:', error);
  }
}
```

### Custom Configuration

```typescript
import { AssistantApiClient } from '@/lib/api/assistantApiClient';

const customClient = new AssistantApiClient({
  baseUrl: '/api/v2/assistants',
  maxRetries: 5,
  retryDelay: 2000,
  timeout: 60000,
});
```

## React Integration Example

```typescript
import { useState, useEffect } from 'react';
import { assistantApiClient } from '@/lib/api/assistantApiClient';
import { Assistant } from '@/types/assistant';

function AssistantList() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssistants();
  }, []);

  const loadAssistants = async () => {
    try {
      setLoading(true);
      const data = await assistantApiClient.getAll();
      setAssistants(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      const newAssistant = await assistantApiClient.create(data);
      setAssistants([...assistants, newAssistant]);
    } catch (err) {
      alert('Failed to create: ' + err.message);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const updated = await assistantApiClient.update(id, data);
      setAssistants(assistants.map(a => a.id === id ? updated : a));
    } catch (err) {
      if (err.message.includes('Version conflict')) {
        alert('This assistant was modified by another user. Refreshing...');
        loadAssistants();
      } else {
        alert('Failed to update: ' + err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      await assistantApiClient.delete(id);
      setAssistants(assistants.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {assistants.map(assistant => (
        <div key={assistant.id}>
          <h3>{assistant.title}</h3>
          <p>{assistant.desc}</p>
          <button onClick={() => handleUpdate(assistant.id, { 
            title: 'Updated',
            version: assistant.version 
          })}>
            Update
          </button>
          <button onClick={() => handleDelete(assistant.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Performance Tips

1. **Use Cache by Default:** The client automatically caches data for fast subsequent loads
2. **Background Sync:** Cached data is automatically refreshed in the background
3. **Optimistic Updates:** Update UI immediately, sync with server in background
4. **Batch Operations:** Group multiple operations when possible
5. **Clean Cache Periodically:** Call `cleanExpiredCache()` on app startup

## Caching Behavior

- **Cache TTL:** 7 days
- **Cache Strategy:** Cache-first with background sync
- **Cache Storage:** IndexedDB (client-side)
- **Cache Updates:** Automatic after mutations
- **Cache Invalidation:** Automatic on expiration

## Retry Behavior

- **Max Retries:** 3 attempts
- **Retry Delay:** Exponential backoff (1s, 2s, 4s)
- **Retry Conditions:** Network errors, timeouts
- **No Retry:** Client errors (4xx), version conflicts

## Common Patterns

### Loading State

```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await assistantApiClient.getAll();
    // Use data
  } finally {
    setLoading(false);
  }
};
```

### Error Handling

```typescript
const [error, setError] = useState<string | null>(null);

try {
  await assistantApiClient.create(data);
  setError(null);
} catch (err) {
  setError(err.message);
}
```

### Optimistic Updates

```typescript
// Update UI immediately
setAssistants(assistants.map(a => 
  a.id === id ? { ...a, title: 'New Title' } : a
));

// Sync with server
try {
  await assistantApiClient.update(id, { title: 'New Title', version });
} catch (err) {
  // Revert on error
  loadAssistants();
}
```

### Version Conflict Handling

```typescript
const handleUpdate = async (id, updates, currentVersion) => {
  try {
    return await assistantApiClient.update(id, {
      ...updates,
      version: currentVersion,
    });
  } catch (err) {
    if (err.message.includes('Version conflict')) {
      // Fetch latest version
      const latest = await assistantApiClient.getById(id, false);
      
      // Show conflict dialog
      const shouldRetry = confirm(
        `This assistant was modified by another user. ` +
        `Current version: ${latest.version}. Retry with latest version?`
      );
      
      if (shouldRetry) {
        // Retry with latest version
        return handleUpdate(id, updates, latest.version);
      }
    }
    throw err;
  }
};
```

## Troubleshooting

### Cache Not Working

```typescript
// Check if IndexedDB is available
if (!window.indexedDB) {
  console.warn('IndexedDB not available');
}

// Clear cache and retry
await assistantApiClient.clearCache();
const data = await assistantApiClient.getAll({ useCache: false });
```

### Slow Performance

```typescript
// Clean expired cache
await assistantApiClient.cleanExpiredCache();

// Use pagination
const data = await assistantApiClient.getAll({
  page: 1,
  pageSize: 20,
});
```

### Network Errors

```typescript
// The client automatically retries on network errors
// Check console for retry attempts
// Increase timeout if needed
const client = new AssistantApiClient({
  timeout: 60000, // 60 seconds
  maxRetries: 5,
});
```

## API Reference

See the full API documentation in the source file:
- `lib/api/assistantApiClient.ts`

## Type Definitions

See type definitions in:
- `types/assistant.ts`

