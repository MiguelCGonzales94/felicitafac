/**
 * Error Boundary - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente para captura y manejo de errores de React
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

interface PropiedadesErrorBoundary {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  mostrarDetalles?: boolean;
  permitirReintento?: boolean;
  redirigirHome?: boolean;
  tituloPersonalizado?: string;
  mensajePersonalizado?: string;
  className?: string;
}

interface EstadoErrorBoundary {
  hayError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  intentosReintento: number;
  mostrarDetallesTecnicos: boolean;
  reporteEnviado: boolean;
  copiandoError: boolean;
}

interface DetallesError {
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
}

// =======================================================
// UTILIDADES
// =======================================================

const generarReporteError = (
  error: Error,
  errorInfo: ErrorInfo,
  detalles: DetallesError
): string => {
  return `
=== REPORTE DE ERROR - FELICITAFAC ===
Timestamp: ${detalles.timestamp}
URL: ${detalles.url}
User Agent: ${detalles.userAgent}
Usuario ID: ${detalles.userId || 'No autenticado'}
Session ID: ${detalles.sessionId || 'N/A'}
Build Version: ${detalles.buildVersion || 'N/A'}

=== ERROR ===
Nombre: ${error.name}
Mensaje: ${error.message}
Stack: ${error.stack || 'No disponible'}

=== COMPONENT STACK ===
${errorInfo.componentStack}

=== INFORMACIÓN ADICIONAL ===
Intentos de reintento: ${detalles.timestamp}
Navegador: ${navigator.userAgent}
Resolución: ${screen.width}x${screen.height}
Memoria: ${(performance as any).memory ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A'}
`.trim();
};

const obtenerDetallesEntorno = (): DetallesError => ({
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  url: window.location.href,
  userId: localStorage.getItem('felicitafac_user_id') || undefined,
  sessionId: sessionStorage.getItem('felicitafac_session_id') || undefined,
  buildVersion: process.env.REACT_APP_VERSION || undefined
});

// =======================================================
// COMPONENTE ERROR BOUNDARY
// =======================================================

export class ErrorBoundary extends Component<PropiedadesErrorBoundary, EstadoErrorBoundary> {
  private reintentoTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: PropiedadesErrorBoundary) {
    super(props);
    this.state = {
      hayError: false,
      error: null,
      errorInfo: null,
      intentosReintento: 0,
      mostrarDetallesTecnicos: false,
      reporteEnviado: false,
      copiandoError: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<EstadoErrorBoundary> {
    return {
      hayError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Actualizar estado con información del error
    this.setState({
      error,
      errorInfo
    });

    // Registrar error en consola
    console.error('ErrorBoundary capturó un error:', error, errorInfo);

    // Llamar callback personalizado si existe
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Enviar error a servicio de monitoreo (opcional)
    this.enviarErrorAServicio(error, errorInfo);
  }

  private enviarErrorAServicio = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const detalles = obtenerDetallesEntorno();
      const reporte = generarReporteError(error, errorInfo, detalles);
      
      // Aquí se podría enviar a un servicio como Sentry, LogRocket, etc.
      // Por ahora solo guardamos en localStorage para debug
      const erroresGuardados = JSON.parse(localStorage.getItem('felicitafac_errores') || '[]');
      erroresGuardados.push({
        timestamp: detalles.timestamp,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        componentStack: errorInfo.componentStack,
        detalles
      });
      
      // Mantener solo los últimos 10 errores
      if (erroresGuardados.length > 10) {
        erroresGuardados.splice(0, erroresGuardados.length - 10);
      }
      
      localStorage.setItem('felicitafac_errores', JSON.stringify(erroresGuardados));
    } catch (e) {
      console.error('Error al guardar reporte de error:', e);
    }
  };

  private manejarReintento = () => {
    const { intentosReintento } = this.state;
    
    if (intentosReintento < 3) {
      this.setState(prevState => ({
        hayError: false,
        error: null,
        errorInfo: null,
        intentosReintento: prevState.intentosReintento + 1,
        mostrarDetallesTecnicos: false,
        reporteEnviado: false
      }));

      // Auto-reintento después de 5 segundos si falla nuevamente
      this.reintentoTimeoutId = setTimeout(() => {
        if (this.state.hayError && this.state.intentosReintento < 3) {
          this.manejarReintento();
        }
      }, 5000);
    }
  };

  private manejarIrHome = () => {
    window.location.href = '/admin';
  };

  private manejarCopiarError = async () => {
    const { error, errorInfo } = this.state;
    if (!error || !errorInfo) return;

    this.setState({ copiandoError: true });

    try {
      const detalles = obtenerDetallesEntorno();
      const reporte = generarReporteError(error, errorInfo, detalles);
      
      await navigator.clipboard.writeText(reporte);
      
      this.setState({ copiandoError: false });
      
      // Mostrar feedback temporal
      setTimeout(() => {
        this.setState({ copiandoError: false });
      }, 2000);
    } catch (e) {
      console.error('Error al copiar al portapapeles:', e);
      this.setState({ copiandoError: false });
    }
  };

  private manejarEnviarReporte = async () => {
    // Simular envío de reporte
    this.setState({ reporteEnviado: true });
    
    // En una implementación real, aquí se enviaría a un endpoint
    setTimeout(() => {
      this.setState({ reporteEnviado: false });
    }, 3000);
  };

  componentWillUnmount() {
    if (this.reintentoTimeoutId) {
      clearTimeout(this.reintentoTimeoutId);
    }
  }

  render() {
    const { 
      hayError, 
      error, 
      errorInfo, 
      intentosReintento, 
      mostrarDetallesTecnicos,
      reporteEnviado,
      copiandoError
    } = this.state;

    const {
      children,
      fallback,
      mostrarDetalles = true,
      permitirReintento = true,
      redirigirHome = true,
      tituloPersonalizado,
      mensajePersonalizado,
      className
    } = this.props;

    if (hayError) {
      // Renderizar fallback personalizado si se proporciona
      if (fallback) {
        return <>{fallback}</>;
      }

      // Renderizar interfaz de error por defecto
      return (
        <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${className || ''}`}>
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <CardTitle className="text-xl font-semibold text-gray-900">
                {tituloPersonalizado || 'Oops! Algo salió mal'}
              </CardTitle>
              
              <p className="text-gray-600 mt-2">
                {mensajePersonalizado || 
                  'Ha ocurrido un error inesperado en la aplicación. Nuestro equipo ha sido notificado automáticamente.'}
              </p>

              {intentosReintento > 0 && (
                <Badge variant="secondary" className="mt-2">
                  Intento {intentosReintento} de 3
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Información básica del error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-800 mb-2">
                    Error: {error.name}
                  </h4>
                  <p className="text-sm text-red-700">
                    {error.message}
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3 justify-center">
                {permitirReintento && intentosReintento < 3 && (
                  <Button onClick={this.manejarReintento} className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar
                  </Button>
                )}

                {redirigirHome && (
                  <Button 
                    variant="outline" 
                    onClick={this.manejarIrHome}
                    className="flex items-center"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Ir al Inicio
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={this.manejarEnviarReporte}
                  disabled={reporteEnviado}
                  className="flex items-center"
                >
                  {reporteEnviado ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Reporte Enviado
                    </>
                  ) : (
                    <>
                      <Bug className="h-4 w-4 mr-2" />
                      Reportar Error
                    </>
                  )}
                </Button>
              </div>

              {/* Detalles técnicos colapsables */}
              {mostrarDetalles && error && errorInfo && (
                <Collapsible 
                  open={mostrarDetallesTecnicos} 
                  onOpenChange={this.setState.bind(this, { mostrarDetallesTecnicos: !mostrarDetallesTecnicos })}
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-center text-gray-500"
                    >
                      {mostrarDetallesTecnicos ? 'Ocultar' : 'Mostrar'} detalles técnicos
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-4 mt-4">
                    {/* Botón copiar error */}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={this.manejarCopiarError}
                        disabled={copiandoError}
                        className="flex items-center"
                      >
                        {copiandoError ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar Error
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Stack trace del error */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Stack Trace:</h4>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-40">
                        <pre className="whitespace-pre-wrap">
                          {error.stack || 'Stack trace no disponible'}
                        </pre>
                      </div>
                    </div>

                    {/* Component stack */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Component Stack:</h4>
                      <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-32">
                        <pre className="whitespace-pre-wrap text-gray-700">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    </div>

                    {/* Información del entorno */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Información del Entorno:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg text-xs space-y-1">
                        <div><strong>URL:</strong> {window.location.href}</div>
                        <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
                        <div><strong>User Agent:</strong> {navigator.userAgent}</div>
                        <div><strong>Resolución:</strong> {screen.width}x{screen.height}</div>
                        {(performance as any).memory && (
                          <div>
                            <strong>Memoria:</strong> {Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Información de contacto */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t">
                <p>
                  Si el problema persiste, contacta al soporte técnico de FELICITAFAC
                </p>
                <p className="mt-1">
                  Email: soporte@felicitafac.com | Teléfono: +51 999 888 777
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// =======================================================
// HOC PARA ENVOLVER COMPONENTES
// =======================================================

export const conErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  opciones?: Partial<PropiedadesErrorBoundary>
) => {
  const ComponenteConErrorBoundary = (props: P) => (
    <ErrorBoundary {...opciones}>
      <Component {...props} />
    </ErrorBoundary>
  );

  ComponenteConErrorBoundary.displayName = `conErrorBoundary(${Component.displayName || Component.name})`;
  
  return ComponenteConErrorBoundary;
};

// =======================================================
// HOOK PARA MANEJO DE ERRORES ASÍNCRONOS
// =======================================================

export const useErrorHandler = () => {
  const manejarError = React.useCallback((error: Error, contexto?: string) => {
    console.error(`Error${contexto ? ` en ${contexto}` : ''}:`, error);
    
    // Guardar error para debugging
    const erroresGuardados = JSON.parse(localStorage.getItem('felicitafac_errores_async') || '[]');
    erroresGuardados.push({
      timestamp: new Date().toISOString(),
      contexto,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
    
    if (erroresGuardados.length > 20) {
      erroresGuardados.splice(0, erroresGuardados.length - 20);
    }
    
    localStorage.setItem('felicitafac_errores_async', JSON.stringify(erroresGuardados));
    
    // Aquí se podría mostrar una notificación toast o modal
    // dependiendo de la implementación del sistema de notificaciones
  }, []);

  return { manejarError };
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default ErrorBoundary;