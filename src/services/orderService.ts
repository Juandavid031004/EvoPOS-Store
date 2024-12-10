import { supabase } from './supabase';
import type { Order, OrderItem } from '../types';
import type { Database } from '../types/supabase';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

export const orderService = {
  async getAll(businessEmail: string) {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select()
      .eq('business_email', businessEmail);

    if (ordersError) throw ordersError;

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select()
      .in('order_id', orders.map(o => o.id));

    if (itemsError) throw itemsError;

    return orders.map(order => ({
      ...order,
      productos: items.filter(item => item.order_id === order.id)
    })) as (OrderRow & { productos: OrderItemRow[] })[];
  },

  async create(order: Omit<Order, 'id' | 'createdAt'>, items: Omit<OrderItem, 'id'>[]) {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      ...item,
      order_id: orderData.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return {
      ...orderData,
      productos: items
    } as OrderRow & { productos: OrderItemRow[] };
  },

  async update(id: string, order: Partial<Order>) {
    const { data, error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as OrderRow;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};