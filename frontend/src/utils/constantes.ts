/**
 * Constantes del Sistema - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Constantes globales y configuraciones del sistema
 */

// =======================================================
// CONSTANTES DE APLICACIÓN
// =======================================================

export const APP_CONFIG = {
  NOMBRE: 'FELICITAFAC',
  VERSION: '1.0.0',
  DESCRIPCION: 'Sistema de Facturación Electrónica para Perú',
  EMPRESA: 'FELICITAFAC S.A.C.',
  SOPORTE_EMAIL: 'soporte@felicitafac.com',
  SOPORTE_TELEFONO: '+51 999 123 456',
  WEBSITE: 'https://felicitafac.com',
} as const;

// =======================================================
// CONFIGURACIÓN DE API
// =======================================================

export const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
} as const;

export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh/',
    PROFILE: '/auth/profile/',
    CHANGE_PASSWORD: '/auth/change-password/',
  },
  
  // Usuarios
  USUARIOS: {
    LIST: '/usuarios/',
    DETAIL: (id: number) => `/usuarios/${id}/`,
    CREATE: '/usuarios/',
    UPDATE: (id: number) => `/usuarios/${id}/`,
    DELETE: (id: number) => `/usuarios/${id}/`,
  },
  
  // Clientes
  CLIENTES: {
    LIST: '/clientes/',
    DETAIL: (id: number) => `/clientes/${id}/`,
    CREATE: '/clientes/',
    UPDATE: (id: number) => `/clientes/${id}/`,
    DELETE: (id: number) => `/clientes/${id}/`,
    BUSCAR: '/clientes/buscar/',
    VALIDAR_DOCUMENTO: '/clientes/validar-documento/',
    CONSULTAR_SUNAT: '/clientes/consultar-sunat/',
  },
  
  // Productos
  PRODUCTOS: {
    LIST: '/api/productos/productos/',
    DETAIL: (id: number) => `/api/productos/productos/${id}/`,
    CREATE: '/api/productos/productos/',
    UPDATE: (id: number) => `/api/productos/productos/${id}/`,
    DELETE: (id: number) => `/api/productos/productos/${id}/`,
    CATEGORIAS: '/api/productos/categorias/',
    TIPOS: '/api/productos/tipos-producto/',
    ALERTAS_STOCK: '/api/productos/alertas-stock/',
    ACTUALIZAR_PRECIOS: '/api/productos/actualizar-precios/',
  },
  
  // Facturación
  FACTURACION: {
    FACTURAS: '/facturacion/facturas/',
    DETALLE: (id: number) => `/facturacion/facturas/${id}/`,
    CREAR: '/facturacion/facturas/',
    ANULAR: (id: number) => `/facturacion/facturas/${id}/anular/`,
    SERIES: '/facturacion/series/',
    CALCULAR_TOTALES: '/facturacion/calcular-totales/',
    VALIDAR_STOCK: '/facturacion/validar-stock/',
    RESUMEN_VENTAS: '/facturacion/resumen-ventas/',
  },
  
  // Inventario
  INVENTARIO: {
    MOVIMIENTOS: '/inventario/movimientos/',
    AJUSTAR: '/inventario/ajustar/',
    REPORTES: '/inventario/reportes/',
    KARDEX: (id: number) => `/inventario/kardex/${id}/`,
  },
  
  // Reportes
  REPORTES: {
    VENTAS_DIARIAS: '/reportes/ventas-diarias/',
    TOP_PRODUCTOS: '/reportes/top-productos/',
    TOP_CLIENTES: '/reportes/top-clientes/',
    CARTERA_CLIENTES: '/reportes/cartera-clientes/',
  },
} as const;

// =======================================================
// CONSTANTES DE FACTURACIÓN SUNAT
// =======================================================

export const SUNAT_CONFIG = {
  IGV_TASA: 0.18,
  RUC_EMPRESA: '20123456789', // Cambiar por RUC real
  RAZON_SOCIAL_EMPRESA: 'FELICITAFAC S.A.C.', // Cambiar por razón social real
  DIRECCION_EMPRESA: 'Av. Javier Prado Este 1234, San Isidro, Lima', // Cambiar por dirección real
} as const;

export const TIPOS_DOCUMENTO = {
  FACTURA: 'factura',
  BOLETA: 'boleta',
  NOTA_CREDITO: 'nota_credito',
  NOTA_DEBITO: 'nota_debito',
} as const;

