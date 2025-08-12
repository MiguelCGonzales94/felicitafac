/**
 * Servicio API de Notificaciones - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Servicio completo para gestión de notificaciones y alertas
 */

import axios, { AxiosResponse } from 'axios';
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
import { RespuestaPaginada, ParametrosBusqueda } from '../types/common';
import { obtenerToken } from '../utils/auth';

// =======================================================
// CONFIGURACIÓN BASE
// =======================================================

const API_BASE_URL = '/api/notificaciones';

const obtenerConfiguracion = () => ({
  headers: {
    'Authorization': `Bearer ${obtenerToken()}`,
    'Content-Type': 'application/json',
  },
});

// =======================================================
// CLASE PRINCIPAL DEL SERVICIO
// =======================================================

export class NotificacionesAPI {
  // =======================================================
  // MÉTODOS CRUD DE NOTIFICACIONES
  // =======================================================

  /**
   * Crear nueva notificación
   */
  static async crearNotificacion(notificacion: {
    tipo: TipoNotificacion;
    titulo: string;
    mensaje: string;
    destinatario_id?: number;
    destinatarios_ids?: number[];
    prioridad?: PrioridadNotificacion;
    canal?: CanalNotificacion;
    programada_para?: string;
    datos_adicionales?: Record<string, any>;
  }): Promise<Notificacion> {
    try {
      const response: AxiosResponse<Notificacion> = await axios.post(
        `${API_BASE_URL}/notificaciones/`,
        notificacion,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear notificación:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al crear la notificación. Verifique los datos e intente nuevamente.'
      );
    }
  }

