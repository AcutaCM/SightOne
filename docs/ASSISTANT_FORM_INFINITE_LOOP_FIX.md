# AssistantForm Infinite Loop Fix

## Problem

The AssistantForm component was causing a "Maximum update depth exceeded" error due to an infinite loop in the onChange callback mechanism.

### Root Cause

The problematic code (lines 169-177) used a `useEffect` hook that depended on `formData` and `isDirty`:

```typescript
useEffect(() => {
  if (onChangeRef.current) {
    onChangeRef.current(formData, isDirty);
  }
}, [formData, isDirty]);
```

**The infinite loop occurred because:**
1. When `formData` or `isDirty` changed, the effect ran
2. The effect called `onChange(formData, isDirty)`
3. The parent component (AssistantSettingsSidebar) updated its state
4. This caused AssistantForm to re-render with new props
5. The effect ran again, repeating the cycle infinitely

## Solution

The fix eliminates the problematic `useEffect` and implements a direct onChange notification mechanism:

### 1. Removed the problematic useEffect

Deleted the effect that was causing the infinite loop.

### 2. Added ref tracking for latest values

```typescript
const latestFormDataRef = useRef(formData);
const latestIsDirtyRef = useRef(isDirty);

useEffect(() => {
  latestFormDataRef.current = formData;
  latestIsDirtyRef.current = isDirty;
});
```

This ensures we always have access to the latest values without causing re-renders.

### 3. Created a stable notifyChange function

```typescript
const notifyChange = useCallback(() => {
  if (onChange) {
    onChange(latestFormDataRef.current, latestIsDirtyRef.current);
  }
}, [onChange]);
```

This function uses refs to get the latest values, preventing stale closures.

### 4. Updated updateField to call notifyChange

```typescript
const updateField = useCallback((field: keyof AssistantFormData, value: any) => {
  setFormData(prev => {
    const newData = { ...prev, [field]: value };
    return newData;
  });
  
  if (!isDirty) {
    setIsDirty(true);
  }
  
  if (touched[field]) {
    debouncedValidation(field, value);
  }
  
  // Notify parent of change after state update
  setTimeout(() => {
    notifyChange();
  }, 0);
}, [isDirty, touched, debouncedValidation, notifyChange]);
```

The `setTimeout` ensures state is updated before calling onChange.

## Benefits

1. **No infinite loops**: onChange is only called when user makes actual changes
2. **Better performance**: No unnecessary effect re-runs
3. **Clearer data flow**: onChange is called directly where data changes
4. **Maintains functionality**: All existing features (draft save, validation, etc.) still work

## Testing

To verify the fix works:

1. Open the assistant creation sidebar
2. Fill in form fields
3. Check browser console - no "Maximum update depth exceeded" errors
4. Verify draft auto-save still works
5. Verify form validation still works
6. Test all 5 tabs of configuration

## Files Modified

- `drone-analyzer-nextjs/components/AssistantForm.tsx`

## Related Spec

- `.kiro/specs/assistant-form-infinite-loop-fix/`
