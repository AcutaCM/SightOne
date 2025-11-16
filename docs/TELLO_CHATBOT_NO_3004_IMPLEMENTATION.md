# Tello智能代理ChatbotChat组件修改实现指南

## 概述

本文档提供了修改ChatbotChat组件的完整实现方案，使Tello智能代理不再依赖3004后端，改为前端直接解析AI指令，并在执行前检查无人机连接状态并询问用户确认。

## 已创建的文件

### 1. `lib/services/telloFrontendHandler.ts`

这是一个新的前端处理器类，封装了所有Tello相关的逻辑：

**主要功能：**
- `parseCommand()` - 解析自然语言指令
- `checkDroneStatus()` - 检查无人机连接状态
- `executeSingleCommand()` - 执行单条命令
- `executeCommands()` - 执行命令序列（带进度回调）
- `formatParseResult()` - 格式化解析结果为Markdown
- `formatConnectionMessage()` - 格式化连接状态消息
- `formatExecutionResults()` - 格式化执行结果

**使用示例：**
```typescript
import { createTelloFrontendHandler } from '@/lib/services/telloFrontendHandler';

const handler = createTelloFrontendHandler({
  aiProvider: 'openai',
  model: 'gpt-4',
  apiKey: 'sk-...',
  baseURL: 'https://api.openai.com/v1',
  droneBackendUrl: 'http://localhost:8765'
});

// 解析指令
const parseResult = await handler.parseCommand('起飞并向前飞50厘米');

// 检查连接
const status = await handler.checkDroneStatus();

// 执行命令
if (status.connected && parseResult.success) {
  const results = await handler.executeCommands(parseResult.data.commands);
}
```

## ChatbotChat组件修改步骤

### 步骤1：导入新的处理器

在`components/ChatbotChat/index.tsx`顶部添加导入：

```typescript
import { createTelloFrontendHandler } from '@/lib/services/telloFrontendHandler';
```

### 步骤2：替换Tello处理逻辑

找到`handleSend`函数中的Tello处理部分（约第1547行），将整个WebSocket逻辑替换为：

```typescript
// 若为 Tello 智能代理，使用前端处理器
if (currentAssistant?.title === 'Tello智能代理') {
  try {
    // 创建处理器
    const handler = createTelloFrontendHandler({
      aiProvider,
      model,
      apiKey: getStored(aiProvider, "apiKey") || "",
      baseURL: getStored(aiProvider, "apiBase") || "",
      endpoint: getStored(aiProvider, "apiBase") || "",
      deployment: model,
      temperature: temperature || 0.1,
      maxTokens: maxTokens || 1000,
      droneBackendUrl: (typeof window !== "undefined" ? localStorage.getItem("tello.backend") : "") || "http://localhost:8765"
    });

    // 显示"正在分析指令..."
    updateCurrentMessages(prev =>
      prev.map(m =>
        m.id === placeholderId
          ? { ...m, content: "🤖 正在分析您的指令...", thinking: "AI正在解析自然语言命令" }
          : m
      )
    );

    // 解析指令
    const parseResult = await handler.parseCommand(text);
    
    // 显示解析结果
    const analysisContent = handler.formatParseResult(parseResult);
    updateCurrentMessages(prev =>
      prev.map(m =>
        m.id === placeholderId
          ? { ...m, typing: false, content: analysisContent, thinking: undefined }
          : m
      )
    );

    if (!parseResult.success || !parseResult.data) {
      setSending(false);
      return;
    }

    // 检查无人机连接状态
    const droneStatus = await handler.checkDroneStatus();
    const backendUrl = handler.config.droneBackendUrl || "http://localhost:8765";
    
    // 显示连接状态和确认消息
    const confirmationId = `${Date.now()}-confirm`;
    const confirmationMsg: Message = {
      id: confirmationId,
      role: "assistant",
      content: handler.formatConnectionMessage(droneStatus, backendUrl),
      typing: false
    };
    
    updateCurrentMessages(prev => [...prev, confirmationMsg]);
    
    // 如果连接成功，保存待执行命令
    if (droneStatus.connected) {
      setAssistantSettingsMap(prev => ({
        ...prev,
        __pendingTelloCommands__: parseResult.data!.commands,
        __pendingTelloBackendUrl__: backendUrl
      }));
    }
    
    setSending(false);
    return;
    
  } catch (error: any) {
    updateCurrentMessages(prev =>
      prev.map(m =>
        m.id === placeholderId
          ? { ...m, typing: false, content: `❌ 处理失败：${error?.message || String(error)}`, thinking: undefined }
          : m
      )
    );
    setSending(false);
    return;
  }
}
```

### 步骤3：添加用户确认处理

在Tello处理逻辑之后，添加用户确认的处理代码：

