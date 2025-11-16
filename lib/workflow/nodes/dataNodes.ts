// Data Processing Nodes
import { Variable, Database, Code, Camera, FileImage } from 'lucide-react';
import { WorkflowNodeDefinition, ParameterValidator } from '../nodeDefinitions';

export const dataNodes: WorkflowNodeDefinition[] = [
  {
    type: 'variable_set',
    label: '设置变量',
    icon: Variable,
    category: 'data',
    description: '设置变量值',
    color: '#6366f1',
    parameters: [
      {
        name: 'variable',
        label: '变量名',
        type: 'string',
        defaultValue: 'myVar',
        required: true,
        description: '要设置的变量名',
        validation: (value) => ParameterValidator.validateString(value, 1, 50),
        priority: 10,
        group: '基础设置',
        placeholder: '输入变量名',
        inline: true
      },
      {
        name: 'value',
        label: '值',
        type: 'string',
        defaultValue: '0',
        required: true,
        description: '变量值',
        priority: 9,
        group: '基础设置',
        placeholder: '输入变量值',
        inline: true
      },
      {
        name: 'type',
        label: '类型',
        type: 'select',
        defaultValue: 'number',
        options: [
          { label: '数字', value: 'number' },
          { label: '字符串', value: 'string' },
          { label: '布尔值', value: 'boolean' },
          { label: 'JSON', value: 'json' }
        ],
        description: '变量类型',
        priority: 8,
        group: '基础设置',
        inline: true
      }
    ]
  },
  {
    type: 'variable_get',
    label: '获取变量',
    icon: Variable,
    category: 'data',
    description: '获取变量值',
    color: '#6366f1',
    parameters: [
      {
        name: 'variable',
        label: '变量名',
        type: 'string',
        defaultValue: 'myVar',
        required: true,
        description: '要获取的变量名'
      },
      {
        name: 'outputVariable',
        label: '输出变量名',
        type: 'string',
        defaultValue: 'result',
        description: '存储结果的变量名'
      }
    ]
  },
  {
    type: 'data_transform',
    label: '数据转换',
    icon: Code,
    category: 'data',
    description: '转换数据格式',
    color: '#6366f1',
    parameters: [
      {
        name: 'inputVariable',
        label: '输入变量',
        type: 'string',
        defaultValue: '',
        required: true,
        description: '输入数据的变量名'
      },
      {
        name: 'transformType',
        label: '转换类型',
        type: 'select',
        defaultValue: 'json_to_csv',
        options: [
          { label: 'JSON转CSV', value: 'json_to_csv' },
          { label: 'CSV转JSON', value: 'csv_to_json' },
          { label: '字符串转数字', value: 'string_to_number' },
          { label: '数字转字符串', value: 'number_to_string' }
        ],
        description: '数据转换类型'
      },
      {
        name: 'outputVariable',
        label: '输出变量名',
        type: 'string',
        defaultValue: 'transformed_data',
        required: true,
        description: '存储转换结果的变量名'
      }
    ]
  },
  {
    type: 'data_filter',
    label: '数据过滤',
    icon: Database,
    category: 'data',
    description: '过滤数据内容',
    color: '#6366f1',
    parameters: [
      {
        name: 'inputVariable',
        label: '输入变量',
        type: 'string',
        defaultValue: '',
        required: true,
        description: '输入数据的变量名'
      },
      {
        name: 'filterType',
        label: '过滤类型',
        type: 'select',
        defaultValue: 'threshold',
        options: [
          { label: '阈值过滤', value: 'threshold' },
          { label: '范围过滤', value: 'range' },
          { label: '正则表达式', value: 'regex' }
        ],
        description: '数据过滤类型'
      },
      {
        name: 'filterValue',
        label: '过滤值',
        type: 'string',
        defaultValue: '',
        required: true,
        description: '过滤条件值'
      },
      {
        name: 'keepMatching',
        label: '保留匹配项',
        type: 'boolean',
        defaultValue: true,
        description: '是否保留匹配的数据'
      },
      {
        name: 'outputVariable',
        label: '输出变量名',
        type: 'string',
        defaultValue: 'filtered_data',
        required: true,
        description: '存储过滤结果的变量名'
      }
    ]
  },
  {
    type: 'take_photo',
    label: '拍照',
    icon: Camera,
    category: 'imaging',
    description: '拍摄照片并保存',
    color: '#10b981',
    parameters: [
      {
        name: 'resolution',
        label: '分辨率',
        type: 'select',
        defaultValue: 'high',
        options: [
          { label: '低', value: 'low' },
          { label: '中', value: 'medium' },
          { label: '高', value: 'high' }
        ],
        description: '照片分辨率',
        priority: 9,
        group: '基础设置',
        inline: true
      },
      {
        name: 'format',
        label: '格式',
        type: 'select',
        defaultValue: 'jpg',
        options: [
          { label: 'JPG', value: 'jpg' },
          { label: 'PNG', value: 'png' }
        ],
        description: '照片格式',
        priority: 7,
        group: '基础设置',
        inline: true
      },
      {
        name: 'saveLocal',
        label: '本地保存',
        type: 'boolean',
        defaultValue: true,
        description: '是否保存到本地',
        priority: 6,
        group: '输出设置',
        inline: true
      },
      {
        name: 'outputVariable',
        label: '输出变量名',
        type: 'string',
        defaultValue: 'photo_path',
        description: '存储照片路径的变量名',
        priority: 8,
        group: '输出设置',
        placeholder: '变量名',
        inline: true
      }
    ]
  },
  {
    type: 'start_video',
    label: '开始录像',
    icon: FileImage,
    category: 'imaging',
    description: '开始视频录制',
    color: '#10b981',
    parameters: [
      {
        name: 'resolution',
        label: '分辨率',
        type: 'select',
        defaultValue: 'high',
        options: [
          { label: '低', value: 'low' },
          { label: '中', value: 'medium' },
          { label: '高', value: 'high' }
        ],
        description: '视频分辨率'
      },
      {
        name: 'format',
        label: '格式',
        type: 'select',
        defaultValue: 'mp4',
        options: [
          { label: 'MP4', value: 'mp4' },
          { label: 'AVI', value: 'avi' }
        ],
        description: '视频格式'
      }
    ]
  },
  {
    type: 'stop_video',
    label: '停止录像',
    icon: FileImage,
    category: 'imaging',
    description: '停止视频录制',
    color: '#10b981',
    parameters: [
      {
        name: 'outputVariable',
        label: '输出变量名',
        type: 'string',
        defaultValue: 'video_path',
        description: '存储视频路径的变量名'
      }
    ]
  }
];
