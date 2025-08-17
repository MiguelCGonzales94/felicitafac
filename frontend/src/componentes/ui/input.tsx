/**
 * Input Component - FELICITAFAC (ARREGLADO)
 * Sistema de Facturación Electrónica para Perú
 * Componente base de input con validaciones y variantes
 * VERSIÓN CORREGIDA: Compatible con react-hook-form
 */

import React from 'react';
import { cn } from '../../utils/cn';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesInput extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outline';
  estado?: 'default' | 'error' | 'success' | 'warning';
  icono?: React.ReactNode;
  iconoPosicion?: 'left' | 'right';
  sufijo?: React.ReactNode;
  prefijo?: React.ReactNode;
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

export interface PropiedadesInputGroup {
  children: React.ReactNode;
  className?: string;
  label?: string;
  descripcion?: string;
  error?: string;
  requerido?: boolean;
}

export interface PropiedadesTextarea extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  estado?: 'default' | 'error' | 'success' | 'warning';
}

// =======================================================
// VARIANTES DE ESTILO
// =======================================================

const inputVariants = {
  size: {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  },
  variant: {
    default: 'border border-gray-300 bg-white',
    filled: 'border-0 bg-gray-100',
    outline: 'border-2 border-gray-300 bg-white',
  },
  estado: {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
    warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500',
  },
};

// =======================================================
// ESTILOS BASE
// =======================================================

const baseInputClasses = [
  'flex w-full rounded-md transition-colors',
  'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  'placeholder:text-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-offset-1',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ');

// =======================================================
// COMPONENTE PRINCIPAL - INPUT (ARREGLADO)
// =======================================================

