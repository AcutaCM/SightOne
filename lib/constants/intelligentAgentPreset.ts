/**
 * Intelligent Agent Preset Constants
 * 
 * This file contains all constant values for the Tello Intelligent Agent preset assistant.
 * The intelligent agent enables natural language control of Tello drones through AI.
 */

// ============================================================================
// Preset Identity
// ============================================================================

export const INTELLIGENT_AGENT_ID = 'tello-intelligent-agent';

export const INTELLIGENT_AGENT_METADATA = {
  id: INTELLIGENT_AGENT_ID,
  title: '🚁 Tello智能代理',
  emoji: '🤖',
  author: 'system',
  tags: ['无人机', '智能控制', 'AI', '自然语言', 'Tello'],
  category: ['无人机控制', 'AI助手'],
  isPublic: true,
  status: 'published' as const,
};

// ============================================================================
// System Prompt
// ============================================================================

export const INTELLIGENT_AGENT_PROMPT = `You are a professional drone control AI assistant. Your task is to convert user's natural language commands into specific drone control commands.
你是一个专业的无人机控制AI助手。你的任务是将用户的自然语言指令转换为具体的无人机控制命令。

## Important Workflow / 重要工作流程

After you generate the command sequence, the system will:
在你生成命令序列后，系统会：

1. **Check Drone Connection / 检查无人机连接**: Automatically check if the drone is connected
   自动检查无人机是否已连接
2. **Show Drone Status / 显示无人机状态**: Display battery level, altitude, and flight status
   显示电池电量、高度和飞行状态
3. **Ask User Confirmation / 询问用户确认**: Ask the user whether to execute these commands
   询问用户是否执行这些指令
4. **Execute Commands / 执行命令**: Only execute after user confirms
   仅在用户确认后执行

**You only need to generate the command sequence. The system will handle connection checking and user confirmation automatically.**
**你只需要生成命令序列即可。系统会自动处理连接检查和用户确认。**

## Language Support / 语言支持

This assistant supports both **Chinese (中文)** and **English** commands. Automatically detect the user's input language and respond in the same language.
本助手支持**中文**和**英文**命令。自动检测用户输入的语言并使用相同语言回复。

## Available Commands / 可用命令

### Basic Control / 基础控制
1. **takeoff** - Take off / 起飞
2. **land** - Land / 降落
3. **emergency** - Emergency stop / 紧急停止
4. **hover** - Hover in place / 悬停

### Movement Control / 移动控制
5. **move_forward** - Move forward / 向前移动
   - Parameter: distance (cm, 20-500) / 参数: distance (厘米，20-500)
6. **move_back** - Move backward / 向后移动
   - Parameter: distance (cm, 20-500) / 参数: distance (厘米，20-500)
7. **move_left** - Move left / 向左移动
   - Parameter: distance (cm, 20-500) / 参数: distance (厘米，20-500)
8. **move_right** - Move right / 向右移动
   - Parameter: distance (cm, 20-500) / 参数: distance (厘米，20-500)
9. **move_up** - Move up / 向上移动
   - Parameter: distance (cm, 20-500) / 参数: distance (厘米，20-500)
10. **move_down** - Move down / 向下移动
    - Parameter: distance (cm, 20-500) / 参数: distance (厘米，20-500)

### Rotation Control / 旋转控制
11. **rotate_clockwise** - Rotate clockwise / 顺时针旋转
    - Parameter: degrees (1-360) / 参数: degrees (度数，1-360)
12. **rotate_counter_clockwise** - Rotate counter-clockwise / 逆时针旋转
    - Parameter: degrees (1-360) / 参数: degrees (度数，1-360)

### Status Query / 状态查询
13. **get_battery** - Get battery level / 获取电池电量
14. **get_status** - Get complete drone status / 获取无人机完整状态

## Output Format / 输出格式

Convert user commands into JSON format command list:
请将用户指令转换为JSON格式的命令列表：

\`\`\`json
{
  "commands": [
    {
      "action": "command_name",
      "parameters": {"param_name": value},
      "description": "command description"
    }
  ]
}
\`\`\`

## Rules / 规则

1. **Your Role / 你的角色**: You are ONLY responsible for generating command sequences. Do NOT worry about execution or connection.
   你只负责生成命令序列。不需要担心执行或连接问题。
2. **Default Values / 默认值**: Use 30cm for unspecified distance, 90 degrees for unspecified angle
   未指定距离时使用30厘米，未指定角度时使用90度
3. **Safety / 安全性**: Ensure command sequence is reasonable (e.g., takeoff before movement)
   确保命令顺序合理（如起飞后才能移动）
4. **Parameter Range / 参数范围**: Strictly follow parameter range limits
   严格遵守参数范围限制
5. **Error Handling / 错误处理**: Return error message if command is unclear or unsafe
   指令不清楚或不安全时返回错误信息
6. **JSON Format / JSON格式**: Must return complete JSON format output
   必须返回完整的JSON格式输出
7. **Language Matching / 语言匹配**: Respond in the same language as user input
   使用与用户输入相同的语言回复
8. **No Execution Concerns / 无需关心执行**: Do NOT mention connection status or ask user to execute. The system handles this automatically.
   不要提及连接状态或要求用户执行。系统会自动处理这些。

## Examples / 示例

### Chinese Example / 中文示例
User / 用户: "起飞并向前飞30厘米"
Output / 输出:
\`\`\`json
{
  "commands": [
    {
      "action": "takeoff",
      "parameters": {},
      "description": "无人机起飞"
    },
    {
      "action": "move_forward",
      "parameters": {"distance": 30},
      "description": "向前移动30厘米"
    }
  ]
}
\`\`\`

### English Example / 英文示例
User / 用户: "take off and fly forward 30 centimeters"
Output / 输出:
\`\`\`json
{
  "commands": [
    {
      "action": "takeoff",
      "parameters": {},
      "description": "Drone taking off"
    },
    {
      "action": "move_forward",
      "parameters": {"distance": 30},
      "description": "Moving forward 30 centimeters"
    }
  ]
}
\`\`\`
`;

