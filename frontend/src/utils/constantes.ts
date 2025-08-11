/**
 * Constantes del Sistema - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Constantes específicas para normativa SUNAT
 */

// =======================================================
// CONSTANTES GENERALES DEL SISTEMA
// =======================================================

export const APP_INFO = {
  NOMBRE: 'FELICITAFAC',
  VERSION: '1.0.0',
  DESCRIPCION: 'Sistema de Facturación Electrónica para Perú',
  EMPRESA: 'FELICITAFAC',
  WEBSITE: 'https://felicitafac.com',
  SOPORTE_EMAIL: 'soporte@felicitafac.com',
  SOPORTE_TELEFONO: '+51 1 234 5678'
} as const;

export const CONFIGURACION_SISTEMA = {
  TIMEZONE: 'America/Lima',
  LOCALE: 'es-PE',
  MONEDA_DEFAULT: 'PEN',
  DECIMALES_MONEDA: 2,
  DECIMALES_CANTIDAD: 4,
  SEPARADOR_MILES: ',',
  SEPARADOR_DECIMAL: '.',
  FECHA_FORMATO_DEFAULT: 'DD/MM/YYYY',
  HORA_FORMATO_DEFAULT: 'HH:mm:ss'
} as const;

// =======================================================
// TIPOS DE DOCUMENTOS SUNAT
// =======================================================

export const TIPOS_DOCUMENTO_IDENTIDAD = {
  DNI: '1',
  CARNET_EXTRANJERIA: '4',
  RUC: '6',
  PASAPORTE: '7',
  CEDULA_DIPLOMATICA: 'A'
} as const;

export const NOMBRES_DOCUMENTO_IDENTIDAD = {
  [TIPOS_DOCUMENTO_IDENTIDAD.DNI]: 'DNI',
  [TIPOS_DOCUMENTO_IDENTIDAD.CARNET_EXTRANJERIA]: 'Carnet de Extranjería',
  [TIPOS_DOCUMENTO_IDENTIDAD.RUC]: 'RUC',
  [TIPOS_DOCUMENTO_IDENTIDAD.PASAPORTE]: 'Pasaporte',
  [TIPOS_DOCUMENTO_IDENTIDAD.CEDULA_DIPLOMATICA]: 'Cédula Diplomática'
} as const;

export const TIPOS_DOCUMENTO_ELECTRONICO = {
  FACTURA: '01',
  BOLETA: '03',
  NOTA_CREDITO: '07',
  NOTA_DEBITO: '08',
  GUIA_REMISION: '09',
  RECIBO_HONORARIOS: '12'
} as const;

export const NOMBRES_DOCUMENTO_ELECTRONICO = {
  [TIPOS_DOCUMENTO_ELECTRONICO.FACTURA]: 'Factura Electrónica',
  [TIPOS_DOCUMENTO_ELECTRONICO.BOLETA]: 'Boleta de Venta Electrónica',
  [TIPOS_DOCUMENTO_ELECTRONICO.NOTA_CREDITO]: 'Nota de Crédito Electrónica',
  [TIPOS_DOCUMENTO_ELECTRONICO.NOTA_DEBITO]: 'Nota de Débito Electrónica',
  [TIPOS_DOCUMENTO_ELECTRONICO.GUIA_REMISION]: 'Guía de Remisión Electrónica',
  [TIPOS_DOCUMENTO_ELECTRONICO.RECIBO_HONORARIOS]: 'Recibo por Honorarios Electrónico'
} as const;

// =======================================================
// CÓDIGOS DE MONEDA
// =======================================================

export const MONEDAS = {
  PEN: 'PEN',
  USD: 'USD',
  EUR: 'EUR'
} as const;

export const NOMBRES_MONEDAS = {
  [MONEDAS.PEN]: 'Soles',
  [MONEDAS.USD]: 'Dólares Americanos',
  [MONEDAS.EUR]: 'Euros'
} as const;

export const SIMBOLOS_MONEDAS = {
  [MONEDAS.PEN]: 'S/',
  [MONEDAS.USD]: '$',
  [MONEDAS.EUR]: '€'
} as const;

// =======================================================
// CÓDIGOS DE UNIDADES DE MEDIDA SUNAT
// =======================================================

