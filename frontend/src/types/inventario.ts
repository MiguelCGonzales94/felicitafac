/**
 * Types Inventario - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Tipos específicos para gestión de inventario y almacén
 */

// =======================================================
// TIPOS BÁSICOS DE INVENTARIO
// =======================================================

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'transferencia' | 'merma' | 'devolucion';
export type MotivoMovimiento = 
  | 'compra' | 'venta' | 'ajuste_positivo' | 'ajuste_negativo' 
  | 'transferencia_entrada' | 'transferencia_salida' | 'merma' | 'caducidad'
  | 'devolucion_cliente' | 'devolucion_proveedor' | 'produccion' | 'consumo_interno'
  | 'robo' | 'perdida' | 'inventario_inicial' | 'promocion' | 'muestra_gratis';

export type EstadoMovimiento = 'pendiente' | 'procesado' | 'anulado' | 'autorizado';
export type MetodoValuacion = 'PEPS' | 'PROMEDIO' | 'UEPS' | 'ESTANDAR';
export type EstadoStock = 'disponible' | 'reservado' | 'bloqueado' | 'vencido' | 'dañado';

// =======================================================
// INTERFACE PRINCIPAL DE MOVIMIENTO
// =======================================================

export interface MovimientoInventario {
  id: number;
  numero_movimiento: string;
  
  // Información básica
  fecha_movimiento: string;
  hora_movimiento: string;
  tipo_movimiento: TipoMovimiento;
  motivo: MotivoMovimiento;
  
  // Producto
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  
  // Almacén y ubicación
  almacen_id: number;
  almacen_nombre: string;
  ubicacion?: string;
  
  // Cantidades y precios
  cantidad: number;
  cantidad_anterior: number;
  stock_anterior: number;
  stock_posterior: number;
  costo_unitario: number;
  costo_total: number;
  precio_venta?: number;
  
  // Control de lotes
  lote?: string;
  fecha_vencimiento?: string;
  numero_serie?: string;
  
  // Referencias
  documento_referencia?: string;
  orden_compra?: string;
  guia_remision?: string;
  factura_relacionada?: string;
  
  // Observaciones y control
  observaciones?: string;
  estado: EstadoMovimiento;
  requiere_autorizacion: boolean;
  autorizado_por?: number;
  fecha_autorizacion?: string;
  
  // Usuario y auditoría
  usuario_id: number;
  usuario_nombre: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  ip_origen?: string;
  
  // Transferencias (si aplica)
  almacen_destino_id?: number;
  almacen_destino_nombre?: string;
  movimiento_relacionado_id?: number;
}

// =======================================================
// INTERFACES DE STOCK Y KARDEX
// =======================================================

export interface StockProducto {
  id: number;
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  almacen_id: number;
  almacen_nombre: string;
  
  // Cantidades
  stock_actual: number;
  stock_disponible: number;
  stock_reservado: number;
  stock_en_transito: number;
  stock_bloqueado: number;
  
  // Límites y alertas
  stock_minimo: number;
  stock_maximo: number;
  punto_reorden: number;
  
  // Valuación
  costo_promedio: number;
  costo_ultima_compra: number;
  valor_total_stock: number;
  
  // Lotes y vencimientos
  total_lotes: number;
  lotes_por_vencer: number;
  lotes_vencidos: number;
  fecha_proximo_vencimiento?: string;
  
  // Control de fechas
  fecha_ultimo_movimiento?: string;
  fecha_ultima_entrada?: string;
  fecha_ultima_salida?: string;
  fecha_actualizacion: string;
}

export interface DetalleStockLote {
  id: number;
  producto_id: number;
  almacen_id: number;
  lote: string;
  fecha_vencimiento?: string;
  stock_lote: number;
  costo_unitario: number;
  valor_lote: number;
  estado: EstadoStock;
  proveedor?: string;
  fecha_ingreso: string;
  dias_para_vencer?: number;
  alerta_vencimiento: boolean;
}

export interface KardexProducto {
  id: number;
  fecha: string;
  documento: string;
  detalle: string;
  entrada: number;
  salida: number;
  saldo: number;
  costo_unitario: number;
  costo_total: number;
  observaciones?: string;
  usuario: string;
}

// =======================================================
// INTERFACES DE ALMACENES
// =======================================================

export interface Almacen {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  
  // Ubicación
  direccion?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  responsable?: string;
  telefono?: string;
  
  // Configuración
  tipo_almacen: 'principal' | 'sucursal' | 'deposito' | 'virtual' | 'consignacion';
  es_principal: boolean;
  permite_ventas: boolean;
  controla_ubicaciones: boolean;
  requiere_autorizacion: boolean;
  
  // Estado
  activo: boolean;
  fecha_creacion: string;
  
