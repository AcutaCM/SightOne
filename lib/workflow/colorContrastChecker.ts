/**
 * Color Contrast Checker - WCAG Compliance Tool
 * Requirements: 8.4
 * 
 * This utility checks and validates color contrast ratios to ensure
 * accessibility compliance with WCAG 2.1 standards.
 */

/**
 * WCAG 2.1 Contrast Requirements
 * - Level AA: 4.5:1 for normal text, 3:1 for large text
 * - Level AAA: 7:1 for normal text, 4.5:1 for large text
 */
export const WCAG_LEVELS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
} as const;

export interface ColorPair {
  foreground: string;
  background: string;
  name: string;
  usage: string;
}

export interface ContrastResult {
  ratio: number;
  passAA: boolean;
  passAAA: boolean;
  passAALarge: boolean;
  passAAALarge: boolean;
  recommendation?: string;
}

export interface ColorAnalysis extends ContrastResult {
  pair: ColorPair;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

/**
 * Convert RGB to relative luminance
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    console.warn(`Invalid color format: ${color1} or ${color2}`);
    return 0;
  }
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG requirements
 */
export function checkContrast(
  foreground: string,
  background: string
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  
  const passAA = ratio >= WCAG_LEVELS.AA_NORMAL;
  const passAAA = ratio >= WCAG_LEVELS.AAA_NORMAL;
  const passAALarge = ratio >= WCAG_LEVELS.AA_LARGE;
  const passAAALarge = ratio >= WCAG_LEVELS.AAA_LARGE;
  
  let recommendation: string | undefined;
  
  if (!passAA) {
    recommendation = `Contrast ratio ${ratio.toFixed(2)}:1 is below WCAG AA standard (4.5:1). Consider using darker/lighter colors.`;
  } else if (!passAAA) {
    recommendation = `Contrast ratio ${ratio.toFixed(2)}:1 meets AA but not AAA standard (7:1). Consider improving for better accessibility.`;
  }
  
  return {
    ratio,
    passAA,
    passAAA,
    passAALarge,
    passAAALarge,
    recommendation,
  };
}

/**
 * Analyze all color pairs in the theme
 */
export function analyzeThemeContrast(isDark: boolean = false): ColorAnalysis[] {
  const colorPairs: ColorPair[] = isDark ? [
    // Dark Theme Color Pairs
    {
      foreground: '#E5E5E5',
      background: '#1A1A1A',
      name: 'Primary Text on Node Background',
      usage: 'Node titles, main content text',
    },
    {
      foreground: '#999999',
      background: '#1A1A1A',
      name: 'Secondary Text on Node Background',
      usage: 'Parameter labels, secondary information',
    },
    {
      foreground: '#8F8F8F',
      background: '#1A1A1A',
      name: 'Tertiary Text on Node Background',
      usage: 'Descriptions, hints, placeholders',
    },
    {
      foreground: '#E5E5E5',
      background: '#242424',
      name: 'Primary Text on Parameter Background',
      usage: 'Parameter values, input text',
    },
    {
      foreground: '#999999',
      background: '#242424',
      name: 'Secondary Text on Parameter Background',
      usage: 'Parameter labels in cards',
    },
    {
      foreground: '#8F8F8F',
      background: '#242424',
      name: 'Tertiary Text on Parameter Background',
      usage: 'Parameter descriptions',
    },
    {
      foreground: '#E5E5E5',
      background: '#222222',
      name: 'Primary Text on Header Background',
      usage: 'Node header titles',
    },
    {
      foreground: '#EF4444',
      background: '#1A1A1A',
      name: 'Error Text on Node Background',
      usage: 'Error messages, warnings',
    },
    {
      foreground: '#CCCCCC',
      background: '#1A1A1A',
      name: 'Success Text on Node Background',
      usage: 'Success indicators',
    },
  ] : [
    // Light Theme Color Pairs
    {
      foreground: '#1A1A1A',
      background: '#FFFFFF',
      name: 'Primary Text on Node Background',
      usage: 'Node titles, main content text',
    },
    {
      foreground: '#666666',
      background: '#FFFFFF',
      name: 'Secondary Text on Node Background',
      usage: 'Parameter labels, secondary information',
    },
    {
      foreground: '#707070',
      background: '#FFFFFF',
      name: 'Tertiary Text on Node Background',
      usage: 'Descriptions, hints, placeholders',
    },
    {
      foreground: '#1A1A1A',
      background: '#F8F8F8',
      name: 'Primary Text on Parameter Background',
      usage: 'Parameter values, input text',
    },
    {
      foreground: '#666666',
      background: '#F8F8F8',
      name: 'Secondary Text on Parameter Background',
      usage: 'Parameter labels in cards',
    },
    {
      foreground: '#707070',
      background: '#F8F8F8',
      name: 'Tertiary Text on Parameter Background',
      usage: 'Parameter descriptions',
    },
    {
      foreground: '#1A1A1A',
      background: '#FAFAFA',
      name: 'Primary Text on Header Background',
      usage: 'Node header titles',
    },
    {
      foreground: '#DC2626',
      background: '#FFFFFF',
      name: 'Error Text on Node Background',
      usage: 'Error messages, warnings',
    },
    {
      foreground: '#333333',
      background: '#FFFFFF',
      name: 'Success Text on Node Background',
      usage: 'Success indicators',
    },
  ];
  
  return colorPairs.map(pair => ({
    pair,
    ...checkContrast(pair.foreground, pair.background),
  }));
}

/**
 * Generate a contrast report for the current theme
 */
export function generateContrastReport(isDark: boolean = false): string {
  const analysis = analyzeThemeContrast(isDark);
  const theme = isDark ? 'Dark' : 'Light';
  
  let report = `\n${'='.repeat(60)}\n`;
  report += `Color Contrast Analysis Report - ${theme} Theme\n`;
  report += `${'='.repeat(60)}\n\n`;
  
  let passCount = 0;
  let failCount = 0;
  
  analysis.forEach(({ pair, ratio, passAA, passAAA, recommendation }) => {
    const status = passAA ? '✓' : '✗';
    const level = passAAA ? 'AAA' : passAA ? 'AA' : 'FAIL';
    
    if (passAA) passCount++;
    else failCount++;
    
    report += `${status} ${pair.name}\n`;
    report += `  Foreground: ${pair.foreground}\n`;
    report += `  Background: ${pair.background}\n`;
    report += `  Usage: ${pair.usage}\n`;
    report += `  Contrast Ratio: ${ratio.toFixed(2)}:1\n`;
    report += `  WCAG Level: ${level}\n`;
    
    if (recommendation) {
      report += `  ⚠️  ${recommendation}\n`;
    }
    
    report += '\n';
  });
  
  report += `${'='.repeat(60)}\n`;
  report += `Summary: ${passCount} passed, ${failCount} failed\n`;
  report += `${'='.repeat(60)}\n`;
  
  return report;
}

/**
 * Suggest improved colors to meet WCAG standards
 */
export function suggestImprovedColor(
  foreground: string,
  background: string,
  targetRatio: number = WCAG_LEVELS.AA_NORMAL
): string | null {
  const currentRatio = getContrastRatio(foreground, background);
  
  if (currentRatio >= targetRatio) {
    return null; // Already meets requirements
  }
  
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) return null;
  
