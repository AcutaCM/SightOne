# 诊断工作流完整指南

## 概述

本指南汇总了所有诊断工作流相关的修复和配置步骤，帮助你快速解决"Connection error"等问题。

---

## 🎯 快速开始

### 步骤1: 测试API连接

运行测试脚本验证你的API配置：

```bash
cd drone-analyzer-nextjs/python
python test_qwen_api.py
```

按照提示输入：
- API密钥
- API端点（默认：https://dashscope.aliyuncs.com/compatible-mode/v1）
- 模型名称（默认：qwen-vl-plus）

如果测试通过，脚本会输出配置命令。

### 步骤2: 配置浏览器

在浏览器控制台（F12）运行测试脚本输出的命令：

```javascript
localStorage.setItem('chat.apiKey.qwen', 'YOUR_API_KEY');
localStorage.setItem('chat.apiBase.qwen', 'https://dashscope.aliyuncs.com/compatible-mode/v1');
localStorage.setItem('chat.model.qwen', 'qwen-vl-plus');
location.reload();
```

### 步骤3: 启动服务

```bash
# 1. 启动Unipixel服务（在WSL中）
cd /path/to/unipixel
python app.py

# 2. 启动后端服务
cd drone-analyzer-nextjs/python
python drone_backend.py

# 3. 启动前端（新终端）
cd drone-analyzer-nextjs
npm run dev
```

### 步骤4: 测试诊断

1. 打开浏览器访问 http://localhost:3000
2. 连接无人机
3. 启动诊断工作流
4. 扫描植株QR码
5. 查看诊断结果

---

## 🔧 已修复的问题

### 1. ✅ AI配置未发送
**文档**: `AI_CONFIG_FIX.md`

**问题**: 启动诊断工作流时未发送AI配置到后端

**修复**: 自动从localStorage读取并发送配置

### 2. ✅ 视觉模型检测失败
**文档**: `VISION_MODEL_DETECTION_FIX.md`

**问题**: qwen3-vl等模型被识别为不支持视觉

**修复**: 
- 添加智能关键词检测（vl, vision等）
- 更新模型列表

### 3. ✅ Qwen提供商不支持
**文档**: `QWEN_PROVIDER_SUPPORT_FIX.md`

**问题**: 诊断服务不支持qwen提供商

**修复**: 添加qwen/dashscope支持，使用OpenAI兼容接口

### 4. ✅ Model为null
**文档**: `MODEL_NULL_FIX.md`

**问题**: localStorage中没有保存模型名称

**修复**: 
- 支持多种键名格式
- 自动使用默认模型

### 5. ✅ Unipixel HTTP 404
**文档**: 已在 `unipixel_client.py` 中修复

**问题**: 健康检查端点不存在

**修复**: 更宽容的可用性检查

### 6. ✅ 详细错误日志
**文档**: 已在 `ai_diagnosis_service.py` 中修复

**问题**: 错误信息不够详细

**修复**: 添加详细的错误日志和建议

---

## 🐛 Connection Error 故障排除

### 检查清单

- [ ] **API密钥有效**
  ```bash
  # 测试API密钥
  python test_qwen_api.py
  ```

- [ ] **API端点正确**
  ```
  正确: https://dashscope.aliyuncs.com/compatible-mode/v1
  错误: https://dashscope.aliyuncs.com/api/v1
  ```

- [ ] **模型名称正确**
  ```
  支持: qwen-vl-plus, qwen-vl-max, qwen3-vl
  不支持: qwen-turbo, qwen-plus (不支持视觉)
  ```

- [ ] **网络连接正常**
  ```bash
  curl -I https://dashscope.aliyuncs.com
  ```

- [ ] **Unipixel服务运行**
  ```bash
  curl http://localhost:8000/
  ```

- [ ] **后端服务运行**
  ```bash
  # 检查进程
  ps aux | grep drone_backend
  ```

### 常见错误

#### 错误1: Connection error

**原因**: 
- API密钥无效
- API端点错误
- 网络连接问题

**解决**:
```bash
# 1. 测试API
python test_qwen_api.py

# 2. 测试网络
curl -I https://dashscope.aliyuncs.com

# 3. 检查配置
# 在浏览器控制台运行
console.log({
  apiKey: localStorage.getItem('chat.apiKey.qwen'),
  apiBase: localStorage.getItem('chat.apiBase.qwen'),
  model: localStorage.getItem('chat.model.qwen')
});
```

#### 错误2: 401 Unauthorized

**原因**: API密钥无效或过期

**解决**:
1. 登录阿里云控制台
2. 检查API密钥状态
3. 生成新的API密钥
4. 更新localStorage配置

#### 错误3: 404 Not Found

**原因**: API端点或模型名称错误

**解决**:
```javascript
// 更正API端点
localStorage.setItem('chat.apiBase.qwen', 
  'https://dashscope.aliyuncs.com/compatible-mode/v1');

// 更正模型名称
localStorage.setItem('chat.model.qwen', 'qwen-vl-plus');

location.reload();
```

#### 错误4: Model not found

**原因**: 
- 模型名称错误
- 没有权限访问该模型

**解决**:
```javascript
// 使用正确的模型名称
localStorage.setItem('chat.model.qwen', 'qwen-vl-plus');
// 或
localStorage.setItem('chat.model.qwen', 'qwen3-vl');

location.reload();
```

---

## 📋 完整配置示例

