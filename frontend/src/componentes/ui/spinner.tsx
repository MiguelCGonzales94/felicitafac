/**
 * Componente Spinner - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente para mostrar estados de carga y loading
 */

import React from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

export interface PropiedadesSpinner {
  // Configuración básica
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  
  // Tipos de spinner
  type?: 'default' | 'dots' | 'bars' | 'pulse' | 'bounce' | 'custom';
  
  // Configuración de velocidad
  speed?: 'slow' | 'normal' | 'fast';
  
  // Texto y etiquetas
  label?: string;
  srLabel?: string;
  
  // Clases CSS
  className?: string;
  
  // Props adicionales
  show?: boolean;
  overlay?: boolean;
  center?: boolean;
  
  // Icono personalizado (para tipo custom)
  icon?: React.ReactNode;
}

export interface PropiedadesLoadingOverlay {
  show: boolean;
  children?: React.ReactNode;
  spinner?: React.ReactNode;
  message?: string;
  className?: string;
  blur?: boolean;
}

export interface PropiedadesLoadingButton {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  spinner?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// =======================================================
// CONFIGURACIÓN DE VARIANTES
// =======================================================

const spinnerVariants = {
  size: {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  },
  variant: {
    default: 'text-gray-600',
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  },
  speed: {
    slow: 'animate-spin [animation-duration:2s]',
    normal: 'animate-spin [animation-duration:1s]',
    fast: 'animate-spin [animation-duration:0.5s]',
  },
};

// =======================================================
// TIPOS DE SPINNERS
// =======================================================

const SpinnerDefault: React.FC<{ className: string }> = ({ className }) => (
  <div
    className={cn(
      'border-2 border-current border-t-transparent rounded-full',
      className
    )}
  />
);

const SpinnerIcon: React.FC<{ className: string }> = ({ className }) => (
  <Loader2 className={className} />
);

const SpinnerDots: React.FC<{ size: string; variant: string }> = ({ size, variant }) => {
  const dotSize = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3',
  };
  
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-current',
            dotSize[size as keyof typeof dotSize],
            'animate-bounce',
            variant
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
};

const SpinnerBars: React.FC<{ size: string; variant: string }> = ({ size, variant }) => {
  const barDimensions = {
    xs: { width: 'w-0.5', height: 'h-3' },
    sm: { width: 'w-0.5', height: 'h-4' },
    md: { width: 'w-1', height: 'h-6' },
    lg: { width: 'w-1', height: 'h-8' },
    xl: { width: 'w-1.5', height: 'h-12' },
  };
  
  const dims = barDimensions[size as keyof typeof barDimensions];
  
  return (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-current animate-pulse',
            dims.width,
            dims.height,
            variant
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1.2s',
          }}
        />
      ))}
    </div>
  );
};

const SpinnerPulse: React.FC<{ className: string }> = ({ className }) => (
  <div
    className={cn(
      'rounded-full bg-current animate-pulse',
      className
    )}
  />
);

const SpinnerBounce: React.FC<{ className: string; variant: string }> = ({ className, variant }) => (
  <div className="flex space-x-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          'w-2 h-2 rounded-full bg-current animate-bounce',
          variant
        )}
        style={{
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

// =======================================================
// COMPONENTE SPINNER PRINCIPAL
// =======================================================

export const Spinner = React.forwardRef<HTMLDivElement, PropiedadesSpinner>(
  (
    {
      size = 'md',
      variant = 'default',
      type = 'default',
      speed = 'normal',
      label,
      srLabel = 'Cargando...',
      className,
      show = true,
      overlay = false,
      center = false,
      icon,
      ...props
    },
    ref
  ) => {
    if (!show) return null;
    
    const spinnerClasses = cn(
      spinnerVariants.variant[variant],
      type === 'default' && spinnerVariants.speed[speed],
      center && 'mx-auto'
    );
    
    const renderSpinner = () => {
      switch (type) {
        case 'dots':
          return <SpinnerDots size={size} variant={spinnerVariants.variant[variant]} />;
        case 'bars':
          return <SpinnerBars size={size} variant={spinnerVariants.variant[variant]} />;
        case 'pulse':
          return <SpinnerPulse className={cn(spinnerVariants.size[size], spinnerClasses)} />;
        case 'bounce':
          return <SpinnerBounce className={spinnerVariants.size[size]} variant={spinnerVariants.variant[variant]} />;
        case 'custom':
          return icon || <SpinnerIcon className={cn(spinnerVariants.size[size], spinnerClasses)} />;
        default:
          return <SpinnerDefault className={cn(spinnerVariants.size[size], spinnerClasses)} />;
      }
    };
    
    const content = (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center',
          label && 'space-x-2',
          className
        )}
        role="status"
        aria-label={srLabel}
        {...props}
      >
        {renderSpinner()}
        {label && (
          <span className="text-sm text-current">{label}</span>
        )}
        <span className="sr-only">{srLabel}</span>
      </div>
    );
    
    if (overlay) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          {content}
        </div>
      );
    }
    
    return content;
  }
);

