# Assistant Settings Sidebar - Ant Design Integration Guide

## Overview

The Assistant Settings Sidebar uses Ant Design (antd) components for a consistent, professional UI. This guide explains how Ant Design is integrated and how to customize it.

## Why Ant Design?

We chose Ant Design for several reasons:

1. **Mature Component Library**: Battle-tested components with extensive features
2. **Excellent Form Support**: Built-in validation, error handling, and state management
3. **Consistent Design Language**: Professional appearance out of the box
4. **Accessibility**: WCAG 2.0 compliant components
5. **Internationalization**: Built-in i18n support
6. **Theme Customization**: Powerful theming system
7. **TypeScript Support**: Full TypeScript definitions

## Installation

### Required Packages

```bash
npm install antd@latest
npm install @ant-design/icons@latest
```

### Version Requirements

- `antd`: ^5.0.0 or later
- `@ant-design/icons`: ^5.0.0 or later
- `react`: ^18.0.0 or later

## Component Usage

### Drawer Component

The sidebar uses Ant Design's `Drawer` component:

```typescript
import { Drawer } from 'antd';

<Drawer
  title="Create New Assistant"
  placement="right"
  width={480}
  open={visible}
  onClose={onClose}
  destroyOnClose
  maskClosable={false}
>
  {/* Content */}
</Drawer>
```

**Key Props:**
- `placement="right"`: Slides in from right
- `width={480}`: Desktop width (responsive on mobile)
- `destroyOnClose`: Cleans up state when closed
- `maskClosable={false}`: Prevents accidental closes

### Form Component

The form uses Ant Design's `Form` component:

```typescript
import { Form } from 'antd';

<Form
  form={form}
  layout="vertical"
  onFinish={handleSubmit}
  onValuesChange={handleChange}
  initialValues={initialData}
>
  {/* Form items */}
</Form>
```

**Key Features:**
- `layout="vertical"`: Labels above inputs
- `onFinish`: Called when validation passes
- `onValuesChange`: Real-time change tracking
- Built-in validation and error display

### Input Components

#### Text Input

```typescript
import { Form, Input } from 'antd';

<Form.Item
  name="title"
  label="Assistant Name"
  rules={[
    { required: true, message: 'Name is required' },
    { min: 1, max: 50, message: 'Name must be 1-50 characters' }
  ]}
>
  <Input
    placeholder="Enter assistant name"
    maxLength={50}
    showCount
  />
</Form.Item>
```

#### Text Area

```typescript
import { Form, Input } from 'antd';

<Form.Item
  name="desc"
  label="Description"
  rules={[
    { required: true, message: 'Description is required' },
    { min: 1, max: 200, message: 'Description must be 1-200 characters' }
  ]}
>
  <Input.TextArea
    placeholder="Describe your assistant"
    maxLength={200}
    showCount
    rows={3}
  />
</Form.Item>
```

#### Large Text Area

```typescript
<Form.Item
  name="prompt"
  label="System Prompt"
  rules={[
    { required: true, message: 'System prompt is required' },
    { min: 1, max: 2000, message: 'Prompt must be 1-2000 characters' }
  ]}
>
  <Input.TextArea
    placeholder="Define assistant behavior..."
    maxLength={2000}
    showCount
    rows={8}
    autoSize={{ minRows: 8, maxRows: 12 }}
  />
</Form.Item>
```

### Switch Component

```typescript
import { Form, Switch } from 'antd';

<Form.Item
  name="isPublic"
  label="Public Assistant"
  valuePropName="checked"
>
  <Switch
    checkedChildren="Public"
    unCheckedChildren="Private"
  />
</Form.Item>
```

### Button Components

```typescript
import { Button, Space } from 'antd';

<Space>
  <Button onClick={onClose}>
    Cancel
  </Button>
  
  <Button
    type="primary"
    htmlType="submit"
    loading={loading}
  >
    Create Assistant
  </Button>
</Space>
```

### Tag Components

```typescript
import { Tag, Input, Button } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';

<Space wrap>
  {tags.map((tag, index) => (
    <Tag
      key={index}
      closable
      onClose={() => removeTag(index)}
      icon={<CloseOutlined />}
    >
      {tag}
    </Tag>
  ))}
  
  <Input
    type="text"
    size="small"
    style={{ width: 100 }}
    placeholder="Add tag"
    onPressEnter={addTag}
  />
  
  <Button
    size="small"
    type="dashed"
    icon={<PlusOutlined />}
    onClick={addTag}
  >
    Add
  </Button>
</Space>
```

### Message and Notification

```typescript
import { message, notification } from 'antd';

// Success message
message.success('Assistant created successfully!');

// Error message
message.error('Failed to create assistant');

// Notification with details
notification.success({
  message: 'Assistant Created',
  description: 'Your assistant has been created and is ready to use.',
  duration: 3,
});

// Error notification
notification.error({
  message: 'Creation Failed',
  description: error.message,
  duration: 5,
});
```

### Modal for Confirmations

