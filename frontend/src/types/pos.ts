/**
 * Types POS - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Tipos específicos para Punto de Venta (Point of Sale)
 */

import { Cliente } from './cliente';
import { Producto } from './producto';
import { Usuario } from './usuario';

// =======================================================
// TIPOS BÁSICOS DE POS
// =======================================================

export type TipoDocumentoPOS = '01' | '03' | '07' | '08'; // Factura, Boleta, Nota Crédito, Nota Débito
export type EstadoVentaPOS = 'activa' | 'pausada' | 'finalizada' | 'anulada';
export type MetodoPagoPOS = 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'yape' | 'plin' | 'mixto';
export type EstadoCajaPOS = 'cerrada' | 'abierta' | 'en_proceso_cierre';
export type TipoMovimientoCaja = 'apertura' | 'venta' | 'devolucion' | 'ingreso' | 'egreso' | 'cierre';

// =======================================================
// INTERFACES PRINCIPALES DE VENTA
// =======================================================

export interface VentaPOS {
  id?: number;
  numero_venta: string;
  fecha_venta: string;
  hora_venta: string;
  
  // Cliente
  cliente?: Cliente;
  cliente_ocasional: boolean;
  
  // Documento
  tipo_documento: TipoDocumentoPOS;
  serie: string;
  correlativo?: number;
  numero_documento?: string;
  
  // Items
  items: ItemVentaPOS[];
  total_items: number;
  
  // Cálculos
  subtotal: number;
  descuento_global: number;
  descuento_porcentaje: number;
  total_igv: number;
  total_sin_igv: number;
  total_gravado: number;
  total_exonerado: number;
  total_inafecto: number;
  total_gratuito: number;
  total_descuentos: number;
  total_general: number;
  redondeo: number;
  
  // Pago
  metodos_pago: MetodoPagoPOS[];
  total_pagado: number;
  vuelto: number;
  
  // Estado y control
  estado: EstadoVentaPOS;
  observaciones?: string;
  notas_internas?: string;
  impreso: boolean;
  enviado_sunat: boolean;
  
  // Referencias
  venta_original_id?: number; // Para notas de crédito/débito
  motivo_nota?: string;
  
  // Usuario y caja
  usuario_id: number;
  usuario_nombre: string;
  caja_id: number;
  turno_caja_id: number;
  
  // Metadatos
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface ItemVentaPOS {
  id?: number;
  venta_id?: number;
  
  // Producto
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  producto_descripcion?: string;
  
  // Cantidad y precios
  cantidad: number;
  precio_unitario: number;
  precio_original: number;
  descuento_unitario: number;
  descuento_porcentaje: number;
  
  // Cálculos
  subtotal_sin_descuento: number;
  total_descuento: number;
  subtotal_con_descuento: number;
  
  // Impuestos
  afecto_igv: boolean;
  porcentaje_igv: number;
  monto_igv: number;
  codigo_afectacion_igv: string;
  
  // Totales
  valor_venta: number; // Sin IGV
  precio_venta: number; // Con IGV
  total_item: number;
  
  // Control de inventario
  controla_stock: boolean;
  stock_disponible?: number;
  lote?: string;
  fecha_vencimiento?: string;
  
  // Configuración
  permite_modificar: boolean;
  es_promocion: boolean;
  es_bonificacion: boolean;
  
  // Metadatos
  orden: number;
  observaciones?: string;
}

// =======================================================
// INTERFACES DE MÉTODOS DE PAGO
// =======================================================

export interface MetodoPagoPOS {
  id?: string;
  tipo: MetodoPagoPOS;
  monto: number;
  referencia?: string;
  numero_tarjeta?: string; // Últimos 4 dígitos
  numero_autorizacion?: string;
  banco?: string;
  numero_operacion?: string;
  fecha_operacion?: string;
  comprobante_pago?: string;
  validado: boolean;
  observaciones?: string;
}

export interface ConfiguracionMetodosPago {
  efectivo: {
    habilitado: boolean;
    requiere_validacion_monto: boolean;
    monto_maximo_sin_autorizacion: number;
    calcular_vuelto_automatico: boolean;
    denominaciones_disponibles: number[];
  };
  tarjeta_credito: {
    habilitado: boolean;
    requiere_autorizacion: boolean;
    terminales_disponibles: string[];
    comision_porcentaje: number;
    tiempo_expiracion_segundos: number;
  };
  tarjeta_debito: {
    habilitado: boolean;
    requiere_pin: boolean;
    terminales_disponibles: string[];
    comision_fija: number;
  };
  transferencia: {
    habilitado: boolean;
    cuentas_disponibles: CuentaBancaria[];
    requiere_comprobante: boolean;
    validacion_automatica: boolean;
  };
  billeteras_digitales: {
    yape: { habilitado: boolean; numero_destino: string; qr_code?: string };
    plin: { habilitado: boolean; numero_destino: string; qr_code?: string };
    otros: { habilitado: boolean; configuraciones: any[] };
  };
}

export interface CuentaBancaria {
  id: string;
  banco: string;
  numero_cuenta: string;
  cci: string;
  moneda: string;
  titular: string;
  activa: boolean;
}

// =======================================================
// INTERFACES DE CAJA
// =======================================================

export interface CajaPOS {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  
  // Ubicación
  sucursal_id?: number;
  sucursal_nombre?: string;
  ubicacion: string;
  
