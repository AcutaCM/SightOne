# Tello智能代理修改快速指南

## 快速概览

**目标**：修改ChatbotChat组件，使Tello智能代理不再连接3004后端，改为前端直接解析AI指令并在执行前询问用户确认。

## 核心变更

### 之前（使用3004后端）
```
用户输入 → WebSocket(3004) → 后端AI解析 → 后端执行 → 返回结果
```

### 之后（前端独立）
```
用户输入 → 前端AI解析 → 显示解析结果 → 检查连接 → 询问确认 → 用户确认 → 执行命令
```

## 实现文件

### 新增文件

1. **`lib/services/telloFrontendHandler.ts`** ✅ 已创建
   - 封装所有Tello前端逻辑
   - 提供解析、检查、执行、格式化等功能

2. **`docs/TELLO_AGENT_FRONTEND_ONLY_UPDATE.md`** ✅ 已创建
   - 详细的设计文档
   - 用户交互流程说明

3. **`docs/TELLO_CHATBOT_NO_3004_IMPLEMENTATION.md`** ✅ 已创建
   - 完整的实现指南
   - 包含代码示例和测试步骤

### 需要修改的文件

1. **`components/ChatbotChat/index.tsx`**
   - 导入新的处理器
   - 替换Tello处理逻辑（约第1547行）
   - 添加用户确认处理

## 修改步骤（5分钟完成）

### 1. 添加导入（1行）

在文件顶部添加：
```typescript
import { createTelloFrontendHandler } from '@/lib/services/telloFrontendHandler';
```

### 2. 替换Tello逻辑（找到第1547行附近）

**查找这段代码：**
```typescript
// 若为 Tello 智能代理，则将命令发给后端 3004 解析
if (currentAssistant?.title === 'Tello智能代理') {
```

**替换为：**
```typescript
// 若为 Tello 智能代理，使用前端处理器
if (currentAssistant?.title === 'Tello智能代理') {
  try {
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

    updateCurrentMessages(prev =>
      prev.map(m =>
        m.id === placeholderId
          ? { ...m, content: "🤖 正在分析您的指令...", thinking: "AI正在解析自然语言命令" }
          : m
      )
    );

    const parseResult = await handler.parseCommand(text);
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

    const droneStatus = await handler.checkDroneStatus();
    const backendUrl = handler.config.droneBackendUrl || "http://localhost:8765";
    
    const confirmationId = `${Date.now()}-confirm`;
    const confirmationMsg: Message = {
      id: confirmationId,
      role: "assistant",
      content: handler.formatConnectionMessage(droneStatus, backendUrl),
      typing: false
    };
    
    updateCurrentMessages(prev => [...prev, confirmationMsg]);
    
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

### 3. 添加确认处理（在Tello逻辑之后）

```typescript
// 用户确认执行
if (text === '执行' && assistantSettingsMap.__pendingTelloCommands__) {
  try {
    const commands = assistantSettingsMap.__pendingTelloCommands__ as any[];
    const backendUrl = assistantSettingsMap.__pendingTelloBackendUrl__ as string || "http://localhost:8765";
    
    const handler = createTelloFrontendHandler({
      aiProvider,
      model,
      apiKey: getStored(aiProvider, "apiKey") || "",
      baseURL: getStored(aiProvider, "apiBase") || "",
      droneBackendUrl: backendUrl
    });
    
    updateCurrentMessages(prev =>
      prev.map(m =>
        m.id === placeholderId
          ? { ...m, content: "🚀 正在执行命令...", thinking: "正在向无人机发送指令" }
          : m
      )
    );
    
    const results = await handler.executeCommands(commands);
    const resultContent = handler.formatExecutionResults(results, commands);
    
    updateCurrentMessages(prev =>
      prev.map(m =>
        m.id === placeholderId
          ? { ...m, typing: false, content: resultContent, thinking: undefined }
          : m
      )
    );
    
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

// 用户取消执行
if (text === '取消' && assistantSettingsMap.__pendingTelloCommands__) {
  updateCurrentMessages(prev =>
    prev.map(m =>
      m.id === placeholderId
        ? { ...m, typing: false, content: "✅ 已取消执行命令。", thinking: undefined }
        : m
    )
  );
  
  setAssistantSettingsMap(prev => {
    const { __pendingTelloCommands__, __pendingTelloBackendUrl__, ...rest } = prev;
    return rest;
  });
  
  setSending(false);
  return;
}
```

### 4. 删除旧代码（可选）

找到并删除所有WebSocket相关代码：
- `ws.onopen`
- `ws.onmessage`
- `ws.onerror`
- `ws.onclose`
- 心跳定时器

## 测试验证

### 快速测试

1. **启动应用**
   ```bash
   npm run dev
   ```

2. **打开Tello智能代理**
   - 在聊天界面选择"Tello智能代理"

3. **发送测试指令**
   ```
   起飞
   ```

4. **验证流程**
   - ✅ 显示"正在分析指令..."
   - ✅ 显示解析结果
   - ✅ 显示连接状态
   - ✅ 显示确认消息

5. **测试执行**
   ```
   执行
   ```
   或
   ```
   取消
   ```

## 常见问题

### Q: 提示"AI配置不完整"？
**A:** 确保在设置中配置了AI提供商和API密钥。

### Q: 提示"无人机未连接"？
**A:** 检查：
1. 无人机是否开机
2. 是否连接到无人机WiFi
3. 后端服务是否运行（http://localhost:8765）

### Q: 解析失败？
**A:** 检查：
1. AI API密钥是否有效
2. 网络连接是否正常
3. 指令是否清晰明确

### Q: 执行失败？
**A:** 检查：
1. 无人机连接状态
2. 后端服务日志
3. 命令参数是否合理

## 配置选项

### 后端URL
```javascript
localStorage.setItem("tello.backend", "http://localhost:8765");
```

### AI配置
通过聊天界面的设置面板配置：
- AI提供商（OpenAI/Azure/Ollama等）
- 模型名称
- API密钥
- 基础URL

## 优势

✅ **无需3004后端** - 简化部署  
✅ **更快响应** - 减少网络延迟  
✅ **用户控制** - 执行前可确认  
✅ **安全可靠** - 检查连接状态  
✅ **易于维护** - 逻辑集中前端  

## 下一步

- 查看完整文档：`TELLO_CHATBOT_NO_3004_IMPLEMENTATION.md`
- 测试各种指令场景
- 根据需要调整提示词
- 添加更多安全检查

## 支持

如有问题，请查看：
- 详细实现文档
- 代码注释
- 测试用例
- 错误日志

---

**修改完成后，Tello智能代理将完全独立于3004后端运行！** 🚀
