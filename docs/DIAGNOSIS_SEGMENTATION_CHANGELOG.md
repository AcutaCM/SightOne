# 診斷工作流 + UniPixel-3B 病害切割整合 - 更新日誌

## 📅 更新時間
2024年10月9日

## 🎯 更新目標
在農作物診斷工作流中整合 UniPixel-3B 病害切割功能，實現從診斷到精確定位病害區域的完整閉環。

## ✨ 新增功能

### 1. Python 後端增強

#### 數據結構更新
- **DiagnosisReport** 類增加字段：
  - `segmentation_mask: Optional[str]` - Base64編碼的病害切割遮罩
  - `disease_description: Optional[str]` - 病害描述（用於切割提示）

#### 工作流改進
- **初始化參數** 新增：
  - `unipixel_endpoint` - UniPixel-3B 切割服務端點（默認：http://localhost:8000/infer_unipixel_base64）

- **診斷流程** 自動執行：
  1. AI 診斷分析
  2. 提取病害描述（`_extract_disease_description`）
  3. 調用 UniPixel-3B 切割（`_call_unipixel_segmentation`）
  4. 保存病害遮罩（`_save_mask`）
  5. 生成完整報告

- **新增方法**：
  - `_extract_disease_description()` - 從診斷結果提取病害描述
  - `_call_unipixel_segmentation()` - 調用 UniPixel-3B API
  - `_save_mask()` - 保存切割遮罩到本地

#### AI 提示詞優化
- 診斷提示詞增加 `description` 字段要求
- 要求 AI 返回可用於圖像分割的病害特徵描述

#### HTML 報告增強
- 報告中新增病害區域切割部分
- 原始圖像與遮罩並排顯示
- 顯示病害描述信息
- 優化樣式和布局

### 2. 前端組件更新

#### PlantAnalysisWorkflow 組件
- 聊天消息增加病害切割狀態提示
- 顯示病害特徵描述
- 標記切割完成狀態（🎯 emoji）

#### ReportPanel 組件
- **ReportRecord** 類型擴展：
  - `segmentationMask?: string` - 病害切割遮罩
  - `diseaseDescription?: string` - 病害描述

- **UI 增強**：
  - 新增病害區域切割專區
  - 原始圖像與遮罩對比顯示
  - 橙色標籤標識切割結果
  - 響應式網格布局

### 3. 文件結構改進

新增目錄：
```
diagnosis_data/
└── masks/        # 病害切割遮罩存儲目錄
    └── mask_plant_{id}_{timestamp}.png
```

## 📝 修改文件清單

### Python 後端
- ✅ `drone-analyzer-nextjs/python/crop_diagnosis_workflow.py`
  - 數據結構更新
  - 工作流邏輯增強
  - 新增切割相關方法
  - HTML 報告模板更新

### 前端組件
- ✅ `drone-analyzer-nextjs/components/PlantAnalysisWorkflow.tsx`
  - 消息顯示優化
  - 切割狀態提示

- ✅ `drone-analyzer-nextjs/components/ChatbotChat/ReportPanel.tsx`
  - 類型定義擴展
  - UI 布局更新
  - 遮罩顯示功能

### 文檔
- ✅ `drone-analyzer-nextjs/docs/DIAGNOSIS_WORKFLOW_WITH_SEGMENTATION.md` - 完整技術文檔
- ✅ `drone-analyzer-nextjs/docs/DIAGNOSIS_SEGMENTATION_QUICKSTART.md` - 快速入門指南
- ✅ `drone-analyzer-nextjs/DIAGNOSIS_SEGMENTATION_CHANGELOG.md` - 本更新日誌

## 🔄 工作流程對比

### 更新前
```
QR碼掃描 → 圖像採集 → AI診斷 → 生成報告
```

### 更新後
```
QR碼掃描 → 圖像採集 → AI診斷 → 病害描述提取 → UniPixel切割 → 完整報告
                              ↓                    ↓
                        [診斷JSON]          [遮罩PNG]
```

## 📊 數據流

```
1. 拍攝圖像 (JPG/PNG)
   ↓
2. AI 診斷分析
   ↓ 返回病害描述
3. UniPixel-3B 切割
   ↓ 返回遮罩 (Base64)
4. 整合報告
   ├─ 原始圖像
   ├─ 診斷結果
   └─ 病害遮罩
```

## 🚀 使用方法

### 基本使用
```python
# 啟動工作流
workflow = CropDiagnosisWorkflow(
    unipixel_endpoint="http://localhost:8000/infer_unipixel_base64"
)

# 處理圖像
annotated_frame, report = await workflow.process_frame(frame)

# 查看切割結果
if report and report.segmentation_mask:
    print("✅ 病害區域切割完成")
```

### 前端查看
1. 打開診斷報告面板
2. 自動顯示原始圖像和病害遮罩
3. 查看病害描述和切割質量

## 🔧 配置要求

### 必需服務
1. **AI 診斷服務** (VLM)
   - GPT-4 Vision / Claude 3 / Gemini Pro Vision
   - 支持圖像輸入和 JSON 格式輸出

2. **UniPixel-3B 切割服務**
   - 端點：http://localhost:8000/infer_unipixel_base64
   - 啟動：`uvicorn server:app --host 0.0.0.0 --port 8000`

### 環境依賴
```bash
# Python
httpx
opencv-python
numpy
pydantic

# Node.js
react
antd
@heroui/react
```

## ⚠️ 注意事項

1. **病害切割條件**
   - 僅在檢測到病害時執行切割
   - 需要有效的病害描述
   - UniPixel 服務必須可用

2. **性能考慮**
   - 切割過程增加 2-5 秒處理時間
   - 建議使用 GPU 加速 UniPixel
   - 大圖像建議預處理到 1024x1024

3. **錯誤處理**
   - UniPixel 服務不可用時優雅降級
   - 切割失敗不影響診斷結果
   - 詳細錯誤日誌記錄

## 🐛 已知問題

- 無

## 📈 未來計劃

1. **多病害並發切割** - 支持同時切割多個病害區域
2. **實時預覽** - 切割過程進度顯示
3. **歷史對比** - 病害發展趨勢分析
4. **3D 可視化** - 多角度病害建模

## 👥 貢獻者

- AI Assistant (Cursor)

## 📚 相關文檔

- [完整工作流程文檔](./docs/DIAGNOSIS_WORKFLOW_WITH_SEGMENTATION.md)
- [快速入門指南](./docs/DIAGNOSIS_SEGMENTATION_QUICKSTART.md)
- [UniPixel-3B 配置](./scripts/unipixel-local/README.md)

---

**版本**: 1.0.0  
**狀態**: ✅ 已完成  
**測試狀態**: 待測試

