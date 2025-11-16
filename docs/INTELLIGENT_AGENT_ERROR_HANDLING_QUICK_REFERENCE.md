# Intelligent Agent Error Handling - Quick Reference

## Quick Start

### 1. Basic Error Handling

```typescript
import { handleIntelligentAgentError } from '@/lib/errors';

const result = await handleIntelligentAgentError(
  async () => await operation(),
  { userCommand: 'takeoff' }
);

if (!result.success) {
  console.error(result.error?.userMessage);
}
```

### 2. Error Handling with Retry

```typescript
import { handleWithRetry } from '@/lib/errors';

const result = await handleWithRetry(
  async () => await operation(),
  'operation-id',
  { userCommand: 'move forward' }
);
```

### 3. Display Error in UI

```tsx
import { IntelligentAgentErrorDisplay } from '@/components/IntelligentAgentErrorDisplay';

<IntelligentAgentErrorDisplay
  error={error}
  onRetry={() => retry()}
  onDismiss={() => setError(null)}
/>
```

## Error Types

| Category | Error Type | Retry? | User Action |
|----------|-----------|--------|-------------|
| **AI Service** | `AI_SERVICE_UNAVAILABLE` | ✅ 3x | Check config |
| | `AI_SERVICE_TIMEOUT` | ✅ 2x | Wait & retry |
| | `AI_SERVICE_AUTH_FAILED` | ❌ | Fix API key |
| | `AI_SERVICE_RATE_LIMIT` | ✅ 1x | Wait 1 min |
| **Drone** | `DRONE_NOT_CONNECTED` | ✅ 3x | Connect drone |
| | `DRONE_CONNECTION_LOST` | ✅ 5x | Check WiFi |
| | `DRONE_LOW_BATTERY` | ❌ | Charge drone |
| **Command** | `COMMAND_PARSE_FAILED` | ✅ 1x | Simplify command |
| | `COMMAND_INVALID_PARAMETERS` | ❌ | Fix parameters |
| | `COMMAND_EXECUTION_FAILED` | ✅ 2x | Check drone status |

## Common Patterns

### Create Specific Error

```typescript
import { AIServiceError, IntelligentAgentErrorType } from '@/lib/errors';

throw new AIServiceError(
  'OpenAI API key is invalid',
  IntelligentAgentErrorType.AI_SERVICE_AUTH_FAILED,
  { provider: 'openai' }
);
```

### Parse Generic Error

```typescript
import { parseError } from '@/lib/errors';

try {
  await operation();
} catch (error) {
  const agentError = parseError(error, { context: 'info' });
  throw agentError;
}
```

### Log Error

```typescript
import { intelligentAgentErrorLogger } from '@/lib/errors';

intelligentAgentErrorLogger.logError(error, userCommand, context);
```

### Check Error Statistics

```typescript
import { intelligentAgentErrorLogger } from '@/lib/errors';

const stats = intelligentAgentErrorLogger.getStatistics();
console.log('Total errors:', stats.totalErrors);
console.log('Consecutive:', stats.consecutiveErrors);
```

### Manual Recovery

```typescript
import { intelligentAgentErrorRecovery } from '@/lib/errors';

const result = await intelligentAgentErrorRecovery.attemptRecovery(
  error,
  async () => await operation(),
  'operation-id'
);

if (result.recovered) {
  console.log('Recovered!');
}
```

## UI Components

### Full Error Display

```tsx
<IntelligentAgentErrorDisplay
  error={error}
  onRetry={() => retry()}
  onDismiss={() => dismiss()}
  onOpenSettings={() => openSettings()}
  showTechnicalDetails={true}
/>
```

### Compact Error

```tsx
<IntelligentAgentErrorCompact
  error={error}
  onRetry={() => retry()}
/>
```

### Toast Notification

```tsx
<IntelligentAgentErrorToast
  error={error}
  onClose={() => close()}
/>
```

## Debugging

### Export Error Logs

```typescript
const logs = intelligentAgentErrorLogger.exportErrorLogs();
console.log(logs);
// Or download as file
```

### Get Recent Errors

```typescript
const recent = intelligentAgentErrorLogger.getRecentErrors(10);
recent.forEach(err => console.log(err));
```

### Reset Statistics

```typescript
intelligentAgentErrorLogger.resetStatistics();
intelligentAgentErrorRecovery.resetRetryCounters();
```

## Error Messages

### User-Friendly (Chinese)
- "AI服务暂时不可用，请检查配置或稍后重试"
- "无人机未连接，请先连接Tello无人机"
- "无法理解您的指令，请尝试更清晰的描述"

### Technical (English)
- "OpenAI API authentication failed: Invalid API key"
- "Tello drone connection timeout after 5000ms"
- "Failed to parse natural language command: Invalid JSON response"

## Recovery Suggestions

Each error includes actionable suggestions:
- 🔧 Check configuration
- 🔌 Connect drone
- 📡 Check network
- 🔄 Retry operation
- 📖 View documentation

## Thresholds

- **Consecutive Error Threshold**: 3 errors within 1 minute
- **Max Retry Attempts**: Varies by error type (0-5)
- **Retry Delays**: 0.5s - 60s with exponential backoff

## Files

- `lib/errors/intelligentAgentErrors.ts` - Error classes
- `lib/errors/intelligentAgentErrorLogger.ts` - Logging
- `lib/errors/intelligentAgentErrorRecovery.ts` - Recovery
- `lib/errors/index.ts` - Main exports
- `components/IntelligentAgentErrorDisplay.tsx` - UI components

## See Also

- [Full Documentation](./INTELLIGENT_AGENT_ERROR_HANDLING.md)
- [Intelligent Agent Setup](./INTELLIGENT_AGENT_SETUP.md)
- [Troubleshooting Guide](./INTELLIGENT_AGENT_TROUBLESHOOTING.md)
