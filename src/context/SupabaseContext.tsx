import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/initializeApp';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Loading } from '../components/Loading';
import type { AuthState } from '../types';

interface SupabaseContextType {
  authState: AuthState;
  data: ReturnType<typeof useSupabaseData>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    business: null,
    isAuthenticated: false
  });

  const data = useSupabaseData(authState.business?.email || null);

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setAuthState({
            user: session.user,
            business: {
              id: session.user.id,
              email: session.user.email!,
              nombre: 'Mi Empresa',
              createdAt: new Date(session.user.created_at)
            },
            isAuthenticated: true
          });
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            setAuthState({
              user: session.user,
              business: {
                id: session.user.id,
                email: session.user.email!,
                nombre: 'Mi Empresa',
                createdAt: new Date(session.user.created_at)
              },
              isAuthenticated: true
            });
          } else {
            setAuthState({
              user: null,
              business: null,
              isAuthenticated: false
            });
          }
        });

        setIsInitialized(true);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing Supabase:', error);
        setIsInitialized(true); // Still set to true to allow fallback UI to render
      }
    };

    initializeSupabase();
  }, []);

  if (!isInitialized) {
    return <Loading />;
  }

  return (
    <SupabaseContext.Provider value={{ authState, data }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}