// Enhanced Node Library Component
'use client';

import React, { useState, useMemo } from 'react';
import { Input } from "@heroui/input";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Search } from 'lucide-react';
import { nodeRegistry, nodeCategories } from '@/lib/workflow/nodeRegistry';
import { WorkflowNodeDefinition } from '@/lib/workflow/nodeDefinitions';
import NodeIcon from './NodeIcon';

interface EnhancedNodeLibraryProps {
  className?: string;
  onNodeDragStart?: (event: React.DragEvent, node: WorkflowNodeDefinition) => void;
}

const EnhancedNodeLibrary: React.FC<EnhancedNodeLibraryProps> = ({ 
  className = '',
  onNodeDragStart
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter nodes based on category and search
  const filteredNodes = useMemo(() => {
    let nodes = nodeRegistry.getNodesByCategory(selectedCategory as any);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      nodes = nodes.filter(node => 
        node.label.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query)
      );
    }
    
    return nodes;
  }, [selectedCategory, searchQuery]);

  const handleDragStart = (event: React.DragEvent, node: WorkflowNodeDefinition) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ 
        type: node.type, 
        label: node.label,
        category: node.category,
        color: node.color
      })
    );
    event.dataTransfer.effectAllowed = 'move';
    
    if (onNodeDragStart) {
      onNodeDragStart(event, node);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-content1 border-r border-divider ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-divider">
        <h3 className="text-lg font-semibold text-foreground mb-3">节点库</h3>
        
        {/* Search */}
        <Input
          placeholder="搜索节点..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<Search size={18} className="text-default-400" />}
          size="sm"
          classNames={{
            input: "text-sm",
            inputWrapper: "bg-content2"
          }}
        />
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-3 border-b border-divider">
        <ScrollShadow 
          orientation="horizontal" 
          className="flex gap-2 overflow-x-auto pb-2"
          hideScrollBar
        >
          {nodeCategories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.key;
            
            return (
              <Chip
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                variant={isSelected ? "solid" : "flat"}
                color={isSelected ? "primary" : "default"}
                size="sm"
                startContent={<IconComponent size={14} />}
                className="cursor-pointer whitespace-nowrap"
                style={isSelected ? { backgroundColor: category.color } : {}}
              >
                {category.label}
              </Chip>
            );
          })}
        </ScrollShadow>
      </div>

      {/* Node List */}
      <ScrollShadow className="flex-1 p-4">
        <div className="space-y-2">
          {filteredNodes.length === 0 ? (
            <div className="text-center text-default-400 py-8">
              <p>未找到匹配的节点</p>
            </div>
          ) : (
            filteredNodes.map((node) => {
              const IconComponent = node.icon;
              
              return (
                <Tooltip
                  key={node.type}
                  content={
                    <div className="px-1 py-2 max-w-xs">
                      <div className="text-small font-bold">{node.label}</div>
                      <div className="text-tiny mt-1">{node.description}</div>
                      {node.parameters.length > 0 && (
                        <div className="text-tiny mt-2 text-default-400">
                          参数: {node.parameters.length}个
                        </div>
                      )}
                    </div>
                  }
                  placement="right"
                  delay={500}
                >
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, node)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-content2 hover:bg-content3 cursor-grab active:cursor-grabbing transition-all hover:scale-105 hover:shadow-md"
                    style={{
                      borderLeft: `3px solid ${node.color}`
                    }}
                  >
                    <NodeIcon 
                      icon={IconComponent} 
                      color={node.color} 
                      size={20}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {node.label}
                      </div>
                      <div className="text-xs text-default-400 truncate">
                        {node.description}
                      </div>
                    </div>
                  </div>
                </Tooltip>
              );
            })
          )}
        </div>
      </ScrollShadow>

      {/* Footer Stats */}
      <div className="p-4 border-t border-divider">
        <div className="flex items-center justify-between text-xs text-default-400">
          <span>显示 {filteredNodes.length} 个节点</span>
          <span>共 {nodeRegistry.getAllNodes().length} 个</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedNodeLibrary;
