/**
 * Utilidades de Dinero - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Manejo específico de cálculos monetarios y conversiones
 */

import { MONEDAS, SIMBOLOS_MONEDAS, TASAS_IMPUESTOS } from './constants';

// =======================================================
// TIPOS PARA CÁLCULOS MONETARIOS
// =======================================================

export interface MontoConImpuestos {
  baseImponible: number;
  igv: number;
  icbper: number;
  isc: number;
  otrosImpuestos: number;
  totalImpuestos: number;
  descuentos: number;
  totalSinImpuestos: number;
  totalConImpuestos: number;
}

export interface ConfiguracionCalculoMonetario {
  moneda?: string;
  incluyeIgv?: boolean;
  tasaIgv?: number;
  tasaIsc?: number;
  aplicaIcbper?: boolean;
  redondeo?: number;
  modoRedondeo?: 'normal' | 'arriba' | 'abajo';
}

export interface ConversionMoneda {
  monedaOrigen: string;
  monedaDestino: string;
  tasaCambio: number;
  montoOriginal: number;
  montoConvertido: number;
  fechaConversion: Date;
}

export interface DetalleLineaFacturacion {
  cantidad: number;
  precioUnitario: number;
  descuentoUnitario: number;
  afectoIgv: boolean;
  afectoIsc: boolean;
  afectoIcbper: boolean;
  // Calculados
  subtotalSinDescuento: number;
  montoDescuento: number;
  subtotalConDescuento: number;
  baseImponible: number;
  igv: number;
  isc: number;
  icbper: number;
  totalLinea: number;
}

export interface ResumenDocumentoFacturacion {
  totalGravado: number;
  totalExonerado: number;
  totalInafecto: number;
  totalGratuito: number;
  totalDescuentos: number;
  totalOtrosCargos: number;
  baseImponibleIgv: number;
  igv: number;
  baseImponibleIsc: number;
  isc: number;
  icbper: number;
  totalImpuestos: number;
  importeTotal: number;
  redondeo: number;
}

// =======================================================
// FUNCIONES BÁSICAS DE REDONDEO
// =======================================================

/**
 * Redondear monto según configuración
 */
export const redondearMonto = (
  monto: number,
  decimales = 2,
  modo: 'normal' | 'arriba' | 'abajo' = 'normal'
): number => {
  if (isNaN(monto)) return 0;

  const factor = Math.pow(10, decimales);
  
  switch (modo) {
    case 'arriba':
      return Math.ceil(monto * factor) / factor;
    case 'abajo':
      return Math.floor(monto * factor) / factor;
    default:
      return Math.round(monto * factor) / factor;
  }
};

/**
 * Redondear a múltiplo específico (ej: centavos de 5)
 */
export const redondearAMultiplo = (monto: number, multiplo: number): number => {
  return Math.round(monto / multiplo) * multiplo;
};

/**
 * Aplicar redondeo SUNAT (para importes mayores)
 */
export const aplicarRedondeoSunat = (monto: number): number => {
  // SUNAT permite redondeo a centavo más cercano
  return redondearMonto(monto, 2, 'normal');
};

// =======================================================
// CÁLCULOS DE IMPUESTOS
// =======================================================

/**
 * Calcular IGV sobre un monto
 */
export const calcularIgv = (
  baseImponible: number,
  tasa = TASAS_IMPUESTOS.IGV
): number => {
  return redondearMonto(baseImponible * tasa, 2);
};

/**
 * Extraer IGV de un monto que ya lo incluye
 */
export const extraerIgv = (
  montoConIgv: number,
  tasa = TASAS_IMPUESTOS.IGV
): { baseImponible: number; igv: number } => {
  const baseImponible = redondearMonto(montoConIgv / (1 + tasa), 2);
  const igv = redondearMonto(montoConIgv - baseImponible, 2);
  
  return { baseImponible, igv };
};

/**
 * Calcular ISC (Impuesto Selectivo al Consumo)
 */
