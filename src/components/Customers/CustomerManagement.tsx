import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Gift, Users, CreditCard, Award, Wallet, ArrowUpDown, Minus, X } from 'lucide-react';
import { Cliente } from '../../types';
import toast from 'react-hot-toast';

interface CustomerManagementProps {
  customers: Cliente[];
  onAddCustomer: (customer: Omit<Cliente, 'id' | 'createdAt' | 'puntos' | 'totalGastado'>) => void;
  onUpdateCustomer: (id: string, customer: Partial<Cliente>) => void;
  onDeleteCustomer: (id: string) => void;
  onRedeemPoints: (customerId: string, points: number) => void;
}

export const CustomerManagement = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onRedeemPoints
}: CustomerManagementProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showRedeemForm, setShowRedeemForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Cliente | null>(null);
  const [showSubtractForm, setShowSubtractForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Cliente>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: ''
  });
  const [redeemData, setRedeemData] = useState({
    customerId: '',
    points: 0
  });
  const [subtractData, setSubtractData] = useState({
    customerId: '',
    amount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      onUpdateCustomer(editingCustomer.id, formData);
      toast.success('Cliente actualizado exitosamente');
    } else {
      onAddCustomer(formData);
      toast.success('Cliente agregado exitosamente');
    }
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({ nombre: '', telefono: '', email: '' });
  };

  const handleRedeemPoints = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === redeemData.customerId);
    if (!customer) {
      toast.error('Cliente no encontrado');
      return;
    }
    if (customer.puntos < redeemData.points) {
      toast.error('Puntos insuficientes');
      return;
    }
    onRedeemPoints(redeemData.customerId, redeemData.points);
    setShowRedeemForm(false);
    setRedeemData({ customerId: '', points: 0 });
    toast.success('Puntos canjeados exitosamente');
  };

  const handleSort = (field: keyof Cliente) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSubtractAmount = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === subtractData.customerId);
    if (!customer) {
      toast.error('Cliente no encontrado');
      return;
    }
    if (customer.puntos < subtractData.amount) {
      toast.error('Puntos insuficientes');
      return;
    }
    const newTotal = customer.totalGastado - subtractData.amount;
    const newPoints = customer.puntos - subtractData.amount;
    onUpdateCustomer(customer.id, {
      ...customer,
      totalGastado: newTotal >= 0 ? newTotal : 0,
      puntos: newPoints >= 0 ? newPoints : 0
    });
    setShowSubtractForm(false);
    setSubtractData({ customerId: '', amount: 0 });
    toast.success('Total gastado y puntos actualizados');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
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
  const totalClientes = filteredCustomers.length;
  const totalGastado = filteredCustomers.reduce((sum, customer) => sum + customer.totalGastado, 0);
  const totalPuntos = filteredCustomers.reduce((sum, customer) => sum + customer.puntos, 0);
  const promedioGasto = totalClientes > 0 ? totalGastado / totalClientes : 0;

  const handleAddCustomer = async (customer: Omit<Cliente, 'id' | 'createdAt'>) => {
    try {
      await addCustomer(customer);
      toast.success('Cliente registrado', {
        icon: '👤',
        duration: 2000
      });
    } catch (error) {
      toast.error('Error al registrar cliente', {
        icon: '❌',
        duration: 3000
      });
    }
  };

  const handleUpdateCustomer = async (id: string, data: Partial<Cliente>) => {
    try {
      await updateCustomer(id, data);
      toast.success('Cliente actualizado', {
        icon: '✏️',
        duration: 2000
      });
    } catch (error) {
      toast.error('Error al actualizar cliente', {
        icon: '❌',
        duration: 3000
      });
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('¿Eliminar este cliente?')) {
      try {
        await deleteCustomer(id);
        toast.success('Cliente eliminado', {
          icon: '🗑️',
          duration: 2000
        });
      } catch (error) {
        toast.error('Error al eliminar cliente', {
          icon: '❌',
          duration: 3000
        });
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Gestión de Clientes
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRedeemForm(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
            >
              <Gift className="h-5 w-5" />
              <span>Canjear Puntos</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Nuevo Cliente</span>
            </button>
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
        <p className="text-gray-600 text-lg">
          Administra tus clientes y sus puntos
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Clientes</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {totalClientes}
                </p>
                <p className="text-xs text-gray-500 mt-1">clientes registrados</p>
              </div>
              <Users className="h-10 w-10 text-indigo-600" />
            </div>
            <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600"></div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Gastado</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  S/ {totalGastado.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">en compras</p>
              </div>
              <CreditCard className="h-10 w-10 text-green-600" />
            </div>
            <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"></div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Puntos</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  {totalPuntos}
                </p>
                <p className="text-xs text-gray-500 mt-1">puntos acumulados</p>
              </div>
              <Award className="h-10 w-10 text-amber-600" />
            </div>
            <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600"></div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Promedio Gasto</h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  S/ {promedioGasto.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">por cliente</p>
              </div>
              <Wallet className="h-10 w-10 text-blue-600" />
            </div>
            <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600"></div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-100/50 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
          <input
            type="text"
            id="searchCustomer"
            name="searchCustomer"
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByName"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('nombre')}
                    aria-label="Ordenar por nombre"
                  >
                    <span>Nombre</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByContact"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('email')}
                    aria-label="Ordenar por contacto"
                  >
                    <span>Contacto</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByTotal"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('totalGastado')}
                    aria-label="Ordenar por total gastado"
                  >
                    <span>Total Gastado</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByPoints"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('puntos')}
                    aria-label="Ordenar por puntos"
                  >
                    <span>Puntos</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                  <td className="px-4 sm:px-6 py-2 sm:py-4 text-sm font-medium text-gray-900">
                    {customer.nombre}
                  </td>
                  <td className="px-4 sm:px-6 py-2 sm:py-4">
                    <div className="text-sm text-gray-500">
                      <div>{customer.telefono}</div>
                      <div>{customer.email}</div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        S/ {customer.totalGastado.toFixed(2)}
                      </span>
                      <button
                        id={`subtractTotal-${customer.id}`}
                        onClick={() => {
                          setSubtractData({ customerId: customer.id, amount: 0 });
                          setShowSubtractForm(true);
                        }}
                        className="p-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                        title="Restar total gastado"
                        aria-label={`Restar total gastado de ${customer.nombre}`}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-2 sm:py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                      {customer.puntos} puntos
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-2 sm:py-4">
                    <div className="flex space-x-2">
                      <button
                        id={`editCustomer-${customer.id}`}
                        onClick={() => {
                          setEditingCustomer(customer);
                          setFormData({
                            nombre: customer.nombre,
                            telefono: customer.telefono,
                            email: customer.email
                          });
                          setShowForm(true);
                        }}
                        className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                        title="Editar cliente"
                        aria-label={`Editar cliente ${customer.nombre}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        id={`deleteCustomer-${customer.id}`}
                        onClick={() => {
                          if (window.confirm('¿Está seguro de eliminar este cliente?')) {
                            onDeleteCustomer(customer.id);
                            toast.success('Cliente eliminado exitosamente');
                          }
                        }}
                        className="p-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                        title="Eliminar cliente"
                        aria-label={`Eliminar cliente ${customer.nombre}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full animate-fade-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
                <button
                  id="closeForm"
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCustomer(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  aria-label="Cerrar formulario"
                >
                  <Trash2 className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    id="cancelForm"
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCustomer(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    id="submitForm"
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    {editingCustomer ? 'Actualizar' : 'Crear'} Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Points Modal */}
      {showRedeemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full animate-fade-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Canjear Puntos
                </h2>
                <button
                  id="closeRedeemForm"
                  type="button"
                  onClick={() => setShowRedeemForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  aria-label="Cerrar formulario de canje"
                >
                  <Trash2 className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleRedeemPoints} className="space-y-4">
                <div>
                  <label htmlFor="customer_select" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select
                    id="customer_select"
                    name="customer_select"
                    required
                    className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={redeemData.customerId}
                    onChange={(e) => setRedeemData({ ...redeemData, customerId: e.target.value })}
                  >
                    <option value="">Seleccione un cliente</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.nombre} ({customer.puntos} puntos)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="points_redeem" className="block text-sm font-medium text-gray-700 mb-1">Puntos a Canjear</label>
                  <input
                    id="points_redeem"
                    name="points_redeem"
                    type="number"
                    required
                    min="1"
                    className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={redeemData.points}
                    onChange={(e) => setRedeemData({ ...redeemData, points: Number(e.target.value) })}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    id="cancelRedeemForm"
                    type="button"
                    onClick={() => setShowRedeemForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    id="submitRedeemForm"
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Canjear Puntos
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Subtract Amount Modal */}
      {showSubtractForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-fade-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  Restar Total Gastado
                </h2>
                <button
                  type="button"
                  onClick={() => setShowSubtractForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  aria-label="Cerrar formulario"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubtractAmount} className="space-y-4">
                <div>
                  <label htmlFor="customer_select" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select
                    id="customer_select"
                    name="customer_select"
                    required
                    className="w-full p-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200"
                    value={subtractData.customerId}
                    onChange={(e) => setSubtractData({ ...subtractData, customerId: e.target.value })}
                  >
                    <option value="">Seleccione un cliente</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.nombre} (Puntos: {customer.puntos})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="amount_subtract" className="block text-sm font-medium text-gray-700 mb-1">Cantidad a Restar</label>
                  <input
                    id="amount_subtract"
                    name="amount_subtract"
                    type="number"
                    required
                    min="1"
                    className="w-full p-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200"
                    value={subtractData.amount}
                    onChange={(e) => setSubtractData({ ...subtractData, amount: Number(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se restarán la misma cantidad de puntos
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowSubtractForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Restar Total
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};