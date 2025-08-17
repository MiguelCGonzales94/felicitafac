/**
 * ================================================================
 * COMPONENTE POPOVER - FELICITAFAC
 * ================================================================
 * Sistema de Facturación Electrónica para Perú
 * Componente Popover funcional sin dependencias externas
 */

/**
 * frontend/src/componentes/ui/popover.tsx
 * Componente Popover para menús desplegables y contenido flotante
 */
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

// =======================================================
// CONTEXTO Y HOOK
// =======================================================

interface PopoverContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLElement>;
}

const PopoverContext = createContext<PopoverContextType | null>(null);

const usePopover = () => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopover debe usarse dentro de un Popover');
  }
  return context;
};

// =======================================================
// UTILIDAD CN SIMPLE
// =======================================================

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// =======================================================
// COMPONENTE PRINCIPAL POPOVER
// =======================================================

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  modal?: boolean;
}

export const Popover: React.FC<PopoverProps> = ({
  open: openProp,
  onOpenChange,
  children,
  modal = false
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  
  const open = openProp !== undefined ? openProp : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (
        contentRef.current &&
        triggerRef.current &&
        !contentRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        handleOpenChange(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, handleOpenChange]);

  return (
    <PopoverContext.Provider 
      value={{ 
        open, 
        onOpenChange: handleOpenChange, 
        triggerRef, 
        contentRef 
      }}
    >
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

// =======================================================
// POPOVER TRIGGER
// =======================================================

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  PopoverTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ asChild, children, className, onClick, ...props }, ref) => {
  const { open, onOpenChange, triggerRef } = usePopover();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onOpenChange(!open);
    if (onClick) {
      onClick(event);
    }
  };

  // Combinar refs
  const combinedRef = (node: HTMLButtonElement) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
    triggerRef.current = node;
  };

  // Si asChild es true y children es un elemento válido, clonarlo
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref: combinedRef,
      onClick: handleClick,
      'aria-expanded': open,
      'aria-haspopup': 'dialog',
      'data-state': open ? 'open' : 'closed'
    });
  }

  // Renderizar como botón normal
  return (
    <button
      ref={combinedRef}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        'hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup="dialog"
      data-state={open ? 'open' : 'closed'}
      {...props}
    >
      {children}
    </button>
  );
});

PopoverTrigger.displayName = 'PopoverTrigger';

// =======================================================
// POPOVER CONTENT
// =======================================================

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  alignOffset?: number;
}

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverContentProps & React.HTMLAttributes<HTMLDivElement>
>(({ 
  children, 
  className, 
  align = 'center', 
  side = 'bottom', 
  sideOffset = 4,
  alignOffset = 0,
  ...props 
}, ref) => {
  const { open, contentRef } = usePopover();
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Combinar refs
  const combinedRef = (node: HTMLDivElement) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
    contentRef.current = node;
  };

  // Calcular posición
  useEffect(() => {
    if (!open || !contentRef.current) return;

    const updatePosition = () => {
      const triggerElement = contentRef.current?.parentElement?.querySelector('[aria-expanded="true"]') as HTMLElement;
      if (!triggerElement || !contentRef.current) return;

      const triggerRect = triggerElement.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;

      // Calcular posición vertical
      switch (side) {
        case 'top':
          top = triggerRect.top - contentRect.height - sideOffset;
          break;
        case 'bottom':
          top = triggerRect.bottom + sideOffset;
          break;
        case 'left':
          top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          break;
        case 'right':
          top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          break;
      }

      // Calcular posición horizontal
      switch (side) {
        case 'top':
        case 'bottom':
          switch (align) {
            case 'start':
              left = triggerRect.left + alignOffset;
              break;
            case 'center':
              left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2 + alignOffset;
              break;
            case 'end':
              left = triggerRect.right - contentRect.width - alignOffset;
              break;
          }
          break;
        case 'left':
          left = triggerRect.left - contentRect.width - sideOffset;
          break;
        case 'right':
          left = triggerRect.right + sideOffset;
          break;
      }

      // Ajustar si se sale de la pantalla
      if (left < 8) left = 8;
      if (left + contentRect.width > viewportWidth - 8) {
        left = viewportWidth - contentRect.width - 8;
      }
      if (top < 8) top = 8;
      if (top + contentRect.height > viewportHeight - 8) {
        top = viewportHeight - contentRect.height - 8;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [open, side, align, sideOffset, alignOffset]);

  if (!open) {
    return null;
  }

  return (
    <>
      {/* Portal simulado usando position fixed */}
      <div
        ref={combinedRef}
        className={cn(
          'fixed z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          side === 'bottom' && 'data-[side=bottom]:slide-in-from-top-2',
          side === 'left' && 'data-[side=left]:slide-in-from-right-2',
          side === 'right' && 'data-[side=right]:slide-in-from-left-2',
          side === 'top' && 'data-[side=top]:slide-in-from-bottom-2',
          'bg-white border-gray-200 shadow-lg',
          className
        )}
        style={{
          top: position.top,
          left: position.left,
        }}
        data-state={open ? 'open' : 'closed'}
        data-side={side}
        data-align={align}
        {...props}
      >
        {children}
      </div>
    </>
  );
});

PopoverContent.displayName = 'PopoverContent';

// =======================================================
// EXPORTS
// =======================================================

export default Popover;

// También exportar individualmente para mayor claridad
export { 
  Popover as PopoverRoot,
  usePopover
};
