import { supabase } from './supabaseClient';
import { handleError } from '../utils/errorHandler';
import type { Sale } from '../types';

export const rpcService = {
  async createSale(saleData: Omit<Sale, 'id' | 'fecha'>) {
    try {
      const { data, error } = await supabase.rpc('create_sale', {
        sale_data: saleData
      });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async updateProductStock(productId: string, newStock: number) {
    try {
      const { data, error } = await supabase.rpc('update_product_stock', {
        product_id: productId,
        new_stock: newStock
      });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async processReturn(returnData: any) {
    try {
      const { data, error } = await supabase.rpc('process_return', {
        return_data: returnData
      });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  async calculateCustomerPoints(customerId: string, amount: number) {
    try {
      const { data, error } = await supabase.rpc('calculate_customer_points', {
        customer_id: customerId,
        amount
      });

      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
};