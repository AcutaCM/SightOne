# Assistant Settings Sidebar Overlay Removal

## Quick Summary

Remove the darkened backdrop/overlay from the AssistantSettingsSidebar component to allow users to see the full interface while editing assistant settings.

## Problem

The `AssistantSettingsSidebar` component currently displays a darkened overlay (backdrop) that covers the background content when the sidebar is open. This reduces visibility and creates an unnecessary visual barrier.

## Solution

Add `hideBackdrop={true}` prop to all three Modal instances in the `AssistantSettingsSidebar` component.

## Implementation

### File to Modify
`drone-analyzer-nextjs/components/AssistantSettingsSidebar.tsx`

### Changes Required

#### 1. Main Sidebar Modal (Line ~552)

**Before:**
```typescript
<Modal
  isOpen={visible && !showDraftRecovery && !showUnsavedWarning}
  onClose={handleClose}
  size="full"
  scrollBehavior="inside"
  placement="center"
  classNames={{
    base: `${responsiveStyles.sidebarContainer} ${responsiveStyles.responsiveModal} ${styles.gpuAccelerated}`,
    wrapper: `items-center sm:items-center ${styles.overlayEnter}`,
    body: `${responsiveStyles.sidebarContent} ${responsiveStyles.mobileScroll}`,
    backdrop: 'modal-overlay-fix',
  }}
  // ... other props
>
```

**After:**
```typescript
<Modal
  isOpen={visible && !showDraftRecovery && !showUnsavedWarning}
  onClose={handleClose}
  size="full"
  scrollBehavior="inside"
  placement="center"
  hideBackdrop={true}  // ✅ ADD THIS LINE
  classNames={{
    base: `${responsiveStyles.sidebarContainer} ${responsiveStyles.responsiveModal} ${styles.gpuAccelerated}`,
    wrapper: `items-center sm:items-center ${styles.overlayEnter}`,
    body: `${responsiveStyles.sidebarContent} ${responsiveStyles.mobileScroll}`,
    backdrop: 'modal-overlay-fix',
  }}
  // ... other props
>
```

#### 2. Draft Recovery Modal (Line ~693)

**Before:**
```typescript
<Modal
  isOpen={showDraftRecovery}
  onClose={() => setShowDraftRecovery(false)}
  size="md"
  classNames={{
    base: styles.gpuAccelerated,
    wrapper: styles.overlayEnter,
    backdrop: 'modal-overlay-fix',
  }}
  // ... other props
>
```

**After:**
```typescript
<Modal
  isOpen={showDraftRecovery}
  onClose={() => setShowDraftRecovery(false)}
  size="md"
  hideBackdrop={true}  // ✅ ADD THIS LINE
  classNames={{
    base: styles.gpuAccelerated,
    wrapper: styles.overlayEnter,
    backdrop: 'modal-overlay-fix',
  }}
  // ... other props
>
```

#### 3. Unsaved Changes Warning Modal (Line ~771)

**Before:**
```typescript
<Modal
  isOpen={showUnsavedWarning}
  onClose={() => setShowUnsavedWarning(false)}
  size="md"
  classNames={{
    base: styles.gpuAccelerated,
    wrapper: styles.overlayEnter,
    backdrop: 'modal-overlay-fix',
  }}
  // ... other props
>
```

**After:**
```typescript
<Modal
  isOpen={showUnsavedWarning}
  onClose={() => setShowUnsavedWarning(false)}
  size="md"
  hideBackdrop={true}  // ✅ ADD THIS LINE
  classNames={{
    base: styles.gpuAccelerated,
    wrapper: styles.overlayEnter,
    backdrop: 'modal-overlay-fix',
  }}
  // ... other props
>
```

## Testing Checklist

- [ ] Open assistant settings sidebar
- [ ] Verify no darkened backdrop appears
- [ ] Verify background content is fully visible at normal opacity
- [ ] Verify sidebar is still visually distinct (has its own shadow/border)
- [ ] Test close-on-outside-click behavior (should still work)
- [ ] Test draft recovery modal (create unsaved draft, close, reopen)
- [ ] Test unsaved changes warning modal (edit assistant, try to close)
- [ ] Test in both light and dark themes
- [ ] Test on desktop, tablet, and mobile screen sizes

## Expected Behavior

### Before Fix
- Sidebar opens with darkened overlay covering background
- Background content is dimmed and less visible
- Clear visual separation between sidebar and background

### After Fix
- Sidebar opens without any backdrop overlay
- Background content remains fully visible at normal opacity
- Sidebar is still visually distinct through its own styling (shadow, border, background color)
- All functionality remains the same (close on outside click, animations, etc.)

## Why This Works

The `hideBackdrop` prop is a built-in HeroUI Modal feature that:
- Completely removes the backdrop element from the DOM
- Improves performance (no backdrop rendering)
- Maintains all other Modal functionality
- Keeps close-on-outside-click behavior (unless `isDismissable={false}` is set)

## Alternative Approaches (Not Recommended)

### Option 2: Set Backdrop Opacity to 0
```typescript
classNames={{
  backdrop: 'modal-overlay-fix opacity-0',
}}
```
**Why not recommended:** Still renders the backdrop element in the DOM, just invisible. Less performant than `hideBackdrop={true}`.

### Option 3: Custom CSS Override
```css
.modal-overlay-fix {
  opacity: 0 !important;
  pointer-events: none !important;
}
```
**Why not recommended:** Requires additional CSS file changes, harder to maintain, may conflict with other styles.

## Related Documentation

- Spec: `.kiro/specs/sidebar-interaction-fix/`
- Requirements: `.kiro/specs/sidebar-interaction-fix/requirements.md` (Requirement 7)
- Design: `.kiro/specs/sidebar-interaction-fix/design.md` (Assistant Settings Sidebar Overlay Removal section)
- Tasks: `.kiro/specs/sidebar-interaction-fix/tasks.md` (Task 10)

## Estimated Time

- Implementation: 5 minutes (3 simple prop additions)
- Testing: 10 minutes (verify all three modals and behaviors)
- Total: 15 minutes

## Status

- [ ] Implementation started
- [ ] Main sidebar modal updated
- [ ] Draft recovery modal updated
- [ ] Unsaved changes warning modal updated
- [ ] Testing completed
- [ ] Documentation updated
- [ ] Ready for review
