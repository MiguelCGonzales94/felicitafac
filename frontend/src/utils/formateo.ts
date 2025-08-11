/**
 * Utilidades de Formateo - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Formateadores específicos para datos peruanos y SUNAT
 */

// =======================================================
// TIPOS PARA FORMATEOS
// =======================================================

export interface OpcionesFormateoMoneda {
  moneda?: 'PEN' | 'USD' | 'EUR';
  mostrarSimbolo?: boolean;
  mostrarCodigo?: boolean;
  decimales?: number;
  separadorMiles?: string;
  separadorDecimal?: string;
}

export interface OpcionesFormateoFecha {
  formato?: 'corto' | 'largo' | 'completo' | 'custom';
  formatoCustom?: string;
  incluirHora?: boolean;
  zona?: string;
}

export interface OpcionesFormateoNumero {
  decimales?: number;
  separadorMiles?: string;
  separadorDecimal?: string;
  prefijo?: string;
  sufijo?: string;
}

// =======================================================
// FORMATEOS DE MONEDA Y NÚMEROS
// =======================================================

/**
 * Formatear moneda peruana
 */
export const formatearMoneda = (
  monto: number | string,
  opciones: OpcionesFormateoMoneda = {}
): string => {
  const {
    moneda = 'PEN',
    mostrarSimbolo = true,
    mostrarCodigo = false,
    decimales = 2,
    separadorMiles = ',',
    separadorDecimal = '.'
  } = opciones;

  const montoNumerico = typeof monto === 'string' ? parseFloat(monto) : monto;
  
  if (isNaN(montoNumerico)) {
    return '0.00';
  }

  // Formatear el número
  const numeroFormateado = formatearNumero(montoNumerico, {
    decimales,
    separadorMiles,
    separadorDecimal
  });

  // Agregar símbolo o código de moneda
  const simbolos = {
    PEN: 'S/',
    USD: '$',
    EUR: '€'
  };

  let resultado = numeroFormateado;

  if (mostrarSimbolo) {
    resultado = `${simbolos[moneda]} ${resultado}`;
  }

  if (mostrarCodigo) {
    resultado = mostrarSimbolo ? `${resultado} ${moneda}` : `${resultado} ${moneda}`;
  }

  return resultado;
};

/**
 * Formatear número con separadores
 */
export const formatearNumero = (
  numero: number | string,
  opciones: OpcionesFormateoNumero = {}
): string => {
  const {
    decimales = 2,
    separadorMiles = ',',
    separadorDecimal = '.',
    prefijo = '',
    sufijo = ''
  } = opciones;

  const numeroVal = typeof numero === 'string' ? parseFloat(numero) : numero;
  
  if (isNaN(numeroVal)) {
    return '0';
  }

  // Redondear a decimales especificados
  const numeroRedondeado = Number(numeroVal.toFixed(decimales));
  
  // Separar parte entera y decimal
  const partes = numeroRedondeado.toString().split('.');
  const parteEntera = partes[0];
  const parteDecimal = partes[1] || '';

  // Agregar separador de miles
  const enteraFormateada = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, separadorMiles);

  // Construir resultado
  let resultado = enteraFormateada;
  
  if (decimales > 0) {
    const decimalesFormateados = parteDecimal.padEnd(decimales, '0');
    resultado = `${resultado}${separadorDecimal}${decimalesFormateados}`;
  }

  return `${prefijo}${resultado}${sufijo}`;
};

/**
 * Formatear porcentaje
 */
export const formatearPorcentaje = (
  valor: number | string,
  decimales = 2,
  incluirSigno = true
): string => {
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  if (isNaN(numero)) {
    return '0%';
  }

  const porcentaje = formatearNumero(numero, { decimales });
  return incluirSigno ? `${porcentaje}%` : porcentaje;
};

// =======================================================
// FORMATEOS DE FECHAS
// =======================================================

/**
 * Formatear fecha
 */
export const formatearFecha = (
  fecha: string | Date,
  opciones: OpcionesFormateoFecha = {}
): string => {
  const {
    formato = 'corto',
    formatoCustom,
    incluirHora = false,
    zona = 'America/Lima'
  } = opciones;

  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  if (isNaN(fechaObj.getTime())) {
    return 'Fecha inválida';
  }

  // Opciones base para formateo
  const opcionesBase: Intl.DateTimeFormatOptions = {
    timeZone: zona
  };

  // Configurar según formato
  switch (formato) {
    case 'corto':
      opcionesBase.day = '2-digit';
      opcionesBase.month = '2-digit';
      opcionesBase.year = 'numeric';
      break;
    
    case 'largo':
      opcionesBase.day = 'numeric';
      opcionesBase.month = 'long';
      opcionesBase.year = 'numeric';
      break;
    
    case 'completo':
      opcionesBase.weekday = 'long';
      opcionesBase.day = 'numeric';
      opcionesBase.month = 'long';
      opcionesBase.year = 'numeric';
      break;
  }

  // Incluir hora si se solicita
  if (incluirHora) {
    opcionesBase.hour = '2-digit';
    opcionesBase.minute = '2-digit';
    opcionesBase.hour12 = false;
  }

  // Formato custom
  if (formato === 'custom' && formatoCustom) {
    return formatearFechaCustom(fechaObj, formatoCustom);
  }

  return fechaObj.toLocaleDateString('es-PE', opcionesBase);
};

