# 無人機分析平台 - 設計系統文檔

## 概述

本文檔定義了無人機分析平台的視覺設計系統和組件使用標準。

## 設計原則

### 1. 一致性（Consistency）
- 統一的視覺語言
- 一致的交互模式
- 統一的 UI 組件庫

### 2. 清晰性（Clarity）
- 清晰的視覺層次
- 明確的操作反饋
- 直觀的導航結構

### 3. 效率（Efficiency）
- 快速的信息獲取
- 便捷的操作流程
- 優化的性能表現

## 顏色系統

### 主色調（Primary Colors）

```css
/* 品牌色 - 藍色系 */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* 主色 */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;

/* 強調色 - 青色系 */
--accent-500: #06b6d4;
--accent-600: #0891b2;
```

### 功能色（Semantic Colors）

```css
/* 成功 */
--success: #22c55e;

/* 警告 */
--warning: #f59e0b;

/* 錯誤/危險 */
--danger: #ef4444;

/* 信息 */
--info: #3b82f6;
```

### 中性色（Neutral Colors）

```css
/* 深色模式 */
--dark-bg-primary: #0a0e14;
--dark-bg-secondary: #161f2d;
--dark-bg-tertiary: #1e293b;
--dark-text-primary: #e6f1ff;
--dark-text-secondary: #a8bbf3;
--dark-text-tertiary: #7d8590;

/* 淺色模式 */
--light-bg-primary: #ffffff;
--light-bg-secondary: #f8fafc;
--light-bg-tertiary: #f1f5f9;
--light-text-primary: #0f172a;
--light-text-secondary: #475569;
--light-text-tertiary: #94a3b8;
```

## 字體系統

### 字體家族

```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;
--font-mono: 'Menlo', 'Monaco', 'Courier New', monospace;
```

### 字體大小

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### 字重

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 間距系統

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
```

## 圓角系統

```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;  /* 完全圓形 */
```

## 陰影系統

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

## 組件規範

### 按鈕（Button）

#### 主要按鈕
```typescript
<Button 
  color="primary" 
  size="md"
  radius="md"
>
  主要操作
</Button>
```

#### 次要按鈕
```typescript
<Button 
  color="default" 
  variant="bordered"
  size="md"
>
  次要操作
</Button>
```

#### 危險按鈕
```typescript
<Button 
  color="danger" 
  size="md"
>
  危險操作
</Button>
```

### 卡片（Card）

```typescript
<Card 
  className="bg-black/30 backdrop-blur-md border border-white/10"
>
  <CardHeader>
    <h4 className="text-white font-semibold">標題</h4>
  </CardHeader>
  <CardBody>
    內容區域
  </CardBody>
</Card>
```

### 輸入框（Input）

```typescript
<Input
  type="text"
  label="標籤"
  placeholder="請輸入..."
  variant="bordered"
  radius="md"
  classNames={{
    input: "bg-transparent",
    inputWrapper: "bg-black/30 border-white/20"
  }}
/>
```

### 模態框（Modal）

```typescript
<Modal 
  isOpen={isOpen} 
  onClose={onClose}
  backdrop="blur"
  size="lg"
>
  <ModalContent>
    <ModalHeader>模態框標題</ModalHeader>
    <ModalBody>
      模態框內容
    </ModalBody>
    <ModalFooter>
      <Button onPress={onClose}>取消</Button>
      <Button color="primary">確認</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

## 佈局規範

### 容器間距
- 頁面容器：`px-8 py-6`
- 卡片內邊距：`p-4` 或 `p-6`
- 組件間距：`gap-4` 或 `gap-6`

### 響應式斷點

```typescript
// Tailwind 默認斷點
sm: '640px'   // 小型設備
md: '768px'   // 平板
lg: '1024px'  // 桌面
xl: '1280px'  // 大屏幕
2xl: '1536px' // 超大屏幕
```

### 柵格系統

```typescript
// 12 柵格系統
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-6 lg:col-span-4">
    內容
  </div>
</div>
```

## 動畫規範

### 過渡時間

```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
```

### 緩動函數

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 常用動畫

```typescript
// Framer Motion 動畫
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
};

const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.4 }
};
```

## 圖標使用

### 圖標大小標準

```typescript
// 使用 lucide-react
<Icon size={16} /> // 小
<Icon size={20} /> // 中（默認）
<Icon size={24} /> // 大
<Icon size={32} /> // 超大
```

### 圖標顏色

```typescript
// 繼承文本顏色
<Icon className="text-current" />

// 主題色
<Icon className="text-primary" />

// 功能色
<Icon className="text-success" />
<Icon className="text-warning" />
<Icon className="text-danger" />
```

## 無障礙規範

### ARIA 標籤
- 所有交互元素需要適當的 ARIA 標籤
- 表單控件需要關聯 label
- 模態框需要 role="dialog"

### 鍵盤導航
- 所有交互元素可通過鍵盤訪問
- 提供清晰的焦點指示
- 支持 Tab 鍵導航

### 顏色對比度
- 文本與背景對比度至少 4.5:1
- 大文本（18px+）對比度至少 3:1

## 設計資源

### Figma 文件
- 設計稿：[待補充]
- 組件庫：[待補充]

### 設計審查
- 所有新組件需要設計審查
- UI 變更需要團隊評審

---

**維護者**: 前端團隊  
**最後更新**: 2025-10-09