  // Determine if we should darken or lighten the foreground
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const shouldDarken = bgLum > 0.5;
  
  // Binary search for the right color
  let low = 0;
  let high = 255;
  let bestColor = foreground;
  let bestRatio = currentRatio;
  
  for (let i = 0; i < 20; i++) {
    const mid = Math.floor((low + high) / 2);
    const testColor = shouldDarken
      ? `#${mid.toString(16).padStart(2, '0').repeat(3)}`
      : `#${(255 - mid).toString(16).padStart(2, '0').repeat(3)}`;
    
    const testRatio = getContrastRatio(testColor, background);
    
    if (testRatio >= targetRatio) {
      bestColor = testColor;
      bestRatio = testRatio;
      
      if (shouldDarken) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    } else {
      if (shouldDarken) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  }
  
  return bestRatio >= targetRatio ? bestColor : null;
}

/**
 * Validate all theme colors and log results
 */
export function validateThemeColors(isDark: boolean = false): boolean {
  const analysis = analyzeThemeContrast(isDark);
  const allPass = analysis.every(a => a.passAA);
  
  if (!allPass) {
    console.warn(generateContrastReport(isDark));
  } else {
    console.log(`✓ All colors in ${isDark ? 'dark' : 'light'} theme meet WCAG AA standards`);
  }
  
  return allPass;
}

/**
 * Get real-time contrast info for debugging
 */
export function getContrastInfo(
  foreground: string,
  background: string
): string {
  const result = checkContrast(foreground, background);
  
  return `
Contrast Ratio: ${result.ratio.toFixed(2)}:1
WCAG AA (Normal): ${result.passAA ? '✓ Pass' : '✗ Fail'}
WCAG AAA (Normal): ${result.passAAA ? '✓ Pass' : '✗ Fail'}
WCAG AA (Large): ${result.passAALarge ? '✓ Pass' : '✗ Fail'}
WCAG AAA (Large): ${result.passAAALarge ? '✓ Pass' : '✗ Fail'}
${result.recommendation ? `\n⚠️  ${result.recommendation}` : ''}
  `.trim();
}