  // Estadísticas
  total_productos?: number;
  valor_total_inventario?: number;
  productos_stock_bajo?: number;
  productos_sin_stock?: number;
}

export interface UbicacionAlmacen {
  id: number;
  almacen_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  pasillo?: string;
  estante?: string;
  nivel?: string;
  capacidad_maxima?: number;
  productos_asignados: number;
  activo: boolean;
}

// =======================================================
// INTERFACES DE TRANSFERENCIAS
// =======================================================

export interface TransferenciaInventario {
  id: number;
  numero_transferencia: string;
  fecha_transferencia: string;
  
  // Almacenes
  almacen_origen_id: number;
  almacen_origen_nombre: string;
  almacen_destino_id: number;
  almacen_destino_nombre: string;
  
  // Responsables
  enviado_por: number;
  enviado_por_nombre: string;
  recibido_por?: number;
  recibido_por_nombre?: string;
  
  // Estado y control
  estado: 'pendiente' | 'en_transito' | 'recibida' | 'anulada';
  fecha_envio?: string;
  fecha_recepcion?: string;
  
  // Información adicional
  motivo: string;
  observaciones?: string;
  documento_transporte?: string;
  costo_transporte?: number;
  
  // Totales
  total_items: number;
  valor_total: number;
  
  // Items
  items: ItemTransferencia[];
  
  // Auditoría
  fecha_creacion: string;
  usuario_creacion: number;
}

export interface ItemTransferencia {
  id: number;
  transferencia_id: number;
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  
  // Cantidades
  cantidad_enviada: number;
  cantidad_recibida?: number;
  cantidad_diferencia?: number;
  
  // Lotes
  lote?: string;
  fecha_vencimiento?: string;
  
  // Costos
  costo_unitario: number;
  costo_total: number;
  
  // Estado
  estado: 'pendiente' | 'enviado' | 'recibido' | 'diferencia';
  observaciones?: string;
}

// =======================================================
// INTERFACES DE AJUSTES
// =======================================================

export interface AjusteInventario {
  id: number;
  numero_ajuste: string;
  fecha_ajuste: string;
  tipo_ajuste: 'conteo_fisico' | 'correccion' | 'merma' | 'caducidad' | 'robo' | 'otro';
  
  // Almacén
  almacen_id: number;
  almacen_nombre: string;
  
  // Responsable
  responsable_id: number;
  responsable_nombre: string;
  supervisor_id?: number;
  supervisor_nombre?: string;
  
  // Estado
  estado: 'borrador' | 'autorizado' | 'procesado' | 'anulado';
  requiere_autorizacion: boolean;
  fecha_autorizacion?: string;
  
  // Información
  motivo: string;
  observaciones?: string;
  documento_soporte?: string;
  
  // Totales
  total_items: number;
  diferencia_valor: number;
  diferencia_cantidad: number;
  
  // Items
  items: ItemAjuste[];
  
  // Auditoría
  fecha_creacion: string;
  fecha_procesamiento?: string;
}

export interface ItemAjuste {
  id: number;
  ajuste_id: number;
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  
  // Stock
  stock_sistema: number;
  stock_fisico: number;
  diferencia: number;
  
  // Lote
  lote?: string;
  fecha_vencimiento?: string;
  
  // Costos
  costo_unitario: number;
  diferencia_valor: number;
  
  // Control
  motivo_diferencia?: string;
  observaciones?: string;
  verificado: boolean;
  verificado_por?: number;
}

// =======================================================
// INTERFACES DE REPORTES Y CONSULTAS
// =======================================================

export interface FiltrosInventario {
  fecha_desde?: string;
  fecha_hasta?: string;
  almacen_id?: number;
  producto_id?: number;
  categoria_id?: number;
  tipo_movimiento?: TipoMovimiento;
  motivo?: MotivoMovimiento;
  usuario_id?: number;
  con_lote?: boolean;
  solo_vencidos?: boolean;
  solo_por_vencer?: boolean;
  numero_movimiento?: string;
  documento_referencia?: string;
}

export interface ReporteInventario {
  tipo_reporte: 'kardex' | 'stock_actual' | 'movimientos' | 'valorizado' | 'vencimientos' | 'faltantes';
  filtros: FiltrosInventario;
  fecha_generacion: string;
  total_registros: number;
  datos: any[];
  resumen?: ResumenReporteInventario;
}

export interface ResumenReporteInventario {
  total_productos: number;
  valor_total_inventario: number;
  total_movimientos: number;
  productos_con_stock: number;
  productos_sin_stock: number;
  productos_stock_bajo: number;
  productos_por_vencer: number;
  productos_vencidos: number;
}

