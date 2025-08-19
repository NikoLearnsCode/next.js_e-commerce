'use client';

import {createContext, useContext, useEffect, useState, useRef} from 'react';
import {createClient} from '@/utils/supabase/client';
import {Session, User} from '@supabase/supabase-js';


type AuthContextType = {
  user: User | null; 
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});



export default function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshInProgress = useRef(false);
  const supabase = createClient();


  // @ts-ignore - Suppressing Supabase auth security warning, as this is client-side UI only
  const refreshUser = async () => {
    if (refreshInProgress.current) return;
    try {
      refreshInProgress.current = true;
      const {
        data: {session},
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    } finally {
      refreshInProgress.current = false;
    }
  };

  useEffect(() => {
  
    // @ts-ignore - Suppressing Supabase auth security warning, as this is client-side UI only
    const getInitialSession = async () => {
      try {
        const {
          data: {session},
        } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // @ts-ignore - Suppressing Supabase auth security warning, as this is client-side UI only
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{user, loading, refreshUser}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
