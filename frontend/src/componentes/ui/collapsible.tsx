/**
 * ================================================================
 * COMPONENTES FALTANTES PARA ERRORBOUNDARY - FELICITAFAC
 * ================================================================
 */

// ================================================================
// 1. COMPONENTE COLLAPSIBLE
// ================================================================

/**
 * frontend/src/componentes/ui/collapsible.tsx
 * Componente Collapsible usando shadcn/ui pattern
 */
import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../utils/cn';

// Contexto para el estado del collapsible
interface CollapsibleContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = createContext<CollapsibleContextType | null>(null);

// Hook para usar el contexto
const useCollapsible = () => {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error('useCollapsible debe usarse dentro de un Collapsible');
  }
  return context;
};

// Componente principal Collapsible
interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  open: openProp,
  onOpenChange,
  children,
  className
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = openProp !== undefined ? openProp : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div className={cn('space-y-2', className)}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
};

// Trigger del collapsible
interface CollapsibleTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(({ asChild, children, className, ...props }, ref) => {
  const { open, onOpenChange } = useCollapsible();

  const handleClick = () => {
    onOpenChange(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      onClick: handleClick,
      'aria-expanded': open,
      'data-state': open ? 'open' : 'closed'
    });
  }

  return (
    <button
      ref={ref}
      className={cn(
        'flex w-full items-center justify-between py-2 font-medium transition-all hover:underline',
        className
      )}
      onClick={handleClick}
      aria-expanded={open}
      data-state={open ? 'open' : 'closed'}
      {...props}
    >
      {children}
    </button>
  );
});

CollapsibleTrigger.displayName = 'CollapsibleTrigger';

// Contenido del collapsible
interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(({ children, className, ...props }, ref) => {
  const { open } = useCollapsible();

  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden transition-all duration-200 ease-in-out',
        open ? 'animate-in slide-in-from-top-1' : 'animate-out slide-out-to-top-1',
        !open && 'hidden',
        className
      )}
      data-state={open ? 'open' : 'closed'}
      {...props}
    >
      <div className="pb-2 pt-0">
        {children}
      </div>
    </div>
  );
});

CollapsibleContent.displayName = 'CollapsibleContent';
