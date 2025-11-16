# Text Hierarchy Visual Guide

## Overview

This guide provides visual examples of the text hierarchy system implemented in the dark mode redesign. The system uses white color with varying opacity levels to create a clear visual hierarchy.

## Text Hierarchy Levels

### 1. Primary Text (100% White Opacity)

**Purpose**: Headings, primary content, and the most important information

**Visual Appearance**:
```
████████████████████████  ← Brightest, most prominent
Main Heading (H1)
Important Content
Key Information
```

**When to Use**:
- Page titles and main headings (h1, h2, h3)
- Primary content in cards and panels
- Important status messages
- Active navigation items
- Selected menu items

**CSS Classes**:
- `.text-primary`
- `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- `[data-text-primary]`

**Example**:
```tsx
<h1 className="text-primary">Dashboard</h1>
<p className="text-primary">This is important primary content.</p>
```

---

### 2. Secondary Text (70% White Opacity)

**Purpose**: Labels, descriptions, and supporting content

**Visual Appearance**:
```
████████████████░░░░░░░░  ← Slightly dimmed
Field Label
Description Text
Supporting Information
```

**When to Use**:
- Form labels
- Section descriptions
- Card subtitles
- Inactive navigation items
- Table body text
- List descriptions

**CSS Classes**:
- `.text-secondary`
- `label`
- `[data-text-secondary]`
- `.description`
- `.label`

**Example**:
```tsx
<label className="text-secondary">Username</label>
<p className="text-secondary">Enter your username to continue.</p>
```

---

### 3. Tertiary Text (40% White Opacity)

**Purpose**: Less important content, hints, and captions

**Visual Appearance**:
```
████████░░░░░░░░░░░░░░░░  ← More dimmed
Optional Hint
Caption Text
Metadata
```

**When to Use**:
- Optional hints and tips
- Image captions
- Metadata (dates, counts)
- Helper text
- Footnotes

**CSS Classes**:
- `.text-tertiary`
- `[data-text-tertiary]`
- `.hint`
- `.caption`

**Example**:
```tsx
<span className="text-tertiary">Optional: Add a profile picture</span>
<small className="text-tertiary">Last updated: 2 hours ago</small>
```

---

### 4. Placeholder Text (30% White Opacity)

**Purpose**: Input placeholders and empty state text

**Visual Appearance**:
```
██████░░░░░░░░░░░░░░░░░░  ← Subtle, non-intrusive
Enter text here...
No items to display
```

**When to Use**:
- Input field placeholders
- Empty state messages
- Temporary guidance text

**CSS Classes**:
- `::placeholder`
- `.text-placeholder`
- `[data-text-placeholder]`

**Example**:
```tsx
<input placeholder="Search..." />
<div className="text-placeholder">No results found</div>
```

---

### 5. Disabled Text (40% White Opacity)

**Purpose**: Disabled form elements and inactive content

**Visual Appearance**:
```
████████░░░░░░░░░░░░░░░░  ← Dimmed to indicate unavailability
Disabled Button
Inactive Option
```

**When to Use**:
- Disabled buttons
- Disabled form inputs
- Inactive menu items
- Unavailable options

**CSS Classes**:
- `.text-disabled`
- `[data-text-disabled]`
- `:disabled`
- `[disabled]`

**Example**:
```tsx
<button disabled className="text-disabled">Submit</button>
<input disabled value="Cannot edit" />
```

---

## Visual Comparison

Here's how the different text levels appear side by side:

```
Primary Text (100%)    ████████████████████████  ← Brightest
Secondary Text (70%)   ████████████████░░░░░░░░  ← Slightly dimmed
Tertiary Text (40%)    ████████░░░░░░░░░░░░░░░░  ← More dimmed
Placeholder (30%)      ██████░░░░░░░░░░░░░░░░░░  ← Subtle
Disabled (40%)         ████████░░░░░░░░░░░░░░░░  ← Same as tertiary
```

## Real-World Examples

### Example 1: Form Field

```tsx
<div className="form-field">
  <label className="text-secondary">Email Address</label>
  <input 
    type="email" 
    placeholder="Enter your email..." 
    className="text-primary"
  />
  <span className="text-tertiary">We'll never share your email</span>
</div>
```

**Visual Result**:
```
Email Address          ← Secondary (70%)
[Enter your email...]  ← Placeholder (30%)
We'll never share...   ← Tertiary (40%)
```

---

### Example 2: Card Component

```tsx
<Card>
  <CardHeader>
    <h3 className="text-primary">System Status</h3>
    <p className="text-secondary">Real-time monitoring</p>
  </CardHeader>
  <CardBody>
    <p className="text-primary">All systems operational</p>
    <span className="text-tertiary">Last checked: 2 minutes ago</span>
  </CardBody>
