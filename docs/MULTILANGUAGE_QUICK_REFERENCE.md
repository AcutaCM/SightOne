# Multi-Language Support Quick Reference
# 多语言支持快速参考

## Quick Start / 快速开始

### Using Chinese Commands / 使用中文命令
```
"起飞"                    → Takeoff
"向前飞50厘米"            → Fly forward 50cm
"向左转90度"              → Turn left 90 degrees
"降落"                    → Land
"查看电池电量"            → Check battery
```

### Using English Commands / 使用英文命令
```
"take off"                → 起飞
"fly forward 50cm"        → 向前飞50厘米
"turn left 90 degrees"    → 向左转90度
"land"                    → 降落
"check battery"           → 查看电池电量
```

## Key Functions / 关键函数

### Language Detection / 语言检测
```typescript
import { detectLanguage } from '@/lib/utils/languageDetection';

const result = detectLanguage("起飞并向前飞");
// result.language: 'zh'
// result.confidence: 0.95
```

### Localized Error Messages / 本地化错误消息
```typescript
import { getLocalizedErrorMessage } from '@/lib/utils/languageDetection';

const message = getLocalizedErrorMessage('ai_service_unavailable', 'zh');
// "AI服务不可用，请在设置中配置AI提供商"

const messageEn = getLocalizedErrorMessage('ai_service_unavailable', 'en');
// "AI service unavailable, please configure AI provider in settings"
```

### Error Handling / 错误处理
```typescript
import { parseError } from '@/lib/errors/intelligentAgentErrors';

try {
  // ... operation
} catch (err) {
  const error = parseError(err, { userCommand: "起飞" });
  const message = error.getLocalizedMessage(); // Auto-detects language
}
```

## Common Commands / 常用命令

| Chinese / 中文 | English / 英文 | Action |
|----------------|----------------|--------|
| 起飞 | take off | takeoff |
| 降落 | land | land |
| 悬停 | hover | hover |
| 紧急停止 | emergency stop | emergency |
| 向前飞 | fly forward | move_forward |
| 向后飞 | fly backward | move_back |
| 向左飞 | fly left | move_left |
| 向右飞 | fly right | move_right |
| 向上飞 | fly up | move_up |
| 向下飞 | fly down | move_down |
| 顺时针转 | rotate clockwise | rotate_clockwise |
| 逆时针转 | rotate counter-clockwise | rotate_counter_clockwise |
| 查看电池 | check battery | get_battery |
| 获取状态 | get status | get_status |

## Error Messages / 错误消息

| Error Type | Chinese / 中文 | English / 英文 |
|------------|----------------|----------------|
| AI Service Unavailable | AI服务暂时不可用 | AI service temporarily unavailable |
| Drone Not Connected | 无人机未连接 | Drone not connected |
| Command Parse Failed | 无法理解您的指令 | Unable to understand your command |
| Invalid Parameters | 指令参数不正确 | Invalid command parameters |
| Execution Failed | 指令执行失败 | Command execution failed |

## Tips / 提示

### For Best Results / 获得最佳效果

**Chinese / 中文:**
- 使用清晰、简洁的命令
- 包含具体的数值（如"50厘米"）
- 避免模糊的表达

**English / 英文:**
- Use clear, concise commands
- Include specific values (e.g., "50 centimeters")
- Avoid ambiguous expressions

### Language Detection / 语言检测

The system automatically detects language based on:
系统根据以下内容自动检测语言：

- Character type (Chinese vs English)
  字符类型（中文 vs 英文）
- Keywords in command
  命令中的关键词
- Context from previous commands
  之前命令的上下文

## Files / 文件

| File | Purpose |
|------|---------|
| `lib/utils/languageDetection.ts` | Language detection and localization utilities |
| `lib/errors/intelligentAgentErrors.ts` | Bilingual error handling |
| `lib/constants/intelligentAgentPreset.ts` | Bilingual prompt and descriptions |

## Documentation / 文档

- [Full Documentation](./INTELLIGENT_AGENT_MULTILANGUAGE_SUPPORT.md)
- [Error Handling Guide](./INTELLIGENT_AGENT_ERROR_HANDLING.md)
- [Setup Guide](./INTELLIGENT_AGENT_SETUP.md)

---

**Version / 版本:** 1.0.0
**Status / 状态:** ✅ Complete / 完成
