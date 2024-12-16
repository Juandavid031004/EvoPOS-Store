import React, { useState } from 'react';
import { Edit2, Trash2, Package, ArrowUpDown } from 'lucide-react';
import { Order, Supplier, Sucursal } from '../../types';
import { format } from 'date-fns';

interface OrderListProps {
  orders: Order[];
  suppliers: Supplier[];
  sucursales: Sucursal[];
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
}

export const OrderList = ({ orders, suppliers, sucursales, onEdit, onDelete }: OrderListProps) => {
  const [sortField, setSortField] = useState<keyof Order>('fecha');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortField === 'fecha') {
      return sortDirection === 'asc'
        ? new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        : new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    }
    if (sortField === 'total') {
      return sortDirection === 'asc'
        ? a.total - b.total
        : b.total - a.total;
    }
    return sortDirection === 'asc'
      ? String(a[sortField]).localeCompare(String(b[sortField]))
      : String(b[sortField]).localeCompare(String(a[sortField]));
  });

  const getStatusStyle = (status: Order['estado']) => {
    const styles = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      recibido: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <table className="w-full min-w-[800px]">
      <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <tr>
          <th className="px-4 sm:px-6 py-3 text-left">
            <button
              className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
              onClick={() => handleSort('id')}
            >
              <span>ID</span>
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </th>
          <th className="px-4 sm:px-6 py-3 text-left">
            <button
              className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
              onClick={() => handleSort('proveedorId')}
            >
              <span>Proveedor</span>
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </th>
          <th className="px-4 sm:px-6 py-3 text-left">
            <button
              className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
              onClick={() => handleSort('sucursal')}
            >
              <span>Sucursal</span>
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </th>
          <th className="px-4 sm:px-6 py-3 text-left">
            <button
              className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
              onClick={() => handleSort('fecha')}
            >
              <span>Fecha</span>
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </th>
          <th className="px-4 sm:px-6 py-3 text-left">
            <button
              className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
              onClick={() => handleSort('total')}
            >
              <span>Total</span>
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </th>
          <th className="px-4 sm:px-6 py-3 text-left">
            <button
              className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
              onClick={() => handleSort('estado')}
            >
              <span>Estado</span>
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-purple-100">
        {sortedOrders.map((order) => {
          const supplier = suppliers.find(s => s.id === order.proveedorId);
          const sucursal = sucursales.find(s => s.id === order.sucursal);
          
          return (
            <tr key={order.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
              <td className="px-4 sm:px-6 py-2 sm:py-4">
                <div className="text-sm font-medium text-gray-900">
                  {order.id}
                </div>
              </td>
              <td className="px-4 sm:px-6 py-2 sm:py-4">
                <div className="text-sm font-medium text-gray-900">
                  {supplier?.nombre}
                </div>
                <div className="text-xs text-gray-500">
                  RUC: {supplier?.ruc}
                </div>
              </td>
              <td className="px-4 sm:px-6 py-2 sm:py-4">
                <div className="text-sm text-gray-900">
                  {sucursal?.nombre || 'N/A'}
                </div>
              </td>
              <td className="px-4 sm:px-6 py-2 sm:py-4">
                <div className="text-sm text-gray-900">
                  {format(new Date(order.fecha), 'dd/MM/yyyy')}
                </div>
                {order.fechaEntrega && (
                  <div className="text-xs text-gray-500">
                    Entrega: {format(new Date(order.fechaEntrega), 'dd/MM/yyyy')}
                  </div>
                )}
              </td>
              <td className="px-4 sm:px-6 py-2 sm:py-4">
                <div className="text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  S/ {order.total.toFixed(2)}
                </div>
              </td>
              <td className="px-4 sm:px-6 py-2 sm:py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(order.estado)}`}>
                  {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-2 sm:py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(order)}
                    className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors duration-200"
                    title="Editar pedido"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Está seguro de eliminar este pedido?')) {
                        onDelete(order.id);
                      }
                    }}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="Eliminar pedido"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}