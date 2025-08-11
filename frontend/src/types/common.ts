/**
 * Types Common - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Tipos comunes y compartidos en todo el sistema
 */

import { ReactNode } from 'react';

// =======================================================
// TIPOS BÁSICOS COMUNES
// =======================================================

export type ID = string | number;
export type Timestamp = string;
export type EstadoGenerico = 'activo' | 'inactivo';
export type TipoRespuesta = 'exito' | 'error' | 'advertencia' | 'info';
export type Moneda = 'PEN' | 'USD' | 'EUR';
export type TamañoPagina = 10 | 20 | 50 | 100;

// =======================================================
// INTERFACES DE PAGINACIÓN
// =======================================================

export interface MetadatasPaginacion {
  pagina_actual: number;
  total_paginas: number;
  total_elementos: number;
  elementos_por_pagina: number;
  tiene_pagina_anterior: boolean;
  tiene_pagina_siguiente: boolean;
}

export interface ParametrosPaginacion {
  pagina?: number;
  tamaño_pagina?: TamañoPagina;
  ordenar_por?: string;
  direccion_orden?: 'asc' | 'desc';
}

export interface RespuestaPaginada<T> {
  datos: T[];
  metadatos: MetadatasPaginacion;
}

// =======================================================
// INTERFACES DE RESPUESTA ESTÁNDAR
// =======================================================

export interface RespuestaAPI<T = any> {
  exito: boolean;
  mensaje?: string;
  datos?: T;
  errores?: ErrorValidacion[];
  codigo_estado?: number;
  timestamp?: Timestamp;
  trace_id?: string;
}

export interface RespuestaListaAPI<T> extends RespuestaAPI<T[]> {
  metadatos?: MetadatasPaginacion;
  resumen?: ResumenLista;
}

export interface ResumenLista {
  total_elementos: number;
  elementos_activos: number;
  elementos_inactivos: number;
  ultimo_actualizado?: Timestamp;
}

// =======================================================
// INTERFACES DE ERROR Y VALIDACIÓN
// =======================================================

export interface ErrorValidacion {
  campo: string;
  mensaje: string;
  codigo: string;
  valor_rechazado?: any;
}

export interface ErrorSistema {
  codigo: string;
  mensaje: string;
  detalles?: string;
  timestamp: Timestamp;
  modulo?: string;
  usuario_id?: number;
  trace_id?: string;
  stack_trace?: string;
}

export interface EstadoError {
  hay_error: boolean;
  mensaje: string;
  tipo: 'validacion' | 'sistema' | 'red' | 'permisos' | 'no_encontrado';
  detalles?: any;
  codigo?: string;
  solucionable: boolean;
  acciones_sugeridas?: string[];
}

// =======================================================
// INTERFACES DE CARGA Y ESTADO
// =======================================================

export interface EstadoCarga {
  cargando: boolean;
  mensaje_carga?: string;
  progreso?: number;
  etapa_actual?: string;
  cancelable?: boolean;
}

export interface EstadoOperacion {
  en_progreso: boolean;
  completada: boolean;
  exitosa?: boolean;
  mensaje?: string;
  resultado?: any;
  error?: EstadoError;
  fecha_inicio?: Timestamp;
  fecha_fin?: Timestamp;
  duracion_ms?: number;
}

// =======================================================
// INTERFACES DE BÚSQUEDA Y FILTROS
// =======================================================

export interface FiltroBase {
  campo: string;
  operador: 'igual' | 'diferente' | 'contiene' | 'inicia_con' | 'termina_con' | 'mayor' | 'menor' | 'entre' | 'en' | 'no_en';
  valor: any;
  valor_adicional?: any; // Para operador 'entre'
}

export interface ParametrosBusquedaBase {
  termino_busqueda?: string;
  filtros?: FiltroBase[];
  paginacion?: ParametrosPaginacion;
  incluir_inactivos?: boolean;
}

export interface ResultadoBusqueda<T> {
  elementos: T[];
  total_encontrados: number;
  termino_usado: string;
  filtros_aplicados: FiltroBase[];
  tiempo_busqueda_ms: number;
  sugerencias?: string[];
}

// =======================================================
// INTERFACES DE CONFIGURACIÓN
// =======================================================

export interface ConfiguracionSistema {
  nombre_aplicacion: string;
  version: string;
  entorno: 'desarrollo' | 'pruebas' | 'produccion';
  zona_horaria: string;
  idioma_default: string;
  moneda_default: Moneda;
  formato_fecha: string;
  formato_hora: string;
  decimales_moneda: number;
  separador_miles: string;
  separador_decimal: string;
}

export interface ConfiguracionUsuario {
  tema: 'claro' | 'oscuro' | 'auto';
  idioma: string;
  zona_horaria: string;
  formato_fecha: string;
  formato_hora: string;
  notificaciones_habilitadas: boolean;
  sonidos_habilitados: boolean;
  animaciones_habilitadas: boolean;
}

