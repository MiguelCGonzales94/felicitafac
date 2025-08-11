/**
 * Utilidades de Validación - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Validaciones específicas para normativa SUNAT
 */

// =======================================================
// TIPOS PARA VALIDACIONES
// =======================================================

export interface ResultadoValidacion {
  valido: boolean;
  mensaje?: string;
  codigo?: string;
}

export interface ValidacionDocumento extends ResultadoValidacion {
  tipo_documento?: string;
  tipo_entidad?: 'persona' | 'empresa';
}

export interface ValidacionEmail extends ResultadoValidacion {
  dominio?: string;
}

export interface ConfiguracionValidacion {
  requerido?: boolean;
  longitudMinima?: number;
  longitudMaxima?: number;
  patron?: RegExp;
  personalizada?: (valor: any) => ResultadoValidacion;
}

// =======================================================
// VALIDACIONES DE DOCUMENTOS PERUANOS
// =======================================================

/**
 * Validar RUC peruano (11 dígitos)
 */
export const validarRuc = (ruc: string): ValidacionDocumento => {
  if (!ruc) {
    return { valido: false, mensaje: 'RUC es requerido' };
  }

  // Limpiar el RUC
  const rucLimpio = ruc.replace(/[^0-9]/g, '');

  if (rucLimpio.length !== 11) {
    return { valido: false, mensaje: 'RUC debe tener 11 dígitos' };
  }

  // Validar primer dígito (tipo de contribuyente)
  const primerDigito = rucLimpio[0];
  if (!['1', '2'].includes(primerDigito)) {
    return { valido: false, mensaje: 'RUC debe comenzar con 1 o 2' };
  }

  // Algoritmo de validación del dígito verificador
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 10; i++) {
    suma += parseInt(rucLimpio[i]) * factores[i];
  }

  const residuo = suma % 11;
  const digitoVerificador = residuo < 2 ? residuo : 11 - residuo;

  if (parseInt(rucLimpio[10]) !== digitoVerificador) {
    return { valido: false, mensaje: 'RUC no es válido (dígito verificador incorrecto)' };
  }

  return {
    valido: true,
    tipo_documento: '6',
    tipo_entidad: 'empresa'
  };
};

/**
 * Validar DNI peruano (8 dígitos)
 */
export const validarDni = (dni: string): ValidacionDocumento => {
  if (!dni) {
    return { valido: false, mensaje: 'DNI es requerido' };
  }

  const dniLimpio = dni.replace(/[^0-9]/g, '');

  if (dniLimpio.length !== 8) {
    return { valido: false, mensaje: 'DNI debe tener 8 dígitos' };
  }

  // Validar que no sean todos iguales
  if (/^(\d)\1{7}$/.test(dniLimpio)) {
    return { valido: false, mensaje: 'DNI no puede tener todos los dígitos iguales' };
  }

  // Validar rango válido
  const numeroMini = parseInt(dniLimpio);
  if (numeroMini < 1000000 || numeroMini > 99999999) {
    return { valido: false, mensaje: 'DNI está fuera del rango válido' };
  }

  return {
    valido: true,
    tipo_documento: '1',
    tipo_entidad: 'persona'
  };
};

/**
 * Validar Carnet de Extranjería (12 dígitos)
 */
export const validarCarnetExtranjeria = (carnet: string): ValidacionDocumento => {
  if (!carnet) {
    return { valido: false, mensaje: 'Carnet de Extranjería es requerido' };
  }

  const carnetLimpio = carnet.replace(/[^0-9]/g, '');

  if (carnetLimpio.length !== 12) {
    return { valido: false, mensaje: 'Carnet de Extranjería debe tener 12 dígitos' };
  }

  return {
    valido: true,
    tipo_documento: '4',
    tipo_entidad: 'persona'
  };
};

/**
 * Validar Pasaporte (formato internacional)
 */
export const validarPasaporte = (pasaporte: string): ValidacionDocumento => {
  if (!pasaporte) {
    return { valido: false, mensaje: 'Pasaporte es requerido' };
  }

  const pasaporteLimpio = pasaporte.trim().toUpperCase();

  if (pasaporteLimpio.length < 6 || pasaporteLimpio.length > 12) {
    return { valido: false, mensaje: 'Pasaporte debe tener entre 6 y 12 caracteres' };
  }

  // Formato alfanumérico
  if (!/^[A-Z0-9]+$/.test(pasaporteLimpio)) {
    return { valido: false, mensaje: 'Pasaporte solo puede contener letras y números' };
  }

  return {
    valido: true,
    tipo_documento: '7',
    tipo_entidad: 'persona'
  };
};

/**
 * Validar documento automáticamente según su formato
 */
