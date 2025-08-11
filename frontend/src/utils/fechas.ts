/**
 * Utilidades de Fechas - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Manejo de fechas específico para zona horaria peruana
 */

import { CONFIGURACION_SISTEMA } from './constants';

// =======================================================
// TIPOS PARA FECHAS
// =======================================================

export interface RangoFechas {
  inicio: Date;
  fin: Date;
}

export interface ConfiguracionFecha {
  zonaHoraria?: string;
  incluirHora?: boolean;
  formato?: string;
}

export interface PeriodoContable {
  año: number;
  mes: number;
  fechaInicio: Date;
  fechaFin: Date;
  nombreMes: string;
  esPeriodoCerrado: boolean;
}

export interface FestivosPeruanos {
  fecha: Date;
  nombre: string;
  tipo: 'nacional' | 'religioso' | 'civico';
}

// =======================================================
// CONSTANTES DE FECHAS
// =======================================================

const ZONA_HORARIA_PERU = CONFIGURACION_SISTEMA.TIMEZONE;

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const NOMBRES_DIAS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

const NOMBRES_MESES_CORTOS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// =======================================================
// FUNCIONES BÁSICAS DE FECHA
// =======================================================

/**
 * Obtener fecha actual en zona horaria peruana
 */
export const obtenerFechaActual = (): Date => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: ZONA_HORARIA_PERU }));
};

/**
 * Obtener solo la fecha (sin hora) en zona peruana
 */
export const obtenerSoloFecha = (fecha?: Date): Date => {
  const fechaBase = fecha || obtenerFechaActual();
  const fechaSolo = new Date(fechaBase);
  fechaSolo.setHours(0, 0, 0, 0);
  return fechaSolo;
};

/**
 * Convertir fecha a zona horaria peruana
 */
export const convertirAZonaPeruana = (fecha: Date): Date => {
  return new Date(fecha.toLocaleString('en-US', { timeZone: ZONA_HORARIA_PERU }));
};

/**
 * Parsear fecha desde string
 */
export const parsearFecha = (fechaString: string): Date | null => {
  if (!fechaString) return null;

  // Intentar diferentes formatos
  const formatos = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
  ];

  let fechaParseada: Date;

  // DD/MM/YYYY o DD-MM-YYYY
  if (formatos[1].test(fechaString) || formatos[2].test(fechaString)) {
    const separador = fechaString.includes('/') ? '/' : '-';
    const [dia, mes, año] = fechaString.split(separador).map(Number);
    fechaParseada = new Date(año, mes - 1, dia);
  } else {
    fechaParseada = new Date(fechaString);
  }

  return isNaN(fechaParseada.getTime()) ? null : fechaParseada;
};

/**
 * Verificar si fecha es válida
 */
export const esFechaValida = (fecha: any): fecha is Date => {
  return fecha instanceof Date && !isNaN(fecha.getTime());
};

// =======================================================
// FORMATEO DE FECHAS
// =======================================================

/**
 * Formatear fecha para mostrar en interfaz
 */
export const formatearFechaParaMostrar = (
  fecha: Date,
  incluirHora = false,
  formatoCorto = false
): string => {
  if (!esFechaValida(fecha)) return '';

  const opciones: Intl.DateTimeFormatOptions = {
    timeZone: ZONA_HORARIA_PERU,
    day: '2-digit',
    month: formatoCorto ? '2-digit' : 'long',
    year: 'numeric'
  };

  if (incluirHora) {
    opciones.hour = '2-digit';
    opciones.minute = '2-digit';
    opciones.hour12 = false;
  }

  return fecha.toLocaleDateString('es-PE', opciones);
};

/**
 * Formatear fecha para SUNAT (YYYY-MM-DD)
 */
export const formatearFechaParaSunat = (fecha: Date): string => {
  if (!esFechaValida(fecha)) return '';

  const año = fecha.getFullYear();
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');

  return `${año}-${mes}-${dia}`;
};

/**
 * Formatear hora para SUNAT (HH:mm:ss)
 */
export const formatearHoraParaSunat = (fecha: Date): string => {
  if (!esFechaValida(fecha)) return '';

  const horas = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  const segundos = fecha.getSeconds().toString().padStart(2, '0');

  return `${horas}:${minutos}:${segundos}`;
};

/**
 * Formatear fecha y hora para SUNAT (YYYY-MM-DDTHH:mm:ss)
 */
