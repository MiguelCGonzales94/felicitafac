/**
 * Componente Label - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente label con soporte para estados y validaciones
 */

import React from 'react';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

export interface PropiedadesLabel extends React.LabelHTMLAttributes<HTMLLabelElement> {
  // Propiedades específicas del label
  children: React.ReactNode;
  htmlFor?: string;
  
  // Estados
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  
  // Variantes de estilo
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'secondary' | 'muted';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  
  // Funcionalidades adicionales
  tooltip?: string;
  description?: string;
  
  // Clases CSS
  className?: string;
  
  // Callbacks
  onClick?: (event: React.MouseEvent<HTMLLabelElement>) => void;
}

// =======================================================
// VARIANTES DE ESTILO
// =======================================================

const labelVariants = {
  size: {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  },
  variant: {
    default: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
  },
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
};

// =======================================================
// COMPONENTE LABEL PRINCIPAL
// =======================================================

export const Label = React.forwardRef<HTMLLabelElement, PropiedadesLabel>(
  (
    {
      children,
      htmlFor,
      required = false,
      disabled = false,
      error = false,
      size = 'md',
      variant = 'default',
      weight = 'medium',
      tooltip,
      description,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    // =======================================================
    // CLASES CSS
    // =======================================================
    
    const labelClasses = cn(
      // Clases base
      'block leading-tight transition-colors duration-150',
      
      // Variantes
      labelVariants.size[size],
      labelVariants.variant[variant],
      labelVariants.weight[weight],
      
      // Estados
      disabled && 'opacity-50 cursor-not-allowed',
      error && 'text-red-600',
      !disabled && 'cursor-pointer',
      
      // Hover effects
      !disabled && !error && 'hover:text-gray-700',
      
      // Custom className
      className
    );
    
    // =======================================================
    // MANEJADORES DE EVENTOS
    // =======================================================
    
    const handleClick = (event: React.MouseEvent<HTMLLabelElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      
      onClick?.(event);
    };
    
    // =======================================================
    // RENDER
    // =======================================================
    
    return (
      <div className="space-y-1">
        <label
          ref={ref}
          htmlFor={htmlFor}
          className={labelClasses}
          onClick={handleClick}
          title={tooltip}
          {...props}
        >
          <span className="flex items-center gap-1">
            {children}
            
            {/* Indicador de campo requerido */}
            {required && (
              <span 
                className="text-red-500 ml-1"
                aria-label="Campo requerido"
              >
                *
              </span>
            )}
            
            {/* Tooltip icon */}
            {tooltip && (
              <span 
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-xs cursor-help"
                title={tooltip}
                aria-label={`Información: ${tooltip}`}
              >
                ?
              </span>
            )}
          </span>
        </label>
        
        {/* Descripción adicional */}
        {description && (
          <p className={cn(
            'text-xs leading-relaxed',
            error ? 'text-red-500' : 'text-gray-500',
            disabled && 'opacity-50'
          )}>
            {description}
          </p>
        )}
      </div>
    );
  }
);

Label.displayName = 'Label';

// =======================================================
// COMPONENTES ESPECIALIZADOS
// =======================================================

/**
 * Label para formularios con mejor accesibilidad
 */
export const FormLabel = React.forwardRef<HTMLLabelElement, PropiedadesLabel & {
  fieldId: string;
  errorId?: string;
  helpId?: string;
}>(
  ({ fieldId, errorId, helpId, children, required, ...props }, ref) => {
    // Construir aria-describedby
    const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;
    
    return (
      <Label
        ref={ref}
        htmlFor={fieldId}
        required={required}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </Label>
    );
  }
);

FormLabel.displayName = 'FormLabel';

/**
 * Label para checkboxes y radios
 */
export const CheckboxLabel = React.forwardRef<HTMLLabelElement, PropiedadesLabel & {
  position?: 'left' | 'right';
}>(
  ({ children, position = 'right', className, ...props }, ref) => (
    <Label
      ref={ref}
      className={cn(
        'flex items-center gap-2 cursor-pointer',
        position === 'left' && 'flex-row-reverse justify-end',
        className
      )}
      weight="normal"
      {...props}
    >
      {children}
    </Label>
  )
);

CheckboxLabel.displayName = 'CheckboxLabel';

/**
 * Label con indicador de estado
 */
export const StatusLabel = React.forwardRef<HTMLLabelElement, PropiedadesLabel & {
  status?: 'success' | 'warning' | 'error' | 'info';
  statusText?: string;
}>(
  ({ children, status, statusText, className, ...props }, ref) => {
    const statusColors = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-blue-600',
    };
    
    return (
      <Label
        ref={ref}
        className={cn('flex items-center justify-between', className)}
        {...props}
      >
        <span>{children}</span>
        {status && statusText && (
          <span className={cn('text-xs font-normal', statusColors[status])}>
            {statusText}
          </span>
        )}
      </Label>
    );
  }
);

StatusLabel.displayName = 'StatusLabel';

/**
 * Label para grupos de campos
 */
export const FieldGroupLabel = React.forwardRef<HTMLDivElement, {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  description?: string;
}>(
  ({ children, className, required, description, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      <div className={cn(
        'text-sm font-semibold text-gray-900',
        'border-b border-gray-200 pb-1'
      )}>
        {children}
        {required && (
          <span className="text-red-500 ml-1" aria-label="Grupo requerido">
            *
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
);

FieldGroupLabel.displayName = 'FieldGroupLabel';

/**
 * Label para secciones de formulario
 */
export const SectionLabel = React.forwardRef<HTMLDivElement, {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
  icon?: React.ReactNode;
}>(
  ({ children, subtitle, className, icon, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1', className)} {...props}>
      <div className="flex items-center gap-2">
        {icon && (
          <div className="flex-shrink-0 text-gray-600">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900">
          {children}
        </h3>
      </div>
      {subtitle && (
        <p className="text-sm text-gray-600">
          {subtitle}
        </p>
      )}
      <div className="border-b border-gray-200 mt-2" />
    </div>
  )
);

SectionLabel.displayName = 'SectionLabel';

// =======================================================
// UTILIDADES PARA ACCESIBILIDAD
// =======================================================

/**
 * Hook para generar IDs únicos para labels y campos
 */
export const useFieldIds = (baseId?: string) => {
  const id = React.useId();
  const fieldId = baseId || `field-${id}`;
  
  return {
    fieldId,
    labelId: `${fieldId}-label`,
    errorId: `${fieldId}-error`,
    helpId: `${fieldId}-help`,
    describedBy: `${fieldId}-help ${fieldId}-error`,
  };
};

/**
 * Función para validar asociación de labels
 */
export const validateLabelAssociation = (labelElement: HTMLLabelElement) => {
  const htmlFor = labelElement.getAttribute('for');
  
  if (!htmlFor) {
    console.warn('Label sin atributo "for". Considera usar htmlFor para mejor accesibilidad.');
    return false;
  }
  
  const associatedField = document.getElementById(htmlFor);
  if (!associatedField) {
    console.warn(`Label apunta a campo con id "${htmlFor}" que no existe.`);
    return false;
  }
  
  return true;
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default Label;