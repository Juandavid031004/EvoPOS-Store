import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Package, Clock, CheckCircle, DollarSign, ArrowUpDown } from 'lucide-react';
import { Order, Product, Supplier, Sucursal, User } from '../../types';
import { OrderForm } from './OrderForm';
import { OrderFilters } from './OrderFilters';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface OrderManagementProps {
  orders: Order[];
  products: Product[];
  suppliers: Supplier[];
  sucursales: Sucursal[];
  currentUser: User;
  onAddOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => void;
  onUpdateOrder: (id: string, orderData: Partial<Order>) => void;
  onDeleteOrder: (id: string) => void;
  onUpdateProduct: (productId: string, newStock: number) => void;
}

export const OrderManagement = ({
  orders = [],
  products = [],
  suppliers = [],
  sucursales = [],
  currentUser,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  onUpdateProduct
}: OrderManagementProps) => {
  // Verificar permiso de ver pedidos
  if (!currentUser.permisos.includes('ver_pedidos')) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600">No tiene permisos para ver pedidos.</p>
      </div>
    );
  }

  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['estado'] | ''>('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Order>('fecha');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSubmit = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    if (editingOrder) {
      // Si el estado cambia a recibido, actualizar el stock
      if (orderData.estado === 'recibido' && editingOrder.estado !== 'recibido') {
        orderData.productos.forEach(item => {
          const product = products.find(p => p.id === item.productoId);
          if (product) {
            const newStock = product.stock + item.cantidad;
            onUpdateProduct(product.id, newStock);
          }
        });
      }
      // Si el estado cambia de recibido a otro estado, restar el stock
      else if (editingOrder.estado === 'recibido' && orderData.estado !== 'recibido') {
        orderData.productos.forEach(item => {
          const product = products.find(p => p.id === item.productoId);
          if (product) {
            const newStock = product.stock - item.cantidad;
            if (newStock >= 0) {
              onUpdateProduct(product.id, newStock);
            } else {
              toast.error(`No hay suficiente stock para el producto ${product.nombre}`);
            }
          }
        });
      }

      onUpdateOrder(editingOrder.id, orderData);
      toast.success('Pedido actualizado exitosamente');
    } else {
      // Si es un nuevo pedido y está marcado como recibido, actualizar el stock
      if (orderData.estado === 'recibido') {
        orderData.productos.forEach(item => {
          const product = products.find(p => p.id === item.productoId);
          if (product) {
            const newStock = product.stock + item.cantidad;
            onUpdateProduct(product.id, newStock);
          }
        });
      }

      onAddOrder(orderData);
      toast.success('Pedido creado exitosamente');
    }
    setShowForm(false);
    setEditingOrder(undefined);
  };

  const handleDelete = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order && order.estado === 'recibido') {
      // Si el pedido estaba recibido, restar el stock al eliminarlo
      order.productos.forEach(item => {
        const product = products.find(p => p.id === item.productoId);
        if (product) {
          const newStock = product.stock - item.cantidad;
          if (newStock >= 0) {
            onUpdateProduct(product.id, newStock);
          } else {
            toast.error(`No hay suficiente stock para el producto ${product.nombre}`);
            return;
          }
        }
      });
    }
    onDeleteOrder(orderId);
    toast.success('Pedido eliminado exitosamente');
  };

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredOrders = orders.filter(order => {
    const supplier = suppliers.find(s => s.id === order.proveedorId);
    const matchesSearch = supplier?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.estado === statusFilter;
    const matchesDate = !dateFilter || format(new Date(order.fecha), 'yyyy-MM') === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    if (typeof a[sortField] === 'number') {
      return sortDirection === 'asc' 
        ? (a[sortField] as number) - (b[sortField] as number)
        : (b[sortField] as number) - (a[sortField] as number);
    }
    return sortDirection === 'asc'
      ? String(a[sortField]).localeCompare(String(b[sortField]))
      : String(b[sortField]).localeCompare(String(a[sortField]));
  });

  // Calcular estadísticas
  const totalPedidos = filteredOrders.length;
  const pedidosPendientes = filteredOrders.filter(order => order.estado === 'pendiente').length;
  const pedidosRecibidos = filteredOrders.filter(order => order.estado === 'recibido').length;
  const totalGastado = filteredOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="flex items-center mb-8">
        <h1 className="text-4xl font-bold text-black">
          Gestión de Pedidos
        </h1>
        <div className="flex items-center space-x-4 ml-auto">
          {currentUser.permisos.includes('gestionar_pedidos') && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl hover:from-gray-800 hover:to-black transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Nuevo Pedido</span>
            </button>
          )}
          <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl shadow-lg">
            <p className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }).split(',').map(part => part.trim()).map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(', ')}
            </p>
          </div>
        </div>
      </div>
      <p className="text-gray-600 text-lg mb-6">
        {filteredOrders.length} pedidos encontrados
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Pedidos</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {totalPedidos}
              </p>
              <p className="text-xs text-gray-500 mt-1">pedidos registrados</p>
            </div>
            <Package className="h-10 w-10 text-indigo-600" />
          </div>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600"></div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Pedidos Pendientes</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                {pedidosPendientes}
              </p>
              <p className="text-xs text-gray-500 mt-1">por recibir</p>
            </div>
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600"></div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Pedidos Recibidos</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {pedidosRecibidos}
              </p>
              <p className="text-xs text-gray-500 mt-1">completados</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"></div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Gastado</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                S/ {totalGastado.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">en pedidos</p>
            </div>
            <DollarSign className="h-10 w-10 text-red-600" />
          </div>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-red-400 via-rose-500 to-red-600"></div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-100/50 mb-6">
        <OrderFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
        />
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                  onClick={() => handleSort('id')}
                >
                  <span>ID</span>
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                  onClick={() => handleSort('proveedorId')}
                >
                  <span>Proveedor</span>
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                  onClick={() => handleSort('estado')}
                >
                  <span>Estado</span>
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                  onClick={() => handleSort('total')}
                >
                  <span>Total</span>
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                  <div className="text-xs text-gray-500">{new Date(order.fecha).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {suppliers.find(s => s.id === order.proveedorId)?.nombre}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.estado === 'recibido' ? 'bg-green-100 text-green-800' :
                    order.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    S/ {order.total.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {/* Botón actualizar estado solo si tiene permiso */}
                    {currentUser.permisos.includes('actualizar_pedidos') && order.estado === 'pendiente' && (
                      <button
                        onClick={() => {
                          if (window.confirm('¿Confirmar recepción del pedido?')) {
                            onUpdateOrder(order.id, { 
                              estado: 'recibido',
                              fechaEntrega: new Date()
                            });
                            toast.success('Pedido marcado como recibido');
                          }
                        }}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors duration-200"
                        title="Marcar como recibido"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    {/* Botón eliminar solo si tiene permiso */}
                    {currentUser.permisos.includes('eliminar_pedidos') && (
                      <button
                        onClick={() => {
                          if (window.confirm('¿Está seguro de eliminar este pedido?')) {
                            onDeleteOrder(order.id);
                            toast.success('Pedido eliminado exitosamente');
                          }
                        }}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        title="Eliminar pedido"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form - Solo se muestra si tiene permiso de gestionar */}
      {showForm && currentUser.permisos.includes('gestionar_pedidos') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              {editingOrder ? 'Editar Pedido' : 'Nuevo Pedido'}
            </h3>
            <OrderForm
              order={editingOrder}
              products={products}
              suppliers={suppliers}
              currentUserSucursal={currentUser.sucursal}
              onSubmit={handleSubmit}
              onClose={() => {
                setShowForm(false);
                setEditingOrder(undefined);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};