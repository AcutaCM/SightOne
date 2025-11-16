/**
 * LoadingIndicator Component
 * 
 * Specialized loading indicator component with multiple variants
 * using the dark mode design system.
 * 
 * Features:
 * - 60% white opacity with pulsing animation (Requirements 8.4, 8.5)
 * - Multiple loading styles (spinner, dots, pulse, skeleton)
 * - Customizable size and message
 * - Overlay mode for full-screen loading
 * 
 * Requirements: 8.4, 8.5
 */

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from '../styles/LoadingIndicator.module.css';

export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton';

export interface LoadingIndicatorProps {
  /** Loading variant style */
  variant?: LoadingVariant;
  
  /** Size of the loading indicator */
  size?: 'sm' | 'md' | 'lg';
  
  /** Optional loading message */
  message?: string;
  
  /** Show as full-screen overlay */
  overlay?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * LoadingIndicator Component
 * 
 * Displays a loading indicator with 60% white opacity and pulsing animation.
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  variant = 'spinner',
  size = 'md',
  message,
  overlay = false,
  className = '',
}) => {
  const content = (
    <div className={`${styles.indicator} ${styles[size]} ${className}`}>
      {variant === 'spinner' && (
        <div className={styles.spinnerWrapper}>
          <Loader2 
            className={styles.spinner}
            size={size === 'sm' ? 20 : size === 'md' ? 32 : 48}
          />
        </div>
      )}
      
      {variant === 'dots' && (
        <div className={styles.dotsWrapper}>
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
        </div>
      )}
      
      {variant === 'pulse' && (
        <div className={styles.pulseWrapper}>
          <div className={styles.pulseRing} />
          <div className={styles.pulseCore} />
        </div>
      )}
      
      {variant === 'skeleton' && (
        <div className={styles.skeletonWrapper}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      )}
      
      {message && (
        <p className={styles.message}>{message}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className={styles.overlay}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingIndicator;

/**
 * LoadingSpinner - Convenience component for spinner variant
 */
export const LoadingSpinner: React.FC<Omit<LoadingIndicatorProps, 'variant'>> = (props) => (
  <LoadingIndicator {...props} variant="spinner" />
);

/**
 * LoadingDots - Convenience component for dots variant
 */
export const LoadingDots: React.FC<Omit<LoadingIndicatorProps, 'variant'>> = (props) => (
  <LoadingIndicator {...props} variant="dots" />
);

/**
 * LoadingPulse - Convenience component for pulse variant
 */
export const LoadingPulse: React.FC<Omit<LoadingIndicatorProps, 'variant'>> = (props) => (
  <LoadingIndicator {...props} variant="pulse" />
);

/**
 * LoadingSkeleton - Convenience component for skeleton variant
 */
export const LoadingSkeleton: React.FC<Omit<LoadingIndicatorProps, 'variant'>> = (props) => (
  <LoadingIndicator {...props} variant="skeleton" />
);
