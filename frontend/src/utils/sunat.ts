/**
 * Utilidades SUNAT - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Utilidades específicas para normativa y procesos SUNAT
 */

import { 
  TIPOS_DOCUMENTO_ELECTRONICO, 
  TIPOS_DOCUMENTO_IDENTIDAD,
  AFECTACION_IGV,
  NOMBRES_AFECTACION_IGV,
  TRIBUTOS,
  TIPOS_OPERACION,
  UNIDADES_MEDIDA
} from './constants';
import { formatearFechaSunat, formatearHoraSunat } from './formatters';

// =======================================================
// TIPOS PARA DOCUMENTOS SUNAT
// =======================================================

export interface DocumentoElectronicoSunat {
  tipoDocumento: string;
  serie: string;
  correlativo: number;
  fechaEmision: string;
  horaEmision: string;
  tipoOperacion: string;
  moneda: string;
  
  // Emisor
  emisor: {
    ruc: string;
    razonSocial: string;
    nombreComercial?: string;
    direccion: string;
    ubigeo: string;
  };
  
  // Receptor
  receptor: {
    tipoDocumento: string;
    numeroDocumento: string;
    razonSocial: string;
    direccion?: string;
    email?: string;
  };
  
  // Items
  items: ItemDocumentoSunat[];
  
  // Totales
  totales: TotalesDocumentoSunat;
  
  // Datos adicionales
  observaciones?: string;
  ordenCompra?: string;
  condicionesPago?: string;
}

export interface ItemDocumentoSunat {
  codigo: string;
  descripcion: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  afectacionIgv: string;
  tipoImpuesto: string;
  porcentajeIgv: number;
  montoIgv: number;
  valorVenta: number;
  precioVenta: number;
}

export interface TotalesDocumentoSunat {
  operacionesGravadas: number;
  operacionesExoneradas: number;
  operacionesInafectas: number;
  operacionesGratuitas: number;
  totalDescuentos: number;
  totalOtrosCargos: number;
  totalAnticipos: number;
  importeTotal: number;
  montoEnLetras: string;
  
  // Impuestos
  totalIgv: number;
  totalIsc: number;
  totalIcbper: number;
  totalOtrosImpuestos: number;
}

export interface RespuestaSunat {
  success: boolean;
  codigoRespuesta?: string;
  descripcionRespuesta?: string;
  numeroTicket?: string;
  fechaProceso?: string;
  horaProceso?: string;
  codigoHash?: string;
  enlacePdf?: string;
  enlaceXml?: string;
  enlaceCdr?: string;
  observaciones?: string[];
  errores?: string[];
}

export interface ConfiguracionSunat {
  entorno: 'produccion' | 'pruebas';
  rucEmisor: string;
  usuarioSol: string;
  claveSol: string;
  certificadoDigital?: string;
  urlServicio: string;
  timeoutSegundos: number;
}

// =======================================================
// VALIDACIONES ESPECÍFICAS SUNAT
// =======================================================

/**
 * Validar RUC según algoritmo SUNAT
 */
export const validarRucSunat = (ruc: string): { valido: boolean; mensaje?: string; tipoContribuyente?: string } => {
  if (!ruc || ruc.length !== 11) {
    return { valido: false, mensaje: 'RUC debe tener 11 dígitos' };
  }

  const primerDigito = ruc[0];
  const segundoDigito = ruc[1];
  
  // Tipos de contribuyente según primer dígito
  const tiposContribuyente: Record<string, string> = {
    '10': 'DNI',
    '15': 'CE - Carnet de Extranjería',
    '17': 'PAS - Pasaporte',
    '20': 'RUC - Persona Jurídica'
  };

  const tipoKey = primerDigito + segundoDigito;
  const tipoContribuyente = tiposContribuyente[tipoKey];

  if (!tipoContribuyente) {
    return { valido: false, mensaje: 'Tipo de contribuyente no válido' };
  }

  // Validar dígito verificador
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 10; i++) {
    suma += parseInt(ruc[i]) * factores[i];
  }

  const residuo = suma % 11;
  const digitoVerificador = residuo < 2 ? residuo : 11 - residuo;

  if (parseInt(ruc[10]) !== digitoVerificador) {
    return { valido: false, mensaje: 'Dígito verificador incorrecto' };
  }

  return { 
    valido: true, 
    tipoContribuyente 
  };
};

/**
 * Validar serie de documento electrónico
 */
