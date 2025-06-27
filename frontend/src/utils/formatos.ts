/**
 * Utilidades de Formateo - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Formatos específicos para Perú: moneda, fechas, documentos
 */

// =======================================================
// FORMATEO DE MONEDA PERUANA
// =======================================================

/**
 * Formatear número como moneda peruana (PEN)
 */
export const formatearMoneda = (
  monto: number | string,
  opciones: {
    incluirSimbolo?: boolean;
    precision?: number;
    separadorMiles?: string;
    separadorDecimal?: string;
  } = {}
): string => {
  const {
    incluirSimbolo = true,
    precision = 2,
    separadorMiles = ',',
    separadorDecimal = '.'
  } = opciones;

  // Convertir a número si es string
  const numero = typeof monto === 'string' ? parseFloat(monto) : monto;

  if (isNaN(numero)) {
    return incluirSimbolo ? 'S/ 0.00' : '0.00';
  }

  // Formatear con precisión especificada
  const numeroFormateado = numero.toFixed(precision);
  const [entero, decimal] = numeroFormateado.split('.');

  // Agregar separador de miles
  const enteroConSeparadores = entero.replace(/\B(?=(\d{3})+(?!\d))/g, separadorMiles);

  // Construir resultado
  let resultado = decimal ? `${enteroConSeparadores}${separadorDecimal}${decimal}` : enteroConSeparadores;

  if (incluirSimbolo) {
    resultado = `S/ ${resultado}`;
  }

  return resultado;
};

/**
 * Formatear monto en letras (para facturas)
 */
export const formatearMontoEnLetras = (monto: number): string => {
  if (isNaN(monto) || monto < 0) {
    return 'CERO CON 00/100 SOLES';
  }

  const entero = Math.floor(monto);
  const decimales = Math.round((monto - entero) * 100);

  const enteroEnLetras = numeroALetras(entero);
  const decimalesFormateados = decimales.toString().padStart(2, '0');

  return `${enteroEnLetras} CON ${decimalesFormateados}/100 SOLES`;
};

/**
 * Convertir número a letras
 */
const numeroALetras = (numero: number): string => {
  if (numero === 0) return 'CERO';

  const unidades = [
    '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
    'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'
  ];

  const decenas = [
    '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
  ];

  const centenas = [
    '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
    'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
  ];

  if (numero < 20) {
    return unidades[numero];
  }

  if (numero < 100) {
    const d = Math.floor(numero / 10);
    const u = numero % 10;
    if (numero <= 29) {
      return u === 0 ? decenas[d] : `VEINTI${unidades[u]}`;
    }
    return u === 0 ? decenas[d] : `${decenas[d]} Y ${unidades[u]}`;
  }

  if (numero < 1000) {
    const c = Math.floor(numero / 100);
    const resto = numero % 100;
    if (numero === 100) return 'CIEN';
    return resto === 0 ? centenas[c] : `${centenas[c]} ${numeroALetras(resto)}`;
  }

  if (numero < 1000000) {
    const miles = Math.floor(numero / 1000);
    const resto = numero % 1000;
    const milesTexto = miles === 1 ? 'MIL' : `${numeroALetras(miles)} MIL`;
    return resto === 0 ? milesTexto : `${milesTexto} ${numeroALetras(resto)}`;
  }

  if (numero < 1000000000) {
    const millones = Math.floor(numero / 1000000);
    const resto = numero % 1000000;
    const millonesTexto = millones === 1 ? 'UN MILLÓN' : `${numeroALetras(millones)} MILLONES`;
    return resto === 0 ? millonesTexto : `${millonesTexto} ${numeroALetras(resto)}`;
  }

  return 'NÚMERO DEMASIADO GRANDE';
};

// =======================================================
// FORMATEO DE FECHAS
// =======================================================

/**
 * Formatear fecha en formato peruano (dd/mm/yyyy)
 */
