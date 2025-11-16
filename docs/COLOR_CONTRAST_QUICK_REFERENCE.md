# Color Contrast Quick Reference

## Current Theme Colors (WCAG AA Compliant)

### Light Theme

```css
/* Text Colors */
--text-primary: #1A1A1A;    /* 17.40:1 - AAA ✓ */
--text-secondary: #666666;  /* 5.74:1 - AA ✓ */
--text-tertiary: #707070;   /* 4.93:1 - AA ✓ */

/* Status Colors */
--error-color: #DC2626;     /* 4.83:1 - AA ✓ */
--success-color: #333333;   /* 12.63:1 - AAA ✓ */
--warning-color: #666666;   /* 5.74:1 - AA ✓ */
--info-color: #000000;      /* 21:1 - AAA ✓ */

/* Background Colors */
--node-bg: #FFFFFF;
--param-bg: #F8F8F8;
--node-header-bg: #FAFAFA;
```

### Dark Theme

```css
/* Text Colors */
--text-primary: #E5E5E5;    /* 13.82:1 - AAA ✓ */
--text-secondary: #999999;  /* 6.11:1 - AA ✓ */
--text-tertiary: #8F8F8F;   /* 5.20:1 - AA ✓ */

/* Status Colors */
--error-color: #EF4444;     /* 4.62:1 - AA ✓ */
--success-color: #CCCCCC;   /* 10.84:1 - AAA ✓ */
--warning-color: #999999;   /* 6.11:1 - AA ✓ */
--info-color: #FFFFFF;      /* 15.84:1 - AAA ✓ */

/* Background Colors */
--node-bg: #1A1A1A;
--param-bg: #242424;
--node-header-bg: #222222;
```

## Usage Guidelines

### When to Use Each Text Color

| Color | Use Case | Examples |
|-------|----------|----------|
| **Primary** | Main content, titles, important text | Node titles, parameter values, headings |
| **Secondary** | Labels, supporting text | Parameter labels, section headers |
| **Tertiary** | Hints, descriptions, placeholders | Help text, descriptions, optional info |

### Checking Contrast

```typescript
import { getContrastRatio, checkContrast } from '@/lib/workflow/colorContrastChecker';

// Quick check
const ratio = getContrastRatio('#707070', '#FFFFFF');
console.log(ratio); // 4.93

// Detailed check
const result = checkContrast('#707070', '#FFFFFF');
console.log(result.passAA); // true
```

### Minimum Contrast Requirements

| Text Size | WCAG AA | WCAG AAA |
|-----------|---------|----------|
| Normal (< 18px) | 4.5:1 | 7:1 |
| Large (≥ 18px) | 3:1 | 4.5:1 |
| Large Bold (≥ 14px) | 3:1 | 4.5:1 |

## Common Patterns

### Text on White Background (Light Theme)
```css
/* ✅ Good */
color: #1A1A1A; /* Primary - 17.40:1 */
color: #666666; /* Secondary - 5.74:1 */
color: #707070; /* Tertiary - 4.93:1 */

/* ❌ Avoid */
color: #AAAAAA; /* 2.32:1 - Too light */
color: #CCCCCC; /* 1.61:1 - Too light */
```

### Text on Dark Background (Dark Theme)
```css
/* ✅ Good */
color: #E5E5E5; /* Primary - 13.82:1 */
color: #999999; /* Secondary - 6.11:1 */
color: #8F8F8F; /* Tertiary - 5.20:1 */

/* ❌ Avoid */
color: #555555; /* 2.91:1 - Too dark */
color: #333333; /* 1.61:1 - Too dark */
```

## Testing Checklist

- [ ] Run automated tests: `npm test -- __tests__/workflow/color-contrast.test.ts`
- [ ] Check with browser DevTools accessibility panel
- [ ] Test in both light and dark themes
- [ ] Verify with color blindness simulator
- [ ] Test at different screen brightness levels
- [ ] Validate with screen reader

## Quick Commands

```bash
# Run contrast tests
npm test -- __tests__/workflow/color-contrast.test.ts

# Check specific color
node -e "const {getContrastRatio} = require('./lib/workflow/colorContrastChecker'); console.log(getContrastRatio('#707070', '#FFFFFF'));"
```

## Browser DevTools

### Chrome/Edge
1. Open DevTools (F12)
2. Select element
3. Check "Accessibility" panel
4. View "Contrast" section

### Firefox
1. Open DevTools (F12)
2. Select element
3. Check "Accessibility" tab
4. View contrast ratio

## Common Issues & Solutions

### Issue: Text too light
**Solution:** Use darker color from the approved palette

### Issue: Text too dark
**Solution:** Use lighter color from the approved palette

### Issue: Custom color needed
**Solution:** Use `suggestImprovedColor()` to find compliant alternative

```typescript
import { suggestImprovedColor } from '@/lib/workflow/colorContrastChecker';

const improved = suggestImprovedColor('#AAAAAA', '#FFFFFF', 4.5);
console.log(improved); // Returns compliant color
```

## Resources

- Full documentation: `docs/COLOR_CONTRAST_OPTIMIZATION.md`
- Test suite: `__tests__/workflow/color-contrast.test.ts`
- Checker utility: `lib/workflow/colorContrastChecker.ts`
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

---

**Remember:** Always test new colors before using them in production!
