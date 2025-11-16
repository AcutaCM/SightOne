# Keyboard Shortcuts System

## Overview

The keyboard shortcuts system provides a centralized way to manage and display keyboard shortcuts throughout the workflow editor. It includes shortcut registration, conflict detection, help panel display, and platform-specific key formatting.

## Architecture

### Core Components

1. **ShortcutsManager** (`lib/workflow/shortcuts.ts`)
   - Central manager for all keyboard shortcuts
   - Handles registration, conflict detection, and event handling
   - Singleton pattern for global access

2. **useKeyboardShortcuts Hook** (`hooks/useKeyboardShortcuts.ts`)
   - React hook interface for the shortcuts system
   - Manages lifecycle and event listeners
   - Provides search and filtering capabilities

3. **KeyboardShortcutsPanel** (`components/workflow/KeyboardShortcutsPanel.tsx`)
   - Modal dialog displaying all shortcuts
   - Searchable and filterable by category
   - Responsive design for all screen sizes

4. **ShortcutsHelpButton** (`components/workflow/ShortcutsHelpButton.tsx`)
   - Button to open the shortcuts help panel
   - Includes tooltip and keyboard trigger

## Features

### 1. Shortcut Registration

```typescript
import { getShortcutsManager } from '@/lib/workflow/shortcuts';

const manager = getShortcutsManager();

manager.register({
  id: 'save',
  key: 's',
  ctrl: true,
  description: 'Save workflow',
  category: 'general',
  action: () => {
    // Save logic
  }
});
```

### 2. Conflict Detection

The system automatically detects and warns about shortcut conflicts:

```typescript
// This will log a warning if Ctrl+S is already registered
manager.register({
  id: 'save-as',
  key: 's',
  ctrl: true,
  description: 'Save workflow as...',
  category: 'general',
  action: () => {}
});
```

### 3. Platform-Specific Keys

The system automatically formats keys for the current platform:

- **macOS**: `⌘S` (Command+S)
- **Windows/Linux**: `Ctrl+S`

### 4. Category Organization

Shortcuts are organized into categories:

- **General**: Save, load, export, help
- **Canvas**: Zoom, pan, grid, minimap
- **Nodes**: Select, delete, duplicate, copy/paste
- **Editing**: Undo, redo
- **Navigation**: Pan in directions
- **Workflow**: Run, stop, validate, clear

### 5. Search and Filter

Users can search shortcuts by:
- Description text
- Key combination
- Category

## Usage

### Basic Setup

```typescript
import { useWorkflowShortcuts } from '@/hooks/useKeyboardShortcuts';

function WorkflowEditor() {
  const { getShortcutGroups } = useWorkflowShortcuts({
    save: handleSave,
    load: handleLoad,
    undo: handleUndo,
    redo: handleRedo,
    deleteSelected: handleDelete,
    // ... more actions
  });

  return (
    <div>
      {/* Your workflow editor */}
    </div>
  );
}
```

### Adding the Help Button

```typescript
import { ShortcutsHelpButton } from '@/components/workflow/ShortcutsHelpButton';

function Toolbar() {
  return (
    <div>
      {/* Other toolbar buttons */}
      <ShortcutsHelpButton variant="light" size="md" />
    </div>
  );
}
```

### Custom Shortcuts

```typescript
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function MyComponent() {
  useKeyboardShortcuts({
    enabled: true,
    shortcuts: [
      {
        id: 'custom-action',
        key: 'k',
        ctrl: true,
        shift: true,
        description: 'Custom action',
        category: 'general',
        action: () => {
          console.log('Custom action triggered');
        }
      }
    ]
  });

  return <div>My Component</div>;
}
```

## Default Shortcuts

### General
- `Ctrl+S` - Save workflow
- `Ctrl+O` - Load workflow
- `Ctrl+Shift+E` - Export workflow
- `Shift+?` - Show keyboard shortcuts

### Canvas
- `Ctrl++` - Zoom in
- `Ctrl+-` - Zoom out
- `Ctrl+0` - Zoom to fit
- `Ctrl+R` - Reset view
- `Ctrl+M` - Toggle minimap
- `Ctrl+G` - Toggle grid

