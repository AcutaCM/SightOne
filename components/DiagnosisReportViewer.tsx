'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Modal, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Divider, 
  Row, 
  Col, 
  Card, 
  Statistic,
  Image,
  Descriptions,
  Alert,
  theme,
  ConfigProvider
} from 'antd';
import {
  CloseOutlined,
  FilePdfOutlined,
  FileMarkdownOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SafetyOutlined,
  FileImageOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { useToken } = theme;

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

interface DiagnosisReportViewerProps {
  report: DiagnosisReport;
  onClose?: () => void;
  onExportPDF?: () => void;
  onExportHTML?: () => void;
}

export default function DiagnosisReportViewer({
  report,
  onClose,
  onExportPDF,
  onExportHTML
}: DiagnosisReportViewerProps) {
  const { token } = useToken();
  
  // 严重程度配置
  const getSeverityConfig = (severity: 'low' | 'medium' | 'high') => {
    const configs = {
      low: { 
        color: 'success', 
        icon: <CheckCircleOutlined />, 
        text: '低风险',
        emoji: '🟢'
      },
      medium: { 
        color: 'warning', 
        icon: <WarningOutlined />, 
        text: '中风险',
        emoji: '🟡'
      },
      high: { 
        color: 'error', 
        icon: <SafetyOutlined />, 
        text: '高风险',
        emoji: '🔴'
      }
    };
    return configs[severity];
  };

  const severityConfig = getSeverityConfig(report.severity);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: '#141414',
          colorTextBase: '#ffffff',
        }
      }}
    >
    <Modal
      open={true}
      onCancel={onClose}
      width="90%"
      style={{ top: 20, maxWidth: 1400 }}
      footer={null}
      closeIcon={<CloseOutlined />}
      title={
        <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <ExperimentOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0 }}>
              植株 {report.plant_id} 诊断报告
            </Title>
          </Space>
          <Space>
            <Tag 
              icon={severityConfig.icon} 
              color={severityConfig.color as any}
              style={{ fontSize: 14, padding: '4px 12px' }}
            >
              {severityConfig.emoji} {severityConfig.text}
            </Tag>
            <Text type="secondary" style={{ fontSize: 13 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {new Date(report.timestamp).toLocaleString('zh-CN')}
            </Text>
          </Space>
        </Space>
      }
    >
      <div style={{ maxHeight: 'calc(90vh - 120px)', overflowY: 'auto', padding: '8px 0' }}>
        {/* 统计信息卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="AI模型"
                value={report.ai_model}
                valueStyle={{ fontSize: 14 }}
                prefix={<ExperimentOutlined style={{ color: token.colorPrimary }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="置信度"
                value={(report.confidence * 100).toFixed(1)}
                suffix="%"
                valueStyle={{ 
                  fontSize: 18, 
                  color: report.confidence > 0.8 ? token.colorSuccess : token.colorWarning,
                  fontWeight: 'bold' 
                }}
                prefix={
                  <ThunderboltOutlined 
                    style={{ color: report.confidence > 0.8 ? token.colorSuccess : token.colorWarning }} 
                  />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="处理时间"
                value={report.processing_time.toFixed(2)}
                suffix="秒"
                valueStyle={{ fontSize: 18, fontWeight: 'bold' }}
                prefix={<ClockCircleOutlined style={{ color: token.colorPrimary }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="检测疾病"
                value={report.diseases?.length || 0}
                suffix="种"
                valueStyle={{ 
                  fontSize: 18, 
                  color: report.diseases?.length > 0 ? token.colorError : token.colorSuccess,
                  fontWeight: 'bold' 
                }}
                prefix={
                  <SafetyOutlined 
                    style={{ color: report.diseases?.length > 0 ? token.colorError : token.colorSuccess }} 
                  />
                }
              />
            </Card>
          </Col>
        </Row>

        {/* 摘要信息 */}
        {report.summary && (
          <Alert
            message="诊断摘要"
            description={report.summary}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        {/* 图像对比 */}
        <Card 
          title={
            <Space>
              <FileImageOutlined style={{ color: token.colorPrimary }} />
              <Text strong>图像对比</Text>
            </Space>
          }
          size="small"
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={report.mask_image ? 12 : 24}>
              <Card
                type="inner"
                title="原始图像"
                size="small"
              >
                <Image
                  src={report.original_image.startsWith('data:') ? report.original_image : `data:image/png;base64,${report.original_image}`}
                  alt="原始图像"
                  style={{ width: '100%', borderRadius: 8 }}
                  preview={{
                    mask: '点击预览'
                  }}
                  onError={(e) => {
                    console.error('原始图像加载失败:', report.original_image?.substring(0, 100));
                  }}
                />
              </Card>
            </Col>
            
            {report.mask_image && (
              <Col xs={24} md={12}>
                <Card
                  type="inner"
                  title={
                    <Space direction="vertical" size={0}>
                      <Text>病害遮罩图</Text>
                      {report.mask_prompt && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          识别部位: {report.mask_prompt}
                        </Text>
                      )}
                    </Space>
                  }
                  size="small"
                >
                  <Image
                    src={report.mask_image.startsWith('data:') ? report.mask_image : `data:image/png;base64,${report.mask_image}`}
                    alt="遮罩图"
                    style={{ width: '100%', borderRadius: 8 }}
                    preview={{
                      mask: '点击预览'
                    }}
                    onError={(e) => {
                      console.error('遮罩图加载失败:', report.mask_image?.substring(0, 100));
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </Card>
              </Col>
            )}
          </Row>
        </Card>

        {/* 检测到的疾病 */}
        {report.diseases && report.diseases.length > 0 && (
          <Card 
            title={
              <Space>
                <SafetyOutlined style={{ color: token.colorError }} />
                <Text strong>检测到的疾病</Text>
              </Space>
            }
            size="small"
            style={{ marginBottom: 24 }}
          >
            <Space wrap>
              {report.diseases.map((disease, idx) => (
                <Tag key={idx} color="red" icon={<WarningOutlined />}>
                  {disease}
                </Tag>
              ))}
            </Space>
          </Card>
        )}

        {/* 建议措施 */}
        {report.recommendations && report.recommendations.length > 0 && (
          <Card 
            title={
              <Space>
                <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                <Text strong>建议措施</Text>
              </Space>
            }
            size="small"
            style={{ marginBottom: 24 }}
          >
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {report.recommendations.map((rec, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>
                  <Text>{rec}</Text>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Markdown 诊断报告 */}
        <Card 
          title={
            <Space>
              <FileMarkdownOutlined style={{ color: token.colorPrimary }} />
              <Text strong>详细诊断报告</Text>
            </Space>
          }
          size="small"
          style={{ marginBottom: 24 }}
        >
          <div 
            className="prose prose-sm max-w-none"
            style={{ 
              backgroundColor: '#1a1a1a', 
              padding: 16, 
              borderRadius: token.borderRadius,
              border: '1px solid #333333',
              color: '#ffffff'
            }}
          >
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 style={{ color: '#ffffff' }} {...props} />,
                h2: ({node, ...props}) => <h2 style={{ color: '#ffffff' }} {...props} />,
                h3: ({node, ...props}) => <h3 style={{ color: '#ffffff' }} {...props} />,
                h4: ({node, ...props}) => <h4 style={{ color: '#ffffff' }} {...props} />,
                h5: ({node, ...props}) => <h5 style={{ color: '#ffffff' }} {...props} />,
                h6: ({node, ...props}) => <h6 style={{ color: '#ffffff' }} {...props} />,
                p: ({node, ...props}) => <p style={{ color: '#ffffff' }} {...props} />,
                li: ({node, ...props}) => <li style={{ color: '#ffffff' }} {...props} />,
                strong: ({node, ...props}) => <strong style={{ color: '#ffffff' }} {...props} />,
                em: ({node, ...props}) => <em style={{ color: '#ffffff' }} {...props} />,
                a: ({node, ...props}) => <a style={{ color: '#1890ff' }} {...props} />,
                code: ({node, ...props}) => (
                  <code 
                    style={{ 
                      backgroundColor: '#2a2a2a',
                      color: '#ffffff',
                      padding: '2px 6px',
                      borderRadius: 4
                    }} 
                    {...props} 
                  />
                ),
                pre: ({node, ...props}) => (
                  <pre 
                    style={{ 
                      backgroundColor: '#2a2a2a',
                      color: '#ffffff',
                      padding: 12,
                      borderRadius: token.borderRadius,
                      border: '1px solid #333333'
                    }} 
                    {...props} 
                  />
                )
              }}
            >
              {report.markdown_report}
            </ReactMarkdown>
          </div>
        </Card>

        {/* 元数据 */}
        <Card 
          title={
            <Space>
              <InfoCircleOutlined style={{ color: token.colorPrimary }} />
              <Text strong>元数据</Text>
            </Space>
          }
          size="small"
        >
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 4 }}>
            <Descriptions.Item label="报告ID">
              <Text copyable style={{ fontSize: 12 }}>
                {report.id}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="植株ID">
              {report.plant_id}
            </Descriptions.Item>
            <Descriptions.Item label="AI模型">
              {report.ai_model}
            </Descriptions.Item>
            <Descriptions.Item label="置信度">
              <Tag color={report.confidence > 0.8 ? 'green' : 'orange'}>
                {(report.confidence * 100).toFixed(1)}%
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="处理时间">
              {report.processing_time.toFixed(2)} 秒
            </Descriptions.Item>
            <Descriptions.Item label="严重程度">
              <Tag color={severityConfig.color as any}>
                {severityConfig.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="生成时间" span={2}>
              {new Date(report.timestamp).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Divider />

        {/* 免责声明 */}
        <Alert
          message="免责声明"
          description="本诊断基于AI图像分析技术，仅供参考。建议结合实地观察和专业检测确认，以制定准确的防治方案。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* 操作按钮 */}
        <div style={{ textAlign: 'right' }}>
          <Space>
            {onExportHTML && (
              <Button
                type="default"
                icon={<FileMarkdownOutlined />}
                onClick={onExportHTML}
              >
                导出HTML
              </Button>
            )}
            {onExportPDF && (
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={onExportPDF}
              >
                导出PDF
              </Button>
            )}
            {onClose && (
              <Button onClick={onClose}>
                关闭
              </Button>
            )}
          </Space>
        </div>
      </div>
    </Modal>
    </ConfigProvider>
  );
}
