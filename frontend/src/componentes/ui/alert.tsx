/**
 * Componente Alert - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente para mostrar alertas, notificaciones y mensajes de estado
 */

import React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

export interface PropiedadesAlert {
  // Contenido
  children: React.ReactNode;
  
  // Variantes de estilo
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error' | 'destructive';
  
  // Configuración
  dismissible?: boolean;
  onDismiss?: () => void;
  
  // Apariencia
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  customIcon?: React.ReactNode;
  
  // Clases CSS
  className?: string;
  
  // Props HTML
  role?: 'alert' | 'alertdialog' | 'status';
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

export interface PropiedadesAlertTitle {
  children: React.ReactNode;
  className?: string;
}

export interface PropiedadesAlertDescription {
  children: React.ReactNode;
  className?: string;
}

export interface PropiedadesAlertActions {
  children: React.ReactNode;
  className?: string;
}

// =======================================================
// CONFIGURACIÓN DE VARIANTES
// =======================================================

const alertVariants = {
  variant: {
    default: {
      container: 'bg-background border-border text-foreground',
      icon: 'text-foreground',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: 'text-blue-600',
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-900',
      icon: 'text-green-600',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      icon: 'text-yellow-600',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: 'text-red-600',
    },
    destructive: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: 'text-red-600',
    },
  },
  size: {
    sm: 'p-3 text-sm',
    md: 'p-4 text-sm',
    lg: 'p-6 text-base',
  },
};

// =======================================================
// ICONOS POR VARIANTE
// =======================================================

const getIconForVariant = (variant: string, customIcon?: React.ReactNode) => {
  if (customIcon) return customIcon;
  
  const iconMap = {
    default: <Info className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    error: <XCircle className="h-4 w-4" />,
    destructive: <XCircle className="h-4 w-4" />,
  };
  
  return iconMap[variant as keyof typeof iconMap] || iconMap.default;
};

// =======================================================
// COMPONENTE ALERT PRINCIPAL
// =======================================================