### Nodes
- `Delete` - Delete selected nodes
- `Ctrl+D` - Duplicate selected nodes
- `Ctrl+A` - Select all nodes
- `Escape` - Deselect all nodes
- `Ctrl+C` - Copy selected nodes
- `Ctrl+V` - Paste nodes

### Editing
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo

### Navigation
- `Shift+←` - Pan left
- `Shift+→` - Pan right
- `Shift+↑` - Pan up
- `Shift+↓` - Pan down

### Workflow
- `Ctrl+Enter` - Run workflow
- `Ctrl+Escape` - Stop workflow
- `Ctrl+Shift+V` - Validate workflow
- `Ctrl+Shift+Delete` - Clear workflow

### Alignment
- `Ctrl+Shift+←` - Align nodes left
- `Ctrl+Shift+→` - Align nodes right
- `Ctrl+Shift+↑` - Align nodes top
- `Ctrl+Shift+↓` - Align nodes bottom
- `Ctrl+Shift+H` - Align nodes center horizontally
- `Ctrl+Shift+Alt+V` - Align nodes middle vertically
- `Ctrl+Shift+D` - Distribute nodes horizontally
- `Ctrl+Shift+Alt+D` - Distribute nodes vertically

## API Reference

### ShortcutDefinition

```typescript
interface ShortcutDefinition {
  id: string;              // Unique identifier
  key: string;             // Key to press (e.g., 's', 'Enter', 'ArrowLeft')
  ctrl?: boolean;          // Requires Ctrl/Cmd key
  shift?: boolean;         // Requires Shift key
  alt?: boolean;           // Requires Alt/Option key
  meta?: boolean;          // Requires Meta/Win key
  description: string;     // Human-readable description
  category: ShortcutCategory; // Category for organization
  action: () => void;      // Function to execute
  enabled?: boolean;       // Whether shortcut is enabled
}
```

### ShortcutsManager Methods

```typescript
class ShortcutsManager {
  // Register a shortcut
  register(shortcut: ShortcutDefinition): void;
  
  // Unregister a shortcut
  unregister(id: string): void;
  
  // Register multiple shortcuts
  registerMany(shortcuts: ShortcutDefinition[]): void;
  
  // Get shortcuts grouped by category
  getShortcutGroups(): ShortcutGroup[];
  
  // Handle keyboard event
  handleKeyDown(event: KeyboardEvent): boolean;
  
  // Enable/disable all shortcuts
  setEnabled(enabled: boolean): void;
  
  // Enable/disable specific shortcut
  setShortcutEnabled(id: string, enabled: boolean): void;
  
  // Search shortcuts
  searchShortcuts(query: string): ShortcutDefinition[];
  
  // Clear all shortcuts
  clear(): void;
}
```

### useKeyboardShortcuts Hook

```typescript
function useKeyboardShortcuts(options?: {
  enabled?: boolean;
  shortcuts?: ShortcutDefinition[];
}): {
  manager: ShortcutsManager;
  getShortcutGroups: () => ShortcutGroup[];
  searchShortcuts: (query: string) => ShortcutDefinition[];
  setShortcutEnabled: (id: string, enabled: boolean) => void;
}
```

### useWorkflowShortcuts Hook

```typescript
function useWorkflowShortcuts(actions: {
  save?: () => void;
  load?: () => void;
  export?: () => void;
  // ... all workflow actions
}): ReturnType<typeof useKeyboardShortcuts>
```

## Best Practices

### 1. Avoid Conflicts

Always check for conflicts when registering shortcuts:

```typescript
// Good: Use unique key combinations
{ key: 's', ctrl: true, shift: true }

// Bad: Common browser shortcuts
{ key: 't', ctrl: true } // Opens new tab in browser
```

### 2. Use Semantic Categories

Organize shortcuts into logical categories:

```typescript
// Good
{ category: 'nodes', description: 'Delete node' }

// Bad
{ category: 'general', description: 'Delete node' }
```