export const UNIDADES_MEDIDA = {
  UNIDAD: 'NIU',
  KILOGRAMOS: 'KGM',
  METROS: 'MTR',
  LITROS: 'LTR',
  PIEZAS: 'H87',
  CAJAS: 'BX',
  PAQUETES: 'PK',
  CONJUNTOS: 'SET',
  SERVICIOS: 'ZZ',
  HORAS: 'HUR',
  DIAS: 'DAY',
  TONELADAS: 'TNE',
  METROS_CUADRADOS: 'MTK',
  METROS_CUBICOS: 'MTQ'
} as const;

export const NOMBRES_UNIDADES_MEDIDA = {
  [UNIDADES_MEDIDA.UNIDAD]: 'Unidad',
  [UNIDADES_MEDIDA.KILOGRAMOS]: 'Kilogramos',
  [UNIDADES_MEDIDA.METROS]: 'Metros',
  [UNIDADES_MEDIDA.LITROS]: 'Litros',
  [UNIDADES_MEDIDA.PIEZAS]: 'Piezas',
  [UNIDADES_MEDIDA.CAJAS]: 'Cajas',
  [UNIDADES_MEDIDA.PAQUETES]: 'Paquetes',
  [UNIDADES_MEDIDA.CONJUNTOS]: 'Conjuntos',
  [UNIDADES_MEDIDA.SERVICIOS]: 'Servicios',
  [UNIDADES_MEDIDA.HORAS]: 'Horas',
  [UNIDADES_MEDIDA.DIAS]: 'Días',
  [UNIDADES_MEDIDA.TONELADAS]: 'Toneladas',
  [UNIDADES_MEDIDA.METROS_CUADRADOS]: 'Metros cuadrados',
  [UNIDADES_MEDIDA.METROS_CUBICOS]: 'Metros cúbicos'
} as const;

// =======================================================
// TIPOS DE OPERACIÓN
// =======================================================

export const TIPOS_OPERACION = {
  VENTA_INTERNA: '0101',
  EXPORTACION: '0200',
  NO_DOMICILIADOS: '0401',
  VENTA_INTERNA_ANTICIPOS: '0102',
  VENTA_ITINERANTE: '0103',
  VENTA_CONSIGNACION: '0104'
} as const;

export const NOMBRES_TIPOS_OPERACION = {
  [TIPOS_OPERACION.VENTA_INTERNA]: 'Venta Interna',
  [TIPOS_OPERACION.EXPORTACION]: 'Exportación',
  [TIPOS_OPERACION.NO_DOMICILIADOS]: 'No Domiciliados',
  [TIPOS_OPERACION.VENTA_INTERNA_ANTICIPOS]: 'Venta Interna con Anticipos',
  [TIPOS_OPERACION.VENTA_ITINERANTE]: 'Venta Itinerante',
  [TIPOS_OPERACION.VENTA_CONSIGNACION]: 'Venta en Consignación'
} as const;

// =======================================================
// CÓDIGOS DE AFECTACIÓN IGV
// =======================================================

export const AFECTACION_IGV = {
  GRAVADO: '10',
  EXONERADO: '20',
  INAFECTO: '30',
  EXPORTACION: '40',
  GRATUITO_GRAVADO: '11',
  GRATUITO_EXONERADO: '21',
  GRATUITO_INAFECTO: '31'
} as const;

export const NOMBRES_AFECTACION_IGV = {
  [AFECTACION_IGV.GRAVADO]: 'Gravado - Operación Onerosa',
  [AFECTACION_IGV.EXONERADO]: 'Exonerado - Operación Onerosa',
  [AFECTACION_IGV.INAFECTO]: 'Inafecto - Operación Onerosa',
  [AFECTACION_IGV.EXPORTACION]: 'Exportación',
  [AFECTACION_IGV.GRATUITO_GRAVADO]: 'Gratuito - Gravado',
  [AFECTACION_IGV.GRATUITO_EXONERADO]: 'Gratuito - Exonerado',
  [AFECTACION_IGV.GRATUITO_INAFECTO]: 'Gratuito - Inafecto'
} as const;

// =======================================================
// CÓDIGOS DE TRIBUTOS
// =======================================================

export const TRIBUTOS = {
  IGV: '1000',
  IVAP: '1016',
  ISC: '2000',
  ICBPER: '7152',
  OTROS: '9999'
} as const;

