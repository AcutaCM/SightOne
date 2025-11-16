# Assistant Activation Accessibility - Visual Guide

## Overview

This visual guide demonstrates the accessibility features of the Assistant Activation component with screenshots and examples.

## 1. Focus Indicators

### Button Focus State

When a user tabs to the activation button, a clear focus indicator appears:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ╔═══════════════════════════════════════════╗ │
│  ║  ┌─────────────────────────────────────┐  ║ │
│  ║  │  💬 使用该助手进行聊天              │  ║ │
│  ║  └─────────────────────────────────────┘  ║ │
│  ╚═══════════════════════════════════════════╝ │
│     ↑ 3px blue outline with 3px offset         │
│     ↑ Subtle shadow for depth                  │
└─────────────────────────────────────────────────┘
```

**CSS Implementation:**
```css
.activation-button:focus-visible {
  outline: 3px solid hsl(var(--heroui-primary));
  outline-offset: 3px;
  box-shadow: 0 0 0 4px hsl(var(--heroui-primary) / 0.2);
}
```

### Added State Focus

When the assistant is already added:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ╔═══════════════════════════════════════════╗ │
│  ║  ┌─────────────────────────────────────┐  ║ │
│  ║  │  ✓ 已添加                           │  ║ │
│  ║  └─────────────────────────────────────┘  ║ │
│  ╚═══════════════════════════════════════════╝ │
│     ↑ 3px green outline (success color)        │
└─────────────────────────────────────────────────┘
```

## 2. Keyboard Navigation Flow

### Tab Order Visualization

```
Step 1: Initial State
┌─────────────────────────────────────┐
│  Assistant Market                   │
│                                     │
│  [1] 💬 使用该助手进行聊天 ← Focus  │
│                                     │
└─────────────────────────────────────┘

Step 2: After Activation (Modal Opens)
┌─────────────────────────────────────┐
│  ╔═══════════════════════════════╗  │
│  ║  助手已添加成功！             ║  │
│  ║                               ║  │
│  ║  [1] ✕ Close ← Focus          ║  │
│  ║  [2] 立即开始聊天             ║  │
│  ║  [3] 继续浏览                 ║  │
│  ╚═══════════════════════════════╝  │
└─────────────────────────────────────┘

Step 3: Tab Navigation
┌─────────────────────────────────────┐
│  ╔═══════════════════════════════╗  │
│  ║  助手已添加成功！             ║  │
│  ║                               ║  │
│  ║  [1] ✕ Close                  ║  │
│  ║  [2] 立即开始聊天 ← Focus     ║  │
│  ║  [3] 继续浏览                 ║  │
│  ╚═══════════════════════════════╝  │
└─────────────────────────────────────┘

Step 4: Continue Tabbing
┌─────────────────────────────────────┐
│  ╔═══════════════════════════════╗  │
│  ║  助手已添加成功！             ║  │
│  ║                               ║  │
│  ║  [1] ✕ Close                  ║  │
│  ║  [2] 立即开始聊天             ║  │
│  ║  [3] 继续浏览 ← Focus         ║  │
│  ╚═══════════════════════════════╝  │
└─────────────────────────────────────┘

Step 5: Tab Again (Wraps to Close)
┌─────────────────────────────────────┐
│  ╔═══════════════════════════════╗  │
│  ║  助手已添加成功！             ║  │
│  ║                               ║  │
│  ║  [1] ✕ Close ← Focus          ║  │
│  ║  [2] 立即开始聊天             ║  │
│  ║  [3] 继续浏览                 ║  │
│  ╚═══════════════════════════════╝  │
└─────────────────────────────────────┘
```

### Keyboard Shortcuts

```
┌──────────────────────────────────────────────┐
│  Keyboard Shortcuts                          │
├──────────────────────────────────────────────┤
│                                              │
│  Tab          → Move focus forward           │
│  Shift + Tab  → Move focus backward          │
│  Enter        → Activate focused element     │
│  Space        → Activate focused element     │
│  Escape       → Close modal dialog           │
│                                              │
└──────────────────────────────────────────────┘
```

## 3. Screen Reader Announcements

### Announcement Timeline

