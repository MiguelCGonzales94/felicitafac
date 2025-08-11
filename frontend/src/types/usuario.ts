/**
 * Types Usuario - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Tipos específicos para gestión de usuarios y permisos
 */

// =======================================================
// TIPOS BÁSICOS DE USUARIO
// =======================================================

export type CodigoRol = 'administrador' | 'contador' | 'vendedor' | 'cliente';
export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
export type TipoVerificacion = 'email' | 'telefono' | 'dos_factores';
export type MetodoAutenticacion = 'password' | 'google' | 'microsoft' | 'token';

// =======================================================
// INTERFACES PRINCIPALES DE USUARIO
// =======================================================

export interface Usuario {
  id: number;
  codigo: string;
  
  // Identificación
  email: string;
  nombre_usuario?: string;
  
  // Datos personales
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  tipo_documento?: string;
  numero_documento?: string;
  fecha_nacimiento?: string;
  
  // Contacto
  telefono?: string;
  telefono_alternativo?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  
  // Profesional
  cargo?: string;
  area?: string;
  jefe_directo_id?: number;
  jefe_directo_nombre?: string;
  fecha_ingreso?: string;
  salario?: number;
  
  // Rol y permisos
  rol_id: number;
  rol_detalle: RolDetalle;
  permisos_adicionales: string[];
  permisos_denegados: string[];
  
  // Configuración
  zona_horaria: string;
  idioma: string;
  formato_fecha: string;
  formato_hora: string;
  tema_preferido: 'claro' | 'oscuro' | 'auto';
  
  // Seguridad
  estado_usuario: EstadoUsuario;
  requiere_cambio_password: boolean;
  password_temporal: boolean;
  ultimo_cambio_password?: string;
  intentos_login_fallidos: number;
  bloqueado_hasta?: string;
  
  // Verificación
  email_verificado: boolean;
  telefono_verificado: boolean;
  verificacion_dos_factores: boolean;
  metodos_verificacion: TipoVerificacion[];
  
  // Sesiones y actividad
  ultimo_login?: string;
  ultimo_logout?: string;
  ip_ultimo_login?: string;
  sesiones_activas: number;
  tiempo_inactividad_minutos: number;
  
  // Notificaciones
  recibir_notificaciones_email: boolean;
  recibir_notificaciones_sistema: boolean;
  recibir_notificaciones_movil: boolean;
  frecuencia_resumen_email: 'diaria' | 'semanal' | 'mensual' | 'nunca';
  
  // Avatar y personalización
  avatar?: string;
  banner?: string;
  biografia?: string;
  redes_sociales?: RedesSociales;
  
  // Preferencias del sistema
  configuracion_dashboard: ConfiguracionDashboard;
  configuracion_pos: ConfiguracionPOS;
  configuracion_reportes: ConfiguracionReportes;
  
  // Metadatos
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_creacion: number;
  usuario_actualizacion?: number;
  activo: boolean;
  
  // Estadísticas
  total_documentos_creados?: number;
  total_ventas_realizadas?: number;
  promedio_documentos_dia?: number;
  ultimo_documento_creado?: string;
}

// =======================================================
// INTERFACES DE ROLES Y PERMISOS
// =======================================================

export interface RolDetalle {
  id: number;
  nombre: string;
  codigo: CodigoRol;
  descripcion: string;
  color?: string;
  icono?: string;
  
  // Configuración
  es_sistema: boolean;
  modificable: boolean;
  puede_eliminar: boolean;
  nivel_jerarquia: number;
  
  // Permisos
  permisos: PermisoDetalle[];
  total_permisos: number;
  
  // Control
  activo: boolean;
  fecha_creacion: string;
  
  // Estadísticas
  total_usuarios: number;
  usuarios_activos: number;
}

export interface PermisoDetalle {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: string;
  categoria: string;
  tipo_permiso: 'lectura' | 'escritura' | 'eliminacion' | 'administracion';
  es_critico: boolean;
  requiere_autorizacion: boolean;
  dependencias: string[];
  activo: boolean;
}

export interface ModuloPermiso {
  codigo: string;
  nombre: string;
  descripcion: string;
  icono?: string;
  orden: number;
  permisos: PermisoDetalle[];
  activo: boolean;
}

// =======================================================
// INTERFACES DE CONFIGURACIÓN PERSONAL
// =======================================================

