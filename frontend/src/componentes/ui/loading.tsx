/**
 * Componente Loading UI - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Indicadores de carga reutilizables
 */

import React from 'react';
import { Loader2, RefreshCw, Clock, Upload, Download } from 'lucide-react';
import { cn } from '../../utils/cn';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export type TipoSpinner = 'default' | 'dots' | 'pulse' | 'bounce' | 'wave' | 'ring';
export type TamañoLoading = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type VariantLoading = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';

export interface PropiedadesSpinner {
  tipo?: TipoSpinner;
  tamaño?: TamañoLoading;
  variant?: VariantLoading;
  className?: string;
}

export interface PropiedadesLoadingButton {
  loading?: boolean;
  children: React.ReactNode;
  tipo?: TipoSpinner;
  tamaño?: TamañoLoading;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export interface PropiedadesLoadingOverlay {
  loading: boolean;
  mensaje?: string;
  tipo?: TipoSpinner;
  tamaño?: TamañoLoading;
  variant?: VariantLoading;
  transparente?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface PropiedadesLoadingPage {
  mensaje?: string;
  submensaje?: string;
  icono?: React.ReactNode;
  tipo?: TipoSpinner;
  mostrarLogo?: boolean;
  className?: string;
}

export interface PropiedadesProgreso {
  valor: number;
  max?: number;
  mostrarPorcentaje?: boolean;
  mostrarValor?: boolean;
  mensaje?: string;
  variant?: VariantLoading;
  tamaño?: 'sm' | 'md' | 'lg';
  className?: string;
}

// =======================================================
// SPINNER BÁSICO
// =======================================================

export const Spinner: React.FC<PropiedadesSpinner> = ({
  tipo = 'default',
  tamaño = 'md',
  variant = 'primary',
  className,
}) => {
  // Clases de tamaño
  const clasesTamaño = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  // Clases de color
  const clasesVariant = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    white: 'text-white',
  };

  // Render según tipo
  switch (tipo) {
    case 'default':
      return (
        <Loader2 
          className={cn(
            'animate-spin',
            clasesTamaño[tamaño],
            clasesVariant[variant],
            className
          )}
        />
      );

    case 'dots':
      return (
        <div className={cn('flex space-x-1', className)}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full animate-pulse',
                {
                  'w-1 h-1': tamaño === 'xs',
                  'w-1.5 h-1.5': tamaño === 'sm',
                  'w-2 h-2': tamaño === 'md',
                  'w-3 h-3': tamaño === 'lg',
                  'w-4 h-4': tamaño === 'xl',
                },
                {
                  'bg-blue-600': variant === 'primary',
                  'bg-gray-600': variant === 'secondary',
                  'bg-green-600': variant === 'success',
                  'bg-yellow-600': variant === 'warning',
                  'bg-red-600': variant === 'error',
                  'bg-white': variant === 'white',
                }
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      );

    case 'pulse':
      return (
        <div
          className={cn(
            'rounded-full animate-pulse',
            clasesTamaño[tamaño],
            {
              'bg-blue-600': variant === 'primary',
              'bg-gray-600': variant === 'secondary',
              'bg-green-600': variant === 'success',
              'bg-yellow-600': variant === 'warning',
              'bg-red-600': variant === 'error',
              'bg-white': variant === 'white',
            },
            className
          )}
        />
      );

    case 'bounce':
      return (
        <div className={cn('flex space-x-1', className)}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full animate-bounce',
                {
                  'w-1 h-1': tamaño === 'xs',
                  'w-1.5 h-1.5': tamaño === 'sm',
                  'w-2 h-2': tamaño === 'md',
                  'w-3 h-3': tamaño === 'lg',
                  'w-4 h-4': tamaño === 'xl',
                },
                {
                  'bg-blue-600': variant === 'primary',
                  'bg-gray-600': variant === 'secondary',
                  'bg-green-600': variant === 'success',
                  'bg-yellow-600': variant === 'warning',
                  'bg-red-600': variant === 'error',
                  'bg-white': variant === 'white',
                }
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      );

    case 'wave':
      return (
        <div className={cn('flex space-x-1 items-end', className)}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                'animate-pulse',
                {
                  'w-1': tamaño === 'xs' || tamaño === 'sm',
                  'w-1.5': tamaño === 'md',
                  'w-2': tamaño === 'lg',
                  'w-3': tamaño === 'xl',
                  'h-2': tamaño === 'xs',
                  'h-3': tamaño === 'sm',
                  'h-4': tamaño === 'md',
                  'h-6': tamaño === 'lg',
                  'h-8': tamaño === 'xl',
                },
                {
                  'bg-blue-600': variant === 'primary',
                  'bg-gray-600': variant === 'secondary',
                  'bg-green-600': variant === 'success',
                  'bg-yellow-600': variant === 'warning',
                  'bg-red-600': variant === 'error',
                  'bg-white': variant === 'white',
                }
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                height: `${20 + Math.sin((i * Math.PI) / 4) * 10}%`,
              }}
            />
          ))}
        </div>
      );

    case 'ring':
      return (
        <div
          className={cn(
            'border-2 border-transparent rounded-full animate-spin',
            clasesTamaño[tamaño],
            {
              'border-t-blue-600': variant === 'primary',
              'border-t-gray-600': variant === 'secondary',
              'border-t-green-600': variant === 'success',
              'border-t-yellow-600': variant === 'warning',
              'border-t-red-600': variant === 'error',
              'border-t-white': variant === 'white',
            },
            className
          )}
          style={{
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
          }}
        />
      );

    default:
      return (
        <Loader2 
          className={cn(
            'animate-spin',
            clasesTamaño[tamaño],
            clasesVariant[variant],
            className
          )}
        />
      );
  }
};

