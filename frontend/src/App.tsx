/**
 * Aplicación Principal - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente raíz de la aplicación React
 */

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './componentes/comunes/ErrorBoundary';
import './index.css';

// =======================================================
// CONFIGURACIÓN DE REACT QUERY
// =======================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración por defecto para queries
      retry: (failureCount, error: any) => {
        // No reintentar en errores de autenticación
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Reintentar máximo 3 veces para otros errores
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Configuración por defecto para mutations
      retry: 1,
      onError: (error: any) => {
        console.error('Error en mutación:', error);
      },
    },
  },
});

// =======================================================
// CONFIGURACIÓN DE TOAST NOTIFICATIONS
// =======================================================

const toasterConfig = {
  duration: 4000,
  position: 'top-right' as const,
  toastOptions: {
    // Estilos por defecto
    style: {
      border: '1px solid #e5e7eb',
      padding: '12px 16px',
      color: '#374151',
      fontSize: '14px',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    // Estilos para éxito
    success: {
      style: {
        border: '1px solid #10b981',
        backgroundColor: '#f0fdf4',
        color: '#065f46',
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#f0fdf4',
      },
    },
    // Estilos para error
    error: {
      style: {
        border: '1px solid #ef4444',
        backgroundColor: '#fef2f2',
        color: '#991b1b',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fef2f2',
      },
    },
    // Estilos para loading
    loading: {
      style: {
        border: '1px solid #3b82f6',
        backgroundColor: '#eff6ff',
        color: '#1e40af',
      },
      iconTheme: {
        primary: '#3b82f6',
        secondary: '#eff6ff',
      },
    },
  },
};

// =======================================================
// COMPONENTE DE CONFIGURACIÓN GLOBAL
// =======================================================

const ConfiguracionGlobal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    // Configuración global de la aplicación
    
    // Configurar título por defecto
    document.title = 'FELICITAFAC - Sistema de Facturación Electrónica';
    
    // Configurar meta tags básicos
    const metaCharset = document.querySelector('meta[charset]');
    if (!metaCharset) {
      const meta = document.createElement('meta');
      meta.setAttribute('charset', 'UTF-8');
      document.head.appendChild(meta);
    }
    
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      document.head.appendChild(meta);
    }
    
    // Configurar favicon
    const favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      const link = document.createElement('link');
      link.setAttribute('rel', 'icon');
      link.setAttribute('type', 'image/svg+xml');
      link.setAttribute('href', '/favicon.svg');
      document.head.appendChild(link);
    }
    
    // Manejar errores globales no capturados
    const handleUnhandledError = (event: ErrorEvent) => {
      console.error('Error no manejado:', event.error);
      // TODO: Enviar error a servicio de logging
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Promise rechazada no manejada:', event.reason);
      // TODO: Enviar error a servicio de logging
    };
    
    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Cleanup
    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  return <>{children}</>;
};

// =======================================================
// COMPONENTE DE INICIALIZACIÓN
// =======================================================

const InicializacionApp: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inicializado, setInicializado] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const inicializar = async () => {
      try {
        // Verificar configuración del entorno
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) {
          console.warn('VITE_API_URL no está configurado, usando valor por defecto');
        }
        
        // Verificar conectividad con el backend (opcional)
        // const respuesta = await fetch(`${apiUrl || 'http://localhost:8000'}/api/health/`, {
        //   method: 'GET',
        //   headers: { 'Content-Type': 'application/json' }
        // });
        
        // Si llegamos aquí, todo está bien
        setInicializado(true);
      } catch (error) {
        console.error('Error durante la inicialización:', error);
        setError('Error conectando con el servidor. Verificando...');
        
        // Permitir continuar incluso si hay error de conectividad
        setTimeout(() => {
          setInicializado(true);
          setError(null);
        }, 2000);
      }
    };
    
    inicializar();
  }, []);
  
  if (!inicializado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Iniciando FELICITAFAC</h2>
          <p className="text-gray-600">
            {error || 'Configurando el sistema...'}
          </p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// =======================================================
// COMPONENTE PRINCIPAL DE LA APP
// =======================================================

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ConfiguracionGlobal>
            <InicializacionApp>
              <AuthProvider>
                <RouterProvider router={router} />
                <Toaster {...toasterConfig} />
              </AuthProvider>
            </InicializacionApp>
          </ConfiguracionGlobal>
          
          {/* React Query Devtools solo en desarrollo */}
          {import.meta.env.DEV && (
            <ReactQueryDevtools 
              initialIsOpen={false}
              position="bottom-right"
            />
          )}
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;