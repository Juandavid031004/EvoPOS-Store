import { useState, useEffect } from 'react';
import { syncService } from '../services/syncService';
import { handleError } from '../utils/errorHandler';
import toast from 'react-hot-toast';
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
        const initialData = await syncService.syncInitialData(businessEmail);
        setData(prev => ({ ...prev, ...initialData, loading: false }));
      } catch (error) {
        handleError(error);
        setData(prev => ({ ...prev, loading: false, error: error as Error }));
      }
    };

    loadData();
  }, [businessEmail]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!businessEmail) return;

    const subscription = syncService.subscribeToChanges(businessEmail, (payload) => {
      const { table, type, record, old_record } = payload;
      
      try {
        setData(prev => {
          const newData = { ...prev };
          const key = `${table}s` as keyof typeof newData;

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

        toast.success(`${table} ${type.toLowerCase()}ed successfully`);
      } catch (error) {
        handleError(error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [businessEmail]);

  return data;
}