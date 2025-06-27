/**
 * Utilidades de Validación - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Validaciones específicas para documentos peruanos y SUNAT
 */

// =======================================================
// TIPOS DE VALIDACIÓN
// =======================================================

export interface ResultadoValidacion {
  valido: boolean;
  mensaje?: string;
  codigo_error?: string;
}

export interface ValidacionDocumento extends ResultadoValidacion {
  tipo_documento?: '1' | '6';
  numero_normalizado?: string;
  digito_verificador?: number;
}

// =======================================================
// VALIDACIÓN DE DNI
// =======================================================

/**
 * Validar DNI peruano
 * - Debe tener exactamente 8 dígitos
 * - No puede empezar con 0
 * - Debe ser numérico
 */
export const validarDNI = (dni: string): ValidacionDocumento => {
  if (!dni) {
    return {
      valido: false,
      mensaje: 'El DNI es requerido',
      codigo_error: 'DNI_REQUERIDO'
    };
  }

  // Normalizar: remover espacios y convertir a mayúsculas
  const dniNormalizado = dni.trim().replace(/\s+/g, '');

  // Verificar que solo contenga números
  if (!/^\d+$/.test(dniNormalizado)) {
    return {
      valido: false,
      mensaje: 'El DNI debe contener solo números',
      codigo_error: 'DNI_FORMATO_INVALIDO'
    };
  }

  // Verificar longitud exacta
  if (dniNormalizado.length !== 8) {
    return {
      valido: false,
      mensaje: 'El DNI debe tener exactamente 8 dígitos',
      codigo_error: 'DNI_LONGITUD_INVALIDA'
    };
  }

  // Verificar que no empiece con 0
  if (dniNormalizado.startsWith('0')) {
    return {
      valido: false,
      mensaje: 'El DNI no puede empezar con 0',
      codigo_error: 'DNI_CERO_INICIAL'
    };
  }

  // Verificar patrones conocidos inválidos
  const patronesInvalidos = [
    '11111111', '22222222', '33333333', '44444444',
    '55555555', '66666666', '77777777', '88888888', '99999999',
    '12345678', '87654321'
  ];

  if (patronesInvalidos.includes(dniNormalizado)) {
    return {
      valido: false,
      mensaje: 'El DNI ingresado no es válido',
      codigo_error: 'DNI_PATRON_INVALIDO'
    };
  }

  return {
    valido: true,
    tipo_documento: '1',
    numero_normalizado: dniNormalizado,
    mensaje: 'DNI válido'
  };
};

// =======================================================
// VALIDACIÓN DE RUC
// =======================================================

/**
 * Validar RUC peruano con algoritmo de módulo 11
 * - Debe tener exactamente 11 dígitos
 * - Los dos primeros dígitos indican el tipo de contribuyente
 * - El último dígito es verificador
 */
export const validarRUC = (ruc: string): ValidacionDocumento => {
  if (!ruc) {
    return {
      valido: false,
      mensaje: 'El RUC es requerido',
      codigo_error: 'RUC_REQUERIDO'
    };
  }

  // Normalizar
  const rucNormalizado = ruc.trim().replace(/\s+/g, '');

  // Verificar que solo contenga números
  if (!/^\d+$/.test(rucNormalizado)) {
    return {
      valido: false,
      mensaje: 'El RUC debe contener solo números',
      codigo_error: 'RUC_FORMATO_INVALIDO'
    };
  }

  // Verificar longitud exacta
  if (rucNormalizado.length !== 11) {
    return {
      valido: false,
      mensaje: 'El RUC debe tener exactamente 11 dígitos',
      codigo_error: 'RUC_LONGITUD_INVALIDA'
    };
  }

  // Verificar los dos primeros dígitos (tipo de contribuyente)
  const primerDigito = parseInt(rucNormalizado.charAt(0));
  const segundoDigito = parseInt(rucNormalizado.charAt(1));
  
  const tiposValidosRUC = [
    10, // Persona Natural
    11, // Persona Natural con Negocio
    15, // Persona Natural no Domiciliada
    17, // Persona Natural no Domiciliada sin RUC
    20, // Persona Jurídica
    25, // Persona Jurídica no Domiciliada
    30, // Entidades del Sector Público
  ];

  const tipoRUC = parseInt(rucNormalizado.substring(0, 2));
  if (!tiposValidosRUC.includes(tipoRUC)) {
    return {
      valido: false,
      mensaje: 'Tipo de RUC no válido',
      codigo_error: 'RUC_TIPO_INVALIDO'
    };
  }

  // Algoritmo de validación módulo 11
  const digitoVerificador = calcularDigitoVerificadorRUC(rucNormalizado);
  const ultimoDigito = parseInt(rucNormalizado.charAt(10));

  if (digitoVerificador !== ultimoDigito) {
    return {
      valido: false,
      mensaje: 'El dígito verificador del RUC es incorrecto',
      codigo_error: 'RUC_DIGITO_VERIFICADOR_INVALIDO'
    };
  }

  return {
    valido: true,
    tipo_documento: '6',
    numero_normalizado: rucNormalizado,
    digito_verificador: digitoVerificador,
    mensaje: 'RUC válido'
  };
};

