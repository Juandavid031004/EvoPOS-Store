import React, { useState } from 'react';
import { Plus, Search, ArrowUpDown, Edit2, Trash2, AlertTriangle, Minus } from 'lucide-react';
import { Product, Sucursal } from '../types';
import toast from 'react-hot-toast';
import { ProductForm } from './ProductForm';

interface ProductListProps {
  products: Product[];
  sucursales: Sucursal[];
  onAddProduct: () => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProduct: (productId: string, updatedProduct: Partial<Product>) => void;
}

export const ProductList = ({ products, sucursales, onAddProduct, onUpdateStock, onDeleteProduct, onUpdateProduct }: ProductListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Product>('nombre');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [addingStock, setAddingStock] = useState<{id: string, cantidad: number, isAdding: boolean} | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStockChange = async (productId: string) => {
    if (!addingStock || addingStock.cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product) {
      const newStock = addingStock.isAdding 
        ? product.stock + addingStock.cantidad
        : product.stock - addingStock.cantidad;

      if (newStock < 0) {
        toast.error('No hay suficiente stock para realizar esta operación');
        return;
      }

      try {
        const updatedProduct: Partial<Product> = {
          ...product,
          stock: newStock
        };
        
        await onUpdateProduct(productId, updatedProduct);
        toast.success(`Se ${addingStock.isAdding ? 'agregaron' : 'restaron'} ${addingStock.cantidad} unidades ${addingStock.isAdding ? 'al' : 'del'} stock`);
        setAddingStock(null);
      } catch (error) {
        console.error('Error al actualizar el stock:', error);
        toast.error('Error al actualizar el stock');
      }
    }
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      onDeleteProduct(productId);
      toast.success('Producto eliminado exitosamente');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const filteredProducts = products
    .filter(product =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      }
      return a[sortField] < b[sortField] ? 1 : -1;
    });

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-black">
            Productos
          </h1>
          <p className="text-gray-500 text-base sm:text-lg">
            {filteredProducts.length} productos encontrados
          </p>
        </div>
        <div className="px-3 py-2 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg">
          <p className="text-xs sm:text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o categoría..."
            className="w-full pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={onAddProduct}
          className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-gray-800 to-black text-white rounded-xl hover:from-black hover:to-gray-900 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          <span>Agregar Producto</span>
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-indigo-50">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-indigo-50">
              <thead>
                <tr className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <th scope="col" className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <button
                      className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      onClick={() => handleSort('codigo')}
                    >
                      <span>Código</span>
                      <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <button
                      className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      onClick={() => handleSort('nombre')}
                    >
                      <span>Nombre</span>
                      <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <button
                      className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      onClick={() => handleSort('categoria')}
                    >
                      <span>Categoría</span>
                      <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <button
                      className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      onClick={() => handleSort('sucursal')}
                    >
                      <span>Sucursal</span>
                      <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <button
                      className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      onClick={() => handleSort('stock')}
                    >
                      <span>Stock</span>
                      <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <button
                      className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      onClick={() => handleSort('precio')}
                    >
                      <span>Precio</span>
                      <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <span className="text-xs sm:text-sm font-medium text-indigo-600">Estado</span>
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                    <span className="text-xs sm:text-sm font-medium text-indigo-600">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {filteredProducts.map((product) => {
                  const sucursal = sucursales.find(s => s.id === product.sucursal);
                  return (
                    <tr key={product.id} className="hover:bg-indigo-50/50 transition-colors duration-150">
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <span className="text-xs sm:text-sm font-medium text-gray-900 bg-indigo-100/50 px-2 py-1 rounded-md">
                          {product.codigo}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <div className="space-y-0.5 sm:space-y-1">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {product.nombre}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1 sm:line-clamp-2">
                            {product.descripcion}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <span className="text-xs sm:text-sm text-gray-600 bg-purple-100/50 px-2 py-1 rounded-md">
                          {product.categoria}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <span className="text-xs sm:text-sm text-gray-600">
                          {sucursal?.nombre || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-md ${
                            product.stock > (product.stockMinimo + 2)
                              ? 'text-green-700 bg-green-100/50' 
                              : product.stock > product.stockMinimo
                                ? 'text-yellow-700 bg-yellow-100/50'
                                : 'text-red-700 bg-red-100/50'
                          }`}>
                            {product.stock}
                          </span>
                          {addingStock?.id === product.id ? (
                            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm p-2 rounded-xl border border-indigo-100 shadow-sm animate-fade-in">
                              <div className="relative">
                                <input
                                  type="number"
                                  className="w-24 p-2 text-sm border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 pl-8"
                                  value={addingStock.cantidad}
                                  onChange={(e) => setAddingStock({
                                    ...addingStock,
                                    cantidad: parseInt(e.target.value) || 0
                                  })}
                                  min="1"
                                  placeholder="Cantidad"
                                />
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-indigo-400 text-sm">
                                  Ud.
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleStockChange(product.id)}
                                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200 group relative"
                                  title="Confirmar cambio de stock"
                                >
                                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                    Confirmar cambio
                                  </span>
                                  <span>✓</span>
                                </button>
                                <button
                                  onClick={() => setAddingStock(null)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 group relative"
                                  title="Cancelar"
                                >
                                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    Cancelar
                                  </span>
                                  ✕
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => setAddingStock({ id: product.id, cantidad: 1, isAdding: true })}
                                className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-all duration-200 group relative"
                                title="Agregar stock"
                              >
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                  Agregar stock
                                </span>
                                <Plus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setAddingStock({ id: product.id, cantidad: 1, isAdding: false })}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 group relative"
                                title="Reducir stock"
                              >
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                  Reducir stock
                                </span>
                                <Minus className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          S/ {product.precio.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock > (product.stockMinimo + 2)
                            ? 'bg-green-100 text-green-800' 
                            : product.stock > product.stockMinimo
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > (product.stockMinimo + 2)
                            ? 'En Stock' 
                            : product.stock > product.stockMinimo
                              ? 'Stock Crítico'
                              : 'Stock Bajo'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-full transition-colors duration-200"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors duration-200"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      <div className="mt-4 flex justify-center sm:justify-end">
        <nav className="flex items-center space-x-2">
          <button className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors duration-200">
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página 1 de 1
          </span>
          <button className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors duration-200">
            Siguiente
          </button>
        </nav>
      </div>

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSubmit={(updatedProduct) => {
            onUpdateProduct(editingProduct.id, updatedProduct);
            setEditingProduct(null);
            toast.success('Producto actualizado exitosamente');
          }}
          onClose={() => setEditingProduct(null)}
          sucursales={sucursales}
        />
      )}
    </div>
  );
};