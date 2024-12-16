import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
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
import { authorizedEmails, defaultAdmin } from './config/whitelist';
import { DEFAULT_PERMISSIONS } from './types';
import { 
  Product, 
  Sale, 
  Return, 
  Cliente, 
  Deuda, 
  User, 
  Sucursal, 
  BusinessConfig,
  AuthState,
  Gasto,
  Order,
  Supplier
} from './types';
import { SidebarProvider } from './context/SidebarContext';

const App: React.FC = () => {
  // Auth State
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('authState');
    return savedAuth ? JSON.parse(savedAuth) : {
      user: null,
      business: null,
      isAuthenticated: false
    };
  });

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

  // Load data on auth change
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const email = authState.user.email;
      
      // Load users first
      const storedUsers = JSON.parse(localStorage.getItem(`users_${email}`) || '[]');
      setUsers(storedUsers);
      
      // Load business data
      const storedData = localStorage.getItem(`businessData_${email}`);
      if (storedData) {
        const data = JSON.parse(storedData);
        setProducts(data.products || []);
        setSales(data.sales || []);
        setReturns(data.returns || []);
        setCustomers(data.customers || []);
        setDebts(data.debts || []);
        setExpenses(data.expenses || []);
        setSucursales(data.sucursales || []);
        setOrders(data.orders || []);
        setSuppliers(data.suppliers || []);
        setBusinessConfig(data.businessConfig || {
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
      }
    }
  }, [authState.isAuthenticated, authState.user]);

  // Save data when it changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const email = authState.user.email;
      
      // Save users
      localStorage.setItem(`users_${email}`, JSON.stringify(users));
      
      // Save business data
      const dataToSave = {
        products,
        sales,
        returns,
        customers,
        debts,
        expenses,
        users,
        sucursales,
        orders,
        suppliers,
        businessConfig
      };
      localStorage.setItem(`businessData_${email}`, JSON.stringify(dataToSave));
    }
  }, [
    authState.isAuthenticated,
    authState.user,
    products,
    sales,
    returns,
    customers,
    debts,
    expenses,
    users,
    sucursales,
    orders,
    suppliers,
    businessConfig
  ]);

  // Función para encontrar la primera vista permitida para el usuario
  const getFirstAllowedView = (permisos: Permission[]) => {
    const viewPermissions = {
      'dashboard': ['ver_dashboard', 'ver_estadisticas'],
      'new-sale': ['crear_venta'],
      'products': ['ver_productos', 'gestionar_productos'],
      'sales': ['ver_ventas'],
      'returns': ['gestionar_devoluciones'],
      'warehouse': ['gestionar_almacen'],
      'customers': ['ver_clientes', 'gestionar_clientes'],
      'debts': ['gestionar_deudas'],
      'expenses': ['ver_gastos', 'gestionar_gastos'],
      'orders': ['ver_pedidos', 'gestionar_pedidos'],
      'suppliers': ['ver_proveedores', 'gestionar_proveedores'],
      'settings': ['ver_configuracion', 'gestionar_usuarios']
    };

    // Si tiene permiso 'all', puede ver cualquier vista
    if (permisos.includes('all')) {
      return 'dashboard';
    }

    // Buscar la primera vista para la que el usuario tiene permisos
    for (const [view, requiredPermissions] of Object.entries(viewPermissions)) {
      if (requiredPermissions.some(permission => permisos.includes(permission))) {
        return view;
      }
    }

    return 'new-sale'; // Vista por defecto si no se encuentra ninguna permitida
  };

  const handleLogin = (email: string, username: string, password: string) => {
    // Verificar si el email está en la whitelist
    const isWhitelisted = authorizedEmails.includes(email.toLowerCase());
    
    if (!isWhitelisted) {
      throw new Error('Acceso no autorizado');
    }

    // Intentar cargar usuarios existentes
    const storedUsers = JSON.parse(localStorage.getItem(`users_${email}`) || '[]');
    
    // Buscar si existe un usuario con las credenciales proporcionadas
    const existingUser = storedUsers.find((user: User) => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.username === username && 
      user.password === password
    );

    // Si es el admin por defecto
    if (username === defaultAdmin.username && password === defaultAdmin.password) {
      // Crear usuario por defecto si no existe
      const defaultUser: User = {
        id: '1',
        email: email,
        username: defaultAdmin.username,
        password: defaultAdmin.password,
        nombre: defaultAdmin.nombre,
        sucursal: 'Principal',
        rol: 'admin',
        permisos: [
          'all',
          'crear_venta',
          'ver_ventas',
          'anular_venta',
          'aplicar_descuentos',
          'gestionar_productos',
          'ver_productos',
          'modificar_precios',
          'gestionar_almacen',
          'gestionar_devoluciones',
          'ajustar_stock',
          'gestionar_clientes',
          'ver_clientes',
          'gestionar_deudas',
          'gestionar_puntos',
          'ver_reportes',
          'exportar_reportes',
          'ver_dashboard',
          'ver_estadisticas',
          'gestionar_usuarios',
          'gestionar_sucursales',
          'gestionar_gastos',
          'ver_gastos',
          'eliminar_gastos',
          'ver_configuracion',
          'configurar_sistema',
          'gestionar_pedidos',
          'ver_pedidos',
          'actualizar_pedidos',
          'eliminar_pedidos',
          'gestionar_proveedores',
          'ver_proveedores',
          'eliminar_proveedores',
          'transferir_stock',
          'restaurar_stock'
        ],
        activo: true
      };

      // Si el usuario admin no existe en la lista, agregarlo
      if (!existingUser) {
        storedUsers.push(defaultUser);
        localStorage.setItem(`users_${email}`, JSON.stringify(storedUsers));

        // Crear sucursal por defecto si no existe
        const storedData = localStorage.getItem(`businessData_${email}`);
        if (!storedData) {
          const defaultBranch: Sucursal = {
            id: '1',
            nombre: 'Principal',
            direccion: '',
            telefono: '',
            encargado: defaultUser.nombre,
            createdAt: new Date()
          };

          const initialData = {
            products: [],
            sales: [],
            returns: [],
            customers: [],
            debts: [],
            expenses: [],
            users: [defaultUser],
            sucursales: [defaultBranch],
            orders: [],
            suppliers: [],
            businessConfig: {
              nombre: 'Mi Empresa',
              razonSocial: 'Mi Empresa S.A.C.',
              ruc: '',
              direccion: '',
              telefono: '',
              correo: '',
              sitioWeb: '',
              logo: '',
              stockMinimo: 5,
            }
          };

          localStorage.setItem(`businessData_${email}`, JSON.stringify(initialData));
        }
      }

      // Para el admin por defecto, siempre mostrar dashboard
      setActiveView('dashboard');

      const newAuthState = {
        user: defaultUser,
        isAuthenticated: true
      };
      
      setAuthState(newAuthState);
      localStorage.setItem('authState', JSON.stringify(newAuthState));
      toast.success(`Bienvenido ${defaultAdmin.nombre}`);
    } 
    // Si es un usuario existente
    else if (existingUser) {
      // Establecer la vista inicial basada en los permisos
      const initialView = getFirstAllowedView(existingUser.permisos);
      setActiveView(initialView);

      const newAuthState = {
        user: existingUser,
        isAuthenticated: true
      };
      
      setAuthState(newAuthState);
      localStorage.setItem('authState', JSON.stringify(newAuthState));
      toast.success(`Bienvenido ${existingUser.nombre}`);
    } 
    else {
      throw new Error('Credenciales inválidas');
    }
  };

  const handleLogout = () => {
    setAuthState({
      user: null,
      business: null,
      isAuthenticated: false
    });
    localStorage.removeItem('authState');
    setActiveView('dashboard');
  };

  // Product handlers
  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: (products.length + 1).toString(),
      createdAt: new Date()
    };
    setProducts([...products, newProduct]);
    setShowProductForm(false);
    toast.success('Producto agregado', {
      icon: '✨',
      duration: 2000
    });
  };

  const handleUpdateProduct = (productId: string, updatedData: Partial<Product>) => {
    setProducts(products.map(product =>
      product.id === productId
        ? { ...product, ...updatedData }
        : product
    ));
    toast.success('Producto actualizado', {
      icon: '✏️',
      duration: 2000
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
    toast.success('Producto eliminado', {
      icon: '🗑️',
      duration: 2000
    });
  };

  // Sale handlers
  const handleUpdateStock = async (productId: string, stockChange: number) => {
    try {
      const currentProduct = products.find(p => p.id === productId);
      if (!currentProduct) {
        toast.error('Producto no encontrado', {
          icon: '❌',
          duration: 3000
        });
        return;
      }

      const newStock = currentProduct.stock + stockChange;
      
      if (newStock < 0) {
        toast.error('Stock insuficiente', {
          icon: '⚠️',
          duration: 3000
        });
        return;
      }

      const updatedProduct = {
        ...currentProduct,
        stock: newStock
      };

      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? updatedProduct : p
        )
      );

      if (stockChange > 0) {
        toast.success(`Stock aumentado: +${stockChange}`, {
          icon: '📦',
          duration: 2000
        });
      } else {
        toast.success(`Stock reducido: ${stockChange}`, {
          icon: '📦',
          duration: 2000
        });
      }

      return true;
    } catch (error) {
      console.error('Error actualizando stock:', error);
      toast.error('Error al actualizar stock', {
        icon: '❌',
        duration: 3000
      });
      return false;
    }
  };

  const handleAddSale = async (saleData: Omit<Sale, 'id' | 'fecha'>) => {
    try {
      // Validar stock antes de procesar la venta
      for (const item of saleData.productos) {
        const product = products.find(p => p.id === item.productoId);
        if (!product) {
          toast.error('Producto no encontrado', {
            icon: '❌',
            duration: 3000
          });
          return;
        }
        if (product.stock < item.cantidad) {
          toast.error('Stock insuficiente', {
            icon: '⚠️',
            duration: 3000
          });
          return;
        }
      }

      // Reducir stock de productos
      for (const item of saleData.productos) {
        const success = await handleUpdateStock(item.productoId, -item.cantidad);
        if (!success) {
          toast.error('Error al actualizar el stock');
          return;
        }
      }

      // Crear la venta
      const lastSaleId = sales.length > 0 
        ? Math.max(...sales.map(sale => parseInt(sale.id)))
        : 0;

      const newSale: Sale = {
        ...saleData,
        id: (lastSaleId + 1).toString(),
        fecha: new Date()
      };

      // Si es venta al fiado, crear deuda
      if (saleData.metodoPago === 'fiado') {
        if (!saleData.clienteId) {
          throw new Error('Se requiere seleccionar un cliente para ventas al fiado');
        }

        const lastDebtId = debts.length > 0 
          ? Math.max(...debts.map(debt => parseInt(debt.id)))
          : 0;

        const newDebt: Deuda = {
          id: (lastDebtId + 1).toString(),
          clienteId: saleData.clienteId,
          fecha: new Date(),
          productos: saleData.productos,
          total: saleData.total,
          pagos: [],
          estado: 'pendiente',
          observaciones: `Venta al fiado #${newSale.id}`
        };

        setDebts(prevDebts => [...prevDebts, newDebt]);
        toast.success('Deuda registrada exitosamente');
      }

      // Actualizar ventas
      setSales(prevSales => [...prevSales, newSale]);
      toast.success('Venta completada exitosamente');

    } catch (error) {
      console.error('Error al procesar la venta:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar la venta');
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    try {
      const sale = sales.find(s => s.id === saleId);
      if (!sale) {
        toast.error('Venta no encontrada');
        return;
      }

      // Restaurar stock de productos
      for (const item of sale.productos) {
        const success = await handleUpdateStock(item.productoId, item.cantidad);
        if (!success) {
          toast.error('Error al restaurar el stock');
          return;
        }
      }

      // Eliminar la venta
      setSales(prevSales => prevSales.filter(s => s.id !== saleId));
      toast.success('Venta eliminada exitosamente');

    } catch (error) {
      console.error('Error al eliminar la venta:', error);
      toast.error('Error al eliminar la venta');
    }
  };

  // Customer handlers
  const handleAddCustomer = (customerData: Omit<Cliente, 'id' | 'createdAt' | 'puntos' | 'totalGastado'>) => {
    const newCustomer: Cliente = {
      ...customerData,
      id: (customers.length + 1).toString(),
      puntos: 0,
      totalGastado: 0,
      createdAt: new Date()
    };
    setCustomers([...customers, newCustomer]);
  };

  const handleUpdateCustomer = (id: string, customerData: Partial<Cliente>) => {
    setCustomers(customers.map(customer =>
      customer.id === id ? { ...customer, ...customerData } : customer
    ));
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  // Order handlers
  const handleAddOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: (orders.length + 1).toString(),
      createdAt: new Date()
    };
    setOrders([...orders, newOrder]);
  };

  const handleUpdateOrder = (id: string, orderData: Partial<Order>) => {
    setOrders(orders.map(order =>
      order.id === id ? { ...order, ...orderData } : order
    ));
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  // Supplier handlers
  const handleAddSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: (suppliers.length + 1).toString(),
      createdAt: new Date()
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const handleUpdateSupplier = (id: string, supplierData: Partial<Supplier>) => {
    setSuppliers(suppliers.map(supplier =>
      supplier.id === id ? { ...supplier, ...supplierData } : supplier
    ));
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  if (!authState.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView}
          onLogout={handleLogout}
          userPermissions={authState.user?.permisos || []}
        />
        <MainContent>
          {showProductForm && (
            <ProductForm
              onSubmit={handleAddProduct}
              onClose={() => setShowProductForm(false)}
              sucursales={sucursales}
            />
          )}
          {activeView === 'dashboard' && (
            <Dashboard 
              sales={sales}
              returns={returns}
              products={products}
              expenses={expenses}
              debts={debts}
              config={businessConfig}
              currentUser={authState.user}
            />
          )}
          {activeView === 'new-sale' && (
            <NewSale
              products={products}
              users={users}
              sucursales={sucursales}
              customers={customers}
              currentUser={authState.user!}
              onCompleteSale={handleAddSale}
              onUpdateProduct={handleUpdateProduct}
              onUpdateCustomer={handleUpdateCustomer}
            />
          )}
          {activeView === 'products' && (
            <ProductList
              products={products}
              sucursales={sucursales}
              onAddProduct={() => setShowProductForm(true)}
              onUpdateStock={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onUpdateProduct={handleUpdateProduct}
            />
          )}
          {activeView === 'sales' && (
            <SalesList 
              sales={sales} 
              products={products}
              config={businessConfig}
              currentUser={authState.user!}
              sucursales={sucursales}
              users={users}
              onDeleteSale={handleDeleteSale}
              onUpdateProduct={(productId, newStock) => handleUpdateProduct(productId, newStock)}
            />
          )}
          {activeView === 'returns' && (
            <ReturnsList 
              returns={returns}
              products={products}
              sucursales={sucursales}
              onAddReturn={(ret) => setReturns([...returns, { ...ret, id: (returns.length + 1).toString(), fecha: new Date() }])}
              onUpdateProduct={handleUpdateProduct}
              onDeleteReturn={(id) => setReturns(returns.filter(r => r.id !== id))}
              onUpdateReturn={(id, status) => setReturns(returns.map(r => r.id === id ? { ...r, estado: status } : r))}
            />
          )}
          {activeView === 'warehouse' && (
            <WarehouseView 
              warehouse={{
                id: '1',
                nombre: 'Almacén Principal',
                ubicacion: 'Principal',
                capacidad: 1000,
                stockActual: products.reduce((sum, p) => sum + p.stock, 0)
              }}
              products={products}
              sucursales={sucursales}
              config={businessConfig}
            />
          )}
          {activeView === 'customers' && (
            <CustomerManagement
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onRedeemPoints={(customerId, points) => {
                const customer = customers.find(c => c.id === customerId);
                if (customer) {
                  handleUpdateCustomer(customerId, {
                    puntos: customer.puntos - points
                  });
                }
              }}
            />
          )}
          {activeView === 'debts' && (
            <DebtManagement
              debts={debts}
              customers={customers}
              products={products}
              onPayDebt={(debtId, amount) => {
                setDebts(debts.map(debt => {
                  if (debt.id === debtId) {
                    const newPagos = [...debt.pagos, { monto: amount, fecha: new Date() }];
                    const totalPagado = newPagos.reduce((sum, pago) => sum + pago.monto, 0);
                    return {
                      ...debt,
                      pagos: newPagos,
                      estado: totalPagado >= debt.total ? 'pagado' : 'pendiente'
                    };
                  }
                  return debt;
                }));
              }}
              onDeleteDebt={(id) => setDebts(debts.filter(d => d.id !== id))}
            />
          )}
          {activeView === 'expenses' && (
            <ExpenseManagement
              expenses={expenses}
              config={businessConfig}
              currentUser={authState.user || { nombre: '', sucursal: '', email: '', username: '', password: '', role: 'user' }}
              sucursales={sucursales}
              onAddExpense={(expense) => setExpenses([...expenses, { ...expense, id: (expenses.length + 1).toString(), createdAt: new Date() }])}
              onDeleteExpense={(id) => {
                setExpenses(expenses.filter(expense => expense.id !== id));
                toast.success('Gasto eliminado exitosamente');
              }}
              onEditExpense={(id, updatedExpense) => {
                setExpenses(expenses.map(expense => 
                  expense.id === id 
                    ? { ...expense, ...updatedExpense }
                    : expense
                ));
                toast.success('Gasto actualizado exitosamente');
              }}
            />
          )}
          {activeView === 'orders' && (
            <OrderManagement
              orders={orders}
              products={products}
              suppliers={suppliers}
              sucursales={sucursales}
              currentUser={authState.user!}
              onAddOrder={handleAddOrder}
              onUpdateOrder={handleUpdateOrder}
              onDeleteOrder={handleDeleteOrder}
            />
          )}
          {activeView === 'suppliers' && (
            <SupplierManagement
              suppliers={suppliers}
              currentUser={authState.user!}
              onAddSupplier={handleAddSupplier}
              onUpdateSupplier={handleUpdateSupplier}
              onDeleteSupplier={handleDeleteSupplier}
            />
          )}
          {activeView === 'settings' && authState.user && (
            <SettingsLayout
              currentUser={authState.user}
              users={users}
              sucursales={sucursales}
              config={businessConfig}
              onAddUser={(userData) => {
                const newUser: User = {
                  ...userData,
                  id: (users.length + 1).toString()
                };
                setUsers([...users, newUser]);
              }}
              onUpdateUser={(id, userData) => {
                setUsers(users.map(user =>
                  user.id === id ? { ...user, ...userData } : user
                ));
              }}
              onDeleteUser={(id) => {
                setUsers(users.filter(user => user.id !== id));
              }}
              onAddBranch={(branchData) => {
                const newBranch: Sucursal = {
                  ...branchData,
                  id: (sucursales.length + 1).toString(),
                  createdAt: new Date()
                };
                setSucursales([...sucursales, newBranch]);
              }}
              onUpdateBranch={(id, branchData) => {
                setSucursales(sucursales.map(branch =>
                  branch.id === id ? { ...branch, ...branchData } : branch
                ));
              }}
              onDeleteBranch={(id) => {
                setSucursales(sucursales.filter(branch => branch.id !== id));
              }}
              onUpdateConfig={(configData) => {
                setBusinessConfig({ ...businessConfig, ...configData });
              }}
            />
          )}
        </MainContent>
        <Toaster position="bottom-right" />
      </div>
    </SidebarProvider>
  );
};

export default App;