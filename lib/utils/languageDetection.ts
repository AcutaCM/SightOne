/**
 * Language Detection Utility
 * 
 * Automatically detects the language of user input and provides
 * appropriate responses in the detected language.
 */

export type SupportedLanguage = 'zh' | 'en';

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number;
  detectedPatterns: string[];
}

/**
 * Detect the language of the input text
 * 检测输入文本的语言
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      language: 'zh',
      confidence: 0.5,
      detectedPatterns: []
    };
  }

  const normalizedText = text.toLowerCase().trim();
  const detectedPatterns: string[] = [];
  let chineseScore = 0;
  let englishScore = 0;

  // Check for Chinese characters
  const chineseCharRegex = /[\u4e00-\u9fa5]/g;
  const chineseMatches = normalizedText.match(chineseCharRegex);
  if (chineseMatches) {
    chineseScore += chineseMatches.length * 2;
    detectedPatterns.push('chinese_characters');
  }

  // Check for English words
  const englishWordRegex = /[a-z]+/g;
  const englishMatches = normalizedText.match(englishWordRegex);
  if (englishMatches) {
    englishScore += englishMatches.length;
    detectedPatterns.push('english_words');
  }

  // Check for common Chinese drone command keywords
  const chineseKeywords = [
    '起飞', '降落', '悬停', '紧急', '停止',
    '向前', '向后', '向左', '向右', '向上', '向下',
    '顺时针', '逆时针', '旋转', '转',
    '厘米', '度', '电池', '电量', '状态',
    '飞', '移动', '查看', '获取'
  ];

  for (const keyword of chineseKeywords) {
    if (normalizedText.includes(keyword)) {
      chineseScore += 5;
      detectedPatterns.push(`chinese_keyword:${keyword}`);
    }
  }

  // Check for common English drone command keywords
  const englishKeywords = [
    'take off', 'takeoff', 'land', 'hover', 'emergency', 'stop',
    'forward', 'backward', 'back', 'left', 'right', 'up', 'down',
    'clockwise', 'counter', 'rotate', 'turn',
    'centimeter', 'cm', 'degree', 'battery', 'status',
    'fly', 'move', 'check', 'get'
  ];

  for (const keyword of englishKeywords) {
    if (normalizedText.includes(keyword)) {
      englishScore += 5;
      detectedPatterns.push(`english_keyword:${keyword}`);
    }
  }

  // Determine language based on scores
  const totalScore = chineseScore + englishScore;
  const language: SupportedLanguage = chineseScore > englishScore ? 'zh' : 'en';
  const confidence = totalScore > 0 ? Math.max(chineseScore, englishScore) / totalScore : 0.5;

  return {
    language,
    confidence,
    detectedPatterns
  };
}

/**
 * Get localized error messages based on detected language
 * 根据检测到的语言获取本地化错误消息
 */
export function getLocalizedErrorMessage(
  errorType: string,
  language: SupportedLanguage
): string {
  const errorMessages: Record<string, Record<SupportedLanguage, string>> = {
    ai_service_unavailable: {
      zh: 'AI服务不可用，请在设置中配置AI提供商',
      en: 'AI service unavailable, please configure AI provider in settings'
    },
    drone_not_connected: {
      zh: '无人机未连接，请先连接Tello无人机',
      en: 'Drone not connected, please connect to Tello drone first'
    },
    command_parse_failed: {
      zh: '命令解析失败，请检查您的指令格式',
      en: 'Command parsing failed, please check your command format'
    },
    command_execution_failed: {
      zh: '命令执行失败，请查看错误日志',
      en: 'Command execution failed, please check error logs'
    },
    invalid_parameter: {
      zh: '参数无效，请检查参数范围',
      en: 'Invalid parameter, please check parameter range'
    },
    unsafe_command: {
      zh: '命令不安全，请确保无人机已起飞',
      en: 'Unsafe command, please ensure drone has taken off'
    },
    connection_timeout: {
      zh: '连接超时，请检查网络连接',
      en: 'Connection timeout, please check network connection'
    },
    low_battery: {
      zh: '电池电量过低，请及时降落',
      en: 'Battery level too low, please land immediately'
    },
    unknown_error: {
      zh: '未知错误，请查看日志获取详细信息',
      en: 'Unknown error, please check logs for details'
    }
  };

  return errorMessages[errorType]?.[language] || errorMessages.unknown_error[language];
}

/**
 * Get localized success messages based on detected language
 * 根据检测到的语言获取本地化成功消息
 */
