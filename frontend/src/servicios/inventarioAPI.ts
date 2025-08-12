/**
 * Servicio API de Inventario - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Servicio completo para movimientos de inventario y control PEPS
 */

import axios, { AxiosResponse } from 'axios';
import { 
  MovimientoInventario,
  DetalleMovimiento,
  FormularioMovimiento,
  TipoMovimiento,
  Almacen,
  StockProducto,
  LoteProducto,
  FiltrosInventario,
  EstadisticasInventario,
  ReporteInventario,
  ValoracionInventario,
  ValidacionMovimiento,
  ConfiguracionInventario
} from '../types/inventario';
import { RespuestaPaginada, ParametrosBusqueda } from '../types/common';
import { obtenerToken } from '../utils/auth';

// =======================================================
// CONFIGURACIÓN BASE
// =======================================================

const API_BASE_URL = '/api/inventario';

const obtenerConfiguracion = () => ({
  headers: {
    'Authorization': `Bearer ${obtenerToken()}`,
    'Content-Type': 'application/json',
  },
});

// =======================================================
// CLASE PRINCIPAL DEL SERVICIO
// =======================================================

export class InventarioAPI {
  // =======================================================
  // MÉTODOS DE MOVIMIENTOS
  // =======================================================

  /**
   * Crear nuevo movimiento de inventario
   */
  static async crearMovimiento(datosMovimiento: FormularioMovimiento): Promise<MovimientoInventario> {
    try {
      const response: AxiosResponse<MovimientoInventario> = await axios.post(
        `${API_BASE_URL}/movimientos-inventario/`,
        {
          tipo_movimiento_id: datosMovimiento.tipo_movimiento_id,
          almacen_id: datosMovimiento.almacen_id,
          fecha_movimiento: datosMovimiento.fecha_movimiento,
          numero_documento: datosMovimiento.numero_documento,
          referencia: datosMovimiento.referencia,
          observaciones: datosMovimiento.observaciones,
          proveedor_id: datosMovimiento.proveedor_id,
          cliente_id: datosMovimiento.cliente_id,
          detalles: datosMovimiento.detalles.map(detalle => ({
            producto_id: detalle.producto_id,
            cantidad: detalle.cantidad,
            costo_unitario: detalle.costo_unitario,
            lote: detalle.lote,
            fecha_vencimiento: detalle.fecha_vencimiento,
            ubicacion: detalle.ubicacion,
            observaciones: detalle.observaciones,
          })),
        },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear movimiento:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al crear el movimiento de inventario. Verifique los datos e intente nuevamente.'
      );
    }
  }

  /**
   * Obtener movimiento por ID
   */
  static async obtenerMovimiento(id: number): Promise<MovimientoInventario> {
    try {
      const response: AxiosResponse<MovimientoInventario> = await axios.get(
        `${API_BASE_URL}/movimientos-inventario/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener movimiento:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener el movimiento. Verifique el ID e intente nuevamente.'
      );
    }
  }

  /**
   * Actualizar movimiento (solo si está en borrador)
   */
  static async actualizarMovimiento(id: number, datosMovimiento: Partial<FormularioMovimiento>): Promise<MovimientoInventario> {
    try {
      const response: AxiosResponse<MovimientoInventario> = await axios.put(
        `${API_BASE_URL}/movimientos-inventario/${id}/`,
        datosMovimiento,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar movimiento:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al actualizar el movimiento. Solo se pueden modificar movimientos en borrador.'
      );
    }
  }

  /**
   * Confirmar movimiento (aplicar al inventario)
   */
  static async confirmarMovimiento(id: number): Promise<{ mensaje: string; movimiento: MovimientoInventario }> {
    try {
      const response: AxiosResponse<{ mensaje: string; movimiento: MovimientoInventario }> = await axios.post(
        `${API_BASE_URL}/movimientos-inventario/${id}/confirmar/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al confirmar movimiento:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al confirmar el movimiento. Verifique el estado del movimiento.'
      );
    }
  }

