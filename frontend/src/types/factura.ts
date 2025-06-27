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