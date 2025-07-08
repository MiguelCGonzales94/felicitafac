/**
 * Tipos para Panel Administrativo - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Interfaces y tipos específicos para el dashboard admin
 */

import { ReactNode } from 'react';

// =======================================================
// TIPOS BASE
// =======================================================

export type TipoWidget = 'positivo' | 'negativo' | 'neutro';
export type TipoNotificacion = 'error' | 'advertencia' | 'info' | 'exito';
export type PrioridadNotificacion = 'alta' | 'media' | 'baja';
export type EstadoDocumento = 'Enviado' | 'Pendiente' | 'Error' | 'Anulado';
export type TipoDocumento = 'Factura' | 'Boleta' | 'Nota Crédito' | 'Nota Débito';

// =======================================================
// INTERFACES DE NAVEGACIÓN
// =======================================================

/**
 * Submódulo de navegación
 */
export interface SubModulo {
  id: string;
  nombre: string;
  ruta: string;
  icono?: ReactNode;
  notificaciones?: number;
  descripcion?: string;
  activo?: boolean;
}

/**
 * Módulo principal de navegación
 */
export interface ModuloMenu {
  id: string;
  nombre: string;
  icono: ReactNode;
  submodulos: SubModulo[];
  expandido: boolean;
  notificaciones?: number;
  descripcion?: string;
  orden: number;
  activo: boolean;
  rolesPermitidos?: string[];
}

/**
 * Configuración del sidebar
 */
export interface ConfiguracionSidebar {
  expandido: boolean;
  ancho: number;
  tema: 'claro' | 'oscuro';
  posicion: 'izquierda' | 'derecha';
  colapsarAutomatico: boolean;
  recordarEstado: boolean;
}

// =======================================================
// INTERFACES DE WIDGETS
// =======================================================

/**
 * Widget de métrica para dashboard
 */
export interface Widget {
  id: string;
  titulo: string;
  valor: string;
  cambio: string;
  tipo: TipoWidget;
  icono: ReactNode;
  color: string;
  descripcion?: string;
  tendencia?: number[];
  ultimaActualizacion?: Date;
  enlace?: string;
  formatoValor?: 'moneda' | 'numero' | 'porcentaje' | 'texto';
}

/**
 * Configuración de widget
 */
export interface ConfiguracionWidget {
  visible: boolean;
  orden: number;
  tamaño: 'pequeño' | 'mediano' | 'grande';
  actualizacionAutomatica: boolean;
  intervaloActualizacion?: number; // en milisegundos
}

/**
 * Layout del dashboard
 */
export interface LayoutDashboard {
  columnas: number;
  widgets: Record<string, ConfiguracionWidget>;
  tema: 'claro' | 'oscuro';
  actualizacionGlobal: boolean;
}

// =======================================================
// INTERFACES DE NOTIFICACIONES
// =======================================================

/**
 * Notificación del sistema
 */
export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  modulo: string;
  prioridad: PrioridadNotificacion;
  timestamp: Date;
  leida: boolean;
  accion?: {
    texto: string;
    funcion: () => void;
  };
  enlace?: string;
  datos?: Record<string, any>;
}

/**
 * Centro de notificaciones
 */
export interface CentroNotificaciones {
  notificaciones: Notificacion[];
  totalNoLeidas: number;
  configuracion: {
    mostrarEnPantalla: boolean;
    sonido: boolean;
    emailAutomatico: boolean;
    filtrosPorTipo: Record<TipoNotificacion, boolean>;
  };
}

// =======================================================
// INTERFACES DE DOCUMENTOS
// =======================================================

/**
 * Documento reciente para dashboard
 */
export interface DocumentoReciente {
  id: string | number;
  tipo: TipoDocumento;
  numero: string;
  numeroCompleto?: string;
  cliente: string;
  clienteId?: string | number;
  monto: number;
  moneda?: string;
  estado: EstadoDocumento;
  fecha: string;
  fechaVencimiento?: string;
  observaciones?: string;
  vendedor?: string;
  sucursal?: string;
  puedeEditar?: boolean;
  puedeAnular?: boolean;
  puedeDescargar?: boolean;
}

/**
 * Filtros para documentos
 */
export interface FiltrosDocumentos {
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: TipoDocumento[];
  estado?: EstadoDocumento[];
  cliente?: string;
  vendedor?: string;
  montoMinimo?: number;
  montoMaximo?: number;
  busqueda?: string;
}

// =======================================================
// INTERFACES DE MÉTRICAS
// =======================================================

/**
 * Métrica de ventas
 */
export interface MetricaVentas {
  ventasHoy: number;
  ventasAyer: number;
  ventasSemana: number;
  ventasMes: number;
  ventasAño: number;
  cambioConRespectoDiaAnterior: number;
  cambioConRespectoPeriodoAnterior: number;
  promedioVentasDiarias: number;
  ticketPromedio: number;
}

/**
 * Métrica de documentos
 */
