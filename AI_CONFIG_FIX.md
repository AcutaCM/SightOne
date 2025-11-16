# AI配置问题修复

## 问题描述

当用户启动诊断工作流时，系统显示"❌ 未配置AI模型 请在PureChat中配置模型"，即使用户已经在PureChat中配置了AI模型。

## 根本原因

前端的 `startDiagnosisWorkflow` 函数只发送了 `start_diagnosis_workflow` 消息，但没有先将localStorage中的AI配置发送给后端。后端在检测到QR码并尝试触发诊断时，会调用 `_check_ai_model_config()` 方法检查AI配置，但由于配置从未发送，所以检查失败。

## 修复方案

修改 `hooks/useDroneControl.ts` 中的 `startDiagnosisWorkflow` 函数，在启动诊断工作流之前自动读取localStorage中的AI配置并发送给后端。

### 修复内容

1. **自动读取AI配置**: 从localStorage读取所有可能的AI提供商配置（openai, anthropic, google, qwen, dashscope）
2. **自动发送配置**: 找到第一个有效的配置后，自动调用 `sendMessage('set_ai_config', config)` 发送给后端
3. **错误提示**: 如果没有找到任何配置，显示友好的错误提示

### 代码变更

**文件**: `drone-analyzer-nextjs/hooks/useDroneControl.ts`

**修改前**:
```typescript
const startDiagnosisWorkflow = useCallback(() => {
  addLog('info', '启动诊断工作流...');
  return sendMessage('start_diagnosis_workflow');
}, [sendMessage, addLog]);
```

**修改后**:
```typescript
const startDiagnosisWorkflow = useCallback(() => {
  addLog('info', '启动诊断工作流...');
  
  // 在启动诊断工作流之前，自动发送AI配置
  try {
    // 从localStorage读取AI配置
    const providers = ['openai', 'anthropic', 'google', 'qwen', 'dashscope'];
    let configSent = false;
    
    for (const provider of providers) {
      const apiKey = localStorage.getItem(`chat.apiKey.${provider}`);
      const apiBase = localStorage.getItem(`chat.apiBase.${provider}`);
      const model = localStorage.getItem(`chat.model.${provider}`);
      
      if (apiKey) {
        // 找到配置的提供商，发送配置
        const config = {
          provider,
          model: model || getDefaultModelForProvider(provider),
          api_key: apiKey,
          api_base: apiBase || undefined,
          max_tokens: 2000,
          temperature: 0.7
        };
        
        addLog('info', `自动配置AI模型: ${config.provider}/${config.model}`);
        sendMessage('set_ai_config', config);
        configSent = true;
        break;
      }
    }
    
    if (!configSent) {
      addLog('warning', '⚠️ 未找到AI配置，请在PureChat中配置模型');
      toast.error('未配置AI模型\n请在PureChat中配置模型', {
        duration: 5000,
        position: 'top-center',
        icon: '❌'
      });
    }
  } catch (error) {
    console.error('读取AI配置失败:', error);
    addLog('warning', '读取AI配置失败');
  }
  
  // 发送启动诊断工作流命令
  return sendMessage('start_diagnosis_workflow');
}, [sendMessage, addLog]);
```

## 工作流程

修复后的工作流程：

1. 用户在PureChat中配置AI模型（例如：OpenAI GPT-4 Vision）
2. 配置保存到localStorage（`chat.apiKey.openai`, `chat.model.openai` 等）
3. 用户点击"启动诊断工作流"
4. **新增**: 前端自动读取localStorage中的AI配置
5. **新增**: 前端发送 `set_ai_config` 消息给后端
6. 后端接收配置并初始化AI诊断服务
7. 前端发送 `start_diagnosis_workflow` 消息
8. 后端启用诊断工作流
9. 当检测到植株QR码时，后端检查AI配置（现在配置已存在）
10. 触发三阶段诊断流程

## 测试步骤

1. 在PureChat中配置AI模型（任意支持视觉的模型）
2. 连接无人机
3. 启动诊断工作流
4. 检查日志，应该看到"自动配置AI模型: xxx/xxx"
5. 扫描植株QR码
6. 应该成功触发诊断，不再显示"未配置AI模型"错误

## 相关文件

- `drone-analyzer-nextjs/hooks/useDroneControl.ts` - 前端修复
- `drone-analyzer-nextjs/python/drone_backend.py` - 后端处理器（已存在）
- `drone-analyzer-nextjs/python/diagnosis_workflow_manager.py` - 诊断管理器（已存在）
- `drone-analyzer-nextjs/python/ai_config_manager.py` - AI配置管理器（已存在）

## 注意事项

1. 用户必须在PureChat中至少配置一个AI提供商
2. 配置的模型必须支持视觉功能（例如：gpt-4-vision-preview, claude-3-sonnet等）
3. 如果用户配置了多个提供商，系统会使用第一个找到的配置
4. 配置会在每次启动诊断工作流时自动发送，确保配置始终是最新的

## 修复日期

2025-11-15

## 修复状态

✅ 已完成并测试

---

## 相关修复

### 视觉模型检测问题

如果你使用的是 `qwen3-vl` 等新模型，可能会遇到"模型不支持视觉"的错误。这个问题已经在另一个修复中解决：

📄 查看 `VISION_MODEL_DETECTION_FIX.md` 了解详情

**快速解决方案**:
- 系统现在会自动识别包含 `vl`, `vision` 等关键词的模型
- `qwen3-vl`, `qwen2-vl`, `qwen-vl` 等模型都会被正确识别
- 无需手动配置，系统会智能检测
