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

const PaginaPrincipal = React.lazy(() => import('../paginas/PaginaPrincipal'));
const Login = React.lazy(() => import('../paginas/Login'));
const Registro = React.lazy(() => import('../paginas/Registro'));
const RecuperarPassword = React.lazy(() => import('../paginas/RecuperarPassword'));
const Pagina404 = React.lazy(() => import('../paginas/errores/Pagina404'));
const Pagina403 = React.lazy(() => import('../paginas/errores/Pagina403'));

// =======================================================
// COMPONENTE DE SUSPENSE WRAPPER
// =======================================================

const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <ComponenteCarga mensaje="Cargando aplicación..." />
        </div>
      }
    >
      {children}
    </Suspense>
  </ErrorBoundary>
);

// =======================================================
// RUTAS DE AUTENTICACIÓN
// =======================================================

const rutasAuth: RouteObject[] = [
  {
    path: '/login',
    element: (
      <RutaParaNoAutenticados redirigirA="/admin">
        <SuspenseWrapper>
          <Login />
        </SuspenseWrapper>
      </RutaParaNoAutenticados>
    )
  },
  {
    path: '/registro',
    element: (
      <RutaParaNoAutenticados redirigirA="/admin">
        <SuspenseWrapper>
          <Registro />
        </SuspenseWrapper>
      </RutaParaNoAutenticados>
    )
  },
  {
    path: '/recuperar-password',
    element: (
      <SuspenseWrapper>
        <RecuperarPassword />
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
        <Pagina403 />
      </SuspenseWrapper>
    )
  },
  {
    path: '/404',
    element: (
      <SuspenseWrapper>
        <Pagina404 />
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

  // Rutas administrativas
  ...rutasAdmin,

  // Rutas de error
  ...rutasError,

  // Redirecciones
  {
    path: '/dashboard',
    element: <Navigate to="/admin" replace />
  },

  // Ruta catch-all para 404
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-red-600 text-2xl font-bold">404</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Página no encontrada
            </h1>
            <p className="text-gray-600 mb-6">
              La página que buscas no existe o ha sido movida.
            </p>
            <button
              onClick={() => window.location.href = '/admin'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
      </SuspenseWrapper>
    )
  }
]);

export default router;