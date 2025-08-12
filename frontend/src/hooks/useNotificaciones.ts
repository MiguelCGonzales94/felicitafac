/**
 * Hook useNotificaciones - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook completo para gestión de notificaciones y alertas del sistema
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useApi } from './useApi';
import { useCarga } from '../componentes/comunes/ComponenteCarga';
import NotificacionesAPI from '../servicios/notificacionesAPI';
import { 
  Notificacion,
  TipoNotificacion,
  PrioridadNotificacion,
  EstadoNotificacion,
  CanalNotificacion,
  FiltrosNotificaciones,
  PlantillaNotificacion,
  ConfiguracionNotificaciones,
  EstadisticasNotificaciones,
  AlertaSistema,
  NotificacionMasiva
} from '../types/notificaciones';
import { RespuestaPaginada } from '../types/common';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

interface EstadoNotificaciones {
  notificaciones: Notificacion[];
  notificacionActual: Notificacion | null;
  plantillas: PlantillaNotificacion[];
  alertas: AlertaSistema[];
  configuracion: ConfiguracionNotificaciones | null;
  totalNotificaciones: number;
  noLeidas: number;
  paginaActual: number;
  totalPaginas: number;
  cargandoNotificaciones: boolean;
  cargandoNotificacion: boolean;
  cargandoDatos: boolean;
  error: string | null;
}

interface NotificacionToast {
  id: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo: string;
  mensaje: string;
  duracion?: number;
  acciones?: Array<{
    texto: string;
    accion: () => void;
    tipo?: 'primary' | 'secondary';
  }>;
  persistente?: boolean;
}

interface ConexionTiempoReal {
  conectado: boolean;
  websocket: WebSocket | null;
  intentosReconexion: number;
  ultimaConexion: Date | null;
}

// =======================================================
// HOOK PRINCIPAL
// =======================================================

export const useNotificaciones = () => {
  // =======================================================
  // ESTADO LOCAL
  // =======================================================

  const [estado, setEstado] = useState<EstadoNotificaciones>({
    notificaciones: [],
    notificacionActual: null,
    plantillas: [],
    alertas: [],
    configuracion: null,
    totalNotificaciones: 0,
    noLeidas: 0,
    paginaActual: 1,
    totalPaginas: 1,
    cargandoNotificaciones: false,
    cargandoNotificacion: false,
    cargandoDatos: false,
    error: null,
  });

  const [filtrosActivos, setFiltrosActivos] = useState<FiltrosNotificaciones>({});
  const [toasts, setToasts] = useState<NotificacionToast[]>([]);
  const [conexionTiempoReal, setConexionTiempoReal] = useState<ConexionTiempoReal>({
    conectado: false,
    websocket: null,
    intentosReconexion: 0,
    ultimaConexion: null,
  });

  // =======================================================
  // REFS Y TIMERS
  // =======================================================

  const toastIdCounter = useRef(0);
  const intervaloPoll = useRef<NodeJS.Timeout | null>(null);
  const timeoutReconexion = useRef<NodeJS.Timeout | null>(null);

  // =======================================================
  // HOOKS EXTERNOS
  // =======================================================

  const { mostrarCarga, ocultarCarga } = useCarga();

  // Hooks API especializados
  const {
    data: dataNotificaciones,
    loading: cargandoListaNotificaciones,
    ejecutar: ejecutarListarNotificaciones,
    error: errorListaNotificaciones
  } = useApi(
    () => NotificacionesAPI.listarNotificaciones(filtrosActivos),
    { 
      ejecutarInmediatamente: false,
      cachear: false // Las notificaciones no se cachean
    }
  );

  const {
    data: dataContador,
    ejecutar: ejecutarContadorNoLeidas
  } = useApi(
    () => NotificacionesAPI.obtenerContadorNoLeidas(),
    { 
      ejecutarInmediatamente: false,
      cachear: false
    }
  );

  const {
    ejecutar: ejecutarCrearNotificacion,
    loading: cargandoCrearNotificacion
  } = useApi(
    (notificacion: any) => NotificacionesAPI.crearNotificacion(notificacion),
    { ejecutarInmediatamente: false }
  );

  // =======================================================
  // EFECTOS
  // =======================================================

  // Actualizar estado cuando cambien los datos de notificaciones
  useEffect(() => {
    if (dataNotificaciones) {
      setEstado(prev => ({
        ...prev,
        notificaciones: dataNotificaciones.results || [],
        totalNotificaciones: dataNotificaciones.count || 0,
        paginaActual: dataNotificaciones.page || 1,
        totalPaginas: Math.ceil((dataNotificaciones.count || 0) / (filtrosActivos.limite || 10)),
        cargandoNotificaciones: false,
        error: null,
      }));
    }
  }, [dataNotificaciones, filtrosActivos.limite]);

  // Actualizar contador de no leídas
  useEffect(() => {
    if (dataContador) {
      setEstado(prev => ({
        ...prev,
        noLeidas: dataContador.count || 0,
      }));
    }
  }, [dataContador]);

  // Manejar errores
  useEffect(() => {
    if (errorListaNotificaciones) {
      setEstado(prev => ({
        ...prev,
        error: errorListaNotificaciones,
        cargandoNotificaciones: false,
      }));
    }
  }, [errorListaNotificaciones]);

  // Inicializar datos y conexión
  useEffect(() => {
    cargarDatosIniciales();
    iniciarActualizacionPeriodica();
    conectarTiempoReal();

    return () => {
      limpiarRecursos();
    };
  }, []);

  // =======================================================
  // FUNCIONES AUXILIARES
  // =======================================================

  const cargarDatosIniciales = useCallback(async () => {
    try {
      setEstado(prev => ({ ...prev, cargandoDatos: true }));
      
      const [plantillas, configuracion, alertas] = await Promise.all([
        NotificacionesAPI.obtenerPlantillas(),
        NotificacionesAPI.obtenerConfiguracion(),
        NotificacionesAPI.obtenerAlertas()
      ]);

      setEstado(prev => ({
        ...prev,
        plantillas,
        configuracion,
        alertas,
        cargandoDatos: false,
      }));

      // Cargar contador inicial
      await ejecutarContadorNoLeidas();

    } catch (error: any) {
      console.error('Error al cargar datos iniciales:', error);
      setEstado(prev => ({
        ...prev,
        cargandoDatos: false,
        error: error.message,
      }));
    }
  }, [ejecutarContadorNoLeidas]);

  const iniciarActualizacionPeriodica = useCallback(() => {
    // Actualizar contador cada 30 segundos
    intervaloPoll.current = setInterval(() => {
      ejecutarContadorNoLeidas();
    }, 30000);
  }, [ejecutarContadorNoLeidas]);

  const conectarTiempoReal = useCallback(async () => {
    try {
      const ws = await NotificacionesAPI.conectarTiempoReal();
      
      if (ws) {
        ws.onopen = () => {
          setConexionTiempoReal(prev => ({
            ...prev,
            conectado: true,
            websocket: ws,
            intentosReconexion: 0,
            ultimaConexion: new Date(),
          }));
          console.log('Conectado a notificaciones en tiempo real');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            manejarNotificacionTiempoReal(data);
          } catch (error) {
            console.error('Error al procesar notificación en tiempo real:', error);
          }
        };

        ws.onclose = () => {
          setConexionTiempoReal(prev => ({
            ...prev,
            conectado: false,
            websocket: null,
          }));
          
          // Intentar reconectar
          intentarReconexion();
        };

        ws.onerror = (error) => {
          console.error('Error en WebSocket de notificaciones:', error);
        };
      }
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
    }
  }, []);

  const intentarReconexion = useCallback(() => {
    setConexionTiempoReal(prev => {
      if (prev.intentosReconexion < 5) {
        const delay = Math.min(1000 * Math.pow(2, prev.intentosReconexion), 30000);
        
        timeoutReconexion.current = setTimeout(() => {
          conectarTiempoReal();
        }, delay);

        return {
          ...prev,
          intentosReconexion: prev.intentosReconexion + 1,
        };
      }
      return prev;
    });
  }, [conectarTiempoReal]);

  const manejarNotificacionTiempoReal = useCallback((data: any) => {
    switch (data.tipo) {
      case 'nueva_notificacion':
        // Agregar nueva notificación al estado
        setEstado(prev => ({
          ...prev,
          notificaciones: [data.notificacion, ...prev.notificaciones],
          noLeidas: prev.noLeidas + 1,
        }));
        
        // Mostrar toast si es importante
        if (data.notificacion.prioridad === 'alta' || data.notificacion.prioridad === 'critica') {
          mostrarToast({
            tipo: data.notificacion.prioridad === 'critica' ? 'error' : 'warning',
            titulo: data.notificacion.titulo,
            mensaje: data.notificacion.mensaje,
            duracion: 8000,
          });
        }
        break;

      case 'notificacion_leida':
        // Actualizar estado de notificación
        setEstado(prev => ({
          ...prev,
          notificaciones: prev.notificaciones.map(n => 
            n.id === data.notificacion_id ? { ...n, leida: true } : n
          ),
          noLeidas: Math.max(0, prev.noLeidas - 1),
        }));
        break;

      case 'contador_actualizado':
        setEstado(prev => ({
          ...prev,
          noLeidas: data.count,
        }));
        break;
    }
  }, []);

  const limpiarRecursos = useCallback(() => {
    if (intervaloPoll.current) {
      clearInterval(intervaloPoll.current);
    }
    
    if (timeoutReconexion.current) {
      clearTimeout(timeoutReconexion.current);
    }
    
    if (conexionTiempoReal.websocket) {
      conexionTiempoReal.websocket.close();
    }
  }, [conexionTiempoReal.websocket]);

  const generarIdToast = useCallback(() => {
    return `toast-${++toastIdCounter.current}`;
  }, []);

  // =======================================================
  // FUNCIONES DE TOAST
  // =======================================================

  const mostrarToast = useCallback((toast: Omit<NotificacionToast, 'id'>) => {
    const id = generarIdToast();
    const nuevoToast: NotificacionToast = {
      id,
      duracion: 5000,
      ...toast,
    };

    setToasts(prev => [...prev, nuevoToast]);

    // Auto-remover si no es persistente
    if (!nuevoToast.persistente && nuevoToast.duracion) {
      setTimeout(() => {
        removerToast(id);
      }, nuevoToast.duracion);
    }
  }, [generarIdToast]);

  const mostrarExito = useCallback((titulo: string, mensaje: string, duracion?: number) => {
    mostrarToast({
      tipo: 'success',
      titulo,
      mensaje,
      duracion: duracion || 4000,
    });
  }, [mostrarToast]);

  const mostrarError = useCallback((titulo: string, mensaje: string, persistente?: boolean) => {
    mostrarToast({
      tipo: 'error',
      titulo,
      mensaje,
      duracion: persistente ? undefined : 8000,
      persistente,
    });
  }, [mostrarToast]);

  const mostrarAdvertencia = useCallback((titulo: string, mensaje: string, duracion?: number) => {
    mostrarToast({
      tipo: 'warning',
      titulo,
      mensaje,
      duracion: duracion || 6000,
    });
  }, [mostrarToast]);

  const mostrarInfo = useCallback((titulo: string, mensaje: string, duracion?: number) => {
    mostrarToast({
      tipo: 'info',
      titulo,
      mensaje,
      duracion: duracion || 5000,
    });
  }, [mostrarToast]);

  const removerToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const limpiarToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // =======================================================
  // FUNCIONES PRINCIPALES
  // =======================================================

  /**
   * Listar notificaciones con filtros
   */
  const listarNotificaciones = useCallback(async (filtros: FiltrosNotificaciones = {}) => {
    try {
      setFiltrosActivos(filtros);
      setEstado(prev => ({ ...prev, cargandoNotificaciones: true, error: null }));
      
      await ejecutarListarNotificaciones();
      
    } catch (error: any) {
      console.error('Error al listar notificaciones:', error);
      mostrarError('Error al cargar notificaciones', error.message);
    }
  }, [ejecutarListarNotificaciones, mostrarError]);

  /**
   * Obtener mis notificaciones
   */
  const obtenerMisNotificaciones = useCallback(async (limite?: number, soloNoLeidas?: boolean): Promise<Notificacion[]> => {
    try {
      const notificaciones = await NotificacionesAPI.obtenerMisNotificaciones(limite, soloNoLeidas);
      return notificaciones;
    } catch (error: any) {
      console.error('Error al obtener mis notificaciones:', error);
      mostrarError('Error', error.message);
      return [];
    }
  }, [mostrarError]);

  /**
   * Crear nueva notificación
   */
  const crearNotificacion = useCallback(async (notificacion: {
    tipo: TipoNotificacion;
    titulo: string;
    mensaje: string;
    destinatario_id?: number;
    destinatarios_ids?: number[];
    prioridad?: PrioridadNotificacion;
    canal?: CanalNotificacion;
    programada_para?: string;
    datos_adicionales?: Record<string, any>;
  }): Promise<Notificacion | null> => {
    try {
      mostrarCarga('Creando notificación...');
      
      const resultado = await ejecutarCrearNotificacion(notificacion);
      
      if (resultado) {
        mostrarExito('Notificación creada', 'La notificación se envió correctamente');
        
        // Actualizar lista si estamos viendo notificaciones
        if (estado.notificaciones.length > 0) {
          await listarNotificaciones(filtrosActivos);
        }
        
        return resultado;
      }

      return null;
    } catch (error: any) {
      console.error('Error al crear notificación:', error);
      mostrarError('Error al crear notificación', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [ejecutarCrearNotificacion, estado.notificaciones.length, filtrosActivos, listarNotificaciones, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Marcar notificación como leída
   */
  const marcarComoLeida = useCallback(async (id: number): Promise<boolean> => {
    try {
      await NotificacionesAPI.marcarComoLeida(id);
      
      // Actualizar en el estado local
      setEstado(prev => ({
        ...prev,
        notificaciones: prev.notificaciones.map(n => 
          n.id === id ? { ...n, leida: true, fecha_lectura: new Date().toISOString() } : n
        ),
        noLeidas: Math.max(0, prev.noLeidas - 1),
      }));
      
      return true;
    } catch (error: any) {
      console.error('Error al marcar como leída:', error);
      mostrarError('Error', error.message);
      return false;
    }
  }, [mostrarError]);

  /**
   * Marcar todas las notificaciones como leídas
   */
  const marcarTodasComoLeidas = useCallback(async (): Promise<boolean> => {
    try {
      mostrarCarga('Marcando todas como leídas...');
      
      const resultado = await NotificacionesAPI.marcarTodasComoLeidas();
      
      if (resultado) {
        mostrarExito('Completado', `${resultado.notificaciones_actualizadas} notificaciones marcadas como leídas`);
        
        // Actualizar estado local
        setEstado(prev => ({
          ...prev,
          notificaciones: prev.notificaciones.map(n => ({ 
            ...n, 
            leida: true, 
            fecha_lectura: new Date().toISOString() 
          })),
          noLeidas: 0,
        }));
        
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error al marcar todas como leídas:', error);
      mostrarError('Error', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Archivar notificación
   */
  const archivarNotificacion = useCallback(async (id: number): Promise<boolean> => {
    try {
      await NotificacionesAPI.archivarNotificacion(id);
      
      // Remover de la lista actual
      setEstado(prev => ({
        ...prev,
        notificaciones: prev.notificaciones.filter(n => n.id !== id),
        totalNotificaciones: prev.totalNotificaciones - 1,
      }));
      
      mostrarInfo('Notificación archivada', 'La notificación se movió al archivo');
      
      return true;
    } catch (error: any) {
      console.error('Error al archivar notificación:', error);
      mostrarError('Error', error.message);
      return false;
    }
  }, [mostrarInfo, mostrarError]);

  /**
   * Eliminar notificación
   */
  const eliminarNotificacion = useCallback(async (id: number): Promise<boolean> => {
    try {
      await NotificacionesAPI.eliminarNotificacion(id);
      
      // Remover de la lista actual
      setEstado(prev => ({
        ...prev,
        notificaciones: prev.notificaciones.filter(n => n.id !== id),
        totalNotificaciones: prev.totalNotificaciones - 1,
      }));
      
      mostrarExito('Notificación eliminada', 'La notificación fue eliminada correctamente');
      
      return true;
    } catch (error: any) {
      console.error('Error al eliminar notificación:', error);
      mostrarError('Error', error.message);
      return false;
    }
  }, [mostrarExito, mostrarError]);

  /**
   * Crear notificación desde plantilla
   */
  const crearDesdeePlantilla = useCallback(async (
    plantillaId: number,
    datos: {
      destinatario_id?: number;
      destinatarios_ids?: number[];
      variables?: Record<string, string>;
      programada_para?: string;
    }
  ): Promise<Notificacion | null> => {
    try {
      mostrarCarga('Creando desde plantilla...');
      
      const notificacion = await NotificacionesAPI.crearDesdeePlantilla(plantillaId, datos);
      
      if (notificacion) {
        mostrarExito('Notificación enviada', 'La notificación se creó desde la plantilla');
        
        // Actualizar lista si estamos viendo notificaciones
        if (estado.notificaciones.length > 0) {
          await listarNotificaciones(filtrosActivos);
        }
        
        return notificacion;
      }

      return null;
    } catch (error: any) {
      console.error('Error al crear desde plantilla:', error);
      mostrarError('Error', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [estado.notificaciones.length, filtrosActivos, listarNotificaciones, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Actualizar configuración de notificaciones
   */
  const actualizarConfiguracion = useCallback(async (config: Partial<ConfiguracionNotificaciones>): Promise<boolean> => {
    try {
      mostrarCarga('Actualizando configuración...');
      
      const nuevaConfig = await NotificacionesAPI.actualizarConfiguracion(config);
      
      setEstado(prev => ({
        ...prev,
        configuracion: nuevaConfig,
      }));
      
      mostrarExito('Configuración actualizada', 'Los cambios se guardaron correctamente');
      
      return true;
    } catch (error: any) {
      console.error('Error al actualizar configuración:', error);
      mostrarError('Error', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Obtener estadísticas de notificaciones
   */
  const obtenerEstadisticas = useCallback(async (
    fechaDesde?: string,
    fechaHasta?: string
  ): Promise<EstadisticasNotificaciones | null> => {
    try {
      mostrarCarga('Obteniendo estadísticas...');
      
      const estadisticas = await NotificacionesAPI.obtenerEstadisticas(fechaDesde, fechaHasta);
      
      return estadisticas;
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      mostrarError('Error', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [mostrarCarga, ocultarCarga, mostrarError]);

  // =======================================================
  // FUNCIONES DE UTILIDADES
  // =======================================================

  /**
   * Refrescar contador de no leídas
   */
  const refrescarContador = useCallback(async () => {
    await ejecutarContadorNoLeidas();
  }, [ejecutarContadorNoLeidas]);

  /**
   * Limpiar estado de notificaciones
   */
  const limpiarEstado = useCallback(() => {
    setEstado({
      notificaciones: [],
      notificacionActual: null,
      plantillas: estado.plantillas,
      alertas: [],
      configuracion: estado.configuracion,
      totalNotificaciones: 0,
      noLeidas: 0,
      paginaActual: 1,
      totalPaginas: 1,
      cargandoNotificaciones: false,
      cargandoNotificacion: false,
      cargandoDatos: false,
      error: null,
    });
    setFiltrosActivos({});
  }, [estado.plantillas, estado.configuracion]);

  /**
   * Reconectar WebSocket manualmente
   */
  const reconectar = useCallback(() => {
    if (conexionTiempoReal.websocket) {
      conexionTiempoReal.websocket.close();
    }
    setConexionTiempoReal(prev => ({
      ...prev,
      intentosReconexion: 0,
    }));
    conectarTiempoReal();
  }, [conexionTiempoReal.websocket, conectarTiempoReal]);

  // =======================================================
  // VALORES COMPUTADOS
  // =======================================================

  const estadisticas = useMemo(() => {
    const notificaciones = estado.notificaciones;
    
    return {
      total: notificaciones.length,
      noLeidas: estado.noLeidas,
      leidas: notificaciones.filter(n => n.leida).length,
      porTipo: notificaciones.reduce((acc, n) => {
        acc[n.tipo] = (acc[n.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      porPrioridad: notificaciones.reduce((acc, n) => {
        acc[n.prioridad] = (acc[n.prioridad] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [estado.notificaciones, estado.noLeidas]);

  const notificacionesRecientes = useMemo(() => {
    return estado.notificaciones
      .filter(n => !n.leida)
      .slice(0, 5)
      .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
  }, [estado.notificaciones]);

  const cargando = useMemo(() => ({
    notificaciones: estado.cargandoNotificaciones || cargandoListaNotificaciones,
    notificacion: estado.cargandoNotificacion,
    datos: estado.cargandoDatos,
    creando: cargandoCrearNotificacion,
  }), [
    estado.cargandoNotificaciones,
    estado.cargandoNotificacion,
    estado.cargandoDatos,
    cargandoListaNotificaciones,
    cargandoCrearNotificacion
  ]);

  // =======================================================
  // RETURN DEL HOOK
  // =======================================================

  return {
    // Estado
    notificaciones: estado.notificaciones,
    notificacionActual: estado.notificacionActual,
    plantillas: estado.plantillas,
    alertas: estado.alertas,
    configuracion: estado.configuracion,
    totalNotificaciones: estado.totalNotificaciones,
    noLeidas: estado.noLeidas,
    paginaActual: estado.paginaActual,
    totalPaginas: estado.totalPaginas,
    filtrosActivos,
    estadisticas,
    notificacionesRecientes,
    error: estado.error,
    cargando,

    // Toast state
    toasts,
    
    // Conexión tiempo real
    conexionTiempoReal,

    // Funciones principales
    listarNotificaciones,
    obtenerMisNotificaciones,
    crearNotificacion,
    marcarComoLeida,
    marcarTodasComoLeidas,
    archivarNotificacion,
    eliminarNotificacion,
    crearDesdeePlantilla,
    actualizarConfiguracion,
    obtenerEstadisticas,

    // Funciones de toast
    mostrarToast,
    mostrarExito,
    mostrarError,
    mostrarAdvertencia,
    mostrarInfo,
    removerToast,
    limpiarToasts,

    // Utilidades
    refrescarContador,
    limpiarEstado,
    reconectar,
    cargarDatosIniciales,
  };
};

export default useNotificaciones;