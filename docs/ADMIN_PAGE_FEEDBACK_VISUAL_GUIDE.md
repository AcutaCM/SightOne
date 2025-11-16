# Admin Page Feedback System - Visual Guide

## Toast Notification Examples

### Success Toast (Login)

```
┌─────────────────────────────────────────┐
│ ✓ 登录成功                               │
│                                         │
│ 已登录为 user@example.com（角色：admin） │
│                                         │
│ [Auto-dismisses in 3 seconds]           │
└─────────────────────────────────────────┘
```

**Appearance:**
- Green background with success icon
- Shows email and role
- Appears in top-right corner
- Fades out after 3 seconds

### Error Toast with Retry (Login Failed)

```
┌─────────────────────────────────────────┐
│ ✕ 登录失败                               │
│                                         │
│ 用户不存在                               │
│                                         │
│                            [重试] [✕]   │
└─────────────────────────────────────────┘
```

**Appearance:**
- Red background with error icon
- Shows error description
- Retry button on the right
- Close button (✕)
- Stays until dismissed or retry clicked

### Success Toast (Role Change)

```
┌─────────────────────────────────────────┐
│ ✓ 角色设置成功                           │
│                                         │
│ 已将 user@example.com 设置为 管理员      │
│                                         │
│ [Auto-dismisses in 3 seconds]           │
└─────────────────────────────────────────┘
```

**Appearance:**
- Green background
- Shows email and new role
- Auto-dismisses after 3 seconds

### Error Toast (Role Change Failed)

```
┌─────────────────────────────────────────┐
│ ✕ 设置角色失败                           │
│                                         │
│ 权限不足                                 │
│                                         │
│                            [重试] [✕]   │
└─────────────────────────────────────────┘
```

**Appearance:**
- Red background
- Shows error reason
- Retry button available
- Stays until dismissed

## Confirmation Dialog

### Role Change Confirmation

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  确认要将 user@example.com 的角色从             │
│  普通用户 更改为 管理员 吗？                     │
│                                                 │
│  此操作将立即生效。                             │
│                                                 │
│                                                 │
│                        [取消]      [确定]       │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Behavior:**
- Shows current role → target role
- Warns about immediate effect
- Cancel button prevents change
- OK button proceeds with change

## User Flow Examples

### Scenario 1: Successful Login

1. User enters email: `admin@example.com`
2. User clicks "登录该邮箱" button
3. Button shows loading spinner
4. **Toast appears:** "✓ 登录成功"
5. Toast shows: "已登录为 admin@example.com（角色：admin）"
6. Toast auto-dismisses after 3 seconds
7. Page updates to show admin panel

### Scenario 2: Failed Login with Retry

1. User enters email: `invalid@example.com`
2. User clicks "登录该邮箱" button
3. Button shows loading spinner
4. **Toast appears:** "✕ 登录失败"
5. Toast shows: "用户不存在"
6. Toast shows "重试" button
7. User clicks "重试"
8. Login attempt repeats automatically

### Scenario 3: Role Change with Confirmation

1. Admin clicks "升为管理员" button for user
2. **Confirmation dialog appears**
3. Dialog shows: "确认要将 user@example.com 的角色从 普通用户 更改为 管理员 吗？"
4. Admin clicks "确定"
5. Button shows loading spinner
6. **Toast appears:** "✓ 角色设置成功"
7. Toast shows: "已将 user@example.com 设置为 管理员"
8. User list refreshes automatically
9. Toast auto-dismisses after 3 seconds

### Scenario 4: Bootstrap Admin

1. User enters email in bootstrap section
2. User clicks "引导设为管理员" button
3. Button shows loading spinner
4. **Toast appears:** "✓ 管理员设置成功"
5. Toast shows: "user@example.com 已被设为管理员，请使用该邮箱登录以获取管理员权限"
6. Bootstrap section disappears
7. User can now login with admin privileges

## Toast Positioning

```
┌─────────────────────────────────────────────────┐
│                                    [Toast 1]    │
│                                    [Toast 2]    │
│                                    [Toast 3]    │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Position:** Top-right corner
**Stacking:** New toasts appear below existing ones
**Max visible:** Sonner handles queue automatically

## Dark Mode Appearance

### Light Mode
- Success: Light green background, dark green text
- Error: Light red background, dark red text
- Border: Subtle colored border

### Dark Mode
- Success: Dark green background, light green text
- Error: Dark red background, light red text
- Border: Brighter colored border for visibility

## Mobile Responsive

### Mobile View (< 640px)

```
┌─────────────────────┐
│  ✓ 登录成功          │
│                     │
│  已登录为           │
│  user@example.com   │
│  （角色：admin）     │
│                     │
│  [3s]               │
└─────────────────────┘
```

**Adjustments:**
- Slightly narrower width
- Text wraps if needed
- Still in top-right
- Touch-friendly close button

## Accessibility Features

### Keyboard Navigation
- Toasts are focusable
- Tab to retry button
- Enter/Space to activate
- Escape to dismiss

### Screen Reader
- Success/error announced
- Description read aloud
- Retry button announced
- Confirmation dialog fully accessible

### Color Contrast
- WCAG AA compliant
- Works in both themes
- Icons supplement color
- Text remains readable

## Animation Behavior

### Toast Entry
- Slides in from right
- Fade in effect
- Duration: ~200ms
- Smooth easing

### Toast Exit
- Fade out effect
- Slides out to right
- Duration: ~200ms
- Smooth easing

### Auto-dismiss
- Progress bar (optional)
- Countdown visible
- Hover pauses timer
- Resume on mouse leave

## Best Practices

### Do's ✓
- Keep messages concise
- Use descriptive errors
- Provide retry for failures
- Auto-dismiss successes
- Confirm destructive actions

### Don'ts ✗
- Don't show too many toasts at once
- Don't use technical error codes alone
- Don't auto-dismiss errors
- Don't skip confirmations for important actions
- Don't use toasts for critical information

## Comparison: Before vs After

### Before (Inline Messages)
```
[Login Form]
[User Management]
[User List]

❌ 设置失败：权限不足
```

**Issues:**
- Easy to miss
- No visual distinction
- Stays until next action
- No retry mechanism
- Takes up space

### After (Toast Notifications)
```
[Login Form]              ┌──────────────────┐
[User Management]         │ ✕ 设置角色失败    │
[User List]               │ 权限不足          │
                          │        [重试] [✕] │
                          └──────────────────┘
```

**Benefits:**
- Prominent and noticeable
- Color-coded feedback
- Auto-dismisses when appropriate
- Retry available
- Doesn't affect layout

## Integration with Existing Components

### Button Loading States
```typescript
<Button
  isLoading={busy}  // Shows spinner during operation
  onPress={() => handleLogin(email)}
>
  登录该邮箱
</Button>
```

**Flow:**
1. Button clicked → `busy = true`
2. Button shows spinner
3. API call executes
4. Toast appears with result
5. `busy = false` → Button returns to normal

### Form Input Clearing
```typescript
// After successful role change
toast.success("角色设置成功", { ... });
setEmailInput(""); // Clear input
await refreshUsers(); // Refresh list
```

**UX Benefit:**
- Ready for next operation
- Visual confirmation of success
- Prevents accidental duplicate submissions

## Summary

The feedback system provides:
- **Clear Communication**: Users always know what's happening
- **Error Recovery**: Retry buttons for failed operations
- **Safety**: Confirmations for important actions
- **Accessibility**: Works with keyboard and screen readers
- **Consistency**: Same pattern across all operations
- **Polish**: Professional, modern appearance

All requirements from Task 8 are fully satisfied with a user-friendly, accessible implementation.
