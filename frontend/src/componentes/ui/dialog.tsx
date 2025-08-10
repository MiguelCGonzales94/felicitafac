/**
 * Componente Dialog/Modal - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente modal/dialog accesible y personalizable
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

export interface PropiedadesDialog {
  // Control de visibilidad
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  
  // Contenido
  children: React.ReactNode;
  
  // Configuración
  modal?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  preventScroll?: boolean;
  
  // Clases CSS
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

export interface PropiedadesDialogContent {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  position?: 'center' | 'top' | 'bottom';
  showCloseButton?: boolean;
  onClose?: () => void;
}

export interface PropiedadesDialogHeader {
  children: React.ReactNode;
  className?: string;
  showDivider?: boolean;
}

export interface PropiedadesDialogTitle {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface PropiedadesDialogDescription {
  children: React.ReactNode;
  className?: string;
}

export interface PropiedadesDialogFooter {
  children: React.ReactNode;
  className?: string;
  showDivider?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export interface PropiedadesDialogTrigger {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
  disabled?: boolean;
}

// =======================================================
// CONTEXT PARA COMPARTIR ESTADO
// =======================================================

interface ContextoDialog {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<ContextoDialog | null>(null);

const useDialogContext = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Componentes Dialog deben usarse dentro de un Dialog');
  }
  return context;
};

// =======================================================
// ESTILOS Y VARIANTES
// =======================================================

const dialogVariants = {
  size: {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full mx-4',
  },
  position: {
    center: 'items-center',
    top: 'items-start pt-16',
    bottom: 'items-end pb-16',
  },
};

// =======================================================
// COMPONENTE DIALOG RAÍZ
// =======================================================

export const Dialog: React.FC<PropiedadesDialog> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  modal = true,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  preventScroll = true,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isControlled, onOpenChange]);
  
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (!preventScroll) return;
    
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open, preventScroll]);
  
  // Manejar tecla Escape
  useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        handleOpenChange(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, handleOpenChange]);
  
  const contextValue: ContextoDialog = {
    open,
    onOpenChange: handleOpenChange,
  };
  
  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
};

// =======================================================
// COMPONENTE DIALOG TRIGGER
// =======================================================

export const DialogTrigger: React.FC<PropiedadesDialogTrigger> = ({
  children,
  asChild = false,
  className,
  disabled = false,
}) => {
  const { onOpenChange } = useDialogContext();
  
  const handleClick = () => {
    if (!disabled) {
      onOpenChange(true);
    }
  };
  
  if (asChild) {
    return React.cloneElement(
      React.Children.only(children) as React.ReactElement,
      {
        onClick: handleClick,
        disabled,
      }
    );
  }
  
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'h-10 px-4 py-2',
        className
      )}
    >
      {children}
    </button>
  );
};

// =======================================================
// COMPONENTE DIALOG CONTENT
// =======================================================

export const DialogContent = React.forwardRef<HTMLDivElement, PropiedadesDialogContent>(
  (
    {
      children,
      className,
      size = 'md',
      position = 'center',
      showCloseButton = true,
      onClose,
    },
    ref
  ) => {
    const { open, onOpenChange } = useDialogContext();
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Combinar refs
    const combinedRef = useCallback((node: HTMLDivElement) => {
      contentRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);
    
    const handleClose = () => {
      onOpenChange(false);
      onClose?.();
    };
    
    const handleOverlayClick = (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        handleClose();
      }
    };
    
    // Focus management
    useEffect(() => {
      if (open && contentRef.current) {
        const firstFocusable = contentRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        
        firstFocusable?.focus();
      }
    }, [open]);
    
    if (!open) return null;
    
    const portalContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={handleOverlayClick}
      >
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
        
        {/* Content */}
        <div
          ref={combinedRef}
          className={cn(
            'relative z-50 w-full bg-background rounded-lg border shadow-lg',
            'animate-in fade-in-0 zoom-in-95',
            'focus:outline-none',
            dialogVariants.size[size],
            dialogVariants.position[position],
            className
          )}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          {/* Close button */}
          {showCloseButton && (
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background',
                'transition-opacity hover:opacity-100 focus:outline-none focus:ring-2',
                'focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
                'z-10'
              )}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </button>
          )}
          
          {children}
        </div>
      </div>
    );
    
    // Renderizar en portal
    return createPortal(portalContent, document.body);
  }
);

