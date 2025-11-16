/**
 * Tello 命令执行错误处理工具
 * 提供命令执行错误分类、日志记录和恢复建议
 */

export type CommandExecutionErrorType =
  | 'COMMAND_TIMEOUT'
  | 'COMMAND_REJECTED'
  | 'DRONE_NOT_CONNECTED'
  | 'DRONE_NOT_READY'
  | 'LOW_BATTERY'
  | 'INVALID_STATE'
  | 'PARAMETER_OUT_OF_RANGE'
  | 'EMERGENCY_STOP'
  | 'HARDWARE_ERROR'
  | 'UNKNOWN_ERROR';

export interface CommandExecutionError {
  type: CommandExecutionErrorType;
  message: string;
  command: string;
  parameters?: Record<string, any>;
  originalError?: Error | string;
  timestamp: Date;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ExecutionLog {
  id: string;
  command: string;
  parameters?: Record<string, any>;
  status: 'pending' | 'executing' | 'success' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  error?: CommandExecutionError;
  result?: any;
}

/**
 * 命令执行错误处理器类
 */
export class CommandExecutionErrorHandler {
  private executionLogs: ExecutionLog[] = [];
  private maxLogs: number = 100;

  /**
   * 处理命令执行错误
   */
  handleError(
    command: string,
    error: Error | string,
    parameters?: Record<string, any>
  ): CommandExecutionError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const executionError = this.classifyError(command, errorMessage, parameters, error instanceof Error ? error : undefined);

    console.error(`[Command Execution Error] ${executionError.type}:`, executionError.message, {
      command,
      parameters,
      timestamp: executionError.timestamp,
      severity: executionError.severity
    });

    // 记录到日志
    this.logError(executionError);

    return executionError;
  }

  /**
   * 分类错误类型
   */
  private classifyError(
    command: string,
    errorMessage: string,
    parameters?: Record<string, any>,
    originalError?: Error
  ): CommandExecutionError {
    let type: CommandExecutionErrorType = 'UNKNOWN_ERROR';
    let message = errorMessage;
    let retryable = false;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    // 超时错误
    if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
      type = 'COMMAND_TIMEOUT';
      message = `命令 "${command}" 执行超时`;
      retryable = true;
      severity = 'medium';
    }
    // 命令被拒绝
    else if (errorMessage.includes('rejected') || errorMessage.includes('拒绝') || errorMessage.includes('denied')) {
      type = 'COMMAND_REJECTED';
      message = `命令 "${command}" 被拒绝执行`;
      retryable = false;
      severity = 'high';
    }
    // 无人机未连接
    else if (errorMessage.includes('not connected') || errorMessage.includes('未连接') || errorMessage.includes('disconnected')) {
      type = 'DRONE_NOT_CONNECTED';
      message = '无人机未连接,请先连接无人机';
      retryable = true;
      severity = 'high';
    }
    // 无人机未就绪
    else if (errorMessage.includes('not ready') || errorMessage.includes('未就绪')) {
      type = 'DRONE_NOT_READY';
      message = '无人机未就绪,请等待无人机初始化完成';
      retryable = true;
      severity = 'medium';
    }
    // 电量不足
    else if (errorMessage.includes('battery') || errorMessage.includes('电量') || errorMessage.includes('low power')) {
      type = 'LOW_BATTERY';
      message = '电量不足,请充电后再试';
      retryable = false;
      severity = 'critical';
    }
    // 状态无效
    else if (errorMessage.includes('invalid state') || errorMessage.includes('状态无效') || errorMessage.includes('wrong state')) {
      type = 'INVALID_STATE';
      message = `无人机状态不允许执行命令 "${command}"`;
      retryable = false;
      severity = 'medium';
    }
    // 参数超出范围
    else if (errorMessage.includes('out of range') || errorMessage.includes('超出范围') || errorMessage.includes('invalid parameter')) {
      type = 'PARAMETER_OUT_OF_RANGE';
      message = `命令参数超出有效范围: ${JSON.stringify(parameters)}`;
      retryable = false;
      severity = 'low';
    }
    // 紧急停止
    else if (errorMessage.includes('emergency') || errorMessage.includes('紧急')) {
      type = 'EMERGENCY_STOP';
      message = '命令执行被紧急停止';
      retryable = false;
      severity = 'critical';
    }
    // 硬件错误
    else if (errorMessage.includes('hardware') || errorMessage.includes('硬件') || errorMessage.includes('motor')) {
      type = 'HARDWARE_ERROR';
      message = '无人机硬件错误,请检查无人机状态';
      retryable = false;
      severity = 'critical';
    }

