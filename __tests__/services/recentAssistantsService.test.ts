/**
 * Tests for Recent Assistants Service
 * 
 * Verifies the functionality of recording and retrieving recently used assistants.
 * Requirements: 7.5
 */

import { RecentAssistantsService, RecentAssistant } from '@/lib/services/recentAssistantsService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('RecentAssistantsService', () => {
  let service: RecentAssistantsService;

  beforeEach(() => {
    service = new RecentAssistantsService();
    localStorageMock.clear();
  });

  describe('recordUsage', () => {
    it('should record a new assistant usage', () => {
      service.recordUsage('assistant-1', 'Test Assistant', '🤖');
      
      const recent = service.getRecentAssistants();
      expect(recent).toHaveLength(1);
      expect(recent[0].id).toBe('assistant-1');
      expect(recent[0].title).toBe('Test Assistant');
      expect(recent[0].emoji).toBe('🤖');
    });

    it('should move existing assistant to the top when used again', () => {
      service.recordUsage('assistant-1', 'Assistant 1', '🤖');
      service.recordUsage('assistant-2', 'Assistant 2', '🚀');
      service.recordUsage('assistant-1', 'Assistant 1', '🤖');
      
      const recent = service.getRecentAssistants();
      expect(recent).toHaveLength(2);
      expect(recent[0].id).toBe('assistant-1');
      expect(recent[1].id).toBe('assistant-2');
    });

    it('should limit the list to 10 items', () => {
      // Record 15 assistants
      for (let i = 1; i <= 15; i++) {
        service.recordUsage(`assistant-${i}`, `Assistant ${i}`, '🤖');
      }
      
      const recent = service.getRecentAssistants();
      expect(recent).toHaveLength(10);
      expect(recent[0].id).toBe('assistant-15');
      expect(recent[9].id).toBe('assistant-6');
    });
  });

  describe('getRecentAssistants', () => {
    it('should return empty array when no assistants recorded', () => {
      const recent = service.getRecentAssistants();
      expect(recent).toEqual([]);
    });

    it('should return assistants in most recent first order', () => {
      service.recordUsage('assistant-1', 'Assistant 1', '🤖');
      service.recordUsage('assistant-2', 'Assistant 2', '🚀');
      service.recordUsage('assistant-3', 'Assistant 3', '✨');
      
      const recent = service.getRecentAssistants();
      expect(recent).toHaveLength(3);
      expect(recent[0].id).toBe('assistant-3');
      expect(recent[1].id).toBe('assistant-2');
      expect(recent[2].id).toBe('assistant-1');
    });

    it('should convert date strings to Date objects', () => {
      service.recordUsage('assistant-1', 'Test Assistant', '🤖');
      
      const recent = service.getRecentAssistants();
      expect(recent[0].lastUsedAt).toBeInstanceOf(Date);
    });
  });

  describe('clearAll', () => {
    it('should remove all recent assistants', () => {
      service.recordUsage('assistant-1', 'Assistant 1', '🤖');
      service.recordUsage('assistant-2', 'Assistant 2', '🚀');
      
      service.clearAll();
      
      const recent = service.getRecentAssistants();
      expect(recent).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should remove a specific assistant from the list', () => {
      service.recordUsage('assistant-1', 'Assistant 1', '🤖');
      service.recordUsage('assistant-2', 'Assistant 2', '🚀');
      service.recordUsage('assistant-3', 'Assistant 3', '✨');
      
      service.remove('assistant-2');
      
      const recent = service.getRecentAssistants();
      expect(recent).toHaveLength(2);
      expect(recent.find(a => a.id === 'assistant-2')).toBeUndefined();
    });

    it('should do nothing if assistant not in list', () => {
      service.recordUsage('assistant-1', 'Assistant 1', '🤖');
      
      service.remove('assistant-999');
      
      const recent = service.getRecentAssistants();
      expect(recent).toHaveLength(1);
    });
  });

  describe('isRecent', () => {
    it('should return true for recent assistants', () => {
      service.recordUsage('assistant-1', 'Assistant 1', '🤖');
      
      expect(service.isRecent('assistant-1')).toBe(true);
    });

    it('should return false for non-recent assistants', () => {
      service.recordUsage('assistant-1', 'Assistant 1', '🤖');
      
      expect(service.isRecent('assistant-999')).toBe(false);
    });
  });

  describe('getMostRecent', () => {
    it('should return the most recently used assistant', () => {
      service.recordUsage('assistant-1', 'Assistant 1', '🤖');
      service.recordUsage('assistant-2', 'Assistant 2', '🚀');
      
      const mostRecent = service.getMostRecent();
      expect(mostRecent).not.toBeNull();
      expect(mostRecent?.id).toBe('assistant-2');
    });

    it('should return null when no assistants recorded', () => {
      const mostRecent = service.getMostRecent();
      expect(mostRecent).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.setItem('recent_assistants', 'invalid json');
      
      const recent = service.getRecentAssistants();
      expect(recent).toEqual([]);
    });

    it('should handle non-array data in localStorage', () => {
      localStorageMock.setItem('recent_assistants', '{"not": "an array"}');
      
      const recent = service.getRecentAssistants();
      expect(recent).toEqual([]);
    });
  });
});
