/**
 * Utility CN - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Función utilitaria para combinar clases CSS de forma condicional
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases CSS de forma inteligente
 * Utiliza clsx para concatenación condicional y tailwind-merge para resolver conflictos
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export default cn;