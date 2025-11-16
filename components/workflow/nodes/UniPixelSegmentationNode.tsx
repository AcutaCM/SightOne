'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Scissors, CheckCircle, XCircle, Loader2, Camera, Upload, Variable, Eye, EyeOff } from 'lucide-react';

interface UniPixelSegmentationNodeData {
  label: string;
  parameters: {
    imageSource: 'camera' | 'upload' | 'variable';
    query: string;
    confidence: number;
    sampleFrames: number;
    visualize: boolean;
    outputVariable: string;
  };
  status?: 'idle' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  progress?: number;
}

const UniPixelSegmentationNode: React.FC<NodeProps<UniPixelSegmentationNodeData>> = ({ data, selected }) => {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-orange-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Scissors className="w-4 h-4 text-purple-400" />;
    }
  };

  const getImageSourceIcon = () => {
    switch (data.parameters.imageSource) {
      case 'camera':
        return <Camera className="w-3 h-3" />;
      case 'upload':
        return <Upload className="w-3 h-3" />;
      case 'variable':
        return <Variable className="w-3 h-3" />;
      default:
        return <Camera className="w-3 h-3" />;
    }
  };

  const getImageSourceLabel = () => {
    switch (data.parameters.imageSource) {
      case 'camera':
        return '摄像头';
      case 'upload':
        return '上传';
      case 'variable':
        return '变量';
      default:
        return '未知';
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'running':
        return 'border-orange-400 shadow-orange-400/50';
      case 'success':
        return 'border-green-400 shadow-green-400/50';
      case 'error':
        return 'border-red-400 shadow-red-400/50';
      default:
        return 'border-purple-400';
    }
  };

  return (
    <div
      className={`
        relative bg-[#1E3A5F] rounded-lg border-2 transition-all duration-200
        ${getStatusColor()}
        ${selected ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[#0A192F]' : ''}
        ${data.status === 'running' ? 'shadow-lg' : 'shadow-md'}
        min-w-[200px] max-w-[280px]
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-purple-400 border-2 border-[#1E3A5F]"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-purple-400/30">
        {getStatusIcon()}
        <span className="text-sm font-medium text-white flex-1 truncate">
          {data.label}
        </span>
      </div>

      {/* Content */}
      <div className="px-3 py-2 space-y-2">
        {/* Image Source */}
        <div className="flex items-center gap-2 text-xs bg-[#0A192F]/50 rounded px-2 py-1">
          {getImageSourceIcon()}
          <span className="text-gray-300">{getImageSourceLabel()}</span>
        </div>

        {/* Query */}
        {data.parameters.query && (
          <div className="text-xs bg-[#0A192F]/50 rounded px-2 py-1">
            <div className="text-gray-400 mb-1">查询:</div>
            <div className="text-purple-300 line-clamp-2">
              "{data.parameters.query}"
            </div>
          </div>
        )}

        {/* Parameters */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex-1 bg-[#0A192F]/50 rounded px-2 py-1">
            <span className="text-gray-400">置信度: </span>
            <span className="text-purple-300">{(data.parameters.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="flex-1 bg-[#0A192F]/50 rounded px-2 py-1">
            <span className="text-gray-400">帧数: </span>
            <span className="text-purple-300">{data.parameters.sampleFrames}</span>
          </div>
        </div>

        {/* Visualization Toggle */}
        <div className="flex items-center gap-2 text-xs bg-[#0A192F]/50 rounded px-2 py-1">
          {data.parameters.visualize ? (
            <>
              <Eye className="w-3 h-3 text-green-400" />
              <span className="text-green-400">可视化开启</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400">可视化关闭</span>
            </>
          )}
        </div>

        {/* Output Variable */}
        <div className="text-xs text-purple-300">
          → {data.parameters.outputVariable}
        </div>

        {/* Progress Bar */}
        {data.status === 'running' && data.progress !== undefined && (
          <div className="w-full bg-[#0A192F] rounded-full h-1.5">
            <div
              className="bg-orange-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${data.progress}%` }}
            />
          </div>
        )}

        {/* Status Message */}
        {data.status === 'running' && (
          <div className="text-xs text-orange-400 animate-pulse">
            {data.progress !== undefined ? `分割中... ${data.progress}%` : '正在执行语义分割...'}
          </div>
        )}

        {data.status === 'success' && data.result && (
          <div className="text-xs text-green-400">
            ✓ 分割完成
            {data.result.description && (
              <div className="text-gray-400 mt-1 line-clamp-2">
                {data.result.description}
              </div>
            )}
          </div>
        )}

        {data.status === 'error' && data.error && (
          <div className="text-xs text-red-400 line-clamp-2">
            ✗ {data.error}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-purple-400 border-2 border-[#1E3A5F]"
      />

      {/* Running Animation */}
      {data.status === 'running' && (
        <div className="absolute inset-0 rounded-lg border-2 border-orange-400 animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

export default memo(UniPixelSegmentationNode);