export const NOMBRES_TRIBUTOS = {
  [TRIBUTOS.IGV]: 'IGV - Impuesto General a las Ventas',
  [TRIBUTOS.IVAP]: 'IVAP - Impuesto a la Venta de Arroz Pilado',
  [TRIBUTOS.ISC]: 'ISC - Impuesto Selectivo al Consumo',
  [TRIBUTOS.ICBPER]: 'ICBPER - Impuesto Consumo Bolsas Plásticas',
  [TRIBUTOS.OTROS]: 'Otros Tributos'
} as const;

// =======================================================
// TASAS DE IMPUESTOS
// =======================================================

export const TASAS_IMPUESTOS = {
  IGV: 0.18,
  ICBPER: 0.30, // Por bolsa
  ISC_COMBUSTIBLES: 0.12,
  ISC_CIGARRILLOS: 0.35
} as const;

// =======================================================
// MÉTODOS DE PAGO
// =======================================================

export const METODOS_PAGO = {
  CONTADO: 'contado',
  CREDITO: 'credito',
  TRANSFERENCIA: 'transferencia',
  DEPOSITO: 'deposito',
  TARJETA_CREDITO: 'tarjeta_credito',
  TARJETA_DEBITO: 'tarjeta_debito',
  YAPE: 'yape',
  PLIN: 'plin',
  BILLETERA_DIGITAL: 'billetera_digital'
} as const;

export const NOMBRES_METODOS_PAGO = {
  [METODOS_PAGO.CONTADO]: 'Efectivo',
  [METODOS_PAGO.CREDITO]: 'Crédito',
  [METODOS_PAGO.TRANSFERENCIA]: 'Transferencia Bancaria',
  [METODOS_PAGO.DEPOSITO]: 'Depósito Bancario',
  [METODOS_PAGO.TARJETA_CREDITO]: 'Tarjeta de Crédito',
  [METODOS_PAGO.TARJETA_DEBITO]: 'Tarjeta de Débito',
  [METODOS_PAGO.YAPE]: 'Yape',
  [METODOS_PAGO.PLIN]: 'Plin',
  [METODOS_PAGO.BILLETERA_DIGITAL]: 'Billetera Digital'
} as const;

// =======================================================
// ESTADOS DE DOCUMENTOS
// =======================================================

export const ESTADOS_DOCUMENTO = {
  BORRADOR: 'borrador',
  ENVIADO: 'enviado',
  ACEPTADO: 'aceptado',
  RECHAZADO: 'rechazado',
  ANULADO: 'anulado',
  PENDIENTE: 'pendiente'
} as const;

export const NOMBRES_ESTADOS_DOCUMENTO = {
  [ESTADOS_DOCUMENTO.BORRADOR]: 'Borrador',
  [ESTADOS_DOCUMENTO.ENVIADO]: 'Enviado a SUNAT',
  [ESTADOS_DOCUMENTO.ACEPTADO]: 'Aceptado por SUNAT',
  [ESTADOS_DOCUMENTO.RECHAZADO]: 'Rechazado por SUNAT',
  [ESTADOS_DOCUMENTO.ANULADO]: 'Anulado',
  [ESTADOS_DOCUMENTO.PENDIENTE]: 'Pendiente'
} as const;

export const COLORES_ESTADOS_DOCUMENTO = {
  [ESTADOS_DOCUMENTO.BORRADOR]: 'gray',
  [ESTADOS_DOCUMENTO.ENVIADO]: 'blue',
  [ESTADOS_DOCUMENTO.ACEPTADO]: 'green',
  [ESTADOS_DOCUMENTO.RECHAZADO]: 'red',
  [ESTADOS_DOCUMENTO.ANULADO]: 'orange',
  [ESTADOS_DOCUMENTO.PENDIENTE]: 'yellow'
} as const;

// =======================================================
// TIPOS DE NOTA DE CRÉDITO/DÉBITO
// =======================================================

export const TIPOS_NOTA_CREDITO = {
  ANULACION: '01',
  ANULACION_ERROR_RUC: '02',
  CORRECCION_ERROR_DESCRIPCION: '03',
  DESCUENTO_GLOBAL: '04',
  DESCUENTO_ITEM: '05',
  DEVOLUCION_TOTAL: '06',
  DEVOLUCION_PARCIAL: '07',
  BONIFICACION: '08',
  DISMINUCION_VALOR: '09',
  OTROS_CONCEPTOS: '10'
} as const;

