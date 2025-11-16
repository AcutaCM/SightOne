# API Fetch Error Fix

## Issue
After fixing the hydration error, you're now seeing a "Failed to fetch" error from the AssistantApiClient. This occurs because the API endpoints are trying to access a database that hasn't been initialized yet.

## Error Details
```
Error: Failed to fetch
Call Stack:
- AssistantApiClient.fetchWithRetry
- AssistantApiClient.getAll
- AssistantApiClient.syncInBackground
```

## Root Cause
The AssistantContext is trying to load data from `/api/assistants` on page load, but:
1. The SQLite database hasn't been initialized
2. The API route fails when trying to access the non-existent database
3. The fetch request fails and triggers the error

## Quick Fix Options

### Option 1: Initialize the Database (Recommended)
Run the database initialization script:

```bash
cd drone-analyzer-nextjs
npm run db:init
```

Or manually initialize:

```bash
node scripts/db-init.ts
```

### Option 2: Use Mock Data Temporarily
If you don't need real data persistence right now, you can temporarily disable the API calls and use the mock data that's already in the AssistantContext.

Modify `contexts/AssistantContext.tsx`:

```typescript
// Comment out the API call temporarily
useEffect(() => {
  const initializeData = async () => {
    if (typeof window === 'undefined') return;

    try {
      setIsLoading(true);
      setError(null);

      // TEMPORARY: Skip API call and use empty array
      // const assistants = await assistantApiClient.getAll({ useCache: true });
      const assistants: Assistant[] = []; // Use empty array or mock data
      setAssistantList(assistants);
    } catch (err) {
      console.error('Failed to initialize assistants:', err);
      setError(err instanceof Error ? err.message : '加载助理列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  initializeData();
}, [migrationChecked]);
```

### Option 3: Add Graceful Error Handling
Add better error handling to the AssistantContext to gracefully handle API failures:

```typescript
useEffect(() => {
  const initializeData = async () => {
    if (typeof window === 'undefined') return;

    try {
      setIsLoading(true);
      setError(null);

      // Try to load from API, but don't fail if it's not available
      try {
        const assistants = await assistantApiClient.getAll({ useCache: true });
        setAssistantList(assistants);
      } catch (apiError) {
        console.warn('API not available, using empty list:', apiError);
        // Use empty list if API is not available
        setAssistantList([]);
        // Don't set error state - just log it
      }
    } catch (err) {
      console.error('Failed to initialize assistants:', err);
      setError(err instanceof Error ? err.message : '加载助理列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  initializeData();
}, [migrationChecked]);
```

## Permanent Solution

For production, you should:

1. **Initialize the database** before starting the app
2. **Add health checks** to verify the database is accessible
3. **Implement proper error boundaries** to handle API failures gracefully
4. **Add retry logic** with exponential backoff (already implemented in AssistantApiClient)
5. **Show user-friendly error messages** when the API is unavailable

## Testing the Fix

After applying one of the fixes above:

1. Refresh the page
2. Check the browser console - the "Failed to fetch" error should be gone
3. The admin review page should load without errors
4. The table should display (empty if using Option 2 or 3)

## Related Files
- `drone-analyzer-nextjs/contexts/AssistantContext.tsx` - Context that loads data
- `drone-analyzer-nextjs/lib/api/assistantApiClient.ts` - API client with retry logic
- `drone-analyzer-nextjs/app/api/assistants/route.ts` - API endpoint
- `drone-analyzer-nextjs/lib/db/assistantRepository.ts` - Database repository
- `drone-analyzer-nextjs/scripts/db-init.ts` - Database initialization script

## Date
November 3, 2025
