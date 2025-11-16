/**
 * Empty State Component
 * 
 * Displays helpful messages when no results are found
 * with option to reset filters
 * 
 * Requirements: 1.5, 3.4
 */

'use client';

import React from 'react';
import { Button } from '@heroui/button';
import styled from '@emotion/styled';

// ============================================================================
// Styled Components
// ============================================================================

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: hsl(var(--heroui-foreground) / 0.5);
  
  @media (max-width: 768px) {
    padding: 40px 16px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
  
  @media (max-width: 768px) {
    font-size: 48px;
    margin-bottom: 12px;
  }
`;

const EmptyText = styled.p`
  font-size: 16px;
  margin: 0 0 8px 0;
  font-weight: 500;
  color: hsl(var(--heroui-foreground) / 0.7);
  
  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const EmptyHint = styled.p`
  font-size: 14px;
  margin: 0 0 20px 0;
  color: hsl(var(--heroui-foreground) / 0.4);
  max-width: 400px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin: 0 0 16px 0;
  }
`;

// ============================================================================
// Component Props
// ============================================================================

export interface EmptyStateProps {
  /**
   * Icon to display (emoji or icon component)
   */
  icon?: string | React.ReactNode;
  
  /**
   * Main message to display
   */
  message: string;
  
  /**
   * Hint or suggestion text
   */
  hint?: string;
  
  /**
   * Whether to show reset filters button
   */
  showResetButton?: boolean;
  
  /**
   * Callback when reset button is clicked
   */
  onReset?: () => void;
  
  /**
   * Text for reset button
   */
  resetButtonText?: string;
  
  /**
   * Language for UI text
   */
  language?: 'zh' | 'en';
}

// ============================================================================
// Component
// ============================================================================

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🔍',
  message,
  hint,
  showResetButton = false,
  onReset,
  resetButtonText,
  language = 'zh',
}) => {
  const defaultResetText = language === 'zh' ? '重置筛选' : 'Reset Filters';
  
  return (
    <EmptyStateContainer>
      <EmptyIcon>
        {typeof icon === 'string' ? icon : icon}
      </EmptyIcon>
      
      <EmptyText>{message}</EmptyText>
      
      {hint && <EmptyHint>{hint}</EmptyHint>}
      
      {showResetButton && onReset && (
        <Button
          color="primary"
          variant="flat"
          onPress={onReset}
        >
          {resetButtonText || defaultResetText}
        </Button>
      )}
    </EmptyStateContainer>
  );
};

export default EmptyState;
