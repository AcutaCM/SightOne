/**
 * Lazy-loaded AssistantSettingsSidebar
 * 
 * Performance optimization: Loads the sidebar component only when needed
 * Reduces initial bundle size and improves page load time
 * 
 * Requirements: 4.1
 */

'use client';

import React, { Suspense } from 'react';
import { Spinner } from '@heroui/spinner';

// Lazy load the AssistantSettingsSidebar component
const AssistantSettingsSidebar = React.lazy(() => 
  import('./AssistantSettingsSidebar').then(module => ({
    default: module.AssistantSettingsSidebar
  }))
);

// Loading fallback component
const LoadingFallback = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <Spinner size="lg" color="primary" />
      <p className="text-sm text-default-600">加载中...</p>
    </div>
  </div>
);

// Export the lazy-loaded component with Suspense wrapper
export const LazyAssistantSettingsSidebar: React.FC<React.ComponentProps<typeof AssistantSettingsSidebar>> = (props) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AssistantSettingsSidebar {...props} />
    </Suspense>
  );
};

export default LazyAssistantSettingsSidebar;
