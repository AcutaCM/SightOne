/**
 * Intelligent Agent Error Handling System
 * 
 * Defines error types, error classes, and error handling utilities
 * for the Tello Intelligent Agent system.
 * 
 * Requirements: 8.1, 8.2, 8.3, 9.4
 */

import { SupportedLanguage, detectLanguage } from '../utils/languageDetection';

/**
 * Error types for intelligent agent operations
 */
export enum IntelligentAgentErrorType {
  // AI Service Errors (8.1)
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  AI_SERVICE_TIMEOUT = 'AI_SERVICE_TIMEOUT',
  AI_SERVICE_INVALID_RESPONSE = 'AI_SERVICE_INVALID_RESPONSE',
  AI_SERVICE_RATE_LIMIT = 'AI_SERVICE_RATE_LIMIT',
  AI_SERVICE_AUTH_FAILED = 'AI_SERVICE_AUTH_FAILED',
  
  // Drone Connection Errors (8.2)
  DRONE_NOT_CONNECTED = 'DRONE_NOT_CONNECTED',
  DRONE_CONNECTION_LOST = 'DRONE_CONNECTION_LOST',
  DRONE_CONNECTION_TIMEOUT = 'DRONE_CONNECTION_TIMEOUT',
  DRONE_LOW_BATTERY = 'DRONE_LOW_BATTERY',
  
  // Command Parsing Errors (8.3)
  COMMAND_PARSE_FAILED = 'COMMAND_PARSE_FAILED',
  COMMAND_INVALID_FORMAT = 'COMMAND_INVALID_FORMAT',
  COMMAND_INVALID_PARAMETERS = 'COMMAND_INVALID_PARAMETERS',
  COMMAND_UNSAFE = 'COMMAND_UNSAFE',
  
  // Command Execution Errors (8.3)
  COMMAND_EXECUTION_FAILED = 'COMMAND_EXECUTION_FAILED',
  COMMAND_EXECUTION_TIMEOUT = 'COMMAND_EXECUTION_TIMEOUT',
  COMMAND_SEQUENCE_FAILED = 'COMMAND_SEQUENCE_FAILED',
  
  // WebSocket Errors
  WEBSOCKET_NOT_CONNECTED = 'WEBSOCKET_NOT_CONNECTED',
  WEBSOCKET_CONNECTION_FAILED = 'WEBSOCKET_CONNECTION_FAILED',
  WEBSOCKET_MESSAGE_FAILED = 'WEBSOCKET_MESSAGE_FAILED',
  
  // Configuration Errors
  CONFIG_INVALID = 'CONFIG_INVALID',
  CONFIG_MISSING = 'CONFIG_MISSING',
  
  // Unknown Error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Base error class for intelligent agent errors
 */
export class IntelligentAgentError extends Error {
  public readonly type: IntelligentAgentErrorType;
  public readonly severity: ErrorSeverity;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;
  public readonly recoverable: boolean;
  public readonly userMessage: string;
  public readonly userMessageEn: string;
  public readonly technicalMessage: string;
  public readonly language: SupportedLanguage;

