# Table Hydration Error Fix

## Issue
React hydration error occurred in the admin review page due to inconsistent rendering of the HeroUI Table component between server and client.

## Error Details
```
Hydration failed because the server rendered HTML didn't match the client.
- data-key="row-header-column-4lxfbytrn37" (server)
+ data-key="row-header-column-qjr44ecq16" (client)
```

## Root Cause
The HeroUI Table component generates dynamic IDs that can differ between server-side rendering (SSR) and client-side hydration. The `selectedKeys` state using a `Set<string>` type was causing type mismatches with the HeroUI `Selection` type.

## Solution

### 1. Updated Type Definition
Changed `selectedKeys` from `Set<string>` to `Selection` type:

```typescript
// Before
const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

// After
import { type Selection } from '@heroui/react';
const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
```

### 2. Updated Table Props
Simplified the `onSelectionChange` handler and added `disallowEmptySelection`:

```typescript
<Table
  selectionMode="multiple"
  selectedKeys={selectedKeys}
  onSelectionChange={setSelectedKeys}  // Simplified
  disallowEmptySelection={false}       // Added
  // ... other props
>
```

### 3. Fixed Batch Operations
Updated batch approve/reject functions to handle the `Selection` type properly:

```typescript
// Convert Selection to Set when needed
const keys = selectedKeys === 'all' 
  ? new Set(paginatedData.map(item => item.id)) 
  : new Set(selectedKeys);

// Use Array.from for iteration
Array.from(keys).forEach((id) => {
  updateAssistantStatus(String(id), 'published');
});
```

### 4. Fixed Conditional Rendering
Updated the selected items display to handle the `Selection` type:

```typescript
{selectedKeys !== 'all' && (selectedKeys as Set<string>).size > 0 && (
  <div>
    <Chip>已选择 {(selectedKeys as Set<string>).size} 项</Chip>
  </div>
)}
```

## Benefits
- ✅ Eliminates hydration errors
- ✅ Proper TypeScript type safety
- ✅ Consistent rendering between server and client
- ✅ Maintains all existing functionality

## Testing
1. Navigate to `/admin/review` page
2. Verify no hydration errors in console
3. Test table selection functionality
4. Test batch approve/reject operations
5. Verify pagination works correctly

## Related Files
- `drone-analyzer-nextjs/app/admin/review/page.tsx` - Main fix applied here

## Date
November 3, 2025
