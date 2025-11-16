// AI Analysis Nodes - PureChat, UniPixel, etc.
import { Brain, MessageSquare, Scissors, Sparkles } from 'lucide-react';
import { WorkflowNodeDefinition, ParameterValidator } from '../nodeDefinitions';

export const aiNodes: WorkflowNodeDefinition[] = [
  {
    type: 'purechat_chat',
    label: 'PureChat对话',
    icon: MessageSquare,
    category: 'ai',
    description: '使用PureChat AI进行智能对话',
    color: '#8b5cf6',
    parameters: [
      {
        name: 'assistantId',
        label: 'AI助理',
        type: 'assistant',
        defaultValue: '',
        required: true,
        description: '选择要使用的AI助理',
        priority: 10,
        group: '基础设置',
        inline: true
      },
      {
        name: 'prompt',
        label: '提示词',
        type: 'textarea',
        defaultValue: '',
        required: true,
        description: '发送给AI的提示词',
        validation: (value) => ParameterValidator.validateString(value, 1, 2000),
        priority: 9,
        group: '基础设置',
        placeholder: '输入提示词',
        inline: true
      },
      {
        name: 'temperature',
        label: '温度',
        type: 'slider',
        defaultValue: 0.7,
        min: 0,
        max: 2,
        step: 0.1,
        description: 'AI创造性参数(0-2)',
        validation: (value) => ParameterValidator.validateNumber(value, 0, 2),
        priority: 5,
        group: '高级设置',
        inline: true
      },
      {
        name: 'maxTokens',
        label: '最大Token数',
        type: 'number',
        defaultValue: 1000,
        min: 100,
        max: 4000,
        description: '生成文本的最大长度',
        priority: 3,
        group: '高级设置',
        inline: true
      },
      {
        name: 'outputVariable',
        label: '输出变量名',
        type: 'string',
        defaultValue: 'ai_response',
        required: true,
        description: '存储AI响应的变量名',
        priority: 8,
        group: '输出设置',
        placeholder: '变量名',
        inline: true
      }
    ]
  },
  {
    type: 'purechat_image_analysis',
    label: 'AI图像分析',
    icon: Brain,
    category: 'ai',
    description: '使用PureChat AI分析图像内容',
    color: '#8b5cf6',
    parameters: [
      {
        name: 'assistantId',
        label: 'AI助理',
        type: 'assistant',
        defaultValue: '',
        required: true,
        description: '选择要使用的AI助理'
      },
      {
        name: 'imageSource',
        label: '图像来源',
        type: 'select',
        defaultValue: 'camera',
        required: true,
        options: [
          { label: '无人机摄像头', value: 'camera' },
          { label: '上传图片', value: 'upload' },
          { label: '变量引用', value: 'variable' }
        ],
        description: '图像数据来源',
        priority: 9,
        group: '基础设置',
        inline: true
      },
      {
        name: 'prompt',
        label: '分析提示',
        type: 'textarea',
        defaultValue: '请分析这张图片',
        required: true,
        description: '图像分析的提示词',
        priority: 8,
        group: '基础设置',
        placeholder: '输入分析提示',
        inline: true
      },
      {
        name: 'outputVariable',
        label: '输出变量名',
        type: 'string',
        defaultValue: 'image_analysis',
        required: true,
        description: '存储分析结果的变量名',
        priority: 7,
        group: '输出设置',
        placeholder: '变量名',
        inline: true
      }
    ]
  },
  {
    type: 'unipixel_segmentation',
    label: 'UniPixel分割',
    icon: Scissors,
    category: 'ai',
    description: '使用UniPixel进行语义分割',
    color: '#8b5cf6',
    parameters: [
      {
        name: 'imageSource',
        label: '图像来源',
        type: 'select',
        defaultValue: 'camera',
        required: true,
        options: [
          { label: '无人机摄像头', value: 'camera' },
          { label: '上传图片', value: 'upload' },
          { label: '变量引用', value: 'variable' }
        ],
        description: '图像数据来源'
      },
      {
        name: 'query',
        label: '分割查询',
        type: 'textarea',
        defaultValue: '',
        required: true,
        description: '描述要分割的对象(例如: "草莓")',
        validation: (value) => ParameterValidator.validateString(value, 1, 200),
        priority: 10,
        group: '基础设置',
        placeholder: '输入要分割的对象',
        inline: true
      },
      {
        name: 'confidence',
        label: '置信度阈值',
        type: 'slider',
        defaultValue: 0.7,
        min: 0.1,
        max: 1,
        step: 0.05,
        description: '分割置信度阈值',
        validation: (value) => ParameterValidator.validateNumber(value, 0.1, 1),
        priority: 8,
        group: '基础设置',
        inline: true
      },
      {
        name: 'sampleFrames',
        label: '采样帧数',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 10,
        description: '采样的视频帧数',
        priority: 5,
        group: '高级设置',
        inline: true
      },
      {
        name: 'visualize',
        label: '可视化结果',
        type: 'boolean',
        defaultValue: true,
        description: '是否显示分割结果',
        priority: 6,
        group: '输出设置',
        inline: true
      },
      {
        name: 'outputVariable',
        label: '输出变量名',
        type: 'string',
        defaultValue: 'segmentation_result',
        required: true,
        description: '存储分割结果的变量名',
        priority: 7,
        group: '输出设置',
        placeholder: '变量名',
        inline: true
      }
    ]
  }
];
