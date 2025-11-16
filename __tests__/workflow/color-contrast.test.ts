/**
 * Color Contrast Tests - WCAG Compliance
 * Requirements: 8.4
 * 
 * Tests to ensure all theme colors meet WCAG 2.1 accessibility standards
 */

import {
  getContrastRatio,
  checkContrast,
  analyzeThemeContrast,
  validateThemeColors,
  WCAG_LEVELS,
  suggestImprovedColor,
} from '@/lib/workflow/colorContrastChecker';

describe('Color Contrast Checker', () => {
  describe('getContrastRatio', () => {
    it('should calculate correct contrast ratio for black and white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 1);
    });
    
    it('should calculate correct contrast ratio for same colors', () => {
      const ratio = getContrastRatio('#FFFFFF', '#FFFFFF');
      expect(ratio).toBeCloseTo(1, 1);
    });
    
    it('should handle 3-digit hex colors', () => {
      const ratio = getContrastRatio('#000', '#FFF');
      expect(ratio).toBeCloseTo(21, 1);
    });
    
    it('should handle colors without # prefix', () => {
      const ratio = getContrastRatio('000000', 'FFFFFF');
      expect(ratio).toBeCloseTo(21, 1);
    });
  });
  
  describe('checkContrast', () => {
    it('should pass AA for high contrast', () => {
      const result = checkContrast('#000000', '#FFFFFF');
      expect(result.passAA).toBe(true);
      expect(result.passAAA).toBe(true);
    });
    
    it('should fail AA for low contrast', () => {
      const result = checkContrast('#CCCCCC', '#FFFFFF');
      expect(result.passAA).toBe(false);
    });
    
    it('should provide recommendations for failing colors', () => {
      const result = checkContrast('#AAAAAA', '#FFFFFF');
      expect(result.recommendation).toBeDefined();
      expect(result.recommendation).toContain('below WCAG AA');
    });
  });
  
  describe('Light Theme Contrast', () => {
    const lightThemeAnalysis = analyzeThemeContrast(false);
    
    it('should have primary text with AAA contrast', () => {
      const primaryText = lightThemeAnalysis.find(
        a => a.pair.name === 'Primary Text on Node Background'
      );
      
      expect(primaryText).toBeDefined();
      expect(primaryText!.passAAA).toBe(true);
      expect(primaryText!.ratio).toBeGreaterThanOrEqual(WCAG_LEVELS.AAA_NORMAL);
    });
    
    it('should have secondary text with at least AA contrast', () => {
      const secondaryText = lightThemeAnalysis.find(
        a => a.pair.name === 'Secondary Text on Node Background'
      );
      
      expect(secondaryText).toBeDefined();
      expect(secondaryText!.passAA).toBe(true);
      expect(secondaryText!.ratio).toBeGreaterThanOrEqual(WCAG_LEVELS.AA_NORMAL);
    });
    
    it('should have tertiary text with at least AA contrast', () => {
      const tertiaryText = lightThemeAnalysis.find(
        a => a.pair.name === 'Tertiary Text on Node Background'
      );
      
      expect(tertiaryText).toBeDefined();
      expect(tertiaryText!.passAA).toBe(true);
      expect(tertiaryText!.ratio).toBeGreaterThanOrEqual(WCAG_LEVELS.AA_NORMAL);
    });
    
    it('should have error text with sufficient contrast', () => {
      const errorText = lightThemeAnalysis.find(
        a => a.pair.name === 'Error Text on Node Background'
      );
      
      expect(errorText).toBeDefined();
      expect(errorText!.passAA).toBe(true);
    });
    
    it('should have all color pairs pass AA standard', () => {
      const allPass = lightThemeAnalysis.every(a => a.passAA);
      
      if (!allPass) {
        const failing = lightThemeAnalysis.filter(a => !a.passAA);
        console.error('Failing color pairs:', failing);
      }
      
      expect(allPass).toBe(true);
    });
  });
  
  describe('Dark Theme Contrast', () => {
    const darkThemeAnalysis = analyzeThemeContrast(true);
    
    it('should have primary text with AAA contrast', () => {
      const primaryText = darkThemeAnalysis.find(
        a => a.pair.name === 'Primary Text on Node Background'
      );
      
      expect(primaryText).toBeDefined();
      expect(primaryText!.passAAA).toBe(true);
      expect(primaryText!.ratio).toBeGreaterThanOrEqual(WCAG_LEVELS.AAA_NORMAL);
    });
    
    it('should have secondary text with at least AA contrast', () => {
      const secondaryText = darkThemeAnalysis.find(
        a => a.pair.name === 'Secondary Text on Node Background'
      );
      
      expect(secondaryText).toBeDefined();
      expect(secondaryText!.passAA).toBe(true);
      expect(secondaryText!.ratio).toBeGreaterThanOrEqual(WCAG_LEVELS.AA_NORMAL);
    });
    
    it('should have tertiary text with at least AA contrast', () => {
      const tertiaryText = darkThemeAnalysis.find(
        a => a.pair.name === 'Tertiary Text on Node Background'
      );
      
      expect(tertiaryText).toBeDefined();
      expect(tertiaryText!.passAA).toBe(true);
      expect(tertiaryText!.ratio).toBeGreaterThanOrEqual(WCAG_LEVELS.AA_NORMAL);
    });
    
    it('should have error text with sufficient contrast', () => {
      const errorText = darkThemeAnalysis.find(
        a => a.pair.name === 'Error Text on Node Background'
      );
      
      expect(errorText).toBeDefined();
      expect(errorText!.passAA).toBe(true);
    });
    
    it('should have all color pairs pass AA standard', () => {
      const allPass = darkThemeAnalysis.every(a => a.passAA);
      
      if (!allPass) {
        const failing = darkThemeAnalysis.filter(a => !a.passAA);
        console.error('Failing color pairs:', failing);
      }
      
      expect(allPass).toBe(true);
    });
  });
  
  describe('validateThemeColors', () => {
    it('should validate light theme successfully', () => {
      const isValid = validateThemeColors(false);
      expect(isValid).toBe(true);
    });
    
    it('should validate dark theme successfully', () => {
      const isValid = validateThemeColors(true);
      expect(isValid).toBe(true);
    });
  });
  
  describe('suggestImprovedColor', () => {
    it('should return null for colors that already meet standards', () => {
      const suggestion = suggestImprovedColor('#000000', '#FFFFFF');
      expect(suggestion).toBeNull();
    });
    
    it('should suggest darker color for light backgrounds', () => {
      const suggestion = suggestImprovedColor('#CCCCCC', '#FFFFFF');
      expect(suggestion).toBeDefined();
      
      if (suggestion) {
        const ratio = getContrastRatio(suggestion, '#FFFFFF');
        expect(ratio).toBeGreaterThanOrEqual(WCAG_LEVELS.AA_NORMAL);
      }
    });
    
    it('should suggest lighter color for dark backgrounds', () => {
      const suggestion = suggestImprovedColor('#333333', '#000000');
      expect(suggestion).toBeDefined();
      
      if (suggestion) {
        const ratio = getContrastRatio(suggestion, '#000000');
        expect(ratio).toBeGreaterThanOrEqual(WCAG_LEVELS.AA_NORMAL);
      }
    });
  });
  
  describe('Specific Color Combinations', () => {
    it('should validate light theme primary text (#1A1A1A on #FFFFFF)', () => {
      const result = checkContrast('#1A1A1A', '#FFFFFF');
      expect(result.passAAA).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(7);
    });
    
    it('should validate light theme secondary text (#666666 on #FFFFFF)', () => {
      const result = checkContrast('#666666', '#FFFFFF');
      expect(result.passAA).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });
    
    it('should validate light theme tertiary text (#707070 on #FFFFFF)', () => {
      const result = checkContrast('#707070', '#FFFFFF');
      expect(result.passAA).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });
    
    it('should validate dark theme primary text (#E5E5E5 on #1A1A1A)', () => {
      const result = checkContrast('#E5E5E5', '#1A1A1A');
      expect(result.passAAA).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(7);
    });
    
    it('should validate dark theme secondary text (#999999 on #1A1A1A)', () => {
      const result = checkContrast('#999999', '#1A1A1A');
      expect(result.passAA).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });
    
    it('should validate dark theme tertiary text (#8F8F8F on #1A1A1A)', () => {
      const result = checkContrast('#8F8F8F', '#1A1A1A');
      expect(result.passAA).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});
