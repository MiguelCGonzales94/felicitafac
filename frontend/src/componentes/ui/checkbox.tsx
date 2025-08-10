/**
 * Checkbox Component - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente de checkbox personalizado
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface PropiedadesCheckbox extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  children?: React.ReactNode;
  label?: string;
  descripcion?: string;
  error?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, PropiedadesCheckbox>(
  ({ 
    className, 
    children, 
    label, 
    descripcion, 
    error, 
    onCheckedChange, 
    onChange,
    id,
    ...props 
  }, ref) => {
    const checkboxId = id || React.useId();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      onCheckedChange?.(checked);
      onChange?.(event);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              className={cn(
                'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600',
                'data-[state=checked]:text-white',
                error && 'border-red-500 focus:ring-red-500',
                className
              )}
              onChange={handleChange}
              {...props}
            />
            {/* Icono de check */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Check 
                className={cn(
                  'h-3 w-3 text-white opacity-0 transition-opacity',
                  'peer-checked:opacity-100'
                )} 
              />
            </div>
          </div>
          
          {(label || children) && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'text-sm font-medium leading-none cursor-pointer',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                error ? 'text-red-600' : 'text-gray-900'
              )}
            >
              {label || children}
            </label>
          )}
        </div>

        {descripcion && !error && (
          <p className="text-xs text-gray-500 ml-6">{descripcion}</p>
        )}

        {error && (
          <p className="text-xs text-red-600 ml-6 flex items-center gap-1">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };