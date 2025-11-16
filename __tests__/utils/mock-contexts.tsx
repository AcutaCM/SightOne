import React from 'react'

/**
 * Mock Context Providers for testing
 */

// Mock AuthContext
export const MockAuthProvider = ({ 
  children, 
  value = { 
    user: null, 
    isAuthenticated: false, 
    login: jest.fn(), 
    logout: jest.fn() 
  } 
}: any) => {
  return <div data-testid="mock-auth-provider">{children}</div>
}

// Mock DroneContext
export const MockDroneProvider = ({ 
  children, 
  value = { 
    connected: false, 
    status: {}, 
    connect: jest.fn(), 
    disconnect: jest.fn() 
  } 
}: any) => {
  return <div data-testid="mock-drone-provider">{children}</div>
}

// Mock LayoutContext
export const MockLayoutProvider = ({ 
  children, 
  value = { 
    layout: 'grid', 
    setLayout: jest.fn() 
  } 
}: any) => {
  return <div data-testid="mock-layout-provider">{children}</div>
}

/**
 * 创建带有所有 mock context 的 wrapper
 */
export const createMockWrapper = (contextValues: any = {}) => {
  return ({ children }: { children: React.ReactNode }) => (
    <MockAuthProvider value={contextValues.auth}>
      <MockDroneProvider value={contextValues.drone}>
        <MockLayoutProvider value={contextValues.layout}>
          {children}
        </MockLayoutProvider>
      </MockDroneProvider>
    </MockAuthProvider>
  )
}
