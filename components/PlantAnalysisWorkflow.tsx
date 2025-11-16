'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useDroneControl } from '@/hooks/useDroneControl';
import { useDroneCamera } from '@/hooks/useDroneCamera';
import { useAIConfig } from '@/hooks/useAIConfig';

interface PlantAnalysisWorkflowProps {
  onAnalysisComplete?: (result: any) => void;
  missionActive?: boolean;  // 任務是否激活
}

const PlantAnalysisWorkflow: React.FC<PlantAnalysisWorkflowProps> = ({ 
  onAnalysisComplete,
  missionActive = false 
}) => {
  const { qrScan, sendMessage, droneStatus } = useDroneControl();
  const { isAnalyzing, captureAndAnalyze } = useDroneCamera();
  const { aiConfig } = useAIConfig();
  
  const [currentPlantId, setCurrentPlantId] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'waiting_qr' | 'capturing' | 'analyzing' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // 检查AI配置类型
  const isLLMOnly = aiConfig.model?.includes('gpt') || aiConfig.model?.includes('claude');
  const requiresVLM = isLLMOnly;
  
  // 診斷工作流狀態（由後端控制）
  const diagnosisActive = droneStatus?.diagnosis_active || missionActive;

  // 🔥 監聽任務狀態和 QR 掃描結果（只在任務激活時處理）
  useEffect(() => {
    if (!diagnosisActive) {
      // 任務未激活時重置狀態
      if (workflowStatus !== 'idle') {
        setWorkflowStatus('idle');
        setCurrentPlantId(null);
        setError(null);
      }
      return;
    }
    
    // 任務激活且檢測到 QR 碼時自動處理
    if (qrScan.lastScan) {
      const plantId = qrScan.lastScan.plantId;
      
      // 避免重複處理同一植株
      if (plantId !== currentPlantId) {
        setCurrentPlantId(plantId);
        setWorkflowStatus('capturing');
        
        // 通過 WebSocket 發送消息
        sendMessage('chat_message', {
          role: 'assistant',
          content: `🔍 任務中檢測到植株 ${plantId}，自動開始診斷...`
        });
        
        // 開始拍照和分析
        setTimeout(() => {
          handleCaptureAndAnalyze(plantId, qrScan.lastScan?.qrImage);
        }, 1500);
      }
    }
  }, [diagnosisActive, qrScan, currentPlantId, workflowStatus, sendMessage]);

  const handleCaptureAndAnalyze = async (plantId: string, qrImage?: string) => {
    try {
      setWorkflowStatus('analyzing');
      
      // 发送消息到chatbot
      sendMessage('chat_message', {
        role: 'assistant',
        content: `📸 正在拍摄植株 ${plantId} 并上传至AI分析服务...`
      });

      // 如果只配置了LLM，提示用户需要VLM
      if (requiresVLM) {
        sendMessage('chat_message', {
          role: 'assistant',
          content: `⚠️ 注意：当前配置的AI模型是纯语言模型(${aiConfig.model})，无法处理图像。请切换到视觉语言模型(VLM)以获得完整的植株诊断功能。`
        });
      }

      // 执行拍照和分析
      const result = await captureAndAnalyze(plantId, qrImage);
      
      setWorkflowStatus('completed');
      
      // 检查是否有 UniPixel 切割结果
      const hasUniPixelMask = result.segmentationMask ? true : false;
      const segKeywords = result.diseaseDescription || '';
      const uniPixelStatus = hasUniPixelMask 
        ? `🎯 UniPixel-3B 病害区域切割已完成 (WSL FastAPI)\n   切割关键词: "${segKeywords}"` 
        : '';
      const diseaseDesc = segKeywords 
        ? `\n🔬 切割关键词: ${segKeywords}` 
        : '';
      
      sendMessage('chat_message', {
        role: 'assistant',
        content: `✅ 植株 ${plantId} 分析完成！
健康评分: ${result.analysis.healthScore}/100
${result.analysis.diseaseDetected ? `⚠️ 检测到病害: ${result.analysis.diseaseType || '未知病害'}` : '✓ 未检测到明显病害'}
置信度: ${(result.analysis.confidence * 100).toFixed(1)}%
${diseaseDesc}
${uniPixelStatus}

建议措施:
${result.analysis.recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}`
      });
      
      // 触发外部回调
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      setWorkflowStatus('error');
      setError('分析过程中出现错误');
      sendMessage('chat_message', {
        role: 'assistant',
        content: `❌ 分析植株 ${plantId} 时出现错误: ${err instanceof Error ? err.message : '未知错误'}`
      });
    }
  };

  return (
    <Card className="w-full bg-black/40 border border-white/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <i className="fas fa-seedling text-green-400"></i>
              植株智能診斷
            </h3>
            <p className="text-white/70 text-sm">Plant Intelligence Diagnosis</p>
          </div>
          <div className="flex items-center gap-2">
            {diagnosisActive && (
              <span className="text-green-400 text-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                任務中自動診斷
              </span>
            )}
            {!diagnosisActive && (
              <span className="text-gray-400 text-sm">待命</span>
            )}
            {isAnalyzing && (
              <span className="text-yellow-400 text-sm animate-pulse">
                <i className="fas fa-spinner fa-spin mr-1"></i>
                分析中...
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="space-y-4">
        {requiresVLM && (
          <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <i className="fas fa-exclamation-triangle text-yellow-400 mt-0.5"></i>
              <div>
                <h4 className="text-yellow-400 font-medium text-sm">模型配置提醒</h4>
                <p className="text-yellow-200 text-xs mt-1">
                  當前配置為純語言模型({aiConfig.model})，無法處理圖像分析。
                  請在設置中切換到視覺語言模型(VLM)以獲得完整的植株診斷功能。
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 任務狀態提示 */}
        {!diagnosisActive && (
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
              <div>
                <h4 className="text-blue-400 font-medium text-sm">自動診斷模式</h4>
                <p className="text-blue-200 text-xs mt-1">
                  診斷工作流將在<strong>挑戰卡任務啟動後</strong>自動激活。
                  <br/>任務進行中檢測到 QR 碼時會自動觸發植株診斷。
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {diagnosisActive && !currentPlantId && (
            <div className="bg-green-900/30 rounded-lg p-3 border border-green-700/50">
              <div className="flex items-center gap-2">
                <i className="fas fa-qrcode text-green-400 animate-pulse"></i>
                <span className="text-green-300">🎯 任務中，等待檢測植株 QR 碼...</span>
              </div>
            </div>
          )}
          
          {currentPlantId && (
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2">
                <i className="fas fa-barcode text-blue-400"></i>
                <span className="text-white font-medium">檢測到植株ID:</span>
                <span className="text-green-400 font-mono">{currentPlantId}</span>
              </div>
            </div>
          )}
          
          {workflowStatus === 'capturing' && (
            <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-700/50">
              <div className="flex items-center gap-2">
                <i className="fas fa-camera-retro text-purple-400"></i>
                <span className="text-purple-300">正在拍攝植株照片...</span>
              </div>
            </div>
          )}
          
          {workflowStatus === 'analyzing' && (
            <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-700/50">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <i className="fas fa-brain text-yellow-400 animate-pulse"></i>
                  <span className="text-yellow-300">正在AI分析中，請稍候...</span>
                </div>
                <div className="text-xs text-yellow-200/80 pl-6 space-y-1">
                  <div>步驟: VLM診斷 → UniPixel-3B病害切割 → 生成報告</div>
                  <div className="text-yellow-300/60 flex items-center gap-1">
                    <i className="fas fa-server text-xs"></i>
                    <span>WSL FastAPI 服務 (localhost:8000)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900/30 rounded-lg p-3 border border-red-700/50">
              <div className="flex items-center gap-2">
                <i className="fas fa-exclamation-circle text-red-400"></i>
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-xs text-white/60 space-y-1">
          <div className="font-semibold">智能診斷流程:</div>
          <div>1. 啟動挑戰卡任務（診斷自動激活）</div>
          <div>2. 無人機飛行時自動檢測植株 QR 碼</div>
          <div>3. 自動拍照 → VLM AI 診斷</div>
          <div className="flex items-center gap-1">
            <span>4.</span>
            <span className="text-purple-400">UniPixel-3B</span>
            <span>病害區域精確切割</span>
            <span className="text-gray-500 text-[10px]">(WSL FastAPI)</span>
          </div>
          <div>5. 生成完整報告（含病害遮罩圖）</div>
          <div className="text-yellow-400 mt-1">⚡ 任務結束時自動停止</div>
          <div className="text-gray-500 text-[10px] mt-1 pt-1 border-t border-white/10">
            <i className="fas fa-info-circle mr-1"></i>
            UniPixel 端點: http://localhost:8000/infer_unipixel_base64
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default PlantAnalysisWorkflow;
