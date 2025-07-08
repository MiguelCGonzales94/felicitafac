/**
 * Error Boundary - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente para capturar y manejar errores de React
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

// =======================================================
// INTERFACES
// =======================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

// =======================================================
// COMPONENTE FALLBACK POR DEFECTO
// =======================================================

const FallbackErrorUI: React.FC<{
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  onRetry: () => void;
  onReportError: () => void;
}> = ({ error, errorInfo, errorId, onRetry, onReportError }) => {
  const [mostrarDetalles, setMostrarDetalles] = React.useState(false);
  const [reporteEnviado, setReporteEnviado] = React.useState(false);

  const handleReportarError = () => {
    onReportError();
    setReporteEnviado(true);
    
    // Simular envío de reporte
    setTimeout(() => {
      setReporteEnviado(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        {/* Icono y título principal */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Oops! Algo salió mal
          </h1>
          <p className="text-gray-600">
            Ocurrió un error inesperado en la aplicación. No te preocupes, 
            estamos trabajando para solucionarlo.
          </p>
        </div>

        {/* ID del error */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">ID del error:</p>
          <p className="font-mono text-sm text-gray-900 bg-white p-2 rounded border">
            {errorId}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3 mb-6">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar Nuevamente
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir al Inicio
          </button>

          <button
            onClick={handleReportarError}
            disabled={reporteEnviado}
            className="w-full flex items-center justify-center px-4 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-4 h-4 mr-2" />
            {reporteEnviado ? 'Reporte Enviado' : 'Reportar Error'}
          </button>
        </div>

        {/* Toggle detalles técnicos */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setMostrarDetalles(!mostrarDetalles)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {mostrarDetalles ? 'Ocultar' : 'Mostrar'} detalles técnicos
          </button>

          {mostrarDetalles && (
            <div className="mt-4 space-y-4">
              {error && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Error:</h4>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800 font-mono">
                      {error.name}: {error.message}
                    </p>
                  </div>
                </div>
              )}

              {error?.stack && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Stack Trace:</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                </div>
              )}

              {errorInfo?.componentStack && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Component Stack:</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            FELICITAFAC v1.0.0 | {new Date().toLocaleString('es-PE')}
          </p>
        </div>
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE ERROR BOUNDARY
// =======================================================

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generar ID único para el error
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Llamar callback personalizado si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log del error
    console.error('ErrorBoundary capturó un error:', error, errorInfo);

    // TODO: Enviar error a servicio de logging (ej: Sentry, LogRocket)
    this.reportarErrorAServicio(error, errorInfo);
  }

  private reportarErrorAServicio = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // En producción, aquí enviarías el error a un servicio como Sentry
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem('usuario_id') || 'anonymous'
      };

      // Enviar a servicio de logging
      if (import.meta.env.PROD) {
        // fetch('/api/errores/reportar', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorData)
        // }).catch(console.error);
      }

      console.log('Error reportado:', errorData);
    } catch (reportError) {
      console.error('Error reportando error:', reportError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleReportError = () => {
    if (this.state.error && this.state.errorInfo) {
      this.reportarErrorAServicio(this.state.error, this.state.errorInfo);
    }
  };

  render() {
    if (this.state.hasError) {
      // Usar fallback personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Usar UI de error por defecto
      return (
        <FallbackErrorUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onReportError={this.handleReportError}
        />
      );
    }

    return this.props.children;
  }
}

// =======================================================
// HOC PARA WRAP COMPONENTES
// =======================================================

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// =======================================================
// HOOK PARA MANEJAR ERRORES
// =======================================================

export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    setError(errorObj);
    console.error('Error capturado:', errorObj);
  }, []);

  // Lanzar error para que ErrorBoundary lo capture
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError,
    hasError: !!error
  };
};

// =======================================================
// COMPONENTE SIMPLE PARA ERRORES MENORES
// =======================================================

interface PropiedadesErrorSimple {
  titulo?: string;
  mensaje?: string;
  mostrarBotonReintentar?: boolean;
  onReintentar?: () => void;
  className?: string;
}

export const ErrorSimple: React.FC<PropiedadesErrorSimple> = ({
  titulo = 'Error',
  mensaje = 'Ocurrió un error inesperado',
  mostrarBotonReintentar = true,
  onReintentar,
  className = ''
}) => (
  <div className={`text-center py-8 ${className}`}>
    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertTriangle className="w-6 h-6 text-red-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{titulo}</h3>
    <p className="text-gray-600 mb-4">{mensaje}</p>
    {mostrarBotonReintentar && onReintentar && (
      <button
        onClick={onReintentar}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Reintentar
      </button>
    )}
  </div>
);

export default ErrorBoundary;