/**
 * Formatear fecha con formato personalizado
 */
const formatearFechaCustom = (fecha: Date, formato: string): string => {
  const opciones: Record<string, string> = {
    'YYYY': fecha.getFullYear().toString(),
    'YY': fecha.getFullYear().toString().slice(-2),
    'MM': (fecha.getMonth() + 1).toString().padStart(2, '0'),
    'M': (fecha.getMonth() + 1).toString(),
    'DD': fecha.getDate().toString().padStart(2, '0'),
    'D': fecha.getDate().toString(),
    'HH': fecha.getHours().toString().padStart(2, '0'),
    'H': fecha.getHours().toString(),
    'mm': fecha.getMinutes().toString().padStart(2, '0'),
    'm': fecha.getMinutes().toString(),
    'ss': fecha.getSeconds().toString().padStart(2, '0'),
    's': fecha.getSeconds().toString()
  };

  let resultado = formato;
  for (const [patron, valor] of Object.entries(opciones)) {
    resultado = resultado.replace(new RegExp(patron, 'g'), valor);
  }

  return resultado;
};

/**
 * Formatear fecha para SUNAT (YYYY-MM-DD)
 */
export const formatearFechaSunat = (fecha: string | Date): string => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  if (isNaN(fechaObj.getTime())) {
    return '';
  }

  return formatearFechaCustom(fechaObj, 'YYYY-MM-DD');
};

/**
 * Formatear hora para SUNAT (HH:mm:ss)
 */
export const formatearHoraSunat = (fecha: string | Date): string => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  if (isNaN(fechaObj.getTime())) {
    return '';
  }

  return formatearFechaCustom(fechaObj, 'HH:mm:ss');
};

// =======================================================
// FORMATEOS DE DOCUMENTOS
// =======================================================

/**
 * Formatear RUC con guiones
 */
export const formatearRuc = (ruc: string): string => {
  const rucLimpio = ruc.replace(/[^0-9]/g, '');
  
  if (rucLimpio.length !== 11) {
    return ruc;
  }

  return `${rucLimpio.slice(0, 2)}-${rucLimpio.slice(2, 10)}-${rucLimpio.slice(10)}`;
};

/**
 * Formatear DNI con guiones
 */
export const formatearDni = (dni: string): string => {
  const dniLimpio = dni.replace(/[^0-9]/g, '');
  
  if (dniLimpio.length !== 8) {
    return dni;
  }

  return `${dniLimpio.slice(0, 2)}.${dniLimpio.slice(2, 5)}.${dniLimpio.slice(5)}`;
};

/**
 * Formatear documento según tipo
 */
export const formatearDocumento = (documento: string, tipoDocumento?: string): string => {
  if (!documento) return '';

  const docLimpio = documento.replace(/[^0-9A-Za-z]/g, '');

  switch (tipoDocumento) {
    case '1': // DNI
      return formatearDni(docLimpio);
    case '6': // RUC
      return formatearRuc(docLimpio);
    default:
      return documento;
  }
};

// =======================================================
// FORMATEOS DE TELÉFONO
// =======================================================

/**
 * Formatear teléfono peruano
 */
export const formatearTelefono = (telefono: string): string => {
  const telefonoLimpio = telefono.replace(/[^0-9]/g, '');

  if (telefonoLimpio.length === 9 && telefonoLimpio.startsWith('9')) {
    // Celular: 9XX XXX XXX
    return `${telefonoLimpio.slice(0, 3)} ${telefonoLimpio.slice(3, 6)} ${telefonoLimpio.slice(6)}`;
  } else if (telefonoLimpio.length === 7) {
    // Fijo Lima: XXX XXXX
    return `${telefonoLimpio.slice(0, 3)} ${telefonoLimpio.slice(3)}`;
  } else if (telefonoLimpio.length === 6) {
    // Fijo provincial: XXX XXX
    return `${telefonoLimpio.slice(0, 3)} ${telefonoLimpio.slice(3)}`;
  }

  return telefono;
};

// =======================================================
// FORMATEOS DE TEXTO
// =======================================================

/**
 * Formatear nombre propio (Title Case)
 */
