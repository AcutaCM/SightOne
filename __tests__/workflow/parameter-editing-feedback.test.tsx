/**
 * Parameter Editing Feedback Tests
 * 测试参数编辑反馈功能
 * 
 * 测试内容:
 * - 编辑光晕效果 (Requirement 3.5)
 * - 保存状态指示器 (Requirement 4.4)
 * - 验证错误动画 (Requirement 7.4)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ParameterItem from '@/components/workflow/ParameterItem';
import { NodeParameter } from '@/lib/workflow/nodeDefinitions';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock HeroUI Tooltip
jest.mock('@heroui/react', () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
}));

describe('ParameterItem - Editing Feedback', () => {
  const mockParameter: NodeParameter = {
    name: 'testParam',
    label: '测试参数',
    type: 'string',
    defaultValue: 'default',
    required: true,
    description: '这是一个测试参数',
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Requirement 3.5: 编辑光晕效果', () => {
    it('should apply editing glow effect when in editing mode', async () => {
      const { container } = render(
        <ParameterItem
          parameter={mockParameter}
          value="test value"
          onChange={mockOnChange}
        />
      );

      const parameterItem = container.querySelector('.parameterItem');
      expect(parameterItem).toBeInTheDocument();

      // Click to enter editing mode
      fireEvent.click(parameterItem!);

      await waitFor(() => {
        expect(parameterItem).toHaveClass('editing');
      });

      // Verify editing class is applied (which triggers editingGlow animation)
      expect(parameterItem?.classList.contains('editing')).toBe(true);
    });

    it('should remove editing glow when exiting edit mode', async () => {
      const { container } = render(
        <ParameterItem
          parameter={mockParameter}
          value="test value"
          onChange={mockOnChange}
        />
      );

      const parameterItem = container.querySelector('.parameterItem');
      
      // Enter editing mode
      fireEvent.click(parameterItem!);
      await waitFor(() => {
        expect(parameterItem).toHaveClass('editing');
      });

      // Exit editing mode by blur
      const input = container.querySelector('input');
      if (input) {
        fireEvent.blur(input);
      }

      await waitFor(() => {
        expect(parameterItem).not.toHaveClass('editing');
      });
    });
  });

  describe('Requirement 4.4: 保存状态指示器', () => {
    it('should show saving indicator when value changes', async () => {
      const { container } = render(
        <ParameterItem
          parameter={mockParameter}
          value="initial"
          onChange={mockOnChange}
        />
      );

      const parameterItem = container.querySelector('.parameterItem');
      
      // Enter editing mode
      fireEvent.click(parameterItem!);

      // Change value
      const input = container.querySelector('input');
      if (input) {
        fireEvent.change(input, { target: { value: 'new value' } });
        fireEvent.blur(input);
      }

      // Should show saving state
      await waitFor(() => {
        const savingIndicator = container.querySelector('.statusIndicator');
        expect(savingIndicator).toBeInTheDocument();
      });
    });

    it('should show success indicator after save completes', async () => {
      jest.useFakeTimers();
      
      const { container } = render(
        <ParameterItem
          parameter={mockParameter}
          value="initial"
          onChange={mockOnChange}
        />
      );

      const parameterItem = container.querySelector('.parameterItem');
      
      // Enter editing mode and change value
      fireEvent.click(parameterItem!);
      const input = container.querySelector('input');
      if (input) {
        fireEvent.change(input, { target: { value: 'new value' } });
        fireEvent.blur(input);
      }

      // Fast-forward past saving delay
      jest.advanceTimersByTime(150);

      await waitFor(() => {
        const successIcon = container.querySelector('.successIcon');
        expect(successIcon).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should apply saveSuccess animation class', async () => {
      jest.useFakeTimers();
      
      const { container } = render(
        <ParameterItem
          parameter={mockParameter}
          value="initial"
          onChange={mockOnChange}
        />
      );

      const parameterItem = container.querySelector('.parameterItem');
      
      // Trigger save
      fireEvent.click(parameterItem!);
      const input = container.querySelector('input');
      if (input) {
        fireEvent.change(input, { target: { value: 'new value' } });
        fireEvent.blur(input);
      }

      // Fast-forward to show success
      jest.advanceTimersByTime(150);

      await waitFor(() => {
        expect(parameterItem).toHaveClass('saveSuccess');
      });

      jest.useRealTimers();
    });
  });

  describe('Requirement 7.4: 验证错误动画', () => {
    it('should show error message with animation when error prop is provided', async () => {
      const { container, rerender } = render(
        <ParameterItem
          parameter={mockParameter}
          value=""
          onChange={mockOnChange}
        />
      );

      // Add error
      rerender(
        <ParameterItem
          parameter={mockParameter}
          value=""
          onChange={mockOnChange}
          error="此字段为必填项"
        />
      );

      await waitFor(() => {
        const errorMessage = container.querySelector('.parameterError');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent('此字段为必填项');
      });
    });

    it('should apply error shake animation when error appears', async () => {
      const { container, rerender } = render(
        <ParameterItem
          parameter={mockParameter}
          value=""
          onChange={mockOnChange}
        />
      );

      const parameterItem = container.querySelector('.parameterItem');

      // Add error to trigger shake
      rerender(
        <ParameterItem
          parameter={mockParameter}
          value=""
          onChange={mockOnChange}
          error="验证失败"
        />
      );

      await waitFor(() => {
        expect(parameterItem).toHaveClass('errorShake');
      });
    });

    it('should apply error styling to parameter item', async () => {
      const { container } = render(
        <ParameterItem
          parameter={mockParameter}
          value=""
          onChange={mockOnChange}
          error="验证错误"
        />
      );

      const parameterItem = container.querySelector('.parameterItem');
      
      await waitFor(() => {
        expect(parameterItem).toHaveClass('error');
      });
    });

    it('should remove error animation after timeout', async () => {
      jest.useFakeTimers();
      
      const { container } = render(
        <ParameterItem
          parameter={mockParameter}
          value=""
          onChange={mockOnChange}
          error="验证错误"
        />
      );

      const parameterItem = container.querySelector('.parameterItem');

      // Initially should have errorShake
      await waitFor(() => {
        expect(parameterItem).toHaveClass('errorShake');
      });

      // Fast-forward past shake duration (500ms)
      jest.advanceTimersByTime(600);

      await waitFor(() => {
        expect(parameterItem).not.toHaveClass('errorShake');
      });

      jest.useRealTimers();
    });

    it('should hide error message after timeout', async () => {
      jest.useFakeTimers();
      
      const { container } = render(
        <ParameterItem
          parameter={mockParameter}
          value=""
          onChange={mockOnChange}
          error="验证错误"
        />
      );

      // Error should be visible initially
      await waitFor(() => {
        const errorMessage = container.querySelector('.parameterError');
        expect(errorMessage).toBeInTheDocument();
      });

      // Fast-forward past error display duration (2000ms)
      jest.advanceTimersByTime(2100);

      await waitFor(() => {
        const errorMessage = container.querySelector('.parameterError');
        expect(errorMessage).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Integration: Combined feedback effects', () => {
    it('should handle editing glow and save indicator together', async () => {
      jest.useFakeTimers();
      
      const { container } = render(
        <ParameterItem
          parameter={mockParameter}
          value="initial"
          onChange={mockOnChange}
        />
      );

      const parameterItem = container.querySelector('.parameterItem');
      
      // Enter editing mode (triggers glow)
      fireEvent.click(parameterItem!);
      
      await waitFor(() => {
        expect(parameterItem).toHaveClass('editing');
      });

      // Change and save (triggers save indicator)
      const input = container.querySelector('input');
      if (input) {
        fireEvent.change(input, { target: { value: 'new value' } });
        fireEvent.blur(input);
      }

      // Should show saving indicator
      jest.advanceTimersByTime(50);
      
      await waitFor(() => {
        expect(container.querySelector('.statusIndicator')).toBeInTheDocument();
      });

      // Should show success after save
      jest.advanceTimersByTime(150);
      
      await waitFor(() => {
        expect(parameterItem).toHaveClass('saveSuccess');
      });

      jest.useRealTimers();
    });

    it('should prioritize error animation over save success', async () => {
      const { container, rerender } = render(
        <ParameterItem
          parameter={mockParameter}
          value="test"
          onChange={mockOnChange}
        />
      );

      const parameterItem = container.querySelector('.parameterItem');

      // Trigger error
      rerender(
        <ParameterItem
          parameter={mockParameter}
          value="test"
          onChange={mockOnChange}
          error="验证失败"
        />
      );

      await waitFor(() => {
        expect(parameterItem).toHaveClass('error');
        expect(parameterItem).toHaveClass('errorShake');
      });
    });
  });

  describe('Keyboard interactions with feedback', () => {
    it('should trigger save feedback on Enter key', async () => {
      const { container } = render(
        <ParameterItem
          parameter={mockParameter}
          value="initial"
          onChange={mockOnChange}
        />
      );

      const parameterItem = container.querySelector('.parameterItem');
      
      // Enter editing mode
      fireEvent.click(parameterItem!);
      
      const input = container.querySelector('input');
      if (input) {
        fireEvent.change(input, { target: { value: 'new value' } });
        fireEvent.keyDown(input, { key: 'Enter' });
      }

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('new value');
      });
    });

    it('should cancel editing on Escape without save feedback', async () => {
      const { container } = render(
        <ParameterItem
          parameter={mockParameter}
          value="initial"
          onChange={mockOnChange}
        />
      );

      const parameterItem = container.querySelector('.parameterItem');
      
      // Enter editing mode
      fireEvent.click(parameterItem!);
      
      const input = container.querySelector('input');
      if (input) {
        fireEvent.change(input, { target: { value: 'new value' } });
        fireEvent.keyDown(input, { key: 'Escape' });
      }

      await waitFor(() => {
        expect(parameterItem).not.toHaveClass('editing');
        expect(mockOnChange).not.toHaveBeenCalled();
      });
    });
  });
});
