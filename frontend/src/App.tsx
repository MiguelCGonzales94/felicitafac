/**
 * Aplicación Principal - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente raíz de la aplicación React
 */

import React, { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { router } from './router/index';
import { AuthProvider } from './context/AuthContext';
import NotificacionesProvider from './componentes/comunes/Notificaciones';
import { CargaProvider } from './componentes/comunes/ComponenteCarga';
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
// CONFIGURACIÓN GLOBAL
// =======================================================

/**
 * Configuración de toast con configuración específica para FELICITAFAC
 */
const toasterConfig = {
  position: 'top-right' as const,
  duration: 4000,
  reverseOrder: false,
  gutter: 8,
  toastOptions: {
    className: '',
    style: {
      background: '#ffffff',
      color: '#374151',
      fontSize: '14px',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb',
      maxWidth: '400px',
    },
    success: {
      iconTheme: {
        primary: '#22c55e',
        secondary: '#ffffff',
      },
    },
    error: {
      iconTheme: {
        primary: '#ef4444',
        secondary: '#ffffff',
      },
    },
  },
};

// =======================================================
// COMPONENTE DE CONFIGURACIÓN GLOBAL
// =======================================================

interface PropiedadesConfiguracionGlobal {
  children: React.ReactNode;
}

const ConfiguracionGlobal: React.FC<PropiedadesConfiguracionGlobal> = ({ children }) => {
  useEffect(() => {
    // Configuración de la aplicación al cargar
    console.log('🚀 FELICITAFAC - Sistema de Facturación Electrónica');
    console.log('===================================================');
    console.log('🔧 Modo:', import.meta.env.MODE);
    console.log('🌐 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000');
    console.log('📦 Versión:', import.meta.env.VITE_APP_VERSION || '1.0.0');
    console.log('🕒 Build:', new Date().toISOString());
    console.log('===================================================');

    // Configurar interceptores globales aquí si es necesario
    
    // Configurar manejadores de error global
    const manejarErrorGlobal = (event: ErrorEvent) => {
      console.error('Error global capturado:', event.error);
    };

    const manejarErrorPromesa = (event: PromiseRejectionEvent) => {
      console.error('Error no manejado:', event.reason);
    };

    window.addEventListener('error', manejarErrorGlobal);
    window.addEventListener('unhandledrejection', manejarErrorPromesa);

    return () => {
      window.removeEventListener('error', manejarErrorGlobal);
      window.removeEventListener('unhandledrejection', manejarErrorPromesa);
    };
  }, []);

  return <>{children}</>;
};

// =======================================================
// COMPONENTE DE INICIALIZACIÓN
// =======================================================

interface PropiedadesInicializacionApp {
  children: React.ReactNode;
}

const InicializacionApp: React.FC<PropiedadesInicializacionApp> = ({ children }) => {
  const [inicializado, setInicializado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const inicializar = async () => {
      try {
        // Simular inicialización de servicios
        // Aquí podrías cargar configuraciones globales, verificar conectividad, etc.
        
        console.log('✅ FELICITAFAC iniciado correctamente');
        
        // Verificar si el hot reload está disponible
        if (import.meta.hot) {
          console.log('🔥 Hot Module Replacement habilitado');
        }

        setInicializado(true);
      } catch (error: any) {
        console.error('Error inicializando FELICITAFAC:', error);
        setError('Error al inicializar la aplicación. Verificando...');
        
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
                <CargaProvider>
                  <NotificacionesProvider>
                    <RouterProvider router={router} />
                    <Toaster {...toasterConfig} />
                  </NotificacionesProvider>
                </CargaProvider>
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