export const validarDocumentoAutomatico = (documento: string): ValidacionDocumento => {
  if (!documento) {
    return { valido: false, mensaje: 'Documento es requerido' };
  }

  const docLimpio = documento.replace(/[^0-9A-Za-z]/g, '');

  // Intentar detectar tipo de documento por longitud y formato
  if (/^\d{8}$/.test(docLimpio)) {
    return validarDni(docLimpio);
  } else if (/^\d{11}$/.test(docLimpio)) {
    return validarRuc(docLimpio);
  } else if (/^\d{12}$/.test(docLimpio)) {
    return validarCarnetExtranjeria(docLimpio);
  } else if (/^[A-Z0-9]{6,12}$/i.test(docLimpio)) {
    return validarPasaporte(docLimpio);
  } else {
    return { valido: false, mensaje: 'Formato de documento no reconocido' };
  }
};

// =======================================================
// VALIDACIONES DE CONTACTO
// =======================================================

/**
 * Validar email
 */
export const validarEmail = (email: string): ValidacionEmail => {
  if (!email) {
    return { valido: false, mensaje: 'Email es requerido' };
  }

  const emailLimpio = email.trim().toLowerCase();
  const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!patronEmail.test(emailLimpio)) {
    return { valido: false, mensaje: 'Formato de email no válido' };
  }

  const dominio = emailLimpio.split('@')[1];

  // Validar dominios comunes problemáticos
  const dominiosProblematicos = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  if (dominiosProblematicos.includes(dominio)) {
    return { valido: false, mensaje: 'No se permite este tipo de email temporal' };
  }

  return {
    valido: true,
    dominio
  };
};

/**
 * Validar teléfono peruano
 */
export const validarTelefono = (telefono: string): ResultadoValidacion => {
  if (!telefono) {
    return { valido: false, mensaje: 'Teléfono es requerido' };
  }

  const telefonoLimpio = telefono.replace(/[^0-9]/g, '');

  // Celular: 9 dígitos que empiecen con 9
  if (/^9\d{8}$/.test(telefonoLimpio)) {
    return { valido: true };
  }

  // Fijo Lima: 7 dígitos
  if (/^\d{7}$/.test(telefonoLimpio)) {
    return { valido: true };
  }

  // Fijo provincial: 6 dígitos
  if (/^\d{6}$/.test(telefonoLimpio)) {
    return { valido: true };
  }

  return { valido: false, mensaje: 'Formato de teléfono no válido para Perú' };
};

// =======================================================
// VALIDACIONES COMERCIALES
// =======================================================

/**
 * Validar código de producto
 */
export const validarCodigoProducto = (codigo: string): ResultadoValidacion => {
  if (!codigo) {
    return { valido: false, mensaje: 'Código de producto es requerido' };
  }

  const codigoLimpio = codigo.trim().toUpperCase();

  if (codigoLimpio.length < 3 || codigoLimpio.length > 20) {
    return { valido: false, mensaje: 'Código debe tener entre 3 y 20 caracteres' };
  }

  if (!/^[A-Z0-9-_]+$/.test(codigoLimpio)) {
    return { valido: false, mensaje: 'Código solo puede contener letras, números, guiones y guiones bajos' };
  }

  return { valido: true };
};

/**
 * Validar precio/monto
 */
export const validarMonto = (monto: number | string, minimo = 0, maximo = 999999999): ResultadoValidacion => {
  const montoNumerico = typeof monto === 'string' ? parseFloat(monto) : monto;

  if (isNaN(montoNumerico)) {
    return { valido: false, mensaje: 'Monto debe ser un número válido' };
  }

  if (montoNumerico < minimo) {
    return { valido: false, mensaje: `Monto no puede ser menor a ${minimo}` };
  }

  if (montoNumerico > maximo) {
    return { valido: false, mensaje: `Monto no puede ser mayor a ${maximo}` };
  }

  return { valido: true };
};

/**
 * Validar cantidad
 */
export const validarCantidad = (cantidad: number | string, permiteDecimales = false): ResultadoValidacion => {
  const cantidadNumerica = typeof cantidad === 'string' ? parseFloat(cantidad) : cantidad;

  if (isNaN(cantidadNumerica)) {
    return { valido: false, mensaje: 'Cantidad debe ser un número válido' };
  }

  if (cantidadNumerica <= 0) {
    return { valido: false, mensaje: 'Cantidad debe ser mayor a 0' };
  }

  if (!permiteDecimales && cantidadNumerica % 1 !== 0) {
    return { valido: false, mensaje: 'Cantidad no puede tener decimales' };
  }

  return { valido: true };
};

// =======================================================
// VALIDACIONES DE FECHAS
// =======================================================

/**
 * Validar fecha de emisión
 */