export interface ConfiguracionDashboard {
  widgets_visibles: string[];
  orden_widgets: string[];
  tamaño_widgets: Record<string, 'small' | 'medium' | 'large'>;
  columnas_dashboard: number;
  mostrar_atajos: boolean;
  mostrar_notificaciones: boolean;
  auto_actualizar: boolean;
  intervalo_actualizacion: number;
}

export interface ConfiguracionPOS {
  mostrar_imagenes_productos: boolean;
  productos_por_pagina: number;
  auto_buscar_cliente: boolean;
  solicitar_email_cliente: boolean;
  imprimir_automatico: boolean;
  abrir_caja_automatico: boolean;
  sonidos_habilitados: boolean;
  metodos_pago_habilitados: string[];
  descuento_maximo_sin_autorizacion: number;
}

export interface ConfiguracionReportes {
  formato_preferido: 'pdf' | 'excel' | 'csv';
  incluir_graficos: boolean;
  enviar_email_automatico: boolean;
  destinatarios_email: string[];
  programar_reportes: boolean;
  reportes_favoritos: string[];
  filtros_guardados: Record<string, any>;
}

export interface RedesSociales {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  website?: string;
}

// =======================================================
// INTERFACES DE AUTENTICACIÓN
// =======================================================

export interface CredencialesLogin {
  email: string;
  password: string;
  recordarme?: boolean;
  codigo_verificacion?: string;
  ip_cliente?: string;
  user_agent?: string;
}

export interface TokensAutenticacion {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string[];
}

export interface SesionUsuario {
  id: string;
  usuario_id: number;
  token_jti: string;
  ip_address: string;
  user_agent: string;
  dispositivo: string;
  ubicacion?: string;
  fecha_inicio: string;
  fecha_ultimo_uso: string;
  fecha_expiracion: string;
  activa: boolean;
  push_token?: string;
}

export interface VerificacionDosFactor {
  habilitado: boolean;
  metodo: 'app' | 'sms' | 'email';
  codigo_secreto?: string;
  codigos_recuperacion: string[];
  fecha_habilitacion?: string;
  ultimo_uso?: string;
}

// =======================================================
// INTERFACES DE FORMULARIOS
// =======================================================

export interface FormularioUsuario {
  // Datos básicos
  email: string;
  nombres: string;
  apellidos: string;
  tipo_documento?: string;
  numero_documento?: string;
  
  // Contacto
  telefono?: string;
  telefono_alternativo?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  
  // Profesional
  cargo?: string;
  area?: string;
  jefe_directo_id?: number;
  fecha_ingreso?: string;
  salario?: number;
  
  // Configuración
  rol_id: number;
  zona_horaria?: string;
  idioma?: string;
  
  // Seguridad
  password?: string;
  confirmar_password?: string;
  requiere_cambio_password?: boolean;
  
  // Permisos especiales
  permisos_adicionales?: string[];
  permisos_denegados?: string[];
  
  // Notificaciones
  recibir_notificaciones_email?: boolean;
  recibir_notificaciones_sistema?: boolean;
  frecuencia_resumen_email?: string;
}

export interface FormularioPerfilUsuario {
  nombres: string;
  apellidos: string;
  telefono?: string;
  direccion?: string;
  cargo?: string;
  biografia?: string;
  zona_horaria: string;
  idioma: string;
  tema_preferido: 'claro' | 'oscuro' | 'auto';
  recibir_notificaciones_email: boolean;
  recibir_notificaciones_sistema: boolean;
  redes_sociales?: RedesSociales;
}

export interface FormularioCambioPassword {
  password_actual: string;
  password_nueva: string;
  confirmar_password: string;
  cerrar_otras_sesiones?: boolean;
}

export interface FormularioRol {
  nombre: string;
  descripcion: string;
  color?: string;
  icono?: string;
  permisos: string[];
  nivel_jerarquia: number;
}

// =======================================================
// INTERFACES DE CONSULTA Y FILTROS
// =======================================================

export interface FiltrosUsuario {
  busqueda?: string;
  rol_id?: number;
  estado?: EstadoUsuario;
  area?: string;
  departamento?: string;
  activo_desde?: string;
  ultimo_login_desde?: string;
  ultimo_login_hasta?: string;
  con_sesiones_activas?: boolean;
  verificado?: boolean;
  bloqueado?: boolean;
}

