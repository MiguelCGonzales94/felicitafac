/**
 * Types para Producto - FELICITAFAC Frontend
 */

export interface TipoProducto {
  id: number;
  codigo: string;
  nombre: string;
  tipo: 'bien' | 'servicio' | 'combo';
  unidad_medida_sunat: string;
  controla_stock: boolean;
  permite_decimales: boolean;
  requiere_lote: boolean;
  requiere_vencimiento: boolean;
  cantidad_productos?: number;
  activo: boolean;
}

export interface Categoria {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria_padre?: number;
  categoria_padre_nombre?: string;
  subcategorias?: Categoria[];
  ruta_completa?: string;
  orden: number;
  margen_utilidad_defecto: number;
  cuenta_contable_ventas?: string;
  cuenta_contable_inventario?: string;
  cantidad_productos?: number;
  activo: boolean;
}

export interface ProductoProveedor {
  id?: number;
  proveedor: number;
  proveedor_nombre?: string;
  proveedor_documento?: string;
  codigo_proveedor: string;
  precio_compra: number;
  tiempo_entrega_dias: number;
  cantidad_minima: number;
  es_principal: boolean;
  fecha_ultimo_precio?: string;
  notas?: string;
  activo?: boolean;
}

export interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_producto: number;
  tipo_producto_info?: TipoProducto;
  categoria: number;
  categoria_info?: Categoria;
  
  // Códigos adicionales
  codigo_barras?: string;
  codigo_interno?: string;
  codigo_proveedor?: string;
  codigo_producto_sunat?: string;
  tipo_afectacion_igv: string;
  
  // Precios
  precio_compra: number;
  precio_venta: number;
  precio_venta_con_igv?: number;
  margen_utilidad?: number;
  margen_utilidad_calculado?: number;
  
  // Inventario
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  punto_reorden: number;
  disponibilidad?: {
    disponible: boolean;
    mensaje: string;
    stock_actual: number;
  };
  necesita_reorden_info?: {
    necesita_reorden: boolean;
    punto_reorden: number;
    stock_minimo: number;
  };
  estado_stock?: 'NO_CONTROLA' | 'AGOTADO' | 'CRITICO' | 'BAJO' | 'NORMAL' | 'EXCESO';
  valor_inventario_actual?: number;
  
  // Unidades
  unidad_medida: string;
  unidad_medida_sunat: string;
  peso?: number;
  volumen?: number;
  
  // Configuraciones
  permite_venta: boolean;
  permite_compra: boolean;
  controla_stock: boolean;
  permite_descuento: boolean;
  descuento_maximo: number;
  
  // Información adicional
  marca?: string;
  modelo?: string;
  color?: string;
  talla?: string;
  fecha_vencimiento?: string;
  fecha_ultima_compra?: string;
  fecha_ultima_venta?: string;
  dias_sin_venta?: number;
  
  // Contabilidad
  cuenta_contable_ventas?: string;
  cuenta_contable_compras?: string;
  cuenta_contable_inventario?: string;
  
  // Estadísticas
  total_vendido: number;
  total_comprado: number;
  monto_total_ventas: number;
  numero_ventas: number;
  rotacion_inventario?: number;
  
  // Relacionados
  proveedores?: ProductoProveedor[];
  datos_facturacion?: any;
  
  // Auditoría
  activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface ProductoListItem {
  id: number;
  codigo: string;
  nombre: string;
  tipo_producto_nombre?: string;
  categoria_nombre?: string;
  precio_venta: number;
  precio_venta_con_igv: number;
  stock_actual: number;
  estado_stock: string;
  disponibilidad_simple: boolean;
  permite_venta: boolean;
  controla_stock: boolean;
  activo: boolean;
}

export interface ProductoFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_producto: number;
  categoria: number;
  codigo_barras?: string;
  codigo_interno?: string;
  precio_compra: number;
  precio_venta: number;
  stock_actual?: number;
  stock_minimo: number;
  stock_maximo: number;
  punto_reorden: number;
  unidad_medida: string;
  permite_venta: boolean;
  permite_compra: boolean;
  controla_stock: boolean;
  permite_descuento: boolean;
  descuento_maximo: number;
  marca?: string;
  modelo?: string;
  proveedores_data?: Omit<ProductoProveedor, 'id'>[];
}

export interface ProductoBusqueda {
  termino?: string;
  tipo_producto?: number;
  categoria?: number;
  marca?: string;
  permite_venta?: boolean;
  controla_stock?: boolean;
  estado_stock?: 'agotado' | 'critico' | 'bajo' | 'normal' | 'exceso';
  precio_minimo?: number;
  precio_maximo?: number;
  con_vencimiento?: boolean;
  sin_movimiento_dias?: number;
}

export interface EstadisticasProducto {
  total_productos: number;
  productos_activos: number;
  productos_agotados: number;
  productos_criticos: number;
  productos_sin_movimiento: number;
  valor_total_inventario: number;
  productos_mas_vendidos: ProductoListItem[];
  productos_menos_vendidos: ProductoListItem[];
  por_categoria: Record<string, number>;
  por_tipo_producto: Record<string, number>;
  por_marca: Record<string, number>;
  rotacion_promedio: number;
  margen_promedio: number;
}

export interface MovimientoStock {
  producto: number;
  cantidad: number;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste';
  motivo: string;
  costo_unitario?: number;
}

export interface ProductoApiResponse {
  count: number;
  next?: string;
  previous?: string;
  results: ProductoListItem[];
}

export interface AlertasStock {
  productos_agotados: ProductoListItem[];
  productos_criticos: ProductoListItem[];
  productos_reorden: ProductoListItem[];
  resumen: {
    total_agotados: number;
    total_criticos: number;
    total_reorden: number;
    total_alertas: number;
  };
}

// Enums y constantes
export const TIPOS_AFECTACION_IGV = {
  GRAVADO: '10',
  EXONERADO: '20',
  INAFECTO: '30',
  EXPORTACION: '40'
} as const;

export const ESTADOS_STOCK = {
  NO_CONTROLA: 'NO_CONTROLA',
  AGOTADO: 'AGOTADO',
  CRITICO: 'CRITICO',
  BAJO: 'BAJO',
  NORMAL: 'NORMAL',
  EXCESO: 'EXCESO'
} as const;

export const UNIDADES_SUNAT = {
  UNIDAD: 'NIU',
  KILOGRAMO: 'KGM',
  METRO: 'MTR',
  LITRO: 'LTR',
  PIEZA: 'H87',
  CAJA: 'BX',
  PAQUETE: 'PK',
  SERVICIO: 'ZZ'
} as const;

export type TipoAfectacionIGV = typeof TIPOS_AFECTACION_IGV[keyof typeof TIPOS_AFECTACION_IGV];
export type EstadoStock = typeof ESTADOS_STOCK[keyof typeof ESTADOS_STOCK];
export type UnidadSunat = typeof UNIDADES_SUNAT[keyof typeof UNIDADES_SUNAT];