### 3. Provide Clear Descriptions

Use action-oriented descriptions:

```typescript
// Good
{ description: 'Save workflow' }

// Bad
{ description: 'Saves' }
```

### 4. Disable When Appropriate

Disable shortcuts when they shouldn't be active:

```typescript
// Disable shortcuts when modal is open
manager.setEnabled(false);

// Re-enable when modal closes
manager.setEnabled(true);
```

### 5. Clean Up on Unmount

Always unregister shortcuts when component unmounts:

```typescript
useEffect(() => {
  manager.register(shortcut);
  
  return () => {
    manager.unregister(shortcut.id);
  };
}, []);
```

## Accessibility

The shortcuts system follows accessibility best practices:

1. **Keyboard Navigation**: All shortcuts work with keyboard only
2. **Screen Reader Support**: Help panel is screen reader friendly
3. **Visual Feedback**: Clear visual indication of shortcuts
4. **Platform Awareness**: Uses platform-specific key symbols
5. **Conflict Prevention**: Warns about conflicting shortcuts

## Testing

### Unit Tests

```typescript
import { ShortcutsManager, matchesShortcut } from '@/lib/workflow/shortcuts';

describe('ShortcutsManager', () => {
  it('should register shortcuts', () => {
    const manager = new ShortcutsManager();
    const shortcut = {
      id: 'test',
      key: 's',
      ctrl: true,
      description: 'Test',
      category: 'general',
      action: jest.fn()
    };
    
    manager.register(shortcut);
    expect(manager.getShortcut('test')).toBe(shortcut);
  });
  
  it('should detect conflicts', () => {
    const manager = new ShortcutsManager();
    const spy = jest.spyOn(console, 'warn');
    
    manager.register({
      id: 'test1',
      key: 's',
      ctrl: true,
      description: 'Test 1',
      category: 'general',
      action: jest.fn()
    });
    
    manager.register({
      id: 'test2',
      key: 's',
      ctrl: true,
      description: 'Test 2',
      category: 'general',
      action: jest.fn()
    });
    
    expect(spy).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
import { render, fireEvent } from '@testing-library/react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('should trigger action on key press', () => {
    const action = jest.fn();
    
    function TestComponent() {
      useKeyboardShortcuts({
        shortcuts: [{
          id: 'test',
          key: 's',
          ctrl: true,
          description: 'Test',
          category: 'general',
          action
        }]
      });
      return <div>Test</div>;
    }
    
    render(<TestComponent />);
    
    fireEvent.keyDown(window, { key: 's', ctrlKey: true });
    
    expect(action).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Shortcuts Not Working

1. Check if shortcuts are enabled:
   ```typescript
   manager.setEnabled(true);
   ```

2. Verify no input field is focused:
   ```typescript
   // Shortcuts are disabled in input fields by default
   ```

3. Check for browser conflicts:
   ```typescript
   // Avoid common browser shortcuts like Ctrl+T, Ctrl+W
   ```

### Conflicts Not Detected

1. Ensure shortcuts are registered before checking:
   ```typescript
   manager.register(shortcut1);
   manager.register(shortcut2); // Will warn if conflict
   ```

2. Check console for warnings:
   ```typescript
   // Conflicts are logged to console.warn
   ```

## Future Enhancements

1. **Custom Key Bindings**: Allow users to customize shortcuts
2. **Shortcut Profiles**: Save/load different shortcut configurations
3. **Visual Hints**: Show available shortcuts in context
4. **Shortcut Recording**: Record key combinations visually
5. **Conflict Resolution**: Interactive conflict resolution UI

## Related Documentation

- [Workflow Canvas](./WORKFLOW_CANVAS_QUICK_REFERENCE.md)
- [Node Editor](./NODE_EDITOR_IMPLEMENTATION.md)
- [Control Panel](./CONTROL_PANEL_QUICK_REFERENCE.md)
- [Accessibility Guide](./WORKFLOW_ACCESSIBILITY_GUIDE.md)
