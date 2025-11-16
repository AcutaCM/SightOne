'use client';

import React, { useState } from 'react';
import { Plane } from 'lucide-react';
import NodeHeader from './NodeHeader';
import EnhancedNodeConfigModal from '../EnhancedNodeConfigModal';

/**
 * NodeHeaderExample组件
 * 
 * 演示如何使用NodeHeader组件并集成EnhancedNodeConfigModal
 * 
 * 功能展示：
 * 1. 折叠/展开参数区域
 * 2. 显示参数数量徽章
 * 3. 显示错误警告图标
 * 4. 点击高级设置按钮打开配置模态框
 * 
 * @example
 * ```tsx
 * // 在InlineParameterNode中使用
 * <NodeHeaderExample />
 * ```
 */
const NodeHeaderExample: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeConfig, setNodeConfig] = useState({
    id: 'node-1',
    type: 'takeoff',
    label: '起飞',
    parameters: {
      height: 100,
      speed: 50,
    },
  });

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleOpenAdvanced = () => {
    setIsModalOpen(true);
  };

  const handleSaveConfig = (config: any) => {
    setNodeConfig(config);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 计算参数数量
  const parameterCount = Object.keys(nodeConfig.parameters).length;

  // 检查是否有错误（示例：检查必填参数）
  const hasErrors = !nodeConfig.parameters.height || nodeConfig.parameters.height < 20;

  return (
    <div style={{ width: '300px', background: '#1E3A5F', borderRadius: '8px' }}>
      <NodeHeader
        icon={Plane}
        label={nodeConfig.label}
        color="#64FFDA"
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onOpenAdvanced={handleOpenAdvanced}
        parameterCount={parameterCount}
        hasErrors={hasErrors}
      />

      {/* 参数区域（折叠时隐藏） */}
      {!isCollapsed && (
        <div style={{ padding: '12px' }}>
          <div style={{ color: '#E6F1FF', fontSize: '12px' }}>
            <div>高度: {nodeConfig.parameters.height} cm</div>
            <div>速度: {nodeConfig.parameters.speed} cm/s</div>
          </div>
        </div>
      )}

      {/* 高级设置模态框 */}
      <EnhancedNodeConfigModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        nodeConfig={nodeConfig}
        onSave={handleSaveConfig}
      />
    </div>
  );
};

export default NodeHeaderExample;
