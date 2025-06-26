-- FELICITAFAC - Datos Iniciales
-- Sistema de Facturación Electrónica para Perú
-- Datos base para funcionamiento del sistema

-- =======================================================
-- CONFIGURACIÓN INICIAL
-- =======================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
USE `felicitafac_local`;

-- =======================================================
-- CONFIGURACIONES DEL SISTEMA
-- =======================================================

INSERT INTO `core_configuracion_sistema` 
(`clave`, `valor`, `descripcion`, `tipo_dato`, `fecha_creacion`, `fecha_actualizacion`, `activo`) 
VALUES
-- Configuraciones SUNAT
('sunat_igv_tasa', '0.1800', 'Tasa de IGV vigente en Perú', 'decimal', NOW(6), NOW(6), 1),
('sunat_moneda_nacional', 'PEN', 'Código de moneda nacional (Soles)', 'string', NOW(6), NOW(6), 1),
('sunat_tipo_documento_ruc', '6', 'Código SUNAT para RUC', 'string', NOW(6), NOW(6), 1),
('sunat_tipo_documento_dni', '1', 'Código SUNAT para DNI', 'string', NOW(6), NOW(6), 1),

-- Configuraciones de facturación
('factura_vigencia_dias', '7', 'Días de vigencia de una factura', 'integer', NOW(6), NOW(6), 1),
('boleta_vigencia_dias', '7', 'Días de vigencia de una boleta', 'integer', NOW(6), NOW(6), 1),
('serie_defecto_factura', 'F001', 'Serie por defecto para facturas', 'string', NOW(6), NOW(6), 1),
('serie_defecto_boleta', 'B001', 'Serie por defecto para boletas', 'string', NOW(6), NOW(6), 1),
('numeracion_inicial', '1', 'Número inicial para documentos', 'integer', NOW(6), NOW(6), 1),

-- Configuraciones de sistema
('sistema_nombre', 'FELICITAFAC', 'Nombre del sistema', 'string', NOW(6), NOW(6), 1),
('sistema_version', '1.0.0', 'Versión actual del sistema', 'string', NOW(6), NOW(6), 1),
('sistema_mantenimiento', 'false', 'Estado de mantenimiento del sistema', 'boolean', NOW(6), NOW(6), 1),
('backup_automatico', 'true', 'Backup automático habilitado', 'boolean', NOW(6), NOW(6), 1),
('backup_frecuencia_horas', '24', 'Frecuencia de backup en horas', 'integer', NOW(6), NOW(6), 1),

-- Configuraciones de email
('email_notificaciones', 'true', 'Envío de notificaciones por email', 'boolean', NOW(6), NOW(6), 1),
('email_facturas_automatico', 'true', 'Envío automático de facturas por email', 'boolean', NOW(6), NOW(6), 1),

-- Configuraciones de inventario
('inventario_metodo', 'PEPS', 'Método de valorización de inventario', 'string', NOW(6), NOW(6), 1),
('inventario_alerta_stock_minimo', 'true', 'Alertas de stock mínimo', 'boolean', NOW(6), NOW(6), 1),
('inventario_stock_minimo_defecto', '10', 'Stock mínimo por defecto', 'integer', NOW(6), NOW(6), 1),

-- Configuraciones de reportes
('reporte_formato_fecha', 'dd/mm/yyyy', 'Formato de fecha en reportes', 'string', NOW(6), NOW(6), 1),
('reporte_decimales', '2', 'Número de decimales en reportes', 'integer', NOW(6), NOW(6), 1);

-- =======================================================
-- DATOS DE EMPRESA DEMO
-- =======================================================

INSERT INTO `core_empresa` 
(`ruc`, `razon_social`, `nombre_comercial`, `direccion`, `ubigeo`, `departamento`, `provincia`, `distrito`, 
 `telefono`, `email`, `moneda_defecto`, `igv_tasa`, `fecha_creacion`, `fecha_actualizacion`, `activo`)
VALUES
('20123456789', 'FELICITAFAC DESARROLLO SAC', 'FELICITAFAC', 
 'Av. Desarrollo 123, Oficina 456, Miraflores', '150140', 
 'LIMA', 'LIMA', 'MIRAFLORES',
 '01-1234567', 'desarrollo@felicitafac.com', 'PEN', 0.1800, 
 NOW(6), NOW(6), 1);

-- =======================================================
-- SUCURSAL PRINCIPAL
-- =======================================================

INSERT INTO `core_sucursal` 
(`empresa_id`, `codigo`, `nombre`, `direccion`, `telefono`, `email`, `es_principal`,
 `serie_factura`, `serie_boleta`, `serie_nota_credito`, `serie_nota_debito`,
 `contador_factura`, `contador_boleta`, `contador_nota_credito`, `contador_nota_debito`,
 `fecha_creacion`, `fecha_actualizacion`, `activo`)
VALUES
(1000, 'PRIN01', 'Sucursal Principal', 
 'Av. Desarrollo 123, Oficina 456, Miraflores, Lima', 
 '01-1234567', 'principal@felicitafac.com', 1,
 'F001', 'B001', 'FC01', 'FD01',
 0, 0, 0, 0,
 NOW(6), NOW(6), 1);

-- =======================================================
-- GRUPOS DE USUARIOS PREDEFINIDOS
-- =======================================================

INSERT INTO `auth_group` (`name`) VALUES
('Administradores'),
('Gerentes'),
('Vendedores'),
('Contadores'),
('Almaceneros'),
('Cajeros'),
('Consultores');

-- =======================================================
-- CONTENT TYPES PARA DJANGO
-- =======================================================

INSERT INTO `django_content_type` (`app_label`, `model`) VALUES
('admin', 'logentry'),
('auth', 'permission'),
('auth', 'group'),
('contenttypes', 'contenttype'),
('sessions', 'session'),
('core', 'empresa'),
('core', 'sucursal'),
('core', 'configuracionsistema'),
('usuarios', 'usuario'),
('usuarios', 'usuariosucursal'),
('usuarios', 'sesionusuario'),
('clientes', 'cliente'),
('clientes', 'tipocontribuyente'),
('productos', 'categoria'),
('productos', 'unidadmedida'),
('productos', 'producto'),
('facturacion', 'tipodocumento'),
('facturacion', 'factura'),
('facturacion', 'detallefactura'),
('inventario', 'movimientoinventario'),
('inventario', 'detallemovimiento'),
('contabilidad', 'plancuentas'),
('contabilidad', 'asientcontable'),
('reportes', 'reportesunat');

-- =======================================================
-- PERMISOS BÁSICOS DEL SISTEMA
-- =======================================================

-- Permisos para el modelo Empresa
INSERT INTO `auth_permission` (`name`, `content_type_id`, `codename`) VALUES
('Can add empresa', 6, 'add_empresa'),
('Can change empresa', 6, 'change_empresa'),
('Can delete empresa', 6, 'delete_empresa'),
('Can view empresa', 6, 'view_empresa');

-- Permisos para el modelo Sucursal
INSERT INTO `auth_permission` (`name`, `content_type_id`, `codename`) VALUES
('Can add sucursal', 7, 'add_sucursal'),
('Can change sucursal', 7, 'change_sucursal'),
('Can delete sucursal', 7, 'delete_sucursal'),
('Can view sucursal', 7, 'view_sucursal');

-- Permisos para el modelo Usuario
INSERT INTO `auth_permission` (`name`, `content_type_id`, `codename`) VALUES
('Can add usuario', 9, 'add_usuario'),
('Can change usuario', 9, 'change_usuario'),
('Can delete usuario', 9, 'delete_usuario'),
('Can view usuario', 9, 'view_usuario');

-- Permisos para el modelo Cliente
INSERT INTO `auth_permission` (`name`, `content_type_id`, `codename`) VALUES
('Can add cliente', 12, 'add_cliente'),
('Can change cliente', 12, 'change_cliente'),
('Can delete cliente', 12, 'delete_cliente'),
('Can view cliente', 12, 'view_cliente');

