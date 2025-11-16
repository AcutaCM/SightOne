# AssistantSettingsSidebar - Old Component Usage Record

## Date: 2025-11-04

## Purpose
Recording the usage locations of the old AssistantSettingsSidebar component before deletion, as required by Task 3.1.

## Component Location
- `drone-analyzer-nextjs/components/AssistantSettingsSidebar.tsx`
- `drone-analyzer-nextjs/components/LazyAssistantSettingsSidebar.tsx`

## Current Usage Locations
Based on code search, the component is currently NOT being used in any files. This suggests it was created but not yet integrated into the application.

## Component Features (Old Implementation)
The old implementation had:
- HeroUI Modal-based design
- Basic form fields through AssistantForm component
- Draft management
- Unsaved changes warning
- Permission controls
- Responsive design
- Animations

## Missing Features (Compared to ChatbotChat Drawer)
The old implementation was missing:
1. **Opening Settings Tab**: openingMessage, openingQuestions
2. **Chat Preferences Tab**: preprocessTemplate, autoCreateTopic, autoCreateTopicThreshold, historyLimit, attachCount, enableAutoSummary
3. **Model Settings Tab**: stream, creativity, openness, divergence, vocabulary, singleReplyLimit, reasoningStrength, unipixelEnabled, unipixelMode, unipixelEndpoint

## Next Steps
1. Delete the old component files
2. Create new component based on ChatbotChat drawer (line 4257)
3. Include all 5 tabs with complete functionality
4. Update any future references to use the new component

## Notes
- The old component used HeroUI components
- The new component should use Ant Design Drawer to match ChatbotChat
- All 5 tabs must be included: 助手信息, 角色设定, 开场设置, 聊天偏好, 模型设置
