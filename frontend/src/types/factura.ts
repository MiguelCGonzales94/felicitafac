/**
 * Types para Facturación - FELICITAFAC Frontend
 */

export interface TipoDocumentoElectronico {
  id: number;
  codigo_sunat: string;
  nombre: string;
  nomenclatura: string;
  requiere_cliente_ruc: boolean;
  permite_exportacion: boolean;
  afecta_inventario: boolean;
  afecta_cuentas_cobrar: boolean;
  requiere_referencia: boolean;
  serie_defecto: string;
  cantidad_documentos?: number;
  activo: boolean;
}

export interface SerieDocumento {
  id: number;
  sucursal: number;
  sucursal_nombre?: string;
  tipo_documento: number;
  tipo_documento_nombre?: string;
  serie: string;
  numero_actual: number;
  numero_maximo: number;
  es_predeterminada: boolean;
  documentos_emitidos?: number;
  siguiente_numero?: number;
  observaciones?: string;
  activo: boolean;
}

export interface FormaPago {
  id: number;
  codigo: string;
  nombre: string;
  tipo: 'efectivo' | 'transferencia' | 'tarjeta_credito' | 'tarjeta_debito' | 'cheque' | 'deposito' | 'yape' | 'plin' | 'billetera_digital' | 'credito';
  requiere_referencia: boolean;
  es_credito: boolean;
  dias_credito_defecto: number;
  cuenta_contable?: string;
  orden: number;
  activo: boolean;
}

export interface PagoDocumento {
  id?: number;
  forma_pago: number;
  forma_pago_info?: FormaPago;
  monto: number;
  referencia?: string;
  fecha_pago: string;
  observaciones?: string;
  activo?: boolean;
}

export interface DetalleDocumento {
  id?: number;
  numero_item: number;
  producto: number;
  producto_info?: {
    codigo: string;
    nombre: string;
    stock_actual: number;
    controla_stock: boolean;
  };
  codigo_producto: string;
  descripcion: string;
  unidad_medida: string;
  cantidad: number;
  precio_unitario: number;
  precio_unitario_con_igv?: number;
  descuento_porcentaje: number;
  descuento?: number;
  subtotal?: number;
  base_imponible?: number;
  igv?: number;
  total_item?: number;
  tipo_afectacion_igv: string;
  codigo_tributo: string;
  porcentaje_igv: number;
  es_gratuito: boolean;
  lote?: string;
  fecha_vencimiento_producto?: string;
  observaciones?: string;
  activo?: boolean;
}

export interface DocumentoElectronico {
  id?: number;
  uuid?: string;
  tipo_documento: number;
  tipo_documento_info?: TipoDocumentoElectronico;
  serie_documento: number;
  serie_documento_info?: SerieDocumento;
  numero?: number;
  numero_completo?: string;
  
  // Fechas
  fecha_emision: string;
  fecha_vencimiento?: string;
  dias_vencimiento?: number;
  
  // Cliente
  cliente: number;
  cliente_info?: {
    id: number;
    razon_social: string;
    numero_documento: string;
    email?: string;
    telefono?: string;
  };
  cliente_tipo_documento?: string;
  cliente_numero_documento?: string;
  cliente_razon_social?: string;
  cliente_direccion?: string;
  cliente_email?: string;
  
  // Moneda y cambio
  moneda: 'PEN' | 'USD' | 'EUR';
  tipo_cambio: number;
  
  // Importes
  subtotal?: number;
  total_descuentos?: number;
  base_imponible?: number;
  igv?: number;
  total_exonerado?: number;
  total_inafecto?: number;
  total_gratuito?: number;
  total?: number;
  
  // Información adicional
  observaciones?: string;
  condiciones_pago: string;
  vendedor?: number;
  vendedor_info?: {
    id: number;
    nombres: string;
    apellidos: string;
    email?: string;
  };
  
  // Estado y control
  estado: 'borrador' | 'emitido' | 'enviado_sunat' | 'aceptado_sunat' | 'rechazado_sunat' | 'anulado' | 'observado';
  motivo_anulacion?: string;
  puede_anular_info?: {
    puede_anular: boolean;
    motivo: string;
  };
  estado_pago?: 'PENDIENTE' | 'PARCIAL' | 'PAGADO';
  
  // Información SUNAT
  hash_documento?: string;
  codigo_qr?: string;
  enlace_pdf?: string;
  enlace_xml?: string;
  enlace_cdr?: string;
  fecha_envio_sunat?: string;
  fecha_respuesta_sunat?: string;
  url_pdf?: string;
  url_xml?: string;
  
