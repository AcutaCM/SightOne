"use client";

import React from 'react';
import { Select, SelectProps } from '@heroui/select';

export interface FormSelectProps extends Omit<SelectProps, 'errorMessage'> {
  /** 错误信息 */
  error?: string;
}

/**
 * 表单选择框组件
 * 基于 HeroUI Select，添加统一的错误处理
 */
export const FormSelect: React.FC<FormSelectProps> = ({
  error,
  isInvalid,
  ...props
}) => {
  return (
    <Select
      {...props}
      isInvalid={isInvalid || !!error}
      errorMessage={error}
    />
  );
};

export default FormSelect;
