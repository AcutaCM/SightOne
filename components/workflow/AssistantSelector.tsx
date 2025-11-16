'use client';

import React, { useMemo } from 'react';
import { Select, SelectItem } from "@heroui/select";
import { useAssistants } from '@/contexts/AssistantContext';

interface AssistantSelectorProps {
  value: string;
  onChange: (assistantId: string) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
}

/**
 * Assistant Selector Component
 * 
 * Displays a dropdown of published assistants from AssistantContext
 * Shows assistant emoji, title, and description
 */
const AssistantSelector: React.FC<AssistantSelectorProps> = ({
  value,
  onChange,
  label = 'AI助理',
  description = '选择要使用的AI助理',
  placeholder = '请选择助理',
  isRequired = false,
  isDisabled = false,
}) => {
  const { publishedAssistants } = useAssistants();

  // Format assistants for Select component
  const assistantOptions = useMemo(() => {
    return publishedAssistants.map(assistant => ({
      key: assistant.id,
      label: `${assistant.emoji} ${assistant.title}`,
      description: assistant.desc,
      tags: assistant.tags || [],
    }));
  }, [publishedAssistants]);

  const handleSelectionChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0] as string;
    if (selectedKey) {
      onChange(selectedKey);
    }
  };

  // Find selected assistant for display
  const selectedAssistant = useMemo(() => {
    return publishedAssistants.find(a => a.id === value);
  }, [publishedAssistants, value]);

  return (
    <div className="space-y-2">
      <Select
        label={label}
        placeholder={placeholder}
        description={description}
        selectedKeys={value ? [value] : []}
        onSelectionChange={handleSelectionChange}
        isRequired={isRequired}
        isDisabled={isDisabled}
        classNames={{
          trigger: "min-h-12",
          value: "text-sm",
        }}
        renderValue={() => {
          if (!selectedAssistant) return placeholder;
          return (
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedAssistant.emoji}</span>
              <span className="text-sm">{selectedAssistant.title}</span>
            </div>
          );
        }}
      >
        {assistantOptions.map((option) => (
          <SelectItem
            key={option.key}
            textValue={option.label}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{option.label}</span>
              </div>
              {option.description && (
                <span className="text-xs text-gray-500 line-clamp-2">
                  {option.description}
                </span>
              )}
              {option.tags && option.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {option.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </SelectItem>
        ))}
      </Select>

      {/* Show selected assistant details */}
      {selectedAssistant && (
        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
          <div className="flex items-start gap-2">
            <span className="text-2xl">{selectedAssistant.emoji}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white">
                {selectedAssistant.title}
              </h4>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {selectedAssistant.desc}
              </p>
              {selectedAssistant.tags && selectedAssistant.tags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {selectedAssistant.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No assistants available warning */}
      {publishedAssistants.length === 0 && (
        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <p className="text-xs text-yellow-400">
            ⚠️ 没有可用的AI助理。请先在助理市场中发布助理。
          </p>
        </div>
      )}
    </div>
  );
};

export default AssistantSelector;
