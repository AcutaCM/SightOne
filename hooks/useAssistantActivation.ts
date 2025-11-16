/**
 * useAssistantActivation Hook
 * 
 * Custom hook for managing assistant activation from the market.
 * Handles adding assistants to user's personal list with proper state management,
 * error handling, and user feedback.
 * 
 * Features:
 * - State management for activation process
 * - Automatic detection of already-added assistants
 * - Success/error notifications
 * - Global event broadcasting for list updates
 * 
 * @example
 * ```tsx
 * const { isAdded, isAdding, error, addAssistant, clearError } = useAssistantActivation(assistant);
 * 
 * <Button onClick={addAssistant} loading={isAdding} disabled={isAdded}>
 *   {isAdded ? '已添加' : '使用该助手进行聊天'}
 * </Button>
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { Assistant } from '@/types/assistant';
import { userAssistantService, UserAssistantServiceError } from '@/lib/services/userAssistantService';

/**
 * Hook return type
 */
export interface UseAssistantActivationReturn {
  /** Whether the assistant is already added to user's list */
  isAdded: boolean;
  /** Whether the add operation is in progress */
  isAdding: boolean;
  /** Error message if operation failed */
  error: string | null;
  /** Function to add the assistant to user's list */
  addAssistant: () => Promise<void>;
  /** Function to clear the error state */
  clearError: () => void;
}

/**
 * Custom hook for assistant activation
 * 
 * @param assistant - The assistant to activate
 * @returns Hook state and methods
 */
export function useAssistantActivation(
  assistant: Assistant
): UseAssistantActivationReturn {
  // State management
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if assistant is already added on mount and when assistant changes
   */
  useEffect(() => {
    const checkIfAdded = () => {
      try {
        const added = userAssistantService.isAssistantAdded(assistant.id);
        setIsAdded(added);
      } catch (err) {
        console.error('[useAssistantActivation] Failed to check if assistant is added:', err);
        // Don't set error state for check failures, just log
      }
    };

    checkIfAdded();
  }, [assistant.id]);

  /**
   * Add assistant to user's list
   */
  const addAssistant = useCallback(async () => {
    // If already added, show info message and return
    if (isAdded) {
      message.info('该助手已在您的列表中');
      return;
    }

    // Reset error state
    setError(null);
    setIsAdding(true);

    try {
      // Call service to add assistant
      await userAssistantService.addAssistant(assistant);

      // Update state
      setIsAdded(true);

      // Show success notification with icon
      message.success('助手已添加到列表', 3);

      // Trigger global event to notify other components
      window.dispatchEvent(new CustomEvent('userAssistantsUpdated', {
        detail: { assistantId: assistant.id }
      }));

    } catch (err) {
      // Handle errors
      let errorMessage = '添加失败';

      if (err instanceof UserAssistantServiceError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      // Update error state
      setError(errorMessage);

      // Show error notification
      message.error(errorMessage);

      console.error('[useAssistantActivation] Failed to add assistant:', err);
    } finally {
      setIsAdding(false);
    }
  }, [assistant, isAdded]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAdded,
    isAdding,
    error,
    addAssistant,
    clearError,
  };
}
