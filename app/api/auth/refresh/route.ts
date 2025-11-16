import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateTokenPair } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/middleware';
import { userDatabase } from '@/lib/auth/userDatabase';

/**
 * 刷新访问令牌
 */
export async function POST(req: NextRequest) {
  try {
    // 从Cookie中获取refresh token
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: '未提供刷新令牌' },
        { status: 401 }
      );
    }

    // 验证refresh token
    const payload = await verifyToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: '刷新令牌无效或已过期' },
        { status: 401 }
      );
    }

    // 验证token类型
    if (payload.type !== 'refresh') {
      return NextResponse.json(
        { success: false, error: '无效的令牌类型' },
        { status: 401 }
      );
    }

    // 验证用户是否仍然存在
    const user = userDatabase.getUserByEmail(payload.email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 401 }
      );
    }

    // 生成新的令牌对
    const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
    });

    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: '令牌刷新成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // 设置新的认证Cookie
    setAuthCookies(response, accessToken, newRefreshToken);

    return response;
  } catch (error) {
    console.error('令牌刷新错误:', error);
    return NextResponse.json(
      { success: false, error: '令牌刷新失败' },
      { status: 500 }
    );
  }
}
