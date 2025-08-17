/**
 * Types de Facturación - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Tipos TypeScript para facturación SUNAT
 */

// =======================================================
// TIPOS BÁSICOS DE FACTURACIÓN
// =======================================================

export type TipoDocumento = 'factura' | 'boleta' | 'nota_credito' | 'nota_debito';
export type EstadoFactura = 'pendiente' | 'emitida' | 'anulada' | 'rechazada';
export type TipoAfectacionIGV = '10' | '20' | '30' | '40'; // Gravado, Exonerado, Inafecto, Exportación
export type UnidadMedida = 'NIU' | 'KGM' | 'MTR' | 'LTR' | 'H87' | 'BX' | 'PK' | 'ZZ';
export type TipoPago = 'contado' | 'credito';
export type EstadoPago = 'pendiente' | 'pagado' | 'vencido' | 'parcial';

// =======================================================
// INTERFACES PRINCIPALES
// =======================================================

/**
 * Item de factura
 */
export interface ItemFactura {
  id?: number;
  producto_id: number;
  codigo_producto: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  tipo_afectacion_igv: TipoAfectacionIGV;
  unidad_medida: UnidadMedida;
  
  // Calculados automáticamente
  subtotal: number;
  igv: number;
  total: number;
  
  // Información adicional del producto
  stock_disponible?: number;
  categoria?: string;
  imagen_url?: string;
}

/**
 * Datos del cliente para facturación
 */
export interface ClienteFactura {
  id: number;
  tipo_documento: '1' | '6'; // DNI o RUC
  numero_documento: string;
  nombre_o_razon_social: string;
  direccion: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  telefono?: string;
  email?: string;
}

/**
 * Factura principal
 */
export interface Factura {
  id: number;
  tipo_documento: TipoDocumento;
  serie: string;
  numero: number;
  numero_completo: string; // Serie + Número
  
  // Cliente
  cliente_id: number;
  cliente: ClienteFactura;
  
  // Fechas
  fecha_emision: string;
  fecha_vencimiento?: string;
  
  // Montos
  subtotal: number;
  descuento_global: number;
  igv: number;
  total: number;
  
  // Estado
  estado: EstadoFactura;
  estado_pago: EstadoPago;
  
  // SUNAT
  estado_sunat?: EstadoSunat;
  hash_sunat?: string;
  qr_sunat?: string;
  enlace_pdf?: string;
  xml_firmado?: string;
  
  // Pago
  tipo_pago: TipoPago;
  dias_credito?: number;
  
  // Items
  items: ItemFactura[];
  
  // Metadata
  observaciones?: string;
  created_at: string;
  updated_at: string;
  usuario_creador: number;
}

/**
 * Estado SUNAT de la factura
 */
export interface EstadoSunat {
  codigo_respuesta: string;
  descripcion_respuesta: string;
  fecha_consulta: string;
  enlace_cdr?: string;
  aceptada_con_observaciones: boolean;
  observaciones?: string[];
}

/**
 * Detalle completo de factura
 */
export interface DetalleFactura extends Factura {
  historial_estados: HistorialEstado[];
  movimientos_contables: MovimientoContable[];
  pagos: PagoFactura[];
}

/**
 * Historial de estados
 */
export interface HistorialEstado {
  id: number;
  estado_anterior: EstadoFactura;
  estado_nuevo: EstadoFactura;
  fecha_cambio: string;
  usuario: string;
  motivo?: string;
}

/**
 * Movimiento contable generado
 */
export interface MovimientoContable {
  id: number;
  cuenta_contable: string;
  nombre_cuenta: string;
  debe: number;
  haber: number;
  fecha_registro: string;
}

/**
 * Pago de factura
 */
export interface PagoFactura {
  id: number;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  numero_operacion?: string;
  observaciones?: string;
  usuario_registro: string;
}

// =======================================================
// REQUESTS PARA APIs
// =======================================================

/**
 * Request para crear factura
 */
export interface CrearFacturaRequest {
  tipo_documento: TipoDocumento;
  cliente_id: number;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  tipo_pago: TipoPago;
  dias_credito?: number;
  descuento_global?: number;
  observaciones?: string;
  items: Omit<ItemFactura, 'id' | 'subtotal' | 'igv' | 'total'>[];
}

/**
 * Request para actualizar factura
 */
export interface ActualizarFacturaRequest {
  cliente_id?: number;
  fecha_vencimiento?: string;
  observaciones?: string;
  items?: Omit<ItemFactura, 'id' | 'subtotal' | 'igv' | 'total'>[];
}

