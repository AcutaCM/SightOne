# 📚 無人機分析平台 - 文檔中心

> 本目錄包含項目的所有設計規範、開發標準和遷移計劃文檔

## 📖 文檔列表

### 1. [前端設計標準總結](./FRONTEND_STANDARDS_SUMMARY.md) ⭐ 推薦首先閱讀

**內容概要**：
- 📊 現狀分析和問題總結
- ✅ 已完成的工作清單
- 🎯 設計標準要點
- 🚀 遷移計劃和時間表
- 📈 預期收益分析

**適合人群**：所有團隊成員、項目經理、新成員

---

### 2. [設計系統文檔](./DESIGN_SYSTEM.md)

**內容概要**：
- 🎨 完整的顏色系統
- 📝 字體和排版規範
- 📐 間距和佈局標準
- 🧩 組件使用規範
- 💫 動畫和過渡效果
- ♿ 無障礙設計指南

**適合人群**：前端開發者、UI/UX 設計師

**關鍵章節**：
- 顏色系統：主色、功能色、中性色定義
- 組件規範：按鈕、卡片、表單等標準用法
- 佈局規範：容器間距、響應式斷點
- 動畫規範：過渡時間、緩動函數

---

### 3. [UI 遷移計劃](./UI_MIGRATION_PLAN.md)

**內容概要**：
- 🔍 當前 UI 庫使用分析
- 📋 分階段遷移策略
- 🗺️ 組件映射表
- ⏱️ 詳細時間表
- ✅ 測試計劃
- 🔙 回滾方案

**適合人群**：前端開發者、技術負責人

**重點內容**：
- Ant Design → HeroUI 遷移
- NextUI → HeroUI 遷移
- 需要遷移的 16 個文件清單
- 5.5 天的遷移時間表

---

## 🚀 快速開始

### 新成員入職

1. 閱讀 [前端設計標準總結](./FRONTEND_STANDARDS_SUMMARY.md)
2. 熟悉 [設計系統文檔](./DESIGN_SYSTEM.md)
3. 查看項目根目錄的 [.cursorrules](../.cursorrules)

### 開始開發

1. 確保了解 [設計系統](./DESIGN_SYSTEM.md) 的基本規範
2. 使用統一的 UI 組件導入：
   ```typescript
   import { Button, Card, Modal } from '@/components/ui';
   ```
3. 遵循 [開發規範](../.cursorrules) 中的代碼風格

### 參與遷移

1. 閱讀 [UI 遷移計劃](./UI_MIGRATION_PLAN.md)
2. 選擇一個階段任務
3. 執行清理腳本（如需）：
   ```bash
   # Linux/Mac
   chmod +x scripts/cleanup-dependencies.sh
   ./scripts/cleanup-dependencies.sh
   
   # Windows
   .\scripts\cleanup-dependencies.bat
   ```
4. 提交 PR 並附上測試結果

---

## 📁 文件結構

```
docs/
├── README.md                          # 本文件
├── FRONTEND_STANDARDS_SUMMARY.md      # 總結文檔 ⭐
├── DESIGN_SYSTEM.md                   # 設計系統
└── UI_MIGRATION_PLAN.md               # 遷移計劃

../ (項目根目錄)
├── .cursorrules                       # 開發規範
├── components/
│   └── ui/
│       └── index.ts                   # UI 組件統一導出 ⭐
├── scripts/
│   ├── cleanup-dependencies.sh        # 依賴清理腳本 (Linux/Mac)
│   └── cleanup-dependencies.bat       # 依賴清理腳本 (Windows)
└── tailwind.config.js                 # Tailwind 配置
```

---

## 🎯 核心原則

### 1. 統一性（Consistency）
- ✅ 統一使用 @heroui UI 庫
- ✅ 統一的顏色和字體系統
- ✅ 統一的代碼風格

### 2. 可維護性（Maintainability）
- ✅ 清晰的文檔和規範
- ✅ 組件化和模塊化
- ✅ TypeScript 類型安全

### 3. 性能優先（Performance）
- ✅ 減少不必要的依賴
- ✅ 優化打包體積
- ✅ 懶加載和代碼分割

---

## 🛠️ 工具和資源

### UI 組件庫
- [HeroUI](https://heroui.com) - 主要 UI 庫
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
- [Framer Motion](https://www.framer.com/motion/) - 動畫庫

### 開發工具
- [Next.js](https://nextjs.org) - React 框架
- [TypeScript](https://www.typescriptlang.org) - 類型系統
- [ESLint](https://eslint.org) - 代碼檢查
- [Prettier](https://prettier.io) - 代碼格式化

### 設計工具
- Figma - UI 設計（待建立）
- Storybook - 組件預覽（待建立）

---

## 📊 當前狀態

| 階段 | 狀態 | 進度 |
|------|------|------|
| 規範制定 | ✅ 完成 | 100% |
| 文檔編寫 | ✅ 完成 | 100% |
| 工具準備 | ✅ 完成 | 100% |
| 組件清理 | ✅ 完成 | 100% |
| 依賴遷移 | ⏳ 待開始 | 0% |
| 組件遷移 | ⏳ 待開始 | 0% |
| 測試驗證 | ⏳ 待開始 | 0% |

---

## 🤔 常見問題

### Q: 為什麼選擇 HeroUI？
A: HeroUI 是基於 NextUI 的改進版本，提供更好的 TypeScript 支持和更豐富的組件庫，且已經是項目中使用最多的 UI 庫（177+ 處引用）。

### Q: 遷移會影響現有功能嗎？
A: 不會。我們採用逐步遷移的策略，每個階段都會進行充分測試，確保功能正常。

### Q: 需要多長時間完成遷移？
A: 預計 5.5 天工作日。具體時間表請參考 [UI 遷移計劃](./UI_MIGRATION_PLAN.md)。

### Q: 如果遇到問題怎麼辦？
A: 
1. 查看文檔是否有相關說明
2. 查看 [HeroUI 官方文檔](https://heroui.com)
3. 聯繫前端團隊
4. 如需回滾，恢復 package.json 備份文件

### Q: 自定義組件放在哪裡？
A: 
- 通用 UI 組件：`components/ui/`
- 業務組件：`components/`
- 佈局組件：`components/layout/`

---

## 📞 聯繫方式

### 負責人
- **前端負責人**：[待補充]
- **技術經理**：[待補充]

### 溝通渠道
- **項目郵箱**：[待補充]
- **Slack 頻道**：[待補充]
- **GitHub Issues**：[項目 Issues 頁面]

---

## 🔄 文檔更新

### 版本歷史
- **v1.0** (2025-10-09)
  - ✅ 初始版本發布
  - ✅ 完成所有核心文檔
  - ✅ 創建清理腳本

### 下次審查
- **計劃時間**：2025-10-23
- **審查內容**：遷移進度、文檔更新、問題反饋

### 維護者
- 前端團隊

---

## 📝 貢獻指南

### 文檔改進
如果發現文檔有誤或需要補充：
1. 創建 Issue 描述問題
2. 或直接提交 PR 修改
3. 確保更新版本歷史

### 規範建議
如對規範有建議：
1. 在團隊會議中提出
2. 經過討論和評審
3. 更新相關文檔

---

## 🎉 致謝

感謝所有參與規範制定和文檔編寫的團隊成員！

---

**最後更新**: 2025-10-09  
**文檔版本**: v1.0  
**維護者**: 前端團隊

---

<div align="center">
  <p><strong>讓我們一起打造更好的無人機分析平台！</strong></p>
  <p>📱 移動優先 • 🎨 設計優雅 • ⚡ 性能卓越 • ♿ 無障礙友好</p>
</div>










