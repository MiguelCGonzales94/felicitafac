/**
 * Utilidades Helper - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Funciones auxiliares y utilidades generales
 */

import { TASAS_IMPUESTOS, ESTADOS_DOCUMENTO, COLORES_ESTADOS_DOCUMENTO } from './constants';

// =======================================================
// TIPOS PARA HELPERS
// =======================================================

export interface CalculoImpuestos {
  subtotal: number;
  igv: number;
  total: number;
  baseImponible: number;
}

export interface OpcionesCalculo {
  incluyeIgv?: boolean;
  tasaIgv?: number;
  redondeo?: number;
}

export interface ResultadoBusqueda<T> {
  items: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface ParametrosBusqueda {
  termino?: string;
  filtros?: Record<string, any>;
  ordenPor?: string;
  direccionOrden?: 'asc' | 'desc';
  pagina?: number;
  tamanoPagina?: number;
}

// =======================================================
// UTILIDADES DE CÁLCULOS FINANCIEROS
// =======================================================

/**
 * Calcular IGV y totales
 */
export const calcularImpuestos = (
  monto: number,
  opciones: OpcionesCalculo = {}
): CalculoImpuestos => {
  const {
    incluyeIgv = false,
    tasaIgv = TASAS_IMPUESTOS.IGV,
    redondeo = 2
  } = opciones;

  let subtotal: number;
  let igv: number;
  let total: number;

  if (incluyeIgv) {
    // El monto incluye IGV
    total = redondearNumero(monto, redondeo);
    subtotal = redondearNumero(total / (1 + tasaIgv), redondeo);
    igv = redondearNumero(total - subtotal, redondeo);
  } else {
    // El monto es sin IGV
    subtotal = redondearNumero(monto, redondeo);
    igv = redondearNumero(subtotal * tasaIgv, redondeo);
    total = redondearNumero(subtotal + igv, redondeo);
  }

  return {
    subtotal,
    igv,
    total,
    baseImponible: subtotal
  };
};

/**
 * Calcular descuento
 */
export const calcularDescuento = (
  precio: number,
  descuento: number,
  esPorcentaje = true
): { montoDescuento: number; precioFinal: number } => {
  let montoDescuento: number;

  if (esPorcentaje) {
    montoDescuento = precio * (descuento / 100);
  } else {
    montoDescuento = descuento;
  }

  const precioFinal = precio - montoDescuento;

  return {
    montoDescuento: redondearNumero(montoDescuento, 2),
    precioFinal: redondearNumero(Math.max(0, precioFinal), 2)
  };
};

/**
 * Calcular precio unitario con IGV
 */
export const calcularPrecioConIgv = (
  precioSinIgv: number,
  tasaIgv = TASAS_IMPUESTOS.IGV
): number => {
  return redondearNumero(precioSinIgv * (1 + tasaIgv), 2);
};

/**
 * Calcular precio unitario sin IGV
 */
export const calcularPrecioSinIgv = (
  precioConIgv: number,
  tasaIgv = TASAS_IMPUESTOS.IGV
): number => {
  return redondearNumero(precioConIgv / (1 + tasaIgv), 2);
};

/**
 * Redondear número a decimales específicos
 */
export const redondearNumero = (numero: number, decimales = 2): number => {
  const factor = Math.pow(10, decimales);
  return Math.round(numero * factor) / factor;
};

// =======================================================
// UTILIDADES DE ARRAYS Y OBJETOS
// =======================================================

/**
 * Agrupar array por campo
 */
export const agruparPor = <T, K extends keyof T>(
  array: T[],
  campo: K
): Record<string, T[]> => {
  return array.reduce((grupos, item) => {
    const clave = String(item[campo]);
    if (!grupos[clave]) {
      grupos[clave] = [];
    }
    grupos[clave].push(item);
    return grupos;
  }, {} as Record<string, T[]>);
};

/**
 * Ordenar array por campo
 */
export const ordenarPor = <T>(
  array: T[],
  campo: keyof T | ((item: T) => any),
  direccion: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const valorA = typeof campo === 'function' ? campo(a) : a[campo];
    const valorB = typeof campo === 'function' ? campo(b) : b[campo];

    if (valorA < valorB) {
      return direccion === 'asc' ? -1 : 1;
    }
    if (valorA > valorB) {
      return direccion === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Filtrar array por múltiples campos
 */
export const filtrarPor = <T>(
  array: T[],
  filtros: Partial<T>
): T[] => {
  return array.filter(item => {
    return Object.entries(filtros).every(([campo, valor]) => {
      if (valor === undefined || valor === null) return true;
      
      const valorItem = item[campo as keyof T];
      
      if (typeof valor === 'string' && typeof valorItem === 'string') {
        return valorItem.toLowerCase().includes(valor.toLowerCase());
      }
      
      return valorItem === valor;
    });
  });
};

/**
 * Buscar en array por término
 */
export const buscarEnArray = <T>(
  array: T[],
  termino: string,
  campos: (keyof T)[]
): T[] => {
  if (!termino.trim()) return array;

  const terminoMinuscula = termino.toLowerCase();
  
  return array.filter(item => {
    return campos.some(campo => {
      const valor = item[campo];
      if (typeof valor === 'string') {
        return valor.toLowerCase().includes(terminoMinuscula);
      }
      if (typeof valor === 'number') {
        return valor.toString().includes(termino);
      }
      return false;
    });
  });
};

/**
 * Paginar array
 */
export const paginarArray = <T>(
  array: T[],
  pagina: number,
  tamanoPagina: number
): ResultadoBusqueda<T> => {
  const inicio = (pagina - 1) * tamanoPagina;
  const fin = inicio + tamanoPagina;
  const items = array.slice(inicio, fin);
  
  return {
    items,
    total: array.length,
    pagina,
    totalPaginas: Math.ceil(array.length / tamanoPagina)
  };
};

/**
 * Remover duplicados de array
 */
export const removerDuplicados = <T>(
  array: T[],
  comparador?: (a: T, b: T) => boolean
): T[] => {
  if (!comparador) {
    return [...new Set(array)];
  }

  return array.filter((item, index) => {
    return !array.slice(0, index).some(otroItem => comparador(item, otroItem));
  });
};

/**
 * Sumar valores de array por campo
 */
export const sumarPor = <T>(
  array: T[],
  campo: keyof T
): number => {
  return array.reduce((suma, item) => {
    const valor = item[campo];
    return suma + (typeof valor === 'number' ? valor : 0);
  }, 0);
};

// =======================================================
// UTILIDADES DE STRINGS
// =======================================================

/**
 * Generar ID único
 */
export const generarId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Escapar caracteres especiales HTML
 */
export const escaparHtml = (texto: string): string => {
  const mapaEscape: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return texto.replace(/[&<>"']/g, char => mapaEscape[char]);
};

/**
 * Capitalizar primera letra
 */
export const capitalizarPrimeraLetra = (texto: string): string => {
  if (!texto) return texto;
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

/**
 * Convertir a camelCase
 */
export const toCamelCase = (texto: string): string => {
  return texto
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (palabra, index) => {
      return index === 0 ? palabra.toLowerCase() : palabra.toUpperCase();
    })
    .replace(/\s+/g, '');
};

/**
 * Convertir a kebab-case
 */
export const toKebabCase = (texto: string): string => {
  return texto
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
};

/**
 * Generar iniciales de nombre
 */
export const generarIniciales = (nombre: string, apellido?: string): string => {
  const inicialNombre = nombre?.charAt(0)?.toUpperCase() || '';
  const inicialApellido = apellido?.charAt(0)?.toUpperCase() || '';
  return inicialNombre + inicialApellido;
};

// =======================================================
// UTILIDADES DE FECHAS
// =======================================================

/**
 * Obtener rango de fechas
 */
export const obtenerRangoFechas = (
  tipo: 'hoy' | 'ayer' | 'semana' | 'mes' | 'año'
): { inicio: Date; fin: Date } => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fin = new Date(hoy);
  fin.setHours(23, 59, 59, 999);

  let inicio = new Date(hoy);

  switch (tipo) {
    case 'hoy':
      break;
    
    case 'ayer':
      inicio.setDate(inicio.getDate() - 1);
      fin.setDate(fin.getDate() - 1);
      break;
    
    case 'semana':
      const diaSemana = inicio.getDay();
      inicio.setDate(inicio.getDate() - diaSemana);
      break;
    
    case 'mes':
      inicio.setDate(1);
      break;
    
    case 'año':
      inicio.setMonth(0, 1);
      break;
  }

  return { inicio, fin };
};

/**
 * Calcular diferencia en días
 */
export const calcularDiferenciaDias = (fecha1: Date, fecha2: Date): number => {
  const unDia = 24 * 60 * 60 * 1000;
  return Math.round((fecha2.getTime() - fecha1.getTime()) / unDia);
};

/**
 * Verificar si es día hábil
 */
export const esDiaHabil = (fecha: Date): boolean => {
  const diaSemana = fecha.getDay();
  return diaSemana !== 0 && diaSemana !== 6; // No domingo ni sábado
};

// =======================================================
// UTILIDADES DE ESTADO
// =======================================================

/**
 * Obtener configuración de estado de documento
 */
export const obtenerConfiguracionEstado = (estado: string) => {
  const color = COLORES_ESTADOS_DOCUMENTO[estado as keyof typeof COLORES_ESTADOS_DOCUMENTO] || 'gray';
  
  const configuraciones = {
    gray: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' }
  };

  return configuraciones[color as keyof typeof configuraciones];
};

/**
 * Verificar si documento puede ser editado
 */
export const puedeEditarDocumento = (estado: string): boolean => {
  return estado === ESTADOS_DOCUMENTO.BORRADOR;
};

/**
 * Verificar si documento puede ser anulado
 */
export const puedeAnularDocumento = (estado: string): boolean => {
  return [ESTADOS_DOCUMENTO.ENVIADO, ESTADOS_DOCUMENTO.ACEPTADO].includes(estado as any);
};

// =======================================================
// UTILIDADES DE ARCHIVOS
// =======================================================

/**
 * Convertir bytes a formato legible
 */
export const bytesAFormato = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const tamaños = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${tamaños[i]}`;
};

/**
 * Obtener extensión de archivo
 */
export const obtenerExtensionArchivo = (nombreArchivo: string): string => {
  return nombreArchivo.split('.').pop()?.toLowerCase() || '';
};

/**
 * Validar tipo de archivo
 */
export const validarTipoArchivo = (
  nombreArchivo: string,
  tiposPermitidos: string[]
): boolean => {
  const extension = obtenerExtensionArchivo(nombreArchivo);
  return tiposPermitidos.includes(`.${extension}`);
};

// =======================================================
// UTILIDADES DE VALIDACIÓN
// =======================================================

/**
 * Verificar si es email válido
 */
export const esEmailValido = (email: string): boolean => {
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patron.test(email);
};

/**
 * Verificar si es número válido
 */
export const esNumeroValido = (valor: any): boolean => {
  return !isNaN(valor) && isFinite(valor);
};

/**
 * Verificar si objeto está vacío
 */
export const esObjetoVacio = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Verificar si array está vacío
 */
export const esArrayVacio = (arr: any[]): boolean => {
  return !Array.isArray(arr) || arr.length === 0;
};

// =======================================================
// UTILIDADES DE COLORES
// =======================================================

/**
 * Generar color hexadecimal aleatorio
 */
export const generarColorAleatorio = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

/**
 * Convertir hex a RGB
 */
export const hexARgb = (hex: string): { r: number; g: number; b: number } => {
  const resultado = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return resultado ? {
    r: parseInt(resultado[1], 16),
    g: parseInt(resultado[2], 16),
    b: parseInt(resultado[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// =======================================================
// UTILIDADES DE ALMACENAMIENTO LOCAL
// =======================================================

/**
 * Guardar en localStorage con manejo de errores
 */
export const guardarEnStorage = (clave: string, valor: any): boolean => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
    return false;
  }
};

/**
 * Obtener de localStorage con manejo de errores
 */
export const obtenerDeStorage = <T>(clave: string, valorDefault?: T): T | null => {
  try {
    const item = localStorage.getItem(clave);
    return item ? JSON.parse(item) : valorDefault || null;
  } catch (error) {
    console.error('Error obteniendo de localStorage:', error);
    return valorDefault || null;
  }
};

/**
 * Remover de localStorage
 */
export const removerDeStorage = (clave: string): boolean => {
  try {
    localStorage.removeItem(clave);
    return true;
  } catch (error) {
    console.error('Error removiendo de localStorage:', error);
    return false;
  }
};

// =======================================================
// UTILIDADES DE DEBUGGING
// =======================================================

/**
 * Log condicional para desarrollo
 */
export const logDesarrollo = (...args: any[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[FELICITAFAC]:', ...args);
  }
};

/**
 * Medir tiempo de ejecución
 */
export const medirTiempo = <T>(
  fn: () => T,
  etiqueta = 'Operación'
): T => {
  const inicio = performance.now();
  const resultado = fn();
  const fin = performance.now();
  
  logDesarrollo(`${etiqueta} completada en ${(fin - inicio).toFixed(2)}ms`);
  
  return resultado;
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default {
  calcularImpuestos,
  calcularDescuento,
  calcularPrecioConIgv,
  calcularPrecioSinIgv,
  redondearNumero,
  agruparPor,
  ordenarPor,
  filtrarPor,
  buscarEnArray,
  paginarArray,
  removerDuplicados,
  sumarPor,
  generarId,
  escaparHtml,
  capitalizarPrimeraLetra,
  toCamelCase,
  toKebabCase,
  generarIniciales,
  obtenerRangoFechas,
  calcularDiferenciaDias,
  esDiaHabil,
  obtenerConfiguracionEstado,
  puedeEditarDocumento,
  puedeAnularDocumento,
  bytesAFormato,
  obtenerExtensionArchivo,
  validarTipoArchivo,
  esEmailValido,
  esNumeroValido,
  esObjetoVacio,
  esArrayVacio,
  generarColorAleatorio,
  hexARgb,
  guardarEnStorage,
  obtenerDeStorage,
  removerDeStorage,
  logDesarrollo,
  medirTiempo
};