  // Estado
  estado: EstadoCajaPOS;
  activa: boolean;
  
  // Configuración
  requiere_autorizacion_descuentos: boolean;
  limite_descuento_sin_autorizacion: number;
  requiere_autorizacion_anulaciones: boolean;
  permite_ventas_credito: boolean;
  limite_credito_sin_autorizacion: number;
  imprime_automatico: boolean;
  
  // Hardware asociado
  impresora_termica?: string;
  lector_codigo_barras?: string;
  gaveta_dinero?: string;
  balanza_electronica?: string;
  terminal_pos?: string;
  
  // Usuarios autorizados
  usuarios_autorizados: number[];
  supervisor_id?: number;
  
  // Metadatos
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface TurnoCaja {
  id: number;
  caja_id: number;
  usuario_id: number;
  usuario_nombre: string;
  
  // Control de turno
  fecha_apertura: string;
  hora_apertura: string;
  fecha_cierre?: string;
  hora_cierre?: string;
  
  // Montos de apertura
  monto_apertura_sistema: number;
  monto_apertura_fisico: number;
  diferencia_apertura: number;
  
  // Montos de cierre
  monto_cierre_sistema: number;
  monto_cierre_fisico?: number;
  diferencia_cierre?: number;
  
  // Resumen de ventas
  total_ventas: number;
  cantidad_ventas: number;
  total_anulaciones: number;
  cantidad_anulaciones: number;
  total_devoluciones: number;
  cantidad_devoluciones: number;
  
  // Métodos de pago
  resumen_metodos_pago: ResumenMetodoPago[];
  
  // Movimientos de caja
  total_ingresos_adicionales: number;
  total_egresos: number;
  
  // Estado
  estado: 'abierto' | 'cerrado' | 'cuadrado';
  observaciones_apertura?: string;
  observaciones_cierre?: string;
  
  // Supervisión
  supervisor_apertura_id?: number;
  supervisor_cierre_id?: number;
  requiere_supervision: boolean;
  autorizado: boolean;
}

export interface ResumenMetodoPago {
  metodo: MetodoPagoPOS;
  cantidad_transacciones: number;
  monto_total: number;
  monto_esperado: number;
  diferencia: number;
}

export interface MovimientoCaja {
  id: number;
  turno_caja_id: number;
  tipo: TipoMovimientoCaja;
  concepto: string;
  monto: number;
  metodo_pago: MetodoPagoPOS;
  referencia?: string;
  observaciones?: string;
  
  // Referencias
  venta_id?: number;
  usuario_id: number;
  usuario_nombre: string;
  supervisor_id?: number;
  
  // Fechas
  fecha_movimiento: string;
  hora_movimiento: string;
}

// =======================================================
// INTERFACES DE CONFIGURACIÓN POS
// =======================================================

export interface ConfiguracionPOS {
  // General
  nombre_establecimiento: string;
  direccion_establecimiento: string;
  telefono_establecimiento?: string;
  email_establecimiento?: string;
  
  // Documentos
  tipos_documento_habilitados: TipoDocumentoPOS[];
  series_por_defecto: Record<TipoDocumentoPOS, string>;
  numeracion_automatica: boolean;
  validar_stock_antes_venta: boolean;
  permitir_stock_negativo: boolean;
  
  // Precios y descuentos
  mostrar_precios_con_igv: boolean;
  permitir_modificar_precios: boolean;
  descuento_maximo_porcentaje: number;
  requiere_autorizacion_descuentos: boolean;
  
  // Cliente
  cliente_generico_id: number;
  solicitar_datos_cliente_minimo: number; // Monto mínimo para solicitar datos
  crear_cliente_automatico: boolean;
  validar_documento_cliente: boolean;
  
