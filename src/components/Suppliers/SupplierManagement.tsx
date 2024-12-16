import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Building2, Phone, Mail, Users, ArrowUpDown } from 'lucide-react';
import { Supplier, User } from '../../types';
import toast from 'react-hot-toast';

interface SupplierManagementProps {
  suppliers: Supplier[];
  currentUser: User;
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  onUpdateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  onDeleteSupplier: (id: string) => void;
}

export const SupplierManagement = ({
  suppliers = [],
  currentUser,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier
}: SupplierManagementProps) => {
  // Verificar permiso de ver proveedores
  if (!currentUser.permisos.includes('ver_proveedores')) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600">No tiene permisos para ver proveedores.</p>
      </div>
    );
  }

  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Supplier>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState({
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto: '',
    productos: [] as string[],
    activo: true
  });

  const handleSort = (field: keyof Supplier) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (formData.ruc && !/^\d{11}$/.test(formData.ruc)) {
      toast.error('El RUC debe tener 11 dígitos');
      return;
    }

    if (formData.telefono && !/^\d{9}$/.test(formData.telefono)) {
      toast.error('El teléfono debe tener 9 dígitos');
      return;
    }

    if (editingSupplier) {
      onUpdateSupplier(editingSupplier.id, formData);
      toast.success('Proveedor actualizado exitosamente');
    } else {
      onAddSupplier(formData);
      toast.success('Proveedor agregado exitosamente');
    }
    setShowForm(false);
    setEditingSupplier(null);
    setFormData({
      nombre: '',
      ruc: '',
      direccion: '',
      telefono: '',
      email: '',
      contacto: '',
      productos: [],
      activo: true
    });
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.ruc.includes(searchTerm) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    const compareValue = sortDirection === 'asc' ? 1 : -1;
    if (typeof a[sortField] === 'boolean') {
      return a[sortField] === b[sortField] ? 0 : a[sortField] ? -compareValue : compareValue;
    }
    return sortDirection === 'asc'
      ? String(a[sortField]).localeCompare(String(b[sortField]))
      : String(b[sortField]).localeCompare(String(a[sortField]));
  });

  // Calcular estadísticas
  const totalProveedores = filteredSuppliers.length;
  const proveedoresActivos = filteredSuppliers.filter(s => s.activo).length;
  const proveedoresInactivos = totalProveedores - proveedoresActivos;

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
          Gestión de Proveedores
        </h1>
        <div className="flex items-center space-x-4 ml-auto">
          {currentUser.permisos.includes('gestionar_proveedores') && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Nuevo Proveedor</span>
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
        {filteredSuppliers.length} proveedores encontrados
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Proveedores</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {totalProveedores}
              </p>
              <p className="text-xs text-gray-500 mt-1">proveedores registrados</p>
            </div>
            <Users className="h-10 w-10 text-indigo-600" />
          </div>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600"></div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Proveedores Activos</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {proveedoresActivos}
              </p>
              <p className="text-xs text-gray-500 mt-1">en operación</p>
            </div>
            <Building2 className="h-10 w-10 text-green-600" />
          </div>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"></div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Proveedores Inactivos</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                {proveedoresInactivos}
              </p>
              <p className="text-xs text-gray-500 mt-1">sin operación</p>
            </div>
            <Building2 className="h-10 w-10 text-red-600" />
          </div>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-red-400 via-rose-500 to-red-600"></div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-100/50 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
          <input
            type="text"
            id="searchSupplier"
            name="searchSupplier"
            placeholder="Buscar por nombre o RUC..."
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
                    id="sortByRuc"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('ruc')}
                    aria-label="Ordenar por RUC"
                  >
                    <span>RUC</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByContact"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('contacto')}
                    aria-label="Ordenar por contacto"
                  >
                    <span>Contacto</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByStatus"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('activo')}
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
              {sortedSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                  <td className="px-4 sm:px-6 py-2 sm:py-4">
                    <div className="text-sm font-medium text-gray-900">{supplier.nombre}</div>
                    <div className="text-xs text-gray-500">{supplier.email}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-2 sm:py-4">
                    <span className="text-sm text-gray-900 bg-indigo-100/50 px-2 py-1 rounded-md">
                      {supplier.ruc}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-2 sm:py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="h-4 w-4 mr-1 text-indigo-500" />
                        {supplier.telefono}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-1 text-indigo-500" />
                        {supplier.contacto}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-2 sm:py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      supplier.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {supplier.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-2 sm:py-4">
                    <div className="flex space-x-2">
                      {/* Botón editar solo si tiene permiso de gestionar */}
                      {currentUser.permisos.includes('gestionar_proveedores') && (
                        <button
                          id={`editSupplier-${supplier.id}`}
                          onClick={() => {
                            setEditingSupplier(supplier);
                            setFormData({
                              nombre: supplier.nombre,
                              ruc: supplier.ruc,
                              direccion: supplier.direccion,
                              telefono: supplier.telefono,
                              email: supplier.email,
                              contacto: supplier.contacto,
                              productos: supplier.productos,
                              activo: supplier.activo
                            });
                            setShowForm(true);
                          }}
                          className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors duration-200"
                          title="Editar proveedor"
                          aria-label={`Editar proveedor ${supplier.nombre}`}
                        >
                          <Edit2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                      {/* Botón eliminar solo si tiene permiso de eliminar */}
                      {currentUser.permisos.includes('eliminar_proveedores') && (
                        <button
                          id={`deleteSupplier-${supplier.id}`}
                          onClick={() => {
                            if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
                              onDeleteSupplier(supplier.id);
                              toast.success('Proveedor eliminado exitosamente');
                            }
                          }}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Eliminar proveedor"
                          aria-label={`Eliminar proveedor ${supplier.nombre}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form - Solo se muestra si tiene permiso de gestionar */}
      {showForm && currentUser.permisos.includes('gestionar_proveedores') && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h3>
            <form onSubmit={handleSubmit} id="supplierForm" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre o Razón Social</label>
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
                  <label htmlFor="ruc" className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
                  <input
                    id="ruc"
                    name="ruc"
                    type="text"
                    required
                    pattern="\d{11}"
                    title="El RUC debe tener 11 dígitos"
                    className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  required
                  className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    pattern="\d{9}"
                    title="El teléfono debe tener 9 dígitos"
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
              </div>

              <div>
                <label htmlFor="contacto" className="block text-sm font-medium text-gray-700 mb-1">Persona de Contacto</label>
                <input
                  id="contacto"
                  name="contacto"
                  type="text"
                  required
                  className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                  value={formData.contacto}
                  onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  className="h-4 w-4 text-indigo-600 rounded border-purple-300 focus:ring-purple-500"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                />
                <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
                  Proveedor activo
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  id="closeForm"
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSupplier(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  aria-label="Cerrar formulario"
                >
                  <Trash2 className="h-5 w-5 text-gray-500" />
                </button>
                <button
                  id="cancelForm"
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSupplier(null);
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
                  {editingSupplier ? 'Actualizar' : 'Crear'} Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}