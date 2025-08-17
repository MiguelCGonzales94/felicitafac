/**
 * Utilidades de Dinero - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Manejo específico de cálculos monetarios y conversiones
 */

import { MONEDAS, SIMBOLOS_MONEDAS, TASAS_IMPUESTOS } from './constantes';

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

/**
 * Calcular total de factura con todos los componentes
 */
export const calcularTotal = (
  subtotal: number,
  descuentos: number = 0,
  otrosCargos: number = 0,
  aplicaIgv: boolean = true,
  tasaIgv: number = 0.18,
  aplicaIsc: boolean = false,
  tasaIsc: number = 0,
  aplicaIcbper: boolean = false,
  cantidadBolsas: number = 0
): {
  subtotal: number;
  descuentos: number;
  baseImponible: number;
  igv: number;
  isc: number;
  icbper: number;
  otrosCargos: number;
  total: number;
} => {
  // Validar inputs
  if (isNaN(subtotal) || subtotal < 0) subtotal = 0;
  if (isNaN(descuentos) || descuentos < 0) descuentos = 0;
  if (isNaN(otrosCargos) || otrosCargos < 0) otrosCargos = 0;
  if (isNaN(cantidadBolsas) || cantidadBolsas < 0) cantidadBolsas = 0;

  // Calcular base imponible (subtotal menos descuentos)
  const baseImponible = redondearMonto(subtotal - descuentos, 2);

  // Calcular ISC (si aplica, se calcula primero)
  const isc = aplicaIsc ? calcularIsc(baseImponible, tasaIsc) : 0;

  // Calcular IGV sobre base imponible + ISC
  const baseParaIgv = baseImponible + isc;
  const igv = aplicaIgv ? calcularIgv(baseParaIgv, tasaIgv) : 0;

  // Calcular ICBPER (impuesto a bolsas plásticas)
  const icbper = aplicaIcbper ? calcularIcbper(cantidadBolsas) : 0;

  // Calcular total final
  const total = redondearMonto(
    baseImponible + igv + isc + icbper + otrosCargos, 
    2
  );

  return {
    subtotal: redondearMonto(subtotal, 2),
    descuentos: redondearMonto(descuentos, 2),
    baseImponible: redondearMonto(baseImponible, 2),
    igv: redondearMonto(igv, 2),
    isc: redondearMonto(isc, 2),
    icbper: redondearMonto(icbper, 2),
    otrosCargos: redondearMonto(otrosCargos, 2),
    total
  };
};

/**
 * Calcular total simple (subtotal + IGV - descuentos)
 * Función simplificada para casos básicos
 */
export const calcularTotalSimple = (
  subtotal: number,
  descuentos: number = 0,
  aplicaIgv: boolean = true,
  tasaIgv: number = 0.18
): number => {
  const resultado = calcularTotal(subtotal, descuentos, 0, aplicaIgv, tasaIgv);
  return resultado.total;
};

/**
 * Calcular total de array de items
 * Para calcular el total de múltiples productos/servicios
 */
