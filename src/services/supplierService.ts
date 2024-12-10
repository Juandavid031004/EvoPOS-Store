import { supabase } from './supabase';
import type { Supplier } from '../types';
import type { Database } from '../types/supabase';

type SupplierRow = Database['public']['Tables']['suppliers']['Row'];

export const supplierService = {
  async getAll(businessEmail: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select()
      .eq('business_email', businessEmail);

    if (error) throw error;
    return data as SupplierRow[];
  },

  async create(supplier: Omit<Supplier, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .select()
      .single();

    if (error) throw error;
    return data as SupplierRow;
  },

  async update(id: string, supplier: Partial<Supplier>) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SupplierRow;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};