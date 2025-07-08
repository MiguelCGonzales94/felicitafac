/**
 * Utilidades de Formateo - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Funciones para formatear datos según estándares peruanos
 */

// =======================================================
// FORMATEO DE MONEDA
// =======================================================

/**
 * Formatea un número como moneda peruana
 */
export const formatearMoneda = (
  amount: number,
  currency: string = 'PEN',
  showCurrency: boolean = true,
  decimals: number = 2
): string => {
  try {
    const formatter = new Intl.NumberFormat('es-PE', {
      style: showCurrency ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    return formatter.format(amount);
  } catch (error) {
    console.error('Error formateando moneda:', error);
    return `S/ ${amount.toFixed(decimals)}`;
  }
};

/**
 * Formatea moneda en formato compacto (K, M, B)
 */
export const formatearMonedaCompacta = (amount: number, currency: string = 'PEN'): string => {
  try {
    const formatter = new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      notation: 'compact',
      compactDisplay: 'short'
    });

    return formatter.format(amount);
  } catch (error) {
    console.error('Error formateando moneda compacta:', error);
    
    if (amount >= 1000000000) {
      return `S/ ${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `S/ ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `S/ ${(amount / 1000).toFixed(1)}K`;
    }
    
    return formatearMoneda(amount, currency);
  }
};

// =======================================================
// FORMATEO DE FECHAS
// =======================================================

/**
 * Formatea una fecha según el formato peruano
 */
export const formatearFecha = (
  date: Date | string,
  formato: 'corto' | 'largo' | 'completo' | 'hora' | 'fecha-hora' = 'corto'
): string => {
  try {
    const fecha = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(fecha.getTime())) {
      return 'Fecha inválida';
    }

    const opciones: Intl.DateTimeFormatOptions = {};

    switch (formato) {
      case 'corto':
        opciones.day = '2-digit';
        opciones.month = '2-digit';
        opciones.year = 'numeric';
        break;
      case 'largo':
        opciones.day = 'numeric';
        opciones.month = 'long';
        opciones.year = 'numeric';
        break;
      case 'completo':
        opciones.weekday = 'long';
        opciones.day = 'numeric';
        opciones.month = 'long';
        opciones.year = 'numeric';
        break;
      case 'hora':
        opciones.hour = '2-digit';
        opciones.minute = '2-digit';
        opciones.second = '2-digit';
        opciones.hour12 = false;
        break;
      case 'fecha-hora':
        opciones.day = '2-digit';
        opciones.month = '2-digit';
        opciones.year = 'numeric';
        opciones.hour = '2-digit';
        opciones.minute = '2-digit';
        opciones.hour12 = false;
        break;
    }

    return fecha.toLocaleDateString('es-PE', opciones);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Error de fecha';
  }
};

/**
 * Formatea fecha relativa (hace X tiempo)
 */
export const formatearFechaRelativa = (date: Date | string): string => {
  try {
    const fecha = typeof date === 'string' ? new Date(date) : date;
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();

    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);
    const semanas = Math.floor(diferencia / 604800000);
    const meses = Math.floor(diferencia / 2629746000);
    const años = Math.floor(diferencia / 31556952000);

    if (diferencia < 60000) return 'Ahora mismo';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    if (semanas < 4) return `Hace ${semanas} semana${semanas > 1 ? 's' : ''}`;
    if (meses < 12) return `Hace ${meses} mes${meses > 1 ? 'es' : ''}`;
    return `Hace ${años} año${años > 1 ? 's' : ''}`;
  } catch (error) {
    console.error('Error formateando fecha relativa:', error);
    return 'Fecha inválida';
  }
};

// =======================================================
// FORMATEO DE NÚMEROS
// =======================================================

/**
 * Formatea un número con separadores de miles
 */
export const formatearNumero = (
  number: number,
  decimals: number = 0,
  showSign: boolean = false
): string => {
  try {
    const formatter = new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      signDisplay: showSign ? 'exceptZero' : 'auto'
    });

    return formatter.format(number);
  } catch (error) {
    console.error('Error formateando número:', error);
    return number.toString();
  }
};

/**
 * Formatea un porcentaje
 */
export const formatearPorcentaje = (
  number: number,
  decimals: number = 1,
  showSign: boolean = false
): string => {
  try {
    const formatter = new Intl.NumberFormat('es-PE', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      signDisplay: showSign ? 'exceptZero' : 'auto'
    });

    return formatter.format(number / 100);
  } catch (error) {
    console.error('Error formateando porcentaje:', error);
    return `${number.toFixed(decimals)}%`;
  }
};

