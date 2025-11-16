/**
 * Dependencies and Utilities Verification Test
 * Verifies all required dependencies and utility functions are available
 */

import { describe, it, expect } from '@jest/globals';

describe('Dependencies Verification', () => {
  describe('framer-motion', () => {
    it('should be installed and importable', async () => {
      const framerMotion = await import('framer-motion');
      expect(framerMotion).toBeDefined();
      expect(framerMotion.motion).toBeDefined();
      expect(framerMotion.AnimatePresence).toBeDefined();
    });
  });

  describe('next-themes', () => {
    it('should be installed and importable', async () => {
      const nextThemes = await import('next-themes');
      expect(nextThemes).toBeDefined();
      expect(nextThemes.ThemeProvider).toBeDefined();
      expect(nextThemes.useTheme).toBeDefined();
    });
  });

  describe('clsx and tailwind-merge', () => {
    it('should have clsx installed', async () => {
      const clsx = await import('clsx');
      expect(clsx).toBeDefined();
      expect(typeof clsx.clsx).toBe('function');
    });

    it('should have tailwind-merge installed', async () => {
      const { twMerge } = await import('tailwind-merge');
      expect(twMerge).toBeDefined();
      expect(typeof twMerge).toBe('function');
    });
  });

  describe('Utility Functions', () => {
    it('should have cn utility function', async () => {
      const { cn } = await import('@/lib/utils');
      expect(cn).toBeDefined();
      expect(typeof cn).toBe('function');
      
      // Test cn function works correctly
      const result = cn('class1', 'class2');
      expect(typeof result).toBe('string');
    });

    it('cn should merge classes correctly', async () => {
      const { cn } = await import('@/lib/utils');
      
      // Test basic merging
      expect(cn('px-2', 'px-4')).toBe('px-4');
      
      // Test conditional classes
      expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
    });
  });

  describe('AssistantContext', () => {
    it('should export Assistant interface types', async () => {
      const AssistantModule = await import('@/contexts/AssistantContext');
      expect(AssistantModule).toBeDefined();
    });

    it('should export AssistantProvider', async () => {
      const { AssistantProvider } = await import('@/contexts/AssistantContext');
      expect(AssistantProvider).toBeDefined();
      expect(typeof AssistantProvider).toBe('function');
    });

    it('should export useAssistants hook', async () => {
      const { useAssistants } = await import('@/contexts/AssistantContext');
      expect(useAssistants).toBeDefined();
      expect(typeof useAssistants).toBe('function');
    });
  });
});

describe('Package Versions', () => {
  it('should have correct framer-motion version', async () => {
    const packageJson = await import('../../package.json');
    expect(packageJson.dependencies['framer-motion']).toBe('^11.18.2');
  });

  it('should have next-themes installed', async () => {
    const packageJson = await import('../../package.json');
    expect(packageJson.dependencies['next-themes']).toBeDefined();
  });

  it('should have clsx installed', async () => {
    const packageJson = await import('../../package.json');
    expect(packageJson.dependencies['clsx']).toBeDefined();
  });

  it('should have tailwind-merge installed', async () => {
    const packageJson = await import('../../package.json');
    expect(packageJson.dependencies['tailwind-merge']).toBeDefined();
  });
});
