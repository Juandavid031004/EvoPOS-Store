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

-- Función para comprimir datos antiguos
CREATE OR REPLACE FUNCTION compress_old_data()
RETURNS void AS $$
DECLARE
    compression_date DATE;
BEGIN
    -- Definir fecha límite (30 días atrás)
    compression_date := CURRENT_DATE - INTERVAL '30 days';

    -- Comprimir registros de auditoría antiguos
    UPDATE registro_auditoria 
    SET datos_anteriores = compress_jsonb(datos_anteriores),
        datos_nuevos = compress_jsonb(datos_nuevos)
    WHERE fecha_creacion < compression_date
    AND (datos_anteriores IS NOT NULL OR datos_nuevos IS NOT NULL);

    -- Comprimir productos en ventas antiguas
    UPDATE ventas 
    SET productos = compress_jsonb(productos)
    WHERE fecha_creacion < compression_date
    AND productos IS NOT NULL;

    -- Comprimir productos en pedidos antiguos
    UPDATE pedidos 
    SET productos = compress_jsonb(productos)
    WHERE fecha_creacion < compression_date
    AND productos IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función auxiliar para comprimir JSONB
CREATE OR REPLACE FUNCTION compress_jsonb(data jsonb)
RETURNS jsonb AS $$
DECLARE
    compressed jsonb;
BEGIN
    IF data IS NULL THEN
        RETURN NULL;
    END IF;

    -- Eliminar espacios en blanco y caracteres innecesarios
    compressed := jsonb_strip_nulls(data);
    
    RETURN compressed;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Programar la compresión automática cada 24 horas
SELECT cron.schedule(
    'compress-old-data',
    '0 0 * * *', -- Ejecutar a las 00:00 todos los días
    'SELECT compress_old_data()'
);

-- Crear índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON registro_auditoria(fecha_creacion);

-- Función para limpiar datos muy antiguos (más de 1 año)
CREATE OR REPLACE FUNCTION archive_very_old_data()
RETURNS void AS $$
DECLARE
    archive_date DATE;
BEGIN
    -- Definir fecha límite (1 año atrás)
    archive_date := CURRENT_DATE - INTERVAL '1 year';

    -- Crear tabla de archivo si no existe
    CREATE TABLE IF NOT EXISTS registro_auditoria_archivo (LIKE registro_auditoria);
    CREATE TABLE IF NOT EXISTS ventas_archivo (LIKE ventas);
    CREATE TABLE IF NOT EXISTS pedidos_archivo (LIKE pedidos);

    -- Mover registros muy antiguos a tablas de archivo
    WITH moved_rows AS (
        DELETE FROM registro_auditoria 
        WHERE fecha_creacion < archive_date
        RETURNING *
    )
    INSERT INTO registro_auditoria_archivo 
    SELECT * FROM moved_rows;

    WITH moved_rows AS (
        DELETE FROM ventas 
        WHERE fecha_creacion < archive_date
        RETURNING *
    )
    INSERT INTO ventas_archivo 
    SELECT * FROM moved_rows;

    WITH moved_rows AS (
        DELETE FROM pedidos 
        WHERE fecha_creacion < archive_date
        RETURNING *
    )
    INSERT INTO pedidos_archivo 
    SELECT * FROM moved_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Programar el archivado automático cada semana
SELECT cron.schedule(
    'archive-very-old-data',
    '0 0 * * 0', -- Ejecutar a las 00:00 cada domingo
    'SELECT archive_very_old_data()'
);

-- Habilitar extensión pgcrypto para compresión
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crear función para vaciar tablas de archivo si es necesario
CREATE OR REPLACE FUNCTION clean_archive_tables()
RETURNS void AS $$
BEGIN
    -- Solo limpiar si el espacio usado está cerca del límite
    IF (SELECT pg_database_size(current_database()) > 1024 * 1024 * 1024 * 0.8) THEN -- 80% de 1GB
        TRUNCATE TABLE registro_auditoria_archivo;
        TRUNCATE TABLE ventas_archivo;
        TRUNCATE TABLE pedidos_archivo;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Programar limpieza de archivos cada mes
SELECT cron.schedule(
    'clean-archive-tables',
    '0 0 1 * *', -- Ejecutar a las 00:00 el primer día de cada mes
    'SELECT clean_archive_tables()'
);