export const NOMBRES_TIPOS_NOTA_CREDITO = {
  [TIPOS_NOTA_CREDITO.ANULACION]: 'Anulación de la operación',
  [TIPOS_NOTA_CREDITO.ANULACION_ERROR_RUC]: 'Anulación por error en el RUC',
  [TIPOS_NOTA_CREDITO.CORRECCION_ERROR_DESCRIPCION]: 'Corrección por error en la descripción',
  [TIPOS_NOTA_CREDITO.DESCUENTO_GLOBAL]: 'Descuento global',
  [TIPOS_NOTA_CREDITO.DESCUENTO_ITEM]: 'Descuento por ítem',
  [TIPOS_NOTA_CREDITO.DEVOLUCION_TOTAL]: 'Devolución total',
  [TIPOS_NOTA_CREDITO.DEVOLUCION_PARCIAL]: 'Devolución parcial',
  [TIPOS_NOTA_CREDITO.BONIFICACION]: 'Bonificación',
  [TIPOS_NOTA_CREDITO.DISMINUCION_VALOR]: 'Disminución en el valor',
  [TIPOS_NOTA_CREDITO.OTROS_CONCEPTOS]: 'Otros conceptos'
} as const;

export const TIPOS_NOTA_DEBITO = {
  INTERES_MORA: '01',
  AUMENTO_VALOR: '02',
  PENALIDADES: '03',
  OTROS_CONCEPTOS: '10'
} as const;

export const NOMBRES_TIPOS_NOTA_DEBITO = {
  [TIPOS_NOTA_DEBITO.INTERES_MORA]: 'Intereses por mora',
  [TIPOS_NOTA_DEBITO.AUMENTO_VALOR]: 'Aumento en el valor',
  [TIPOS_NOTA_DEBITO.PENALIDADES]: 'Penalidades/otros conceptos',
  [TIPOS_NOTA_DEBITO.OTROS_CONCEPTOS]: 'Otros conceptos'
} as const;

// =======================================================
// UBIGEO PERÚ (PRINCIPALES)
// =======================================================

export const DEPARTAMENTOS_PERU = {
  LIMA: '15',
  AREQUIPA: '04',
  TRUJILLO: '13',
  CUSCO: '08',
  PIURA: '20',
  LAMBAYEQUE: '14',
  JUNIN: '12',
  ICA: '11',
  ANCASH: '02',
  CAJAMARCA: '06'
} as const;

export const PROVINCIAS_LIMA = {
  LIMA: '01',
  CALLAO: '07',
  HUAURA: '09',
  CAÑETE: '05'
} as const;

export const DISTRITOS_LIMA = {
  LIMA: '01',
  MIRAFLORES: '18',
  SAN_ISIDRO: '27',
  SURCO: '41',
  LA_MOLINA: '17',
  BARRANCO: '04',
  SAN_BORJA: '30'
} as const;

// =======================================================
// ROLES Y PERMISOS DEL SISTEMA
// =======================================================

export const ROLES_SISTEMA = {
  ADMINISTRADOR: 'administrador',
  CONTADOR: 'contador',
  VENDEDOR: 'vendedor',
  CLIENTE: 'cliente'
} as const;

export const NOMBRES_ROLES = {
  [ROLES_SISTEMA.ADMINISTRADOR]: 'Administrador',
  [ROLES_SISTEMA.CONTADOR]: 'Contador',
  [ROLES_SISTEMA.VENDEDOR]: 'Vendedor',
  [ROLES_SISTEMA.CLIENTE]: 'Cliente'
} as const;

export const PERMISOS_SISTEMA = [
  'ver_dashboard',
  'crear_facturas',
  'ver_reportes',
  'exportar_datos',
  'gestionar_inventario',
  'gestionar_clientes',
  'ver_contabilidad',
  'generar_ple',
  'validar_documentos',
  'configurar_sistema',
  'gestionar_usuarios',
  'ver_ventas',
  'ver_mis_documentos'
] as const;

// =======================================================
// CONFIGURACIÓN DE PAGINACIÓN
// =======================================================

export const PAGINACION = {
  TAMAÑO_DEFAULT: 20,
  TAMAÑOS_DISPONIBLES: [10, 20, 50, 100],
  MAXIMO_ELEMENTOS: 1000
} as const;

// =======================================================
// LÍMITES DEL SISTEMA
// =======================================================

