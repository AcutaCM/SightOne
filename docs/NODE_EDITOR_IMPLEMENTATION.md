# Node Editor Implementation Guide

## Overview

The Node Editor is a comprehensive sidebar-style editor for configuring workflow node parameters. It provides a modern, theme-aware interface with validation, presets, and unsaved changes tracking.

## Components

### 1. NodeEditor (Main Component)

**Location:** `components/workflow/NodeEditor.tsx`

**Purpose:** Main container component that manages the editor state and coordinates between parameter form and presets.

**Key Features:**
- Slide-in animation from the right side
- Theme-aware styling
- Unsaved changes tracking
- Real-time parameter validation
- Tab-based interface (Parameters / Presets)
- Cancel confirmation dialog
- Save/Cancel actions

**Props:**
```typescript
interface NodeEditorProps {
  isOpen: boolean;                    // Whether the editor is open
  nodeId: string | null;              // Node ID being edited
  nodeDefinition: WorkflowNodeDefinition | null;  // Node definition with parameters
  parameters: Record<string, any>;    // Current parameter values
  onClose: () => void;                // Callback when editor closes
  onSave: (nodeId: string, parameters: Record<string, any>) => void;  // Save callback
  onPresetApply?: (preset: Record<string, any>) => void;  // Optional preset callback
}
```

**Usage Example:**
```tsx
import NodeEditor from '@/components/workflow/NodeEditor';
import { getNodeDefinition } from '@/lib/workflow/nodeRegistry';

function WorkflowEditor() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeParams, setNodeParams] = useState<Record<string, any>>({});

  const handleNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
    setNodeParams(node.data.parameters || {});
    setEditorOpen(true);
  };

  const handleSave = (nodeId: string, parameters: Record<string, any>) => {
    // Update node parameters in your workflow state
    updateNodeParameters(nodeId, parameters);
  };

  const nodeDefinition = selectedNode 
    ? getNodeDefinition(nodes.find(n => n.id === selectedNode)?.data.type)
    : null;

  return (
    <>
      {/* Your workflow canvas */}
      <WorkflowCanvas onNodeDoubleClick={handleNodeDoubleClick} />
      
      {/* Node Editor */}
      <NodeEditor
        isOpen={editorOpen}
        nodeId={selectedNode}
        nodeDefinition={nodeDefinition}
        parameters={nodeParams}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
```

### 2. NodeParameterForm

**Location:** `components/workflow/NodeParameterForm.tsx`

**Purpose:** Generic form component that renders appropriate input controls based on parameter types.

**Key Features:**
- Supports multiple parameter types (string, number, boolean, select, slider, textarea, assistant, file, json)
- Required field indicators
- Real-time validation with error messages
- Conditional parameter visibility
- Parameter grouping
- HeroUI form components

**Props:**
```typescript
interface NodeParameterFormProps {
  parameters: NodeParameter[];        // Array of parameter definitions
  values: Record<string, any>;        // Current parameter values
  errors: Record<string, string>;     // Validation errors keyed by parameter name
  onChange: (name: string, value: any) => void;  // Change callback
}
```

**Supported Parameter Types:**

1. **string** - Text input
2. **number** - Number input with min/max/step
3. **boolean** - Switch toggle
4. **select** - Dropdown selection
5. **slider** - Range slider with visual feedback
6. **textarea** - Multi-line text input
7. **assistant** - AI assistant selector
8. **file/image** - File upload
9. **json** - JSON editor with syntax validation

**Usage Example:**
```tsx
import NodeParameterForm from '@/components/workflow/NodeParameterForm';

function MyEditor() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Validate and update errors
  };

  return (
    <NodeParameterForm
      parameters={nodeDefinition.parameters}
      values={values}
      errors={errors}
      onChange={handleChange}
    />
  );
}
```

### 3. NodePresets

**Location:** `components/workflow/NodePresets.tsx`

**Purpose:** Wrapper component for preset template selection.

**Key Features:**
- Preset template cards with descriptions
- One-click preset application
- Parameter preview
- Category-based organization

**Props:**
```typescript
interface NodePresetsProps {
  nodeType: string;                   // Node type to show presets for
  currentParameters: Record<string, any>;  // Current parameter values
  onApply: (preset: Record<string, any>) => void;  // Apply callback
}
```

**Usage Example:**
```tsx
import NodePresets from '@/components/workflow/NodePresets';

function PresetTab() {
  const handleApply = (preset: Record<string, any>) => {
    // Apply preset parameters
    setParameters(preset);
  };

  return (
    <NodePresets
      nodeType="purechat_chat"
      currentParameters={currentParameters}
      onApply={handleApply}
    />
  );
}
```

## Parameter Definition

Parameters are defined using the `NodeParameter` interface in `lib/workflow/nodeDefinitions.ts`:

