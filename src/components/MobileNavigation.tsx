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
    <nav className="mobile-menu">
      <button
        onClick={() => onViewChange('dashboard')}
        className={`mobile-menu-item ${activeView === 'dashboard' ? 'text-blue-600' : ''}`}
      >
        <LayoutDashboard className="mobile-menu-icon" />
        <span>Dashboard</span>
      </button>

      <button
        onClick={() => onViewChange('new-sale')}
        className={`mobile-menu-item ${activeView === 'new-sale' ? 'text-blue-600' : ''}`}
      >
        <ShoppingCart className="mobile-menu-icon" />
        <span>Vender</span>
      </button>

      <button
        onClick={() => onViewChange('products')}
        className={`mobile-menu-item ${activeView === 'products' ? 'text-blue-600' : ''}`}
      >
        <Package className="mobile-menu-icon" />
        <span>Productos</span>
      </button>

      <button
        onClick={() => onViewChange('sales')}
        className={`mobile-menu-item ${activeView === 'sales' ? 'text-blue-600' : ''}`}
      >
        <BarChart2 className="mobile-menu-icon" />
        <span>Ventas</span>
      </button>

      <button
        onClick={() => onViewChange('menu')}
        className={`mobile-menu-item ${activeView === 'menu' ? 'text-blue-600' : ''}`}
      >
        <Menu className="mobile-menu-icon" />
        <span>Más</span>
      </button>
    </nav>
  );
};