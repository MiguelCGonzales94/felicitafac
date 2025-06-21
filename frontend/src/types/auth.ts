/**
 * Types Auth - Tipos TypeScript FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Definiciones de tipos para autenticación y usuarios
 */

// =======================================================
// TIPOS DE DATOS BÁSICOS
// =======================================================

/**
 * Tipos de documento de identidad
 */
export type TipoDocumento = 'dni' | 'ruc' | 'carnet_extranjeria' | 'pasaporte';

/**
 * Estados del usuario
 */
export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido' | 'bloqueado';

/**
 * Códigos de roles del sistema
 */
export type CodigoRol = 'administrador' | 'contador' | 'vendedor' | 'cliente';

/**
 * Idiomas soportados
 */
export type Idioma = 'es' | 'en';

/**
 * Países soportados
 */
export type Pais = 'Perú' | 'Colombia' | 'Ecuador' | 'Bolivia' | 'Chile';

// =======================================================
// INTERFACES DE MODELOS
// =======================================================

/**
 * Interface para el modelo Rol
 */
export interface Rol {
  id: number;
  nombre: string;
  codigo: CodigoRol;
  descripcion: string;
  nivel_acceso: number;
  permisos_especiales: Record<string, any>;
  cantidad_usuarios?: number;
  activo: boolean;
  fecha_creacion: string;
}

/**
 * Interface para el perfil de usuario
 */
export interface PerfilUsuario {
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  pais: Pais;
  tema_oscuro: boolean;
  idioma: Idioma;
  timezone: string;
  configuracion_dashboard: Record<string, any>;
  cargo?: string;
  empresa?: string;
  biografia?: string;
  avatar?: string;
  edad?: number;
}

/**
 * Interface para el modelo Usuario
 */
export interface Usuario {
  id: number;
  email: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  telefono?: string;
  estado_usuario: EstadoUsuario;
  rol: number;
  rol_detalle: Rol;
  perfil?: PerfilUsuario;
  is_active: boolean;
  is_staff: boolean;
  fecha_ultimo_login?: string;
  intentos_login_fallidos: number;
  debe_cambiar_password: boolean;
  notificaciones_email: boolean;
  notificaciones_sistema: boolean;
  puede_login: boolean;
  tiempo_sin_login: string;
  fecha_creacion: string;
}

/**
 * Interface resumida de usuario para listados
 */
export interface UsuarioResumen {
  id: number;
  email: string;
  nombre_completo: string;
  rol_nombre: string;
  estado_usuario: EstadoUsuario;
  is_active: boolean;
  fecha_ultimo_login?: string;
}

/**
 * Interface para sesión de usuario
 */
export interface SesionUsuario {
  id: number;
  usuario_email: string;
  ip_address: string;
  user_agent: string;
  fecha_inicio: string;
  fecha_ultimo_uso: string;
  activa: boolean;
  fecha_expiracion: string;
  tiempo_activa: number;
  esta_expirada: boolean;
}

// =======================================================
// INTERFACES DE FORMULARIOS
// =======================================================

/**
 * Datos para login
 */
export interface DatosLogin {
  email: string;
  password: string;
  recordar_sesion?: boolean;
}

/**
 * Datos para registro de usuario
 */
export interface DatosRegistro {
  email: string;
  password: string;
  confirmar_password: string;
  nombres: string;
  apellidos: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  telefono?: string;
  acepta_terminos: boolean;
}

/**
 * Datos para cambio de contraseña
 */
export interface DatosCambioPassword {
  password_actual: string;
  password_nueva: string;
  confirmar_password_nueva: string;
}

/**
 * Datos para actualizar perfil básico
 */
export interface DatosActualizarUsuario {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  tipo_documento?: TipoDocumento;
  numero_documento?: string;
  notificaciones_email?: boolean;
  notificaciones_sistema?: boolean;
}

/**
 * Datos para actualizar perfil extendido
 */
export interface DatosActualizarPerfil {
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  pais?: Pais;
  tema_oscuro?: boolean;
  idioma?: Idioma;
  timezone?: string;
  cargo?: string;
  empresa?: string;
  biografia?: string;
  avatar?: File;
  configuracion_dashboard?: Record<string, any>;
}

/**
 * Datos para crear usuario (admin)
 */
export interface DatosCrearUsuario {
  email: string;
  password: string;
  confirmar_password: string;
  nombres: string;
  apellidos: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  telefono?: string;
  rol: number;
  estado_usuario?: EstadoUsuario;
  is_active?: boolean;
  is_staff?: boolean;
  notificaciones_email?: boolean;
  notificaciones_sistema?: boolean;
}

