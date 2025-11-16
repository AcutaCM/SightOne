'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Switch } from "@heroui/switch";
import { Progress } from "@heroui/progress";
import { 
  Activity, 
  Zap, 
  Database, 
  TrendingUp, 
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PerformanceMonitorProps {
  virtualizationStats?: {
    isVirtualized: boolean;
    nodeReduction: number;
    edgeReduction: number;
    performanceGain: string;
  };
  lazyLoadStats?: {
    cachedNodes: number;
    loadingNodes: number;
    cacheEnabled: boolean;
  };
  optimizationStats?: {
    cacheSize: number;
    cacheHitRate: number;
    avgExecutionTime: number;
    totalExecutions: number;
    optimizationsEnabled: string[];
  };
  onConfigChange?: (config: any) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  virtualizationStats,
  lazyLoadStats,
  optimizationStats,
  onConfigChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [enableVirtualization, setEnableVirtualization] = useState(true);
  const [enableLazyLoad, setEnableLazyLoad] = useState(true);
  const [enableOptimization, setEnableOptimization] = useState(true);

  const handleConfigChange = (key: string, value: boolean) => {
    const config = {
      virtualization: key === 'virtualization' ? value : enableVirtualization,
      lazyLoad: key === 'lazyLoad' ? value : enableLazyLoad,
      optimization: key === 'optimization' ? value : enableOptimization
    };

    if (key === 'virtualization') setEnableVirtualization(value);
    if (key === 'lazyLoad') setEnableLazyLoad(value);
    if (key === 'optimization') setEnableOptimization(value);

    onConfigChange?.(config);
  };

  return (
    <Card className="bg-content1 border border-divider">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="text-primary" size={20} />
          <h3 className="text-lg font-semibold">性能监控</h3>
        </div>
        <Button
          size="sm"
          variant="light"
          isIconOnly
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Settings size={16} />
        </Button>
      </CardHeader>

      <Divider />

      <CardBody className="gap-4">
        {/* Virtualization Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="text-warning" size={16} />
              <span className="text-sm font-medium">虚拟化渲染</span>
            </div>
            {virtualizationStats?.isVirtualized ? (
              <CheckCircle className="text-success" size={16} />
            ) : (
              <XCircle className="text-default-400" size={16} />
            )}
          </div>

          {virtualizationStats && (
            <div className="pl-6 space-y-1 text-xs text-default-600">
              <div className="flex justify-between">
                <span>节点优化:</span>
                <span className="text-success font-medium">
                  {virtualizationStats.nodeReduction.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>连接优化:</span>
                <span className="text-success font-medium">
                  {virtualizationStats.edgeReduction.toFixed(1)}%
                </span>
              </div>
              <Progress
                size="sm"
                value={virtualizationStats.nodeReduction}
                color="success"
                className="mt-1"
              />
            </div>
          )}

          {isExpanded && (
            <div className="pl-6 mt-2">
              <Switch
                size="sm"
                isSelected={enableVirtualization}
                onValueChange={(value) => handleConfigChange('virtualization', value)}
              >
                <span className="text-xs">启用虚拟化</span>
              </Switch>
            </div>
          )}
        </div>

        <Divider />

        {/* Lazy Loading Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="text-primary" size={16} />
              <span className="text-sm font-medium">懒加载</span>
            </div>
            {lazyLoadStats?.cacheEnabled ? (
              <CheckCircle className="text-success" size={16} />
            ) : (
              <XCircle className="text-default-400" size={16} />
            )}
          </div>

          {lazyLoadStats && (
            <div className="pl-6 space-y-1 text-xs text-default-600">
              <div className="flex justify-between">
                <span>已缓存组件:</span>
                <span className="text-primary font-medium">
                  {lazyLoadStats.cachedNodes}
                </span>
              </div>
              <div className="flex justify-between">
                <span>加载中:</span>
                <span className="text-warning font-medium">
                  {lazyLoadStats.loadingNodes}
                </span>
              </div>
            </div>
          )}

          {isExpanded && (
            <div className="pl-6 mt-2">
              <Switch
                size="sm"
                isSelected={enableLazyLoad}
                onValueChange={(value) => handleConfigChange('lazyLoad', value)}
              >
                <span className="text-xs">启用懒加载</span>
              </Switch>
            </div>
          )}
        </div>

        <Divider />

        {/* Execution Optimization Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="text-secondary" size={16} />
              <span className="text-sm font-medium">执行优化</span>
            </div>
            {optimizationStats && optimizationStats.optimizationsEnabled.length > 0 ? (
              <CheckCircle className="text-success" size={16} />
            ) : (
              <XCircle className="text-default-400" size={16} />
            )}
          </div>

          {optimizationStats && (
            <div className="pl-6 space-y-1 text-xs text-default-600">
              <div className="flex justify-between">
                <span>缓存大小:</span>
                <span className="text-secondary font-medium">
                  {optimizationStats.cacheSize}
                </span>
              </div>
              <div className="flex justify-between">
                <span>总执行次数:</span>
                <span className="text-default-500 font-medium">
                  {optimizationStats.totalExecutions}
                </span>
              </div>
              <div className="flex justify-between">
                <span>平均执行时间:</span>
                <span className="text-default-500 font-medium">
                  {optimizationStats.avgExecutionTime.toFixed(0)}ms
                </span>
              </div>
              {optimizationStats.optimizationsEnabled.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-default-500 mb-1">已启用优化:</div>
                  <div className="flex flex-wrap gap-1">
                    {optimizationStats.optimizationsEnabled.map((opt, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-success/20 text-success rounded text-xs"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isExpanded && (
            <div className="pl-6 mt-2">
              <Switch
                size="sm"
                isSelected={enableOptimization}
                onValueChange={(value) => handleConfigChange('optimization', value)}
              >
                <span className="text-xs">启用执行优化</span>
              </Switch>
            </div>
          )}
        </div>

        {/* Overall Performance Indicator */}
        {(virtualizationStats || lazyLoadStats || optimizationStats) && (
          <>
            <Divider />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-success" size={16} />
                <span className="text-sm font-medium">整体性能</span>
              </div>
              <div className="pl-6">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Progress
                      size="sm"
                      value={calculateOverallPerformance(
                        virtualizationStats,
                        lazyLoadStats,
                        optimizationStats
                      )}
                      color="success"
                      className="mb-1"
                    />
                  </div>
                  <span className="text-xs text-success font-medium">
                    {calculateOverallPerformance(
                      virtualizationStats,
                      lazyLoadStats,
                      optimizationStats
                    ).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-default-500 mt-1">
                  性能优化已提升工作流执行效率
                </p>
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

// Helper function to calculate overall performance score
function calculateOverallPerformance(
  virtualizationStats?: any,
  lazyLoadStats?: any,
  optimizationStats?: any
): number {
  let score = 0;
  let factors = 0;

  if (virtualizationStats?.isVirtualized) {
    score += virtualizationStats.nodeReduction;
    factors++;
  }

  if (lazyLoadStats?.cacheEnabled && lazyLoadStats.cachedNodes > 0) {
    score += Math.min(lazyLoadStats.cachedNodes * 5, 50);
    factors++;
  }

  if (optimizationStats && optimizationStats.optimizationsEnabled.length > 0) {
    score += optimizationStats.optimizationsEnabled.length * 15;
    factors++;
  }

  return factors > 0 ? Math.min(score / factors, 100) : 0;
}

export default PerformanceMonitor;
