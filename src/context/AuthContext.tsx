import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, User } from '../services/auth';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar usuario actual
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    // Suscribirse a cambios de autenticación
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      const user = await auth.login();
      setUser(user);
      toast.success('¡Bienvenido!', {
        icon: '👋',
        duration: 2000
      });
    } catch (error) {
      toast.error('Error de acceso', {
        icon: '🚫',
        duration: 3000
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
      toast.success('Sesión cerrada', {
        icon: '👋',
        duration: 2000
      });
    } catch (error) {
      toast.error('Error al cerrar sesión', {
        icon: '❌',
        duration: 3000
      });
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}