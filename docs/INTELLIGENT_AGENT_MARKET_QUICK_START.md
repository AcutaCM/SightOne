# Intelligent Agent Market Display - Quick Start Guide

## 🚀 Quick Overview

The Tello Intelligent Agent is now displayed in the market home page with a beautiful card interface. This guide will help you understand and use the new components.

## 📦 What's New

### 1. IntelligentAgentCard Component
A reusable card component that displays the Intelligent Agent with:
- Large emoji icon
- Title and system badge
- Short description
- Feature highlights (自然语言控制, 安全保障, 中英双语)
- Tags
- Action buttons

### 2. Detailed Modal View
Click "查看详情" to see:
- Full markdown description
- Usage examples
- Configuration requirements
- Safety tips
- Technical support info

### 3. Market Integration
The card is prominently displayed at the top of the market home page in a new "智能助理" section.

## 🎯 How to Use

### For Users

1. **Navigate to Market**: Open the chatbot and go to the "市场" tab
2. **Find Intelligent Agent**: It's at the top in the "智能助理" section
3. **View Details**: Click "查看详情" to see full information
4. **Activate**: Click "使用此助理" to start using it

### For Developers

#### Import the Component

```tsx
import { IntelligentAgentCard } from '@/components/ChatbotChat/IntelligentAgentCard';
```

#### Basic Usage

```tsx
<IntelligentAgentCard 
  onUseAssistant={(assistantId) => {
    console.log('Activating:', assistantId);
    // Your activation logic here
  }}
/>
```

#### Hide Detail Button

```tsx
<IntelligentAgentCard 
  onUseAssistant={handleActivation}
  showDetailButton={false}
/>
```

#### In Market Home

```tsx
import { MarketHomeBentoGrid } from '@/components/ChatbotChat/MarketHomeBentoGrid';

<MarketHomeBentoGrid 
  onAppSelect={(app) => console.log('App:', app)}
  onUseAssistant={(id) => console.log('Assistant:', id)}
/>
```

## 🎨 Visual Features

### Card Features
- ✨ Hover scale animation
- 🎯 System preset badge
- 🏷️ Feature highlights with icons
- 🔖 Tag display (up to 4)
- 📱 Responsive design

### Modal Features
- 📖 Full markdown rendering
- 🎨 Custom styled components
- 🚀 Quick action box
- 📏 Large scrollable view
- 🌓 Dark mode support

## 🔧 Customization

### Change Card Appearance

The card uses HeroUI theme colors. Customize by modifying:
- `className` prop for additional styles
- HeroUI theme variables in your config
- Component styles in the TSX file

### Modify Modal Content

The modal content comes from `INTELLIGENT_AGENT_DESCRIPTION` constant:
```typescript
import { INTELLIGENT_AGENT_DESCRIPTION } from '@/lib/constants/intelligentAgentPreset';
```

### Add Custom Actions

```tsx
<IntelligentAgentCard 
  onUseAssistant={(id) => {
    // 1. Set active assistant
    setActiveAssistant(id);
    
    // 2. Switch to chat
    switchToChat();
    
    // 3. Show welcome message
    showWelcome();
  }}
/>
```

## 📋 Props Reference

### IntelligentAgentCard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUseAssistant` | `(id: string) => void` | `undefined` | Callback when user activates assistant |
| `showDetailButton` | `boolean` | `true` | Show/hide "查看详情" button |

### MarketHomeBentoGrid

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onAppSelect` | `(app: any) => void` | `undefined` | Callback for app selection |
| `onUseAssistant` | `(id: string) => void` | `undefined` | Callback for assistant activation |

## 🐛 Troubleshooting

### Card Not Showing

**Problem**: Card doesn't appear in market
**Solution**: 
1. Check if intelligent agent preset is initialized
2. Verify AssistantContext is providing data
3. Check console for errors

### Modal Not Opening

**Problem**: "查看详情" button doesn't work
**Solution**:
1. Check if `showDetailButton` is true
2. Verify modal state management
3. Check for JavaScript errors

### Styling Issues

**Problem**: Card looks broken or unstyled
**Solution**:
1. Ensure HeroUI is properly configured
2. Check if theme CSS variables are loaded
3. Verify Tailwind CSS is working

## 📚 Related Documentation

- [Intelligent Agent Preset Service](./INTELLIGENT_AGENT_PRESET_SERVICE.md)
- [Intelligent Agent Setup](../python/INTELLIGENT_AGENT_SETUP.md)
- [Assistant Context Integration](./ASSISTANT_CONTEXT_INTEGRATION_GUIDE.md)
- [Market Display Complete](./INTELLIGENT_AGENT_MARKET_DISPLAY.md)

## 🎯 Next Steps

After the market display is working, you can:

1. **Implement Activation Logic** (Task 4)
   - Connect to AssistantContext
   - Switch to chat interface
   - Load assistant configuration

2. **Add Analytics**
   - Track card views
   - Monitor activation rate
   - Collect user feedback

3. **Enhance UX**
   - Add loading states
   - Implement error handling
   - Add success notifications

## 💡 Tips

- The card automatically fetches data from AssistantContext
- Modal content is rendered with custom markdown styles
- All colors use HeroUI theme variables for consistency
- Component is fully responsive and mobile-friendly

## 🎉 Success Criteria

You'll know it's working when:
- ✅ Card appears at top of market home
- ✅ Hover animation works smoothly
- ✅ "查看详情" opens modal with full content
- ✅ "使用此助理" triggers callback
- ✅ All icons and badges display correctly
- ✅ Works in both light and dark mode

## 📞 Support

If you encounter issues:
1. Check the console for errors
2. Verify all dependencies are installed
3. Review the full documentation
4. Check the implementation files for examples

---

**Status**: ✅ Task 3 Complete - Market Display Implemented
**Next**: Task 4 - Implement Assistant Activation Logic