```
User Action: Click "使用该助手进行聊天"
┌─────────────────────────────────────────────┐
│  🔊 Screen Reader Announces:                │
│  "正在添加助手到列表"                       │
└─────────────────────────────────────────────┘
         ↓
         ↓ (Processing...)
         ↓
┌─────────────────────────────────────────────┐
│  🔊 Screen Reader Announces:                │
│  "助手已成功添加到列表，请选择下一步操作"   │
└─────────────────────────────────────────────┘
         ↓
         ↓ (Modal Opens)
         ↓
┌─────────────────────────────────────────────┐
│  🔊 Screen Reader Announces:                │
│  "对话框"                                   │
│  "助手已添加成功！"                         │
│  "您现在可以在左侧助手列表中找到它"         │
└─────────────────────────────────────────────┘
```

### Live Region Implementation

```tsx
// Hidden from view but accessible to screen readers
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  style={{
    position: 'absolute',
    left: '-10000px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  }}
>
  {announcement}
</div>
```

## 4. ARIA Attributes Visualization

### Button States

#### Not Added State
```tsx
<Button
  aria-label="点击将助手添加到列表并开始聊天"
  aria-busy="false"
  aria-pressed="false"
  role="button"
  tabIndex={0}
>
  💬 使用该助手进行聊天
</Button>
```

**Screen Reader Reads:**
> "按钮，点击将助手添加到列表并开始聊天，未按下"

#### Adding State
```tsx
<Button
  aria-label="正在添加助手到列表"
  aria-busy="true"
  aria-pressed="false"
  role="button"
  disabled
>
  ⏳ 添加中...
</Button>
```

**Screen Reader Reads:**
> "按钮，正在添加助手到列表，忙碌中，已禁用"

#### Added State
```tsx
<Button
  aria-label="助手已添加，点击查看选项"
  aria-busy="false"
  aria-pressed="true"
  role="button"
  tabIndex={0}
>
  ✓ 已添加
</Button>
```

**Screen Reader Reads:**
> "按钮，助手已添加，点击查看选项，已按下"

### Modal Dialog Structure

```tsx
<Modal
  modalRender={(modal) => (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="activation-success-title"
      aria-describedby="activation-success-description"
    >
      {modal}
    </div>
  )}
>
  <h3 id="activation-success-title">
    助手已添加成功！
  </h3>
  <p id="activation-success-description">
    您现在可以在左侧助手列表中找到它
  </p>
  <Button aria-label="立即开始与助手聊天">
    立即开始聊天
  </Button>
  <Button aria-label="继续浏览助手市场">
    继续浏览
  </Button>
</Modal>
```

**Screen Reader Navigation:**
1. "对话框，助手已添加成功！"
2. "您现在可以在左侧助手列表中找到它"
3. "按钮，立即开始与助手聊天"
4. "按钮，继续浏览助手市场"

## 5. High Contrast Mode

### Normal Mode vs High Contrast Mode

```
Normal Mode:
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │  💬 使用该助手进行聊天      │   │
│  └─────────────────────────────┘   │
│  ↑ 2px border, subtle shadow        │
└─────────────────────────────────────┘

High Contrast Mode:
┌─────────────────────────────────────┐
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃  💬 使用该助手进行聊天      ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
│  ↑ 3px border, no shadow            │
└─────────────────────────────────────┘

Focus in High Contrast Mode:
┌─────────────────────────────────────┐
│  ╔═══════════════════════════════╗  │
│  ║ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ║  │
│  ║ ┃  💬 使用该助手进行聊天   ┃ ║  │
│  ║ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ║  │
│  ╚═══════════════════════════════╝  │
│  ↑ 4px outline with 4px offset      │
└─────────────────────────────────────┘
```

## 6. Reduced Motion Mode

### Normal Animation
```
Frame 1:  ┌────┐
          │    │  ← Starts small
          └────┘

Frame 2:  ┌──────┐
          │      │  ← Grows
          └──────┘

Frame 3:  ┌────────┐
          │        │  ← Continues growing
          └────────┘

Frame 4:  ┌──────────┐
          │          │  ← Full size with glow
          └──────────┘
```

### Reduced Motion (prefers-reduced-motion: reduce)
```
Frame 1:  ┌──────────┐
          │          │  ← Appears instantly
          └──────────┘
          
No animation, no transitions
```

## 7. Testing Scenarios

### Scenario 1: Keyboard-Only User

