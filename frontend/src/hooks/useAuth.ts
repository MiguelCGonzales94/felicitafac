/**
 * useAuth Hook - Hook Personalizado FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook para manejo de autenticación con validaciones y permisos
 * VERSIÓN MEJORADA para integración con Login.tsx
 */

import { useMemo, useCallback } from 'react';
import { useAuth as useAuthContext } from '../context/AuthContext';
import { CodigoRol, Permiso, DatosLogin } from '../types/auth';

/**
 * Hook personalizado para autenticación
 * Proporciona métodos y estado de autenticación optimizados
 */
export const useAuth = () => {
  // Usar el hook del contexto directamente
  const contextAuth = useAuthContext();
  
  // Destructuring con valores por defecto para evitar errores
  const {
    usuario,
    estaAutenticado = false,
    estaCargando = false,
    error = null,
    iniciarSesion: iniciarSesionOriginal,
    cerrarSesion,
    registrarse,
    actualizarPerfil,
    cambiarPassword,
    limpiarError,
    tienePermiso,
    esAdministrador,
    esContador,
    esVendedor,
    esCliente,
    obtenerToken,
    refrescarToken
  } = contextAuth || {};

  // =======================================================
  // FUNCIONES DE AUTENTICACIÓN MEJORADAS
  // =======================================================

  /**
   * Función mejorada de login con mejor manejo de errores
   */
  const iniciarSesion = useCallback(async (credenciales: DatosLogin): Promise<void> => {
    try {
      // Validar datos antes de enviar
      if (!credenciales.email || !credenciales.password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credenciales.email)) {
        throw new Error('Formato de email inválido');
      }

      // Limpiar errores previos
      if (limpiarError) {
        limpiarError();
      }

      // Llamar a la función original del contexto
      if (iniciarSesionOriginal) {
        await iniciarSesionOriginal(credenciales);
      } else {
        throw new Error('Servicio de autenticación no disponible');
      }

    } catch (error: any) {
      let mensajeError = 'Error inesperado durante el login';
      
      // Manejo específico de errores
      if (error.response?.status === 401) {
        mensajeError = 'Credenciales inválidas';
      } else if (error.response?.status === 403) {
        mensajeError = 'Usuario bloqueado. Contacte al administrador.';
      } else if (error.response?.status === 429) {
        mensajeError = 'Demasiados intentos. Intente más tarde.';
      } else if (error.response?.status >= 500) {
        mensajeError = 'Error del servidor. Intente más tarde.';
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
        mensajeError = 'Error de conexión. Verifica tu internet.';
      } else if (error.code === 'TIMEOUT') {
        mensajeError = 'La solicitud tardó demasiado. Intenta nuevamente.';
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      console.error('Error en login:', error);
      throw new Error(mensajeError);
    }
  }, [iniciarSesionOriginal, limpiarError]);

  /**
   * Función de logout mejorada
   */
  const cerrarSesionMejorado = useCallback(async (): Promise<void> => {
    try {
      // Limpiar localStorage específico de FELICITAFAC
      localStorage.removeItem('felicitafac_access_token');
      localStorage.removeItem('felicitafac_refresh_token');
      localStorage.removeItem('felicitafac_user_data');
      
      // Llamar al logout original
      if (cerrarSesion) {
        await cerrarSesion();
      }
    } catch (error) {
      console.error('Error durante logout:', error);
      // Incluso si hay error, limpiar localStorage
      localStorage.clear();
    }
  }, [cerrarSesion]);

  // =======================================================
  // FUNCIONES DE PERMISOS MEMOIZADAS
  // =======================================================

  // Memorizar funciones de validación de permisos para optimizar renders
  const funcionesPermisos = useMemo(() => {
    /**
     * Verificar si el usuario tiene un permiso específico
     */
    const tienePermisoAvanzado = (permiso: Permiso): boolean => {
      if (!usuario?.rol_detalle) return false;

      const rol = usuario.rol_detalle;
      
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
            'gestionar_clientes',
            'gestionar_productos'
          ].includes(permiso);

        case 'vendedor':
          return [
            'crear_facturas',
            'ver_dashboard',
            'gestionar_inventario',
            'gestionar_clientes',
            'gestionar_productos',
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
    };

    /**
     * Verificar si es rol administrativo
     */
    const esRolAdministrativo = (): boolean => {
      if (!usuario?.rol_detalle) return false;
      return ['administrador', 'contador'].includes(usuario.rol_detalle.codigo);
    };

    /**
     * Verificar si puede acceder a un módulo específico
     */
    const puedeAccederModulo = (modulo: string): boolean => {
      if (!usuario?.rol_detalle) return false;

      const rol = usuario.rol_detalle.codigo;

      switch (modulo) {
        case 'admin':
        case 'dashboard-admin':
          return ['administrador', 'contador'].includes(rol);
        
        case 'facturacion':
          return ['administrador', 'contador', 'vendedor'].includes(rol);
        
        case 'inventario':
          return ['administrador', 'contador', 'vendedor'].includes(rol);
        
        case 'contabilidad':
          return ['administrador', 'contador'].includes(rol);
        
        case 'reportes':
          return ['administrador', 'contador'].includes(rol);
        
        case 'configuracion':
        case 'sistema':
        case 'usuarios':
          return ['administrador'].includes(rol);
        
        case 'clientes':
        case 'productos':
          return ['administrador', 'contador', 'vendedor'].includes(rol);
        
        case 'perfil':
        case 'dashboard':
          return true; // Todos pueden acceder
        
        default:
          return false;
      }
    };

    /**
     * Obtener nivel de acceso del usuario
     */
    const obtenerNivelAcceso = (): 'completo' | 'intermedio' | 'basico' | 'restringido' => {
      if (!usuario?.rol_detalle) return 'restringido';

      switch (usuario.rol_detalle.codigo) {
        case 'administrador':
          return 'completo';
        case 'contador':
          return 'intermedio';
        case 'vendedor':
          return 'basico';
        case 'cliente':
          return 'restringido';
        default:
          return 'restringido';
      }
    };

    /**
     * Verificar si puede gestionar usuarios
     */
    const puedeGestionarUsuarios = (): boolean => {
      return usuario?.rol_detalle?.codigo === 'administrador';
    };

    /**
     * Verificar si puede ver reportes avanzados
     */
    const puedeVerReportesAvanzados = (): boolean => {
      if (!usuario?.rol_detalle) return false;
      return ['administrador', 'contador'].includes(usuario.rol_detalle.codigo);
    };

    /**
     * Verificar si puede configurar el sistema
     */
    const puedeConfigurarSistema = (): boolean => {
      return usuario?.rol_detalle?.codigo === 'administrador';
    };

    return {
      tienePermisoAvanzado,
      esRolAdministrativo,
      puedeAccederModulo,
      obtenerNivelAcceso,
      puedeGestionarUsuarios,
      puedeVerReportesAvanzados,
      puedeConfigurarSistema,
    };
  }, [usuario]);

  // =======================================================
  // INFORMACIÓN DEL USUARIO MEMOIZADA
  // =======================================================

  // Información adicional del usuario
  const infoUsuario = useMemo(() => {
    if (!usuario) return null;

    return {
      id: usuario.id,
      email: usuario.email,
      nombreCompleto: usuario.nombre_completo,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      rolNombre: usuario.rol_detalle?.nombre || 'Sin rol',
      rolCodigo: usuario.rol_detalle?.codigo || '',
      estado: usuario.estado_usuario,
      estaActivo: usuario.estado_usuario === 'activo',
      fechaRegistro: usuario.fecha_creacion,
      ultimoLogin: usuario.ultimo_login,
      perfilCompleto: !!(usuario.nombre && usuario.apellidos),
      requiereCambioPassword: usuario.requiere_cambio_password || false,
    };
  }, [usuario]);

  // Estadísticas de sesión
  const estadisticasSesion = useMemo(() => {
    if (!usuario) return null;

    const ahora = new Date();
    const ultimoLogin = usuario.ultimo_login ? new Date(usuario.ultimo_login) : null;
    
    return {
      tiempoSesion: ultimoLogin ? Math.floor((ahora.getTime() - ultimoLogin.getTime()) / (1000 * 60)) : 0,
      esNuevaSesion: ultimoLogin ? (ahora.getTime() - ultimoLogin.getTime()) < (5 * 60 * 1000) : true,
      intentosFallidos: usuario.intentos_login_fallidos || 0,
      requiereCambioPassword: usuario.requiere_cambio_password || false,
      sesionProximaAExpirar: ultimoLogin ? ((ahora.getTime() - ultimoLogin.getTime()) > (7 * 60 * 60 * 1000)) : false,
    };
  }, [usuario]);

  // =======================================================
  // UTILIDADES MEMOIZADAS
  // =======================================================

  // Utilidades adicionales
  const utilidades = useMemo(() => {
    /**
     * Obtener saludo personalizado
     */
    const obtenerSaludo = (): string => {
      if (!usuario) return 'Hola';
      
      const hora = new Date().getHours();
      const nombre = usuario.nombre || usuario.nombre_completo?.split(' ')[0] || 'Usuario';
      
      if (hora < 12) {
        return `Buenos días, ${nombre}`;
      } else if (hora < 18) {
        return `Buenas tardes, ${nombre}`;
      } else {
        return `Buenas noches, ${nombre}`;
      }
    };

    /**
     * Obtener iniciales del usuario
     */
    const obtenerIniciales = (): string => {
      if (!usuario) return 'U';
      
      if (usuario.nombre && usuario.apellidos) {
        return `${usuario.nombre[0]}${usuario.apellidos[0]}`.toUpperCase();
      }
      
      if (usuario.nombre_completo) {
        const nombres = usuario.nombre_completo.split(' ');
        if (nombres.length >= 2) {
          return `${nombres[0][0]}${nombres[1][0]}`.toUpperCase();
        }
        return nombres[0][0].toUpperCase();
      }
      
      if (usuario.email) {
        return usuario.email[0].toUpperCase();
      }
      
      return 'U';
    };

    /**
     * Verificar si la sesión está próxima a expirar
     */
    const sesionProximaAExpirar = (): boolean => {
      if (!usuario?.ultimo_login) return false;
      
      const ultimoLogin = new Date(usuario.ultimo_login);
      const ahora = new Date();
      const tiempoSesion = ahora.getTime() - ultimoLogin.getTime();
      const limiteSesion = 8 * 60 * 60 * 1000; // 8 horas
      
      return tiempoSesion > (limiteSesion * 0.9); // 90% del tiempo límite
    };

    /**
     * Obtener rutas permitidas para el usuario
     */
    const obtenerRutasPermitidas = (): string[] => {
      if (!usuario?.rol_detalle) return ['/dashboard'];

      const rutasBase = ['/dashboard', '/perfil'];
      
      switch (usuario.rol_detalle.codigo) {
        case 'administrador':
          return [
            ...rutasBase,
            '/admin',
            '/admin/dashboard',
            '/admin/facturacion',
            '/admin/comercial',
            '/admin/inventario',
            '/admin/contabilidad',
            '/admin/reportes',
            '/admin/sistema',
            '/facturacion',
            '/inventario',
            '/contabilidad',
            '/reportes',
            '/configuracion',
            '/usuarios',
            '/clientes',
            '/productos'
          ];
        
        case 'contador':
          return [
            ...rutasBase,
            '/admin',
            '/admin/dashboard',
            '/admin/facturacion',
            '/admin/comercial',
            '/admin/inventario',
            '/admin/contabilidad',
            '/admin/reportes',
            '/facturacion',
            '/inventario',
            '/contabilidad',
            '/reportes',
            '/clientes',
            '/productos'
          ];
        
        case 'vendedor':
          return [
            ...rutasBase,
            '/facturacion',
            '/inventario',
            '/clientes',
            '/productos',
            '/pos'
          ];
        
        case 'cliente':
          return [
            ...rutasBase,
            '/mis-documentos'
          ];
        
        default:
          return rutasBase;
      }
    };

    /**
     * Verificar si una ruta está permitida
     */
    const esRutaPermitida = (ruta: string): boolean => {
      const rutasPermitidas = obtenerRutasPermitidas();
      
      // Verificar coincidencia exacta o prefijo
      return rutasPermitidas.some(rutaPermitida => 
        ruta === rutaPermitida || ruta.startsWith(rutaPermitida + '/')
      );
    };

    /**
     * Obtener ruta de redirección por defecto según el rol
     */
    const obtenerRutaDefault = (): string => {
      if (!usuario?.rol_detalle) return '/dashboard';
      
      switch (usuario.rol_detalle.codigo) {
        case 'administrador':
        case 'contador':
          return '/admin/dashboard';
        case 'vendedor':
          return '/dashboard';
        case 'cliente':
          return '/dashboard';
        default:
          return '/dashboard';
      }
    };

    return {
      obtenerSaludo,
      obtenerIniciales,
      sesionProximaAExpirar,
      obtenerRutasPermitidas,
      esRutaPermitida,
      obtenerRutaDefault,
    };
  }, [usuario]);

  // =======================================================
  // FUNCIONES DE VALIDACIÓN
  // =======================================================

  /**
   * Verificar si el contexto de auth está disponible
   */
  const estaDisponible = useMemo(() => {
    return !!contextAuth;
  }, [contextAuth]);

  /**
   * Obtener información de depuración
   */
  const infoDebug = useMemo(() => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return {
      contextDisponible: estaDisponible,
      usuarioId: usuario?.id,
      rolCodigo: usuario?.rol_detalle?.codigo,
      estaAutenticado,
      estaCargando,
      tieneError: !!error,
      mensajeError: error,
    };
  }, [estaDisponible, usuario, estaAutenticado, estaCargando, error]);

  // =======================================================
  // INTERFAZ DEL HOOK
  // =======================================================

  // Retornar interfaz completa del hook
  return {
    // Estado básico
    usuario,
    estaAutenticado,
    estaCargando,
    error,
    estaDisponible,

    // Funciones de autenticación (mejoradas)
    iniciarSesion,
    cerrarSesion: cerrarSesionMejorado,
    registrarse,
    actualizarPerfil,
    cambiarPassword,
    limpiarError,

    // Funciones de permisos (del contexto)
    tienePermiso,
    esAdministrador,
    esContador,
    esVendedor,
    esCliente,

    // Funciones adicionales avanzadas
    esRolAdministrativo: funcionesPermisos.esRolAdministrativo,
    puedeAccederModulo: funcionesPermisos.puedeAccederModulo,
    obtenerNivelAcceso: funcionesPermisos.obtenerNivelAcceso,
    puedeGestionarUsuarios: funcionesPermisos.puedeGestionarUsuarios,
    puedeVerReportesAvanzados: funcionesPermisos.puedeVerReportesAvanzados,
    puedeConfigurarSistema: funcionesPermisos.puedeConfigurarSistema,
    tienePermisoAvanzado: funcionesPermisos.tienePermisoAvanzado,

    // Información del usuario
    infoUsuario,
    estadisticasSesion,

    // Utilidades
    obtenerSaludo: utilidades.obtenerSaludo,
    obtenerIniciales: utilidades.obtenerIniciales,
    sesionProximaAExpirar: utilidades.sesionProximaAExpirar,
    obtenerRutasPermitidas: utilidades.obtenerRutasPermitidas,
    esRutaPermitida: utilidades.esRutaPermitida,
    obtenerRutaDefault: utilidades.obtenerRutaDefault,

    // Utilidades del contexto
    obtenerToken,
    refrescarToken,

    // Información de debug (solo en desarrollo)
    infoDebug,
  };
};

export default useAuth;