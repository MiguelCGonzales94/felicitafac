/**
 * Dashboard Administrativo Principal - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Página principal del panel administrativo
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  RefreshCw, 
  Settings, 
  Download,
  TrendingUp,
  Calendar,
  Filter,
  BarChart3
} from 'lucide-react';
import { useDashboardAdmin } from '../../hooks/useDashboardAdmin';
import { useNavegacionAdmin } from '../../hooks/useNavegacionAdmin';
import { useAuth } from '../../hooks/useAuth';
import SidebarAdmin from '../../componentes/admin/SidebarAdmin';
import HeaderAdmin from '../../componentes/admin/HeaderAdmin';
import WidgetMetrica, { GridWidgets } from '../../componentes/admin/WidgetMetrica';
import TablaDocumentosRecientes from '../../componentes/admin/TablaDocumentosRecientes';
import { AccesosRapidosDashboard } from '../../componentes/admin/AccesosRapidos';
import { Notificacion } from '../../types/admin';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES
// =======================================================

interface PropiedadesDashboardAdmin {
  className?: string;
}

interface PropiedadesNotificacionesPendientes {
  notificaciones: Notificacion[];
  onMarcarLeida: (id: string) => void;
  onMarcarTodasLeidas: () => void;
}

interface PropiedadesFiltrosPeriodo {
  onCambiarPeriodo: (periodo: string) => void;
  periodoActual: string;
}

// =======================================================
// COMPONENTE NOTIFICACIONES PENDIENTES
// =======================================================

const NotificacionesPendientes: React.FC<PropiedadesNotificacionesPendientes> = ({
  notificaciones,
  onMarcarLeida,
  onMarcarTodasLeidas
}) => {
  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida);

  if (notificacionesNoLeidas.length === 0) return null;

  const obtenerColorNotificacion = (tipo: string) => {
    const colores = {
      error: 'bg-red-50 border-l-4 border-red-400',
      advertencia: 'bg-yellow-50 border-l-4 border-yellow-400',
      info: 'bg-blue-50 border-l-4 border-blue-400',
      exito: 'bg-green-50 border-l-4 border-green-400'
    };
    return colores[tipo as keyof typeof colores] || 'bg-gray-50 border-l-4 border-gray-400';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Notificaciones Pendientes</h3>
          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
            {notificacionesNoLeidas.length}
          </span>
        </div>
        <button
          onClick={onMarcarTodasLeidas}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Marcar todas como leídas
        </button>
      </div>

      <div className="space-y-3">
        {notificacionesNoLeidas.slice(0, 3).map((notificacion) => (
          <div
            key={notificacion.id}
            className={cn(
              'p-4 rounded-lg cursor-pointer transition-colors hover:bg-opacity-80',
              obtenerColorNotificacion(notificacion.tipo)
            )}
            onClick={() => onMarcarLeida(notificacion.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{notificacion.titulo}</p>
                <p className="text-sm text-gray-600 mt-1">{notificacion.mensaje}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {notificacion.modulo} • {notificacion.timestamp.toLocaleTimeString('es-PE')}
                </p>
              </div>
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
            </div>
          </div>
        ))}
      </div>

      {notificacionesNoLeidas.length > 3 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Y {notificacionesNoLeidas.length - 3} notificaciones más...
          </p>
        </div>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE FILTROS DE PERÍODO
// =======================================================

const FiltrosPeriodo: React.FC<PropiedadesFiltrosPeriodo> = ({
  onCambiarPeriodo,
  periodoActual
}) => {
  const periodos = [
    { id: 'hoy', nombre: 'Hoy' },
    { id: 'semana', nombre: 'Esta Semana' },
    { id: 'mes', nombre: 'Este Mes' },
    { id: 'año', nombre: 'Este Año' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Calendar className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">Período de Análisis</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {periodos.map((periodo) => (
          <button
            key={periodo.id}
            onClick={() => onCambiarPeriodo(periodo.id)}
            className={cn(
              'px-3 py-2 text-sm rounded-lg transition-colors',
              periodoActual === periodo.id
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {periodo.nombre}
          </button>
        ))}
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const DashboardAdmin: React.FC<PropiedadesDashboardAdmin> = ({ className }) => {
  // Estados locales
  const [periodoAnalisis, setPeriodoAnalisis] = useState('hoy');
  const [actualizandoManual, setActualizandoManual] = useState(false);

  // Hooks
  const { usuario, utilidades } = useAuth();
  const {
    estado,
    acciones,
    widgetsConfigurados,
    notificacionesNoLeidas,
    cargandoMetricas,
    documentosRecientes,
    notificaciones,
    obtenerDocumentosRecientes
  } = useDashboardAdmin();

  const { navegarA } = useNavegacionAdmin();

  // =======================================================
  // FUNCIONES
  // =======================================================

  const handleActualizarDatos = async () => {
    setActualizandoManual(true);
    try {
      await Promise.all([
        acciones.actualizarMetricas(),
        obtenerDocumentosRecientes()
      ]);
    } catch (error) {
      console.error('Error actualizando datos:', error);
    } finally {
      setActualizandoManual(false);
    }
  };

  const handleVerDocumento = (documento: any) => {
    navegarA(`/admin/facturacion/documentos/${documento.id}`);
  };

  const handleEditarDocumento = (documento: any) => {
    navegarA(`/admin/facturacion/documentos/${documento.id}/editar`);
  };

  const handleDescargarDocumento = (documento: any) => {
    // TODO: Implementar descarga de documento
    console.log('Descargar documento:', documento.id);
  };

  const handleAnularDocumento = (documento: any) => {
    // TODO: Implementar anulación de documento
    console.log('Anular documento:', documento.id);
  };

  const handleExportarDatos = () => {
    // TODO: Implementar exportación de datos
    console.log('Exportar datos del dashboard');
  };

  const handleCambiarPeriodo = (periodo: string) => {
    setPeriodoAnalisis(periodo);
    // TODO: Implementar filtrado por período
    console.log('Cambiar período a:', periodo);
  };

  // =======================================================
  // EFECTOS
  // =======================================================

  useEffect(() => {
    // Título de la página
    document.title = 'Dashboard Administrativo - FELICITAFAC';
  }, []);

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className={cn('min-h-screen bg-gray-50 flex', className)}>
      {/* Sidebar */}
      <SidebarAdmin
        abierto={estado.sidebarAbierto}
        onToggle={acciones.toggleSidebar}
      />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <HeaderAdmin
          titulo="Dashboard Administrativo"
          subtitulo={`Bienvenido, ${usuario?.nombres || 'Usuario'} - ${utilidades?.obtenerSaludo() || 'Buenos días'}`}
          mostrarBreadcrumbs={false}
        />

        {/* Contenido del Dashboard */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Barra de herramientas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Resumen Ejecutivo
              </h2>
              {estado.metricas?.ultimaActualizacion && (
                <span className="text-sm text-gray-500">
                  Última actualización: {estado.metricas.ultimaActualizacion.toLocaleTimeString('es-PE')}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleActualizarDatos}
                disabled={actualizandoManual || cargandoMetricas}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={cn(
                  'h-4 w-4 mr-2',
                  (actualizandoManual || cargandoMetricas) && 'animate-spin'
                )} />
                Actualizar
              </button>
              
              <button
                onClick={handleExportarDatos}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              
              <button
                onClick={() => navegarA('/admin/configuracion')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </button>
            </div>
          </div>

          {/* Error de carga */}
          {estado.errorMetricas && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error cargando datos
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {estado.errorMetricas}
                  </p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={handleActualizarDatos}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Widgets de Métricas */}
          <GridWidgets
            widgets={widgetsConfigurados}
            columnas={4}
            cargando={cargandoMetricas}
          />

          {/* Contenido Principal del Dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Columna Principal - Documentos y Gráficos */}
            <div className="xl:col-span-3 space-y-6">
              {/* Documentos Recientes */}
              <TablaDocumentosRecientes
                documentos={documentosRecientes}
                cargando={cargandoMetricas}
                onActualizar={obtenerDocumentosRecientes}
                onVerDocumento={handleVerDocumento}
                onEditarDocumento={handleEditarDocumento}
                onDescargarDocumento={handleDescargarDocumento}
                onAnularDocumento={handleAnularDocumento}
                limite={5}
              />

              {/* Gráfico de Tendencias (Placeholder) */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Tendencias de Ventas</h3>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Ver detalle
                  </button>
                </div>
                
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Gráfico de tendencias</p>
                    <p className="text-sm">Próximamente disponible</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Lateral - Accesos Rápidos y Notificaciones */}
            <div className="space-y-6">
              {/* Filtros de Período */}
              <FiltrosPeriodo
                onCambiarPeriodo={handleCambiarPeriodo}
                periodoActual={periodoAnalisis}
              />

              {/* Notificaciones Pendientes */}
              {notificacionesNoLeidas > 0 && (
                <NotificacionesPendientes
                  notificaciones={notificaciones}
                  onMarcarLeida={acciones.marcarNotificacionLeida}
                  onMarcarTodasLeidas={acciones.marcarTodasNotificacionesLeidas}
                />
              )}

              {/* Accesos Rápidos */}
              <AccesosRapidosDashboard compacto={false} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;