export const validarSerieSunat = (
  serie: string, 
  tipoDocumento: string
): { valido: boolean; mensaje?: string } => {
  if (!serie || serie.length !== 4) {
    return { valido: false, mensaje: 'Serie debe tener 4 caracteres' };
  }

  const primerCaracter = serie[0].toUpperCase();
  const restantes = serie.slice(1);

  // Validar formato según tipo de documento
  switch (tipoDocumento) {
    case TIPOS_DOCUMENTO_ELECTRONICO.FACTURA:
      if (primerCaracter !== 'F' || !/^\d{3}$/.test(restantes)) {
        return { valido: false, mensaje: 'Formato de serie inválido para factura (debe ser F###)' };
      }
      break;

    case TIPOS_DOCUMENTO_ELECTRONICO.BOLETA:
      if (primerCaracter !== 'B' || !/^\d{3}$/.test(restantes)) {
        return { valido: false, mensaje: 'Formato de serie inválido para boleta (debe ser B###)' };
      }
      break;

    case TIPOS_DOCUMENTO_ELECTRONICO.NOTA_CREDITO:
      if (!/^[FB]C\d{2}$/.test(serie.toUpperCase())) {
        return { valido: false, mensaje: 'Formato de serie inválido para nota de crédito' };
      }
      break;

    case TIPOS_DOCUMENTO_ELECTRONICO.NOTA_DEBITO:
      if (!/^[FB]D\d{2}$/.test(serie.toUpperCase())) {
        return { valido: false, mensaje: 'Formato de serie inválido para nota de débito' };
      }
      break;

    default:
      return { valido: false, mensaje: 'Tipo de documento no soportado' };
  }

  return { valido: true };
};

/**
 * Validar correlativo de documento
 */
export const validarCorrelativoSunat = (
  correlativo: number
): { valido: boolean; mensaje?: string } => {
  if (!correlativo || correlativo < 1 || correlativo > 99999999) {
    return { valido: false, mensaje: 'Correlativo debe estar entre 1 y 99,999,999' };
  }

  return { valido: true };
};

// =======================================================
// GENERADORES DE CÓDIGOS SUNAT
// =======================================================

/**
 * Generar siguiente correlativo para una serie
 */
export const generarSiguienteCorrelativo = (
  ultimoCorrelativo: number
): number => {
  return ultimoCorrelativo + 1;
};

/**
 * Generar número completo de documento
 */
export const generarNumeroDocumento = (
  serie: string, 
  correlativo: number
): string => {
  const correlativoFormateado = correlativo.toString().padStart(8, '0');
  return `${serie}-${correlativoFormateado}`;
};

/**
 * Generar hash de documento (simulado)
 */
export const generarHashDocumento = (
  tipoDocumento: string,
  serie: string,
  correlativo: number,
  fechaEmision: string,
  importeTotal: number
): string => {
  const datos = `${tipoDocumento}${serie}${correlativo}${fechaEmision}${importeTotal}`;
  
  // En producción, esto debería usar un algoritmo hash real como SHA-256
  let hash = 0;
  for (let i = 0; i < datos.length; i++) {
    const char = datos.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32 bits
  }
  
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
};

// =======================================================
// MAPEO DE CÓDIGOS SUNAT
// =======================================================

/**
 * Obtener código de afectación IGV según configuración
 */
export const obtenerCodigoAfectacionIgv = (
  afectoIgv: boolean,
  esGratuito = false,
  esExportacion = false
): string => {
  if (esExportacion) return AFECTACION_IGV.EXPORTACION;
  
  if (esGratuito) {
    return afectoIgv ? AFECTACION_IGV.GRATUITO_GRAVADO : AFECTACION_IGV.GRATUITO_INAFECTO;
  }
  
  return afectoIgv ? AFECTACION_IGV.GRAVADO : AFECTACION_IGV.INAFECTO;
};

/**
 * Obtener descripción de afectación IGV
 */
export const obtenerDescripcionAfectacionIgv = (codigoAfectacion: string): string => {
  return NOMBRES_AFECTACION_IGV[codigoAfectacion as keyof typeof NOMBRES_AFECTACION_IGV] || 'Desconocido';
};

/**
 * Mapear unidad de medida a código SUNAT
 */
export const mapearUnidadMedidaSunat = (unidadLocal: string): string => {
  const mapeoUnidades: Record<string, string> = {
    'unidad': UNIDADES_MEDIDA.UNIDAD,
    'und': UNIDADES_MEDIDA.UNIDAD,
    'kg': UNIDADES_MEDIDA.KILOGRAMOS,
    'kilogramo': UNIDADES_MEDIDA.KILOGRAMOS,
    'metro': UNIDADES_MEDIDA.METROS,
    'm': UNIDADES_MEDIDA.METROS,
    'litro': UNIDADES_MEDIDA.LITROS,
    'l': UNIDADES_MEDIDA.LITROS,
    'servicio': UNIDADES_MEDIDA.SERVICIOS,
    'hora': UNIDADES_MEDIDA.HORAS,
    'h': UNIDADES_MEDIDA.HORAS
  };

  return mapeoUnidades[unidadLocal.toLowerCase()] || UNIDADES_MEDIDA.UNIDAD;
};

