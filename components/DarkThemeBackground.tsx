'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import * as reactSpring from '@react-spring/three';
import * as drei from '@react-three/drei';
import * as fiber from '@react-three/fiber';

interface DarkThemeBackgroundProps {
  /** Optional className for additional styling */
  className?: string;
}

/**
 * DarkThemeBackground Component
 * 
 * Displays an animated shader gradient background only in dark theme mode.
 * Uses ShaderGradient for a modern, dynamic water plane effect with dark colors.
 * 
 * @example
 * ```tsx
 * <DarkThemeBackground />
 * ```
 */
export function DarkThemeBackground({
  className = '',
}: DarkThemeBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render during SSR or if theme is not dark
  if (!mounted || resolvedTheme !== 'dark') {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
      aria-hidden="true"
      suppressHydrationWarning
    >
      <ShaderGradientCanvas
        importedFiber={{ ...fiber, ...drei, ...reactSpring }}
        style={{
          width: '100%',
          height: '100%',
        }}
        pixelDensity={1}
        pointerEvents="none"
      >
        <ShaderGradient
          animate="on"
          type="waterPlane"
          wireframe={false}
          shader="defaults"
          uTime={0}
          uSpeed={0.2}
          uStrength={3.4}
          uDensity={1.2}
          uFrequency={0}
          uAmplitude={0}
          positionX={0}
          positionY={0.9}
          positionZ={-0.3}
          rotationX={45}
          rotationY={0}
          rotationZ={0}
          color1="#242880"
          color2="#6bf5ff"
          color3="#ffffff"
          reflection={0.1}
          cAzimuthAngle={170}
          cPolarAngle={70}
          cDistance={4.4}
          cameraZoom={1}
          lightType="3d"
          brightness={1.2}
          envPreset="city"
          grain="off"
          toggleAxis={false}
          zoomOut={false}
          hoverState=""
          enableTransition={false}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
