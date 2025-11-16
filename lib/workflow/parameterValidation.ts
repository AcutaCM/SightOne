// Parameter Validation Service
// 参数验证服务 - 提供完整的参数验证逻辑

import { NodeParameter, ParameterType } from './nodeDefinitions';
import { nodeRegistry } from './nodeRegistry';

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 批量验证结果接口
 */
export interface BatchValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * 参数验证服务类
 * 提供单个参数验证、批量验证、类型验证、范围验证等功能
 */
export class ParameterValidationService {
  /**
   * 验证单个参数
   * @param parameter 参数定义
   * @param value 参数值
   * @returns 验证结果
   */
  static validateParameter(
    parameter: NodeParameter,
    value: any
  ): ValidationResult {
    // 必填验证
    if (parameter.required && this.isEmpty(value)) {
      return {
        valid: false,
        error: `${parameter.label}是必填项`
      };
    }

    // 如果值为空且非必填，则验证通过
    if (this.isEmpty(value) && !parameter.required) {
      return { valid: true };
    }

    // 类型验证
    const typeValidation = this.validateType(parameter.type, value);
    if (!typeValidation.valid) {
      return typeValidation;
    }

    // 范围验证（针对数字和滑块类型）
    if (parameter.type === 'number' || parameter.type === 'slider') {
      const rangeValidation = this.validateRange(
        value,
        parameter.min,
        parameter.max
      );
      if (!rangeValidation.valid) {
        return rangeValidation;
      }
    }

    // 选项验证（针对选择类型）
    if (parameter.type === 'select' && parameter.options) {
      const optionValidation = this.validateOption(value, parameter.options);
      if (!optionValidation.valid) {
        return optionValidation;
      }
    }

    // 自定义验证
    if (parameter.validation) {
      const customValidation = parameter.validation(value);
      if (customValidation !== true) {
        return {
          valid: false,
          error: typeof customValidation === 'string'
            ? customValidation
            : `${parameter.label}验证失败`
        };
      }
    }

    return { valid: true };
  }