// =======================================================
// CONSTRUCTORES DE ESTRUCTURAS SUNAT
// =======================================================

/**
 * Construir estructura de emisor para SUNAT
 */
export const construirEmisorSunat = (datosEmpresa: any) => {
  return {
    ruc: datosEmpresa.ruc,
    razonSocial: datosEmpresa.razonSocial,
    nombreComercial: datosEmpresa.nombreComercial || '',
    direccion: datosEmpresa.direccion,
    ubigeo: datosEmpresa.ubigeo || '150101', // Lima por defecto
    codigoPais: 'PE'
  };
};

/**
 * Construir estructura de receptor para SUNAT
 */
export const construirReceptorSunat = (datosCliente: any) => {
  return {
    tipoDocumento: datosCliente.tipoDocumento,
    numeroDocumento: datosCliente.numeroDocumento,
    razonSocial: datosCliente.razonSocial || datosCliente.nombres + ' ' + datosCliente.apellidos,
    direccion: datosCliente.direccion || '-',
    email: datosCliente.email || '',
    codigoPais: 'PE'
  };
};

/**
 * Construir item para SUNAT
 */
export const construirItemSunat = (
  item: any,
  numero: number
): ItemDocumentoSunat => {
  const codigoAfectacion = obtenerCodigoAfectacionIgv(item.afectoIgv || true);
  
  return {
    codigo: item.codigo || `ITEM${numero.toString().padStart(3, '0')}`,
    descripcion: item.descripcion || item.nombre,
    unidadMedida: mapearUnidadMedidaSunat(item.unidadMedida || 'unidad'),
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    afectacionIgv: codigoAfectacion,
    tipoImpuesto: TRIBUTOS.IGV,
    porcentajeIgv: item.afectoIgv ? 18 : 0,
    montoIgv: item.igv || 0,
    valorVenta: item.subtotal || (item.cantidad * item.precioUnitario),
    precioVenta: item.total || item.valorVenta
  };
};

// =======================================================
// VALIDACIONES DE NEGOCIO SUNAT
// =======================================================

/**
 * Validar límites para emisión electrónica
 */
export const validarLimitesEmisionSunat = (
  tipoDocumento: string,
  importeTotal: number,
  tipoDocumentoReceptor: string
): { valido: boolean; mensaje?: string } => {
  // Facturas con RUC obligatorio para montos >= 700 soles
  if (tipoDocumento === TIPOS_DOCUMENTO_ELECTRONICO.FACTURA) {
    if (tipoDocumentoReceptor !== TIPOS_DOCUMENTO_IDENTIDAD.RUC) {
      return { valido: false, mensaje: 'Las facturas requieren RUC del cliente' };
    }
  }

  // Boletas tienen límite de 700 soles sin RUC
  if (tipoDocumento === TIPOS_DOCUMENTO_ELECTRONICO.BOLETA) {
    if (importeTotal >= 700 && tipoDocumentoReceptor !== TIPOS_DOCUMENTO_IDENTIDAD.RUC) {
      return { valido: false, mensaje: 'Boletas de 700 soles o más requieren RUC del cliente' };
    }
  }

  return { valido: true };
};

/**
 * Validar fecha de emisión según SUNAT
 */
export const validarFechaEmisionSunat = (fechaEmision: Date): { valido: boolean; mensaje?: string } => {
  const hoy = new Date();
  const hace7Dias = new Date();
  hace7Dias.setDate(hoy.getDate() - 7);

  if (fechaEmision > hoy) {
    return { valido: false, mensaje: 'La fecha de emisión no puede ser futura' };
  }

  if (fechaEmision < hace7Dias) {
    return { valido: false, mensaje: 'La fecha de emisión no puede ser mayor a 7 días atrás' };
  }

  return { valido: true };
};

// =======================================================
// UTILIDADES DE COMUNICACIÓN SUNAT
// =======================================================

/**
 * Construir payload para envío a SUNAT (vía Nubefact u otro PSE)
 */
