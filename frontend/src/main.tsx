/**
 * Main Entry Point - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Punto de entrada principal de la aplicación React
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Estilos globales
import './estilos/globals.css';

// =======================================================
// CONFIGURACIÓN DE DESARROLLO
// =======================================================

// Configurar React DevTools en desarrollo
if (import.meta.env.DEV) {
  // Habilitar React DevTools
  if (typeof window !== 'undefined') {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
  }

  // Configurar mensajes de consola
  console.log(`
🚀 FELICITAFAC - Sistema de Facturación Electrónica
===================================================
🔧 Modo: ${import.meta.env.MODE}
🌐 API URL: ${import.meta.env.VITE_API_URL || 'http://localhost:8000'}
📦 Versión: ${import.meta.env.VITE_APP_VERSION || '1.0.0'}
🕒 Build: ${import.meta.env.VITE_BUILD_TIME || new Date().toISOString()}
===================================================
  `);
}

// =======================================================
// CONFIGURACIÓN DE ERROR HANDLING GLOBAL
// =======================================================

// Manejo de errores no capturados
window.addEventListener('error', (evento) => {
  console.error('Error global capturado:', evento.error);
  
  // En producción, enviar errores a servicio de monitoreo
  if (import.meta.env.PROD) {
    // TODO: Integrar con servicio de monitoreo (ej: Sentry)
    // Sentry.captureException(evento.error);
  }
});

// Manejo de promesas rechazadas no capturadas
window.addEventListener('unhandledrejection', (evento) => {
  console.error('Promesa rechazada no capturada:', evento.reason);
  
  // En producción, enviar errores a servicio de monitoreo
  if (import.meta.env.PROD) {
    // TODO: Integrar con servicio de monitoreo
    // Sentry.captureException(evento.reason);
  }
});

// =======================================================
// CONFIGURACIÓN DE PERFORMANCE
// =======================================================

// Medir performance de la aplicación
if (import.meta.env.DEV) {
  // Performance observer para métricas de carga
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          console.log(`⏱️ Performance: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }
}

// =======================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =======================================================

// Función para inicializar la aplicación
const inicializarApp = async (): Promise<void> => {
  // Marcar inicio de inicialización
  performance.mark('app-init-start');
  
  try {
    // Validar entorno
    if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
      throw new Error('VITE_API_URL no está configurado en producción');
    }

    // Obtener elemento root
    const elementoRoot = document.getElementById('root');
    if (!elementoRoot) {
      throw new Error('Elemento root no encontrado en el DOM');
    }

    // Crear root de React 18
    const root = ReactDOM.createRoot(elementoRoot);

    // Configurar opciones de renderizado
    const opciones: any = {};
    
    // En desarrollo, usar modo estricto
    if (import.meta.env.DEV) {
      opciones.strictMode = true;
    }

    // Renderizar aplicación
    root.render(
      import.meta.env.DEV ? (
        <React.StrictMode>
          <App />
        </React.StrictMode>
      ) : (
        <App />
      )
    );

    // Marcar fin de inicialización
    performance.mark('app-init-end');
    performance.measure('app-initialization', 'app-init-start', 'app-init-end');

    // Remover loading inicial del HTML
    const loadingElement = document.querySelector('.loading-container');
    if (loadingElement) {
      // Añadir clase para fade out
      loadingElement.classList.add('fade-out');
      
      // Remover elemento después de la animación
      setTimeout(() => {
        loadingElement.remove();
        document.body.classList.add('loaded');
      }, 300);
    }

    // Log de éxito en desarrollo
    if (import.meta.env.DEV) {
      console.log('✅ FELICITAFAC iniciado correctamente');
    }

  } catch (error) {
    console.error('❌ Error inicializando FELICITAFAC:', error);
    
    // Mostrar error amigable al usuario
    const elementoRoot = document.getElementById('root');
    if (elementoRoot) {
      elementoRoot.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: #f9fafb;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="
            max-width: 400px;
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          ">
            <div style="
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #ef4444, #dc2626);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
            ">
              <span style="color: white; font-size: 24px;">⚠️</span>
            </div>
            <h1 style="
              color: #1f2937;
              margin-bottom: 16px;
              font-size: 20px;
              font-weight: 600;
            ">Error de Inicialización</h1>
            <p style="
              color: #6b7280;
              margin-bottom: 24px;
              line-height: 1.5;
            ">
              No se pudo inicializar FELICITAFAC. Por favor, recarga la página.
            </p>
            <button onclick="window.location.reload()" style="
              background: linear-gradient(135deg, #3b82f6, #2563eb);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              Recargar Página
            </button>
            ${import.meta.env.DEV ? `
              <details style="margin-top: 24px; text-align: left;">
                <summary style="cursor: pointer; color: #6b7280; font-size: 14px;">
                  Detalles del error (desarrollo)
                </summary>
                <pre style="
                  background: #f3f4f6;
                  padding: 12px;
                  border-radius: 6px;
                  font-size: 12px;
                  color: #374151;
                  overflow: auto;
                  margin-top: 8px;
                ">${error instanceof Error ? error.stack || error.message : String(error)}</pre>
              </details>
            ` : ''}
          </div>
        </div>
      `;
    }

    // En producción, enviar error a servicio de monitoreo
    if (import.meta.env.PROD) {
      // TODO: Integrar con servicio de monitoreo
      // Sentry.captureException(error);
    }
  }
};

// =======================================================
// INICIALIZACIÓN
// =======================================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
  // DOM ya está listo
  inicializarApp();
}

// =======================================================
// HOT MODULE REPLACEMENT (HMR) - SOLO DESARROLLO
// =======================================================

if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    console.log('🔄 Hot reloading App...');
  });

  import.meta.hot.accept('./context/AuthContext', () => {
    console.log('🔄 Hot reloading AuthContext...');
  });

  // Log cuando HMR está disponible
  console.log('🔥 Hot Module Replacement habilitado');
}