export const calcularIsc = (
  baseImponible: number,
  tasa: number
): number => {
  return redondearMonto(baseImponible * tasa, 2);
};

/**
 * Calcular ICBPER (Impuesto a bolsas plásticas)
 */
export const calcularIcbper = (
  cantidadBolsas: number,
  tasaPorBolsa = TASAS_IMPUESTOS.ICBPER
): number => {
  return redondearMonto(cantidadBolsas * tasaPorBolsa, 2);
};

/**
 * Calcular todos los impuestos de una línea
 */
export const calcularImpuestosLinea = (
  detalle: Partial<DetalleLineaFacturacion>,
  configuracion: ConfiguracionCalculoMonetario = {}
): DetalleLineaFacturacion => {
  const {
    tasaIgv = TASAS_IMPUESTOS.IGV,
    tasaIsc = 0,
    redondeo = 2
  } = configuracion;

  const cantidad = detalle.cantidad || 0;
  const precioUnitario = detalle.precioUnitario || 0;
  const descuentoUnitario = detalle.descuentoUnitario || 0;
  const afectoIgv = detalle.afectoIgv ?? true;
  const afectoIsc = detalle.afectoIsc ?? false;
  const afectoIcbper = detalle.afectoIcbper ?? false;

  // Cálculos básicos
  const subtotalSinDescuento = redondearMonto(cantidad * precioUnitario, redondeo);
  const montoDescuento = redondearMonto(cantidad * descuentoUnitario, redondeo);
  const subtotalConDescuento = redondearMonto(subtotalSinDescuento - montoDescuento, redondeo);

  // Base imponible (depende de los impuestos que se aplicarán)
  let baseImponible = subtotalConDescuento;

  // Calcular ISC primero (si aplica)
  const isc = afectoIsc ? calcularIsc(baseImponible, tasaIsc) : 0;
  
  // Actualizar base para IGV (incluye ISC)
  const baseParaIgv = baseImponible + isc;
  
  // Calcular IGV
  const igv = afectoIgv ? calcularIgv(baseParaIgv, tasaIgv) : 0;

  // Calcular ICBPER (si aplica)
  const icbper = afectoIcbper ? calcularIcbper(cantidad) : 0;

  // Total de la línea
  const totalLinea = redondearMonto(baseImponible + igv + isc + icbper, redondeo);

  return {
    cantidad,
    precioUnitario,
    descuentoUnitario,
    afectoIgv,
    afectoIsc,
    afectoIcbper,
    subtotalSinDescuento,
    montoDescuento,
    subtotalConDescuento,
    baseImponible,
    igv,
    isc,
    icbper,
    totalLinea
  };
};

// =======================================================
// CÁLCULOS DE DOCUMENTOS COMPLETOS
// =======================================================

/**
 * Calcular resumen de documento de facturación
 */
