# VLM API 404 錯誤修復報告

## 🐛 問題描述

**錯誤信息**:
```
服務調用失敗（404）：{"error":"Upstream error: 404"}
配置好雲端後仍無法調用 VLM 模型
```

## 🔍 根本原因

Python 後端 (`crop_diagnosis_workflow.py`) 發送的請求格式與 Next.js `chat-proxy` API 不兼容：

### 問題 1: Messages 格式錯誤
**錯誤的格式** (OpenAI 原生格式):
```python
{
    "messages": [
        {
            "role": "user",
            "content": [  # ❌ 數組格式
                {"type": "text", "text": "..."},
                {"type": "image_url", "image_url": {...}}
            ]
        }
    ]
}
```

`chat-proxy` 期望的是 **Markdown 格式**的圖片嵌入，而不是 OpenAI 的多模態數組格式。

### 問題 2: 不支持的參數
- `response_format` 參數在 `chat-proxy` 中不存在
- 參數名稱不匹配：`max_tokens` vs `maxTokens`

## ✅ 修復方案

### 1. 更新 `_call_vlm_api` 方法

**文件**: `drone-analyzer-nextjs/python/crop_diagnosis_workflow.py`

**修改內容**:

```python
async def _call_vlm_api(self, image_base64: str, plant_id: int) -> Optional[Dict]:
    # 構建 Markdown 格式的圖片嵌入
    image_data_url = f"data:image/jpeg;base64,{image_base64}"
    content_with_image = f"{prompt}\n\n![植株图像]({image_data_url})"
    
    # 符合 chat-proxy API 格式的請求
    request_data = {
        "provider": self.ai_config.get("provider", "openai"),
        "model": self.ai_config.get("model", "gpt-4-vision-preview"),
        "messages": [
            {
                "role": "user",
                "content": content_with_image  # ✅ 字符串格式，包含 Markdown 圖片
            }
        ],
        "temperature": self.ai_config.get("temperature", 0.7),
        "maxTokens": self.ai_config.get("maxTokens", self.ai_config.get("max_tokens", 2048)),
        "apiKey": self.ai_config.get("apiKey", self.ai_config.get("api_key", "")),
        "baseUrl": self.ai_config.get("baseUrl", self.ai_config.get("base_url", ""))
    }
    
    # 移除空值
    request_data = {k: v for k, v in request_data.items() if v}
    
    # 發送請求並處理響應
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(self.chat_proxy_url, json=request_data)
        
        if response.status_code != 200:
            print(f"❌ API 錯誤 ({response.status_code}): {response.text}")
            return None
        
        result = response.json()
        content = result.get('content', '')  # ✅ chat-proxy 返回格式
        
        # 解析 JSON
        return json.loads(content)
```

### 2. 參數名稱映射

支持兩種命名風格：

| Python 風格 | JavaScript 風格 |
|------------|----------------|
| `api_key`  | `apiKey`       |
| `base_url` | `baseUrl`      |
| `max_tokens` | `maxTokens`  |

### 3. 添加調試日誌

```python
print(f"🔍 發送診斷請求: provider={request_data.get('provider')}, model={request_data.get('model')}")
print(f"📡 響應狀態碼: {response.status_code}")
```

## 📝 使用說明

### 1. 配置 AI 模型

```python
workflow.set_ai_config({
    "provider": "openai",  # 或 anthropic, gemini, qwen 等
    "model": "gpt-4-vision-preview",
    "apiKey": "sk-...",  # 或使用 api_key
    "temperature": 0.7,
    "maxTokens": 2048
})
```

### 2. 測試配置

運行測試腳本：
```bash
python test_vlm_config.py openai gpt-4-vision-preview sk-your-api-key
```

### 3. 查看日誌

正常輸出：
```
🔍 發送診斷請求: provider=openai, model=gpt-4-vision-preview
📡 響應狀態碼: 200
✅ 診斷完成: 植株 1
```

錯誤輸出：
```
🔍 發送診斷請求: provider=openai, model=gpt-4-vision-preview
📡 響應狀態碼: 404
❌ API 錯誤 (404): {"error":"Upstream error: 404"}
```

## 🎯 支持的 AI 提供商

### OpenAI
```python
{
    "provider": "openai",
    "model": "gpt-4-vision-preview",
    "apiKey": "sk-..."
}
```

### Anthropic (Claude)
```python
{
    "provider": "anthropic",
    "model": "claude-3-opus-20240229",
    "apiKey": "sk-ant-..."
}
```

### Google Gemini
```python
{
    "provider": "gemini",
    "model": "gemini-pro-vision",
    "apiKey": "AIza..."
}
```

### 阿里通義千問 (Qwen VL)
```python
{
    "provider": "qwen",
    "model": "qwen-vl-plus",
    "apiKey": "sk-...",
    "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1"
}
```

## 📦 修改的文件

### 1. Python 後端
- ✅ `drone-analyzer-nextjs/python/crop_diagnosis_workflow.py`
  - 修復 `_call_vlm_api` 方法
  - 使用 Markdown 格式圖片嵌入
  - 移除不支持的參數
  - 添加調試日誌

### 2. 測試工具
- ✅ `drone-analyzer-nextjs/test_vlm_config.py` - VLM 配置測試腳本

### 3. 文檔
- ✅ `drone-analyzer-nextjs/docs/VLM_CONFIGURATION_GUIDE.md` - 完整配置指南
- ✅ `drone-analyzer-nextjs/VLM_API_FIX.md` - 本修復報告

## 🔧 故障排除

### 錯誤 1: 404 Upstream error
**原因**: 模型名稱錯誤或端點不存在

**解決**:
- 檢查模型名稱拼寫
- 確認模型支持圖像輸入
- 驗證 API 端點

### 錯誤 2: 401 Unauthorized
**原因**: API 密鑰無效

**解決**:
- 重新生成 API 密鑰
- 檢查配額是否充足

### 錯誤 3: 連接錯誤
**原因**: Next.js 應用未運行

**解決**:
```bash
cd drone-analyzer-nextjs
npm run dev
```

## 📚 相關文檔

- [VLM 配置指南](./docs/VLM_CONFIGURATION_GUIDE.md)
- [診斷工作流文檔](./docs/DIAGNOSIS_WORKFLOW_WITH_SEGMENTATION.md)
- [chat-proxy API 源碼](./app/api/chat-proxy/route.ts)

## ✅ 驗證步驟

1. **測試 chat-proxy API**
   ```bash
   python test_vlm_config.py openai gpt-4-vision-preview YOUR_API_KEY
   ```

2. **運行診斷工作流**
   ```python
   workflow = CropDiagnosisWorkflow()
   workflow.set_ai_config({
       "provider": "openai",
       "model": "gpt-4-vision-preview",
       "apiKey": "sk-..."
   })
   ```

3. **查看日誌輸出**
   - 確認狀態碼為 200
   - 驗證返回內容正確

---

**修復狀態**: ✅ 已完成  
**測試狀態**: 待用戶驗證  
**文檔狀態**: ✅ 已完善

