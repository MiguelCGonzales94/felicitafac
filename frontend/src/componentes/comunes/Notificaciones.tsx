/**
 * Sistema de Notificaciones - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Toast notifications con diferentes tipos y funcionalidades
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/button';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export type TipoNotificacion = 'exito' | 'error' | 'advertencia' | 'info';
export type PosicionNotificacion = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje?: string;
  duracion?: number;
  persistente?: boolean;
  accionable?: boolean;
  accion?: {
    label: string;
    callback: () => void;
  };
  onClose?: () => void;
  timestamp: Date;
}

export interface OpcionesNotificacion {
  tipo?: TipoNotificacion;
  duracion?: number;
  persistente?: boolean;
  accionable?: boolean;
  accion?: {
    label: string;
    callback: () => void;
  };
  onClose?: () => void;
}

export interface ConfiguracionNotificaciones {
  posicion: PosicionNotificacion;
  maxNotificaciones: number;
  duracionDefecto: number;
  animacionEntrada: boolean;
  animacionSalida: boolean;
  sonidoHabilitado: boolean;
}

// =======================================================
// CONFIGURACIÓN POR DEFECTO
// =======================================================

const CONFIGURACION_DEFECTO: ConfiguracionNotificaciones = {
  posicion: 'top-right',
  maxNotificaciones: 5,
  duracionDefecto: 5000,
  animacionEntrada: true,
  animacionSalida: true,
  sonidoHabilitado: false
};

const ICONOS_TIPO: Record<TipoNotificacion, React.ReactNode> = {
  exito: <CheckCircle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  advertencia: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />
};

const COLORES_TIPO = {
  exito: {
    fondo: 'bg-green-50 border-green-200',
    icono: 'text-green-600',
    titulo: 'text-green-900',
    mensaje: 'text-green-800',
    boton: 'text-green-600 hover:text-green-800'
  },
  error: {
    fondo: 'bg-red-50 border-red-200',
    icono: 'text-red-600',
    titulo: 'text-red-900',
    mensaje: 'text-red-800',
    boton: 'text-red-600 hover:text-red-800'
  },
  advertencia: {
    fondo: 'bg-yellow-50 border-yellow-200',
    icono: 'text-yellow-600',
    titulo: 'text-yellow-900',
    mensaje: 'text-yellow-800',
    boton: 'text-yellow-600 hover:text-yellow-800'
  },
  info: {
    fondo: 'bg-blue-50 border-blue-200',
    icono: 'text-blue-600',
    titulo: 'text-blue-900',
    mensaje: 'text-blue-800',
    boton: 'text-blue-600 hover:text-blue-800'
  }
};

// =======================================================
// CONTEXT
// =======================================================

interface ContextoNotificaciones {
  notificaciones: Notificacion[];
  configuracion: ConfiguracionNotificaciones;
  mostrarNotificacion: (titulo: string, mensaje?: string, opciones?: OpcionesNotificacion) => string;
  mostrarExito: (titulo: string, mensaje?: string, opciones?: Omit<OpcionesNotificacion, 'tipo'>) => string;
  mostrarError: (titulo: string, mensaje?: string, opciones?: Omit<OpcionesNotificacion, 'tipo'>) => string;
  mostrarAdvertencia: (titulo: string, mensaje?: string, opciones?: Omit<OpcionesNotificacion, 'tipo'>) => string;
  mostrarInfo: (titulo: string, mensaje?: string, opciones?: Omit<OpcionesNotificacion, 'tipo'>) => string;
  cerrarNotificacion: (id: string) => void;
  cerrarTodasNotificaciones: () => void;
  actualizarConfiguracion: (nuevaConfiguracion: Partial<ConfiguracionNotificaciones>) => void;
}

const ContextoNotificaciones = createContext<ContextoNotificaciones | undefined>(undefined);

// =======================================================
// HOOK PERSONALIZADO
// =======================================================

export const useNotificaciones = () => {
  const contexto = useContext(ContextoNotificaciones);
  if (!contexto) {
    throw new Error('useNotificaciones debe ser usado dentro de NotificacionesProvider');
  }
  return contexto;
};

// =======================================================
// COMPONENTE DE NOTIFICACIÓN INDIVIDUAL
// =======================================================

const ComponenteNotificacion: React.FC<{
  notificacion: Notificacion;
  onClose: (id: string) => void;
  animaciones: boolean;
}> = ({ notificacion, onClose, animaciones }) => {
  const [saliendo, setSaliendo] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const colores = COLORES_TIPO[notificacion.tipo];

  const manejarCerrar = useCallback(() => {
    if (animaciones) {
      setSaliendo(true);
      setTimeout(() => {
        onClose(notificacion.id);
        notificacion.onClose?.();
      }, 300);
    } else {
      onClose(notificacion.id);
      notificacion.onClose?.();
    }
  }, [notificacion.id, notificacion.onClose, onClose, animaciones]);

  useEffect(() => {
    if (!notificacion.persistente && notificacion.duracion && notificacion.duracion > 0) {
      timeoutRef.current = setTimeout(manejarCerrar, notificacion.duracion);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [notificacion.duracion, notificacion.persistente, manejarCerrar]);

  return (
    <div
      className={cn(
        "relative flex items-start p-4 border rounded-lg shadow-lg max-w-sm w-full",
        "transform transition-all duration-300 ease-in-out",
        colores.fondo,
        animaciones && !saliendo && "animate-in slide-in-from-right-full",
        animaciones && saliendo && "animate-out slide-out-to-right-full opacity-0"
      )}
    >
      {/* Icono */}
      <div className={cn("flex-shrink-0 mr-3", colores.icono)}>
        {ICONOS_TIPO[notificacion.tipo]}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <h4 className={cn("text-sm font-semibold", colores.titulo)}>
          {notificacion.titulo}
        </h4>
        
        {notificacion.mensaje && (
          <p className={cn("mt-1 text-sm", colores.mensaje)}>
            {notificacion.mensaje}
          </p>
        )}

        {/* Acción opcional */}
        {notificacion.accionable && notificacion.accion && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2 text-xs", colores.boton)}
              onClick={notificacion.accion.callback}
            >
              {notificacion.accion.label}
            </Button>
          </div>
        )}
      </div>

      {/* Botón cerrar */}
      <button
        onClick={manejarCerrar}
        className={cn(
          "flex-shrink-0 ml-2 p-1 rounded-md transition-colors",
          "hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2",
          colores.boton
        )}
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Barra de progreso para temporizador */}
      {!notificacion.persistente && notificacion.duracion && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-current opacity-30 transition-all linear"
            style={{ 
              animation: `progress ${notificacion.duracion}ms linear forwards` 
            }}
          />
        </div>
      )}
    </div>
  );
};

