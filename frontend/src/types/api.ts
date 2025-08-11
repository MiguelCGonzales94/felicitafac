/**
 * Types API - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Tipos específicos para comunicación con APIs
 */

// =======================================================
// TIPOS BÁSICOS DE API
// =======================================================

export type MetodoHTTP = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type TipoContenido = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
export type EstadoHTTP = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 422 | 500 | 502 | 503;

// =======================================================
// INTERFACES DE CONFIGURACIÓN API
// =======================================================

export interface ConfiguracionAPI {
  base_url: string;
  timeout_ms: number;
  reintentos_maximos: number;
  intervalo_reintentos_ms: number;
  headers_default: Record<string, string>;
  interceptores_request: boolean;
  interceptores_response: boolean;
  cache_habilitado: boolean;
  debug_mode: boolean;
}

export interface OpcionesRequest {
  metodo: MetodoHTTP;
  url: string;
  headers?: Record<string, string>;
  parametros?: Record<string, any>;
  datos?: any;
  timeout?: number;
  reintentos?: number;
  cache?: boolean;
  validar_ssl?: boolean;
  seguir_redirects?: boolean;
}

// =======================================================
// INTERFACES DE RESPUESTA API
// =======================================================

export interface RespuestaAPIBase {
  exito: boolean;
  codigo_estado: EstadoHTTP;
  mensaje?: string;
  timestamp: string;
  duracion_ms: number;
  trace_id?: string;
}

export interface RespuestaAPIDatos<T = any> extends RespuestaAPIBase {
  datos: T;
  metadatos?: MetadatosRespuesta;
}

export interface RespuestaAPILista<T = any> extends RespuestaAPIBase {
  datos: T[];
  metadatos: MetadatosLista;
}

export interface RespuestaAPIError extends RespuestaAPIBase {
  error: DetalleError;
  errores_validacion?: ErrorValidacionAPI[];
  sugerencias?: string[];
}

export interface MetadatosRespuesta {
  version_api: string;
  servidor: string;
  cache_usado: boolean;
  cache_expira?: string;
  rate_limit?: InfoRateLimit;
}

export interface MetadatosLista {
  total: number;
  pagina: number;
  tamaño_pagina: number;
  total_paginas: number;
  tiene_anterior: boolean;
  tiene_siguiente: boolean;
  ordenado_por?: string;
  direccion_orden?: 'asc' | 'desc';
  filtros_aplicados?: Record<string, any>;
}

// =======================================================
// INTERFACES DE ERROR API
// =======================================================

export interface DetalleError {
  codigo: string;
  tipo: 'validacion' | 'autenticacion' | 'autorizacion' | 'negocio' | 'sistema' | 'red';
  mensaje: string;
  descripcion_tecnica?: string;
  modulo_origen: string;
  timestamp: string;
  referencia_interna?: string;
}

export interface ErrorValidacionAPI {
  campo: string;
  valor_rechazado: any;
  regla_violada: string;
  mensaje: string;
  codigo_error: string;
}

export interface ErrorRed {
  tipo: 'timeout' | 'conexion' | 'ssl' | 'dns' | 'proxy';
  mensaje: string;
  url_destino: string;
  tiempo_transcurrido_ms: number;
  reintentos_realizados: number;
}

// =======================================================
// INTERFACES DE AUTENTICACIÓN API
// =======================================================

export interface TokenAPI {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  refresh_token?: string;
  scope: string[];
  issued_at: string;
}

export interface CredencialesAPI {
  tipo: 'bearer' | 'basic' | 'api_key' | 'oauth2';
  token?: string;
  usuario?: string;
  password?: string;
  api_key?: string;
  client_id?: string;
  client_secret?: string;
  scope?: string[];
}

export interface EstadoAutenticacionAPI {
  autenticado: boolean;
  token_valido: boolean;
  token_expira_en_ms: number;
  requiere_renovacion: boolean;
  ultimo_refresh: string;
  usuario_api?: string;
}

// =======================================================
// INTERFACES DE RATE LIMITING
// =======================================================

export interface InfoRateLimit {
  limite_por_minuto: number;
  requests_realizados: number;
  requests_restantes: number;
  ventana_reset_en_segundos: number;
  reset_timestamp: string;
}

export interface ConfiguracionRateLimit {
  habilitado: boolean;
  requests_por_minuto: number;
  ventana_tiempo_ms: number;
  strategy: 'fixed_window' | 'sliding_window' | 'token_bucket';
  burst_permitido: number;
  queue_overflow: boolean;
}

// =======================================================
// INTERFACES DE CACHE API
// =======================================================

