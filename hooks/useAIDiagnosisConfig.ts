/**
 * AI诊断配置Hook
 * 用于读取PureChat配置并发送到后端进行诊断
 */

import { useState, useEffect, useCallback } from 'react';

export interface AIDiagnosisConfig {
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  apiKey: string;
  apiBase?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIConfigStatus {
  ai_configured: boolean;
  ai_provider: string | null;
  ai_model: string | null;
  ai_supports_vision: boolean;
  unipixel_client_initialized: boolean;
  diagnosis_enabled: boolean;
}

/**
 * 从localStorage读取PureChat配置
 */
function loadPureChatConfig(): AIDiagnosisConfig | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // 尝试读取不同提供商的配置
    const providers: Array<'openai' | 'anthropic' | 'google'> = ['openai', 'anthropic', 'google'];
    
    for (const provider of providers) {
      const apiKey = localStorage.getItem(`chat.apiKey.${provider}`);
      
      if (apiKey) {
        // 读取其他配置
        const apiBase = localStorage.getItem(`chat.apiBase.${provider}`);
        const model = localStorage.getItem(`chat.model.${provider}`) || getDefaultModel(provider);
        
        // 读取通用配置
        const maxTokens = localStorage.getItem('chat.maxTokens');
        const temperature = localStorage.getItem('chat.temperature');
        
        return {
          provider,
          model,
          apiKey,
          apiBase: apiBase || undefined,
          maxTokens: maxTokens ? parseInt(maxTokens) : 2000,
          temperature: temperature ? parseFloat(temperature) : 0.7
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('读取PureChat配置失败:', error);
    return null;
  }
}

/**
 * 获取默认模型
 */
function getDefaultModel(provider: string): string {
  const defaults: Record<string, string> = {
    openai: 'gpt-4-vision-preview',
    anthropic: 'claude-3-5-sonnet',
    google: 'gemini-1.5-pro'
  };
  return defaults[provider] || 'gpt-4-vision-preview';
}

/**
 * 验证配置是否有效
 */
function validateConfig(config: AIDiagnosisConfig | null): { valid: boolean; error?: string } {
  if (!config) {
    return { valid: false, error: '未找到AI配置' };
  }
  
  if (!config.apiKey) {
    return { valid: false, error: 'API密钥未配置' };
  }
  
  if (!config.model) {
    return { valid: false, error: '模型未配置' };
  }
  
  return { valid: true };
}

export function useAIDiagnosisConfig() {
  const [config, setConfig] = useState<AIDiagnosisConfig | null>(null);
  const [configStatus, setConfigStatus] = useState<AIConfigStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 从localStorage加载配置
   */
  const loadConfig = useCallback(() => {
    const loadedConfig = loadPureChatConfig();
    setConfig(loadedConfig);
    
    const validation = validateConfig(loadedConfig);
    if (!validation.valid) {
      setError(validation.error || null);
    } else {
      setError(null);
    }
    
    return loadedConfig;
  }, []);

  /**
   * 发送配置到后端
   */
  const sendConfigToBackend = useCallback(async (sendMessage: (type: string, data: any) => void) => {
    const currentConfig = config || loadConfig();
    
    if (!currentConfig) {
      setError('无法加载AI配置');
      return false;
    }
    
    const validation = validateConfig(currentConfig);
    if (!validation.valid) {
      setError(validation.error || '配置无效');
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 发送配置到后端
      sendMessage('set_ai_config', {
        provider: currentConfig.provider,
        model: currentConfig.model,
        api_key: currentConfig.apiKey,
        api_base: currentConfig.apiBase,
        max_tokens: currentConfig.maxTokens,
        temperature: currentConfig.temperature
      });
      
      console.log('✅ AI配置已发送到后端:', {
        provider: currentConfig.provider,
        model: currentConfig.model
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送配置失败';
      setError(errorMessage);
      console.error('❌ 发送AI配置失败:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [config, loadConfig]);

  /**
   * 查询后端配置状态
   */
  const queryConfigStatus = useCallback((sendMessage: (type: string, data: any) => void) => {
    sendMessage('get_ai_config_status', {});
  }, []);

  /**
   * 处理配置状态响应
   */
  const handleConfigStatusResponse = useCallback((status: AIConfigStatus) => {
    setConfigStatus(status);
    
    if (!status.ai_configured) {
      setError('后端AI未配置');
    } else if (!status.ai_supports_vision) {
      setError('当前模型不支持视觉功能');
    } else {
      setError(null);
    }
  }, []);

  /**
   * 初始化时加载配置
   */
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  /**
   * 监听localStorage变化
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('chat.')) {
        console.log('检测到PureChat配置变化，重新加载...');
        loadConfig();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadConfig]);

  return {
    // 配置数据
    config,
    configStatus,
    
    // 状态
    isLoading,
    error,
    isConfigured: config !== null && error === null,
    
    // 方法
    loadConfig,
    sendConfigToBackend,
    queryConfigStatus,
    handleConfigStatusResponse
  };
}
