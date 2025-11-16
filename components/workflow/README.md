# Workflow UI Redesign Components

## Overview

This directory contains all components for the redesigned workflow editor interface. The redesign follows a modern, Dify-inspired three-column layout with complete theme integration and professional user experience.

## Architecture

```
WorkflowEditorLayout (Main Container)
├── CollapsibleNodeLibrary (Left Panel)
│   ├── NodeLibraryHeader
│   ├── CategoryTabs
│   ├── NodeCard[]
│   └── NodeLibraryFooter
├── WorkflowCanvas (Center Panel)
│   ├── CustomWorkflowNode[]
│   ├── AnimatedEdge[]
│   ├── CanvasToolbar
│   ├── CustomMiniMap
│   └── AlignmentLines
└── CollapsibleControlPanel (Right Panel)
    ├── ControlPanelHeader
    ├── ActionButtons
    ├── OutputTabs
    │   ├── LogList
    │   └── ResultList
    └── LogExportButtons
```

## Core Components

### Layout Components

#### WorkflowEditorLayout
Main layout container managing the three-column structure.

**Props:**
- `children`: React.ReactNode - Child components
- `theme`: 'light' | 'dark' - Current theme

**Features:**
- Responsive three-column layout
- Collapsible side panels
- Drag-to-resize panels
- Layout state persistence

**Usage:**
```tsx
import { WorkflowEditorLayout } from '@/components/workflow/WorkflowEditorLayout';

<WorkflowEditorLayout theme="dark">
  {/* Workflow content */}
</WorkflowEditorLayout>
```

#### CollapsibleNodeLibrary
Left panel containing the node library with search and categorization.

**Props:**
- `isCollapsed`: boolean - Collapse state
- `width`: number - Panel width in pixels
- `onToggleCollapse`: () => void - Collapse toggle handler
- `onWidthChange`: (width: number) => void - Width change handler

**Features:**
- Node search and filtering
- Category-based organization
- Drag-and-drop node creation
- Collapsible with animation

**Usage:**
```tsx
<CollapsibleNodeLibrary
  isCollapsed={false}
  width={280}
  onToggleCollapse={() => setCollapsed(!collapsed)}
  onWidthChange={setWidth}
/>
```

#### CollapsibleControlPanel
Right panel for workflow control and output monitoring.

**Props:**
- `isCollapsed`: boolean - Collapse state
- `width`: number - Panel width
- `connectionStatus`: ConnectionStatus - Connection state
- `workflowStatus`: WorkflowStatus - Workflow execution state
- `logs`: LogEntry[] - Log entries
- `results`: ResultEntry[] - Result entries

**Features:**
- Real-time status indicators
- Tabbed output (logs/results)
- Action buttons (run/stop/save)
- Log export functionality

### Canvas Components

#### WorkflowCanvas
Main canvas area using React Flow for node-based workflow editing.

**Props:**
- `nodes`: Node[] - Workflow nodes
- `edges`: Edge[] - Node connections
- `onNodesChange`: OnNodesChange - Node change handler
- `onEdgesChange`: OnEdgesChange - Edge change handler
- `onConnect`: OnConnect - Connection handler
- `theme`: 'light' | 'dark' - Theme

**Features:**
- Dot grid background
- Smooth zoom and pan
- Node alignment helpers
- Mini-map navigation
- Multi-selection support

#### CustomWorkflowNode
Custom node component with enhanced visuals and functionality.

**Props:**
- `id`: string - Node ID
- `data`: NodeData - Node data
- `selected`: boolean - Selection state
- `theme`: 'light' | 'dark' - Theme

**Features:**
- Status indicators (idle/running/success/error)
- Parameter preview
- Collapsible sections
- Selection glow effect
- Unsaved changes indicator

#### AnimatedEdge
Custom edge component with animations and styling.

**Props:**
- `id`: string - Edge ID
- `source`: string - Source node ID
- `target`: string - Target node ID
- `animated`: boolean - Animation state

**Features:**
- Smooth bezier curves
- Flow animation
- Theme-aware colors
- Selection highlighting

### Node Library Components

#### NodeCard
Individual node card in the library.

**Props:**
- `node`: NodeDefinition - Node definition
- `onDragStart`: (event, node) => void - Drag start handler
- `onClick`: (node) => void - Click handler

**Features:**
- Icon and description display
- Hover effects
- Drag preview
- Category color coding

#### CategoryTabs
Category navigation for node library.

**Props:**
- `categories`: NodeCategory[] - Available categories
- `activeCategory`: string - Active category ID
- `onCategoryChange`: (id: string) => void - Category change handler

**Features:**
- Collapsible categories
- Icon indicators
- Active state highlighting
- Smooth transitions

#### NodeLibraryHeader
Header section with search functionality.

**Props:**
- `searchQuery`: string - Current search query
- `onSearchChange`: (query: string) => void - Search handler
- `onToggleCollapse`: () => void - Collapse handler

**Features:**
- Fuzzy search
- Clear button
- Collapse toggle
- Keyboard shortcuts

### Control Panel Components

#### ActionButtons
Main action buttons for workflow control.

**Props:**
- `isRunning`: boolean - Execution state
- `canRun`: boolean - Can execute
- `onRun`: () => void - Run handler
- `onStop`: () => void - Stop handler
- `onSave`: () => void - Save handler
- `onClear`: () => void - Clear handler

**Features:**
- Large gradient buttons
- Disabled states
- Loading indicators
- Keyboard shortcuts

#### OutputTabs
Tabbed interface for logs and results.

