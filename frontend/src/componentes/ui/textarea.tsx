/**
 * Componente Textarea UI Mejorado - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Textarea reutilizable con funcionalidades avanzadas
 */

import React, { forwardRef, useState, useRef, useImperativeHandle, useEffect } from 'react';
import { cn } from '../../utils/cn';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesTextarea 
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  // Estados visuales
  estado?: 'default' | 'error' | 'success' | 'warning';
  variant?: 'default' | 'outline' | 'filled';
  tamaño?: 'sm' | 'md' | 'lg';
  
  // Funcionalidades
  label?: string;
  descripcion?: string;
  mensajeError?: string;
  requerido?: boolean;
  
  // Contador de caracteres
  maxLength?: number;
  mostrarContador?: boolean;
  
  // Auto-resize
  autoResize?: boolean;
  alturaMinima?: number;
  alturaMaxima?: number;
  
  // Validación
  validacion?: (valor: string) => string | null;
  validarEnTiempoReal?: boolean;
  
  // Personalización
  icono?: React.ReactNode;
  accionesExtras?: React.ReactNode;
  
  // Clases CSS
  className?: string;
  classNameContainer?: string;
  classNameLabel?: string;
  classNameTextarea?: string;
  classNameDescripcion?: string;
  classNameError?: string;
  
  // Eventos extendidos
  onValorCambio?: (valor: string) => void;
  onValidacion?: (esValido: boolean, mensaje?: string) => void;
}

