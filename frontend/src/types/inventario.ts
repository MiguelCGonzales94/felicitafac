/**
 * Types para Inventario - FELICITAFAC Frontend
 */

export interface TipoMovimiento {
  id: number;
  codigo: string;
  nombre: string;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'transferencia';
  categoria: 'compra' | 'venta' | 'devolucion_compra' | 'devolucion_venta' | 'ajuste_positivo' | 'ajuste_negativo' | 'transferencia_entrada' | 'transferencia_salida' | 'inventario_inicial' | 'merma' | 'robo' | 'vencimiento' | 'produccion' | 'consumo_interno';
  afecta_costo: boolean;
  requiere_autorizacion: boolean;
  genera_documento: boolean;
  cuenta_contable_debe?: string;
  cuenta_contable_haber?: string;
  orden: number;
  activo: boolean;
}

export interface Almacen {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  sucursal: number;
  sucursal_nombre?: string;
  direccion?: string;
  responsable?: number;
  responsable_nombre?: string;
  capacidad_maxima?: number;
  unidad_capacidad: string;
  es_principal: boolean;
  permite_ventas: boolean;
  permite_compras: boolean;
  controla_ubicaciones: boolean;
  temperatura_min?: number;
  temperatura_max?: number;
  humedad_min?: number;
  humedad_max?: number;
  activo: boolean;
}

export interface StockProducto {
  id: number;
  producto: number;
  producto_info?: {
    codigo: string;
    nombre: string;
    stock_minimo: number;
  };
  almacen: number;
  almacen_nombre?: string;
  cantidad_actual: number;
  cantidad_reservada: number;
  cantidad_disponible: number;
  costo_promedio: number;
  valor_inventario: number;
  fecha_ultimo_movimiento?: string;
  fecha_ultimo_ingreso?: string;
  fecha_ultima_salida?: string;
  ubicacion?: string;
  pasillo?: string;
  estante?: string;
  nivel?: string;
  activo?: boolean;
}

export interface LoteProducto {
  id: number;
  producto: number;
  producto_codigo?: string;
  almacen: number;
  almacen_nombre?: string;
  numero_lote: string;
  fecha_ingreso: string;
  fecha_vencimiento?: string;
  dias_vencimiento?: number;
  cantidad_inicial: number;
  cantidad_actual: number;
  costo_unitario: number;
  valor_total?: number;
  proveedor?: number;
  documento_origen?: string;
  observaciones?: string;
  estado_calidad: 'bueno' | 'regular' | 'malo' | 'vencido' | 'cuarentena';
  temperatura_almacenamiento?: number;
  humedad_almacenamiento?: number;
  activo?: boolean;
}

export interface DetalleMovimiento {
  id?: number;
  numero_item: number;
  producto: number;
  producto_info?: {
    codigo: string;
    nombre: string;
  };
  cantidad: number;
  costo_unitario: number;
  valor_total?: number;
  lote?: number;
  numero_lote_entrada?: string;
  fecha_vencimiento_entrada?: string;
  observaciones?: string;
  ejecutado?: boolean;
  fecha_ejecucion?: string;
  activo?: boolean;
}

export interface MovimientoInventario {
  id?: number;
  uuid?: string;
  numero?: string;
  tipo_movimiento: number;
  tipo_movimiento_info?: TipoMovimiento;
  almacen: number;
  almacen_nombre?: string;
  fecha_movimiento: string;
  estado: 'borrador' | 'pendiente' | 'autorizado' | 'ejecutado' | 'anulado';
  usuario_creacion?: number;
  usuario_nombre?: string;
  usuario_autorizacion?: number;
  fecha_autorizacion?: string;
  observaciones?: string;
  motivo?: string;
  total_items?: number;
  total_cantidad?: number;
  total_valor?: number;
  documento_origen?: string;
  documento_electronico?: number;
  proveedor_cliente?: number;
  detalles?: DetalleMovimiento[];
  activo?: boolean;
}

export interface MovimientoFormData {
  tipo_movimiento: number;
  almacen: number;
  fecha_movimiento: string;
  observaciones?: string;
  motivo?: string;
  detalles_data: Omit<DetalleMovimiento, 'id'>[];
}

