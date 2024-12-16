import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { User, UserRole, Permission, Sucursal, DEFAULT_PERMISSIONS } from '../../types';
import toast from 'react-hot-toast';

interface UserManagementProps {
  currentUser: User;
  users: User[];
  sucursales: Sucursal[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

const permisosList: { value: Permission; label: string; category: string }[] = [
  // Ventas
  { value: 'crear_venta', label: 'Crear Ventas', category: 'Ventas' },
  { value: 'ver_ventas', label: 'Ver Registro de Ventas', category: 'Ventas' },
  { value: 'aplicar_descuentos', label: 'Aplicar Descuentos', category: 'Ventas' },
  
  // Productos y Almacén
  { value: 'gestionar_productos', label: 'Gestionar Productos', category: 'Productos' },
  { value: 'ver_productos', label: 'Ver Productos', category: 'Productos' },
  { value: 'restaurar_stock', label: 'Restaurar Stock', category: 'Productos' },

  // Clientes
  { value: 'gestionar_clientes', label: 'Gestionar Clientes', category: 'Clientes' },
  { value: 'ver_clientes', label: 'Ver Clientes', category: 'Clientes' },
  { value: 'gestionar_puntos', label: 'Gestionar Puntos', category: 'Clientes' },

  // Dashboard
  { value: 'ver_dashboard', label: 'Ver Dashboard', category: 'Reportes' },

  // Administración
  { value: 'gestionar_usuarios', label: 'Gestionar Usuarios', category: 'Administración' },
  { value: 'gestionar_sucursales', label: 'Gestionar Sucursales', category: 'Administración' },
  { value: 'gestionar_gastos', label: 'Gestionar Gastos', category: 'Administración' },
  { value: 'ver_gastos', label: 'Ver Gastos', category: 'Administración' },

  // Proveedores
  { value: 'gestionar_proveedores', label: 'Gestionar Proveedores', category: 'Proveedores' },
  { value: 'ver_proveedores', label: 'Ver Proveedores', category: 'Proveedores' },

  // Pedidos
  { value: 'gestionar_pedidos', label: 'Gestionar Pedidos', category: 'Pedidos' },
  { value: 'ver_pedidos', label: 'Ver Pedidos', category: 'Pedidos' }
];

export const UserManagement: React.FC<UserManagementProps> = ({
  currentUser,
  users,
  sucursales,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    username: '',
    password: '',
    rol: 'vendedor' as UserRole,
    sucursal: '',
    permisos: DEFAULT_PERMISSIONS.vendedor,
    activo: true
  });

  // Group permissions by category
  const permisosGrouped = permisosList.reduce((groups, permiso) => {
    if (!groups[permiso.category]) {
      groups[permiso.category] = [];
    }
    groups[permiso.category].push(permiso);
    return groups;
  }, {} as Record<string, typeof permisosList>);

  const validatePassword = (password: string): boolean => {
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (!/\d/.test(password)) {
      toast.error('La contraseña debe contener al menos un número');
      return false;
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      toast.error('La contraseña debe contener al menos una letra');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || (!editingUser && !formData.password)) {
      toast.error('Usuario y contraseña son requeridos');
      return;
    }

    if (formData.password && !validatePassword(formData.password)) {
      return;
    }

    if (editingUser) {
      const updateData = formData.password ? formData : {
        ...formData,
        password: editingUser.password
      };
      onUpdateUser(editingUser.id, updateData);
      toast.success('Usuario actualizado exitosamente');
    } else {
      onAddUser(formData);
      toast.success('Usuario creado exitosamente');
    }
    
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      email: '',
      nombre: '',
      username: '',
      password: '',
      rol: 'vendedor',
      sucursal: '',
      permisos: DEFAULT_PERMISSIONS.vendedor,
      activo: true
    });
  };

  if (!currentUser.permisos.includes('gestionar_usuarios')) {
    return <div className="p-6">No tiene permisos para gestionar usuarios.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Gestión de Usuarios
          </h2>
          <p className="text-gray-600 text-lg mt-1">
            {users.length} usuarios registrados
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Sucursal</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100">
            {users.map((user) => {
              const sucursal = sucursales.find(s => s.id === user.sucursal);
              return (
                <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
                    <div className="text-sm text-indigo-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-600">{user.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                      {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {sucursal?.nombre || 'No asignada'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      user.activo 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            ...user,
                            password: ''
                          });
                          setShowForm(true);
                        }}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-all duration-200"
                        title="Editar usuario"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      {user.username !== 'ADMIN' && (
                        <button
                          onClick={() => {
                            if (window.confirm('¿Está seguro de eliminar este usuario?')) {
                              onDeleteUser(user.id);
                              toast.success('Usuario eliminado exitosamente');
                            }
                          }}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-5 w-5" />
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

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toUpperCase() })}
                    disabled={editingUser?.username === 'ADMIN'}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    {editingUser ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition-all duration-300 ease-in-out
                             hover:border-indigo-400"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                  <select
                    id="rol"
                    name="rol"
                    required
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.rol}
                    onChange={(e) => {
                      const newRol = e.target.value as UserRole;
                      setFormData({
                        ...formData,
                        rol: newRol,
                        permisos: DEFAULT_PERMISSIONS[newRol]
                      });
                    }}
                    disabled={editingUser?.username === 'ADMIN'}
                  >
                    <option value="admin">Administrador</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="almacen">Almacén</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sucursal</label>
                  <select
                    id="sucursal"
                    name="sucursal"
                    required
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.sucursal}
                    onChange={(e) => setFormData({ ...formData, sucursal: e.target.value })}
                  >
                    <option value="">Seleccionar sucursal</option>
                    {sucursales.map((sucursal) => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Permisos por Categoría</label>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-4">
                  {Object.entries(permisosGrouped).map(([category, permisos]) => (
                    <div key={category} className="border border-purple-100 rounded-xl p-4 bg-white/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-700">{category}</h4>
                        <button
                          type="button"
                          className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                          onClick={() => {
                            const categoryPermisos = permisos.map(p => p.value);
                            const allChecked = categoryPermisos.every(p => formData.permisos.includes(p));
                            const newPermisos = allChecked
                              ? formData.permisos.filter(p => !categoryPermisos.includes(p))
                              : [...new Set([...formData.permisos, ...categoryPermisos])];
                            setFormData({ ...formData, permisos: newPermisos });
                          }}
                          disabled={formData.rol === 'admin' || editingUser?.username === 'ADMIN'}
                        >
                          {permisos.every(p => formData.permisos.includes(p.value)) 
                            ? 'Desmarcar todos' 
                            : 'Marcar todos'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {permisos.map((permiso) => (
                          <label key={permiso.value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.permisos.includes(permiso.value)}
                              onChange={(e) => {
                                if (formData.rol === 'admin') return;
                                const newPermisos = e.target.checked
                                  ? [...formData.permisos, permiso.value]
                                  : formData.permisos.filter(p => p !== permiso.value);
                                setFormData({ ...formData, permisos: newPermisos });
                              }}
                              disabled={formData.rol === 'admin' || editingUser?.username === 'ADMIN'}
                              className="h-5 w-5 text-purple-600 rounded border-purple-300 focus:ring-purple-400"
                            />
                            <span className="text-sm text-gray-700">{permiso.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  disabled={editingUser?.username === 'ADMIN'}
                  className="h-5 w-5 text-purple-600 rounded border-purple-300 focus:ring-purple-400"
                />
                <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
                  Usuario activo
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                  }}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                >
                  {editingUser ? 'Actualizar' : 'Crear'} Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};