export const TIPOS_DOCUMENTO_SUNAT = {
  '01': 'Factura',
  '03': 'Boleta de Venta',
  '07': 'Nota de Crédito',
  '08': 'Nota de Débito',
} as const;

export const TIPOS_DOCUMENTO_IDENTIDAD = {
  DNI: '1',
  CARNET_EXTRANJERIA: '4',
  RUC: '6',
  PASAPORTE: '7',
} as const;

export const TIPOS_AFECTACION_IGV = {
  GRAVADO_ONEROSA: '10',
  GRAVADO_RETIRO: '11',
  GRAVADO_IVAP: '17',
  EXONERADO_ONEROSA: '20',
  EXONERADO_TRANSFERENCIA: '21',
  INAFECTO_ONEROSA: '30',
  INAFECTO_RETIRO: '31',
  INAFECTO_IVAP: '32',
  EXPORTACION: '40',
} as const;

export const UNIDADES_MEDIDA_SUNAT = {
  UNIDAD: 'NIU',
  KILOGRAMO: 'KGM',
  GRAMO: 'GRM',
  METRO: 'MTR',
  METRO_CUADRADO: 'MTK',
  METRO_CUBICO: 'MTQ',
  LITRO: 'LTR',
  GALON: 'GLL',
  PIEZA: 'H87',
  CAJA: 'BX',
  PAQUETE: 'PK',
  BOLSA: 'BG',
  SERVICIO: 'ZZ',
} as const;

export const SERIES_POR_DEFECTO = {
  FACTURA: 'F001',
  BOLETA: 'B001',
  NOTA_CREDITO: 'FC01',
  NOTA_DEBITO: 'FD01',
} as const;

// =======================================================
// CONSTANTES DE INTERFAZ DE USUARIO
// =======================================================

export const UI_CONFIG = {
  ITEMS_POR_PAGINA: 20,
  ITEMS_POR_PAGINA_OPCIONES: [10, 20, 50, 100],
  DEBOUNCE_DELAY: 300, // milliseconds
  TOAST_DURATION: 5000, // milliseconds
  MODAL_ANIMATION_DURATION: 200, // milliseconds
} as const;

export const COLORES_TEMA = {
  PRIMARIO: '#3B82F6', // blue-500
  SECUNDARIO: '#10B981', // emerald-500
  EXITO: '#10B981', // emerald-500
  ERROR: '#EF4444', // red-500
  ADVERTENCIA: '#F59E0B', // amber-500
  INFO: '#3B82F6', // blue-500
  GRIS: '#6B7280', // gray-500
} as const;

export const ICONOS_ESTADO = {
  ACTIVO: '✅',
  INACTIVO: '❌',
  PENDIENTE: '⏳',
  COMPLETADO: '✅',
  CANCELADO: '❌',
  EN_PROCESO: '🔄',
  ADVERTENCIA: '⚠️',
  INFORMACION: 'ℹ️',
  EXITO: '✅',
  ERROR: '❌',
} as const;

// =======================================================
// CONSTANTES DE VALIDACIÓN
// =======================================================

export const VALIDACIONES = {
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 100,
  },
  
  DNI: {
    LENGTH: 8,
    REGEX: /^\d{8}$/,
  },
  
  RUC: {
    LENGTH: 11,
    REGEX: /^\d{11}$/,
    TIPOS_VALIDOS: [10, 11, 15, 17, 20, 25, 30],
  },
  
  TELEFONO: {
    REGEX: /^(\+51)?[0-9]{7,9}$/,
    MIN_LENGTH: 7,
    MAX_LENGTH: 9,
  },
  
  PRECIO: {
    MIN: 0,
    MAX: 999999999.99,
    DECIMALES: 2,
  },
  
  CANTIDAD: {
    MIN: 0.001,
    MAX: 999999,
    DECIMALES: 3,
  },
  
  DESCUENTO: {
    MIN: 0,
    MAX: 100,
    DECIMALES: 2,
  },
  
  TEXTO: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 255,
  },
} as const;

// =======================================================
// CONSTANTES DE ALMACENAMIENTO LOCAL
// =======================================================

export const STORAGE_KEYS = {
  TOKEN_AUTH: 'felicitafac_token',
  REFRESH_TOKEN: 'felicitafac_refresh_token',
  USER_DATA: 'felicitafac_user',
  THEME: 'felicitafac_theme',
  LAST_ROUTE: 'felicitafac_last_route',
  POS_CONFIG: 'felicitafac_pos_config',
  CARRITO_TEMPORAL: 'felicitafac_carrito_temp',
} as const;

