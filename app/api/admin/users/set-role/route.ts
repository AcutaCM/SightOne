import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAuthErrorResponse } from '../../../../../lib/auth/middleware';
import { userDatabase } from '../../../../../lib/auth/userDatabase';

/**
 * Set Role API - Updates user role in database
 * 
 * Security Features:
 * - Protected with admin authentication middleware
 * - Validates email and role parameters
 * - Prevents removing the last admin
 * - Logs role changes for audit
 * - Returns success/error response
 * 
 * Requirements: 4.4
 */

// Valid role types
const VALID_ROLES = ['admin', 'user', 'normal'] as const;
type ValidRole = typeof VALID_ROLES[number];

function isValidRole(role: string): role is ValidRole {
  return VALID_ROLES.includes(role as ValidRole);
}

export async function POST(req: NextRequest) {
  // Verify admin authentication (Requirement 4.4)
  const { user, error } = await requireAdmin(req);

  if (error || !user) {
    return createAuthErrorResponse(
      error || 'Admin authentication required',
      error === '权限不足' ? 403 : 401
    );
  }

  try {
    // Parse request body
    const body = await req.json();
    const { email, role } = body;

    // Validate email parameter (Requirement 4.4)
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: 'Valid email is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EMAIL_FORMAT',
            message: 'Invalid email format',
          },
        },
        { status: 400 }
      );
    }

    // Validate role parameter (Requirement 4.4)
    if (!role || typeof role !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ROLE',
            message: 'Valid role is required',
          },
        },
        { status: 400 }
      );
    }

    if (!isValidRole(role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ROLE',
            message: `Role must be one of: ${VALID_ROLES.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = userDatabase.getUserByEmail(email);
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      );
    }

    // Prevent removing the last admin
    if (targetUser.role === 'admin' && role !== 'admin') {
      const allUsers = userDatabase.getAllUsers();
      const adminCount = allUsers.filter(u => u.role === 'admin').length;
      
      if (adminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'LAST_ADMIN',
              message: 'Cannot remove the last admin user',
            },
          },
          { status: 400 }
        );
      }
    }

    // Prevent admin from changing their own role
    if (user.email === email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SELF_ROLE_CHANGE',
            message: 'Cannot change your own role',
          },
        },
        { status: 400 }
      );
    }

    // Update user role in database (Requirement 4.4)
    const success = userDatabase.updateUserRole(email, role);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update user role',
          },
        },
        { status: 500 }
      );
    }

    // Log role change for audit (Requirement 4.4)
    const timestamp = new Date().toISOString();
    console.log(`[AUDIT] ${timestamp} - Admin ${user.email} changed role of ${email} from ${targetUser.role} to ${role}`);

    // Return success response (Requirement 4.4)
    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        email,
        oldRole: targetUser.role,
        newRole: role,
        updatedBy: user.email,
        timestamp,
      },
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    
    // Log error for audit
    const timestamp = new Date().toISOString();
    console.error(`[AUDIT] ${timestamp} - Failed role update attempt by admin ${user.email}:`, error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user role',
        },
      },
      { status: 500 }
    );
  }
}
