/**
 * Tello AI 解析器 Hook
 * 提供简单的接口来使用 AI 解析器
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  TelloAIParser, 
  AIConfig, 
  ParseResponse, 
  ParsedCommands,
  createTelloAIParser 
} from '@/lib/services/telloAIParser';

export interface UseTelloAIParserOptions {
  aiConfig: AIConfig;
  onSuccess?: (data: ParsedCommands) => void;
  onError?: (error: string) => void;
}

export interface UseTelloAIParserReturn {
  parse: (input: string) => Promise<ParseResponse>;
  isLoading: boolean;
  error: string | null;
  lastResult: ParsedCommands | null;
  reset: () => void;
}

/**
 * Tello AI 解析器 Hook
 */
export function useTelloAIParser(options: UseTelloAIParserOptions): UseTelloAIParserReturn {
  const { aiConfig, onSuccess, onError } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ParsedCommands | null>(null);

  const parserRef = useRef<TelloAIParser | null>(null);

  // 初始化解析器
  useEffect(() => {
    parserRef.current = createTelloAIParser(aiConfig);
  }, [aiConfig]);

  // 更新配置
  useEffect(() => {
    if (parserRef.current) {
      parserRef.current.updateConfig(aiConfig);
    }
  }, [aiConfig]);

  /**
   * 解析自然语言指令
   */
  const parse = useCallback(async (input: string): Promise<ParseResponse> => {
    if (!parserRef.current) {
      const errorResponse: ParseResponse = {
        success: false,
        error: 'AI 解析器未初始化'
      };
      setError(errorResponse.error!);
      onError?.(errorResponse.error!);
      return errorResponse;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await parserRef.current.parse(input);

      if (response.success && response.data) {
        setLastResult(response.data);
        onSuccess?.(response.data);
      } else {
        setError(response.error || '解析失败');
        onError?.(response.error || '解析失败');
      }

      return response;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);
      onError?.(errorMessage);

      return {
        success: false,
        error: errorMessage
      };

    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setLastResult(null);
  }, []);

  return {
    parse,
    isLoading,
    error,
    lastResult,
    reset
  };
}
