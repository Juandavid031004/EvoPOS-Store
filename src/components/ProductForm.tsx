import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Product, Sucursal } from '../types';
import toast from 'react-hot-toast';
import { guardarProducto, actualizarProducto } from '../services/firebase';

interface ProductFormProps {
  product?: Product;
  onSubmit: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  sucursales: Sucursal[];
  currentEmail: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onClose,
  sucursales,
  currentEmail
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt'>>({
    codigo: product?.codigo || '',
    nombre: product?.nombre || '',
    descripcion: product?.descripcion || '',
    categoria: product?.categoria || '',
    precio: product?.precio || 0,
    stock: product?.stock || 0,
    stockMinimo: product?.stockMinimo || 5,
    sucursal: product?.sucursal || '',
    costo: product?.costo || 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio' || name === 'stock' || name === 'stockMinimo' || name === 'costo'
        ? Number(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (product) {
        await actualizarProducto(currentEmail, product.id, formData);
        toast.success('Producto actualizado', {
          icon: '✏️',
          duration: 2000
        });
      } else {
        await guardarProducto(currentEmail, formData);
        toast.success('Producto agregado', {
          icon: '✨',
          duration: 2000
        });
      }
      onClose();
      onSubmit(formData);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar el producto', {
        icon: '❌',
        duration: 3000
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <button
              id="closeProductFormBtn"
              name="closeProductFormBtn"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
                  Código *
                </label>
                <input
                  id="codigo"
                  name="codigo"
                  type="text"
                  value={formData.codigo}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <input
                  id="categoria"
                  name="categoria"
                  type="text"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="sucursal" className="block text-sm font-medium text-gray-700 mb-1">
                  Sucursal *
                </label>
                <select
                  id="sucursal"
                  name="sucursal"
                  value={formData.sucursal}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  required
                >
                  <option value="">Seleccione una sucursal</option>
                  {sucursales.map(sucursal => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio *
                </label>
                <input
                  id="precio"
                  name="precio"
                  type="number"
                  value={formData.precio}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="costo" className="block text-sm font-medium text-gray-700 mb-1">
                  Costo
                </label>
                <input
                  id="costo"
                  name="costo"
                  type="number"
                  value={formData.costo}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="stockMinimo" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Mínimo
                </label>
                <input
                  id="stockMinimo"
                  name="stockMinimo"
                  type="number"
                  value={formData.stockMinimo}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                id="cancelProductBtn"
                name="cancelProductBtn"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="submitProductBtn"
                name="submitProductBtn"
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                {product ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};