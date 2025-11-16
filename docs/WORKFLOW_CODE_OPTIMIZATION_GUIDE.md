# Workflow UI Redesign - Code Optimization Guide

## Overview

This guide provides specific optimization strategies and best practices for the workflow UI redesign codebase.

## Table of Contents

1. [Performance Optimization](#performance-optimization)
2. [Code Structure Optimization](#code-structure-optimization)
3. [Bundle Size Optimization](#bundle-size-optimization)
4. [Memory Optimization](#memory-optimization)
5. [Rendering Optimization](#rendering-optimization)
6. [Network Optimization](#network-optimization)
7. [Accessibility Optimization](#accessibility-optimization)
8. [Developer Experience](#developer-experience)

## Performance Optimization

### React Component Optimization

#### Use React.memo for Pure Components

**Before:**
```tsx
export function NodeCard({ node, onDragStart }: NodeCardProps) {
  return (
    <div className={styles.card}>
      {/* Component content */}
    </div>
  );
}
```

**After:**
```tsx
export const NodeCard = React.memo(function NodeCard({ 
  node, 
  onDragStart 
}: NodeCardProps) {
  return (
    <div className={styles.card}>
      {/* Component content */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return prevProps.node.id === nextProps.node.id &&
         prevProps.node.label === nextProps.node.label;
});
```

#### Memoize Expensive Calculations

**Before:**
```tsx
function WorkflowCanvas({ nodes, edges }: Props) {
  const validationErrors = validateWorkflow(nodes, edges);
  const nodePositions = calculatePositions(nodes);
  
  return <div>{/* Render */}</div>;
}
```

**After:**
```tsx
function WorkflowCanvas({ nodes, edges }: Props) {
  const validationErrors = useMemo(
    () => validateWorkflow(nodes, edges),
    [nodes, edges]
  );
  
  const nodePositions = useMemo(
    () => calculatePositions(nodes),
    [nodes]
  );
  
  return <div>{/* Render */}</div>;
}
```

#### Stabilize Event Handlers

**Before:**
```tsx
function NodeEditor({ node }: Props) {
  return (
    <button onClick={() => handleSave(node)}>
      Save
    </button>
  );
}
```

**After:**
```tsx
function NodeEditor({ node }: Props) {
  const handleSaveClick = useCallback(() => {
    handleSave(node);
  }, [node]);
  
  return (
    <button onClick={handleSaveClick}>
      Save
    </button>
  );
}
```

### Virtualization for Large Lists

**Before:**
```tsx
function NodeLibrary({ nodes }: Props) {
  return (
    <div>
      {nodes.map(node => (
        <NodeCard key={node.id} node={node} />
      ))}
    </div>
  );
}
```

**After:**
```tsx
import { FixedSizeList } from 'react-window';

function NodeLibrary({ nodes }: Props) {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <NodeCard node={nodes[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={nodes.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Debounce and Throttle

**Search Debouncing:**
```tsx
import { useDebouncedCallback } from 'use-debounce';

function NodeLibraryHeader({ onSearchChange }: Props) {
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      onSearchChange(value);
    },
    300
  );
  
  return (
    <input
      type="text"
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search nodes..."
    />
  );
}
```

**Scroll Throttling:**
```tsx
import { useThrottledCallback } from 'use-debounce';

function WorkflowCanvas() {
  const throttledScroll = useThrottledCallback(
    (event: WheelEvent) => {
      handleZoom(event);
    },
    16 // ~60fps
  );
  
  useEffect(() => {
    window.addEventListener('wheel', throttledScroll);
    return () => window.removeEventListener('wheel', throttledScroll);
  }, [throttledScroll]);
}
```

### Lazy Loading

**Component Lazy Loading:**
```tsx
import { lazy, Suspense } from 'react';

const NodeEditor = lazy(() => import('./NodeEditor'));
const AIWorkflowGenerator = lazy(() => import('./AIWorkflowGenerator'));

function WorkflowEditorLayout() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        {showEditor && <NodeEditor />}
        {showAIGenerator && <AIWorkflowGenerator />}
      </Suspense>
    </div>
  );
}
```

**Route-based Code Splitting:**
```tsx
// app/workflow/page.tsx
import dynamic from 'next/dynamic';

const WorkflowEditor = dynamic(
  () => import('@/components/WorkflowEditor'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export default function WorkflowPage() {
  return <WorkflowEditor />;
}
```

## Code Structure Optimization

### Extract Reusable Logic

**Before:**
```tsx
function ComponentA() {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  return <div>{/* ... */}</div>;
}

function ComponentB() {
  // Same theme logic duplicated
}
```

**After:**
```tsx
// hooks/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored);
  }, []);
  
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);
  
  return { theme, toggleTheme };
}

// Components
function ComponentA() {
  const { theme, toggleTheme } = useTheme();
  return <div>{/* ... */}</div>;
}

function ComponentB() {
  const { theme, toggleTheme } = useTheme();
  return <div>{/* ... */}</div>;
}
```

### Simplify Complex Components

**Before:**
```tsx
function WorkflowCanvas({ nodes, edges, ...props }: Props) {
  // 500 lines of code
  // Multiple responsibilities
  // Hard to test and maintain
}
```

**After:**
```tsx
// Split into smaller components
function WorkflowCanvas({ nodes, edges }: Props) {
  return (
    <div className={styles.canvas}>
      <CanvasBackground />
      <CanvasNodes nodes={nodes} />
      <CanvasEdges edges={edges} />
      <CanvasControls />
      <CanvasMiniMap />
    </div>
  );
}

// Each component has single responsibility
function CanvasNodes({ nodes }: { nodes: Node[] }) {
  return (
    <>
      {nodes.map(node => (
        <CustomWorkflowNode key={node.id} {...node} />
      ))}
    </>
  );
}
```

### Use Composition Over Inheritance

**Before:**
```tsx
class BaseNode extends React.Component {
  // Common node logic
}

class TakeoffNode extends BaseNode {
  // Takeoff-specific logic
}

class LandNode extends BaseNode {
  // Land-specific logic
}
```

**After:**
```tsx
// Composable node wrapper
function WorkflowNode({ 
  children, 
  header, 
  footer 
}: WorkflowNodeProps) {
  return (
    <div className={styles.node}>
      <NodeHeader>{header}</NodeHeader>
      <NodeBody>{children}</NodeBody>
      <NodeFooter>{footer}</NodeFooter>
    </div>
  );
}

// Specific nodes use composition
function TakeoffNode({ data }: Props) {
  return (
    <WorkflowNode
      header={<TakeoffHeader />}
      footer={<NodeStatus status={data.status} />}
    >
      <TakeoffParameters data={data} />
    </WorkflowNode>
  );
}
```

## Bundle Size Optimization

### Tree Shaking

**Before:**
```tsx
import _ from 'lodash';

const result = _.debounce(fn, 300);
```

**After:**
```tsx
import debounce from 'lodash/debounce';

const result = debounce(fn, 300);
```

### Dynamic Imports

**Before:**
```tsx
import { Chart } from 'chart.js';

function ResultsPanel() {
  return <Chart data={data} />;
}
```

**After:**
```tsx
const Chart = dynamic(() => import('chart.js'), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

function ResultsPanel() {
  return <Chart data={data} />;
}
```

### Remove Unused Dependencies

```bash
# Analyze bundle
npm run analyze

# Find unused dependencies
npx depcheck

# Remove unused packages
npm uninstall unused-package
```

### Optimize Images

```tsx
// Use Next.js Image component
import Image from 'next/image';

function NodeIcon({ src, alt }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={24}
      height={24}
      loading="lazy"
    />
  );
}
```

## Memory Optimization

### Cleanup Side Effects

**Before:**
```tsx
function WorkflowCanvas() {
  useEffect(() => {
    const interval = setInterval(() => {
      updateStatus();
    }, 1000);
    
    window.addEventListener('resize', handleResize);
    
    // Missing cleanup!
  }, []);
}
```

**After:**
```tsx
function WorkflowCanvas() {
  useEffect(() => {
    const interval = setInterval(() => {
      updateStatus();
    }, 1000);
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
}
```

### Avoid Memory Leaks

**Before:**
```tsx
function NodeEditor({ node }: Props) {
  const [data, setData] = useState(node.data);
  
  useEffect(() => {
    fetchNodeData(node.id).then(setData);
    // Component might unmount before promise resolves
  }, [node.id]);
}
```

**After:**
```tsx
function NodeEditor({ node }: Props) {
  const [data, setData] = useState(node.data);
  
  useEffect(() => {
    let cancelled = false;
    
    fetchNodeData(node.id).then(result => {
      if (!cancelled) {
        setData(result);
      }
    });
    
    return () => {
      cancelled = true;
    };
  }, [node.id]);
}
```

### Release Large Objects

```tsx
function ImageAnalysisNode() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    // Use canvas context
    
    return () => {
      // Release context
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, []);
}
```

## Rendering Optimization

### Avoid Unnecessary Re-renders

**Use React DevTools Profiler:**
```tsx
// Wrap component to profile
<Profiler id="WorkflowCanvas" onRender={onRenderCallback}>
  <WorkflowCanvas />
</Profiler>
```

**Optimize Context:**
```tsx
// Before: Single context causes all consumers to re-render
const WorkflowContext = createContext({
  nodes, edges, theme, status, logs
});

// After: Split into multiple contexts
const WorkflowDataContext = createContext({ nodes, edges });
const WorkflowThemeContext = createContext({ theme });
const WorkflowStatusContext = createContext({ status, logs });
```

### Optimize CSS

**Use CSS Transforms:**
```css
/* Before: Causes layout recalculation */
.node {
  position: absolute;
  left: 100px;
  top: 100px;
}

/* After: Uses GPU acceleration */
.node {
  transform: translate(100px, 100px);
  will-change: transform;
}
```

**Minimize Repaints:**
```css
/* Avoid properties that trigger reflow */
.node {
  /* Bad: triggers reflow */
  width: 200px;
  height: 100px;
  
  /* Good: doesn't trigger reflow */
  transform: scale(1.1);
  opacity: 0.9;
}
```

## Network Optimization

### API Request Optimization

**Batch Requests:**
```tsx
// Before: Multiple requests
const node1 = await fetchNode(id1);
const node2 = await fetchNode(id2);
const node3 = await fetchNode(id3);

// After: Single batched request
const nodes = await fetchNodes([id1, id2, id3]);
```

**Cache Responses:**
```tsx
const nodeCache = new Map<string, NodeData>();

async function fetchNode(id: string): Promise<NodeData> {
  if (nodeCache.has(id)) {
    return nodeCache.get(id)!;
  }
  
  const data = await api.getNode(id);
  nodeCache.set(id, data);
  return data;
}
```

**Use SWR for Data Fetching:**
```tsx
import useSWR from 'swr';

function NodeEditor({ nodeId }: Props) {
  const { data, error, isLoading } = useSWR(
    `/api/nodes/${nodeId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000
    }
  );
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error />;
  
  return <NodeForm data={data} />;
}
```

## Accessibility Optimization

### Semantic HTML

**Before:**
```tsx
<div onClick={handleClick}>
  <div>Node Name</div>
</div>
```

**After:**
```tsx
<button onClick={handleClick} aria-label="Edit node">
  <span>Node Name</span>
</button>
```

### Keyboard Navigation

```tsx
function NodeCard({ node }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(node);
    }
  };
  
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => handleSelect(node)}
      aria-label={`Select ${node.label} node`}
    >
      {node.label}
    </div>
  );
}
```

### Focus Management

```tsx
function NodeEditor({ isOpen }: Props) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);
  
  return (
    <div role="dialog" aria-modal="true">
      <input ref={firstInputRef} />
    </div>
  );
}
```

## Developer Experience

### Type Safety

```tsx
// Define strict types
interface NodeData {
  id: string;
  type: NodeType; // enum, not string
  parameters: Record<string, unknown>;
}

// Use discriminated unions
type WorkflowEvent =
  | { type: 'NODE_ADDED'; node: Node }
  | { type: 'NODE_REMOVED'; nodeId: string }
  | { type: 'EDGE_CREATED'; edge: Edge };

function handleEvent(event: WorkflowEvent) {
  switch (event.type) {
    case 'NODE_ADDED':
      // TypeScript knows event.node exists
      break;
    case 'NODE_REMOVED':
      // TypeScript knows event.nodeId exists
      break;
  }
}
```

### Error Handling

```tsx
// Create custom error types
class WorkflowValidationError extends Error {
  constructor(
    message: string,
    public nodeId?: string,
    public edgeId?: string
  ) {
    super(message);
    this.name = 'WorkflowValidationError';
  }
}

// Use error boundaries
class WorkflowErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### Testing Utilities

```tsx
// Create test utilities
export function createMockNode(overrides?: Partial<Node>): Node {
  return {
    id: 'test-node',
    type: 'takeoff',
    position: { x: 0, y: 0 },
    data: {},
    ...overrides
  };
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(
    <WorkflowProvider>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </WorkflowProvider>,
    options
  );
}
```

## Monitoring and Profiling

### Performance Monitoring

```tsx
// Add performance marks
function WorkflowCanvas() {
  useEffect(() => {
    performance.mark('workflow-render-start');
    
    return () => {
      performance.mark('workflow-render-end');
      performance.measure(
        'workflow-render',
        'workflow-render-start',
        'workflow-render-end'
      );
    };
  }, []);
}
```

### Error Tracking

```tsx
// Integrate error tracking
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    return event;
  }
});
```

## Optimization Checklist

- [ ] All components use React.memo where beneficial
- [ ] Expensive calculations are memoized
- [ ] Event handlers are stabilized with useCallback
- [ ] Large lists use virtualization
- [ ] Search inputs are debounced
- [ ] Scroll handlers are throttled
- [ ] Heavy components are lazy loaded
- [ ] Bundle size is optimized
- [ ] Images are optimized
- [ ] API requests are cached
- [ ] Memory leaks are prevented
- [ ] Accessibility is optimized
- [ ] Performance is monitored
- [ ] Errors are tracked

## Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

---

**Last Updated:** 2024-01-15
**Version:** 2.0.0
