/**
 * Servicio API de Productos - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Servicio completo para gestión de productos e inventario
 */

import axios, { AxiosResponse } from 'axios';
import { 
  Producto, 
  FormularioProducto,
  ResumenProducto,
  TipoProducto,
  CategoriaProducto,
  UnidadMedida,
  EstadoProducto,
  FiltrosProductos,
  ListaProductosResponse,
  DetalleProductoResponse,
  EstadisticasProducto,
  ProductoProveedor,
  ValidacionProducto,
  ConfiguracionPrecios
} from '../types/producto';
import { RespuestaPaginada, ParametrosBusqueda } from '../types/common';
import { obtenerToken } from '../utils/auth';

// =======================================================
// CONFIGURACIÓN BASE
// =======================================================

const API_BASE_URL = '/api/productos';

const obtenerConfiguracion = () => ({
  headers: {
    'Authorization': `Bearer ${obtenerToken()}`,
    'Content-Type': 'application/json',
  },
});

// =======================================================
// CLASE PRINCIPAL DEL SERVICIO
// =======================================================

export class ProductosAPI {
  // =======================================================
  // MÉTODOS CRUD PRINCIPALES
  // =======================================================

  /**
   * Crear nuevo producto
   */
  static async crearProducto(datosProducto: FormularioProducto): Promise<Producto> {
    try {
      const response: AxiosResponse<Producto> = await axios.post(
        `${API_BASE_URL}/productos/`,
        {
          codigo: datosProducto.codigo,
          codigo_barras: datosProducto.codigo_barras,
          nombre: datosProducto.nombre,
          descripcion: datosProducto.descripcion,
          categoria_id: datosProducto.categoria_id,
          tipo_producto_id: datosProducto.tipo_producto_id,
          unidad_medida: datosProducto.unidad_medida,
          precio_venta: datosProducto.precio_venta,
          precio_compra: datosProducto.precio_compra,
          precio_mayorista: datosProducto.precio_mayorista,
          costo_promedio: datosProducto.costo_promedio,
          margen_ganancia: datosProducto.margen_ganancia,
          tipo_afectacion_igv: datosProducto.tipo_afectacion_igv,
          peso: datosProducto.peso,
          volumen: datosProducto.volumen,
          stock_minimo: datosProducto.stock_minimo,
          stock_maximo: datosProducto.stock_maximo,
          punto_reorden: datosProducto.punto_reorden,
          maneja_inventario: datosProducto.maneja_inventario,
          permite_venta_sin_stock: datosProducto.permite_venta_sin_stock,
          es_servicio: datosProducto.es_servicio,
          visible_pos: datosProducto.visible_pos,
          destacado: datosProducto.destacado,
          imagen_url: datosProducto.imagen_url,
          observaciones: datosProducto.observaciones,
          estado: datosProducto.estado || 'activo',
        },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear producto:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al crear el producto. Verifique los datos e intente nuevamente.'
      );
    }
  }

  /**
   * Obtener producto por ID
   */
  static async obtenerProducto(id: number): Promise<DetalleProductoResponse> {
    try {
      const response: AxiosResponse<DetalleProductoResponse> = await axios.get(
        `${API_BASE_URL}/productos/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener producto:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener el producto. Verifique el ID e intente nuevamente.'
      );
    }
  }

  /**
   * Actualizar producto
   */
  static async actualizarProducto(id: number, datosProducto: Partial<FormularioProducto>): Promise<Producto> {
    try {
      const response: AxiosResponse<Producto> = await axios.put(
        `${API_BASE_URL}/productos/${id}/`,
        datosProducto,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar producto:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al actualizar el producto. Verifique los datos e intente nuevamente.'
      );
    }
  }

  /**
   * Eliminar producto (soft delete)
   */
  static async eliminarProducto(id: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.delete(
        `${API_BASE_URL}/productos/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar producto:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al eliminar el producto. Verifique que no tenga movimientos asociados.'
      );
    }
  }

  // =======================================================
  // MÉTODOS DE BÚSQUEDA Y LISTADO
  // =======================================================

