# 连接错误故障排除指南

## 错误信息

```
❌ 生成遮罩提示词失败: Connection error.
⚠️ AI生成遮罩提示词失败: Connection error.
⚠️ Unipixel服务不可用 (HTTP 404)
⚠️ Unipixel服务不可用
❌ 生成诊断报告失败: Connection error.
❌ 诊断失败: Connection error.
❌ 植株 1 诊断失败
```

## 问题分析

### 1. AI Connection Error

**可能原因**:
- ❌ API密钥无效或过期
- ❌ API端点配置错误
- ❌ 网络连接问题
- ❌ API服务不可用
- ❌ 请求格式不正确

### 2. Unipixel HTTP 404

**已修复**: Unipixel服务可用性检查现在更宽容，会正确识别服务状态。

## 解决方案

### 步骤1: 检查AI配置

#### 1.1 检查API密钥

在浏览器控制台中运行：

```javascript
// 检查qwen配置
console.log('API Key:', localStorage.getItem('chat.apiKey.qwen'));
console.log('API Base:', localStorage.getItem('chat.apiBase.qwen'));
console.log('Model:', localStorage.getItem('chat.model.qwen'));
```

**正确的配置示例**:
```
API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxx
API Base: https://dashscope.aliyuncs.com/compatible-mode/v1
Model: qwen3-vl
```

#### 1.2 验证API密钥

确保你的API密钥：
- ✅ 是有效的阿里云DashScope API密钥
- ✅ 没有过期
- ✅ 有足够的配额
- ✅ 有访问qwen-vl模型的权限

#### 1.3 检查API端点

对于qwen提供商，正确的端点应该是：
```
https://dashscope.aliyuncs.com/compatible-mode/v1
```

**注意**: 不要包含 `/chat/completions` 后缀，客户端会自动添加。

### 步骤2: 测试API连接

#### 2.1 使用curl测试

```bash
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-vl",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "测试"}
        ]
      }
    ]
  }'
```

如果返回错误，说明API配置有问题。

#### 2.2 检查网络连接

```bash
# 测试能否访问DashScope
ping dashscope.aliyuncs.com

# 测试HTTPS连接
curl -I https://dashscope.aliyuncs.com
```

### 步骤3: 检查Unipixel服务

#### 3.1 确认Unipixel正在运行

```bash
# 检查Unipixel服务状态
curl http://localhost:8000/

# 测试推理端点
curl -X POST http://localhost:8000/infer_unipixel_base64 \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/png;base64,iVBORw0KG...",
    "query": "测试",
    "sample_frames": 16
  }'
```

#### 3.2 启动Unipixel服务

如果服务未运行，启动它：

```bash
# 在WSL中
cd /path/to/unipixel
python app.py

# 或使用uvicorn
uvicorn app:app --host 0.0.0.0 --port 8000
```

### 步骤4: 查看详细日志

#### 4.1 后端日志

运行后端时查看详细日志：

```bash
cd drone-analyzer-nextjs/python
python drone_backend.py
```

查找以下信息：
- ✅ `创建千问客户端: qwen3-vl`
- ✅ `加载AI配置: qwen/qwen3-vl, 视觉支持: True`
- ❌ 任何包含 "Connection error" 的错误

#### 4.2 前端日志

打开浏览器开发者工具（F12），查看：
- **Console**: JavaScript错误和日志
- **Network**: WebSocket消息和HTTP请求
- **Application > Local Storage**: 检查配置是否正确保存

### 步骤5: 常见问题修复

#### 问题1: API密钥格式错误

**症状**: `Connection error` 或 `401 Unauthorized`

**解决**:
```javascript
// 在PureChat中重新配置
// 确保API密钥格式正确，没有多余的空格或换行
localStorage.setItem('chat.apiKey.qwen', 'sk-your-actual-key');
```

#### 问题2: API端点错误

**症状**: `Connection error` 或 `404 Not Found`

**解决**:
```javascript
// 设置正确的端点
localStorage.setItem('chat.apiBase.qwen', 'https://dashscope.aliyuncs.com/compatible-mode/v1');
```

#### 问题3: 模型名称错误

**症状**: `Model not found` 或 `Invalid model`

**解决**:
```javascript
// 使用正确的模型名称
localStorage.setItem('chat.model.qwen', 'qwen-vl-plus');
// 或
localStorage.setItem('chat.model.qwen', 'qwen3-vl');
```

#### 问题4: Unipixel端口被占用

**症状**: Unipixel无法启动或连接失败

**解决**:
```bash
# 检查端口占用
netstat -ano | findstr :8000

# 杀死占用进程或使用其他端口
# 如果使用其他端口，需要更新配置
```

### 步骤6: 重新配置

如果以上都不行，尝试完全重新配置：

```javascript
// 1. 清除所有AI配置
localStorage.removeItem('chat.apiKey.qwen');
localStorage.removeItem('chat.apiBase.qwen');
localStorage.removeItem('chat.model.qwen');

// 2. 重新配置
localStorage.setItem('chat.apiKey.qwen', 'YOUR_VALID_API_KEY');
localStorage.setItem('chat.apiBase.qwen', 'https://dashscope.aliyuncs.com/compatible-mode/v1');
localStorage.setItem('chat.model.qwen', 'qwen-vl-plus');

// 3. 刷新页面
location.reload();
```

## 调试检查清单

- [ ] API密钥有效且未过期
- [ ] API端点配置正确
- [ ] 模型名称正确
- [ ] 网络连接正常
- [ ] Unipixel服务正在运行
- [ ] 端口8000未被占用
- [ ] 后端服务正在运行
- [ ] WebSocket连接正常
- [ ] 浏览器控制台无错误

## 成功的配置示例

### Qwen配置

```javascript
{
  provider: 'qwen',
  model: 'qwen-vl-plus',  // 或 'qwen3-vl'
  api_key: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx',
  api_base: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  max_tokens: 2000,
  temperature: 0.7
}
```

### Unipixel配置

```python
endpoint = "http://localhost:8000/infer_unipixel_base64"
timeout = 30
max_retries = 3
```

## 获取帮助

如果问题仍然存在：

1. **收集日志**: 保存后端和前端的完整日志
2. **检查配置**: 截图你的配置（隐藏API密钥）
3. **测试API**: 使用curl测试API是否可访问
4. **检查网络**: 确认可以访问DashScope服务

## 相关文档

- `AI_CONFIG_FIX.md` - AI配置自动发送修复
- `VISION_MODEL_DETECTION_FIX.md` - 视觉模型检测修复
- `QWEN_PROVIDER_SUPPORT_FIX.md` - Qwen提供商支持修复

## 修复状态

✅ Unipixel可用性检查已修复
⚠️ AI连接错误需要检查配置

## 最后更新

2025-11-15
