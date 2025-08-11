/**
 * Componente Dropdown UI - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Dropdown/menú desplegable reutilizable
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface OpcionDropdown {
  value: string | number;
  label: string;
  descripcion?: string;
  icono?: React.ReactNode;
  disabled?: boolean;
  divider?: boolean;
  className?: string;
}

export interface GrupoOpciones {
  titulo: string;
  opciones: OpcionDropdown[];
}

export type PosicionDropdown = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'auto';

export interface PropiedadesDropdown {
  // Datos
  opciones?: OpcionDropdown[];
  grupos?: GrupoOpciones[];
  
  // Selección
  valor?: string | number | (string | number)[];
  onSeleccionar: (valor: string | number | (string | number)[]) => void;
  multiple?: boolean;
  placeholder?: string;
  
  // Apariencia
  variant?: 'default' | 'outline' | 'ghost';
  tamaño?: 'sm' | 'md' | 'lg';
  ancho?: string | 'full' | 'auto';
  
  // Comportamiento
  busqueda?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  
  // Posicionamiento
  posicion?: PosicionDropdown;
  maxHeight?: string;
  
  // Personalización
  className?: string;
  classNameTrigger?: string;
  classNameContent?: string;
  renderTrigger?: (props: RenderTriggerProps) => React.ReactNode;
  renderOpcion?: (opcion: OpcionDropdown, seleccionada: boolean) => React.ReactNode;
  
  // Eventos
  onAbrir?: () => void;
  onCerrar?: () => void;
  onBuscar?: (termino: string) => void;
}

export interface RenderTriggerProps {
  valor: string | number | (string | number)[];
  placeholder: string;
  abierto: boolean;
  disabled: boolean;
  loading: boolean;
  limpiar: () => void;
  clearable: boolean;
}

export interface CoordendasDropdown {
  x: number;
  y: number;
  maxHeight: number;
  posicionFinal: PosicionDropdown;
}

// =======================================================
// HOOKS AUXILIARES
// =======================================================

const usePositionCalculator = () => {
  const calcularPosicion = useCallback((
    trigger: HTMLElement,
    content: HTMLElement,
    posicionDeseada: PosicionDropdown,
    maxHeightConfig: string
  ): CoordendasDropdown => {
    const triggerRect = trigger.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const maxHeightNum = parseInt(maxHeightConfig) || 200;
    
    const posiciones = {
      'bottom-start': () => ({
        x: triggerRect.left,
        y: triggerRect.bottom + 4,
        espacioDisponible: viewportHeight - triggerRect.bottom - 4,
      }),
      'bottom-end': () => ({
        x: triggerRect.right - contentRect.width,
        y: triggerRect.bottom + 4,
        espacioDisponible: viewportHeight - triggerRect.bottom - 4,
      }),
      'top-start': () => ({
        x: triggerRect.left,
        y: triggerRect.top - contentRect.height - 4,
        espacioDisponible: triggerRect.top - 4,
      }),
      'top-end': () => ({
        x: triggerRect.right - contentRect.width,
        y: triggerRect.top - contentRect.height - 4,
        espacioDisponible: triggerRect.top - 4,
      }),
    };

    let posicionFinal = posicionDeseada;
    let coordenadas;

    if (posicionDeseada === 'auto') {
      // Determinar automáticamente la mejor posición
      const espacioAbajo = viewportHeight - triggerRect.bottom;
      const espacioArriba = triggerRect.top;
      
      if (espacioAbajo >= maxHeightNum || espacioAbajo >= espacioArriba) {
        posicionFinal = 'bottom-start';
      } else {
        posicionFinal = 'top-start';
      }
    }

    coordenadas = posiciones[posicionFinal]();

    // Ajustar si se sale horizontalmente
    if (coordenadas.x < 0) {
      coordenadas.x = 4;
    } else if (coordenadas.x + contentRect.width > viewportWidth) {
      coordenadas.x = viewportWidth - contentRect.width - 4;
    }

    // Calcular altura máxima real
    const alturaMaxima = Math.min(maxHeightNum, coordenadas.espacioDisponible - 8);

    return {
      x: coordenadas.x,
      y: coordenadas.y,
      maxHeight: alturaMaxima,
      posicionFinal,
    };
  }, []);

  return { calcularPosicion };
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const Dropdown: React.FC<PropiedadesDropdown> = ({
  opciones = [],
  grupos = [],
  valor,
  onSeleccionar,
  multiple = false,
  placeholder = 'Seleccionar...',
  variant = 'default',
  tamaño = 'md',
  ancho = 'auto',
  busqueda = false,
  clearable = false,
  disabled = false,
  loading = false,
  posicion = 'auto',
  maxHeight = '200px',
  className,
  classNameTrigger,
  classNameContent,
  renderTrigger,
  renderOpcion,
  onAbrir,
  onCerrar,
  onBuscar,
}) => {
  // Estado
  const [abierto, setAbierto] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [coordenadas, setCoordenadas] = useState<CoordendasDropdown | null>(null);
  
  // Referencias
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const busquedaRef = useRef<HTMLInputElement>(null);
  
  // Hooks
  const { calcularPosicion } = usePositionCalculator();

  // Obtener opciones (planas o agrupadas)
  const opcionesPlanas = useMemo(() => {
    if (grupos.length > 0) {
      return grupos.flatMap(grupo => grupo.opciones);
    }
    return opciones;
  }, [opciones, grupos]);

  // Filtrar opciones por búsqueda
  const opcionesFiltradas = useMemo(() => {
    if (!terminoBusqueda) return opcionesPlanas;
    
    const termino = terminoBusqueda.toLowerCase();
    return opcionesPlanas.filter(opcion =>
      opcion.label.toLowerCase().includes(termino) ||
      opcion.descripcion?.toLowerCase().includes(termino)
    );
  }, [opcionesPlanas, terminoBusqueda]);

  // Verificar si una opción está seleccionada
  const estaSeleccionada = useCallback((opcionValue: string | number) => {
    if (multiple && Array.isArray(valor)) {
      return valor.includes(opcionValue);
    }
    return valor === opcionValue;
  }, [valor, multiple]);

  // Obtener texto del trigger
  const obtenerTextoTrigger = useCallback(() => {
    if (multiple && Array.isArray(valor)) {
      if (valor.length === 0) return placeholder;
      if (valor.length === 1) {
        const opcion = opcionesPlanas.find(op => op.value === valor[0]);
        return opcion?.label || placeholder;
      }
      return `${valor.length} seleccionados`;
    }
    
    const opcion = opcionesPlanas.find(op => op.value === valor);
    return opcion?.label || placeholder;
  }, [valor, multiple, placeholder, opcionesPlanas]);

  // Abrir/cerrar dropdown
  const abrirDropdown = useCallback(() => {
    if (disabled) return;
    setAbierto(true);
    onAbrir?.();
  }, [disabled, onAbrir]);

  const cerrarDropdown = useCallback(() => {
    setAbierto(false);
    setTerminoBusqueda('');
    onCerrar?.();
  }, [onCerrar]);

  const toggleDropdown = useCallback(() => {
    if (abierto) {
      cerrarDropdown();
    } else {
      abrirDropdown();
    }
  }, [abierto, abrirDropdown, cerrarDropdown]);

  // Manejar selección
  const manejarSeleccion = useCallback((opcionValue: string | number) => {
    if (multiple) {
      const valoresActuales = Array.isArray(valor) ? valor : [];
      let nuevosValores;
      
      if (valoresActuales.includes(opcionValue)) {
        nuevosValores = valoresActuales.filter(v => v !== opcionValue);
      } else {
        nuevosValores = [...valoresActuales, opcionValue];
      }
      
      onSeleccionar(nuevosValores);
    } else {
      onSeleccionar(opcionValue);
      cerrarDropdown();
    }
  }, [multiple, valor, onSeleccionar, cerrarDropdown]);

  // Limpiar selección
  const limpiarSeleccion = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSeleccionar(multiple ? [] : '');
  }, [multiple, onSeleccionar]);

  // Manejar búsqueda
  const manejarBusqueda = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setTerminoBusqueda(valor);
    onBuscar?.(valor);
  }, [onBuscar]);

  // Actualizar posición
  const actualizarPosicion = useCallback(() => {
    if (!triggerRef.current || !contentRef.current || !abierto) return;

    const nuevasCoordenadas = calcularPosicion(
      triggerRef.current,
      contentRef.current,
      posicion,
      maxHeight
    );
    
    setCoordenadas(nuevasCoordenadas);
  }, [calcularPosicion, posicion, maxHeight, abierto]);

  // Efectos
  useEffect(() => {
    if (abierto) {
      actualizarPosicion();
      
      if (busqueda && busquedaRef.current) {
        setTimeout(() => busquedaRef.current?.focus(), 100);
      }
      
      const manejarScroll = () => actualizarPosicion();
      const manejarResize = () => actualizarPosicion();
      
      window.addEventListener('scroll', manejarScroll, true);
      window.addEventListener('resize', manejarResize);
      
      return () => {
        window.removeEventListener('scroll', manejarScroll, true);
        window.removeEventListener('resize', manejarResize);
      };
    }
  }, [abierto, actualizarPosicion, busqueda]);

  // Click fuera para cerrar
  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        cerrarDropdown();
      }
    };

    if (abierto) {
      document.addEventListener('mousedown', manejarClickFuera);
      return () => document.removeEventListener('mousedown', manejarClickFuera);
    }
  }, [abierto, cerrarDropdown]);

  // Clases CSS
  const clasesTrigger = cn(
    'relative inline-flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
    // Variantes
    {
      'border border-gray-300 bg-white hover:bg-gray-50': variant === 'default',
      'border border-gray-300 bg-transparent hover:bg-gray-50': variant === 'outline',
      'border-0 bg-transparent hover:bg-gray-100': variant === 'ghost',
    },
    // Tamaños
    {
      'px-2 py-1 text-sm h-8': tamaño === 'sm',
      'px-3 py-2 text-sm h-10': tamaño === 'md',
      'px-4 py-3 text-base h-12': tamaño === 'lg',
    },
    // Ancho
    {
      'w-full': ancho === 'full',
      'w-auto': ancho === 'auto',
    },
    // Estados
    {
      'opacity-50 cursor-not-allowed': disabled,
      'cursor-pointer': !disabled,
      'ring-2 ring-blue-500': abierto,
    },
    'rounded-md',
    classNameTrigger
  );

  const clasesContent = cn(
    'absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 overflow-auto',
    'animate-in fade-in-0 zoom-in-95 duration-100',
    classNameContent
  );

  // Render del trigger
  const renderizarTrigger = () => {
    if (renderTrigger) {
      return renderTrigger({
        valor: valor || (multiple ? [] : ''),
        placeholder,
        abierto,
        disabled,
        loading,
        limpiar: limpiarSeleccion,
        clearable,
      });
    }

    return (
      <button
        ref={triggerRef}
        className={clasesTrigger}
        onClick={toggleDropdown}
        disabled={disabled}
        style={{ width: ancho !== 'full' && ancho !== 'auto' ? ancho : undefined }}
      >
        <span className="truncate">
          {loading ? 'Cargando...' : obtenerTextoTrigger()}
        </span>
        
        <div className="flex items-center space-x-1 ml-2">
          {clearable && valor && !disabled && (
            <button
              onClick={limpiarSeleccion}
              className="hover:bg-gray-200 rounded p-0.5"
            >
              ×
            </button>
          )}
          <ChevronDown 
            className={cn(
              'h-4 w-4 transition-transform',
              { 'transform rotate-180': abierto }
            )} 
          />
        </div>
      </button>
    );
  };

  // Render de opciones
  const renderizarOpciones = () => {
    if (grupos.length > 0) {
      return grupos.map((grupo, indiceGrupo) => (
        <div key={indiceGrupo}>
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {grupo.titulo}
          </div>
          {grupo.opciones
            .filter(opcion => !terminoBusqueda || 
              opcion.label.toLowerCase().includes(terminoBusqueda.toLowerCase()))
            .map((opcion) => renderizarOpcionItem(opcion))}
        </div>
      ));
    }

    return opcionesFiltradas.map((opcion) => renderizarOpcionItem(opcion));
  };

  const renderizarOpcionItem = (opcion: OpcionDropdown) => {
    const seleccionada = estaSeleccionada(opcion.value);

    if (renderOpcion) {
      return (
        <div key={opcion.value} onClick={() => manejarSeleccion(opcion.value)}>
          {renderOpcion(opcion, seleccionada)}
        </div>
      );
    }

    return (
      <div
        key={opcion.value}
        className={cn(
          'px-3 py-2 cursor-pointer transition-colors flex items-center justify-between',
          {
            'bg-blue-50 text-blue-600': seleccionada,
            'hover:bg-gray-100': !seleccionada && !opcion.disabled,
            'text-gray-400 cursor-not-allowed': opcion.disabled,
          },
          opcion.className
        )}
        onClick={() => !opcion.disabled && manejarSeleccion(opcion.value)}
      >
        <div className="flex items-center space-x-2 flex-1">
          {opcion.icono && <span className="flex-shrink-0">{opcion.icono}</span>}
          <div className="flex-1">
            <div className="text-sm">{opcion.label}</div>
            {opcion.descripcion && (
              <div className="text-xs text-gray-500">{opcion.descripcion}</div>
            )}
          </div>
        </div>
        
        {(seleccionada || multiple) && (
          <Check className={cn(
            'h-4 w-4',
            { 'text-blue-600': seleccionada, 'text-transparent': !seleccionada }
          )} />
        )}
      </div>
    );
  };

  // Render del contenido del dropdown
  const renderizarContenido = () => {
    if (!abierto || !coordenadas) return null;

    return createPortal(
      <div
        ref={contentRef}
        className={clasesContent}
        style={{
          left: coordenadas.x,
          top: coordenadas.y,
          maxHeight: coordenadas.maxHeight,
          minWidth: triggerRef.current?.offsetWidth,
        }}
      >
        {/* Campo de búsqueda */}
        {busqueda && (
          <div className="p-2 border-b">
            <input
              ref={busquedaRef}
              type="text"
              placeholder="Buscar..."
              value={terminoBusqueda}
              onChange={manejarBusqueda}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Opciones */}
        <div className="max-h-full overflow-auto">
          {opcionesFiltradas.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {terminoBusqueda ? 'No se encontraron resultados' : 'No hay opciones disponibles'}
            </div>
          ) : (
            renderizarOpciones()
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className={cn('relative', className)}>
      {renderizarTrigger()}
      {renderizarContenido()}
    </div>
  );
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default Dropdown;