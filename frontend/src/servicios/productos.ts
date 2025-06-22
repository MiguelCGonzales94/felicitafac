/**
 * Servicio de Productos - FELICITAFAC
 * Gestión completa de productos con control de inventario PEPS
 * Optimizado para facturación electrónica Perú
 */

import apiClient from './api';
import type { 
  Producto, 
  CrearProductoRequest,
  ActualizarProductoRequest,
  ProductosPaginados,
  MovimientoInventario,
  StockProducto,
  ReporteInventario
} from '../types/producto';

// Tipos específicos del servicio
interface FiltrosProductos {
  busqueda?: string;
  categoria_id?: number;
  tipo_producto?: 'producto' | 'servicio';
  estado?: 'activo' | 'inactivo';
  con_stock?: boolean;
  stock_minimo?: boolean;
  precio_desde?: number;
  precio_hasta?: number;
  pagina?: number;
  limite?: number;
}

interface MovimientoInventarioRequest {
  producto_id: number;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  precio_unitario?: number;
  motivo: string;
  referencia?: string;
}

interface AjusteInventarioRequest {
  producto_id: number;
  cantidad_nueva: number;
  motivo: string;
  observaciones?: string;
}

class ServicioProductos {
  private readonly baseUrl = '/api/productos';

  /**
   * Obtener lista paginada de productos
   */
  async obtenerProductos(filtros: FiltrosProductos = {}): Promise<ProductosPaginados> {
    try {
      const params = new URLSearchParams();
      
      // Aplicar filtros
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.categoria_id) params.append('categoria', filtros.categoria_id.toString());
      if (filtros.tipo_producto) params.append('tipo_producto', filtros.tipo_producto);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.con_stock !== undefined) params.append('con_stock', filtros.con_stock.toString());
      if (filtros.stock_minimo) params.append('stock_minimo', 'true');
      if (filtros.precio_desde) params.append('precio_desde', filtros.precio_desde.toString());
      if (filtros.precio_hasta) params.append('precio_hasta', filtros.precio_hasta.toString());
      if (filtros.pagina) params.append('page', filtros.pagina.toString());
      if (filtros.limite) params.append('page_size', filtros.limite.toString());

