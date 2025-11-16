import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Crosshair, Target, AlertCircle } from 'lucide-react';

interface ChallengePrecisionLandData {
  label: string;
  nodeType: string;
  parameters: {
    targetPosition: string;
    precision: number;
    maxAttempts: number;
    timeout: number;
    scoreOutput: string;
  };
  status?: 'idle' | 'running' | 'success' | 'error' | 'skipped';
  result?: any;
}

export const ChallengePrecisionLandNode: React.FC<NodeProps<ChallengePrecisionLandData>> = ({ data, selected }) => {
  const { parameters, status = 'idle', result } = data;

  const getTargetPosition = () => {
    try {
      const pos = JSON.parse(parameters.targetPosition);
      return `(${pos.x}, ${pos.y})`;
    } catch {
      return '(0, 0)';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'border-orange-500 bg-orange-500/10';
      case 'success': return 'border-green-500 bg-green-500/10';
      case 'error': return 'border-red-500 bg-red-500/10';
      case 'skipped': return 'border-purple-500 bg-purple-500/10';
      default: return 'border-orange-400 bg-[#1E3A5F]';
    }
  };

  const getStatusIcon = () => {
    if (status === 'running') {
      return <Crosshair className="w-4 h-4 text-orange-500 animate-pulse" />;
    }
    return <Crosshair className="w-4 h-4 text-orange-400" />;
  };

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[200px]
        transition-all duration-200
        ${getStatusColor()}
        ${selected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0A192F]' : ''}
        ${status === 'running' ? 'shadow-lg shadow-orange-500/30' : 'shadow-md'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-400 border-2 border-white"
      />

      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <span className="text-white font-medium text-sm">{data.label}</span>
      </div>

      <div className="space-y-1 text-xs text-gray-300">
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          <span>目标: {getTargetPosition()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Crosshair className="w-3 h-3" />
          <span>精度: ±{parameters.precision}cm</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>最多尝试: {parameters.maxAttempts}次</span>
        </div>
      </div>

      {result && result.score !== undefined && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-xs text-cyan-400">
            评分: {result.score.toFixed(1)}/100
          </div>
          {result.finalError !== undefined && (
            <div className="text-xs text-gray-400">
              误差: {result.finalError.toFixed(1)}cm
            </div>
          )}
          {result.attempts !== undefined && (
            <div className="text-xs text-gray-400">
              尝试: {result.attempts}次
            </div>
          )}
        </div>
      )}

      {status === 'error' && result?.error && (
        <div className="mt-2 pt-2 border-t border-red-500/30">
          <div className="text-xs text-red-400">{result.error}</div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-orange-400 border-2 border-white"
      />
    </div>
  );
};
