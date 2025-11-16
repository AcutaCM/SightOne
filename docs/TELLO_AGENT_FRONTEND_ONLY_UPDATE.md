# Tello智能代理前端独立化更新

## 概述

本文档说明如何修改ChatbotChat组件，使Tello智能代理不再依赖3004后端，改为使用前端AI解析器直接处理指令，并在执行前检查无人机连接状态并询问用户确认。

## 修改目标

1. **移除3004后端依赖**：不再使用WebSocket连接到ws://127.0.0.1:3004
2. **前端AI解析**：直接使用`telloAIParser.ts`在前端解析自然语言指令
3. **连接状态检查**：在执行前检查无人机是否连接（通过8765后端API）
4. **用户确认机制**：解析完成后询问用户是否执行，用户回复"执行"或"取消"

## 实现方案

### 1. 修改handleSend函数中的Tello逻辑

**位置**：`drone-analyzer-nextjs/components/ChatbotChat/index.tsx` 第1547行附近

**原逻辑**：
```typescript
// 若为 Tello 智能代理，则将命令发给后端 3004 解析
if (currentAssistant?.title === 'Tello智能代理') {
  // 创建WebSocket连接到3004端口
  const ws = new WebSocket("ws://127.0.0.1:3004");
  // ... WebSocket通信逻辑
}
```

**新逻辑**：
```typescript
// 若为 Tello 智能代理，使用前端AI解析器直接解析命令
if (currentAssistant?.title === 'Tello智能代理') {
  // 1. 导入AI解析器
  const { createTelloAIParser } = await import('@/lib/services/telloAIParser');
  
  // 2. 构建AI配置
  const aiConfig = {
    provider: aiProvider,
    model,
    apiKey: getStored(aiProvider, "apiKey"),
    baseURL: getStored(aiProvider, "apiBase"),
    // ... 其他配置
  };
  
  // 3. 创建解析器并解析指令
  const parser = createTelloAIParser(aiConfig);
  const parseResult = await parser.parse(text);
  
  // 4. 显示解析结果
  // 包括：命令序列、安全检查、预计时间、电量消耗
  
  // 5. 检查无人机连接状态
  const droneBackendUrl = "http://localhost:8765";
  const statusResponse = await fetch(`${droneBackendUrl}/api/drone/status`);
  const isDroneConnected = statusResponse.ok && status.connected;
  
  // 6. 询问用户是否执行
  if (isDroneConnected) {
    // 显示确认消息："是否立即执行？请回复'执行'或'取消'"
    // 保存待执行命令到临时状态
  } else {
    // 显示未连接提示
  }
}
```

### 2. 添加用户确认处理逻辑

在handleSend函数中添加对用户回复"执行"或"取消"的处理：

```typescript
// 检查用户是否在确认执行Tello命令
if (text === '执行' && assistantSettingsMap.__pendingTelloCommands__) {
  const commands = assistantSettingsMap.__pendingTelloCommands__;
  const backendUrl = assistantSettingsMap.__pendingTelloBackendUrl__;
  
  // 执行命令序列
  for (const cmd of commands) {
    const response = await fetch(`${backendUrl}/api/drone/command`, {
      method: 'POST',
      body: JSON.stringify({
        action: cmd.action,
        parameters: cmd.params
      })
    });
    
    // 显示执行结果
    // 如果失败则中断
  }
  
  // 清理待执行命令
  delete assistantSettingsMap.__pendingTelloCommands__;
}

// 检查用户是否取消执行
if (text === '取消' && assistantSettingsMap.__pendingTelloCommands__) {
  // 显示取消消息
  // 清理待执行命令
}
```

### 3. 临时状态管理

使用`assistantSettingsMap`存储待执行的命令：

```typescript
// 保存待执行命令
setAssistantSettingsMap(prev => ({
  ...prev,
  __pendingTelloCommands__: commands,      // 命令数组
  __pendingTelloBackendUrl__: backendUrl   // 后端URL
}));

// 清理待执行命令
setAssistantSettingsMap(prev => {
  const { __pendingTelloCommands__, __pendingTelloBackendUrl__, ...rest } = prev;
  return rest;
});
```

