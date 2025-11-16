# Performance Optimization Quick Reference

Quick reference guide for using the performance optimization features.

---

## Virtual Scrolling

### Basic Usage

```tsx
import { AssistantGrid } from '@/components/ChatbotChat/AssistantGrid';

<AssistantGrid
  assistants={assistants}
  onSelect={handleSelect}
  onFavorite={handleFavorite}
  estimatedRowHeight={300}
  overscan={5}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `assistants` | `Assistant[]` | Required | List of assistants |
| `onSelect` | `(assistant) => void` | Optional | Selection callback |
| `onFavorite` | `(id, favorited) => void` | Optional | Favorite callback |
| `loading` | `boolean` | `false` | Loading state |
| `estimatedRowHeight` | `number` | `300` | Row height estimate |
| `overscan` | `number` | `5` | Overscan count |

---

## Search Debouncing

### Already Implemented

The `SearchBar` component already has debouncing with 300ms delay:

```tsx
import { SearchBar } from '@/components/ChatbotChat/SearchBar';

<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={handleSearch}
  debounceDelay={300}
/>
```

---

## Data Caching

### Get Default Cache

```tsx
import { getDefaultCache } from '@/lib/cache/assistantCache';

const cache = getDefaultCache();
```

### Basic Operations

```tsx
// Set data
cache.set('key', data);

// Get data
const data = cache.get('key');

// Check if exists
if (cache.has('key')) {
  // ...
}

// Delete entry
cache.delete('key');

// Clear all
cache.clear();
```

### Get or Set Pattern

```tsx
const data = await cache.getOrSet(
  'cache-key',
  async () => {
    // Fetch data if not in cache
    return await fetchData();
  }
);
```

### Cache Statistics

```tsx
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate * 100}%`);
console.log(`Size: ${stats.size} entries`);
```

### Service Integration

```tsx
import { getDefaultPresetAssistantsService } from '@/lib/services/presetAssistantsService';

const service = getDefaultPresetAssistantsService();

// Methods automatically use cache
const assistants = await service.getAllPublishedAssistants();
const recommended = await service.getRecommendedAssistants(6);
const results = await service.searchAssistants('query');

// Clear cache after modifications
service.clearCache();

// Get cache stats
const stats = service.getCacheStats();
```

---

## Lazy Loading

### Component Lazy Loading

```tsx
import { LazyAssistantCard } from '@/components/ChatbotChat/LazyAssistantCard';

<LazyAssistantCard
  assistant={assistant}
  onSelect={handleSelect}
  threshold={0.1}
  rootMargin="100px"
/>
```

### Custom Lazy Loading Hook

```tsx
import { useComponentLazyLoad } from '@/hooks/useLazyLoad';

const { ref, shouldRender } = useComponentLazyLoad({
  threshold: 0.1,
  rootMargin: '100px',
  delay: 100,
});

return (
  <div ref={ref}>
    {shouldRender && <ExpensiveComponent />}
  </div>
);
```

### Image Lazy Loading

```tsx
import { useImageLazyLoad } from '@/hooks/useLazyLoad';

const { ref, currentSrc, isLoading, isLoaded } = useImageLazyLoad({
  src: '/image.jpg',
  placeholder: '/placeholder.jpg',
  threshold: 0.1,
  rootMargin: '100px',
});

return (
  <img
    ref={ref}
    src={currentSrc}
    alt="Lazy loaded"
    style={{ opacity: isLoaded ? 1 : 0.5 }}
  />
);
```

---

## Cache Keys

Use these helper functions for consistent cache keys:

```tsx
import {
  getAssistantListCacheKey,
  getAssistantByIdCacheKey,
  getAssistantsByCategoryCacheKey,
  getSearchResultsCacheKey,
  getRecommendedAssistantsCacheKey,
} from '@/lib/cache/assistantCache';

// Examples
const listKey = getAssistantListCacheKey();
const idKey = getAssistantByIdCacheKey('assistant-id');
const categoryKey = getAssistantsByCategoryCacheKey('productivity');
const searchKey = getSearchResultsCacheKey('search query');
const recommendedKey = getRecommendedAssistantsCacheKey(6);
```

---

## Performance Tips

### 1. Use Virtual Scrolling for Long Lists

```tsx
// ✅ Good
<AssistantGrid assistants={longList} />

// ❌ Bad
{longList.map(item => <AssistantCard {...item} />)}
```

### 2. Debounce User Input

```tsx
// ✅ Good
const debouncedSearch = useDebouncedCallback(handleSearch, 300);

// ❌ Bad
onChange={(e) => handleSearch(e.target.value)}
```

### 3. Cache Expensive Operations

```tsx
// ✅ Good
const data = await cache.getOrSet(key, fetchData);

// ❌ Bad
const data = await fetchData();
```

### 4. Lazy Load Off-Screen Content

```tsx
// ✅ Good
<LazyAssistantCard assistant={assistant} />

// ❌ Bad
<AssistantCard assistant={assistant} />
```

### 5. Clear Cache After Modifications

```tsx
// ✅ Good
await updateAssistant(id, data);
service.clearCache();

// ❌ Bad
await updateAssistant(id, data);
// Cache still has old data
```

---

## Common Patterns

### Pattern 1: Cached Search

```tsx
const handleSearch = async (query: string) => {
  const service = getDefaultPresetAssistantsService();
  const results = await service.searchAssistants(query);
  setResults(results);
};
```

### Pattern 2: Virtual Grid with Lazy Cards

```tsx
<AssistantGrid
  assistants={assistants}
  onSelect={handleSelect}
  renderCard={(assistant) => (
    <LazyAssistantCard
      assistant={assistant}
      onSelect={handleSelect}
    />
  )}
/>
```

### Pattern 3: Debounced Search with Cache

```tsx
const debouncedSearch = useDebouncedCallback(
  async (query: string) => {
    const service = getDefaultPresetAssistantsService();
    const results = await service.searchAssistants(query);
    setResults(results);
  },
  300
);
```

---

## Monitoring

### Cache Performance

```tsx
// Log cache stats periodically
setInterval(() => {
  const stats = cache.getStats();
  console.log('Cache Stats:', {
    hitRate: `${(stats.hitRate * 100).toFixed(1)}%`,
    hits: stats.hits,
    misses: stats.misses,
    size: stats.size,
  });
}, 60000); // Every minute
```

### Performance Metrics

```tsx
// Measure render time
const start = performance.now();
// ... render component
const end = performance.now();
console.log(`Render time: ${end - start}ms`);
```

---

## Troubleshooting

### Virtual Scrolling

**Issue**: Scroll jumps  
**Fix**: Adjust `estimatedRowHeight`

**Issue**: Items not visible  
**Fix**: Increase `overscan`

### Caching

**Issue**: Stale data  
**Fix**: Call `service.clearCache()` after updates

**Issue**: High memory  
**Fix**: Reduce TTL or implement size limits

### Lazy Loading

**Issue**: Content not loading  
**Fix**: Check threshold and rootMargin values

**Issue**: Loading too early  
**Fix**: Reduce rootMargin value

---

## Related Files

- `lib/cache/assistantCache.ts` - Cache implementation
- `hooks/useLazyLoad.ts` - Lazy loading hooks
- `components/ChatbotChat/AssistantGrid.tsx` - Virtual scrolling
- `components/ChatbotChat/SearchBar.tsx` - Debounced search
- `components/ChatbotChat/LazyAssistantCard.tsx` - Lazy card

---

**Last Updated**: 2025-11-06
