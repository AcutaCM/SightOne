'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@heroui/input";
import { AlertCircle } from 'lucide-react';
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

interface NumberEditorProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  autoFocus?: boolean;
  placeholder?: string;
  description?: string;
}

const NumberEditor: React.FC<NumberEditorProps> = ({
  value,
  onChange,
  onBlur,
  min,
  max,
  step = 1,
  unit,
  autoFocus = false,
  placeholder,
  description
}) => {
  const theme = useWorkflowTheme();
  const [localValue, setLocalValue] = useState<string>(value?.toString() || '');
  const [error, setError] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  const validateNumber = (val: string): { valid: boolean; error?: string; number?: number } => {
    if (val === '' || val === '-') {
      return { valid: false, error: '请输入数字' };
    }

    const num = Number(val);
    
    if (isNaN(num)) {
      return { valid: false, error: '必须是有效的数字' };
    }

    if (min !== undefined && num < min) {
      return { valid: false, error: `值不能小于 ${min}` };
    }

    if (max !== undefined && num > max) {
      return { valid: false, error: `值不能大于 ${max}` };
    }

    return { valid: true, number: num };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Real-time validation
    const validation = validateNumber(newValue);
    if (validation.valid && validation.number !== undefined) {
      setError('');
      onChange(validation.number);
    } else {
      setError(validation.error || '');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const validation = validateNumber(localValue);
    
    if (!validation.valid) {
      // Revert to previous valid value
      setLocalValue(value?.toString() || '');
      setError('');
    } else if (validation.number !== undefined) {
      // Ensure the value is properly formatted
      setLocalValue(validation.number.toString());
      onChange(validation.number);
      setError('');
    }

    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setLocalValue(value?.toString() || '');
      setError('');
      if (onBlur) {
        onBlur();
      }
    }
  };

  const getInputProps = () => {
    const props: any = {
      type: 'number',
      step: step,
    };

    if (min !== undefined) props.min = min;
    if (max !== undefined) props.max = max;

    return props;
  };

  // 应用主题颜色的样式 - 使用等宽字体
  const inputWrapperStyle = {
    backgroundColor: error 
      ? theme.parameter.bgError 
      : (isFocused ? theme.parameter.bgEditing : theme.parameter.bg),
    borderColor: error 
      ? theme.status.error 
      : (isFocused ? theme.parameter.borderEditing : theme.parameter.border),
    boxShadow: isFocused && !error ? `0 0 0 3px ${theme.parameter.editingGlow}` : 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <div className="number-editor">
      <Input
        ref={inputRef}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        isInvalid={!!error}
        errorMessage={error}
        description={description}
        endContent={unit && (
          <span 
            className="text-xs transition-colors duration-200"
            style={{ color: theme.text.tertiary }}
          >
            {unit}
          </span>
        )}
        classNames={{
          input: "font-mono transition-colors duration-200",
          inputWrapper: "border transition-all duration-200 hover:border-[var(--param-border-hover)]"
        }}
        style={{
          backgroundColor: inputWrapperStyle.backgroundColor,
          borderColor: inputWrapperStyle.borderColor,
          boxShadow: inputWrapperStyle.boxShadow,
          color: theme.text.primary,
          fontFamily: 'monospace',
        }}
        {...getInputProps()}
      />
      {error && (
        <div 
          className="flex items-center gap-1 mt-1 text-xs transition-colors duration-200"
          style={{ color: theme.status.error }}
        >
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default NumberEditor;
