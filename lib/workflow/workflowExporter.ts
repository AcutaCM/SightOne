/**
 * Workflow Exporter
 * 
 * Utility functions for exporting workflow diagrams as PNG or SVG images.
 * Uses html-to-image library for rendering React Flow canvas to images.
 * 
 * Implements requirement 10.7 from the design specification.
 */

import { toPng, toSvg } from 'html-to-image';
import { getRectOfNodes, getTransformForBounds } from 'reactflow';
import type { Node } from 'reactflow';

export interface ExportOptions {
  /**
   * Background color for the exported image
   * @default 'transparent'
   */
  backgroundColor?: string;
  
  /**
   * Width of the exported image in pixels
   * If not specified, uses the actual canvas size
   */
  width?: number;
  
  /**
   * Height of the exported image in pixels
   * If not specified, uses the actual canvas size
   */
  height?: number;
  
  /**
   * Padding around the workflow in pixels
   * @default 20
   */
  padding?: number;
  
  /**
   * Quality of the PNG image (0-1)
   * @default 1
   */
  quality?: number;
  
  /**
   * Include only selected nodes
   * @default false
   */
  selectedOnly?: boolean;
  
  /**
   * Filename for the downloaded file
   * @default 'workflow'
   */
  filename?: string;
}

/**
 * Download a data URL as a file
 */
function downloadImage(dataUrl: string, filename: string, extension: 'png' | 'svg') {
  const link = document.createElement('a');
  link.download = `${filename}.${extension}`;
  link.href = dataUrl;
  link.click();
}

/**
 * Get the viewport element for export
 */
function getViewportElement(): HTMLElement | null {
  return document.querySelector('.react-flow__viewport') as HTMLElement;
}

/**
 * Calculate the bounds for export based on nodes
 */
function calculateExportBounds(
  nodes: Node[],
  padding: number = 20
): { x: number; y: number; width: number; height: number } {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 };
  }

  const nodesBounds = getRectOfNodes(nodes);
  
  return {
    x: nodesBounds.x - padding,
    y: nodesBounds.y - padding,
    width: nodesBounds.width + padding * 2,
    height: nodesBounds.height + padding * 2,
  };
}

/**
 * Export workflow as PNG image
 * 
 * @param nodes - Array of workflow nodes
 * @param options - Export options
 * @returns Promise that resolves when export is complete
 */
export async function exportWorkflowAsPNG(
  nodes: Node[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    backgroundColor = 'transparent',
    padding = 20,
    quality = 1,
    selectedOnly = false,
    filename = 'workflow',
  } = options;

  const viewportElement = getViewportElement();
  if (!viewportElement) {
    throw new Error('Workflow viewport not found');
  }

  // Filter nodes if selectedOnly is true
  const nodesToExport = selectedOnly
    ? nodes.filter(node => node.selected)
    : nodes;

  if (nodesToExport.length === 0) {
    throw new Error('No nodes to export');
  }

  // Calculate bounds
  const bounds = calculateExportBounds(nodesToExport, padding);
  
  // Get transform for bounds
  const transform = getTransformForBounds(
    bounds,
    bounds.width,
    bounds.height,
    0.5,
    2,
    0
  );

  try {
    // Export to PNG
    const dataUrl = await toPng(viewportElement, {
      backgroundColor,
      width: bounds.width,
      height: bounds.height,
      quality,
      style: {
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
      pixelRatio: 2, // Higher resolution for better quality
    });

    // Download the image
    downloadImage(dataUrl, filename, 'png');
  } catch (error) {
    console.error('Failed to export workflow as PNG:', error);
    throw new Error('Failed to export workflow as PNG');
  }
}

/**
 * Export workflow as SVG image
 * 
 * @param nodes - Array of workflow nodes
 * @param options - Export options
 * @returns Promise that resolves when export is complete
 */
export async function exportWorkflowAsSVG(
  nodes: Node[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    backgroundColor = 'transparent',
    padding = 20,
    selectedOnly = false,
    filename = 'workflow',
  } = options;

  const viewportElement = getViewportElement();
  if (!viewportElement) {
    throw new Error('Workflow viewport not found');
  }

  // Filter nodes if selectedOnly is true
  const nodesToExport = selectedOnly
    ? nodes.filter(node => node.selected)
    : nodes;

  if (nodesToExport.length === 0) {
    throw new Error('No nodes to export');
  }

  // Calculate bounds
  const bounds = calculateExportBounds(nodesToExport, padding);
  
  // Get transform for bounds
  const transform = getTransformForBounds(
    bounds,
    bounds.width,
    bounds.height,
    0.5,
    2,
    0
  );

  try {
    // Export to SVG
    const dataUrl = await toSvg(viewportElement, {
      backgroundColor,
      width: bounds.width,
      height: bounds.height,
      style: {
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    });

    // Download the image
    downloadImage(dataUrl, filename, 'svg');
  } catch (error) {
    console.error('Failed to export workflow as SVG:', error);
    throw new Error('Failed to export workflow as SVG');
  }
}

/**
 * Export workflow with custom format
 * 
 * @param nodes - Array of workflow nodes
 * @param format - Export format ('png' or 'svg')
 * @param options - Export options
 * @returns Promise that resolves when export is complete
 */
export async function exportWorkflow(
  nodes: Node[],
  format: 'png' | 'svg',
  options: ExportOptions = {}
): Promise<void> {
  if (format === 'png') {
    return exportWorkflowAsPNG(nodes, options);
  } else if (format === 'svg') {
    return exportWorkflowAsSVG(nodes, options);
  } else {
    throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Check if export is supported in the current browser
 */
export function isExportSupported(): boolean {
  try {
    // Check if required APIs are available
    return (
      typeof document !== 'undefined' &&
      typeof HTMLCanvasElement !== 'undefined' &&
      'toDataURL' in HTMLCanvasElement.prototype
    );
  } catch {
    return false;
  }
}
