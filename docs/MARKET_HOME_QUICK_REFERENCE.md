# Market Home - Quick Reference Guide

## Component Overview

### CategoryNav
**Location**: `components/ChatbotChat/CategoryNav.tsx`

```tsx
<CategoryNav
  selected={selectedCategory}
  onSelect={setSelectedCategory}
  assistants={assistants}
  initialCollapsed={false}
  language="zh"
/>
```

**Props**:
- `selected`: Current category (null for "All")
- `onSelect`: Callback when category changes
- `assistants`: All assistants for counting
- `initialCollapsed`: Start collapsed (default: false)
- `language`: UI language (default: 'zh')

---

### SearchBar
**Location**: `components/ChatbotChat/SearchBar.tsx`

```tsx
<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={handleSearch}
  suggestions={allTags}
  debounceDelay={300}
  maxSuggestions={5}
  language="zh"
/>
```

**Props**:
- `value`: Current search value
- `onChange`: Callback when value changes
- `onSearch`: Callback when search is triggered
- `suggestions`: Available suggestions (tags, etc.)
- `debounceDelay`: Debounce delay in ms (default: 300)
- `maxSuggestions`: Max suggestions to show (default: 5)
- `language`: UI language (default: 'zh')

**Keyboard Shortcuts**:
- `Enter`: Trigger search
- `ArrowDown`: Navigate suggestions down
- `ArrowUp`: Navigate suggestions up
- `Escape`: Close suggestions

---

### RecommendedSection
**Location**: `components/ChatbotChat/RecommendedSection.tsx`

```tsx
<RecommendedSection
  assistants={recommendedAssistants}
  onSelect={handleSelectAssistant}
  layout="grid"
  showReasons={true}
  loading={false}
  maxItems={6}
  language="zh"
/>
```

**Props**:
- `assistants`: Recommended assistants
- `onSelect`: Callback when assistant selected
- `layout`: 'grid' or 'carousel' (default: 'grid')
- `showReasons`: Show recommendation reasons (default: true)
- `loading`: Loading state (default: false)
- `maxItems`: Max items to show (default: 6)
- `language`: UI language (default: 'zh')

**Recommendation Reasons**:
- **Trending**: High usage (>100) + High rating (≥4.5)
- **Highly Rated**: High rating (≥4.5)
- **Popular**: High usage (>50)
- **Featured**: Default

---

### MarketHome
**Location**: `components/ChatbotChat/MarketHome.tsx`

```tsx
<MarketHome
  onSelectAssistant={handleSelectAssistant}
  onSwitchToChat={handleSwitchToChat}
  language="zh"
/>
```

**Props**:
- `onSelectAssistant`: Callback when assistant selected
- `onSwitchToChat`: Callback to switch to chat view
- `language`: UI language (default: 'zh')

**Features**:
- Category filtering
- Search functionality
- Recommended assistants
- Responsive grid layout
- Loading states
- Empty states

---

## Common Patterns

### Filtering Assistants

```typescript
// By category
const filtered = assistants.filter(a => {
  const categories = Array.isArray(a.category)
    ? a.category
    : JSON.parse(a.category);
  return categories.includes(selectedCategory);
});

// By search query
const filtered = assistants.filter(a => {
  const lowerQuery = query.toLowerCase();
  return (
    a.title.toLowerCase().includes(lowerQuery) ||
    a.desc.toLowerCase().includes(lowerQuery) ||
    a.tags?.some(t => t.toLowerCase().includes(lowerQuery))
  );
});
```

### Activating Assistant

```typescript
const handleSelectAssistant = async (assistant: Assistant) => {
  const result = await activateAssistant(assistant.id);
  
  if (result.success) {
    // Success - switch to chat
    onSwitchToChat?.();
  } else {
    // Error - show notification
    console.error(result.error);
  }
};
```

### Getting Recommendations

```typescript
import { getDefaultPresetAssistantsService } from '@/lib/services/presetAssistantsService';

const service = getDefaultPresetAssistantsService();
const recommended = await service.getRecommendedAssistants(6);
```

---

## Styling

### Theme Variables

```css
/* Colors */
--heroui-foreground
--heroui-background
--heroui-primary
--heroui-content1
--heroui-content2
--heroui-content3
--heroui-divider

/* Opacity */
--heroui-foreground / 0.5  /* 50% opacity */
--heroui-foreground / 0.7  /* 70% opacity */
```

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  grid-template-columns: 1fr;
}

/* Tablet */
@media (max-width: 1024px) {
  grid-template-columns: repeat(2, 1fr);
}

/* Desktop */
@media (min-width: 1024px) {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
```

---

## State Management

### Local State

```typescript
const [selectedCategory, setSelectedCategory] = useState<AssistantCategory | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [loading, setLoading] = useState(true);
const [recommendedAssistants, setRecommendedAssistants] = useState<Assistant[]>([]);
```

### Context Integration

```typescript
const {
  publishedAssistants,
  refreshAssistants,
  activateAssistant,
} = useAssistants();
```

---

## Performance Tips

### Memoization

```typescript
// Memoize filtered results
const filteredAssistants = useMemo(() => {
  return assistants.filter(/* ... */);
}, [assistants, selectedCategory, searchQuery]);

// Memoize callbacks
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query);
}, []);
```

### Debouncing

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((query: string) => {
  onSearch(query);
}, 300);
```

---

## Error Handling

### Loading States

```tsx
{loading ? (
  <Skeleton />
) : (
  <Content />
)}
```

### Empty States

```tsx
{items.length === 0 ? (
  <EmptyState>
    <EmptyIcon>🔍</EmptyIcon>
    <EmptyText>No results found</EmptyText>
  </EmptyState>
) : (
  <ItemsList />
)}
```

### Error States

```typescript
try {
  await operation();
} catch (error) {
  console.error('Operation failed:', error);
  // Show error notification
}
```

---

## Accessibility

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Tab order follows visual order
- Enter/Space activate buttons
- Arrow keys navigate suggestions
- Escape closes modals/dropdowns

### ARIA Labels

```tsx
<Button aria-label="Clear search">
  <X />
</Button>
```

### Focus Management

```typescript
inputRef.current?.focus();
```

---

## Testing

### Unit Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryNav } from './CategoryNav';

test('selects category on click', () => {
  const onSelect = jest.fn();
  render(
    <CategoryNav
      selected={null}
      onSelect={onSelect}
      assistants={mockAssistants}
    />
  );
  
  fireEvent.click(screen.getByText('生产力工具'));
  expect(onSelect).toHaveBeenCalledWith(AssistantCategory.PRODUCTIVITY);
});
```

---

## Troubleshooting

### Issue: Search not working
**Solution**: Check debounce delay and ensure `onSearch` callback is provided

### Issue: Categories not showing counts
**Solution**: Ensure `assistants` prop contains valid category data

### Issue: Recommendations not loading
**Solution**: Check `PresetAssistantsService` initialization and data availability

### Issue: Responsive layout broken
**Solution**: Verify CSS Grid breakpoints and container widths

---

## Resources

- [HeroUI Documentation](https://heroui.com)
- [Emotion Documentation](https://emotion.sh)
- [use-debounce Documentation](https://github.com/xnimorz/use-debounce)
- [Lucide Icons](https://lucide.dev)

---

**Last Updated**: 2025-11-06
