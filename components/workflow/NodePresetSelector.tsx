'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { 
  Sparkles, 
  Zap, 
  Target, 
  Shield,
  TrendingUp,
  Clock
} from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  parameters: Record<string, any>;
  tags: string[];
}

interface NodePresetSelectorProps {
  nodeType: string;
  currentParameters: Record<string, any>;
  onApplyPreset: (preset: Record<string, any>) => void;
}

const NodePresetSelector: React.FC<NodePresetSelectorProps> = ({
  nodeType,
  currentParameters,
  onApplyPreset
}) => {
  // Define presets for different node types
  const getPresets = (): Preset[] => {
    switch (nodeType) {
      case 'purechat_chat':
        return [
          {
            id: 'creative',
            name: '创造性对话',
            description: '高温度参数，适合创意生成和头脑风暴',
            icon: <Sparkles className="w-5 h-5" />,
            parameters: {
              temperature: 1.5,
              maxTokens: 2000,
              outputVariable: 'creative_response'
            },
            tags: ['创意', '灵活']
          },
          {
            id: 'precise',
            name: '精确回答',
            description: '低温度参数，适合事实性问答和数据分析',
            icon: <Target className="w-5 h-5" />,
            parameters: {
              temperature: 0.3,
              maxTokens: 1000,
              outputVariable: 'precise_response'
            },
            tags: ['精确', '事实']
          },
          {
            id: 'balanced',
            name: '平衡模式',
            description: '中等温度，适合大多数场景',
            icon: <Shield className="w-5 h-5" />,
            parameters: {
              temperature: 0.7,
              maxTokens: 1500,
              outputVariable: 'ai_response'
            },
            tags: ['平衡', '通用']
          }
        ];

      case 'purechat_image_analysis':
        return [
          {
            id: 'detailed',
            name: '详细分析',
            description: '全面分析图像内容，包括对象、场景、颜色等',
            icon: <TrendingUp className="w-5 h-5" />,
            parameters: {
              prompt: '请详细分析这张图片，包括：1. 主要对象和场景 2. 颜色和光线 3. 构图和视角 4. 可能的用途或含义',
              imageSource: 'camera',
              outputVariable: 'detailed_analysis'
            },
            tags: ['详细', '全面']
          },
          {
            id: 'quick',
            name: '快速识别',
            description: '快速识别图像中的主要对象',
            icon: <Zap className="w-5 h-5" />,
            parameters: {
              prompt: '快速识别图像中的主要对象，用一句话描述',
              imageSource: 'camera',
              outputVariable: 'quick_recognition'
            },
            tags: ['快速', '简洁']
          },
          {
            id: 'defect',
            name: '缺陷检测',
            description: '专注于检测图像中的异常或缺陷',
            icon: <Shield className="w-5 h-5" />,
            parameters: {
              prompt: '仔细检查图像，识别任何异常、缺陷或需要注意的问题',
              imageSource: 'camera',
              outputVariable: 'defect_analysis'
            },
            tags: ['检测', '质量']
          }
        ];

      case 'unipixel_segmentation':
        return [
          {
            id: 'high_precision',
            name: '高精度分割',
            description: '严格的置信度阈值，确保分割准确性',
            icon: <Target className="w-5 h-5" />,
            parameters: {
              confidence: 0.85,
              sampleFrames: 3,
              visualize: true,
              outputVariable: 'precise_segmentation'
            },
            tags: ['精确', '严格']
          },
          {
            id: 'fast',
            name: '快速分割',
            description: '较低置信度，单帧处理，适合实时应用',
            icon: <Zap className="w-5 h-5" />,
            parameters: {
              confidence: 0.5,
              sampleFrames: 1,
              visualize: true,
              outputVariable: 'fast_segmentation'
            },
            tags: ['快速', '实时']
          },
          {
            id: 'balanced',
            name: '平衡模式',
            description: '平衡精度和速度',
            icon: <Shield className="w-5 h-5" />,
            parameters: {
              confidence: 0.7,
              sampleFrames: 2,
              visualize: true,
              outputVariable: 'segmentation_result'
            },
            tags: ['平衡', '通用']
          }
        ];

      case 'yolo_detection':
        return [
          {
            id: 'high_accuracy',
            name: '高准确度',
            description: '高置信度阈值，减少误检',
            icon: <Target className="w-5 h-5" />,
            parameters: {
              confidence: 0.7,
              iouThreshold: 0.5,
              drawResults: true,
              outputVariable: 'accurate_detections'
            },
            tags: ['准确', '严格']
          },
          {
            id: 'high_recall',
            name: '高召回率',
            description: '低置信度阈值，尽可能检测所有对象',
            icon: <TrendingUp className="w-5 h-5" />,
            parameters: {
              confidence: 0.3,
              iouThreshold: 0.4,
              drawResults: true,
              outputVariable: 'all_detections'
            },
            tags: ['全面', '宽松']
          },
          {
            id: 'balanced',
            name: '平衡模式',
            description: '平衡准确率和召回率',
            icon: <Shield className="w-5 h-5" />,
            parameters: {
              confidence: 0.5,
              iouThreshold: 0.45,
              drawResults: true,
              outputVariable: 'yolo_detections'
            },
            tags: ['平衡', '通用']
          }
        ];

      case 'challenge_8_flight':
        return [
          {
            id: 'beginner',
            name: '初学者模式',
            description: '较小半径，较慢速度，适合练习',
            icon: <Shield className="w-5 h-5" />,
            parameters: {
              radius: 80,
              speed: 30,
              loops: 1,
              timeout: 90
            },
            tags: ['简单', '安全']
          },
          {
            id: 'standard',
            name: '标准模式',
            description: '标准参数，适合演示',
            icon: <Target className="w-5 h-5" />,
            parameters: {
              radius: 120,
              speed: 50,
              loops: 2,
              timeout: 60
            },
            tags: ['标准', '演示']
          },
          {
            id: 'advanced',
            name: '高级模式',
            description: '大半径，高速度，挑战性强',
            icon: <Zap className="w-5 h-5" />,
            parameters: {
              radius: 200,
              speed: 80,
              loops: 3,
              timeout: 45
            },
            tags: ['高级', '挑战']
          }
        ];

      case 'challenge_precision_land':
        return [
          {
            id: 'easy',
            name: '宽松精度',
            description: '较大的误差范围，适合初学者',
            icon: <Shield className="w-5 h-5" />,
            parameters: {
              targetX: 0,
              targetY: 0,
              precision: 30,
              timeout: 45
            },
            tags: ['简单', '宽松']
          },
          {
            id: 'standard',
            name: '标准精度',
            description: '标准误差范围',
            icon: <Target className="w-5 h-5" />,
            parameters: {
              targetX: 0,
              targetY: 0,
              precision: 15,
              timeout: 30
            },
            tags: ['标准', '中等']
          },
          {
            id: 'expert',
            name: '专家精度',
            description: '极小误差范围，需要高超技巧',
            icon: <Zap className="w-5 h-5" />,
            parameters: {
              targetX: 0,
              targetY: 0,
              precision: 5,
              timeout: 20
            },
            tags: ['专家', '精确']
          }
        ];

      default:
        return [];
    }
  };

  const presets = getPresets();

  if (presets.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">此节点类型暂无预设模板</p>
        <p className="text-sm text-gray-500 mt-2">
          您可以手动配置参数
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#64FFDA]" />
        <h3 className="text-lg font-semibold text-white">
          选择预设模板
        </h3>
      </div>

      <p className="text-sm text-gray-400 mb-6">
        快速应用常用的参数配置，您可以在应用后继续调整
      </p>

      <div className="grid grid-cols-1 gap-4">
        {presets.map((preset) => (
          <Card
            key={preset.id}
            className="bg-[#193059] border border-[#64FFDA]/20 hover:border-[#64FFDA]/50 transition-all cursor-pointer"
            isPressable
            onPress={() => onApplyPreset(preset.parameters)}
          >
            <CardHeader className="flex gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#64FFDA]/10 text-[#64FFDA]">
                {preset.icon}
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-md font-semibold text-white">
                  {preset.name}
                </p>
                <p className="text-sm text-gray-400">
                  {preset.description}
                </p>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex flex-wrap gap-2 mb-3">
                {preset.tags.map((tag) => (
                  <Chip
                    key={tag}
                    size="sm"
                    variant="flat"
                    className="bg-[#64FFDA]/10 text-[#64FFDA]"
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
              
              <div className="space-y-1 text-xs text-gray-400">
                <p className="font-semibold text-gray-300 mb-2">参数预览:</p>
                {Object.entries(preset.parameters).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key}:</span>
                    <span className="text-[#64FFDA] font-mono">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                size="sm"
                className="w-full mt-4 bg-[#64FFDA]/10 text-[#64FFDA] hover:bg-[#64FFDA]/20"
                onPress={() => onApplyPreset(preset.parameters)}
              >
                应用此预设
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-semibold mb-1">
              提示
            </p>
            <p className="text-xs text-blue-200">
              应用预设后，您仍然可以在"参数配置"标签页中调整具体参数。预设只是为了快速开始。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodePresetSelector;
