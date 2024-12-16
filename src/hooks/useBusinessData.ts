import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { Product, Sale, Cliente, Order, Supplier, Gasto } from '../types';
import toast from 'react-hot-toast';

export function useBusinessData(businessEmail: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (!businessEmail) return;

    const initializeData = async () => {
      try {
        setLoading(true);
        const response = await api.post('/sync/init', { businessEmail });
        
        setProducts(response.products || []);
        setSales(response.sales || []);
        setCustomers(response.customers || []);
        setOrders(response.orders || []);
        setSuppliers(response.suppliers || []);
        setExpenses(response.expenses || []);
        
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar los datos');
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [businessEmail]);

  // Configurar Socket.IO para actualizaciones en tiempo real
  useEffect(() => {
    if (!businessEmail) return;

    const socket = socketService.connect();

    socket.emit('joinBusiness', businessEmail);

    socket.on('dataUpdated', (update) => {
      const { type, action, data } = update;

      try {
        switch (type) {
          case 'products':
            handleProductUpdate(action, data);
            break;
          case 'sales':
            handleSaleUpdate(action, data);
            break;
          case 'customers':
            handleCustomerUpdate(action, data);
            break;
          case 'orders':
            handleOrderUpdate(action, data);
            break;
          case 'expenses':
            handleExpenseUpdate(action, data);
            break;
        }
      } catch (err) {
        console.error('Error handling update:', err);
        toast.error('Error al actualizar los datos');
      }
    });

    return () => {
      socket.off('dataUpdated');
      socket.disconnect();
    };
  }, [businessEmail]);

  // Funciones para manejar actualizaciones
  const handleProductUpdate = async (action: string, data: any) => {
    try {
      switch (action) {
        case 'create':
          setProducts(prev => [...prev, data]);
          break;
        case 'update':
          setProducts(prev => prev.map(p => p.id === data.id ? { ...p, ...data } : p));
          break;
        case 'delete':
          setProducts(prev => prev.filter(p => p.id !== data.id));
          break;
      }

      await api.post('/sync/update', {
        type: 'products',
        action,
        data,
        businessEmail
      });
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Error al actualizar el producto');
    }
  };

  const handleSaleUpdate = async (action: string, data: any) => {
    try {
      switch (action) {
        case 'create':
          setSales(prev => [...prev, data]);
          break;
        case 'delete':
          setSales(prev => prev.filter(s => s.id !== data.id));
          break;
      }

      await api.post('/sync/update', {
        type: 'sales',
        action,
        data,
        businessEmail
      });
    } catch (err) {
      console.error('Error updating sale:', err);
      toast.error('Error al actualizar la venta');
    }
  };

  const handleCustomerUpdate = async (action: string, data: any) => {
    try {
      switch (action) {
        case 'create':
          setCustomers(prev => [...prev, data]);
          break;
        case 'update':
          setCustomers(prev => prev.map(c => c.id === data.id ? { ...c, ...data } : c));
          break;
        case 'delete':
          setCustomers(prev => prev.filter(c => c.id !== data.id));
          break;
      }

      await api.post('/sync/update', {
        type: 'customers',
        action,
        data,
        businessEmail
      });
    } catch (err) {
      console.error('Error updating customer:', err);
      toast.error('Error al actualizar el cliente');
    }
  };

  const handleOrderUpdate = async (action: string, data: any) => {
    try {
      switch (action) {
        case 'create':
          setOrders(prev => [...prev, data]);
          break;
        case 'update':
          setOrders(prev => prev.map(o => o.id === data.id ? { ...o, ...data } : o));
          break;
        case 'delete':
          setOrders(prev => prev.filter(o => o.id !== data.id));
          break;
      }

      await api.post('/sync/update', {
        type: 'orders',
        action,
        data,
        businessEmail
      });
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('Error al actualizar el pedido');
    }
  };

  const handleExpenseUpdate = async (action: string, data: any) => {
    try {
      switch (action) {
        case 'create':
          setExpenses(prev => [...prev, data]);
          break;
        case 'update':
          setExpenses(prev => prev.map(e => e.id === data.id ? { ...e, ...data } : e));
          break;
        case 'delete':
          setExpenses(prev => prev.filter(e => e.id !== data.id));
          break;
      }

      await api.post('/sync/update', {
        type: 'expenses',
        action,
        data,
        businessEmail
      });
    } catch (err) {
      console.error('Error updating expense:', err);
      toast.error('Error al actualizar el gasto');
    }
  };

  return {
    products,
    sales,
    customers,
    orders,
    suppliers,
    expenses,
    loading,
    error,
    handleProductUpdate,
    handleSaleUpdate,
    handleCustomerUpdate,
    handleOrderUpdate,
    handleExpenseUpdate
  };
}