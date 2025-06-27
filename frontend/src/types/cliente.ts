/**
 * Types de Clientes - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Tipos TypeScript para gestión de clientes con validaciones SUNAT
 */

// =======================================================
// TIPOS BÁSICOS
// =======================================================

export type TipoDocumentoIdentidad = '1' | '6'; // DNI o RUC
export type EstadoCliente = 'activo' | 'inactivo';
export type TipoPersona = 'natural' | 'juridica';
export type TipoContribuyente = 'especial' | 'principal' | 'buen_contribuyente' | 'agente_retencion';

// =======================================================
// INTERFACES PRINCIPALES
// =======================================================

/**
 * Cliente principal
 */
export interface Cliente {
  id: number;
  
  // Identificación
  tipo_documento: TipoDocumentoIdentidad;
  numero_documento: string;
  nombre_o_razon_social: string;
  nombres?: string; // Solo para personas naturales
  apellido_paterno?: string; // Solo para personas naturales
  apellido_materno?: string; // Solo para personas naturales
  
  // Ubicación
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  ubigeo?: string;
  
  // Contacto
  telefono?: string;
  celular?: string;
  email?: string;
  pagina_web?: string;
  
  // Datos comerciales
  tipo_persona: TipoPersona;
  tipo_contribuyente?: TipoContribuyente;
  estado_contribuyente?: string; // Activo, Suspendido, etc.
  condicion_domicilio?: string; // Habido, No habido, etc.
  
  // Estado
  estado: EstadoCliente;
  fecha_registro: string;
  
  // Información adicional
  observaciones?: string;
  limite_credito?: number;
  dias_credito?: number;
  descuento_por_defecto?: number;
  
  // Validaciones SUNAT
  validado_sunat: boolean;
  fecha_ultima_validacion?: string;
  datos_sunat?: DatosSunat;
  
  // Metadatos
  created_at: string;
  updated_at: string;
  usuario_creador?: number;
}

/**
 * Datos obtenidos de SUNAT
 */
export interface DatosSunat {
  razon_social: string;
  estado_contribuyente: string;
  condicion_domicilio: string;
  ubigeo: string;
  tipo_via?: string;
  nombre_via?: string;
  codigo_zona?: string;
  tipo_zona?: string;
  numero?: string;
  interior?: string;
  lote?: string;
  departamento_sunat?: string;
  manzana?: string;
  kilometro?: string;
  distrito: string;
  provincia: string;
  departamento: string;
  es_agente_retencion: boolean;
  es_buen_contribuyente: boolean;
  fecha_inscripcion?: string;
  fecha_inicio_actividades?: string;
  actividades_economicas?: ActividadEconomica[];
  comprobantes_emision?: ComprobanteEmision[];
  sistema_emision?: SistemaEmision[];
  afiliado_ple?: boolean;
  sistema_contabilidad?: string[];
}

/**
 * Actividad económica
 */
