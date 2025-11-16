# Workflow Editor User Guide

## Welcome to the Workflow Editor

The Workflow Editor is a powerful visual tool for creating and managing drone automation workflows. This guide will help you get started and master all features.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Creating Your First Workflow](#creating-your-first-workflow)
4. [Working with Nodes](#working-with-nodes)
5. [Connecting Nodes](#connecting-nodes)
6. [Configuring Parameters](#configuring-parameters)
7. [Running Workflows](#running-workflows)
8. [Saving and Loading](#saving-and-loading)
9. [Advanced Features](#advanced-features)
10. [Tips and Best Practices](#tips-and-best-practices)
11. [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing the Workflow Editor

1. Navigate to the main application
2. Click on the "Workflow" tab in the top navigation
3. The workflow editor will open with a blank canvas

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Minimum screen resolution: 1024x768
- JavaScript enabled
- WebSocket support for real-time features

## Interface Overview

The workflow editor consists of three main panels:

### Left Panel: Node Library

The node library contains all available workflow nodes organized by category:

- **Basic Nodes**: Start, End, Delay
- **Movement Nodes**: Takeoff, Land, Move, Rotate
- **Detection Nodes**: YOLO Detection, UniPixel Segmentation
- **AI Nodes**: PureChat Analysis, Image Analysis
- **Logic Nodes**: Condition, Loop, Switch
- **Data Nodes**: Variable, Storage, Transform
- **Challenge Nodes**: Special competition tasks

**Features:**
- 🔍 Search bar for quick node finding
- 📁 Collapsible categories
- 📌 Drag-and-drop to canvas
- ℹ️ Hover for node descriptions

### Center Panel: Canvas

The main workspace where you build your workflow:

- **Grid Background**: Helps with alignment
- **Zoom Controls**: Bottom-right corner
- **Mini-map**: Overview of entire workflow
- **Toolbar**: Quick access to common actions

**Navigation:**
- **Scroll Wheel**: Zoom in/out
- **Space + Drag**: Pan the canvas
- **Click + Drag**: Select multiple nodes
- **Double-click**: Edit node

### Right Panel: Control Panel

Monitor and control workflow execution:

- **Connection Status**: Drone and WebSocket indicators
- **Action Buttons**: Run, Stop, Save, Clear
- **Output Tabs**: Logs and Results
- **Export Options**: Download logs

## Creating Your First Workflow

Let's create a simple workflow that makes the drone take off, move forward, and land.

### Step 1: Add Start Node

1. Find "Start" in the Basic category
2. Drag it onto the canvas
3. Position it on the left side

### Step 2: Add Takeoff Node

1. Find "Takeoff" in the Movement category
2. Drag it next to the Start node
3. Double-click to configure height (default: 100cm)

### Step 3: Add Move Forward Node

1. Find "Move Forward" in Movement
2. Drag it after Takeoff
3. Configure distance (e.g., 50cm)

### Step 4: Add Land Node

1. Find "Land" in Movement
2. Drag it after Move Forward
3. No configuration needed

### Step 5: Add End Node

1. Find "End" in Basic
2. Drag it after Land
3. This marks workflow completion

### Step 6: Connect Nodes

1. Click on the right connection point of Start
2. Drag to the left connection point of Takeoff
3. Repeat for each subsequent node
4. You should see arrows connecting all nodes

### Step 7: Save Your Workflow

1. Click the "Save" button in the control panel
2. Enter a name: "My First Flight"
3. Add optional description
4. Click "Save"

### Step 8: Run Your Workflow

1. Ensure drone is connected (green indicator)
2. Click the "Run" button
3. Watch the logs for execution progress
4. Nodes will highlight as they execute

Congratulations! You've created your first workflow! 🎉

## Working with Nodes

### Adding Nodes

**Method 1: Drag and Drop**
1. Find node in library
2. Click and hold
3. Drag to canvas
4. Release to place

**Method 2: Click to Add**
1. Click node in library
2. Click on canvas where you want it
3. Node appears at click location

### Selecting Nodes

**Single Selection:**
- Click on a node

**Multiple Selection:**
- Hold Ctrl/Cmd and click nodes
- Or drag a selection box around nodes

### Moving Nodes

1. Click and hold on node
2. Drag to new position
3. Release to place
4. Alignment guides appear automatically

### Deleting Nodes

**Method 1: Keyboard**
- Select node(s)
- Press Delete or Backspace

**Method 2: Context Menu**
- Right-click node
- Select "Delete"

### Copying Nodes

1. Select node(s)
2. Press Ctrl+C (Cmd+C on Mac)
3. Press Ctrl+V to paste
4. Move pasted nodes to position

### Node Status Indicators

Nodes show their current status with colored indicators:

- 🔵 **Blue**: Idle (not executed)
- 🟡 **Yellow**: Running (currently executing)
- 🟢 **Green**: Success (completed successfully)
- 🔴 **Red**: Error (execution failed)

## Connecting Nodes

### Creating Connections

1. Click on output port (right side of node)
2. Drag to input port (left side of target node)
3. Release to create connection
4. Arrow appears showing flow direction

### Connection Rules

- Nodes can have multiple outputs
- Nodes can have multiple inputs
- Connections must flow left-to-right
- No circular connections allowed
- Start node must be first
- End node must be last

### Deleting Connections

**Method 1: Click**
- Click on the connection line
- Press Delete

**Method 2: Reconnect**
- Drag from output port
- Drop on empty space
- Connection is removed

### Connection Validation

The editor validates connections automatically:

- ✅ Valid connections show in blue
- ⚠️ Warnings show in yellow
- ❌ Invalid connections show in red

## Configuring Parameters

### Opening Node Editor

**Method 1: Double-click**
- Double-click on any node

**Method 2: Context Menu**
- Right-click node
- Select "Edit"

**Method 3: Selection**
- Select node
- Click "Edit" in toolbar

### Parameter Types

**Text Input:**
- Enter text values
- Example: Node name, message

**Number Input:**
- Enter numeric values
- Use up/down arrows
- Example: Distance, height

**Slider:**
- Drag slider for values
- Shows current value
- Example: Speed, angle

**Dropdown:**
- Select from options
- Example: Direction, mode

**Toggle:**
- On/off switch
- Example: Enable/disable features

**Color Picker:**
- Choose colors
- Example: LED colors

### Required Parameters

Parameters marked with a red asterisk (*) are required:
- Must be filled before saving
- Validation errors shown in red
- Save button disabled until valid

### Parameter Presets

Save time with parameter presets:

1. Click "Presets" button
2. Select a preset template
3. Parameters auto-fill
4. Customize as needed

**Creating Custom Presets:**
1. Configure parameters
2. Click "Save as Preset"
3. Enter preset name
4. Preset saved for future use

### Validation

Parameters are validated in real-time:

- ✅ Green checkmark: Valid
- ❌ Red X: Invalid
- ℹ️ Blue info: Helpful hints

Common validation rules:
- Number ranges (min/max)
- Required fields
- Format validation
- Logical constraints

### Saving Changes

1. Review all parameters
2. Fix any validation errors
3. Click "Save" button
4. Node updates on canvas

**Unsaved Changes:**
- Yellow dot appears on node
- Warning when closing editor
- Changes lost if not saved

## Running Workflows

### Pre-flight Checklist

Before running a workflow:

1. ✅ Drone is connected (green indicator)
2. ✅ Battery level is sufficient
3. ✅ All nodes are configured
4. ✅ Workflow is validated (no errors)
5. ✅ Safe flying area is clear

### Starting Execution

1. Click the "Run" button (large green button)
2. Workflow starts from Start node
3. Nodes execute in sequence
4. Progress shown in real-time

### Monitoring Execution

**Visual Feedback:**
- Current node highlights in yellow
- Completed nodes turn green
- Failed nodes turn red
- Progress bar shows completion

**Log Output:**
- Real-time log messages
- Color-coded by severity
- Timestamps for each event
- Node names for context

**Result Output:**
- Detection results
- Sensor readings
- Captured images
- Analysis data

### Stopping Execution

**Emergency Stop:**
1. Click "Stop" button (large red button)
2. Workflow halts immediately
3. Drone enters hover mode
4. Safe to resume or land manually

**Pause (if supported):**
1. Click "Pause" button
2. Execution pauses at current node
3. Click "Resume" to continue

### After Execution

**Success:**
- All nodes show green
- Results available in Results tab
- Workflow can be run again

**Failure:**
- Failed node shows red
- Error message in logs
- Fix issue and retry

## Saving and Loading

### Saving Workflows

**Quick Save:**
1. Click "Save" button
2. If already saved, updates existing
3. If new, prompts for name

**Save As:**
1. Click dropdown next to Save
2. Select "Save As"
3. Enter new name
4. Creates a copy

**Auto-save:**
- Enabled by default
- Saves every 2 minutes
- Draft saved to browser storage

### Loading Workflows

1. Click "Load" button
2. Browse saved workflows
3. Preview workflow details
4. Click "Load" to open

**Recent Workflows:**
- Quick access to recent files
- Shows last 10 workflows
- Click to load instantly

### Workflow Library

Access your workflow collection:

1. Click "Library" button
2. View all saved workflows
3. Search by name or tags
4. Sort by date or name
5. Delete unwanted workflows

### Exporting Workflows

**Export as JSON:**
1. Click "Export" dropdown
2. Select "JSON"
3. File downloads automatically
4. Can be imported later

**Export as Image:**
1. Click "Export" dropdown
2. Select "PNG" or "SVG"
3. Choose quality settings
4. Image downloads

### Importing Workflows

1. Click "Import" button
2. Select JSON file
3. Workflow loads on canvas
4. Save with new name

## Advanced Features

### Keyboard Shortcuts

Master these shortcuts for efficiency:

**General:**
- `Ctrl+S` - Save workflow
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+C` - Copy
- `Ctrl+V` - Paste
- `Delete` - Delete selection

**Navigation:**
- `Space+Drag` - Pan canvas
- `Ctrl+Scroll` - Zoom
- `Ctrl+0` - Reset zoom
- `Ctrl+F` - Fit to view

**Selection:**
- `Ctrl+A` - Select all
- `Ctrl+Click` - Multi-select
- `Shift+Click` - Range select

**Editing:**
- `Enter` - Edit selected node
- `Esc` - Close editor
- `Tab` - Next parameter
- `Shift+Tab` - Previous parameter

**Execution:**
- `F5` - Run workflow
- `F6` - Stop workflow
- `F7` - Validate workflow

See full list: Click "?" icon → "Keyboard Shortcuts"

### Multi-selection Operations

Select multiple nodes to:

**Align:**
- Align left/right/center
- Align top/bottom/middle
- Distribute evenly

**Group:**
- Move together
- Copy together
- Delete together

**Configure:**
- Batch parameter updates
- Apply presets to all

### Alignment Tools

Use alignment tools for professional layouts:

**Alignment Guides:**
- Appear when dragging nodes
- Show alignment with other nodes
- Snap to align automatically

**Alignment Toolbar:**
- Align selected nodes
- Distribute spacing
- Arrange in grid

**Grid Snap:**
- Enable in settings
- Nodes snap to grid
- Adjustable grid size

### Workflow Validation

Validate before running:

1. Click "Validate" button
2. System checks for:
   - Missing connections
   - Invalid parameters
   - Logic errors
   - Unreachable nodes
3. Review validation report
4. Fix issues highlighted

**Validation Levels:**
- 🔴 **Errors**: Must fix
- 🟡 **Warnings**: Should review
- 🔵 **Info**: Suggestions

### AI Workflow Generator

Let AI create workflows for you:

1. Click "AI Generate" button
2. Describe desired workflow
3. AI generates nodes and connections
4. Review and customize
5. Save or run

**Example Prompts:**
- "Create a square flight pattern"
- "Detect strawberries and count them"
- "Fly to QR code and land"

### Version History

Track workflow changes:

1. Click "History" button
2. View all saved versions
3. Compare versions
4. Restore previous version
5. Branch from any version

### Collaboration Features

Share workflows with team:

**Export for Sharing:**
- Export as JSON
- Share file via email/cloud
- Recipient imports file

**Workflow Templates:**
- Save as template
- Share template library
- Import community templates

## Tips and Best Practices

### Workflow Design

**Keep It Simple:**
- Start with basic workflows
- Add complexity gradually
- Test each addition

**Use Descriptive Names:**
- Name nodes clearly
- Add comments/descriptions
- Future you will thank you

**Modular Design:**
- Break complex tasks into steps
- Reuse common patterns
- Create template workflows

**Error Handling:**
- Add error checks
- Plan for failures
- Include recovery steps

### Performance Optimization

**Minimize Delays:**
- Use only necessary delays
- Optimize movement paths
- Reduce redundant operations

**Efficient Detection:**
- Adjust detection frequency
- Use appropriate confidence thresholds
- Cache results when possible

**Resource Management:**
- Monitor battery usage
- Manage memory efficiently
- Clean up after operations

### Safety First

**Always:**
- Test in safe environment
- Have manual override ready
- Monitor drone during execution
- Follow local regulations

**Never:**
- Fly near people
- Exceed safe distances
- Ignore low battery warnings
- Run untested workflows outdoors

### Testing Workflows

**Simulation Mode:**
- Test without drone
- Verify logic flow
- Check parameter values

**Incremental Testing:**
- Test one node at a time
- Verify each step works
- Build confidence gradually

**Edge Cases:**
- Test error conditions
- Try boundary values
- Handle unexpected inputs

## Troubleshooting

### Common Issues

**Drone Won't Connect:**
1. Check WiFi connection
2. Verify drone is powered on
3. Check battery level
4. Restart application
5. Restart drone

**Workflow Won't Run:**
1. Check validation errors
2. Verify all parameters set
3. Ensure drone connected
4. Check battery level
5. Review logs for errors

**Nodes Not Connecting:**
1. Check connection rules
2. Verify port compatibility
3. Look for circular connections
4. Ensure proper flow direction

**Parameters Won't Save:**
1. Check validation errors
2. Fill required fields
3. Fix invalid values
4. Try closing and reopening editor

**Canvas Performance Issues:**
1. Reduce number of nodes
2. Close other applications
3. Clear browser cache
4. Update browser
5. Reduce zoom level

### Error Messages

**"Invalid Connection":**
- Connection violates rules
- Check node compatibility
- Verify flow direction

**"Missing Required Parameter":**
- Required field not filled
- Check for red asterisks
- Fill all required fields

**"Workflow Validation Failed":**
- Workflow has errors
- Click "Validate" for details
- Fix highlighted issues

**"Execution Timeout":**
- Node took too long
- Check drone connection
- Verify node parameters
- Increase timeout if needed

**"Drone Connection Lost":**
- WiFi disconnected
- Drone out of range
- Battery depleted
- Restart connection

### Getting Help

**In-App Help:**
- Click "?" icon
- Search help topics
- View tutorials
- Check FAQ

**Documentation:**
- User guide (this document)
- API reference
- Video tutorials
- Example workflows

**Community:**
- User forums
- Discord channel
- GitHub discussions
- Stack Overflow

**Support:**
- Email: support@example.com
- Live chat (business hours)
- Bug reports on GitHub
- Feature requests

## Keyboard Shortcuts Reference

See [WORKFLOW_KEYBOARD_SHORTCUTS.md](./WORKFLOW_KEYBOARD_SHORTCUTS.md) for complete list.

## FAQ

See [WORKFLOW_FAQ.md](./WORKFLOW_FAQ.md) for frequently asked questions.

## What's Next?

Now that you know the basics:

1. ✅ Create more complex workflows
2. ✅ Explore advanced features
3. ✅ Share your workflows
4. ✅ Join the community
5. ✅ Provide feedback

Happy workflow building! 🚁✨