```typescript
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

// Unsaved changes warning
Modal.confirm({
  title: 'Unsaved Changes',
  icon: <ExclamationCircleOutlined />,
  content: 'You have unsaved changes. Do you want to save before closing?',
  okText: 'Save',
  cancelText: 'Discard',
  onOk: handleSave,
  onCancel: handleDiscard,
});

// Delete confirmation
Modal.confirm({
  title: 'Delete Assistant',
  icon: <ExclamationCircleOutlined />,
  content: 'Are you sure you want to delete this assistant? This action cannot be undone.',
  okText: 'Delete',
  okType: 'danger',
  cancelText: 'Cancel',
  onOk: handleDelete,
});
```

## Theme Customization

### Global Theme Configuration

Configure Ant Design theme in your app root:

```typescript
// app/layout.tsx or _app.tsx
import { ConfigProvider } from 'antd';

export default function RootLayout({ children }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Primary color
          colorPrimary: '#1890ff',
          
          // Border radius
          borderRadius: 8,
          
          // Font
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 14,
          
          // Colors
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          colorInfo: '#1890ff',
          
          // Spacing
          padding: 16,
          margin: 16,
        },
        components: {
          Drawer: {
            // Drawer-specific customization
            colorBgElevated: '#ffffff',
            colorBgMask: 'rgba(0, 0, 0, 0.45)',
          },
          Form: {
            // Form-specific customization
            labelColor: 'rgba(0, 0, 0, 0.85)',
            labelFontSize: 14,
          },
          Input: {
            // Input-specific customization
            controlHeight: 40,
            borderRadius: 6,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
```

### Dark Mode Support

```typescript
import { ConfigProvider, theme } from 'antd';

export default function RootLayout({ children }) {
  const isDarkMode = useTheme(); // Your theme hook

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          // ... other tokens
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
```

### Component-Level Customization

Override styles for specific instances:

```typescript
<Drawer
  title="Create Assistant"
  styles={{
    header: {
      background: '#f0f2f5',
      borderBottom: '1px solid #d9d9d9',
    },
    body: {
      padding: '24px',
    },
    footer: {
      borderTop: '1px solid #d9d9d9',
    },
  }}
>
  {/* Content */}
</Drawer>
```

## Form Validation

### Built-in Rules

Ant Design provides comprehensive validation rules:

```typescript
<Form.Item
  name="title"
  rules={[
    // Required field
    { required: true, message: 'Name is required' },
    
    // Length validation
    { min: 1, max: 50, message: 'Name must be 1-50 characters' },
    
    // Pattern validation
    { pattern: /^[a-zA-Z0-9\s]+$/, message: 'Only alphanumeric characters allowed' },
    
    // Whitespace validation
    { whitespace: true, message: 'Name cannot be only whitespace' },
    
    // Custom validation
    {
      validator: async (_, value) => {
        if (value && await isDuplicateName(value)) {
          throw new Error('Name already exists');
        }
      },
    },
  ]}
>
  <Input />
</Form.Item>
```

### Custom Validators

Create reusable validators:

```typescript
// lib/validators/assistantValidators.ts
export const titleValidator = {
  required: true,
  message: 'Name is required',
};

export const titleLengthValidator = {
  min: 1,
  max: 50,
  message: 'Name must be 1-50 characters',
};

export const emojiValidator = {
  validator: async (_: any, value: string) => {
    if (!value) {
      throw new Error('Please select an emoji');
    }
    if (!/\p{Emoji}/u.test(value)) {
      throw new Error('Invalid emoji');
    }
  },
};

// Usage
<Form.Item
  name="title"
  rules={[titleValidator, titleLengthValidator]}
>
  <Input />
</Form.Item>
```

### Real-Time Validation

Enable real-time validation:

```typescript
const [form] = Form.useForm();

// Validate on change
const handleChange = (changedValues: any, allValues: any) => {
  // Validate specific field
  form.validateFields([Object.keys(changedValues)[0]]);
};

<Form
  form={form}
  onValuesChange={handleChange}
  validateTrigger="onChange"
>
  {/* Form items */}
</Form>
```

## Icons

### Using Ant Design Icons

```typescript
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SmileOutlined,
} from '@ant-design/icons';

// In buttons
<Button icon={<PlusOutlined />}>Create</Button>
<Button icon={<EditOutlined />}>Edit</Button>
<Button icon={<DeleteOutlined />} danger>Delete</Button>

// In messages
message.success({
  content: 'Success!',
  icon: <CheckCircleOutlined />,
});

// In form items
<Form.Item
  label={
    <span>
      Name <InfoCircleOutlined style={{ color: '#1890ff' }} />
    </span>
  }
>
  <Input />
</Form.Item>
```

### Custom Icons

Add custom SVG icons:

```typescript
import Icon from '@ant-design/icons';

const CustomSvg = () => (
  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
    <path d="..." />
  </svg>
);

const CustomIcon = (props: any) => <Icon component={CustomSvg} {...props} />;

// Usage
<Button icon={<CustomIcon />}>Custom</Button>
```

## Responsive Design

### Breakpoints

Ant Design uses these breakpoints:

