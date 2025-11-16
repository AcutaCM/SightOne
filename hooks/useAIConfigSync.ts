/**
 * React Hook for AI Configuration Synchronization
 * 
 * Task 5: Provides easy integration with AssistantContext for automatic
 * AI configuration synchronization to the backend.
 * 
 * Task 6: Enhanced with automatic assistant switching listener that monitors
 * AssistantContext changes and syncs AI configuration automatically.
 * 
 * Usage:
 * ```tsx
 * // Basic usage - manual sync
 * const { syncStatus, syncFromActiveAssistant } = useAIConfigSync();
 * 
 * // With automatic assistant monitoring
 * const { syncStatus } = useAIConfigSync({
 *   autoSync: true,
 *   activeAssistant: activeAssistant // from AssistantContext
 * });
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAIConfigSyncClient, AIConfigStatus } from '@/lib/websocket/aiConfigSync';
import { Assistant } from '@/types/assistant';

export interface UseAIConfigSyncOptions {
  /**
   * WebSocket URL for the backend
   * @default 'ws://localhost:3004'
   */
  wsUrl?: string;
  
  /**
   * Auto-connect on mount
   * @default true
   */
  autoConnect?: boolean;
  
  /**
   * Auto-sync when assistant changes
   * @default true
   */
  autoSync?: boolean;
  
  /**
   * Task 6: Active assistant to monitor for changes
   * When provided, the hook will automatically sync AI config when this changes
   */
  activeAssistant?: Assistant | null;
  
  /**
   * Task 6: Callback when sync status changes
   * Useful for displaying sync status in UI
   */
  onSyncStatusChange?: (status: AIConfigStatus) => void;
  
  /**
   * Task 6: Callback when sync completes (success or failure)
   */
  onSyncComplete?: (result: { success: boolean; error?: string }) => void;
}

export interface UseAIConfigSyncReturn {
  /**
   * Current connection status
   */
  isConnected: boolean;
  
  /**
   * Current AI configuration status
   */
  syncStatus: AIConfigStatus;
  
  /**
   * Whether a sync operation is in progress
   */
  isSyncing: boolean;
  
  /**
   * Last sync error
   */
  syncError: string | null;
  
  /**
   * Manually connect to WebSocket
   */
  connect: () => Promise<boolean>;
  
  /**
   * Disconnect from WebSocket
   */
  disconnect: () => void;
  
  /**
   * Sync AI config from active assistant
   */
  syncFromActiveAssistant: (assistant: Assistant | null) => Promise<{ success: boolean; error?: string }>;
  
  /**
   * Handle assistant switch (with change detection)
   */
  handleAssistantSwitch: (assistant: Assistant | null) => Promise<{ success: boolean; error?: string }>;
  
  /**
   * Clear AI configuration
   */
  clearConfig: () => Promise<void>;
  
  /**
   * Get connection statistics
   */
  getStats: () => {
    connected: boolean;
    reconnectAttempts: number;
    timeSinceLastHeartbeat: number;
    activeRequests: number;
  };
}

/**
 * Hook for AI configuration synchronization with AssistantContext
 * 
 * Task 6: Enhanced with automatic assistant switching detection
 */
