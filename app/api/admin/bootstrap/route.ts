import { NextRequest, NextResponse } from 'next/server';
import { listUsers, setUserRole } from '../../../../lib/user-store';

/**
 * Bootstrap API - One-time admin creation
 * 
 * Security Features:
 * - Only works when no admin exists
 * - Validates email format
 * - Logs all attempts for security auditing
 * - Returns appropriate error messages
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Security logger for bootstrap attempts
 */
function logBootstrapAttempt(
  email: string,
  success: boolean,
  reason: string,
  ip?: string
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event: 'bootstrap_attempt',
    email,
    success,
    reason,
    ip: ip || 'unknown',
  };
  
  // Log to console for security auditing (Requirement 5.5)
  console.log('[SECURITY AUDIT]', JSON.stringify(logEntry));
  
  // In production, this should also write to a secure audit log file
  // or send to a logging service
}

export async function POST(req: NextRequest) {
  // Get client IP for logging
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';

  // Parse and validate request body
  let body;
  try {
    body = await req.json();
  } catch (error) {
    logBootstrapAttempt('', false, 'Invalid JSON body', ip);
    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid request body' 
      }, 
      { status: 400 }
    );
  }

  const email = String(body?.email || '').toLowerCase().trim();

  // Validate email is provided (Requirement 5.2)
  if (!email) {
    logBootstrapAttempt('', false, 'Email not provided', ip);
    return NextResponse.json(
      { 
        success: false,
        error: 'Email is required' 
      }, 
      { status: 400 }
    );
  }

  // Validate email format (Requirement 5.2)
  if (!isValidEmail(email)) {
    logBootstrapAttempt(email, false, 'Invalid email format', ip);
    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid email format' 
      }, 
      { status: 400 }
    );
  }

  // Check if admin already exists (Requirement 5.1)
  const users = listUsers();
  const hasAdmin = users.some(u => u.role === 'admin');
  
  if (hasAdmin) {
    // Log failed attempt due to existing admin (Requirement 5.5)
    logBootstrapAttempt(email, false, 'Admin already exists', ip);
    
    // Return error message (Requirement 5.2)
    return NextResponse.json(
      { 
        success: false,
        error: 'Admin already exists' 
      }, 
      { status: 403 }
    );
  }

  // Create admin user (Requirement 5.3)
  try {
    setUserRole(email, 'admin');
    
    // Log successful bootstrap (Requirement 5.5)
    logBootstrapAttempt(email, true, 'Admin created successfully', ip);
    
    // Return success with admin email (Requirement 5.4)
    return NextResponse.json({ 
      success: true,
      email,
      role: 'admin',
      message: 'Admin user created successfully'
    });
  } catch (error) {
    // Log error during admin creation
    logBootstrapAttempt(email, false, `Error: ${error}`, ip);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create admin user' 
      }, 
      { status: 500 }
    );
  }
}