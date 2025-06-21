/**
 * Auth Service - Servicios de Autenticación FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Manejo de todas las APIs de autenticación y usuarios
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  DatosLogin,
  DatosRegistro,
  DatosCambioPassword,
  DatosActualizarPerfil,
  Usuario,
  RespuestaLogin,
  RespuestaRegistro,
  RespuestaRenovarToken,
  RespuestaValidarToken,
  RespuestaLogout,
  RespuestaPerfil,
  RespuestaListaUsuarios,
  RespuestaEstadisticasUsuarios,
  FiltrosUsuarios,
  RespuestaPaginada,
  UsuarioResumen,
  Rol,
  ErrorAPI,
} from '../types/auth';

/**
 * Configuración base de la API
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TIMEOUT_REQUEST = 30000; // 30 segundos

/**
 * Clase para manejar servicios de autenticación
 */
class AuthService {
  private cliente: AxiosInstance;
  private tokenActual: string | null = null;
  private interceptorRenovacion: number | null = null;

  constructor() {
    // Crear instancia de axios con configuración base
    this.cliente = axios.create({
      baseURL: API_BASE_URL,
      timeout: TIMEOUT_REQUEST,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Configurar interceptores
    this.configurarInterceptores();
  }

  /**
   * Configurar interceptores de request y response
   */
  private configurarInterceptores(): void {
    // Interceptor de request - agregar token
    this.cliente.interceptors.request.use(
      (config) => {
        if (this.tokenActual) {
          config.headers.Authorization = `Bearer ${this.tokenActual}`;
        }
        
        // Agregar timestamp para cache busting
        config.params = {
          ...config.params,
          _t: Date.now(),
        };

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor de response - manejar errores globales
    this.cliente.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Manejar errores específicos
        if (error.response?.status === 401) {
          // Token expirado o inválido
          this.manejarTokenExpirado();
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Configurar interceptor para renovación automática de tokens
   */
  configurarInterceptorRenovacion(
    renovarTokenCallback: () => Promise<void>,
    cerrarSesionCallback: () => Promise<void>
  ): () => void {
    // Eliminar interceptor anterior si existe
    if (this.interceptorRenovacion !== null) {
      this.cliente.interceptors.response.eject(this.interceptorRenovacion);
    }

    // Agregar nuevo interceptor para renovación
    this.interceptorRenovacion = this.cliente.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          this.tokenActual
        ) {
          originalRequest._retry = true;

          try {
            await renovarTokenCallback();
            
            // Reintentar request original con nuevo token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${this.tokenActual}`;
            }
            
            return this.cliente(originalRequest);
          } catch (renovarError) {
            // Si falla la renovación, cerrar sesión
            await cerrarSesionCallback();
            return Promise.reject(renovarError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Retornar función para limpiar el interceptor
    return () => {
      if (this.interceptorRenovacion !== null) {
        this.cliente.interceptors.response.eject(this.interceptorRenovacion);
        this.interceptorRenovacion = null;
      }
    };
  }

  /**
   * Manejar token expirado
   */
  private manejarTokenExpirado(): void {
    console.warn('Token expirado detectado');
    // El interceptor de renovación se encargará de manejar esto
  }

  /**
   * Establecer token de autorización
   */
  establecerToken(token: string): void {
    this.tokenActual = token;
  }

  /**
   * Limpiar token de autorización
   */
  limpiarToken(): void {
    this.tokenActual = null;
  }

  /**
   * Manejar errores de API
   */
  private manejarErrorAPI(error: AxiosError): never {
    const errorData = error.response?.data as ErrorAPI;
    
    const errorProcesado: ErrorAPI = {
      error: errorData?.error || 'Error de conexión',
      mensaje: errorData?.mensaje || 'Error al comunicarse con el servidor',
      errores: errorData?.errores || {},
      codigo: error.response?.status || 500,
    };

    throw errorProcesado;
  }

  // =======================================================
  // MÉTODOS DE AUTENTICACIÓN
  // =======================================================

  /**
   * Iniciar sesión
   */
  async login(datos: DatosLogin): Promise<RespuestaLogin> {
    try {
      const response: AxiosResponse<RespuestaLogin> = await this.cliente.post(
        '/usuarios/auth/login/',
        datos
      );

      // Establecer token automáticamente
      this.establecerToken(response.data.access);

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(refreshToken: string): Promise<RespuestaLogout> {
    try {
      const response: AxiosResponse<RespuestaLogout> = await this.cliente.post(
        '/usuarios/auth/logout/',
        { refresh_token: refreshToken }
      );

      // Limpiar token local
      this.limpiarToken();

      return response.data;
    } catch (error) {
      // Limpiar token aunque falle el logout
      this.limpiarToken();
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async registro(datos: DatosRegistro): Promise<RespuestaRegistro> {
    try {
      const response: AxiosResponse<RespuestaRegistro> = await this.cliente.post(
        '/usuarios/auth/registro/',
        datos
      );

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Renovar token de acceso
   */
  async renovarToken(refreshToken: string): Promise<RespuestaRenovarToken> {
    try {
      const response: AxiosResponse<RespuestaRenovarToken> = await this.cliente.post(
        '/usuarios/auth/refresh/',
        { refresh: refreshToken }
      );

      // Actualizar token automáticamente
      this.establecerToken(response.data.access);

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Validar token actual
   */
  async validarToken(): Promise<boolean> {
    try {
      const response: AxiosResponse<RespuestaValidarToken> = await this.cliente.get(
        '/usuarios/auth/validar/'
      );

      return response.data.valido;
    } catch (error) {
      return false;
    }
  }

  /**
   * Cambiar contraseña
   */
  async cambiarPassword(datos: DatosCambioPassword): Promise<{ mensaje: string }> {
    try {
      const response = await this.cliente.post(
        '/usuarios/auth/cambiar-password/',
        datos
      );

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  // =======================================================
  // MÉTODOS DE PERFIL DE USUARIO
  // =======================================================

  /**
   * Obtener perfil del usuario autenticado
   */
  async obtenerPerfil(): Promise<RespuestaPerfil> {
    try {
      const response: AxiosResponse<RespuestaPerfil> = await this.cliente.get(
        '/usuarios/perfil/'
      );

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async actualizarPerfil(datos: Partial<Usuario>): Promise<Usuario> {
    try {
      const response: AxiosResponse<Usuario> = await this.cliente.patch(
        '/usuarios/perfil/',
        datos
      );

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Actualizar perfil extendido
   */
  async actualizarPerfilExtendido(datos: DatosActualizarPerfil): Promise<{ mensaje: string; perfil: any }> {
    try {
      // Crear FormData si hay archivos
      let datosEnvio: any = datos;
      let headers: any = {};

      if (datos.avatar && datos.avatar instanceof File) {
        const formData = new FormData();
        
        Object.entries(datos).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, String(value));
            }
          }
        });

        datosEnvio = formData;
        headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await this.cliente.patch(
        '/usuarios/perfil/actualizar/',
        datosEnvio,
        { headers }
      );

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  // =======================================================
  // MÉTODOS DE GESTIÓN DE USUARIOS (ADMIN)
  // =======================================================

  /**
   * Obtener lista de usuarios
   */
  async obtenerUsuarios(filtros?: FiltrosUsuarios): Promise<RespuestaListaUsuarios | RespuestaPaginada<UsuarioResumen>> {
    try {
      const params = new URLSearchParams();
      
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await this.cliente.get(
        `/usuarios/?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Obtener usuario específico
   */
  async obtenerUsuario(id: number): Promise<Usuario> {
    try {
      const response: AxiosResponse<Usuario> = await this.cliente.get(
        `/usuarios/${id}/`
      );

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Crear nuevo usuario (admin)
   */
  async crearUsuario(datos: any): Promise<{ mensaje: string; usuario: Usuario }> {
    try {
      const response = await this.cliente.post('/usuarios/crear/', datos);
      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Actualizar usuario específico
   */
  async actualizarUsuario(id: number, datos: Partial<Usuario>): Promise<Usuario> {
    try {
      const response: AxiosResponse<Usuario> = await this.cliente.patch(
        `/usuarios/${id}/`,
        datos
      );

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Desactivar usuario
   */
  async desactivarUsuario(id: number): Promise<{ mensaje: string }> {
    try {
      const response = await this.cliente.delete(`/usuarios/${id}/`);
      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Resetear contraseña de usuario
   */
  async resetearPasswordUsuario(id: number): Promise<{ mensaje: string; password_temporal: string }> {
    try {
      const response = await this.cliente.post(`/usuarios/${id}/resetear-password/`);
      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Bloquear/desbloquear usuario
   */
  async bloquearUsuario(id: number, accion: 'bloquear' | 'desbloquear'): Promise<{ mensaje: string }> {
    try {
      const response = await this.cliente.post(
        `/usuarios/${id}/bloquear/`,
        { accion }
      );
      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  // =======================================================
  // MÉTODOS DE ROLES Y ESTADÍSTICAS
  // =======================================================

  /**
   * Obtener lista de roles
   */
  async obtenerRoles(): Promise<Rol[]> {
    try {
      const response: AxiosResponse<Rol[]> = await this.cliente.get('/usuarios/roles/');
      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async obtenerEstadisticasUsuarios(): Promise<RespuestaEstadisticasUsuarios> {
    try {
      const response: AxiosResponse<RespuestaEstadisticasUsuarios> = await this.cliente.get(
        '/usuarios/estadisticas/'
      );

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  // =======================================================
  // MÉTODOS DE UTILIDAD
  // =======================================================

  /**
   * Verificar conectividad con la API
   */
  async verificarConectividad(): Promise<boolean> {
    try {
      const response = await this.cliente.get('/health/');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener información de la API
   */
  async obtenerInfoAPI(): Promise<any> {
    try {
      const response = await this.cliente.get('/');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Subir avatar de usuario
   */
  async subirAvatar(archivo: File): Promise<{ url: string; mensaje: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', archivo);

      const response = await this.cliente.patch(
        '/usuarios/perfil/actualizar/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Buscar usuarios por término
   */
  async buscarUsuarios(termino: string, limite: number = 10): Promise<UsuarioResumen[]> {
    try {
      const response = await this.cliente.get('/usuarios/', {
        params: {
          search: termino,
          page_size: limite,
        },
      });

      // Manejar tanto respuesta paginada como no paginada
      if (response.data.results) {
        return response.data.results;
      } else if (response.data.usuarios) {
        return response.data.usuarios;
      } else {
        return response.data;
      }
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Exportar datos de usuarios
   */
  async exportarUsuarios(formato: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await this.cliente.get(`/usuarios/exportar/`, {
        params: { formato },
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      this.manejarErrorAPI(error as AxiosError);
    }
  }

  /**
   * Validar email único
   */
  async validarEmailUnico(email: string, excluirId?: number): Promise<boolean> {
    try {
      const params: any = { email };
      if (excluirId) {
        params.excluir_id = excluirId;
      }

      const response = await this.cliente.get('/usuarios/validar-email/', {
        params,
      });

      return response.data.disponible;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validar documento único
   */
  async validarDocumentoUnico(documento: string, excluirId?: number): Promise<boolean> {
    try {
      const params: any = { documento };
      if (excluirId) {
        params.excluir_id = excluirId;
      }

      const response = await this.cliente.get('/usuarios/validar-documento/', {
        params,
      });

      return response.data.disponible;
    } catch (error) {
      return false;
    }
  }
}

// Crear instancia singleton del servicio
export const authService = new AuthService();

// Exportar también la clase para tests
export { AuthService };

// Exportar por defecto
export default authService;