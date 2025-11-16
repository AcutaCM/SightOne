import { NextRequest, NextResponse } from 'next/server';
import { userDatabase } from '@/lib/auth/userDatabase';
import { generateTokenPair } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, name } = await request.json();

    // 验证输入
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: '用户名、邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少6位' },
        { status: 400 }
      );
    }

    // 验证用户名长度
    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: '用户名长度至少3位' },
        { status: 400 }
      );
    }

    // 检查是否是第一个用户（自动设为管理员）
    const hasAdmin = userDatabase.hasAdmin();
    const role = hasAdmin ? 'user' : 'admin';

    // 创建新用户
    try {
      const newUser = await userDatabase.createUser({
        username,
        email: email.toLowerCase().trim(),
        password,
        name: name || username,
        role,
      });

      // 生成JWT令牌对
      const { accessToken, refreshToken } = await generateTokenPair({
        userId: newUser.id.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      // 创建响应（不包含密码哈希）
      const response = NextResponse.json({
        success: true,
        message: '注册成功',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });

      // 设置认证Cookie
      setAuthCookies(response, accessToken, refreshToken);

      return response;
    } catch (dbError: any) {
      // 处理数据库错误（如重复用户名或邮箱）
      return NextResponse.json(
        { success: false, error: dbError.message },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error('注册处理错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}