export const formatearFechaHoraParaSunat = (fecha: Date): string => {
  if (!esFechaValida(fecha)) return '';

  const fechaStr = formatearFechaParaSunat(fecha);
  const horaStr = formatearHoraParaSunat(fecha);

  return `${fechaStr}T${horaStr}`;
};

/**
 * Formatear fecha relativa (hace X días, etc.)
 */
export const formatearFechaRelativa = (fecha: Date): string => {
  if (!esFechaValida(fecha)) return '';

  const ahora = obtenerFechaActual();
  const diferenciaMs = ahora.getTime() - fecha.getTime();
  const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

  if (diferenciaDias === 0) {
    return 'Hoy';
  } else if (diferenciaDias === 1) {
    return 'Ayer';
  } else if (diferenciaDias === -1) {
    return 'Mañana';
  } else if (diferenciaDias > 1 && diferenciaDias <= 7) {
    return `Hace ${diferenciaDias} días`;
  } else if (diferenciaDias < -1 && diferenciaDias >= -7) {
    return `En ${Math.abs(diferenciaDias)} días`;
  } else {
    return formatearFechaParaMostrar(fecha, false, true);
  }
};

// =======================================================
// OPERACIONES CON FECHAS
// =======================================================

/**
 * Agregar días a una fecha
 */
export const agregarDias = (fecha: Date, dias: number): Date => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);
  return nuevaFecha;
};

/**
 * Agregar meses a una fecha
 */
export const agregarMeses = (fecha: Date, meses: number): Date => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
  return nuevaFecha;
};

/**
 * Agregar años a una fecha
 */
export const agregarAños = (fecha: Date, años: number): Date => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setFullYear(nuevaFecha.getFullYear() + años);
  return nuevaFecha;
};

/**
 * Obtener primer día del mes
 */
export const obtenerPrimerDiaMes = (fecha: Date): Date => {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
};

/**
 * Obtener último día del mes
 */
export const obtenerUltimoDiaMes = (fecha: Date): Date => {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
};

/**
 * Obtener primer día del año
 */
export const obtenerPrimerDiaAño = (fecha: Date): Date => {
  return new Date(fecha.getFullYear(), 0, 1);
};

/**
 * Obtener último día del año
 */
export const obtenerUltimoDiaAño = (fecha: Date): Date => {
  return new Date(fecha.getFullYear(), 11, 31);
};

// =======================================================
// CÁLCULOS Y COMPARACIONES
// =======================================================

/**
 * Calcular diferencia en días
 */
export const calcularDiferenciaDias = (fecha1: Date, fecha2: Date): number => {
  const unDia = 24 * 60 * 60 * 1000;
  return Math.round((fecha2.getTime() - fecha1.getTime()) / unDia);
};

/**
 * Calcular diferencia en meses
 */
export const calcularDiferenciaMeses = (fecha1: Date, fecha2: Date): number => {
  return (fecha2.getFullYear() - fecha1.getFullYear()) * 12 + (fecha2.getMonth() - fecha1.getMonth());
};

/**
 * Calcular diferencia en años
 */
export const calcularDiferenciaAños = (fecha1: Date, fecha2: Date): number => {
  return fecha2.getFullYear() - fecha1.getFullYear();
};

/**
 * Verificar si fecha es de hoy
 */
export const esFechaHoy = (fecha: Date): boolean => {
  const hoy = obtenerSoloFecha();
  const fechaComparar = obtenerSoloFecha(fecha);
  return hoy.getTime() === fechaComparar.getTime();
};

/**
 * Verificar si fecha es de ayer
 */
export const esFechaAyer = (fecha: Date): boolean => {
  const ayer = agregarDias(obtenerSoloFecha(), -1);
  const fechaComparar = obtenerSoloFecha(fecha);
  return ayer.getTime() === fechaComparar.getTime();
};

/**
 * Verificar si fecha está en rango
 */
export const estaEnRango = (fecha: Date, inicio: Date, fin: Date): boolean => {
  return fecha >= inicio && fecha <= fin;
};

/**
 * Verificar si es fin de semana
 */
export const esFinDeSemana = (fecha: Date): boolean => {
  const dia = fecha.getDay();
  return dia === 0 || dia === 6; // Domingo o Sábado
};

/**
 * Verificar si es día hábil
 */
