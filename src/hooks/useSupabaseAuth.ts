import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { syncService } from '../services/syncService';
import { handleError } from '../utils/errorHandler';
import type { User } from '../types';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (session?.user?.email) {
          const userData = await syncService.syncInitialData(session.user.email);
          setUser(userData as any);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        const userData = await syncService.syncInitialData(session.user.email);
        setUser(userData as any);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}