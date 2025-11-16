# Preset Assistants Service - Quick Reference

## Import

```typescript
import { getDefaultPresetAssistantsService } from '@/lib/services/presetAssistantsService';
import { AssistantCategory } from '@/lib/constants/presetAssistants';
```

## Common Operations

### Initialize Presets

```typescript
const service = getDefaultPresetAssistantsService();
const result = await service.initializeAllPresets();
// Returns: { created, updated, skipped, errors }
```

### Get All Published

```typescript
const assistants = await service.getAllPublishedAssistants();
```

### Filter by Category

```typescript
const productivity = await service.getAssistantsByCategory(AssistantCategory.PRODUCTIVITY);
const creative = await service.getAssistantsByCategory(AssistantCategory.CREATIVE);
const development = await service.getAssistantsByCategory(AssistantCategory.DEVELOPMENT);
```

### Search

```typescript
// Full-text search
const results = await service.searchAssistants('无人机');

// Search by tag
const tagged = await service.searchAssistantsByTag('AI');
```

### Get Recommendations

```typescript
const recommended = await service.getRecommendedAssistants(6);
```

### Get by ID

```typescript
const assistant = await service.getAssistantById('tello-intelligent-agent');
```

## Categories

```typescript
AssistantCategory.PRODUCTIVITY  // 生产力工具
AssistantCategory.CREATIVE      // 创意设计
AssistantCategory.DEVELOPMENT   // 技术开发
AssistantCategory.EDUCATION     // 教育学习
AssistantCategory.BUSINESS      // 商业服务
AssistantCategory.SPECIALIZED   // 专业领域
```

## Utilities

```typescript
// Get all categories
const categories = service.getAllCategories();

// Get all tags
const tags = service.getAllTags();
```

## Error Handling

```typescript
try {
  const assistants = await service.searchAssistants('query');
} catch (error) {
  if (error instanceof PresetAssistantsServiceError) {
    console.error(`[${error.code}] ${error.message}`);
  }
}
```

## Error Codes

- `CREATE_PRESET_ERROR`
- `UPDATE_PRESET_ERROR`
- `FETCH_BY_CATEGORY_ERROR`
- `SEARCH_BY_TAG_ERROR`
- `SEARCH_ERROR`
- `FETCH_RECOMMENDED_ERROR`
- `FETCH_BY_ID_ERROR`
- `FETCH_ALL_ERROR`

## Performance Tips

1. **Debounce searches**: Use 300ms delay
2. **Cache results**: Store in component state
3. **Use singleton**: Always use `getDefaultPresetAssistantsService()`
4. **Batch operations**: Initialize once on startup

## Example: Market Home

```typescript
const service = getDefaultPresetAssistantsService();
const [assistants, setAssistants] = useState<Assistant[]>([]);

// Load on mount
useEffect(() => {
  service.getAllPublishedAssistants().then(setAssistants);
}, []);

// Filter by category
const handleCategory = async (category: AssistantCategory) => {
  const filtered = await service.getAssistantsByCategory(category);
  setAssistants(filtered);
};

// Search
const handleSearch = useDebouncedCallback(async (query: string) => {
  const results = await service.searchAssistants(query);
  setAssistants(results);
}, 300);
```

## Testing

```typescript
import { PresetAssistantsService } from '@/lib/services/presetAssistantsService';

const mockRepo = {
  findById: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
} as any;

const service = new PresetAssistantsService(mockRepo);
```

## Logging

All operations are automatically logged to `logs/app.log`:
- Initialization results
- Create/update operations
- Search queries
- Errors with details
