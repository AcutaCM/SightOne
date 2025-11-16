'use client';

import React, { useState } from 'react';
import DemoReportGenerator from '@/components/DemoReportGenerator';
import DiagnosisReportViewer from '@/components/DiagnosisReportViewer';
import { Button } from '@heroui/button';

export default function DemoReportPage() {
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [allReports, setAllReports] = useState<any[]>([]);

  const handleReportGenerated = (report: any) => {
    setCurrentReport(report);
    setAllReports(prev => [report, ...prev]);
  };

  const exportAsHTML = async () => {
    if (!currentReport) return;
    
    try {
      const { generateHTML } = await import('@/lib/htmlExporter');
      const htmlBlob = await generateHTML([currentReport]);
      
      const url = URL.createObjectURL(htmlBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demo-report-plant-${currentReport.plant_id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportAsPDF = async () => {
    if (!currentReport) return;
    
    try {
      const { generatePDF } = await import('@/lib/pdfExporter');
      const pdfBlob = await generatePDF([currentReport]);
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demo-report-plant-${currentReport.plant_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            SIGHT ONE 演示报告生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            快速生成诊断报告用于功能演示
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Generator */}
          <div>
            <DemoReportGenerator onReportGenerated={handleReportGenerated} />
            
            {allReports.length > 0 && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">📊 已生成的报告</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allReports.map((report, index) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => setCurrentReport(report)}
                    >
                      <div>
                        <span className="font-medium">植株 {report.plant_id}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          {report.severity === 'low' ? '🟢' : report.severity === 'medium' ? '🟡' : '🔴'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(report.timestamp).toLocaleTimeString('zh-CN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div>
            {currentReport ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">📄 报告预览</h3>
                  <div className="flex gap-2">
                    <Button size="sm" color="success" onPress={exportAsHTML}>
                      导出HTML
                    </Button>
                    <Button size="sm" color="primary" onPress={exportAsPDF}>
                      导出PDF
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Images */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">原始图像</p>
                      <img 
                        src={currentReport.original_image} 
                        alt="原图" 
                        className="w-full rounded-lg border"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">遮罩图</p>
                      <img 
                        src={currentReport.mask_image} 
                        alt="遮罩图" 
                        className="w-full rounded-lg border"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">诊断摘要</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {currentReport.summary}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">严重程度</p>
                      <p className="font-medium">
                        {currentReport.severity === 'low' ? '🟢 低' : 
                         currentReport.severity === 'medium' ? '🟡 中' : '🔴 高'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">置信度</p>
                      <p className="font-medium">{(currentReport.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">处理时间</p>
                      <p className="font-medium">{currentReport.processing_time.toFixed(2)}s</p>
                    </div>
                  </div>

                  <Button 
                    color="primary" 
                    className="w-full"
                    onPress={() => setCurrentReport(currentReport)}
                  >
                    查看完整报告
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500">生成报告后将在此处显示预览</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Viewer Modal */}
      {currentReport && (
        <DiagnosisReportViewer
          report={currentReport}
          onClose={() => {}}
          onExportPDF={exportAsPDF}
          onExportHTML={exportAsHTML}
        />
      )}
    </div>
  );
}
