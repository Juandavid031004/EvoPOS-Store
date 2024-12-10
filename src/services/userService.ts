import { supabase } from './supabase';
import type { User } from '../types';
import type { Database } from '../types/supabase';

type UserRow = Database['public']['Tables']['users']['Row'];

export const userService = {
  async login(email: string, username: string, password: string) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error) throw error;
    return data as UserRow;
  },

  async create(user: Omit<User, 'id'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data as UserRow;
  },

  async update(id: string, user: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(user)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as UserRow;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;
  },

  async getByBusiness(businessEmail: string) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('business_email', businessEmail);

    if (error) throw error;
    return data as UserRow[];
  }
};