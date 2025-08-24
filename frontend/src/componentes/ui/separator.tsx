/**
 * Componente Separator - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente para separadores visuales horizontal y vertical
 */

import React from 'react';
import { cn } from '../../utils/cn';

// =======================================================
// INTERFACES
// =======================================================

export interface PropiedadesSeparator {
  /**
   * Orientación del separador
   * @default 'horizontal'
   */
  orientacion?: 'horizontal' | 'vertical';
  
  /**
   * Clases CSS adicionales
   */
  className?: string;
  
  /**
   * Estilo del separador
   * @default 'solid'
   */
  estilo?: 'solid' | 'dashed' | 'dotted';
  
  /**
   * Grosor del separador
   * @default 'normal'
   */
  grosor?: 'thin' | 'normal' | 'thick';
  
  /**
   * Color del separador
   * @default 'gray'
   */
  color?: 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  
  /**
   * Espaciado alrededor del separador
   * @default 'normal'
   */
  espaciado?: 'none' | 'sm' | 'normal' | 'lg' | 'xl';
  
  /**
   * Mostrar como línea decorativa
   */
  decorativo?: boolean;
  
  /**
   * Texto para mostrar en el centro (solo horizontal)
   */
  textoCenter?: string;
  
  /**
   * ID para accesibilidad
   */
  id?: string;
  
  /**
   * Atributos ARIA
   */
  ariaLabel?: string;
}

// =======================================================
// CLASES CSS POR PROPIEDADES
// =======================================================

const clasesOrientacion = {
  horizontal: 'w-full h-px',
  vertical: 'h-full w-px'
};

const clasesEstilo = {
  solid: 'border-solid',
  dashed: 'border-dashed', 
  dotted: 'border-dotted'
};

const clasesGrosor = {
  horizontal: {
    thin: 'border-t',
    normal: 'border-t-2',
    thick: 'border-t-4'
  },
  vertical: {
    thin: 'border-l',
    normal: 'border-l-2', 
    thick: 'border-l-4'
  }
};

const clasesColor = {
  gray: 'border-gray-200',
  blue: 'border-blue-200',
  green: 'border-green-200',
  red: 'border-red-200',
  yellow: 'border-yellow-200',
  purple: 'border-purple-200'
};

const clasesEspaciado = {
  horizontal: {
    none: '',
    sm: 'my-2',
    normal: 'my-4',
    lg: 'my-6',
    xl: 'my-8'
  },
  vertical: {
    none: '',
    sm: 'mx-2',
    normal: 'mx-4',
    lg: 'mx-6',
    xl: 'mx-8'
  }
};

// =======================================================
// COMPONENTE SEPARATOR SIMPLE
// =======================================================

export const Separator: React.FC<PropiedadesSeparator> = ({
  orientacion = 'horizontal',
  className,
  estilo = 'solid',
  grosor = 'normal',
  color = 'gray',
  espaciado = 'normal',
  decorativo = false,
  textoCenter,
  id,
  ariaLabel,
  ...props
}) => {
  // Construir clases CSS
  const clases = cn(
    // Orientación base
    clasesOrientacion[orientacion],
    
    // Estilo de borde
    clasesEstilo[estilo],
    
    // Grosor según orientación
    clasesGrosor[orientacion][grosor],
    
    // Color
    clasesColor[color],
    
    // Espaciado según orientación
    clasesEspaciado[orientacion][espaciado],
    
    // Clases adicionales
    className
  );

  // Si tiene texto en el centro (solo horizontal)
  if (textoCenter && orientacion === 'horizontal') {
    return (
      <div className={cn('relative flex items-center', clasesEspaciado[orientacion][espaciado])}>
        <div className={cn('flex-1', clasesOrientacion[orientacion], clasesGrosor[orientacion][grosor], clasesColor[color])} />
        <span className="px-4 text-sm text-gray-500 bg-white">
          {textoCenter}
        </span>
        <div className={cn('flex-1', clasesOrientacion[orientacion], clasesGrosor[orientacion][grosor], clasesColor[color])} />
      </div>
    );
  }

  // Separator simple
  return (
    <div
      id={id}
      className={clases}
      role={decorativo ? 'presentation' : 'separator'}
      aria-orientation={orientacion}
      aria-label={ariaLabel}
      {...props}
    />
  );
};

// =======================================================
// VARIANTES ESPECÍFICAS PARA FELICITAFAC
// =======================================================

/**
 * Separador para secciones de formularios
 */
const SeparadorFormulario: React.FC<{ className?: string }> = ({ className }) => (
  <Separator
    espaciado="lg"
    color="gray"
    className={cn('border-gray-100', className)}
    decorativo
  />
);

/**
 * Separador para listas y tablas
 */
const SeparadorLista: React.FC<{ className?: string }> = ({ className }) => (
  <Separator
    espaciado="none"
    grosor="thin"
    color="gray"
    className={cn('border-gray-100', className)}
    decorativo
  />
);

/**
 * Separador para el header
 */
const SeparadorHeader: React.FC<{ className?: string }> = ({ className }) => (
  <Separator
    espaciado="sm"
    color="blue"
    className={cn('border-blue-100', className)}
    decorativo
  />
);

/**
 * Separador con texto
 */
const SeparadorConTexto: React.FC<{ texto: string; className?: string }> = ({ 
  texto, 
  className 
}) => (
  <Separator
    textoCenter={texto}
    espaciado="lg"
    color="gray"
    className={className}
    decorativo
  />
);

/**
 * Separador vertical para layouts
 */
const SeparadorVertical: React.FC<{ 
  height?: string;
  className?: string;
}> = ({ 
  height = 'h-6', 
  className 
}) => (
  <Separator
    orientacion="vertical"
    espaciado="sm"
    color="gray"
    className={cn(height, className)}
    decorativo
  />
);

/**
 * Separador para secciones críticas
 */
const SeparadorCritico: React.FC<{ className?: string }> = ({ className }) => (
  <Separator
    espaciado="lg"
    grosor="thick"
    color="red"
    className={className}
    decorativo
  />
);

/**
 * Separador para tarjetas
 */
const SeparadorTarjeta: React.FC<{ className?: string }> = ({ className }) => (
  <Separator
    espaciado="normal"
    grosor="thin"
    color="gray"
    className={cn('border-gray-50', className)}
    decorativo
  />
);

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default Separator;

// =======================================================
// EXPORTS ADICIONALES
// =======================================================

export {
  SeparadorFormulario,
  SeparadorLista,
  SeparadorHeader,
  SeparadorConTexto,
  SeparadorVertical,
  SeparadorCritico,
  SeparadorTarjeta
};