import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { RefreshCw, Clock, Zap } from 'lucide-react';

interface Challenge8FlightData {
  label: string;
  nodeType: string;
  parameters: {
    radius: number;
    speed: number;
    loops: number;
    timeout: number;
    scoreOutput: string;
  };
  status?: 'idle' | 'running' | 'success' | 'error' | 'skipped';
  result?: any;
}

export const Challenge8FlightNode: React.FC<NodeProps<Challenge8FlightData>> = ({ data, selected }) => {
  const { parameters, status = 'idle', result } = data;

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
      return <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />;
    }
    return <RefreshCw className="w-4 h-4 text-orange-400" />;
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
          <Zap className="w-3 h-3" />
          <span>半径: {parameters.radius}cm</span>
        </div>
        <div className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          <span>循环: {parameters.loops}次</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>速度: {parameters.speed}%</span>
        </div>
      </div>

      {result && result.score !== undefined && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-xs text-cyan-400">
            评分: {result.score.toFixed(1)}/100
          </div>
          {result.completionTime && (
            <div className="text-xs text-gray-400">
              用时: {result.completionTime.toFixed(1)}s
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
