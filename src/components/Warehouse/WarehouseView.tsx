import React, { useState } from 'react';
import { Product, Warehouse, BusinessConfig, Sucursal } from '../../types';
import { Package, AlertTriangle, Search, ArrowUpDown, Filter, BarChart2, ShoppingBag } from 'lucide-react';

interface WarehouseViewProps {
  warehouse: Warehouse;
  products: Product[];
  config: BusinessConfig;
  sucursales: Sucursal[];
}

type StockStatus = 'bajo' | 'critico' | 'normal';

export const WarehouseView = ({ 
  warehouse, 
  products = [], 
  config, 
  sucursales = []
}: WarehouseViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Product>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState('');

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStockStatus = (product: Product): StockStatus => {
    const stockActual = Number(product.stock);
    const stockMinimo = Number(product.stockMinimo);
    
    console.log('---------------------');
    console.log(`Producto: ${product.nombre}`);
    console.log(`Stock Actual: ${stockActual}`);
    console.log(`Stock Mínimo: ${stockMinimo}`);
    console.log(`Stock Crítico Min: ${stockMinimo + 1}`);
    console.log(`Stock Crítico Max: ${stockMinimo + 2}`);
    
    // Stock Bajo: Cuando el stock es igual o menor al mínimo
    if (stockActual <= stockMinimo) {
      console.log('Estado: BAJO (stock <= mínimo)');
      return 'bajo';
    }
    
    // Stock Crítico: Cuando el stock es mínimo + 1 o mínimo + 2
    const stockCriticoMin = stockMinimo + 1;
    const stockCriticoMax = stockMinimo + 2;
    if (stockActual === stockCriticoMin || stockActual === stockCriticoMax) {
      console.log('Estado: CRÍTICO (stock = mínimo + 1 o mínimo + 2)');
      return 'critico';
    }
    
    // En Stock: Cuando el stock es mayor al mínimo + 2
    console.log('Estado: NORMAL (stock > mínimo + 2)');
    return 'normal';
  };

  const getStockStatusColor = (status: StockStatus): string => {
    switch (status) {
      case 'bajo':
        return 'bg-red-100 text-red-800';
      case 'critico':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-green-100 text-green-800';
    }
  };

  const getStockStatusText = (status: StockStatus): string => {
    switch (status) {
      case 'bajo':
        return 'Stock Bajo';
      case 'critico':
        return 'Stock Crítico';
      case 'normal':
        return 'En Stock';
    }
  };

  const filteredProducts = products
    .filter(product => 
      (product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
       product.codigo.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!showLowStock || getStockStatus(product) === 'bajo') &&
      (!selectedSucursal || product.sucursal === selectedSucursal)
    )
    .sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      }
      return a[sortField] < b[sortField] ? 1 : -1;
    });

  const lowStockProducts = products.filter(product => getStockStatus(product) === 'bajo');
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalProducts = products.length;
  const stockBajoPercentage = (lowStockProducts.length / totalProducts) * 100;

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="relative mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-4xl font-bold text-blue-600">
            Almacén: {warehouse.nombre}
          </h1>
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
        <p className="text-gray-600 text-lg">
          Gestiona tu inventario de manera eficiente
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Stock Total</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {totalStock}
              </p>
              <p className="text-xs text-gray-500 mt-1">unidades</p>
            </div>
            <Package className="h-10 w-10 text-indigo-600" />
          </div>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600"></div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Productos</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {totalProducts}
              </p>
              <p className="text-xs text-gray-500 mt-1">productos registrados</p>
            </div>
            <ShoppingBag className="h-10 w-10 text-blue-600" />
          </div>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600"></div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Stock Bajo</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                {lowStockProducts.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">productos</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-red-400 via-rose-500 to-red-600"></div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">% Stock Bajo</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                {stockBajoPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">del total</p>
            </div>
            <BarChart2 className="h-10 w-10 text-amber-600" />
          </div>
          <div className="h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600"></div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-100/50 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <input
              type="text"
              id="searchProduct"
              name="searchProduct"
              placeholder="Buscar por nombre o código..."
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <select
              id="sucursalFilter"
              name="sucursalFilter"
              className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 appearance-none"
              value={selectedSucursal}
              onChange={(e) => setSelectedSucursal(e.target.value)}
            >
              <option value="">Todas las sucursales</option>
              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <label htmlFor="showLowStock" className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                id="showLowStock"
                name="showLowStock"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-2 focus:ring-purple-400 border-purple-200"
              />
              <span className="text-gray-700">Mostrar solo stock bajo</span>
            </label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByCode"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('codigo')}
                    aria-label="Ordenar por código"
                  >
                    <span>Código</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByProduct"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('nombre')}
                    aria-label="Ordenar por nombre de producto"
                  >
                    <span>Producto</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByBranch"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('sucursal')}
                    aria-label="Ordenar por sucursal"
                  >
                    <span>Sucursal</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByStock"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('stock')}
                    aria-label="Ordenar por stock actual"
                  >
                    <span>Stock Actual</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <button
                    id="sortByMinStock"
                    className="flex items-center space-x-1 text-xs font-medium text-indigo-600 uppercase tracking-wider"
                    onClick={() => handleSort('stockMinimo')}
                    aria-label="Ordenar por stock mínimo"
                  >
                    <span>Stock Mínimo</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {filteredProducts.map((product) => {
                const sucursal = sucursales.find(s => s.id === product.sucursal);
                return (
                  <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                    <td className="px-4 sm:px-6 py-2 sm:py-4 text-sm font-medium text-gray-900">
                      {product.codigo}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.categoria}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 text-sm text-gray-600">
                      {sucursal?.nombre || 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {product.stock}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 text-sm text-gray-600">
                      {product.stockMinimo}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStockStatusColor(getStockStatus(product))}`}>
                          {getStockStatusText(getStockStatus(product))}
                        </span>
                        {(getStockStatus(product) === 'bajo' || getStockStatus(product) === 'critico') && (
                          <AlertTriangle className={`h-4 w-4 ${
                            getStockStatus(product) === 'bajo' ? 'text-red-500' : 'text-orange-500'
                          }`} />
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