/**
 * Tello AI 解析器错误处理工具
 * 提供 AI 解析错误分类、友好提示和重试建议
 */

export type AIParserErrorType =
  | 'API_KEY_MISSING'
  | 'API_KEY_INVALID'
  | 'API_REQUEST_FAILED'
  | 'API_RATE_LIMIT'
  | 'API_TIMEOUT'
  | 'RESPONSE_PARSE_FAILED'
  | 'INVALID_COMMAND_FORMAT'
  | 'UNSUPPORTED_COMMAND'
  | 'PARAMETER_VALIDATION_FAILED'
  | 'EMPTY_INPUT'
  | 'AMBIGUOUS_INPUT'
  | 'UNSAFE_COMMAND'
  | 'UNKNOWN_ERROR';

export interface AIParserError {
  type: AIParserErrorType;
  message: string;
  originalError?: Error;
  timestamp: Date;
  retryable: boolean;
  userInput?: string;
}

/**
 * AI 解析器错误处理器类
 */
export class AIParserErrorHandler {
  /**
   * 处理 AI 解析错误
   */
  static handleError(error: Error | string, userInput?: string): AIParserError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const parserError = this.classifyError(errorMessage, error instanceof Error ? error : undefined);
    
    parserError.userInput = userInput;
    parserError.timestamp = new Date();

    console.error(`[AI Parser Error] ${parserError.type}:`, parserError.message, {
      userInput,
      timestamp: parserError.timestamp,
      retryable: parserError.retryable
    });

