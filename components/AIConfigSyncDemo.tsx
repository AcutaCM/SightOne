/**
 * AI Configuration Sync Demo Component
 * 
 * Task 5: Demonstrates integration between AssistantContext and AI config sync
 * 
 * This component shows:
 * 1. Automatic AI config sync when assistant changes
 * 2. Configuration status monitoring
 * 3. Manual sync controls
 * 4. Error handling and recovery
 */

'use client';

import React, { useEffect } from 'react';
import { useAssistants } from '@/contexts/AssistantContext';
import { useAIConfigSync } from '@/hooks/useAIConfigSync';
import { Card, Badge, Button, Space, Typography, Alert, Descriptions } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ApiOutlined,
  RobotOutlined,
  ClearOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export const AIConfigSyncDemo: React.FC = () => {
  const { activeAssistant } = useAssistants();
  const {
    isConnected,
    syncStatus,
    isSyncing,
    syncError,
    connect,
    disconnect,
    syncFromActiveAssistant,
    handleAssistantSwitch,
    clearConfig,
    getStats,
  } = useAIConfigSync({
    wsUrl: 'ws://localhost:3004',
    autoConnect: true,
    autoSync: true,
  });

  // Auto-sync when active assistant changes
  useEffect(() => {
    if (isConnected && activeAssistant) {
      console.log('[AIConfigSyncDemo] Active assistant changed, syncing...');
      handleAssistantSwitch(activeAssistant);
    }
  }, [activeAssistant, isConnected, handleAssistantSwitch]);

  const stats = getStats();

  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          <span>AI Configuration Sync Status</span>
        </Space>
      }
      extra={
        <Space>
          <Badge
            status={isConnected ? 'success' : 'error'}
            text={isConnected ? 'Connected' : 'Disconnected'}
          />
          {isSyncing && <SyncOutlined spin />}
        </Space>
      }
    >
      {/* Connection Status */}
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="WebSocket">
          {isConnected ? (
            <Text type="success">
              <CheckCircleOutlined /> Connected
            </Text>
          ) : (
            <Text type="danger">
              <CloseCircleOutlined /> Disconnected
            </Text>
          )}
        </Descriptions.Item>
        
        <Descriptions.Item label="Reconnect Attempts">
          {stats.reconnectAttempts}
        </Descriptions.Item>
        
        <Descriptions.Item label="Active Requests">
          {stats.activeRequests}
        </Descriptions.Item>
        
        <Descriptions.Item label="Last Heartbeat">
          {stats.timeSinceLastHeartbeat > 0
            ? `${Math.floor(stats.timeSinceLastHeartbeat / 1000)}s ago`
            : 'N/A'}
        </Descriptions.Item>
      </Descriptions>

      {/* AI Configuration Status */}
      <Card
        type="inner"
        title="AI Configuration"
        style={{ marginTop: 16 }}
        extra={
          syncStatus.configured ? (
            <Badge status="success" text="Configured" />
          ) : (
            <Badge status="default" text="Not Configured" />
          )
        }
      >
        {syncStatus.configured ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Provider">
              <Text code>{syncStatus.provider}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Model">
              <Text code>{syncStatus.model}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Vision Support">
              {syncStatus.supportsVision ? (
                <Text type="success">
                  <CheckCircleOutlined /> Supported
                </Text>
              ) : (
                <Text type="secondary">Not Supported</Text>
              )}
            </Descriptions.Item>
            
            <Descriptions.Item label="Last Sync">
              {syncStatus.lastSyncTime
                ? new Date(syncStatus.lastSyncTime).toLocaleString()
                : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Alert
            message="No AI Configuration"
            description="Select an assistant with AI configuration to enable intelligent command parsing."
            type="info"
            showIcon
          />
        )}
      </Card>

      {/* Active Assistant */}
      {activeAssistant && (
        <Card
          type="inner"
          title="Active Assistant"
          style={{ marginTop: 16 }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>
              <strong>Name:</strong> {activeAssistant.emoji} {activeAssistant.title}
            </Text>
            <Text>
              <strong>Description:</strong> {activeAssistant.desc}
            </Text>
          </Space>
        </Card>
      )}

      {/* Error Display */}
      {syncError && (
        <Alert
          message="Sync Error"
          description={syncError}
          type="error"
          showIcon
          closable
          style={{ marginTop: 16 }}
        />
      )}

      {/* Control Buttons */}
      <Space style={{ marginTop: 16, width: '100%' }} wrap>
        {!isConnected ? (
          <Button
            type="primary"
            icon={<ApiOutlined />}
            onClick={connect}
          >
            Connect
          </Button>
        ) : (
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={disconnect}
          >
            Disconnect
          </Button>
        )}

        <Button
          icon={<SyncOutlined />}
          onClick={() => syncFromActiveAssistant(activeAssistant)}
          disabled={!isConnected || !activeAssistant || isSyncing}
          loading={isSyncing}
        >
          Manual Sync
        </Button>

        <Button
          icon={<ClearOutlined />}
          onClick={clearConfig}
          disabled={!isConnected || !syncStatus.configured}
        >
          Clear Config
        </Button>
      </Space>

      {/* Usage Instructions */}
      <Card
        type="inner"
        title="Usage Instructions"
        style={{ marginTop: 16 }}
      >
        <Paragraph>
          <ol>
            <li>Ensure the backend is running on port 3004</li>
            <li>Select an assistant with AI configuration from the market</li>
            <li>The AI config will automatically sync to the backend</li>
            <li>Use the intelligent agent to send natural language commands</li>
          </ol>
        </Paragraph>
        
        <Alert
          message="Note"
          description="Assistants must have AI configuration (provider, model, apiKey) to enable intelligent command parsing."
          type="info"
          showIcon
        />
      </Card>
    </Card>
  );
};

export default AIConfigSyncDemo;
