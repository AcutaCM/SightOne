# Input Disabled and Error States - Visual Verification Guide

## Quick Visual Test

To verify the disabled and error states are working correctly, follow these steps:

### 1. Test Disabled Inputs

Open your browser's developer console and run:

```javascript
// Create a test container
const container = document.createElement('div');
container.style.cssText = 'padding: 20px; background: black;';
document.body.appendChild(container);

// Add dark mode class
document.body.classList.add('dark');

// Test disabled text input
const disabledInput = document.createElement('input');
disabledInput.type = 'text';
disabledInput.disabled = true;
disabledInput.placeholder = 'Disabled input';
disabledInput.style.cssText = 'margin: 10px; padding: 10px; width: 300px;';
container.appendChild(disabledInput);

// Test disabled textarea
const disabledTextarea = document.createElement('textarea');
disabledTextarea.disabled = true;
disabledTextarea.placeholder = 'Disabled textarea';
disabledTextarea.style.cssText = 'margin: 10px; padding: 10px; width: 300px;';
container.appendChild(disabledTextarea);

// Check computed styles
console.log('Disabled Input Background:', getComputedStyle(disabledInput).backgroundColor);
console.log('Disabled Input Border:', getComputedStyle(disabledInput).borderColor);
console.log('Disabled Input Text:', getComputedStyle(disabledInput).color);
console.log('Disabled Input Cursor:', getComputedStyle(disabledInput).cursor);
```

**Expected Results:**
- Background: `rgba(255, 255, 255, 0.03)` - Very subtle white
- Border: `rgba(255, 255, 255, 0.08)` - Subtle white
- Text: `rgba(255, 255, 255, 0.4)` - Dimmed white
- Cursor: `not-allowed`

### 2. Test Error Inputs

```javascript
// Test error input with class
const errorInput = document.createElement('input');
errorInput.type = 'email';
errorInput.classList.add('error');
errorInput.value = 'invalid-email';
errorInput.style.cssText = 'margin: 10px; padding: 10px; width: 300px;';
container.appendChild(errorInput);

// Test error input with aria-invalid
const ariaErrorInput = document.createElement('input');
ariaErrorInput.type = 'text';
ariaErrorInput.setAttribute('aria-invalid', 'true');
ariaErrorInput.value = 'Invalid value';
ariaErrorInput.style.cssText = 'margin: 10px; padding: 10px; width: 300px;';
container.appendChild(ariaErrorInput);

// Check computed styles
console.log('Error Input Border:', getComputedStyle(errorInput).borderColor);
console.log('Error Input Background:', getComputedStyle(errorInput).backgroundColor);
console.log('ARIA Invalid Border:', getComputedStyle(ariaErrorInput).borderColor);
```

**Expected Results:**
- Border: `rgba(255, 255, 255, 0.6)` - Prominent white (60% opacity)
- Background: `rgba(255, 255, 255, 0.08)` - Slightly elevated

### 3. Test Error Focus State

```javascript
// Focus the error input
errorInput.focus();

// Check styles while focused
console.log('Error Input Border (focused):', getComputedStyle(errorInput).borderColor);
console.log('Error Input Background (focused):', getComputedStyle(errorInput).backgroundColor);
```

**Expected Results:**
- Border: `rgba(255, 255, 255, 0.6)` - Error border maintained
- Background: `rgba(255, 255, 255, 0.10)` - Focus state background

## Visual Comparison Chart

### Disabled State Opacity Levels

| Element | Opacity | Visual Appearance |
|---------|---------|-------------------|
| Background | 3% | Almost invisible, very subtle |
| Border | 8% | Subtle outline |
| Text | 40% | Clearly dimmed but readable |

### Error State Opacity Levels

| Element | Opacity | Visual Appearance |
|---------|---------|-------------------|
| Border | 60% | Prominent, clearly visible |
| Background | 8% | Slightly elevated from default |
| Background (focus) | 10% | More elevated when focused |

## Browser DevTools Inspection

### Step 1: Inspect Disabled Input

