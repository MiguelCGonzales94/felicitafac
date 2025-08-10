/**
 * Utilidad CN (Class Names) - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Utilidad para combinar y optimizar clases CSS con Tailwind
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// =======================================================
// FUNCIÓN PRINCIPAL CN
// =======================================================

/**
 * Combina clases CSS de forma inteligente
 * Utiliza clsx para combinar clases condicionales y twMerge para optimizar Tailwind
 * 
 * @param inputs - Clases CSS a combinar
 * @returns String con clases CSS optimizadas
 * 
 * @example
 * ```tsx
 * // Uso básico
 * cn('px-4 py-2', 'bg-blue-500', 'text-white')
 * // -> "px-4 py-2 bg-blue-500 text-white"
 * 
 * // Con condicionales
 * cn('btn', {
 *   'btn-primary': isPrimary,
 *   'btn-disabled': isDisabled
 * })
 * 
 * // Con conflictos de Tailwind (twMerge los resuelve)
 * cn('px-4 px-6', 'bg-red-500 bg-blue-500')
 * // -> "px-6 bg-blue-500"
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// =======================================================
// UTILIDADES ESPECÍFICAS PARA COMPONENTES
// =======================================================

/**
 * Utilidad para combinar clases de variantes de componentes
 * Útil para sistemas de design con múltiples variantes
 * 
 * @param baseClasses - Clases base del componente
 * @param variants - Objeto con variantes y sus clases
 * @param selectedVariants - Variantes seleccionadas
 * @param additionalClasses - Clases adicionales
 * @returns String con clases combinadas
 */
export function cnVariants(
  baseClasses: string,
  variants: Record<string, Record<string, string>>,
  selectedVariants: Record<string, string | undefined>,
  additionalClasses?: ClassValue
): string {
  const variantClasses = Object.entries(selectedVariants)
    .map(([key, value]) => value && variants[key]?.[value])
    .filter(Boolean);

  return cn(baseClasses, ...variantClasses, additionalClasses);
}

/**
 * Utilidad para manejar estados de componentes de forma consistente
 * 
 * @param baseClasses - Clases base
 * @param states - Estados del componente
 * @param additionalClasses - Clases adicionales
 * @returns String con clases que reflejan los estados
 */
export function cnStates(
  baseClasses: string,
  states: {
    disabled?: boolean;
    loading?: boolean;
    error?: boolean;
    success?: boolean;
    warning?: boolean;
    active?: boolean;
    focus?: boolean;
  },
  additionalClasses?: ClassValue
): string {
  return cn(
    baseClasses,
    {
      // Estados de interacción
      'opacity-50 cursor-not-allowed': states.disabled,
      'animate-pulse pointer-events-none': states.loading,
      'ring-2 ring-blue-500 ring-opacity-50': states.focus,
      'bg-blue-50 border-blue-300': states.active,
      
      // Estados de validación
      'border-red-300 text-red-600 focus:border-red-500 focus:ring-red-500': states.error,
      'border-green-300 text-green-600 focus:border-green-500 focus:ring-green-500': states.success,
      'border-yellow-300 text-yellow-600 focus:border-yellow-500 focus:ring-yellow-500': states.warning,
    },
    additionalClasses
  );
}

/**
 * Utilidad para clases de tamaño responsive
 * 
 * @param sizes - Tamaños por breakpoint
 * @returns String con clases responsive
 */
export function cnResponsive(sizes: {
  default?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}): string {
  const classes = [];
  
  if (sizes.default) classes.push(sizes.default);
  if (sizes.sm) classes.push(`sm:${sizes.sm}`);
  if (sizes.md) classes.push(`md:${sizes.md}`);
  if (sizes.lg) classes.push(`lg:${sizes.lg}`);
  if (sizes.xl) classes.push(`xl:${sizes.xl}`);
  if (sizes['2xl']) classes.push(`2xl:${sizes['2xl']}`);
  
  return cn(...classes);
}

// =======================================================
// UTILIDADES PARA TEMAS
// =======================================================

/**
 * Utilidad para aplicar clases según el tema
 * 
 * @param lightClasses - Clases para tema claro
 * @param darkClasses - Clases para tema oscuro
 * @param additionalClasses - Clases adicionales
 * @returns String con clases de tema
 */
export function cnTheme(
  lightClasses: string,
  darkClasses: string,
  additionalClasses?: ClassValue
): string {
  return cn(
    lightClasses,
    `dark:${darkClasses}`,
    additionalClasses
  );
}

// =======================================================
// UTILIDADES PARA ANIMACIONES
// =======================================================

/**
 * Utilidad para clases de animación condicionales
 * 
 * @param animations - Configuración de animaciones
 * @returns String con clases de animación
 */
