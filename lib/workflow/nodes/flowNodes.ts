// Flow Control Nodes
import { Circle, StopCircle } from 'lucide-react';
import { WorkflowNodeDefinition, ParameterValidator } from '../nodeDefinitions';

export const flowNodes: WorkflowNodeDefinition[] = [
  {
    type: 'start',
    label: '开始',
    icon: Circle,
    category: 'flow',
    description: '工作流开始节点',
    color: '#4ade80',
    parameters: [
      {
        name: 'autoStart',
        label: '自动开始',
        type: 'boolean',
        defaultValue: false,
        description: '程序加载后自动开始执行',
        validation: ParameterValidator.validateBoolean,
        priority: 8,
        group: '基础设置',
        inline: true
      },
      {
        name: 'description',
        label: '描述',
        type: 'textarea',
        defaultValue: '',
        description: '工作流描述信息',
        priority: 3,
        group: '文档',
        placeholder: '输入工作流描述',
        inline: true
      }
    ]
  },
  {
    type: 'end',
    label: '结束',
    icon: StopCircle,
    category: 'flow',
    description: '工作流结束节点',
    color: '#f87171',
    parameters: [
      {
        name: 'endAction',
        label: '结束动作',
        type: 'select',
        defaultValue: 'land',
        options: [
          { label: '降落', value: 'land' },
          { label: '悬停', value: 'hover' },
          { label: '继续', value: 'continue' }
        ],
        description: '程序结束后的动作',
        priority: 10,
        group: '基础设置',
        inline: true
      },
      {
        name: 'generateReport',
        label: '生成报告',
        type: 'boolean',
        defaultValue: true,
        description: '是否生成执行报告',
        priority: 6,
        group: '输出设置',
        inline: true
      }
    ]
  }
];
