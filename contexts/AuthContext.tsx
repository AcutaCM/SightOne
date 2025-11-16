"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

interface LoginCredentials {
  email: string;
  password?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  name?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 检查Cookie中的认证状态（页面刷新后自动恢复登录）
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // 通过 /api/auth/me 检查Cookie中的登录状态
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // 确保发送cookie
      });

      if (response.ok) {
        const data = await response.json();
        
        // 如果有user对象且有email，说明用户已登录
        if (data.success && data.user && data.user.email) {
          setUser({
            id: data.user.id?.toString() || data.user.email,
            username: data.user.username || data.user.email,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role || 'normal',
          });
        } else if (data.email) {
          // 向后兼容旧格式
          setUser({
            id: data.email,
            username: data.email,
            email: data.email,
            role: data.role || 'normal',
          });
        }
      }
    } catch (error) {
      console.error('认证检查失败:', error);
      // 出错时不清除状态，保持未登录状态即可
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials & { password?: string }) => {
    try {
      const email = String(credentials.email || '')
        .replace(/^mailto:/i, '')
        .trim();
      if (!email) throw new Error('请输入邮箱');
      
      const password = credentials.password || '';
      if (!password) throw new Error('请输入密码');

      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // 确保接收cookie
      });
      
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.error || `登录失败(${resp.status})`);
      }

      if (!data.success) {
        throw new Error(data.error || '登录失败');
      }

      // 设置用户数据
      const userData = {
        id: data.user.id.toString(),
        username: data.user.username,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      };
      
      setUser(userData);
      
      // 同时保存到localStorage作为备份（可选）
      localStorage.setItem('lastLoggedInEmail', email);
      
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      const responseData = await resp.json();
      
      if (!resp.ok) {
        throw new Error(responseData.error || `注册失败(${resp.status})`);
      }

      if (!responseData.success) {
        throw new Error(responseData.error || '注册失败');
      }

      // 注册成功后自动设置用户数据（注册接口已经设置了JWT cookie）
      const userData = {
        id: responseData.user.id.toString(),
        username: responseData.user.username,
        email: responseData.user.email,
        name: responseData.user.name,
        role: responseData.user.role,
      };
      
      setUser(userData);
      localStorage.setItem('lastLoggedInEmail', responseData.user.email);
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // 基于 Cookie 的退出登录，无需 Bearer 头
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      }).catch(() => {});
      
      // 清除localStorage中的备份
      localStorage.removeItem('lastLoggedInEmail');
    } catch (error) {
      console.error('退出登录API调用失败:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 保护路由的HOC
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">验证身份中...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}