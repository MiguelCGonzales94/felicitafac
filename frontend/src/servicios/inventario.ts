/**
 * Servicio de Inventario - FELICITAFAC
 * Gestión completa de inventario con método PEPS
 * Control de movimientos y valorización automática
 */

import apiClient from './api';
import type { 
  MovimientoInventario,
  KardexProducto,
  ReporteInventario,
  ValorizacionInventario,
  AjusteInventario,
  TransferenciaInventario
} from '../types/inventario';

// Tipos específicos del servicio
interface FiltrosMovimientos {
  producto_id?: number;
  tipo_movimiento?: 'entrada' | 'salida' | 'ajuste' | 'transferencia';
  motivo?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  usuario_id?: number;
  referencia?: string;
  pagina?: number;
  limite?: number;
}

interface FiltrosKardex {
  producto_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  incluir_saldos_cero?: boolean;
}

interface EntradaInventarioRequest {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  motivo: string;
  referencia?: string;
  proveedor?: string;
  numero_documento?: string;
  observaciones?: string;
}

interface SalidaInventarioRequest {
  producto_id: number;
  cantidad: number;
  motivo: string;
  referencia?: string;
  destino?: string;
  observaciones?: string;
}

interface AjusteInventarioRequest {
  producto_id: number;
  cantidad_nueva: number;
  motivo: string;
  observaciones?: string;
}

interface TransferenciaRequest {
  producto_id: number;
  cantidad: number;
  almacen_origen_id: number;
  almacen_destino_id: number;
  motivo: string;
  observaciones?: string;
}

class ServicioInventario {
  private readonly baseUrl = '/api/inventario';

