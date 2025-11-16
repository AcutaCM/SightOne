# Preset Assistants Service Guide

## Overview

The Preset Assistants Service provides a comprehensive API for managing preset assistants in the system. It handles initialization, filtering, searching, and recommendations for preset assistants.

## Architecture

```
PresetAssistantsService
├── Initialization
│   ├── checkPresetExists()
│   ├── createPreset()
│   ├── updatePresetIfNeeded()
│   └── initializeAllPresets()
├── Filtering & Search
│   ├── getAssistantsByCategory()
│   ├── searchAssistantsByTag()
│   ├── searchAssistants()
│   └── getAllPublishedAssistants()
├── Recommendations
│   └── getRecommendedAssistants()
└── Utilities
    ├── getAllCategories()
    ├── getAllTags()
    └── getAssistantById()
```

## Core Features

### 1. Preset Initialization

The service automatically initializes all preset assistants defined in `lib/constants/presetAssistants.ts`.

```typescript
import { getDefaultPresetAssistantsService } from '@/lib/services/presetAssistantsService';

const service = getDefaultPresetAssistantsService();

// Initialize all presets
const result = await service.initializeAllPresets();
console.log(`Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`);
```

**Result Object:**
```typescript
{
  created: number;    // Number of new presets created
  updated: number;    // Number of presets updated
  skipped: number;    // Number of presets unchanged
  errors: string[];   // Any errors encountered
}
```

### 2. Category Filtering

Filter assistants by category to help users find relevant assistants.

```typescript
import { AssistantCategory } from '@/lib/constants/presetAssistants';

// Get all productivity assistants
const productivityAssistants = await service.getAssistantsByCategory(
  AssistantCategory.PRODUCTIVITY
);

// Get all specialized assistants
const specializedAssistants = await service.getAssistantsByCategory(
  AssistantCategory.SPECIALIZED
);
```

**Available Categories:**
- `PRODUCTIVITY` - 生产力工具
- `CREATIVE` - 创意设计
- `DEVELOPMENT` - 技术开发
- `EDUCATION` - 教育学习
- `BUSINESS` - 商业服务
- `SPECIALIZED` - 专业领域

### 3. Tag-Based Search

Search assistants by specific tags.

```typescript
// Find all assistants with "AI" tag
const aiAssistants = await service.searchAssistantsByTag('AI');

// Find all assistants with "编程" tag
const codingAssistants = await service.searchAssistantsByTag('编程');
```

**Features:**
- Case-insensitive search
- Partial matching (e.g., "AI" matches "AI", "ai", "Ai")
- Returns only published assistants

### 4. Full-Text Search

Search across title, description, and tags.

```typescript
// Search for "无人机"
const droneAssistants = await service.searchAssistants('无人机');

// Search for "data analysis"
const dataAssistants = await service.searchAssistants('data analysis');

// Empty query returns all published assistants
const allAssistants = await service.searchAssistants('');
```

**Search Behavior:**
- Searches in: title, description, tags
- Case-insensitive
- Supports both Chinese and English
- Returns only published assistants

### 5. Recommendations

Get recommended assistants based on usage and ratings.

```typescript
// Get top 6 recommended assistants
const recommended = await service.getRecommendedAssistants(6);

// Get top 10 recommended assistants
const topTen = await service.getRecommendedAssistants(10);
```

**Recommendation Algorithm:**
```
score = usageCount × rating
```

Assistants are sorted by score in descending order.

### 6. Utility Methods

```typescript
// Get all available categories
const categories = service.getAllCategories();
// Returns: [AssistantCategory.PRODUCTIVITY, AssistantCategory.CREATIVE, ...]

// Get all available tags
const tags = service.getAllTags();
// Returns: ['无人机', '智能控制', 'AI', ...]

// Get assistant by ID
const assistant = await service.getAssistantById('tello-intelligent-agent');

// Get all published assistants
const allPublished = await service.getAllPublishedAssistants();
```

## API Reference

### Class: PresetAssistantsService

#### Constructor

```typescript
constructor(repository?: AssistantRepository)
```

Creates a new service instance. If no repository is provided, uses the default repository.

#### Methods

##### initializeAllPresets()

```typescript
async initializeAllPresets(): Promise<{
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}>
```

Initializes all preset assistants. Creates new presets or updates existing ones.

##### checkPresetExists(id: string)

```typescript
async checkPresetExists(id: string): Promise<boolean>
```

Checks if a preset assistant exists in the database.

##### createPreset(preset: PresetAssistant)

```typescript
async createPreset(preset: PresetAssistant): Promise<Assistant>
```

Creates a new preset assistant in the database.

