/**
 * Performance Optimization Tests
 * Tests for virtualization, lazy loading, and execution optimization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  WorkflowVirtualizer, 
  getWorkflowVirtualizer,
  DEFAULT_VIRTUALIZATION_CONFIG 
} from '@/lib/workflow/virtualization';
import { 
  LazyNodeLoader, 
  getLazyNodeLoader,
  DEFAULT_LAZY_NODE_CONFIG 
} from '@/lib/workflow/lazyNodeLoader';
import { 
  ExecutionOptimizer, 
  getExecutionOptimizer,
  DEFAULT_OPTIMIZER_CONFIG 
} from '@/lib/workflow/executionOptimizer';
import { Node, Edge, Viewport } from 'reactflow';

// Mock data generators
const createMockNodes = (count: number): Node[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `node-${i}`,
    type: 'statusNode',
    position: { x: (i % 10) * 200, y: Math.floor(i / 10) * 100 },
    data: {
      label: `Node ${i}`,
      nodeType: i % 5 === 0 ? 'takeoff' : 'move_forward',
      parameters: { distance: 50 }
    },
    width: 180,
    height: 60
  }));
};

const createMockEdges = (nodeCount: number): Edge[] => {
  const edges: Edge[] = [];
  for (let i = 0; i < nodeCount - 1; i++) {
    edges.push({
      id: `edge-${i}`,
      source: `node-${i}`,
      target: `node-${i + 1}`,
      type: 'default'
    });
  }
  return edges;
};

describe('WorkflowVirtualizer', () => {
  let virtualizer: WorkflowVirtualizer;

  beforeEach(() => {
    virtualizer = new WorkflowVirtualizer();
  });

  describe('shouldVirtualize', () => {
    it('should not virtualize when node count is below threshold', () => {
      expect(virtualizer.shouldVirtualize(30)).toBe(false);
      expect(virtualizer.shouldVirtualize(50)).toBe(false);
    });

    it('should virtualize when node count exceeds threshold', () => {
      expect(virtualizer.shouldVirtualize(51)).toBe(true);
      expect(virtualizer.shouldVirtualize(100)).toBe(true);
    });

    it('should respect custom threshold', () => {
      const customVirtualizer = new WorkflowVirtualizer({ threshold: 20 });
      expect(customVirtualizer.shouldVirtualize(19)).toBe(false);
      expect(customVirtualizer.shouldVirtualize(21)).toBe(true);
    });
  });

  describe('getVisibleNodes', () => {
    it('should return all nodes when virtualization is disabled', () => {
      const nodes = createMockNodes(30);
      const viewport: Viewport = { x: 0, y: 0, zoom: 1 };
      
      const visibleNodes = virtualizer.getVisibleNodes(nodes, viewport, 1200, 800);
      expect(visibleNodes).toHaveLength(30);
    });

    it('should filter nodes outside viewport when virtualized', () => {
      const nodes = createMockNodes(100);
      const viewport: Viewport = { x: 0, y: 0, zoom: 1 };
      
      const visibleNodes = virtualizer.getVisibleNodes(nodes, viewport, 1200, 800);
      expect(visibleNodes.length).toBeLessThan(100);
      expect(visibleNodes.length).toBeGreaterThan(0);
    });

    it('should include buffer zone around viewport', () => {
      const nodes = createMockNodes(100);
      const viewport: Viewport = { x: -500, y: -500, zoom: 1 };
      
      const visibleNodes = virtualizer.getVisibleNodes(nodes, viewport, 1200, 800);
      
      // Should include nodes in buffer zone
      expect(visibleNodes.length).toBeGreaterThan(0);
    });

    it('should handle zoom levels correctly', () => {
      const nodes = createMockNodes(100);
      const viewport1: Viewport = { x: 0, y: 0, zoom: 1 };
      const viewport2: Viewport = { x: 0, y: 0, zoom: 0.5 };
      
      const visible1 = virtualizer.getVisibleNodes(nodes, viewport1, 1200, 800);
      const visible2 = virtualizer.getVisibleNodes(nodes, viewport2, 1200, 800);
      
      // Zoomed out should show more nodes
      expect(visible2.length).toBeGreaterThanOrEqual(visible1.length);
    });
  });

  describe('getVisibleEdges', () => {
    it('should return edges connected to visible nodes', () => {
      const nodes = createMockNodes(100);
      const edges = createMockEdges(100);
      const viewport: Viewport = { x: 0, y: 0, zoom: 1 };
      
      const visibleNodes = virtualizer.getVisibleNodes(nodes, viewport, 1200, 800);
      const visibleEdges = virtualizer.getVisibleEdges(edges, visibleNodes);
      
      expect(visibleEdges.length).toBeLessThanOrEqual(edges.length);
    });
  });

  describe('getVirtualizationStats', () => {
    it('should calculate correct statistics', () => {
      const stats = virtualizer.getVirtualizationStats(100, 40, 99, 39);
      
      expect(stats.isVirtualized).toBe(true);
      expect(stats.nodeReduction).toBe(60);
      expect(stats.edgeReduction).toBeCloseTo(60.6, 1);
      expect(stats.performanceGain).toContain('60');
    });

    it('should handle zero nodes correctly', () => {
      const stats = virtualizer.getVirtualizationStats(0, 0, 0, 0);
      
      expect(stats.nodeReduction).toBe(0);
      expect(stats.edgeReduction).toBe(0);
    });
  });
});

describe('LazyNodeLoader', () => {
  let loader: LazyNodeLoader;

  beforeEach(() => {
    loader = new LazyNodeLoader();
  });

  afterEach(() => {
    loader.clearCache();
  });

  describe('getCacheStats', () => {
    it('should return initial cache stats', () => {
      const stats = loader.getCacheStats();
      
      expect(stats.cachedNodes).toBe(0);
      expect(stats.loadingNodes).toBe(0);
      expect(stats.cacheEnabled).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('should clear the component cache', () => {
      loader.clearCache();
      const stats = loader.getCacheStats();
      
      expect(stats.cachedNodes).toBe(0);
    });
  });

  describe('configuration', () => {
    it('should use default configuration', () => {
      const loader = new LazyNodeLoader();
      const config = DEFAULT_LAZY_NODE_CONFIG;
      
      expect(config.preloadCommonNodes).toBe(true);
      expect(config.cacheLoadedNodes).toBe(true);
      expect(config.loadTimeout).toBe(5000);
    });

    it('should accept custom configuration', () => {
      const customLoader = new LazyNodeLoader({
        preloadCommonNodes: false,
        cacheLoadedNodes: false,
        loadTimeout: 10000
      });
      
      const stats = customLoader.getCacheStats();
      expect(stats.cacheEnabled).toBe(false);
    });
  });
});

describe('ExecutionOptimizer', () => {
  let optimizer: ExecutionOptimizer;

  beforeEach(() => {
    optimizer = new ExecutionOptimizer();
  });

  afterEach(() => {
    optimizer.reset();
  });

  describe('result caching', () => {
    it('should cache and retrieve results', () => {
      const node: any = {
        id: 'test-node',
        type: 'statusNode',
        data: {
          nodeType: 'takeoff',
          parameters: { height: 100 }
        }
      };

      const result = { status: 'success', altitude: 100 };
      
      // Cache result
      optimizer.cacheResult(node, result);
      
      // Retrieve cached result
      const cached = optimizer.getCachedResult(node);
      expect(cached).toEqual(result);
    });

    it('should return null for non-cached nodes', () => {
      const node: any = {
        id: 'test-node',
        type: 'statusNode',
        data: {
          nodeType: 'takeoff',
          parameters: { height: 100 }
        }
      };

      const cached = optimizer.getCachedResult(node);
      expect(cached).toBeNull();
    });

    it('should differentiate nodes by parameters', () => {
      const node1: any = {
        id: 'node-1',
        type: 'statusNode',
        data: {
          nodeType: 'move_forward',
          parameters: { distance: 50 }
        }
      };

      const node2: any = {
        id: 'node-2',
        type: 'statusNode',
        data: {
          nodeType: 'move_forward',
          parameters: { distance: 100 }
        }
      };

      optimizer.cacheResult(node1, { result: 'A' });
      optimizer.cacheResult(node2, { result: 'B' });

      expect(optimizer.getCachedResult(node1)).toEqual({ result: 'A' });
      expect(optimizer.getCachedResult(node2)).toEqual({ result: 'B' });
    });
  });

  describe('execution statistics', () => {
    it('should record execution statistics', () => {
      optimizer.recordExecution('takeoff', 500);
      optimizer.recordExecution('takeoff', 600);
      optimizer.recordExecution('move_forward', 300);

      const stats = optimizer.getOptimizationStats();
      expect(stats.totalExecutions).toBe(3);
      expect(stats.avgExecutionTime).toBeGreaterThan(0);
    });

    it('should estimate duration based on history', () => {
      optimizer.recordExecution('takeoff', 500);
      optimizer.recordExecution('takeoff', 600);

      const estimated = optimizer.getEstimatedDuration('takeoff');
      expect(estimated).toBe(550); // Average of 500 and 600
    });

    it('should use default estimates for unknown nodes', () => {
      const estimated = optimizer.getEstimatedDuration('unknown_node');
      expect(estimated).toBe(1000); // Default
    });
  });

  describe('execution batching', () => {
    it('should create execution batches', () => {
      const nodes = createMockNodes(10);
      const edges = createMockEdges(10);

      const batches = optimizer.createExecutionBatches(nodes, edges);
      
      expect(batches.length).toBeGreaterThan(0);
      expect(batches[0].nodes.length).toBeGreaterThan(0);
      expect(batches[0].priority).toBeGreaterThanOrEqual(0);
    });

    it('should respect max batch size', () => {
      const customOptimizer = new ExecutionOptimizer({ maxBatchSize: 5 });
      const nodes = createMockNodes(20);
      const edges: Edge[] = []; // No dependencies

      const batches = customOptimizer.createExecutionBatches(nodes, edges);
      
      batches.forEach(batch => {
        expect(batch.nodes.length).toBeLessThanOrEqual(5);
      });
    });

    it('should handle circular dependencies', () => {
      const nodes = createMockNodes(3);
      const edges: Edge[] = [
        { id: 'e1', source: 'node-0', target: 'node-1' },
        { id: 'e2', source: 'node-1', target: 'node-2' },
        { id: 'e3', source: 'node-2', target: 'node-0' } // Circular
      ];

      const batches = optimizer.createExecutionBatches(nodes, edges);
      expect(batches).toBeDefined();
    });
  });

  describe('execution order optimization', () => {
    it('should optimize execution order by duration', () => {
      const nodes: any[] = [
        {
          id: 'slow',
          type: 'statusNode',
          data: { nodeType: 'challenge_8_flight', parameters: {} }
        },
        {
          id: 'fast',
          type: 'statusNode',
          data: { nodeType: 'wait', parameters: {} }
        },
        {
          id: 'medium',
          type: 'statusNode',
          data: { nodeType: 'takeoff', parameters: {} }
        }
      ];

      const optimized = optimizer.optimizeExecutionOrder(nodes);
      
      // Fast nodes should come first
      expect(optimized[0].id).toBe('fast');
      expect(optimized[optimized.length - 1].id).toBe('slow');
    });
  });

  describe('optimization statistics', () => {
    it('should provide optimization statistics', () => {
      const stats = optimizer.getOptimizationStats();
      
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('cacheHitRate');
      expect(stats).toHaveProperty('avgExecutionTime');
      expect(stats).toHaveProperty('totalExecutions');
      expect(stats).toHaveProperty('optimizationsEnabled');
      
      expect(Array.isArray(stats.optimizationsEnabled)).toBe(true);
    });

    it('should list enabled optimizations', () => {
      const stats = optimizer.getOptimizationStats();
      
      expect(stats.optimizationsEnabled).toContain('结果缓存');
      expect(stats.optimizationsEnabled).toContain('批量执行');
      expect(stats.optimizationsEnabled).toContain('智能调度');
    });
  });

  describe('cache expiration', () => {
    it('should clear expired cache entries', () => {
      const shortExpirationOptimizer = new ExecutionOptimizer({
        cacheExpiration: 100 // 100ms
      });

      const node: any = {
        id: 'test',
        type: 'statusNode',
        data: { nodeType: 'takeoff', parameters: {} }
      };

      shortExpirationOptimizer.cacheResult(node, { result: 'test' });
      
      // Wait for expiration
      return new Promise(resolve => {
        setTimeout(() => {
          const cleared = shortExpirationOptimizer.clearExpiredCache();
          expect(cleared).toBe(1);
          resolve(undefined);
        }, 150);
      });
    });
  });

  describe('reset', () => {
    it('should reset all caches and statistics', () => {
      const node: any = {
        id: 'test',
        type: 'statusNode',
        data: { nodeType: 'takeoff', parameters: {} }
      };

      optimizer.cacheResult(node, { result: 'test' });
      optimizer.recordExecution('takeoff', 500);

      optimizer.reset();

      const stats = optimizer.getOptimizationStats();
      expect(stats.cacheSize).toBe(0);
      expect(stats.totalExecutions).toBe(0);
    });
  });
});

describe('Integration Tests', () => {
  it('should work together for large workflows', () => {
    const virtualizer = getWorkflowVirtualizer();
    const loader = getLazyNodeLoader();
    const optimizer = getExecutionOptimizer();

    const nodes = createMockNodes(200);
    const edges = createMockEdges(200);
    const viewport: Viewport = { x: 0, y: 0, zoom: 1 };

    // Virtualization
    const visibleNodes = virtualizer.getVisibleNodes(nodes, viewport, 1200, 800);
    expect(visibleNodes.length).toBeLessThan(nodes.length);

    // Lazy loading stats
    const lazyStats = loader.getCacheStats();
    expect(lazyStats).toBeDefined();

    // Execution optimization
    const batches = optimizer.createExecutionBatches(nodes, edges);
    expect(batches.length).toBeGreaterThan(0);

    // Overall performance
    const vStats = virtualizer.getVirtualizationStats(
      nodes.length,
      visibleNodes.length,
      edges.length,
      edges.length
    );
    expect(vStats.nodeReduction).toBeGreaterThan(0);
  });

  it('should handle configuration updates', () => {
    const virtualizer = getWorkflowVirtualizer({ threshold: 30 });
    const loader = getLazyNodeLoader({ cacheLoadedNodes: false });
    const optimizer = getExecutionOptimizer({ enableResultCaching: false });

    expect(virtualizer.shouldVirtualize(40)).toBe(true);
    expect(loader.getCacheStats().cacheEnabled).toBe(false);
    expect(optimizer.getOptimizationStats().optimizationsEnabled).not.toContain('结果缓存');
  });
});