  /**
   * Obtener lista de movimientos de inventario
   */
  async obtenerMovimientos(filtros: FiltrosMovimientos = {}): Promise<{
    results: MovimientoInventario[];
    count: number;
    next?: string;
    previous?: string;
  }> {
    try {
      const params = new URLSearchParams();
      
      // Aplicar filtros
      if (filtros.producto_id) params.append('producto', filtros.producto_id.toString());
      if (filtros.tipo_movimiento) params.append('tipo_movimiento', filtros.tipo_movimiento);
      if (filtros.motivo) params.append('motivo', filtros.motivo);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.usuario_id) params.append('usuario', filtros.usuario_id.toString());
      if (filtros.referencia) params.append('referencia', filtros.referencia);
      if (filtros.pagina) params.append('page', filtros.pagina.toString());
      if (filtros.limite) params.append('page_size', filtros.limite.toString());

      const response = await apiClient.get(`${this.baseUrl}/movimientos/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener movimiento por ID
   */
  async obtenerMovimientoPorId(movimientoId: number): Promise<MovimientoInventario> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/movimientos/${movimientoId}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener movimiento:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Registrar entrada de inventario
   */
  async registrarEntrada(entrada: EntradaInventarioRequest): Promise<MovimientoInventario> {
    try {
      this.validarEntrada(entrada);

      const response = await apiClient.post(`${this.baseUrl}/entradas/`, entrada);
      return response.data;
    } catch (error) {
      console.error('Error al registrar entrada:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Registrar salida de inventario
   */
  async registrarSalida(salida: SalidaInventarioRequest): Promise<MovimientoInventario> {
    try {
      this.validarSalida(salida);

      const response = await apiClient.post(`${this.baseUrl}/salidas/`, salida);
      return response.data;
    } catch (error) {
      console.error('Error al registrar salida:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Registrar ajuste de inventario
   */
  async registrarAjuste(ajuste: AjusteInventarioRequest): Promise<MovimientoInventario> {
    try {
      this.validarAjuste(ajuste);

      const response = await apiClient.post(`${this.baseUrl}/ajustes/`, ajuste);
      return response.data;
    } catch (error) {
      console.error('Error al registrar ajuste:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Registrar transferencia entre almacenes
   */
  async registrarTransferencia(transferencia: TransferenciaRequest): Promise<MovimientoInventario> {
    try {
      this.validarTransferencia(transferencia);

      const response = await apiClient.post(`${this.baseUrl}/transferencias/`, transferencia);
      return response.data;
    } catch (error) {
      console.error('Error al registrar transferencia:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener kardex de producto
   */
  async obtenerKardex(filtros: FiltrosKardex): Promise<KardexProducto> {
    try {
      const params = new URLSearchParams();
      
      if (filtros.producto_id) params.append('producto_id', filtros.producto_id.toString());
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.incluir_saldos_cero !== undefined) {
        params.append('incluir_saldos_cero', filtros.incluir_saldos_cero.toString());
      }

      const response = await apiClient.get(`${this.baseUrl}/kardex/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener kardex:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener reporte de inventario valorizado
   */
  async obtenerReporteInventario(fechaCorte?: string): Promise<ReporteInventario> {
    try {
      const params = fechaCorte ? { fecha_corte: fechaCorte } : {};
      const response = await apiClient.get(`${this.baseUrl}/reporte-valorizado/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de inventario:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener valorización de inventario por método PEPS
   */
  async obtenerValorizacion(fechaCorte?: string): Promise<ValorizacionInventario> {
    try {
      const params = fechaCorte ? { fecha_corte: fechaCorte } : {};
      const response = await apiClient.get(`${this.baseUrl}/valorizacion-peps/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener valorización:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener productos con stock bajo
   */
  async obtenerProductosStockBajo(): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stock-bajo/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener productos sin movimientos
   */
  async obtenerProductosSinMovimientos(diasSinMovimiento = 30): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sin-movimientos/`, {
        params: { dias: diasSinMovimiento }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos sin movimientos:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener resumen de movimientos por período
   */
  async obtenerResumenMovimientos(fechaDesde: string, fechaHasta: string): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/resumen-movimientos/`, {
        params: { fecha_desde: fechaDesde, fecha_hasta: fechaHasta }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen de movimientos:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Procesar entrada masiva por compra
   */
  async procesarEntradaCompra(compraId: number): Promise<{ movimientos_creados: number; total_items: number }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/procesar-compra/`, {
        compra_id: compraId
      });
      return response.data;
    } catch (error) {
      console.error('Error al procesar entrada por compra:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Procesar salida masiva por venta
   */
  async procesarSalidaVenta(ventaId: number): Promise<{ movimientos_creados: number; total_items: number }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/procesar-venta/`, {
        venta_id: ventaId
      });
      return response.data;
    } catch (error) {
      console.error('Error al procesar salida por venta:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Recalcular saldos PEPS para un producto
   */
  async recalcularSaldosPeps(productoId: number): Promise<{ saldo_recalculado: boolean; nuevo_saldo: number }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/recalcular-peps/`, {
        producto_id: productoId
      });
      return response.data;
    } catch (error) {
      console.error('Error al recalcular saldos PEPS:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Exportar kardex a Excel
   */
  async exportarKardex(filtros: FiltrosKardex): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filtros.producto_id) params.append('producto_id', filtros.producto_id.toString());
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

      const response = await apiClient.get(
        `${this.baseUrl}/exportar-kardex/?${params.toString()}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error al exportar kardex:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Exportar inventario valorizado a Excel
   */
  async exportarInventarioValorizado(fechaCorte?: string): Promise<Blob> {
    try {
      const params = fechaCorte ? { fecha_corte: fechaCorte } : {};
      const response = await apiClient.get(
        `${this.baseUrl}/exportar-inventario-valorizado/`,
        { params, responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error al exportar inventario valorizado:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener almacenes disponibles
   */
  async obtenerAlmacenes(): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/almacenes/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener almacenes:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Validar disponibilidad para salida
   */
  async validarDisponibilidad(productoId: number, cantidad: number): Promise<{
    disponible: boolean;
    cantidad_disponible: number;
    lotes_disponibles: any[];
  }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/validar-disponibilidad/`, {
        producto_id: productoId,
        cantidad: cantidad
      });
      return response.data;
    } catch (error) {
      console.error('Error al validar disponibilidad:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Validaciones para entrada de inventario
   */
  private validarEntrada(entrada: EntradaInventarioRequest): void {
    if (!entrada.producto_id) {
      throw new Error('Producto es obligatorio');
    }

    if (!entrada.cantidad || entrada.cantidad <= 0) {
      throw new Error('Cantidad debe ser mayor a 0');
    }

    if (!entrada.precio_unitario || entrada.precio_unitario <= 0) {
      throw new Error('Precio unitario debe ser mayor a 0');
    }

    if (!entrada.motivo || entrada.motivo.trim().length < 3) {
      throw new Error('Motivo es obligatorio (mínimo 3 caracteres)');
    }
  }

  /**
   * Validaciones para salida de inventario
   */
  private validarSalida(salida: SalidaInventarioRequest): void {
    if (!salida.producto_id) {
      throw new Error('Producto es obligatorio');
    }

    if (!salida.cantidad || salida.cantidad <= 0) {
      throw new Error('Cantidad debe ser mayor a 0');
    }

    if (!salida.motivo || salida.motivo.trim().length < 3) {
      throw new Error('Motivo es obligatorio (mínimo 3 caracteres)');
    }
  }

  /**
   * Validaciones para ajuste de inventario
   */
  private validarAjuste(ajuste: AjusteInventarioRequest): void {
    if (!ajuste.producto_id) {
      throw new Error('Producto es obligatorio');
    }

    if (ajuste.cantidad_nueva < 0) {
      throw new Error('Cantidad nueva no puede ser negativa');
    }

    if (!ajuste.motivo || ajuste.motivo.trim().length < 3) {
      throw new Error('Motivo es obligatorio (mínimo 3 caracteres)');
    }
  }

  /**
   * Validaciones para transferencia
   */
  private validarTransferencia(transferencia: TransferenciaRequest): void {
    if (!transferencia.producto_id) {
      throw new Error('Producto es obligatorio');
    }

    if (!transferencia.cantidad || transferencia.cantidad <= 0) {
      throw new Error('Cantidad debe ser mayor a 0');
    }

    if (!transferencia.almacen_origen_id) {
      throw new Error('Almacén de origen es obligatorio');
    }

    if (!transferencia.almacen_destino_id) {
      throw new Error('Almacén de destino es obligatorio');
    }

    if (transferencia.almacen_origen_id === transferencia.almacen_destino_id) {
      throw new Error('Almacén de origen y destino deben ser diferentes');
    }

    if (!transferencia.motivo || transferencia.motivo.trim().length < 3) {
      throw new Error('Motivo es obligatorio (mínimo 3 caracteres)');
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private manejarError(error: any): Error {
    if (error.response) {
      // Error del servidor
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return new Error(data.detail || 'Datos de movimiento inválidos');
        case 404:
          return new Error('Registro no encontrado');
        case 409:
          return new Error('Conflicto en el movimiento de inventario');
        case 422:
          return new Error(data.detail || 'Error en validación de datos');
        case 425:
          return new Error('Stock insuficiente para realizar la operación');
        case 426:
          return new Error('Producto bloqueado para movimientos');
        default:
          return new Error(`Error del servidor: ${status}`);
      }
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifica tu conexión a internet');
    } else {
      // Error interno
      return new Error(error.message || 'Error interno del sistema');
    }
  }
}

// Exportar instancia única del servicio
export const servicioInventario = new ServicioInventario();
export default servicioInventario;