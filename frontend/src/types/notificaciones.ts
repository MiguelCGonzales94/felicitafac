/**
 * Types Notificaciones - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Tipos específicos para gestión de notificaciones y alertas
 */

// =======================================================
// TIPOS BÁSICOS DE NOTIFICACIONES
// =======================================================

export type TipoNotificacion = 
  | 'sistema' 
  | 'usuario' 
  | 'marketing' 
  | 'facturacion' 
  | 'inventario' 
  | 'contabilidad'
  | 'comercial'
  | 'seguridad'
  | 'mantenimiento'
  | 'backup'
  | 'actualizacion'
  | 'vencimiento'
  | 'stock_bajo'
  | 'documento_rechazado'
  | 'pago_pendiente';

export type PrioridadNotificacion = 
  | 'baja' 
  | 'media' 
  | 'alta' 
  | 'critica' 
  | 'urgente';

export type EstadoNotificacion = 
  | 'pendiente' 
  | 'enviada' 
  | 'entregada'
  | 'leida' 
  | 'archivada' 
  | 'eliminada'
  | 'fallida'
  | 'programada';

export type CanalNotificacion = 
  | 'app' 
  | 'email' 
  | 'sms' 
  | 'push' 
  | 'webhook'
  | 'slack'
  | 'teams'
  | 'whatsapp';

export type NivelAlerta = 
  | 'info' 
  | 'warning' 
  | 'error' 
  | 'critical' 
  | 'success';

// =======================================================
// INTERFACE PRINCIPAL DE NOTIFICACIÓN
// =======================================================

export interface Notificacion {
  id: number;
  
  // Información básica
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  resumen?: string;
  
  // Destinatario
  destinatario_id: number;
  destinatario_nombre?: string;
  destinatario_email?: string;
  
  // Remitente
  remitente_id?: number;
  remitente_nombre?: string;
  remitente_tipo?: 'usuario' | 'sistema' | 'automatico';
  
  // Clasificación
  prioridad: PrioridadNotificacion;
  estado: EstadoNotificacion;
  canal: CanalNotificacion;
  categoria?: string;
  
  // Fechas y control
  fecha_creacion: string;
  fecha_envio?: string;
  fecha_entrega?: string;
  fecha_lectura?: string;
  fecha_archivado?: string;
  fecha_programada?: string;
  fecha_expiracion?: string;
  
  // Flags de estado
  es_leida: boolean;
  es_importante: boolean;
  es_archivada: boolean;
  es_eliminada: boolean;
  requiere_accion: boolean;
  
  // Contenido y metadatos
  icono?: string;
  imagen_url?: string;
  enlace_accion?: string;
  texto_accion?: string;
  datos_adicionales?: Record<string, any>;
  
  // Contexto relacionado
  modulo_origen?: string;
  entidad_relacionada_tipo?: string;
  entidad_relacionada_id?: number;
  documento_relacionado?: string;
  
  // Información de entrega
  intentos_envio?: number;
  ultimo_intento?: string;
  error_envio?: string;
  canal_entrega_exitoso?: CanalNotificacion;
  
  // Configuración
  permitir_respuesta?: boolean;
  es_masiva?: boolean;
  grupo_notificacion_id?: number;
}

// =======================================================
// INTERFACES DE FILTROS Y BÚSQUEDA
// =======================================================

export interface FiltrosNotificaciones {
  // Búsqueda
  busqueda?: string;
  
  // Filtros básicos
  tipo?: TipoNotificacion;
  estado?: EstadoNotificacion;
  prioridad?: PrioridadNotificacion;
  canal?: CanalNotificacion;
  categoria?: string;
  
  // Filtros de usuario
  destinatario_id?: number;
  remitente_id?: number;
  
  // Filtros de fecha
  fecha_desde?: string;
  fecha_hasta?: string;
  fecha_creacion_desde?: string;
  fecha_creacion_hasta?: string;
  fecha_lectura_desde?: string;
  fecha_lectura_hasta?: string;
  
  // Filtros de estado
  solo_no_leidas?: boolean;
  solo_leidas?: boolean;
  solo_importantes?: boolean;
  solo_archivadas?: boolean;
  solo_programadas?: boolean;
  solo_con_accion_pendiente?: boolean;
  
  // Filtros de contexto
  modulo_origen?: string;
  entidad_relacionada_tipo?: string;
  entidad_relacionada_id?: number;
  
  // Paginación y ordenamiento
  pagina?: number;
  limite?: number;
  ordenar_por?: string;
  orden?: 'asc' | 'desc';
  
  // Filtros avanzados
  incluir_eliminadas?: boolean;
  incluir_expiradas?: boolean;
  canal_entrega?: CanalNotificacion;
}

// =======================================================
// INTERFACES DE PLANTILLAS
// =======================================================