export function useAIConfigSync(options: UseAIConfigSyncOptions = {}): UseAIConfigSyncReturn {
  const {
    wsUrl = 'ws://localhost:3004',
    autoConnect = true,
    autoSync = true,
    activeAssistant,
    onSyncStatusChange,
    onSyncComplete,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<AIConfigStatus>({ configured: false });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const clientRef = useRef(getAIConfigSyncClient(wsUrl));
  const mountedRef = useRef(true);
  
  // Task 6: Track previous assistant to detect changes
  const previousAssistantRef = useRef<Assistant | null>(null);

  // Initialize connection
  useEffect(() => {
    mountedRef.current = true;
    const client = clientRef.current;

    // Connection state listener
    const handleConnectionChange = (connected: boolean) => {
      if (mountedRef.current) {
        setIsConnected(connected);
        console.log('[useAIConfigSync] Connection state changed:', connected);
      }
    };

    // Config status listener
    const handleConfigStatusChange = (status: AIConfigStatus) => {
      if (mountedRef.current) {
        setSyncStatus(status);
        if (status.error) {
          setSyncError(status.error);
        }
        console.log('[useAIConfigSync] Config status changed:', status);
        
        // Task 6: Notify callback if provided
        if (onSyncStatusChange) {
          try {
            onSyncStatusChange(status);
          } catch (error) {
            console.error('[useAIConfigSync] Error in onSyncStatusChange callback:', error);
          }
        }
      }
    };

    // Register listeners
    client.onConnectionChange(handleConnectionChange);
    client.onConfigStatusChange(handleConfigStatusChange);

    // Auto-connect if enabled
    if (autoConnect && !client.isConnected()) {
      console.log('[useAIConfigSync] Auto-connecting...');
      client.connect().catch((error) => {
        console.error('[useAIConfigSync] Auto-connect failed:', error);
        if (mountedRef.current) {
          setSyncError(error.message || 'Connection failed');
        }
      });
    }

    // Cleanup
    return () => {
      mountedRef.current = false;
      client.offConnectionChange(handleConnectionChange);
      client.offConfigStatusChange(handleConfigStatusChange);
    };
  }, [wsUrl, autoConnect, onSyncStatusChange]);

  // Task 6: Monitor active assistant changes and auto-sync
  useEffect(() => {
    // Skip if auto-sync is disabled
    if (!autoSync) {
      console.log('[useAIConfigSync] Auto-sync disabled, skipping assistant monitoring');
      return;
    }

    // Skip if not connected
    if (!isConnected) {
      console.log('[useAIConfigSync] Not connected, skipping assistant sync');
      return;
    }

    const client = clientRef.current;
    const previousAssistant = previousAssistantRef.current;

    // Detect assistant change
    const assistantChanged = 
      activeAssistant?.id !== previousAssistant?.id;

    if (!assistantChanged) {
      // No change detected
      return;
    }

    console.log('[useAIConfigSync] Assistant changed detected:', {
      previous: previousAssistant?.title || 'none',
      current: activeAssistant?.title || 'none',
    });

    // Update reference
    previousAssistantRef.current = activeAssistant || null;

    // Perform auto-sync
    const performAutoSync = async () => {
      try {
        setIsSyncing(true);
        setSyncError(null);

        console.log('[useAIConfigSync] Auto-syncing AI config for assistant:', activeAssistant?.title);
        
        const result = await client.handleAssistantSwitch(activeAssistant || null);

        if (mountedRef.current) {
          if (!result.success) {
            setSyncError(result.error || 'Auto-sync failed');
            console.error('[useAIConfigSync] Auto-sync failed:', result.error);
          } else {
            console.log('[useAIConfigSync] Auto-sync successful');
          }

          // Task 6: Notify completion callback
          if (onSyncComplete) {
            try {
              onSyncComplete(result);
            } catch (error) {
              console.error('[useAIConfigSync] Error in onSyncComplete callback:', error);
            }
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Auto-sync failed';
        console.error('[useAIConfigSync] Auto-sync error:', errorMsg);
        
        if (mountedRef.current) {
          setSyncError(errorMsg);
          
          // Notify completion callback with error
          if (onSyncComplete) {
            try {
              onSyncComplete({ success: false, error: errorMsg });
            } catch (callbackError) {
              console.error('[useAIConfigSync] Error in onSyncComplete callback:', callbackError);
            }
          }
        }
      } finally {
        if (mountedRef.current) {
          setIsSyncing(false);
        }
      }
    };

    performAutoSync();
  }, [activeAssistant, autoSync, isConnected, onSyncComplete]);

  // Connect manually
  const connect = useCallback(async (): Promise<boolean> => {
    const client = clientRef.current;
    
    try {
      setSyncError(null);
      console.log('[useAIConfigSync] Connecting...');
      const success = await client.connect();
      return success;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Connection failed';
      console.error('[useAIConfigSync] Connection error:', errorMsg);
      setSyncError(errorMsg);
      return false;
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    const client = clientRef.current;
    console.log('[useAIConfigSync] Disconnecting...');
    client.disconnect();
  }, []);

  // Sync from active assistant
  const syncFromActiveAssistant = useCallback(async (
    assistant: Assistant | null
  ): Promise<{ success: boolean; error?: string }> => {
    const client = clientRef.current;
    
    if (!client.isConnected()) {
      const error = 'Not connected to backend';
      console.error('[useAIConfigSync]', error);
      setSyncError(error);
      return { success: false, error };
    }

    try {
      setIsSyncing(true);
      setSyncError(null);
      
      console.log('[useAIConfigSync] Syncing from assistant:', assistant?.title);
      const result = await client.syncFromAssistant(assistant);
      
      if (!result.success) {
        setSyncError(result.error || 'Sync failed');
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Sync failed';
      console.error('[useAIConfigSync] Sync error:', errorMsg);
      setSyncError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Handle assistant switch
  const handleAssistantSwitch = useCallback(async (
    assistant: Assistant | null
  ): Promise<{ success: boolean; error?: string }> => {
    const client = clientRef.current;
    
    if (!client.isConnected()) {
      const error = 'Not connected to backend';
      console.error('[useAIConfigSync]', error);
      setSyncError(error);
      return { success: false, error };
    }

    if (!autoSync) {
      console.log('[useAIConfigSync] Auto-sync disabled, skipping');
      return { success: true };
    }

    try {
      setIsSyncing(true);
      setSyncError(null);
      
      console.log('[useAIConfigSync] Handling assistant switch:', assistant?.title);
      const result = await client.handleAssistantSwitch(assistant);
      
      if (!result.success) {
        setSyncError(result.error || 'Sync failed');
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Sync failed';
      console.error('[useAIConfigSync] Switch error:', errorMsg);
      setSyncError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSyncing(false);
    }
  }, [autoSync]);

  // Clear configuration
  const clearConfig = useCallback(async (): Promise<void> => {
    const client = clientRef.current;
    
    try {
      setSyncError(null);
      console.log('[useAIConfigSync] Clearing configuration...');
      await client.clearAIConfig();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Clear failed';
      console.error('[useAIConfigSync] Clear error:', errorMsg);
      setSyncError(errorMsg);
      throw error;
    }
  }, []);

  // Get connection statistics
  const getStats = useCallback(() => {
    const client = clientRef.current;
    return client.getConnectionStats();
  }, []);

  return {
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
  };
}