export interface ReporteInventario {
  total_productos: number;
  valor_total_inventario: number;
  productos_agotados: number;
  productos_criticos: number;
  movimientos_mes: number;
  top_productos_stock: StockProducto[];
  productos_vencimiento_proximo: LoteProducto[];
  por_almacen: Record<string, { total_productos: number; valor_total: number }>;
  por_categoria: Record<string, { total_productos: number; valor_total: number }>;
}

export interface AlertasInventario {
  productos_agotados: StockProducto[];
  productos_criticos: StockProducto[];
  total_alertas: number;
}

export interface InventarioValorizado {
  por_almacen: Array<{
    almacen__nombre: string;
    total_productos: number;
    valor_total: number;
  }>;
  por_categoria: Array<{
    producto__categoria__nombre: string;
    total_productos: number;
    valor_total: number;
  }>;
  totales: {
    total_productos: number;
    valor_total: number;
    costo_promedio: number;
  };
}

export interface LotesVencimiento {
  lotes: LoteProducto[];
  total: number;
  valor_total: number;
}

export interface MovimientoBusqueda {
  tipo_movimiento?: number;
  almacen?: number;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  usuario_creacion?: number;
}

export interface ReporteMovimientos {
  periodo: { desde: string; hasta: string };
  total_movimientos: number;
  por_tipo: Array<{
    tipo_movimiento__nombre: string;
    cantidad: number;
    valor_total: number;
  }>;
  entradas: { cantidad: number; valor: number };
  salidas: { cantidad: number; valor: number };
  saldo: number;
}

export interface MovimientoApiResponse {
  count: number;
  next?: string;
  previous?: string;
  results: MovimientoInventario[];
}

export interface StockApiResponse {
  count: number;
  next?: string;
  previous?: string;
  results: StockProducto[];
}

export interface LoteApiResponse {
  count: number;
  next?: string;
  previous?: string;
  results: LoteProducto[];
}

// Enums y constantes
export const TIPOS_MOVIMIENTO = {
  ENTRADA: 'entrada',
  SALIDA: 'salida',
  AJUSTE: 'ajuste',
  TRANSFERENCIA: 'transferencia'
} as const;

export const ESTADOS_MOVIMIENTO = {
  BORRADOR: 'borrador',
  PENDIENTE: 'pendiente',
  AUTORIZADO: 'autorizado',
  EJECUTADO: 'ejecutado',
  ANULADO: 'anulado'
} as const;

export const ESTADOS_CALIDAD = {
  BUENO: 'bueno',
  REGULAR: 'regular',
  MALO: 'malo',
  VENCIDO: 'vencido',
  CUARENTENA: 'cuarentena'
} as const;

export const CATEGORIAS_MOVIMIENTO = {
  COMPRA: 'compra',
  VENTA: 'venta',
  DEVOLUCION_COMPRA: 'devolucion_compra',
  DEVOLUCION_VENTA: 'devolucion_venta',
  AJUSTE_POSITIVO: 'ajuste_positivo',
  AJUSTE_NEGATIVO: 'ajuste_negativo',
  TRANSFERENCIA_ENTRADA: 'transferencia_entrada',
  TRANSFERENCIA_SALIDA: 'transferencia_salida',
  INVENTARIO_INICIAL: 'inventario_inicial',
  MERMA: 'merma',
  ROBO: 'robo',
  VENCIMIENTO: 'vencimiento',
  PRODUCCION: 'produccion',
  CONSUMO_INTERNO: 'consumo_interno'
} as const;

export type TipoMovimientoEnum = typeof TIPOS_MOVIMIENTO[keyof typeof TIPOS_MOVIMIENTO];
export type EstadoMovimiento = typeof ESTADOS_MOVIMIENTO[keyof typeof ESTADOS_MOVIMIENTO];
export type EstadoCalidad = typeof ESTADOS_CALIDAD[keyof typeof ESTADOS_CALIDAD];
export type CategoriaMovimiento = typeof CATEGORIAS_MOVIMIENTO[keyof typeof CATEGORIAS_MOVIMIENTO];