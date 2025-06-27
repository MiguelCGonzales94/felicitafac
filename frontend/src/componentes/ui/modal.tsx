/**
 * Modal Component - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente de modal/dialog con overlay y animaciones
 */

import React from 'react';
import { cn } from '../../utils/cn.ts';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesModal {
  abierto: boolean;
  onCerrar: () => void;
  children: React.ReactNode;
  tamaño?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centrado?: boolean;
  cerrarAlClickFuera?: boolean;
  cerrarConEscape?: boolean;
  mostrarOverlay?: boolean;
  className?: string;
  overlayClassName?: string;
}

export interface PropiedadesModalHeader {
  children: React.ReactNode;
  className?: string;
  onCerrar?: () => void;
  mostrarBtnCerrar?: boolean;
}

export interface PropiedadesModalBody {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export interface PropiedadesModalFooter {
  children: React.ReactNode;
  className?: string;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export interface PropiedadesModalTitle {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

// =======================================================
// VARIANTES DE TAMAÑO
// =======================================================

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-none m-4',
};

// =======================================================
// COMPONENTE PRINCIPAL - MODAL
// =======================================================

const Modal: React.FC<PropiedadesModal> = ({
  abierto,
  onCerrar,
  children,
  tamaño = 'md',
  centrado = true,
  cerrarAlClickFuera = true,
  cerrarConEscape = true,
  mostrarOverlay = true,
  className,
  overlayClassName,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Manejar cerrar con Escape
  React.useEffect(() => {
    if (!cerrarConEscape || !abierto) return;

    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCerrar();
      }
    };

    document.addEventListener('keydown', manejarEscape);
    return () => document.removeEventListener('keydown', manejarEscape);
  }, [abierto, cerrarConEscape, onCerrar]);

  // Manejar focus trap
  React.useEffect(() => {
    if (!abierto) return;

    const elementosEnfocables = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (elementosEnfocables && elementosEnfocables.length > 0) {
      const primerElemento = elementosEnfocables[0] as HTMLElement;
      const ultimoElemento = elementosEnfocables[elementosEnfocables.length - 1] as HTMLElement;

      const manejarTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === primerElemento) {
              e.preventDefault();
              ultimoElemento.focus();
            }
          } else {
            if (document.activeElement === ultimoElemento) {
              e.preventDefault();
              primerElemento.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', manejarTab);
      primerElemento.focus();

      return () => document.removeEventListener('keydown', manejarTab);
    }
  }, [abierto]);

  // Prevenir scroll del body cuando el modal está abierto
  React.useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [abierto]);

  // Manejar click en overlay
  const manejarClickOverlay = (e: React.MouseEvent) => {
    if (cerrarAlClickFuera && e.target === e.currentTarget) {
      onCerrar();
    }
  };

  if (!abierto) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex',
        centrado ? 'items-center justify-center' : 'items-start justify-center pt-16',
        'p-4'
      )}
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      {mostrarOverlay && (
        <div
          className={cn(
            'absolute inset-0 bg-black/50 transition-opacity duration-200',
            overlayClassName
          )}
          onClick={manejarClickOverlay}
        />
      )}

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full',
          modalSizes[tamaño],
          'bg-white rounded-lg shadow-xl',
          'transform transition-all duration-200',
          'animate-in fade-in-0 zoom-in-95',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// =======================================================
// COMPONENTE MODAL HEADER
// =======================================================

