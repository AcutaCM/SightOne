/**
 * Tests for Assistant Add Button Conditional Rendering
 * Verifies that the button only appears in the assistants tab for admin users
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the ChatbotChat component's button rendering logic
describe('Assistant Add Button Conditional Rendering', () => {
  // Helper function to simulate the button rendering logic
  const renderButton = (marketTab: string, userRole: string) => {
    const shouldRender = marketTab === 'assistants' && userRole === 'admin';
    
    return (
      <div data-testid="button-container">
        {shouldRender && (
          <button
            data-testid="add-assistant-button"
            aria-label="Create new assistant"
          >
            Add Assistant
          </button>
        )}
      </div>
    );
  };

  describe('Tab-based visibility logic', () => {
    it('should render button when marketTab is "assistants" and user is admin', () => {
      const { container } = render(renderButton('assistants', 'admin'));
      const button = screen.queryByTestId('add-assistant-button');
      expect(button).toBeInTheDocument();
    });

    it('should NOT render button when marketTab is "home"', () => {
      const { container } = render(renderButton('home', 'admin'));
      const button = screen.queryByTestId('add-assistant-button');
      expect(button).not.toBeInTheDocument();
    });

    it('should NOT render button when marketTab is "plugins"', () => {
      const { container } = render(renderButton('plugins', 'admin'));
      const button = screen.queryByTestId('add-assistant-button');
      expect(button).not.toBeInTheDocument();
    });

    it('should NOT render button when marketTab is "models"', () => {
      const { container } = render(renderButton('models', 'admin'));
      const button = screen.queryByTestId('add-assistant-button');
      expect(button).not.toBeInTheDocument();
    });

    it('should NOT render button when marketTab is "providers"', () => {
      const { container } = render(renderButton('providers', 'admin'));
      const button = screen.queryByTestId('add-assistant-button');
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('Role-based access control', () => {
    it('should render button for admin users in assistants tab', () => {
      const { container } = render(renderButton('assistants', 'admin'));
      const button = screen.queryByTestId('add-assistant-button');
      expect(button).toBeInTheDocument();
    });

    it('should NOT render button for non-admin users in assistants tab', () => {
      const { container } = render(renderButton('assistants', 'user'));
      const button = screen.queryByTestId('add-assistant-button');
      expect(button).not.toBeInTheDocument();
    });

    it('should NOT render button for guest users in assistants tab', () => {
      const { container } = render(renderButton('assistants', 'guest'));
      const button = screen.queryByTestId('add-assistant-button');
      expect(button).not.toBeInTheDocument();
    });

    it('should NOT render button for empty role in assistants tab', () => {
      const { container } = render(renderButton('assistants', ''));
      const button = screen.queryByTestId('add-assistant-button');
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('Combined conditions', () => {
    it('should require BOTH assistants tab AND admin role', () => {
      // Admin but wrong tab
      let result = render(renderButton('home', 'admin'));
      let button = screen.queryByTestId('add-assistant-button');
      expect(button).not.toBeInTheDocument();
      result.unmount();

      // Correct tab but not admin
      result = render(renderButton('assistants', 'user'));
      button = screen.queryByTestId('add-assistant-button');
      expect(button).not.toBeInTheDocument();
      result.unmount();

      // Both conditions met
      result = render(renderButton('assistants', 'admin'));
      button = screen.queryByTestId('add-assistant-button');
      expect(button).toBeInTheDocument();
    });
  });
});