// =======================================================
// CONSTANTES DE PUNTO DE VENTA
// =======================================================

export const POS_CONFIG = {
  MAX_ITEMS_CARRITO: 100,
  PRODUCTOS_POR_PAGINA: 24,
  BUSQUEDA_MIN_CHARS: 2,
  AUTOGUARDADO_INTERVALO: 30000, // 30 segundos
  SHORTCUTS: {
    NUEVA_FACTURA: 'F1',
    NUEVA_BOLETA: 'F2',
    BUSCAR_PRODUCTO: 'F3',
    BUSCAR_CLIENTE: 'F4',
    LIMPIAR_CARRITO: 'ESC',
    GUARDAR: 'CTRL+S',
  },
} as const;

export const ESTADOS_CARRITO = {
  VACIO: 'vacio',
  CON_ITEMS: 'con_items',
  PROCESANDO: 'procesando',
  ERROR: 'error',
} as const;

export const TIPOS_MENSAJE = {
  EXITO: 'success',
  ERROR: 'error',
  ADVERTENCIA: 'warning',
  INFO: 'info',
} as const;

// =======================================================
// CONSTANTES DE REPORTES
// =======================================================

export const PERIODOS_REPORTE = {
  HOY: 'hoy',
  AYER: 'ayer',
  ESTA_SEMANA: 'esta_semana',
  SEMANA_PASADA: 'semana_pasada',
  ESTE_MES: 'este_mes',
  MES_PASADO: 'mes_pasado',
  ESTE_AÑO: 'este_año',
  AÑO_PASADO: 'año_pasado',
  PERSONALIZADO: 'personalizado',
} as const;

export const FORMATOS_EXPORTACION = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json',
} as const;

// =======================================================
// CONSTANTES DE PERMISOS
// =======================================================

export const ROLES = {
  ADMINISTRADOR: 'administrador',
  CONTADOR: 'contador',
  VENDEDOR: 'vendedor',
  CLIENTE: 'cliente',
} as const;

export const PERMISOS = {
  // Usuarios
  CREAR_USUARIOS: 'crear_usuarios',
  EDITAR_USUARIOS: 'editar_usuarios',
  ELIMINAR_USUARIOS: 'eliminar_usuarios',
  VER_USUARIOS: 'ver_usuarios',
  
  // Clientes
  CREAR_CLIENTES: 'crear_clientes',
  EDITAR_CLIENTES: 'editar_clientes',
  ELIMINAR_CLIENTES: 'eliminar_clientes',
  VER_CLIENTES: 'ver_clientes',
  
  // Productos
  CREAR_PRODUCTOS: 'crear_productos',
  EDITAR_PRODUCTOS: 'editar_productos',
  ELIMINAR_PRODUCTOS: 'eliminar_productos',
  VER_PRODUCTOS: 'ver_productos',
  
  // Facturas
  CREAR_FACTURAS: 'crear_facturas',
  EDITAR_FACTURAS: 'editar_facturas',
  ANULAR_FACTURAS: 'anular_facturas',
  VER_FACTURAS: 'ver_facturas',
  
  // Reportes
  VER_REPORTES: 'ver_reportes',
  EXPORTAR_REPORTES: 'exportar_reportes',
  
  // Configuración
  VER_CONFIGURACION: 'ver_configuracion',
  EDITAR_CONFIGURACION: 'editar_configuracion',
  
  // Dashboard
  VER_DASHBOARD: 'ver_dashboard',
} as const;

// =======================================================
// CLIENTES POR DEFECTO
// =======================================================

/**
 * Cliente genérico para ventas sin identificar
 */
export const CLIENTE_GENERICO = {
  id: 0,
  tipo_documento: '1' as const,
  numero_documento: '00000000',
  nombre_o_razon_social: 'Cliente Genérico',
  direccion: 'Sin dirección',
  distrito: 'Lima',
  provincia: 'Lima',
  departamento: 'Lima',
  email: undefined,
};

// =======================================================
// CONSTANTES DE UBICACIÓN PERÚ
// =======================================================

export const DEPARTAMENTOS_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna',
  'Tumbes', 'Ucayali'
] as const;

// =======================================================
// CONSTANTES DE FORMATO
// =======================================================

export const FORMATOS_FECHA = {
  CORTO: 'DD/MM/YYYY',
  LARGO: 'dddd, DD [de] MMMM [de] YYYY',
  ISO: 'YYYY-MM-DD',
  HORA: 'HH:mm',
  FECHA_HORA: 'DD/MM/YYYY HH:mm',
} as const;

