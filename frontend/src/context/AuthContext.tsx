/**
 * AuthContext Corregido - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Provider global para manejo de autenticación consistente
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Usuario, DatosLogin, DatosRegistro, EstadoAuth, AccionAuth, ContextoAuth, TokensAuth, Permiso } from '../types/auth';
import { serviciosAuth } from '../servicios/authAPI';
import toast from 'react-hot-toast';

// =======================================================
// ESTADO INICIAL CORREGIDO
// =======================================================

const estadoInicial: EstadoAuth = {
  usuario: null,
  tokens: {
    access: null,
    refresh: null
  },
  estaAutenticado: false,
  estaCargando: true,
  error: null
};

// =======================================================
// REDUCER CORREGIDO
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
// PROVIDER CORREGIDO
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

  const guardarTokensEnStorage = useCallback((tokens: TokensAuth) => {
    if (tokens.access) localStorage.setItem('access_token', tokens.access);
    if (tokens.refresh) localStorage.setItem('refresh_token', tokens.refresh);
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
        const tokens: TokensAuth = { access, refresh };
        guardarTokensEnStorage(tokens);
        
        // Guardar info usuario
        localStorage.setItem('usuario_info', JSON.stringify(user));
        
        dispatch({
          type: 'LOGIN_EXITO',
          payload: {
            usuario: user,
            tokens
          }
        });

        toast.success(`¡Bienvenido, ${user.nombre}!`);
      } else {
        throw new Error(respuesta.message || 'Credenciales inválidas');
      }
    } catch (error: any) {
      const mensaje = error.response?.data?.message || 
                    error.message || 
                    'Error en el inicio de sesión';
      
      dispatch({ type: 'ERROR', payload: mensaje });
      toast.error(mensaje);
      throw error;
    }
  }, [guardarTokensEnStorage]);

  const cerrarSesion = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = estado.tokens.refresh;
      
      if (refreshToken) {
        // Notificar al servidor sobre el logout
        await serviciosAuth.logout(refreshToken).catch(console.warn);
      }
    } catch (error) {
      console.warn('Error en logout del servidor:', error);
    } finally {
      // Limpiar estado local siempre
      limpiarTokensDelStorage();
      dispatch({ type: 'LOGOUT' });
      toast.success('Sesión cerrada correctamente');
    }
  }, [estado.tokens.refresh, limpiarTokensDelStorage]);

  const registrarse = useCallback(async (datos: DatosRegistro): Promise<void> => {
    try {
      dispatch({ type: 'INICIAR_CARGA' });

      const respuesta = await serviciosAuth.registro(datos);

      if (respuesta.success) {
        dispatch({ type: 'LOGOUT' }); // Estado inicial sin login automático
        toast.success('Registro exitoso. Verifica tu email para activar la cuenta.');
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
      const refreshToken = estado.tokens.refresh || localStorage.getItem('refresh_token');
      
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
  }, [estado.tokens.refresh, cerrarSesion]);

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

  const cambiarPassword = useCallback(async (passwordActual: string, passwordNueva: string): Promise<void> => {
    try {
      dispatch({ type: 'INICIAR_CARGA' });

      const respuesta = await serviciosAuth.cambiarPassword({
        current_password: passwordActual,
        new_password: passwordNueva
      });

      if (respuesta.success) {
        dispatch({ type: 'LIMPIAR_ERROR' });
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
  // FUNCIONES DE PERMISOS
  // =======================================================

  const tienePermiso = useCallback((permiso: Permiso): boolean => {
    if (!estado.usuario?.rol_detalle) return false;

    const rol = estado.usuario.rol_detalle;
    
    // Administrador tiene todos los permisos
    if (rol.codigo === 'administrador') return true;

    // Verificar permisos específicos por rol
    switch (rol.codigo) {
      case 'contador':
        return [
          'ver_reportes',
          'crear_facturas',
          'ver_dashboard',
          'exportar_datos',
          'gestionar_inventario',
          'ver_contabilidad',
          'generar_ple',
          'validar_documentos',
          'gestionar_clientes'
        ].includes(permiso);

      case 'vendedor':
        return [
          'crear_facturas',
          'ver_dashboard',
          'gestionar_inventario',
          'gestionar_clientes',
          'ver_ventas'
        ].includes(permiso);

      case 'cliente':
        return [
          'ver_dashboard',
          'ver_mis_documentos'
        ].includes(permiso);

      default:
        return false;
    }
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