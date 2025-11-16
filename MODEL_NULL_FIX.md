# Model Null 问题修复

## 问题描述

启动诊断工作流时，后端收到的配置中 `model: null`，导致无法正确初始化AI服务。

## 根本原因

前端从localStorage读取AI配置时，可能遇到以下问题：
1. localStorage中没有保存模型名称
2. localStorage的键名格式不匹配
3. 模型值为空字符串

## 修复方案

### 1. 增强配置读取逻辑

修改 `startDiagnosisWorkflow` 函数，添加：
- ✅ 多种键名格式尝试
- ✅ 模型值验证和默认值
- ✅ 详细的调试日志
- ✅ localStorage键列表输出

### 2. 支持的键名格式

现在支持以下localStorage键名格式：

```javascript
// 格式1: chat.apiKey.{provider}
localStorage.setItem('chat.apiKey.qwen', 'sk-xxx');
localStorage.setItem('chat.model.qwen', 'qwen3-vl');

// 格式2: apiKey.{provider}
localStorage.setItem('apiKey.qwen', 'sk-xxx');
localStorage.setItem('model.qwen', 'qwen3-vl');

// 格式3: {provider}.apiKey
localStorage.setItem('qwen.apiKey', 'sk-xxx');
localStorage.setItem('qwen.model', 'qwen3-vl');

// 格式4: chat_apiKey_{provider}
localStorage.setItem('chat_apiKey_qwen', 'sk-xxx');
localStorage.setItem('chat_model_qwen', 'qwen3-vl');
```

### 3. 默认模型

如果localStorage中没有保存模型名称，系统会使用默认模型：

```typescript
const defaults: Record<string, string> = {
  openai: 'gpt-4-vision-preview',
  anthropic: 'claude-3-5-sonnet-20241022',
  google: 'gemini-1.5-pro',
  qwen: 'qwen-vl-plus',
  dashscope: 'qwen-vl-plus'
};
```

## 调试步骤

### 步骤1: 检查localStorage

在浏览器控制台（F12）运行：

```javascript
// 查看所有localStorage键
console.log('所有键:', Object.keys(localStorage));

// 查找AI相关的键
Object.keys(localStorage).filter(k => 
  k.includes('api') || k.includes('model') || k.includes('chat')
).forEach(k => console.log(k, '=', localStorage.getItem(k)));
```

### 步骤2: 手动设置配置

如果没有找到配置，手动设置：

```javascript
// 使用格式1（推荐）
localStorage.setItem('chat.apiKey.qwen', 'YOUR_API_KEY');
localStorage.setItem('chat.apiBase.qwen', 'https://dashscope.aliyuncs.com/compatible-mode/v1');
localStorage.setItem('chat.model.qwen', 'qwen-vl-plus');

// 验证
console.log('API Key:', localStorage.getItem('chat.apiKey.qwen'));
console.log('API Base:', localStorage.getItem('chat.apiBase.qwen'));
console.log('Model:', localStorage.getItem('chat.model.qwen'));

// 刷新页面
location.reload();
```

### 步骤3: 查看调试日志

启动诊断工作流后，在控制台查看：

```
🔍 发送AI配置: {
  provider: 'qwen',
  model: 'qwen-vl-plus',
  api_base: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  has_api_key: true
}
```

如果看到 `model: null`，说明配置读取失败。

### 步骤4: 检查后端日志

后端应该显示：

```
✅ 加载AI配置: qwen/qwen-vl-plus, 视觉支持: True
✅ 创建千问客户端: qwen-vl-plus
```

如果显示 `model: null`，说明前端发送的配置有问题。

## 完整配置示例

### 在浏览器控制台设置

```javascript
// 清除旧配置（可选）
['openai', 'anthropic', 'google', 'qwen', 'dashscope'].forEach(provider => {
  localStorage.removeItem(`chat.apiKey.${provider}`);
  localStorage.removeItem(`chat.apiBase.${provider}`);
  localStorage.removeItem(`chat.model.${provider}`);
});

// 设置qwen配置
localStorage.setItem('chat.apiKey.qwen', 'sk-your-actual-api-key');
localStorage.setItem('chat.apiBase.qwen', 'https://dashscope.aliyuncs.com/compatible-mode/v1');
localStorage.setItem('chat.model.qwen', 'qwen-vl-plus');

// 或者使用qwen3-vl
localStorage.setItem('chat.model.qwen', 'qwen3-vl');

// 验证配置
const config = {
  apiKey: localStorage.getItem('chat.apiKey.qwen'),
  apiBase: localStorage.getItem('chat.apiBase.qwen'),
  model: localStorage.getItem('chat.model.qwen')
};
console.log('当前配置:', config);

// 刷新页面应用配置
location.reload();
```

## 测试流程

1. **设置配置** - 在控制台设置localStorage
2. **刷新页面** - 重新加载应用
3. **连接无人机** - 建立WebSocket连接
4. **启动诊断工作流** - 点击启动按钮
5. **检查日志** - 查看控制台和后端日志
6. **扫描QR码** - 触发诊断流程

## 预期结果

### 前端控制台

```
🔍 发送AI配置: {
  provider: 'qwen',
  model: 'qwen-vl-plus',
  api_base: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  has_api_key: true
}
自动配置AI模型: qwen/qwen-vl-plus
启动诊断工作流...
```

### 后端日志

```
✅ AI配置已更新: qwen/qwen-vl-plus
✅ 加载AI配置: qwen/qwen-vl-plus, 视觉支持: True
✅ 创建千问客户端: qwen-vl-plus
🏥 诊断工作流已启用
```

## 常见问题

### Q1: 为什么model还是null？

**A**: 检查localStorage中是否真的保存了模型名称：
```javascript
console.log(localStorage.getItem('chat.model.qwen'));
```

如果返回 `null`，需要手动设置。

### Q2: 如何知道使用哪个键名格式？

**A**: 系统会自动尝试所有格式。推荐使用 `chat.{key}.{provider}` 格式。

### Q3: 可以不设置model吗？

**A**: 可以！如果不设置，系统会使用默认模型（qwen-vl-plus）。

### Q4: 如何切换模型？

**A**: 更新localStorage中的model值：
```javascript
localStorage.setItem('chat.model.qwen', 'qwen3-vl');
location.reload();
```

## 相关修复

此修复依赖于：
1. `AI_CONFIG_FIX.md` - AI配置自动发送
2. `VISION_MODEL_DETECTION_FIX.md` - 视觉模型检测
3. `QWEN_PROVIDER_SUPPORT_FIX.md` - Qwen提供商支持

## 修复日期

2025-11-15

## 修复状态

✅ 已完成
- ✅ 多种键名格式支持
- ✅ 模型默认值
- ✅ 详细调试日志
- ✅ 空值验证

## 注意事项

1. 必须设置API密钥，否则无法发送配置
2. 模型名称可以为空，会使用默认值
3. API端点可以为空，会使用默认端点
4. 刷新页面后配置才会生效
