import React from 'react';
import { getAdminAuth } from '@/lib/auth/withAdminAuth';
import { redirect } from 'next/navigation';
import AdminReviewPageClient from './AdminReviewPageClient';

/**
 * Admin Review Page - Server Component with Authentication
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export default async function AdminReviewPage() {
  // Server-side authentication check (Requirement 3.1)
  const authResult = await getAdminAuth();

  // Redirect to login if not authenticated (Requirement 3.1)
  if (!authResult.isAuthenticated) {
    redirect('/login');
  }

  // Check if user is admin (Requirement 3.2)
  if (!authResult.isAdmin) {
    // Show access denied message for non-admin users (Requirement 3.2)
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-default-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-danger-50 dark:bg-danger-900/20 border-2 border-danger-200 dark:border-danger-800 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-danger-600 dark:text-danger-400 mb-2">
            访问被拒绝
          </h1>
          <p className="text-default-600 mb-6">
            您没有权限访问此页面。只有管理员可以访问助理审核管理。
          </p>
          <p className="text-sm text-default-500 mb-4">
            当前用户: {authResult.user?.email}
          </p>
          <p className="text-sm text-default-500">
            角色: {authResult.user?.role}
          </p>
        </div>
      </div>
    );
  }

  // Render the client component with authenticated user data (Requirement 3.3, 3.4, 3.5)
  return <AdminReviewPageClient authResult={authResult} />;
}
