import { supabase } from './supabase';
import type { Product } from '../types';
import type { Database } from '../types/supabase';

type ProductRow = Database['public']['Tables']['products']['Row'];

export const productService = {
  async getAll(businessEmail: string) {
    const { data, error } = await supabase
      .from('products')
      .select()
      .eq('business_email', businessEmail);

    if (error) throw error;
    return data as ProductRow[];
  },

  async create(product: Omit<Product, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data as ProductRow;
  },

  async update(id: string, product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProductRow;
  },

  async updateStock(id: string, newStock: number) {
    const { data, error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProductRow;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};