/**
 * Calcular dígito verificador de RUC usando módulo 11
 */
const calcularDigitoVerificadorRUC = (ruc: string): number => {
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 10; i++) {
    suma += parseInt(ruc.charAt(i)) * factores[i];
  }

  const resto = suma % 11;
  const digito = 11 - resto;

  if (digito === 10) return 0;
  if (digito === 11) return 1;
  return digito;
};

// =======================================================
// VALIDACIÓN AUTOMÁTICA DE DOCUMENTOS
// =======================================================

/**
 * Detectar automáticamente el tipo de documento y validar
 */
export const validarDocumentoAutomatico = (documento: string): ValidacionDocumento => {
  if (!documento) {
    return {
      valido: false,
      mensaje: 'El documento es requerido',
      codigo_error: 'DOCUMENTO_REQUERIDO'
    };
  }

  const docNormalizado = documento.trim().replace(/\s+/g, '');

  // Detectar por longitud
  if (docNormalizado.length === 8) {
    return validarDNI(docNormalizado);
  } else if (docNormalizado.length === 11) {
    return validarRUC(docNormalizado);
  } else {
    return {
      valido: false,
      mensaje: 'El documento debe tener 8 dígitos (DNI) o 11 dígitos (RUC)',
      codigo_error: 'DOCUMENTO_LONGITUD_INVALIDA'
    };
  }
};

// =======================================================
// VALIDACIÓN DE EMAIL
// =======================================================

/**
 * Validar formato de email
 */
export const validarEmail = (email: string): ResultadoValidacion => {
  if (!email) {
    return { valido: true }; // Email es opcional
  }

  const emailNormalizado = email.trim().toLowerCase();
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regexEmail.test(emailNormalizado)) {
    return {
      valido: false,
      mensaje: 'El formato del email no es válido',
      codigo_error: 'EMAIL_FORMATO_INVALIDO'
    };
  }

  if (emailNormalizado.length > 100) {
    return {
      valido: false,
      mensaje: 'El email es demasiado largo (máximo 100 caracteres)',
      codigo_error: 'EMAIL_MUY_LARGO'
    };
  }

  return {
    valido: true,
    mensaje: 'Email válido'
  };
};

// =======================================================
// VALIDACIÓN DE TELÉFONOS
// =======================================================

/**
 * Validar número de teléfono peruano
 */
export const validarTelefono = (telefono: string): ResultadoValidacion => {
  if (!telefono) {
    return { valido: true }; // Teléfono es opcional
  }

  const telefonoNormalizado = telefono.trim().replace(/[\s\-\(\)]/g, '');

  // Permitir formato internacional +51
  const regexTelefono = /^(\+51)?[0-9]{7,9}$/;

  if (!regexTelefono.test(telefonoNormalizado)) {
    return {
      valido: false,
      mensaje: 'El formato del teléfono no es válido',
      codigo_error: 'TELEFONO_FORMATO_INVALIDO'
    };
  }

  return {
    valido: true,
    mensaje: 'Teléfono válido'
  };
};

// =======================================================
// VALIDACIÓN DE MONTOS
// =======================================================

/**
 * Validar monto monetario
 */