export const calcularTotalItems = (
  items: Array<{
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
    aplica_igv?: boolean;
    aplica_isc?: boolean;
    tasa_isc?: number;
  }>,
  descuentoGlobal: number = 0,
  otrosCargos: number = 0,
  tasaIgvDefault: number = 0.18
): {
  subtotalItems: number;
  totalDescuentosItems: number;
  totalIgvItems: number;
  totalIscItems: number;
  descuentoGlobal: number;
  otrosCargos: number;
  total: number;
  detalleItems: Array<{
    subtotal: number;
    descuento: number;
    baseImponible: number;
    igv: number;
    isc: number;
    total: number;
  }>;
} => {
  let subtotalItems = 0;
  let totalDescuentosItems = 0;
  let totalIgvItems = 0;
  let totalIscItems = 0;
  
  const detalleItems = items.map(item => {
    const subtotalItem = redondearMonto(item.cantidad * item.precio_unitario, 2);
    const descuentoItem = redondearMonto(item.descuento || 0, 2);
    const baseImponible = redondearMonto(subtotalItem - descuentoItem, 2);
    
    // Calcular ISC si aplica
    const isc = (item.aplica_isc && item.tasa_isc) 
      ? calcularIsc(baseImponible, item.tasa_isc) 
      : 0;
    
    // Calcular IGV
    const baseParaIgv = baseImponible + isc;
    const igv = (item.aplica_igv !== false) 
      ? calcularIgv(baseParaIgv, tasaIgvDefault) 
      : 0;
    
    const totalItem = redondearMonto(baseImponible + igv + isc, 2);
    
    // Acumular totales
    subtotalItems += subtotalItem;
    totalDescuentosItems += descuentoItem;
    totalIgvItems += igv;
    totalIscItems += isc;
    
    return {
      subtotal: subtotalItem,
      descuento: descuentoItem,
      baseImponible,
      igv,
      isc,
      total: totalItem
    };
  });
  
  // Calcular total final considerando descuento global y otros cargos
  const subtotalFinal = redondearMonto(subtotalItems - totalDescuentosItems, 2);
  const descuentoGlobalAplicado = redondearMonto(descuentoGlobal, 2);
  const baseImponibleFinal = redondearMonto(subtotalFinal - descuentoGlobalAplicado, 2);
  const otrosCargosAplicados = redondearMonto(otrosCargos, 2);
  
  const total = redondearMonto(
    baseImponibleFinal + totalIgvItems + totalIscItems + otrosCargosAplicados, 
    2
  );
  
  return {
    subtotalItems: redondearMonto(subtotalItems, 2),
    totalDescuentosItems: redondearMonto(totalDescuentosItems, 2),
    totalIgvItems: redondearMonto(totalIgvItems, 2),
    totalIscItems: redondearMonto(totalIscItems, 2),
    descuentoGlobal: descuentoGlobalAplicado,
    otrosCargos: otrosCargosAplicados,
    total,
    detalleItems
  };
};

/**
 * Calcular total con múltiples formas de pago
 * Para facturas que se pagan con diferentes métodos
 */
export const calcularTotalConPagos = (
  montoTotal: number,
  pagos: Array<{
    monto: number;
    metodo: string;
    fecha?: string;
  }>
): {
  montoTotal: number;
  totalPagado: number;
  saldoPendiente: number;
  pagos: Array<{
    monto: number;
    metodo: string;
    fecha?: string;
  }>;
  estaPagado: boolean;
  tieneSaldo: boolean;
} => {
  const totalPagado = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);
  const saldoPendiente = redondearMonto(montoTotal - totalPagado, 2);
  
  return {
    montoTotal: redondearMonto(montoTotal, 2),
    totalPagado: redondearMonto(totalPagado, 2),
    saldoPendiente,
    pagos: pagos.map(pago => ({
      ...pago,
      monto: redondearMonto(pago.monto, 2)
    })),
    estaPagado: saldoPendiente <= 0,
    tieneSaldo: saldoPendiente > 0
  };
};

// =======================================================
// FUNCIONES DE CÁLCULO DE MÁRGENES Y PRECIOS
// =======================================================

/**
 * Calcular margen de ganancia
 * @param precioVenta Precio de venta del producto
 * @param precioCompra Precio de compra/costo del producto
 * @param incluyeIgv Si el precio de venta incluye IGV
 * @param tasaIgv Tasa de IGV (por defecto 18%)
 * @returns Objeto con diferentes tipos de márgenes calculados
 */