```typescript
const breakpoints = {
  xs: 480,   // Mobile
  sm: 576,   // Small tablet
  md: 768,   // Tablet
  lg: 992,   // Desktop
  xl: 1200,  // Large desktop
  xxl: 1600, // Extra large desktop
};
```

### Responsive Drawer Width

```typescript
import { useBreakpoint } from 'antd';

function AssistantSidebar() {
  const screens = useBreakpoint();
  
  const getDrawerWidth = () => {
    if (screens.xs) return '100%';      // Mobile: full screen
    if (screens.md) return '70%';       // Tablet: 70%
    return 480;                         // Desktop: 480px
  };

  return (
    <Drawer width={getDrawerWidth()}>
      {/* Content */}
    </Drawer>
  );
}
```

### Responsive Form Layout

```typescript
<Form
  layout="vertical"
  labelCol={{ xs: 24, sm: 24, md: 8 }}
  wrapperCol={{ xs: 24, sm: 24, md: 16 }}
>
  {/* Form items */}
</Form>
```

## Performance Optimization

### Lazy Loading

Load Ant Design components on demand:

```typescript
import dynamic from 'next/dynamic';

const Drawer = dynamic(() => import('antd').then(mod => mod.Drawer), {
  ssr: false,
});

const Form = dynamic(() => import('antd').then(mod => mod.Form), {
  ssr: false,
});
```

### Tree Shaking

Ensure tree shaking is working:

```javascript
// next.config.js
module.exports = {
  transpilePackages: ['antd'],
  modularizeImports: {
    'antd': {
      transform: 'antd/es/{{member}}',
    },
  },
};
```

### CSS Optimization

Use CSS-in-JS for better performance:

```typescript
// Ant Design 5.x uses CSS-in-JS by default
// No additional configuration needed
```

## Accessibility

### ARIA Labels

Add proper ARIA labels:

```typescript
<Form.Item
  name="title"
  label="Assistant Name"
>
  <Input
    aria-label="Assistant name input"
    aria-required="true"
    aria-describedby="title-help"
  />
</Form.Item>
```

### Keyboard Navigation

Ant Design components support keyboard navigation by default:

- `Tab`: Navigate between fields
- `Enter`: Submit form
- `Esc`: Close drawer/modal
- `Space`: Toggle switch/checkbox
- `Arrow keys`: Navigate select options

### Screen Reader Support

Ensure proper screen reader announcements:

```typescript
<Form.Item
  name="title"
  label="Assistant Name"
  help="Enter a unique name for your assistant"
  extra="This name will be visible to all users"
>
  <Input />
</Form.Item>
```

## Common Patterns

### Loading States

```typescript
const [loading, setLoading] = useState(false);

<Button
  type="primary"
  htmlType="submit"
  loading={loading}
  disabled={loading}
>
  {loading ? 'Creating...' : 'Create Assistant'}
</Button>
```

### Error Display

```typescript
<Form.Item
  name="title"
  validateStatus={error ? 'error' : ''}
  help={error}
>
  <Input />
</Form.Item>
```

### Conditional Rendering

```typescript
<Form.Item
  noStyle
  shouldUpdate={(prevValues, currentValues) => 
    prevValues.isPublic !== currentValues.isPublic
  }
>
  {({ getFieldValue }) =>
    getFieldValue('isPublic') ? (
      <Alert
        message="This assistant will be visible to all users"
        type="info"
        showIcon
      />
    ) : null
  }
</Form.Item>
```

## Troubleshooting

### Issue: Styles not loading

**Solution:**
```typescript
// Ensure ConfigProvider wraps your app
import { ConfigProvider } from 'antd';

<ConfigProvider>
  <App />
</ConfigProvider>
```

### Issue: Form validation not working

**Solution:**
```typescript
// Use Form.useForm() hook
const [form] = Form.useForm();

<Form form={form}>
  {/* Form items */}
</Form>
```

### Issue: Drawer not closing

**Solution:**
```typescript
// Ensure onClose is properly connected
<Drawer
  open={visible}
  onClose={() => setVisible(false)}
>
  {/* Content */}
</Drawer>
```

## Resources

- **Ant Design Documentation**: https://ant.design/components/overview/
- **Ant Design Icons**: https://ant.design/components/icon/
- **Form Documentation**: https://ant.design/components/form/
- **Drawer Documentation**: https://ant.design/components/drawer/
- **Theme Customization**: https://ant.design/docs/react/customize-theme

## Best Practices

1. **Use Form.useForm()**: Always use the form hook for better control
2. **Validate Early**: Enable real-time validation for better UX
3. **Provide Clear Errors**: Write helpful error messages
4. **Use Built-in Components**: Leverage Ant Design's components instead of custom ones
5. **Follow Design Guidelines**: Stick to Ant Design's design principles
6. **Test Accessibility**: Ensure keyboard navigation and screen reader support
7. **Optimize Performance**: Use lazy loading and tree shaking
8. **Customize Thoughtfully**: Only override styles when necessary

## Support

For Ant Design-specific issues:
- Check the official documentation
- Search GitHub issues
- Ask in the Ant Design community
- Review the changelog for breaking changes
