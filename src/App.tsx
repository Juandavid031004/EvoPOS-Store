import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { NewSale } from './components/NewSale';
import { ProductList } from './components/ProductList';
import { SalesList } from './components/SalesList';
import { Dashboard } from './components/Dashboard';
import { ReturnsList } from './components/Returns/ReturnsList';
import { WarehouseView } from './components/Warehouse/WarehouseView';
import { CustomerManagement } from './components/Customers/CustomerManagement';
import { DebtManagement } from './components/Debts/DebtManagement';
import { ExpenseManagement } from './components/Expenses/ExpenseManagement';
import { SettingsLayout } from './components/Settings/SettingsLayout';
import { ProductForm } from './components/ProductForm';
import { OrderManagement } from './components/Orders/OrderManagement';
import { SupplierManagement } from './components/Suppliers/SupplierManagement';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider } from './context/AuthContext';
import { 
  Product, 
  Sale, 
  Return, 
  Cliente, 
  Deuda, 
  User, 
  Sucursal, 
  BusinessConfig,
  Gasto,
  Order,
  Supplier
} from './types';

const AppContent: React.FC = () => {
  // UI State
  const [activeView, setActiveView] = useState('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [debts, setDebts] = useState<Deuda[]>([]);
  const [expenses, setExpenses] = useState<Gasto[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>({
    nombre: 'Mi Empresa',
    razonSocial: 'Mi Empresa S.A.C.',
    ruc: '',
    direccion: '',
    telefono: '',
    correo: '',
    sitioWeb: '',
    logo: '',
    stockMinimo: 5,
  });

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          activeView={activeView}
          setActiveView={setActiveView}
        />
        
        <MainContent>
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'new-sale' && <NewSale />}
          {activeView === 'products' && <ProductList />}
          {activeView === 'sales' && <SalesList />}
          {activeView === 'returns' && <ReturnsList />}
          {activeView === 'warehouse' && <WarehouseView />}
          {activeView === 'customers' && <CustomerManagement />}
          {activeView === 'debts' && <DebtManagement />}
          {activeView === 'expenses' && <ExpenseManagement />}
          {activeView === 'orders' && <OrderManagement />}
          {activeView === 'suppliers' && <SupplierManagement />}
          {activeView === 'settings' && <SettingsLayout />}
        </MainContent>

        {showProductForm && (
          <ProductForm 
            onClose={() => setShowProductForm(false)}
            onSave={(product) => {
              setProducts([...products, product]);
              setShowProductForm(false);
            }}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Login />
    </AuthProvider>
  );
};

export default App;