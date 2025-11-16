# Custom Workflow Node - Quick Reference

## Quick Start

### 1. Basic Node Setup

```typescript
import CustomWorkflowNode from '@/components/workflow/CustomWorkflowNode';
import { ArrowUp } from 'lucide-react';

const nodeTypes = {
  custom: CustomWorkflowNode,
};

const nodes = [{
  id: '1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    type: 'movement',
    label: '前进',
    icon: <ArrowUp size={16} />,
    category: 'movement',
    status: 'idle',
  },
}];
```

### 2. With Parameters

```typescript
data: {
  label: '前进',
  parameters: {
    distance: 100,
    speed: 50,
  },
  showParameters: true,
}
```

### 3. With Status

```typescript
data: {
  label: '前进',
  status: 'running', // idle | running | success | error | warning
}
```

### 4. With Unsaved Changes

```typescript
data: {
  label: '前进',
  hasUnsavedChanges: true,
}
```

## Component Props

### CustomWorkflowNode

| Prop | Type | Description |
|------|------|-------------|
| `data.type` | `string` | Node type identifier |
| `data.label` | `string` | Display name |
| `data.icon` | `ReactNode` | Icon component |
| `data.color` | `string` | Custom color (optional) |
| `data.category` | `string` | Category for color coding |
| `data.status` | `NodeStatus` | Execution status |
| `data.parameters` | `Record<string, any>` | Node parameters |
| `data.hasUnsavedChanges` | `boolean` | Unsaved indicator |
| `data.description` | `string` | Node description |
| `data.showParameters` | `boolean` | Show params by default |

### NodeStatusIndicator

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `NodeStatus` | - | Status type |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Icon size |
| `showLabel` | `boolean` | `false` | Show text label |

### NodeParameterPreview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `parameters` | `Record<string, any>` | - | Parameters object |
| `maxVisible` | `number` | `3` | Max params to show |
| `isExpanded` | `boolean` | `false` | Expanded state |
| `onToggle` | `() => void` | - | Toggle callback |
| `hasUnsavedChanges` | `boolean` | `false` | Unsaved indicator |
| `priorityParams` | `string[]` | `[]` | Priority param keys |

### NodeSelectionOverlay

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isSelected` | `boolean` | - | Selection state |
| `isMultiSelected` | `boolean` | `false` | Multi-select mode |
| `selectionIndex` | `number` | - | Index in selection |
| `totalSelected` | `number` | - | Total selected count |

## Status Types

```typescript
type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'warning';
```

| Status | Icon | Color | Animation |
|--------|------|-------|-----------|
| `idle` | Circle | Gray | None |
| `running` | Loader | Blue | Spinning |
| `success` | CheckCircle | Green | Pop-in |
| `error` | XCircle | Red | Shake |
| `warning` | AlertCircle | Orange | None |

## Category Colors

```typescript
const categories = {
  basic: '#8b5cf6',      // Purple
  movement: '#3b82f6',   // Blue
  detection: '#10b981',  // Green
  ai: '#f59e0b',         // Orange
  logic: '#ec4899',      // Pink
  data: '#06b6d4',       // Cyan
  challenge: '#ef4444',  // Red
};
```

## CSS Variables

### Node Colors
```css
--wf-node-bg
--wf-node-border
--wf-node-text
--wf-node-selected-border
--wf-node-selected-glow
```

### Status Colors
```css
--wf-status-idle
--wf-status-running
--wf-status-success
--wf-status-error
--wf-status-warning
```

### Category Colors
```css
--wf-category-basic
--wf-category-movement
--wf-category-detection
--wf-category-ai
--wf-category-logic
--wf-category-data
--wf-category-challenge
```

## Common Patterns

### Update Node Status

```typescript
const updateNodeStatus = (nodeId: string, status: NodeStatus) => {
  setNodes((nds) =>
    nds.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, status } }
        : node
    )
  );
};

// Usage
updateNodeStatus('1', 'running');
```

### Update Node Parameters

```typescript
const updateNodeParameters = (nodeId: string, params: Record<string, any>) => {
  setNodes((nds) =>
    nds.map((node) =>
      node.id === nodeId
        ? { 
            ...node, 
            data: { 
              ...node.data, 
              parameters: { ...node.data.parameters, ...params },
              hasUnsavedChanges: true,
            } 
          }
        : node
    )
  );
};

// Usage
updateNodeParameters('1', { distance: 150 });
```

### Mark Node as Saved

```typescript
const markNodeAsSaved = (nodeId: string) => {
  setNodes((nds) =>
    nds.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, hasUnsavedChanges: false } }
        : node
    )
  );
};
```

### Toggle Parameter Visibility

```typescript
const toggleParameters = (nodeId: string) => {
  setNodes((nds) =>
    nds.map((node) =>
      node.id === nodeId
        ? { 
            ...node, 
            data: { 
              ...node.data, 
              showParameters: !node.data.showParameters 
            } 
          }
        : node
    )
  );
};
```

## Styling Tips

### Custom Node Colors

```typescript
data: {
  label: 'Custom Node',
  color: '#ff6b6b', // Override category color
}
```

### Custom Handle Styles

```css
.react-flow__handle {
  width: 12px;
  height: 12px;
  background: var(--wf-category-movement);
  border: 2px solid var(--wf-node-bg);
}
```

### Custom Selection Effect

```css
.node.selected {
  box-shadow: 0 0 0 3px var(--wf-node-selected-border),
              0 0 20px var(--wf-node-selected-glow);
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Delete` | Delete selected nodes |
| `Ctrl+A` | Select all nodes |
| `Ctrl+C` | Copy selected nodes |
| `Ctrl+V` | Paste nodes |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Space+Drag` | Pan canvas |

## Accessibility

### Focus Management

```typescript
// Focus on node programmatically
const focusNode = (nodeId: string) => {
  const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
  if (nodeElement) {
    (nodeElement as HTMLElement).focus();
  }
};
```

### Screen Reader Support

All components include proper ARIA labels:
- Status indicators have descriptive titles
- Parameters have semantic markup
- Selection states are announced

## Performance Tips

1. **Memoize node data** to prevent unnecessary re-renders
2. **Use React.memo** for custom node components
3. **Limit visible parameters** to 3-5 for better performance
4. **Disable animations** for large workflows (>50 nodes)

## Troubleshooting

### Nodes not rendering
- Check if `nodeTypes` is properly registered
- Verify node data structure matches interface
- Ensure React Flow is properly initialized

### Styles not applying
- Confirm theme provider is wrapping components
- Check CSS module imports
- Verify CSS variables are defined

### Animations stuttering
- Reduce number of animated elements
- Use `will-change` CSS property
- Consider disabling animations for large workflows

## Examples

See complete examples in:
- `components/workflow/CustomWorkflowNode.tsx`
- `docs/CUSTOM_WORKFLOW_NODE_IMPLEMENTATION.md`

## Support

For issues or questions:
1. Check the main implementation documentation
2. Review the design specification
3. Inspect browser console for errors
4. Verify theme system is properly configured
