# 性能优化集成示例

## 最简单的集成方式

使用 `PerformanceManager` 统一管理所有性能优化功能。

### 步骤1: 导入 PerformanceManager

```typescript
import { usePerformanceManager } from '@/lib/workflow/performanceManager';
import PerformanceMonitor from '@/components/workflow/PerformanceMonitor';
```

### 步骤2: 在组件中使用

```typescript
const TelloWorkflowPanel: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });

  // 使用性能管理器（一行代码搞定所有优化！）
  const {
    getOptimizedRenderData,
    executeOptimized,
    getStats,
    clearCaches
  } = usePerformanceManager({
    autoOptimize: true // 自动根据工作流大小调整配置
  });

  // 获取优化后的渲染数据
  const { 
    nodes: visibleNodes, 
    edges: visibleEdges, 
    stats: renderStats 
  } = getOptimizedRenderData(
    nodes,
    edges,
    viewport,
    1200, // canvas width
    800   // canvas height
  );

  // 获取性能统计
  const performanceStats = getStats(
    nodes.length,
    visibleNodes.length,
    edges.length,
    visibleEdges.length
  );

  // 执行工作流（带优化）
  const handleRunWorkflow = async () => {
    const results = await executeOptimized(
      nodes,
      edges,
      async (node) => {
        // 你的节点执行逻辑
        return await executeNode(node);
      }
    );
    
    console.log('执行结果:', results);
  };

  return (
    <div className="workflow-container">
      {/* 性能监控 */}
      <PerformanceMonitor
        virtualizationStats={performanceStats.virtualization}
        lazyLoadStats={performanceStats.lazyLoad}
        optimizationStats={performanceStats.optimization}
      />

      {/* 工作流画布 */}
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onViewportChange={setViewport}
      />

      {/* 控制按钮 */}
      <button onClick={handleRunWorkflow}>运行</button>
      <button onClick={clearCaches}>清理缓存</button>
    </div>
  );
};
```

## 完整示例

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  Background,
  Controls,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { usePerformanceManager } from '@/lib/workflow/performanceManager';
import PerformanceMonitor from '@/components/workflow/PerformanceMonitor';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Play, Square, Trash2, RefreshCw } from 'lucide-react';

