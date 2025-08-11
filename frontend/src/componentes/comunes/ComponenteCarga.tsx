/**
 * Componente de Carga - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Estados de carga globales y específicos
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader, CheckCircle, AlertCircle, X, FileText, Users, Package, Calculator } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export type TipoCarga = 
  | 'pagina' 
  | 'modal' 
  | 'overlay' 
  | 'inline' 
  | 'skeleton'
  | 'determinate'
  | 'indeterminate';

export type EstadoCarga = 
  | 'cargando' 
  | 'completado' 
  | 'error' 
  | 'cancelado';

export interface ConfiguracionCarga {
  id: string;
  tipo: TipoCarga;
  titulo?: string;
  mensaje?: string;
  progreso?: number;
  indeterminado?: boolean;
  cancelable?: boolean;
  duracionMinima?: number;
  onCancelar?: () => void;
  icono?: React.ReactNode;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  posicion?: 'center' | 'top' | 'bottom';
  transparente?: boolean;
  mostrarProgreso?: boolean;
  etapas?: EtapaCarga[];
  etapaActual?: number;
}

export interface EtapaCarga {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: React.ReactNode;
  duracionEstimada?: number;
}

export interface EstadoGlobalCarga {
  cargas: Record<string, ConfiguracionCarga & { estado: EstadoCarga; timestampInicio: number }>;
  cargaGeneral: boolean;
}

// =======================================================
// CONFIGURACIONES PREDEFINIDAS
// =======================================================

const ETAPAS_FACTURACION: EtapaCarga[] = [
  {
    id: 'validacion',
    nombre: 'Validando datos',
    descripcion: 'Verificando información de la factura',
    icono: <CheckCircle className="h-4 w-4" />
  },
  {
    id: 'calculo',
    nombre: 'Calculando totales',
    descripcion: 'Procesando impuestos y descuentos',
    icono: <Calculator className="h-4 w-4" />
  },
  {
    id: 'generacion',
    nombre: 'Generando documento',
    descripcion: 'Creando archivo XML para SUNAT',
    icono: <FileText className="h-4 w-4" />
  },
  {
    id: 'envio',
    nombre: 'Enviando a SUNAT',
    descripcion: 'Transmitiendo documento electrónico',
    icono: <Users className="h-4 w-4" />
  },
  {
    id: 'confirmacion',
    nombre: 'Confirmando recepción',
    descripcion: 'Esperando respuesta de SUNAT',
    icono: <CheckCircle className="h-4 w-4" />
  }
];

const ICONOS_CONTEXTO: Record<string, React.ReactNode> = {
  factura: <FileText className="h-5 w-5" />,
  cliente: <Users className="h-5 w-5" />,
  producto: <Package className="h-5 w-5" />,
  reporte: <Calculator className="h-5 w-5" />,
  default: <Loader className="h-5 w-5 animate-spin" />
};

const COLORES_ESTADO = {
  default: 'text-blue-600',
  primary: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600'
};

// =======================================================
// CONTEXT
// =======================================================

interface ContextoCarga {
  estado: EstadoGlobalCarga;
  mostrarCarga: (config: Partial<ConfiguracionCarga>) => string;
  actualizarCarga: (id: string, actualizacion: Partial<ConfiguracionCarga>) => void;
  completarCarga: (id: string, exito?: boolean) => void;
  cancelarCarga: (id: string) => void;
  ocultarCarga: (id: string) => void;
  limpiarCargas: () => void;
  obtenerCarga: (id: string) => (ConfiguracionCarga & { estado: EstadoCarga }) | null;
}

const ContextoCarga = createContext<ContextoCarga | undefined>(undefined);

// =======================================================
// HOOK PERSONALIZADO
// =======================================================

export const useCarga = () => {
  const contexto = useContext(ContextoCarga);
  if (!contexto) {
    throw new Error('useCarga debe ser usado dentro de CargaProvider');
  }
  return contexto;
};

// =======================================================
// COMPONENTES DE CARGA ESPECÍFICOS
// =======================================================

const CargaPagina: React.FC<{ config: ConfiguracionCarga }> = ({ config }) => (
  <div className={cn(
    "fixed inset-0 z-50 flex items-center justify-center",
    config.transparente ? "bg-white/70" : "bg-white",
    "backdrop-blur-sm"
  )}>
    <Card className="w-full max-w-md mx-4 shadow-lg">
      <CardContent className="p-6 text-center space-y-4">
        <div className={cn("flex justify-center", COLORES_ESTADO[config.color || 'default'])}>
          {config.icono || ICONOS_CONTEXTO.default}
        </div>
        
        {config.titulo && (
          <h3 className="text-lg font-semibold text-gray-900">
            {config.titulo}
          </h3>
        )}
        
        {config.mensaje && (
          <p className="text-sm text-gray-600">
            {config.mensaje}
          </p>
        )}
        
        {config.mostrarProgreso && config.progreso !== undefined && (
          <div className="space-y-2">
            <Progress value={config.progreso} className="w-full" />
            <span className="text-xs text-gray-500">{config.progreso}%</span>
          </div>
        )}
        
        {config.etapas && config.etapaActual !== undefined && (
          <div className="space-y-2">
            {config.etapas.map((etapa, index) => (
              <div 
                key={etapa.id}
                className={cn(
                  "flex items-center space-x-3 p-2 rounded",
                  index === config.etapaActual ? "bg-blue-50 text-blue-700" : "text-gray-500",
                  index < (config.etapaActual || 0) && "text-green-600"
                )}
              >
                <div className="flex-shrink-0">
                  {index < (config.etapaActual || 0) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : index === config.etapaActual ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    etapa.icono || <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{etapa.nombre}</div>
                  {etapa.descripcion && (
                    <div className="text-xs opacity-75">{etapa.descripcion}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {config.cancelable && config.onCancelar && (
          <Button
            variant="outline"
            onClick={config.onCancelar}
            className="mt-4"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        )}
      </CardContent>
    </Card>
  </div>
);

const CargaModal: React.FC<{ config: ConfiguracionCarga; onCerrar: () => void }> = ({ config, onCerrar }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <Card className="w-full max-w-sm mx-4 shadow-xl">
      <CardContent className="p-6 text-center space-y-4">
        <div className="flex justify-between items-start">
          <div className={cn("flex-shrink-0", COLORES_ESTADO[config.color || 'default'])}>
            {config.icono || ICONOS_CONTEXTO.default}
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {config.titulo && (
          <h3 className="text-base font-semibold text-gray-900">
            {config.titulo}
          </h3>
        )}
        
        {config.mensaje && (
          <p className="text-sm text-gray-600">
            {config.mensaje}
          </p>
        )}
        
        {config.mostrarProgreso && config.progreso !== undefined && (
          <div className="space-y-2">
            <Progress value={config.progreso} className="w-full" />
            <span className="text-xs text-gray-500">{config.progreso}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

const CargaOverlay: React.FC<{ config: ConfiguracionCarga }> = ({ config }) => (
  <div className={cn(
    "absolute inset-0 z-10 flex items-center justify-center",
    config.transparente ? "bg-white/80" : "bg-white/95",
    "backdrop-blur-sm"
  )}>
    <div className="text-center space-y-3">
      <div className={cn("flex justify-center", COLORES_ESTADO[config.color || 'default'])}>
        {config.icono || ICONOS_CONTEXTO.default}
      </div>
      
      {config.titulo && (
        <h4 className="text-sm font-medium text-gray-900">
          {config.titulo}
        </h4>
      )}
      
      {config.mensaje && (
        <p className="text-xs text-gray-600">
          {config.mensaje}
        </p>
      )}
      
      {config.mostrarProgreso && config.progreso !== undefined && (
        <div className="w-32 mx-auto space-y-1">
          <Progress value={config.progreso} className="w-full h-1" />
          <span className="text-xs text-gray-500">{config.progreso}%</span>
        </div>
      )}
    </div>
  </div>
);

const CargaInline: React.FC<{ config: ConfiguracionCarga }> = ({ config }) => (
  <div className="flex items-center space-x-3 p-2">
    <div className={cn("flex-shrink-0", COLORES_ESTADO[config.color || 'default'])}>
      {config.icono || <Loader className="h-4 w-4 animate-spin" />}
    </div>
    
    <div className="flex-1 min-w-0">
      {config.titulo && (
        <div className="text-sm font-medium text-gray-900 truncate">
          {config.titulo}
        </div>
      )}
      
      {config.mensaje && (
        <div className="text-xs text-gray-600 truncate">
          {config.mensaje}
        </div>
      )}
      
      {config.mostrarProgreso && config.progreso !== undefined && (
        <div className="mt-1 space-y-1">
          <Progress value={config.progreso} className="w-full h-1" />
          <span className="text-xs text-gray-500">{config.progreso}%</span>
        </div>
      )}
    </div>
    
    {config.cancelable && config.onCancelar && (
      <button
        onClick={config.onCancelar}
        className="text-gray-400 hover:text-gray-600 p-1"
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </div>
);

const CargaSkeleton: React.FC<{ config: ConfiguracionCarga }> = ({ config }) => (
  <div className="space-y-3 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="h-8 w-8 bg-gray-200 rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

// =======================================================
// RENDERIZADOR DE CARGAS
// =======================================================

const RenderizadorCargas: React.FC<{
  cargas: Record<string, ConfiguracionCarga & { estado: EstadoCarga; timestampInicio: number }>;
  onOcultar: (id: string) => void;
}> = ({ cargas, onOcultar }) => {
  const cargasArray = Object.entries(cargas);
  
  if (cargasArray.length === 0) return null;

  return (
    <>
      {cargasArray.map(([id, carga]) => {
        if (carga.estado !== 'cargando') return null;

        const props = {
          key: id,
          config: carga
        };

        switch (carga.tipo) {
          case 'pagina':
            return createPortal(<CargaPagina {...props} />, document.body);
          
          case 'modal':
            return createPortal(
              <CargaModal {...props} onCerrar={() => onOcultar(id)} />, 
              document.body
            );
          
          case 'overlay':
            return <CargaOverlay {...props} />;
          
          case 'inline':
            return <CargaInline {...props} />;
          
          case 'skeleton':
            return <CargaSkeleton {...props} />;
          
          default:
            return <CargaInline {...props} />;
        }
      })}
    </>
  );
};

// =======================================================
// PROVIDER
// =======================================================

export const CargaProvider: React.FC<{
  children: React.ReactNode;
  duracionMinimaDefecto?: number;
}> = ({ children, duracionMinimaDefecto = 500 }) => {
  const [estado, setEstado] = useState<EstadoGlobalCarga>({
    cargas: {},
    cargaGeneral: false
  });

  const generarId = useCallback(() => `carga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);

  const mostrarCarga = useCallback((config: Partial<ConfiguracionCarga>): string => {
    const id = config.id || generarId();
    const configCompleta: ConfiguracionCarga = {
      tipo: 'inline',
      indeterminado: true,
      cancelable: false,
      duracionMinima: duracionMinimaDefecto,
      color: 'default',
      mostrarProgreso: false,
      ...config,
      id
    };

    setEstado(prev => ({
      ...prev,
      cargas: {
        ...prev.cargas,
        [id]: {
          ...configCompleta,
          estado: 'cargando',
          timestampInicio: Date.now()
        }
      },
      cargaGeneral: true
    }));

    return id;
  }, [generarId, duracionMinimaDefecto]);

  const actualizarCarga = useCallback((id: string, actualizacion: Partial<ConfiguracionCarga>) => {
    setEstado(prev => {
      const cargaExistente = prev.cargas[id];
      if (!cargaExistente) return prev;

      return {
        ...prev,
        cargas: {
          ...prev.cargas,
          [id]: {
            ...cargaExistente,
            ...actualizacion
          }
        }
      };
    });
  }, []);

  const completarCarga = useCallback((id: string, exito: boolean = true) => {
    setEstado(prev => {
      const cargaExistente = prev.cargas[id];
      if (!cargaExistente) return prev;

      const tiempoTranscurrido = Date.now() - cargaExistente.timestampInicio;
      const esperarTiempo = Math.max(0, (cargaExistente.duracionMinima || 0) - tiempoTranscurrido);

      setTimeout(() => {
        setEstado(prevInner => {
          const { [id]: cargaEliminada, ...restanteCargas } = prevInner.cargas;
          return {
            ...prevInner,
            cargas: restanteCargas,
            cargaGeneral: Object.keys(restanteCargas).length > 0
          };
        });
      }, esperarTiempo);

      return {
        ...prev,
        cargas: {
          ...prev.cargas,
          [id]: {
            ...cargaExistente,
            estado: exito ? 'completado' : 'error'
          }
        }
      };
    });
  }, []);

  const cancelarCarga = useCallback((id: string) => {
    setEstado(prev => {
      const cargaExistente = prev.cargas[id];
      if (!cargaExistente) return prev;

      if (cargaExistente.onCancelar) {
        cargaExistente.onCancelar();
      }

      const { [id]: cargaEliminada, ...restanteCargas } = prev.cargas;
      
      return {
        ...prev,
        cargas: restanteCargas,
        cargaGeneral: Object.keys(restanteCargas).length > 0
      };
    });
  }, []);

  const ocultarCarga = useCallback((id: string) => {
    setEstado(prev => {
      const { [id]: cargaEliminada, ...restanteCargas } = prev.cargas;
      
      return {
        ...prev,
        cargas: restanteCargas,
        cargaGeneral: Object.keys(restanteCargas).length > 0
      };
    });
  }, []);

  const limpiarCargas = useCallback(() => {
    setEstado({
      cargas: {},
      cargaGeneral: false
    });
  }, []);

  const obtenerCarga = useCallback((id: string) => {
    return estado.cargas[id] || null;
  }, [estado.cargas]);

  const valor: ContextoCarga = {
    estado,
    mostrarCarga,
    actualizarCarga,
    completarCarga,
    cancelarCarga,
    ocultarCarga,
    limpiarCargas,
    obtenerCarga
  };

  return (
    <ContextoCarga.Provider value={valor}>
      {children}
      <RenderizadorCargas
        cargas={estado.cargas}
        onOcultar={ocultarCarga}
      />
    </ContextoCarga.Provider>
  );
};

// =======================================================
// HOOKS AUXILIARES
// =======================================================

export const useCargaFacturacion = () => {
  const { mostrarCarga, actualizarCarga, completarCarga } = useCarga();

  const iniciarFacturacion = useCallback(() => {
    return mostrarCarga({
      tipo: 'pagina',
      titulo: 'Procesando Factura',
      mensaje: 'Generando documento electrónico...',
      etapas: ETAPAS_FACTURACION,
      etapaActual: 0,
      cancelable: false,
      color: 'primary'
    });
  }, [mostrarCarga]);

  const siguienteEtapa = useCallback((id: string, etapa: number) => {
    actualizarCarga(id, { etapaActual: etapa });
  }, [actualizarCarga]);

  const finalizar = useCallback((id: string, exito: boolean = true) => {
    if (exito) {
      actualizarCarga(id, {
        titulo: 'Factura Generada',
        mensaje: 'Documento enviado exitosamente a SUNAT',
        color: 'success',
        etapaActual: ETAPAS_FACTURACION.length - 1
      });
    }
    
    setTimeout(() => completarCarga(id, exito), 1500);
  }, [actualizarCarga, completarCarga]);

  return { iniciarFacturacion, siguienteEtapa, finalizar };
};

// =======================================================
// COMPONENTES AUXILIARES
// =======================================================

export const CargaCondicional: React.FC<{
  cargando: boolean;
  children: React.ReactNode;
  tipo?: TipoCarga;
  mensaje?: string;
}> = ({ cargando, children, tipo = 'overlay', mensaje = 'Cargando...' }) => {
  const { mostrarCarga, ocultarCarga } = useCarga();
  const [idCarga, setIdCarga] = useState<string | null>(null);

  useEffect(() => {
    if (cargando && !idCarga) {
      const id = mostrarCarga({
        tipo,
        mensaje
      });
      setIdCarga(id);
    } else if (!cargando && idCarga) {
      ocultarCarga(idCarga);
      setIdCarga(null);
    }
  }, [cargando, idCarga, mostrarCarga, ocultarCarga, tipo, mensaje]);

  if (tipo === 'skeleton' && cargando) {
    return <CargaSkeleton config={{ id: 'skeleton', tipo: 'skeleton' }} />;
  }

  return <>{children}</>;
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default CargaProvider;