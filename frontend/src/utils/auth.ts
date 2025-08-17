/**
 * Utilidades de Autenticación - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Funciones auxiliares para manejo de tokens y autenticación
 */

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

export interface TokenInfo {
  access: string | null;
  refresh: string | null;
  expiracion?: string;
  usuario_id?: number;
}

export interface DatosToken {
  user_id?: number;
  email?: string;
  rol?: string;
  exp?: number;
  iat?: number;
}

// =======================================================
// CONSTANTES
// =======================================================

const CLAVES_STORAGE = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USUARIO_INFO: 'usuario_info',
  CONFIGURACION_USER: 'configuracion_usuario'
} as const;

// =======================================================
// FUNCIONES PRINCIPALES
// =======================================================

/**
 * Obtener token de acceso actual
 * @returns Token JWT o null si no existe
 */
export const obtenerToken = (): string | null => {
  try {
    // Primero intentar desde localStorage
    const token = localStorage.getItem(CLAVES_STORAGE.ACCESS_TOKEN);
    
    if (token && token !== 'undefined' && token !== 'null') {
      // Verificar si el token no está expirado
      if (esTokenValido(token)) {
        return token;
      } else {
        console.warn('🔒 Token expirado, limpiando localStorage');
        limpiarTokensDelStorage();
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo token:', error);
    return null;
  }
};

/**
 * Obtener token de refresh
 * @returns Refresh token o null si no existe
 */
export const obtenerRefreshToken = (): string | null => {
  try {
    const refreshToken = localStorage.getItem(CLAVES_STORAGE.REFRESH_TOKEN);
    return refreshToken && refreshToken !== 'undefined' ? refreshToken : null;
  } catch (error) {
    console.error('❌ Error obteniendo refresh token:', error);
    return null;
  }
};

/**
 * Obtener información completa de tokens
 * @returns Objeto con tokens y metadatos
 */
export const obtenerInfoTokens = (): TokenInfo => {
  return {
    access: obtenerToken(),
    refresh: obtenerRefreshToken(),
    expiracion: obtenerExpiracionToken(),
    usuario_id: obtenerUsuarioIdDelToken()
  };
};

/**
 * Guardar tokens en localStorage
 * @param accessToken Token de acceso
 * @param refreshToken Token de refresh (opcional)
 */
export const guardarTokens = (accessToken: string, refreshToken?: string): void => {
  try {
    if (accessToken && accessToken !== 'undefined') {
      localStorage.setItem(CLAVES_STORAGE.ACCESS_TOKEN, accessToken);
    }
    
    if (refreshToken && refreshToken !== 'undefined') {
      localStorage.setItem(CLAVES_STORAGE.REFRESH_TOKEN, refreshToken);
    }
    
    console.log('✅ Tokens guardados correctamente');
  } catch (error) {
    console.error('❌ Error guardando tokens:', error);
    throw new Error('Error guardando tokens en localStorage');
  }
};

/**
 * Limpiar todos los tokens del storage
 */
export const limpiarTokensDelStorage = (): void => {
  try {
    Object.values(CLAVES_STORAGE).forEach(clave => {
      localStorage.removeItem(clave);
    });
    console.log('🧹 Tokens limpiados del localStorage');
  } catch (error) {
    console.error('❌ Error limpiando tokens:', error);
  }
};

// =======================================================
// FUNCIONES DE VALIDACIÓN
// =======================================================

/**
 * Verificar si un token JWT es válido (no expirado)
 * @param token Token JWT a verificar
 * @returns true si es válido, false si está expirado o es inválido
 */
export const esTokenValido = (token: string): boolean => {
  try {
    if (!token || token === 'undefined') return false;
    
    const datosToken = decodificarToken(token);
    if (!datosToken || !datosToken.exp) return false;
    
    // Verificar si el token expira en los próximos 5 minutos
    const tiempoExpiracion = datosToken.exp * 1000;
    const tiempoActual = Date.now();
    const margenSeguridad = 5 * 60 * 1000; // 5 minutos
    
    return tiempoExpiracion > (tiempoActual + margenSeguridad);
  } catch (error) {
    console.error('❌ Error validando token:', error);
    return false;
  }
};

/**
 * Verificar si el usuario está autenticado
 * @returns true si tiene token válido
 */
export const estaAutenticado = (): boolean => {
  const token = obtenerToken();
  return token !== null && esTokenValido(token);
};

/**
 * Verificar si el token necesita ser refrescado
 * @returns true si el token expira en menos de 10 minutos
 */
export const necesitaRefresh = (): boolean => {
  try {
    const token = obtenerToken();
    if (!token) return false;
    
    const datosToken = decodificarToken(token);
    if (!datosToken || !datosToken.exp) return false;
    
    const tiempoExpiracion = datosToken.exp * 1000;
    const tiempoActual = Date.now();
    const margenRefresh = 10 * 60 * 1000; // 10 minutos
    
    return tiempoExpiracion <= (tiempoActual + margenRefresh);
  } catch (error) {
    console.error('❌ Error verificando necesidad de refresh:', error);
    return false;
  }
};

// =======================================================
// FUNCIONES DE DECODIFICACIÓN
// =======================================================

/**
 * Decodificar token JWT (solo el payload, sin verificar firma)
 * @param token Token JWT
 * @returns Datos del token o null si es inválido
 */
export const decodificarToken = (token: string): DatosToken | null => {
  try {
    if (!token || token === 'undefined') return null;
    
    const partes = token.split('.');
    if (partes.length !== 3) {
      console.warn('⚠️ Token JWT inválido: formato incorrecto');
      return null;
    }
    
    const payload = partes[1];
    
    // Agregar padding si es necesario para base64
    const payloadConPadding = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    const datosDecodificados = atob(payloadConPadding);
    const datosToken: DatosToken = JSON.parse(datosDecodificados);
    
    return datosToken;
  } catch (error) {
    console.error('❌ Error decodificando token:', error);
    return null;
  }
};

/**
 * Obtener ID del usuario desde el token
 * @returns ID del usuario o null
 */
export const obtenerUsuarioIdDelToken = (): number | null => {
  try {
    const token = obtenerToken();
    if (!token) return null;
    
    const datosToken = decodificarToken(token);
    return datosToken?.user_id || null;
  } catch (error) {
    console.error('❌ Error obteniendo usuario ID:', error);
    return null;
  }
};

/**
 * Obtener email del usuario desde el token
 * @returns Email del usuario o null
 */
export const obtenerEmailDelToken = (): string | null => {
  try {
    const token = obtenerToken();
    if (!token) return null;
    
    const datosToken = decodificarToken(token);
    return datosToken?.email || null;
  } catch (error) {
    console.error('❌ Error obteniendo email:', error);
    return null;
  }
};

/**
 * Obtener rol del usuario desde el token
 * @returns Rol del usuario o null
 */
export const obtenerRolDelToken = (): string | null => {
  try {
    const token = obtenerToken();
    if (!token) return null;
    
    const datosToken = decodificarToken(token);
    return datosToken?.rol || null;
  } catch (error) {
    console.error('❌ Error obteniendo rol:', error);
    return null;
  }
};

/**
 * Obtener fecha de expiración del token
 * @returns Fecha de expiración en formato ISO o null
 */
export const obtenerExpiracionToken = (): string | null => {
  try {
    const token = obtenerToken();
    if (!token) return null;
    
    const datosToken = decodificarToken(token);
    if (!datosToken?.exp) return null;
    
    const fechaExpiracion = new Date(datosToken.exp * 1000);
    return fechaExpiracion.toISOString();
  } catch (error) {
    console.error('❌ Error obteniendo expiración:', error);
    return null;
  }
};

// =======================================================
// FUNCIONES DE HEADERS
// =======================================================

/**
 * Obtener headers de autorización para requests
 * @returns Headers con Authorization Bearer o headers vacíos
 */
export const obtenerHeadersAuth = (): Record<string, string> => {
  const token = obtenerToken();
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  
  return {
    'Content-Type': 'application/json'
  };
};

/**
 * Obtener configuración para axios con autenticación
 * @returns Configuración de axios con headers de auth
 */
export const obtenerConfiguracionAxios = () => ({
  headers: obtenerHeadersAuth()
});

// =======================================================
// FUNCIONES DE INFORMACIÓN DE USUARIO
// =======================================================

/**
 * Obtener información del usuario guardada en localStorage
 * @returns Datos del usuario o null
 */
export const obtenerInfoUsuario = (): any | null => {
  try {
    const infoUsuario = localStorage.getItem(CLAVES_STORAGE.USUARIO_INFO);
    return infoUsuario ? JSON.parse(infoUsuario) : null;
  } catch (error) {
    console.error('❌ Error obteniendo info de usuario:', error);
    return null;
  }
};

/**
 * Guardar información del usuario en localStorage
 * @param infoUsuario Datos del usuario a guardar
 */
export const guardarInfoUsuario = (infoUsuario: any): void => {
  try {
    localStorage.setItem(CLAVES_STORAGE.USUARIO_INFO, JSON.stringify(infoUsuario));
  } catch (error) {
    console.error('❌ Error guardando info de usuario:', error);
  }
};

// =======================================================
// FUNCIONES DE UTILIDAD
// =======================================================

/**
 * Calcular tiempo restante del token en minutos
 * @returns Minutos restantes o 0 si está expirado
 */
export const tiempoRestanteToken = (): number => {
  try {
    const token = obtenerToken();
    if (!token) return 0;
    
    const datosToken = decodificarToken(token);
    if (!datosToken?.exp) return 0;
    
    const tiempoExpiracion = datosToken.exp * 1000;
    const tiempoActual = Date.now();
    const diferencia = tiempoExpiracion - tiempoActual;
    
    return Math.max(0, Math.floor(diferencia / (60 * 1000)));
  } catch (error) {
    console.error('❌ Error calculando tiempo restante:', error);
    return 0;
  }
};

/**
 * Verificar si el usuario tiene un rol específico
 * @param rolRequerido Rol a verificar
 * @returns true si tiene el rol
 */
export const tieneRol = (rolRequerido: string): boolean => {
  try {
    const rolUsuario = obtenerRolDelToken();
    return rolUsuario === rolRequerido;
  } catch (error) {
    console.error('❌ Error verificando rol:', error);
    return false;
  }
};

/**
 * Verificar si el usuario es administrador
 * @returns true si es administrador
 */
export const esAdministrador = (): boolean => {
  return tieneRol('administrador') || tieneRol('admin');
};

/**
 * Verificar si el usuario es vendedor
 * @returns true si es vendedor
 */
export const esVendedor = (): boolean => {
  return tieneRol('vendedor');
};

/**
 * Verificar si el usuario es contador
 * @returns true si es contador
 */
export const esContador = (): boolean => {
  return tieneRol('contador');
};

// =======================================================
// FUNCIONES DE DEBUG (SOLO DESARROLLO)
// =======================================================

/**
 * Mostrar información del token en consola (solo desarrollo)
 */
export const debugToken = (): void => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const token = obtenerToken();
  if (!token) {
    console.log('🔒 No hay token disponible');
    return;
  }
  
  const datosToken = decodificarToken(token);
  console.group('🔍 Debug Token JWT');
  console.log('Token válido:', esTokenValido(token));
  console.log('Necesita refresh:', necesitaRefresh());
  console.log('Tiempo restante:', tiempoRestanteToken(), 'minutos');
  console.log('Datos del token:', datosToken);
  console.log('Info usuario:', obtenerInfoUsuario());
  console.groupEnd();
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default {
  // Funciones principales
  obtenerToken,
  obtenerRefreshToken,
  obtenerInfoTokens,
  guardarTokens,
  limpiarTokensDelStorage,
  
  // Validación
  esTokenValido,
  estaAutenticado,
  necesitaRefresh,
  
  // Decodificación
  decodificarToken,
  obtenerUsuarioIdDelToken,
  obtenerEmailDelToken,
  obtenerRolDelToken,
  obtenerExpiracionToken,
  
  // Headers y configuración
  obtenerHeadersAuth,
  obtenerConfiguracionAxios,
  
  // Información de usuario
  obtenerInfoUsuario,
  guardarInfoUsuario,
  
  // Utilidades
  tiempoRestanteToken,
  tieneRol,
  esAdministrador,
  esVendedor,
  esContador,
  
  // Debug
  debugToken
};