export interface ParametrosBusquedaUsuario {
  termino?: string;
  filtros?: FiltrosUsuario;
  orden_por?: 'nombre' | 'email' | 'rol' | 'ultimo_login' | 'fecha_creacion';
  direccion_orden?: 'asc' | 'desc';
  pagina?: number;
  tamaño_pagina?: number;
  incluir_inactivos?: boolean;
}

// =======================================================
// INTERFACES DE RESPUESTA
// =======================================================

export interface ResumenUsuario {
  id: number;
  codigo: string;
  email: string;
  nombre_completo: string;
  avatar?: string;
  rol_nombre: string;
  rol_color?: string;
  estado_usuario: EstadoUsuario;
  ultimo_login?: string;
  sesiones_activas: number;
  fecha_creacion: string;
  activo: boolean;
}

export interface ListaUsuariosResponse {
  resultados: ResumenUsuario[];
  total: number;
  pagina: number;
  total_paginas: number;
  tamaño_pagina: number;
  resumen_filtros: ResumenFiltrosUsuario;
}

export interface ResumenFiltrosUsuario {
  total_usuarios: number;
  usuarios_activos: number;
  usuarios_bloqueados: number;
  usuarios_pendientes: number;
  sesiones_activas_total: number;
  distribucion_roles: Record<string, number>;
}

export interface DetalleUsuarioResponse {
  usuario: Usuario;
  estadisticas: EstadisticasUsuario;
  sesiones_activas: SesionUsuario[];
  actividad_reciente: ActividadUsuario[];
  permisos_efectivos: string[];
}

// =======================================================
// INTERFACES DE ESTADÍSTICAS
// =======================================================

export interface EstadisticasUsuario {
  // Actividad general
  total_logins: number;
  dias_activos_mes: number;
  promedio_sesiones_dia: number;
  tiempo_promedio_sesion: number;
  
  // Documentos
  total_documentos_creados: number;
  documentos_mes_actual: number;
  documentos_semana_actual: number;
  tipo_documento_mas_usado: string;
  
  // Ventas (si aplica)
  total_ventas_realizadas: number;
  monto_total_vendido: number;
  promedio_venta: number;
  ventas_mes_actual: number;
  
  // Fechas importantes
  fecha_primer_login?: string;
  fecha_ultimo_login?: string;
  fecha_ultimo_documento?: string;
  dias_sin_actividad: number;
  
  // Seguridad
  intentos_fallidos_historico: number;
  cambios_password: number;
  ultimo_cambio_password?: string;
  sesiones_concurrentes_max: number;
}

export interface ActividadUsuario {
  id: number;
  fecha: string;
  tipo_actividad: 'login' | 'logout' | 'documento' | 'configuracion' | 'error';
  descripcion: string;
  modulo?: string;
  ip_address?: string;
  dispositivo?: string;
  detalles?: Record<string, any>;
}

// =======================================================
// INTERFACES DE VALIDACIÓN
// =======================================================

export interface ValidacionUsuario {
  email: {
    valido: boolean;
    mensaje?: string;
    disponible?: boolean;
  };
  password: {
    valido: boolean;
    mensajes?: string[];
    fuerza: 'debil' | 'media' | 'fuerte';
  };
  datos_personales: {
    valido: boolean;
    mensajes?: string[];
  };
  permisos: {
    valido: boolean;
    conflictos?: string[];
  };
}

export interface ErroresFormularioUsuario {
  email?: string;
  password?: string;
  confirmar_password?: string;
  nombres?: string;
  apellidos?: string;
  rol_id?: string;
  telefono?: string;
  numero_documento?: string;
  permisos?: string;
  general?: string;
}

// =======================================================
// INTERFACES DE ACCIONES
// =======================================================

export interface AccionUsuario {
  tipo: 'crear' | 'editar' | 'eliminar' | 'activar' | 'desactivar' | 'bloquear' | 'desbloquear' | 'resetear_password';
  usuario_id?: number;
  datos?: Partial<FormularioUsuario>;
  motivo?: string;
  notificar_usuario?: boolean;
}

export interface ResultadoAccionUsuario {
  exito: boolean;
  mensaje: string;
  usuario?: Usuario;
  password_temporal?: string;
  errores?: ErroresFormularioUsuario;
}

// =======================================================
// INTERFACES DE NOTIFICACIONES
// =======================================================