**Props:**
- `activeTab`: 'logs' | 'results' - Active tab
- `onTabChange`: (tab) => void - Tab change handler
- `logCount`: number - Number of logs
- `resultCount`: number - Number of results

**Features:**
- Badge counts
- Smooth transitions
- Keyboard navigation
- Empty states

#### LogList
Virtualized log list with filtering.

**Props:**
- `logs`: LogEntry[] - Log entries
- `autoScroll`: boolean - Auto-scroll to latest
- `maxHeight`: number - Maximum height

**Features:**
- Level-based coloring
- Timestamps
- Node references
- Virtual scrolling
- Search/filter

#### ResultList
Display workflow execution results.

**Props:**
- `results`: ResultEntry[] - Result entries
- `onResultClick`: (result) => void - Result click handler

**Features:**
- Result type indicators
- Formatted data display
- Expandable details
- Copy to clipboard

### Editor Components

#### NodeEditor
Side panel editor for node configuration.

**Props:**
- `node`: Node | null - Node to edit
- `isOpen`: boolean - Open state
- `onClose`: () => void - Close handler
- `onSave`: (data) => void - Save handler

**Features:**
- Slide-in animation
- Parameter forms
- Validation
- Preset templates
- Unsaved changes warning

#### NodeParameterForm
Form for editing node parameters.

**Props:**
- `parameters`: ParameterDefinition[] - Parameter definitions
- `values`: Record<string, any> - Current values
- `onChange`: (values) => void - Change handler
- `errors`: Record<string, string> - Validation errors

**Features:**
- Type-specific editors
- Real-time validation
- Required field indicators
- Help tooltips

#### NodePresetSelector
Preset template selector for quick configuration.

**Props:**
- `nodeType`: string - Node type
- `presets`: Preset[] - Available presets
- `onSelect`: (preset) => void - Selection handler

**Features:**
- Preset preview
- One-click apply
- Custom presets
- Import/export

### Utility Components

#### CanvasToolbar
Toolbar for canvas operations.

**Props:**
- `zoom`: number - Current zoom level
- `onZoomIn`: () => void - Zoom in handler
- `onZoomOut`: () => void - Zoom out handler
- `onResetView`: () => void - Reset view handler
- `onExport`: () => void - Export handler

**Features:**
- Zoom controls
- View reset
- Export options
- Alignment tools

#### CustomMiniMap
Mini-map for canvas navigation.

**Props:**
- `nodes`: Node[] - Workflow nodes
- `viewport`: Viewport - Current viewport

**Features:**
- Node overview
- Viewport indicator
- Click to navigate
- Theme styling

#### AlignmentLines
Visual alignment guides for node positioning.

**Props:**
- `activeNode`: Node | null - Node being moved
- `nodes`: Node[] - All nodes

**Features:**
- Horizontal/vertical guides
- Snap-to-align
- Distance indicators
- Auto-hide

#### KeyboardShortcutsPanel
Help panel showing available shortcuts.

**Props:**
- `isOpen`: boolean - Open state
- `onClose`: () => void - Close handler

**Features:**
- Categorized shortcuts
- Search functionality
- Platform-specific keys
- Printable format

#### UndoRedoControls
Undo/redo button controls.

**Props:**
- `canUndo`: boolean - Can undo
- `canRedo`: boolean - Can redo
- `onUndo`: () => void - Undo handler
- `onRedo`: () => void - Redo handler

**Features:**
- Keyboard shortcuts
- History preview
- Disabled states
- Tooltips

## Styling

All components use CSS Modules for scoped styling with the following conventions:

- **Theme Variables**: Use CSS custom properties from `styles/workflow-redesign.css`
- **Naming**: BEM-style naming (Block__Element--Modifier)
- **Responsive**: Mobile-first responsive design
- **Animations**: Consistent timing (150ms/300ms/500ms)

## Theme System

Components automatically adapt to light/dark themes using:

```tsx
import { useWorkflowTheme } from '@/hooks/useWorkflowTheme';

const { theme, colors, shadows } = useWorkflowTheme();
```

## Performance

- **Virtualization**: Large lists use react-window
- **Memoization**: Components wrapped with React.memo
- **Lazy Loading**: Code splitting for heavy components
- **Debouncing**: Search and resize operations debounced

## Accessibility

All components follow WCAG 2.1 AA standards:

- Keyboard navigation support
- ARIA labels and roles
- Focus indicators
- Screen reader compatibility
- Minimum touch targets (44x44px)

## Testing

Components have comprehensive test coverage:

```bash
# Run all workflow tests
npm test -- workflow

# Run specific component tests
npm test -- WorkflowCanvas.test
```

## Examples

See the `docs/` directory for detailed usage examples:

- `WORKFLOW_QUICK_START.md` - Getting started guide
- `WORKFLOW_COMPONENT_API.md` - Complete API reference
- `WORKFLOW_THEME_USAGE_GUIDE.md` - Theme customization
- `WORKFLOW_ACCESSIBILITY_GUIDE.md` - Accessibility features

## Migration Guide

For migrating from the old workflow system:

1. Replace `WorkflowPanel` with `WorkflowEditorLayout`
2. Update node definitions to new format
3. Migrate theme variables
4. Update event handlers

See `docs/WORKFLOW_THEME_MIGRATION_GUIDE.md` for details.

## Contributing

When adding new components:

1. Follow the existing component structure
2. Add JSDoc comments
3. Include TypeScript types
4. Write unit tests
5. Update this README
6. Add usage examples

## Support

For issues or questions:

- Check existing documentation in `docs/`
- Review component source code
- See test files for usage examples
- Consult the design specification in `.kiro/specs/workflow-ui-redesign/`
