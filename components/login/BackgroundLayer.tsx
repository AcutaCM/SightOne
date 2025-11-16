import React from 'react';

export interface BackgroundLayerProps {
  variant?: 'gradient' | 'image' | 'animated';
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

/**
 * BackgroundLayer Component
 * Provides an elegant, modern background for the login page
 */
export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  variant = 'gradient',
  intensity = 'medium',
  className = '',
}) => {
  // Determine overlay opacity based on intensity
  const overlayOpacity = {
    subtle: 'bg-black/20',
    medium: 'bg-black/30',
    strong: 'bg-black/40',
  }[intensity];

  // Gradient background styles
  const gradientStyles = {
    subtle: 'bg-login-gradient-subtle',
    medium: 'bg-login-gradient',
    strong: 'bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900',
  }[intensity];

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Gradient Background */}
      {variant === 'gradient' && (
        <div className={`absolute inset-0 ${gradientStyles}`} />
      )}

      {/* Image Background (placeholder for future implementation) */}
      {variant === 'image' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900" />
      )}

      {/* Animated Background (placeholder for future implementation) */}
      {variant === 'animated' && (
        <div className="absolute inset-0 bg-login-gradient" />
      )}

      {/* Semi-transparent overlay for content readability */}
      <div className={`absolute inset-0 ${overlayOpacity}`} />
    </div>
  );
};

export default BackgroundLayer;
