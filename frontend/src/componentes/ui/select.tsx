/**
 * Componente Select - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente select personalizado con soporte para búsqueda y validaciones
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Search, X, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

export interface OpcionSelect {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
  descripcion?: string;
  icono?: React.ReactNode;
}

export interface PropiedadesSelect {
  // Propiedades básicas
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  options: OpcionSelect[];
  onChange?: (value: string | number) => void;
  
  // Estados
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  required?: boolean;
  
  // Funcionalidades
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  
  // Apariencia
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  
  // Textos personalizados
  searchPlaceholder?: string;
  noOptionsText?: string;
  loadingText?: string;
  
  // Eventos
  onSearch?: (term: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  
  // Props del contenedor
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export interface PropiedadesSelectGroup {
  label: string;
  options: OpcionSelect[];
}

// =======================================================
// ESTILOS Y VARIANTES
// =======================================================

const selectVariants = {
  size: {
    sm: 'h-8 text-xs px-2',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4',
  },
  variant: {
    default: 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
    outline: 'border-gray-300 bg-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
    ghost: 'border-transparent bg-gray-50 hover:bg-gray-100 focus:bg-white focus:border-gray-300',
  },
};

const dropdownClasses = 'absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1';

const optionClasses = {
  base: 'px-3 py-2 cursor-pointer transition-colors duration-150 flex items-center justify-between',
  normal: 'hover:bg-gray-100 text-gray-900',
  selected: 'bg-blue-50 text-blue-900 font-medium',
  disabled: 'text-gray-400 cursor-not-allowed bg-gray-50',
  grouped: 'pl-6',
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const Select = React.forwardRef<HTMLDivElement, PropiedadesSelect>(
  (
    {
      value,
      defaultValue,
      placeholder = 'Seleccionar...',
      options = [],
      onChange,
      disabled = false,
      loading = false,
      error = false,
      required = false,
      searchable = false,
      clearable = false,
      multiple = false,
      size = 'md',
      variant = 'default',
      className,
      searchPlaceholder = 'Buscar...',
      noOptionsText = 'No hay opciones disponibles',
      loadingText = 'Cargando...',
      onSearch,
      onFocus,
      onBlur,
      id,
      name,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    // =======================================================
    // ESTADO LOCAL
    // =======================================================
    
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedValue, setSelectedValue] = useState(value || defaultValue);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    
    // Referencias
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // =======================================================
    // EFECTOS
    // =======================================================
    
    // Sincronizar valor externo
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);
    
    // Manejar clicks fuera del componente
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
          setFocusedIndex(-1);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Manejar escape
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen) {
          setIsOpen(false);
          setSearchTerm('');
          setFocusedIndex(-1);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);
    
    // =======================================================
    // FUNCIONES AUXILIARES
    // =======================================================
    
    // Filtrar opciones basado en búsqueda
    const filteredOptions = React.useMemo(() => {
      if (!searchTerm) return options;
      
      return options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [options, searchTerm]);
    
    // Agrupar opciones
    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, OpcionSelect[]> = {};
      const ungrouped: OpcionSelect[] = [];
      
      filteredOptions.forEach(option => {
        if (option.group) {
          if (!groups[option.group]) {
            groups[option.group] = [];
          }
          groups[option.group].push(option);
        } else {
          ungrouped.push(option);
        }
      });
      
      return { groups, ungrouped };
    }, [filteredOptions]);
    
    // Obtener opción seleccionada
    const selectedOption = React.useMemo(() => {
      return options.find(option => option.value === selectedValue);
    }, [options, selectedValue]);
    
    // =======================================================
    // MANEJADORES DE EVENTOS
    // =======================================================
    
    const handleToggleDropdown = useCallback(() => {
      if (disabled || loading) return;
      
      setIsOpen(!isOpen);
      setSearchTerm('');
      setFocusedIndex(-1);
      
      if (!isOpen) {
        onFocus?.();
      } else {
        onBlur?.();
      }
    }, [disabled, loading, isOpen, onFocus, onBlur]);
    
    const handleSelectOption = useCallback((option: OpcionSelect) => {
      if (option.disabled) return;
      
      setSelectedValue(option.value);
      onChange?.(option.value);
      setIsOpen(false);
      setSearchTerm('');
      setFocusedIndex(-1);
    }, [onChange]);
    
    const handleClearValue = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValue(undefined);
      onChange?.('');
      setSearchTerm('');
    }, [onChange]);
    
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      setFocusedIndex(-1);
      onSearch?.(term);
    }, [onSearch]);
    
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }
      
      const flatOptions = filteredOptions.filter(opt => !opt.disabled);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < flatOptions.length - 1 ? prev + 1 : 0
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : flatOptions.length - 1
          );
          break;
          
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && flatOptions[focusedIndex]) {
            handleSelectOption(flatOptions[focusedIndex]);
          }
          break;
          
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          setFocusedIndex(-1);
          break;
      }
    }, [isOpen, filteredOptions, focusedIndex, handleSelectOption]);
    
    // =======================================================
    // RENDERIZADO DE OPCIONES
    // =======================================================
    
    const renderOption = (option: OpcionSelect, index: number) => {
      const isSelected = option.value === selectedValue;
      const isFocused = index === focusedIndex;
      
      return (
        <div
          key={option.value}
          className={cn(
            optionClasses.base,
            option.disabled
              ? optionClasses.disabled
              : isSelected
              ? optionClasses.selected
              : optionClasses.normal,
            isFocused && !option.disabled && 'bg-gray-100',
            option.group && optionClasses.grouped
          )}
          onClick={() => handleSelectOption(option)}
          role="option"
          aria-selected={isSelected}
        >
          <div className="flex items-center space-x-2 flex-1">
            {option.icono && (
              <span className="flex-shrink-0">{option.icono}</span>
            )}
            <div className="flex-1">
              <div className="text-sm">{option.label}</div>
              {option.descripcion && (
                <div className="text-xs text-gray-500">{option.descripcion}</div>
              )}
            </div>
          </div>
          {isSelected && (
            <Check className="w-4 h-4 text-blue-600" />
          )}
        </div>
      );
    };
    
    const renderOptions = () => {
      if (loading) {
        return (
          <div className="px-3 py-2 text-gray-500 text-sm text-center">
            {loadingText}
          </div>
        );
      }
      
      if (filteredOptions.length === 0) {
        return (
          <div className="px-3 py-2 text-gray-500 text-sm text-center">
            {noOptionsText}
          </div>
        );
      }
      
      const { groups, ungrouped } = groupedOptions;
      
      return (
        <>
          {/* Opciones sin grupo */}
          {ungrouped.map((option, index) => renderOption(option, index))}
          
          {/* Opciones agrupadas */}
          {Object.entries(groups).map(([groupName, groupOptions]) => (
            <div key={groupName}>
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
                {groupName}
              </div>
              {groupOptions.map((option, index) => 
                renderOption(option, ungrouped.length + index)
              )}
            </div>
          ))}
        </>
      );
    };
    
    // =======================================================
    // CLASES CSS
    // =======================================================
    
    const containerClasses = cn(
      'relative w-full',
      className
    );
    
    const triggerClasses = cn(
      'w-full flex items-center justify-between border rounded-md transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      selectVariants.size[size],
      selectVariants.variant[variant],
      disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
      loading && 'cursor-wait',
      error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
      !disabled && !loading && 'cursor-pointer hover:border-gray-400'
    );
    
    // =======================================================
    // RENDER
    // =======================================================
    
    return (
      <div
        ref={containerRef}
        className={containerClasses}
        {...props}
      >
        <div
          ref={ref}
          className={triggerClasses}
          onClick={handleToggleDropdown}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-required={required}
          id={id}
        >
          {/* Contenido del trigger */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {selectedOption?.icono && (
              <span className="flex-shrink-0">{selectedOption.icono}</span>
            )}
            <span className={cn(
              'truncate',
              !selectedOption && 'text-gray-500'
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          
          {/* Controles del trigger */}
          <div className="flex items-center space-x-1">
            {clearable && selectedOption && !disabled && (
              <button
                type="button"
                onClick={handleClearValue}
                className="p-0.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                <X className="w-3 h-3" />
              </button>
            )}
            
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <span className="text-gray-400">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            )}
          </div>
        </div>
        
        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={dropdownClasses}
            role="listbox"
          >
            {/* Campo de búsqueda */}
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>
              </div>
            )}
            
            {/* Opciones */}
            <div className="py-1">
              {renderOptions()}
            </div>
          </div>
        )}
        
        {/* Input oculto para formularios */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={selectedValue || ''}
          />
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// =======================================================
// COMPONENTES AUXILIARES
// =======================================================

/**
 * Componente SelectTrigger para mayor flexibilidad
 */
export const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    disabled?: boolean;
    error?: boolean;
  }
>(({ className, disabled, error, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
      'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
      className
    )}
    {...props}
  >
    {children}
  </div>
));

SelectTrigger.displayName = 'SelectTrigger';

/**
 * Componente SelectValue para mostrar el valor seleccionado
 */
export const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string;
  }
>(({ className, placeholder, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('block truncate', className)}
    {...props}
  >
    {placeholder}
  </span>
));

SelectValue.displayName = 'SelectValue';

/**
 * Componente SelectContent para el dropdown
 */
export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
      'data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  >
    <div className="p-1">
      {children}
    </div>
  </div>
));

SelectContent.displayName = 'SelectContent';

/**
 * Componente SelectItem para cada opción
 */
export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    disabled?: boolean;
  }
>(({ className, children, disabled, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      disabled && 'pointer-events-none opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Check className="h-4 w-4" />
    </span>
    {children}
  </div>
));

SelectItem.displayName = 'SelectItem';

export default Select;