/**
 * AI Configuration Validation Panel Tests
 * 
 * Task 7: Test suite for AI configuration validation UI
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIConfigValidationPanel from '@/components/AIConfigValidationPanel';
import { useAIConfigSync } from '@/hooks/useAIConfigSync';
import { useAssistants } from '@/contexts/AssistantContext';

// Mock the hooks
jest.mock('@/hooks/useAIConfigSync');
jest.mock('@/contexts/AssistantContext');

const mockUseAIConfigSync = useAIConfigSync as jest.MockedFunction<typeof useAIConfigSync>;
const mockUseAssistants = useAssistants as jest.MockedFunction<typeof useAssistants>;

describe('AIConfigValidationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration Status Display', () => {
    it('should display unconfigured warning when AI is not configured', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: null,
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: { configured: false },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel />);

      expect(screen.getByText('AI 未配置')).toBeInTheDocument();
      expect(screen.getByText(/请在 ChatbotChat 中选择一个 AI 助理/)).toBeInTheDocument();
    });

    it('should display connection error when not connected', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: null,
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: false,
        syncStatus: { configured: false },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel />);

      expect(screen.getByText('未连接到后端服务')).toBeInTheDocument();
      expect(screen.getByText(/无法连接到智能代理后端/)).toBeInTheDocument();
    });

    it('should display configured status with provider and model', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: {
          id: '1',
          title: 'Test Assistant',
          emoji: '🤖',
        },
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: {
          configured: true,
          provider: 'openai',
          model: 'gpt-4o',
          supportsVision: true,
          lastSyncTime: Date.now(),
        },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel />);

      expect(screen.getByText('AI 配置正常')).toBeInTheDocument();
      expect(screen.getByText(/openai - gpt-4o/)).toBeInTheDocument();
      expect(screen.getByText('支持视觉功能')).toBeInTheDocument();
    });

    it('should display sync error when present', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: null,
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: { configured: false },
        isSyncing: false,
        syncError: 'API key invalid',
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel />);

      expect(screen.getByText('AI 配置错误')).toBeInTheDocument();
      expect(screen.getByText('API key invalid')).toBeInTheDocument();
    });

    it('should display syncing indicator', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: null,
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: { configured: false },
        isSyncing: true,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel />);

      expect(screen.getByText('正在同步配置...')).toBeInTheDocument();
    });
  });

  describe('Active Assistant Display', () => {
    it('should display active assistant information', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: {
          id: '1',
          title: 'GPT-4 Assistant',
          emoji: '🤖',
        },
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: {
          configured: true,
          provider: 'openai',
          model: 'gpt-4o',
        },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel />);

      expect(screen.getByText('🤖')).toBeInTheDocument();
      expect(screen.getByText('GPT-4 Assistant')).toBeInTheDocument();
      expect(screen.getByText('当前激活的助理')).toBeInTheDocument();
    });
  });

  describe('Configuration Testing', () => {
    it('should render test button when testing is enabled', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: null,
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: {
          configured: true,
          provider: 'openai',
          model: 'gpt-4o',
        },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel enableTesting={true} />);

      expect(screen.getByText('测试配置')).toBeInTheDocument();
    });

    it('should not render test button when testing is disabled', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: null,
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: {
          configured: true,
          provider: 'openai',
          model: 'gpt-4o',
        },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel enableTesting={false} />);

      expect(screen.queryByText('测试配置')).not.toBeInTheDocument();
    });

    it('should disable test button when not connected', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: null,
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: false,
        syncStatus: {
          configured: true,
          provider: 'openai',
          model: 'gpt-4o',
        },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel enableTesting={true} />);

      const testButton = screen.getByText('测试配置').closest('button');
      expect(testButton).toBeDisabled();
    });

    it('should handle successful test', async () => {
      const mockSyncFromActiveAssistant = jest.fn().mockResolvedValue({
        success: true,
      });

      mockUseAssistants.mockReturnValue({
        activeAssistant: {
          id: '1',
          title: 'Test Assistant',
        },
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: {
          configured: true,
          provider: 'openai',
          model: 'gpt-4o',
        },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: mockSyncFromActiveAssistant,
      } as any);

      render(<AIConfigValidationPanel enableTesting={true} />);

      const testButton = screen.getByText('测试配置');
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(screen.getByText(/AI 配置测试成功/)).toBeInTheDocument();
      });
    });

    it('should handle failed test', async () => {
      const mockSyncFromActiveAssistant = jest.fn().mockResolvedValue({
        success: false,
        error: 'Connection timeout',
      });

      mockUseAssistants.mockReturnValue({
        activeAssistant: {
          id: '1',
          title: 'Test Assistant',
        },
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: {
          configured: true,
          provider: 'openai',
          model: 'gpt-4o',
        },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: mockSyncFromActiveAssistant,
      } as any);

      render(<AIConfigValidationPanel enableTesting={true} />);

      const testButton = screen.getByText('测试配置');
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(screen.getByText(/测试失败: Connection timeout/)).toBeInTheDocument();
      });
    });
  });

  describe('Provider Details', () => {
    it('should render provider list when enabled', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: null,
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: { configured: false },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel showProviderDetails={true} />);

      expect(screen.getByText('支持的 AI 提供商')).toBeInTheDocument();
      expect(screen.getByText('OpenAI')).toBeInTheDocument();
      expect(screen.getByText('Anthropic')).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('Ollama (Local)')).toBeInTheDocument();
    });

    it('should not render provider list when disabled', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: null,
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: { configured: false },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel showProviderDetails={false} />);

      expect(screen.queryByText('支持的 AI 提供商')).not.toBeInTheDocument();
    });

    it('should expand provider details on click', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: null,
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: { configured: false },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel showProviderDetails={true} />);

      const openaiButton = screen.getByText('OpenAI').closest('button');
      expect(openaiButton).toBeInTheDocument();

      // Initially, models should not be visible
      expect(screen.queryByText('GPT-4o')).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(openaiButton!);

      // Models should now be visible
      expect(screen.getByText('GPT-4o')).toBeInTheDocument();
    });

    it('should highlight active provider', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: null,
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: {
          configured: true,
          provider: 'openai',
          model: 'gpt-4o',
        },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      render(<AIConfigValidationPanel showProviderDetails={true} />);

      const openaiButton = screen.getByText('OpenAI').closest('button');
      expect(openaiButton).toHaveClass('bg-blue-50');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      mockUseAssistants.mockReturnValue({
        activeAssistant: null,
      } as any);

      mockUseAIConfigSync.mockReturnValue({
        isConnected: true,
        syncStatus: { configured: false },
        isSyncing: false,
        syncError: null,
        syncFromActiveAssistant: jest.fn(),
      } as any);

      const { container } = render(
        <AIConfigValidationPanel className="custom-test-class" />
      );

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('custom-test-class');
    });
  });
});
