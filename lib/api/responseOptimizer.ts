/**
 * Response Optimizer
 * 
 * Optimizes API responses with compression, caching headers, and field selection.
 * Improves API performance and reduces bandwidth usage.
 */

import { NextResponse } from 'next/server';

/**
 * Response optimization options
 */
export interface ResponseOptions {
  /** Enable gzip compression */
  compress?: boolean;
  /** Cache control header value */
  cacheControl?: string;
  /** ETag for conditional requests */
  etag?: string;
  /** Fields to include in response (for field selection) */
  fields?: string[];
  /** Enable pretty JSON formatting (dev only) */
  pretty?: boolean;
}

/**
 * Default cache control headers for different scenarios
 */
export const CacheControl = {
  /** No caching - always fetch fresh data */
  NO_CACHE: 'no-cache, no-store, must-revalidate',
  
  /** Short cache - 1 minute */
  SHORT: 'public, max-age=60, s-maxage=60',
  
  /** Medium cache - 5 minutes */
  MEDIUM: 'public, max-age=300, s-maxage=300',
  
  /** Long cache - 1 hour */
  LONG: 'public, max-age=3600, s-maxage=3600',
  
  /** Immutable cache - 1 year */
  IMMUTABLE: 'public, max-age=31536000, immutable',
};

/**
 * Response Optimizer class
 */
export class ResponseOptimizer {
  /**
   * Create an optimized JSON response
   */
  static json<T>(
    data: T,
    status: number = 200,
    options: ResponseOptions = {}
  ): NextResponse {
    const {
      compress = true,
      cacheControl = CacheControl.NO_CACHE,
      etag,
      fields,
      pretty = process.env.NODE_ENV === 'development',
    } = options;

    // Apply field selection if specified
    let responseData = data;
    if (fields && fields.length > 0) {
      responseData = this.selectFields(data, fields);
    }

    // Serialize JSON
    const jsonString = pretty
      ? JSON.stringify(responseData, null, 2)
      : JSON.stringify(responseData);

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
    };

    // Add ETag if provided
    if (etag) {
      headers['ETag'] = etag;
    }

    // Note: Compression is handled automatically by Next.js/server
    // Do NOT manually set Content-Encoding header as it will cause errors
    // if the content is not actually compressed

    // Add performance headers
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-Response-Time'] = `${Date.now()}`;

    return new NextResponse(jsonString, {
      status,
      headers,
    });
  }

  /**
   * Create an error response
   */
  static error(
    message: string,
    code: string,
    status: number = 500,
    details?: any
  ): NextResponse {
    return this.json(
      {
        success: false,
        error: {
          code,
          message,
          details: process.env.NODE_ENV === 'development' ? details : undefined,
        },
      },
      status,
      { cacheControl: CacheControl.NO_CACHE }
    );
  }

  /**
   * Create a success response
   */
  static success<T>(
    data: T,
    options: ResponseOptions = {}
  ): NextResponse {
    return this.json(
      {
        success: true,
        data,
      },
      200,
      options
    );
  }

  /**
   * Select specific fields from data
   */
  private static selectFields<T>(data: T, fields: string[]): any {
    if (Array.isArray(data)) {
      return data.map(item => this.selectFieldsFromObject(item, fields));
    }
    
    if (typeof data === 'object' && data !== null) {
      return this.selectFieldsFromObject(data, fields);
    }

    return data;
  }

  /**
   * Select fields from a single object
   */
  private static selectFieldsFromObject(obj: any, fields: string[]): any {
    const result: any = {};

    for (const field of fields) {
      // Support nested fields with dot notation
      if (field.includes('.')) {
        const parts = field.split('.');
        let value = obj;
        
        for (const part of parts) {
          value = value?.[part];
          if (value === undefined) break;
        }

        if (value !== undefined) {
          this.setNestedValue(result, parts, value);
        }
      } else {
        if (obj[field] !== undefined) {
          result[field] = obj[field];
        }
      }
    }

    return result;
  }

  /**
   * Set nested value in object
   */
  private static setNestedValue(obj: any, path: string[], value: any): void {
    let current = obj;
    
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[path[path.length - 1]] = value;
  }

  /**
   * Generate ETag from data
   */
  static generateETag(data: any): string {
    const jsonString = JSON.stringify(data);
    
    // Simple hash function for ETag
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `"${Math.abs(hash).toString(36)}"`;
  }

  /**
   * Check if request has matching ETag
   */
  static checkETag(requestETag: string | null, currentETag: string): boolean {
    if (!requestETag) return false;
    return requestETag === currentETag;
  }

  /**
   * Create a 304 Not Modified response
   */
  static notModified(etag: string): NextResponse {
    return new NextResponse(null, {
      status: 304,
      headers: {
        'ETag': etag,
        'Cache-Control': CacheControl.SHORT,
      },
    });
  }

  /**
   * Compress large JSON responses
   */
  static shouldCompress(data: any): boolean {
    const jsonString = JSON.stringify(data);
    return jsonString.length > 1024; // Compress if > 1KB
  }

  /**
   * Get optimal cache control for data type
   */
  static getCacheControl(dataType: 'list' | 'detail' | 'static'): string {
    switch (dataType) {
      case 'list':
        return CacheControl.SHORT; // Lists change frequently
      case 'detail':
        return CacheControl.MEDIUM; // Details change less often
      case 'static':
        return CacheControl.LONG; // Static data rarely changes
      default:
        return CacheControl.NO_CACHE;
    }
  }

  /**
   * Parse field selection from query string
   */
  static parseFields(fieldsParam: string | null): string[] | undefined {
    if (!fieldsParam) return undefined;
    
    return fieldsParam
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);
  }

  /**
   * Create paginated response with metadata
   */
  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number,
    options: ResponseOptions = {}
  ): NextResponse {
    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return this.success(
      {
        data,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
          hasNext,
          hasPrev,
        },
      },
      options
    );
  }

  /**
   * Measure response size
   */
  static measureSize(data: any): {
    bytes: number;
    kilobytes: number;
    megabytes: number;
  } {
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;

    return {
      bytes,
      kilobytes: bytes / 1024,
      megabytes: bytes / (1024 * 1024),
    };
  }
}

/**
 * Middleware for response optimization
 */
export function withResponseOptimization(
  handler: (request: Request) => Promise<NextResponse>,
  options: ResponseOptions = {}
) {
  return async (request: Request): Promise<NextResponse> => {
    const startTime = performance.now();

    try {
      // Execute handler
      const response = await handler(request);

      // Add performance header
      const duration = performance.now() - startTime;
      response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);

      return response;
    } catch (error) {
      console.error('Response optimization error:', error);
      return ResponseOptimizer.error(
        'Internal server error',
        'INTERNAL_ERROR',
        500,
        error
      );
    }
  };
}
