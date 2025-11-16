'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Divider } from "@heroui/divider";
import { Select, SelectItem } from "@heroui/select";
import { useTheme } from "next-themes";
import toast from 'react-hot-toast';
import { Search, Upload, Download, Trash2, Play, Calendar, Layers, Link2, Filter, Copy, AlertCircle } from 'lucide-react';
import { getWorkflowStorageManager, WorkflowDefinition } from '../lib/workflow/workflowStorage';
import { getModalPanelStyle } from '@/lib/panel-styles';

interface SavedWorkflow {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  timestamp: string;
  nodeCount: number;
  edgeCount: number;
  version?: string;
  tags?: string[];
}

interface WorkflowManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadWorkflow: (workflow: SavedWorkflow) => void;
}

type SortOption = 'name' | 'date' | 'nodes' | 'edges';
type FilterOption = 'all' | 'small' | 'medium' | 'large';

const WorkflowManagerModal: React.FC<WorkflowManagerModalProps> = ({
  isOpen,
  onClose,
  onLoadWorkflow
}) => {
  const { theme, resolvedTheme } = useTheme();
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<SavedWorkflow | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  useEffect(() => {
    if (isOpen) {
      loadSavedWorkflows();
    }
  }, [isOpen]);

  const loadSavedWorkflows = () => {
    try {
      const storageManager = getWorkflowStorageManager();
      const workflows = storageManager.getAllWorkflows();
      
      // Convert to SavedWorkflow format for compatibility
      const savedWorkflows = workflows.map(w => ({
        id: w.metadata.id,
        name: w.metadata.name,
        description: w.metadata.description,
        nodes: w.nodes,
        edges: w.edges,
        timestamp: w.metadata.updatedAt || w.metadata.createdAt,
        nodeCount: w.metadata.nodeCount,
        edgeCount: w.metadata.edgeCount,
        version: w.metadata.version,
        tags: w.metadata.tags
      }));
      
      setSavedWorkflows(savedWorkflows);
    } catch (error) {
      console.error('加载工作流失败:', error);
      toast.error('加载保存的工作流失败');
    }
  };

  const deleteWorkflow = (workflowId: string) => {
    try {
      const storageManager = getWorkflowStorageManager();
      const success = storageManager.deleteWorkflow(workflowId);
      
      if (success) {
        setSavedWorkflows(prev => prev.filter(w => w.id !== workflowId));
        if (selectedWorkflow?.id === workflowId) {
          setSelectedWorkflow(null);
        }
        toast.success('工作流已删除');
      } else {
        toast.error('删除工作流失败');
      }
    } catch (error) {
      console.error('删除工作流失败:', error);
      toast.error('删除工作流失败');
    }
  };

  const handleLoadWorkflow = (workflow: SavedWorkflow) => {
    onLoadWorkflow(workflow);
    onClose();
    toast.success(`已加载工作流: ${workflow.name}`);
  };

  const exportWorkflow = (workflow: SavedWorkflow) => {
    try {
      const storageManager = getWorkflowStorageManager();
      const fullWorkflow = storageManager.loadWorkflow(workflow.id);
      
      if (!fullWorkflow) {
        toast.error('无法加载工作流');
        return;
      }
      
      storageManager.exportWorkflow(fullWorkflow);
      toast.success('工作流已导出');
    } catch (error) {
      console.error('导出工作流失败:', error);
      toast.error('导出工作流失败');
    }
  };

  const duplicateWorkflow = (workflow: SavedWorkflow) => {
    try {
      const storageManager = getWorkflowStorageManager();
      const duplicate = storageManager.duplicateWorkflow(workflow.id);
      
      if (duplicate) {
        loadSavedWorkflows();
        toast.success(`已创建副本: ${duplicate.metadata.name}`);
      } else {
        toast.error('复制工作流失败');
      }
    } catch (error) {
      console.error('复制工作流失败:', error);
      toast.error('复制工作流失败');
    }
  };

  const importWorkflow = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const storageManager = getWorkflowStorageManager();
      const workflow = await storageManager.importWorkflow(file);
      
      // Validate workflow
      const validation = storageManager.validateWorkflow(workflow);
      
      if (!validation.valid) {
        toast.error(`工作流验证失败: ${validation.errors.join(', ')}`);
        return;
      }
      
      if (validation.warnings.length > 0) {
        console.warn('工作流警告:', validation.warnings);
        toast((t) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-yellow-500" />
              <span>工作流导入成功，但有警告</span>
            </div>
            <ul className="text-sm text-gray-600 ml-6">
              {validation.warnings.map((warning, i) => (
                <li key={i}>• {warning}</li>
              ))}
            </ul>
          </div>
        ), { duration: 5000 });
      }
      
      // Save workflow
      const success = storageManager.saveWorkflow(workflow);
      
      if (success) {
        loadSavedWorkflows();
        toast.success(`工作流导入成功: ${workflow.metadata.name}`);
      } else {
        toast.error('保存工作流失败');
      }
    } catch (error: any) {
      console.error('导入工作流失败:', error);
      toast.error(error.message || '导入工作流失败，请检查文件格式');
    }
    
    // Reset file input
    event.target.value = '';
  };

  // Filter workflows by size
  const filterWorkflows = (workflows: SavedWorkflow[]) => {
    if (filterBy === 'all') return workflows;
    
    return workflows.filter(workflow => {
      const nodeCount = workflow.nodeCount;
      switch (filterBy) {
        case 'small': return nodeCount <= 5;
        case 'medium': return nodeCount > 5 && nodeCount <= 15;
        case 'large': return nodeCount > 15;
        default: return true;
      }
    });
  };

  // Sort workflows
  const sortWorkflows = (workflows: SavedWorkflow[]) => {
    return [...workflows].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'nodes':
          return b.nodeCount - a.nodeCount;
        case 'edges':
          return b.edgeCount - a.edgeCount;
        default:
          return 0;
      }
    });
  };

  // Search workflows
  const searchWorkflows = (workflows: SavedWorkflow[]) => {
    if (!searchQuery) return workflows;
    
    const query = searchQuery.toLowerCase();
    return workflows.filter(workflow =>
      workflow.name.toLowerCase().includes(query) ||
      (workflow.description && workflow.description.toLowerCase().includes(query)) ||
      (workflow.tags && workflow.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  };

  // Apply all filters
  const filteredWorkflows = sortWorkflows(filterWorkflows(searchWorkflows(savedWorkflows)));

  const modalStyle = useMemo(() => {
    const currentTheme = (theme || resolvedTheme) as 'light' | 'dark' | undefined;
    return getModalPanelStyle(currentTheme === 'light' ? 'light' : 'dark');
  }, [theme, resolvedTheme]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="4xl"
    >
      <ModalContent style={modalStyle}>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">工作流管理器</h3>
          <p className="text-sm text-gray-500">管理已保存的 Tello 工作流</p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* 搜索和操作栏 */}
            <div className="flex gap-2">
              <Input
                placeholder="搜索工作流名称、描述或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                startContent={<Search size={18} className="text-gray-400" />}
                isClearable
                onClear={() => setSearchQuery('')}
              />
              <Button
                color="primary"
                variant="bordered"
                onPress={() => document.getElementById('import-input')?.click()}
                startContent={<Upload size={18} />}
              >
                导入
              </Button>
              <input
                id="import-input"
                type="file"
                accept=".json"
                onChange={importWorkflow}
                style={{ display: 'none' }}
              />
            </div>

            {/* 过滤和排序栏 */}
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2 flex-1">
                <Filter size={18} className="text-gray-500" />
                <Select
                  label="过滤"
                  size="sm"
                  selectedKeys={[filterBy]}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="max-w-xs"
                >
                  <SelectItem key="all">全部工作流</SelectItem>
                  <SelectItem key="small">小型 (≤5节点)</SelectItem>
                  <SelectItem key="medium">中型 (6-15节点)</SelectItem>
                  <SelectItem key="large">大型 (&gt;15节点)</SelectItem>
                </Select>
                
                <Select
                  label="排序"
                  size="sm"
                  selectedKeys={[sortBy]}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="max-w-xs"
                >
                  <SelectItem key="date">按日期</SelectItem>
                  <SelectItem key="name">按名称</SelectItem>
                  <SelectItem key="nodes">按节点数</SelectItem>
                  <SelectItem key="edges">按连接数</SelectItem>
                </Select>
              </div>
              
              <div className="text-sm text-gray-500">
                共 {filteredWorkflows.length} 个工作流
              </div>
            </div>

            {/* 工作流列表 */}
            <ScrollShadow className="h-96">
              {filteredWorkflows.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-folder-open text-4xl mb-4"></i>
                  <p>暂无保存的工作流</p>
                  <p className="text-sm">创建并保存工作流后，它们将显示在这里</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWorkflows.map((workflow) => (
                    <Card 
                      key={workflow.id} 
                      className={`cursor-pointer transition-all ${
                        selectedWorkflow?.id === workflow.id 
                          ? 'border-primary bg-primary/10' 
                          : 'hover:bg-gray-50'
                      }`}
                      isPressable
                      onPress={() => setSelectedWorkflow(workflow)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start w-full">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{workflow.name}</h4>
                            {workflow.description && (
                              <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="light"
                              color="primary"
                              onPress={() => handleLoadWorkflow(workflow)}
                              startContent={<Play size={16} />}
                            >
                              加载
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              color="default"
                              onPress={() => duplicateWorkflow(workflow)}
                              startContent={<Copy size={16} />}
                            >
                              复制
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              color="secondary"
                              onPress={() => exportWorkflow(workflow)}
                              startContent={<Download size={16} />}
                            >
                              导出
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => deleteWorkflow(workflow.id)}
                              startContent={<Trash2 size={16} />}
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Layers size={14} />
                            <span>{workflow.nodeCount} 个节点</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Link2 size={14} />
                            <span>{workflow.edgeCount} 个连接</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(workflow.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {/* 标签 */}
                        {workflow.tags && workflow.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {workflow.tags.map((tag, index) => (
                              <Chip key={index} size="sm" variant="flat" color="secondary">
                                {tag}
                              </Chip>
                            ))}
                          </div>
                        )}
                        
                        {/* 节点预览 */}
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {workflow.nodes.slice(0, 8).map((node, index) => (
                              <Chip key={index} size="sm" variant="flat" color="primary">
                                {node.data.label}
                              </Chip>
                            ))}
                            {workflow.nodes.length > 8 && (
                              <Chip size="sm" variant="flat" color="default">
                                +{workflow.nodes.length - 8} 更多
                              </Chip>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollShadow>

            {/* 选中工作流的详细信息 */}
            {selectedWorkflow && (
              <>
                <Divider />
                <div className="space-y-2">
                  <h5 className="font-semibold">工作流详情</h5>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong>名称:</strong> {selectedWorkflow.name}</div>
                      <div><strong>创建时间:</strong> {new Date(selectedWorkflow.timestamp).toLocaleString()}</div>
                      <div><strong>节点数量:</strong> {selectedWorkflow.nodeCount}</div>
                      <div><strong>连接数量:</strong> {selectedWorkflow.edgeCount}</div>
                    </div>
                    {selectedWorkflow.description && (
                      <div className="mt-2">
                        <strong>描述:</strong> {selectedWorkflow.description}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            关闭
          </Button>
          {selectedWorkflow && (
            <Button 
              color="primary" 
              onPress={() => handleLoadWorkflow(selectedWorkflow)}
              startContent={<Play size={18} />}
            >
              加载选中的工作流
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WorkflowManagerModal;