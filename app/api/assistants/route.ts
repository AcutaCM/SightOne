/**
 * GET /api/assistants
 * 
 * Retrieves a list of preset assistants with optional filtering.
 * Supports query parameters: page, pageSize, status, author, search, category
 */

import { NextRequest, NextResponse } from 'next/server';
import { PRESET_ASSISTANTS } from '@/lib/constants/presetAssistants';
import { ApiResponse, AssistantListResponse, Assistant } from '@/types/assistant';
import { ResponseOptimizer, CacheControl } from '@/lib/api/responseOptimizer';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 20;
    const status = searchParams.get('status') || undefined;
    const author = searchParams.get('author') || undefined;
    const search = searchParams.get('search')?.toLowerCase() || undefined;
    const category = searchParams.get('category') || undefined;

    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETER',
            message: 'Page must be greater than 0',
          },
        },
        { status: 400 }
      );
    }

    if (pageSize < 1 || pageSize > 100) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETER',
            message: 'Page size must be between 1 and 100',
          },
        },
        { status: 400 }
      );
    }

    // Filter preset assistants
    let filteredAssistants = [...PRESET_ASSISTANTS] as Assistant[];

    if (status) {
      filteredAssistants = filteredAssistants.filter(a => a.status === status);
    }

    if (author) {
      filteredAssistants = filteredAssistants.filter(a => a.author === author);
    }

    if (category) {
      filteredAssistants = filteredAssistants.filter(a => 
        a.category?.includes(category as any)
      );
    }

    if (search) {
      filteredAssistants = filteredAssistants.filter(a => 
        a.title.toLowerCase().includes(search) ||
        a.desc.toLowerCase().includes(search) ||
        a.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Calculate pagination
    const total = filteredAssistants.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredAssistants.slice(startIndex, endIndex);

    const result: AssistantListResponse = {
      data: paginatedData,
      total,
      page,
      pageSize,
    };

    // Parse field selection
    const fields = ResponseOptimizer.parseFields(searchParams.get('fields'));

    // Generate ETag for caching
    const etag = ResponseOptimizer.generateETag(result);
    const requestETag = request.headers.get('if-none-match');

    // Check if client has cached version
    if (ResponseOptimizer.checkETag(requestETag, etag)) {
      return ResponseOptimizer.notModified(etag);
    }

    // Return optimized response with pagination metadata
    return ResponseOptimizer.paginated(
      result.data,
      result.total,
      result.page,
      result.pageSize,
      {
        cacheControl: CacheControl.SHORT,
        etag,
        fields,
        compress: true,
      }
    );
  } catch (error) {
    console.error('Error fetching assistants:', error);
    return ResponseOptimizer.error(
      'Failed to fetch assistants',
      'INTERNAL_ERROR',
      500,
      error
    );
  }
}

