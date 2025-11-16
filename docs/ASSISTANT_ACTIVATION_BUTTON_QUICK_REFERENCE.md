# AssistantActivationButton - Quick Reference

## Import

```typescript
import { AssistantActivationButton } from '@/components/AssistantActivationButton';
```

## Basic Usage

```tsx
<AssistantActivationButton
  assistant={assistant}
  onActivated={(assistant) => console.log('Activated:', assistant)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `assistant` | `Assistant` | Required | The assistant to activate |
| `onActivated` | `(assistant: Assistant) => void` | Optional | Callback after successful activation |
| `size` | `'small' \| 'middle' \| 'large'` | `'large'` | Button size |
| `block` | `boolean` | `true` | Whether button takes full width |
| `className` | `string` | `''` | Additional CSS class |

## States

### Not Added
- Text: "使用该助手进行聊天"
- Icon: MessageOutlined
- Color: Primary

### Adding
- Text: "添加中..."
- Icon: Loading spinner
- Disabled: true

### Added
- Text: "已添加"
- Icon: CheckCircleOutlined
- Color: Success

## Events

### switchToAssistant
Dispatched when user clicks "立即开始聊天"

```typescript
window.addEventListener('switchToAssistant', (event: CustomEvent) => {
  const { assistantId } = event.detail;
  // Navigate to chat with this assistant
});
```

## Integration Example

```tsx
// In AssistantDetail.tsx
import { AssistantActivationButton } from '@/components/AssistantActivationButton';

export const AssistantDetail = ({ assistant }) => {
  return (
    <div>
      <h1>{assistant.title}</h1>
      <p>{assistant.desc}</p>
      
      <AssistantActivationButton
        assistant={assistant}
        onActivated={(assistant) => {
          console.log('Activated:', assistant.title);
        }}
      />
    </div>
  );
};
```

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ ARIA labels for all states
- ✅ Screen reader support
- ✅ Focus indicators

## Styling

Uses CSS variables:
- `--heroui-primary`: Primary color
- `--heroui-success`: Success color
- `--heroui-foreground`: Text color

## Common Patterns

### With Custom Size
```tsx
<AssistantActivationButton
  assistant={assistant}
  size="middle"
  block={false}
/>
```

### With Callback
```tsx
<AssistantActivationButton
  assistant={assistant}
  onActivated={(assistant) => {
    // Track analytics
    trackEvent('assistant_activated', { id: assistant.id });
    
    // Show custom notification
    showNotification(`${assistant.title} 已添加`);
  }}
/>
```

### In a Card
```tsx
<Card>
  <CardHeader>
    <h2>{assistant.title}</h2>
  </CardHeader>
  <CardBody>
    <p>{assistant.desc}</p>
  </CardBody>
  <CardFooter>
    <AssistantActivationButton assistant={assistant} />
  </CardFooter>
</Card>
```

## Troubleshooting

### Button doesn't respond
- Check if `assistant` prop is valid
- Verify `useAssistantActivation` hook is working
- Check browser console for errors

### Success dialog doesn't show
- Verify `addAssistant` completes successfully
- Check if modal is being blocked by CSS

### "Start Chat" doesn't work
- Ensure event listener is set up for `switchToAssistant`
- Verify assistant ID is correct in event detail

## Related Components

- `useAssistantActivation` - Hook for activation logic
- `userAssistantService` - Service for managing user assistants
- `AssistantDetail` - Detail page where button is used

## Requirements

- Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 4.2, 4.3, 5.1, 5.2, 5.3, 7.2, 7.5, 10.1, 10.2, 10.3
- Design: See `.kiro/specs/assistant-activation-from-market/design.md`
