# UI 組件庫遷移計劃

## 目標

將項目中混用的多個 UI 庫統一遷移到 **@heroui**，提高代碼一致性和可維護性。

## 現狀分析

### 當前使用的 UI 庫

| UI 庫 | 使用次數 | 狀態 | 處理方案 |
|-------|---------|------|---------|
| @heroui | 177+ | ✅ 主要使用 | 保留並標準化 |
| antd | 9 | ⚠️ 少量使用 | 逐步遷移 |
| @nextui-org | 9 | ⚠️ 少量使用 | 遷移到 @heroui |
| @mui/material | 0 | ✅ 未使用 | 移除依賴 |
| @lobehub/ui | 0 | ✅ 未使用 | 移除依賴 |

## 遷移策略

### 階段一：清理未使用的依賴（優先級：高）

**目標文件**：`package.json`

移除以下依賴：
```json
// 移除
"@mui/icons-material": "^7.3.1",
"@mui/lab": "^7.0.0-beta.16",
"@mui/material": "^7.3.1",
"@emotion/react": "^11.14.0",
"@emotion/styled": "^11.14.1",
"@lobehub/ui": "^2.13.2"
```

**執行步驟**：
```bash
npm uninstall @mui/icons-material @mui/lab @mui/material @emotion/react @emotion/styled @lobehub/ui
```

### 階段二：Ant Design 遷移（優先級：中）

需要遷移的文件（共 8 個）：

#### 1. `components/ChatbotChat/index.tsx`
```typescript
// 替換前
import { ConfigProvider } from 'antd';

// 替換後
// 移除 ConfigProvider，使用 HeroUI 的主題系統
```

#### 2. `components/ChatbotChat/QrGenerator.tsx`
```typescript
// 替換前
import { QRCode } from 'antd';

// 替換後
// 使用 qrcode.react 或其他 QR code 庫
npm install qrcode.react
import QRCode from 'qrcode.react';
```

#### 3. `components/ChatbotChat/ReportPanel.tsx`
```typescript
// 需要檢查使用的 antd 組件，逐一替換
```

#### 4. `app/providers.tsx`
```typescript
// 替換前
import { ConfigProvider } from 'antd';

// 替換後
import { HeroUIProvider } from '@heroui/react';
```

#### 5. `app/layout.tsx`
```typescript
// 檢查並移除 antd ConfigProvider
```

#### 6. `components/SettingsModal.tsx`
```typescript
// 檢查使用的 antd 組件
```

#### 7-8. Provider 相關頁面
- `app/providers/[vendor]/page.tsx`
- `app/discover/model-provider/[key]/page.tsx`

### 階段三：@nextui-org 遷移（優先級：中）

需要遷移的文件（共 8 個）：

| 文件 | @nextui 組件 | @heroui 替代方案 |
|------|-------------|----------------|
| components/VideoControlPanel.tsx | NextUI components | @heroui/card |
| components/ReportPanel.tsx | NextUI components | @heroui/card, @heroui/progress |
| components/VirtualPositionView.tsx | NextUI components | @heroui/card |
| components/SizeControl.tsx | NextUI components | @heroui/slider |
| components/SimulationPanel.tsx | NextUI components | @heroui/card |
| components/DronePositionPanel.tsx | NextUI components | @heroui/card |
| components/AIAnalysisReport.tsx | NextUI components | @heroui/card |

**遷移示例**：
```typescript
// 替換前
import { Card, CardBody } from '@nextui-org/react';

// 替換後
import { Card, CardBody } from '@heroui/card';
```

### 階段四：統一 HeroUI 使用規範（優先級：高）

#### 1. 創建標準組件包裝器

`components/ui/index.ts`：
```typescript
// 統一導出 HeroUI 組件
export { Button } from '@heroui/button';
export { Card, CardBody, CardHeader, CardFooter } from '@heroui/card';
export { Input } from '@heroui/input';
export { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
export { Select, SelectItem } from '@heroui/select';
export { Switch } from '@heroui/switch';
export { Tabs, Tab } from '@heroui/tabs';
// ... 其他常用組件
```

#### 2. 更新導入語句

所有文件統一使用：
```typescript
// ✅ 推薦
import { Card, Button, Modal } from '@/components/ui';

// 或直接導入
import { Card } from '@heroui/card';
import { Button } from '@heroui/button';
```

#### 3. 配置 HeroUI 主題

`app/providers.tsx`：
```typescript
import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ThemeProvider attribute="class" defaultTheme="dark">
        {children}
      </ThemeProvider>
    </HeroUIProvider>
  );
}
```

## 組件映射表

### Ant Design → HeroUI

| Ant Design | HeroUI | 備註 |
|------------|--------|------|
| Button | @heroui/button | 直接替換 |
| Card | @heroui/card | 直接替換 |
| Input | @heroui/input | 直接替換 |
| Select | @heroui/select | 直接替換 |
| Modal | @heroui/modal | 直接替換 |
| Switch | @heroui/switch | 直接替換 |
| Tabs | @heroui/tabs | 直接替換 |
| QRCode | qrcode.react | 需安裝第三方庫 |
| ConfigProvider | HeroUIProvider | 主題配置方式不同 |

### NextUI → HeroUI

| NextUI | HeroUI | 備註 |
|--------|--------|------|
| @nextui-org/react | @heroui/* | 按組件分包導入 |

## 遷移時間表

| 階段 | 任務 | 預計時間 | 狀態 |
|------|------|---------|------|
| 1 | 清理未使用依賴 | 0.5天 | 🔄 進行中 |
| 2 | Ant Design 遷移 | 2天 | ⏳ 待開始 |
| 3 | NextUI 遷移 | 1天 | ⏳ 待開始 |
| 4 | 統一 HeroUI 規範 | 1天 | ⏳ 待開始 |
| 5 | 測試與優化 | 1天 | ⏳ 待開始 |

**總預計時間**：5.5天

## 測試計劃

### 功能測試
- [ ] 所有按鈕可正常點擊
- [ ] 所有表單可正常輸入和提交
- [ ] 所有模態框可正常打開和關閉
- [ ] 所有卡片正常顯示

### 視覺測試
- [ ] 深色/淺色主題切換正常
- [ ] 響應式佈局正常
- [ ] 所有組件樣式一致

### 性能測試
- [ ] 頁面加載時間
- [ ] 組件渲染性能
- [ ] 打包體積對比

## 回滾計劃

如遇問題，可使用 Git 回滾：
```bash
git checkout -b ui-migration-backup  # 創建備份分支
git revert <commit-hash>             # 回滾到指定提交
```

## 注意事項

1. **向後兼容**：確保舊功能不受影響
2. **逐步遷移**：不要一次性大規模修改
3. **測試優先**：每次遷移後進行充分測試
4. **文檔同步**：更新相關文檔
5. **團隊溝通**：及時同步遷移進度

## 相關資源

- [HeroUI 官方文檔](https://heroui.com)
- [Next.js 主題系統](https://github.com/pacocoursey/next-themes)
- [設計系統文檔](./DESIGN_SYSTEM.md)
- [前端開發規範](./.cursorrules)

---

**維護者**: 前端團隊  
**創建時間**: 2025-10-09  
**最後更新**: 2025-10-09