##### updatePresetIfNeeded(preset: PresetAssistant)

```typescript
async updatePresetIfNeeded(preset: PresetAssistant): Promise<Assistant | null>
```

Updates a preset assistant if the content has changed.

##### getAssistantsByCategory(category: AssistantCategory)

```typescript
async getAssistantsByCategory(category: AssistantCategory): Promise<Assistant[]>
```

Gets all published assistants in a specific category.

##### searchAssistantsByTag(tag: string)

```typescript
async searchAssistantsByTag(tag: string): Promise<Assistant[]>
```

Searches assistants by tag (case-insensitive, partial matching).

##### searchAssistants(query: string)

```typescript
async searchAssistants(query: string): Promise<Assistant[]>
```

Full-text search across title, description, and tags.

##### getRecommendedAssistants(limit?: number)

```typescript
async getRecommendedAssistants(limit: number = 6): Promise<Assistant[]>
```

Gets recommended assistants based on usage and ratings.

##### getAllCategories()

```typescript
getAllCategories(): AssistantCategory[]
```

Returns all available categories.

##### getAllTags()

```typescript
getAllTags(): string[]
```

Returns all available tags from preset assistants.

##### getAssistantById(id: string)

```typescript
async getAssistantById(id: string): Promise<Assistant | null>
```

Gets a single assistant by ID.

##### getAllPublishedAssistants()

```typescript
async getAllPublishedAssistants(): Promise<Assistant[]>
```

Gets all published assistants.

## Error Handling

The service throws `PresetAssistantsServiceError` for all errors:

```typescript
try {
  const assistants = await service.searchAssistants('test');
} catch (error) {
  if (error instanceof PresetAssistantsServiceError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    console.error('Details:', error.details);
  }
}
```

**Error Codes:**
- `CREATE_PRESET_ERROR` - Failed to create preset
- `UPDATE_PRESET_ERROR` - Failed to update preset
- `FETCH_BY_CATEGORY_ERROR` - Failed to fetch by category
- `SEARCH_BY_TAG_ERROR` - Failed to search by tag
- `SEARCH_ERROR` - Failed to search
- `FETCH_RECOMMENDED_ERROR` - Failed to fetch recommendations
- `FETCH_BY_ID_ERROR` - Failed to fetch by ID
- `FETCH_ALL_ERROR` - Failed to fetch all

## Usage Examples

### Example 1: Initialize Presets on App Startup

```typescript
// app/layout.tsx or initialization script
import { getDefaultPresetAssistantsService } from '@/lib/services/presetAssistantsService';

async function initializeApp() {
  const service = getDefaultPresetAssistantsService();
  
  try {
    const result = await service.initializeAllPresets();
    console.log('Preset initialization complete:', result);
    
    if (result.errors.length > 0) {
      console.error('Initialization errors:', result.errors);
    }
  } catch (error) {
    console.error('Failed to initialize presets:', error);
  }
}
```

### Example 2: Market Home Page

```typescript
// components/ChatbotChat/MarketHome.tsx
import { getDefaultPresetAssistantsService } from '@/lib/services/presetAssistantsService';
import { AssistantCategory } from '@/lib/constants/presetAssistants';

export function MarketHome() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [recommended, setRecommended] = useState<Assistant[]>([]);
  const service = getDefaultPresetAssistantsService();

  useEffect(() => {
    // Load recommended assistants
    service.getRecommendedAssistants(6).then(setRecommended);
    
    // Load all published assistants
    service.getAllPublishedAssistants().then(setAssistants);
  }, []);

  const handleCategorySelect = async (category: AssistantCategory) => {
    const filtered = await service.getAssistantsByCategory(category);
    setAssistants(filtered);
  };

  const handleSearch = async (query: string) => {
    const results = await service.searchAssistants(query);
    setAssistants(results);
  };

  return (
    <div>
      <RecommendedSection assistants={recommended} />
      <CategoryNav onSelect={handleCategorySelect} />
      <SearchBar onSearch={handleSearch} />
      <AssistantGrid assistants={assistants} />
    </div>
  );
}
```

### Example 3: Category Filter Component

```typescript
// components/ChatbotChat/CategoryFilter.tsx
import { getDefaultPresetAssistantsService } from '@/lib/services/presetAssistantsService';
import { AssistantCategory, CATEGORY_LABELS } from '@/lib/constants/presetAssistants';

export function CategoryFilter({ onFilter }: { onFilter: (assistants: Assistant[]) => void }) {
  const service = getDefaultPresetAssistantsService();
  const categories = service.getAllCategories();

  const handleCategoryClick = async (category: AssistantCategory) => {
    const assistants = await service.getAssistantsByCategory(category);
    onFilter(assistants);
  };

  return (
    <div className="flex gap-2">
      {categories.map(category => (
        <Button
          key={category}
          onClick={() => handleCategoryClick(category)}
        >
          {CATEGORY_LABELS[category].zh}
        </Button>
      ))}
    </div>
  );
}
```