export const formatearNombrePropio = (nombre: string): string => {
  if (!nombre) return '';

  return nombre
    .toLowerCase()
    .split(' ')
    .map(palabra => {
      if (palabra.length === 0) return palabra;
      
      // Manejar preposiciones y artículos
      const palabrasMinusculas = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e'];
      if (palabrasMinusculas.includes(palabra)) {
        return palabra;
      }
      
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(' ');
};

/**
 * Truncar texto con puntos suspensivos
 */
export const truncarTexto = (texto: string, longitudMaxima: number, sufijo = '...'): string => {
  if (!texto || texto.length <= longitudMaxima) {
    return texto;
  }

  return texto.slice(0, longitudMaxima - sufijo.length) + sufijo;
};

/**
 * Formatear texto para URL (slug)
 */
export const formatearSlug = (texto: string): string => {
  return texto
    .toLowerCase()
    .trim()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// =======================================================
// FORMATEOS ESPECÍFICOS SUNAT
// =======================================================

/**
 * Formatear serie de documento electrónico
 */
export const formatearSerie = (serie: string): string => {
  if (!serie) return '';
  
  const serieLimpia = serie.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (serieLimpia.length === 4) {
    return `${serieLimpia.slice(0, 1)}-${serieLimpia.slice(1)}`;
  }
  
  return serie;
};

/**
 * Formatear correlativo de documento
 */
export const formatearCorrelativo = (correlativo: number | string): string => {
  const numero = typeof correlativo === 'string' ? parseInt(correlativo) : correlativo;
  
  if (isNaN(numero)) {
    return '00000000';
  }
  
  return numero.toString().padStart(8, '0');
};

/**
 * Formatear número completo de documento electrónico
 */
export const formatearNumeroDocumento = (serie: string, correlativo: number | string): string => {
  const serieFormateada = formatearSerie(serie);
  const correlativoFormateado = formatearCorrelativo(correlativo);
  
  return `${serieFormateada}-${correlativoFormateado}`;
};

// =======================================================
// FORMATEOS DE ARCHIVOS Y DATOS
// =======================================================

/**
 * Formatear tamaño de archivo
 */
export const formatearTamañoArchivo = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const tamaños = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${tamaños[i]}`;
};

/**
 * Formatear duración en segundos
 */
export const formatearDuracion = (segundos: number): string => {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = segundos % 60;

  if (horas > 0) {
    return `${horas}h ${minutos}m ${segs}s`;
  } else if (minutos > 0) {
    return `${minutos}m ${segs}s`;
  } else {
    return `${segs}s`;
  }
};

// =======================================================
// FORMATEOS COMPUESTOS
// =======================================================

/**
 * Formatear dirección completa
 */
export const formatearDireccion = (direccion: {
  calle?: string;
  numero?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  codigoPostal?: string;
}): string => {
  const partes = [];

  if (direccion.calle) {
    let lineaDireccion = direccion.calle;
    if (direccion.numero) {
      lineaDireccion += ` ${direccion.numero}`;
    }
    partes.push(lineaDireccion);
  }

  if (direccion.distrito) {
    partes.push(direccion.distrito);
  }

  if (direccion.provincia && direccion.provincia !== direccion.distrito) {
    partes.push(direccion.provincia);
  }

  if (direccion.departamento) {
    partes.push(direccion.departamento);
  }

  if (direccion.codigoPostal) {
    partes.push(direccion.codigoPostal);
  }

  return partes.join(', ');
};

/**
 * Formatear nombre completo
 */
export const formatearNombreCompleto = (datos: {
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  razonSocial?: string;
}): string => {
  if (datos.razonSocial) {
    return formatearNombrePropio(datos.razonSocial);
  }

  const partes = [];
  
  if (datos.nombres) {
    partes.push(formatearNombrePropio(datos.nombres));
  }
  
  if (datos.apellidoPaterno) {
    partes.push(formatearNombrePropio(datos.apellidoPaterno));
  }
  
  if (datos.apellidoMaterno) {
    partes.push(formatearNombrePropio(datos.apellidoMaterno));
  }

  return partes.join(' ');
};

// =======================================================
// UTILIDADES DE LIMPIEZA
// =======================================================

/**
 * Limpiar solo números
 */
export const limpiarSoloNumeros = (texto: string): string => {
  return texto.replace(/[^0-9]/g, '');
};

/**
 * Limpiar solo letras
 */
export const limpiarSoloLetras = (texto: string): string => {
  return texto.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
};

/**
 * Limpiar alfanumérico
 */
export const limpiarAlfanumerico = (texto: string): string => {
  return texto.replace(/[^a-zA-Z0-9]/g, '');
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default {
  formatearMoneda,
  formatearNumero,
  formatearPorcentaje,
  formatearFecha,
  formatearFechaSunat,
  formatearHoraSunat,
  formatearRuc,
  formatearDni,
  formatearDocumento,
  formatearTelefono,
  formatearNombrePropio,
  truncarTexto,
  formatearSlug,
  formatearSerie,
  formatearCorrelativo,
  formatearNumeroDocumento,
  formatearTamañoArchivo,
  formatearDuracion,
  formatearDireccion,
  formatearNombreCompleto,
  limpiarSoloNumeros,
  limpiarSoloLetras,
  limpiarAlfanumerico
};