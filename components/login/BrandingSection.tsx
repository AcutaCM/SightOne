import React from 'react';
import Image from 'next/image';
import { Plane, Target, Shield, Sparkles } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export interface BrandingSectionProps {
  className?: string;
}

/**
 * BrandingSection Component
 * Displays platform branding, value proposition, and feature highlights
 */
export const BrandingSection: React.FC<BrandingSectionProps> = ({
  className = '',
}) => {
  const features = [
    {
      icon: Plane,
      title: '智能无人机控制',
      description: '先进的飞行控制和自动导航系统',
    },
    {
      icon: Sparkles,
      title: 'AI视觉分析',
      description: '基于深度学习的实时图像识别与分析',
    },
    {
      icon: Target,
      title: '精准检测',
      description: '高精度的目标识别和位置定位',
    },
    {
      icon: Shield,
      title: '安全可靠',
      description: '企业级安全保障和数据保护',
    },
  ];

  return (
    <div className={`flex-1 flex flex-col justify-center px-8 lg:px-16 ${className}`}>
      <div className="max-w-2xl">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative">
            <Image
              src="/logo.svg"
              alt="TTtalentDronePLF Logo"
              width={48}
              height={48}
              className="text-blue-500"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-login-primary-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-1">
              TTtalentDronePLF
            </h1>
            <p className="text-xl text-login-primary-300 font-medium">
              智能无人机分析平台
            </p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mb-12">
          <p className="text-lg text-white/80 leading-relaxed mb-8">
            集成 AI视觉识别、自动飞行控制 和 实时数据分析，为农业、安防、测绘等领域提供专业级无人机解决方案。
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingSection;
