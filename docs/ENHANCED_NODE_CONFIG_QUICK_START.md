# Enhanced Node Configuration Modal - Quick Start Guide

## 🚀 Quick Start

### Basic Usage

1. **Open the Modal**
   - Double-click any node in the workflow canvas
   - The enhanced configuration modal will open

2. **Configure Parameters**
   - Navigate to the "参数配置" (Parameters) tab
   - Fill in the required fields (marked with red chips)
   - Adjust optional parameters as needed
   - Watch for real-time validation feedback

3. **Use Presets (Optional)**
   - Click the "预设模板" (Presets) tab
   - Browse available presets for your node type
   - Click "应用此预设" to apply a preset
   - Return to Parameters tab to fine-tune

4. **Read Documentation (Optional)**
   - Click the "使用说明" (Documentation) tab
   - Review usage steps and parameter descriptions
   - Check examples and tips
   - Note any warnings

5. **Save Configuration**
   - Ensure all validation errors are resolved
   - Click "保存配置" (Save Configuration)
   - Modal will close and node will be updated

## 📋 Common Workflows

### Configuring a PureChat AI Node

```
1. Open node configuration
2. Select an AI assistant from the dropdown
3. Enter your prompt in the text area
4. Adjust temperature (0=precise, 2=creative)
5. Set max tokens (100-4000)
6. Name your output variable
7. Save
```

**Or use a preset:**
- "创造性对话" for creative tasks
- "精确回答" for factual queries
- "平衡模式" for general use

### Configuring a YOLO Detection Node

```
1. Open node configuration
2. Choose model source (builtin/upload/url)
3. Select image source (camera/upload/variable)
4. Adjust confidence threshold (0.1-1.0)
5. Adjust IOU threshold for NMS
6. Optionally filter by classes
7. Enable "绘制检测结果" to visualize
8. Save
```

**Or use a preset:**
- "高准确度" for fewer false positives
- "高召回率" for detecting all objects
- "平衡模式" for general detection

### Configuring a Challenge Node

```
1. Open node configuration
2. Set challenge parameters (radius, speed, etc.)
3. Set timeout and scoring variable
4. Save
```

**Or use a preset:**
- "初学者模式" for practice
- "标准模式" for demonstrations
- "高级模式" for competitions

## ⚡ Tips & Tricks

### Validation Feedback
- ✅ **Green indicator**: All parameters valid, ready to save
- ❌ **Red borders**: Invalid parameter, check error message
- ⚠️ **Yellow chip**: Unsaved changes
- 🔴 **Red chip**: Required field

### Keyboard Shortcuts
- `Esc`: Close modal (with unsaved changes warning)
- `Enter`: Save configuration (when valid)
- `Tab`: Navigate between fields

### Best Practices

1. **Start with Presets**
   - Use presets as a starting point
   - Customize parameters after applying preset
   - Saves time and reduces errors

2. **Read Documentation First**
   - Check usage steps before configuring
   - Review parameter descriptions
   - Note warnings and tips

3. **Use Descriptive Variable Names**
   - Name output variables clearly
   - Use consistent naming conventions
   - Makes workflow easier to understand

4. **Validate Before Saving**
   - Check for validation errors
   - Review parameter values
   - Ensure all required fields are filled

## 🎯 Node-Specific Quick Guides

### PureChat Chat Node
**Required:**
- Assistant ID
- Prompt
- Output variable

**Tips:**
- Lower temperature (0-0.5) for factual tasks
- Higher temperature (1-2) for creative tasks
- Reference other variables in prompt: `{variable_name}`

### PureChat Image Analysis Node
**Required:**
- Assistant ID (must support vision)
- Image source
- Prompt
- Output variable

**Tips:**
- Be specific in your prompt
- Request structured output (JSON) for easier parsing
- Use camera source for real-time analysis

### UniPixel Segmentation Node
**Required:**
- Image source
- Query (object description)
- Output variable

**Tips:**
- Use specific object descriptions
- Separate multiple objects with commas
- Higher confidence = stricter segmentation
- More sample frames = better accuracy but slower

### YOLO Detection Node
**Required:**
- Model source
- Image source
- Output variable

**Tips:**
- Use builtin model for general objects
- Upload custom model for specific use cases
- Filter by classes to reduce false positives
- Adjust confidence based on your needs

### Challenge 8-Flight Node
**Required:**
- Radius (50-300cm)
- Speed (10-100cm/s)
- Loops (1-10)

**Tips:**
- Start with small radius and slow speed
- Ensure sufficient flight space
- Monitor battery level
- Score based on time and trajectory accuracy

### Challenge Precision Land Node
**Required:**
- Target coordinates (X, Y)
- Precision requirement (1-50cm)

**Tips:**
- Place visible marker at target
- Ensure good GPS signal
- Consider wind conditions
- Tighter precision = higher difficulty

## 🐛 Troubleshooting

### Modal Won't Open
- Check if node is selected
- Verify node type is supported
- Check browser console for errors

### Validation Errors Won't Clear
- Ensure value is within valid range
- Check for typos in required fields
- Try applying a preset and modifying

### Preset Not Applying
- Check if preset exists for node type
- Verify preset parameters are compatible
- Try refreshing the page

### Save Button Disabled
- Check for validation errors (red borders)
- Ensure all required fields are filled
- Review validation summary at bottom

### Changes Not Saving
- Check for validation errors
- Ensure you clicked "保存配置"
- Verify modal closed after save

## 📚 Additional Resources

### Documentation
- Each node has detailed documentation in the "使用说明" tab
- Includes usage steps, parameter descriptions, examples, tips, and warnings

### Presets
- Pre-configured templates for common scenarios
- Organized by difficulty or use case
- Can be customized after applying

### Validation
- Real-time feedback as you type
- Clear error messages
- Validation summary before save

## 🎓 Learning Path

### Beginner
1. Start with simple nodes (takeoff, land, move)
2. Use presets for complex nodes
3. Read documentation for each node type
4. Practice with safe parameters

### Intermediate
1. Customize preset parameters
2. Experiment with different settings
3. Combine multiple node types
4. Create reusable workflows

### Advanced
1. Create custom parameter combinations
2. Use variables to link nodes
3. Optimize parameters for performance
4. Build complex multi-stage workflows

## 💡 Pro Tips

1. **Use Presets as Templates**
   - Apply preset, then customize
   - Faster than configuring from scratch
   - Ensures valid parameter ranges

2. **Read Tips in Documentation**
   - Each node has specific tips
   - Learn best practices
   - Avoid common mistakes

3. **Name Variables Consistently**
   - Use descriptive names
   - Follow naming conventions
   - Makes debugging easier

4. **Test with Safe Parameters**
   - Start with conservative values
   - Gradually increase complexity
   - Monitor results carefully

5. **Save Frequently**
   - Don't lose your work
   - Test configurations incrementally
   - Keep backups of working configs

## 🔗 Related Features

- **Workflow Manager**: Save and load complete workflows
- **AI Workflow Generator**: Generate workflows from descriptions
- **Node Library**: Browse all available node types
- **Execution Engine**: Run configured workflows
- **Control Panel**: Monitor execution and results

## 📞 Need Help?

- Check node documentation in the modal
- Review examples for similar use cases
- Consult the main workflow documentation
- Test with preset configurations first

---

**Happy Configuring! 🎉**
