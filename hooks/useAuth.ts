'use client';

import {useSession} from 'next-auth/react';

export function useAuth() {
  const {data: session, status, update} = useSession();

  return {
    user: session?.user || null,
    loading: status === 'loading',
    isAuthenticated: !!session?.user,
    role: session?.user?.role || null,
    refreshUser: async () => {
      await update();
    },
  };
}