```typescript
interface NodeParameter {
  name: string;                       // Parameter identifier
  label: string;                      // Display label
  type: ParameterType;                // Input type
  defaultValue: any;                  // Default value
  required?: boolean;                 // Is required?
  description?: string;               // Help text
  validation?: (value: any) => boolean | string;  // Custom validation
  options?: Array<{ label: string; value: any }>;  // For select type
  min?: number;                       // For number/slider
  max?: number;                       // For number/slider
  step?: number;                      // For number/slider
  priority?: number;                  // Display priority
  group?: string;                     // Parameter grouping
  dependsOn?: string;                 // Dependency on another parameter
  showWhen?: (params: Record<string, any>) => boolean;  // Conditional visibility
  placeholder?: string;               // Placeholder text
  unit?: string;                      // Unit of measurement
  inline?: boolean;                   // Suitable for inline editing
}
```

**Example Parameter Definitions:**

```typescript
const parameters: NodeParameter[] = [
  {
    name: 'prompt',
    label: '提示词',
    type: 'textarea',
    defaultValue: '',
    required: true,
    description: '输入发送给AI的提示词',
    placeholder: '描述你想让AI做什么...',
    group: '基础配置',
    priority: 10
  },
  {
    name: 'temperature',
    label: '温度参数',
    type: 'slider',
    defaultValue: 0.7,
    min: 0,
    max: 2,
    step: 0.1,
    description: '控制AI响应的随机性和创造性',
    unit: '',
    group: '高级配置',
    priority: 5
  },
  {
    name: 'maxTokens',
    label: '最大Token数',
    type: 'number',
    defaultValue: 1000,
    required: true,
    min: 100,
    max: 4000,
    description: '生成文本的最大长度',
    group: '高级配置',
    validation: (value) => {
      if (value < 100) return '最小值为100';
      if (value > 4000) return '最大值为4000';
      return true;
    }
  },
  {
    name: 'enableCache',
    label: '启用缓存',
    type: 'boolean',
    defaultValue: true,
    description: '缓存相似请求以提高性能',
    group: '性能优化'
  },
  {
    name: 'model',
    label: '模型选择',
    type: 'select',
    defaultValue: 'gpt-4',
    required: true,
    options: [
      { label: 'GPT-4', value: 'gpt-4' },
      { label: 'GPT-3.5', value: 'gpt-3.5-turbo' },
      { label: 'Claude', value: 'claude-2' }
    ],
    group: '基础配置'
  }
];
```

## Validation System

The validation system is built into the `ParameterValidator` class in `lib/workflow/nodeDefinitions.ts`.

**Built-in Validators:**

1. **validateNumber** - Validates numeric values with min/max
2. **validateString** - Validates string values with length constraints
3. **validateBoolean** - Validates boolean values
4. **validateSelect** - Validates selection against options
5. **validateJSON** - Validates JSON format

**Custom Validation:**

You can provide custom validation functions in parameter definitions:

```typescript
{
  name: 'email',
  label: 'Email',
  type: 'string',
  validation: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return '请输入有效的邮箱地址';
    }
    return true;
  }
}
```

**Validation Workflow:**

1. User changes a parameter value
2. `handleParameterChange` in NodeEditor is called
3. Parameter is validated using `ParameterValidator.validateParameter`
4. Validation errors are stored in state
5. Error messages are displayed in the form
6. Save button is disabled if there are errors

## Preset System

Presets are defined in `NodePresetSelector.tsx` for each node type.

**Preset Structure:**

```typescript
interface Preset {
  id: string;                         // Unique identifier
  name: string;                       // Display name
  description: string;                // Description
  icon: React.ReactNode;              // Icon component
  parameters: Record<string, any>;    // Parameter values
  tags: string[];                     // Category tags
}
```

**Adding New Presets:**

1. Open `components/workflow/NodePresetSelector.tsx`
2. Find the `getPresets()` function
3. Add a new case for your node type:

```typescript
case 'my_node_type':
  return [
    {
      id: 'preset1',
      name: '快速模式',
      description: '适合快速处理',
      icon: <Zap className="w-5 h-5" />,
      parameters: {
        speed: 'fast',
        quality: 'medium'
      },
      tags: ['快速', '效率']
    },
    // More presets...
  ];
```

## Styling

The NodeEditor uses CSS modules for styling with theme-aware CSS variables.

**CSS Files:**
- `styles/NodeEditor.module.css` - Main editor styles
- `styles/NodeParameterForm.module.css` - Form styles

**Theme Variables:**

The editor uses CSS variables from the workflow theme system:

```css
--editor-bg: Background color
--editor-border: Border color
--editor-text: Text color
--text-secondary: Secondary text color
--primary: Primary accent color
--danger: Error/danger color
--warning: Warning color
--hover-bg: Hover background
--shadow-lg: Large shadow
--radius-sm/md/lg: Border radius values
--spacing-xs/sm/md/lg/xl/2xl: Spacing values
--duration-fast/normal/slow: Animation durations
--easing: Animation easing function
```

## Animations

The NodeEditor includes smooth animations for a polished user experience:

1. **Slide-in Animation** - Editor slides in from the right
2. **Backdrop Fade** - Backdrop fades in/out
3. **Tab Transitions** - Smooth tab switching
4. **Confirmation Dialog** - Slide-up animation
5. **Unsaved Indicator** - Pulsing dot animation

