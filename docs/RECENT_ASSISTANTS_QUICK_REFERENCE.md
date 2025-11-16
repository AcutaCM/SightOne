# Recent Assistants Service - Quick Reference

## Import

```typescript
import { recentAssistantsService } from '@/lib/services/recentAssistantsService';
```

## API Methods

### Record Usage
```typescript
recentAssistantsService.recordUsage(
  assistantId: string,
  title: string,
  emoji: string
): void
```
Records an assistant as recently used. Automatically moves to top of list.

### Get Recent List
```typescript
recentAssistantsService.getRecentAssistants(): RecentAssistant[]
```
Returns up to 10 most recently used assistants, sorted by most recent first.

### Get Most Recent
```typescript
recentAssistantsService.getMostRecent(): RecentAssistant | null
```
Returns the most recently used assistant, or null if none.

### Check if Recent
```typescript
recentAssistantsService.isRecent(assistantId: string): boolean
```
Checks if an assistant is in the recent list.

### Remove Specific
```typescript
recentAssistantsService.remove(assistantId: string): void
```
Removes a specific assistant from the recent list.

### Clear All
```typescript
recentAssistantsService.clearAll(): void
```
Removes all recent assistants from storage.

## Data Type

```typescript
interface RecentAssistant {
  id: string;
  title: string;
  emoji: string;
  lastUsedAt: Date;
}
```

## Configuration

- **Max Items**: 10
- **Storage**: localStorage
- **Storage Key**: `recent_assistants`

## Example Usage

```typescript
// Record usage when assistant is activated
const handleActivate = (assistant: Assistant) => {
  recentAssistantsService.recordUsage(
    assistant.id,
    assistant.title,
    assistant.emoji
  );
};

// Display recent assistants in UI
const RecentList = () => {
  const recent = recentAssistantsService.getRecentAssistants();
  
  return (
    <div>
      <h3>Recently Used</h3>
      {recent.map(item => (
        <div key={item.id}>
          {item.emoji} {item.title}
        </div>
      ))}
    </div>
  );
};
```

## Notes

- Automatically limits to 10 items
- Thread-safe for browser environment
- Handles errors gracefully
- No backend required (localStorage only)
