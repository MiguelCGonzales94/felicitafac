/**
 * Configuración Principal del Router - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Router principal con todas las rutas del sistema
 */

import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { rutasAdmin } from './adminRoutes';
import { RutaProtegida, RutaParaNoAutenticados } from '../componentes/comunes/RutaProtegida';
import ComponenteCarga from '../componentes/comunes/ComponenteCarga';
import ErrorBoundary from '../componentes/comunes/ErrorBoundary';

// =======================================================
// LAZY LOADING DE PÁGINAS PRINCIPALES
// =======================================================

// Páginas principales
const PaginaPrincipal = React.lazy(() => import('../paginas/PaginaPrincipal'));
const Login = React.lazy(() => import('../paginas/Login'));
const Registro = React.lazy(() => import('../paginas/Registro'));

// Dashboard para roles no-admin
const DashboardUsuario = React.lazy(() => import('../paginas/DashboardUsuario'));

// Páginas especiales
const CambiarPassword = React.lazy(() => import('../paginas/CambiarPassword'));
const RecuperarPassword = React.lazy(() => import('../paginas/RecuperarPassword'));
const VerificarEmail = React.lazy(() => import('../paginas/VerificarEmail'));

// Páginas de error
const Pagina404 = React.lazy(() => import('../paginas/errores/Pagina404'));
const Pagina403 = React.lazy(() => import('../paginas/errores/Pagina403'));
const Pagina500 = React.lazy(() => import('../paginas/errores/Pagina500'));

// Páginas informativas
const PoliticaPrivacidad = React.lazy(() => import('../paginas/info/PoliticaPrivacidad'));
const TerminosUso = React.lazy(() => import('../paginas/info/TerminosUso'));
const Soporte = React.lazy(() => import('../paginas/info/Soporte'));

// =======================================================
// COMPONENTE DE SUSPENSE GLOBAL
// =======================================================

const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ComponenteCarga mensaje="Cargando aplicación..." />
      </div>
    }
  >
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </Suspense>
);

// =======================================================
// PÁGINAS PLACEHOLDER PARA DESARROLLO
// =======================================================

const PaginaEnDesarrollo: React.FC<{ titulo: string; descripcion: string }> = ({ 
  titulo, 
  descripcion 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.415-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{titulo}</h2>
      <p className="text-gray-600 mb-6">{descripcion}</p>
      <p className="text-sm text-gray-500">Esta página será implementada en próximas fases.</p>
      <div className="mt-6">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver Atrás
        </button>
      </div>
    </div>
  </div>
);

// =======================================================
// RUTAS DE AUTENTICACIÓN
// =======================================================

const rutasAuth: RouteObject[] = [
  {
    path: '/login',
    element: (
      <RutaParaNoAutenticados redirigirA="/dashboard">
        <SuspenseWrapper>
          <Login />
        </SuspenseWrapper>
      </RutaParaNoAutenticados>
    )
  },
  {
    path: '/registro',
    element: (
      <RutaParaNoAutenticados redirigirA="/dashboard">
        <SuspenseWrapper>
          <PaginaEnDesarrollo 
            titulo="Registro de Usuario"
            descripcion="El sistema de registro estará disponible próximamente."
          />
        </SuspenseWrapper>
      </RutaParaNoAutenticados>
    )
  },
  {
    path: '/recuperar-password',
    element: (
      <RutaParaNoAutenticados>
        <SuspenseWrapper>
          <PaginaEnDesarrollo 
            titulo="Recuperar Contraseña"
            descripcion="La funcionalidad de recuperación de contraseña estará disponible próximamente."
          />
        </SuspenseWrapper>
      </RutaParaNoAutenticados>
    )
  },
  {
    path: '/verificar-email',
    element: (
      <SuspenseWrapper>
        <PaginaEnDesarrollo 
          titulo="Verificar Email"
          descripcion="La verificación de email estará disponible próximamente."
        />
      </SuspenseWrapper>
    )
  },
  {
    path: '/cambiar-password',
    element: (
      <RutaProtegida>
        <SuspenseWrapper>
          <PaginaEnDesarrollo 
            titulo="Cambiar Contraseña"
            descripcion="La funcionalidad para cambiar contraseña estará disponible próximamente."
          />
        </SuspenseWrapper>
      </RutaProtegida>
    )
  }
];

// =======================================================
// RUTAS DEL DASHBOARD USUARIO
// =======================================================

const rutasDashboardUsuario: RouteObject[] = [
  {
    path: '/dashboard',
    element: (
      <RutaProtegida 
        rolesPermitidos={['vendedor', 'cliente']}
        redirigirSiNoPermiso="/admin"
      >
        <SuspenseWrapper>
          <PaginaEnDesarrollo 
            titulo="Dashboard Usuario"
            descripcion="Dashboard específico para vendedores y clientes."
          />
        </SuspenseWrapper>
      </RutaProtegida>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <PaginaEnDesarrollo 
              titulo="Panel de Usuario"
              descripcion="Vista principal para usuarios no administrativos."
            />
          </SuspenseWrapper>
        )
      },
      {
        path: 'perfil',
        element: (
          <SuspenseWrapper>
            <PaginaEnDesarrollo 
              titulo="Perfil de Usuario"
              descripcion="Gestión del perfil personal."
            />
          </SuspenseWrapper>
        )
      },
      {
        path: 'documentos',
        element: (
          <SuspenseWrapper>
            <PaginaEnDesarrollo 
              titulo="Mis Documentos"
              descripcion="Vista de documentos del usuario."
            />
          </SuspenseWrapper>
        )
      }
    ]
  }
];

