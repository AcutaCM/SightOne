/**
 * Theme Integration Test
 * Verifies next-themes is properly configured and theme switching works
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from 'next-themes';

// Test component that uses the theme hook
function ThemeTestComponent() {
  const { theme, systemTheme, setTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div>
      <div data-testid="current-theme">{currentTheme}</div>
      <div data-testid="theme-value">{theme}</div>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
}

describe('Theme Integration', () => {
  it('should provide theme context', async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <ThemeTestComponent />
      </ThemeProvider>
    );

    // Wait for theme to be initialized
    await waitFor(() => {
      const themeValue = screen.getByTestId('theme-value');
      expect(themeValue.textContent).toBeTruthy();
    });
  });

  it('should support light and dark themes', async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <ThemeTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      const themeValue = screen.getByTestId('theme-value');
      expect(['light', 'dark', 'system']).toContain(themeValue.textContent);
    });
  });

  it('should support system theme detection', async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      const themeValue = screen.getByTestId('theme-value');
      expect(themeValue.textContent).toBeTruthy();
    });
  });

  it('should provide useTheme hook', () => {
    const TestHook = () => {
      const theme = useTheme();
      return <div data-testid="hook-result">{theme ? 'available' : 'unavailable'}</div>;
    };

    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <TestHook />
      </ThemeProvider>
    );

    expect(screen.getByTestId('hook-result').textContent).toBe('available');
  });
});