// =======================================================
// CONTENEDOR DE NOTIFICACIONES
// =======================================================

const ContenedorNotificaciones: React.FC<{
  notificaciones: Notificacion[];
  configuracion: ConfiguracionNotificaciones;
  onClose: (id: string) => void;
}> = ({ notificaciones, configuracion, onClose }) => {
  const obtenerClasesPosicion = () => {
    const baseClases = "fixed z-50 flex flex-col gap-2 pointer-events-none";
    
    switch (configuracion.posicion) {
      case 'top-right':
        return `${baseClases} top-4 right-4`;
      case 'top-left':
        return `${baseClases} top-4 left-4`;
      case 'bottom-right':
        return `${baseClases} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClases} bottom-4 left-4`;
      case 'top-center':
        return `${baseClases} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-center':
        return `${baseClases} bottom-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseClases} top-4 right-4`;
    }
  };

  if (notificaciones.length === 0) return null;

  return createPortal(
    <div className={obtenerClasesPosicion()}>
      {notificaciones.map(notificacion => (
        <div key={notificacion.id} className="pointer-events-auto">
          <ComponenteNotificacion
            notificacion={notificacion}
            onClose={onClose}
            animaciones={configuracion.animacionSalida}
          />
        </div>
      ))}
    </div>,
    document.body
  );
};

// =======================================================
// PROVIDER
// =======================================================

export const NotificacionesProvider: React.FC<{
  children: React.ReactNode;
  configuracionInicial?: Partial<ConfiguracionNotificaciones>;
}> = ({ children, configuracionInicial }) => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionNotificaciones>({
    ...CONFIGURACION_DEFECTO,
    ...configuracionInicial
  });

  const generarId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const mostrarNotificacion = useCallback((
    titulo: string,
    mensaje?: string,
    opciones: OpcionesNotificacion = {}
  ): string => {
    const id = generarId();
    const nuevaNotificacion: Notificacion = {
      id,
      tipo: opciones.tipo || 'info',
      titulo,
      mensaje,
      duracion: opciones.duracion ?? configuracion.duracionDefecto,
      persistente: opciones.persistente || false,
      accionable: opciones.accionable || false,
      accion: opciones.accion,
      onClose: opciones.onClose,
      timestamp: new Date()
    };

    setNotificaciones(prev => {
      const nuevasNotificaciones = [nuevaNotificacion, ...prev];
      return nuevasNotificaciones.slice(0, configuracion.maxNotificaciones);
    });

    return id;
  }, [configuracion.duracionDefecto, configuracion.maxNotificaciones]);

  const mostrarExito = useCallback((titulo: string, mensaje?: string, opciones: Omit<OpcionesNotificacion, 'tipo'> = {}) => {
    return mostrarNotificacion(titulo, mensaje, { ...opciones, tipo: 'exito' });
  }, [mostrarNotificacion]);

  const mostrarError = useCallback((titulo: string, mensaje?: string, opciones: Omit<OpcionesNotificacion, 'tipo'> = {}) => {
    return mostrarNotificacion(titulo, mensaje, { ...opciones, tipo: 'error' });
  }, [mostrarNotificacion]);

  const mostrarAdvertencia = useCallback((titulo: string, mensaje?: string, opciones: Omit<OpcionesNotificacion, 'tipo'> = {}) => {
    return mostrarNotificacion(titulo, mensaje, { ...opciones, tipo: 'advertencia' });
  }, [mostrarNotificacion]);

  const mostrarInfo = useCallback((titulo: string, mensaje?: string, opciones: Omit<OpcionesNotificacion, 'tipo'> = {}) => {
    return mostrarNotificacion(titulo, mensaje, { ...opciones, tipo: 'info' });
  }, [mostrarNotificacion]);

  const cerrarNotificacion = useCallback((id: string) => {
    setNotificaciones(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const cerrarTodasNotificaciones = useCallback(() => {
    setNotificaciones([]);
  }, []);

  const actualizarConfiguracion = useCallback((nuevaConfiguracion: Partial<ConfiguracionNotificaciones>) => {
    setConfiguracion(prev => ({ ...prev, ...nuevaConfiguracion }));
  }, []);

  const valor: ContextoNotificaciones = {
    notificaciones,
    configuracion,
    mostrarNotificacion,
    mostrarExito,
    mostrarError,
    mostrarAdvertencia,
    mostrarInfo,
    cerrarNotificacion,
    cerrarTodasNotificaciones,
    actualizarConfiguracion
  };

  return (
    <ContextoNotificaciones.Provider value={valor}>
      {children}
      <ContenedorNotificaciones
        notificaciones={notificaciones}
        configuracion={configuracion}
        onClose={cerrarNotificacion}
      />
      
      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ContextoNotificaciones.Provider>
  );
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default NotificacionesProvider;