export interface MetricaDocumentos {
  totalDocumentosHoy: number;
  documentosPendientes: number;
  documentosEnviados: number;
  documentosConError: number;
  tiempoPromedioEnvio: number;
  porcentajeExitoso: number;
}

/**
 * Métrica de inventario
 */
export interface MetricaInventario {
  productosStockBajo: number;
  productosStockCritico: number;
  valorTotalInventario: number;
  rotacionPromedio: number;
  productosInactivos: number;
  movimientosHoy: number;
}

/**
 * Métrica de clientes
 */
export interface MetricaClientes {
  clientesNuevosHoy: number;
  clientesNuevosSemana: number;
  clientesNuevosMes: number;
  clientesActivos: number;
  clientesInactivos: number;
  ticketPromedioCliente: number;
}

/**
 * Métricas generales del dashboard
 */
export interface MetricasDashboard {
  ventas: MetricaVentas;
  documentos: MetricaDocumentos;
  inventario: MetricaInventario;
  clientes: MetricaClientes;
  ultimaActualizacion: Date;
}

// =======================================================
// INTERFACES DE CONFIGURACIÓN
// =======================================================

/**
 * Configuración del módulo administrativo
 */
export interface ConfiguracionModulo {
  id: string;
  nombre: string;
  activo: boolean;
  configuraciones: {
    general: Record<string, any>;
    permisos: Record<string, boolean>;
    notificaciones: Record<string, boolean>;
    automatizacion: Record<string, any>;
  };
  personalizacion: {
    tema?: string;
    colores?: Record<string, string>;
    layout?: string;
  };
}

/**
 * Configuración global del administrador
 */
export interface ConfiguracionAdmin {
  dashboard: LayoutDashboard;
  sidebar: ConfiguracionSidebar;
  notificaciones: CentroNotificaciones['configuracion'];
  modulos: Record<string, ConfiguracionModulo>;
  preferenciasUsuario: {
    idioma: string;
    zonaHoraria: string;
    formatoFecha: string;
    formatoMoneda: string;
    decimalesMoneda: number;
  };
}

// =======================================================
// INTERFACES DE ACCIONES
// =======================================================

/**
 * Acción rápida del dashboard
 */
export interface AccionRapida {
  id: string;
  titulo: string;
  descripcion?: string;
  icono: ReactNode;
  color: string;
  funcion: () => void;
  enlace?: string;
  activa: boolean;
  rolesPermitidos?: string[];
  badge?: {
    texto: string;
    color: string;
  };
}

/**
 * Grupo de acciones rápidas
 */
export interface GrupoAccionesRapidas {
  id: string;
  titulo: string;
  acciones: AccionRapida[];
  expandido: boolean;
  icono?: ReactNode;
}

// =======================================================
// INTERFACES DE ESTADO
// =======================================================

/**
 * Estado del panel administrativo
 */
export interface EstadoPanelAdmin {
  sidebarAbierto: boolean;
  moduloActual: string | null;
  submoduloActual: string | null;
  cargandoMetricas: boolean;
  errorMetricas: string | null;
  configuracion: ConfiguracionAdmin;
  notificaciones: Notificacion[];
  widgets: Widget[];
  documentosRecientes: DocumentoReciente[];
  metricas: MetricasDashboard | null;
}

/**
 * Acciones del estado administrativo
 */
export interface AccionesEstadoAdmin {
  toggleSidebar: () => void;
  navegarAModulo: (moduloId: string, submoduloId?: string) => void;
  actualizarMetricas: () => Promise<void>;
  marcarNotificacionLeida: (notificacionId: string) => void;
  marcarTodasNotificacionesLeidas: () => void;
  agregarNotificacion: (notificacion: Omit<Notificacion, 'id' | 'timestamp'>) => void;
  actualizarConfiguracion: (configuracion: Partial<ConfiguracionAdmin>) => void;
  resetearEstado: () => void;
}

// =======================================================
// INTERFACES DE RESPUESTA API
// =======================================================

/**
 * Respuesta de la API de métricas
 */
export interface RespuestaMetricasAPI {
  success: boolean;
  data: MetricasDashboard;
  message?: string;
  timestamp: string;
}

/**
 * Respuesta de la API de documentos recientes
 */
export interface RespuestaDocumentosRecientesAPI {
  success: boolean;
  data: {
    count: number;
    results: DocumentoReciente[];
  };
  message?: string;
}

/**
 * Respuesta de la API de notificaciones
 */
export interface RespuestaNotificacionesAPI {
  success: boolean;
  data: {
    count: number;
    results: Notificacion[];
    no_leidas: number;
  };
  message?: string;
}

// =======================================================
// TIPOS DE UTILIDAD
// =======================================================

/**
 * Propiedades comunes de componentes admin
 */
export interface PropiedadesBaseAdmin {
  className?: string;
  children?: ReactNode;
  cargando?: boolean;
  error?: string | null;
}

/**
 * Contexto del panel administrativo
 */
export interface ContextoPanelAdmin {
  estado: EstadoPanelAdmin;
  acciones: AccionesEstadoAdmin;
}

export default {};