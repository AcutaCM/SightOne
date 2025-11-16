# Tello Intelligent Agent - TypeScript Implementation

## Overview

The Tello Intelligent Agent is a TypeScript implementation that provides AI-powered drone command analysis and execution directly in the frontend. Unlike the Python version that runs as a separate backend service, this implementation analyzes images and natural language commands in the browser and sends command sequences to the drone backend for execution.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Browser)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  TelloIntelligentAgent Service                     │    │
│  │  - Natural language analysis                       │    │
│  │  - Image analysis with vision models               │    │
│  │  - Command sequence generation                     │    │
│  │  - AI provider abstraction (OpenAI, Ollama, etc.) │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React Hook (useTelloIntelligentAgent)            │    │
│  │  - State management                                │    │
│  │  - Command execution                               │    │
│  │  - Error handling                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  UI Component (TelloIntelligentAgentPanel)        │    │
│  │  - Command input                                   │    │
│  │  - Image upload                                    │    │
│  │  - Results display                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ HTTP POST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Drone Backend (Python)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  drone_backend.py                                  │    │
│  │  - Command execution                               │    │
│  │  - Tello drone control                             │    │
│  │  - Status monitoring                               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Differences from Python Version

| Feature | Python Version | TypeScript Version |
|---------|---------------|-------------------|
| **Location** | Backend service (port 3004) | Frontend browser |
| **AI Analysis** | Server-side | Client-side |
| **Image Processing** | Server-side with OpenCV | Client-side with AI vision models |
| **Communication** | WebSocket | HTTP REST API |
| **Execution** | Direct drone control | Via drone backend API |
| **State Management** | Python asyncio | React hooks |

## Features

### 1. Natural Language Command Analysis

Convert natural language instructions into drone commands:

```typescript
const agent = new TelloIntelligentAgent(config);

const result = await agent.analyzeCommand(
  "Take off, move forward 100cm, rotate 180 degrees, then land"
);

// Result:
{
  success: true,
  commands: [
    { action: "takeoff", parameters: {}, description: "Take off" },
    { action: "move_forward", parameters: { distance: 100 }, description: "Move forward 100cm" },
    { action: "rotate_clockwise", parameters: { degrees: 180 }, description: "Rotate 180 degrees" },
    { action: "land", parameters: {}, description: "Land" }
  ],
  reasoning: "Sequential flight pattern with rotation"
}
```

### 2. Image Analysis

Analyze drone camera images and get suggested commands:

```typescript
const result = await agent.analyzeImage({
  imageData: base64Image,
  prompt: "What obstacles do you see? Suggest safe navigation."
});

// Result:
{
  success: true,
  description: "I see a wall ahead at approximately 2 meters...",
  observations: ["Wall ahead", "Clear space on left"],
  suggestedCommands: [
    { action: "move_left", parameters: { distance: 50 }, description: "Avoid wall" }
  ]
}
```

### 3. Command Execution

Execute command sequences on the drone backend:

```typescript
const results = await agent.executeCommands(commands);

// Results:
[
  { success: true, action: "takeoff", message: "Takeoff successful" },
  { success: true, action: "move_forward", message: "Moved forward 100cm" },
  // ...
]
```

## Usage

### Basic Setup

```typescript
import { TelloIntelligentAgent } from '@/lib/services/telloIntelligentAgent';

const agent = new TelloIntelligentAgent({
  aiProvider: 'openai',
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  model: 'gpt-4',
  baseUrl: 'https://api.openai.com/v1'
}, 'http://localhost:3001'); // Drone backend URL
```

### Using React Hook

