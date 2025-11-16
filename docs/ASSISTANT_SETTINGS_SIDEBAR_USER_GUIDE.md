# Assistant Settings Sidebar - User Guide

## Introduction

The Assistant Settings Sidebar provides a streamlined interface for creating and editing AI assistants in the Drone Analyzer system. This guide will help you understand how to use all the features effectively.

## Table of Contents

1. [Creating a New Assistant](#creating-a-new-assistant)
2. [Editing an Existing Assistant](#editing-an-existing-assistant)
3. [Form Fields Explained](#form-fields-explained)
4. [Draft Management](#draft-management)
5. [Validation and Error Messages](#validation-and-error-messages)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Tips and Best Practices](#tips-and-best-practices)

## Creating a New Assistant

### Step 1: Open the Create Sidebar

1. Navigate to the Assistants section
2. Click the **"Create New Assistant"** button
3. The sidebar will slide in from the right side of the screen

### Step 2: Fill in Basic Information

#### Assistant Name
- Enter a descriptive name for your assistant (1-50 characters)
- Use clear, memorable names like "Code Helper" or "Data Analyst"
- Character count is displayed below the field

#### Icon Selection
- Click the emoji button to open the emoji picker
- Search for emojis using keywords (e.g., "robot", "brain")
- Browse categories: Smileys, Animals, Food, etc.
- Click an emoji to select it

#### Description
- Write a brief description (1-200 characters)
- Explain what the assistant does and when to use it
- Example: "Helps analyze drone flight data and generate reports"

### Step 3: Configure System Prompt

The system prompt defines your assistant's behavior and personality.

**Tips for writing good prompts:**
- Be specific about the assistant's role
- Include any special knowledge or expertise
- Define the tone and style of responses
- Mention any constraints or limitations

**Example:**
```
You are an expert drone flight analyst with deep knowledge of aerial 
photography and data analysis. You help users interpret flight data, 
identify issues, and optimize flight patterns. Always provide clear, 
actionable recommendations with safety as the top priority.
```

### Step 4: Add Tags (Optional)

Tags help organize and categorize assistants.

- Click "Add Tag" or press Enter after typing
- Maximum 5 tags per assistant
- Each tag can be up to 20 characters
- Remove tags by clicking the X icon

**Suggested tags:**
- By function: analysis, reporting, troubleshooting
- By domain: agriculture, inspection, mapping
- By skill level: beginner, advanced, expert

### Step 5: Set Visibility (Admin Only)

If you're an administrator, you can make assistants public:

- **Private**: Only you can see and use the assistant
- **Public**: All users can see and use the assistant

Toggle the "Public Assistant" switch to change visibility.

### Step 6: Save Your Assistant

1. Review all fields for accuracy
2. Click the **"Create Assistant"** button
3. Wait for the success confirmation
4. The sidebar will close automatically

## Editing an Existing Assistant

### Opening an Assistant for Editing

1. Find the assistant in your list
2. Click the **Edit** button (pencil icon)
3. The sidebar opens with current data pre-filled

### Making Changes

- Modify any field as needed
- Changes are validated in real-time
- Unsaved changes are indicated by a dirty state

### Saving Changes

1. Click **"Save Changes"** when done
2. Confirm if prompted about unsaved changes
3. Wait for the update confirmation

### Deleting an Assistant

**Warning: This action cannot be undone!**

1. Open the assistant for editing
2. Scroll to the bottom of the sidebar
3. Click the **"Delete Assistant"** button
4. Confirm the deletion in the dialog

**Note:** You can only delete assistants you created, unless you're an admin.

## Form Fields Explained

### Required Fields

All fields marked with an asterisk (*) are required:

| Field | Purpose | Validation |
|-------|---------|------------|
| Name | Identifies the assistant | 1-50 characters, alphanumeric |
| Icon | Visual identifier | Single emoji character |
| Description | Brief explanation | 1-200 characters |
| System Prompt | Defines behavior | 1-2000 characters |

### Optional Fields

| Field | Purpose | Validation |
|-------|---------|------------|
| Tags | Organization and search | Max 5 tags, 20 chars each |
| Public | Visibility setting | Admin only |

### Character Limits

Real-time character counters show:
- Current count / Maximum allowed
- Example: "25/50" means 25 characters used, 25 remaining
- Counter turns red when approaching limit

## Draft Management

The system automatically saves your work to prevent data loss.

### Auto-Save

- Drafts are saved every 30 seconds while you type
- Saved to your browser's local storage
- No internet connection required for draft saves

### Draft Recovery

If you close the sidebar without saving:

1. Reopen the create assistant sidebar
2. A prompt appears: "Recover unsaved draft?"
3. Click **"Recover"** to restore your work
4. Click **"Discard"** to start fresh

### Draft Expiration

- Drafts are kept for 7 days
- Expired drafts are automatically deleted
- Successful saves clear the draft

### Manual Draft Management

- **Save Draft**: Click "Save Draft" button (if available)
- **Clear Draft**: Successfully creating/updating clears the draft
- **Discard Draft**: Choose "Discard" in recovery prompt

## Validation and Error Messages

### Real-Time Validation

Fields are validated as you type:
- ✓ Green checkmark = Valid
- ✗ Red X = Invalid
- Error message appears below field

### Common Validation Errors

#### "Name is required"
- You must enter a name
- Name cannot be empty or only spaces

#### "Name must be between 1 and 50 characters"
- Name is too long
- Shorten to 50 characters or less

#### "Please select an emoji"
- No emoji selected
- Click the emoji button to choose one

#### "Description is required"
- Description field is empty
- Add a brief description

#### "Description must be between 1 and 200 characters"
- Description is too long
- Shorten to 200 characters or less

#### "System prompt is required"
- Prompt field is empty
- Add instructions for the assistant

#### "System prompt must be between 1 and 2000 characters"
- Prompt is too long
- Shorten to 2000 characters or less

#### "Maximum 5 tags allowed"
- You've added more than 5 tags
- Remove some tags before adding more

#### "Tag must be 20 characters or less"
- A tag is too long
- Shorten the tag text

### Network Errors

If save fails due to network issues:
- Error message displays at top of sidebar
- Your data is preserved in the form
- Draft is automatically saved
- Click "Retry" to try again

### Permission Errors

If you lack permission for an action:
- Clear error message explains the issue
- Contact an administrator if needed
- Your data is preserved

## Keyboard Shortcuts

Speed up your workflow with keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| `Tab` | Move to next field |
| `Shift+Tab` | Move to previous field |
| `Enter` | Submit form (when valid) |
| `Esc` | Close sidebar |
| `Ctrl+S` / `Cmd+S` | Save draft |

## Tips and Best Practices

### Writing Effective Names

✓ **Good:**
- "Flight Data Analyzer"
- "Safety Compliance Checker"
- "Report Generator Pro"

✗ **Avoid:**
- "Assistant 1"
- "Test"
- "asdfghjkl"

### Choosing the Right Icon

- Use relevant emojis that represent the function
- 🤖 for general AI assistants
- 📊 for data analysis
- 🛡️ for safety/compliance
- 📝 for documentation/reports
- 🔍 for inspection/detection

### Writing Clear Descriptions

✓ **Good:**
"Analyzes drone flight logs to identify anomalies and suggest optimizations for battery life and flight efficiency."

✗ **Avoid:**
"Does stuff with drones."

### Crafting System Prompts

**Structure your prompts:**

1. **Role Definition**
   ```
   You are an expert in [domain] with [X] years of experience.
   ```

2. **Capabilities**
   ```
   You can help users with:
   - Task 1
   - Task 2
   - Task 3
   ```

3. **Behavior Guidelines**
   ```
   Always:
   - Be clear and concise
   - Prioritize safety
   - Provide actionable advice
   
   Never:
   - Make assumptions without data
   - Recommend unsafe practices
   ```

4. **Response Format**
   ```
   Format your responses with:
   - Clear headings
   - Bullet points for lists
   - Code blocks for technical details
   ```

### Using Tags Effectively

**Organize by:**
- **Function**: analysis, reporting, monitoring
- **Domain**: agriculture, construction, inspection
- **Complexity**: basic, intermediate, advanced
- **Data Type**: images, logs, telemetry

**Example tag sets:**
- Agriculture assistant: `agriculture`, `crop-analysis`, `multispectral`, `reporting`, `advanced`
- Safety checker: `safety`, `compliance`, `inspection`, `basic`, `regulatory`

### Managing Multiple Assistants

1. **Use consistent naming conventions**
   - Prefix by category: "Analysis: Flight Data"
   - Suffix by version: "Report Generator v2"

2. **Keep descriptions unique**
   - Clearly differentiate similar assistants
   - Explain when to use each one

3. **Review and update regularly**
   - Update prompts based on user feedback
   - Remove outdated assistants
   - Consolidate similar assistants

### Avoiding Common Mistakes

❌ **Don't:**
- Leave fields empty and try to save
- Use special characters in names
- Write vague descriptions
- Create duplicate assistants
- Forget to save your work

✓ **Do:**
- Fill all required fields completely
- Use clear, descriptive language
- Test your assistant after creating
- Save drafts frequently
- Review before publishing (if admin)

## Mobile Usage

The sidebar is fully responsive:

### On Tablets
- Sidebar takes 70% of screen width
- All features available
- Touch-friendly controls

### On Phones
- Sidebar is full-screen
- Optimized layout for small screens
- Swipe to close (in addition to close button)

## Troubleshooting

### Sidebar Won't Open
- Check if you're logged in
- Verify you have permission to create assistants
- Try refreshing the page

### Can't Save Assistant
- Check all required fields are filled
- Look for validation errors (red text)
- Verify internet connection
- Check browser console for errors

### Draft Not Recovering
- Drafts expire after 7 days
- Check if you're in the same browser
- Local storage might be disabled
- Try clearing browser cache

### Emoji Picker Not Working
- Try clicking the emoji button again
- Check if JavaScript is enabled
- Try a different browser
- Report the issue to support

## Getting Help

If you encounter issues:

1. Check this user guide
2. Review the [Troubleshooting Guide](./ASSISTANT_SETTINGS_SIDEBAR_TROUBLESHOOTING.md)
3. Contact your system administrator
4. Submit a bug report with:
   - What you were trying to do
   - What happened instead
   - Any error messages
   - Browser and OS information

## Feedback

We're constantly improving the assistant creation experience. Share your feedback:

- Suggest new features
- Report usability issues
- Share success stories
- Request additional documentation

Your input helps make the system better for everyone!
