# 農作物診斷工作流 - UniPixel-3B 病害切割整合

## 概述

本文檔說明整合了 UniPixel-3B 病害切割功能的農作物診斷工作流程。該工作流在原有的 AI 診斷基礎上，增加了精確的病害區域分割功能，提供更詳細的病害定位信息。

## 工作流程

### 1. QR 碼掃描與植株識別
- 無人機攝像頭掃描植株上的二維碼
- 自動識別植株 ID

### 2. 圖像採集
- 系統自動拍攝植株照片
- 將圖像編碼為 Base64 格式

### 3. AI 診斷分析
- 將圖像上傳至配置的 VLM（視覺語言模型）
- AI 分析植株健康狀況
- 返回結構化診斷結果，包括：
  - 健康狀態評分
  - 病害檢測結果
  - 病害詳細描述（**用於後續切割**）
  - 防治建議

### 4. 病害區域切割（新增）
**僅在檢測到病害時執行**

- 從診斷結果中提取病害描述
- 調用 UniPixel-3B 切割服務
- 使用病害描述作為提示詞進行精確分割
- 返回病害區域遮罩圖

### 5. 報告生成
- 整合診斷結果和切割遮罩
- 保存完整報告到本地
- 在前端顯示診斷結果和病害切割可視化

## 數據結構

### DiagnosisReport

```python
@dataclass
class DiagnosisReport:
    """診斷報告數據類"""
    plant_id: int                           # 植株ID
    timestamp: str                          # 診斷時間戳
    image_path: str                         # 原始圖像路徑
    diagnosis_result: Dict                  # AI診斷結果
    qr_location: List[int]                  # QR碼位置 [x, y]
    segmentation_mask: Optional[str] = None # Base64編碼的病害切割遮罩
    disease_description: Optional[str] = None # 病害描述（用於切割）
```

### 診斷結果格式

```json
{
  "plant_id": 1,
  "health_status": "患病",
  "confidence": 0.85,
  "diseases": [
    {
      "name": "葉斑病",
      "severity": "中度",
      "affected_parts": ["葉片"],
      "confidence": 0.82,
      "description": "葉片上的褐色斑點，邊緣不規則，主要集中在葉片中部"
    }
  ],
  "recommendations": [
    "噴灑銅基殺菌劑",
    "改善通風條件",
    "減少葉面濕度"
  ],
  "overall_assessment": "植株整體生長良好，但檢測到中度葉斑病感染",
  "urgency": "中"
}
```

## API 端點

### 1. AI 診斷 API
**端點**: `POST /api/chat-proxy`

```typescript
// 請求
{
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "診斷提示詞..."
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,..."
          }
        }
      ]
    }
  ],
  "response_format": {"type": "json_object"},
  "provider": "openai",
  "model": "gpt-4-vision-preview"
}
```

### 2. UniPixel-3B 切割 API
**端點**: `POST http://localhost:8000/infer_unipixel_base64`

```typescript
// 請求
{
  "imageBase64": "data:image/jpeg;base64,...",
  "query": "葉片上的褐色斑點，邊緣不規則",
  "sample_frames": 16
}

// 響應
{
  "mask": "data:image/png;base64,...",
  "description": "模型返回的描述（可選）"
}
```

## 配置說明

### Python 後端配置

```python
workflow = CropDiagnosisWorkflow(
    chat_proxy_url="http://localhost:3000/api/chat-proxy",
    unipixel_endpoint="http://localhost:8000/infer_unipixel_base64",
    save_dir="./diagnosis_data"
)

# 設置 AI 配置
workflow.set_ai_config({
    "provider": "openai",
    "model": "gpt-4-vision-preview",
    "api_key": "your-api-key",
    "max_tokens": 1000
})
```

### UniPixel-3B 服務啟動

1. 進入服務目錄：
```bash
cd scripts/unipixel-local
```

2. 啟動服務：
```bash
uvicorn server:app --host 0.0.0.0 --port 8000
```

3. 驗證服務：
```bash
curl http://localhost:8000/health
```

## 文件結構

診斷工作流會在指定目錄下創建以下結構：

