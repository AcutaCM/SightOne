/**
 * NodePresets Component
 * 
 * Wrapper component for preset template selection in the node editor.
 * Provides a simplified interface for applying preset parameter configurations.
 * 
 * Features:
 * - Preset template cards with descriptions
 * - One-click preset application
 * - Parameter preview
 * - Category-based organization
 * 
 * Requirements: 6.5
 */

'use client';

import React from 'react';
import NodePresetSelector from './NodePresetSelector';

export interface NodePresetsProps {
  /** Node type to show presets for */
  nodeType: string;
  
  /** Current parameter values */
  currentParameters: Record<string, any>;
  
  /** Callback when a preset is applied */
  onApply: (preset: Record<string, any>) => void;
}

/**
 * NodePresets Component
 * 
 * Displays and manages preset templates for node parameters.
 * Wraps the existing NodePresetSelector component for use in the new NodeEditor.
 */
const NodePresets: React.FC<NodePresetsProps> = ({
  nodeType,
  currentParameters,
  onApply,
}) => {
  return (
    <NodePresetSelector
      nodeType={nodeType}
      currentParameters={currentParameters}
      onApplyPreset={onApply}
    />
  );
};

export default NodePresets;