export interface NotificacionUsuario {
  id: number;
  usuario_id: number;
  tipo: 'info' | 'warning' | 'error' | 'success';
  categoria: 'sistema' | 'documento' | 'venta' | 'inventario' | 'seguridad';
  titulo: string;
  mensaje: string;
  datos_adicionales?: Record<string, any>;
  
  // Control
  leida: boolean;
  fecha_leida?: string;
  importante: boolean;
  requiere_accion: boolean;
  accion_url?: string;
  accion_texto?: string;
  
  // Fechas
  fecha_creacion: string;
  fecha_expiracion?: string;
  
  // Origen
  origen_usuario_id?: number;
  origen_sistema: string;
  origen_modulo: string;
}

export interface PreferenciaNotificacion {
  usuario_id: number;
  tipo_notificacion: string;
  habilitado: boolean;
  via_email: boolean;
  via_sistema: boolean;
  via_movil: boolean;
  frecuencia: 'inmediata' | 'agrupada' | 'diaria' | 'semanal';
}

// =======================================================
// INTERFACES DE AUDITORÍA
// =======================================================

export interface LogAuditoriaUsuario {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  accion: string;
  modulo: string;
  recurso_tipo: string;
  recurso_id?: number;
  datos_anteriores?: Record<string, any>;
  datos_nuevos?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  fecha_accion: string;
  exito: boolean;
  mensaje_error?: string;
}

export interface ReporteAuditoriaUsuario {
  usuario_id: number;
  periodo_desde: string;
  periodo_hasta: string;
  total_acciones: number;
  acciones_exitosas: number;
  acciones_fallidas: number;
  modulos_accedidos: string[];
  ips_utilizadas: string[];
  dispositivos_utilizados: string[];
  detalle_acciones: LogAuditoriaUsuario[];
}

// =======================================================
// INTERFACES DE CONFIGURACIÓN DEL SISTEMA
// =======================================================

export interface ConfiguracionSeguridadUsuarios {
  // Passwords
  longitud_minima_password: number;
  requiere_mayusculas: boolean;
  requiere_minusculas: boolean;
  requiere_numeros: boolean;
  requiere_simbolos: boolean;
  historial_passwords: number;
  expiracion_password_dias: number;
  
  // Sesiones
  timeout_sesion_minutos: number;
  sesiones_concurrentes_max: number;
  forzar_logout_cambio_password: boolean;
  
  // Bloqueos
  intentos_login_max: number;
  tiempo_bloqueo_minutos: number;
  bloqueo_automatico_dias_inactividad: number;
  
  // Verificación
  requiere_verificacion_email: boolean;
  requiere_dos_factores_admin: boolean;
  metodos_verificacion_permitidos: TipoVerificacion[];
  
  // Auditoría
  registrar_intentos_fallidos: boolean;
  registrar_cambios_sensibles: boolean;
  tiempo_retencion_logs_dias: number;
}

// =======================================================
// TYPES AUXILIARES
// =======================================================

export type PermisosEfectivos = Record<string, boolean>;
export type EstadoSesion = 'activa' | 'inactiva' | 'expirada' | 'forzada';

export interface UsuarioConPermisos extends Usuario {
  permisos_efectivos: PermisosEfectivos;
  puede_acceder: (permiso: string) => boolean;
  es_administrador: () => boolean;
  es_contador: () => boolean;
  es_vendedor: () => boolean;
}

// =======================================================
// INTERFACES DE CONTEXTO
// =======================================================

export interface ContextoUsuarios {
  usuarios: ResumenUsuario[];
  usuario_seleccionado?: Usuario;
  roles: RolDetalle[];
  permisos: ModuloPermiso[];
  filtros: FiltrosUsuario;
  loading: boolean;
  error?: string;
  total: number;
  pagina: number;
  total_paginas: number;
  configuracion_seguridad: ConfiguracionSeguridadUsuarios;
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default {
  Usuario,
  RolDetalle,
  PermisoDetalle,
  FormularioUsuario,
  FormularioPerfilUsuario,
  ResumenUsuario,
  EstadisticasUsuario,
  FiltrosUsuario,
  NotificacionUsuario,
  SesionUsuario,
  ValidacionUsuario,
  ErroresFormularioUsuario,
  ConfiguracionSeguridadUsuarios,
  UsuarioConPermisos,
  ContextoUsuarios
};