import React, { useState } from 'react';
import { Search, DollarSign, Trash2, Filter, Calendar, ArrowUpDown } from 'lucide-react';
import { Deuda, Cliente, Product } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface DebtManagementProps {
  debts: Deuda[];
  customers: Cliente[];
  products: Product[];
  onPayDebt: (debtId: string, amount: number) => void;
  onDeleteDebt: (debtId: string) => void;
}

export const DebtManagement = ({
  debts = [],
  customers = [],
  products = [],
  onPayDebt,
  onDeleteDebt
}: DebtManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Deuda | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Deuda>('fecha');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Deuda) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt || !paymentAmount) return;

    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }

    onPayDebt(selectedDebt.id, amount);
    setShowPaymentForm(false);
    setSelectedDebt(null);
    setPaymentAmount('');
    toast.success('Pago registrado exitosamente');
  };

  const handleDeleteDebt = (debtId: string) => {
    if (window.confirm('¿Está seguro de eliminar esta deuda? Esta acción no se puede deshacer.')) {
      onDeleteDebt(debtId);
      toast.success('Deuda eliminada exitosamente');
    }
  };

  // Filtrar deudas
  const filteredDebts = debts.filter(debt => {
    const customer = customers.find(c => c.id === debt.clienteId);
    const matchesSearch = customer?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || format(new Date(debt.fecha), 'yyyy-MM').startsWith(dateFilter);
    const matchesStatus = !statusFilter || debt.estado === statusFilter;
    return matchesSearch && matchesDate && matchesStatus;
  });

  // Ordenar deudas
  const sortedDebts = [...filteredDebts].sort((a, b) => {
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

  // Calcular estadísticas
  const totalDeudas = filteredDebts.reduce((sum, debt) => sum + debt.total, 0);
  const totalPagado = filteredDebts.reduce((sum, debt) => 
    sum + debt.pagos.reduce((pSum, pago) => pSum + pago.monto, 0), 0);
  const totalPendiente = totalDeudas - totalPagado;
  const deudasPagadas = filteredDebts.filter(d => d.estado === 'pagado').length;
  const deudasPendientes = filteredDebts.filter(d => d.estado === 'pendiente').length;

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
            Gestión de Deudas
          </h1>
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
        <p className="text-gray-600 text-lg">
          Administra tus deudas y sus pagos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Deudas</h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            S/ {totalDeudas.toFixed(2)}
          </p>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600"></div>
        </div>
        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Pagado</h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            S/ {totalPagado.toFixed(2)}
          </p>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"></div>
        </div>
        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Pendiente</h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            S/ {totalPendiente.toFixed(2)}
          </p>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-red-400 via-rose-500 to-red-600"></div>
        </div>
        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Deudas Pagadas</h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {deudasPagadas}
          </p>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"></div>
        </div>
        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Deudas Pendientes</h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
            {deudasPendientes}
          </p>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600"></div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-100/50 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <input
              type="text"
              id="searchCustomer"
              name="searchCustomer"
              placeholder="Buscar por cliente..."
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <input
              type="month"
              id="dateFilter"
              name="dateFilter" 
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <select
              id="statusFilter"
              name="statusFilter"
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="pagado">Pagados</option>
            </select>
          </div>
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
                    id="sortByClient"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('clienteId')}
                    aria-label="Ordenar por cliente"
                  >
                    <span>Cliente</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByTotal"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('total')}
                    aria-label="Ordenar por total"
                  >
                    <span>Total</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Pagado
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Pendiente
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByDate"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('fecha')}
                    aria-label="Ordenar por fecha"
                  >
                    <span>Fecha</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByStatus"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('estado')}
                    aria-label="Ordenar por estado"
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
              {sortedDebts.map((debt) => {
                const customer = customers.find(c => c.id === debt.clienteId);
                const totalPagado = debt.pagos.reduce((sum, pago) => sum + pago.monto, 0);
                const pendiente = debt.total - totalPagado;

                return (
                  <tr key={debt.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                    <td className="px-4 sm:px-6 py-2 sm:py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {customer?.nombre}
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer?.telefono}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4">
                      <div className="text-sm text-gray-500">
                        {debt.productos.map(item => {
                          const product = products.find(p => p.id === item.productoId);
                          return (
                            <div key={item.productoId} className="text-xs">
                              {product?.nombre} x {item.cantidad}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      S/ {debt.total.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      S/ {totalPagado.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm font-medium bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                      S/ {pendiente.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                      {format(new Date(debt.fecha), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        debt.estado === 'pagado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {debt.estado.charAt(0).toUpperCase() + debt.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4">
                      <div className="flex space-x-2">
                        {debt.estado === 'pendiente' && (
                          <button
                            id={`payDebt-${debt.id}`}
                            onClick={() => {
                              setSelectedDebt(debt);
                              setShowPaymentForm(true);
                            }}
                            className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                            title="Registrar pago"
                            aria-label={`Registrar pago para deuda de ${customers.find(c => c.id === debt.clienteId)?.nombre}`}
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          id={`deleteDebt-${debt.id}`}
                          onClick={() => handleDeleteDebt(debt.id)}
                          className="p-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                          title="Eliminar deuda"
                          aria-label={`Eliminar deuda de ${customers.find(c => c.id === debt.clienteId)?.nombre}`}
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
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentForm && selectedDebt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full animate-fade-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Registrar Pago
                </h2>
                <button
                  onClick={() => {
                    setShowPaymentForm(false);
                    setSelectedDebt(null);
                    setPaymentAmount('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <Trash2 className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-6 bg-indigo-50/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Información de la Deuda</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Cliente:</p>
                    <p className="font-medium">{customers.find(c => c.id === selectedDebt.clienteId)?.nombre}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Deuda:</p>
                    <p className="font-medium">S/ {selectedDebt.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Pagado:</p>
                    <p className="font-medium text-green-600">
                      S/ {selectedDebt.pagos.reduce((sum, pago) => sum + pago.monto, 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pendiente:</p>
                    <p className="font-medium text-red-600">
                      S/ {(selectedDebt.total - selectedDebt.pagos.reduce((sum, pago) => sum + pago.monto, 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Monto a Pagar
                  </label>
                  <input
                    type="number"
                    id="paymentAmount"
                    name="paymentAmount"
                    required
                    min="0.01"
                    step="0.01"
                    className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    id="cancelPayment"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setSelectedDebt(null);
                      setPaymentAmount('');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="submitPayment"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Registrar Pago
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}