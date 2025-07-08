/**
 * Contexto de Autenticación - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Provider global para manejo de autenticación y estado de usuario
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Usuario, DatosLogin, DatosRegistro, EstadoAuth } from '../types/auth';
import { serviciosAuth } from '../servicios/authAPI';
import toast from 'react-hot-toast';

// =======================================================
// TIPOS DEL CONTEXTO
// =======================================================

interface ContextoAuth {
  // Estado
  usuario: Usuario | null;
  estaAutenticado: boolean;
  estaCargando: boolean;
  error: string | null;
  
  // Acciones
  iniciarSesion: (datos: DatosLogin) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  actualizarPerfil: (datos: Partial<Usuario>) => Promise<void>;
  cambiarPassword: (passwordActual: string, passwordNueva: string) => Promise<void>;
  limpiarError: () => void;
  
  // Verificaciones de permisos
  tienePermiso: (permiso: string) => boolean;
  esAdministrador: () => boolean;
  esContador: () => boolean;
  esVendedor: () => boolean;
  esCliente: () => boolean;
  
  // Utilidades
  obtenerToken: () => string | null;
  refrescarToken: () => Promise<void>;
}

// =======================================================
// ACTIONS DEL REDUCER
// =======================================================

type AccionAuth =
  | { type: 'INICIAR_CARGA' }
  | { type: 'LOGIN_EXITO'; payload: { usuario: Usuario; tokens: any } }
  | { type: 'LOGOUT' }
  | { type: 'ACTUALIZAR_USUARIO'; payload: Usuario }
  | { type: 'ERROR'; payload: string }
  | { type: 'LIMPIAR_ERROR' }
  | { type: 'REFRESCAR_TOKEN'; payload: { access: string } };

// =======================================================
// ESTADO INICIAL
// =======================================================

const estadoInicial: EstadoAuth = {
  usuario: null,
  estaAutenticado: false,
  estaCargando: true,
  error: null,
  tokens: {
    access: null,
    refresh: null
  }
};

// =======================================================
// REDUCER
// =======================================================

const authReducer = (estado: EstadoAuth, accion: AccionAuth): EstadoAuth => {
  switch (accion.type) {
    case 'INICIAR_CARGA':
      return {
        ...estado,
        estaCargando: true,
        error: null
      };
      
    case 'LOGIN_EXITO':
      return {
        ...estado,
        usuario: accion.payload.usuario,
        tokens: accion.payload.tokens,
        estaAutenticado: true,
        estaCargando: false,
        error: null
      };
      
    case 'LOGOUT':
      return {
        ...estadoInicial,
        estaCargando: false
      };
      
    case 'ACTUALIZAR_USUARIO':
      return {
        ...estado,
        usuario: accion.payload,
        estaCargando: false,
        error: null
      };
      
    case 'ERROR':
      return {
        ...estado,
        error: accion.payload,
        estaCargando: false
      };
      
    case 'LIMPIAR_ERROR':
      return {
        ...estado,
        error: null
      };
      
    case 'REFRESCAR_TOKEN':
      return {
        ...estado,
        tokens: {
          ...estado.tokens,
          access: accion.payload.access
        }
      };
      
    default:
      return estado;
  }
};

// =======================================================
// CONTEXTO
// =======================================================

const AuthContext = createContext<ContextoAuth | undefined>(undefined);

// =======================================================
// PROVIDER
// =======================================================

interface PropiedadesAuthProvider {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<PropiedadesAuthProvider> = ({ children }) => {
  const [estado, dispatch] = useReducer(authReducer, estadoInicial);

  // =======================================================
  // FUNCIONES DE UTILIDAD
  // =======================================================

  const obtenerToken = useCallback((): string | null => {
    return estado.tokens.access || localStorage.getItem('access_token');
  }, [estado.tokens.access]);

  const guardarTokensEnStorage = useCallback((tokens: { access: string; refresh: string }) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }, []);

  const limpiarTokensDelStorage = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('usuario_info');
  }, []);

  // =======================================================
  // FUNCIONES DE AUTENTICACIÓN
  // =======================================================

  const iniciarSesion = useCallback(async (datos: DatosLogin): Promise<void> => {
    try {
      dispatch({ type: 'INICIAR_CARGA' });

      const respuesta = await serviciosAuth.login(datos);

      if (respuesta.success && respuesta.data) {
        const { access, refresh, user } = respuesta.data;
        
        // Guardar tokens
        const tokens = { access, refresh };
        guardarTokensEnStorage(tokens);
        
        // Guardar info del usuario
        localStorage.setItem('usuario_info', JSON.stringify(user));

        dispatch({
          type: 'LOGIN_EXITO',
          payload: { usuario: user, tokens }
        });

        toast.success(`¡Bienvenido, ${user.nombres}!`);
      } else {
        throw new Error(respuesta.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      const mensaje = error.response?.data?.message || 
                    error.message || 
                    'Error al iniciar sesión';
      
      dispatch({ type: 'ERROR', payload: mensaje });
      toast.error(mensaje);
      throw error;
    }
  }, [guardarTokensEnStorage]);

  const cerrarSesion = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        // Intentar hacer logout en el servidor
        try {
          await serviciosAuth.logout(refreshToken);
        } catch (error) {
          console.warn('Error al hacer logout en el servidor:', error);
        }
      }

      // Limpiar estado local
      limpiarTokensDelStorage();
      dispatch({ type: 'LOGOUT' });
      
      toast.success('Sesión cerrada correctamente');
    } catch (error: any) {
      console.error('Error cerrando sesión:', error);
      // Aunque haya error, limpiamos localmente
      limpiarTokensDelStorage();
      dispatch({ type: 'LOGOUT' });
    }
  }, [limpiarTokensDelStorage]);

  const registrarse = useCallback(async (datos: DatosRegistro): Promise<void> => {
    try {
      dispatch({ type: 'INICIAR_CARGA' });

      const respuesta = await serviciosAuth.registro(datos);

      if (respuesta.success) {
        toast.success('Registro exitoso. Verifica tu email para activar la cuenta.');
        // No iniciamos sesión automáticamente, el usuario debe verificar email
      } else {
        throw new Error(respuesta.message || 'Error en el registro');
      }
    } catch (error: any) {
      const mensaje = error.response?.data?.message || 
                    error.message || 
                    'Error en el registro';
      
      dispatch({ type: 'ERROR', payload: mensaje });
      toast.error(mensaje);
      throw error;
    }
  }, []);

  const refrescarToken = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No hay token de refresh');
      }

      const respuesta = await serviciosAuth.refrescarToken(refreshToken);

      if (respuesta.success && respuesta.data) {
        const { access } = respuesta.data;
        
        localStorage.setItem('access_token', access);
        dispatch({ type: 'REFRESCAR_TOKEN', payload: { access } });
      } else {
        throw new Error('Error refrescando token');
      }
    } catch (error) {
      console.error('Error refrescando token:', error);
      // Si no se puede refrescar, cerrar sesión
      await cerrarSesion();
    }
  }, [cerrarSesion]);

  const actualizarPerfil = useCallback(async (datos: Partial<Usuario>): Promise<void> => {
    try {
      dispatch({ type: 'INICIAR_CARGA' });

      const respuesta = await serviciosAuth.actualizarPerfil(datos);

      if (respuesta.success && respuesta.data) {
        // Actualizar info en localStorage
        localStorage.setItem('usuario_info', JSON.stringify(respuesta.data));
        
        dispatch({ type: 'ACTUALIZAR_USUARIO', payload: respuesta.data });
        toast.success('Perfil actualizado correctamente');
      } else {
        throw new Error(respuesta.message || 'Error actualizando perfil');
      }
    } catch (error: any) {
      const mensaje = error.response?.data?.message || 
                    error.message || 
                    'Error actualizando perfil';
      
      dispatch({ type: 'ERROR', payload: mensaje });
      toast.error(mensaje);
      throw error;
    }
  }, []);

  const cambiarPassword = useCallback(async (
    passwordActual: string, 
    passwordNueva: string
  ): Promise<void> => {
    try {
      dispatch({ type: 'INICIAR_CARGA' });

      const respuesta = await serviciosAuth.cambiarPassword({
        current_password: passwordActual,
        new_password: passwordNueva
      });

      if (respuesta.success) {
        toast.success('Contraseña cambiada correctamente');
      } else {
        throw new Error(respuesta.message || 'Error cambiando contraseña');
      }
    } catch (error: any) {
      const mensaje = error.response?.data?.message || 
                    error.message || 
                    'Error cambiando contraseña';
      
      dispatch({ type: 'ERROR', payload: mensaje });
      toast.error(mensaje);
      throw error;
    }
  }, []);

  const limpiarError = useCallback(() => {
    dispatch({ type: 'LIMPIAR_ERROR' });
  }, []);

  // =======================================================
  // FUNCIONES DE VERIFICACIÓN DE PERMISOS
  // =======================================================

  const tienePermiso = useCallback((permiso: string): boolean => {
    if (!estado.usuario) return false;
    
    const permisos = estado.usuario.rol_detalle?.permisos_especiales || {};
    return permisos[permiso] === true;
  }, [estado.usuario]);

  const esAdministrador = useCallback((): boolean => {
    return estado.usuario?.rol_detalle?.codigo === 'administrador';
  }, [estado.usuario]);

  const esContador = useCallback((): boolean => {
    return estado.usuario?.rol_detalle?.codigo === 'contador';
  }, [estado.usuario]);

  const esVendedor = useCallback((): boolean => {
    return estado.usuario?.rol_detalle?.codigo === 'vendedor';
  }, [estado.usuario]);

  const esCliente = useCallback((): boolean => {
    return estado.usuario?.rol_detalle?.codigo === 'cliente';
  }, [estado.usuario]);

  // =======================================================
  // EFECTO DE INICIALIZACIÓN
  // =======================================================

  useEffect(() => {
    const inicializarAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const usuarioInfo = localStorage.getItem('usuario_info');

        if (token && usuarioInfo) {
          try {
            const usuario = JSON.parse(usuarioInfo);
            
            // Verificar si el token sigue siendo válido
            const perfilActual = await serviciosAuth.obtenerPerfil();
            
            if (perfilActual.success && perfilActual.data) {
              dispatch({
                type: 'LOGIN_EXITO',
                payload: {
                  usuario: perfilActual.data,
                  tokens: {
                    access: token,
                    refresh: localStorage.getItem('refresh_token')
                  }
                }
              });
            } else {
              // Token inválido, limpiar
              limpiarTokensDelStorage();
              dispatch({ type: 'LOGOUT' });
            }
          } catch (error) {
            console.warn('Token inválido o expirado:', error);
            limpiarTokensDelStorage();
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    inicializarAuth();
  }, [limpiarTokensDelStorage]);

  // =======================================================
  // INTERCEPTOR PARA REFRESH TOKEN
  // =======================================================

  useEffect(() => {
    let intervalo: NodeJS.Timeout;

    if (estado.estaAutenticado && estado.tokens.access) {
      // Refrescar token cada 45 minutos (si el token dura 1 hora)
      intervalo = setInterval(() => {
        refrescarToken().catch(console.error);
      }, 45 * 60 * 1000);
    }

    return () => {
      if (intervalo) {
        clearInterval(intervalo);
      }
    };
  }, [estado.estaAutenticado, estado.tokens.access, refrescarToken]);

  // =======================================================
  // VALOR DEL CONTEXTO
  // =======================================================

  const valorContexto: ContextoAuth = {
    // Estado
    usuario: estado.usuario,
    estaAutenticado: estado.estaAutenticado,
    estaCargando: estado.estaCargando,
    error: estado.error,
    
    // Acciones
    iniciarSesion,
    cerrarSesion,
    registrarse,
    actualizarPerfil,
    cambiarPassword,
    limpiarError,
    
    // Verificaciones
    tienePermiso,
    esAdministrador,
    esContador,
    esVendedor,
    esCliente,
    
    // Utilidades
    obtenerToken,
    refrescarToken
  };

  return (
    <AuthContext.Provider value={valorContexto}>
      {children}
    </AuthContext.Provider>
  );
};

// =======================================================
// HOOK PERSONALIZADO
// =======================================================

export const useAuth = (): ContextoAuth => {
  const contexto = useContext(AuthContext);
  
  if (contexto === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return contexto;
};

export default AuthContext;