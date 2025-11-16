# Workflow UI Integration Guide

## 集成指南

本文档说明如何将新的 UI/UX 增强功能集成到现有的工作流系统中。

## 1. 安装依赖

确保已安装以下依赖：

```bash
npm install framer-motion
npm install @heroui/react
npm install reactflow
npm install lucide-react
```

## 2. 导入设计系统

### 在组件中使用设计系统

```typescript
// 导入设计令牌
import {
  nodeColors,
  nodeStatusColors,
  nodeStyles,
  shadows,
  animations,
  getNodeStyle,
  getCategoryStyle,
  getStatusIndicatorStyle,
} from '@/lib/workflow/designSystem';

// 使用示例
const MyComponent = () => {
  // 获取节点样式
  const style = getNodeStyle('ai', 'running', 'default');
  
  // 获取分类样式
  const categoryStyle = getCategoryStyle('detection');
  
  // 获取状态指示器样式
  const indicatorStyle = getStatusIndicatorStyle('success');
  
  return (
    <div style={style}>
      <div style={indicatorStyle} />
      {/* 内容 */}
    </div>
  );
};
```

## 3. 使用动画系统

### 基础动画

```typescript
import { motion } from 'framer-motion';
import {
  nodeHoverAnimation,
  buttonClickAnimation,
  listItemAnimation,
} from '@/lib/workflow/animations';

// 节点悬停动画
<motion.div
  variants={nodeHoverAnimation}
  initial="rest"
  whileHover="hover"
  whileTap="tap"
>
  节点内容
</motion.div>

// 按钮点击动画
<motion.button
  variants={buttonClickAnimation}
  whileHover="hover"
  whileTap="tap"
>
  点击我
</motion.button>

// 列表项动画
{items.map((item, index) => (
  <motion.div
    key={item.id}
    custom={index}
    initial="hidden"
    animate="visible"
    variants={listItemAnimation}
  >
    {item.content}
  </motion.div>
))}
```

### 高级动画

```typescript
import {
  applyAnimation,
  createRipple,
  cssAnimations,
} from '@/lib/workflow/animations';

// 应用 CSS 动画
const element = document.getElementById('myElement');
await applyAnimation(element, 'bounce', 500);

// 创建涟漪效果
<button onClick={createRipple}>
  点击产生涟漪
</button>

// 在全局样式中添加 CSS 动画
<style jsx global>{cssAnimations}</style>
```

## 4. 集成动画节点

### 替换现有节点组件

```typescript
// 之前
import StatusNode from './StatusNode';

const nodeTypes = {
  statusNode: StatusNode,
};

// 之后
import AnimatedWorkflowNode from '@/components/workflow/AnimatedWorkflowNode';

const nodeTypes = {
  statusNode: StatusNode,           // 保留旧的
  animated: AnimatedWorkflowNode,   // 添加新的
};

// 在 ReactFlow 中使用
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
/>
```

### 更新节点数据结构

```typescript
// 创建节点时添加必要的数据
const newNode = {
  id: getId(),
  type: 'animated',  // 使用动画节点类型
  position,
  data: {
    label: '节点名称',
    status: 'idle',
    nodeType: 'takeoff',
    category: 'basic',
    icon: Plane,
    color: '#4A90E2',
    parameters: {
      height: 100,
      waitForStable: true,
    },
  },
};
```

## 5. 集成动画连接线

### 添加自定义边类型

```typescript
import AnimatedEdge from '@/components/workflow/AnimatedEdge';

const edgeTypes = {
  default: AnimatedEdge,
  animated: AnimatedEdge,
};

<ReactFlow
  nodes={nodes}
  edges={edges}
  edgeTypes={edgeTypes}
/>
```

### 更新边数据

```typescript
// 创建边时添加数据
const newEdge = {
  id: `edge-${sourceId}-${targetId}`,
  source: sourceId,
  target: targetId,
  type: 'animated',
  data: {
    isActive: false,      // 是否活动
    isConditional: false, // 是否条件分支
    label: '',            // 标签文字
  },
};

// 执行时更新边状态
setEdges((eds) =>
  eds.map((edge) => {
    if (edge.source === currentNodeId) {
      return {
        ...edge,
        data: { ...edge.data, isActive: true },
      };
    }
    return edge;
  })
);
```

## 6. 集成增强节点库

### 替换现有节点库

```typescript
// 之前
import NodeLibrary from './NodeLibrary';

<NodeLibrary
  nodes={telloFlowNodes}
  onDragStart={handleDragStart}
/>

// 之后
import EnhancedNodeLibraryV2 from '@/components/workflow/EnhancedNodeLibraryV2';

<EnhancedNodeLibraryV2
  isVisible={isNodeLibraryVisible}
  onNodeDragStart={handleNodeDragStart}
/>
```

### 处理节点拖拽

