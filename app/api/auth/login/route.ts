import { NextRequest, NextResponse } from 'next/server';
import { userDatabase } from '@/lib/auth/userDatabase';
import { generateTokenPair } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '请提供邮箱和密码' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // 查找用户
    const user = userDatabase.getUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await userDatabase.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 生成JWT令牌对
    const { accessToken, refreshToken } = await generateTokenPair({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
    });

    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // 设置认证Cookie
    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { success: false, error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}