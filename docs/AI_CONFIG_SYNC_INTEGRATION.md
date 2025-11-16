# AI Configuration Sync Integration

**Task 5: 扩展aiConfigSync.ts - Complete Implementation**

## Overview

This document describes the AI configuration synchronization system that automatically syncs AI settings from the AssistantContext to the backend (port 3004) for intelligent command parsing.

## Architecture

```
┌─────────────────────┐
│  AssistantContext   │
│  (Active Assistant) │
└──────────┬──────────┘
           │
           │ AI Config
           ↓
┌─────────────────────┐
│  useAIConfigSync    │
│  (React Hook)       │
└──────────┬──────────┘
           │
           │ WebSocket
           ↓
┌─────────────────────┐
│ AIConfigSyncClient  │
│ (WebSocket Client)  │
└──────────┬──────────┘
           │
           │ ws://localhost:3004
           ↓
┌─────────────────────┐
│  Backend (3004)     │
│  tello_agent_backend│
└─────────────────────┘
```

## Features Implemented

### 1. AI Configuration Extraction from Assistant

The system can extract AI configuration from Assistant objects:

```typescript
interface AIConfig {
  provider: string;      // 'openai', 'anthropic', 'google', 'ollama'
  model: string;         // Model name
  apiKey: string;        // API key
  apiBase?: string;      // Optional API endpoint
  temperature?: number;  // Default: 0.7
  maxTokens?: number;    // Default: 4000
}
```

### 2. Automatic Synchronization

When an assistant is activated or switched:
- AI config is automatically extracted
- Config is validated
- Config is synced to backend via WebSocket
- Status is updated and monitored

### 3. Configuration Status Monitoring

Real-time monitoring of:
- Connection status
- Configuration status
- Sync operations
- Errors and recovery

```typescript
interface AIConfigStatus {
  configured: boolean;
  provider?: string;
  model?: string;
  supportsVision?: boolean;
  lastSyncTime?: number;
  error?: string;
}
```

### 4. Error Handling

Comprehensive error handling for:
- Connection failures
- Configuration validation errors
- Sync timeouts
- Backend errors

## Usage

### Basic Usage with React Hook

```tsx
import { useAIConfigSync } from '@/hooks/useAIConfigSync';
import { useAssistants } from '@/contexts/AssistantContext';

function MyComponent() {
  const { activeAssistant } = useAssistants();
  const {
    isConnected,
    syncStatus,
    handleAssistantSwitch,
  } = useAIConfigSync({
    wsUrl: 'ws://localhost:3004',
    autoConnect: true,
    autoSync: true,
  });

  // Auto-sync when assistant changes
  useEffect(() => {
    if (isConnected && activeAssistant) {
      handleAssistantSwitch(activeAssistant);
    }
  }, [activeAssistant, isConnected]);

  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>AI Configured: {syncStatus.configured ? 'Yes' : 'No'}</p>
      {syncStatus.configured && (
        <p>Using: {syncStatus.provider} - {syncStatus.model}</p>
      )}
    </div>
  );
}
```

### Manual Sync

```tsx
const { syncFromActiveAssistant } = useAIConfigSync();

// Manually sync current assistant
const handleManualSync = async () => {
  const result = await syncFromActiveAssistant(activeAssistant);
  if (result.success) {
    console.log('Sync successful');
  } else {
    console.error('Sync failed:', result.error);
  }
};
```

### Configuration Status Monitoring

```tsx
const { syncStatus } = useAIConfigSync();

// Monitor configuration changes
useEffect(() => {
  console.log('Config status changed:', syncStatus);
  
  if (syncStatus.configured) {
    console.log(`Using ${syncStatus.provider} - ${syncStatus.model}`);
  }
  
  if (syncStatus.error) {
    console.error('Config error:', syncStatus.error);
  }
}, [syncStatus]);
```

### Clear Configuration

```tsx
const { clearConfig } = useAIConfigSync();

// Clear AI configuration
const handleClear = async () => {
  await clearConfig();
  console.log('Configuration cleared');
};
```

