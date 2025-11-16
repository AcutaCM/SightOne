// Tello Workflow Node Definitions
// 节点类型定义和参数验证

import { LucideIcon } from 'lucide-react';

export type NodeCategory = 
  | 'flow'        // 流程控制
  | 'basic'       // 基础控制
  | 'movement'    // 移动控制
  | 'rotation'    // 旋转控制
  | 'detection'   // 检测任务
  | 'ai'          // AI分析
  | 'logic'       // 逻辑判断
  | 'data'        // 数据处理
  | 'challenge'   // 挑战卡任务
  | 'imaging'     // 图像采集
  | 'network'     // 网络通信
  | 'result';     // 结果处理

export type ParameterType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'select' 
  | 'file' 
  | 'json'
  | 'slider'
  | 'textarea'
  | 'assistant'
  | 'image';

export interface NodeParameter {
  name: string;
  label: string;
  type: ParameterType;
  defaultValue: any;
  required?: boolean;
  description?: string;
  validation?: (value: any) => boolean | string;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
  
  // Inline editing fields
  priority?: number;           // Parameter priority for compact mode (higher = more important)
  group?: string;              // Parameter grouping for organization
  dependsOn?: string;          // Name of parameter this depends on
  showWhen?: (params: Record<string, any>) => boolean; // Conditional visibility
  placeholder?: string;        // Placeholder text for input fields
  unit?: string;               // Unit of measurement (e.g., 'cm', '秒', '度')
  inline?: boolean;            // Whether suitable for inline editing (default: true)
}

export interface WorkflowNodeDefinition {
  type: string;
  label: string;
  icon: LucideIcon;
  category: NodeCategory;
  description: string;
  color: string;
  parameters: NodeParameter[];
}

// Parameter Validators
export class ParameterValidator {
  static validateNumber(value: any, min?: number, max?: number): boolean | string {
    const num = Number(value);
    if (isNaN(num)) {
      return '必须是有效的数字';
    }
    if (min !== undefined && num < min) {
      return `值不能小于 ${min}`;
    }
    if (max !== undefined && num > max) {
      return `值不能大于 ${max}`;
    }
    return true;
  }

  static validateString(value: any, minLength?: number, maxLength?: number): boolean | string {
    if (typeof value !== 'string') {
      return '必须是字符串';
    }
    if (minLength !== undefined && value.length < minLength) {
      return `长度不能小于 ${minLength}`;
    }
    if (maxLength !== undefined && value.length > maxLength) {
      return `长度不能大于 ${maxLength}`;
    }
    return true;
  }

  static validateBoolean(value: any): boolean | string {
    if (typeof value !== 'boolean') {
      return '必须是布尔值';
    }
    return true;
  }

  static validateSelect(value: any, options: any[]): boolean | string {
    if (!options.some(opt => opt.value === value)) {
      return '必须选择有效的选项';
    }
    return true;
  }

  static validateJSON(value: any): boolean | string {
    try {
      if (typeof value === 'string') {
        JSON.parse(value);
      }
      return true;
    } catch {
      return '必须是有效的JSON格式';
    }
  }

  /**
   * Validate parameter with inline editing support
   */
  static validateParameter(
    parameter: NodeParameter,
    value: any,
    allParams?: Record<string, any>
  ): { valid: boolean; error?: string } {
    // Check if parameter should be shown based on showWhen condition
    if (parameter.showWhen && allParams) {
      if (!parameter.showWhen(allParams)) {
        // Parameter is hidden, skip validation
        return { valid: true };
      }
    }

    // Required validation
    if (parameter.required && (value === undefined || value === null || value === '')) {
      return {
        valid: false,
        error: `${parameter.label}是必填项`
      };
    }

    // Skip further validation if value is empty and not required
    if (value === undefined || value === null || value === '') {
      return { valid: true };
    }

    // Type-specific validation
    let typeValidation: boolean | string = true;
    
    switch (parameter.type) {
      case 'number':
      case 'slider':
        typeValidation = this.validateNumber(value, parameter.min, parameter.max);
        break;
      case 'string':
      case 'textarea':
        typeValidation = this.validateString(value);
        break;
      case 'boolean':
        typeValidation = this.validateBoolean(value);
        break;
      case 'select':
        if (parameter.options) {
          typeValidation = this.validateSelect(value, parameter.options);
        }
        break;
      case 'json':
        typeValidation = this.validateJSON(value);
        break;
    }

    if (typeValidation !== true) {
      return {
        valid: false,
        error: typeof typeValidation === 'string' ? typeValidation : `${parameter.label}验证失败`
      };
    }

    // Custom validation
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
   * Validate all parameters for a node
   */
  static validateAllParameters(
    parameters: NodeParameter[],
    values: Record<string, any>
  ): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    parameters.forEach(param => {
      const result = this.validateParameter(param, values[param.name], values);
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
   * Get priority parameters (for compact mode display)
   */
  static getPriorityParameters(parameters: NodeParameter[]): NodeParameter[] {
    return parameters
      .filter(param => param.priority !== undefined && param.priority > 0)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Group parameters by their group field
   */
  static groupParameters(parameters: NodeParameter[]): Record<string, NodeParameter[]> {
    const grouped: Record<string, NodeParameter[]> = {
      default: []
    };

    parameters.forEach(param => {
      const group = param.group || 'default';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(param);
    });

    return grouped;
  }

  /**
   * Check if parameter should be visible based on dependencies
   */
  static isParameterVisible(
    parameter: NodeParameter,
    allParams: Record<string, any>
  ): boolean {
    // Check showWhen condition
    if (parameter.showWhen) {
      return parameter.showWhen(allParams);
    }

    // Check dependsOn
    if (parameter.dependsOn) {
      const dependentValue = allParams[parameter.dependsOn];
      // Parameter is visible only if dependent parameter has a truthy value
      return !!dependentValue;
    }

    return true;
  }
}
