'use client';

import React from 'react';
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Lightbulb,
  Code
} from 'lucide-react';

interface NodeDocumentationProps {
  nodeType: string;
}

interface Documentation {
  title: string;
  description: string;
  usage: string[];
  parameters: Array<{
    name: string;
    description: string;
    type: string;
    required: boolean;
  }>;
  examples: Array<{
    title: string;
    description: string;
    config: Record<string, any>;
  }>;
  tips: string[];
  warnings: string[];
}

const NodeDocumentation: React.FC<NodeDocumentationProps> = ({ nodeType }) => {
  const getDocumentation = (): Documentation | null => {
    switch (nodeType) {
      case 'purechat_chat':
        return {
          title: 'PureChat 对话节点',
          description: '调用PureChat AI助理进行自然语言对话，可用于智能问答、文本生成、数据分析等场景。',
          usage: [
            '选择合适的AI助理',
            '编写清晰的提示词',
            '调整温度参数控制创造性',
            '设置合理的Token限制',
            '指定输出变量名以便后续使用'
          ],
          parameters: [
            {
              name: 'assistantId',
              description: '要使用的AI助理ID，不同助理有不同的专长',
              type: 'string',
              required: true
            },
            {
              name: 'prompt',
              description: '发送给AI的提示词，描述你想让AI做什么',
              type: 'string',
              required: true
            },
            {
              name: 'temperature',
              description: '控制响应的随机性，0=精确，2=创造性',
              type: 'number (0-2)',
              required: false
            },
            {
              name: 'maxTokens',
              description: '生成文本的最大长度',
              type: 'number (100-4000)',
              required: false
            },
            {
              name: 'outputVariable',
              description: '存储AI响应的变量名',
              type: 'string',
              required: true
            }
          ],
          examples: [
            {
              title: '数据分析',
              description: '让AI分析无人机采集的数据',
              config: {
                prompt: '分析以下传感器数据，找出异常值：{sensor_data}',
                temperature: 0.3,
                maxTokens: 1000
              }
            },
            {
              title: '创意生成',
              description: '生成飞行路径建议',
              config: {
                prompt: '根据当前环境，建议3种不同的飞行路径',
                temperature: 1.2,
                maxTokens: 1500
              }
            }
          ],
          tips: [
            '提示词越具体，AI的回答越准确',
            '可以在提示词中引用其他节点的输出变量',
            '对于事实性任务，使用较低的温度参数',
            '对于创意性任务，使用较高的温度参数'
          ],
          warnings: [
            'AI响应时间可能较长，建议设置合理的超时',
            '确保选择的助理适合当前任务',
            'Token数量会影响成本和响应时间'
          ]
        };

      case 'purechat_image_analysis':
        return {
          title: 'PureChat 图像分析节点',
          description: '使用AI视觉模型分析图像内容，可识别对象、场景、文字等。',
          usage: [
            '选择支持视觉的AI助理',
            '指定图像来源（摄像头/上传/变量）',
            '编写分析提示词',
            '查看分析结果'
          ],
          parameters: [
            {
              name: 'assistantId',
              description: '支持视觉的AI助理ID',
              type: 'string',
              required: true
            },
            {
              name: 'imageSource',
              description: '图像数据来源',
              type: 'select (camera/upload/variable)',
              required: true
            },
            {
              name: 'prompt',
              description: '告诉AI你想从图像中了解什么',
              type: 'string',
              required: true
            },
            {
              name: 'outputVariable',
              description: '存储分析结果的变量名',
              type: 'string',
              required: true
            }
          ],
          examples: [
            {
              title: '对象识别',
              description: '识别图像中的所有对象',
              config: {
                prompt: '列出图像中的所有对象及其位置',
                imageSource: 'camera'
              }
            },
            {
              title: '质量检测',
              description: '检测产品缺陷',
              config: {
                prompt: '检查产品是否有缺陷、划痕或其他质量问题',
                imageSource: 'camera'
              }
            }
          ],
          tips: [
            '提示词应该明确说明要分析什么',
            '可以要求AI以特定格式返回结果（如JSON）',
            '对于复杂场景，可以分步骤进行多次分析'
          ],
          warnings: [
            '图像质量会影响分析准确性',
            '确保图像清晰且光线充足',
            '视觉分析比文本对话耗时更长'
          ]
        };

      case 'unipixel_segmentation':
        return {
          title: 'UniPixel 分割节点',
          description: '使用UniPixel服务进行语义分割，可精确识别和分割图像中的特定对象。',
          usage: [
            '指定图像来源',
            '编写分割查询（描述要分割的对象）',
            '调整置信度阈值',
            '设置采样帧数',
            '查看分割结果'
          ],
          parameters: [
            {
              name: 'imageSource',
              description: '图像数据来源',
              type: 'select (camera/upload/variable)',
              required: true
            },
            {
              name: 'query',
              description: '描述要分割的对象，如"草莓"、"成熟的水果"',
              type: 'string',
              required: true
            },
            {
              name: 'confidence',
              description: '分割置信度阈值，越高越严格',
              type: 'number (0.1-1)',
              required: false
            },
            {
              name: 'sampleFrames',
              description: '采样的视频帧数，多帧可提高准确性',
              type: 'number (1-10)',
              required: false
            },
            {
              name: 'visualize',
              description: '是否可视化分割结果',
              type: 'boolean',
              required: false
            },
            {
              name: 'outputVariable',
              description: '存储分割结果的变量名',
              type: 'string',
              required: true
            }
          ],
          examples: [
            {
              title: '水果分割',
              description: '分割图像中的草莓',
              config: {
                query: '草莓',
                confidence: 0.7,
                sampleFrames: 2,
                visualize: true
              }
            },
            {
              title: '多对象分割',
              description: '同时分割多种对象',
              config: {
                query: '成熟的草莓, 未成熟的草莓, 叶子',
                confidence: 0.6,
                sampleFrames: 3,
                visualize: true
              }
            }
          ],
          tips: [
            '查询描述越具体，分割越准确',
            '可以使用逗号分隔多个对象',
            '多帧采样可以提高准确性但会增加处理时间',
            '置信度阈值需要根据实际情况调整'
          ],
          warnings: [
            'UniPixel服务可能不可用，系统会自动降级到本地分割',
            '分割大图像或多帧会消耗较多时间',
            '确保网络连接稳定'
          ]
        };

      case 'yolo_detection':
        return {
          title: 'YOLO 检测节点',
          description: '使用YOLO模型进行目标检测，可识别和定位图像中的多个对象。',
          usage: [
            '选择或上传YOLO模型',
            '指定图像来源',
            '调整置信度和IOU阈值',
            '可选：指定要检测的类别',
            '查看检测结果'
          ],
          parameters: [
            {
              name: 'modelSource',
              description: '模型来源：内置/上传/URL',
              type: 'select (builtin/upload/url)',
              required: true
            },
            {
              name: 'modelPath',
              description: '自定义模型的路径或URL',
              type: 'string',
              required: false
            },
            {
              name: 'imageSource',
              description: '图像数据来源',
              type: 'select (camera/upload/variable)',
              required: true
            },
            {
              name: 'confidence',
              description: '检测置信度阈值',
              type: 'number (0.1-1)',
              required: false
            },
            {
              name: 'iouThreshold',
              description: 'NMS的IOU阈值',
              type: 'number (0.1-1)',
              required: false
            },
            {
              name: 'classes',
              description: '要检测的类别，逗号分隔',
              type: 'string',
              required: false
            },
            {
              name: 'drawResults',
              description: '是否在图像上绘制检测框',
              type: 'boolean',
              required: false
            },
            {
              name: 'outputVariable',
              description: '存储检测结果的变量名',
              type: 'string',
              required: true
            }
          ],
          examples: [
            {
              title: '通用检测',
              description: '检测所有对象',
              config: {
                modelSource: 'builtin',
                confidence: 0.5,
                iouThreshold: 0.45,
                drawResults: true
              }
            },
            {
              title: '特定类别检测',
              description: '只检测人和车',
              config: {
                modelSource: 'builtin',
                classes: 'person,car',
                confidence: 0.6,
                drawResults: true
              }
            }
          ],
          tips: [
            '置信度阈值越高，误检越少但可能漏检',
            'IOU阈值控制重叠框的合并程度',
            '可以通过classes参数过滤不需要的类别',
            '自定义模型需要是YOLO格式的.pt文件'
          ],
          warnings: [
            '首次加载模型可能需要较长时间',
            '确保模型文件格式正确',
            '检测大图像会消耗较多内存'
          ]
        };

      case 'challenge_8_flight':
        return {
          title: '8字飞行挑战',
          description: '执行8字形飞行轨迹，测试无人机的控制精度和稳定性。',
          usage: [
            '设置飞行半径',
            '设置飞行速度',
            '设置循环次数',
            '执行并查看评分'
          ],
          parameters: [
            {
              name: 'radius',
              description: '8字飞行的半径',
              type: 'number (50-300cm)',
              required: true
            },
            {
              name: 'speed',
              description: '飞行速度',
              type: 'number (10-100cm/s)',
              required: true
            },
            {
              name: 'loops',
              description: '完成8字的次数',
              type: 'number (1-10)',
              required: true
            },
            {
              name: 'timeout',
              description: '任务超时时间',
              type: 'number (seconds)',
              required: false
            },
            {
              name: 'scoreOutput',
              description: '存储评分的变量名',
              type: 'string',
              required: false
            }
          ],
          examples: [
            {
              title: '初学者练习',
              description: '小半径慢速飞行',
              config: {
                radius: 80,
                speed: 30,
                loops: 1
              }
            },
            {
              title: '竞赛模式',
              description: '大半径高速飞行',
              config: {
                radius: 200,
                speed: 80,
                loops: 3
              }
            }
          ],
          tips: [
            '从小半径和慢速度开始练习',
            '确保飞行空间足够大',
            '注意电池电量',
            '评分基于完成时间和轨迹精度'
          ],
          warnings: [
            '需要足够的飞行空间',
            '高速飞行风险较大，注意安全',
            '确保无人机状态良好'
          ]
        };

      case 'challenge_precision_land':
        return {
          title: '精准降落挑战',
          description: '在指定位置精准降落，测试定位和控制精度。',
          usage: [
            '设置目标降落位置',
            '设置精度要求',
            '执行降落',
            '查看评分'
          ],
          parameters: [
            {
              name: 'targetX',
              description: '目标X坐标',
              type: 'number (cm)',
              required: true
            },
            {
              name: 'targetY',
              description: '目标Y坐标',
              type: 'number (cm)',
              required: true
            },
            {
              name: 'precision',
              description: '允许的误差范围',
              type: 'number (1-50cm)',
              required: true
            },
            {
              name: 'timeout',
              description: '任务超时时间',
              type: 'number (seconds)',
              required: false
            },
            {
              name: 'scoreOutput',
              description: '存储评分的变量名',
              type: 'string',
              required: false
            }
          ],
          examples: [
            {
              title: '宽松模式',
              description: '30cm误差范围',
              config: {
                targetX: 0,
                targetY: 0,
                precision: 30
              }
            },
            {
              title: '专家模式',
              description: '5cm误差范围',
              config: {
                targetX: 0,
                targetY: 0,
                precision: 5
              }
            }
          ],
          tips: [
            '在目标位置放置明显标记',
            '确保GPS信号良好',
            '风力会影响精度',
            '评分基于实际降落位置与目标的距离'
          ],
          warnings: [
            '确保降落区域安全',
            '注意周围障碍物',
            '强风天气不建议进行精准降落'
          ]
        };

      default:
        return null;
    }
  };

  const doc = getDocumentation();

  if (!doc) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">此节点类型暂无文档</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white mb-2">{doc.title}</h2>
        <p className="text-gray-300">{doc.description}</p>
      </div>

      {/* Usage */}
      <Card className="bg-[#193059] border border-[#64FFDA]/20">
        <CardBody>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-[#64FFDA]" />
            <h3 className="text-lg font-semibold text-white">使用步骤</h3>
          </div>
          <ol className="space-y-2 list-decimal list-inside text-gray-300">
            {doc.usage.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </CardBody>
      </Card>

      {/* Parameters */}
      <Card className="bg-[#193059] border border-[#64FFDA]/20">
        <CardBody>
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-5 h-5 text-[#64FFDA]" />
            <h3 className="text-lg font-semibold text-white">参数说明</h3>
          </div>
          <div className="space-y-3">
            {doc.parameters.map((param, index) => (
              <div key={index} className="border-l-2 border-[#64FFDA]/30 pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-[#64FFDA] font-mono text-sm">
                    {param.name}
                  </code>
                  {param.required && (
                    <Chip size="sm" color="danger" variant="flat">
                      必填
                    </Chip>
                  )}
                  <Chip size="sm" variant="flat" className="bg-gray-700 text-gray-300">
                    {param.type}
                  </Chip>
                </div>
                <p className="text-sm text-gray-300">{param.description}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Examples */}
      {doc.examples.length > 0 && (
        <Card className="bg-[#193059] border border-[#64FFDA]/20">
          <CardBody>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-[#64FFDA]" />
              <h3 className="text-lg font-semibold text-white">使用示例</h3>
            </div>
            <div className="space-y-4">
              {doc.examples.map((example, index) => (
                <div key={index} className="bg-[#0A192F]/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-1">
                    {example.title}
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">
                    {example.description}
                  </p>
                  <pre className="bg-black/30 p-3 rounded text-xs text-[#64FFDA] overflow-x-auto">
                    {JSON.stringify(example.config, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tips */}
      {doc.tips.length > 0 && (
        <Card className="bg-blue-500/10 border border-blue-500/30">
          <CardBody>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-300">使用技巧</h3>
            </div>
            <ul className="space-y-2 list-disc list-inside text-blue-200">
              {doc.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Warnings */}
      {doc.warnings.length > 0 && (
        <Card className="bg-yellow-500/10 border border-yellow-500/30">
          <CardBody>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-300">注意事项</h3>
            </div>
            <ul className="space-y-2 list-disc list-inside text-yellow-200">
              {doc.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default NodeDocumentation;
