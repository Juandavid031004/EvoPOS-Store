import { supabase } from './supabaseClient';
import { handleError } from '../utils/errorHandler';
import type { Product, Sale, Cliente, Gasto, Order, Supplier, Sucursal } from '../types';

export const syncService = {
  async syncInitialData(businessEmail: string) {
    try {
      const [
        { data: products },
        { data: sales },
        { data: customers },
        { data: expenses },
        { data: orders },
        { data: suppliers },
        { data: branches }
      ] = await Promise.all([
        supabase.from('products').select('*').eq('business_email', businessEmail),
        supabase.from('sales').select('*, sale_items(*)').eq('business_email', businessEmail),
        supabase.from('customers').select('*').eq('business_email', businessEmail),
        supabase.from('expenses').select('*').eq('business_email', businessEmail),
        supabase.from('orders').select('*, order_items(*)').eq('business_email', businessEmail),
        supabase.from('suppliers').select('*').eq('business_email', businessEmail),
        supabase.from('sucursales').select('*').eq('business_email', businessEmail)
      ]);

      if (!products || !sales || !customers || !expenses || !orders || !suppliers || !branches) {
        throw new Error('Error fetching data from Supabase');
      }

      return {
        products,
        sales,
        customers,
        expenses,
        orders,
        suppliers,
        branches
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async saveData(type: string, data: any, businessEmail: string) {
    try {
      const { error } = await supabase
        .from(type)
        .insert([{ ...data, business_email: businessEmail }]);

      if (error) throw error;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async updateData(type: string, id: string, data: any, businessEmail: string) {
    try {
      const { error } = await supabase
        .from(type)
        .update({ ...data, business_email: businessEmail })
        .eq('id', id)
        .eq('business_email', businessEmail);

      if (error) throw error;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async deleteData(type: string, id: string, businessEmail: string) {
    try {
      const { error } = await supabase
        .from(type)
        .delete()
        .eq('id', id)
        .eq('business_email', businessEmail);

      if (error) throw error;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  subscribeToChanges(businessEmail: string, callback: (payload: any) => void) {
    return supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          filter: `business_email=eq.${businessEmail}`
        },
        callback
      )
      .subscribe();
  }
};