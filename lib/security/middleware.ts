/**
 * Security Middleware
 * Provides security middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from './validation';
import { logger } from '../logger/logger';

/**
 * Error response helper
 */
export function errorResponse(
  error: Error,
  status: number = 500
): NextResponse {
  const isValidationError = error instanceof ValidationError;

  const response = {
    success: false,
    error: {
      code: isValidationError ? (error as ValidationError).code : 'INTERNAL_ERROR',
      message: error.message,
      field: isValidationError ? (error as ValidationError).field : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
  };

  // Log error
  logger.error('API Error', {
    status,
    error: error.message,
    stack: error.stack,
  });

  return NextResponse.json(response, { status });
}

/**
 * Validation middleware wrapper
 */
export function withValidation<T>(
  handler: (req: NextRequest, validated: T) => Promise<NextResponse>,
  validator: (data: unknown) => T
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const body = await req.json();
      const validated = validator(body);
      return await handler(req, validated);
    } catch (error) {
      if (error instanceof ValidationError) {
        return errorResponse(error, 400);
      }
      if (error instanceof SyntaxError) {
        return errorResponse(new Error('Invalid JSON'), 400);
      }
      return errorResponse(error as Error, 500);
    }
  };
}

/**
 * Rate limiting store
 */
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  check(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const rateLimitStore = new RateLimitStore();

// Cleanup rate limit store every minute
if (typeof window === 'undefined') {
  setInterval(() => rateLimitStore.cleanup(), 60000);
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    limit?: number;
    windowMs?: number;
    keyGenerator?: (req: NextRequest) => string;
  } = {}
) {
  const {
    limit = 100,
    windowMs = 60000, // 1 minute
    keyGenerator = (req) => {
      // Use IP address or a default key
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
      return ip;
    },
  } = options;

  return async (req: NextRequest): Promise<NextResponse> => {
    const key = keyGenerator(req);

    if (!rateLimitStore.check(key, limit, windowMs)) {
      logger.warn('Rate limit exceeded', { key, limit, windowMs });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(windowMs / 1000)),
          },
        }
      );
    }

    return await handler(req);
  };
}

/**
 * CORS middleware
 */
export function withCORS(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    origin?: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = false,
  } = options;

  return async (req: NextRequest): Promise<NextResponse> => {
    // Handle preflight request
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': Array.isArray(origin) ? origin.join(',') : origin,
          'Access-Control-Allow-Methods': methods.join(','),
          'Access-Control-Allow-Headers': allowedHeaders.join(','),
          'Access-Control-Allow-Credentials': credentials ? 'true' : 'false',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Handle actual request
    const response = await handler(req);

    // Add CORS headers to response
    response.headers.set(
      'Access-Control-Allow-Origin',
      Array.isArray(origin) ? origin.join(',') : origin
    );
    response.headers.set('Access-Control-Allow-Methods', methods.join(','));
    response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(','));
    if (credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  };
}

/**
 * CSRF protection middleware
 */
export function withCSRF(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    tokenHeader?: string;
    cookieName?: string;
  } = {}
) {
  const {
    tokenHeader = 'x-csrf-token',
    cookieName = 'csrf-token',
  } = options;

  return async (req: NextRequest): Promise<NextResponse> => {
    // Skip CSRF check for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return await handler(req);
    }

    const token = req.headers.get(tokenHeader);
    const cookie = req.cookies.get(cookieName)?.value;

    if (!token || !cookie || token !== cookie) {
      logger.warn('CSRF token validation failed', {
        hasToken: !!token,
        hasCookie: !!cookie,
        match: token === cookie,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CSRF_TOKEN_INVALID',
            message: 'Invalid CSRF token',
          },
        },
        { status: 403 }
      );
    }

    return await handler(req);
  };
}

/**
 * Combine multiple middleware
 */
export function compose(
  ...middlewares: Array<
    (handler: (req: NextRequest) => Promise<NextResponse>) => (req: NextRequest) => Promise<NextResponse>
  >
) {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * Security headers middleware
 */
export function withSecurityHeaders(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    );

    return response;
  };
}

/**
 * Request logging middleware
 */
export function withLogging(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const start = Date.now();
    const { method, url } = req;

    logger.info('API Request', { method, url });

    try {
      const response = await handler(req);
      const duration = Date.now() - start;

      logger.info('API Response', {
        method,
        url,
        status: response.status,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - start;

      logger.error('API Error', {
        method,
        url,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };
}
