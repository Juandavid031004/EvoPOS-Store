import { supabase } from './supabase';
import type { Sucursal } from '../types';
import type { Database } from '../types/supabase';

type SucursalRow = Database['public']['Tables']['sucursales']['Row'];

export const sucursalService = {
  async getAll(businessEmail: string) {
    const { data, error } = await supabase
      .from('sucursales')
      .select()
      .eq('business_email', businessEmail);

    if (error) throw error;
    return data as SucursalRow[];
  },

  async create(sucursal: Omit<Sucursal, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('sucursales')
      .insert([sucursal])
      .select()
      .single();

    if (error) throw error;
    return data as SucursalRow;
  },

  async update(id: string, sucursal: Partial<Sucursal>) {
    const { data, error } = await supabase
      .from('sucursales')
      .update(sucursal)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SucursalRow;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('sucursales')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};