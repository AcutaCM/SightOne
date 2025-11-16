/**
 * Auto Layout Utility for Workflow Graphs
 * 
 * This module provides automatic layout algorithms for workflow nodes
 * using the dagre library for hierarchical graph layout.
 */

import dagre from 'dagre';
import { Node, Edge } from 'reactflow';

export interface LayoutOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL'; // Top-Bottom, Bottom-Top, Left-Right, Right-Left
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number; // Separation between ranks
  nodeSep?: number; // Separation between nodes in same rank
  edgeSep?: number; // Separation between edges
  marginX?: number;
  marginY?: number;
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  direction: 'TB',
  nodeWidth: 180,
  nodeHeight: 60,
  rankSep: 100,
  nodeSep: 80,
  edgeSep: 20,
  marginX: 50,
  marginY: 50,
};

/**
 * Apply automatic layout to workflow nodes
 */
export function autoLayoutNodes(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Create a new directed graph
  const graph = new dagre.graphlib.Graph();

  // Set graph options
  graph.setGraph({
    rankdir: opts.direction,
    ranksep: opts.rankSep,
    nodesep: opts.nodeSep,
    edgesep: opts.edgeSep,
    marginx: opts.marginX,
    marginy: opts.marginY,
  });

  // Default to assigning a new object as a label for each new edge
  graph.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(graph);

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = graph.node(node.id);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - opts.nodeWidth / 2,
        y: nodeWithPosition.y - opts.nodeHeight / 2,
      },
    };
  });

  return layoutedNodes;
}

/**
 * Optimize node spacing to avoid overlaps
 */
export function optimizeNodeSpacing(nodes: Node[], minDistance: number = 100): Node[] {
  const optimizedNodes = [...nodes];

  // Simple collision detection and resolution
  for (let i = 0; i < optimizedNodes.length; i++) {
    for (let j = i + 1; j < optimizedNodes.length; j++) {
      const node1 = optimizedNodes[i];
      const node2 = optimizedNodes[j];

      const dx = node2.position.x - node1.position.x;
      const dy = node2.position.y - node1.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        // Move node2 away from node1
        const angle = Math.atan2(dy, dx);
        const moveDistance = minDistance - distance;

        node2.position.x += Math.cos(angle) * moveDistance;
        node2.position.y += Math.sin(angle) * moveDistance;
      }
    }
  }

  return optimizedNodes;
}

/**
 * Align nodes to grid
 */
export function alignToGrid(nodes: Node[], gridSize: number = 20): Node[] {
  return nodes.map((node) => ({
    ...node,
    position: {
      x: Math.round(node.position.x / gridSize) * gridSize,
      y: Math.round(node.position.y / gridSize) * gridSize,
    },
  }));
}

/**
 * Center workflow in viewport
 */
export function centerWorkflow(
  nodes: Node[],
  viewportWidth: number,
  viewportHeight: number
): Node[] {
  if (nodes.length === 0) return nodes;

  // Calculate bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + 180); // Assuming node width
    maxY = Math.max(maxY, node.position.y + 60); // Assuming node height
  });

  const workflowWidth = maxX - minX;
  const workflowHeight = maxY - minY;

  // Calculate offset to center
  const offsetX = (viewportWidth - workflowWidth) / 2 - minX;
  const offsetY = (viewportHeight - workflowHeight) / 2 - minY;

  // Apply offset
  return nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY,
    },
  }));
}

/**
 * Apply complete layout pipeline
 */
export function applyCompleteLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  // Step 1: Auto layout with dagre
  let layoutedNodes = autoLayoutNodes(nodes, edges, options);

  // Step 2: Optimize spacing
  layoutedNodes = optimizeNodeSpacing(layoutedNodes);

  // Step 3: Align to grid
  layoutedNodes = alignToGrid(layoutedNodes);

  return layoutedNodes;
}

/**
 * Calculate workflow bounds
 */
export function getWorkflowBounds(nodes: Node[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + 180);
    maxY = Math.max(maxY, node.position.y + 60);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Beautify workflow layout
 * - Ensures proper spacing
 * - Aligns nodes
 * - Optimizes edge routing
 */
export function beautifyLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Apply layout
  let beautifiedNodes = applyCompleteLayout(nodes, edges, opts);

  // Ensure minimum spacing between levels
  const nodesByLevel = groupNodesByLevel(beautifiedNodes, edges);
  beautifiedNodes = distributeNodesByLevel(nodesByLevel, opts);

  return {
    nodes: beautifiedNodes,
    edges,
  };
}

/**
 * Group nodes by their level in the hierarchy
 */
function groupNodesByLevel(nodes: Node[], edges: Edge[]): Map<number, Node[]> {
  const levels = new Map<number, Node[]>();
  const nodeLevel = new Map<string, number>();

  // Find start nodes (nodes with no incoming edges)
  const incomingEdges = new Map<string, number>();
  nodes.forEach((node) => incomingEdges.set(node.id, 0));
  edges.forEach((edge) => {
    incomingEdges.set(edge.target, (incomingEdges.get(edge.target) || 0) + 1);
  });

  const startNodes = nodes.filter((node) => incomingEdges.get(node.id) === 0);

  // BFS to assign levels
  const queue: Array<{ nodeId: string; level: number }> = [];
  startNodes.forEach((node) => {
    queue.push({ nodeId: node.id, level: 0 });
    nodeLevel.set(node.id, 0);
  });

  while (queue.length > 0) {
    const { nodeId, level } = queue.shift()!;

    // Find outgoing edges
    const outgoing = edges.filter((edge) => edge.source === nodeId);
    outgoing.forEach((edge) => {
      const targetLevel = level + 1;
      const currentLevel = nodeLevel.get(edge.target);

      if (currentLevel === undefined || targetLevel > currentLevel) {
        nodeLevel.set(edge.target, targetLevel);
        queue.push({ nodeId: edge.target, level: targetLevel });
      }
    });
  }

  // Group nodes by level
  nodes.forEach((node) => {
    const level = nodeLevel.get(node.id) || 0;
    if (!levels.has(level)) {
      levels.set(level, []);
    }
    levels.get(level)!.push(node);
  });

  return levels;
}

/**
 * Distribute nodes evenly within their levels
 */
function distributeNodesByLevel(
  nodesByLevel: Map<number, Node[]>,
  options: Required<LayoutOptions>
): Node[] {
  const distributedNodes: Node[] = [];

  nodesByLevel.forEach((levelNodes, level) => {
    const y = level * (options.nodeHeight + options.rankSep);
    const totalWidth = levelNodes.length * options.nodeWidth + (levelNodes.length - 1) * options.nodeSep;
    const startX = -totalWidth / 2;

    levelNodes.forEach((node, index) => {
      const x = startX + index * (options.nodeWidth + options.nodeSep);
      distributedNodes.push({
        ...node,
        position: { x, y },
      });
    });
  });

  return distributedNodes;
}
