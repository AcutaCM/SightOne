# Hydration Error Fix - ExportButton Component

## Issue
React hydration error occurred in the `ExportButton` component within the workflow editor:

```
Hydration failed because the server rendered HTML didn't match the client.
```

## Root Cause
The hydration mismatch was caused by two issues:

1. **Client-only API check**: The `isExportSupported()` function checks for `typeof document !== 'undefined'`, which returns:
   - `false` on the server (during SSR)
   - `true` on the client (after hydration)

2. **Dynamic timestamp**: Using `Date.now()` for filename generation produces different values between server and client renders.

## Solution

### 1. Added Mounted State
```typescript
const [isMounted, setIsMounted] = useState(false);

React.useEffect(() => {
  setIsMounted(true);
}, []);
```

This ensures we only check for export support after the component has mounted on the client.

### 2. Conditional Export Support Check
```typescript
const exportSupported = isMounted && isExportSupported();
```

Now the check only runs client-side, preventing server/client mismatch.

### 3. Placeholder Rendering
```typescript
if (!isMounted) {
  return (
    <div className={`${styles.exportButton} ${className || ''}`} 
         style={{ opacity: 0, pointerEvents: 'none' }}>
      <button disabled aria-hidden="true">
        {/* Static SVG icon */}
      </button>
    </div>
  );
}
```

Renders a hidden placeholder during SSR that matches the client structure.

### 4. Stable Timestamp Generation
```typescript
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `workflow-${timestamp}`;
```

Moved timestamp generation inside the export handler (client-side only).

## Testing

To verify the fix:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the workflow editor**:
   Navigate to `/workflow` or any page with the workflow canvas.

3. **Check browser console**:
   - No hydration errors should appear
   - Export button should render correctly

4. **Test export functionality**:
   - Click the export button
   - Verify PNG and SVG export options work
   - Check that filenames include proper timestamps

## Additional Fix: LogList Timestamp Error

### Issue
After fixing the hydration error, a new error appeared:
```
Error: date.getHours is not a function
```

### Root Cause
The `formatTimestamp` function in `LogList` component expected a `Date` object, but timestamps were being passed as strings or numbers.

### Solution
Updated the `formatTimestamp` function to handle multiple timestamp formats:

```typescript
function formatTimestamp(date: Date | string | number): string {
  // Convert to Date object if needed
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if valid date
  if (isNaN(dateObj.getTime())) {
    return '00:00:00.000';
  }
  
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const seconds = dateObj.getSeconds().toString().padStart(2, '0');
  const ms = dateObj.getMilliseconds().toString().padStart(3, '0');
  
  return `${hours}:${minutes}:${seconds}.${ms}`;
}
```

Also updated the `LogEntry` interface:
```typescript
export interface LogEntry {
  id: string;
  timestamp: Date | string | number; // Now accepts multiple formats
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  nodeId?: string;
}
```

## Related Files

- `drone-analyzer-nextjs/components/workflow/ExportButton.tsx` - Fixed hydration error
- `drone-analyzer-nextjs/components/workflow/LogList.tsx` - Fixed timestamp formatting
- `drone-analyzer-nextjs/lib/workflow/workflowExporter.ts` - Export utilities
- `drone-analyzer-nextjs/components/workflow/CanvasToolbar.tsx` - Parent component

## Best Practices

When working with Next.js SSR, always:

1. **Use `useEffect` for client-only code**: Wrap browser API checks in `useEffect`
2. **Add mounted state**: Track when component has hydrated
3. **Avoid dynamic values in initial render**: Don't use `Date.now()`, `Math.random()`, etc. during SSR
4. **Match server/client structure**: Ensure HTML structure is identical
5. **Use `'use client'` directive**: Mark components using browser APIs

## References

- [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [SSR Best Practices](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
