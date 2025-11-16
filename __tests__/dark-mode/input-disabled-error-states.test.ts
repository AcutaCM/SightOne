/**
 * Input Disabled and Error States Tests
 * Task 7.3: Update input disabled and error states
 * 
 * Requirements:
 * - 9.3: Apply 3% white opacity to disabled inputs
 * - 9.4: Apply 60% white opacity to error borders
 */

import { DarkModeTokens } from '@/lib/design-tokens-dark';

describe('Input Disabled and Error States - Dark Mode', () => {
  describe('Design Tokens', () => {
    it('should have correct disabled input background opacity (3%)', () => {
      expect(DarkModeTokens.colors.background.inputDisabled).toBe('rgba(255, 255, 255, 0.03)');
    });

    it('should have correct error border opacity (60%)', () => {
      expect(DarkModeTokens.colors.border.error).toBe('rgba(255, 255, 255, 0.6)');
    });

    it('should have correct disabled text opacity (40%)', () => {
      expect(DarkModeTokens.colors.text.disabled).toBe('rgba(255, 255, 255, 0.4)');
    });

    it('should have correct subtle border opacity for disabled state (8%)', () => {
      expect(DarkModeTokens.colors.border.subtle).toBe('rgba(255, 255, 255, 0.08)');
    });
  });

  describe('CSS Variables', () => {
    it('should define disabled input background variable', () => {
      const root = document.documentElement;
      root.setAttribute('data-theme', 'dark');
      
      const styles = getComputedStyle(root);
      const bgInputDisabled = styles.getPropertyValue('--bg-input-disabled').trim();
      
      expect(bgInputDisabled).toBe('rgba(255, 255, 255, 0.03)');
    });

    it('should define error border variable', () => {
      const root = document.documentElement;
      root.setAttribute('data-theme', 'dark');
      
      const styles = getComputedStyle(root);
      const borderError = styles.getPropertyValue('--border-error').trim();
      
      expect(borderError).toBe('rgba(255, 255, 255, 0.6)');
    });

    it('should define disabled text variable', () => {
      const root = document.documentElement;
      root.setAttribute('data-theme', 'dark');
      
      const styles = getComputedStyle(root);
      const textDisabled = styles.getPropertyValue('--text-disabled').trim();
      
      expect(textDisabled).toBe('rgba(255, 255, 255, 0.4)');
    });

    it('should define subtle border variable', () => {
      const root = document.documentElement;
      root.setAttribute('data-theme', 'dark');
      
      const styles = getComputedStyle(root);
      const borderSubtle = styles.getPropertyValue('--border-subtle').trim();
      
      expect(borderSubtle).toBe('rgba(255, 255, 255, 0.08)');
    });
  });

  describe('Disabled Input Styles', () => {
    it('should apply correct styles to disabled text input', () => {
      document.body.classList.add('dark');
      const input = document.createElement('input');
      input.type = 'text';
      input.disabled = true;
      document.body.appendChild(input);

      const styles = getComputedStyle(input);
      
      // Check background color (3% white opacity)
      expect(styles.backgroundColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.03\)/);
      
      // Check border color (8% white opacity)
      expect(styles.borderColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.08\)/);
      
      // Check text color (40% white opacity)
      expect(styles.color).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.4\)/);
      
      // Check cursor
      expect(styles.cursor).toBe('not-allowed');

      document.body.removeChild(input);
      document.body.classList.remove('dark');
    });

    it('should apply correct styles to disabled textarea', () => {
      document.body.classList.add('dark');
      const textarea = document.createElement('textarea');
      textarea.disabled = true;
      document.body.appendChild(textarea);

      const styles = getComputedStyle(textarea);
      
      expect(styles.backgroundColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.03\)/);
      expect(styles.cursor).toBe('not-allowed');

      document.body.removeChild(textarea);
      document.body.classList.remove('dark');
    });

    it('should apply correct styles to disabled select', () => {
      document.body.classList.add('dark');
      const select = document.createElement('select');
      select.disabled = true;
      document.body.appendChild(select);

      const styles = getComputedStyle(select);
      
      expect(styles.backgroundColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.03\)/);
      expect(styles.cursor).toBe('not-allowed');

      document.body.removeChild(select);
      document.body.classList.remove('dark');
    });
  });

  describe('Error Input Styles', () => {
    it('should apply correct styles to input with error class', () => {
      document.body.classList.add('dark');
      const input = document.createElement('input');
      input.type = 'text';
      input.classList.add('error');
      document.body.appendChild(input);

      const styles = getComputedStyle(input);
      
      // Check error border color (60% white opacity)
      expect(styles.borderColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.6\)/);
      
      // Check background color (8% white opacity for error state)
      expect(styles.backgroundColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.08\)/);

      document.body.removeChild(input);
      document.body.classList.remove('dark');
    });

    it('should apply correct styles to input with aria-invalid', () => {
      document.body.classList.add('dark');
      const input = document.createElement('input');
      input.type = 'email';
      input.setAttribute('aria-invalid', 'true');
      document.body.appendChild(input);

      const styles = getComputedStyle(input);
      
      // Check error border color
      expect(styles.borderColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.6\)/);

      document.body.removeChild(input);
      document.body.classList.remove('dark');
    });

    it('should maintain error border on focus', () => {
      document.body.classList.add('dark');
      const input = document.createElement('input');
      input.type = 'text';
      input.classList.add('error');
      document.body.appendChild(input);
      
      input.focus();
      const styles = getComputedStyle(input);
      
      // Error border should be maintained on focus
      expect(styles.borderColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.6\)/);
      
      // Background should change to focus state
      expect(styles.backgroundColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.1\)/);

      document.body.removeChild(input);
      document.body.classList.remove('dark');
    });
  });

  describe('HeroUI Component Overrides', () => {
    it('should apply disabled styles to HeroUI input wrapper', () => {
      document.body.classList.add('dark');
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-slot', 'input-wrapper');
      wrapper.setAttribute('data-disabled', 'true');
      document.body.appendChild(wrapper);

      const styles = getComputedStyle(wrapper);
      
      // Check disabled background
      expect(styles.backgroundColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.03\)/);

      document.body.removeChild(wrapper);
      document.body.classList.remove('dark');
    });

    it('should apply error styles to HeroUI input wrapper', () => {
      document.body.classList.add('dark');
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-slot', 'input-wrapper');
      wrapper.setAttribute('data-invalid', 'true');
      document.body.appendChild(wrapper);

      const styles = getComputedStyle(wrapper);
      
      // Check error border
      expect(styles.borderColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.6\)/);

      document.body.removeChild(wrapper);
      document.body.classList.remove('dark');
    });

    it('should maintain error border on focus for HeroUI input', () => {
      document.body.classList.add('dark');
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-slot', 'input-wrapper');
      wrapper.setAttribute('data-invalid', 'true');
      wrapper.setAttribute('data-focus', 'true');
      document.body.appendChild(wrapper);

      const styles = getComputedStyle(wrapper);
      
      // Error border should be maintained
      expect(styles.borderColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.6\)/);

      document.body.removeChild(wrapper);
      document.body.classList.remove('dark');
    });
  });

  describe('Opacity Values', () => {
    it('should have correct disabled opacity in scale', () => {
      expect(DarkModeTokens.opacity.disabled).toBe(0.03);
    });

    it('should have correct error border opacity calculation', () => {
      // Error border uses 60% opacity
      const errorOpacity = 0.6;
      expect(DarkModeTokens.colors.border.error).toBe(`rgba(255, 255, 255, ${errorOpacity})`);
    });

    it('should have correct disabled text opacity', () => {
      // Disabled text uses 40% opacity (low)
      expect(DarkModeTokens.opacity.low).toBe(0.4);
      expect(DarkModeTokens.colors.text.disabled).toBe('rgba(255, 255, 255, 0.4)');
    });
  });

  describe('Transitions', () => {
    it('should have smooth transitions for state changes', () => {
      document.body.classList.add('dark');
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);

      const styles = getComputedStyle(input);
      
      // Check that transitions are defined
      expect(styles.transition).toContain('background-color');
      expect(styles.transition).toContain('border-color');

      document.body.removeChild(input);
      document.body.classList.remove('dark');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-invalid attribute', () => {
      document.body.classList.add('dark');
      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('aria-invalid', 'true');
      document.body.appendChild(input);

      const styles = getComputedStyle(input);
      
      // Should apply error styles
      expect(styles.borderColor).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.6\)/);

      document.body.removeChild(input);
      document.body.classList.remove('dark');
    });

    it('should maintain opacity: 1 for disabled inputs', () => {
      document.body.classList.add('dark');
      const input = document.createElement('input');
      input.type = 'text';
      input.disabled = true;
      document.body.appendChild(input);

      const styles = getComputedStyle(input);
      
      // Opacity should be 1 (not reduced by browser default)
      expect(styles.opacity).toBe('1');

      document.body.removeChild(input);
      document.body.classList.remove('dark');
    });
  });
});
