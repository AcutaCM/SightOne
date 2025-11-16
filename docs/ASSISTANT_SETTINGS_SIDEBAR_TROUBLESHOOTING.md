# Assistant Settings Sidebar - Troubleshooting Guide

## Overview

This guide helps you diagnose and fix common issues with the Assistant Settings Sidebar. Each issue includes symptoms, causes, and step-by-step solutions.

## Table of Contents

1. [Sidebar Issues](#sidebar-issues)
2. [Form Issues](#form-issues)
3. [Validation Issues](#validation-issues)
4. [Draft Management Issues](#draft-management-issues)
5. [Permission Issues](#permission-issues)
6. [Performance Issues](#performance-issues)
7. [Integration Issues](#integration-issues)
8. [Browser-Specific Issues](#browser-specific-issues)

## Sidebar Issues

### Sidebar Won't Open

**Symptoms:**
- Clicking "Create Assistant" button does nothing
- No sidebar appears on screen
- No error messages in console

**Possible Causes:**
1. Context provider not wrapping component
2. State management issue
3. JavaScript error preventing execution
4. CSS z-index conflict

**Solutions:**

**Solution 1: Check Context Provider**
```typescript
// Ensure AssistantProvider wraps your component tree
// app/layout.tsx
import { AssistantProvider } from '@/contexts/AssistantContext';

export default function RootLayout({ children }) {
  return (
    <AssistantProvider>
      {children}
    </AssistantProvider>
  );
}
```

**Solution 2: Check Console for Errors**
```bash
# Open browser console (F12)
# Look for JavaScript errors
# Common errors:
# - "Cannot read property 'openCreateSidebar' of undefined"
# - "AssistantContext is not defined"
```

**Solution 3: Verify State Management**
```typescript
// Check if context methods exist
const { openCreateSidebar } = useAssistant();
console.log('openCreateSidebar:', openCreateSidebar); // Should not be undefined

// Test manually
<Button onClick={() => {
  console.log('Button clicked');
  openCreateSidebar();
}}>
  Create Assistant
</Button>
```

**Solution 4: Check CSS Z-Index**
```css
/* Ensure drawer has high z-index */
.ant-drawer {
  z-index: 1000 !important;
}

/* Check for conflicting elements */
.some-overlay {
  z-index: 999; /* Should be lower than drawer */
}
```

### Sidebar Opens But Is Empty

**Symptoms:**
- Sidebar appears but shows no content
- White/blank screen inside sidebar
- Loading spinner never stops

**Possible Causes:**
1. Component not rendering
2. Data not loading
3. Conditional rendering issue
4. CSS display issue

**Solutions:**

**Solution 1: Check Component Rendering**
```typescript
// Add debug logging
<AssistantSettingsSidebar
  visible={visible}
  mode={mode}
  onClose={() => {
    console.log('Closing sidebar');
    setVisible(false);
  }}
  onSave={async (data) => {
    console.log('Saving:', data);
    await handleSave(data);
  }}
/>
```

**Solution 2: Verify Data Loading**
```typescript
// Check if assistant data loads in edit mode
useEffect(() => {
  if (mode === 'edit' && assistantId) {
    const assistant = assistants.find(a => a.id === assistantId);
    console.log('Loading assistant:', assistant);
    setSelectedAssistant(assistant);
  }
}, [mode, assistantId, assistants]);
```

**Solution 3: Check Conditional Rendering**
```typescript
// Ensure conditions are met
{visible && (
  <AssistantSettingsSidebar
    visible={true} // Force visible for testing
    mode={mode || 'create'} // Provide default
    assistant={selectedAssistant}
    onClose={onClose}
    onSave={onSave}
  />
)}
```

### Sidebar Won't Close

**Symptoms:**
- Close button doesn't work
- ESC key doesn't close sidebar
- Clicking overlay doesn't close sidebar
- Sidebar stuck on screen

**Possible Causes:**
1. onClose handler not connected
2. State not updating
3. Event handler error
4. Modal/drawer configuration issue

**Solutions:**

**Solution 1: Check onClose Handler**
```typescript
// Ensure onClose updates state
const [visible, setVisible] = useState(false);

<AssistantSettingsSidebar
  visible={visible}
  onClose={() => {
    console.log('onClose called');
    setVisible(false); // Must update state
  }}
/>
```

**Solution 2: Force Close**
```typescript
// Add force close function
const forceClose = () => {
  setVisible(false);
  setMode('create');
  setSelectedAssistant(null);
};

// Use in emergency
<Button onClick={forceClose}>Force Close</Button>
```

**Solution 3: Check Drawer Props**
```typescript
<Drawer
  open={visible}
  onClose={onClose}
  maskClosable={true} // Allow clicking overlay to close
  keyboard={true}     // Allow ESC key to close
  closable={true}     // Show close button
>
  {/* Content */}
</Drawer>
```

## Form Issues

### Form Fields Not Updating

**Symptoms:**
- Typing in fields doesn't update value
- Fields show old data
- Changes don't persist

**Possible Causes:**
1. Controlled component issue
2. State not updating
3. Form instance not connected
4. Value prop conflict

**Solutions:**

**Solution 1: Use Form.useForm()**
```typescript
import { Form } from 'antd';

const [form] = Form.useForm();

<Form form={form}>
  {/* Form items */}
</Form>
```

**Solution 2: Check Value Binding**
```typescript
// Don't mix controlled and uncontrolled
// BAD:
<Input value={value} defaultValue="test" />

// GOOD:
<Input value={value} onChange={e => setValue(e.target.value)} />

// OR use Form.Item:
<Form.Item name="title">
  <Input />
</Form.Item>
```

**Solution 3: Debug State Updates**
```typescript
const handleChange = (changedValues: any, allValues: any) => {
  console.log('Changed:', changedValues);
  console.log('All values:', allValues);
  setFormData(allValues);
};

<Form onValuesChange={handleChange}>
  {/* Form items */}
</Form>
```

### Form Submission Not Working

**Symptoms:**
- Clicking save button does nothing
- Form doesn't validate
- onFinish not called
- No error messages

**Possible Causes:**
1. Validation failing silently
2. onFinish not connected
3. Button not triggering submit
4. Form instance issue

**Solutions:**

**Solution 1: Check Validation**
```typescript
// Manually trigger validation
const handleSubmit = async () => {
  try {
    const values = await form.validateFields();
    console.log('Valid values:', values);
    await onSave(values);
  } catch (error) {
    console.error('Validation failed:', error);
  }
};
```

**Solution 2: Verify Button Type**
```typescript
// Ensure button triggers form submit
<Button
  type="primary"
  htmlType="submit" // Important!
  onClick={handleSubmit} // Or use onClick
>
  Save
</Button>
```

**Solution 3: Check onFinish Handler**
```typescript
<Form
  form={form}
  onFinish={(values) => {
    console.log('Form submitted:', values);
    onSave(values);
  }}
  onFinishFailed={(errorInfo) => {
    console.error('Submit failed:', errorInfo);
  }}
>
  {/* Form items */}
</Form>
```

### Character Counter Not Updating

**Symptoms:**
- Counter shows 0/50 even when typing
- Counter doesn't update in real-time
- Counter shows wrong count

**Possible Causes:**
1. showCount prop not set
2. maxLength not set
3. Value not updating
4. Custom counter implementation issue

**Solutions:**

**Solution 1: Use Built-in Counter**
```typescript
<Input
  maxLength={50}
  showCount // Enable built-in counter
/>

<Input.TextArea
  maxLength={200}
  showCount
  rows={3}
/>
```

**Solution 2: Custom Counter**
```typescript
const [value, setValue] = useState('');

<div>
  <Input
    value={value}
    onChange={e => setValue(e.target.value)}
    maxLength={50}
  />
  <div style={{ textAlign: 'right', color: '#999' }}>
    {value.length}/50
  </div>
</div>
```

## Validation Issues

### Validation Not Showing Errors

**Symptoms:**
- Invalid data accepted
- No error messages displayed
- Red highlighting not appearing
- Can submit invalid form

**Possible Causes:**
1. Validation rules not defined
2. validateTrigger not set
3. Form.Item not wrapping input
4. Rules not applied correctly

**Solutions:**

**Solution 1: Define Validation Rules**
```typescript
<Form.Item
  name="title"
  label="Assistant Name"
  rules={[
    { required: true, message: 'Name is required' },
    { min: 1, max: 50, message: 'Name must be 1-50 characters' },
  ]}
>
  <Input />
</Form.Item>
```

**Solution 2: Set Validation Trigger**
```typescript
<Form
  validateTrigger={['onChange', 'onBlur']} // Validate on change and blur
>
  {/* Form items */}
</Form>
```

**Solution 3: Manual Validation**
```typescript
// Validate specific field
form.validateFields(['title'])
  .then(values => console.log('Valid:', values))
  .catch(error => console.error('Invalid:', error));

// Validate all fields
form.validateFields()
  .then(values => console.log('All valid:', values))
  .catch(error => console.error('Validation errors:', error));
```

### Validation Errors Persist After Fixing

**Symptoms:**
- Error message stays after correcting input
- Red highlighting doesn't clear
- Form still shows as invalid

**Possible Causes:**
1. Validation not re-running
2. Error state not clearing
3. Form not re-validating

**Solutions:**

**Solution 1: Clear Errors Manually**
```typescript
// Clear specific field error
form.setFields([
  {
    name: 'title',
    errors: [],
  },
]);

// Clear all errors
form.resetFields();
```

**Solution 2: Re-validate on Change**
```typescript
<Form
  onValuesChange={(changedValues) => {
    // Re-validate changed field
    const fieldName = Object.keys(changedValues)[0];
    form.validateFields([fieldName]);
  }}
>
  {/* Form items */}
</Form>
```

## Draft Management Issues

### Draft Not Saving

**Symptoms:**
- Draft recovery prompt never appears
- Data lost after closing sidebar
- localStorage empty

**Possible Causes:**
1. localStorage not available
2. Draft manager not initialized
3. Auto-save not triggered
4. Browser privacy settings

**Solutions:**

**Solution 1: Check localStorage**
```typescript
// Test localStorage availability
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage available');
} catch (error) {
  console.error('localStorage not available:', error);
}
```

**Solution 2: Manual Draft Save**
```typescript
import { assistantDraftManager } from '@/lib/services/assistantDraftManager';

// Save draft manually
const saveDraft = () => {
  const values = form.getFieldsValue();
  assistantDraftManager.saveDraft(values);
  console.log('Draft saved');
};

// Add save button
<Button onClick={saveDraft}>Save Draft</Button>
```

**Solution 3: Check Browser Settings**
```
1. Open browser settings
2. Go to Privacy & Security
3. Ensure "Block third-party cookies" is off
4. Ensure "Clear cookies on exit" is off
5. Try incognito/private mode to test
```

### Draft Not Recovering

**Symptoms:**
- Recovery prompt doesn't appear
- Draft data not loaded
- Old data shown instead of draft

**Possible Causes:**
1. Draft expired (>7 days)
2. Draft cleared prematurely
3. Wrong storage key
4. Data corruption

**Solutions:**

**Solution 1: Check Draft Existence**
```typescript
import { assistantDraftManager } from '@/lib/services/assistantDraftManager';

// Check if draft exists
if (assistantDraftManager.hasDraft()) {
  const draft = assistantDraftManager.loadDraft();
  console.log('Draft found:', draft);
  
  const timestamp = assistantDraftManager.getDraftTimestamp();
  console.log('Draft age:', new Date().getTime() - timestamp.getTime());
} else {
  console.log('No draft found');
}
```

**Solution 2: Inspect localStorage**
```javascript
// Open browser console
// Check localStorage contents
console.log(localStorage.getItem('assistant_draft'));

// Parse and inspect
const draft = JSON.parse(localStorage.getItem('assistant_draft'));
console.log('Draft data:', draft.data);
console.log('Draft timestamp:', draft.timestamp);
```

**Solution 3: Force Recovery**
```typescript
// Bypass expiry check for testing
const forceDraft = localStorage.getItem('assistant_draft');
if (forceDraft) {
  const draft = JSON.parse(forceDraft);
  form.setFieldsValue(draft.data);
}
```

## Permission Issues

### Can't Create Assistant

**Symptoms:**
- Create button not visible
- Create button disabled
- Permission error on save

**Possible Causes:**
1. User not authenticated
2. Permission check failing
3. Role not set correctly
4. Permission service issue

**Solutions:**

**Solution 1: Check Authentication**
```typescript
const currentUser = useCurrentUser();

if (!currentUser) {
  return <LoginPrompt />;
}

console.log('Current user:', currentUser);
console.log('User role:', currentUser.role);
```

**Solution 2: Check Permissions**
```typescript
import { assistantPermissionService } from '@/lib/services/assistantPermissionService';

const canCreate = assistantPermissionService.canCreate(currentUser);
console.log('Can create:', canCreate);

if (!canCreate) {
  return <Alert message="You don't have permission to create assistants" />;
}
```

**Solution 3: Bypass for Testing**
```typescript
// Temporarily bypass permission check
const canCreate = true; // Force true for testing

{canCreate && (
  <Button onClick={openCreateSidebar}>
    Create Assistant
  </Button>
)}
```

### Can't Edit Assistant

**Symptoms:**
- Edit button not visible
- Edit button disabled
- Permission error when opening sidebar

**Possible Causes:**
1. Not assistant owner
2. Not admin
3. Permission check failing
4. Assistant data missing author field

**Solutions:**

**Solution 1: Check Ownership**
```typescript
const currentUser = useCurrentUser();
const assistant = getAssistant(assistantId);

console.log('Current user ID:', currentUser.id);
console.log('Assistant author:', assistant.author);
console.log('Is owner:', currentUser.id === assistant.author);
console.log('Is admin:', currentUser.role === 'admin');
```

**Solution 2: Verify Permission Logic**
```typescript
import { assistantPermissionService } from '@/lib/services/assistantPermissionService';

const canEdit = assistantPermissionService.canEdit(currentUser, assistant);
console.log('Can edit:', canEdit);

// Check individual conditions
console.log('Is author:', currentUser.id === assistant.author);
console.log('Is admin:', currentUser.role === 'admin');
```

## Performance Issues

### Sidebar Slow to Open

**Symptoms:**
- Delay before sidebar appears
- Laggy animation
- UI freezes briefly

**Possible Causes:**
1. Large component tree
2. Heavy computations on mount
3. Not using lazy loading
4. Too many re-renders

**Solutions:**

**Solution 1: Lazy Load Sidebar**
```typescript
import dynamic from 'next/dynamic';

const AssistantSettingsSidebar = dynamic(
  () => import('@/components/AssistantSettingsSidebar'),
  { ssr: false }
);
```

**Solution 2: Optimize Rendering**
```typescript
import { memo } from 'react';

const AssistantForm = memo(({ initialData, onSubmit }) => {
  // Component code
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.initialData === nextProps.initialData;
});
```

**Solution 3: Reduce Initial Load**
```typescript
// Load emoji picker on demand
const [showEmojiPicker, setShowEmojiPicker] = useState(false);

{showEmojiPicker && (
  <EmojiPicker
    value={emoji}
    onChange={setEmoji}
  />
)}
```

### Form Typing Laggy

**Symptoms:**
- Delay when typing
- Characters appear slowly
- Input feels unresponsive

**Possible Causes:**
1. Too frequent validation
2. Heavy onChange handlers
3. Not using debouncing
4. Too many re-renders

**Solutions:**

**Solution 1: Debounce Validation**
```typescript
import { debounce } from 'lodash';

const debouncedValidate = debounce((fieldName) => {
  form.validateFields([fieldName]);
}, 300);

<Form
  onValuesChange={(changedValues) => {
    const fieldName = Object.keys(changedValues)[0];
    debouncedValidate(fieldName);
  }}
>
  {/* Form items */}
</Form>
```

**Solution 2: Optimize onChange**
```typescript
// Use useCallback to prevent recreation
const handleChange = useCallback((changedValues, allValues) => {
  // Only update what's necessary
  setFormData(prev => ({ ...prev, ...changedValues }));
}, []);
```

## Integration Issues

### Context Not Available

**Symptoms:**
- "useAssistant must be used within AssistantProvider" error
- Context methods undefined
- State not updating

**Solutions:**

**Solution 1: Wrap with Provider**
```typescript
// app/layout.tsx
import { AssistantProvider } from '@/contexts/AssistantContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AssistantProvider>
          {children}
        </AssistantProvider>
      </body>
    </html>
  );
}
```

**Solution 2: Check Import Path**
```typescript
// Ensure correct import
import { useAssistant } from '@/contexts/AssistantContext';

// Not from wrong path
// import { useAssistant } from './AssistantContext'; // Wrong!
```

### API Calls Failing

**Symptoms:**
- Network errors
- 404 or 500 errors
- Timeout errors
- CORS errors

**Solutions:**

**Solution 1: Check API Endpoint**
```typescript
// Verify endpoint exists
console.log('API URL:', '/api/assistants');

// Test with curl
// curl -X POST http://localhost:3000/api/assistants \
//   -H "Content-Type: application/json" \
//   -d '{"title":"Test","emoji":"🤖","desc":"Test","prompt":"Test"}'
```

**Solution 2: Check Request Format**
```typescript
// Log request data
const handleSave = async (data: AssistantFormData) => {
  console.log('Sending data:', JSON.stringify(data, null, 2));
  
  try {
    const response = await fetch('/api/assistants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data:', result);
  } catch (error) {
    console.error('Request failed:', error);
  }
};
```

## Browser-Specific Issues

### Safari Issues

**Issue: localStorage not working in private mode**

**Solution:**
```typescript
// Detect private mode
const isPrivateMode = () => {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return false;
  } catch {
    return true;
  }
};

if (isPrivateMode()) {
  message.warning('Draft saving disabled in private browsing mode');
}
```

### Firefox Issues

**Issue: Drawer animation stuttering**

**Solution:**
```css
/* Disable hardware acceleration */
.ant-drawer {
  transform: translateZ(0);
  will-change: transform;
}
```

### Edge Issues

**Issue: Form fields not focusing**

**Solution:**
```typescript
// Force focus after render
useEffect(() => {
  if (visible) {
    setTimeout(() => {
      const firstInput = document.querySelector('.ant-drawer input');
      firstInput?.focus();
    }, 300);
  }
}, [visible]);
```

## Getting More Help

If these solutions don't resolve your issue:

1. **Check Browser Console**: Look for error messages
2. **Check Network Tab**: Verify API calls
3. **Check React DevTools**: Inspect component state
4. **Enable Debug Mode**: Add console.log statements
5. **Create Minimal Reproduction**: Isolate the issue
6. **Report Bug**: Include all relevant information

### Bug Report Template

```markdown
**Environment:**
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Node version: [e.g., 18.17.0]
- Package versions: [from package.json]

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Console Errors:**
[Paste any error messages]

**Screenshots:**
[If applicable]

**Additional Context:**
[Any other relevant information]
```

## Preventive Measures

To avoid common issues:

1. **Keep Dependencies Updated**: Regularly update antd and related packages
2. **Test in Multiple Browsers**: Don't assume it works everywhere
3. **Use TypeScript**: Catch type errors early
4. **Write Tests**: Prevent regressions
5. **Monitor Performance**: Use React DevTools Profiler
6. **Handle Errors Gracefully**: Always have fallbacks
7. **Document Custom Changes**: Help future developers
8. **Follow Best Practices**: Stick to recommended patterns

## Quick Diagnostic Checklist

When troubleshooting, check these in order:

- [ ] Browser console shows no errors
- [ ] Context provider wraps component
- [ ] User is authenticated
- [ ] Permissions are correct
- [ ] API endpoints are accessible
- [ ] localStorage is available
- [ ] Form validation rules are defined
- [ ] State updates are working
- [ ] Network requests succeed
- [ ] Component props are correct
