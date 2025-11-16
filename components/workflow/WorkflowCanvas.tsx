/**
 * WorkflowCanvas Component
 * 
 * Main canvas component for the workflow editor with React Flow integration.
 * Provides a professional, theme-aware canvas with grid background and smooth interactions.
 * 
 * Features:
 * - React Flow integration with custom configuration
 * - Theme-aware styling (light/dark)
 * - Dot grid background
 * - Smooth zoom and pan animations
 * - Snap-to-grid functionality
 * - Custom controls and minimap
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  BackgroundVariant,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  ConnectionLineType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowTheme } from '../../hooks/useWorkflowTheme';
import CanvasToolbar from './CanvasToolbar';
import AlignmentToolbar from './AlignmentToolbar';
import CustomMiniMap from './CustomMiniMap';
import MultiSelectionToolbar from './MultiSelectionToolbar';
import styles from '../../styles/WorkflowCanvas.module.css';

export interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  nodeTypes?: any;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  onDrop?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  className?: string;
}

/**
 * WorkflowCanvas Component
 * 
 * A modern, theme-aware canvas for building workflows with React Flow.
 * Implements requirements 3.1, 3.2, 3.3, 3.4 from the design specification.
 */
const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  nodeTypes,
  onNodeDoubleClick,
  onDrop,
  onDragOver,
  className,
}) => {
  const { theme, tokens } = useWorkflowTheme();
  const [isPanMode, setIsPanMode] = React.useState(false);
  
  // Track selected nodes for multi-selection toolbar
  const selectedNodes = useMemo(() => {
    return nodes.filter(node => node.selected);
  }, [nodes]);

  // Canvas settings based on requirements
  const canvasSettings = useMemo(() => ({
    snapToGrid: true,
    gridSize: 20, // 20px grid spacing (Requirement 3.1)
    minZoom: 0.5, // Minimum zoom level (Requirement 3.2)
    maxZoom: 2.0, // Maximum zoom level (Requirement 3.2)
    fitViewOptions: {
      padding: 0.2,
      includeHiddenNodes: false,
    },
  }), []);

  // Default edge options with theme colors
  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: tokens.colors.edge.default,
      strokeWidth: 2,
    },
  }), [tokens.colors.edge.default]);

  // Connection line style with theme colors
  const connectionLineStyle = useMemo(() => ({
    stroke: tokens.colors.edge.selected,
    strokeWidth: 2,
  }), [tokens.colors.edge.selected]);

  // Handle drag over for node drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (onDragOver) {
      onDragOver(event);
    }
  }, [onDragOver]);

  // Handle drop for node creation
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (onDrop) {
      onDrop(event);
    }
  }, [onDrop]);

  // Handle spacebar for pan mode (Requirement 3.3)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        setIsPanMode(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        setIsPanMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div 
      className={`${styles.canvasContainer} ${className || ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      data-theme={theme}
      data-pan-mode={isPanMode}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeDoubleClick={onNodeDoubleClick}
        
        // Grid and snapping (Requirement 3.1)
        snapToGrid={canvasSettings.snapToGrid}
        snapGrid={[canvasSettings.gridSize, canvasSettings.gridSize]}
        
        // Zoom settings (Requirement 3.2)
        minZoom={canvasSettings.minZoom}
        maxZoom={canvasSettings.maxZoom}
        
        // Fit view settings
        fitView
        fitViewOptions={canvasSettings.fitViewOptions}
        
        // Edge styling
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={connectionLineStyle}
        
        // Interaction settings (Requirement 3.3, 3.4)
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        panOnDrag={isPanMode ? [1, 2] : true} // Enable pan with any mouse button when spacebar is pressed
        selectionOnDrag={!isPanMode}
        zoomActivationKeyCode="Control"
        
        // Accessibility
        elementsSelectable={true}
        nodesConnectable={true}
        nodesDraggable={true}
        
        // Performance
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Control"
        
        className={styles.reactFlow}
      >
        {/* Dot grid background (Requirement 3.1, 2.4, 2.5) */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={canvasSettings.gridSize}
          size={1.5}
          color={tokens.colors.canvas.gridDot}
          style={{
            backgroundColor: tokens.colors.canvas.background,
          }}
          className={styles.background}
        />
        
        {/* Canvas controls (Requirement 3.6) */}
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          position="bottom-right"
          className={styles.controls}
          style={{
            background: tokens.colors.panel.background,
            border: `1px solid ${tokens.colors.panel.border}`,
            borderRadius: tokens.radius.md,
            boxShadow: tokens.shadows.md,
          }}
        />
        
        {/* Custom Minimap with toggle (Requirement 10.1) */}
        <Panel position="bottom-left" className={styles.minimapPanel}>
          <CustomMiniMap
            defaultVisible={true}
            nodeColor={(node) => {
              // Use node color if available, otherwise use default
              return node.data?.color || tokens.colors.node.border;
            }}
          />
        </Panel>
        
        {/* Canvas Toolbar (Requirement 3.6) */}
        <Panel position="top-right" className={styles.panel}>
          <CanvasToolbar 
            position="top-right"
            showZoomLevel={true}
            showResetButton={true}
            showFitViewButton={true}
            showZoomControls={true}
          />
        </Panel>

        {/* Alignment Toolbar (Requirement 3.5, 10.2) */}
        <Panel position="top-center" className={styles.panel}>
          <AlignmentToolbar position="top-center" />
        </Panel>

        {/* Multi-Selection Toolbar (Requirement 10.3) */}
        {selectedNodes.length > 0 && (
          <Panel position="top-left" className={styles.panel}>
            <MultiSelectionToolbar selectedNodes={selectedNodes} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
