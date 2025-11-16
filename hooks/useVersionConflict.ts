'use client';

import { useState, useCallback } from 'react';

interface VersionConflictState {
  isOpen: boolean;
  assistantId: string | null;
  assistantTitle: string | null;
  retryAction: (() => void) | null;
}

export const useVersionConflict = () => {
  const [conflictState, setConflictState] = useState<VersionConflictState>({
    isOpen: false,
    assistantId: null,
    assistantTitle: null,
    retryAction: null,
  });

  const showConflictDialog = useCallback((
    assistantId: string,
    assistantTitle: string,
    retryAction: () => void
  ) => {
    setConflictState({
      isOpen: true,
      assistantId,
      assistantTitle,
      retryAction,
    });
  }, []);

  const hideConflictDialog = useCallback(() => {
    setConflictState({
      isOpen: false,
      assistantId: null,
      assistantTitle: null,
      retryAction: null,
    });
  }, []);

  const handleRetry = useCallback(() => {
    if (conflictState.retryAction) {
      conflictState.retryAction();
    }
  }, [conflictState.retryAction]);

  return {
    conflictState,
    showConflictDialog,
    hideConflictDialog,
    handleRetry,
  };
};
