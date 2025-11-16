"use client";

/**
 * Simple wrapper to ensure proper export of PureChat component
 * This resolves Next.js build issues with large component files
 */

import dynamic from 'next/dynamic';

// Dynamically import PureChat with no SSR to avoid build issues
const PureChat = dynamic(() => import('./index').then(mod => mod.default || mod.PureChat), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100%',
      color: 'hsl(var(--heroui-foreground) / 0.5)'
    }}>
      Loading chat...
    </div>
  ),
});

export default PureChat;