export const validarMonto = (monto: number | string, opciones: {
  minimo?: number;
  maximo?: number;
  requerido?: boolean;
  permitirNegativo?: boolean;
} = {}): ResultadoValidacion => {
  const {
    minimo = 0,
    maximo = 999999999.99,
    requerido = false,
    permitirNegativo = false
  } = opciones;

  if (monto === '' || monto === null || monto === undefined) {
    if (requerido) {
      return {
        valido: false,
        mensaje: 'El monto es requerido',
        codigo_error: 'MONTO_REQUERIDO'
      };
    }
    return { valido: true };
  }

  const montoNumerico = typeof monto === 'string' ? parseFloat(monto) : monto;

  if (isNaN(montoNumerico)) {
    return {
      valido: false,
      mensaje: 'El monto debe ser un número válido',
      codigo_error: 'MONTO_NO_NUMERICO'
    };
  }

  if (!permitirNegativo && montoNumerico < 0) {
    return {
      valido: false,
      mensaje: 'El monto no puede ser negativo',
      codigo_error: 'MONTO_NEGATIVO'
    };
  }

  if (montoNumerico < minimo) {
    return {
      valido: false,
      mensaje: `El monto mínimo es ${minimo}`,
      codigo_error: 'MONTO_MENOR_MINIMO'
    };
  }

  if (montoNumerico > maximo) {
    return {
      valido: false,
      mensaje: `El monto máximo es ${maximo}`,
      codigo_error: 'MONTO_MAYOR_MAXIMO'
    };
  }

  // Verificar decimales (máximo 2)
  const decimales = (montoNumerico.toString().split('.')[1] || '').length;
  if (decimales > 2) {
    return {
      valido: false,
      mensaje: 'El monto no puede tener más de 2 decimales',
      codigo_error: 'MONTO_MUCHOS_DECIMALES'
    };
  }

  return {
    valido: true,
    mensaje: 'Monto válido'
  };
};

// =======================================================
// VALIDACIÓN DE CANTIDAD
// =======================================================

/**
 * Validar cantidad de productos
 */
export const validarCantidad = (cantidad: number | string, opciones: {
  minimo?: number;
  maximo?: number;
  permitirDecimales?: boolean;
} = {}): ResultadoValidacion => {
  const {
    minimo = 0.001,
    maximo = 999999,
    permitirDecimales = true
  } = opciones;

  if (cantidad === '' || cantidad === null || cantidad === undefined) {
    return {
      valido: false,
      mensaje: 'La cantidad es requerida',
      codigo_error: 'CANTIDAD_REQUERIDA'
    };
  }

  const cantidadNumerica = typeof cantidad === 'string' ? parseFloat(cantidad) : cantidad;

  if (isNaN(cantidadNumerica)) {
    return {
      valido: false,
      mensaje: 'La cantidad debe ser un número válido',
      codigo_error: 'CANTIDAD_NO_NUMERICA'
    };
  }

  if (cantidadNumerica <= 0) {
    return {
      valido: false,
      mensaje: 'La cantidad debe ser mayor a cero',
      codigo_error: 'CANTIDAD_CERO_NEGATIVA'
    };
  }

  if (cantidadNumerica < minimo) {
    return {
      valido: false,
      mensaje: `La cantidad mínima es ${minimo}`,
      codigo_error: 'CANTIDAD_MENOR_MINIMO'
    };
  }

  if (cantidadNumerica > maximo) {
    return {
      valido: false,
      mensaje: `La cantidad máxima es ${maximo}`,
      codigo_error: 'CANTIDAD_MAYOR_MAXIMO'
    };
  }

  if (!permitirDecimales && cantidadNumerica % 1 !== 0) {
    return {
      valido: false,
      mensaje: 'La cantidad debe ser un número entero',
      codigo_error: 'CANTIDAD_DECIMAL_NO_PERMITIDA'
    };
  }

  return {
    valido: true,
    mensaje: 'Cantidad válida'
  };
};

// =======================================================
// VALIDACIÓN DE TEXTO
// =======================================================

/**
 * Validar texto general
 */
