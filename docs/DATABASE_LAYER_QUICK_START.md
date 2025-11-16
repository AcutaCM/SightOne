# Database Layer Quick Start Guide

## Installation

The required dependencies are already installed:
- `better-sqlite3` - SQLite database driver
- `@types/better-sqlite3` - TypeScript definitions

## Quick Start

### 1. Import the Repository

```typescript
import { getDefaultRepository } from '@/lib/db/assistantRepository';

const repository = getDefaultRepository();
```

### 2. Create an Assistant

```typescript
const assistant = repository.create({
  id: crypto.randomUUID(),
  title: 'Code Helper',
  desc: 'Helps with coding tasks',
  emoji: '💻',
  prompt: 'You are a helpful coding assistant',
  tags: ['coding', 'development'],
  isPublic: true,
  status: 'draft',
  author: 'user@example.com',
});

console.log('Created:', assistant.id);
```

### 3. Find Assistants

```typescript
// Find by ID
const assistant = repository.findById('some-id');

// List all
const all = repository.findAll();

// Filter by status
const published = repository.findAll({ status: 'published' });

// Search with pagination
const results = repository.findAll({
  search: 'coding',
  page: 1,
  pageSize: 10,
});
```

### 4. Update an Assistant

```typescript
const updated = repository.update(
  assistant.id,
  {
    title: 'Updated Title',
    desc: 'Updated description',
  },
  assistant.version // Required for optimistic locking
);
```

### 5. Update Status

```typescript
const published = repository.updateStatus(
  assistant.id,
  'published',
  assistant.version,
  'Approved for publication'
);
```

### 6. Delete an Assistant

```typescript
const deleted = repository.delete(assistant.id);
console.log('Deleted:', deleted); // true if successful
```

## Error Handling

```typescript
import {
  VersionConflictError,
  NotFoundError,
  RepositoryError
} from '@/lib/db/assistantRepository';

try {
  repository.update(id, updates, version);
} catch (error) {
  if (error instanceof VersionConflictError) {
    // Data was modified by another user
    // Refresh and retry
  } else if (error instanceof NotFoundError) {
    // Assistant doesn't exist
  } else if (error instanceof RepositoryError) {
    // Other database error
    console.error(error.code, error.message);
  }
}
```

## Database Location

Default: `./data/assistants.db`

Override with environment variable:
```env
DATABASE_PATH=./custom/path/assistants.db
```

## Common Patterns

### Pagination

```typescript
function getPage(page: number, pageSize: number = 20) {
  const result = repository.findAll({ page, pageSize });
  
  return {
    items: result.data,
    total: result.total,
    page: result.page,
    totalPages: Math.ceil(result.total / pageSize),
    hasNext: page * pageSize < result.total,
    hasPrev: page > 1,
  };
}
```

### Safe Update with Retry

```typescript
async function safeUpdate(id: string, updates: Partial<Assistant>) {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const current = repository.findById(id);
      if (!current) throw new Error('Not found');
      
      return repository.update(id, updates, current.version);
    } catch (error) {
      if (error instanceof VersionConflictError && retries > 1) {
        retries--;
        continue;
      }
      throw error;
    }
  }
}
```

### Batch Operations

```typescript
function createBatch(assistants: Array<Omit<Assistant, 'version' | 'createdAt'>>) {
  const created = [];
  const errors = [];
  
  for (const assistant of assistants) {
    try {
      created.push(repository.create(assistant));
    } catch (error) {
      errors.push({ assistant, error });
    }
  }
  
  return { created, errors };
}
```

## Testing

Run tests:
```bash
npm test -- __tests__/db --no-watch
```

## API Reference

### Repository Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `create(data)` | Create new assistant | `Assistant` |
| `findById(id)` | Find by ID | `Assistant \| null` |
| `findAll(filters?)` | List with filters | `AssistantListResponse` |
| `update(id, updates, version)` | Update assistant | `Assistant` |
| `delete(id)` | Delete assistant | `boolean` |
| `updateStatus(id, status, version, note?)` | Update status | `Assistant` |
| `getAllForBackup()` | Get all (no pagination) | `Assistant[]` |
| `countByStatus()` | Count by status | `Record<Status, number>` |
| `close()` | Close connection | `void` |

### Filter Options

```typescript
interface AssistantQueryFilters {
  status?: 'draft' | 'pending' | 'published' | 'rejected';
  author?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
```

## Performance Tips

1. **Use Indexes**: Queries on `status`, `author`, and `created_at` are optimized
2. **Pagination**: Always use pagination for large datasets
3. **Batch Operations**: Group multiple operations when possible
4. **Connection Reuse**: Use `getDefaultRepository()` for singleton instance
5. **Close Connections**: Call `close()` when done (especially in tests)

## Troubleshooting

### Database Locked Error
- Ensure only one process accesses the database
- Check for unclosed connections
- WAL mode helps with concurrency

### Version Conflict Errors
- Refresh data before updating
- Implement retry logic
- Show user-friendly conflict resolution UI

### Performance Issues
- Check if indexes are being used
- Reduce page size for faster queries
- Use `getAllForBackup()` sparingly

## Next Steps

- Implement API endpoints (Task 3)
- Add IndexedDB caching (Task 4)
- Create API client service (Task 5)
