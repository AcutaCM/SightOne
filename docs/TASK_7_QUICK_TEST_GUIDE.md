# Task 7: Quick Test Guide

## Quick Test Steps

### Test 1: Create New Assistant
1. Navigate to the Market tab in the chatbot
2. Click the floating "+" button (bottom right)
3. **Expected**: Sidebar slides in from the right
4. **Expected**: Title shows "创建新助理"
5. Fill in the form:
   - Name: "Test Assistant"
   - Emoji: Select any emoji
   - Description: "This is a test"
   - Prompt: "You are a helpful assistant"
6. Click "创建助理"
7. **Expected**: Success message appears
8. **Expected**: Sidebar closes
9. **Expected**: New assistant appears in the list

### Test 2: Edit Existing Assistant
1. Find any assistant card in the Market or My Assistants
2. Click the edit icon (pencil)
3. **Expected**: Sidebar opens with assistant data
4. **Expected**: Title shows "编辑助理"
5. **Expected**: All fields are populated
6. Make a change (e.g., update description)
7. Click "保存"
8. **Expected**: Success message appears
9. **Expected**: Sidebar closes
10. **Expected**: Changes are reflected in the assistant card

### Test 3: Cancel Without Saving
1. Click the "+" button to create
2. Fill in some fields
3. Click the close button (X) or click outside
4. **Expected**: Unsaved changes warning appears (if implemented)
5. **Expected**: Sidebar closes

### Test 4: Responsive Design
1. **Desktop** (>1024px):
   - Sidebar should be 480px wide
   - Should slide in from right
   
2. **Tablet** (768px - 1024px):
   - Sidebar should be 70% width
   - Should slide in from right
   
3. **Mobile** (<768px):
   - Sidebar should be 100% width (fullscreen)
   - Should cover entire screen

## Expected Behavior

### Create Mode
- Empty form
- Title: "创建新助理"
- Save button: "创建助理"
- Status set to 'pending' after creation

### Edit Mode
- Pre-filled form with assistant data
- Title: "编辑助理"
- Save button: "保存" or "更新助理"
- Preserves assistant ID and metadata

## Common Issues

### Issue: Sidebar doesn't open
- Check browser console for errors
- Verify AssistantContext is properly wrapped
- Verify openCreateSidebar is called

### Issue: Form data not saving
- Check network tab for API calls
- Verify addAssistant/updateAssistant methods
- Check for validation errors

### Issue: Sidebar styling issues
- Check HeroUI theme is loaded
- Verify CSS modules are imported
- Check responsive breakpoints

## Success Criteria
✅ Create button opens sidebar (not modal)
✅ Edit button opens sidebar with data
✅ Form validation works
✅ Save creates/updates assistant
✅ Success messages appear
✅ Sidebar closes after save
✅ Responsive on all screen sizes
