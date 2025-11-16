/**
 * User Assistant List Updates
 * 
 * This file contains the logic for updating the user assistant list
 * when assistants are added from the market.
 * 
 * Requirements:
 * - 3.1: Real-time list updates when assistants are added
 * - 3.2: Smooth animations for new assistants
 * - 3.3: Highlight newly added assistants
 * - 3.4: Auto-scroll to newly added assistants
 * - 6.2: Load user assistants on component mount
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { userAssistantService } from '@/lib/services/userAssistantService';
import { UserAssistant } from '@/types/assistant';
import styles from '@/styles/AssistantActivation.module.css';

/**
 * Hook for managing user assistant list updates
 */
export function useUserAssistantListUpdates() {
  // State for user assistants (Requirement 3.1, 6.2)
  const [localUserAssistants, setLocalUserAssistants] = useState<UserAssistant[]>([]);
  
  // State for highlighted assistant (Requirement 3.3)
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  // Ref for list container (Requirement 3.4)
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Ref for highlight timeout
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load user assistants from service (Requirement 6.2)
   */
  const loadUserAssistants = useCallback(() => {
    try {
      const assistants = userAssistantService.getUserAssistants();
      setLocalUserAssistants(assistants);
      
      // Check if there's a recently added assistant (within 5 seconds)
      if (assistants.length > 0) {
        const newest = assistants[0];
        const now = new Date().getTime();
        const addedTime = newest.addedAt.getTime();
        
        // If added within last 5 seconds, highlight it (Requirement 3.3)
        if (now - addedTime < 5000) {
          setHighlightedId(newest.id);
          
          // Scroll to the assistant (Requirement 3.4)
          setTimeout(() => {
            scrollToAssistant(newest.id);
          }, 100);
          
          // Clear highlight after 3 seconds
          if (highlightTimeoutRef.current) {
            clearTimeout(highlightTimeoutRef.current);
          }
          highlightTimeoutRef.current = setTimeout(() => {
            setHighlightedId(null);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('[UserAssistantList] Failed to load user assistants:', error);
    }
  }, []);

  /**
   * Scroll to a specific assistant (Requirement 3.4)
   */
  const scrollToAssistant = useCallback((assistantId: string) => {
    const element = document.getElementById(`user-assistant-${assistantId}`);
    if (element && listContainerRef.current) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, []);

  /**
   * Handle assistant list update event (Requirement 3.1)
   */
  const handleAssistantListUpdate = useCallback(() => {
    console.log('[UserAssistantList] Received userAssistantsUpdated event');
    loadUserAssistants();
  }, [loadUserAssistants]);

  /**
   * Handle assistant switch event (Requirement 5.5)
   */
  const handleSwitchToAssistant = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<{ assistantId: string }>;
    const { assistantId } = customEvent.detail;
    
    console.log('[UserAssistantList] Received switchToAssistant event:', assistantId);
    
    // Update last used time
    userAssistantService.updateLastUsed(assistantId).catch(error => {
      console.error('[UserAssistantList] Failed to update last used:', error);
    });
    
    // Scroll to the assistant
    scrollToAssistant(assistantId);
  }, [scrollToAssistant]);

  /**
   * Load assistants on mount (Requirement 6.2)
   */
  useEffect(() => {
    loadUserAssistants();
  }, [loadUserAssistants]);

  /**
   * Listen for assistant list updates (Requirement 3.1)
   */
  useEffect(() => {
    window.addEventListener('userAssistantsUpdated', handleAssistantListUpdate);
    window.addEventListener('switchToAssistant', handleSwitchToAssistant as EventListener);
    
    return () => {
      window.removeEventListener('userAssistantsUpdated', handleAssistantListUpdate);
      window.removeEventListener('switchToAssistant', handleSwitchToAssistant as EventListener);
      
      // Clear highlight timeout on unmount
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [handleAssistantListUpdate, handleSwitchToAssistant]);

  return {
    localUserAssistants,
    highlightedId,
    listContainerRef,
    loadUserAssistants,
    scrollToAssistant,
  };
}

/**
 * Get CSS class for highlighted assistant (Requirement 3.3)
 */
export function getAssistantCardClassName(assistantId: string, highlightedId: string | null): string {
  const classes = [
    styles['user-assistant-card'],
    assistantId === highlightedId && styles.highlighted
  ].filter(Boolean);
  
  return classes.join(' ');
}

/**
 * Get CSS class for new assistant card with animation (Requirement 3.2)
 */
export function getNewAssistantCardClassName(isNew: boolean): string {
  const classes = [
    styles['user-assistant-card'],
    isNew && styles['user-assistant-card-new']
  ].filter(Boolean);
  
  return classes.join(' ');
}
