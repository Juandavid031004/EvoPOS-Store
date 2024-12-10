import { supabase } from './supabaseClient';
import { handleError } from '../utils/errorHandler';
import type { User } from '../types';

export const authService = {
  async signIn(email: string, username: string, password: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('email', email)
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
};