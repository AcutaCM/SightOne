// Movement Control Nodes
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MoveUp, MoveDown, RotateCw, RotateCcw } from 'lucide-react';
import { WorkflowNodeDefinition, ParameterValidator } from '../nodeDefinitions';

const createMovementNode = (
  type: string,
  label: string,
  icon: any,
  description: string
): WorkflowNodeDefinition => ({
  type,
  label,
  icon,
  category: 'movement',
  description,
  color: '#a78bfa',
  parameters: [
    {
      name: 'distance',
      label: '距离',
      type: 'number',
      defaultValue: 50,
      min: 10,
      max: 500,
      required: true,
      description: '移动距离',
      validation: (value) => ParameterValidator.validateNumber(value, 10, 500),
      priority: 10,
      group: '基础设置',
      unit: 'cm',
      placeholder: '输入移动距离',
      inline: true
    },
    {
      name: 'speed',
      label: '速度',
      type: 'slider',
      defaultValue: 50,
      min: 10,
      max: 100,
      description: '移动速度百分比',
      validation: (value) => ParameterValidator.validateNumber(value, 10, 100),
      priority: 7,
      group: '基础设置',
      unit: '%',
      inline: true
    }
  ]
});

const createRotationNode = (
  type: string,
  label: string,
  icon: any,
  description: string
): WorkflowNodeDefinition => ({
  type,
  label,
  icon,
  category: 'rotation',
  description,
  color: '#fbbf24',
  parameters: [
    {
      name: 'angle',
      label: '角度',
      type: 'number',
      defaultValue: 90,
      min: 10,
      max: 360,
      required: true,
      description: '旋转角度',
      validation: (value) => ParameterValidator.validateNumber(value, 10, 360),
      priority: 10,
      group: '基础设置',
      unit: '°',
      placeholder: '输入旋转角度',
      inline: true
    },
    {
      name: 'speed',
      label: '速度',
      type: 'slider',
      defaultValue: 60,
      min: 10,
      max: 100,
      description: '旋转速度百分比',
      priority: 7,
      group: '基础设置',
      unit: '%',
      inline: true
    }
  ]
});

export const movementNodes: WorkflowNodeDefinition[] = [
  createMovementNode('move_forward', '前进', ArrowUp, '向前移动指定距离'),
  createMovementNode('move_backward', '后退', ArrowDown, '向后移动指定距离'),
  createMovementNode('move_left', '左移', ArrowLeft, '向左移动指定距离'),
  createMovementNode('move_right', '右移', ArrowRight, '向右移动指定距离'),
  createMovementNode('move_up', '上升', MoveUp, '向上移动指定距离'),
  createMovementNode('move_down', '下降', MoveDown, '向下移动指定距离'),
  createRotationNode('rotate_cw', '顺时针旋转', RotateCw, '顺时针旋转指定角度'),
  createRotationNode('rotate_ccw', '逆时针旋转', RotateCcw, '逆时针旋转指定角度')
];
