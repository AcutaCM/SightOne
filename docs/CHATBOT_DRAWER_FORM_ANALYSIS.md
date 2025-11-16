# ChatbotChat 抽屉表单结构分析

## 概述
ChatbotChat 组件中的助手设置抽屉（第4257行）包含5个标签页，提供完整的助理配置功能。

## 表单结构

### 1. 助手信息 (info)
- **头像 URL** (`avatarUrl`): Input - 图片URL
- **头像 Emoji** (`avatarEmoji`): Input + Popover选择器
  - 显示当前选中的Emoji
  - Popover包含搜索功能
  - 网格显示600个Emoji供选择
- **头像背景色** (`avatarBg`): Input - CSS颜色值
- **名称** (`name`): Input - 助理名称
- **助手描述** (`description`): TextArea (2-6行)
- **标签** (`tags`): Input - 逗号分隔的标签

### 2. 角色设定 (role)
- **自定义 Prompt（System）** (`systemPrompt`): TextArea (6-12行)

### 3. 开场设置 (opening)
- **开场消息** (`openingMessage`): TextArea (4-10行) - 打开会话时的介绍
- **开场问题** (`openingQuestions`): TextArea (4-10行) - 每行一个引导问题

### 4. 聊天偏好 (chat)
- **用户输入预处理** (`preprocessTemplate`): TextArea (3-8行) - {input}为占位符
- **自动创建话题** (`autoCreateTopic`): Switch
- **消息阈值** (`autoCreateTopicThreshold`): Slider (1-200, 默认20)
- **限制历史消息数** (`historyLimit`): Slider (0-500, 默认0)
- **附带消息数** (`attachCount`): Slider (1-100, 默认20)
- **开启历史消息自动总结** (`enableAutoSummary`): Switch

### 5. 模型设置 (model)
- **启用流式输出** (`stream`): Switch
- **创意活跃度** (`creativity`): Slider (0-2, step 0.01, 默认0.7)
- **思维开放度** (`openness`): Slider (0-2, step 0.01, 默认1.0)
- **表述发散度** (`divergence`): Slider (0-2, step 0.01, 默认1.0)
- **词汇丰富度** (`vocabulary`): Slider (0-2, step 0.01, 默认1.0)
- **开启单次回复限制** (`singleReplyLimitEnabled`): Switch
- **单次回复最大 Tokens** (`singleReplyLimit`): Slider (128-65536, step 128, 默认2048)
- **开启推理强度调整** (`reasoningStrengthEnabled`): Switch
- **推理强度** (`reasoningStrength`): Slider (0-2, step 0.01, 默认1)

#### UniPixel-3B 分割配置
- **启用 UniPixel-3B 分割** (`unipixelEnabled`): Switch
- **模式** (`unipixelMode`): Select - 'local' | 'cloud'
- **自定义端点** (`unipixelEndpoint`): Input - 可选的自定义API端点

## 布局特点
- 使用 Ant Design 的 Tabs 组件
- 每个标签页使用 Form layout="vertical"
- 所有字段都有清晰的标签
- Slider 组件显示当前值
- 使用 Divider 分隔不同配置区域

## 验证规则
- 名称不能为空
- 所有文本字段都有合理的长度限制
- 数值字段有明确的范围限制

## 样式
- 使用 HeroUI 主题变量
- 响应式宽度：520px
- 底部固定的取消/保存按钮
- 表单字段间距合理

## 数据流
1. 从 `assistantSettingsMap` 读取当前助理的设置
2. 使用 `updateAssistantSettings` 更新设置
3. 保存时创建/更新 Assistant 对象
4. 支持重命名检测和会话键迁移
