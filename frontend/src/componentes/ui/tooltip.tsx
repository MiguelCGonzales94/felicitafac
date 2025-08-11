/**
 * Componente Tooltip UI - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Tooltip reutilizable con posicionamiento inteligente
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export type PosicionTooltip = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type AlineacionTooltip = 'start' | 'center' | 'end';
export type TriggerTooltip = 'hover' | 'click' | 'focus' | 'manual';

export interface PropiedadesTooltip {
  contenido: React.ReactNode;
  children: React.ReactElement;
  
  // Posicionamiento
  posicion?: PosicionTooltip;
  alineacion?: AlineacionTooltip;
  offset?: number;
  
  // Comportamiento
  trigger?: TriggerTooltip;
  delay?: number;
  delayEsconder?: number;
  disabled?: boolean;
  
  // Estilos
  className?: string;
  classNameContenido?: string;
  variant?: 'default' | 'dark' | 'light' | 'success' | 'warning' | 'error';
  tamaño?: 'sm' | 'md' | 'lg';
  maxWidth?: string;
  
  // Eventos
  onAbrir?: () => void;
  onCerrar?: () => void;
  
  // Control manual
  abierto?: boolean;
  onCambioEstado?: (abierto: boolean) => void;
}

export interface CoordendasTooltip {
  x: number;
  y: number;
  posicionFinal: PosicionTooltip;
}

// =======================================================
// HOOKS AUXILIARES
// =======================================================

const usePositionCalculator = () => {
  const calcularPosicion = useCallback((
    elementoTrigger: HTMLElement,
    elementoTooltip: HTMLElement,
    posicionDeseada: PosicionTooltip,
    alineacion: AlineacionTooltip,
    offset: number
  ): CoordendasTooltip => {
    const rectTrigger = elementoTrigger.getBoundingClientRect();
    const rectTooltip = elementoTooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Funciones para calcular cada posición
    const posiciones = {
      top: () => ({
        x: rectTrigger.left + rectTrigger.width / 2 - rectTooltip.width / 2,
        y: rectTrigger.top - rectTooltip.height - offset,
      }),
      bottom: () => ({
        x: rectTrigger.left + rectTrigger.width / 2 - rectTooltip.width / 2,
        y: rectTrigger.bottom + offset,
      }),
      left: () => ({
        x: rectTrigger.left - rectTooltip.width - offset,
        y: rectTrigger.top + rectTrigger.height / 2 - rectTooltip.height / 2,
      }),
      right: () => ({
        x: rectTrigger.right + offset,
        y: rectTrigger.top + rectTrigger.height / 2 - rectTooltip.height / 2,
      }),
    };

    // Ajustar posición según alineación
    const ajustarAlineacion = (coords: {x: number, y: number}, pos: PosicionTooltip) => {
      if (pos === 'top' || pos === 'bottom') {
        switch (alineacion) {
          case 'start':
            return { ...coords, x: rectTrigger.left };
          case 'end':
            return { ...coords, x: rectTrigger.right - rectTooltip.width };
          default:
            return coords;
        }
      } else {
        switch (alineacion) {
          case 'start':
            return { ...coords, y: rectTrigger.top };
          case 'end':
            return { ...coords, y: rectTrigger.bottom - rectTooltip.height };
          default:
            return coords;
        }
      }
    };

    // Verificar si una posición cabe en el viewport
    const cabEnViewport = (coords: {x: number, y: number}) => {
      return coords.x >= 0 && 
             coords.y >= 0 && 
             coords.x + rectTooltip.width <= viewportWidth && 
             coords.y + rectTooltip.height <= viewportHeight;
    };

    // Determinar la mejor posición
    let posicionFinal: PosicionTooltip = posicionDeseada;
    let coordenadas: {x: number, y: number};

    if (posicionDeseada === 'auto') {
      // Probar posiciones en orden de preferencia
      const posicionesAProbrar: PosicionTooltip[] = ['top', 'bottom', 'right', 'left'];
      
      for (const pos of posicionesAProbrar) {
        const coords = ajustarAlineacion(posiciones[pos](), pos);
        if (cabEnViewport(coords)) {
          posicionFinal = pos;
          coordenadas = coords;
          break;
        }
      }
      
      // Si ninguna cabe, usar 'top' como fallback
      if (!coordenadas!) {
        posicionFinal = 'top';
        coordenadas = ajustarAlineacion(posiciones.top(), 'top');
      }
    } else {
      coordenadas = ajustarAlineacion(posiciones[posicionDeseada](), posicionDeseada);
      
      // Si no cabe, intentar con auto
      if (!cabEnViewport(coordenadas)) {
        return calcularPosicion(elementoTrigger, elementoTooltip, 'auto', alineacion, offset);
      }
    }

    // Ajustar si se sale del viewport
    coordenadas.x = Math.max(0, Math.min(coordenadas.x, viewportWidth - rectTooltip.width));
    coordenadas.y = Math.max(0, Math.min(coordenadas.y, viewportHeight - rectTooltip.height));

    return {
      x: coordenadas.x,
      y: coordenadas.y,
      posicionFinal,
    };
  }, []);

  return { calcularPosicion };
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const Tooltip: React.FC<PropiedadesTooltip> = ({
  contenido,
  children,
  posicion = 'top',
  alineacion = 'center',
  offset = 8,
  trigger = 'hover',
  delay = 200,
  delayEsconder = 100,
  disabled = false,
  className,
  classNameContenido,
  variant = 'default',
  tamaño = 'md',
  maxWidth = '200px',
  onAbrir,
  onCerrar,
  abierto: abiertoControlado,
  onCambioEstado,
}) => {
  // Estado
  const [abiertoInterno, setAbiertoInterno] = useState(false);
  const [coordenadas, setCoordenadas] = useState<CoordendasTooltip | null>(null);
  
  // Referencias
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const timeoutEsconderRef = useRef<NodeJS.Timeout>();
  
  // Hooks
  const { calcularPosicion } = usePositionCalculator();
  
  // Estado actual del tooltip
  const estaAbierto = abiertoControlado !== undefined ? abiertoControlado : abiertoInterno;

  // Funciones de control
  const mostrarTooltip = useCallback(() => {
    if (disabled) return;
    
    if (timeoutEsconderRef.current) {
      clearTimeout(timeoutEsconderRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setAbiertoInterno(true);
      onCambioEstado?.(true);
      onAbrir?.();
    }, delay);
  }, [disabled, delay, onAbrir, onCambioEstado]);

  const esconderTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutEsconderRef.current = setTimeout(() => {
      setAbiertoInterno(false);
      onCambioEstado?.(false);
      onCerrar?.();
    }, delayEsconder);
  }, [delayEsconder, onCerrar, onCambioEstado]);

  const toggleTooltip = useCallback(() => {
    if (estaAbierto) {
      esconderTooltip();
    } else {
      mostrarTooltip();
    }
  }, [estaAbierto, mostrarTooltip, esconderTooltip]);

  // Actualizar posición del tooltip
  const actualizarPosicion = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current || !estaAbierto) return;

    const nuevasCoordenadas = calcularPosicion(
      triggerRef.current,
      tooltipRef.current,
      posicion,
      alineacion,
      offset
    );
    
    setCoordenadas(nuevasCoordenadas);
  }, [calcularPosicion, posicion, alineacion, offset, estaAbierto]);

  // Efectos
  useEffect(() => {
    if (estaAbierto) {
      actualizarPosicion();
      
      const manejarScroll = () => actualizarPosicion();
      const manejarResize = () => actualizarPosicion();
      
      window.addEventListener('scroll', manejarScroll, true);
      window.addEventListener('resize', manejarResize);
      
      return () => {
        window.removeEventListener('scroll', manejarScroll, true);
        window.removeEventListener('resize', manejarResize);
      };
    }
  }, [estaAbierto, actualizarPosicion]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (timeoutEsconderRef.current) clearTimeout(timeoutEsconderRef.current);
    };
  }, []);

  // Event handlers
  const manejarClickAfuera = useCallback((event: MouseEvent) => {
    if (
      tooltipRef.current && 
      !tooltipRef.current.contains(event.target as Node) &&
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node)
    ) {
      esconderTooltip();
    }
  }, [esconderTooltip]);

  useEffect(() => {
    if (trigger === 'click' && estaAbierto) {
      document.addEventListener('mousedown', manejarClickAfuera);
      return () => document.removeEventListener('mousedown', manejarClickAfuera);
    }
  }, [trigger, estaAbierto, manejarClickAfuera]);

  // Clonar elemento hijo con event handlers
  const elementoTrigger = React.cloneElement(children, {
    ref: triggerRef,
    ...(trigger === 'hover' && {
      onMouseEnter: mostrarTooltip,
      onMouseLeave: esconderTooltip,
    }),
    ...(trigger === 'click' && {
      onClick: toggleTooltip,
    }),
    ...(trigger === 'focus' && {
      onFocus: mostrarTooltip,
      onBlur: esconderTooltip,
    }),
  });

  // Clases CSS del tooltip
  const clasesTooltip = cn(
    'absolute z-50 px-2 py-1 text-sm rounded-md shadow-lg transition-opacity duration-200 pointer-events-none',
    // Variantes de color
    {
      'bg-gray-900 text-white': variant === 'default' || variant === 'dark',
      'bg-white text-gray-900 border border-gray-200': variant === 'light',
      'bg-green-600 text-white': variant === 'success',
      'bg-yellow-500 text-black': variant === 'warning',
      'bg-red-600 text-white': variant === 'error',
    },
    // Tamaños
    {
      'text-xs px-1.5 py-0.5': tamaño === 'sm',
      'text-sm px-2 py-1': tamaño === 'md',
      'text-base px-3 py-2': tamaño === 'lg',
    },
    classNameContenido
  );

  // Renderizar tooltip
  const renderizarTooltip = () => {
    if (!estaAbierto || !coordenadas) return null;

    return createPortal(
      <div
        ref={tooltipRef}
        className={clasesTooltip}
        style={{
          left: coordenadas.x,
          top: coordenadas.y,
          maxWidth,
        }}
        role="tooltip"
        aria-hidden={!estaAbierto}
      >
        {contenido}
        
        {/* Flecha del tooltip */}
        <div
          className={cn(
            'absolute w-2 h-2 transform rotate-45',
            {
              'bg-gray-900': variant === 'default' || variant === 'dark',
              'bg-white border-l border-t border-gray-200': variant === 'light',
              'bg-green-600': variant === 'success',
              'bg-yellow-500': variant === 'warning',
              'bg-red-600': variant === 'error',
            },
            // Posicionamiento de la flecha
            {
              'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2': coordenadas.posicionFinal === 'top',
              'top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2': coordenadas.posicionFinal === 'bottom',
              'right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2': coordenadas.posicionFinal === 'left',
              'left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2': coordenadas.posicionFinal === 'right',
            }
          )}
        />
      </div>,
      document.body
    );
  };

  return (
    <>
      {elementoTrigger}
      {renderizarTooltip()}
    </>
  );
};

// =======================================================
// COMPONENTE SIMPLIFICADO
// =======================================================

export interface PropiedadesTooltipSimple {
  texto: string;
  children: React.ReactElement;
  posicion?: PosicionTooltip;
  variant?: 'default' | 'dark' | 'light' | 'success' | 'warning' | 'error';
}

export const TooltipSimple: React.FC<PropiedadesTooltipSimple> = ({
  texto,
  children,
  posicion = 'top',
  variant = 'dark',
}) => {
  return (
    <Tooltip
      contenido={texto}
      posicion={posicion}
      variant={variant}
    >
      {children}
    </Tooltip>
  );
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default Tooltip;