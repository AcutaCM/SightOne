/**
 * Assistant Cache Warmer Component
 * 
 * Warms up the assistant cache on application start by pre-loading
 * commonly accessed data (published assistants and recommendations).
 * 
 * This component should be included in the root layout to ensure
 * cache warming happens early in the application lifecycle.
 * 
 * Requirements: 4.1, 4.2
 */

'use client';

import { useEffect, useRef } from 'react';

export function AssistantCacheWarmer() {
  const hasWarmedRef = useRef(false);

  useEffect(() => {
    // Only warm cache once per session
    if (hasWarmedRef.current) {
      return;
    }

    hasWarmedRef.current = true;

    const warmCache = async () => {
      try {
        console.log('[AssistantCacheWarmer] Initiating cache warm-up on application start');
        
        // Call the API route to warm the cache on the server side
        const response = await fetch('/api/cache/warm', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error(`Cache warming failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[AssistantCacheWarmer] Cache warm-up completed successfully', data.stats);
      } catch (error) {
        console.error('[AssistantCacheWarmer] Cache warm-up failed', error);
        // Don't throw - cache warming failure shouldn't break the app
      }
    };

    // Warm cache after a short delay to not block initial render
    const timeoutId = setTimeout(warmCache, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

export default AssistantCacheWarmer;
