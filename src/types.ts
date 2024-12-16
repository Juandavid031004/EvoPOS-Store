// Tipos base
export type Permission = 
  | 'crear_venta'
  | 'ver_ventas'
  | 'anular_venta'
  | 'aplicar_descuentos'
  | 'gestionar_productos'
  | 'ver_productos'
  | 'modificar_precios'
  | 'gestionar_almacen'
  | 'gestionar_devoluciones'
  | 'ajustar_stock'
  | 'gestionar_clientes'
  | 'ver_clientes'
  | 'gestionar_deudas'
  | 'gestionar_puntos'
  | 'ver_reportes'
  | 'exportar_reportes'
  | 'ver_dashboard'
  | 'ver_estadisticas'
  | 'gestionar_usuarios'
  | 'gestionar_sucursales'
  | 'gestionar_gastos'
  | 'ver_configuracion'
  | 'configurar_sistema'
  | 'gestionar_pedidos'
  | 'gestionar_proveedores'
  | 'ver_proveedores'
  | 'eliminar_proveedores'
  | 'ver_pedidos'
  | 'actualizar_pedidos'
  | 'eliminar_pedidos'
  | 'ver_gastos'
  | 'eliminar_gastos'
  | 'transferir_stock'
  | 'restaurar_stock';

export type UserRole = 'admin' | 'vendedor' | 'almacen';

export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Ventas
    'crear_venta', 'ver_ventas', 'anular_venta', 'aplicar_descuentos',
    // Productos
    'gestionar_productos', 'ver_productos', 'modificar_precios',
    'gestionar_almacen', 'gestionar_devoluciones', 'ajustar_stock',
    // Clientes
    'gestionar_clientes', 'ver_clientes', 'gestionar_deudas', 'gestionar_puntos',
    // Reportes
    'ver_reportes', 'exportar_reportes', 'ver_dashboard', 'ver_estadisticas',
    // Administración
    'gestionar_usuarios', 'gestionar_sucursales',
    'ver_configuracion', 'configurar_sistema',
    // Gastos (Asegurando que estén todos los permisos)
    'gestionar_gastos', 'ver_gastos', 'eliminar_gastos',
    // Proveedores (Asegurando que estén todos los permisos)
    'gestionar_proveedores', 'ver_proveedores', 'eliminar_proveedores',
    // Pedidos (Asegurando que estén todos los permisos)
    'gestionar_pedidos', 'ver_pedidos', 'actualizar_pedidos', 'eliminar_pedidos',
    // Otros
    'transferir_stock', 'restaurar_stock'
  ],
  vendedor: [
    'crear_venta', 'ver_ventas', 'aplicar_descuentos',
    'ver_productos', 'ver_clientes', 'gestionar_puntos',
    'ver_dashboard',
    'ver_proveedores',
    'ver_pedidos',
    'ver_gastos'
  ],
  almacen: [
    'gestionar_productos', 'ver_productos', 'ajustar_stock',
    'gestionar_almacen', 'gestionar_devoluciones', 'gestionar_pedidos',
    'ver_dashboard',
    'ver_proveedores',
    'ver_pedidos', 'actualizar_pedidos',
    'transferir_stock'
  ]
};

export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  costo: number;
  categoria: string;
  sucursal: string;
  stock: number;
  stockMinimo: number;
  imagen: string;
  createdAt: Date;
}

export interface Sale {
  id: string;
  productos: SaleItem[];
  cliente: string;
  clienteId?: string;
  vendedor: string;
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: MetodoPago;
  sucursal: string;
  fecha: Date;
}

export interface SaleItem {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  costo_historico: number;
}

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'yape' | 'fiado';

export interface Return {
  id: string;
  productoId: string;
  cantidad: number;
  motivo: string;
  proveedor: string;
  estado: 'pendiente' | 'procesado' | 'rechazado';
  sucursal: string;
  fecha: Date;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  puntos: number;
  totalGastado: number;
  createdAt: Date;
}

export interface Deuda {
  id: string;
  clienteId: string;
  fecha: Date;
  productos: SaleItem[];
  total: number;
  pagos: Pago[];
  estado: 'pendiente' | 'pagado';
  observaciones?: string;
}

export interface Pago {
  monto: number;
  fecha: Date;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  nombre?: string;
  rol: UserRole;
  sucursal: string;
  permisos: Permission[];
  activo: boolean;
}

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  encargado: string;
  activo: boolean;
  createdAt: Date;
}

export interface BusinessConfig {
  nombre: string;
  razonSocial?: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  sitioWeb?: string;
  logo?: string;
  stockMinimo: number;
  moneda: string;
  simboloMoneda: string;
  pointsPerUnit: number;
}

export interface AuthState {
  user: {
    id: string;
    email: string;
    nombre?: string;
    rol: UserRole;
    permisos: Permission[];
  } | null;
  isAuthenticated: boolean;
}

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  tipo: TipoGasto;
  fecha: Date;
  comprobante?: string;
  sucursal: string;
  responsable: string;
  estado: 'pendiente' | 'pagado';
  observaciones?: string;
  createdAt?: Date;
}

export type TipoGasto = 'servicios' | 'salarios' | 'mantenimiento' | 'inventario' | 'marketing' | 'impuestos' | 'alquiler' | 'transporte' | 'suministros' | 'otros';

export interface Warehouse {
  id: string;
  nombre: string;
  ubicacion: string;
  capacidad: number;
  stockActual: number;
}

export interface Order {
  id: string;
  proveedorId: string;
  productos: OrderItem[];
  fecha: Date;
  fechaEntrega?: Date;
  estado: 'pendiente' | 'recibido' | 'cancelado';
  total: number;
  observaciones?: string;
  sucursal: string;
  createdAt: Date;
}

export interface OrderItem {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Supplier {
  id: string;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  productos: string[];
  activo: boolean;
  createdAt: Date;
}