// =======================================================
// INTERFACES DE RESPUESTAS API
// =======================================================

/**
 * Respuesta de login exitoso
 */
export interface RespuestaLogin {
  access: string;
  refresh: string;
  usuario: Usuario;
  mensaje: string;
  fecha_login: string;
  expires_in: number;
}

/**
 * Respuesta de registro exitoso
 */
export interface RespuestaRegistro {
  mensaje: string;
  usuario: {
    id: number;
    email: string;
    nombre_completo: string;
  };
  proximo_paso: string;
}

/**
 * Respuesta de renovación de token
 */
export interface RespuestaRenovarToken {
  access: string;
  refresh?: string;
}

/**
 * Respuesta de validación de token
 */
export interface RespuestaValidarToken {
  valido: boolean;
  usuario?: {
    id: number;
    email: string;
    nombre_completo: string;
    rol: CodigoRol;
  };
  timestamp: string;
}

/**
 * Respuesta de logout
 */
export interface RespuestaLogout {
  mensaje: string;
  fecha_logout: string;
}

/**
 * Respuesta de perfil de usuario
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
 * Respuesta de lista de usuarios
 */
export interface RespuestaListaUsuarios {
  usuarios: UsuarioResumen[];
  estadisticas: {
    total_usuarios: number;
    usuarios_activos: number;
    usuarios_inactivos: number;
    distribucion_por_rol: Array<{
      rol__nombre: string;
      cantidad: number;
    }>;
  };
}

/**
 * Respuesta de estadísticas de usuarios
 */
export interface RespuestaEstadisticasUsuarios {
  resumen: {
    total_usuarios: number;
    usuarios_activos: number;
    usuarios_inactivos: number;
    con_login_reciente: number;
    sesiones_activas: number;
  };
  distribucion_por_estado: Array<{
    estado_usuario: EstadoUsuario;
    cantidad: number;
  }>;
  distribucion_por_rol: Array<{
    rol__nombre: string;
    rol__codigo: CodigoRol;
    cantidad: number;
  }>;
  fecha_calculo: string;
}

// =======================================================
// INTERFACES DE ESTADO
// =======================================================

/**
 * Estado de autenticación
 */
export interface EstadoAuth {
  usuario: Usuario | null;
  token: string | null;
  refreshToken: string | null;
  estaAutenticado: boolean;
  estaCargando: boolean;
  estaLoginCargando: boolean;
  estaRegistroCargando: boolean;
  error: string | null;
}

/**
 * Acciones del reducer de autenticación
 */
export type AccionAuth =
  | { type: 'INICIAR_CARGA' }
  | { type: 'INICIAR_LOGIN' }
  | { type: 'INICIAR_REGISTRO' }
  | { 
      type: 'LOGIN_EXITOSO'; 
      payload: { 
        usuario: Usuario; 
        token: string; 
        refreshToken: string; 
      } 
    }
  | { type: 'REGISTRO_EXITOSO' }
  | { type: 'LOGOUT' }
  | { type: 'ACTUALIZAR_USUARIO'; payload: Usuario }
  | { 
      type: 'ACTUALIZAR_TOKEN'; 
      payload: { 
        token: string; 
        refreshToken: string; 
      } 
    }
  | { type: 'ERROR'; payload: string }
  | { type: 'LIMPIAR_ERROR' }
  | { type: 'FINALIZAR_CARGA' };

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
}

/**
 * Error de validación
 */
export interface ErrorValidacion {
  campo: string;
  mensajes: string[];
}

// =======================================================
// INTERFACES DE FILTROS Y BÚSQUEDA
// =======================================================

/**
 * Filtros para lista de usuarios
 */
