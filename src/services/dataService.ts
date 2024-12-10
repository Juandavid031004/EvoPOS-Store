import { supabase } from './supabaseClient';
import { handleError } from '../utils/errorHandler';
import type { Product, Sale, Cliente, Gasto, Order, Supplier, Sucursal } from '../types';

export const dataService = {
  // Products
  async getProducts(businessEmail: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_email', businessEmail);
    
    if (error) throw error;
    return data;
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Sales
  async getSales(businessEmail: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (*)
      `)
      .eq('business_email', businessEmail);
    
    if (error) throw error;
    return data;
  },

  async createSale(sale: Omit<Sale, 'id' | 'fecha'>) {
    const { data, error } = await supabase.rpc('create_sale', {
      sale_data: sale
    });
    
    if (error) throw error;
    return data;
  },

  // Customers
  async getCustomers(businessEmail: string): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_email', businessEmail);
    
    if (error) throw error;
    return data;
  },

  // Expenses
  async getExpenses(businessEmail: string): Promise<Gasto[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('business_email', businessEmail);
    
    if (error) throw error;
    return data;
  },

  // Orders
  async getOrders(businessEmail: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('business_email', businessEmail);
    
    if (error) throw error;
    return data;
  },

  // Suppliers
  async getSuppliers(businessEmail: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('business_email', businessEmail);
    
    if (error) throw error;
    return data;
  },

  // Branches
  async getBranches(businessEmail: string): Promise<Sucursal[]> {
    const { data, error } = await supabase
      .from('sucursales')
      .select('*')
      .eq('business_email', businessEmail);
    
    if (error) throw error;
    return data;
  },

  // Generic error handler
  handleError
};