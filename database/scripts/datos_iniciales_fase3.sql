-- ================================================================
-- DATOS INICIALES FASE 3 - FELICITAFAC (VERSIÓN SEGURA)
-- Sistema de Facturación Electrónica para Perú
-- Carga de datos maestros y configuraciones iniciales
-- VERSIÓN IDEMPOTENTE: Puede ejecutarse múltiples veces sin errores
-- ================================================================

SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

-- ================================================================
-- CONFIGURACIONES DEL SISTEMA
-- ================================================================

-- Insertar configuraciones solo si no existen
INSERT IGNORE INTO aplicaciones_core_configuracion (clave, valor, descripcion, tipo_dato, categoria) VALUES
('sistema_nombre', 'FELICITAFAC', 'Nombre del sistema de facturación', 'string', 'sistema'),
('sistema_version', '3.0.0', 'Versión actual del sistema', 'string', 'sistema'),
('sistema_descripcion', 'Sistema de Facturación Electrónica para Perú', 'Descripción del sistema', 'string', 'sistema'),
('sistema_logo', '/static/img/logo.png', 'Ruta del logo del sistema', 'string', 'sistema'),
('sistema_timezone', 'America/Lima', 'Zona horaria del sistema', 'string', 'sistema'),

-- Configuraciones de facturación
('facturacion_igv_porcentaje', '18.00', 'Porcentaje de IGV vigente', 'decimal', 'facturacion'),
('facturacion_moneda_defecto', 'PEN', 'Moneda por defecto para facturación', 'string', 'facturacion'),
('facturacion_decimales_cantidad', '4', 'Decimales para cantidades', 'integer', 'facturacion'),
('facturacion_decimales_precio', '4', 'Decimales para precios unitarios', 'integer', 'facturacion'),
('facturacion_decimales_total', '2', 'Decimales para totales', 'integer', 'facturacion'),
('facturacion_series_auto', 'true', 'Generar series automáticamente', 'boolean', 'facturacion'),

-- Configuraciones de inventario
('inventario_metodo_valuacion', 'PEPS', 'Método de valuación de inventario (PEPS/UEPS/PROMEDIO)', 'string', 'inventario'),
('inventario_alertas_stock', 'true', 'Activar alertas de stock mínimo', 'boolean', 'inventario'),
('inventario_stock_negativo', 'false', 'Permitir stock negativo', 'boolean', 'inventario'),
('inventario_actualizar_costo', 'true', 'Actualizar costo promedio automáticamente', 'boolean', 'inventario'),

