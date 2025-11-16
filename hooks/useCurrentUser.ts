/**
 * useCurrentUser Hook
 * 
 * Provides access to the current authenticated user information.
 * Fetches user data from the /api/auth/current endpoint.
 */

import { useState, useEffect } from 'react';
import { User } from '@/lib/services/assistantPermissionService';

/**
 * Hook to get current user information
 * 
 * @returns Current user object or null if not authenticated
 */
export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch('/api/auth/current');
        const data = await response.json();
        
        // Check for authenticated field (API returns 'authenticated', not 'isAuthenticated')
        if (response.ok && data?.authenticated && data?.email) {
          setUser({
            email: String(data.email),
            role: data.role === 'admin' ? 'admin' : 'normal',
            isAuthenticated: true
          });
        } else {
          setUser({
            email: '',
            role: 'normal',
            isAuthenticated: false
          });
        }
      } catch (error) {
        console.error('[useCurrentUser] Failed to fetch current user:', error);
        setUser({
          email: '',
          role: 'normal',
          isAuthenticated: false
        });
      }
    }

    fetchCurrentUser();
  }, []);

  return user;
}