  /**
   * 验证所有参数
   * @param nodeType 节点类型
   * @param parameters 参数值对象
   * @returns 批量验证结果
   */
  static validateAllParameters(
    nodeType: string,
    parameters: Record<string, any>
  ): BatchValidationResult {
    const nodeDefinition = nodeRegistry.getNode(nodeType);
    
    if (!nodeDefinition) {
      return {
        valid: false,
        errors: { _general: `未知的节点类型: ${nodeType}` }
      };
    }

    const errors: Record<string, string> = {};

    // 验证每个参数定义
    nodeDefinition.parameters.forEach(param => {
      const result = this.validateParameter(param, parameters[param.name]);
      if (!result.valid && result.error) {
        errors[param.name] = result.error;
      }
    });

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * 类型验证
   * @param type 参数类型
   * @param value 参数值
   * @returns 验证结果
   */
  private static validateType(
    type: ParameterType,
    value: any
  ): ValidationResult {
    switch (type) {
      case 'number':
      case 'slider':
        if (typeof value !== 'number' || isNaN(value)) {
          return { valid: false, error: '必须是有效的数字' };
        }
        break;

      case 'string':
      case 'textarea':
        if (typeof value !== 'string') {
          return { valid: false, error: '必须是字符串' };
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return { valid: false, error: '必须是布尔值' };
        }
        break;

      case 'json':
        const jsonValidation = this.validateJSON(value);
        if (!jsonValidation.valid) {
          return jsonValidation;
        }
        break;

      case 'select':
        // Select类型的验证在validateOption中处理
        break;

      case 'assistant':
      case 'image':
      case 'file':
        // 这些类型通常是字符串（ID或路径）
        if (typeof value !== 'string') {
          return { valid: false, error: '必须是字符串' };
        }
        break;

      default:
        // 未知类型，跳过类型验证
        break;
    }

    return { valid: true };
  }

  /**
   * 范围验证
   * @param value 数值
   * @param min 最小值
   * @param max 最大值
   * @returns 验证结果
   */
  private static validateRange(
    value: number,
    min?: number,
    max?: number
  ): ValidationResult {
    if (min !== undefined && value < min) {
      return { valid: false, error: `值不能小于 ${min}` };
    }
    if (max !== undefined && value > max) {
      return { valid: false, error: `值不能大于 ${max}` };
    }
    return { valid: true };
  }

  /**
   * 选项验证
   * @param value 选择的值
   * @param options 可选项列表
   * @returns 验证结果
   */
  private static validateOption(
    value: any,
    options: Array<{ label: string; value: any }>
  ): ValidationResult {
    const validValues = options.map(opt => opt.value);
    if (!validValues.includes(value)) {
      return { valid: false, error: '必须选择有效的选项' };
    }
    return { valid: true };
  }

  /**
   * JSON验证
   * @param value JSON字符串或对象
   * @returns 验证结果
   */
  private static validateJSON(value: any): ValidationResult {
    try {
      if (typeof value === 'string') {
        JSON.parse(value);
      } else if (typeof value === 'object') {
        // 已经是对象，验证通过
        return { valid: true };
      } else {
        return { valid: false, error: '必须是有效的JSON格式' };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: '必须是有效的JSON格式' };
    }
  }

  /**
   * 检查值是否为空
   * @param value 要检查的值
   * @returns 是否为空
   */
  private static isEmpty(value: any): boolean {
    return value === undefined || 
           value === null || 
           value === '' ||
           (typeof value === 'string' && value.trim() === '');
  }

  /**
   * 获取参数的默认值
   * @param parameter 参数定义
   * @returns 默认值
   */
  static getDefaultValue(parameter: NodeParameter): any {
    return parameter.defaultValue;
  }

  /**
   * 批量获取节点的默认参数值
   * @param nodeType 节点类型
   * @returns 默认参数对象
   */
  static getDefaultParameters(nodeType: string): Record<string, any> {
    const nodeDefinition = nodeRegistry.getNode(nodeType);
    
    if (!nodeDefinition) {
      return {};
    }

    const defaults: Record<string, any> = {};
    nodeDefinition.parameters.forEach(param => {
      defaults[param.name] = param.defaultValue;
    });

    return defaults;
  }

  /**
   * 检查参数是否有错误
   * @param nodeType 节点类型
   * @param parameters 参数值对象
   * @returns 是否有错误
   */
  static hasErrors(
    nodeType: string,
    parameters: Record<string, any>
  ): boolean {
    const result = this.validateAllParameters(nodeType, parameters);
    return !result.valid;
  }

  /**
   * 获取必填参数列表
   * @param nodeType 节点类型
   * @returns 必填参数名称数组
   */
  static getRequiredParameters(nodeType: string): string[] {
    const nodeDefinition = nodeRegistry.getNode(nodeType);
    
    if (!nodeDefinition) {
      return [];
    }

    return nodeDefinition.parameters
      .filter(param => param.required)
      .map(param => param.name);
  }

  /**
   * 检查是否所有必填参数都已配置
   * @param nodeType 节点类型
   * @param parameters 参数值对象
   * @returns 是否所有必填参数都已配置
   */
  static hasAllRequiredParameters(
    nodeType: string,
    parameters: Record<string, any>
  ): boolean {
    const requiredParams = this.getRequiredParameters(nodeType);
    
    return requiredParams.every(paramName => {
      const value = parameters[paramName];
      return !this.isEmpty(value);
    });
  }

  /**
   * 获取缺失的必填参数列表
   * @param nodeType 节点类型
   * @param parameters 参数值对象
   * @returns 缺失的必填参数名称数组
   */
  static getMissingRequiredParameters(
    nodeType: string,
    parameters: Record<string, any>
  ): string[] {
    const requiredParams = this.getRequiredParameters(nodeType);
    
    return requiredParams.filter(paramName => {
      const value = parameters[paramName];
      return this.isEmpty(value);
    });
  }
}

// 导出单例实例（可选）
export const parameterValidation = ParameterValidationService;
