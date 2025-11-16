/**
 * Component Optimization Utilities
 * 
 * Provides React optimization utilities including:
 * - React.memo wrappers with custom comparison
 * - useMemo helpers for expensive computations
 * - useCallback helpers for stable callbacks
 * 
 * Task 10.2: Component Optimization
 * Requirements: 8.2
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';
import { Node, Edge } from 'reactflow';

/**
 * Deep comparison for React.memo
 * Compares objects by their JSON representation
 */
export function deepCompare<T>(prevProps: T, nextProps: T): boolean {
  try {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  } catch {
    // Fallback to shallow comparison if JSON.stringify fails
    return prevProps === nextProps;
  }
}

/**
 * Shallow comparison for React.memo
 * Only compares first-level properties
 */
export function shallowCompare<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Custom comparison for Node arrays
 * Optimized for React Flow nodes
 */
export function compareNodes(prevNodes: Node[], nextNodes: Node[]): boolean {
  if (prevNodes.length !== nextNodes.length) {
    return false;
  }

  for (let i = 0; i < prevNodes.length; i++) {
    const prev = prevNodes[i];
    const next = nextNodes[i];

    if (
      prev.id !== next.id ||
      prev.type !== next.type ||
      prev.position.x !== next.position.x ||
      prev.position.y !== next.position.y ||
      prev.selected !== next.selected ||
      JSON.stringify(prev.data) !== JSON.stringify(next.data)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Custom comparison for Edge arrays
 * Optimized for React Flow edges
 */
export function compareEdges(prevEdges: Edge[], nextEdges: Edge[]): boolean {
  if (prevEdges.length !== nextEdges.length) {
    return false;
  }

  for (let i = 0; i < prevEdges.length; i++) {
    const prev = prevEdges[i];
    const next = nextEdges[i];

    if (
      prev.id !== next.id ||
      prev.source !== next.source ||
      prev.target !== next.target ||
      prev.selected !== next.selected
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Memoized node filtering
 * Caches filtered node results based on search query
 */
export function useMemoizedNodeFilter(
  nodes: Node[],
  searchQuery: string
): Node[] {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return nodes;
    }

    const query = searchQuery.toLowerCase();
    return nodes.filter(node => {
      const label = (node.data?.label || '').toLowerCase();
      const type = (node.type || '').toLowerCase();
      const description = (node.data?.description || '').toLowerCase();

      return (
        label.includes(query) ||
        type.includes(query) ||
        description.includes(query)
      );
    });
  }, [nodes, searchQuery]);
}

/**
 * Memoized node grouping by category
 */
export function useMemoizedNodeGrouping(
  nodes: Node[]
): Map<string, Node[]> {
  return useMemo(() => {
    const groups = new Map<string, Node[]>();

    for (const node of nodes) {
      const category = node.data?.category || 'uncategorized';
      const existing = groups.get(category) || [];
      groups.set(category, [...existing, node]);
    }

    return groups;
  }, [nodes]);
}

/**
 * Stable callback for node selection
 */
export function useStableNodeCallback<T extends any[]>(
  callback: (...args: T) => void,
  dependencies: any[]
): (...args: T) => void {
  return useCallback(callback, dependencies);
}

/**
 * Memoized node statistics
 */
export function useMemoizedNodeStats(nodes: Node[]): {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  selected: number;
} {
  return useMemo(() => {
    const stats = {
      total: nodes.length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      selected: 0,
    };

    for (const node of nodes) {
      // Count by type
      const type = node.type || 'default';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Count by category
      const category = node.data?.category || 'uncategorized';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Count selected
      if (node.selected) {
        stats.selected++;
      }
    }

    return stats;
  }, [nodes]);
}

/**
 * Debounced value hook
 * Returns a debounced version of the value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttled callback hook
 * Returns a throttled version of the callback
 */
export function useThrottledCallback<T extends any[]>(
  callback: (...args: T) => void,
  delay: number
): (...args: T) => void {
  const lastRun = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: T) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        // Schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    },
    [callback, delay]
  );
}

/**
 * Memoized edge statistics
 */
export function useMemoizedEdgeStats(edges: Edge[]): {
  total: number;
  byType: Record<string, number>;
  selected: number;
} {
  return useMemo(() => {
    const stats = {
      total: edges.length,
      byType: {} as Record<string, number>,
      selected: 0,
    };

    for (const edge of edges) {
      // Count by type
      const type = edge.type || 'default';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Count selected
      if (edge.selected) {
        stats.selected++;
      }
    }

    return stats;
  }, [edges]);
}

/**
 * Stable event handler creator
 * Creates stable event handlers that don't cause re-renders
 */
export function useStableEventHandler<T extends (...args: any[]) => any>(
  handler: T
): T {
  const handlerRef = useRef<T>(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  return useCallback(
    ((...args: any[]) => {
      return handlerRef.current(...args);
    }) as T,
    []
  );
}

/**
 * Memoized workflow validation
 */
export function useMemoizedWorkflowValidation(
  nodes: Node[],
  edges: Edge[]
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  return useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for disconnected nodes
    const connectedNodeIds = new Set<string>();
    for (const edge of edges) {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    }

    for (const node of nodes) {
      if (!connectedNodeIds.has(node.id) && nodes.length > 1) {
        warnings.push(`节点 "${node.data?.label || node.id}" 未连接`);
      }
    }

    // Check for invalid edges
    const nodeIds = new Set(nodes.map(n => n.id));
    for (const edge of edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`连接源节点 "${edge.source}" 不存在`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`连接目标节点 "${edge.target}" 不存在`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [nodes, edges]);
}

/**
 * Performance monitoring hook
 * Tracks render count and timing
 */
export function useRenderPerformance(componentName: string): void {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current++;
    const renderTime = Date.now() - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${componentName} rendered ${renderCount.current} times (${renderTime}ms)`
      );
    }

    startTime.current = Date.now();
  });
}

// Missing import
import { useState } from 'react';
