-- FELICITAFAC - Script de Creación de Estructura Base de Datos
-- Sistema de Facturación Electrónica para Perú
-- Optimizado para MySQL 8.0+ y hosting compartido

-- =======================================================
-- CONFIGURACIÓN INICIAL DE LA BASE DE DATOS
-- =======================================================

-- Configurar charset y collation para soporte completo de UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Configurar modo SQL para compatibilidad
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- =======================================================
-- CREACIÓN DE LA BASE DE DATOS
-- =======================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `felicitafac_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE `felicitafac_db`;

-- =======================================================
-- CONFIGURACIONES ESPECÍFICAS PARA HOSTING COMPARTIDO
-- =======================================================

-- Configurar variables de sesión para optimizar performance
SET SESSION innodb_buffer_pool_size = 128M;
SET SESSION max_connections = 100;
SET SESSION query_cache_size = 32M;
SET SESSION query_cache_type = ON;

-- =======================================================
-- TABLA DE CONFIGURACIÓN DEL SISTEMA
-- =======================================================

CREATE TABLE IF NOT EXISTS `core_configuracion_sistema` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `fecha_creacion` datetime(6) NOT NULL,
    `fecha_actualizacion` datetime(6) NOT NULL,
    `activo` tinyint(1) NOT NULL DEFAULT 1,
    `clave` varchar(100) NOT NULL UNIQUE,
    `valor` longtext NOT NULL,
    `descripcion` longtext,
    `tipo_dato` varchar(20) NOT NULL DEFAULT 'string',
    PRIMARY KEY (`id`),
    INDEX `idx_config_clave` (`clave`),
    INDEX `idx_config_activo` (`activo`),
    INDEX `idx_config_fecha` (`fecha_creacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- TABLA DE EMPRESAS
-- =======================================================

