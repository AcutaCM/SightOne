/**
 * Intelligent Agent Error Handling - Main Export
 * 
 * Central export point for all error handling functionality.
 */

// Error classes and types
export {
  IntelligentAgentError,
  AIServiceError,
  DroneConnectionError,
  CommandParseError,
  CommandExecutionError,
  WebSocketError,
  IntelligentAgentErrorType,
  ErrorSeverity,
  getRecoverySuggestions,
  parseError,
  type ErrorRecoverySuggestion,
} from './intelligentAgentErrors';

// Error logger
export {
  intelligentAgentErrorLogger,
  type ErrorLogEntry,
  type ErrorStatistics,
} from './intelligentAgentErrorLogger';

// Error recovery
export {
  intelligentAgentErrorRecovery,
  type RetryConfig,
  type RecoveryResult,
} from './intelligentAgentErrorRecovery';

// Import types for utility functions
import type { IntelligentAgentError as IAgentError } from './intelligentAgentErrors';

// Utility function for handling errors in async operations
export async function handleIntelligentAgentError<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<{ success: boolean; data?: T; error?: IAgentError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const { parseError } = await import('./intelligentAgentErrors');
    const { intelligentAgentErrorLogger } = await import('./intelligentAgentErrorLogger');
    
    const agentError = parseError(error, context);
    intelligentAgentErrorLogger.logError(agentError, context?.userCommand);
    
    return { success: false, error: agentError };
  }
}

// Utility function for handling errors with automatic retry
export async function handleWithRetry<T>(
  operation: () => Promise<T>,
  operationId?: string,
  context?: Record<string, any>
): Promise<{ success: boolean; data?: T; error?: IAgentError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const { parseError } = await import('./intelligentAgentErrors');
    const { intelligentAgentErrorLogger } = await import('./intelligentAgentErrorLogger');
    const { intelligentAgentErrorRecovery } = await import('./intelligentAgentErrorRecovery');
    
    const agentError = parseError(error, context);
    intelligentAgentErrorLogger.logError(agentError, context?.userCommand);
    
    // Attempt recovery
    const recoveryResult = await intelligentAgentErrorRecovery.attemptRecovery(
      agentError,
      operation,
      operationId
    );
    
    if (recoveryResult.recovered) {
      // Operation succeeded after retry
      return { success: true };
    }
    
    return { success: false, error: agentError };
  }
}
