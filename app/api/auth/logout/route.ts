import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth/middleware';

/**
 * JWT-based退出登录：清除所有认证Cookie
 */
export async function POST(_req: NextRequest) {
  const response = NextResponse.json({ 
    success: true, 
    message: '退出登录成功' 
  });
  
  // 清除JWT认证Cookie
  clearAuthCookies(response);
  
  return response;
}