const Input = React.forwardRef<HTMLInputElement, PropiedadesInput>(
  (
    {
      className,
      type = 'text',
      size = 'md',
      variant = 'default',
      estado = 'default',
      icono,
      iconoPosicion = 'left',
      sufijo,
      prefijo,
      loading = false,
      clearable = false,
      onClear,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    // ✅ SOLUCIÓN: Solo usar estado interno si NO hay value prop (uncontrolled)
    // Si hay value prop (controlled), confiar completamente en el padre
    const esControlado = value !== undefined;
    const [valorInternoUncontrolled, setValorInternoUncontrolled] = React.useState('');
    
    // ✅ SOLUCIÓN: Valor actual basado en si es controlado o no
    const valorActual = esControlado ? value : valorInternoUncontrolled;

    // ✅ SOLUCIÓN: Manejar cambio sin interferir con controlled components
    const manejarCambio = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      // Si es uncontrolled, actualizar estado interno
      if (!esControlado) {
        setValorInternoUncontrolled(e.target.value);
      }
      
      // Siempre llamar al onChange del padre (react-hook-form lo necesita)
      onChange?.(e);
    }, [esControlado, onChange]);

    // ✅ SOLUCIÓN: Manejar limpiar sin conflictos
    const manejarLimpiar = React.useCallback(() => {
      if (!esControlado) {
        setValorInternoUncontrolled('');
      }
      
      // Crear evento sintético para react-hook-form
      if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
      
      onClear?.();
    }, [esControlado, onChange, onClear]);

    // Determinar si mostrar ícono de limpiar
    const mostrarLimpiar = clearable && valorActual && !disabled && !loading;

    // Calcular clases
    const clases = cn(
      baseInputClasses,
      inputVariants.size[size],
      inputVariants.variant[variant],
      inputVariants.estado[estado],
      // Ajustar padding según íconos
      icono && iconoPosicion === 'left' && 'pl-10',
      icono && iconoPosicion === 'right' && 'pr-10',
      prefijo && 'pl-12',
      sufijo && 'pr-12',
      (mostrarLimpiar || loading) && 'pr-10',
      className
    );

    // ✅ SOLUCIÓN: Contenedor con posición relativa
    return (
      <div className="relative">
        {/* Prefijo */}
        {prefijo && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {prefijo}
          </div>
        )}

        {/* Ícono izquierdo */}
        {icono && iconoPosicion === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {icono}
          </div>
        )}

        {/* ✅ SOLUCIÓN: Input principal sin conflictos de estado */}
        <input
          type={type}
          className={clases}
          ref={ref}
          disabled={disabled || loading}
          value={valorActual}
          onChange={manejarCambio}
          {...props}
        />

        {/* Loading spinner */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </div>
        )}

        {/* Botón limpiar */}
        {mostrarLimpiar && !loading && (
          <button
            type="button"
            onClick={manejarLimpiar}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Ícono derecho */}
        {icono && iconoPosicion === 'right' && !loading && !mostrarLimpiar && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {icono}
          </div>
        )}

        {/* Sufijo */}
        {sufijo && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {sufijo}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// =======================================================
// COMPONENTE INPUT GROUP (SIN CAMBIOS)
// =======================================================

const InputGroup = React.forwardRef<HTMLDivElement, PropiedadesInputGroup>(
  ({ children, className, label, descripcion, error, requerido, ...props }, ref) => {
    const inputId = React.useId();

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {requerido && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input */}
        <div>
          {React.cloneElement(children as React.ReactElement, {
            id: inputId,
            estado: error ? 'error' : 'default',
          })}
        </div>

        {/* Descripción */}
        {descripcion && !error && (
          <p className="text-xs text-gray-500">{descripcion}</p>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1">
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

InputGroup.displayName = 'InputGroup';

// =======================================================
// COMPONENTE TEXTAREA (SIN CAMBIOS SIGNIFICATIVOS)
// =======================================================

const Textarea = React.forwardRef<HTMLTextAreaElement, PropiedadesTextarea>(
  ({ className, resize = 'vertical', estado = 'default', ...props }, ref) => {
    const clases = cn(
      baseInputClasses,
      'min-h-[80px] px-3 py-2',
      inputVariants.variant.default,
      inputVariants.estado[estado],
      {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      }[resize],
      className
    );

    return <textarea className={clases} ref={ref} {...props} />;
  }
);

Textarea.displayName = 'Textarea';

// =======================================================
// COMPONENTES ESPECIALIZADOS PARA POS (ARREGLADOS)
// =======================================================

/**
 * Input de búsqueda para productos (ARREGLADO)
 */
export interface PropiedadesInputBusqueda extends PropiedadesInput {
  onBuscar?: (termino: string) => void;
  debounceMs?: number;
}

export const InputBusqueda = React.forwardRef<HTMLInputElement, PropiedadesInputBusqueda>(
  ({ onBuscar, debounceMs = 300, onChange, ...props }, ref) => {
    const [termino, setTermino] = React.useState('');
    const timeoutRef = React.useRef<NodeJS.Timeout>();

    // ✅ SOLUCIÓN: Manejar onChange sin conflictos
    const manejarCambio = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const nuevoTermino = e.target.value;
      setTermino(nuevoTermino);
      
      // Llamar onChange del padre si existe
      onChange?.(e);
      
      // Debounce para búsqueda
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        onBuscar?.(nuevoTermino);
      }, debounceMs);
    }, [onChange, onBuscar, debounceMs]);

    // Cleanup
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <Input
        ref={ref}
        type="search"
        placeholder="Buscar productos..."
        value={termino}
        onChange={manejarCambio}
        clearable
        onClear={() => setTermino('')}
        icono={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        {...props}
      />
    );
  }
);

InputBusqueda.displayName = 'InputBusqueda';

/**
 * Input para cantidades (MEJORADO)
 */
export interface PropiedadesInputCantidad extends Omit<PropiedadesInput, 'type'> {
  min?: number;
  max?: number;
  paso?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export const InputCantidad = React.forwardRef<HTMLInputElement, PropiedadesInputCantidad>(
  ({ min = 0, max = 999999, paso = 1, onIncrement, onDecrement, value, onChange, ...props }, ref) => {
    const cantidadActual = Number(value) || 0;

    const incrementar = React.useCallback(() => {
      const nuevaCantidad = Math.min(cantidadActual + paso, max);
      onIncrement?.();
      
      // ✅ SOLUCIÓN: Crear evento sintético compatible
      if (onChange) {
        const syntheticEvent = {
          target: { value: nuevaCantidad.toString() },
          currentTarget: { value: nuevaCantidad.toString() },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    }, [cantidadActual, paso, max, onIncrement, onChange]);

    const decrementar = React.useCallback(() => {
      const nuevaCantidad = Math.max(cantidadActual - paso, min);
      onDecrement?.();
      
      // ✅ SOLUCIÓN: Crear evento sintético compatible
      if (onChange) {
        const syntheticEvent = {
          target: { value: nuevaCantidad.toString() },
          currentTarget: { value: nuevaCantidad.toString() },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    }, [cantidadActual, paso, min, onDecrement, onChange]);

    return (
      <div className="flex">
        <button
          type="button"
          onClick={decrementar}
          disabled={cantidadActual <= min}
          className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        
        <Input
          ref={ref}
          type="number"
          min={min}
          max={max}
          step={paso}
          value={cantidadActual}
          onChange={onChange}
          className="rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          {...props}
        />
        
        <button
          type="button"
          onClick={incrementar}
          disabled={cantidadActual >= max}
          className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    );
  }
);

InputCantidad.displayName = 'InputCantidad';

/**
 * Input para montos (SIN CAMBIOS)
 */
export interface PropiedadesInputMonto extends Omit<PropiedadesInput, 'type'> {
  moneda?: string;
  precision?: number;
}

export const InputMonto = React.forwardRef<HTMLInputElement, PropiedadesInputMonto>(
  ({ moneda = 'S/', precision = 2, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="number"
        step={1 / Math.pow(10, precision)}
        min={0}
        prefijo={<span className="text-gray-600 font-medium">{moneda}</span>}
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        {...props}
      />
    );
  }
);

InputMonto.displayName = 'InputMonto';

// =======================================================
// EXPORTACIONES
// =======================================================

export { Input, InputGroup, Textarea };
export default Input;