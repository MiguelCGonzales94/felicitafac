-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 26-06-2025 a las 08:27:58
-- Versión del servidor: 8.0.42-0ubuntu0.24.04.1
-- Versión de PHP: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `felicitafac_local`
--

DELIMITER $$
--
-- Procedimientos
--
$$

$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_clientes_cliente`
--

CREATE TABLE `aplicaciones_clientes_cliente` (
  `id` int NOT NULL,
  `tipo_documento` enum('1','6','7','0') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '1=DNI, 6=RUC, 7=Pasaporte, 0=Otros',
  `numero_documento` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_comercial` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `ubigeo` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provincia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `distrito` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sitio_web` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condicion_tributaria` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_contribuyente` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_inscripcion_ruc` date DEFAULT NULL,
  `limite_credito` decimal(12,2) DEFAULT '0.00',
  `dias_credito` int DEFAULT '0',
  `vendedor_asignado_id` int DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_contabilidad_asientocontable`
--

CREATE TABLE `aplicaciones_contabilidad_asientocontable` (
  `id` int NOT NULL,
  `numero` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_asiento` date NOT NULL,
  `periodo` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'YYYYMM',
  `tipo_documento` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_documento` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia_id` int DEFAULT NULL,
  `referencia_modelo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `glosa` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `total_debe` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_haber` decimal(12,2) NOT NULL DEFAULT '0.00',
  `diferencia` decimal(12,2) GENERATED ALWAYS AS ((`total_debe` - `total_haber`)) VIRTUAL,
  `estado` enum('borrador','validado','contabilizado','anulado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'borrador',
  `automatico` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'TRUE si fue generado automáticamente',
  `usuario_creacion_id` int NOT NULL,
  `usuario_validacion_id` int DEFAULT NULL,
  `fecha_validacion` datetime(6) DEFAULT NULL,
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_contabilidad_detalleasiento`
--

CREATE TABLE `aplicaciones_contabilidad_detalleasiento` (
  `id` int NOT NULL,
  `asiento_id` int NOT NULL,
  `numero_linea` smallint NOT NULL,
  `cuenta_id` int NOT NULL,
  `debe` decimal(12,2) NOT NULL DEFAULT '0.00',
  `haber` decimal(12,2) NOT NULL DEFAULT '0.00',
  `glosa` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `centro_costo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `auxiliar` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_documento` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_documento` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_documento` date DEFAULT NULL,
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_contabilidad_plancuentas`
--

CREATE TABLE `aplicaciones_contabilidad_plancuentas` (
  `id` int NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `tipo_cuenta` enum('activo','pasivo','patrimonio','ingreso','gasto','orden') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel` tinyint NOT NULL COMMENT '1=Elemento, 2=Divisionaria, 3=Subdivisionaria, 4=Subsubdivisionaria',
  `cuenta_padre_id` int DEFAULT NULL,
  `es_movimiento` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'FALSE para cuentas de agrupación',
  `naturaleza` enum('deudora','acreedora') COLLATE utf8mb4_unicode_ci NOT NULL,
  `moneda` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'PEN',
  `centro_costo_obligatorio` tinyint(1) NOT NULL DEFAULT '0',
  `auxiliar_obligatorio` tinyint(1) NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `aplicaciones_contabilidad_plancuentas`
--

INSERT INTO `aplicaciones_contabilidad_plancuentas` (`id`, `codigo`, `nombre`, `descripcion`, `tipo_cuenta`, `nivel`, `cuenta_padre_id`, `es_movimiento`, `naturaleza`, `moneda`, `centro_costo_obligatorio`, `auxiliar_obligatorio`, `activo`, `fecha_creacion`) VALUES
(1, '10', 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', 'Agrupa las subcuentas que representan medios de pago', 'activo', 1, NULL, 0, 'deudora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(2, '101', 'Caja', 'Dinero en efectivo en caja', 'activo', 2, NULL, 1, 'deudora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(3, '104', 'Cuentas corrientes en instituciones financieras', 'Depósitos en bancos', 'activo', 2, NULL, 1, 'deudora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(4, '12', 'CUENTAS POR COBRAR COMERCIALES – TERCEROS', 'Agrupa las subcuentas que representan los derechos de cobro', 'activo', 1, NULL, 0, 'deudora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(5, '121', 'Facturas, boletas y otros comprobantes por cobrar', 'Documentos por cobrar de ventas', 'activo', 2, NULL, 1, 'deudora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(6, '20', 'MERCADERÍAS', 'Comprende los bienes que adquiere la empresa para ser vendidos', 'activo', 1, NULL, 0, 'deudora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(7, '201', 'Mercaderías manufacturadas', 'Productos terminados', 'activo', 2, NULL, 1, 'deudora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(8, '40', 'TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SISTEMA DE PENSIONES Y DE SALUD POR PAGAR', 'Obligaciones tributarias', 'pasivo', 1, NULL, 0, 'acreedora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(9, '401', 'Gobierno central', 'IGV, Impuesto a la Renta, etc.', 'pasivo', 2, NULL, 1, 'acreedora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(10, '42', 'CUENTAS POR PAGAR COMERCIALES – TERCEROS', 'Obligaciones con proveedores', 'pasivo', 1, NULL, 0, 'acreedora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(11, '421', 'Facturas, boletas y otros comprobantes por pagar', 'Documentos por pagar de compras', 'pasivo', 2, NULL, 1, 'acreedora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(12, '50', 'CAPITAL', 'Aportes de socios o accionistas', 'patrimonio', 1, NULL, 0, 'acreedora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(13, '501', 'Capital social', 'Capital suscrito y pagado', 'patrimonio', 2, NULL, 1, 'acreedora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(14, '59', 'RESULTADOS ACUMULADOS', 'Utilidades o pérdidas acumuladas', 'patrimonio', 1, NULL, 0, 'acreedora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(15, '591', 'Utilidades no distribuidas', 'Utilidades retenidas', 'patrimonio', 2, NULL, 1, 'acreedora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(16, '60', 'COMPRAS', 'Adquisiciones de bienes para comercialización', 'gasto', 1, NULL, 0, 'deudora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(17, '601', 'Mercaderías', 'Compras de mercaderías', 'gasto', 2, NULL, 1, 'deudora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(18, '63', 'GASTOS DE SERVICIOS PRESTADOS POR TERCEROS', 'Servicios diversos', 'gasto', 1, NULL, 0, 'deudora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(19, '631', 'Transporte, correos y gastos de viaje', 'Gastos de transporte', 'gasto', 2, NULL, 1, 'deudora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(20, '634', 'Mantenimiento y reparaciones', 'Gastos de mantenimiento', 'gasto', 2, NULL, 1, 'deudora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(21, '70', 'VENTAS', 'Ingresos por ventas de mercaderías', 'ingreso', 1, NULL, 0, 'acreedora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(22, '701', 'Mercaderías', 'Ventas de mercaderías', 'ingreso', 2, NULL, 1, 'acreedora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(23, '75', 'OTROS INGRESOS DE GESTIÓN', 'Ingresos diversos', 'ingreso', 1, NULL, 0, 'acreedora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065'),
(24, '751', 'Servicios en beneficio del personal', 'Ingresos por servicios al personal', 'ingreso', 2, NULL, 1, 'acreedora', 'PEN', 0, 0, 1, '2025-06-22 18:33:46.373065');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_core_configuracion`
--

CREATE TABLE `aplicaciones_core_configuracion` (
  `id` int NOT NULL,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `tipo_dato` enum('string','integer','decimal','boolean','json') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `categoria` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `aplicaciones_core_configuracion`
--

INSERT INTO `aplicaciones_core_configuracion` (`id`, `clave`, `valor`, `descripcion`, `tipo_dato`, `categoria`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'sistema_nombre', 'FELICITAFAC', 'Nombre del sistema de facturación', 'string', 'sistema', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(2, 'sistema_version', '3.0.0', 'Versión actual del sistema', 'string', 'sistema', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(3, 'sistema_descripcion', 'Sistema de Facturación Electrónica para Perú', 'Descripción del sistema', 'string', 'sistema', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(4, 'sistema_logo', '/static/img/logo.png', 'Ruta del logo del sistema', 'string', 'sistema', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(5, 'sistema_timezone', 'America/Lima', 'Zona horaria del sistema', 'string', 'sistema', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(6, 'facturacion_igv_porcentaje', '18.00', 'Porcentaje de IGV vigente', 'decimal', 'facturacion', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(7, 'facturacion_moneda_defecto', 'PEN', 'Moneda por defecto para facturación', 'string', 'facturacion', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(8, 'facturacion_decimales_cantidad', '4', 'Decimales para cantidades', 'integer', 'facturacion', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(9, 'facturacion_decimales_precio', '4', 'Decimales para precios unitarios', 'integer', 'facturacion', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(10, 'facturacion_decimales_total', '2', 'Decimales para totales', 'integer', 'facturacion', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(11, 'facturacion_series_auto', 'true', 'Generar series automáticamente', 'boolean', 'facturacion', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(12, 'inventario_metodo_valuacion', 'PEPS', 'Método de valuación de inventario (PEPS/UEPS/PROMEDIO)', 'string', 'inventario', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(13, 'inventario_alertas_stock', 'true', 'Activar alertas de stock mínimo', 'boolean', 'inventario', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(14, 'inventario_stock_negativo', 'false', 'Permitir stock negativo', 'boolean', 'inventario', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(15, 'inventario_actualizar_costo', 'true', 'Actualizar costo promedio automáticamente', 'boolean', 'inventario', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(16, 'sunat_modo_produccion', 'false', 'Modo producción SUNAT (false=beta)', 'boolean', 'sunat', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(17, 'sunat_url_beta', 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService', 'URL del servicio SUNAT Beta', 'string', 'sunat', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(18, 'sunat_url_produccion', 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService', 'URL del servicio SUNAT Producción', 'string', 'sunat', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(19, 'sunat_timeout_segundos', '30', 'Timeout para consultas SUNAT en segundos', 'integer', 'sunat', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(20, 'sunat_reintentos_maximo', '3', 'Número máximo de reintentos', 'integer', 'sunat', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(21, 'seguridad_session_timeout', '30', 'Timeout de sesión en minutos', 'integer', 'seguridad', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(22, 'seguridad_max_intentos_login', '5', 'Máximo intentos de login', 'integer', 'seguridad', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(23, 'seguridad_bloqueo_minutos', '15', 'Minutos de bloqueo después de max intentos', 'integer', 'seguridad', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(24, 'seguridad_password_min_length', '8', 'Longitud mínima de contraseña', 'integer', 'seguridad', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(25, 'email_host', 'smtp.gmail.com', 'Servidor SMTP para envío de correos', 'string', 'email', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(26, 'email_port', '587', 'Puerto SMTP', 'integer', 'email', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(27, 'email_use_tls', 'true', 'Usar TLS para envío de correos', 'boolean', 'email', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(28, 'email_from_default', 'noreply@felicitafac.com', 'Email remitente por defecto', 'string', 'email', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(29, 'reportes_formato_fecha', 'd/m/Y', 'Formato de fecha para reportes', 'string', 'reportes', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(30, 'reportes_logo_empresa', 'true', 'Mostrar logo de empresa en reportes', 'boolean', 'reportes', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(31, 'reportes_watermark', 'FELICITAFAC', 'Marca de agua en reportes', 'string', 'reportes', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(32, 'api_rate_limit', '1000', 'Límite de requests por hora por usuario', 'integer', 'api', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(33, 'api_version', 'v1', 'Versión de la API', 'string', 'api', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026'),
(34, 'api_pagination_size', '20', 'Tamaño de página por defecto', 'integer', 'api', 1, '2025-06-22 18:33:46.338026', '2025-06-22 18:33:46.338026');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_core_empresa`
--

CREATE TABLE `aplicaciones_core_empresa` (
  `id` int NOT NULL,
  `ruc` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_comercial` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `ubigeo` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provincia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `distrito` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sitio_web` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `aplicaciones_core_empresa`
--

INSERT INTO `aplicaciones_core_empresa` (`id`, `ruc`, `razon_social`, `nombre_comercial`, `direccion`, `ubigeo`, `departamento`, `provincia`, `distrito`, `telefono`, `email`, `sitio_web`, `logo`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, '20000000001', 'EMPRESA DEMO FELICITAFAC S.A.C.', 'FELICITAFAC DEMO', 'Av. Principal 123', '150101', 'LIMA', 'LIMA', 'LIMA', '01-1234567', 'demo@felicitafac.com', NULL, NULL, 1, '2025-06-22 18:33:46.386984', '2025-06-22 18:33:46.386984');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_facturacion_detallefactura`
--

CREATE TABLE `aplicaciones_facturacion_detallefactura` (
  `id` int NOT NULL,
  `factura_id` int NOT NULL,
  `numero_item` smallint NOT NULL,
  `producto_id` int DEFAULT NULL,
  `producto_codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `producto_nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `producto_descripcion` text COLLATE utf8mb4_unicode_ci,
  `unidad_medida` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` decimal(12,4) NOT NULL,
  `precio_unitario` decimal(12,4) NOT NULL,
  `precio_unitario_sin_igv` decimal(12,4) DEFAULT NULL,
  `descuento_porcentaje` decimal(5,2) NOT NULL DEFAULT '0.00',
  `descuento_monto` decimal(12,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(12,2) NOT NULL,
  `igv_porcentaje` decimal(5,2) NOT NULL DEFAULT '18.00',
  `igv_monto` decimal(12,2) NOT NULL DEFAULT '0.00',
  `otros_impuestos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `lote_id` int DEFAULT NULL,
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_facturacion_factura`
--

CREATE TABLE `aplicaciones_facturacion_factura` (
  `id` int NOT NULL,
  `cliente_id` int NOT NULL,
  `serie_documento_id` int NOT NULL,
  `numero` int NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `hora_emision` time NOT NULL DEFAULT (curtime()),
  `cliente_tipo_documento` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_numero_documento` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_razon_social` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_direccion` text COLLATE utf8mb4_unicode_ci,
  `cliente_email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cliente_telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `moneda` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PEN',
  `tipo_cambio` decimal(6,4) NOT NULL DEFAULT '1.0000',
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_descuentos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_igv` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_otros_impuestos` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_general` decimal(12,2) NOT NULL,
  `forma_pago` enum('contado','credito') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'contado',
  `condiciones_pago` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `nota_interna` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('borrador','emitida','enviada','aceptada','rechazada','anulada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'borrador',
  `motivo_anulacion` text COLLATE utf8mb4_unicode_ci,
  `fecha_anulacion` datetime(6) DEFAULT NULL,
  `hash_cpe` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_respuesta_sunat` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mensaje_respuesta_sunat` text COLLATE utf8mb4_unicode_ci,
  `fecha_envio_sunat` datetime(6) DEFAULT NULL,
  `fecha_respuesta_sunat` datetime(6) DEFAULT NULL,
  `xml_firmado` longtext COLLATE utf8mb4_unicode_ci,
  `enlace_pdf` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enlace_xml` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_creacion_id` int NOT NULL,
  `usuario_emision_id` int DEFAULT NULL,
  `usuario_anulacion_id` int DEFAULT NULL,
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_facturacion_seriedocumento`
--

CREATE TABLE `aplicaciones_facturacion_seriedocumento` (
  `id` int NOT NULL,
  `tipo_documento` enum('factura','boleta','nota_credito','nota_debito','recibo','guia') COLLATE utf8mb4_unicode_ci NOT NULL,
  `serie` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_actual` int NOT NULL DEFAULT '0',
  `numero_maximo` int DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `predeterminada` tinyint(1) NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `aplicaciones_facturacion_seriedocumento`
--

INSERT INTO `aplicaciones_facturacion_seriedocumento` (`id`, `tipo_documento`, `serie`, `numero_actual`, `numero_maximo`, `descripcion`, `predeterminada`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'factura', 'F001', 0, NULL, 'Serie predeterminada para facturas', 1, 1, '2025-06-22 18:33:46.359629', '2025-06-22 18:33:46.359629'),
(2, 'boleta', 'B001', 0, NULL, 'Serie predeterminada para boletas', 1, 1, '2025-06-22 18:33:46.359629', '2025-06-22 18:33:46.359629'),
(3, 'nota_credito', 'FC01', 0, NULL, 'Serie predeterminada para notas de crédito de facturas', 0, 1, '2025-06-22 18:33:46.359629', '2025-06-22 18:33:46.359629'),
(4, 'nota_credito', 'BC01', 0, NULL, 'Serie predeterminada para notas de crédito de boletas', 0, 1, '2025-06-22 18:33:46.359629', '2025-06-22 18:33:46.359629'),
(5, 'nota_debito', 'FD01', 0, NULL, 'Serie predeterminada para notas de débito de facturas', 0, 1, '2025-06-22 18:33:46.359629', '2025-06-22 18:33:46.359629'),
(6, 'nota_debito', 'BD01', 0, NULL, 'Serie predeterminada para notas de débito de boletas', 0, 1, '2025-06-22 18:33:46.359629', '2025-06-22 18:33:46.359629'),
(7, 'recibo', 'R001', 0, NULL, 'Serie predeterminada para recibos por honorarios', 0, 1, '2025-06-22 18:33:46.359629', '2025-06-22 18:33:46.359629'),
(8, 'guia', 'T001', 0, NULL, 'Serie predeterminada para guías de remisión', 0, 1, '2025-06-22 18:33:46.359629', '2025-06-22 18:33:46.359629');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_integraciones_configuracionintegracion`
--

CREATE TABLE `aplicaciones_integraciones_configuracionintegracion` (
  `id` int NOT NULL,
  `proveedor_id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `url_base` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token` text COLLATE utf8mb4_unicode_ci,
  `usuario` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `api_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificado` longtext COLLATE utf8mb4_unicode_ci,
  `ruc_empresa` varchar(11) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_sol` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clave_sol` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tiempo_espera_segundos` int NOT NULL DEFAULT '30',
  `max_reintentos` int NOT NULL DEFAULT '3',
  `reintento_delay_segundos` int NOT NULL DEFAULT '5',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_inicio_vigencia` date DEFAULT NULL,
  `fecha_fin_vigencia` date DEFAULT NULL,
  `limite_requests_dia` int DEFAULT NULL,
  `requests_usados_hoy` int NOT NULL DEFAULT '0',
  `fecha_reset_contador` date DEFAULT NULL,
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `aplicaciones_integraciones_configuracionintegracion`
--

INSERT INTO `aplicaciones_integraciones_configuracionintegracion` (`id`, `proveedor_id`, `nombre`, `descripcion`, `url_base`, `token`, `usuario`, `password`, `api_key`, `certificado`, `ruc_empresa`, `usuario_sol`, `clave_sol`, `tiempo_espera_segundos`, `max_reintentos`, `reintento_delay_segundos`, `activo`, `fecha_inicio_vigencia`, `fecha_fin_vigencia`, `limite_requests_dia`, `requests_usados_hoy`, `fecha_reset_contador`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 2, 'Configuración NubeFact Producción', 'Configuración para el servicio de NubeFact en producción', 'https://api.nubefact.com/api/v1', NULL, NULL, NULL, NULL, NULL, '20000000000', 'USUARIO_SOL_DEMO', NULL, 30, 3, 5, 0, NULL, NULL, NULL, 0, NULL, '2025-06-22 18:33:46.380917', '2025-06-22 18:33:46.380917');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_integraciones_logintegracion`
--

CREATE TABLE `aplicaciones_integraciones_logintegracion` (
  `id` int NOT NULL,
  `proveedor_id` int NOT NULL,
  `configuracion_id` int DEFAULT NULL,
  `tipo_operacion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion_operacion` text COLLATE utf8mb4_unicode_ci,
  `url_endpoint` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metodo_http` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `headers_request` json DEFAULT NULL,
  `payload_request` longtext COLLATE utf8mb4_unicode_ci,
  `codigo_respuesta_http` int DEFAULT NULL,
  `headers_respuesta` json DEFAULT NULL,
  `payload_respuesta` longtext COLLATE utf8mb4_unicode_ci,
  `tiempo_respuesta_ms` int DEFAULT NULL,
  `exitoso` tinyint(1) NOT NULL DEFAULT '0',
  `codigo_error` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mensaje_error` text COLLATE utf8mb4_unicode_ci,
  `referencia_tipo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `ip_origen` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_inicio` datetime(6) NOT NULL,
  `fecha_fin` datetime(6) DEFAULT NULL,
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_integraciones_proveedorintegracion`
--

CREATE TABLE `aplicaciones_integraciones_proveedorintegracion` (
  `id` int NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `tipo_proveedor` enum('sunat','banco','courier','otros') COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT '0',
  `url_base` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documentacion_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `aplicaciones_integraciones_proveedorintegracion`
--

INSERT INTO `aplicaciones_integraciones_proveedorintegracion` (`id`, `codigo`, `nombre`, `descripcion`, `tipo_proveedor`, `es_principal`, `url_base`, `documentacion_url`, `activo`, `fecha_creacion`) VALUES
(1, 'SUNAT_PSE', 'SUNAT - Portal de Servicios al Contribuyente', 'Portal oficial de SUNAT para servicios electrónicos', 'sunat', 1, 'https://www.sunat.gob.pe', NULL, 1, '2025-06-22 18:33:46.366616'),
(2, 'NUBEFACT', 'NubeFact', 'Proveedor de servicios de facturación electrónica', 'sunat', 0, 'https://api.nubefact.com', NULL, 1, '2025-06-22 18:33:46.366616'),
(3, 'FACTURADOR_PRO', 'Facturador PRO', 'Servicio alternativo de facturación electrónica', 'sunat', 0, 'https://api.facturadorpro.com', NULL, 0, '2025-06-22 18:33:46.366616'),
(4, 'BCP_API', 'Banco de Crédito del Perú - API', 'API del BCP para consultas bancarias', 'banco', 0, 'https://api.bcp.com.pe', NULL, 0, '2025-06-22 18:33:46.366616'),
(5, 'INTERBANK_API', 'Interbank - API', 'API de Interbank para servicios bancarios', 'banco', 0, 'https://api.interbank.pe', NULL, 0, '2025-06-22 18:33:46.366616'),
(6, 'OLVA_COURIER', 'Olva Courier', 'Servicio de courier y tracking de envíos', 'courier', 0, 'https://api.olvacourier.pe', NULL, 0, '2025-06-22 18:33:46.366616'),
(7, 'SHALOM_COURIER', 'Shalom Empresarial', 'Servicio de courier empresarial', 'courier', 0, 'https://api.shalomempresarial.com', NULL, 0, '2025-06-22 18:33:46.366616');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_inventario_loteinventario`
--

CREATE TABLE `aplicaciones_inventario_loteinventario` (
  `id` int NOT NULL,
  `producto_id` int NOT NULL,
  `numero_lote` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_ingreso` datetime(6) NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `cantidad_inicial` decimal(12,4) NOT NULL,
  `cantidad_actual` decimal(12,4) NOT NULL,
  `precio_unitario` decimal(12,4) NOT NULL,
  `costo_total` decimal(12,2) GENERATED ALWAYS AS ((`cantidad_actual` * `precio_unitario`)) VIRTUAL,
  `referencia_documento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proveedor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_inventario_movimientoinventario`
--

CREATE TABLE `aplicaciones_inventario_movimientoinventario` (
  `id` int NOT NULL,
  `producto_id` int NOT NULL,
  `lote_id` int DEFAULT NULL,
  `tipo_movimiento` enum('entrada','salida','ajuste','transferencia') COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` decimal(12,4) NOT NULL,
  `precio_unitario` decimal(12,4) DEFAULT NULL,
  `costo_total` decimal(12,2) DEFAULT NULL,
  `saldo_anterior` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `saldo_actual` decimal(12,4) NOT NULL,
  `referencia_tipo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'factura, compra, ajuste, etc',
  `referencia_id` int DEFAULT NULL,
  `referencia_numero` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_id` int NOT NULL,
  `almacen_origen` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `almacen_destino` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `fecha_movimiento` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_productos_categoriaproducto`
--

CREATE TABLE `aplicaciones_productos_categoriaproducto` (
  `id` int NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `categoria_padre_id` int DEFAULT NULL,
  `imagen` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `aplicaciones_productos_categoriaproducto`
--

INSERT INTO `aplicaciones_productos_categoriaproducto` (`id`, `codigo`, `nombre`, `descripcion`, `categoria_padre_id`, `imagen`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'PROD', 'PRODUCTOS', 'Categoría principal para productos físicos', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(2, 'SERV', 'SERVICIOS', 'Categoría principal para servicios', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(3, 'MAT', 'MATERIALES', 'Materiales y materias primas', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(4, 'HER', 'HERRAMIENTAS', 'Herramientas y equipos', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(5, 'OFI', 'OFICINA', 'Artículos de oficina y papelería', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(6, 'COMP', 'COMPUTACIÓN', 'Equipos y accesorios de computación', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(7, 'MUE', 'MUEBLES', 'Muebles y enseres', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(8, 'VEH', 'VEHÍCULOS', 'Vehículos y repuestos', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(9, 'ALI', 'ALIMENTOS', 'Alimentos y bebidas', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(10, 'ROB', 'ROPA', 'Ropa y textiles', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(11, 'LIB', 'LIBROS', 'Libros y material educativo', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(12, 'MED', 'MEDICAMENTOS', 'Medicamentos y productos farmacéuticos', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(13, 'COS', 'COSMÉTICOS', 'Cosméticos y productos de belleza', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(14, 'LIM', 'LIMPIEZA', 'Productos de limpieza e higiene', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(15, 'CONS', 'CONSTRUCCIÓN', 'Materiales de construcción', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(16, 'ELEC', 'ELECTRÓNICOS', 'Productos electrónicos', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(17, 'DEP', 'DEPORTES', 'Artículos deportivos', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(18, 'JUG', 'JUGUETES', 'Juguetes y entretenimiento', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(19, 'JAR', 'JARDÍN', 'Artículos de jardín y hogar', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076'),
(20, 'OTROS', 'OTROS', 'Productos varios no clasificados', NULL, NULL, 1, '2025-06-22 18:33:46.354076', '2025-06-22 18:33:46.354076');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_productos_producto`
--

CREATE TABLE `aplicaciones_productos_producto` (
  `id` int NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_barras` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_interno` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_proveedor` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `descripcion_corta` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria_id` int NOT NULL,
  `unidad_medida_id` int NOT NULL,
  `tipo_producto` enum('producto','servicio') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'producto',
  `precio_venta` decimal(12,4) NOT NULL,
  `precio_compra` decimal(12,4) DEFAULT NULL,
  `precio_promedio` decimal(12,4) DEFAULT '0.0000',
  `costo_ultimo` decimal(12,4) DEFAULT '0.0000',
  `margen_ganancia` decimal(5,2) DEFAULT '0.00',
  `moneda_precio` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PEN',
  `incluye_igv` tinyint(1) NOT NULL DEFAULT '1',
  `afecto_igv` tinyint(1) NOT NULL DEFAULT '1',
  `porcentaje_igv` decimal(5,2) NOT NULL DEFAULT '18.00',
  `stock_minimo` decimal(12,4) DEFAULT '0.0000',
  `stock_maximo` decimal(12,4) DEFAULT '0.0000',
  `stock_actual` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `stock_reservado` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `stock_disponible` decimal(12,4) GENERATED ALWAYS AS ((`stock_actual` - `stock_reservado`)) VIRTUAL,
  `peso` decimal(8,4) DEFAULT NULL,
  `dimensiones` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagen` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `galeria_imagenes` json DEFAULT NULL,
  `especificaciones` json DEFAULT NULL,
  `es_inventariable` tinyint(1) NOT NULL DEFAULT '1',
  `requiere_serie` tinyint(1) NOT NULL DEFAULT '0',
  `requiere_lote` tinyint(1) NOT NULL DEFAULT '0',
  `vida_util_dias` int DEFAULT NULL,
  `proveedor_principal` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion_almacen` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_productos_unidadmedida`
--

CREATE TABLE `aplicaciones_productos_unidadmedida` (
  `id` int NOT NULL,
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código SUNAT',
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `simbolo` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `aplicaciones_productos_unidadmedida`
--

INSERT INTO `aplicaciones_productos_unidadmedida` (`id`, `codigo`, `nombre`, `simbolo`, `descripcion`, `activo`, `fecha_creacion`) VALUES
(1, 'NIU', 'UNIDAD (BIENES)', 'UND', 'Unidad de medida para bienes en general', 1, '2025-06-22 18:33:46.347228'),
(2, 'ZZ', 'UNIDAD (SERVICIOS)', 'SERV', 'Unidad de medida para servicios', 1, '2025-06-22 18:33:46.347228'),
(3, 'MTR', 'METRO', 'm', 'Metro - unidad básica de longitud', 1, '2025-06-22 18:33:46.347228'),
(4, 'CMT', 'CENTÍMETRO', 'cm', 'Centímetro', 1, '2025-06-22 18:33:46.347228'),
(5, 'MMT', 'MILÍMETRO', 'mm', 'Milímetro', 1, '2025-06-22 18:33:46.347228'),
(6, 'KTM', 'KILÓMETRO', 'km', 'Kilómetro', 1, '2025-06-22 18:33:46.347228'),
(7, 'INH', 'PULGADA', 'in', 'Pulgada', 1, '2025-06-22 18:33:46.347228'),
(8, 'FOT', 'PIE', 'ft', 'Pie', 1, '2025-06-22 18:33:46.347228'),
(9, 'YRD', 'YARDA', 'yd', 'Yarda', 1, '2025-06-22 18:33:46.347228'),
(10, 'MTK', 'METRO CUADRADO', 'm²', 'Metro cuadrado', 1, '2025-06-22 18:33:46.347228'),
(11, 'CMK', 'CENTÍMETRO CUADRADO', 'cm²', 'Centímetro cuadrado', 1, '2025-06-22 18:33:46.347228'),
(12, 'MMK', 'MILÍMETRO CUADRADO', 'mm²', 'Milímetro cuadrado', 1, '2025-06-22 18:33:46.347228'),
(13, 'HAR', 'HECTÁREA', 'ha', 'Hectárea', 1, '2025-06-22 18:33:46.347228'),
(14, 'MTQ', 'METRO CÚBICO', 'm³', 'Metro cúbico', 1, '2025-06-22 18:33:46.347228'),
(15, 'CMQ', 'CENTÍMETRO CÚBICO', 'cm³', 'Centímetro cúbico', 1, '2025-06-22 18:33:46.347228'),
(16, 'LTR', 'LITRO', 'L', 'Litro', 1, '2025-06-22 18:33:46.347228'),
(17, 'MLT', 'MILILITRO', 'mL', 'Mililitro', 1, '2025-06-22 18:33:46.347228'),
(18, 'GLI', 'GALÓN INGLÉS', 'gal', 'Galón inglés', 1, '2025-06-22 18:33:46.347228'),
(19, 'GLL', 'GALÓN LÍQUIDO', 'gal', 'Galón líquido', 1, '2025-06-22 18:33:46.347228'),
(20, 'KGM', 'KILOGRAMO', 'kg', 'Kilogramo', 1, '2025-06-22 18:33:46.347228'),
(21, 'GRM', 'GRAMO', 'g', 'Gramo', 1, '2025-06-22 18:33:46.347228'),
(22, 'TNE', 'TONELADA MÉTRICA', 't', 'Tonelada métrica', 1, '2025-06-22 18:33:46.347228'),
(23, 'LBR', 'LIBRA', 'lb', 'Libra', 1, '2025-06-22 18:33:46.347228'),
(24, 'ONZ', 'ONZA', 'oz', 'Onza', 1, '2025-06-22 18:33:46.347228'),
(25, 'HUR', 'HORA', 'h', 'Hora', 1, '2025-06-22 18:33:46.347228'),
(26, 'MIN', 'MINUTO', 'min', 'Minuto', 1, '2025-06-22 18:33:46.347228'),
(27, 'SEC', 'SEGUNDO', 's', 'Segundo', 1, '2025-06-22 18:33:46.347228'),
(28, 'DAY', 'DÍA', 'día', 'Día', 1, '2025-06-22 18:33:46.347228'),
(29, 'WEE', 'SEMANA', 'sem', 'Semana', 1, '2025-06-22 18:33:46.347228'),
(30, 'MON', 'MES', 'mes', 'Mes', 1, '2025-06-22 18:33:46.347228'),
(31, 'ANN', 'AÑO', 'año', 'Año', 1, '2025-06-22 18:33:46.347228'),
(32, 'KWH', 'KILOVATIO HORA', 'kWh', 'Kilovatio hora', 1, '2025-06-22 18:33:46.347228'),
(33, 'WHR', 'VATIO HORA', 'Wh', 'Vatio hora', 1, '2025-06-22 18:33:46.347228'),
(34, 'BX', 'CAJA', 'caja', 'Caja', 1, '2025-06-22 18:33:46.347228'),
(35, 'PK', 'PAQUETE', 'paq', 'Paquete', 1, '2025-06-22 18:33:46.347228'),
(36, 'BG', 'BOLSA', 'bolsa', 'Bolsa', 1, '2025-06-22 18:33:46.347228'),
(37, 'BO', 'BOTELLA', 'bot', 'Botella', 1, '2025-06-22 18:33:46.347228'),
(38, 'CA', 'LATA', 'lata', 'Lata', 1, '2025-06-22 18:33:46.347228'),
(39, 'ST', 'HOJA', 'hoja', 'Hoja', 1, '2025-06-22 18:33:46.347228'),
(40, 'RM', 'RESMA', 'resma', 'Resma', 1, '2025-06-22 18:33:46.347228'),
(41, 'SET', 'CONJUNTO', 'set', 'Conjunto o juego', 1, '2025-06-22 18:33:46.347228'),
(42, 'PR', 'PAR', 'par', 'Par', 1, '2025-06-22 18:33:46.347228'),
(43, 'DZN', 'DOCENA', 'doc', 'Docena', 1, '2025-06-22 18:33:46.347228'),
(44, 'GRO', 'GRUESA', 'gruesa', 'Gruesa (144 unidades)', 1, '2025-06-22 18:33:46.347228'),
(45, 'BLL', 'BARRIL', 'barril', 'Barril', 1, '2025-06-22 18:33:46.347228'),
(46, 'CEN', 'CIENTO', 'ciento', 'Ciento', 1, '2025-06-22 18:33:46.347228'),
(47, 'MLL', 'MILLAR', 'millar', 'Millar', 1, '2025-06-22 18:33:46.347228');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aplicaciones_usuarios_usuario`
--

CREATE TABLE `aplicaciones_usuarios_usuario` (
  `id` int NOT NULL,
  `username` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `authtoken_token`
--

CREATE TABLE `authtoken_token` (
  `key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add content type', 4, 'add_contenttype'),
(14, 'Can change content type', 4, 'change_contenttype'),
(15, 'Can delete content type', 4, 'delete_contenttype'),
(16, 'Can view content type', 4, 'view_contenttype'),
(17, 'Can add session', 5, 'add_session'),
(18, 'Can change session', 5, 'change_session'),
(19, 'Can delete session', 5, 'delete_session'),
(20, 'Can view session', 5, 'view_session'),
(21, 'Can add Token', 6, 'add_token'),
(22, 'Can change Token', 6, 'change_token'),
(23, 'Can delete Token', 6, 'delete_token'),
(24, 'Can view Token', 6, 'view_token'),
(25, 'Can add Token', 7, 'add_tokenproxy'),
(26, 'Can change Token', 7, 'change_tokenproxy'),
(27, 'Can delete Token', 7, 'delete_tokenproxy'),
(28, 'Can view Token', 7, 'view_tokenproxy'),
(29, 'Can add Configuración del Sistema', 8, 'add_configuracionsistema'),
(30, 'Can change Configuración del Sistema', 8, 'change_configuracionsistema'),
(31, 'Can delete Configuración del Sistema', 8, 'delete_configuracionsistema'),
(32, 'Can view Configuración del Sistema', 8, 'view_configuracionsistema'),
(33, 'Can add Empresa', 9, 'add_empresa'),
(34, 'Can change Empresa', 9, 'change_empresa'),
(35, 'Can delete Empresa', 9, 'delete_empresa'),
(36, 'Can view Empresa', 9, 'view_empresa'),
(37, 'Can add Sucursal', 10, 'add_sucursal'),
(38, 'Can change Sucursal', 10, 'change_sucursal'),
(39, 'Can delete Sucursal', 10, 'delete_sucursal'),
(40, 'Can view Sucursal', 10, 'view_sucursal'),
(41, 'Can add Usuario', 11, 'add_usuario'),
(42, 'Can change Usuario', 11, 'change_usuario'),
(43, 'Can delete Usuario', 11, 'delete_usuario'),
(44, 'Can view Usuario', 11, 'view_usuario'),
(45, 'Can add Rol', 12, 'add_rol'),
(46, 'Can change Rol', 12, 'change_rol'),
(47, 'Can delete Rol', 12, 'delete_rol'),
(48, 'Can view Rol', 12, 'view_rol'),
(49, 'Can add Perfil de Usuario', 13, 'add_perfilusuario'),
(50, 'Can change Perfil de Usuario', 13, 'change_perfilusuario'),
(51, 'Can delete Perfil de Usuario', 13, 'delete_perfilusuario'),
(52, 'Can view Perfil de Usuario', 13, 'view_perfilusuario'),
(53, 'Can add Sesión de Usuario', 14, 'add_sesionusuario'),
(54, 'Can change Sesión de Usuario', 14, 'change_sesionusuario'),
(55, 'Can delete Sesión de Usuario', 14, 'delete_sesionusuario'),
(56, 'Can view Sesión de Usuario', 14, 'view_sesionusuario'),
(57, 'Can add Tipo de Documento', 15, 'add_tipodocumento'),
(58, 'Can change Tipo de Documento', 15, 'change_tipodocumento'),
(59, 'Can delete Tipo de Documento', 15, 'delete_tipodocumento'),
(60, 'Can view Tipo de Documento', 15, 'view_tipodocumento'),
(61, 'Can add Cliente', 16, 'add_cliente'),
(62, 'Can change Cliente', 16, 'change_cliente'),
(63, 'Can delete Cliente', 16, 'delete_cliente'),
(64, 'Can view Cliente', 16, 'view_cliente'),
(65, 'Can add Contacto de Cliente', 17, 'add_contactocliente'),
(66, 'Can change Contacto de Cliente', 17, 'change_contactocliente'),
(67, 'Can delete Contacto de Cliente', 17, 'delete_contactocliente'),
(68, 'Can view Contacto de Cliente', 17, 'view_contactocliente'),
(69, 'Can add Categoría', 18, 'add_categoria'),
(70, 'Can change Categoría', 18, 'change_categoria'),
(71, 'Can delete Categoría', 18, 'delete_categoria'),
(72, 'Can view Categoría', 18, 'view_categoria'),
(73, 'Can add Tipo de Producto', 19, 'add_tipoproducto'),
(74, 'Can change Tipo de Producto', 19, 'change_tipoproducto'),
(75, 'Can delete Tipo de Producto', 19, 'delete_tipoproducto'),
(76, 'Can view Tipo de Producto', 19, 'view_tipoproducto'),
(77, 'Can add Producto', 20, 'add_producto'),
(78, 'Can change Producto', 20, 'change_producto'),
(79, 'Can delete Producto', 20, 'delete_producto'),
(80, 'Can view Producto', 20, 'view_producto'),
(81, 'Can add Producto-Proveedor', 21, 'add_productoproveedor'),
(82, 'Can change Producto-Proveedor', 21, 'change_productoproveedor'),
(83, 'Can delete Producto-Proveedor', 21, 'delete_productoproveedor'),
(84, 'Can view Producto-Proveedor', 21, 'view_productoproveedor'),
(85, 'Can add Detalle de Documento', 22, 'add_detalledocumento'),
(86, 'Can change Detalle de Documento', 22, 'change_detalledocumento'),
(87, 'Can delete Detalle de Documento', 22, 'delete_detalledocumento'),
(88, 'Can view Detalle de Documento', 22, 'view_detalledocumento'),
(89, 'Can add Documento Electrónico', 23, 'add_documentoelectronico'),
(90, 'Can change Documento Electrónico', 23, 'change_documentoelectronico'),
(91, 'Can delete Documento Electrónico', 23, 'delete_documentoelectronico'),
(92, 'Can view Documento Electrónico', 23, 'view_documentoelectronico'),
(93, 'Can add Forma de Pago', 24, 'add_formapago'),
(94, 'Can change Forma de Pago', 24, 'change_formapago'),
(95, 'Can delete Forma de Pago', 24, 'delete_formapago'),
(96, 'Can view Forma de Pago', 24, 'view_formapago'),
(97, 'Can add Tipo de Documento Electrónico', 25, 'add_tipodocumentoelectronico'),
(98, 'Can change Tipo de Documento Electrónico', 25, 'change_tipodocumentoelectronico'),
(99, 'Can delete Tipo de Documento Electrónico', 25, 'delete_tipodocumentoelectronico'),
(100, 'Can view Tipo de Documento Electrónico', 25, 'view_tipodocumentoelectronico'),
(101, 'Can add Serie de Documento', 26, 'add_seriedocumento'),
(102, 'Can change Serie de Documento', 26, 'change_seriedocumento'),
(103, 'Can delete Serie de Documento', 26, 'delete_seriedocumento'),
(104, 'Can view Serie de Documento', 26, 'view_seriedocumento'),
(105, 'Can add Pago de Documento', 27, 'add_pagodocumento'),
(106, 'Can change Pago de Documento', 27, 'change_pagodocumento'),
(107, 'Can delete Pago de Documento', 27, 'delete_pagodocumento'),
(108, 'Can view Pago de Documento', 27, 'view_pagodocumento'),
(109, 'Can add Almacén', 28, 'add_almacen'),
(110, 'Can change Almacén', 28, 'change_almacen'),
(111, 'Can delete Almacén', 28, 'delete_almacen'),
(112, 'Can view Almacén', 28, 'view_almacen'),
(113, 'Can add Tipo de Movimiento', 29, 'add_tipomovimiento'),
(114, 'Can change Tipo de Movimiento', 29, 'change_tipomovimiento'),
(115, 'Can delete Tipo de Movimiento', 29, 'delete_tipomovimiento'),
(116, 'Can view Tipo de Movimiento', 29, 'view_tipomovimiento'),
(117, 'Can add Movimiento de Inventario', 30, 'add_movimientoinventario'),
(118, 'Can change Movimiento de Inventario', 30, 'change_movimientoinventario'),
(119, 'Can delete Movimiento de Inventario', 30, 'delete_movimientoinventario'),
(120, 'Can view Movimiento de Inventario', 30, 'view_movimientoinventario'),
(121, 'Can add Lote de Producto', 31, 'add_loteproducto'),
(122, 'Can change Lote de Producto', 31, 'change_loteproducto'),
(123, 'Can delete Lote de Producto', 31, 'delete_loteproducto'),
(124, 'Can view Lote de Producto', 31, 'view_loteproducto'),
(125, 'Can add Detalle de Movimiento', 32, 'add_detallemovimiento'),
(126, 'Can change Detalle de Movimiento', 32, 'change_detallemovimiento'),
(127, 'Can delete Detalle de Movimiento', 32, 'delete_detallemovimiento'),
(128, 'Can view Detalle de Movimiento', 32, 'view_detallemovimiento'),
(129, 'Can add Stock de Producto', 33, 'add_stockproducto'),
(130, 'Can change Stock de Producto', 33, 'change_stockproducto'),
(131, 'Can delete Stock de Producto', 33, 'delete_stockproducto'),
(132, 'Can view Stock de Producto', 33, 'view_stockproducto'),
(133, 'Can add Asiento Contable', 34, 'add_asientocontable'),
(134, 'Can change Asiento Contable', 34, 'change_asientocontable'),
(135, 'Can delete Asiento Contable', 34, 'delete_asientocontable'),
(136, 'Can view Asiento Contable', 34, 'view_asientocontable'),
(137, 'Can add Plan de Cuentas', 35, 'add_plancuentas'),
(138, 'Can change Plan de Cuentas', 35, 'change_plancuentas'),
(139, 'Can delete Plan de Cuentas', 35, 'delete_plancuentas'),
(140, 'Can view Plan de Cuentas', 35, 'view_plancuentas'),
(141, 'Can add Ejercicio Contable', 36, 'add_ejerciciocontable'),
(142, 'Can change Ejercicio Contable', 36, 'change_ejerciciocontable'),
(143, 'Can delete Ejercicio Contable', 36, 'delete_ejerciciocontable'),
(144, 'Can view Ejercicio Contable', 36, 'view_ejerciciocontable'),
(145, 'Can add Detalle de Asiento', 37, 'add_detalleasiento'),
(146, 'Can change Detalle de Asiento', 37, 'change_detalleasiento'),
(147, 'Can delete Detalle de Asiento', 37, 'delete_detalleasiento'),
(148, 'Can view Detalle de Asiento', 37, 'view_detalleasiento'),
(149, 'Can add Configuración Contable', 38, 'add_configuracioncontable'),
(150, 'Can change Configuración Contable', 38, 'change_configuracioncontable'),
(151, 'Can delete Configuración Contable', 38, 'delete_configuracioncontable'),
(152, 'Can view Configuración Contable', 38, 'view_configuracioncontable'),
(153, 'Can add Configuración de Integración', 39, 'add_configuracionintegracion'),
(154, 'Can change Configuración de Integración', 39, 'change_configuracionintegracion'),
(155, 'Can delete Configuración de Integración', 39, 'delete_configuracionintegracion'),
(156, 'Can view Configuración de Integración', 39, 'view_configuracionintegracion'),
(157, 'Can add Log de Integración', 40, 'add_logintegracion'),
(158, 'Can change Log de Integración', 40, 'change_logintegracion'),
(159, 'Can delete Log de Integración', 40, 'delete_logintegracion'),
(160, 'Can view Log de Integración', 40, 'view_logintegracion'),
(161, 'Can add Proveedor de Integración', 41, 'add_proveedorintegracion'),
(162, 'Can change Proveedor de Integración', 41, 'change_proveedorintegracion'),
(163, 'Can delete Proveedor de Integración', 41, 'delete_proveedorintegracion'),
(164, 'Can view Proveedor de Integración', 41, 'view_proveedorintegracion'),
(165, 'Can add Webhook de Integración', 42, 'add_webhookintegracion'),
(166, 'Can change Webhook de Integración', 42, 'change_webhookintegracion'),
(167, 'Can delete Webhook de Integración', 42, 'delete_webhookintegracion'),
(168, 'Can view Webhook de Integración', 42, 'view_webhookintegracion');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes_cliente`
--

CREATE TABLE `clientes_cliente` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `tipo_cliente` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_documento` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_comercial` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `celular` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `ubigeo` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departamento` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provincia` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `distrito` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descuento_maximo` decimal(5,2) NOT NULL,
  `credito_limite` decimal(12,2) NOT NULL,
  `dias_credito` int UNSIGNED NOT NULL,
  `es_agente_retencion` tinyint(1) NOT NULL,
  `es_buen_contribuyente` tinyint(1) NOT NULL,
  `bloqueado` tinyint(1) NOT NULL,
  `motivo_bloqueo` longtext COLLATE utf8mb4_unicode_ci,
  `fecha_primer_compra` datetime(6) DEFAULT NULL,
  `fecha_ultima_compra` datetime(6) DEFAULT NULL,
  `total_compras` decimal(12,2) NOT NULL,
  `numero_compras` int UNSIGNED NOT NULL,
  `validado_sunat` tinyint(1) NOT NULL,
  `fecha_validacion_sunat` datetime(6) DEFAULT NULL,
  `estado_sunat` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condicion_sunat` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_documento_id` bigint NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes_contacto_cliente`
--

CREATE TABLE `clientes_contacto_cliente` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cargo` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_principal` tinyint(1) NOT NULL,
  `recibe_facturas` tinyint(1) NOT NULL,
  `notas` longtext COLLATE utf8mb4_unicode_ci,
  `cliente_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes_tipo_documento`
--

CREATE TABLE `clientes_tipo_documento` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `longitud_minima` int UNSIGNED NOT NULL,
  `longitud_maxima` int UNSIGNED NOT NULL,
  `solo_numeros` tinyint(1) NOT NULL,
  `requiere_validacion` tinyint(1) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contabilidad_asiento_contable`
--

CREATE TABLE `contabilidad_asiento_contable` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `uuid` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` date NOT NULL,
  `tipo_asiento` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `glosa` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `documento_origen` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `moneda` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_cambio` decimal(8,4) NOT NULL,
  `total_debe` decimal(15,2) NOT NULL,
  `total_haber` decimal(15,2) NOT NULL,
  `diferencia` decimal(15,2) NOT NULL,
  `fecha_aprobacion` datetime(6) DEFAULT NULL,
  `centro_costo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proyecto` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `es_automatico` tinyint(1) NOT NULL,
  `proceso_origen` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documento_electronico_id` bigint DEFAULT NULL,
  `ejercicio_id` bigint NOT NULL,
  `usuario_aprobacion_id` bigint DEFAULT NULL,
  `usuario_creacion_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contabilidad_configuracion_contable`
--

CREATE TABLE `contabilidad_configuracion_contable` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `generar_asientos_venta` tinyint(1) NOT NULL,
  `generar_asientos_inventario` tinyint(1) NOT NULL,
  `usar_centro_costos` tinyint(1) NOT NULL,
  `usar_proyectos` tinyint(1) NOT NULL,
  `cerrar_automatico_mes` tinyint(1) NOT NULL,
  `cuenta_banco_principal_id` bigint DEFAULT NULL,
  `cuenta_caja_id` bigint NOT NULL,
  `cuenta_costo_ventas_id` bigint NOT NULL,
  `cuenta_cuentas_cobrar_boletas_id` bigint NOT NULL,
  `cuenta_cuentas_cobrar_facturas_id` bigint NOT NULL,
  `cuenta_igv_compras_id` bigint NOT NULL,
  `cuenta_igv_ventas_id` bigint NOT NULL,
  `cuenta_inventario_mercaderias_id` bigint NOT NULL,
  `cuenta_ventas_exoneradas_id` bigint DEFAULT NULL,
  `cuenta_ventas_gravadas_id` bigint NOT NULL,
  `cuenta_ventas_inafectas_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contabilidad_detalle_asiento`
--

CREATE TABLE `contabilidad_detalle_asiento` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `numero_linea` int UNSIGNED NOT NULL,
  `glosa` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `debe` decimal(15,2) NOT NULL,
  `haber` decimal(15,2) NOT NULL,
  `debe_me` decimal(15,2) NOT NULL,
  `haber_me` decimal(15,2) NOT NULL,
  `documento_referencia` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `centro_costo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proyecto` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_documento_tercero` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_documento_tercero` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `asiento_id` bigint NOT NULL,
  `cliente_proveedor_id` bigint DEFAULT NULL,
  `cuenta_id` bigint NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contabilidad_ejercicio_contable`
--

CREATE TABLE `contabilidad_ejercicio_contable` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_actual` tinyint(1) NOT NULL,
  `fecha_cierre` datetime(6) DEFAULT NULL,
  `observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `usuario_cierre_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contabilidad_plan_cuentas`
--

CREATE TABLE `contabilidad_plan_cuentas` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci,
  `nivel` int UNSIGNED NOT NULL,
  `tipo_cuenta` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `naturaleza` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `acepta_movimientos` tinyint(1) NOT NULL,
  `requiere_centro_costo` tinyint(1) NOT NULL,
  `requiere_documento` tinyint(1) NOT NULL,
  `moneda_funcional` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `elemento_pcge` varchar(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rubro_pcge` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `afecta_resultado` tinyint(1) NOT NULL,
  `es_cuenta_resultado` tinyint(1) NOT NULL,
  `se_ajusta_inflacion` tinyint(1) NOT NULL,
  `uso_automatico` tinyint(1) NOT NULL,
  `cuenta_ventas` tinyint(1) NOT NULL,
  `cuenta_compras` tinyint(1) NOT NULL,
  `cuenta_inventario` tinyint(1) NOT NULL,
  `cuenta_igv` tinyint(1) NOT NULL,
  `cuenta_cuentas_cobrar` tinyint(1) NOT NULL,
  `cuenta_cuentas_pagar` tinyint(1) NOT NULL,
  `saldo_inicial` decimal(15,2) NOT NULL,
  `saldo_debe` decimal(15,2) NOT NULL,
  `saldo_haber` decimal(15,2) NOT NULL,
  `saldo_actual` decimal(15,2) NOT NULL,
  `cuenta_padre_id` bigint DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `core_configuracion_sistema`
--

CREATE TABLE `core_configuracion_sistema` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci,
  `tipo_dato` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `core_configuracion_sistema`
--

INSERT INTO `core_configuracion_sistema` (`id`, `fecha_creacion`, `fecha_actualizacion`, `activo`, `clave`, `valor`, `descripcion`, `tipo_dato`) VALUES
(1, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'sunat_igv_tasa', '0.1800', 'Tasa de IGV vigente en Perú', 'decimal'),
(2, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'sunat_moneda_nacional', 'PEN', 'Código de moneda nacional (Soles)', 'string'),
(3, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'sunat_tipo_documento_ruc', '6', 'Código SUNAT para RUC', 'string'),
(4, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'sunat_tipo_documento_dni', '1', 'Código SUNAT para DNI', 'string'),
(5, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'factura_vigencia_dias', '7', 'Días de vigencia de una factura', 'integer'),
(6, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'boleta_vigencia_dias', '7', 'Días de vigencia de una boleta', 'integer'),
(7, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'serie_defecto_factura', 'F001', 'Serie por defecto para facturas', 'string'),
(8, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'serie_defecto_boleta', 'B001', 'Serie por defecto para boletas', 'string'),
(9, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'numeracion_inicial', '1', 'Número inicial para documentos', 'integer'),
(10, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'sistema_nombre', 'FELICITAFAC', 'Nombre del sistema', 'string'),
(11, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'sistema_version', '1.0.0', 'Versión actual del sistema', 'string'),
(12, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'sistema_mantenimiento', 'false', 'Estado de mantenimiento del sistema', 'boolean'),
(13, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'backup_automatico', 'true', 'Backup automático habilitado', 'boolean'),
(14, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'backup_frecuencia_horas', '24', 'Frecuencia de backup en horas', 'integer'),
(15, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'email_notificaciones', 'true', 'Envío de notificaciones por email', 'boolean'),
(16, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'email_facturas_automatico', 'true', 'Envío automático de facturas por email', 'boolean'),
(17, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'inventario_metodo', 'PEPS', 'Método de valorización de inventario', 'string'),
(18, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'inventario_alerta_stock_minimo', 'true', 'Alertas de stock mínimo', 'boolean'),
(19, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'inventario_stock_minimo_defecto', '10', 'Stock mínimo por defecto', 'integer'),
(20, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'reporte_formato_fecha', 'dd/mm/yyyy', 'Formato de fecha en reportes', 'string'),
(21, '2025-06-26 02:40:29.275102', '2025-06-26 02:40:29.275102', 1, 'reporte_decimales', '2', 'Número de decimales en reportes', 'integer');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `core_empresa`
--

CREATE TABLE `core_empresa` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `ruc` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_comercial` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `ubigeo` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `departamento` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provincia` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `distrito` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `web` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_sol` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clave_sol` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificado_digital` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clave_certificado` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pie_pagina` longtext COLLATE utf8mb4_unicode_ci,
  `moneda_defecto` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `igv_tasa` decimal(5,4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `core_empresa`
--

INSERT INTO `core_empresa` (`id`, `fecha_creacion`, `fecha_actualizacion`, `activo`, `ruc`, `razon_social`, `nombre_comercial`, `direccion`, `ubigeo`, `departamento`, `provincia`, `distrito`, `telefono`, `email`, `web`, `usuario_sol`, `clave_sol`, `certificado_digital`, `clave_certificado`, `logo`, `pie_pagina`, `moneda_defecto`, `igv_tasa`) VALUES
(1, '2025-06-26 02:40:29.301762', '2025-06-26 02:40:29.301762', 1, '20123456789', 'FELICITAFAC DESARROLLO SAC', 'FELICITAFAC', 'Av. Desarrollo 123, Oficina 456, Miraflores', '150140', 'LIMA', 'LIMA', 'MIRAFLORES', '01-1234567', 'desarrollo@felicitafac.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PEN', 0.1800);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `core_sucursal`
--

CREATE TABLE `core_sucursal` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_principal` tinyint(1) NOT NULL,
  `serie_factura` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serie_boleta` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serie_nota_credito` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serie_nota_debito` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contador_factura` int UNSIGNED NOT NULL,
  `contador_boleta` int UNSIGNED NOT NULL,
  `contador_nota_credito` int UNSIGNED NOT NULL,
  `contador_nota_debito` int UNSIGNED NOT NULL,
  `empresa_id` bigint NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE utf8mb4_unicode_ci,
  `object_repr` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_flag` smallint UNSIGNED NOT NULL,
  `change_message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int NOT NULL,
  `app_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(6, 'authtoken', 'token'),
(7, 'authtoken', 'tokenproxy'),
(16, 'clientes', 'cliente'),
(17, 'clientes', 'contactocliente'),
(15, 'clientes', 'tipodocumento'),
(34, 'contabilidad', 'asientocontable'),
(38, 'contabilidad', 'configuracioncontable'),
(37, 'contabilidad', 'detalleasiento'),
(36, 'contabilidad', 'ejerciciocontable'),
(35, 'contabilidad', 'plancuentas'),
(4, 'contenttypes', 'contenttype'),
(8, 'core', 'configuracionsistema'),
(9, 'core', 'empresa'),
(10, 'core', 'sucursal'),
(22, 'facturacion', 'detalledocumento'),
(23, 'facturacion', 'documentoelectronico'),
(24, 'facturacion', 'formapago'),
(27, 'facturacion', 'pagodocumento'),
(26, 'facturacion', 'seriedocumento'),
(25, 'facturacion', 'tipodocumentoelectronico'),
(39, 'integraciones', 'configuracionintegracion'),
(40, 'integraciones', 'logintegracion'),
(41, 'integraciones', 'proveedorintegracion'),
(42, 'integraciones', 'webhookintegracion'),
(28, 'inventario', 'almacen'),
(32, 'inventario', 'detallemovimiento'),
(31, 'inventario', 'loteproducto'),
(30, 'inventario', 'movimientoinventario'),
(33, 'inventario', 'stockproducto'),
(29, 'inventario', 'tipomovimiento'),
(18, 'productos', 'categoria'),
(20, 'productos', 'producto'),
(21, 'productos', 'productoproveedor'),
(19, 'productos', 'tipoproducto'),
(5, 'sessions', 'session'),
(13, 'usuarios', 'perfilusuario'),
(12, 'usuarios', 'rol'),
(14, 'usuarios', 'sesionusuario'),
(11, 'usuarios', 'usuario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL,
  `app` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-06-22 22:30:30.446886'),
(2, 'contenttypes', '0002_remove_content_type_name', '2025-06-22 22:30:30.594683'),
(3, 'auth', '0001_initial', '2025-06-22 22:30:31.165444'),
(4, 'auth', '0002_alter_permission_name_max_length', '2025-06-22 22:30:31.266320'),
(5, 'auth', '0003_alter_user_email_max_length', '2025-06-22 22:30:31.274761'),
(6, 'auth', '0004_alter_user_username_opts', '2025-06-22 22:30:31.283310'),
(7, 'auth', '0005_alter_user_last_login_null', '2025-06-22 22:30:31.291638'),
(8, 'auth', '0006_require_contenttypes_0002', '2025-06-22 22:30:31.297829'),
(9, 'auth', '0007_alter_validators_add_error_messages', '2025-06-22 22:30:31.307987'),
(10, 'auth', '0008_alter_user_username_max_length', '2025-06-22 22:30:31.318229'),
(11, 'auth', '0009_alter_user_last_name_max_length', '2025-06-22 22:30:31.328395'),
(12, 'auth', '0010_alter_group_name_max_length', '2025-06-22 22:30:31.353805'),
(13, 'auth', '0011_update_proxy_permissions', '2025-06-22 22:30:31.363163'),
(14, 'auth', '0012_alter_user_first_name_max_length', '2025-06-22 22:30:31.371977'),
(15, 'usuarios', '0001_initial', '2025-06-22 22:30:33.125986'),
(16, 'admin', '0001_initial', '2025-06-22 22:30:33.393182'),
(17, 'admin', '0002_logentry_remove_auto_add', '2025-06-22 22:30:33.405552'),
(18, 'admin', '0003_logentry_add_action_flag_choices', '2025-06-22 22:30:33.420477'),
(19, 'authtoken', '0001_initial', '2025-06-22 22:30:33.558127'),
(20, 'authtoken', '0002_auto_20160226_1747', '2025-06-22 22:30:33.592338'),
(21, 'authtoken', '0003_tokenproxy', '2025-06-22 22:30:33.601255'),
(22, 'authtoken', '0004_alter_tokenproxy_options', '2025-06-22 22:30:33.611116'),
(23, 'clientes', '0001_initial', '2025-06-22 22:30:34.816290'),
(24, 'productos', '0001_initial', '2025-06-22 22:30:36.960842'),
(25, 'core', '0001_initial', '2025-06-22 22:30:37.926440'),
(26, 'facturacion', '0001_initial', '2025-06-22 22:30:42.178739'),
(27, 'contabilidad', '0001_initial', '2025-06-22 22:30:48.127684'),
(28, 'inventario', '0001_initial', '2025-06-22 22:30:53.906678'),
(29, 'sessions', '0001_initial', '2025-06-22 22:30:53.989453'),
(30, 'integraciones', '0001_initial', '2025-06-25 01:14:48.421883'),
(31, 'core', '0002_rename_idx_config_clave_idx_core_config_clave_and_more', '2025-06-25 02:10:36.719901');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('h7fskzkur8b7d44xahvujb3rf2hqy21q', '.eJxVjMEOwiAQRP-FsyGCdAGP3vsNZHfZStXQpLQn47_bJj3oZQ7z3sxbJVyXktYmcxqzuiqjTr8dIT-l7iA_sN4nzVNd5pH0ruiDNt1PWV63w_07KNjKtiahyBfPzN6LyBksOILORDJdEDBu2CJCMC6ADUwxIgsNhjJYwhzV5wv2NTh4:1uUGLX:tjJlqgSdLAuVQXDPgfIeyHghEAtQnvMjGjlXzFnJlu8', '2025-06-26 02:58:47.154044'),
('k03ir8bblklkwl5ca3sn7dmhlswajnhe', '.eJxVjMEOwiAQRP-FsyGCdAGP3vsNZHfZStXQpLQn47_bJj3oZQ7z3sxbJVyXktYmcxqzuiqjTr8dIT-l7iA_sN4nzVNd5pH0ruiDNt1PWV63w_07KNjKtiahyBfPzN6LyBksOILORDJdEDBu2CJCMC6ADUwxIgsNhjJYwhzV5wv2NTh4:1uTUyL:-iXcOtQkI0pTFocjU5DxGkSKwfGsm-Utfs0J5veZtN8', '2025-06-24 00:23:41.646764');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturacion_detalle_documento`
--

CREATE TABLE `facturacion_detalle_documento` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `numero_item` int UNSIGNED NOT NULL,
  `codigo_producto` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `unidad_medida` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` decimal(12,4) NOT NULL,
  `precio_unitario` decimal(12,4) NOT NULL,
  `precio_unitario_con_igv` decimal(12,4) NOT NULL,
  `descuento_porcentaje` decimal(5,2) NOT NULL,
  `descuento` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `base_imponible` decimal(12,2) NOT NULL,
  `igv` decimal(12,2) NOT NULL,
  `total_item` decimal(12,2) NOT NULL,
  `tipo_afectacion_igv` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_tributo` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `porcentaje_igv` decimal(5,2) NOT NULL,
  `es_gratuito` tinyint(1) NOT NULL,
  `lote` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_vencimiento_producto` date DEFAULT NULL,
  `observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `documento_id` bigint NOT NULL,
  `producto_id` bigint NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturacion_documento_electronico`
--

CREATE TABLE `facturacion_documento_electronico` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `uuid` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero` int UNSIGNED NOT NULL,
  `numero_completo` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_emision` datetime(6) NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `cliente_tipo_documento` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_numero_documento` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_razon_social` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_direccion` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `moneda` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_cambio` decimal(8,4) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `total_descuentos` decimal(12,2) NOT NULL,
  `base_imponible` decimal(12,2) NOT NULL,
  `igv` decimal(12,2) NOT NULL,
  `total_exonerado` decimal(12,2) NOT NULL,
  `total_inafecto` decimal(12,2) NOT NULL,
  `total_gratuito` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `condiciones_pago` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo_anulacion` longtext COLLATE utf8mb4_unicode_ci,
  `hash_documento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_qr` longtext COLLATE utf8mb4_unicode_ci,
  `enlace_pdf` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enlace_xml` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enlace_cdr` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_envio_sunat` datetime(6) DEFAULT NULL,
  `fecha_respuesta_sunat` datetime(6) DEFAULT NULL,
  `tipo_nota` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo_nota` longtext COLLATE utf8mb4_unicode_ci,
  `cliente_id` bigint NOT NULL,
  `documento_referencia_id` bigint DEFAULT NULL,
  `serie_documento_id` bigint NOT NULL,
  `tipo_documento_id` bigint NOT NULL,
  `vendedor_id` bigint DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturacion_forma_pago`
--

CREATE TABLE `facturacion_forma_pago` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requiere_referencia` tinyint(1) NOT NULL,
  `es_credito` tinyint(1) NOT NULL,
  `dias_credito_defecto` int UNSIGNED NOT NULL,
  `cuenta_contable` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int UNSIGNED NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturacion_pago_documento`
--

CREATE TABLE `facturacion_pago_documento` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `referencia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_pago` datetime(6) NOT NULL,
  `observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `documento_id` bigint NOT NULL,
  `forma_pago_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturacion_serie_documento`
--

CREATE TABLE `facturacion_serie_documento` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `serie` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_actual` int UNSIGNED NOT NULL,
  `numero_maximo` int UNSIGNED NOT NULL,
  `es_predeterminada` tinyint(1) NOT NULL,
  `observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `sucursal_id` bigint NOT NULL,
  `tipo_documento_id` bigint NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturacion_tipo_documento_electronico`
--

CREATE TABLE `facturacion_tipo_documento_electronico` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo_sunat` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nomenclatura` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requiere_cliente_ruc` tinyint(1) NOT NULL,
  `permite_exportacion` tinyint(1) NOT NULL,
  `afecta_inventario` tinyint(1) NOT NULL,
  `afecta_cuentas_cobrar` tinyint(1) NOT NULL,
  `requiere_referencia` tinyint(1) NOT NULL,
  `serie_defecto` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `integraciones_configuracion_integracion`
--

CREATE TABLE `integraciones_configuracion_integracion` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `ambiente` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` longtext COLLATE utf8mb4_unicode_ci,
  `api_key` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ruc_empresa` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_establecimiento` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_base` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_pdf` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url_xml` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_empresa_url` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `datos_empresa_json` longtext COLLATE utf8mb4_unicode_ci,
  `formato_pdf` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `incluir_qr` tinyint(1) NOT NULL,
  `validar_receptor` tinyint(1) NOT NULL,
  `enviar_email` tinyint(1) NOT NULL,
  `configuracion_valida` tinyint(1) NOT NULL,
  `fecha_validacion` datetime(6) DEFAULT NULL,
  `mensaje_validacion` longtext COLLATE utf8mb4_unicode_ci,
  `configuracion_avanzada_json` longtext COLLATE utf8mb4_unicode_ci,
  `proveedor_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `integraciones_log_integracion`
--

CREATE TABLE `integraciones_log_integracion` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `uuid` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_operacion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_envio` datetime(6) NOT NULL,
  `fecha_respuesta` datetime(6) DEFAULT NULL,
  `tiempo_respuesta_ms` int UNSIGNED DEFAULT NULL,
  `endpoint_utilizado` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metodo_http` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `headers_envio` longtext COLLATE utf8mb4_unicode_ci,
  `payload_envio` longtext COLLATE utf8mb4_unicode_ci,
  `codigo_respuesta_http` int UNSIGNED DEFAULT NULL,
  `headers_respuesta` longtext COLLATE utf8mb4_unicode_ci,
  `payload_respuesta` longtext COLLATE utf8mb4_unicode_ci,
  `exitoso` tinyint(1) NOT NULL,
  `codigo_error` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mensaje_error` longtext COLLATE utf8mb4_unicode_ci,
  `hash_sunat` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_qr` longtext COLLATE utf8mb4_unicode_ci,
  `enlace_pdf` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enlace_xml` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enlace_cdr` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_intento` int UNSIGNED NOT NULL,
  `ip_origen` char(39) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` longtext COLLATE utf8mb4_unicode_ci,
  `observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `configuracion_id` bigint NOT NULL,
  `documento_electronico_id` bigint DEFAULT NULL,
  `proveedor_id` bigint NOT NULL,
  `reintento_de_id` bigint DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `integraciones_proveedor_integracion`
--

CREATE TABLE `integraciones_proveedor_integracion` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci,
  `url_api` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_documentacion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version_api` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_principal` tinyint(1) NOT NULL,
  `limite_documentos_dia` int UNSIGNED NOT NULL,
  `tiempo_espera_segundos` int UNSIGNED NOT NULL,
  `reintentos_maximos` int UNSIGNED NOT NULL,
  `requiere_token` tinyint(1) NOT NULL,
  `tipo_autenticacion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `endpoint_emision` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `endpoint_consulta` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `endpoint_anulacion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endpoint_comunicacion_baja` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `formato_respuesta` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_documentos_enviados` int UNSIGNED NOT NULL,
  `total_documentos_exitosos` int UNSIGNED NOT NULL,
  `total_documentos_error` int UNSIGNED NOT NULL,
  `fecha_ultimo_envio` datetime(6) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `integraciones_webhook_integracion`
--

CREATE TABLE `integraciones_webhook_integracion` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `uuid` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_webhook` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_recepcion` datetime(6) NOT NULL,
  `fecha_procesamiento` datetime(6) DEFAULT NULL,
  `headers_recibidos` longtext COLLATE utf8mb4_unicode_ci,
  `payload_recibido` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `documento_referencia` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mensaje_procesamiento` longtext COLLATE utf8mb4_unicode_ci,
  `error_procesamiento` longtext COLLATE utf8mb4_unicode_ci,
  `ip_origen` char(39) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` longtext COLLATE utf8mb4_unicode_ci,
  `signature_header` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signature_valida` tinyint(1) NOT NULL,
  `documento_electronico_id` bigint DEFAULT NULL,
  `proveedor_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_almacen`
--

CREATE TABLE `inventario_almacen` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci,
  `direccion` longtext COLLATE utf8mb4_unicode_ci,
  `capacidad_maxima` decimal(12,2) DEFAULT NULL,
  `unidad_capacidad` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_principal` tinyint(1) NOT NULL,
  `permite_ventas` tinyint(1) NOT NULL,
  `permite_compras` tinyint(1) NOT NULL,
  `controla_ubicaciones` tinyint(1) NOT NULL,
  `temperatura_min` decimal(5,2) DEFAULT NULL,
  `temperatura_max` decimal(5,2) DEFAULT NULL,
  `humedad_min` decimal(5,2) DEFAULT NULL,
  `humedad_max` decimal(5,2) DEFAULT NULL,
  `responsable_id` bigint DEFAULT NULL,
  `sucursal_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_detalle_movimiento`
--

CREATE TABLE `inventario_detalle_movimiento` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `numero_item` int UNSIGNED NOT NULL,
  `cantidad` decimal(12,4) NOT NULL,
  `costo_unitario` decimal(12,4) NOT NULL,
  `valor_total` decimal(12,2) NOT NULL,
  `numero_lote_entrada` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_vencimiento_entrada` date DEFAULT NULL,
  `observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `ejecutado` tinyint(1) NOT NULL,
  `fecha_ejecucion` datetime(6) DEFAULT NULL,
  `lote_id` bigint DEFAULT NULL,
  `movimiento_id` bigint NOT NULL,
  `producto_id` bigint NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_lote_producto`
--

CREATE TABLE `inventario_lote_producto` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `numero_lote` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_ingreso` datetime(6) NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `cantidad_inicial` decimal(12,4) NOT NULL,
  `cantidad_actual` decimal(12,4) NOT NULL,
  `costo_unitario` decimal(12,4) NOT NULL,
  `valor_total` decimal(12,2) NOT NULL,
  `documento_origen` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `estado_calidad` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `temperatura_almacenamiento` decimal(5,2) DEFAULT NULL,
  `humedad_almacenamiento` decimal(5,2) DEFAULT NULL,
  `almacen_id` bigint NOT NULL,
  `producto_id` bigint NOT NULL,
  `proveedor_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_movimiento_inventario`
--

CREATE TABLE `inventario_movimiento_inventario` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `uuid` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_movimiento` datetime(6) NOT NULL,
  `documento_origen` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_autorizacion` datetime(6) DEFAULT NULL,
  `observaciones` longtext COLLATE utf8mb4_unicode_ci,
  `motivo` longtext COLLATE utf8mb4_unicode_ci,
  `total_items` int UNSIGNED NOT NULL,
  `total_cantidad` decimal(12,4) NOT NULL,
  `total_valor` decimal(12,2) NOT NULL,
  `almacen_id` bigint NOT NULL,
  `documento_electronico_id` bigint DEFAULT NULL,
  `proveedor_cliente_id` bigint DEFAULT NULL,
  `tipo_movimiento_id` bigint NOT NULL,
  `usuario_autorizacion_id` bigint DEFAULT NULL,
  `usuario_creacion_id` bigint NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_stock_producto`
--

CREATE TABLE `inventario_stock_producto` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `cantidad_actual` decimal(12,4) NOT NULL,
  `cantidad_reservada` decimal(12,4) NOT NULL,
  `cantidad_disponible` decimal(12,4) NOT NULL,
  `costo_promedio` decimal(12,4) NOT NULL,
  `valor_inventario` decimal(12,2) NOT NULL,
  `fecha_ultimo_movimiento` datetime(6) DEFAULT NULL,
  `fecha_ultimo_ingreso` datetime(6) DEFAULT NULL,
  `fecha_ultima_salida` datetime(6) DEFAULT NULL,
  `ubicacion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pasillo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estante` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nivel` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `almacen_id` bigint NOT NULL,
  `producto_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_tipo_movimiento`
--

CREATE TABLE `inventario_tipo_movimiento` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `afecta_costo` tinyint(1) NOT NULL,
  `requiere_autorizacion` tinyint(1) NOT NULL,
  `genera_documento` tinyint(1) NOT NULL,
  `cuenta_contable_debe` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuenta_contable_haber` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int UNSIGNED NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_categoria`
--

CREATE TABLE `productos_categoria` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci,
  `orden` int UNSIGNED NOT NULL,
  `margen_utilidad_defecto` decimal(5,2) NOT NULL,
  `cuenta_contable_ventas` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuenta_contable_inventario` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria_padre_id` bigint DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_producto`
--

CREATE TABLE `productos_producto` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci,
  `codigo_barras` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_interno` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_proveedor` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_producto_sunat` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_afectacion_igv` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio_compra` decimal(12,4) NOT NULL,
  `precio_venta` decimal(12,4) NOT NULL,
  `precio_venta_con_igv` decimal(12,4) NOT NULL,
  `margen_utilidad` decimal(5,2) NOT NULL,
  `stock_actual` decimal(12,4) NOT NULL,
  `stock_minimo` decimal(12,4) NOT NULL,
  `stock_maximo` decimal(12,4) NOT NULL,
  `punto_reorden` decimal(12,4) NOT NULL,
  `unidad_medida` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unidad_medida_sunat` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `peso` decimal(8,4) DEFAULT NULL,
  `volumen` decimal(8,4) DEFAULT NULL,
  `permite_venta` tinyint(1) NOT NULL,
  `permite_compra` tinyint(1) NOT NULL,
  `controla_stock` tinyint(1) NOT NULL,
  `permite_descuento` tinyint(1) NOT NULL,
  `descuento_maximo` decimal(5,2) NOT NULL,
  `marca` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modelo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `talla` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `fecha_ultima_compra` datetime(6) DEFAULT NULL,
  `fecha_ultima_venta` datetime(6) DEFAULT NULL,
  `cuenta_contable_ventas` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuenta_contable_compras` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuenta_contable_inventario` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_vendido` decimal(12,4) NOT NULL,
  `total_comprado` decimal(12,4) NOT NULL,
  `monto_total_ventas` decimal(12,2) NOT NULL,
  `numero_ventas` int UNSIGNED NOT NULL,
  `categoria_id` bigint NOT NULL,
  `tipo_producto_id` bigint NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_producto_proveedor`
--

CREATE TABLE `productos_producto_proveedor` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo_proveedor` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `precio_compra` decimal(12,4) NOT NULL,
  `tiempo_entrega_dias` int UNSIGNED NOT NULL,
  `cantidad_minima` decimal(12,4) NOT NULL,
  `es_principal` tinyint(1) NOT NULL,
  `fecha_ultimo_precio` datetime(6) NOT NULL,
  `notas` longtext COLLATE utf8mb4_unicode_ci,
  `producto_id` bigint NOT NULL,
  `proveedor_id` bigint NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_tipo_producto`
--

CREATE TABLE `productos_tipo_producto` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unidad_medida_sunat` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `controla_stock` tinyint(1) NOT NULL,
  `permite_decimales` tinyint(1) NOT NULL,
  `requiere_lote` tinyint(1) NOT NULL,
  `requiere_vencimiento` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_perfil`
--

CREATE TABLE `usuarios_perfil` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pais` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tema_oscuro` tinyint(1) NOT NULL,
  `idioma` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `configuracion_dashboard` json NOT NULL,
  `cargo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empresa` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `biografia` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios_perfil`
--

INSERT INTO `usuarios_perfil` (`id`, `fecha_creacion`, `fecha_actualizacion`, `activo`, `fecha_nacimiento`, `direccion`, `ciudad`, `pais`, `tema_oscuro`, `idioma`, `timezone`, `configuracion_dashboard`, `cargo`, `empresa`, `biografia`, `avatar`, `usuario_id`) VALUES
(1, '2025-06-22 23:49:36.567445', '2025-06-22 23:49:36.567467', 1, NULL, '', 'Lima', 'Perú', 0, 'es', 'America/Lima', '{}', 'Miguel Antonio', 'FELICITAFAC', '', '', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_rol`
--

CREATE TABLE `usuarios_rol` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `nivel_acceso` int UNSIGNED NOT NULL,
  `permisos_especiales` json NOT NULL
) ;

--
-- Volcado de datos para la tabla `usuarios_rol`
--

INSERT INTO `usuarios_rol` (`id`, `fecha_creacion`, `fecha_actualizacion`, `activo`, `nombre`, `codigo`, `descripcion`, `nivel_acceso`, `permisos_especiales`) VALUES
(5, '2025-06-22 23:49:12.327781', '2025-06-22 23:49:12.327845', 1, 'Administrador', 'administrador', 'Acceso total al sistema de facturación', 4, '{\"ver_reportes\": true, \"ver_dashboard\": true, \"crear_facturas\": true, \"crear_usuarios\": true, \"exportar_datos\": true, \"anular_facturas\": true, \"editar_usuarios\": true, \"eliminar_usuarios\": true, \"configurar_sistema\": true, \"gestionar_inventario\": true}'),
(6, '2025-06-22 23:49:12.335312', '2025-06-22 23:49:12.335337', 1, 'Contador', 'contador', 'Acceso a reportes y configuración contable', 3, '{\"ver_reportes\": true, \"ver_dashboard\": true, \"crear_facturas\": true, \"exportar_datos\": true, \"gestionar_inventario\": true}'),
(7, '2025-06-22 23:49:12.340721', '2025-06-22 23:49:12.340747', 1, 'Vendedor', 'vendedor', 'Acceso al punto de venta y gestión de clientes', 2, '{\"ver_dashboard\": true, \"crear_facturas\": true, \"gestionar_inventario\": true}'),
(8, '2025-06-22 23:49:12.348227', '2025-06-22 23:49:12.348251', 1, 'Cliente', 'cliente', 'Consulta de comprobantes propios', 1, '{\"ver_dashboard\": true}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_sesion`
--

CREATE TABLE `usuarios_sesion` (
  `id` bigint NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `token_sesion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` char(39) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` datetime(6) NOT NULL,
  `fecha_ultimo_uso` datetime(6) NOT NULL,
  `activa` tinyint(1) NOT NULL,
  `fecha_expiracion` datetime(6) NOT NULL,
  `usuario_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_usuario`
--

CREATE TABLE `usuarios_usuario` (
  `id` bigint NOT NULL,
  `password` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_documento` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_documento` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_usuario` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `fecha_ultimo_login` datetime(6) DEFAULT NULL,
  `intentos_login_fallidos` int UNSIGNED NOT NULL,
  `fecha_bloqueo` datetime(6) DEFAULT NULL,
  `debe_cambiar_password` tinyint(1) NOT NULL,
  `fecha_cambio_password` datetime(6) DEFAULT NULL,
  `notificaciones_email` tinyint(1) NOT NULL,
  `notificaciones_sistema` tinyint(1) NOT NULL,
  `rol_id` bigint NOT NULL
) ;

--
-- Volcado de datos para la tabla `usuarios_usuario`
--

INSERT INTO `usuarios_usuario` (`id`, `password`, `last_login`, `is_superuser`, `fecha_creacion`, `fecha_actualizacion`, `activo`, `email`, `nombres`, `apellidos`, `tipo_documento`, `numero_documento`, `telefono`, `estado_usuario`, `is_staff`, `is_active`, `fecha_ultimo_login`, `intentos_login_fallidos`, `fecha_bloqueo`, `debe_cambiar_password`, `fecha_cambio_password`, `notificaciones_email`, `notificaciones_sistema`, `rol_id`) VALUES
(1, 'pbkdf2_sha256$600000$Onfyx9oRXxHTwbe90Ympml$eKpxGiQZK477qOqEFIPfwNIKHBdKYh/g/0HSPjSZCPs=', '2025-06-24 02:48:08.648226', 1, '2025-06-22 23:49:36.551587', '2025-06-22 23:49:36.551619', 1, 'admin@felicitafac.com', 'Miguel Antonio', 'Cuadros Gonzales', 'dni', '70035765', NULL, 'activo', 1, 1, '2025-06-24 02:48:08.657558', 0, NULL, 0, NULL, 1, 1, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_usuario_groups`
--

CREATE TABLE `usuarios_usuario_groups` (
  `id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  `group_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_usuario_user_permissions`
--

CREATE TABLE `usuarios_usuario_user_permissions` (
  `id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `aplicaciones_clientes_cliente`
--
ALTER TABLE `aplicaciones_clientes_cliente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_documento` (`tipo_documento`,`numero_documento`),
  ADD KEY `idx_cliente_tipo_documento` (`tipo_documento`),
  ADD KEY `idx_cliente_numero_documento` (`numero_documento`),
  ADD KEY `idx_cliente_razon_social` (`razon_social`),
  ADD KEY `idx_cliente_activo` (`activo`),
  ADD KEY `idx_cliente_fecha_creacion` (`fecha_creacion`),
  ADD KEY `idx_cliente_vendedor` (`vendedor_asignado_id`);

--
-- Indices de la tabla `aplicaciones_contabilidad_asientocontable`
--
ALTER TABLE `aplicaciones_contabilidad_asientocontable`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asiento_numero` (`numero`),
  ADD KEY `idx_asiento_fecha` (`fecha_asiento`),
  ADD KEY `idx_asiento_periodo` (`periodo`),
  ADD KEY `idx_asiento_estado` (`estado`),
  ADD KEY `idx_asiento_referencia` (`referencia_modelo`,`referencia_id`),
  ADD KEY `idx_asiento_usuario_creacion` (`usuario_creacion_id`),
  ADD KEY `idx_asiento_automatico` (`automatico`),
  ADD KEY `usuario_validacion_id` (`usuario_validacion_id`);

--
-- Indices de la tabla `aplicaciones_contabilidad_detalleasiento`
--
ALTER TABLE `aplicaciones_contabilidad_detalleasiento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_detalle_asiento` (`asiento_id`),
  ADD KEY `idx_detalle_cuenta` (`cuenta_id`),
  ADD KEY `idx_detalle_numero_linea` (`numero_linea`),
  ADD KEY `idx_detalle_centro_costo` (`centro_costo`),
  ADD KEY `idx_detalle_auxiliar` (`auxiliar`);

--
-- Indices de la tabla `aplicaciones_contabilidad_plancuentas`
--
ALTER TABLE `aplicaciones_contabilidad_plancuentas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_cuenta_codigo` (`codigo`),
  ADD KEY `idx_cuenta_tipo` (`tipo_cuenta`),
  ADD KEY `idx_cuenta_nivel` (`nivel`),
  ADD KEY `idx_cuenta_padre` (`cuenta_padre_id`),
  ADD KEY `idx_cuenta_movimiento` (`es_movimiento`),
  ADD KEY `idx_cuenta_activo` (`activo`);

--
-- Indices de la tabla `aplicaciones_core_configuracion`
--
ALTER TABLE `aplicaciones_core_configuracion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clave` (`clave`),
  ADD KEY `idx_configuracion_clave` (`clave`),
  ADD KEY `idx_configuracion_categoria` (`categoria`),
  ADD KEY `idx_configuracion_activo` (`activo`);

--
-- Indices de la tabla `aplicaciones_core_empresa`
--
ALTER TABLE `aplicaciones_core_empresa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ruc` (`ruc`),
  ADD KEY `idx_empresa_ruc` (`ruc`),
  ADD KEY `idx_empresa_activo` (`activo`),
  ADD KEY `idx_empresa_fecha_creacion` (`fecha_creacion`);

--
-- Indices de la tabla `aplicaciones_facturacion_detallefactura`
--
ALTER TABLE `aplicaciones_facturacion_detallefactura`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_detalle_factura` (`factura_id`),
  ADD KEY `idx_detalle_producto` (`producto_id`),
  ADD KEY `idx_detalle_numero_item` (`numero_item`),
  ADD KEY `idx_detalle_lote` (`lote_id`);

--
-- Indices de la tabla `aplicaciones_facturacion_factura`
--
ALTER TABLE `aplicaciones_facturacion_factura`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_factura_serie_numero` (`serie_documento_id`,`numero`),
  ADD KEY `idx_factura_cliente` (`cliente_id`),
  ADD KEY `idx_factura_fecha_emision` (`fecha_emision`),
  ADD KEY `idx_factura_estado` (`estado`),
  ADD KEY `idx_factura_numero_completo` (`serie_documento_id`,`numero`),
  ADD KEY `idx_factura_hash_cpe` (`hash_cpe`),
  ADD KEY `idx_factura_fecha_creacion` (`fecha_creacion`),
  ADD KEY `idx_factura_usuario_creacion` (`usuario_creacion_id`),
  ADD KEY `idx_factura_moneda` (`moneda`),
  ADD KEY `idx_factura_total` (`total_general`),
  ADD KEY `usuario_emision_id` (`usuario_emision_id`),
  ADD KEY `usuario_anulacion_id` (`usuario_anulacion_id`);

--
-- Indices de la tabla `aplicaciones_facturacion_seriedocumento`
--
ALTER TABLE `aplicaciones_facturacion_seriedocumento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_serie_tipo` (`serie`,`tipo_documento`),
  ADD KEY `idx_serie_tipo` (`tipo_documento`),
  ADD KEY `idx_serie_activo` (`activo`),
  ADD KEY `idx_serie_predeterminada` (`predeterminada`);

--
-- Indices de la tabla `aplicaciones_integraciones_configuracionintegracion`
--
ALTER TABLE `aplicaciones_integraciones_configuracionintegracion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_config_proveedor` (`proveedor_id`),
  ADD KEY `idx_config_activo` (`activo`),
  ADD KEY `idx_config_ruc` (`ruc_empresa`),
  ADD KEY `idx_config_vigencia` (`fecha_inicio_vigencia`,`fecha_fin_vigencia`);

--
-- Indices de la tabla `aplicaciones_integraciones_logintegracion`
--
ALTER TABLE `aplicaciones_integraciones_logintegracion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_log_proveedor` (`proveedor_id`),
  ADD KEY `idx_log_configuracion` (`configuracion_id`),
  ADD KEY `idx_log_tipo_operacion` (`tipo_operacion`),
  ADD KEY `idx_log_exitoso` (`exitoso`),
  ADD KEY `idx_log_fecha_inicio` (`fecha_inicio`),
  ADD KEY `idx_log_referencia` (`referencia_tipo`,`referencia_id`),
  ADD KEY `idx_log_usuario` (`usuario_id`),
  ADD KEY `idx_log_codigo_error` (`codigo_error`);

--
-- Indices de la tabla `aplicaciones_integraciones_proveedorintegracion`
--
ALTER TABLE `aplicaciones_integraciones_proveedorintegracion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_proveedor_codigo` (`codigo`),
  ADD KEY `idx_proveedor_tipo` (`tipo_proveedor`),
  ADD KEY `idx_proveedor_principal` (`es_principal`),
  ADD KEY `idx_proveedor_activo` (`activo`);

--
-- Indices de la tabla `aplicaciones_inventario_loteinventario`
--
ALTER TABLE `aplicaciones_inventario_loteinventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lote_producto` (`producto_id`),
  ADD KEY `idx_lote_fecha_ingreso` (`fecha_ingreso`),
  ADD KEY `idx_lote_fecha_vencimiento` (`fecha_vencimiento`),
  ADD KEY `idx_lote_numero` (`numero_lote`),
  ADD KEY `idx_lote_activo` (`activo`);

--
-- Indices de la tabla `aplicaciones_inventario_movimientoinventario`
--
ALTER TABLE `aplicaciones_inventario_movimientoinventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_movimiento_producto` (`producto_id`),
  ADD KEY `idx_movimiento_lote` (`lote_id`),
  ADD KEY `idx_movimiento_tipo` (`tipo_movimiento`),
  ADD KEY `idx_movimiento_fecha` (`fecha_movimiento`),
  ADD KEY `idx_movimiento_referencia` (`referencia_tipo`,`referencia_id`),
  ADD KEY `idx_movimiento_usuario` (`usuario_id`);

--
-- Indices de la tabla `aplicaciones_productos_categoriaproducto`
--
ALTER TABLE `aplicaciones_productos_categoriaproducto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_categoria_nombre` (`nombre`),
  ADD KEY `idx_categoria_activo` (`activo`),
  ADD KEY `idx_categoria_padre` (`categoria_padre_id`);

--
-- Indices de la tabla `aplicaciones_productos_producto`
--
ALTER TABLE `aplicaciones_productos_producto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_producto_codigo` (`codigo`),
  ADD KEY `idx_producto_codigo_barras` (`codigo_barras`),
  ADD KEY `idx_producto_nombre` (`nombre`),
  ADD KEY `idx_producto_categoria` (`categoria_id`),
  ADD KEY `idx_producto_tipo` (`tipo_producto`),
  ADD KEY `idx_producto_activo` (`activo`),
  ADD KEY `idx_producto_inventariable` (`es_inventariable`),
  ADD KEY `idx_producto_stock_minimo` (`stock_minimo`),
  ADD KEY `idx_producto_fecha_creacion` (`fecha_creacion`),
  ADD KEY `idx_producto_precio_venta` (`precio_venta`),
  ADD KEY `unidad_medida_id` (`unidad_medida_id`);

--
-- Indices de la tabla `aplicaciones_productos_unidadmedida`
--
ALTER TABLE `aplicaciones_productos_unidadmedida`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_unidad_codigo` (`codigo`),
  ADD KEY `idx_unidad_nombre` (`nombre`),
  ADD KEY `idx_unidad_activo` (`activo`);

--
-- Indices de la tabla `aplicaciones_usuarios_usuario`
--
ALTER TABLE `aplicaciones_usuarios_usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD PRIMARY KEY (`key`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indices de la tabla `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indices de la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indices de la tabla `clientes_cliente`
--
ALTER TABLE `clientes_cliente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clientes_cliente_tipo_documento_id_numero_488ecb40_uniq` (`tipo_documento_id`,`numero_documento`),
  ADD KEY `idx_cliente_numero_doc` (`numero_documento`),
  ADD KEY `idx_cliente_tipo` (`tipo_cliente`),
  ADD KEY `idx_cliente_estado_activo` (`activo`),
  ADD KEY `idx_cliente_fecha` (`fecha_creacion`),
  ADD KEY `idx_cliente_razon_social` (`razon_social`),
  ADD KEY `idx_cliente_ubigeo` (`ubigeo`),
  ADD KEY `idx_cliente_validado` (`validado_sunat`),
  ADD KEY `idx_cliente_bloqueado` (`bloqueado`),
  ADD KEY `clientes_cliente_fecha_creacion_b3502bdc` (`fecha_creacion`),
  ADD KEY `clientes_cliente_fecha_actualizacion_140b2fef` (`fecha_actualizacion`),
  ADD KEY `clientes_cliente_activo_92de670f` (`activo`),
  ADD KEY `clientes_cliente_tipo_cliente_251971ea` (`tipo_cliente`),
  ADD KEY `clientes_cliente_numero_documento_54291be6` (`numero_documento`);

--
-- Indices de la tabla `clientes_contacto_cliente`
--
ALTER TABLE `clientes_contacto_cliente`
  ADD PRIMARY KEY (`id`),
  ADD KEY `clientes_contacto_cliente_fecha_creacion_df8649c4` (`fecha_creacion`),
  ADD KEY `clientes_contacto_cliente_fecha_actualizacion_2dadef4e` (`fecha_actualizacion`),
  ADD KEY `clientes_contacto_cliente_activo_d12f6938` (`activo`),
  ADD KEY `idx_contacto_cliente` (`cliente_id`),
  ADD KEY `idx_contacto_principal` (`es_principal`),
  ADD KEY `idx_contacto_activo` (`activo`);

--
-- Indices de la tabla `clientes_tipo_documento`
--
ALTER TABLE `clientes_tipo_documento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `clientes_tipo_documento_fecha_creacion_10b95a1f` (`fecha_creacion`),
  ADD KEY `clientes_tipo_documento_fecha_actualizacion_c24c8552` (`fecha_actualizacion`),
  ADD KEY `clientes_tipo_documento_activo_e0a7b7b6` (`activo`),
  ADD KEY `idx_tipo_doc_codigo` (`codigo`),
  ADD KEY `idx_tipo_doc_activo` (`activo`);

--
-- Indices de la tabla `contabilidad_asiento_contable`
--
ALTER TABLE `contabilidad_asiento_contable`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `contabilidad_asiento_contable_ejercicio_id_numero_e5f36dbe_uniq` (`ejercicio_id`,`numero`),
  ADD KEY `contabilidad_asiento_usuario_aprobacion_i_9d5ba158_fk_usuarios_` (`usuario_aprobacion_id`),
  ADD KEY `idx_asiento_numero` (`numero`),
  ADD KEY `idx_asiento_fecha` (`fecha`),
  ADD KEY `idx_asiento_tipo` (`tipo_asiento`),
  ADD KEY `idx_asiento_estado` (`estado`),
  ADD KEY `idx_asiento_ejercicio` (`ejercicio_id`),
  ADD KEY `idx_asiento_usuario` (`usuario_creacion_id`),
  ADD KEY `idx_asiento_documento` (`documento_electronico_id`),
  ADD KEY `idx_asiento_automatico` (`es_automatico`),
  ADD KEY `idx_asiento_activo` (`activo`),
  ADD KEY `contabilidad_asiento_contable_fecha_creacion_3ba5c7ea` (`fecha_creacion`),
  ADD KEY `contabilidad_asiento_contable_fecha_actualizacion_0a9153b5` (`fecha_actualizacion`),
  ADD KEY `contabilidad_asiento_contable_activo_f6736b7a` (`activo`),
  ADD KEY `contabilidad_asiento_contable_numero_7afb1cd9` (`numero`),
  ADD KEY `contabilidad_asiento_contable_fecha_f550dbc4` (`fecha`),
  ADD KEY `contabilidad_asiento_contable_tipo_asiento_b63e72a0` (`tipo_asiento`),
  ADD KEY `contabilidad_asiento_contable_estado_9a503f48` (`estado`);

--
-- Indices de la tabla `contabilidad_configuracion_contable`
--
ALTER TABLE `contabilidad_configuracion_contable`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contabilidad_configu_cuenta_banco_princip_949dd47d_fk_contabili` (`cuenta_banco_principal_id`),
  ADD KEY `contabilidad_configu_cuenta_caja_id_cfa593c5_fk_contabili` (`cuenta_caja_id`),
  ADD KEY `contabilidad_configu_cuenta_costo_ventas__d8f7399d_fk_contabili` (`cuenta_costo_ventas_id`),
  ADD KEY `contabilidad_configu_cuenta_cuentas_cobra_c2f11612_fk_contabili` (`cuenta_cuentas_cobrar_boletas_id`),
  ADD KEY `contabilidad_configu_cuenta_cuentas_cobra_3605f7a7_fk_contabili` (`cuenta_cuentas_cobrar_facturas_id`),
  ADD KEY `contabilidad_configu_cuenta_igv_compras_i_3c07e79d_fk_contabili` (`cuenta_igv_compras_id`),
  ADD KEY `contabilidad_configu_cuenta_igv_ventas_id_39faa0b6_fk_contabili` (`cuenta_igv_ventas_id`),
  ADD KEY `contabilidad_configu_cuenta_inventario_me_698919d3_fk_contabili` (`cuenta_inventario_mercaderias_id`),
  ADD KEY `contabilidad_configu_cuenta_ventas_exoner_ea1c1cc0_fk_contabili` (`cuenta_ventas_exoneradas_id`),
  ADD KEY `contabilidad_configu_cuenta_ventas_gravad_99109dea_fk_contabili` (`cuenta_ventas_gravadas_id`),
  ADD KEY `contabilidad_configu_cuenta_ventas_inafec_0d4e344a_fk_contabili` (`cuenta_ventas_inafectas_id`),
  ADD KEY `contabilidad_configuracion_contable_fecha_creacion_501afbab` (`fecha_creacion`),
  ADD KEY `contabilidad_configuracion_contable_fecha_actualizacion_2c3cbac2` (`fecha_actualizacion`),
  ADD KEY `contabilidad_configuracion_contable_activo_2b524c79` (`activo`);

--
-- Indices de la tabla `contabilidad_detalle_asiento`
--
ALTER TABLE `contabilidad_detalle_asiento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `contabilidad_detalle_asi_asiento_id_numero_linea_6577dd6e_uniq` (`asiento_id`,`numero_linea`),
  ADD KEY `idx_detal_asient_contable` (`asiento_id`),
  ADD KEY `idx_detal_asient_cuenta` (`cuenta_id`),
  ADD KEY `idx_detal_asien_linea` (`numero_linea`),
  ADD KEY `idx_detal_debe` (`debe`),
  ADD KEY `idx_detal_haber` (`haber`),
  ADD KEY `idx_detal_tercero` (`cliente_proveedor_id`),
  ADD KEY `idx_detal_asient_contab_activo` (`activo`),
  ADD KEY `contabilidad_detalle_asiento_fecha_creacion_8dc7bb24` (`fecha_creacion`),
  ADD KEY `contabilidad_detalle_asiento_fecha_actualizacion_f03eb9fc` (`fecha_actualizacion`),
  ADD KEY `contabilidad_detalle_asiento_activo_587439b3` (`activo`);

--
-- Indices de la tabla `contabilidad_ejercicio_contable`
--
ALTER TABLE `contabilidad_ejercicio_contable`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_ejercicio_codigo` (`codigo`),
  ADD KEY `idx_ejercicio_inicio` (`fecha_inicio`),
  ADD KEY `idx_ejercicio_fin` (`fecha_fin`),
  ADD KEY `idx_ejercicio_estado` (`estado`),
  ADD KEY `idx_ejercicio_actual` (`es_actual`),
  ADD KEY `idx_ejercicio_activo` (`activo`),
  ADD KEY `contabilidad_ejercic_usuario_cierre_id_4d8f1d22_fk_usuarios_` (`usuario_cierre_id`),
  ADD KEY `contabilidad_ejercicio_contable_fecha_creacion_48962533` (`fecha_creacion`),
  ADD KEY `contabilidad_ejercicio_contable_fecha_actualizacion_f6ac7031` (`fecha_actualizacion`),
  ADD KEY `contabilidad_ejercicio_contable_activo_deadc708` (`activo`),
  ADD KEY `contabilidad_ejercicio_contable_estado_d66e2276` (`estado`),
  ADD KEY `contabilidad_ejercicio_contable_es_actual_c98ba1c0` (`es_actual`);

--
-- Indices de la tabla `contabilidad_plan_cuentas`
--
ALTER TABLE `contabilidad_plan_cuentas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_plan_codigo` (`codigo`),
  ADD KEY `idx_plan_elemento` (`elemento_pcge`),
  ADD KEY `idx_plan_tipo` (`tipo_cuenta`),
  ADD KEY `idx_plan_naturaleza` (`naturaleza`),
  ADD KEY `idx_plan_padre` (`cuenta_padre_id`),
  ADD KEY `idx_plan_movimientos` (`acepta_movimientos`),
  ADD KEY `idx_plan_automatico` (`uso_automatico`),
  ADD KEY `idx_plan_activo` (`activo`),
  ADD KEY `contabilidad_plan_cuentas_fecha_creacion_06a7a1e8` (`fecha_creacion`),
  ADD KEY `contabilidad_plan_cuentas_fecha_actualizacion_ea3dfb2b` (`fecha_actualizacion`),
  ADD KEY `contabilidad_plan_cuentas_activo_8a9557c5` (`activo`),
  ADD KEY `contabilidad_plan_cuentas_tipo_cuenta_2457ce2f` (`tipo_cuenta`),
  ADD KEY `contabilidad_plan_cuentas_elemento_pcge_eda6321d` (`elemento_pcge`);

--
-- Indices de la tabla `core_configuracion_sistema`
--
ALTER TABLE `core_configuracion_sistema`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clave` (`clave`),
  ADD KEY `idx_core_config_clave` (`clave`),
  ADD KEY `idx_core_config_activo` (`activo`),
  ADD KEY `core_configuracion_sistema_fecha_creacion_e99882fa` (`fecha_creacion`),
  ADD KEY `core_configuracion_sistema_fecha_actualizacion_b0724f74` (`fecha_actualizacion`),
  ADD KEY `core_configuracion_sistema_activo_fa4f0a3c` (`activo`);

--
-- Indices de la tabla `core_empresa`
--
ALTER TABLE `core_empresa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ruc` (`ruc`),
  ADD KEY `idx_empresa_ruc` (`ruc`),
  ADD KEY `idx_empresa_activo` (`activo`),
  ADD KEY `idx_empresa_fecha` (`fecha_creacion`),
  ADD KEY `core_empresa_fecha_creacion_1c856459` (`fecha_creacion`),
  ADD KEY `core_empresa_fecha_actualizacion_9f3291ac` (`fecha_actualizacion`),
  ADD KEY `core_empresa_activo_0872a6a2` (`activo`);

--
-- Indices de la tabla `core_sucursal`
--
ALTER TABLE `core_sucursal`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `core_sucursal_empresa_id_serie_factura_3486c042_uniq` (`empresa_id`,`serie_factura`),
  ADD UNIQUE KEY `core_sucursal_empresa_id_serie_boleta_be43f4ac_uniq` (`empresa_id`,`serie_boleta`),
  ADD UNIQUE KEY `core_sucursal_empresa_id_codigo_c8d057b0_uniq` (`empresa_id`,`codigo`),
  ADD KEY `idx_sucursal_empresa_codigo` (`empresa_id`,`codigo`),
  ADD KEY `idx_sucursal_principal` (`es_principal`),
  ADD KEY `idx_sucursal_activo` (`activo`),
  ADD KEY `core_sucursal_fecha_creacion_915b196a` (`fecha_creacion`),
  ADD KEY `core_sucursal_fecha_actualizacion_e26eebcc` (`fecha_actualizacion`),
  ADD KEY `core_sucursal_activo_3e7da2b6` (`activo`),
  ADD KEY `core_sucursal_codigo_b0a8891e` (`codigo`),
  ADD KEY `core_sucursal_es_principal_9235c31a` (`es_principal`);

--
-- Indices de la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_usuarios_usuario_id` (`user_id`);

--
-- Indices de la tabla `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indices de la tabla `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Indices de la tabla `facturacion_detalle_documento`
--
ALTER TABLE `facturacion_detalle_documento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `facturacion_detalle_docu_documento_id_numero_item_508a8668_uniq` (`documento_id`,`numero_item`),
  ADD KEY `idx_detalle_documento` (`documento_id`),
  ADD KEY `idx_detalle_factura_producto` (`producto_id`),
  ADD KEY `idx_detalle_numero` (`numero_item`),
  ADD KEY `idx_detalle_factura_activo` (`activo`),
  ADD KEY `facturacion_detalle_documento_fecha_creacion_b990ab9b` (`fecha_creacion`),
  ADD KEY `facturacion_detalle_documento_fecha_actualizacion_0f79db44` (`fecha_actualizacion`),
  ADD KEY `facturacion_detalle_documento_activo_a514e153` (`activo`);

--
-- Indices de la tabla `facturacion_documento_electronico`
--
ALTER TABLE `facturacion_documento_electronico`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `facturacion_documento_el_serie_documento_id_numer_c552b501_uniq` (`serie_documento_id`,`numero`),
  ADD KEY `facturacion_document_documento_referencia_5d5f0f71_fk_facturaci` (`documento_referencia_id`),
  ADD KEY `idx_doc_numero_completo` (`numero_completo`),
  ADD KEY `idx_doc_fecha_emision` (`fecha_emision`),
  ADD KEY `idx_doc_cliente` (`cliente_id`),
  ADD KEY `idx_doc_estado` (`estado`),
  ADD KEY `idx_doc_tipo` (`tipo_documento_id`),
  ADD KEY `idx_doc_vendedor` (`vendedor_id`),
  ADD KEY `idx_doc_moneda` (`moneda`),
  ADD KEY `idx_doc_total` (`total`),
  ADD KEY `idx_doc_uuid` (`uuid`),
  ADD KEY `idx_doc_hash` (`hash_documento`),
  ADD KEY `idx_doc_vencimiento` (`fecha_vencimiento`),
  ADD KEY `idx_doc_activo` (`activo`),
  ADD KEY `facturacion_documento_electronico_fecha_creacion_ccdb392d` (`fecha_creacion`),
  ADD KEY `facturacion_documento_electronico_fecha_actualizacion_a75e649a` (`fecha_actualizacion`),
  ADD KEY `facturacion_documento_electronico_activo_a7f279f0` (`activo`),
  ADD KEY `facturacion_documento_electronico_numero_completo_78db39ab` (`numero_completo`),
  ADD KEY `facturacion_documento_electronico_fecha_emision_cef4e0a5` (`fecha_emision`),
  ADD KEY `facturacion_documento_electronico_estado_8faf2a93` (`estado`);

--
-- Indices de la tabla `facturacion_forma_pago`
--
ALTER TABLE `facturacion_forma_pago`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_forma_pago_codigo` (`codigo`),
  ADD KEY `idx_forma_pago_tipo` (`tipo`),
  ADD KEY `idx_forma_pago_orden` (`orden`),
  ADD KEY `idx_forma_pago_activo` (`activo`),
  ADD KEY `facturacion_forma_pago_fecha_creacion_e01b5543` (`fecha_creacion`),
  ADD KEY `facturacion_forma_pago_fecha_actualizacion_34595743` (`fecha_actualizacion`),
  ADD KEY `facturacion_forma_pago_activo_ddc72aca` (`activo`);

--
-- Indices de la tabla `facturacion_pago_documento`
--
ALTER TABLE `facturacion_pago_documento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pago_documento` (`documento_id`),
  ADD KEY `idx_pago_forma` (`forma_pago_id`),
  ADD KEY `idx_pago_fecha` (`fecha_pago`),
  ADD KEY `idx_pago_activo` (`activo`),
  ADD KEY `facturacion_pago_documento_fecha_creacion_1dbcd7e6` (`fecha_creacion`),
  ADD KEY `facturacion_pago_documento_fecha_actualizacion_efc46d5b` (`fecha_actualizacion`),
  ADD KEY `facturacion_pago_documento_activo_82c64d1d` (`activo`);

--
-- Indices de la tabla `facturacion_serie_documento`
--
ALTER TABLE `facturacion_serie_documento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `facturacion_serie_docume_sucursal_id_tipo_documen_a3467332_uniq` (`sucursal_id`,`tipo_documento_id`,`serie`),
  ADD KEY `idx_serie_sucursal` (`sucursal_id`),
  ADD KEY `idx_serie_tipo_doc` (`tipo_documento_id`),
  ADD KEY `idx_serie_serie` (`serie`),
  ADD KEY `idx_serie_default` (`es_predeterminada`),
  ADD KEY `idx_serie_activo` (`activo`),
  ADD KEY `facturacion_serie_documento_fecha_creacion_59b71aa1` (`fecha_creacion`),
  ADD KEY `facturacion_serie_documento_fecha_actualizacion_c975f0f5` (`fecha_actualizacion`),
  ADD KEY `facturacion_serie_documento_activo_2ea49752` (`activo`);

--
-- Indices de la tabla `facturacion_tipo_documento_electronico`
--
ALTER TABLE `facturacion_tipo_documento_electronico`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_sunat` (`codigo_sunat`),
  ADD KEY `facturacion_tipo_documento_electronico_fecha_creacion_23a7b7bf` (`fecha_creacion`),
  ADD KEY `facturacion_tipo_documento__fecha_actualizacion_d6b68e27` (`fecha_actualizacion`),
  ADD KEY `facturacion_tipo_documento_electronico_activo_81cb963f` (`activo`),
  ADD KEY `idx_tipo_doc_elec_codigo` (`codigo_sunat`),
  ADD KEY `idx_tipo_doc_elec_activo` (`activo`);

--
-- Indices de la tabla `integraciones_configuracion_integracion`
--
ALTER TABLE `integraciones_configuracion_integracion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `integraciones_configurac_proveedor_id_ambiente_d14763b9_uniq` (`proveedor_id`,`ambiente`),
  ADD KEY `idx_int_config_proveedor` (`proveedor_id`),
  ADD KEY `idx_int_config_ambiente` (`ambiente`),
  ADD KEY `idx_int_config_ruc` (`ruc_empresa`),
  ADD KEY `idx_int_config_valida` (`configuracion_valida`),
  ADD KEY `idx_int_config_activo` (`activo`),
  ADD KEY `integraciones_configuracion_integracion_fecha_creacion_f80939fa` (`fecha_creacion`),
  ADD KEY `integraciones_configuracion_fecha_actualizacion_281557fd` (`fecha_actualizacion`),
  ADD KEY `integraciones_configuracion_integracion_activo_604f3345` (`activo`),
  ADD KEY `integraciones_configuracion_integracion_ambiente_7a4c0cea` (`ambiente`);

--
-- Indices de la tabla `integraciones_log_integracion`
--
ALTER TABLE `integraciones_log_integracion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `integraciones_log_in_configuracion_id_607ceb90_fk_integraci` (`configuracion_id`),
  ADD KEY `integraciones_log_in_reintento_de_id_ab35c85f_fk_integraci` (`reintento_de_id`),
  ADD KEY `idx_log_proveedor` (`proveedor_id`),
  ADD KEY `idx_log_documento` (`documento_electronico_id`),
  ADD KEY `idx_log_operacion` (`tipo_operacion`),
  ADD KEY `idx_log_estado` (`estado`),
  ADD KEY `idx_log_fecha_envio` (`fecha_envio`),
  ADD KEY `idx_log_exitoso` (`exitoso`),
  ADD KEY `idx_log_codigo_http` (`codigo_respuesta_http`),
  ADD KEY `idx_log_intento` (`numero_intento`),
  ADD KEY `idx_log_activo` (`activo`),
  ADD KEY `integraciones_log_integracion_fecha_creacion_ab15cb24` (`fecha_creacion`),
  ADD KEY `integraciones_log_integracion_fecha_actualizacion_05c17f6c` (`fecha_actualizacion`),
  ADD KEY `integraciones_log_integracion_activo_840f8362` (`activo`),
  ADD KEY `integraciones_log_integracion_tipo_operacion_17a6e77e` (`tipo_operacion`),
  ADD KEY `integraciones_log_integracion_estado_2e15df7d` (`estado`),
  ADD KEY `integraciones_log_integracion_fecha_envio_cae35006` (`fecha_envio`),
  ADD KEY `integraciones_log_integracion_exitoso_89680a41` (`exitoso`);

--
-- Indices de la tabla `integraciones_proveedor_integracion`
--
ALTER TABLE `integraciones_proveedor_integracion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_proveedor_codigo` (`codigo`),
  ADD KEY `idx_proveedor_tipo` (`tipo`),
  ADD KEY `idx_proveedor_estado` (`estado`),
  ADD KEY `idx_proveedor_principal` (`es_principal`),
  ADD KEY `idx_proveedor_activo` (`activo`),
  ADD KEY `integraciones_proveedor_integracion_fecha_creacion_5e9b58b3` (`fecha_creacion`),
  ADD KEY `integraciones_proveedor_integracion_fecha_actualizacion_1bf7e02a` (`fecha_actualizacion`),
  ADD KEY `integraciones_proveedor_integracion_activo_2da7ebb8` (`activo`),
  ADD KEY `integraciones_proveedor_integracion_tipo_bad751f2` (`tipo`),
  ADD KEY `integraciones_proveedor_integracion_estado_6737a997` (`estado`);

--
-- Indices de la tabla `integraciones_webhook_integracion`
--
ALTER TABLE `integraciones_webhook_integracion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD KEY `idx_webhook_proveedor` (`proveedor_id`),
  ADD KEY `idx_webhook_tipo` (`tipo_webhook`),
  ADD KEY `idx_webhook_estado` (`estado`),
  ADD KEY `idx_webhook_fecha` (`fecha_recepcion`),
  ADD KEY `idx_webhook_documento` (`documento_electronico_id`),
  ADD KEY `idx_webhook_ip` (`ip_origen`),
  ADD KEY `idx_webhook_activo` (`activo`),
  ADD KEY `integraciones_webhook_integracion_fecha_creacion_9cafbe93` (`fecha_creacion`),
  ADD KEY `integraciones_webhook_integracion_fecha_actualizacion_9be93788` (`fecha_actualizacion`),
  ADD KEY `integraciones_webhook_integracion_activo_e11cfaac` (`activo`),
  ADD KEY `integraciones_webhook_integracion_tipo_webhook_2aa5c7a0` (`tipo_webhook`),
  ADD KEY `integraciones_webhook_integracion_estado_4cb840d1` (`estado`),
  ADD KEY `integraciones_webhook_integracion_fecha_recepcion_49dd2637` (`fecha_recepcion`);

--
-- Indices de la tabla `inventario_almacen`
--
ALTER TABLE `inventario_almacen`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_almacen_codigo` (`codigo`),
  ADD KEY `idx_almacen_sucursal` (`sucursal_id`),
  ADD KEY `idx_almacen_principal` (`es_principal`),
  ADD KEY `idx_almacen_activo` (`activo`),
  ADD KEY `inventario_almacen_responsable_id_0abede73_fk_usuarios_` (`responsable_id`),
  ADD KEY `inventario_almacen_fecha_creacion_5fe53659` (`fecha_creacion`),
  ADD KEY `inventario_almacen_fecha_actualizacion_f3f0d870` (`fecha_actualizacion`),
  ADD KEY `inventario_almacen_activo_b4ce601d` (`activo`);

--
-- Indices de la tabla `inventario_detalle_movimiento`
--
ALTER TABLE `inventario_detalle_movimiento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventario_detalle_movim_movimiento_id_numero_ite_2ccf9580_uniq` (`movimiento_id`,`numero_item`),
  ADD KEY `idx_det_mov_movimiento` (`movimiento_id`),
  ADD KEY `idx_det_mov_producto` (`producto_id`),
  ADD KEY `idx_det_mov_lote` (`lote_id`),
  ADD KEY `idx_det_mov_ejecutado` (`ejecutado`),
  ADD KEY `idx_det_mov_activo` (`activo`),
  ADD KEY `inventario_detalle_movimiento_fecha_creacion_ca1ba2ea` (`fecha_creacion`),
  ADD KEY `inventario_detalle_movimiento_fecha_actualizacion_d8fe1949` (`fecha_actualizacion`),
  ADD KEY `inventario_detalle_movimiento_activo_293c9c38` (`activo`);

--
-- Indices de la tabla `inventario_lote_producto`
--
ALTER TABLE `inventario_lote_producto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventario_lote_producto_producto_id_almacen_id_n_d61c2f1d_uniq` (`producto_id`,`almacen_id`,`numero_lote`),
  ADD KEY `idx_inventario_lote_producto` (`producto_id`),
  ADD KEY `idx_lote_almacen` (`almacen_id`),
  ADD KEY `idx_lote_numero` (`numero_lote`),
  ADD KEY `idx_lote_fecha_ing` (`fecha_ingreso`),
  ADD KEY `idx_lote_vencimiento` (`fecha_vencimiento`),
  ADD KEY `idx_lote_cantidad` (`cantidad_actual`),
  ADD KEY `idx_lote_calidad` (`estado_calidad`),
  ADD KEY `idx_lote_activo` (`activo`),
  ADD KEY `inventario_lote_prod_proveedor_id_78eabd4c_fk_clientes_` (`proveedor_id`),
  ADD KEY `inventario_lote_producto_fecha_creacion_146571ed` (`fecha_creacion`),
  ADD KEY `inventario_lote_producto_fecha_actualizacion_116a9958` (`fecha_actualizacion`),
  ADD KEY `inventario_lote_producto_activo_458e66b9` (`activo`),
  ADD KEY `inventario_lote_producto_numero_lote_848f3bbe` (`numero_lote`),
  ADD KEY `inventario_lote_producto_fecha_ingreso_d04f06b5` (`fecha_ingreso`),
  ADD KEY `inventario_lote_producto_fecha_vencimiento_9ad8f401` (`fecha_vencimiento`);

--
-- Indices de la tabla `inventario_movimiento_inventario`
--
ALTER TABLE `inventario_movimiento_inventario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uuid` (`uuid`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `idx_mov_numero` (`numero`),
  ADD KEY `idx_mov_fecha` (`fecha_movimiento`),
  ADD KEY `idx_mov_tipo` (`tipo_movimiento_id`),
  ADD KEY `idx_mov_almacen` (`almacen_id`),
  ADD KEY `idx_mov_estado` (`estado`),
  ADD KEY `idx_mov_usuario` (`usuario_creacion_id`),
  ADD KEY `idx_mov_documento` (`documento_electronico_id`),
  ADD KEY `idx_mov_proveedor` (`proveedor_cliente_id`),
  ADD KEY `idx_mov_activo` (`activo`),
  ADD KEY `inventario_movimient_usuario_autorizacion_63be4bd3_fk_usuarios_` (`usuario_autorizacion_id`),
  ADD KEY `inventario_movimiento_inventario_fecha_creacion_e395a652` (`fecha_creacion`),
  ADD KEY `inventario_movimiento_inventario_fecha_actualizacion_fba50a29` (`fecha_actualizacion`),
  ADD KEY `inventario_movimiento_inventario_activo_d70c1907` (`activo`),
  ADD KEY `inventario_movimiento_inventario_fecha_movimiento_f93294fa` (`fecha_movimiento`),
  ADD KEY `inventario_movimiento_inventario_estado_ec45851f` (`estado`);

--
-- Indices de la tabla `inventario_stock_producto`
--
ALTER TABLE `inventario_stock_producto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventario_stock_producto_producto_id_almacen_id_04d8032d_uniq` (`producto_id`,`almacen_id`),
  ADD KEY `inventario_stock_producto_fecha_creacion_d37e5432` (`fecha_creacion`),
  ADD KEY `inventario_stock_producto_fecha_actualizacion_068894f6` (`fecha_actualizacion`),
  ADD KEY `inventario_stock_producto_activo_85e0caff` (`activo`),
  ADD KEY `idx_stock_producto` (`producto_id`),
  ADD KEY `idx_stock_almacen` (`almacen_id`),
  ADD KEY `idx_stock_cantidad` (`cantidad_actual`),
  ADD KEY `idx_stock_disponible` (`cantidad_disponible`),
  ADD KEY `idx_stock_costo` (`costo_promedio`),
  ADD KEY `idx_stock_ultimo_mov` (`fecha_ultimo_movimiento`),
  ADD KEY `idx_stock_activo` (`activo`);

--
-- Indices de la tabla `inventario_tipo_movimiento`
--
ALTER TABLE `inventario_tipo_movimiento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `inventario_tipo_movimiento_fecha_creacion_7c3dd908` (`fecha_creacion`),
  ADD KEY `inventario_tipo_movimiento_fecha_actualizacion_043b6ec8` (`fecha_actualizacion`),
  ADD KEY `inventario_tipo_movimiento_activo_587a03f3` (`activo`),
  ADD KEY `idx_tipo_mov_codigo` (`codigo`),
  ADD KEY `idx_tipo_mov_tipo` (`tipo`),
  ADD KEY `idx_tipo_mov_categoria` (`categoria`),
  ADD KEY `idx_tipo_mov_orden` (`orden`),
  ADD KEY `idx_tipo_mov_activo` (`activo`);

--
-- Indices de la tabla `productos_categoria`
--
ALTER TABLE `productos_categoria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_categoria_codigo` (`codigo`),
  ADD KEY `idx_categoria_padre` (`categoria_padre_id`),
  ADD KEY `idx_categoria_orden` (`orden`),
  ADD KEY `idx_categoria_activo` (`activo`),
  ADD KEY `productos_categoria_fecha_creacion_2ed0ac2b` (`fecha_creacion`),
  ADD KEY `productos_categoria_fecha_actualizacion_bdec397c` (`fecha_actualizacion`),
  ADD KEY `productos_categoria_activo_ad97ce71` (`activo`);

--
-- Indices de la tabla `productos_producto`
--
ALTER TABLE `productos_producto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_producto_codigo` (`codigo`),
  ADD KEY `idx_producto_nombre` (`nombre`),
  ADD KEY `idx_producto_barras` (`codigo_barras`),
  ADD KEY `idx_producto_categoria_rel` (`categoria_id`),
  ADD KEY `idx_producto_tipo` (`tipo_producto_id`),
  ADD KEY `idx_producto_activo` (`activo`),
  ADD KEY `idx_producto_venta` (`permite_venta`),
  ADD KEY `idx_producto_stock` (`controla_stock`),
  ADD KEY `idx_producto_stock_actual` (`stock_actual`),
  ADD KEY `idx_producto_stock_min` (`stock_minimo`),
  ADD KEY `idx_producto_venc` (`fecha_vencimiento`),
  ADD KEY `productos_producto_fecha_creacion_12f660b3` (`fecha_creacion`),
  ADD KEY `productos_producto_fecha_actualizacion_86842054` (`fecha_actualizacion`),
  ADD KEY `productos_producto_activo_38b8275a` (`activo`),
  ADD KEY `productos_producto_nombre_3e7bf33e` (`nombre`);

--
-- Indices de la tabla `productos_producto_proveedor`
--
ALTER TABLE `productos_producto_proveedor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `productos_producto_prove_producto_id_proveedor_id_cb32e92f_uniq` (`producto_id`,`proveedor_id`),
  ADD KEY `productos_producto_proveedor_fecha_creacion_e3f7c96c` (`fecha_creacion`),
  ADD KEY `productos_producto_proveedor_fecha_actualizacion_0e9285c3` (`fecha_actualizacion`),
  ADD KEY `productos_producto_proveedor_activo_ed548354` (`activo`),
  ADD KEY `idx_prod_prov_producto` (`producto_id`),
  ADD KEY `idx_prod_prov_proveedor` (`proveedor_id`),
  ADD KEY `idx_prod_prov_principal` (`es_principal`),
  ADD KEY `idx_prod_prov_activo` (`activo`);

--
-- Indices de la tabla `productos_tipo_producto`
--
ALTER TABLE `productos_tipo_producto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `productos_tipo_producto_fecha_creacion_f5c012d4` (`fecha_creacion`),
  ADD KEY `productos_tipo_producto_fecha_actualizacion_e4b7359c` (`fecha_actualizacion`),
  ADD KEY `productos_tipo_producto_activo_2c1fafc3` (`activo`),
  ADD KEY `idx_tipo_prod_codigo` (`codigo`),
  ADD KEY `idx_tipo_prod_tipo` (`tipo`),
  ADD KEY `idx_tipo_prod_activo` (`activo`);

--
-- Indices de la tabla `usuarios_perfil`
--
ALTER TABLE `usuarios_perfil`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD KEY `usuarios_perfil_fecha_creacion_55c1dcd4` (`fecha_creacion`),
  ADD KEY `usuarios_perfil_fecha_actualizacion_8dddd1ac` (`fecha_actualizacion`),
  ADD KEY `usuarios_perfil_activo_5d77a422` (`activo`);

--
-- Indices de la tabla `usuarios_rol`
--
ALTER TABLE `usuarios_rol`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `usuarios_rol_fecha_creacion_c0e6cb90` (`fecha_creacion`),
  ADD KEY `usuarios_rol_fecha_actualizacion_45fb4bd2` (`fecha_actualizacion`),
  ADD KEY `usuarios_rol_activo_6dd66e63` (`activo`),
  ADD KEY `idx_rol_codigo` (`codigo`),
  ADD KEY `idx_rol_nivel` (`nivel_acceso`);

--
-- Indices de la tabla `usuarios_sesion`
--
ALTER TABLE `usuarios_sesion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_sesion` (`token_sesion`),
  ADD KEY `usuarios_sesion_fecha_creacion_e793e666` (`fecha_creacion`),
  ADD KEY `usuarios_sesion_fecha_actualizacion_06b79618` (`fecha_actualizacion`),
  ADD KEY `usuarios_sesion_activo_5224a5ba` (`activo`),
  ADD KEY `idx_sesion_usuario` (`usuario_id`),
  ADD KEY `idx_sesion_token` (`token_sesion`),
  ADD KEY `idx_sesion_activa` (`activa`),
  ADD KEY `idx_sesion_expiracion` (`fecha_expiracion`);

--
-- Indices de la tabla `usuarios_usuario`
--
ALTER TABLE `usuarios_usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `numero_documento` (`numero_documento`),
  ADD KEY `idx_usuario_email` (`email`),
  ADD KEY `idx_usuario_documento` (`numero_documento`),
  ADD KEY `idx_usuario_estado` (`estado_usuario`),
  ADD KEY `idx_usuario_rol` (`rol_id`),
  ADD KEY `idx_usuario_activo` (`is_active`),
  ADD KEY `usuarios_usuario_fecha_creacion_1cfc5733` (`fecha_creacion`),
  ADD KEY `usuarios_usuario_fecha_actualizacion_926f6701` (`fecha_actualizacion`),
  ADD KEY `usuarios_usuario_activo_b4f09903` (`activo`);

--
-- Indices de la tabla `usuarios_usuario_groups`
--
ALTER TABLE `usuarios_usuario_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuarios_usuario_groups_usuario_id_group_id_4ed5b09e_uniq` (`usuario_id`,`group_id`),
  ADD KEY `usuarios_usuario_groups_group_id_e77f6dcf_fk_auth_group_id` (`group_id`);

--
-- Indices de la tabla `usuarios_usuario_user_permissions`
--
ALTER TABLE `usuarios_usuario_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuarios_usuario_user_pe_usuario_id_permission_id_217cadcd_uniq` (`usuario_id`,`permission_id`),
  ADD KEY `usuarios_usuario_use_permission_id_4e5c0f2f_fk_auth_perm` (`permission_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `aplicaciones_clientes_cliente`
--
ALTER TABLE `aplicaciones_clientes_cliente`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_contabilidad_asientocontable`
--
ALTER TABLE `aplicaciones_contabilidad_asientocontable`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_contabilidad_detalleasiento`
--
ALTER TABLE `aplicaciones_contabilidad_detalleasiento`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_contabilidad_plancuentas`
--
ALTER TABLE `aplicaciones_contabilidad_plancuentas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_core_configuracion`
--
ALTER TABLE `aplicaciones_core_configuracion`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_core_empresa`
--
ALTER TABLE `aplicaciones_core_empresa`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_facturacion_detallefactura`
--
ALTER TABLE `aplicaciones_facturacion_detallefactura`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_facturacion_factura`
--
ALTER TABLE `aplicaciones_facturacion_factura`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_facturacion_seriedocumento`
--
ALTER TABLE `aplicaciones_facturacion_seriedocumento`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_integraciones_configuracionintegracion`
--
ALTER TABLE `aplicaciones_integraciones_configuracionintegracion`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_integraciones_logintegracion`
--
ALTER TABLE `aplicaciones_integraciones_logintegracion`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_integraciones_proveedorintegracion`
--
ALTER TABLE `aplicaciones_integraciones_proveedorintegracion`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_inventario_loteinventario`
--
ALTER TABLE `aplicaciones_inventario_loteinventario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_inventario_movimientoinventario`
--
ALTER TABLE `aplicaciones_inventario_movimientoinventario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_productos_categoriaproducto`
--
ALTER TABLE `aplicaciones_productos_categoriaproducto`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_productos_producto`
--
ALTER TABLE `aplicaciones_productos_producto`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_productos_unidadmedida`
--
ALTER TABLE `aplicaciones_productos_unidadmedida`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT de la tabla `aplicaciones_usuarios_usuario`
--
ALTER TABLE `aplicaciones_usuarios_usuario`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=169;

--
-- AUTO_INCREMENT de la tabla `clientes_cliente`
--
ALTER TABLE `clientes_cliente`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clientes_contacto_cliente`
--
ALTER TABLE `clientes_contacto_cliente`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clientes_tipo_documento`
--
ALTER TABLE `clientes_tipo_documento`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `contabilidad_asiento_contable`
--
ALTER TABLE `contabilidad_asiento_contable`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `contabilidad_configuracion_contable`
--
ALTER TABLE `contabilidad_configuracion_contable`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `contabilidad_detalle_asiento`
--
ALTER TABLE `contabilidad_detalle_asiento`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `contabilidad_ejercicio_contable`
--
ALTER TABLE `contabilidad_ejercicio_contable`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `contabilidad_plan_cuentas`
--
ALTER TABLE `contabilidad_plan_cuentas`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `core_configuracion_sistema`
--
ALTER TABLE `core_configuracion_sistema`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `core_empresa`
--
ALTER TABLE `core_empresa`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `core_sucursal`
--
ALTER TABLE `core_sucursal`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `facturacion_detalle_documento`
--
ALTER TABLE `facturacion_detalle_documento`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `facturacion_documento_electronico`
--
ALTER TABLE `facturacion_documento_electronico`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `facturacion_forma_pago`
--
ALTER TABLE `facturacion_forma_pago`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `facturacion_pago_documento`
--
ALTER TABLE `facturacion_pago_documento`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `facturacion_serie_documento`
--
ALTER TABLE `facturacion_serie_documento`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `facturacion_tipo_documento_electronico`
--
ALTER TABLE `facturacion_tipo_documento_electronico`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `integraciones_configuracion_integracion`
--
ALTER TABLE `integraciones_configuracion_integracion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `integraciones_log_integracion`
--
ALTER TABLE `integraciones_log_integracion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `integraciones_proveedor_integracion`
--
ALTER TABLE `integraciones_proveedor_integracion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `integraciones_webhook_integracion`
--
ALTER TABLE `integraciones_webhook_integracion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario_almacen`
--
ALTER TABLE `inventario_almacen`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario_detalle_movimiento`
--
ALTER TABLE `inventario_detalle_movimiento`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario_lote_producto`
--
ALTER TABLE `inventario_lote_producto`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario_movimiento_inventario`
--
ALTER TABLE `inventario_movimiento_inventario`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario_stock_producto`
--
ALTER TABLE `inventario_stock_producto`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario_tipo_movimiento`
--
ALTER TABLE `inventario_tipo_movimiento`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos_categoria`
--
ALTER TABLE `productos_categoria`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos_producto`
--
ALTER TABLE `productos_producto`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos_producto_proveedor`
--
ALTER TABLE `productos_producto_proveedor`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos_tipo_producto`
--
ALTER TABLE `productos_tipo_producto`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios_perfil`
--
ALTER TABLE `usuarios_perfil`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `usuarios_rol`
--
ALTER TABLE `usuarios_rol`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios_sesion`
--
ALTER TABLE `usuarios_sesion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios_usuario`
--
ALTER TABLE `usuarios_usuario`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios_usuario_groups`
--
ALTER TABLE `usuarios_usuario_groups`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios_usuario_user_permissions`
--
ALTER TABLE `usuarios_usuario_user_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `aplicaciones_clientes_cliente`
--
ALTER TABLE `aplicaciones_clientes_cliente`
  ADD CONSTRAINT `aplicaciones_clientes_cliente_ibfk_1` FOREIGN KEY (`vendedor_asignado_id`) REFERENCES `aplicaciones_usuarios_usuario` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `aplicaciones_contabilidad_asientocontable`
--
ALTER TABLE `aplicaciones_contabilidad_asientocontable`
  ADD CONSTRAINT `aplicaciones_contabilidad_asientocontable_ibfk_1` FOREIGN KEY (`usuario_creacion_id`) REFERENCES `aplicaciones_usuarios_usuario` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_contabilidad_asientocontable_ibfk_2` FOREIGN KEY (`usuario_validacion_id`) REFERENCES `aplicaciones_usuarios_usuario` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `aplicaciones_contabilidad_detalleasiento`
--
ALTER TABLE `aplicaciones_contabilidad_detalleasiento`
  ADD CONSTRAINT `aplicaciones_contabilidad_detalleasiento_ibfk_1` FOREIGN KEY (`asiento_id`) REFERENCES `aplicaciones_contabilidad_asientocontable` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `aplicaciones_contabilidad_detalleasiento_ibfk_2` FOREIGN KEY (`cuenta_id`) REFERENCES `aplicaciones_contabilidad_plancuentas` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_contabilidad_detalleasiento_ibfk_3` FOREIGN KEY (`asiento_id`) REFERENCES `aplicaciones_contabilidad_asientocontable` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `aplicaciones_contabilidad_detalleasiento_ibfk_4` FOREIGN KEY (`cuenta_id`) REFERENCES `aplicaciones_contabilidad_plancuentas` (`id`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `aplicaciones_contabilidad_plancuentas`
--
ALTER TABLE `aplicaciones_contabilidad_plancuentas`
  ADD CONSTRAINT `aplicaciones_contabilidad_plancuentas_ibfk_1` FOREIGN KEY (`cuenta_padre_id`) REFERENCES `aplicaciones_contabilidad_plancuentas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `aplicaciones_contabilidad_plancuentas_ibfk_2` FOREIGN KEY (`cuenta_padre_id`) REFERENCES `aplicaciones_contabilidad_plancuentas` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `aplicaciones_facturacion_detallefactura`
--
ALTER TABLE `aplicaciones_facturacion_detallefactura`
  ADD CONSTRAINT `aplicaciones_facturacion_detallefactura_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `aplicaciones_facturacion_factura` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `aplicaciones_facturacion_detallefactura_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `aplicaciones_productos_producto` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `aplicaciones_facturacion_detallefactura_ibfk_3` FOREIGN KEY (`lote_id`) REFERENCES `aplicaciones_inventario_loteinventario` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `aplicaciones_facturacion_detallefactura_ibfk_4` FOREIGN KEY (`factura_id`) REFERENCES `aplicaciones_facturacion_factura` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `aplicaciones_facturacion_detallefactura_ibfk_5` FOREIGN KEY (`producto_id`) REFERENCES `aplicaciones_productos_producto` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `aplicaciones_facturacion_detallefactura_ibfk_6` FOREIGN KEY (`lote_id`) REFERENCES `aplicaciones_inventario_loteinventario` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `aplicaciones_facturacion_factura`
--
ALTER TABLE `aplicaciones_facturacion_factura`
  ADD CONSTRAINT `aplicaciones_facturacion_factura_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `aplicaciones_clientes_cliente` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_facturacion_factura_ibfk_2` FOREIGN KEY (`serie_documento_id`) REFERENCES `aplicaciones_facturacion_seriedocumento` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_facturacion_factura_ibfk_3` FOREIGN KEY (`cliente_id`) REFERENCES `aplicaciones_clientes_cliente` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_facturacion_factura_ibfk_4` FOREIGN KEY (`serie_documento_id`) REFERENCES `aplicaciones_facturacion_seriedocumento` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_facturacion_factura_ibfk_5` FOREIGN KEY (`usuario_creacion_id`) REFERENCES `aplicaciones_usuarios_usuario` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_facturacion_factura_ibfk_6` FOREIGN KEY (`usuario_emision_id`) REFERENCES `aplicaciones_usuarios_usuario` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `aplicaciones_facturacion_factura_ibfk_7` FOREIGN KEY (`usuario_anulacion_id`) REFERENCES `aplicaciones_usuarios_usuario` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `aplicaciones_integraciones_configuracionintegracion`
--
ALTER TABLE `aplicaciones_integraciones_configuracionintegracion`
  ADD CONSTRAINT `aplicaciones_integraciones_configuracionintegracion_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `aplicaciones_integraciones_proveedorintegracion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `aplicaciones_integraciones_configuracionintegracion_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `aplicaciones_integraciones_proveedorintegracion` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `aplicaciones_integraciones_logintegracion`
--
ALTER TABLE `aplicaciones_integraciones_logintegracion`
  ADD CONSTRAINT `aplicaciones_integraciones_logintegracion_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `aplicaciones_integraciones_proveedorintegracion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `aplicaciones_integraciones_logintegracion_ibfk_2` FOREIGN KEY (`configuracion_id`) REFERENCES `aplicaciones_integraciones_configuracionintegracion` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `aplicaciones_integraciones_logintegracion_ibfk_3` FOREIGN KEY (`proveedor_id`) REFERENCES `aplicaciones_integraciones_proveedorintegracion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `aplicaciones_integraciones_logintegracion_ibfk_4` FOREIGN KEY (`configuracion_id`) REFERENCES `aplicaciones_integraciones_configuracionintegracion` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `aplicaciones_integraciones_logintegracion_ibfk_5` FOREIGN KEY (`usuario_id`) REFERENCES `aplicaciones_usuarios_usuario` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `aplicaciones_inventario_loteinventario`
--
ALTER TABLE `aplicaciones_inventario_loteinventario`
  ADD CONSTRAINT `aplicaciones_inventario_loteinventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `aplicaciones_productos_producto` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_inventario_loteinventario_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `aplicaciones_productos_producto` (`id`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `aplicaciones_inventario_movimientoinventario`
--
ALTER TABLE `aplicaciones_inventario_movimientoinventario`
  ADD CONSTRAINT `aplicaciones_inventario_movimientoinventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `aplicaciones_productos_producto` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_inventario_movimientoinventario_ibfk_2` FOREIGN KEY (`lote_id`) REFERENCES `aplicaciones_inventario_loteinventario` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `aplicaciones_inventario_movimientoinventario_ibfk_3` FOREIGN KEY (`producto_id`) REFERENCES `aplicaciones_productos_producto` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_inventario_movimientoinventario_ibfk_4` FOREIGN KEY (`lote_id`) REFERENCES `aplicaciones_inventario_loteinventario` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `aplicaciones_inventario_movimientoinventario_ibfk_5` FOREIGN KEY (`usuario_id`) REFERENCES `aplicaciones_usuarios_usuario` (`id`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `aplicaciones_productos_categoriaproducto`
--
ALTER TABLE `aplicaciones_productos_categoriaproducto`
  ADD CONSTRAINT `aplicaciones_productos_categoriaproducto_ibfk_1` FOREIGN KEY (`categoria_padre_id`) REFERENCES `aplicaciones_productos_categoriaproducto` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `aplicaciones_productos_categoriaproducto_ibfk_2` FOREIGN KEY (`categoria_padre_id`) REFERENCES `aplicaciones_productos_categoriaproducto` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `aplicaciones_productos_producto`
--
ALTER TABLE `aplicaciones_productos_producto`
  ADD CONSTRAINT `aplicaciones_productos_producto_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `aplicaciones_productos_categoriaproducto` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_productos_producto_ibfk_2` FOREIGN KEY (`unidad_medida_id`) REFERENCES `aplicaciones_productos_unidadmedida` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_productos_producto_ibfk_3` FOREIGN KEY (`categoria_id`) REFERENCES `aplicaciones_productos_categoriaproducto` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `aplicaciones_productos_producto_ibfk_4` FOREIGN KEY (`unidad_medida_id`) REFERENCES `aplicaciones_productos_unidadmedida` (`id`) ON DELETE RESTRICT;

--
-- Filtros para la tabla `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD CONSTRAINT `authtoken_token_user_id_35299eff_fk_usuarios_usuario_id` FOREIGN KEY (`user_id`) REFERENCES `usuarios_usuario` (`id`);

--
-- Filtros para la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Filtros para la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Filtros para la tabla `clientes_cliente`
--
ALTER TABLE `clientes_cliente`
  ADD CONSTRAINT `clientes_cliente_tipo_documento_id_12510f95_fk_clientes_` FOREIGN KEY (`tipo_documento_id`) REFERENCES `clientes_tipo_documento` (`id`);

--
-- Filtros para la tabla `clientes_contacto_cliente`
--
ALTER TABLE `clientes_contacto_cliente`
  ADD CONSTRAINT `clientes_contacto_cl_cliente_id_86fcec85_fk_clientes_` FOREIGN KEY (`cliente_id`) REFERENCES `clientes_cliente` (`id`);

--
-- Filtros para la tabla `contabilidad_asiento_contable`
--
ALTER TABLE `contabilidad_asiento_contable`
  ADD CONSTRAINT `contabilidad_asiento_documento_electronic_40b8c94f_fk_facturaci` FOREIGN KEY (`documento_electronico_id`) REFERENCES `facturacion_documento_electronico` (`id`),
  ADD CONSTRAINT `contabilidad_asiento_ejercicio_id_c0cdc725_fk_contabili` FOREIGN KEY (`ejercicio_id`) REFERENCES `contabilidad_ejercicio_contable` (`id`),
  ADD CONSTRAINT `contabilidad_asiento_usuario_aprobacion_i_9d5ba158_fk_usuarios_` FOREIGN KEY (`usuario_aprobacion_id`) REFERENCES `usuarios_usuario` (`id`),
  ADD CONSTRAINT `contabilidad_asiento_usuario_creacion_id_53f20ad7_fk_usuarios_` FOREIGN KEY (`usuario_creacion_id`) REFERENCES `usuarios_usuario` (`id`);

--
-- Filtros para la tabla `contabilidad_configuracion_contable`
--
ALTER TABLE `contabilidad_configuracion_contable`
  ADD CONSTRAINT `contabilidad_configu_cuenta_banco_princip_949dd47d_fk_contabili` FOREIGN KEY (`cuenta_banco_principal_id`) REFERENCES `contabilidad_plan_cuentas` (`id`),
  ADD CONSTRAINT `contabilidad_configu_cuenta_caja_id_cfa593c5_fk_contabili` FOREIGN KEY (`cuenta_caja_id`) REFERENCES `contabilidad_plan_cuentas` (`id`),
  ADD CONSTRAINT `contabilidad_configu_cuenta_costo_ventas__d8f7399d_fk_contabili` FOREIGN KEY (`cuenta_costo_ventas_id`) REFERENCES `contabilidad_plan_cuentas` (`id`),
  ADD CONSTRAINT `contabilidad_configu_cuenta_cuentas_cobra_3605f7a7_fk_contabili` FOREIGN KEY (`cuenta_cuentas_cobrar_facturas_id`) REFERENCES `contabilidad_plan_cuentas` (`id`),
  ADD CONSTRAINT `contabilidad_configu_cuenta_cuentas_cobra_c2f11612_fk_contabili` FOREIGN KEY (`cuenta_cuentas_cobrar_boletas_id`) REFERENCES `contabilidad_plan_cuentas` (`id`),
  ADD CONSTRAINT `contabilidad_configu_cuenta_igv_compras_i_3c07e79d_fk_contabili` FOREIGN KEY (`cuenta_igv_compras_id`) REFERENCES `contabilidad_plan_cuentas` (`id`),
  ADD CONSTRAINT `contabilidad_configu_cuenta_igv_ventas_id_39faa0b6_fk_contabili` FOREIGN KEY (`cuenta_igv_ventas_id`) REFERENCES `contabilidad_plan_cuentas` (`id`),
  ADD CONSTRAINT `contabilidad_configu_cuenta_inventario_me_698919d3_fk_contabili` FOREIGN KEY (`cuenta_inventario_mercaderias_id`) REFERENCES `contabilidad_plan_cuentas` (`id`),
  ADD CONSTRAINT `contabilidad_configu_cuenta_ventas_exoner_ea1c1cc0_fk_contabili` FOREIGN KEY (`cuenta_ventas_exoneradas_id`) REFERENCES `contabilidad_plan_cuentas` (`id`),
  ADD CONSTRAINT `contabilidad_configu_cuenta_ventas_gravad_99109dea_fk_contabili` FOREIGN KEY (`cuenta_ventas_gravadas_id`) REFERENCES `contabilidad_plan_cuentas` (`id`),
  ADD CONSTRAINT `contabilidad_configu_cuenta_ventas_inafec_0d4e344a_fk_contabili` FOREIGN KEY (`cuenta_ventas_inafectas_id`) REFERENCES `contabilidad_plan_cuentas` (`id`);

--
-- Filtros para la tabla `contabilidad_detalle_asiento`
--
ALTER TABLE `contabilidad_detalle_asiento`
  ADD CONSTRAINT `contabilidad_detalle_asiento_id_da62b278_fk_contabili` FOREIGN KEY (`asiento_id`) REFERENCES `contabilidad_asiento_contable` (`id`),
  ADD CONSTRAINT `contabilidad_detalle_cliente_proveedor_id_28ca299a_fk_clientes_` FOREIGN KEY (`cliente_proveedor_id`) REFERENCES `clientes_cliente` (`id`),
  ADD CONSTRAINT `contabilidad_detalle_cuenta_id_73f97c8d_fk_contabili` FOREIGN KEY (`cuenta_id`) REFERENCES `contabilidad_plan_cuentas` (`id`);

--
-- Filtros para la tabla `contabilidad_ejercicio_contable`
--
ALTER TABLE `contabilidad_ejercicio_contable`
  ADD CONSTRAINT `contabilidad_ejercic_usuario_cierre_id_4d8f1d22_fk_usuarios_` FOREIGN KEY (`usuario_cierre_id`) REFERENCES `usuarios_usuario` (`id`);

--
-- Filtros para la tabla `contabilidad_plan_cuentas`
--
ALTER TABLE `contabilidad_plan_cuentas`
  ADD CONSTRAINT `contabilidad_plan_cu_cuenta_padre_id_916d2e64_fk_contabili` FOREIGN KEY (`cuenta_padre_id`) REFERENCES `contabilidad_plan_cuentas` (`id`);

--
-- Filtros para la tabla `core_sucursal`
--
ALTER TABLE `core_sucursal`
  ADD CONSTRAINT `core_sucursal_empresa_id_aa93729b_fk_core_empresa_id` FOREIGN KEY (`empresa_id`) REFERENCES `core_empresa` (`id`);

--
-- Filtros para la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_usuarios_usuario_id` FOREIGN KEY (`user_id`) REFERENCES `usuarios_usuario` (`id`);

--
-- Filtros para la tabla `facturacion_detalle_documento`
--
ALTER TABLE `facturacion_detalle_documento`
  ADD CONSTRAINT `facturacion_detalle__documento_id_e2f9233c_fk_facturaci` FOREIGN KEY (`documento_id`) REFERENCES `facturacion_documento_electronico` (`id`),
  ADD CONSTRAINT `facturacion_detalle__producto_id_71711208_fk_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos_producto` (`id`);

--
-- Filtros para la tabla `facturacion_documento_electronico`
--
ALTER TABLE `facturacion_documento_electronico`
  ADD CONSTRAINT `facturacion_document_cliente_id_68fd6127_fk_clientes_` FOREIGN KEY (`cliente_id`) REFERENCES `clientes_cliente` (`id`),
  ADD CONSTRAINT `facturacion_document_documento_referencia_5d5f0f71_fk_facturaci` FOREIGN KEY (`documento_referencia_id`) REFERENCES `facturacion_documento_electronico` (`id`),
  ADD CONSTRAINT `facturacion_document_serie_documento_id_c103db1b_fk_facturaci` FOREIGN KEY (`serie_documento_id`) REFERENCES `facturacion_serie_documento` (`id`),
  ADD CONSTRAINT `facturacion_document_tipo_documento_id_66878fe2_fk_facturaci` FOREIGN KEY (`tipo_documento_id`) REFERENCES `facturacion_tipo_documento_electronico` (`id`),
  ADD CONSTRAINT `facturacion_document_vendedor_id_16e25537_fk_usuarios_` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios_usuario` (`id`);

--
-- Filtros para la tabla `facturacion_pago_documento`
--
ALTER TABLE `facturacion_pago_documento`
  ADD CONSTRAINT `facturacion_pago_doc_documento_id_65ff4ae5_fk_facturaci` FOREIGN KEY (`documento_id`) REFERENCES `facturacion_documento_electronico` (`id`),
  ADD CONSTRAINT `facturacion_pago_doc_forma_pago_id_017d5634_fk_facturaci` FOREIGN KEY (`forma_pago_id`) REFERENCES `facturacion_forma_pago` (`id`);

--
-- Filtros para la tabla `facturacion_serie_documento`
--
ALTER TABLE `facturacion_serie_documento`
  ADD CONSTRAINT `facturacion_serie_do_sucursal_id_3b059603_fk_core_sucu` FOREIGN KEY (`sucursal_id`) REFERENCES `core_sucursal` (`id`),
  ADD CONSTRAINT `facturacion_serie_do_tipo_documento_id_6c141beb_fk_facturaci` FOREIGN KEY (`tipo_documento_id`) REFERENCES `facturacion_tipo_documento_electronico` (`id`);

--
-- Filtros para la tabla `integraciones_configuracion_integracion`
--
ALTER TABLE `integraciones_configuracion_integracion`
  ADD CONSTRAINT `integraciones_config_proveedor_id_72414b89_fk_integraci` FOREIGN KEY (`proveedor_id`) REFERENCES `integraciones_proveedor_integracion` (`id`);

--
-- Filtros para la tabla `integraciones_log_integracion`
--
ALTER TABLE `integraciones_log_integracion`
  ADD CONSTRAINT `integraciones_log_in_configuracion_id_607ceb90_fk_integraci` FOREIGN KEY (`configuracion_id`) REFERENCES `integraciones_configuracion_integracion` (`id`),
  ADD CONSTRAINT `integraciones_log_in_documento_electronic_6d6b209a_fk_facturaci` FOREIGN KEY (`documento_electronico_id`) REFERENCES `facturacion_documento_electronico` (`id`),
  ADD CONSTRAINT `integraciones_log_in_proveedor_id_f4d98339_fk_integraci` FOREIGN KEY (`proveedor_id`) REFERENCES `integraciones_proveedor_integracion` (`id`),
  ADD CONSTRAINT `integraciones_log_in_reintento_de_id_ab35c85f_fk_integraci` FOREIGN KEY (`reintento_de_id`) REFERENCES `integraciones_log_integracion` (`id`);

--
-- Filtros para la tabla `integraciones_webhook_integracion`
--
ALTER TABLE `integraciones_webhook_integracion`
  ADD CONSTRAINT `integraciones_webhoo_documento_electronic_3001b37d_fk_facturaci` FOREIGN KEY (`documento_electronico_id`) REFERENCES `facturacion_documento_electronico` (`id`),
  ADD CONSTRAINT `integraciones_webhoo_proveedor_id_1c732143_fk_integraci` FOREIGN KEY (`proveedor_id`) REFERENCES `integraciones_proveedor_integracion` (`id`);

--
-- Filtros para la tabla `inventario_almacen`
--
ALTER TABLE `inventario_almacen`
  ADD CONSTRAINT `inventario_almacen_responsable_id_0abede73_fk_usuarios_` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios_usuario` (`id`),
  ADD CONSTRAINT `inventario_almacen_sucursal_id_48b4d86d_fk_core_sucursal_id` FOREIGN KEY (`sucursal_id`) REFERENCES `core_sucursal` (`id`);

--
-- Filtros para la tabla `inventario_detalle_movimiento`
--
ALTER TABLE `inventario_detalle_movimiento`
  ADD CONSTRAINT `inventario_detalle_m_lote_id_d1f6b7cf_fk_inventari` FOREIGN KEY (`lote_id`) REFERENCES `inventario_lote_producto` (`id`),
  ADD CONSTRAINT `inventario_detalle_m_movimiento_id_f03e0494_fk_inventari` FOREIGN KEY (`movimiento_id`) REFERENCES `inventario_movimiento_inventario` (`id`),
  ADD CONSTRAINT `inventario_detalle_m_producto_id_dd716a6b_fk_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos_producto` (`id`);

--
-- Filtros para la tabla `inventario_lote_producto`
--
ALTER TABLE `inventario_lote_producto`
  ADD CONSTRAINT `inventario_lote_prod_almacen_id_a14ed146_fk_inventari` FOREIGN KEY (`almacen_id`) REFERENCES `inventario_almacen` (`id`),
  ADD CONSTRAINT `inventario_lote_prod_producto_id_f8280345_fk_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos_producto` (`id`),
  ADD CONSTRAINT `inventario_lote_prod_proveedor_id_78eabd4c_fk_clientes_` FOREIGN KEY (`proveedor_id`) REFERENCES `clientes_cliente` (`id`);

--
-- Filtros para la tabla `inventario_movimiento_inventario`
--
ALTER TABLE `inventario_movimiento_inventario`
  ADD CONSTRAINT `inventario_movimient_almacen_id_712ef066_fk_inventari` FOREIGN KEY (`almacen_id`) REFERENCES `inventario_almacen` (`id`),
  ADD CONSTRAINT `inventario_movimient_documento_electronic_7660daa8_fk_facturaci` FOREIGN KEY (`documento_electronico_id`) REFERENCES `facturacion_documento_electronico` (`id`),
  ADD CONSTRAINT `inventario_movimient_proveedor_cliente_id_edf26eed_fk_clientes_` FOREIGN KEY (`proveedor_cliente_id`) REFERENCES `clientes_cliente` (`id`),
  ADD CONSTRAINT `inventario_movimient_tipo_movimiento_id_b007577d_fk_inventari` FOREIGN KEY (`tipo_movimiento_id`) REFERENCES `inventario_tipo_movimiento` (`id`),
  ADD CONSTRAINT `inventario_movimient_usuario_autorizacion_63be4bd3_fk_usuarios_` FOREIGN KEY (`usuario_autorizacion_id`) REFERENCES `usuarios_usuario` (`id`),
  ADD CONSTRAINT `inventario_movimient_usuario_creacion_id_78fe722a_fk_usuarios_` FOREIGN KEY (`usuario_creacion_id`) REFERENCES `usuarios_usuario` (`id`);

--
-- Filtros para la tabla `inventario_stock_producto`
--
ALTER TABLE `inventario_stock_producto`
  ADD CONSTRAINT `inventario_stock_pro_almacen_id_3f2ba748_fk_inventari` FOREIGN KEY (`almacen_id`) REFERENCES `inventario_almacen` (`id`),
  ADD CONSTRAINT `inventario_stock_pro_producto_id_38a651c0_fk_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos_producto` (`id`);

--
-- Filtros para la tabla `productos_categoria`
--
ALTER TABLE `productos_categoria`
  ADD CONSTRAINT `productos_categoria_categoria_padre_id_d9c192bb_fk_productos` FOREIGN KEY (`categoria_padre_id`) REFERENCES `productos_categoria` (`id`);

--
-- Filtros para la tabla `productos_producto`
--
ALTER TABLE `productos_producto`
  ADD CONSTRAINT `productos_producto_categoria_id_1fef506a_fk_productos` FOREIGN KEY (`categoria_id`) REFERENCES `productos_categoria` (`id`),
  ADD CONSTRAINT `productos_producto_tipo_producto_id_8469379d_fk_productos` FOREIGN KEY (`tipo_producto_id`) REFERENCES `productos_tipo_producto` (`id`);

--
-- Filtros para la tabla `productos_producto_proveedor`
--
ALTER TABLE `productos_producto_proveedor`
  ADD CONSTRAINT `productos_producto_p_producto_id_2d9bf41f_fk_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos_producto` (`id`),
  ADD CONSTRAINT `productos_producto_p_proveedor_id_92a1c262_fk_clientes_` FOREIGN KEY (`proveedor_id`) REFERENCES `clientes_cliente` (`id`);

--
-- Filtros para la tabla `usuarios_perfil`
--
ALTER TABLE `usuarios_perfil`
  ADD CONSTRAINT `usuarios_perfil_usuario_id_ca6ea2f9_fk_usuarios_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`);

--
-- Filtros para la tabla `usuarios_sesion`
--
ALTER TABLE `usuarios_sesion`
  ADD CONSTRAINT `usuarios_sesion_usuario_id_424dc6f4_fk_usuarios_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`);

--
-- Filtros para la tabla `usuarios_usuario`
--
ALTER TABLE `usuarios_usuario`
  ADD CONSTRAINT `usuarios_usuario_rol_id_b0d64932_fk_usuarios_rol_id` FOREIGN KEY (`rol_id`) REFERENCES `usuarios_rol` (`id`);

--
-- Filtros para la tabla `usuarios_usuario_groups`
--
ALTER TABLE `usuarios_usuario_groups`
  ADD CONSTRAINT `usuarios_usuario_gro_usuario_id_7a34077f_fk_usuarios_` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`),
  ADD CONSTRAINT `usuarios_usuario_groups_group_id_e77f6dcf_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Filtros para la tabla `usuarios_usuario_user_permissions`
--
ALTER TABLE `usuarios_usuario_user_permissions`
  ADD CONSTRAINT `usuarios_usuario_use_permission_id_4e5c0f2f_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `usuarios_usuario_use_usuario_id_60aeea80_fk_usuarios_` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
