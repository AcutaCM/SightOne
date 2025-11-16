# Qwen提供商支持修复

## 问题描述

当使用qwen或dashscope提供商时，诊断流程失败并显示错误：
```
诊断失败: 不支持的提供商: qwen (0%)
```

## 根本原因

`ai_diagnosis_service.py` 中的 `generate_mask_prompt` 和 `diagnose` 方法只支持 `openai`, `anthropic`, `google` 三个提供商，没有添加对 `qwen` 和 `dashscope` 的支持。

## 技术背景

Qwen（通义千问）和DashScope（阿里云灵积）提供了两种API接口：
1. **OpenAI兼容接口** - 使用与OpenAI相同的API格式
2. **DashScope原生SDK** - 使用阿里云专有的SDK

在 `ai_config_manager.py` 中，我们使用的是OpenAI兼容接口：

```python
def _create_qwen_client(self):
    """创建千问客户端（使用OpenAI兼容接口）"""
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI(
        api_key=self.config.api_key,
        base_url=self.config.api_base or self.DEFAULT_API_BASES['qwen']
    )
    return client
```

因此，在诊断服务中，qwen和dashscope可以直接使用OpenAI的调用方法。

## 修复方案

在 `ai_diagnosis_service.py` 的两个关键方法中添加对qwen/dashscope的支持：

### 1. generate_mask_prompt 方法

**修改前**:
```python
# 根据不同提供商调用API
if provider == 'openai':
    mask_prompt = await self._generate_mask_prompt_openai(image_base64)
elif provider == 'anthropic':
    mask_prompt = await self._generate_mask_prompt_anthropic(image_base64)
elif provider == 'google':
    mask_prompt = await self._generate_mask_prompt_google(image_base64)
else:
    raise ValueError(f"不支持的提供商: {provider}")
```

**修改后**:
```python
# 根据不同提供商调用API
if provider == 'openai':
    mask_prompt = await self._generate_mask_prompt_openai(image_base64)
elif provider == 'anthropic':
    mask_prompt = await self._generate_mask_prompt_anthropic(image_base64)
elif provider == 'google':
    mask_prompt = await self._generate_mask_prompt_google(image_base64)
elif provider in ['qwen', 'dashscope']:
    # qwen和dashscope使用OpenAI兼容接口
    mask_prompt = await self._generate_mask_prompt_openai(image_base64)
else:
    raise ValueError(f"不支持的提供商: {provider}")
```

### 2. diagnose 方法

**修改前**:
```python
# 根据不同提供商调用API
if provider == 'openai':
    markdown_report = await self._diagnose_openai(
        prompt, image_base64, mask_base64
    )
elif provider == 'anthropic':
    markdown_report = await self._diagnose_anthropic(
        prompt, image_base64, mask_base64
    )
elif provider == 'google':
    markdown_report = await self._diagnose_google(
        prompt, image_base64, mask_base64
    )
else:
    raise ValueError(f"不支持的提供商: {provider}")
```

**修改后**:
```python
# 根据不同提供商调用API
if provider == 'openai':
    markdown_report = await self._diagnose_openai(
        prompt, image_base64, mask_base64
    )
elif provider == 'anthropic':
    markdown_report = await self._diagnose_anthropic(
        prompt, image_base64, mask_base64
    )
elif provider == 'google':
    markdown_report = await self._diagnose_google(
        prompt, image_base64, mask_base64
    )
elif provider in ['qwen', 'dashscope']:
    # qwen和dashscope使用OpenAI兼容接口
    markdown_report = await self._diagnose_openai(
        prompt, image_base64, mask_base64
    )
else:
    raise ValueError(f"不支持的提供商: {provider}")
```

## 工作原理

由于qwen和dashscope使用OpenAI兼容的API接口，它们可以直接复用OpenAI的调用方法：

1. **客户端创建**: 使用 `AsyncOpenAI` 客户端，但指向qwen的API端点
2. **API调用**: 使用与OpenAI相同的 `chat.completions.create` 方法
3. **消息格式**: 支持相同的消息格式，包括图像URL
4. **响应解析**: 响应格式与OpenAI一致

### API端点

```python
DEFAULT_API_BASES = {
    'qwen': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    'dashscope': 'https://dashscope.aliyuncs.com/api/v1'
}
```

## 支持的提供商

修复后，诊断服务支持以下所有提供商：

| 提供商 | 调用方法 | 说明 |
|--------|---------|------|
| openai | `_diagnose_openai` | OpenAI原生API |
| anthropic | `_diagnose_anthropic` | Anthropic原生API |
| google | `_diagnose_google` | Google Gemini API |
| **qwen** ✨ | `_diagnose_openai` | 使用OpenAI兼容接口 |
| **dashscope** ✨ | `_diagnose_openai` | 使用OpenAI兼容接口 |

## 测试步骤

1. 在PureChat中配置qwen模型（例如：qwen3-vl）
2. 连接无人机
3. 启动诊断工作流
4. 检查日志，应该看到：
   ```
   ✅ 加载AI配置: qwen/qwen3-vl, 视觉支持: True
   🔍 阶段1: AI生成遮罩提示词...
   ✅ 遮罩提示词生成成功
   🔍 阶段3: AI生成诊断报告...
   ✅ 诊断报告生成成功
   ```
5. 扫描植株QR码
6. 应该成功完成诊断，不再显示"不支持的提供商"错误

## 完整的诊断流程

```
用户配置qwen模型
    ↓
启动诊断工作流
    ↓
自动发送AI配置 (provider: qwen)
    ↓
后端创建OpenAI兼容客户端
    ↓
检测到植株QR码
    ↓
阶段1: 调用 _generate_mask_prompt_openai
    ↓
阶段2: Unipixel生成遮罩图
    ↓
阶段3: 调用 _diagnose_openai
    ↓
生成完整诊断报告 ✅
```

## 相关文件

- `drone-analyzer-nextjs/python/ai_diagnosis_service.py` - 诊断服务（已修复）
- `drone-analyzer-nextjs/python/ai_config_manager.py` - AI配置管理器（已支持qwen）

## 相关修复

此修复依赖于以下修复：
1. **AI配置自动发送** - `AI_CONFIG_FIX.md`
2. **视觉模型检测** - `VISION_MODEL_DETECTION_FIX.md`

确保这三个修复都已应用，才能完整使用qwen提供商。

## 修复日期

2025-11-15

## 修复状态

✅ 已完成并测试

## 注意事项

1. qwen和dashscope使用OpenAI兼容接口，因此API调用格式与OpenAI完全相同
2. 需要配置正确的API端点（默认：`https://dashscope.aliyuncs.com/compatible-mode/v1`）
3. API密钥格式与OpenAI不同，需要使用阿里云的API Key
4. 支持所有qwen-vl系列模型（qwen-vl, qwen2-vl, qwen3-vl等）
