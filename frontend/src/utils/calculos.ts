/**
 * Utilidades de Cálculos - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Cálculos específicos para facturación SUNAT con IGV 18%
 */

import type { ItemFactura, TipoAfectacionIGV } from '../types/factura';

// =======================================================
// CONSTANTES DE CÁLCULO
// =======================================================

export const IGV_TASA = 0.18; // 18% IGV en Perú
export const PRECISION_DECIMALES = 2;
export const MAX_DIFERENCIA_REDONDEO = 0.01;

// =======================================================
// CÁLCULOS BÁSICOS DE IGV
// =======================================================

/**
 * Calcular IGV desde subtotal
 */
export const calcularIGV = (subtotal: number): number => {
  if (isNaN(subtotal) || subtotal < 0) return 0;
  
  return redondearMoneda(subtotal * IGV_TASA);
};

/**
 * Calcular subtotal desde total con IGV
 */
export const calcularSubtotalDesdeTotal = (totalConIGV: number): number => {
  if (isNaN(totalConIGV) || totalConIGV < 0) return 0;
  
  return redondearMoneda(totalConIGV / (1 + IGV_TASA));
};

/**
 * Calcular total con IGV desde subtotal
 */
export const calcularTotalConIGV = (subtotal: number): number => {
  if (isNaN(subtotal) || subtotal < 0) return 0;
  
  const igv = calcularIGV(subtotal);
  return redondearMoneda(subtotal + igv);
};

/**
 * Redondear monto a 2 decimales
 */
export const redondearMoneda = (monto: number): number => {
  if (isNaN(monto)) return 0;
  
  return Math.round((monto + Number.EPSILON) * 100) / 100;
};

// =======================================================
// CÁLCULOS DE ITEMS
// =======================================================

/**
 * Calcular totales de un item individual
 */
export const calcularTotalesItem = (
  cantidad: number,
  precioUnitario: number,
  descuento: number = 0,
  tipoAfectacionIGV: TipoAfectacionIGV = '10'
): {
  subtotal: number;
  igv: number;
  total: number;
} => {
  if (isNaN(cantidad) || isNaN(precioUnitario) || cantidad <= 0 || precioUnitario < 0) {
    return { subtotal: 0, igv: 0, total: 0 };
  }

  // Calcular subtotal base
  const subtotalBase = cantidad * precioUnitario;
  
  // Aplicar descuento
  const montoDescuento = redondearMoneda(subtotalBase * (descuento / 100));
  const subtotal = redondearMoneda(subtotalBase - montoDescuento);

  // Calcular IGV según tipo de afectación
  let igv = 0;
  
  switch (tipoAfectacionIGV) {
    case '10': // Gravado - Operación Onerosa
      igv = calcularIGV(subtotal);
      break;
    case '20': // Exonerado - Operación Onerosa
    case '30': // Inafecto - Operación Onerosa
    case '40': // Exportación
      igv = 0;
      break;
    default:
      igv = 0;
  }

  const total = redondearMoneda(subtotal + igv);

  return { subtotal, igv, total };
};

/**
 * Actualizar cálculos de un item
 */
export const actualizarCalculosItem = (item: Partial<ItemFactura>): ItemFactura => {
  const cantidad = item.cantidad || 0;
  const precioUnitario = item.precio_unitario || 0;
  const descuento = item.descuento || 0;
  const tipoAfectacionIGV = item.tipo_afectacion_igv || '10';

  const calculos = calcularTotalesItem(cantidad, precioUnitario, descuento, tipoAfectacionIGV);

  return {
    ...item,
    cantidad,
    precio_unitario: precioUnitario,
    descuento,
    tipo_afectacion_igv: tipoAfectacionIGV,
    subtotal: calculos.subtotal,
    igv: calculos.igv,
    total: calculos.total,
  } as ItemFactura;
};

// =======================================================
// CÁLCULOS DE FACTURA COMPLETA
// =======================================================

/**
 * Calcular totales de una factura completa
 */