export interface PlantillaNotificacion {
  id: number;
  
  // Información básica
  nombre: string;
  descripcion?: string;
  codigo: string;
  
  // Configuración
  tipo: TipoNotificacion;
  prioridad_default: PrioridadNotificacion;
  canal_default: CanalNotificacion;
  
  // Contenido
  titulo: string;
  mensaje: string;
  plantilla_email?: string;
  plantilla_sms?: string;
  plantilla_push?: string;
  
  // Variables y personalización
  variables: string[];
  variables_requeridas: string[];
  ejemplo_variables?: Record<string, string>;
  
  // Configuración avanzada
  permite_programacion: boolean;
  permite_respuesta: boolean;
  es_masiva: boolean;
  requiere_confirmacion: boolean;
  
  // Estado y control
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  usuario_creacion_id: number;
  usuario_actualizacion_id?: number;
  
  // Estadísticas de uso
  veces_utilizada?: number;
  ultima_utilizacion?: string;
  
  // Configuración por canal
  configuracion_canales?: {
    email?: {
      asunto_personalizado?: string;
      plantilla_html?: string;
      adjuntos_permitidos?: boolean;
    };
    sms?: {
      mensaje_corto?: string;
      usa_template_sms?: boolean;
    };
    push?: {
      titulo_push?: string;
      icono_push?: string;
      sonido_push?: string;
    };
  };
  
  // Etiquetas y categorización
  etiquetas?: string[];
  categoria?: string;
  modulo_asociado?: string;
}

// =======================================================
// INTERFACES DE CONFIGURACIÓN
// =======================================================

export interface ConfiguracionNotificaciones {
  id: number;
  usuario_id: number;
  
  // Configuración general
  notificaciones_habilitadas: boolean;
  idioma_notificaciones: string;
  zona_horaria: string;
  
  // Configuración por canal
  email_habilitado: boolean;
  email_direccion?: string;
  email_frecuencia: 'inmediata' | 'diaria' | 'semanal' | 'nunca';
  email_resumen_diario: boolean;
  email_marketing: boolean;
  
  sms_habilitado: boolean;
  sms_numero?: string;
  sms_solo_criticas: boolean;
  
  push_habilitado: boolean;
  push_token?: string;
  push_sonido: boolean;
  push_vibracion: boolean;
  
  app_habilitado: boolean;
  app_badge: boolean;
  app_sonido: boolean;
  
  // Configuración por tipo
  tipos_habilitados: TipoNotificacion[];
  tipos_solo_criticas: TipoNotificacion[];
  tipos_sin_sonido: TipoNotificacion[];
  
  // Horarios y frecuencia
  no_molestar_inicio?: string; // HH:mm
  no_molestar_fin?: string;    // HH:mm
  dias_no_molestar?: number[]; // 0=Domingo, 1=Lunes, etc.
  
  // Configuración avanzada
  agrupar_notificaciones: boolean;
  tiempo_agrupacion_minutos: number;
  auto_archivar_dias: number;
  auto_eliminar_dias: number;
  
  // Filtros personalizados
  palabras_clave_importantes?: string[];
  remitentes_bloqueados?: number[];
  modulos_silenciados?: string[];
  
  // Fechas de control
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

// =======================================================
// INTERFACES DE ESTADÍSTICAS
// =======================================================

export interface EstadisticasNotificaciones {
  // Período de análisis
  fecha_desde: string;
  fecha_hasta: string;
  total_dias: number;
  
  // Contadores generales
  total_notificaciones: number;
  notificaciones_enviadas: number;
  notificaciones_entregadas: number;
  notificaciones_leidas: number;
  notificaciones_archivadas: number;
  notificaciones_eliminadas: number;
  
  // Tasas de engagement
  tasa_entrega: number;     // porcentaje
  tasa_lectura: number;     // porcentaje
  tasa_accion: number;      // porcentaje
  tiempo_promedio_lectura: number; // minutos
  
  // Estadísticas por tipo
  por_tipo: Array<{
    tipo: TipoNotificacion;
    cantidad: number;
    leidas: number;
    tasa_lectura: number;
  }>;
  
  // Estadísticas por prioridad
  por_prioridad: Array<{
    prioridad: PrioridadNotificacion;
    cantidad: number;
    leidas: number;
    tiempo_promedio_lectura: number;
  }>;
  
  // Estadísticas por canal
  por_canal: Array<{
    canal: CanalNotificacion;
    enviadas: number;
    entregadas: number;
    leidas: number;
    tasa_entrega: number;
    tasa_lectura: number;
  }>;
  
  // Tendencias temporales
  por_dia: Array<{
    fecha: string;
    total: number;
    leidas: number;
    archivadas: number;
  }>;
  