```typescript
const handleNodeDragStart = (
  event: React.DragEvent,
  node: WorkflowNodeDefinition
) => {
  // 自定义拖拽逻辑
  console.log('开始拖拽节点:', node.label);
  
  // 可以添加视觉反馈
  event.currentTarget.style.opacity = '0.5';
};
```

## 7. 集成增强控制面板

### 替换现有控制面板

```typescript
// 之前
<div className="control-panel">
  <button onClick={handleRun}>运行</button>
  <button onClick={handleStop}>停止</button>
  <div className="logs">
    {logs.map(log => <div>{log}</div>)}
  </div>
</div>

// 之后
import EnhancedControlPanel from '@/components/workflow/EnhancedControlPanel';

<EnhancedControlPanel
  isConnected={isConnected}
  wsConnected={wsConnected}
  isRunning={isRunning}
  hasUnsavedChanges={hasUnsavedChanges}
  logs={logs}
  results={results}
  onRun={handleRun}
  onStop={handleStop}
  onSave={handleSave}
  onLoad={handleLoad}
  onClear={handleClear}
  onAIGenerate={handleAIGenerate}
/>
```

### 更新状态管理

```typescript
const [isRunning, setIsRunning] = useState(false);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [logs, setLogs] = useState<string[]>([]);
const [results, setResults] = useState<Array<{
  task: string;
  result: any;
  resultType?: string;
}>>([]);

// 添加日志
const addLog = (message: string) => {
  setLogs(prev => [...prev, message]);
};

// 添加结果
const addResult = (task: string, result: any, resultType?: string) => {
  setResults(prev => [...prev, { task, result, resultType }]);
};

// 跟踪未保存更改
useEffect(() => {
  const currentState = JSON.stringify({ nodes, edges });
  if (lastSavedState && currentState !== lastSavedState) {
    setHasUnsavedChanges(true);
  }
}, [nodes, edges, lastSavedState]);
```

## 8. 样式集成

### 导入样式模块

```typescript
import styles from '@/styles/WorkflowDesignSystem.module.css';

// 使用样式类
<div className={styles.nodeLibrary}>
  <div className={styles.nodeLibraryHeader}>
    <h3 className={styles.nodeLibraryTitle}>节点库</h3>
  </div>
  <div className={styles.nodeList}>
    {/* 节点列表 */}
  </div>
</div>
```

### 全局样式

在 `globals.css` 中已包含必要的全局样式，无需额外配置。

## 9. 完整集成示例

### TelloWorkflowPanel 集成

```typescript
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedWorkflowNode from '@/components/workflow/AnimatedWorkflowNode';
import AnimatedEdge from '@/components/workflow/AnimatedEdge';
import EnhancedNodeLibraryV2 from '@/components/workflow/EnhancedNodeLibraryV2';
import EnhancedControlPanel from '@/components/workflow/EnhancedControlPanel';
import WorkflowCanvas from './WorkflowCanvas';
import { panelAnimation } from '@/lib/workflow/animations';
import styles from '@/styles/WorkflowDesignSystem.module.css';

const TelloWorkflowPanel = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isNodeLibraryVisible, setIsNodeLibraryVisible] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState([]);

  // 节点类型
  const nodeTypes = useMemo(() => ({
    animated: AnimatedWorkflowNode,
  }), []);

  // 边类型
  const edgeTypes = useMemo(() => ({
    animated: AnimatedEdge,
  }), []);

  // 处理运行
  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setLogs(prev => [...prev, '开始执行工作流...']);
    
    // 执行逻辑
    // ...
    
    setIsRunning(false);
    setLogs(prev => [...prev, '工作流执行完成']);
  }, []);

  return (
    <div className={styles.editorContainer}>
      <ReactFlowProvider>
        {/* 节点库 */}
        <AnimatePresence>
          {isNodeLibraryVisible && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={panelAnimation}
            >
              <EnhancedNodeLibraryV2
                isVisible={isNodeLibraryVisible}
                onNodeDragStart={(e, node) => {
                  console.log('拖拽节点:', node.label);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 画布 */}
        <div className={styles.workflowCanvas}>
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
          />
        </div>

        {/* 控制面板 */}
        <EnhancedControlPanel
          isConnected={true}
          wsConnected={true}
          isRunning={isRunning}
          hasUnsavedChanges={false}
          logs={logs}
          results={results}
          onRun={handleRun}
          onStop={() => setIsRunning(false)}
          onSave={() => console.log('保存')}
          onLoad={() => console.log('加载')}
          onClear={() => {
            setNodes([]);
            setEdges([]);
          }}
          onAIGenerate={() => console.log('AI生成')}
        />
      </ReactFlowProvider>
    </div>
  );
};

export default TelloWorkflowPanel;
```

## 10. 性能优化建议

### 使用 React.memo

