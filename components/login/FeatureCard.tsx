import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * FeatureCard Component
 * Displays a feature highlight with icon, title, and description
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="login-feature-card flex items-start gap-4 p-4 rounded-login-md bg-white/5 backdrop-blur-sm border border-white/10">
      {/* Icon Container */}
      <div className="flex-shrink-0 p-2 rounded-lg bg-login-primary-500/20">
        <Icon className="w-6 h-6 text-login-primary-400" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold mb-1 text-base">
          {title}
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
