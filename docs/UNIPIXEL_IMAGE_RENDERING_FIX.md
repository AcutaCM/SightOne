# UniPixel Image Rendering Fix

## Issue
UniPixel传回的图片在ChatbotChat组件的markdown渲染中无法正常显示。

## Root Cause
ReactMarkdown组件默认会渲染markdown中的图片标签 `![alt](url)`，但UniPixel返回的图片数据可能存在格式或渲染问题。

## Solution
在ChatbotChat组件的两个ReactMarkdown实例中添加了 `img` 组件覆盖，返回 `null` 以阻止图片渲染：

```tsx
components={{
  img: () => null,  // 阻止markdown中的图片渲染
  p: ({ node, ...props }) => <p {...props} style={{ marginBottom: '1em', wordBreak: 'break-word' }} />,
  // ... 其他组件
}}
```

## Changes Made
1. **Assistant messages (line ~1809)**: 添加 `img: () => null` 到第一个ReactMarkdown的components配置
2. **User messages (line ~1882)**: 添加 `img: () => null` 到第二个ReactMarkdown的components配置

## Impact
- ✅ 阻止UniPixel图片在markdown中渲染
- ✅ 保留所有其他markdown功能（代码块、链接、列表等）
- ✅ 不影响用户上传的图片显示（通过 `![upload](data:...)` 特殊处理）

## Testing
测试markdown渲染时，所有 `![...](...)`  格式的图片标签将被忽略，不会尝试渲染。

## File Modified
- `drone-analyzer-nextjs/components/ChatbotChat/index.tsx`

## Date
2025-01-14