export const calcularTotalesFactura = (
  items: ItemFactura[],
  descuentoGlobal: number = 0
): {
  subtotal: number;
  igv: number;
  total: number;
  descuentoGlobalMonto: number;
  totalItems: number;
} => {
  if (!items || items.length === 0) {
    return {
      subtotal: 0,
      igv: 0,
      total: 0,
      descuentoGlobalMonto: 0,
      totalItems: 0
    };
  }

  // Calcular totales por tipo de afectación
  let subtotalGravado = 0;
  let subtotalExonerado = 0;
  let subtotalInafecto = 0;
  let subtotalExportacion = 0;
  let igvTotal = 0;

  for (const item of items) {
    const calculosItem = calcularTotalesItem(
      item.cantidad,
      item.precio_unitario,
      item.descuento,
      item.tipo_afectacion_igv
    );

    switch (item.tipo_afectacion_igv) {
      case '10': // Gravado
        subtotalGravado += calculosItem.subtotal;
        igvTotal += calculosItem.igv;
        break;
      case '20': // Exonerado
        subtotalExonerado += calculosItem.subtotal;
        break;
      case '30': // Inafecto
        subtotalInafecto += calculosItem.subtotal;
        break;
      case '40': // Exportación
        subtotalExportacion += calculosItem.subtotal;
        break;
    }
  }

  // Totales antes del descuento global
  const subtotalSinDescuento = redondearMoneda(
    subtotalGravado + subtotalExonerado + subtotalInafecto + subtotalExportacion
  );

  // Aplicar descuento global
  const descuentoGlobalMonto = redondearMoneda(subtotalSinDescuento * (descuentoGlobal / 100));
  const subtotal = redondearMoneda(subtotalSinDescuento - descuentoGlobalMonto);

  // Recalcular IGV si hay descuento global
  let igvFinal = igvTotal;
  if (descuentoGlobal > 0 && subtotalGravado > 0) {
    const proporcionGravada = subtotalGravado / subtotalSinDescuento;
    const descuentoSobreGravado = descuentoGlobalMonto * proporcionGravada;
    const subtotalGravadoConDescuento = subtotalGravado - descuentoSobreGravado;
    igvFinal = calcularIGV(subtotalGravadoConDescuento);
  }

  const total = redondearMoneda(subtotal + igvFinal);

  return {
    subtotal,
    igv: igvFinal,
    total,
    descuentoGlobalMonto,
    totalItems: items.length
  };
};

// =======================================================
// CÁLCULOS DE DESCUENTOS
// =======================================================

/**
 * Calcular descuento en monto
 */
export const calcularDescuentoMonto = (subtotal: number, porcentajeDescuento: number): number => {
  if (isNaN(subtotal) || isNaN(porcentajeDescuento) || subtotal <= 0 || porcentajeDescuento < 0) {
    return 0;
  }

  if (porcentajeDescuento > 100) {
    porcentajeDescuento = 100;
  }

  return redondearMoneda(subtotal * (porcentajeDescuento / 100));
};

/**
 * Calcular porcentaje de descuento desde montos
 */
export const calcularPorcentajeDescuento = (subtotal: number, montoDescuento: number): number => {
  if (isNaN(subtotal) || isNaN(montoDescuento) || subtotal <= 0) {
    return 0;
  }

  const porcentaje = (montoDescuento / subtotal) * 100;
  return redondearMoneda(porcentaje);
};

// =======================================================
// VALIDACIONES DE CÁLCULOS
// =======================================================

/**
 * Validar que los cálculos son correctos
 */
