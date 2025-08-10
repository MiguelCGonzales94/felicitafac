/**
 * Servicios de Autenticación - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Comunicación con el backend Django para autenticación
 * 
 * ✅ ARREGLADO: URLs corregidas para coincidir con backend Django
 */

import { Usuario, DatosLogin, DatosRegistro } from '../types/auth';

// =======================================================
// CONFIGURACIÓN BASE (CORREGIDA)
// =======================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// ✅ CAMBIO PRINCIPAL: Corregir prefijo de API
const API_AUTH_PREFIX = '/api/usuarios/auth';  // ANTES: '/api/auth'

/**
 * Configuración por defecto para fetch
 */
const configuracionFetchBase = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Obtener token de autenticación
 */
const obtenerToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Configurar headers con autenticación
 */
const configurarHeaders = (incluirAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    ...configuracionFetchBase.headers,
  };

  if (incluirAuth) {
    const token = obtenerToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * ✅ MEJORADO: Función base para realizar peticiones de autenticación
 */
const peticionAuth = async <T>(
  endpoint: string,
  opciones: RequestInit = {},
  incluirAuth: boolean = true
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const configuracion: RequestInit = {
    ...opciones,
    headers: {
      ...configurarHeaders(incluirAuth),
      ...opciones.headers,
    },
  };

  // ✅ AGREGADO: Logging para debug
  console.log(`🌐 authAPI: ${opciones.method || 'GET'} ${url}`);

  try {
    const respuesta = await fetch(url, configuracion);
    
    // ✅ MEJORADO: Verificar Content-Type antes de parsear JSON
    const contentType = respuesta.headers.get('Content-Type') || '';
    
    if (!respuesta.ok) {
      // ✅ MEJORADO: Manejar respuestas HTML (403 Forbidden)
      if (contentType.includes('text/html')) {
        console.error('❌ Respuesta HTML recibida. Verificar URL del endpoint.');
        
        if (respuesta.status === 403) {
          throw new Error('Endpoint no encontrado. URL incorrecta en la API.');
        } else if (respuesta.status === 404) {
          throw new Error('Endpoint no existe. Verificar rutas del backend.');
        } else {
          throw new Error(`Error del servidor: ${respuesta.status}`);
        }
      }
      
      // ✅ MEJORADO: Solo parsear JSON si el Content-Type es correcto
      let data;
      if (contentType.includes('application/json')) {
        try {
          data = await respuesta.json();
        } catch (parseError) {
          console.error('❌ Error parseando JSON de error:', parseError);
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }
      } else {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }

      // Manejar errores específicos de autenticación
      if (respuesta.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('usuario_info');
        
        throw new Error(data.message || data.detail || 'Sesión expirada');
      }

      if (respuesta.status === 403) {
        throw new Error(data.message || data.detail || 'Acceso denegado');
      }

      if (respuesta.status >= 500) {
        throw new Error('Error del servidor. Por favor, intenta más tarde.');
      }

      throw new Error(data.message || data.detail || `Error ${respuesta.status}`);
    }

    // ✅ MEJORADO: Solo parsear JSON si el Content-Type es correcto
    if (contentType.includes('application/json')) {
      try {
        const data = await respuesta.json();
        console.log(`✅ authAPI: Petición exitosa a ${endpoint}`);
        return data;
      } catch (parseError) {
        console.error('❌ Error parseando JSON de respuesta exitosa:', parseError);
        throw new Error('Respuesta del servidor no es JSON válido');
      }
    } else {
      console.warn('⚠️ Respuesta exitosa pero no es JSON:', contentType);
      throw new Error('Respuesta del servidor no es JSON');
    }

  } catch (error) {
    console.error(`❌ Error en petición de autenticación ${endpoint}:`, error);
    throw error;
  }
};

// =======================================================
// SERVICIOS DE AUTENTICACIÓN (MANTENIENDO TU ESTRUCTURA)
// =======================================================

/**
 * ✅ CORREGIDO: Iniciar sesión con URL correcta
 */
const login = async (datos: DatosLogin) => {
  try {
    console.log('🔐 Iniciando login para:', datos.email);
    
    const respuesta = await peticionAuth<{
      success: boolean;
      data?: {
        access: string;
        refresh: string;
        user: Usuario;
      };
      access?: string;  // ✅ AGREGADO: Para manejar formato directo
      refresh?: string; // ✅ AGREGADO: Para manejar formato directo
      usuario?: Usuario; // ✅ AGREGADO: Para formato alternativo
      user?: Usuario;   // ✅ AGREGADO: Para formato alternativo
      message?: string;
    }>(`${API_AUTH_PREFIX}/login/`, {  // ✅ Ahora llama a /api/usuarios/auth/login/
      method: 'POST',
      body: JSON.stringify({
        email: datos.email,
        password: datos.password,
        remember_me: datos.recordar_sesion || false
      })
    }, false);

    console.log('✅ Login exitoso para:', datos.email);
    return respuesta;
  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
};

/**
 * ✅ CORREGIDO: Cerrar sesión con URL correcta
 */
const logout = async (refreshToken: string) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      message?: string;
    }>(`${API_AUTH_PREFIX}/logout/`, {  // ✅ Ahora llama a /api/usuarios/auth/logout/
      method: 'POST',
      body: JSON.stringify({
        refresh: refreshToken
      })
    });

    console.log('✅ Logout exitoso');
    return respuesta;
  } catch (error) {
    console.error('❌ Error en logout:', error);
    throw error;
  }
};

