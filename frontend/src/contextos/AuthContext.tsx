/**
 * AuthContext - Contexto de Autenticación FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Manejo global del estado de autenticación con JWT
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Usuario, EstadoAuth, AccionAuth, DatosLogin, DatosRegistro } from '../types/auth';
import { authService } from '../servicios/auth';
import { toast } from 'sonner';

// Estado inicial de autenticación
const estadoInicialAuth: EstadoAuth = {
  usuario: null,
  token: null,
  refreshToken: null,
  estaAutenticado: false,
  estaCargando: true,
  estaLoginCargando: false,
  estaRegistroCargando: false,
  error: null,
};

// Reducer para manejar acciones de autenticación
function authReducer(estado: EstadoAuth, accion: AccionAuth): EstadoAuth {
  switch (accion.type) {
    case 'INICIAR_CARGA':
      return {
        ...estado,
        estaCargando: true,
        error: null,
      };

    case 'INICIAR_LOGIN':
      return {
        ...estado,
        estaLoginCargando: true,
        error: null,
      };

    case 'INICIAR_REGISTRO':
      return {
        ...estado,
        estaRegistroCargando: true,
        error: null,
      };

    case 'LOGIN_EXITOSO':
      return {
        ...estado,
        usuario: accion.payload.usuario,
        token: accion.payload.token,
        refreshToken: accion.payload.refreshToken,
        estaAutenticado: true,
        estaCargando: false,
        estaLoginCargando: false,
        error: null,
      };

    case 'REGISTRO_EXITOSO':
      return {
        ...estado,
        estaRegistroCargando: false,
        error: null,
      };

    case 'LOGOUT':
      return {
        ...estadoInicialAuth,
        estaCargando: false,
      };

    case 'ACTUALIZAR_USUARIO':
      return {
        ...estado,
        usuario: accion.payload,
      };

    case 'ACTUALIZAR_TOKEN':
      return {
        ...estado,
        token: accion.payload.token,
        refreshToken: accion.payload.refreshToken,
      };

    case 'ERROR':
      return {
        ...estado,
        error: accion.payload,
        estaCargando: false,
        estaLoginCargando: false,
        estaRegistroCargando: false,
      };

    case 'LIMPIAR_ERROR':
      return {
        ...estado,
        error: null,
      };

    case 'FINALIZAR_CARGA':
      return {
        ...estado,
        estaCargando: false,
      };

    default:
      return estado;
  }
}

// Contexto de autenticación
interface ContextoAuth {
  estado: EstadoAuth;
  iniciarSesion: (datos: DatosLogin) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  actualizarPerfil: (datos: Partial<Usuario>) => Promise<void>;
  cambiarPassword: (passwordActual: string, passwordNueva: string) => Promise<void>;
  validarToken: () => Promise<boolean>;
  limpiarError: () => void;
  renovarToken: () => Promise<void>;
}

const AuthContext = createContext<ContextoAuth | undefined>(undefined);

// Props del proveedor
interface PropiedadesProveedorAuth {
  children: ReactNode;
}

// Proveedor de autenticación
export const ProveedorAuth: React.FC<PropiedadesProveedorAuth> = ({ children }) => {
  const [estado, dispatch] = useReducer(authReducer, estadoInicialAuth);

  // Inicializar autenticación al cargar la aplicación
  useEffect(() => {
    inicializarAuth();
  }, []);

  // Configurar interceptor para renovación automática de tokens
  useEffect(() => {
    if (estado.estaAutenticado && estado.token) {
      const interceptor = authService.configurarInterceptorRenovacion(
        () => renovarToken(),
        () => cerrarSesion()
      );

      return () => {
        // Limpiar interceptor al desmontar
        interceptor();
      };
    }
  }, [estado.estaAutenticado, estado.token]);

  /**
   * Inicializar autenticación desde localStorage
   */
  const inicializarAuth = async (): Promise<void> => {
    try {
      dispatch({ type: 'INICIAR_CARGA' });

      const token = localStorage.getItem('felicitafac_token');
      const refreshToken = localStorage.getItem('felicitafac_refresh');
      const usuarioStr = localStorage.getItem('felicitafac_usuario');

      if (token && refreshToken && usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        
        // Configurar token en el servicio
        authService.establecerToken(token);

        // Validar token con el servidor
        const esValido = await authService.validarToken();
        
        if (esValido) {
          dispatch({
            type: 'LOGIN_EXITOSO',
            payload: {
              usuario,
              token,
              refreshToken,
            },
          });
        } else {
          // Token inválido, intentar renovar
          try {
            await renovarTokenInterno(refreshToken);
          } catch {
            limpiarStorageAuth();
            dispatch({ type: 'LOGOUT' });
          }
        }
      } else {
        dispatch({ type: 'FINALIZAR_CARGA' });
      }
    } catch (error) {
      console.error('Error inicializando autenticación:', error);
      limpiarStorageAuth();
      dispatch({ type: 'FINALIZAR_CARGA' });
    }
  };

  /**
   * Iniciar sesión
   */
  const iniciarSesion = async (datos: DatosLogin): Promise<void> => {
    try {
      dispatch({ type: 'INICIAR_LOGIN' });

      const respuesta = await authService.login(datos);
      
      // Guardar datos en localStorage
      localStorage.setItem('felicitafac_token', respuesta.access);
      localStorage.setItem('felicitafac_refresh', respuesta.refresh);
      localStorage.setItem('felicitafac_usuario', JSON.stringify(respuesta.usuario));

      // Configurar token en el servicio
      authService.establecerToken(respuesta.access);

      dispatch({
        type: 'LOGIN_EXITOSO',
        payload: {
          usuario: respuesta.usuario,
          token: respuesta.access,
          refreshToken: respuesta.refresh,
        },
      });

      toast.success(`¡Bienvenido ${respuesta.usuario.nombres}!`);
    } catch (error: any) {
      const mensajeError = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          'Error al iniciar sesión';
      
      dispatch({
        type: 'ERROR',
        payload: mensajeError,
      });

      toast.error(mensajeError);
      throw error;
    }
  };

  /**
   * Cerrar sesión
   */
  const cerrarSesion = async (): Promise<void> => {
    try {
      // Intentar logout en el servidor
      try {
        await authService.logout(estado.refreshToken || '');
      } catch (error) {
        // Ignorar errores del servidor en logout
        console.warn('Error en logout del servidor:', error);
      }

      // Limpiar estado local
      limpiarStorageAuth();
      authService.limpiarToken();
      
      dispatch({ type: 'LOGOUT' });
      
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      // Forzar limpieza local aunque falle el servidor
      limpiarStorageAuth();
      authService.limpiarToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  /**
   * Registrar nuevo usuario
   */
  const registrarse = async (datos: DatosRegistro): Promise<void> => {
    try {
      dispatch({ type: 'INICIAR_REGISTRO' });

      await authService.registro(datos);
      
      dispatch({ type: 'REGISTRO_EXITOSO' });
      
      toast.success('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
    } catch (error: any) {
      const mensajeError = error.response?.data?.mensaje || 
                          'Error al registrar usuario';
      
      dispatch({
        type: 'ERROR',
        payload: mensajeError,
      });

      toast.error(mensajeError);
      throw error;
    }
  };

  /**
   * Actualizar perfil del usuario
   */
  const actualizarPerfil = async (datosActualizacion: Partial<Usuario>): Promise<void> => {
    try {
      const usuarioActualizado = await authService.actualizarPerfil(datosActualizacion);
      
      // Actualizar usuario en localStorage
      localStorage.setItem('felicitafac_usuario', JSON.stringify(usuarioActualizado));
      
      dispatch({
        type: 'ACTUALIZAR_USUARIO',
        payload: usuarioActualizado,
      });

      toast.success('Perfil actualizado exitosamente');
    } catch (error: any) {
      const mensajeError = error.response?.data?.mensaje || 
                          'Error al actualizar perfil';
      
      dispatch({
        type: 'ERROR',
        payload: mensajeError,
      });

      toast.error(mensajeError);
      throw error;
    }
  };

  /**
   * Cambiar contraseña
   */
  const cambiarPassword = async (passwordActual: string, passwordNueva: string): Promise<void> => {
    try {
      await authService.cambiarPassword({
        password_actual: passwordActual,
        password_nueva: passwordNueva,
        confirmar_password_nueva: passwordNueva,
      });

      toast.success('Contraseña cambiada exitosamente');
    } catch (error: any) {
      const mensajeError = error.response?.data?.mensaje || 
                          'Error al cambiar contraseña';
      
      dispatch({
        type: 'ERROR',
        payload: mensajeError,
      });

      toast.error(mensajeError);
      throw error;
    }
  };

  /**
   * Validar token actual
   */
  const validarToken = async (): Promise<boolean> => {
    try {
      if (!estado.token) return false;
      
      return await authService.validarToken();
    } catch (error) {
      console.error('Error validando token:', error);
      return false;
    }
  };

  /**
   * Renovar token de acceso
   */
  const renovarToken = async (): Promise<void> => {
    try {
      const refreshToken = estado.refreshToken || localStorage.getItem('felicitafac_refresh');
      
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      await renovarTokenInterno(refreshToken);
    } catch (error) {
      console.error('Error renovando token:', error);
      // Si falla la renovación, cerrar sesión
      await cerrarSesion();
      throw error;
    }
  };

  /**
   * Renovar token interno
   */
  const renovarTokenInterno = async (refreshToken: string): Promise<void> => {
    const respuesta = await authService.renovarToken(refreshToken);
    
    // Actualizar tokens en localStorage
    localStorage.setItem('felicitafac_token', respuesta.access);
    if (respuesta.refresh) {
      localStorage.setItem('felicitafac_refresh', respuesta.refresh);
    }

    // Configurar nuevo token en el servicio
    authService.establecerToken(respuesta.access);

    dispatch({
      type: 'ACTUALIZAR_TOKEN',
      payload: {
        token: respuesta.access,
        refreshToken: respuesta.refresh || refreshToken,
      },
    });
  };

  /**
   * Limpiar error
   */
  const limpiarError = (): void => {
    dispatch({ type: 'LIMPIAR_ERROR' });
  };

  /**
   * Limpiar localStorage de autenticación
   */
  const limpiarStorageAuth = (): void => {
    localStorage.removeItem('felicitafac_token');
    localStorage.removeItem('felicitafac_refresh');
    localStorage.removeItem('felicitafac_usuario');
  };

  // Valor del contexto
  const valorContexto: ContextoAuth = {
    estado,
    iniciarSesion,
    cerrarSesion,
    registrarse,
    actualizarPerfil,
    cambiarPassword,
    validarToken,
    limpiarError,
    renovarToken,
  };

  return (
    <AuthContext.Provider value={valorContexto}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useContextoAuth = (): ContextoAuth => {
  const contexto = useContext(AuthContext);
  
  if (contexto === undefined) {
    throw new Error('useContextoAuth debe ser usado dentro de un ProveedorAuth');
  }
  
  return contexto;
};

// Exportación por defecto
export default AuthContext;