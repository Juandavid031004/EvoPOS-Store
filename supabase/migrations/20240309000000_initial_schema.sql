-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  rol TEXT NOT NULL,
  sucursal_id UUID NOT NULL,
  permisos TEXT[] NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  business_email TEXT NOT NULL,
  UNIQUE(business_email, username),
  UNIQUE(business_email, email)
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  costo DECIMAL(10,2) NOT NULL,
  categoria TEXT,
  sucursal_id UUID NOT NULL,
  stock INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5,
  imagen TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  business_email TEXT NOT NULL,
  UNIQUE(business_email, codigo)
);

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID,
  vendedor_id UUID NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago TEXT NOT NULL,
  sucursal_id UUID NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  business_email TEXT NOT NULL
);

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  puntos INTEGER DEFAULT 0,
  total_gastado DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  business_email TEXT NOT NULL
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descripcion TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  tipo TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  comprobante TEXT,
  sucursal_id UUID NOT NULL,
  responsable TEXT NOT NULL,
  estado TEXT NOT NULL,
  observaciones TEXT,
  business_email TEXT NOT NULL
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  ruc TEXT NOT NULL,
  direccion TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  contacto TEXT NOT NULL,
  productos TEXT[] NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  business_email TEXT NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID NOT NULL REFERENCES suppliers(id),
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  estado TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  observaciones TEXT,
  sucursal_id UUID NOT NULL,
  business_email TEXT NOT NULL
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

CREATE TABLE sucursales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  encargado TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  business_email TEXT NOT NULL
);

-- Create indexes
CREATE INDEX idx_users_business_email ON users(business_email);
CREATE INDEX idx_products_business_email ON products(business_email);
CREATE INDEX idx_sales_business_email ON sales(business_email);
CREATE INDEX idx_customers_business_email ON customers(business_email);
CREATE INDEX idx_expenses_business_email ON expenses(business_email);
CREATE INDEX idx_suppliers_business_email ON suppliers(business_email);
CREATE INDEX idx_orders_business_email ON orders(business_email);
CREATE INDEX idx_sucursales_business_email ON sucursales(business_email);

-- Add RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;

-- Create policies for each table

-- Users table policy
CREATE POLICY "Users belong to business" ON users
  FOR ALL USING (business_email = auth.jwt()->>'business_email');

-- Products table policy
CREATE POLICY "Products belong to business" ON products
  FOR ALL USING (business_email = auth.jwt()->>'business_email');

-- Sales table policy
CREATE POLICY "Sales belong to business" ON sales
  FOR ALL USING (business_email = auth.jwt()->>'business_email');

-- Sale items table policy
CREATE POLICY "Sale items belong to business sales" ON sale_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.business_email = auth.jwt()->>'business_email'
    )
  );

-- Customers table policy
CREATE POLICY "Customers belong to business" ON customers
  FOR ALL USING (business_email = auth.jwt()->>'business_email');

-- Expenses table policy
CREATE POLICY "Expenses belong to business" ON expenses
  FOR ALL USING (business_email = auth.jwt()->>'business_email');

-- Suppliers table policy
CREATE POLICY "Suppliers belong to business" ON suppliers
  FOR ALL USING (business_email = auth.jwt()->>'business_email');

-- Orders table policy
CREATE POLICY "Orders belong to business" ON orders
  FOR ALL USING (business_email = auth.jwt()->>'business_email');

-- Order items table policy
CREATE POLICY "Order items belong to business orders" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.business_email = auth.jwt()->>'business_email'
    )
  );

-- Sucursales table policy
CREATE POLICY "Sucursales belong to business" ON sucursales
  FOR ALL USING (business_email = auth.jwt()->>'business_email');

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
