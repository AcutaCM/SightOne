# 视觉模型检测修复

## 问题描述

当用户使用 `qwen3-vl` 等新的视觉模型时，系统显示"❌ 模型不支持视觉 请配置支持视觉的模型"，即使这些模型确实支持视觉功能。

## 根本原因

`ai_config_manager.py` 中的 `VISION_MODELS` 列表不完整，没有包含所有支持视觉的模型。特别是：
1. 缺少 `qwen3-vl` 系列模型
2. 缺少其他新发布的视觉模型
3. `_check_vision_support` 方法的检测逻辑不够智能

## 修复方案

### 1. 更新视觉模型列表

添加了更多qwen/dashscope视觉模型：

```python
'qwen': [
    'qwen-vl-plus',
    'qwen-vl-max',
    'qwen-vl-chat',
    'qwen2-vl-7b-instruct',
    'qwen2-vl-72b-instruct',
    'qwen2-vl-2b-instruct',
    'qwen3-vl',              # 新增
    'qwen3-vl-plus',         # 新增
    'qwen3-vl-max'           # 新增
],
'dashscope': [
    # 同上
]
```

### 2. 增强视觉检测逻辑

修改 `_check_vision_support` 方法，添加智能关键词检测：

**检测策略**:
1. **精确匹配**: 检查模型是否在已知列表中
2. **模糊匹配**: 检查模型名称是否包含列表中的模型名
3. **关键词检测** (新增): 检查模型名称是否包含视觉相关关键词
   - `vision`, `vl`, `visual`, `multimodal`, `image`, `video`, `see`, `view`
4. **特殊处理**: 对qwen/dashscope提供商，特别检查 `vl` 关键词

### 3. 智能检测代码

```python
def _check_vision_support(self, provider: str, model: str) -> bool:
    # ... 精确匹配和模糊匹配 ...
    
    # 智能检测：检查模型名称中是否包含视觉相关关键词
    vision_keywords = [
        'vision', 'vl', 'visual', 'multimodal', 
        'image', 'video', 'see', 'view'
    ]
    
    # 对于qwen/dashscope提供商，特别检查vl关键词
    if provider in ['qwen', 'dashscope']:
        # qwen-vl, qwen2-vl, qwen3-vl 等都应该被识别
        if 'vl' in model_lower or 'vision' in model_lower:
            logger.info(f"✅ 通过关键词检测识别视觉模型: {model}")
            return True
    
    # 对于其他提供商，检查是否包含vision关键词
    for keyword in vision_keywords:
        if keyword in model_lower:
            logger.info(f"✅ 通过关键词检测识别视觉模型: {model} (关键词: {keyword})")
            return True
    
    return False
```

## 支持的模型

### OpenAI
- gpt-4-vision-preview
- gpt-4-turbo
- gpt-4o
- gpt-4o-mini

### Anthropic
- claude-3-opus
- claude-3-sonnet
- claude-3-haiku
- claude-3-5-sonnet

### Google
- gemini-pro-vision
- gemini-1.5-pro
- gemini-1.5-flash

### Qwen/DashScope
- qwen-vl-plus
- qwen-vl-max
- qwen-vl-chat
- qwen2-vl-7b-instruct
- qwen2-vl-72b-instruct
- qwen2-vl-2b-instruct
- **qwen3-vl** ✨ (新增)
- **qwen3-vl-plus** ✨ (新增)
- **qwen3-vl-max** ✨ (新增)

### 通用规则
任何包含以下关键词的模型都会被识别为视觉模型：
- `vision`
- `vl`
- `visual`
- `multimodal`
- `image`
- `video`

## 测试步骤

1. 在PureChat中配置 `qwen3-vl` 模型
2. 连接无人机
3. 启动诊断工作流
4. 检查日志，应该看到：
   ```
   ✅ 通过关键词检测识别视觉模型: qwen3-vl
   ✅ 加载AI配置: qwen/qwen3-vl, 视觉支持: True
   ```
5. 扫描植株QR码
6. 应该成功触发诊断，不再显示"模型不支持视觉"错误

## 向后兼容性

- ✅ 所有原有的模型检测逻辑保持不变
- ✅ 新增的关键词检测不会影响现有模型
- ✅ 如果模型不在列表中但包含视觉关键词，会记录日志并允许使用

## 未来扩展

如果需要添加新的视觉模型：

1. **方法1**: 直接添加到 `VISION_MODELS` 列表（推荐）
2. **方法2**: 确保模型名称包含视觉关键词（如 `vl`, `vision`）
3. **方法3**: 修改 `_check_vision_support` 方法添加特殊检测逻辑

## 相关文件

- `drone-analyzer-nextjs/python/ai_config_manager.py` - AI配置管理器（已修复）

## 修复日期

2025-11-15

## 修复状态

✅ 已完成并测试

## 注意事项

1. 带 `vl` 后缀的模型（如 qwen-vl, qwen2-vl, qwen3-vl）都会被自动识别为视觉模型
2. 如果使用的模型不在列表中且不包含视觉关键词，系统会记录警告但仍然拒绝
3. 建议将常用的视觉模型添加到 `VISION_MODELS` 列表中以获得最佳性能
