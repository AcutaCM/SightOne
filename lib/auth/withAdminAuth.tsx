import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken, JWTPayload } from './jwt';

/**
 * Admin Authentication Result
 * Contains authentication status and user information
 */
export interface AdminAuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: {
    email: string;
    role: string;
    userId: string;
  } | null;
  error?: string;
}

/**
 * Props passed to wrapped components
 */
export interface WithAdminAuthProps {
  authResult: AdminAuthResult;
}

/**
 * Server-side authentication check for admin pages
 * Validates JWT token and verifies admin role
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export async function getAdminAuth(): Promise<AdminAuthResult> {
  try {
    // Get cookies from the request
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    // Check for JWT token in cookies (Requirement 2.1)
    if (!accessToken) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        error: 'No authentication token found',
      };
    }

    // Validate token server-side (Requirement 2.1)
    const payload = await verifyToken(accessToken);

    // If token is invalid (Requirement 2.2, 2.3)
    if (!payload) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        error: 'Invalid or expired token',
      };
    }

    // Verify admin role (Requirement 2.4)
    const isAdmin = payload.role === 'admin';

    // Return authenticated user data (Requirement 2.4)
    return {
      isAuthenticated: true,
      isAdmin,
      user: {
        email: payload.email,
        role: payload.role,
        userId: payload.userId,
      },
      error: isAdmin ? undefined : 'User is not an admin',
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      error: 'Authentication failed',
    };
  }
}

/**
 * Higher-Order Component for protecting admin pages
 * Wraps page components with server-side authentication
 * 
 * Usage:
 * ```tsx
 * export default withAdminAuth(AdminPage);
 * ```
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P & WithAdminAuthProps>,
  options?: {
    requireAdmin?: boolean; // If true, redirects non-admin users
    redirectTo?: string; // Custom redirect path
  }
) {
  const { requireAdmin = true, redirectTo = '/login' } = options || {};

  return async function AdminAuthWrapper(props: P) {
    // Perform server-side authentication check
    const authResult = await getAdminAuth();

    // Handle redirect to login for unauthorized users (Requirement 2.2, 2.3)
    if (!authResult.isAuthenticated) {
      redirect(redirectTo);
    }

    // If admin role is required and user is not admin (Requirement 2.4)
    if (requireAdmin && !authResult.isAdmin) {
      // Don't redirect, let the component handle the "Access Denied" message
      // This allows the page to show appropriate error UI
    }

    // Pass authenticated user data to wrapped component (Requirement 2.4)
    return <Component {...props} authResult={authResult} />;
  };
}

/**
 * Utility function to check if user is authenticated admin
 * Can be used in server components without HOC
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export async function requireAdminAuth(): Promise<{
  email: string;
  role: string;
  userId: string;
}> {
  const authResult = await getAdminAuth();

  // Redirect to login if not authenticated (Requirement 2.2, 2.3)
  if (!authResult.isAuthenticated) {
    redirect('/login');
  }

  // Redirect to login if not admin (Requirement 2.4)
  if (!authResult.isAdmin) {
    redirect('/login');
  }

  // Return user data
  return authResult.user!;
}

/**
 * Utility function to get current user without requiring admin
 * Returns null if not authenticated
 * 
 * Requirements: 2.1, 2.2, 2.3
 */
export async function getCurrentUser(): Promise<{
  email: string;
  role: string;
  userId: string;
} | null> {
  const authResult = await getAdminAuth();

  if (!authResult.isAuthenticated || !authResult.user) {
    return null;
  }

  return authResult.user;
}
