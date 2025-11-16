'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useDraggable } from '../hooks/useDraggable';
import { useLayout, useComponentLayout } from '@/contexts/LayoutContext';
import { useSnapAlignment, SnapLine } from '../hooks/useSnapAlignment';
import { useGridSnap } from '../hooks/useGridSnap';
import { getCardPanelStyle } from '@/lib/panel-styles';

interface PlantQRGeneratorPanelProps {
  onQRGenerated?: (plantId: string, qrDataUrl: string) => void;
}

export default function PlantQRGeneratorPanel({ onQRGenerated }: PlantQRGeneratorPanelProps) {
  const componentId = 'plant-qr-generator';
  const cardRef = useRef<HTMLDivElement>(null);
  const { isEditMode, layouts } = useLayout();
  const { layout, updateLayout } = useComponentLayout(componentId);
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);
  
  const [plantId, setPlantId] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
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
      return layout.position;
    }
    return { x: 800, y: 100 };
  };
  
  const getInitialSize = () => {
    if (layout?.size) {
      return layout.size;
    }
    return { width: 380, height: 520 };
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
        const gridSnapResult = snapToGrid(newPosition);
        const snapResult = calculateSnapPosition(gridSnapResult.position, size);
        setSnapLines(snapResult.snapLines);
      }
    },
    onDragEnd: (newPosition) => {
      if (isEditMode) {
        updateLayout({ position: newPosition, size });
        setSnapLines([]);
      }
    },
    onResizeEnd: (newSize) => {
      if (isEditMode) {
        updateLayout({ position, size: newSize });
      }
    }
  });

  const generateQRCode = async () => {
    if (!plantId.trim()) {
      return;
    }

    setIsGenerating(true);
    try {
      // 使用Google Charts API生成QR码
      const qrText = `plant_${plantId}`;
      const size = 256;
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrText)}`;
      
      setQrDataUrl(apiUrl);
      
      if (onQRGenerated) {
        onQRGenerated(plantId, apiUrl);
      }
    } catch (error) {
      console.error('生成QR码失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `plant_${plantId}_qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const printQRCode = () => {
    if (!qrDataUrl) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>植株QR码 - ${plantId}</title>
            <style>
              body { 
                display: flex; 
                flex-direction: column;
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                margin: 0;
                font-family: sans-serif;
              }
              img { 
                max-width: 400px; 
                border: 2px solid #000;
                padding: 20px;
                background: white;
              }
              h2 { margin: 20px 0; }
            </style>
          </head>
          <body>
            <h2>植株ID: ${plantId}</h2>
            <img src="${qrDataUrl}" alt="Plant QR Code" />
            <p>扫描此码以识别植株</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

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
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize z-10 opacity-80 hover:opacity-100"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleResizeStart(e, 'bottom-right');
            }}
          />
          <div className="absolute -top-6 left-0 text-xs text-blue-400 bg-black/50 px-2 py-1 rounded">
            植株QR生成
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
      
    <Card className="w-full h-full" style={getCardPanelStyle()}>
      <CardBody className="p-6 relative overflow-hidden h-full">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-warning/10 rounded-full blur-[60px]" />
        
        <div className="relative z-10 h-full flex flex-col">
          {/* 标题 */}
          <div className="mb-6">
            <h3 className="text-foreground/80 font-semibold text-sm tracking-wide uppercase mb-2">
              🏷️ 植株QR生成
            </h3>
            <p className="text-foreground/60 text-xs">
              生成植株识别二维码
            </p>
          </div>

          {/* 输入区域 */}
          <div className="mb-6">
            <Input
              label="植株ID"
              placeholder="输入植株编号 (例如: 001)"
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  generateQRCode();
                }
              }}
              classNames={{
                input: "text-foreground",
                label: "text-foreground/60"
              }}
            />
          </div>
          
          {/* 生成按钮 */}
          <div className="mb-6">
            <Button
              color="primary"
              className="w-full"
              onPress={generateQRCode}
              isLoading={isGenerating}
              isDisabled={!plantId.trim()}
            >
              {isGenerating ? '生成中...' : '生成QR码'}
            </Button>
          </div>
          
          {/* QR码显示区域 */}
          {qrDataUrl && (
            <div className="flex-1 flex flex-col items-center">
              {/* QR码图片 */}
              <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                <img 
                  src={qrDataUrl} 
                  alt="Plant QR Code" 
                  className="w-48 h-48"
                />
              </div>
              
              {/* 植株ID显示 */}
              <div className="text-center mb-4">
                <p className="text-foreground/60 text-xs mb-1">植株ID</p>
                <p className="text-foreground font-bold text-lg">plant_{plantId}</p>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex gap-2 w-full">
                <Button
                  size="sm"
                  variant="bordered"
                  className="flex-1"
                  onPress={downloadQRCode}
                >
                  📥 下载
                </Button>
                <Button
                  size="sm"
                  variant="bordered"
                  className="flex-1"
                  onPress={printQRCode}
                >
                  🖨️ 打印
                </Button>
              </div>
            </div>
          )}
          
          {/* 空状态 */}
          {!qrDataUrl && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4 opacity-20">📱</div>
              <p className="text-foreground/40 text-sm">
                输入植株ID并生成QR码
              </p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
    </div>
  );
}
