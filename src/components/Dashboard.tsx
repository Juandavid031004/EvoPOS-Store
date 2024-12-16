import React from 'react';
import { DollarSign, Package, TrendingUp, AlertTriangle, ArrowDown } from 'lucide-react';
import { Product, Sale, BusinessConfig, Gasto, User } from '../types';
import { format, isToday, isYesterday, startOfMonth, endOfMonth } from 'date-fns';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  expenses: Gasto[];
  config: BusinessConfig;
  users: User[];
}

// Tipos de estado de stock
type StockStatus = 'bajo' | 'critico' | 'normal';

const getStockStatus = (product: Product): StockStatus => {
  if (product.stock <= product.stockMinimo) {
    return 'bajo';
  } else if (product.stock <= product.stockMinimo + 2) {
    return 'critico';
  } else {
    return 'normal';
  }
};

export const Dashboard = ({ products, sales, expenses, config, users }: DashboardProps) => {
  // Get today's and yesterday's data
  const todaySales = sales.filter(sale => isToday(new Date(sale.fecha)));
  const yesterdaySales = sales.filter(sale => isYesterday(new Date(sale.fecha)));
  const todayExpenses = expenses.filter(expense => isToday(new Date(expense.fecha)));
  const yesterdayExpenses = expenses.filter(expense => isYesterday(new Date(expense.fecha)));

  // Calculate totals
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const yesterdayTotal = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);
  const todayExpensesTotal = todayExpenses.reduce((sum, expense) => sum + expense.monto, 0);
  const yesterdayExpensesTotal = yesterdayExpenses.reduce((sum, expense) => sum + expense.monto, 0);

  // Calculate costs of products sold
  const getTotalCost = (salesList: Sale[]) => {
    return salesList.reduce((sum, sale) => {
      return sum + sale.productos.reduce((prodSum, item) => {
        return prodSum + (item.costo_historico * item.cantidad);
      }, 0);
    }, 0);
  };

  const todayCosts = getTotalCost(todaySales);
  const yesterdayCosts = getTotalCost(yesterdaySales);

  // Calculate net profit (revenue - costs - expenses)
  const todayProfit = todayTotal - todayCosts - todayExpensesTotal;
  const yesterdayProfit = yesterdayTotal - yesterdayCosts - yesterdayExpensesTotal;

  // Calculate monthly totals
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const monthSales = sales.filter(sale => {
    const saleDate = new Date(sale.fecha);
    return saleDate >= monthStart && saleDate <= monthEnd;
  });

  const monthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.fecha);
    return expenseDate >= monthStart && expenseDate <= monthEnd;
  });

  const monthlyIncome = monthSales.reduce((sum, sale) => sum + sale.total, 0);
  const monthlyCosts = getTotalCost(monthSales);
  const monthlyExpenses = monthExpenses.reduce((sum, expense) => sum + expense.monto, 0);
  const monthlyProfit = monthlyIncome - monthlyCosts - monthlyExpenses;

  // Calculate percentage changes
  const calculatePercentageChange = (today: number, yesterday: number) => {
    if (yesterday === 0) return today > 0 ? 100 : 0;
    return ((today - yesterday) / yesterday) * 100;
  };

  const salesChange = calculatePercentageChange(todayTotal, yesterdayTotal);
  const expensesChange = calculatePercentageChange(todayExpensesTotal, yesterdayExpensesTotal);
  const profitChange = calculatePercentageChange(todayProfit, yesterdayProfit);

  // Actualizar la lógica de productos con stock bajo
  const lowStockProducts = products.filter(p => getStockStatus(p) !== 'normal');
  const criticalStockProducts = products.filter(p => getStockStatus(p) === 'critico');
  const veryLowStockProducts = products.filter(p => getStockStatus(p) === 'bajo');

  // Actualizar la descripción en las estadísticas
  const stockDescription = `${veryLowStockProducts.length} productos en stock bajo, ${criticalStockProducts.length} en stock crítico`;

  const stats = [
    {
      id: 'ventas',
      title: 'Ventas del Día',
      value: `S/ ${todayTotal.toFixed(2)}`,
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      change: `${salesChange > 0 ? '+' : ''}${salesChange.toFixed(1)}%`,
      changeColor: salesChange >= 0 ? 'text-green-500' : 'text-red-500',
      description: 'vs. ayer'
    },
    {
      id: 'gastos',
      title: 'Gastos del Día',
      value: `S/ ${todayExpensesTotal.toFixed(2)}`,
      icon: <ArrowDown className="h-6 w-6 text-red-500" />,
      change: `${expensesChange > 0 ? '+' : ''}${expensesChange.toFixed(1)}%`,
      changeColor: expensesChange <= 0 ? 'text-green-500' : 'text-red-500',
      description: 'vs. ayer'
    },
    {
      id: 'beneficio',
      title: 'Beneficio del Día',
      value: `S/ ${todayProfit.toFixed(2)}`,
      icon: <TrendingUp className="h-6 w-6 text-purple-500" />,
      change: `${profitChange > 0 ? '+' : ''}${profitChange.toFixed(1)}%`,
      changeColor: profitChange >= 0 ? 'text-green-500' : 'text-red-500',
      description: 'vs. ayer'
    },
    {
      id: 'stock-bajo',
      title: 'Alertas de Stock',
      value: lowStockProducts.length,
      icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
      change: `${((lowStockProducts.length / products.length) * 100).toFixed(1)}%`,
      changeColor: 'text-red-500',
      description: stockDescription
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6 animate-gradient-x">
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
            Panel de Control
          </h1>
          <p className="text-gray-500 text-sm">
            Gestiona tu negocio de manera eficiente
          </p>
        </div>
        <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
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
      
      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`
                  p-3 rounded-2xl transform transition-transform duration-500 group-hover:scale-110
                  ${stat.id === 'ventas' ? 'bg-gradient-to-br from-green-100 to-emerald-200' : ''}
                  ${stat.id === 'gastos' ? 'bg-gradient-to-br from-red-100 to-rose-200' : ''}
                  ${stat.id === 'beneficio' ? 'bg-gradient-to-br from-purple-100 to-indigo-200' : ''}
                  ${stat.id === 'stock-bajo' ? 'bg-gradient-to-br from-orange-100 to-amber-200' : ''}
                `}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <span className={`
                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    transition-all duration-300 group-hover:scale-105
                    ${stat.changeColor.replace('text-', 'bg-').replace('500', '100')} ${stat.changeColor}
                  `}>
                    {stat.change}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
              </div>
              <div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                <p className={`text-2xl font-bold transition-colors duration-300
                  ${stat.id === 'ventas' ? 'text-emerald-600 group-hover:text-emerald-700' : ''}
                  ${stat.id === 'gastos' ? 'text-rose-600 group-hover:text-rose-700' : ''}
                  ${stat.id === 'beneficio' ? 'text-indigo-600 group-hover:text-indigo-700' : ''}
                  ${stat.id === 'stock-bajo' ? 'text-amber-600 group-hover:text-amber-700' : ''}
                `}>
                  {stat.value}
                </p>
              </div>
            </div>
            <div className={`h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500
              ${stat.id === 'ventas' ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600' : ''}
              ${stat.id === 'gastos' ? 'bg-gradient-to-r from-red-400 via-rose-500 to-red-600' : ''}
              ${stat.id === 'beneficio' ? 'bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600' : ''}
              ${stat.id === 'stock-bajo' ? 'bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600' : ''}
            `}></div>
          </div>
        ))}
      </div>

      {/* Resumen Mensual y Últimos Gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Resumen Mensual */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Resumen Mensual
              </h2>
              <span className="px-4 py-1.5 text-sm font-medium text-purple-600 bg-purple-100 rounded-full animate-pulse">
                {format(new Date(), 'MMMM yyyy')}
              </span>
            </div>
            <div className="space-y-4">
              <div className="group p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Ingresos</p>
                    <p className="text-lg font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                      S/ {monthlyIncome.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg transform group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="group p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Costos de Productos</p>
                    <p className="text-lg font-bold text-amber-600 group-hover:text-amber-700 transition-colors">
                      S/ {monthlyCosts.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-200 rounded-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="group p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Gastos Operativos</p>
                    <p className="text-lg font-bold text-rose-600 group-hover:text-rose-700 transition-colors">
                      S/ {monthlyExpenses.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-red-100 to-rose-200 rounded-lg transform group-hover:scale-110 transition-transform duration-300">
                    <ArrowDown className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
              </div>

              <div className="group p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-indigo-100">Beneficio Neto</p>
                    <p className="text-xl font-bold text-white">
                      S/ {monthlyProfit.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Últimos Gastos */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Últimos Gastos
              </h2>
              <button 
                onClick={() => window.location.href = '/expenses'}
                className="px-4 py-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium bg-purple-100 rounded-full transition-colors duration-300"
              >
                Ver todos
              </button>
            </div>
            <div className="space-y-4">
              {expenses
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                .slice(0, 5)
                .map((expense) => (
                  <div 
                    key={expense.id} 
                    className="group flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-red-100 to-rose-200 rounded-lg transform group-hover:scale-110 transition-transform duration-300">
                        <ArrowDown className="h-5 w-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                          {expense.descripcion}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(expense.fecha), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                    <span className="text-rose-600 font-bold group-hover:text-rose-700 transition-colors">
                      S/ {expense.monto.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de Stock Bajo */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Alertas de Stock Bajo
                </h2>
                <span className="px-4 py-1.5 text-sm font-medium text-rose-600 bg-rose-100 rounded-full animate-pulse">
                  {lowStockProducts.length} productos
                </span>
              </div>
              <span className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-full">
                Stock mínimo: {config.stockMinimo}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-4 text-sm font-medium text-gray-500">Código</th>
                    <th className="pb-4 text-sm font-medium text-gray-500">Nombre</th>
                    <th className="pb-4 text-sm font-medium text-gray-500">Categoría</th>
                    <th className="pb-4 text-sm font-medium text-gray-500">Sucursal</th>
                    <th className="pb-4 text-sm font-medium text-gray-500">Stock Actual</th>
                    <th className="pb-4 text-sm font-medium text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lowStockProducts.map((product) => (
                    <tr key={product.id} className="group hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 transition-colors duration-300">
                      <td className="py-4 text-sm font-medium text-gray-900">{product.codigo}</td>
                      <td className="py-4 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{product.nombre}</td>
                      <td className="py-4 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors duration-300">
                          {product.categoria}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700 group-hover:bg-purple-200 transition-colors duration-300">
                          {product.sucursal}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`
                          inline-flex items-center px-3 py-1 text-sm font-medium rounded-full
                          transition-all duration-300 group-hover:scale-105
                          ${getStockStatus(product) === 'bajo' 
                            ? 'bg-red-100 text-red-700 group-hover:bg-red-200' 
                            : 'bg-orange-100 text-orange-700 group-hover:bg-orange-200'}
                        `}>
                          {product.stock} unidades
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`
                          inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full
                          ${getStockStatus(product) === 'bajo'
                            ? 'bg-red-100 text-red-700 group-hover:bg-red-200'
                            : 'bg-orange-100 text-orange-700 group-hover:bg-orange-200'}
                          transition-colors duration-300
                        `}>
                          <AlertTriangle className="h-4 w-4" />
                          {getStockStatus(product) === 'bajo' ? 'Stock Bajo' : 'Stock Crítico'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