export interface ConfiguracionCache {
  habilitado: boolean;
  ttl_default_segundos: number;
  tamaño_maximo_mb: number;
  estrategia: 'lru' | 'fifo' | 'ttl';
  invalidar_automatico: boolean;
  comprimir_datos: boolean;
  persistir_disco: boolean;
}

export interface EntradaCache {
  clave: string;
  datos: any;
  timestamp_creacion: string;
  timestamp_expiracion: string;
  tamaño_bytes: number;
  hits: number;
  ultima_consulta: string;
}

export interface EstadisticasCache {
  total_entradas: number;
  tamaño_usado_mb: number;
  porcentaje_uso: number;
  hit_rate: number;
  miss_rate: number;
  entradas_expiradas: number;
  tiempo_promedio_acceso_ms: number;
}

// =======================================================
// INTERFACES DE ENDPOINTS
// =======================================================

export interface DefinicionEndpoint {
  id: string;
  ruta: string;
  metodo: MetodoHTTP;
  descripcion: string;
  version: string;
  publico: boolean;
  requiere_autenticacion: boolean;
  permisos_requeridos: string[];
  rate_limit?: ConfiguracionRateLimit;
  cache_ttl?: number;
  timeout_ms?: number;
}

export interface GrupoEndpoints {
  nombre: string;
  prefijo_ruta: string;
  descripcion: string;
  version: string;
  endpoints: DefinicionEndpoint[];
  middleware: string[];
  documentacion_url?: string;
}

export interface CatalogoAPI {
  nombre: string;
  version: string;
  descripcion: string;
  base_url: string;
  grupos: GrupoEndpoints[];
  autenticacion: TipoAutenticacionAPI[];
  formatos_respuesta: string[];
  documentacion_url: string;
  estado: 'desarrollo' | 'beta' | 'estable' | 'deprecado';
}

export type TipoAutenticacionAPI = 'none' | 'bearer' | 'basic' | 'api_key' | 'oauth2';

// =======================================================
// INTERFACES DE MONITOREO API
// =======================================================

export interface MetricasAPI {
  endpoint: string;
  metodo: MetodoHTTP;
  total_requests: number;
  requests_exitosos: number;
  requests_fallidos: number;
  tiempo_promedio_ms: number;
  tiempo_maximo_ms: number;
  tiempo_minimo_ms: number;
  ultima_request: string;
  errores_comunes: ErrorComun[];
}

export interface ErrorComun {
  codigo_estado: EstadoHTTP;
  mensaje: string;
  frecuencia: number;
  primera_ocurrencia: string;
  ultima_ocurrencia: string;
}

export interface EstadoSaludAPI {
  estado: 'saludable' | 'degradado' | 'no_disponible';
  tiempo_respuesta_ms: number;
  servicios_dependientes: EstadoServicioDependiente[];
  ultima_verificacion: string;
  disponibilidad_porcentaje: number;
  mensajes_estado: string[];
}

export interface EstadoServicioDependiente {
  nombre: string;
  url: string;
  estado: 'disponible' | 'no_disponible' | 'desconocido';
  tiempo_respuesta_ms?: number;
  version?: string;
  ultimo_check: string;
}

// =======================================================
// INTERFACES DE WEBHOOKS
// =======================================================

export interface ConfiguracionWebhook {
  id: string;
  url_destino: string;
  eventos_suscritos: string[];
  activo: boolean;
  secreto: string;
  headers_adicionales?: Record<string, string>;
  timeout_ms: number;
  reintentos_maximos: number;
  filtros?: Record<string, any>;
}

export interface EventoWebhook {
  id: string;
  tipo_evento: string;
  timestamp: string;
  datos: any;
  metadatos: {
    version: string;
    origen: string;
    trace_id: string;
  };
}

export interface LogWebhook {
  id: string;
  webhook_id: string;
  evento_id: string;
  intento: number;
  estado: 'exitoso' | 'fallido' | 'pendiente';
  codigo_respuesta?: EstadoHTTP;
  tiempo_respuesta_ms?: number;
  mensaje_error?: string;
  timestamp_envio: string;
  timestamp_respuesta?: string;
}

// =======================================================
// INTERFACES PARA INTEGRACIONES EXTERNAS
// =======================================================

export interface ConfiguracionSUNAT {
  entorno: 'produccion' | 'homologacion';
  ruc_emisor: string;
  usuario_sol: string;
  clave_sol: string;
  url_servicio: string;
  certificado_digital?: string;
  timeout_segundos: number;
  reintentos_maximos: number;
}

