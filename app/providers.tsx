'use client';

import * as React from 'react';
import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes/dist/types';
import { AuthProvider } from '@/contexts/AuthContext';
import { AssistantProvider } from '@/contexts/AssistantContext';
import { CustomThemeProvider } from '@/contexts/ThemeContext';
import { ChatProvider } from '@/contexts/ChatContext';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <HeroUIProvider>
      <NextThemesProvider {...themeProps}>
        <CustomThemeProvider>
          <AuthProvider>
            <AssistantProvider>
              <ChatProvider>
                {children}
              </ChatProvider>
            </AssistantProvider>
          </AuthProvider>
        </CustomThemeProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}