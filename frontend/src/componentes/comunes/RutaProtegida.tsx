/**
 * RutaProtegida - Componente de Protección de Rutas FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * HOC para proteger rutas según autenticación y permisos
 */

import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CodigoRol, Permiso } from '../../types/auth';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';

interface PropiedadesRutaProtegida {
  children: ReactNode;
  requiereAuth?: boolean;
  rolesPermitidos?: CodigoRol[];
  permisosRequeridos?: Permiso[];
  redirigirSiNoAuth?: string;
  redirigirSiNoPermiso?: string;
  mostrarCargando?: boolean;
  mostrarError?: boolean;
}

interface PropiedadesComponenteCarga {
  mensaje?: string;
}

interface PropiedadesComponenteError {
  titulo?: string;
  mensaje?: string;
  mostrarBotonVolver?: boolean;
}

/**
 * Componente de carga para rutas protegidas
 */
const ComponenteCarga: React.FC<PropiedadesComponenteCarga> = ({ 
  mensaje = 'Verificando acceso...' 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">{mensaje}</p>
    </div>
  </div>
);

/**
 * Componente de error para acceso denegado
 */
const ComponenteAccesoDenegado: React.FC<PropiedadesComponenteError> = ({
  titulo = 'Acceso Denegado',
  mensaje = 'No tienes permisos para acceder a esta página',
  mostrarBotonVolver = true,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <Shield className="h-8 w-8 text-red-600" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{titulo}</h1>
      <p className="text-gray-600 mb-6">{mensaje}</p>
      
      {mostrarBotonVolver && (
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver Atrás
        </button>
      )}
    </div>
  </div>
);

/**
 * Componente principal de ruta protegida
 */
const RutaProtegida: React.FC<PropiedadesRutaProtegida> = ({
  children,
  requiereAuth = true,
  rolesPermitidos = [],
  permisosRequeridos = [],
  redirigirSiNoAuth = '/login',
  redirigirSiNoPermiso = '/acceso-denegado',
  mostrarCargando = true,
  mostrarError = true,
}) => {
  const location = useLocation();
  const {
    estaAutenticado,
    estaCargando,
    usuario,
    esAdministrador,
    tienePermiso,
    esRutaPermitida,
  } = useAuth();

  useEffect(() => {
    // Log para debugging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('RutaProtegida - Estado:', {
        ruta: location.pathname,
        estaAutenticado,
        estaCargando,
        usuario: usuario?.email,
        rol: usuario?.rol_detalle?.codigo,
        requiereAuth,
        rolesPermitidos,
        permisosRequeridos,
      });
    }
  }, [location.pathname, estaAutenticado, estaCargando, usuario, requiereAuth]);

  // Mostrar loading mientras se verifica autenticación
  if (estaCargando && mostrarCargando) {
    return <ComponenteCarga mensaje="Verificando autenticación..." />;
  }

  // Verificar si requiere autenticación
  if (requiereAuth && !estaAutenticado) {
    return (
      <Navigate 
        to={redirigirSiNoAuth} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Si no requiere auth y no está autenticado, permitir acceso
  if (!requiereAuth && !estaAutenticado) {
    return <>{children}</>;
  }

  // Verificar si el usuario está autenticado para las siguientes validaciones
  if (!usuario) {
    if (mostrarError) {
      return (
        <ComponenteAccesoDenegado
          titulo="Error de Autenticación"
          mensaje="No se pudo verificar tu identidad. Por favor, inicia sesión nuevamente."
        />
      );
    }
    return <Navigate to={redirigirSiNoAuth} state={{ from: location }} replace />;
  }

  // Verificar estado del usuario
  if (usuario.estado_usuario !== 'activo') {
    const mensajesEstado = {
      bloqueado: 'Tu cuenta ha sido bloqueada. Contacta al administrador.',
      suspendido: 'Tu cuenta está suspendida temporalmente.',
      inactivo: 'Tu cuenta está inactiva. Contacta al administrador.',
    };

    const mensaje = mensajesEstado[usuario.estado_usuario as keyof typeof mensajesEstado] || 
                   'Tu cuenta no está activa.';

    if (mostrarError) {
      return (
        <ComponenteAccesoDenegado
          titulo="Cuenta No Disponible"
          mensaje={mensaje}
          mostrarBotonVolver={false}
        />
      );
    }
    return <Navigate to="/cuenta-suspendida" replace />;
  }

  // El administrador tiene acceso a todo
  if (esAdministrador()) {
    return <>{children}</>;
  }

  // Verificar roles permitidos
  if (rolesPermitidos.length > 0) {
    const rolUsuario = usuario.rol_detalle?.codigo;
    
    if (!rolUsuario || !rolesPermitidos.includes(rolUsuario)) {
      if (mostrarError) {
        return (
          <ComponenteAccesoDenegado
            titulo="Acceso Restringido"
            mensaje={`Esta página requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`}
          />
        );
      }
      return <Navigate to={redirigirSiNoPermiso} replace />;
    }
  }

  // Verificar permisos específicos
  if (permisosRequeridos.length > 0) {
    const tienePermisosRequeridos = permisosRequeridos.every(permiso => 
      tienePermiso(permiso)
    );

    if (!tienePermisosRequeridos) {
      if (mostrarError) {
        return (
          <ComponenteAccesoDenegado
            titulo="Permisos Insuficientes"
            mensaje="No tienes los permisos necesarios para acceder a esta funcionalidad."
          />
        );
      }
      return <Navigate to={redirigirSiNoPermiso} replace />;
    }
  }

  // Verificar si la ruta específica está permitida para el rol
  if (!esRutaPermitida(location.pathname)) {
    if (mostrarError) {
      return (
        <ComponenteAccesoDenegado
          titulo="Ruta No Permitida"
          mensaje="No tienes acceso a esta sección del sistema."
        />
      );
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar si debe cambiar contraseña
  if (usuario.debe_cambiar_password && location.pathname !== '/cambiar-password') {
    return <Navigate to="/cambiar-password" state={{ from: location }} replace />;
  }

  // Todo OK, renderizar children
  return <>{children}</>;
};

/**
 * HOC para crear rutas protegidas fácilmente
 */
export const conRutaProtegida = (
  Component: React.ComponentType<any>,
  opciones: Omit<PropiedadesRutaProtegida, 'children'> = {}
) => {
  return (props: any) => (
    <RutaProtegida {...opciones}>
      <Component {...props} />
    </RutaProtegida>
  );
};

/**
 * Componente específico para rutas de administrador
 */
export const RutaAdministrador: React.FC<{ children: ReactNode }> = ({ children }) => (
  <RutaProtegida rolesPermitidos={['administrador']}>
    {children}
  </RutaProtegida>
);

/**
 * Componente para rutas de administración (admin + contador)
 */
export const RutaAdministrativa: React.FC<{ children: ReactNode }> = ({ children }) => (
  <RutaProtegida rolesPermitidos={['administrador', 'contador']}>
    {children}
  </RutaProtegida>
);

/**
 * Componente para rutas de vendedor
 */
export const RutaVendedor: React.FC<{ children: ReactNode }> = ({ children }) => (
  <RutaProtegida rolesPermitidos={['administrador', 'contador', 'vendedor']}>
    {children}
  </RutaProtegida>
);

/**
 * Componente para rutas públicas (no requiere auth)
 */
export const RutaPublica: React.FC<{ children: ReactNode }> = ({ children }) => (
  <RutaProtegida requiereAuth={false}>
    {children}
  </RutaProtegida>
);

/**
 * Componente para redirigir usuarios autenticados (ej: login cuando ya está logueado)
 */
export const RutaParaNoAutenticados: React.FC<{ 
  children: ReactNode; 
  redirigirA?: string; 
}> = ({ 
  children, 
  redirigirA = '/dashboard' 
}) => {
  const { estaAutenticado, estaCargando } = useAuth();

  if (estaCargando) {
    return <ComponenteCarga mensaje="Verificando estado de sesión..." />;
  }

  if (estaAutenticado) {
    return <Navigate to={redirigirA} replace />;
  }

  return <>{children}</>;
};

/**
 * Hook para verificar permisos en componentes
 */
export const useVerificarPermisos = (
  rolesPermitidos: CodigoRol[] = [],
  permisosRequeridos: Permiso[] = []
) => {
  const { usuario, esAdministrador, tienePermiso } = useAuth();

  const tieneAcceso = React.useMemo(() => {
    if (!usuario) return false;
    if (esAdministrador()) return true;

    // Verificar roles
    if (rolesPermitidos.length > 0) {
      const rolUsuario = usuario.rol_detalle?.codigo;
      if (!rolUsuario || !rolesPermitidos.includes(rolUsuario)) {
        return false;
      }
    }

    // Verificar permisos
    if (permisosRequeridos.length > 0) {
      return permisosRequeridos.every(permiso => tienePermiso(permiso));
    }

    return true;
  }, [usuario, rolesPermitidos, permisosRequeridos, esAdministrador, tienePermiso]);

  return {
    tieneAcceso,
    usuario,
    rolUsuario: usuario?.rol_detalle?.codigo,
  };
};

export default RutaProtegida;