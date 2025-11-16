import { validation, ERROR_MESSAGES } from './design-tokens';

/**
 * Validation utilities for login form
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD,
    };
  }

  if (!validation.email.pattern.test(email)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.VALIDATION_EMAIL,
    };
  }

  return { isValid: true };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return {
      isValid: false,
      error: ERROR_MESSAGES.REQUIRED_FIELD,
    };
  }

  if (password.length < validation.password.minLength) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.VALIDATION_PASSWORD,
    };
  }

  return { isValid: true };
};

/**
 * Validate entire login form
 */
export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export const validateLoginForm = (
  formData: LoginFormData
): { isValid: boolean; errors: LoginFormErrors } => {
  const errors: LoginFormErrors = {};

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
