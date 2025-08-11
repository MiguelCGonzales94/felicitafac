/**
 * Types Producto - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Tipos específicos para gestión de productos e inventario
 */

// =======================================================
// TIPOS BÁSICOS DE PRODUCTO
// =======================================================

export type TipoProducto = 'bien' | 'servicio' | 'combo';
export type EstadoProducto = 'activo' | 'inactivo' | 'descontinuado';
export type UnidadMedidaSunat = 'NIU' | 'KGM' | 'MTR' | 'LTR' | 'H87' | 'BX' | 'PK' | 'SET' | 'ZZ';
export type MetodoValuacion = 'PEPS' | 'PROMEDIO' | 'UEPS';
export type TipoImpuesto = 'gravado' | 'exonerado' | 'inafecto' | 'exportacion';

// =======================================================
// INTERFACE PRINCIPAL DE PRODUCTO
// =======================================================

export interface Producto {
  id: number;
  codigo: string;
  codigo_barras?: string;
  codigo_fabricante?: string;
  codigo_proveedor?: string;
  
  // Información básica
  nombre: string;
  descripcion?: string;
  descripcion_corta?: string;
  marca?: string;
  modelo?: string;
  
  // Categorización
  categoria_id?: number;
  categoria_nombre?: string;
  tipo_producto_id: number;
  tipo_producto: TipoProductoDetalle;
  
  // Medidas y especificaciones
  unidad_medida: UnidadMedidaSunat;
  unidad_medida_nombre: string;
  peso?: number;
  volumen?: number;
  dimensiones?: string;
  
  // Precios
  precio_compra?: number;
  precio_venta: number;
  precio_minimo?: number;
  precio_mayorista?: number;
  margen_utilidad?: number;
  moneda: string;
  
  // Impuestos
  afecto_igv: boolean;
  afecto_isc: boolean;
  afecto_icbper: boolean;
  tipo_afectacion_igv: string;
  porcentaje_isc?: number;
  
  // Control de stock
  controla_stock: boolean;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo?: number;
  punto_reorden?: number;
  ubicacion_almacen?: string;
  
  // Lotes y vencimientos
  requiere_lote: boolean;
  requiere_serie: boolean;
  requiere_vencimiento: boolean;
  dias_vencimiento?: number;
  
  // Estado y configuración
  estado: EstadoProducto;
  visible_catalogo: boolean;
  permite_decimales: boolean;
  producto_estrella: boolean;
  
  // Información adicional
  notas?: string;
  especificaciones_tecnicas?: string;
  garantia_meses?: number;
  proveedor_principal_id?: number;
  proveedor_principal_nombre?: string;
  
  // URLs y archivos
  imagen_principal?: string;
  imagenes_adicionales?: string[];
  hoja_datos_url?: string;
  manual_url?: string;
  
  // Metadatos
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_creacion: number;
  activo: boolean;
  
  // Estadísticas
  total_vendido?: number;
  ingresos_totales?: number;
  ultima_venta?: string;
  ultima_compra?: string;
  rotacion_inventario?: number;
}

// =======================================================
// INTERFACES RELACIONADAS
// =======================================================

export interface TipoProductoDetalle {
  id: number;
  codigo: string;
  nombre: string;
  tipo: TipoProducto;
  unidad_medida_sunat: UnidadMedidaSunat;
  controla_stock: boolean;
  permite_decimales: boolean;
  requiere_lote: boolean;
  requiere_vencimiento: boolean;
  activo: boolean;
}

export interface CategoriaProducto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria_padre_id?: number;
  categoria_padre_nombre?: string;
  nivel: number;
  ruta_completa: string;
  imagen?: string;
  activo: boolean;
  total_productos: number;
}

export interface MarcaProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  logo?: string;
  activo: boolean;
  total_productos: number;
}

// =======================================================
// INTERFACES PARA FORMULARIOS
// =======================================================

export interface FormularioProducto {
  // Códigos
  codigo?: string;
  codigo_barras?: string;
  codigo_fabricante?: string;
  codigo_proveedor?: string;
  