/**
 * Request para anular factura
 */
export interface AnularFacturaRequest {
  motivo: string;
  generar_nota_credito?: boolean;
}

// =======================================================
// RESPONSES DE APIs
// =======================================================

/**
 * Response paginado de facturas
 */
export interface FacturasPaginadas {
  count: number;
  next?: string;
  previous?: string;
  results: Factura[];
}

/**
 * Response de crear/actualizar factura
 */
export interface RespuestaFactura {
  factura: Factura;
  mensaje: string;
  warnings?: string[];
}

/**
 * Response de validación antes de crear
 */
export interface ValidacionFactura {
  valido: boolean;
  errores: string[];
  warnings: string[];
  stock_insuficiente: Array<{
    producto: string;
    stock_disponible: number;
    cantidad_solicitada: number;
  }>;
}

// =======================================================
// TIPOS PARA PUNTO DE VENTA
// =======================================================

/**
 * Estado del carrito de compras
 */
export interface CarritoEstado {
  items: ItemFactura[];
  cliente_seleccionado?: ClienteFactura;
  tipo_documento: TipoDocumento;
  tipo_pago: TipoPago;
  dias_credito: number;
  descuento_global: number;
  observaciones: string;
  
  // Totales calculados
  subtotal: number;
  igv: number;
  total: number;
  
  // Estados de UI
  cargando: boolean;
  error?: string;
}

/**
 * Configuración del POS
 */
export interface ConfiguracionPOS {
  mostrar_stock: boolean;
  permitir_stock_negativo: boolean;
  calcular_igv_automatico: boolean;
  serie_por_defecto_factura: string;
  serie_por_defecto_boleta: string;
  terminos_condiciones: string;
  pie_pagina: string;
}

// =======================================================
// TIPOS PARA REPORTES
// =======================================================

/**
 * Resumen de ventas
 */
export interface ResumenVentas {
  periodo: {
    fecha_desde: string;
    fecha_hasta: string;
  };
  totales: {
    cantidad_facturas: number;
    cantidad_boletas: number;
    monto_total_sin_igv: number;
    monto_igv: number;
    monto_total_con_igv: number;
  };
  por_dia: Array<{
    fecha: string;
    cantidad_documentos: number;
    monto_sin_igv: number;
    monto_con_igv: number;
  }>;
  top_productos: Array<{
    producto: string;
    cantidad: number;
    monto: number;
  }>;
  top_clientes: Array<{
    cliente: string;
    cantidad_facturas: number;
    monto_total: number;
  }>;
}

// =======================================================
// FILTROS Y BÚSQUEDAS
// =======================================================

/**
 * Filtros para listar facturas
 */
export interface FiltrosFacturas {
  busqueda?: string;
  cliente_id?: number;
  tipo_documento?: TipoDocumento;
  estado?: EstadoFactura;
  estado_pago?: EstadoPago;
  fecha_desde?: string;
  fecha_hasta?: string;
  serie?: string;
  numero_desde?: number;
  numero_hasta?: number;
  monto_desde?: number;
  monto_hasta?: number;
  usuario_creador?: number;
  pagina?: number;
  limite?: number;
  ordenar_por?: 'fecha_emision' | 'numero' | 'total' | 'cliente';
  orden?: 'asc' | 'desc';
}

// =======================================================
// CONSTANTES
// =======================================================

export const TIPOS_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  factura: 'Factura',
  boleta: 'Boleta de Venta',
  nota_credito: 'Nota de Crédito',
  nota_debito: 'Nota de Débito',
};

export const ESTADOS_FACTURA_LABELS: Record<EstadoFactura, string> = {
  pendiente: 'Pendiente',
  emitida: 'Emitida',
  anulada: 'Anulada',
  rechazada: 'Rechazada',
};

export const ESTADOS_PAGO_LABELS: Record<EstadoPago, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  vencido: 'Vencido',
  parcial: 'Parcial',
};

export const TIPO_AFECTACION_IGV_LABELS: Record<TipoAfectacionIGV, string> = {
  '10': 'Gravado - Operación Onerosa',
  '20': 'Exonerado - Operación Onerosa',
  '30': 'Inafecto - Operación Onerosa',
  '40': 'Exportación',
};

