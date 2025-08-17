/**
 * Hook useInventario - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook completo para movimientos de inventario y control PEPS
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from './useApi';
import { useNotificaciones } from '../componentes/comunes/Notificaciones';
import { useCarga } from '../componentes/comunes/ComponenteCarga';
import InventarioAPI from '../servicios/inventarioAPI';
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
import { RespuestaPaginada } from '../types/common';
import { formatearMoneda, formatearFecha } from '../utils/formateo';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

interface EstadoInventario {
  movimientos: MovimientoInventario[];
  movimientoActual: MovimientoInventario | null;
  stockProductos: StockProducto[];
  lotes: LoteProducto[];
  almacenes: Almacen[];
  tiposMovimiento: TipoMovimiento[];
  totalMovimientos: number;
  paginaActual: number;
  totalPaginas: number;
  cargandoMovimientos: boolean;
  cargandoMovimiento: boolean;
  cargandoStock: boolean;
  cargandoDatos: boolean;
  error: string | null;
}

interface AlertaInventario {
  tipo: 'stock_minimo' | 'sin_stock' | 'lote_vencido' | 'lote_por_vencer';
  mensaje: string;
  producto?: string;
  almacen?: string;
  cantidad?: number;
  fechaVencimiento?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
}

interface MovimientoRapido {
  tipo: 'entrada' | 'salida' | 'ajuste' | 'transferencia';
  tipoMovimientoId: number;
  nombre: string;
  icono: string;
  color: string;
}

// =======================================================
// HOOK PRINCIPAL
// =======================================================

export const useInventario = () => {
  // =======================================================
  // ESTADO LOCAL
  // =======================================================

  const [estado, setEstado] = useState<EstadoInventario>({
    movimientos: [],
    movimientoActual: null,
    stockProductos: [],
    lotes: [],
    almacenes: [],
    tiposMovimiento: [],
    totalMovimientos: 0,
    paginaActual: 1,
    totalPaginas: 1,
    cargandoMovimientos: false,
    cargandoMovimiento: false,
    cargandoStock: false,
    cargandoDatos: false,
    error: null,
  });

  const [configuracion, setConfiguracion] = useState<ConfiguracionInventario>({
    metodoCosteo: 'PEPS',
    permitirStockNegativo: false,
    validarLotesVencimiento: true,
    alertarStockMinimo: true,
    generarMovimientosAutomaticos: true,
    almacenPorDefecto: 1,
    diasAlertaVencimiento: 30,
    recalcularCostosAutomatico: true,
  });

  const [filtrosActivos, setFiltrosActivos] = useState<FiltrosInventario>({});
  const [alertas, setAlertas] = useState<AlertaInventario[]>([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState<number | null>(null);

  // =======================================================
  // HOOKS EXTERNOS
  // =======================================================

  const { mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useNotificaciones();
  const { mostrarCarga, ocultarCarga } = useCarga();

  // Hooks API especializados
  const {
    data: dataMovimientos,
    loading: cargandoListaMovimientos,
    ejecutar: ejecutarListarMovimientos,
    error: errorListaMovimientos
  } = useApi(
    () => InventarioAPI.listarMovimientos(filtrosActivos),
    { 
      ejecutarInmediatamente: false,
      cachear: true,
      tiempoCacheMs: 30000 // 30 segundos
    }
  );

  const {
    ejecutar: ejecutarCrearMovimiento,
    loading: cargandoCrearMovimiento
  } = useApi(
    (datosMovimiento: FormularioMovimiento) => InventarioAPI.crearMovimiento(datosMovimiento),
    { ejecutarInmediatamente: false }
  );

  const {
    ejecutar: ejecutarObtenerMovimiento,
    loading: cargandoObtenerMovimiento
  } = useApi(
    (id: number) => InventarioAPI.obtenerMovimiento(id),
    { ejecutarInmediatamente: false }
  );

  const {
    data: dataStock,
    loading: cargandoStockGeneral,
    ejecutar: ejecutarObtenerStock,
    refrescar: refrescarStock
  } = useApi(
    () => InventarioAPI.obtenerStockGeneral(almacenSeleccionado || undefined),
    { 
      ejecutarInmediatamente: false,
      cachear: true,
      tiempoCacheMs: 15000 // 15 segundos
    }
  );

  // =======================================================
  // EFECTOS
  // =======================================================

  // Actualizar estado cuando cambien los datos de movimientos
  useEffect(() => {
    if (dataMovimientos) {
      setEstado(prev => ({
        ...prev,
        movimientos: dataMovimientos.results || [],
        totalMovimientos: dataMovimientos.count || 0,
        paginaActual: Math.ceil((dataMovimientos.count || 0) / (filtrosActivos.limite || 10)),
        totalPaginas: Math.ceil((dataMovimientos.count || 0) / (filtrosActivos.limite || 10)),
        cargandoMovimientos: false,
        error: null,
      }));
    }
  }, [dataMovimientos, filtrosActivos.limite]);

  // Actualizar stock cuando cambien los datos
  useEffect(() => {
    if (dataStock) {
      setEstado(prev => ({
        ...prev,
        stockProductos: dataStock,
        cargandoStock: false,
      }));

      // Verificar alertas de inventario
      verificarAlertas(dataStock);
    }
  }, [dataStock]);

  // Manejar errores
  useEffect(() => {
    if (errorListaMovimientos) {
      setEstado(prev => ({
        ...prev,
        error: errorListaMovimientos,
        cargandoMovimientos: false,
      }));
      mostrarError('Error al cargar movimientos', errorListaMovimientos);
    }
  }, [errorListaMovimientos, mostrarError]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar stock cuando cambie el almacén seleccionado
  useEffect(() => {
    if (almacenSeleccionado !== null) {
      cargarStock();
    }
  }, [almacenSeleccionado]);

  // =======================================================
  // FUNCIONES AUXILIARES
  // =======================================================

  const cargarDatosIniciales = useCallback(async () => {
    try {
      setEstado(prev => ({ ...prev, cargandoDatos: true }));
      
      const [almacenes, tiposMovimiento] = await Promise.all([
        InventarioAPI.obtenerAlmacenes(),
        InventarioAPI.obtenerTiposMovimiento()
      ]);

      setEstado(prev => ({
        ...prev,
        almacenes,
        tiposMovimiento,
        cargandoDatos: false,
      }));

      // Seleccionar almacén por defecto
      if (almacenes.length > 0 && !almacenSeleccionado) {
        const almacenDefecto = almacenes.find(a => a.id === configuracion.almacenPorDefecto) || almacenes[0];
        setAlmacenSeleccionado(almacenDefecto.id);
      }

    } catch (error: any) {
      console.error('Error al cargar datos iniciales:', error);
      setEstado(prev => ({
        ...prev,
        cargandoDatos: false,
        error: error.message,
      }));
      mostrarError('Error al cargar datos', 'No se pudieron cargar los datos de inventario');
    }
  }, [almacenSeleccionado, configuracion.almacenPorDefecto, mostrarError]);

  const cargarStock = useCallback(async () => {
    try {
      setEstado(prev => ({ ...prev, cargandoStock: true }));
      await ejecutarObtenerStock();
    } catch (error: any) {
      console.error('Error al cargar stock:', error);
      mostrarError('Error al cargar stock', error.message);
    }
  }, [ejecutarObtenerStock, mostrarError]);

  const verificarAlertas = useCallback(async (stockProductos: StockProducto[]) => {
    const nuevasAlertas: AlertaInventario[] = [];

    // Verificar stock mínimo y sin stock
    stockProductos.forEach(stock => {
      if (stock.stock_actual <= 0) {
        nuevasAlertas.push({
          tipo: 'sin_stock',
          mensaje: `${stock.producto_nombre} está sin stock`,
          producto: stock.producto_nombre,
          almacen: stock.almacen_nombre,
          cantidad: stock.stock_actual,
          prioridad: 'critica',
        });
      } else if (stock.stock_actual <= stock.stock_minimo) {
        nuevasAlertas.push({
          tipo: 'stock_minimo',
          mensaje: `${stock.producto_nombre} está por debajo del stock mínimo`,
          producto: stock.producto_nombre,
          almacen: stock.almacen_nombre,
          cantidad: stock.stock_actual,
          prioridad: 'alta',
        });
      }
    });

    // Verificar lotes vencidos y por vencer si está habilitado
    if (configuracion.validarLotesVencimiento) {
      try {
        const [lotesVencidos, lotesPorVencer] = await Promise.all([
          InventarioAPI.obtenerLotesVencidos(),
          InventarioAPI.obtenerLotesProximosAVencer(configuracion.diasAlertaVencimiento)
        ]);

        lotesVencidos.forEach(lote => {
          nuevasAlertas.push({
            tipo: 'lote_vencido',
            mensaje: `Lote ${lote.lote} de ${lote.producto_nombre} está vencido`,
            producto: lote.producto_nombre,
            fechaVencimiento: lote.fecha_vencimiento,
            prioridad: 'critica',
          });
        });

        lotesPorVencer.forEach(lote => {
          nuevasAlertas.push({
            tipo: 'lote_por_vencer',
            mensaje: `Lote ${lote.lote} de ${lote.producto_nombre} vence pronto`,
            producto: lote.producto_nombre,
            fechaVencimiento: lote.fecha_vencimiento,
            prioridad: 'media',
          });
        });

      } catch (error) {
        console.error('Error al verificar lotes:', error);
      }
    }

    setAlertas(nuevasAlertas);

    // Mostrar notificaciones para alertas críticas
    const alertasCriticas = nuevasAlertas.filter(a => a.prioridad === 'critica');
    if (alertasCriticas.length > 0 && configuracion.alertarStockMinimo) {
      mostrarAdvertencia(
        'Alertas de inventario',
        `Se encontraron ${alertasCriticas.length} alertas críticas de inventario`
      );
    }
  }, [configuracion.validarLotesVencimiento, configuracion.diasAlertaVencimiento, configuracion.alertarStockMinimo, mostrarAdvertencia]);

  const generarNumeroMovimiento = useCallback((tipoMovimiento: string): string => {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const hora = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    
    return `${tipoMovimiento}-${año}${mes}${dia}-${hora}${minutos}`;
  }, []);

  // =======================================================
  // FUNCIONES PRINCIPALES
  // =======================================================

  /**
   * Listar movimientos con filtros
   */
  const listarMovimientos = useCallback(async (filtros: FiltrosInventario = {}) => {
    try {
      setFiltrosActivos(filtros);
      setEstado(prev => ({ ...prev, cargandoMovimientos: true, error: null }));
      
      await ejecutarListarMovimientos();
      
    } catch (error: any) {
      console.error('Error al listar movimientos:', error);
      mostrarError('Error al cargar movimientos', error.message);
    }
  }, [ejecutarListarMovimientos, mostrarError]);

  /**
   * Crear nuevo movimiento de inventario
   */
  const crearMovimiento = useCallback(async (datosMovimiento: FormularioMovimiento): Promise<MovimientoInventario | null> => {
    try {
      mostrarCarga('Creando movimiento...');
      
      // Validar movimiento antes de crear
      const validacion = await InventarioAPI.validarMovimiento(datosMovimiento);
      
      if (!validacion.valido) {
        mostrarError('Datos inválidos', validacion.errores.join(', '));
        return null;
      }

      // Verificar disponibilidad de stock para movimientos de salida
      const tipoMovimiento = estado.tiposMovimiento.find(t => t.id === datosMovimiento.tipo_movimiento_id);
      if (tipoMovimiento?.tipo === 'salida' && !configuracion.permitirStockNegativo) {
        for (const detalle of datosMovimiento.detalles) {
          const verificacion = await InventarioAPI.verificarDisponibilidad(
            detalle.producto_id,
            detalle.cantidad,
            datosMovimiento.almacen_id
          );
          
          if (!verificacion.disponible) {
            mostrarError(
              'Stock insuficiente',
              `No hay suficiente stock para ${detalle.producto_nombre || 'el producto'}. Disponible: ${verificacion.stock_disponible}`
            );
            return null;
          }
        }
      }

      // Generar número de documento si no se proporcionó
      if (!datosMovimiento.numero_documento) {
        datosMovimiento.numero_documento = generarNumeroMovimiento(tipoMovimiento?.codigo || 'MOV');
      }

      const movimiento = await ejecutarCrearMovimiento(datosMovimiento);
      
      if (movimiento) {
        mostrarExito('¡Movimiento creado!', `Movimiento ${movimiento.numero_documento} creado exitosamente`);
        
        // Actualizar lista de movimientos y stock
        await Promise.all([
          listarMovimientos(filtrosActivos),
          cargarStock()
        ]);
        
        return movimiento;
      }

      return null;
    } catch (error: any) {
      console.error('Error al crear movimiento:', error);
      mostrarError('Error al crear movimiento', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [
    configuracion.permitirStockNegativo,
    estado.tiposMovimiento,
    ejecutarCrearMovimiento,
    generarNumeroMovimiento,
    mostrarCarga, 
    ocultarCarga, 
    mostrarExito, 
    mostrarError,
    filtrosActivos,
    listarMovimientos,
    cargarStock
  ]);

  /**
   * Obtener movimiento por ID
   */
  const obtenerMovimiento = useCallback(async (id: number): Promise<MovimientoInventario | null> => {
    try {
      setEstado(prev => ({ ...prev, cargandoMovimiento: true }));
      
      const movimiento = await ejecutarObtenerMovimiento(id);
      
      if (movimiento) {
        setEstado(prev => ({
          ...prev,
          movimientoActual: movimiento,
          cargandoMovimiento: false,
        }));
        return movimiento;
      }

      return null;
    } catch (error: any) {
      console.error('Error al obtener movimiento:', error);
      setEstado(prev => ({
        ...prev,
        cargandoMovimiento: false,
        error: error.message,
      }));
      mostrarError('Error al cargar movimiento', error.message);
      return null;
    }
  }, [ejecutarObtenerMovimiento, mostrarError]);

  /**
   * Confirmar movimiento (aplicar al inventario)
   */
  const confirmarMovimiento = useCallback(async (id: number): Promise<boolean> => {
    try {
      mostrarCarga('Confirmando movimiento...');
      
      const resultado = await InventarioAPI.confirmarMovimiento(id);
      
      if (resultado) {
        mostrarExito('Movimiento confirmado', resultado.mensaje);
        
        // Actualizar estado del movimiento actual si corresponde
        if (estado.movimientoActual?.id === id) {
          setEstado(prev => ({
            ...prev,
            movimientoActual: resultado.movimiento,
          }));
        }

        // Actualizar lista de movimientos y stock
        await Promise.all([
          listarMovimientos(filtrosActivos),
          cargarStock()
        ]);
        
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error al confirmar movimiento:', error);
      mostrarError('Error al confirmar', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [estado.movimientoActual, filtrosActivos, listarMovimientos, cargarStock, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Anular movimiento
   */
  const anularMovimiento = useCallback(async (id: number, motivo: string): Promise<boolean> => {
    try {
      mostrarCarga('Anulando movimiento...');
      
      await InventarioAPI.anularMovimiento(id, motivo);
      
      mostrarExito('Movimiento anulado', 'El movimiento fue anulado correctamente');
      
      // Actualizar lista de movimientos y stock
      await Promise.all([
        listarMovimientos(filtrosActivos),
        cargarStock()
      ]);
      
      return true;
    } catch (error: any) {
      console.error('Error al anular movimiento:', error);
      mostrarError('Error al anular', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [filtrosActivos, listarMovimientos, cargarStock, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Obtener stock de un producto específico
   */
  const obtenerStockProducto = useCallback(async (productoId: number, almacenId?: number): Promise<StockProducto | null> => {
    try {
      const stock = await InventarioAPI.obtenerStockProducto(productoId, almacenId);
      return stock;
    } catch (error: any) {
      console.error('Error al obtener stock del producto:', error);
      mostrarError('Error al consultar stock', error.message);
      return null;
    }
  }, [mostrarError]);

  /**
   * Obtener lotes de un producto
   */
  const obtenerLotesProducto = useCallback(async (
    productoId: number,
    almacenId?: number,
    soloDisponibles?: boolean
  ): Promise<LoteProducto[]> => {
    try {
      const lotes = await InventarioAPI.obtenerLotesProducto(productoId, almacenId, soloDisponibles);
      return lotes;
    } catch (error: any) {
      console.error('Error al obtener lotes:', error);
      mostrarError('Error al consultar lotes', error.message);
      return [];
    }
  }, [mostrarError]);

  /**
   * Crear ajuste de inventario
   */
  const crearAjuste = useCallback(async (ajuste: {
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
  }): Promise<MovimientoInventario | null> => {
    try {
      mostrarCarga('Creando ajuste de inventario...');
      
      const movimiento = await InventarioAPI.crearAjuste(ajuste);
      
      if (movimiento) {
        mostrarExito('Ajuste creado', 'El ajuste de inventario se creó correctamente');
        
        // Actualizar lista de movimientos y stock
        await Promise.all([
          listarMovimientos(filtrosActivos),
          cargarStock()
        ]);
        
        return movimiento;
      }

      return null;
    } catch (error: any) {
      console.error('Error al crear ajuste:', error);
      mostrarError('Error al crear ajuste', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [filtrosActivos, listarMovimientos, cargarStock, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Obtener reporte de inventario
   */
  const obtenerReporteInventario = useCallback(async (
    almacenId?: number,
    categoriaId?: number,
    fechaCorte?: string
  ): Promise<ReporteInventario | null> => {
    try {
      mostrarCarga('Generando reporte...');
      
      const reporte = await InventarioAPI.obtenerReporteInventario(almacenId, categoriaId, fechaCorte);
      
      return reporte;
    } catch (error: any) {
      console.error('Error al obtener reporte:', error);
      mostrarError('Error en reporte', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [mostrarCarga, ocultarCarga, mostrarError]);

  /**
   * Obtener valorización de inventario
   */
  const obtenerValorizacion = useCallback(async (
    almacenId?: number,
    fechaCorte?: string
  ): Promise<ValoracionInventario | null> => {
    try {
      mostrarCarga('Calculando valorización...');
      
      const valorizacion = await InventarioAPI.obtenerValorizacionInventario(almacenId, fechaCorte);
      
      return valorizacion;
    } catch (error: any) {
      console.error('Error al obtener valorización:', error);
      mostrarError('Error en valorización', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [mostrarCarga, ocultarCarga, mostrarError]);

  /**
   * Recalcular costos PEPS
   */
  const recalcularCostos = useCallback(async (
    productoId?: number,
    almacenId?: number
  ): Promise<boolean> => {
    try {
      mostrarCarga('Recalculando costos PEPS...');
      
      const resultado = await InventarioAPI.recalcularCostosPEPS(productoId, almacenId);
      
      mostrarExito('Costos recalculados', `Se procesaron ${resultado.productos_procesados} productos`);
      
      // Actualizar stock después del recálculo
      await cargarStock();
      
      return true;
    } catch (error: any) {
      console.error('Error al recalcular costos:', error);
      mostrarError('Error en recálculo', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [cargarStock, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Exportar reportes
   */
  const exportarInventarioExcel = useCallback(async (
    almacenId?: number,
    categoriaId?: number,
    fechaCorte?: string
  ): Promise<boolean> => {
    try {
      mostrarCarga('Generando Excel...');
      
      const blob = await InventarioAPI.exportarInventarioExcel(almacenId, categoriaId, fechaCorte);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
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
   * Limpiar estado de inventario
   */
  const limpiarEstado = useCallback(() => {
    setEstado({
      movimientos: [],
      movimientoActual: null,
      stockProductos: [],
      lotes: [],
      almacenes: estado.almacenes,
      tiposMovimiento: estado.tiposMovimiento,
      totalMovimientos: 0,
      paginaActual: 1,
      totalPaginas: 1,
      cargandoMovimientos: false,
      cargandoMovimiento: false,
      cargandoStock: false,
      cargandoDatos: false,
      error: null,
    });
    setFiltrosActivos({});
    setAlertas([]);
  }, [estado.almacenes, estado.tiposMovimiento]);

  /**
   * Actualizar configuración
   */
  const actualizarConfiguracion = useCallback((nuevaConfig: Partial<ConfiguracionInventario>) => {
    setConfiguracion(prev => ({ ...prev, ...nuevaConfig }));
  }, []);

  /**
   * Cambiar almacén seleccionado
   */
  const cambiarAlmacen = useCallback((almacenId: number) => {
    setAlmacenSeleccionado(almacenId);
  }, []);

  /**
   * Refrescar datos de inventario
   */
  const refrescarDatos = useCallback(async () => {
    await Promise.all([
      cargarStock(),
      listarMovimientos(filtrosActivos)
    ]);
  }, [cargarStock, listarMovimientos, filtrosActivos]);

  // =======================================================
  // VALORES COMPUTADOS
  // =======================================================

  const estadisticas = useMemo(() => {
    const stock = estado.stockProductos;
    const movimientos = estado.movimientos;
    
    return {
      totalProductos: stock.length,
      productosConStock: stock.filter(s => s.stock_actual > 0).length,
      productosSinStock: stock.filter(s => s.stock_actual <= 0).length,
      productosStockMinimo: stock.filter(s => s.stock_actual <= s.stock_minimo).length,
      valorTotalInventario: stock.reduce((acc, s) => acc + (s.stock_actual * s.costo_promedio), 0),
      totalMovimientos: movimientos.length,
      movimientosHoy: movimientos.filter(m => {
        const hoy = new Date().toISOString().split('T')[0];
        return m.fecha_movimiento.startsWith(hoy);
      }).length,
    };
  }, [estado.stockProductos, estado.movimientos]);

  const alertasPorPrioridad = useMemo(() => {
    return alertas.reduce((acc, alerta) => {
      acc[alerta.prioridad] = (acc[alerta.prioridad] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [alertas]);

  const movimientosRapidos = useMemo((): MovimientoRapido[] => {
    return [
      {
        tipo: 'entrada',
        tipoMovimientoId: 1,
        nombre: 'Compra',
        icono: '📦',
        color: 'green',
      },
      {
        tipo: 'salida',
        tipoMovimientoId: 2,
        nombre: 'Venta',
        icono: '🛒',
        color: 'blue',
      },
      {
        tipo: 'ajuste',
        tipoMovimientoId: 3,
        nombre: 'Ajuste',
        icono: '⚖️',
        color: 'orange',
      },
      {
        tipo: 'transferencia',
        tipoMovimientoId: 4,
        nombre: 'Transferencia',
        icono: '🔄',
        color: 'purple',
      },
    ];
  }, []);

  const cargando = useMemo(() => ({
    movimientos: estado.cargandoMovimientos || cargandoListaMovimientos,
    movimiento: estado.cargandoMovimiento || cargandoObtenerMovimiento,
    stock: estado.cargandoStock || cargandoStockGeneral,
    datos: estado.cargandoDatos,
    creando: cargandoCrearMovimiento,
  }), [
    estado.cargandoMovimientos,
    estado.cargandoMovimiento,
    estado.cargandoStock,
    estado.cargandoDatos,
    cargandoListaMovimientos,
    cargandoObtenerMovimiento,
    cargandoStockGeneral,
    cargandoCrearMovimiento
  ]);

  // =======================================================
  // RETURN DEL HOOK
  // =======================================================

  return {
    // Estado
    movimientos: estado.movimientos,
    movimientoActual: estado.movimientoActual,
    stockProductos: estado.stockProductos,
    lotes: estado.lotes,
    almacenes: estado.almacenes,
    tiposMovimiento: estado.tiposMovimiento,
    totalMovimientos: estado.totalMovimientos,
    paginaActual: estado.paginaActual,
    totalPaginas: estado.totalPaginas,
    filtrosActivos,
    configuracion,
    estadisticas,
    alertas,
    alertasPorPrioridad,
    movimientosRapidos,
    almacenSeleccionado,
    error: estado.error,
    cargando,

    // Funciones principales
    listarMovimientos,
    crearMovimiento,
    obtenerMovimiento,
    confirmarMovimiento,
    anularMovimiento,
    obtenerStockProducto,
    obtenerLotesProducto,
    crearAjuste,

    // Reportes
    obtenerReporteInventario,
    obtenerValorizacion,
    exportarInventarioExcel,

    // Utilidades
    recalcularCostos,
    limpiarEstado,
    actualizarConfiguracion,
    cambiarAlmacen,
    refrescarDatos,
    cargarDatosIniciales,
    cargarStock,

    // Formatters útiles
    formatearMoneda: (monto: number) => formatearMoneda(monto),
    formatearFecha: (fecha: string) => formatearFecha(fecha),
  };
};

export default useInventario;