import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Sucursal } from '../../types';
import toast from 'react-hot-toast';

interface BranchManagementProps {
  sucursales?: Sucursal[];
  onAddBranch?: (branch: Omit<Sucursal, 'id' | 'createdAt'>) => void;
  onUpdateBranch?: (id: string, branch: Partial<Sucursal>) => void;
  onDeleteBranch?: (id: string) => void;
}

export const BranchManagement = ({
  sucursales = [],
  onAddBranch = () => {},
  onUpdateBranch = () => {},
  onDeleteBranch = () => {}
}: BranchManagementProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Sucursal | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    encargado: '',
    email: '',
    activo: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      onUpdateBranch(editingBranch.id, formData);
      toast.success('Sucursal actualizada', {
        icon: '✏️',
        duration: 2000
      });
    } else {
      onAddBranch(formData);
      toast.success('Sucursal agregada', {
        icon: '✨',
        duration: 2000
      });
    }
    setShowForm(false);
    setEditingBranch(null);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      encargado: '',
      email: '',
      activo: true
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Gestión de Sucursales
          </h2>
          <p className="text-gray-600 text-lg mt-1">
            {sucursales.length} sucursales registradas
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Nueva Sucursal</span>
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Dirección</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Encargado</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100">
            {sucursales.map((sucursal) => (
              <tr key={sucursal.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{sucursal.nombre}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{sucursal.direccion}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{sucursal.encargado}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    <div>{sucursal.telefono}</div>
                    <div className="text-indigo-600">{sucursal.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    sucursal.activo 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {sucursal.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setEditingBranch(sucursal);
                        setFormData({
                          nombre: sucursal.nombre,
                          direccion: sucursal.direccion,
                          telefono: sucursal.telefono,
                          encargado: sucursal.encargado,
                          email: sucursal.email,
                          activo: sucursal.activo
                        });
                        setShowForm(true);
                      }}
                      className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-all duration-200"
                      title="Editar sucursal"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        onDeleteBranch(sucursal.id);
                        toast.success('Sucursal eliminada', {
                          icon: '🗑️',
                          duration: 2000
                        });
                      }}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                      title="Eliminar sucursal"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Encargado</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.encargado}
                    onChange={(e) => setFormData({ ...formData, encargado: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  required
                  className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  className="h-5 w-5 text-purple-600 rounded border-purple-300 focus:ring-purple-400"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                />
                <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
                  Sucursal activa
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBranch(null);
                  }}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                >
                  {editingBranch ? 'Actualizar' : 'Crear'} Sucursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};