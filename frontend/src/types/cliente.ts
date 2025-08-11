/**
 * Types Cliente - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Tipos específicos para gestión de clientes
 */

// =======================================================
// TIPOS BÁSICOS DE CLIENTE
// =======================================================

export type TipoDocumentoCliente = '1' | '4' | '6' | '7' | 'A';
export type TipoPersonaCliente = 'natural' | 'juridica';
export type EstadoCliente = 'activo' | 'inactivo' | 'suspendido';
export type OrigenCliente = 'manual' | 'api' | 'importacion' | 'web';

// =======================================================
// INTERFACE PRINCIPAL DE CLIENTE
// =======================================================

export interface Cliente {
  id: number;
  codigo: string;
  
  // Identificación
  tipo_documento: TipoDocumentoCliente;
  numero_documento: string;
  tipo_persona: TipoPersonaCliente;
  
  // Datos personales (persona natural)
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  
  // Datos empresariales (persona jurídica)
  razon_social?: string;
  nombre_comercial?: string;
  
  // Datos de contacto
  email?: string;
  telefono?: string;
  telefono_alternativo?: string;
  sitio_web?: string;
  
  // Dirección
  direccion: string;
  referencia_direccion?: string;
  ubigeo?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  codigo_postal?: string;
  
  // Datos comerciales
  condiciones_pago?: string;
  limite_credito?: number;
  dias_credito?: number;
  descuento_permitido?: number;
  precio_especial?: boolean;
  exonerado_igv?: boolean;
  
  // Datos adicionales
  fecha_nacimiento?: string;
  profesion?: string;
  estado_civil?: string;
  observaciones?: string;
  
  // Control
  estado: EstadoCliente;
  origen: OrigenCliente;
  favorito: boolean;
  
  // Estadísticas
  total_documentos?: number;
  total_facturado?: number;
  ultima_compra?: string;
  promedio_compra?: number;
  
  // Metadatos
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_creacion: number;
  activo: boolean;
}

// =======================================================
// INTERFACES PARA FORMULARIOS
// =======================================================

export interface FormularioCliente {
  // Datos básicos
  tipo_documento: TipoDocumentoCliente;
  numero_documento: string;
  
  // Nombres según tipo de persona
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  razon_social?: string;
  nombre_comercial?: string;
  
  // Contacto
  email?: string;
  telefono?: string;
  telefono_alternativo?: string;
  sitio_web?: string;
  
  // Dirección
  direccion: string;
  referencia_direccion?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  codigo_postal?: string;
  
  // Configuración comercial
  condiciones_pago?: string;
  limite_credito?: number;
  dias_credito?: number;
  descuento_permitido?: number;
  precio_especial?: boolean;
  exonerado_igv?: boolean;
  
  // Otros
  fecha_nacimiento?: string;
  profesion?: string;
  estado_civil?: string;
  observaciones?: string;
}

export interface FormularioClienteRapido {
  tipo_documento: TipoDocumentoCliente;
  numero_documento: string;
  nombre_o_razon_social: string;
  direccion: string;
  telefono?: string;
  email?: string;
}

// =======================================================
// INTERFACES DE CONSULTA Y FILTROS
// =======================================================

export interface FiltrosCliente {
  busqueda?: string;
  tipo_documento?: TipoDocumentoCliente;
  tipo_persona?: TipoPersonaCliente;
  estado?: EstadoCliente;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  favorito?: boolean;
  con_deuda?: boolean;
  sin_actividad_dias?: number;
  fecha_creacion_desde?: string;
  fecha_creacion_hasta?: string;
}

export interface ParametrosBusquedaCliente {
  termino?: string;
  filtros?: FiltrosCliente;
  orden_por?: 'nombre' | 'documento' | 'fecha_creacion' | 'ultima_compra' | 'total_facturado';
  direccion_orden?: 'asc' | 'desc';
  pagina?: number;
  tamaño_pagina?: number;
}

// =======================================================
// INTERFACES DE RESPUESTA
// =======================================================

export interface ResumenCliente {
  id: number;
  codigo: string;
  tipo_documento: TipoDocumentoCliente;
  numero_documento: string;
  nombre_completo: string;
  email?: string;
  telefono?: string;
  direccion: string;
  estado: EstadoCliente;
  total_facturado: number;
  ultima_compra?: string;
  favorito: boolean;
}

export interface ListaClientesResponse {
  resultados: ResumenCliente[];
  total: number;
  pagina: number;
  total_paginas: number;
  tamaño_pagina: number;
}

export interface DetalleClienteResponse {
  cliente: Cliente;
  estadisticas: EstadisticasCliente;
  documentos_recientes: DocumentoClienteResumen[];
  cuenta_corriente: CuentaCorrienteResumen[];
}

// =======================================================
// INTERFACES DE ESTADÍSTICAS
// =======================================================

export interface EstadisticasCliente {
  // Totales generales
  total_documentos: number;
  total_facturado: number;
  promedio_compra: number;
  
  // Por tipo de documento
  total_facturas: number;
  total_boletas: number;
  total_notas_credito: number;
  total_notas_debito: number;
  
  // Temporales
  facturado_mes_actual: number;
  facturado_mes_anterior: number;
  documentos_mes_actual: number;
  documentos_mes_anterior: number;
  
  // Fechas importantes
  primera_compra?: string;
  ultima_compra?: string;
  dias_sin_actividad: number;
  
  // Estado financiero
  saldo_pendiente: number;
  credito_disponible: number;
  documentos_vencidos: number;
  dias_promedio_pago: number;
}

