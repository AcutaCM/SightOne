# Unsaved Changes Warning - Quick Reference

## Overview

The unsaved changes warning system prevents accidental data loss by alerting users when they attempt to close the assistant settings sidebar with unsaved changes.

## Key Features

### 🔍 Automatic Detection
- Tracks all form field changes
- Detects when user modifies any field
- Works in both create and edit modes

### ⚠️ Warning Modal
- Appears when closing with unsaved changes
- Beautiful animated modal
- Clear messaging about unsaved data

### 🎯 Three Action Options

| Action | Button | Behavior |
|--------|--------|----------|
| **Cancel** | 取消 | Continue editing, keep sidebar open |
| **Discard** | 放弃更改 | Close without saving, lose changes |
| **Save** | 保存 | Save changes and close sidebar |

## User Flow

```
User makes changes
       ↓
Form marked as dirty
       ↓
User clicks close/cancel
       ↓
Warning modal appears
       ↓
User chooses action:
├─ 取消 → Continue editing
├─ 放弃更改 → Close without saving
└─ 保存 → Save and close
```

## When Warning Appears

### ✅ Warning Shows
- User modifies any form field
- User clicks close/cancel button
- Changes have not been saved

### ❌ Warning Doesn't Show
- No changes made to form
- Changes already saved successfully
- Form is in initial state

## Integration with Other Features

### Draft Management
- Works alongside auto-save drafts
- Drafts saved every 30 seconds
- Warning still appears for explicit control

### Form Validation
- Save action triggers validation
- Invalid forms show validation errors
- User can fix errors and retry

### Permission System
- Respects user permissions
- Save button disabled if no edit permission
- Warning still appears to prevent accidental close

## Code Example

```typescript
// The component handles everything automatically
<AssistantSettingsSidebar
  visible={true}
  onClose={handleClose}
  mode="create"
  onSave={handleSave}
/>

// No additional code needed!
// Warning appears automatically when:
// 1. User makes changes
// 2. User tries to close
```

## Testing

Run tests with:
```bash
npm test __tests__/components/AssistantSettingsSidebar-unsaved-warning.test.tsx
```

## Accessibility

- ✅ Keyboard navigation supported
- ✅ Clear button labels
- ✅ Focus management
- ✅ Screen reader friendly

## Mobile Support

- ✅ Touch-friendly buttons
- ✅ Responsive layout
- ✅ Proper spacing
- ✅ Works on all screen sizes

## Requirements Satisfied

- ✅ **Requirement 1.5**: Close with unsaved changes handling
- ✅ **Requirement 4.5**: Prompt to save unsaved changes

## Related Documentation

- [Task 12 Complete Documentation](./TASK_12_UNSAVED_CHANGES_WARNING_COMPLETE.md)
- [Assistant Settings Sidebar Implementation](./ASSISTANT_SETTINGS_SIDEBAR_IMPLEMENTATION.md)
- [Draft Management System](./DRAFT_MANAGEMENT_QUICK_START.md)

## Troubleshooting

### Warning doesn't appear
- Check if form is actually dirty
- Verify `onChange` callback is working
- Check console for errors

### Save button doesn't work
- Check form validation
- Verify `onSave` callback is provided
- Check user permissions

### Modal doesn't close
- Check if save is completing successfully
- Verify `onClose` callback is called
- Check for async errors

## Best Practices

1. **Always provide onSave callback** - Required for save functionality
2. **Handle save errors** - Show user-friendly error messages
3. **Test with real data** - Verify behavior with actual user workflows
4. **Consider user permissions** - Respect edit/create permissions

---

**Quick Tip**: The warning system works automatically. Just use the `AssistantSettingsSidebar` component normally, and it will handle unsaved changes protection for you!
