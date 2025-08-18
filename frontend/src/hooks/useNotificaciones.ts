/**
 * Hook useNotificaciones - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook completo para gestión de notificaciones y alertas del sistema
 * ✅ OPTIMIZADO: Control de requests múltiples
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
  // REFS Y TIMERS - ✅ OPTIMIZADO
  // =======================================================

  const toastIdCounter = useRef(0);
  const intervaloPoll = useRef<NodeJS.Timeout | null>(null);
  const timeoutReconexion = useRef<NodeJS.Timeout | null>(null);
  
  // ✅ NUEVO: Control de requests duplicados
  const requestsEnCurso = useRef<Set<string>>(new Set());
  const ultimaActualizacionContador = useRef<Date | null>(null);
  const inicializado = useRef(false);

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
      cachear: false,
      reintentos: 1 // ✅ OPTIMIZADO: Reducir reintentos
    }
  );

  const {
    data: dataContador,
    ejecutar: ejecutarContadorNoleidasInterno,
    loading: cargandoContador
  } = useApi(
    () => NotificacionesAPI.obtenerContadorNoLeidas(),
    { 
      ejecutarInmediatamente: false,
      cachear: false,
      reintentos: 1 // ✅ OPTIMIZADO: Reducir reintentos
    }
  );

  const {
    ejecutar: ejecutarCrearNotificacion,
    loading: cargandoCrearNotificacion
  } = useApi(
    (notificacion: any) => NotificacionesAPI.crearNotificacion(notificacion),
    { ejecutarInmediatamente: false }
  );

  // ✅ OPTIMIZACIÓN: Wrapper seguro para contador
  const ejecutarContadorNoLeidas = useCallback(async () => {
    const requestKey = 'contador_notificaciones';
    
    // Evitar requests duplicados
    if (requestsEnCurso.current.has(requestKey)) {
      return;
    }

    // Verificar tiempo mínimo entre requests (5 segundos)
    const ahora = new Date();
    if (ultimaActualizacionContador.current) {
      const tiempoTranscurrido = ahora.getTime() - ultimaActualizacionContador.current.getTime();
      if (tiempoTranscurrido < 5000) {
        return;
      }
    }

    try {
      requestsEnCurso.current.add(requestKey);
      ultimaActualizacionContador.current = ahora;
      
      await ejecutarContadorNoleidasInterno();
    } catch (error) {
      console.error('Error al obtener contador:', error);
    } finally {
      requestsEnCurso.current.delete(requestKey);
    }
  }, [ejecutarContadorNoleidasInterno]);

  // =======================================================
  // EFECTOS - ✅ OPTIMIZADOS
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

  // ✅ INICIALIZACIÓN OPTIMIZADA: Con delay y control
  useEffect(() => {
    if (inicializado.current) return;
    
    inicializado.current = true;
    
    // Delay de 2 segundos para evitar rush inicial
    const timer = setTimeout(() => {
      cargarDatosIniciales();
      iniciarActualizacionPeriodica();
      // Conectar tiempo real solo si es necesario
      // conectarTiempoReal();
    }, 2000);

    return () => {
      clearTimeout(timer);
      limpiarRecursos();
    };
  }, []);

  // =======================================================
  // FUNCIONES AUXILIARES - ✅ OPTIMIZADAS
  // =======================================================

  const cargarDatosIniciales = useCallback(async () => {
    try {
      setEstado(prev => ({ ...prev, cargandoDatos: true }));
      
      // ✅ OPTIMIZACIÓN: Configuración básica sin requests externos
      const configuracionBasica: ConfiguracionNotificaciones = {
        habilitar_email: true,
        habilitar_push: true,
        habilitar_sms: false,
        frecuencia_resumen: 'diario',
        horario_silencio_inicio: '22:00',
        horario_silencio_fin: '08:00',
        tipos_habilitados: [],
      };

      setEstado(prev => ({
        ...prev,
        configuracion: configuracionBasica,
        plantillas: [],
        alertas: [],
        cargandoDatos: false,
      }));

      // ✅ OPTIMIZACIÓN: Obtener contador después de 3 segundos
      setTimeout(() => {
        ejecutarContadorNoLeidas();
      }, 3000);

    } catch (error: any) {
      console.error('Error al cargar datos iniciales:', error);
      setEstado(prev => ({
        ...prev,
        cargandoDatos: false,
        error: 'Error al cargar configuración',
      }));
    }
  }, [ejecutarContadorNoLeidas]);

  const iniciarActualizacionPeriodica = useCallback(() => {
    // ✅ OPTIMIZACIÓN: Limpiar intervalo anterior
    if (intervaloPoll.current) {
      clearInterval(intervaloPoll.current);
    }

    // ✅ OPTIMIZACIÓN: Aumentar intervalo de 30 a 60 segundos
    intervaloPoll.current = setInterval(() => {
      ejecutarContadorNoLeidas();
    }, 60000);
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
          
          // Intentar reconectar con límite
          if (conexionTiempoReal.intentosReconexion < 3) {
            intentarReconexion();
          }
        };

        ws.onerror = (error) => {
          console.error('Error en WebSocket de notificaciones:', error);
        };
      }
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
    }
  }, [conexionTiempoReal.intentosReconexion]);

  const intentarReconexion = useCallback(() => {
    setConexionTiempoReal(prev => {
      if (prev.intentosReconexion < 3) { // ✅ OPTIMIZACIÓN: Máximo 3 intentos
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
        setEstado(prev => ({
          ...prev,
          notificaciones: [data.notificacion, ...prev.notificaciones],
          noLeidas: prev.noLeidas + 1,
        }));
        
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

  // ✅ LIMPIEZA MEJORADA
  const limpiarRecursos = useCallback(() => {
    if (intervaloPoll.current) {
      clearInterval(intervaloPoll.current);
      intervaloPoll.current = null;
    }
    
    if (timeoutReconexion.current) {
      clearTimeout(timeoutReconexion.current);
      timeoutReconexion.current = null;
    }
    
    if (conexionTiempoReal.websocket) {
      conexionTiempoReal.websocket.close();
    }

    // Limpiar control de requests
    requestsEnCurso.current.clear();
  }, [conexionTiempoReal.websocket]);

  const generarIdToast = useCallback(() => {
    return `toast-${++toastIdCounter.current}`;
  }, []);

  // =======================================================
  // FUNCIONES DE TOAST (SIN CAMBIOS)
  // =======================================================

  const mostrarToast = useCallback((toast: Omit<NotificacionToast, 'id'>) => {
    const id = generarIdToast();
    const nuevoToast: NotificacionToast = {
      id,
      duracion: 5000,
      ...toast,
    };

    setToasts(prev => [...prev, nuevoToast]);

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
  // FUNCIONES PRINCIPALES (MANTENER FUNCIONALIDAD COMPLETA)
  // =======================================================

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

  const marcarComoLeida = useCallback(async (id: number): Promise<boolean> => {
    try {
      await NotificacionesAPI.marcarComoLeida(id);
      
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

  const marcarTodasComoLeidas = useCallback(async (): Promise<boolean> => {
    try {
      mostrarCarga('Marcando todas como leídas...');
      
      const resultado = await NotificacionesAPI.marcarTodasComoLeidas();
      
      if (resultado) {
        mostrarExito('Completado', `${resultado.notificaciones_actualizadas} notificaciones marcadas como leídas`);
        
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

  const archivarNotificacion = useCallback(async (id: number): Promise<boolean> => {
    try {
      await NotificacionesAPI.archivarNotificacion(id);
      
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

  const eliminarNotificacion = useCallback(async (id: number): Promise<boolean> => {
    try {
      await NotificacionesAPI.eliminarNotificacion(id);
      
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

  const refrescarContador = useCallback(async () => {
    await ejecutarContadorNoLeidas();
  }, [ejecutarContadorNoLeidas]);

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