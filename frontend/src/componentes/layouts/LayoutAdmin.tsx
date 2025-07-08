/**
 * Layout Administrativo Principal - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Layout base para todas las páginas administrativas
 */

import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDashboardAdmin } from '../../hooks/useDashboardAdmin';
import { useAuth } from '../../hooks/useAuth';
import SidebarAdmin from '../admin/SidebarAdmin';
import HeaderAdmin from '../admin/HeaderAdmin';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES
// =======================================================

interface PropiedadesLayoutAdmin {
  children?: React.ReactNode;
  titulo?: string;
  descripcion?: string;
  mostrarSidebar?: boolean;
  mostrarHeader?: boolean;
  className?: string;
}

interface PropiedadesErrorBoundary {
  children: React.ReactNode;
}

interface EstadoErrorBoundary {
  hasError: boolean;
  error: Error | null;
}

// =======================================================
// COMPONENTE ERROR BOUNDARY
// =======================================================

class ErrorBoundaryAdmin extends React.Component<PropiedadesErrorBoundary, EstadoErrorBoundary> {
  constructor(props: PropiedadesErrorBoundary) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): EstadoErrorBoundary {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error en Layout Admin:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Error en el Sistema
              </h2>
              <p className="text-gray-600 mb-4">
                Ocurrió un error inesperado. Por favor, recarga la página.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recargar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// =======================================================
// COMPONENTE LOADING
// =======================================================

const LoadingLayout: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando sistema administrativo...</p>
    </div>
  </div>
);

// =======================================================
// COMPONENTE BREADCRUMBS
// =======================================================

interface PropiedadesBreadcrumbs {
  items: Array<{
    texto: string;
    enlace?: string;
  }>;
}

const Breadcrumbs: React.FC<PropiedadesBreadcrumbs> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>/</span>}
          {item.enlace ? (
            <a
              href={item.enlace}
              className="hover:text-gray-700 transition-colors"
            >
              {item.texto}
            </a>
          ) : (
            <span className="text-gray-900 font-medium">{item.texto}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL LAYOUT
// =======================================================

const LayoutAdmin: React.FC<PropiedadesLayoutAdmin> = ({
  children,
  titulo,
  descripcion,
  mostrarSidebar = true,
  mostrarHeader = true,
  className
}) => {
  // Hooks
  const location = useLocation();
  const { usuario, estaAutenticado, estaCargando } = useAuth();
  const { estado, acciones } = useDashboardAdmin();

  // =======================================================
  // EFECTOS
  // =======================================================

  // Verificar autenticación
  useEffect(() => {
    if (!estaCargando && !estaAutenticado) {
      window.location.href = '/login';
    }
  }, [estaAutenticado, estaCargando]);

  // Actualizar título de la página
  useEffect(() => {
    const tituloBase = 'FELICITAFAC - Sistema de Facturación';
    if (titulo) {
      document.title = `${titulo} - ${tituloBase}`;
    } else {
      document.title = tituloBase;
    }
  }, [titulo]);

  // Detectar cambios de ruta para analytics
  useEffect(() => {
    // TODO: Implementar tracking de navegación
    console.log('Navegación a:', location.pathname);
  }, [location]);

  // =======================================================
  // ESTADOS DE CARGA
  // =======================================================

  if (estaCargando) {
    return <LoadingLayout />;
  }

  if (!estaAutenticado || !usuario) {
    return <LoadingLayout />;
  }

  // =======================================================
  // GENERAR BREADCRUMBS AUTOMÁTICOS
  // =======================================================

  const generarBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ texto: 'Dashboard', enlace: '/admin' }];

    if (pathSegments.length > 1) {
      const modulosMap: Record<string, string> = {
        facturacion: 'Facturación',
        comercial: 'Gestión Comercial',
        inventario: 'Inventario',
        contabilidad: 'Contabilidad',
        reportes: 'Reportes',
        sistema: 'Administración'
      };

      if (pathSegments[1] && modulosMap[pathSegments[1]]) {
        breadcrumbs.push({
          texto: modulosMap[pathSegments[1]],
          enlace: `/admin/${pathSegments[1]}`
        });
      }

      // Agregar submódulos si existen
      if (pathSegments[2]) {
        const submodoulo = pathSegments[2].replace('-', ' ');
        breadcrumbs.push({
          texto: submodoulo.charAt(0).toUpperCase() + submodoulo.slice(1)
        });
      }
    }

    return breadcrumbs;
  };

  // =======================================================
  // RENDER PRINCIPAL
  // =======================================================

  return (
    <ErrorBoundaryAdmin>
      <Helmet>
        <title>{titulo ? `${titulo} - FELICITAFAC` : 'FELICITAFAC - Sistema de Facturación'}</title>
        {descripcion && <meta name="description" content={descripcion} />}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2563eb" />
      </Helmet>

      <div className={cn('min-h-screen bg-gray-50 flex', className)}>
        {/* Sidebar */}
        {mostrarSidebar && (
          <SidebarAdmin
            abierto={estado.sidebarAbierto}
            onToggle={acciones.toggleSidebar}
          />
        )}

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          {mostrarHeader && (
            <HeaderAdmin
              titulo={titulo || 'Dashboard Administrativo'}
              subtitulo={descripcion}
              mostrarBreadcrumbs={true}
            />
          )}

          {/* Área de Contenido */}
          <main className="flex-1 overflow-y-auto">
            {children || <Outlet />}
          </main>

          {/* Footer opcional */}
          <footer className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                <span>© 2024 FELICITAFAC - Sistema de Facturación Electrónica</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Usuario: {usuario.nombres} {usuario.apellidos}</span>
                <span>•</span>
                <span>Rol: {usuario.rol_detalle?.nombre}</span>
                <span>•</span>
                <span>
                  Última sesión: {usuario.fecha_ultimo_login ? 
                    new Date(usuario.fecha_ultimo_login).toLocaleString('es-PE') : 
                    'Primera vez'
                  }
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Overlay para móvil cuando sidebar está abierto */}
      {estado.sidebarAbierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={acciones.toggleSidebar}
        />
      )}
    </ErrorBoundaryAdmin>
  );
};

// =======================================================
// COMPONENTES AUXILIARES EXPORTADOS
// =======================================================

/**
 * Layout mínimo sin sidebar para páginas especiales
 */
export const LayoutAdminMinimo: React.FC<{
  children: React.ReactNode;
  titulo?: string;
}> = ({ children, titulo }) => (
  <LayoutAdmin
    mostrarSidebar={false}
    mostrarHeader={false}
    titulo={titulo}
  >
    {children}
  </LayoutAdmin>
);

/**
 * Layout solo con header para páginas que no necesitan sidebar
 */
export const LayoutAdminSoloHeader: React.FC<{
  children: React.ReactNode;
  titulo?: string;
  descripcion?: string;
}> = ({ children, titulo, descripcion }) => (
  <LayoutAdmin
    mostrarSidebar={false}
    mostrarHeader={true}
    titulo={titulo}
    descripcion={descripcion}
  >
    {children}
  </LayoutAdmin>
);

export default LayoutAdmin;