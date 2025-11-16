/**
 * QR Scan Node Component
 * Enhanced QR code detection with validation and multi-detection support
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { QrCode, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface QRScanNodeData {
  label: string;
  nodeType: string;
  parameters: {
    timeout?: number;
    scanRegion?: string;
    customRegion?: string;
    multiDetection?: boolean;
    maxDetections?: number;
    validationPattern?: string;
    requiredPrefix?: string;
    minLength?: number;
    maxLength?: number;
    parseFormat?: string;
    aggregateResults?: boolean;
    drawAnnotations?: boolean;
    saveImage?: boolean;
    continueOnFail?: boolean;
    outputVariable?: string;
  };
  status?: 'idle' | 'running' | 'success' | 'error' | 'skipped';
  result?: {
    success: boolean;
    count: number;
    detections?: any[];
    aggregated?: any;
  };
}

export default function QRScanNode({ data, selected }: NodeProps<QRScanNodeData>) {
  const params = data.parameters || {};
  const status = data.status || 'idle';
  const result = data.result;

  // Status colors
  const statusColors = {
    idle: 'border-gray-500 bg-gray-900',
    running: 'border-yellow-500 bg-yellow-900/20 animate-pulse',
    success: 'border-green-500 bg-green-900/20',
    error: 'border-red-500 bg-red-900/20',
    skipped: 'border-purple-500 bg-purple-900/20',
  };

  // Status icons
  const StatusIcon = () => {
    switch (status) {
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'skipped':
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <QrCode className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[200px] max-w-[280px]
        ${statusColors[status]}
        ${selected ? 'ring-2 ring-blue-500' : ''}
        transition-all duration-200
        shadow-lg
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <StatusIcon />
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">
            {data.label}
          </div>
          <div className="text-xs text-gray-400">
            QR码扫描
          </div>
        </div>
      </div>

      {/* Parameters Summary */}
      <div className="space-y-1 text-xs text-gray-300">
        <div className="flex justify-between">
          <span className="text-gray-400">超时:</span>
          <span>{params.timeout || 10}秒</span>
        </div>
        
        {params.multiDetection && (
          <div className="flex justify-between">
            <span className="text-gray-400">多码检测:</span>
            <span className="text-green-400">最多{params.maxDetections || 5}个</span>
          </div>
        )}

        {params.scanRegion && params.scanRegion !== 'full' && (
          <div className="flex justify-between">
            <span className="text-gray-400">扫描区域:</span>
            <span className="text-blue-400">
              {params.scanRegion === 'center' && '中心'}
              {params.scanRegion === 'top' && '上半'}
              {params.scanRegion === 'bottom' && '下半'}
              {params.scanRegion === 'custom' && '自定义'}
            </span>
          </div>
        )}

        {params.validationPattern && (
          <div className="flex items-center gap-1">
            <span className="text-gray-400">验证:</span>
            <span className="text-yellow-400 truncate" title={params.validationPattern}>
              正则匹配
            </span>
          </div>
        )}

        {params.requiredPrefix && (
          <div className="flex items-center gap-1">
            <span className="text-gray-400">前缀:</span>
            <span className="text-yellow-400 truncate" title={params.requiredPrefix}>
              {params.requiredPrefix}
            </span>
          </div>
        )}

        {params.parseFormat && params.parseFormat !== 'auto' && (
          <div className="flex justify-between">
            <span className="text-gray-400">解析:</span>
            <span className="text-cyan-400">{params.parseFormat.toUpperCase()}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-400">输出:</span>
          <span className="text-purple-400 truncate" title={params.outputVariable}>
            {params.outputVariable || 'qr_results'}
          </span>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          {result.success ? (
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-3 h-3" />
                <span>检测到 {result.count} 个QR码</span>
              </div>
              
              {result.detections && result.detections.length > 0 && (
                <div className="space-y-1 mt-1">
                  {result.detections.slice(0, 3).map((detection, idx) => (
                    <div key={idx} className="text-gray-300 truncate" title={detection.data}>
                      {idx + 1}. {detection.data.substring(0, 30)}
                      {detection.data.length > 30 && '...'}
                      {detection.plant_id && (
                        <span className="text-blue-400 ml-1">
                          (ID:{detection.plant_id})
                        </span>
                      )}
                    </div>
                  ))}
                  {result.detections.length > 3 && (
                    <div className="text-gray-500">
                      ...还有 {result.detections.length - 3} 个
                    </div>
                  )}
                </div>
              )}

              {result.aggregated && (
                <div className="mt-1 text-gray-400">
                  有效: {result.aggregated.valid} / 无效: {result.aggregated.invalid}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400 text-xs">
              <XCircle className="w-3 h-3" />
              <span>未检测到QR码</span>
            </div>
          )}
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />
    </div>
  );
}
