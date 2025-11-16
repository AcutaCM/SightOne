# Assistant Form Import Fix

## Issue
When trying to add a new assistant, the form wouldn't show and the following error appeared in the debug console:

```
Error: AssistantForm is not defined
Call Stack: AssistantSettingsSidebar.next\static\chunks\components_1585aa12._.js (17859:229)
```

## Root Cause
The `AssistantSettingsSidebar` component was using the `<AssistantForm />` component but wasn't importing it, causing a runtime error when trying to render the form.

## Fixes Applied

### 1. Fixed Duplicate Export in AssistantForm.tsx
**File**: `drone-analyzer-nextjs/components/AssistantForm.tsx`

**Issue**: The file had two `export default AssistantForm;` statements at the end, causing a module error.

**Fix**: Removed the duplicate export statement.

### 2. Added Missing Import in AssistantSettingsSidebar.tsx
**File**: `drone-analyzer-nextjs/components/AssistantSettingsSidebar.tsx`

**Issue**: The component was using `<AssistantForm />` but wasn't importing it.

**Fix**: Added the import statement:
```typescript
import { AssistantForm } from './AssistantForm';
```

### 3. Fixed Type Compatibility Issues
**Issue**: The `ExtendedAssistantFormData` interface was conflicting with `AssistantFormData` by redefining the same fields with optional types.

**Fix**: 
- Removed the `ExtendedAssistantFormData` interface entirely
- Updated all references to use `AssistantFormData` directly
- Fixed field name mappings between `Assistant` type and `AssistantFormData` type:
  - `title` → `name`
  - `emoji` → `avatarEmoji`
  - `desc` → `description`
  - `prompt` → `systemPrompt`
  - `tags` (array) → `tags` (string)

### 4. Added Missing React Hooks
**Issue**: The component was using `formRef` and `handleFormChange` but they weren't defined.

**Fix**:
- Added `useRef` to the React imports
- Created `formRef` using `useRef<{ submit: () => Promise<boolean> }>(null)`
- Created `handleFormChange` callback function

### 5. Fixed Validation Function Call
**Issue**: The validation function was being called with incorrect field names and checking `validation.valid` instead of `validation.isValid`.

**Fix**:
- Changed `validateAssistantForm({ title: ..., emoji: ..., desc: ..., prompt: ... })` to `validateAssistantForm(formData)`
- Changed `validation.valid` to `validation.isValid`

## Testing
After applying these fixes:
1. ✅ No TypeScript compilation errors
2. ✅ AssistantForm component properly imported
3. ✅ Type compatibility between AssistantFormData and Assistant types
4. ✅ Form can be rendered when adding a new assistant

## Files Modified
1. `drone-analyzer-nextjs/components/AssistantForm.tsx`
2. `drone-analyzer-nextjs/components/AssistantSettingsSidebar.tsx`

## Related Components
- `AssistantForm`: The form component with all 5 tabs for assistant configuration
- `AssistantSettingsSidebar`: The sidebar that wraps the form for create/edit modes
- `ChatbotChat`: The main chat interface that uses the sidebar

## Next Steps
The assistant creation form should now work correctly. Users can:
1. Click the "+" button to add a new assistant
2. Fill in the form across 5 tabs (助手信息, 角色设定, 开场设置, 聊天偏好, 模型设置)
3. Save the assistant successfully
