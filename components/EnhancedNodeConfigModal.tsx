'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { useTheme } from "next-themes";
import { 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  BookOpen,
  Settings
} from 'lucide-react';
import { ParameterValidator } from '@/lib/workflow/nodeDefinitions';
import NodeParameterForm from './workflow/NodeParameterForm';
import NodePresetSelector from './workflow/NodePresetSelector';
import NodeDocumentation from './workflow/NodeDocumentation';
import { getModalPanelStyle } from '@/lib/panel-styles';

interface NodeConfig {
  id: string;
  type: string;
  label: string;
  parameters: Record<string, any>;
}

interface ValidationError {
  field: string;
  message: string;
}

interface EnhancedNodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeConfig: NodeConfig | null;
  onSave: (config: NodeConfig) => void;
}

const EnhancedNodeConfigModal: React.FC<EnhancedNodeConfigModalProps> = ({
  isOpen,
  onClose,
  nodeConfig,
  onSave
}) => {
  const { theme, resolvedTheme } = useTheme();
  const [config, setConfig] = useState<NodeConfig | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('parameters');

  useEffect(() => {
    if (nodeConfig) {
      setConfig({ ...nodeConfig });
      setValidationErrors([]);
      setIsDirty(false);
      setActiveTab('parameters');
    }
  }, [nodeConfig]);

  // Real-time validation
  const validateParameter = (key: string, value: any): string | null => {
    if (!config) return null;

    const { type } = config;
    
    // Type-specific validation
    switch (type) {
      case 'takeoff':
        if (key === 'height') {
          const result = ParameterValidator.validateNumber(value, 20, 500);
          return typeof result === 'string' ? result : null;
        }
        break;
      
      case 'move_forward':
      case 'move_backward':
      case 'move_left':
      case 'move_right':
      case 'move_up':
      case 'move_down':
        if (key === 'distance') {
          const result = ParameterValidator.validateNumber(value, 20, 500);
          return typeof result === 'string' ? result : null;
        }
        if (key === 'speed') {
          const result = ParameterValidator.validateNumber(value, 10, 100);
          return typeof result === 'string' ? result : null;
        }
        break;
      
      case 'rotate_cw':
      case 'rotate_ccw':
        if (key === 'angle') {
          const result = ParameterValidator.validateNumber(value, 1, 360);
          return typeof result === 'string' ? result : null;
        }
        if (key === 'speed') {
          const result = ParameterValidator.validateNumber(value, 10, 360);
          return typeof result === 'string' ? result : null;
        }
        break;
      
      case 'purechat_chat':
      case 'purechat_image_analysis':
        if (key === 'assistantId' && !value) {
          return '必须选择一个助理';
        }
        if (key === 'prompt' && !value) {
          return '提示词不能为空';
        }
        if (key === 'maxTokens') {
          const result = ParameterValidator.validateNumber(value, 100, 4000);
          return typeof result === 'string' ? result : null;
        }
        if (key === 'temperature') {
          const result = ParameterValidator.validateNumber(value, 0, 2);
          return typeof result === 'string' ? result : null;
        }
        break;
      
      case 'unipixel_segmentation':
        if (key === 'query' && !value) {
          return '分割查询不能为空';
        }
        if (key === 'confidence') {
          const result = ParameterValidator.validateNumber(value, 0.1, 1);
          return typeof result === 'string' ? result : null;
        }
        if (key === 'sampleFrames') {
          const result = ParameterValidator.validateNumber(value, 1, 10);
          return typeof result === 'string' ? result : null;
        }
        break;
      
      case 'yolo_detection':
        if (key === 'modelPath' && (config.parameters.modelSource === 'upload' || config.parameters.modelSource === 'url') && !value) {
          return '模型路径不能为空';
        }
        if (key === 'confidence') {
          const result = ParameterValidator.validateNumber(value, 0.1, 1);
          return typeof result === 'string' ? result : null;
        }
        if (key === 'iouThreshold') {
          const result = ParameterValidator.validateNumber(value, 0.1, 1);
          return typeof result === 'string' ? result : null;
        }
        break;
      
      case 'challenge_8_flight':
        if (key === 'radius') {
          const result = ParameterValidator.validateNumber(value, 50, 300);
          return typeof result === 'string' ? result : null;
        }
        if (key === 'speed') {
          const result = ParameterValidator.validateNumber(value, 10, 100);
          return typeof result === 'string' ? result : null;
        }
        if (key === 'loops') {
          const result = ParameterValidator.validateNumber(value, 1, 10);
          return typeof result === 'string' ? result : null;
        }
        break;
      
      case 'challenge_precision_land':
        if (key === 'precision') {
          const result = ParameterValidator.validateNumber(value, 1, 50);
          return typeof result === 'string' ? result : null;
        }
        break;
    }

    return null;
  };

  const updateParameter = (key: string, value: any) => {
    if (!config) return;

    setConfig({
      ...config,
      parameters: {
        ...config.parameters,
        [key]: value
      }
    });
    setIsDirty(true);

    // Real-time validation
    const error = validateParameter(key, value);
    setValidationErrors(prev => {
      const filtered = prev.filter(e => e.field !== key);
      if (error) {
        return [...filtered, { field: key, message: error }];
      }
      return filtered;
    });
  };

  const validateAll = (): boolean => {
    if (!config) return false;

    const errors: ValidationError[] = [];
    const params = config.parameters || {};

    Object.keys(params).forEach(key => {
      const error = validateParameter(key, params[key]);
      if (error) {
        errors.push({ field: key, message: error });
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = () => {
    if (!config) return;

    if (validateAll()) {
      onSave(config);
      onClose();
    }
  };

  const handlePresetApply = (preset: Record<string, any>) => {
    if (!config) return;

    setConfig({
      ...config,
      parameters: {
        ...config.parameters,
        ...preset
      }
    });
    setIsDirty(true);
    setValidationErrors([]);
  };

  const handleClose = () => {
    if (isDirty) {
      if (confirm('有未保存的更改，确定要关闭吗？')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const isValid = useMemo(() => {
    return validationErrors.length === 0;
  }, [validationErrors]);

  if (!config) return null;

  const modalStyle = useMemo(() => {
    const currentTheme = (theme || resolvedTheme) as 'light' | 'dark' | undefined;
    return getModalPanelStyle(currentTheme === 'light' ? 'light' : 'dark');
  }, [theme, resolvedTheme]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        header: "border-b border-[#64FFDA]/20",
        body: "py-6",
        footer: "border-t border-[#64FFDA]/20"
      }}
    >
      <ModalContent style={modalStyle}>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#64FFDA]" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  配置节点: {config.label}
                </h3>
                <p className="text-sm text-gray-400 font-normal">
                  节点类型: {config.type}
                </p>
              </div>
            </div>
            {isDirty && (
              <Chip 
                size="sm" 
                color="warning" 
                variant="flat"
                startContent={<AlertCircle className="w-3 h-3" />}
              >
                未保存
              </Chip>
            )}
          </div>
        </ModalHeader>

        <ModalBody>
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            classNames={{
              tabList: "bg-[#193059] p-1 rounded-lg",
              tab: "text-gray-400 data-[selected=true]:text-[#64FFDA]",
              cursor: "bg-[#64FFDA]/20",
              panel: "pt-4"
            }}
          >
            <Tab
              key="parameters"
              title={
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>参数配置</span>
                  {validationErrors.length > 0 && (
                    <Chip size="sm" color="danger" variant="flat">
                      {validationErrors.length}
                    </Chip>
                  )}
                </div>
              }
            >
              <NodeParameterForm
                nodeType={config.type}
                parameters={config.parameters}
                onParameterChange={updateParameter}
                validationErrors={validationErrors}
              />
            </Tab>

            <Tab
              key="presets"
              title={
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>预设模板</span>
                </div>
              }
            >
              <NodePresetSelector
                nodeType={config.type}
                currentParameters={config.parameters}
                onApplyPreset={handlePresetApply}
              />
            </Tab>

            <Tab
              key="documentation"
              title={
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>使用说明</span>
                </div>
              }
            >
              <NodeDocumentation nodeType={config.type} />
            </Tab>
          </Tabs>

          {/* Validation Summary */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-400 mb-2">
                    配置错误 ({validationErrors.length})
                  </h4>
                  <ul className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm text-red-300">
                        <span className="font-medium">{error.field}:</span> {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success Indicator */}
          {isValid && isDirty && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-sm text-green-300">
                  所有参数配置正确，可以保存
                </p>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="default"
            variant="flat"
            onPress={handleClose}
            startContent={<X className="w-4 h-4" />}
          >
            取消
          </Button>
          <Tooltip
            content={!isValid ? "请修复配置错误" : "保存节点配置"}
            color={!isValid ? "danger" : "success"}
          >
            <Button
              color="primary"
              onPress={handleSave}
              isDisabled={!isValid}
              startContent={<Save className="w-4 h-4" />}
              className="bg-[#64FFDA] text-[#0A192F] font-semibold"
            >
              保存配置
            </Button>
          </Tooltip>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EnhancedNodeConfigModal;