export interface AlertaInventario {
  id: number;
  tipo_alerta: 'stock_bajo' | 'sin_stock' | 'vencimiento' | 'vencido' | 'sobrestock';
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  almacen_id: number;
  almacen_nombre: string;
  
  // Detalles de la alerta
  stock_actual: number;
  stock_minimo?: number;
  stock_maximo?: number;
  fecha_vencimiento?: string;
  dias_para_vencer?: number;
  lote?: string;
  
  // Control
  fecha_alerta: string;
  vista: boolean;
  fecha_vista?: string;
  resuelta: boolean;
  fecha_resolucion?: string;
  usuario_resolvio?: number;
  
  // Prioridad
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  mensaje: string;
}

// =======================================================
// INTERFACES DE VALUACIÓN
// =======================================================

export interface ValuacionInventario {
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  almacen_id: number;
  
  // Método PEPS
  costo_peps: number;
  valor_peps: number;
  
  // Promedio ponderado
  costo_promedio: number;
  valor_promedio: number;
  
  // Última compra
  costo_ultima_compra: number;
  valor_ultima_compra: number;
  
  // Stock
  stock_actual: number;
  fecha_calculo: string;
}

export interface LoteInventario {
  id: number;
  lote: string;
  producto_id: number;
  almacen_id: number;
  fecha_ingreso: string;
  fecha_vencimiento?: string;
  stock_inicial: number;
  stock_actual: number;
  costo_unitario: number;
  valor_lote: number;
  proveedor?: string;
  numero_factura?: string;
  estado: EstadoStock;
  dias_para_vencer?: number;
  movimientos_asociados: number;
}

// =======================================================
// INTERFACES DE CONFIGURACIÓN
// =======================================================

export interface ConfiguracionInventario {
  // Valuación
  metodo_valuacion_default: MetodoValuacion;
  actualizar_costo_automatico: boolean;
  incluir_gastos_compra: boolean;
  
  // Stock
  permitir_stock_negativo: boolean;
  alertar_stock_bajo: boolean;
  dias_alerta_vencimiento: number;
  reservar_stock_automatico: boolean;
  
  // Movimientos
  requiere_autorizacion_ajustes: boolean;
  limite_ajuste_sin_autorizacion: number;
  bloquear_movimientos_vencidos: boolean;
  generar_numero_movimiento_automatico: boolean;
  
  // Lotes
  formato_lote_automatico: string;
  controlar_vencimientos: boolean;
  permitir_lotes_vencidos: boolean;
  dias_gracia_vencimiento: number;
  
  // Transferencias
  requiere_autorizacion_transferencias: boolean;
  limite_transferencia_sin_autorizacion: number;
  confirmar_recepcion_automatica: boolean;
  
  // Reportes
  incluir_productos_sin_movimiento: boolean;
  agrupar_por_categoria_reportes: boolean;
  mostrar_costo_reportes: boolean;
}

// =======================================================
// INTERFACES DE ACCIONES
// =======================================================

export interface AccionInventario {
  tipo: 'entrada' | 'salida' | 'ajuste' | 'transferencia' | 'reserva' | 'liberacion';
  producto_id: number;
  almacen_id: number;
  cantidad: number;
  costo_unitario?: number;
  motivo: MotivoMovimiento;
  observaciones?: string;
  lote?: string;
  fecha_vencimiento?: string;
  documento_referencia?: string;
  usuario_id: number;
}

export interface ResultadoAccionInventario {
  exito: boolean;
  mensaje: string;
  movimiento_id?: number;
  stock_anterior: number;
  stock_nuevo: number;
  errores?: string[];
}

// =======================================================
// TYPES AUXILIARES
// =======================================================

export type EstadoValidacionStock = 'disponible' | 'insuficiente' | 'reservado' | 'bloqueado';

export interface ValidacionStock {
  producto_id: number;
  almacen_id: number;
  cantidad_solicitada: number;
  stock_disponible: number;
  estado: EstadoValidacionStock;
  puede_vender: boolean;
  mensaje?: string;
  lotes_disponibles?: DetalleStockLote[];
}

// =======================================================
// INTERFACES DE CONTEXTO
// =======================================================

export interface ContextoInventario {
  almacenes: Almacen[];
  almacen_seleccionado?: Almacen;
  movimientos_recientes: MovimientoInventario[];
  alertas: AlertaInventario[];
  stock_productos: StockProducto[];
  filtros: FiltrosInventario;
  loading: boolean;
  error?: string;
  configuracion: ConfiguracionInventario;
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default {
  MovimientoInventario,
  StockProducto,
  Almacen,
  TransferenciaInventario,
  AjusteInventario,
  FiltrosInventario,
  ReporteInventario,
  AlertaInventario,
  ValuacionInventario,
  LoteInventario,
  ConfiguracionInventario,
  ValidacionStock,
  ContextoInventario
};