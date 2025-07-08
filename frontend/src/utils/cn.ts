/**
 * Utilidad para combinar clases CSS - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Función helper para combinar clases CSS condicionalmente
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases CSS usando clsx y tailwind-merge
 * Permite combinar clases condicionalmente y resuelve conflictos de Tailwind
 * 
 * @param inputs - Array de clases CSS, strings, objetos condicionales
 * @returns String con las clases CSS combinadas
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': isActive })
 * cn('btn', isLoading && 'opacity-50', 'hover:bg-blue-600')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Exportar como default también
export default cn;