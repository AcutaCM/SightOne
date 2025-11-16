/**
 * AssistantForm Character Counters Test
 * 
 * Tests for Task 13: Add character counters and limits
 * 
 * Verifies:
 * - Character count display for title field (0/50)
 * - Character count display for description field (0/200)
 * - Character count display for prompt field (0/2000)
 * - Real-time updates as user types
 * - Warning when approaching limit (90% threshold)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssistantForm } from '@/components/AssistantForm';
import { AssistantFormData } from '@/lib/services/assistantDraftManager';

describe('AssistantForm - Character Counters (Task 13)', () => {
  const mockOnSubmit = jest.fn();
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Title Field Character Counter', () => {
    it('should display character count for title field (0/50)', () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      // Check for character counter
      expect(screen.getByText(/0\/50 字符/)).toBeInTheDocument();
    });

    it('should update character count in real-time as user types', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const titleInput = screen.getByPlaceholderText('请输入助理名称');
      
      // Type some text
      fireEvent.change(titleInput, { target: { value: 'Test Assistant' } });

      await waitFor(() => {
        expect(screen.getByText(/14\/50 字符/)).toBeInTheDocument();
      });
    });

    it('should show warning when approaching limit (90% = 45 characters)', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const titleInput = screen.getByPlaceholderText('请输入助理名称');
      
      // Type 46 characters (over 90% threshold)
      const longText = 'A'.repeat(46);
      fireEvent.change(titleInput, { target: { value: longText } });

      await waitFor(() => {
        const counter = screen.getByText(/46\/50 字符/);
        expect(counter).toBeInTheDocument();
        // Warning style should be applied (counterWarning class)
        expect(counter.className).toContain('counterWarning');
      });
    });

    it('should not show warning when below 90% threshold', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const titleInput = screen.getByPlaceholderText('请输入助理名称');
      
      // Type 40 characters (below 90% threshold)
      const text = 'A'.repeat(40);
      fireEvent.change(titleInput, { target: { value: text } });

      await waitFor(() => {
        const counter = screen.getByText(/40\/50 字符/);
        expect(counter).toBeInTheDocument();
        // Should have counterUpdate class, not counterWarning
        expect(counter.className).toContain('counterUpdate');
        expect(counter.className).not.toContain('counterWarning');
      });
    });
  });

  describe('Description Field Character Counter', () => {
    it('should display character count for description field (0/200)', () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      // Check for character counter
      expect(screen.getByText(/0\/200 字符/)).toBeInTheDocument();
    });

    it('should update character count in real-time as user types', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const descInput = screen.getByPlaceholderText('请输入助理描述');
      
      // Type some text
      fireEvent.change(descInput, { target: { value: 'This is a test description for the assistant.' } });

      await waitFor(() => {
        expect(screen.getByText(/45\/200 字符/)).toBeInTheDocument();
      });
    });

    it('should show warning when approaching limit (90% = 180 characters)', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const descInput = screen.getByPlaceholderText('请输入助理描述');
      
      // Type 185 characters (over 90% threshold)
      const longText = 'A'.repeat(185);
      fireEvent.change(descInput, { target: { value: longText } });

      await waitFor(() => {
        const counter = screen.getByText(/185\/200 字符/);
        expect(counter).toBeInTheDocument();
        expect(counter.className).toContain('counterWarning');
      });
    });
  });

  describe('Prompt Field Character Counter', () => {
    it('should display character count for prompt field (0/2000)', () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      // Check for character counter
      expect(screen.getByText(/0\/2000 字符/)).toBeInTheDocument();
    });

    it('should update character count in real-time as user types', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const promptInput = screen.getByPlaceholderText('请输入系统提示词，定义助理的行为和角色');
      
      // Type some text
      const promptText = 'You are a helpful assistant that provides detailed and accurate information.';
      fireEvent.change(promptInput, { target: { value: promptText } });

      await waitFor(() => {
        expect(screen.getByText(/77\/2000 字符/)).toBeInTheDocument();
      });
    });

    it('should show warning when approaching limit (90% = 1800 characters)', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const promptInput = screen.getByPlaceholderText('请输入系统提示词，定义助理的行为和角色');
      
      // Type 1850 characters (over 90% threshold)
      const longText = 'A'.repeat(1850);
      fireEvent.change(promptInput, { target: { value: longText } });

      await waitFor(() => {
        const counter = screen.getByText(/1850\/2000 字符/);
        expect(counter).toBeInTheDocument();
        expect(counter.className).toContain('counterWarning');
      });
    });

    it('should not show warning when below 90% threshold', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const promptInput = screen.getByPlaceholderText('请输入系统提示词，定义助理的行为和角色');
      
      // Type 1000 characters (below 90% threshold)
      const text = 'A'.repeat(1000);
      fireEvent.change(promptInput, { target: { value: text } });

      await waitFor(() => {
        const counter = screen.getByText(/1000\/2000 字符/);
        expect(counter).toBeInTheDocument();
        expect(counter.className).toContain('counterUpdate');
        expect(counter.className).not.toContain('counterWarning');
      });
    });
  });

  describe('Character Counter Integration', () => {
    it('should display all three character counters simultaneously', () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      // All three counters should be visible
      expect(screen.getByText(/0\/50 字符/)).toBeInTheDocument();
      expect(screen.getByText(/0\/200 字符/)).toBeInTheDocument();
      expect(screen.getByText(/0\/2000 字符/)).toBeInTheDocument();
    });

    it('should update multiple counters independently', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const titleInput = screen.getByPlaceholderText('请输入助理名称');
      const descInput = screen.getByPlaceholderText('请输入助理描述');
      const promptInput = screen.getByPlaceholderText('请输入系统提示词，定义助理的行为和角色');

      // Update all fields
      fireEvent.change(titleInput, { target: { value: 'Test' } });
      fireEvent.change(descInput, { target: { value: 'Description' } });
      fireEvent.change(promptInput, { target: { value: 'Prompt' } });

      await waitFor(() => {
        expect(screen.getByText(/4\/50 字符/)).toBeInTheDocument();
        expect(screen.getByText(/11\/200 字符/)).toBeInTheDocument();
        expect(screen.getByText(/6\/2000 字符/)).toBeInTheDocument();
      });
    });

    it('should preserve character counts when form data is provided', () => {
      const initialData: AssistantFormData = {
        title: 'Existing Assistant',
        emoji: '🤖',
        desc: 'This is an existing assistant with some description.',
        prompt: 'You are a helpful assistant.',
        tags: ['test'],
        isPublic: false
      };

      render(
        <AssistantForm
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      // Check that counters reflect the initial data
      expect(screen.getByText(/18\/50 字符/)).toBeInTheDocument();
      expect(screen.getByText(/51\/200 字符/)).toBeInTheDocument();
      expect(screen.getByText(/28\/2000 字符/)).toBeInTheDocument();
    });
  });

  describe('Character Counter Animations', () => {
    it('should apply counterUpdate animation class for normal updates', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const titleInput = screen.getByPlaceholderText('请输入助理名称');
      fireEvent.change(titleInput, { target: { value: 'Test' } });

      await waitFor(() => {
        const counter = screen.getByText(/4\/50 字符/);
        expect(counter.className).toContain('counterUpdate');
      });
    });

    it('should apply counterWarning animation class when approaching limit', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const titleInput = screen.getByPlaceholderText('请输入助理名称');
      const longText = 'A'.repeat(46); // Over 90% threshold
      fireEvent.change(titleInput, { target: { value: longText } });

      await waitFor(() => {
        const counter = screen.getByText(/46\/50 字符/);
        expect(counter.className).toContain('counterWarning');
      });
    });
  });

  describe('Character Limit Enforcement', () => {
    it('should allow input up to the maximum length', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const titleInput = screen.getByPlaceholderText('请输入助理名称');
      const maxText = 'A'.repeat(50);
      fireEvent.change(titleInput, { target: { value: maxText } });

      await waitFor(() => {
        expect(screen.getByText(/50\/50 字符/)).toBeInTheDocument();
      });
    });

    it('should show validation error when exceeding maximum length', async () => {
      render(
        <AssistantForm
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      );

      const titleInput = screen.getByPlaceholderText('请输入助理名称');
      const tooLongText = 'A'.repeat(51);
      
      fireEvent.change(titleInput, { target: { value: tooLongText } });
      fireEvent.blur(titleInput);

      await waitFor(() => {
        expect(screen.getByText(/助理名称不能超过50个字符/)).toBeInTheDocument();
      });
    });
  });
});
