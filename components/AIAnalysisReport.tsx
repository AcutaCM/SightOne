'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@nextui-org/react';
import { 
  FileTextOutlined,
  FilePdfOutlined,
  FileMarkdownOutlined,
  DownloadOutlined,
  CloudUploadOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { Image } from 'antd';

interface DiagnosisReport {
  id: string;
  plant_id: number;
  timestamp: string;
  original_image: string;
  mask_image?: string;
  mask_prompt?: string;
  markdown_report: string;
  summary: string;
  severity: 'low' | 'medium' | 'high';
  diseases: string[];
  recommendations: string[];
  ai_model: string;
  confidence: number;
  processing_time: number;
}

interface AIAnalysisReportProps {
  report?: DiagnosisReport | null;
  onExportHTML?: () => void;
  onExportPDF?: () => void;
}

export default function AIAnalysisReport({
  report,
  onExportHTML,
  onExportPDF
}: AIAnalysisReportProps) {
  const [latestReport, setLatestReport] = useState<DiagnosisReport | null>(report || null);

  // 监听诊断完成事件
  useEffect(() => {
    const handleDiagnosisComplete = (event: CustomEvent<DiagnosisReport>) => {
      console.log('AIAnalysisReport收到诊断报告:', event.detail);
      setLatestReport(event.detail);
    };

    window.addEventListener('diagnosis_complete' as any, handleDiagnosisComplete as EventListener);

    return () => {
      window.removeEventListener('diagnosis_complete' as any, handleDiagnosisComplete as EventListener);
    };
  }, []);

  // 如果外部传入report,使用外部的
  useEffect(() => {
    if (report) {
      setLatestReport(report);
    }
  }, [report]);

  const displayReport = latestReport;

  if (!displayReport) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="relative z-10 h-full w-full flex items-center justify-center">
          <div className="text-center text-white/60">
            <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p className="text-lg">暂无诊断报告</p>
            <p className="text-sm mt-2">启动诊断工作流后，报告将显示在这里</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 深色背景 */}
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

      {/* 内容区域 */}
      <div className="relative z-10 h-full w-full overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileTextOutlined style={{ fontSize: 24, color: '#60a5fa' }} />
              <div>
                <h2 className="text-xl font-bold text-white">AI分析报告</h2>
                <p className="text-xs text-white/60">Professional Agricultural AI Analysis Report</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="flat"
                startContent={<DownloadOutlined />}
                onPress={onExportHTML}
                className="bg-white/10 text-white hover:bg-white/20"
              >
                导出HTML
              </Button>
              <Button
                size="sm"
                variant="flat"
                startContent={<CloudUploadOutlined />}
                onPress={onExportPDF}
                className="bg-white/10 text-white hover:bg-white/20"
              >
                导出PDF
              </Button>
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <div className="px-6 py-6 space-y-6">
          {/* 标题卡片 */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <ExperimentOutlined style={{ fontSize: 20, color: '#60a5fa' }} />
              </div>
              <h3 className="text-2xl font-bold text-white">专业农作物AI分析报告</h3>
            </div>
            <p className="text-white/80 text-sm">{displayReport.ai_model}</p>
            <p className="text-white/60 text-xs mt-1">
              分析ID: {displayReport.id} | {new Date(displayReport.timestamp).toLocaleString('zh-CN')}
            </p>
          </div>

          {/* 基本信息 */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                <span className="text-blue-400 text-sm">ℹ️</span>
              </div>
              <h4 className="text-lg font-semibold text-white">基本信息</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="植株ID:" value={`TEST-QR-${displayReport.plant_id}`} valueColor="text-green-400" />
              <InfoRow label="分析时间:" value={new Date(displayReport.timestamp).toLocaleString('zh-CN')} valueColor="text-green-400" />
              <InfoRow label="分析类型:" value="专业农业AI" valueColor="text-green-400" />
              <InfoRow label="AI服务:" value={displayReport.ai_model} valueColor="text-green-400" />
            </div>
          </div>

          {/* 作物识别 */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                <span className="text-green-400 text-sm">🌱</span>
              </div>
              <h4 className="text-lg font-semibold text-white">作物识别</h4>
            </div>
            <div className="space-y-3">
              <InfoRow label="识别结果:" value={displayReport.diseases.length > 0 ? displayReport.diseases.join(', ') : '未知'} valueColor="text-white/80" />
              <InfoRow label="置信度:" value={`${(displayReport.confidence * 100).toFixed(0)}%`} valueColor="text-white/80" />
              <InfoRow label="特征描述:" value={displayReport.summary} valueColor="text-white/80" />
            </div>
          </div>

          {/* 生长状态 */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center">
                <span className="text-yellow-400 text-sm">📊</span>
              </div>
              <h4 className="text-lg font-semibold text-white">生长状态</h4>
            </div>
            <div className="space-y-3">
              <InfoRow label="健康状况:" value={displayReport.severity === 'low' ? '良好' : displayReport.severity === 'medium' ? '一般' : '需要关注'} valueColor={displayReport.severity === 'low' ? 'text-green-400' : displayReport.severity === 'medium' ? 'text-yellow-400' : 'text-red-400'} />
              <InfoRow label="生长阶段:" value="成熟期" valueColor="text-white/80" />
              <InfoRow label="处理时间:" value={`${displayReport.processing_time.toFixed(2)}秒`} valueColor="text-white/80" />
            </div>
          </div>

          {/* 图像对比 */}
          {(displayReport.original_image || displayReport.mask_image) && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                  <span className="text-purple-400 text-sm">🖼️</span>
                </div>
                <h4 className="text-lg font-semibold text-white">图像对比</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayReport.original_image && (
                  <div className="space-y-2">
                    <p className="text-sm text-white/60">原始图像</p>
                    <div className="relative rounded-lg overflow-hidden border border-white/20">
                      <Image
                        src={displayReport.original_image.startsWith('data:') ? displayReport.original_image : `data:image/png;base64,${displayReport.original_image}`}
                        alt="原始图像"
                        className="w-full h-auto"
                        preview={{
                          mask: <div className="text-white">点击预览</div>
                        }}
                        onError={(e) => {
                          console.error('原始图像加载失败:', displayReport.original_image?.substring(0, 100));
                        }}
                      />
                    </div>
                  </div>
                )}
                {displayReport.mask_image && (
                  <div className="space-y-2">
                    <p className="text-sm text-white/60">
                      病害遮罩图
                      {displayReport.mask_prompt && (
                        <span className="ml-2 text-xs">({displayReport.mask_prompt})</span>
                      )}
                    </p>
                    <div className="relative rounded-lg overflow-hidden border border-white/20">
                      <Image
                        src={displayReport.mask_image.startsWith('data:') ? displayReport.mask_image : `data:image/png;base64,${displayReport.mask_image}`}
                        alt="遮罩图"
                        className="w-full h-auto"
                        preview={{
                          mask: <div className="text-white">点击预览</div>
                        }}
                        onError={(e) => {
                          console.error('遮罩图加载失败:', displayReport.mask_image?.substring(0, 100));
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI诊断结果 (Markdown) */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center">
                <FileMarkdownOutlined style={{ fontSize: 14, color: '#f87171' }} />
              </div>
              <h4 className="text-lg font-semibold text-white">详细诊断结果</h4>
            </div>
            <div className="bg-gray-950/50 rounded-lg p-4 border border-white/10">
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-white text-2xl font-bold mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-white text-xl font-bold mb-3 mt-6" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-white text-lg font-semibold mb-2 mt-4" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-white text-base font-semibold mb-2 mt-3" {...props} />,
                    p: ({node, ...props}) => <p className="text-white/90 mb-3 leading-relaxed" {...props} />,
                    ul: ({node, ...props}) => <ul className="text-white/90 mb-3 ml-4 list-disc" {...props} />,
                    ol: ({node, ...props}) => <ol className="text-white/90 mb-3 ml-4 list-decimal" {...props} />,
                    li: ({node, ...props}) => <li className="text-white/90 mb-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="text-blue-400" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
                    code: ({node, ...props}) => (
                      <code
                        className="bg-gray-800 text-green-400 px-1.5 py-0.5 rounded text-sm"
                        {...props}
                      />
                    ),
                    pre: ({node, ...props}) => (
                      <pre
                        className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto mb-4"
                        {...props}
                      />
                    ),
                    blockquote: ({node, ...props}) => (
                      <blockquote
                        className="border-l-4 border-blue-500 pl-4 italic text-white/80 my-4"
                        {...props}
                      />
                    ),
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full border border-white/20" {...props} />
                      </div>
                    ),
                    th: ({node, ...props}) => (
                      <th className="border border-white/20 px-4 py-2 bg-white/10 text-white font-semibold" {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td className="border border-white/20 px-4 py-2 text-white/90" {...props} />
                    )
                  }}
                >
                  {displayReport.markdown_report}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* 建议措施 */}
          {displayReport.recommendations && displayReport.recommendations.length > 0 && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                  <span className="text-green-400 text-sm">💡</span>
                </div>
                <h4 className="text-lg font-semibold text-white">建议措施</h4>
              </div>
              <ul className="space-y-2">
                {displayReport.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-white/90">
                    <span className="text-green-400 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueColor = 'text-white' }: { label: string; value: string | number; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/60 text-sm">{label}</span>
      <span className={`text-sm font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}