export const esDiaHabil = (fecha: Date): boolean => {
  return !esFinDeSemana(fecha) && !esFeriado(fecha);
};

// =======================================================
// RANGOS DE FECHAS PREDEFINIDOS
// =======================================================

/**
 * Obtener rango de fechas para diferentes períodos
 */
export const obtenerRangoFechas = (periodo: string): RangoFechas => {
  const hoy = obtenerSoloFecha();
  
  switch (periodo.toLowerCase()) {
    case 'hoy':
      return {
        inicio: hoy,
        fin: new Date(hoy.getTime() + (24 * 60 * 60 * 1000) - 1)
      };
    
    case 'ayer':
      const ayer = agregarDias(hoy, -1);
      return {
        inicio: ayer,
        fin: new Date(ayer.getTime() + (24 * 60 * 60 * 1000) - 1)
      };
    
    case 'esta_semana':
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      return {
        inicio: inicioSemana,
        fin: agregarDias(inicioSemana, 6)
      };
    
    case 'semana_pasada':
      const inicioSemanaP = new Date(hoy);
      inicioSemanaP.setDate(hoy.getDate() - hoy.getDay() - 7);
      return {
        inicio: inicioSemanaP,
        fin: agregarDias(inicioSemanaP, 6)
      };
    
    case 'este_mes':
      return {
        inicio: obtenerPrimerDiaMes(hoy),
        fin: obtenerUltimoDiaMes(hoy)
      };
    
    case 'mes_pasado':
      const mesAnterior = agregarMeses(hoy, -1);
      return {
        inicio: obtenerPrimerDiaMes(mesAnterior),
        fin: obtenerUltimoDiaMes(mesAnterior)
      };
    
    case 'este_año':
      return {
        inicio: obtenerPrimerDiaAño(hoy),
        fin: obtenerUltimoDiaAño(hoy)
      };
    
    case 'año_pasado':
      const añoAnterior = agregarAños(hoy, -1);
      return {
        inicio: obtenerPrimerDiaAño(añoAnterior),
        fin: obtenerUltimoDiaAño(añoAnterior)
      };
    
    case 'ultimos_7_dias':
      return {
        inicio: agregarDias(hoy, -6),
        fin: hoy
      };
    
    case 'ultimos_30_dias':
      return {
        inicio: agregarDias(hoy, -29),
        fin: hoy
      };
    
    case 'ultimos_90_dias':
      return {
        inicio: agregarDias(hoy, -89),
        fin: hoy
      };
    
    default:
      return {
        inicio: hoy,
        fin: hoy
      };
  }
};

// =======================================================
// PERÍODOS CONTABLES
// =======================================================

/**
 * Obtener período contable actual
 */
export const obtenerPeriodoContableActual = (): PeriodoContable => {
  const hoy = obtenerFechaActual();
  return obtenerPeriodoContable(hoy.getFullYear(), hoy.getMonth() + 1);
};

/**
 * Obtener período contable específico
 */
export const obtenerPeriodoContable = (año: number, mes: number): PeriodoContable => {
  const fechaInicio = new Date(año, mes - 1, 1);
  const fechaFin = obtenerUltimoDiaMes(fechaInicio);
  
  return {
    año,
    mes,
    fechaInicio,
    fechaFin,
    nombreMes: NOMBRES_MESES[mes - 1],
    esPeriodoCerrado: fechaFin < obtenerFechaActual()
  };
};

/**
 * Obtener períodos contables de un año
 */
export const obtenerPeriodosContablesAño = (año: number): PeriodoContable[] => {
  const periodos: PeriodoContable[] = [];
  
  for (let mes = 1; mes <= 12; mes++) {
    periodos.push(obtenerPeriodoContable(año, mes));
  }
  
  return periodos;
};

// =======================================================
// FERIADOS Y DÍAS ESPECIALES
// =======================================================

/**
 * Obtener feriados de Perú para un año
 */
