# Chatbot Image Transmission Fix

## Issue
When users tried to send images in the chatbot, they encountered a `POST /api/vision/analyze 400` error with the message `{"error":"qwen apiKey not configured"}`. This occurred even when users were not explicitly using Qwen as their provider.

## Root Cause
The issue had multiple contributing factors:

1. **Missing API Key Validation**: When a user sent an image, the code would use the current `aiProvider` value without checking if that provider had an API key configured in localStorage.

2. **No Fallback Mechanism**: If the current provider wasn't configured, there was no fallback to a working provider.

3. **Poor Error Messages**: The API returned generic error messages that didn't help users understand what was wrong or how to fix it.

4. **Silent Failures**: The frontend didn't properly handle or display API errors to the user.

## Solution

### 1. Frontend Validation and Fallback (`components/ChatbotChat/index.tsx`)

Added pre-flight validation before making the vision API call:

```typescript
// Check if current provider has API key configured
let visionProvider = aiProvider;
let apiKey = getStored(aiProvider, 'apiKey');
let baseUrl = getStored(aiProvider, 'apiBase');

// If current provider is not configured, try OpenAI as fallback
if (!apiKey && aiProvider !== 'openai') {
  const openaiKey = getStored('openai', 'apiKey');
  if (openaiKey) {
    visionProvider = 'openai';
    apiKey = openaiKey;
    baseUrl = getStored('openai', 'apiBase');
    message.info('当前提供商未配置，使用 OpenAI 进行图像分析');
  }
}

// If still no API key, show error and abort
if (!apiKey && visionProvider !== 'ollama') {
  message.error(`${visionProvider} 未配置 API Key，无法进行图像分析。请在设置中配置。`);
  // Clean up and return early
  return;
}
```

### 2. Improved Error Handling

Enhanced error handling to provide better user feedback:

```typescript
if (analyzeResp.ok) {
  const j = await analyzeResp.json().catch(() => null);
  vlmText = (j?.content || j?.warning || '') as string;
  if (!vlmText) {
    vlmText = '图像分析完成，但未返回内容';
  }
} else {
  const errorData = await analyzeResp.json().catch(() => null);
  const errorMsg = errorData?.message || errorData?.error || analyzeResp.statusText;
  vlmText = `视觉解析失败：${errorMsg}`;
  message.error(`图像分析失败：${errorMsg}`);
}
```

### 3. Backend Error Messages (`app/api/vision/analyze/route.ts`)

Added detailed error messages and logging:

```typescript
if (!key && needsApiKey(provider)) {
  console.error(`[vision/analyze] ${provider} apiKey not configured`);
  return NextResponse.json({ 
    error: `${provider} apiKey not configured`,
    message: `请在设置中配置 ${provider} 的 API Key`
  }, { status: 400 });
}
```

### 4. Response Validation

Added validation for API responses:

```typescript
const data = await resp.json().catch(() => null);
if (!data) {
  console.error(`[vision/analyze] ${provider} returned invalid JSON`);
  return NextResponse.json({ 
    error: 'Invalid response from provider',
    message: '服务返回了无效的响应'
  }, { status: 500 });
}
```

## Testing

To test the fix:

1. **Without API Key**:
   - Upload an image without configuring any AI provider
   - Expected: Clear error message telling user to configure API key

2. **With OpenAI Fallback**:
   - Configure OpenAI API key
   - Switch to a different provider (e.g., Qwen) without configuring it
   - Upload an image
   - Expected: System falls back to OpenAI with an info message

3. **With Configured Provider**:
   - Configure your preferred provider's API key
   - Upload an image
   - Expected: Image analysis works correctly

## Benefits

1. **Better User Experience**: Users get clear, actionable error messages
2. **Automatic Fallback**: System tries to use OpenAI if current provider isn't configured
3. **Debugging**: Console logs help developers identify issues
4. **Graceful Degradation**: System handles errors without crashing

## Files Modified

- `drone-analyzer-nextjs/components/ChatbotChat/index.tsx` - Added validation and fallback logic
- `drone-analyzer-nextjs/app/api/vision/analyze/route.ts` - Improved error messages and logging

## Related Issues

- POST /api/vision/analyze 400 error
- "qwen apiKey not configured" error when using other providers
- Silent failures when sending images
