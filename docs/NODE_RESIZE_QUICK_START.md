# Node Resize - Quick Start Guide

## 🎯 What's New

You can now resize workflow nodes by dragging a handle in the bottom-right corner!

## 🚀 How to Use

### Resizing a Node

1. **Find the Resize Handle**
   - Look for the grip icon (⋮⋮) in the bottom-right corner of any expanded node
   - The handle only appears when the node is expanded (not collapsed)

2. **Start Resizing**
   - Hover over the handle - it will highlight
   - Click and hold the handle
   - A size indicator will appear showing current dimensions

3. **Drag to Resize**
   - Move your mouse to resize the node
   - The node will resize in real-time
   - Size is automatically constrained between:
     - **Minimum**: 200px × 150px
     - **Maximum**: 600px × 800px

4. **Release to Finish**
   - Release the mouse button
   - The new size is automatically saved
   - The size indicator disappears

## 📐 Size Constraints

| Constraint | Value | Reason |
|------------|-------|--------|
| Min Width | 200px | Ensures header and controls are visible |
| Min Height | 150px | Ensures at least one parameter is visible |
| Max Width | 600px | Prevents nodes from dominating the canvas |
| Max Height | 800px | Keeps nodes manageable on screen |

## 🎨 Responsive Layout

The parameter list automatically adjusts based on node width:

### Single Column Layout
- **When**: Node width < 350px
- **Best for**: Narrow nodes, detailed parameter labels

```
┌─────────────────┐
│ Parameter 1     │
│ Parameter 2     │
│ Parameter 3     │
└─────────────────┘
```

### Double Column Layout
- **When**: Node width ≥ 450px
- **Best for**: Wide nodes, efficient space usage

```
┌─────────────────────────────┐
│ Parameter 1  │ Parameter 2  │
│ Parameter 3  │ Parameter 4  │
└─────────────────────────────┘
```

## 💡 Tips & Tricks

### Tip 1: Quick Reset
- Delete the node and re-add it to reset to default size
- Or use the advanced settings modal to set precise dimensions

### Tip 2: Optimal Sizes
- **Few parameters (1-3)**: Keep narrow (200-300px)
- **Medium parameters (4-6)**: Use standard (300-400px)
- **Many parameters (7+)**: Go wide (400-600px) for double column

### Tip 3: Visual Feedback
- Watch the size indicator while dragging for precise sizing
- The node border glows during resize to show active state

### Tip 4: Collapsed Nodes
- Resize handle is hidden when node is collapsed
- Expand the node first to access resize functionality

## 🔧 Technical Details

### What Gets Saved
- Custom size is saved in the node's `data.customSize` property
- Size persists when you save and reload the workflow
- Each node can have its own custom size

### Default Sizes
If you haven't manually resized a node, it uses these defaults:

| Mode | Parameters | Default Width |
|------|------------|---------------|
| Compact | < 3 | 240px |
| Standard | 3-6 | 280px |
| Extended | > 6 | 320px |
| Collapsed | Any | 280px |

### Performance
- Resize is smooth and real-time (no lag)
- No debouncing - updates happen immediately
- Efficient event handling with proper cleanup

## 🐛 Troubleshooting

### Handle Not Visible
- **Check**: Is the node expanded? Collapse/expand to toggle
- **Check**: Is the node selected? Try clicking on it

### Can't Resize Smaller
- You've hit the minimum size (200×150px)
- This ensures the node remains usable

### Can't Resize Larger
- You've hit the maximum size (600×800px)
- This prevents nodes from becoming too large

### Size Resets After Reload
- Make sure to save the workflow after resizing
- Check that the workflow save was successful

## 📊 Use Cases

### Use Case 1: Compact Dashboard
Resize nodes to be small and uniform for a clean, organized look:
- Set all nodes to 240px × 200px
- Use collapsed mode for nodes you don't need to see

### Use Case 2: Detailed Configuration
Make important nodes larger to see all parameters at once:
- Resize to 500px × 600px
- Use double column layout for efficiency
- Keep less important nodes small

### Use Case 3: Presentation Mode
Resize nodes for optimal visibility during demos:
- Make key nodes larger (400-600px wide)
- Use double column for complex nodes
- Collapse auxiliary nodes

## 🎓 Best Practices

1. **Consistency**: Try to keep similar nodes at similar sizes
2. **Hierarchy**: Make important nodes larger than supporting nodes
3. **Readability**: Don't make nodes too small - parameters should be readable
4. **Space**: Leave room between nodes for connections
5. **Testing**: Test your workflow at different zoom levels

## 🔗 Related Features

- **Node Collapse**: Minimize nodes to save space (click collapse button in header)
- **Advanced Settings**: Access detailed configuration (click settings button in header)
- **Parameter Priority**: Important parameters show first in compact mode
- **Virtual Scrolling**: Large parameter lists scroll smoothly

## 📝 Keyboard Shortcuts

Currently, resize is mouse-only. Future enhancements may include:
- Arrow keys for precise sizing
- Shift+Drag for aspect ratio lock
- Ctrl+Drag for snap to grid

## 🎉 Summary

Node resizing gives you complete control over your workflow layout:
- ✅ Drag the handle in the bottom-right corner
- ✅ Size constraints keep nodes usable
- ✅ Responsive layout adapts to width
- ✅ Custom sizes are saved automatically
- ✅ Smooth, real-time feedback

Happy resizing! 🚀