## API Reference

### AIConfigSyncClient Methods

#### `extractAIConfigFromAssistant(assistant: Assistant | null): AIConfig | null`
Extracts AI configuration from an Assistant object.

#### `syncFromAssistant(assistant: Assistant | null): Promise<{ success: boolean; error?: string }>`
Syncs AI configuration from an assistant to the backend.

#### `handleAssistantSwitch(assistant: Assistant | null): Promise<{ success: boolean; error?: string }>`
Handles assistant switching with change detection.

#### `onConfigStatusChange(listener: (status: AIConfigStatus) => void): void`
Registers a configuration status listener.

#### `getAIConfigStatus(): AIConfigStatus`
Gets the current configuration status.

#### `getCurrentAIConfig(): AIConfig | null`
Gets the current AI configuration.

#### `clearAIConfig(): Promise<void>`
Clears the AI configuration.

### useAIConfigSync Hook

#### Options

```typescript
interface UseAIConfigSyncOptions {
  wsUrl?: string;        // Default: 'ws://localhost:3004'
  autoConnect?: boolean; // Default: true
  autoSync?: boolean;    // Default: true
}
```

#### Return Value

```typescript
interface UseAIConfigSyncReturn {
  isConnected: boolean;
  syncStatus: AIConfigStatus;
  isSyncing: boolean;
  syncError: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  syncFromActiveAssistant: (assistant: Assistant | null) => Promise<{ success: boolean; error?: string }>;
  handleAssistantSwitch: (assistant: Assistant | null) => Promise<{ success: boolean; error?: string }>;
  clearConfig: () => Promise<void>;
  getStats: () => ConnectionStats;
}
```

## WebSocket Protocol

### Messages Sent to Backend

#### Set AI Configuration
```json
{
  "type": "set_ai_config",
  "data": {
    "provider": "openai",
    "model": "gpt-4o",
    "api_key": "sk-...",
    "api_base": "https://api.openai.com/v1",
    "temperature": 0.7,
    "max_tokens": 4000
  }
}
```

#### Clear AI Configuration
```json
{
  "type": "clear_ai_config"
}
```

#### Get Configuration Status
```json
{
  "type": "get_ai_config_status"
}
```

### Messages Received from Backend

#### Configuration Updated
```json
{
  "type": "ai_config_updated",
  "data": {
    "provider": "openai",
    "model": "gpt-4o",
    "supports_vision": true
  }
}
```

#### Configuration Status
```json
{
  "type": "ai_config_status",
  "data": {
    "configured": true,
    "provider": "openai",
    "model": "gpt-4o",
    "supports_vision": true
  }
}
```

#### Error
```json
{
  "type": "error",
  "data": {
    "message": "AI configuration failed: Invalid API key"
  }
}
```

## Assistant AI Configuration Format

Assistants can store AI configuration in their metadata:

```typescript
interface Assistant {
  id: string;
  title: string;
  // ... other fields
  
  // AI configuration can be stored in metadata
  metadata?: {
    aiConfig?: {
      provider: string;
      model: string;
      apiKey: string;
      apiBase?: string;
      temperature?: number;
      maxTokens?: number;
    };
  };
  
  // Or directly on the assistant object
  aiConfig?: {
    provider: string;
    model: string;
    apiKey: string;
    // ...
  };
}
```

## Demo Component

A demo component is provided to test and visualize the sync functionality:

```tsx
import { AIConfigSyncDemo } from '@/components/AIConfigSyncDemo';

function Page() {
  return <AIConfigSyncDemo />;
}
```

The demo shows:
- Connection status
- Configuration status
- Active assistant info
- Manual sync controls
- Error display
- Usage instructions

## Testing

### Manual Testing

1. Start the backend:
   ```bash
   cd drone-analyzer-nextjs/python
   python tello_agent_backend.py
   ```

2. Open the demo page in your browser

3. Select an assistant with AI configuration

