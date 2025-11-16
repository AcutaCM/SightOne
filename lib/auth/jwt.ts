import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from 'jose';
import { NextRequest } from 'next/server';

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-please-use-strong-random-string';
const JWT_EXPIRES_IN = '7d'; // Token有效期7天
const REFRESH_TOKEN_EXPIRES_IN = '30d'; // Refresh Token有效期30天

// 将密钥转换为Uint8Array
const getSecretKey = () => new TextEncoder().encode(JWT_SECRET);

// JWT Payload接口 - 扩展jose的JWTPayload
export interface JWTPayload extends JoseJWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
  sub?: string;
}

/**
 * 生成访问令牌（Access Token）
 */
export async function generateAccessToken(payload: Omit<JWTPayload, 'type'>): Promise<string> {
  const token = await new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .setSubject(payload.userId)
    .sign(getSecretKey());

  return token;
}

/**
 * 生成刷新令牌（Refresh Token）
 */
export async function generateRefreshToken(payload: Omit<JWTPayload, 'type'>): Promise<string> {
  const token = await new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
    .setSubject(payload.userId)
    .sign(getSecretKey());

  return token;
}

/**
 * 验证JWT令牌
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('JWT验证失败:', error);
    return null;
  }
}

/**
 * 从请求中提取JWT令牌
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  // 1. 从Authorization头中提取
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. 从Cookie中提取
  const cookieToken = request.cookies.get('access_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * 从请求中获取并验证用户信息
 */
export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

/**
 * 检查令牌是否即将过期（剩余时间少于1天）
 */
export function isTokenExpiringSoon(payload: JWTPayload): boolean {
  if (!payload.exp) return true;
  const expirationTime = payload.exp * 1000; // 转换为毫秒
  const now = Date.now();
  const oneDayInMs = 24 * 60 * 60 * 1000;
  return expirationTime - now < oneDayInMs;
}

/**
 * 生成令牌对（Access Token + Refresh Token）
 */
export async function generateTokenPair(payload: Omit<JWTPayload, 'type'>) {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken(payload),
  ]);

  return { accessToken, refreshToken };
}
