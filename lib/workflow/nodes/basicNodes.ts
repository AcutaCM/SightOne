// Basic Control Nodes
import { Plane, PlaneLanding, AlertTriangle, Clock, Pause } from 'lucide-react';
import { WorkflowNodeDefinition, ParameterValidator } from '../nodeDefinitions';

export const basicNodes: WorkflowNodeDefinition[] = [
  {
    type: 'takeoff',
    label: '起飞',
    icon: Plane,
    category: 'basic',
    description: '无人机起飞到指定高度',
    color: '#60a5fa',
    parameters: [
      {
        name: 'height',
        label: '高度',
        type: 'number',
        defaultValue: 100,
        min: 20,
        max: 500,
        required: true,
        description: '起飞目标高度',
        validation: (value) => ParameterValidator.validateNumber(value, 20, 500),
        priority: 10,
        group: '基础设置',
        unit: 'cm',
        placeholder: '输入起飞高度',
        inline: true
      },
      {
        name: 'waitForStable',
        label: '等待稳定',
        type: 'boolean',
        defaultValue: true,
        description: '起飞后是否等待无人机稳定',
        priority: 5,
        group: '高级设置',
        inline: true
      }
    ]
  },
  {
    type: 'land',
    label: '降落',
    icon: PlaneLanding,
    category: 'basic',
    description: '无人机安全降落',
    color: '#60a5fa',
    parameters: [
      {
        name: 'safetyCheck',
        label: '安全检查',
        type: 'boolean',
        defaultValue: true,
        description: '降落前进行安全检查',
        priority: 8,
        group: '安全设置',
        inline: true
      },
      {
        name: 'speed',
        label: '降落速度',
        type: 'slider',
        defaultValue: 50,
        min: 10,
        max: 100,
        description: '降落速度百分比',
        validation: (value) => ParameterValidator.validateNumber(value, 10, 100),
        priority: 6,
        group: '基础设置',
        unit: '%',
        inline: true
      }
    ]
  },
  {
    type: 'emergency_stop',
    label: '紧急停止',
    icon: AlertTriangle,
    category: 'basic',
    description: '立即停止所有动作并悬停',
    color: '#f87171',
    parameters: []
  },
  {
    type: 'wait',
    label: '等待',
    icon: Clock,
    category: 'basic',
    description: '等待指定时间',
    color: '#06b6d4',
    parameters: [
      {
        name: 'duration',
        label: '等待时间',
        type: 'number',
        defaultValue: 1,
        min: 0.1,
        max: 300,
        step: 0.1,
        required: true,
        description: '等待时间',
        validation: (value) => ParameterValidator.validateNumber(value, 0.1, 300),
        priority: 10,
        group: '基础设置',
        unit: '秒',
        placeholder: '输入等待时间',
        inline: true
      }
    ]
  },
  {
    type: 'hover',
    label: '悬停',
    icon: Pause,
    category: 'basic',
    description: '在当前位置悬停',
    color: '#06b6d4',
    parameters: [
      {
        name: 'duration',
        label: '悬停时间',
        type: 'number',
        defaultValue: 3,
        min: 0.1,
        max: 300,
        step: 0.1,
        required: true,
        description: '悬停时间',
        priority: 10,
        group: '基础设置',
        unit: '秒',
        placeholder: '输入悬停时间',
        inline: true
      }
    ]
  }
];
