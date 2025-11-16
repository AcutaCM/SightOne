# Text Hierarchy Quick Start Guide

## 🚀 Get Started in 30 Seconds

The text hierarchy system is already implemented and ready to use. Just apply the appropriate CSS classes or use semantic HTML elements.

## 📋 Quick Reference

| Text Type | Opacity | Use For | CSS Class |
|-----------|---------|---------|-----------|
| **Primary** | 100% | Headings, important content | `.text-primary` or `h1-h6` |
| **Secondary** | 70% | Labels, descriptions | `.text-secondary` or `label` |
| **Tertiary** | 40% | Hints, captions | `.text-tertiary` |
| **Placeholder** | 30% | Input placeholders | `::placeholder` |
| **Disabled** | 40% | Disabled elements | `:disabled` |

## 💡 Common Use Cases

### 1. Card Component
```tsx
<Card>
  <h3 className="text-primary">Title</h3>
  <p className="text-secondary">Description</p>
  <span className="text-tertiary">Metadata</span>
</Card>
```

### 2. Form Field
```tsx
<div>
  <label className="text-secondary">Field Name</label>
  <input placeholder="Enter value..." />
  <span className="text-tertiary">Helper text</span>
</div>
```

### 3. Navigation
```tsx
<nav>
  <a className="text-primary">Active</a>
  <a className="text-secondary">Inactive</a>
</nav>
```

## 🎨 Using CSS Variables

You can also use CSS variables directly:

```tsx
<div style={{ color: 'var(--text-primary)' }}>Primary</div>
<div style={{ color: 'var(--text-secondary)' }}>Secondary</div>
<div style={{ color: 'var(--text-tertiary)' }}>Tertiary</div>
```

## ✅ Automatic Application

The system automatically applies to:
- ✓ All `h1-h6` elements → Primary
- ✓ All `label` elements → Secondary
- ✓ All `::placeholder` → Placeholder
- ✓ All `:disabled` elements → Disabled
- ✓ HeroUI components (cards, modals, forms)
- ✓ Ant Design components

## 🔍 Testing

1. Open your app in dark mode
2. Check that text hierarchy is clear
3. Verify contrast ratios in DevTools
4. Test with screen readers

## 📚 More Information

- **Full Documentation**: [TASK_4_TEXT_HIERARCHY_COMPLETE.md](./TASK_4_TEXT_HIERARCHY_COMPLETE.md)
- **Visual Guide**: [TEXT_HIERARCHY_VISUAL_GUIDE.md](./TEXT_HIERARCHY_VISUAL_GUIDE.md)
- **Design Tokens**: [lib/design-tokens-dark.ts](../lib/design-tokens-dark.ts)

## 🎯 Best Practices

1. **Use semantic HTML** - Let the system handle styling automatically
2. **Follow the hierarchy** - Don't skip levels
3. **Test readability** - Ensure text is clear in all contexts
4. **Be consistent** - Use the same level for similar content

---

That's it! The text hierarchy system is ready to use. Just apply the classes and enjoy consistent, accessible text styling across your app. 🎉