  constructor(
    type: IntelligentAgentErrorType,
    userMessage: string,
    userMessageEn: string,
    technicalMessage: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    recoverable: boolean = true,
    context?: Record<string, any>,
    language?: SupportedLanguage
  ) {
    super(technicalMessage);
    this.name = 'IntelligentAgentError';
    this.type = type;
    this.severity = severity;
    this.timestamp = new Date();
    this.context = context;
    this.recoverable = recoverable;
    this.userMessage = userMessage;
    this.userMessageEn = userMessageEn;
    this.technicalMessage = technicalMessage;
    this.language = language || 'zh';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IntelligentAgentError);
    }
  }

  /**
   * Get localized user message based on language
   */
  getLocalizedMessage(language?: SupportedLanguage): string {
    const lang = language || this.language;
    return lang === 'en' ? this.userMessageEn : this.userMessage;
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      recoverable: this.recoverable,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * AI Service Error (Requirement 8.1, 9.4)
 */
export class AIServiceError extends IntelligentAgentError {
  constructor(
    message: string,
    type: IntelligentAgentErrorType = IntelligentAgentErrorType.AI_SERVICE_UNAVAILABLE,
    context?: Record<string, any>,
    language?: SupportedLanguage
  ) {
    const userMessagesZh: Record<string, string> = {
      [IntelligentAgentErrorType.AI_SERVICE_UNAVAILABLE]: 
        'AI服务暂时不可用，请检查配置或稍后重试',
      [IntelligentAgentErrorType.AI_SERVICE_TIMEOUT]: 
        'AI服务响应超时，请稍后重试',
      [IntelligentAgentErrorType.AI_SERVICE_INVALID_RESPONSE]: 
        'AI服务返回了无效的响应，请重试',
      [IntelligentAgentErrorType.AI_SERVICE_RATE_LIMIT]: 
        'AI服务请求过于频繁，请稍后重试',
      [IntelligentAgentErrorType.AI_SERVICE_AUTH_FAILED]: 
        'AI服务认证失败，请检查API密钥配置',
    };

    const userMessagesEn: Record<string, string> = {
      [IntelligentAgentErrorType.AI_SERVICE_UNAVAILABLE]: 
        'AI service temporarily unavailable, please check configuration or try again later',
      [IntelligentAgentErrorType.AI_SERVICE_TIMEOUT]: 
        'AI service response timeout, please try again later',
      [IntelligentAgentErrorType.AI_SERVICE_INVALID_RESPONSE]: 
        'AI service returned invalid response, please retry',
      [IntelligentAgentErrorType.AI_SERVICE_RATE_LIMIT]: 
        'AI service rate limit exceeded, please try again later',
      [IntelligentAgentErrorType.AI_SERVICE_AUTH_FAILED]: 
        'AI service authentication failed, please check API key configuration',
    };

    super(
      type,
      userMessagesZh[type] || 'AI服务错误',
      userMessagesEn[type] || 'AI service error',
      message,
      ErrorSeverity.HIGH,
      true,
      context,
      language
    );
    this.name = 'AIServiceError';
  }
}

/**
 * Drone Connection Error (Requirement 8.2, 9.4)
 */
export class DroneConnectionError extends IntelligentAgentError {
  constructor(
    message: string,
    type: IntelligentAgentErrorType = IntelligentAgentErrorType.DRONE_NOT_CONNECTED,
    context?: Record<string, any>,
    language?: SupportedLanguage
  ) {
    const userMessagesZh: Record<string, string> = {
      [IntelligentAgentErrorType.DRONE_NOT_CONNECTED]: 
        '无人机未连接，请先连接Tello无人机',
      [IntelligentAgentErrorType.DRONE_CONNECTION_LOST]: 
        '无人机连接已断开，请重新连接',
      [IntelligentAgentErrorType.DRONE_CONNECTION_TIMEOUT]: 
        '无人机连接超时，请检查WiFi连接',
      [IntelligentAgentErrorType.DRONE_LOW_BATTERY]: 
        '无人机电量过低，请充电后再使用',
    };

    const userMessagesEn: Record<string, string> = {
      [IntelligentAgentErrorType.DRONE_NOT_CONNECTED]: 
        'Drone not connected, please connect to Tello drone first',
      [IntelligentAgentErrorType.DRONE_CONNECTION_LOST]: 
        'Drone connection lost, please reconnect',
      [IntelligentAgentErrorType.DRONE_CONNECTION_TIMEOUT]: 
        'Drone connection timeout, please check WiFi connection',
      [IntelligentAgentErrorType.DRONE_LOW_BATTERY]: 
        'Drone battery too low, please charge before use',
    };

    super(
      type,
      userMessagesZh[type] || '无人机连接错误',
      userMessagesEn[type] || 'Drone connection error',
      message,
      ErrorSeverity.HIGH,
      true,
      context,
      language
    );
    this.name = 'DroneConnectionError';
  }
}

/**
 * Command Parse Error (Requirement 8.3, 9.4)
 */
export class CommandParseError extends IntelligentAgentError {
  constructor(
    message: string,
    userCommand: string,
    type: IntelligentAgentErrorType = IntelligentAgentErrorType.COMMAND_PARSE_FAILED,
    context?: Record<string, any>,
    language?: SupportedLanguage
  ) {
    // Auto-detect language from user command if not provided
    const detectedLang = language || detectLanguage(userCommand).language;

    const userMessagesZh: Record<string, string> = {
      [IntelligentAgentErrorType.COMMAND_PARSE_FAILED]: 
        '无法理解您的指令，请尝试更清晰的描述',
      [IntelligentAgentErrorType.COMMAND_INVALID_FORMAT]: 
        '指令格式不正确，请参考使用示例',
      [IntelligentAgentErrorType.COMMAND_INVALID_PARAMETERS]: 
        '指令参数不正确，请检查参数范围',
      [IntelligentAgentErrorType.COMMAND_UNSAFE]: 
        '该指令可能不安全，已被拒绝执行',
    };

    const userMessagesEn: Record<string, string> = {
      [IntelligentAgentErrorType.COMMAND_PARSE_FAILED]: 
        'Unable to understand your command, please try a clearer description',
      [IntelligentAgentErrorType.COMMAND_INVALID_FORMAT]: 
        'Invalid command format, please refer to usage examples',
      [IntelligentAgentErrorType.COMMAND_INVALID_PARAMETERS]: 
        'Invalid command parameters, please check parameter range',
      [IntelligentAgentErrorType.COMMAND_UNSAFE]: 
        'This command may be unsafe and has been rejected',
    };

    super(
      type,
      userMessagesZh[type] || '指令解析失败',
      userMessagesEn[type] || 'Command parsing failed',
      message,
      ErrorSeverity.MEDIUM,
      true,
      { ...context, userCommand },
      detectedLang
    );
    this.name = 'CommandParseError';
  }
}

/**
 * Command Execution Error (Requirement 8.3, 9.4)
 */
export class CommandExecutionError extends IntelligentAgentError {
  constructor(
    message: string,
    command: string,
    type: IntelligentAgentErrorType = IntelligentAgentErrorType.COMMAND_EXECUTION_FAILED,
    context?: Record<string, any>,
    language?: SupportedLanguage
  ) {
    const userMessagesZh: Record<string, string> = {
      [IntelligentAgentErrorType.COMMAND_EXECUTION_FAILED]: 
        '指令执行失败，请检查无人机状态后重试',
      [IntelligentAgentErrorType.COMMAND_EXECUTION_TIMEOUT]: 
        '指令执行超时，无人机可能未响应',
      [IntelligentAgentErrorType.COMMAND_SEQUENCE_FAILED]: 
        '指令序列执行失败，部分指令未完成',
    };

    const userMessagesEn: Record<string, string> = {
      [IntelligentAgentErrorType.COMMAND_EXECUTION_FAILED]: 
        'Command execution failed, please check drone status and retry',
      [IntelligentAgentErrorType.COMMAND_EXECUTION_TIMEOUT]: 
        'Command execution timeout, drone may not be responding',
      [IntelligentAgentErrorType.COMMAND_SEQUENCE_FAILED]: 
        'Command sequence execution failed, some commands not completed',
    };

    super(
      type,
      userMessagesZh[type] || '指令执行失败',
      userMessagesEn[type] || 'Command execution failed',
      message,
      ErrorSeverity.HIGH,
      true,
      { ...context, command },
      language
    );
    this.name = 'CommandExecutionError';
  }
}

/**
 * WebSocket Error (Requirement 9.4)
 */
export class WebSocketError extends IntelligentAgentError {
  constructor(
    message: string,
    type: IntelligentAgentErrorType = IntelligentAgentErrorType.WEBSOCKET_NOT_CONNECTED,
    context?: Record<string, any>,
    language?: SupportedLanguage
  ) {
    const userMessagesZh: Record<string, string> = {
      [IntelligentAgentErrorType.WEBSOCKET_NOT_CONNECTED]: 
        '后端服务未连接，请检查后端是否运行',
      [IntelligentAgentErrorType.WEBSOCKET_CONNECTION_FAILED]: 
        '无法连接到后端服务，请检查网络连接',
      [IntelligentAgentErrorType.WEBSOCKET_MESSAGE_FAILED]: 
        '消息发送失败，请重试',
    };

    const userMessagesEn: Record<string, string> = {
      [IntelligentAgentErrorType.WEBSOCKET_NOT_CONNECTED]: 
        'Backend service not connected, please check if backend is running',
      [IntelligentAgentErrorType.WEBSOCKET_CONNECTION_FAILED]: 
        'Unable to connect to backend service, please check network connection',
      [IntelligentAgentErrorType.WEBSOCKET_MESSAGE_FAILED]: 
        'Message sending failed, please retry',
    };

    super(
      type,
      userMessagesZh[type] || 'WebSocket连接错误',
      userMessagesEn[type] || 'WebSocket connection error',
      message,
      ErrorSeverity.HIGH,
      true,
      context,
      language
    );
    this.name = 'WebSocketError';
  }
}

/**
 * Error recovery suggestions (Requirement 9.4)
 */
export interface ErrorRecoverySuggestion {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  action?: string;
  link?: string;
}

/**
 * Get localized recovery suggestion
 */
export function getLocalizedSuggestion(
  suggestion: ErrorRecoverySuggestion,
  language: SupportedLanguage
): { title: string; description: string; action?: string; link?: string } {
  return {
    title: language === 'en' ? suggestion.titleEn : suggestion.title,
    description: language === 'en' ? suggestion.descriptionEn : suggestion.description,
    action: suggestion.action,
    link: suggestion.link,
  };
}

/**
 * Get recovery suggestions for an error (Requirement 9.4)
 */
export function getRecoverySuggestions(
  error: IntelligentAgentError
): ErrorRecoverySuggestion[] {
  const suggestions: Record<IntelligentAgentErrorType, ErrorRecoverySuggestion[]> = {
    // AI Service Errors
    [IntelligentAgentErrorType.AI_SERVICE_UNAVAILABLE]: [
      {
        title: '检查AI配置',
        titleEn: 'Check AI Configuration',
        description: '确保已在设置中正确配置AI提供商和API密钥',
        descriptionEn: 'Ensure AI provider and API key are correctly configured in settings',
        action: 'open_settings',
      },
      {
        title: '检查网络连接',
        titleEn: 'Check Network Connection',
        description: '确保网络连接正常，可以访问AI服务',
        descriptionEn: 'Ensure network connection is stable and AI service is accessible',
      },
      {
        title: '查看文档',
        titleEn: 'View Documentation',
        description: '查看AI配置文档了解详细设置步骤',
        descriptionEn: 'View AI configuration documentation for detailed setup steps',
        link: '/docs/ai-config',
      },
    ],
    [IntelligentAgentErrorType.AI_SERVICE_TIMEOUT]: [
      {
        title: '稍后重试',
        titleEn: 'Retry Later',
        description: 'AI服务可能暂时繁忙，请等待几秒后重试',
        descriptionEn: 'AI service may be temporarily busy, please wait a few seconds and retry',
      },
      {
        title: '简化指令',
        titleEn: 'Simplify Command',
        description: '尝试使用更简单的指令，减少处理时间',
        descriptionEn: 'Try using simpler commands to reduce processing time',
      },
    ],
    [IntelligentAgentErrorType.AI_SERVICE_INVALID_RESPONSE]: [
      {
        title: '重新发送',
        titleEn: 'Resend',
        description: '重新发送指令，可能是临时错误',
        descriptionEn: 'Resend the command, it may be a temporary error',
      },
      {
        title: '更换模型',
        titleEn: 'Switch Model',
        description: '尝试更换其他AI模型',
        descriptionEn: 'Try switching to a different AI model',
        action: 'open_settings',
      },
    ],
    [IntelligentAgentErrorType.AI_SERVICE_RATE_LIMIT]: [
      {
        title: '等待后重试',
        titleEn: 'Wait and Retry',
        description: '请等待1-2分钟后再发送指令',
        descriptionEn: 'Please wait 1-2 minutes before sending commands again',
      },
      {
        title: '升级套餐',
        titleEn: 'Upgrade Plan',
        description: '考虑升级AI服务套餐以获得更高的请求限制',
        descriptionEn: 'Consider upgrading AI service plan for higher request limits',
      },
    ],
    [IntelligentAgentErrorType.AI_SERVICE_AUTH_FAILED]: [
      {
        title: '检查API密钥',
        titleEn: 'Check API Key',
        description: '确保API密钥正确且未过期',
        descriptionEn: 'Ensure API key is correct and not expired',
        action: 'open_settings',
      },
      {
        title: '重新生成密钥',
        titleEn: 'Regenerate Key',
        description: '在AI服务提供商处重新生成API密钥',
        descriptionEn: 'Regenerate API key at your AI service provider',
      },
    ],

    // Drone Connection Errors
    [IntelligentAgentErrorType.DRONE_NOT_CONNECTED]: [
      {
        title: '连接无人机',
        titleEn: 'Connect Drone',
        description: '连接到Tello无人机的WiFi网络',
        descriptionEn: 'Connect to Tello drone WiFi network',
      },
      {
        title: '检查无人机电源',
        titleEn: 'Check Drone Power',
        description: '确保无人机已开机且电量充足',
        descriptionEn: 'Ensure drone is powered on and has sufficient battery',
      },
      {
        title: '查看连接指南',
        titleEn: 'View Connection Guide',
        description: '查看无人机连接文档',
        descriptionEn: 'View drone connection documentation',
        link: '/docs/drone-connection',
      },
    ],
    [IntelligentAgentErrorType.DRONE_CONNECTION_LOST]: [
      {
        title: '重新连接',
        titleEn: 'Reconnect',
        description: '重新连接到无人机WiFi网络',
        descriptionEn: 'Reconnect to drone WiFi network',
      },
      {
        title: '检查距离',
        titleEn: 'Check Distance',
        description: '确保无人机在WiFi信号范围内（约10米）',
        descriptionEn: 'Ensure drone is within WiFi range (about 10 meters)',
      },
    ],
    [IntelligentAgentErrorType.DRONE_CONNECTION_TIMEOUT]: [
      {
        title: '检查WiFi连接',
        titleEn: 'Check WiFi Connection',
        description: '确保已连接到Tello无人机的WiFi',
        descriptionEn: 'Ensure connected to Tello drone WiFi',
      },
      {
        title: '重启无人机',
        titleEn: 'Restart Drone',
        description: '尝试重启无人机后重新连接',
        descriptionEn: 'Try restarting drone and reconnecting',
      },
    ],
    [IntelligentAgentErrorType.DRONE_LOW_BATTERY]: [
      {
        title: '立即降落',
        titleEn: 'Land Immediately',
        description: '使用"降落"指令让无人机安全降落',
        descriptionEn: 'Use "land" command to safely land the drone',
      },
      {
        title: '充电后使用',
        titleEn: 'Charge Before Use',
        description: '为无人机充电至至少30%后再使用',
        descriptionEn: 'Charge drone to at least 30% before use',
      },
    ],

    // Command Parse Errors
    [IntelligentAgentErrorType.COMMAND_PARSE_FAILED]: [
      {
        title: '使用示例指令',
        titleEn: 'Use Example Commands',
        description: '参考使用示例中的指令格式',
        descriptionEn: 'Refer to command format in usage examples',
        link: '/docs/command-examples',
      },
      {
        title: '简化指令',
        titleEn: 'Simplify Command',
        description: '尝试使用更简单、更明确的指令',
        descriptionEn: 'Try using simpler and clearer commands',
      },
    ],
    [IntelligentAgentErrorType.COMMAND_INVALID_FORMAT]: [
      {
        title: '查看指令格式',
        titleEn: 'View Command Format',
        description: '查看支持的指令格式和参数',
        descriptionEn: 'View supported command formats and parameters',
        link: '/docs/commands',
      },
    ],
    [IntelligentAgentErrorType.COMMAND_INVALID_PARAMETERS]: [
      {
        title: '检查参数范围',
        titleEn: 'Check Parameter Range',
        description: '距离: 20-500厘米，角度: 1-360度',
        descriptionEn: 'Distance: 20-500cm, Angle: 1-360 degrees',
      },
    ],
    [IntelligentAgentErrorType.COMMAND_UNSAFE]: [
      {
        title: '修改指令',
        titleEn: 'Modify Command',
        description: '修改指令以确保安全执行',
        descriptionEn: 'Modify command to ensure safe execution',
      },
    ],

    // Command Execution Errors
    [IntelligentAgentErrorType.COMMAND_EXECUTION_FAILED]: [
      {
        title: '检查无人机状态',
        titleEn: 'Check Drone Status',
        description: '确保无人机处于正常状态',
        descriptionEn: 'Ensure drone is in normal operating state',
      },
      {
        title: '重新尝试',
        titleEn: 'Retry',
        description: '等待几秒后重新发送指令',
        descriptionEn: 'Wait a few seconds and resend command',
      },
    ],
    [IntelligentAgentErrorType.COMMAND_EXECUTION_TIMEOUT]: [
      {
        title: '检查无人机响应',
        titleEn: 'Check Drone Response',
        description: '确保无人机正常工作且未卡住',
        descriptionEn: 'Ensure drone is working properly and not stuck',
      },
      {
        title: '紧急停止',
        titleEn: 'Emergency Stop',
        description: '如有需要，使用"紧急停止"指令',
        descriptionEn: 'Use "emergency stop" command if needed',
      },
    ],
    [IntelligentAgentErrorType.COMMAND_SEQUENCE_FAILED]: [
      {
        title: '分步执行',
        titleEn: 'Execute Step by Step',
        description: '尝试将复杂任务分解为多个简单指令',
        descriptionEn: 'Try breaking complex tasks into multiple simple commands',
      },
    ],

    // WebSocket Errors
    [IntelligentAgentErrorType.WEBSOCKET_NOT_CONNECTED]: [
      {
        title: '启动后端服务',
        titleEn: 'Start Backend Service',
        description: '确保Python后端服务正在运行',
        descriptionEn: 'Ensure Python backend service is running',
        link: '/docs/backend-setup',
      },
      {
        title: '检查端口',
        titleEn: 'Check Port',
        description: '确保端口8765未被占用',
        descriptionEn: 'Ensure port 8765 is not occupied',
      },
    ],
    [IntelligentAgentErrorType.WEBSOCKET_CONNECTION_FAILED]: [
      {
        title: '重启后端',
        titleEn: 'Restart Backend',
        description: '尝试重启Python后端服务',
        descriptionEn: 'Try restarting Python backend service',
      },
    ],
    [IntelligentAgentErrorType.WEBSOCKET_MESSAGE_FAILED]: [
      {
        title: '重新发送',
        titleEn: 'Resend',
        description: '重新发送消息',
        descriptionEn: 'Resend message',
      },
    ],

    // Configuration Errors
    [IntelligentAgentErrorType.CONFIG_INVALID]: [
      {
        title: '检查配置',
        titleEn: 'Check Configuration',
        description: '检查所有配置项是否正确',
        descriptionEn: 'Check if all configuration items are correct',
        action: 'open_settings',
      },
    ],
    [IntelligentAgentErrorType.CONFIG_MISSING]: [
      {
        title: '完成配置',
        titleEn: 'Complete Configuration',
        description: '完成必要的配置项',
        descriptionEn: 'Complete necessary configuration items',
        action: 'open_settings',
      },
    ],

    // Unknown Error
    [IntelligentAgentErrorType.UNKNOWN_ERROR]: [
      {
        title: '查看日志',
        titleEn: 'View Logs',
        description: '查看详细错误日志以了解问题',
        descriptionEn: 'View detailed error logs to understand the issue',
      },
      {
        title: '联系支持',
        titleEn: 'Contact Support',
        description: '如问题持续，请联系技术支持',
        descriptionEn: 'Contact technical support if issue persists',
      },
    ],
  };

  return suggestions[error.type] || suggestions[IntelligentAgentErrorType.UNKNOWN_ERROR];
}

/**
 * Parse generic error into IntelligentAgentError (Requirement 9.4)
 */
export function parseError(error: unknown, context?: Record<string, any>): IntelligentAgentError {
  // Detect language from context if available
  const language: SupportedLanguage = context?.userCommand 
    ? detectLanguage(context.userCommand).language 
    : (context?.language || 'zh');

  // Already an IntelligentAgentError
  if (error instanceof IntelligentAgentError) {
    return error;
  }

  // Error object
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // AI Service errors
    if (message.includes('ai') || message.includes('openai') || message.includes('api')) {
      if (message.includes('timeout')) {
        return new AIServiceError(
          error.message,
          IntelligentAgentErrorType.AI_SERVICE_TIMEOUT,
          context,
          language
        );
      }
      if (message.includes('auth') || message.includes('key') || message.includes('401')) {
        return new AIServiceError(
          error.message,
          IntelligentAgentErrorType.AI_SERVICE_AUTH_FAILED,
          context,
          language
        );
      }
      if (message.includes('rate limit') || message.includes('429')) {
        return new AIServiceError(
          error.message,
          IntelligentAgentErrorType.AI_SERVICE_RATE_LIMIT,
          context,
          language
        );
      }
      return new AIServiceError(
        error.message, 
        IntelligentAgentErrorType.AI_SERVICE_UNAVAILABLE, 
        context,
        language
      );
    }

    // Drone errors
    if (message.includes('drone') || message.includes('tello')) {
      if (message.includes('not connected') || message.includes('disconnected')) {
        return new DroneConnectionError(
          error.message,
          IntelligentAgentErrorType.DRONE_NOT_CONNECTED,
          context,
          language
        );
      }
      if (message.includes('battery') || message.includes('low power')) {
        return new DroneConnectionError(
          error.message,
          IntelligentAgentErrorType.DRONE_LOW_BATTERY,
          context,
          language
        );
      }
      return new DroneConnectionError(
        error.message, 
        IntelligentAgentErrorType.DRONE_CONNECTION_LOST, 
        context,
        language
      );
    }

    // WebSocket errors
    if (message.includes('websocket') || message.includes('ws://')) {
      return new WebSocketError(
        error.message, 
        IntelligentAgentErrorType.WEBSOCKET_CONNECTION_FAILED, 
        context,
        language
      );
    }

    // Generic error
    return new IntelligentAgentError(
      IntelligentAgentErrorType.UNKNOWN_ERROR,
      '操作失败，请重试',
      'Operation failed, please retry',
      error.message,
      ErrorSeverity.MEDIUM,
      true,
      context,
      language
    );
  }

  // String error
  if (typeof error === 'string') {
    return new IntelligentAgentError(
      IntelligentAgentErrorType.UNKNOWN_ERROR,
      '操作失败，请重试',
      'Operation failed, please retry',
      error,
      ErrorSeverity.MEDIUM,
      true,
      context,
      language
    );
  }

  // Unknown error type
  return new IntelligentAgentError(
    IntelligentAgentErrorType.UNKNOWN_ERROR,
    '发生未知错误',
    'Unknown error occurred',
    String(error),
    ErrorSeverity.MEDIUM,
    true,
    context,
    language
  );
}
