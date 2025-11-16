# Chatbot "使用该助手进行聊天" Sidebar 集成

## 修改概述

修改了 `IntelligentAgentCard` 组件,使得点击"使用此助理"按钮时,会自动将助理添加到 sidebar 的用户助理列表中。

## 修改内容

### 文件: `components/ChatbotChat/IntelligentAgentCard.tsx`

**修改点 1: 添加必要的 context 方法**
```typescript
const { 
  getAssistantById, 
  activateAssistant, 
  userAssistants,      // 新增
  addUserAssistant     // 新增
} = useAssistants();
```

**修改点 2: 在激活前先添加到用户列表**
```typescript
const handleUseAssistant = async () => {
  try {
    setActivating(true);
    
    // 1. 先添加到用户助理列表（如果还没添加）
    const isAlreadyAdded = userAssistants.some(a => a.id === agent.id);
    
    if (!isAlreadyAdded) {
      console.log('[IntelligentAgentCard] Adding assistant to user list');
      await addUserAssistant(agent);
    } else {
      console.log('[IntelligentAgentCard] Assistant already in user list');
    }
    
    // 2. 激活助理
    const result = await activateAssistant(agent.id);
    
    // ... 其余代码保持不变
  }
}
```

## 功能说明

### 用户操作流程

1. 用户在 chatbot 市场页面看到智能代理卡片
2. 点击"使用此助理"按钮
3. 系统自动执行:
   - 检查助理是否已在用户列表中
   - 如果未添加,则添加到用户助理列表 (sidebar)
   - 激活该助理
   - 切换到聊天界面

### 技术实现

- **去重检查**: 使用 `userAssistants.some()` 检查助理是否已存在
- **添加到列表**: 调用 `addUserAssistant(agent)` 将助理添加到用户列表
- **持久化**: `addUserAssistant` 会自动保存到 localStorage
- **UI 更新**: AssistantContext 的状态更新会自动触发 sidebar 重新渲染

## 相关文件

- `components/ChatbotChat/IntelligentAgentCard.tsx` - 智能代理卡片组件
- `contexts/AssistantContext.tsx` - 助理上下文,提供 `addUserAssistant` 方法
- `components/ChatbotChat/index.tsx` - Chatbot 主组件,包含 sidebar

## 测试建议

1. 点击"使用此助理"按钮
2. 检查 sidebar 是否显示该助理
3. 检查 localStorage 中是否保存了助理 ID
4. 刷新页面,检查助理是否仍在列表中
5. 再次点击按钮,确认不会重复添加

## 注意事项

- 该功能依赖 `AssistantContext` 的 `userAssistants` 和 `addUserAssistant` 方法
- 用户助理列表存储在 localStorage 中,键名为 `userAssistants`
- 如果助理已在列表中,不会重复添加
- 添加操作是异步的,使用 `await` 确保完成后再激活

## 相关需求

- 用户可以从市场添加助理到个人列表
- 点击"使用"按钮应该同时添加和激活助理
- 避免重复添加相同的助理
- 保持用户助理列表的持久化
