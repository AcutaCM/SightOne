// Challenge Card Task Nodes
import { Zap, RefreshCw, Target, Crosshair } from 'lucide-react';
import { WorkflowNodeDefinition, ParameterValidator } from '../nodeDefinitions';

export const challengeNodes: WorkflowNodeDefinition[] = [
  {
    type: 'challenge_8_flight',
    label: '8字飞行',
    icon: RefreshCw,
    category: 'challenge',
    description: '执行8字飞行轨迹',
    color: '#f97316',
    parameters: [
      {
        name: 'radius',
        label: '半径',
        type: 'number',
        defaultValue: 100,
        min: 50,
        max: 300,
        required: true,
        description: '8字轨迹的半径',
        validation: (value) => ParameterValidator.validateNumber(value, 50, 300),
        priority: 10,
        group: '基础设置',
        unit: 'cm',
        placeholder: '输入半径',
        inline: true
      },
      {
        name: 'speed',
        label: '速度',
        type: 'slider',
        defaultValue: 50,
        min: 10,
        max: 100,
        description: '飞行速度百分比',
        priority: 8,
        group: '基础设置',
        unit: '%',
        inline: true
      },
      {
        name: 'loops',
        label: '循环次数',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 5,
        description: '重复执行次数',
        priority: 7,
        group: '基础设置',
        inline: true
      },
      {
        name: 'timeout',
        label: '超时时间',
        type: 'number',
        defaultValue: 60,
        min: 10,
        max: 300,
        description: '任务超时时间',
        priority: 5,
        group: '高级设置',
        unit: '秒',
        inline: true
      },
      {
        name: 'scoreOutput',
        label: '评分输出变量',
        type: 'string',
        defaultValue: 'flight_8_score',
        description: '存储评分结果的变量名',
        priority: 6,
        group: '输出设置',
        placeholder: '变量名',
        inline: true
      }
    ]
  },
  {
    type: 'challenge_obstacle',
    label: '穿越障碍',
    icon: Target,
    category: 'challenge',
    description: '穿越指定障碍物',
    color: '#f97316',
    parameters: [
      {
        name: 'obstaclePositions',
        label: '障碍位置',
        type: 'json',
        defaultValue: '[{"x": 100, "y": 0, "z": 100}]',
        required: true,
        description: '障碍物位置数组(JSON格式)',
        validation: ParameterValidator.validateJSON
      },
      {
        name: 'speed',
        label: '速度(%)',
        type: 'slider',
        defaultValue: 40,
        min: 10,
        max: 100,
        description: '穿越速度百分比'
      },
      {
        name: 'safetyMargin',
        label: '安全边距(cm)',
        type: 'number',
        defaultValue: 20,
        min: 10,
        max: 50,
        description: '与障碍物的安全距离'
      },
      {
        name: 'timeout',
        label: '超时时间(秒)',
        type: 'number',
        defaultValue: 120,
        min: 30,
        max: 300,
        description: '任务超时时间'
      },
      {
        name: 'scoreOutput',
        label: '评分输出变量',
        type: 'string',
        defaultValue: 'obstacle_score',
        description: '存储评分结果的变量名'
      }
    ]
  },
  {
    type: 'challenge_precision_land',
    label: '精准降落',
    icon: Crosshair,
    category: 'challenge',
    description: '在指定位置精准降落',
    color: '#f97316',
    parameters: [
      {
        name: 'targetPosition',
        label: '目标位置',
        type: 'json',
        defaultValue: '{"x": 0, "y": 0}',
        required: true,
        description: '目标降落位置(JSON格式)',
        validation: ParameterValidator.validateJSON
      },
      {
        name: 'precision',
        label: '精度要求',
        type: 'number',
        defaultValue: 10,
        min: 5,
        max: 50,
        required: true,
        description: '允许的位置误差',
        validation: (value) => ParameterValidator.validateNumber(value, 5, 50),
        priority: 9,
        group: '基础设置',
        unit: 'cm',
        placeholder: '输入精度要求',
        inline: true
      },
      {
        name: 'maxAttempts',
        label: '最大尝试次数',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 5,
        description: '最大调整尝试次数',
        priority: 7,
        group: '基础设置',
        inline: true
      },
      {
        name: 'timeout',
        label: '超时时间',
        type: 'number',
        defaultValue: 60,
        min: 10,
        max: 180,
        description: '任务超时时间',
        priority: 5,
        group: '高级设置',
        unit: '秒',
        inline: true
      },
      {
        name: 'scoreOutput',
        label: '评分输出变量',
        type: 'string',
        defaultValue: 'landing_score',
        description: '存储评分结果的变量名',
        priority: 6,
        group: '输出设置',
        placeholder: '变量名',
        inline: true
      }
    ]
  },
  {
    type: 'flip_forward',
    label: '前翻',
    icon: Zap,
    category: 'challenge',
    description: '向前翻转360度',
    color: '#ec4899',
    parameters: [
      {
        name: 'safetyCheck',
        label: '安全检查',
        type: 'boolean',
        defaultValue: true,
        description: '执行前进行安全检查',
        priority: 10,
        group: '安全设置',
        inline: true
      },
      {
        name: 'waitAfter',
        label: '等待时间',
        type: 'number',
        defaultValue: 2,
        min: 0,
        max: 10,
        description: '翻转后等待时间',
        priority: 8,
        group: '基础设置',
        unit: '秒',
        inline: true
      }
    ]
  },
  {
    type: 'flip_backward',
    label: '后翻',
    icon: Zap,
    category: 'challenge',
    description: '向后翻转360度',
    color: '#ec4899',
    parameters: [
      {
        name: 'safetyCheck',
        label: '安全检查',
        type: 'boolean',
        defaultValue: true,
        description: '执行前进行安全检查',
        priority: 10,
        group: '安全设置',
        inline: true
      },
      {
        name: 'waitAfter',
        label: '等待时间',
        type: 'number',
        defaultValue: 2,
        min: 0,
        max: 10,
        description: '翻转后等待时间',
        priority: 8,
        group: '基础设置',
        unit: '秒',
        inline: true
      }
    ]
  },
  {
    type: 'flip_left',
    label: '左翻',
    icon: Zap,
    category: 'challenge',
    description: '向左翻转360度',
    color: '#ec4899',
    parameters: [
      {
        name: 'safetyCheck',
        label: '安全检查',
        type: 'boolean',
        defaultValue: true,
        description: '执行前进行安全检查',
        priority: 10,
        group: '安全设置',
        inline: true
      },
      {
        name: 'waitAfter',
        label: '等待时间',
        type: 'number',
        defaultValue: 2,
        min: 0,
        max: 10,
        description: '翻转后等待时间',
        priority: 8,
        group: '基础设置',
        unit: '秒',
        inline: true
      }
    ]
  },
  {
    type: 'flip_right',
    label: '右翻',
    icon: Zap,
    category: 'challenge',
    description: '向右翻转360度',
    color: '#ec4899',
    parameters: [
      {
        name: 'safetyCheck',
        label: '安全检查',
        type: 'boolean',
        defaultValue: true,
        description: '执行前进行安全检查',
        priority: 10,
        group: '安全设置',
        inline: true
      },
      {
        name: 'waitAfter',
        label: '等待时间',
        type: 'number',
        defaultValue: 2,
        min: 0,
        max: 10,
        description: '翻转后等待时间',
        priority: 8,
        group: '基础设置',
        unit: '秒',
        inline: true
      }
    ]
  }
];