export interface ActividadEconomica {
  codigo: string;
  descripcion: string;
  principal: boolean;
  estado: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

/**
 * Comprobante de emisión
 */
export interface ComprobanteEmision {
  codigo: string;
  descripcion: string;
  desde?: number;
  hasta?: number;
  fecha_autorizacion?: string;
}

/**
 * Sistema de emisión
 */
export interface SistemaEmision {
  codigo: string;
  descripcion: string;
  desde?: number;
  hasta?: number;
  fecha_autorizacion?: string;
}

// =======================================================
// REQUESTS PARA APIs
// =======================================================

/**
 * Request para crear cliente
 */
export interface CrearClienteRequest {
  tipo_documento: TipoDocumentoIdentidad;
  numero_documento: string;
  nombre_o_razon_social: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  ubigeo?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  pagina_web?: string;
  tipo_persona: TipoPersona;
  observaciones?: string;
  limite_credito?: number;
  dias_credito?: number;
  descuento_por_defecto?: number;
  validar_con_sunat?: boolean;
}

/**
 * Request para actualizar cliente
 */
export interface ActualizarClienteRequest {
  nombre_o_razon_social?: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  ubigeo?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  pagina_web?: string;
  observaciones?: string;
  limite_credito?: number;
  dias_credito?: number;
  descuento_por_defecto?: number;
  estado?: EstadoCliente;
}

// =======================================================
// RESPONSES DE APIs
// =======================================================

/**
 * Response paginado de clientes
 */
export interface ClientesPaginados {
  count: number;
  next?: string;
  previous?: string;
  results: Cliente[];
}

/**
 * Response de búsqueda de cliente
 */
export interface BuscarClienteResponse {
  cliente_encontrado: boolean;
  cliente?: Cliente;
  sugerencias?: Cliente[];
}

/**
 * Response de validación de documento
 */
export interface ValidarDocumentoResponse {
  valido: boolean;
  tipo_documento: TipoDocumentoIdentidad;
  numero_documento: string;
  datos_sunat?: DatosSunat;
  errores?: string[];
  cliente_existente?: Cliente;
}

/**
 * Response de consulta SUNAT
 */
export interface ConsultaSunatResponse {
  exito: boolean;
  datos?: DatosSunat;
  mensaje: string;
  fecha_consulta: string;
}

// =======================================================
// TIPOS PARA SELECCIÓN Y BÚSQUEDA
// =======================================================

/**
 * Cliente resumido para selección en POS
 */
export interface ClienteResumen {
  id: number;
  tipo_documento: TipoDocumentoIdentidad;
  numero_documento: string;
  nombre_o_razon_social: string;
  direccion: string;
  email?: string;
  telefono?: string;
  limite_credito?: number;
  dias_credito?: number;
}

/**
 * Datos mínimos de cliente para facturación
 */
export interface ClienteFacturacion {
  id: number;
  tipo_documento: TipoDocumentoIdentidad;
  numero_documento: string;
  nombre_o_razon_social: string;
  direccion: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  email?: string;
}

// =======================================================
// FILTROS Y BÚSQUEDAS
// =======================================================

/**
 * Filtros para listar clientes
 */
export interface FiltrosClientes {
  busqueda?: string;
  tipo_documento?: TipoDocumentoIdentidad;
  tipo_persona?: TipoPersona;
  estado?: EstadoCliente;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  validado_sunat?: boolean;
  con_limite_credito?: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
  pagina?: number;
  limite?: number;
  ordenar_por?: 'nombre_o_razon_social' | 'numero_documento' | 'fecha_registro' | 'limite_credito';
  orden?: 'asc' | 'desc';
}

/**
 * Opciones de búsqueda para autocompletado
 */
export interface OpcionesBusquedaCliente {
  incluir_inactivos?: boolean;
  limite_resultados?: number;
  buscar_en_campos?: Array<'numero_documento' | 'nombre_o_razon_social' | 'telefono' | 'email'>;
}

// =======================================================
// VALIDACIONES
// =======================================================

/**
 * Reglas de validación para documentos
 */
export interface ReglasValidacionDocumento {
  tipo_documento: TipoDocumentoIdentidad;
  longitud_exacta: number;
  solo_numeros: boolean;
  algoritmo_validacion?: 'mod11' | 'ruc' | 'ninguno';
}

/**
 * Resultado de validación de campos
 */
export interface ResultadoValidacionCampo {
  campo: string;
  valido: boolean;
  errores: string[];
  warnings: string[];
}

/**
 * Validación completa de cliente
 */
export interface ValidacionCliente {
  valido: boolean;
  errores: ResultadoValidacionCampo[];
  warnings: ResultadoValidacionCampo[];
  puede_guardar: boolean;
  requiere_confirmacion: boolean;
}

// =======================================================
// ESTADÍSTICAS Y REPORTES
// =======================================================

/**
 * Estadísticas de cliente
 */
export interface EstadisticasCliente {
  cliente_id: number;
  total_facturas: number;
  total_compras: number;
  promedio_compra: number;
  ultima_compra?: string;
  primera_compra?: string;
  facturas_vencidas: number;
  monto_por_cobrar: number;
  productos_mas_comprados: Array<{
    producto: string;
    cantidad: number;
    monto: number;
  }>;
  historial_pagos: Array<{
    fecha: string;
    monto: number;
    factura: string;
  }>;
}

/**
 * Resumen de cartera de clientes
 */
export interface ResumenCartera {
  total_clientes: number;
  clientes_activos: number;
  clientes_con_deuda: number;
  monto_total_por_cobrar: number;
  monto_vencido: number;
  promedio_dias_pago: number;
  top_clientes: Array<{
    cliente: ClienteResumen;
    monto_total: number;
    ultima_compra: string;
  }>;
}

// =======================================================
// CONSTANTES
// =======================================================

export const TIPOS_DOCUMENTO_LABELS: Record<TipoDocumentoIdentidad, string> = {
  '1': 'DNI',
  '6': 'RUC',
};

export const TIPOS_PERSONA_LABELS: Record<TipoPersona, string> = {
  natural: 'Persona Natural',
  juridica: 'Persona Jurídica',
};

export const ESTADOS_CLIENTE_LABELS: Record<EstadoCliente, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
};

