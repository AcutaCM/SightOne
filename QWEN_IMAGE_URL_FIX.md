# Qwen图像URL格式修复

## 问题描述

使用Qwen API时出现错误：
```
Error code: 400 - InvalidParameter: The provided URL does not appear to be valid. 
Ensure it is correctly formatted.
```

## 根本原因

Qwen API对图像URL格式有特殊要求，必须是完整的data URL格式：
```
data:image/[type];base64,[base64_data]
```

如果缺少前缀或格式不正确，API会拒绝请求。

## 修复方案

### 1. 创建专门的Qwen方法

为Qwen创建专门的API调用方法，处理图像URL格式：

**文件**: `ai_diagnosis_service.py`

#### _generate_mask_prompt_qwen

```python
async def _generate_mask_prompt_qwen(self, image_base64: str) -> str:
    """使用Qwen生成遮罩提示词（特殊格式处理）"""
    
    # 确保图像URL格式正确
    if not image_base64.startswith('data:image/'):
        image_base64 = f"data:image/png;base64,{image_base64}"
    
    # 调用API...
```

#### _diagnose_qwen

```python
async def _diagnose_qwen(
    self,
    prompt: str,
    image_base64: str,
    mask_base64: Optional[str]
) -> str:
    """使用Qwen生成诊断报告（特殊格式处理）"""
    
    # 确保所有图像URL格式正确
    if not image_base64.startswith('data:image/'):
        image_base64 = f"data:image/png;base64,{image_base64}"
    
    if mask_base64 and not mask_base64.startswith('data:image/'):
        mask_base64 = f"data:image/png;base64,{mask_base64}"
    
    # 调用API...
```

### 2. 更新提供商路由

修改 `generate_mask_prompt` 和 `diagnose` 方法中的提供商路由：

**修改前**:
```python
elif provider in ['qwen', 'dashscope']:
    # qwen和dashscope使用OpenAI兼容接口
    mask_prompt = await self._generate_mask_prompt_openai(image_base64)
```

**修改后**:
```python
elif provider in ['qwen', 'dashscope']:
    # qwen和dashscope需要特殊的图像格式处理
    mask_prompt = await self._generate_mask_prompt_qwen(image_base64)
```

## 图像URL格式要求

### Qwen要求的格式

```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ...
```

**组成部分**:
1. `data:` - 协议前缀
2. `image/png` - MIME类型（可以是png, jpeg, jpg, webp等）
3. `;base64,` - 编码类型
4. `iVBORw0KG...` - base64编码的图像数据

### 错误的格式

❌ 缺少前缀:
```
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ...
```

❌ 缺少MIME类型:
```
data:base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ...
```

❌ HTTP URL（Qwen不支持）:
```
https://example.com/image.png
```

## 与其他提供商的区别

| 提供商 | 图像格式要求 | 说明 |
|--------|-------------|------|
| OpenAI | data URL 或 HTTP URL | 支持多种格式 |
| Anthropic | base64数据（无前缀） | 使用特殊的消息格式 |
| Google | PIL Image对象 | 需要解码base64 |
| **Qwen** | **完整data URL** | **必须包含完整前缀** |

## 测试

### 测试图像格式

```python
# 正确的格式
image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ..."

# 检查格式
assert image_base64.startswith('data:image/'), "图像URL格式错误"

# 提取MIME类型
mime_type = image_base64.split(';')[0].split(':')[1]
print(f"MIME类型: {mime_type}")  # image/png

# 提取base64数据
base64_data = image_base64.split(',')[1]
print(f"Base64长度: {len(base64_data)}")
```

### 测试API调用

```python
from ai_diagnosis_service import AIDiagnosisService
from ai_config_manager import AIConfigManager

# 创建配置
config_manager = AIConfigManager()
config_manager.load_config_from_frontend({
    'provider': 'qwen',
    'model': 'qwen-vl-plus',
    'api_key': 'YOUR_API_KEY',
    'api_base': 'https://dashscope.aliyuncs.com/compatible-mode/v1'
})

# 创建服务
service = AIDiagnosisService(config_manager)

# 测试图像（1x1红色像素）
test_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="

# 测试生成遮罩提示词
mask_prompt = await service.generate_mask_prompt(test_image)
print(f"遮罩提示词: {mask_prompt}")
```

## 错误处理

新增的错误处理会提供更详细的信息：

```python
except Exception as e:
    error_str = str(e)
    if "InvalidParameter" in error_str and "URL" in error_str:
        logger.error("   💡 Qwen图像URL格式错误")
        logger.error(f"   💡 当前格式: {image_base64[:100]}...")
        logger.error("   💡 Qwen要求: data:image/[type];base64,[data]")
```

## 预期日志

### 成功的调用

```
📡 调用Qwen API: qwen-vl-plus
   端点: https://dashscope.aliyuncs.com/compatible-mode/v1
   图像格式: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...
✅ 遮罩提示词生成成功 (耗时: 2.5秒)
   提示词: 叶片上的黄褐色斑点区域
```

### 失败的调用（格式错误）

```
❌ Qwen API调用失败: BadRequestError: Error code: 400
   💡 Qwen图像URL格式错误
   💡 当前格式: iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ...
   💡 Qwen要求: data:image/[type];base64,[data]
```

## 相关修复

此修复依赖于：
1. `QWEN_PROVIDER_SUPPORT_FIX.md` - Qwen提供商基础支持
2. `AI_CONFIG_FIX.md` - AI配置自动发送

## 修复日期

2025-11-15

## 修复状态

✅ 已完成
- ✅ 创建专门的Qwen方法
- ✅ 图像URL格式验证和修复
- ✅ 详细的错误日志
- ✅ 支持遮罩图格式处理

## 注意事项

1. Qwen API要求完整的data URL格式
2. 支持的图像类型：png, jpeg, jpg, webp
3. base64数据必须有效
4. 图像大小限制：通常不超过10MB
5. 如果图像过大，可能需要压缩

## 下一步

现在重新测试诊断工作流，应该可以成功生成诊断报告了！
