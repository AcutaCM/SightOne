/**
 * React Hook for Tello Intelligent Agent
 * 
 * Provides easy access to AI-powered drone command analysis and execution
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  TelloIntelligentAgent,
  ChatbotAIConfig,
  AIAnalysisResult,
  CommandExecutionResult,
  ImageAnalysisResult,
  DroneCommand,
  createTelloAgent,
  getTelloAgent
} from '@/lib/services/telloIntelligentAgent';

export interface UseTelloAgentOptions {
  config: ChatbotAIConfig;
  droneBackendUrl?: string;
  autoExecute?: boolean; // Automatically execute commands after analysis
}

export interface UseTelloAgentReturn {
  // State
  isAnalyzing: boolean;
  isExecuting: boolean;
  lastAnalysis: AIAnalysisResult | null;
  lastExecution: CommandExecutionResult[] | null;
  error: string | null;

  // Methods
  analyzeCommand: (command: string) => Promise<AIAnalysisResult>;
  analyzeImage: (imageData: string, prompt?: string) => Promise<ImageAnalysisResult>;
  executeCommands: (commands: DroneCommand[]) => Promise<CommandExecutionResult[]>;
  analyzeAndExecute: (command: string) => Promise<{
    analysis: AIAnalysisResult;
    execution: CommandExecutionResult[];
  }>;
  updateConfig: (config: Partial<ChatbotAIConfig>) => void;
  clearError: () => void;
  reset: () => void;

  // Agent instance
  agent: TelloIntelligentAgent | null;
}

export function useTelloIntelligentAgent(options: UseTelloAgentOptions): UseTelloAgentReturn {
  const { config, droneBackendUrl, autoExecute = false } = options;

  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysisResult | null>(null);
  const [lastExecution, setLastExecution] = useState<CommandExecutionResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Agent instance ref
  const agentRef = useRef<TelloIntelligentAgent | null>(null);

  // Initialize agent
  useEffect(() => {
    if (!agentRef.current) {
      agentRef.current = createTelloAgent(config, droneBackendUrl);
    }
  }, []);

  // Update config when it changes
  useEffect(() => {
    if (agentRef.current) {
      agentRef.current.updateConfig(config);
    }
  }, [config]);

  /**
   * Analyze natural language command
   */
  const analyzeCommand = useCallback(async (command: string): Promise<AIAnalysisResult> => {
    if (!agentRef.current) {
      const errorResult: AIAnalysisResult = {
        success: false,
        commands: [],
        error: 'Agent not initialized'
      };
      setError('Agent not initialized');
      return errorResult;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await agentRef.current.analyzeCommand(command);
      setLastAnalysis(result);

      if (!result.success) {
        setError(result.error || 'Analysis failed');
      }

      // Auto-execute if enabled and analysis succeeded
      if (autoExecute && result.success && result.commands.length > 0) {
        await executeCommands(result.commands);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        commands: [],
        error: errorMessage
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, [autoExecute]);

  /**
   * Analyze image
   */
  const analyzeImage = useCallback(async (
    imageData: string,
    prompt?: string
  ): Promise<ImageAnalysisResult> => {
    if (!agentRef.current) {
      const errorResult: ImageAnalysisResult = {
        success: false,
        error: 'Agent not initialized'
      };
      setError('Agent not initialized');
      return errorResult;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await agentRef.current.analyzeImage({
        imageData,
        prompt
      });

      if (!result.success) {
        setError(result.error || 'Image analysis failed');
      }

      // Auto-execute suggested commands if enabled
      if (autoExecute && result.success && result.suggestedCommands && result.suggestedCommands.length > 0) {
        await executeCommands(result.suggestedCommands);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, [autoExecute]);

  /**
   * Execute command sequence
   */
  const executeCommands = useCallback(async (
    commands: DroneCommand[]
  ): Promise<CommandExecutionResult[]> => {
    if (!agentRef.current) {
      const errorResult: CommandExecutionResult[] = [{
        success: false,
        action: 'init',
        error: 'Agent not initialized'
      }];
      setError('Agent not initialized');
      return errorResult;
    }

    setIsExecuting(true);
    setError(null);

    try {
      const results = await agentRef.current.executeCommands(commands);
      setLastExecution(results);

      // Check if any command failed
      const failedCommand = results.find(r => !r.success);
      if (failedCommand) {
        setError(`Command ${failedCommand.action} failed: ${failedCommand.error}`);
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [{
        success: false,
        action: 'execute',
        error: errorMessage
      }];
    } finally {
      setIsExecuting(false);
    }
  }, []);

  /**
   * Analyze and execute in one call
   */
  const analyzeAndExecute = useCallback(async (command: string) => {
    const analysis = await analyzeCommand(command);
    
    let execution: CommandExecutionResult[] = [];
    
    if (analysis.success && analysis.commands.length > 0) {
      execution = await executeCommands(analysis.commands);
    }

    return { analysis, execution };
  }, [analyzeCommand, executeCommands]);

  /**
   * Update agent configuration from chatbotchat
   */
  const updateConfig = useCallback((newConfig: Partial<ChatbotAIConfig>) => {
    if (agentRef.current) {
      agentRef.current.updateConfig(newConfig);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setLastAnalysis(null);
    setLastExecution(null);
    setError(null);
  }, []);

  return {
    // State
    isAnalyzing,
    isExecuting,
    lastAnalysis,
    lastExecution,
    error,

    // Methods
    analyzeCommand,
    analyzeImage,
    executeCommands,
    analyzeAndExecute,
    updateConfig,
    clearError,
    reset,

    // Agent instance
    agent: agentRef.current
  };
}

// Export types for convenience
export type {
  ChatbotAIConfig,
  AIAnalysisResult,
  CommandExecutionResult,
  ImageAnalysisResult,
  DroneCommand
};
