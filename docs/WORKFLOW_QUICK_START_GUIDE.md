# Workflow Editor - Quick Start Guide

## Accessing the Workflow Editor

### Direct URL
Navigate to: `http://localhost:3000/workflow`

### From Main Application
1. Click the component selector button (bottom right)
2. Select "Tello Workflow Panel"
3. Or use the Tools Panel → "Open Workflow Editor"

## Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Top Navigation                        │
├──────────┬────────────────────────────────────┬─────────────┤
│          │                                    │             │
│  Node    │                                    │  Control    │
│  Library │         Workflow Canvas            │  Panel      │
│          │                                    │             │
│  [Search]│  ┌──────────────────────────┐     │ [Status]    │
│          │  │                          │     │             │
│  Basic   │  │      Drag nodes here     │     │ [Run]       │
│  Movement│  │                          │     │ [Stop]      │
│  Detection│  │   ┌────┐    ┌────┐     │     │ [Save]      │
│  AI      │  │   │Node│───▶│Node│     │     │             │
│  Logic   │  │   └────┘    └────┘     │     │ [Logs]      │
│  Data    │  │                          │     │ [Results]   │
│          │  └──────────────────────────┘     │             │
│  [Stats] │  [MiniMap] [Zoom]                │ [Export]    │
└──────────┴────────────────────────────────────┴─────────────┘
```

## Creating Your First Workflow

### Step 1: Add Nodes
1. Browse the **Node Library** (left sidebar)
2. Search for nodes using the search box
3. Click a category to expand it
4. **Drag** a node onto the canvas

### Step 2: Connect Nodes
1. Click and drag from a node's **output handle** (right side)
2. Drop on another node's **input handle** (left side)
3. The connection will be created automatically

### Step 3: Configure Nodes
1. **Double-click** a node to open the editor
2. Fill in the required parameters
3. Click **Save** to apply changes

### Step 4: Run Workflow
1. Ensure WebSocket is connected (check status in Control Panel)
2. Click the **Run** button
3. Monitor progress in the **Logs** tab
4. View results in the **Results** tab

## Node Categories

### 🔵 Basic Nodes
- **Start**: Begin workflow execution
- **End**: Complete workflow execution
- **Delay**: Wait for specified time

### 🚁 Movement Nodes
- **Takeoff**: Drone takeoff
- **Land**: Drone landing
- **Move**: Move in direction
- **Rotate**: Rotate drone
- **Flip**: Perform flip maneuver

### 🔍 Detection Nodes
- **YOLO Detection**: Object detection
- **UniPixel Segmentation**: Image segmentation
- **QR Scan**: QR code detection

### 🤖 AI Nodes
- **PureChat Chat**: AI conversation
- **PureChat Image Analysis**: Image analysis
- **AI Diagnosis**: Plant diagnosis

### 🔀 Logic Nodes
- **Condition**: If-then-else logic
- **Loop**: Repeat actions
- **Switch**: Multiple conditions

### 💾 Data Nodes
- **Variable**: Store data
- **Transform**: Process data
- **Export**: Save results

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save workflow |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + A` | Select all nodes |
| `Delete` | Delete selected nodes |
| `Space + Drag` | Pan canvas |
| `Ctrl/Cmd + Scroll` | Zoom canvas |
| `Ctrl/Cmd + 0` | Reset zoom |
| `Ctrl/Cmd + F` | Focus search |

## Canvas Controls

### Zoom
- **Mouse Wheel**: Zoom in/out
- **Zoom Buttons**: Click +/- buttons
- **Keyboard**: Ctrl/Cmd + Scroll

### Pan
- **Space + Drag**: Pan canvas
- **Middle Mouse Button**: Pan canvas

### Selection
- **Click**: Select single node
- **Ctrl/Cmd + Click**: Multi-select
- **Drag**: Box select multiple nodes

## Control Panel Features

### Connection Status
- **Green**: Connected
- **Yellow**: Connecting
- **Red**: Disconnected

### Action Buttons
- **Run**: Start workflow execution
- **Stop**: Stop running workflow
- **Save**: Save current workflow
- **Clear**: Clear all nodes

### Logs Tab
- **Filter by Level**: info, warning, error, success
- **Search**: Filter by keyword
- **Clear**: Remove all logs
- **Export**: Download as JSON/TXT

### Results Tab
- View execution results
- See node outputs
- Export results data

## Saving and Loading

### Auto-Save
Workflows are automatically saved to localStorage when you click Save.

### Manual Save
1. Click the **Save** button
2. Workflow is saved to `workflow-current`

### Load Saved Workflow
1. Refresh the page
2. Saved workflow loads automatically

### Export Workflow
1. Click **Export** in Control Panel
2. Choose format (JSON/PNG/SVG)
3. Download file

## Tips and Best Practices

### Workflow Design
1. **Start Simple**: Begin with basic nodes
2. **Test Often**: Run workflow frequently
3. **Use Comments**: Add descriptions to nodes
4. **Organize**: Align nodes for clarity

### Performance
1. **Limit Nodes**: Keep workflows under 100 nodes
2. **Optimize Loops**: Avoid infinite loops
3. **Clean Up**: Remove unused nodes

### Debugging
1. **Check Logs**: Monitor execution logs
2. **Test Nodes**: Test individual nodes first
3. **Verify Connections**: Ensure proper connections
4. **Check Parameters**: Validate node parameters

## Common Issues

### Workflow Won't Run
- ✅ Check WebSocket connection
- ✅ Verify all nodes are configured
- ✅ Ensure nodes are connected properly
- ✅ Check for validation errors

### Nodes Not Connecting
- ✅ Ensure compatible node types
- ✅ Check handle positions
- ✅ Verify node is not locked

### Performance Issues
- ✅ Reduce number of nodes
- ✅ Simplify complex workflows
- ✅ Clear browser cache
- ✅ Restart application

## Getting Help

### Documentation
- [Integration Guide](./WORKFLOW_REDESIGN_INTEGRATION.md)
- [Component API](./WORKFLOW_COMPONENT_API.md)
- [Theme Guide](./WORKFLOW_THEME_USAGE_GUIDE.md)

### Support
- Check console for errors
- Review logs in Control Panel
- Verify WebSocket connection
- Test with simple workflow first

## Example Workflows

### Simple Takeoff and Land
```
[Start] → [Takeoff] → [Delay 3s] → [Land] → [End]
```

### Detection Mission
```
[Start] → [Takeoff] → [Move Forward] → [YOLO Detection] → [Land] → [End]
```

### AI Analysis
```
[Start] → [Takeoff] → [Capture Image] → [AI Diagnosis] → [Save Results] → [Land] → [End]
```

## Next Steps

1. **Explore Nodes**: Try different node types
2. **Build Workflows**: Create your own workflows
3. **Test Execution**: Run and debug workflows
4. **Share**: Export and share workflows

---

**Need More Help?**
- Check the full documentation
- Review example workflows
- Contact support team

**Happy Workflow Building! 🚁**
