import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { authorizedEmails } from '../config/whitelist';

interface User {
  email: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, username: string, password: string) => {
    try {
      setLoading(true);
      
      // Validar correo
      const emailLowerCase = email.toLowerCase().trim();
      if (!authorizedEmails.includes(emailLowerCase)) {
        throw new Error('Correo no autorizado');
      }

      // Validar credenciales
      if (username.toUpperCase() !== 'ADMIN' || password !== '123456') {
        throw new Error('Credenciales inválidas');
      }

      // Login exitoso
      setUser({
        email: emailLowerCase,
        username: username.toUpperCase(),
        role: 'admin'
      });

      toast.success('¡Bienvenido!', {
        icon: '👋',
        duration: 2000
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error de acceso', {
        icon: '🚫',
        duration: 3000
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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