  // Impresión
  imprimir_automatico_venta: boolean;
  imprimir_copia_cliente: boolean;
  imprimir_comprobante_pago: boolean;
  impresora_por_defecto: string;
  formato_impresion: 'termica_58mm' | 'termica_80mm' | 'laser_a4';
  
  // Interfaz
  tema_visual: 'claro' | 'oscuro' | 'auto';
  mostrar_imagenes_productos: boolean;
  productos_por_pagina: number;
  categorias_visibles: boolean;
  busqueda_rapida_habilitada: boolean;
  
  // Sonidos
  sonidos_habilitados: boolean;
  sonido_venta_exitosa: boolean;
  sonido_error: boolean;
  sonido_codigo_barras: boolean;
  
  // Seguridad
  cerrar_sesion_automatico: boolean;
  tiempo_inactividad_minutos: number;
  requiere_password_anulaciones: boolean;
  requiere_password_descuentos: boolean;
  
  // Integración
  envio_automatico_sunat: boolean;
  backup_automatico_habilitado: boolean;
  sincronizacion_en_tiempo_real: boolean;
}

// =======================================================
// INTERFACES DE CATÁLOGO Y BÚSQUEDA
// =======================================================

export interface ProductoCatalogoPOS {
  id: number;
  codigo: string;
  codigo_barras?: string;
  nombre: string;
  descripcion_corta?: string;
  categoria_id?: number;
  categoria_nombre?: string;
  precio_venta: number;
  precio_con_igv: number;
  stock_actual: number;
  unidad_medida: string;
  afecto_igv: boolean;
  imagen?: string;
  activo: boolean;
  disponible_pos: boolean;
  permite_modificar_precio: boolean;
  es_combo: boolean;
  es_promocion: boolean;
}

export interface FiltrosCatalogoPOS {
  categoria_id?: number;
  busqueda?: string;
  con_stock?: boolean;
  solo_promociones?: boolean;
  rango_precio?: { min: number; max: number };
  afecto_igv?: boolean;
}

export interface CategoriaPOS {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  icono?: string;
  imagen?: string;
  orden: number;
  activa: boolean;
  total_productos: number;
}

// =======================================================
// INTERFACES DE PROMOCIONES Y DESCUENTOS
// =======================================================

export interface PromocionPOS {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: 'descuento_porcentaje' | 'descuento_monto' | 'precio_fijo' | '2x1' | '3x2' | 'combo';
  
  // Configuración
  valor_descuento?: number;
  precio_promocional?: number;
  cantidad_requerida?: number;
  cantidad_bonificada?: number;
  
  // Restricciones
  monto_minimo_compra?: number;
  productos_aplicables: number[];
  categorias_aplicables: number[];
  clientes_aplicables: number[];
  
  // Vigencia
  fecha_inicio: string;
  fecha_fin: string;
  dias_semana_aplicables: number[]; // 0=domingo, 1=lunes, etc.
  hora_inicio?: string;
  hora_fin?: string;
  
  // Límites
  limite_usos_total?: number;
  limite_usos_por_cliente?: number;
  limite_usos_por_dia?: number;
  usos_actuales: number;
  
  // Estado
  activa: boolean;
  automatica: boolean; // Se aplica automáticamente
  requiere_codigo: boolean;
  codigo_promocional?: string;
  
  // Estadísticas
  total_aplicaciones: number;
  total_descuento_otorgado: number;
  fecha_creacion: string;
}

export interface AplicacionPromocion {
  promocion_id: number;
  promocion_nombre: string;
  items_afectados: number[];
  descuento_total: number;
  automatica: boolean;
}

// =======================================================
// INTERFACES DE REPORTES POS
// =======================================================

export interface ReporteTurnoPOS {
  turno_id: number;
  caja_nombre: string;
  usuario_nombre: string;
  fecha_apertura: string;
  fecha_cierre?: string;
  
  // Resumen ventas
  total_ventas_cantidad: number;
  total_ventas_monto: number;
  venta_promedio: number;
  venta_maxima: number;
  venta_minima: number;
  
  // Por tipo de documento
  facturas_cantidad: number;
  facturas_monto: number;
  boletas_cantidad: number;
  boletas_monto: number;
  notas_cantidad: number;
  notas_monto: number;
  
  // Por método de pago
  efectivo_cantidad: number;
  efectivo_monto: number;
  tarjetas_cantidad: number;
  tarjetas_monto: number;
  transferencias_cantidad: number;
  transferencias_monto: number;
  digitales_cantidad: number;
  digitales_monto: number;
  