/**
 * ✅ CORREGIDO: Registrar nuevo usuario con URL correcta
 */
const registro = async (datos: DatosRegistro) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      data?: Usuario;
      message?: string;
    }>(`${API_AUTH_PREFIX}/registro/`, {  // ✅ Ahora llama a /api/usuarios/auth/registro/
      method: 'POST',
      body: JSON.stringify({
        email: datos.email,
        password: datos.password,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        tipo_documento: datos.tipo_documento,
        numero_documento: datos.numero_documento,
        telefono: datos.telefono,
        empresa_nombre: datos.empresa_nombre,
        acepta_terminos: datos.acepta_terminos,
        acepta_marketing: datos.acepta_marketing
      })
    }, false);

    console.log('✅ Registro exitoso para:', datos.email);
    return respuesta;
  } catch (error) {
    console.error('❌ Error en registro:', error);
    throw error;
  }
};

/**
 * ✅ CORREGIDO: Refrescar token de acceso con URL correcta
 */
const refrescarToken = async (refreshToken: string) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      data?: {
        access: string;
      };
      access?: string;  // ✅ AGREGADO: Para formato directo
      message?: string;
    }>(`${API_AUTH_PREFIX}/refresh/`, {  // ✅ Ahora llama a /api/usuarios/auth/refresh/
      method: 'POST',
      body: JSON.stringify({
        refresh: refreshToken
      })
    }, false);

    console.log('✅ Token refrescado exitosamente');
    return respuesta;
  } catch (error) {
    console.error('❌ Error refrescando token:', error);
    throw error;
  }
};

/**
 * ✅ CORREGIDO: Obtener perfil del usuario actual con URL correcta
 */
const obtenerPerfil = async () => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      data?: Usuario;
      message?: string;
    }>(`/api/usuarios/perfil/`);  // ✅ URL específica para perfil

    console.log('✅ Perfil obtenido exitosamente');
    return respuesta;
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    throw error;
  }
};

/**
 * ✅ CORREGIDO: Actualizar perfil del usuario con URL correcta
 */
const actualizarPerfil = async (datos: Partial<Usuario>) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      data?: Usuario;
      message?: string;
    }>(`/api/usuarios/perfil/actualizar/`, {  // ✅ URL específica para actualizar
      method: 'PATCH',
      body: JSON.stringify(datos)
    });

    console.log('✅ Perfil actualizado exitosamente');
    return respuesta;
  } catch (error) {
    console.error('❌ Error actualizando perfil:', error);
    throw error;
  }
};

/**
 * ✅ AGREGADO: Validar token (nueva función útil)
 */
const validarToken = async () => {
  try {
    const respuesta = await peticionAuth<{
      valido: boolean;
      usuario?: Usuario;
      message?: string;
    }>(`${API_AUTH_PREFIX}/validar/`, {  // ✅ /api/usuarios/auth/validar/
      method: 'GET'
    });

    console.log('✅ Token validado exitosamente');
    return respuesta;
  } catch (error) {
    console.error('❌ Error validando token:', error);
    throw error;
  }
};

/**
 * ✅ AGREGADO: Cambiar contraseña (nueva función útil)
 */
const cambiarPassword = async (datos: {
  password_actual: string;
  password_nueva: string;
  confirmar_password_nueva: string;
}) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      message?: string;
    }>(`${API_AUTH_PREFIX}/cambiar-password/`, {  // ✅ /api/usuarios/auth/cambiar-password/
      method: 'POST',
      body: JSON.stringify(datos)
    });

    console.log('✅ Contraseña cambiada exitosamente');
    return respuesta;
  } catch (error) {
    console.error('❌ Error cambiando contraseña:', error);
    throw error;
  }
};

// =======================================================
// EXPORTAR SERVICIOS (MANTENIENDO TU ESTRUCTURA)
// =======================================================

export default {
  // Funciones principales (mantener nombres existentes)
  login,
  logout,
  registro,
  refrescarToken,
  obtenerPerfil,
  actualizarPerfil,
  
  // ✅ AGREGADAS: Nuevas funciones útiles
  validarToken,
  cambiarPassword,
  
  // Utilidades
  obtenerToken,
  configurarHeaders,
};

// ✅ AGREGADO: Exportaciones individuales también
export {
  login,
  logout,
  registro,
  refrescarToken,
  obtenerPerfil,
  actualizarPerfil,
  validarToken,
  cambiarPassword,
  obtenerToken,
  configurarHeaders,
};