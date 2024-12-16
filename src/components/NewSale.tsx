import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Product, User, Sale, SaleItem, MetodoPago, Sucursal, Cliente } from '../types';
import toast from 'react-hot-toast';

interface NewSaleProps {
  products: Product[];
  users: User[];
  sucursales: Sucursal[];
  customers: Cliente[];
  currentUser: User;
  onCompleteSale: (sale: Omit<Sale, 'id' | 'fecha'>) => void;
  onUpdateProduct: (productId: string, newStock: number) => void;
  onUpdateCustomer: (id: string, customer: Partial<Cliente>) => void;
}

export const NewSale: React.FC<NewSaleProps> = ({ 
  products, 
  users = [], 
  sucursales = [], 
  customers = [], 
  currentUser,
  onCompleteSale,
  onUpdateProduct,
  onUpdateCustomer
}) => {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [vendedor, setVendedor] = useState(currentUser.id);
  const [sucursal, setSucursal] = useState(currentUser.sucursal);
  const [descuento, setDescuento] = useState(0);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Puntos por cada sol gastado
  const POINTS_PER_UNIT = 1;

  // Filtrar productos por sucursal del usuario
  const availableProducts = products.filter(p => p.sucursal === currentUser.sucursal);

  useEffect(() => {
    if (metodoPago === 'fiado' && !selectedCustomer) {
      toast.error('Debe seleccionar un cliente para ventas al fiado');
    }
  }, [metodoPago, selectedCustomer]);

  const handleBarcodeSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const product = availableProducts.find(p => p.codigo === barcodeInput);
      if (product) {
        if (product.stock <= 0) {
          toast.error(`No hay stock disponible para ${product.nombre}`);
          return;
        }

        const existingItemIndex = items.findIndex(item => item.productoId === product.id);
        if (existingItemIndex >= 0) {
          const newItems = [...items];
          const newQuantity = newItems[existingItemIndex].cantidad + 1;
          
          if (newQuantity > product.stock) {
            toast.error(`Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`);
            return;
          }

          newItems[existingItemIndex].cantidad = newQuantity;
          newItems[existingItemIndex].subtotal = newQuantity * newItems[existingItemIndex].precioUnitario;
          setItems(newItems);
        } else {
          setItems([
            ...items,
            {
              productoId: product.id,
              cantidad: 1,
              precioUnitario: product.precio,
              costo_historico: product.costo,
              subtotal: product.precio
            }
          ]);
        }
        setBarcodeInput('');
        toast.success(`${product.nombre} agregado`);
      } else {
        toast.error('Producto no encontrado');
      }
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productoId: '', cantidad: 1, precioUnitario: 0, costo_historico: 0, subtotal: 0 }]);
  };

  const handleUpdateItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'productoId') {
      const product = availableProducts.find(p => p.id === value);
      if (product) {
        if (product.stock <= 0) {
          toast.error(`No hay stock disponible para ${product.nombre}`);
          return;
        }
        item.precioUnitario = product.precio;
        item.costo_historico = product.costo;
        item.subtotal = product.precio * item.cantidad;
      }
    } else if (field === 'cantidad') {
      const cantidad = Number(value);
      const product = availableProducts.find(p => p.id === item.productoId);
      
      if (product) {
        if (cantidad > product.stock) {
          toast.error(`Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`);
          return;
        }
        item.cantidad = cantidad;
        item.subtotal = item.precioUnitario * cantidad;
      }
    }

    item[field] = value;
    newItems[index] = item;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (items.length === 0) {
        toast.error('Agregue al menos un producto');
        return;
      }

      if (metodoPago === 'fiado' && !selectedCustomer) {
        toast.error('Seleccione un cliente para venta al fiado');
        return;
      }

      // Validar y actualizar stock para TODOS los productos
      const stockUpdates = items.map(item => {
        const product = availableProducts.find(p => p.id === item.productoId);
        if (!product) {
          throw new Error(`Producto no encontrado: ${item.productoId}`);
        }
        
        const newStock = product.stock - item.cantidad;
        if (newStock < 0) {
          throw new Error(`Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`);
        }

        return {
          productId: product.id,
          newStock,
          productName: product.nombre,
          cantidad: item.cantidad
        };
      });

      // Si todas las validaciones pasan, actualizar stock de todos los productos
      stockUpdates.forEach(update => {
        onUpdateProduct(update.productId, update.newStock);
      });

      const customer = customers.find(c => c.id === selectedCustomer);
      const total = items.reduce((sum, item) => sum + item.subtotal, 0) - descuento;
      
      // Actualizar puntos del cliente si existe
      if (customer) {
        const newPoints = Math.floor(total * POINTS_PER_UNIT);
        const updatedCustomer = {
          ...customer,
          puntos: customer.puntos + newPoints,
          totalGastado: customer.totalGastado + total
        };
        onUpdateCustomer(customer.id, updatedCustomer);
        toast.success(`${newPoints} puntos agregados al cliente`);
      }

      // Completar venta
      await onCompleteSale({
        productos: items,
        cliente: customer?.nombre || 'Cliente Final',
        clienteId: selectedCustomer || undefined,
        vendedor,
        subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
        descuento,
        total,
        metodoPago,
        sucursal,
        business_email: currentUser.email
      });

      // Mostrar mensajes de éxito
      stockUpdates.forEach(update => {
        toast.success(`Stock actualizado: ${update.productName} (-${update.cantidad})`);
      });

      // Resetear formulario
      setItems([]);
      setSelectedCustomer('');
      setDescuento(0);
      setBarcodeInput('');
      setMetodoPago('efectivo');
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }

      toast.success('Venta completada exitosamente');
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar la venta');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      <div className="relative mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">Nueva Venta</h1>
        <p className="text-gray-600 text-lg">Gestiona tus ventas de manera eficiente</p>
        <div className="absolute top-0 right-0">
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Principal */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-100/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Cliente */}
            <div className="group">
              <label className="block text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-200">Cliente</label>
              <select
                className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 ${
                  metodoPago === 'fiado' && !selectedCustomer ? 'border-red-400 animate-pulse' : 'border-purple-200 group-hover:border-purple-400'
                }`}
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                required={metodoPago === 'fiado'}
              >
                <option value="">Cliente Final</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.nombre} - Puntos: {customer.puntos}
                  </option>
                ))}
              </select>
              {metodoPago === 'fiado' && !selectedCustomer && (
                <p className="text-sm text-red-500 mt-2 flex items-center animate-bounce">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Seleccione un cliente
                </p>
              )}
            </div>

            {/* Vendedor */}
            <div className="group">
              <label className="block text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-200">Vendedor</label>
              <input
                type="text"
                value={users.find(u => u.id === vendedor)?.nombre || ''}
                disabled
                className="w-full p-2.5 bg-purple-50/50 border border-purple-200 rounded-lg text-purple-700 font-medium group-hover:bg-purple-100/50 transition-all duration-200"
              />
            </div>

            {/* Sucursal */}
            <div className="group">
              <label className="block text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-200">Sucursal</label>
              <input
                type="text"
                value={sucursales.find(s => s.id === currentUser.sucursal)?.nombre || ''}
                disabled
                className="w-full p-2.5 bg-purple-50/50 border border-purple-200 rounded-lg text-purple-700 font-medium group-hover:bg-purple-100/50 transition-all duration-200"
              />
            </div>

            {/* Método de Pago */}
            <div className="group">
              <label className="block text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-200">Método de Pago</label>
              <select
                className="w-full p-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 group-hover:border-purple-400"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="yape">Yape</option>
                <option value="fiado">Fiado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Búsqueda por código de barras */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-indigo-800 mb-2">
                Buscar por Código de Barras
              </label>
              <div className="relative">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleBarcodeSearch}
                  className="w-full p-3 pl-10 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 placeholder-indigo-300"
                  placeholder="Escanee o ingrese el código de barras"
                />
                <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 self-end shadow-md hover:shadow-xl"
            >
              <Plus size={20} className="transform hover:rotate-180 transition-transform duration-300" />
              <span>Agregar Item</span>
            </button>
          </div>
        </div>

        {/* Lista de Items */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">Items de la Venta</h3>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-lg border border-indigo-100 hover:shadow-md transition-all duration-200">
                <div className="flex-1">
                  <select
                    value={item.productoId}
                    onChange={(e) => handleUpdateItem(index, 'productoId', e.target.value)}
                    className="w-full p-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                  >
                    <option value="">Seleccione un producto</option>
                    {availableProducts.map((product) => (
                      <option key={product.id} value={product.id} disabled={product.stock <= 0}>
                        {product.codigo} - {product.nombre} - Stock: {product.stock} - Precio: S/. {product.precio}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.cantidad}
                  onChange={(e) => handleUpdateItem(index, 'cantidad', Number(e.target.value))}
                  className="w-24 p-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                />
                <div className="w-32 text-right font-medium text-indigo-700">
                  S/. {item.subtotal.toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  className="p-2 text-red-500 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Totales y Descuento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
            <label className="block text-sm font-semibold text-indigo-800 mb-3">
              Descuento (S/.)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={descuento}
              onChange={(e) => setDescuento(Number(e.target.value))}
              className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
            />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
            <div className="space-y-3">
              <div className="flex justify-between text-indigo-600">
                <span className="font-medium">Subtotal:</span>
                <span>S/. {items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-indigo-600">
                <span className="font-medium">Descuento:</span>
                <span>- S/. {descuento.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent pt-2 border-t border-indigo-100">
                <span>Total:</span>
                <span>S/. {(items.reduce((sum, item) => sum + item.subtotal, 0) - descuento).toFixed(2)}</span>
              </div>
              {selectedCustomer && (
                <div className="mt-2 text-sm text-green-600 flex items-center bg-green-50 p-2 rounded-lg">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Puntos a ganar: {Math.floor((items.reduce((sum, item) => sum + item.subtotal, 0) - descuento) * POINTS_PER_UNIT)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón Completar Venta */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Completar Venta</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewSale;