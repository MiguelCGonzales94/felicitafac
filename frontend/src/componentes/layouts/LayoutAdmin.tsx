/**
 * Layout Administrativo - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Layout principal para la zona administrativa
 */

import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';
import useDashboardAdmin from '../hooks/useDashboardAdmin';
import SidebarAdmin from '../componentes/admin/sidebarAdmin';
import HeaderAdmin from '../componentes/admin/HeaderAdmin';
import { Alert, AlertDescription } from '../componentes/ui/alert';
import { PageLoader } from '../componentes/ui/spinner';

// =======================================================
// INTERFACES
// =======================================================

export interface PropiedadesLayoutAdmin {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  rightContent?: React.ReactNode;
  className?: string;
}

interface ConfiguracionResponsive {
  breakpoint: number;
  isMobile: boolean;
  sidebarCollapsed: boolean;
}

// =======================================================
// CONFIGURACIÓN
// =======================================================

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 64;
const HEADER_HEIGHT = 64;
const MOBILE_BREAKPOINT = 768;

// =======================================================
// COMPONENTE LAYOUT ADMIN
// =======================================================

const LayoutAdmin: React.FC<PropiedadesLayoutAdmin> = ({
  children,
  title,
  description,
  showSidebar = true,
  showHeader = true,
  breadcrumbs,
  rightContent,
  className,
}) => {
  // =======================================================
  // HOOKS Y ESTADO
  // =======================================================
  
  const location = useLocation();
  const { 
    usuario, 
    estaAutenticado, 
    estaCargando,
    puedeAccederModulo 
  } = useAuth();
  
  const {
    estado: estadoAdmin,
    acciones: accionesAdmin,
  } = useDashboardAdmin();
  
  // Estado local
  const [responsiveConfig, setResponsiveConfig] = useState<ConfiguracionResponsive>({
    breakpoint: MOBILE_BREAKPOINT,
    isMobile: false,
    sidebarCollapsed: false,
  });
  
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  
  // =======================================================
  // EFECTOS
  // =======================================================
  
  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setResponsiveConfig(prev => ({
        ...prev,
        isMobile,
        sidebarCollapsed: isMobile ? true : prev.sidebarCollapsed,
      }));
      
      // Cerrar sidebar móvil en desktop
      if (!isMobile) {
        setSidebarMobileOpen(false);
      }
    };
    
    // Configuración inicial
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Cerrar sidebar móvil al cambiar de ruta
  useEffect(() => {
    setSidebarMobileOpen(false);
  }, [location.pathname]);
  
  // Sincronizar con estado global del sidebar
  useEffect(() => {
    if (!responsiveConfig.isMobile) {
      setResponsiveConfig(prev => ({
        ...prev,
        sidebarCollapsed: !estadoAdmin.sidebarAbierto,
      }));
    }
  }, [estadoAdmin.sidebarAbierto, responsiveConfig.isMobile]);
  
  // Obtener notificaciones no leídas
  useEffect(() => {
    const noLeidas = estadoAdmin.notificaciones.filter(n => !n.leida).length;
    setNotificacionesNoLeidas(noLeidas);
  }, [estadoAdmin.notificaciones]);
  
  // =======================================================
  // VERIFICACIONES DE ACCESO
  // =======================================================
  
  // Loading state
  if (estaCargando) {
    return <PageLoader show={true} message="Verificando acceso..." />;
  }
  
  // Verificar autenticación
  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Verificar acceso a zona admin
  if (!puedeAccederModulo('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <Alert variant="error">
            <AlertDescription>
              No tienes permisos para acceder al panel administrativo.
              <br />
              <a href="/" className="text-blue-600 hover:underline mt-2 inline-block">
                Volver al inicio
              </a>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  
  // =======================================================
  // MANEJADORES DE EVENTOS
  // =======================================================
  
  const handleToggleSidebar = () => {
    if (responsiveConfig.isMobile) {
      setSidebarMobileOpen(!sidebarMobileOpen);
    } else {
      accionesAdmin.toggleSidebar();
    }
  };
  
  const handleCloseMobileSidebar = () => {
    setSidebarMobileOpen(false);
  };
  
  // =======================================================
  // CONFIGURACIÓN DE CLASES CSS
  // =======================================================
  
  const layoutClasses = cn(
    'min-h-screen bg-gray-50 flex',
    className
  );
  
  const sidebarClasses = cn(
    'fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transition-all duration-300',
    responsiveConfig.isMobile
      ? cn(
          'w-80 transform',
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )
      : cn(
          'relative',
          responsiveConfig.sidebarCollapsed 
            ? `w-${SIDEBAR_COLLAPSED_WIDTH}px` 
            : `w-${SIDEBAR_WIDTH}px`
        )
  );
  
  const mainClasses = cn(
    'flex-1 flex flex-col min-w-0',
    !responsiveConfig.isMobile && showSidebar && (
      responsiveConfig.sidebarCollapsed 
        ? `ml-${SIDEBAR_COLLAPSED_WIDTH}px` 
        : `ml-${SIDEBAR_WIDTH}px`
    )
  );
  
  const headerClasses = cn(
    'bg-white border-b border-gray-200 shadow-sm z-20',
    `h-${HEADER_HEIGHT}px`
  );
  
  const contentClasses = cn(
    'flex-1 overflow-auto',
    showHeader && `mt-${HEADER_HEIGHT}px`,
    'relative'
  );
  
  // =======================================================
  // TÍTULO DINÁMICO
  // =======================================================
  
  const pageTitle = React.useMemo(() => {
    if (title) return `${title} - FELICITAFAC Admin`;
    
    // Títulos automáticos basados en la ruta
    const pathTitles: Record<string, string> = {
      '/admin': 'Dashboard',
      '/admin/facturacion': 'Facturación',
      '/admin/clientes': 'Clientes',
      '/admin/productos': 'Productos',
      '/admin/inventario': 'Inventario',
      '/admin/contabilidad': 'Contabilidad',
      '/admin/reportes': 'Reportes',
      '/admin/usuarios': 'Usuarios',
      '/admin/configuracion': 'Configuración',
    };
    
    const currentTitle = pathTitles[location.pathname] || 'Administración';
    return `${currentTitle} - FELICITAFAC`;
  }, [title, location.pathname]);
  
  // =======================================================
  // RENDER
  // =======================================================
  
  return (
    <>
      {/* Meta tags dinámicos */}
      <Helmet>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className={layoutClasses}>
        {/* Overlay para móvil */}
        {responsiveConfig.isMobile && sidebarMobileOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseMobileSidebar}
          />
        )}
        
        {/* Sidebar */}
        {showSidebar && (
          <aside className={sidebarClasses}>
            <SidebarAdmin
              abierto={responsiveConfig.isMobile ? sidebarMobileOpen : !responsiveConfig.sidebarCollapsed}
              onToggle={handleToggleSidebar}
              onClose={handleCloseMobileSidebar}
              isMobile={responsiveConfig.isMobile}
              usuario={usuario}
              moduloActivo={estadoAdmin.moduloActual}
              notificacionesNoLeidas={notificacionesNoLeidas}
            />
          </aside>
        )}
        
        {/* Contenido principal */}
        <div className={mainClasses}>
          {/* Header */}
          {showHeader && (
            <header className={headerClasses}>
              <HeaderAdmin
                usuario={usuario}
                onToggleSidebar={handleToggleSidebar}
                showMenuButton={showSidebar}
                breadcrumbs={breadcrumbs}
                rightContent={rightContent}
                notificacionesNoLeidas={notificacionesNoLeidas}
                sidebarAbierto={responsiveConfig.isMobile ? sidebarMobileOpen : !responsiveConfig.sidebarCollapsed}
              />
            </header>
          )}
          
          {/* Contenido de la página */}
          <main className={contentClasses}>
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </>
  );
};

// =======================================================
// COMPONENTES AUXILIARES
// =======================================================

/**
 * Layout Admin con configuración específica
 */
export const LayoutAdminPage: React.FC<PropiedadesLayoutAdmin> = (props) => (
  <LayoutAdmin {...props} />
);

/**
 * Layout para dashboards con padding estándar
 */
export const LayoutAdminDashboard: React.FC<PropiedadesLayoutAdmin> = ({ 
  children, 
  className,
  ...props 
}) => (
  <LayoutAdmin 
    className={cn('p-6', className)}
    {...props}
  >
    <div className="max-w-7xl mx-auto w-full">
      {children}
    </div>
  </LayoutAdmin>
);

/**
 * Layout para formularios centrados
 */
export const LayoutAdminForm: React.FC<PropiedadesLayoutAdmin & {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}> = ({ 
  children, 
  maxWidth = 'lg',
  className,
  ...props 
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };
  
  return (
    <LayoutAdmin 
      className={cn('p-6', className)}
      {...props}
    >
      <div className={cn('mx-auto w-full', maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </LayoutAdmin>
  );
};

/**
 * Layout para páginas de listado con herramientas
 */
export const LayoutAdminList: React.FC<PropiedadesLayoutAdmin & {
  toolbar?: React.ReactNode;
  filters?: React.ReactNode;
}> = ({ 
  children, 
  toolbar,
  filters,
  className,
  ...props 
}) => (
  <LayoutAdmin 
    className={className}
    {...props}
  >
    <div className="p-6 space-y-6">
      {/* Barra de herramientas */}
      {toolbar && (
        <div className="flex items-center justify-between">
          {toolbar}
        </div>
      )}
      
      {/* Filtros */}
      {filters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {filters}
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="bg-white rounded-lg border border-gray-200">
        {children}
      </div>
    </div>
  </LayoutAdmin>
);

// =======================================================
// HOC PARA PROTECCIÓN DE RUTAS
// =======================================================

/**
 * HOC para proteger rutas administrativas
 */
export const withAdminAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions?: string[]
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { usuario, estaAutenticado, puedeAccederModulo, tienePermiso } = useAuth();
    
    if (!estaAutenticado) {
      return <Navigate to="/login" replace />;
    }
    
    if (!puedeAccederModulo('admin')) {
      return <Navigate to="/" replace />;
    }
    
    if (requiredPermissions) {
      const hasPermissions = requiredPermissions.every(permission => 
        tienePermiso(permission)
      );
      
      if (!hasPermissions) {
        return (
          <LayoutAdmin>
            <div className="flex items-center justify-center min-h-[400px]">
              <Alert variant="error">
                <AlertDescription>
                  No tienes permisos suficientes para acceder a esta sección.
                </AlertDescription>
              </Alert>
            </div>
          </LayoutAdmin>
        );
      }
    }
    
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `withAdminAuth(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// =======================================================
// HOOK PERSONALIZADO PARA LAYOUT
// =======================================================

/**
 * Hook para manejar configuración del layout
 */
export const useLayoutAdmin = () => {
  const { estado, acciones } = useDashboardAdmin();
  const [configuracion, setConfiguracion] = useState({
    sidebarAbierto: estado.sidebarAbierto,
    tema: 'claro',
    densidad: 'normal',
  });
  
  const actualizarConfiguracion = React.useCallback((nuevaConfig: Partial<typeof configuracion>) => {
    setConfiguracion(prev => ({ ...prev, ...nuevaConfig }));
  }, []);
  
  return {
    configuracion,
    actualizarConfiguracion,
    toggleSidebar: acciones.toggleSidebar,
    estado: estado,
  };
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default LayoutAdmin;