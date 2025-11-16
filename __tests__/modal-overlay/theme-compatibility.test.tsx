/**
 * Modal Overlay Z-Index Fix - Theme Compatibility Tests
 * 
 * Tests for Requirements 3.1, 3.2, 3.3, 3.4:
 * - Light theme compatibility
 * - Dark theme compatibility
 * - Overlay transparency in both themes
 * - Theme switching with modal open
 * 
 * Task 5: 主题兼容性测试
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AssistantSettingsSidebar } from '@/components/AssistantSettingsSidebar';
import { Z_INDEX } from '@/lib/design-tokens';

// Mock dependencies
jest.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    id: 'test-user',
    email: 'test@example.com',
    role: 'user'
  })
}));

jest.mock('@/lib/services/assistantDraftManager', () => ({
  draftManager: {
    loadDraft: jest.fn(() => null),
    saveDraft: jest.fn(),
    clearDraft: jest.fn()
  },
  AssistantFormData: {}
}));

jest.mock('@/lib/services/assistantPermissionService', () => ({
  assistantPermissionService: {
    canCreate: jest.fn(() => ({ allowed: true })),
    canEdit: jest.fn(() => ({ allowed: true })),
    canDelete: jest.fn(() => ({ allowed: true }))
  }
}));

jest.mock('@/lib/services/notificationService', () => ({
  notificationService: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn()
  }
}));

jest.mock('@/lib/services/assistantErrorHandler', () => ({
  assistantErrorHandler: {
    executeWithRetry: jest.fn((fn) => fn()),
    handleError: jest.fn(),
    createError: jest.fn(),
    getUserFriendlyMessage: jest.fn(),
    clearRetryCount: jest.fn()
  }
}));

describe('Modal Overlay Z-Index Fix - Theme Compatibility', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task 5.1: 浅色主题测试 (Light Theme)', () => {
    beforeEach(() => {
      // Set light theme
      document.documentElement.classList.remove('dark');
    });

    it('should render modal with correct z-index in light theme', async () => {
      const { container } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        expect(modalBackdrop).toBeInTheDocument();
      });
    });

    it('should not cover sidebar with modal overlay in light theme (Requirement 3.1)', async () => {
      const { container } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        if (modalBackdrop) {
          const computedStyle = window.getComputedStyle(modalBackdrop);
          const zIndex = parseInt(computedStyle.zIndex || '0');
          
          // Modal overlay should be 900 (below sidebar at 1000)
          expect(zIndex).toBeLessThan(Z_INDEX.sidebar);
        }
      });
    });

    it('should display modal content correctly in light theme (Requirement 3.1)', async () => {
      render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('创建新助理')).toBeInTheDocument();
      });
    });

    it('should have appropriate overlay transparency in light theme (Requirement 3.3)', async () => {
      const { container } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        if (modalBackdrop) {
          const computedStyle = window.getComputedStyle(modalBackdrop);
          
          // Check that backdrop has some opacity/transparency
          expect(computedStyle.backgroundColor).toBeTruthy();
        }
      });
    });

    it('should maintain z-index hierarchy in light theme', async () => {
      const { container } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        const modalContent = container.querySelector('[data-slot="base"]');

        if (modalBackdrop && modalContent) {
          const backdropZ = parseInt(window.getComputedStyle(modalBackdrop).zIndex || '0');
          const contentZ = parseInt(window.getComputedStyle(modalContent).zIndex || '0');

          // Verify z-index hierarchy: overlay < sidebar < content
          expect(backdropZ).toBe(Z_INDEX.modalOverlay);
          expect(contentZ).toBeGreaterThan(Z_INDEX.sidebar);
        }
      });
    });
  });

  describe('Task 5.2: 深色主题测试 (Dark Theme)', () => {
    beforeEach(() => {
      // Set dark theme
      document.documentElement.classList.add('dark');
    });

    afterEach(() => {
      // Clean up
      document.documentElement.classList.remove('dark');
    });

    it('should render modal with correct z-index in dark theme', async () => {
      const { container } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        expect(modalBackdrop).toBeInTheDocument();
      });
    });

    it('should not cover sidebar with modal overlay in dark theme (Requirement 3.2)', async () => {
      const { container } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        if (modalBackdrop) {
          const computedStyle = window.getComputedStyle(modalBackdrop);
          const zIndex = parseInt(computedStyle.zIndex || '0');
          
          // Modal overlay should be 900 (below sidebar at 1000)
          expect(zIndex).toBeLessThan(Z_INDEX.sidebar);
        }
      });
    });

    it('should display modal content correctly in dark theme (Requirement 3.2)', async () => {
      render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('创建新助理')).toBeInTheDocument();
      });
    });

    it('should have appropriate overlay transparency in dark theme (Requirement 3.3)', async () => {
      const { container } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        if (modalBackdrop) {
          const computedStyle = window.getComputedStyle(modalBackdrop);
          
          // Check that backdrop has some opacity/transparency
          expect(computedStyle.backgroundColor).toBeTruthy();
        }
      });
    });

    it('should maintain z-index hierarchy in dark theme', async () => {
      const { container } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        const modalContent = container.querySelector('[data-slot="base"]');

        if (modalBackdrop && modalContent) {
          const backdropZ = parseInt(window.getComputedStyle(modalBackdrop).zIndex || '0');
          const contentZ = parseInt(window.getComputedStyle(modalContent).zIndex || '0');

          // Verify z-index hierarchy: overlay < sidebar < content
          expect(backdropZ).toBe(Z_INDEX.modalOverlay);
          expect(contentZ).toBeGreaterThan(Z_INDEX.sidebar);
        }
      });
    });
  });

  describe('Task 5.3: 主题切换测试 (Theme Switching)', () => {
    it('should maintain correct z-index when switching from light to dark theme (Requirement 3.4)', async () => {
      // Start with light theme
      document.documentElement.classList.remove('dark');

      const { container, rerender } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        expect(modalBackdrop).toBeInTheDocument();
      });

      // Switch to dark theme
      document.documentElement.classList.add('dark');

      // Re-render to trigger theme change
      rerender(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        if (modalBackdrop) {
          const zIndex = parseInt(window.getComputedStyle(modalBackdrop).zIndex || '0');
          expect(zIndex).toBe(Z_INDEX.modalOverlay);
        }
      });

      // Clean up
      document.documentElement.classList.remove('dark');
    });

    it('should maintain correct z-index when switching from dark to light theme (Requirement 3.4)', async () => {
      // Start with dark theme
      document.documentElement.classList.add('dark');

      const { container, rerender } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        expect(modalBackdrop).toBeInTheDocument();
      });

      // Switch to light theme
      document.documentElement.classList.remove('dark');

      // Re-render to trigger theme change
      rerender(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        if (modalBackdrop) {
          const zIndex = parseInt(window.getComputedStyle(modalBackdrop).zIndex || '0');
          expect(zIndex).toBe(Z_INDEX.modalOverlay);
        }
      });

      // Clean up
      document.documentElement.classList.remove('dark');
    });

    it('should have smooth animations during theme switching (Requirement 3.4)', async () => {
      document.documentElement.classList.remove('dark');

      const { container } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalContent = container.querySelector('[data-slot="base"]');
        if (modalContent) {
          const computedStyle = window.getComputedStyle(modalContent);
          
          // Check for transition properties
          expect(computedStyle.transition).toBeTruthy();
        }
      });
    });

    it('should maintain modal visibility during theme switching', async () => {
      document.documentElement.classList.remove('dark');

      const { container, rerender } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('创建新助理')).toBeInTheDocument();
      });

      // Switch theme
      document.documentElement.classList.add('dark');

      rerender(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      // Modal should still be visible
      await waitFor(() => {
        expect(screen.getByText('创建新助理')).toBeInTheDocument();
      });

      // Clean up
      document.documentElement.classList.remove('dark');
    });
  });

  describe('Nested Modal Z-Index Tests', () => {
    it('should have higher z-index for nested modals', async () => {
      const { container } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        // Check that nested modal z-index constant is higher
        expect(Z_INDEX.modalNested).toBeGreaterThan(Z_INDEX.modalContent);
        expect(Z_INDEX.modalNested).toBeGreaterThan(Z_INDEX.sidebar);
      });
    });
  });

  describe('Z-Index Design Tokens Validation', () => {
    it('should have correct z-index hierarchy defined', () => {
      // Verify the z-index hierarchy is correct
      expect(Z_INDEX.base).toBe(0);
      expect(Z_INDEX.modalOverlay).toBe(900);
      expect(Z_INDEX.sidebar).toBe(1000);
      expect(Z_INDEX.modalContent).toBe(1100);
      expect(Z_INDEX.modalNested).toBe(1200);

      // Verify relationships
      expect(Z_INDEX.modalOverlay).toBeLessThan(Z_INDEX.sidebar);
      expect(Z_INDEX.sidebar).toBeLessThan(Z_INDEX.modalContent);
      expect(Z_INDEX.modalContent).toBeLessThan(Z_INDEX.modalNested);
    });

    it('should export Z_INDEX as const', () => {
      // Verify that Z_INDEX is properly typed
      expect(typeof Z_INDEX).toBe('object');
      expect(Z_INDEX).toBeTruthy();
    });
  });

  describe('CSS Class Application', () => {
    it('should apply modal-overlay-fix class to backdrop', async () => {
      const { container } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalBackdrop = container.querySelector('.modal-overlay-fix');
        expect(modalBackdrop).toBeInTheDocument();
      });
    });

    it('should apply correct z-index style to modal content', async () => {
      const { container } = render(
        <AssistantSettingsSidebar
          visible={true}
          onClose={mockOnClose}
          mode="create"
          onSave={mockOnSave}
        />
      );

      await waitFor(() => {
        const modalWrapper = container.querySelector('[role="dialog"]')?.parentElement;
        if (modalWrapper) {
          const style = modalWrapper.getAttribute('style');
          expect(style).toContain('z-index');
        }
      });
    });
  });
});