## 用户交互流程

### 场景1：无人机已连接

1. **用户**：起飞并向前飞50厘米
2. **AI解析**：
   ```
   ✅ 指令解析成功！
   
   **解析出的命令序列：**
   1. 起飞 (takeoff)
   2. 向前移动 (move_forward, distance: 50)
   
   **安全检查：**
   - 确保周围无障碍物
   - 确保电量充足
   
   **预计执行时间：** 7 秒
   **预计电量消耗：** 15%
   ```
3. **系统确认**：
   ```
   🚁 无人机已连接！是否立即执行上述命令？
   
   请回复 "执行" 或 "取消"
   ```
4. **用户**：执行
5. **系统执行**：
   ```
   🚀 正在执行命令...
   
   **[1/2] 起飞**
   ✅ 起飞成功
   
   **[2/2] 向前移动**
   ✅ 向前移动50厘米完成
   
   ✅ 所有命令执行完成！
   ```

### 场景2：无人机未连接

1. **用户**：起飞并向前飞50厘米
2. **AI解析**：（同上）
3. **系统提示**：
   ```
   ⚠️ 无人机未连接！
   
   当前无法执行命令。请确保：
   1. 无人机已开机
   2. 已连接到无人机WiFi
   3. 后端服务正在运行 (http://localhost:8765)
   
   连接成功后，请重新发送指令。
   ```

### 场景3：用户取消执行

1. **用户**：起飞
2. **AI解析**：（显示解析结果）
3. **系统确认**：是否执行？
4. **用户**：取消
5. **系统**：✅ 已取消执行命令。

## 配置说明

### 后端URL配置

用户可以通过localStorage配置无人机后端地址：

```javascript
localStorage.setItem("tello.backend", "http://localhost:8765");
```

默认值：`http://localhost:8765`

### AI配置

AI配置从现有的聊天设置中读取：
- `aiProvider`: AI提供商（openai/azure/ollama等）
- `model`: 模型名称
- `apiKey`: API密钥
- `baseURL`: API基础URL
- `temperature`: 温度参数（默认0.1）
- `maxTokens`: 最大token数（默认1000）

## 优势

1. **简化架构**：移除3004中间层，减少依赖
2. **更快响应**：前端直接调用AI，减少网络延迟
3. **更好控制**：用户可以在执行前查看和确认命令
4. **安全性提升**：执行前检查连接状态，避免盲目发送命令
5. **用户体验**：清晰的交互流程，用户可以随时取消

## 注意事项

1. **AI配置必须正确**：确保用户已配置有效的AI提供商和API密钥
2. **后端API兼容性**：确保8765后端支持`/api/drone/status`和`/api/drone/command`接口
3. **错误处理**：妥善处理AI解析失败、网络错误、命令执行失败等情况
4. **状态清理**：确保在执行完成或取消后清理临时状态

## 测试建议

1. **AI解析测试**：测试各种自然语言指令的解析准确性
2. **连接状态测试**：测试无人机连接和未连接两种情况
3. **用户确认测试**：测试"执行"和"取消"两种响应
4. **错误处理测试**：测试各种异常情况的处理
5. **并发测试**：测试快速连续发送多条指令的情况

## 后续优化

1. **命令历史**：保存执行过的命令历史
2. **批量执行**：支持一次解析多条指令并批量执行
3. **实时状态**：在执行过程中实时显示无人机状态
4. **语音控制**：集成语音输入功能
5. **可视化**：显示无人机飞行轨迹的3D可视化

## 相关文件

- `drone-analyzer-nextjs/components/ChatbotChat/index.tsx` - 主聊天组件
- `drone-analyzer-nextjs/lib/services/telloAIParser.ts` - AI解析器
- `drone-analyzer-nextjs/hooks/useTelloChat.ts` - Tello聊天Hook（可能需要更新）
- `drone-analyzer-nextjs/python/drone_backend.py` - 无人机后端服务（8765端口）

## 更新日期

2024-01-XX
