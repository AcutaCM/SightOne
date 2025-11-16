/**
 * Tello Chat History Hook
 * Manages chat history with automatic persistence to localStorage
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TelloChatHistoryService, 
  ChatMessage 
} from '@/lib/services/telloChatHistoryService';

/**
 * Hook options interface
 */
export interface UseTelloChatHistoryOptions {
  assistantId: string;
  initialMessages: ChatMessage[];
  autoSave?: boolean;
  saveDelay?: number; // Debounce delay in milliseconds
}

/**
 * Hook return interface
 */
export interface UseTelloChatHistoryReturn {
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  clearHistory: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing Tello chat history with persistence
 */
export function useTelloChatHistory(
  options: UseTelloChatHistoryOptions
): UseTelloChatHistoryReturn {
  const {
    assistantId,
    initialMessages,
    autoSave = true,
    saveDelay = 500
  } = options;

  // State management
  const [messages, setMessagesState] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for debouncing and cleanup
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const previousAssistantIdRef = useRef(assistantId);

  /**
   * Load history from localStorage on mount or when assistant changes
   */
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const savedHistory = TelloChatHistoryService.loadHistory(assistantId);

        if (isMountedRef.current) {
          if (savedHistory && savedHistory.length > 0) {
            setMessagesState(savedHistory);
          } else {
            // Initialize with default welcome message
            setMessagesState(initialMessages);
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load chat history';
        console.error('Error loading chat history:', err);
        
        if (isMountedRef.current) {
          setError(errorMsg);
          // Fall back to initial messages on error
          setMessagesState(initialMessages);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();
  }, [assistantId, initialMessages]);

  /**
   * Handle assistant ID changes - save current history and load new one
   */
  useEffect(() => {
    if (previousAssistantIdRef.current !== assistantId) {
      // Save current history before switching
      if (previousAssistantIdRef.current) {
        TelloChatHistoryService.saveHistory(
          previousAssistantIdRef.current,
          messages
        );
      }

      previousAssistantIdRef.current = assistantId;
    }
  }, [assistantId, messages]);

  /**
   * Auto-save with debouncing
   */
  useEffect(() => {
    if (!autoSave || isLoading) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const success = TelloChatHistoryService.saveHistory(assistantId, messages);
        
        if (!success) {
          console.warn('Failed to save chat history');
        }
      } catch (err) {
        console.error('Error saving chat history:', err);
      }
    }, saveDelay);

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, assistantId, autoSave, saveDelay, isLoading]);

  /**
   * Final save on component unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // Perform final save before unmount
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      try {
        TelloChatHistoryService.saveHistory(assistantId, messages);
      } catch (err) {
        console.error('Error saving chat history on unmount:', err);
      }
    };
  }, [assistantId, messages]);

  /**
   * Wrapper for setMessages to handle both direct values and updater functions
   */
  const setMessages = useCallback((
    value: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => {
    setMessagesState(value);
  }, []);

  /**
   * Clear history - resets to welcome message and clears localStorage
   */
  const clearHistory = useCallback(() => {
    try {
      // Clear from localStorage
      const success = TelloChatHistoryService.clearHistory(assistantId);

      if (success) {
        // Reset to initial messages (welcome message)
        setMessagesState(initialMessages);
        setError(null);
      } else {
        setError('Failed to clear chat history');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to clear chat history';
      console.error('Error clearing chat history:', err);
      setError(errorMsg);
    }
  }, [assistantId, initialMessages]);

  return {
    messages,
    setMessages,
    clearHistory,
    isLoading,
    error
  };
}
