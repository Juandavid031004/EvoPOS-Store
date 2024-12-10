import { supabase } from './supabase';
import type { Sale, SaleItem } from '../types';
import type { Database } from '../types/supabase';

type SaleRow = Database['public']['Tables']['sales']['Row'];
type SaleItemRow = Database['public']['Tables']['sale_items']['Row'];

export const saleService = {
  async getAll(businessEmail: string) {
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select()
      .eq('business_email', businessEmail);

    if (salesError) throw salesError;

    const { data: items, error: itemsError } = await supabase
      .from('sale_items')
      .select()
      .in('sale_id', sales.map(s => s.id));

    if (itemsError) throw itemsError;

    return sales.map(sale => ({
      ...sale,
      productos: items.filter(item => item.sale_id === sale.id)
    })) as (SaleRow & { productos: SaleItemRow[] })[];
  },

  async create(sale: Omit<Sale, 'id' | 'fecha'>, items: Omit<SaleItem, 'id'>[]) {
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([sale])
      .select()
      .single();

    if (saleError) throw saleError;

    const saleItems = items.map(item => ({
      ...item,
      sale_id: saleData.id
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) throw itemsError;

    return {
      ...saleData,
      productos: items
    } as SaleRow & { productos: SaleItemRow[] };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};