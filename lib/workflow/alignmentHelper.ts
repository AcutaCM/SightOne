/**
 * Alignment Helper for Workflow Canvas
 * 
 * Provides utilities for node alignment and snap-to-grid functionality.
 * Implements requirements 3.5 and 10.2 from the design specification.
 */

import { Node, XYPosition } from 'reactflow';

export interface AlignmentLine {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  nodes: string[];
}

export interface AlignmentResult {
  position: XYPosition;
  lines: AlignmentLine[];
}

/**
 * Snap threshold in pixels
 */
const SNAP_THRESHOLD = 10;

/**
 * Grid size for snapping
 */
const GRID_SIZE = 20;

/**
 * Calculate alignment lines for a dragging node
 */
export function calculateAlignmentLines(
  draggingNode: Node,
  allNodes: Node[],
  threshold: number = SNAP_THRESHOLD
): AlignmentLine[] {
  const lines: AlignmentLine[] = [];
  const otherNodes = allNodes.filter(n => n.id !== draggingNode.id);

  if (otherNodes.length === 0) {
    return lines;
  }

  const draggingBounds = getNodeBounds(draggingNode);

  otherNodes.forEach(node => {
    const nodeBounds = getNodeBounds(node);

    // Check horizontal alignment (top, center, bottom)
    // Top alignment
    if (Math.abs(draggingBounds.top - nodeBounds.top) < threshold) {
      addOrUpdateLine(lines, 'horizontal', nodeBounds.top, [node.id]);
    }
    // Center alignment
    if (Math.abs(draggingBounds.centerY - nodeBounds.centerY) < threshold) {
      addOrUpdateLine(lines, 'horizontal', nodeBounds.centerY, [node.id]);
    }
    // Bottom alignment
    if (Math.abs(draggingBounds.bottom - nodeBounds.bottom) < threshold) {
      addOrUpdateLine(lines, 'horizontal', nodeBounds.bottom, [node.id]);
    }

    // Check vertical alignment (left, center, right)
    // Left alignment
    if (Math.abs(draggingBounds.left - nodeBounds.left) < threshold) {
      addOrUpdateLine(lines, 'vertical', nodeBounds.left, [node.id]);
    }
    // Center alignment
    if (Math.abs(draggingBounds.centerX - nodeBounds.centerX) < threshold) {
      addOrUpdateLine(lines, 'vertical', nodeBounds.centerX, [node.id]);
    }
    // Right alignment
    if (Math.abs(draggingBounds.right - nodeBounds.right) < threshold) {
      addOrUpdateLine(lines, 'vertical', nodeBounds.right, [node.id]);
    }
  });

  return lines;
}

/**
 * Snap node position to alignment lines
 */
export function snapToAlignmentLines(
  position: XYPosition,
  node: Node,
  lines: AlignmentLine[]
): XYPosition {
  let snappedPosition = { ...position };
  const nodeBounds = getNodeBounds({ ...node, position });

  lines.forEach(line => {
    if (line.type === 'horizontal') {
      // Snap to horizontal line (adjust Y position)
      const centerY = nodeBounds.centerY;
      const top = nodeBounds.top;
      const bottom = nodeBounds.bottom;

      if (Math.abs(centerY - line.position) < SNAP_THRESHOLD) {
        snappedPosition.y = line.position - (nodeBounds.height / 2);
      } else if (Math.abs(top - line.position) < SNAP_THRESHOLD) {
        snappedPosition.y = line.position;
      } else if (Math.abs(bottom - line.position) < SNAP_THRESHOLD) {
        snappedPosition.y = line.position - nodeBounds.height;
      }
    } else {
      // Snap to vertical line (adjust X position)
      const centerX = nodeBounds.centerX;
      const left = nodeBounds.left;
      const right = nodeBounds.right;

      if (Math.abs(centerX - line.position) < SNAP_THRESHOLD) {
        snappedPosition.x = line.position - (nodeBounds.width / 2);
      } else if (Math.abs(left - line.position) < SNAP_THRESHOLD) {
        snappedPosition.x = line.position;
      } else if (Math.abs(right - line.position) < SNAP_THRESHOLD) {
        snappedPosition.x = line.position - nodeBounds.width;
      }
    }
  });

  return snappedPosition;
}

/**
 * Snap position to grid
 */
