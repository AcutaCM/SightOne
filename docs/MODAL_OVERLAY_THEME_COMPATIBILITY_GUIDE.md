# Modal Overlay Z-Index Fix - Theme Compatibility Testing Guide

## Overview

This guide provides step-by-step instructions for manually testing the modal overlay z-index fix across different themes.

**Related Requirements:**
- Requirement 3.1: Light theme compatibility
- Requirement 3.2: Dark theme compatibility  
- Requirement 3.3: Overlay transparency
- Requirement 3.4: Theme switching with modal open

**Task:** Task 5 - 主题兼容性测试

---

## Test Environment Setup

### Prerequisites
1. Application running in development mode
2. Access to theme switcher in the UI
3. Browser DevTools open (F12) for inspection

### Test Data
- Create mode: Empty form
- Edit mode: Existing assistant with sample data

---

## Task 5.1: 浅色主题测试 (Light Theme Testing)

### Test Case 1: Open Assistant Settings Dialog

**Steps:**
1. Ensure light theme is active (check `<html>` element doesn't have `dark` class)
2. Navigate to the assistants page
3. Click "创建新助理" button or edit an existing assistant

**Expected Results:**
- ✅ Modal opens with smooth slide-in animation (300ms)
- ✅ Sidebar remains visible and not darkened
- ✅ Modal content displays correctly above sidebar
- ✅ Overlay covers only the main content area

**Visual Verification:**
```
┌─────────────────────────────────────────┐
│  Sidebar (visible)  │  Modal Content    │
│  ┌──────────┐       │  ┌─────────────┐  │
│  │ Nav Item │       │  │ 创建新助理   │  │
│  │ Nav Item │       │  ├─────────────┤  │
│  │ Nav Item │       │  │ Form Fields │  │
│  └──────────┘       │  │             │  │
│  (Not darkened)     │  └─────────────┘  │
└─────────────────────────────────────────┘
```

### Test Case 2: Verify Sidebar Visibility

**Steps:**
1. With modal open in light theme
2. Inspect sidebar element in DevTools
3. Check computed z-index value

**Expected Results:**
- ✅ Sidebar z-index = 1000
- ✅ Sidebar is not covered by overlay
- ✅ Sidebar maintains normal brightness
- ✅ Sidebar navigation items are clickable

**DevTools Inspection:**
```css
/* Sidebar element */
[data-sidebar] {
  z-index: 1000 !important;
  position: relative;
}
```

### Test Case 3: Verify Modal Content Display

**Steps:**
1. With modal open in light theme
2. Inspect modal content in DevTools
3. Check z-index hierarchy

**Expected Results:**
- ✅ Modal content z-index = 1100
- ✅ Modal content displays above sidebar
- ✅ Form fields are interactive
- ✅ Buttons are clickable

**DevTools Inspection:**
```css
/* Modal content */
[data-slot="base"] {
  z-index: 1100 !important;
}
```

### Test Case 4: Verify Overlay Transparency

**Steps:**
1. With modal open in light theme
2. Inspect backdrop element (`.modal-overlay-fix`)
3. Check background color and opacity

**Expected Results:**
- ✅ Overlay z-index = 900
- ✅ Overlay has semi-transparent background
- ✅ Main content area is dimmed
- ✅ Sidebar is not dimmed

**DevTools Inspection:**
```css
/* Modal overlay */
.modal-overlay-fix {
  z-index: 900 !important;
  background-color: rgba(0, 0, 0, 0.5); /* Example */
}
```

---

## Task 5.2: 深色主题测试 (Dark Theme Testing)

### Test Case 1: Switch to Dark Theme

**Steps:**
1. Click theme switcher to activate dark theme
2. Verify `<html>` element has `dark` class
3. Open assistant settings dialog

**Expected Results:**
- ✅ Theme switches smoothly (200ms transition)
- ✅ Modal opens correctly in dark theme
- ✅ Sidebar remains visible
- ✅ All colors adapt to dark theme

### Test Case 2: Verify Sidebar in Dark Theme

**Steps:**
1. With modal open in dark theme
2. Inspect sidebar element
3. Check visibility and z-index

**Expected Results:**
- ✅ Sidebar z-index = 1000 (unchanged)
- ✅ Sidebar not covered by overlay
- ✅ Sidebar uses dark theme colors
- ✅ Sidebar text is readable

**Visual Check:**
- Sidebar background: Dark color
- Sidebar text: Light color
- Sidebar not dimmed by overlay

### Test Case 3: Verify Modal Content in Dark Theme

**Steps:**
1. With modal open in dark theme
2. Check modal content styling
3. Verify form field colors

**Expected Results:**
- ✅ Modal content z-index = 1100 (unchanged)
- ✅ Modal uses dark theme colors
- ✅ Form fields have appropriate dark backgrounds
- ✅ Text is readable with good contrast

**Color Verification:**
- Modal background: Dark
- Input fields: Slightly lighter dark
- Text: Light color
- Borders: Subtle light color

### Test Case 4: Verify Overlay in Dark Theme

**Steps:**
1. With modal open in dark theme
2. Inspect overlay element
3. Check transparency and color

**Expected Results:**
- ✅ Overlay z-index = 900 (unchanged)
- ✅ Overlay has appropriate dark transparency
- ✅ Main content dimmed appropriately
- ✅ Visual effect is pleasant

---

## Task 5.3: 主题切换测试 (Theme Switching Testing)

### Test Case 1: Switch Theme with Modal Open (Light → Dark)

**Steps:**
1. Start in light theme
2. Open assistant settings dialog
3. While modal is open, switch to dark theme
4. Observe the transition

**Expected Results:**
- ✅ Theme switches smoothly (200ms)
- ✅ Modal remains open and functional
- ✅ Z-index values remain correct
- ✅ No visual glitches or flashing
- ✅ Animations are smooth

**Verification Points:**
- Modal doesn't close
- Sidebar stays visible
- Form data is preserved
- No layout shifts

### Test Case 2: Switch Theme with Modal Open (Dark → Light)

**Steps:**
1. Start in dark theme
2. Open assistant settings dialog
3. While modal is open, switch to light theme
4. Observe the transition

**Expected Results:**
- ✅ Theme switches smoothly (200ms)
- ✅ Modal remains open and functional
- ✅ Z-index values remain correct
- ✅ No visual glitches or flashing
- ✅ Animations are smooth

### Test Case 3: Rapid Theme Switching

**Steps:**
1. Open assistant settings dialog
2. Rapidly switch between light and dark themes (5-10 times)
3. Check for any issues

**Expected Results:**
- ✅ No performance degradation
- ✅ No memory leaks
- ✅ Z-index remains stable
- ✅ Modal remains functional
- ✅ No console errors

### Test Case 4: Animation Smoothness

**Steps:**
1. Open modal in light theme
2. Switch to dark theme
3. Observe all animated elements

**Expected Results:**
- ✅ Background color transitions smoothly
- ✅ Text color transitions smoothly
- ✅ Border colors transition smoothly
- ✅ No jarring color changes
- ✅ Transition duration: 200ms

**DevTools Check:**
```css
/* Verify transition properties */
:root, .dark {
  transition: 
    background-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
    color 200ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Nested Modal Testing

### Test Case 1: Draft Recovery Modal

**Steps:**
1. Create a draft (start creating assistant, enter data, close without saving)
2. Reopen create assistant dialog
3. Draft recovery modal should appear

**Expected Results:**
- ✅ Draft recovery modal z-index = 1200
- ✅ Draft modal appears above main modal
- ✅ Both modals visible and functional
- ✅ Sidebar still visible

### Test Case 2: Unsaved Changes Warning

**Steps:**
1. Open assistant settings dialog
2. Make changes to form
3. Try to close without saving

**Expected Results:**
- ✅ Warning modal z-index = 1200
- ✅ Warning modal appears above main modal
- ✅ All three layers visible (sidebar, main modal, warning)
- ✅ Proper visual hierarchy

---

## Browser Compatibility Testing

### Test in Multiple Browsers

**Browsers to Test:**
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

**For Each Browser:**
1. Test light theme
2. Test dark theme
3. Test theme switching
4. Verify z-index values
5. Check for visual issues

---

## Responsive Design Testing

### Desktop (1920x1080)

**Steps:**
1. Set viewport to 1920x1080
2. Test all theme scenarios
3. Verify layout and z-index

**Expected Results:**
- ✅ Modal width: 480px
- ✅ Sidebar visible
- ✅ Z-index correct

### Tablet (768x1024)

**Steps:**
1. Set viewport to 768x1024
2. Test all theme scenarios
3. Verify responsive behavior

**Expected Results:**
- ✅ Modal width: 70%
- ✅ Sidebar may be hidden (responsive design)
- ✅ Z-index correct

### Mobile (375x667)

**Steps:**
1. Set viewport to 375x667
2. Test all theme scenarios
3. Verify mobile layout

**Expected Results:**
- ✅ Modal width: 100%
- ✅ Full-screen modal
- ✅ Z-index correct

---

## Performance Testing

### Test Case 1: Modal Open/Close Performance

**Steps:**
1. Open DevTools Performance tab
2. Record performance
3. Open and close modal 10 times
4. Analyze results

**Expected Results:**
- ✅ No memory leaks
- ✅ Smooth 60fps animations
- ✅ No layout thrashing
- ✅ Fast render times

### Test Case 2: Theme Switch Performance

**Steps:**
1. Open modal
2. Record performance
3. Switch themes 10 times
4. Analyze results

**Expected Results:**
- ✅ Transition completes in 200ms
- ✅ No dropped frames
- ✅ Smooth color transitions
- ✅ No performance issues

---

## Accessibility Testing

### Keyboard Navigation

**Steps:**
1. Open modal using keyboard (Tab + Enter)
2. Navigate through form fields
3. Close modal using Esc key

**Expected Results:**
- ✅ Focus management correct
- ✅ Tab order logical
- ✅ Esc key closes modal
- ✅ Focus returns to trigger element

### Screen Reader Testing

**Steps:**
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Open modal
3. Navigate through content

**Expected Results:**
- ✅ Modal announced correctly
- ✅ Form fields labeled properly
- ✅ ARIA attributes correct
- ✅ Focus trap works

---

## Common Issues and Solutions

### Issue 1: Sidebar Still Covered

**Symptoms:**
- Sidebar appears darkened
- Sidebar z-index seems wrong

**Solution:**
1. Check if `.modal-overlay-fix` class is applied
2. Verify global CSS is loaded
3. Check for conflicting styles
4. Inspect computed z-index values

### Issue 2: Modal Content Below Sidebar

**Symptoms:**
- Modal content appears behind sidebar
- Can't interact with modal

**Solution:**
1. Check modal content z-index (should be 1100)
2. Verify `style` prop on Modal component
3. Check for CSS specificity issues

### Issue 3: Theme Switch Causes Flashing

**Symptoms:**
- Colors flash during theme switch
- Jarring visual transition

**Solution:**
1. Verify transition properties in CSS
2. Check transition duration (should be 200ms)
3. Ensure all elements have transitions

### Issue 4: Nested Modals Not Visible

**Symptoms:**
- Draft recovery or warning modal not visible
- Nested modal behind main modal

**Solution:**
1. Check nested modal z-index (should be 1200)
2. Verify `style` prop on nested modals
3. Check modal rendering order

---

## Test Results Template

### Test Session Information
- **Date:** _______________
- **Tester:** _______________
- **Browser:** _______________
- **OS:** _______________

### Task 5.1: Light Theme
- [ ] Modal opens correctly
- [ ] Sidebar not covered
- [ ] Modal content displays correctly
- [ ] Overlay transparency appropriate

### Task 5.2: Dark Theme
- [ ] Modal opens correctly
- [ ] Sidebar not covered
- [ ] Modal content displays correctly
- [ ] Overlay transparency appropriate

### Task 5.3: Theme Switching
- [ ] Light → Dark smooth
- [ ] Dark → Light smooth
- [ ] Z-index maintained
- [ ] Animations smooth

### Additional Notes
```
[Add any observations, issues, or comments here]
```

---

## Automated Test Execution

### Run Tests

```bash
# Run theme compatibility tests
npm test -- __tests__/modal-overlay/theme-compatibility.test.tsx

# Run with coverage
npm test -- --coverage __tests__/modal-overlay/theme-compatibility.test.tsx

# Run in watch mode
npm test -- --watch __tests__/modal-overlay/theme-compatibility.test.tsx
```

### Expected Test Results

All tests should pass:
- ✅ Light theme tests (4 test cases)
- ✅ Dark theme tests (4 test cases)
- ✅ Theme switching tests (4 test cases)
- ✅ Nested modal tests (1 test case)
- ✅ Z-index validation tests (2 test cases)
- ✅ CSS class application tests (2 test cases)

**Total:** 17 test cases should pass

---

## Conclusion

This comprehensive testing guide ensures that the modal overlay z-index fix works correctly across all themes and scenarios. Follow each test case carefully and document any issues found.

**Success Criteria:**
- All automated tests pass
- All manual tests pass
- No visual regressions
- Smooth theme transitions
- Correct z-index hierarchy maintained
- Sidebar always visible
- Modal content always accessible

**Requirements Verified:**
- ✅ Requirement 3.1: Light theme compatibility
- ✅ Requirement 3.2: Dark theme compatibility
- ✅ Requirement 3.3: Overlay transparency
- ✅ Requirement 3.4: Theme switching
