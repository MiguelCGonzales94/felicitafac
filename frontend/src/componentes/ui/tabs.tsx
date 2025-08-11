/**
 * Componente Tabs UI - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente de pestañas reutilizable
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PestanaItem {
  value: string;
  titulo: string;
  icono?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  className?: string;
}

export interface PropiedadesTabs {
  valorPorDefecto?: string;
  valor?: string;
  onCambioValor?: (valor: string) => void;
  orientacion?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
  children?: React.ReactNode;
}

export interface PropiedadesTabsList {
  className?: string;
  children?: React.ReactNode;
}

export interface PropiedadesTabsTrigger {
  value: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface PropiedadesTabsContent {
  value: string;
  className?: string;
  children?: React.ReactNode;
}

// =======================================================
// CONTEXTO DE TABS
// =======================================================

interface ContextoTabs {
  valorActivo: string;
  cambiarValor: (valor: string) => void;
  orientacion: 'horizontal' | 'vertical';
  variant: 'default' | 'pills' | 'underline';
}

const TabsContext = createContext<ContextoTabs | null>(null);

const useTabs = () => {
  const contexto = useContext(TabsContext);
  if (!contexto) {
    throw new Error('Los componentes de Tabs deben usarse dentro de un componente Tabs');
  }
  return contexto;
};

// =======================================================
// COMPONENTE PRINCIPAL TABS
// =======================================================

export const Tabs: React.FC<PropiedadesTabs> = ({
  valorPorDefecto,
  valor,
  onCambioValor,
  orientacion = 'horizontal',
  variant = 'default',
  className,
  children,
}) => {
  const [valorInternoActivo, setValorInternoActivo] = useState(valorPorDefecto || '');

  const valorActivo = valor !== undefined ? valor : valorInternoActivo;

  const cambiarValor = (nuevoValor: string) => {
    if (valor === undefined) {
      setValorInternoActivo(nuevoValor);
    }
    onCambioValor?.(nuevoValor);
  };

  const valorContexto: ContextoTabs = {
    valorActivo,
    cambiarValor,
    orientacion,
    variant,
  };

  return (
    <TabsContext.Provider value={valorContexto}>
      <div 
        className={cn(
          'tabs-container',
          {
            'flex space-x-4': orientacion === 'vertical',
            'space-y-4': orientacion === 'horizontal',
          },
          className
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// =======================================================
// COMPONENTE LISTA DE PESTAÑAS
// =======================================================

export const TabsList: React.FC<PropiedadesTabsList> = ({
  className,
  children,
}) => {
  const { orientacion, variant } = useTabs();

  return (
    <div
      className={cn(
        'tabs-list',
        // Orientación
        {
          'flex space-x-1': orientacion === 'horizontal',
          'flex flex-col space-y-1 min-w-[200px]': orientacion === 'vertical',
        },
        // Variantes
        {
          'border-b border-gray-200': variant === 'underline' && orientacion === 'horizontal',
          'border-r border-gray-200': variant === 'underline' && orientacion === 'vertical',
          'bg-gray-100 p-1 rounded-lg': variant === 'pills',
          'bg-gray-50 border rounded-lg p-1': variant === 'default',
        },
        className
      )}
      role="tablist"
      aria-orientation={orientacion}
    >
      {children}
    </div>
  );
};

// =======================================================
// COMPONENTE TRIGGER DE PESTAÑA
// =======================================================

export const TabsTrigger: React.FC<PropiedadesTabsTrigger> = ({
  value,
  className,
  disabled = false,
  children,
}) => {
  const { valorActivo, cambiarValor, orientacion, variant } = useTabs();
  const esActivo = valorActivo === value;

  const manejarClick = () => {
    if (!disabled) {
      cambiarValor(value);
    }
  };

  const manejarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      manejarClick();
    }
  };

  return (
    <button
      role="tab"
      aria-selected={esActivo}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      tabIndex={esActivo ? 0 : -1}
      disabled={disabled}
      onClick={manejarClick}
      onKeyDown={manejarKeyDown}
      className={cn(
        'tabs-trigger transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        // Base styles
        'relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium',
        // Orientación
        {
          'px-3 py-2': orientacion === 'horizontal',
          'px-3 py-2 w-full text-left': orientacion === 'vertical',
        },
        // Estados
        {
          'cursor-not-allowed opacity-50': disabled,
          'cursor-pointer': !disabled,
        },
        // Variantes - Default
        {
          'rounded-md border border-transparent hover:bg-gray-100': variant === 'default',
          'bg-white border-gray-300 shadow-sm text-gray-900': variant === 'default' && esActivo,
          'text-gray-600 hover:text-gray-900': variant === 'default' && !esActivo,
        },
        // Variantes - Pills
        {
          'rounded-md': variant === 'pills',
          'bg-white shadow-sm text-gray-900': variant === 'pills' && esActivo,
          'text-gray-600 hover:text-gray-900 hover:bg-white/50': variant === 'pills' && !esActivo,
        },
        // Variantes - Underline
        {
          'border-b-2 border-transparent': variant === 'underline' && orientacion === 'horizontal',
          'border-r-2 border-transparent': variant === 'underline' && orientacion === 'vertical',
          'border-b-blue-600 text-blue-600': variant === 'underline' && orientacion === 'horizontal' && esActivo,
          'border-r-blue-600 text-blue-600': variant === 'underline' && orientacion === 'vertical' && esActivo,
          'text-gray-600 hover:text-gray-900': variant === 'underline' && !esActivo,
          'hover:border-b-gray-300': variant === 'underline' && orientacion === 'horizontal' && !esActivo,
          'hover:border-r-gray-300': variant === 'underline' && orientacion === 'vertical' && !esActivo,
        },
        className
      )}
    >
      {children}
    </button>
  );
};

// =======================================================
// COMPONENTE CONTENIDO DE PESTAÑA
// =======================================================

export const TabsContent: React.FC<PropiedadesTabsContent> = ({
  value,
  className,
  children,
}) => {
  const { valorActivo } = useTabs();
  const esActivo = valorActivo === value;

  if (!esActivo) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={cn(
        'tabs-content focus:outline-none',
        'animate-in fade-in-50 duration-200',
        className
      )}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

// =======================================================
// COMPONENTE SIMPLIFICADO CON ITEMS
// =======================================================

export interface PropiedadesTabsSimples {
  items: PestanaItem[];
  valorPorDefecto?: string;
  valor?: string;
  onCambioValor?: (valor: string) => void;
  orientacion?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
  renderizarContenido: (item: PestanaItem) => React.ReactNode;
}

export const TabsSimples: React.FC<PropiedadesTabsSimples> = ({
  items,
  valorPorDefecto,
  valor,
  onCambioValor,
  orientacion = 'horizontal',
  variant = 'default',
  className,
  renderizarContenido,
}) => {
  const valorActivo = valor || valorPorDefecto || items[0]?.value || '';

  return (
    <Tabs
      valorPorDefecto={valorPorDefecto}
      valor={valor}
      onCambioValor={onCambioValor}
      orientacion={orientacion}
      variant={variant}
      className={className}
    >
      <TabsList>
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={item.className}
          >
            <div className="flex items-center space-x-2">
              {item.icono && (
                <span className="flex-shrink-0">{item.icono}</span>
              )}
              <span>{item.titulo}</span>
              {item.badge && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((item) => (
        <TabsContent key={item.value} value={item.value}>
          {renderizarContenido(item)}
        </TabsContent>
      ))}
    </Tabs>
  );
};

// =======================================================
// HOOK PERSONALIZADO PARA MANEJO DE ESTADO
// =======================================================

export const useTabsControl = (valorInicial?: string) => {
  const [valorActivo, setValorActivo] = useState(valorInicial || '');

  const cambiarTab = (nuevoValor: string) => {
    setValorActivo(nuevoValor);
  };

  const esTabActivo = (valor: string) => valorActivo === valor;

  return {
    valorActivo,
    cambiarTab,
    esTabActivo,
  };
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsSimples,
  useTabsControl,
};