// Performance Manager - Unified interface for all performance optimizations
// Simplifies integration and configuration of virtualization, lazy loading, and execution optimization

import { Node, Edge, Viewport } from 'reactflow';
import { 
  getWorkflowVirtualizer, 
  WorkflowVirtualizer,
  VirtualizationConfig 
} from './virtualization';
import { 
  getLazyNodeLoader, 
  LazyNodeLoader,
  LazyNodeConfig 
} from './lazyNodeLoader';
import { 
  getExecutionOptimizer, 
  ExecutionOptimizer,
  ExecutionOptimizerConfig 
} from './executionOptimizer';

export interface PerformanceManagerConfig {
  virtualization?: Partial<VirtualizationConfig>;
  lazyLoad?: Partial<LazyNodeConfig>;
  optimizer?: Partial<ExecutionOptimizerConfig>;
  autoOptimize?: boolean; // Automatically adjust settings based on workflow size
}

export interface PerformanceStats {
  virtualization: ReturnType<WorkflowVirtualizer['getVirtualizationStats']>;
  lazyLoad: ReturnType<LazyNodeLoader['getCacheStats']>;
  optimization: ReturnType<ExecutionOptimizer['getOptimizationStats']>;
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    recommendations: string[];
  };
}

/**
 * Performance Manager - Unified performance optimization manager
 */
export class PerformanceManager {
  private virtualizer: WorkflowVirtualizer;
  private loader: LazyNodeLoader;
  private optimizer: ExecutionOptimizer;
  private config: PerformanceManagerConfig;

  constructor(config: PerformanceManagerConfig = {}) {
    this.config = {
      autoOptimize: true,
      ...config
    };

    this.virtualizer = getWorkflowVirtualizer(config.virtualization);
    this.loader = getLazyNodeLoader(config.lazyLoad);
    this.optimizer = getExecutionOptimizer(config.optimizer);
  }

  /**
   * Initialize performance optimizations
   */
  async initialize(): Promise<void> {
    // Preload common nodes
    await this.loader.preloadCommonNodes();
    console.log('[PerformanceManager] Initialized');
  }

  /**
   * Get optimized nodes and edges for rendering
   */
  getOptimizedRenderData(
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport,
    canvasWidth: number,
    canvasHeight: number
  ): {
    nodes: Node[];
    edges: Edge[];
    stats: ReturnType<WorkflowVirtualizer['getVirtualizationStats']>;
  } {
    // Auto-optimize configuration based on workflow size
    if (this.config.autoOptimize) {
      this.autoAdjustConfig(nodes.length);
    }

    const visibleNodes = this.virtualizer.getVisibleNodes(
      nodes,
      viewport,
      canvasWidth,
      canvasHeight
    );

    const visibleEdges = this.virtualizer.getVisibleEdges(edges, visibleNodes);

    const stats = this.virtualizer.getVirtualizationStats(
      nodes.length,
      visibleNodes.length,
      edges.length,
      visibleEdges.length
    );

    return {
      nodes: visibleNodes,
      edges: visibleEdges,
      stats
    };
  }

  /**
   * Execute workflow with optimizations
   */
  async executeOptimized(
    nodes: Node[],
    edges: Edge[],
    executeNode: (node: Node) => Promise<any>
  ): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    // Create execution batches
    const batches = this.optimizer.createExecutionBatches(nodes, edges);
    console.log(`[PerformanceManager] Executing ${batches.length} batches`);

    for (const batch of batches) {
      // Optimize execution order within batch
      const optimizedNodes = this.optimizer.optimizeExecutionOrder(batch.nodes);

      // Execute batch in parallel
      const batchResults = await Promise.all(
        optimizedNodes.map(async (node) => {
          // Check if should skip
          if (this.optimizer.shouldSkipExecution(node, {})) {
            console.log(`[PerformanceManager] Skipping node: ${node.id}`);
            return { nodeId: node.id, result: null, skipped: true };
          }

          // Check cache
          const cached = this.optimizer.getCachedResult(node);
          if (cached) {
            console.log(`[PerformanceManager] Cache hit: ${node.id}`);
            return { nodeId: node.id, result: cached, cached: true };
          }

          // Execute node
          const startTime = Date.now();
          try {
            const result = await executeNode(node);
            const duration = Date.now() - startTime;

            // Cache result
            this.optimizer.cacheResult(node, result);

            // Record statistics
            const nodeType = node.data?.nodeType || node.type;
            this.optimizer.recordExecution(nodeType, duration);

            return { nodeId: node.id, result, duration };
          } catch (error) {
            console.error(`[PerformanceManager] Node execution failed: ${node.id}`, error);
            throw error;
          }
        })
      );

      // Store results
      batchResults.forEach(({ nodeId, result }) => {
        if (result !== null) {
          results.set(nodeId, result);
        }
      });
    }