  por_hora: Array<{
    hora: number;
    cantidad: number;
    tasa_lectura: number;
  }>;
  
  // Top de contenido
  tipos_mas_enviados: Array<{
    tipo: TipoNotificacion;
    cantidad: number;
    porcentaje: number;
  }>;
  
  plantillas_mas_usadas: Array<{
    plantilla_id: number;
    plantilla_nombre: string;
    usos: number;
    tasa_lectura: number;
  }>;
  
  // Usuarios más activos
  usuarios_mas_notificados: Array<{
    usuario_id: number;
    usuario_nombre: string;
    total_notificaciones: number;
    notificaciones_leidas: number;
    tasa_lectura: number;
  }>;
  
  // Problemas y errores
  total_errores: number;
  errores_por_canal: Array<{
    canal: CanalNotificacion;
    errores: number;
    tipos_error: string[];
  }>;
  
  // Configuración del análisis
  incluye_eliminadas: boolean;
  incluye_archivadas: boolean;
  fecha_generacion: string;
}

// =======================================================
// INTERFACES DE ALERTAS DEL SISTEMA
// =======================================================

export interface AlertaSistema {
  id: number;
  
  // Información básica
  tipo: string;
  titulo: string;
  descripcion: string;
  mensaje_detallado?: string;
  
  // Clasificación
  nivel: NivelAlerta;
  categoria: string;
  codigo_error?: string;
  
  // Contexto
  modulo: string;
  componente?: string;
  funcion_origen?: string;
  usuario_afectado_id?: number;
  
  // Estado
  estado: 'activa' | 'en_proceso' | 'resuelta' | 'ignorada' | 'escalada';
  es_critica: boolean;
  requiere_atencion_inmediata: boolean;
  
  // Fechas
  fecha_deteccion: string;
  fecha_primera_ocurrencia?: string;
  fecha_ultima_ocurrencia?: string;
  fecha_resolucion?: string;
  fecha_escalacion?: string;
  
  // Contadores
  numero_ocurrencias: number;
  numero_usuarios_afectados: number;
  
  // Resolución
  resuelto_por_id?: number;
  resuelto_por_nombre?: string;
  comentario_resolucion?: string;
  accion_tomada?: string;
  tiempo_resolucion_minutos?: number;
  
  // Datos técnicos
  datos_adicionales?: Record<string, any>;
  stack_trace?: string;
  logs_relacionados?: string[];
  metricas_sistema?: {
    cpu_uso?: number;
    memoria_uso?: number;
    disco_uso?: number;
    conexiones_bd?: number;
  };
  
  // Configuración de escalación
  escalado_automaticamente: boolean;
  usuarios_notificados: number[];
  canales_notificacion: CanalNotificacion[];
  
  // Relaciones
  alerta_padre_id?: number;
  alertas_relacionadas?: number[];
  tickets_relacionados?: string[];
  
  // SLA y métricas
  tiempo_maximo_resolucion_minutos?: number;
  sla_cumplido?: boolean;
  prioridad_sla: 'baja' | 'media' | 'alta' | 'critica';
}

// =======================================================
// INTERFACES DE NOTIFICACIONES MASIVAS
// =======================================================

export interface NotificacionMasiva {
  id: number;
  
  // Información básica
  nombre: string;
  descripcion?: string;
  tipo: TipoNotificacion;
  
  // Contenido
  titulo: string;
  mensaje: string;
  plantilla_id?: number;
  
  // Configuración
  prioridad: PrioridadNotificacion;
  canal: CanalNotificacion;
  canales_alternativos?: CanalNotificacion[];
  
  // Criterios de destinatarios
  criterios_destinatarios: {
    todos_usuarios?: boolean;
    roles?: string[];
    departamentos?: string[];
    sucursales?: string[];
    usuarios_especificos?: number[];
    filtros_personalizados?: {
      activos_desde?: string;
      ultimo_login_desde?: string;
      permisos_requeridos?: string[];
    };
  };
  
  // Programación
  es_programada: boolean;
  fecha_programada?: string;
  zona_horaria?: string;
  
  // Estado y progreso
  estado: 'borrador' | 'programada' | 'en_proceso' | 'completada' | 'cancelada' | 'fallida';
  fecha_inicio?: string;
  fecha_fin?: string;
  
  // Estadísticas de envío
  destinatarios_total: number;
  destinatarios_procesados: number;
  destinatarios_enviado: number;
  destinatarios_entregado: number;
  destinatarios_fallidos: number;
  destinatarios_leidos: number;
  
  // Detalles de progreso
  porcentaje_completado: number;
  velocidad_envio_por_minuto?: number;
  tiempo_estimado_restante_minutos?: number;
  
