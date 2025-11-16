/**
 * React Hook for Keyboard Shortcuts
 * 
 * Provides a React hook interface for the keyboard shortcuts system.
 */

import { useEffect, useCallback, useRef } from 'react';
import {
  ShortcutsManager,
  ShortcutDefinition,
  getShortcutsManager,
  createDefaultShortcuts
} from '@/lib/workflow/shortcuts';

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts?: ShortcutDefinition[];
}

/**
 * Hook to manage keyboard shortcuts in a React component
 */
export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, shortcuts = [] } = options;
  const managerRef = useRef<ShortcutsManager>(getShortcutsManager());

  // Register shortcuts on mount
  useEffect(() => {
    const manager = managerRef.current;
    
    if (shortcuts.length > 0) {
      manager.registerMany(shortcuts);
    }

    // Cleanup: unregister shortcuts on unmount
    return () => {
      shortcuts.forEach(shortcut => {
        manager.unregister(shortcut.id);
      });
    };
  }, [shortcuts]);

  // Handle keyboard events
  useEffect(() => {
    const manager = managerRef.current;
    manager.setEnabled(enabled);

    const handleKeyDown = (event: KeyboardEvent) => {
      manager.handleKeyDown(event);
    };

    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);

  // Get shortcut groups
  const getShortcutGroups = useCallback(() => {
    return managerRef.current.getShortcutGroups();
  }, []);

  // Search shortcuts
  const searchShortcuts = useCallback((query: string) => {
    return managerRef.current.searchShortcuts(query);
  }, []);

  // Enable/disable specific shortcut
  const setShortcutEnabled = useCallback((id: string, enabled: boolean) => {
    managerRef.current.setShortcutEnabled(id, enabled);
  }, []);

  return {
    manager: managerRef.current,
    getShortcutGroups,
    searchShortcuts,
    setShortcutEnabled
  };
}

/**
 * Hook to create and manage workflow shortcuts
 */
export function useWorkflowShortcuts(actions: Parameters<typeof createDefaultShortcuts>[0]) {
  const shortcuts = useRef(createDefaultShortcuts(actions));

  return useKeyboardShortcuts({
    enabled: true,
    shortcuts: shortcuts.current
  });
}