export const calcularResumenDocumento = (
  lineas: DetalleLineaFacturacion[],
  descuentosGlobales = 0,
  otrosCargos = 0
): ResumenDocumentoFacturacion => {
  // Totales por tipo de afectación
  const totalGravado = lineas
    .filter(l => l.afectoIgv)
    .reduce((sum, l) => sum + l.baseImponible, 0);
    
  const totalExonerado = lineas
    .filter(l => !l.afectoIgv)
    .reduce((sum, l) => sum + l.baseImponible, 0);
    
  // Para este sistema simplificado, asumimos que no hay inafecto ni gratuito
  const totalInafecto = 0;
  const totalGratuito = 0;

  // Totales de descuentos y cargos
  const totalDescuentosLineas = lineas.reduce((sum, l) => sum + l.montoDescuento, 0);
  const totalDescuentos = redondearMonto(totalDescuentosLineas + descuentosGlobales, 2);

  // Bases imponibles y totales de impuestos
  const baseImponibleIgv = totalGravado;
  const igv = lineas.reduce((sum, l) => sum + l.igv, 0);
  
  const baseImponibleIsc = lineas
    .filter(l => l.afectoIsc)
    .reduce((sum, l) => sum + l.baseImponible, 0);
  const isc = lineas.reduce((sum, l) => sum + l.isc, 0);
  
  const icbper = lineas.reduce((sum, l) => sum + l.icbper, 0);
  
  const totalImpuestos = redondearMonto(igv + isc + icbper, 2);

  // Importe total
  const subtotal = totalGravado + totalExonerado + totalInafecto;
  const importeTotal = redondearMonto(
    subtotal - totalDescuentos + otrosCargos + totalImpuestos, 2
  );

  // El redondeo se calcula como la diferencia entre el total calculado y el total real
  // (en este caso será 0 porque ya redondeamos todo)
  const redondeo = 0;

  return {
    totalGravado: redondearMonto(totalGravado, 2),
    totalExonerado: redondearMonto(totalExonerado, 2),
    totalInafecto: redondearMonto(totalInafecto, 2),
    totalGratuito: redondearMonto(totalGratuito, 2),
    totalDescuentos,
    totalOtrosCargos: redondearMonto(otrosCargos, 2),
    baseImponibleIgv: redondearMonto(baseImponibleIgv, 2),
    igv: redondearMonto(igv, 2),
    baseImponibleIsc: redondearMonto(baseImponibleIsc, 2),
    isc: redondearMonto(isc, 2),
    icbper: redondearMonto(icbper, 2),
    totalImpuestos,
    importeTotal,
    redondeo
  };
};

// =======================================================
// CONVERSIONES DE MONEDA
// =======================================================

/**
 * Convertir monto entre monedas
 */
export const convertirMoneda = (
  monto: number,
  monedaOrigen: string,
  monedaDestino: string,
  tasaCambio: number
): ConversionMoneda => {
  const montoConvertido = redondearMonto(monto * tasaCambio, 2);
  
  return {
    monedaOrigen,
    monedaDestino,
    tasaCambio,
    montoOriginal: monto,
    montoConvertido,
    fechaConversion: new Date()
  };
};

/**
 * Obtener tasa de cambio USD a PEN (simulada - en producción vendría de API)
 */
export const obtenerTasaCambioUsdPen = async (): Promise<number> => {
  // En producción, esto vendría de una API del BCR o similar
  // Por ahora devolvemos una tasa simulada
  return 3.75;
};

/**
 * Obtener tasa de cambio EUR a PEN (simulada)
 */
export const obtenerTasaCambioEurPen = async (): Promise<number> => {
  // En producción, esto vendría de una API
  return 4.10;
};

// =======================================================
// FORMATEO DE MONTOS
// =======================================================

/**
 * Formatear monto como moneda
 */
export const formatearComoMoneda = (
  monto: number,
  moneda = MONEDAS.PEN,
  mostrarSimbolo = true,
  decimales = 2
): string => {
  if (isNaN(monto)) return '0.00';

  const montoFormateado = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(monto);

  if (!mostrarSimbolo) return montoFormateado;

  const simbolo = SIMBOLOS_MONEDAS[moneda as keyof typeof SIMBOLOS_MONEDAS] || '';
  return `${simbolo} ${montoFormateado}`;
};

/**
 * Formatear monto en letras (para documentos oficiales)
 */
export const formatearMontoEnLetras = (monto: number, moneda = MONEDAS.PEN): string => {
  const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  
  // Separar parte entera y decimal
  const parteEntera = Math.floor(monto);
  const parteDecimal = Math.round((monto - parteEntera) * 100);
  
  const convertirNumero = (num: number): string => {
    if (num === 0) return 'cero';
    if (num === 1) return 'uno';
    if (num < 10) return unidades[num];
    if (num < 20) {
      const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
      return especiales[num - 10];
    }
    if (num < 100) {
      const d = Math.floor(num / 10);
      const u = num % 10;
      if (d === 2 && u > 0) return 'veinti' + unidades[u];
      return decenas[d] + (u > 0 ? ' y ' + unidades[u] : '');
    }
    if (num < 1000) {
      const c = Math.floor(num / 100);
      const resto = num % 100;
      let resultado = centenas[c];
      if (c === 1 && resto === 0) resultado = 'cien';
      if (resto > 0) resultado += ' ' + convertirNumero(resto);
      return resultado;
    }
    
    // Para números mayores, implementar según necesidad
    return num.toString();
  };

  const textoEntero = convertirNumero(parteEntera);
  const textoDecimal = parteDecimal.toString().padStart(2, '0');
  
  const nombreMoneda = moneda === MONEDAS.PEN ? 'soles' : 
                      moneda === MONEDAS.USD ? 'dólares' : 'euros';
  
  return `${textoEntero} con ${textoDecimal}/100 ${nombreMoneda}`.toUpperCase();
};