export const calcularMargenGanancia = (
  precioVenta: number,
  precioCompra: number,
  incluyeIgv: boolean = true,
  tasaIgv: number = 0.18
): {
  margenBruto: number;
  margenPorcentaje: number;
  markup: number;
  precioVentaSinIgv: number;
  precioVentaConIgv: number;
  igvCalculado: number;
  utilidadBruta: number;
  esPrecioRentable: boolean;
} => {
  // Validar inputs
  if (isNaN(precioVenta) || precioVenta < 0) precioVenta = 0;
  if (isNaN(precioCompra) || precioCompra < 0) precioCompra = 0;
  
  // Calcular precio sin IGV si viene con IGV
  let precioVentaSinIgv: number;
  let precioVentaConIgv: number;
  let igvCalculado: number;
  
  if (incluyeIgv) {
    const resultado = extraerIgv(precioVenta, tasaIgv);
    precioVentaSinIgv = resultado.baseImponible;
    igvCalculado = resultado.igv;
    precioVentaConIgv = precioVenta;
  } else {
    precioVentaSinIgv = precioVenta;
    igvCalculado = calcularIgv(precioVenta, tasaIgv);
    precioVentaConIgv = redondearMonto(precioVenta + igvCalculado, 2);
  }
  
  // Calcular utilidad bruta (sobre precio sin IGV)
  const utilidadBruta = redondearMonto(precioVentaSinIgv - precioCompra, 2);
  
  // Calcular margen porcentual (utilidad / precio de venta sin IGV)
  const margenPorcentaje = precioVentaSinIgv > 0 
    ? redondearMonto((utilidadBruta / precioVentaSinIgv) * 100, 2)
    : 0;
  
  // Calcular markup (utilidad / costo)
  const markup = precioCompra > 0 
    ? redondearMonto((utilidadBruta / precioCompra) * 100, 2)
    : 0;
  
  // Determinar si es rentable (margen positivo)
  const esPrecioRentable = utilidadBruta > 0;
  
  return {
    margenBruto: utilidadBruta,
    margenPorcentaje,
    markup,
    precioVentaSinIgv: redondearMonto(precioVentaSinIgv, 2),
    precioVentaConIgv: redondearMonto(precioVentaConIgv, 2),
    igvCalculado: redondearMonto(igvCalculado, 2),
    utilidadBruta,
    esPrecioRentable
  };
};

/**
 * Calcular precio con margen específico
 * @param precioCompra Precio de compra/costo del producto
 * @param margenPorcentaje Margen deseado en porcentaje (ej: 25 para 25%)
 * @param incluyeIgvEnPrecioFinal Si el precio final debe incluir IGV
 * @param tasaIgv Tasa de IGV (por defecto 18%)
 * @returns Objeto con precios calculados
 */
export const calcularPrecioConMargen = (
  precioCompra: number,
  margenPorcentaje: number,
  incluyeIgvEnPrecioFinal: boolean = true,
  tasaIgv: number = 0.18
): {
  precioVentaSinIgv: number;
  precioVentaConIgv: number;
  margenBruto: number;
  margenPorcentaje: number;
  markup: number;
  igvCalculado: number;
  precioSugerido: number;
} => {
  // Validar inputs
  if (isNaN(precioCompra) || precioCompra < 0) precioCompra = 0;
  if (isNaN(margenPorcentaje)) margenPorcentaje = 0;
  
  // Calcular precio de venta sin IGV con el margen deseado
  // Fórmula: precio_venta = precio_compra / (1 - margen_decimal)
  const margenDecimal = margenPorcentaje / 100;
  const precioVentaSinIgv = precioCompra > 0 && margenDecimal < 1
    ? redondearMonto(precioCompra / (1 - margenDecimal), 2)
    : 0;
  
  // Calcular IGV
  const igvCalculado = calcularIgv(precioVentaSinIgv, tasaIgv);
  
  // Calcular precio con IGV
  const precioVentaConIgv = redondearMonto(precioVentaSinIgv + igvCalculado, 2);
  
  // Calcular margen bruto
  const margenBruto = redondearMonto(precioVentaSinIgv - precioCompra, 2);
  
  // Calcular markup
  const markup = precioCompra > 0 
    ? redondearMonto((margenBruto / precioCompra) * 100, 2)
    : 0;
  
  // El precio sugerido depende de si queremos incluir IGV o no
  const precioSugerido = incluyeIgvEnPrecioFinal ? precioVentaConIgv : precioVentaSinIgv;
  
  return {
    precioVentaSinIgv: redondearMonto(precioVentaSinIgv, 2),
    precioVentaConIgv: redondearMonto(precioVentaConIgv, 2),
    margenBruto: redondearMonto(margenBruto, 2),
    margenPorcentaje: redondearMonto(margenPorcentaje, 2),
    markup,
    igvCalculado: redondearMonto(igvCalculado, 2),
    precioSugerido: redondearMonto(precioSugerido, 2)
  };
};

