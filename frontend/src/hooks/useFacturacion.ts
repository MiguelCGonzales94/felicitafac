/**
 * Hook useFacturacion - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook completo para gestión de facturación electrónica SUNAT
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from './useApi';
import { useNotificaciones } from '../componentes/comunes/Notificaciones';
import { useCarga } from '../componentes/comunes/ComponenteCarga';
import FacturacionAPI from '../servicios/facturacionAPI';
import { 
  Factura, 
  DatosFactura, 
  ItemFactura, 
  TipoDocumento, 
  EstadoFactura,
  EstadoPago,
  FiltrosFacturas,
  ValidacionFactura,
  RespuestaFactura,
  FacturasPaginadas,
  ResumenVentas,
  EstadoSunat,
  SerieDocumento,
  FormaPago
} from '../types/factura';
import { formatearMoneda } from '../utils/formatters';
import { calcularIgv, calcularTotal } from '../utils/moneyUtils';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

interface EstadoFacturacion {
  facturas: Factura[];
  facturaActual: Factura | null;
  series: SerieDocumento[];
  formasPago: FormaPago[];
  totalFacturas: number;
  paginaActual: number;
  totalPaginas: number;
  cargandoFacturas: boolean;
  cargandoFactura: boolean;
  cargandoSeries: boolean;
  error: string | null;
}

interface ConfiguracionFacturacion {
  autoCalcularIgv: boolean;
  validarStockAntes: boolean;
  enviarSunatAutomatico: boolean;
  imprimirAutomatico: boolean;
  serieDefectoFactura: string;
  serieDefectoBoleta: string;
}

interface ResultadoValidacion {
  valido: boolean;
  errores: string[];
  warnings: string[];
  stockInsuficiente: Array<{
    producto: string;
    stockDisponible: number;
    cantidadSolicitada: number;
  }>;
}

// =======================================================
// HOOK PRINCIPAL
// =======================================================

export const useFacturacion = () => {
  // =======================================================
  // ESTADO LOCAL
  // =======================================================

  const [estado, setEstado] = useState<EstadoFacturacion>({
    facturas: [],
    facturaActual: null,
    series: [],
    formasPago: [],
    totalFacturas: 0,
    paginaActual: 1,
    totalPaginas: 1,
    cargandoFacturas: false,
    cargandoFactura: false,
    cargandoSeries: false,
    error: null,
  });

  const [configuracion, setConfiguracion] = useState<ConfiguracionFacturacion>({
    autoCalcularIgv: true,
    validarStockAntes: true,
    enviarSunatAutomatico: false,
    imprimirAutomatico: false,
    serieDefectoFactura: 'F001',
    serieDefectoBoleta: 'B001',
  });

  const [filtrosActivos, setFiltrosActivos] = useState<FiltrosFacturas>({});

  // =======================================================
  // HOOKS EXTERNOS
  // =======================================================

  const { mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useNotificaciones();
  const { mostrarCarga, ocultarCarga } = useCarga();

  // Hooks API especializados
  const {
    data: dataFacturas,
    loading: cargandoListaFacturas,
    ejecutar: ejecutarListarFacturas,
    error: errorListaFacturas
  } = useApi(
    () => FacturacionAPI.listarFacturas(filtrosActivos),
    { 
      ejecutarInmediatamente: false,
      cachear: true,
      tiempoCacheMs: 30000 // 30 segundos
    }
  );

  const {
    ejecutar: ejecutarCrearFactura,
    loading: cargandoCrearFactura
  } = useApi(
    (datosFactura: DatosFactura) => FacturacionAPI.crearFactura(datosFactura),
    { ejecutarInmediatamente: false }
  );

  const {
    ejecutar: ejecutarObtenerFactura,
    loading: cargandoObtenerFactura
  } = useApi(
    (id: number) => FacturacionAPI.obtenerFactura(id),
    { ejecutarInmediatamente: false }
  );

  // =======================================================
  // EFECTOS
  // =======================================================

  // Actualizar estado cuando cambien los datos de facturas
  useEffect(() => {
    if (dataFacturas) {
      setEstado(prev => ({
        ...prev,
        facturas: dataFacturas.results || [],
        totalFacturas: dataFacturas.count || 0,
        totalPaginas: Math.ceil((dataFacturas.count || 0) / (filtrosActivos.limite || 10)),
        cargandoFacturas: false,
        error: null,
      }));
    }
  }, [dataFacturas, filtrosActivos.limite]);

  // Manejar errores
  useEffect(() => {
    if (errorListaFacturas) {
      setEstado(prev => ({
        ...prev,
        error: errorListaFacturas,
        cargandoFacturas: false,
      }));
      mostrarError('Error al cargar facturas', errorListaFacturas);
    }
  }, [errorListaFacturas, mostrarError]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // =======================================================
  // FUNCIONES AUXILIARES
  // =======================================================

  const cargarDatosIniciales = useCallback(async () => {
    try {
      setEstado(prev => ({ ...prev, cargandoSeries: true }));
      
      const [series, formasPago] = await Promise.all([
        FacturacionAPI.obtenerSeries(),
        FacturacionAPI.obtenerFormasPago()
      ]);

      setEstado(prev => ({
        ...prev,
        series,
        formasPago,
        cargandoSeries: false,
      }));

    } catch (error: any) {
      console.error('Error al cargar datos iniciales:', error);
      setEstado(prev => ({
        ...prev,
        cargandoSeries: false,
        error: error.message,
      }));
      mostrarError('Error al cargar datos', 'No se pudieron cargar los datos iniciales de facturación');
    }
  }, [mostrarError]);

  const calcularTotalesFactura = useCallback((items: ItemFactura[], descuentoGlobal: number = 0) => {
    const subtotal = items.reduce((acc, item) => {
      const subtotalItem = item.cantidad * item.precio_unitario;
      const descuentoItem = subtotalItem * (item.descuento / 100);
      return acc + subtotalItem - descuentoItem;
    }, 0);

    const descuentoGlobalMonto = subtotal * (descuentoGlobal / 100);
    const baseImponible = subtotal - descuentoGlobalMonto;
    const igv = calcularIgv(baseImponible);
    const total = calcularTotal(baseImponible, igv);

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      descuentoGlobal: parseFloat(descuentoGlobalMonto.toFixed(2)),
      baseImponible: parseFloat(baseImponible.toFixed(2)),
      igv: parseFloat(igv.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }, []);

  // =======================================================
  // FUNCIONES PRINCIPALES
  // =======================================================

  /**
   * Listar facturas con filtros
   */
  const listarFacturas = useCallback(async (filtros: FiltrosFacturas = {}) => {
    try {
      setFiltrosActivos(filtros);
      setEstado(prev => ({ ...prev, cargandoFacturas: true, error: null }));
      
      await ejecutarListarFacturas();
      
    } catch (error: any) {
      console.error('Error al listar facturas:', error);
      mostrarError('Error al cargar facturas', error.message);
    }
  }, [ejecutarListarFacturas, mostrarError]);

  /**
   * Crear nueva factura
   */
  const crearFactura = useCallback(async (datosFactura: DatosFactura): Promise<RespuestaFactura | null> => {
    try {
      mostrarCarga('Creando factura...');
      
      // Validar antes de crear si está habilitado
      if (configuracion.validarStockAntes) {
        const validacion = await FacturacionAPI.validarFactura(datosFactura);
        if (!validacion.valido) {
          mostrarError('Datos inválidos', validacion.errores.join(', '));
          return null;
        }

        if (validacion.stock_insuficiente.length > 0) {
          const productos = validacion.stock_insuficiente
            .map(item => `${item.producto} (disponible: ${item.stock_disponible})`)
            .join(', ');
          mostrarAdvertencia('Stock insuficiente', `Sin stock suficiente para: ${productos}`);
          return null;
        }
      }

      const resultado = await ejecutarCrearFactura(datosFactura);
      
      if (resultado) {
        mostrarExito('¡Factura creada!', `Factura ${resultado.factura.numero_completo} creada exitosamente`);
        
        // Enviar a SUNAT automáticamente si está configurado
        if (configuracion.enviarSunatAutomatico) {
          enviarASunat(resultado.factura.id);
        }

        // Actualizar lista de facturas
        await listarFacturas(filtrosActivos);
        
        return resultado;
      }

      return null;
    } catch (error: any) {
      console.error('Error al crear factura:', error);
      mostrarError('Error al crear factura', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [
    configuracion.validarStockAntes, 
    configuracion.enviarSunatAutomatico,
    ejecutarCrearFactura, 
    mostrarCarga, 
    ocultarCarga, 
    mostrarExito, 
    mostrarError, 
    mostrarAdvertencia,
    filtrosActivos,
    listarFacturas
  ]);

  /**
   * Obtener factura por ID
   */
  const obtenerFactura = useCallback(async (id: number): Promise<Factura | null> => {
    try {
      setEstado(prev => ({ ...prev, cargandoFactura: true }));
      
      const factura = await ejecutarObtenerFactura(id);
      
      if (factura) {
        setEstado(prev => ({
          ...prev,
          facturaActual: factura,
          cargandoFactura: false,
        }));
        return factura;
      }

      return null;
    } catch (error: any) {
      console.error('Error al obtener factura:', error);
      setEstado(prev => ({
        ...prev,
        cargandoFactura: false,
        error: error.message,
      }));
      mostrarError('Error al cargar factura', error.message);
      return null;
    }
  }, [ejecutarObtenerFactura, mostrarError]);

  /**
   * Actualizar factura (solo borrador)
   */
  const actualizarFactura = useCallback(async (id: number, datosFactura: Partial<DatosFactura>): Promise<boolean> => {
    try {
      mostrarCarga('Actualizando factura...');
      
      const resultado = await FacturacionAPI.actualizarFactura(id, datosFactura);
      
      if (resultado) {
        mostrarExito('Factura actualizada', 'Los cambios se guardaron correctamente');
        
        // Actualizar en el estado si es la factura actual
        if (estado.facturaActual?.id === id) {
          setEstado(prev => ({
            ...prev,
            facturaActual: resultado.factura,
          }));
        }

        // Actualizar lista
        await listarFacturas(filtrosActivos);
        
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error al actualizar factura:', error);
      mostrarError('Error al actualizar', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [estado.facturaActual, filtrosActivos, listarFacturas, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Anular factura
   */
  const anularFactura = useCallback(async (id: number, motivo: string): Promise<boolean> => {
    try {
      mostrarCarga('Anulando factura...');
      
      await FacturacionAPI.anularFactura(id, motivo);
      
      mostrarExito('Factura anulada', 'La factura fue anulada correctamente');
      
      // Actualizar lista
      await listarFacturas(filtrosActivos);
      
      return true;
    } catch (error: any) {
      console.error('Error al anular factura:', error);
      mostrarError('Error al anular', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [filtrosActivos, listarFacturas, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Enviar factura a SUNAT
   */
  const enviarASunat = useCallback(async (id: number): Promise<boolean> => {
    try {
      mostrarCarga('Enviando a SUNAT...');
      
      const estadoSunat = await FacturacionAPI.enviarASunat(id);
      
      if (estadoSunat.codigo_respuesta === '0') {
        mostrarExito('Enviado a SUNAT', 'El documento fue aceptado por SUNAT');
      } else if (estadoSunat.aceptada_con_observaciones) {
        mostrarAdvertencia('Aceptado con observaciones', estadoSunat.descripcion_respuesta);
      } else {
        mostrarError('Rechazado por SUNAT', estadoSunat.descripcion_respuesta);
      }
      
      // Actualizar lista para reflejar cambios de estado
      await listarFacturas(filtrosActivos);
      
      return estadoSunat.codigo_respuesta === '0' || estadoSunat.aceptada_con_observaciones;
    } catch (error: any) {
      console.error('Error al enviar a SUNAT:', error);
      mostrarError('Error en envío SUNAT', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [filtrosActivos, listarFacturas, mostrarCarga, ocultarCarga, mostrarExito, mostrarError, mostrarAdvertencia]);

  /**
   * Consultar estado en SUNAT
   */
  const consultarEstadoSunat = useCallback(async (id: number): Promise<EstadoSunat | null> => {
    try {
      mostrarCarga('Consultando estado SUNAT...');
      
      const estado = await FacturacionAPI.consultarEstadoSunat(id);
      
      mostrarInfo('Estado consultado', `Estado actual: ${estado.descripcion_respuesta}`);
      
      return estado;
    } catch (error: any) {
      console.error('Error al consultar estado SUNAT:', error);
      mostrarError('Error en consulta', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [mostrarCarga, ocultarCarga, mostrarInfo, mostrarError]);

  /**
   * Descargar PDF de factura
   */
  const descargarPDF = useCallback(async (id: number, nombreFactura: string): Promise<boolean> => {
    try {
      mostrarCarga('Generando PDF...');
      
      const blob = await FacturacionAPI.descargarPDF(id);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nombreFactura}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      mostrarExito('PDF descargado', 'El archivo se descargó correctamente');
      
      return true;
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      mostrarError('Error en descarga', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Duplicar factura
   */
  const duplicarFactura = useCallback(async (id: number): Promise<RespuestaFactura | null> => {
    try {
      mostrarCarga('Duplicando factura...');
      
      const resultado = await FacturacionAPI.duplicarFactura(id);
      
      if (resultado) {
        mostrarExito('Factura duplicada', `Nueva factura creada: ${resultado.factura.numero_completo}`);
        
        // Actualizar lista
        await listarFacturas(filtrosActivos);
        
        return resultado;
      }

      return null;
    } catch (error: any) {
      console.error('Error al duplicar factura:', error);
      mostrarError('Error al duplicar', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [filtrosActivos, listarFacturas, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Validar factura antes de guardar
   */
  const validarFactura = useCallback(async (datosFactura: DatosFactura): Promise<ResultadoValidacion> => {
    try {
      const validacion = await FacturacionAPI.validarFactura(datosFactura);
      
      return {
        valido: validacion.valido,
        errores: validacion.errores,
        warnings: validacion.warnings,
        stockInsuficiente: validacion.stock_insuficiente,
      };
    } catch (error: any) {
      console.error('Error al validar factura:', error);
      return {
        valido: false,
        errores: [error.message],
        warnings: [],
        stockInsuficiente: [],
      };
    }
  }, []);

  /**
   * Obtener resumen de ventas
   */
  const obtenerResumenVentas = useCallback(async (
    fechaDesde: string,
    fechaHasta: string,
    tipoDocumento?: TipoDocumento
  ): Promise<ResumenVentas | null> => {
    try {
      mostrarCarga('Generando resumen...');
      
      const resumen = await FacturacionAPI.obtenerResumenVentas(fechaDesde, fechaHasta, tipoDocumento);
      
      return resumen;
    } catch (error: any) {
      console.error('Error al obtener resumen:', error);
      mostrarError('Error en resumen', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [mostrarCarga, ocultarCarga, mostrarError]);

  // =======================================================
  // FUNCIONES DE UTILIDADES
  // =======================================================

  /**
   * Limpiar estado de facturación
   */
  const limpiarEstado = useCallback(() => {
    setEstado({
      facturas: [],
      facturaActual: null,
      series: estado.series,
      formasPago: estado.formasPago,
      totalFacturas: 0,
      paginaActual: 1,
      totalPaginas: 1,
      cargandoFacturas: false,
      cargandoFactura: false,
      cargandoSeries: false,
      error: null,
    });
    setFiltrosActivos({});
  }, [estado.series, estado.formasPago]);

  /**
   * Actualizar configuración
   */
  const actualizarConfiguracion = useCallback((nuevaConfig: Partial<ConfiguracionFacturacion>) => {
    setConfiguracion(prev => ({ ...prev, ...nuevaConfig }));
  }, []);

  /**
   * Obtener serie por defecto según tipo de documento
   */
  const obtenerSerieDefecto = useCallback((tipoDocumento: TipoDocumento): string => {
    switch (tipoDocumento) {
      case 'factura':
        return configuracion.serieDefectoFactura;
      case 'boleta':
        return configuracion.serieDefectoBoleta;
      default:
        return configuracion.serieDefectoFactura;
    }
  }, [configuracion]);

  // =======================================================
  // VALORES COMPUTADOS
  // =======================================================

  const estadisticas = useMemo(() => {
    const facturas = estado.facturas;
    
    return {
      totalFacturas: facturas.length,
      totalFacturado: facturas.reduce((acc, f) => acc + f.total, 0),
      facturasPendientes: facturas.filter(f => f.estado === 'pendiente').length,
      facturasEmitidas: facturas.filter(f => f.estado === 'emitida').length,
      facturasAnuladas: facturas.filter(f => f.estado === 'anulada').length,
      promedioFactura: facturas.length > 0 
        ? facturas.reduce((acc, f) => acc + f.total, 0) / facturas.length 
        : 0,
    };
  }, [estado.facturas]);

  const cargando = useMemo(() => ({
    facturas: estado.cargandoFacturas || cargandoListaFacturas,
    factura: estado.cargandoFactura || cargandoObtenerFactura,
    series: estado.cargandoSeries,
    creando: cargandoCrearFactura,
  }), [
    estado.cargandoFacturas,
    estado.cargandoFactura,
    estado.cargandoSeries,
    cargandoListaFacturas,
    cargandoObtenerFactura,
    cargandoCrearFactura
  ]);

  // =======================================================
  // RETURN DEL HOOK
  // =======================================================

  return {
    // Estado
    facturas: estado.facturas,
    facturaActual: estado.facturaActual,
    series: estado.series,
    formasPago: estado.formasPago,
    totalFacturas: estado.totalFacturas,
    paginaActual: estado.paginaActual,
    totalPaginas: estado.totalPaginas,
    filtrosActivos,
    configuracion,
    estadisticas,
    error: estado.error,
    cargando,

    // Funciones principales
    listarFacturas,
    crearFactura,
    obtenerFactura,
    actualizarFactura,
    anularFactura,
    enviarASunat,
    consultarEstadoSunat,
    descargarPDF,
    duplicarFactura,
    validarFactura,
    obtenerResumenVentas,

    // Utilidades
    calcularTotalesFactura,
    limpiarEstado,
    actualizarConfiguracion,
    obtenerSerieDefecto,
    cargarDatosIniciales,

    // Formatters útiles
    formatearMoneda: (monto: number) => formatearMoneda(monto),
  };
};

export default useFacturacion;