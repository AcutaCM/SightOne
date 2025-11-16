// Logic and Control Flow Nodes
import { GitBranch, Repeat } from 'lucide-react';
import { WorkflowNodeDefinition, ParameterValidator } from '../nodeDefinitions';

export const logicNodes: WorkflowNodeDefinition[] = [
  {
    type: 'condition_branch',
    label: '条件分支',
    icon: GitBranch,
    category: 'logic',
    description: '根据条件执行不同分支',
    color: '#ec4899',
    parameters: [
      {
        name: 'variable',
        label: '变量',
        type: 'string',
        defaultValue: 'battery',
        required: true,
        description: '要比较的变量名',
        priority: 10,
        group: '基础设置',
        placeholder: '输入变量名',
        inline: true
      },
      {
        name: 'operator',
        label: '操作符',
        type: 'select',
        defaultValue: '>',
        required: true,
        options: [
          { label: '大于 (>)', value: '>' },
          { label: '小于 (<)', value: '<' },
          { label: '大于等于 (>=)', value: '>=' },
          { label: '小于等于 (<=)', value: '<=' },
          { label: '等于 (==)', value: '==' },
          { label: '不等于 (!=)', value: '!=' }
        ],
        description: '比较操作符',
        priority: 9,
        group: '基础设置',
        inline: true
      },
      {
        name: 'value',
        label: '比较值',
        type: 'string',
        defaultValue: '50',
        required: true,
        description: '用于比较的值',
        priority: 8,
        group: '基础设置',
        placeholder: '输入比较值',
        inline: true
      }
    ]
  },
  {
    type: 'if_else',
    label: 'IF-ELSE判断',
    icon: GitBranch,
    category: 'logic',
    description: 'IF-ELSE条件判断',
    color: '#ec4899',
    parameters: [
      {
        name: 'condition',
        label: '条件表达式',
        type: 'string',
        defaultValue: 'battery > 50',
        required: true,
        description: '判断条件表达式',
        validation: (value) => ParameterValidator.validateString(value, 1, 200),
        priority: 10,
        group: '基础设置',
        placeholder: '输入条件表达式',
        inline: true
      },
      {
        name: 'trueLabel',
        label: '真分支标签',
        type: 'string',
        defaultValue: '是',
        description: '条件为真时的标签',
        priority: 5,
        group: '显示设置',
        placeholder: '真分支标签',
        inline: true
      },
      {
        name: 'falseLabel',
        label: '假分支标签',
        type: 'string',
        defaultValue: '否',
        description: '条件为假时的标签',
        priority: 4,
        group: '显示设置',
        placeholder: '假分支标签',
        inline: true
      }
    ]
  },
  {
    type: 'loop',
    label: '循环',
    icon: Repeat,
    category: 'logic',
    description: '循环执行指定次数',
    color: '#ec4899',
    parameters: [
      {
        name: 'iterations',
        label: '循环次数',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 100,
        required: true,
        description: '循环执行次数',
        validation: (value) => ParameterValidator.validateNumber(value, 1, 100),
        priority: 10,
        group: '基础设置',
        placeholder: '输入循环次数',
        inline: true
      },
      {
        name: 'condition',
        label: '循环条件',
        type: 'string',
        defaultValue: '',
        description: '循环继续条件(可选)',
        priority: 7,
        group: '高级设置',
        placeholder: '输入循环条件',
        inline: true
      },
      {
        name: 'breakOnError',
        label: '错误时中断',
        type: 'boolean',
        defaultValue: true,
        description: '发生错误时是否中断循环',
        priority: 6,
        group: '错误处理',
        inline: true
      }
    ]
  }
];