// =======================================================
// FORMATEO DE DOCUMENTOS PERUANOS
// =======================================================

/**
 * Formatea un DNI peruano
 */
export const formatearDNI = (dni: string): string => {
  if (!dni) return '';
  
  // Remover todos los caracteres no numéricos
  const numeroLimpio = dni.replace(/\D/g, '');
  
  // Formatear como XX XXX XXX
  if (numeroLimpio.length === 8) {
    return numeroLimpio.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return numeroLimpio;
};

/**
 * Formatea un RUC peruano
 */
export const formatearRUC = (ruc: string): string => {
  if (!ruc) return '';
  
  // Remover todos los caracteres no numéricos
  const numeroLimpio = ruc.replace(/\D/g, '');
  
  // Formatear como XXXXXXXXXXX
  if (numeroLimpio.length === 11) {
    return numeroLimpio.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1$2$3$4');
  }
  
  return numeroLimpio;
};

/**
 * Formatea número de teléfono peruano
 */
export const formatearTelefono = (telefono: string): string => {
  if (!telefono) return '';
  
  // Remover todos los caracteres no numéricos
  const numeroLimpio = telefono.replace(/\D/g, '');
  
  // Formatear según longitud
  if (numeroLimpio.length === 9) {
    // Celular: XXX XXX XXX
    return numeroLimpio.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  } else if (numeroLimpio.length === 7) {
    // Fijo Lima: XXX XXXX
    return numeroLimpio.replace(/(\d{3})(\d{4})/, '$1 $2');
  } else if (numeroLimpio.length === 8) {
    // Fijo provincias: XX XX XXXX
    return numeroLimpio.replace(/(\d{2})(\d{2})(\d{4})/, '$1 $2 $3');
  }
  
  return numeroLimpio;
};

// =======================================================
// FORMATEO DE TEXTO
// =======================================================

/**
 * Capitaliza la primera letra de cada palabra
 */
export const formatearNombrePropio = (texto: string): string => {
  if (!texto) return '';
  
  return texto
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
};

/**
 * Trunca un texto a un número máximo de caracteres
 */
export const truncarTexto = (texto: string, maxLength: number, sufijo: string = '...'): string => {
  if (!texto) return '';
  
  if (texto.length <= maxLength) return texto;
  
  return texto.substring(0, maxLength - sufijo.length) + sufijo;
};

/**
 * Formatea un email para mostrar parcialmente oculto
 */
export const formatearEmailPrivado = (email: string): string => {
  if (!email) return '';
  
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  
  if (local.length <= 3) {
    return `${local[0]}***@${domain}`;
  }
  
  const inicio = local.substring(0, 2);
  const fin = local.substring(local.length - 1);
  return `${inicio}***${fin}@${domain}`;
};

// =======================================================
// FORMATEO DE ARCHIVOS Y TAMAÑOS
// =======================================================

/**
 * Formatea el tamaño de un archivo
 */
export const formatearTamañoArchivo = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// =======================================================
// VALIDADORES Y PARSERS
// =======================================================

/**
 * Convierte un string de moneda a número
 */
export const parsearMoneda = (monedaString: string): number => {
  if (!monedaString) return 0;
  
  // Remover símbolos de moneda y espacios
  const numeroLimpio = monedaString
    .replace(/[S\/\$\s,]/g, '')
    .replace(/\./g, '');
  
  return parseFloat(numeroLimpio) || 0;
};

/**
 * Valida si un string es un número válido
 */
export const esNumeroValido = (valor: string): boolean => {
  return !isNaN(Number(valor)) && valor.trim() !== '';
};

// =======================================================
// EXPORTACIONES AGRUPADAS
// =======================================================

export const formateoMoneda = {
  formatear: formatearMoneda,
  compacta: formatearMonedaCompacta,
  parsear: parsearMoneda
};

export const formateoFecha = {
  formatear: formatearFecha,
  relativa: formatearFechaRelativa
};

export const formateoNumero = {
  formatear: formatearNumero,
  porcentaje: formatearPorcentaje,
  archivo: formatearTamañoArchivo
};

export const formateoDocumento = {
  dni: formatearDNI,
  ruc: formatearRUC,
  telefono: formatearTelefono
};

export const formateoTexto = {
  nombrePropio: formatearNombrePropio,
  truncar: truncarTexto,
  emailPrivado: formatearEmailPrivado
};

export default {
  moneda: formateoMoneda,
  fecha: formateoFecha,
  numero: formateoNumero,
  documento: formateoDocumento,
  texto: formateoTexto
};