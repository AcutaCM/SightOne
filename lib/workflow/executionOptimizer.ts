// Execution Engine Performance Optimizer
// Optimizes workflow execution through caching, batching, and smart scheduling

import { WorkflowNode, WorkflowEdge } from '../workflowEngine';

export interface ExecutionOptimizerConfig {
  enableResultCaching: boolean;
  enableBatchExecution: boolean;
  enableSmartScheduling: boolean;
  cacheExpiration: number; // ms
  maxBatchSize: number;
  executionTimeout: number; // ms per node
}

export const DEFAULT_OPTIMIZER_CONFIG: ExecutionOptimizerConfig = {
  enableResultCaching: true,
  enableBatchExecution: true,
  enableSmartScheduling: true,
  cacheExpiration: 300000, // 5 minutes
  maxBatchSize: 10,
  executionTimeout: 30000 // 30 seconds
};

interface CachedResult {
  result: any;
  timestamp: number;
  nodeId: string;
  parameters: Record<string, any>;
}

interface ExecutionBatch {
  nodes: WorkflowNode[];
  priority: number;
  estimatedDuration: number;
}

/**
 * Execution Optimizer Class
 */
export class ExecutionOptimizer {
  private config: ExecutionOptimizerConfig;
  private resultCache: Map<string, CachedResult>;
  private executionStats: Map<string, {
    count: number;
    totalDuration: number;
    avgDuration: number;
    lastExecution: number;
  }>;

  constructor(config: Partial<ExecutionOptimizerConfig> = {}) {
    this.config = { ...DEFAULT_OPTIMIZER_CONFIG, ...config };
    this.resultCache = new Map();
    this.executionStats = new Map();
  }

  /**
   * Generate cache key for a node execution
   */
  private generateCacheKey(node: WorkflowNode): string {
    const nodeType = node.data?.nodeType || node.type;
    const params = JSON.stringify(node.data?.parameters || {});
    return `${nodeType}:${params}`;
  }

  /**
   * Check if cached result is still valid
   */
  private isCacheValid(cached: CachedResult): boolean {
    const age = Date.now() - cached.timestamp;
    return age < this.config.cacheExpiration;
  }

  /**
   * Get cached result if available and valid
   */
  getCachedResult(node: WorkflowNode): any | null {
    if (!this.config.enableResultCaching) {
      return null;
    }

    const cacheKey = this.generateCacheKey(node);
    const cached = this.resultCache.get(cacheKey);

    if (cached && this.isCacheValid(cached)) {
      console.log(`[Optimizer] Cache hit for node: ${node.id}`);
      return cached.result;
    }

    return null;
  }

