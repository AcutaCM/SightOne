'use client';

import React, { useState, useEffect } from 'react';
import { Slider } from "@heroui/slider";
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

interface SliderEditorProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  autoFocus?: boolean;
  description?: string;
  marks?: Array<{ value: number; label: string }>;
  showValue?: boolean;
}

const SliderEditor: React.FC<SliderEditorProps> = ({
  value,
  onChange,
  onBlur,
  min = 0,
  max = 100,
  step = 1,
  unit,
  autoFocus = false,
  description,
  marks,
  showValue = true
}) => {
  const theme = useWorkflowTheme();
  const [localValue, setLocalValue] = useState<number>(value);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    // Auto-blur after a short delay if autoFocus is true
    if (autoFocus && onBlur) {
      const timer = setTimeout(() => {
        onBlur();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, onBlur]);

  const handleChange = (val: number | number[]) => {
    const newValue = Array.isArray(val) ? val[0] : val;
    setLocalValue(newValue);
    onChange(newValue);
    setIsDragging(true);
  };

  const handleChangeEnd = (val: number | number[]) => {
    const newValue = Array.isArray(val) ? val[0] : val;
    setLocalValue(newValue);
    onChange(newValue);
    setIsDragging(false);
    
    // Trigger blur after change is complete
    if (onBlur) {
      setTimeout(() => {
        onBlur();
      }, 100);
    }
  };

  const formatValue = (val: number): string => {
    return unit ? `${val}${unit}` : val.toString();
  };

  return (
    <div className="slider-editor">
      {showValue && (
        <div className="flex justify-between items-center mb-2">
          <span 
            className="text-xs transition-colors duration-200"
            style={{ color: theme.text.secondary }}
          >
            当前值: <span 
              className="font-medium font-mono transition-colors duration-200"
              style={{ color: theme.text.primary }}
            >
              {formatValue(localValue)}
            </span>
          </span>
          <span 
            className="text-xs transition-colors duration-200"
            style={{ color: theme.text.tertiary }}
          >
            范围: {formatValue(min)} - {formatValue(max)}
          </span>
        </div>
      )}
      
      <Slider
        size="sm"
        step={step}
        minValue={min}
        maxValue={max}
        value={localValue}
        onChange={handleChange}
        onChangeEnd={handleChangeEnd}
        marks={marks}
        classNames={{
          track: "transition-colors duration-200",
          filler: "transition-all duration-200",
          thumb: isDragging 
            ? "scale-110 shadow-lg transition-all duration-200" 
            : "transition-all duration-200",
          mark: "text-xs transition-colors duration-200"
        }}
        style={{
          '--slider-track-bg': theme.parameter.bg,
          '--slider-filler-bg': isDragging ? theme.node.selected : theme.text.secondary,
          '--slider-thumb-bg': theme.node.selected,
          '--slider-thumb-shadow': isDragging ? `0 0 12px ${theme.node.selectedGlow}` : 'none',
        } as React.CSSProperties}
      />
      
      {description && (
        <p 
          className="text-xs mt-2 transition-colors duration-200"
          style={{ color: theme.text.tertiary }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SliderEditor;