export interface RefTextarea {
  focus: () => void;
  blur: () => void;
  seleccionar: () => void;
  obtenerValor: () => string;
  establecerValor: (valor: string) => void;
  validar: () => boolean;
  limpiar: () => void;
}

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const Textarea = forwardRef<RefTextarea, PropiedadesTextarea>(({
  // Propiedades de estado
  estado = 'default',
  variant = 'default',
  tamaño = 'md',
  
  // Propiedades de contenido
  label,
  descripcion,
  mensajeError,
  requerido = false,
  
  // Contador
  maxLength,
  mostrarContador = true,
  
  // Auto-resize
  autoResize = false,
  alturaMinima = 80,
  alturaMaxima = 300,
  
  // Validación
  validacion,
  validarEnTiempoReal = false,
  
  // Personalización
  icono,
  accionesExtras,
  
  // Clases
  className,
  classNameContainer,
  classNameLabel,
  classNameTextarea,
  classNameDescripcion,
  classNameError,
  
  // Props nativas
  value,
  defaultValue,
  placeholder,
  disabled,
  readOnly,
  rows = 4,
  
  // Eventos
  onChange,
  onValorCambio,
  onValidacion,
  onBlur,
  onFocus,
  
  ...props
}, ref) => {
  // Estado interno
  const [valorInterno, setValorInterno] = useState(defaultValue || '');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [enfocado, setEnfocado] = useState(false);
  
  // Referencias
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Valor actual (controlado o no controlado)
  const valorActual = value !== undefined ? value : valorInterno;
  
  // Auto-resize del textarea
  const ajustarAltura = () => {
    if (!autoResize || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    
    const alturaCalculada = Math.max(
      alturaMinima,
      Math.min(alturaMaxima, textarea.scrollHeight)
    );
    
    textarea.style.height = `${alturaCalculada}px`;
  };

  // Validar valor
  const validarValor = (nuevoValor: string): boolean => {
    let mensajeValidacion: string | null = null;
    
    // Validación de requerido
    if (requerido && !nuevoValor.trim()) {
      mensajeValidacion = 'Este campo es requerido';
    }
    
    // Validación personalizada
    if (!mensajeValidacion && validacion) {
      mensajeValidacion = validacion(nuevoValor);
    }
    
    setErrorValidacion(mensajeValidacion);
    
    const esValido = !mensajeValidacion;
    onValidacion?.(esValido, mensajeValidacion || undefined);
    
    return esValido;
  };

  // Manejar cambio de valor
  const manejarCambio = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nuevoValor = event.target.value;
    
    // Limitar longitud si está definida
    if (maxLength && nuevoValor.length > maxLength) {
      return;
    }
    
    // Actualizar valor
    if (value === undefined) {
      setValorInterno(nuevoValor);
    }
    
    // Validar en tiempo real si está habilitado
    if (validarEnTiempoReal) {
      validarValor(nuevoValor);
    }
    
    // Ejecutar callbacks
    onChange?.(event);
    onValorCambio?.(nuevoValor);
    
    // Auto-resize
    if (autoResize) {
      setTimeout(ajustarAltura, 0);
    }
  };

  // Manejar enfoque
  const manejarEnfoque = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setEnfocado(true);
    onFocus?.(event);
  };

  // Manejar pérdida de enfoque
  const manejarBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setEnfocado(false);
    
    // Validar al perder el foco
    if (!validarEnTiempoReal) {
      validarValor(valorActual as string);
    }
    
    onBlur?.(event);
  };

  // Imperativo handle para ref
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    blur: () => textareaRef.current?.blur(),
    seleccionar: () => textareaRef.current?.select(),
    obtenerValor: () => valorActual as string,
    establecerValor: (valor: string) => {
      if (value === undefined) {
        setValorInterno(valor);
      }
      if (textareaRef.current) {
        textareaRef.current.value = valor;
      }
    },
    validar: () => validarValor(valorActual as string),
    limpiar: () => {
      if (value === undefined) {
        setValorInterno('');
      }
      setErrorValidacion(null);
    },
  }));

  // Efecto para auto-resize inicial
  useEffect(() => {
    if (autoResize) {
      ajustarAltura();
    }
  }, [valorActual, autoResize]);

  // Determinar estado visual final
  const estadoFinal = errorValidacion || mensajeError ? 'error' : estado;
  
  // Clases CSS
  const clasesContainer = cn(
    'flex flex-col space-y-1',
    classNameContainer
  );

  const clasesLabel = cn(
    'text-sm font-medium',
    {
      'text-gray-700': estadoFinal === 'default',
      'text-red-600': estadoFinal === 'error',
      'text-green-600': estadoFinal === 'success',
      'text-yellow-600': estadoFinal === 'warning',
    },
    classNameLabel
  );

  const clasesTextareaWrapper = cn(
    'relative',
    { 'opacity-50': disabled }
  );

  const clasesTextarea = cn(
    'w-full transition-colors duration-200 resize-none',
    // Variantes base
    {
      'border border-gray-300 bg-white': variant === 'default',
      'border-2 border-gray-300 bg-white': variant === 'outline',
      'border border-gray-300 bg-gray-50': variant === 'filled',
    },
    // Tamaños
    {
      'px-2 py-1.5 text-sm': tamaño === 'sm',
      'px-3 py-2 text-sm': tamaño === 'md',
      'px-4 py-3 text-base': tamaño === 'lg',
    },
    // Estados
    {
      'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20': 
        estadoFinal === 'default',
      'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20': 
        estadoFinal === 'error',
      'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-20': 
        estadoFinal === 'success',
      'border-yellow-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-20': 
        estadoFinal === 'warning',
    },
    // Otros estados
    {
      'cursor-not-allowed bg-gray-100': disabled,
      'resize-y': !autoResize,
      'resize-none overflow-hidden': autoResize,
    },
    'rounded-md focus:outline-none',
    classNameTextarea
  );

  const clasesDescripcion = cn(
    'text-xs text-gray-600',
    classNameDescripcion
  );

  const clasesError = cn(
    'text-xs text-red-600',
    classNameError
  );

  const clasesContador = cn(
    'text-xs',
    {
      'text-gray-500': !maxLength || valorActual.length < maxLength * 0.8,
      'text-yellow-600': maxLength && valorActual.length >= maxLength * 0.8 && valorActual.length < maxLength,
      'text-red-600': maxLength && valorActual.length >= maxLength,
    }
  );

  return (
    <div className={cn(clasesContainer, className)}>
      {/* Label */}
      {label && (
        <label className={clasesLabel}>
          {label}
          {requerido && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Wrapper del textarea */}
      <div className={clasesTextareaWrapper}>
        {/* Icono izquierdo */}
        {icono && (
          <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
            {icono}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={valorActual}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={autoResize ? 1 : rows}
          className={cn(
            clasesTextarea,
            { 'pl-10': icono }
          )}
          style={{
            minHeight: autoResize ? alturaMinima : undefined,
            maxHeight: autoResize ? alturaMaxima : undefined,
          }}
          onChange={manejarCambio}
          onFocus={manejarEnfoque}
          onBlur={manejarBlur}
          {...props}
        />

        {/* Acciones extras */}
        {accionesExtras && (
          <div className="absolute right-3 top-3">
            {accionesExtras}
          </div>
        )}
      </div>

      {/* Footer con descripción y contador */}
      {(descripcion || mostrarContador || errorValidacion || mensajeError) && (
        <div className="flex justify-between items-start space-x-2">
          <div className="flex-1">
            {/* Descripción */}
            {descripcion && !errorValidacion && !mensajeError && (
              <p className={clasesDescripcion}>{descripcion}</p>
            )}
            
            {/* Mensaje de error */}
            {(errorValidacion || mensajeError) && (
              <p className={clasesError}>
                {errorValidacion || mensajeError}
              </p>
            )}
          </div>

          {/* Contador de caracteres */}
          {mostrarContador && maxLength && (
            <span className={clasesContador}>
              {valorActual.length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// =======================================================
// COMPONENTE SIMPLIFICADO
// =======================================================

export interface PropiedadesTextareaSimple {
  label?: string;
  placeholder?: string;
  valor?: string;
  onCambio?: (valor: string) => void;
  error?: string;
  requerido?: boolean;
  disabled?: boolean;
  maxLength?: number;
  autoResize?: boolean;
  className?: string;
}

export const TextareaSimple: React.FC<PropiedadesTextareaSimple> = ({
  label,
  placeholder,
  valor,
  onCambio,
  error,
  requerido = false,
  disabled = false,
  maxLength,
  autoResize = false,
  className,
}) => {
  return (
    <Textarea
      label={label}
      placeholder={placeholder}
      value={valor}
      onValorCambio={onCambio}
      mensajeError={error}
      requerido={requerido}
      disabled={disabled}
      maxLength={maxLength}
      autoResize={autoResize}
      mostrarContador={!!maxLength}
      className={className}
    />
  );
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default Textarea;