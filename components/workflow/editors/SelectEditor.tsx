'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectItem } from "@heroui/select";
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

interface SelectOption {
  label: string;
  value: any;
}

interface SelectEditorProps {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  options: SelectOption[];
  autoFocus?: boolean;
  placeholder?: string;
  description?: string;
  searchable?: boolean;
}

const SelectEditor: React.FC<SelectEditorProps> = ({
  value,
  onChange,
  onBlur,
  options,
  autoFocus = false,
  placeholder,
  description,
  searchable = true
}) => {
  const theme = useWorkflowTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (autoFocus) {
      setIsOpen(true);
    }
  }, [autoFocus]);

  const handleSelectionChange = (keys: any) => {
    const selectedValue = Array.from(keys)[0];
    onChange(selectedValue);
    setIsOpen(false);
    if (onBlur) {
      onBlur();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onBlur) {
      onBlur();
    }
  };

  // Filter options based on search query
  const filteredOptions = searchable && searchQuery
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Get the selected option label
  const selectedOption = options.find(opt => opt.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : '';

  return (
    <div className="select-editor">
      <Select
        selectedKeys={value !== undefined && value !== null ? [value] : []}
        onSelectionChange={handleSelectionChange}
        onOpenChange={handleOpenChange}
        isOpen={isOpen}
        placeholder={placeholder || '请选择...'}
        description={description}
        aria-label="Select option"
        classNames={{
          trigger: "border transition-all duration-200 hover:border-[var(--param-border-hover)]",
          value: "transition-colors duration-200",
          popoverContent: "border transition-all duration-200"
        }}
        style={{
          '--select-trigger-bg': isOpen ? theme.parameter.bgEditing : theme.parameter.bg,
          '--select-trigger-border': isOpen ? theme.parameter.borderEditing : theme.parameter.border,
          '--select-trigger-shadow': isOpen ? `0 0 0 3px ${theme.parameter.editingGlow}` : 'none',
          '--select-value-color': theme.text.primary,
          '--select-popover-bg': theme.node.bg,
          '--select-popover-border': theme.parameter.border,
        } as React.CSSProperties}
      >
        {filteredOptions.map((option) => (
          <SelectItem 
            key={option.value}
            classNames={{
              base: "transition-all duration-200"
            }}
            style={{
              color: theme.text.primary,
              backgroundColor: 'transparent',
            }}
          >
            {option.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default SelectEditor;
