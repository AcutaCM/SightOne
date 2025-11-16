'use client';

import React from 'react';
import { AnimatedGrid } from './AnimatedGrid';
import { FloatingGlowGroup } from './FloatingGlow';

interface BackgroundSystemProps {
  /**
   * Enable/disable grid animation
   */
  showGrid?: boolean;
  
  /**
   * Enable/disable floating glows
   */
  showGlows?: boolean;
  
  /**
   * Custom className for additional styling
   */
  className?: string;
}

/**
 * BackgroundSystem Component
 * 
 * Comprehensive background system that combines:
 * - Dynamic gradient background (via CSS)
 * - Animated grid pattern
 * - Floating glow effects
 * 
 * Requirements: 1.1, 1.2, 1.3
 * 
 * @example
 * ```tsx
 * <BackgroundSystem showGrid showGlows />
 * ```
 */
export const BackgroundSystem: React.FC<BackgroundSystemProps> = ({
  showGrid = true,
  showGlows = true,
  className = '',
}) => {
  return (
    <div className={`background-system ${className}`}>
      {/* Animated Grid */}
      {showGrid && <AnimatedGrid />}
      
      {/* Floating Glows */}
      {showGlows && <FloatingGlowGroup />}

      <style jsx>{`
        .background-system {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default BackgroundSystem;
