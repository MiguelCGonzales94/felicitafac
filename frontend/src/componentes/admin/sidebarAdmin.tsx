/**
 * Sidebar Administrativo - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Navegación lateral con módulos desplegables
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  X, 
  Menu,
  FileText,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavegacionAdmin } from '../../hooks/useNavegacionAdmin';
import { ModuloMenu, SubModulo } from '../../types/admin';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES
// =======================================================

interface PropiedadesSidebarAdmin {
  abierto: boolean;
  onToggle: () => void;
  className?: string;
}

interface PropiedadesModuloItem {
  modulo: ModuloMenu;
  activo: boolean;
  onToggle: (moduloId: string) => void;
  onNavegar: (moduloId: string, submoduloId?: string) => void;
  sidebarAbierto: boolean;
}

interface PropiedadesSubmoduloItem {
  submodulo: SubModulo;
  moduloId: string;
  activo: boolean;
  onNavegar: (moduloId: string, submoduloId: string) => void;
}

// =======================================================
// COMPONENTE SUBMÓDULO
// =======================================================

const SubmoduloItem: React.FC<PropiedadesSubmoduloItem> = ({
  submodulo,
  moduloId,
  activo,
  onNavegar
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavegar(moduloId, submodulo.id);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-center justify-between p-2 pl-4 text-sm rounded-lg transition-all duration-200',
        'hover:bg-gray-100 hover:scale-[1.02]',
        activo 
          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 font-medium' 
          : 'text-gray-600'
      )}
      title={submodulo.descripcion}
    >
      <div className="flex items-center space-x-2">
        {submodulo.icono && (
          <span className={cn(
            'transition-colors',
            activo ? 'text-blue-600' : 'text-gray-400'
          )}>
            {submodulo.icono}
          </span>
        )}
        <span className="text-left">{submodulo.nombre}</span>
      </div>
      
      {submodulo.notificaciones && submodulo.notificaciones > 0 && (
        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] text-center">
          {submodulo.notificaciones > 99 ? '99+' : submodulo.notificaciones}
        </span>
      )}
    </button>
  );
};

// =======================================================
// COMPONENTE MÓDULO
// =======================================================

const ModuloItem: React.FC<PropiedadesModuloItem> = ({
  modulo,
  activo,
  onToggle,
  onNavegar,
  sidebarAbierto
}) => {
  const handleToggleModulo = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle(modulo.id);
  };

  const handleClickModulo = (e: React.MouseEvent) => {
    if (!sidebarAbierto) {
      e.preventDefault();
      // Si sidebar está cerrado, navegar al primer submódulo
      if (modulo.submodulos.length > 0) {
        onNavegar(modulo.id, modulo.submodulos[0].id);
      }
    }
  };

  return (
    <div className="space-y-1">
      {/* Módulo Principal */}
      <button
        onClick={sidebarAbierto ? handleToggleModulo : handleClickModulo}
        className={cn(
          'w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200',
          'hover:bg-gray-100 hover:shadow-sm',
          activo
            ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200'
            : 'text-gray-700 hover:text-gray-900'
        )}
        title={!sidebarAbierto ? modulo.descripcion : undefined}
      >
        <div className="flex items-center space-x-3">
          <span className={cn(
            'transition-colors',
            activo ? 'text-blue-600' : 'text-gray-500'
          )}>
            {modulo.icono}
          </span>
          {sidebarAbierto && (
            <span className="font-medium text-left">{modulo.nombre}</span>
          )}
        </div>
        
        {sidebarAbierto && (
          <div className="flex items-center space-x-2">
            {/* Badge de notificaciones */}
            {modulo.notificaciones && modulo.notificaciones > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {modulo.notificaciones > 99 ? '99+' : modulo.notificaciones}
              </span>
            )}
            
            {/* Icono de expansión */}
            <span className={cn(
              'transition-transform duration-200',
              modulo.expandido ? 'rotate-0' : '-rotate-90'
            )}>
              <ChevronDown className="h-4 w-4" />
            </span>
          </div>
        )}
      </button>

      {/* Submódulos */}
      {modulo.expandido && sidebarAbierto && (
        <div className="ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {modulo.submodulos.map((submodulo) => (
            <SubmoduloItem
              key={submodulo.id}
              submodulo={submodulo}
              moduloId={modulo.id}
              activo={false} // TODO: Implementar detección de submódulo activo
              onNavegar={onNavegar}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL SIDEBAR
// =======================================================

const SidebarAdmin: React.FC<PropiedadesSidebarAdmin> = ({
  abierto,
  onToggle,
  className
}) => {
  // Hooks
  const { usuario, cerrarSesion } = useAuth();
  const { 
    modulosMenu, 
    moduloActivo, 
    toggleModulo, 
    navegarASubmodulo 
  } = useNavegacionAdmin();

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

  const handleNavegacion = (moduloId: string, submoduloId?: string) => {
    if (submoduloId) {
      navegarASubmodulo(moduloId, submoduloId);
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className={cn(
      'bg-white shadow-lg border-r border-gray-200 transition-all duration-300 flex flex-col',
      'relative z-30',
      abierto ? 'w-80' : 'w-16',
      className
    )}>
      {/* Header del Sidebar */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {abierto && (
          <Link 
            to="/admin" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">FELICITAFAC</h1>
              <p className="text-xs text-gray-500">Sistema de Facturación</p>
            </div>
          </Link>
        )}
        
        <button
          onClick={onToggle}
          className={cn(
            'p-2 rounded-lg hover:bg-gray-100 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
          )}
          title={abierto ? 'Cerrar sidebar' : 'Abrir sidebar'}
        >
          {abierto ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {modulosMenu.map((modulo) => (
          <ModuloItem
            key={modulo.id}
            modulo={modulo}
            activo={moduloActivo === modulo.id}
            onToggle={toggleModulo}
            onNavegar={handleNavegacion}
            sidebarAbierto={abierto}
          />
        ))}
      </nav>

      {/* Footer del Sidebar - Usuario */}
      {abierto && usuario && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {usuario.nombres?.charAt(0)?.toUpperCase() || 'U'}
                {usuario.apellidos?.charAt(0)?.toUpperCase() || ''}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {usuario.nombres} {usuario.apellidos}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {usuario.rol_detalle?.nombre || 'Usuario'}
              </p>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Perfil de usuario"
              >
                <User className="h-4 w-4" />
              </button>
              <button
                onClick={handleCerrarSesion}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usuario compacto cuando sidebar está cerrado */}
      {!abierto && usuario && (
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleCerrarSesion}
            className="w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={`Cerrar sesión - ${usuario.nombres} ${usuario.apellidos}`}
          >
            <LogOut className="h-5 w-5 text-gray-400 mx-auto" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarAdmin;