'use client';

import React from 'react';

/**
 * AnimatedGrid Component
 * 
 * Provides an animated grid background effect with:
 * - Subtle grid lines
 * - Smooth animation
 * - Theme-aware opacity
 * 
 * Requirements: 1.2
 */
export const AnimatedGrid: React.FC = () => {
  return (
    <>
      <div className="animated-grid-container">
        {/* Primary grid */}
        <div className="animated-grid primary" />
        
        {/* Secondary grid (offset for depth) */}
        <div className="animated-grid secondary" />
      </div>

      <style jsx>{`
        .animated-grid-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .animated-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-size: 50px 50px;
        }

        .animated-grid.primary {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
          animation: grid-move 20s linear infinite;
        }

        .animated-grid.secondary {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.015) 1px, transparent 1px);
          background-size: 100px 100px;
          animation: grid-move-slow 30s linear infinite reverse;
        }

        @keyframes grid-move {
          0% { 
            background-position: 0 0; 
          }
          100% { 
            background-position: 50px 50px; 
          }
        }

        @keyframes grid-move-slow {
          0% { 
            background-position: 0 0; 
          }
          100% { 
            background-position: 100px 100px; 
          }
        }

        /* Dark theme adjustments */
        :global(.dark) .animated-grid.primary {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
        }

        :global(.dark) .animated-grid.secondary {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.025) 1px, transparent 1px);
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .animated-grid {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedGrid;
