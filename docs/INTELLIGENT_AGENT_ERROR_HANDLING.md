# Intelligent Agent Error Handling System

## Overview

The Intelligent Agent Error Handling System provides comprehensive error management for the Tello Intelligent Agent, including error classification, logging, recovery, and user-friendly error messages.

## Features

### 1. Error Classification (Requirement 8.1, 8.2, 8.3)

Errors are classified into specific types with appropriate severity levels:

#### AI Service Errors (8.1)
- `AI_SERVICE_UNAVAILABLE` - AI service is not accessible
- `AI_SERVICE_TIMEOUT` - AI service response timeout
- `AI_SERVICE_INVALID_RESPONSE` - Invalid response from AI
- `AI_SERVICE_RATE_LIMIT` - Rate limit exceeded
- `AI_SERVICE_AUTH_FAILED` - Authentication failed

#### Drone Connection Errors (8.2)
- `DRONE_NOT_CONNECTED` - Drone is not connected
- `DRONE_CONNECTION_LOST` - Connection to drone lost
- `DRONE_CONNECTION_TIMEOUT` - Connection timeout
- `DRONE_LOW_BATTERY` - Drone battery too low

#### Command Errors (8.3)
- `COMMAND_PARSE_FAILED` - Failed to parse command
- `COMMAND_INVALID_FORMAT` - Invalid command format
- `COMMAND_INVALID_PARAMETERS` - Invalid parameters
- `COMMAND_UNSAFE` - Command deemed unsafe
- `COMMAND_EXECUTION_FAILED` - Command execution failed
- `COMMAND_EXECUTION_TIMEOUT` - Execution timeout
- `COMMAND_SEQUENCE_FAILED` - Command sequence failed

### 2. Error Logging (Requirement 8.4)

All errors are logged with:
- Timestamp
- Error type and severity
- User-friendly message
- Technical message
- User command (if applicable)
- Context information
- Stack trace

Logs are written to:
- Console (with color coding)
- File system (via logger service)
- In-memory statistics

### 3. Error Recovery (Requirement 8.5)

Automatic error recovery includes:
- **Retry Logic**: Automatic retry with exponential backoff
- **Degradation**: Fallback to alternative services
- **Threshold Detection**: Warns when consecutive errors exceed threshold

### 4. User-Friendly Error Display

React components for displaying errors:
- `IntelligentAgentErrorDisplay` - Full error card with suggestions
- `IntelligentAgentErrorCompact` - Compact inline error
- `IntelligentAgentErrorToast` - Toast notification

## Usage

### Basic Error Handling

```typescript
import { handleIntelligentAgentError } from '@/lib/errors';

const result = await handleIntelligentAgentError(
  async () => {
    // Your operation here
    return await someOperation();
  },
  { userCommand: 'takeoff' }
);

if (!result.success) {
  // Handle error
  console.error(result.error);
}
```

### Error Handling with Retry

```typescript
import { handleWithRetry } from '@/lib/errors';

const result = await handleWithRetry(
  async () => {
    // Your operation here
    return await someOperation();
  },
  'operation-id',
  { userCommand: 'move forward 50cm' }
);

if (!result.success) {
  // Error after retries
  console.error(result.error);
}
```

### Manual Error Creation

```typescript
import {
  AIServiceError,
  DroneConnectionError,
  CommandParseError,
  IntelligentAgentErrorType,
} from '@/lib/errors';

// AI Service Error
throw new AIServiceError(
  'OpenAI API key is invalid',
  IntelligentAgentErrorType.AI_SERVICE_AUTH_FAILED,
  { provider: 'openai' }
);

// Drone Error
throw new DroneConnectionError(
  'Tello drone not responding',
  IntelligentAgentErrorType.DRONE_NOT_CONNECTED
);

// Command Error
throw new CommandParseError(
  'Unable to parse natural language command',
  userCommand,
  IntelligentAgentErrorType.COMMAND_PARSE_FAILED
);
```

### Displaying Errors in UI

