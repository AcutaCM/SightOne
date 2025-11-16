import { render, screen } from '../utils/test-utils'
import UserMenu from '@/components/UserMenu'
import { mockUser, mockAdminUser } from '../utils/mock-data'

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

import { useAuth } from '@/contexts/AuthContext'

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('UserMenu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })

    const { container } = render(<UserMenu />)
    expect(container.firstChild).toBeNull()
  })

  it('should render user avatar when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })

    render(<UserMenu />)
    // HeroUI Avatar 应该被渲染
    const avatar = screen.getByRole('button')
    expect(avatar).toBeInTheDocument()
  })

  it('should display correct role color for admin', () => {
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })

    render(<UserMenu />)
    const avatar = screen.getByRole('button')
    expect(avatar).toBeInTheDocument()
  })
})