DialogContent.displayName = 'DialogContent';

// =======================================================
// COMPONENTE DIALOG HEADER
// =======================================================

export const DialogHeader: React.FC<PropiedadesDialogHeader> = ({
  children,
  className,
  showDivider = true,
}) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left p-6',
      showDivider && 'border-b border-border',
      className
    )}
  >
    {children}
  </div>
);

// =======================================================
// COMPONENTE DIALOG TITLE
// =======================================================

export const DialogTitle: React.FC<PropiedadesDialogTitle> = ({
  children,
  className,
  level = 2,
}) => {
  const Component = `h${level}` as const;
  
  return (
    <Component
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
    >
      {children}
    </Component>
  );
};

// =======================================================
// COMPONENTE DIALOG DESCRIPTION
// =======================================================

export const DialogDescription: React.FC<PropiedadesDialogDescription> = ({
  children,
  className,
}) => (
  <p className={cn('text-sm text-muted-foreground', className)}>
    {children}
  </p>
);

// =======================================================
// COMPONENTE DIALOG BODY
// =======================================================

export const DialogBody: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('p-6 pt-0', className)}>
    {children}
  </div>
);

// =======================================================
// COMPONENTE DIALOG FOOTER
// =======================================================

export const DialogFooter: React.FC<PropiedadesDialogFooter> = ({
  children,
  className,
  showDivider = true,
  justify = 'end',
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };
  
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:space-x-2 p-6 pt-0',
        showDivider && 'border-t border-border',
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
};

// =======================================================
// COMPONENTES ESPECIALIZADOS
// =======================================================

/**
 * Dialog de confirmación
 */
export interface PropiedadesDialogConfirmacion {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const DialogConfirmacion: React.FC<PropiedadesDialogConfirmacion> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange?.(false);
  };
  
  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };
  
  const iconMap = {
    default: <Info className="h-6 w-6 text-blue-600" />,
    destructive: <AlertTriangle className="h-6 w-6 text-red-600" />,
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {iconMap[variant]}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <DialogFooter>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className={cn(
              'inline-flex items-center justify-center rounded-md text-sm font-medium',
              'transition-colors focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
              'h-10 px-4 py-2'
            )}
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              'inline-flex items-center justify-center rounded-md text-sm font-medium',
              'transition-colors focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              'h-10 px-4 py-2',
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            )}
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Dialog de alerta
 */
export interface PropiedadesDialogAlerta {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
}

export const DialogAlerta: React.FC<PropiedadesDialogAlerta> = ({
  open,
  onOpenChange,
  title,
  description,
  variant = 'info',
  buttonText = 'Entendido',
}) => {
  const iconMap = {
    info: <Info className="h-6 w-6 text-blue-600" />,
    success: <CheckCircle className="h-6 w-6 text-green-600" />,
    warning: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
    error: <XCircle className="h-6 w-6 text-red-600" />,
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {iconMap[variant]}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            className={cn(
              'inline-flex items-center justify-center rounded-md text-sm font-medium',
              'transition-colors focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'h-10 px-4 py-2 w-full'
            )}
          >
            {buttonText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// =======================================================
// HOOKS UTILITARIOS
// =======================================================

/**
 * Hook para manejar estado de dialog
 */
export const useDialog = (defaultOpen = false) => {
  const [open, setOpen] = useState(defaultOpen);
  
  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);
  const toggleDialog = useCallback(() => setOpen(prev => !prev), []);
  
  return {
    open,
    setOpen,
    openDialog,
    closeDialog,
    toggleDialog,
  };
};

/**
 * Hook para dialog de confirmación
 */
export const useDialogConfirmacion = () => {
  const [config, setConfig] = useState<PropiedadesDialogConfirmacion | null>(null);
  
  const showConfirmacion = useCallback((configuracion: Omit<PropiedadesDialogConfirmacion, 'open' | 'onOpenChange'>) => {
    setConfig({
      ...configuracion,
      open: true,
      onOpenChange: (open) => {
        if (!open) setConfig(null);
      },
    });
  }, []);
  
  const hideConfirmacion = useCallback(() => {
    setConfig(null);
  }, []);
  
  return {
    config,
    showConfirmacion,
    hideConfirmacion,
    DialogConfirmacion: config ? <DialogConfirmacion {...config} /> : null,
  };
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default Dialog;