import React, { useState } from 'react';
import { Trash2, Plus, Package } from 'lucide-react';
import { Order, Product, Supplier, OrderItem } from '../../types';
import toast from 'react-hot-toast';

interface OrderFormProps {
  order?: Order;
  products: Product[];
  suppliers: Supplier[];
  currentUserSucursal: string;
  onSubmit: (orderData: Omit<Order, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const OrderForm = ({ 
  order, 
  products, 
  suppliers, 
  currentUserSucursal,
  onSubmit, 
  onClose 
}: OrderFormProps) => {
  const [formData, setFormData] = useState({
    proveedorId: order?.proveedorId || '',
    productos: order?.productos || [] as OrderItem[],
    fechaEntrega: order?.fechaEntrega ? new Date(order.fechaEntrega).toISOString().split('T')[0] : '',
    estado: order?.estado || 'pendiente' as const,
    observaciones: order?.observaciones || '',
    sucursal: currentUserSucursal
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  const handleAddProduct = () => {
    if (!selectedProduct || quantity <= 0 || price <= 0) {
      toast.error('Complete todos los campos del producto');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }

    const newItem: OrderItem = {
      productoId: selectedProduct,
      cantidad: quantity,
      precioUnitario: price,
      subtotal: quantity * price
    };

    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, newItem]
    }));

    setSelectedProduct('');
    setQuantity(1);
    setPrice(0);
    toast.success('Producto agregado al pedido');
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index)
    }));
    toast.success('Producto eliminado del pedido');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.proveedorId) {
        toast.error('Seleccione un proveedor');
        return;
      }

      if (formData.productos.length === 0) {
        toast.error('Debe agregar al menos un producto');
        return;
      }

      const total = formData.productos.reduce((sum, item) => sum + item.subtotal, 0);

      const orderData = {
        ...formData,
        total,
        fecha: new Date(),
        fechaEntrega: formData.fechaEntrega ? new Date(formData.fechaEntrega) : undefined
      };

      onSubmit(orderData);
      
      setFormData({
        proveedorId: '',
        productos: [],
        fechaEntrega: '',
        estado: 'pendiente',
        observaciones: '',
        sucursal: currentUserSucursal
      });
      
      setSelectedProduct('');
      setQuantity(1);
      setPrice(0);

    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast.error('Error al procesar el pedido');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="orderForm" name="orderForm">
      <div>
        <label htmlFor="proveedorId" className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
        <select
          id="proveedorId"
          name="proveedorId"
          required
          aria-label="Seleccionar proveedor"
          className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
          value={formData.proveedorId}
          onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
        >
          <option value="" id="proveedor-empty">Seleccionar proveedor</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id} id={`supplier-${supplier.id}`}>
              {supplier.nombre} - {supplier.ruc}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center space-x-3 mb-4">
          <Package className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          <h4 className="font-medium text-gray-900">Agregar Productos</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="selectedProduct" className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <select
              id="selectedProduct"
              name="selectedProduct"
              aria-label="Seleccionar producto para agregar"
              className="p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="" id="producto-empty">Seleccionar producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id} id={`product-${product.id}`}>
                  {product.nombre} - Stock: {product.stock}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              aria-label="Cantidad del producto"
              placeholder="Cantidad"
              className="p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Precio unitario</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              aria-label="Precio unitario del producto"
              placeholder="Precio unitario"
              className="p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
        </div>
        
        <button
          type="button"
          id="addProductButton"
          name="addProductButton"
          onClick={handleAddProduct}
          aria-label="Agregar producto al pedido"
          className="w-full flex items-center justify-center space-x-2 p-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Agregar Producto</span>
        </button>

        {formData.productos.length > 0 && (
          <div className="mt-6 space-y-4">
            <h5 className="font-medium text-gray-900 mb-2">Productos en el pedido:</h5>
            <div className="bg-white rounded-lg border border-purple-100 divide-y divide-purple-100">
              {formData.productos.map((item, index) => {
                const product = products.find(p => p.id === item.productoId);
                return (
                  <div key={index} className="flex justify-between items-center p-4 hover:bg-indigo-50/30 transition-colors duration-150">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product?.nombre}</div>
                      <div className="text-sm text-gray-500">
                        {item.cantidad} x S/ {item.precioUnitario.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        S/ {item.subtotal.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        id={`removeProduct-${index}`}
                        name={`removeProduct-${index}`}
                        onClick={() => handleRemoveProduct(index)}
                        aria-label={`Eliminar ${product?.nombre} del pedido`}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors duration-200 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fechaEntrega" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega</label>
          <input
            id="fechaEntrega"
            name="fechaEntrega"
            type="date"
            aria-label="Fecha de entrega del pedido"
            className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
            value={formData.fechaEntrega}
            onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            id="estado"
            name="estado"
            required
            aria-label="Estado del pedido"
            className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value as Order['estado'] })}
          >
            <option value="pendiente" id="estado-pendiente">Pendiente</option>
            <option value="recibido" id="estado-recibido">Recibido</option>
            <option value="cancelado" id="estado-cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
        <textarea
          id="observaciones"
          name="observaciones"
          aria-label="Observaciones del pedido"
          className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
          rows={3}
          value={formData.observaciones}
          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          placeholder="Opcional"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          id="cancelButton"
          name="cancelButton"
          onClick={onClose}
          aria-label="Cancelar pedido"
          className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          id="submitButton"
          name="submitButton"
          aria-label={order ? 'Actualizar pedido' : 'Crear pedido'}
          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          {order ? 'Actualizar' : 'Crear'} Pedido
        </button>
      </div>
    </form>
  );
};