    return {
      type,
      message,
      command,
      parameters,
      originalError,
      timestamp: new Date(),
      retryable,
      severity
    };
  }

  /**
   * 记录错误到日志
   */
  private logError(error: CommandExecutionError): void {
    const log: ExecutionLog = {
      id: Date.now().toString(),
      command: error.command,
      parameters: error.parameters,
      status: 'failed',
      startTime: error.timestamp,
      endTime: error.timestamp,
      duration: 0,
      error
    };

    this.executionLogs.unshift(log);

    // 限制日志数量
    if (this.executionLogs.length > this.maxLogs) {
      this.executionLogs = this.executionLogs.slice(0, this.maxLogs);
    }
  }

  /**
   * 开始记录命令执行
   */
  startExecution(command: string, parameters?: Record<string, any>): string {
    const log: ExecutionLog = {
      id: Date.now().toString(),
      command,
      parameters,
      status: 'executing',
      startTime: new Date()
    };

    this.executionLogs.unshift(log);

    // 限制日志数量
    if (this.executionLogs.length > this.maxLogs) {
      this.executionLogs = this.executionLogs.slice(0, this.maxLogs);
    }

    return log.id;
  }

  /**
   * 完成命令执行记录
   */
  completeExecution(logId: string, success: boolean, result?: any, error?: CommandExecutionError): void {
    const log = this.executionLogs.find(l => l.id === logId);
    if (log) {
      log.status = success ? 'success' : 'failed';
      log.endTime = new Date();
      log.duration = log.endTime.getTime() - log.startTime.getTime();
      log.result = result;
      log.error = error;
    }
  }

  /**
   * 获取执行日志
   */
  getExecutionLogs(limit?: number): ExecutionLog[] {
    return limit ? this.executionLogs.slice(0, limit) : this.executionLogs;
  }

  /**
   * 清除执行日志
   */
  clearExecutionLogs(): void {
    this.executionLogs = [];
  }

  /**
   * 导出执行日志
   */
  exportExecutionLogs(): string {
    return JSON.stringify(this.executionLogs, null, 2);
  }

  /**
   * 获取用户友好的错误消息
   */
  static getUserFriendlyMessage(error: CommandExecutionError): string {
    const suggestions: Record<CommandExecutionErrorType, string> = {
      COMMAND_TIMEOUT: '命令执行时间过长,请检查无人机响应',
      COMMAND_REJECTED: '命令被拒绝,可能是安全限制或状态不允许',
      DRONE_NOT_CONNECTED: '请先连接无人机',
      DRONE_NOT_READY: '请等待无人机初始化完成',
      LOW_BATTERY: '电量不足,请立即降落并充电',
      INVALID_STATE: '当前状态不允许执行此命令',
      PARAMETER_OUT_OF_RANGE: '请检查命令参数是否在有效范围内',
      EMERGENCY_STOP: '命令执行已被紧急停止',
      HARDWARE_ERROR: '无人机硬件故障,请检查无人机',
      UNKNOWN_ERROR: '发生未知错误,请查看详细日志'
    };

    return `${error.message}\n\n建议: ${suggestions[error.type]}`;
  }

  /**
   * 获取恢复建议
   */
  static getRecoverySuggestions(error: CommandExecutionError): string[] {
    const suggestions: Record<CommandExecutionErrorType, string[]> = {
      COMMAND_TIMEOUT: [
        '检查无人机连接',
        '减少命令复杂度',
        '稍后重试',
        '检查无人机响应时间'
      ],
      COMMAND_REJECTED: [
        '检查无人机状态',
        '确认命令是否安全',
        '查看命令限制',
        '尝试其他命令'
      ],
      DRONE_NOT_CONNECTED: [
        '点击连接按钮',
        '检查无人机电源',
        '检查 WiFi 连接',
        '重启无人机'
      ],
      DRONE_NOT_READY: [
        '等待几秒钟',
        '检查无人机状态指示灯',
        '重新连接无人机',
        '重启无人机'
      ],
      LOW_BATTERY: [
        '立即降落',
        '更换电池',
        '充电后再试',
        '检查电池健康状态'
      ],
      INVALID_STATE: [
        '检查无人机当前状态',
        '先执行必要的准备命令',
        '例如: 起飞后才能移动',
        '查看命令执行顺序'
      ],
      PARAMETER_OUT_OF_RANGE: [
        '距离范围: 20-500 厘米',
        '角度范围: 1-360 度',
        '检查参数值',
        '使用默认参数'
      ],
      EMERGENCY_STOP: [
        '检查无人机状态',
        '确认安全后重新开始',
        '检查是否有障碍物',
        '重新连接无人机'
      ],
      HARDWARE_ERROR: [
        '检查螺旋桨',
        '检查电机',
        '重启无人机',
        '联系技术支持'
      ],
      UNKNOWN_ERROR: [
        '查看详细错误日志',
        '重新连接无人机',
        '重启应用',
        '联系技术支持'
      ]
    };

    return suggestions[error.type] || suggestions.UNKNOWN_ERROR;
  }

  /**
   * 获取错误严重程度的颜色
   */
  static getSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): 'default' | 'warning' | 'danger' {
    const colors: Record<string, 'default' | 'warning' | 'danger'> = {
      low: 'default',
      medium: 'warning',
      high: 'danger',
      critical: 'danger'
    };
    return colors[severity];
  }

  /**
   * 获取错误统计
   */
  getErrorStatistics(): {
    total: number;
    byType: Record<CommandExecutionErrorType, number>;
    bySeverity: Record<string, number>;
    successRate: number;
  } {
    const total = this.executionLogs.filter(log => log.status === 'failed').length;
    const totalExecutions = this.executionLogs.length;
    
    const byType: Record<CommandExecutionErrorType, number> = {} as any;
    const bySeverity: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    this.executionLogs.forEach(log => {
      if (log.error) {
        byType[log.error.type] = (byType[log.error.type] || 0) + 1;
        bySeverity[log.error.severity] = (bySeverity[log.error.severity] || 0) + 1;
      }
    });

    const successRate = totalExecutions > 0
      ? ((totalExecutions - total) / totalExecutions) * 100
      : 0;

    return {
      total,
      byType,
      bySeverity,
      successRate
    };
  }
}