export const validarFechaEmision = (fecha: string | Date): ResultadoValidacion => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

  if (isNaN(fechaObj.getTime())) {
    return { valido: false, mensaje: 'Fecha de emisión no válida' };
  }

  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999); // Fin del día actual

  if (fechaObj > hoy) {
    return { valido: false, mensaje: 'Fecha de emisión no puede ser futura' };
  }

  // No más de 7 días hacia atrás para facturación electrónica
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  hace7Dias.setHours(0, 0, 0, 0);

  if (fechaObj < hace7Dias) {
    return { valido: false, mensaje: 'Fecha de emisión no puede ser mayor a 7 días atrás' };
  }

  return { valido: true };
};

/**
 * Validar fecha de vencimiento
 */
export const validarFechaVencimiento = (fechaVencimiento: string | Date, fechaEmision?: string | Date): ResultadoValidacion => {
  const fechaVencObj = typeof fechaVencimiento === 'string' ? new Date(fechaVencimiento) : fechaVencimiento;

  if (isNaN(fechaVencObj.getTime())) {
    return { valido: false, mensaje: 'Fecha de vencimiento no válida' };
  }

  if (fechaEmision) {
    const fechaEmisionObj = typeof fechaEmision === 'string' ? new Date(fechaEmision) : fechaEmision;
    
    if (fechaVencObj < fechaEmisionObj) {
      return { valido: false, mensaje: 'Fecha de vencimiento no puede ser anterior a fecha de emisión' };
    }
  }

  return { valido: true };
};

// =======================================================
// VALIDADOR GENÉRICO
// =======================================================

/**
 * Validador genérico configurable
 */
export const validar = (valor: any, configuracion: ConfiguracionValidacion): ResultadoValidacion => {
  // Validar requerido
  if (configuracion.requerido && (!valor || (typeof valor === 'string' && !valor.trim()))) {
    return { valido: false, mensaje: 'Este campo es requerido' };
  }

  // Si no es requerido y está vacío, es válido
  if (!configuracion.requerido && (!valor || (typeof valor === 'string' && !valor.trim()))) {
    return { valido: true };
  }

  const valorString = String(valor).trim();

  // Validar longitud mínima
  if (configuracion.longitudMinima && valorString.length < configuracion.longitudMinima) {
    return { valido: false, mensaje: `Debe tener al menos ${configuracion.longitudMinima} caracteres` };
  }

  // Validar longitud máxima
  if (configuracion.longitudMaxima && valorString.length > configuracion.longitudMaxima) {
    return { valido: false, mensaje: `No debe superar ${configuracion.longitudMaxima} caracteres` };
  }

  // Validar patrón
  if (configuracion.patron && !configuracion.patron.test(valorString)) {
    return { valido: false, mensaje: 'Formato no válido' };
  }

  // Validación personalizada
  if (configuracion.personalizada) {
    return configuracion.personalizada(valor);
  }

  return { valido: true };
};

// =======================================================
// VALIDACIONES COMBINADAS
// =======================================================

/**
 * Validar formulario completo
 */
export const validarFormulario = (
  datos: Record<string, any>,
  reglas: Record<string, ConfiguracionValidacion>
): { valido: boolean; errores: Record<string, string> } => {
  const errores: Record<string, string> = {};

  for (const [campo, configuracion] of Object.entries(reglas)) {
    const resultado = validar(datos[campo], configuracion);
    if (!resultado.valido && resultado.mensaje) {
      errores[campo] = resultado.mensaje;
    }
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores
  };
};

// =======================================================
// PATRONES COMUNES
// =======================================================

export const PATRONES = {
  // Solo letras y espacios
  SOLO_LETRAS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  
  // Solo números
  SOLO_NUMEROS: /^\d+$/,
  
  // Alfanumérico
  ALFANUMERICO: /^[a-zA-Z0-9]+$/,
  
  // Código postal peruano (5 dígitos)
  CODIGO_POSTAL: /^\d{5}$/,
  
  // Placa vehicular peruana
  PLACA_VEHICULAR: /^[A-Z]{3}-\d{3}$/,
  
  // Número de cuenta bancaria (13-20 dígitos)
  CUENTA_BANCARIA: /^\d{13,20}$/,
  
  // CCI (20 dígitos)
  CCI: /^\d{20}$/
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default {
  validarRuc,
  validarDni,
  validarCarnetExtranjeria,
  validarPasaporte,
  validarDocumentoAutomatico,
  validarEmail,
  validarTelefono,
  validarCodigoProducto,
  validarMonto,
  validarCantidad,
  validarFechaEmision,
  validarFechaVencimiento,
  validar,
  validarFormulario,
  PATRONES
};