  /**
   * Anular movimiento
   */
  static async anularMovimiento(id: number, motivo: string): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.post(
        `${API_BASE_URL}/movimientos-inventario/${id}/anular/`,
        { motivo },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al anular movimiento:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al anular el movimiento.'
      );
    }
  }

  // =======================================================
  // MÉTODOS DE BÚSQUEDA Y LISTADO
  // =======================================================

  /**
   * Listar movimientos con filtros y paginación
   */
  static async listarMovimientos(filtros: FiltrosInventario = {}): Promise<RespuestaPaginada<MovimientoInventario>> {
    try {
      const params = new URLSearchParams();

      // Aplicar filtros
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.tipo_movimiento_id) params.append('tipo_movimiento', filtros.tipo_movimiento_id.toString());
      if (filtros.almacen_id) params.append('almacen', filtros.almacen_id.toString());
      if (filtros.producto_id) params.append('producto', filtros.producto_id.toString());
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.numero_documento) params.append('numero_documento', filtros.numero_documento);
      if (filtros.proveedor_id) params.append('proveedor', filtros.proveedor_id.toString());
      if (filtros.cliente_id) params.append('cliente', filtros.cliente_id.toString());
      if (filtros.usuario_id) params.append('usuario', filtros.usuario_id.toString());
      
      // Paginación
      if (filtros.pagina) params.append('page', filtros.pagina.toString());
      if (filtros.limite) params.append('page_size', filtros.limite.toString());
      
      // Ordenamiento
      if (filtros.ordenar_por) {
        const orden = filtros.orden === 'desc' ? `-${filtros.ordenar_por}` : filtros.ordenar_por;
        params.append('ordering', orden);
      }

      const response: AxiosResponse<RespuestaPaginada<MovimientoInventario>> = await axios.get(
        `${API_BASE_URL}/movimientos-inventario/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al listar movimientos:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener la lista de movimientos.'
      );
    }
  }

  /**
   * Buscar movimientos por múltiples criterios
   */
  static async buscarMovimientos(parametros: ParametrosBusqueda): Promise<MovimientoInventario[]> {
    try {
      const params = new URLSearchParams();
      params.append('search', parametros.termino);
      if (parametros.limite) params.append('limit', parametros.limite.toString());

      const response: AxiosResponse<{ results: MovimientoInventario[] }> = await axios.get(
        `${API_BASE_URL}/movimientos-inventario/buscar/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al buscar movimientos:', error);
      throw new Error('Error en la búsqueda de movimientos.');
    }
  }

  // =======================================================
  // MÉTODOS DE STOCK
  // =======================================================

  /**
   * Obtener stock actual por producto
   */
  static async obtenerStockProducto(productoId: number, almacenId?: number): Promise<StockProducto> {
    try {
      const params = new URLSearchParams();
      if (almacenId) params.append('almacen', almacenId.toString());

      const response: AxiosResponse<StockProducto> = await axios.get(
        `${API_BASE_URL}/stock-producto/${productoId}/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener stock:', error);
      throw new Error('Error al obtener el stock del producto.');
    }
  }

  /**
   * Obtener stock de todos los productos
   */
  static async obtenerStockGeneral(almacenId?: number): Promise<StockProducto[]> {
    try {
      const params = new URLSearchParams();
      if (almacenId) params.append('almacen', almacenId.toString());

      const response: AxiosResponse<{ results: StockProducto[] }> = await axios.get(
        `${API_BASE_URL}/stock-producto/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener stock general:', error);
      throw new Error('Error al obtener el stock general.');
    }
  }

  /**
   * Obtener productos con stock mínimo
   */
  static async obtenerProductosStockMinimo(almacenId?: number): Promise<StockProducto[]> {
    try {
      const params = new URLSearchParams();
      params.append('stock_minimo', 'true');
      if (almacenId) params.append('almacen', almacenId.toString());

      const response: AxiosResponse<{ results: StockProducto[] }> = await axios.get(
        `${API_BASE_URL}/stock-producto/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener productos con stock mínimo:', error);
      throw new Error('Error al obtener productos con stock mínimo.');
    }
  }

  /**
   * Obtener productos sin stock
   */
  static async obtenerProductosSinStock(almacenId?: number): Promise<StockProducto[]> {
    try {
      const params = new URLSearchParams();
      params.append('sin_stock', 'true');
      if (almacenId) params.append('almacen', almacenId.toString());

      const response: AxiosResponse<{ results: StockProducto[] }> = await axios.get(
        `${API_BASE_URL}/stock-producto/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener productos sin stock:', error);
      throw new Error('Error al obtener productos sin stock.');
    }
  }

  // =======================================================
  // MÉTODOS DE LOTES
  // =======================================================

  /**
   * Obtener lotes de un producto
   */
  static async obtenerLotesProducto(
    productoId: number, 
    almacenId?: number,
    soloDisponibles?: boolean
  ): Promise<LoteProducto[]> {
    try {
      const params = new URLSearchParams();
      if (almacenId) params.append('almacen', almacenId.toString());
      if (soloDisponibles) params.append('disponibles', 'true');

      const response: AxiosResponse<{ results: LoteProducto[] }> = await axios.get(
        `${API_BASE_URL}/lotes-producto/?producto=${productoId}&${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener lotes:', error);
      throw new Error('Error al obtener los lotes del producto.');
    }
  }

  /**
   * Obtener lotes próximos a vencer
   */
  static async obtenerLotesProximosAVencer(dias: number = 30): Promise<LoteProducto[]> {
    try {
      const params = new URLSearchParams();
      params.append('dias_vencimiento', dias.toString());

      const response: AxiosResponse<{ results: LoteProducto[] }> = await axios.get(
        `${API_BASE_URL}/lotes-producto/proximos-vencer/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener lotes próximos a vencer:', error);
      throw new Error('Error al obtener lotes próximos a vencer.');
    }
  }

  /**
   * Obtener lotes vencidos
   */
  static async obtenerLotesVencidos(): Promise<LoteProducto[]> {
    try {
      const response: AxiosResponse<{ results: LoteProducto[] }> = await axios.get(
        `${API_BASE_URL}/lotes-producto/vencidos/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener lotes vencidos:', error);
      throw new Error('Error al obtener lotes vencidos.');
    }
  }

  // =======================================================
  // MÉTODOS DE ALMACENES
  // =======================================================

  /**
   * Obtener todos los almacenes
   */
  static async obtenerAlmacenes(): Promise<Almacen[]> {
    try {
      const response: AxiosResponse<{ results: Almacen[] }> = await axios.get(
        `${API_BASE_URL}/almacenes/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener almacenes:', error);
      throw new Error('Error al obtener los almacenes.');
    }
  }

  /**
   * Crear nuevo almacén
   */
  static async crearAlmacen(almacen: {
    codigo: string;
    nombre: string;
    descripcion?: string;
    direccion?: string;
    responsable_id?: number;
    sucursal_id?: number;
    activo?: boolean;
  }): Promise<Almacen> {
    try {
      const response: AxiosResponse<Almacen> = await axios.post(
        `${API_BASE_URL}/almacenes/`,
        almacen,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear almacén:', error);
      throw new Error('Error al crear el almacén.');
    }
  }

  /**
   * Actualizar almacén
   */
  static async actualizarAlmacen(id: number, almacen: Partial<Almacen>): Promise<Almacen> {
    try {
      const response: AxiosResponse<Almacen> = await axios.put(
        `${API_BASE_URL}/almacenes/${id}/`,
        almacen,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar almacén:', error);
      throw new Error('Error al actualizar el almacén.');
    }
  }

  // =======================================================
  // MÉTODOS DE VALIDACIÓN
  // =======================================================

  /**
   * Validar movimiento antes de crear
   */
  static async validarMovimiento(datosMovimiento: FormularioMovimiento): Promise<ValidacionMovimiento> {
    try {
      const response: AxiosResponse<ValidacionMovimiento> = await axios.post(
        `${API_BASE_URL}/movimientos-inventario/validar/`,
        datosMovimiento,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al validar movimiento:', error);
      throw new Error('Error en la validación del movimiento.');
    }
  }

  /**
   * Verificar disponibilidad de stock
   */
  static async verificarDisponibilidad(
    productoId: number,
    cantidad: number,
    almacenId?: number
  ): Promise<{
    disponible: boolean;
    stock_actual: number;
    stock_reservado: number;
    stock_disponible: number;
    lotes_disponibles?: LoteProducto[];
  }> {
    try {
      const params = new URLSearchParams();
      params.append('cantidad', cantidad.toString());
      if (almacenId) params.append('almacen', almacenId.toString());

      const response = await axios.get(
        `${API_BASE_URL}/stock-producto/${productoId}/verificar-disponibilidad/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al verificar disponibilidad:', error);
      throw new Error('Error al verificar la disponibilidad del stock.');
    }
  }

  // =======================================================
  // MÉTODOS DE REPORTES
  // =======================================================

  /**
   * Obtener reporte de inventario
   */
  static async obtenerReporteInventario(
    almacenId?: number,
    categoriaId?: number,
    fechaCorte?: string
  ): Promise<ReporteInventario> {
    try {
      const params = new URLSearchParams();
      if (almacenId) params.append('almacen', almacenId.toString());
      if (categoriaId) params.append('categoria', categoriaId.toString());
      if (fechaCorte) params.append('fecha_corte', fechaCorte);

      const response: AxiosResponse<ReporteInventario> = await axios.get(
        `${API_BASE_URL}/reportes/inventario/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener reporte de inventario:', error);
      throw new Error('Error al obtener el reporte de inventario.');
    }
  }

  /**
   * Obtener valorización de inventario
   */
  static async obtenerValorizacionInventario(
    almacenId?: number,
    fechaCorte?: string
  ): Promise<ValoracionInventario> {
    try {
      const params = new URLSearchParams();
      if (almacenId) params.append('almacen', almacenId.toString());
      if (fechaCorte) params.append('fecha_corte', fechaCorte);

      const response: AxiosResponse<ValoracionInventario> = await axios.get(
        `${API_BASE_URL}/reportes/valorizacion/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener valorización:', error);
      throw new Error('Error al obtener la valorización del inventario.');
    }
  }

  /**
   * Obtener estadísticas de inventario
   */
  static async obtenerEstadisticas(almacenId?: number): Promise<EstadisticasInventario> {
    try {
      const params = new URLSearchParams();
      if (almacenId) params.append('almacen', almacenId.toString());

      const response: AxiosResponse<EstadisticasInventario> = await axios.get(
        `${API_BASE_URL}/estadisticas/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error('Error al obtener las estadísticas de inventario.');
    }
  }

  // =======================================================
  // MÉTODOS DE AJUSTES
  // =======================================================

  /**
   * Crear ajuste de inventario
   */
  static async crearAjuste(ajuste: {
    almacen_id: number;
    motivo: string;
    observaciones?: string;
    ajustes: Array<{
      producto_id: number;
      cantidad_sistema: number;
      cantidad_fisica: number;
      diferencia: number;
      costo_unitario: number;
      observaciones?: string;
    }>;
  }): Promise<MovimientoInventario> {
    try {
      const response: AxiosResponse<MovimientoInventario> = await axios.post(
        `${API_BASE_URL}/ajustes/`,
        ajuste,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear ajuste:', error);
      throw new Error('Error al crear el ajuste de inventario.');
    }
  }

  /**
   * Generar ajuste automático por diferencias
   */
  static async generarAjusteAutomatico(almacenId: number): Promise<{
    productos_con_diferencias: number;
    valor_total_diferencias: number;
    ajuste_generado?: MovimientoInventario;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ajustes/automatico/`,
        { almacen_id: almacenId },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al generar ajuste automático:', error);
      throw new Error('Error al generar el ajuste automático.');
    }
  }

  // =======================================================
  // MÉTODOS DE TIPOS DE MOVIMIENTO
  // =======================================================

  /**
   * Obtener tipos de movimiento
   */
  static async obtenerTiposMovimiento(): Promise<TipoMovimiento[]> {
    try {
      const response: AxiosResponse<{ results: TipoMovimiento[] }> = await axios.get(
        `${API_BASE_URL}/tipos-movimiento/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener tipos de movimiento:', error);
      throw new Error('Error al obtener los tipos de movimiento.');
    }
  }

  /**
   * Obtener tipos de movimiento de entrada
   */
  static async obtenerTiposEntrada(): Promise<TipoMovimiento[]> {
    try {
      const response: AxiosResponse<{ results: TipoMovimiento[] }> = await axios.get(
        `${API_BASE_URL}/tipos-movimiento/entradas/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener tipos de entrada:', error);
      throw new Error('Error al obtener los tipos de entrada.');
    }
  }

  /**
   * Obtener tipos de movimiento de salida
   */
  static async obtenerTiposSalida(): Promise<TipoMovimiento[]> {
    try {
      const response: AxiosResponse<{ results: TipoMovimiento[] }> = await axios.get(
        `${API_BASE_URL}/tipos-movimiento/salidas/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener tipos de salida:', error);
      throw new Error('Error al obtener los tipos de salida.');
    }
  }

  // =======================================================
  // MÉTODOS DE EXPORTACIÓN
  // =======================================================

  /**
   * Exportar reporte de inventario a Excel
   */
  static async exportarInventarioExcel(
    almacenId?: number,
    categoriaId?: number,
    fechaCorte?: string
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (almacenId) params.append('almacen', almacenId.toString());
      if (categoriaId) params.append('categoria', categoriaId.toString());
      if (fechaCorte) params.append('fecha_corte', fechaCorte);

      const response: AxiosResponse<Blob> = await axios.get(
        `${API_BASE_URL}/reportes/inventario/excel/?${params.toString()}`,
        {
          ...obtenerConfiguracion(),
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al exportar inventario:', error);
      throw new Error('Error al exportar el reporte de inventario.');
    }
  }

  /**
   * Exportar movimientos a Excel
   */
  static async exportarMovimientosExcel(filtros: FiltrosInventario = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response: AxiosResponse<Blob> = await axios.get(
        `${API_BASE_URL}/movimientos-inventario/exportar-excel/?${params.toString()}`,
        {
          ...obtenerConfiguracion(),
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al exportar movimientos:', error);
      throw new Error('Error al exportar los movimientos.');
    }
  }

  // =======================================================
  // MÉTODOS DE UTILIDADES
  // =======================================================

  /**
   * Recalcular costos PEPS
   */
  static async recalcularCostosPEPS(
    productoId?: number,
    almacenId?: number
  ): Promise<{ mensaje: string; productos_procesados: number }> {
    try {
      const params = new URLSearchParams();
      if (productoId) params.append('producto', productoId.toString());
      if (almacenId) params.append('almacen', almacenId.toString());

      const response = await axios.post(
        `${API_BASE_URL}/utilidades/recalcular-costos-peps/?${params.toString()}`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al recalcular costos:', error);
      throw new Error('Error al recalcular los costos PEPS.');
    }
  }

  /**
   * Limpiar cache del servicio
   */
  static limpiarCache(): void {
    console.log('Cache de inventario limpiado');
  }
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default InventarioAPI;