# Admin Page LoginSection - Visual Guide

## Component Structure

```
LoginSection (Card)
├── CardHeader
│   └── "当前登录" title
└── CardBody
    ├── User Display Section
    │   ├── Avatar (with email initials)
    │   └── User Info
    │       ├── Email (truncated if long)
    │       └── Role indicator
    ├── Login Form
    │   ├── Input (with Mail icon)
    │   └── Button (primary, with loading)
    └── Bootstrap Warning (conditional)
        └── Warning Card
            ├── AlertTriangle icon
            └── Warning content
                ├── Message text
                └── Bootstrap button
```

## Visual Comparison

### Before (Inline Styles)
```tsx
<section style={{ marginBottom: 20, padding: 12, border: "1px solid #eee" }}>
  <h2 style={{ fontSize: 18 }}>当前登录</h2>
  <div>邮箱：{me?.email || "-"}</div>
  <div>角色：{me?.role}</div>
  <input style={{ padding: 6, border: "1px solid #ccc" }} />
  <button style={{ padding: "6px 12px" }}>登录该邮箱</button>
</section>
```

### After (HeroUI Components)
```tsx
<Card className="mb-6">
  <CardHeader>
    <h2 className="text-xl font-semibold">当前登录</h2>
  </CardHeader>
  <CardBody className="space-y-4">
    <div className="flex items-center gap-3">
      <Avatar name={me?.email} size="sm" />
      <div>
        <p className="font-medium">{me?.email}</p>
        <p className="text-sm text-default-500">角色: {me?.role}</p>
      </div>
    </div>
    <Input startContent={<Mail />} variant="bordered" />
    <Button color="primary" isLoading={busy}>登录该邮箱</Button>
  </CardBody>
</Card>
```

## Key Visual Improvements

### 1. Card Container
- **Before**: Basic border with inline styles
- **After**: Professional Card with proper shadows and rounded corners
- **Benefit**: Consistent with design system, better visual hierarchy

### 2. User Display
- **Before**: Plain text labels
- **After**: Avatar with initials + styled text
- **Benefit**: More engaging, easier to identify user at a glance

### 3. Input Field
- **Before**: Basic HTML input with inline styles
- **After**: HeroUI Input with icon and bordered variant
- **Benefit**: Better visual feedback, consistent styling, icon provides context

### 4. Action Button
- **Before**: Basic HTML button
- **After**: HeroUI Button with loading spinner
- **Benefit**: Clear loading state, better touch targets, consistent styling

### 5. Bootstrap Warning
- **Before**: Yellow background div with basic styling
- **After**: Warning-themed Card with icon and styled button
- **Benefit**: More prominent, better visual hierarchy, icon draws attention

## Responsive Behavior

### Desktop (> 640px)
```
┌─────────────────────────────────────┐
│ 当前登录                             │
├─────────────────────────────────────┤
│ [Avatar] user@example.com           │
│          角色: admin                 │
│                                     │
│ [📧 Input field...] [Login Button] │
│                                     │
│ ⚠️ Warning message                  │
│    [Bootstrap Button]               │
└─────────────────────────────────────┘
```

### Mobile (< 640px)
```
┌──────────────────┐
│ 当前登录          │
├──────────────────┤
│ [A] user@...     │
│     角色: admin   │
│                  │
│ [📧 Input...]    │
│ [Login Button]   │
│                  │
│ ⚠️ Warning       │
│ [Bootstrap Btn]  │
└──────────────────┘
```

## Color Scheme

### Light Mode
- Card background: `bg-content1` (white)
- Text: `text-foreground` (dark)
- Input border: `border-default-200`
- Button: `bg-primary` (blue)
- Warning background: `bg-warning-50` (light yellow)
- Warning border: `border-warning-200`

### Dark Mode
- Card background: `bg-content1` (dark gray)
- Text: `text-foreground` (light)
- Input border: `border-default-200` (gray)
- Button: `bg-primary` (blue)
- Warning background: `bg-warning-50/10` (transparent yellow)
- Warning text: `text-warning-600`

## Interactive States

### Input Field
- **Default**: Bordered, with mail icon
- **Focus**: Border color changes, shadow appears
- **Filled**: Text appears, icon remains visible
- **Enter Key**: Triggers login action

### Login Button
- **Default**: Primary blue, enabled
- **Disabled**: Grayed out when email is empty
- **Loading**: Shows spinner, text remains visible
- **Hover**: Slightly darker blue
- **Active**: Pressed state with scale effect

### Bootstrap Button
- **Default**: Warning yellow, flat variant
- **Disabled**: Grayed out when email is empty
- **Loading**: Shows spinner
- **Hover**: Slightly darker yellow

## Spacing System

```
Card
├── mb-6 (24px bottom margin)
└── CardBody
    ├── space-y-4 (16px vertical spacing)
    ├── User Display
    │   └── gap-3 (12px between avatar and text)
    ├── Login Form
    │   └── gap-2 (8px between input and button)
    └── Warning Card
        ├── py-3 (12px vertical padding)
        └── gap-3 (12px between icon and content)
```

## Typography Hierarchy

```
1. Card Header (Level 2)
   - text-xl (20px)
   - font-semibold (600)
   - text-foreground

2. User Email (Body)
   - font-medium (500)
   - text-foreground
   - truncate (ellipsis for long text)

3. Role Label (Small)
   - text-sm (14px)
   - text-default-500 (muted)

4. Warning Text (Small)
   - text-sm (14px)
   - text-warning-800 (dark mode: text-warning-600)
```

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter key submits login form
- Focus indicators on all inputs and buttons

### Screen Reader Support
- Avatar has name attribute for screen readers
- Input has placeholder text
- Buttons have descriptive text
- Warning section has proper semantic structure

### Visual Accessibility
- Sufficient color contrast (WCAG AA compliant)
- Icon sizes are readable (18-20px)
- Touch targets are large enough (44px minimum)
- Text truncation prevents layout breaking

## Implementation Notes

### Key Features
1. **Avatar Component**: Automatically generates initials from email
2. **Mail Icon**: Provides visual context for email input
3. **Loading States**: Clear feedback during async operations
4. **Responsive Layout**: Adapts to screen size automatically
5. **Dark Mode**: Full support with proper color adjustments
6. **Keyboard Support**: Enter key for quick login
7. **Conditional Rendering**: Bootstrap warning only when needed

### Design Tokens Used
- Colors: `primary`, `warning`, `default`, `foreground`
- Spacing: `mb-6`, `space-y-4`, `gap-2`, `gap-3`, `py-3`
- Typography: `text-xl`, `text-sm`, `font-semibold`, `font-medium`
- Borders: `border-2`, `border-warning-200`
- Variants: `bordered`, `flat`

### Best Practices Applied
- Semantic HTML structure
- Consistent spacing system
- Proper component composition
- Responsive design patterns
- Accessibility considerations
- Dark mode support
- Loading state management
- Error prevention (disabled states)
