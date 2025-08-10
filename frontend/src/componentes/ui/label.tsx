/**
 * Label Component - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente de etiqueta para formularios
 */

import React from 'react';
import { cn } from '../../utils/cn';

export interface PropiedadesLabel extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  requerido?: boolean;
  descripcion?: string;
  error?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, PropiedadesLabel>(
  ({ className, children, requerido, descripcion, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label
          ref={ref}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error ? 'text-red-600' : 'text-gray-900',
            className
          )}
          {...props}
        >
          {children}
          {requerido && <span className="text-red-500 ml-1">*</span>}
        </label>
        {descripcion && (
          <p className={cn(
            'text-xs',
            error ? 'text-red-500' : 'text-gray-500'
          )}>
            {descripcion}
          </p>
        )}
      </div>
    );
  }
);

Label.displayName = 'Label';

export { Label };