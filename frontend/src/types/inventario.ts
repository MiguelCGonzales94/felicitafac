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
// INTERFACES FALTANTES PARA MOVIMIENTOS
// =======================================================

/**
 * Detalle de movimiento individual
 */
export interface DetalleMovimiento {
  id?: number;
  movimiento_id?: number;
  
  // Producto
  producto_id: number;
  producto_codigo?: string;
  producto_nombre?: string;
  
  // Cantidades
  cantidad: number;
  cantidad_anterior?: number;
  
  // Costos
  costo_unitario: number;
  costo_total?: number;
  precio_venta?: number;
  
  // Lotes y ubicación
  lote?: string;
  fecha_vencimiento?: string;
  numero_serie?: string;
  ubicacion?: string;
  
  // Control
  observaciones?: string;
  estado?: EstadoMovimiento;
  
  // Auditoría
  fecha_creacion?: string;
  usuario_id?: number;
}

/**
 * Formulario para crear/editar movimientos
 */
export interface FormularioMovimiento {
  // Información básica (requerido)
  tipo_movimiento_id: number;
  almacen_id: number;
  fecha_movimiento: string;
  
  // Referencias opcionales
  numero_documento?: string;
  referencia?: string;
  observaciones?: string;
  
  // Entidades relacionadas
  proveedor_id?: number;
  cliente_id?: number;
  usuario_id?: number;
  
  // Transferencias
  almacen_destino_id?: number;
  
  // Autorización
  requiere_autorizacion?: boolean;
  
  // Detalles del movimiento
  detalles: DetalleMovimiento[];
  
  // Control de estado
  estado?: EstadoMovimiento;
  procesar_automaticamente?: boolean;
}

// =======================================================
// INTERFACES FALTANTES PARA LOTES
// =======================================================

/**
 * Lote de producto (alias de LoteInventario para compatibilidad)
 */
export interface LoteProducto {
  id: number;
  lote: string;
  
  // Referencias
  producto_id: number;
  producto_codigo?: string;
  producto_nombre?: string;
  almacen_id: number;
  almacen_nombre?: string;
  
  // Fechas
  fecha_ingreso: string;
  fecha_vencimiento?: string;
  fecha_produccion?: string;
  
  // Stock
  stock_inicial: number;
  stock_actual: number;
  stock_reservado?: number;
  stock_disponible?: number;
  
  // Costos
  costo_unitario: number;
  valor_lote: number;
  
  // Información adicional
  proveedor?: string;
  proveedor_id?: number;
  numero_factura?: string;
  numero_orden?: string;
  
  // Estado y control
  estado: EstadoStock;
  activo: boolean;
  
  // Alertas
  dias_para_vencer?: number;
  esta_vencido?: boolean;
  alerta_vencimiento?: boolean;
  
  // Estadísticas
  movimientos_asociados?: number;
  total_salidas?: number;
  ultima_salida?: string;
  
  // Auditoría
  fecha_creacion: string;
  fecha_actualizacion?: string;
  usuario_creacion?: number;
}

// =======================================================
// INTERFACES FALTANTES PARA ESTADÍSTICAS
// =======================================================

/**
 * Estadísticas completas de inventario
 */
export interface EstadisticasInventario {
  // Resumen general
  total_productos: number;
  productos_activos: number;
  productos_inactivos: number;
  
  // Stock
  productos_con_stock: number;
  productos_sin_stock: number;
  productos_stock_bajo: number;
  productos_sobre_stock: number;
  
  // Valores monetarios
  valor_total_inventario: number;
  valor_inventario_disponible: number;
  valor_inventario_reservado: number;
  valor_inventario_bloqueado: number;
  
  // Movimientos
  total_movimientos_mes: number;
  total_entradas_mes: number;
  total_salidas_mes: number;
  total_ajustes_mes: number;
  