CREATE TABLE IF NOT EXISTS `core_empresa` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `fecha_creacion` datetime(6) NOT NULL,
    `fecha_actualizacion` datetime(6) NOT NULL,
    `activo` tinyint(1) NOT NULL DEFAULT 1,
    `ruc` varchar(11) NOT NULL UNIQUE,
    `razon_social` varchar(200) NOT NULL,
    `nombre_comercial` varchar(150),
    `direccion` longtext NOT NULL,
    `ubigeo` varchar(6) NOT NULL,
    `departamento` varchar(50) NOT NULL,
    `provincia` varchar(50) NOT NULL,
    `distrito` varchar(50) NOT NULL,
    `telefono` varchar(20),
    `email` varchar(254),
    `web` varchar(200),
    `usuario_sol` varchar(50),
    `clave_sol` varchar(100),
    `certificado_digital` varchar(100),
    `clave_certificado` varchar(100),
    `logo` varchar(100),
    `pie_pagina` longtext,
    `moneda_defecto` varchar(3) NOT NULL DEFAULT 'PEN',
    `igv_tasa` decimal(5,4) NOT NULL DEFAULT 0.1800,
    PRIMARY KEY (`id`),
    INDEX `idx_empresa_ruc` (`ruc`),
    INDEX `idx_empresa_activo` (`activo`),
    INDEX `idx_empresa_fecha` (`fecha_creacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- TABLA DE SUCURSALES
-- =======================================================

CREATE TABLE IF NOT EXISTS `core_sucursal` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `fecha_creacion` datetime(6) NOT NULL,
    `fecha_actualizacion` datetime(6) NOT NULL,
    `activo` tinyint(1) NOT NULL DEFAULT 1,
    `empresa_id` bigint NOT NULL,
    `codigo` varchar(10) NOT NULL,
    `nombre` varchar(100) NOT NULL,
    `direccion` longtext NOT NULL,
    `telefono` varchar(20),
    `email` varchar(254),
    `es_principal` tinyint(1) NOT NULL DEFAULT 0,
    `serie_factura` varchar(4) NOT NULL DEFAULT 'F001',
    `serie_boleta` varchar(4) NOT NULL DEFAULT 'B001',
    `serie_nota_credito` varchar(4) NOT NULL DEFAULT 'FC01',
    `serie_nota_debito` varchar(4) NOT NULL DEFAULT 'FD01',
    `contador_factura` int unsigned NOT NULL DEFAULT 0,
    `contador_boleta` int unsigned NOT NULL DEFAULT 0,
    `contador_nota_credito` int unsigned NOT NULL DEFAULT 0,
    `contador_nota_debito` int unsigned NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`empresa_id`) REFERENCES `core_empresa` (`id`) ON DELETE CASCADE,
    INDEX `idx_sucursal_empresa_codigo` (`empresa_id`, `codigo`),
    INDEX `idx_sucursal_principal` (`es_principal`),
    INDEX `idx_sucursal_activo` (`activo`),
    UNIQUE KEY `unique_empresa_codigo` (`empresa_id`, `codigo`),
    UNIQUE KEY `unique_empresa_serie_factura` (`empresa_id`, `serie_factura`),
    UNIQUE KEY `unique_empresa_serie_boleta` (`empresa_id`, `serie_boleta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- TABLA DE USUARIOS PERSONALIZADOS
-- =======================================================

CREATE TABLE IF NOT EXISTS `usuarios_usuario` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `password` varchar(128) NOT NULL,
    `last_login` datetime(6),
    `is_superuser` tinyint(1) NOT NULL DEFAULT 0,
    `username` varchar(150) NOT NULL UNIQUE,
    `first_name` varchar(100) NOT NULL,
    `last_name` varchar(100) NOT NULL,
    `email` varchar(254) NOT NULL UNIQUE,
    `is_staff` tinyint(1) NOT NULL DEFAULT 0,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `date_joined` datetime(6) NOT NULL,
    `fecha_creacion` datetime(6) NOT NULL,
    `fecha_actualizacion` datetime(6) NOT NULL,
    `activo` tinyint(1) NOT NULL DEFAULT 1,
    `dni` varchar(8) NOT NULL UNIQUE,
    `telefono` varchar(15),
    `telefono_emergencia` varchar(15),
    `direccion` longtext,
    `fecha_nacimiento` date,
    `cargo` varchar(100),
    `empresa_id` bigint NOT NULL,
    `avatar` varchar(100),
    `requiere_cambio_password` tinyint(1) NOT NULL DEFAULT 1,
    `intentos_login_fallidos` int unsigned NOT NULL DEFAULT 0,
    `fecha_ultimo_login_fallido` datetime(6),
    `cuenta_bloqueada_hasta` datetime(6),
    `notificar_email` tinyint(1) NOT NULL DEFAULT 1,
    `notificar_facturas` tinyint(1) NOT NULL DEFAULT 1,
    `notificar_reportes` tinyint(1) NOT NULL DEFAULT 0,
    `zona_horaria` varchar(50) NOT NULL DEFAULT 'America/Lima',
    `tema_interfaz` varchar(20) NOT NULL DEFAULT 'claro',
    `idioma` varchar(10) NOT NULL DEFAULT 'es',
    `creado_por_id` bigint,
    `ultima_actividad` datetime(6),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`empresa_id`) REFERENCES `core_empresa` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios_usuario` (`id`) ON DELETE SET NULL,
    INDEX `idx_usuario_email` (`email`),
    INDEX `idx_usuario_dni` (`dni`),
    INDEX `idx_usuario_empresa` (`empresa_id`),
    INDEX `idx_usuario_activo` (`is_active`),
    INDEX `idx_usuario_actividad` (`ultima_actividad`),
    INDEX `idx_usuario_bloqueado` (`cuenta_bloqueada_hasta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- TABLA DE RELACIÓN USUARIO-SUCURSAL
-- =======================================================

CREATE TABLE IF NOT EXISTS `usuarios_usuario_sucursal` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `fecha_creacion` datetime(6) NOT NULL,
    `fecha_actualizacion` datetime(6) NOT NULL,
    `activo` tinyint(1) NOT NULL DEFAULT 1,
    `usuario_id` bigint NOT NULL,
    `sucursal_id` bigint NOT NULL,
    `es_principal` tinyint(1) NOT NULL DEFAULT 0,
    `permisos_especiales` json DEFAULT NULL,
    `fecha_asignacion` datetime(6) NOT NULL,
    `asignado_por_id` bigint,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sucursal_id`) REFERENCES `core_sucursal` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`asignado_por_id`) REFERENCES `usuarios_usuario` (`id`) ON DELETE SET NULL,
    INDEX `idx_usuario_sucursal` (`usuario_id`, `sucursal_id`),
    INDEX `idx_usuario_sucursal_principal` (`es_principal`),
    INDEX `idx_usuario_sucursal_activo` (`activo`),
    UNIQUE KEY `unique_usuario_sucursal` (`usuario_id`, `sucursal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- TABLA DE SESIONES DE USUARIO
