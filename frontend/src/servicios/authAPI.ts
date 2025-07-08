/**
 * Servicios de Autenticación - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Comunicación con el backend Django para autenticación
 */

import { Usuario, DatosLogin, DatosRegistro } from '../types/auth';

// =======================================================
// CONFIGURACIÓN BASE
// =======================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_AUTH_PREFIX = '/api/auth';

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
 * Función base para realizar peticiones de autenticación
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

  try {
    const respuesta = await fetch(url, configuracion);
    const data = await respuesta.json();

    if (!respuesta.ok) {
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

    return data;
  } catch (error) {
    console.error(`Error en petición de autenticación ${endpoint}:`, error);
    throw error;
  }
};

// =======================================================
// SERVICIOS DE AUTENTICACIÓN
// =======================================================

/**
 * Iniciar sesión
 */
const login = async (datos: DatosLogin) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      data?: {
        access: string;
        refresh: string;
        user: Usuario;
      };
      message?: string;
    }>(`${API_AUTH_PREFIX}/login/`, {
      method: 'POST',
      body: JSON.stringify({
        email: datos.email,
        password: datos.password,
        remember_me: datos.recordar_sesion || false
      })
    }, false);

    return respuesta;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

/**
 * Cerrar sesión
 */
const logout = async (refreshToken: string) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      message?: string;
    }>(`${API_AUTH_PREFIX}/logout/`, {
      method: 'POST',
      body: JSON.stringify({
        refresh: refreshToken
      })
    });

    return respuesta;
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

/**
 * Registrar nuevo usuario
 */
const registro = async (datos: DatosRegistro) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      data?: Usuario;
      message?: string;
    }>(`${API_AUTH_PREFIX}/registro/`, {
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

    return respuesta;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

/**
 * Refrescar token de acceso
 */
const refrescarToken = async (refreshToken: string) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      data?: {
        access: string;
      };
      message?: string;
    }>(`${API_AUTH_PREFIX}/token/refresh/`, {
      method: 'POST',
      body: JSON.stringify({
        refresh: refreshToken
      })
    }, false);

    return respuesta;
  } catch (error) {
    console.error('Error refrescando token:', error);
    throw error;
  }
};

/**
 * Obtener perfil del usuario actual
 */
const obtenerPerfil = async () => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      data?: Usuario;
      message?: string;
    }>(`${API_AUTH_PREFIX}/perfil/`);

    return respuesta;
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    throw error;
  }
};

/**
 * Actualizar perfil del usuario
 */
const actualizarPerfil = async (datos: Partial<Usuario>) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      data?: Usuario;
      message?: string;
    }>(`${API_AUTH_PREFIX}/perfil/`, {
      method: 'PATCH',
      body: JSON.stringify(datos)
    });

    return respuesta;
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    throw error;
  }
};

/**
 * Cambiar contraseña
 */
const cambiarPassword = async (datos: {
  current_password: string;
  new_password: string;
}) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      message?: string;
    }>(`${API_AUTH_PREFIX}/cambiar-password/`, {
      method: 'POST',
      body: JSON.stringify(datos)
    });

    return respuesta;
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    throw error;
  }
};

/**
 * Solicitar reset de contraseña
 */
const solicitarResetPassword = async (email: string) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      message?: string;
    }>(`${API_AUTH_PREFIX}/solicitar-reset-password/`, {
      method: 'POST',
      body: JSON.stringify({ email })
    }, false);

    return respuesta;
  } catch (error) {
    console.error('Error solicitando reset de contraseña:', error);
    throw error;
  }
};

/**
 * Confirmar reset de contraseña
 */
const confirmarResetPassword = async (datos: {
  token: string;
  new_password: string;
}) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      message?: string;
    }>(`${API_AUTH_PREFIX}/confirmar-reset-password/`, {
      method: 'POST',
      body: JSON.stringify(datos)
    }, false);

    return respuesta;
  } catch (error) {
    console.error('Error confirmando reset de contraseña:', error);
    throw error;
  }
};

/**
 * Verificar email
 */
const verificarEmail = async (token: string) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      message?: string;
    }>(`${API_AUTH_PREFIX}/verificar-email/`, {
      method: 'POST',
      body: JSON.stringify({ token })
    }, false);

    return respuesta;
  } catch (error) {
    console.error('Error verificando email:', error);
    throw error;
  }
};

/**
 * Reenviar email de verificación
 */
const reenviarVerificacionEmail = async (email: string) => {
  try {
    const respuesta = await peticionAuth<{
      success: boolean;
      message?: string;
    }>(`${API_AUTH_PREFIX}/reenviar-verificacion-email/`, {
      method: 'POST',
      body: JSON.stringify({ email })
    }, false);

    return respuesta;
  } catch (error) {
    console.error('Error reenviando verificación de email:', error);
    throw error;
  }
};