  // Rotación
  productos_alta_rotacion: number;
  productos_baja_rotacion: number;
  productos_sin_movimiento: number;
  rotacion_promedio: number;
  
  // Lotes y vencimientos
  total_lotes: number;
  lotes_disponibles: number;
  lotes_por_vencer: number;
  lotes_vencidos: number;
  dias_promedio_vencimiento: number;
  
  // Almacenes
  total_almacenes: number;
  almacenes_activos: number;
  almacen_mayor_valor?: {
    id: number;
    nombre: string;
    valor: number;
  };
  
  // Alertas
  alertas_stock_minimo: number;
  alertas_vencimiento: number;
  alertas_productos_nuevos: number;
  alertas_sin_movimiento: number;
  
  // Categorías top
  categorias_mayor_valor?: Array<{
    id: number;
    nombre: string;
    valor: number;
    porcentaje: number;
  }>;
  
  // Productos top
  productos_mayor_valor?: Array<{
    id: number;
    codigo: string;
    nombre: string;
    valor: number;
    stock: number;
  }>;
  
  // Tendencias
  tendencia_valor_mensual?: Array<{
    mes: string;
    valor: number;
    movimientos: number;
  }>;
  
  // Fechas de cálculo
  fecha_calculo: string;
  periodo_analisis: string;
  incluye_inactivos: boolean;
}

// =======================================================
// INTERFACES FALTANTES PARA VALIDACIÓN
// =======================================================

/**
 * Resultado de validación de movimiento
 */
export interface ValidacionMovimiento {
  // Estado general
  es_valido: boolean;
  puede_procesar: boolean;
  requiere_autorizacion: boolean;
  
  // Mensajes
  mensaje: string;
  advertencias: string[];
  errores: string[];
  
  // Validaciones específicas
  validaciones: {
    // Stock
    stock_suficiente: boolean;
    stock_disponible: boolean;
    permite_stock_negativo: boolean;
    
    // Productos
    productos_activos: boolean;
    productos_existentes: boolean;
    
    // Almacén
    almacen_activo: boolean;
    almacen_permite_operacion: boolean;
    
    // Lotes
    lotes_validos: boolean;
    lotes_no_vencidos: boolean;
    control_lotes_requerido: boolean;
    
    // Fechas
    fecha_valida: boolean;
    fecha_no_futura: boolean;
    fecha_no_muy_antigua: boolean;
    
    // Permisos
    usuario_autorizado: boolean;
    limite_autorizado: boolean;
    
    // Configuración
    cumple_configuracion: boolean;
    tipo_movimiento_permitido: boolean;
  };
  
  // Detalles por producto
  detalles_productos: Array<{
    producto_id: number;
    producto_codigo: string;
    es_valido: boolean;
    stock_actual: number;
    stock_necesario: number;
    stock_disponible: number;
    puede_procesar: boolean;
    errores: string[];
    advertencias: string[];
    lotes_sugeridos?: LoteProducto[];
  }>;
  
  // Sugerencias
  sugerencias: string[];
  acciones_recomendadas: Array<{
    accion: string;
    descripcion: string;
    critica: boolean;
  }>;
  
  // Impacto del movimiento
  impacto: {
    afecta_stock_minimo: boolean;
    genera_stock_negativo: boolean;
    productos_afectados: number;
    valor_total_movimiento: number;
    cambio_valor_inventario: number;
  };
  
  // Información adicional
  tiempo_validacion_ms: number;
  fecha_validacion: string;
  configuracion_aplicada: string;
}

// =======================================================
// INTERFACES DE CONFIGURACIÓN EXTENDIDA
// =======================================================

/**
 * Configuración específica de tipos de movimiento
 */
export interface ConfiguracionTipoMovimiento {
  id: number;
  tipo: TipoMovimiento;
  nombre: string;
  codigo: string;
  