```tsx
import { IntelligentAgentErrorDisplay } from '@/components/IntelligentAgentErrorDisplay';
import { IntelligentAgentError } from '@/lib/errors';

function MyComponent() {
  const [error, setError] = useState<IntelligentAgentError | null>(null);

  return (
    <>
      {error && (
        <IntelligentAgentErrorDisplay
          error={error}
          onRetry={() => {
            setError(null);
            // Retry operation
          }}
          onDismiss={() => setError(null)}
          onOpenSettings={() => {
            // Open settings modal
          }}
          showTechnicalDetails={true}
        />
      )}
    </>
  );
}
```

### Error Recovery

```typescript
import {
  intelligentAgentErrorRecovery,
  IntelligentAgentError,
} from '@/lib/errors';

// Attempt automatic recovery
const recoveryResult = await intelligentAgentErrorRecovery.attemptRecovery(
  error,
  async () => {
    // Retry operation
    return await operation();
  },
  'operation-id'
);

if (recoveryResult.recovered) {
  console.log('Operation recovered successfully');
} else if (recoveryResult.shouldRetry) {
  console.log('Can retry again');
} else {
  console.log('Recovery failed:', recoveryResult.message);
}

// Attempt degraded operation (fallback)
const degradedResult = await intelligentAgentErrorRecovery.attemptDegradedOperation(
  error,
  async () => {
    // Fallback operation
    return await fallbackOperation();
  }
);
```

### Error Statistics

```typescript
import { intelligentAgentErrorLogger } from '@/lib/errors';

// Get error statistics
const stats = intelligentAgentErrorLogger.getStatistics();
console.log('Total errors:', stats.totalErrors);
console.log('Consecutive errors:', stats.consecutiveErrors);
console.log('Errors by type:', stats.errorsByType);

// Get recent errors
const recentErrors = intelligentAgentErrorLogger.getRecentErrors(10);

// Export error logs
const logs = intelligentAgentErrorLogger.exportErrorLogs();
console.log(logs);

// Reset statistics
intelligentAgentErrorLogger.resetStatistics();
```

## Error Recovery Strategies

### AI Service Errors

| Error Type | Max Retries | Delay | Strategy |
|------------|-------------|-------|----------|
| Unavailable | 3 | 1s (exponential backoff) | Retry with backoff |
| Timeout | 2 | 2s | Retry with delay |
| Invalid Response | 2 | 0.5s | Immediate retry |
| Rate Limit | 1 | 60s | Wait and retry |
| Auth Failed | 0 | - | No retry (requires config fix) |

### Drone Connection Errors

| Error Type | Max Retries | Delay | Strategy |
|------------|-------------|-------|----------|
| Not Connected | 3 | 0.5s | Quick retry |
| Connection Lost | 5 | 1s | Persistent retry |
| Timeout | 2 | 2s | Delayed retry |
| Low Battery | 0 | - | No retry (safety) |

### Command Errors

| Error Type | Max Retries | Delay | Strategy |
|------------|-------------|-------|----------|
| Parse Failed | 1 | 0.5s | Single retry |
| Invalid Format | 0 | - | No retry (user input issue) |
| Invalid Parameters | 0 | - | No retry (user input issue) |
| Unsafe | 0 | - | No retry (safety) |
| Execution Failed | 2 | 1s | Retry with delay |
| Execution Timeout | 1 | 2s | Single retry |
| Sequence Failed | 1 | 1s | Single retry |

## Error Messages

### User Messages

User messages are friendly and actionable:
- ✅ Clear description of what went wrong
- ✅ No technical jargon
- ✅ Actionable guidance

Examples:
- "AI服务暂时不可用，请检查配置或稍后重试"
- "无人机未连接，请先连接Tello无人机"
- "无法理解您的指令，请尝试更清晰的描述"

### Technical Messages

Technical messages provide detailed information for debugging:
- Error type and code
- Stack trace
- Context information
- Original error message

## Recovery Suggestions

Each error type has specific recovery suggestions:

### AI Service Unavailable
1. 检查AI配置 → Open settings
2. 检查网络连接
3. 查看文档 → Link to docs

### Drone Not Connected
1. 连接无人机 → Instructions
2. 检查无人机电源
3. 查看连接指南 → Link to docs

### Command Parse Failed
1. 使用示例指令 → Link to examples
2. 简化指令

## Consecutive Error Detection

The system monitors consecutive errors and warns when threshold is exceeded:

```typescript
// Check if threshold exceeded
if (intelligentAgentErrorRecovery.checkConsecutiveErrorThreshold()) {
  const message = intelligentAgentErrorRecovery.getConfigurationCheckMessage();
  console.warn(message);
}
```

