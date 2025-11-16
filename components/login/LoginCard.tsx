import React from 'react';
import Image from 'next/image';
import { Card, CardBody } from '@heroui/card';

export interface LoginCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * LoginCard Component
 * Container for the authentication form using HeroUI Card
 */
export const LoginCard: React.FC<LoginCardProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`w-full max-w-[440px] ${className}`}>
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-login-xl">
        <CardBody className="p-8 md:p-12">
          {/* Card Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-login-primary-500/10">
                <Image
                  src="/logo.svg"
                  alt="TTtalentDronePLF Logo"
                  width={40}
                  height={40}
                  className="text-login-primary-400"
                />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              欢迎回来
            </h2>
            <p className="text-white/70 text-sm md:text-base">
              登录您的无人机分析账户
            </p>
          </div>

          {/* Card Content */}
          {children}
        </CardBody>
      </Card>
    </div>
  );
};

export default LoginCard;
