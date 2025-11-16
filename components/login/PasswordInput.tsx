import React, { useState } from 'react';
import { Input } from '@heroui/input';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  touched?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  required?: boolean;
}

/**
 * PasswordInput Component
 * Password input with visibility toggle using HeroUI
 */
export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  placeholder,
  value,
  error,
  touched,
  onChange,
  onBlur,
  className = '',
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = touched && error;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const inputWrapperClasses = [
    // Default state - 5% white opacity (Requirement 9.1)
    'bg-white/5',
    'border-white/10',
    // Hover state - subtle increase
    'hover:bg-white/[0.07]',
    'data-[hover=true]:bg-white/[0.07]',
    // Focus state - 10% white opacity (Requirement 9.2)
    'group-data-[focus=true]:bg-white/10',
    'group-data-[focus=true]:border-white/40',
    'h-12 md:h-14',
    // Smooth transitions (Requirement 9.5)
    'transition-all',
    'duration-250',
  ];
  
  if (hasError) {
    // Error state - 60% white opacity border (Requirement 9.4)
    inputWrapperClasses.push('border-white/60');
    inputWrapperClasses.push('bg-white/[0.08]');
  }

  return (
    <Input
      type={showPassword ? 'text' : 'password'}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      isRequired={required}
      isInvalid={!!hasError}
      errorMessage={hasError ? error : undefined}
      endContent={
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="text-white/60 hover:text-white/80 transition-colors focus:outline-none"
          aria-label={showPassword ? '隐藏密码' : '显示密码'}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      }
      classNames={{
        base: `w-full ${className}`,
        input: 'text-white text-base',
        inputWrapper: inputWrapperClasses.join(' '),
        label: 'text-white/80 font-medium',
        errorMessage: 'text-danger text-sm mt-1',
      }}
    />
  );
};

export default PasswordInput;
