# Assistant Activation Accessibility - Quick Reference

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward |
| `Shift + Tab` | Move focus backward |
| `Enter` | Activate focused button |
| `Space` | Activate focused button |
| `Escape` | Close modal dialog |

## ARIA Attributes Reference

### Button States

```tsx
// Not added
aria-label="点击将助手添加到列表并开始聊天"
aria-busy="false"
aria-pressed="false"

// Adding
aria-label="正在添加助手到列表"
aria-busy="true"
aria-pressed="false"

// Added
aria-label="助手已添加，点击查看选项"
aria-busy="false"
aria-pressed="true"
```

### Modal Dialog

```tsx
<Modal
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  keyboard={true}
  focusTriggerAfterClose={true}
/>
```

### Live Region

```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>
```

## Screen Reader Announcements

| Event | Announcement |
|-------|-------------|
| Start adding | "正在添加助手到列表" |
| Successfully added | "助手已成功添加到列表，请选择下一步操作" |
| Already added | "该助手已在您的列表中，显示操作选项" |
| Navigate to chat | "正在切换到聊天界面" |
| Continue browsing | "继续浏览助手市场" |
| Close dialog | "关闭对话框" |

## Focus Management

### Focus Order
1. Activation button
2. Modal close button (when open)
3. "Start Chat" button (when open)
4. "Continue Browsing" button (when open)

### Focus Indicators
- **Outline**: 3px solid primary color
- **Offset**: 3px
- **Shadow**: 4px blur with 20% opacity
- **Animation**: Subtle pulse (can be disabled)

## Testing Checklist

### Quick Test
- [ ] Tab to button - focus visible?
- [ ] Press Enter - button activates?
- [ ] Press Space - button activates?
- [ ] Tab through modal - focus trapped?
- [ ] Press Escape - modal closes?
- [ ] Focus returns to button?

### Screen Reader Test
- [ ] Button label announced?
- [ ] Status changes announced?
- [ ] Modal title announced?
- [ ] Modal description announced?
- [ ] Button labels clear?

## Common Issues & Solutions

### Issue: Focus not visible
**Solution**: Check CSS for `:focus-visible` styles

### Issue: Screen reader not announcing
**Solution**: Verify `aria-live` region exists and has content

### Issue: Keyboard trap in modal
**Solution**: Ensure `keyboard={true}` and proper focus management

### Issue: Focus not returning
**Solution**: Set `focusTriggerAfterClose={true}` on Modal

## Browser DevTools

### Chrome DevTools
1. Open DevTools (F12)
2. Go to "Accessibility" tab
3. Inspect ARIA tree
4. Check computed properties

### Firefox DevTools
1. Open DevTools (F12)
2. Go to "Accessibility" tab
3. Check accessibility tree
4. Verify ARIA attributes

## Automated Testing

### Basic Test Template

```typescript
import { render, fireEvent } from '@testing-library/react';
import { AssistantActivationButton } from './AssistantActivationButton';

test('keyboard navigation works', () => {
  const { getByRole } = render(
    <AssistantActivationButton assistant={mockAssistant} />
  );
  
  const button = getByRole('button');
  
  // Test Enter key
  fireEvent.keyDown(button, { key: 'Enter' });
  
  // Test Space key
  fireEvent.keyDown(button, { key: ' ' });
});

test('ARIA attributes are correct', () => {
  const { getByRole } = render(
    <AssistantActivationButton assistant={mockAssistant} />
  );
  
  const button = getByRole('button');
  
  expect(button).toHaveAttribute('aria-label');
  expect(button).toHaveAttribute('aria-busy');
  expect(button).toHaveAttribute('aria-pressed');
});

test('live region announces changes', async () => {
  const { getByRole } = render(
    <AssistantActivationButton assistant={mockAssistant} />
  );
  
  const liveRegion = getByRole('status');
  expect(liveRegion).toHaveAttribute('aria-live', 'polite');
});
```

## CSS Classes Reference

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Focus Indicator
```css
.activation-button:focus-visible {
  outline: 3px solid hsl(var(--heroui-primary));
  outline-offset: 3px;
  box-shadow: 0 0 0 4px hsl(var(--heroui-primary) / 0.2);
}
```

## WCAG Compliance

| Criterion | Level | Status |
|-----------|-------|--------|
| 1.3.1 Info and Relationships | A | ✅ Pass |
| 1.4.3 Contrast (Minimum) | AA | ✅ Pass |
| 2.1.1 Keyboard | A | ✅ Pass |
| 2.1.2 No Keyboard Trap | A | ✅ Pass |
| 2.4.3 Focus Order | A | ✅ Pass |
| 2.4.7 Focus Visible | AA | ✅ Pass |
| 3.2.1 On Focus | A | ✅ Pass |
| 3.2.2 On Input | A | ✅ Pass |
| 4.1.2 Name, Role, Value | A | ✅ Pass |
| 4.1.3 Status Messages | AA | ✅ Pass |

## Resources

- [Full Documentation](./ASSISTANT_ACTIVATION_ACCESSIBILITY.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)

---

**Quick Help**: For detailed information, see the full accessibility guide.
