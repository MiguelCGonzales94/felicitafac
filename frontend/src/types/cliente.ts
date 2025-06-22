/**
 * Types para Cliente - FELICITAFAC Frontend
 * Interfaces TypeScript para gestión de clientes
 */

export interface TipoDocumento {
  id: number;
  codigo: string;
  nombre: string;
  longitud_minima: number;
  longitud_maxima: number;
  solo_numeros: boolean;
  requiere_validacion: boolean;
  activo: boolean;
}

export interface ContactoCliente {
  id?: number;
  nombres: string;
  apellidos: string;
  nombre_completo?: string;
  cargo?: string;
  email?: string;
  telefono?: string;
  es_principal: boolean;
  recibe_facturas: boolean;
  notas?: string;
  activo?: boolean;
}

export interface Cliente {
  id?: number;
  uuid?: string;
  tipo_cliente: 'persona_natural' | 'persona_juridica' | 'extranjero';
  tipo_documento: number;
  tipo_documento_info?: TipoDocumento;
  numero_documento: string;
  razon_social: string;
  nombre_comercial?: string;
  nombre_completo?: string;
  
  // Contacto
  email?: string;
  telefono?: string;
  celular?: string;
  
  // Dirección
  direccion: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  
  // Configuración comercial
  descuento_maximo: number;
  credito_limite: number;
  dias_credito: number;
  es_agente_retencion: boolean;
  es_buen_contribuyente: boolean;
  
  // Control
  bloqueado: boolean;
  motivo_bloqueo?: string;
  
  // Estadísticas
  fecha_primer_compra?: string;
  fecha_ultima_compra?: string;
  total_compras: number;
  numero_compras: number;
  promedio_compra?: number;
  dias_desde_ultima_compra?: number;
  
  // Validación SUNAT
  validado_sunat: boolean;
  fecha_validacion_sunat?: string;
  estado_sunat?: string;
  condicion_sunat?: string;
  
  // Relacionados
  contactos?: ContactoCliente[];
  datos_facturacion?: any;
  puede_comprar_info?: {
    puede_comprar: boolean;
    motivo: string;
  };
  
  // Auditoría
  activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface ClienteListItem {
  id: number;
  tipo_cliente: string;
  tipo_documento_nombre: string;
  numero_documento: string;
  razon_social: string;
  nombre_comercial?: string;
  nombre_completo: string;
  email?: string;
  telefono?: string;
  total_compras: number;
  numero_compras: number;
  bloqueado: boolean;
  estado_comercial: 'INACTIVO' | 'BLOQUEADO' | 'ACTIVO' | 'NUEVO';
  activo: boolean;
  fecha_creacion: string;
}

export interface ClienteFormData {
  tipo_cliente: string;
  tipo_documento: number;
  numero_documento: string;
  razon_social: string;
  nombre_comercial?: string;
  email?: string;
  telefono?: string;
  celular?: string;
  direccion: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  descuento_maximo?: number;
  credito_limite?: number;
  dias_credito?: number;
  es_agente_retencion?: boolean;
  es_buen_contribuyente?: boolean;
  contacto_principal?: Omit<ContactoCliente, 'id'>;
}

export interface ClienteBusqueda {
  termino?: string;
  tipo_cliente?: string;
  tipo_documento?: number;
  departamento?: string;
  provincia?: string;
  bloqueado?: boolean;
  con_credito?: boolean;
  fecha_creacion_desde?: string;
  fecha_creacion_hasta?: string;
  total_compras_minimo?: number;
}

export interface EstadisticasCliente {
  total_clientes: number;
  clientes_activos: number;
  clientes_bloqueados: number;
  clientes_con_compras: number;
  por_tipo_cliente: Record<string, number>;
  por_tipo_documento: Record<string, number>;
  por_departamento: Record<string, number>;
  total_compras_general: number;
  promedio_compras_cliente: number;
  clientes_nuevos_mes: number;
  clientes_con_credito: number;
  top_clientes: ClienteListItem[];
}

export interface ClienteApiResponse {
  count: number;
  next?: string;
  previous?: string;
  results: ClienteListItem[];
}

export interface ValidacionDocumento {
  valido: boolean;
  mensaje: string;
  tipo_documento?: string;
  datos_sunat?: {
    razon_social?: string;
    estado?: string;
    condicion?: string;
    direccion?: string;
  };
}

export interface ClienteValidation {
  numero_documento?: string[];
  razon_social?: string[];
  email?: string[];
  telefono?: string[];
  direccion?: string[];
  ubigeo?: string[];
  tipo_documento?: string[];
  [key: string]: string[] | undefined;
}

export interface ClienteError {
  message: string;
  errors?: ClienteValidation;
  status?: number;
}

// Enums y constantes
export const TIPOS_CLIENTE = {
  PERSONA_NATURAL: 'persona_natural',
  PERSONA_JURIDICA: 'persona_juridica',
  EXTRANJERO: 'extranjero'
} as const;

export const TIPOS_DOCUMENTO = {
  DNI: '1',
  CARNET_EXTRANJERIA: '4',
  RUC: '6',
  PASAPORTE: '7'
} as const;

export const ESTADOS_COMERCIALES = {
  INACTIVO: 'INACTIVO',
  BLOQUEADO: 'BLOQUEADO',
  ACTIVO: 'ACTIVO',
  NUEVO: 'NUEVO'
} as const;

export type TipoCliente = typeof TIPOS_CLIENTE[keyof typeof TIPOS_CLIENTE];
export type TipoDocumentoCode = typeof TIPOS_DOCUMENTO[keyof typeof TIPOS_DOCUMENTO];
export type EstadoComercial = typeof ESTADOS_COMERCIALES[keyof typeof ESTADOS_COMERCIALES];