export interface RespuestaSUNAT {
  exito: boolean;
  codigo_respuesta?: string;
  descripcion_respuesta?: string;
  numero_ticket?: string;
  fecha_proceso?: string;
  hora_proceso?: string;
  hash_cpe?: string;
  codigo_barras?: string;
  observaciones?: string[];
  errores?: string[];
  enlace_pdf?: string;
  enlace_xml?: string;
  enlace_cdr?: string;
}

export interface ConfiguracionNubefact {
  entorno: 'produccion' | 'desarrollo';
  usuario: string;
  password: string;
  url_api: string;
  formato_respuesta: 'json' | 'xml';
  timeout_segundos: number;
  debug_habilitado: boolean;
}

export interface RespuestaNubefact {
  errors: any;
  sunat_description: string;
  sunat_responsecode: string;
  sunat_responsedate: string;
  sunat_soap_error: string;
  pdf_zip_base64?: string;
  xml_zip_base64?: string;
  cdr_zip_base64?: string;
  enlace_del_pdf?: string;
  enlace_del_xml?: string;
  enlace_del_cdr?: string;
  cadena_para_codigo_qr?: string;
  codigo_hash?: string;
}

// =======================================================
// INTERFACES DE BATCH PROCESSING
// =======================================================

export interface LoteRequestAPI {
  id: string;
  requests: RequestLote[];
  procesamiento_paralelo: boolean;
  parar_en_error: boolean;
  timeout_total_ms?: number;
  callback_url?: string;
}

export interface RequestLote {
  id: string;
  endpoint: string;
  metodo: MetodoHTTP;
  datos?: any;
  headers?: Record<string, string>;
  dependencias?: string[]; // IDs de otros requests que deben completarse primero
}

export interface RespuestaLoteAPI {
  id_lote: string;
  estado: 'procesando' | 'completado' | 'parcialmente_fallido' | 'fallido';
  total_requests: number;
  requests_exitosos: number;
  requests_fallidos: number;
  tiempo_procesamiento_ms: number;
  resultados: ResultadoRequestLote[];
}

export interface ResultadoRequestLote {
  id_request: string;
  exito: boolean;
  codigo_estado?: EstadoHTTP;
  datos?: any;
  error?: string;
  tiempo_procesamiento_ms: number;
  orden_ejecucion: number;
}

// =======================================================
// INTERFACES DE VERSIONADO API
// =======================================================

export interface VersionAPI {
  numero: string;
  nombre?: string;
  fecha_lanzamiento: string;
  estado: 'desarrollo' | 'beta' | 'estable' | 'deprecado' | 'retirado';
  compatibilidad_anterior: boolean;
  cambios_principales: CambioAPI[];
  migracion_requerida: boolean;
  fecha_deprecacion?: string;
  fecha_retiro?: string;
}

export interface CambioAPI {
  tipo: 'agregado' | 'modificado' | 'deprecado' | 'eliminado' | 'correccion';
  endpoint?: string;
  descripcion: string;
  impacto: 'bajo' | 'medio' | 'alto';
  accion_requerida?: string;
}

// =======================================================
// TYPES AUXILIARES
// =======================================================

export type CallbackAPI<T = any> = (response: RespuestaAPIDatos<T> | RespuestaAPIError) => void;
export type InterceptorRequest = (config: OpcionesRequest) => OpcionesRequest | Promise<OpcionesRequest>;
export type InterceptorResponse = (response: any) => any | Promise<any>;

// =======================================================
// INTERFACES DE HOOKS PARA REACT
// =======================================================

export interface EstadoHookAPI<T = any> {
  datos: T | null;
  cargando: boolean;
  error: string | null;
  ejecutar: (parametros?: any) => Promise<void>;
  recargar: () => Promise<void>;
  limpiar: () => void;
}

export interface OpcionesHookAPI {
  ejecutar_automatico?: boolean;
  dependencias?: any[];
  cache_tiempo_ms?: number;
  revalidar_en_foco?: boolean;
  revalidar_en_reconexion?: boolean;
  intervalo_revalidacion_ms?: number;
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default {
  ConfiguracionAPI,
  OpcionesRequest,
  RespuestaAPIDatos,
  RespuestaAPILista,
  RespuestaAPIError,
  TokenAPI,
  CredencialesAPI,
  MetricasAPI,
  EstadoSaludAPI,
  ConfiguracionWebhook,
  EventoWebhook,
  ConfiguracionSUNAT,
  RespuestaSUNAT,
  ConfiguracionNubefact,
  RespuestaNubefact,
  LoteRequestAPI,
  RespuestaLoteAPI,
  VersionAPI,
  EstadoHookAPI
};