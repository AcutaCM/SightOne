# 診斷工作流 + 病害切割快速入門

## 🚀 快速開始

### 1. 啟動 UniPixel-3B 切割服務

```bash
# 進入服務目錄
cd scripts/unipixel-local

# 安裝依賴（首次）
pip install -r requirements.txt

# 啟動服務
uvicorn server:app --host 0.0.0.0 --port 8000
```

### 2. 配置前端

在前端應用中配置 AI 提供商和模型：
- 打開 **助手設置 → AI 模型配置**
- 選擇支持視覺的模型（如 GPT-4 Vision, Claude 3 等）
- 配置 API 密鑰

### 3. 使用診斷工作流

1. **掃描二維碼**
   - 點擊 "開始掃描二維碼" 按鈕
   - 將無人機攝像頭對準植株上的二維碼

2. **自動診斷**
   - 系統自動識別植株 ID
   - 拍攝植株照片
   - 上傳至 AI 進行診斷

3. **病害切割**（自動）
   - 如果檢測到病害，系統自動提取病害描述
   - 調用 UniPixel-3B 進行精確切割
   - 返回病害區域遮罩

4. **查看報告**
   - 在右側報告面板查看診斷結果
   - 原始圖像和病害遮罩並排顯示
   - 在聊天窗口查看詳細分析

## 📊 工作流程圖

```
[QR碼掃描] → [圖像採集] → [AI診斷] → [提取病害描述] → [UniPixel切割] → [生成報告]
                                ↓                              ↓
                          [診斷結果JSON]                [病害遮罩PNG]
                                ↓                              ↓
                          [前端顯示] ← ─ ─ ─ ─ ─ ─ ─ ─ ─ [報告整合]
```

## 🔧 關鍵配置

### Python 後端
```python
# crop_diagnosis_workflow.py
workflow = CropDiagnosisWorkflow(
    chat_proxy_url="http://localhost:3000/api/chat-proxy",
    unipixel_endpoint="http://localhost:8000/infer_unipixel_base64"
)
```

### 環境變量
```bash
# .env.local
OPENAI_API_KEY=your-api-key
UNIPIXEL_ENDPOINT=http://localhost:8000/infer_unipixel_base64
```

## 📝 輸出示例

### 診斷結果
```json
{
  "plant_id": 1,
  "health_status": "患病",
  "diseases": [
    {
      "name": "葉斑病",
      "description": "葉片上的褐色斑點，邊緣不規則"
    }
  ],
  "segmentation_mask": "data:image/png;base64,...",
  "disease_description": "葉片上的褐色斑點，邊緣不規則"
}
```

### 文件輸出
```
diagnosis_data/
├── images/plant_1_20240101_120000.jpg     # 原始圖像
├── masks/mask_plant_1_20240101_120000.png # 切割遮罩
└── reports/plant_1_20240101_120000.json   # 診斷報告
```

## ❓ 常見問題

**Q: UniPixel 服務啟動失敗？**
A: 確保已安裝所有依賴，特別是 PyTorch 和相關模型文件。

**Q: 切割質量不佳？**
A: 優化 AI 診斷的病害描述質量，提供更具體的特徵描述。

**Q: 前端未顯示遮罩？**
A: 檢查報告數據結構是否包含 `segmentationMask` 字段。

## 📚 詳細文檔

- [完整工作流程文檔](./DIAGNOSIS_WORKFLOW_WITH_SEGMENTATION.md)
- [UniPixel-3B 配置](../scripts/unipixel-local/README.md)
- [API 參考](./API_REFERENCE.md)

