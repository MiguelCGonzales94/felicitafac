-- ================================================================
-- MIGRACIÓN FASE 3 - FELICITAFAC (VERSIÓN SEGURA CON CONDICIONALES)
-- Sistema de Facturación Electrónica para Perú
-- Creación de tablas para Core, Clientes, Productos, Facturación e Integraciones
-- Optimizado para MySQL 8.0+ y hosting compartido
-- VERSIÓN IDEMPOTENTE: Puede ejecutarse múltiples veces sin errores
-- ================================================================

SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

-- ================================================================
-- PROCEDIMIENTOS AUXILIARES PARA VERIFICACIONES
-- ================================================================

DELIMITER $$

-- Procedimiento para crear índices de forma segura
DROP PROCEDURE IF EXISTS CreateIndexIfNotExists$$
CREATE PROCEDURE CreateIndexIfNotExists(
    IN tableName VARCHAR(128),
    IN indexName VARCHAR(128),
    IN indexDefinition TEXT
)
BEGIN
    DECLARE indexExists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO indexExists
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = tableName
    AND INDEX_NAME = indexName;
    
    IF indexExists = 0 THEN
        SET @sql = CONCAT('CREATE INDEX ', indexName, ' ON ', tableName, ' ', indexDefinition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('Índice ', indexName, ' creado exitosamente') AS resultado;
    ELSE
        SELECT CONCAT('Índice ', indexName, ' ya existe, omitiendo...') AS resultado;
    END IF;
END$$

-- Procedimiento para crear triggers de forma segura
DROP PROCEDURE IF EXISTS CreateTriggerIfNotExists$$
CREATE PROCEDURE CreateTriggerIfNotExists(
    IN triggerName VARCHAR(128),
    IN triggerDefinition LONGTEXT
)
BEGIN
    DECLARE triggerExists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO triggerExists
    FROM information_schema.TRIGGERS
    WHERE TRIGGER_SCHEMA = DATABASE()
    AND TRIGGER_NAME = triggerName;
    
    IF triggerExists = 0 THEN
        SET @sql = triggerDefinition;
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('Trigger ', triggerName, ' creado exitosamente') AS resultado;
    ELSE
        SELECT CONCAT('Trigger ', triggerName, ' ya existe, omitiendo...') AS resultado;
    END IF;
END$$

DELIMITER ;

-- ================================================================
-- APLICACIÓN CORE - TABLAS BASE
-- ================================================================

-- Verificar si la tabla aplicaciones_usuarios_usuario existe (referenciada por FK)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_usuarios_usuario';

-- Crear tabla temporal si no existe la tabla de usuarios
SET @sql = IF(@table_exists = 0,
    'CREATE TABLE IF NOT EXISTS aplicaciones_usuarios_usuario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(150) NOT NULL UNIQUE,
        email VARCHAR(254),
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
    'SELECT "Tabla aplicaciones_usuarios_usuario ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tabla: Empresas
CREATE TABLE IF NOT EXISTS aplicaciones_core_empresa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),
    direccion TEXT,
    ubigeo VARCHAR(6),
    departamento VARCHAR(100),
    provincia VARCHAR(100),
    distrito VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(254),
    sitio_web VARCHAR(200),
    logo VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_actualizacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para tabla empresa (solo si no existen)
CALL CreateIndexIfNotExists('aplicaciones_core_empresa', 'idx_empresa_ruc', '(ruc)');
CALL CreateIndexIfNotExists('aplicaciones_core_empresa', 'idx_empresa_activo', '(activo)');
CALL CreateIndexIfNotExists('aplicaciones_core_empresa', 'idx_empresa_fecha_creacion', '(fecha_creacion)');

-- Tabla: Configuraciones del Sistema
CREATE TABLE IF NOT EXISTS aplicaciones_core_configuracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descripcion TEXT,
    tipo_dato ENUM('string', 'integer', 'decimal', 'boolean', 'json') NOT NULL DEFAULT 'string',
    categoria VARCHAR(50) NOT NULL DEFAULT 'general',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_actualizacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para tabla configuración
CALL CreateIndexIfNotExists('aplicaciones_core_configuracion', 'idx_configuracion_clave', '(clave)');
CALL CreateIndexIfNotExists('aplicaciones_core_configuracion', 'idx_configuracion_categoria', '(categoria)');
CALL CreateIndexIfNotExists('aplicaciones_core_configuracion', 'idx_configuracion_activo', '(activo)');

-- ================================================================
-- APLICACIÓN CLIENTES
-- ================================================================

-- Tabla: Clientes
CREATE TABLE IF NOT EXISTS aplicaciones_clientes_cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento ENUM('1', '6', '7', '0') NOT NULL COMMENT '1=DNI, 6=RUC, 7=Pasaporte, 0=Otros',
    numero_documento VARCHAR(15) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),
    direccion TEXT,
    ubigeo VARCHAR(6),
    departamento VARCHAR(100),
    provincia VARCHAR(100),
    distrito VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(254),
    sitio_web VARCHAR(200),
    contacto_nombre VARCHAR(255),
    contacto_telefono VARCHAR(20),
    contacto_email VARCHAR(254),
    condicion_tributaria VARCHAR(50),
    estado_contribuyente VARCHAR(50),
    fecha_inscripcion_ruc DATE,
    limite_credito DECIMAL(12, 2) DEFAULT 0.00,
    dias_credito INT DEFAULT 0,
    vendedor_asignado_id INT,
    observaciones TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_actualizacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar y agregar UNIQUE KEY para clientes
SET @constraint_exists = 0;
SELECT COUNT(*) INTO @constraint_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_clientes_cliente'
AND CONSTRAINT_NAME = 'unique_documento';

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE aplicaciones_clientes_cliente ADD UNIQUE KEY unique_documento (tipo_documento, numero_documento)',
    'SELECT "Constraint unique_documento ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar FK para vendedor_asignado_id
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_clientes_cliente'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%vendedor_asignado_id%';

