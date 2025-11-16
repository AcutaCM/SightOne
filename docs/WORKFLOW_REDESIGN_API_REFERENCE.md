# Workflow Redesign API Reference

## Table of Contents

1. [Core Types](#core-types)
2. [Layout Components](#layout-components)
3. [Canvas Components](#canvas-components)
4. [Node Library Components](#node-library-components)
5. [Control Panel Components](#control-panel-components)
6. [Editor Components](#editor-components)
7. [Utility Components](#utility-components)
8. [Hooks](#hooks)
9. [Utilities](#utilities)

## Core Types

### NodeData

```typescript
interface NodeData {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  status: 'idle' | 'running' | 'success' | 'error';
  parameters: Record<string, any>;
  hasUnsavedChanges: boolean;
}
```

### NodeDefinition

```typescript
interface NodeDefinition {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: string;
  tags: string[];
  parameters: ParameterDefinition[];
}
```

### ParameterDefinition

```typescript
interface ParameterDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'slider';
  required: boolean;
  defaultValue: any;
  validation?: ValidationRule[];
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}
```

### ConnectionStatus

```typescript
interface ConnectionStatus {
  drone: boolean;
  websocket: boolean;
  lastUpdate: Date;
}
```

### WorkflowStatus

```typescript
interface WorkflowStatus {
  isRunning: boolean;
  currentNode?: string;
  progress: number;
  startTime?: Date;
  error?: string;
}
```

### LogEntry

```typescript
interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  nodeId?: string;
  nodeName?: string;
}
```

### ResultEntry

```typescript
interface ResultEntry {
  id: string;
  nodeId: string;
  nodeName: string;
  result: any;
  resultType: string;
  timestamp: Date;
}
```

## Layout Components

### WorkflowEditorLayout

Main layout container for the workflow editor.

```typescript
interface WorkflowEditorLayoutProps {
  children?: React.ReactNode;
  theme?: 'light' | 'dark';
  initialLayout?: LayoutState;
  onLayoutChange?: (layout: LayoutState) => void;
}

interface LayoutState {
  isNodeLibraryCollapsed: boolean;
  isControlPanelCollapsed: boolean;
  nodeLibraryWidth: number;
  controlPanelWidth: number;
}
```

**Methods:**
- `resetLayout()` - Reset to default layout
- `saveLayout()` - Save current layout to localStorage
- `loadLayout()` - Load layout from localStorage

**Events:**
- `onLayoutChange(layout)` - Fired when layout changes

**Example:**
```tsx
<WorkflowEditorLayout
  theme="dark"
  initialLayout={{
    isNodeLibraryCollapsed: false,
    isControlPanelCollapsed: false,
    nodeLibraryWidth: 280,
    controlPanelWidth: 360
  }}
  onLayoutChange={(layout) => console.log('Layout changed:', layout)}
>
  {/* Content */}
</WorkflowEditorLayout>
```

### CollapsibleNodeLibrary

Left panel containing the node library.

```typescript
interface CollapsibleNodeLibraryProps {
  isCollapsed: boolean;
  width: number;
  nodes: NodeDefinition[];
  categories: NodeCategory[];
  searchQuery?: string;
  activeCategory?: string;
  onToggleCollapse: () => void;
  onWidthChange: (width: number) => void;
  onSearchChange?: (query: string) => void;
  onCategoryChange?: (categoryId: string) => void;
  onNodeDragStart?: (event: React.DragEvent, node: NodeDefinition) => void;
  onNodeClick?: (node: NodeDefinition) => void;
}

interface NodeCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  collapsed?: boolean;
}
```

**Example:**
```tsx
<CollapsibleNodeLibrary
  isCollapsed={false}
  width={280}
  nodes={nodeDefinitions}
  categories={categories}
  searchQuery={search}
  activeCategory="basic"
  onToggleCollapse={() => setCollapsed(!collapsed)}
  onWidthChange={setWidth}
  onSearchChange={setSearch}
  onCategoryChange={setCategory}
  onNodeDragStart={handleDragStart}
/>
```

### CollapsibleControlPanel

Right panel for workflow control and monitoring.

```typescript
interface CollapsibleControlPanelProps {
  isCollapsed: boolean;
  width: number;
  connectionStatus: ConnectionStatus;
  workflowStatus: WorkflowStatus;
  logs: LogEntry[];
  results: ResultEntry[];
  activeTab?: 'logs' | 'results';
  onToggleCollapse: () => void;
  onWidthChange: (width: number) => void;
  onTabChange?: (tab: 'logs' | 'results') => void;
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  onClear: () => void;
  onExportLogs?: (format: 'json' | 'txt') => void;
}
```

**Example:**
```tsx
<CollapsibleControlPanel
  isCollapsed={false}
  width={360}
  connectionStatus={status}
  workflowStatus={workflowStatus}
  logs={logs}
  results={results}
  activeTab="logs"
  onToggleCollapse={() => setCollapsed(!collapsed)}
  onWidthChange={setWidth}
  onRun={handleRun}
  onStop={handleStop}
  onSave={handleSave}
  onClear={handleClear}
/>
```

## Canvas Components

### WorkflowCanvas

Main canvas component using React Flow.

```typescript
interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onPaneClick?: (event: React.MouseEvent) => void;
  theme?: 'light' | 'dark';
  showMinimap?: boolean;
  showControls?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  minZoom?: number;
  maxZoom?: number;
}
```

**Example:**
```tsx
<WorkflowCanvas
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  onNodeDoubleClick={handleNodeEdit}
  theme="dark"
  showMinimap={true}
  snapToGrid={true}
  gridSize={20}
  minZoom={0.5}
  maxZoom={2}
/>
```

### CustomWorkflowNode

Custom node component with enhanced features.

```typescript
interface CustomWorkflowNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  theme?: 'light' | 'dark';
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: NodeStatus) => void;
}
```

**Example:**
```tsx
<CustomWorkflowNode
  id="node-1"
  data={{
    type: 'takeoff',
    label: 'Takeoff',
    icon: <RocketIcon />,
    color: '#3b82f6',
    status: 'idle',
    parameters: { height: 100 },
    hasUnsavedChanges: false
  }}
  selected={true}
  theme="dark"
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### AnimatedEdge

Custom edge component with animations.

```typescript
interface AnimatedEdgeProps {
  id: string;
  source: string;
  target: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  animated?: boolean;
  selected?: boolean;
  style?: React.CSSProperties;
}
```

## Node Library Components

### NodeCard

Individual node card in the library.

```typescript
interface NodeCardProps {
  node: NodeDefinition;
  onDragStart: (event: React.DragEvent, node: NodeDefinition) => void;
  onClick?: (node: NodeDefinition) => void;
  showDescription?: boolean;
  compact?: boolean;
}
```

**Example:**
```tsx
<NodeCard
  node={nodeDefinition}
  onDragStart={handleDragStart}
  onClick={handleClick}
  showDescription={true}
  compact={false}
/>
```

### CategoryTabs

Category navigation component.

```typescript
interface CategoryTabsProps {
  categories: NodeCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  collapsedCategories?: string[];
  onToggleCategory?: (categoryId: string) => void;
}
```

**Example:**
```tsx
<CategoryTabs
  categories={categories}
  activeCategory="basic"
  onCategoryChange={setActiveCategory}
  collapsedCategories={collapsed}
  onToggleCategory={toggleCategory}
/>
```

### NodeLibraryHeader

Header with search functionality.

```typescript
interface NodeLibraryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleCollapse: () => void;
  resultCount?: number;
  totalCount?: number;
}
```

**Example:**
```tsx
<NodeLibraryHeader
  searchQuery={search}
  onSearchChange={setSearch}
  onToggleCollapse={toggleCollapse}
  resultCount={filteredNodes.length}
  totalCount={allNodes.length}
/>
```

### NodeLibraryFooter

Footer with statistics and actions.

```typescript
interface NodeLibraryFooterProps {
  totalNodes: number;
  visibleNodes: number;
  onClearSearch?: () => void;
  onRefresh?: () => void;
}
```

## Control Panel Components

### ActionButtons

Main action button group.

```typescript
interface ActionButtonsProps {
  isRunning: boolean;
  canRun: boolean;
  canStop: boolean;
  canSave: boolean;
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  onClear: () => void;
  onAIGenerate?: () => void;
  showAIButton?: boolean;
}
```

**Example:**
```tsx
<ActionButtons
  isRunning={false}
  canRun={true}
  canStop={false}
  canSave={true}
  onRun={handleRun}
  onStop={handleStop}
  onSave={handleSave}
  onClear={handleClear}
  onAIGenerate={handleAIGenerate}
  showAIButton={true}
/>
```

### OutputTabs

Tabbed output interface.

```typescript
interface OutputTabsProps {
  activeTab: 'logs' | 'results';
  onTabChange: (tab: 'logs' | 'results') => void;
  logCount: number;
  resultCount: number;
  children: React.ReactNode;
}
```

### LogList

Virtualized log list component.

```typescript
interface LogListProps {
  logs: LogEntry[];
  autoScroll?: boolean;
  maxHeight?: number;
  filterLevel?: LogLevel[];
  searchQuery?: string;
  onLogClick?: (log: LogEntry) => void;
  onNodeClick?: (nodeId: string) => void;
}
```

**Example:**
```tsx
<LogList
  logs={logs}
  autoScroll={true}
  maxHeight={400}
  filterLevel={['error', 'warning']}
  searchQuery={search}
  onLogClick={handleLogClick}
  onNodeClick={handleNodeClick}
/>
```

### ResultList

Result display component.

```typescript
interface ResultListProps {
  results: ResultEntry[];
  onResultClick?: (result: ResultEntry) => void;
  onCopyResult?: (result: ResultEntry) => void;
  expandedResults?: string[];
  onToggleExpand?: (resultId: string) => void;
}
```

## Editor Components

### NodeEditor

Side panel node editor.

```typescript
interface NodeEditorProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, data: NodeData) => void;
  onCancel?: () => void;
  presets?: Preset[];
}
```

**Example:**
```tsx
<NodeEditor
  node={selectedNode}
  isOpen={isEditorOpen}
  onClose={() => setEditorOpen(false)}
  onSave={handleSave}
  presets={nodePresets}
/>
```

### NodeParameterForm

Parameter editing form.

```typescript
interface NodeParameterFormProps {
  parameters: ParameterDefinition[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  errors?: Record<string, string>;
  onValidate?: (values: Record<string, any>) => Record<string, string>;
}
```

### NodePresetSelector

Preset template selector.

```typescript
interface NodePresetSelectorProps {
  nodeType: string;
  presets: Preset[];
  onSelect: (preset: Preset) => void;
  onSavePreset?: (name: string, values: Record<string, any>) => void;
  onDeletePreset?: (presetId: string) => void;
}

interface Preset {
  id: string;
  name: string;
  description?: string;
  values: Record<string, any>;
  isCustom?: boolean;
}
```

## Utility Components

### CanvasToolbar

Canvas operation toolbar.

```typescript
interface CanvasToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFitView: () => void;
  onExport?: () => void;
  onValidate?: () => void;
  showExport?: boolean;
  showValidate?: boolean;
}
```

### CustomMiniMap

Canvas mini-map component.

```typescript
interface CustomMiniMapProps {
  nodes: Node[];
  viewport: Viewport;
  onViewportChange?: (viewport: Viewport) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  width?: number;
  height?: number;
}
```

### KeyboardShortcutsPanel

Keyboard shortcuts help panel.

```typescript
interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: ShortcutDefinition[];
  searchable?: boolean;
}

interface ShortcutDefinition {
  key: string;
  description: string;
  category: string;
  action: () => void;
}
```

### UndoRedoControls

Undo/redo button controls.

```typescript
interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historySize?: number;
  showHistory?: boolean;
}
```

## Hooks

### useWorkflowTheme

Theme management hook.

```typescript
function useWorkflowTheme(): {
  theme: 'light' | 'dark';
  colors: ThemeColors;
  shadows: ThemeShadows;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

**Example:**
```tsx
const { theme, colors, shadows, toggleTheme } = useWorkflowTheme();
```

### useResponsiveLayout

Responsive layout hook.

```typescript
function useResponsiveLayout(): {
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}
```

### useKeyboardShortcuts

Keyboard shortcuts hook.

```typescript
function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled?: boolean
): void
```

**Example:**
```tsx
useKeyboardShortcuts({
  'ctrl+s': handleSave,
  'ctrl+z': handleUndo,
  'ctrl+y': handleRedo,
  'delete': handleDelete
}, true);
```

### useNodeResize

Node resize hook.

```typescript
function useNodeResize(
  nodeId: string,
  initialSize: { width: number; height: number }
): {
  size: { width: number; height: number };
  isResizing: boolean;
  startResize: (direction: ResizeDirection) => void;
  stopResize: () => void;
}
```

### useNodeCollapse

Node collapse state hook.

```typescript
function useNodeCollapse(
  nodeId: string,
  initialCollapsed?: boolean
): {
  isCollapsed: boolean;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
}
```

## Utilities

### workflowValidator

Workflow validation utilities.

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  type: string;
  message: string;
}

function validateWorkflow(
  nodes: Node[],
  edges: Edge[]
): ValidationResult

function validateNode(
  node: Node,
  definition: NodeDefinition
): ValidationError[]

function validateConnection(
  source: Node,
  target: Node,
  edge: Edge
): ValidationError[]
```

### workflowExporter

Workflow export utilities.

```typescript
function exportToPNG(
  nodes: Node[],
  edges: Edge[],
  options?: ExportOptions
): Promise<Blob>

function exportToSVG(
  nodes: Node[],
  edges: Edge[],
  options?: ExportOptions
): Promise<string>

function exportToJSON(
  nodes: Node[],
  edges: Edge[]
): string

interface ExportOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  padding?: number;
  quality?: number;
}
```

### workflowStorage

Workflow storage utilities.

```typescript
function saveWorkflow(
  name: string,
  nodes: Node[],
  edges: Edge[],
  metadata?: WorkflowMetadata
): Promise<string>

function loadWorkflow(
  id: string
): Promise<{ nodes: Node[]; edges: Edge[]; metadata: WorkflowMetadata }>

function listWorkflows(): Promise<WorkflowSummary[]>

function deleteWorkflow(id: string): Promise<void>

interface WorkflowMetadata {
  name: string;
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  version: string;
}
```

### historyManager

Undo/redo history management.

```typescript
function createHistoryManager(maxSize?: number): HistoryManager

interface HistoryManager {
  push(state: WorkflowState): void;
  undo(): WorkflowState | null;
  redo(): WorkflowState | null;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
  getHistory(): WorkflowState[];
}
```

## Events

### Workflow Events

```typescript
// Node events
onNodeClick(event: React.MouseEvent, node: Node): void
onNodeDoubleClick(event: React.MouseEvent, node: Node): void
onNodeDragStart(event: React.DragEvent, node: Node): void
onNodeDragStop(event: React.DragEvent, node: Node): void
onNodeDelete(nodeId: string): void

// Edge events
onEdgeClick(event: React.MouseEvent, edge: Edge): void
onConnect(connection: Connection): void
onEdgeDelete(edgeId: string): void

// Canvas events
onPaneClick(event: React.MouseEvent): void
onPaneScroll(event: React.WheelEvent): void
onPaneContextMenu(event: React.MouseEvent): void

// Workflow events
onWorkflowRun(): void
onWorkflowStop(): void
onWorkflowSave(): void
onWorkflowLoad(workflowId: string): void
onWorkflowValidate(): void
```

## Error Handling

All components handle errors gracefully and provide error boundaries:

```typescript
<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error, errorInfo) => {
    console.error('Workflow error:', error, errorInfo);
  }}
>
  <WorkflowEditorLayout>
    {/* Content */}
  </WorkflowEditorLayout>
</ErrorBoundary>
```

## Performance Considerations

- Use `React.memo` for expensive components
- Implement virtualization for large lists
- Debounce search and resize operations
- Use `useCallback` for event handlers
- Lazy load heavy components

## Browser Support

- Chrome/Edge ≥ 90
- Firefox ≥ 88
- Safari ≥ 14
- No IE support

## Version History

- **v2.0.0** - Complete UI redesign with three-column layout
- **v1.5.0** - Added theme system and responsive layout
- **v1.0.0** - Initial workflow system
