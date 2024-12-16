import React, { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { Sale, Product, BusinessConfig, User, Sucursal } from '../types';
import { FileText, Calendar, Search, Filter, Building2, ArrowUpDown, Receipt, Trash2, RefreshCw } from 'lucide-react';
import { generateDocument, generateSalesReport } from '../utils/documentGenerator';
import { POINTS_PER_UNIT } from '../constants';

interface SalesListProps {
  sales: Sale[];
  products: Product[];
  config: BusinessConfig;
  currentUser: User;
  sucursales: Sucursal[];
  users: User[];
  onDeleteSale: (saleId: string) => void;
  onUpdateProduct: (productId: string, newStock: number) => void;
}

interface Customer {
  id: string;
  puntos: number;
  total_gastado: number;
  nombre?: string;
  email?: string;
  telefono?: string;
  created_at?: string;
  updated_at?: string;
}

export const SalesList: React.FC<SalesListProps> = ({
  sales,
  products,
  config,
  currentUser,
  sucursales,
  users,
  onDeleteSale,
  onUpdateProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vendedorFilter, setVendedorFilter] = useState('');
  const [sucursalFilter, setSucursalFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Sale>('fecha');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Sale) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleGenerateDocument = async (sale: Sale, type: 'boleta') => {
    try {
      await generateDocument({ type, sale, products, config });
      toast.success('Boleta generada');
    } catch (error) {
      toast.error('Error al generar boleta');
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    try {
      const sale = sales.find(s => s.id === saleId);
      if (!sale) {
        toast.error('Venta no encontrada');
        return;
      }

      // Mensaje de confirmación detallado
      let infoMessage = '🔔 RESTAURACIÓN DE STOCK\n\n';
      
      // Detalles de la venta
      infoMessage += `📋 Detalles de la Venta:\n`;
      infoMessage += `• ID: ${sale.id}\n`;
      infoMessage += `• Cliente: ${sale.cliente || 'Cliente General'}\n`;
      infoMessage += `• Total: S/ ${sale.total.toFixed(2)}\n`;
      infoMessage += `• Método de pago: ${sale.metodoPago.toUpperCase()}\n\n`;

      // Instrucciones según método de pago
      infoMessage += '💳 Acciones por método de pago:\n';
      if (sale.metodoPago.toLowerCase() === 'efectivo') {
        infoMessage += '• Realizar devolución en efectivo\n';
        infoMessage += '• Registrar devolución en caja\n';
      } else if (sale.metodoPago.toLowerCase() === 'tarjeta') {
        infoMessage += '• Procesar reembolso en POS\n';
        infoMessage += '• Entregar voucher de reembolso\n';
      } else if (sale.metodoPago.toLowerCase() === 'yape') {
        infoMessage += '• Realizar devolución por Yape\n';
        infoMessage += '• Registrar transferencia de devolución\n';
      } else if (sale.metodoPago.toLowerCase() === 'transferencia') {
        infoMessage += '• Realizar devolución bancaria\n';
        infoMessage += '• Guardar comprobante de reembolso\n';
      } else if (sale.metodoPago.toLowerCase() === 'fiado') {
        infoMessage += '• Anular deuda pendiente\n';
        infoMessage += '• Actualizar registro del cliente\n';
      }

      // Instrucciones según tipo de cliente
      infoMessage += '\n👤 Acciones por tipo de cliente:\n';
      if (sale.clienteId) {
        infoMessage += '• Ajustar total gastado del cliente\n';
        infoMessage += '• Actualizar puntos acumulados\n';
      } else {
        infoMessage += '• Entregar comprobante de devolución\n';
      }

      // Productos a restaurar
      infoMessage += '\n📦 Productos a restaurar:\n';
      for (const item of sale.productos) {
        const product = products.find(p => p.id === item.productoId);
        if (product) {
          infoMessage += `• ${product.nombre}: +${item.cantidad} unidades\n`;
        }
      }

      infoMessage += '\n⚠️ ¿Está seguro de restaurar el stock de estos productos?';

      if (window.confirm(infoMessage)) {
        // Validar productos
        const invalidProducts = sale.productos.filter(item => !products.find(p => p.id === item.productoId));
        if (invalidProducts.length > 0) {
          toast.error('Algunos productos ya no existen en el inventario');
          return;
        }

        // Restaurar stock
        for (const item of sale.productos) {
          const product = products.find(p => p.id === item.productoId);
          if (product) {
            const newStock = product.stock + item.cantidad;
            await onUpdateProduct(product.id, newStock);
            toast.success(`${product.nombre}: +${item.cantidad} unidades`, {
              duration: 2000,
              icon: '📦'
            });
          }
        }

        // Eliminar la venta
        onDeleteSale(saleId);
        toast.success('Stock restaurado correctamente', {
          duration: 3000,
          icon: '✅'
        });
      }
    } catch (error) {
      console.error('Error al restaurar stock:', error);
      toast.error('Error al restaurar el stock');
    }
  };

  const handleExportPDF = async () => {
    if (!currentUser?.permisos?.includes('ver_reportes')) {
      toast.error('Sin permisos para reportes');
      return;
    }

    try {
      await generateSalesReport({ sales: filteredSales, products, config });
      toast.success('Reporte generado');
    } catch (error) {
      toast.error('Error al generar reporte');
    }
  };

  // Get unique vendedores with names
  const vendedores = Array.from(new Set(
    sales.map(sale => sale.vendedor)
  )).map(vendedorId => {
    const user = users.find(u => u.id === vendedorId);
    return user ? { id: user.id, nombre: user.nombre } : null;
  }).filter((v): v is { id: string; nombre: string } => v !== null);

  // Filtrar ventas
  const filteredSales = sales.filter((sale) => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const matchesSearch = 
      searchRegex.test(sale.id) ||
      searchRegex.test(sale.cliente || '') ||
      searchRegex.test(sale.metodoPago);
    
    const saleDate = new Date(sale.fecha);
    const matchesStartDate = !startDate || saleDate >= new Date(startDate);
    const matchesEndDate = !endDate || saleDate <= new Date(endDate + 'T23:59:59');
    const matchesVendedor = !vendedorFilter || sale.vendedor === vendedorFilter;
    const matchesSucursal = !sucursalFilter || sale.sucursal === sucursalFilter;
    
    return matchesSearch && matchesStartDate && matchesEndDate && matchesVendedor && matchesSucursal;
  });

  // Ordenar ventas
  const filteredAndSortedSales = [...filteredSales].sort((a, b) => {
    if (sortField === 'fecha') {
      return sortDirection === 'asc'
        ? new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        : new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    }
    if (sortField === 'total') {
      return sortDirection === 'asc'
        ? a.total - b.total
        : b.total - a.total;
    }
    return sortDirection === 'asc'
      ? String(a[sortField as keyof Sale]).localeCompare(String(b[sortField as keyof Sale]))
      : String(b[sortField as keyof Sale]).localeCompare(String(a[sortField as keyof Sale]));
  });

  // Calculate totals for filtered sales
  const totalVentas = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      <div className="relative mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Registro de Ventas
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
            >
              <FileText className="h-5 w-5" />
              <span>Exportar PDF</span>
            </button>
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
        <p className="text-gray-600 text-lg">
          {filteredAndSortedSales.length} ventas encontradas • Total: S/ {totalVentas.toFixed(2)}
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-100/50 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Buscar por cliente o ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 group-hover:border-purple-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <input
              id="start_date"
              name="start_date"
              type="date"
              className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 group-hover:border-purple-300"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <input
              id="end_date"
              name="end_date"
              type="date"
              className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 group-hover:border-purple-300"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <select
              id="vendedor_filter"
              name="vendedor_filter"
              className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 group-hover:border-purple-300 appearance-none"
              value={vendedorFilter}
              onChange={(e) => setVendedorFilter(e.target.value)}
            >
              <option value="">Todos los vendedores</option>
              {vendedores.map((vendedor) => (
                <option key={vendedor?.id} value={vendedor?.id}>
                  {vendedor?.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="relative group">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <select
              id="sucursal_filter"
              name="sucursal_filter"
              className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 group-hover:border-purple-300 appearance-none"
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

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('id')}
                  >
                    <span>ID</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('cliente')}
                  >
                    <span>Cliente</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left">
                  <button
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('vendedor')}
                  >
                    <span>Vendedor</span>
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
                    onClick={() => handleSort('fecha')}
                  >
                    <span>Fecha</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('total')}
                  >
                    <span>Total</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left">
                  <button
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('metodoPago')}
                  >
                    <span>Método</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {filteredAndSortedSales.map((sale) => {
                const sucursal = sucursales.find(s => s.id === sale.sucursal);
                const vendedor = users.find(u => u.id === sale.vendedor);
                
                const getMetodoPagoStyle = (metodo: string) => {
                  const styles: Record<string, string> = {
                    efectivo: 'bg-green-100 text-green-700',
                    tarjeta: 'bg-blue-100 text-blue-700',
                    transferencia: 'bg-purple-100 text-purple-700',
                    yape: 'bg-pink-100 text-pink-700',
                    fiado: 'bg-orange-100 text-orange-700'
                  };
                  
                  return styles[metodo.toLowerCase()] || 'bg-gray-100 text-gray-700';
                };

                return (
                  <tr key={`${sale.id}-${sale.fecha.toString()}`} className="hover:bg-indigo-50/30 transition-colors duration-150">
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{sale.id}</td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">{sale.cliente}</td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">{vendedor?.nombre || sale.vendedor}</td>
                    <td className="hidden md:table-cell px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">{sucursal?.nombre || 'N/A'}</td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                      {format(new Date(sale.fecha), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      S/ {sale.total.toFixed(2)}
                    </td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getMetodoPagoStyle(sale.metodoPago)}`}>
                        {sale.metodoPago.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      <div className="flex space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleGenerateDocument(sale, 'boleta')}
                          className="p-1 sm:p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                          title="Generar Boleta"
                        >
                          <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        {currentUser?.permisos?.includes('restaurar_stock') && (
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="p-1 sm:p-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                            title="Restaurar Stock"
                          >
                            <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
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
    </div>
  );
};