export const validarTexto = (texto: string, opciones: {
  minimo?: number;
  maximo?: number;
  requerido?: boolean;
  soloLetras?: boolean;
  soloAlfanumerico?: boolean;
} = {}): ResultadoValidacion => {
  const {
    minimo = 0,
    maximo = 255,
    requerido = false,
    soloLetras = false,
    soloAlfanumerico = false
  } = opciones;

  if (!texto || texto.trim() === '') {
    if (requerido) {
      return {
        valido: false,
        mensaje: 'Este campo es requerido',
        codigo_error: 'TEXTO_REQUERIDO'
      };
    }
    return { valido: true };
  }

  const textoLimpio = texto.trim();

  if (textoLimpio.length < minimo) {
    return {
      valido: false,
      mensaje: `Mínimo ${minimo} caracteres`,
      codigo_error: 'TEXTO_MUY_CORTO'
    };
  }

  if (textoLimpio.length > maximo) {
    return {
      valido: false,
      mensaje: `Máximo ${maximo} caracteres`,
      codigo_error: 'TEXTO_MUY_LARGO'
    };
  }

  if (soloLetras && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(textoLimpio)) {
    return {
      valido: false,
      mensaje: 'Solo se permiten letras y espacios',
      codigo_error: 'TEXTO_CARACTERES_INVALIDOS'
    };
  }

  if (soloAlfanumerico && !/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/.test(textoLimpio)) {
    return {
      valido: false,
      mensaje: 'Solo se permiten letras, números, espacios y guiones',
      codigo_error: 'TEXTO_CARACTERES_INVALIDOS'
    };
  }

  return {
    valido: true,
    mensaje: 'Texto válido'
  };
};

// =======================================================
// VALIDACIÓN DE FECHA
// =======================================================

/**
 * Validar fecha
 */
export const validarFecha = (fecha: string | Date, opciones: {
  fechaMinima?: Date;
  fechaMaxima?: Date;
  requerida?: boolean;
} = {}): ResultadoValidacion => {
  const {
    fechaMinima,
    fechaMaxima,
    requerida = false
  } = opciones;

  if (!fecha) {
    if (requerida) {
      return {
        valido: false,
        mensaje: 'La fecha es requerida',
        codigo_error: 'FECHA_REQUERIDA'
      };
    }
    return { valido: true };
  }

  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

  if (isNaN(fechaObj.getTime())) {
    return {
      valido: false,
      mensaje: 'La fecha no es válida',
      codigo_error: 'FECHA_INVALIDA'
    };
  }

  if (fechaMinima && fechaObj < fechaMinima) {
    return {
      valido: false,
      mensaje: `La fecha debe ser posterior al ${fechaMinima.toLocaleDateString()}`,
      codigo_error: 'FECHA_ANTERIOR_MINIMA'
    };
  }

  if (fechaMaxima && fechaObj > fechaMaxima) {
    return {
      valido: false,
      mensaje: `La fecha debe ser anterior al ${fechaMaxima.toLocaleDateString()}`,
      codigo_error: 'FECHA_POSTERIOR_MAXIMA'
    };
  }

  return {
    valido: true,
    mensaje: 'Fecha válida'
  };
};

// =======================================================
// UTILIDADES DE VALIDACIÓN
// =======================================================

/**
 * Validar múltiples campos a la vez
 */
export const validarCampos = (
  campos: Array<{ valor: any; validaciones: (() => ResultadoValidacion)[] }>
): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];

  for (const campo of campos) {
    for (const validacion of campo.validaciones) {
      const resultado = validacion();
      if (!resultado.valido && resultado.mensaje) {
        errores.push(resultado.mensaje);
      }
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Normalizar texto para comparaciones
 */
export const normalizarTexto = (texto: string): string => {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remover acentos
};

/**
 * Verificar si un string contiene solo números
 */
export const esSoloNumeros = (valor: string): boolean => {
  return /^\d+$/.test(valor.trim());
};

/**
 * Verificar si un valor está vacío
 */
export const estaVacio = (valor: any): boolean => {
  if (valor === null || valor === undefined) return true;
  if (typeof valor === 'string') return valor.trim() === '';
  if (Array.isArray(valor)) return valor.length === 0;
  if (typeof valor === 'object') return Object.keys(valor).length === 0;
  return false;
};