export const formatearFecha = (
  fecha: string | Date,
  opciones: {
    incluirHora?: boolean;
    formato?: 'corto' | 'largo' | 'iso';
    soloFecha?: boolean;
  } = {}
): string => {
  const {
    incluirHora = false,
    formato = 'corto',
    soloFecha = false
  } = opciones;

  if (!fecha) return '';

  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

  if (isNaN(fechaObj.getTime())) {
    return 'Fecha inválida';
  }

  // Ajustar zona horaria a Perú (UTC-5)
  const fechaPeru = new Date(fechaObj.getTime() - (fechaObj.getTimezoneOffset() * 60000));

  switch (formato) {
    case 'iso':
      return fechaPeru.toISOString().split('T')[0]; // yyyy-mm-dd

    case 'largo':
      const opcinesLargo: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Lima'
      };
      if (incluirHora && !soloFecha) {
        opcinesLargo.hour = '2-digit';
        opcinesLargo.minute = '2-digit';
      }
      return fechaPeru.toLocaleDateString('es-PE', opcinesLargo);

    case 'corto':
    default:
      const dia = fechaPeru.getDate().toString().padStart(2, '0');
      const mes = (fechaPeru.getMonth() + 1).toString().padStart(2, '0');
      const año = fechaPeru.getFullYear();
      
      let resultado = `${dia}/${mes}/${año}`;
      
      if (incluirHora && !soloFecha) {
        const hora = fechaPeru.getHours().toString().padStart(2, '0');
        const minutos = fechaPeru.getMinutes().toString().padStart(2, '0');
        resultado += ` ${hora}:${minutos}`;
      }
      
      return resultado;
  }
};

/**
 * Formatear fecha para inputs HTML
 */
export const formatearFechaParaInput = (fecha: string | Date): string => {
  if (!fecha) return '';
  
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  if (isNaN(fechaObj.getTime())) return '';
  
  return fechaObj.toISOString().split('T')[0];
};

/**
 * Obtener fecha actual de Perú
 */
export const obtenerFechaActualPeru = (): Date => {
  const ahora = new Date();
  // UTC-5 para Perú
  const offsetPeru = -5 * 60;
  const offsetLocal = ahora.getTimezoneOffset();
  const diferenciaMinutos = offsetLocal - offsetPeru;
  
  return new Date(ahora.getTime() + (diferenciaMinutos * 60 * 1000));
};

// =======================================================
// FORMATEO DE DOCUMENTOS
// =======================================================

/**
 * Formatear documento de identidad
 */
export const formatearDocumento = (
  tipoDocumento: '1' | '6',
  numeroDocumento: string,
  opciones: {
    incluirEtiqueta?: boolean;
    mascara?: boolean;
  } = {}
): string => {
  const { incluirEtiqueta = false, mascara = false } = opciones;

  if (!numeroDocumento) return '';

  const documento = numeroDocumento.trim();
  let resultado = documento;

  // Aplicar máscara si se solicita
  if (mascara) {
    if (tipoDocumento === '1' && documento.length === 8) {
      // DNI: 12345678 -> 12***678
      resultado = `${documento.substring(0, 2)}***${documento.substring(5)}`;
    } else if (tipoDocumento === '6' && documento.length === 11) {
      // RUC: 12345678901 -> 123****8901
      resultado = `${documento.substring(0, 3)}****${documento.substring(7)}`;
    }
  }

  // Agregar etiqueta si se solicita
  if (incluirEtiqueta) {
    const etiqueta = tipoDocumento === '1' ? 'DNI' : 'RUC';
    resultado = `${etiqueta}: ${resultado}`;
  }

  return resultado;
};

/**
 * Formatear número de factura/boleta
 */
export const formatearNumeroDocumento = (
  serie: string,
  numero: number | string,
  separador: string = '-'
): string => {
  if (!serie || (!numero && numero !== 0)) return '';

  const numeroFormateado = typeof numero === 'string' ? numero : numero.toString().padStart(8, '0');
  return `${serie}${separador}${numeroFormateado}`;
};

// =======================================================
// FORMATEO DE TELÉFONOS
// =======================================================

/**
 * Formatear número de teléfono peruano
 */
export const formatearTelefono = (
  telefono: string,
  opciones: {
    incluirCodigoPais?: boolean;
    formatoDisplay?: boolean;
  } = {}
): string => {
  const { incluirCodigoPais = false, formatoDisplay = false } = opciones;

  if (!telefono) return '';

  // Limpiar el teléfono
  let telefonoLimpio = telefono.replace(/[\s\-\(\)\+]/g, '');

  // Remover código de país si está presente
  if (telefonoLimpio.startsWith('51') && telefonoLimpio.length > 9) {
    telefonoLimpio = telefonoLimpio.substring(2);
  }

  // Formatear para display
  if (formatoDisplay && telefonoLimpio.length >= 7) {
    if (telefonoLimpio.length === 9) {
      // Celular: 987654321 -> 987 654 321
      telefonoLimpio = `${telefonoLimpio.substring(0, 3)} ${telefonoLimpio.substring(3, 6)} ${telefonoLimpio.substring(6)}`;
    } else if (telefonoLimpio.length === 7) {
      // Fijo: 1234567 -> 123 4567
      telefonoLimpio = `${telefonoLimpio.substring(0, 3)} ${telefonoLimpio.substring(3)}`;
    }
  }

  // Agregar código de país si se solicita
  if (incluirCodigoPais) {
    telefonoLimpio = `+51 ${telefonoLimpio}`;
  }

  return telefonoLimpio;
};