export interface DocumentoClienteResumen {
  id: number;
  tipo_documento: string;
  numero_documento: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  estado: string;
  moneda: string;
  total: number;
  saldo_pendiente: number;
}

export interface CuentaCorrienteResumen {
  id: number;
  fecha: string;
  tipo_movimiento: 'cargo' | 'abono';
  documento_referencia: string;
  descripcion: string;
  debe: number;
  haber: number;
  saldo: number;
}

// =======================================================
// INTERFACES PARA VALIDACIÓN
// =======================================================

export interface ValidacionCliente {
  numero_documento: {
    valido: boolean;
    mensaje?: string;
    tipo_detectado?: TipoDocumentoCliente;
  };
  email: {
    valido: boolean;
    mensaje?: string;
  };
  telefono: {
    valido: boolean;
    mensaje?: string;
  };
  direccion: {
    valido: boolean;
    mensaje?: string;
  };
  datos_comerciales: {
    valido: boolean;
    mensajes?: string[];
  };
}

export interface ErroresFormularioCliente {
  tipo_documento?: string;
  numero_documento?: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  razon_social?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  limite_credito?: string;
  dias_credito?: string;
  descuento_permitido?: string;
  general?: string;
}

// =======================================================
// INTERFACES DE ACCIONES
// =======================================================

export interface AccionCliente {
  tipo: 'crear' | 'editar' | 'eliminar' | 'activar' | 'suspender' | 'marcar_favorito';
  cliente_id?: number;
  datos?: Partial<FormularioCliente>;
  motivo?: string;
}

export interface ResultadoAccionCliente {
  exito: boolean;
  mensaje: string;
  cliente?: Cliente;
  errores?: ErroresFormularioCliente;
}

// =======================================================
// INTERFACES DE CONFIGURACIÓN
// =======================================================

export interface ConfiguracionClientes {
  requiere_email: boolean;
  requiere_telefono: boolean;
  requiere_direccion_completa: boolean;
  validar_documento_sunat: boolean;
  limite_credito_default: number;
  dias_credito_default: number;
  descuento_maximo_permitido: number;
  codigo_auto_generar: boolean;
  prefijo_codigo: string;
  longitud_codigo: number;
}

// =======================================================
// INTERFACES DE IMPORTACIÓN/EXPORTACIÓN
// =======================================================

export interface ClienteImportacion {
  fila: number;
  tipo_documento: string;
  numero_documento: string;
  nombre_completo: string;
  email?: string;
  telefono?: string;
  direccion: string;
  valido: boolean;
  errores: string[];
}

export interface ResultadoImportacionClientes {
  total_procesados: number;
  total_importados: number;
  total_errores: number;
  clientes_importados: Cliente[];
  errores: ClienteImportacion[];
}

export interface OpcionesExportacionClientes {
  formato: 'excel' | 'csv' | 'pdf';
  filtros?: FiltrosCliente;
  campos?: string[];
  incluir_estadisticas?: boolean;
  incluir_cuenta_corriente?: boolean;
}

// =======================================================
// INTERFACES DE COMUNICACIÓN
// =======================================================

export interface TemplateEmailCliente {
  id: number;
  nombre: string;
  asunto: string;
  contenido: string;
  variables_disponibles: string[];
  activo: boolean;
}

export interface EnvioEmailCliente {
  cliente_id: number;
  template_id?: number;
  asunto: string;
  contenido: string;
  adjuntos?: string[];
  programado?: string;
}

export interface HistorialComunicacionCliente {
  id: number;
  fecha: string;
  tipo: 'email' | 'sms' | 'llamada' | 'whatsapp';
  asunto: string;
  contenido: string;
  estado: 'enviado' | 'entregado' | 'leido' | 'error';
  usuario: string;
}

// =======================================================
// INTERFACES DE BÚSQUEDA AVANZADA
// =======================================================

export interface ConsultaRucSunat {
  ruc: string;
  razon_social: string;
  estado: string;
  condicion: string;
  direccion: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  fecha_actualizacion: string;
}

export interface ConsultaDniReniec {
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  estado: string;
}

// =======================================================
// TYPES AUXILIARES
// =======================================================

export type CamposObligatoriosCliente = 'tipo_documento' | 'numero_documento' | 'direccion';
export type CamposOpccionalesCliente = Exclude<keyof FormularioCliente, CamposObligatoriosCliente>;

export type OrdenClientePor = 
  | 'nombre_asc' | 'nombre_desc'
  | 'documento_asc' | 'documento_desc'
  | 'fecha_creacion_asc' | 'fecha_creacion_desc'
  | 'ultima_compra_asc' | 'ultima_compra_desc'
  | 'total_facturado_asc' | 'total_facturado_desc';

// =======================================================
// EXPORTACIONES AGRUPADAS
// =======================================================

export interface ClienteCompleto extends Cliente {
  estadisticas: EstadisticasCliente;
  documentos_recientes: DocumentoClienteResumen[];
  historial_comunicacion: HistorialComunicacionCliente[];
}

export interface ContextoClientes {
  clientes: ResumenCliente[];
  cliente_seleccionado?: Cliente;
  filtros: FiltrosCliente;
  loading: boolean;
  error?: string;
  total: number;
  pagina: number;
  total_paginas: number;
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default {
  Cliente,
  FormularioCliente,
  FormularioClienteRapido,
  ResumenCliente,
  EstadisticasCliente,
  FiltrosCliente,
  ParametrosBusquedaCliente,
  ValidacionCliente,
  ErroresFormularioCliente,
  ConfiguracionClientes,
  ClienteCompleto,
  ContextoClientes
};