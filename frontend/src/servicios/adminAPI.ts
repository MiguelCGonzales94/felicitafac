/**
 * Servicios API para Panel Administrativo - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Comunicación con el backend Django para datos del dashboard
 */

import {
  RespuestaMetricasAPI,
  RespuestaDocumentosRecientesAPI,
  RespuestaNotificacionesAPI,
  MetricasDashboard,
  DocumentoReciente,
  Notificacion,
  FiltrosDocumentos
} from '../types/admin';

// =======================================================
// CONFIGURACIÓN BASE
// =======================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_ADMIN_PREFIX = '/api/admin';

/**
 * Configuración por defecto para fetch
 */
const configuracionFetchBase = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Obtener token de autenticación
 */
const obtenerToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Configurar headers con autenticación
 */
const configurarHeaders = (): HeadersInit => {
  const token = obtenerToken();
  const headers: HeadersInit = {
    ...configuracionFetchBase.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Función base para realizar peticiones
 */
const peticionAPI = async <T>(
  endpoint: string,
  opciones: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const configuracion: RequestInit = {
    ...opciones,
    headers: {
      ...configurarHeaders(),
      ...opciones.headers,
    },
  };

  try {
    const respuesta = await fetch(url, configuracion);

    if (!respuesta.ok) {
      // Manejar errores HTTP
      if (respuesta.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }

      const errorData = await respuesta.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        errorData?.detail || 
        `Error ${respuesta.status}: ${respuesta.statusText}`
      );
    }

    return await respuesta.json();
  } catch (error) {
    console.error(`Error en petición API ${endpoint}:`, error);
    throw error;
  }
};

// =======================================================
// SERVICIOS DE MÉTRICAS
// =======================================================

/**
 * Obtener métricas generales del dashboard
 */
const obtenerMetricasDashboard = async (): Promise<RespuestaMetricasAPI> => {
  try {
    // Si no hay endpoint específico, simular datos realistas
    const datosSimulados: MetricasDashboard = {
      ventas: {
        ventasHoy: 12450.80,
        ventasAyer: 11200.50,
        ventasSemana: 85600.30,
        ventasMes: 324800.75,
        ventasAño: 1250600.45,
        cambioConRespectoDiaAnterior: 11.2,
        cambioConRespectoPeriodoAnterior: 8.5,
        promedioVentasDiarias: 4250.80,
        ticketPromedio: 185.60
      },
      documentos: {
        totalDocumentosHoy: 67,
        documentosPendientes: 8,
        documentosEnviados: 156,
        documentosConError: 3,
        tiempoPromedioEnvio: 45,
        porcentajeExitoso: 95.2
      },
      inventario: {
        productosStockBajo: 15,
        productosStockCritico: 5,
        valorTotalInventario: 89650.30,
        rotacionPromedio: 6.8,
        productosInactivos: 23,
        movimientosHoy: 34
      },
      clientes: {
        clientesNuevosHoy: 5,
        clientesNuevosSemana: 23,
        clientesNuevosMes: 87,
        clientesActivos: 456,
        clientesInactivos: 89,
        ticketPromedioCliente: 285.40
      },
      ultimaActualizacion: new Date()
    };

    // TODO: Reemplazar con petición real cuando el endpoint esté disponible
    // return await peticionAPI<RespuestaMetricasAPI>(`${API_ADMIN_PREFIX}/metricas/dashboard/`);

    return {
      success: true,
      data: datosSimulados,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error obteniendo métricas del dashboard:', error);
    throw error;
  }
};

/**
 * Obtener métricas de ventas específicas
 */
const obtenerMetricasVentas = async (fechaDesde?: string, fechaHasta?: string) => {
  const params = new URLSearchParams();
  if (fechaDesde) params.append('fecha_desde', fechaDesde);
  if (fechaHasta) params.append('fecha_hasta', fechaHasta);

  return await peticionAPI<any>(`${API_ADMIN_PREFIX}/metricas/ventas/?${params.toString()}`);
};

/**
 * Obtener métricas de inventario
 */
const obtenerMetricasInventario = async () => {
  return await peticionAPI<any>(`${API_ADMIN_PREFIX}/metricas/inventario/`);
};

// =======================================================
// SERVICIOS DE DOCUMENTOS
// =======================================================

/**
 * Obtener documentos recientes
 */
const obtenerDocumentosRecientes = async (
  limite: number = 10,
  filtros?: FiltrosDocumentos
): Promise<RespuestaDocumentosRecientesAPI> => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limite.toString());
    params.append('ordering', '-fecha_creacion');

    if (filtros) {
      if (filtros.tipo) {
        filtros.tipo.forEach(tipo => params.append('tipo_documento', tipo));
      }
      if (filtros.estado) {
        filtros.estado.forEach(estado => params.append('estado', estado));
      }
      if (filtros.fechaDesde) params.append('fecha_desde', filtros.fechaDesde);
      if (filtros.fechaHasta) params.append('fecha_hasta', filtros.fechaHasta);
    }

    // Intentar obtener datos reales de la API
    try {
      const respuesta = await peticionAPI<any>(`/api/facturacion/facturas/?${params.toString()}`);
      
      // Transformar datos de la API a formato esperado
      const documentosTransformados: DocumentoReciente[] = respuesta.results?.map((doc: any) => ({
        id: doc.id || doc.uuid,
        tipo: transformarTipoDocumento(doc.tipo_documento || 'Factura'),
        numero: doc.numero_completo || doc.numero || 'N/A',
        cliente: doc.cliente_info?.razon_social || doc.cliente_info?.nombres || 'Cliente N/A',
        clienteId: doc.cliente,
        monto: parseFloat(doc.total || '0'),
        moneda: doc.moneda || 'PEN',
        estado: transformarEstadoDocumento(doc.estado || 'Pendiente'),
        fecha: doc.fecha_emision || doc.fecha_creacion,
        observaciones: doc.observaciones,
        puedeEditar: doc.puede_editar !== false,
        puedeAnular: doc.puede_anular !== false,
        puedeDescargar: true
      })) || [];

      return {
        success: true,
        data: {
          count: respuesta.count || documentosTransformados.length,
          results: documentosTransformados
        }
      };
    } catch (apiError) {
      console.warn('API no disponible, usando datos simulados:', apiError);
      
      // Datos simulados realistas
      const documentosSimulados: DocumentoReciente[] = [
        {
          id: 1,
          tipo: 'Factura',
          numero: 'F001-00001245',
          cliente: 'Empresa ABC S.A.C.',
          clienteId: 1,
          monto: 1250.80,
          moneda: 'PEN',
          estado: 'Enviado',
          fecha: new Date().toISOString(),
          puedeEditar: true,
          puedeAnular: true,
          puedeDescargar: true
        },
        {
          id: 2,
          tipo: 'Boleta',
          numero: 'B001-00002156',
          cliente: 'Juan Pérez García',
          clienteId: 2,
          monto: 385.50,
          moneda: 'PEN',
          estado: 'Pendiente',
          fecha: new Date(Date.now() - 86400000).toISOString(),
          puedeEditar: true,
          puedeAnular: false,
          puedeDescargar: false
        },
        {
          id: 3,
          tipo: 'Nota Crédito',
          numero: 'NC01-00000012',
          cliente: 'Distribuidora XYZ E.I.R.L.',
          clienteId: 3,
          monto: 520.00,
          moneda: 'PEN',
          estado: 'Enviado',
          fecha: new Date(Date.now() - 172800000).toISOString(),
          puedeEditar: false,
          puedeAnular: false,
          puedeDescargar: true
        },
        {
          id: 4,
          tipo: 'Factura',
          numero: 'F001-00001244',
          cliente: 'Servicios Integrales del Norte S.A.',
          clienteId: 4,
          monto: 2100.00,
          moneda: 'PEN',
          estado: 'Enviado',
          fecha: new Date(Date.now() - 259200000).toISOString(),
          puedeEditar: false,
          puedeAnular: true,
          puedeDescargar: true
        }
      ];

      return {
        success: true,
        data: {
          count: documentosSimulados.length,
          results: documentosSimulados
        }
      };
    }
  } catch (error) {
    console.error('Error obteniendo documentos recientes:', error);
    throw error;
  }
};

