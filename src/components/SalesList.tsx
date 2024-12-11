import React, { useState } from 'react';
import { Sale, Product, BusinessConfig, User, Sucursal } from '../types';
import { Search, Calendar, Filter, FileText, Receipt, Trash2, Download, Building2, ArrowUpDown } from 'lucide-react';
import { generateDocument, generateSalesReport } from '../utils/documentGenerator';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

const POINTS_PER_UNIT = 0.1; // 1 punto por cada S/ 10 gastados

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

export const SalesList = ({ 
  sales = [], 
  products = [], 
  config, 
  currentUser, 
  sucursales = [],
  users = [],
  onDeleteSale,
  onUpdateProduct
}: SalesListProps) => {
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

  const handleDeleteSale = async (saleId: string) => {
    try {
      const sale = sales.find(s => s.id === saleId);
      if (!sale) {
        toast.error('No se encontró la venta');
        return;
      }

      const message = `¿Está seguro de eliminar la venta #${saleId}?\n\nDetalles de la venta:\n- Cliente: ${sale.cliente}\n- Total: S/ ${sale.total.toFixed(2)}\n\nEsta acción:\n- Revertirá el stock de los productos\n- ${sale.metodoPago.toLowerCase() === 'fiado' ? 'Eliminará la deuda del cliente\n-' : ''} No se puede deshacer`;

      if (window.confirm(message)) {
        // Validar que los productos existan antes de restaurar stock
        const invalidProducts = sale.productos.filter(item => !products.find(p => p.id === item.productoId));
        if (invalidProducts.length > 0) {
          toast.error('Error: Algunos productos de la venta ya no existen');
          return;
        }

        // Si la venta fue fiada, eliminar o actualizar la deuda
        if (sale.metodoPago.toLowerCase() === 'fiado') {
          try {
            const { error } = await supabase
              .from('deudas')
              .delete()
              .match({ venta_id: saleId });

            if (error) throw error;
            toast.success('Deuda eliminada correctamente');
          } catch (error) {
            console.error('Error al eliminar la deuda:', error);
            toast.error('Error al eliminar la deuda');
            return;
          }
        }

        // Si hay un cliente asociado, reducir sus puntos y total gastado
        if (sale.clienteId) {
          try {
            const { data: customer, error: customerError } = await supabase
              .from('customers')
              .select('*')
              .eq('id', sale.clienteId)
              .single();

            if (customerError) throw customerError;

            // Calcular puntos a reducir (usando la misma fórmula que al crear la venta)
            const pointsToReduce = Math.floor(sale.total * POINTS_PER_UNIT);

            const { error: updateError } = await supabase
              .from('customers')
              .update({
                puntos: Math.max(0, customer.puntos - pointsToReduce), // Evitar puntos negativos
                total_gastado: Math.max(0, customer.total_gastado - sale.total) // Evitar total gastado negativo
              })
              .eq('id', sale.clienteId);

            if (updateError) throw updateError;
            toast.success('Puntos y total gastado del cliente actualizados');
          } catch (error) {
            console.error('Error al actualizar cliente:', error);
            toast.error('Error al actualizar puntos del cliente');
            return;
          }
        }

        // Restaurar el stock de los productos
        for (const item of sale.productos) {
          const product = products.find(p => p.id === item.productoId);
          if (product) {
            const newStock = product.stock + item.cantidad;
            await onUpdateProduct(product.id, newStock);
            toast.success(`Stock restaurado: ${product.nombre} (+${item.cantidad})`);
          }
        }

        onDeleteSale(saleId);
        toast.success('Venta eliminada exitosamente', {
          duration: 4000,
          icon: '🗑️'
        });
      }
    } catch (error) {
      console.error('Error al eliminar la venta:', error);
      toast.error('Ocurrió un error al eliminar la venta');
    }
  };

  const handleGenerateDocument = async (sale: Sale, type: 'factura' | 'boleta') => {
    try {
      await generateDocument({ type, sale, products, config });
      toast.success(`${type === 'factura' ? 'Factura' : 'Boleta'} generada exitosamente`);
    } catch (error) {
      console.error('Error generando documento:', error);
      toast.error('Error al generar el documento');
    }
  };

  const handleExportPDF = async () => {
    if (!currentUser.permisos.includes('ver_reportes')) {
      toast.error('No tiene permisos para descargar reportes');
      return;
    }

    try {
      await generateSalesReport({ 
        sales: filteredSales, 
        products, 
        expenses: [], 
        config 
      });
      toast.success('Reporte de ventas generado exitosamente');
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast.error('Error al generar el reporte');
    }
  };

  // Get unique vendedores with names
  const vendedores = Array.from(new Set(
    sales.map(sale => sale.vendedor)
  )).map(vendedorId => {
    const user = users.find(u => u.id === vendedorId);
    return user ? { id: user.id, nombre: user.nombre } : null;
  }).filter(Boolean);

  // Filtrar ventas
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const saleDate = new Date(sale.fecha);
    const matchesStartDate = !startDate || saleDate >= new Date(startDate);
    const matchesEndDate = !endDate || saleDate <= new Date(endDate + 'T23:59:59');
    const matchesVendedor = !vendedorFilter || sale.vendedor === vendedorFilter;
    const matchesSucursal = !sucursalFilter || sale.sucursal === sucursalFilter;
    
    return matchesSearch && matchesStartDate && matchesEndDate && matchesVendedor && matchesSucursal;
  });

  // Ordenar ventas
  const sortedSales = [...filteredSales].sort((a, b) => {
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
      ? String(a[sortField]).localeCompare(String(b[sortField]))
      : String(b[sortField]).localeCompare(String(a[sortField]));
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
          {filteredSales.length} ventas encontradas
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
            <label htmlFor="start_date" className="sr-only">Fecha inicial</label>
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
            <label htmlFor="end_date" className="sr-only">Fecha final</label>
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
            <label htmlFor="vendedor_filter" className="sr-only">Filtrar por vendedor</label>
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
            <label htmlFor="sucursal_filter" className="sr-only">Filtrar por sucursal</label>
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
              {sortedSales.map((sale) => {
                const sucursal = sucursales.find(s => s.id === sale.sucursal);
                const vendedor = users.find(u => u.id === sale.vendedor);
                
                const getMetodoPagoStyle = (metodo: string) => {
                  const styles = {
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
                          onClick={() => handleGenerateDocument(sale, 'factura')}
                          className="p-1 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                          title="Generar Factura"
                        >
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => handleGenerateDocument(sale, 'boleta')}
                          className="p-1 sm:p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                          title="Generar Boleta"
                        >
                          <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        {currentUser.permisos.includes('ver_ventas') && (
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="p-1 sm:p-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                            title="Eliminar venta"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
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
}