    return parserError;
  }

  /**
   * 分类错误类型
   */
  private static classifyError(errorMessage: string, originalError?: Error): AIParserError {
    let type: AIParserErrorType = 'UNKNOWN_ERROR';
    let message = errorMessage;
    let retryable = false;

    // API Key 相关错误
    if (errorMessage.includes('API Key') || errorMessage.includes('apiKey') || errorMessage.includes('未配置')) {
      if (errorMessage.includes('未配置') || errorMessage.includes('missing')) {
        type = 'API_KEY_MISSING';
        message = 'AI API Key 未配置,请在设置中配置 API Key';
        retryable = false;
      } else {
        type = 'API_KEY_INVALID';
        message = 'AI API Key 无效,请检查 API Key 是否正确';
        retryable = false;
      }
    }
    // API 请求错误
    else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      type = 'API_KEY_INVALID';
      message = 'API Key 认证失败,请检查 API Key 是否正确';
      retryable = false;
    }
    else if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      type = 'API_RATE_LIMIT';
      message = 'API 请求频率超限,请稍后再试';
      retryable = true;
    }
    else if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
      type = 'API_TIMEOUT';
      message = 'AI 服务响应超时,请检查网络连接或稍后重试';
      retryable = true;
    }
    else if (errorMessage.includes('API 错误') || errorMessage.includes('API error') || errorMessage.match(/\d{3}/)) {
      type = 'API_REQUEST_FAILED';
      message = `AI 服务请求失败: ${errorMessage}`;
      retryable = true;
    }
    // 解析错误
    else if (errorMessage.includes('解析') || errorMessage.includes('parse') || errorMessage.includes('JSON')) {
      type = 'RESPONSE_PARSE_FAILED';
      message = 'AI 响应解析失败,请尝试重新描述你的指令';
      retryable = true;
    }
    // 命令格式错误
    else if (errorMessage.includes('命令格式') || errorMessage.includes('command format')) {
      type = 'INVALID_COMMAND_FORMAT';
      message = 'AI 生成的命令格式无效,请尝试更清晰地描述你的需求';
      retryable = true;
    }
    // 不支持的命令
    else if (errorMessage.includes('不支持') || errorMessage.includes('unsupported')) {
      type = 'UNSUPPORTED_COMMAND';
      message = 'AI 生成了不支持的命令,请尝试使用基本的飞行指令';
      retryable = true;
    }
    // 参数验证失败
    else if (errorMessage.includes('参数') || errorMessage.includes('parameter') || errorMessage.includes('validation')) {
      type = 'PARAMETER_VALIDATION_FAILED';
      message = `命令参数验证失败: ${errorMessage}`;
      retryable = true;
    }
    // 输入为空
    else if (errorMessage.includes('空') || errorMessage.includes('empty')) {
      type = 'EMPTY_INPUT';
      message = '输入不能为空,请输入飞行指令';
      retryable = false;
    }
    // 输入不明确
    else if (errorMessage.includes('不清楚') || errorMessage.includes('ambiguous') || errorMessage.includes('unclear')) {
      type = 'AMBIGUOUS_INPUT';
      message = '指令不够清晰,请更详细地描述你想要的飞行动作';
      retryable = true;
    }
    // 不安全的命令
    else if (errorMessage.includes('不安全') || errorMessage.includes('unsafe') || errorMessage.includes('dangerous')) {
      type = 'UNSAFE_COMMAND';
      message = '检测到不安全的飞行指令,已拒绝执行';
      retryable = false;
    }

    return {
      type,
      message,
      originalError,
      timestamp: new Date(),
      retryable
    };
  }

  /**
   * 获取用户友好的错误消息
   */
  static getUserFriendlyMessage(error: AIParserError): string {
    const suggestions: Record<AIParserErrorType, string> = {
      API_KEY_MISSING: '请前往设置页面配置 AI API Key',
      API_KEY_INVALID: '请检查 API Key 是否正确,或尝试重新生成',
      API_REQUEST_FAILED: '请检查网络连接,或稍后重试',
      API_RATE_LIMIT: '请等待几分钟后再试,或升级 API 套餐',
      API_TIMEOUT: '请检查网络连接,或尝试使用更简单的指令',
      RESPONSE_PARSE_FAILED: '请尝试重新描述你的指令,使用更简单明确的语言',
      INVALID_COMMAND_FORMAT: '请使用基本的飞行指令,如"起飞"、"向前50厘米"等',
      UNSUPPORTED_COMMAND: '请查看支持的命令列表,使用基本的飞行动作',
      PARAMETER_VALIDATION_FAILED: '请检查距离(20-500cm)和角度(1-360度)参数是否合理',
      EMPTY_INPUT: '请输入飞行指令,例如"起飞并向前飞50厘米"',
      AMBIGUOUS_INPUT: '请更详细地描述,例如"向前飞50厘米,然后顺时针旋转90度"',
      UNSAFE_COMMAND: '为了安全,某些危险动作已被禁止',
      UNKNOWN_ERROR: '请刷新页面重试,或联系技术支持'
    };

    return `${error.message}\n\n建议: ${suggestions[error.type]}`;
  }

  /**
   * 获取输入建议
   */
  static getInputSuggestions(error: AIParserError): string[] {
    const suggestions: Record<AIParserErrorType, string[]> = {
      API_KEY_MISSING: [
        '前往设置页面',
        '选择 AI 提供商',
        '输入 API Key',
        '保存设置'
      ],
      API_KEY_INVALID: [
        '检查 API Key 是否完整',
        '确认 API Key 未过期',
        '尝试重新生成 API Key',
        '检查 API 提供商是否正确'
      ],
      API_REQUEST_FAILED: [
        '检查网络连接',
        '稍后重试',
        '尝试切换 AI 提供商',
        '检查 API 服务状态'
      ],
      API_RATE_LIMIT: [
        '等待几分钟后重试',
        '升级 API 套餐',
        '切换到其他 AI 提供商',
        '减少请求频率'
      ],
      API_TIMEOUT: [
        '检查网络连接',
        '使用更简单的指令',
        '稍后重试',
        '切换到本地 AI 模型'
      ],
      RESPONSE_PARSE_FAILED: [
        '使用更简单明确的语言',
        '分步描述飞行动作',
        '参考示例指令',
        '重新尝试'
      ],
      INVALID_COMMAND_FORMAT: [
        '使用基本飞行指令',
        '参考命令列表',
        '简化指令描述',
        '查看使用示例'
      ],
      UNSUPPORTED_COMMAND: [
        '查看支持的命令列表',
        '使用基本飞行动作',
        '避免复杂的组合动作',
        '参考使用文档'
      ],
      PARAMETER_VALIDATION_FAILED: [
        '距离范围: 20-500 厘米',
        '角度范围: 1-360 度',
        '检查参数是否合理',
        '使用默认参数'
      ],
      EMPTY_INPUT: [
        '输入飞行指令',
        '例如: "起飞"',
        '例如: "向前飞50厘米"',
        '例如: "顺时针旋转90度"'
      ],
      AMBIGUOUS_INPUT: [
        '更详细地描述动作',
        '指定具体的距离和角度',
        '分步描述飞行过程',
        '参考示例指令'
      ],
      UNSAFE_COMMAND: [
        '使用安全的飞行高度',
        '避免过大的移动距离',
        '检查电池电量',
        '确保飞行环境安全'
      ],
      UNKNOWN_ERROR: [
        '刷新页面',
        '清除浏览器缓存',
        '查看控制台错误',
        '联系技术支持'
      ]
    };

    return suggestions[error.type] || suggestions.UNKNOWN_ERROR;
  }

  /**
   * 获取示例输入
   */
  static getExampleInputs(): string[] {
    return [
      '起飞',
      '向前飞50厘米',
      '向上飞30厘米',
      '顺时针旋转90度',
      '向左飞40厘米',
      '降落',
      '起飞,向前飞100厘米,然后降落',
      '起飞,顺时针旋转180度,向前飞50厘米,降落'
    ];
  }

  /**
   * 验证用户输入
   */
  static validateInput(input: string): { valid: boolean; error?: AIParserError } {
    // 检查是否为空
    if (!input || input.trim().length === 0) {
      return {
        valid: false,
        error: {
          type: 'EMPTY_INPUT',
          message: '输入不能为空',
          timestamp: new Date(),
          retryable: false
        }
      };
    }

    // 检查长度
    if (input.length > 500) {
      return {
        valid: false,
        error: {
          type: 'AMBIGUOUS_INPUT',
          message: '输入过长,请简化指令描述',
          timestamp: new Date(),
          retryable: true
        }
      };
    }

    // 检查是否包含危险关键词
    const dangerousKeywords = ['炸', '撞', '摔', '坠', '爆'];
    if (dangerousKeywords.some(keyword => input.includes(keyword))) {
      return {
        valid: false,
        error: {
          type: 'UNSAFE_COMMAND',
          message: '检测到不安全的关键词',
          timestamp: new Date(),
          retryable: false
        }
      };
    }

    return { valid: true };
  }
}

/**
 * 创建 AI 解析器错误
 */
export function createAIParserError(
  type: AIParserErrorType,
  message: string,
  originalError?: Error
): AIParserError {
  return {
    type,
    message,
    originalError,
    timestamp: new Date(),
    retryable: type !== 'API_KEY_MISSING' && type !== 'API_KEY_INVALID' && type !== 'UNSAFE_COMMAND'
  };
}
