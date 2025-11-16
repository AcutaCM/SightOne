'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input, Textarea } from "@heroui/input";
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  multiline?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  description?: string;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
}

const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  onBlur,
  multiline = false,
  autoFocus = false,
  placeholder,
  description,
  maxLength,
  minRows = 3,
  maxRows = 8
}) => {
  const theme = useWorkflowTheme();
  const [localValue, setLocalValue] = useState<string>(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy replacement
      if ('select' in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setLocalValue(value || '');
      if (onBlur) {
        onBlur();
      }
    }
    // For single-line input, Enter should trigger blur
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
  };

  const characterCount = maxLength ? `${localValue.length}/${maxLength}` : null;

  // 应用主题颜色的样式
  const inputWrapperStyle = {
    backgroundColor: isFocused ? theme.parameter.bgEditing : theme.parameter.bg,
    borderColor: isFocused ? theme.parameter.borderEditing : theme.parameter.border,
    boxShadow: isFocused ? `0 0 0 3px ${theme.parameter.editingGlow}` : 'none',
    transition: 'all 0.2s ease',
  };

  if (multiline) {
    return (
      <div className="text-editor">
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          description={description}
          maxLength={maxLength}
          minRows={minRows}
          maxRows={maxRows}
          classNames={{
            input: "transition-colors duration-200",
            inputWrapper: "border transition-all duration-200 hover:border-[var(--param-border-hover)]"
          }}
          style={{
            backgroundColor: inputWrapperStyle.backgroundColor,
            borderColor: inputWrapperStyle.borderColor,
            boxShadow: inputWrapperStyle.boxShadow,
            color: theme.text.primary,
          }}
        />
        {characterCount && (
          <div 
            className="text-xs mt-1 text-right transition-colors duration-200"
            style={{ color: theme.text.tertiary }}
          >
            {characterCount}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-editor">
      <Input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        description={description}
        maxLength={maxLength}
        classNames={{
          input: "transition-colors duration-200",
          inputWrapper: "border transition-all duration-200 hover:border-[var(--param-border-hover)]"
        }}
        style={{
          backgroundColor: inputWrapperStyle.backgroundColor,
          borderColor: inputWrapperStyle.borderColor,
          boxShadow: inputWrapperStyle.boxShadow,
          color: theme.text.primary,
        }}
      />
      {characterCount && (
        <div 
          className="text-xs mt-1 text-right transition-colors duration-200"
          style={{ color: theme.text.tertiary }}
        >
          {characterCount}
        </div>
      )}
    </div>
  );
};

export default TextEditor;