    return results;
  }

  /**
   * Get comprehensive performance statistics
   */
  getPerformanceStats(
    totalNodes: number,
    visibleNodes: number,
    totalEdges: number,
    visibleEdges: number
  ): PerformanceStats {
    const virtualizationStats = this.virtualizer.getVirtualizationStats(
      totalNodes,
      visibleNodes,
      totalEdges,
      visibleEdges
    );

    const lazyLoadStats = this.loader.getCacheStats();
    const optimizationStats = this.optimizer.getOptimizationStats();

    // Calculate overall performance score
    const overall = this.calculateOverallPerformance(
      virtualizationStats,
      lazyLoadStats,
      optimizationStats,
      totalNodes
    );

    return {
      virtualization: virtualizationStats,
      lazyLoad: lazyLoadStats,
      optimization: optimizationStats,
      overall
    };
  }

  /**
   * Calculate overall performance score and recommendations
   */
  private calculateOverallPerformance(
    virtualizationStats: any,
    lazyLoadStats: any,
    optimizationStats: any,
    totalNodes: number
  ): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    recommendations: string[];
  } {
    let score = 0;
    const recommendations: string[] = [];

    // Virtualization score (0-40 points)
    if (virtualizationStats.isVirtualized) {
      score += Math.min(virtualizationStats.nodeReduction * 0.4, 40);
    } else if (totalNodes > 50) {
      recommendations.push('启用虚拟化渲染以提升大型工作流性能');
    }

    // Lazy loading score (0-30 points)
    if (lazyLoadStats.cacheEnabled) {
      score += Math.min(lazyLoadStats.cachedNodes * 3, 30);
    } else {
      recommendations.push('启用懒加载以减少初始加载时间');
    }

    // Execution optimization score (0-30 points)
    const enabledOptimizations = optimizationStats.optimizationsEnabled.length;
    score += enabledOptimizations * 10;

    if (enabledOptimizations < 3) {
      recommendations.push('启用所有执行优化功能以获得最佳性能');
    }

    if (optimizationStats.cacheSize === 0 && optimizationStats.totalExecutions > 0) {
      recommendations.push('启用结果缓存以加速重复执行');
    }

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    if (recommendations.length === 0) {
      recommendations.push('性能优化配置良好，继续保持！');
    }

    return { score, grade, recommendations };
  }

  /**
   * Auto-adjust configuration based on workflow size
   */
  private autoAdjustConfig(nodeCount: number): void {
    if (nodeCount < 20) {
      // Small workflow - minimal optimization
      this.virtualizer.updateConfig({ enabled: false });
      this.optimizer.updateConfig({ enableBatchExecution: false });
    } else if (nodeCount < 100) {
      // Medium workflow - standard optimization
      this.virtualizer.updateConfig({ 
        enabled: true, 
        threshold: 50,
        bufferZone: 200 
      });
      this.optimizer.updateConfig({ 
        enableBatchExecution: true,
        maxBatchSize: 10 
      });
    } else {
      // Large workflow - aggressive optimization
      this.virtualizer.updateConfig({ 
        enabled: true, 
        threshold: 50,
        bufferZone: 300,
        updateDebounce: 150 
      });
      this.optimizer.updateConfig({ 
        enableBatchExecution: true,
        maxBatchSize: 15,
        cacheExpiration: 600000 // 10 minutes
      });
    }
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.loader.clearCache();
    this.optimizer.clearExpiredCache();
    console.log('[PerformanceManager] Caches cleared');
  }

  /**
   * Reset all optimizations
   */
  reset(): void {
    this.loader.clearCache();
    this.optimizer.reset();
    console.log('[PerformanceManager] Reset complete');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PerformanceManagerConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.virtualization) {
      this.virtualizer.updateConfig(config.virtualization);
    }

    if (config.lazyLoad) {
      this.loader.updateConfig(config.lazyLoad);
    }

    if (config.optimizer) {
      this.optimizer.updateConfig(config.optimizer);
    }

    console.log('[PerformanceManager] Configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): PerformanceManagerConfig {
    return {
      virtualization: this.virtualizer.getConfig(),
      lazyLoad: this.loader.getCacheStats() as any,
      optimizer: this.optimizer.getConfig(),
      autoOptimize: this.config.autoOptimize
    };
  }

  /**
   * Get individual managers for advanced usage
   */
  getManagers(): {
    virtualizer: WorkflowVirtualizer;
    loader: LazyNodeLoader;
    optimizer: ExecutionOptimizer;
  } {
    return {
      virtualizer: this.virtualizer,
      loader: this.loader,
      optimizer: this.optimizer
    };
  }
}

// Export singleton instance
let performanceManagerInstance: PerformanceManager | null = null;

export function getPerformanceManager(config?: PerformanceManagerConfig): PerformanceManager {
  if (!performanceManagerInstance) {
    performanceManagerInstance = new PerformanceManager(config);
  } else if (config) {
    performanceManagerInstance.updateConfig(config);
  }
  return performanceManagerInstance;
}

/**
 * React Hook for unified performance management
 */
export function usePerformanceManager(config?: PerformanceManagerConfig): {
  manager: PerformanceManager;
  getOptimizedRenderData: PerformanceManager['getOptimizedRenderData'];
  executeOptimized: PerformanceManager['executeOptimized'];
  getStats: (totalNodes: number, visibleNodes: number, totalEdges: number, visibleEdges: number) => PerformanceStats;
  clearCaches: () => void;
  reset: () => void;
} {
  const manager = getPerformanceManager(config);

  return {
    manager,
    getOptimizedRenderData: manager.getOptimizedRenderData.bind(manager),
    executeOptimized: manager.executeOptimized.bind(manager),
    getStats: manager.getPerformanceStats.bind(manager),
    clearCaches: () => manager.clearCaches(),
    reset: () => manager.reset()
  };
}
