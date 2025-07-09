/**
 * useAuth Hook - Hook Personalizado FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook para manejo de autenticación con validaciones y permisos
 */

import { useMemo } from 'react';
import { useAuth as useAuthContext } from '../context/AuthContext';
import { CodigoRol, Permiso } from '../types/auth';

/**
 * Hook personalizado para autenticación
 * Proporciona métodos y estado de autenticación optimizados
 */
export const useAuth = () => {
  // Usar el hook del contexto directamente
  const {
    usuario,
    estaAutenticado,
    estaCargando,
    error,
    iniciarSesion,
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
  } = useAuthContext();

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
            'validar_documentos'
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
        case 'facturacion':
          return ['administrador', 'contador', 'vendedor'].includes(rol);
        
        case 'inventario':
          return ['administrador', 'contador', 'vendedor'].includes(rol);
        
        case 'contabilidad':
          return ['administrador', 'contador'].includes(rol);
        
        case 'reportes':
          return ['administrador', 'contador'].includes(rol);
        
        case 'configuracion':
          return ['administrador'].includes(rol);
        
        case 'usuarios':
          return ['administrador'].includes(rol);
        
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

  // Información adicional del usuario
  const infoUsuario = useMemo(() => {
    if (!usuario) return null;

    return {
      id: usuario.id,
      email: usuario.email,
      nombreCompleto: usuario.nombre_completo,
      rolNombre: usuario.rol_detalle?.nombre || 'Sin rol',
      rolCodigo: usuario.rol_detalle?.codigo || '',
      estado: usuario.estado_usuario,
      estaActivo: usuario.estado_usuario === 'activo',
      fechaRegistro: usuario.fecha_creacion,
      ultimoLogin: usuario.ultimo_login,
      perfilCompleto: !!(usuario.nombre && usuario.apellidos),
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
    };
  }, [usuario]);

  // Utilidades adicionales
  const utilidades = useMemo(() => {
    /**
     * Obtener saludo personalizado
     */
    const obtenerSaludo = (): string => {
      if (!usuario) return 'Hola';
      
      const hora = new Date().getHours();
      const nombre = usuario.nombre || 'Usuario';
      
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
      if (!usuario?.nombre_completo) return 'U';
      
      const nombres = usuario.nombre_completo.split(' ');
      if (nombres.length >= 2) {
        return `${nombres[0][0]}${nombres[1][0]}`.toUpperCase();
      }
      return nombres[0][0].toUpperCase();
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
            '/productos'
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

    return {
      obtenerSaludo,
      obtenerIniciales,
      sesionProximaAExpirar,
      obtenerRutasPermitidas,
      esRutaPermitida,
    };
  }, [usuario]);

  // Retornar interfaz completa del hook
  return {
    // Estado básico
    usuario,
    estaAutenticado,
    estaCargando,
    error,

    // Funciones de autenticación
    iniciarSesion,
    cerrarSesion,
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

    // Utilidades del contexto
    obtenerToken,
    refrescarToken,
  };
};

export default useAuth;