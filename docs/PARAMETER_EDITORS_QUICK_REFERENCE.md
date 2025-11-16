# 参数编辑器快速参考

## 快速导航

- [TextEditor](#texteditor) - 文本输入
- [NumberEditor](#numbereditor) - 数字输入
- [SliderEditor](#slidereditor) - 滑块选择
- [SelectEditor](#selecteditor) - 下拉选择

---

## TextEditor

### 基本用法

```tsx
import TextEditor from '@/components/workflow/editors/TextEditor';

<TextEditor
  value={value}
  onChange={(newValue) => setValue(newValue)}
  onBlur={() => console.log('Blur')}
  placeholder="输入文本..."
/>
```

### 多行文本

```tsx
<TextEditor
  value={value}
  onChange={setValue}
  multiline={true}
  minRows={3}
  maxRows={8}
  maxLength={500}
/>
```

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | string | - | 当前值 |
| onChange | (value: string) => void | - | 值变化回调 |
| onBlur | () => void | - | 失焦回调 |
| multiline | boolean | false | 是否多行 |
| autoFocus | boolean | false | 自动聚焦 |
| placeholder | string | - | 占位符 |
| maxLength | number | - | 最大长度 |
| minRows | number | 3 | 最小行数（多行） |
| maxRows | number | 8 | 最大行数（多行） |

---

## NumberEditor

### 基本用法

```tsx
import NumberEditor from '@/components/workflow/editors/NumberEditor';

<NumberEditor
  value={100}
  onChange={(newValue) => setValue(newValue)}
  min={0}
  max={500}
  step={10}
  unit="cm"
/>
```

### 带验证

```tsx
<NumberEditor
  value={value}
  onChange={setValue}
  min={0}
  max={100}
  step={0.1}
  placeholder="输入数字..."
  description="请输入 0-100 之间的数字"
/>
```

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | number | - | 当前值 |
| onChange | (value: number) => void | - | 值变化回调 |
| onBlur | () => void | - | 失焦回调 |
| min | number | - | 最小值 |
| max | number | - | 最大值 |
| step | number | 1 | 步进值 |
| unit | string | - | 单位 |
| autoFocus | boolean | false | 自动聚焦 |
| placeholder | string | - | 占位符 |

### 验证规则

- 自动验证范围（min/max）
- 实时显示错误消息
- 失焦时恢复有效值
- 支持负数和小数

---

## SliderEditor

### 基本用法

```tsx
import SliderEditor from '@/components/workflow/editors/SliderEditor';

<SliderEditor
  value={50}
  onChange={(newValue) => setValue(newValue)}
  min={0}
  max={100}
  step={5}
  unit="cm"
/>
```

### 带标记

```tsx
<SliderEditor
  value={value}
  onChange={setValue}
  min={0}
  max={100}
  step={10}
  marks={[
    { value: 0, label: '0' },
    { value: 50, label: '50' },
    { value: 100, label: '100' }
  ]}
  showValue={true}
/>
```

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | number | - | 当前值 |
| onChange | (value: number) => void | - | 值变化回调 |
| onBlur | () => void | - | 失焦回调 |
| min | number | 0 | 最小值 |
| max | number | 100 | 最大值 |
| step | number | 1 | 步进值 |
| unit | string | - | 单位 |
| showValue | boolean | true | 显示当前值 |
| marks | Array | - | 刻度标记 |

### 交互特性

- 拖拽时滑块放大
- 显示光晕效果
- 实时值更新
- 平滑动画

---

## SelectEditor

### 基本用法

```tsx
import SelectEditor from '@/components/workflow/editors/SelectEditor';

<SelectEditor
  value={selectedValue}
  onChange={(newValue) => setValue(newValue)}
  options={[
    { label: '选项 1', value: 'option1' },
    { label: '选项 2', value: 'option2' },
    { label: '选项 3', value: 'option3' }
  ]}
/>
```

### 带搜索

```tsx
<SelectEditor
  value={value}
  onChange={setValue}
  options={options}
  searchable={true}
  placeholder="请选择..."
  description="从列表中选择一个选项"
/>
```

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | any | - | 当前值 |
| onChange | (value: any) => void | - | 值变化回调 |
| onBlur | () => void | - | 失焦回调 |
| options | SelectOption[] | - | 选项列表 |
| autoFocus | boolean | false | 自动聚焦 |
| placeholder | string | '请选择...' | 占位符 |
| searchable | boolean | true | 是否可搜索 |

### SelectOption 接口

```typescript
interface SelectOption {
  label: string;  // 显示文本
  value: any;     // 选项值
}
```

---

## 主题系统

### 使用主题

所有编辑器都自动使用 `useWorkflowTheme` Hook：

```tsx
import { useWorkflowTheme } from '@/lib/workflow/workflowTheme';

const theme = useWorkflowTheme();
```

### 主题变量

```typescript
theme.parameter.bg           // 背景色
theme.parameter.bgHover      // 悬停背景色
theme.parameter.bgEditing    // 编辑背景色
theme.parameter.bgError      // 错误背景色
theme.parameter.border       // 边框色
theme.parameter.borderHover  // 悬停边框色
theme.parameter.borderEditing // 编辑边框色
theme.parameter.editingGlow  // 编辑光晕
theme.text.primary           // 主要文本色
theme.text.secondary         // 次要文本色
theme.text.tertiary          // 第三级文本色
theme.status.error           // 错误色
```

---

## 状态管理

### 本地状态

所有编辑器都使用本地状态管理：

```tsx
const [localValue, setLocalValue] = useState(value);
const [isFocused, setIsFocused] = useState(false);
```

### 状态同步

```tsx
useEffect(() => {
  setLocalValue(value);
}, [value]);
```

### 事件处理

```tsx
const handleChange = (e) => {
  setLocalValue(e.target.value);
  onChange(e.target.value);
};

const handleFocus = () => {
  setIsFocused(true);
};

const handleBlur = () => {
  setIsFocused(false);
  if (onBlur) onBlur();
};
```

---

## 样式定制

### 动态样式

```tsx
const inputWrapperStyle = {
  backgroundColor: isFocused 
    ? theme.parameter.bgEditing 
    : theme.parameter.bg,
  borderColor: isFocused 
    ? theme.parameter.borderEditing 
    : theme.parameter.border,
  boxShadow: isFocused 
    ? `0 0 0 3px ${theme.parameter.editingGlow}` 
    : 'none',
  transition: 'all 0.2s ease',
};
```

### CSS 类名

```tsx
classNames={{
  input: "transition-colors duration-200",
  inputWrapper: "border transition-all duration-200 hover:border-[var(--param-border-hover)]"
}}
```

---

## 键盘快捷键

### 通用快捷键

| 键 | 功能 |
|----|------|
| Tab | 移动到下一个输入框 |
| Shift+Tab | 移动到上一个输入框 |
| Escape | 取消编辑并恢复原值 |

### TextEditor

| 键 | 功能 |
|----|------|
| Enter | 提交（单行模式） |
| Ctrl+Enter | 换行（多行模式） |

### NumberEditor

| 键 | 功能 |
|----|------|
| Enter | 提交并失焦 |
| ↑ | 增加值 |
| ↓ | 减少值 |

### SliderEditor

| 键 | 功能 |
|----|------|
| ← | 减少值 |
| → | 增加值 |
| Home | 最小值 |
| End | 最大值 |

### SelectEditor

| 键 | 功能 |
|----|------|
| Enter | 打开/选择 |
| ↑ | 上一个选项 |
| ↓ | 下一个选项 |
| Escape | 关闭 |

---

## 错误处理

### NumberEditor 验证

```tsx
const validateNumber = (val: string) => {
  if (val === '' || val === '-') {
    return { valid: false, error: '请输入数字' };
  }
  
  const num = Number(val);
  
  if (isNaN(num)) {
    return { valid: false, error: '必须是有效的数字' };
  }
  
  if (min !== undefined && num < min) {
    return { valid: false, error: `值不能小于 ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { valid: false, error: `值不能大于 ${max}` };
  }
  
  return { valid: true, number: num };
};
```

### 错误显示

```tsx
{error && (
  <div style={{ color: theme.status.error }}>
    <AlertCircle className="w-3 h-3" />
    <span>{error}</span>
  </div>
)}
```

---

## 性能优化

### 防抖处理

```tsx
import { debounce } from 'lodash';

const debouncedOnChange = useMemo(
  () => debounce(onChange, 300),
  [onChange]
);
```

### 记忆化

```tsx
const memoizedEditor = useMemo(() => (
  <TextEditor value={value} onChange={onChange} />
), [value, onChange]);
```

---

## 测试示例

### 单元测试

```tsx
import { render, fireEvent } from '@testing-library/react';
import TextEditor from './TextEditor';

test('updates value on change', () => {
  const handleChange = jest.fn();
  const { getByRole } = render(
    <TextEditor value="" onChange={handleChange} />
  );
  
  const input = getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test' } });
  
  expect(handleChange).toHaveBeenCalledWith('test');
});
```

### 集成测试

```tsx
test('validates number range', () => {
  const handleChange = jest.fn();
  const { getByRole, getByText } = render(
    <NumberEditor 
      value={50} 
      onChange={handleChange}
      min={0}
      max={100}
    />
  );
  
  const input = getByRole('spinbutton');
  fireEvent.change(input, { target: { value: '150' } });
  
  expect(getByText('值不能大于 100')).toBeInTheDocument();
});
```

---

## 常见问题

### Q: 如何禁用编辑器？

A: 传递 `disabled` prop（如果支持）或使用只读模式。

### Q: 如何自定义样式？

A: 使用 `style` prop 或 `classNames` prop 覆盖默认样式。

### Q: 如何处理异步验证？

A: 在 `onChange` 中执行异步验证，使用状态管理错误消息。

### Q: 如何支持多语言？

A: 将所有文本字符串提取为 props，使用 i18n 库。

---

## 相关文档

- [完整实现文档](./TASK_6_PARAMETER_EDITORS_REDESIGN_COMPLETE.md)
- [视觉指南](./PARAMETER_EDITORS_VISUAL_GUIDE.md)
- [主题系统](../lib/workflow/workflowTheme.ts)
- [参数验证](../lib/workflow/parameterValidation.ts)

---

## 更新日志

### v1.0.0 (2024)
- ✅ 实现黑白灰主题
- ✅ 添加交互反馈
- ✅ 优化动画效果
- ✅ 增强可访问性
- ✅ 完善文档
