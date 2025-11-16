'use client';

/**
 * Intelligent Agent Initializer Component
 * 
 * This component initializes the Tello Intelligent Agent preset on application startup.
 * It runs once when the app mounts and ensures the preset exists in the database.
 */

import { useEffect, useRef } from 'react';
import { intelligentAgentPresetService } from '@/lib/services/intelligentAgentPresetService';

export function IntelligentAgentInitializer() {
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    // Initialize the preset asynchronously
    const initializePreset = async () => {
      try {
        await intelligentAgentPresetService.initializePreset();
      } catch (error) {
        // Error is already logged in the service
        // We don't throw here to avoid breaking the app
        console.error('[IntelligentAgentInitializer] Initialization failed:', error);
      }
    };

    initializePreset();
  }, []);

  // This component doesn't render anything
  return null;
}
