// Detection Nodes - YOLO, QR, etc.
import { QrCode, Eye, Target, Scan } from 'lucide-react';
import { WorkflowNodeDefinition, ParameterValidator } from '../nodeDefinitions';

export const detectionNodes: WorkflowNodeDefinition[] = [
  {
    type: 'yolo_detection',
    label: 'YOLO检测',
    icon: Eye,
    category: 'detection',
    description: '使用YOLO模型进行目标检测',
    color: '#f59e0b',
    parameters: [
      {
        name: 'modelSource',
        label: '模型来源',
        type: 'select',
        defaultValue: 'builtin',
        required: true,
        options: [
          { label: '内置模型', value: 'builtin' },
          { label: '上传模型', value: 'upload' },
          { label: 'URL加载', value: 'url' }
        ],
        description: 'YOLO模型来源'
      },
      {
        name: 'modelPath',
        label: '模型路径',
        type: 'string',
        defaultValue: '',
        description: '自定义模型的路径或URL'
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
        description: '图像数据来源'
      },
      {
        name: 'confidence',
        label: '置信度阈值',
        type: 'slider',
        defaultValue: 0.5,
        min: 0.1,
        max: 1,
        step: 0.05,
        description: '检测置信度阈值',
        validation: (value) => ParameterValidator.validateNumber(value, 0.1, 1),
        priority: 9,
        group: '基础设置',
        inline: true
      },
      {
        name: 'iouThreshold',
        label: 'IOU阈值',
        type: 'slider',
        defaultValue: 0.45,
        min: 0.1,
        max: 1,
        step: 0.05,
        description: 'NMS IOU阈值',
        priority: 5,
        group: '高级设置',
        inline: true
      },
      {
        name: 'classes',
        label: '检测类别',
        type: 'string',
        defaultValue: '',
        description: '要检测的类别(逗号分隔,留空检测全部)',
        priority: 7,
        group: '基础设置',
        placeholder: '输入类别名称',
        inline: true
      },
      {
        name: 'drawResults',
        label: '绘制结果',
        type: 'boolean',
        defaultValue: true,
        description: '是否在图像上绘制检测框',
        priority: 6,
        group: '输出设置',
        inline: true
      },
      {
        name: 'outputVariable',
        label: '输出变量名',
        type: 'string',
        defaultValue: 'yolo_detections',
        required: true,
        description: '存储检测结果的变量名',
        priority: 8,
        group: '输出设置',
        placeholder: '变量名',
        inline: true
      }
    ]
  },
  {
    type: 'qr_scan',
    label: 'QR码扫描',
    icon: QrCode,
    category: 'detection',
    description: '扫描并识别QR码，支持多码检测和内容验证',
    color: '#8b5cf6',
    parameters: [
      {
        name: 'timeout',
        label: '超时时间',
        type: 'number',
        defaultValue: 10,
        min: 1,
        max: 60,
        required: true,
        description: '扫描超时时间',
        validation: (value) => ParameterValidator.validateNumber(value, 1, 60),
        priority: 10,
        group: '基础设置',
        unit: '秒',
        placeholder: '输入超时时间',
        inline: true
      },
      {
        name: 'scanRegion',
        label: '扫描区域',
        type: 'select',
        defaultValue: 'full',
        options: [
          { label: '全图', value: 'full' },
          { label: '中心区域', value: 'center' },
          { label: '上半部分', value: 'top' },
          { label: '下半部分', value: 'bottom' },
          { label: '自定义', value: 'custom' }
        ],
        description: '指定扫描的图像区域'
      },
      {
        name: 'customRegion',
        label: '自定义区域(x,y,w,h)',
        type: 'string',
        defaultValue: '',
        description: '自定义扫描区域坐标，格式: x,y,width,height'
      },
      {
        name: 'multiDetection',
        label: '多码检测',
        type: 'boolean',
        defaultValue: false,
        description: '是否检测图像中的所有QR码',
        priority: 8,
        group: '基础设置',
        inline: true
      },
      {
        name: 'maxDetections',
        label: '最大检测数',
        type: 'number',
        defaultValue: 5,
        min: 1,
        max: 20,
        description: '多码检测时的最大检测数量'
      },
      {
        name: 'validationPattern',
        label: '内容验证正则',
        type: 'string',
        defaultValue: '',
        description: 'QR码内容验证的正则表达式(留空不验证)'
      },
      {
        name: 'requiredPrefix',
        label: '必需前缀',
        type: 'string',
        defaultValue: '',
        description: 'QR码内容必须包含的前缀(留空不验证)'
      },
      {
        name: 'minLength',
        label: '最小长度',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 1000,
        description: 'QR码内容的最小长度(0表示不限制)'
      },
      {
        name: 'maxLength',
        label: '最大长度',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 1000,
        description: 'QR码内容的最大长度(0表示不限制)'
      },
      {
        name: 'parseFormat',
        label: '解析格式',
        type: 'select',
        defaultValue: 'auto',
        options: [
          { label: '自动识别', value: 'auto' },
          { label: 'JSON', value: 'json' },
          { label: 'URL', value: 'url' },
          { label: '键值对', value: 'keyvalue' },
          { label: '纯文本', value: 'text' }
        ],
        description: 'QR码内容的解析格式'
      },
      {
        name: 'aggregateResults',
        label: '聚合结果',
        type: 'boolean',
        defaultValue: true,
        description: '多码检测时是否聚合所有结果'
      },
      {
        name: 'drawAnnotations',
        label: '绘制标注',
        type: 'boolean',
        defaultValue: true,
        description: '是否在图像上绘制检测框和信息'
      },
      {
        name: 'saveImage',
        label: '保存图像',
        type: 'boolean',
        defaultValue: true,
        description: '是否保存扫描到的图像'
      },
      {
        name: 'continueOnFail',
        label: '失败继续',
        type: 'boolean',
        defaultValue: false,
        description: '扫描失败时是否继续执行'
      },
      {
        name: 'outputVariable',
        label: '输出变量名',
        type: 'string',
        defaultValue: 'qr_results',
        required: true,
        description: '存储QR码结果的变量名',
        priority: 9,
        group: '输出设置',
        placeholder: '变量名',
        inline: true
      }
    ]
  },
  {
    type: 'strawberry_detection',
    label: '草莓检测',
    icon: Scan,
    category: 'detection',
    description: '检测并识别草莓',
    color: '#ec4899',
    parameters: [
      {
        name: 'confidence',
        label: '置信度阈值',
        type: 'slider',
        defaultValue: 0.7,
        min: 0.1,
        max: 1,
        step: 0.05,
        description: '检测置信度阈值'
      },
      {
        name: 'timeout',
        label: '超时时间(秒)',
        type: 'number',
        defaultValue: 15,
        min: 1,
        max: 60,
        description: '检测超时时间'
      },
      {
        name: 'saveResults',
        label: '保存结果',
        type: 'boolean',
        defaultValue: true,
        description: '是否保存检测结果'
      },
      {
        name: 'outputVariable',
        label: '输出变量名',
        type: 'string',
        defaultValue: 'strawberry_data',
        required: true,
        description: '存储检测结果的变量名'
      }
    ]
  },
  {
    type: 'object_tracking',
    label: '目标跟踪',
    icon: Target,
    category: 'detection',
    description: '跟踪指定目标对象',
    color: '#8b5cf6',
    parameters: [
      {
        name: 'targetType',
        label: '目标类型',
        type: 'select',
        defaultValue: 'person',
        options: [
          { label: '人', value: 'person' },
          { label: '车辆', value: 'car' },
          { label: '动物', value: 'animal' },
          { label: '自定义', value: 'custom' }
        ],
        description: '要跟踪的目标类型'
      },
      {
        name: 'duration',
        label: '跟踪时长(秒)',
        type: 'number',
        defaultValue: 30,
        min: 5,
        max: 300,
        description: '跟踪持续时间'
      },
      {
        name: 'outputVariable',
        label: '输出变量名',
        type: 'string',
        defaultValue: 'tracking_data',
        required: true,
        description: '存储跟踪数据的变量名'
      }
    ]
  }
];