  // Referencia (para notas)
  documento_referencia?: number;
  tipo_nota?: string;
  motivo_nota?: string;
  
  // Relacionados
  detalles?: DetalleDocumento[];
  pagos?: PagoDocumento[];
  
  // Auditoría
  activo?: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface DocumentoElectronicoListItem {
  id: number;
  numero_completo: string;
  tipo_documento_nombre: string;
  cliente_nombre: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  dias_vencimiento?: number;
  total: number;
  moneda: string;
  estado: string;
  estado_pago: 'PENDIENTE' | 'PARCIAL' | 'PAGADO';
  activo: boolean;
}

export interface DocumentoFormData {
  tipo_documento: number;
  serie_documento: number;
  cliente: number;
  fecha_emision: string;
  fecha_vencimiento?: string;
  moneda: string;
  tipo_cambio: number;
  observaciones?: string;
  condiciones_pago: string;
  vendedor?: number;
  documento_referencia?: number;
  tipo_nota?: string;
  motivo_nota?: string;
  detalles_data: Omit<DetalleDocumento, 'id'>[];
  pagos_data?: Omit<PagoDocumento, 'id'>[];
}

export interface DocumentoBusqueda {
  numero_completo?: string;
  tipo_documento?: number;
  cliente?: number;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  moneda?: string;
  monto_minimo?: number;
  monto_maximo?: number;
  estado_pago?: 'pendiente' | 'parcial' | 'pagado';
  vendedor?: number;
}

export interface EstadisticasFacturacion {
  total_documentos: number;
  total_facturado: number;
  total_igv: number;
  documentos_por_estado: Record<string, number>;
  por_tipo_documento: Record<string, { cantidad: number; monto: number }>;
  por_moneda: Record<string, { cantidad: number; monto: number }>;
  facturacion_diaria: Array<{ fecha: string; monto: number; cantidad: number }>;
  facturacion_mensual: Array<{ mes: string; monto: number; cantidad: number }>;
  top_clientes: Array<{ cliente: string; monto: number; documentos: number }>;
  documentos_vencidos: number;
  documentos_por_vencer: number;
  ticket_promedio: number;
  documentos_promedio_dia: number;
}

export interface AnulacionDocumento {
  motivo: string;
  enviar_sunat: boolean;
}

export interface DocumentoApiResponse {
  count: number;
  next?: string;
  previous?: string;
  results: DocumentoElectronicoListItem[];
}

export interface DocumentoValidation {
  cliente?: string[];
  detalles_data?: string[];
  fecha_emision?: string[];
  total?: string[];
  [key: string]: string[] | undefined;
}

export interface DocumentoError {
  message: string;
  errors?: DocumentoValidation;
  status?: number;
}

// Enums y constantes
export const TIPOS_DOCUMENTO_SUNAT = {
  FACTURA: '01',
  BOLETA: '03',
  NOTA_CREDITO: '07',
  NOTA_DEBITO: '08',
  GUIA_REMISION: '09'
} as const;

export const ESTADOS_DOCUMENTO = {
  BORRADOR: 'borrador',
  EMITIDO: 'emitido',
  ENVIADO_SUNAT: 'enviado_sunat',
  ACEPTADO_SUNAT: 'aceptado_sunat',
  RECHAZADO_SUNAT: 'rechazado_sunat',
  ANULADO: 'anulado',
  OBSERVADO: 'observado'
} as const;

export const ESTADOS_PAGO = {
  PENDIENTE: 'PENDIENTE',
  PARCIAL: 'PARCIAL',
  PAGADO: 'PAGADO'
} as const;

export const MONEDAS = {
  PEN: 'PEN',
  USD: 'USD',
  EUR: 'EUR'
} as const;

export const CONDICIONES_PAGO = {
  CONTADO: 'CONTADO',
  CREDITO_30: 'CREDITO 30 DIAS',
  CREDITO_60: 'CREDITO 60 DIAS',
  CREDITO_90: 'CREDITO 90 DIAS'
} as const;

export type TipoDocumentoSunat = typeof TIPOS_DOCUMENTO_SUNAT[keyof typeof TIPOS_DOCUMENTO_SUNAT];
export type EstadoDocumento = typeof ESTADOS_DOCUMENTO[keyof typeof ESTADOS_DOCUMENTO];
export type EstadoPago = typeof ESTADOS_PAGO[keyof typeof ESTADOS_PAGO];
export type Moneda = typeof MONEDAS[keyof typeof MONEDAS];
export type CondicionPago = typeof CONDICIONES_PAGO[keyof typeof CONDICIONES_PAGO];