  /**
   * Obtener notificación por ID
   */
  static async obtenerNotificacion(id: number): Promise<Notificacion> {
    try {
      const response: AxiosResponse<Notificacion> = await axios.get(
        `${API_BASE_URL}/notificaciones/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener notificación:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener la notificación.'
      );
    }
  }

  /**
   * Actualizar notificación
   */
  static async actualizarNotificacion(id: number, notificacion: Partial<Notificacion>): Promise<Notificacion> {
    try {
      const response: AxiosResponse<Notificacion> = await axios.put(
        `${API_BASE_URL}/notificaciones/${id}/`,
        notificacion,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar notificación:', error);
      throw new Error('Error al actualizar la notificación.');
    }
  }

  /**
   * Eliminar notificación
   */
  static async eliminarNotificacion(id: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.delete(
        `${API_BASE_URL}/notificaciones/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar notificación:', error);
      throw new Error('Error al eliminar la notificación.');
    }
  }

  // =======================================================
  // MÉTODOS DE BÚSQUEDA Y LISTADO
  // =======================================================

  /**
   * Listar notificaciones con filtros y paginación
   */
  static async listarNotificaciones(filtros: FiltrosNotificaciones = {}): Promise<RespuestaPaginada<Notificacion>> {
    try {
      const params = new URLSearchParams();

      // Aplicar filtros
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
      if (filtros.canal) params.append('canal', filtros.canal);
      if (filtros.destinatario_id) params.append('destinatario', filtros.destinatario_id.toString());
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.solo_no_leidas) params.append('no_leidas', 'true');
      if (filtros.solo_importantes) params.append('importantes', 'true');
      
      // Paginación
      if (filtros.pagina) params.append('page', filtros.pagina.toString());
      if (filtros.limite) params.append('page_size', filtros.limite.toString());
      
      // Ordenamiento
      if (filtros.ordenar_por) {
        const orden = filtros.orden === 'desc' ? `-${filtros.ordenar_por}` : filtros.ordenar_por;
        params.append('ordering', orden);
      }

      const response: AxiosResponse<RespuestaPaginada<Notificacion>> = await axios.get(
        `${API_BASE_URL}/notificaciones/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al listar notificaciones:', error);
      throw new Error('Error al obtener la lista de notificaciones.');
    }
  }

  /**
   * Obtener notificaciones del usuario actual
   */
  static async obtenerMisNotificaciones(
    limite?: number,
    soloNoLeidas?: boolean
  ): Promise<Notificacion[]> {
    try {
      const params = new URLSearchParams();
      if (limite) params.append('limit', limite.toString());
      if (soloNoLeidas) params.append('no_leidas', 'true');

      const response: AxiosResponse<{ results: Notificacion[] }> = await axios.get(
        `${API_BASE_URL}/mis-notificaciones/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener mis notificaciones:', error);
      throw new Error('Error al obtener las notificaciones del usuario.');
    }
  }

  /**
   * Buscar notificaciones
   */
  static async buscarNotificaciones(parametros: ParametrosBusqueda): Promise<Notificacion[]> {
    try {
      const params = new URLSearchParams();
      params.append('search', parametros.termino);
      if (parametros.limite) params.append('limit', parametros.limite.toString());

      const response: AxiosResponse<{ results: Notificacion[] }> = await axios.get(
        `${API_BASE_URL}/notificaciones/buscar/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al buscar notificaciones:', error);
      throw new Error('Error en la búsqueda de notificaciones.');
    }
  }

  // =======================================================
  // MÉTODOS DE ACCIONES
  // =======================================================

  /**
   * Marcar notificación como leída
   */
  static async marcarComoLeida(id: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.post(
        `${API_BASE_URL}/notificaciones/${id}/marcar-leida/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al marcar como leída:', error);
      throw new Error('Error al marcar la notificación como leída.');
    }
  }

  /**
   * Marcar notificación como no leída
   */
  static async marcarComoNoLeida(id: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.post(
        `${API_BASE_URL}/notificaciones/${id}/marcar-no-leida/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al marcar como no leída:', error);
      throw new Error('Error al marcar la notificación como no leída.');
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async marcarTodasComoLeidas(): Promise<{ 
    mensaje: string; 
    notificaciones_actualizadas: number 
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/notificaciones/marcar-todas-leidas/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al marcar todas como leídas:', error);
      throw new Error('Error al marcar todas las notificaciones como leídas.');
    }
  }

  /**
   * Archivar notificación
   */
  static async archivarNotificacion(id: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.post(
        `${API_BASE_URL}/notificaciones/${id}/archivar/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al archivar notificación:', error);
      throw new Error('Error al archivar la notificación.');
    }
  }

  /**
   * Restaurar notificación archivada
   */
  static async restaurarNotificacion(id: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.post(
        `${API_BASE_URL}/notificaciones/${id}/restaurar/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al restaurar notificación:', error);
      throw new Error('Error al restaurar la notificación.');
    }
  }

  // =======================================================
  // MÉTODOS DE NOTIFICACIONES MASIVAS
  // =======================================================

  /**
   * Crear notificación masiva
   */
  static async crearNotificacionMasiva(notificacion: {
    tipo: TipoNotificacion;
    titulo: string;
    mensaje: string;
    criterios_destinatarios: {
      roles?: string[];
      departamentos?: string[];
      todos_usuarios?: boolean;
      usuarios_especificos?: number[];
    };
    prioridad?: PrioridadNotificacion;
    canal?: CanalNotificacion;
    programada_para?: string;
  }): Promise<NotificacionMasiva> {
    try {
      const response: AxiosResponse<NotificacionMasiva> = await axios.post(
        `${API_BASE_URL}/notificaciones-masivas/`,
        notificacion,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear notificación masiva:', error);
      throw new Error('Error al crear la notificación masiva.');
    }
  }

  /**
   * Obtener estado de notificación masiva
   */
  static async obtenerEstadoNotificacionMasiva(id: number): Promise<{
    id: number;
    estado: string;
    destinatarios_total: number;
    destinatarios_enviado: number;
    destinatarios_fallidos: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    errores?: string[];
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notificaciones-masivas/${id}/estado/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estado de notificación masiva:', error);
      throw new Error('Error al obtener el estado de la notificación masiva.');
    }
  }

  // =======================================================
  // MÉTODOS DE PLANTILLAS
  // =======================================================

  /**
   * Obtener plantillas de notificaciones
   */
  static async obtenerPlantillas(): Promise<PlantillaNotificacion[]> {
    try {
      const response: AxiosResponse<{ results: PlantillaNotificacion[] }> = await axios.get(
        `${API_BASE_URL}/plantillas/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener plantillas:', error);
      throw new Error('Error al obtener las plantillas de notificaciones.');
    }
  }

  /**
   * Crear plantilla de notificación
   */
  static async crearPlantilla(plantilla: {
    nombre: string;
    tipo: TipoNotificacion;
    titulo: string;
    mensaje: string;
    variables?: string[];
    activo?: boolean;
  }): Promise<PlantillaNotificacion> {
    try {
      const response: AxiosResponse<PlantillaNotificacion> = await axios.post(
        `${API_BASE_URL}/plantillas/`,
        plantilla,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear plantilla:', error);
      throw new Error('Error al crear la plantilla de notificación.');
    }
  }

  /**
   * Actualizar plantilla
   */
  static async actualizarPlantilla(id: number, plantilla: Partial<PlantillaNotificacion>): Promise<PlantillaNotificacion> {
    try {
      const response: AxiosResponse<PlantillaNotificacion> = await axios.put(
        `${API_BASE_URL}/plantillas/${id}/`,
        plantilla,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar plantilla:', error);
      throw new Error('Error al actualizar la plantilla.');
    }
  }

  /**
   * Crear notificación desde plantilla
   */
  static async crearDesdeePlantilla(
    plantillaId: number,
    datos: {
      destinatario_id?: number;
      destinatarios_ids?: number[];
      variables?: Record<string, string>;
      programada_para?: string;
    }
  ): Promise<Notificacion> {
    try {
      const response: AxiosResponse<Notificacion> = await axios.post(
        `${API_BASE_URL}/plantillas/${plantillaId}/crear-notificacion/`,
        datos,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear notificación desde plantilla:', error);
      throw new Error('Error al crear la notificación desde la plantilla.');
    }
  }

  // =======================================================
  // MÉTODOS DE CONFIGURACIÓN
  // =======================================================

  /**
   * Obtener configuración de notificaciones del usuario
   */
  static async obtenerConfiguracion(): Promise<ConfiguracionNotificaciones> {
    try {
      const response: AxiosResponse<ConfiguracionNotificaciones> = await axios.get(
        `${API_BASE_URL}/configuracion/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener configuración:', error);
      throw new Error('Error al obtener la configuración de notificaciones.');
    }
  }

  /**
   * Actualizar configuración de notificaciones
   */
  static async actualizarConfiguracion(config: Partial<ConfiguracionNotificaciones>): Promise<ConfiguracionNotificaciones> {
    try {
      const response: AxiosResponse<ConfiguracionNotificaciones> = await axios.put(
        `${API_BASE_URL}/configuracion/`,
        config,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar configuración:', error);
      throw new Error('Error al actualizar la configuración de notificaciones.');
    }
  }

  // =======================================================
  // MÉTODOS DE ALERTAS DEL SISTEMA
  // =======================================================

  /**
   * Obtener alertas del sistema
   */
  static async obtenerAlertas(): Promise<AlertaSistema[]> {
    try {
      const response: AxiosResponse<{ results: AlertaSistema[] }> = await axios.get(
        `${API_BASE_URL}/alertas/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener alertas:', error);
      throw new Error('Error al obtener las alertas del sistema.');
    }
  }

  /**
   * Crear alerta del sistema
   */
  static async crearAlerta(alerta: {
    tipo: string;
    titulo: string;
    descripcion: string;
    nivel: 'info' | 'warning' | 'error' | 'critical';
    modulo?: string;
    datos_adicionales?: Record<string, any>;
  }): Promise<AlertaSistema> {
    try {
      const response: AxiosResponse<AlertaSistema> = await axios.post(
        `${API_BASE_URL}/alertas/`,
        alerta,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear alerta:', error);
      throw new Error('Error al crear la alerta del sistema.');
    }
  }

  /**
   * Resolver alerta
   */
  static async resolverAlerta(id: number, comentario?: string): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.post(
        `${API_BASE_URL}/alertas/${id}/resolver/`,
        { comentario },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al resolver alerta:', error);
      throw new Error('Error al resolver la alerta.');
    }
  }

  // =======================================================
  // MÉTODOS DE ESTADÍSTICAS
  // =======================================================

  /**
   * Obtener estadísticas de notificaciones
   */
  static async obtenerEstadisticas(
    fechaDesde?: string,
    fechaHasta?: string
  ): Promise<EstadisticasNotificaciones> {
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);

      const response: AxiosResponse<EstadisticasNotificaciones> = await axios.get(
        `${API_BASE_URL}/estadisticas/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error('Error al obtener las estadísticas de notificaciones.');
    }
  }

  /**
   * Obtener contador de notificaciones no leídas
   */
  static async obtenerContadorNoLeidas(): Promise<{ count: number }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/contador-no-leidas/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener contador:', error);
      return { count: 0 };
    }
  }

  // =======================================================
  // MÉTODOS DE EXPORTACIÓN
  // =======================================================

  /**
   * Exportar notificaciones a Excel
   */
  static async exportarExcel(filtros: FiltrosNotificaciones = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response: AxiosResponse<Blob> = await axios.get(
        `${API_BASE_URL}/notificaciones/exportar-excel/?${params.toString()}`,
        {
          ...obtenerConfiguracion(),
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al exportar a Excel:', error);
      throw new Error('Error al exportar las notificaciones a Excel.');
    }
  }

  // =======================================================
  // MÉTODOS DE TIEMPO REAL
  // =======================================================

  /**
   * Conectar a notificaciones en tiempo real (WebSocket)
   */
  static async conectarTiempoReal(): Promise<WebSocket | null> {
    try {
      const token = obtenerToken();
      if (!token) {
        throw new Error('No hay token disponible');
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/notificaciones/?token=${token}`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Conectado a notificaciones en tiempo real');
      };
      
      ws.onerror = (error) => {
        console.error('Error en WebSocket de notificaciones:', error);
      };
      
      return ws;
    } catch (error: any) {
      console.error('Error al conectar WebSocket:', error);
      return null;
    }
  }

  // =======================================================
  // MÉTODOS DE UTILIDADES
  // =======================================================

  /**
   * Limpiar notificaciones antiguas
   */
  static async limpiarNotificacionesAntiguas(diasAtras: number): Promise<{ 
    eliminadas: number; 
    mensaje: string 
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/limpiar-antiguas/`,
        { dias_atras: diasAtras },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al limpiar notificaciones:', error);
      throw new Error('Error al limpiar las notificaciones antiguas.');
    }
  }

  /**
   * Probar envío de notificación
   */
  static async probarEnvio(
    tipo: TipoNotificacion,
    canal: CanalNotificacion,
    destinatario: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/probar-envio/`,
        {
          tipo,
          canal,
          destinatario,
          titulo: 'Prueba de notificación',
          mensaje: 'Esta es una notificación de prueba del sistema FELICITAFAC'
        },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al probar envío:', error);
      throw new Error('Error al probar el envío de notificación.');
    }
  }

  /**
   * Limpiar cache del servicio
   */
  static limpiarCache(): void {
    console.log('Cache de notificaciones limpiado');
  }
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default NotificacionesAPI;