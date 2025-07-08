/**
 * useAuth Hook - Hook Personalizado FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook para manejo de autenticación con validaciones y permisos
 */

import { useMemo } from 'react';
import { useAuth as useContextoAuth } from '../context/AuthContext';

import { CodigoRol, Permiso, ResultadoUseAuth } from '../types/auth';

/**
 * Hook personalizado para autenticación
 * Proporciona métodos y estado de autenticación optimizados
 */
export const useAuth = (): ResultadoUseAuth => {
  const {
    estado,
    iniciarSesion,
    cerrarSesion,
    registrarse,
    actualizarPerfil,
    cambiarPassword,
    limpiarError,
  } = useContextoAuth();

  // Memorizar funciones de validación de permisos para optimizar renders
  const funcionesPermisos = useMemo(() => {
    /**
     * Verificar si el usuario tiene un permiso específico
     */
    const tienePermiso = (permiso: Permiso): boolean => {
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
            'gestionar_inventario'
          ].includes(permiso);

        case 'vendedor':
          return [
            'crear_facturas',
            'ver_dashboard',
            'gestionar_inventario'
          ].includes(permiso);

        case 'cliente':
          return [
            'ver_dashboard'
          ].includes(permiso);

        default:
          return false;
      }
    };

    /**
     * Verificar si es administrador
     */
    const esAdministrador = (): boolean => {
      return estado.usuario?.rol_detalle?.codigo === 'administrador';
    };

    /**
     * Verificar si es contador
     */
    const esContador = (): boolean => {
      return estado.usuario?.rol_detalle?.codigo === 'contador';
    };

    /**
     * Verificar si es vendedor
     */
    const esVendedor = (): boolean => {
      return estado.usuario?.rol_detalle?.codigo === 'vendedor';
    };

    /**
     * Verificar si es cliente
     */
    const esCliente = (): boolean => {
      return estado.usuario?.rol_detalle?.codigo === 'cliente';
    };

    /**
     * Verificar si tiene rol de administración (admin o contador)
     */
    const esRolAdministrativo = (): boolean => {
      const codigo = estado.usuario?.rol_detalle?.codigo;
      return codigo === 'administrador' || codigo === 'contador';
    };

    /**
     * Verificar si puede acceder a un módulo específico
     */
    const puedeAccederModulo = (modulo: string): boolean => {
      if (!estado.usuario?.rol_detalle) return false;

      const modulosPermitidos: Record<CodigoRol, string[]> = {
        administrador: [
          'dashboard', 'usuarios', 'clientes', 'productos', 
          'facturacion', 'inventario', 'contabilidad', 'reportes', 'configuracion'
        ],
        contador: [
          'dashboard', 'clientes', 'productos', 'facturacion', 
          'inventario', 'contabilidad', 'reportes'
        ],
        vendedor: [
          'dashboard', 'clientes', 'productos', 'facturacion', 'inventario'
        ],
        cliente: [
          'dashboard', 'mis-comprobantes'
        ],
      };

      const rol = estado.usuario.rol_detalle.codigo;
      return modulosPermitidos[rol]?.includes(modulo) || false;
    };

    /**
     * Obtener nivel de acceso numérico
     */
    const obtenerNivelAcceso = (): number => {
      return estado.usuario?.rol_detalle?.nivel_acceso || 0;
    };

    /**
     * Verificar si puede gestionar otros usuarios
     */
    const puedeGestionarUsuarios = (): boolean => {
      return esAdministrador();
    };

    /**
     * Verificar si puede ver reportes avanzados
     */
    const puedeVerReportesAvanzados = (): boolean => {
      return esAdministrador() || esContador();
    };

    /**
     * Verificar si puede configurar el sistema
     */
    const puedeConfigurarSistema = (): boolean => {
      return esAdministrador();
    };

    return {
      tienePermiso,
      esAdministrador,
      esContador,
      esVendedor,
      esCliente,
      esRolAdministrativo,
      puedeAccederModulo,
      obtenerNivelAcceso,
      puedeGestionarUsuarios,
      puedeVerReportesAvanzados,
      puedeConfigurarSistema,
    };
  }, [estado.usuario]);

  // Memorizar información del usuario para optimizar renders
  const infoUsuario = useMemo(() => {
    if (!estado.usuario) return null;

    return {
      id: estado.usuario.id,
      email: estado.usuario.email,
      nombreCompleto: estado.usuario.nombre_completo,
      nombres: estado.usuario.nombres,
      apellidos: estado.usuario.apellidos,
      rol: estado.usuario.rol_detalle?.nombre || 'Sin rol',
      codigoRol: estado.usuario.rol_detalle?.codigo,
      avatar: estado.usuario.perfil?.avatar,
      temaOscuro: estado.usuario.perfil?.tema_oscuro || false,
      idioma: estado.usuario.perfil?.idioma || 'es',
      debecambiarPassword: estado.usuario.debe_cambiar_password,
      estadoUsuario: estado.usuario.estado_usuario,
      fechaUltimoLogin: estado.usuario.fecha_ultimo_login,
      tiempoSinLogin: estado.usuario.tiempo_sin_login,
    };
  }, [estado.usuario]);

  // Memorizar estadísticas de sesión
  const estadisticasSesion = useMemo(() => {
    return {
      intentosFallidos: estado.usuario?.intentos_login_fallidos || 0,
      puedeHacerLogin: estado.usuario?.puede_login || false,
      notificacionesEmail: estado.usuario?.notificaciones_email || false,
      notificacionesSistema: estado.usuario?.notificaciones_sistema || false,
    };
  }, [estado.usuario]);

  // Funciones de utilidad adicionales
  const utilidades = useMemo(() => {
    /**
     * Obtener saludo personalizado según la hora
     */
    const obtenerSaludo = (): string => {
      const hora = new Date().getHours();
      const nombre = estado.usuario?.nombres || 'Usuario';

      if (hora < 12) return `Buenos días, ${nombre}`;
      if (hora < 18) return `Buenas tardes, ${nombre}`;
      return `Buenas noches, ${nombre}`;
    };

    /**
     * Obtener iniciales del usuario para avatar
     */
    const obtenerIniciales = (): string => {
      if (!estado.usuario) return 'U';
      
      const nombres = estado.usuario.nombres || '';
      const apellidos = estado.usuario.apellidos || '';
      
      return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
    };

    /**
     * Verificar si la sesión está próxima a expirar
     */
    const sesionProximaAExpirar = (): boolean => {
      // Implementar lógica de verificación de expiración
      // Por ahora retornamos false
      return false;
    };

    /**
     * Obtener rutas permitidas para el usuario actual
     */
    const obtenerRutasPermitidas = (): string[] => {
      if (!estado.usuario?.rol_detalle) return ['/'];

      const rutasPorRol: Record<CodigoRol, string[]> = {
        administrador: [
          '/dashboard',
          '/usuarios',
          '/clientes', 
          '/productos',
          '/facturacion',
          '/inventario',
          '/contabilidad',
          '/reportes',
          '/configuracion',
        ],
        contador: [
          '/dashboard',
          '/clientes',
          '/productos', 
          '/facturacion',
          '/inventario',
          '/contabilidad',
          '/reportes',
        ],
        vendedor: [
          '/dashboard',
          '/pos',
          '/clientes',
          '/productos',
          '/facturacion',
          '/inventario',
        ],
        cliente: [
          '/dashboard',
          '/mis-comprobantes',
          '/perfil',
        ],
      };

      return rutasPorRol[estado.usuario.rol_detalle.codigo] || ['/'];
    };

    /**
     * Verificar si una ruta específica está permitida
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
  }, [estado.usuario]);

  // Retornar interfaz completa del hook
  return {
    // Estado básico
    usuario: estado.usuario,
    estaAutenticado: estado.estaAutenticado,
    estaCargando: estado.estaCargando,
    error: estado.error,

    // Funciones de autenticación
    iniciarSesion,
    cerrarSesion,
    registrarse,
    actualizarPerfil,
    cambiarPassword,
    limpiarError,

    // Funciones de permisos
    tienePermiso: funcionesPermisos.tienePermiso,
    esAdministrador: funcionesPermisos.esAdministrador,
    esContador: funcionesPermisos.esContador,
    esVendedor: funcionesPermisos.esVendedor,
    esCliente: funcionesPermisos.esCliente,

    // Funciones adicionales
    esRolAdministrativo: funcionesPermisos.esRolAdministrativo,
    puedeAccederModulo: funcionesPermisos.puedeAccederModulo,
    obtenerNivelAcceso: funcionesPermisos.obtenerNivelAcceso,
    puedeGestionarUsuarios: funcionesPermisos.puedeGestionarUsuarios,
    puedeVerReportesAvanzados: funcionesPermisos.puedeVerReportesAvanzados,
    puedeConfigurarSistema: funcionesPermisos.puedeConfigurarSistema,

    // Información del usuario
    infoUsuario,
    estadisticasSesion,

    // Utilidades
    obtenerSaludo: utilidades.obtenerSaludo,
    obtenerIniciales: utilidades.obtenerIniciales,
    sesionProximaAExpirar: utilidades.sesionProximaAExpirar,
    obtenerRutasPermitidas: utilidades.obtenerRutasPermitidas,
    esRutaPermitida: utilidades.esRutaPermitida,

    // Estados de carga específicos
    estaLoginCargando: estado.estaLoginCargando,
    estaRegistroCargando: estado.estaRegistroCargando,
  };
};

export default useAuth;