export function getLocalizedSuccessMessage(
  messageType: string,
  language: SupportedLanguage,
  params?: Record<string, any>
): string {
  const successMessages: Record<string, Record<SupportedLanguage, (params?: any) => string>> = {
    command_executed: {
      zh: (p) => `命令执行成功${p?.count ? `（${p.count}条命令）` : ''}`,
      en: (p) => `Command executed successfully${p?.count ? ` (${p.count} commands)` : ''}`
    },
    drone_connected: {
      zh: () => '无人机已连接',
      en: () => 'Drone connected'
    },
    takeoff_success: {
      zh: () => '无人机已起飞',
      en: () => 'Drone has taken off'
    },
    landing_success: {
      zh: () => '无人机已降落',
      en: () => 'Drone has landed'
    },
    battery_status: {
      zh: (p) => `电池电量: ${p?.level || 0}%`,
      en: (p) => `Battery level: ${p?.level || 0}%`
    },
    movement_complete: {
      zh: (p) => `移动完成: ${p?.description || ''}`,
      en: (p) => `Movement complete: ${p?.description || ''}`
    },
    rotation_complete: {
      zh: (p) => `旋转完成: ${p?.degrees || 0}度`,
      en: (p) => `Rotation complete: ${p?.degrees || 0} degrees`
    }
  };

  const messageFunc = successMessages[messageType]?.[language];
  return messageFunc ? messageFunc(params) : '';
}

/**
 * Get localized command description
 * 获取本地化命令描述
 */
export function getLocalizedCommandDescription(
  action: string,
  parameters: Record<string, any>,
  language: SupportedLanguage
): string {
  const descriptions: Record<string, Record<SupportedLanguage, (params: any) => string>> = {
    takeoff: {
      zh: () => '无人机起飞',
      en: () => 'Drone taking off'
    },
    land: {
      zh: () => '无人机降落',
      en: () => 'Drone landing'
    },
    emergency: {
      zh: () => '紧急停止',
      en: () => 'Emergency stop'
    },
    hover: {
      zh: () => '悬停',
      en: () => 'Hovering'
    },
    move_forward: {
      zh: (p) => `向前移动${p.distance || 30}厘米`,
      en: (p) => `Moving forward ${p.distance || 30} centimeters`
    },
    move_back: {
      zh: (p) => `向后移动${p.distance || 30}厘米`,
      en: (p) => `Moving backward ${p.distance || 30} centimeters`
    },
    move_left: {
      zh: (p) => `向左移动${p.distance || 30}厘米`,
      en: (p) => `Moving left ${p.distance || 30} centimeters`
    },
    move_right: {
      zh: (p) => `向右移动${p.distance || 30}厘米`,
      en: (p) => `Moving right ${p.distance || 30} centimeters`
    },
    move_up: {
      zh: (p) => `向上移动${p.distance || 30}厘米`,
      en: (p) => `Moving up ${p.distance || 30} centimeters`
    },
    move_down: {
      zh: (p) => `向下移动${p.distance || 30}厘米`,
      en: (p) => `Moving down ${p.distance || 30} centimeters`
    },
    rotate_clockwise: {
      zh: (p) => `顺时针旋转${p.degrees || 90}度`,
      en: (p) => `Rotating clockwise ${p.degrees || 90} degrees`
    },
    rotate_counter_clockwise: {
      zh: (p) => `逆时针旋转${p.degrees || 90}度`,
      en: (p) => `Rotating counter-clockwise ${p.degrees || 90} degrees`
    },
    get_battery: {
      zh: () => '获取电池电量',
      en: () => 'Getting battery level'
    },
    get_status: {
      zh: () => '获取无人机状态',
      en: () => 'Getting drone status'
    }
  };

  const descFunc = descriptions[action]?.[language];
  return descFunc ? descFunc(parameters) : action;
}

/**
 * Format command response in the detected language
 * 使用检测到的语言格式化命令响应
 */
export function formatCommandResponse(
  commands: Array<{
    action: string;
    parameters: Record<string, any>;
    description?: string;
  }>,
  language: SupportedLanguage
): string {
  const header = language === 'zh' 
    ? '已解析以下命令：' 
    : 'Parsed the following commands:';

  const commandList = commands.map((cmd, index) => {
    const desc = cmd.description || getLocalizedCommandDescription(
      cmd.action,
      cmd.parameters,
      language
    );
    return `${index + 1}. ${desc}`;
  }).join('\n');

  return `${header}\n${commandList}`;
}
