/**
 * GET /api/assistants/[id]
 * 
 * Retrieves a single assistant by ID.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PRESET_ASSISTANTS } from '@/lib/constants/presetAssistants';
import { ApiResponse, Assistant } from '@/types/assistant';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Find assistant in preset list
    const assistant = PRESET_ASSISTANTS.find(a => a.id === id);

    // Handle not found
    if (!assistant) {
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

    // Return successful response
    return NextResponse.json<ApiResponse<Assistant>>(
      {
        success: true,
        data: assistant as Assistant,
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching assistant:', error);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch assistant',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
      },
      { status: 500 }
    );
  }
}