```typescript
import React, { memo } from 'react';

const AnimatedWorkflowNode = memo(({ data, selected }) => {
  // 组件逻辑
}, (prevProps, nextProps) => {
  // 自定义比较逻辑
  return (
    prevProps.data.status === nextProps.data.status &&
    prevProps.selected === nextProps.selected
  );
});
```

### 使用 useMemo 和 useCallback

```typescript
// 缓存节点类型
const nodeTypes = useMemo(() => ({
  animated: AnimatedWorkflowNode,
}), []);

// 缓存回调函数
const handleNodeClick = useCallback((event, node) => {
  console.log('点击节点:', node.id);
}, []);
```

### 虚拟化长列表

```typescript
import { ScrollShadow } from "@heroui/scroll-shadow";

<ScrollShadow className={styles.nodeList}>
  {/* 大量节点时自动优化滚动性能 */}
  {nodes.map(node => (
    <NodeItem key={node.id} node={node} />
  ))}
</ScrollShadow>
```

## 11. 调试技巧

### 启用动画调试

```typescript
// 在开发环境中减慢动画速度
import { animations } from '@/lib/workflow/animations';

const debugAnimations = process.env.NODE_ENV === 'development';

<motion.div
  animate={{ x: 100 }}
  transition={{
    duration: debugAnimations 
      ? animations.duration.slow * 3 
      : animations.duration.normal,
  }}
/>
```

### 日志节点状态变化

```typescript
useEffect(() => {
  console.log('节点状态更新:', nodes.map(n => ({
    id: n.id,
    status: n.data.status,
  })));
}, [nodes]);
```

### 检查动画性能

```typescript
// 使用 Chrome DevTools Performance 面板
// 1. 打开 DevTools
// 2. 切换到 Performance 标签
// 3. 点击 Record
// 4. 执行动画操作
// 5. 停止录制并分析
```

## 12. 常见问题解决

### Q: 动画不流畅？

```typescript
// 确保使用 GPU 加速的属性
<motion.div
  style={{
    transform: 'translateX(0)',  // ✅ 好
    // left: 0,                   // ❌ 差
  }}
/>
```

### Q: 节点拖拽不工作？

```typescript
// 确保正确设置 draggable 和 onDragStart
<div
  draggable
  onDragStart={(e) => handleDragStart(e, node)}
>
  {node.label}
</div>
```

### Q: 样式不生效？

```typescript
// 确保导入了 CSS 模块
import styles from '@/styles/WorkflowDesignSystem.module.css';

// 使用正确的类名
<div className={styles.nodeLibrary}>
  {/* 内容 */}
</div>
```

### Q: Framer Motion 报错？

```bash
# 确保安装了正确的版本
npm install framer-motion@latest

# 检查 package.json
"framer-motion": "^10.0.0"
```

## 13. 测试建议

### 单元测试

```typescript
import { render, screen } from '@testing-library/react';
import AnimatedWorkflowNode from '@/components/workflow/AnimatedWorkflowNode';

test('renders node with correct label', () => {
  const data = {
    label: '测试节点',
    status: 'idle',
    nodeType: 'test',
  };
  
  render(<AnimatedWorkflowNode data={data} />);
  expect(screen.getByText('测试节点')).toBeInTheDocument();
});
```

### 集成测试

```typescript
import { render, fireEvent } from '@testing-library/react';
import EnhancedControlPanel from '@/components/workflow/EnhancedControlPanel';

test('calls onRun when run button is clicked', () => {
  const handleRun = jest.fn();
  
  const { getByText } = render(
    <EnhancedControlPanel
      isConnected={true}
      wsConnected={true}
      isRunning={false}
      logs={[]}
      results={[]}
      onRun={handleRun}
      onStop={() => {}}
      onSave={() => {}}
      onLoad={() => {}}
      onClear={() => {}}
      onAIGenerate={() => {}}
    />
  );
  
  fireEvent.click(getByText('运行工作流'));
  expect(handleRun).toHaveBeenCalled();
});
```

## 14. 部署检查清单

- [ ] 所有依赖已安装
- [ ] 样式文件已导入
- [ ] 动画性能已优化
- [ ] 响应式设计已测试
- [ ] 浏览器兼容性已验证
- [ ] 无控制台错误或警告
- [ ] 生产构建成功
- [ ] 性能指标符合要求

## 15. 相关资源

- [完整文档](./WORKFLOW_UI_UX_ENHANCEMENT_COMPLETE.md)
- [快速开始](./WORKFLOW_UI_UX_QUICK_START.md)
- [视觉指南](./WORKFLOW_UI_VISUAL_GUIDE.md)
- [设计系统](./lib/workflow/designSystem.ts)
- [动画系统](./lib/workflow/animations.ts)

---

**按照本指南，你可以轻松地将新的 UI/UX 增强功能集成到你的工作流系统中！** 🚀
