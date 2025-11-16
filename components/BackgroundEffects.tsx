'use client';

import React from 'react';

/**
 * BackgroundEffects Component
 * 
 * Provides animated background effects including:
 * - Dynamic gradient background
 * - Animated grid pattern
 * - Floating glow effects
 * 
 * Requirements: 1.1, 1.2, 1.3
 */
export const BackgroundEffects: React.FC = () => {
  return (
    <>
      {/* Additional floating glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Glow 1 - Top Left */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            top: '-300px',
            left: '-300px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 15s ease-in-out infinite',
          }}
        />
        
        {/* Glow 2 - Top Right */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            top: '10%',
            right: '-200px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'float-reverse 18s ease-in-out infinite',
          }}
        />
        
        {/* Glow 3 - Bottom Center */}
        <div 
          className="absolute w-[700px] h-[700px] rounded-full opacity-25"
          style={{
            bottom: '-300px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
            filter: 'blur(70px)',
            animation: 'float-slow 20s ease-in-out infinite',
          }}
        />
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes float {
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

        @keyframes float-reverse {
          0%, 100% { 
            transform: translate(0, 0);
          }
          33% { 
            transform: translate(-80px, 60px);
          }
          66% { 
            transform: translate(40px, -80px);
          }
        }

        @keyframes float-slow {
          0%, 100% { 
            transform: translate(-50%, 0);
          }
          50% { 
            transform: translate(-50%, -50px);
          }
        }

        /* Dark theme adjustments */
        :global(.dark) div[style*="rgba(59, 130, 246"] {
          opacity: 0.4;
        }

        :global(.dark) div[style*="rgba(139, 92, 246"] {
          opacity: 0.3;
        }

        :global(.dark) div[style*="rgba(6, 182, 212"] {
          opacity: 0.35;
        }
      `}</style>
    </>
  );
};

export default BackgroundEffects;
