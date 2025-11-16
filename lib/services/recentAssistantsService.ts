/**
 * Recent Assistants Service
 * 
 * Manages the list of recently used assistants for quick access.
 * Stores data in localStorage with a maximum of 10 recent items.
 * 
 * Requirements: 7.5
 */

export interface RecentAssistant {
  id: string;
  title: string;
  emoji: string;
  lastUsedAt: Date;
}

const STORAGE_KEY = 'recent_assistants';
const MAX_RECENT_ITEMS = 10;

export class RecentAssistantsService {
  /**
   * Record an assistant as recently used
   * Adds or updates the assistant in the recent list
   */
  recordUsage(assistantId: string, title: string, emoji: string): void {
    if (typeof window === 'undefined') return;

    try {
      const recent = this.getRecentAssistants();
      
      // Remove existing entry if present
      const filtered = recent.filter(item => item.id !== assistantId);
      
      // Add to the beginning of the list
      const updated: RecentAssistant[] = [
        {
          id: assistantId,
          title,
          emoji,
          lastUsedAt: new Date(),
        },
        ...filtered,
      ];
      
      // Keep only the most recent MAX_RECENT_ITEMS
      const trimmed = updated.slice(0, MAX_RECENT_ITEMS);
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      
      console.log(`[RecentAssistants] Recorded usage: ${title} (${assistantId})`);
    } catch (error) {
      console.error('[RecentAssistants] Failed to record usage:', error);
    }
  }

  /**
   * Get the list of recently used assistants
   * Returns up to MAX_RECENT_ITEMS assistants, sorted by most recent first
   */
  getRecentAssistants(): RecentAssistant[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      // Convert date strings back to Date objects
      return parsed.map(item => ({
        ...item,
        lastUsedAt: new Date(item.lastUsedAt),
      }));
    } catch (error) {
      console.error('[RecentAssistants] Failed to get recent assistants:', error);
      return [];
    }
  }

  /**
   * Clear all recent assistants
   */
  clearAll(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('[RecentAssistants] Cleared all recent assistants');
    } catch (error) {
      console.error('[RecentAssistants] Failed to clear recent assistants:', error);
    }
  }

  /**
   * Remove a specific assistant from recent list
   */
  remove(assistantId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const recent = this.getRecentAssistants();
      const filtered = recent.filter(item => item.id !== assistantId);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      console.log(`[RecentAssistants] Removed assistant: ${assistantId}`);
    } catch (error) {
      console.error('[RecentAssistants] Failed to remove assistant:', error);
    }
  }

  /**
   * Check if an assistant is in the recent list
   */
  isRecent(assistantId: string): boolean {
    const recent = this.getRecentAssistants();
    return recent.some(item => item.id === assistantId);
  }

  /**
   * Get the most recently used assistant
   */
  getMostRecent(): RecentAssistant | null {
    const recent = this.getRecentAssistants();
    return recent.length > 0 ? recent[0] : null;
  }
}

// Export singleton instance
export const recentAssistantsService = new RecentAssistantsService();
