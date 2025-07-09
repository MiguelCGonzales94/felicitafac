/**
 * Types Auth Corregidos - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Tipos de autenticación consistentes
 */

// =======================================================
// INTERFACES BÁSICAS
// =======================================================

/**
 * Códigos de rol disponibles en el sistema
 */
export type CodigoRol = 'administrador' | 'contador' | 'vendedor' | 'cliente';

/**
 * Estados del usuario
 */
export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido' | 'pendiente';

/**
 * Permisos disponibles en el sistema
 */
export type Permiso = 
  | 'ver_dashboard'
  | 'crear_facturas'
  | 'ver_reportes'
  | 'exportar_datos'
  | 'gestionar_inventario'
  | 'gestionar_clientes'
  | 'ver_contabilidad'
  | 'generar_ple'
  | 'validar_documentos'
  | 'configurar_sistema'
  | 'gestionar_usuarios'
  | 'ver_ventas'
  | 'ver_mis_documentos';

// =======================================================
// INTERFACES DE USUARIO
// =======================================================

/**
 * Información de rol
 */
export interface Rol {
  id: number;
  nombre: string;
  codigo: CodigoRol;
  descripcion: string;
  permisos?: string[];
  activo: boolean;
}

/**
 * Usuario completo del sistema
 */
export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  nombre_completo: string;
  telefono?: string;
  estado_usuario: EstadoUsuario;
  rol_detalle: Rol;
  fecha_creacion: string;
  ultimo_login?: string;
  requiere_cambio_password: boolean;
  intentos_login_fallidos: number;
  avatar?: string;
  preferencias?: Record<string, any>;
}

/**
 * Resumen de usuario para listas
 */
export interface UsuarioResumen {
  id: number;
  email: string;
  nombre_completo: string;
  rol: string;
  estado_usuario: EstadoUsuario;
  ultimo_login?: string;
  fecha_creacion: string;
}

/**
 * Información de sesión de usuario
 */
export interface SesionUsuario {
  id: number;
  usuario: number;
  token_jti: string;
  ip_address: string;
  user_agent: string;
  fecha_inicio: string;
  fecha_expiracion: string;
  activa: boolean;
  ubicacion?: string;
}

// =======================================================
// INTERFACES DE AUTENTICACIÓN
// =======================================================

/**
 * Datos para login
 */
export interface DatosLogin {
  email: string;
  password: string;
  recordarme?: boolean;
}

/**
 * Datos para registro
 */
export interface DatosRegistro {
  email: string;
  password: string;
  password_confirmation: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  aceptar_terminos: boolean;
}

/**
 * Tokens de autenticación
 */
export interface TokensAuth {
  access: string | null;
  refresh: string | null;
}

/**
 * Estado de autenticación CORREGIDO
 */
export interface EstadoAuth {
  usuario: Usuario | null;
  tokens: TokensAuth;  // ← CORREGIDO: usar objeto tokens
  estaAutenticado: boolean;
  estaCargando: boolean;
  error: string | null;
}

/**
 * Acciones del reducer de autenticación CORREGIDAS
 */
export type AccionAuth =
  | { type: 'INICIAR_CARGA' }
  | { 
      type: 'LOGIN_EXITO'; 
      payload: { 
        usuario: Usuario; 
        tokens: TokensAuth;
      } 
    }
  | { type: 'LOGOUT' }
  | { type: 'ACTUALIZAR_USUARIO'; payload: Usuario }
  | { type: 'ERROR'; payload: string }
  | { type: 'LIMPIAR_ERROR' }
  | { type: 'REFRESCAR_TOKEN'; payload: { access: string } };

// =======================================================
// INTERFACES DE CONTEXTO
// =======================================================

/**
 * Contexto de autenticación
 */
export interface ContextoAuth {
  // Estado
  usuario: Usuario | null;
  estaAutenticado: boolean;
  estaCargando: boolean;
  error: string | null;
  
  // Acciones
  iniciarSesion: (datos: DatosLogin) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  actualizarPerfil: (datos: Partial<Usuario>) => Promise<void>;
  cambiarPassword: (passwordActual: string, passwordNueva: string) => Promise<void>;
  limpiarError: () => void;
  
  // Verificaciones de permisos
  tienePermiso: (permiso: Permiso) => boolean;
  esAdministrador: () => boolean;
  esContador: () => boolean;
  esVendedor: () => boolean;
  esCliente: () => boolean;
  
  // Utilidades
  obtenerToken: () => string | null;
  refrescarToken: () => Promise<void>;
}

// =======================================================
// INTERFACES DE RESPUESTAS API
// =======================================================

/**
 * Respuesta de login
 */
export interface RespuestaLogin {
  access: string;
  refresh: string;
  user: Usuario;
  expires_in: number;
  token_type: string;
}

/**
 * Respuesta de registro
 */
export interface RespuestaRegistro {
  mensaje: string;
  usuario: {
    id: number;
    email: string;
    nombre_completo: string;
  };
  requiere_verificacion: boolean;
}

/**
 * Respuesta de refresh token
 */
export interface RespuestaRefreshToken {
  access: string;
  expires_in: number;
}

/**
 * Respuesta de perfil
 */
export interface RespuestaPerfil {
  usuario: Usuario;
  estadisticas: {
    total_sesiones: number;
    sesiones_activas: number;
    ultimo_login?: string;
    dias_registrado: number;
    intentos_fallidos: number;
  };
  sesiones_activas: SesionUsuario[];
}

/**
 * Respuesta estándar de la API
 */
export interface RespuestaAPI<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  status_code?: number;
}

// =======================================================
// INTERFACES DE ERRORES
// =======================================================

/**
 * Error de API estándar
 */
export interface ErrorAPI {
  error: string;
  mensaje?: string;
  errores?: Record<string, string[]>;
  codigo?: number;
  timestamp?: string;
}

/**
 * Error de validación
 */
export interface ErrorValidacion {
  campo: string;
  mensaje: string;
  codigo: string;
}

// =======================================================
// EXPORTS ADICIONALES
// =======================================================

export default {
  CodigoRol,
  EstadoUsuario,
  Permiso,
  Usuario,
  EstadoAuth,
  AccionAuth,
  ContextoAuth,
  RespuestaAPI,
  ErrorAPI
};