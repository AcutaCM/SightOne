# 测试用例模板

**组件名称**: [组件名称]  
**测试文件**: `__tests__/components/[ComponentName].test.tsx`  
**创建日期**: [日期]  
**维护人**: [姓名]

## 📋 测试计划

### 测试范围

- [ ] 组件渲染
- [ ] Props 传递
- [ ] 用户交互
- [ ] 状态管理
- [ ] 错误处理
- [ ] 主题响应
- [ ] 可访问性

### 测试优先级

- **P0 (必须)**: 核心功能测试
- **P1 (重要)**: 边界情况测试
- **P2 (可选)**: 性能和优化测试

## 🧪 测试用例

### 1. 基础渲染测试 (P0)

#### 1.1 组件正常渲染

```typescript
describe('[ComponentName]', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('[role]')).toBeInTheDocument()
  })
})
```

**验证点**:
- [ ] 组件成功渲染
- [ ] 无控制台错误
- [ ] DOM 结构正确

#### 1.2 带 Props 渲染

```typescript
it('should render with props', () => {
  render(<ComponentName title="Test" />)
  expect(screen.getByText('Test')).toBeInTheDocument()
})
```

**验证点**:
- [ ] Props 正确传递
- [ ] 内容正确显示

### 2. 交互测试 (P0)

#### 2.1 点击事件

```typescript
it('should handle click event', () => {
  const handleClick = jest.fn()
  render(<ComponentName onPress={handleClick} />)
  
  fireEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

**验证点**:
- [ ] 事件处理函数被调用
- [ ] 调用次数正确
- [ ] 参数传递正确

#### 2.2 输入事件

```typescript
it('should handle input change', () => {
  const handleChange = jest.fn()
  render(<ComponentName onValueChange={handleChange} />)
  
  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: 'test' } })
  
  expect(handleChange).toHaveBeenCalledWith('test')
})
```

**验证点**:
- [ ] 输入值正确更新
- [ ] 回调函数被调用
- [ ] 值传递正确

### 3. 状态测试 (P0)

#### 3.1 加载状态

```typescript
it('should display loading state', () => {
  render(<ComponentName isLoading={true} />)
  expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

**验证点**:
- [ ] 加载指示器显示
- [ ] 交互被禁用

#### 3.2 禁用状态

```typescript
it('should be disabled when isDisabled is true', () => {
  render(<ComponentName isDisabled={true} />)
  const button = screen.getByRole('button')
  expect(button).toBeDisabled()
})
```

**验证点**:
- [ ] 组件被禁用
- [ ] 样式正确应用

#### 3.3 错误状态

```typescript
it('should display error message', () => {
  render(<ComponentName errorMessage="Error occurred" />)
  expect(screen.getByText('Error occurred')).toBeInTheDocument()
})
```

**验证点**:
- [ ] 错误信息显示
- [ ] 错误样式应用

### 4. 主题测试 (P1)

#### 4.1 浅色主题

```typescript
it('should render correctly in light theme', () => {
  render(
    <ThemeProvider theme="light">
      <ComponentName />
    </ThemeProvider>
  )
  // 验证浅色主题样式
})
```

**验证点**:
- [ ] 浅色主题样式正确
- [ ] 文本可读性良好

#### 4.2 深色主题

```typescript
it('should render correctly in dark theme', () => {
  render(
    <ThemeProvider theme="dark">
      <ComponentName />
    </ThemeProvider>
  )
  // 验证深色主题样式
})
```

**验证点**:
- [ ] 深色主题样式正确
- [ ] 文本可读性良好

### 5. 可访问性测试 (P1)

#### 5.1 键盘导航

```typescript
it('should support keyboard navigation', () => {
  render(<ComponentName />)
  const element = screen.getByRole('button')
  
  element.focus()
  expect(element).toHaveFocus()
  
  fireEvent.keyDown(element, { key: 'Enter' })
  // 验证 Enter 键行为
})
```

**验证点**:
- [ ] Tab 键导航正常
- [ ] Enter/Space 键激活
- [ ] Escape 键关闭（如适用）

#### 5.2 ARIA 标签

```typescript
it('should have correct ARIA labels', () => {
  render(<ComponentName aria-label="Test Label" />)
  expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
})
```

**验证点**:
- [ ] aria-label 正确
- [ ] role 属性正确
- [ ] aria-* 属性完整

### 6. 边界情况测试 (P1)

#### 6.1 空数据

```typescript
it('should handle empty data', () => {
  render(<ComponentName data={[]} />)
  expect(screen.getByText('No data')).toBeInTheDocument()
})
```

**验证点**:
- [ ] 空状态显示
- [ ] 无错误抛出

#### 6.2 大量数据

```typescript
it('should handle large dataset', () => {
  const largeData = Array.from({ length: 1000 }, (_, i) => ({ id: i }))
  render(<ComponentName data={largeData} />)
  // 验证性能和渲染
})
```

**验证点**:
- [ ] 渲染性能可接受
- [ ] 无内存泄漏

#### 6.3 特殊字符

```typescript
it('should handle special characters', () => {
  render(<ComponentName value="<script>alert('xss')</script>" />)
  // 验证 XSS 防护
})
```

**验证点**:
- [ ] 特殊字符正确转义
- [ ] 无 XSS 漏洞

### 7. 异步操作测试 (P1)

#### 7.1 数据加载

```typescript
it('should load data asynchronously', async () => {
  render(<ComponentName />)
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

**验证点**:
- [ ] 加载状态显示
- [ ] 数据正确加载
- [ ] 错误处理正确

### 8. 集成测试 (P2)

#### 8.1 与其他组件集成

```typescript
it('should work with parent component', () => {
  render(
    <ParentComponent>
      <ComponentName />
    </ParentComponent>
  )
  // 验证集成行为
})
```

**验证点**:
- [ ] 组件间通信正常
- [ ] 状态共享正确

## 📊 覆盖率目标

- **语句覆盖率**: > 80%
- **分支覆盖率**: > 75%
- **函数覆盖率**: > 80%
- **行覆盖率**: > 80%

## 🔧 Mock 配置

### Context Mock

```typescript
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
  }),
}))
```

### API Mock

```typescript
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn().mockResolvedValue(mockData),
}))
```

## ✅ 测试检查清单

### 编写前

- [ ] 已了解组件功能
- [ ] 已识别测试场景
- [ ] 已准备 Mock 数据

### 编写中

- [ ] 测试命名清晰
- [ ] 测试独立运行
- [ ] 使用正确的查询方法
- [ ] 避免测试实现细节

### 编写后

- [ ] 所有测试通过
- [ ] 覆盖率达标
- [ ] 代码已审查
- [ ] 文档已更新

## 🐛 常见问题

### 问题 1: 异步测试超时

**解决方案**: 使用 `waitFor` 或增加超时时间

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
}, { timeout: 5000 })
```

### 问题 2: Mock 不生效

**解决方案**: 确保 mock 在导入之前

```typescript
jest.mock('@/lib/api')
import { fetchData } from '@/lib/api'
```

### 问题 3: 找不到元素

**解决方案**: 使用 `screen.debug()` 查看 DOM

```typescript
render(<ComponentName />)
screen.debug() // 打印当前 DOM
```

## 📚 参考资源

- [Testing Library 文档](https://testing-library.com/)
- [Jest 文档](https://jestjs.io/)
- [测试最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**测试状态**: [ ] 待编写 / [ ] 进行中 / [ ] 已完成  
**覆盖率**: [百分比]%  
**最后更新**: [日期]