```
User Flow:
1. Tab to button
   ✓ Focus indicator visible
   
2. Press Enter
   ✓ Button activates
   ✓ Modal opens
   ✓ Focus moves to modal
   
3. Tab through modal options
   ✓ Focus moves logically
   ✓ Focus trapped in modal
   
4. Press Escape
   ✓ Modal closes
   ✓ Focus returns to button
```

### Scenario 2: Screen Reader User

```
User Flow:
1. Navigate to button
   🔊 "按钮，点击将助手添加到列表并开始聊天"
   
2. Activate button
   🔊 "正在添加助手到列表"
   🔊 "助手已成功添加到列表，请选择下一步操作"
   
3. Navigate modal
   🔊 "对话框，助手已添加成功！"
   🔊 "您现在可以在左侧助手列表中找到它"
   
4. Navigate to button
   🔊 "按钮，立即开始与助手聊天"
```

### Scenario 3: High Contrast Mode User

```
Visual Indicators:
✓ Borders are thicker (3px)
✓ Focus outlines are thicker (4px)
✓ No subtle shadows
✓ High contrast colors only
✓ Clear visual separation
```

## 8. Common Accessibility Patterns

### Pattern 1: Button with Dynamic Label

```tsx
const getAriaLabel = () => {
  if (isAdding) return '正在添加助手到列表';
  if (isAdded) return '助手已添加，点击查看选项';
  return '点击将助手添加到列表并开始聊天';
};

<Button aria-label={getAriaLabel()}>
  {getButtonText()}
</Button>
```

### Pattern 2: Live Region for Status Updates

```tsx
const [announcement, setAnnouncement] = useState('');

// Update announcement on state change
useEffect(() => {
  if (isAdding) {
    setAnnouncement('正在添加助手到列表');
  } else if (isAdded) {
    setAnnouncement('助手已成功添加到列表');
  }
}, [isAdding, isAdded]);

<div role="status" aria-live="polite" aria-atomic="true">
  {announcement}
</div>
```

### Pattern 3: Modal with Proper ARIA

```tsx
<Modal
  modalRender={(modal) => (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      {modal}
    </div>
  )}
>
  <h3 id="dialog-title">Title</h3>
  <p id="dialog-description">Description</p>
</Modal>
```

## 9. Browser Compatibility

### Focus Indicators

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | `:focus-visible` supported |
| Firefox | ✅ Full | `:focus-visible` supported |
| Safari | ✅ Full | `:focus-visible` supported |
| Edge | ✅ Full | `:focus-visible` supported |

### ARIA Attributes

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | All ARIA attributes supported |
| Firefox | ✅ Full | All ARIA attributes supported |
| Safari | ✅ Full | All ARIA attributes supported |
| Edge | ✅ Full | All ARIA attributes supported |

### Screen Readers

| Screen Reader | Platform | Support |
|---------------|----------|---------|
| NVDA | Windows | ✅ Full |
| JAWS | Windows | ✅ Full |
| VoiceOver | macOS/iOS | ✅ Full |
| TalkBack | Android | ✅ Full |
| Narrator | Windows | ✅ Full |

## 10. Troubleshooting Guide

### Issue: Focus not visible

**Symptoms:**
- No outline when tabbing to button
- Can't see which element is focused

**Solution:**
```css
/* Ensure :focus-visible is used, not :focus */
.button:focus-visible {
  outline: 3px solid blue;
  outline-offset: 3px;
}

/* Check for conflicting styles */
.button:focus {
  outline: none; /* ❌ Remove this */
}
```

### Issue: Screen reader not announcing

**Symptoms:**
- No announcement when button is clicked
- Status changes are silent

**Solution:**
```tsx
// Ensure live region exists
<div role="status" aria-live="polite" aria-atomic="true">
  {announcement}
</div>

// Update announcement state
setAnnouncement('New status message');
```

### Issue: Keyboard trap in modal

**Symptoms:**
- Can't tab out of modal
- Escape key doesn't work

**Solution:**
```tsx
<Modal
  keyboard={true}  // Enable Escape key
  focusTriggerAfterClose={true}  // Return focus
>
  {/* Modal content */}
</Modal>
```

## Resources

- [Full Accessibility Documentation](./ASSISTANT_ACTIVATION_ACCESSIBILITY.md)
- [Quick Reference Guide](./ASSISTANT_ACTIVATION_ACCESSIBILITY_QUICK_REFERENCE.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: 2024-01-10  
**Version**: 1.0.0
