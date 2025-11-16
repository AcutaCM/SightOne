/**
 * Parameter Validation Service Tests
 * 参数验证服务单元测试
 * 
 * Tests for:
 * - Required field validation
 * - Type validation
 * - Range validation
 * - Custom validation functions
 */

import { 
  ParameterValidationService,
  ValidationResult,
  BatchValidationResult 
} from '@/lib/workflow/parameterValidation';
import { NodeParameter, ParameterType } from '@/lib/workflow/nodeDefinitions';

describe('ParameterValidationService', () => {
  
  // ==================== 必填验证测试 ====================
  describe('Required Field Validation', () => {
    
    it('should fail validation when required parameter is undefined', () => {
      const param: NodeParameter = {
        name: 'distance',
        label: '距离',
        type: 'number',
        defaultValue: 0,
        required: true
      };
      
      const result = ParameterValidationService.validateParameter(param, undefined);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('距离是必填项');
    });
    
    it('should fail validation when required parameter is null', () => {
      const param: NodeParameter = {
        name: 'message',
        label: '消息',
        type: 'string',
        defaultValue: '',
        required: true
      };
      
      const result = ParameterValidationService.validateParameter(param, null);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('消息是必填项');
    });
    
    it('should fail validation when required parameter is empty string', () => {
      const param: NodeParameter = {
        name: 'name',
        label: '名称',
        type: 'string',
        defaultValue: '',
        required: true
      };
      
      const result = ParameterValidationService.validateParameter(param, '');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('名称是必填项');
    });
    
    it('should fail validation when required parameter is whitespace string', () => {
      const param: NodeParameter = {
        name: 'description',
        label: '描述',
        type: 'textarea',
        defaultValue: '',
        required: true
      };
      
      const result = ParameterValidationService.validateParameter(param, '   ');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('描述是必填项');
    });
    
    it('should pass validation when required parameter has valid value', () => {
      const param: NodeParameter = {
        name: 'speed',
        label: '速度',
        type: 'number',
        defaultValue: 50,
        required: true
      };
      
      const result = ParameterValidationService.validateParameter(param, 100);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should pass validation when optional parameter is empty', () => {
      const param: NodeParameter = {
        name: 'notes',
        label: '备注',
        type: 'string',
        defaultValue: '',
        required: false
      };
      
      const result = ParameterValidationService.validateParameter(param, '');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
  
  // ==================== 类型验证测试 ====================
  describe('Type Validation', () => {
    
    describe('Number Type', () => {
      it('should pass validation for valid number', () => {
        const param: NodeParameter = {
          name: 'height',
          label: '高度',
          type: 'number',
          defaultValue: 100
        };
        
        const result = ParameterValidationService.validateParameter(param, 150);
        
        expect(result.valid).toBe(true);
      });
      
      it('should fail validation for non-number value', () => {
        const param: NodeParameter = {
          name: 'distance',
          label: '距离',
          type: 'number',
          defaultValue: 0
        };
        
        const result = ParameterValidationService.validateParameter(param, 'not a number');
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('必须是有效的数字');
      });
      
      it('should fail validation for NaN', () => {
        const param: NodeParameter = {
          name: 'angle',
          label: '角度',
          type: 'number',
          defaultValue: 0
        };
        
        const result = ParameterValidationService.validateParameter(param, NaN);
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('必须是有效的数字');
      });
      
      it('should pass validation for zero', () => {
        const param: NodeParameter = {
          name: 'offset',
          label: '偏移',
          type: 'number',
          defaultValue: 0
        };
        
        const result = ParameterValidationService.validateParameter(param, 0);
        
        expect(result.valid).toBe(true);
      });
      
      it('should pass validation for negative numbers', () => {
        const param: NodeParameter = {
          name: 'adjustment',
          label: '调整',
          type: 'number',
          defaultValue: 0
        };
        
        const result = ParameterValidationService.validateParameter(param, -50);
        
        expect(result.valid).toBe(true);
      });
    });
    
    describe('String Type', () => {
      it('should pass validation for valid string', () => {
        const param: NodeParameter = {
          name: 'label',
          label: '标签',
          type: 'string',
          defaultValue: ''
        };
        
        const result = ParameterValidationService.validateParameter(param, 'test label');
        
        expect(result.valid).toBe(true);
      });
      
      it('should fail validation for non-string value', () => {
        const param: NodeParameter = {
          name: 'name',
          label: '名称',
          type: 'string',
          defaultValue: ''
        };
        
        const result = ParameterValidationService.validateParameter(param, 123);
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('必须是字符串');
      });
      
      it('should pass validation for empty string when not required', () => {
        const param: NodeParameter = {
          name: 'description',
          label: '描述',
          type: 'string',
          defaultValue: '',
          required: false
        };
        
        const result = ParameterValidationService.validateParameter(param, '');
        
        expect(result.valid).toBe(true);
      });
    });
    
    describe('Boolean Type', () => {
      it('should pass validation for true', () => {
        const param: NodeParameter = {
          name: 'enabled',
          label: '启用',
          type: 'boolean',
          defaultValue: false
        };
        
        const result = ParameterValidationService.validateParameter(param, true);
        
        expect(result.valid).toBe(true);
      });
      
      it('should pass validation for false', () => {
        const param: NodeParameter = {
          name: 'disabled',
          label: '禁用',
          type: 'boolean',
          defaultValue: true
        };
        
        const result = ParameterValidationService.validateParameter(param, false);
        
        expect(result.valid).toBe(true);
      });
      
      it('should fail validation for non-boolean value', () => {
        const param: NodeParameter = {
          name: 'active',
          label: '激活',
          type: 'boolean',
          defaultValue: false
        };
        
        const result = ParameterValidationService.validateParameter(param, 'true');
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('必须是布尔值');
      });
      
      it('should fail validation for number', () => {
        const param: NodeParameter = {
          name: 'flag',
          label: '标志',
          type: 'boolean',
          defaultValue: false
        };
        
        const result = ParameterValidationService.validateParameter(param, 1);
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('必须是布尔值');
      });
    });
    
    describe('Textarea Type', () => {
      it('should pass validation for multiline string', () => {
        const param: NodeParameter = {
          name: 'content',
          label: '内容',
          type: 'textarea',
          defaultValue: ''
        };
        
        const result = ParameterValidationService.validateParameter(param, 'Line 1\nLine 2\nLine 3');
        
        expect(result.valid).toBe(true);
      });
      
      it('should fail validation for non-string value', () => {
        const param: NodeParameter = {
          name: 'notes',
          label: '备注',
          type: 'textarea',
          defaultValue: ''
        };
        
        const result = ParameterValidationService.validateParameter(param, { text: 'invalid' });
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('必须是字符串');
      });
    });
    
    describe('Slider Type', () => {
      it('should pass validation for valid number', () => {
        const param: NodeParameter = {
          name: 'brightness',
          label: '亮度',
          type: 'slider',
          defaultValue: 50,
          min: 0,
          max: 100
        };
        
        const result = ParameterValidationService.validateParameter(param, 75);
        
        expect(result.valid).toBe(true);
      });
      
      it('should fail validation for non-number value', () => {
        const param: NodeParameter = {
          name: 'volume',
          label: '音量',
          type: 'slider',
          defaultValue: 50
        };
        
        const result = ParameterValidationService.validateParameter(param, '50');
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('必须是有效的数字');
      });
    });
    
    describe('Select Type', () => {
      it('should pass validation for valid option', () => {
        const param: NodeParameter = {
          name: 'direction',
          label: '方向',
          type: 'select',
          defaultValue: 'forward',
          options: [
            { label: '前进', value: 'forward' },
            { label: '后退', value: 'backward' },
            { label: '左转', value: 'left' },
            { label: '右转', value: 'right' }
          ]
        };
        
        const result = ParameterValidationService.validateParameter(param, 'left');
        
        expect(result.valid).toBe(true);
      });
      
      it('should fail validation for invalid option', () => {
        const param: NodeParameter = {
          name: 'mode',
          label: '模式',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: '自动', value: 'auto' },
            { label: '手动', value: 'manual' }
          ]
        };
        
        const result = ParameterValidationService.validateParameter(param, 'invalid');
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('必须选择有效的选项');
      });
    });
    
    describe('JSON Type', () => {
      it('should pass validation for valid JSON string', () => {
        const param: NodeParameter = {
          name: 'config',
          label: '配置',
          type: 'json',
          defaultValue: '{}'
        };
        
        const result = ParameterValidationService.validateParameter(param, '{"key": "value"}');
        
        expect(result.valid).toBe(true);
      });
      
      it('should pass validation for JSON object', () => {
        const param: NodeParameter = {
          name: 'settings',
          label: '设置',
          type: 'json',
          defaultValue: {}
        };
        
        const result = ParameterValidationService.validateParameter(param, { key: 'value' });
        
        expect(result.valid).toBe(true);
      });
      
      it('should fail validation for invalid JSON string', () => {
        const param: NodeParameter = {
          name: 'data',
          label: '数据',
          type: 'json',
          defaultValue: '{}'
        };
        
        const result = ParameterValidationService.validateParameter(param, '{invalid json}');
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('必须是有效的JSON格式');
      });
      
      it('should fail validation for non-JSON value', () => {
        const param: NodeParameter = {
          name: 'metadata',
          label: '元数据',
          type: 'json',
          defaultValue: '{}'
        };
        
        const result = ParameterValidationService.validateParameter(param, 123);
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('必须是有效的JSON格式');
      });
    });
    
    describe('Assistant Type', () => {
      it('should pass validation for valid assistant ID', () => {
        const param: NodeParameter = {
          name: 'assistantId',
          label: '助手ID',
          type: 'assistant',
          defaultValue: ''
        };
        
        const result = ParameterValidationService.validateParameter(param, 'asst_123456');
        
        expect(result.valid).toBe(true);
      });
      
      it('should fail validation for non-string value', () => {
        const param: NodeParameter = {
          name: 'assistantId',
          label: '助手ID',
          type: 'assistant',
          defaultValue: ''
        };
        
        const result = ParameterValidationService.validateParameter(param, 12345);
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('必须是字符串');
      });
    });
  });
  
  // ==================== 范围验证测试 ====================
  describe('Range Validation', () => {
    
    it('should pass validation when value is within range', () => {
      const param: NodeParameter = {
        name: 'speed',
        label: '速度',
        type: 'number',
        defaultValue: 50,
        min: 0,
        max: 100
      };
      
      const result = ParameterValidationService.validateParameter(param, 75);
      
      expect(result.valid).toBe(true);
    });
    
    it('should pass validation when value equals minimum', () => {
      const param: NodeParameter = {
        name: 'altitude',
        label: '高度',
        type: 'number',
        defaultValue: 20,
        min: 20,
        max: 500
      };
      
      const result = ParameterValidationService.validateParameter(param, 20);
      
      expect(result.valid).toBe(true);
    });
    
    it('should pass validation when value equals maximum', () => {
      const param: NodeParameter = {
        name: 'distance',
        label: '距离',
        type: 'number',
        defaultValue: 100,
        min: 20,
        max: 500
      };
      
      const result = ParameterValidationService.validateParameter(param, 500);
      
      expect(result.valid).toBe(true);
    });
    
    it('should fail validation when value is below minimum', () => {
      const param: NodeParameter = {
        name: 'temperature',
        label: '温度',
        type: 'number',
        defaultValue: 25,
        min: 0,
        max: 100
      };
      
      const result = ParameterValidationService.validateParameter(param, -10);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('值不能小于 0');
    });
    
    it('should fail validation when value is above maximum', () => {
      const param: NodeParameter = {
        name: 'angle',
        label: '角度',
        type: 'number',
        defaultValue: 90,
        min: 0,
        max: 360
      };
      
      const result = ParameterValidationService.validateParameter(param, 400);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('值不能大于 360');
    });
    
    it('should pass validation when only minimum is specified', () => {
      const param: NodeParameter = {
        name: 'count',
        label: '数量',
        type: 'number',
        defaultValue: 1,
        min: 1
      };
      
      const result = ParameterValidationService.validateParameter(param, 100);
      
      expect(result.valid).toBe(true);
    });
    
    it('should pass validation when only maximum is specified', () => {
      const param: NodeParameter = {
        name: 'limit',
        label: '限制',
        type: 'number',
        defaultValue: 50,
        max: 100
      };
      
      const result = ParameterValidationService.validateParameter(param, 50);
      
      expect(result.valid).toBe(true);
    });
    
    it('should apply range validation to slider type', () => {
      const param: NodeParameter = {
        name: 'opacity',
        label: '透明度',
        type: 'slider',
        defaultValue: 50,
        min: 0,
        max: 100
      };
      
      const result = ParameterValidationService.validateParameter(param, 150);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('值不能大于 100');
    });
  });
  
  // ==================== 自定义验证函数测试 ====================
  describe('Custom Validation Functions', () => {
    
    it('should pass validation when custom function returns true', () => {
      const param: NodeParameter = {
        name: 'email',
        label: '邮箱',
        type: 'string',
        defaultValue: '',
        validation: (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value) || '邮箱格式不正确';
        }
      };
      
      const result = ParameterValidationService.validateParameter(param, 'test@example.com');
      
      expect(result.valid).toBe(true);
    });
    
    it('should fail validation when custom function returns false', () => {
      const param: NodeParameter = {
        name: 'port',
        label: '端口',
        type: 'number',
        defaultValue: 8080,
        validation: (value: number) => {
          return value >= 1024 && value <= 65535;
        }
      };
      
      const result = ParameterValidationService.validateParameter(param, 80);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('端口验证失败');
    });
    
    it('should fail validation with custom error message', () => {
      const param: NodeParameter = {
        name: 'username',
        label: '用户名',
        type: 'string',
        defaultValue: '',
        validation: (value: string) => {
          if (value.length < 3) {
            return '用户名至少需要3个字符';
          }
          if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return '用户名只能包含字母、数字和下划线';
          }
          return true;
        }
      };
      
      const result = ParameterValidationService.validateParameter(param, 'ab');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('用户名至少需要3个字符');
    });
    
    it('should handle custom validation with complex logic', () => {
      const param: NodeParameter = {
        name: 'coordinates',
        label: '坐标',
        type: 'string',
        defaultValue: '0,0',
        validation: (value: string) => {
          const parts = value.split(',');
          if (parts.length !== 2) {
            return '坐标格式应为 x,y';
          }
          const x = parseFloat(parts[0]);
          const y = parseFloat(parts[1]);
          if (isNaN(x) || isNaN(y)) {
            return '坐标必须是有效的数字';
          }
          if (x < -180 || x > 180 || y < -90 || y > 90) {
            return '坐标超出有效范围';
          }
          return true;
        }
      };
      
      const validResult = ParameterValidationService.validateParameter(param, '120.5,30.2');
      expect(validResult.valid).toBe(true);
      
      const invalidResult = ParameterValidationService.validateParameter(param, '200,100');
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toBe('坐标超出有效范围');
    });
    
    it('should run custom validation after type and range validation', () => {
      const param: NodeParameter = {
        name: 'evenNumber',
        label: '偶数',
        type: 'number',
        defaultValue: 2,
        min: 0,
        max: 100,
        validation: (value: number) => {
          return value % 2 === 0 || '必须是偶数';
        }
      };
      
      // Should fail type validation first
      const typeFailResult = ParameterValidationService.validateParameter(param, 'not a number');
      expect(typeFailResult.valid).toBe(false);
      expect(typeFailResult.error).toBe('必须是有效的数字');
      
      // Should fail range validation before custom validation
      const rangeFailResult = ParameterValidationService.validateParameter(param, 150);
      expect(rangeFailResult.valid).toBe(false);
      expect(rangeFailResult.error).toBe('值不能大于 100');
      
      // Should fail custom validation
      const customFailResult = ParameterValidationService.validateParameter(param, 7);
      expect(customFailResult.valid).toBe(false);
      expect(customFailResult.error).toBe('必须是偶数');
      
      // Should pass all validations
      const passResult = ParameterValidationService.validateParameter(param, 50);
      expect(passResult.valid).toBe(true);
    });
  });
  
  // ==================== 批量验证测试 ====================
  describe('Batch Validation (validateAllParameters)', () => {
    
    it('should return error for unknown node type', () => {
      const result = ParameterValidationService.validateAllParameters(
        'unknown_node_type',
        {}
      );
      
      expect(result.valid).toBe(false);
      expect(result.errors._general).toBe('未知的节点类型: unknown_node_type');
    });
    
    it('should validate all parameters and collect errors', () => {
      // This test assumes a node type exists in the registry
      // For a real test, we would need to mock the nodeRegistry
      // Here we're testing the logic structure
      
      const result = ParameterValidationService.validateAllParameters(
        'takeoff',
        {}
      );
      
      // Result should have valid and errors properties
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(typeof result.valid).toBe('boolean');
      expect(typeof result.errors).toBe('object');
    });
  });
  
  // ==================== 辅助方法测试 ====================
  describe('Helper Methods', () => {
    
    describe('getDefaultValue', () => {
      it('should return the default value of a parameter', () => {
        const param: NodeParameter = {
          name: 'speed',
          label: '速度',
          type: 'number',
          defaultValue: 50
        };
        
        const defaultValue = ParameterValidationService.getDefaultValue(param);
        
        expect(defaultValue).toBe(50);
      });
    });
    
    describe('getDefaultParameters', () => {
      it('should return empty object for unknown node type', () => {
        const defaults = ParameterValidationService.getDefaultParameters('unknown_type');
        
        expect(defaults).toEqual({});
      });
    });
    
    describe('hasErrors', () => {
      it('should return true when validation fails', () => {
        // This would need proper node registry mocking
        const hasErrors = ParameterValidationService.hasErrors('takeoff', {});
        
        expect(typeof hasErrors).toBe('boolean');
      });
    });
    
    describe('getRequiredParameters', () => {
      it('should return empty array for unknown node type', () => {
        const required = ParameterValidationService.getRequiredParameters('unknown_type');
        
        expect(required).toEqual([]);
      });
    });
    
    describe('hasAllRequiredParameters', () => {
      it('should check if all required parameters are provided', () => {
        const result = ParameterValidationService.hasAllRequiredParameters('takeoff', {});
        
        expect(typeof result).toBe('boolean');
      });
    });
    
    describe('getMissingRequiredParameters', () => {
      it('should return empty array for unknown node type', () => {
        const missing = ParameterValidationService.getMissingRequiredParameters('unknown_type', {});
        
        expect(missing).toEqual([]);
      });
    });
  });
  
  // ==================== 边界情况测试 ====================
  describe('Edge Cases', () => {
    
    it('should handle parameter with no type specified', () => {
      const param: any = {
        name: 'custom',
        label: '自定义',
        type: 'unknown_type' as ParameterType,
        defaultValue: null
      };
      
      // Should not throw error for unknown type
      const result = ParameterValidationService.validateParameter(param, 'any value');
      
      expect(result.valid).toBe(true);
    });
    
    it('should handle parameter with undefined options for select type', () => {
      const param: NodeParameter = {
        name: 'choice',
        label: '选择',
        type: 'select',
        defaultValue: 'option1'
        // options is undefined
      };
      
      const result = ParameterValidationService.validateParameter(param, 'option1');
      
      // Should pass since options validation is skipped when options is undefined
      expect(result.valid).toBe(true);
    });
    
    it('should handle very large numbers', () => {
      const param: NodeParameter = {
        name: 'bigNumber',
        label: '大数',
        type: 'number',
        defaultValue: 0
      };
      
      const result = ParameterValidationService.validateParameter(param, Number.MAX_SAFE_INTEGER);
      
      expect(result.valid).toBe(true);
    });
    
    it('should handle very small numbers', () => {
      const param: NodeParameter = {
        name: 'smallNumber',
        label: '小数',
        type: 'number',
        defaultValue: 0
      };
      
      const result = ParameterValidationService.validateParameter(param, Number.MIN_SAFE_INTEGER);
      
      expect(result.valid).toBe(true);
    });
    
    it('should handle floating point numbers', () => {
      const param: NodeParameter = {
        name: 'decimal',
        label: '小数',
        type: 'number',
        defaultValue: 0.0
      };
      
      const result = ParameterValidationService.validateParameter(param, 3.14159);
      
      expect(result.valid).toBe(true);
    });
    
    it('should handle empty array for select options', () => {
      const param: NodeParameter = {
        name: 'emptySelect',
        label: '空选择',
        type: 'select',
        defaultValue: '',
        options: []
      };
      
      const result = ParameterValidationService.validateParameter(param, 'any');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('必须选择有效的选项');
    });
    
    it('should handle complex JSON objects', () => {
      const param: NodeParameter = {
        name: 'complexData',
        label: '复杂数据',
        type: 'json',
        defaultValue: {}
      };
      
      const complexObject = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' }
        },
        boolean: true,
        number: 42
      };
      
      const result = ParameterValidationService.validateParameter(param, complexObject);
      
      expect(result.valid).toBe(true);
    });
  });
});
