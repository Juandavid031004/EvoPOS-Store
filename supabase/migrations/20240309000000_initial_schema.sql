-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de registros de auditoría
CREATE TABLE registro_auditoria (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    correo_negocio TEXT NOT NULL,
    nombre_tabla TEXT NOT NULL,
    registro_id UUID NOT NULL,
    accion TEXT NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    usuario_id UUID NOT NULL,
    correo_usuario TEXT NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

-- Crear tabla de usuarios
CREATE TABLE usuarios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    correo_negocio TEXT NOT NULL,
    correo TEXT NOT NULL,
    nombre TEXT NOT NULL,
    nombre_usuario TEXT NOT NULL,
    rol TEXT NOT NULL,
    sucursal_id UUID,
    permisos TEXT[] NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    creado_por UUID REFERENCES usuarios(id),
    actualizado_por UUID REFERENCES usuarios(id),
    UNIQUE(correo_negocio, nombre_usuario),
    UNIQUE(correo_negocio, correo)
);

-- Crear tabla de configuración del negocio
CREATE TABLE configuracion_negocio (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    correo_negocio TEXT NOT NULL UNIQUE,
    nombre_negocio TEXT NOT NULL,
    url_logo TEXT,
    moneda TEXT DEFAULT 'USD',
    tasa_impuesto DECIMAL(5,2) DEFAULT 0,
    tema TEXT DEFAULT 'light',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    creado_por UUID REFERENCES usuarios(id),
    actualizado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE productos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    correo_negocio TEXT NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    costo DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    categoria TEXT,
    codigo_barras TEXT,
    sucursal_id UUID,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    creado_por UUID REFERENCES usuarios(id),
    actualizado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE clientes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    correo_negocio TEXT NOT NULL,
    nombre TEXT NOT NULL,
    correo TEXT,
    telefono TEXT,
    direccion TEXT,
    puntos INTEGER DEFAULT 0,
    total_gastado DECIMAL(10,2) DEFAULT 0,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    creado_por UUID REFERENCES usuarios(id),
    actualizado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE ventas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    correo_negocio TEXT NOT NULL,
    cliente_id UUID REFERENCES clientes(id),
    vendedor_id UUID REFERENCES usuarios(id),
    sucursal_id UUID NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago TEXT,
    estado TEXT,
    productos JSONB NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    creado_por UUID REFERENCES usuarios(id),
    actualizado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE gastos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    correo_negocio TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    categoria TEXT,
    fecha DATE NOT NULL,
    sucursal_id UUID NOT NULL,
    url_comprobante TEXT,
    responsable TEXT NOT NULL,
    estado TEXT NOT NULL,
    notas TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    creado_por UUID REFERENCES usuarios(id),
    actualizado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE proveedores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    correo_negocio TEXT NOT NULL,
    nombre TEXT NOT NULL,
    ruc TEXT,
    correo TEXT,
    telefono TEXT,
    direccion TEXT,
    persona_contacto TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    creado_por UUID REFERENCES usuarios(id),
    actualizado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE pedidos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    correo_negocio TEXT NOT NULL,
    proveedor_id UUID REFERENCES proveedores(id),
    sucursal_id UUID NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado TEXT,
    fecha_entrega TIMESTAMP WITH TIME ZONE,
    productos JSONB NOT NULL,
    notas TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    creado_por UUID REFERENCES usuarios(id),
    actualizado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE sucursales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    correo_negocio TEXT NOT NULL,
    nombre TEXT NOT NULL,
    direccion TEXT,
    telefono TEXT,
    correo TEXT,
    encargado TEXT NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
    creado_por UUID REFERENCES usuarios(id),
    actualizado_por UUID REFERENCES usuarios(id)
);

-- Habilitar RLS
ALTER TABLE registro_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_negocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;

-- Crear políticas
CREATE POLICY "Registros de auditoría visibles por correo de negocio" ON registro_auditoria
    FOR ALL USING (correo_negocio = auth.jwt()->>'email');

CREATE POLICY "Usuarios visibles por correo de negocio" ON usuarios
    FOR ALL USING (correo_negocio = auth.jwt()->>'email');

