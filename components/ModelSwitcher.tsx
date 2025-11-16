'use client';

/**
 * 模型切换器 - 紧凑型组件
 * 可以嵌入到任何页面的模型快速切换
 */

import React from 'react';
import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import Link from 'next/link';
import { useYOLOModels } from '@/hooks/useYOLOModels';

interface ModelSwitcherProps {
  className?: string;
  showManageButton?: boolean;
}

export default function ModelSwitcher({ 
  className = '', 
  showManageButton = true 
}: ModelSwitcherProps) {
  const { models, activeModel, loading, switchModel } = useYOLOModels();

  const handleModelChange = (value: string) => {
    if (value && value !== activeModel?.id) {
      switchModel(value);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 min-w-[200px]">
        <Select
          label="检测模型"
          placeholder="选择模型"
          selectedKeys={activeModel ? [activeModel.id] : []}
          onChange={(e) => handleModelChange(e.target.value)}
          isLoading={loading}
          size="sm"
          classNames={{
            trigger: "h-10"
          }}
        >
          {models.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              textValue={model.name}
            >
              <div className="flex justify-between items-center">
                <span>{model.name}</span>
                {model.is_default && (
                  <Chip size="sm" color="primary" variant="flat">默认</Chip>
                )}
              </div>
            </SelectItem>
          ))}
        </Select>
      </div>

      {activeModel && (
        <div className="flex items-center gap-2">
          <Chip size="sm" color="success" variant="flat">
            {activeModel.type === 'strawberry' ? '🍓 草莓' : '🎯 检测'}
          </Chip>
          <Chip size="sm" variant="bordered">
            {activeModel.classes.length} 类
          </Chip>
        </div>
      )}

      {showManageButton && (
        <Link href="/model-manager">
          <Button size="sm" variant="bordered">
            管理
          </Button>
        </Link>
      )}
    </div>
  );
}