```typescript
// 检查用户是否确认执行Tello命令
if (text === '执行' && assistantSettingsMap.__pendingTelloCommands__) {
  try {
    const commands = assistantSettingsMap.__pendingTelloCommands__ as any[];
    const backendUrl = assistantSettingsMap.__pendingTelloBackendUrl__ as string || "http://localhost:8765";
    
    // 创建处理器
    const handler = createTelloFrontendHandler({
      aiProvider,
      model,
      apiKey: getStored(aiProvider, "apiKey") || "",
      baseURL: getStored(aiProvider, "apiBase") || "",
      droneBackendUrl: backendUrl
    });
    
    // 显示执行中状态
    updateCurrentMessages(prev =>
      prev.map(m =>
        m.id === placeholderId
          ? { ...m, content: "🚀 正在执行命令...", thinking: "正在向无人机发送指令" }
          : m
      )
    );
    
    // 执行命令序列
    const results = await handler.executeCommands(commands, (index, result) => {
      // 可选：实时更新执行进度
      console.log(`命令 ${index + 1} 执行结果:`, result);
    });
    
    // 显示执行结果
    const resultContent = handler.formatExecutionResults(results, commands);
    updateCurrentMessages(prev =>
      prev.map(m =>
        m.id === placeholderId
          ? { ...m, typing: false, content: resultContent, thinking: undefined }
          : m
      )
    );
    
    // 清理待执行命令
    setAssistantSettingsMap(prev => {
      const { __pendingTelloCommands__, __pendingTelloBackendUrl__, ...rest } = prev;
      return rest;
    });
    
    setSending(false);
    return;
    
  } catch (error: any) {
    updateCurrentMessages(prev =>
      prev.map(m =>
        m.id === placeholderId
          ? { ...m, typing: false, content: `❌ 执行失败：${error?.message || String(error)}`, thinking: undefined }
          : m
      )
    );
    setSending(false);
    return;
  }
}

// 检查用户是否取消执行
if (text === '取消' && assistantSettingsMap.__pendingTelloCommands__) {
  updateCurrentMessages(prev =>
    prev.map(m =>
      m.id === placeholderId
        ? { ...m, typing: false, content: "✅ 已取消执行命令。", thinking: undefined }
        : m
    )
  );
  
  // 清理待执行命令
  setAssistantSettingsMap(prev => {
    const { __pendingTelloCommands__, __pendingTelloBackendUrl__, ...rest } = prev;
    return rest;
  });
  
  setSending(false);
  return;
}
```

### 步骤4：移除旧的WebSocket逻辑

找到并删除或注释掉所有与3004 WebSocket相关的代码，包括：
- `ws.onopen`
- `ws.onmessage`
- `ws.onerror`
- `ws.onclose`
- 心跳定时器相关代码

## 配置说明

### 后端URL配置

用户可以通过localStorage配置无人机后端地址：

```javascript
// 在浏览器控制台或代码中设置
localStorage.setItem("tello.backend", "http://localhost:8765");
```

默认值：`http://localhost:8765`

### AI配置

AI配置从现有的聊天设置中读取，无需额外配置。

## 测试步骤

### 1. 基本功能测试

```
用户输入：起飞
预期结果：
1. 显示"正在分析指令..."
2. 显示解析结果（包含起飞命令）
3. 检查连接状态
4. 显示确认消息
```

### 2. 连接状态测试

**场景A：无人机已连接**
```
预期显示：
🚁 无人机已连接！
电池电量：85%

是否立即执行上述命令？

请回复 "执行" 或 "取消"
```

**场景B：无人机未连接**
```
预期显示：
⚠️ 无人机未连接！

当前无法执行命令。请确保：
1. 无人机已开机
2. 已连接到无人机WiFi
3. 后端服务正在运行 (http://localhost:8765)

连接成功后，请重新发送指令。
```

### 3. 执行确认测试

```
用户输入：执行
预期结果：
1. 显示"正在执行命令..."
2. 逐条执行命令
3. 显示每条命令的执行结果
4. 显示总体执行状态
```

### 4. 取消测试

```
用户输入：取消
预期结果：
显示"✅ 已取消执行命令。"
```

### 5. 复杂指令测试

```
用户输入：起飞，向前飞50厘米，顺时针旋转90度，然后降落
预期结果：
解析出4条命令：
1. 起飞
2. 向前移动 (distance: 50)
3. 顺时针旋转 (degrees: 90)
4. 降落
```

## 错误处理

### AI解析失败
```
❌ 指令解析失败：无法理解指令内容
```

### 网络错误
```
❌ 处理失败：Failed to fetch
```

### 命令执行失败
```
⚠️ 命令执行中断

**[1/2] 起飞**
✅ 起飞成功

**[2/2] 向前移动**
❌ 执行失败：无人机响应超时
```

## 优势总结

1. **架构简化**：移除3004中间层，减少系统复杂度
2. **响应更快**：前端直接调用AI，减少网络往返
3. **用户控制**：执行前可查看和确认命令
4. **安全性高**：检查连接状态，避免盲目发送
5. **易于维护**：逻辑集中在前端，便于调试和修改

## 注意事项

1. **确保AI配置正确**：用户必须配置有效的AI提供商和API密钥
2. **后端API兼容**：确保8765后端支持所需的API接口
3. **错误提示清晰**：所有错误都应有明确的提示信息
4. **状态管理**：确保临时状态在使用后正确清理
5. **并发控制**：避免用户快速连续发送多条指令导致状态混乱

## 相关文档

- [Tello智能代理前端独立化更新](./TELLO_AGENT_FRONTEND_ONLY_UPDATE.md)
- [Tello AI解析器文档](./TELLO_AI_PARSER_GUIDE.md)
- [无人机后端API文档](./DRONE_BACKEND_API.md)

## 更新日期

2024-11-12