const OptimizedWorkflowPanel: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // 性能管理器 - 一行代码启用所有优化
  const {
    manager,
    getOptimizedRenderData,
    executeOptimized,
    getStats,
    clearCaches,
    reset
  } = usePerformanceManager({
    autoOptimize: true, // 自动优化
    virtualization: {
      enabled: true,
      threshold: 50,
      bufferZone: 200
    },
    lazyLoad: {
      preloadCommonNodes: true,
      cacheLoadedNodes: true
    },
    optimizer: {
      enableResultCaching: true,
      enableBatchExecution: true,
      enableSmartScheduling: true
    }
  });

  // 初始化
  useEffect(() => {
    manager.initialize().then(() => {
      addLog('性能优化系统已初始化');
    });
  }, []);

  // 获取优化后的渲染数据
  const { 
    nodes: visibleNodes, 
    edges: visibleEdges, 
    stats: renderStats 
  } = getOptimizedRenderData(nodes, edges, viewport, 1200, 800);

  // 获取性能统计
  const performanceStats = getStats(
    nodes.length,
    visibleNodes.length,
    edges.length,
    visibleEdges.length
  );

  // 添加日志
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // 执行节点逻辑
  const executeNode = async (node: any): Promise<any> => {
    const nodeType = node.data?.nodeType || node.type;
    addLog(`执行节点: ${node.data.label} (${nodeType})`);
    
    // 模拟节点执行
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      status: 'success',
      nodeId: node.id,
      timestamp: Date.now()
    };
  };

  // 运行工作流
  const handleRun = async () => {
    if (nodes.length === 0) {
      addLog('错误: 工作流为空');
      return;
    }

    setIsRunning(true);
    addLog('开始执行工作流（已优化）');

    try {
      const results = await executeOptimized(nodes, edges, executeNode);
      
      addLog(`工作流执行完成 - 共 ${results.size} 个节点`);
      addLog(`性能评分: ${performanceStats.overall.grade} (${performanceStats.overall.score.toFixed(0)}分)`);
      
      // 显示优化效果
      if (renderStats.isVirtualized) {
        addLog(`虚拟化: 节点渲染减少 ${renderStats.nodeReduction.toFixed(1)}%`);
      }
      
      const optStats = performanceStats.optimization;
      if (optStats.cacheSize > 0) {
        addLog(`缓存: ${optStats.cacheSize} 个结果已缓存`);
      }
      
    } catch (error) {
      addLog(`错误: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 停止执行
  const handleStop = () => {
    setIsRunning(false);
    addLog('工作流已停止');
  };

  // 清空工作流
  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setLogs([]);
    addLog('工作流已清空');
  };

  // 清理缓存
  const handleClearCache = () => {
    clearCaches();
    addLog('缓存已清理');
  };

  // 重置优化器
  const handleReset = () => {
    reset();
    addLog('优化器已重置');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* 左侧 - 性能监控 */}
      <div className="w-80 p-4 border-r border-divider overflow-y-auto">
        <PerformanceMonitor
          virtualizationStats={performanceStats.virtualization}
          lazyLoadStats={performanceStats.lazyLoad}
          optimizationStats={performanceStats.optimization}
        />

        <Divider className="my-4" />

        {/* 性能评分 */}
        <Card className="mb-4">
          <CardHeader>
            <h3 className="text-lg font-semibold">性能评分</h3>
          </CardHeader>
          <CardBody>
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {performanceStats.overall.grade}
              </div>
              <div className="text-2xl text-default-600 mb-4">
                {performanceStats.overall.score.toFixed(0)} 分
              </div>
              <div className="text-sm text-default-500">
                {performanceStats.overall.recommendations.map((rec, i) => (
                  <div key={i} className="mb-1">• {rec}</div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 控制按钮 */}
        <div className="space-y-2">
          <Button
            color="primary"
            className="w-full"
            startContent={<Play size={16} />}
            onPress={handleRun}
            isDisabled={isRunning || nodes.length === 0}
          >
            运行工作流
          </Button>
          
          <Button
            color="danger"
            variant="flat"
            className="w-full"
            startContent={<Square size={16} />}
            onPress={handleStop}
            isDisabled={!isRunning}
          >
            停止
          </Button>

          <Button
            color="warning"
            variant="flat"
            className="w-full"
            startContent={<Trash2 size={16} />}
            onPress={handleClear}
          >
            清空工作流
          </Button>

          <Button
            color="default"
            variant="flat"
            className="w-full"
            startContent={<RefreshCw size={16} />}
            onPress={handleClearCache}
          >
            清理缓存
          </Button>
        </div>

        <Divider className="my-4" />

        {/* 执行日志 */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold">执行日志</h3>
          </CardHeader>
          <CardBody>
            <div className="h-40 overflow-y-auto text-xs font-mono">
              {logs.map((log, i) => (
                <div key={i} className="mb-1 text-default-600">
                  {log}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 中间 - 工作流画布 */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onViewportChange={setViewport}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>

        {/* 统计信息覆盖层 */}
        <div className="absolute top-4 right-4 bg-content1 border border-divider rounded-lg p-3 text-xs">
          <div className="font-semibold mb-2">工作流统计</div>
          <div className="space-y-1 text-default-600">
            <div>总节点: {nodes.length}</div>
            <div>可见节点: {visibleNodes.length}</div>
            <div>总连接: {edges.length}</div>
            <div>可见连接: {visibleEdges.length}</div>
            {renderStats.isVirtualized && (
              <div className="text-success">
                优化: {renderStats.nodeReduction.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedWorkflowPanel;
```

## 配置选项

### 自动优化（推荐）

```typescript
usePerformanceManager({
  autoOptimize: true // 根据工作流大小自动调整
});
```

### 自定义配置

```typescript
usePerformanceManager({
  autoOptimize: false,
  virtualization: {
    enabled: true,
    threshold: 30,      // 30个节点后启用
    bufferZone: 300,    // 更大的缓冲区
    updateDebounce: 150 // 更长的防抖时间
  },
  lazyLoad: {
    preloadCommonNodes: true,
    cacheLoadedNodes: true,
    loadTimeout: 10000  // 10秒超时
  },
  optimizer: {
    enableResultCaching: true,
    enableBatchExecution: true,
    enableSmartScheduling: true,
    cacheExpiration: 600000, // 10分钟缓存
    maxBatchSize: 15,        // 更大的批量
    executionTimeout: 60000  // 60秒超时
  }
});
```

## 性能监控

```typescript
// 获取详细的性能统计
const stats = getStats(
  nodes.length,
  visibleNodes.length,
  edges.length,
  visibleEdges.length
);

console.log('虚拟化:', stats.virtualization);
console.log('懒加载:', stats.lazyLoad);
console.log('执行优化:', stats.optimization);
console.log('整体评分:', stats.overall.score);
console.log('性能等级:', stats.overall.grade);
console.log('建议:', stats.overall.recommendations);
```

## 高级用法

### 访问底层管理器

```typescript
const { manager } = usePerformanceManager();

// 获取各个管理器
const { virtualizer, loader, optimizer } = manager.getManagers();

// 直接使用底层API
const visibleNodes = virtualizer.getVisibleNodes(...);
await loader.preloadNodes(['purechat_chat', 'yolo_detection']);
const batches = optimizer.createExecutionBatches(nodes, edges);
```

### 动态更新配置

```typescript
const { manager } = usePerformanceManager();

// 根据用户偏好更新配置
manager.updateConfig({
  virtualization: { enabled: userPreferences.enableVirtualization },
  optimizer: { enableResultCaching: userPreferences.enableCache }
});
```

### 性能分析

```typescript
const { manager } = usePerformanceManager();

// 获取当前配置
const config = manager.getConfig();
console.log('当前配置:', config);

// 获取性能统计
const stats = manager.getPerformanceStats(
  nodes.length,
  visibleNodes.length,
  edges.length,
  visibleEdges.length
);

// 分析性能瓶颈
if (stats.overall.grade === 'F') {
  console.warn('性能较差，建议:');
  stats.overall.recommendations.forEach(rec => {
    console.log('- ' + rec);
  });
}
```

## 最佳实践

1. **使用自动优化**: 让系统根据工作流大小自动调整配置
2. **监控性能指标**: 使用 PerformanceMonitor 组件实时监控
3. **定期清理缓存**: 避免内存占用过高
4. **预加载常用节点**: 提升用户体验
5. **关注性能评分**: 保持 A 或 B 级性能

## 故障排除

### 问题: 性能没有提升

**检查**:
```typescript
const stats = getStats(...);
console.log('虚拟化启用:', stats.virtualization.isVirtualized);
console.log('已启用优化:', stats.optimization.optimizationsEnabled);
```

**解决**: 确保工作流节点数超过阈值，且优化功能已启用

### 问题: 缓存占用内存过多

**解决**:
```typescript
// 减少缓存过期时间
manager.updateConfig({
  optimizer: { cacheExpiration: 180000 } // 3分钟
});

// 定期清理
setInterval(() => clearCaches(), 60000);
```

### 问题: 节点闪烁

**解决**:
```typescript
// 增大缓冲区和防抖时间
manager.updateConfig({
  virtualization: {
    bufferZone: 400,
    updateDebounce: 200
  }
});
```

## 总结

使用 `PerformanceManager` 可以用最少的代码获得最大的性能提升：

✅ 一行代码启用所有优化
✅ 自动根据工作流大小调整配置
✅ 统一的性能监控和统计
✅ 简单的API，易于集成
✅ 灵活的配置选项

开始使用性能优化，让你的工作流飞起来！🚀
