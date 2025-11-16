'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Eye, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface YOLODetectionNodeData {
  label: string;
  nodeType: string;
  parameters: {
    modelSource: 'builtin' | 'upload' | 'url';
    modelPath?: string;
    imageSource: 'camera' | 'upload' | 'variable';
    confidence: number;
    iouThreshold: number;
    classes?: string;
    drawResults: boolean;
    outputVariable: string;
  };
  status?: 'idle' | 'running' | 'success' | 'error' | 'skipped';
  result?: any;
}

const YOLODetectionNode: React.FC<NodeProps<YOLODetectionNodeData>> = ({ data, selected }) => {
  const { label, parameters, status = 'idle', result } = data;

  // 状态颜色映射
  const statusColors = {
    idle: 'border-gray-500 bg-gray-900',
    running: 'border-orange-500 bg-orange-900/20 animate-pulse',
    success: 'border-green-500 bg-green-900/20',
    error: 'border-red-500 bg-red-900/20',
    skipped: 'border-purple-500 bg-purple-900/20'
  };

  // 状态图标
  const StatusIcon = () => {
    switch (status) {
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Eye className="w-4 h-4 text-orange-500" />;
    }
  };

  // 模型来源显示
  const getModelSourceLabel = () => {
    switch (parameters.modelSource) {
      case 'builtin':
        return '内置模型';
      case 'upload':
        return '自定义模型';
      case 'url':
        return 'URL模型';
      default:
        return '未知';
    }
  };

  // 图像来源显示
  const getImageSourceLabel = () => {
    switch (parameters.imageSource) {
      case 'camera':
        return '摄像头';
      case 'upload':
        return '上传图片';
      case 'variable':
        return '变量';
      default:
        return '未知';
    }
  };

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 shadow-lg
        transition-all duration-200 min-w-[200px]
        ${statusColors[status]}
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''}
      `}
    >
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
      />

      {/* 节点头部 */}
      <div className="flex items-center gap-2 mb-2">
        <StatusIcon />
        <div className="flex-1">
          <div className="font-semibold text-white text-sm">{label}</div>
          <div className="text-xs text-gray-400">YOLO检测</div>
        </div>
      </div>

      {/* 节点参数信息 */}
      <div className="space-y-1 text-xs text-gray-300">
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>模型: {getModelSourceLabel()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Upload className="w-3 h-3" />
          <span>图像: {getImageSourceLabel()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>置信度: {(parameters.confidence * 100).toFixed(0)}%</span>
        </div>
        {parameters.classes && (
          <div className="flex items-center gap-1">
            <span>类别: {parameters.classes}</span>
          </div>
        )}
      </div>

      {/* 检测结果显示 */}
      {status === 'success' && result && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-xs text-green-400">
            检测到 {result.detections?.length || 0} 个目标
          </div>
          {result.detections && result.detections.length > 0 && (
            <div className="mt-1 space-y-1">
              {result.detections.slice(0, 3).map((det: any, idx: number) => (
                <div key={idx} className="text-xs text-gray-400">
                  {det.class}: {(det.confidence * 100).toFixed(1)}%
                </div>
              ))}
              {result.detections.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{result.detections.length - 3} 更多...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 错误信息显示 */}
      {status === 'error' && result?.error && (
        <div className="mt-2 pt-2 border-t border-red-700">
          <div className="text-xs text-red-400">
            {result.error}
          </div>
        </div>
      )}

      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-orange-500 border-2 border-white"
      />
    </div>
  );
};

export default YOLODetectionNode;
