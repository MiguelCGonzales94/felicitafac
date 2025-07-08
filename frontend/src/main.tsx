/**
 * Punto de Entrada Principal - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Inicialización de la aplicación React
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// =======================================================
// CONFIGURACIÓN INICIAL
// =======================================================

// Configurar modo estricto en desarrollo
const StrictModeWrapper = import.meta.env.DEV 
  ? React.StrictMode 
  : React.Fragment;

// Función para remover el loading inicial
const removeInitialLoading = () => {
  const loadingContainer = document.querySelector('.loading-container');
  if (loadingContainer) {
    loadingContainer.remove();
  }
  document.body.classList.add('loaded');
};

// =======================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =======================================================

const inicializarApp = async () => {
  try {
    // Obtener el elemento root
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Elemento root no encontrado');
    }

    // Crear root de React 18
    const root = ReactDOM.createRoot(rootElement);

    // Renderizar la aplicación
    root.render(
      <StrictModeWrapper>
        <App />
      </StrictModeWrapper>
    );

    // Remover loading inicial después de que React tome control
    setTimeout(removeInitialLoading, 100);

    // Log de inicialización exitosa
    if (import.meta.env.DEV) {
      console.log('🚀 FELICITAFAC iniciado correctamente');
      console.log('📍 Modo:', import.meta.env.MODE);
      console.log('🔗 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000');
    }

  } catch (error) {
    console.error('❌ Error inicializando FELICITAFAC:', error);
    
    // Mostrar error al usuario
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="
            text-align: center;
            max-width: 400px;
            padding: 40px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          ">
            <div style="
              width: 64px;
              height: 64px;
              background: #fee2e2;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
            ">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h1 style="color: #1f2937; margin-bottom: 16px; font-size: 24px;">Error de Inicialización</h1>
            <p style="color: #6b7280; margin-bottom: 24px;">
              No se pudo cargar FELICITAFAC. Por favor, recarga la página.
            </p>
            <button 
              onclick="window.location.reload()" 
              style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
              "
            >
              Recargar Página
            </button>
            <details style="margin-top: 24px; text-align: left;">
              <summary style="cursor: pointer; color: #6b7280; font-size: 14px;">
                Mostrar detalles técnicos
              </summary>
              <pre style="
                margin-top: 16px;
                padding: 12px;
                background: #f3f4f6;
                border-radius: 8px;
                font-size: 12px;
                color: #374151;
                overflow: auto;
                max-height: 200px;
              ">${error instanceof Error ? error.stack : String(error)}</pre>
            </details>
          </div>
        </div>
      `;
    }
  }
};

// =======================================================
// MANEJO DE ERRORES GLOBALES
// =======================================================

// Error handler para errores no capturados
window.addEventListener('error', (event) => {
  console.error('Error global capturado:', event.error);
  
  // En producción, enviar error a servicio de logging
  if (import.meta.env.PROD) {
    // TODO: Enviar a servicio de logging (ej: Sentry)
  }
});

// Error handler para promises rechazadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rechazada no manejada:', event.reason);
  
  // En producción, enviar error a servicio de logging
  if (import.meta.env.PROD) {
    // TODO: Enviar a servicio de logging (ej: Sentry)
  }
});

// =======================================================
// INFORMACIÓN DE DESARROLLO
// =======================================================

if (import.meta.env.DEV) {
  // Información útil para desarrollo
  console.log(`
    🎉 FELICITAFAC - Sistema de Facturación Electrónica
    
    📋 Información de desarrollo:
    • Modo: ${import.meta.env.MODE}
    • React Version: ${React.version}
    • Vite Version: ${import.meta.env.VITE_VERSION || 'N/A'}
    • API URL: ${import.meta.env.VITE_API_URL || 'http://localhost:8000'}
    
    🔧 Comandos útiles:
    • npm run dev - Modo desarrollo
    • npm run build - Build producción
    • npm run preview - Preview build
    • npm run lint - Revisar código
    
    📚 Documentación:
    • React Router: https://reactrouter.com
    • Tailwind CSS: https://tailwindcss.com
    • React Query: https://tanstack.com/query
  `);

  // Exponer utilidades de desarrollo en window
  (window as any).felicitafac = {
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    env: import.meta.env,
    react: React,
    clearStorage: () => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Storage limpiado');
    },
    reload: () => {
      window.location.reload();
    }
  };
}

// =======================================================
// INICIALIZAR APLICACIÓN
// =======================================================

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
  inicializarApp();
}

// =======================================================
// HOT MODULE REPLACEMENT (HMR) PARA VITE
// =======================================================

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('🔄 Hot reload aplicado');
  });
}