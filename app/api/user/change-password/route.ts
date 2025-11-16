import { NextRequest, NextResponse } from 'next/server';
import { userDatabase } from '@/lib/userDatabase';

export async function POST(request: NextRequest) {
  try {
    // 优先使用 Cookie 认证
    const email = request.cookies.get('user_email')?.value;
    let userId: string | undefined;
    
    if (email) {
      // Cookie 认证：通过 email 查找用户
      const user = userDatabase.getUserByEmail(email);
      if (user) {
        userId = user.id;
      }
    } else {
      // 回退到 Bearer token 认证（向后兼容）
      const authorization = request.headers.get('authorization');
      
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return NextResponse.json(
          { message: '未提供有效的认证信息' },
          { status: 401 }
        );
      }

      const token = authorization.split(' ')[1];
      const sessionData = userDatabase.getSessionByToken(token);
      
      if (!sessionData) {
        return NextResponse.json(
          { message: 'Token无效或已过期' },
          { status: 401 }
        );
      }
      
      userId = sessionData.user.id;
    }

    if (!userId) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    const { oldPassword, newPassword } = await request.json();

    // 验证输入
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { message: '请提供旧密码和新密码' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: '新密码长度至少6位' },
        { status: 400 }
      );
    }

    // 更改密码
    const success = await userDatabase.changePassword(
      userId,
      oldPassword,
      newPassword
    );

    if (!success) {
      return NextResponse.json(
        { message: '旧密码不正确' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '密码修改成功'
    });

  } catch (error) {
    console.error('修改密码错误:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}