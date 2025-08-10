/**
 * Label Component - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente base de label compatible con react-hook-form
 */

import React from 'react';
import { cn } from '../../utils/cn.ts';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesLabel extends React.LabelHTMLAttributes<HTMLLabelElement> {
  requerido?: boolean;
  error?: boolean;
  descripcion?: string;
  variant?: 'default' | 'small' | 'large';
}

// =======================================================
// VARIANTES DE ESTILO
// =======================================================

const labelVariants = {
  variant: {
    default: 'text-sm font-medium',
    small: 'text-xs font-medium',
    large: 'text-base font-medium',
  },
  estado: {
    default: 'text-gray-700',
    error: 'text-red-700',
    disabled: 'text-gray-400',
  },
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const Label = React.forwardRef<HTMLLabelElement, PropiedadesLabel>(
  (
    {
      className,
      children,
      requerido = false,
      error = false,
      descripcion,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    // Determinar estado
    const estado = error ? 'error' : 'default';

    // Combinar clases
    const clases = cn(
      'block',
      labelVariants.variant[variant],
      labelVariants.estado[estado],
      'mb-1',
      className
    );

    return (
      <div className="space-y-1">
        <label className={clases} ref={ref} {...props}>
          {children}
          {requerido && (
            <span className="text-red-500 ml-1" aria-label="Requerido">
              *
            </span>
          )}
        </label>
        
        {descripcion && (
          <p className="text-xs text-gray-500">{descripcion}</p>
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
 * Label para formularios con estado de error
 */
export const LabelFormulario = React.forwardRef<HTMLLabelElement, PropiedadesLabel>(
  ({ error, ...props }, ref) => (
    <Label
      ref={ref}
      error={error}
      {...props}
    />
  )
);

LabelFormulario.displayName = 'LabelFormulario';

/**
 * Label pequeño para inputs compactos
 */
export const LabelPequeno = React.forwardRef<HTMLLabelElement, PropiedadesLabel>(
  (props, ref) => (
    <Label
      ref={ref}
      variant="small"
      {...props}
    />
  )
);

LabelPequeno.displayName = 'LabelPequeno';

/**
 * Label grande para títulos de sección
 */
export const LabelGrande = React.forwardRef<HTMLLabelElement, PropiedadesLabel>(
  (props, ref) => (
    <Label
      ref={ref}
      variant="large"
      {...props}
    />
  )
);

LabelGrande.displayName = 'LabelGrande';

// =======================================================
// EXPORTACIONES
// =======================================================

export { Label };
export default Label;