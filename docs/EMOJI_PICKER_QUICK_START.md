# EmojiPicker Quick Start Guide

## Overview

The EmojiPicker component provides a user-friendly interface for selecting emoji icons using HeroUI design system.

## Basic Usage

```typescript
import { EmojiPicker } from '@/components/EmojiPicker';
import { useState } from 'react';

function MyComponent() {
  const [emoji, setEmoji] = useState('🦄');

  return (
    <EmojiPicker
      value={emoji}
      onChange={setEmoji}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string` | Yes | - | Currently selected emoji |
| `onChange` | `(emoji: string) => void` | Yes | - | Callback when emoji is selected |
| `disabled` | `boolean` | No | `false` | Disable the picker |

## Features

### 1. Category-Based Browsing

The picker organizes emojis into 6 categories:
- 😀 Smileys & Emotions (30+ emojis)
- 🐶 Animals & Nature (30+ emojis)
- 🍎 Food & Drink (30+ emojis)
- ⚽ Objects & Activities (30+ emojis)
- ❤️ Symbols (30+ emojis)
- 🏁 Flags (30+ emojis)

### 2. Recent Emojis

- Automatically tracks recently used emojis
- Stores up to 30 recent selections
- Persists across sessions using localStorage
- Shows in a dedicated "Recent" tab

### 3. Search (Placeholder)

- Search input field is present
- Ready for future enhancement
- Can be extended to filter by name/keywords

## Integration Examples

### In a Form

```typescript
import { EmojiPicker } from '@/components/EmojiPicker';
import { Input } from '@heroui/input';

function AssistantForm() {
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🤖',
    description: ''
  });

  return (
    <form>
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Icon</label>
        <EmojiPicker
          value={formData.emoji}
          onChange={(emoji) => setFormData({ ...formData, emoji })}
        />
      </div>
      
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
    </form>
  );
}
```

### With Validation

```typescript
import { EmojiPicker } from '@/components/EmojiPicker';
import { useState } from 'react';

function ValidatedForm() {
  const [emoji, setEmoji] = useState('');
  const [error, setError] = useState('');

  const handleEmojiChange = (newEmoji: string) => {
    setEmoji(newEmoji);
    if (!newEmoji) {
      setError('Please select an emoji');
    } else {
      setError('');
    }
  };

  return (
    <div>
      <EmojiPicker
        value={emoji}
        onChange={handleEmojiChange}
      />
      {error && (
        <p className="text-xs text-danger mt-1">{error}</p>
      )}
    </div>
  );
}
```

### Disabled State

```typescript
<EmojiPicker
  value={emoji}
  onChange={setEmoji}
  disabled={isLoading || isReadOnly}
/>
```

## Styling

The component uses HeroUI components and Tailwind CSS classes. It automatically adapts to your theme (light/dark mode).

### Customization

The trigger button can be customized by modifying the component:

```typescript
// In EmojiPicker.tsx
<Button
  variant="bordered"  // Change to "solid", "flat", etc.
  className="w-full justify-start text-2xl h-14"  // Customize classes
  isDisabled={disabled}
  onPress={() => setIsOpen(true)}
>
  {value || '选择表情'}
</Button>
```

## Testing

### Manual Testing

```typescript
import { EmojiPickerDemo } from '@/components/EmojiPickerDemo';

// Use the demo component for testing
<EmojiPickerDemo />
```

### Unit Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { EmojiPicker } from '@/components/EmojiPicker';

describe('EmojiPicker', () => {
  it('should render with default state', () => {
    const onChange = jest.fn();
    render(<EmojiPicker value="" onChange={onChange} />);
    expect(screen.getByText('选择表情')).toBeInTheDocument();
  });

  it('should call onChange when emoji is selected', () => {
    const onChange = jest.fn();
    render(<EmojiPicker value="" onChange={onChange} />);
    
    // Open modal
    fireEvent.click(screen.getByText('选择表情'));
    
    // Select emoji
    fireEvent.click(screen.getByText('😀'));
    
    expect(onChange).toHaveBeenCalledWith('😀');
  });

  it('should respect disabled prop', () => {
    const onChange = jest.fn();
    render(<EmojiPicker value="" onChange={onChange} disabled />);
    
    const button = screen.getByText('选择表情');
    expect(button).toBeDisabled();
  });
});
```

## LocalStorage

The component uses localStorage to persist recent emojis:

- **Key**: `emoji_picker_recent`
- **Format**: JSON array of emoji strings
- **Max Size**: 30 emojis
- **Cleanup**: Automatic (removes duplicates, maintains order)

### Clearing Recent Emojis

```typescript
// Clear recent emojis
localStorage.removeItem('emoji_picker_recent');
```

## Accessibility

- ✅ Keyboard navigation (via HeroUI Modal)
- ✅ Screen reader support
- ✅ Focus management
- ✅ ARIA attributes
- ✅ Touch-friendly (12x12 emoji buttons)

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- localStorage API
- CSS Grid
- Emoji rendering

## Performance

- Modal only renders when opened (lazy)
- Efficient state management with React hooks
- Minimal re-renders with useCallback
- LocalStorage operations are wrapped in try-catch

## Troubleshooting

### Emojis not displaying correctly

Some older systems may not support all emojis. This is a system-level limitation, not a component issue.

### Recent emojis not persisting

Check if localStorage is enabled in the browser. Some privacy modes disable localStorage.

### Modal not opening

Ensure HeroUI theme provider is properly configured in your app:

```typescript
import { HeroUIProvider } from '@heroui/react';

function App() {
  return (
    <HeroUIProvider>
      {/* Your app */}
    </HeroUIProvider>
  );
}
```

## Future Enhancements

Planned features for future versions:

1. **Search Functionality**: Filter emojis by name/keywords
2. **Custom Emojis**: Upload custom images
3. **Skin Tone Variants**: Support for skin tone selection
4. **Favorites**: Mark and quick-access favorite emojis
5. **More Categories**: Additional emoji categories

## Related Documentation

- [Full Implementation Guide](./EMOJI_PICKER_IMPLEMENTATION.md)
- [Task Completion Report](./TASK_1_EMOJI_PICKER_COMPLETE.md)
- [HeroUI Documentation](https://heroui.com)

## Support

For issues or questions:
1. Check the [Full Implementation Guide](./EMOJI_PICKER_IMPLEMENTATION.md)
2. Review the [Task Completion Report](./TASK_1_EMOJI_PICKER_COMPLETE.md)
3. Test with [EmojiPickerDemo](../components/EmojiPickerDemo.tsx)

---

**Last Updated**: 2025-01-04
**Component Version**: 1.0.0
**Status**: ✅ Production Ready
