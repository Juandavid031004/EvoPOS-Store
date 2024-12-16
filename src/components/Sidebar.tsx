import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart,
  ShoppingBag,
  BarChart2,
  Receipt,
  DollarSign,
  Warehouse as WarehouseIcon,
  Users,
  Factory,
  Truck,
  Settings,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Permission } from '../types';
import { useSidebar } from '../context/SidebarContext';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick: () => void;
  permission?: Permission;
  userPermissions: Permission[];
  isCollapsed?: boolean;
}

const NavItem = ({ icon, text, active, onClick, permission, userPermissions, isCollapsed }: NavItemProps) => {
  if (permission && !userPermissions.includes(permission)) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`group flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} w-full p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
        active 
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl' 
          : 'hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 text-gray-600 hover:text-indigo-600'
      }`}
      title={isCollapsed ? text : undefined}
    >
      <div className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'transform-gpu rotate-6' : ''}`}>
        {icon}
      </div>
      {!isCollapsed && (
        <span className={`font-medium whitespace-nowrap ${active ? '' : 'group-hover:text-indigo-600'}`}>{text}</span>
      )}
    </button>
  );
};

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  userPermissions: Permission[];
}

export const Sidebar = ({ activeView, onViewChange, onLogout, userPermissions }: SidebarProps) => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div 
      className={`${
        isCollapsed ? 'w-20' : 'w-72'
      } h-screen bg-white/80 backdrop-blur-xl border-r border-purple-100/50 p-6 fixed left-0 top-0 flex flex-col transition-all duration-300`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-4 top-8 p-2 bg-white rounded-full shadow-lg border border-purple-100/50 text-indigo-600 hover:text-purple-600 transition-colors duration-200"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Logo */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 px-3'} mb-8`}>
        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
          <Store className="h-8 w-8 text-white transform-gpu rotate-6" aria-label="Icono de tienda" />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Gestión de Tienda
            </h1>
            <p className="text-xs text-gray-500">Sistema de Punto de Venta</p>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="space-y-2 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent hover:scrollbar-thumb-indigo-300 pr-2">
        <NavItem
          icon={<LayoutDashboard className="h-5 w-5" aria-label="Icono de panel principal" />}
          text="Panel Principal"
          active={activeView === 'dashboard'}
          onClick={() => onViewChange('dashboard')}
          permission="ver_reportes"
          userPermissions={userPermissions}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<ShoppingCart className="h-5 w-5" aria-label="Icono de nueva venta" />}
          text="Nueva Venta"
          active={activeView === 'new-sale'}
          onClick={() => onViewChange('new-sale')}
          permission="crear_venta"
          userPermissions={userPermissions}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<ShoppingBag className="h-5 w-5" aria-label="Icono de productos" />}
          text="Productos"
          active={activeView === 'products'}
          onClick={() => onViewChange('products')}
          permission="gestionar_productos"
          userPermissions={userPermissions}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<BarChart2 className="h-5 w-5" aria-label="Icono de registro de ventas" />}
          text="Registro de Ventas"
          active={activeView === 'sales'}
          onClick={() => onViewChange('sales')}
          permission="ver_ventas"
          userPermissions={userPermissions}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Receipt className="h-5 w-5" aria-label="Icono de gastos" />}
          text="Gastos"
          active={activeView === 'expenses'}
          onClick={() => onViewChange('expenses')}
          permission="gestionar_gastos"
          userPermissions={userPermissions}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<DollarSign className="h-5 w-5" aria-label="Icono de deudores" />}
          text="Deudores"
          active={activeView === 'debts'}
          onClick={() => onViewChange('debts')}
          permission="gestionar_deudas"
          userPermissions={userPermissions}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<WarehouseIcon className="h-5 w-5" aria-label="Icono de almacén" />}
          text="Almacén"
          active={activeView === 'warehouse'}
          onClick={() => onViewChange('warehouse')}
          permission="gestionar_almacen"
          userPermissions={userPermissions}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Users className="h-5 w-5" aria-label="Icono de clientes" />}
          text="Clientes"
          active={activeView === 'customers'}
          onClick={() => onViewChange('customers')}
          permission="gestionar_clientes"
          userPermissions={userPermissions}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Factory className="h-5 w-5" aria-label="Icono de proveedores" />}
          text="Proveedores"
          active={activeView === 'suppliers'}
          onClick={() => onViewChange('suppliers')}
          permission="gestionar_proveedores"
          userPermissions={userPermissions}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Truck className="h-5 w-5" aria-label="Icono de pedidos" />}
          text="Pedidos"
          active={activeView === 'orders'}
          onClick={() => onViewChange('orders')}
          permission="gestionar_pedidos"
          userPermissions={userPermissions}
          isCollapsed={isCollapsed}
        />
        <NavItem
          icon={<Settings className="h-5 w-5" aria-label="Icono de configuración" />}
          text="Configuración"
          active={activeView === 'settings'}
          onClick={() => onViewChange('settings')}
          permission="gestionar_usuarios"
          userPermissions={userPermissions}
          isCollapsed={isCollapsed}
        />
      </nav>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className={`group flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} w-full p-3 mt-6 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-105`}
        title={isCollapsed ? "Cerrar Sesión" : undefined}
      >
        <div className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
          <LogOut className="h-5 w-5" aria-label="Icono de cerrar sesión" />
        </div>
        {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
      </button>
    </div>
  );
};