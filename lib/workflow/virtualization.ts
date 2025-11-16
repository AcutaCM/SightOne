// Workflow Virtualization System
// Optimizes rendering of large workflows by only rendering visible nodes

import { Node, Edge, Viewport } from 'reactflow';

export interface VirtualizationConfig {
  enabled: boolean;
  threshold: number; // Number of nodes before virtualization kicks in
  bufferZone: number; // Extra space around viewport to render (in pixels)
  updateDebounce: number; // Debounce time for viewport updates (ms)
}

export const DEFAULT_VIRTUALIZATION_CONFIG: VirtualizationConfig = {
  enabled: true,
  threshold: 50,
  bufferZone: 200,
  updateDebounce: 100
};

export class WorkflowVirtualizer {
  private config: VirtualizationConfig;
  private lastViewport: Viewport | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<VirtualizationConfig> = {}) {
    this.config = { ...DEFAULT_VIRTUALIZATION_CONFIG, ...config };
  }

  /**
   * Check if virtualization should be enabled based on node count
   */
  shouldVirtualize(nodeCount: number): boolean {
    return this.config.enabled && nodeCount > this.config.threshold;
  }

  /**
   * Get visible nodes based on current viewport
   */
  getVisibleNodes(
    allNodes: Node[],
    viewport: Viewport,
    canvasWidth: number,
    canvasHeight: number
  ): Node[] {
    if (!this.shouldVirtualize(allNodes.length)) {
      return allNodes;
    }

    const { x, y, zoom } = viewport;
    const buffer = this.config.bufferZone / zoom;

    // Calculate visible bounds with buffer
    const viewportBounds = {
      left: -x / zoom - buffer,
      right: (-x + canvasWidth) / zoom + buffer,
      top: -y / zoom - buffer,
      bottom: (-y + canvasHeight) / zoom + buffer
    };

    // Filter nodes that are within or near the viewport
    return allNodes.filter(node => {
      const nodeWidth = node.width || 180;
      const nodeHeight = node.height || 60;

      const nodeBounds = {
        left: node.position.x,
        right: node.position.x + nodeWidth,
        top: node.position.y,
        bottom: node.position.y + nodeHeight
      };

      // Check if node intersects with viewport bounds
      return !(
        nodeBounds.right < viewportBounds.left ||
        nodeBounds.left > viewportBounds.right ||
        nodeBounds.bottom < viewportBounds.top ||
        nodeBounds.top > viewportBounds.bottom
      );
    });
  }

  /**
   * Get visible edges (edges connected to visible nodes)
   */
  getVisibleEdges(allEdges: Edge[], visibleNodes: Node[]): Edge[] {
    if (!this.shouldVirtualize(visibleNodes.length)) {
      return allEdges;
    }

    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

    return allEdges.filter(edge => 
      visibleNodeIds.has(edge.source) || visibleNodeIds.has(edge.target)
    );
  }

  /**
   * Debounced viewport update
   */
  updateViewportDebounced(
    callback: () => void
  ): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      callback();
      this.debounceTimer = null;
    }, this.config.updateDebounce);
  }

  /**
   * Calculate viewport statistics
   */
  getVirtualizationStats(
    totalNodes: number,
    visibleNodes: number,
    totalEdges: number,
    visibleEdges: number
  ): {
    isVirtualized: boolean;
    nodeReduction: number;
    edgeReduction: number;
    performanceGain: string;
  } {
    const isVirtualized = this.shouldVirtualize(totalNodes);
    const nodeReduction = totalNodes > 0 
      ? ((totalNodes - visibleNodes) / totalNodes * 100).toFixed(1)
      : '0';
    const edgeReduction = totalEdges > 0
      ? ((totalEdges - visibleEdges) / totalEdges * 100).toFixed(1)
      : '0';

    return {
      isVirtualized,
      nodeReduction: parseFloat(nodeReduction),
      edgeReduction: parseFloat(edgeReduction),
      performanceGain: isVirtualized 
        ? `节省 ${nodeReduction}% 节点渲染, ${edgeReduction}% 连接渲染`
        : '未启用虚拟化'
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VirtualizationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): VirtualizationConfig {
    return { ...this.config };
  }
}

// Export singleton instance
let virtualizerInstance: WorkflowVirtualizer | null = null;

export function getWorkflowVirtualizer(config?: Partial<VirtualizationConfig>): WorkflowVirtualizer {
  if (!virtualizerInstance) {
    virtualizerInstance = new WorkflowVirtualizer(config);
  } else if (config) {
    virtualizerInstance.updateConfig(config);
  }
  return virtualizerInstance;
}

/**
 * React Hook for virtualization
 */
export function useWorkflowVirtualization(
  nodes: Node[],
  edges: Edge[],
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number,
  config?: Partial<VirtualizationConfig>
): {
  visibleNodes: Node[];
  visibleEdges: Edge[];
  stats: ReturnType<WorkflowVirtualizer['getVirtualizationStats']>;
  virtualizer: WorkflowVirtualizer;
} {
  const virtualizer = getWorkflowVirtualizer(config);

  const visibleNodes = virtualizer.getVisibleNodes(
    nodes,
    viewport,
    canvasWidth,
    canvasHeight
  );

  const visibleEdges = virtualizer.getVisibleEdges(edges, visibleNodes);

  const stats = virtualizer.getVirtualizationStats(
    nodes.length,
    visibleNodes.length,
    edges.length,
    visibleEdges.length
  );

  return {
    visibleNodes,
    visibleEdges,
    stats,
    virtualizer
  };
}