export interface FiltrosUsuarios {
  search?: string;
  estado_usuario?: EstadoUsuario;
  rol__codigo?: CodigoRol;
  is_active?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

/**
 * Opciones de paginación
 */
export interface OpcionesPaginacion {
  page: number;
  page_size: number;
  total_pages?: number;
  total_count?: number;
}

/**
 * Respuesta paginada genérica
 */
export interface RespuestaPaginada<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// =======================================================
// INTERFACES DE CONFIGURACIÓN
// =======================================================

/**
 * Configuración del dashboard
 */
export interface ConfiguracionDashboard {
  widgets_visibles: string[];
  layout_columnas: number;
  tema_personalizado?: {
    color_primario?: string;
    color_secundario?: string;
    fuente_principal?: string;
  };
  notificaciones_push: boolean;
  actualizacion_automatica: boolean;
  idioma_reportes: Idioma;
}

/**
 * Configuración de notificaciones
 */
export interface ConfiguracionNotificaciones {
  email_login_nuevo: boolean;
  email_cambio_password: boolean;
  email_factura_emitida: boolean;
  email_reporte_semanal: boolean;
  push_factura_emitida: boolean;
  push_bajo_stock: boolean;
  push_venta_realizada: boolean;
  sonido_notificaciones: boolean;
}

// =======================================================
// INTERFACES DE HOOKS
// =======================================================

/**
 * Resultado del hook useAuth
 */
export interface ResultadoUseAuth {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  estaCargando: boolean;
  error: string | null;
  iniciarSesion: (datos: DatosLogin) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  actualizarPerfil: (datos: Partial<Usuario>) => Promise<void>;
  cambiarPassword: (passwordActual: string, passwordNueva: string) => Promise<void>;
  limpiarError: () => void;
  tienePermiso: (permiso: string) => boolean;
  esAdministrador: () => boolean;
  esContador: () => boolean;
  esVendedor: () => boolean;
  esCliente: () => boolean;
}

// =======================================================
// TIPOS DE UTILIDAD
// =======================================================

/**
 * Permisos del sistema
 */
export type Permiso = 
  | 'crear_usuarios'
  | 'editar_usuarios' 
  | 'eliminar_usuarios'
  | 'ver_reportes'
  | 'crear_facturas'
  | 'anular_facturas'
  | 'gestionar_inventario'
  | 'configurar_sistema'
  | 'ver_dashboard'
  | 'exportar_datos';

/**
 * Opciones de ordenamiento
 */
export type OpcionOrdenamiento = 
  | 'nombres'
  | '-nombres'
  | 'apellidos'
  | '-apellidos'
  | 'fecha_creacion'
  | '-fecha_creacion'
  | 'fecha_ultimo_login'
  | '-fecha_ultimo_login'
  | 'email'
  | '-email';

/**
 * Tamaños de página permitidos
 */
export type TamanoPagina = 10 | 20 | 50 | 100;

// =======================================================
// CONSTANTES DE TIPOS
// =======================================================

/**
 * Opciones de tipo de documento
 */
export const TIPOS_DOCUMENTO: Array<{ value: TipoDocumento; label: string }> = [
  { value: 'dni', label: 'DNI' },
  { value: 'ruc', label: 'RUC' },
  { value: 'carnet_extranjeria', label: 'Carnet de Extranjería' },
  { value: 'pasaporte', label: 'Pasaporte' },
];

/**
 * Opciones de estados de usuario
 */
export const ESTADOS_USUARIO: Array<{ value: EstadoUsuario; label: string; color: string }> = [
  { value: 'activo', label: 'Activo', color: 'green' },
  { value: 'inactivo', label: 'Inactivo', color: 'gray' },
  { value: 'suspendido', label: 'Suspendido', color: 'yellow' },
  { value: 'bloqueado', label: 'Bloqueado', color: 'red' },
];

/**
 * Opciones de roles
 */
export const ROLES_SISTEMA: Array<{ value: CodigoRol; label: string; descripcion: string }> = [
  { 
    value: 'administrador', 
    label: 'Administrador', 
    descripcion: 'Acceso total al sistema' 
  },
  { 
    value: 'contador', 
    label: 'Contador', 
    descripcion: 'Acceso a reportes y configuración contable' 
  },
  { 
    value: 'vendedor', 
    label: 'Vendedor', 
    descripcion: 'Acceso al punto de venta y gestión de clientes' 
  },
  { 
    value: 'cliente', 
    label: 'Cliente', 
    descripcion: 'Consulta de comprobantes propios' 
  },
];

/**
 * Zonas horarias soportadas
 */
export const ZONAS_HORARIAS: Array<{ value: string; label: string }> = [
  { value: 'America/Lima', label: 'Lima (UTC-5)' },
  { value: 'America/Bogota', label: 'Bogotá (UTC-5)' },
  { value: 'America/Guayaquil', label: 'Guayaquil (UTC-5)' },
  { value: 'America/La_Paz', label: 'La Paz (UTC-4)' },
  { value: 'America/Santiago', label: 'Santiago (UTC-3)' },
];s