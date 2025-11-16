"use client";

import React from 'react';
import { Switch, SwitchProps } from '@heroui/switch';

export interface FormSwitchProps extends SwitchProps {
  /** 标签文本 */
  label?: string;
  /** 描述文本 */
  description?: string;
}

/**
 * 表单开关组件
 * 基于 HeroUI Switch，提供统一的样式
 */
export const FormSwitch: React.FC<FormSwitchProps> = ({
  label,
  description,
  children,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      <Switch {...props}>
        {label || children}
      </Switch>
      {description && (
        <p className="text-sm text-foreground/60 ml-11">
          {description}
        </p>
      )}
    </div>
  );
};

export default FormSwitch;