### Example 4: Search Component

```typescript
// components/ChatbotChat/AssistantSearch.tsx
import { useState } from 'react';
import { getDefaultPresetAssistantsService } from '@/lib/services/presetAssistantsService';
import { useDebouncedCallback } from 'use-debounce';

export function AssistantSearch({ onResults }: { onResults: (assistants: Assistant[]) => void }) {
  const [query, setQuery] = useState('');
  const service = getDefaultPresetAssistantsService();

  const handleSearch = useDebouncedCallback(async (searchQuery: string) => {
    const results = await service.searchAssistants(searchQuery);
    onResults(results);
  }, 300);

  return (
    <Input
      placeholder="搜索助理..."
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        handleSearch(e.target.value);
      }}
    />
  );
}
```

## Performance Considerations

### 1. Caching

The service uses the repository's query caching for optimal performance:

```typescript
// Queries are automatically cached for 30 seconds
const assistants = await service.getAssistantsByCategory(category);
```

### 2. Debouncing

For search operations, use debouncing to reduce database queries:

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (query: string) => service.searchAssistants(query),
  300 // 300ms delay
);
```

### 3. Pagination

For large result sets, consider implementing pagination:

```typescript
// The repository supports pagination
const response = repository.findAll({
  status: 'published',
  page: 1,
  pageSize: 20
});
```

## Testing

### Unit Tests

```typescript
import { PresetAssistantsService } from '@/lib/services/presetAssistantsService';
import { AssistantRepository } from '@/lib/db/assistantRepository';

describe('PresetAssistantsService', () => {
  let service: PresetAssistantsService;
  let mockRepository: jest.Mocked<AssistantRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
    } as any;
    
    service = new PresetAssistantsService(mockRepository);
  });

  it('should initialize all presets', async () => {
    mockRepository.findById.mockReturnValue(null);
    mockRepository.create.mockReturnValue({} as any);

    const result = await service.initializeAllPresets();
    
    expect(result.created).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);
  });

  it('should filter by category', async () => {
    mockRepository.findAll.mockReturnValue({
      data: [
        { id: '1', category: ['productivity'] },
        { id: '2', category: ['creative'] },
      ],
      total: 2,
      page: 1,
      pageSize: 20,
    } as any);

    const results = await service.getAssistantsByCategory('productivity');
    
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });
});
```

## Logging

The service uses the application logger for all operations:

```typescript
import { logger } from '@/lib/logger/logger';

// Logs are automatically created for:
// - Preset initialization
// - Create/update operations
// - Search operations
// - Errors

// View logs in: logs/app.log
```

## Best Practices

1. **Use the Singleton**: Always use `getDefaultPresetAssistantsService()` for consistency
2. **Handle Errors**: Always wrap service calls in try-catch blocks
3. **Debounce Searches**: Use debouncing for search inputs to reduce load
4. **Cache Results**: Cache results in component state when appropriate
5. **Log Operations**: The service logs all operations automatically
6. **Test Thoroughly**: Write unit tests for all service interactions

## Troubleshooting

### Issue: Presets not appearing

**Solution:**
```typescript
// Check initialization result
const result = await service.initializeAllPresets();
console.log('Initialization result:', result);

// Check if presets exist
const allPublished = await service.getAllPublishedAssistants();
console.log('Published assistants:', allPublished.length);
```

### Issue: Search returns no results

**Solution:**
```typescript
// Check if assistants are published
const assistant = await service.getAssistantById('preset-id');
console.log('Assistant status:', assistant?.status);

// Verify search query
const results = await service.searchAssistants('test');
console.log('Search results:', results.length);
```

### Issue: Category filter not working

**Solution:**
```typescript
// Check category format
const assistant = await service.getAssistantById('preset-id');
console.log('Assistant category:', assistant?.category);

// Verify category enum
import { AssistantCategory } from '@/lib/constants/presetAssistants';
console.log('Available categories:', Object.values(AssistantCategory));
```

## Related Documentation

- [Preset Assistants Constants](../lib/constants/presetAssistants.ts)
- [Assistant Repository](../lib/db/assistantRepository.ts)
- [Database Schema](../lib/db/schema.ts)
- [Assistant Types](../types/assistant.ts)

## Support

For issues or questions:
1. Check the logs in `logs/app.log`
2. Review error codes and messages
3. Consult the API reference above
4. Check related documentation
