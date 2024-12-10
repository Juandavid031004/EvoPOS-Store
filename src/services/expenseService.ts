import { supabase } from './supabase';
import type { Gasto } from '../types';
import type { Database } from '../types/supabase';

type ExpenseRow = Database['public']['Tables']['expenses']['Row'];

export const expenseService = {
  async getAll(businessEmail: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select()
      .eq('business_email', businessEmail);

    if (error) throw error;
    return data as ExpenseRow[];
  },

  async create(expense: Omit<Gasto, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) throw error;
    return data as ExpenseRow;
  },

  async update(id: string, expense: Partial<Gasto>) {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ExpenseRow;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};