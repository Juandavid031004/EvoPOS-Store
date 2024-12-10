import { supabase } from './supabase';
import type { Cliente } from '../types';
import type { Database } from '../types/supabase';

type CustomerRow = Database['public']['Tables']['customers']['Row'];

export const customerService = {
  async getAll(businessEmail: string) {
    const { data, error } = await supabase
      .from('customers')
      .select()
      .eq('business_email', businessEmail);

    if (error) throw error;
    return data as CustomerRow[];
  },

  async create(customer: Omit<Cliente, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();

    if (error) throw error;
    return data as CustomerRow;
  },

  async update(id: string, customer: Partial<Cliente>) {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CustomerRow;
  },

  async updatePoints(id: string, points: number) {
    const { data, error } = await supabase
      .from('customers')
      .update({ puntos: points })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CustomerRow;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};