// =======================================================
// RUTAS INFORMATIVAS Y LEGALES
// =======================================================

const rutasInformativas: RouteObject[] = [
  {
    path: '/terminos',
    element: (
      <SuspenseWrapper>
        <PaginaEnDesarrollo 
          titulo="Términos de Uso"
          descripcion="Términos y condiciones de uso del sistema."
        />
      </SuspenseWrapper>
    )
  },
  {
    path: '/privacidad',
    element: (
      <SuspenseWrapper>
        <PaginaEnDesarrollo 
          titulo="Política de Privacidad"
          descripcion="Información sobre el manejo de datos personales."
        />
      </SuspenseWrapper>
    )
  },
  {
    path: '/soporte',
    element: (
      <SuspenseWrapper>
        <PaginaEnDesarrollo 
          titulo="Soporte Técnico"
          descripcion="Centro de ayuda y soporte técnico."
        />
      </SuspenseWrapper>
    )
  },
  {
    path: '/documentacion',
    element: (
      <SuspenseWrapper>
        <PaginaEnDesarrollo 
          titulo="Documentación"
          descripcion="Guías y manuales de uso del sistema."
        />
      </SuspenseWrapper>
    )
  }
];

// =======================================================
// RUTAS DE ERROR
// =======================================================

const rutasError: RouteObject[] = [
  {
    path: '/403',
    element: (
      <SuspenseWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 mb-6">No tienes permisos para acceder a esta página.</p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver Atrás
            </button>
          </div>
        </div>
      </SuspenseWrapper>
    )
  },
  {
    path: '/500',
    element: (
      <SuspenseWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error del Servidor</h2>
            <p className="text-gray-600 mb-6">Ocurrió un error interno. Por favor, intenta nuevamente.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      </SuspenseWrapper>
    )
  }
];

// =======================================================
// CONFIGURACIÓN PRINCIPAL DEL ROUTER
// =======================================================

export const router = createBrowserRouter([
  // Página principal
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <PaginaPrincipal />
      </SuspenseWrapper>
    )
  },

  // Rutas de autenticación
  ...rutasAuth,

  // Rutas administrativas (importadas desde adminRoutes.tsx)
  ...rutasAdmin,

  // Rutas del dashboard de usuario
  ...rutasDashboardUsuario,

  // Rutas informativas
  ...rutasInformativas,

  // Rutas de error
  ...rutasError,

  // Redirecciones especiales
  {
    path: '/inicio',
    element: <Navigate to="/" replace />
  },
  {
    path: '/home',
    element: <Navigate to="/" replace />
  },

  // Ruta catch-all para páginas no encontradas (404)
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Página No Encontrada</h2>
            <p className="text-gray-600 mb-6">La página que buscas no existe o ha sido movida.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Volver Atrás
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir al Inicio
              </button>
            </div>
          </div>
        </div>
      </SuspenseWrapper>
    )
  }
]);

// =======================================================
// FUNCIÓN PARA OBTENER INFORMACIÓN DE RUTAS
// =======================================================

/**
 * Obtiene información sobre la ruta actual
 */
export const obtenerInfoRuta = (pathname: string) => {
  const segmentos = pathname.split('/').filter(Boolean);
  
  return {
    esRutaPrincipal: pathname === '/',
    esRutaAuth: ['/login', '/registro', '/recuperar-password'].includes(pathname),
    esRutaAdmin: pathname.startsWith('/admin'),
    esRutaDashboard: pathname.startsWith('/dashboard'),
    esRutaError: ['/403', '/404', '/500'].includes(pathname),
    segmentos,
    nivel: segmentos.length
  };
};

/**
 * Genera breadcrumbs automáticos basados en la ruta
 */
export const generarBreadcrumbs = (pathname: string) => {
  const segmentos = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ texto: 'Inicio', enlace: '/' }];
  
  let rutaAcumulada = '';
  
  segmentos.forEach((segmento, index) => {
    rutaAcumulada += `/${segmento}`;
    
    // Mapeo de segmentos a nombres legibles
    const nombres: Record<string, string> = {
      admin: 'Administración',
      dashboard: 'Dashboard',
      facturacion: 'Facturación',
      comercial: 'Gestión Comercial',
      inventario: 'Inventario',
      contabilidad: 'Contabilidad',
      reportes: 'Reportes',
      sistema: 'Sistema',
      perfil: 'Perfil',
      configuracion: 'Configuración',
      usuarios: 'Usuarios',
      clientes: 'Clientes',
      productos: 'Productos'
    };
    
    const nombre = nombres[segmento] || segmento.charAt(0).toUpperCase() + segmento.slice(1);
    
    breadcrumbs.push({
      texto: nombre,
      enlace: index === segmentos.length - 1 ? undefined : rutaAcumulada
    });
  });
  
  return breadcrumbs;
};

export default router;