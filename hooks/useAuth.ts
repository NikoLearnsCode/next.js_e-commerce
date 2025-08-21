'use client';

import {useSession} from 'next-auth/react';

export function useAuth() {
  const {data: session, status} = useSession();

  // Debug logging
  console.log('useAuth - Session status:', {
    status,
    session,
    user: session?.user,
    userId: session?.user?.id,
    userRole: session?.user?.role,
  });

  return {
    user: session?.user || null,
    loading: status === 'loading',
    isAuthenticated: !!session?.user,
    role: session?.user?.role || null,
    refreshUser: async () => {},
  };
}