Spinner.displayName = 'Spinner';

// =======================================================
// COMPONENTE LOADING OVERLAY
// =======================================================

export const LoadingOverlay: React.FC<PropiedadesLoadingOverlay> = ({
  show,
  children,
  spinner,
  message = 'Cargando...',
  className,
  blur = true,
}) => {
  if (!show) return null;
  
  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center z-50',
        blur ? 'bg-white bg-opacity-80 backdrop-blur-sm' : 'bg-white bg-opacity-90',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        {spinner || <Spinner size="lg" />}
        {message && (
          <p className="text-sm text-gray-600 text-center max-w-xs">
            {message}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE LOADING BUTTON
// =======================================================

export const LoadingButton = React.forwardRef<HTMLButtonElement, PropiedadesLoadingButton>(
  (
    {
      loading,
      children,
      loadingText,
      spinner,
      disabled,
      className,
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (!loading && !disabled) {
        onClick?.();
      }
    };
    
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center space-x-2 rounded-md px-4 py-2 text-sm font-medium',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          className
        )}
        {...props}
      >
        {loading && (
          spinner || <Spinner size="sm" variant="primary" type="custom" icon={<RotateCcw className="w-4 h-4 animate-spin" />} />
        )}
        <span>{loading && loadingText ? loadingText : children}</span>
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

// =======================================================
// COMPONENTES ESPECIALIZADOS PARA FELICITAFAC
// =======================================================

/**
 * Spinner para procesos de SUNAT
 */
export interface PropiedadesSpinnerSUNAT {
  proceso: 'emitiendo' | 'enviando' | 'validando' | 'procesando';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SpinnerSUNAT: React.FC<PropiedadesSpinnerSUNAT> = ({
  proceso,
  size = 'md',
  className,
}) => {
  const mensajes = {
    emitiendo: 'Emitiendo documento...',
    enviando: 'Enviando a SUNAT...',
    validando: 'Validando respuesta...',
    procesando: 'Procesando documento...',
  };
  
  return (
    <Spinner
      size={size}
      variant="primary"
      type="default"
      label={mensajes[proceso]}
      className={className}
    />
  );
};

/**
 * Overlay para carga de página
 */
export interface PropiedadesPageLoader {
  show: boolean;
  message?: string;
  progress?: number;
  className?: string;
}

export const PageLoader: React.FC<PropiedadesPageLoader> = ({
  show,
  message = 'Cargando FELICITAFAC...',
  progress,
  className,
}) => {
  if (!show) return null;
  
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'bg-white bg-opacity-90 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-6 max-w-sm text-center">
        {/* Logo y spinner */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="absolute -inset-2">
            <Spinner size="xl" variant="primary" type="default" />
          </div>
        </div>
        
        {/* Mensaje */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {message}
          </h3>
          
          {/* Barra de progreso */}
          {progress !== undefined && (
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Spinner para tablas y listas
 */
export interface PropiedadesTableLoader {
  show: boolean;
  rows?: number;
  columns?: number;
  message?: string;
  className?: string;
}

export const TableLoader: React.FC<PropiedadesTableLoader> = ({
  show,
  rows = 5,
  columns = 4,
  message = 'Cargando datos...',
  className,
}) => {
  if (!show) return null;
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Mensaje */}
      <div className="flex items-center justify-center space-x-2 text-gray-500">
        <Spinner size="sm" variant="default" />
        <span className="text-sm">{message}</span>
      </div>
      
      {/* Skeleton rows */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 bg-gray-200 rounded animate-pulse flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Mini spinner para iconos
 */
export interface PropiedadesMiniSpinner {
  className?: string;
  color?: string;
}

export const MiniSpinner: React.FC<PropiedadesMiniSpinner> = ({
  className,
  color = 'currentColor',
}) => (
  <div
    className={cn('w-3 h-3 border border-current border-t-transparent rounded-full animate-spin', className)}
    style={{ borderColor: `${color} transparent transparent transparent` }}
  />
);

// =======================================================
// HOOKS UTILITARIOS
// =======================================================

/**
 * Hook para manejar estados de carga
 */
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState);
  
  const startLoading = React.useCallback(() => setLoading(true), []);
  const stopLoading = React.useCallback(() => setLoading(false), []);
  const toggleLoading = React.useCallback(() => setLoading(prev => !prev), []);
  
  const withLoading = React.useCallback(async (fn: () => Promise<any>) => {
    startLoading();
    try {
      const result = await fn();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);
  
  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading,
  };
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default Spinner;