1. Right-click on a disabled input
2. Select "Inspect Element"
3. Look at the Computed tab
4. Verify these values:
   - `background-color: rgba(255, 255, 255, 0.03)`
   - `border-color: rgba(255, 255, 255, 0.08)`
   - `color: rgba(255, 255, 255, 0.4)`
   - `cursor: not-allowed`

### Step 2: Inspect Error Input

1. Right-click on an error input
2. Select "Inspect Element"
3. Look at the Computed tab
4. Verify these values:
   - `border-color: rgba(255, 255, 255, 0.6)`
   - `background-color: rgba(255, 255, 255, 0.08)`

### Step 3: Test Focus State

1. Click on the error input to focus it
2. Check the Computed tab again
3. Verify:
   - Border color remains `rgba(255, 255, 255, 0.6)`
   - Background changes to `rgba(255, 255, 255, 0.10)`

## Real-World Testing Locations

Test these components in your application:

### Login Page (`/login`)
- Test disabled submit button
- Test email input with validation errors
- Test password input with validation errors

### Register Page (`/register`)
- Test form validation errors
- Test disabled inputs during submission

### Settings Modal
- Test disabled configuration inputs
- Test validation errors in settings

### Workflow Parameter Editors
- Test disabled parameters
- Test parameter validation errors

## Accessibility Verification

### Keyboard Navigation

1. Tab through form inputs
2. Verify disabled inputs are skipped
3. Verify error inputs show focus ring
4. Verify error border is visible on focus

### Screen Reader Testing

1. Use NVDA or JAWS
2. Navigate to disabled input
3. Verify it announces "disabled"
4. Navigate to error input with `aria-invalid="true"`
5. Verify it announces "invalid"

## Common Issues and Solutions

### Issue: Disabled input looks too similar to enabled

**Solution**: The 3% opacity is intentionally subtle. The key differentiator is:
- Cursor changes to `not-allowed`
- Text is dimmed to 40% opacity
- Border is more subtle (8% vs 10%)

### Issue: Error border not visible enough

**Solution**: The 60% opacity provides strong contrast against black background. If needed, you can adjust in `dark-mode-theme.css`:

```css
--border-error: rgba(255, 255, 255, 0.7); /* Increase to 70% */
```

### Issue: Error state lost on focus

**Solution**: This is intentional design. The error border is maintained at 60% opacity even when focused, ensuring the error state is always visible.

## Performance Check

### Transition Smoothness

1. Toggle between normal and error state
2. Verify smooth 250ms transition
3. Check for any flickering or jank

### GPU Acceleration

1. Open Chrome DevTools
2. Go to Performance tab
3. Record while interacting with inputs
4. Verify no excessive repaints

## Screenshot Comparison

### Before (Default State)
- Background: 5% white opacity
- Border: 10% white opacity

### After Disabled
- Background: 3% white opacity (darker)
- Border: 8% white opacity (more subtle)
- Text: 40% white opacity (dimmed)
- Cursor: not-allowed

### After Error
- Background: 8% white opacity (slightly elevated)
- Border: 60% white opacity (prominent)

### After Error + Focus
- Background: 10% white opacity (focus state)
- Border: 60% white opacity (error maintained)

## Automated Visual Testing

If you have visual regression testing set up:

```javascript
// Capture screenshots for comparison
await page.screenshot({ path: 'input-disabled.png' });
await page.screenshot({ path: 'input-error.png' });
await page.screenshot({ path: 'input-error-focus.png' });
```

## Sign-off Checklist

- [ ] Disabled inputs have 3% white background
- [ ] Disabled inputs have 8% white border
- [ ] Disabled inputs have 40% white text
- [ ] Disabled inputs show `not-allowed` cursor
- [ ] Error inputs have 60% white border
- [ ] Error inputs have 8% white background
- [ ] Error border maintained on focus
- [ ] Both `.error` class and `aria-invalid` work
- [ ] Smooth transitions between states
- [ ] All input types supported
- [ ] HeroUI components work correctly
- [ ] Keyboard navigation works
- [ ] Screen reader announces states correctly

---

**Status**: Ready for visual verification  
**Last Updated**: 2025-10-30  
**Related**: Task 7.3 - Input Disabled and Error States