/**
 * Obtener documentos pendientes SUNAT
 */
const obtenerDocumentosPendientesSUNAT = async () => {
  const params = new URLSearchParams();
  params.append('estado', 'pendiente');
  params.append('ordering', '-fecha_creacion');

  return await peticionAPI<any>(`/api/facturacion/facturas/?${params.toString()}`);
};

// =======================================================
// SERVICIOS DE NOTIFICACIONES
// =======================================================

/**
 * Obtener notificaciones del sistema
 */
const obtenerNotificaciones = async (
  noLeidas: boolean = false
): Promise<RespuestaNotificacionesAPI> => {
  try {
    const params = new URLSearchParams();
    if (noLeidas) params.append('leida', 'false');
    params.append('ordering', '-timestamp');

    // TODO: Implementar endpoint real de notificaciones
    // const respuesta = await peticionAPI<any>(`${API_ADMIN_PREFIX}/notificaciones/?${params.toString()}`);

    // Datos simulados por ahora
    const notificacionesSimuladas: Notificacion[] = [
      {
        id: 'notif_1',
        tipo: 'advertencia',
        titulo: 'Stock Bajo',
        mensaje: '15 productos necesitan reposición urgente',
        modulo: 'inventario',
        prioridad: 'alta',
        timestamp: new Date(),
        leida: false,
        enlace: '/admin/inventario/stock-minimo'
      },
      {
        id: 'notif_2',
        tipo: 'error',
        titulo: 'Documentos Pendientes',
        mensaje: '8 documentos pendientes de envío a SUNAT',
        modulo: 'facturacion',
        prioridad: 'alta',
        timestamp: new Date(Date.now() - 3600000),
        leida: false,
        enlace: '/admin/facturacion/estados-sunat'
      },
      {
        id: 'notif_3',
        tipo: 'exito',
        titulo: 'Backup Completado',
        mensaje: 'Respaldo automático realizado exitosamente',
        modulo: 'sistema',
        prioridad: 'baja',
        timestamp: new Date(Date.now() - 7200000),
        leida: true
      }
    ];

    const noLeidasCount = notificacionesSimuladas.filter(n => !n.leida).length;

    return {
      success: true,
      data: {
        count: notificacionesSimuladas.length,
        results: notificacionesSimuladas,
        no_leidas: noLeidasCount
      }
    };
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    throw error;
  }
};

