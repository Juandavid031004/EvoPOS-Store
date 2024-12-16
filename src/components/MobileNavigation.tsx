import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart2,
  Menu
} from 'lucide-react';

interface MobileNavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeView,
  onViewChange
}) => {
  return (
    <nav className="mobile-menu" role="navigation" aria-label="Navegación móvil">
      <button
        onClick={() => onViewChange('dashboard')}
        className={`mobile-menu-item ${activeView === 'dashboard' ? 'text-blue-600' : ''}`}
        aria-label="Ir al panel principal"
        aria-current={activeView === 'dashboard' ? 'page' : undefined}
      >
        <LayoutDashboard className="mobile-menu-icon" aria-hidden="true" />
        <span>Dashboard</span>
      </button>

      <button
        onClick={() => onViewChange('new-sale')}
        className={`mobile-menu-item ${activeView === 'new-sale' ? 'text-blue-600' : ''}`}
        aria-label="Crear nueva venta"
        aria-current={activeView === 'new-sale' ? 'page' : undefined}
      >
        <ShoppingCart className="mobile-menu-icon" aria-hidden="true" />
        <span>Vender</span>
      </button>

      <button
        onClick={() => onViewChange('products')}
        className={`mobile-menu-item ${activeView === 'products' ? 'text-blue-600' : ''}`}
        aria-label="Ver productos"
        aria-current={activeView === 'products' ? 'page' : undefined}
      >
        <Package className="mobile-menu-icon" aria-hidden="true" />
        <span>Productos</span>
      </button>

      <button
        onClick={() => onViewChange('sales')}
        className={`mobile-menu-item ${activeView === 'sales' ? 'text-blue-600' : ''}`}
        aria-label="Ver registro de ventas"
        aria-current={activeView === 'sales' ? 'page' : undefined}
      >
        <BarChart2 className="mobile-menu-icon" aria-hidden="true" />
        <span>Ventas</span>
      </button>

      <button
        onClick={() => onViewChange('menu')}
        className={`mobile-menu-item ${activeView === 'menu' ? 'text-blue-600' : ''}`}
        aria-label="Ver más opciones"
        aria-current={activeView === 'menu' ? 'page' : undefined}
      >
        <Menu className="mobile-menu-icon" aria-hidden="true" />
        <span>Más</span>
      </button>
    </nav>
  );
};