// =======================================================
// FORMATEO DE PORCENTAJES
// =======================================================

/**
 * Formatear porcentaje
 */
export const formatearPorcentaje = (
  valor: number,
  opciones: {
    precision?: number;
    incluirSimbolo?: boolean;
  } = {}
): string => {
  const { precision = 2, incluirSimbolo = true } = opciones;

  if (isNaN(valor)) return incluirSimbolo ? '0%' : '0';

  const porcentaje = (valor * 100).toFixed(precision);
  return incluirSimbolo ? `${porcentaje}%` : porcentaje;
};

// =======================================================
// FORMATEO DE CÓDIGOS
// =======================================================

/**
 * Formatear código de producto
 */
export const formatearCodigoProducto = (codigo: string, longitud: number = 6): string => {
  if (!codigo) return '';
  
  return codigo.toString().padStart(longitud, '0');
};

/**
 * Formatear código de barras
 */
export const formatearCodigoBarras = (codigo: string): string => {
  if (!codigo) return '';
  
  // Limpiar y formatear código de barras
  const codigoLimpio = codigo.replace(/[^0-9]/g, '');
  
  // Formatear según longitud
  if (codigoLimpio.length === 13) {
    // EAN-13: 1234567890123 -> 123 456 789 0123
    return `${codigoLimpio.substring(0, 3)} ${codigoLimpio.substring(3, 6)} ${codigoLimpio.substring(6, 9)} ${codigoLimpio.substring(9)}`;
  } else if (codigoLimpio.length === 12) {
    // UPC-A: 123456789012 -> 123 456 789 012
    return `${codigoLimpio.substring(0, 3)} ${codigoLimpio.substring(3, 6)} ${codigoLimpio.substring(6, 9)} ${codigoLimpio.substring(9)}`;
  }
  
  return codigoLimpio;
};

// =======================================================
// FORMATEO DE TEXTO
// =======================================================

/**
 * Capitalizar primera letra de cada palabra
 */
export const capitalizarPalabras = (texto: string): string => {
  if (!texto) return '';
  
  return texto
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
};

/**
 * Formatear texto para mostrar en mayúsculas
 */
export const formatearTextoMayusculas = (texto: string): string => {
  if (!texto) return '';
  return texto.toUpperCase().trim();
};

/**
 * Truncar texto con elipsis
 */
export const truncarTexto = (texto: string, longitud: number = 50): string => {
  if (!texto) return '';
  
  if (texto.length <= longitud) return texto;
  
  return `${texto.substring(0, longitud - 3)}...`;
};

// =======================================================
// FORMATEO DE DIRECCIONES
// =======================================================

/**
 * Formatear dirección completa peruana
 */
export const formatearDireccionCompleta = (
  direccion: string,
  distrito?: string,
  provincia?: string,
  departamento?: string
): string => {
  const partes = [direccion, distrito, provincia, departamento]
    .filter(parte => parte && parte.trim() !== '')
    .map(parte => capitalizarPalabras(parte!));
  
  return partes.join(', ');
};

// =======================================================
// UTILIDADES DE FORMATEO
// =======================================================

/**
 * Limpiar string de caracteres especiales
 */
export const limpiarString = (texto: string): string => {
  if (!texto) return '';
  
  return texto
    .trim()
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .replace(/[^\w\s\-\.]/g, ''); // Remover caracteres especiales excepto guiones y puntos
};

/**
 * Formatear número con separadores de miles
 */
export const formatearNumeroConSeparadores = (numero: number | string): string => {
  if (!numero && numero !== 0) return '';
  
  const num = typeof numero === 'string' ? parseFloat(numero) : numero;
  
  if (isNaN(num)) return '';
  
  return num.toLocaleString('es-PE');
};

/**
 * Obtener iniciales de nombre
 */
export const obtenerIniciales = (nombre: string): string => {
  if (!nombre) return '';
  
  return nombre
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3); // Máximo 3 iniciales
};

/**
 * Formatear tamaño de archivo
 */
export const formatearTamañoArchivo = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};