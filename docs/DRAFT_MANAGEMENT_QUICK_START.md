# Draft Management System - Quick Start Guide

## Overview

The draft management system automatically saves your work when creating assistants and allows you to recover unsaved changes.

## Features

### 🔄 Auto-Save
- Automatically saves your work every 30 seconds
- Only saves when you've made changes
- Works silently in the background

### 💾 Draft Recovery
- Detects unsaved drafts when you reopen the create form
- Shows a preview of your draft
- Lets you choose to recover or discard

### ⏰ Smart Expiry
- Drafts expire after 7 days
- Expired drafts are automatically cleaned up
- No manual maintenance required

## User Guide

### Creating an Assistant

1. Click "Create Assistant" button
2. Fill out the form fields
3. Your work is auto-saved every 30 seconds
4. Click "Create" to save permanently

### Recovering a Draft

If you have an unsaved draft:

1. Click "Create Assistant" button
2. A modal appears showing your draft preview
3. Choose an option:
   - **恢复 (Recover)**: Load your draft and continue editing
   - **忽略 (Discard)**: Start with a blank form

### Visual Feedback

When you recover a draft:
- A green notification appears: "✓ 已恢复草稿数据"
- The notification auto-dismisses after 3 seconds
- Your form is populated with the draft data

## Developer Guide

### Using the DraftManager

```typescript
import { draftManager } from '@/lib/services/assistantDraftManager';

// Save a draft
draftManager.saveDraft(formData);

// Load a draft
const draft = draftManager.loadDraft();

// Check if draft exists
if (draftManager.hasDraft()) {
  // Show recovery UI
}

// Clear draft
draftManager.clearDraft();

// Get draft timestamp
const timestamp = draftManager.getDraftTimestamp();
```

### Integration Example

```typescript
// In your component
useEffect(() => {
  // Check for draft on mount
  const draft = draftManager.loadDraft();
  if (draft) {
    setShowRecoveryModal(true);
    setDraftData(draft);
  }
}, []);

// Auto-save effect
useEffect(() => {
  if (!isDirty) return;
  
  const timer = setTimeout(() => {
    draftManager.saveDraft(formData);
  }, 30000);
  
  return () => clearTimeout(timer);
}, [formData, isDirty]);
```

## Technical Details

### Storage Location
- **Browser**: localStorage
- **Key**: `assistant_draft`
- **Format**: JSON

### Data Structure
```typescript
{
  data: {
    title: string;
    emoji: string;
    desc: string;
    prompt: string;
    tags: string[];
    isPublic: boolean;
  },
  timestamp: string; // ISO 8601 format
}
```

### Expiry Logic
- Drafts older than 7 days are automatically deleted
- Expiry check happens on load
- No background cleanup needed

## Best Practices

### For Users
1. Don't rely solely on auto-save - save your work regularly
2. If you see the recovery modal, review the draft before recovering
3. Discard old drafts you no longer need

### For Developers
1. Always clear drafts after successful save
2. Handle localStorage errors gracefully
3. Test with localStorage disabled
4. Consider SSR when accessing localStorage

## Troubleshooting

### Draft Not Saving
- Check browser console for errors
- Verify localStorage is enabled
- Check available storage space

### Draft Not Appearing
- Draft may have expired (>7 days old)
- localStorage may have been cleared
- Check browser privacy settings

### Multiple Tabs
- Each tab shares the same draft
- Last save wins
- Consider adding tab synchronization if needed

## API Reference

### DraftManager Methods

#### `saveDraft(data: AssistantFormData): void`
Saves form data to localStorage with current timestamp.

#### `loadDraft(): AssistantFormData | null`
Loads draft from localStorage. Returns null if no draft or expired.

#### `clearDraft(): void`
Removes draft from localStorage.

#### `hasDraft(): boolean`
Returns true if a valid (non-expired) draft exists.

#### `getDraftTimestamp(): Date | null`
Returns the timestamp when draft was created.

#### `cleanExpiredDrafts(): void`
Manually trigger cleanup of expired drafts.

## Related Files

- `lib/services/assistantDraftManager.ts` - Core service
- `components/AssistantSettingsSidebar.tsx` - UI integration
- `components/AssistantForm.tsx` - Form component

## Requirements Satisfied

✓ Requirement 8.1 - Auto-save every 30 seconds
✓ Requirement 8.2 - Prompt to recover on reopen
✓ Requirement 8.3 - User choice to recover/discard
✓ Requirement 8.4 - Clear on successful save
✓ Requirement 8.5 - 7-day retention period
