import React from "react";
import { getAdminAuth } from "@/lib/auth/withAdminAuth";
import AdminPageClient from "./AdminPageClient";

/**
 * Admin Page - Server Component with Authentication
 * 
 * This page implements server-side authentication checks before rendering.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export default async function AdminPage() {
  // Fetch current user on page load (server-side) - Requirement 4.1
  const authResult = await getAdminAuth();
  // Pass authentication result to client component
  // Requirements: 4.2, 4.3, 4.4, 4.5
  return <AdminPageClient authResult={authResult} />;
}