-- =======================================================

CREATE TABLE IF NOT EXISTS `usuarios_sesion_usuario` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `usuario_id` bigint NOT NULL,
    `session_key` varchar(40) NOT NULL UNIQUE,
    `ip_address` varchar(45) NOT NULL,
    `user_agent` longtext NOT NULL,
    `fecha_inicio` datetime(6) NOT NULL,
    `fecha_fin` datetime(6),
    `activa` tinyint(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`) ON DELETE CASCADE,
    INDEX `idx_sesion_usuario_activa` (`usuario_id`, `activa`),
    INDEX `idx_sesion_key` (`session_key`),
    INDEX `idx_sesion_inicio` (`fecha_inicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- TABLA DE CACHE PARA DJANGO
-- =======================================================

CREATE TABLE IF NOT EXISTS `felicitafac_cache_table` (
    `cache_key` varchar(255) NOT NULL,
    `value` longtext NOT NULL,
    `expires` datetime(6) NOT NULL,
    PRIMARY KEY (`cache_key`),
    INDEX `idx_cache_expires` (`expires`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- TABLAS DJANGO AUTH (Grupos y Permisos)
-- =======================================================

CREATE TABLE IF NOT EXISTS `auth_group` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(150) NOT NULL UNIQUE,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `django_content_type` (
    `id` int NOT NULL AUTO_INCREMENT,
    `app_label` varchar(100) NOT NULL,
    `model` varchar(100) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`, `model`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auth_permission` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `content_type_id` int NOT NULL,
    `codename` varchar(100) NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
    UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`, `codename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auth_group_permissions` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `group_id` int NOT NULL,
    `permission_id` int NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
    FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
    UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`, `permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usuarios_usuario_groups` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `usuario_id` bigint NOT NULL,
    `group_id` int NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`),
    FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
    UNIQUE KEY `usuarios_usuario_groups_usuario_id_group_id_c8b4e8bb_uniq` (`usuario_id`, `group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usuarios_usuario_user_permissions` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `usuario_id` bigint NOT NULL,
    `permission_id` int NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`),
    FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
    UNIQUE KEY `usuarios_usuario_user_permissions_usuario_id_permission_id_9bce0b1a_uniq` (`usuario_id`, `permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- TABLA DE MIGRACIONES DJANGO
-- =======================================================

CREATE TABLE IF NOT EXISTS `django_migrations` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `app` varchar(255) NOT NULL,
    `name` varchar(255) NOT NULL,
    `applied` datetime(6) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- TABLA DE SESIONES DJANGO
-- =======================================================

CREATE TABLE IF NOT EXISTS `django_session` (
    `session_key` varchar(40) NOT NULL,
    `session_data` longtext NOT NULL,
    `expire_date` datetime(6) NOT NULL,
    PRIMARY KEY (`session_key`),
    INDEX `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- CONFIGURACIONES ADICIONALES PARA HOSTING COMPARTIDO
-- =======================================================

-- Optimizar tablas para hosting compartido
ALTER TABLE `core_empresa` ENGINE=InnoDB ROW_FORMAT=COMPRESSED;
ALTER TABLE `core_sucursal` ENGINE=InnoDB ROW_FORMAT=COMPRESSED;
ALTER TABLE `usuarios_usuario` ENGINE=InnoDB ROW_FORMAT=COMPRESSED;

-- Configurar auto_increment inicial más alto para evitar conflictos
ALTER TABLE `core_empresa` AUTO_INCREMENT=1000;
ALTER TABLE `core_sucursal` AUTO_INCREMENT=1000;
ALTER TABLE `usuarios_usuario` AUTO_INCREMENT=1000;

-- =======================================================
-- TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- =======================================================

-- Trigger para actualizar fecha_actualizacion en core_empresa
DELIMITER ;;
CREATE TRIGGER `tr_empresa_update` 
BEFORE UPDATE ON `core_empresa`
FOR EACH ROW
BEGIN
    SET NEW.fecha_actualizacion = NOW(6);
END;;

-- Trigger para actualizar fecha_actualizacion en core_sucursal
CREATE TRIGGER `tr_sucursal_update` 
BEFORE UPDATE ON `core_sucursal`
FOR EACH ROW
BEGIN
    SET NEW.fecha_actualizacion = NOW(6);
END;;

-- Trigger para actualizar fecha_actualizacion en usuarios_usuario
CREATE TRIGGER `tr_usuario_update` 
BEFORE UPDATE ON `usuarios_usuario`
FOR EACH ROW
BEGIN
    SET NEW.fecha_actualizacion = NOW(6);
END;;
DELIMITER ;

-- =======================================================
-- PROCEDIMIENTOS ALMACENADOS PARA OPERACIONES COMUNES
-- =======================================================

-- Procedimiento para obtener siguiente número de documento
DELIMITER ;;
CREATE PROCEDURE `sp_obtener_siguiente_numero`(
    IN p_sucursal_id BIGINT,
    IN p_tipo_documento VARCHAR(20),
    OUT p_numero_completo VARCHAR(20)
)
BEGIN
    DECLARE v_serie VARCHAR(4);
    DECLARE v_contador INT;
    
    CASE p_tipo_documento
        WHEN 'factura' THEN
            SELECT serie_factura, contador_factura + 1 
            INTO v_serie, v_contador
            FROM core_sucursal 
            WHERE id = p_sucursal_id;
            
            UPDATE core_sucursal 
            SET contador_factura = v_contador 
            WHERE id = p_sucursal_id;
            
        WHEN 'boleta' THEN
            SELECT serie_boleta, contador_boleta + 1 
            INTO v_serie, v_contador
            FROM core_sucursal 
            WHERE id = p_sucursal_id;
            
            UPDATE core_sucursal 
            SET contador_boleta = v_contador 
            WHERE id = p_sucursal_id;
            
        WHEN 'nota_credito' THEN
            SELECT serie_nota_credito, contador_nota_credito + 1 
            INTO v_serie, v_contador
            FROM core_sucursal 
            WHERE id = p_sucursal_id;
            
            UPDATE core_sucursal 
            SET contador_nota_credito = v_contador 
            WHERE id = p_sucursal_id;
            
        WHEN 'nota_debito' THEN
            SELECT serie_nota_debito, contador_nota_debito + 1 
            INTO v_serie, v_contador
            FROM core_sucursal 
            WHERE id = p_sucursal_id;
            
            UPDATE core_sucursal 
            SET contador_nota_debito = v_contador 
            WHERE id = p_sucursal_id;
    END CASE;
    
    SET p_numero_completo = CONCAT(v_serie, '-', LPAD(v_contador, 8, '0'));
END;;
DELIMITER ;

-- =======================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- =======================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX `idx_empresa_activo_ruc` ON `core_empresa` (`activo`, `ruc`);
CREATE INDEX `idx_sucursal_empresa_activo` ON `core_sucursal` (`empresa_id`, `activo`);
CREATE INDEX `idx_usuario_empresa_activo` ON `usuarios_usuario` (`empresa_id`, `is_active`);

-- Índices para campos de fecha frecuentemente consultados
CREATE INDEX `idx_usuario_fecha_actividad` ON `usuarios_usuario` (`ultima_actividad`, `is_active`);
CREATE INDEX `idx_sesion_fecha_activa` ON `usuarios_sesion_usuario` (`fecha_inicio`, `activa`);

-- =======================================================
-- CONFIGURACIÓN DE ENCODING Y CHARSET FINAL
-- =======================================================

-- Asegurar que todas las tablas usen utf8mb4
ALTER DATABASE `felicitafac_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Mensaje de confirmación
SELECT 'FELICITAFAC - Estructura de base de datos creada exitosamente' AS mensaje;
SELECT 'MySQL optimizado para hosting compartido' AS configuracion;
SELECT NOW() AS fecha_creacion;