  // Control de errores
  errores: string[];
  destinatarios_con_error: Array<{
    usuario_id: number;
    usuario_email?: string;
    error: string;
    fecha_error: string;
  }>;
  
  // Configuración de reintento
  reintentos_automaticos: boolean;
  max_reintentos: number;
  intervalo_reintento_minutos: number;
  
  // Auditoría
  usuario_creacion_id: number;
  usuario_creacion_nombre: string;
  fecha_creacion: string;
  usuario_aprobacion_id?: number;
  usuario_aprobacion_nombre?: string;
  fecha_aprobacion?: string;
  
  // Configuración adicional
  requiere_confirmacion_lectura: boolean;
  permite_respuesta: boolean;
  auto_archivar_despues_dias?: number;
  
  // Segmentación A/B (opcional)
  es_test_ab?: boolean;
  configuracion_ab?: {
    version_a: {
      titulo: string;
      mensaje: string;
      porcentaje: number;
    };
    version_b: {
      titulo: string;
      mensaje: string;
      porcentaje: number;
    };
  };
}

// =======================================================
// INTERFACES DE RESPUESTA Y ACCIONES
// =======================================================

export interface RespuestaNotificacion {
  id: number;
  notificacion_id: number;
  usuario_id: number;
  usuario_nombre: string;
  
  // Contenido de respuesta
  mensaje: string;
  tipo_respuesta: 'confirmacion' | 'comentario' | 'accion' | 'feedback';
  accion_tomada?: string;
  
  // Metadatos
  fecha_respuesta: string;
  canal_respuesta: CanalNotificacion;
  dispositivo_origen?: string;
  ip_origen?: string;
  
  // Estado
  procesada: boolean;
  fecha_procesamiento?: string;
  resultado_procesamiento?: string;
}

export interface AccionNotificacion {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: 'enlace' | 'boton' | 'formulario' | 'descarga' | 'api_call';
  
  // Configuración de acción
  url?: string;
  metodo_http?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parametros?: Record<string, any>;
  
  // Presentación
  icono?: string;
  color?: string;
  estilo?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  
  // Comportamiento
  requiere_confirmacion: boolean;
  cierra_notificacion: boolean;
  marca_como_leida: boolean;
  
  // Permisos
  roles_permitidos?: string[];
  permisos_requeridos?: string[];
}

// =======================================================
// INTERFACES DE CONFIGURACIÓN DEL SISTEMA
// =======================================================

export interface ConfiguracionSistemaNotificaciones {
  // Configuración general
  sistema_habilitado: boolean;
  modo_mantenimiento: boolean;
  nivel_log: 'debug' | 'info' | 'warning' | 'error';
  
  // Límites del sistema
  max_notificaciones_por_usuario_dia: number;
  max_notificaciones_masivas_simultaneas: number;
  max_destinatarios_notificacion_masiva: number;
  tiempo_retencion_notificaciones_dias: number;
  
  // Configuración de canales
  canales_habilitados: CanalNotificacion[];
  canal_predeterminado: CanalNotificacion;
  
  // Email
  smtp_configurado: boolean;
  smtp_servidor?: string;
  smtp_puerto?: number;
  email_remitente_default: string;
  plantilla_email_default: string;
  
  // SMS
  sms_proveedor?: string;
  sms_configurado: boolean;
  sms_creditos_disponibles?: number;
  
  // Push notifications
  push_configurado: boolean;
  push_certificados_validos: boolean;
  push_fecha_expiracion?: string;
  
  // Webhooks
  webhooks_habilitados: boolean;
  webhook_timeout_segundos: number;
  webhook_reintentos_max: number;
  
  // Rendimiento
  cola_procesamiento_habilitada: boolean;
  workers_activos: number;
  notificaciones_en_cola: number;
  tiempo_promedio_procesamiento_ms: number;
  
  // Seguridad
  rate_limiting_habilitado: boolean;
  max_requests_por_minuto: number;
  ips_bloqueadas: string[];
  
  // Monitoreo
  alertas_sistema_habilitadas: boolean;
  umbral_error_rate_porcentaje: number;
  umbral_latencia_ms: number;
  
  // Fechas de configuración
  fecha_ultima_actualizacion: string;
  usuario_ultima_actualizacion_id: number;
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default {
  // Tipos básicos
  TipoNotificacion,
  PrioridadNotificacion,
  EstadoNotificacion,
  CanalNotificacion,
  NivelAlerta,
  
  // Interfaces principales
  Notificacion,
  FiltrosNotificaciones,
  PlantillaNotificacion,
  ConfiguracionNotificaciones,
  EstadisticasNotificaciones,
  AlertaSistema,
  NotificacionMasiva,
  
  // Interfaces auxiliares
  RespuestaNotificacion,
  AccionNotificacion,
  ConfiguracionSistemaNotificaciones
};