// =======================================================
// VALIDACIONES MONETARIAS
// =======================================================

/**
 * Validar que un monto sea válido para facturación
 */
export const validarMontoFacturacion = (monto: number): { valido: boolean; mensaje?: string } => {
  if (isNaN(monto)) {
    return { valido: false, mensaje: 'El monto no es un número válido' };
  }
  
  if (monto < 0) {
    return { valido: false, mensaje: 'El monto no puede ser negativo' };
  }
  
  if (monto > 999999999.99) {
    return { valido: false, mensaje: 'El monto excede el límite máximo' };
  }
  
  // Validar que no tenga más de 2 decimales
  const decimales = (monto.toString().split('.')[1] || '').length;
  if (decimales > 2) {
    return { valido: false, mensaje: 'El monto no puede tener más de 2 decimales' };
  }
  
  return { valido: true };
};

/**
 * Validar coherencia de cálculos en documento
 */
export const validarCoherenciaCalculos = (
  lineas: DetalleLineaFacturacion[],
  resumen: ResumenDocumentoFacturacion
): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];
  
  // Validar que la suma de líneas coincida con el resumen
  const sumaTotalLineas = lineas.reduce((sum, l) => sum + l.totalLinea, 0);
  const diferencia = Math.abs(sumaTotalLineas - resumen.importeTotal);
  
  if (diferencia > 0.02) { // Tolerancia de 2 centavos por redondeos
    errores.push('La suma de las líneas no coincide con el total del documento');
  }
  
  // Validar IGV
  const sumaIgvLineas = lineas.reduce((sum, l) => sum + l.igv, 0);
  if (Math.abs(sumaIgvLineas - resumen.igv) > 0.01) {
    errores.push('El IGV calculado no coincide entre líneas y resumen');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};

// =======================================================
// UTILIDADES DE DESCUENTOS
// =======================================================

/**
 * Calcular descuento por porcentaje
 */
export const calcularDescuentoPorcentaje = (
  monto: number,
  porcentaje: number
): { montoDescuento: number; montoFinal: number } => {
  const montoDescuento = redondearMonto((monto * porcentaje) / 100, 2);
  const montoFinal = redondearMonto(monto - montoDescuento, 2);
  
  return { montoDescuento, montoFinal };
};

/**
 * Calcular descuento fijo
 */
export const calcularDescuentoFijo = (
  monto: number,
  descuento: number
): { montoDescuento: number; montoFinal: number } => {
  const montoDescuento = Math.min(descuento, monto);
  const montoFinal = redondearMonto(monto - montoDescuento, 2);
  
  return { montoDescuento: redondearMonto(montoDescuento, 2), montoFinal };
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default {
  redondearMonto,
  redondearAMultiplo,
  aplicarRedondeoSunat,
  calcularIgv,
  extraerIgv,
  calcularIsc,
  calcularIcbper,
  calcularImpuestosLinea,
  calcularResumenDocumento,
  convertirMoneda,
  obtenerTasaCambioUsdPen,
  obtenerTasaCambioEurPen,
  formatearComoMoneda,
  formatearMontoEnLetras,
  validarMontoFacturacion,
  validarCoherenciaCalculos,
  calcularDescuentoPorcentaje,
  calcularDescuentoFijo
};