SET @sql = IF(@fk_exists = 0 AND @table_exists > 0,
    'ALTER TABLE aplicaciones_clientes_cliente ADD FOREIGN KEY (vendedor_asignado_id) REFERENCES aplicaciones_usuarios_usuario(id) ON DELETE SET NULL',
    'SELECT "FK vendedor_asignado_id ya existe o tabla usuarios no disponible" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para tabla clientes
CALL CreateIndexIfNotExists('aplicaciones_clientes_cliente', 'idx_cliente_tipo_documento', '(tipo_documento)');
CALL CreateIndexIfNotExists('aplicaciones_clientes_cliente', 'idx_cliente_numero_documento', '(numero_documento)');
CALL CreateIndexIfNotExists('aplicaciones_clientes_cliente', 'idx_cliente_razon_social', '(razon_social)');
CALL CreateIndexIfNotExists('aplicaciones_clientes_cliente', 'idx_cliente_activo', '(activo)');
CALL CreateIndexIfNotExists('aplicaciones_clientes_cliente', 'idx_cliente_fecha_creacion', '(fecha_creacion)');
CALL CreateIndexIfNotExists('aplicaciones_clientes_cliente', 'idx_cliente_vendedor', '(vendedor_asignado_id)');

-- ================================================================
-- APLICACIÓN PRODUCTOS
-- ================================================================

-- Tabla: Categorías de Productos
CREATE TABLE IF NOT EXISTS aplicaciones_productos_categoriaproducto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    categoria_padre_id INT,
    imagen VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_actualizacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar y agregar FK para categoria_padre_id
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_productos_categoriaproducto'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%categoria_padre_id%';

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE aplicaciones_productos_categoriaproducto ADD FOREIGN KEY (categoria_padre_id) REFERENCES aplicaciones_productos_categoriaproducto(id) ON DELETE SET NULL',
    'SELECT "FK categoria_padre_id ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para categorías
CALL CreateIndexIfNotExists('aplicaciones_productos_categoriaproducto', 'idx_categoria_nombre', '(nombre)');
CALL CreateIndexIfNotExists('aplicaciones_productos_categoriaproducto', 'idx_categoria_activo', '(activo)');
CALL CreateIndexIfNotExists('aplicaciones_productos_categoriaproducto', 'idx_categoria_padre', '(categoria_padre_id)');

-- Tabla: Unidades de Medida
CREATE TABLE IF NOT EXISTS aplicaciones_productos_unidadmedida (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE COMMENT 'Código SUNAT',
    nombre VARCHAR(50) NOT NULL,
    simbolo VARCHAR(10),
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para unidades de medida
CALL CreateIndexIfNotExists('aplicaciones_productos_unidadmedida', 'idx_unidad_codigo', '(codigo)');
CALL CreateIndexIfNotExists('aplicaciones_productos_unidadmedida', 'idx_unidad_nombre', '(nombre)');
CALL CreateIndexIfNotExists('aplicaciones_productos_unidadmedida', 'idx_unidad_activo', '(activo)');

-- Tabla: Productos
CREATE TABLE IF NOT EXISTS aplicaciones_productos_producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    codigo_barras VARCHAR(50),
    codigo_interno VARCHAR(50),
    codigo_proveedor VARCHAR(50),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    descripcion_corta VARCHAR(500),
    categoria_id INT NOT NULL,
    unidad_medida_id INT NOT NULL,
    tipo_producto ENUM('producto', 'servicio') NOT NULL DEFAULT 'producto',
    precio_venta DECIMAL(12, 4) NOT NULL,
    precio_compra DECIMAL(12, 4),
    precio_promedio DECIMAL(12, 4) DEFAULT 0.0000,
    costo_ultimo DECIMAL(12, 4) DEFAULT 0.0000,
    margen_ganancia DECIMAL(5, 2) DEFAULT 0.00,
    moneda_precio VARCHAR(3) NOT NULL DEFAULT 'PEN',
    incluye_igv BOOLEAN NOT NULL DEFAULT TRUE,
    afecto_igv BOOLEAN NOT NULL DEFAULT TRUE,
    porcentaje_igv DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    stock_minimo DECIMAL(12, 4) DEFAULT 0.0000,
    stock_maximo DECIMAL(12, 4) DEFAULT 0.0000,
    stock_actual DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    stock_reservado DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    stock_disponible DECIMAL(12, 4) GENERATED ALWAYS AS (stock_actual - stock_reservado) VIRTUAL,
    peso DECIMAL(8, 4),
    dimensiones VARCHAR(100),
    imagen VARCHAR(100),
    galeria_imagenes JSON,
    especificaciones JSON,
    es_inventariable BOOLEAN NOT NULL DEFAULT TRUE,
    requiere_serie BOOLEAN NOT NULL DEFAULT FALSE,
    requiere_lote BOOLEAN NOT NULL DEFAULT FALSE,
    vida_util_dias INT,
    proveedor_principal VARCHAR(255),
    ubicacion_almacen VARCHAR(100),
    observaciones TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_actualizacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar y agregar FKs para productos
SET @fk_categoria_exists = 0;
SELECT COUNT(*) INTO @fk_categoria_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_productos_producto'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%categoria_id%';

SET @sql = IF(@fk_categoria_exists = 0,
    'ALTER TABLE aplicaciones_productos_producto ADD FOREIGN KEY (categoria_id) REFERENCES aplicaciones_productos_categoriaproducto(id) ON DELETE RESTRICT',
    'SELECT "FK categoria_id ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_unidad_exists = 0;
SELECT COUNT(*) INTO @fk_unidad_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_productos_producto'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%unidad_medida_id%';

SET @sql = IF(@fk_unidad_exists = 0,
    'ALTER TABLE aplicaciones_productos_producto ADD FOREIGN KEY (unidad_medida_id) REFERENCES aplicaciones_productos_unidadmedida(id) ON DELETE RESTRICT',
    'SELECT "FK unidad_medida_id ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para productos
CALL CreateIndexIfNotExists('aplicaciones_productos_producto', 'idx_producto_codigo', '(codigo)');
CALL CreateIndexIfNotExists('aplicaciones_productos_producto', 'idx_producto_codigo_barras', '(codigo_barras)');
CALL CreateIndexIfNotExists('aplicaciones_productos_producto', 'idx_producto_nombre', '(nombre)');
CALL CreateIndexIfNotExists('aplicaciones_productos_producto', 'idx_producto_categoria', '(categoria_id)');
CALL CreateIndexIfNotExists('aplicaciones_productos_producto', 'idx_producto_tipo', '(tipo_producto)');
CALL CreateIndexIfNotExists('aplicaciones_productos_producto', 'idx_producto_activo', '(activo)');
CALL CreateIndexIfNotExists('aplicaciones_productos_producto', 'idx_producto_inventariable', '(es_inventariable)');
CALL CreateIndexIfNotExists('aplicaciones_productos_producto', 'idx_producto_stock_minimo', '(stock_minimo)');
CALL CreateIndexIfNotExists('aplicaciones_productos_producto', 'idx_producto_fecha_creacion', '(fecha_creacion)');
CALL CreateIndexIfNotExists('aplicaciones_productos_producto', 'idx_producto_precio_venta', '(precio_venta)');

-- ================================================================
-- APLICACIÓN INVENTARIO
-- ================================================================

-- Tabla: Lotes de Inventario (PEPS)
CREATE TABLE IF NOT EXISTS aplicaciones_inventario_loteinventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    numero_lote VARCHAR(50),
    fecha_ingreso DATETIME(6) NOT NULL,
    fecha_vencimiento DATE,
    cantidad_inicial DECIMAL(12, 4) NOT NULL,
    cantidad_actual DECIMAL(12, 4) NOT NULL,
    precio_unitario DECIMAL(12, 4) NOT NULL,
    costo_total DECIMAL(12, 2) GENERATED ALWAYS AS (cantidad_actual * precio_unitario) VIRTUAL,
    referencia_documento VARCHAR(100),
    proveedor VARCHAR(255),
    observaciones TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FK para lotes
SET @fk_lote_producto_exists = 0;
SELECT COUNT(*) INTO @fk_lote_producto_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_inventario_loteinventario'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%producto_id%';

SET @sql = IF(@fk_lote_producto_exists = 0,
    'ALTER TABLE aplicaciones_inventario_loteinventario ADD FOREIGN KEY (producto_id) REFERENCES aplicaciones_productos_producto(id) ON DELETE RESTRICT',
    'SELECT "FK producto_id en lotes ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para lotes
CALL CreateIndexIfNotExists('aplicaciones_inventario_loteinventario', 'idx_lote_producto', '(producto_id)');
CALL CreateIndexIfNotExists('aplicaciones_inventario_loteinventario', 'idx_lote_fecha_ingreso', '(fecha_ingreso)');
CALL CreateIndexIfNotExists('aplicaciones_inventario_loteinventario', 'idx_lote_fecha_vencimiento', '(fecha_vencimiento)');
CALL CreateIndexIfNotExists('aplicaciones_inventario_loteinventario', 'idx_lote_numero', '(numero_lote)');
CALL CreateIndexIfNotExists('aplicaciones_inventario_loteinventario', 'idx_lote_activo', '(activo)');

-- Tabla: Movimientos de Inventario
CREATE TABLE IF NOT EXISTS aplicaciones_inventario_movimientoinventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    lote_id INT,
    tipo_movimiento ENUM('entrada', 'salida', 'ajuste', 'transferencia') NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    cantidad DECIMAL(12, 4) NOT NULL,
    precio_unitario DECIMAL(12, 4),
    costo_total DECIMAL(12, 2),
    saldo_anterior DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
    saldo_actual DECIMAL(12, 4) NOT NULL,
    referencia_tipo VARCHAR(50) COMMENT 'factura, compra, ajuste, etc',
    referencia_id INT,
    referencia_numero VARCHAR(50),
    usuario_id INT NOT NULL,
    almacen_origen VARCHAR(100),
    almacen_destino VARCHAR(100),
    observaciones TEXT,
    fecha_movimiento DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FKs para movimientos
SET @fk_movimiento_producto_exists = 0;
SELECT COUNT(*) INTO @fk_movimiento_producto_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_inventario_movimientoinventario'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%producto_id%';

SET @sql = IF(@fk_movimiento_producto_exists = 0,
    'ALTER TABLE aplicaciones_inventario_movimientoinventario ADD FOREIGN KEY (producto_id) REFERENCES aplicaciones_productos_producto(id) ON DELETE RESTRICT',
    'SELECT "FK producto_id en movimientos ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_movimiento_lote_exists = 0;
SELECT COUNT(*) INTO @fk_movimiento_lote_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_inventario_movimientoinventario'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%lote_id%';

SET @sql = IF(@fk_movimiento_lote_exists = 0,
    'ALTER TABLE aplicaciones_inventario_movimientoinventario ADD FOREIGN KEY (lote_id) REFERENCES aplicaciones_inventario_loteinventario(id) ON DELETE SET NULL',
    'SELECT "FK lote_id en movimientos ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_movimiento_usuario_exists = 0;
SELECT COUNT(*) INTO @fk_movimiento_usuario_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_inventario_movimientoinventario'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%usuario_id%';

SET @sql = IF(@fk_movimiento_usuario_exists = 0 AND @table_exists > 0,
    'ALTER TABLE aplicaciones_inventario_movimientoinventario ADD FOREIGN KEY (usuario_id) REFERENCES aplicaciones_usuarios_usuario(id) ON DELETE RESTRICT',
    'SELECT "FK usuario_id en movimientos ya existe o tabla usuarios no disponible" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para movimientos
CALL CreateIndexIfNotExists('aplicaciones_inventario_movimientoinventario', 'idx_movimiento_producto', '(producto_id)');
CALL CreateIndexIfNotExists('aplicaciones_inventario_movimientoinventario', 'idx_movimiento_lote', '(lote_id)');
CALL CreateIndexIfNotExists('aplicaciones_inventario_movimientoinventario', 'idx_movimiento_tipo', '(tipo_movimiento)');
CALL CreateIndexIfNotExists('aplicaciones_inventario_movimientoinventario', 'idx_movimiento_fecha', '(fecha_movimiento)');
CALL CreateIndexIfNotExists('aplicaciones_inventario_movimientoinventario', 'idx_movimiento_referencia', '(referencia_tipo, referencia_id)');
CALL CreateIndexIfNotExists('aplicaciones_inventario_movimientoinventario', 'idx_movimiento_usuario', '(usuario_id)');

-- ================================================================
-- APLICACIÓN FACTURACIÓN
-- ================================================================

-- Tabla: Series de Documentos
CREATE TABLE IF NOT EXISTS aplicaciones_facturacion_seriedocumento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento ENUM('factura', 'boleta', 'nota_credito', 'nota_debito', 'recibo', 'guia') NOT NULL,
    serie VARCHAR(4) NOT NULL,
    numero_actual INT NOT NULL DEFAULT 0,
    numero_maximo INT,
    descripcion VARCHAR(255),
    predeterminada BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_actualizacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar y agregar UNIQUE KEY para series
SET @constraint_serie_exists = 0;
SELECT COUNT(*) INTO @constraint_serie_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_facturacion_seriedocumento'
AND CONSTRAINT_NAME = 'unique_serie_tipo';

SET @sql = IF(@constraint_serie_exists = 0,
    'ALTER TABLE aplicaciones_facturacion_seriedocumento ADD UNIQUE KEY unique_serie_tipo (serie, tipo_documento)',
    'SELECT "Constraint unique_serie_tipo ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para series
CALL CreateIndexIfNotExists('aplicaciones_facturacion_seriedocumento', 'idx_serie_tipo', '(tipo_documento)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_seriedocumento', 'idx_serie_activo', '(activo)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_seriedocumento', 'idx_serie_predeterminada', '(predeterminada)');

-- Tabla: Facturas
CREATE TABLE IF NOT EXISTS aplicaciones_facturacion_factura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    serie_documento_id INT NOT NULL,
    numero INT NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    hora_emision TIME NOT NULL DEFAULT (CURRENT_TIME),
    
    -- Datos del cliente (snapshot)
    cliente_tipo_documento VARCHAR(2) NOT NULL,
    cliente_numero_documento VARCHAR(15) NOT NULL,
    cliente_razon_social VARCHAR(255) NOT NULL,
    cliente_direccion TEXT,
    cliente_email VARCHAR(254),
    cliente_telefono VARCHAR(20),
    
    -- Totales y moneda
    moneda VARCHAR(3) NOT NULL DEFAULT 'PEN',
    tipo_cambio DECIMAL(6, 4) NOT NULL DEFAULT 1.0000,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_descuentos DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_igv DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_otros_impuestos DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_general DECIMAL(12, 2) NOT NULL,
    
    -- Información adicional
    forma_pago ENUM('contado', 'credito') NOT NULL DEFAULT 'contado',
    condiciones_pago TEXT,
    observaciones TEXT,
    nota_interna TEXT,
    
    -- Estados y control
    estado ENUM('borrador', 'emitida', 'enviada', 'aceptada', 'rechazada', 'anulada') NOT NULL DEFAULT 'borrador',
    motivo_anulacion TEXT,
    fecha_anulacion DATETIME(6),
    
    -- Integración SUNAT
    hash_cpe VARCHAR(255),
    codigo_respuesta_sunat VARCHAR(10),
    mensaje_respuesta_sunat TEXT,
    fecha_envio_sunat DATETIME(6),
    fecha_respuesta_sunat DATETIME(6),
    xml_firmado LONGTEXT,
    enlace_pdf VARCHAR(500),
    enlace_xml VARCHAR(500),
    
    -- Control de usuarios
    usuario_creacion_id INT NOT NULL,
    usuario_emision_id INT,
    usuario_anulacion_id INT,
    
    -- Fechas de control
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_actualizacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar y agregar UNIQUE KEY para facturas
SET @constraint_factura_exists = 0;
SELECT COUNT(*) INTO @constraint_factura_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_facturacion_factura'
AND CONSTRAINT_NAME = 'unique_factura_serie_numero';

SET @sql = IF(@constraint_factura_exists = 0,
    'ALTER TABLE aplicaciones_facturacion_factura ADD UNIQUE KEY unique_factura_serie_numero (serie_documento_id, numero)',
    'SELECT "Constraint unique_factura_serie_numero ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- FKs para facturas
SET @fk_factura_cliente_exists = 0;
SELECT COUNT(*) INTO @fk_factura_cliente_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_facturacion_factura'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%cliente_id%';

SET @sql = IF(@fk_factura_cliente_exists = 0,
    'ALTER TABLE aplicaciones_facturacion_factura ADD FOREIGN KEY (cliente_id) REFERENCES aplicaciones_clientes_cliente(id) ON DELETE RESTRICT',
    'SELECT "FK cliente_id en facturas ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_factura_serie_exists = 0;
SELECT COUNT(*) INTO @fk_factura_serie_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_facturacion_factura'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%serie_documento_id%';

SET @sql = IF(@fk_factura_serie_exists = 0,
    'ALTER TABLE aplicaciones_facturacion_factura ADD FOREIGN KEY (serie_documento_id) REFERENCES aplicaciones_facturacion_seriedocumento(id) ON DELETE RESTRICT',
    'SELECT "FK serie_documento_id en facturas ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- FKs de usuarios en facturas
SET @fk_factura_usuario_creacion_exists = 0;
SELECT COUNT(*) INTO @fk_factura_usuario_creacion_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_facturacion_factura'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%usuario_creacion_id%';

SET @sql = IF(@fk_factura_usuario_creacion_exists = 0 AND @table_exists > 0,
    'ALTER TABLE aplicaciones_facturacion_factura ADD FOREIGN KEY (usuario_creacion_id) REFERENCES aplicaciones_usuarios_usuario(id) ON DELETE RESTRICT',
    'SELECT "FK usuario_creacion_id en facturas ya existe o tabla usuarios no disponible" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar demás FKs de usuarios de manera similar...
SET @fk_factura_usuario_emision_exists = 0;
SELECT COUNT(*) INTO @fk_factura_usuario_emision_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_facturacion_factura'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%usuario_emision_id%';

SET @sql = IF(@fk_factura_usuario_emision_exists = 0 AND @table_exists > 0,
    'ALTER TABLE aplicaciones_facturacion_factura ADD FOREIGN KEY (usuario_emision_id) REFERENCES aplicaciones_usuarios_usuario(id) ON DELETE SET NULL',
    'SELECT "FK usuario_emision_id en facturas ya existe o tabla usuarios no disponible" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_factura_usuario_anulacion_exists = 0;
SELECT COUNT(*) INTO @fk_factura_usuario_anulacion_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_facturacion_factura'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%usuario_anulacion_id%';

SET @sql = IF(@fk_factura_usuario_anulacion_exists = 0 AND @table_exists > 0,
    'ALTER TABLE aplicaciones_facturacion_factura ADD FOREIGN KEY (usuario_anulacion_id) REFERENCES aplicaciones_usuarios_usuario(id) ON DELETE SET NULL',
    'SELECT "FK usuario_anulacion_id en facturas ya existe o tabla usuarios no disponible" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para facturas
CALL CreateIndexIfNotExists('aplicaciones_facturacion_factura', 'idx_factura_cliente', '(cliente_id)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_factura', 'idx_factura_fecha_emision', '(fecha_emision)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_factura', 'idx_factura_estado', '(estado)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_factura', 'idx_factura_numero_completo', '(serie_documento_id, numero)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_factura', 'idx_factura_hash_cpe', '(hash_cpe)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_factura', 'idx_factura_fecha_creacion', '(fecha_creacion)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_factura', 'idx_factura_usuario_creacion', '(usuario_creacion_id)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_factura', 'idx_factura_moneda', '(moneda)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_factura', 'idx_factura_total', '(total_general)');

-- Tabla: Detalles de Factura
CREATE TABLE IF NOT EXISTS aplicaciones_facturacion_detallefactura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id INT NOT NULL,
    numero_item SMALLINT NOT NULL,
    
    -- Producto (snapshot)
    producto_id INT,
    producto_codigo VARCHAR(50) NOT NULL,
    producto_nombre VARCHAR(255) NOT NULL,
    producto_descripcion TEXT,
    unidad_medida VARCHAR(10) NOT NULL,
    
    -- Cantidades y precios
    cantidad DECIMAL(12, 4) NOT NULL,
    precio_unitario DECIMAL(12, 4) NOT NULL,
    precio_unitario_sin_igv DECIMAL(12, 4),
    
    -- Descuentos
    descuento_porcentaje DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    descuento_monto DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Totales
    subtotal DECIMAL(12, 2) NOT NULL,
    igv_porcentaje DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    igv_monto DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    otros_impuestos DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(12, 2) NOT NULL,
    
    -- Control de lotes (para PEPS)
    lote_id INT,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FKs para detalles de factura
SET @fk_detalle_factura_exists = 0;
SELECT COUNT(*) INTO @fk_detalle_factura_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_facturacion_detallefactura'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%factura_id%';

SET @sql = IF(@fk_detalle_factura_exists = 0,
    'ALTER TABLE aplicaciones_facturacion_detallefactura ADD FOREIGN KEY (factura_id) REFERENCES aplicaciones_facturacion_factura(id) ON DELETE CASCADE',
    'SELECT "FK factura_id en detalles ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_detalle_producto_exists = 0;
SELECT COUNT(*) INTO @fk_detalle_producto_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_facturacion_detallefactura'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%producto_id%';

SET @sql = IF(@fk_detalle_producto_exists = 0,
    'ALTER TABLE aplicaciones_facturacion_detallefactura ADD FOREIGN KEY (producto_id) REFERENCES aplicaciones_productos_producto(id) ON DELETE SET NULL',
    'SELECT "FK producto_id en detalles ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_detalle_lote_exists = 0;
SELECT COUNT(*) INTO @fk_detalle_lote_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_facturacion_detallefactura'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%lote_id%';

SET @sql = IF(@fk_detalle_lote_exists = 0,
    'ALTER TABLE aplicaciones_facturacion_detallefactura ADD FOREIGN KEY (lote_id) REFERENCES aplicaciones_inventario_loteinventario(id) ON DELETE SET NULL',
    'SELECT "FK lote_id en detalles ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para detalles de factura
CALL CreateIndexIfNotExists('aplicaciones_facturacion_detallefactura', 'idx_detalle_factura', '(factura_id)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_detallefactura', 'idx_detalle_producto', '(producto_id)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_detallefactura', 'idx_detalle_numero_item', '(numero_item)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_detallefactura', 'idx_detalle_lote', '(lote_id)');

-- ================================================================
-- APLICACIÓN INTEGRACIONES
-- ================================================================

-- Tabla: Proveedores de Integración
CREATE TABLE IF NOT EXISTS aplicaciones_integraciones_proveedorintegracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_proveedor ENUM('sunat', 'banco', 'courier', 'otros') NOT NULL,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    url_base VARCHAR(500),
    documentacion_url VARCHAR(500),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para proveedores de integración
CALL CreateIndexIfNotExists('aplicaciones_integraciones_proveedorintegracion', 'idx_proveedor_codigo', '(codigo)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_proveedorintegracion', 'idx_proveedor_tipo', '(tipo_proveedor)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_proveedorintegracion', 'idx_proveedor_principal', '(es_principal)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_proveedorintegracion', 'idx_proveedor_activo', '(activo)');

-- Tabla: Configuraciones de Integración
CREATE TABLE IF NOT EXISTS aplicaciones_integraciones_configuracionintegracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proveedor_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    
    -- Configuración de acceso
    url_base VARCHAR(500),
    token TEXT,
    usuario VARCHAR(100),
    password VARCHAR(255),
    api_key VARCHAR(255),
    certificado LONGTEXT,
    
    -- Configuración específica SUNAT
    ruc_empresa VARCHAR(11),
    usuario_sol VARCHAR(50),
    clave_sol VARCHAR(255),
    
    -- Configuración de timeout y reintentos
    tiempo_espera_segundos INT NOT NULL DEFAULT 30,
    max_reintentos INT NOT NULL DEFAULT 3,
    reintento_delay_segundos INT NOT NULL DEFAULT 5,
    
    -- Control de uso
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_inicio_vigencia DATE,
    fecha_fin_vigencia DATE,
    limite_requests_dia INT,
    requests_usados_hoy INT NOT NULL DEFAULT 0,
    fecha_reset_contador DATE,
    
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_actualizacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FK para configuraciones de integración
SET @fk_config_proveedor_exists = 0;
SELECT COUNT(*) INTO @fk_config_proveedor_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_integraciones_configuracionintegracion'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%proveedor_id%';

SET @sql = IF(@fk_config_proveedor_exists = 0,
    'ALTER TABLE aplicaciones_integraciones_configuracionintegracion ADD FOREIGN KEY (proveedor_id) REFERENCES aplicaciones_integraciones_proveedorintegracion(id) ON DELETE CASCADE',
    'SELECT "FK proveedor_id en configuraciones ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para configuraciones de integración
CALL CreateIndexIfNotExists('aplicaciones_integraciones_configuracionintegracion', 'idx_config_proveedor', '(proveedor_id)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_configuracionintegracion', 'idx_config_activo', '(activo)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_configuracionintegracion', 'idx_config_ruc', '(ruc_empresa)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_configuracionintegracion', 'idx_config_vigencia', '(fecha_inicio_vigencia, fecha_fin_vigencia)');

-- Tabla: Logs de Integración
CREATE TABLE IF NOT EXISTS aplicaciones_integraciones_logintegracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proveedor_id INT NOT NULL,
    configuracion_id INT,
    
    -- Operación realizada
    tipo_operacion VARCHAR(50) NOT NULL,
    descripcion_operacion TEXT,
    
    -- Request/Response
    url_endpoint VARCHAR(500),
    metodo_http VARCHAR(10),
    headers_request JSON,
    payload_request LONGTEXT,
    
    -- Respuesta
    codigo_respuesta_http INT,
    headers_respuesta JSON,
    payload_respuesta LONGTEXT,
    tiempo_respuesta_ms INT,
    
    -- Estado y errores
    exitoso BOOLEAN NOT NULL DEFAULT FALSE,
    codigo_error VARCHAR(50),
    mensaje_error TEXT,
    
    -- Contexto adicional
    referencia_tipo VARCHAR(50),
    referencia_id INT,
    usuario_id INT,
    ip_origen VARCHAR(45),
    
    fecha_inicio DATETIME(6) NOT NULL,
    fecha_fin DATETIME(6),
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FKs para logs de integración
SET @fk_log_proveedor_exists = 0;
SELECT COUNT(*) INTO @fk_log_proveedor_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_integraciones_logintegracion'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%proveedor_id%';

SET @sql = IF(@fk_log_proveedor_exists = 0,
    'ALTER TABLE aplicaciones_integraciones_logintegracion ADD FOREIGN KEY (proveedor_id) REFERENCES aplicaciones_integraciones_proveedorintegracion(id) ON DELETE CASCADE',
    'SELECT "FK proveedor_id en logs ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_log_configuracion_exists = 0;
SELECT COUNT(*) INTO @fk_log_configuracion_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_integraciones_logintegracion'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%configuracion_id%';

SET @sql = IF(@fk_log_configuracion_exists = 0,
    'ALTER TABLE aplicaciones_integraciones_logintegracion ADD FOREIGN KEY (configuracion_id) REFERENCES aplicaciones_integraciones_configuracionintegracion(id) ON DELETE SET NULL',
    'SELECT "FK configuracion_id en logs ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_log_usuario_exists = 0;
SELECT COUNT(*) INTO @fk_log_usuario_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_integraciones_logintegracion'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%usuario_id%';

SET @sql = IF(@fk_log_usuario_exists = 0 AND @table_exists > 0,
    'ALTER TABLE aplicaciones_integraciones_logintegracion ADD FOREIGN KEY (usuario_id) REFERENCES aplicaciones_usuarios_usuario(id) ON DELETE SET NULL',
    'SELECT "FK usuario_id en logs ya existe o tabla usuarios no disponible" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para logs de integración
CALL CreateIndexIfNotExists('aplicaciones_integraciones_logintegracion', 'idx_log_proveedor', '(proveedor_id)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_logintegracion', 'idx_log_configuracion', '(configuracion_id)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_logintegracion', 'idx_log_tipo_operacion', '(tipo_operacion)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_logintegracion', 'idx_log_exitoso', '(exitoso)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_logintegracion', 'idx_log_fecha_inicio', '(fecha_inicio)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_logintegracion', 'idx_log_referencia', '(referencia_tipo, referencia_id)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_logintegracion', 'idx_log_usuario', '(usuario_id)');
CALL CreateIndexIfNotExists('aplicaciones_integraciones_logintegracion', 'idx_log_codigo_error', '(codigo_error)');

-- ================================================================
-- APLICACIÓN CONTABILIDAD
-- ================================================================

-- Tabla: Plan de Cuentas (PCGE)
CREATE TABLE IF NOT EXISTS aplicaciones_contabilidad_plancuentas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_cuenta ENUM('activo', 'pasivo', 'patrimonio', 'ingreso', 'gasto', 'orden') NOT NULL,
    nivel TINYINT NOT NULL COMMENT '1=Elemento, 2=Divisionaria, 3=Subdivisionaria, 4=Subsubdivisionaria',
    cuenta_padre_id INT,
    es_movimiento BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'FALSE para cuentas de agrupación',
    naturaleza ENUM('deudora', 'acreedora') NOT NULL,
    moneda VARCHAR(3) DEFAULT 'PEN',
    centro_costo_obligatorio BOOLEAN NOT NULL DEFAULT FALSE,
    auxiliar_obligatorio BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FK para plan de cuentas
SET @fk_cuenta_padre_exists = 0;
SELECT COUNT(*) INTO @fk_cuenta_padre_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_contabilidad_plancuentas'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%cuenta_padre_id%';

SET @sql = IF(@fk_cuenta_padre_exists = 0,
    'ALTER TABLE aplicaciones_contabilidad_plancuentas ADD FOREIGN KEY (cuenta_padre_id) REFERENCES aplicaciones_contabilidad_plancuentas(id) ON DELETE SET NULL',
    'SELECT "FK cuenta_padre_id ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para plan de cuentas
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_plancuentas', 'idx_cuenta_codigo', '(codigo)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_plancuentas', 'idx_cuenta_tipo', '(tipo_cuenta)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_plancuentas', 'idx_cuenta_nivel', '(nivel)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_plancuentas', 'idx_cuenta_padre', '(cuenta_padre_id)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_plancuentas', 'idx_cuenta_movimiento', '(es_movimiento)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_plancuentas', 'idx_cuenta_activo', '(activo)');

-- Tabla: Asientos Contables
CREATE TABLE IF NOT EXISTS aplicaciones_contabilidad_asientocontable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(20) NOT NULL,
    fecha_asiento DATE NOT NULL,
    periodo VARCHAR(6) NOT NULL COMMENT 'YYYYMM',
    
    -- Referencia al documento origen
    tipo_documento VARCHAR(50),
    numero_documento VARCHAR(50),
    referencia_id INT,
    referencia_modelo VARCHAR(100),
    
    -- Descripción y glosa
    glosa TEXT NOT NULL,
    descripcion TEXT,
    
    -- Totales de control
    total_debe DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_haber DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    diferencia DECIMAL(12, 2) GENERATED ALWAYS AS (total_debe - total_haber) VIRTUAL,
    
    -- Estados
    estado ENUM('borrador', 'validado', 'contabilizado', 'anulado') NOT NULL DEFAULT 'borrador',
    automatico BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'TRUE si fue generado automáticamente',
    
    -- Control de usuarios
    usuario_creacion_id INT NOT NULL,
    usuario_validacion_id INT,
    fecha_validacion DATETIME(6),
    
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    fecha_actualizacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FKs para asientos contables
SET @fk_asiento_usuario_creacion_exists = 0;
SELECT COUNT(*) INTO @fk_asiento_usuario_creacion_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_contabilidad_asientocontable'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%usuario_creacion_id%';

SET @sql = IF(@fk_asiento_usuario_creacion_exists = 0 AND @table_exists > 0,
    'ALTER TABLE aplicaciones_contabilidad_asientocontable ADD FOREIGN KEY (usuario_creacion_id) REFERENCES aplicaciones_usuarios_usuario(id) ON DELETE RESTRICT',
    'SELECT "FK usuario_creacion_id en asientos ya existe o tabla usuarios no disponible" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_asiento_usuario_validacion_exists = 0;
SELECT COUNT(*) INTO @fk_asiento_usuario_validacion_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_contabilidad_asientocontable'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%usuario_validacion_id%';

SET @sql = IF(@fk_asiento_usuario_validacion_exists = 0 AND @table_exists > 0,
    'ALTER TABLE aplicaciones_contabilidad_asientocontable ADD FOREIGN KEY (usuario_validacion_id) REFERENCES aplicaciones_usuarios_usuario(id) ON DELETE SET NULL',
    'SELECT "FK usuario_validacion_id en asientos ya existe o tabla usuarios no disponible" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para asientos contables
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_asientocontable', 'idx_asiento_numero', '(numero)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_asientocontable', 'idx_asiento_fecha', '(fecha_asiento)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_asientocontable', 'idx_asiento_periodo', '(periodo)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_asientocontable', 'idx_asiento_estado', '(estado)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_asientocontable', 'idx_asiento_referencia', '(referencia_modelo, referencia_id)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_asientocontable', 'idx_asiento_usuario_creacion', '(usuario_creacion_id)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_asientocontable', 'idx_asiento_automatico', '(automatico)');

-- Tabla: Detalles de Asientos Contables
CREATE TABLE IF NOT EXISTS aplicaciones_contabilidad_detalleasiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asiento_id INT NOT NULL,
    numero_linea SMALLINT NOT NULL,
    cuenta_id INT NOT NULL,
    
    -- Importes
    debe DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    haber DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Descripción específica de la línea
    glosa VARCHAR(500),
    
    -- Campos auxiliares
    centro_costo VARCHAR(50),
    auxiliar VARCHAR(100),
    
    -- Documento asociado
    tipo_documento VARCHAR(20),
    numero_documento VARCHAR(50),
    fecha_documento DATE,
    
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FKs para detalles de asientos
SET @fk_detalle_asiento_exists = 0;
SELECT COUNT(*) INTO @fk_detalle_asiento_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_contabilidad_detalleasiento'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%asiento_id%';

SET @sql = IF(@fk_detalle_asiento_exists = 0,
    'ALTER TABLE aplicaciones_contabilidad_detalleasiento ADD FOREIGN KEY (asiento_id) REFERENCES aplicaciones_contabilidad_asientocontable(id) ON DELETE CASCADE',
    'SELECT "FK asiento_id en detalles ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_detalle_cuenta_exists = 0;
SELECT COUNT(*) INTO @fk_detalle_cuenta_exists
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_contabilidad_detalleasiento'
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%cuenta_id%';

SET @sql = IF(@fk_detalle_cuenta_exists = 0,
    'ALTER TABLE aplicaciones_contabilidad_detalleasiento ADD FOREIGN KEY (cuenta_id) REFERENCES aplicaciones_contabilidad_plancuentas(id) ON DELETE RESTRICT',
    'SELECT "FK cuenta_id en detalles ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para detalles de asientos
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_detalleasiento', 'idx_detalle_asiento', '(asiento_id)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_detalleasiento', 'idx_detalle_cuenta', '(cuenta_id)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_detalleasiento', 'idx_detalle_numero_linea', '(numero_linea)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_detalleasiento', 'idx_detalle_centro_costo', '(centro_costo)');
CALL CreateIndexIfNotExists('aplicaciones_contabilidad_detalleasiento', 'idx_detalle_auxiliar', '(auxiliar)');

-- ================================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ================================================================

-- Trigger para actualizar stock en productos
CALL CreateTriggerIfNotExists('tr_actualizar_stock_producto',
'CREATE TRIGGER tr_actualizar_stock_producto
    AFTER INSERT ON aplicaciones_inventario_movimientoinventario
    FOR EACH ROW
BEGIN
    DECLARE nuevo_stock DECIMAL(12, 4);
    
    -- Calcular nuevo stock basado en el saldo actual del movimiento
    SET nuevo_stock = NEW.saldo_actual;
    
    -- Actualizar stock en producto
    UPDATE aplicaciones_productos_producto 
    SET stock_actual = nuevo_stock,
        fecha_actualizacion = CURRENT_TIMESTAMP(6)
    WHERE id = NEW.producto_id;
END');

-- Trigger para actualizar totales en factura (INSERT)
CALL CreateTriggerIfNotExists('tr_actualizar_totales_factura',
'CREATE TRIGGER tr_actualizar_totales_factura
    AFTER INSERT ON aplicaciones_facturacion_detallefactura
    FOR EACH ROW
BEGIN
    UPDATE aplicaciones_facturacion_factura 
    SET subtotal = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM aplicaciones_facturacion_detallefactura 
            WHERE factura_id = NEW.factura_id
        ),
        total_igv = (
            SELECT COALESCE(SUM(igv_monto), 0) 
            FROM aplicaciones_facturacion_detallefactura 
            WHERE factura_id = NEW.factura_id
        ),
        total_general = (
            SELECT COALESCE(SUM(total), 0) 
            FROM aplicaciones_facturacion_detallefactura 
            WHERE factura_id = NEW.factura_id
        ),
        fecha_actualizacion = CURRENT_TIMESTAMP(6)
    WHERE id = NEW.factura_id;
END');

-- Trigger para actualizar totales en factura (UPDATE)
CALL CreateTriggerIfNotExists('tr_actualizar_totales_factura_update',
'CREATE TRIGGER tr_actualizar_totales_factura_update
    AFTER UPDATE ON aplicaciones_facturacion_detallefactura
    FOR EACH ROW
BEGIN
    UPDATE aplicaciones_facturacion_factura 
    SET subtotal = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM aplicaciones_facturacion_detallefactura 
            WHERE factura_id = NEW.factura_id
        ),
        total_igv = (
            SELECT COALESCE(SUM(igv_monto), 0) 
            FROM aplicaciones_facturacion_detallefactura 
            WHERE factura_id = NEW.factura_id
        ),
        total_general = (
            SELECT COALESCE(SUM(total), 0) 
            FROM aplicaciones_facturacion_detallefactura 
            WHERE factura_id = NEW.factura_id
        ),
        fecha_actualizacion = CURRENT_TIMESTAMP(6)
    WHERE id = NEW.factura_id;
END');

-- Trigger para actualizar totales en factura (DELETE)
CALL CreateTriggerIfNotExists('tr_actualizar_totales_factura_delete',
'CREATE TRIGGER tr_actualizar_totales_factura_delete
    AFTER DELETE ON aplicaciones_facturacion_detallefactura
    FOR EACH ROW
BEGIN
    UPDATE aplicaciones_facturacion_factura 
    SET subtotal = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM aplicaciones_facturacion_detallefactura 
            WHERE factura_id = OLD.factura_id
        ),
        total_igv = (
            SELECT COALESCE(SUM(igv_monto), 0) 
            FROM aplicaciones_facturacion_detallefactura 
            WHERE factura_id = OLD.factura_id
        ),
        total_general = (
            SELECT COALESCE(SUM(total), 0) 
            FROM aplicaciones_facturacion_detallefactura 
            WHERE factura_id = OLD.factura_id
        ),
        fecha_actualizacion = CURRENT_TIMESTAMP(6)
    WHERE id = OLD.factura_id;
END');

-- ================================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ================================================================

-- Índices compuestos para consultas comunes
CALL CreateIndexIfNotExists('aplicaciones_facturacion_factura', 'idx_factura_cliente_fecha', '(cliente_id, fecha_emision)');
CALL CreateIndexIfNotExists('aplicaciones_facturacion_factura', 'idx_factura_estado_fecha', '(estado, fecha_emision)');
CALL CreateIndexIfNotExists('aplicaciones_inventario_movimientoinventario', 'idx_movimiento_producto_fecha', '(producto_id, fecha_movimiento)');
CALL CreateIndexIfNotExists('aplicaciones_productos_producto', 'idx_producto_categoria_activo', '(categoria_id, activo)');
CALL CreateIndexIfNotExists('aplicaciones_clientes_cliente', 'idx_cliente_tipo_activo', '(tipo_documento, activo)');

-- Índices FULLTEXT para reportes y búsquedas de texto
SET @fulltext_producto_exists = 0;
SELECT COUNT(*) INTO @fulltext_producto_exists
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_productos_producto'
AND INDEX_NAME = 'idx_producto_busqueda';

SET @sql = IF(@fulltext_producto_exists = 0,
    'CREATE FULLTEXT INDEX idx_producto_busqueda ON aplicaciones_productos_producto(nombre, descripcion)',
    'SELECT "Índice FULLTEXT idx_producto_busqueda ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fulltext_cliente_exists = 0;
SELECT COUNT(*) INTO @fulltext_cliente_exists
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'aplicaciones_clientes_cliente'
AND INDEX_NAME = 'idx_cliente_busqueda';

SET @sql = IF(@fulltext_cliente_exists = 0,
    'CREATE FULLTEXT INDEX idx_cliente_busqueda ON aplicaciones_clientes_cliente(razon_social, nombre_comercial)',
    'SELECT "Índice FULLTEXT idx_cliente_busqueda ya existe" AS mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ================================================================
-- LIMPIAR PROCEDIMIENTOS AUXILIARES
-- ================================================================

DROP PROCEDURE IF EXISTS CreateIndexIfNotExists;
DROP PROCEDURE IF EXISTS CreateTriggerIfNotExists;

-- ================================================================
-- CONFIGURACIONES FINALES
-- ================================================================

SET foreign_key_checks = 1;

-- Mensaje de confirmación
SELECT 'MIGRACIÓN FASE 3 COMPLETADA EXITOSAMENTE (VERSIÓN SEGURA)' AS mensaje,
       'Tablas creadas para Core, Clientes, Productos, Inventario, Facturación, Integraciones y Contabilidad' AS descripcion,
       'El script puede ejecutarse múltiples veces sin errores' AS caracteristica,
       NOW() AS fecha_ejecucion;

-- ================================================================
-- VERIFICACIÓN DE TABLAS CREADAS
-- ================================================================

SELECT 
    TABLE_NAME as tabla,
    TABLE_ROWS as filas_estimadas,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as tamaño_mb,
    ENGINE as motor,
    TABLE_COLLATION as collation
FROM 
    information_schema.TABLES 
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME LIKE 'aplicaciones_%'
ORDER BY 
    TABLE_NAME;

-- Verificación de triggers creados
SELECT 
    TRIGGER_NAME as trigger_nombre,
    EVENT_MANIPULATION as evento,
    ACTION_TIMING as timing,
    EVENT_OBJECT_TABLE as tabla
FROM 
    information_schema.TRIGGERS 
WHERE 
    TRIGGER_SCHEMA = DATABASE()
    AND TRIGGER_NAME LIKE 'tr_%'
ORDER BY 
    TRIGGER_NAME;

-- Verificación de foreign keys
SELECT 
    kcu.TABLE_NAME as tabla,
    kcu.CONSTRAINT_NAME as fk_nombre,
    kcu.REFERENCED_TABLE_NAME as tabla_referenciada,
    kcu.COLUMN_NAME as columna_origen,
    kcu.REFERENCED_COLUMN_NAME as columna_referenciada
FROM 
    information_schema.KEY_COLUMN_USAGE kcu
    INNER JOIN information_schema.TABLE_CONSTRAINTS tc 
        ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME 
        AND kcu.TABLE_SCHEMA = tc.TABLE_SCHEMA
WHERE 
    kcu.TABLE_SCHEMA = DATABASE()
    AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
    AND kcu.TABLE_NAME LIKE 'aplicaciones_%'
ORDER BY 
    kcu.TABLE_NAME, kcu.CONSTRAINT_NAME;