-- Permisos para el modelo Producto
INSERT INTO `auth_permission` (`name`, `content_type_id`, `codename`) VALUES
('Can add producto', 16, 'add_producto'),
('Can change producto', 16, 'change_producto'),
('Can delete producto', 16, 'delete_producto'),
('Can view producto', 16, 'view_producto');

-- Permisos para el modelo Factura
INSERT INTO `auth_permission` (`name`, `content_type_id`, `codename`) VALUES
('Can add factura', 18, 'add_factura'),
('Can change factura', 18, 'change_factura'),
('Can delete factura', 18, 'delete_factura'),
('Can view factura', 18, 'view_factura'),
('Can anular factura', 18, 'anular_factura'),
('Can enviar factura', 18, 'enviar_factura');

-- =======================================================
-- ASIGNACIÓN DE PERMISOS A GRUPOS
-- =======================================================

-- Permisos para Administradores (todos los permisos)
INSERT INTO `auth_group_permissions` (`group_id`, `permission_id`)
SELECT g.id, p.id 
FROM `auth_group` g, `auth_permission` p 
WHERE g.name = 'Administradores';

-- Permisos para Gerentes (gestión y reportes)
INSERT INTO `auth_group_permissions` (`group_id`, `permission_id`)
SELECT g.id, p.id 
FROM `auth_group` g, `auth_permission` p 
WHERE g.name = 'Gerentes' 
AND p.codename IN ('view_empresa', 'view_sucursal', 'add_usuario', 'change_usuario', 'view_usuario',
                   'add_cliente', 'change_cliente', 'view_cliente',
                   'add_producto', 'change_producto', 'view_producto',
                   'add_factura', 'change_factura', 'view_factura', 'anular_factura');

-- Permisos para Vendedores (facturación y clientes)
INSERT INTO `auth_group_permissions` (`group_id`, `permission_id`)
SELECT g.id, p.id 
FROM `auth_group` g, `auth_permission` p 
WHERE g.name = 'Vendedores' 
AND p.codename IN ('add_cliente', 'change_cliente', 'view_cliente',
                   'view_producto',
                   'add_factura', 'view_factura', 'enviar_factura');

-- Permisos para Contadores (reportes y consultas)
INSERT INTO `auth_group_permissions` (`group_id`, `permission_id`)
SELECT g.id, p.id 
FROM `auth_group` g, `auth_permission` p 
WHERE g.name = 'Contadores' 
AND p.codename IN ('view_empresa', 'view_sucursal', 'view_cliente', 'view_producto', 'view_factura');

-- =======================================================
-- USUARIO ADMINISTRADOR INICIAL
-- =======================================================

-- Nota: El superusuario se creará mediante manage.py createsuperuser
-- Aquí se pueden insertar usuarios adicionales si es necesario

-- =======================================================
-- DATOS ADICIONALES PARA DESARROLLO
-- =======================================================

-- Configuraciones adicionales para desarrollo
INSERT INTO `core_configuracion_sistema` 
(`clave`, `valor`, `descripcion`, `tipo_dato`, `fecha_creacion`, `fecha_actualizacion`, `activo`) 
VALUES
('desarrollo_modo', 'true', 'Modo de desarrollo activo', 'boolean', NOW(6), NOW(6), 1),
('debug_emails', 'true', 'Debug de emails en desarrollo', 'boolean', NOW(6), NOW(6), 1),
('log_nivel', 'DEBUG', 'Nivel de logging en desarrollo', 'string', NOW(6), NOW(6), 1),
('demo_data', 'true', 'Datos de demostración cargados', 'boolean', NOW(6), NOW(6), 1);

-- =======================================================
-- CONFIGURACIONES ESPECÍFICAS PARA PERÚ
-- =======================================================