/**
 * 创建命令执行错误处理器
 */
export function createCommandExecutionErrorHandler(): CommandExecutionErrorHandler {
  return new CommandExecutionErrorHandler();
}

/**
 * 创建命令执行错误
 */
export function createCommandExecutionError(
  type: CommandExecutionErrorType,
  message: string,
  command: string,
  parameters?: Record<string, any>,
  originalError?: Error | string
): CommandExecutionError {
  const severity: Record<CommandExecutionErrorType, 'low' | 'medium' | 'high' | 'critical'> = {
    COMMAND_TIMEOUT: 'medium',
    COMMAND_REJECTED: 'high',
    DRONE_NOT_CONNECTED: 'high',
    DRONE_NOT_READY: 'medium',
    LOW_BATTERY: 'critical',
    INVALID_STATE: 'medium',
    PARAMETER_OUT_OF_RANGE: 'low',
    EMERGENCY_STOP: 'critical',
    HARDWARE_ERROR: 'critical',
    UNKNOWN_ERROR: 'medium'
  };

  return {
    type,
    message,
    command,
    parameters,
    originalError,
    timestamp: new Date(),
    retryable: type !== 'COMMAND_REJECTED' && type !== 'LOW_BATTERY' && type !== 'HARDWARE_ERROR',
    severity: severity[type]
  };
}