// =======================================================
// SERVICIOS DE VALIDACIÓN
// =======================================================

/**
 * Verificar si un email ya está registrado
 */
const verificarEmailDisponible = async (email: string) => {
  try {
    const respuesta = await peticionAuth<{
      available: boolean;
      message?: string;
    }>(`${API_AUTH_PREFIX}/verificar-email-disponible/`, {
      method: 'POST',
      body: JSON.stringify({ email })
    }, false);

    return respuesta;
  } catch (error) {
    console.error('Error verificando disponibilidad de email:', error);
    throw error;
  }
};

/**
 * Verificar si un documento ya está registrado
 */
const verificarDocumentoDisponible = async (tipo_documento: string, numero_documento: string) => {
  try {
    const respuesta = await peticionAuth<{
      available: boolean;
      message?: string;
    }>(`${API_AUTH_PREFIX}/verificar-documento-disponible/`, {
      method: 'POST',
      body: JSON.stringify({ tipo_documento, numero_documento })
    }, false);

    return respuesta;
  } catch (error) {
    console.error('Error verificando disponibilidad de documento:', error);
    throw error;
  }
};

// =======================================================
// SERVICIOS MOCK PARA DESARROLLO
// =======================================================

/**
 * Datos mock para desarrollo cuando no hay backend disponible
 */
const obtenerDatosMockUsuario = (): Usuario => ({
  id: 1,
  email: 'admin@felicitafac.com',
  nombres: 'Administrador',
  apellidos: 'del Sistema',
  nombre_completo: 'Administrador del Sistema',
  tipo_documento: 'dni',
  numero_documento: '12345678',
  telefono: '+51999123456',
  is_active: true,
  is_staff: true,
  estado_usuario: 'activo',
  debe_cambiar_password: false,
  fecha_ultimo_login: new Date().toISOString(),
  fecha_creacion: new Date().toISOString(),
  fecha_actualizacion: new Date().toISOString(),
  rol_detalle: {
    id: 1,
    nombre: 'Administrador',
    codigo: 'administrador',
    descripcion: 'Acceso total al sistema',
    nivel_acceso: 4,
    permisos_especiales: {
      ver_reportes: true,
      ver_dashboard: true,
      crear_facturas: true,
      crear_usuarios: true,
      exportar_datos: true,
      anular_facturas: true,
      editar_usuarios: true,
      eliminar_usuarios: true,
      configurar_sistema: true,
      gestionar_inventario: true
    }
  },
  perfil: {
    avatar: null,
    tema_oscuro: false,
    idioma: 'es',
    notificaciones_email: true,
    notificaciones_sistema: true
  }
});

/**
 * Login mock para desarrollo
 */
const loginMock = async (datos: DatosLogin) => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Validar credenciales mock
  const credencialesValidas = [
    { email: 'admin@felicitafac.com', password: 'admin123' },
    { email: 'contador@felicitafac.com', password: 'contador123' },
    { email: 'vendedor@felicitafac.com', password: 'vendedor123' },
    { email: 'cliente@felicitafac.com', password: 'cliente123' }
  ];

  const credencialValida = credencialesValidas.find(
    cred => cred.email === datos.email && cred.password === datos.password
  );

  if (!credencialValida) {
    throw new Error('Credenciales inválidas');
  }

  const usuario = obtenerDatosMockUsuario();
  
  // Ajustar rol según email
  if (datos.email.includes('contador')) {
    usuario.rol_detalle.codigo = 'contador';
    usuario.rol_detalle.nombre = 'Contador';
  } else if (datos.email.includes('vendedor')) {
    usuario.rol_detalle.codigo = 'vendedor';
    usuario.rol_detalle.nombre = 'Vendedor';
  } else if (datos.email.includes('cliente')) {
    usuario.rol_detalle.codigo = 'cliente';
    usuario.rol_detalle.nombre = 'Cliente';
  }

  return {
    success: true,
    data: {
      access: 'mock_access_token_' + Date.now(),
      refresh: 'mock_refresh_token_' + Date.now(),
      user: usuario
    }
  };
};

// =======================================================
// EXPORTAR SERVICIOS
// =======================================================

export const serviciosAuth = {
  // Autenticación principal
  login,
  logout,
  registro,
  refrescarToken,

  // Perfil de usuario
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,

  // Reset de contraseña
  solicitarResetPassword,
  confirmarResetPassword,

  // Verificación de email
  verificarEmail,
  reenviarVerificacionEmail,

  // Validaciones
  verificarEmailDisponible,
  verificarDocumentoDisponible,

  // Mock para desarrollo
  loginMock,
  obtenerDatosMockUsuario,

  // Utilidades
  obtenerToken,
  configurarHeaders
};

export default serviciosAuth;