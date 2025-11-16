# AI Config Sync - Quick Start Guide

**Task 5 Complete: AssistantContext Integration**

## 🚀 Quick Setup

### 1. Start the Backend

```bash
cd drone-analyzer-nextjs/python
python tello_agent_backend.py
```

Backend should start on `ws://localhost:3004`

### 2. Use in Your Component

```tsx
import { useAIConfigSync } from '@/hooks/useAIConfigSync';
import { useAssistants } from '@/contexts/AssistantContext';

function MyComponent() {
  const { activeAssistant } = useAssistants();
  const { isConnected, syncStatus, handleAssistantSwitch } = useAIConfigSync();

  // Auto-sync when assistant changes
  useEffect(() => {
    if (isConnected && activeAssistant) {
      handleAssistantSwitch(activeAssistant);
    }
  }, [activeAssistant, isConnected]);

  return (
    <div>
      {syncStatus.configured ? (
        <p>✅ AI Ready: {syncStatus.provider} - {syncStatus.model}</p>
      ) : (
        <p>⚠️ No AI Configuration</p>
      )}
    </div>
  );
}
```

### 3. Test with Demo Component

```tsx
import { AIConfigSyncDemo } from '@/components/AIConfigSyncDemo';

function TestPage() {
  return <AIConfigSyncDemo />;
}
```

## 📋 Common Use Cases

### Auto-Sync on Assistant Change

```tsx
const { handleAssistantSwitch } = useAIConfigSync({ autoSync: true });

// Automatically syncs when assistant changes
useEffect(() => {
  handleAssistantSwitch(activeAssistant);
}, [activeAssistant]);
```

### Manual Sync

```tsx
const { syncFromActiveAssistant } = useAIConfigSync({ autoSync: false });

const handleSync = async () => {
  const result = await syncFromActiveAssistant(activeAssistant);
  if (result.success) {
    console.log('✅ Synced!');
  }
};
```

### Monitor Status

```tsx
const { syncStatus } = useAIConfigSync();

useEffect(() => {
  if (syncStatus.configured) {
    console.log(`Using ${syncStatus.provider} - ${syncStatus.model}`);
  }
  if (syncStatus.error) {
    console.error('Error:', syncStatus.error);
  }
}, [syncStatus]);
```

### Connection Management

```tsx
const { isConnected, connect, disconnect } = useAIConfigSync({
  autoConnect: false
});

// Manual connection control
<Button onClick={connect} disabled={isConnected}>Connect</Button>
<Button onClick={disconnect} disabled={!isConnected}>Disconnect</Button>
```

## 🔧 Configuration Options

```tsx
useAIConfigSync({
  wsUrl: 'ws://localhost:3004',  // Backend URL
  autoConnect: true,              // Auto-connect on mount
  autoSync: true,                 // Auto-sync on assistant change
});
```

## 📊 Status Monitoring

```tsx
const { syncStatus, getStats } = useAIConfigSync();

// Configuration status
console.log(syncStatus.configured);    // boolean
console.log(syncStatus.provider);      // 'openai', 'anthropic', etc.
console.log(syncStatus.model);         // 'gpt-4o', 'claude-3-5-sonnet', etc.
console.log(syncStatus.supportsVision); // boolean
console.log(syncStatus.lastSyncTime);  // timestamp

// Connection stats
const stats = getStats();
console.log(stats.connected);          // boolean
console.log(stats.reconnectAttempts);  // number
console.log(stats.activeRequests);     // number
```

## ⚠️ Troubleshooting

### Backend Not Connecting

```bash
# Check if backend is running
netstat -an | findstr 3004

# Restart backend
python tello_agent_backend.py
```

### Config Not Syncing

1. Check assistant has AI config:
   ```tsx
   console.log(activeAssistant?.aiConfig);
   ```

2. Verify connection:
   ```tsx
   console.log(isConnected);
   ```

3. Check for errors:
   ```tsx
   console.log(syncStatus.error);
   ```

### WebSocket Errors

- Verify backend URL is correct
- Check firewall settings
- Use browser DevTools → Network → WS to inspect

## 📝 Assistant AI Config Format

Assistants need AI configuration to enable intelligent parsing:

```typescript
{
  id: '1',
  title: 'My Assistant',
  // ... other fields
  
  aiConfig: {
    provider: 'openai',      // Required
    model: 'gpt-4o',         // Required
    apiKey: 'sk-...',        // Required
    apiBase: 'https://...',  // Optional
    temperature: 0.7,        // Optional
    maxTokens: 4000,         // Optional
  }
}
```

Or in metadata:

```typescript
{
  metadata: {
    aiConfig: {
      provider: 'openai',
      model: 'gpt-4o',
      apiKey: 'sk-...',
    }
  }
}
```

## 🎯 Best Practices

1. **Always check connection before syncing**
   ```tsx
   if (isConnected) {
     await syncFromActiveAssistant(assistant);
   }
   ```

2. **Handle errors gracefully**
   ```tsx
   const result = await syncFromActiveAssistant(assistant);
   if (!result.success) {
     showNotification('Sync failed: ' + result.error);
   }
   ```

3. **Use autoSync for better UX**
   ```tsx
   useAIConfigSync({ autoSync: true });
   ```

4. **Monitor status for feedback**
   ```tsx
   {syncStatus.configured && (
     <Badge status="success" text="AI Ready" />
   )}
   ```

5. **Clear config on logout**
   ```tsx
   const { clearConfig } = useAIConfigSync();
   
   const handleLogout = async () => {
     await clearConfig();
     // ... logout logic
   };
   ```

## 🔗 Related Files

- **Hook**: `hooks/useAIConfigSync.ts`
- **Client**: `lib/websocket/aiConfigSync.ts`
- **Demo**: `components/AIConfigSyncDemo.tsx`
- **Docs**: `docs/AI_CONFIG_SYNC_INTEGRATION.md`

## ✅ Task 5 Checklist

- [x] Extract AI config from AssistantContext
- [x] Implement automatic sync on assistant switch
- [x] Handle configuration updates
- [x] Add configuration status monitoring
- [x] Create React hook for easy integration
- [x] Build demo component
- [x] Write comprehensive documentation
- [x] Add error handling and recovery
- [x] Implement connection management
- [x] Add status listeners and callbacks

## 🎉 Success!

Task 5 is complete! The AI configuration sync system is now fully integrated with AssistantContext and ready to use.

**Next Steps**: Proceed to Task 6 (前端AI配置同步) to implement the frontend UI components.
