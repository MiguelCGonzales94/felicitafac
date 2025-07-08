/**
 * Header Administrativo - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Cabecera con búsqueda, notificaciones y perfil
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  User, 
  Settings,
  LogOut,
  ChevronDown,
  Home,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardAdmin } from '../../hooks/useDashboardAdmin';
import { useNavegacionAdmin } from '../../hooks/useNavegacionAdmin';
import { Notificacion, TipoNotificacion } from '../../types/admin';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES
// =======================================================

interface PropiedadesHeaderAdmin {
  titulo?: string;
  subtitulo?: string;
  className?: string;
  mostrarBreadcrumbs?: boolean;
}

interface PropiedadesDropdownNotificaciones {
  notificaciones: Notificacion[];
  noLeidas: number;
  onMarcarLeida: (id: string) => void;
  onMarcarTodasLeidas: () => void;
  onCerrar: () => void;
}

interface PropiedadesDropdownUsuario {
  onCerrarSesion: () => void;
  onCerrar: () => void;
}

// =======================================================
// COMPONENTE DROPDOWN NOTIFICACIONES
// =======================================================

const DropdownNotificaciones: React.FC<PropiedadesDropdownNotificaciones> = ({
  notificaciones,
  noLeidas,
  onMarcarLeida,
  onMarcarTodasLeidas,
  onCerrar
}) => {
  const obtenerIconoNotificacion = (tipo: TipoNotificacion) => {
    const iconos = {
      error: <AlertTriangle className="h-4 w-4 text-red-500" />,
      advertencia: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      info: <Info className="h-4 w-4 text-blue-500" />,
      exito: <CheckCircle className="h-4 w-4 text-green-500" />
    };
    return iconos[tipo];
  };

  const obtenerColorFondo = (tipo: TipoNotificacion, leida: boolean) => {
    if (leida) return 'bg-gray-50';
    
    const colores = {
      error: 'bg-red-50 border-l-4 border-red-400',
      advertencia: 'bg-yellow-50 border-l-4 border-yellow-400',
      info: 'bg-blue-50 border-l-4 border-blue-400',
      exito: 'bg-green-50 border-l-4 border-green-400'
    };
    return colores[tipo];
  };

  const formatearTiempo = (timestamp: Date) => {
    const ahora = new Date();
    const diferencia = ahora.getTime() - timestamp.getTime();
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos}m`;
    if (horas < 24) return `${horas}h`;
    return `${dias}d`;
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Header del dropdown */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notificaciones</h3>
          {noLeidas > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {noLeidas}
            </span>
          )}
        </div>
        <button
          onClick={onCerrar}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Lista de notificaciones */}
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {notificaciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No hay notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notificaciones.map((notificacion) => (
              <div
                key={notificacion.id}
                className={cn(
                  'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                  obtenerColorFondo(notificacion.tipo, notificacion.leida)
                )}
                onClick={() => !notificacion.leida && onMarcarLeida(notificacion.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {obtenerIconoNotificacion(notificacion.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        'text-sm font-medium',
                        notificacion.leida ? 'text-gray-600' : 'text-gray-900'
                      )}>
                        {notificacion.titulo}
                      </p>
                      <span className="text-xs text-gray-400">
                        {formatearTiempo(notificacion.timestamp)}
                      </span>
                    </div>
                    <p className={cn(
                      'text-sm mt-1',
                      notificacion.leida ? 'text-gray-500' : 'text-gray-700'
                    )}>
                      {notificacion.mensaje}
                    </p>
                    {notificacion.enlace && (
                      <Link
                        to={notificacion.enlace}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                        onClick={onCerrar}
                      >
                        Ver detalles →
                      </Link>
                    )}
                  </div>
                  {!notificacion.leida && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer del dropdown */}
      {notificaciones.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {noLeidas > 0 && (
              <button
                onClick={onMarcarTodasLeidas}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Marcar todas como leídas
              </button>
            )}
            <Link
              to="/admin/notificaciones"
              className="text-sm text-gray-600 hover:text-gray-800"
              onClick={onCerrar}
            >
              Ver todas las notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE DROPDOWN USUARIO
// =======================================================

const DropdownUsuario: React.FC<PropiedadesDropdownUsuario> = ({
  onCerrarSesion,
  onCerrar
}) => {
  const { usuario } = useAuth();

  if (!usuario) return null;

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Info del usuario */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {usuario.nombres?.charAt(0)?.toUpperCase() || 'U'}
              {usuario.apellidos?.charAt(0)?.toUpperCase() || ''}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {usuario.nombres} {usuario.apellidos}
            </p>
            <p className="text-sm text-gray-500 truncate">{usuario.email}</p>
            <p className="text-xs text-blue-600 font-medium">
              {usuario.rol_detalle?.nombre || 'Usuario'}
            </p>
          </div>
        </div>
      </div>

      {/* Opciones del menú */}
      <div className="py-2">
        <Link
          to="/admin/perfil"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={onCerrar}
        >
          <User className="h-4 w-4 mr-3 text-gray-400" />
          Mi Perfil
        </Link>
        <Link
          to="/admin/configuracion"
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={onCerrar}
        >
          <Settings className="h-4 w-4 mr-3 text-gray-400" />
          Configuración
        </Link>
        <div className="border-t border-gray-100 my-1"></div>
        <button
          onClick={() => {
            onCerrarSesion();
            onCerrar();
          }}
          className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3 text-red-400" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL HEADER
// =======================================================

const HeaderAdmin: React.FC<PropiedadesHeaderAdmin> = ({
  titulo = 'Dashboard Administrativo',
  subtitulo = 'Panel de control principal',
  className,
  mostrarBreadcrumbs = true
}) => {
  // Estados
  const [busqueda, setBusqueda] = useState('');
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarUsuario, setMostrarUsuario] = useState(false);

  // Refs
  const refNotificaciones = useRef<HTMLDivElement>(null);
  const refUsuario = useRef<HTMLDivElement>(null);

  // Hooks
  const { usuario, cerrarSesion } = useAuth();
  const { 
    notificaciones, 
    notificacionesNoLeidas,
    acciones
  } = useDashboardAdmin();
  const { breadcrumbs } = useNavegacionAdmin();

  // =======================================================
  // EFECTOS
  // =======================================================

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      if (
        refNotificaciones.current && 
        !refNotificaciones.current.contains(event.target as Node)
      ) {
        setMostrarNotificaciones(false);
      }
      if (
        refUsuario.current && 
        !refUsuario.current.contains(event.target as Node)
      ) {
        setMostrarUsuario(false);
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  // =======================================================
  // FUNCIONES
  // =======================================================

  const handleCerrarSesion = async () => {
    try {
      await cerrarSesion();
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  const handleBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      // TODO: Implementar búsqueda global
      console.log('Buscar:', busqueda);
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <header className={cn(
      'bg-white shadow-sm border-b border-gray-200 px-6 py-4',
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Información del header */}
        <div className="flex-1">
          {/* Breadcrumbs */}
          {mostrarBreadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              <Home className="h-4 w-4" />
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <span>/</span>
                  {item.enlace ? (
                    <Link
                      to={item.enlace}
                      className="hover:text-gray-700 transition-colors"
                    >
                      {item.texto}
                    </Link>
                  ) : (
                    <span className="text-gray-900 font-medium">{item.texto}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Título y subtítulo */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
            {subtitulo && (
              <p className="text-gray-600 mt-1">{subtitulo}</p>
            )}
          </div>
        </div>

        {/* Controles del header */}
        <div className="flex items-center space-x-4">
          {/* Búsqueda */}
          <form onSubmit={handleBusqueda} className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en el sistema..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </form>

          {/* Notificaciones */}
          <div className="relative" ref={refNotificaciones}>
            <button
              onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-6 w-6" />
              {notificacionesNoLeidas > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
                </span>
              )}
            </button>

            {mostrarNotificaciones && (
              <DropdownNotificaciones
                notificaciones={notificaciones}
                noLeidas={notificacionesNoLeidas}
                onMarcarLeida={acciones.marcarNotificacionLeida}
                onMarcarTodasLeidas={acciones.marcarTodasNotificacionesLeidas}
                onCerrar={() => setMostrarNotificaciones(false)}
              />
            )}
          </div>

          {/* Perfil de usuario */}
          <div className="relative" ref={refUsuario}>
            <button
              onClick={() => setMostrarUsuario(!mostrarUsuario)}
              className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {usuario?.nombres?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            {mostrarUsuario && (
              <DropdownUsuario
                onCerrarSesion={handleCerrarSesion}
                onCerrar={() => setMostrarUsuario(false)}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;