```
diagnosis_data/
├── images/                          # 原始植株圖像
│   ├── plant_1_20240101_120000.jpg
│   └── plant_2_20240101_120100.jpg
├── masks/                           # 病害切割遮罩
│   ├── mask_plant_1_20240101_120000.png
│   └── mask_plant_2_20240101_120100.png
└── reports/                         # 診斷報告
    ├── plant_1_20240101_120000.json
    ├── plant_1_20240101_120000.html
    └── plant_2_20240101_120100.json
```

## 前端整合

### 報告面板顯示

報告面板會自動顯示：
- 原始植株圖像
- 診斷結果詳情
- 病害切割遮罩（並排對比顯示）
- 病害描述標籤

### 聊天機器人通知

診斷完成後，聊天機器人會顯示：
```
✅ 植株 001 分析完成！
健康評分: 65/100
⚠️ 檢測到病害: 葉斑病
置信度: 82.0%
病害特征: 葉片上的褐色斑點，邊緣不規則
🎯 病害區域已完成AI切割分析

建議措施:
1. 噴灑銅基殺菌劑
2. 改善通風條件
3. 減少葉面濕度
```

## 使用示例

### 1. 啟動診斷工作流

```python
# 初始化工作流
workflow = CropDiagnosisWorkflow(
    unipixel_endpoint="http://localhost:8000/infer_unipixel_base64"
)

# 設置 AI 配置
workflow.set_ai_config({
    "provider": "openai",
    "model": "gpt-4-vision-preview",
    "api_key": os.getenv("OPENAI_API_KEY")
})

# 啟動工作流
workflow.start_workflow()
```

### 2. 處理單幀診斷

```python
# 從攝像頭獲取圖像
frame = camera.capture()

# 處理圖像（自動檢測QR碼並觸發診斷）
annotated_frame, report = await workflow.process_frame(frame)

# 查看報告
if report:
    print(f"植株 {report.plant_id} 診斷完成")
    print(f"健康狀態: {report.diagnosis_result['health_status']}")
    
    if report.segmentation_mask:
        print("✅ 病害區域切割已完成")
```

### 3. 導出報告

```python
# 導出 HTML 報告（包含遮罩圖）
html_path = workflow.export_report(plant_id=1, format='html')
print(f"報告已導出: {html_path}")
```

## 性能優化建議

### 1. 切割服務優化
- 使用 GPU 加速 UniPixel-3B 推理
- 考慮批量處理多個切割請求
- 實現請求隊列管理

### 2. 圖像處理優化
- 預處理圖像尺寸（推薦 1024x1024）
- 使用適當的壓縮級別減少傳輸時間
- 考慮本地緩存已處理的遮罩

### 3. 錯誤處理
- 切割服務不可用時優雅降級
- 超時重試機制
- 詳細的錯誤日誌記錄

## 故障排除

### 問題 1: UniPixel 服務無響應
**解決方案**:
```bash
# 檢查服務狀態
curl http://localhost:8000/health

# 重啟服務
cd scripts/unipixel-local
uvicorn server:app --reload
```

### 問題 2: 切割遮罩質量不佳
**解決方案**:
- 優化病害描述的具體性和準確性
- 調整 UniPixel 的閾值參數
- 使用更高質量的輸入圖像

### 問題 3: AI 診斷未返回病害描述
**解決方案**:
- 確保 VLM 提示詞包含描述要求
- 檢查響應格式是否為 JSON
- 驗證 API 配置是否正確

## 未來改進方向

1. **多病害並發切割**: 支持同時切割多個病害區域
2. **實時預覽**: 在診斷過程中實時顯示切割進度
3. **歷史對比**: 對同一植株的多次診斷進行對比分析
4. **自動治療建議**: 基於切割結果自動生成精確的治療方案
5. **3D 病害建模**: 結合多角度圖像生成病害的 3D 分布圖

## 相關文檔

- [UniPixel-3B 本地服務配置](../scripts/unipixel-local/README.md)
- [植株診斷工作流 API](./PLANT_DIAGNOSIS_API.md)
- [模型配置指南](./MODEL_CONFIGURATION.md)

## 技術支持

如有問題，請查看：
- GitHub Issues
- 技術文檔
- 開發者社區

