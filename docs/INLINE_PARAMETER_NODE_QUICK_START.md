# InlineParameterNode Quick Start Guide

## Overview

This guide will help you quickly understand and use the new `InlineParameterNode` component for inline parameter editing in the workflow system.

## What's New?

The `InlineParameterNode` replaces `AnimatedWorkflowNode` and allows users to:
- ✅ View all parameters directly on the node card
- ✅ Edit parameters inline without opening a modal
- ✅ See real-time validation errors
- ✅ Collapse/expand parameter sections
- ✅ Access advanced settings when needed

## Quick Example

```tsx
// 1. Import the component
import InlineParameterNode from '@/components/workflow/InlineParameterNode';

// 2. Register it in your node types
const nodeTypes = {
  inlineParameterNode: InlineParameterNode,
};

// 3. Create a node with proper data structure
const node = {
  id: 'node-1',
  type: 'inlineParameterNode',
  position: { x: 100, y: 100 },
  data: {
    id: 'node-1',
    type: 'takeoff',           // Node type from registry
    label: '起飞',              // Display name
    category: 'basic',          // Category
    icon: Plane,                // Lucide icon
    color: '#60a5fa',           // Theme color
    status: 'idle',             // idle | running | success | error
    parameters: {               // Parameter values
      height: 100,
    },
    isCollapsed: false,         // Collapse state
  },
};
```

## Key Features

### 1. Inline Parameter Editing

Click on any parameter value to edit it directly:

```tsx
// Parameters are automatically validated
// Errors are shown inline
// Changes are debounced and saved automatically
```

### 2. Three Layout Modes

The node automatically adjusts its size based on parameter count:

- **Compact** (< 3 params): 240px wide
- **Standard** (3-6 params): 280px wide  
- **Extended** (> 6 params): 320px wide with scrolling

### 3. Collapse/Expand

```tsx
// Click the chevron button to collapse
// Shows parameter count badge when collapsed
// Smooth animation on expand/collapse
```

### 4. Status Indicator

Visual feedback for node execution state:

```tsx
status: 'idle'     // Gray dot
status: 'running'  // Orange pulsing dot
status: 'success'  // Green dot
status: 'error'    // Red dot
```

### 5. Parameter Validation

```tsx
// Required parameters show * indicator
// Invalid values show error message
// Error icon appears in header when required params missing
```

## Node Data Structure

```typescript
interface InlineParameterNodeData {
  // Required fields
  id: string;                    // Unique node ID
  type: string;                  // Node type (must exist in registry)
  label: string;                 // Display label
  category: string;              // Node category
  icon: LucideIcon;              // Icon component
  color: string;                 // Theme color (hex)
  status: NodeStatus;            // Current status
  parameters: Record<string, any>; // Parameter values
  isCollapsed: boolean;          // Collapse state
  
  // Optional fields
  priorityParams?: string[];     // Priority parameter names
  customSize?: {                 // Custom size override
    width: number;
    height: number;
  };
  lastModified?: number;         // Timestamp of last edit
}
```

## Common Use Cases

### Creating a New Node

```tsx
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';

// Get default parameters from registry
const nodeType = 'takeoff';
const nodeDefinition = nodeRegistry.getNode(nodeType);
const defaultParams = nodeRegistry.getDefaultParameters(nodeType);

const newNode = {
  id: getId(),
  type: 'inlineParameterNode',
  position: { x: 100, y: 100 },
  data: {
    id: getId(),
    type: nodeType,
    label: nodeDefinition.label,
    category: nodeDefinition.category,
    icon: nodeDefinition.icon,
    color: nodeDefinition.color,
    status: 'idle',
    parameters: defaultParams,
    isCollapsed: false,
  },
};
```

### Updating Node Parameters

```tsx
// Parameters are automatically updated via the component
// No manual intervention needed
// Changes are debounced (300ms) and persisted to ReactFlow
```

### Validating Node Parameters

```tsx
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';

const validation = nodeRegistry.validateNodeParameters(
  nodeType,
  parameters
);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Handling Node Status

```tsx
// Update node status during workflow execution
setNodes((nodes) =>
  nodes.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        data: {
          ...node.data,
          status: 'running', // or 'success', 'error', 'idle'
        },
      };
    }
    return node;
  })
);
```

## Integration Checklist

When integrating InlineParameterNode into your workflow:

- [ ] Import the component
- [ ] Register in nodeTypes
- [ ] Update node creation logic to use new data structure
- [ ] Ensure node definitions exist in nodeRegistry
- [ ] Test parameter editing
- [ ] Test collapse/expand
- [ ] Test validation
- [ ] Test status updates
- [ ] Test with different parameter counts

## Styling Customization

### Theme Colors

Colors are defined in `styles/globals.css`:

```css
:root {
  --node-bg: #1e293b;
  --node-border: #334155;
  --node-selected: #64ffda;
  --param-bg: #0f172a;
  --param-bg-hover: #1e293b;
  --param-bg-editing: #334155;
  --param-border-editing: #64ffda;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --error-color: #ef4444;
}
```

### Custom Styles

Use the CSS module for additional styling:

```tsx
import styles from '@/styles/InlineParameterNode.module.css';

// Apply custom classes
<div className={styles.customClass}>
  {/* content */}
</div>
```

## Performance Tips

1. **Debouncing**: Parameter updates are automatically debounced (300ms)
2. **Memoization**: Use `useMemo` for expensive calculations
3. **Virtualization**: Extended mode uses scrolling instead of rendering all parameters
4. **Cleanup**: Debounced functions are cleaned up on unmount

## Troubleshooting

### Parameters not updating?
- Check that node type exists in nodeRegistry
- Verify parameter names match node definition
- Check console for validation errors

### Node not rendering?
- Ensure all required data fields are provided
- Check that icon component is imported correctly
- Verify color is a valid hex string

### Validation not working?
- Check parameter definitions in node registry
- Verify validation functions are defined
- Check ParameterValidationService implementation

### Layout issues?
- Check that parameters array is not empty
- Verify parameter count calculation
- Check CSS module is imported

## Next Steps

1. Review the full implementation: `INLINE_PARAMETER_NODE_IMPLEMENTATION.md`
2. Check the requirements: `.kiro/specs/workflow-inline-parameters/requirements.md`
3. Review the design: `.kiro/specs/workflow-inline-parameters/design.md`
4. See the task list: `.kiro/specs/workflow-inline-parameters/tasks.md`

## Support

For issues or questions:
1. Check the documentation files
2. Review the component source code
3. Check the test files (when available)
4. Consult the design document

## Example: Complete Node Creation

```tsx
import { Plane } from 'lucide-react';
import { nodeRegistry } from '@/lib/workflow/nodeRegistry';
import InlineParameterNode from '@/components/workflow/InlineParameterNode';

// 1. Get node definition
const nodeType = 'takeoff';
const nodeDef = nodeRegistry.getNode(nodeType);

// 2. Create node with all required data
const createTakeoffNode = (position: { x: number; y: number }) => ({
  id: `node-${Date.now()}`,
  type: 'inlineParameterNode',
  position,
  data: {
    id: `node-${Date.now()}`,
    type: nodeType,
    label: nodeDef.label,
    category: nodeDef.category,
    icon: nodeDef.icon,
    color: nodeDef.color,
    status: 'idle',
    parameters: nodeRegistry.getDefaultParameters(nodeType),
    isCollapsed: false,
  },
});

// 3. Add to workflow
const newNode = createTakeoffNode({ x: 100, y: 100 });
setNodes((nodes) => [...nodes, newNode]);
```

That's it! You're ready to use InlineParameterNode in your workflow system. 🚀
