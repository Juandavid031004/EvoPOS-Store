// Previous ReturnsList code with updated status change handling
import React, { useState } from 'react';
import { Return, Product, Sucursal } from '../../types';
import { Search, Filter, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ReturnsListProps {
  returns: Return[];
  products: Product[];
  sucursales: Sucursal[];
  onAddReturn: (ret: Omit<Return, 'id' | 'fecha'>) => void;
  onUpdateProduct: (productId: string, newStock: number) => void;
  onDeleteReturn: (returnId: string) => void;
  onUpdateReturn: (returnId: string, status: Return['estado']) => void;
}

export const ReturnsList = ({ 
  returns, 
  products, 
  sucursales,
  onAddReturn, 
  onUpdateProduct, 
  onDeleteReturn,
  onUpdateReturn 
}: ReturnsListProps) => {
  // ... rest of the component code remains the same until handleUpdateStatus

  const handleUpdateStatus = async (returnId: string, newStatus: Return['estado']) => {
    const returnItem = returns.find(r => r.id === returnId);
    if (!returnItem) return;

    const product = products.find(p => p.id === returnItem.productoId);
    if (!product) return;

    try {
      // If changing from pending to processed, add stock back
      if (returnItem.estado === 'pendiente' && newStatus === 'procesado') {
        const newStock = product.stock + returnItem.cantidad;
        await onUpdateProduct(product.id, newStock);
        toast.success(`Stock actualizado: +${returnItem.cantidad}`, {
          icon: '📦',
          duration: 2000
        });
      }
      // If changing from processed to rejected/pending, remove stock
      else if (returnItem.estado === 'procesado' && newStatus !== 'procesado') {
        const newStock = product.stock - returnItem.cantidad;
        if (newStock < 0) {
          toast.error('Stock insuficiente', {
            icon: '⚠️',
            duration: 3000
          });
          return;
        }
        await onUpdateProduct(product.id, newStock);
        toast.success(`Stock actualizado: -${returnItem.cantidad}`, {
          icon: '📦',
          duration: 2000
        });
      }

      onUpdateReturn(returnId, newStatus);
      toast.success('Estado actualizado', {
        icon: '✅',
        duration: 2000
      });
    } catch (error) {
      console.error('Error updating return status:', error);
      toast.error('Error al actualizar estado', {
        icon: '❌',
        duration: 3000
      });
    }
  };

  // ... rest of the component code remains the same
};