  // Información básica
  nombre: string;
  descripcion?: string;
  descripcion_corta?: string;
  marca?: string;
  modelo?: string;
  
  // Categorización
  categoria_id?: number;
  tipo_producto_id: number;
  
  // Medidas
  unidad_medida: UnidadMedidaSunat;
  peso?: number;
  volumen?: number;
  dimensiones?: string;
  
  // Precios
  precio_compra?: number;
  precio_venta: number;
  precio_minimo?: number;
  precio_mayorista?: number;
  margen_utilidad?: number;
  moneda?: string;
  
  // Impuestos
  afecto_igv?: boolean;
  afecto_isc?: boolean;
  afecto_icbper?: boolean;
  porcentaje_isc?: number;
  
  // Stock
  controla_stock?: boolean;
  stock_inicial?: number;
  stock_minimo?: number;
  stock_maximo?: number;
  punto_reorden?: number;
  ubicacion_almacen?: string;
  
  // Configuración
  requiere_lote?: boolean;
  requiere_serie?: boolean;
  requiere_vencimiento?: boolean;
  dias_vencimiento?: number;
  visible_catalogo?: boolean;
  permite_decimales?: boolean;
  producto_estrella?: boolean;
  
  // Adicionales
  notas?: string;
  especificaciones_tecnicas?: string;
  garantia_meses?: number;
  proveedor_principal_id?: number;
}

export interface FormularioProductoRapido {
  codigo?: string;
  nombre: string;
  precio_venta: number;
  afecto_igv?: boolean;
  controla_stock?: boolean;
  stock_inicial?: number;
}

// =======================================================
// INTERFACES DE CONSULTA Y FILTROS
// =======================================================

export interface FiltrosProducto {
  busqueda?: string;
  categoria_id?: number;
  tipo_producto_id?: number;
  marca?: string;
  estado?: EstadoProducto;
  afecto_igv?: boolean;
  controla_stock?: boolean;
  con_stock?: boolean;
  sin_stock?: boolean;
  stock_bajo?: boolean;
  precio_min?: number;
  precio_max?: number;
  producto_estrella?: boolean;
  fecha_creacion_desde?: string;
  fecha_creacion_hasta?: string;
  proveedor_id?: number;
}

export interface ParametrosBusquedaProducto {
  termino?: string;
  filtros?: FiltrosProducto;
  orden_por?: 'nombre' | 'codigo' | 'precio' | 'stock' | 'fecha_creacion' | 'total_vendido';
  direccion_orden?: 'asc' | 'desc';
  pagina?: number;
  tamaño_pagina?: number;
  incluir_inactivos?: boolean;
}

// =======================================================
// INTERFACES DE RESPUESTA
// =======================================================

export interface ResumenProducto {
  id: number;
  codigo: string;
  codigo_barras?: string;
  nombre: string;
  descripcion_corta?: string;
  categoria_nombre?: string;
  precio_venta: number;
  moneda: string;
  stock_actual: number;
  stock_minimo: number;
  estado: EstadoProducto;
  afecto_igv: boolean;
  controla_stock: boolean;
  imagen_principal?: string;
  producto_estrella: boolean;
}

export interface ListaProductosResponse {
  resultados: ResumenProducto[];
  total: number;
  pagina: number;
  total_paginas: number;
  tamaño_pagina: number;
  resumen_filtros: ResumenFiltrosProducto;
}

export interface ResumenFiltrosProducto {
  total_productos: number;
  total_con_stock: number;
  total_sin_stock: number;
  total_stock_bajo: number;
  valor_total_inventario: number;
  promedio_precio_venta: number;
}

export interface DetalleProductoResponse {
  producto: Producto;
  estadisticas: EstadisticasProducto;
  movimientos_recientes: MovimientoInventarioResumen[];
  precios_historia: HistorialPrecioProducto[];
  proveedores: ProveedorProducto[];
}

