'use client';

import React from 'react';
import { NodeParameter } from '@/lib/workflow/nodeDefinitions';
import NumberEditor from './NumberEditor';
import TextEditor from './TextEditor';
import SelectEditor from './SelectEditor';
import BooleanEditor from './BooleanEditor';
import SliderEditor from './SliderEditor';
import AssistantSelector from '../AssistantSelector';

interface ParameterEditorProps {
  parameter: NodeParameter;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  autoFocus?: boolean;
}

/**
 * ParameterEditor Component
 * 
 * 性能优化 (Requirements: 9.4):
 * - 使用React.memo避免不必要的重渲染
 */
const ParameterEditor: React.FC<ParameterEditorProps> = React.memo(({
  parameter,
  value,
  onChange,
  onBlur,
  autoFocus = false
}) => {
  switch (parameter.type) {
    case 'number':
      return (
        <NumberEditor
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          min={parameter.min}
          max={parameter.max}
          step={parameter.step}
          unit={(parameter as any).unit}
          autoFocus={autoFocus}
          placeholder={(parameter as any).placeholder}
          description={parameter.description}
        />
      );

    case 'string':
      return (
        <TextEditor
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          multiline={false}
          autoFocus={autoFocus}
          placeholder={(parameter as any).placeholder}
          description={parameter.description}
          maxLength={(parameter as any).maxLength}
        />
      );

    case 'textarea':
      return (
        <TextEditor
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          multiline={true}
          autoFocus={autoFocus}
          placeholder={(parameter as any).placeholder}
          description={parameter.description}
          maxLength={(parameter as any).maxLength}
          minRows={(parameter as any).minRows || 3}
          maxRows={(parameter as any).maxRows || 8}
        />
      );

    case 'boolean':
      return (
        <BooleanEditor
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          label={parameter.label}
          description={parameter.description}
          autoFocus={autoFocus}
        />
      );

    case 'select':
      return (
        <SelectEditor
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          options={parameter.options || []}
          autoFocus={autoFocus}
          placeholder={(parameter as any).placeholder}
          description={parameter.description}
        />
      );

    case 'slider':
      return (
        <SliderEditor
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          min={parameter.min || 0}
          max={parameter.max || 100}
          step={parameter.step || 1}
          unit={(parameter as any).unit}
          autoFocus={autoFocus}
          description={parameter.description}
          marks={(parameter as any).marks}
        />
      );

    case 'assistant':
      return (
        <div className="assistant-editor">
          <AssistantSelector
            value={value}
            onChange={onChange}
            isRequired={parameter.required}
          />
          {parameter.description && (
            <p className="text-xs text-gray-400 mt-2">{parameter.description}</p>
          )}
        </div>
      );

    default:
      // Fallback to text editor for unknown types
      return (
        <TextEditor
          value={value?.toString() || ''}
          onChange={onChange}
          onBlur={onBlur}
          autoFocus={autoFocus}
          placeholder={(parameter as any).placeholder}
          description={parameter.description}
        />
      );
  }
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 只在关键props变化时重新渲染 - Requirements: 9.4
  return (
    prevProps.parameter.name === nextProps.parameter.name &&
    prevProps.parameter.type === nextProps.parameter.type &&
    prevProps.value === nextProps.value &&
    prevProps.autoFocus === nextProps.autoFocus
  );
});

ParameterEditor.displayName = 'ParameterEditor';

export default ParameterEditor;