// =======================================================
// INTERFACES DE AUDITORÍA
// =======================================================

export interface RegistroAuditoria {
  id: ID;
  usuario_id: number;
  usuario_nombre: string;
  accion: string;
  modulo: string;
  recurso_tipo: string;
  recurso_id?: ID;
  descripcion: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
  ip_address: string;
  user_agent: string;
  fecha_accion: Timestamp;
  exitosa: boolean;
  tiempo_procesamiento_ms?: number;
}

export interface ConfiguracionAuditoria {
  habilitada: boolean;
  acciones_auditadas: string[];
  retener_dias: number;
  incluir_datos_sensibles: boolean;
  comprimir_automaticamente: boolean;
}

// =======================================================
// INTERFACES DE NOTIFICACIONES
// =======================================================

export interface NotificacionSistema {
  id: ID;
  tipo: 'info' | 'exito' | 'advertencia' | 'error';
  titulo: string;
  mensaje: string;
  icono?: string;
  color?: string;
  duracion_ms?: number;
  persistente?: boolean;
  acciones?: AccionNotificacion[];
  datos_adicionales?: any;
  fecha_creacion: Timestamp;
  fecha_expiracion?: Timestamp;
}

export interface AccionNotificacion {
  id: string;
  texto: string;
  tipo: 'primaria' | 'secundaria' | 'peligro';
  accion: () => void | Promise<void>;
  icono?: string;
}

export interface ConfiguracionNotificaciones {
  posicion: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  duracion_default_ms: number;
  max_notificaciones_visibles: number;
  agrupar_similares: boolean;
  sonido_habilitado: boolean;
  animaciones_habilitadas: boolean;
}

// =======================================================
// INTERFACES DE ARCHIVOS Y DOCUMENTOS
// =======================================================

export interface Archivo {
  id: ID;
  nombre: string;
  nombre_original: string;
  extension: string;
  tamaño_bytes: number;
  tamaño_legible: string;
  tipo_mime: string;
  ruta: string;
  url?: string;
  url_thumbnail?: string;
  
  // Metadatos
  subido_por: number;
  fecha_subida: Timestamp;
  descripcion?: string;
  tags?: string[];
  es_publico: boolean;
  
  // Validación
  checksum: string;
  validado: boolean;
  escaneado_virus: boolean;
  
  // Relación
  modulo_origen: string;
  recurso_id?: ID;
  categoria?: string;
}

export interface ConfiguracionArchivos {
  tamaño_maximo_mb: number;
  tipos_permitidos: string[];
  tipos_imagen: string[];
  tipos_documento: string[];
  tipos_comprimido: string[];
  escanear_virus: boolean;
  generar_thumbnails: boolean;
  comprimir_imagenes: boolean;
  ruta_almacenamiento: string;
}

// =======================================================
// INTERFACES DE MÉTRICAS Y ESTADÍSTICAS
// =======================================================

export interface Metrica {
  clave: string;
  nombre: string;
  valor: number;
  valor_anterior?: number;
  unidad?: string;
  formato: 'numero' | 'porcentaje' | 'moneda' | 'tiempo';
  tendencia?: 'subida' | 'bajada' | 'estable';
  porcentaje_cambio?: number;
  color?: string;
  icono?: string;
}

export interface GrupoMetricas {
  titulo: string;
  descripcion?: string;
  periodo: string;
  metricas: Metrica[];
  fecha_actualizacion: Timestamp;
}

export interface ConfiguracionMetricas {
  actualizar_automaticamente: boolean;
  intervalo_actualizacion_minutos: number;
  retener_historico_dias: number;
  metricas_publicas: string[];
  alertas_habilitadas: boolean;
  umbrales_alerta: Record<string, { min?: number; max?: number }>;
}

// =======================================================
// INTERFACES DE DIRECCIONES (PERÚ)
// =======================================================

export interface Direccion {
  calle: string;
  numero?: string;
  piso?: string;
  departamento?: string;
  referencia?: string;
  ubigeo: string;
  departamento_nombre: string;
  provincia_nombre: string;
  distrito_nombre: string;
  codigo_postal?: string;
  coordenadas?: Coordenadas;
}

export interface Coordenadas {
  latitud: number;
  longitud: number;
  precision?: number;
}

export interface Ubigeo {
  codigo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  nivel: 1 | 2 | 3; // 1=departamento, 2=provincia, 3=distrito
  padre?: string;
  activo: boolean;
}

// =======================================================
// INTERFACES DE PREFERENCIAS
// =======================================================

export interface PreferenciaUsuario {
  clave: string;
  valor: any;
  tipo: 'string' | 'number' | 'boolean' | 'object' | 'array';
  categoria: string;
  descripcion?: string;
  modificable: boolean;
  fecha_actualizacion: Timestamp;
}