  /**
   * Listar productos con filtros y paginación
   */
  static async listarProductos(filtros: FiltrosProductos = {}): Promise<ListaProductosResponse> {
    try {
      const params = new URLSearchParams();

      // Aplicar filtros
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.categoria_id) params.append('categoria', filtros.categoria_id.toString());
      if (filtros.tipo_producto_id) params.append('tipo_producto', filtros.tipo_producto_id.toString());
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.maneja_inventario !== undefined) params.append('maneja_inventario', filtros.maneja_inventario.toString());
      if (filtros.es_servicio !== undefined) params.append('es_servicio', filtros.es_servicio.toString());
      if (filtros.visible_pos !== undefined) params.append('visible_pos', filtros.visible_pos.toString());
      if (filtros.destacado !== undefined) params.append('destacado', filtros.destacado.toString());
      if (filtros.precio_desde) params.append('precio_desde', filtros.precio_desde.toString());
      if (filtros.precio_hasta) params.append('precio_hasta', filtros.precio_hasta.toString());
      if (filtros.stock_minimo) params.append('stock_minimo_alerta', 'true');
      if (filtros.sin_stock) params.append('sin_stock', 'true');
      if (filtros.con_imagen) params.append('con_imagen', filtros.con_imagen.toString());
      
      // Paginación
      if (filtros.pagina) params.append('page', filtros.pagina.toString());
      if (filtros.tamaño_pagina) params.append('page_size', filtros.tamaño_pagina.toString());
      
      // Ordenamiento
      if (filtros.ordenar_por) {
        const orden = filtros.orden === 'desc' ? `-${filtros.ordenar_por}` : filtros.ordenar_por;
        params.append('ordering', orden);
      }