**Animation Timing:**
- Fast: 150ms (hover effects, small transitions)
- Normal: 300ms (slide-in, fade effects)
- Slow: 500ms (complex animations)

## Accessibility

The NodeEditor follows WCAG 2.1 AA standards:

1. **Keyboard Navigation** - All controls accessible via keyboard
2. **Focus Indicators** - Clear focus states
3. **ARIA Labels** - Proper labeling for screen readers
4. **Color Contrast** - Sufficient contrast ratios
5. **Error Messages** - Clear, descriptive error messages

**Keyboard Shortcuts:**
- `Escape` - Close editor (with confirmation if unsaved changes)
- `Tab` - Navigate between fields
- `Enter` - Submit form (when focused on input)

## Integration with Workflow Canvas

To integrate the NodeEditor with your workflow canvas:

1. **Add State Management:**

```typescript
const [editorState, setEditorState] = useState({
  isOpen: false,
  nodeId: null,
  parameters: {}
});
```

2. **Handle Node Double-Click:**

```typescript
const handleNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
  setEditorState({
    isOpen: true,
    nodeId: node.id,
    parameters: node.data.parameters || {}
  });
};
```

3. **Handle Save:**

```typescript
const handleSave = (nodeId: string, parameters: Record<string, any>) => {
  // Update node in React Flow
  setNodes(nodes => 
    nodes.map(node => 
      node.id === nodeId
        ? {
            ...node,
            data: {
              ...node.data,
              parameters,
              hasUnsavedChanges: false
            }
          }
        : node
    )
  );
  
  setEditorState(prev => ({ ...prev, isOpen: false }));
};
```

4. **Render Editor:**

```tsx
<NodeEditor
  isOpen={editorState.isOpen}
  nodeId={editorState.nodeId}
  nodeDefinition={getNodeDefinition(selectedNodeType)}
  parameters={editorState.parameters}
  onClose={() => setEditorState(prev => ({ ...prev, isOpen: false }))}
  onSave={handleSave}
/>
```

## Best Practices

1. **Parameter Organization:**
   - Group related parameters together
   - Use priority to control display order
   - Provide clear descriptions and placeholders

2. **Validation:**
   - Validate on change for immediate feedback
   - Provide specific error messages
   - Disable save button when errors exist

3. **Presets:**
   - Create presets for common use cases
   - Use descriptive names and descriptions
   - Include parameter previews

4. **Performance:**
   - Use React.memo for form components
   - Debounce validation for expensive checks
   - Lazy load preset data if needed

5. **User Experience:**
   - Show unsaved changes indicator
   - Confirm before discarding changes
   - Provide helpful descriptions
   - Use appropriate input types

## Troubleshooting

### Editor Not Opening

**Problem:** NodeEditor doesn't open when double-clicking a node.

**Solution:**
- Check that `isOpen` prop is being set to `true`
- Verify `onNodeDoubleClick` handler is connected to React Flow
- Ensure `nodeDefinition` is not null

### Validation Not Working

**Problem:** Parameters are not being validated.

**Solution:**
- Check that parameter definitions include validation rules
- Verify `ParameterValidator` is being called in `handleParameterChange`
- Ensure validation errors are being stored in state

### Presets Not Showing

**Problem:** Preset tab is empty.

**Solution:**
- Check that presets are defined for the node type in `NodePresetSelector`
- Verify `nodeType` prop is correct
- Ensure preset data structure matches the interface

### Styling Issues

**Problem:** Editor doesn't match theme or looks broken.

**Solution:**
- Verify CSS module is imported correctly
- Check that theme CSS variables are defined
- Ensure `data-theme` attribute is set on editor element

## Future Enhancements

Potential improvements for future versions:

1. **Advanced Features:**
   - Parameter history/undo
   - Parameter templates (user-defined presets)
   - Bulk parameter editing
   - Parameter search/filter

2. **Validation:**
   - Async validation support
   - Cross-parameter validation
   - Warning-level validation

3. **UI Improvements:**
   - Collapsible parameter groups
   - Parameter tooltips with examples
   - Inline parameter documentation
   - Dark/light theme toggle

4. **Performance:**
   - Virtual scrolling for large parameter lists
   - Lazy loading of parameter editors
   - Optimistic updates

## Requirements Mapping

This implementation satisfies the following requirements from the design specification:

- **Requirement 6.1:** Sidebar popup editor with open/close animations ✓
- **Requirement 6.2:** Modern form controls using HeroUI components ✓
- **Requirement 6.3:** Required field indicators (red asterisk) ✓
- **Requirement 6.4:** Real-time parameter validation with error display ✓
- **Requirement 6.5:** Preset template system for quick configuration ✓
- **Requirement 6.6:** Save and Cancel buttons in footer ✓
- **Requirement 6.7:** Unsaved changes indicator on node ✓

## Conclusion

The NodeEditor provides a comprehensive, user-friendly interface for configuring workflow node parameters. It combines modern UI design, robust validation, and helpful features like presets to create an efficient editing experience.

For questions or issues, refer to the component source code or contact the development team.
