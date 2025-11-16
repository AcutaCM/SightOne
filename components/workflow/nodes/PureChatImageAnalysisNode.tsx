'use client';

import React, { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Brain, Image as ImageIcon, CheckCircle, XCircle, Loader2, Camera, Upload, Variable } from 'lucide-react';
import { useAssistants } from '@/contexts/AssistantContext';

interface PureChatImageAnalysisNodeData {
  label: string;
  parameters: {
    assistantId: string;
    imageSource: 'camera' | 'upload' | 'variable';
    prompt: string;
    outputVariable: string;
  };
  status?: 'idle' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  progress?: number;
}

const PureChatImageAnalysisNode: React.FC<NodeProps<PureChatImageAnalysisNodeData>> = ({ data, selected }) => {
  const { publishedAssistants } = useAssistants();
  const [assistant, setAssistant] = useState<any>(null);

  useEffect(() => {
    if (data.parameters.assistantId) {
      const found = publishedAssistants.find(a => a.id === data.parameters.assistantId);
      setAssistant(found);
    }
  }, [data.parameters.assistantId, publishedAssistants]);

  const getStatusIcon = () => {
    switch (data.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-orange-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Brain className="w-4 h-4 text-purple-400" />;
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
        return <ImageIcon className="w-3 h-3" />;
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
        {/* Assistant Info */}
        {assistant && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-lg">{assistant.emoji}</span>
            <span className="text-gray-300 truncate flex-1">{assistant.title}</span>
          </div>
        )}

        {/* Image Source */}
        <div className="flex items-center gap-2 text-xs bg-[#0A192F]/50 rounded px-2 py-1">
          {getImageSourceIcon()}
          <span className="text-gray-300">{getImageSourceLabel()}</span>
        </div>

        {/* Prompt Preview */}
        {data.parameters.prompt && (
          <div className="text-xs text-gray-400 line-clamp-2 bg-[#0A192F]/50 rounded px-2 py-1">
            {data.parameters.prompt}
          </div>
        )}

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
            {data.progress !== undefined ? `分析中... ${data.progress}%` : 'AI正在分析图像...'}
          </div>
        )}

        {data.status === 'success' && data.result && (
          <div className="text-xs text-green-400">
            ✓ 分析完成
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

export default memo(PureChatImageAnalysisNode);
