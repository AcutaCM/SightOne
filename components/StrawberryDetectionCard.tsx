"use client";

import { Card, CardBody } from "@heroui/card";
import { useState, useRef, useEffect } from "react";

interface StrawberryDetectionCardProps {
  detectedCount?: number;
  latestDetection?: {
    name: string;
    location: string;
    timestamp: string;
    maturity?: string;
  };
  maturityStats?: {
    ripe: number;
    halfRipe: number;
    unripe: number;
  };
  // 新增：从detectionStats获取实时数据
  totalPlants?: number;
  matureStrawberries?: number;
  immatureStrawberries?: number;
}

export default function StrawberryDetectionCard({
  detectedCount = 0,
  latestDetection = {
    name: "等待检测...",
    location: "-",
    timestamp: "-",
    maturity: "-"
  },
  maturityStats = {
    ripe: 0,
    halfRipe: 0,
    unripe: 0
  },
  // 使用实时数据
  totalPlants = 0,
  matureStrawberries = 0,
  immatureStrawberries = 0
}: StrawberryDetectionCardProps) {
  // 使用实时数据或默认值
  const actualTotal = totalPlants || detectedCount;
  const actualMature = matureStrawberries || maturityStats.ripe;
  const actualImmature = immatureStrawberries || (maturityStats.halfRipe + maturityStats.unripe);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 边界检测 - 确保鼠标在卡片范围内
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
      return;
    }
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const mouseX = x - centerX;
    const mouseY = y - centerY;
    
    const maxRotation = 12; // 最大旋转角度限制
    const rotateAmplitude = 14;
    let rotateXValue = (mouseY / (rect.height / 2)) * -rotateAmplitude;
    let rotateYValue = (mouseX / (rect.width / 2)) * rotateAmplitude;
    
    // 限制旋转角度范围
    rotateXValue = Math.max(-maxRotation, Math.min(maxRotation, rotateXValue));
    rotateYValue = Math.max(-maxRotation, Math.min(maxRotation, rotateYValue));
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setScale(1.05);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };
  return (
    <div
      ref={cardRef}
      className="perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center',
        overflow: 'visible',
        margin: '10px', // 为倾斜效果预留空间
        width: 'calc(100% - 20px)',
        height: 'calc(100% - 20px)'
      }}
    >
      <Card className="w-full h-full bg-content1 border-divider shadow-2xl">
        <CardBody className="p-6 relative overflow-hidden h-full">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-success/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
          
          {/* 内容容器 - 使用flex布局填充整个高度 */}
          <div className="relative z-10 w-full h-full flex flex-col">
          
          {/* 标题区域 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-foreground/80 font-semibold text-sm tracking-wide uppercase">
                🍓 草莓检测
              </h3>
              <div className="flex items-center gap-1 text-foreground/40">
                <svg className="w-4 h-4" viewBox="0 0 16 4" fill="none">
                  <circle cx="2" cy="2" r="2" fill="currentColor"/>
                  <circle cx="8" cy="2" r="2" fill="currentColor"/>
                  <circle cx="14" cy="2" r="2" fill="currentColor"/>
                </svg>
              </div>
            </div>
            
            {/* 总数显示 */}
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-6 border border-primary/20">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-foreground/60 text-xs mb-1">检测总数</p>
                  <p className="text-foreground font-bold text-5xl leading-none">
                    {actualTotal}
                  </p>
                </div>
                <div className="text-6xl opacity-20">🍓</div>
              </div>
            </div>
          </div>
          
          {/* 成熟度统计 */}
          <div className="relative z-10 space-y-3">
            <p className="text-foreground/60 text-xs font-medium uppercase tracking-wide mb-3">
              成熟度分布
            </p>
            
            {/* 成熟草莓 */}
            <div className="flex items-center justify-between p-3 bg-danger/10 rounded-xl border border-danger/20 hover:bg-danger/15 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-danger"></div>
                </div>
                <div>
                  <p className="text-foreground font-medium text-sm">成熟</p>
                  <p className="text-foreground/60 text-xs">Ripe & Overripe</p>
                </div>
              </div>
              <p className="text-danger font-bold text-2xl">{actualMature}</p>
            </div>
            
            {/* 未成熟草莓 */}
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl border border-success/20 hover:bg-success/15 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                </div>
                <div>
                  <p className="text-foreground font-medium text-sm">未成熟</p>
                  <p className="text-foreground/60 text-xs">Unripe & Partially Ripe</p>
                </div>
              </div>
              <p className="text-success font-bold text-2xl">{actualImmature}</p>
            </div>
          </div>
          
          {/* 底部状态 */}
          <div className="mt-auto pt-4 border-t border-divider/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/60">
                {actualTotal > 0 ? '实时检测中...' : '等待检测'}
              </span>
              <span className="text-foreground/40">
                {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          
          </div>
        </CardBody>
      </Card>
    </div>
  );
}