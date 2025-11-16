# Keyboard Shortcuts System - Quick Start Guide

## 🚀 Quick Start

### 1. Add Shortcuts to Your Component

```typescript
import { useWorkflowShortcuts } from '@/hooks/useKeyboardShortcuts';

function WorkflowEditor() {
  const { getShortcutGroups } = useWorkflowShortcuts({
    save: () => console.log('Save'),
    undo: () => console.log('Undo'),
    redo: () => console.log('Redo'),
    deleteSelected: () => console.log('Delete'),
  });

  return <div>Your workflow editor</div>;
}
```

### 2. Add Help Button

```typescript
import { ShortcutsHelpButton } from '@/components/workflow/ShortcutsHelpButton';

function Toolbar() {
  return (
    <div>
      <ShortcutsHelpButton variant="light" size="md" />
    </div>
  );
}
```

### 3. Test It

- Press `Shift+?` to open shortcuts panel
- Press `Ctrl+S` to save
- Press `Ctrl+Z` to undo

## 📋 Most Common Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | `Ctrl+S` |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` |
| Delete | `Delete` |
| Select All | `Ctrl+A` |
| Copy | `Ctrl+C` |
| Paste | `Ctrl+V` |
| Help | `Shift+?` |

## 🎯 Key Features

✅ **Automatic Conflict Detection** - Warns about duplicate shortcuts  
✅ **Platform-Specific Keys** - Shows ⌘ on Mac, Ctrl on Windows  
✅ **Searchable Help Panel** - Find shortcuts quickly  
✅ **Category Organization** - Shortcuts grouped by function  
✅ **Input Field Safety** - Disabled when typing in inputs  

## 🔧 Custom Shortcuts

```typescript
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function MyComponent() {
  useKeyboardShortcuts({
    shortcuts: [
      {
        id: 'my-action',
        key: 'k',
        ctrl: true,
        description: 'My custom action',
        category: 'general',
        action: () => alert('Custom action!')
      }
    ]
  });

  return <div>Component with custom shortcut</div>;
}
```

## 🎨 Styling

The shortcuts panel uses CSS variables from the workflow theme:

```css
--workflow-primary-color
--workflow-text-primary
--workflow-border-color
--workflow-panel-bg
```

## 📱 Responsive

The shortcuts panel is fully responsive:
- Desktop: Full modal with tabs
- Tablet: Adjusted spacing
- Mobile: Stacked layout

## 🐛 Troubleshooting

**Shortcuts not working?**
1. Check if input field is focused (shortcuts disabled in inputs)
2. Verify shortcuts are enabled: `manager.setEnabled(true)`
3. Check browser console for conflict warnings

**Help panel not opening?**
1. Ensure `ShortcutsHelpButton` is rendered
2. Try pressing `Shift+?` manually
3. Check if modal is blocked by z-index issues

## 📚 Next Steps

- Read [Full Documentation](./KEYBOARD_SHORTCUTS_SYSTEM.md)
- See [API Reference](./KEYBOARD_SHORTCUTS_SYSTEM.md#api-reference)
- Check [Best Practices](./KEYBOARD_SHORTCUTS_SYSTEM.md#best-practices)

## 💡 Tips

1. **Use semantic categories** for better organization
2. **Avoid browser shortcuts** (Ctrl+T, Ctrl+W, etc.)
3. **Provide clear descriptions** for user understanding
4. **Test on multiple platforms** (Mac, Windows, Linux)
5. **Clean up on unmount** to prevent memory leaks

## 🎉 You're Ready!

The keyboard shortcuts system is now integrated into your workflow editor. Users can press `Shift+?` to see all available shortcuts at any time.
