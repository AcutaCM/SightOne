import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { HeroUIProvider } from '@heroui/react'
import { ThemeProvider } from 'next-themes'

/**
 * 自定义渲染函数，包含所有必要的 Provider
 */
interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <HeroUIProvider>
        {children}
      </HeroUIProvider>
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