export const FORMATOS_NUMERO = {
  ENTERO: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
  DECIMAL_2: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  DECIMAL_3: { minimumFractionDigits: 3, maximumFractionDigits: 3 },
  PORCENTAJE: { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 },
} as const;

// =======================================================
// MENSAJES DEL SISTEMA
// =======================================================

export const MENSAJES = {
  ERRORES: {
    GENERICO: 'Ha ocurrido un error inesperado',
    CONEXION: 'Error de conexión. Verifique su conexión a internet',
    TIMEOUT: 'La operación ha tardado demasiado. Intente nuevamente',
    PERMISOS: 'No tiene permisos para realizar esta acción',
    SESION_EXPIRADA: 'Su sesión ha expirado. Inicie sesión nuevamente',
    SERVIDOR: 'Error del servidor. Contacte al administrador',
    VALIDACION: 'Los datos ingresados no son válidos',
    NOT_FOUND: 'El recurso solicitado no fue encontrado',
  },
  
  EXITO: {
    GUARDADO: 'Los datos se guardaron correctamente',
    ELIMINADO: 'El registro se eliminó correctamente',
    ACTUALIZADO: 'Los datos se actualizaron correctamente',
    ENVIADO: 'Los datos se enviaron correctamente',
    PROCESADO: 'La operación se procesó correctamente',
  },
  
  CONFIRMACIONES: {
    ELIMINAR: '¿Está seguro de que desea eliminar este registro?',
    ANULAR: '¿Está seguro de que desea anular este documento?',
    SALIR: '¿Está seguro de que desea salir? Los cambios no guardados se perderán',
    LIMPIAR: '¿Está seguro de que desea limpiar todos los datos?',
  },
  
  ADVERTENCIAS: {
    STOCK_BAJO: 'El producto tiene stock bajo',
    PRECIO_CERO: 'El producto no tiene precio configurado',
    CLIENTE_GENERICO: 'Se está usando un cliente genérico',
    CAMBIOS_NO_GUARDADOS: 'Hay cambios sin guardar',
  },
} as const;

// =======================================================
// CONFIGURACIÓN DE DESARROLLO
// =======================================================

export const DEV_CONFIG = {
  LOG_LEVEL: 'debug',
  MOCK_API: false,
  SHOW_DEVTOOLS: true,
  ENABLE_HOT_RELOAD: true,
} as const;

// =======================================================
// UTILIDADES DE CONSTANTES
// =======================================================

/**
 * Obtener valor de constante de forma segura
 */
export const obtenerConstante = <T>(objeto: Record<string, T>, clave: string, porDefecto?: T): T | undefined => {
  return objeto[clave] ?? porDefecto;
};

/**
 * Verificar si un valor es válido según constantes
 */
export const esValorValido = <T>(objeto: Record<string, T>, valor: T): boolean => {
  return Object.values(objeto).includes(valor);
};

/**
 * Obtener opciones para select desde constantes
 */
export const obtenerOpcionesSelect = <T extends string>(
  objeto: Record<string, T>,
  etiquetas?: Record<T, string>
): Array<{ value: T; label: string }> => {
  return Object.entries(objeto).map(([key, value]) => ({
    value: value as T,
    label: etiquetas?.[value as T] || key.replace(/_/g, ' ').toLowerCase()
  }));
};

/**
 * Exportar todas las constantes en un objeto para fácil acceso
 */
export const CONSTANTES = {
  APP_CONFIG,
  API_CONFIG,
  API_ENDPOINTS,
  SUNAT_CONFIG,
  TIPOS_DOCUMENTO,
  TIPOS_DOCUMENTO_SUNAT,
  TIPOS_DOCUMENTO_IDENTIDAD,
  TIPOS_AFECTACION_IGV,
  UNIDADES_MEDIDA_SUNAT,
  SERIES_POR_DEFECTO,
  UI_CONFIG,
  COLORES_TEMA,
  ICONOS_ESTADO,
  VALIDACIONES,
  STORAGE_KEYS,
  POS_CONFIG,
  ESTADOS_CARRITO,
  TIPOS_MENSAJE,
  PERIODOS_REPORTE,
  FORMATOS_EXPORTACION,
  ROLES,
  PERMISOS,
  DEPARTAMENTOS_PERU,
  FORMATOS_FECHA,
  FORMATOS_NUMERO,
  MENSAJES,
  DEV_CONFIG,
} as const;