// =======================================================
// INTERFACES DE ESTADÍSTICAS
// =======================================================

export interface EstadisticasProducto {
  // Ventas
  total_vendido: number;
  cantidad_vendida_mes: number;
  cantidad_vendida_año: number;
  ingresos_totales: number;
  ingresos_mes_actual: number;
  ingresos_año_actual: number;
  
  // Fechas importantes
  primera_venta?: string;
  ultima_venta?: string;
  ultima_compra?: string;
  dias_sin_movimiento: number;
  
  // Inventario
  rotacion_inventario: number;
  dias_inventario: number;
  valor_stock_actual: number;
  costo_promedio: number;
  
  // Comparativas
  ranking_ventas: number;
  porcentaje_total_ventas: number;
  variacion_precio_mes: number;
  variacion_stock_mes: number;
}

export interface MovimientoInventarioResumen {
  id: number;
  fecha: string;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste' | 'transferencia';
  motivo: string;
  documento_referencia?: string;
  cantidad: number;
  precio_unitario?: number;
  stock_anterior: number;
  stock_posterior: number;
  usuario: string;
}

export interface HistorialPrecioProducto {
  id: number;
  fecha_cambio: string;
  precio_anterior: number;
  precio_nuevo: number;
  motivo: string;
  usuario: string;
  vigencia_desde: string;
  vigencia_hasta?: string;
}

export interface ProveedorProducto {
  id: number;
  proveedor_id: number;
  proveedor_nombre: string;
  codigo_proveedor?: string;
  precio_compra: number;
  tiempo_entrega_dias: number;
  cantidad_minima_pedido: number;
  es_principal: boolean;
  activo: boolean;
}

// =======================================================
// INTERFACES DE PRECIOS
// =======================================================

export interface PrecioProducto {
  id: number;
  tipo_precio: 'venta' | 'mayorista' | 'especial' | 'promocional';
  precio: number;
  moneda: string;
  cantidad_minima?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  cliente_especifico_id?: number;
  activo: boolean;
}

export interface CalculoPrecio {
  precio_base: number;
  descuentos: DescuentoAplicado[];
  recargos: RecargoAplicado[];
  precio_final: number;
  igv: number;
  precio_con_igv: number;
}

export interface DescuentoAplicado {
  tipo: 'porcentaje' | 'monto';
  valor: number;
  descripcion: string;
  monto_descuento: number;
}

export interface RecargoAplicado {
  tipo: 'porcentaje' | 'monto';
  valor: number;
  descripcion: string;
  monto_recargo: number;
}

// =======================================================
// INTERFACES DE VALIDACIÓN
// =======================================================

export interface ValidacionProducto {
  codigo: {
    valido: boolean;
    mensaje?: string;
    disponible?: boolean;
  };
  nombre: {
    valido: boolean;
    mensaje?: string;
  };
  precios: {
    valido: boolean;
    mensajes?: string[];
  };
  stock: {
    valido: boolean;
    mensajes?: string[];
  };
  configuracion: {
    valido: boolean;
    mensajes?: string[];
  };
}

export interface ErroresFormularioProducto {
  codigo?: string;
  nombre?: string;
  precio_venta?: string;
  precio_compra?: string;
  categoria_id?: string;
  tipo_producto_id?: string;
  stock_minimo?: string;
  stock_maximo?: string;
  margen_utilidad?: string;
  general?: string;
}

// =======================================================
// INTERFACES DE COMBOS Y KITS
// =======================================================

export interface ComponenteCombo {
  id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  obligatorio: boolean;
  orden: number;
}

export interface ProductoCombo extends Producto {
  componentes: ComponenteCombo[];
  precio_componentes: number;
  margen_combo: number;
  permite_personalizar: boolean;
}

// =======================================================
// INTERFACES DE CÓDIGOS DE BARRAS
// =======================================================

export interface CodigoBarras {
  id: number;
  producto_id: number;
  codigo: string;
  tipo: 'EAN13' | 'EAN8' | 'CODE128' | 'CODE39' | 'UPC';
  principal: boolean;
  activo: boolean;
  fecha_creacion: string;
}

