/**
 * NodeParameterForm Component
 * 
 * Generic parameter form component that renders different input controls
 * based on parameter types defined in NodeParameter interface.
 * 
 * Features:
 * - HeroUI form components
 * - Different input types (string, number, boolean, select, slider, etc.)
 * - Required field indicators
 * - Real-time validation
 * - Conditional parameter visibility
 * 
 * Requirements: 6.2, 6.3
 */

'use client';

import React, { useMemo } from 'react';
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Textarea } from "@heroui/input";
import { Slider } from "@heroui/slider";
import { AlertCircle, Asterisk } from 'lucide-react';
import { NodeParameter, ParameterValidator } from '../../lib/workflow/nodeDefinitions';
import AssistantSelector from './AssistantSelector';
import styles from '../../styles/NodeParameterForm.module.css';

export interface NodeParameterFormProps {
  /** Array of parameter definitions */
  parameters: NodeParameter[];
  
  /** Current parameter values */
  values: Record<string, any>;
  
  /** Validation errors keyed by parameter name */
  errors: Record<string, string>;
  
  /** Callback when a parameter value changes */
  onChange: (name: string, value: any) => void;
}

/**
 * NodeParameterForm Component
 * 
 * Renders a form with appropriate input controls for each parameter type.
 */
const NodeParameterForm: React.FC<NodeParameterFormProps> = ({
  parameters,
  values,
  errors,
  onChange,
}) => {
  // Group parameters by their group field
  const groupedParameters = useMemo(() => {
    return ParameterValidator.groupParameters(parameters);
  }, [parameters]);

  // Filter visible parameters based on dependencies
  const getVisibleParameters = (params: NodeParameter[]): NodeParameter[] => {
    return params.filter(param => 
      ParameterValidator.isParameterVisible(param, values)
    );
  };

  /**
   * Render a single parameter input based on its type
   */
  const renderParameter = (param: NodeParameter) => {
    const value = values[param.name] ?? param.defaultValue;
    const error = errors[param.name];
    const hasError = !!error;
    const isRequired = param.required ?? false;

    // Common label with required indicator
    const renderLabel = () => (
      <span className={styles.label}>
        {param.label}
        {isRequired && (
          <Asterisk className={styles.requiredIcon} size={12} />
        )}
      </span>
    );

    switch (param.type) {
      case 'string':
        return (
          <div key={param.name} className={styles.field}>
            <Input
              label={renderLabel()}
              value={value || ''}
              onChange={(e) => onChange(param.name, e.target.value)}
              placeholder={param.placeholder}
              description={param.description}
              isRequired={isRequired}
              isInvalid={hasError}
              errorMessage={error}
              classNames={{
                input: "bg-[#193059]",
                inputWrapper: hasError ? "border-red-500" : "border-[#64FFDA]/30"
              }}
            />
          </div>
        );

      case 'number':
        return (
          <div key={param.name} className={styles.field}>
            <Input
              label={renderLabel()}
              type="number"
              value={value?.toString() || ''}
              onChange={(e) => onChange(param.name, parseFloat(e.target.value) || param.defaultValue)}
              placeholder={param.placeholder}
              description={param.description}
              min={param.min}
              max={param.max}
              step={param.step}
              isRequired={isRequired}
              isInvalid={hasError}
              errorMessage={error}
              endContent={param.unit && <span className={styles.unit}>{param.unit}</span>}
              classNames={{
                input: "bg-[#193059]",
                inputWrapper: hasError ? "border-red-500" : "border-[#64FFDA]/30"
              }}
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={param.name} className={styles.field}>
            <Switch
              isSelected={value ?? param.defaultValue}
              onValueChange={(checked) => onChange(param.name, checked)}
              classNames={{
                wrapper: "group-data-[selected=true]:bg-[#64FFDA]"
              }}
            >
              <span className="text-white">
                {param.label}
                {isRequired && <Asterisk className={styles.requiredIconInline} size={12} />}
              </span>
            </Switch>
            {param.description && (
              <p className={styles.description}>{param.description}</p>
            )}
            {hasError && (
              <p className={styles.error}>
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={param.name} className={styles.field}>
            <Select
              label={renderLabel()}
              selectedKeys={value ? [value] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                onChange(param.name, selected);
              }}
              description={param.description}
              isRequired={isRequired}
              isInvalid={hasError}
              errorMessage={error}
              classNames={{
                trigger: "bg-[#193059] border-[#64FFDA]/30",
                value: "text-white"
              }}
            >
              {(param.options || []).map((option) => (
                <SelectItem key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        );

      case 'slider':
        return (
          <div key={param.name} className={styles.field}>
            <label className={styles.sliderLabel}>
              {param.label}
              {isRequired && <Asterisk className={styles.requiredIconInline} size={12} />}
              : {value ?? param.defaultValue}
              {param.unit && <span className={styles.unit}>{param.unit}</span>}
            </label>
            <Slider
              size="sm"
              step={param.step || 1}
              minValue={param.min || 0}
              maxValue={param.max || 100}
              value={value ?? param.defaultValue}
              onChange={(val) => onChange(param.name, val)}
              classNames={{
                track: "bg-[#193059]",
                filler: "bg-[#64FFDA]",
                thumb: "bg-[#64FFDA]"
              }}
            />
            {param.description && (
              <p className={styles.description}>{param.description}</p>
            )}
            {hasError && (
              <p className={styles.error}>
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={param.name} className={styles.field}>
            <Textarea
              label={renderLabel()}
              value={value || ''}
              onChange={(e) => onChange(param.name, e.target.value)}
              placeholder={param.placeholder}
              description={param.description}
              minRows={3}
              maxRows={8}
              isRequired={isRequired}
              isInvalid={hasError}
              errorMessage={error}
              classNames={{
                input: "bg-[#193059]",
                inputWrapper: hasError ? "border-red-500" : "border-[#64FFDA]/30"
              }}
            />
          </div>
        );

      case 'assistant':
        return (
          <div key={param.name} className={styles.field}>
            <AssistantSelector
              value={value || ''}
              onChange={(val) => onChange(param.name, val)}
              isRequired={isRequired}
            />
            {param.description && (
              <p className={styles.description}>{param.description}</p>
            )}
            {hasError && (
              <p className={styles.error}>
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>
        );

      case 'file':
      case 'image':
        return (
          <div key={param.name} className={styles.field}>
            <Input
              label={renderLabel()}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onChange(param.name, file);
                }
              }}
              description={param.description}
              isRequired={isRequired}
              isInvalid={hasError}
              errorMessage={error}
              classNames={{
                input: "bg-[#193059]",
                inputWrapper: hasError ? "border-red-500" : "border-[#64FFDA]/30"
              }}
            />
          </div>
        );

      case 'json':
        return (
          <div key={param.name} className={styles.field}>
            <Textarea
              label={renderLabel()}
              value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onChange(param.name, parsed);
                } catch {
                  onChange(param.name, e.target.value);
                }
              }}
              placeholder={param.placeholder || '{}'}
              description={param.description}
              minRows={4}
              maxRows={12}
              isRequired={isRequired}
              isInvalid={hasError}
              errorMessage={error}
              classNames={{
                input: "bg-[#193059] font-mono text-sm",
                inputWrapper: hasError ? "border-red-500" : "border-[#64FFDA]/30"
              }}
            />
          </div>
        );

      default:
        return (
          <div key={param.name} className={styles.field}>
            <Input
              label={renderLabel()}
              value={value?.toString() || ''}
              onChange={(e) => onChange(param.name, e.target.value)}
              placeholder={param.placeholder}
              description={param.description}
              isRequired={isRequired}
              isInvalid={hasError}
              errorMessage={error}
              classNames={{
                input: "bg-[#193059]",
                inputWrapper: hasError ? "border-red-500" : "border-[#64FFDA]/30"
              }}
            />
          </div>
        );
    }
  };

  /**
   * Render a parameter group
   */
  const renderGroup = (groupName: string, groupParams: NodeParameter[]) => {
    const visibleParams = getVisibleParameters(groupParams);
    
    if (visibleParams.length === 0) {
      return null;
    }

    return (
      <div key={groupName} className={styles.group}>
        {groupName !== 'default' && (
          <h3 className={styles.groupTitle}>{groupName}</h3>
        )}
        <div className={styles.groupContent}>
          {visibleParams.map(renderParameter)}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.form}>
      {Object.entries(groupedParameters).map(([groupName, groupParams]) =>
        renderGroup(groupName, groupParams)
      )}
    </div>
  );
};

export default NodeParameterForm;