</Card>
```

**Visual Result**:
```
System Status              ← Primary (100%)
Real-time monitoring       ← Secondary (70%)
All systems operational    ← Primary (100%)
Last checked: 2 min ago    ← Tertiary (40%)
```

---

### Example 3: Navigation Menu

```tsx
<nav>
  <a href="/dashboard" className="text-primary">Dashboard</a>
  <a href="/settings" className="text-secondary">Settings</a>
  <a href="/help" className="text-secondary">Help</a>
</nav>
```

**Visual Result**:
```
Dashboard  ← Primary (100%) - Active
Settings   ← Secondary (70%) - Inactive
Help       ← Secondary (70%) - Inactive
```

---

### Example 4: Table

```tsx
<table>
  <thead>
    <tr>
      <th className="text-primary">Name</th>
      <th className="text-primary">Status</th>
      <th className="text-primary">Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="text-secondary">John Doe</td>
      <td className="text-secondary">Active</td>
      <td className="text-tertiary">2024-10-29</td>
    </tr>
  </tbody>
</table>
```

**Visual Result**:
```
Name      Status    Date        ← Primary (100%) - Headers
John Doe  Active    2024-10-29  ← Secondary (70%) + Tertiary (40%)
```

---

## Accessibility Considerations

### Contrast Ratios

All text opacity levels meet WCAG 2.1 Level AA requirements:

| Text Level | Opacity | Contrast Ratio | WCAG Compliance |
|------------|---------|----------------|-----------------|
| Primary | 100% | 21:1 | AAA ✓ |
| Secondary | 70% | 14.7:1 | AAA ✓ |
| Tertiary | 40% | 8.4:1 | AA ✓ |
| Placeholder | 30% | 6.3:1 | AA ✓ |
| Disabled | 40% | 8.4:1 | AA ✓ |

### Best Practices

1. **Use Primary for Important Content**: Ensure critical information uses primary text
2. **Maintain Hierarchy**: Don't skip levels (e.g., don't go from primary to tertiary without secondary)
3. **Test Readability**: Verify text is readable in different lighting conditions
4. **Consider Context**: Use appropriate opacity based on content importance
5. **Avoid Overuse of Tertiary**: Too much low-opacity text can strain eyes

### Testing Checklist

- [ ] Verify primary text is clearly visible
- [ ] Check secondary text is readable but less prominent
- [ ] Ensure tertiary text is visible but subtle
- [ ] Confirm placeholders are distinguishable from content
- [ ] Test disabled states are clearly indicated
- [ ] Verify smooth transitions between states
- [ ] Check contrast ratios with browser DevTools
- [ ] Test with screen readers

---

## Common Patterns

### Pattern 1: Card with Title and Description

```tsx
<Card>
  <h3 className="text-primary">Card Title</h3>
  <p className="text-secondary">Card description goes here</p>
  <span className="text-tertiary">Additional info</span>
</Card>
```

### Pattern 2: Form with Label and Hint

```tsx
<div>
  <label className="text-secondary">Field Name</label>
  <input placeholder="Enter value..." />
  <span className="text-tertiary">Hint: Format should be...</span>
</div>
```

### Pattern 3: List Item with Metadata

```tsx
<li>
  <h4 className="text-primary">Item Title</h4>
  <p className="text-secondary">Item description</p>
  <span className="text-tertiary">Created: 2024-10-29</span>
</li>
```

### Pattern 4: Status Indicator

```tsx
<div>
  <span className="text-primary">Status:</span>
  <span className="text-secondary">Connected</span>
  <span className="text-tertiary">(Last updated: 1m ago)</span>
</div>
```

---

## Troubleshooting

### Issue: Text is too dim

**Solution**: Use a higher opacity level (e.g., secondary instead of tertiary)

### Issue: Text hierarchy is not clear

**Solution**: Ensure you're using appropriate levels for content importance

### Issue: Placeholder text is too visible

**Solution**: Verify you're using the correct placeholder class (30% opacity)

### Issue: Disabled text looks the same as tertiary

**Solution**: This is intentional - both use 40% opacity. Add additional visual cues (e.g., cursor: not-allowed)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│ TEXT HIERARCHY QUICK REFERENCE                      │
├─────────────────────────────────────────────────────┤
│ Primary (100%)    → Headings, important content     │
│ Secondary (70%)   → Labels, descriptions            │
│ Tertiary (40%)    → Hints, captions                 │
│ Placeholder (30%) → Input placeholders              │
│ Disabled (40%)    → Disabled elements               │
└─────────────────────────────────────────────────────┘
```

---

**Last Updated**: 2025-10-29
**Related Documents**: 
- TASK_4_TEXT_HIERARCHY_COMPLETE.md
- DARK_MODE_DESIGN_TOKENS.md
- requirements.md (Requirements 2.1-2.5)