-- Configuraciones de integración SUNAT
('sunat_modo_produccion', 'false', 'Modo producción SUNAT (false=beta)', 'boolean', 'sunat'),
('sunat_url_beta', 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService', 'URL del servicio SUNAT Beta', 'string', 'sunat'),
('sunat_url_produccion', 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService', 'URL del servicio SUNAT Producción', 'string', 'sunat'),
('sunat_timeout_segundos', '30', 'Timeout para consultas SUNAT en segundos', 'integer', 'sunat'),
('sunat_reintentos_maximo', '3', 'Número máximo de reintentos', 'integer', 'sunat'),

-- Configuraciones de seguridad
('seguridad_session_timeout', '30', 'Timeout de sesión en minutos', 'integer', 'seguridad'),
('seguridad_max_intentos_login', '5', 'Máximo intentos de login', 'integer', 'seguridad'),
('seguridad_bloqueo_minutos', '15', 'Minutos de bloqueo después de max intentos', 'integer', 'seguridad'),
('seguridad_password_min_length', '8', 'Longitud mínima de contraseña', 'integer', 'seguridad'),

-- Configuraciones de correo
('email_host', 'smtp.gmail.com', 'Servidor SMTP para envío de correos', 'string', 'email'),
('email_port', '587', 'Puerto SMTP', 'integer', 'email'),
('email_use_tls', 'true', 'Usar TLS para envío de correos', 'boolean', 'email'),
('email_from_default', 'noreply@felicitafac.com', 'Email remitente por defecto', 'string', 'email'),

-- Configuraciones de reportes
('reportes_formato_fecha', 'd/m/Y', 'Formato de fecha para reportes', 'string', 'reportes'),
('reportes_logo_empresa', 'true', 'Mostrar logo de empresa en reportes', 'boolean', 'reportes'),
('reportes_watermark', 'FELICITAFAC', 'Marca de agua en reportes', 'string', 'reportes'),

-- Configuraciones de API
('api_rate_limit', '1000', 'Límite de requests por hora por usuario', 'integer', 'api'),
('api_version', 'v1', 'Versión de la API', 'string', 'api'),
('api_pagination_size', '20', 'Tamaño de página por defecto', 'integer', 'api');

-- ================================================================
-- UNIDADES DE MEDIDA SUNAT
-- ================================================================

-- Insertar unidades de medida oficiales SUNAT solo si no existen
INSERT IGNORE INTO aplicaciones_productos_unidadmedida (codigo, nombre, simbolo, descripcion) VALUES
-- Unidades más comunes
('NIU', 'UNIDAD (BIENES)', 'UND', 'Unidad de medida para bienes en general'),
('ZZ', 'UNIDAD (SERVICIOS)', 'SERV', 'Unidad de medida para servicios'),

-- Unidades de longitud
('MTR', 'METRO', 'm', 'Metro - unidad básica de longitud'),
('CMT', 'CENTÍMETRO', 'cm', 'Centímetro'),
('MMT', 'MILÍMETRO', 'mm', 'Milímetro'),
('KTM', 'KILÓMETRO', 'km', 'Kilómetro'),
('INH', 'PULGADA', 'in', 'Pulgada'),
('FOT', 'PIE', 'ft', 'Pie'),
('YRD', 'YARDA', 'yd', 'Yarda'),

-- Unidades de área
('MTK', 'METRO CUADRADO', 'm²', 'Metro cuadrado'),
('CMK', 'CENTÍMETRO CUADRADO', 'cm²', 'Centímetro cuadrado'),
('MMK', 'MILÍMETRO CUADRADO', 'mm²', 'Milímetro cuadrado'),
('HAR', 'HECTÁREA', 'ha', 'Hectárea'),

-- Unidades de volumen
('MTQ', 'METRO CÚBICO', 'm³', 'Metro cúbico'),
('CMQ', 'CENTÍMETRO CÚBICO', 'cm³', 'Centímetro cúbico'),
('LTR', 'LITRO', 'L', 'Litro'),
('MLT', 'MILILITRO', 'mL', 'Mililitro'),
('GLI', 'GALÓN INGLÉS', 'gal', 'Galón inglés'),
('GLL', 'GALÓN LÍQUIDO', 'gal', 'Galón líquido'),

-- Unidades de masa/peso
('KGM', 'KILOGRAMO', 'kg', 'Kilogramo'),
('GRM', 'GRAMO', 'g', 'Gramo'),
('TNE', 'TONELADA MÉTRICA', 't', 'Tonelada métrica'),
('LBR', 'LIBRA', 'lb', 'Libra'),
('ONZ', 'ONZA', 'oz', 'Onza'),

-- Unidades de tiempo
('HUR', 'HORA', 'h', 'Hora'),
('MIN', 'MINUTO', 'min', 'Minuto'),
('SEC', 'SEGUNDO', 's', 'Segundo'),
('DAY', 'DÍA', 'día', 'Día'),
('WEE', 'SEMANA', 'sem', 'Semana'),
('MON', 'MES', 'mes', 'Mes'),
('ANN', 'AÑO', 'año', 'Año'),

-- Unidades de energía/potencia
('KWH', 'KILOVATIO HORA', 'kWh', 'Kilovatio hora'),
('WHR', 'VATIO HORA', 'Wh', 'Vatio hora'),

-- Unidades de envase
('BX', 'CAJA', 'caja', 'Caja'),
('PK', 'PAQUETE', 'paq', 'Paquete'),
('BG', 'BOLSA', 'bolsa', 'Bolsa'),
('BO', 'BOTELLA', 'bot', 'Botella'),
('CA', 'LATA', 'lata', 'Lata'),
('ST', 'HOJA', 'hoja', 'Hoja'),
('RM', 'RESMA', 'resma', 'Resma'),

-- Unidades especiales
('SET', 'CONJUNTO', 'set', 'Conjunto o juego'),
('PR', 'PAR', 'par', 'Par'),
('DZN', 'DOCENA', 'doc', 'Docena'),
('GRO', 'GRUESA', 'gruesa', 'Gruesa (144 unidades)'),
('BLL', 'BARRIL', 'barril', 'Barril'),
('CEN', 'CIENTO', 'ciento', 'Ciento'),
('MLL', 'MILLAR', 'millar', 'Millar');

-- ================================================================
-- CATEGORÍAS DE PRODUCTOS BÁSICAS
-- ================================================================

-- Insertar categorías base solo si no existen
INSERT IGNORE INTO aplicaciones_productos_categoriaproducto (codigo, nombre, descripcion) VALUES
('PROD', 'PRODUCTOS', 'Categoría principal para productos físicos'),
('SERV', 'SERVICIOS', 'Categoría principal para servicios'),
('MAT', 'MATERIALES', 'Materiales y materias primas'),
('HER', 'HERRAMIENTAS', 'Herramientas y equipos'),
('OFI', 'OFICINA', 'Artículos de oficina y papelería'),
('COMP', 'COMPUTACIÓN', 'Equipos y accesorios de computación'),
('MUE', 'MUEBLES', 'Muebles y enseres'),
('VEH', 'VEHÍCULOS', 'Vehículos y repuestos'),
('ALI', 'ALIMENTOS', 'Alimentos y bebidas'),
('ROB', 'ROPA', 'Ropa y textiles'),
('LIB', 'LIBROS', 'Libros y material educativo'),
('MED', 'MEDICAMENTOS', 'Medicamentos y productos farmacéuticos'),
('COS', 'COSMÉTICOS', 'Cosméticos y productos de belleza'),
('LIM', 'LIMPIEZA', 'Productos de limpieza e higiene'),
('CONS', 'CONSTRUCCIÓN', 'Materiales de construcción'),
('ELEC', 'ELECTRÓNICOS', 'Productos electrónicos'),
('DEP', 'DEPORTES', 'Artículos deportivos'),
('JUG', 'JUGUETES', 'Juguetes y entretenimiento'),
('JAR', 'JARDÍN', 'Artículos de jardín y hogar'),
('OTROS', 'OTROS', 'Productos varios no clasificados');

-- ================================================================
-- SERIES DE DOCUMENTOS PREDETERMINADAS
-- ================================================================

-- Insertar series predeterminadas solo si no existen
INSERT IGNORE INTO aplicaciones_facturacion_seriedocumento (tipo_documento, serie, numero_actual, descripcion, predeterminada, activo) VALUES
('factura', 'F001', 0, 'Serie predeterminada para facturas', TRUE, TRUE),
('boleta', 'B001', 0, 'Serie predeterminada para boletas', TRUE, TRUE),
('nota_credito', 'FC01', 0, 'Serie predeterminada para notas de crédito de facturas', FALSE, TRUE),
('nota_credito', 'BC01', 0, 'Serie predeterminada para notas de crédito de boletas', FALSE, TRUE),
('nota_debito', 'FD01', 0, 'Serie predeterminada para notas de débito de facturas', FALSE, TRUE),
('nota_debito', 'BD01', 0, 'Serie predeterminada para notas de débito de boletas', FALSE, TRUE),
('recibo', 'R001', 0, 'Serie predeterminada para recibos por honorarios', FALSE, TRUE),
('guia', 'T001', 0, 'Serie predeterminada para guías de remisión', FALSE, TRUE);

-- ================================================================
-- PROVEEDORES DE INTEGRACIÓN
-- ================================================================

-- Insertar proveedores de integración solo si no existen
INSERT IGNORE INTO aplicaciones_integraciones_proveedorintegracion (codigo, nombre, descripcion, tipo_proveedor, es_principal, url_base, activo) VALUES
('SUNAT_PSE', 'SUNAT - Portal de Servicios al Contribuyente', 'Portal oficial de SUNAT para servicios electrónicos', 'sunat', TRUE, 'https://www.sunat.gob.pe', TRUE),
('NUBEFACT', 'NubeFact', 'Proveedor de servicios de facturación electrónica', 'sunat', FALSE, 'https://api.nubefact.com', TRUE),
('FACTURADOR_PRO', 'Facturador PRO', 'Servicio alternativo de facturación electrónica', 'sunat', FALSE, 'https://api.facturadorpro.com', FALSE),
('BCP_API', 'Banco de Crédito del Perú - API', 'API del BCP para consultas bancarias', 'banco', FALSE, 'https://api.bcp.com.pe', FALSE),
('INTERBANK_API', 'Interbank - API', 'API de Interbank para servicios bancarios', 'banco', FALSE, 'https://api.interbank.pe', FALSE),
('OLVA_COURIER', 'Olva Courier', 'Servicio de courier y tracking de envíos', 'courier', FALSE, 'https://api.olvacourier.pe', FALSE),
('SHALOM_COURIER', 'Shalom Empresarial', 'Servicio de courier empresarial', 'courier', FALSE, 'https://api.shalomempresarial.com', FALSE);

-- ================================================================
-- PLAN DE CUENTAS BÁSICO (PCGE - PRINCIPALES)
-- ================================================================

-- Insertar cuentas principales del PCGE solo si no existen
INSERT IGNORE INTO aplicaciones_contabilidad_plancuentas (codigo, nombre, descripcion, tipo_cuenta, nivel, es_movimiento, naturaleza) VALUES
-- ELEMENTO 1: ACTIVO DISPONIBLE Y EXIGIBLE
('10', 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', 'Agrupa las subcuentas que representan medios de pago', 'activo', 1, FALSE, 'deudora'),
('101', 'Caja', 'Dinero en efectivo en caja', 'activo', 2, TRUE, 'deudora'),
('104', 'Cuentas corrientes en instituciones financieras', 'Depósitos en bancos', 'activo', 2, TRUE, 'deudora'),

('12', 'CUENTAS POR COBRAR COMERCIALES – TERCEROS', 'Agrupa las subcuentas que representan los derechos de cobro', 'activo', 1, FALSE, 'deudora'),
('121', 'Facturas, boletas y otros comprobantes por cobrar', 'Documentos por cobrar de ventas', 'activo', 2, TRUE, 'deudora'),

('20', 'MERCADERÍAS', 'Comprende los bienes que adquiere la empresa para ser vendidos', 'activo', 1, FALSE, 'deudora'),
('201', 'Mercaderías manufacturadas', 'Productos terminados', 'activo', 2, TRUE, 'deudora'),

-- ELEMENTO 4: PASIVO
('40', 'TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SISTEMA DE PENSIONES Y DE SALUD POR PAGAR', 'Obligaciones tributarias', 'pasivo', 1, FALSE, 'acreedora'),
('401', 'Gobierno central', 'IGV, Impuesto a la Renta, etc.', 'pasivo', 2, TRUE, 'acreedora'),

('42', 'CUENTAS POR PAGAR COMERCIALES – TERCEROS', 'Obligaciones con proveedores', 'pasivo', 1, FALSE, 'acreedora'),
('421', 'Facturas, boletas y otros comprobantes por pagar', 'Documentos por pagar de compras', 'pasivo', 2, TRUE, 'acreedora'),

-- ELEMENTO 5: PATRIMONIO
('50', 'CAPITAL', 'Aportes de socios o accionistas', 'patrimonio', 1, FALSE, 'acreedora'),
('501', 'Capital social', 'Capital suscrito y pagado', 'patrimonio', 2, TRUE, 'acreedora'),

('59', 'RESULTADOS ACUMULADOS', 'Utilidades o pérdidas acumuladas', 'patrimonio', 1, FALSE, 'acreedora'),
('591', 'Utilidades no distribuidas', 'Utilidades retenidas', 'patrimonio', 2, TRUE, 'acreedora'),

-- ELEMENTO 6: GASTOS POR NATURALEZA
('60', 'COMPRAS', 'Adquisiciones de bienes para comercialización', 'gasto', 1, FALSE, 'deudora'),
('601', 'Mercaderías', 'Compras de mercaderías', 'gasto', 2, TRUE, 'deudora'),

('63', 'GASTOS DE SERVICIOS PRESTADOS POR TERCEROS', 'Servicios diversos', 'gasto', 1, FALSE, 'deudora'),
('631', 'Transporte, correos y gastos de viaje', 'Gastos de transporte', 'gasto', 2, TRUE, 'deudora'),
('634', 'Mantenimiento y reparaciones', 'Gastos de mantenimiento', 'gasto', 2, TRUE, 'deudora'),

-- ELEMENTO 7: INGRESOS
('70', 'VENTAS', 'Ingresos por ventas de mercaderías', 'ingreso', 1, FALSE, 'acreedora'),
('701', 'Mercaderías', 'Ventas de mercaderías', 'ingreso', 2, TRUE, 'acreedora'),

('75', 'OTROS INGRESOS DE GESTIÓN', 'Ingresos diversos', 'ingreso', 1, FALSE, 'acreedora'),
('751', 'Servicios en beneficio del personal', 'Ingresos por servicios al personal', 'ingreso', 2, TRUE, 'acreedora');

-- ================================================================
-- CONFIGURACIONES ESPECÍFICAS DE NUBEFACT
-- ================================================================

-- Configuración de NubeFact (solo si no existe)
INSERT IGNORE INTO aplicaciones_integraciones_configuracionintegracion 
(proveedor_id, nombre, descripcion, url_base, ruc_empresa, usuario_sol, activo) 
SELECT 
    p.id,
    'Configuración NubeFact Producción',
    'Configuración para el servicio de NubeFact en producción',
    'https://api.nubefact.com/api/v1',
    '20000000000',
    'USUARIO_SOL_DEMO',
    FALSE
FROM aplicaciones_integraciones_proveedorintegracion p 
WHERE p.codigo = 'NUBEFACT' 
AND NOT EXISTS (
    SELECT 1 FROM aplicaciones_integraciones_configuracionintegracion c 
    WHERE c.proveedor_id = p.id AND c.nombre = 'Configuración NubeFact Producción'
);

-- ================================================================
-- DATOS DE EMPRESA DEMO (OPCIONAL)
-- ================================================================

-- Insertar empresa demo solo si no existen registros
INSERT IGNORE INTO aplicaciones_core_empresa 
(ruc, razon_social, nombre_comercial, direccion, ubigeo, departamento, provincia, distrito, telefono, email, activo) 
VALUES 
(
    '20000000001', 
    'EMPRESA DEMO FELICITAFAC S.A.C.', 
    'FELICITAFAC DEMO', 
    'Av. Principal 123', 
    '150101', 
    'LIMA', 
    'LIMA', 
    'LIMA', 
    '01-1234567', 
    'demo@felicitafac.com', 
    TRUE
);

-- ================================================================
-- MENSAJE FINAL
-- ================================================================

SET foreign_key_checks = 1;

-- Consulta de verificación de datos cargados
SELECT 'DATOS INICIALES CARGADOS EXITOSAMENTE' AS mensaje,
       NOW() AS fecha_carga;

-- Resumen de datos cargados
SELECT 
    'Configuraciones del sistema' as tipo_dato,
    COUNT(*) as cantidad_registros
FROM aplicaciones_core_configuracion
WHERE categoria IN ('sistema', 'facturacion', 'inventario', 'sunat', 'seguridad', 'email', 'reportes', 'api')

UNION ALL

SELECT 
    'Unidades de medida SUNAT' as tipo_dato,
    COUNT(*) as cantidad_registros
FROM aplicaciones_productos_unidadmedida

UNION ALL

SELECT 
    'Categorías de productos' as tipo_dato,
    COUNT(*) as cantidad_registros
FROM aplicaciones_productos_categoriaproducto

UNION ALL

SELECT 
    'Series de documentos' as tipo_dato,
    COUNT(*) as cantidad_registros
FROM aplicaciones_facturacion_seriedocumento

UNION ALL

SELECT 
    'Proveedores de integración' as tipo_dato,
    COUNT(*) as cantidad_registros
FROM aplicaciones_integraciones_proveedorintegracion

UNION ALL

SELECT 
    'Plan de cuentas básico' as tipo_dato,
    COUNT(*) as cantidad_registros
FROM aplicaciones_contabilidad_plancuentas

UNION ALL

SELECT 
    'Empresas registradas' as tipo_dato,
    COUNT(*) as cantidad_registros
FROM aplicaciones_core_empresa;

-- Verificar configuraciones principales
SELECT 
    categoria,
    COUNT(*) as configuraciones_por_categoria
FROM aplicaciones_core_configuracion 
GROUP BY categoria 
ORDER BY categoria;