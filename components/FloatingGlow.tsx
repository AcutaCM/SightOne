'use client';

import React from 'react';

interface FloatingGlowProps {
  /**
   * Position of the glow effect
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  
  /**
   * Size of the glow in pixels
   */
  size?: number;
  
  /**
   * Color of the glow (RGB values)
   */
  color?: { r: number; g: number; b: number };
  
  /**
   * Opacity of the glow (0-1)
   */
  opacity?: number;
  
  /**
   * Animation duration in seconds
   */
  duration?: number;
  
  /**
   * Blur amount in pixels
   */
  blur?: number;
}

/**
 * FloatingGlow Component
 * 
 * Creates a floating, animated glow effect
 * 
 * Requirements: 1.2
 */
export const FloatingGlow: React.FC<FloatingGlowProps> = ({
  position = 'top-left',
  size = 600,
  color = { r: 59, g: 130, b: 246 },
  opacity = 0.15,
  duration = 15,
  blur = 60,
}) => {
  const getPositionStyles = () => {
    const offset = -size / 2;
    
    switch (position) {
      case 'top-left':
        return { top: offset, left: offset };
      case 'top-right':
        return { top: offset, right: offset };
      case 'bottom-left':
        return { bottom: offset, left: offset };
      case 'bottom-right':
        return { bottom: offset, right: offset };
      case 'center':
        return { 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)' 
        };
      default:
        return { top: offset, left: offset };
    }
  };

  const positionStyles = getPositionStyles();
  const colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;

  return (
    <>
      <div 
        className="floating-glow"
        style={{
          ...positionStyles,
          width: `${size}px`,
          height: `${size}px`,
        }}
      />

      <style jsx>{`
        .floating-glow {
          position: fixed;
          border-radius: 50%;
          background: radial-gradient(circle, ${colorString} 0%, transparent 70%);
          filter: blur(${blur}px);
          animation: float-glow ${duration}s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes float-glow {
          0%, 100% { 
            transform: translate(0, 0);
          }
          33% { 
            transform: translate(100px, 50px);
          }
          66% { 
            transform: translate(-50px, 100px);
          }
        }

        /* Dark theme - increase opacity */
        :global(.dark) .floating-glow {
          opacity: 1.3;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .floating-glow {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
};

/**
 * FloatingGlowGroup Component
 * 
 * Provides a pre-configured group of floating glows
 * 
 * Requirements: 1.2
 */
export const FloatingGlowGroup: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Primary blue glow - top left */}
      <FloatingGlow
        position="top-left"
        size={600}
        color={{ r: 59, g: 130, b: 246 }}
        opacity={0.15}
        duration={15}
        blur={60}
      />
      
      {/* Purple glow - top right */}
      <FloatingGlow
        position="top-right"
        size={500}
        color={{ r: 139, g: 92, b: 246 }}
        opacity={0.12}
        duration={18}
        blur={50}
      />
      
      {/* Cyan glow - bottom center */}
      <FloatingGlow
        position="center"
        size={700}
        color={{ r: 6, g: 182, b: 212 }}
        opacity={0.1}
        duration={20}
        blur={70}
      />
    </div>
  );
};

export default FloatingGlow;