const ModalHeader: React.FC<PropiedadesModalHeader> = ({
  children,
  className,
  onCerrar,
  mostrarBtnCerrar = true,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-6 border-b border-gray-200',
        className
      )}
    >
      <div className="flex-1">{children}</div>
      
      {mostrarBtnCerrar && onCerrar && (
        <button
          onClick={onCerrar}
          className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar modal"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE MODAL TITLE
// =======================================================

const ModalTitle: React.FC<PropiedadesModalTitle> = ({
  children,
  className,
  level = 2,
}) => {
  const Component = `h${level}` as const;
  
  const clases = cn(
    'font-semibold leading-6',
    {
      1: 'text-2xl',
      2: 'text-xl',
      3: 'text-lg',
      4: 'text-base',
      5: 'text-sm',
      6: 'text-xs',
    }[level],
    className
  );

  return (
    <Component className={clases}>
      {children}
    </Component>
  );
};

// =======================================================
// COMPONENTE MODAL BODY
// =======================================================

const ModalBody: React.FC<PropiedadesModalBody> = ({
  children,
  className,
  noPadding = false,
}) => {
  return (
    <div
      className={cn(
        !noPadding && 'p-6',
        'overflow-y-auto max-h-[70vh]',
        className
      )}
    >
      {children}
    </div>
  );
};

// =======================================================
// COMPONENTE MODAL FOOTER
// =======================================================

const ModalFooter: React.FC<PropiedadesModalFooter> = ({
  children,
  className,
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
        'flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50',
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
};

// =======================================================
// HOOK PERSONALIZADO PARA MODAL
// =======================================================

export const useModal = (inicialAbierto = false) => {
  const [abierto, setAbierto] = React.useState(inicialAbierto);

  const abrir = React.useCallback(() => setAbierto(true), []);
  const cerrar = React.useCallback(() => setAbierto(false), []);
  const alternar = React.useCallback(() => setAbierto(prev => !prev), []);

  return {
    abierto,
    abrir,
    cerrar,
    alternar,
  };
};

// =======================================================
// COMPONENTES ESPECIALIZADOS PARA POS
// =======================================================

/**
 * Modal de confirmación
 */
export interface PropiedadesModalConfirmacion {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'default' | 'danger' | 'warning';
  cargando?: boolean;
}

export const ModalConfirmacion: React.FC<PropiedadesModalConfirmacion> = ({
  abierto,
  onCerrar,
  onConfirmar,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  tipo = 'default',
  cargando = false,
}) => {
  const iconos = {
    default: (
      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    danger: (
      <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
    ),
    warning: (
      <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
    ),
  };

  const coloresBoton = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} tamaño="sm">
      <ModalBody>
        <div className="flex items-start space-x-4">
          {iconos[tipo]}
          <div className="flex-1">
            <ModalTitle level={3} className="text-gray-900 mb-2">
              {titulo}
            </ModalTitle>
            <p className="text-sm text-gray-600">
              {mensaje}
            </p>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <button
          onClick={onCerrar}
          disabled={cargando}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          {textoCancelar}
        </button>
        <button
          onClick={onConfirmar}
          disabled={cargando}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 flex items-center gap-2',
            coloresBoton[tipo]
          )}
        >
          {cargando && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {textoConfirmar}
        </button>
      </ModalFooter>
    </Modal>
  );
};

/**
 * Modal de selector de cliente
 */
export interface PropiedadesModalSelectorCliente {
  abierto: boolean;
  onCerrar: () => void;
  onSeleccionar: (cliente: any) => void;
}

export const ModalSelectorCliente: React.FC<PropiedadesModalSelectorCliente> = ({
  abierto,
  onCerrar,
  onSeleccionar,
}) => {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} tamaño="lg">
      <ModalHeader onCerrar={onCerrar}>
        <ModalTitle>Seleccionar Cliente</ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        {/* Aquí iría el contenido del selector de clientes */}
        <div className="text-center py-8 text-gray-500">
          Componente de selección de clientes
        </div>
      </ModalBody>
    </Modal>
  );
};

/**
 * Modal para agregar producto rápido
 */
export interface PropiedadesModalProductoRapido {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (producto: any) => void;
}

export const ModalProductoRapido: React.FC<PropiedadesModalProductoRapido> = ({
  abierto,
  onCerrar,
  onGuardar,
}) => {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} tamaño="md">
      <ModalHeader onCerrar={onCerrar}>
        <ModalTitle>Agregar Producto Rápido</ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        {/* Aquí iría el formulario de producto rápido */}
        <div className="text-center py-8 text-gray-500">
          Formulario de producto rápido
        </div>
      </ModalBody>
      
      <ModalFooter>
        <button
          onClick={onCerrar}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={() => onGuardar({})}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Guardar Producto
        </button>
      </ModalFooter>
    </Modal>
  );
};

// =======================================================
// EXPORTACIONES
// =======================================================

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
};

export default Modal;