CREATE POLICY "Configuración visible por correo de negocio" ON configuracion_negocio
    FOR ALL USING (correo_negocio = auth.jwt()->>'email');

CREATE POLICY "Productos visibles por correo de negocio" ON productos
    FOR ALL USING (correo_negocio = auth.jwt()->>'email');

CREATE POLICY "Clientes visibles por correo de negocio" ON clientes
    FOR ALL USING (correo_negocio = auth.jwt()->>'email');

CREATE POLICY "Ventas visibles por correo de negocio" ON ventas
    FOR ALL USING (correo_negocio = auth.jwt()->>'email');

CREATE POLICY "Gastos visibles por correo de negocio" ON gastos
    FOR ALL USING (correo_negocio = auth.jwt()->>'email');

CREATE POLICY "Proveedores visibles por correo de negocio" ON proveedores
    FOR ALL USING (correo_negocio = auth.jwt()->>'email');

CREATE POLICY "Pedidos visibles por correo de negocio" ON pedidos
    FOR ALL USING (correo_negocio = auth.jwt()->>'email');

CREATE POLICY "Sucursales visibles por correo de negocio" ON sucursales
    FOR ALL USING (correo_negocio = auth.jwt()->>'email');

-- Crear índices
CREATE INDEX idx_registro_auditoria_correo ON registro_auditoria(correo_negocio);
CREATE INDEX idx_usuarios_correo ON usuarios(correo_negocio);
CREATE INDEX idx_productos_correo ON productos(correo_negocio);
CREATE INDEX idx_clientes_correo ON clientes(correo_negocio);
CREATE INDEX idx_ventas_correo ON ventas(correo_negocio);
CREATE INDEX idx_gastos_correo ON gastos(correo_negocio);
CREATE INDEX idx_proveedores_correo ON proveedores(correo_negocio);
CREATE INDEX idx_pedidos_correo ON pedidos(correo_negocio);
CREATE INDEX idx_sucursales_correo ON sucursales(correo_negocio);

-- Crear función para actualizar automáticamente el registro de auditoría
CREATE OR REPLACE FUNCTION procesar_registro_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO registro_auditoria (
        correo_negocio,
        nombre_tabla,
        registro_id,
        accion,
        datos_anteriores,
        datos_nuevos,
        usuario_id,
        correo_usuario
    )
    VALUES (
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.correo_negocio
            ELSE NEW.correo_negocio
        END,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        TG_OP,
        CASE
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
            WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD)
            ELSE NULL
        END,
        CASE
            WHEN TG_OP = 'DELETE' THEN NULL
            ELSE to_jsonb(NEW)
        END,
        auth.uid()::UUID,
        auth.jwt()->>'email'
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear triggers para registro de auditoría
CREATE TRIGGER auditoria_productos
    AFTER INSERT OR UPDATE OR DELETE ON productos
    FOR EACH ROW EXECUTE FUNCTION procesar_registro_auditoria();

CREATE TRIGGER auditoria_clientes
    AFTER INSERT OR UPDATE OR DELETE ON clientes
    FOR EACH ROW EXECUTE FUNCTION procesar_registro_auditoria();

CREATE TRIGGER auditoria_ventas
    AFTER INSERT OR UPDATE OR DELETE ON ventas
    FOR EACH ROW EXECUTE FUNCTION procesar_registro_auditoria();

CREATE TRIGGER auditoria_gastos
    AFTER INSERT OR UPDATE OR DELETE ON gastos
    FOR EACH ROW EXECUTE FUNCTION procesar_registro_auditoria();

CREATE TRIGGER auditoria_proveedores
    AFTER INSERT OR UPDATE OR DELETE ON proveedores
    FOR EACH ROW EXECUTE FUNCTION procesar_registro_auditoria();

CREATE TRIGGER auditoria_pedidos
    AFTER INSERT OR UPDATE OR DELETE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION procesar_registro_auditoria();

CREATE TRIGGER auditoria_sucursales
    AFTER INSERT OR UPDATE OR DELETE ON sucursales
    FOR EACH ROW EXECUTE FUNCTION procesar_registro_auditoria();