export const obtenerFeriadosPeruanos = (año: number): FestivosPeruanos[] => {
  const feriados: FestivosPeruanos[] = [
    // Feriados fijos
    { fecha: new Date(año, 0, 1), nombre: 'Año Nuevo', tipo: 'nacional' },
    { fecha: new Date(año, 4, 1), nombre: 'Día del Trabajo', tipo: 'nacional' },
    { fecha: new Date(año, 5, 29), nombre: 'Día de San Pedro y San Pablo', tipo: 'religioso' },
    { fecha: new Date(año, 6, 28), nombre: 'Día de la Independencia', tipo: 'nacional' },
    { fecha: new Date(año, 6, 29), nombre: 'Día de la Independencia', tipo: 'nacional' },
    { fecha: new Date(año, 7, 30), nombre: 'Día de Santa Rosa de Lima', tipo: 'religioso' },
    { fecha: new Date(año, 9, 8), nombre: 'Combate de Angamos', tipo: 'civico' },
    { fecha: new Date(año, 10, 1), nombre: 'Día de Todos los Santos', tipo: 'religioso' },
    { fecha: new Date(año, 11, 8), nombre: 'Inmaculada Concepción', tipo: 'religioso' },
    { fecha: new Date(año, 11, 25), nombre: 'Navidad', tipo: 'religioso' },
  ];

  // Agregar feriados variables (Semana Santa)
  const pascua = calcularPascua(año);
  feriados.push(
    { fecha: agregarDias(pascua, -3), nombre: 'Jueves Santo', tipo: 'religioso' },
    { fecha: agregarDias(pascua, -2), nombre: 'Viernes Santo', tipo: 'religioso' }
  );

  return feriados.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
};

/**
 * Calcular fecha de Pascua (algoritmo de Gauss)
 */
const calcularPascua = (año: number): Date => {
  const a = año % 19;
  const b = Math.floor(año / 100);
  const c = año % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(año, mes - 1, dia);
};

/**
 * Verificar si una fecha es feriado en Perú
 */
export const esFeriado = (fecha: Date): boolean => {
  const feriados = obtenerFeriadosPeruanos(fecha.getFullYear());
  return feriados.some(feriado => 
    feriado.fecha.getTime() === obtenerSoloFecha(fecha).getTime()
  );
};

// =======================================================
// UTILIDADES DE VALIDACIÓN
// =======================================================

/**
 * Validar fecha para facturación electrónica SUNAT
 */
export const validarFechaFacturacion = (fecha: Date): { valido: boolean; mensaje?: string } => {
  const hoy = obtenerSoloFecha();
  const fechaComparar = obtenerSoloFecha(fecha);

  // No puede ser futura
  if (fechaComparar > hoy) {
    return { valido: false, mensaje: 'La fecha no puede ser futura' };
  }

  // No más de 7 días atrás
  const hace7Dias = agregarDias(hoy, -7);
  if (fechaComparar < hace7Dias) {
    return { valido: false, mensaje: 'La fecha no puede ser mayor a 7 días atrás' };
  }

  return { valido: true };
};

/**
 * Validar fecha de vencimiento
 */
export const validarFechaVencimiento = (
  fechaVencimiento: Date,
  fechaEmision: Date
): { valido: boolean; mensaje?: string } => {
  const vencimiento = obtenerSoloFecha(fechaVencimiento);
  const emision = obtenerSoloFecha(fechaEmision);

  if (vencimiento < emision) {
    return { valido: false, mensaje: 'La fecha de vencimiento no puede ser anterior a la fecha de emisión' };
  }

  return { valido: true };
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default {
  obtenerFechaActual,
  obtenerSoloFecha,
  convertirAZonaPeruana,
  parsearFecha,
  esFechaValida,
  formatearFechaParaMostrar,
  formatearFechaParaSunat,
  formatearHoraParaSunat,
  formatearFechaHoraParaSunat,
  formatearFechaRelativa,
  agregarDias,
  agregarMeses,
  agregarAños,
  obtenerPrimerDiaMes,
  obtenerUltimoDiaMes,
  obtenerPrimerDiaAño,
  obtenerUltimoDiaAño,
  calcularDiferenciaDias,
  calcularDiferenciaMeses,
  calcularDiferenciaAños,
  esFechaHoy,
  esFechaAyer,
  estaEnRango,
  esFinDeSemana,
  esDiaHabil,
  obtenerRangoFechas,
  obtenerPeriodoContableActual,
  obtenerPeriodoContable,
  obtenerPeriodosContablesAño,
  obtenerFeriadosPeruanos,
  esFeriado,
  validarFechaFacturacion,
  validarFechaVencimiento,
  NOMBRES_MESES,
  NOMBRES_DIAS,
  NOMBRES_MESES_CORTOS
};