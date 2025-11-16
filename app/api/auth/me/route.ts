import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/jwt';
import { userDatabase } from '@/lib/auth/userDatabase';

export async function GET(req: NextRequest) {
  try {
    // 尝试从JWT获取用户信息
    const jwtUser = await getUserFromRequest(req);
    
    if (jwtUser && jwtUser.type === 'access') {
      // 从数据库获取最新用户信息
      const user = userDatabase.getUserByEmail(jwtUser.email);
      
      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          // 保持向后兼容
          email: user.email,
          role: user.role,
        });
      }
    }

    // 向后兼容：检查旧的cookie-based认证
    const legacyEmail = req.cookies.get('user_email')?.value;
    if (legacyEmail) {
      const user = userDatabase.getUserByEmail(legacyEmail.toLowerCase());
      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          email: user.email,
          role: user.role,
        });
      }
    }

    // 未认证
    return NextResponse.json({
      success: false,
      email: null,
      role: 'normal',
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json({
      success: false,
      email: null,
      role: 'normal',
    });
  }
}