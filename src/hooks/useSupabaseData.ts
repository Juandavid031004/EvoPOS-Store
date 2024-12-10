import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../services/initializeApp';
import type { Product, Sale, Cliente, Gasto, Order, Supplier, Sucursal } from '../types';

export function useSupabaseData(businessEmail: string | null) {
  const [data, setData] = useState<{
    products: Product[];
    sales: Sale[];
    customers: Cliente[];
    expenses: Gasto[];
    orders: Order[];
    suppliers: Supplier[];
    branches: Sucursal[];
    loading: boolean;
    error: Error | null;
  }>({
    products: [],
    sales: [],
    customers: [],
    expenses: [],
    orders: [],
    suppliers: [],
    branches: [],
    loading: true,
    error: null
  });

  // Load initial data
  useEffect(() => {
    if (!businessEmail) return;

    const loadData = async () => {
      try {
        const tables = ['products', 'sales', 'customers', 'expenses', 'orders', 'suppliers', 'branches'];
        const initialData: any = {};

        for (const table of tables) {
          const { data: tableData, error } = await supabase
            .from(table)
            .select('*')
            .eq('business_email', businessEmail);

          if (error) throw error;
          initialData[table] = tableData;
        }

        setData(prev => ({ ...prev, ...initialData, loading: false }));
      } catch (error) {
        console.error('Error loading data:', error);
        setData(prev => ({ ...prev, loading: false, error: error as Error }));
      }
    };

    loadData();
  }, [businessEmail]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!businessEmail) return;

    const tables = ['products', 'sales', 'customers', 'expenses', 'orders', 'suppliers', 'branches'];
    const subscriptions = tables.map(table => {
      return supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: `business_email=eq.${businessEmail}`
          },
          (payload) => {
            const { eventType: type, new: record, old: old_record } = payload;
            
            try {
              setData(prev => {
                const newData = { ...prev };
                const key = table as keyof typeof newData;

                if (type === 'INSERT') {
                  (newData[key] as any[]).push(record);
                } else if (type === 'UPDATE') {
                  (newData[key] as any[]) = (newData[key] as any[]).map(item =>
                    item.id === record.id ? record : item
                  );
                } else if (type === 'DELETE') {
                  (newData[key] as any[]) = (newData[key] as any[]).filter(item =>
                    item.id !== old_record.id
                  );
                }

                return newData;
              });

              toast.success(`${table} ${type.toLowerCase()}d successfully`);
            } catch (error) {
              console.error('Error handling real-time update:', error);
            }
          }
        )
        .subscribe();
    });

    return () => {
      subscriptions.forEach(subscription => {
        supabase.removeChannel(subscription);
      });
    };
  }, [businessEmail]);

  return data;
}