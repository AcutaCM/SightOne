# 测试指南

## 概述

本项目使用 Jest 和 React Testing Library 进行组件测试。测试基础设施已配置完成，支持 HeroUI 组件测试。

## 测试工具

- **Jest**: JavaScript 测试框架
- **React Testing Library**: React 组件测试工具
- **@testing-library/jest-dom**: DOM 匹配器
- **@testing-library/user-event**: 用户交互模拟

## 项目结构

```
__tests__/
├── components/          # 组件测试
│   └── UserMenu.test.tsx
├── utils/              # 测试工具
│   ├── test-utils.tsx  # 自定义渲染函数
│   ├── mock-data.ts    # Mock 数据
│   └── mock-contexts.tsx # Mock Context
jest.config.js          # Jest 配置
jest.setup.js           # Jest 设置文件
```

## 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch

# 运行特定测试文件
npm test UserMenu.test
```

## 编写测试

### 基本组件测试

```typescript
import { render, screen } from '../utils/test-utils'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### 使用 Mock 数据

```typescript
import { mockUser } from '../utils/mock-data'

it('should display user info', () => {
  render(<UserProfile user={mockUser} />)
  expect(screen.getByText(mockUser.username)).toBeInTheDocument()
})
```

### 测试 HeroUI 组件

```typescript
import { Button } from '@heroui/button'

it('should render HeroUI button', () => {
  render(<Button>Click me</Button>)
  const button = screen.getByRole('button', { name: /click me/i })
  expect(button).toBeInTheDocument()
})
```

### 测试用户交互

```typescript
import { render, screen, fireEvent } from '../utils/test-utils'

it('should handle click event', () => {
  const handleClick = jest.fn()
  render(<Button onPress={handleClick}>Click</Button>)
  
  const button = screen.getByRole('button')
  fireEvent.click(button)
  
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### 测试异步操作

```typescript
import { render, screen, waitFor } from '../utils/test-utils'

it('should load data', async () => {
  render(<DataComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

### Mock Context

```typescript
import { createMockWrapper } from '../utils/mock-contexts'

it('should use context value', () => {
  const wrapper = createMockWrapper({
    auth: { user: mockUser, isAuthenticated: true }
  })
  
  render(<MyComponent />, { wrapper })
  // 测试逻辑
})
```

## 测试最佳实践

### 1. 测试用户行为，而非实现细节

❌ 不好的做法：
```typescript
expect(component.state.count).toBe(1)
```

✅ 好的做法：
```typescript
expect(screen.getByText('Count: 1')).toBeInTheDocument()
```

### 2. 使用语义化查询

优先级顺序：
1. `getByRole` - 最推荐
2. `getByLabelText` - 表单元素
3. `getByPlaceholderText` - 输入框
4. `getByText` - 文本内容
5. `getByTestId` - 最后选择

### 3. 避免测试实现细节

专注于测试组件的行为和输出，而不是内部实现。

### 4. 保持测试独立

每个测试应该独立运行，不依赖其他测试的状态。

### 5. 使用描述性的测试名称

```typescript
// ❌ 不好
it('works', () => {})

// ✅ 好
it('should display error message when form validation fails', () => {})
```

## 常见问题

### Q: 如何测试 HeroUI Modal？

```typescript
it('should open modal', async () => {
  render(<MyModal />)
  
  const openButton = screen.getByRole('button', { name: /open/i })
  fireEvent.click(openButton)
  
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
```

### Q: 如何测试主题切换？

```typescript
import { useTheme } from 'next-themes'

jest.mock('next-themes')
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

it('should toggle theme', () => {
  const setTheme = jest.fn()
  mockUseTheme.mockReturnValue({
    theme: 'light',
    setTheme,
    themes: ['light', 'dark'],
  })
  
  render(<ThemeSwitch />)
  // 测试逻辑
})
```

### Q: 如何测试路由导航？

```typescript
import { useRouter } from 'next/navigation'

jest.mock('next/navigation')
const mockPush = jest.fn()

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  })
})

it('should navigate on click', () => {
  render(<NavigationButton />)
  fireEvent.click(screen.getByRole('button'))
  expect(mockPush).toHaveBeenCalledWith('/target-page')
})
```

## 覆盖率目标

- **语句覆盖率**: > 80%
- **分支覆盖率**: > 75%
- **函数覆盖率**: > 80%
- **行覆盖率**: > 80%

## 持续集成

测试应该在每次提交前运行：

```bash
# 运行测试和 lint
npm run lint && npm test
```

## 参考资源

- [Jest 文档](https://jestjs.io/)
- [React Testing Library 文档](https://testing-library.com/react)
- [HeroUI 测试指南](https://heroui.com/docs/guide/testing)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