/**
 * Calcular precio con markup específico
 * @param precioCompra Precio de compra/costo
 * @param markupPorcentaje Markup deseado en porcentaje (ej: 30 para 30% sobre el costo)
 * @param incluyeIgvEnPrecioFinal Si el precio final debe incluir IGV
 * @param tasaIgv Tasa de IGV
 * @returns Precio calculado con markup
 */
export const calcularPrecioConMarkup = (
  precioCompra: number,
  markupPorcentaje: number,
  incluyeIgvEnPrecioFinal: boolean = true,
  tasaIgv: number = 0.18
): {
  precioVentaSinIgv: number;
  precioVentaConIgv: number;
  margenBruto: number;
  margenPorcentaje: number;
  markup: number;
  igvCalculado: number;
  precioSugerido: number;
} => {
  // Validar inputs
  if (isNaN(precioCompra) || precioCompra < 0) precioCompra = 0;
  if (isNaN(markupPorcentaje)) markupPorcentaje = 0;
  
  // Calcular precio de venta sin IGV con markup
  // Fórmula: precio_venta = precio_compra * (1 + markup_decimal)
  const markupDecimal = markupPorcentaje / 100;
  const precioVentaSinIgv = redondearMonto(precioCompra * (1 + markupDecimal), 2);
  
  // Calcular IGV
  const igvCalculado = calcularIgv(precioVentaSinIgv, tasaIgv);
  
  // Calcular precio con IGV
  const precioVentaConIgv = redondearMonto(precioVentaSinIgv + igvCalculado, 2);
  
  // Calcular margen bruto
  const margenBruto = redondearMonto(precioVentaSinIgv - precioCompra, 2);
  
  // Calcular margen porcentual
  const margenPorcentaje = precioVentaSinIgv > 0 
    ? redondearMonto((margenBruto / precioVentaSinIgv) * 100, 2)
    : 0;
  
  // El precio sugerido depende de si queremos incluir IGV o no
  const precioSugerido = incluyeIgvEnPrecioFinal ? precioVentaConIgv : precioVentaSinIgv;
  
  return {
    precioVentaSinIgv: redondearMonto(precioVentaSinIgv, 2),
    precioVentaConIgv: redondearMonto(precioVentaConIgv, 2),
    margenBruto: redondearMonto(margenBruto, 2),
    margenPorcentaje,
    markup: redondearMonto(markupPorcentaje, 2),
    igvCalculado: redondearMonto(igvCalculado, 2),
    precioSugerido: redondearMonto(precioSugerido, 2)
  };
};

/**
 * Analizar múltiples precios con diferentes márgenes
 * @param precioCompra Precio de compra base
 * @param margenes Array de márgenes a analizar
 * @param incluyeIgv Si incluir IGV en análisis
 * @param tasaIgv Tasa de IGV
 * @returns Array con análisis de cada margen
 */
export const analizarMargenesMultiples = (
  precioCompra: number,
  margenes: number[],
  incluyeIgv: boolean = true,
  tasaIgv: number = 0.18
): Array<{
  margen: number;
  precioVenta: number;
  utilidad: number;
  markup: number;
  competitivo: boolean;
}> => {
  return margenes.map(margen => {
    const resultado = calcularPrecioConMargen(precioCompra, margen, incluyeIgv, tasaIgv);
    
    return {
      margen: margen,
      precioVenta: resultado.precioSugerido,
      utilidad: resultado.margenBruto,
      markup: resultado.markup,
      competitivo: margen >= 15 && margen <= 40 // Rango competitivo típico
    };
  });
};

/**
 * Calcular punto de equilibrio
 * @param precioVenta Precio de venta
 * @param costoVariable Costo variable por unidad
 * @param costosFixosMensuales Costos fijos mensuales
 * @returns Unidades necesarias para punto de equilibrio
 */