// =======================================================
// BOTÓN CON LOADING
// =======================================================

export const LoadingButton: React.FC<PropiedadesLoadingButton> = ({
  loading = false,
  children,
  tipo = 'default',
  tamaño = 'sm',
  disabled = false,
  className,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center space-x-2 transition-opacity',
        {
          'opacity-70 cursor-not-allowed': loading || disabled,
        },
        className
      )}
    >
      {loading && (
        <Spinner 
          tipo={tipo} 
          tamaño={tamaño} 
          variant="white"
        />
      )}
      <span>{children}</span>
    </button>
  );
};

// =======================================================
// OVERLAY DE LOADING
// =======================================================

export const LoadingOverlay: React.FC<PropiedadesLoadingOverlay> = ({
  loading,
  mensaje = 'Cargando...',
  tipo = 'default',
  tamaño = 'lg',
  variant = 'primary',
  transparente = false,
  className,
  children,
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', className)}>
      {children && (
        <div className={cn({ 'opacity-50 pointer-events-none': loading })}>
          {children}
        </div>
      )}
      
      {loading && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center z-50',
            {
              'bg-white/80 backdrop-blur-sm': !transparente,
              'bg-transparent': transparente,
            }
          )}
        >
          <div className="flex flex-col items-center space-y-3">
            <Spinner 
              tipo={tipo} 
              tamaño={tamaño} 
              variant={variant}
            />
            {mensaje && (
              <p className="text-sm text-gray-600 font-medium">
                {mensaje}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// =======================================================
// PÁGINA DE LOADING COMPLETA
// =======================================================

export const LoadingPage: React.FC<PropiedadesLoadingPage> = ({
  mensaje = 'Cargando aplicación...',
  submensaje,
  icono,
  tipo = 'default',
  mostrarLogo = true,
  className,
}) => {
  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4',
      className
    )}>
      <div className="text-center space-y-6 max-w-md">
        {/* Logo o icono */}
        {mostrarLogo && (
          <div className="flex justify-center">
            {icono || (
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
            )}
          </div>
        )}

        {/* Spinner */}
        <div className="flex justify-center">
          <Spinner tipo={tipo} tamaño="xl" variant="primary" />
        </div>

        {/* Mensajes */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            {mensaje}
          </h2>
          {submensaje && (
            <p className="text-gray-600">
              {submensaje}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// =======================================================
// BARRA DE PROGRESO
// =======================================================

export const BarraProgreso: React.FC<PropiedadesProgreso> = ({
  valor,
  max = 100,
  mostrarPorcentaje = true,
  mostrarValor = false,
  mensaje,
  variant = 'primary',
  tamaño = 'md',
  className,
}) => {
  const porcentaje = Math.min(100, Math.max(0, (valor / max) * 100));

  const clasesVariant = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    white: 'bg-white',
  };

  const clasesTamaño = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Mensaje superior */}
      {mensaje && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {mensaje}
          </span>
          {(mostrarPorcentaje || mostrarValor) && (
            <span className="text-sm text-gray-600">
              {mostrarPorcentaje && `${Math.round(porcentaje)}%`}
              {mostrarPorcentaje && mostrarValor && ' '}
              {mostrarValor && `(${valor}/${max})`}
            </span>
          )}
        </div>
      )}

      {/* Barra de progreso */}
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        clasesTamaño[tamaño]
      )}>
        <div
          className={cn(
            'transition-all duration-300 ease-out rounded-full',
            clasesTamaño[tamaño],
            clasesVariant[variant]
          )}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTES ESPECIALIZADOS
// =======================================================

export const LoadingCard: React.FC<{ mensaje?: string; className?: string }> = ({
  mensaje = 'Cargando...',
  className,
}) => (
  <div className={cn(
    'bg-white rounded-lg shadow p-6 flex items-center justify-center space-x-3',
    className
  )}>
    <Spinner tamaño="md" variant="primary" />
    <span className="text-gray-600">{mensaje}</span>
  </div>
);

export const LoadingTable: React.FC<{ filas?: number; columnas?: number }> = ({
  filas = 5,
  columnas = 4,
}) => (
  <div className="animate-pulse">
    <div className="space-y-3">
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4">
          {Array.from({ length: columnas }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const LoadingTexto: React.FC<{ 
  lineas?: number; 
  anchoVariable?: boolean;
  className?: string;
}> = ({
  lineas = 3,
  anchoVariable = true,
  className,
}) => (
  <div className={cn('animate-pulse space-y-2', className)}>
    {Array.from({ length: lineas }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-gray-200 rounded"
        style={{
          width: anchoVariable ? `${60 + Math.random() * 40}%` : '100%',
        }}
      />
    ))}
  </div>
);

// =======================================================
// ICONOS DE ESTADOS ESPECÍFICOS
// =======================================================

export const IconoCargando: React.FC<{ accion?: string; className?: string }> = ({
  accion = 'procesando',
  className,
}) => {
  const iconos = {
    procesando: <RefreshCw className="animate-spin" />,
    guardando: <Upload className="animate-pulse" />,
    descargando: <Download className="animate-bounce" />,
    esperando: <Clock className="animate-pulse" />,
  };

  return (
    <span className={cn('text-blue-600', className)}>
      {iconos[accion as keyof typeof iconos] || iconos.procesando}
    </span>
  );
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default {
  Spinner,
  LoadingButton,
  LoadingOverlay,
  LoadingPage,
  BarraProgreso,
  LoadingCard,
  LoadingTable,
  LoadingTexto,
  IconoCargando,
};