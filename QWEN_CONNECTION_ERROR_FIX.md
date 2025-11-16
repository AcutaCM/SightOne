# Qwen API Connection Error 故障排查

## 错误信息
```
❌ Qwen诊断API调用失败: APIConnectionError: Connection error.
❌ 生成诊断报告失败: Connection error.
❌ 诊断失败: Connection error.
❌ 植株 2 诊断失败
```

## 可能原因

### 1. 网络连接问题
- 无法访问Qwen API服务器
- 防火墙阻止了连接
- 代理设置不正确

### 2. API配置问题
- API Key无效或过期
- Base URL配置错误
- API endpoint不正确

### 3. 超时问题
- 请求超时时间设置过短
- 服务器响应慢

## 解决方案

### 方案1: 检查API配置

1. **检查AI配置**
   打开浏览器开发者工具 > Application > Local Storage,查看:
   ```javascript
   localStorage.getItem('ai_config')
   ```

2. **验证配置项**
   确保包含:
   - `provider`: "qwen" 或 "dashscope"
   - `apiKey`: 有效的API密钥
   - `baseUrl`: 正确的API地址
   - `model`: 支持vision的模型名称

### 方案2: 测试API连接

在Python后端添加测试代码:

```python
# test_qwen_connection.py
import os
from openai import OpenAI

# 测试Qwen API连接
client = OpenAI(
    api_key="your-api-key",
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

try:
    response = client.chat.completions.create(
        model="qwen-vl-max",
        messages=[
            {"role": "user", "content": "Hello"}
        ]
    )
    print("✅ 连接成功:", response.choices[0].message.content)
except Exception as e:
    print("❌ 连接失败:", str(e))
```

### 方案3: 检查网络和代理

1. **测试网络连接**
   ```bash
   ping dashscope.aliyuncs.com
   ```

2. **检查代理设置**
   如果使用代理,确保Python环境变量正确:
   ```bash
   export HTTP_PROXY=http://proxy:port
   export HTTPS_PROXY=http://proxy:port
   ```

3. **禁用代理测试**
   ```bash
   unset HTTP_PROXY
   unset HTTPS_PROXY
   ```

### 方案4: 增加超时时间

修改`ai_diagnosis_service.py`中的超时设置:

```python
client = OpenAI(
    api_key=config.api_key,
    base_url=config.base_url,
    timeout=60.0  # 增加到60秒
)
```

### 方案5: 添加重试机制

```python
import time
from openai import OpenAI, APIConnectionError

def call_with_retry(func, max_retries=3, delay=2):
    """带重试的API调用"""
    for attempt in range(max_retries):
        try:
            return func()
        except APIConnectionError as e:
            if attempt < max_retries - 1:
                logger.warning(f"连接失败,{delay}秒后重试... (尝试 {attempt + 1}/{max_retries})")
                time.sleep(delay)
                delay *= 2  # 指数退避
            else:
                raise e
```

### 方案6: 使用备用endpoint

如果主endpoint不可用,尝试备用地址:

```python
# 主endpoint
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"

# 备用endpoint (如果有)
# base_url = "https://api.qwen.aliyun.com/v1"
```

## 调试步骤

### 1. 启用详细日志

在`ai_diagnosis_service.py`开头添加:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
```

### 2. 打印请求详情

```python
logger.debug(f"API Base URL: {config.base_url}")
logger.debug(f"Model: {config.model}")
logger.debug(f"API Key (前6位): {config.api_key[:6]}...")
```

### 3. 捕获详细错误

```python
try:
    response = client.chat.completions.create(...)
except APIConnectionError as e:
    logger.error(f"连接错误详情: {e}")
    logger.error(f"错误类型: {type(e)}")
    logger.error(f"错误参数: {e.args}")
    raise
```

## 常见问题

### Q1: API Key是否正确?
**检查方法:**
- 登录阿里云控制台
- 查看DashScope API密钥
- 确认密钥未过期且有足够额度

### Q2: Base URL是否正确?
**正确格式:**
- Qwen/DashScope: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- 注意末尾不要有斜杠

### Q3: 模型名称是否支持vision?
**支持vision的模型:**
- `qwen-vl-max`
- `qwen-vl-plus`
- `qwen-vl-v1`

### Q4: 是否在中国大陆?
如果在中国大陆,可能需要:
- 使用国内网络
- 或配置正确的代理

### Q5: 防火墙是否阻止?
**检查方法:**
```bash
curl -I https://dashscope.aliyuncs.com
```

## 临时解决方案

如果无法立即解决连接问题,可以:

1. **使用Mock数据测试UI**
   ```python
   # 返回模拟报告用于测试
   return DiagnosisReport(
       id=f"demo_{plant_id}_{int(time.time()*1000)}",
       plant_id=plant_id,
       timestamp=datetime.now().isoformat(),
       original_image=original_image_base64,
       mask_image=None,
       mask_prompt="模拟遮罩提示词",
       markdown_report="# 模拟诊断报告\n\n这是一个测试报告。",
       summary="模拟诊断摘要",
       severity="low",
       diseases=[],
       recommendations=["这是模拟建议"],
       ai_model="qwen-vl-max (模拟)",
       confidence=0.85,
       processing_time=1.0
   )
   ```

2. **切换到其他AI服务**
   - OpenAI GPT-4 Vision
   - Claude 3
   - Google Gemini Vision

## 联系支持

如果以上方案都无法解决:

1. **阿里云工单**
   - 登录阿里云控制台
   - 提交技术支持工单
   - 描述连接错误详情

2. **检查服务状态**
   - 访问阿里云状态页面
   - 查看DashScope服务是否正常

3. **社区求助**
   - 阿里云开发者社区
   - GitHub Issues

## 相关文档
- [DashScope API文档](https://help.aliyun.com/zh/dashscope/)
- [Qwen VL模型文档](https://help.aliyun.com/zh/dashscope/developer-reference/qwen-vl-api)
- CONNECTION_ERROR_TROUBLESHOOTING.md