export function snapToGrid(
  position: XYPosition,
  gridSize: number = GRID_SIZE
): XYPosition {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

/**
 * Align selected nodes
 */
export function alignNodes(
  nodes: Node[],
  alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
): Node[] {
  if (nodes.length < 2) {
    return nodes;
  }

  const bounds = nodes.map(getNodeBounds);
  
  switch (alignment) {
    case 'left': {
      const minLeft = Math.min(...bounds.map(b => b.left));
      return nodes.map((node, i) => ({
        ...node,
        position: { ...node.position, x: minLeft },
      }));
    }
    
    case 'center': {
      const avgCenterX = bounds.reduce((sum, b) => sum + b.centerX, 0) / bounds.length;
      return nodes.map((node, i) => ({
        ...node,
        position: { 
          ...node.position, 
          x: avgCenterX - (bounds[i].width / 2),
        },
      }));
    }
    
    case 'right': {
      const maxRight = Math.max(...bounds.map(b => b.right));
      return nodes.map((node, i) => ({
        ...node,
        position: { 
          ...node.position, 
          x: maxRight - bounds[i].width,
        },
      }));
    }
    
    case 'top': {
      const minTop = Math.min(...bounds.map(b => b.top));
      return nodes.map((node, i) => ({
        ...node,
        position: { ...node.position, y: minTop },
      }));
    }
    
    case 'middle': {
      const avgCenterY = bounds.reduce((sum, b) => sum + b.centerY, 0) / bounds.length;
      return nodes.map((node, i) => ({
        ...node,
        position: { 
          ...node.position, 
          y: avgCenterY - (bounds[i].height / 2),
        },
      }));
    }
    
    case 'bottom': {
      const maxBottom = Math.max(...bounds.map(b => b.bottom));
      return nodes.map((node, i) => ({
        ...node,
        position: { 
          ...node.position, 
          y: maxBottom - bounds[i].height,
        },
      }));
    }
    
    default:
      return nodes;
  }
}

/**
 * Distribute nodes evenly
 */
export function distributeNodes(
  nodes: Node[],
  direction: 'horizontal' | 'vertical'
): Node[] {
  if (nodes.length < 3) {
    return nodes;
  }

  const bounds = nodes.map(getNodeBounds);
  const sortedIndices = nodes
    .map((_, i) => i)
    .sort((a, b) => {
      if (direction === 'horizontal') {
        return bounds[a].left - bounds[b].left;
      } else {
        return bounds[a].top - bounds[b].top;
      }
    });

  const first = sortedIndices[0];
  const last = sortedIndices[sortedIndices.length - 1];

  if (direction === 'horizontal') {
    const totalWidth = bounds[last].right - bounds[first].left;
    const nodeWidths = sortedIndices.map(i => bounds[i].width);
    const totalNodeWidth = nodeWidths.reduce((sum, w) => sum + w, 0);
    const spacing = (totalWidth - totalNodeWidth) / (nodes.length - 1);

    let currentX = bounds[first].left;
    return sortedIndices.map(i => {
      const node = nodes[i];
      const newNode = {
        ...node,
        position: { ...node.position, x: currentX },
      };
      currentX += bounds[i].width + spacing;
      return newNode;
    });
  } else {
    const totalHeight = bounds[last].bottom - bounds[first].top;
    const nodeHeights = sortedIndices.map(i => bounds[i].height);
    const totalNodeHeight = nodeHeights.reduce((sum, h) => sum + h, 0);
    const spacing = (totalHeight - totalNodeHeight) / (nodes.length - 1);

    let currentY = bounds[first].top;
    return sortedIndices.map(i => {
      const node = nodes[i];
      const newNode = {
        ...node,
        position: { ...node.position, y: currentY },
      };
      currentY += bounds[i].height + spacing;
      return newNode;
    });
  }
}

/**
 * Get node bounds
 */
function getNodeBounds(node: Node) {
  const width = (node.width as number) || 200;
  const height = (node.height as number) || 100;
  const x = node.position.x;
  const y = node.position.y;

  return {
    left: x,
    right: x + width,
    top: y,
    bottom: y + height,
    centerX: x + width / 2,
    centerY: y + height / 2,
    width,
    height,
  };
}

/**
 * Add or update alignment line
 */
function addOrUpdateLine(
  lines: AlignmentLine[],
  type: 'horizontal' | 'vertical',
  position: number,
  nodeIds: string[]
): void {
  const existingLine = lines.find(
    l => l.type === type && Math.abs(l.position - position) < 1
  );

  if (existingLine) {
    existingLine.nodes.push(...nodeIds);
  } else {
    lines.push({
      id: `${type}-${position}`,
      type,
      position,
      nodes: nodeIds,
    });
  }
}