      const response: AxiosResponse<ListaProductosResponse> = await axios.get(
        `${API_BASE_URL}/productos/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al listar productos:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener la lista de productos.'
      );
    }
  }

  /**
   * Buscar productos por múltiples criterios
   */
  static async buscarProductos(parametros: ParametrosBusqueda): Promise<ResumenProducto[]> {
    try {
      const params = new URLSearchParams();
      params.append('search', parametros.termino);
      if (parametros.limite) params.append('limit', parametros.limite.toString());

      const response: AxiosResponse<{ results: ResumenProducto[] }> = await axios.get(
        `${API_BASE_URL}/productos/buscar/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al buscar productos:', error);
      throw new Error('Error en la búsqueda de productos.');
    }
  }

  /**
   * Buscar producto por código
   */
  static async buscarPorCodigo(codigo: string): Promise<Producto | null> {
    try {
      const response: AxiosResponse<{ producto: Producto | null }> = await axios.get(
        `${API_BASE_URL}/productos/buscar-por-codigo/?codigo=${codigo}`,
        obtenerConfiguracion()
      );

      return response.data.producto;
    } catch (error: any) {
      console.error('Error al buscar por código:', error);
      if (error.response?.status === 404) {
        return null; // Producto no encontrado
      }
      throw new Error('Error al buscar producto por código.');
    }
  }

  /**
   * Buscar producto por código de barras
   */
  static async buscarPorCodigoBarras(codigoBarras: string): Promise<Producto | null> {
    try {
      const response: AxiosResponse<{ producto: Producto | null }> = await axios.get(
        `${API_BASE_URL}/productos/buscar-por-codigo-barras/?codigo_barras=${codigoBarras}`,
        obtenerConfiguracion()
      );

      return response.data.producto;
    } catch (error: any) {
      console.error('Error al buscar por código de barras:', error);
      if (error.response?.status === 404) {
        return null; // Producto no encontrado
      }
      throw new Error('Error al buscar producto por código de barras.');
    }
  }

  // =======================================================
  // MÉTODOS DE VALIDACIÓN
  // =======================================================

  /**
   * Validar datos del producto
   */
  static async validarProducto(datosProducto: FormularioProducto): Promise<ValidacionProducto> {
    try {
      const response: AxiosResponse<ValidacionProducto> = await axios.post(
        `${API_BASE_URL}/productos/validar/`,
        datosProducto,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al validar producto:', error);
      throw new Error('Error en la validación del producto.');
    }
  }

  /**
   * Verificar si el código ya existe
   */
  static async verificarCodigoExistente(
    codigo: string, 
    productoId?: number
  ): Promise<{ existe: boolean; producto?: ResumenProducto }> {
    try {
      const params = new URLSearchParams();
      params.append('codigo', codigo);
      if (productoId) params.append('excluir_id', productoId.toString());

      const response: AxiosResponse<{ existe: boolean; producto?: ResumenProducto }> = await axios.get(
        `${API_BASE_URL}/productos/verificar-codigo/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al verificar código:', error);
      throw new Error('Error al verificar el código.');
    }
  }

  // =======================================================
  // MÉTODOS DE CATEGORÍAS
  // =======================================================

  /**
   * Obtener todas las categorías
   */
  static async obtenerCategorias(): Promise<CategoriaProducto[]> {
    try {
      const response: AxiosResponse<CategoriaProducto[]> = await axios.get(
        `${API_BASE_URL}/categorias/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener categorías:', error);
      throw new Error('Error al obtener las categorías.');
    }
  }

  /**
   * Crear nueva categoría
   */
  static async crearCategoria(categoria: {
    nombre: string;
    descripcion?: string;
    codigo?: string;
    imagen_url?: string;
    activo?: boolean;
  }): Promise<CategoriaProducto> {
    try {
      const response: AxiosResponse<CategoriaProducto> = await axios.post(
        `${API_BASE_URL}/categorias/`,
        categoria,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear categoría:', error);
      throw new Error('Error al crear la categoría.');
    }
  }

  /**
   * Actualizar categoría
   */
  static async actualizarCategoria(id: number, categoria: Partial<CategoriaProducto>): Promise<CategoriaProducto> {
    try {
      const response: AxiosResponse<CategoriaProducto> = await axios.put(
        `${API_BASE_URL}/categorias/${id}/`,
        categoria,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar categoría:', error);
      throw new Error('Error al actualizar la categoría.');
    }
  }

  /**
   * Eliminar categoría
   */
  static async eliminarCategoria(id: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.delete(
        `${API_BASE_URL}/categorias/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error);
      throw new Error('Error al eliminar la categoría.');
    }
  }

  // =======================================================
  // MÉTODOS DE PRECIOS
  // =======================================================

  /**
   * Actualizar precios de producto
   */
  static async actualizarPrecios(
    id: number, 
    precios: {
      precio_venta?: number;
      precio_compra?: number;
      precio_mayorista?: number;
      margen_ganancia?: number;
    }
  ): Promise<Producto> {
    try {
      const response: AxiosResponse<Producto> = await axios.patch(
        `${API_BASE_URL}/productos/${id}/actualizar-precios/`,
        precios,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar precios:', error);
      throw new Error('Error al actualizar los precios.');
    }
  }

  /**
   * Actualización masiva de precios
   */
  static async actualizarPreciosMasivo(
    configuracion: ConfiguracionPrecios
  ): Promise<{ procesados: number; errores: string[] }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/productos/actualizar-precios-masivo/`,
        configuracion,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error en actualización masiva de precios:', error);
      throw new Error('Error al actualizar los precios masivamente.');
    }
  }

  // =======================================================
  // MÉTODOS DE STOCK
  // =======================================================

  /**
   * Obtener stock actual del producto
   */
  static async obtenerStock(id: number): Promise<{
    stock_actual: number;
    stock_reservado: number;
    stock_disponible: number;
    ultima_actualizacion: string;
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/productos/${id}/stock/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener stock:', error);
      throw new Error('Error al obtener el stock del producto.');
    }
  }

  /**
   * Productos con stock mínimo
   */
  static async obtenerProductosStockMinimo(): Promise<ResumenProducto[]> {
    try {
      const response: AxiosResponse<{ results: ResumenProducto[] }> = await axios.get(
        `${API_BASE_URL}/productos/stock-minimo/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener productos con stock mínimo:', error);
      throw new Error('Error al obtener productos con stock mínimo.');
    }
  }

  /**
   * Productos sin stock
   */
  static async obtenerProductosSinStock(): Promise<ResumenProducto[]> {
    try {
      const response: AxiosResponse<{ results: ResumenProducto[] }> = await axios.get(
        `${API_BASE_URL}/productos/sin-stock/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener productos sin stock:', error);
      throw new Error('Error al obtener productos sin stock.');
    }
  }

  // =======================================================
  // MÉTODOS DE ESTADÍSTICAS
  // =======================================================

  /**
   * Obtener estadísticas del producto
   */
  static async obtenerEstadisticas(id: number): Promise<EstadisticasProducto> {
    try {
      const response: AxiosResponse<EstadisticasProducto> = await axios.get(
        `${API_BASE_URL}/productos/${id}/estadisticas/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error('Error al obtener las estadísticas del producto.');
    }
  }

  /**
   * Productos más vendidos
   */
  static async obtenerProductosMasVendidos(
    limite: number = 10,
    fechaDesde?: string,
    fechaHasta?: string
  ): Promise<Array<{
    producto: ResumenProducto;
    cantidad_vendida: number;
    monto_vendido: number;
  }>> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limite.toString());
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);

      const response = await axios.get(
        `${API_BASE_URL}/productos/mas-vendidos/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener productos más vendidos:', error);
      throw new Error('Error al obtener los productos más vendidos.');
    }
  }

  // =======================================================
  // MÉTODOS DE PROVEEDORES
  // =======================================================

  /**
   * Agregar proveedor al producto
   */
  static async agregarProveedor(
    productoId: number, 
    proveedor: Omit<ProductoProveedor, 'id' | 'producto_id'>
  ): Promise<ProductoProveedor> {
    try {
      const response: AxiosResponse<ProductoProveedor> = await axios.post(
        `${API_BASE_URL}/productos-proveedores/`,
        {
          producto_id: productoId,
          ...proveedor
        },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al agregar proveedor:', error);
      throw new Error('Error al agregar el proveedor.');
    }
  }

  /**
   * Actualizar datos del proveedor
   */
  static async actualizarProveedor(id: number, proveedor: Partial<ProductoProveedor>): Promise<ProductoProveedor> {
    try {
      const response: AxiosResponse<ProductoProveedor> = await axios.put(
        `${API_BASE_URL}/productos-proveedores/${id}/`,
        proveedor,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar proveedor:', error);
      throw new Error('Error al actualizar el proveedor.');
    }
  }

  /**
   * Eliminar proveedor del producto
   */
  static async eliminarProveedor(id: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.delete(
        `${API_BASE_URL}/productos-proveedores/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar proveedor:', error);
      throw new Error('Error al eliminar el proveedor.');
    }
  }

  // =======================================================
  // MÉTODOS DE EXPORTACIÓN E IMPORTACIÓN
  // =======================================================

  /**
   * Exportar productos a Excel
   */
  static async exportarExcel(filtros: FiltrosProductos = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response: AxiosResponse<Blob> = await axios.get(
        `${API_BASE_URL}/productos/exportar-excel/?${params.toString()}`,
        {
          ...obtenerConfiguracion(),
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al exportar a Excel:', error);
      throw new Error('Error al exportar los productos a Excel.');
    }
  }

  /**
   * Importar productos desde Excel
   */
  static async importarExcel(archivo: File): Promise<{ 
    procesados: number; 
    errores: string[]; 
    warnings: string[] 
  }> {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await axios.post(
        `${API_BASE_URL}/productos/importar-excel/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${obtenerToken()}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al importar desde Excel:', error);
      throw new Error('Error al importar los productos desde Excel.');
    }
  }

  // =======================================================
  // MÉTODOS DE DATOS MAESTROS
  // =======================================================

  /**
   * Obtener tipos de productos
   */
  static async obtenerTiposProducto(): Promise<TipoProducto[]> {
    try {
      const response: AxiosResponse<TipoProducto[]> = await axios.get(
        `${API_BASE_URL}/tipos-producto/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener tipos de producto:', error);
      throw new Error('Error al obtener los tipos de producto.');
    }
  }

  /**
   * Obtener unidades de medida
   */
  static async obtenerUnidadesMedida(): Promise<UnidadMedida[]> {
    try {
      const response: AxiosResponse<UnidadMedida[]> = await axios.get(
        `${API_BASE_URL}/unidades-medida/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener unidades de medida:', error);
      throw new Error('Error al obtener las unidades de medida.');
    }
  }

  // =======================================================
  // MÉTODOS DE UTILIDADES
  // =======================================================

  /**
   * Limpiar cache del servicio
   */
  static limpiarCache(): void {
    console.log('Cache de productos limpiado');
  }
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default ProductosAPI;