  // Comportamiento
  afecta_stock: boolean;
  incrementa_stock: boolean;
  requiere_autorizacion: boolean;
  permite_lotes_vencidos: boolean;
  requiere_documento: boolean;
  requiere_proveedor: boolean;
  requiere_cliente: boolean;
  
  // Validaciones
  valida_stock_disponible: boolean;
  permite_stock_negativo: boolean;
  requiere_ubicacion: boolean;
  requiere_lote: boolean;
  requiere_fecha_vencimiento: boolean;
  
  // Límites
  limite_valor_sin_autorizacion?: number;
  limite_cantidad_sin_autorizacion?: number;
  
  // Configuración adicional
  genera_alerta: boolean;
  actualiza_costo_promedio: boolean;
  visible_pos: boolean;
  activo: boolean;
  
  // Auditoría
  fecha_creacion: string;
  usuario_creacion: number;
}

// =======================================================
// INTERFACE CORREGIDA PARA VALORACIÓN
// =======================================================

/**
 * Valoración de inventario (nombre corregido para compatibilidad)
 */
export interface ValoracionInventario {
  id?: number;
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  almacen_id: number;
  almacen_nombre?: string;
  
  // Stock
  stock_actual: number;
  stock_disponible: number;
  stock_reservado: number;
  
  // Método PEPS
  costo_peps: number;
  valor_peps: number;
  
  // Promedio ponderado
  costo_promedio: number;
  valor_promedio: number;
  
  // Última compra
  costo_ultima_compra: number;
  valor_ultima_compra: number;
  fecha_ultima_compra?: string;
  
  // Precio de venta
  precio_venta_actual: number;
  margen_utilidad: number;
  margen_porcentaje: number;
  
  // Rotación
  movimientos_ultimos_30_dias: number;
  salidas_ultimos_30_dias: number;
  rotacion_mensual: number;
  
  // Fechas y control
  fecha_calculo: string;
  metodo_valuacion: 'PEPS' | 'PROMEDIO' | 'UEPS' | 'ESTANDAR';
  incluye_gastos_adicionales: boolean;
  
  // Lotes (si aplica)
  total_lotes?: number;
  lotes_detalle?: Array<{
    lote: string;
    stock: number;
    costo_unitario: number;
    valor_lote: number;
    fecha_vencimiento?: string;
  }>;
}

// =======================================================
// TYPES AUXILIARES EXTENDIDOS
// =======================================================

/**
 * Parámetros para consultas de inventario
 */
export interface ParametrosConsultaInventario {
  almacen_id?: number;
  categoria_id?: number;
  producto_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  incluir_inactivos?: boolean;
  incluir_sin_stock?: boolean;
  solo_con_lotes?: boolean;
  solo_vencidos?: boolean;
  metodo_valuacion?: 'PEPS' | 'PROMEDIO' | 'UEPS' | 'ESTANDAR';
}

/**
 * Resultado de operación de inventario
 */
export interface ResultadoOperacionInventario {
  exito: boolean;
  mensaje: string;
  codigo_operacion?: string;
  
  // IDs generados
  movimiento_id?: number;
  transferencia_id?: number;
  ajuste_id?: number;
  
  // Resumen de cambios
  productos_afectados: number;
  valor_total_cambio: number;
  stock_anterior: Record<number, number>; // producto_id -> stock
  stock_nuevo: Record<number, number>;    // producto_id -> stock
  
  // Alertas generadas
  alertas_generadas: string[];
  
  // Datos adicionales
  tiempo_procesamiento_ms: number;
  usuario_procesamiento: number;
  fecha_procesamiento: string;
  
  // Errores y advertencias
  errores: string[];
  advertencias: string[];
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default {
   DetalleMovimiento,
  FormularioMovimiento,
  LoteProducto,
  EstadisticasInventario,
  ValidacionMovimiento,
  ConfiguracionTipoMovimiento,
  ValoracionInventario,
  ParametrosConsultaInventario,
  ResultadoOperacionInventario,
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