export interface GeneracionCodigoBarras {
  tipo: 'automatico' | 'manual' | 'importado';
  formato: 'EAN13' | 'EAN8' | 'CODE128';
  prefijo?: string;
  incluir_verificador: boolean;
}

// =======================================================
// INTERFACES DE IMPORTACIÓN/EXPORTACIÓN
// =======================================================

export interface ProductoImportacion {
  fila: number;
  codigo?: string;
  nombre: string;
  precio_venta: number;
  categoria?: string;
  stock_inicial?: number;
  valido: boolean;
  errores: string[];
}

export interface ResultadoImportacionProductos {
  total_procesados: number;
  total_importados: number;
  total_errores: number;
  productos_importados: Producto[];
  errores: ProductoImportacion[];
}

export interface OpcionesExportacionProductos {
  formato: 'excel' | 'csv' | 'pdf' | 'xml';
  filtros?: FiltrosProducto;
  campos?: string[];
  incluir_stock?: boolean;
  incluir_precios?: boolean;
  incluir_estadisticas?: boolean;
  incluir_imagenes?: boolean;
}

// =======================================================
// INTERFACES DE CONFIGURACIÓN
// =======================================================

export interface ConfiguracionProductos {
  codigo_auto_generar: boolean;
  prefijo_codigo: string;
  longitud_codigo: number;
  codigo_secuencial: boolean;
  
  precio_incluye_igv: boolean;
  moneda_default: string;
  margen_utilidad_default: number;
  
  controla_stock_default: boolean;
  metodo_valuacion: MetodoValuacion;
  alerta_stock_bajo: boolean;
  
  requiere_imagen: boolean;
  tamaño_maximo_imagen_mb: number;
  formatos_imagen_permitidos: string[];
  
  permitir_precios_negativos: boolean;
  permitir_stock_negativo: boolean;
  validar_codigo_barras: boolean;
}

// =======================================================
// TYPES AUXILIARES
// =======================================================

export type CamposObligatoriosProducto = 'nombre' | 'precio_venta' | 'tipo_producto_id';
export type CamposOpcionalesProducto = Exclude<keyof FormularioProducto, CamposObligatoriosProducto>;

export type OrdenProductoPor = 
  | 'nombre_asc' | 'nombre_desc'
  | 'codigo_asc' | 'codigo_desc'
  | 'precio_asc' | 'precio_desc'
  | 'stock_asc' | 'stock_desc'
  | 'fecha_creacion_asc' | 'fecha_creacion_desc'
  | 'total_vendido_asc' | 'total_vendido_desc';

export type EstadoStock = 'disponible' | 'bajo' | 'agotado' | 'exceso';

// =======================================================
// INTERFACES DE CONTEXTO
// =======================================================

export interface ContextoProductos {
  productos: ResumenProducto[];
  producto_seleccionado?: Producto;
  categorias: CategoriaProducto[];
  tipos_producto: TipoProductoDetalle[];
  marcas: MarcaProducto[];
  filtros: FiltrosProducto;
  loading: boolean;
  error?: string;
  total: number;
  pagina: number;
  total_paginas: number;
  resumen_filtros: ResumenFiltrosProducto;
}

export interface ProductoCompleto extends Producto {
  estadisticas: EstadisticasProducto;
  movimientos_recientes: MovimientoInventarioResumen[];
  precios_historia: HistorialPrecioProducto[];
  proveedores: ProveedorProducto[];
  componentes?: ComponenteCombo[];
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default {
  Producto,
  FormularioProducto,
  FormularioProductoRapido,
  ResumenProducto,
  EstadisticasProducto,
  CategoriaProducto,
  TipoProductoDetalle,
  FiltrosProducto,
  ParametrosBusquedaProducto,
  ValidacionProducto,
  ErroresFormularioProducto,
  ConfiguracionProductos,
  ProductoCompleto,
  ContextoProductos
};