'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Badge, 
  Empty, 
  Space, 
  Typography, 
  Tooltip,
  Modal,
  message,
  Statistic,
  Row,
  Col,
  Tag,
  Divider
} from 'antd';
import {
  FileTextOutlined,
  FilePdfOutlined,
  FileMarkdownOutlined,
  DeleteOutlined,
  ExportOutlined,
  ClearOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import DiagnosisReportViewer from './DiagnosisReportViewer';

const { Title, Text, Paragraph } = Typography;

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

interface AIAnalysisManagerProps {
  onReportReceived?: (report: DiagnosisReport) => void;
}

export default function AIAnalysisManager({ onReportReceived }: AIAnalysisManagerProps) {
  const [reports, setReports] = useState<DiagnosisReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DiagnosisReport | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // 添加报告到列表
  const addReport = (report: DiagnosisReport) => {
    setReports(prev => [report, ...prev]);
    message.success(`新增诊断报告：植株 ${report.plant_id}`);
    if (onReportReceived) {
      onReportReceived(report);
    }
  };

  // 从localStorage加载报告
  useEffect(() => {
    try {
      // 优先从sessionStorage加载完整报告（包含图片）
      const fullReports = sessionStorage.getItem('diagnosis_reports_full');
      if (fullReports) {
        const parsed = JSON.parse(fullReports);
        setReports(parsed);
        console.log('从sessionStorage加载了', parsed.length, '份完整报告');
        return;
      }
      
      // 如果sessionStorage没有，从localStorage加载轻量版本
      const savedReports = localStorage.getItem('diagnosis_reports');
      if (savedReports) {
        const parsed = JSON.parse(savedReports);
        setReports(parsed);
        console.log('从localStorage加载了', parsed.length, '份报告（不含图片）');
      }
    } catch (error) {
      console.error('加载保存的报告失败:', error);
      // 如果加载失败，清理损坏的数据
      localStorage.removeItem('diagnosis_reports');
      sessionStorage.removeItem('diagnosis_reports_full');
    }
  }, []);

  // 监听诊断完成事件
  useEffect(() => {
    const handleDiagnosisComplete = (event: CustomEvent<DiagnosisReport>) => {
      console.log('收到诊断报告:', event.detail);
      addReport(event.detail);
    };

    window.addEventListener('diagnosis_complete' as any, handleDiagnosisComplete as EventListener);

    return () => {
      window.removeEventListener('diagnosis_complete' as any, handleDiagnosisComplete as EventListener);
    };
  }, []);

  // 保存报告到localStorage（限制数量和大小）
  useEffect(() => {
    if (reports.length > 0) {
      try {
        // 只保存最近的10份报告，避免超出localStorage限制
        const reportsToSave = reports.slice(0, 10);
        
        // 创建不包含图片的轻量版本用于列表显示
        const lightReports = reportsToSave.map(report => ({
          ...report,
          // 保留图片引用但不存储完整数据
          original_image: report.original_image ? 'stored' : '',
          mask_image: report.mask_image ? 'stored' : undefined
        }));
        
        localStorage.setItem('diagnosis_reports', JSON.stringify(lightReports));
        
        // 将完整报告存储在内存中（会话期间有效）
        sessionStorage.setItem('diagnosis_reports_full', JSON.stringify(reportsToSave));
      } catch (error) {
        console.error('保存报告到localStorage失败:', error);
        // 如果存储失败，尝试清理旧数据
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.warn('localStorage空间不足，清理旧数据...');
          localStorage.removeItem('diagnosis_reports');
          // 只保存最近3份报告的元数据
          const minimalReports = reports.slice(0, 3).map(report => ({
            id: report.id,
            plant_id: report.plant_id,
            timestamp: report.timestamp,
            summary: report.summary,
            severity: report.severity,
            diseases: report.diseases,
            ai_model: report.ai_model,
            confidence: report.confidence,
            processing_time: report.processing_time
          }));
          try {
            localStorage.setItem('diagnosis_reports', JSON.stringify(minimalReports));
          } catch (e) {
            console.error('即使保存最小数据也失败:', e);
          }
        }
      }
    }
  }, [reports]);

  // 导出所有报告为PDF
  const exportAllAsPDF = async () => {
    if (reports.length === 0) {
      message.error('没有可导出的报告');
      return;
    }

    setIsExporting(true);
    const hide = message.loading('正在生成PDF...', 0);

    try {
      const { generatePDF } = await import('../lib/pdfExporter');
      const pdfBlob = await generatePDF(reports);
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagnosis-reports-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      hide();
      message.success('PDF导出成功');
    } catch (error) {
      console.error('PDF export failed:', error);
      hide();
      message.error('PDF导出失败: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  // 导出所有报告为HTML
  const exportAllAsHTML = async () => {
    if (reports.length === 0) {
      message.error('没有可导出的报告');
      return;
    }

    setIsExporting(true);
    const hide = message.loading('正在生成HTML...', 0);

    try {
      const { generateHTML } = await import('../lib/htmlExporter');
      const htmlBlob = await generateHTML(reports);
      
      const url = URL.createObjectURL(htmlBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagnosis-reports-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      hide();
      message.success('HTML导出成功');
    } catch (error) {
      console.error('HTML export failed:', error);
      hide();
      message.error('HTML导出失败: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  // 导出单个报告为PDF
  const exportSingleAsPDF = async (report: DiagnosisReport) => {
    setIsExporting(true);
    const hide = message.loading('正在生成PDF...', 0);

    try {
      const { generatePDF } = await import('../lib/pdfExporter');
      const pdfBlob = await generatePDF([report]);
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagnosis-plant-${report.plant_id}-${new Date(report.timestamp).toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      hide();
      message.success('PDF导出成功');
    } catch (error) {
      console.error('PDF export failed:', error);
      hide();
      message.error('PDF导出失败: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  // 导出单个报告为HTML
  const exportSingleAsHTML = async (report: DiagnosisReport) => {
    setIsExporting(true);
    const hide = message.loading('正在生成HTML...', 0);

    try {
      const { generateHTML } = await import('../lib/htmlExporter');
      const htmlBlob = await generateHTML([report]);
      
      const url = URL.createObjectURL(htmlBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagnosis-plant-${report.plant_id}-${new Date(report.timestamp).toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      hide();
      message.success('HTML导出成功');
    } catch (error) {
      console.error('HTML export failed:', error);
      hide();
      message.error('HTML导出失败: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  // 删除报告
  const deleteReport = (reportId: string) => {
    console.log('deleteReport function called for ID:', reportId);
    
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这份报告吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      getContainer: () => document.body,
      onOk: () => {
        console.log('User confirmed delete for ID:', reportId);
        setReports(prev => prev.filter(r => r.id !== reportId));
        message.success('报告已删除');
      },
      onCancel: () => {
        console.log('User cancelled delete');
      }
    });
  };

  // 清空所有报告
  const clearAllReports = () => {
    console.log('clearAllReports function called!');
    console.log('Current reports count:', reports.length);
    
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有报告吗？此操作不可撤销。',
      okText: '清空',
      okType: 'danger',
      cancelText: '取消',
      getContainer: () => document.body,
      onOk: () => {
        console.log('User confirmed, clearing reports...');
        setReports([]);
        localStorage.removeItem('diagnosis_reports');
        sessionStorage.removeItem('diagnosis_reports_full');
        message.success('所有报告已清空');
      },
      onCancel: () => {
        console.log('User cancelled');
      }
    });
  };

  // 严重程度配置
  const getSeverityConfig = (severity: 'low' | 'medium' | 'high') => {
    const configs = {
      low: { color: 'success', icon: <CheckCircleOutlined />, text: '低风险' },
      medium: { color: 'warning', icon: <WarningOutlined />, text: '中风险' },
      high: { color: 'error', icon: <SafetyOutlined />, text: '高风险' }
    };
    return configs[severity];
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Card 
        bordered={false}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}
      >
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>
                <ExperimentOutlined style={{ marginRight: 8 }} />
                AI诊断报告管理
              </Title>
              <Space>
                <Button
                  type="primary"
                  icon={<FileMarkdownOutlined />}
                  onClick={exportAllAsHTML}
                  disabled={reports.length === 0 || isExporting}
                  loading={isExporting}
                >
                  导出HTML
                </Button>
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={exportAllAsPDF}
                  disabled={reports.length === 0 || isExporting}
                  loading={isExporting}
                >
                  导出PDF
                </Button>
                {reports.length > 0 && (
                  <Button
                    danger
                    icon={<ClearOutlined />}
                    onClick={() => {
                      console.log('Clear button clicked!');
                      clearAllReports();
                    }}
                  >
                    清空全部
                  </Button>
                )}
              </Space>
            </div>
            <Text type="secondary">
              <FileTextOutlined style={{ marginRight: 4 }} />
              共 {reports.length} 份报告
            </Text>
          </Space>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Reports List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {reports.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" size={4}>
                  <Text>暂无诊断报告</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    启动诊断工作流后，报告将显示在这里
                  </Text>
                </Space>
              }
              style={{ marginTop: 60 }}
            />
          ) : (
            <Row gutter={[12, 12]}>
              {reports.map((report) => {
                const severityConfig = getSeverityConfig(report.severity);
                return (
                  <Col xs={24} sm={12} lg={8} key={report.id}>
                    <Badge.Ribbon 
                      text={severityConfig.text} 
                      color={severityConfig.color as any}
                    >
                      <Card
                        hoverable
                        size="small"
                        onClick={() => setSelectedReport(report)}
                        title={
                          <Space>
                            <Text strong>植株 {report.plant_id}</Text>
                            {severityConfig.icon}
                          </Space>
                        }
                        extra={
                          <Tag color={severityConfig.color as any}>
                            {(report.confidence * 100).toFixed(0)}%
                          </Tag>
                        }
                        actions={[
                          <Tooltip title="导出PDF" key="pdf">
                            <Button
                              type="text"
                              size="small"
                              icon={<FilePdfOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                exportSingleAsPDF(report);
                              }}
                            />
                          </Tooltip>,
                          <Tooltip title="导出HTML" key="html">
                            <Button
                              type="text"
                              size="small"
                              icon={<FileMarkdownOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                exportSingleAsHTML(report);
                              }}
                            />
                          </Tooltip>,
                          <Tooltip title="查看详情" key="view">
                            <Button
                              type="text"
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReport(report);
                              }}
                            />
                          </Tooltip>,
                          <Tooltip title="删除" key="delete">
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteReport(report.id);
                              }}
                            />
                          </Tooltip>
                        ]}
                      >
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <Paragraph 
                            ellipsis={{ rows: 2 }} 
                            style={{ margin: 0, fontSize: 13 }}
                          >
                            {report.summary}
                          </Paragraph>
                          
                          <Space direction="vertical" size={2} style={{ width: '100%' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              {new Date(report.timestamp).toLocaleString('zh-CN')}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <ExperimentOutlined style={{ marginRight: 4 }} />
                              {report.ai_model}
                            </Text>
                          </Space>

                          {report.diseases && report.diseases.length > 0 && (
                            <div>
                              {report.diseases.slice(0, 2).map((disease, idx) => (
                                <Tag key={idx} color="red" style={{ marginBottom: 4 }}>
                                  {disease}
                                </Tag>
                              ))}
                              {report.diseases.length > 2 && (
                                <Tag>+{report.diseases.length - 2}</Tag>
                              )}
                            </div>
                          )}
                        </Space>
                      </Card>
                    </Badge.Ribbon>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </Card>

      {/* Report Viewer Modal */}
      {selectedReport && (
        <DiagnosisReportViewer
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onExportPDF={() => exportSingleAsPDF(selectedReport)}
          onExportHTML={() => exportSingleAsHTML(selectedReport)}
        />
      )}
    </div>
  );
}

// 导出addReport函数供外部使用
export const useAIAnalysisManager = () => {
  const [reports, setReports] = useState<DiagnosisReport[]>([]);

  const addReport = (report: DiagnosisReport) => {
    setReports(prev => [report, ...prev]);
  };

  return { reports, addReport };
};