```typescript
import { useTelloIntelligentAgent } from '@/hooks/useTelloIntelligentAgent';

function MyComponent() {
  const {
    isAnalyzing,
    isExecuting,
    lastAnalysis,
    error,
    analyzeCommand,
    executeCommands
  } = useTelloIntelligentAgent({
    config: {
      aiProvider: 'openai',
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      model: 'gpt-4'
    },
    droneBackendUrl: 'http://localhost:3001'
  });

  const handleCommand = async () => {
    const analysis = await analyzeCommand("Take off and hover");
    
    if (analysis.success) {
      await executeCommands(analysis.commands);
    }
  };

  return (
    <div>
      <button onClick={handleCommand} disabled={isAnalyzing || isExecuting}>
        Execute Command
      </button>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### Using UI Component

```typescript
import TelloIntelligentAgentPanel from '@/components/TelloIntelligentAgentPanel';

function App() {
  return (
    <TelloIntelligentAgentPanel
      droneBackendUrl="http://localhost:3001"
      onCommandsGenerated={(commands) => console.log('Generated:', commands)}
      onExecutionComplete={(results) => console.log('Executed:', results)}
    />
  );
}
```

## AI Provider Configuration

### OpenAI

```typescript
{
  aiProvider: 'openai',
  apiKey: 'sk-...',
  model: 'gpt-4',
  baseUrl: 'https://api.openai.com/v1' // Optional
}
```

### Azure OpenAI

```typescript
{
  aiProvider: 'azure',
  apiKey: 'your-key',
  endpoint: 'https://your-resource.openai.azure.com',
  deployment: 'gpt-4',
  model: 'gpt-4'
}
```

### Ollama (Local)

```typescript
{
  aiProvider: 'ollama',
  model: 'llama3.1:8b',
  baseUrl: 'http://localhost:11434/v1'
}
```

### Qwen (Alibaba Cloud)

```typescript
{
  aiProvider: 'qwen',
  apiKey: 'sk-...',
  model: 'qwen-turbo',
  baseUrl: 'https://dashscope.aliyuncs.com/api/v1'
}
```

### DeepSeek

```typescript
{
  aiProvider: 'deepseek',
  apiKey: 'sk-...',
  model: 'deepseek-chat',
  baseUrl: 'https://api.deepseek.com'
}
```

### Groq

```typescript
{
  aiProvider: 'groq',
  apiKey: 'gsk_...',
  model: 'llama-3.1-70b-versatile',
  baseUrl: 'https://api.groq.com/openai/v1'
}
```

## Available Drone Commands

| Command | Parameters | Description |
|---------|-----------|-------------|
| `takeoff` | - | Take off |
| `land` | - | Land |
| `emergency` | - | Emergency stop |
| `move_forward` | `distance` (cm) | Move forward |
| `move_back` | `distance` (cm) | Move backward |
| `move_left` | `distance` (cm) | Move left |
| `move_right` | `distance` (cm) | Move right |
| `move_up` | `distance` (cm) | Move up |
| `move_down` | `distance` (cm) | Move down |
| `rotate_clockwise` | `degrees` | Rotate clockwise |
| `rotate_counter_clockwise` | `degrees` | Rotate counter-clockwise |
| `get_battery` | - | Get battery level |
| `get_status` | - | Get drone status |
| `hover` | - | Hover in place |

## API Reference

### TelloIntelligentAgent Class

#### Constructor

```typescript
constructor(config: AgentConfig, droneBackendUrl?: string)
```

#### Methods

##### analyzeCommand

```typescript
async analyzeCommand(command: string): Promise<AIAnalysisResult>
```

Analyze natural language command and generate drone commands.

##### analyzeImage

```typescript
async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResult>
```

Analyze image and generate insights/commands.

##### executeCommands

```typescript
async executeCommands(commands: DroneCommand[]): Promise<CommandExecutionResult[]>
```

Execute command sequence on drone backend.

##### updateConfig

```typescript
updateConfig(config: Partial<AgentConfig>): void
```

Update AI configuration.

### React Hook

#### useTelloIntelligentAgent

```typescript
function useTelloIntelligentAgent(options: UseTelloAgentOptions): UseTelloAgentReturn
```

Returns:
- `isAnalyzing`: boolean - AI analysis in progress
- `isExecuting`: boolean - Command execution in progress
- `lastAnalysis`: AIAnalysisResult | null - Last analysis result
- `lastExecution`: CommandExecutionResult[] | null - Last execution results
- `error`: string | null - Error message
- `analyzeCommand`: Function - Analyze command
- `analyzeImage`: Function - Analyze image
- `executeCommands`: Function - Execute commands
- `analyzeAndExecute`: Function - Analyze and execute in one call
- `updateConfig`: Function - Update configuration
- `clearError`: Function - Clear error state
- `reset`: Function - Reset all state

## Error Handling

The agent includes comprehensive error handling:

```typescript
try {
  const result = await agent.analyzeCommand("invalid command");
  
  if (!result.success) {
    console.error('Analysis failed:', result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Best Practices

1. **Always validate commands before execution**
   ```typescript
   const analysis = await analyzeCommand(userInput);
   if (analysis.success && analysis.commands.length > 0) {
     // Review commands before executing
     await executeCommands(analysis.commands);
   }
   ```

2. **Handle errors gracefully**
   ```typescript
   const { error, clearError } = useTelloIntelligentAgent(config);
   
   useEffect(() => {
     if (error) {
       // Show error to user
       setTimeout(clearError, 5000); // Auto-clear after 5s
     }
   }, [error]);
   ```

3. **Use appropriate AI models**
   - For command analysis: GPT-4, Claude, or Llama 3.1
   - For image analysis: GPT-4 Vision, Claude 3, or Qwen-VL

4. **Implement rate limiting**
   ```typescript
   const [lastRequest, setLastRequest] = useState(0);
   
   const handleAnalyze = async () => {
     const now = Date.now();
     if (now - lastRequest < 1000) return; // 1 request per second
     
     setLastRequest(now);
     await analyzeCommand(input);
   };
   ```

5. **Monitor execution status**
   ```typescript
   const results = await executeCommands(commands);
   
   const failedCommands = results.filter(r => !r.success);
   if (failedCommands.length > 0) {
     // Handle failures
   }
   ```

## Testing

### Unit Tests

```typescript
import { TelloIntelligentAgent } from '@/lib/services/telloIntelligentAgent';

describe('TelloIntelligentAgent', () => {
  it('should analyze command correctly', async () => {
    const agent = new TelloIntelligentAgent(mockConfig);
    const result = await agent.analyzeCommand('take off');
    
    expect(result.success).toBe(true);
    expect(result.commands).toHaveLength(1);
    expect(result.commands[0].action).toBe('takeoff');
  });
});
```

### Integration Tests

```typescript
describe('Command Execution', () => {
  it('should execute commands on backend', async () => {
    const agent = new TelloIntelligentAgent(config, 'http://localhost:3001');
    
    const commands = [{ action: 'get_battery', parameters: {} }];
    const results = await agent.executeCommands(commands);
    
    expect(results[0].success).toBe(true);
  });
});
```

## Performance Considerations

1. **AI API Latency**: Analysis typically takes 1-3 seconds
2. **Command Execution**: Each command has a 2-second delay
3. **Image Analysis**: Vision models may take 3-5 seconds
4. **Network**: Ensure stable connection to drone backend

## Troubleshooting

### Common Issues

1. **AI API Errors**
   - Check API key validity
   - Verify network connectivity
   - Ensure correct base URL

2. **Command Execution Failures**
   - Verify drone backend is running
   - Check drone connection status
   - Review command parameters

3. **Image Analysis Issues**
   - Ensure model supports vision
   - Check image format (base64)
   - Verify image size limits

## Future Enhancements

- [ ] Real-time video stream analysis
- [ ] Multi-drone coordination
- [ ] Advanced obstacle detection
- [ ] Autonomous flight planning
- [ ] Voice command support
- [ ] Gesture recognition

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please see CONTRIBUTING.md for guidelines.

## Support

For issues and questions:
- GitHub Issues: [link]
- Documentation: [link]
- Discord: [link]
