# 性能优化快速开始指南

## 5分钟快速集成

### 步骤1: 导入性能优化模块

```typescript
// 在 TelloWorkflowPanel.tsx 或主工作流组件中
import { useWorkflowVirtualization } from '@/lib/workflow/virtualization';
import { useLazyNodeLoader } from '@/lib/workflow/lazyNodeLoader';
import { useExecutionOptimizer } from '@/lib/workflow/executionOptimizer';
import PerformanceMonitor from '@/components/workflow/PerformanceMonitor';
```

### 步骤2: 添加性能优化Hooks

```typescript
const TelloWorkflowPanel: React.FC<Props> = ({ ... }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  
  // 1. 虚拟化渲染
  const {
    visibleNodes,
    visibleEdges,
    stats: virtualizationStats
  } = useWorkflowVirtualization(
    nodes,
    edges,
    viewport,
    1200, // canvas width
    800   // canvas height
  );

  // 2. 懒加载
  const {
    preloadCommonNodes,
    stats: lazyLoadStats
  } = useLazyNodeLoader();

  // 3. 执行优化
  const {
    optimizer,
    stats: optimizationStats
  } = useExecutionOptimizer();

  // 预加载常用节点
  useEffect(() => {
    preloadCommonNodes();
  }, []);

  // ... 其他代码
};
```

### 步骤3: 使用优化后的节点和边

```typescript
// 在 ReactFlow 组件中使用虚拟化后的节点和边
<ReactFlow
  nodes={visibleNodes}  // 使用 visibleNodes 而不是 nodes
  edges={visibleEdges}  // 使用 visibleEdges 而不是 edges
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onViewportChange={setViewport}  // 重要：追踪视口变化
  // ... 其他props
/>
```

### 步骤4: 集成执行优化

```typescript
// 在工作流引擎执行时使用优化器
const executeNodeWithOptimization = async (node: WorkflowNode) => {
  // 检查缓存
  const cachedResult = optimizer.getCachedResult(node);
  if (cachedResult) {
    console.log('使用缓存结果');
    return cachedResult;
  }

  // 执行节点
  const startTime = Date.now();
  const result = await executeNodeLogic(node);
  const duration = Date.now() - startTime;

  // 缓存结果
  optimizer.cacheResult(node, result);
  
  // 记录统计
  const nodeType = node.data?.nodeType || node.type;
  optimizer.recordExecution(nodeType, duration);

  return result;
};
```

### 步骤5: 添加性能监控面板

```typescript
// 在UI中添加性能监控组件
<div className="performance-panel">
  <PerformanceMonitor
    virtualizationStats={virtualizationStats}
    lazyLoadStats={lazyLoadStats}
    optimizationStats={optimizationStats}
    onConfigChange={(config) => {
      console.log('性能配置更新:', config);
      // 可以根据需要更新配置
    }}
  />
</div>
```

## 完整集成示例

```typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { useNodesState, useEdgesState } from 'reactflow';
import { useWorkflowVirtualization } from '@/lib/workflow/virtualization';
import { useLazyNodeLoader } from '@/lib/workflow/lazyNodeLoader';
import { useExecutionOptimizer } from '@/lib/workflow/executionOptimizer';
import PerformanceMonitor from '@/components/workflow/PerformanceMonitor';
import { WorkflowEngine } from '@/lib/workflowEngine';

const OptimizedWorkflowPanel: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  // 性能优化Hooks
  const {
    visibleNodes,
    visibleEdges,
    stats: virtualizationStats
  } = useWorkflowVirtualization(
    nodes,
    edges,
    viewport,
    canvasSize.width,
    canvasSize.height
  );

  const {
    preloadCommonNodes,
    stats: lazyLoadStats
  } = useLazyNodeLoader({
    preloadCommonNodes: true,
    cacheLoadedNodes: true,
    loadTimeout: 5000
  });

  const {
    optimizer,
    stats: optimizationStats,
    clearCache
  } = useExecutionOptimizer({
    enableResultCaching: true,
    enableBatchExecution: true,
    enableSmartScheduling: true
  });

  // 预加载常用节点
  useEffect(() => {
    preloadCommonNodes();
  }, []);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth - 400,
        height: window.innerHeight - 100
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 定期清理过期缓存
  useEffect(() => {
    const interval = setInterval(() => {
      const cleared = optimizer.clearExpiredCache();
      if (cleared > 0) {
        console.log(`清理了 ${cleared} 个过期缓存`);
      }
    }, 60000); // 每分钟清理一次

    return () => clearInterval(interval);
  }, [optimizer]);

  // 执行工作流（带优化）
  const handleRunWorkflow = useCallback(async () => {
    console.log('开始执行工作流（已优化）');
    
    // 创建执行批次
    const batches = optimizer.createExecutionBatches(nodes, edges);
    console.log(`工作流分为 ${batches.length} 个批次`);

    for (const batch of batches) {
      console.log(`执行批次 ${batch.priority}: ${batch.nodes.length} 个节点`);
      
      // 优化执行顺序
      const optimizedNodes = optimizer.optimizeExecutionOrder(batch.nodes);
      
      // 并行执行批次中的节点
      await Promise.all(
        optimizedNodes.map(node => executeNodeWithOptimization(node))
      );
    }

    console.log('工作流执行完成');
  }, [nodes, edges, optimizer]);

  // 带优化的节点执行
  const executeNodeWithOptimization = async (node: any) => {
    // 检查是否应该跳过
    if (optimizer.shouldSkipExecution(node, {})) {
      console.log(`跳过节点: ${node.id}`);
      return;
    }

    // 检查缓存
    const cachedResult = optimizer.getCachedResult(node);
    if (cachedResult) {
      console.log(`使用缓存: ${node.id}`);
      return cachedResult;
    }

    // 执行节点
    const startTime = Date.now();
    try {
      const result = await executeNode(node);
      const duration = Date.now() - startTime;

      // 缓存结果
      optimizer.cacheResult(node, result);
      
      // 记录统计
      const nodeType = node.data?.nodeType || node.type;
      optimizer.recordExecution(nodeType, duration);

      return result;
    } catch (error) {
      console.error(`节点执行失败: ${node.id}`, error);
      throw error;
    }
  };

  // 实际的节点执行逻辑
  const executeNode = async (node: any) => {
    // 这里是实际的节点执行逻辑
    await new Promise(resolve => setTimeout(resolve, 100));
    return { status: 'success', nodeId: node.id };
  };

  return (
    <div className="workflow-container">
      {/* 性能监控面板 */}
      <div className="performance-sidebar">
        <PerformanceMonitor
          virtualizationStats={virtualizationStats}
          lazyLoadStats={lazyLoadStats}
          optimizationStats={optimizationStats}
          onConfigChange={(config) => {
            console.log('配置更新:', config);
          }}
        />
        
        {/* 控制按钮 */}
        <div className="controls">
          <button onClick={handleRunWorkflow}>
            运行工作流
          </button>
          <button onClick={clearCache}>
            清理缓存
          </button>
        </div>
      </div>

      {/* 工作流画布 */}
      <div className="workflow-canvas">
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onViewportChange={setViewport}
          fitView
        />
      </div>

      {/* 性能统计显示 */}
      <div className="stats-overlay">
        <div>节点总数: {nodes.length}</div>
        <div>可见节点: {visibleNodes.length}</div>
        <div>优化率: {virtualizationStats.nodeReduction.toFixed(1)}%</div>
        <div>缓存大小: {optimizationStats.cacheSize}</div>
      </div>
    </div>
  );
};

export default OptimizedWorkflowPanel;
```

## 验证性能优化

### 1. 检查虚拟化是否生效

```typescript
// 在浏览器控制台中
console.log('总节点数:', nodes.length);
console.log('可见节点数:', visibleNodes.length);
console.log('优化率:', virtualizationStats.nodeReduction);

// 应该看到：当节点数 > 50 时，可见节点数 < 总节点数
```

### 2. 检查懒加载是否工作

```typescript
// 查看网络请求
// 应该看到节点组件是按需加载的，而不是一次性加载所有组件

console.log('已缓存组件:', lazyLoadStats.cachedNodes);
console.log('正在加载:', lazyLoadStats.loadingNodes);
```

### 3. 检查执行优化是否生效

```typescript
// 执行工作流两次，第二次应该更快（使用缓存）
console.log('优化统计:', optimizationStats);
console.log('缓存大小:', optimizationStats.cacheSize);
console.log('平均执行时间:', optimizationStats.avgExecutionTime);
```

## 性能对比测试

```typescript
// 测试脚本
const testPerformance = async () => {
  // 创建大型工作流
  const largeWorkflow = createLargeWorkflow(200); // 200个节点

  // 测试1: 无优化
  console.time('无优化渲染');
  renderWorkflow(largeWorkflow, false);
  console.timeEnd('无优化渲染');

  // 测试2: 启用优化
  console.time('优化渲染');
  renderWorkflow(largeWorkflow, true);
  console.timeEnd('优化渲染');

  // 测试3: 执行性能
  console.time('无优化执行');
  await executeWorkflow(largeWorkflow, false);
  console.timeEnd('无优化执行');

  console.time('优化执行');
  await executeWorkflow(largeWorkflow, true);
  console.timeEnd('优化执行');
};
```

## 常见问题

### Q: 虚拟化后节点消失了？
A: 检查 `onViewportChange` 是否正确设置，确保视口状态被追踪。

### Q: 懒加载导致首次渲染慢？
A: 启用 `preloadCommonNodes` 预加载常用节点。

### Q: 缓存占用太多内存？
A: 减少 `cacheExpiration` 时间，或定期调用 `clearExpiredCache()`。

### Q: 批量执行顺序错误？
A: 检查工作流是否有循环依赖，使用工作流验证器。

## 下一步

- 阅读 [完整性能优化指南](./PERFORMANCE_OPTIMIZATION_GUIDE.md)
- 查看 [工作流系统文档](./WORKFLOW_NODE_SYSTEM_COMPLETE.md)
- 了解 [工作流验证系统](./WORKFLOW_VALIDATION_SYSTEM.md)

## 技术支持

如有问题，请查看：
- GitHub Issues
- 技术文档
- 示例代码
