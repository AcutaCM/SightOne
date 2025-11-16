import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../../lib/auth/middleware';

/**
 * GET /api/auth/current
 * Returns authenticated user information
 * 
 * Requirements: 2.1, 2.2, 2.3
 */
export async function GET(request: NextRequest) {
  try {
    // Use existing JWT middleware to validate token
    const { user, error } = await authMiddleware(request);

    // Handle unauthenticated requests gracefully
    if (error || !user) {
      return NextResponse.json(
        {
          email: '',
          role: 'normal',
          authenticated: false,
        },
        { status: 200 }
      );
    }

    // Return user email, role, and authentication status
    return NextResponse.json(
      {
        email: user.email,
        role: user.role,
        authenticated: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/auth/current:', error);
    
    // Handle errors gracefully - return unauthenticated state
    return NextResponse.json(
      {
        email: '',
        role: 'normal',
        authenticated: false,
      },
      { status: 200 }
    );
  }
}