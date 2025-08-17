/**
 * Componente Progress - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Barra de progreso compatible con sistema de UI
 */

import React from 'react';
import { cn } from '../../utils/cn';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
  striped?: boolean;
}

// =======================================================
// CONFIGURACIONES
// =======================================================

const SIZES = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
};

const VARIANTS = {
  default: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
  info: 'bg-cyan-600'
};

const BACKGROUND_VARIANTS = {
  default: 'bg-blue-100',
  success: 'bg-green-100',
  warning: 'bg-yellow-100',
  error: 'bg-red-100',
  info: 'bg-cyan-100'
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    value = 0,
    max = 100,
    className,
    indicatorClassName,
    size = 'md',
    variant = 'default',
    animated = false,
    showLabel = false,
    label,
    striped = false,
    ...props
  }, ref) => {
    // Calcular porcentaje
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    // Determinar el texto del label
    const labelText = label || `${Math.round(percentage)}%`;

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full",
          SIZES[size],
          BACKGROUND_VARIANTS[variant],
          className
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label || `${percentage}% completado`}
        {...props}
      >
        {/* Barra de progreso */}
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out rounded-full",
            VARIANTS[variant],
            animated && "animate-pulse",
            striped && "bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_20px]",
            indicatorClassName
          )}
          style={{
            width: `${percentage}%`,
            transform: 'translateZ(0)' // Optimización para hardware acceleration
          }}
        >
          {/* Animación de rayas si está habilitada */}
          {striped && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] bg-[length:200px_100%]" />
          )}
        </div>

        {/* Label superpuesto */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              "text-xs font-medium",
              percentage > 50 ? "text-white" : "text-gray-700"
            )}>
              {labelText}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

// =======================================================
// COMPONENTES AUXILIARES
// =======================================================

/**
 * Progreso circular
 */
const CircularProgress: React.FC<{
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
  label?: string;
}> = ({
  value = 0,
  max = 100,
  size = 40,
  strokeWidth = 4,
  className,
  variant = 'default',
  showLabel = false,
  label
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const colors = {
    default: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4'
  };

  const labelText = label || `${Math.round(percentage)}%`;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Círculo de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Círculo de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      
      {/* Label central */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-700">
            {labelText}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Múltiples barras de progreso
 */
const MultiProgress: React.FC<{
  items: Array<{
    value: number;
    max?: number;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    label?: string;
  }>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  stacked?: boolean;
}> = ({
  items,
  className,
  size = 'md',
  showLabels = false,
  stacked = false
}) => {
  if (stacked) {
    // Progreso apilado
    const totalMax = Math.max(...items.map(item => item.max || 100));
    
    return (
      <div className={cn("relative w-full overflow-hidden rounded-full", SIZES[size], "bg-gray-200", className)}>
        {items.map((item, index) => {
          const percentage = Math.min(Math.max((item.value / (item.max || totalMax)) * 100, 0), 100);
          const previousPercentages = items.slice(0, index).reduce((acc, prev) => 
            acc + Math.min(Math.max((prev.value / (prev.max || totalMax)) * 100, 0), 100), 0
          );
          
          return (
            <div
              key={index}
              className={cn(
                "absolute top-0 h-full transition-all duration-300 ease-in-out",
                VARIANTS[item.variant || 'default']
              )}
              style={{
                left: `${previousPercentages}%`,
                width: `${percentage}%`
              }}
              title={item.label || `${Math.round(percentage)}%`}
            />
          );
        })}
      </div>
    );
  }

  // Múltiples barras separadas
  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <div key={index} className="space-y-1">
          {showLabels && item.label && (
            <div className="flex justify-between text-xs text-gray-600">
              <span>{item.label}</span>
              <span>{Math.round((item.value / (item.max || 100)) * 100)}%</span>
            </div>
          )}
          <Progress
            value={item.value}
            max={item.max}
            variant={item.variant}
            size={size}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Progreso con pasos
 */
const StepProgress: React.FC<{
  currentStep: number;
  totalSteps: number;
  steps?: Array<{
    label: string;
    description?: string;
  }>;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showLabels?: boolean;
}> = ({
  currentStep,
  totalSteps,
  steps,
  className,
  variant = 'default',
  showLabels = true
}) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Barra de progreso */}
      <Progress
        value={percentage}
        variant={variant}
        className="mb-4"
      />
      
      {/* Pasos */}
      {showLabels && steps && (
        <div className="flex justify-between">
          {steps.slice(0, totalSteps).map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center text-center flex-1",
                index < steps.length - 1 && "mr-4"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 mb-2",
                  index < currentStep
                    ? `${VARIANTS[variant]} text-white border-transparent`
                    : index === currentStep
                    ? `border-${variant === 'default' ? 'blue' : variant}-600 text-${variant === 'default' ? 'blue' : variant}-600 bg-white`
                    : "border-gray-300 text-gray-400 bg-gray-50"
                )}
              >
                {index + 1}
              </div>
              <div className="text-xs">
                <div className={cn(
                  "font-medium",
                  index <= currentStep ? "text-gray-900" : "text-gray-400"
                )}>
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-gray-500 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =======================================================
// ESTILOS KEYFRAMES (agregar al CSS global si es necesario)
// =======================================================

/*
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}
*/

// =======================================================
// EXPORT
// =======================================================

export { Progress, CircularProgress, MultiProgress, StepProgress };
export type { ProgressProps };
export default Progress;