export const UNIDADES_MEDIDA_LABELS: Record<UnidadMedida, string> = {
  NIU: 'Unidad',
  KGM: 'Kilogramo',
  MTR: 'Metro',
  LTR: 'Litro',
  H87: 'Pieza',
  BX: 'Caja',
  PK: 'Paquete',
  ZZ: 'Servicio',
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
export const OPCIONES_TIPO_DOCUMENTO: OpcionSelect<TipoDocumento>[] = [
  { value: 'factura', label: 'Factura' },
  { value: 'boleta', label: 'Boleta de Venta' },
  { value: 'nota_credito', label: 'Nota de Crédito' },
  { value: 'nota_debito', label: 'Nota de Débito' },
];

export const OPCIONES_TIPO_PAGO: OpcionSelect<TipoPago>[] = [
  { value: 'contado', label: 'Al Contado' },
  { value: 'credito', label: 'Al Crédito' },
];

export const OPCIONES_UNIDAD_MEDIDA: OpcionSelect<UnidadMedida>[] = [
  { value: 'NIU', label: 'Unidad' },
  { value: 'KGM', label: 'Kilogramo' },
  { value: 'MTR', label: 'Metro' },
  { value: 'LTR', label: 'Litro' },
  { value: 'H87', label: 'Pieza' },
  { value: 'BX', label: 'Caja' },
  { value: 'PK', label: 'Paquete' },
  { value: 'ZZ', label: 'Servicio' },
];

export interface DatosFactura {
  // Información básica
  tipo_documento: TipoDocumento;
  serie?: string;
  numero?: number;
  
  // Cliente
  cliente_id?: number;
  cliente_temporal?: {
    tipo_documento: '1' | '6'; // DNI o RUC
    numero_documento: string;
    nombre_o_razon_social: string;
    direccion?: string;
    email?: string;
    telefono?: string;
  };
  
  // Fechas
  fecha_emision?: string;
  fecha_vencimiento?: string;
  
  // Configuración de pago
  tipo_pago: TipoPago;
  dias_credito?: number;
  forma_pago?: FormaPago;
  
  // Items
  items: ItemFactura[];
  
  // Descuentos y cargos
  descuento_global?: number;
  descuento_global_tipo?: 'porcentaje' | 'monto';
  otros_cargos?: number;
  
  // Información adicional
  observaciones?: string;
  terminos_condiciones?: string;
  nota_pie?: string;
  
  // Configuración especial
  incluir_igv?: boolean;
  generar_guia_remision?: boolean;
  enviar_email_cliente?: boolean;
  
  // Datos calculados (read-only)
  subtotal?: number;
  total_descuentos?: number;
  total_igv?: number;
  total?: number;
  
  // Control de estado
  guardar_como_borrador?: boolean;
  enviar_sunat_inmediatamente?: boolean;
}

/**
 * Serie de documento
 */
export interface SerieDocumento {
  id: number;
  tipo_documento: TipoDocumento;
  serie: string;
  numero_inicial: number;
  numero_actual: number;
  numero_final: number;
  
  // Configuración
  activa: boolean;
  es_predeterminada: boolean;
  formato_numeracion: string; // Ej: "F001-{numero}"
  longitud_numero: number;
  
  // Información adicional
  descripcion?: string;
  sucursal_id?: number;
  sucursal_nombre?: string;
  usuario_asignado_id?: number;
  
  // Control
  fecha_creacion: string;
  fecha_ultima_emision?: string;
  total_documentos_emitidos: number;
  
  // Validaciones
  permite_modificar_numero: boolean;
  requiere_autorizacion: boolean;
  dias_vigencia?: number;
}

/**
 * Forma de pago
 */
export interface FormaPago {
  id: number;
  codigo: string; // Código SUNAT
  nombre: string;
  descripcion?: string;
  
  // Configuración
  requiere_referencia: boolean;
  requiere_fecha_vencimiento: boolean;
  permite_pago_parcial: boolean;
  es_credito: boolean;
  
  // Días por defecto
  dias_credito_default?: number;
  dias_credito_maximo?: number;
  
  // Información contable
  cuenta_contable?: string;
  genera_asiento_automatico: boolean;
  
  // Control
  activa: boolean;
  orden: number;
  
  // Metadatos
  fecha_creacion: string;
  usuario_creacion: number;
}

// =======================================================
// TIPOS AUXILIARES ADICIONALES
// =======================================================

/**
 * Configuración de serie por usuario
 */
export interface ConfiguracionSerieUsuario {
  usuario_id: number;
  tipo_documento: TipoDocumento;
  serie_predeterminada_id: number;
  puede_cambiar_serie: boolean;
  series_permitidas: number[];
}

/**
 * Información de numeración
 */
export interface InfoNumeracion {
  serie: string;
  ultimo_numero: number;
  siguiente_numero: number;
  numeros_disponibles: number;
  puede_emitir: boolean;
  mensaje_bloqueo?: string;
}

/**
 * Resumen por serie
 */
export interface ResumenPorSerie {
  serie_id: number;
  serie: string;
  tipo_documento: TipoDocumento;
  
  // Contadores
  total_emitidos: number;
  total_anulados: number;
  total_pendientes: number;
  
  // Montos
  monto_total_emitido: number;
  monto_total_anulado: number;
  
  // Fechas
  fecha_primer_documento?: string;
  fecha_ultimo_documento?: string;
  
  // Estado
  activa: boolean;
  numeros_disponibles: number;
}

// =======================================================
// EXTENSIONES A TIPOS EXISTENTES
// =======================================================

/**
 * Extensión para ItemFactura con más detalles
 */
export interface ItemFacturaDetallado extends ItemFactura {
  // Información del producto
  producto_codigo_barras?: string;
  producto_categoria?: string;
  producto_marca?: string;
  producto_modelo?: string;
  
  // Control de inventario
  requiere_serie: boolean;
  requiere_lote: boolean;
  series_asignadas?: string[];
  lote_asignado?: string;
  fecha_vencimiento_lote?: string;
  
  // Información de descuentos
  descuento_porcentaje?: number;
  descuento_monto?: number;
  descuento_motivo?: string;
  
  // Información adicional
  observaciones_item?: string;
  datos_tecnicos?: Record<string, any>;
  
  // Estados calculados
  precio_con_descuento: number;
  precio_sin_igv: number;
  precio_con_igv: number;
}

/**
 * Configuración avanzada de facturación
 */
export interface ConfiguracionFacturacion {
  // Series
  series_activas: SerieDocumento[];
  serie_factura_default: string;
  serie_boleta_default: string;
  serie_nota_credito_default: string;
  serie_nota_debito_default: string;
  
  // Formas de pago
  formas_pago_activas: FormaPago[];
  forma_pago_default: string;
  permite_credito_sin_autorizacion: boolean;
  dias_credito_maximo: number;
  
  // Configuración de cálculos
  incluir_igv_por_defecto: boolean;
  permitir_precios_cero: boolean;
  permitir_descuentos_negativos: boolean;
  redondeo_automatico: boolean;
  
  // Configuración de impresión
  mostrar_codigo_barras: boolean;
  mostrar_qr_sunat: boolean;
  incluir_terminos_condiciones: boolean;
  pie_pagina_predeterminado: string;
  
  // Integración SUNAT
  envio_automatico_sunat: boolean;
  reintento_automatico_errores: boolean;
  notificar_errores_sunat: boolean;
  
  // Configuración de emails
  enviar_email_automatico: boolean;
  template_email_factura: string;
  template_email_boleta: string;
  adjuntar_pdf: boolean;
  adjuntar_xml: boolean;
}

// =======================================================
// CONSTANTES ADICIONALES
// =======================================================

export const FORMAS_PAGO_SUNAT = {
  EFECTIVO: '001',
  TARJETA_CREDITO: '002',
  TARJETA_DEBITO: '003',
  TRANSFERENCIA: '004',
  CHEQUE: '005',
  CREDITO: '006',
  DEPOSITO: '007',
  OTROS: '999'
} as const;

export const SERIES_POR_TIPO: Record<TipoDocumento, string[]> = {
  factura: ['F001', 'F002', 'F003'],
  boleta: ['B001', 'B002', 'B003'],
  nota_credito: ['FC01', 'BC01'],
  nota_debito: ['FD01', 'BD01']
};

export const OPCIONES_FORMA_PAGO: OpcionSelect<string>[] = [
  { value: FORMAS_PAGO_SUNAT.EFECTIVO, label: 'Efectivo' },
  { value: FORMAS_PAGO_SUNAT.TARJETA_CREDITO, label: 'Tarjeta de Crédito' },
  { value: FORMAS_PAGO_SUNAT.TARJETA_DEBITO, label: 'Tarjeta de Débito' },
  { value: FORMAS_PAGO_SUNAT.TRANSFERENCIA, label: 'Transferencia Bancaria' },
  { value: FORMAS_PAGO_SUNAT.CHEQUE, label: 'Cheque' },
  { value: FORMAS_PAGO_SUNAT.CREDITO, label: 'Al Crédito' },
  { value: FORMAS_PAGO_SUNAT.DEPOSITO, label: 'Depósito en Cuenta' },
  { value: FORMAS_PAGO_SUNAT.OTROS, label: 'Otros' }
];