      const response = await apiClient.get(`${this.baseUrl}/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener producto por ID
   */
  async obtenerProductoPorId(productoId: number): Promise<Producto> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${productoId}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Buscar producto por código
   */
  async buscarProductoPorCodigo(codigo: string): Promise<Producto | null> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/buscar-por-codigo/`,
        { params: { codigo } }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error al buscar producto por código:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Crear nuevo producto
   */
  async crearProducto(datosProducto: CrearProductoRequest): Promise<Producto> {
    try {
      // Validar datos antes de enviar
      this.validarDatosProducto(datosProducto);

      const response = await apiClient.post(`${this.baseUrl}/`, datosProducto);
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Actualizar producto existente
   */
  async actualizarProducto(productoId: number, datosProducto: ActualizarProductoRequest): Promise<Producto> {
    try {
      this.validarDatosProducto(datosProducto);

      const response = await apiClient.put(`${this.baseUrl}/${productoId}/`, datosProducto);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Eliminar producto
   */
  async eliminarProducto(productoId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${productoId}/`);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Activar/Desactivar producto
   */
  async cambiarEstadoProducto(productoId: number, activo: boolean): Promise<Producto> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${productoId}/`, {
        activo
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del producto:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener stock actual del producto
   */
  async obtenerStockProducto(productoId: number): Promise<StockProducto> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${productoId}/stock/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener stock del producto:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Registrar movimiento de inventario
   */
  async registrarMovimientoInventario(movimiento: MovimientoInventarioRequest): Promise<MovimientoInventario> {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/${movimiento.producto_id}/movimientos/`,
        movimiento
      );
      return response.data;
    } catch (error) {
      console.error('Error al registrar movimiento de inventario:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener historial de movimientos
   */
  async obtenerHistorialMovimientos(productoId: number, limite = 20): Promise<MovimientoInventario[]> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/${productoId}/movimientos/`,
        { params: { limite } }
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de movimientos:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Ajustar inventario (cambio directo de stock)
   */
  async ajustarInventario(ajuste: AjusteInventarioRequest): Promise<MovimientoInventario> {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/${ajuste.producto_id}/ajustar-inventario/`,
        ajuste
      );
      return response.data;
    } catch (error) {
      console.error('Error al ajustar inventario:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener productos con stock mínimo
   */
  async obtenerProductosStockMinimo(): Promise<Producto[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stock-minimo/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos con stock mínimo:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener reporte de inventario
   */
  async obtenerReporteInventario(fechaCorte?: string): Promise<ReporteInventario> {
    try {
      const params = fechaCorte ? { fecha_corte: fechaCorte } : {};
      const response = await apiClient.get(`${this.baseUrl}/reporte-inventario/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de inventario:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Calcular costo promedio del producto (PEPS)
   */
  async calcularCostoPromedio(productoId: number): Promise<{ costo_promedio: number; cantidad_total: number }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${productoId}/costo-promedio/`);
      return response.data;
    } catch (error) {
      console.error('Error al calcular costo promedio:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener categorías de productos
   */
  async obtenerCategorias(): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/categorias/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Verificar disponibilidad para venta
   */
  async verificarDisponibilidad(productoId: number, cantidadSolicitada: number): Promise<{
    disponible: boolean;
    cantidad_disponible: number;
    mensaje: string;
  }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${productoId}/verificar-disponibilidad/`, {
        cantidad_solicitada: cantidadSolicitada
      });
      return response.data;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Generar código de barras para producto
   */
  async generarCodigoBarras(productoId: number): Promise<{ codigo_barras: string; imagen_base64: string }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${productoId}/generar-codigo-barras/`);
      return response.data;
    } catch (error) {
      console.error('Error al generar código de barras:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Exportar productos a Excel
   */
  async exportarProductos(filtros: FiltrosProductos = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.categoria_id) params.append('categoria', filtros.categoria_id.toString());
      if (filtros.tipo_producto) params.append('tipo_producto', filtros.tipo_producto);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.con_stock !== undefined) params.append('con_stock', filtros.con_stock.toString());

      const response = await apiClient.get(
        `${this.baseUrl}/exportar-excel/?${params.toString()}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error al exportar productos:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Importar productos desde Excel
   */
  async importarProductos(archivo: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await apiClient.post(
        `${this.baseUrl}/importar-excel/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al importar productos:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Duplicar producto
   */
  async duplicarProducto(productoId: number, nuevoCodigo: string, nuevoNombre: string): Promise<Producto> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${productoId}/duplicar/`, {
        nuevo_codigo: nuevoCodigo,
        nuevo_nombre: nuevoNombre
      });
      return response.data;
    } catch (error) {
      console.error('Error al duplicar producto:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Validaciones de datos del producto
   */
  private validarDatosProducto(datos: CrearProductoRequest | ActualizarProductoRequest): void {
    // Validar campos obligatorios
    if (!datos.codigo || datos.codigo.trim().length < 1) {
      throw new Error('Código de producto es obligatorio');
    }

    if (!datos.nombre || datos.nombre.trim().length < 2) {
      throw new Error('Nombre de producto es obligatorio (mínimo 2 caracteres)');
    }

    // Validar tipo de producto
    if (!['producto', 'servicio'].includes(datos.tipo_producto)) {
      throw new Error('Tipo de producto debe ser "producto" o "servicio"');
    }

    // Validar precios
    if (datos.precio_venta <= 0) {
      throw new Error('Precio de venta debe ser mayor a 0');
    }

    if (datos.precio_compra && datos.precio_compra < 0) {
      throw new Error('Precio de compra no puede ser negativo');
    }

    // Validar stock mínimo
    if (datos.stock_minimo && datos.stock_minimo < 0) {
      throw new Error('Stock mínimo no puede ser negativo');
    }

    // Validar códigos adicionales
    if (datos.codigo_barras && !/^[\dA-Za-z\-]{8,20}$/.test(datos.codigo_barras)) {
      throw new Error('Código de barras debe tener entre 8 y 20 caracteres alfanuméricos');
    }

    // Validar unidad de medida
    if (datos.unidad_medida && datos.unidad_medida.length > 10) {
      throw new Error('Unidad de medida no puede exceder 10 caracteres');
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
          return new Error(data.detail || 'Datos de producto inválidos');
        case 404:
          return new Error('Producto no encontrado');
        case 409:
          return new Error('Ya existe un producto con este código');
        case 422:
          return new Error(data.detail || 'Error en validación de datos');
        case 423:
          return new Error('El producto tiene movimientos de inventario y no puede ser eliminado');
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
export const servicioProductos = new ServicioProductos();
export default servicioProductos;