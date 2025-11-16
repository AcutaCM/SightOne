'use client';

import React, { useState, useMemo } from 'react';
import { Input } from "@heroui/input";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { nodeRegistry, nodeCategories } from '@/lib/workflow/nodeRegistry';
import { WorkflowNodeDefinition } from '@/lib/workflow/nodeDefinitions';
import { listItemAnimation, panelAnimation } from '@/lib/workflow/animations';
import styles from '@/styles/WorkflowDesignSystem.module.css';

interface EnhancedNodeLibraryV2Props {
  className?: string;
  onNodeDragStart?: (event: React.DragEvent, node: WorkflowNodeDefinition) => void;
  isVisible?: boolean;
}

const EnhancedNodeLibraryV2: React.FC<EnhancedNodeLibraryV2Props> = ({ 
  className = '',
  onNodeDragStart,
  isVisible = true,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['flow', 'basic', 'movement'])
  );

  // Filter nodes based on search
  const filteredNodesByCategory = useMemo(() => {
    const result: Record<string, WorkflowNodeDefinition[]> = {};
    
    nodeCategories.forEach(category => {
      if (category.key === 'all') return;
      
      let nodes = nodeRegistry.getNodesByCategory(category.key as any);
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        nodes = nodes.filter(node => 
          node.label.toLowerCase().includes(query) ||
          node.description.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query)
        );
      }
      
      if (nodes.length > 0) {
        result[category.key] = nodes;
      }
    });
    
    return result;
  }, [searchQuery]);

  const totalNodes = useMemo(() => {
    return Object.values(filteredNodesByCategory).reduce((sum, nodes) => sum + nodes.length, 0);
  }, [filteredNodesByCategory]);

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

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className={`${styles.nodeLibrary} ${className}`}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={panelAnimation}
    >
      {/* Header */}
      <div className={styles.nodeLibraryHeader}>
        <h3 className={styles.nodeLibraryTitle}>节点库</h3>
        
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
          isClearable
          onClear={() => setSearchQuery('')}
        />
      </div>

      {/* Node List with Collapsible Categories */}
      <ScrollShadow className={styles.nodeList}>
        {Object.keys(filteredNodesByCategory).length === 0 ? (
          <div className={styles.emptyState}>
            <Search size={48} className={styles.emptyStateIcon} />
            <p className={styles.emptyStateText}>未找到匹配的节点</p>
          </div>
        ) : (
          <div className="space-y-2">
            {nodeCategories
              .filter(cat => cat.key !== 'all' && filteredNodesByCategory[cat.key])
              .map((category) => {
                const IconComponent = category.icon;
                const isExpanded = expandedCategories.has(category.key);
                const nodes = filteredNodesByCategory[category.key] || [];

                return (
                  <div key={category.key} className="mb-3">
                    {/* Category Header */}
                    <motion.div
                      className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-content2 transition-colors"
                      onClick={() => toggleCategory(category.key)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight size={16} className="text-default-400" />
                        </motion.div>
                        <IconComponent size={16} style={{ color: category.color }} />
                        <span className="text-sm font-medium text-foreground">
                          {category.label}
                        </span>
                        <Chip size="sm" variant="flat" className="ml-auto">
                          {nodes.length}
                        </Chip>
                      </div>
                    </motion.div>

                    {/* Category Nodes */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 mt-2 ml-6">
                            {nodes.map((node, index) => {
                              const NodeIcon = node.icon;
                              
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
                                  >
                                    <motion.div
                                      custom={index}
                                      initial="hidden"
                                      animate="visible"
                                      variants={listItemAnimation}
                                      className={styles.nodeItem}
                                      style={{
                                        borderLeft: `3px solid ${node.color}`
                                      }}
                                      whileHover={{ 
                                        scale: 1.02,
                                        x: 4,
                                        transition: { duration: 0.15 }
                                      }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <div className={styles.nodeItemIcon}>
                                        <NodeIcon size={20} style={{ color: node.color }} />
                                      </div>
                                      <div className={styles.nodeItemContent}>
                                        <div className={styles.nodeItemLabel}>
                                          {node.label}
                                        </div>
                                        <div className={styles.nodeItemDescription}>
                                          {node.description}
                                        </div>
                                      </div>
                                    </motion.div>
                                  </div>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
          </div>
        )}
      </ScrollShadow>

      {/* Footer Stats */}
      <div className={styles.nodeLibraryFooter}>
        <div className={styles.nodeLibraryStats}>
          <span>显示 {totalNodes} 个节点</span>
          <span>共 {nodeRegistry.getAllNodes().length} 个</span>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedNodeLibraryV2;
