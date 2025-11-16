"use client";

import React from 'react';
import { Input, InputProps } from '@heroui/input';

export interface FormInputProps extends Omit<InputProps, 'errorMessage'> {
  /** 错误信息 */
  error?: string;
}

/**
 * 表单输入框组件
 * 基于 HeroUI Input，添加统一的错误处理
 */
export const FormInput: React.FC<FormInputProps> = ({
  error,
  isInvalid,
  ...props
}) => {
  return (
    <Input
      {...props}
      isInvalid={isInvalid || !!error}
      errorMessage={error}
    />
  );
};

export default FormInput;
