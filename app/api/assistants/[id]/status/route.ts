/**
 * PATCH /api/assistants/[id]/status
 * 
 * Updates the status of an assistant with optimistic locking.
 * Used for review workflow (draft -> pending -> published/rejected).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDefaultRepository, NotFoundError, VersionConflictError } from '@/lib/db/assistantRepository';
import { ApiResponse, Assistant, UpdateStatusRequest, AssistantStatus } from '@/types/assistant';
import { getCurrentUserId, isAdmin, isCurrentUserAdmin } from '@/lib/security/adminRole';
import { logStatusChange } from '@/lib/security/operationLog';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Declare at function scope for error handler access
  
  try {
    // Validate ID parameter
    if (!id || id.trim() === '') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETER',
            message: 'Assistant ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body: UpdateStatusRequest = await request.json();

    // Validate required fields
    if (!body.status) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Status field is required',
          },
        },
        { status: 400 }
      );
    }

    if (typeof body.version !== 'number') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Version field is required for status updates',
          },
        },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses: AssistantStatus[] = ['draft', 'pending', 'published', 'rejected'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Status must be one of: ${validStatuses.join(', ')}`,
            details: { providedStatus: body.status },
          },
        },
        { status: 400 }
      );
    }

    // Validate review note length if provided
    if (body.reviewNote && body.reviewNote.length > 500) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Review note must not exceed 500 characters',
          },
        },
        { status: 400 }
      );
    }

    // Get current assistant to log old status
    const repository = getDefaultRepository();
    const existing = repository.findById(id);
    
    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Assistant with id ${id} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Update status in database
    const updated = repository.updateStatus(
      id,
      body.status,
      body.version,
      body.reviewNote?.trim()
    );

    // Log status change (Requirement 6.5)
    const userId = await getCurrentUserId();
    const userIsAdmin = await isCurrentUserAdmin();
    logStatusChange(
      id,
      updated.title,
      userId,
      userIsAdmin,
      existing.status,
      body.status,
      true
    );

    // Return updated assistant
    return NextResponse.json<ApiResponse<Assistant>>(
      {
        success: true,
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating assistant status:', error);

    // Log error (Requirement 6.5)
    // Note: body may not be available if error occurred during parsing
    const userId = await getCurrentUserId();
    const userIsAdmin = await isCurrentUserAdmin();
    logStatusChange(
      id,
      'unknown',
      userId,
      userIsAdmin,
      'unknown',
      'unknown', // Can't access body.status in catch block
      false,
      (error as Error).message
    );

    // Handle version conflict
    if (error instanceof VersionConflictError) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'VERSION_CONFLICT',
            message: 'This assistant has been modified by another user. Please refresh and try again.',
          },
        },
        { status: 409 }
      );
    }

    // Handle not found
    if (error instanceof NotFoundError) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        },
        { status: 404 }
      );
    }

    // Handle other errors
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update assistant status',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
      },
      { status: 500 }
    );
  }
}