export function cnAnimations(animations: {
  enter?: string;
  exit?: string;
  duration?: 'fast' | 'normal' | 'slow';
  delay?: 'none' | 'short' | 'medium' | 'long';
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}): string {
  const durationClasses = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
  };
  
  const delayClasses = {
    none: '',
    short: 'delay-75',
    medium: 'delay-150',
    long: 'delay-300',
  };
  
  const easingClasses = {
    linear: 'ease-linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
  };
  
  return cn(
    'transition-all',
    animations.duration && durationClasses[animations.duration],
    animations.delay && delayClasses[animations.delay],
    animations.easing && easingClasses[animations.easing],
    animations.enter,
    animations.exit
  );
}

// =======================================================
// UTILIDADES ESPECÍFICAS DE FELICITAFAC
// =======================================================

/**
 * Clases específicas para documentos SUNAT
 */
export function cnDocumentoSUNAT(
  tipoDocumento: 'factura' | 'boleta' | 'nota_credito' | 'nota_debito',
  estado: 'borrador' | 'emitido' | 'enviado' | 'aceptado' | 'rechazado' | 'anulado'
): string {
  const tipoClasses = {
    factura: 'border-blue-200 bg-blue-50',
    boleta: 'border-green-200 bg-green-50',
    nota_credito: 'border-orange-200 bg-orange-50',
    nota_debito: 'border-red-200 bg-red-50',
  };
  
  const estadoClasses = {
    borrador: 'text-gray-600 border-gray-300',
    emitido: 'text-blue-600 border-blue-300',
    enviado: 'text-yellow-600 border-yellow-300',
    aceptado: 'text-green-600 border-green-300',
    rechazado: 'text-red-600 border-red-300',
    anulado: 'text-gray-500 border-gray-300 opacity-60',
  };
  
  return cn(
    'rounded-lg border-2 p-4',
    tipoClasses[tipoDocumento],
    estadoClasses[estado]
  );
}

/**
 * Clases para roles de usuario
 */
export function cnRolUsuario(rol: 'administrador' | 'contador' | 'vendedor' | 'cliente'): string {
  const rolClasses = {
    administrador: 'bg-purple-100 text-purple-800 border-purple-200',
    contador: 'bg-green-100 text-green-800 border-green-200',
    vendedor: 'bg-blue-100 text-blue-800 border-blue-200',
    cliente: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  
  return cn(
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
    rolClasses[rol]
  );
}

/**
 * Clases para estados de pago
 */
export function cnEstadoPago(estado: 'pendiente' | 'pagado' | 'vencido' | 'parcial'): string {
  const estadoClasses = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    pagado: 'bg-green-100 text-green-800 border-green-200',
    vencido: 'bg-red-100 text-red-800 border-red-200',
    parcial: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  
  return cn(
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
    estadoClasses[estado]
  );
}

// =======================================================
// UTILIDADES DE DEBUG (SOLO DESARROLLO)
// =======================================================

/**
 * Utilidad para debugging de clases en desarrollo
 * Muestra las clases aplicadas en la consola
 */
export function cnDebug(...inputs: ClassValue[]): string {
  const result = cn(...inputs);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🎨 CN Debug:', {
      inputs,
      result,
      classes: result.split(' '),
    });
  }
  
  return result;
}

/**
 * Utilidad para verificar conflictos de Tailwind
 */
export function cnValidate(...inputs: ClassValue[]): string {
  const result = cn(...inputs);
  
  if (process.env.NODE_ENV === 'development') {
    // Buscar posibles conflictos comunes
    const classes = result.split(' ');
    const conflicts = [];
    
    // Verificar conflictos de spacing
    const spacingClasses = classes.filter(c => 
      c.match(/^(p|m|px|py|pl|pr|pt|pb|mx|my|ml|mr|mt|mb)-\d+/)
    );
    
    if (spacingClasses.length > 1) {
      conflicts.push(`Posibles conflictos de spacing: ${spacingClasses.join(', ')}`);
    }
    
    // Verificar conflictos de colores
    const colorClasses = classes.filter(c => 
      c.match(/^(bg|text|border)-(red|blue|green|yellow|purple|pink|gray)-\d+/)
    );
    
    const bgColors = colorClasses.filter(c => c.startsWith('bg-'));
    if (bgColors.length > 1) {
      conflicts.push(`Múltiples colores de fondo: ${bgColors.join(', ')}`);
    }
    
    if (conflicts.length > 0) {
      console.warn('⚠️ Posibles conflictos de clases Tailwind:', conflicts);
    }
  }
  
  return result;
}

// =======================================================
// EXPORTACIÓN POR DEFECTO
// =======================================================

export default cn;