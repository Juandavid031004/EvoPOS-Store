import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, DollarSign, Calendar, Filter, ArrowUpDown, FileText } from 'lucide-react';
import { Gasto, TipoGasto, User, Sucursal, BusinessConfig } from '../../types';
import { format, parse, isValid } from 'date-fns';
import { generateExpensesReport } from '../../utils/documentGenerator';
import toast from 'react-hot-toast';

interface ExpensesListProps {
  expenses: Gasto[];
  config: BusinessConfig;
  currentUser: User;
  sucursales: Sucursal[];
  onAddExpense: (expense: Omit<Gasto, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
  onEditExpense: (id: string, expense: Omit<Gasto, 'id' | 'createdAt'>) => void;
}

const tiposGasto = [
  { value: 'servicios', label: 'Servicios' },
  { value: 'salarios', label: 'Salarios' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'impuestos', label: 'Impuestos' },
  { value: 'alquiler', label: 'Alquiler' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'otros', label: 'Otros' }
];

export const ExpenseManagement = ({
  expenses = [],
  config,
  currentUser,
  sucursales = [],
  onAddExpense,
  onDeleteExpense,
  onEditExpense
}: ExpensesListProps) => {
  // Verificar permiso de ver gastos
  if (!currentUser.permisos.includes('ver_gastos')) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600">No tiene permisos para ver gastos.</p>
      </div>
    );
  }

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<TipoGasto | ''>('');
  const [sucursalFilter, setSucursalFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Gasto>('fecha');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [formData, setFormData] = useState<Omit<Gasto, 'id'>>({
    descripcion: '',
    monto: 0,
    fecha: new Date(),
    tipo: 'servicios',
    estado: 'pendiente',
    sucursal: currentUser.sucursal,
    responsable: currentUser.nombre,
    comprobante: '',
    observaciones: ''
  });

  const [editingExpense, setEditingExpense] = useState<Gasto | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      onEditExpense(editingExpense.id, formData);
      toast.success('Gasto actualizado exitosamente');
    } else {
      onAddExpense(formData);
      toast.success('Gasto registrado exitosamente');
    }
    setShowForm(false);
    setEditingExpense(null);
    setFormData({
      descripcion: '',
      monto: 0,
      fecha: new Date(),
      tipo: 'servicios',
      estado: 'pendiente',
      sucursal: currentUser.sucursal,
      responsable: currentUser.nombre,
      comprobante: '',
      observaciones: ''
    });
  };

  const handleSort = (field: keyof Gasto) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       expense.responsable.toLowerCase().includes(searchTerm.toLowerCase());
    
    const expenseDate = format(new Date(expense.fecha), 'yyyy-MM');
    const matchesDate = !dateFilter || expenseDate === dateFilter;
    const matchesType = !typeFilter || expense.tipo === typeFilter;
    const matchesSucursal = !sucursalFilter || expense.sucursal === sucursalFilter;
    
    return matchesSearch && matchesDate && matchesType && matchesSucursal;
  }).sort((a, b) => {
    if (typeof a[sortField] === 'boolean') {
      return sortDirection === 'asc' ? 
        (a[sortField] === b[sortField] ? 0 : a[sortField] ? -1 : 1) :
        (a[sortField] === b[sortField] ? 0 : a[sortField] ? 1 : -1);
    }
    return sortDirection === 'asc'
      ? String(a[sortField]).localeCompare(String(b[sortField]))
      : String(b[sortField]).localeCompare(String(a[sortField]));
  });

  const totalGastos = filteredExpenses.reduce((sum, expense) => sum + expense.monto, 0);

  const gastosPorTipo = tiposGasto.map(tipo => ({
    tipo: tipo.label,
    total: expenses
      .filter(e => e.tipo === tipo.value)
      .reduce((sum, e) => sum + e.monto, 0)
  })).sort((a, b) => b.total - a.total);

  const handleExportPDF = async () => {
    try {
      await generateExpensesReport({
        expenses: filteredExpenses,
        config
      });
      toast.success('Reporte de gastos generado exitosamente');
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      toast.error('Error al generar el reporte');
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
      <div className="flex items-center mb-8">
        <h1 className="text-4xl font-bold text-red-600">
          Gestión de Gastos
        </h1>
        <div className="flex items-center space-x-4 ml-auto">
          {currentUser.permisos.includes('gestionar_gastos') && (
            <>
              <button
                id="newExpenseBtn"
                name="newExpenseBtn"
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Nuevo Gasto</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
              >
                <FileText className="h-5 w-5" />
                <span>Exportar PDF</span>
              </button>
            </>
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
        {expenses.length} gastos registrados
      </p>

      {/* Grid de tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {gastosPorTipo.map(({ tipo, total }) => {
          const getGradient = (tipo: string) => {
            switch (tipo) {
              case 'Servicios':
                return 'from-blue-50 to-sky-50';
              case 'Salarios':
                return 'from-green-50 to-emerald-50';
              case 'Mantenimiento':
                return 'from-amber-50 to-yellow-50';
              case 'Marketing':
                return 'from-pink-50 to-rose-50';
              case 'Impuestos':
                return 'from-red-50 to-rose-50';
              case 'Alquiler':
                return 'from-indigo-50 to-blue-50';
              case 'Transporte':
                return 'from-cyan-50 to-sky-50';
              default:
                return 'from-gray-50 to-slate-50';
            }
          };

          const getTextColor = (tipo: string) => {
            switch (tipo) {
              case 'Servicios':
                return 'text-blue-600';
              case 'Salarios':
                return 'text-green-600';
              case 'Mantenimiento':
                return 'text-amber-600';
              case 'Marketing':
                return 'text-pink-600';
              case 'Impuestos':
                return 'text-red-600';
              case 'Alquiler':
                return 'text-indigo-600';
              case 'Transporte':
                return 'text-cyan-600';
              default:
                return 'text-gray-600';
            }
          };

          const getIconGradient = (tipo: string) => {
            return `bg-gradient-to-r ${
              tipo === 'Servicios' ? 'from-blue-400 via-sky-500 to-blue-600' :
              tipo === 'Salarios' ? 'from-green-400 via-emerald-500 to-green-600' :
              tipo === 'Mantenimiento' ? 'from-amber-400 via-yellow-500 to-amber-600' :
              tipo === 'Marketing' ? 'from-pink-400 via-rose-500 to-pink-600' :
              tipo === 'Impuestos' ? 'from-red-400 via-rose-500 to-red-600' :
              tipo === 'Alquiler' ? 'from-indigo-400 via-blue-500 to-indigo-600' :
              tipo === 'Transporte' ? 'from-cyan-400 via-sky-500 to-cyan-600' :
              'from-gray-400 via-slate-500 to-gray-600'
            }`;
          };

          return (
            <div key={tipo} className="group bg-white p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">{tipo}</h3>
              <p className={`text-2xl font-bold ${getTextColor(tipo)}`}>
                S/ {total.toFixed(2)}
              </p>
              <div className={`h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ${getIconGradient(tipo)}`}></div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-100/50 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <input
              type="text"
              id="searchExpense"
              name="searchExpense"
              placeholder="Buscar por descripción o responsable..."
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
              id="typeFilter"
              name="typeFilter"
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 appearance-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TipoGasto | '')}
            >
              <option value="">Todos los tipos</option>
              {tiposGasto.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <select
              id="sucursalFilter"
              name="sucursalFilter"
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 appearance-none"
              value={sucursalFilter}
              onChange={(e) => setSucursalFilter(e.target.value)}
            >
              <option value="">Todas las sucursales</option>
              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
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
                    onClick={() => handleSort('descripcion')}
                  >
                    <span>Descripción</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('tipo')}
                  >
                    <span>Tipo</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left">
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
                    onClick={() => handleSort('monto')}
                  >
                    <span>Monto</span>
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
              {filteredExpenses.map((expense) => {
                const sucursal = sucursales.find(s => s.id === expense.sucursal);
                return (
                  <tr key={expense.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                      {format(new Date(expense.fecha), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {expense.descripcion}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {expense.responsable}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {tiposGasto.find(t => t.value === expense.tipo)?.label}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-600">
                      {sucursal?.nombre}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      S/ {expense.monto.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        expense.estado === 'pagado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {expense.estado.charAt(0).toUpperCase() + expense.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <div className="flex space-x-2">
                        {/* Botón editar */}
                        {currentUser.permisos.includes('gestionar_gastos') && (
                          <button
                            onClick={() => {
                              setEditingExpense(expense);
                              setFormData({
                                descripcion: expense.descripcion,
                                monto: expense.monto,
                                fecha: new Date(expense.fecha),
                                tipo: expense.tipo,
                                estado: expense.estado,
                                sucursal: expense.sucursal,
                                responsable: expense.responsable,
                                comprobante: expense.comprobante || '',
                                observaciones: expense.observaciones || ''
                              });
                              setShowForm(true);
                            }}
                            className="p-1 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                            title="Editar gasto"
                          >
                            <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        )}
                        {/* Botón eliminar */}
                        {currentUser.permisos.includes('eliminar_gastos') && (
                          <button
                            onClick={() => {
                              if (window.confirm('¿Está seguro de eliminar este gasto?')) {
                                onDeleteExpense(expense.id);
                                toast.success('Gasto eliminado exitosamente');
                              }
                            }}
                            className="p-1 sm:p-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                            title="Eliminar gasto"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Formulario */}
      {showForm && currentUser.permisos.includes('gestionar_gastos') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full animate-fade-in">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
                </h2>
                <button
                  id="closeFormBtn"
                  name="closeFormBtn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingExpense(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <Trash2 className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <input
                      type="text"
                      id="descripcionGasto"
                      name="descripcionGasto"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto (S/)
                    </label>
                    <input
                      type="number"
                      id="montoGasto"
                      name="montoGasto"
                      required
                      min="0"
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Gasto
                    </label>
                    <select
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoGasto })}
                    >
                      {tiposGasto.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                      value={format(formData.fecha, 'yyyy-MM-dd')}
                      onChange={(e) => setFormData({ ...formData, fecha: new Date(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nº Comprobante
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    value={formData.comprobante}
                    onChange={(e) => setFormData({ ...formData, comprobante: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    rows={3}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="estado"
                    checked={formData.estado === 'pagado'}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      estado: e.target.checked ? 'pagado' : 'pendiente' 
                    })}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-400"
                  />
                  <label htmlFor="estado" className="ml-2 text-sm text-gray-700">
                    Marcar como pagado
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    id="cancelBtn"
                    name="cancelBtn"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="submitExpenseBtn"
                    name="submitExpenseBtn"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    {editingExpense ? 'Actualizar Gasto' : 'Registrar Gasto'}
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