export const Alert = React.forwardRef<HTMLDivElement, PropiedadesAlert>(
  (
    {
      children,
      variant = 'default',
      dismissible = false,
      onDismiss,
      size = 'md',
      showIcon = true,
      customIcon,
      className,
      role = 'alert',
      'aria-live': ariaLive = 'polite',
      ...props
    },
    ref
  ) => {
    const variantStyles = alertVariants.variant[variant];
    const sizeStyles = alertVariants.size[size];
    const icon = getIconForVariant(variant, customIcon);
    
    const handleDismiss = () => {
      onDismiss?.();
    };
    
    return (
      <div
        ref={ref}
        role={role}
        aria-live={ariaLive}
        className={cn(
          // Estilos base
          'relative w-full rounded-lg border flex items-start gap-3',
          // Variantes de color
          variantStyles.container,
          // Tamaño
          sizeStyles,
          // Estilos personalizados
          className
        )}
        {...props}
      >
        {/* Icono */}
        {showIcon && (
          <div className={cn(
            'flex-shrink-0 mt-0.5',
            variantStyles.icon
          )}>
            {icon}
          </div>
        )}
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        
        {/* Botón de cierre */}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              'flex-shrink-0 ml-2 p-1 rounded-md transition-colors',
              'hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2',
              'focus:ring-offset-2 focus:ring-offset-transparent',
              variantStyles.icon
            )}
            aria-label="Cerrar alerta"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

// =======================================================
// COMPONENTE ALERT TITLE
// =======================================================

export const AlertTitle = React.forwardRef<HTMLHeadingElement, PropiedadesAlertTitle>(
  ({ children, className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn(
        'font-medium leading-tight tracking-tight mb-1',
        className
      )}
      {...props}
    >
      {children}
    </h5>
  )
);

AlertTitle.displayName = 'AlertTitle';

// =======================================================
// COMPONENTE ALERT DESCRIPTION
// =======================================================

export const AlertDescription = React.forwardRef<HTMLParagraphElement, PropiedadesAlertDescription>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'text-sm leading-relaxed opacity-90',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

AlertDescription.displayName = 'AlertDescription';

// =======================================================
// COMPONENTE ALERT ACTIONS
// =======================================================

export const AlertActions = React.forwardRef<HTMLDivElement, PropiedadesAlertActions>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-2 mt-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

AlertActions.displayName = 'AlertActions';

// =======================================================
// COMPONENTES ESPECIALIZADOS
// =======================================================

/**
 * Alert de éxito con mensaje personalizable
 */
export interface PropiedadesAlertExito {
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const AlertExito: React.FC<PropiedadesAlertExito> = ({
  title = '¡Éxito!',
  message,
  dismissible = true,
  onDismiss,
  actions,
  className,
}) => (
  <Alert 
    variant="success" 
    dismissible={dismissible} 
    onDismiss={onDismiss}
    className={className}
  >
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
    {actions && <AlertActions>{actions}</AlertActions>}
  </Alert>
);

/**
 * Alert de error con mensaje personalizable
 */
export interface PropiedadesAlertError {
  title?: string;
  message: string;
  details?: string[];
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const AlertError: React.FC<PropiedadesAlertError> = ({
  title = 'Error',
  message,
  details,
  dismissible = true,
  onDismiss,
  actions,
  className,
}) => (
  <Alert 
    variant="error" 
    dismissible={dismissible} 
    onDismiss={onDismiss}
    className={className}
  >
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>
      <p>{message}</p>
      {details && details.length > 0 && (
        <ul className="mt-2 list-disc list-inside space-y-1">
          {details.map((detail, index) => (
            <li key={index} className="text-xs">
              {detail}
            </li>
          ))}
        </ul>
      )}
    </AlertDescription>
    {actions && <AlertActions>{actions}</AlertActions>}
  </Alert>
);

/**
 * Alert de advertencia
 */
export interface PropiedadesAlertAdvertencia {
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const AlertAdvertencia: React.FC<PropiedadesAlertAdvertencia> = ({
  title = 'Advertencia',
  message,
  dismissible = true,
  onDismiss,
  actions,
  className,
}) => (
  <Alert 
    variant="warning" 
    dismissible={dismissible} 
    onDismiss={onDismiss}
    className={className}
  >
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
    {actions && <AlertActions>{actions}</AlertActions>}
  </Alert>
);

/**
 * Alert de información
 */
export interface PropiedadesAlertInfo {
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const AlertInfo: React.FC<PropiedadesAlertInfo> = ({
  title = 'Información',
  message,
  dismissible = true,
  onDismiss,
  actions,
  className,
}) => (
  <Alert 
    variant="info" 
    dismissible={dismissible} 
    onDismiss={onDismiss}
    className={className}
  >
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
    {actions && <AlertActions>{actions}</AlertActions>}
  </Alert>
);

// =======================================================
// COMPONENTES ESPECÍFICOS PARA FELICITAFAC
// =======================================================

/**
 * Alert para estados de documentos SUNAT
 */
export interface PropiedadesAlertSUNAT {
  estado: 'emitido' | 'enviado' | 'aceptado' | 'rechazado' | 'anulado';
  numeroDocumento?: string;
  mensaje?: string;
  detalles?: string[];
  onRetry?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export const AlertSUNAT: React.FC<PropiedadesAlertSUNAT> = ({
  estado,
  numeroDocumento,
  mensaje,
  detalles,
  onRetry,
  onViewDetails,
  className,
}) => {
  const configuracion = {
    emitido: {
      variant: 'info' as const,
      title: 'Documento Emitido',
      defaultMessage: 'El documento ha sido emitido correctamente.',
    },
    enviado: {
      variant: 'warning' as const,
      title: 'Enviado a SUNAT',
      defaultMessage: 'El documento ha sido enviado a SUNAT y está pendiente de respuesta.',
    },
    aceptado: {
      variant: 'success' as const,
      title: 'Aceptado por SUNAT',
      defaultMessage: 'El documento ha sido aceptado por SUNAT.',
    },
    rechazado: {
      variant: 'error' as const,
      title: 'Rechazado por SUNAT',
      defaultMessage: 'El documento ha sido rechazado por SUNAT.',
    },
    anulado: {
      variant: 'default' as const,
      title: 'Documento Anulado',
      defaultMessage: 'El documento ha sido anulado.',
    },
  };
  
  const config = configuracion[estado];
  const mensajeFinal = mensaje || config.defaultMessage;
  
  return (
    <Alert variant={config.variant} className={className}>
      <AlertTitle>
        {config.title}
        {numeroDocumento && ` - ${numeroDocumento}`}
      </AlertTitle>
      <AlertDescription>
        <p>{mensajeFinal}</p>
        {detalles && detalles.length > 0 && (
          <div className="mt-2">
            <p className="font-medium text-xs">Detalles:</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              {detalles.map((detalle, index) => (
                <li key={index} className="text-xs">
                  {detalle}
                </li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
      
      {(onRetry || onViewDetails) && (
        <AlertActions>
          {onRetry && estado === 'rechazado' && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              Reintentar
            </button>
          )}
          {onViewDetails && (
            <button
              type="button"
              onClick={onViewDetails}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Ver Detalles
            </button>
          )}
        </AlertActions>
      )}
    </Alert>
  );
};

/**
 * Alert para validaciones de formulario
 */
export interface PropiedadesAlertValidacion {
  errores: string[];
  title?: string;
  className?: string;
}

export const AlertValidacion: React.FC<PropiedadesAlertValidacion> = ({
  errores,
  title = 'Errores de Validación',
  className,
}) => {
  if (errores.length === 0) return null;
  
  return (
    <Alert variant="error" className={className}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {errores.length === 1 ? (
          <p>{errores[0]}</p>
        ) : (
          <div>
            <p>Se encontraron los siguientes errores:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {errores.map((error, index) => (
                <li key={index} className="text-xs">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

// =======================================================
// HOOKS UTILITARIOS
// =======================================================

/**
 * Hook para manejar alertas temporales
 */
export const useAlert = () => {
  const [alerts, setAlerts] = React.useState<Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message: string;
    duration?: number;
  }>>([]);
  
  const addAlert = React.useCallback((alert: {
    type: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message: string;
    duration?: number;
  }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newAlert = { ...alert, id };
    
    setAlerts(prev => [...prev, newAlert]);
    
    // Auto-dismiss después del tiempo especificado
    if (alert.duration !== 0) {
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }, alert.duration || 5000);
    }
    
    return id;
  }, []);
  
  const removeAlert = React.useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);
  
  const clearAlerts = React.useCallback(() => {
    setAlerts([]);
  }, []);
  
  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
  };
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default Alert;