export interface ConfiguracionModulo {
  modulo: string;
  habilitado: boolean;
  configuraciones: Record<string, any>;
  permisos_requeridos: string[];
  dependencias: string[];
  version: string;
}

// =======================================================
// INTERFACES DE TAREAS Y PROCESOS
// =======================================================

export interface TareaBackground {
  id: ID;
  nombre: string;
  descripcion: string;
  estado: 'pendiente' | 'ejecutando' | 'completada' | 'fallida' | 'cancelada';
  progreso_porcentaje: number;
  mensaje_actual?: string;
  
  // Tiempos
  fecha_creacion: Timestamp;
  fecha_inicio?: Timestamp;
  fecha_fin?: Timestamp;
  tiempo_estimado_ms?: number;
  
  // Datos
  parametros: any;
  resultado?: any;
  error?: string;
  
  // Control
  usuario_id: number;
  cancelable: boolean;
  reintentable: boolean;
  intentos: number;
  max_intentos: number;
}

export interface ColaProcesos {
  total_pendientes: number;
  total_ejecutando: number;
  total_completadas_hoy: number;
  total_fallidas_hoy: number;
  tiempo_promedio_ejecucion_ms: number;
  worker_activos: number;
  worker_disponibles: number;
}

// =======================================================
// INTERFACES DE COMPONENTES UI
// =======================================================

export interface PropiedadesBase {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface EstadoComponente {
  montado: boolean;
  visible: boolean;
  habilitado: boolean;
  cargando: boolean;
  error?: string;
}

export interface ConfiguracionTabla {
  paginacion_habilitada: boolean;
  ordenamiento_habilitado: boolean;
  filtros_habilitados: boolean;
  seleccion_multiple: boolean;
  acciones_fila: boolean;
  exportacion_habilitada: boolean;
  filas_por_pagina: TamañoPagina;
  alto_fijo: boolean;
  responsive: boolean;
}

// =======================================================
// INTERFACES DE LOCALIZACIÓN
// =======================================================

export interface DatosLocalizacion {
  idioma: string;
  region: string;
  zona_horaria: string;
  formato_fecha: string;
  formato_hora: string;
  primer_dia_semana: 0 | 1; // 0=domingo, 1=lunes
  moneda: Moneda;
  simbolo_moneda: string;
  separador_miles: string;
  separador_decimal: string;
}

export interface RecursoIdioma {
  codigo: string;
  nombre: string;
  nombre_nativo: string;
  rtl: boolean;
  disponible: boolean;
  porcentaje_traducido: number;
  traducciones: Record<string, string>;
}

// =======================================================
// INTERFACES DE IMPORTACIÓN/EXPORTACIÓN
// =======================================================

export interface ProcesoImportacion {
  id: ID;
  archivo_id: ID;
  tipo_datos: string;
  estado: 'analizando' | 'validando' | 'importando' | 'completado' | 'fallido';
  
  // Estadísticas
  total_filas: number;
  filas_procesadas: number;
  filas_exitosas: number;
  filas_con_errores: number;
  
  // Configuración
  sobrescribir_existentes: boolean;
  validar_antes_importar: boolean;
  enviar_notificacion: boolean;
  
  // Resultados
  errores: ErrorImportacion[];
  advertencias: string[];
  datos_importados?: any[];
  
  // Control
  usuario_id: number;
  fecha_inicio: Timestamp;
  fecha_fin?: Timestamp;
}

export interface ErrorImportacion {
  fila: number;
  columna?: string;
  mensaje: string;
  valor_problematico?: any;
  tipo_error: 'validacion' | 'formato' | 'duplicado' | 'referencia';
}

export interface OpcionesExportacion {
  formato: 'excel' | 'csv' | 'pdf' | 'json' | 'xml';
  incluir_cabeceras: boolean;
  incluir_metadatos: boolean;
  filtros_aplicados?: any;
  campos_seleccionados?: string[];
  ordenamiento?: { campo: string; direccion: 'asc' | 'desc' };
  configuracion_formato?: any;
}

// =======================================================
// TYPES AUXILIARES COMUNES
// =======================================================

export type Callback<T = void> = (data?: T) => void;
export type AsyncCallback<T = void> = (data?: T) => Promise<void>;
export type Validator<T> = (value: T) => boolean | string;
export type Formatter<T, R = string> = (value: T) => R;
export type Comparator<T> = (a: T, b: T) => number;

// Utilidades de tipo
export type Opcional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Requerido<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type SoloLectura<T> = { readonly [P in keyof T]: T[P] };
export type Parcial<T> = { [P in keyof T]?: T[P] };

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default {
  RespuestaAPI,
  RespuestaListaAPI,
  MetadatasPaginacion,
  ParametrosPaginacion,
  EstadoError,
  EstadoCarga,
  EstadoOperacion,
  NotificacionSistema,
  ConfiguracionSistema,
  RegistroAuditoria,
  Archivo,
  Metrica,
  Direccion,
  TareaBackground,
  ProcesoImportacion
};