export const LIMITES_SISTEMA = {
  MAX_ITEMS_DOCUMENTO: 500,
  MAX_LONGITUD_DESCRIPCION: 500,
  MAX_LONGITUD_OBSERVACIONES: 1000,
  MAX_TAMAÑO_ARCHIVO_MB: 10,
  MAX_DOCUMENTOS_POR_DIA: 1000,
  MAX_CLIENTES: 10000,
  MAX_PRODUCTOS: 50000
} as const;

// =======================================================
// CONFIGURACIÓN DE ARCHIVOS
// =======================================================

export const ARCHIVOS = {
  TIPOS_PERMITIDOS: ['.pdf', '.xml', '.zip', '.xlsx', '.csv'],
  TIPOS_IMAGEN: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  TIPOS_DOCUMENTO: ['.pdf', '.doc', '.docx', '.txt'],
  MAX_TAMAÑO_MB: 10
} as const;

// =======================================================
// URLs Y ENDPOINTS
// =======================================================

export const URLS_SUNAT = {
  PRODUCCION: 'https://api.nubefact.com',
  TESTING: 'https://demo-api.nubefact.com',
  CONSULTA_RUC: 'https://api.apis.net.pe/v1/ruc',
  CONSULTA_DNI: 'https://api.apis.net.pe/v1/dni'
} as const;

export const ENDPOINTS_API = {
  AUTH: '/auth',
  DOCUMENTOS: '/documentos',
  CLIENTES: '/clientes',
  PRODUCTOS: '/productos',
  INVENTARIO: '/inventario',
  REPORTES: '/reportes',
  CONFIGURACION: '/configuracion'
} as const;

// =======================================================
// MENSAJES DEL SISTEMA
// =======================================================

export const MENSAJES = {
  EXITO: {
    GUARDADO: 'Información guardada correctamente',
    ELIMINADO: 'Elemento eliminado correctamente',
    ENVIADO: 'Documento enviado a SUNAT correctamente',
    ACTUALIZADO: 'Información actualizada correctamente'
  },
  ERROR: {
    GENERICO: 'Ha ocurrido un error inesperado',
    RED: 'Error de conexión. Verifique su internet',
    PERMISOS: 'No tiene permisos para realizar esta acción',
    VALIDACION: 'Verifique los datos ingresados',
    SUNAT: 'Error al comunicarse con SUNAT'
  },
  CONFIRMACION: {
    ELIMINAR: '¿Está seguro de eliminar este elemento?',
    ANULAR: '¿Está seguro de anular este documento?',
    SALIR: '¿Está seguro de salir? Los cambios no guardados se perderán'
  }
} as const;

// =======================================================
// EXPORTACIONES AGRUPADAS
// =======================================================

export const CATALOGOS_SUNAT = {
  TIPOS_DOCUMENTO_IDENTIDAD,
  NOMBRES_DOCUMENTO_IDENTIDAD,
  TIPOS_DOCUMENTO_ELECTRONICO,
  NOMBRES_DOCUMENTO_ELECTRONICO,
  UNIDADES_MEDIDA,
  NOMBRES_UNIDADES_MEDIDA,
  AFECTACION_IGV,
  NOMBRES_AFECTACION_IGV,
  TRIBUTOS,
  NOMBRES_TRIBUTOS,
  TIPOS_OPERACION,
  NOMBRES_TIPOS_OPERACION
} as const;

export const CATALOGOS_SISTEMA = {
  MONEDAS,
  NOMBRES_MONEDAS,
  SIMBOLOS_MONEDAS,
  METODOS_PAGO,
  NOMBRES_METODOS_PAGO,
  ESTADOS_DOCUMENTO,
  NOMBRES_ESTADOS_DOCUMENTO,
  COLORES_ESTADOS_DOCUMENTO,
  ROLES_SISTEMA,
  NOMBRES_ROLES
} as const;

// =======================================================
// EXPORTACIÓN DEFAULT
// =======================================================

export default {
  APP_INFO,
  CONFIGURACION_SISTEMA,
  CATALOGOS_SUNAT,
  CATALOGOS_SISTEMA,
  TASAS_IMPUESTOS,
  PAGINACION,
  LIMITES_SISTEMA,
  ARCHIVOS,
  URLS_SUNAT,
  ENDPOINTS_API,
  MENSAJES
};