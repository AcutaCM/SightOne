/**
 * Parallel Execution Optimizer for Workflow Engine
 * 
 * This module analyzes workflow dependencies and schedules parallel execution
 * of independent nodes to improve performance.
 */

import { WorkflowNode, WorkflowEdge } from '../workflowEngine';

export interface DependencyGraph {
  [nodeId: string]: {
    dependencies: string[]; // Nodes that must execute before this node
    dependents: string[]; // Nodes that depend on this node
  };
}

export interface ExecutionGroup {
  level: number;
  nodes: WorkflowNode[];
}

/**
 * Parallel Execution Scheduler
 */
export class ParallelExecutor {
  private nodes: WorkflowNode[];
  private edges: WorkflowEdge[];
  private dependencyGraph: DependencyGraph;

  constructor(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.dependencyGraph = this.buildDependencyGraph();
  }

  /**
   * Build dependency graph from nodes and edges
   */
  private buildDependencyGraph(): DependencyGraph {
    const graph: DependencyGraph = {};

    // Initialize graph
    this.nodes.forEach(node => {
      graph[node.id] = {
        dependencies: [],
        dependents: []
      };
    });

    // Build dependencies from edges
    this.edges.forEach(edge => {
      // Target node depends on source node
      if (graph[edge.target]) {
        graph[edge.target].dependencies.push(edge.source);
      }
      // Source node has target as dependent
      if (graph[edge.source]) {
        graph[edge.source].dependents.push(edge.target);
      }
    });

    return graph;
  }

  /**
   * Analyze dependencies and group nodes by execution level
   * Nodes in the same level can be executed in parallel
   */
  public analyzeExecutionLevels(): ExecutionGroup[] {
    const levels: ExecutionGroup[] = [];
    const visited = new Set<string>();
    const nodeMap = new Map(this.nodes.map(n => [n.id, n]));

    // Find start nodes (nodes with no dependencies)
    const startNodes = this.nodes.filter(node => 
      this.dependencyGraph[node.id].dependencies.length === 0
    );

    if (startNodes.length === 0) {
      throw new Error('No start nodes found - workflow may have circular dependencies');
    }

    let currentLevel = 0;
    let currentLevelNodes = startNodes;

    while (currentLevelNodes.length > 0) {
      // Add current level
      levels.push({
        level: currentLevel,
        nodes: currentLevelNodes
      });

      // Mark nodes as visited
      currentLevelNodes.forEach(node => visited.add(node.id));

      // Find next level nodes
      const nextLevelNodeIds = new Set<string>();
      
      currentLevelNodes.forEach(node => {
        const dependents = this.dependencyGraph[node.id].dependents;
        dependents.forEach(dependentId => {
          // Check if all dependencies of this dependent are satisfied
          const allDependenciesSatisfied = this.dependencyGraph[dependentId].dependencies
            .every(depId => visited.has(depId));
          
          if (allDependenciesSatisfied && !visited.has(dependentId)) {
            nextLevelNodeIds.add(dependentId);
          }
        });
      });

      // Convert IDs to nodes
      currentLevelNodes = Array.from(nextLevelNodeIds)
        .map(id => nodeMap.get(id))
        .filter((node): node is WorkflowNode => node !== undefined);

      currentLevel++;

      // Safety check for infinite loops
      if (currentLevel > this.nodes.length) {
        throw new Error('Circular dependency detected in workflow');
      }
    }

    return levels;
  }

  /**
   * Check if workflow has circular dependencies
   */
  public hasCircularDependencies(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const dependents = this.dependencyGraph[nodeId]?.dependents || [];
      
      for (const dependentId of dependents) {
        if (!visited.has(dependentId)) {
          if (hasCycle(dependentId)) {
            return true;
          }
        } else if (recursionStack.has(dependentId)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of Object.keys(this.dependencyGraph)) {
      if (!visited.has(nodeId)) {
        if (hasCycle(nodeId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get nodes that can be executed in parallel at current state
   */
  public getParallelizableNodes(completedNodeIds: Set<string>): WorkflowNode[] {
    const parallelizable: WorkflowNode[] = [];

    for (const node of this.nodes) {
      // Skip if already completed
      if (completedNodeIds.has(node.id)) {
        continue;
      }

      // Check if all dependencies are completed
      const dependencies = this.dependencyGraph[node.id].dependencies;
      const allDependenciesCompleted = dependencies.every(depId => 
        completedNodeIds.has(depId)
      );

      if (allDependenciesCompleted) {
        parallelizable.push(node);
      }
    }

    return parallelizable;
  }

  /**
   * Get dependency information for a specific node
   */
  public getNodeDependencies(nodeId: string): {
    dependencies: string[];
    dependents: string[];
  } {
    return this.dependencyGraph[nodeId] || { dependencies: [], dependents: [] };
  }

  /**
   * Calculate critical path (longest path through the workflow)
   */
  public calculateCriticalPath(): {
    path: string[];
    length: number;
  } {
    const levels = this.analyzeExecutionLevels();
    const nodeToLevel = new Map<string, number>();

    // Map nodes to their levels
    levels.forEach(level => {
      level.nodes.forEach(node => {
        nodeToLevel.set(node.id, level.level);
      });
    });

    // Find the longest path
    let longestPath: string[] = [];
    let maxLength = 0;

    const findPath = (nodeId: string, currentPath: string[]): void => {
      const newPath = [...currentPath, nodeId];
      const dependents = this.dependencyGraph[nodeId].dependents;

      if (dependents.length === 0) {
        // Leaf node - check if this is the longest path
        if (newPath.length > maxLength) {
          maxLength = newPath.length;
          longestPath = newPath;
        }
      } else {
        // Continue exploring
        dependents.forEach(depId => findPath(depId, newPath));
      }
    };

    // Start from all start nodes
    const startNodes = this.nodes.filter(node => 
      this.dependencyGraph[node.id].dependencies.length === 0
    );

    startNodes.forEach(node => findPath(node.id, []));

    return {
      path: longestPath,
      length: maxLength
    };
  }

  /**
   * Get execution statistics
   */
  public getExecutionStats(): {
    totalNodes: number;
    maxParallelism: number;
    levels: number;
    criticalPathLength: number;
    averageNodesPerLevel: number;
  } {
    const levels = this.analyzeExecutionLevels();
    const criticalPath = this.calculateCriticalPath();

    const maxParallelism = Math.max(...levels.map(l => l.nodes.length));
    const averageNodesPerLevel = this.nodes.length / levels.length;

    return {
      totalNodes: this.nodes.length,
      maxParallelism,
      levels: levels.length,
      criticalPathLength: criticalPath.length,
      averageNodesPerLevel
    };
  }
}

/**
 * Create a parallel executor instance
 */
export function createParallelExecutor(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ParallelExecutor {
  return new ParallelExecutor(nodes, edges);
}

