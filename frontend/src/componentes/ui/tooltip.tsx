/**
 * Componente Tooltip Compatible con shadcn/ui - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente tooltip con patrón de composición como shadcn/ui
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useRef, 
  useEffect, 
  useCallback 
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
export type TooltipAlign = 'start' | 'center' | 'end';

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  side: TooltipSide;
  align: TooltipAlign;
  sideOffset: number;
  alignOffset: number;
  delayDuration: number;
  skipDelayDuration: number;
}

export interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface TooltipTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

export interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
  side?: TooltipSide;
  sideOffset?: number;
  align?: TooltipAlign;
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionBoundary?: Element | null;
  sticky?: 'partial' | 'always';
  hideWhenDetached?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
}

// =======================================================
// CONTEXTO
// =======================================================

const TooltipContext = createContext<TooltipContextType | null>(null);

const useTooltipContext = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('Tooltip components must be used within TooltipProvider');
  }
  return context;
};

// =======================================================
// UTILIDADES DE POSICIONAMIENTO
// =======================================================

const getTooltipPosition = (
  triggerElement: HTMLElement,
  contentElement: HTMLElement,
  side: TooltipSide,
  align: TooltipAlign,
  sideOffset: number,
  alignOffset: number
) => {
  const triggerRect = triggerElement.getBoundingClientRect();
  const contentRect = contentElement.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  let x = 0;
  let y = 0;

  // Calcular posición base según el side
  switch (side) {
    case 'top':
      x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
      y = triggerRect.top - contentRect.height - sideOffset;
      break;
    case 'bottom':
      x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
      y = triggerRect.bottom + sideOffset;
      break;
    case 'left':
      x = triggerRect.left - contentRect.width - sideOffset;
      y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
      break;
    case 'right':
      x = triggerRect.right + sideOffset;
      y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
      break;
  }

  // Ajustar según alignment
  if (side === 'top' || side === 'bottom') {
    switch (align) {
      case 'start':
        x = triggerRect.left + alignOffset;
        break;
      case 'end':
        x = triggerRect.right - contentRect.width - alignOffset;
        break;
      case 'center':
        // Ya está centrado por defecto
        x += alignOffset;
        break;
    }
  } else {
    switch (align) {
      case 'start':
        y = triggerRect.top + alignOffset;
        break;
      case 'end':
        y = triggerRect.bottom - contentRect.height - alignOffset;
        break;
      case 'center':
        // Ya está centrado por defecto
        y += alignOffset;
        break;
    }
  }

  // Asegurar que no se salga del viewport
  x = Math.max(8, Math.min(x, viewport.width - contentRect.width - 8));
  y = Math.max(8, Math.min(y, viewport.height - contentRect.height - 8));

  return { x, y };
};

// =======================================================
// PROVIDER
// =======================================================

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  delayDuration = 700,
  skipDelayDuration = 300,
}) => {
  return (
    <div data-tooltip-provider="">
      {children}
    </div>
  );
};

// =======================================================
// TOOLTIP ROOT
// =======================================================

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  
  const setOpen = useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  const contextValue: TooltipContextType = {
    open,
    setOpen,
    triggerRef,
    contentRef,
    side: 'top',
    align: 'center',
    sideOffset: 4,
    alignOffset: 0,
    delayDuration: 700,
    skipDelayDuration: 300,
  };

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  );
};

// =======================================================
// TOOLTIP TRIGGER
// =======================================================

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({
  children,
  asChild = false,
}) => {
  const { setOpen, triggerRef } = useTooltipContext();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const id = setTimeout(() => {
      setOpen(true);
    }, 200);
    
    setTimeoutId(id);
  }, [setOpen, timeoutId]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    const id = setTimeout(() => {
      setOpen(false);
    }, 100);
    
    setTimeoutId(id);
  }, [setOpen, timeoutId]);

  const handleFocus = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleBlur = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  if (asChild) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
    });
  }

  return (
    <button
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="inline-flex"
    >
      {children}
    </button>
  );
};

// =======================================================
// TOOLTIP CONTENT
// =======================================================

export const TooltipContent: React.FC<TooltipContentProps> = ({
  children,
  className,
  side = 'top',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  avoidCollisions = true,
  collisionBoundary,
  sticky = 'partial',
  hideWhenDetached = false,
  onEscapeKeyDown,
  onPointerDownOutside,
  ...props
}) => {
  const { open, setOpen, triggerRef, contentRef } = useTooltipContext();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current) return;

    const pos = getTooltipPosition(
      triggerRef.current,
      contentRef.current,
      side,
      align,
      sideOffset,
      alignOffset
    );

    setPosition(pos);
  }, [side, align, sideOffset, alignOffset]);

  useEffect(() => {
    if (open) {
      updatePosition();

      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [open, updatePosition]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        onEscapeKeyDown?.(event);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, setOpen, onEscapeKeyDown]);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        onPointerDownOutside?.(event);
      }
    };

    if (open) {
      document.addEventListener('pointerdown', handleClickOutside);
      return () => document.removeEventListener('pointerdown', handleClickOutside);
    }
  }, [open, setOpen, onPointerDownOutside]);

  if (!open) return null;

  const content = (
    <div
      ref={contentRef}
      className={cn(
        'z-50 overflow-hidden rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        {
          'data-[side=bottom]:slide-in-from-top-2': side === 'bottom',
          'data-[side=left]:slide-in-from-right-2': side === 'left',
          'data-[side=right]:slide-in-from-left-2': side === 'right',
          'data-[side=top]:slide-in-from-bottom-2': side === 'top',
        },
        className
      )}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 50,
      }}
      data-state={open ? 'open' : 'closed'}
      data-side={side}
      role="tooltip"
      {...props}
    >
      {children}
    </div>
  );

  return createPortal(content, document.body);
};

// =======================================================
// EXPORT DEFAULT INDIVIDUAL
// =======================================================

export default {
  Provider: TooltipProvider,
  Root: Tooltip,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
};