  /**
   * Cache execution result
   */
  cacheResult(node: WorkflowNode, result: any): void {
    if (!this.config.enableResultCaching) {
      return;
    }

    const cacheKey = this.generateCacheKey(node);
    this.resultCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      nodeId: node.id,
      parameters: node.data?.parameters || {}
    });
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): number {
    let cleared = 0;
    const now = Date.now();

    for (const [key, cached] of this.resultCache.entries()) {
      if (now - cached.timestamp >= this.config.cacheExpiration) {
        this.resultCache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      console.log(`[Optimizer] Cleared ${cleared} expired cache entries`);
    }

    return cleared;
  }

  /**
   * Record execution statistics
   */
  recordExecution(nodeType: string, duration: number): void {
    const stats = this.executionStats.get(nodeType) || {
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      lastExecution: 0
    };

    stats.count++;
    stats.totalDuration += duration;
    stats.avgDuration = stats.totalDuration / stats.count;
    stats.lastExecution = Date.now();

    this.executionStats.set(nodeType, stats);
  }

  /**
   * Get estimated execution duration for a node
   */
  getEstimatedDuration(nodeType: string): number {
    const stats = this.executionStats.get(nodeType);
    
    if (stats && stats.count > 0) {
      return stats.avgDuration;
    }

    // Default estimates based on node type
    const defaultDurations: Record<string, number> = {
      // Fast operations (< 100ms)
      'start': 10,
      'end': 10,
      'wait': 50,
      'hover': 50,
      'condition_branch': 20,
      'if_else': 20,
      'variable_set': 10,
      'variable_get': 10,
      
      // Medium operations (100ms - 1s)
      'takeoff': 500,
      'land': 500,
      'move_forward': 300,
      'move_backward': 300,
      'move_left': 300,
      'move_right': 300,
      'move_up': 300,
      'move_down': 300,
      'rotate_cw': 200,
      'rotate_ccw': 200,
      
      // Slow operations (> 1s)
      'qr_scan': 2000,
      'strawberry_detection': 3000,
      'yolo_detection': 2500,
      'purechat_chat': 3000,
      'purechat_image_analysis': 4000,
      'unipixel_segmentation': 5000,
      'challenge_8_flight': 10000,
      'challenge_obstacle': 15000,
      'challenge_precision_land': 8000
    };

    return defaultDurations[nodeType] || 1000;
  }

  /**
   * Create execution batches for parallel execution
   */
  createExecutionBatches(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): ExecutionBatch[] {
    if (!this.config.enableBatchExecution) {
      return nodes.map(node => ({
        nodes: [node],
        priority: 0,
        estimatedDuration: this.getEstimatedDuration(node.data?.nodeType || node.type)
      }));
    }

    // Build dependency graph
    const dependencies = new Map<string, Set<string>>();
    const dependents = new Map<string, Set<string>>();

    nodes.forEach(node => {
      dependencies.set(node.id, new Set());
      dependents.set(node.id, new Set());
    });

    edges.forEach(edge => {
      dependencies.get(edge.target)?.add(edge.source);
      dependents.get(edge.source)?.add(edge.target);
    });

    // Calculate node levels (topological sort)
    const levels = new Map<string, number>();
    const visited = new Set<string>();

    const calculateLevel = (nodeId: string): number => {
      if (levels.has(nodeId)) {
        return levels.get(nodeId)!;
      }

      if (visited.has(nodeId)) {
        return 0; // Circular dependency
      }

      visited.add(nodeId);

      const deps = dependencies.get(nodeId);
      if (!deps || deps.size === 0) {
        levels.set(nodeId, 0);
        return 0;
      }

      let maxLevel = -1;
      for (const depId of deps) {
        const depLevel = calculateLevel(depId);
        maxLevel = Math.max(maxLevel, depLevel);
      }

      const level = maxLevel + 1;
      levels.set(nodeId, level);
      return level;
    };

    nodes.forEach(node => calculateLevel(node.id));

    // Group nodes by level
    const levelGroups = new Map<number, WorkflowNode[]>();
    nodes.forEach(node => {
      const level = levels.get(node.id) || 0;
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(node);
    });

    // Create batches from level groups
    const batches: ExecutionBatch[] = [];

    for (const [level, levelNodes] of Array.from(levelGroups.entries()).sort((a, b) => a[0] - b[0])) {
      // Split large levels into smaller batches
      for (let i = 0; i < levelNodes.length; i += this.config.maxBatchSize) {
        const batchNodes = levelNodes.slice(i, i + this.config.maxBatchSize);
        const estimatedDuration = Math.max(
          ...batchNodes.map(node => 
            this.getEstimatedDuration(node.data?.nodeType || node.type)
          )
        );

        batches.push({
          nodes: batchNodes,
          priority: level,
          estimatedDuration
        });
      }
    }

    return batches;
  }

  /**
   * Optimize node execution order within a batch
   */
  optimizeExecutionOrder(nodes: WorkflowNode[]): WorkflowNode[] {
    if (!this.config.enableSmartScheduling) {
      return nodes;
    }

    // Sort by estimated duration (shortest first for better parallelism)
    return [...nodes].sort((a, b) => {
      const durationA = this.getEstimatedDuration(a.data?.nodeType || a.type);
      const durationB = this.getEstimatedDuration(b.data?.nodeType || b.type);
      return durationA - durationB;
    });
  }

  /**
   * Check if node execution should be skipped (optimization)
   */
  shouldSkipExecution(node: WorkflowNode, context: Record<string, any>): boolean {
    const nodeType = node.data?.nodeType || node.type;

    // Skip if result is cached
    if (this.getCachedResult(node) !== null) {
      return true;
    }

    // Skip conditional nodes if condition is false
    if (nodeType === 'condition_branch' || nodeType === 'if_else') {
      const condition = node.data?.parameters?.condition;
      if (condition && !this.evaluateCondition(condition, context)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Evaluate condition expression
   */
  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    try {
      // Simple condition evaluation (can be enhanced)
      const func = new Function(...Object.keys(context), `return ${condition}`);
      return func(...Object.values(context));
    } catch (error) {
      console.warn(`[Optimizer] Failed to evaluate condition: ${condition}`, error);
      return true; // Default to true on error
    }
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats(): {
    cacheSize: number;
    cacheHitRate: number;
    avgExecutionTime: number;
    totalExecutions: number;
    optimizationsEnabled: string[];
  } {
    let totalExecutions = 0;
    let totalDuration = 0;

    for (const stats of this.executionStats.values()) {
      totalExecutions += stats.count;
      totalDuration += stats.totalDuration;
    }

    const optimizationsEnabled: string[] = [];
    if (this.config.enableResultCaching) optimizationsEnabled.push('结果缓存');
    if (this.config.enableBatchExecution) optimizationsEnabled.push('批量执行');
    if (this.config.enableSmartScheduling) optimizationsEnabled.push('智能调度');

    return {
      cacheSize: this.resultCache.size,
      cacheHitRate: 0, // Would need to track cache hits/misses
      avgExecutionTime: totalExecutions > 0 ? totalDuration / totalExecutions : 0,
      totalExecutions,
      optimizationsEnabled
    };
  }

  /**
   * Clear all caches and statistics
   */
  reset(): void {
    this.resultCache.clear();
    this.executionStats.clear();
    console.log('[Optimizer] Reset complete');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ExecutionOptimizerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ExecutionOptimizerConfig {
    return { ...this.config };
  }
}

// Export singleton instance
let optimizerInstance: ExecutionOptimizer | null = null;

export function getExecutionOptimizer(config?: Partial<ExecutionOptimizerConfig>): ExecutionOptimizer {
  if (!optimizerInstance) {
    optimizerInstance = new ExecutionOptimizer(config);
  } else if (config) {
    optimizerInstance.updateConfig(config);
  }
  return optimizerInstance;
}

/**
 * React Hook for execution optimization
 */
export function useExecutionOptimizer(config?: Partial<ExecutionOptimizerConfig>): {
  optimizer: ExecutionOptimizer;
  stats: ReturnType<ExecutionOptimizer['getOptimizationStats']>;
  clearCache: () => void;
  reset: () => void;
} {
  const optimizer = getExecutionOptimizer(config);

  return {
    optimizer,
    stats: optimizer.getOptimizationStats(),
    clearCache: () => optimizer.clearExpiredCache(),
    reset: () => optimizer.reset()
  };
}
