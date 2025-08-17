/**
 * Hook useProductos - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook completo para gestión de productos e inventario
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from './useApi';
import { useNotificaciones } from '../componentes/comunes/Notificaciones';
import { useCarga } from '../componentes/comunes/ComponenteCarga';
import ProductosAPI from '../servicios/productosAPI';
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
import { formatearMoneda, formatearPorcentaje } from '../utils/formateo';
import { calcularMargenGanancia, calcularPrecioConMargen } from '../utils/dinero';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

interface EstadoProductos {
  productos: ResumenProducto[];
  productoActual: Producto | null;
  detalleProducto: DetalleProductoResponse | null;
  categorias: CategoriaProducto[];
  tiposProducto: TipoProducto[];
  unidadesMedida: UnidadMedida[];
  totalProductos: number;
  paginaActual: number;
  totalPaginas: number;
  cargandoProductos: boolean;
  cargandoProducto: boolean;
  cargandoDatos: boolean;
  error: string | null;
}

interface ConfiguracionProductos {
  autoGenerarCodigo: boolean;
  permitirStockNegativo: boolean;
  actualizarCostoAutomatico: boolean;
  mostrarAlertasStock: boolean;
  incluirIgvEnPrecios: boolean;
  redondearPrecios: boolean;
  decimalesPrecios: number;
  validarCodigosUnicos: boolean;
}

interface AlertaStock {
  tipo: 'minimo' | 'agotado' | 'exceso';
  producto: ResumenProducto;
  stockActual: number;
  stockMinimo?: number;
  stockMaximo?: number;
}

// =======================================================
// HOOK PRINCIPAL
// =======================================================

export const useProductos = () => {
  // =======================================================
  // ESTADO LOCAL
  // =======================================================

  const [estado, setEstado] = useState<EstadoProductos>({
    productos: [],
    productoActual: null,
    detalleProducto: null,
    categorias: [],
    tiposProducto: [],
    unidadesMedida: [],
    totalProductos: 0,
    paginaActual: 1,
    totalPaginas: 1,
    cargandoProductos: false,
    cargandoProducto: false,
    cargandoDatos: false,
    error: null,
  });

  const [configuracion, setConfiguracion] = useState<ConfiguracionProductos>({
    autoGenerarCodigo: true,
    permitirStockNegativo: false,
    actualizarCostoAutomatico: true,
    mostrarAlertasStock: true,
    incluirIgvEnPrecios: true,
    redondearPrecios: true,
    decimalesPrecios: 2,
    validarCodigosUnicos: true,
  });

  const [filtrosActivos, setFiltrosActivos] = useState<FiltrosProductos>({});
  const [alertasStock, setAlertasStock] = useState<AlertaStock[]>([]);

  // =======================================================
  // HOOKS EXTERNOS
  // =======================================================

  const { mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useNotificaciones();
  const { mostrarCarga, ocultarCarga } = useCarga();

  // Hooks API especializados
  const {
    data: dataProductos,
    loading: cargandoListaProductos,
    ejecutar: ejecutarListarProductos,
    error: errorListaProductos
  } = useApi(
    () => ProductosAPI.listarProductos(filtrosActivos),
    { 
      ejecutarInmediatamente: false,
      cachear: true,
      tiempoCacheMs: 30000 // 30 segundos
    }
  );

  const {
    ejecutar: ejecutarCrearProducto,
    loading: cargandoCrearProducto
  } = useApi(
    (datosProducto: FormularioProducto) => ProductosAPI.crearProducto(datosProducto),
    { ejecutarInmediatamente: false }
  );

  const {
    ejecutar: ejecutarObtenerProducto,
    loading: cargandoObtenerProducto
  } = useApi(
    (id: number) => ProductosAPI.obtenerProducto(id),
    { ejecutarInmediatamente: false }
  );

  // =======================================================
  // EFECTOS
  // =======================================================

  // Actualizar estado cuando cambien los datos de productos
  useEffect(() => {
    if (dataProductos) {
      setEstado(prev => ({
        ...prev,
        productos: dataProductos.resultados || [],
        totalProductos: dataProductos.total || 0,
        paginaActual: dataProductos.pagina || 1,
        totalPaginas: dataProductos.total_paginas || 1,
        cargandoProductos: false,
        error: null,
      }));

      // Verificar alertas de stock si está habilitado
      if (configuracion.mostrarAlertasStock) {
        verificarAlertasStock(dataProductos.resultados || []);
      }
    }
  }, [dataProductos, configuracion.mostrarAlertasStock]);

  // Manejar errores
  useEffect(() => {
    if (errorListaProductos) {
      setEstado(prev => ({
        ...prev,
        error: errorListaProductos,
        cargandoProductos: false,
      }));
      mostrarError('Error al cargar productos', errorListaProductos);
    }
  }, [errorListaProductos, mostrarError]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // =======================================================
  // FUNCIONES AUXILIARES
  // =======================================================

  const cargarDatosIniciales = useCallback(async () => {
    try {
      setEstado(prev => ({ ...prev, cargandoDatos: true }));
      
      const [categorias, tiposProducto, unidadesMedida] = await Promise.all([
        ProductosAPI.obtenerCategorias(),
        ProductosAPI.obtenerTiposProducto(),
        ProductosAPI.obtenerUnidadesMedida()
      ]);

      setEstado(prev => ({
        ...prev,
        categorias,
        tiposProducto,
        unidadesMedida,
        cargandoDatos: false,
      }));

    } catch (error: any) {
      console.error('Error al cargar datos iniciales:', error);
      setEstado(prev => ({
        ...prev,
        cargandoDatos: false,
        error: error.message,
      }));
      mostrarError('Error al cargar datos', 'No se pudieron cargar los datos maestros');
    }
  }, [mostrarError]);

  const verificarAlertasStock = useCallback((productos: ResumenProducto[]) => {
    const alertas: AlertaStock[] = [];

    productos.forEach(producto => {
      if (producto.maneja_inventario) {
        // Stock agotado
        if (producto.stock_actual <= 0) {
          alertas.push({
            tipo: 'agotado',
            producto,
            stockActual: producto.stock_actual,
          });
        }
        // Stock mínimo
        else if (producto.stock_actual <= producto.stock_minimo) {
          alertas.push({
            tipo: 'minimo',
            producto,
            stockActual: producto.stock_actual,
            stockMinimo: producto.stock_minimo,
          });
        }
        // Stock exceso (si tiene máximo definido)
        else if (producto.stock_maximo > 0 && producto.stock_actual >= producto.stock_maximo) {
          alertas.push({
            tipo: 'exceso',
            producto,
            stockActual: producto.stock_actual,
            stockMaximo: producto.stock_maximo,
          });
        }
      }
    });

    setAlertasStock(alertas);

    // Mostrar notificación si hay alertas críticas
    const alertasCriticas = alertas.filter(a => a.tipo === 'agotado');
    if (alertasCriticas.length > 0) {
      mostrarAdvertencia(
        'Productos agotados',
        `${alertasCriticas.length} producto(s) sin stock disponible`
      );
    }
  }, [mostrarAdvertencia]);

  const generarCodigoAutomatico = useCallback(async (categoriaId?: number): Promise<string> => {
    if (!configuracion.autoGenerarCodigo) {
      return '';
    }

    try {
      // Lógica simple para generar código
      const categoria = estado.categorias.find(c => c.id === categoriaId);
      const prefijo = categoria?.codigo || 'PROD';
      const timestamp = Date.now().toString().slice(-6);
      const codigo = `${prefijo}${timestamp}`;

      // Verificar que el código no exista
      const existente = await ProductosAPI.verificarCodigoExistente(codigo);
      if (existente.existe) {
        // Si existe, agregar un sufijo aleatorio
        return `${codigo}${Math.floor(Math.random() * 100)}`;
      }

      return codigo;
    } catch (error) {
      console.error('Error al generar código:', error);
      return `PROD${Date.now().toString().slice(-6)}`;
    }
  }, [configuracion.autoGenerarCodigo, estado.categorias]);

  const calcularPreciosAutomaticos = useCallback((
    precioBase: number,
    margenGanancia: number,
    incluirIgv: boolean = configuracion.incluirIgvEnPrecios
  ) => {
    const margenDecimal = margenGanancia / 100;
    let precioVenta = precioBase * (1 + margenDecimal);

    if (incluirIgv) {
      precioVenta = precioVenta * 1.18; // Incluir IGV 18%
    }

    if (configuracion.redondearPrecios) {
      precioVenta = Math.round(precioVenta * Math.pow(10, configuracion.decimalesPrecios)) / Math.pow(10, configuracion.decimalesPrecios);
    }

    return {
      precioVenta,
      precioMayorista: precioVenta * 0.9, // 10% menos para mayorista
      margenCalculado: calcularMargenGanancia(precioBase, precioVenta),
    };
  }, [configuracion.incluirIgvEnPrecios, configuracion.redondearPrecios, configuracion.decimalesPrecios]);

  // =======================================================
  // FUNCIONES PRINCIPALES
  // =======================================================

  /**
   * Listar productos con filtros
   */
  const listarProductos = useCallback(async (filtros: FiltrosProductos = {}) => {
    try {
      setFiltrosActivos(filtros);
      setEstado(prev => ({ ...prev, cargandoProductos: true, error: null }));
      
      await ejecutarListarProductos();
      
    } catch (error: any) {
      console.error('Error al listar productos:', error);
      mostrarError('Error al cargar productos', error.message);
    }
  }, [ejecutarListarProductos, mostrarError]);

  /**
   * Crear nuevo producto
   */
  const crearProducto = useCallback(async (datosProducto: FormularioProducto): Promise<Producto | null> => {
    try {
      mostrarCarga('Creando producto...');
      
      // Validar datos del producto
      const validacion = await ProductosAPI.validarProducto(datosProducto);
      
      if (!validacion.valido) {
        mostrarError('Datos inválidos', validacion.errores.join(', '));
        return null;
      }

      // Verificar código único si está habilitado
      if (configuracion.validarCodigosUnicos && datosProducto.codigo) {
        const verificacion = await ProductosAPI.verificarCodigoExistente(datosProducto.codigo);
        if (verificacion.existe) {
          mostrarAdvertencia('Código ya existe', `Ya existe un producto con el código ${datosProducto.codigo}`);
          return null;
        }
      }

      // Generar código automático si no se proporcionó
      if (!datosProducto.codigo && configuracion.autoGenerarCodigo) {
        datosProducto.codigo = await generarCodigoAutomatico(datosProducto.categoria_id);
      }

      const producto = await ejecutarCrearProducto(datosProducto);
      
      if (producto) {
        mostrarExito('¡Producto creado!', `Producto ${producto.nombre} creado exitosamente`);
        
        // Actualizar lista de productos
        await listarProductos(filtrosActivos);
        
        return producto;
      }

      return null;
    } catch (error: any) {
      console.error('Error al crear producto:', error);
      mostrarError('Error al crear producto', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [
    configuracion.validarCodigosUnicos,
    configuracion.autoGenerarCodigo,
    ejecutarCrearProducto,
    generarCodigoAutomatico,
    mostrarCarga, 
    ocultarCarga, 
    mostrarExito, 
    mostrarError, 
    mostrarAdvertencia,
    filtrosActivos,
    listarProductos
  ]);

  /**
   * Obtener producto por ID
   */
  const obtenerProducto = useCallback(async (id: number): Promise<DetalleProductoResponse | null> => {
    try {
      setEstado(prev => ({ ...prev, cargandoProducto: true }));
      
      const detalle = await ejecutarObtenerProducto(id);
      
      if (detalle) {
        setEstado(prev => ({
          ...prev,
          productoActual: detalle.producto,
          detalleProducto: detalle,
          cargandoProducto: false,
        }));
        return detalle;
      }

      return null;
    } catch (error: any) {
      console.error('Error al obtener producto:', error);
      setEstado(prev => ({
        ...prev,
        cargandoProducto: false,
        error: error.message,
      }));
      mostrarError('Error al cargar producto', error.message);
      return null;
    }
  }, [ejecutarObtenerProducto, mostrarError]);

  /**
   * Actualizar producto
   */
  const actualizarProducto = useCallback(async (id: number, datosProducto: Partial<FormularioProducto>): Promise<boolean> => {
    try {
      mostrarCarga('Actualizando producto...');
      
      const producto = await ProductosAPI.actualizarProducto(id, datosProducto);
      
      if (producto) {
        mostrarExito('Producto actualizado', 'Los cambios se guardaron correctamente');
        
        // Actualizar en el estado si es el producto actual
        if (estado.productoActual?.id === id) {
          setEstado(prev => ({
            ...prev,
            productoActual: producto,
            detalleProducto: prev.detalleProducto ? {
              ...prev.detalleProducto,
              producto
            } : null,
          }));
        }

        // Actualizar lista
        await listarProductos(filtrosActivos);
        
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error al actualizar producto:', error);
      mostrarError('Error al actualizar', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [estado.productoActual, filtrosActivos, listarProductos, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Eliminar producto
   */
  const eliminarProducto = useCallback(async (id: number): Promise<boolean> => {
    try {
      mostrarCarga('Eliminando producto...');
      
      await ProductosAPI.eliminarProducto(id);
      
      mostrarExito('Producto eliminado', 'El producto fue eliminado correctamente');
      
      // Actualizar lista
      await listarProductos(filtrosActivos);
      
      // Limpiar producto actual si es el mismo
      if (estado.productoActual?.id === id) {
        setEstado(prev => ({
          ...prev,
          productoActual: null,
          detalleProducto: null,
        }));
      }
      
      return true;
    } catch (error: any) {
      console.error('Error al eliminar producto:', error);
      mostrarError('Error al eliminar', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [estado.productoActual, filtrosActivos, listarProductos, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Buscar producto por código
   */
  const buscarPorCodigo = useCallback(async (codigo: string): Promise<Producto | null> => {
    try {
      const producto = await ProductosAPI.buscarPorCodigo(codigo);
      
      if (producto) {
        mostrarInfo('Producto encontrado', `Se encontró el producto: ${producto.nombre}`);
      }
      
      return producto;
    } catch (error: any) {
      console.error('Error al buscar por código:', error);
      mostrarError('Error en búsqueda', error.message);
      return null;
    }
  }, [mostrarInfo, mostrarError]);

  /**
   * Buscar producto por código de barras
   */
  const buscarPorCodigoBarras = useCallback(async (codigoBarras: string): Promise<Producto | null> => {
    try {
      const producto = await ProductosAPI.buscarPorCodigoBarras(codigoBarras);
      
      if (producto) {
        mostrarInfo('Producto encontrado', `Se encontró el producto: ${producto.nombre}`);
      }
      
      return producto;
    } catch (error: any) {
      console.error('Error al buscar por código de barras:', error);
      mostrarError('Error en búsqueda', error.message);
      return null;
    }
  }, [mostrarInfo, mostrarError]);

  /**
   * Actualizar precios de producto
   */
  const actualizarPrecios = useCallback(async (
    id: number,
    precios: {
      precio_venta?: number;
      precio_compra?: number;
      precio_mayorista?: number;
      margen_ganancia?: number;
    }
  ): Promise<boolean> => {
    try {
      mostrarCarga('Actualizando precios...');
      
      const producto = await ProductosAPI.actualizarPrecios(id, precios);
      
      if (producto) {
        mostrarExito('Precios actualizados', 'Los precios se actualizaron correctamente');
        
        // Actualizar en el estado si es el producto actual
        if (estado.productoActual?.id === id) {
          setEstado(prev => ({
            ...prev,
            productoActual: producto,
          }));
        }

        // Actualizar lista
        await listarProductos(filtrosActivos);
        
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error al actualizar precios:', error);
      mostrarError('Error al actualizar precios', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [estado.productoActual, filtrosActivos, listarProductos, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Gestión de categorías
   */
  const crearCategoria = useCallback(async (categoria: {
    nombre: string;
    descripcion?: string;
    codigo?: string;
    imagen_url?: string;
  }): Promise<CategoriaProducto | null> => {
    try {
      mostrarCarga('Creando categoría...');
      
      const nuevaCategoria = await ProductosAPI.crearCategoria(categoria);
      
      mostrarExito('Categoría creada', 'La categoría se creó correctamente');
      
      // Actualizar lista de categorías
      await cargarDatosIniciales();
      
      return nuevaCategoria;
    } catch (error: any) {
      console.error('Error al crear categoría:', error);
      mostrarError('Error al crear categoría', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [cargarDatosIniciales, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Obtener productos con stock mínimo
   */
  const obtenerProductosStockMinimo = useCallback(async (): Promise<ResumenProducto[]> => {
    try {
      const productos = await ProductosAPI.obtenerProductosStockMinimo();
      
      if (productos.length > 0) {
        mostrarAdvertencia(
          'Productos con stock mínimo',
          `Se encontraron ${productos.length} productos con stock bajo el mínimo`
        );
      }
      
      return productos;
    } catch (error: any) {
      console.error('Error al obtener productos con stock mínimo:', error);
      mostrarError('Error', error.message);
      return [];
    }
  }, [mostrarAdvertencia, mostrarError]);

  /**
   * Obtener productos sin stock
   */
  const obtenerProductosSinStock = useCallback(async (): Promise<ResumenProducto[]> => {
    try {
      const productos = await ProductosAPI.obtenerProductosSinStock();
      
      if (productos.length > 0) {
        mostrarAdvertencia(
          'Productos sin stock',
          `Se encontraron ${productos.length} productos sin stock disponible`
        );
      }
      
      return productos;
    } catch (error: any) {
      console.error('Error al obtener productos sin stock:', error);
      mostrarError('Error', error.message);
      return [];
    }
  }, [mostrarAdvertencia, mostrarError]);

  /**
   * Exportar productos
   */
  const exportarExcel = useCallback(async (filtros: FiltrosProductos = {}): Promise<boolean> => {
    try {
      mostrarCarga('Generando Excel...');
      
      const blob = await ProductosAPI.exportarExcel(filtros);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `productos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      mostrarExito('Excel generado', 'El archivo se descargó correctamente');
      
      return true;
    } catch (error: any) {
      console.error('Error al exportar:', error);
      mostrarError('Error en exportación', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  // =======================================================
  // FUNCIONES DE UTILIDADES
  // =======================================================

  /**
   * Limpiar estado de productos
   */
  const limpiarEstado = useCallback(() => {
    setEstado({
      productos: [],
      productoActual: null,
      detalleProducto: null,
      categorias: estado.categorias,
      tiposProducto: estado.tiposProducto,
      unidadesMedida: estado.unidadesMedida,
      totalProductos: 0,
      paginaActual: 1,
      totalPaginas: 1,
      cargandoProductos: false,
      cargandoProducto: false,
      cargandoDatos: false,
      error: null,
    });
    setFiltrosActivos({});
    setAlertasStock([]);
  }, [estado.categorias, estado.tiposProducto, estado.unidadesMedida]);

  /**
   * Actualizar configuración
   */
  const actualizarConfiguracion = useCallback((nuevaConfig: Partial<ConfiguracionProductos>) => {
    setConfiguracion(prev => ({ ...prev, ...nuevaConfig }));
  }, []);

  /**
   * Validar formulario de producto
   */
  const validarFormulario = useCallback((datosProducto: FormularioProducto): { 
    valido: boolean; 
    errores: string[] 
  } => {
    const errores: string[] = [];

    // Validar nombre
    if (!datosProducto.nombre?.trim()) {
      errores.push('El nombre del producto es requerido');
    }

    // Validar código si se proporciona
    if (datosProducto.codigo && datosProducto.codigo.length < 3) {
      errores.push('El código debe tener al menos 3 caracteres');
    }

    // Validar precios
    if (datosProducto.precio_venta <= 0) {
      errores.push('El precio de venta debe ser mayor a 0');
    }

    if (datosProducto.precio_compra && datosProducto.precio_compra < 0) {
      errores.push('El precio de compra no puede ser negativo');
    }

    // Validar stock si maneja inventario
    if (datosProducto.maneja_inventario) {
      if (datosProducto.stock_minimo < 0) {
        errores.push('El stock mínimo no puede ser negativo');
      }
      if (datosProducto.stock_maximo && datosProducto.stock_maximo < datosProducto.stock_minimo) {
        errores.push('El stock máximo debe ser mayor al stock mínimo');
      }
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }, []);

  // =======================================================
  // VALORES COMPUTADOS
  // =======================================================

  const estadisticas = useMemo(() => {
    const productos = estado.productos;
    
    return {
      totalProductos: productos.length,
      productosActivos: productos.filter(p => p.estado === 'activo').length,
      productosInactivos: productos.filter(p => p.estado === 'inactivo').length,
      productosDestacados: productos.filter(p => p.destacado).length,
      productosConStock: productos.filter(p => p.stock_actual > 0).length,
      productosSinStock: productos.filter(p => p.maneja_inventario && p.stock_actual <= 0).length,
      valorInventario: productos.reduce((acc, p) => acc + (p.stock_actual * p.precio_compra), 0),
      precioPromedio: productos.length > 0 
        ? productos.reduce((acc, p) => acc + p.precio_venta, 0) / productos.length 
        : 0,
    };
  }, [estado.productos]);

  const productosDestacados = useMemo(() => {
    return estado.productos.filter(producto => producto.destacado);
  }, [estado.productos]);

  const categoriasFiltradas = useMemo(() => {
    return estado.categorias.filter(categoria => categoria.activo);
  }, [estado.categorias]);

  const cargando = useMemo(() => ({
    productos: estado.cargandoProductos || cargandoListaProductos,
    producto: estado.cargandoProducto || cargandoObtenerProducto,
    datos: estado.cargandoDatos,
    creando: cargandoCrearProducto,
  }), [
    estado.cargandoProductos,
    estado.cargandoProducto,
    estado.cargandoDatos,
    cargandoListaProductos,
    cargandoObtenerProducto,
    cargandoCrearProducto
  ]);

  // =======================================================
  // RETURN DEL HOOK
  // =======================================================

  return {
    // Estado
    productos: estado.productos,
    productoActual: estado.productoActual,
    detalleProducto: estado.detalleProducto,
    categorias: estado.categorias,
    tiposProducto: estado.tiposProducto,
    unidadesMedida: estado.unidadesMedida,
    totalProductos: estado.totalProductos,
    paginaActual: estado.paginaActual,
    totalPaginas: estado.totalPaginas,
    filtrosActivos,
    configuracion,
    estadisticas,
    productosDestacados,
    categoriasFiltradas,
    alertasStock,
    error: estado.error,
    cargando,

    // Funciones principales
    listarProductos,
    crearProducto,
    obtenerProducto,
    actualizarProducto,
    eliminarProducto,
    buscarPorCodigo,
    buscarPorCodigoBarras,
    actualizarPrecios,

    // Gestión de categorías
    crearCategoria,

    // Funciones de stock
    obtenerProductosStockMinimo,
    obtenerProductosSinStock,

    // Utilidades
    exportarExcel,
    limpiarEstado,
    actualizarConfiguracion,
    validarFormulario,
    generarCodigoAutomatico,
    calcularPreciosAutomaticos,
    cargarDatosIniciales,

    // Formatters útiles
    formatearMoneda: (monto: number) => formatearMoneda(monto),
    formatearPorcentaje: (porcentaje: number) => formatearPorcentaje(porcentaje),
  };
};

export default useProductos;