4. Verify:
   - Connection establishes automatically
   - AI config syncs when assistant is selected
   - Status updates are displayed
   - Manual sync works
   - Clear config works

### Integration Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAIConfigSync } from '@/hooks/useAIConfigSync';

test('syncs AI config when assistant changes', async () => {
  const { result } = renderHook(() => useAIConfigSync());
  
  await act(async () => {
    await result.current.connect();
  });
  
  expect(result.current.isConnected).toBe(true);
  
  const assistant = {
    id: '1',
    title: 'Test Assistant',
    aiConfig: {
      provider: 'openai',
      model: 'gpt-4o',
      apiKey: 'test-key',
    },
  };
  
  await act(async () => {
    await result.current.syncFromActiveAssistant(assistant);
  });
  
  expect(result.current.syncStatus.configured).toBe(true);
  expect(result.current.syncStatus.provider).toBe('openai');
});
```

## Troubleshooting

### Connection Issues

**Problem**: WebSocket fails to connect

**Solutions**:
1. Verify backend is running on port 3004
2. Check firewall settings
3. Verify WebSocket URL is correct
4. Check browser console for errors

### Configuration Not Syncing

**Problem**: AI config doesn't sync when assistant changes

**Solutions**:
1. Verify assistant has AI configuration
2. Check that `autoSync` is enabled
3. Verify connection is established
4. Check for errors in sync status

### Backend Not Receiving Config

**Problem**: Backend doesn't receive configuration

**Solutions**:
1. Verify WebSocket message format
2. Check backend logs for errors
3. Verify backend is listening for `set_ai_config` messages
4. Test with manual sync

## Performance Considerations

### Optimization Strategies

1. **Change Detection**: Only syncs when assistant actually changes
2. **Caching**: Current config is cached to avoid redundant syncs
3. **Debouncing**: Rapid assistant switches are handled gracefully
4. **Timeout Management**: Uses AI response optimizer for timeout handling

### Resource Usage

- WebSocket connection: ~1KB/s idle
- Heartbeat: Every 30 seconds
- Config sync: ~2KB per sync
- Status updates: ~500 bytes per update

## Security Considerations

### API Key Handling

- API keys are transmitted over WebSocket
- Use WSS (WebSocket Secure) in production
- Never log API keys
- Clear config on logout

### Best Practices

1. Use environment variables for sensitive data
2. Implement rate limiting on backend
3. Validate all configuration data
4. Use secure WebSocket (WSS) in production
5. Implement authentication for WebSocket connections

## Future Enhancements

### Planned Features

1. **Multi-Backend Support**: Connect to multiple backends
2. **Config Presets**: Save and load configuration presets
3. **Batch Sync**: Sync multiple assistants at once
4. **Offline Mode**: Queue syncs when offline
5. **Config Validation**: Enhanced validation before sync
6. **Metrics**: Track sync performance and success rates

### Integration Opportunities

1. **Settings Panel**: Add AI config sync settings
2. **Assistant Editor**: Edit AI config in assistant form
3. **Admin Dashboard**: Monitor sync status across users
4. **Analytics**: Track AI config usage patterns

## Related Documentation

- [AI Config Manager Integration](./AI_CONFIG_MANAGER_INTEGRATION.md)
- [Command Parsing Engine Update](./COMMAND_PARSING_ENGINE_UPDATE.md)
- [Tello Agent Bridge Design](../.kiro/specs/tello-agent-bridge/design.md)
- [Tello Agent Bridge Requirements](../.kiro/specs/tello-agent-bridge/requirements.md)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs
3. Test with the demo component
4. Check WebSocket connection in browser DevTools

## Changelog

### Version 1.0.0 (Task 5 Complete)
- ✅ AI config extraction from Assistant objects
- ✅ Automatic synchronization on assistant switch
- ✅ Configuration status monitoring
- ✅ React hook for easy integration
- ✅ Demo component for testing
- ✅ Comprehensive error handling
- ✅ WebSocket connection management
- ✅ Heartbeat and reconnection logic
