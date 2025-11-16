import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, JWTPayload } from './jwt';

/**
 * 认证中间件 - 验证JWT令牌
 */
export async function authMiddleware(request: NextRequest): Promise<{
  user: JWTPayload | null;
  error: string | null;
}> {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return {
        user: null,
        error: '未提供有效的认证令牌',
      };
    }

    // 验证令牌类型
    if (user.type !== 'access') {
      return {
        user: null,
        error: '无效的令牌类型',
      };
    }

    return {
      user,
      error: null,
    };
  } catch (error) {
    console.error('认证中间件错误:', error);
    return {
      user: null,
      error: '认证失败',
    };
  }
}

/**
 * 角色验证中间件
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{
  user: JWTPayload | null;
  error: string | null;
}> {
  const { user, error } = await authMiddleware(request);

  if (error || !user) {
    return { user: null, error: error || '认证失败' };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      error: '权限不足',
    };
  }

  return { user, error: null };
}

/**
 * 管理员权限验证
 */
export async function requireAdmin(request: NextRequest) {
  return await requireRole(request, ['admin']);
}

/**
 * 创建认证错误响应
 */
export function createAuthErrorResponse(message: string, status: number = 401) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        message,
      },
    },
    { status }
  );
}

/**
 * 设置认证Cookie
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  // 设置Access Token Cookie（7天）
  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7天
    path: '/',
  });

  // 设置Refresh Token Cookie（30天）
  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30天
    path: '/',
  });
}

/**
 * 清除认证Cookie
 */
export function clearAuthCookies(response: NextResponse) {
  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  // 清除旧的user_email cookie（向后兼容）
  response.cookies.set('user_email', '', {
    maxAge: 0,
    path: '/',
  });
}
