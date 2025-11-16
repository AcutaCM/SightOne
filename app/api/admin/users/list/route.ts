import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAuthErrorResponse } from '../../../../../lib/auth/middleware';
import { userDatabase } from '../../../../../lib/auth/userDatabase';

/**
 * User List API - Returns all users with roles
 * 
 * Security Features:
 * - Protected with admin authentication middleware
 * - Returns list of all users with roles
 * - Includes hasAdmin flag in response
 * - Excludes password hashes from response
 * 
 * Requirements: 4.3
 */

export async function GET(req: NextRequest) {
  // Verify admin authentication (Requirement 4.3)
  const { user, error } = await requireAdmin(req);

  if (error || !user) {
    return createAuthErrorResponse(
      error || 'Admin authentication required',
      error === '权限不足' ? 403 : 401
    );
  }

  try {
    // Get all users from database (excluding password hashes)
    const users = userDatabase.getAllUsers();

    // Check if any admin exists (Requirement 4.3)
    const hasAdmin = users.some(u => u.role === 'admin');

    // Return user list with hasAdmin flag
    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.name,
        role: u.role,
        created_at: u.created_at,
        updated_at: u.updated_at,
      })),
      hasAdmin,
      count: users.length,
    });
  } catch (error) {
    console.error('Error fetching user list:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch user list',
        },
      },
      { status: 500 }
    );
  }
}