Default threshold: 3 consecutive errors within 1 minute

## Integration with Existing Services

### Intelligent Agent Preset Service

```typescript
// Already integrated in intelligentAgentPresetService.ts
import { parseError, intelligentAgentErrorLogger } from '@/lib/errors';

try {
  await operation();
} catch (error) {
  const agentError = parseError(error, { operation: 'operationName' });
  intelligentAgentErrorLogger.logError(agentError);
  throw agentError;
}
```

### WebSocket AI Config Sync

```typescript
// Already integrated in aiConfigSync.ts
import { WebSocketError, IntelligentAgentErrorType } from '@/lib/errors';

if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
  throw new WebSocketError(
    'WebSocket not connected',
    IntelligentAgentErrorType.WEBSOCKET_NOT_CONNECTED
  );
}
```

## Testing

### Unit Tests

```typescript
import {
  IntelligentAgentError,
  AIServiceError,
  parseError,
} from '@/lib/errors';

describe('Error Handling', () => {
  it('should create AI service error', () => {
    const error = new AIServiceError(
      'API key invalid',
      IntelligentAgentErrorType.AI_SERVICE_AUTH_FAILED
    );
    
    expect(error.type).toBe(IntelligentAgentErrorType.AI_SERVICE_AUTH_FAILED);
    expect(error.userMessage).toContain('API密钥');
  });

  it('should parse generic error', () => {
    const genericError = new Error('OpenAI API timeout');
    const agentError = parseError(genericError);
    
    expect(agentError).toBeInstanceOf(AIServiceError);
    expect(agentError.type).toBe(IntelligentAgentErrorType.AI_SERVICE_TIMEOUT);
  });
});
```

### Integration Tests

```typescript
import { handleWithRetry } from '@/lib/errors';

describe('Error Recovery', () => {
  it('should retry on failure', async () => {
    let attempts = 0;
    
    const result = await handleWithRetry(async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return 'success';
    });
    
    expect(result.success).toBe(true);
    expect(attempts).toBe(3);
  });
});
```

## Best Practices

1. **Always use typed errors**: Use specific error classes instead of generic Error
2. **Provide context**: Include relevant context information with errors
3. **Log user commands**: Always log the user command that caused the error
4. **Use recovery suggestions**: Provide actionable recovery suggestions
5. **Monitor statistics**: Regularly check error statistics for patterns
6. **Test error paths**: Write tests for error handling code
7. **Display friendly messages**: Always show user-friendly messages in UI
8. **Enable technical details**: Provide option to view technical details for debugging

## Troubleshooting

### High Error Rate

If you see many consecutive errors:
1. Check error statistics: `intelligentAgentErrorLogger.getStatistics()`
2. Review recent errors: `intelligentAgentErrorLogger.getRecentErrors()`
3. Export logs: `intelligentAgentErrorLogger.exportErrorLogs()`
4. Check configuration (AI, drone, network)

### Errors Not Logged

Ensure error handling is properly integrated:
```typescript
import { parseError, intelligentAgentErrorLogger } from '@/lib/errors';

try {
  // operation
} catch (error) {
  const agentError = parseError(error);
  intelligentAgentErrorLogger.logError(agentError);
  throw agentError;
}
```

### Recovery Not Working

Check retry configuration:
```typescript
import { intelligentAgentErrorRecovery } from '@/lib/errors';

// Get retry attempts
const attempts = intelligentAgentErrorRecovery.getRetryAttempts('operation-id');
console.log('Retry attempts:', attempts);

// Reset if needed
intelligentAgentErrorRecovery.resetRetryCounters();
```

## Related Documentation

- [Intelligent Agent Setup](./INTELLIGENT_AGENT_SETUP.md)
- [Intelligent Agent Market Display](./INTELLIGENT_AGENT_MARKET_DISPLAY.md)
- [WebSocket Integration](./INTELLIGENT_AGENT_PURECHAT_INTEGRATION.md)
- [Logging System](../lib/logger/README.md)

## Support

For issues or questions:
1. Check error logs: `logs/app.log`
2. Review error statistics in the application
3. Consult troubleshooting guide above
4. Contact technical support with error logs