export const construirPayloadSunat = (
  documento: DocumentoElectronicoSunat,
  configuracion: ConfiguracionSunat
): any => {
  return {
    operacion: 'generar_comprobante',
    tipo_de_comprobante: documento.tipoDocumento,
    serie: documento.serie,
    numero: documento.correlativo,
    sunat_transaction: 1,
    cliente_tipo_de_documento: documento.receptor.tipoDocumento,
    cliente_numero_de_documento: documento.receptor.numeroDocumento,
    cliente_denominacion: documento.receptor.razonSocial,
    cliente_direccion: documento.receptor.direccion,
    cliente_email: documento.receptor.email,
    fecha_de_emision: documento.fechaEmision,
    fecha_de_vencimiento: documento.fechaEmision, // Mismo día por defecto
    moneda: documento.moneda,
    tipo_de_operacion: documento.tipoOperacion,
    porcentaje_de_igv: 18.00,
    items: documento.items.map((item, index) => ({
      item: index + 1,
      codigo_interno: item.codigo,
      descripcion: item.descripcion,
      codigo_producto_sunat: item.codigo,
      unidad_de_medida: item.unidadMedida,
      cantidad: item.cantidad,
      valor_unitario: item.precioUnitario,
      precio_unitario: item.precioVenta,
      descuento: 0,
      subtotal: item.valorVenta,
      tipo_de_igv: parseInt(item.afectacionIgv),
      igv: item.montoIgv,
      total: item.precioVenta
    })),
    total_operaciones_gravadas: documento.totales.operacionesGravadas,
    total_operaciones_exoneradas: documento.totales.operacionesExoneradas,
    total_operaciones_inafectas: documento.totales.operacionesInafectas,
    total_igv: documento.totales.totalIgv,
    total: documento.totales.importeTotal,
    observaciones: documento.observaciones || '',
    documento_que_se_modifica_tipo: '',
    documento_que_se_modifica_serie: '',
    documento_que_se_modifica_numero: '',
    tipo_de_nota_de_credito: '',
    tipo_de_nota_de_debito: ''
  };
};

/**
 * Interpretar respuesta de SUNAT
 */
export const interpretarRespuestaSunat = (respuesta: any): RespuestaSunat => {
  return {
    success: respuesta.errors === null || respuesta.errors === undefined,
    codigoRespuesta: respuesta.sunat_response_code || '',
    descripcionRespuesta: respuesta.sunat_description || '',
    numeroTicket: respuesta.ticket_number || '',
    fechaProceso: respuesta.sunat_response_date || '',
    horaProceso: respuesta.sunat_response_time || '',
    codigoHash: respuesta.hash || '',
    enlacePdf: respuesta.enlace_del_pdf || '',
    enlaceXml: respuesta.enlace_del_xml || '',
    enlaceCdr: respuesta.enlace_del_cdr || '',
    observaciones: respuesta.sunat_note ? [respuesta.sunat_note] : [],
    errores: respuesta.errors || []
  };
};

// =======================================================
// UTILIDADES DE CONSULTAS
// =======================================================

/**
 * Construir filtros para consultas de documentos
 */
export const construirFiltrosConsultaSunat = (filtros: any) => {
  const filtrosSunat: any = {};

  if (filtros.fechaInicio) {
    filtrosSunat.fecha_de_emision_inicio = formatearFechaSunat(new Date(filtros.fechaInicio));
  }

  if (filtros.fechaFin) {
    filtrosSunat.fecha_de_emision_fin = formatearFechaSunat(new Date(filtros.fechaFin));
  }

  if (filtros.tipoDocumento) {
    filtrosSunat.tipo_de_comprobante = filtros.tipoDocumento;
  }

  if (filtros.serie) {
    filtrosSunat.serie = filtros.serie;
  }

  if (filtros.numeroDesde) {
    filtrosSunat.numero_desde = filtros.numeroDesde;
  }

  if (filtros.numeroHasta) {
    filtrosSunat.numero_hasta = filtros.numeroHasta;
  }

  return filtrosSunat;
};

// =======================================================
// EXPORTACIONES
// =======================================================

export default {
  validarRucSunat,
  validarSerieSunat,
  validarCorrelativoSunat,
  generarSiguienteCorrelativo,
  generarNumeroDocumento,
  generarHashDocumento,
  obtenerCodigoAfectacionIgv,
  obtenerDescripcionAfectacionIgv,
  mapearUnidadMedidaSunat,
  construirEmisorSunat,
  construirReceptorSunat,
  construirItemSunat,
  validarLimitesEmisionSunat,
  validarFechaEmisionSunat,
  construirPayloadSunat,
  interpretarRespuestaSunat,
  construirFiltrosConsultaSunat
};