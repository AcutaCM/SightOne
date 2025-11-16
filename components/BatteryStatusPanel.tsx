'use client';

import React, { useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useDraggable } from '../hooks/useDraggable';
import { useLayout, useComponentLayout } from '@/contexts/LayoutContext';
import { useSnapAlignment, SnapLine } from '../hooks/useSnapAlignment';
import { useGridSnap } from '../hooks/useGridSnap';
import { getCardPanelStyle } from '@/lib/panel-styles';

interface BatteryStatusPanelProps {
  batteryLevel: number;
  isCharging?: boolean;
}

export default function BatteryStatusPanel({ batteryLevel, isCharging = false }: BatteryStatusPanelProps) {
  const { theme } = useTheme();
  const componentId = 'battery-status';
  const cardRef = useRef<HTMLDivElement>(null);
  const { isEditMode, layouts } = useLayout();
  const { layout, updateLayout } = useComponentLayout(componentId);
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);
  
  // 智能对齐hook
  const { calculateSnapPosition } = useSnapAlignment({
    layouts,
    currentId: componentId,
    snapThreshold: 10
  });
  
  // 网格吸附hook
  const { snapToGrid } = useGridSnap({
    gridSize: 20,
    snapThreshold: 10,
    enabled: isEditMode
  });
  
  // 获取初始位置和尺寸
  const getInitialPosition = () => {
    if (layout?.position) {
      console.log(`组件 ${componentId} 使用保存的位置:`, layout.position);
      return layout.position;
    }
    console.log(`组件 ${componentId} 使用默认位置:`, { x: 1220, y: 440 });
    return { x: 1220, y: 440 };
  };
  
  const getInitialSize = () => {
    if (layout?.size) {
      console.log(`组件 ${componentId} 使用保存的尺寸:`, layout.size);
      return layout.size;
    }
    console.log(`组件 ${componentId} 使用默认尺寸:`, { width: 356, height: 332 });
    return { width: 356, height: 332 };
  };
  
  const {
    position,
    size,
    isDragging,
    isResizing,
    handleDragStart,
    handleResizeStart,
    setPosition,
    setSize,
  } = useDraggable({
    initialPosition: getInitialPosition(),
    initialSize: getInitialSize(),
    onDrag: (newPosition) => {
      if (isEditMode) {
        // 首先尝试网格吸附
        const gridSnapResult = snapToGrid(newPosition);
        // 然后尝试组件对齐
        const snapResult = calculateSnapPosition(gridSnapResult.position, size);
        setSnapLines(snapResult.snapLines);
      }
    },
    onDragEnd: (newPosition) => {
      if (isEditMode) {
        // 保存新位置
        updateLayout({ position: newPosition, size });
        setSnapLines([]);
      }
    },
    onResizeEnd: (newSize) => {
      if (isEditMode) {
        // 保存新尺寸
        updateLayout({ position, size: newSize });
      }
    }
  });

  const getBatteryColor = (level: number) => {
    // Use NextUI theme-aware colors
    if (level > 60) return 'hsl(var(--nextui-success))'; // Success color
    if (level > 30) return 'hsl(var(--nextui-warning))'; // Warning color
    return 'hsl(var(--nextui-danger))'; // Danger color
  };
  
  const getBatteryColorClass = (level: number) => {
    if (level > 60) return 'text-success';
    if (level > 30) return 'text-warning';
    return 'text-danger';
  };

  const getBatteryMessage = (level: number) => {
    if (level > 80) return '元气满满呀，快开始飞行';
    if (level > 50) return '电量充足，可以正常飞行';
    if (level > 20) return '电量偏低，建议充电';
    return '电量不足，请立即充电';
  };

  const batteryColor = getBatteryColor(batteryLevel);
  const batteryColorClass = getBatteryColorClass(batteryLevel);
  const batteryMessage = getBatteryMessage(batteryLevel);
  const circumference = 2 * Math.PI * 90; // 半径90的圆周长
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (batteryLevel / 100) * circumference;

  return (
    <div
      ref={cardRef}
      className={`absolute ${isEditMode ? 'cursor-move' : ''} ${isDragging ? 'z-50' : 'z-10'}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
      onMouseDown={isEditMode ? handleDragStart : undefined}
    >
      {/* 拖拽和调整大小的控制点 */}
      {isEditMode && (
        <>
          {/* 调整大小控制点 */}
          <div
             className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize z-10 opacity-80 hover:opacity-100"
             onMouseDown={(e) => {
               e.stopPropagation();
               handleResizeStart(e, 'bottom-right');
             }}
           />
          {/* 组件标识 */}
          <div className="absolute -top-6 left-0 text-xs text-blue-400 bg-black/50 px-2 py-1 rounded">
            电池状况
          </div>
        </>
      )}
      
      {/* 智能对齐线 */}
      {isEditMode && snapLines.map((line, index) => (
        <div
          key={index}
          className="fixed bg-blue-500 z-50"
          style={{
            left: line.type === 'vertical' ? line.position : 0,
            top: line.type === 'horizontal' ? line.position : 0,
            width: line.type === 'vertical' ? '1px' : '100vw',
            height: line.type === 'horizontal' ? '1px' : '100vh',
            pointerEvents: 'none',
          }}
        />
      ))}
      
      <div className="w-full h-full rounded-2xl p-6 relative overflow-hidden" style={getCardPanelStyle(theme as 'light' | 'dark')}>
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-success/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 w-full h-full flex flex-col">
          {/* 标题区域 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-foreground/80 font-semibold text-sm tracking-wide uppercase">
                🔋 电池状态
              </h3>
              {isCharging && (
                <div className="flex items-center gap-1 text-xs text-success">
                  <svg className="w-4 h-4 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z" />
                  </svg>
                  <span>充电中</span>
                </div>
              )}
            </div>
          </div>
          
          {/* 电池可视化 */}
          <div className="flex-1 flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              {/* SVG 圆形进度条 */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                {/* 背景圆环 */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-foreground/10"
                />
                {/* 进度圆环 */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  stroke={batteryColor}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px ${batteryColor}80)`
                  }}
                />
              </svg>
              
              {/* 中心内容 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-5xl font-bold mb-1 ${batteryColorClass}`}>
                  {batteryLevel}
                </div>
                <div className="text-sm text-foreground/60">
                  %
                </div>
                {/* 闪电图标 */}
                <div className={`mt-2 w-10 h-10 rounded-full flex items-center justify-center ${batteryColorClass} bg-opacity-20`}>
                  <svg className={`w-5 h-5 ${batteryColorClass}`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* 状态信息 */}
          <div className="space-y-3">
            {/* 电量条 */}
            <div className="relative h-2 bg-foreground/10 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${batteryLevel}%`,
                  backgroundColor: batteryColor
                }}
              />
            </div>
            
            {/* 状态文字 */}
            <div className="text-center">
              <p className="text-foreground/80 text-sm font-medium">
                {batteryMessage}
              </p>
            </div>
            
            {/* 电量范围指示 */}
            <div className="flex justify-between text-xs text-foreground/40">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}