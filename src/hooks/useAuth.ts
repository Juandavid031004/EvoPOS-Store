import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { AuthState } from '../types';
import { handleError } from '../utils/errorHandler';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('authState');
    return savedAuth ? JSON.parse(savedAuth) : {
      user: null,
      business: null,
      isAuthenticated: false
    };
  });

  const login = async (email: string, username: string, password: string) => {
    try {
      const user = await authService.signIn(email, username, password);
      
      const newAuthState = {
        user,
        business: {
          id: '1',
          email,
          nombre: 'Mi Empresa',
          createdAt: new Date()
        },
        isAuthenticated: true
      };
      
      setAuthState(newAuthState);
      localStorage.setItem('authState', JSON.stringify(newAuthState));
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setAuthState({
        user: null,
        business: null,
        isAuthenticated: false
      });
      localStorage.removeItem('authState');
    } catch (error) {
      handleError(error);
    }
  };

  return { authState, login, logout };
}