export const calcularPuntoEquilibrio = (
  precioVenta: number,
  costoVariable: number,
  costosFixosMensuales: number
): {
  unidadesEquilibrio: number;
  ventasEquilibrio: number;
  margenContribucion: number;
  margenContribucionPorcentaje: number;
} => {
  // Validar inputs
  if (isNaN(precioVenta) || precioVenta <= 0) precioVenta = 0;
  if (isNaN(costoVariable) || costoVariable < 0) costoVariable = 0;
  if (isNaN(costosFixosMensuales) || costosFixosMensuales < 0) costosFixosMensuales = 0;
  
  // Calcular margen de contribución
  const margenContribucion = redondearMonto(precioVenta - costoVariable, 2);
  const margenContribucionPorcentaje = precioVenta > 0 
    ? redondearMonto((margenContribucion / precioVenta) * 100, 2)
    : 0;
  
  // Calcular punto de equilibrio
  const unidadesEquilibrio = margenContribucion > 0 
    ? Math.ceil(costosFixosMensuales / margenContribucion)
    : 0;
  
  const ventasEquilibrio = redondearMonto(unidadesEquilibrio * precioVenta, 2);
  
  return {
    unidadesEquilibrio,
    ventasEquilibrio,
    margenContribucion,
    margenContribucionPorcentaje
  };
};

/**
 * Calcular descuento máximo permitido manteniendo margen mínimo
 * @param precioVenta Precio de venta actual
 * @param precioCompra Precio de compra
 * @param margenMinimoRequerido Margen mínimo en porcentaje
 * @param incluyeIgv Si el precio incluye IGV
 * @param tasaIgv Tasa de IGV
 * @returns Información sobre descuentos permitidos
 */
export const calcularDescuentoMaximoPermitido = (
  precioVenta: number,
  precioCompra: number,
  margenMinimoRequerido: number,
  incluyeIgv: boolean = true,
  tasaIgv: number = 0.18
): {
  descuentoMaximoPorcentaje: number;
  descuentoMaximoMonto: number;
  precioMinimoVenta: number;
  margenActual: number;
  puedeDescuento: boolean;
} => {
  // Calcular margen actual
  const margenActual = calcularMargenGanancia(precioVenta, precioCompra, incluyeIgv, tasaIgv);
  
  // Calcular precio mínimo que mantiene el margen requerido
  const precioMinimo = calcularPrecioConMargen(precioCompra, margenMinimoRequerido, incluyeIgv, tasaIgv);
  
  // Calcular descuento máximo
  const descuentoMaximoMonto = redondearMonto(precioVenta - precioMinimo.precioSugerido, 2);
  const descuentoMaximoPorcentaje = precioVenta > 0 
    ? redondearMonto((descuentoMaximoMonto / precioVenta) * 100, 2)
    : 0;
  
  return {
    descuentoMaximoPorcentaje: Math.max(0, descuentoMaximoPorcentaje),
    descuentoMaximoMonto: Math.max(0, descuentoMaximoMonto),
    precioMinimoVenta: precioMinimo.precioSugerido,
    margenActual: margenActual.margenPorcentaje,
    puedeDescuento: descuentoMaximoMonto > 0
  };
};

// =======================================================
// UTILIDADES DE VALIDACIÓN DE PRECIOS
// =======================================================

/**
 * Validar si un precio es rentable según parámetros
 * @param precioVenta Precio de venta propuesto
 * @param precioCompra Precio de compra
 * @param margenMinimoRequerido Margen mínimo requerido en porcentaje
 * @param incluyeIgv Si el precio incluye IGV
 * @returns Resultado de validación
 */
export const validarRentabilidadPrecio = (
  precioVenta: number,
  precioCompra: number,
  margenMinimoRequerido: number = 15,
  incluyeIgv: boolean = true
): {
  esRentable: boolean;
  margenActual: number;
  diferenciaNecesaria: number;
  mensaje: string;
} => {
  const margen = calcularMargenGanancia(precioVenta, precioCompra, incluyeIgv);
  const esRentable = margen.margenPorcentaje >= margenMinimoRequerido;
  const diferenciaNecesaria = margenMinimoRequerido - margen.margenPorcentaje;
  
  let mensaje = '';
  if (esRentable) {
    mensaje = `Precio rentable con margen de ${margen.margenPorcentaje}%`;
  } else {
    mensaje = `Precio no rentable. Necesita ${diferenciaNecesaria.toFixed(2)}% más de margen`;
  }
  
  return {
    esRentable,
    margenActual: margen.margenPorcentaje,
    diferenciaNecesaria: Math.max(0, diferenciaNecesaria),
    mensaje
  };
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