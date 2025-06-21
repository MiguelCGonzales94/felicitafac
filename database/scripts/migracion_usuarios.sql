-- FELICITAFAC - Migración de Usuarios CORREGIDA
-- Sistema de Facturación Electrónica para Perú
-- VERSIÓN CORREGIDA SIN ERRORES DE SINTAXIS

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

USE `felicitafac_db`;

-- =======================================================
-- CREACIÓN DE TABLAS DE USUARIOS
-- =======================================================

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS `usuarios_rol` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `activo` tinyint(1) NOT NULL DEFAULT 1,
    `nombre` varchar(50) NOT NULL,
    `codigo` varchar(20) NOT NULL UNIQUE,
    `descripcion` longtext NOT NULL,
    `nivel_acceso` int unsigned NOT NULL DEFAULT 1,
    `permisos_especiales` json DEFAULT ('{}'),
    PRIMARY KEY (`id`),
    UNIQUE KEY `usuarios_rol_codigo_unique` (`codigo`),
    INDEX `idx_rol_codigo` (`codigo`),
    INDEX `idx_rol_nivel` (`nivel_acceso`),
    INDEX `idx_rol_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS `usuarios_usuario` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `password` varchar(128) NOT NULL,
    `last_login` datetime(6) NULL,
    `is_superuser` tinyint(1) NOT NULL DEFAULT 0,
    `is_staff` tinyint(1) NOT NULL DEFAULT 0,
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `date_joined` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `activo` tinyint(1) NOT NULL DEFAULT 1,
    `email` varchar(254) NOT NULL UNIQUE,
    `nombres` varchar(100) NOT NULL,
    `apellidos` varchar(100) NOT NULL,
    `tipo_documento` varchar(20) NOT NULL DEFAULT 'dni',
    `numero_documento` varchar(20) NOT NULL UNIQUE,
    `telefono` varchar(20) NULL,
    `estado_usuario` varchar(20) NOT NULL DEFAULT 'activo',
    `rol_id` bigint NOT NULL,
    `fecha_ultimo_login` datetime(6) NULL,
    `intentos_login_fallidos` int unsigned NOT NULL DEFAULT 0,
    `fecha_bloqueo` datetime(6) NULL,
    `debe_cambiar_password` tinyint(1) NOT NULL DEFAULT 0,
    `fecha_cambio_password` datetime(6) NULL,
    `notificaciones_email` tinyint(1) NOT NULL DEFAULT 1,
    `notificaciones_sistema` tinyint(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `usuarios_usuario_email_unique` (`email`),
    UNIQUE KEY `usuarios_usuario_numero_documento_unique` (`numero_documento`),
    KEY `usuarios_usuario_rol_id_fk` (`rol_id`),
    INDEX `idx_usuario_email` (`email`),
    INDEX `idx_usuario_documento` (`numero_documento`),
    INDEX `idx_usuario_estado` (`estado_usuario`),
    INDEX `idx_usuario_rol` (`rol_id`),
    INDEX `idx_usuario_activo` (`is_active`),
    INDEX `idx_usuario_fecha_login` (`fecha_ultimo_login`),
    CONSTRAINT `usuarios_usuario_rol_id_fk` 
        FOREIGN KEY (`rol_id`) REFERENCES `usuarios_rol` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS `usuarios_perfil` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `activo` tinyint(1) NOT NULL DEFAULT 1,
    `usuario_id` bigint NOT NULL UNIQUE,
    `fecha_nacimiento` date NULL,
    `direccion` longtext NULL,
    `ciudad` varchar(100) NULL,
    `pais` varchar(50) NOT NULL DEFAULT 'Perú',
    `tema_oscuro` tinyint(1) NOT NULL DEFAULT 0,
    `idioma` varchar(10) NOT NULL DEFAULT 'es',
    `timezone` varchar(50) NOT NULL DEFAULT 'America/Lima',
    `configuracion_dashboard` json DEFAULT ('{}'),
    `cargo` varchar(100) NULL,
    `empresa` varchar(200) NULL,
    `biografia` longtext NULL,
    `avatar` varchar(100) NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `usuarios_perfil_usuario_id_unique` (`usuario_id`),
    INDEX `idx_perfil_usuario` (`usuario_id`),
    CONSTRAINT `usuarios_perfil_usuario_id_fk` 
        FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Sesiones de Usuario
CREATE TABLE IF NOT EXISTS `usuarios_sesion` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `activo` tinyint(1) NOT NULL DEFAULT 1,
    `usuario_id` bigint NOT NULL,
    `token_sesion` varchar(255) NOT NULL UNIQUE,
    `ip_address` varchar(45) NOT NULL,
    `user_agent` longtext NOT NULL,
    `fecha_inicio` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `fecha_ultimo_uso` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `activa` tinyint(1) NOT NULL DEFAULT 1,
    `fecha_expiracion` datetime(6) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `usuarios_sesion_token_unique` (`token_sesion`),
    KEY `usuarios_sesion_usuario_id_fk` (`usuario_id`),
    INDEX `idx_sesion_usuario` (`usuario_id`),
    INDEX `idx_sesion_token` (`token_sesion`),
    INDEX `idx_sesion_activa` (`activa`),
    INDEX `idx_sesion_expiracion` (`fecha_expiracion`),
    INDEX `idx_sesion_ip` (`ip_address`),
    CONSTRAINT `usuarios_sesion_usuario_id_fk` 
        FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- INSERTAR DATOS INICIALES
-- =======================================================

-- Insertar Roles del Sistema
INSERT INTO `usuarios_rol` 
(`nombre`, `codigo`, `descripcion`, `nivel_acceso`, `permisos_especiales`) 
VALUES
('Administrador', 'administrador', 'Acceso total al sistema de facturación', 4, 
 JSON_OBJECT(
     'crear_usuarios', true,
     'editar_usuarios', true,
     'eliminar_usuarios', true,
     'ver_reportes', true,
     'crear_facturas', true,
     'anular_facturas', true,
     'gestionar_inventario', true,
     'configurar_sistema', true,
     'ver_dashboard', true,
     'exportar_datos', true
 )),
('Contador', 'contador', 'Acceso a reportes y configuración contable', 3,
 JSON_OBJECT(
     'ver_reportes', true,
     'crear_facturas', true,
     'gestionar_inventario', true,
     'ver_dashboard', true,
     'exportar_datos', true
 )),
('Vendedor', 'vendedor', 'Acceso al punto de venta y gestión de clientes', 2,
 JSON_OBJECT(
     'crear_facturas', true,
     'gestionar_inventario', true,
     'ver_dashboard', true
 )),
('Cliente', 'cliente', 'Consulta de comprobantes propios', 1,
 JSON_OBJECT(
     'ver_dashboard', true
 ))
ON DUPLICATE KEY UPDATE
`descripcion` = VALUES(`descripcion`),
`permisos_especiales` = VALUES(`permisos_especiales`);

-- Verificar que roles se insertaron
SELECT 'Roles creados:' as info, COUNT(*) as cantidad FROM usuarios_rol;

-- Fin de migración
SELECT 'Migración de usuarios completada exitosamente' AS status;