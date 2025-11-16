# VLM 模型配置與故障排除指南

## 🔍 問題：404 錯誤 - 無法調用 VLM 模型

### 問題描述
```
服務調用失敗（404）：{"error":"Upstream error: 404"}
```

### 根本原因
Python 後端發送的請求格式與 Next.js `chat-proxy` API 不兼容。

---

## ✅ 已修復的問題

### 1. **Messages 格式錯誤**
**之前（錯誤）**:
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

**修復後（正確）**:
```python
{
    "messages": [
        {
            "role": "user",
            "content": "提示詞\n\n![image](data:image/jpeg;base64,...)"  # ✅ Markdown 格式
        }
    ]
}
```

### 2. **不支持的參數**
移除了 `response_format` 參數（chat-proxy 不支持）。

### 3. **參數名稱映射**
- `max_tokens` → `maxTokens`
- `api_key` → `apiKey`
- `base_url` → `baseUrl`

---

## 🚀 配置步驟

### 步驟 1: 配置 AI 提供商

在前端配置 AI 設置：

```typescript
const aiConfig = {
  provider: "openai",         // 或 "anthropic", "gemini", "qwen" 等
  model: "gpt-4-vision-preview",  // 支持圖像的模型
  apiKey: "your-api-key",
  baseUrl: "",                // 可選，使用默認端點
  temperature: 0.7,
  maxTokens: 2048
};
```

### 步驟 2: 啟動診斷工作流

```python
from crop_diagnosis_workflow import CropDiagnosisWorkflow

workflow = CropDiagnosisWorkflow(
    chat_proxy_url="http://localhost:3000/api/chat-proxy",
    unipixel_endpoint="http://localhost:8000/infer_unipixel_base64"
)

# 設置 AI 配置
workflow.set_ai_config({
    "provider": "openai",
    "model": "gpt-4-vision-preview",
    "apiKey": "your-api-key",  # 或 api_key
    "temperature": 0.7,
    "maxTokens": 2048
})

# 啟動工作流
workflow.start_workflow()
```

---

## 🔧 支持的 AI 提供商

### OpenAI
```python
{
    "provider": "openai",
    "model": "gpt-4-vision-preview",
    "apiKey": "sk-...",
    "baseUrl": ""  # 可選
}
```

### Anthropic (Claude)
```python
{
    "provider": "anthropic",
    "model": "claude-3-opus-20240229",
    "apiKey": "sk-ant-...",
}
```

### Google Gemini
```python
{
    "provider": "gemini",
    "model": "gemini-pro-vision",
    "apiKey": "AIza...",
}
```

### 阿里通義千問 (Qwen)
```python
{
    "provider": "qwen",
    "model": "qwen-vl-plus",
    "apiKey": "sk-...",
    "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1"
}
```

### Groq
```python
{
    "provider": "groq",
    "model": "llava-v1.5-7b-4096-preview",
    "apiKey": "gsk_...",
}
```

---

## 🧪 測試配置

### 測試腳本
創建 `test_vlm_config.py`:

```python
import asyncio
import base64
import httpx

async def test_chat_proxy():
    """測試 chat-proxy API 配置"""
    
    # 1. 準備測試圖像（小的測試圖）
    # 這裡用 1x1 紅色像素的 PNG
    test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
    
    # 2. 構建請求
    request_data = {
        "provider": "openai",  # 修改為您的提供商
        "model": "gpt-4-vision-preview",  # 修改為您的模型
        "messages": [
            {
                "role": "user",
                "content": f"描述這張圖片\n\n![test](data:image/png;base64,{test_image_base64})"
            }
        ],
        "apiKey": "your-api-key-here",  # ⚠️ 替換為實際 API 密鑰
        "maxTokens": 100
    }
    
    # 3. 發送請求
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                "http://localhost:3000/api/chat-proxy",
                json=request_data
            )
            
            print(f"✅ 狀態碼: {response.status_code}")
            print(f"📦 響應: {response.json()}")
            
            if response.status_code == 200:
                result = response.json()
                content = result.get('content', '')
                print(f"\n🎉 成功！AI 回應: {content}")
            else:
                print(f"\n❌ 錯誤: {response.text}")
                
        except Exception as e:
            print(f"\n💥 異常: {e}")

# 運行測試
asyncio.run(test_chat_proxy())
```

### 運行測試
```bash
python test_vlm_config.py
```

---

## 📋 診斷檢查清單

### ✅ 檢查項目

1. **Next.js 應用運行中？**
   ```bash
   curl http://localhost:3000/api/system/health
   ```

2. **chat-proxy API 可訪問？**
   ```bash
   curl -X POST http://localhost:3000/api/chat-proxy \
     -H "Content-Type: application/json" \
     -d '{"provider":"openai","model":"gpt-4","messages":[{"role":"user","content":"test"}]}'
   ```

3. **API 密鑰有效？**
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/
   - Google: https://makersuite.google.com/app/apikey

4. **模型名稱正確？**
   - 確保模型支持圖像輸入
   - 檢查模型名稱拼寫

5. **網絡連接正常？**
   ```bash
   ping api.openai.com
   ```

---

## 🐛 常見錯誤與解決方案

### 錯誤 1: `404 Upstream error`
**原因**: API 端點不存在或模型名稱錯誤

**解決方案**:
```python
# 檢查模型名稱
"model": "gpt-4-vision-preview"  # ✅ 正確
"model": "gpt-4-vision"          # ❌ 錯誤
```

### 錯誤 2: `401 Unauthorized`
**原因**: API 密鑰無效或過期

**解決方案**:
- 重新生成 API 密鑰
- 檢查密鑰格式（OpenAI: `sk-...`）
- 確認密鑰有足夠的配額

### 錯誤 3: `400 Bad Request`
**原因**: 請求參數格式錯誤

**解決方案**:
- 確保 `messages` 格式正確
- 檢查圖像 Base64 編碼是否有效
- 驗證 Markdown 圖片語法

### 錯誤 4: `timeout`
**原因**: 請求超時

**解決方案**:
```python
# 增加超時時間
async with httpx.AsyncClient(timeout=120.0) as client:
    ...
```

---

## 📊 調試日誌

修復後的代碼會輸出詳細日誌：

```
🔍 發送診斷請求: provider=openai, model=gpt-4-vision-preview
📡 響應狀態碼: 200
✅ 診斷完成: 植株 1
```

如果出錯：
```
🔍 發送診斷請求: provider=openai, model=gpt-4-vision-preview
📡 響應狀態碼: 404
❌ API 錯誤 (404): {"error":"Upstream error: 404"}
```

---

## 🔐 環境變量配置

創建 `.env.local`:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini
GOOGLE_API_KEY=AIza...

# 阿里通義千問
DASHSCOPE_API_KEY=sk-...

# UniPixel 服務
UNIPIXEL_ENDPOINT=http://localhost:8000/infer_unipixel_base64
```

在 Python 中使用：
```python
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

workflow.set_ai_config({
    "provider": "openai",
    "apiKey": os.getenv("OPENAI_API_KEY"),
    ...
})
```

---

## 📞 獲取幫助

如果問題仍未解決：

1. 查看完整的錯誤日誌
2. 檢查網絡代理設置
3. 確認 API 服務狀態頁面
4. 聯繫技術支持

---

## 📚 相關文檔

- [chat-proxy API 源碼](../app/api/chat-proxy/route.ts)
- [診斷工作流文檔](./DIAGNOSIS_WORKFLOW_WITH_SEGMENTATION.md)
- [快速入門指南](./DIAGNOSIS_SEGMENTATION_QUICKSTART.md)