/**
 * Marcar notificación como leída
 */
const marcarNotificacionLeida = async (notificacionId: string): Promise<void> => {
  try {
    await peticionAPI(`${API_ADMIN_PREFIX}/notificaciones/${notificacionId}/marcar-leida/`, {
      method: 'PATCH'
    });
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    // No lanzar error para no interrumpir la UI
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
const marcarTodasNotificacionesLeidas = async (): Promise<void> => {
  try {
    await peticionAPI(`${API_ADMIN_PREFIX}/notificaciones/marcar-todas-leidas/`, {
      method: 'PATCH'
    });
  } catch (error) {
    console.error('Error marcando todas las notificaciones como leídas:', error);
    // No lanzar error para no interrumpir la UI
  }
};

// =======================================================
// SERVICIOS DE CONFIGURACIÓN
// =======================================================

/**
 * Obtener configuración del dashboard
 */
const obtenerConfiguracionDashboard = async () => {
  return await peticionAPI<any>(`${API_ADMIN_PREFIX}/configuracion/dashboard/`);
};

/**
 * Guardar configuración del dashboard
 */
const guardarConfiguracionDashboard = async (configuracion: any) => {
  return await peticionAPI<any>(`${API_ADMIN_PREFIX}/configuracion/dashboard/`, {
    method: 'POST',
    body: JSON.stringify(configuracion)
  });
};

// =======================================================
// SERVICIOS DE EXPORTACIÓN
// =======================================================

/**
 * Exportar datos a Excel
 */
const exportarExcel = async (tipo: string, filtros?: any): Promise<Blob> => {
  const params = new URLSearchParams();
  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });
  }

  const respuesta = await fetch(
    `${API_BASE_URL}${API_ADMIN_PREFIX}/exportar/${tipo}/excel/?${params.toString()}`,
    {
      headers: configurarHeaders(),
    }
  );

  if (!respuesta.ok) {
    throw new Error('Error al exportar datos');
  }

  return await respuesta.blob();
};

/**
 * Exportar datos a PDF
 */
const exportarPDF = async (tipo: string, filtros?: any): Promise<Blob> => {
  const params = new URLSearchParams();
  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });
  }

  const respuesta = await fetch(
    `${API_BASE_URL}${API_ADMIN_PREFIX}/exportar/${tipo}/pdf/?${params.toString()}`,
    {
      headers: configurarHeaders(),
    }
  );

  if (!respuesta.ok) {
    throw new Error('Error al exportar datos');
  }

  return await respuesta.blob();
};

// =======================================================
// FUNCIONES DE UTILIDAD
// =======================================================

/**
 * Transformar tipo de documento de la API
 */
const transformarTipoDocumento = (tipoAPI: string): 'Factura' | 'Boleta' | 'Nota Crédito' | 'Nota Débito' => {
  const mapeo: Record<string, 'Factura' | 'Boleta' | 'Nota Crédito' | 'Nota Débito'> = {
    'factura': 'Factura',
    'boleta': 'Boleta',
    'nota_credito': 'Nota Crédito',
    'nota_debito': 'Nota Débito',
    '01': 'Factura',
    '03': 'Boleta',
    '07': 'Nota Crédito',
    '08': 'Nota Débito'
  };

  return mapeo[tipoAPI.toLowerCase()] || 'Factura';
};

/**
 * Transformar estado de documento de la API
 */
const transformarEstadoDocumento = (estadoAPI: string): 'Enviado' | 'Pendiente' | 'Error' | 'Anulado' => {
  const mapeo: Record<string, 'Enviado' | 'Pendiente' | 'Error' | 'Anulado'> = {
    'emitido': 'Enviado',
    'enviado': 'Enviado',
    'aceptado': 'Enviado',
    'pendiente': 'Pendiente',
    'borrador': 'Pendiente',
    'error': 'Error',
    'rechazado': 'Error',
    'anulado': 'Anulado',
    'baja': 'Anulado'
  };

  return mapeo[estadoAPI.toLowerCase()] || 'Pendiente';
};

// =======================================================
// EXPORTAR SERVICIOS
// =======================================================

export const serviciosAdmin = {
  // Métricas
  obtenerMetricasDashboard,
  obtenerMetricasVentas,
  obtenerMetricasInventario,

  // Documentos
  obtenerDocumentosRecientes,
  obtenerDocumentosPendientesSUNAT,

  // Notificaciones
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,

  // Configuración
  obtenerConfiguracionDashboard,
  guardarConfiguracionDashboard,

  // Exportación
  exportarExcel,
  exportarPDF,

  // Utilidades
  transformarTipoDocumento,
  transformarEstadoDocumento
};

export default serviciosAdmin;