export const TIPOS_CONTRIBUYENTE_LABELS: Record<TipoContribuyente, string> = {
  especial: 'Contribuyente Especial',
  principal: 'Principal',
  buen_contribuyente: 'Buen Contribuyente',
  agente_retencion: 'Agente de Retención',
};

// =======================================================
// UTILIDADES DE TIPOS
// =======================================================

/**
 * Tipo para select options
 */
export interface OpcionSelect<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Opciones para selects
 */
export const OPCIONES_TIPO_DOCUMENTO: OpcionSelect<TipoDocumentoIdentidad>[] = [
  { value: '1', label: 'DNI - Documento Nacional de Identidad' },
  { value: '6', label: 'RUC - Registro Único de Contribuyentes' },
];

export const OPCIONES_TIPO_PERSONA: OpcionSelect<TipoPersona>[] = [
  { value: 'natural', label: 'Persona Natural' },
  { value: 'juridica', label: 'Persona Jurídica' },
];

export const OPCIONES_ESTADO_CLIENTE: OpcionSelect<EstadoCliente>[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

// =======================================================
// CLIENTES POR DEFECTO
// =======================================================

/**
 * Cliente genérico para ventas sin identificar
 */
export const CLIENTE_GENERICO: ClienteFacturacion = {
  id: 0,
  tipo_documento: '1',
  numero_documento: '00000000',
  nombre_o_razon_social: 'Cliente Genérico',
  direccion: 'Sin dirección',
  distrito: 'Lima',
  provincia: 'Lima',
  departamento: 'Lima',
};

/**
 * Validar que un cliente es válido para facturación
 */
export const esClienteValidoParaFacturacion = (cliente: Partial<Cliente>): cliente is ClienteFacturacion => {
  return !!(
    cliente.id &&
    cliente.tipo_documento &&
    cliente.numero_documento &&
    cliente.nombre_o_razon_social &&
    cliente.direccion
  );
};

/**
 * Obtener nombre completo del cliente
 */
export const obtenerNombreCompletoCliente = (cliente: Cliente): string => {
  if (cliente.tipo_persona === 'natural' && cliente.nombres) {
    const apellidos = [cliente.apellido_paterno, cliente.apellido_materno]
      .filter(Boolean)
      .join(' ');
    return `${cliente.nombres} ${apellidos}`.trim();
  }
  return cliente.nombre_o_razon_social;
};

/**
 * Formatear documento con etiqueta
 */
export const formatearDocumentoConEtiqueta = (cliente: Cliente): string => {
  const tipoLabel = TIPOS_DOCUMENTO_LABELS[cliente.tipo_documento];
  return `${tipoLabel}: ${cliente.numero_documento}`;
};