### Qwen配置

```javascript
// 在浏览器控制台运行

// 1. 清除旧配置
localStorage.removeItem('chat.apiKey.qwen');
localStorage.removeItem('chat.apiBase.qwen');
localStorage.removeItem('chat.model.qwen');

// 2. 设置新配置
localStorage.setItem('chat.apiKey.qwen', 'sk-your-actual-api-key-here');
localStorage.setItem('chat.apiBase.qwen', 'https://dashscope.aliyuncs.com/compatible-mode/v1');
localStorage.setItem('chat.model.qwen', 'qwen-vl-plus');

// 3. 验证配置
console.log('配置已设置:', {
  apiKey: localStorage.getItem('chat.apiKey.qwen')?.substring(0, 10) + '...',
  apiBase: localStorage.getItem('chat.apiBase.qwen'),
  model: localStorage.getItem('chat.model.qwen')
});

// 4. 刷新页面
location.reload();
```

### 后端日志（成功示例）

```
✅ AI配置已更新: qwen/qwen-vl-plus
✅ 加载AI配置: qwen/qwen-vl-plus, 视觉支持: True
✅ 创建千问客户端: qwen-vl-plus
🏥 诊断工作流已启用
🔍 检测到植株 1
🔍 阶段1: AI生成遮罩提示词...
📡 调用API: qwen/qwen-vl-plus
   端点: https://dashscope.aliyuncs.com/compatible-mode/v1
   API密钥: 已设置
✅ 遮罩提示词生成成功 (耗时: 2.5秒)
   提示词: 叶片上的黄褐色斑点区域
🎨 阶段2: Unipixel正在生成遮罩图...
✅ Unipixel生成成功 (耗时: 3.2秒)
📝 阶段3: AI正在生成诊断报告...
📡 调用诊断API: qwen/qwen-vl-plus
   端点: https://dashscope.aliyuncs.com/compatible-mode/v1
   包含遮罩图: 是
✅ 诊断报告生成成功 (耗时: 5.8秒)
✅ 植株 1 诊断完成
```

---

## 🔍 调试命令

### 前端调试

```javascript
// 查看所有localStorage键
console.log('所有键:', Object.keys(localStorage));

// 查看AI配置
['qwen', 'openai', 'anthropic'].forEach(p => {
  console.log(`${p}:`, {
    apiKey: localStorage.getItem(`chat.apiKey.${p}`)?.substring(0, 10) + '...',
    model: localStorage.getItem(`chat.model.${p}`),
    apiBase: localStorage.getItem(`chat.apiBase.${p}`)
  });
});

// 查看WebSocket状态
console.log('WebSocket:', wsRef.current?.readyState);
// 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
```

### 后端调试

```bash
# 查看后端日志
cd drone-analyzer-nextjs/python
python drone_backend.py

# 查看详细错误
# 在代码中添加 import traceback; traceback.print_exc()
```

### API测试

```bash
# 测试Qwen API
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-vl-plus",
    "messages": [{"role": "user", "content": "测试"}]
  }'

# 测试Unipixel
curl http://localhost:8000/

# 测试Unipixel推理
curl -X POST http://localhost:8000/infer_unipixel_base64 \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/png;base64,iVBORw0KG...",
    "query": "测试",
    "sample_frames": 16
  }'
```

---

## 📚 相关文档

1. `AI_CONFIG_FIX.md` - AI配置自动发送修复
2. `VISION_MODEL_DETECTION_FIX.md` - 视觉模型检测修复
3. `QWEN_PROVIDER_SUPPORT_FIX.md` - Qwen提供商支持修复
4. `MODEL_NULL_FIX.md` - Model null问题修复
5. `CONNECTION_ERROR_TROUBLESHOOTING.md` - 连接错误故障排除

---

## 🎓 工作流程

```
1. 配置API
   ↓
2. 测试API连接 (test_qwen_api.py)
   ↓
3. 保存配置到localStorage
   ↓
4. 启动服务 (Unipixel + 后端 + 前端)
   ↓
5. 连接无人机
   ↓
6. 启动诊断工作流
   ↓ (自动发送AI配置)
7. 扫描植株QR码
   ↓
8. 阶段1: AI生成遮罩提示词
   ↓
9. 阶段2: Unipixel生成遮罩图
   ↓
10. 阶段3: AI生成诊断报告
   ↓
11. 显示诊断结果 ✅
```

---

## 💡 最佳实践

1. **始终先测试API** - 使用 `test_qwen_api.py` 验证配置
2. **检查后端日志** - 详细的错误信息在后端日志中
3. **使用正确的端点** - 确保使用 `/compatible-mode/v1`
4. **保持API密钥安全** - 不要在代码中硬编码
5. **定期更新模型** - 使用最新的视觉模型

---

## 🆘 获取帮助

如果问题仍然存在：

1. **运行测试脚本**: `python test_qwen_api.py`
2. **收集日志**: 保存前端控制台和后端日志
3. **检查配置**: 截图localStorage配置（隐藏API密钥）
4. **测试网络**: 确认可以访问DashScope服务

---

## 📅 最后更新

2025-11-15

## ✅ 状态

所有已知问题已修复，诊断工作流应该可以正常工作。

如果遇到"Connection error"，请：
1. 运行 `python test_qwen_api.py` 测试API
2. 检查后端日志中的详细错误信息
3. 参考本文档的故障排除部分