  // Productos más vendidos
  productos_top: ProductoTopVendido[];
  
  // Movimientos caja
  apertura_sistema: number;
  apertura_fisico: number;
  ingresos_adicionales: number;
  egresos: number;
  cierre_sistema: number;
  cierre_fisico?: number;
  diferencia_final: number;
}

export interface ProductoTopVendido {
  producto_id: number;
  producto_nombre: string;
  cantidad_vendida: number;
  monto_vendido: number;
  porcentaje_participacion: number;
}

export interface ReporteVentasPeriodo {
  fecha_inicio: string;
  fecha_fin: string;
  total_ventas: number;
  total_monto: number;
  promedio_venta: number;
  
  // Tendencias
  ventas_por_dia: VentaDiaria[];
  ventas_por_hora: VentaHoraria[];
  ventas_por_metodo_pago: VentaMetodoPago[];
  
  // Comparativas
  periodo_anterior_ventas: number;
  periodo_anterior_monto: number;
  crecimiento_ventas_porcentaje: number;
  crecimiento_monto_porcentaje: number;
}

export interface VentaDiaria {
  fecha: string;
  cantidad_ventas: number;
  monto_total: number;
  dia_semana: number;
}

export interface VentaHoraria {
  hora: number;
  cantidad_ventas: number;
  monto_total: number;
  promedio_monto: number;
}

export interface VentaMetodoPago {
  metodo: MetodoPagoPOS;
  cantidad_transacciones: number;
  monto_total: number;
  porcentaje_participacion: number;
}

// =======================================================
// INTERFACES DE ESTADO Y CONTEXTO
// =======================================================

export interface EstadoPOS {
  // Venta activa
  venta_actual?: VentaPOS;
  items_carrito: ItemVentaPOS[];
  cliente_seleccionado?: Cliente;
  
  // Totales calculados
  subtotal: number;
  descuento_global: number;
  igv: number;
  total: number;
  
  // Estado de la interfaz
  modo_venta: 'normal' | 'devolucion' | 'nota_credito' | 'cotizacion';
  pantalla_activa: 'productos' | 'carrito' | 'pago' | 'finalizada';
  
  // Configuración actual
  tipo_documento: TipoDocumentoPOS;
  serie_activa: string;
  caja_activa?: CajaPOS;
  turno_activo?: TurnoCaja;
  
  // Estados de carga
  procesando_venta: boolean;
  consultando_stock: boolean;
  enviando_sunat: boolean;
  imprimiendo: boolean;
  
  // Errores y mensajes
  errores: string[];
  mensajes_info: string[];
}

export interface ContextoPOS {
  // Estado
  estado: EstadoPOS;
  
  // Acciones de productos
  agregarProducto: (producto: ProductoCatalogoPOS, cantidad?: number) => void;
  modificarCantidadItem: (item_id: string, nueva_cantidad: number) => void;
  eliminarItem: (item_id: string) => void;
  aplicarDescuentoItem: (item_id: string, descuento: number, es_porcentaje: boolean) => void;
  limpiarCarrito: () => void;
  
  // Acciones de cliente
  seleccionarCliente: (cliente: Cliente) => void;
  crearClienteRapido: (datos: any) => Promise<Cliente>;
  limpiarCliente: () => void;
  
  // Acciones de venta
  cambiarTipoDocumento: (tipo: TipoDocumentoPOS) => void;
  aplicarDescuentoGlobal: (descuento: number, es_porcentaje: boolean) => void;
  aplicarPromocion: (promocion: PromocionPOS) => void;
  
  // Acciones de pago
  agregarMetodoPago: (metodo: MetodoPagoPOS) => void;
  eliminarMetodoPago: (metodo_id: string) => void;
  
  // Acciones de finalización
  procesarVenta: (metodos_pago: MetodoPagoPOS[]) => Promise<VentaPOS>;
  anularVenta: (venta_id: number, motivo: string) => Promise<boolean>;
  reimprimir: (venta_id: number) => Promise<boolean>;
  
  // Utilidades
  calcularTotales: () => void;
  validarVenta: () => { valida: boolean; errores: string[] };
  buscarProducto: (termino: string) => Promise<ProductoCatalogoPOS[]>;
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default {
  VentaPOS,
  ItemVentaPOS,
  MetodoPagoPOS,
  CajaPOS,
  TurnoCaja,
  ConfiguracionPOS,
  ProductoCatalogoPOS,
  PromocionPOS,
  ReporteTurnoPOS,
  EstadoPOS,
  ContextoPOS
};