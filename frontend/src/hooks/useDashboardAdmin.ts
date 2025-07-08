/**
 * Hook para Dashboard Administrativo - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Gestión completa del estado del panel administrativo
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  EstadoPanelAdmin, 
  AccionesEstadoAdmin, 
  MetricasDashboard,
  Notificacion,
  DocumentoReciente,
  Widget,
  ConfiguracionAdmin,
  TipoNotificacion
} from '../types/admin';
import { serviciosAdmin } from '../servicios/adminAPI';

// =======================================================
// ESTADO INICIAL
// =======================================================

const estadoInicialAdmin: EstadoPanelAdmin = {
  sidebarAbierto: true,
  moduloActual: null,
  submoduloActual: null,
  cargandoMetricas: false,
  errorMetricas: null,
  configuracion: {
    dashboard: {
      columnas: 4,
      widgets: {},
      tema: 'claro',
      actualizacionGlobal: true
    },
    sidebar: {
      expandido: true,
      ancho: 320,
      tema: 'claro',
      posicion: 'izquierda',
      colapsarAutomatico: false,
      recordarEstado: true
    },
    notificaciones: {
      mostrarEnPantalla: true,
      sonido: false,
      emailAutomatico: true,
      filtrosPorTipo: {
        error: true,
        advertencia: true,
        info: true,
        exito: true
      }
    },
    modulos: {},
    preferenciasUsuario: {
      idioma: 'es',
      zonaHoraria: 'America/Lima',
      formatoFecha: 'DD/MM/YYYY',
      formatoMoneda: 'PEN',
      decimalesMoneda: 2
    }
  },
  notificaciones: [],
  widgets: [],
  documentosRecientes: [],
  metricas: null
};

// =======================================================
// HOOK PRINCIPAL
// =======================================================

export const useDashboardAdmin = () => {
  // Estados locales
  const [estado, setEstado] = useState<EstadoPanelAdmin>(estadoInicialAdmin);
  const [intervalosActualizacion, setIntervalosActualizacion] = useState<NodeJS.Timeout[]>([]);

  // =======================================================
  // FUNCIONES DE MÉTRICAS
  // =======================================================

  /**
   * Obtener métricas del dashboard
   */
  const obtenerMetricas = useCallback(async (): Promise<void> => {
    if (estado.cargandoMetricas) return;

    setEstado(prev => ({ 
      ...prev, 
      cargandoMetricas: true, 
      errorMetricas: null 
    }));

    try {
      const respuesta = await serviciosAdmin.obtenerMetricasDashboard();
      
      if (respuesta.success) {
        setEstado(prev => ({
          ...prev,
          metricas: respuesta.data,
          cargandoMetricas: false,
          errorMetricas: null
        }));
      } else {
        throw new Error(respuesta.message || 'Error al obtener métricas');
      }
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      setEstado(prev => ({
        ...prev,
        cargandoMetricas: false,
        errorMetricas: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [estado.cargandoMetricas]);

  /**
   * Obtener documentos recientes
   */
  const obtenerDocumentosRecientes = useCallback(async (): Promise<void> => {
    try {
      const respuesta = await serviciosAdmin.obtenerDocumentosRecientes();
      
      if (respuesta.success) {
        setEstado(prev => ({
          ...prev,
          documentosRecientes: respuesta.data.results
        }));
      }
    } catch (error) {
      console.error('Error obteniendo documentos recientes:', error);
    }
  }, []);

  /**
   * Obtener notificaciones
   */
  const obtenerNotificaciones = useCallback(async (): Promise<void> => {
    try {
      const respuesta = await serviciosAdmin.obtenerNotificaciones();
      
      if (respuesta.success) {
        setEstado(prev => ({
          ...prev,
          notificaciones: respuesta.data.results
        }));
      }
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
    }
  }, []);

  // =======================================================
  // FUNCIONES DE NAVEGACIÓN
  // =======================================================

  /**
   * Toggle del sidebar
   */
  const toggleSidebar = useCallback((): void => {
    setEstado(prev => {
      const nuevoEstado = !prev.sidebarAbierto;
      
      // Guardar estado en localStorage si está configurado
      if (prev.configuracion.sidebar.recordarEstado) {
        localStorage.setItem('felicitafac_sidebar_abierto', String(nuevoEstado));
      }
      
      return {
        ...prev,
        sidebarAbierto: nuevoEstado,
        configuracion: {
          ...prev.configuracion,
          sidebar: {
            ...prev.configuracion.sidebar,
            expandido: nuevoEstado
          }
        }
      };
    });
  }, []);

  /**
   * Navegar a módulo específico
   */
  const navegarAModulo = useCallback((moduloId: string, submoduloId?: string): void => {
    setEstado(prev => ({
      ...prev,
      moduloActual: moduloId,
      submoduloActual: submoduloId || null
    }));
  }, []);

  // =======================================================
  // FUNCIONES DE NOTIFICACIONES
  // =======================================================

  /**
   * Marcar notificación como leída
   */
  const marcarNotificacionLeida = useCallback((notificacionId: string): void => {
    setEstado(prev => ({
      ...prev,
      notificaciones: prev.notificaciones.map(notificacion =>
        notificacion.id === notificacionId
          ? { ...notificacion, leida: true }
          : notificacion
      )
    }));

    // Llamar API para marcar como leída
    serviciosAdmin.marcarNotificacionLeida(notificacionId).catch(console.error);
  }, []);

  /**
   * Marcar todas las notificaciones como leídas
   */
  const marcarTodasNotificacionesLeidas = useCallback((): void => {
    setEstado(prev => ({
      ...prev,
      notificaciones: prev.notificaciones.map(notificacion => ({
        ...notificacion,
        leida: true
      }))
    }));

    // Llamar API para marcar todas como leídas
    serviciosAdmin.marcarTodasNotificacionesLeidas().catch(console.error);
  }, []);

  /**
   * Agregar nueva notificación
   */
  const agregarNotificacion = useCallback((notificacion: Omit<Notificacion, 'id' | 'timestamp'>): void => {
    const nuevaNotificacion: Notificacion = {
      ...notificacion,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      leida: false
    };

    setEstado(prev => ({
      ...prev,
      notificaciones: [nuevaNotificacion, ...prev.notificaciones]
    }));
  }, []);

  // =======================================================
  // FUNCIONES DE CONFIGURACIÓN
  // =======================================================

  /**
   * Actualizar configuración
   */
  const actualizarConfiguracion = useCallback((configuracionParcial: Partial<ConfiguracionAdmin>): void => {
    setEstado(prev => {
      const nuevaConfiguracion = {
        ...prev.configuracion,
        ...configuracionParcial
      };

      // Guardar en localStorage
      localStorage.setItem('felicitafac_config_admin', JSON.stringify(nuevaConfiguracion));

      return {
        ...prev,
        configuracion: nuevaConfiguracion
      };
    });
  }, []);

  /**
   * Resetear estado
   */
  const resetearEstado = useCallback((): void => {
    setEstado(estadoInicialAdmin);
    localStorage.removeItem('felicitafac_config_admin');
    localStorage.removeItem('felicitafac_sidebar_abierto');
  }, []);

  // =======================================================
  // EFECTOS
  // =======================================================

  /**
   * Cargar configuración guardada al inicializar
   */
  useEffect(() => {
    // Cargar configuración del localStorage
    const configGuardada = localStorage.getItem('felicitafac_config_admin');
    if (configGuardada) {
      try {
        const config = JSON.parse(configGuardada);
        actualizarConfiguracion(config);
      } catch (error) {
        console.error('Error cargando configuración guardada:', error);
      }
    }

    // Cargar estado del sidebar
    const sidebarGuardado = localStorage.getItem('felicitafac_sidebar_abierto');
    if (sidebarGuardado) {
      setEstado(prev => ({
        ...prev,
        sidebarAbierto: sidebarGuardado === 'true'
      }));
    }
  }, [actualizarConfiguracion]);

  /**
   * Configurar actualizaciones automáticas
   */
  useEffect(() => {
    // Limpiar intervalos existentes
    intervalosActualizacion.forEach(clearInterval);

    const nuevosIntervalos: NodeJS.Timeout[] = [];

    // Actualizar métricas cada 30 segundos
    if (estado.configuracion.dashboard.actualizacionGlobal) {
      const intervaloMetricas = setInterval(() => {
        obtenerMetricas();
      }, 30000);
      nuevosIntervalos.push(intervaloMetricas);
    }

    // Actualizar notificaciones cada 60 segundos
    const intervaloNotificaciones = setInterval(() => {
      obtenerNotificaciones();
    }, 60000);
    nuevosIntervalos.push(intervaloNotificaciones);

    // Actualizar documentos cada 2 minutos
    const intervaloDocumentos = setInterval(() => {
      obtenerDocumentosRecientes();
    }, 120000);
    nuevosIntervalos.push(intervaloDocumentos);

    setIntervalosActualizacion(nuevosIntervalos);

    // Cleanup
    return () => {
      nuevosIntervalos.forEach(clearInterval);
    };
  }, [estado.configuracion.dashboard.actualizacionGlobal, obtenerMetricas, obtenerNotificaciones, obtenerDocumentosRecientes]);

  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    obtenerMetricas();
    obtenerDocumentosRecientes();
    obtenerNotificaciones();
  }, [obtenerMetricas, obtenerDocumentosRecientes, obtenerNotificaciones]);

  // =======================================================
  // VALORES COMPUTADOS
  // =======================================================

  const notificacionesNoLeidas = useMemo(() => {
    return estado.notificaciones.filter(n => !n.leida).length;
  }, [estado.notificaciones]);

  const notificacionesPorTipo = useMemo(() => {
    return estado.notificaciones.reduce((acc, notificacion) => {
      acc[notificacion.tipo] = (acc[notificacion.tipo] || 0) + 1;
      return acc;
    }, {} as Record<TipoNotificacion, number>);
  }, [estado.notificaciones]);

  const widgetsConfigurados = useMemo(() => {
    // Generar widgets dinámicamente basados en métricas
    if (!estado.metricas) return [];

    const widgets: Widget[] = [
      {
        id: 'ventas-hoy',
        titulo: 'Ventas de Hoy',
        valor: `S/ ${estado.metricas.ventas.ventasHoy.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
        cambio: `${estado.metricas.ventas.cambioConRespectoDiaAnterior > 0 ? '+' : ''}${estado.metricas.ventas.cambioConRespectoDiaAnterior.toFixed(1)}%`,
        tipo: estado.metricas.ventas.cambioConRespectoDiaAnterior >= 0 ? 'positivo' : 'negativo',
        icono: '💰',
        color: 'bg-green-500',
        enlace: '/admin/reportes-ventas'
      },
      {
        id: 'documentos-pendientes',
        titulo: 'Docs. Pendientes SUNAT',
        valor: estado.metricas.documentos.documentosPendientes.toString(),
        cambio: `${estado.metricas.documentos.totalDocumentosHoy} docs hoy`,
        tipo: estado.metricas.documentos.documentosPendientes > 0 ? 'neutro' : 'positivo',
        icono: '⏰',
        color: estado.metricas.documentos.documentosPendientes > 0 ? 'bg-yellow-500' : 'bg-green-500',
        enlace: '/admin/documentos-pendientes'
      },
      {
        id: 'stock-bajo',
        titulo: 'Productos Stock Bajo',
        valor: estado.metricas.inventario.productosStockBajo.toString(),
        cambio: `${estado.metricas.inventario.productosStockCritico} críticos`,
        tipo: estado.metricas.inventario.productosStockBajo > 0 ? 'negativo' : 'positivo',
        icono: '⚠️',
        color: estado.metricas.inventario.productosStockBajo > 0 ? 'bg-red-500' : 'bg-green-500',
        enlace: '/admin/inventario-stock'
      },
      {
        id: 'clientes-nuevos',
        titulo: 'Clientes Nuevos',
        valor: estado.metricas.clientes.clientesNuevosMes.toString(),
        cambio: `+${estado.metricas.clientes.clientesNuevosHoy} hoy`,
        tipo: 'positivo',
        icono: '👥',
        color: 'bg-blue-500',
        enlace: '/admin/clientes-nuevos'
      }
    ];

    return widgets;
  }, [estado.metricas]);

  // =======================================================
  // ACCIONES OBJETO
  // =======================================================

  const acciones: AccionesEstadoAdmin = {
    toggleSidebar,
    navegarAModulo,
    actualizarMetricas: obtenerMetricas,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas,
    agregarNotificacion,
    actualizarConfiguracion,
    resetearEstado
  };

  // =======================================================
  // RETORNO DEL HOOK
  // =======================================================

  return {
    // Estado
    estado,
    acciones,
    
    // Valores computados
    notificacionesNoLeidas,
    notificacionesPorTipo,
    widgetsConfigurados,
    
    // Estados específicos
    cargandoMetricas: estado.cargandoMetricas,
    errorMetricas: estado.errorMetricas,
    sidebarAbierto: estado.sidebarAbierto,
    moduloActual: estado.moduloActual,
    
    // Funciones adicionales
    obtenerDocumentosRecientes,
    obtenerNotificaciones,
    
    // Datos
    metricas: estado.metricas,
    documentosRecientes: estado.documentosRecientes,
    notificaciones: estado.notificaciones,
    configuracion: estado.configuracion
  };
};

export default useDashboardAdmin;