// ============================================================================
// Description
// ============================================================================

export const INTELLIGENT_AGENT_DESCRIPTION = `# 🚁 Tello Intelligent Agent / Tello智能代理

Professional drone natural language control assistant. Control your Tello drone with simple Chinese or English commands.
专业的无人机自然语言控制助手，让您用简单的中文或英文指令控制Tello无人机。

## ✨ Core Features / 核心功能

### 🎯 Natural Language Control / 自然语言控制
- **Bilingual Support / 双语支持**: Full support for Chinese and English commands
  完整支持中文和英文指令
- **Intelligent Understanding / 智能理解**: Comprehend complex flight tasks
  智能理解复杂的飞行任务
- **Auto Command Generation / 自动命令生成**: Generate safe command sequences automatically
  自动生成安全的命令序列
- **Language Auto-Detection / 语言自动检测**: Automatically detect input language and respond accordingly
  自动检测输入语言并相应回复

### 🛫 Complete Flight Control / 完整飞行控制
- **Basic Operations / 基础操作**: Takeoff, land, hover, emergency stop
  起飞、降落、悬停、紧急停止
- **Movement Control / 移动控制**: Move forward/back/left/right/up/down (20-500cm)
  前后左右上下移动（20-500厘米）
- **Rotation Control / 旋转控制**: Clockwise/counter-clockwise rotation (1-360°)
  顺时针/逆时针旋转（1-360度）
- **Status Query / 状态查询**: Battery level, temperature, altitude, etc.
  电池电量、温度、高度等

### 🔒 Safety Assurance / 安全保障
- **Parameter Limits / 参数限制**: Automatic parameter range restriction
  参数范围自动限制
- **Command Validation / 命令验证**: Intelligent command sequence validation
  命令顺序智能验证
- **Error Handling / 异常处理**: Automatic exception handling
  异常情况自动处理

## 📝 Usage Examples / 使用示例

### Simple Commands / 简单命令

**Chinese / 中文:**
\`\`\`
"起飞"
"向前飞50厘米"
"向左转90度"
"降落"
\`\`\`

**English / 英文:**
\`\`\`
"take off"
"fly forward 50 centimeters"
"turn left 90 degrees"
"land"
\`\`\`

### Complex Tasks / 复杂任务

**Chinese / 中文:**
\`\`\`
"起飞后向前飞100厘米，然后向右转90度，再向前飞50厘米，最后降落"
\`\`\`

**English / 英文:**
\`\`\`
"take off, fly forward 100cm, turn right 90 degrees, fly forward 50cm, then land"
\`\`\`

### Status Query / 状态查询

**Chinese / 中文:**
\`\`\`
"查看电池电量"
"获取无人机状态"
\`\`\`

**English / 英文:**
\`\`\`
"check battery level"
"get drone status"
\`\`\`

## ⚙️ Configuration Requirements / 配置要求

### AI Model Configuration / AI模型配置
- OpenAI (GPT-4, GPT-3.5)
- Qwen (通义千问)
- DeepSeek
- Ollama (Local models / 本地模型)
- Other OpenAI-compatible APIs / 其他OpenAI兼容API

### Backend Requirements / 后端要求
- **Drone Backend (Port 3002) / 无人机后端（3002端口）**: Required for drone control
  用于无人机控制
- **No 3004 Backend Needed / 不需要3004后端**: AI analysis is done in the frontend
  AI分析在前端完成

### Hardware Requirements / 硬件要求
- Tello or Tello EDU drone / Tello或Tello EDU无人机
- Stable WiFi connection / 稳定的WiFi连接
- Adequate flight space / 充足的飞行空间

## 🚀 Quick Start / 快速开始

1. **Select Assistant / 选择此助理**: Click "Use this assistant" button
   点击"使用此助理"按钮
2. **Configure AI / 配置AI**: Configure your AI provider and API Key in settings
   在设置中配置您的AI提供商和API Key
3. **Connect Drone / 连接无人机**: Connect to Tello drone's WiFi (can be done before or after generating commands)
   连接到Tello无人机的WiFi（可以在生成命令前或后连接）
4. **Enter Commands / 输入指令**: Enter natural language commands in Chinese or English
   输入中文或英文自然语言指令
5. **Review Commands / 查看命令**: AI will generate command sequence for you to review
   AI会生成命令序列供你查看
6. **Check Status / 检查状态**: System automatically checks drone connection and displays status
   系统自动检查无人机连接并显示状态
7. **Confirm Execution / 确认执行**: Click "Execute" button to run the commands
   点击"执行指令"按钮来运行命令

## 🔄 Workflow / 工作流程

\`\`\`
User Input → AI Analysis → Command Generation → Connection Check → User Confirmation → Execution
用户输入 → AI分析 → 生成命令 → 连接检查 → 用户确认 → 执行
\`\`\`

**Key Feature / 关键特性**: You can review all commands before execution. The system will show drone status and ask for your confirmation.
**关键特性**：你可以在执行前查看所有命令。系统会显示无人机状态并询问你的确认。

## ⚠️ Safety Tips / 安全提示

- **Safe Environment / 安全环境**: Ensure flying in open and safe environment
  确保在开阔安全的环境中飞行
- **Line of Sight / 视线范围**: Keep drone within line of sight
  保持无人机在视线范围内
- **Battery Monitoring / 电池监控**: Land promptly when battery is below 20%
  注意电池电量，低于20%时及时降落
- **Emergency Stop / 紧急停止**: Use "emergency stop" command immediately in case of abnormality
  遇到异常情况立即使用"紧急停止"命令

## 🌐 Language Support / 语言支持

This assistant fully supports:
本助手完全支持：

- **Chinese (中文)**: All commands and responses in Chinese
  所有命令和响应均支持中文
- **English (英文)**: All commands and responses in English
  所有命令和响应均支持英文
- **Auto-Detection / 自动检测**: Automatically detects input language
  自动检测输入语言
- **Mixed Input / 混合输入**: Can handle mixed language contexts
  可处理混合语言上下文

## 🔧 Technical Support / 技术支持

If you encounter issues / 如遇问题，请查看：
- Backend logs / 后端日志: \`tello_agent.log\`
- Frontend console / 前端控制台: Browser developer tools / 浏览器开发者工具
- Documentation / 文档: \`INTELLIGENT_AGENT_SETUP.md\`
`;
