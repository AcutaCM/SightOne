/**
 * Workflow Validator
 * 
 * Re-export of workflowValidator for task 9.4 compliance
 * This file provides workflow validation functionality including:
 * - Node connection error checking
 * - Parameter configuration validation
 * - Validation results display
 * 
 * Requirements: 10.5
 */

export * from './workflowValidator';
export { 
  WorkflowValidator,
  validateWorkflow,
  canExecuteWorkflow,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type ValidationSuggestion
} from './workflowValidator';