export const validarCalculos = (
  subtotal: number,
  igv: number,
  total: number
): {
  valido: boolean;
  errores: string[];
} => {
  const errores: string[] = [];

  // Validar que los valores sean números válidos
  if (isNaN(subtotal) || subtotal < 0) {
    errores.push('El subtotal debe ser un número válido mayor o igual a cero');
  }

  if (isNaN(igv) || igv < 0) {
    errores.push('El IGV debe ser un número válido mayor o igual a cero');
  }

  if (isNaN(total) || total < 0) {
    errores.push('El total debe ser un número válido mayor o igual a cero');
  }

  // Validar relación entre subtotal, IGV y total
  const totalCalculado = redondearMoneda(subtotal + igv);
  const diferencia = Math.abs(total - totalCalculado);

  if (diferencia > MAX_DIFERENCIA_REDONDEO) {
    errores.push(`Inconsistencia en cálculos: Total esperado ${totalCalculado}, total actual ${total}`);
  }

  // Validar cálculo de IGV
  if (subtotal > 0) {
    const igvCalculado = calcularIGV(subtotal);
    const diferenciaIGV = Math.abs(igv - igvCalculado);

    if (diferenciaIGV > MAX_DIFERENCIA_REDONDEO) {
      errores.push(`IGV incorrecto: Esperado ${igvCalculado}, actual ${igv}`);
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Validar item individual
 */
export const validarCalculosItem = (item: ItemFactura): {
  valido: boolean;
  errores: string[];
} => {
  const errores: string[] = [];

  // Validar campos requeridos
  if (!item.cantidad || item.cantidad <= 0) {
    errores.push('La cantidad debe ser mayor a cero');
  }

  if (!item.precio_unitario || item.precio_unitario < 0) {
    errores.push('El precio unitario debe ser mayor o igual a cero');
  }

  if (item.descuento < 0 || item.descuento > 100) {
    errores.push('El descuento debe estar entre 0% y 100%');
  }

  // Validar cálculos si los campos básicos son válidos
  if (errores.length === 0) {
    const calculosEsperados = calcularTotalesItem(
      item.cantidad,
      item.precio_unitario,
      item.descuento,
      item.tipo_afectacion_igv
    );

    const diferencias = {
      subtotal: Math.abs(item.subtotal - calculosEsperados.subtotal),
      igv: Math.abs(item.igv - calculosEsperados.igv),
      total: Math.abs(item.total - calculosEsperados.total)
    };

    if (diferencias.subtotal > MAX_DIFERENCIA_REDONDEO) {
      errores.push(`Subtotal incorrecto en item: Esperado ${calculosEsperados.subtotal}, actual ${item.subtotal}`);
    }

    if (diferencias.igv > MAX_DIFERENCIA_REDONDEO) {
      errores.push(`IGV incorrecto en item: Esperado ${calculosEsperados.igv}, actual ${item.igv}`);
    }

    if (diferencias.total > MAX_DIFERENCIA_REDONDEO) {
      errores.push(`Total incorrecto en item: Esperado ${calculosEsperados.total}, actual ${item.total}`);
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

// =======================================================
// UTILIDADES DE CONVERSIÓN
// =======================================================

/**
 * Convertir precio sin IGV a precio con IGV
 */
export const convertirPrecioSinIGVaConIGV = (precioSinIGV: number): number => {
  if (isNaN(precioSinIGV) || precioSinIGV < 0) return 0;
  
  return redondearMoneda(precioSinIGV * (1 + IGV_TASA));
};

/**
 * Convertir precio con IGV a precio sin IGV
 */
export const convertirPrecioConIGVaSinIGV = (precioConIGV: number): number => {
  if (isNaN(precioConIGV) || precioConIGV < 0) return 0;
  
  return redondearMoneda(precioConIGV / (1 + IGV_TASA));
};

/**
 * Calcular margen de ganancia
 */
export const calcularMargenGanancia = (
  precioVenta: number,
  costo: number
): {
  margenBruto: number;
  margenPorcentaje: number;
} => {
  if (isNaN(precioVenta) || isNaN(costo) || costo <= 0) {
    return { margenBruto: 0, margenPorcentaje: 0 };
  }

  const margenBruto = redondearMoneda(precioVenta - costo);
  const margenPorcentaje = redondearMoneda((margenBruto / costo) * 100);

  return { margenBruto, margenPorcentaje };
};

// =======================================================
// CÁLCULOS PARA REPORTES
// =======================================================

/**
 * Agrupar ventas por período
 */
export const agruparVentasPorPeriodo = (
  ventas: Array<{ fecha: string; total: number }>,
  periodo: 'dia' | 'semana' | 'mes'
): Array<{ periodo: string; total: number; cantidad: number }> => {
  const grupos = new Map<string, { total: number; cantidad: number }>();

  for (const venta of ventas) {
    const fecha = new Date(venta.fecha);
    let clavePeriodo: string;

    switch (periodo) {
      case 'dia':
        clavePeriodo = fecha.toISOString().split('T')[0];
        break;
      case 'semana':
        const inicioSemana = new Date(fecha);
        inicioSemana.setDate(fecha.getDate() - fecha.getDay());
        clavePeriodo = inicioSemana.toISOString().split('T')[0];
        break;
      case 'mes':
        clavePeriodo = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      default:
        clavePeriodo = fecha.toISOString().split('T')[0];
    }

    const grupo = grupos.get(clavePeriodo) || { total: 0, cantidad: 0 };
    grupo.total = redondearMoneda(grupo.total + venta.total);
    grupo.cantidad += 1;
    grupos.set(clavePeriodo, grupo);
  }

  return Array.from(grupos.entries()).map(([periodo, datos]) => ({
    periodo,
    total: datos.total,
    cantidad: datos.cantidad
  })).sort((a, b) => a.periodo.localeCompare(b.periodo));
};

/**
 * Calcular estadísticas de ventas
 */
export const calcularEstadisticasVentas = (
  ventas: Array<{ total: number }>
): {
  totalVentas: number;
  promedioVenta: number;
  ventaMaxima: number;
  ventaMinima: number;
  cantidadVentas: number;
} => {
  if (!ventas || ventas.length === 0) {
    return {
      totalVentas: 0,
      promedioVenta: 0,
      ventaMaxima: 0,
      ventaMinima: 0,
      cantidadVentas: 0
    };
  }

  const totales = ventas.map(v => v.total);
  const totalVentas = redondearMoneda(totales.reduce((sum, total) => sum + total, 0));
  const promedioVenta = redondearMoneda(totalVentas / ventas.length);
  const ventaMaxima = Math.max(...totales);
  const ventaMinima = Math.min(...totales);

  return {
    totalVentas,
    promedioVenta,
    ventaMaxima,
    ventaMinima,
    cantidadVentas: ventas.length
  };
};