INSERT INTO `core_configuracion_sistema` 
(`clave`, `valor`, `descripcion`, `tipo_dato`, `fecha_creacion`, `fecha_actualizacion`, `activo`) 
VALUES
-- Ubigeos principales del Perú
('ubigeo_lima_lima_lima', '150101', 'Ubigeo de Lima-Lima-Lima', 'string', NOW(6), NOW(6), 1),
('ubigeo_callao', '070101', 'Ubigeo del Callao', 'string', NOW(6), NOW(6), 1),
('ubigeo_arequipa', '040101', 'Ubigeo de Arequipa', 'string', NOW(6), NOW(6), 1),

-- Tipos de documento SUNAT
('tipo_doc_factura', '01', 'Código SUNAT para Factura', 'string', NOW(6), NOW(6), 1),
('tipo_doc_boleta', '03', 'Código SUNAT para Boleta', 'string', NOW(6), NOW(6), 1),
('tipo_doc_nota_credito', '07', 'Código SUNAT para Nota de Crédito', 'string', NOW(6), NOW(6), 1),
('tipo_doc_nota_debito', '08', 'Código SUNAT para Nota de Débito', 'string', NOW(6), NOW(6), 1),

-- Códigos de tributos
('tributo_igv', '1000', 'Código de tributo IGV', 'string', NOW(6), NOW(6), 1),
('tributo_isc', '2000', 'Código de tributo ISC', 'string', NOW(6), NOW(6), 1),
('tributo_otros', '9999', 'Código de otros tributos', 'string', NOW(6), NOW(6), 1),

-- Configuraciones de Nubefact
('nubefact_ambiente', 'beta', 'Ambiente de Nubefact (beta/produccion)', 'string', NOW(6), NOW(6), 1),
('nubefact_timeout', '30', 'Timeout para conexiones a Nubefact', 'integer', NOW(6), NOW(6), 1),
('nubefact_reintentos', '3', 'Número de reintentos para Nubefact', 'integer', NOW(6), NOW(6), 1);

-- =======================================================
-- ÍNDICES Y OPTIMIZACIONES FINALES
-- =======================================================

-- Analizar tablas para optimizar performance
ANALYZE TABLE `core_configuracion_sistema`;
ANALYZE TABLE `core_empresa`;
ANALYZE TABLE `core_sucursal`;
ANALYZE TABLE `auth_group`;
ANALYZE TABLE `auth_permission`;
ANALYZE TABLE `auth_group_permissions`;

-- =======================================================
-- VERIFICACIÓN DE DATOS INICIALES
-- =======================================================

-- Verificar que se cargaron las configuraciones
SELECT COUNT(*) as configuraciones_cargadas FROM `core_configuracion_sistema` WHERE activo = 1;

-- Verificar que se creó la empresa demo
SELECT COUNT(*) as empresas_creadas FROM `core_empresa` WHERE activo = 1;

-- Verificar que se creó la sucursal principal
SELECT COUNT(*) as sucursales_creadas FROM `core_sucursal` WHERE activo = 1;

-- Verificar que se crearon los grupos
SELECT COUNT(*) as grupos_creados FROM `auth_group`;

-- Verificar que se asignaron permisos
SELECT COUNT(*) as permisos_asignados FROM `auth_group_permissions`;

-- Mensaje de confirmación
SELECT 'FELICITAFAC - Datos iniciales cargados exitosamente' AS mensaje;
SELECT 'Sistema listo para usar' AS estado;
SELECT NOW() AS fecha_carga;

-- =======================================================
-- INFORMACIÓN PARA EL DESARROLLADOR
-- =======================================================

SELECT 'INFORMACIÓN IMPORTANTE:' AS tipo, 
       'Empresa demo creada con RUC 20123456789' AS detalle
UNION ALL
SELECT 'SUCURSAL PRINCIPAL:', 
       'Código PRIN01 con series F001, B001, FC01, FD01'
UNION ALL
SELECT 'GRUPOS CREADOS:', 
       'Administradores, Gerentes, Vendedores, Contadores, Almaceneros, Cajeros, Consultores'
UNION ALL
SELECT 'PRÓXIMO PASO:', 
       'Crear superusuario con: python manage.py createsuperuser';